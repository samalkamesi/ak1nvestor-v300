/**
 * STUDIO-GENVÄGAR (register 2, post 22) — namngivna tangentbordsgenvägar
 * för /studio med per-webbläsar-överskrivningar i localStorage
 * ("ak1a-genvagar"). Ren register- + parsarlogik — INGEN React, INGEN fs:
 * samma logik kan driva UI:t (studio-chat.tsx Inställningar-drawern +
 * den globala tangentlyssnaren) och deterministiska tester.
 *
 * Kontrakt: en kombination är "Modifierare+Tangent", t.ex. "Ctrl+Shift+F".
 * "Ctrl" matchar BÅDE Ctrl (Windows/Linux) och Cmd (macOS) — studio-chat
 * har alltid behandlat dem lika ("Ctrl/Cmd"). Symboltangenter som redan
 * kräver Skift på tangentbordet ("/", "?") förlåter ett tryckt Skift,
 * så "?" funkar oavsett layout. Modifierare måste stämma exakt: "Enter"
 * matchar aldrig Ctrl+Enter, och bokstavsgenvägar kräver korrekt Skift.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** localStorage-nyckel för kundens överskrivningar. */
export const GENVAGSNYCKEL = "ak1a-genvagar";

/** Åtgärden en genvag utför — UI:t äger själva hanteringen per id. */
export type GenvagsId =
  | "sok-panel"
  | "kommandopalett"
  | "slash-meny"
  | "esc-stang"
  | "skicka"
  | "genvagshjalp";

/** En registrerad genväg. */
export interface StudioGenvag {
  id: GenvagsId;
  /** Vad genvägen gör — visas i Inställningar + ?-översikten. */
  beskrivning: string;
  /** Standardkombination — överskrivs av localStorage-posten med samma id. */
  standard: string;
}

/** Registret — började med de 6 genvägar chatten redan hade (post 22). */
export const STUDIO_GENVAGAR: readonly StudioGenvag[] = [
  {
    id: "sok-panel",
    beskrivning: "Sök i chatten + hopp mellan turer (öppna/stäng sökraden)",
    standard: "Ctrl+Shift+F",
  },
  {
    id: "kommandopalett",
    beskrivning: "Kommandopaletten — sök kommandon och modellbyten",
    standard: "Ctrl+K",
  },
  {
    id: "slash-meny",
    beskrivning: "Kommandomenyn i skrivfältet (börja prompten med /)",
    standard: "/",
  },
  {
    id: "esc-stang",
    beskrivning: "Stäng palett, sök, paneler och dialoger",
    standard: "Esc",
  },
  {
    id: "skicka",
    beskrivning: "Skicka prompten till agenten (Skift+ ger ny rad)",
    standard: "Enter",
  },
  {
    id: "genvagshjalp",
    beskrivning: "Denna genvägsöversikt",
    standard: "?",
  },
];

/** Minimal tangenthändelse — KeyboardEvent räcker, men typen gör logiken testbar. */
export interface TangentEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/** Normaliserar en tangent till jämförelseform: "Esc"/"Escape" → "escape", "F" → "f". */
function normaliseraTangent(key: string): string {
  const k = key.trim().toLowerCase();
  if (k === "esc" || k === "escape") return "escape";
  if (k === "del") return "delete";
  if (k === "↑" || k === "pil-upp") return "arrowup";
  if (k === "↓" || k === "pil-ner") return "arrowdown";
  if (k === "←") return "arrowleft";
  if (k === "→") return "arrowright";
  if (k === "space" || k === " ") return " ";
  return k;
}

/** Visningsform för en normaliserad tangent: "escape" → "Esc", "arrowup" → "↑". */
const VISA_TANGENT: Readonly<Record<string, string>> = {
  escape: "Esc",
  enter: "Enter",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  " ": "Space",
  tab: "Tab",
  backspace: "Backspace",
  delete: "Delete",
  home: "Home",
  end: "End",
  pageup: "Page Up",
  pagedown: "Page Down",
};

/** Läser kundens överskrivningar (SSR-/privatläges-säker; okända id rensas bort). */
export function lasGenvagar(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const rå = window.localStorage.getItem(GENVAGSNYCKEL);
    if (!rå) return {};
    const parsad: unknown = JSON.parse(rå);
    if (typeof parsad !== "object" || parsad === null || Array.isArray(parsad)) return {};
    const kanda = new Set(STUDIO_GENVAGAR.map((g) => g.id as string));
    const ut: Record<string, string> = {};
    for (const [nyckel, varde] of Object.entries(parsad as Record<string, unknown>)) {
      if (kanda.has(nyckel) && typeof varde === "string" && varde.trim()) ut[nyckel] = varde.trim();
    }
    return ut;
  } catch {
    return {};
  }
}

/** Sparar hela överskrivningskartan (kvot-/privatlägesfel tystas — chatten lever vidare). */
export function sparGenvagar(andringar: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GENVAGSNYCKEL, JSON.stringify(andringar));
  } catch {
    // privat läge/quote-fullt storage — överskrivningen gäller bara sessionen
  }
}

/** Standard ⋈ överskrivning → den kombination UI:t ska lyssna på just nu. */
export function raknaAktiva(andringar: Record<string, string>): Record<GenvagsId, string> {
  const ut = {} as Record<GenvagsId, string>;
  for (const g of STUDIO_GENVAGAR) ut[g.id] = andringar[g.id]?.trim() || g.standard;
  return ut;
}

/**
 * Matchar en tangenthändelse mot en kombination. Modifierare (Ctrl/Cmd,
 * Alt, Skift) måste stämma exakt — utom att symboltangenter ("/", "?")
 * förlåter ett tryckt Skift som layouten redan kräver.
 */
export function matcharTangent(e: TangentEvent, kombination: string): boolean {
  const komb = kombination.trim();
  if (!komb) return false;
  // "Ctrl++" (plus som huvudtangent) split:ar till tomma delar — sista tom = "+".
  const delar = komb.split("+");
  const huvud = normaliseraTangent(delar[delar.length - 1] || "+");
  if (!huvud) return false;
  const ctrl = delar.includes("Ctrl") || delar.includes("Cmd");
  const shift = delar.includes("Shift");
  const alt = delar.includes("Alt");
  if (ctrl !== (e.ctrlKey || e.metaKey)) return false;
  if (alt !== e.altKey) return false;
  const arSymbol = huvud.length === 1 && !/[a-z0-9]/.test(huvud);
  if (shift !== e.shiftKey && !(arSymbol && !shift && e.shiftKey)) return false;
  return normaliseraTangent(e.key) === huvud;
}

/**
 * Kan kombinationen producera text i ett skrivfält? Sann för enbart
 * bokstav/siffra/symbol UTAN Ctrl/Cmd/Alt ("q", "/") — falsk för system-
 * kombinationer ("Ctrl+K") och namngivna tangenter ("Esc", "F2", "↑").
 * UI:t använder den för att hålla remappade genvägar borta från
 * skrivfält: bara Esc-klassade tangenter och modifierarkombinationer
 * får avbryta pågående skrivande.
 */
export function arSkrivbarKombination(kombination: string): boolean {
  const delar = kombination.trim().split("+");
  if (delar.includes("Ctrl") || delar.includes("Cmd") || delar.includes("Alt")) return false;
  const huvud = normaliseraTangent(delar[delar.length - 1] || "+");
  return huvud.length === 1;
}

/**
 * Spelar in en tangenthändelse som ny kombination ("Ctrl+Shift+F").
 * Returnerar null för enbart-modifierartryck (vänta på nästa tangent) och
 * för skräptangenter; annars den visningsklara kombinationen.
 */
export function tangentTillKombination(e: TangentEvent): string | null {
  if (["Shift", "Control", "Alt", "Meta", "Dead", "Unidentified"].includes(e.key)) return null;
  const huvud = normaliseraTangent(e.key);
  if (!huvud || huvud.length > 20) return null;
  const arSymbol = huvud.length === 1 && !/[a-z0-9]/.test(huvud);
  const visa = VISA_TANGENT[huvud] ?? (huvud.length === 1 ? huvud.toUpperCase() : e.key);
  let kombination = visa;
  // Skift-prefix skippas för symboler som redan kräver Skift ("?" ≠ "Shift+?").
  if (e.shiftKey && !arSymbol) kombination = "Shift+" + kombination;
  if (e.altKey) kombination = "Alt+" + kombination;
  if (e.ctrlKey || e.metaKey) kombination = "Ctrl+" + kombination;
  return kombination;
}
