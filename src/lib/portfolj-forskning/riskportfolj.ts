/**
 * AK1A RISKPORTFÖLJSMOTOR — klienten väljer risknivå (konservativ|balanserad|
 * tillväxt) och tillväxttakt (lugn|stadig|aggressiv); motorn poängsätter
 * korstabellkandidater och bygger en deterministisk forskningsportfölj.
 *
 * POÄNGBAS (våg 57 D2): "akm1" (default — radens AKM1-total) eller "akm2"
 * (radens AKM2-komposit ur korstabellens berikade fält, se akm2-koppling.ts).
 * Basen byter ENDELIGT poängformelns första led (50 %-viken); vågstatus,
 * golv och samtliga kravkontroller är identiska i båda lägena. Motorn själv
 * validerar ALDRIG prenumerationer — UI:t (bygg-portfolj-kort.tsx) gatingar
 * AKM2-läget mot Portföljforskning Plus och kallar endast motorn när det är
 * upplåst.
 *
 * KUNDdirektiv: "klienten väljer vilken risknivå den vill ha, hur snabb
 * tillväxt kan vara, och vårt jobb är att nyttja alla system för att ta fram
 * portfölj som kunden kan nyttja eller hyra — erbjuda alternativ namn på
 * olika aktier eller justering av samma portföljen om vissa aktier har
 * börjat sakna några av de strikta kraven."
 *
 * POÄNGFORMEL (0–1, exporterad via POANGVIKTER):
 *   poäng = 0,50 × (poängbas / 100)
 *         + 0,35 × Σ_horisont horisontVikt × (vågvikt(fvag) + vågvikt(tvag)) / 2
 *         + 0,15 × min(max(golvmarginal, 0) / 0,50, 1)
 *   där vågvikt: impulsvåg = 1,0, basbygge = 0,6, korrigering = 0,3, osatt = 0
 *   (osatt ger noll — motorn gissar aldrig). Poängbasen är AKM1-totalen
 *   (akm1Totalt) eller AKM2-kompositen (rad.akm2) — saknad AKM2 bidrar 0.
 *
 * ÄRLIGHETSPRINCIPER (spegling av portfolj-vagor.ts):
 *  - DETERMINISTISK: samma indata → samma utdata. Totala sorteringsordningar
 *    med tydliga tie-breakers (ticker), inga slumptal, inga väggklockor —
 *    "skapad" härleds ur underlagets senastKontrollerad.
 *  - ALDRIG investeringsrådgivning: all text är pedagogisk forskning
 *    (lagen 2007:528 om värdepappersrörelser) — inga köp-/säljuppmaningar.
 *  - Motorn gissar aldrig: saknad golvdata → ärlig VARNING/BROTT, aldrig
 *    påhittade siffror; en pool som är för snäv för profilens tak flaggas
 *    öppet i ak1aNot istället för att döljas.
 */

import type {
  ErsattningsForslag,
  Horisont,
  InnehavForslag,
  KorstabbellRad,
  KravKontroll,
  PortfoljForslag,
  RiskNiva,
  RiskProfil,
  TillvaxtTakt,
  UppfoljningSnapshot,
  VagKlass,
} from "./typer";

// ── Konstanter ────────────────────────────────────────────────────────────────

const HORIZONTER: Horisont[] = ["mikro", "kort", "medellang", "lang", "mega"];

const HZ_NAMN: Record<Horisont, string> = {
  mikro: "mikro",
  kort: "kort",
  medellang: "medellång",
  lang: "lång",
  mega: "mega",
};

/** Fast klassordning för deterministisk argmax/räkning (spegling av portfolj-vagor.ts). */
const KLASS_ORDNING: VagKlass[] = ["impulsvag", "korrigering", "basbygge", "osatt"];

const KLASS_TEXT: Record<VagKlass, string> = {
  impulsvag: "impulsvåg",
  korrigering: "korrigering",
  basbygge: "basbygge",
  osatt: "osatt",
};

/** Vågklass → poängbidrag (impulsvåg bäst; osatt ger noll — motorn gissar aldrig). */
export const VAGVIKTER: Record<VagKlass, number> = {
  impulsvag: 1.0,
  basbygge: 0.6,
  korrigering: 0.3,
  osatt: 0,
};

/** Poängformelns delvikter (summerar till 1). */
export const POANGVIKTER = { akm1: 0.5, vag: 0.35, golv: 0.15 } as const;

/** Golvmarginal som ger full bonus (+50 % marginal → hela golvandelen av poängen). */
export const GOLV_BONUS_TAK = 0.5;

/** Basvikt i råpoängen — varje valt innehav får en spårbar vikt, aldrig noll. */
const VIKT_BAS = 0.02;

/** Portföljens storleksfönster enligt direktivet. */
export const MIN_INNEHAV = 8;
export const MAX_INNEHAV = 15;

/** AKM1-varningsgräns: under minAKM1 − 5 poäng räknas som BROTT. */
const AKM1_VARNGRENS = 5;

export const RISK_NIVOR: RiskNiva[] = ["konservativ", "balanserad", "tillvaxt"];
export const RISK_TAKTER: TillvaxtTakt[] = ["lugn", "stadig", "aggressiv"];

// ── Poängbas (våg 57 D2) ─────────────────────────────────────────────────────

/** Poängformelns första led: AKM1-totalen eller AKM2-kompositen (våg 57 D2). */
export type PoangBas = "akm1" | "akm2";

/** Maskinläsbar lista över poängbaserna (validering i API/UI). */
export const POANGBASER: PoangBas[] = ["akm1", "akm2"];

/** Säker poängbas-läsning — ogiltigt värde blir "akm1" (bakåtkompatibelt). */
export function sakradPoangBas(bas: unknown): PoangBas {
  return bas === "akm2" ? "akm2" : "akm1";
}

/** Poängbasens talvärde för en rad — null/ogiltig AKM2 bidrar 0 (aldrig gissa). */
function basVarde(rad: KorstabbellRad, bas: PoangBas): number {
  if (bas === "akm2") {
    const v = rad.akm2;
    return typeof v === "number" && Number.isFinite(v) ? Math.min(Math.max(v / 100, 0), 1) : 0;
  }
  return Number.isFinite(rad.akm1Totalt) ? Math.min(Math.max(rad.akm1Totalt / 100, 0), 1) : 0;
}

// ── Risknivåer: 3 nivåer × 3 takter = 9 kombinationer ─────────────────────────

type NivaParam = {
  /** Max andel per aktie, per takt (konservativ 0,08 → tillväxt 0,15). */
  maxPerAktie: Record<TillvaxtTakt, number>;
  /** Max andel per bransch (konservativ 0,25 → tillväxt 0,35). */
  maxPerBransch: number;
  /** Minsta AKM1-total i poolen (konservativ 75 → tillväxt 60). */
  minAKM1: number;
  /** Minsta golvmarginal — konservativ kräver > 0, tillväxt tillåter null. */
  minGolvMarginal: Record<TillvaxtTakt, number | null>;
};

const NIVA_PARAM: Record<RiskNiva, NivaParam> = {
  konservativ: {
    maxPerAktie: { lugn: 0.08, stadig: 0.09, aggressiv: 0.1 },
    maxPerBransch: 0.25,
    minAKM1: 75,
    minGolvMarginal: { lugn: 0.05, stadig: 0.04, aggressiv: 0.03 },
  },
  balanserad: {
    maxPerAktie: { lugn: 0.1, stadig: 0.11, aggressiv: 0.12 },
    maxPerBransch: 0.3,
    minAKM1: 68,
    minGolvMarginal: { lugn: 0.02, stadig: 0.01, aggressiv: 0 },
  },
  tillvaxt: {
    maxPerAktie: { lugn: 0.13, stadig: 0.14, aggressiv: 0.15 },
    maxPerBransch: 0.35,
    minAKM1: 60,
    minGolvMarginal: { lugn: null, stadig: null, aggressiv: null },
  },
};

/**
 * Rå horisontvikter per kombination (normaliseras till exakt summa 1).
 * Mikro hålls lågt i samtliga kombinationer enligt kunddirektivet —
 * Mega-projektet fokuserar på kort/medellång/lång/Mega där fundamental
 * tillväxt driver. Nivån styr riktningen (konservativ → lång/Mega tung,
 * tillväxt → kort/medellång tung) och takten styr tempot (aggressiv →
 * mer vikt på korta horisonter).
 */
const HZ_RAVIKTER: Record<RiskNiva, Record<TillvaxtTakt, Record<Horisont, number>>> = {
  konservativ: {
    lugn: { mikro: 0.02, kort: 0.08, medellang: 0.15, lang: 0.4, mega: 0.35 },
    stadig: { mikro: 0.04, kort: 0.12, medellang: 0.18, lang: 0.36, mega: 0.3 },
    aggressiv: { mikro: 0.06, kort: 0.18, medellang: 0.22, lang: 0.34, mega: 0.2 },
  },
  balanserad: {
    lugn: { mikro: 0.03, kort: 0.15, medellang: 0.22, lang: 0.35, mega: 0.25 },
    stadig: { mikro: 0.05, kort: 0.2, medellang: 0.25, lang: 0.3, mega: 0.2 },
    aggressiv: { mikro: 0.08, kort: 0.28, medellang: 0.28, lang: 0.24, mega: 0.12 },
  },
  tillvaxt: {
    lugn: { mikro: 0.04, kort: 0.18, medellang: 0.28, lang: 0.32, mega: 0.18 },
    stadig: { mikro: 0.06, kort: 0.26, medellang: 0.3, lang: 0.26, mega: 0.12 },
    aggressiv: { mikro: 0.09, kort: 0.34, medellang: 0.3, lang: 0.18, mega: 0.09 },
  },
};

/**
 * Normaliserar råa horisontvikter till exakt summa 1 via störst-rest-metoden
 * på 4 decimaler — deterministiskt och flyt-säkert.
 */
function normaliseraHorisontVikter(rå: Record<Horisont, number>): Record<Horisont, number> {
  const värden = HORIZONTER.map((hz) => {
    const v = rå[hz];
    return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0;
  });
  const summa = värden.reduce((a, b) => a + b, 0);
  if (summa <= 0) {
    throw new Error("Horisontvikterna i RISKNIVAER-tabellen är ogiltiga (summa ≤ 0)");
  }
  const enheter = värden.map((v) => Math.floor((v / summa) * 10000 + 1e-6));
  const rester = värden.map((v, i) => (v / summa) * 10000 - enheter[i]);
  let behov = 10000 - enheter.reduce((a, b) => a + b, 0);
  const ordning = HORIZONTER.map((_, i) => i).sort((a, b) => rester[b] - rester[a] || a - b);
  for (const i of ordning) {
    if (behov <= 0) break;
    enheter[i] += 1;
    behov -= 1;
  }
  const ut = {} as Record<Horisont, number>;
  HORIZONTER.forEach((hz, i) => {
    ut[hz] = enheter[i] / 10000;
  });
  return ut;
}

function byggRiskProfil(niva: RiskNiva, takt: TillvaxtTakt): RiskProfil {
  const p = NIVA_PARAM[niva];
  return {
    niva,
    takt,
    horisontVikter: normaliseraHorisontVikter(HZ_RAVIKTER[niva][takt]),
    maxPerAktie: p.maxPerAktie[takt],
    maxPerBransch: p.maxPerBransch,
    minAKM1: p.minAKM1,
    minGolvMarginal: p.minGolvMarginal[takt],
  };
}

/** RISKNIVAER-tabellen — alla 9 kombinationer (nyckel "niva:takt"). */
export const RISKNIVAER: Record<`${RiskNiva}:${TillvaxtTakt}`, RiskProfil> = (() => {
  const ut = {} as Record<`${RiskNiva}:${TillvaxtTakt}`, RiskProfil>;
  for (const n of RISK_NIVOR) {
    for (const t of RISK_TAKTER) {
      ut[`${n}:${t}`] = byggRiskProfil(n, t);
    }
  }
  return ut;
})();

/** Hämta profil ur tabellen — kastar tydligt fel vid okänd kombination. */
export function hamtaRiskProfil(niva: RiskNiva, takt: TillvaxtTakt): RiskProfil {
  const p = RISKNIVAER[`${niva}:${takt}`];
  if (!p) throw new Error(`Okänd riskprofil: ${String(niva)}/${String(takt)}`);
  return p;
}

// ── Hjälpmedel ────────────────────────────────────────────────────────────────

/** Uppnåelig vågklass — ogiltigt/ogiltiga värden blir "osatt", aldrig gissat. */
function sakradVagKlass(k: string | undefined): VagKlass {
  return k === "impulsvag" || k === "korrigering" || k === "basbygge" || k === "osatt" ? k : "osatt";
}

function summa(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

/** Deterministisk strängjämförelse (kodpunkter — aldrig locale-beroende). */
function jamforStrang(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Svensk procenttext med tecken: 0.12 → "+12 %", -0.05 → "-5 %". */
function procentText(x: number | null | undefined): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "osatt";
  const t = Math.round(Math.abs(x) * 100);
  return `${x < 0 ? "-" : "+"}${t} %`;
}

/** Räkna horisonter där fundamental ELLER teknisk vågstatus är korrigering. */
export function raknaKorrigeringar(rad: KorstabbellRad): number {
  return HORIZONTER.filter(
    (hz) =>
      sakradVagKlass(rad.fvagPerHorisont?.[hz]) === "korrigering" ||
      sakradVagKlass(rad.tvagPerHorisont?.[hz]) === "korrigering"
  ).length;
}

/** Pedagogisk klassräkning i text: "3 impulsvåg, 1 korrigering, 1 basbygge". */
function klassRakning(per: Record<Horisont, VagKlass> | undefined): string {
  const n: Record<VagKlass, number> = { impulsvag: 0, korrigering: 0, basbygge: 0, osatt: 0 };
  for (const hz of HORIZONTER) n[sakradVagKlass(per?.[hz])] += 1;
  const delar = KLASS_ORDNING.filter((k) => n[k] > 0).map((k) => `${n[k]} ${KLASS_TEXT[k]}`);
  return delar.length > 0 ? delar.join(", ") : "osatt";
}

/** Rensa kandidatpoolen: giltiga tickers, deduplicerat (första förekomsten gäller). */
function rensaKandidater(kandidater: KorstabbellRad[]): KorstabbellRad[] {
  const setta = new Set<string>();
  const ut: KorstabbellRad[] = [];
  for (const rad of kandidater ?? []) {
    if (!rad || typeof rad.ticker !== "string" || rad.ticker === "") continue;
    if (setta.has(rad.ticker)) continue;
    setta.add(rad.ticker);
    ut.push(rad);
  }
  return ut;
}

/** FNV-1a (32 bit) — deterministisk nyckelhash av portföljens ticker:vikt-signatur. */
function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// ── Poängsättning ─────────────────────────────────────────────────────────────

/**
 * Samlad poäng 0–1 för en kandidat enligt profilens horisontvikter.
 * Poängbas 50 % (AKM1-total eller AKM2-komposit — våg 57 D2) + vågstatus 35 %
 * (fundamental och teknisk vågd halva var, viktat per horisont) +
 * golvmarginal-bonus 15 % (0 vid +50 % marginal, inget bonus för saknat
 * eller negativt golv).
 */
export function raknaPoang(rad: KorstabbellRad, profil: RiskProfil, bas: PoangBas = "akm1"): number {
  const grund = basVarde(rad, bas);
  let vag = 0;
  for (const hz of HORIZONTER) {
    const f = VAGVIKTER[sakradVagKlass(rad.fvagPerHorisont?.[hz])];
    const t = VAGVIKTER[sakradVagKlass(rad.tvagPerHorisont?.[hz])];
    vag += (profil.horisontVikter[hz] ?? 0) * ((f + t) / 2);
  }
  const g = rad.golvMarginal;
  const golv =
    g !== null && g !== undefined && Number.isFinite(g)
      ? Math.min(Math.max(g / GOLV_BONUS_TAK, 0), 1)
      : 0;
  return POANGVIKTER.akm1 * grund + POANGVIKTER.vag * vag + POANGVIKTER.golv * golv;
}

// ── Kravkontroller ────────────────────────────────────────────────────────────

/**
 * Kontrollerar profilens strikta krav för en kandidat:
 *  1. "AKM1 ≥ minAKM1" — BROTT under minAKM1 − 5, VARNING däremellan.
 *  2. "Golv finnes" — endast när profilen kräver golv (minGolvMarginal ≠ null).
 *  3. "Vågstatus högst 1 korrigering av 5 horisonter" — 2 = VARNING, ≥ 3 = BROTT
 *     (fundamental ELLER teknisk korrigering räknas per horisont).
 *  4. "Golv-marginal positiv" — ≤ 0 = BROTT; > 0 men under profilens minimum =
 *     VARNING; ej mätt = BROTT vid golvkrav, annars VARNING (tillväxt tillåter null).
 */
export function kontrolleraKrav(rad: KorstabbellRad, profil: RiskProfil): KravKontroll[] {
  const krav: KravKontroll[] = [];
  const kravGolv = profil.minGolvMarginal !== null;
  const golvMatt =
    rad.golvMarginal !== null && rad.golvMarginal !== undefined && Number.isFinite(rad.golvMarginal);

  // 1. AKM1
  const akm1 = Number.isFinite(rad.akm1Totalt) ? rad.akm1Totalt : -1;
  krav.push({
    namn: `AKM1 ≥ ${profil.minAKM1}`,
    status:
      akm1 >= profil.minAKM1
        ? "OK"
        : akm1 >= profil.minAKM1 - AKM1_VARNGRENS
          ? "VARNING"
          : "BROTT",
    detalj: `AKM1 ${Number.isFinite(rad.akm1Totalt) ? String(rad.akm1Totalt) : "saknas"} av 100 — krav: minst ${profil.minAKM1}, varning ner till ${profil.minAKM1 - AKM1_VARNGRENS}`,
  });

  // 2. Golv finnes (endast när profilen kräver golv)
  if (kravGolv) {
    const minGolv = profil.minGolvMarginal as number;
    krav.push({
      namn: "Golv finnes",
      status: golvMatt ? "OK" : "BROTT",
      detalj: golvMatt
        ? `Golvmarginal uppmätt: ${procentText(rad.golvMarginal)} — profilen ${profil.niva}/${profil.takt} kräver golv med marginal ≥ ${procentText(minGolv)}`
        : `Golv saknas — profilen ${profil.niva}/${profil.takt} kräver golv med marginal ≥ ${procentText(minGolv)}`,
    });
  }

  // 3. Vågstatus
  const korrHorisonter = HORIZONTER.filter(
    (hz) =>
      sakradVagKlass(rad.fvagPerHorisont?.[hz]) === "korrigering" ||
      sakradVagKlass(rad.tvagPerHorisont?.[hz]) === "korrigering"
  );
  const antalKorr = korrHorisonter.length;
  krav.push({
    namn: "Vågstatus högst 1 korrigering av 5 horisonter",
    status: antalKorr <= 1 ? "OK" : antalKorr === 2 ? "VARNING" : "BROTT",
    detalj:
      antalKorr === 0
        ? "Ingen horisont i korrigering (fundamental och teknisk vågstatus)"
        : `${antalKorr} av 5 horisonter i korrigering (${korrHorisonter.map((h) => HZ_NAMN[h]).join(", ")})`,
  });

  // 4. Golv-marginal positiv
  if (!golvMatt) {
    krav.push({
      namn: "Golv-marginal positiv",
      status: kravGolv ? "BROTT" : "VARNING",
      detalj: kravGolv
        ? "Golvmarginal ej mätt — profilen kräver ett mätt golv"
        : "Golvmarginal ej mätt — tillåtet för denna risknivå, men ger inget värdeskyddsunderlag",
    });
  } else {
    const m = rad.golvMarginal as number;
    const min = profil.minGolvMarginal;
    krav.push({
      namn: "Golv-marginal positiv",
      status: m > 0 ? (min === null || m >= min ? "OK" : "VARNING") : "BROTT",
      detalj: `Golvmarginal ${procentText(m)}${min !== null ? ` — profilens miniminivå: ${procentText(min)}` : ""}`,
    });
  }

  return krav;
}

/**
 * Färskare BROTT-bedömning ur en uppföljningssnapshot ("då vs nu"):
 * AKM1 under varningsgränsen och/eller ≥ 3 korrigeringhorisonter.
 * Snapshoten saknar golvmarginal — det kravet bedöms från korstabellraden.
 */
function brottFranSnapshot(snap: UppfoljningSnapshot, profil: RiskProfil): string[] {
  const ut: string[] = [];
  if (Number.isFinite(snap.akm1Totalt) && snap.akm1Totalt < profil.minAKM1 - AKM1_VARNGRENS) {
    ut.push(
      `Uppföljning (då vs nu): AKM1 ${snap.akm1Totalt} i senaste snapshot — under profilens varningsgräns ${profil.minAKM1 - AKM1_VARNGRENS}`
    );
  }
  const korr = HORIZONTER.filter(
    (hz) =>
      sakradVagKlass(snap.fvagPerHorisont?.[hz]) === "korrigering" ||
      sakradVagKlass(snap.tvagPerHorisont?.[hz]) === "korrigering"
  );
  if (korr.length >= 3) {
    ut.push(
      `Uppföljning (då vs nu): ${korr.length} av 5 horisonter i korrigering (${korr.map((h) => HZ_NAMN[h]).join(", ")})`
    );
  }
  return ut;
}

// ── Viktallokering (deterministisk water-filling med tak) ─────────────────────

/** Cap per aktie, därefter skalning per branschgrupp ner till bransch-tak. */
function appliceraTak(w: number[], branscher: string[], profil: RiskProfil): number[] {
  const u = w.map((x) => Math.min(x, profil.maxPerAktie));
  const grupper = new Map<string, number[]>();
  branscher.forEach((b, i) => {
    const g = grupper.get(b) ?? [];
    g.push(i);
    grupper.set(b, g);
  });
  for (const idx of grupper.values()) {
    const s = idx.reduce((a, i) => a + u[i], 0);
    if (s > profil.maxPerBransch + 1e-12) {
      const f = profil.maxPerBransch / s;
      for (const i of idx) u[i] *= f;
    }
  }
  return u;
}

/**
 * Störst-rest-avrundning till 4 decimaler med tak-respekt på enhetsnivå
 * (takens ×10000 är heltal) — summan blir exakt 1.0000. Pass 2–3 är sista
 * utvägen för att garantera summans exakthet om enhetstaken binder helt.
 */
function storstRestEnheter(c: number[], branscher: string[], profil: RiskProfil): number[] {
  const enh = c.map((x) => Math.floor(x * 10000 + 1e-6));
  let behov = 10000 - enh.reduce((a, b) => a + b, 0);
  if (behov > 0) {
    const takAktie = Math.round(profil.maxPerAktie * 10000);
    const takBransch = Math.round(profil.maxPerBransch * 10000);
    const branschEnh = new Map<string, number>();
    branscher.forEach((b, i) => branschEnh.set(b, (branschEnh.get(b) ?? 0) + enh[i]));
    const rester = c.map((x, i) => x * 10000 - enh[i]);
    const ordning = c.map((_, i) => i).sort((a, b) => rester[b] - rester[a] || a - b);
    // Pass 1: med både aktie- och bransch-tak
    for (const i of ordning) {
      if (behov <= 0) break;
      const b = branscher[i];
      if (enh[i] + 1 <= takAktie && (branschEnh.get(b) ?? 0) + 1 <= takBransch) {
        enh[i] += 1;
        branschEnh.set(b, (branschEnh.get(b) ?? 0) + 1);
        behov -= 1;
      }
    }
    // Pass 2 (sista utväg): aktie-tak endast
    for (const i of ordning) {
      if (behov <= 0) break;
      if (enh[i] + 1 <= takAktie) {
        enh[i] += 1;
        behov -= 1;
      }
    }
    // Pass 3 (extremfallet, normalt ouppnått): helt utan tak — summan vinner
    for (const i of ordning) {
      if (behov <= 0) break;
      enh[i] += 1;
      behov -= 1;
    }
  }
  return enh.map((e) => e / 10000);
}

/**
 * Viktar valda innehav proportionellt mot poäng, med tak per aktie och per
 * bransch. Deterministisk fixpunktsiteration + topp-upp på tak-utrymme.
 * Returnerar takBruten = true om poolen strukturellt inte rymmer summa 1
 * inom taken (då skalar motorn likformigt och flaggar ärligt i ak1aNot).
 */
function allokeraVikter(
  poang: number[],
  branscher: string[],
  profil: RiskProfil
): { vikter: number[]; takBruten: boolean } {
  const n = poang.length;
  if (n === 0) return { vikter: [], takBruten: false };

  const ra = poang.map((p) => (Number.isFinite(p) && p > 0 ? p : 0) + VIKT_BAS);
  const raSumma = summa(ra);
  const w = ra.map((v) => v / raSumma);

  for (let iter = 0; iter < 1000; iter++) {
    const c = appliceraTak(w, branscher, profil);
    const s = summa(c);
    if (!(s > 0)) break;
    let diff = 0;
    for (let i = 0; i < n; i++) {
      const ny = c[i] / s;
      if (Math.abs(w[i] - ny) > diff) diff = Math.abs(w[i] - ny);
      w[i] = ny;
    }
    if (diff < 1e-13) break;
  }

  let c = appliceraTak(w, branscher, profil);

  // Topp-upp: fördela eventuell rest proportionellt på tak-utrymme.
  for (let iter = 0; iter < 100; iter++) {
    const rest = 1 - summa(c);
    if (rest <= 1e-12) break;
    const branschSumma = new Map<string, number>();
    branscher.forEach((b, i) => branschSumma.set(b, (branschSumma.get(b) ?? 0) + c[i]));
    const utrymme = c.map((x, i) =>
      Math.max(
        0,
        Math.min(
          profil.maxPerAktie - x,
          profil.maxPerBransch - (branschSumma.get(branscher[i]) ?? 0)
        )
      )
    );
    const totalUtrymme = summa(utrymme);
    if (totalUtrymme <= 1e-12) break;
    const andel = Math.min(rest, totalUtrymme);
    c = c.map((x, i) => x + andel * (utrymme[i] / totalUtrymme));
  }

  let takBruten = false;
  const sistaSumma = summa(c);
  if (sistaSumma < 1 - 1e-7) {
    takBruten = true;
    c = c.map((x) => x / sistaSumma);
  }

  return { vikter: storstRestEnheter(c, branscher, profil), takBruten };
}

// ── Portföljbygge ─────────────────────────────────────────────────────────────

/** Total bedömningsordning: brott ↑, poäng ↓, ticker ↑ — deterministisk. */
interface Bedomning {
  rad: KorstabbellRad;
  krav: KravKontroll[];
  poang: number;
  antalBrott: number;
}

function jamforBedomda(a: Bedomning, b: Bedomning): number {
  return (
    a.antalBrott - b.antalBrott ||
    b.poang - a.poang ||
    jamforStrang(a.rad.ticker, b.rad.ticker)
  );
}

/** Motivtext per innehav — pedagogisk, dömer aldrig, inga köp-/säljuppmaningar. */
function byggMotiv(rad: KorstabbellRad, poang: number, profil: RiskProfil, bas: PoangBas): string {
  const golvText =
    rad.golvMarginal !== null && rad.golvMarginal !== undefined && Number.isFinite(rad.golvMarginal)
      ? `golvmarginal ${procentText(rad.golvMarginal)}`
      : "golv ej mätt";
  const basText =
    bas === "akm2"
      ? `AKM2-komposit ${rad.akm2 != null && Number.isFinite(rad.akm2) ? rad.akm2 : "saknas"}/100 (akm2-läget: moduler V21+ aktiva per bransch, viktprofil akm2-2026; AKM1 ${Number.isFinite(rad.akm1Totalt) ? rad.akm1Totalt : "saknas"} som jämförelse)`
      : `AKM1 ${Number.isFinite(rad.akm1Totalt) ? rad.akm1Totalt : "saknas"}/100`;
  const basEtikett = bas === "akm2" ? "AKM2" : "AKM1";
  return (
    `${basText} (${rad.bransch}). ` +
    `Fundamental vågstatus: ${klassRakning(rad.fvagPerHorisont)}; teknisk: ${klassRakning(rad.tvagPerHorisont)}. ` +
    `${golvText}. Samlad poäng ${poang.toFixed(2).replace(".", ",")} av 1,00 enligt profil ` +
    `${profil.niva}/${profil.takt} (poängbas ${basEtikett} 50 %, vågstatus 35 % med profilens horisontvikter, golv 15 %). ` +
    "Pedagogiskt studieobjekt — inte köp- eller säljrekommendation."
  );
}

/** Portföljens dominanta vågklass per horisont (viktat argmax, fast ordning). */
function raknaVagprofilSammanfattning(
  innehav: InnehavForslag[],
  rader: KorstabbellRad[]
): Record<Horisont, VagKlass> {
  const ut = {} as Record<Horisont, VagKlass>;
  for (const hz of HORIZONTER) {
    const poang: Record<VagKlass, number> = { impulsvag: 0, korrigering: 0, basbygge: 0, osatt: 0 };
    innehav.forEach((inh, i) => {
      const rad = rader[i];
      const f = sakradVagKlass(rad.fvagPerHorisont?.[hz]);
      const t = sakradVagKlass(rad.tvagPerHorisont?.[hz]);
      poang[f] += inh.vikt * 0.5;
      poang[t] += inh.vikt * 0.5;
    });
    let basta: VagKlass = "osatt";
    let belopp = 0;
    for (const k of KLASS_ORDNING) {
      if (poang[k] > belopp) {
        belopp = poang[k];
        basta = k;
      }
    }
    ut[hz] = belopp > 0 ? basta : "osatt";
  }
  return ut;
}

function byggId(profil: RiskProfil, innehav: InnehavForslag[], bas: PoangBas): string {
  const grund = innehav.map((i) => `${i.ticker}=${i.vikt.toFixed(4)}`).join("|");
  return `pf-${profil.niva}-${profil.takt}-${bas}-${innehav.length}-${fnv1a(grund)}`;
}

/** Deterministisk "skapad"-stämpel: senaste senastKontrollerad i underlaget. */
function talSenastKontrollerad(rader: KorstabbellRad[]): string {
  let senast = "";
  for (const r of rader) {
    if (typeof r.senastKontrollerad === "string" && r.senastKontrollerad > senast) {
      senast = r.senastKontrollerad;
    }
  }
  return senast !== "" ? senast : "1970-01-01";
}

function byggAk1aNot(
  profil: RiskProfil,
  ctx: { antalInnehav: number; takBruten: boolean; ersattningar: number; bas: PoangBas }
): string {
  if (ctx.antalInnehav === 0) {
    return (
      "Portföljen kunde inte byggas — kandidatpoolen är tom. Motorn gissar aldrig; " +
      "lägg till korstabellrader och bygg om. Detta är pedagogisk forskning — inte " +
      "investeringsrådgivning enligt lagen (2007:528)."
    );
  }
  const hv = profil.horisontVikter;
  const viktText = HORIZONTER.map((hz) => `${HZ_NAMN[hz]} ${Math.round(hv[hz] * 100)} %`).join(", ");
  const basText =
    ctx.bas === "akm2"
      ? "AKM2-kompositen (moduler V21+ per bransch, viktprofil akm2-2026) som poängbas"
      : "AKM1-poäng";
  const varningar: string[] = [];
  if (ctx.antalInnehav < MIN_INNEHAV) {
    varningar.push(
      `Poolen rymmer endast ${ctx.antalInnehav} innehav — färre än miniminivån ${MIN_INNEHAV}; spridningen är lägre än profilens mål.`
    );
  }
  if (ctx.takBruten) {
    varningar.push(
      "Varning: kandidatpoolen är för snäv för profilens vikttak — vikterna har justerats utanför taken; bredda poolen för full spridning."
    );
  }
  if (ctx.ersattningar > 0) {
    varningar.push(
      `${ctx.ersattningar} innehav bryter mot minst ett strikt krav och har ersättningsförslag i samma bransch — se listan över ersättningar.`
    );
  }
  const varningsText = varningar.length > 0 ? varningar.join(" ") + " " : "";
  return (
    `Denna forskningsportfölj speglar profil ${profil.niva}/${profil.takt}: vikterna bygger på ` +
    `${basText} och fundamental+teknisk vågstatus enligt horisontvikterna (${viktText}) ` +
    `samt golvmarginal som bonusfaktor. ${varningsText}` +
    "Materialet är pedagogisk forskning i AK1A:s ekosystem — inte investeringsrådgivning " +
    "enligt lagen (2007:528); inga köp- eller säljuppmaningar förekommer."
  );
}

/**
 * Bygger en deterministisk forskningsportfölj ur korstabellkandidater.
 *
 * Urval: kandidater sorteras (antal BROTT ↑, poäng ↓, ticker ↑) och väljs
 * greedy upp till 8–15 innehav — gärna fler för trånga profiler (maxPerAktie
 * 0,08 kräver minst 13 innehav för att summera till 1) — med branschkvot.
 * Viktning: poängproportionell water-filling med tak per aktie/bransch.
 * Ersättningar: rattaErsattningar körs internt på samma pool.
 *
 * opts.poangbas (våg 57 D2): "akm1" (default) eller "akm2" — poängformelns
 * första led byts, allt annat är identiskt. Kravkontrollerna förblir AKM1-
 * baserade i båda lägena (de vaktar korstabellens strika krav, inte poängen).
 */
export function byggPortfolj(
  riskProfil: RiskProfil,
  kandidater: KorstabbellRad[],
  opts?: { poangbas?: PoangBas },
): PortfoljForslag {
  const bas = sakradPoangBas(opts?.poangbas);
  const rensade = rensaKandidater(kandidater);
  const bedomda: Bedomning[] = rensade.map((rad) => {
    const krav = kontrolleraKrav(rad, riskProfil);
    return {
      rad,
      krav,
      poang: raknaPoang(rad, riskProfil, bas),
      antalBrott: krav.filter((k) => k.status === "BROTT").length,
    };
  });

  const sorterad = [...bedomda].sort(jamforBedomda);

  const minAntal = Math.max(MIN_INNEHAV, Math.ceil(1 / riskProfil.maxPerAktie - 1e-9));
  const malN = sorterad.length >= minAntal ? Math.min(MAX_INNEHAV, sorterad.length) : sorterad.length;
  const branschKvot = Math.max(1, Math.ceil(riskProfil.maxPerBransch * malN));

  const branschAntal = new Map<string, number>();
  const valda: Bedomning[] = [];
  for (const b of sorterad) {
    if (valda.length >= malN) break;
    const n = branschAntal.get(String(b.rad.bransch)) ?? 0;
    if (n >= branschKvot) continue;
    branschAntal.set(String(b.rad.bransch), n + 1);
    valda.push(b);
  }

  const { vikter, takBruten } = allokeraVikter(
    valda.map((v) => v.poang),
    valda.map((v) => String(v.rad.bransch)),
    riskProfil
  );

  const innehav: InnehavForslag[] = valda.map((v, i) => ({
    ticker: v.rad.ticker,
    vikt: vikter[i],
    motiv: byggMotiv(v.rad, v.poang, riskProfil, bas),
    krav: v.krav,
  }));

  const vagprofil = raknaVagprofilSammanfattning(
    innehav,
    valda.map((v) => v.rad)
  );

  const interim: PortfoljForslag = {
    id: byggId(riskProfil, innehav, bas),
    skapad: talSenastKontrollerad(valda.map((v) => v.rad)),
    riskProfil,
    innehav,
    ersattningar: [],
    ak1aNot: "",
    vagprofilSammanfattning: vagprofil,
    poangbas: bas,
  };

  const ersattningar = rattaErsattningar(interim, rensade);

  return {
    ...interim,
    ersattningar,
    ak1aNot: byggAk1aNot(riskProfil, {
      antalInnehav: innehav.length,
      takBruten,
      ersattningar: ersattningar.length,
      bas,
    }),
  };
}

// ── Ersättningsrättning ───────────────────────────────────────────────────────

/** Snapshotens färskare AKM1/vågvärden ersätter radens vid poängberäkning. */
function effektivRad(rad: KorstabbellRad, snap: UppfoljningSnapshot | undefined): KorstabbellRad {
  if (!snap) return rad;
  return {
    ...rad,
    akm1Totalt: Number.isFinite(snap.akm1Totalt) ? snap.akm1Totalt : rad.akm1Totalt,
    fvagPerHorisont: snap.fvagPerHorisont ?? rad.fvagPerHorisont,
    tvagPerHorisont: snap.tvagPerHorisont ?? rad.tvagPerHorisont,
  };
}

/** Kort jämförelsetext: "AKM1 82 vs 64, golv +12 % vs saknas, korrigeringar 0 vs 3 av 5". */
function jamforMotErsatt(k: KorstabbellRad, ersatt: KorstabbellRad): string {
  const golvText = (m: number | null | undefined) =>
    m === null || m === undefined || !Number.isFinite(m) ? "saknas" : procentText(m);
  return (
    `AKM1 ${Number.isFinite(k.akm1Totalt) ? k.akm1Totalt : "saknas"} vs ${Number.isFinite(ersatt.akm1Totalt) ? ersatt.akm1Totalt : "saknas"}, ` +
    `golv ${golvText(k.golvMarginal)} vs ${golvText(ersatt.golvMarginal)}, ` +
    `korrigeringar ${raknaKorrigeringar(k)} vs ${raknaKorrigeringar(ersatt)} av 5`
  );
}

function byggKandidatMotiv(
  k: KorstabbellRad,
  profil: RiskProfil,
  befintligVikt: number | undefined,
  bas: PoangBas,
): string {
  const golvText =
    k.golvMarginal !== null && k.golvMarginal !== undefined && Number.isFinite(k.golvMarginal)
      ? `golv ${procentText(k.golvMarginal)}`
      : "golv ej mätt";
  const befintlig =
    befintligVikt !== undefined
      ? ` Ingår redan i portföljen med vikt ${Math.round(befintligVikt * 100)} %.`
      : "";
  const basText =
    bas === "akm2"
      ? `AKM2-komposit ${k.akm2 != null && Number.isFinite(k.akm2) ? k.akm2 : "saknas"}/100, AKM1 ${Number.isFinite(k.akm1Totalt) ? k.akm1Totalt : "saknas"} som jämförelse`
      : `AKM1 ${Number.isFinite(k.akm1Totalt) ? k.akm1Totalt : "saknas"}/100`;
  return (
    `${basText} (${k.bransch}), ` +
    `fundamentalt ${klassRakning(k.fvagPerHorisont)}, tekniskt ${klassRakning(k.tvagPerHorisont)}, ` +
    `${golvText}.${befintlig} Alternativt studieobjekt — inte köp- eller säljrekommendation.`
  );
}

/**
 * Rättar ersättningar: för varje innehav med minst ett BROTT-krav (eller färskare
 * BROTT i en uppföljningssnapshot) hittas upp till 3 ersättningskandidater i
 * SAMMA bransch utan BROTT, rangordnade på poäng. Direktivet: "alternativ namn
 * på olika aktier eller justering av samma portföljen om vissa aktier har
 * börjat sakna några av de strikta kraven".
 */
export function rattaErsattningar(
  forslag: PortfoljForslag,
  kandidater: KorstabbellRad[],
  portfolioSnapshot?: UppfoljningSnapshot[]
): ErsattningsForslag[] {
  const profil = forslag.riskProfil;
  const bas = sakradPoangBas(forslag.poangbas); // ersättningarna poängsätts i förslagets poängbas (våg 57 D2)
  const pool = rensaKandidater(kandidater);
  const radMap = new Map<string, KorstabbellRad>();
  for (const r of pool) radMap.set(r.ticker, r);
  const snapMap = new Map<string, UppfoljningSnapshot>();
  for (const s of portfolioSnapshot ?? []) {
    if (s && typeof s.ticker === "string" && s.ticker !== "") snapMap.set(s.ticker, s);
  }
  const viktMap = new Map<string, number>();
  for (const i of forslag.innehav) viktMap.set(i.ticker, i.vikt);

  const ut: ErsattningsForslag[] = [];
  for (const inh of forslag.innehav) {
    const brott = inh.krav.filter((k) => k.status === "BROTT");
    const rad = radMap.get(inh.ticker);
    const snap = snapMap.get(inh.ticker);
    const farskaBrott = rad && snap ? brottFranSnapshot(snap, profil) : [];
    if (brott.length === 0 && farskaBrott.length === 0) continue;

    const orsaker = [...brott.map((k) => `${k.namn} — ${k.detalj}`), ...farskaBrott];

    const kandidatBedoma = pool
      .filter((k) => k.ticker !== inh.ticker && String(k.bransch) === String(rad?.bransch))
      .map((k) => ({
        rad: k,
        poang: raknaPoang(effektivRad(k, snapMap.get(k.ticker)), profil, bas),
        brottFri: kontrolleraKrav(k, profil).every((x) => x.status !== "BROTT"),
      }))
      .filter((k) => k.brottFri)
      .sort((a, b) => b.poang - a.poang || jamforStrang(a.rad.ticker, b.rad.ticker))
      .slice(0, 3);

    ut.push({
      ersattTicker: inh.ticker,
      orsak: orsaker.join("; "),
      kandidater: kandidatBedoma.map(({ rad: k }) => ({
        ticker: k.ticker,
        motiv: byggKandidatMotiv(k, profil, viktMap.get(k.ticker), bas),
        skillnadMotErsatt: rad ? jamforMotErsatt(k, rad) : "",
      })),
    });
  }
  return ut;
}
