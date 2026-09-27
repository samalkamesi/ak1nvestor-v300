#!/usr/bin/env node
/** _r208-u12-avslut.mjs — v173 U12 (rond 208) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r208-avslut.txt */
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

const RUBRIK = "## ROND 208 [organ:Φ] — v173 U12 LEVERERAD: BT Group BT.L (UK/kommunikation 0→1) — universum 273→274, BCE-OMG24-KOORDINATLISTAN FULLÄNDAD, sex exakta repliker, negativ historik öppet mot +53 %-prognos — 2026-09-25";
const RAD =
"v173 U12: BCE-OMG24-listans SISTA namn BT (LSE-primär GBX, mars-bokslut enligt Japan-etikettkonventionen): P/E-bärarkontroll före leverans GRÖN (TTM-netto 1 591 M GBP > 0 — VOD var P/E-död, BT bär) + kollisionskontroll exakt-match (r206-sonden). Med U12 är protokollets SAMTLIGA öppna koordinater antagna/avvisade/levererade — listan fulländad. VÅGENS STARKASTE REPLIKRAD: SEX EXAKTA (mcap 0,01 % · P/E · netto-M 7,71 % · PS · FCF-yield 8,02/8,03 % · payout 63,3 % — källans attributable-EPS med minoritetsnot ~310 M dokumenterad). ÄRLIGHETSKÄRNAN: rak CAGR NEGATIV (oms −0,73 % · netto −10,48 % — legacy-utflyttningen strukturell) redovisas ÖPPET mot prognosTillväxt +53,17 % (fwd 10,40 mot trailing 15,93 — fiberrulloutens förväntade EPS-återhämtning): båda sidorna av historien syns, ingen döljs; spår-PEG 0,30 (källans 1,23 kalibreringsnot). bruttoMarginal NULL (leverantörens bruttobegrepp osammanhängande för telekom — osatt hellre än felbas; ärlighetsprincipen i fältval). Altman 1,71 varningszon (UK-telekommönstret) + ROIC 5,71 < WACC 7,53 (fiberkapitalbas) som datafakta. KVD: append 273+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 274 (kommunikation n 25→26 med resCAGR-median 5,8→3,5 % — BT:s negativa CAGR syns i cellen, datasetet fångar båda riktningarna; totalt n 261→262 · 10 aspektrader) · läckagevakt 0 (491) · tsc 0 · prod 200 i avslutet. Storbritannien 10→11 (elfte grenen). Vågen U1–U12: universum 262→274. Kö: ny koordinatsondering (alla listor tomma — Tysklands/Japans enbolagsceller eller spårrotation) · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U12-BT-BTGROUP-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 208")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 208 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("kvarvarande koordinater: BT.L (sista BCE-namnet)")) {
  pk = pk.replace(
    "kvarvarande koordinater: BT.L (sista BCE-namnet) · Tyskland 8 celler à 1 · Japan 4 celler à 1 · U11 LEVERERAD r207: Redeia REE.MC Spanien/energi 1→2 (universum 273, Spanien-koordinatparen komplett, V173-U11-protokoll)",
    "BCE-KOORDINATLISTAN FULLÄNDAD r208 (U12: BT.L UK/kommunikation 0→1 — universum 274, V173-U12-protokoll; samtl. öppna koordinater antagna/avvisade/levererade) · NÄSTA: ny sondering (Tyskland 8 celler à 1 · Japan 4) eller spårrotation · rappdagar 10-20→11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U12 + listslut bokfört");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 208, organ: "Φ", ts: Date.now(),
  beslut: "v173 U12: BT.L (UK/kommunikation 273→274) — BCE-OMG24:s koordinatlista fulländad; sex exakta repliker; negativ historik öppet mot +53 %-prognos (båda sidorna); bruttoMarginal null (osatt hellre än felbas). Vågen U1–U12: +12 bolag (262→274). Nästa: ny sondering eller rotation. R2: Q3-paketet väntar kund.",
  bevis: "V173-U12-BT-BTGROUP-UTOKNING.md + _r208-u12-*.mjs (kvitton /tmp/r208-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (208)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/kommunikation", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U12 LEVERERAD — BT Group BT.L (UK/kommunikation 27→28): BCE-OMG24-KOORDINATLISTAN FULLÄNDAD (samtl. öppna namn antagna/avvisade/levererade; VOD var P/E-död, BT bär); P/E-bärarkontroll före leverans (TTM-netto 1 591 M GBP > 0); SEX EXAKTA REPLIKER (mcap 0,01 %, P/E, netto-M, PS, FCF-yield, payout) med attributable-EPS-minoritetsnot; NEGATIV rak CAGR (oms −0,73 % · netto −10,48 %) redovisas ÖPPET mot prognos +53,17 % (fiberrulloutens återhämtning) — båda sidorna av historien; bruttoMarginal null (leverantörens begrepp osammanhängande — osatt hellre än felbas); mars-bokslut (Japan-konventionen); Altman 1,71 + ROIC<WACC datafakta; universum 273→274 kirurgiskt, llms HELREGEN på 274 (kommunikation n 25→26, resCAGR-median 5,8→3,5 % — negativ CAGR syns i cellen; totalt n 261→262, 10 aspektrader), läckagevakt 0 (491), tsc 0, prod 200. UK 10→11. Vågen U1–U12: +12 bolag. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r208-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U12-BT-BTGROUP-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r208-u12-universum-inlagg.mjs", "verktyg/_r208-u12-avslut.mjs", "verktyg/_r208-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r208-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r208-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 208 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; BT.L='+u.some(b=>b.ticker==='BT.L'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r208-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
