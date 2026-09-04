#!/usr/bin/env node
/**
 * AK1A — Test av AKM3-kalibrering (src/lib/akm3/kalibrering.ts — AKM3-BESLUT
 * §8 + §11 steg 6, r1-bayes.md). Mönster som verktyg/testa-akm2-dynamik.mjs:
 *   1. Genererar tmp_kalibrering_koll.ts i repots rot — importerar
 *      kalibreringslagret + akm2/dynamik (speglingkontroller).
 *   2. Kör den med: npx --yes tsx tmp_kalibrering_koll.ts
 *   3. Skriver ut en svensk rapport på stdout och städar tmp-filen.
 *
 * Kontroller (LAGEN — r1 §1.2/§2.1 + BESLUT §8/§10/§11.6):
 *   A. PRIORS: q(fas) exakt ur r1 §1.2 + spegling av MARKOV_PRIOR (trog/snabb
 *      diagonal) · m = 10 · Φ_DESIGN speglar dynamik.ts:s PHI (F1–F8).
 *   B. POSTERIOR-FORMELN: α = α₀+T, β = β₀+M (EPISODER, aldrig dagar);
 *      p̂ = α/(α+β); T=M=0 ⇒ p̂ = q; Beta-kvantiler (uniform, symmetri,
 *      median); 90 %-kredibelt intervall.
 *   C. Φ-FÖRSLAG: clamp(1+κ(2p̂−1), 0,80, 1,20) · p̂=0,50 ⇒ 1,00 · κ 0,20/0,10
 *      · monotonitet · designfallet q=0,65, κ=0,20 ⇒ Φ=1,06 (r1 §1.2).
 *      (Not: r1:s exempeltal "p̂=0,35 ⇒ 0,91" svarar mot κ=0,30 — FORMELN med
 *      beslutade κ är normativ, BESLUT §8; p̂=0,35 κ=0,20 ⇒ 0,94.)
 *   D. DISKONTO: n_eff = ⌊episoder/√(1/ρ̄)⌋ · ρ̄-clamp [0,05, 0,95] ·
 *      effektiva/dag ≈ 1/ρ̄ (12 tickers ⇒ 1–3) · pearson · skattaRho fallback.
 *   E. EPISODER: majoritetsdom · lika många ⇒ osatt · deduplicering per
 *      (episod, dag) · fas-mappning (kvartalsspann, korrigering-utan-G ⇒
 *      osatt — speglar bestamVagfas i kärnan).
 *   F. GRINDEN: bordeGrindenOppnas öppnar EXAKT vid n_eff = 20 (29/30-episod-
 *      gränsen vid ρ̄ = 0,45) · (ii) intervall över 0,50 blockerar · (iii)
 *      rate-limit ±0,05 blockerar · grindBeslut: LÅST ⇒ oppna=false, ΔΦ=0,
 *      status "vantar-grind" ÄVEN när alla villkor är uppfyllda.
 *   G. RONDEN: determinism (2 körningar JSON-identiska) · hash-kedja
 *      (append + verifierbar + tampering upptäcks) · bruten kedja ⇒ ingen
 *      loggrad + varning · rollback-kontraktet (§10.11) kodat.
 *
 * Användning:  node verktyg/testa-akm3-kalibrering.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { spawnSync } from "node:child_process";
import { unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_TS = path.join(REPO, "tmp_kalibrering_koll.ts");
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// ── 1) Genererad tmp-testfil (TS — körs via npx tsx, raderas efteråt) ────────
// Obs: ingen backticks/${} inuti denna String.raw-literal.
const TS_KOD = String.raw`// tmp_kalibrering_koll.ts — GENERERAD av verktyg/testa-akm3-kalibrering.mjs. Raderas efter körning.
import { createHash } from "node:crypto";
import {
  GRIND_LASAD,
  HANDLINGSGRIND_TEXT,
  KALIBRERBARA_FASER,
  KALIBRERING_CLEAN_FRAN,
  KAPPA,
  N_EFF_KRAV,
  PHI_DESIGN,
  PRIOR_STYRKA_M,
  Q_PRIOR,
  RATE_LIMIT_PER_MANAD,
  RHO_DEFAULT,
  betaCdf,
  betaKvantil,
  betaPosterior,
  bordeAterkalla,
  bordeGrindenOppnas,
  byggKalibreringsRapport,
  byggKalibreringsRond,
  effektivaPerDag,
  episodRaknare,
  fasFranEpisod,
  grindBeslut,
  kanoniskJson,
  nEffFranEpisoder,
  pearson,
  phiFranPosterior,
  raknaFasStatistik,
  raknaVariabelFasRader,
  raknaLoggRadHash,
  skattaRho,
  valideraKedja,
  type KalibreringDomRad,
  type KalibreringLogg,
  type KalibreringLoggRad,
} from "./src/lib/akm3/kalibrering";
import { MARKOV_PRIOR, PHI as DYNAMIK_PHI, bestamVagfas } from "./src/lib/akm2/dynamik";

type Kontroll = { namn: string; ok: boolean; detalj: string };
const KOLL: Kontroll[] = [];
function kolla(namn: string, ok: boolean, faktiskt?: unknown, forvantat?: unknown): void {
  KOLL.push({ namn, ok, detalj: "faktiskt=" + String(faktiskt) + (forvantat !== undefined ? ", förväntat=" + String(forvantat) : "") });
  console.log("  " + (ok ? "PASS" : "FAIL") + " | " + namn + " => " + String(faktiskt) +
    (ok ? "" : " (förväntat " + String(forvantat) + ")"));
}
function narma(x: number, y: number, tol: number): boolean {
  return Math.abs(x - y) <= tol;
}
function rubrik(t: string): void {
  console.log("");
  console.log("== " + t + " " + "=".repeat(Math.max(4, 74 - t.length)));
}
const sha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");

// — Fixtures ————————————————————————————————————————————————————————————————

/** En Bana B-rad i kalibreringslagrets form ( domen förutberäknad som cron-rutten gör). */
function rad(o: {
  ticker: string; variabel: string; horisont: string; klass: string;
  episodStart: string; dag: string; dom: "traff" | "miss" | "osatt";
}): KalibreringDomRad {
  return {
    ticker: o.ticker,
    variabel: o.variabel,
    horisont: o.horisont,
    klass: o.klass,
    episodId: o.ticker + "|" + o.variabel + "|" + o.horisont + "|" + o.klass + "|" + o.episodStart,
    episodStartDatum: o.episodStart,
    dom: o.dom,
    traffDatum: o.dag,
  };
}

// ═══ A. PRIORS OCH KONSTANTER ════════════════════════════════════════════════
rubrik("A. PRIORS (r1 §1.2 exakt) + KONSTANTER");

kolla("A1: q(fas) exakta r1-värden: 0,65/0,50/0,45/0,34/0,46/0,40",
  Q_PRIOR.impulsvag_bekraftad === 0.65 && Q_PRIOR.impulsvag_obekraftad === 0.5 &&
  Q_PRIOR.impulsvag_mogen === 0.45 && Q_PRIOR.basbygge === 0.34 &&
  Q_PRIOR.korrigering_hog_g === 0.46 && Q_PRIOR.korrigering_lag_g === 0.4, Q_PRIOR);

kolla("A2: q ur Markov-priorerna — speglar MARKOV_PRIOR (trog imp-diagonal + snabb korr/bas-diagonal)",
  Q_PRIOR.impulsvag_bekraftad === MARKOV_PRIOR.trog.impulsvag.impulsvag &&
  Q_PRIOR.korrigering_hog_g === MARKOV_PRIOR.snabb.korrigering.korrigering &&
  Q_PRIOR.basbygge === MARKOV_PRIOR.snabb.basbygge.basbygge, true);

kolla("A3: priorstyrka m = 10 · n_eff-krav 20 · rate-limit 0,05 · grind LÅST",
  PRIOR_STYRKA_M === 10 && N_EFF_KRAV === 20 && RATE_LIMIT_PER_MANAD === 0.05 && GRIND_LASAD === true, true);

kolla("A4: Φ_DESIGN speglar dynamik.ts:s PHI exakt (F1–F8)",
  PHI_DESIGN.impulsvag_bekraftad === DYNAMIK_PHI.IMPULS_BEKRAFTAD &&
  PHI_DESIGN.impulsvag_obekraftad === DYNAMIK_PHI.IMPULS_OBEKRAFTAD &&
  PHI_DESIGN.impulsvag_mogen === DYNAMIK_PHI.IMPULS_MOGEN &&
  PHI_DESIGN.basbygge === DYNAMIK_PHI.BASBYGGE &&
  PHI_DESIGN.korrigering_hog_g === DYNAMIK_PHI.KORR_HOG_G &&
  PHI_DESIGN.korrigering_lag_g === DYNAMIK_PHI.KORR_LAG_G &&
  PHI_DESIGN.osatt === DYNAMIK_PHI.OSATT, PHI_DESIGN);

kolla("A5: κ enligt r1 §1.2: 0,20 för bekräftad/mogen/hog_g · 0,10 för obekräftad/lag_g/basbygge",
  KAPPA.impulsvag_bekraftad === 0.2 && KAPPA.impulsvag_mogen === 0.2 && KAPPA.korrigering_hog_g === 0.2 &&
  KAPPA.impulsvag_obekraftad === 0.1 && KAPPA.korrigering_lag_g === 0.1 && KAPPA.basbygge === 0.1, KAPPA);

kolla("A6: clean-förbudet — kalibrering startar 2026-09-04 (FORBUD §10.5)",
  KALIBRERING_CLEAN_FRAN === "2026-09-04", KALIBRERING_CLEAN_FRAN);

// ═══ B. POSTERIOR-FORMELN ════════════════════════════════════════════════════
rubrik("B. POSTERIOR-FORMELN (r1 §1.2: α = α₀+T, β = β₀+M — EPISODER, aldrig dagar)");

kolla("B1: α₀ = m·q, β₀ = m·(1−q) — bekräftad: Beta(6,5 · 3,5)",
  narma(betaPosterior(Q_PRIOR.impulsvag_bekraftad, 0, 0).alpha0, 6.5, 1e-12) &&
  narma(betaPosterior(Q_PRIOR.impulsvag_bekraftad, 0, 0).beta0, 3.5, 1e-12), "6,5/3,5");

const post3050 = betaPosterior(0.65, 30, 5);
kolla("B2: α = α₀+T, β = β₀+M (T=30, M=5): 36,5/8,5 · p̂ = 36,5/45",
  narma(post3050.alpha, 36.5, 1e-12) && narma(post3050.beta, 8.5, 1e-12) &&
  narma(post3050.pHat, 36.5 / 45, 1e-12), post3050.alpha + "/" + post3050.beta);

kolla("B3: T=M=0 ⇒ p̂ = q (prior-medel) för alla sex faser",
  KALIBRERBARA_FASER.every((f) => narma(betaPosterior(Q_PRIOR[f], 0, 0).pHat, Q_PRIOR[f], 1e-12)), true);

kolla("B4: Beta(1,1) är uniform — CDF(x)=x · KI 90 % = [0,05 · 0,95]",
  narma(betaCdf(0.3, 1, 1), 0.3, 1e-9) && narma(betaKvantil(0.05, 1, 1), 0.05, 1e-6) &&
  narma(betaKvantil(0.95, 1, 1), 0.95, 1e-6), "[0,05; 0,95]");

kolla("B5: symmetri — kvantil(0,95; 2,5) = 1 − kvantil(0,05; 5,2)",
  narma(betaKvantil(0.95, 2, 5), 1 - betaKvantil(0.05, 5, 2), 1e-9), true);

kolla("B6: symmetrisk Beta(3,3): CDF(median) ≈ 0,5 · KI90 ligger runt 0,5",
  narma(betaCdf(0.5, 3, 3), 0.5, 1e-9) &&
  betaPosterior(0.5, 0, 0).kredibeltIntervall90[0] < 0.5 &&
  betaPosterior(0.5, 0, 0).kredibeltIntervall90[1] > 0.5, betaPosterior(0.5, 0, 0).kredibeltIntervall90);

kolla("B7: 90 %-intervallet smalnar med data (T=30,M=0 smalare än T=0,M=0)",
  (betaPosterior(0.65, 30, 0).kredibeltIntervall90[1] - betaPosterior(0.65, 30, 0).kredibeltIntervall90[0]) <
  (betaPosterior(0.65, 0, 0).kredibeltIntervall90[1] - betaPosterior(0.65, 0, 0).kredibeltIntervall90[0]), true);

// ═══ C. Φ-FÖRSLAG ════════════════════════════════════════════════════════════
rubrik("C. Φ-FÖRSLAG — clamp(1 + κ(2p̂−1), 0,80, 1,20) (FÖRSLAG, aldrig ändring)");

kolla("C1: p̂=0,50 ⇒ Φ=1,00 (myntverk tystnar av sig själv)",
  phiFranPosterior(0.5, 0.2) === 1 && phiFranPosterior(0.5, 0.1) === 1, 1);

kolla("C2: clamp — p̂=1/p̂=0: κ=0,20 ⇒ [0,80 · 1,20] · κ=0,10 ⇒ [0,90 · 1,10]",
  phiFranPosterior(1, 0.2) === 1.2 && phiFranPosterior(0, 0.2) === 0.8 &&
  phiFranPosterior(1, 0.1) === 1.1 && phiFranPosterior(0, 0.1) === 0.9, true);

kolla("C3: designfallet (r1 §1.2): p̂=q=0,65, κ=0,20 ⇒ Φ=1,06",
  narma(phiFranPosterior(0.65, 0.2), 1.06, 1e-9), 1.06);

kolla("C4: formeln är monoton i p̂ (lägre träff ⇒ lägre Φ-aggressivitet)",
  phiFranPosterior(0.2, 0.2) < phiFranPosterior(0.4, 0.2) &&
  phiFranPosterior(0.4, 0.2) < phiFranPosterior(0.6, 0.2), true);

kolla("C5: p̂=0,35 κ=0,20 ⇒ 0,94 — r1:s exempeltal 0,91 svarar mot κ=0,30; FORMELN är normativ (BESLUT §8)",
  narma(phiFranPosterior(0.35, 0.2), 0.94, 1e-9), 0.94);

kolla("C6: ogiltigt p̂/κ ⇒ 1,00 (aldrig NaN i ett Φ-förslag)",
  phiFranPosterior(Number.NaN, 0.2) === 1 && phiFranPosterior(0.7, Number.NaN) === 1, 1);

// ═══ D. DISKONTO (n_eff) ═════════════════════════════════════════════════════
rubrik("D. KORRELATIONSDISKONTO — n_eff = episoder/√(1/ρ̄) (r1 §2.1)");

kolla("D1: ρ̄=0,50 · 24 episoder ⇒ n_eff = ⌊24/√2⌋ = 16",
  nEffFranEpisoder(24, 0.5) === 16, nEffFranEpisoder(24, 0.5));

kolla("D2: gränsen — ρ̄=0,45: 29 episoder ⇒ 19 (stängt) · 30 ⇒ 20 (exakt n_eff-kravet)",
  nEffFranEpisoder(29, 0.45) === 19 && nEffFranEpisoder(30, 0.45) === 20,
  nEffFranEpisoder(29, 0.45) + "/" + nEffFranEpisoder(30, 0.45));

kolla("D3: ρ̄ clampas till [0,05 · 0,95] — 0,99 räknas som 0,95",
  nEffFranEpisoder(100, 0.99) === Math.floor(100 / Math.sqrt(1 / 0.95)) &&
  nEffFranEpisoder(100, 0.99) !== Math.floor(100 / Math.sqrt(1 / 0.99)), nEffFranEpisoder(100, 0.99));

kolla("D4: 12 tickers ⇒ 1–3 effektiva/dag: ρ̄ 0,30⇒3,3 · 0,45⇒2,2 · 0,60⇒1,7",
  effektivaPerDag(0.3) === 3.3 && effektivaPerDag(0.45) === 2.2 && effektivaPerDag(0.6) === 1.7,
  effektivaPerDag(0.3) + "/" + effektivaPerDag(0.45) + "/" + effektivaPerDag(0.6));

kolla("D5: pearson — perfekt +1 · spegelvänd −1 · < 3 gemensamma dagar ⇒ null",
  pearson({ "2026-09-01": 1, "2026-09-02": 2, "2026-09-03": 3 }, { "2026-09-01": 2, "2026-09-02": 4, "2026-09-03": 6 }) === 1 &&
  pearson({ "2026-09-01": 1, "2026-09-02": 2, "2026-09-03": 3 }, { "2026-09-01": -1, "2026-09-02": -2, "2026-09-03": -3 }) === -1 &&
  pearson({ "2026-09-01": 1, "2026-09-02": 2 }, { "2026-09-01": 2, "2026-09-02": 4 }) === null, true);

const femKorrelerade = [{}].map(() => {
  const cell: Record<string, Record<string, number>> = {};
  for (let t = 0; t < 5; t += 1) {
    const serie: Record<string, number> = {};
    for (let d = 1; d <= 6; d += 1) serie["2026-09-0" + String(d)] = d + t * 0.001;
    cell["T" + String(t)] = serie;
  }
  return cell;
})[0];
kolla("D6: skattaRho — 5 tickers (10 par) perfekt korrelerade ⇒ ρ̄ clamp 0,95, fallback=false",
  skattaRho([femKorrelerade]).rho === 0.95 && skattaRho([femKorrelerade]).par === 10 &&
  skattaRho([femKorrelerade]).fallback === false, skattaRho([femKorrelerade]));

kolla("D7: skattaRho — för få par (< 10) ⇒ dokumenterad default 0,45",
  skattaRho([{ A: { "2026-09-01": 1, "2026-09-02": 2, "2026-09-03": 3 }, B: { "2026-09-01": 3, "2026-09-02": 2, "2026-09-03": 1 } }]).rho === RHO_DEFAULT &&
  skattaRho([]).fallback === true, RHO_DEFAULT);

// ═══ E. EPISODER ═════════════════════════════════════════════════════════════
rubrik("E. EPISODRÄKNAREN — episoder är enheten (FORBUD §10.7)");

const eTraff = episodRaknare([
  rad({ ticker: "AAA.ST", variabel: "V01", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-10", dom: "traff" }),
  rad({ ticker: "AAA.ST", variabel: "V01", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-11", dom: "traff" }),
  rad({ ticker: "AAA.ST", variabel: "V01", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-12", dom: "traff" }),
  rad({ ticker: "AAA.ST", variabel: "V01", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-13", dom: "miss" }),
]);
kolla("E1: majoritetsdom — 3 träff/1 miss ⇒ episoden döms träff (EN observation, inte 4)",
  eTraff.length === 1 && eTraff[0].dom === "traff" && eTraff[0].domdaRader === 4, eTraff.length + ":" + eTraff[0]?.dom);

const eLika = episodRaknare([
  rad({ ticker: "BBB.ST", variabel: "V02", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-10", dom: "traff" }),
  rad({ ticker: "BBB.ST", variabel: "V02", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-11", dom: "miss" }),
]);
kolla("E2: lika många träff som miss ⇒ episoden osatt (vittnar inte om någon kant)",
  eLika[0].dom === "osatt", eLika[0].dom);

const eDedup = episodRaknare([
  rad({ ticker: "CCC.ST", variabel: "V03", horisont: "mikro", klass: "basbygge", episodStart: "2026-09-10", dag: "2026-09-10", dom: "traff" }),
  rad({ ticker: "CCC.ST", variabel: "V03", horisont: "mikro", klass: "basbygge", episodStart: "2026-09-10", dag: "2026-09-10", dom: "traff" }),
  rad({ ticker: "CCC.ST", variabel: "V03", horisont: "mikro", klass: "basbygge", episodStart: "2026-09-10", dag: "2026-09-10", dom: "traff" }),
]);
kolla("E3: deduplicering — samma (episod, dag) i flera events räknas EN gång",
  eDedup[0].domdaRader === 1 && eDedup[0].traff === 1, eDedup[0].domdaRader);

kolla("E4: fas-mappning — impulsvåg inom samma kvartal ⇒ obekräftad (n=1)",
  fasFranEpisod("impulsvåg", "2026-09-10", "2026-09-20") === "impulsvag_obekraftad", fasFranEpisod("impulsvåg", "2026-09-10", "2026-09-20"));

kolla("E5: fas-mappning — Q3→Q4 (n=2) ⇒ bekräftad · 2025Q4→2026Q3 (n=4) ⇒ mogen",
  fasFranEpisod("impulsvåg", "2026-09-10", "2026-12-05") === "impulsvag_bekraftad" &&
  fasFranEpisod("impulsvåg", "2025-12-01", "2026-09-20") === "impulsvag_mogen", true);

kolla("E6: fas-mappning — korrigering utan G ⇒ osatt · basbygge ⇒ basbygge (kärnans egen regel)",
  fasFranEpisod("korrigering", "2026-09-10", "2026-12-05") === "osatt" &&
  fasFranEpisod("basbygge", "2026-09-10", "2026-12-05") === "basbygge", true);

kolla("E7: fas-mappningen speglar bestamVagfas för n=1/2/4 (samma trösklar som kärnan)",
  bestamVagfas("impulsvag", null, 1).fas === "impulsvag_obekraftad" &&
  bestamVagfas("impulsvag", null, 2).fas === "impulsvag_bekraftad" &&
  bestamVagfas("impulsvag", null, 4).fas === "impulsvag_mogen" &&
  bestamVagfas("korrigering", null, 2).fas === "osatt" &&
  bestamVagfas("basbygge", null, 1).fas === "basbygge", true);

// ═══ F. GRINDEN ══════════════════════════════════════════════════════════════
rubrik("F. HANDLINGSGRINDEN — låst i AKM3.2026.09 (ΔΦ = 0)");

function grindInput(q: number, T: number, M: number, kappa: number, phiSittande: number, rho: number) {
  const post = betaPosterior(q, T, M);
  const forslag = phiFranPosterior(post.pHat, kappa);
  return {
    nEff: nEffFranEpisoder(T + M, rho),
    kredibeltIntervall90: post.kredibeltIntervall90,
    phiForslag: forslag,
    phiSittande,
  };
}

const gOppen = grindInput(Q_PRIOR.impulsvag_bekraftad, 30, 0, KAPPA.impulsvag_bekraftad, PHI_DESIGN.impulsvag_bekraftad, 0.45);
kolla("F1: simulering — T=30, M=0, ρ̄=0,45 ⇒ n_eff=20, KI över 0,50, |ΔΦ|≤0,05 ⇒ grinden SKULLE öppna",
  bordeGrindenOppnas(gOppen) === true && gOppen.nEff === 20 && gOppen.kredibeltIntervall90[0] > 0.5,
  "n_eff=" + String(gOppen.nEff) + " KI=[" + String(gOppen.kredibeltIntervall90[0].toFixed(3)) + "," + String(gOppen.kredibeltIntervall90[1].toFixed(3)) + "]");

const gNITTON = grindInput(Q_PRIOR.impulsvag_bekraftad, 29, 0, KAPPA.impulsvag_bekraftad, PHI_DESIGN.impulsvag_bekraftad, 0.45);
kolla("F2: exakt gräns — T=29 ⇒ n_eff=19 ⇒ STÄNGD (öppnar exakt vid n_eff=20, acceptans §11.6.ii)",
  gNITTON.nEff === 19 && bordeGrindenOppnas(gNITTON) === false, "n_eff=" + String(gNITTON.nEff));

const gIntervall = grindInput(Q_PRIOR.impulsvag_bekraftad, 20, 20, KAPPA.impulsvag_bekraftad, PHI_DESIGN.impulsvag_bekraftad, 0.45);
kolla("F3: villkor (ii) — T=M=20 (n_eff=26) men KI spänner över 0,50 ⇒ STÄNGD",
  gIntervall.nEff >= 20 && gIntervall.kredibeltIntervall90[0] < 0.5 && gIntervall.kredibeltIntervall90[1] > 0.5 &&
  bordeGrindenOppnas(gIntervall) === false, "KI=[" + String(gIntervall.kredibeltIntervall90[0].toFixed(3)) + "," + String(gIntervall.kredibeltIntervall90[1].toFixed(3)) + "]");

const gRate = grindInput(Q_PRIOR.korrigering_lag_g, 30, 0, KAPPA.korrigering_lag_g, PHI_DESIGN.korrigering_lag_g, 0.45);
kolla("F4: villkor (iii) — Φ-förslag 1,07 mot sittande 0,90 (|ΔΦ|=0,17>0,05) ⇒ STÄNGD trots n_eff=20 + KI klart",
  gRate.nEff === 20 && gRate.kredibeltIntervall90[0] > 0.5 && Math.abs(gRate.phiForslag - gRate.phiSittande) > 0.05 &&
  bordeGrindenOppnas(gRate) === false, "Φ=" + String(gRate.phiForslag) + " mot " + String(gRate.phiSittande));

const beslut = grindBeslut(gOppen);
kolla("F5: GRINDEN LÅST — grindBeslut nekar ÄVEN när alla villkor är uppfyllda: oppna=false, ΔΦ=0, status vantar-grind",
  beslut.oppna === false && beslut.deltaPhi === 0 && beslut.status === "vantar-grind" &&
  beslut.allaVillkorUppfyllda === true, beslut.status + "/ΔΦ=" + String(beslut.deltaPhi));

const statNoll = raknaFasStatistik([], 0.45);
kolla("F6: tom data ⇒ alla faser rena priors, n_eff=0, grinden stängd, status vantar-grind",
  KALIBRERBARA_FASER.every((f) => statNoll[f].nEff === 0 && statNoll[f].posterior.T === 0 &&
    statNoll[f].posterior.M === 0 && statNoll[f].grind.oppna === false && statNoll[f].grind.status === "vantar-grind"), true);

kolla("F7: rollback-kontraktet (§10.11): −8 pp inom 90 dagar (n_eff≥30) ⇒ återkalla; −4 pp / 91 dagar / n_eff 29 ⇒ nej",
  bordeAterkalla({ traffNyProcent: 52, traffGammalProcent: 60, dagarSedanFramjande: 89, nEff: 31 }) === true &&
  bordeAterkalla({ traffNyProcent: 56, traffGammalProcent: 60, dagarSedanFramjande: 89, nEff: 31 }) === false &&
  bordeAterkalla({ traffNyProcent: 52, traffGammalProcent: 60, dagarSedanFramjande: 91, nEff: 31 }) === false &&
  bordeAterkalla({ traffNyProcent: 52, traffGammalProcent: 60, dagarSedanFramjande: 89, nEff: 29 }) === false, true);

// ═══ G. RONDEN: determinism, hash-kedja, rapport ═════════════════════════════
rubrik("G. RONDEN — determinism + hash-kedjad versionslogg (append-only)");

const syntetRader: KalibreringDomRad[] = [
  // Episod A: obekräftad impuls, 3 träff + 1 miss ⇒ träff
  rad({ ticker: "AAA.ST", variabel: "V01", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-10", dom: "traff" }),
  rad({ ticker: "AAA.ST", variabel: "V01", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-11", dom: "traff" }),
  rad({ ticker: "AAA.ST", variabel: "V01", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-12", dom: "traff" }),
  rad({ ticker: "AAA.ST", variabel: "V01", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-13", dom: "miss" }),
  // Episod B: bekräftad impuls (Q3→Q4), 2 träff ⇒ träff
  rad({ ticker: "BBB.ST", variabel: "V01", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-12-05", dom: "traff" }),
  rad({ ticker: "BBB.ST", variabel: "V01", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-12-06", dom: "traff" }),
  // Episod C: korrigering utan G ⇒ fas osatt + diagnostikpool
  rad({ ticker: "AAA.ST", variabel: "V04", horisont: "medellang", klass: "korrigering", episodStart: "2026-09-10", dag: "2026-09-11", dom: "traff" }),
  rad({ ticker: "AAA.ST", variabel: "V04", horisont: "medellang", klass: "korrigering", episodStart: "2026-09-10", dag: "2026-09-12", dom: "traff" }),
  rad({ ticker: "AAA.ST", variabel: "V04", horisont: "medellang", klass: "korrigering", episodStart: "2026-09-10", dag: "2026-09-13", dom: "miss" }),
  // Episod D: basbygge, 1 miss ⇒ miss
  rad({ ticker: "DDD.ST", variabel: "V07", horisont: "medellang", klass: "basbygge", episodStart: "2026-09-10", dag: "2026-09-10", dom: "miss" }),
  // Episod E: mogen impuls (2025Q4→2026Q3), 1 miss ⇒ miss
  rad({ ticker: "EEE.ST", variabel: "V09", horisont: "lang", klass: "impulsvåg", episodStart: "2025-12-01", dag: "2026-09-20", dom: "miss" }),
  // Episod F: obekräftad impuls, 1 träff + 1 miss ⇒ osatt (utesluten)
  rad({ ticker: "FFF.ST", variabel: "V11", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-10", dom: "traff" }),
  rad({ ticker: "FFF.ST", variabel: "V11", horisont: "kort", klass: "impulsvåg", episodStart: "2026-09-10", dag: "2026-09-11", dom: "miss" }),
];

const rondIndata = {
  domRader: syntetRader,
  momentumCeller: [],
  genererad: "2026-10-02T05:20:00.000Z",
  datum: "2026-10-02",
  manad: "2026-10",
  tidigareLogg: null as KalibreringLogg | null,
  digest: sha256,
  rhoOverride: 0.45,
};
const rond1 = byggKalibreringsRond(rondIndata);
const rond1b = byggKalibreringsRond(rondIndata);

kolla("G1: determinism — 2 körningar med samma indata ⇒ JSON-identiskt resultat (P1)",
  JSON.stringify(rond1) === JSON.stringify(rond1b), JSON.stringify(rond1) === JSON.stringify(rond1b));

kolla("G2: episoder + faser — 6 episoder: obekräftad T1 · bekräftad T1 · mogen M1 · basbygge M1 · korrigering→osatt-pool",
  rond1.episoderTotalt === 6 &&
  rond1.faser.impulsvag_obekraftad.posterior.T === 1 &&
  rond1.faser.impulsvag_bekraftad.posterior.T === 1 &&
  rond1.faser.impulsvag_mogen.posterior.M === 1 &&
  rond1.faser.basbygge.posterior.M === 1 &&
  rond1.korrigeringGOkand.episoder === 1 && rond1.korrigeringGOkand.traff === 1,
  "episoder=" + String(rond1.episoderTotalt));

kolla("G3: osatt-poolen: 1 episod (korrigering-utan-G) · 1 odömd episod (lika T/M — vittnade inte) · ΔΦ=0 överallt",
  rond1.osatt.episoder === 1 && rond1.odomdaEpisoder === 1 && rond1.deltaPhi === 0 &&
  KALIBRERBARA_FASER.every((f) => rond1.faser[f].grind.deltaPhi === 0), rond1.osatt.episoder + "/" + rond1.odomdaEpisoder);

kolla("G4: korrigering-faserna matas INTE utan G — rena priors trots mätta korrigering-episoder",
  rond1.faser.korrigering_hog_g.posterior.T === 0 && rond1.faser.korrigering_hog_g.posterior.M === 0 &&
  rond1.faser.korrigering_lag_g.posterior.T === 0 && rond1.faser.korrigering_lag_g.posterior.M === 0, true);

kolla("G5: loggrad v1: prevHash=null · typ matning · ΔΦ=0 · grindLasad · hash = sha256(kanonisk rad)",
  rond1.loggRad !== null && rond1.loggRad.version === 1 && rond1.loggRad.prevHash === null &&
  rond1.loggRad.typ === "matning" && rond1.loggRad.deltaPhi === 0 && rond1.loggRad.grindLasad === true &&
  rond1.loggRad.hash === raknaLoggRadHash(rond1.loggRad!, sha256),
  rond1.loggRad?.hash.slice(0, 12) + "...");

const logg1: KalibreringLogg = { schema: "kalibrering/1", protokollVersion: 1, skapad: "2026-10-02", rader: [rond1.loggRad!], senasteHash: rond1.loggRad!.hash };
const rond2 = byggKalibreringsRond({ ...rondIndata, manad: "2026-11", datum: "2026-11-02", tidigareLogg: logg1 });
kolla("G6: append — rad 2 länkar prevHash till rad 1:s hash · kedjan verifierar hel",
  rond2.loggRad !== null && rond2.loggRad.prevHash === rond1.loggRad!.hash && rond2.loggRad.version === 2 &&
  valideraKedja([rond1.loggRad!, rond2.loggRad!], sha256).ok === true,
  rond2.loggRad?.hash.slice(0, 12) + "...");

const manipulerad = JSON.parse(JSON.stringify(rond1.loggRad!)) as KalibreringLoggRad;
manipulerad.faser.impulsvag_bekraftad.T = 99; // retroaktiv ändring — ska upptäckas
kolla("G7: tamper-vakt — retroaktivt ändrad rad bryter kedjan (brutetVid=1)",
  valideraKedja([manipulerad, rond2.loggRad!], sha256).ok === false &&
  valideraKedja([manipulerad, rond2.loggRad!], sha256).brutetVid === 1, valideraKedja([manipulerad, rond2.loggRad!], sha256).brutetVid);

const rondBruten = byggKalibreringsRond({ ...rondIndata, tidigareLogg: logg1, kedjaBruten: true });
kolla("G8: bruten kedja ⇒ INGEN loggrad + öppen varning (append-only-kontraktet)",
  rondBruten.loggRad === null && rondBruten.varningar.some((v) => v.includes("hash-kedjan bruten")), rondBruten.varningar.length);

kolla("G9: kanoniskJson — nyckelordning spelar ingen roll (deterministiskt hash-underlag)",
  kanoniskJson({ b: 1, a: { d: 2, c: 3 } }) === kanoniskJson({ a: { c: 3, d: 2 }, b: 1 }), kanoniskJson({ b: 1, a: { d: 2, c: 3 } }));

const varFas = raknaVariabelFasRader(episodRaknare(syntetRader));
kolla("G10: per (variabel, fas) — V01 två rader (obekräftad + bekräftad), korrigering/rader exkluderade, sorterat",
  varFas.length === 4 && varFas[0].variabel === "V01" && varFas[0].fas === "impulsvag_bekraftad" &&
  varFas.every((r) => r.fas !== "osatt" && r.episoder > 0), varFas.length);

// ═══ H. RAPPORTEN ════════════════════════════════════════════════════════════
rubrik("H. RAPPORTEN — data/rapporter/akm3-kalibrering-SENASTE.md");

const rapport = byggKalibreringsRapport(rond1);
kolla("H1: låst grind syns — 'SAMLAR bara data', 'ΔΦ = 0', 'design-2026-09-03', 'vantar-grind'",
  rapport.includes("SAMLAR bara data") && rapport.includes("ΔΦ = 0") &&
  rapport.includes("design-2026-09-03") && rapport.includes("vantar-grind"), true);

kolla("H2: alla sex faser + schema + villkorskolonner + rollback-kontraktet + disclaimer",
  rapport.includes("kalibrering/1") &&
  KALIBRERBARA_FASER.every((f) => rapport.includes(f === "impulsvag_bekraftad" ? "impulsvåg bekräftad" : f === "impulsvag_obekraftad" ? "impulsvåg obekräftad" : f === "impulsvag_mogen" ? "impulsvåg mogen" : f === "basbygge" ? "basbygge" : f === "korrigering_hog_g" ? "korrigering, G ≥ 3" : "korrigering, G ≤ 2")) &&
  rapport.includes("(i) n_eff ≥ 20") && rapport.includes("(ii) intervall klart") && rapport.includes("(iii) ±0,05") &&
  rapport.includes("återkallad öppet") && rapport.includes("inte investeringsråd"), true);

kolla("H3: handlingsgrindens villkor redovisas med sin exakta text",
  rapport.includes(HANDLINGSGRIND_TEXT), true);

kolla("H4: rapporten är deterministisk — samma rond ⇒ byte-identisk rapport",
  byggKalibreringsRapport(rond1b) === rapport, true);

kolla("H5: korrigering-utan-G diagnostiken förklaras öppet (korrigeringGOkand)",
  rapport.includes("G okänd") && rapport.includes(String(rond1.korrigeringGOkand.episoder)), true);

// ═══ SAMMANFATTNING ══════════════════════════════════════════════════════════
rubrik("SAMMANFATTNING");
const antalFail = KOLL.filter((k) => !k.ok).length;
console.log("  " + KOLL.length + " kontroller, " + (KOLL.length - antalFail) + " PASS, " + antalFail + " FAIL");
for (const k of KOLL.filter((x) => !x.ok)) console.log("  FAIL: " + k.namn + " (" + k.detalj + ")");
console.log("");
console.log("Pedagogiskt verktyg — inte investeringsråd.");
process.exit(antalFail > 0 ? 1 : 0);
`;

// ── 2) Skriv tmp-fil, kör via tsx, städa ────────────────────────────────────
function main() {
  writeFileSync(TMP_TS, TS_KOD, "utf8");
  console.log("[testa-akm3-kalibrering] kör npx --yes tsx tmp_kalibrering_koll.ts ...");
  const barn = spawnSync("npx", ["--yes", "tsx", "tmp_kalibrering_koll.ts"], {
    cwd: REPO,
    stdio: "inherit",
    shell: true,
    timeout: TIMEOUT_MS,
  });
  try {
    unlinkSync(TMP_TS);
  } catch {
    /* tmp-filen fick inte skapas/fanns inte — inget att städa */
  }
  if (barn.error) {
    console.error("[testa-akm3-kalibrering] kunde inte köra tsx: " + barn.error.message);
    process.exit(1);
  }
  const kod = barn.status === null ? 1 : barn.status;
  console.log(
    "[testa-akm3-kalibrering] avslutskod " + kod +
    (kod === 0 ? " — alla kontroller godkända" : " — minst en kontroll misslyckades")
  );
  process.exit(kod);
}

main();
