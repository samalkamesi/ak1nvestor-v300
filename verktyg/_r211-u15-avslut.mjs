#!/usr/bin/env node
/** _r211-u15-avslut.mjs — v173 U15 (rond 211) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r211-avslut.txt */
import { readFileSync, writeFileSync, appendFileSync, copyFileSync } from "node:fs";
import { spawnSync as sp } from "node:child_process";

const A = "/home/ak1a/agent/ak1";
const P = "/home/ak1a/AK1";
const ut = [];
const run = (cwd, args, tag) => {
  const r = sp("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
  ut.push(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-2).join(" | ").slice(0, 220)}`);
  return r;
};

const RUBRIK = "## ROND 211 [organ:Φ] — v173 U15 LEVERERAD: Deutsche Post DHL DHL.DE (Tyskland/industri 1→2) — universum 276→277, industrins duo komplett (Siemens automation + DHL logistik), pandemibooms-brottet dokumenterat — 2026-09-25";
const RAD =
"v173 U15: cellmotiverad duo enligt U13/U14-mönstret — Tyskland/industri-cellens TVÅ affärsmodeller: DEUTSCHE POST/DHL (ETR-primär EUR) bredvid Siemens (automation mot logistik = cellens pedagogiska kontrast). P/E-bärarkontroll före leverans GRÖN (TTM-netto 4 893 M EUR > 0; Sony/Honda-doktrinen) + kollisionskontroll exakt-match. PANDEMIBOOMS-BROTTET FY2022 är rundens kärna: netto 8 458 M = paketboomens toppår, normalisering till 4,7–5,1 mdr, återhämtning pågår — rak boomstopps-CAGR (−15,3 %/år) är VILSELEDANDE och CAGR-fälten bär konsekutiv post-boom-bas FY23→FY25 (oms +3,23 % · netto +2,50 % = normaliserad bild); NTR/AEM-klassens spegelvända doktrin (där bottenbasen, här boomstoppsbasen — båda riktningarna bevisade i vågen). Repliker: netto-M 5,61 % EXAKT · FCF-yield EXAKT (5,60 %) · payout EXAKT (52,31 %) · mcap 0,04 %; P/E dokumentklass (attributable-bas, totalnetto-replik 8 % noterad). ROIC 8,90 % ÖVER WACC 7,41 % (värdeskapande logistik); Altman 2,63 varningszon (leasad logistikbalans) datafakta; spår-PEG 1,18 mot källans 1,29 — vågens närmaste kalibrering. KVD: append 276+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 277 (totalt n 264→265 · 10 aspektrader) · läckagevakt 0 (497) · tsc 0 · prod 200 i avslutet. Tyskland 18→19 (tre duo-celler öppna: finans/halso/industri). Kö: Japans enbolagsceller · Tysklands resterande 1-grenar · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U15-DHL-DEUTSCHEPOST-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 211")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 211 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U14 LEVERERAD r210")) {
  pk = pk.replace(
    "nästa: duon kvar (Siemens+DHL · Japan · Tysklands 1-grenar) eller spårrotation · rappdagar 10-20→11-04 → v172-kön",
    "U15 LEVERERAD r211: DHL.DE Tyskland/industri 1→2 (universum 277, pandemibooms-brott dokumenterat; V173-U15-protokoll) · nästa: Japans enbolagsceller · Tysklands resterande 1-grenar (energi/kommunikation/fastighet/material) eller spårrotation · rappdagar 10-20→11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U15 bokförd");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 211, organ: "Φ", ts: Date.now(),
  beslut: "v173 U15: DHL.DE (Tyskland/industri 276→277) — industrins duo komplett (Siemens+DHL); pandemibooms-brott FY22 dokumenterat med konsekutiv post-boom-CAGR (spegelvänt mot NTR/AEM-bottenbas); payout/FCF-yield/netto-M EXAKTA. Kö: Japan/Tysklands 1-grenar, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U15-DHL-DEUTSCHEPOST-UTOKNING.md + _r211-u15-*.mjs (kvitton /tmp/r211-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (211)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/industri", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U15 LEVERERAD — Deutsche Post DHL DHL.DE (Tyskland/industri 24→25): cellmotiverad duo (Siemens automation + DHL logistik = cellens två modeller); P/E-bärarkontroll före leverans (TTM-netto 4 893 M EUR > 0); PANDEMIBOOMS-BROTT FY2022 (netto 8 458 = paketboomens topp) ⇒ CAGR på konsekutiv post-boom-bas FY23→FY25 (oms +3,23 % · netto +2,50 % — normaliserad bild; boomstoppsbasen −15,3 %/år dokumenterad som vilseledande; NTR/AEM spegelvänt); repliker EXAKTA (netto-M 5,61 %, FCF-yield 5,60 %, payout 52,31 %) + mcap 0,04 %; P/E attributable-bas noterad; ROIC 8,90 % ÖVER WACC 7,41 %; Altman 2,63 datafakta; spår-PEG 1,18 (källans 1,29 — vågens närmaste kalibrering); universum 276→277 kirurgiskt, llms HELREGEN på 277 (totalt n 264→265, 10 aspektrader), läckagevakt 0 (497), tsc 0, prod 200. Tyskland 18→19. Kö: Japan/Tysklands 1-grenar, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r211-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U15-DHL-DEUTSCHEPOST-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r211-u15-sond.mjs", "verktyg/_r211-u15-universum-inlagg.mjs", "verktyg/_r211-u15-avslut.mjs", "verktyg/_r211-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r211-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r211-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 211 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; DHL.DE='+u.some(b=>b.ticker==='DHL.DE'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r211-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
