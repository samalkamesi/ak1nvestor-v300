/**
 * AKM2 DYNAMIKLAGER — lager 3 enligt data/forskning/AKM2-BESLUT.md §6 och
 * data/forskning/r3-dynamisering-2026-09-03.md ("AKM1-Dynamik v1").
 *
 * Uppdraget: översätta fundamentalvågorna (P2 fundamental-vagmotor, FVagAnalys)
 * och de tekniska våglägena till en Φ-justering PER VARIABEL som kärnan
 * (akm2/karna.ts — annan agents fil-domän) tillämpar på grundpoängen.
 *
 * ── Φ-TABELLEN (BESLUT §6 / r3 §5.2, exakt) ─────────────────────────────────
 *   impulsvåg bekräftad (n ≥ 2 snapshots)  ×1,20  "förstärkt — bekräftad sekvens"
 *   impulsvåg obekräftad (n = 1)           ×1,10  "obekräftad impuls"
 *   impulsvåg mogen (n ≥ 4)                ×1,20  + Daniel–Moskowitz-varning
 *   basbygge                               ×1,00  + "watch — katalysatorkänslig"
 *   korrigering, G(v) ≥ 3                  ×0,80  "dämpning"
 *   korrigering, G(v) ≤ 2                  ×0,90  + "value appearing" (Mr Market)
 *   osatt                                  ×1,00  på nivån, 0 i dynamikbidraget
 *
 * ── RIKTIGHETSINVERTERING (r3 §5.1 — den viktigaste designvarningen) ────────
 *   För V04, V05, V06, V10 och V28 vänds impulsvåg ⇄ korrigering FÖR tolkning:
 *   "gynnsam riktning" = SJUNKANDE multipel/skuld. Utan inversion dubbelt-
 *   bestraffar modellen Grahams köpläge (fallande P/B kallas "korrigering" och
 *   skär poängen samtidigt som värderingsnivån förbättras). V28 (earnings
 *   yield EV/EBIT) räknas enligt BESLUT §6 till multipelfamiljen och inverteras
 *   därmed likadant — fallande EV/EBIT-multipel = gynnsam våg.
 *
 * ── Φ → JUSTERING (dokumenterad formel) ─────────────────────────────────────
 *   justering(v) = clamp(Φ(v) − 1, −1, +1)
 *     ×0,80 → −0,20 · ×0,90 → −0,10 · ×1,00 → 0,00 · ×1,10 → +0,10 · ×1,20 → +0,20
 *   Kärnan tillämpar den som: poäng_dynamisk(v) = poäng_grund(v) × (1 + justering(v)).
 *   Intervalltypen är [−1,+1] för framtida kalibrering; dagens tabell ger [−0,20,+0,20].
 *
 * ── KOMPOSIT-BIDRAG (tak ±10 enligt BESLUT §6) ──────────────────────────────
 *   komposit = clamp( Σ_aktiva ζ_hem(v)·w_v/Σ(ζ_hem·w) · G(v) · justering(v) · 20 , ±10 )
 *   där ζ_hem = horisontvikten för variabelns HEMMAHORISONT (r3 §7) och w_v är
 *   variabelvikten (valfri indata — saknas den används uniform vikt). Osatta
 *   variabler bidrar med exakt 0 (r3 P3/F8: saknad data skadar aldrig poängen).
 *
 * ── KONFLUENS-GATE (teknisk 3/5 × fundamental 4/7, r3 §6) ───────────────────
 *   Statusmatris speglar konfluens-motorn (src/lib/konfluens-motor.ts):
 *     teknisk +1 × fundamental +1 → HÖG KONFLUENS        (bekräftad uppgång)
 *     teknisk +1 × fundamental −1 → KONFLIKT             ("vågor utan värdegrund")
 *     teknisk −1 × fundamental +1 → DIVERGENS            (värde möter vändande vågor)
 *     teknisk −1 × fundamental −1 → HÖG KONFLUENS NEGATIV (bekräftad nedgång)
 *     övriga (någon pelare 0/tun) → NEUTRAL ZON           (avvakta/watchlist)
 *   Teknisk riktning härleds ur tvagPerHorisont (impulsvåg +1, korrigering −1,
 *   basbygge/osatt 0) med 3-av-5-regeln på horisontnivån — själva teoriröst-
 *   ningen (3 av 5 AK1TS-teorier) sker uppströms i analys-motorn; detta är en
 *   dokumenterad adaptering. Fundamental riktning = 4 av 7 kategorier samma
 *   håll (röstning med tecken på INVERTERADE variabelklasser, okvot ±0,5),
 *   med B ≥ 4-belagda kategorier som tunghetsgrind.
 *
 * ── ÄRLIGHETSREGLER (r3 §10) ────────────────────────────────────────────────
 *   Saknas fvag/tvag → ALLT osatt; motorn gissar aldrig. Saknas G(v) för en
 *   korrigering kan Φ-grenen (0,80/0,90) inte väljas utan gissning → fas osatt.
 *   Determinism: inga slumpmoment, ingen klocka, alla konstanter fasta (P6).
 *   Markov-priorerna (r3 §8.1) är KALIBRIERADE PRIORS, inte uppskattade — de
 *   används endast för pedagogisk text om förväntad våglängd, aldrig i poängen.
 *
 * Fil-domän (BESLUT §Byggregler): denna fil äger dynamiklagret. Importerar
 * ENDAST typer (`import type`) från portfolj-forskning/typer.ts — inga
 * runtime-beroenden, inga importer från kärna/vikter/moduler.
 *
 * Pedagogiskt forskningsverktyg — ALDRIG investeringsråd.
 */

import type {
  AKM1Bedomning,
  FVagAnalys,
  Horisont,
  VagKlass,
} from "../portfolj-forskning/typer";

// ── Konstanter: horisonter, ζ, Φ, tak ───────────────────────────────────────

/** De fem horisonterna (samma ordning som portfolj-forskning/typer.ts). */
export const HORIZONTER: readonly Horisont[] = ["mikro", "kort", "medellang", "lang", "mega"] as const;

/**
 * Horisontvikter ζ — identiska med HORIZONTER_VIKT i portfolj-forskning/typer.ts
 * (mikro 0,05 · kort 0,20 · medellång 0,25 · lång 0,30 · mega 0,20). Speglade
 * som lokala konstanter eftersom filen enligt byggreglerna endast importerar
 * TYPER uppströms; avvikelse här är ett bugg och ska larmas i tester.
 */
export const ZETA: Readonly<Record<Horisont, number>> = {
  mikro: 0.05,
  kort: 0.2,
  medellang: 0.25,
  lang: 0.3,
  mega: 0.2,
};

/** Φ-tabellen (r3 §5.2, rad F1–F8) — fasta, dokumenterade designval. */
export const PHI = {
  IMPULS_BEKRAFTAD: 1.2,   // F1: n ≥ 2 — bekräftad sekvens (JT/TSMOM, PEAD)
  IMPULS_OBEKRAFTAD: 1.1,  // F2: n = 1 — Chan–Karceski–Lakonishok-varningen
  IMPULS_MOGEN: 1.2,       // F3: n ≥ 4 — ingen YTTERLIGARE förstärkning, bara varning
  BASBYGGE: 1.0,           // F4: watch — katalysatorkänsligt vägskäl
  KORR_HOG_G: 0.8,         // F5: korrigering i starkt bedömd variabel (G ≥ 3)
  KORR_LAG_G: 0.9,         // F6: korrigering i svagt bedömd (G ≤ 2) — Mr Market
  OSATT: 1.0,              // F8: nivån orörd, dynamikbidraget 0
} as const;

/** Dynamiktak på kompositpoängen (BESLUT §6: ±10 kompositpoäng). */
export const DYNAMIKTAK = 10;

/** Klass → tal för kategori-röstning (spegling av fundamental-vagmotorn). */
const KLASS_TAL: Record<VagKlass, number> = {
  impulsvag: 1,
  korrigering: -1,
  basbygge: 0,
  osatt: 0,
};

/** Klassnamn med åäö för löpande text (JSON-nycklarna förblir å-fria). */
export const KLASS_TEXT: Record<VagKlass, string> = {
  impulsvag: "impulsvåg",
  korrigering: "korrigering",
  basbygge: "basbygge",
  osatt: "osatt",
};

// ── Riktighetsinvertering (r3 §5.1 + BESLUT §6) ─────────────────────────────

/**
 * VARIABLER MED INVERTERAD RIKTNING — "gynnsam riktning" = SJUNKANDE serie:
 *   V04 P/S · V05 P/B · V06 EV/EBITDA (r3 §5.1) · V10 skuldsättningsgrad (r3 §5.1)
 *   · V28 earnings yield EV/EBIT (BESLUT §6 — multipelfamiljen).
 * För dessa vänds seriens tecken FÖR vågklassning: impulsvåg ⇄ korrigering.
 * (V20 läser vågfundament-motorn redan inverterat — därav frånvaron här.)
 */
export const INVERTERADE_V: ReadonlySet<string> = new Set(["V04", "V05", "V06", "V10", "V28"]);

/** Vänder vågklassens tecken: impulsvåg ⇄ korrigering (basbygge/osatt oförändrade). */
export function inverteraKlass(klass: VagKlass): VagKlass {
  if (klass === "impulsvag") return "korrigering";
  if (klass === "korrigering") return "impulsvag";
  return klass;
}

// ── Variabelregister: namn, kategori, hemmahorisont (r3 §7) ─────────────────

/** Variabelnamn (pedagogisk text; V01–V20 enligt PROTOKOLL/motorn, V21–V28 enligt BESLUT §1). */
export const VARIABEL_NAMN: Readonly<Record<string, string>> = {
  V01: "Försäljningstillväxt",
  V02: "ARR-tillväxt",
  V03: "Intäktsdiversifiering",
  V04: "P/S",
  V05: "P/B",
  V06: "EV/EBITDA",
  V07: "Bruttomarginal",
  V08: "EBITDA-marginal",
  V09: "ROE",
  V10: "Skuldsättningsgrad",
  V11: "Likviditet",
  V12: "Intäktsstabilitet",
  V13: "Patent & IP",
  V14: "Varumärke & kundlojalitet",
  V15: "Nätverkseffekter",
  V16: "Produktlanseringar",
  V17: "Avtal & partnerskap",
  V18: "Regulatoriska katalysatorer",
  V19: "Kassatäckning — nyemissionsrisk",
  V20: "Återköp av egna aktier",
  V21: "ROIC",
  V22: "Fri kassaflödesavkastning",
  V23: "Redovisningskvalitet",
  V24: "Skuldbetjäningsförmåga",
  V25: "Utspädning",
  V26: "Kapitalcykel",
  V27: "Utdelningskontinuitet",
  V28: "Earnings yield (EV/EBIT)",
};

/**
 * Röstningskategori per variabel — speglar fundamental-vagmotorns sju
 * kategorier exakt för V01–V20 (tillvaxt/vardering/lonsamhet/stabilitet/
 * moat/katalysator/risk). V21–V28 mappas enligt BESLUT §1 (V27 etiketteras
 * "Kapitalstruktur" i BESLUT men röstar här under stabilitet — kontinuitet är
 * en stabilitetsegenskap; dokumenterat designval).
 */
export const VARIABEL_KATEGORI: Readonly<Record<string, string>> = {
  V01: "tillvaxt", V02: "tillvaxt", V03: "tillvaxt",
  V04: "vardering", V05: "vardering", V06: "vardering",
  V07: "lonsamhet", V08: "lonsamhet", V09: "lonsamhet",
  V10: "stabilitet", V11: "stabilitet", V12: "stabilitet",
  V13: "moat", V14: "moat", V15: "moat",
  V16: "katalysator", V17: "katalysator", V18: "katalysator",
  V19: "risk", V20: "risk",
  V21: "lonsamhet", V22: "vardering", V23: "risk", V24: "stabilitet",
  V25: "risk", V26: "lonsamhet", V27: "stabilitet", V28: "vardering",
};

/** Svenska etiketter för röstningskategorierna (JSON-nycklarna är å-fria). */
export const KATEGORI_TEXT: Readonly<Record<string, string>> = {
  tillvaxt: "Tillväxt",
  vardering: "Värdering",
  lonsamhet: "Lönsamhet",
  stabilitet: "Stabilitet",
  moat: "Moat",
  katalysator: "Katalysator",
  risk: "Risk",
};

/** Hemmahorisont-tabellen (r3 §7) — variabelns dynamik är informationsbärande där. */
export type Hemmahorisont = { hem: Horisont; sekundar: Horisont | null };

/**
 * V01–V20 exakt enligt r3 §7 (intervall som "kort–medellång" tolkas till det
 * första ledet — det kortaste, där datan faktiskt bär klassen). V21–V28 är
 * dokumenterade designval i r3:s anda: ROIC/FCF/accruals/räntetäckning följer
 * årsrytmen (medellång), kapitalcykel och utdelningskontinuitet kräver multi-
 * åriga serier (lång), EV/EBIT-multipeln läses som V06 (medellång, brusigt).
 */
export const HEMHORISONT: Readonly<Record<string, Hemmahorisont>> = {
  V01: { hem: "kort", sekundar: "medellang" },
  V02: { hem: "kort", sekundar: "medellang" },
  V03: { hem: "medellang", sekundar: "lang" },
  V04: { hem: "kort", sekundar: "medellang" },
  V05: { hem: "kort", sekundar: "medellang" },
  V06: { hem: "medellang", sekundar: "kort" },
  V07: { hem: "medellang", sekundar: "kort" },
  V08: { hem: "medellang", sekundar: "kort" },
  V09: { hem: "medellang", sekundar: "lang" },
  V10: { hem: "medellang", sekundar: "lang" },
  V11: { hem: "kort", sekundar: "medellang" },
  V12: { hem: "lang", sekundar: "medellang" },
  V13: { hem: "mega", sekundar: "lang" },
  V14: { hem: "mega", sekundar: "lang" },
  V15: { hem: "mega", sekundar: "lang" },
  V16: { hem: "mikro", sekundar: null },
  V17: { hem: "mikro", sekundar: "medellang" },
  V18: { hem: "mikro", sekundar: "medellang" },
  V19: { hem: "kort", sekundar: "mikro" },
  V20: { hem: "medellang", sekundar: "kort" },
  V21: { hem: "medellang", sekundar: "lang" },
  V22: { hem: "medellang", sekundar: "kort" },
  V23: { hem: "medellang", sekundar: "lang" },
  V24: { hem: "medellang", sekundar: "lang" },
  V25: { hem: "medellang", sekundar: "lang" },
  V26: { hem: "lang", sekundar: "medellang" },
  V27: { hem: "lang", sekundar: "mega" },
  V28: { hem: "medellang", sekundar: "kort" },
};

/** Kanonisk variabelordning V01–V28 (AKM2:s fil-domän omfattar de 28). */
export const VARIABEL_IDN: readonly string[] = Object.keys(VARIABEL_NAMN);

// ── Markov-priorer (r3 §8.1 — kalibrerade, ej uppskattade; endast text) ──────

/** Övergångsmatriser per steg; rad = nuvarande klass, kolumn = nästa. */
export const MARKOV_PRIOR: Readonly<{
  snabb: Readonly<Record<"impulsvag" | "basbygge" | "korrigering", Readonly<Record<"impulsvag" | "basbygge" | "korrigering", number>>>>;
  trog: Readonly<Record<"impulsvag" | "basbygge" | "korrigering", Readonly<Record<"impulsvag" | "basbygge" | "korrigering", number>>>>;
}> = {
  // mikro & kort (qoq/yoy-momentum, brusigt)
  snabb: {
    impulsvag: { impulsvag: 0.5, basbygge: 0.35, korrigering: 0.13 },
    basbygge: { impulsvag: 0.33, basbygge: 0.34, korrigering: 0.31 },
    korrigering: { impulsvag: 0.16, basbygge: 0.36, korrigering: 0.46 },
  },
  // medellång, lång & mega (årstaktsklasser)
  trog: {
    impulsvag: { impulsvag: 0.65, basbygge: 0.27, korrigering: 0.06 },
    basbygge: { impulsvag: 0.28, basbygge: 0.44, korrigering: 0.26 },
    korrigering: { impulsvag: 0.14, basbygge: 0.34, korrigering: 0.5 },
  },
};

/** Förväntad kvarvarande längd i antal snapshots: 1/(1−p_kvar). */
function forvantadLangd(pKvar: number): number {
  return Math.round((1 / (1 - pKvar)) * 10) / 10;
}

// ── Typer ────────────────────────────────────────────────────────────────────

/** Ingång — allt valfri utom att TOM input ger TOMT svar (ärlighetsregeln). */
export type DynamikInput = {
  /** P2 fundamental våganalys (fundamental-vagmotor.ts) — vågklass per variabel. */
  fvag?: FVagAnalys;
  /** Tekniskt vågläge per horisont (redan sammanvägt av analys-motorn). */
  tvagPerHorisont?: Record<Horisont, VagKlass>;
  /** AKM1-bedömning — grundpoängen G(v) 0–5 behövs för F5/F6-grenen. */
  akm1?: AKM1Bedomning;
  /**
   * n(v): antal på varandra följande snapshots i samma klass (r3 §8.2 —
   * kräver snapshot-historik som lagras utanför detta lager). Saknas värde
   * används konservativt n = 1 ("vid driftstart utan historik", r3 §9 steg 2).
   */
  sekvensPerVariabel?: Record<string, number>;
  /**
   * Explicit vågklass per variabel — åsidosätter fvag (t.ex. framtida
   * proxyserier för V21–V28 som fundamental-vagmotorn inte täcker idag).
   */
  vagklassPerVariabel?: Record<string, VagKlass>;
  /** Variabelvikter w_v (från vikter-modulen). Saknas → uniform över aktiva. */
  vikterPerVariabel?: Record<string, number>;
};

/** Vågfas — Φ-tabellens rader F1–F8 (efter riktighetsinvertering). */
export type Vagfas =
  | "impulsvag_bekraftad"
  | "impulsvag_obekraftad"
  | "impulsvag_mogen"
  | "basbygge"
  | "korrigering_hog_g"
  | "korrigering_lag_g"
  | "osatt";

/** Flaggor ur sluten mängd (r3 P6 — aldrig nya på fläcken). */
export type DynamikFlagga =
  | "forstarkt-bekraftad-sekvens"
  | "obekraftad-impuls"
  | "mogen-impuls"
  | "watch-katalysatorkanslig"
  | "dampning"
  | "value-appearing"
  | "vardeforbattring"
  | "niva-rorelse-konflikt"
  | "osatt-intern-varning";

/** En variabels dynamikrad — allt UI:t (och kärnan) behöver per variabel. */
export type VariabelDynamik = {
  variabel: string;
  namn: string;
  /** G(v) 0–5 ur akm1.poang; null = saknas (→ fas osatt, aldrig gissad). */
  grundpoang: number | null;
  /** true om v ∈ INVERTERADE_V (multipel/skuld — fallande serie är gynnsam). */
  riktningInverterad: boolean;
  /** Vågklass FÖR inversion (rå läsning av serien). */
  klassRa: VagKlass;
  /** Vågklass EFTER inversion — impulsvåg = gynnsam riktning per definition. */
  klassEfterInversion: VagKlass;
  fas: Vagfas;
  /** n = antal på varandra följande snapshots i aktuell klass. */
  sekvenser: number;
  /** Φ enligt tabellen (1,00 för osatt — nivån orörd). */
  phi: number;
  /** Φ − 1, clampat till [−1,+1] (tabellen ger [−0,20,+0,20]). */
  justering: number;
  /** Bidrag till kompositen i poäng (FÖRE taket ±10); null för osatta. */
  dynamikbidrag: number | null;
  hemHorisont: Horisont;
  hemHorisontSekundar: Horisont | null;
  /** ζ för hemmahorisonten — variabelns dynamik vägs med denna. */
  zetaHem: number;
  flaggor: DynamikFlagga[];
  /** Pedagogisk motivering — beskriver, dömer aldrig. */
  anteckning: string;
};

/** Konfluens-status — speglar konfluens-motorn (r3 §6.2:s 3×3-matris). */
export type KonfluensStatus =
  | "HOG KONFLUENS"
  | "HOG KONFLUENS NEGATIV"
  | "KONFLIKT"
  | "DIVERGENS"
  | "NEUTRAL ZON"
  | "OSATT";

/** En kategoris röst i den fundamentala pelaren. */
export type KategoriRost = {
  kategori: string; // å-fri nyckel (tillvaxt, vardering, ...)
  svenskLabel: string;
  riktning: -1 | 0 | 1;
  /** Antal variabler med klass ≠ osatt (röstande + basbygge-abstain). */
  belagda: number;
  plus: number;
  minus: number;
  /** (plus − minus) / belagda — speglar motorns okvot med gräns ±0,5. */
  okvot: number;
};

/** Två-nivå-gatens bild. */
export type KonfluensBild = {
  /** null = tvag saknas helt (teknisk pelare osatt). */
  tekniskRiktning: -1 | 0 | 1 | null;
  /** null = fvag saknas eller B < 4 belagda kategorier ("underlag för tunt"). */
  fundamentalRiktning: -1 | 0 | 1 | null;
  /** B — antal kategorier med belagd riktning (≠ 0). */
  antalKategorierBelagda: number;
  antalPlus: number;
  antalMinus: number;
  kategorier: KategoriRost[];
  status: KonfluensStatus;
  /** Status per horisont (teknisk riktning per horisont × gemensam fundamental). */
  perHorisont: Record<Horisont, KonfluensStatus>;
  text: string;
};

/** Svaret från raknaDynamikLager. */
export type DynamikLagerSvar = {
  /** "osatt" när ingen ingångsdel bar data — aldrig en gissning i kläderna "ok". */
  status: "ok" | "osatt";
  perVariabel: Record<string, VariabelDynamik>;
  konfluens: KonfluensBild;
  /** Komposit-dynamikbidrag, clampat till ±10 (BESLUT §6). */
  kompositDynamikbidrag: number;
  /** Bidraget FÖRE taket — synliggör när taket bitit (transparens, P6). */
  kompositDynamikbidragForTak: number;
  takAktivt: boolean;
  /** Variabler med flaggan "value appearing" (Mr Market — r3 F6). */
  valueAppearing: string[];
  varningar: string[];
  /** Pedagogisk sammanfattning på svenska — beskriver, dömer aldrig. */
  text: string;
  grundatPa: { fvag: boolean; tvag: boolean; akm1: boolean };
};

// ── Φ → justering ────────────────────────────────────────────────────────────

/**
 * Konverterar Φ till justering: justering = clamp(Φ − 1, −1, +1).
 * Kärnan tillämpar: poäng_dynamisk = poäng_grund × (1 + justering).
 */
export function phiTillJustering(phi: number): number {
  if (!Number.isFinite(phi)) return 0;
  return Math.min(1, Math.max(-1, phi - 1));
}

// ── Fasbestämning (Φ-tabellen) ───────────────────────────────────────────────

/** Bestämmer Φ-tabellrad ur (klass EFTER inversion, G, n). */
export function bestamVagfas(klassEfter: VagKlass, g: number | null, n: number): {
  fas: Vagfas;
  phi: number;
  flaggor: DynamikFlagga[];
  motiv: string;
} {
  const sekvens = Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  if (klassEfter === "osatt") {
    return {
      fas: "osatt",
      phi: PHI.OSATT,
      flaggor: ["osatt-intern-varning"],
      motiv: "osatt — nivån lämnas orörd (×1,00), dynamikbidraget 0 (P3: saknad data skadar aldrig poängen)",
    };
  }
  if (klassEfter === "basbygge") {
    return {
      fas: "basbygge",
      phi: PHI.BASBYGGE,
      flaggor: ["watch-katalysatorkanslig"],
      motiv: "basbygge — vägskäl, inte hem: Φ ×1,00 + watch (katalysatorkänsligt)",
    };
  }
  if (klassEfter === "korrigering") {
    if (g === null) {
      return {
        fas: "osatt",
        phi: PHI.OSATT,
        flaggor: ["osatt-intern-varning"],
        motiv: "korrigering utan grundpoäng G — grenen 0,80/0,90 kan inte väljas utan gissning, alltså osatt",
      };
    }
    if (g >= 3) {
      return {
        fas: "korrigering_hog_g",
        phi: PHI.KORR_HOG_G,
        flaggor: ["dampning"],
        motiv: "korrigering i starkt bedömd variabel (G ≥ 3) — dämpning ×0,80",
      };
    }
    return {
      fas: "korrigering_lag_g",
      phi: PHI.KORR_LAG_G,
      flaggor: ["value-appearing"],
      motiv: "korrigering i svagt bedömd variabel (G ≤ 2) — ×0,90 + value appearing (Fama–French 2000: reversion snabbare under medel; Mr Market)",
    };
  }
  // klassEfter === "impulsvag" — sekvens-eskalering (r3 §8.2, tvåstegs och capad)
  if (sekvens >= 4) {
    return {
      fas: "impulsvag_mogen",
      phi: PHI.IMPULS_MOGEN,
      flaggor: ["mogen-impuls"],
      motiv: "mogen impuls (n ≥ 4) — ×1,20 men ingen ytterligare förstärkning; momentum kraschar i mogna lägen (Daniel–Moskowitz)",
    };
  }
  if (sekvens >= 2) {
    return {
      fas: "impulsvag_bekraftad",
      phi: PHI.IMPULS_BEKRAFTAD,
      flaggor: ["forstarkt-bekraftad-sekvens"],
      motiv: "bekräftad sekvens (n ≥ 2) — förstärkning ×1,20 (Jegadeesh–Titman/TSMOM; PEAD)",
    };
  }
  return {
    fas: "impulsvag_obekraftad",
    phi: PHI.IMPULS_OBEKRAFTAD,
    flaggor: ["obekraftad-impuls"],
    motiv: "obekräftad impuls (n = 1) — vilar på ×1,10 tills sekvensen bekräftas (Chan–Karceski–Lakonishok)",
  };
}

// ── Konfluens-gaten ──────────────────────────────────────────────────────────

/** Teknisk riktning ur en teknisk vågklass (impulsvåg +1 · korrigering −1 · övrigt 0). */
export function tekniskRiktningFranKlass(klass: VagKlass | undefined): -1 | 0 | 1 | null {
  if (klass === undefined) return null;
  if (klass === "impulsvag") return 1;
  if (klass === "korrigering") return -1;
  return 0;
}

/**
 * Teknisk riktning totalt — 3-av-5-regeln på HORISONTNIVÅN (dokumenterad
 * adaptering: teoriröstningen 3 av 5 AK1TS-teorier sker uppströms i analys-
 * motorn; här råder 5 horisonter). null om tvag saknas helt.
 */
export function tekniskRiktningTotalt(
  tvagPerHorisont: Record<Horisont, VagKlass> | undefined
): -1 | 0 | 1 | null {
  if (!tvagPerHorisont) return null;
  let plus = 0;
  let minus = 0;
  let belagda = 0;
  for (const hz of HORIZONTER) {
    const r = tekniskRiktningFranKlass(tvagPerHorisont[hz]);
    if (r === null) continue;
    belagda += 1;
    if (r === 1) plus += 1;
    else if (r === -1) minus += 1;
  }
  if (belagda === 0) return null;
  if (plus >= 3 && plus > minus) return 1;
  if (minus >= 3 && minus > plus) return -1;
  return 0;
}

/** Statusmatrisen (r3 §6.2) — teknisk × fundamental riktning. */
export function konfluensStatus(
  teknisk: -1 | 0 | 1 | null,
  fundamental: -1 | 0 | 1 | null
): KonfluensStatus {
  if (teknisk === null && fundamental === null) return "OSATT";
  if (teknisk === null) return "NEUTRAL ZON"; // fundament utan vågläge — watchlist ("Värde men vågor sover")
  if (fundamental === null) return "NEUTRAL ZON"; // tekniskt tryck utan fundament — avvakta
  if (teknisk === 1 && fundamental === 1) return "HOG KONFLUENS";
  if (teknisk === 1 && fundamental === -1) return "KONFLIKT";
  if (teknisk === -1 && fundamental === 1) return "DIVERGENS";
  if (teknisk === -1 && fundamental === -1) return "HOG KONFLUENS NEGATIV";
  return "NEUTRAL ZON";
}

/** Fundamentala pelaren: röstning med tecken per kategori (4 av 7, B ≥ 4). */
export function rostaFundamentalt(
  klassEfterInversion: Record<string, VagKlass>
): {
  riktning: -1 | 0 | 1 | null;
  kategorier: KategoriRost[];
  antalBelagda: number;
  antalPlus: number;
  antalMinus: number;
} {
  const kategorier: KategoriRost[] = [];
  for (const [kategori, svenskLabel] of Object.entries(KATEGORI_TEXT)) {
    const medlemmar = VARIABEL_IDN.filter((v) => VARIABEL_KATEGORI[v] === kategori);
    let belagda = 0;
    let plus = 0;
    let minus = 0;
    for (const v of medlemmar) {
      const k = klassEfterInversion[v];
      if (k === undefined || k === "osatt") continue;
      belagda += 1;
      const tal = KLASS_TAL[k];
      if (tal > 0) plus += 1;
      else if (tal < 0) minus += 1;
    }
    const okvot = belagda > 0 ? (plus - minus) / belagda : 0;
    const riktning: -1 | 0 | 1 = belagda === 0 ? 0 : okvot >= 0.5 ? 1 : okvot <= -0.5 ? -1 : 0;
    kategorier.push({ kategori, svenskLabel, riktning, belagda, plus, minus, okvot });
  }
  const antalPlus = kategorier.filter((k) => k.riktning === 1).length;
  const antalMinus = kategorier.filter((k) => k.riktning === -1).length;
  const antalBelagda = antalPlus + antalMinus; // B = kategorier med riktning ≠ 0
  let riktning: -1 | 0 | 1 | null = 0;
  if (antalBelagda < 4) {
    riktning = null; // "underlag för tunt" — gaten kan aldrig ge hög konfluens
  } else if (antalPlus >= 4 && antalPlus > antalMinus) {
    riktning = 1;
  } else if (antalMinus >= 4 && antalMinus > antalPlus) {
    riktning = -1;
  }
  return { riktning, kategorier, antalBelagda, antalPlus, antalMinus };
}

// ── Hjälp: giltig vågklass? (indata kan aldrig lura modulen) ─────────────────

function giltigKlass(k: unknown): k is VagKlass {
  return k === "impulsvag" || k === "korrigering" || k === "basbygge" || k === "osatt";
}

function lasPoang(v: string, akm1: AKM1Bedomning | undefined): number | null {
  const p = akm1?.poang?.[v];
  if (typeof p === "number" && Number.isFinite(p)) return Math.min(5, Math.max(0, p));
  return null;
}

// ── Pedagogisk text ──────────────────────────────────────────────────────────

function svenskaTal(x: number, decimaler = 2): string {
  return String(Math.round(x * 10 ** decimaler) / 10 ** decimaler).replace(".", ",");
}

function fasText(fas: Vagfas): string {
  const M: Record<Vagfas, string> = {
    impulsvag_bekraftad: "bekräftad impulsvåg",
    impulsvag_obekraftad: "obekräftad impulsvåg",
    impulsvag_mogen: "mogen impulsvåg",
    basbygge: "basbygge",
    korrigering_hog_g: "korrigering (G ≥ 3)",
    korrigering_lag_g: "korrigering (G ≤ 2)",
    osatt: "osatt",
  };
  return M[fas];
}

// ── Huvudfunktion ────────────────────────────────────────────────────────────

/**
 * Räknar AKM2:s dynamiklager (lager 3): Φ-justering per variabel, komposit-
 * dynamikbidrag med tak ±10, två-nivå-konfluens och pedagogisk text.
 *
 * TOM input → TOMT svar med status "osatt" (motorn gissar aldrig). Saknas
 * fvag/vagklass blir alla variabler osatta (Φ 1,00, bidrag 0); saknas tvag
 * blir den tekniska pelaren null och konfluensen kan som mest bli NEUTRAL ZON.
 * Deterministisk: samma indata → samma utdata (P6).
 */
export function raknaDynamikLager(input: DynamikInput): DynamikLagerSvar {
  const fvagFinns = Boolean(input?.fvag);
  const tvagFinns = Boolean(input?.tvagPerHorisont);
  const akm1Finns = Boolean(input?.akm1);
  const klassKallaFinns = Boolean(input?.vagklassPerVariabel);

  const tommaHorisonter = (): Record<Horisont, KonfluensStatus> => {
    const ut = {} as Record<Horisont, KonfluensStatus>;
    for (const hz of HORIZONTER) ut[hz] = "OSATT";
    return ut;
  };

  // Tom input — tomt svar, ärlighet framför gissning (krav 6).
  if (!fvagFinns && !tvagFinns && !akm1Finns && !klassKallaFinns) {
    return {
      status: "osatt",
      perVariabel: {},
      konfluens: {
        tekniskRiktning: null,
        fundamentalRiktning: null,
        antalKategorierBelagda: 0,
        antalPlus: 0,
        antalMinus: 0,
        kategorier: [],
        status: "OSATT",
        perHorisont: tommaHorisonter(),
        text: "Dynamiklagret är osatt: varken fundamental vågdata, tekniskt vågläge eller AKM1-bedömning lämnades in. Motorn gissar aldrig — med FVagAnalys och tekniskt vågläge per horisont växer dynamikbilden fram. Pedagogiskt verktyg — inte investeringsråd.",
      },
      kompositDynamikbidrag: 0,
      kompositDynamikbidragForTak: 0,
      takAktivt: false,
      valueAppearing: [],
      varningar: ["Tom input — hela dynamiklagret osatt"],
      text: "Dynamiklagret är osatt (ingen indata). Motorn gissar aldrig. Pedagogiskt verktyg — inte investeringsråd.",
      grundatPa: { fvag: false, tvag: false, akm1: false },
    };
  }

  const varningar: string[] = [];
  if (!fvagFinns && !klassKallaFinns) varningar.push("fvag saknas — alla variabler osatta (Φ 1,00, dynamikbidrag 0)");
  if (!tvagFinns) varningar.push("tvagPerHorisont saknas — teknisk pelare osatt, konfluens kan som mest bli NEUTRAL ZON");
  if (!akm1Finns) varningar.push("akm1 saknas — grundpoäng G(v) saknas, korrigeringens 0,80/0,90-gren kan inte väljas");

  // ── Steg 1–3: per variabel — riktighetsinvertering, fas, Φ ────────────────
  const perVariabel: Record<string, VariabelDynamik> = {};
  const klassEfterInversion: Record<string, VagKlass> = {};
  const inverteradeAktiva: string[] = [];

  for (const v of VARIABEL_IDN) {
    const raKlassKall = input.vagklassPerVariabel?.[v];
    const raKlassFvag = input.fvag?.perVariabel?.[v]?.klass;
    const klassRa: VagKlass =
      giltigKlass(raKlassKall) ? raKlassKall : giltigKlass(raKlassFvag) ? raKlassFvag : "osatt";

    const inverterad = INVERTERADE_V.has(v);
    const klassEfter = inverterad ? inverteraKlass(klassRa) : klassRa;
    klassEfterInversion[v] = klassEfter;

    const g = lasPoang(v, input.akm1);
    const nRa = input.sekvensPerVariabel?.[v];
    const n = typeof nRa === "number" && Number.isFinite(nRa) && nRa >= 1 ? Math.floor(nRa) : 1;

    const { fas, phi, flaggor, motiv } = bestamVagfas(klassEfter, g, n);
    const justering = fas === "osatt" ? 0 : phiTillJustering(phi);

    // F7-spegel: fallande multipel/skuld = värdeförbättring (synliggör inversionen)
    if (inverterad && klassEfter === "impulsvag" && fas !== "osatt") {
      flaggor.push("vardeforbattring");
      inverteradeAktiva.push(v);
    }
    // Konflikt-avstängning (r3 §5.3.5): nivå och rörelse mitt emot varandra visas ALDRI tyst
    if (g !== null && fas.startsWith("korrigering") && g >= 4) flaggor.push("niva-rorelse-konflikt");
    if (g !== null && klassEfter === "impulsvag" && g <= 1) flaggor.push("niva-rorelse-konflikt");

    const hem = HEMHORISONT[v];
    const markovText =
      klassEfter === "impulsvag" || klassEfter === "korrigering"
        ? ` Förväntad kvarvarande längd enligt kalibrerad Markov-prior (kalibrerad, ej uppskattad): ~${
            svenskaTal(
              forvantadLangd(
                hem.hem === "mikro" || hem.hem === "kort"
                  ? MARKOV_PRIOR.snabb[klassEfter][klassEfter]
                  : MARKOV_PRIOR.trog[klassEfter][klassEfter]
              ),
              1
            )
          } snapshots.`
        : "";

    const invText = inverterad
      ? `rå klass ${KLASS_TEXT[klassRa]} → RIKTIGHETSINVERTERAD (fallande serie är gynnsam) → ${KLASS_TEXT[klassEfter]}`
      : `klass ${KLASS_TEXT[klassRa]}`;
    const gText = g !== null ? `G ${svenskaTal(g, 0)}/5` : "G saknas";

    perVariabel[v] = {
      variabel: v,
      namn: VARIABEL_NAMN[v],
      grundpoang: g,
      riktningInverterad: inverterad,
      klassRa,
      klassEfterInversion: klassEfter,
      fas,
      sekvenser: n,
      phi,
      justering,
      dynamikbidrag: null, // sätts i kompositsteget
      hemHorisont: hem.hem,
      hemHorisontSekundar: hem.sekundar,
      zetaHem: ZETA[hem.hem],
      flaggor,
      anteckning:
        `${VARIABEL_NAMN[v]}: ${gText}; ${invText}. Fas: ${fasText(fas)} → Φ ×${svenskaTal(phi)} ` +
        `(justering ${justering >= 0 ? "+" : ""}${svenskaTal(justering)}); sekvens n=${n}; hemmahorisont ${hem.hem} (ζ ${svenskaTal(ZETA[hem.hem])}${hem.sekundar ? `, sekundär ${hem.sekundar}` : ""}).${markovText} ${motiv}.`,
    };
  }

  // ── Steg 4: komposit-dynamikbidrag med hemmahorisont-ζ (tak ±10) ─────────
  // Aktiva = belagd vågklass OCH belagd grundpoäng. Osatta (och basbygge med
  // Φ 1,00 → justering 0) bidrar med 0; ζ_hem·w renormaliseras över aktiva.
  const aktiva = VARIABEL_IDN.filter(
    (v) => perVariabel[v].fas !== "osatt" && perVariabel[v].grundpoang !== null
  );
  const zetaVikt = (v: string): number =>
    ZETA[HEMHORISONT[v].hem] * (input.vikterPerVariabel?.[v] ?? 1);
  const wSumma = aktiva.reduce((s, v) => s + zetaVikt(v), 0);

  let kompositRå = 0;
  if (wSumma > 0) {
    for (const v of aktiva) {
      const vd = perVariabel[v];
      const bidrag = (zetaVikt(v) / wSumma) * (vd.grundpoang as number) * vd.justering * 20;
      vd.dynamikbidrag = Math.round(bidrag * 10 ** 6) / 10 ** 6;
      kompositRå += bidrag;
    }
  }
  const kompositRåAvrundad = Math.round(kompositRå * 100) / 100;
  const komposit = Math.min(DYNAMIKTAK, Math.max(-DYNAMIKTAK, kompositRåAvrundad));
  const takAktivt = Math.abs(kompositRåAvrundad) > DYNAMIKTAK;
  if (takAktivt) {
    varningar.push(
      `Dynamiktaket ±10 aktivt: råbidraget ${svenskaTal(kompositRåAvrundad)} klamrat till ${svenskaTal(komposit)}`
    );
  }

  // ── Steg 5–6: konfluens-gaten (teknisk 3/5 × fundamental 4/7) ────────────
  const fundamental = rostaFundamentalt(klassEfterInversion);
  if (fvagFinns || klassKallaFinns) {
    if (fundamental.riktning === null && fundamental.antalBelagda > 0) {
      varningar.push(
        `Fundamental pelare tung: endast ${fundamental.antalBelagda} av 7 kategorier belagda (krav B ≥ 4)`
      );
    }
  }
  const tekniskTotal = tekniskRiktningTotalt(input.tvagPerHorisont);
  const statusTotal = konfluensStatus(tekniskTotal, fundamental.riktning);

  const perHorisontStatus = {} as Record<Horisont, KonfluensStatus>;
  for (const hz of HORIZONTER) {
    const r = tekniskRiktningFranKlass(input.tvagPerHorisont?.[hz]);
    perHorisontStatus[hz] = konfluensStatus(r, fundamental.riktning);
  }

  const STATUS_TEXT: Record<KonfluensStatus, string> = {
    "HOG KONFLUENS": "båda pelarna pekar uppåt — bekräftad fundamental uppgång med tekniskt vågläge i samma riktning",
    "HOG KONFLUENS NEGATIV": "båda pelarna pekar nedåt — bekräftad nedgång; bilden bärs av varning, inte av handlingsuttryck",
    KONFLIKT: "tekniskt upptåg utan värdegrund — vågor och fundament pekar olika; avvakta och studera varför",
    DIVERGENS: "fundamentet vänder före vågorna — 'värde möter vändande vågor'; watchlistläge enligt konfluens-motorns kärnidé",
    "NEUTRAL ZON": "någon pelare är blandad, domnar eller tunn — avvakta; bilden är inte mogen",
    OSATT: "underlag saknas på ena eller båda pelarna — ingen konfluensbild alls",
  };

  const konfluensText =
    `Konfluens-gate (teknisk 3/5 × fundamental 4/7): teknisk riktning ${tekniskTotal === null ? "osatt" : tekniskTotal > 0 ? "+1" : tekniskTotal < 0 ? "−1" : "0"}, ` +
    `fundamental riktning ${fundamental.riktning === null ? "osatt (tunt underlag)" : fundamental.riktning > 0 ? "+1" : fundamental.riktning < 0 ? "−1" : "0"} ` +
    `(${fundamental.antalBelagda} ${fundamental.antalBelagda === 1 ? "beläggd kategori" : "belagda kategorier"}, ${fundamental.antalPlus} plus / ${fundamental.antalMinus} minus). ` +
    `Status: ${statusTotal} — ${STATUS_TEXT[statusTotal]}`;

  const konfluens: KonfluensBild = {
    tekniskRiktning: tekniskTotal,
    fundamentalRiktning: fundamental.riktning,
    antalKategorierBelagda: fundamental.antalBelagda,
    antalPlus: fundamental.antalPlus,
    antalMinus: fundamental.antalMinus,
    kategorier: fundamental.kategorier,
    status: statusTotal,
    perHorisont: perHorisontStatus,
    text: konfluensText,
  };

  // ── Flaggor & text ────────────────────────────────────────────────────────
  const valueAppearing = VARIABEL_IDN.filter((v) =>
    perVariabel[v].flaggor.includes("value-appearing")
  );
  const klassade = VARIABEL_IDN.filter((v) => perVariabel[v].fas !== "osatt");
  const forstarkta = klassade.filter((v) => perVariabel[v].justering > 0);
  const dampade = klassade.filter((v) => perVariabel[v].justering < 0);

  const toppar = [...aktiva]
    .sort((a, b) => Math.abs(perVariabel[b].dynamikbidrag ?? 0) - Math.abs(perVariabel[a].dynamikbidrag ?? 0))
    .slice(0, 3)
    .map((v) => `${v} ${perVariabel[v].namn} (${perVariabel[v].justering >= 0 ? "+" : ""}${svenskaTal(perVariabel[v].justering)})`);

  const delar: string[] = [];
  delar.push(
    `Dynamiklagret läste ${klassade.length} av ${VARIABEL_IDN.length} variabler (resten osatta med nivån orörd — motorn gissar aldrig)`
  );
  delar.push(
    `${forstarkta.length} variabler förstärks (Φ > 1), ${dampade.length} dämpas (Φ < 1)`
  );
  if (inverteradeAktiva.length > 0) {
    delar.push(
      `Riktighetsinverteringen lyfter ${inverteradeAktiva.length} variabler där fallande multipel/skuld är den gynnsamma riktningen (${inverteradeAktiva.join(", ")}) — Grahams köpläge bestraffas inte två gånger`
    );
  }
  if (valueAppearing.length > 0) {
    delar.push(
      `Value appearing (Mr Market): ${valueAppearing.map((v) => v + " " + perVariabel[v].namn).join(", ")} — korrigering i svagt bedömd variabel är statistiskt närmast en vändning`
    );
  }
  if (toppar.length > 0) delar.push(`Störst dynamikbidrag: ${toppar.join(" · ")}`);
  delar.push(
    `Komposit-dynamikbidrag ${komposit >= 0 ? "+" : ""}${svenskaTal(komposit)} poäng${takAktivt ? " (tak ±10 aktivt — råbidraget " + svenskaTal(kompositRåAvrundad) + " överskred taket)" : ""} på ${aktiva.length} aktiva variabler, viktade med hemmahorisonternas ζ`
  );
  delar.push(konfluensText);
  delar.push("Vågorna beskriver fundamentets rytm — en bild att studera och lära av, inte investeringsråd");

  const text = delar.join(". ") + ".";

  return {
    status: klassade.length > 0 || tekniskTotal !== null ? "ok" : "osatt",
    perVariabel,
    konfluens,
    kompositDynamikbidrag: komposit,
    kompositDynamikbidragForTak: kompositRåAvrundad,
    takAktivt,
    valueAppearing,
    varningar,
    text,
    grundatPa: { fvag: fvagFinns, tvag: tvagFinns, akm1: akm1Finns },
  };
}
