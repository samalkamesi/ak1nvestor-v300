/**
 * AK1A KONFLUENSMOTOR — innovationen "värde garanterat före vågorna".
 *
 * Fem oberoende dimensioner → EN deterministisk konfluenspoäng 0–100:
 *   1. vardgolv           — NCAV-kvot + P/B + P/E-multipel (netnet + analysfundament)
 *   2. kvalitet           — AKM1-proxy: ROE / vinstmarginal / skuldsättning (analys-motorn)
 *   3. fundamentalVagstart — andel impulsvågor på MIKRO+KORT i vågfundamentets 20×5-matris
 *   4. prisVaglage        — prisvåg fortfarande i basbygge/korrigering = HÖG poäng
 *                           (vi är tidiga ute — impulsvåg = tåget gått) ur vager + matris25
 *   5. divergens          — fundamentet ▲ medan priset ▼ = "positiv" (vändande vågor)
 *
 * Idé: ren värdeinvestering kan köpa "värdefällor" där fundamentet aldrig vänder;
 * ren vågteori kan köpa "vackra mönster" utan värdegolv. Konfluens = båda pelarna
 * står: kursen Handlas nära ett värdegolv OCH vågorna börjar vända upp — värdet
 * garanterar nedsidan medan vågorna ger timingen.
 *
 * ÅTERANVÄNDER de tre bevisade motorerna (uppfunnar inte om):
 *   - skannaNetnet (netnet-motor)      → NCAV, P/E, P/B, kurs
 *   - körAnalysMotor (analys-motor)    → prisvågor (vager, matris25) + fundament
 *   - körVagfundament (vagfundament)   → 20×5 fundamentalvågsmatrisen
 * De tre körs PARALLELLT per ticker via Promise.allSettled — en källas fel dödar
 * aldrig raden (dimensionen blir null och datakallor minskas).
 *
 * DETERMINISM (P2): samma indata → samma utdata. Inga slumpmoment, ingen klocka
 * i poängsättningen; alla poäng avrundas till heltal 0–100. Konfluenspoängen
 * beräknas ur de AVRUNDADE dimensionerna så att totalen är reproducerbar ur de
 * tal som visas i UI.
 *
 * SEKRETESS (P8): de interna vikterna nedan är AK1A:s hemliga know-how — de
 * exporteras ALDRIG och får aldrig läckas till klienten. Denna modul är
 * SERVER-SIDE ONLY och får ALDRIG importeras av klientkomponenter ("dns"-import
 * i beroendena gör den dessutom olämplig för browserbundles). Exponera endast
 * skannaKonfluens/sjalvkontroll + KonfluensRad via en API-route.
 *
 * Pedagogiskt verktyg — inte investeringsråd.
 */
import { skannaNetnet, GRAHAM_TROSKEL, type NetnetRad } from "./netnet-motor";
import { körAnalysMotor, HORIZONTER, type TickerAnalys } from "./analys-motor";
import { körVagfundament, type VagfundamentAnalys } from "./vagfundament-motor";

// ── Publika typer ────────────────────────────────────────────────────────────

/** Klassnamn exakt enligt konfluensspecifikationen (null = fälten räcker inte för bild). */
export type KonfluensKlass =
  | "Konfluens — värde möter vändande vågor"
  | "Värde men vågor sover"
  | "Vågor utan värdegolv"
  | "Ingen bild"
  | null;

/** En konfluensrad — allt UI:t behöver; innehåller ALDRIG några vikter (P8). */
export type KonfluensRad = {
  ticker: string;
  namn?: string;
  /** 0–100: NCAV-kvot + P/B + P/E-multipel (ur netnet + analysfundament). */
  vardgolv: number | null;
  /** 0–100: AKM1-proxy ur analys-motorn (ROE / vinstmarginal / skuld). */
  kvalitet: number | null;
  /** 0–100: andel impulsvågor på MIKRO+KORT ur vågfundamentmatrisen. */
  fundamentalVagstart: number | null;
  /** 0–100: prisvåg i basbygge/korrigering = högt (vi är tidiga). */
  prisVaglage: number | null;
  /** fundament ▲ + pris ▼ = "positiv"; motsatsen = "negativ"; annars null. */
  divergens: "positiv" | "negativ" | null;
  /** 0–100 viktad totalsumma (interna + hemliga vikter, P8). */
  konfluens: number | null;
  klass: KonfluensKlass;
  /** Hur många av de tre oberoende motorkällorna som levererade data (0–3). */
  datakallor: number;
};

/** Max antal tickers per skannaKonfluens-anrop (konfluensspecifikation). */
export const MAX_TICKER_KONFLUENS = 10;

/** Antal källor som krävs för att en rad ska få annan klass än "Ingen bild". */
export const MIN_KALLOR_FOR_BILD = 3;

// ── P8: INTERN viktning — hemlig know-how, exporteras ALDRIG ────────────────

/** Totalviktning av de fem dimensionerna. Sum = 1. Värdepelaren tyngst. */
const VIKT_VARDGOLV = 0.32;
const VIKT_VAGSTART = 0.24;
const VIKT_PRISVAGLAGE = 0.22;
const VIKT_KVALITET = 0.14;
const VIKT_DIVERGENS = 0.08;

/** Delvikter inom vardgolv (NCAV tyngst — Graham-skolans kärna). */
const VIKTER_VARDGOLV = { ncav: 0.5, pb: 0.3, pe: 0.2 };

/** Delvikter inom kvalitet (AKM1: lönsamhet före balansräkning). */
const VIKTER_KVALITET = { roe: 0.4, marginal: 0.35, skuld: 0.25 };

/** Delvikter inom prisVaglage (vågklasserna väger tyngre än 25-cellersmatrisen). */
const VIKTER_PRISVAGLAGE = { vager: 0.6, matris25: 0.4 };

/** Poäng per prisvågklass: basbygge/korrigering = vi är tidiga; impulsvåg = sent. */
const VAGLAGE_POANG: Record<string, number> = { basbygge: 100, korrigering: 90, "impulsvåg": 0 };

/** Divergensens bidrag till konfluenspoängen. */
const DIVERGENS_POANG = { positiv: 100, negativ: 0 } as const;

/**
 * Deterministiska trösklar (fasta konstanter — inga parametrar inifrån klienten).
 * P/E- och P/B-"vs historik": källdatan saknar multipelhistorik, så historik-
 * jämförelsen görs som en fast deterministisk mellanskala (dokumenterad
 * approximation, P8-ärlighet: vi gissar aldrig, vi dokumenterar).
 */
const TROSKLAR = {
  ncavBast: GRAHAM_TROSKEL, // kurs/NCAV ≤ 0.667 (Grahams net-net) → 100 poäng
  ncavSamst: 2.0, // kurs ≥ 2 × NCAV → 0 poäng
  pbBast: 0.5,
  pbSamst: 3.0,
  peBast: 5.0,
  peSamst: 25.0,
  roeBast: 0.2, // ROE ≥ 20 % → 100 poäng
  marginalBast: 0.2, // vinstmarginal ≥ 20 % → 100 poäng
  skuldBast: 30, // skuld/eget kapital ≤ 30 % → 100 poäng
  skuldSamst: 150,
} as const;

/** Klass-gränser (publika eftersom de förklaras i UI-pedagogiken). */
const KONFLUENS_TROSKEL = 70;
const PELARE_TROSKEL = 50;

/** Minst så många bedömda mikro+kort-celler krävs för fundamentalVagstart. */
const MIN_VAGSTART_CELLER = 6;

/** Minst så många dimensioner (av fem) krävs för att konfluenspoäng får beräknas. */
const MIN_DIMENSIONER_FOR_KONFLUENS = 2;

/** Parallella tickers i arbetarpoolen (3 tickers × 3 motorer håller Yahoo-vänligt tryck). */
const PARALLELLA_TICKERS = 3;

/** Horisonter som driver fundamentalVagstart (spec: MIKRO+KORT ur 20×5-matrisen). */
const VAGSTART_HZ = ["mikro", "kort"] as const;

const TILLATNA_KLASSER = new Set<string>([
  "Konfluens — värde möter vändande vågor",
  "Värde men vågor sover",
  "Vågor utan värdegolv",
  "Ingen bild",
]);

// ── Deterministiska räknehjälpmedel ─────────────────────────────────────────

function clamp100(x: number): number {
  return x < 0 ? 0 : x > 100 ? 100 : x;
}

/** Fast trappa: lägre är bättre. x ≤ bast → 100, x ≥ samst → 0, linjärt däremellan. */
function poangLagreArBattre(x: number, bast: number, samst: number): number {
  if (x <= bast) return 100;
  if (x >= samst) return 0;
  return (100 * (samst - x)) / (samst - bast);
}

/** Fast trappa: högre är bättre. x ≥ bast → 100, x ≤ 0 → 0, linjärt däremellan. */
function poangHogreArBattre(x: number, bast: number): number {
  if (x <= 0) return 0;
  if (x >= bast) return 100;
  return (100 * x) / bast;
}

/** Viktat medelvärde över de delar som faktiskt levererade tal (null-hopp,
 * vikterna renormaliseras) — deterministiskt, null om inget delvärde fanns. */
function viktatMedel(delar: ReadonlyArray<readonly [number | null, number]>): number | null {
  let summa = 0;
  let vikt = 0;
  for (const [poang, v] of delar) {
    if (poang === null || !Number.isFinite(poang)) continue;
    summa += poang * v;
    vikt += v;
  }
  return vikt > 0 ? summa / vikt : null;
}

/** Avrunda till heltal 0–100 (deterministisk normalisering; null lämnas orört). */
function heltal(x: number | null): number | null {
  return x === null ? null : Math.round(clamp100(x));
}

// ── Dimension 1: vardgolv (netnet + analysfundament) ────────────────────────

/** NCAV-kvoten väger tyngst; negativ NCAV = inget värdegolv alls → 0 poäng. */
function beraknaVardgolv(n: NetnetRad | null, a: TickerAnalys | null): number | null {
  let ncavDel: number | null = null;
  if (n) {
    if (n.forhallande !== null && n.forhallande > 0) {
      ncavDel = poangLagreArBattre(n.forhallande, TROSKLAR.ncavBast, TROSKLAR.ncavSamst);
    } else if (n.ncavPerAktie !== null && n.ncavPerAktie <= 0) {
      ncavDel = 0;
    }
  }
  const pb = n?.pb ?? a?.fundament?.pb ?? null;
  const pbDel = pb !== null && pb > 0 ? poangLagreArBattre(pb, TROSKLAR.pbBast, TROSKLAR.pbSamst) : null;
  const pe = n?.pe ?? a?.fundament?.pe ?? a?.fundament?.peFwd ?? null;
  const peDel = pe !== null && pe > 0 ? poangLagreArBattre(pe, TROSKLAR.peBast, TROSKLAR.peSamst) : null;
  return viktatMedel([
    [ncavDel, VIKTER_VARDGOLV.ncav],
    [pbDel, VIKTER_VARDGOLV.pb],
    [peDel, VIKTER_VARDGOLV.pe],
  ]);
}

// ── Dimension 2: kvalitet (AKM1-proxy ur analys-motorns fundament) ──────────

function beraknaKvalitet(a: TickerAnalys | null): number | null {
  const f = a?.fundament ?? null;
  if (!f) return null;
  const roeDel = f.roe !== null ? poangHogreArBattre(f.roe, TROSKLAR.roeBast) : null;
  const marginalDel = f.vinstmarginal !== null ? poangHogreArBattre(f.vinstmarginal, TROSKLAR.marginalBast) : null;
  const skuldDel = f.skuldEk !== null ? poangLagreArBattre(f.skuldEk, TROSKLAR.skuldBast, TROSKLAR.skuldSamst) : null;
  return viktatMedel([
    [roeDel, VIKTER_KVALITET.roe],
    [marginalDel, VIKTER_KVALITET.marginal],
    [skuldDel, VIKTER_KVALITET.skuld],
  ]);
}

// ── Dimension 3 + divergens-underlag: fundamentalvågor (vågfundamentmatrisen) ─

/** Alla bedömda celler (≠ null) på MIKRO+KORT i 20×5-matrisen, V01–V20 i ordning. */
function vagfundamentCeller(v: VagfundamentAnalys | null): number[] {
  if (!v || v.fel || !v.matris) return [];
  const ut: number[] = [];
  for (const vid of Object.keys(v.matris).sort()) {
    for (const hz of VAGSTART_HZ) {
      const cell = v.matris[vid]?.[hz];
      if (cell !== null && cell !== undefined) ut.push(cell);
    }
  }
  return ut;
}

/** Andel impulsvågor av bedömda celler (osatta celler hopphas — aldrig gissa). */
function beraknaFundamentalVagstart(celler: number[]): number | null {
  if (celler.length < MIN_VAGSTART_CELLER) return null;
  const impulsvagor = celler.filter((c) => c > 0).length;
  return (100 * impulsvagor) / celler.length;
}

/** Fundamental riktning på mikro+kort: +1 impulsvåg överväger, −1 korrigering, 0 oavgjort. */
function fundamentalRiktning(celler: number[]): -1 | 0 | 1 {
  const imp = celler.filter((c) => c > 0).length;
  const korr = celler.filter((c) => c < 0).length;
  if (imp > korr) return 1;
  if (korr > imp) return -1;
  return 0;
}

// ── Dimension 4 + divergens-underlag: prisvågornas läge (vager + matris25) ──

/** Basbygge/korrigering = högt (vi är tidiga); impulsvåg = 0 (tåget gått). */
function beraknaPrisVaglage(a: TickerAnalys | null): number | null {
  if (!a || a.fel) return null;
  let vagerDel: number | null = null;
  if (a.vager) {
    const poang: number[] = [];
    for (const hz of HORIZONTER) {
      const klass = a.vager[hz];
      if (klass && klass !== "osatt" && klass in VAGLAGE_POANG) poang.push(VAGLAGE_POANG[klass]);
    }
    vagerDel = poang.length > 0 ? poang.reduce((s, x) => s + x, 0) / poang.length : null;
  }
  let matrisDel: number | null = null;
  if (a.matris25) {
    const celler = Object.values(a.matris25);
    if (celler.length > 0) {
      const bull = celler.filter((x) => x > 0).length;
      matrisDel = (100 * (celler.length - bull)) / celler.length;
    }
  }
  return viktatMedel([
    [vagerDel, VIKTER_PRISVAGLAGE.vager],
    [matrisDel, VIKTER_PRISVAGLAGE.matris25],
  ]);
}

/** Prisrikting över de fem horisonternas vågklasser: +1/−1/0. */
function prisRiktning(a: TickerAnalys | null): -1 | 0 | 1 {
  if (!a || a.fel || !a.vager) return 0;
  let imp = 0;
  let korr = 0;
  for (const hz of HORIZONTER) {
    const k = a.vager[hz];
    if (k === "impulsvåg") imp += 1;
    else if (k === "korrigering") korr += 1;
  }
  if (imp > korr) return 1;
  if (korr > imp) return -1;
  return 0;
}

// ── Dimension 5: divergens ───────────────────────────────────────────────────

/** fundament ▲ (+1) + pris ▼ (−1) = "positiv"; fundament ▼ + pris ▲ = "negativ". */
function beraknaDivergens(fund: -1 | 0 | 1, pris: -1 | 0 | 1): "positiv" | "negativ" | null {
  if (fund === 1 && pris === -1) return "positiv";
  if (fund === -1 && pris === 1) return "negativ";
  return null;
}

// ── Klasslogik (spec-exakt, gemensam för motor + självkontroll) ─────────────

/**
 * <3 källor → "Ingen bild".
 * konfluens ≥ 70 OCH vardgolv ≥ 50 OCH fundamentalVagstart ≥ 50 → "Konfluens".
 * vardgolv ≥ 50 men vågstart < 50 → "Värde men vågor sover".
 * vågstart ≥ 50 men vardgolv < 50 → "Vågor utan värdegolv".
 * Båda pelarna ≥ 50 men konfluens < 70, eller osatt pelare → null (ingen tydlig bild).
 */
function klassBestam(f: {
  vardgolv: number | null;
  fundamentalVagstart: number | null;
  konfluens: number | null;
  datakallor: number;
}): KonfluensKlass {
  if (f.datakallor < MIN_KALLOR_FOR_BILD) return "Ingen bild";
  const vg = f.vardgolv;
  const vs = f.fundamentalVagstart;
  const kf = f.konfluens;
  if (kf !== null && kf >= KONFLUENS_TROSKEL && vg !== null && vg >= PELARE_TROSKEL && vs !== null && vs >= PELARE_TROSKEL) {
    return "Konfluens — värde möter vändande vågor";
  }
  if (vg !== null && vg >= PELARE_TROSKEL && vs !== null && vs < PELARE_TROSKEL) {
    return "Värde men vågor sover";
  }
  if (vs !== null && vs >= PELARE_TROSKEL && vg !== null && vg < PELARE_TROSKEL) {
    return "Vågor utan värdegolv";
  }
  return null;
}

// ── Per-ticker: tre motorer parallellt (allSettled — fel dödar aldrig raden) ─

async function analyseraKonfluensRad(ticker: string): Promise<KonfluensRad> {
  const [netnetR, analysR, vagfundamentR] = await Promise.allSettled([
    skannaNetnet([ticker]),
    körAnalysMotor({ tickers: [ticker] }),
    körVagfundament({ tickers: [ticker] }),
  ]);
  const n = netnetR.status === "fulfilled" ? netnetR.value[0] ?? null : null;
  const a = analysR.status === "fulfilled" ? analysR.value.tickers[0] ?? null : null;
  const v = vagfundamentR.status === "fulfilled" ? vagfundamentR.value.tickers[0] ?? null : null;

  // Oberoende källor som faktiskt levererade användbar data (0–3)
  const kallaNetnet = n !== null && (n.forhallande !== null || n.ncavPerAktie !== null || n.pe !== null || n.pb !== null);
  const kallaAnalys = a !== null && !a.fel && !!a.vager;
  const kallaVagfundament = v !== null && !v.fel && !!v.matris;
  const datakallor = (kallaNetnet ? 1 : 0) + (kallaAnalys ? 1 : 0) + (kallaVagfundament ? 1 : 0);

  // Fem dimensioner (heltal 0–100 eller null = osatt)
  const celler = vagfundamentCeller(v);
  const vardgolv = heltal(beraknaVardgolv(n, a));
  const kvalitet = heltal(beraknaKvalitet(a));
  const fundamentalVagstart = heltal(beraknaFundamentalVagstart(celler));
  const prisVaglage = heltal(beraknaPrisVaglage(a));
  const divergens = beraknaDivergens(fundamentalRiktning(celler), prisRiktning(a));

  // Viktad totalsumma ur de AVRUNDADE dimensionerna (reproducerbar ur synliga tal).
  // Minst MIN_DIMENSIONER_FOR_KONFLUENS dimensioner krävs — annars osatt.
  const divergensDel = divergens !== null ? DIVERGENS_POANG[divergens] : null;
  const antalDimensioner = [vardgolv, kvalitet, fundamentalVagstart, prisVaglage, divergensDel]
    .filter((x) => x !== null).length;
  const konfluens = antalDimensioner >= MIN_DIMENSIONER_FOR_KONFLUENS
    ? heltal(viktatMedel([
        [vardgolv, VIKT_VARDGOLV],
        [kvalitet, VIKT_KVALITET],
        [fundamentalVagstart, VIKT_VAGSTART],
        [prisVaglage, VIKT_PRISVAGLAGE],
        [divergensDel, VIKT_DIVERGENS],
      ]))
    : null;

  const klass = klassBestam({ vardgolv, fundamentalVagstart, konfluens, datakallor });
  const namn = n?.namn || a?.namn || undefined;

  return {
    ticker,
    ...(namn !== undefined ? { namn } : {}),
    vardgolv,
    kvalitet,
    fundamentalVagstart,
    prisVaglage,
    divergens,
    konfluens,
    klass,
    datakallor,
  };
}

// ── Ingång: skanna (max 10 tickers, resultat i indataordning) ────────────────

/**
 * Skanna upp till MAX_TICKER_KONFLUENS (10) tickers. Per ticker körs de tre
 * motorerna parallellt med Promise.allSettled — en källas fel dödar aldrig
 * raden. Deterministisk: samma indata → samma utdata (givet samma marknadsdata).
 */
export async function skannaKonfluens(tickers: string[]): Promise<KonfluensRad[]> {
  const lista = (tickers ?? []).slice(0, MAX_TICKER_KONFLUENS);
  const resultat: KonfluensRad[] = new Array(lista.length);
  let nast = 0;
  const arbetare = Array.from({ length: Math.min(PARALLELLA_TICKERS, lista.length) }, async () => {
    for (;;) {
      const i = nast++;
      if (i >= lista.length) break;
      resultat[i] = await analyseraKonfluensRad(lista[i]);
    }
  });
  await Promise.all(arbetare);
  return resultat;
}

// ── Självkontroll (inbyggt i modulen — ingen test-runner behövs) ────────────

/**
 * Deterministisk self-check av konfluensrader:
 *  - alla poängfält är null ELLER heltal i intervallet 0–100,
 *  - divergens/klass har giltiga värden,
 *  - datakallor är ett heltal 0–3,
 *  - klassen är konsistent med radens egna fält (trösklarna 70/50/3),
 *  - tickers är unika,
 *  - antal rader = antal tickers samt rätt ticker i rätt ordning (när tickers
 *    skickas med — skannaKonfluens-anropets indatalista).
 */
export function sjalvkontroll(rader: KonfluensRad[], tickers?: string[]): { ok: boolean; fel: string[] } {
  const fel: string[] = [];
  if (!Array.isArray(rader)) return { ok: false, fel: ["rader är inte en array"] };

  if (tickers) {
    if (rader.length !== tickers.length) {
      fel.push(`antal rader (${rader.length}) ≠ antal tickers (${tickers.length})`);
    }
    if (tickers.length > MAX_TICKER_KONFLUENS) {
      fel.push(`för många tickers (${tickers.length} > ${MAX_TICKER_KONFLUENS})`);
    }
    for (let i = 0; i < Math.min(rader.length, tickers.length); i++) {
      if (rader[i].ticker !== tickers[i]) {
        fel.push(`rad ${i}: ticker "${rader[i].ticker}" ≠ förväntad "${tickers[i]}"`);
      }
    }
  }

  if (new Set(rader.map((r) => r.ticker)).size !== rader.length) {
    fel.push("tickers är inte unika");
  }

  rader.forEach((rad, i) => {
    const p = `rad ${i} (${rad.ticker})`;
    if (typeof rad.ticker !== "string" || rad.ticker.length === 0) fel.push(`${p}: ticker saknas`);

    const kollaPoang = (namn: string, varde: number | null): void => {
      if (varde === null) return;
      if (typeof varde !== "number" || !Number.isInteger(varde)) {
        fel.push(`${p}: ${namn} är inte ett heltal (${String(varde)})`);
      } else if (varde < 0 || varde > 100) {
        fel.push(`${p}: ${namn} utanför 0–100 (${varde})`);
      }
    };
    kollaPoang("vardgolv", rad.vardgolv);
    kollaPoang("kvalitet", rad.kvalitet);
    kollaPoang("fundamentalVagstart", rad.fundamentalVagstart);
    kollaPoang("prisVaglage", rad.prisVaglage);
    kollaPoang("konfluens", rad.konfluens);

    if (rad.divergens !== null && rad.divergens !== "positiv" && rad.divergens !== "negativ") {
      fel.push(`${p}: ogiltig divergens (${String(rad.divergens)})`);
    }
    if (rad.klass !== null && !TILLATNA_KLASSER.has(rad.klass)) {
      fel.push(`${p}: ogiltig klass (${String(rad.klass)})`);
    }
    if (!Number.isInteger(rad.datakallor) || rad.datakallor < 0 || rad.datakallor > 3) {
      fel.push(`${p}: datakallor utanför 0–3 (${String(rad.datakallor)})`);
    }
    if (rad.namn !== undefined && (typeof rad.namn !== "string" || rad.namn.trim() === "")) {
      fel.push(`${p}: namn ska vara en icke-tom sträng eller utelämnad`);
    }
    const forvantadKlass = klassBestam({
      vardgolv: rad.vardgolv,
      fundamentalVagstart: rad.fundamentalVagstart,
      konfluens: rad.konfluens,
      datakallor: rad.datakallor,
    });
    if (rad.klass !== forvantadKlass) {
      fel.push(`${p}: klass "${String(rad.klass)}" stämmer inte med fälten (förväntad "${String(forvantadKlass)}")`);
    }
  });

  return { ok: fel.length === 0, fel };
}

/** Valideringsalias (self-check) — samma motor som sjalvkontroll. */
export const valideraKonfluens = sjalvkontroll;
