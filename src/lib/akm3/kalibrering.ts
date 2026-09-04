/**
 * AKM3 — KALIBRERING (r1-bayes · AKM3-BESLUT §8 "kalibrerings-cron" + §11 steg 6).
 *
 * LAGEN (AKM3-BESLUT §8 + r1-bayes.md, exakt):
 *   Prior:      p(fas) ~ Beta(α₀, β₀), α₀ = m·q(fas), β₀ = m·(1 − q(fas)), m = 10
 *               q ur Markov-priorerna (r1 §1.2): 0,65 / 0,50 / 0,45 / 0,46 / 0,40 / 0,34
 *   Posterior:  α = α₀ + T, β = β₀ + M  — T/M räknas PER EPISOD, ALDRIG per dag
 *               (FORBUD §10.7; r1 §2.1: dagar är inte observationer)
 *   p̂ = α/(α+β) · 90 %-kredibelt intervall ur Beta-kvantiler
 *   n_eff = episoder diskonterade med √(1/ρ̄), ρ̄ = medelkorrelation mellan
 *               universumets momentumserier (12 tickers ⇒ ~1–3 effektiva/dag)
 *   Φ-förslag = clamp(1 + κ_fas·(2p̂ − 1), 0,80, 1,20)
 *               κ = 0,20 för bekräftad/mogen impuls + korrigering_hog_g
 *               κ = 0,10 för obekräftad/korr_lag_g (r1 §1.2)
 *
 * HANDLINGSGRINDEN ÄR LÅST I AKM3.2026.09 (BESLUT §2: "VILLKORAD", §11 steg 6):
 * ΔΦ = 0 — ALWAYS. Denna modul SAMLAR bara data, ändrar ALDRIG. Grindens villkor
 * beräknas och rapporteras (true/false per fas) men Φ-förslaget blir aldrig en
 * ändring; status är "vantar-grind" tills dess att steg 7 (BESLUT §11.7: n_eff
 * ≥ 20 OCH kredibelt intervall helt ena sidan 0,50 OCH walk-forward netto-
 * förbättring OCH ny protokollversion + nollställda räknare + deklarerad orsak)
 * öppnar den via ett NYTT beslut. "osatt" kalibreras ALDRIG (FORBUD §9.6 —
 * Φ 1,00/0-bidrag är ett ärlighetskontrakt, inte en parameter).
 *
 * FAS-MAPPNING ur Bana B (dokumenterad tolkning, kalibrering/1 v1):
 *   Bana B:s rader (vagvalidering_dom, STYRELSE §3.2) har klass per (ticker,
 *   variabel, horisont) men INTE sekvens-n eller grundpoäng G. Därför:
 *   - impulsvåg  → sekvens-n proxieras med antal KVARTALSGRÄNSER episoden
 *                  spänner (episodens startdatum → sista dömda datum; snapshot-
 *                  cadensen är kvartalsvis, r3 §8.2): n = 1 → obekräftad,
 *                  n = 2–3 → bekräftad, n ≥ 4 → mogen (speglar bestamVagfas).
 *   - korrigering→ G saknas ⇒ fas osatt enligt KÄRNANS EGNA ärlighetsregel
 *                  (dynamik.ts: "grenen 0,80/0,90 kan inte väljas utan
 *                  gissning, alltså osatt"). Episoderna MÄTS och redovisas i
 *                  diagnostikpoolen korrigeringGOkand men matar ALDRIG
 *                  korrigering_hog_g/lag_g:s posteriors — tills en framtida
 *                  protokollversion levererar G per episod.
 *   - basbygge  → basbygge. osatt → osatt (mäts som täckning, kalibreras ej).
 *
 * RENA FUNKTIONER (P1 determinism): inga runtime-importer alls (ENDAST
 * `import type` från akm2/dynamik — raderas före runtime, noll koppling),
 * inget nätverk, inget fs, ingen klocka i utdata-styrd logik. Hash-digesten
 * INJICERAS som funktion (node:crypto i cron-rutten, samma sha256 i testet).
 * Byggreglerna följs: fil-domän src/lib/akm3/, Φ_DESIGN speglar dynamik.ts:s
 * PHI som LOKAL konstant (samma mönster som ZETA i dynamik.ts) — testet
 * vaktar att speglingen aldrig glider isär.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

import type { Vagfas } from "../akm2/dynamik";

// ── Konstanter (fasta, dokumenterade — lagen före första körningen) ──────────

/** system_events-radens details.schema för type=akm3_kalibrering. */
export const KALIBRERING_SCHEMA = "kalibrering/1";

/** Protokollversion — höjs endast dokumenterat (en ändring per version). */
export const KALIBRERING_PROTOKOLL_VERSION = 1;

/**
 * Clean by construction (FORBUD §10.5): kalibrering på data från FÖRE
 * 2026-09-04 (kitets driftstart; design Φ är 2026-09-03) är FÖRBJUDEN —
 * retroaktiv klassning mördar backtest-ärligheten.
 */
export const KALIBRERING_CLEAN_FRAN = "2026-09-04";

/** Semantisk modellversion (samma stämpel som ensemblen). */
export const KALIBRERING_MODELL = "AKM3.2026.09";

/** Den SITTANDE Φ-tabellen: designen från 2026-09-03 (r3 §5.2) — oförändrad. */
export const PHI_VERSION_NUVARANDE = "design-2026-09-03";

/** De sex kalibrerbara faserna — osatt är per definition fri från justering. */
export type KalibrerbarFas = Exclude<Vagfas, "osatt">;

/** Kanonisk fas-ordning (samma som Vagfas-unionen i dynamik.ts, osatt sist). */
export const KALIBRERBARA_FASER: readonly KalibrerbarFas[] = [
  "impulsvag_bekraftad",
  "impulsvag_obekraftad",
  "impulsvag_mogen",
  "basbygge",
  "korrigering_hog_g",
  "korrigering_lag_g",
];

/** Priorstyrka m = 10 (r1 §1.2 — Beta(α₀ = m·q, β₀ = m·(1−q))). */
export const PRIOR_STYRKA_M = 10;

/**
 * q(fas) — prior-medelvärdena ur Markov-priorerna (r1 §1.2 EXAKT):
 *   impulsvåg_bekräftad 0,65 (T_trög P(imp→imp); snabb: 0,50)
 *   impulsvåg_obekräftad 0,50 (n=1 vilar på tillit, inte bevis)
 *   impulsvåg_mogen 0,45 (designens Daniel–Moskowitz-varning: fallande)
 *   korrigering_hog_g 0,46 (T_snabb P(korr→korr))
 *   korrigering_lag_g 0,40 (reversion snabbare under medel — Fama–French 2000)
 *   basbygge 0,34 (T_snabb P(bas→bas) — övergångsläge, aldrig hem)
 */
export const Q_PRIOR: Readonly<Record<KalibrerbarFas, number>> = {
  impulsvag_bekraftad: 0.65,
  impulsvag_obekraftad: 0.5,
  impulsvag_mogen: 0.45,
  basbygge: 0.34,
  korrigering_hog_g: 0.46,
  korrigering_lag_g: 0.4,
};

/**
 * κ per fas (r1 §1.2 EXAKT): 0,20 för bekräftad/mogen impuls och
 * korrigering_hog_g · 0,10 för obekräftad/korr_lag_g. basbygge saknar κ i r1 —
 * dokumenterad tolkning: minsta dokumenterade κ (0,10) används i FÖRSLAGET;
 * grinden är ändå låst så ingen Φ påverkas förrän ett steg 7-beslut finns.
 */
export const KAPPA: Readonly<Record<KalibrerbarFas, number>> = {
  impulsvag_bekraftad: 0.2,
  impulsvag_mogen: 0.2,
  korrigering_hog_g: 0.2,
  impulsvag_obekraftad: 0.1,
  korrigering_lag_g: 0.1,
  basbygge: 0.1,
};

/**
 * Φ-design-tabellen — LOKAL spegling av PHI i akm2/dynamik.ts (F1–F8, r3 §5.2).
 * Avvikelse mot originalet är en bugg och vaktas av testet (samma mönster som
 * dynamik.ts:s ZETA-spegling av HORIZONTER_VIKT).
 */
export const PHI_DESIGN: Readonly<Record<Vagfas, number>> = {
  impulsvag_bekraftad: 1.2,
  impulsvag_obekraftad: 1.1,
  impulsvag_mogen: 1.2,
  basbygge: 1.0,
  korrigering_hog_g: 0.8,
  korrigering_lag_g: 0.9,
  osatt: 1.0,
};

/** Φ-taken (r1 §1.2 / BESLUT §8): clamp(·, 0,80, 1,20). */
export const PHI_NEDRE = 0.8;
export const PHI_OVRE = 1.2;

/** Handlingsgrind (i): n_eff ≥ 20 EPISODER (diskonterade — aldrig nominellt n). */
export const N_EFF_KRAV = 20;

/** Handlingsgrind (ii): 90 %-kredibelt intervall helt på ena sidan 0,50. */
export const KREDIBELT_NIVA = 0.9;

/** Handlingsgrind (iii): rate-limit — max ±0,05 i Φ per fas och månad. */
export const RATE_LIMIT_PER_MANAD = 0.05;

/**
 * ρ̄ — medelkorrelation mellan universumets momentumserier. Kan inte skattas
 * (för få gemensamma dagar) ⇒ dokumenterad default 0,45 (mitt i r1:s
 * förväntade spann 0,3–0,6). Skattningen clampas till [0,05, 0,95].
 */
export const RHO_DEFAULT = 0.45;
export const RHO_MIN = 0.05;
export const RHO_MAX = 0.95;

/** GRINDEN ÄR LÅST i AKM3.2026.09 — ΔΦ = 0 (BESLUT §2 + §11 steg 6). */
export const GRIND_LASAD = true;

/** Handlingsgrindens villkor, exakt text (rapport + event + logg). */
export const HANDLINGSGRIND_TEXT =
  "Handlingsgrind (ALLA krävs för att Φ ska få ändras): (i) n_eff ≥ 20 episoder per fas " +
  "(tvärsnittsdiskonterade — aldrig nominellt n), (ii) 90 %-kredibelt intervall helt på ena " +
  "sidan 0,50, (iii) rate-limit max ±0,05 i Φ per fas och månad. Därtill kräver en ändring " +
  "steg 7 (AKM3-BESLUT §11.7): walk-forward nettoförbättring mot sittande tabell, ny " +
  "protokollversion, nollställda räknare och deklarerad orsak. I AKM3.2026.09 är grinden " +
  "LÅST: ΔΦ = 0 — cronen samlar bara data.";

/** Automatisk återkallning (FORBUD §10.11 — kodat kontrakt, se bordeAterkalla). */
export const ROLLBACK_REGEL_TEXT =
  "Automatisk återkallning är KONTRAKT: ligger träffen för faser med ny Φ mer än 5 " +
  "procentenheter LÄGRE än gamla tabellens inom 90 dagar efter främjandet (n_eff ≥ 30) ⇒ " +
  "rulla tillbaka och publicera \"version X återkallad öppet\" (r4 §8.2-formen). " +
  "Dokumenterad regimepause fryser kalibreringen (ΔΦ = 0 tills vidare).";

// ── Beta-matematik (deterministisk, inga beroenden) ──────────────────────────

/** Lanczos-koefficienter (g = 7, n = 9) — standarduppsättningen. */
const LANCZOS_G = 7;
const LANCZOS_KOEFF = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

/** ln Γ(x) för x > 0 (Lanczos-approximation — deterministisk). */
export function lnGamma(x: number): number {
  if (x < 0.5) {
    // reflektionsformeln: Γ(x)Γ(1−x) = π/sin(πx)
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  }
  const z = x - 1;
  let a = LANCZOS_KOEFF[0];
  const t = z + LANCZOS_G + 0.5;
  for (let i = 1; i < LANCZOS_KOEFF.length; i += 1) a += LANCZOS_KOEFF[i] / (z + i);
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

/** ln B(a, b). */
export function lnBeta(a: number, b: number): number {
  return lnGamma(a) + lnGamma(b) - lnGamma(a + b);
}

/** Fortsatt bråk för den regulariserade ofullständiga betafunktionen (NR §6.4). */
function betacf(a: number, b: number, x: number): number {
  const FPMIN = 1e-300;
  const MAXIT = 300;
  const EPS = 3e-16;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m += 1) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Regulariserad ofullständig betafunktion I_x(a, b) = P(X ≤ x), X ~ Beta(a, b). */
export function betaCdf(x: number, a: number, b: number): number {
  if (!(a > 0) || !(b > 0) || !Number.isFinite(x)) return Number.NaN;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lnBt =
    lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x);
  const bt = Math.exp(lnBt);
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/**
 * Beta-kvantil via deterministisk bisektion (200 iterationer ⇒ precision
 * ~ 2⁻²⁰⁰ — långt under visningsprecision; inget slumpmoment i flödet).
 */
export function betaKvantil(p: number, a: number, b: number): number {
  if (!(p > 0) || !(p < 1) || !(a > 0) || !(b > 0)) return Number.NaN;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    if (betaCdf(mid, a, b) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ── Posterior + Φ-förslag (r1 §1.2 exakt) ────────────────────────────────────

/** Beta-posterior per (cell): prior ur q + episodräknade T/M. */
export type BetaPosterior = {
  /** Priorstyrka m (dokumenterad i resultatet — granskningsbar). */
  m: number;
  /** Prior-medelvärde q(fas). */
  q: number;
  alpha0: number;
  beta0: number;
  /** α = α₀ + T. */
  alpha: number;
  /** β = β₀ + M. */
  beta: number;
  /** Antal träff-episoder. */
  T: number;
  /** Antal miss-episoder. */
  M: number;
  /** p̂ = α/(α+β) — posterior-medelvärdet. */
  pHat: number;
  /** 90 %-kredibelt intervall [5 %, 95 %] ur Beta-kvantiler. */
  kredibeltIntervall90: [number, number];
};

/**
 * POSTERIOR per rond (r1 §1.2): α = α₀ + T, β = β₀ + M med
 * α₀ = m·q, β₀ = m·(1−q), m = 10. T/M EPISODER — aldrig dagar (FORBUD §10.7).
 */
export function betaPosterior(q: number, T: number, M: number, m = PRIOR_STYRKA_M): BetaPosterior {
  const qK = Math.min(0.99, Math.max(0.01, Number.isFinite(q) ? q : 0.5));
  const tK = Math.max(0, Math.floor(T));
  const mK = Math.max(0, Math.floor(M));
  const alpha0 = m * qK;
  const beta0 = m * (1 - qK);
  const alpha = alpha0 + tK;
  const beta = beta0 + mK;
  return {
    m,
    q: qK,
    alpha0,
    beta0,
    alpha,
    beta,
    T: tK,
    M: mK,
    pHat: alpha / (alpha + beta),
    kredibeltIntervall90: [
      betaKvantil((1 - KREDIBELT_NIVA) / 2, alpha, beta),
      betaKvantil(1 - (1 - KREDIBELT_NIVA) / 2, alpha, beta),
    ],
  };
}

/**
 * Φ-förslag (r1 §1.2): clamp(1 + κ·(2p̂ − 1), 0,80, 1,20).
 * p̂ = 0,50 ⇒ Φ = 1,00 (myntverk tystnar av sig själv). FÖRSLAG — aldrig
 * ändring: grinden är låst i AKM3.2026.09 (se grindBeslut).
 */
export function phiFranPosterior(pHat: number, kappa: number): number {
  if (!Number.isFinite(pHat) || !Number.isFinite(kappa)) return 1;
  const rå = 1 + kappa * (2 * pHat - 1);
  return Math.round(Math.min(PHI_OVRE, Math.max(PHI_NEDRE, rå)) * 1000) / 1000;
}

// ── ρ̄-skattning + n_eff (r1 §2.1 exakt) ─────────────────────────────────────

/**
 * Pearson-korrelation mellan två serier av gemensamma dagar (deterministisk:
 * dagarna sorteras; minst `minDagar` gemensamma för att räknas).
 */
export function pearson(xd: Record<string, number>, yd: Record<string, number>, minDagar = 3): number | null {
  const dagar = Object.keys(xd)
    .filter((d) => d in yd && Number.isFinite(xd[d]) && Number.isFinite(yd[d]))
    .sort();
  if (dagar.length < minDagar) return null;
  const xs = dagar.map((d) => xd[d]);
  const ys = dagar.map((d) => yd[d]);
  const n = dagar.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx <= 0 || syy <= 0) return null; // konstant serie bär ingen korrelation
  return sxy / Math.sqrt(sxx * syy);
}

/** Resultatet av ρ̄-skattningen (källa redovisas alltid — aldrig påhittad tal). */
export type RhoSkattning = {
  rho: number;
  /** Antal tickerpar som kunnat skattas (0 ⇒ defaultvärdet används). */
  par: number;
  /** true ⇒ RHO_DEFAULT används (för få par — hederligt deklarerat). */
  fallback: boolean;
};

/**
 * Skattar ρ̄ = medelkorrelation mellan universumets momentumserier ur Bana B:s
 * celler: varje cell är (variabel, horisont) → ticker → (traffDatum → momentum).
 * Parvisa Pearson-korrelationer per cell (≥ 3 gemensamma dagar), medel över
 * alla par. Färre än 10 par ⇒ fallback 0,45 (r1:s dokumenterade mittvärde).
 */
export function skattaRho(
  celler: ReadonlyArray<Readonly<Record<string, Readonly<Record<string, number>>>>>,
  minPar = 10,
): RhoSkattning {
  let summa = 0;
  let par = 0;
  for (const cell of Array.isArray(celler) ? celler : []) {
    const tickers = Object.keys(cell ?? {}).sort();
    for (let i = 0; i < tickers.length; i += 1) {
      for (let j = i + 1; j < tickers.length; j += 1) {
        const r = pearson(cell[tickers[i]] as Record<string, number>, cell[tickers[j]] as Record<string, number>);
        if (typeof r === "number" && Number.isFinite(r)) {
          summa += r;
          par += 1;
        }
      }
    }
  }
  if (par < minPar) return { rho: RHO_DEFAULT, par, fallback: true };
  const medel = summa / par;
  return { rho: Math.min(RHO_MAX, Math.max(RHO_MIN, medel)), par, fallback: false };
}

/**
 * n_eff (r1 §2.1 EXAKT): episoder diskonterade med √(1/ρ̄) —
 *   n_eff = ⌊episoder / √(1/ρ̄)⌋
 * ρ̄ 0,3–0,6 ⇒ faktor ~1,4–1,8 (12 makrokorrelerade tickers ⇒ tvärsnittet
 * bär ~1–3 effektiva observationer per dag). Avrundning: golv (konservativt).
 */
export function nEffFranEpisoder(episoder: number, rho: number): number {
  const n = Number.isFinite(episoder) && episoder > 0 ? episoder : 0;
  const rhoK = Math.min(RHO_MAX, Math.max(RHO_MIN, Number.isFinite(rho) ? rho : RHO_DEFAULT));
  return Math.floor(n / Math.sqrt(1 / rhoK));
}

/** Effektiva observationer per dag ur ρ̄ (≈ 1/ρ̄) — rapportens kontexttal. */
export function effektivaPerDag(rho: number): number {
  const rhoK = Math.min(RHO_MAX, Math.max(RHO_MIN, Number.isFinite(rho) ? rho : RHO_DEFAULT));
  return Math.round((1 / rhoK) * 10) / 10;
}

// ── Episodräkning (Bana B → episoder → fas) ─────────────────────────────────

/** En processad Bana B-rad (cronen har räknat om domen ur radens egna fält). */
export type KalibreringDomRad = {
  ticker: string;
  variabel: string;
  horisont: string;
  /** Klass med å (impulsvåg/korrigering/basbygge/osatt). */
  klass: string;
  /** Episodidentitet ur vagvalidering_dom.episod_id (ärvd vid oförändrad klass). */
  episodId: string;
  /** Episodens startdatum (YYYY-MM-DD) — sista segmentet i episod_id. */
  episodStartDatum: string;
  /** Domen för raden: "traff" | "miss" | "osatt" (osatt döms ALDRIG). */
  dom: "traff" | "miss" | "osatt";
  /** Radens mätdatum (traff_datum, YYYY-MM-DD). */
  traffDatum: string;
};

/** En avgränsad episod — ENHETEN (dagar räknas ALDRIG som observationer). */
export type Episod = {
  episodId: string;
  ticker: string;
  variabel: string;
  horisont: string;
  klass: string;
  startDatum: string;
  sistaDatum: string;
  /** Antal dömda rader (traff + miss) i episoden. */
  domdaRader: number;
  traff: number;
  miss: number;
  /** Episodens sammanvägda dom: majoriteten av de dömda raderna
   *  (lika många ⇒ osatt — episoden vittnar inte om någon kant). */
  dom: "traff" | "miss" | "osatt";
  /** Fas enligt mappningen (impuls: kvartalsspann; korrigering: osatt utan G). */
  fas: Vagfas;
};

/** Kvartalsindex (år·4 + kvartal) ur YYYY-MM-DD; ogiltigt ⇒ null. */
function kvartalsIndex(datum: string): number | null {
  if (typeof datum !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) return null;
  const ar = Number(datum.slice(0, 4));
  const manad = Number(datum.slice(5, 7));
  if (!Number.isFinite(ar) || !Number.isFinite(manad) || manad < 1 || manad > 12) return null;
  return ar * 4 + Math.ceil(manad / 3);
}

/**
 * Fas ur (klass, episodens start- och slutdatum) — dokumenterad tolkning:
 * impulsvåg ⇒ sekvens-proxy n = 1 + antal kvartalsgränser episoden spänner
 * (n=1 obekräftad · n≥2 bekräftad · n≥4 mogen — speglar bestamVagfas);
 * korrigering ⇒ osatt (G saknas i Bana B — kärnans egen regel); basbygge ⇒
 * basbygge; övrigt ⇒ osatt.
 */
export function fasFranEpisod(klass: string, startDatum: string, sistaDatum: string): Vagfas {
  if (klass === "basbygge") return "basbygge";
  if (klass === "impulsvåg") {
    const qiStart = kvartalsIndex(startDatum);
    const qiSlut = kvartalsIndex(sistaDatum);
    const diff = qiStart !== null && qiSlut !== null ? Math.max(0, qiSlut - qiStart) : 0;
    const n = 1 + diff;
    if (n >= 4) return "impulsvag_mogen";
    if (n >= 2) return "impulsvag_bekraftad";
    return "impulsvag_obekraftad";
  }
  return "osatt"; // korrigering utan G + okänd klass — aldrig gissning
}

/**
 * EPISODRÄKNAREN (r1 §5): grupperar Bana B-rader till episoder (deduplicerat
 * per episodId+traffDatum — samma episod dyker upp i varje dags event), sorterar
 * kanoniskt (episodId, traffDatum), dömer episoden med majoritetsregeln och
 * attribuerar fas. Ren funktion: lämnar indata orörd.
 */
export function episodRaknare(rader: readonly KalibreringDomRad[] | null | undefined): Episod[] {
  // Deduplicering: samma (episod, dag) får bara räknas en gång.
  const setta = new Map<string, KalibreringDomRad>();
  for (const r of Array.isArray(rader) ? rader : []) {
    if (!r || typeof r.episodId !== "string" || r.episodId === "") continue;
    const nyckel = `${r.episodId}|${r.traffDatum}`;
    if (!setta.has(nyckel)) setta.set(nyckel, r);
  }
  const sorterade = [...setta.values()].sort((a, b) =>
    a.episodId < b.episodId ? -1 : a.episodId > b.episodId ? 1 : a.traffDatum < b.traffDatum ? -1 : 1,
  );

  const ut: Episod[] = [];
  let aktuell: Episod | null = null;
  for (const r of sorterade) {
    if (!aktuell || aktuell.episodId !== r.episodId) {
      aktuell = {
        episodId: r.episodId,
        ticker: r.ticker,
        variabel: r.variabel,
        horisont: r.horisont,
        klass: r.klass,
        startDatum: r.episodStartDatum,
        sistaDatum: r.traffDatum,
        domdaRader: 0,
        traff: 0,
        miss: 0,
        dom: "osatt",
        fas: "osatt",
      };
      ut.push(aktuell);
    }
    aktuell.sistaDatum = r.traffDatum > aktuell.sistaDatum ? r.traffDatum : aktuell.sistaDatum;
    if (r.dom === "traff") aktuell.traff += 1;
    else if (r.dom === "miss") aktuell.miss += 1;
  }
  for (const e of ut) {
    e.domdaRader = e.traff + e.miss;
    e.dom = e.traff > e.miss ? "traff" : e.miss > e.traff ? "miss" : "osatt";
    e.fas = fasFranEpisod(e.klass, e.startDatum, e.sistaDatum);
  }
  return ut;
}

// ── Handlingsgrinden — villkor + LÅST beslut ────────────────────────────────

/** Grindens tre villkor, beräknade (true/false) — redovisas alltid öppet. */
export type GrindVillkor = {
  /** (i) n_eff ≥ 20 episoder. */
  nEff20: boolean;
  /** (ii) 90 %-kredibelt intervall helt på ena sidan 0,50. */
  intervallKlart: boolean;
  /** (iii) |Φ-förslag − Φ sittande| ≤ 0,05 (rate-limit per fas och månad). */
  rateLimit: boolean;
};

/** Det grinden skulle bestämma OM den vore öppen — ren, testbar funktion. */
export type GrindBedomning = {
  villkor: GrindVillkor;
  /** true endast om ALLA tre villkoren är uppfyllda. */
  allaVillkorUppfyllda: boolean;
  /**
   * Det FATTADE beslutet: false i AKM3.2026.09 — GRIND_LASAD (BESLUT §11
   * steg 6: ΔΦ=0 tills grinden öppnas via steg 7:s nya protokollbeslut).
   */
  oppna: boolean;
  /** Alltid 0 i denna version — Φ ändras ALDRIG av cronen. */
  deltaPhi: number;
  /** Standardutdata (r1 §1.2: "aldrig en fejkad siffra"). */
  status: string;
};

/** (ii): intervallet ligger HELT på ena sidan 0,50 (strikt — inte över/under). */
export function intervallKlartFranKlart(ki: readonly [number, number]): boolean {
  return ki[1] < 0.5 || ki[0] > 0.5;
}

/**
 * Grindbeslutet (r1 §1.2 "uppdatera ≠ agera" + BESLUT §8):
 * villkoren beräknas och rapporteras — men GRIND_LASAD gör att oppna är
 * false och deltaPhi är 0 ALLTID i AKM3.2026.09. Status "vantar-grind" är
 * standardutdata; texten "okalibrerad (n=X/20)" kompletterar i rapporten.
 */
export function grindBeslut(s: {
  nEff: number;
  kredibeltIntervall90: readonly [number, number];
  phiForslag: number;
  phiSittande: number;
}): GrindBedomning {
  const villkor: GrindVillkor = {
    nEff20: s.nEff >= N_EFF_KRAV,
    intervallKlart: intervallKlartFranKlart(s.kredibeltIntervall90),
    rateLimit: Math.abs(s.phiForslag - s.phiSittande) <= RATE_LIMIT_PER_MANAD + 1e-9,
  };
  const allaVillkorUppfyllda = villkor.nEff20 && villkor.intervallKlart && villkor.rateLimit;
  return {
    villkor,
    allaVillkorUppfyllda,
    oppna: GRIND_LASAD ? false : allaVillkorUppfyllda, // låst ⇒ aldrig öppen
    deltaPhi: 0,
    status: "vantar-grind",
  };
}

/**
 * BARA för simulering/test (acceptans §11.6.ii): hade grinden varit upplåst
 * hade den öppnat exakt vid n_eff ≥ 20 med övriga villkor uppfyllda.
 * Används INTE av cronen — grindBeslut ovan är det verkliga beslutet.
 */
export function bordeGrindenOppnas(s: {
  nEff: number;
  kredibeltIntervall90: readonly [number, number];
  phiForslag: number;
  phiSittande: number;
}): boolean {
  return (
    s.nEff >= N_EFF_KRAV &&
    intervallKlartFranKlart(s.kredibeltIntervall90) &&
    Math.abs(s.phiForslag - s.phiSittande) <= RATE_LIMIT_PER_MANAD + 1e-9
  );
}

/**
 * Automatisk återkallning (FORBUD §10.11, kodat kontrakt): träff för faser
 * med ny Φ mer än 5 procentenheter LÄGRE än gamla tabellens inom 90 dagar
 * efter främjandet (n_eff ≥ 30) ⇒ rulla tillbaka + publicera öppet.
 */
export function bordeAterkalla(s: {
  traffNyProcent: number;
  traffGammalProcent: number;
  dagarSedanFramjande: number;
  nEff: number;
}): boolean {
  return (
    s.dagarSedanFramjande <= 90 &&
    s.nEff >= 30 &&
    s.traffGammalProcent - s.traffNyProcent > 5
  );
}

// ── Fasstatistik (nivå 1: global träff per fas) + per variabel (rå) ─────────

/** En fas cell i rondens sammanställning — allt rapporten och eventet visar. */
export type FasStatistik = {
  fas: KalibrerbarFas;
  posterior: BetaPosterior;
  /** Antal episoder (T + M) som matat cellen. */
  episoder: number;
  /** Diskonterat antal effektiva episoder (tvärsnittskorrelation). */
  nEff: number;
  /** Φ-förslag — ALDRIG ändring (grinden låst). */
  phiForslag: number;
  /** Sittande Φ (design-tabellen i 2026.09). */
  phiSittande: number;
  kappa: number;
  grind: GrindBedomning;
  /** "okalibrerad (n=X/20)" — standardutdata, aldrig fejkad siffra. */
  statusText: string;
};

/** Statistik per fas (nivå 1) ur episoder + ρ̄. Ren funktion. */
export function raknaFasStatistik(
  episoder: readonly Episod[] | null | undefined,
  rho: number,
): Record<KalibrerbarFas, FasStatistik> {
  const ut = {} as Record<KalibrerbarFas, FasStatistik>;
  for (const fas of KALIBRERBARA_FASER) {
    const t = (Array.isArray(episoder) ? episoder : []).filter((e) => e.fas === fas && e.dom === "traff").length;
    const m = (Array.isArray(episoder) ? episoder : []).filter((e) => e.fas === fas && e.dom === "miss").length;
    const posterior = betaPosterior(Q_PRIOR[fas], t, m);
    const nEff = nEffFranEpisoder(t + m, rho);
    const phiForslag = phiFranPosterior(posterior.pHat, KAPPA[fas]);
    const grind = grindBeslut({
      nEff,
      kredibeltIntervall90: posterior.kredibeltIntervall90,
      phiForslag,
      phiSittande: PHI_DESIGN[fas],
    });
    ut[fas] = {
      fas,
      posterior,
      episoder: t + m,
      nEff,
      phiForslag,
      phiSittande: PHI_DESIGN[fas],
      kappa: KAPPA[fas],
      grind,
      statusText: `okalibrerad (n=${nEff}/${N_EFF_KRAV}) — vantar-grind`,
    };
  }
  return ut;
}

/** Rå nivå-3-rad: per (variabel, fas) — rapportering, ALDRIG grind eller Φ. */
export type VariabelFasRad = {
  variabel: string;
  fas: KalibrerbarFas;
  traff: number;
  miss: number;
  episoder: number;
  pHat: number;
};

/** Per (variabel, fas): episoder, T/M och posterior-medel — rå presentation. */
export function raknaVariabelFasRader(
  episoder: readonly Episod[] | null | undefined,
): VariabelFasRad[] {
  const nyckel = (v: string, f: KalibrerbarFas) => `${v}|${f}`;
  const karta = new Map<string, VariabelFasRad>();
  for (const e of Array.isArray(episoder) ? episoder : []) {
    if (!e || e.dom === "osatt") continue;
    const fas = e.fas;
    if (!(KALIBRERBARA_FASER as readonly string[]).includes(fas)) continue;
    const k = nyckel(e.variabel, fas as KalibrerbarFas);
    const rad =
      karta.get(k) ??
      ({ variabel: e.variabel, fas: fas as KalibrerbarFas, traff: 0, miss: 0, episoder: 0, pHat: 0 } as VariabelFasRad);
    if (e.dom === "traff") rad.traff += 1;
    else rad.miss += 1;
    rad.episoder += 1;
    karta.set(k, rad);
  }
  const fasRank = new Map(KALIBRERBARA_FASER.map((f, i) => [f as string, i]));
  return [...karta.values()]
    .map((r) => ({
      ...r,
      pHat: betaPosterior(Q_PRIOR[r.fas], r.traff, r.miss).pHat,
    }))
    .filter((r) => r.episoder > 0)
    .sort(
      (a, b) =>
        a.variabel < b.variabel ? -1 : a.variabel > b.variabel ? 1 : (fasRank.get(a.fas) ?? 99) - (fasRank.get(b.fas) ?? 99),
    );
}

// ── Hash-kedjad versionslogg (append-only — BARA mätningar, aldrig Φ-svar) ──

/** En loggad månadmätning — typ "matning": ΔΦ är alltid 0 i rader av denna typ. */
export type KalibreringLoggRad = {
  version: number;
  typ: "matning";
  manad: string;
  datum: string;
  genererad: string;
  schema: string;
  protokollVersion: number;
  modell: string;
  /** Sittande Φ-version vid mätningen (oförändrad "design-2026-09-03" i 2026.09). */
  phiVersion: string;
  grindLasad: boolean;
  /** ALLTID 0 i kalibrering/1 v1 — loggen bär mätningar, aldrig ändringar. */
  deltaPhi: number;
  cleanFran: string;
  domRader: number;
  episoderTotalt: number;
  rho: number;
  rhoKalla: string;
  effektivaPerDag: number;
  faser: Record<KalibrerbarFas, KalibreringLoggFasRad>;
  osattEpisoder: number;
  /** Episoder som inte kunde dömas (lika många träff som miss — vittnade inte). */
  odomdaEpisoder: number;
  korrigeringGOkand: { episoder: number; traff: number; miss: number };
  rollbackRegel: string;
  prevHash: string | null;
  hash: string;
};

/** Fas-raden i loggen (komprimerad — fulla posteriors finns i system_events). */
export type KalibreringLoggFasRad = {
  T: number;
  M: number;
  episoder: number;
  nEff: number;
  pHat: number;
  kredibeltIntervall90: [number, number];
  phiForslag: number;
  phiSittande: number;
  villkor: GrindVillkor;
  status: string;
};

/** Loggfilens form (append-only; senasteHash = sista radens hash). */
export type KalibreringLogg = {
  schema: string;
  protokollVersion: number;
  skapad?: string;
  rader: KalibreringLoggRad[];
  senasteHash?: string;
};

/**
 * Kanonisk JSON-serialisering (rekursivt sorterade nycklar) — hashens
 * deterministiska underlag: samma objekt ⇒ alltid samma sträng.
 */
export function kanoniskJson(x: unknown): string {
  if (x === null || x === undefined) return "null";
  if (typeof x !== "object") return JSON.stringify(x);
  if (Array.isArray(x)) return "[" + x.map((v) => kanoniskJson(v)).join(",") + "]";
  const obj = x as Record<string, unknown>;
  return (
    "{" +
    Object.keys(obj)
      .sort()
      .map((k) => JSON.stringify(k) + ":" + kanoniskJson(obj[k]))
      .join(",") +
    "}"
  );
}

/** Radens hash: sha-256 över den kanoniska raden UTAN hash-fältet (med prevHash). */
export function raknaLoggRadHash(
  radUtanHash: Omit<KalibreringLoggRad, "hash">,
  digest: (s: string) => string,
): string {
  const kopia: Record<string, unknown> = { ...radUtanHash };
  delete kopia.hash;
  return digest(kanoniskJson(kopia));
}

/** Verifierar hela kedjan: varje hash stämmer + varje prevHash pekar rätt. */
export function valideraKedja(
  rader: readonly KalibreringLoggRad[] | null | undefined,
  digest: (s: string) => string,
): { ok: boolean; brutetVid: number | null } {
  const lista = Array.isArray(rader) ? rader : [];
  let foregaende: string | null = null;
  for (let i = 0; i < lista.length; i += 1) {
    const rad = lista[i];
    const forvantad = raknaLoggRadHash(rad as Omit<KalibreringLoggRad, "hash">, digest);
    if (rad.prevHash !== foregaende || rad.hash !== forvantad) {
      return { ok: false, brutetVid: i + 1 };
    }
    foregaende = rad.hash;
  }
  return { ok: true, brutetVid: null };
}

// ── Ronden — allt cronen gör, som en ren funktion ───────────────────────────

/** Ingången till byggKalibreringsRond (cronen svarar för all I/O). */
export type KalibreringsRondIndata = {
  /** Processade Bana B-rader (clean-filtrerade ≥ 2026-09-04 av cron-rutten). */
  domRader: readonly KalibreringDomRad[];
  /**
   * ρ̄-underlag: celler (variabel, horisont) → ticker → (traffDatum → momentum),
   * byggda ur samma rader. Används när rhoOverride inte ges.
   */
  momentumCeller: ReadonlyArray<Readonly<Record<string, Readonly<Record<string, number>>>>>;
  /** ISO-tidsstämpel (cronens klocka — loggas, styr ALDRIG någon logik). */
  genererad: string;
  /** Rondens kalenderdag (YYYY-MM-DD). */
  datum: string;
  /** Månadsnyckel YYYY-MM (idempotens-vakten i cron-rutten). */
  manad: string;
  /** Befintlig logg (föregående hash + versionsräknare); null vid första raden. */
  tidigareLogg: KalibreringLogg | null;
  /** sha-256-digest (INJICERAD — node:crypto i rutten, samma i testet). */
  digest: (s: string) => string;
  /** Skippad kedja (rutten vägrar appenda på en bruten logg — syns här). */
  kedjaBruten?: boolean;
  /** Explicit ρ̄ (test/simulering) — annars skattas ur momentumCeller. */
  rhoOverride?: number;
};

/** Rondens fulla resultat — rapport, event och loggrad byggs ur detta. */
export type KalibreringsRond = {
  schema: string;
  protokollVersion: number;
  modell: string;
  genererad: string;
  datum: string;
  manad: string;
  grindLasad: boolean;
  deltaPhi: number;
  phiVersion: string;
  cleanFran: string;
  domRader: number;
  episoderTotalt: number;
  rho: number;
  rhoKalla: string;
  rhoPar: number;
  effektivaPerDag: number;
  faser: Record<KalibrerbarFas, FasStatistik>;
  osatt: { episoder: number; traff: number; miss: number };
  /** Episoder vars dom blev osatt (vittnade inte — redovisas hederligt). */
  odomdaEpisoder: number;
  korrigeringGOkand: { episoder: number; traff: number; miss: number };
  variabelFas: VariabelFasRad[];
  rollbackRegel: string;
  handlingsgrind: string;
  loggRad: KalibreringLoggRad | null;
  varningar: string[];
};

/**
 * Kör hela kalibreringsronden som ren funktion: episoder → ρ̄ → posteriors →
 * grindstatus (LÅST: ΔΦ=0) → loggrad med hash-kedja. Samma indata ⇒ JSON-
 * identiskt utdata (P1). Inga levande posteriorer lämnar modulen till
 * analyskörningar — allt är mätning, versionsstämplat i loggen.
 */
export function byggKalibreringsRond(indata: KalibreringsRondIndata): KalibreringsRond {
  const varningar: string[] = [];
  const episoder = episodRaknare(indata.domRader);

  const rhoSkatt =
    typeof indata.rhoOverride === "number" && Number.isFinite(indata.rhoOverride)
      ? { rho: indata.rhoOverride, par: -1, fallback: false }
      : skattaRho(indata.momentumCeller);
  if (rhoSkatt.fallback && rhoSkatt.par !== -1) {
    varningar.push(
      `ρ̄-skattning: endast ${rhoSkatt.par} tickerpar kunde skattas (krav ≥ 10) — dokumenterad default ${RHO_DEFAULT} används`,
    );
  }
  const rhoKalla =
    rhoSkatt.par === -1
      ? "override (test/simulering)"
      : rhoSkatt.fallback
        ? `fallback (för få par: ${rhoSkatt.par})`
        : `skattad ur Bana B:s tvärsnitt (${rhoSkatt.par} tickerpar)`;

  const faser = raknaFasStatistik(episoder, rhoSkatt.rho);
  const variabelFas = raknaVariabelFasRader(episoder);

  const osattEpisoder = episoder.filter((e) => e.fas === "osatt");
  const odomdaEpisoder = episoder.filter((e) => e.dom === "osatt");
  const korringEpisoder = episoder.filter((e) => e.klass === "korrigering");
  if (korringEpisoder.length > 0) {
    varningar.push(
      `${korringEpisoder.length} korrigering-episoder mäts men kan inte attribueras hog_g/lag_g: Bana B:s rader saknar grundpoäng G (kärnans regel: grenen 0,80/0,90 kan inte väljas utan gissning) — diagnostikpoolen korrigeringGOkand`,
    );
  }
  if (indata.kedjaBruten) {
    varningar.push(
      "kalibrering-logg.json: hash-kedjan bruten — månmätningen loggas INTE (append-only-kontraktet kräver hel kedja); åtgärda/manuell granskning krävs",
    );
  }

  const loggFaser = {} as Record<KalibrerbarFas, KalibreringLoggFasRad>;
  for (const fas of KALIBRERBARA_FASER) {
    const f = faser[fas];
    loggFaser[fas] = {
      T: f.posterior.T,
      M: f.posterior.M,
      episoder: f.episoder,
      nEff: f.nEff,
      pHat: f.posterior.pHat,
      kredibeltIntervall90: [f.posterior.kredibeltIntervall90[0], f.posterior.kredibeltIntervall90[1]],
      phiForslag: f.phiForslag,
      phiSittande: f.phiSittande,
      villkor: f.grind.villkor,
      status: f.grind.status,
    };
  }

  const prevRader = Array.isArray(indata.tidigareLogg?.rader) ? indata.tidigareLogg!.rader : [];
  const prevHash = prevRader.length > 0 ? prevRader[prevRader.length - 1].hash : null;

  let loggRad: KalibreringLoggRad | null = null;
  if (!indata.kedjaBruten) {
    const gradUtanHash: Omit<KalibreringLoggRad, "hash"> = {
      version: prevRader.length + 1,
      typ: "matning",
      manad: indata.manad,
      datum: indata.datum,
      genererad: indata.genererad,
      schema: KALIBRERING_SCHEMA,
      protokollVersion: KALIBRERING_PROTOKOLL_VERSION,
      modell: KALIBRERING_MODELL,
      phiVersion: PHI_VERSION_NUVARANDE,
      grindLasad: GRIND_LASAD,
      deltaPhi: 0,
      cleanFran: KALIBRERING_CLEAN_FRAN,
      domRader: (Array.isArray(indata.domRader) ? indata.domRader : []).length,
      episoderTotalt: episoder.length,
      rho: rhoSkatt.rho,
      rhoKalla,
      effektivaPerDag: effektivaPerDag(rhoSkatt.rho),
      faser: loggFaser,
      osattEpisoder: osattEpisoder.length,
      odomdaEpisoder: odomdaEpisoder.length,
      korrigeringGOkand: {
        episoder: korringEpisoder.length,
        traff: korringEpisoder.filter((e) => e.dom === "traff").length,
        miss: korringEpisoder.filter((e) => e.dom === "miss").length,
      },
      rollbackRegel: ROLLBACK_REGEL_TEXT,
      prevHash,
    };
    loggRad = { ...gradUtanHash, hash: raknaLoggRadHash(gradUtanHash, indata.digest) };
  }

  return {
    schema: KALIBRERING_SCHEMA,
    protokollVersion: KALIBRERING_PROTOKOLL_VERSION,
    modell: KALIBRERING_MODELL,
    genererad: indata.genererad,
    datum: indata.datum,
    manad: indata.manad,
    grindLasad: GRIND_LASAD,
    deltaPhi: 0,
    phiVersion: PHI_VERSION_NUVARANDE,
    cleanFran: KALIBRERING_CLEAN_FRAN,
    domRader: (Array.isArray(indata.domRader) ? indata.domRader : []).length,
    episoderTotalt: episoder.length,
    rho: rhoSkatt.rho,
    rhoKalla,
    rhoPar: rhoSkatt.par,
    effektivaPerDag: effektivaPerDag(rhoSkatt.rho),
    faser,
    osatt: {
      episoder: osattEpisoder.length,
      traff: osattEpisoder.filter((e) => e.dom === "traff").length,
      miss: osattEpisoder.filter((e) => e.dom === "miss").length,
    },
    odomdaEpisoder: odomdaEpisoder.length,
    korrigeringGOkand: {
      episoder: korringEpisoder.length,
      traff: korringEpisoder.filter((e) => e.dom === "traff").length,
      miss: korringEpisoder.filter((e) => e.dom === "miss").length,
    },
    variabelFas,
    rollbackRegel: ROLLBACK_REGEL_TEXT,
    handlingsgrind: HANDLINGSGRIND_TEXT,
    loggRad,
    varningar,
  };
}

// ── Rapportbyggare (ren strängfunktion — data/rapporter/…-SENASTE.md) ───────

/** Svenskt tal med komma-decimal (rapportens textform). */
function sv(x: number, decimaler = 2): string {
  if (!Number.isFinite(x)) return "—";
  return String(Math.round(x * 10 ** decimaler) / 10 ** decimaler).replace(".", ",");
}

const FAS_NAMN: Record<KalibrerbarFas, string> = {
  impulsvag_bekraftad: "impulsvåg bekräftad (n ≥ 2)",
  impulsvag_obekraftad: "impulsvåg obekräftad (n = 1)",
  impulsvag_mogen: "impulsvåg mogen (n ≥ 4)",
  basbygge: "basbygge",
  korrigering_hog_g: "korrigering, G ≥ 3",
  korrigering_lag_g: "korrigering, G ≤ 2",
};

/**
 * data/rapporter/akm3-kalibrering-SENASTE.md — månadrondens mätprotokoll:
 * posteriorer per fas med LÅST grind (ΔΦ=0), villkor true/false, per-variabel-
 * rådata, rollback-kontraktet och loggens hash-prefix. Ren funktion: samma
 * rond ⇒ byte-identisk rapport.
 */
export function byggKalibreringsRapport(r: KalibreringsRond): string {
  const linjer: string[] = [];
  linjer.push("# AKM3-kalibrering — Φ-mätning med LÅST grind");
  linjer.push("");
  linjer.push(
    "**Genererad:** " + r.genererad +
    " · **Schema:** " + r.schema + " v" + String(r.protokollVersion) +
    " · **Modell:** " + r.modell +
    " · **Rond:** " + r.datum + " (månad " + r.manad + ")",
  );
  linjer.push(
    "**Källor:** Bana B — system_events type=vagvalidering, tabell vagvalidering_dom (per-variabel episoder)" +
    " · **Dom-rader:** " + String(r.domRader) + " (clean sedan " + r.cleanFran + ", FORBUD §10.5)" +
    " · **Episoder:** " + String(r.episoderTotalt),
  );
  linjer.push(
    "**ρ̄:** " + sv(r.rho) + " (" + r.rhoKalla + ") ⇒ tvärsnittet bär ≈ " + sv(r.effektivaPerDag, 1) +
    " effektiva observationer per dag (12 makrokorrelerade tickers — r1 §2.1)",
  );
  linjer.push("");
  linjer.push(
    "> **GRINDEN LÅST (AKM3.2026.09):** denna cron SAMLAR bara data — den ändrar ALDRIG. **ΔΦ = 0.** " +
    "Posteriors uppdateras varje månadsrond (billigt); tabellen fryses och versioneras. Sittande Φ-version: **" +
    r.phiVersion + "** — oförändrad.",
  );
  linjer.push("> " + r.handlingsgrind);
  linjer.push("");
  linjer.push("## Posteriorer per fas (nivå 1 — global träff per fas)");
  linjer.push("");
  linjer.push(
    "| Fas | Φ design | T | M | episoder | n_eff | p̂ | 90 %-kredibelt intervall | Φ-förslag | (i) n_eff ≥ 20 | (ii) intervall klart | (iii) ±0,05 | Status |",
  );
  linjer.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const fas of KALIBRERBARA_FASER) {
    const f = r.faser[fas];
    const ki = f.posterior.kredibeltIntervall90;
    linjer.push(
      "| " + FAS_NAMN[fas] +
      " | ×" + sv(f.phiSittande) +
      " | " + String(f.posterior.T) +
      " | " + String(f.posterior.M) +
      " | " + String(f.episoder) +
      " | " + String(f.nEff) +
      " | " + sv(f.posterior.pHat) +
      " | [" + sv(ki[0]) + ", " + sv(ki[1]) + "]" +
      " | ×" + sv(f.phiForslag) + " | " +
      (f.grind.villkor.nEff20 ? "✓" : "✗ (" + String(f.nEff) + "/20)") + " | " +
      (f.grind.villkor.intervallKlart ? "✓" : "✗") + " | " +
      (f.grind.villkor.rateLimit ? "✓" : "✗") + " | " +
      f.statusText + " |",
    );
  }
  linjer.push("");
  linjer.push(
    "_T/M = träff/miss-EPISODER (dagar räknas ALDRIG som observationer — FORBUD §10.7). " +
    "n_eff = episoder diskonterade med √(1/ρ̄). p̂ = (m·q + T)/(m + T + M), m = 10, q ur Markov-priorerna._",
  );
  linjer.push("");
  linjer.push("## Osatt + korrigering utan G");
  linjer.push("");
  linjer.push(
    "- **osatt:** " + String(r.osatt.episoder) + " episoder — kalibreras ALDRIG (Φ 1,00/0-bidrag är ett ärlighetskontrakt, inte en parameter; FORBUD §9.6)." +
    (r.odomdaEpisoder > 0
      ? " Därtill " + String(r.odomdaEpisoder) + " episoder som inte kunde dömas (lika många träff som miss — de vittnade inte och matar ALDRIG T/M)."
      : ""),
  );
  linjer.push(
    "- **korrigering (G okänd):** " + String(r.korrigeringGOkand.episoder) + " episoder (" +
    String(r.korrigeringGOkand.traff) + " träff, " + String(r.korrigeringGOkand.miss) +
    " miss) mäts i diagnostikpoolen — Bana B:s rader saknar grundpoäng G, och kärnans egen regel är att grenen 0,80/0,90 inte väljs utan gissning. hog_g/lag_g matas alltså INTE förrän en framtida protokollversion levererar G per episod.",
  );
  linjer.push("");
  if (r.variabelFas.length > 0) {
    linjer.push("## Per variabel och fas (rå nivå 3 — rapportering, ingen grind)");
    linjer.push("");
    linjer.push("| Variabel | Fas | episoder | T | M | p̂ |");
    linjer.push("|---|---|---|---|---|---|");
    for (const v of r.variabelFas.slice(0, 40)) {
      linjer.push(
        "| " + v.variabel + " | " + FAS_NAMN[v.fas] + " | " + String(v.episoder) + " | " +
        String(v.traff) + " | " + String(v.miss) + " | " + sv(v.pHat) + " |",
      );
    }
    if (r.variabelFas.length > 40) {
      linjer.push("");
      linjer.push("_(" + String(r.variabelFas.length - 40) + " ytterligare rader finns i system_events-raden.)_");
    }
    linjer.push("");
  }
  if (r.varningar.length > 0) {
    linjer.push("## Varningar");
    linjer.push("");
    for (const v of r.varningar) linjer.push("- " + v);
    linjer.push("");
  }
  linjer.push("## Versionslogg (append-only, hash-kedjad)");
  linjer.push("");
  if (r.loggRad) {
    linjer.push(
      "- v" + String(r.loggRad.version) + " · " + r.loggRad.manad + " · typ " + r.loggRad.typ +
      " · ΔΦ = " + String(r.loggRad.deltaPhi) +
      " · hash `" + r.loggRad.hash.slice(0, 16) + "…` · data/portfolj-system/kalibrering-logg.json",
    );
  } else {
    linjer.push("- Ingen rad loggades denna rond (bruten kedja eller skyddat filsystem) — mätningen finns ändå i system_events.");
  }
  linjer.push("");
  linjer.push("**" + r.rollbackRegel + "**");
  linjer.push("");
  linjer.push(
    "_Pedagogisk mätning — inte investeringsråd. Kalibreringen gör modellen mer självkonsistent; den kan inte och skall inte omvandla AKM2 till en kursprognos. \"Öppet kvitto om det förflutna — aldrig garanti om framtiden.\"_",
  );
  linjer.push("");
  return linjer.join("\n");
}
