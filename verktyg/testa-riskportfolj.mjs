#!/usr/bin/env node
/**
 * AK1A — Testsvit för riskportföljsmotorn (src/lib/portfolj-forskning/riskportfolj.ts).
 *
 * Tre tester enligt direktivet (node kan inte importera TS direkt — samma mönster
 * som verktyg/validera-motorer.mjs):
 *   (a) KONSERVATIV/LUGN på en fixture-pool med 15 syntetiska KorstabbellRad
 *       (5 branscher × 3, AKM1 spritt 50–90): 8–15 innehav, inget innehav bryter
 *       mot maxPerAktie/maxPerBransch, summa vikt = 1, alla krav kontrollerade,
 *       poängformeln dubbelräknad oberoende, samtliga 9 riskprofiler genomlöper
 *       de strukturella kontrollerna.
 *   (b) MUTATION TILL BROTT: en kandidat muteras (golv saknas, AKM1 52, alla
 *       horisonter i korrigering) → rattaErsattningar ger kandidater i SAMMA
 *       bransch utan BROTT; dessutom snapshot-vägen ("då vs nu") där en färsk
 *       UppfoljningSnapshot utlöser ersättningsrad.
 *   (c) DETERMINISM: två körningar ger JSON-identiskt resultat, även med omvänd
 *       indata-ordning; id/skapad stabila; ersättningar deterministiska.
 *
 * Användning:  node verktyg/testa-riskportfolj.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_KAT = path.join(REPO, ".tmp");
const TMP_NAMN = "tmp_riskportfolj_test.ts";
const TMP = path.join(TMP_KAT, TMP_NAMN);
const MARK_START = "===RISKPORTFOLJ_JSON_START===";
const MARK_END = "===RISKPORTFOLJ_JSON_END===";

// ── Genererad tmp-testfil (TS, körs via npx tsx, raderas efteråt) ─────────────
// OBS: inga backticks i koden nedan (den ligger själv i en template-literal).
const TS_KOD = String.raw`
// tmp_riskportfolj_test.ts — GENERERAD av verktyg/testa-riskportfolj.mjs. Raderas efter körning.
import {
  RISKNIVAER, RISK_NIVOR, RISK_TAKTER, hamtaRiskProfil, byggPortfolj,
  rattaErsattningar, raknaPoang, kontrolleraKrav, MIN_INNEHAV, MAX_INNEHAV,
} from "../src/lib/portfolj-forskning/riskportfolj";
import type {
  Bransch, Horisont, KorstabbellRad, RiskNiva, TillvaxtTakt, UppfoljningSnapshot, VagKlass,
} from "../src/lib/portfolj-forskning/typer";

const MARK_START = "===RISKPORTFOLJ_JSON_START===";
const MARK_END = "===RISKPORTFOLJ_JSON_END===";
const HZ: Horisont[] = ["mikro", "kort", "medellang", "lang", "mega"];

// Oberoende vågvikt-tabell för dubbelräkning av poängformeln.
const VAGVIKT: Record<string, number> = { impulsvag: 1, basbygge: 0.6, korrigering: 0.3, osatt: 0 };

type TestRad = { test: string; namn: string; ok: boolean; detalj: string };
const RADER: TestRad[] = [];
function kolla(test: string, namn: string, ok: boolean, detalj = ""): void {
  RADER.push({ test: test, namn: namn, ok: !!ok, detalj: detalj });
}

function v5(a: VagKlass, b: VagKlass, c: VagKlass, d: VagKlass, e: VagKlass): Record<Horisont, VagKlass> {
  return { mikro: a, kort: b, medellang: c, lang: d, mega: e };
}

function rad(
  ticker: string, namn: string, bransch: Bransch, akm1: number, golv: number | null,
  f: Record<Horisont, VagKlass>, t: Record<Horisont, VagKlass>,
  status: "gron" | "gul" | "rod" | "osatt"
): KorstabbellRad {
  return {
    ticker: ticker, namn: namn, bransch: bransch, akm1Totalt: akm1,
    akm1PerKategori: {
      Tillvaxt: Math.round(akm1 * 0.3), Vardering: Math.round(akm1 * 0.2), Losamhet: Math.round(akm1 * 0.2),
      Stabilitet: Math.round(akm1 * 0.15), Moat: Math.round(akm1 * 0.15),
    },
    fvagPerHorisont: f, fvagDynamik: "forbattras", tvagPerHorisont: t,
    golvMarginal: golv, senastKontrollerad: "2026-09-01", status: status,
  };
}

// ── Fixture: 15 syntetiska korstabellrader — 5 branscher × 3, AKM1 50–90 ─────
const FIXTUR: KorstabbellRad[] = [
  rad("SIM-AA", "Simulator Alpha", "teknik", 90, 0.25,
    v5("impulsvag", "impulsvag", "impulsvag", "basbygge", "basbygge"),
    v5("impulsvag", "impulsvag", "basbygge", "basbygge", "basbygge"), "gron"),
  rad("SIM-AB", "Simulator Beta", "teknik", 85, 0.18,
    v5("impulsvag", "basbygge", "impulsvag", "basbygge", "basbygge"),
    v5("basbygge", "impulsvag", "basbygge", "basbygge", "basbygge"), "gron"),
  rad("SIM-AC", "Simulator Gamma", "teknik", 78, 0.22,
    v5("impulsvag", "impulsvag", "korrigering", "basbygge", "basbygge"),
    v5("basbygge", "basbygge", "basbygge", "impulsvag", "basbygge"), "gron"),
  rad("SIM-BA", "Simulator Delta", "halso", 82, 0.15,
    v5("impulsvag", "basbygge", "basbygge", "basbygge", "impulsvag"),
    v5("basbygge", "basbygge", "impulsvag", "basbygge", "basbygge"), "gron"),
  rad("SIM-BB", "Simulator Epsilon", "halso", 74, 0.08,
    v5("basbygge", "impulsvag", "basbygge", "basbygge", "korrigering"),
    v5("basbygge", "basbygge", "basbygge", "basbygge", "impulsvag"), "gul"),
  rad("SIM-BC", "Simulator Zeta", "halso", 68, null,
    v5("impulsvag", "basbygge", "basbygge", "basbygge", "basbygge"),
    v5("basbygge", "impulsvag", "basbygge", "basbygge", "basbygge"), "rod"),
  rad("SIM-CA", "Simulator Eta", "industri", 80, 0.12,
    v5("impulsvag", "basbygge", "impulsvag", "basbygge", "basbygge"),
    v5("basbygge", "impulsvag", "basbygge", "basbygge", "basbygge"), "gron"),
  rad("SIM-CB", "Simulator Theta", "industri", 72, 0.05,
    v5("basbygge", "impulsvag", "korrigering", "basbygge", "basbygge"),
    v5("basbygge", "basbygge", "basbygge", "basbygge", "basbygge"), "gul"),
  rad("SIM-CC", "Simulator Iota", "industri", 64, -0.05,
    v5("impulsvag", "korrigering", "basbygge", "korrigering", "basbygge"),
    v5("korrigering", "korrigering", "basbygge", "korrigering", "basbygge"), "rod"),
  rad("SIM-DA", "Simulator Kappa", "konsument", 76, 0.10,
    v5("impulsvag", "basbygge", "basbygge", "basbygge", "basbygge"),
    v5("basbygge", "basbygge", "impulsvag", "basbygge", "basbygge"), "gron"),
  rad("SIM-DB", "Simulator Lambda", "konsument", 70, 0.03,
    v5("basbygge", "korrigering", "basbygge", "korrigering", "basbygge"),
    v5("basbygge", "basbygge", "basbygge", "korrigering", "basbygge"), "gul"),
  rad("SIM-DC", "Simulator My", "konsument", 62, 0.30,
    v5("impulsvag", "impulsvag", "basbygge", "basbygge", "basbygge"),
    v5("impulsvag", "basbygge", "basbygge", "basbygge", "basbygge"), "rod"),
  rad("SIM-EA", "Simulator Ny", "finans", 86, 0.14,
    v5("impulsvag", "impulsvag", "basbygge", "basbygge", "impulsvag"),
    v5("basbygge", "impulsvag", "basbygge", "basbygge", "basbygge"), "gron"),
  rad("SIM-EB", "Simulator Xi", "finans", 66, 0.06,
    v5("basbygge", "impulsvag", "korrigering", "basbygge", "korrigering"),
    v5("impulsvag", "basbygge", "korrigering", "basbygge", "korrigering"), "gul"),
  rad("SIM-EC", "Simulator Omikron", "finans", 50, 0.02,
    v5("basbygge", "korrigering", "basbygge", "basbygge", "impulsvag"),
    v5("korrigering", "basbygge", "basbygge", "basbygge", "basbygge"), "rod"),
];

const branschMap = new Map<string, string>(FIXTUR.map((r) => [r.ticker, r.bransch]));

// ══════════════════════════════════════════════════════════════════════════
// TEST A — konservativ/lugn på fixture-poolen + samtliga 9 profiler
// ══════════════════════════════════════════════════════════════════════════
const PROF = hamtaRiskProfil("konservativ", "lugn");
const fA = byggPortfolj(PROF, FIXTUR);

const nycklar = Object.keys(RISKNIVAER);
kolla("a", "RISKNIVAER-tabellen har 9 kombinationer", nycklar.length === 9, nycklar.join(", "));

let allaVikterOk = true;
let mikroLag = true;
for (const nyckel of nycklar) {
  const p = RISKNIVAER[nyckel];
  const s = HZ.reduce((acc, hz) => acc + p.horisontVikter[hz], 0);
  if (Math.abs(s - 1) > 1e-9) allaVikterOk = false;
  if (p.horisontVikter.mikro > 0.1) mikroLag = false;
}
kolla("a", "horisontVikter summerar till 1 för alla 9 (±1e-9)", allaVikterOk);
kolla("a", "mikro har låg vikt (≤ 10 %) i alla 9 kombinationer", mikroLag);

kolla("a", "8–15 innehav", fA.innehav.length >= MIN_INNEHAV && fA.innehav.length <= MAX_INNEHAV, String(fA.innehav.length) + " innehav");

const viktSumma = fA.innehav.reduce((acc, i) => acc + i.vikt, 0);
kolla("a", "vikterna summerar till 1 (±1e-9)", Math.abs(viktSumma - 1) <= 1e-9, viktSumma.toFixed(6));

const overTak = fA.innehav.filter((i) => i.vikt > PROF.maxPerAktie + 1e-9);
kolla("a", "inget innehav bryter mot maxPerAktie (" + PROF.maxPerAktie + ")", overTak.length === 0,
  overTak.length === 0 ? "max vikt " + Math.max(...fA.innehav.map((i) => i.vikt)).toFixed(4) : overTak.map((i) => i.ticker).join(", "));

const branschSummor = new Map<string, number>();
for (const i of fA.innehav) {
  const b = branschMap.get(i.ticker) ?? "?";
  branschSummor.set(b, (branschSummor.get(b) ?? 0) + i.vikt);
}
const overBransch = [...branschSummor.entries()].filter(([, v]) => v > PROF.maxPerBransch + 1e-9);
kolla("a", "ingen bransch bryter mot maxPerBransch (" + PROF.maxPerBransch + ")", overBransch.length === 0,
  overBransch.length === 0 ? [...branschSummor.entries()].map(([b, v]) => b + " " + v.toFixed(4)).join(", ") : overBransch.map(([b, v]) => b + " " + v.toFixed(4)).join(", "));

const unikaTickers = new Set(fA.innehav.map((i) => i.ticker));
kolla("a", "alla tickers unika", unikaTickers.size === fA.innehav.length);

const giltigaStatus = new Set(["OK", "VARNING", "BROTT"]);
const kravAntalRatt = fA.innehav.every((i) => i.krav.length === 4); // konservativ: AKM1 + Golv finnes + Vågstatus + Golv-marginal
kolla("a", "exakt 4 krav kontrollerade per innehav (konservativ profil)", kravAntalRatt);
const kravGiltiga = fA.innehav.every((i) => i.krav.every((k) => giltigaStatus.has(k.status) && k.namn.length > 0 && k.detalj.length > 0));
kolla("a", "alla krav har giltig status och icke-tom detalj", kravGiltiga);
const nagotOk = fA.innehav.some((i) => i.krav.some((k) => k.status === "OK"));
kolla("a", "minst ett OK-krav finns i portföljen", nagotOk);

// Poängformeln dubbelräknas oberoende för SIM-AA (konservativ/lugn).
const pAA = FIXTUR[0];
let vagOberoende = 0;
for (const hz of HZ) {
  vagOberoende += PROF.horisontVikter[hz] * ((VAGVIKT[pAA.fvagPerHorisont[hz]] + VAGVIKT[pAA.tvagPerHorisont[hz]]) / 2);
}
const forvantatPoang = 0.5 * (pAA.akm1Totalt / 100) + 0.35 * vagOberoende + 0.15 * Math.min(Math.max((pAA.golvMarginal ?? 0) / 0.5, 0), 1);
const faktiskPoang = raknaPoang(pAA, PROF);
kolla("a", "poängformeln stämmer vid oberoende omräkning (SIM-AA)", Math.abs(forvantatPoang - faktiskPoang) < 1e-12,
  "förväntat " + forvantatPoang.toFixed(6) + " mot " + faktiskPoang.toFixed(6));

kolla("a", "ak1aNot innehåller juridisk formulering", fA.ak1aNot.includes("inte investeringsrådgivning") && fA.ak1aNot.includes("2007:528"));
kolla("a", "inga NaN-vikter", fA.innehav.every((i) => Number.isFinite(i.vikt)));

// Samtliga 9 profiler genomlöper strukturkontrollerna på samma pool.
let nioOk = true;
let nioDetalj = "";
for (const n of RISK_NIVOR) {
  for (const t of RISK_TAKTER) {
    const p = hamtaRiskProfil(n, t);
    const f = byggPortfolj(p, FIXTUR);
    const s = f.innehav.reduce((acc, i) => acc + i.vikt, 0);
    const takAkt = f.innehav.every((i) => i.vikt <= p.maxPerAktie + 1e-9);
    const bs = new Map<string, number>();
    for (const i of f.innehav) {
      const b = branschMap.get(i.ticker) ?? "?";
      bs.set(b, (bs.get(b) ?? 0) + i.vikt);
    }
    const takBr = [...bs.values()].every((v) => v <= p.maxPerBransch + 1e-9);
    if (f.innehav.length < MIN_INNEHAV || f.innehav.length > MAX_INNEHAV || Math.abs(s - 1) > 1e-9 || !takAkt || !takBr) {
      nioOk = false;
      nioDetalj = n + "/" + t;
    }
  }
}
kolla("a", "samtliga 9 profiler: 8–15 innehav, sum=1, tak respekterade", nioOk, nioDetalj);

// ══════════════════════════════════════════════════════════════════════════
// TEST B — mutation till BROTT + snapshot-väg ("då vs nu")
// ══════════════════════════════════════════════════════════════════════════
const MUT: KorstabbellRad[] = FIXTUR.map((r) =>
  r.ticker === "SIM-AA"
    ? {
        ...r,
        akm1Totalt: 52,
        golvMarginal: null,
        fvagPerHorisont: v5("korrigering", "korrigering", "korrigering", "korrigering", "korrigering"),
        tvagPerHorisont: v5("korrigering", "korrigering", "korrigering", "korrigering", "korrigering"),
      }
    : r
);
const fB = byggPortfolj(PROF, MUT);
const inhAA = fB.innehav.find((i) => i.ticker === "SIM-AA");
kolla("b", "muterat innehav (SIM-AA) finns med i portföljen", !!inhAA);
kolla("b", "muterat innehav har minst ett BROTT-krav", !!inhAA && inhAA.krav.some((k) => k.status === "BROTT"));

const eB = rattaErsattningar(fB, MUT);
const radAA = eB.find((e) => e.ersattTicker === "SIM-AA");
kolla("b", "ersättningsrad finns för SIM-AA", !!radAA);
kolla("b", "1–3 ersättningskandidater", !!radAA && radAA.kandidater.length >= 1 && radAA.kandidater.length <= 3,
  radAA ? radAA.kandidater.map((k) => k.ticker).join(", ") : "saknas");
kolla("b", "kandidater i samma bransch (teknik)",
  !!radAA && radAA.kandidater.every((k) => branschMap.get(k.ticker) === "teknik"),
  radAA ? radAA.kandidater.map((k) => k.ticker + " (" + branschMap.get(k.ticker) + ")").join(", ") : "saknas");
kolla("b", "kandidater utan BROTT enligt kontrolleraKrav",
  !!radAA && radAA.kandidater.every((k) => {
    const r = MUT.find((x) => x.ticker === k.ticker);
    return !!r && kontrolleraKrav(r, PROF).every((x) => x.status !== "BROTT");
  }));
kolla("b", "skillnadMotErsatt har jämförelseformat (AKM1 X vs Y)",
  !!radAA && radAA.kandidater.every((k) => /AKM1 \d+ vs \d+/.test(k.skillnadMotErsatt)),
  radAA && radAA.kandidater.length > 0 ? radAA.kandidater[0].skillnadMotErsatt : "saknas");
kolla("b", "ersättningsrader har icke-tom orsak", eB.length >= 1 && eB.every((e) => e.orsak.length > 0), eB.length + " rader");

// Snapshot-vägen: SIM-EA är rent i balanserad/stadig men färsk snapshot bryter.
const PROF_BAL = hamtaRiskProfil("balanserad", "stadig");
const fBal = byggPortfolj(PROF_BAL, FIXTUR);
const snap: UppfoljningSnapshot = {
  ticker: "SIM-EA", datum: "2026-10-01", akm1Totalt: 40,
  fvagPerHorisont: v5("korrigering", "korrigering", "basbygge", "korrigering", "korrigering"),
  tvagPerHorisont: v5("korrigering", "korrigering", "korrigering", "basbygge", "korrigering"),
  pris: 100, forandringPris: -0.2, forandringAkm1: -46,
};
const eSnap = rattaErsattningar(fBal, FIXTUR, [snap]);
const radEA = eSnap.find((e) => e.ersattTicker === "SIM-EA");
kolla("b", "snapshot-BROTT ger ersättningsrad för SIM-EA", !!radEA);
kolla("b", "orsak nämner uppföljning (då vs nu)", !!radEA && radEA.orsak.includes("Uppföljning"), radEA ? radEA.orsak.slice(0, 90) : "saknas");
kolla("b", "snapshot-kandidater i samma bransch (finans)",
  !!radEA && radEA.kandidater.every((k) => branschMap.get(k.ticker) === "finans"),
  radEA ? radEA.kandidater.map((k) => k.ticker).join(", ") : "saknas");
kolla("b", "SIM-EB (brottfri i balanserad) är kandidat", !!radEA && radEA.kandidater.some((k) => k.ticker === "SIM-EB"));

// ══════════════════════════════════════════════════════════════════════════
// TEST C — determinism
// ══════════════════════════════════════════════════════════════════════════
const c1 = byggPortfolj(PROF, FIXTUR);
const c2 = byggPortfolj(PROF, FIXTUR);
const c3 = byggPortfolj(PROF, [...FIXTUR].reverse());
kolla("c", "två körningar ger JSON-identiskt förslag", JSON.stringify(c1) === JSON.stringify(c2));
kolla("c", "omvänd indata-ordning ger identiskt förslag", JSON.stringify(c1) === JSON.stringify(c3));
kolla("c", "id och skapad är stabila", c1.id === c2.id && c1.skapad === c2.skapad, c1.id + " / " + c1.skapad);
kolla("c", "ersättningar deterministiska", JSON.stringify(rattaErsattningar(c1, FIXTUR)) === JSON.stringify(rattaErsattningar(c2, FIXTUR)));
kolla("c", "ersättningar deterministiska även med snapshot",
  JSON.stringify(rattaErsattningar(fBal, FIXTUR, [snap])) === JSON.stringify(rattaErsattningar(byggPortfolj(PROF_BAL, FIXTUR), FIXTUR, [snap])));

// ── Utdata ──────────────────────────────────────────────────────────────────
const totalt = RADER.length;
const fail = RADER.filter((r) => !r.ok).length;
console.log(MARK_START);
console.log(JSON.stringify({ rader: RADER, totalt: totalt, fail: fail }));
console.log(MARK_END);
`;

// ── Kör tmp-filen via tsx och tolka JSON-blocket ─────────────────────────────
// .tmp/ = våg 150:s gitignorerade engångsyta, tsconfig-exkluderad (o44).
let resultat = null;
try {
  mkdirSync(TMP_KAT, { recursive: true });
  writeFileSync(TMP, TS_KOD, "utf8");
  const proc = spawnSync("npx", ["--yes", "tsx", ".tmp/" + TMP_NAMN], {
    cwd: REPO,
    shell: true,
    encoding: "utf8",
    timeout: 180000,
    env: { ...process.env, NO_COLOR: "1" },
  });
  const ut = proc.stdout ?? "";
  const start = ut.indexOf(MARK_START);
  const end = ut.indexOf(MARK_END);
  if (start >= 0 && end > start) {
    resultat = JSON.parse(ut.slice(start + MARK_START.length, end).trim());
  } else {
    console.error("Kunde inte läsa JSON-block från testkörningen.");
    console.error("--- stdout (första 3000 tecknen) ---");
    console.error(ut.slice(0, 3000));
    console.error("--- stderr (första 3000 tecknen) ---");
    console.error((proc.stderr ?? "").slice(0, 3000));
    process.exitCode = 1;
  }
} catch (fel) {
  console.error("Testkörningen misslyckades: " + (fel && fel.message ? fel.message : String(fel)));
  process.exitCode = 1;
} finally {
  try {
    unlinkSync(TMP);
  } catch {
    /* tmp-filen fanns inte — ignorera */
  }
}

// ── Rapport ──────────────────────────────────────────────────────────────────
if (resultat) {
  console.log("");
  console.log("AK1A RISKPORTFÖLJSMOTOR — TESTSVIT (konservativ|balanserad|tillväxt × lugn|stadig|aggressiv)");
  console.log("=".repeat(84));
  for (const r of resultat.rader) {
    const status = r.ok ? "PASS" : "FAIL";
    const detalj = r.detalj ? "  — " + r.detalj : "";
    console.log("[" + status + "] (" + r.test + ") " + r.namn + detalj);
  }
  console.log("=".repeat(84));
  const pass = resultat.totalt - resultat.fail;
  console.log("Resultat: " + pass + " PASS / " + resultat.fail + " FAIL av " + resultat.totalt + " kontroller.");
  if (resultat.fail > 0) process.exitCode = 1;
}
