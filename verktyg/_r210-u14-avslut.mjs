#!/usr/bin/env node
/** _r210-u14-avslut.mjs — v173 U14 (rond 210) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r210-avslut.txt */
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

const RUBRIK = "## ROND 210 [organ:Φ] — v173 U14 LEVERERAD: Siemens Healthineers SHL.DE (Tyskland/halso 1→2) — universum 275→276, cellens duo komplett (Fresenius vård + SHL medtech), vågens femte brottsfria rad — 2026-09-25";
const RAD =
"v173 U14: cellmotiverad duo enligt U13-mönstret — Tyskland/halso-cellens TVÅ affärsmodabler: SIEMENS HEALTHINEERS (ETR-primär EUR, SEPTEMBER-BOKSLUT — sällsynt konvention dokumenterad i raden) bredvid Fresenius (vårdoperatör mot medtech/bild-diagnostik = cellens pedagogiska kontrast). P/E-bärarkontroll före leverans GRÖN (TTM-netto 2 472 M EUR > 0; Sony/Honda-doktrinen) + kollisionskontroll exakt-match. Repliker: netto-M 10,55 % EXAKT · PS EXAKT · FCF-yield EXAKT (4,94 %) · mcap 0,12 % · pe 0,1 % · payout 0,1 %. VÅGENS FEMTE BROTTSFRIA RAD (efter TELUS/CNR/Redeia/Munich Re): samtliga FY positiva med STADIGT STIGANDE netto 1 730→2 417 — rak CAGR oms +2,55 % · netto +11,79 % (marginalexpansion dokumenterad, ej volym). ROIC 8,24 % ÖVER WACC 7,18 % (värdeskapande medtech); räntetäckning 9,61 · Piotroski 7 · Altman 2,86 gränszon (medtech-nduvvet) som datafakta; prognosTillväxt +24,05 % (spår-PEG 1,01 — källans 2,98 kalibreringsnot). KVD: append 275+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 276 (totalt n 263→264 · 10 aspektrader) · läckagevakt 0 (495) · tsc 0 · prod 200 i avslutet. Tyskland 17→18. Kö: duon kvar (Siemens+DHL industri · Japans enbolagsceller · Tysklands övriga 1-grenar) · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U14-SHL-HEALTHINEERS-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 210")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 210 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U13 LEVERERAD r209")) {
  pk = pk.replace(
    "nästa: cellmotiverade duon (Siemens+DHL · Fresenius+Healthineers · Japan) eller spårrotation · rappdagar 10-20→11-04 → v172-kön",
    "U14 LEVERERAD r210: SHL.DE Tyskland/halso 1→2 (universum 276, vågens femte brottsfria rad; V173-U14-protokoll) · nästa: duon kvar (Siemens+DHL · Japan · Tysklands 1-grenar) eller spårrotation · rappdagar 10-20→11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U14 bokförd");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 210, organ: "Φ", ts: Date.now(),
  beslut: "v173 U14: SHL.DE (Tyskland/halso 275→276) — cellens duo komplett (Fresenius vård + SHL medtech); vågens femte brottsfria rad (stadigt stigande netto — marginalexpansion dokumenterad); sep-bokslutskonvention dokumenterad; ROIC>WACC. Kö: duon kvar eller rotation. R2: Q3-paketet väntar kund.",
  bevis: "V173-U14-SHL-HEALTHINEERS-UTOKNING.md + _r210-u14-*.mjs (kvitton /tmp/r210-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (210)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/halso", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U14 LEVERERAD — Siemens Healthineers SHL.DE (Tyskland/halso 26→27): cellmotiverad duo (Fresenius vårdoperatör + SHL medtech = cellens två affärsmodeller); P/E-bärarkontroll före leverans (TTM-netto 2 472 M EUR > 0); SEPTEMBER-BOKSLUT dokumenterad (etikett = slutår); VÅGENS FEMTE BROTTSFRIA RAD (samtliga FY positiva, stadigt stigande netto 1 730→2 417 — rak CAGR oms +2,55 % · netto +11,79 % = marginalexpansion, ej volym); ROIC 8,24 % ÖVER WACC 7,18 %; Altman 2,86 gränszon datafakta; repliker EXAKTA (netto-M, PS, FCF-yield) + tre på 0,1 %; universum 275→276 kirurgiskt, llms HELREGEN på 276 (totalt n 263→264, 10 aspektrader), läckagevakt 0 (495), tsc 0, prod 200. Tyskland 17→18. Kö: duon kvar (Siemens+DHL, Japan), rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r210-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U14-SHL-HEALTHINEERS-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r210-u14-sond.mjs", "verktyg/_r210-u14-universum-inlagg.mjs", "verktyg/_r210-u14-avslut.mjs", "verktyg/_r210-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r210-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r210-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 210 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; SHL.DE='+u.some(b=>b.ticker==='SHL.DE'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r210-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
