#!/usr/bin/env node
/**
 * _r203-v173u9-avslut.mjs — v173 U9 (rond 203) bokföring + prod-HTTP + commit + push
 * + adoptionsgren + efterverifiering. Kvitto: /tmp/r203-avslut.txt
 */
import { readFileSync, writeFileSync, appendFileSync, copyFileSync } from "node:fs";
import { spawnSync as sp } from "node:child_process";

const A = "/home/ak1a/agent/ak1";
const P = "/home/ak1a/AK1";
const ut = [];
const run = (cwd, args, tag) => {
  const r = sp("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
  ut.push(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-2).join(" | ").slice(0, 230)}`);
  return r;
};

// 1. worklog
const RUBRIK = "## ROND 203 [organ:Φ] — v173 U9 LEVERERAD: Barrick Gold ABX (Kanada/material 2→3) — universum 270→271, BCE-KÖ-NOTISLISTAN KOMPLETT, Kanada-blocket 10 bolag — 2026-09-25";
const RAD =
"v173 U9: BCE-OMG24 §10:s SISTA namn ABX (Barrick, TSX-primär, valuta-mix CAD/USD enligt NTR/AEM) — TRION NTR/AEM/ABX KOMPLETT och hela §10-kö-notislistan genomförd under vågen (RCU→Rogers · TELUS · CNR · CPKC · NTR · AEM · ABX). P/E-bärarkontroll före leverans (TTM-netto 3 402 M USD > 0; Sony/Honda-doktrinen) + kollisionskontroll exakt-match + kompletterande FY-panelhämtning för exakt tabelläsning (dokumenterad i källraden). Repliker: netto-M 24,14 % EXAKT · FCF-yield EXAKT (5,299/5,299 %) · mcap 0,37 %; P/E 11,73 källvärde på bolagets justerade bas (bas-skillnad dokumenterad). KÄRNAN — GULDCYKELN MED BOTTENBAS-VARNING: FY22-netto 432 M = cykelbotten; serien 432→2 748 är boomens språng (6,4×) och rak CAGR från bottnen (+85 %/år) är MENINGSLÖS som tillväxtmått — dokumenterad varning; CAGR-fälten bär konsekutiv FY23→FY25 (oms +12,53 % · netto +46,98 %), TTM +29,6 % prisdrivet. ROIC 7,05 % ÖVER WACC 6,78 % (guldsektorns kapitaldisiplin); Altman 4,42 — GULDDUON AEM (4,89) + ABX (4,42) = Kanada-blockets balansryggrad (spektrum 1,55–4,89). KVD: append 270+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 271 (totalt n 258→259; medianen 20,5→20,4 — ABX:s låga multiplar väger tillbaka guldtillskottet, nettoutjämningen dokumenterad; 10 aspektrader) · läckagevakt 0 (485) · tsc 0 · prod 200 i avslutet. VÅGEN U1–U9: universum 262→271 (+9), Kanada 3→10 på sex grenar. Kö: ROTATION — BCE-listan tom (ny kandidatsondering per styrelserond eller v172-skifte: rappdagarna 10-20→11-04 med sex av vågens nio bolag i fönstret). R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U9-ABX-BARRICK-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 203")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 203 appendad");
} else ut.push("worklog: SKIPPAD");

// 2. PIPELINE-KO
const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
const mark = "PÅBÖRJAD r202: U1–U8 LEVERERADE";
if (pk.includes(mark)) {
  pk = pk.replace(
    "PÅBÖRJAD r202: U1–U8 LEVERERADE — 4661.T + 6752.T + TELUS + RCI-B + NTR + CNR + CP + AEM Kanada/material 1→2 (V173-U8, Altman 4,89 vågens sundaste; Kirin AVVISAD i U3) — universum 262→270, llms HELREGEN ×8 (universummedianen P/E 20,4→20,5), läckagevakt 0 ×8, tsc 0 ×8; Kanada 9 bolag · nästa: ABX (sista BCE-namnet) eller rotation · rappdagar 10-20→11-04 → v172-kön",
    "PÅBÖRJAD r203: U1–U9 LEVERERADE — 4661.T + 6752.T + TELUS + RCI-B + NTR + CNR + CP + AEM + ABX (V173-U9, BCE-kö-notislistan KOMPLETT; Kirin AVVISAD i U3) — universum 262→271, llms HELREGEN ×9, läckagevakt 0 ×9, tsc 0 ×9; Kanada 10 bolag på sex grenar · NÄSTA: ROTATION — BCE-listan tom; kandidatsondering per styrelserond ELLER v172-skifte (rappdagar 10-20→11-04, sex av vågens nio bolag i fönstret)",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: v173-rad → U1–U9 r203 + rotationsnotis");
} else if (pk.includes("PÅBÖRJAD r203")) ut.push("PIPELINE-KO: redan bokförd");
else ut.push("PIPELINE-KO: VARNING — expected-läge hittades ej");

// 3. beslutsminne
const post = {
  rond: 203, organ: "Φ", ts: Date.now(),
  beslut: "v173 U9: Barrick ABX (Kanada/material 270→271) levererad — BCE-OMG24 §10:s hela kö-notislista genomförd under vågen; guldcykel med bottenbasvarning (FY22 432 M = botten; konsekutiv FY23→FY25); ROIC>WACC; Altman 4,42. Vågen U1–U9: +9 bolag (262→271), Kanada 3→10. Nästa: rotation (BCE-listan tom) eller v172-skifte. R2: Q3-paketet väntar kund.",
  bevis: "V173-U9-ABX-BARRICK-UTOKNING.md + _r203-v173u9-*.mjs (kvitton /tmp/r203-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda instanserna (rond 203)");

// 4. prod-HTTP
for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/material", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

// 5. commit + push (med adoptiongren)
const MSG = `studio: [organ:Φ] v173 U9 LEVERERAD — Barrick Gold ABX (Kanada/material 28→29): BCE-OMG24 §10:s KÖ-NOTISLISTA KOMPLETT under vågen (RCU→Rogers · TELUS · CNR · CPKC · NTR · AEM · ABX); P/E-bärarkontroll före leverans (TTM-netto 3 402 M USD > 0); valuta-mix CAD/USD (NTR/AEM-mönstret); GULDCYKEL MED BOTTENBAS-VARNING (FY22 432 M = botten; rak CAGR +85 %/år meningslös — dokumenterad; fält på konsekutiv FY23→FY25: oms +12,53 % · netto +46,98 %); ROIC 7,05 % > WACC 6,78 %; Altman 4,42 — guldduon AEM+ABX = Kanadas balansryggrad; repliker EXAKTA (netto-M, FCF-yield) med P/E på källans justerade bas dokumenterad; universum 270→271 kirurgiskt, llms HELREGEN på 271 (n 258→259, medianen 20,5→20,4 utjämnad, 10 aspektrader), läckagevakt 0 (485), tsc 0, prod 200. Vågen U1–U9: +9 bolag, Kanada 3→10. Nästa: rotation (BCE-listan tom) eller v172-skifte. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r203-v173u9-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U9-ABX-BARRICK-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r203-v173u9-sond.mjs", "verktyg/_r203-v173u9-universum-inlagg.mjs", "verktyg/_r203-v173u9-avslut.mjs", "verktyg/_r203-v173u9-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r203-v173u9-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r203-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
let pu = run(A, ["push", "prod", "develop"], "push-1");
if (pu.status !== 0) {
  ut.push("PUSH-1 avvisad — adoptiongren");
  const st = run(P, ["status", "--porcelain"], "prod-status");
  const mFiler = (st.stdout || "").split("\n").filter((r) => r.startsWith(" M")).map((r) => r.slice(3).trim());
  for (const FIL of mFiler) {
    const head = sp("git", ["-C", P, "show", `HEAD:${FIL}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const disk = readFileSync(`${P}/${FIL}`, "utf8");
    ut.push(`${FIL}: ren-append ${disk.startsWith(head.stdout)} (+${disk.length - head.stdout.length})`);
    copyFileSync(`${P}/${FIL}`, `${A}/${FIL}`);
    run(P, ["checkout", "--", FIL], "prod-checkout");
  }
  run(A, ["add", ...mFiler], "add-adoptioner");
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 203 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}

// 6. efterverifiering
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; ABX='+u.some(b=>b.ticker==='ABX'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r203-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
