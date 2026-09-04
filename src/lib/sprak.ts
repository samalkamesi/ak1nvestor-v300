/**
 * SPRÅK-GRUNDEN (fas 1 i SPRAK-PLAN.md) — svenska | english | العربية
 *
 * Klientsidig språkväxling UTAN routing-omläggning: SSG:n (700+ sidor)
 * förblir svensk i server-renderingen; komponenter som använder t()
 * hydrerar och byter textnod vid valt språk. Svenska är alltid fallback.
 *
 * - Register: 'sv' | 'en' | 'ar' (ar ⇒ dir="rtl" på <html>)
 * - Lagring: localStorage "ak1a-sprak-v1"
 * - Detektering: navigator-språk, ENDAST om sv/en/ar — annars svenska
 * - t(nyckel): typsäker översättning ur ORDLISTA (src/lib/ordlista.ts)
 *   med {parameter}-interpolation och sv-fallback
 *
 * Se data/forskning/SPRAK-PLAN.md för fas 2 (nyckelsidor) och fas 3
 * (333 kurser — professionell pipeline, aldrig blind maskinöversättning).
 */

import { ORDLISTA, type OrdlistaNyckel, type SprakRad } from "@/lib/ordlista";

// ── Register ────────────────────────────────────────────────────────────────

export type SprakId = "sv" | "en" | "ar";

export const SPRAK_IDN: readonly SprakId[] = ["sv", "en", "ar"] as const;

export type SprakInfo = {
  /** Kort visa-kod i väljaren (versal). */
  kod: string;
  /** Inhemskt namn — visas på sitt eget språk i väljaren. */
  namn: string;
  /** Svensk beskrivning (internal UI / aria-hjälp). */
  beskrivning: string;
  /** Flagga-emoji — diskret viktoriansk markör i väljaren. */
  flagga: string;
  /** Textriktning. */
  dir: "ltr" | "rtl";
};

export const SPRAK: Record<SprakId, SprakInfo> = {
  sv: { kod: "SV", namn: "Svenska", beskrivning: "Svenska", flagga: "🇸🇪", dir: "ltr" },
  en: { kod: "EN", namn: "English", beskrivning: "Engelska", flagga: "🇬🇧", dir: "ltr" },
  ar: { kod: "AR", namn: "العربية", beskrivning: "Arabiska", flagga: "🇸🇦", dir: "rtl" },
};

/** localStorage-nyckel (versionsmarkerad — brytande format ⇒ ny nyckel). */
export const SPRAK_LAGRING = "ak1a-sprak-v1";

// ── Lagring + detektering ───────────────────────────────────────────────────

export function arGiltigtSprak(v: unknown): v is SprakId {
  return typeof v === "string" && (SPRAK_IDN as readonly string[]).includes(v);
}

/** Läs sparat språk — null om ogiltigt/saknat. SSR-säkert (returnerar null). */
export function lasSprak(): SprakId | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(SPRAK_LAGRING);
    return arGiltigtSprak(v) ? v : null;
  } catch {
    return null; // privat läge etc. — aldrig fatalt
  }
}

/** Spara språkval — tyst-fallande. */
export function sparaSprak(sprak: SprakId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SPRAK_LAGRING, sprak);
  } catch {
    /* ignoreras */
  }
}

/**
 * Navigator-detektering — ENDAST sv/en/ar accepteras ("ar-EG" ⇒ ar,
 * "en-US" ⇒ en). Alla andra språk ⇒ null ⇒ svenska. Ingen geografi, ingen
 * gissning: kunddirektivet är "exakt samma avancering", och standardspråket
 * på en svenskspråkig sajt är svenska tills eleven själv väljer.
 */
export function detekteraSprak(): SprakId | null {
  if (typeof navigator === "undefined") return null;
  try {
    const kandidater: string[] = [
      ...(navigator.languages ?? []),
      navigator.language,
    ].filter((s): s is string => typeof s === "string" && s.length > 0);
    for (const k of kandidater) {
      const bas = k.toLowerCase().split("-")[0];
      if (arGiltigtSprak(bas)) return bas;
    }
  } catch {
    /* ignoreras */
  }
  return null;
}

/** Full resolution: sparat val ⇒ navigator ⇒ svenska. */
export function hamtaSprak(): SprakId {
  return lasSprak() ?? detekteraSprak() ?? "sv";
}

export function dirForSprak(sprak: SprakId): "ltr" | "rtl" {
  return SPRAK[sprak].dir;
}

// ── t() — typsäker översättning ─────────────────────────────────────────────

export type SprakParametrar = Record<string, string | number>;

/** Interpolation: "Kapitel {num} av {total}" + {num: 3, total: 12}. */
function fyll(text: string, parametrar?: SprakParametrar): string {
  if (!parametrar) return text;
  return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (hel, namn: string) =>
    namn in parametrar ? String(parametrar[namn]) : hel,
  );
}

/**
 * Ren översättningsfunktion — kärnan bakom useSprak().t. Svensk rad är
 * alltid fallback (en nyckel utan översättning visas alldrig tom).
 */
export function oversatt(
  nyckel: OrdlistaNyckel,
  sprak: SprakId,
  parametrar?: SprakParametrar,
): string {
  const rad: SprakRad | undefined = ORDLISTA[nyckel];
  if (!rad) return String(nyckel); // typsystemet hindrar detta i TS-kod
  const text = rad[sprak] || rad.sv;
  return fyll(text, parametrar);
}

/**
 * Fabrik: skapa en t-funktion bunden till ett språk (t.ex. i tester eller
 * utanför React-trädet).
 */
export function skapaT(sprak: SprakId): (nyckel: OrdlistaNyckel, parametrar?: SprakParametrar) => string {
  return (nyckel, parametrar) => oversatt(nyckel, sprak, parametrar);
}

// ── Best-effort textöversättning (brödsmulor m.m.) ─────────────────────────

let svIndex: Map<string, SprakRad> | null = null;

function hamtaSvIndex(): Map<string, SprakRad> {
  if (!svIndex) {
    svIndex = new Map<string, SprakRad>();
    for (const rad of Object.values(ORDLISTA)) svIndex.set(rad.sv, rad);
  }
  return svIndex;
}

/**
 * Översätt en FRITEXT-sträng (t.ex. brödsmulenamn från page.tsx) genom
 * exakt matchning mot ordlistans svenska värden. Ingen träff ⇒ originalet
 * återges ordagrant (svenska). Detta låter navigationen på 700+ SSG-sidor
 * byta språk utan att röra sidfilerna — sidunika ord är fas 2.
 */
export function oversattText(text: string, sprak: SprakId): string {
  if (sprak === "sv") return text;
  const rad = hamtaSvIndex().get(text);
  return rad ? rad[sprak] || rad.sv : text;
}
