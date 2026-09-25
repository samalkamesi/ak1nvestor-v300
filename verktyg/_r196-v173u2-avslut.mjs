#!/usr/bin/env node
/**
 * _r196-v173u2-avslut.mjs — v173 U2 (rond 196) bokföring + commit + push + verifiering,
 * allt i node-kanalen: worklog-rondrad · PIPELINE-KO · beslutsminne (båda instanserna,
 * den gitignorerade + spegeln) · commitmsg-fil · git add/commit/push · efter-PUSH live-mätning.
 * Idempotent where feasible; kvitto: /tmp/r196-avslut.txt
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { spawnSync as sp } from "node:child_process";

const A = "/home/ak1a/agent/ak1";
const ut = [];
const run = (args, tag) => {
  const r = sp("git", args, { cwd: A, encoding: "utf8", maxBuffer: 32 * 1024 * 1024, timeout: 240000 });
  ut.push(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-2).join(" | ").slice(0, 260)}`);
  return r;
};

// ── 1. worklog ────────────────────────────────────────────────────────────────
const RUBRIK = "## ROND 196 [organ:Φ] — v173 dataset-djup U2 LEVERERAD: Panasonic 6752.T (Japan/teknik, +1) — universum 263→264, llms HELREGEN på 264-läget, läckagevakt 0, tsc 0, prod 200 ×5 — 2026-09-25";
const RAD =
"v173 U2 levererad enligt postmallen (U1-_r195-mönstret exakt): PANASONIC HOLDINGS 6752.T i Japan/teknik (28→29; cellen hade endast 8035.T — OMG20-komplementets ordagranna motivering «sektorn Technology i källan ⇒ hade landat i Japan/teknik» är själva kandidaturen; Japan-cellen 21→22). Källdata StockAnalysis TYO tre paneler FÄRSKA 2026-09-25 09:46 JST (pris 4 517 JPY; cache-bypass): repliker EXAKTA (P/B 1,89 på källans mcap/EK-bas · PS 1,29 · EBIT-M 6,77 · netto-M 3,10 · FCF-Y 2,25 · D/E 0,28) eller dokumenterade (P/E 41,57 med 0,2 % spridning; ROE 5,25 källtal med TTM-replik 4,55 dokumenterad). ÄRLIGHETSPOSTER ÖPPET: prognosTillväxt +104,88 % (fwd P/E 20,29 mot trailing 41,57 — EPS-dubblingskonsensus på AI/datacenter; spår-PEG 0,40, källans 0,49 kalibreringsnot) · STRUKTURBROTT FY2026 (Automotive DEKONSOLIDERAT + restrukturering: FY26-netto −48 % bär engångsposter; CAGR på 4-årig HEL serie med brottet dokumenterat — oms +2,16 % · netto −7,18 %) · Altman 2,23 UNDER 3 (källans riskflagga som datafakta) · ROIC 6,80 % under WACC 7,99 %. KVD: append 263+/0− läs-tillbaka ×2 + fältgrind mot 4452.T · llms K2 round-trip (teknik P75 37,5→38 n 28→29 · totalt n 251→252 · 10 aspektrader bevarade) · läckagevakt 0 träffar (264 bolag/476 sökningar) · tsc 0 fel · prod 200 ×5 · prod-trädet RENT (ingen adoption behövdes — rond 195:s motorervalidering var enda M). Rapportdag 10-30 (Q2 FY2027) → v172-könotis (dagen efter 4661.T:s 10-29). Kö: Kirin 2503.T (engångspost-analys) · rappdagarna → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår i sessionen (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U2-6752T-PANASONIC-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 196")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 196 appendad");
} else ut.push("worklog: ROND 196 fanns — SKIPPAD");

// ── 2. PIPELINE-KO: v173-radens U1-läge → U2-läge ────────────────────────────
const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
const markU1 = "PÅBÖRJAD r195: U1 LEVERERAD";
if (pk.includes(markU1)) {
  pk = pk.replace(
    "PÅBÖRJAD r195: U1 LEVERERAD — Oriental Land 4661.T Japan/konsument +1 (universum 262→263, llms HELREGEN, läckagevakt 0, prod 200; protokoll V173-U1-4661T) · nästa: U2 Panasonic 6752.T (Japan/teknik, färshämtning krävs) · Kirin 2503.T (engångspost-analys)",
    "PÅBÖRJAD r196: U1+U2 LEVERERADE — Oriental Land 4661.T Japan/konsument + Oriental Land… se protokoll V173-U1-4661T + U2 Panasonic 6752.T Japan/teknik (universum 262→264, llms HELREGEN ×2, läckagevakt 0 ×2, prod 200 ×2; protokoll V173-U2-6752T) · nästa: Kirin 2503.T (engångspost-analys) · rappdagar 10-29/10-30 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: v173-rad → U1+U2 LEVERERADE r196");
} else if (pk.includes("PÅBÖRJAD r196")) ut.push("PIPELINE-KO: redan bokförd");
else ut.push("PIPELINE-KO: VARNING — expected-läge hittades ej");

// ── 3. beslutsminne (gitignorerad huvud + committbar spegel) ─────────────────
const post = {
  rond: 196, organ: "Φ", ts: Date.now(),
  beslut: "v173 U2: Panasonic 6752.T (Japan/teknik +1) levererad — universum 263→264, llms HELREGEN, läckagevakt 0, tsc 0, prod 200. Ärlighet: prognos +105 % (EPS-dubblingskonsensus) + spår-PEG 0,40; FY26-strukturbrott (Automotive-deconsolidering) dokumenterat med CAGR på hel serie; Altman 2,23 öppet. Kö: Kirin 2503.T, rappdagar 10-29/10-30 → v172. R2: Q3-paketet väntar fortfarande kund.",
  bevis: "V173-U2-6752T-PANASONIC-UTOKNING.md + _r196-v173u2-*.mjs (kvitton /tmp/r196-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda instanserna (rond 196)");

// ── 4. commit + push ─────────────────────────────────────────────────────────
const MSG = `studio: [organ:Φ] v173 dataset-djup U2 LEVERERAD — Panasonic Holdings 6752.T (Japan/teknik +1): universum 263→264 kirurgiskt (0 gamla rader förändrade, läs-tillbaka ×2, fältgrind mot 4452.T), llms dataset-sektion HELREGEN på 264-läget (teknik P75 37,5→38, n 28→29, totalt n 251→252, 10 aspektrader bevarade), läckagevakt 0 träffar (264 bolag/476 sökningar), tsc 0 fel, prod 200 ×5, prod-trädet rent (ingen adoption). Färsk rådata StockAnalysis TYO 2026-09-25 09:46 JST (pris 4 517 JPY, cache-bypass); repliker EXAKTA (P/B på mcap/EK-bas, PS, EBIT-M, netto-M, FCF-Y, D/E) eller dokumenterade (P/E 0,2 %, ROE-källtal med TTM-replik). Ärlighetsposter öppet: prognosTillväxt +104,9 % (fwd P/E 20,29 mot trailing 41,57 — AI/datacenter-EPS-dubblingskonsensus; spår-PEG 0,40, källans 0,49 kalibreringsnot); STRUKTURBROTT FY2026 Automotive-deconsolidering dokumenterat (CAGR hel serie: oms +2,2 % · netto −7,2 %); Altman 2,23 under 3 redovisad. Rapportdag 10-30 → v172-könotis. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r196-v173u2-commitmsg.txt", MSG);
run(["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U2-6752T-PANASONIC-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r196-v173u2-universum-inlagg.mjs", "verktyg/_r196-v173u2-llms-regen.mjs", "verktyg/_r196-v173u2-lackagevakt.mjs", "verktyg/_r196-v173u2-commitmsg.txt", "verktyg/_r196-v173u2-avslut.mjs"], "add");
const c = run(["commit", "-F", "verktyg/_r196-v173u2-commitmsg.txt"], "commit");
if (c.status === 0) run(["push", "prod", "develop"], "push");

// ── 5. efter-PUSH verifiering ────────────────────────────────────────────────
if (c.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; 6752.T='+u.some(b=>b.ticker==='6752.T'))"], { encoding: "utf8" });
  ut.push("prod-trädet universum: " + (uni.stdout || "").trim());
  run(["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r196-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
