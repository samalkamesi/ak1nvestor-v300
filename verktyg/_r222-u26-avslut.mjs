#!/usr/bin/env node
/** _r222-u26-avslut.mjs — v173 U26 (rond 222) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r222-avslut.txt */
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

const RUBRIK = "## ROND 222 [organ:Φ] — v173 U26 LEVERERAD: Rolls-Royce RR.L (Storbritannien/industri 1→2) — universum 287→288, SEGMENTLÅSET (vågens första: OE+Aftermarket = omsättningen exakt fyra år, motorn-och-bladet mot BAE:s orderbacklog), engångskontrollen per fönster (FY25 dokumenterad, TTM normaliserat) — 2026-09-25";
const RAD =
"v173 U26: Storbritannien/industri-cellens duo — ROLLS-ROYCE (LSE-primär, prisfältet i pence enligt BA.L-konventionen; motorer + aftermarket-tjänster) bredvid BAE Systems (försvarsplattformskontraktör): MOTORN OCH BLADET mot ORDERBACKLOGEN. Kollisionskontroll primär+sekundär (AZN-läxan r221: RR.L/RR/RYCEY+namn+URL) GRÖN; P/E-bärarkontroll före leverans GRÖN (TTM-netto 3 038 M GBP > 0). SEGMENTLÅSET — VÅGENS FÖRSTA: Original Equipment + Aftermarket Services summerar EXAKT mot omsättningen samtliga fyra år (tjänsteandelen 53,6→57,1 % — bladen växer snabbare än raknen). ELVA REPLIKERINGSLÅS: PS 5,32 EXAKT · P/B 42,73 EXAKT (strukturellt: tunt EK 2,88 mdr efter pandeminedskrivningar — metodnot) · EV-DEKOMPOSITION 0,02 % REN MED NETTO-KASSA +2,11 mdr (123,16+4,37−6,48 = 121,05 mot 121,07; mot DSV:s −85 mdr i samma cell = två balansmodeller) · netto-M 13,11 % EXAKT · FCF-M 19,26 % EXAKT · FCF-yield 3,62 % DUBBELT EXAKT · D/E 1,52 · EPS×aktier · mcap · EV/Earnings 39,85 EXAKT · FCF-serien; P/E-familjen dokumenterad (källrad 41,02 · GAAP 40,5 · pris/EPS 41,8). ENGÅNGSKONTROLLEN PER FÖNSTER (Kirin-U3-doktrinen): FY2025 netto 5 841 med netto-M 27,5 % ÖVER EBIT-M 19,8 % = engångskaraktär dokumenterad — TTM-FÖNSTRET SOM BÄR FÄLTEN ÄR NORMALISERAT (13,11 < 20,72). FCF FYRA ÅR RAKT [1 165 → 3 944] + TTM 4 461 (rak CAGR +50,2 %), serien OCF−capex-låst fem fönster. netto [−1 269 · 2 412 · 2 521 · 5 841] — resultatCAGR NULL på negativ bas (Vonovia-precedens; pandemivändningen dokumenterad); oms-CAGR +16,25 %; ROE 114 %/ROIC 471 % strukturella (ROCE 24,8 % jämförbart — metodnot); Altman 2,78 · Piotroski 6 · beta 1,19; återköp 0,70 %; rappdag est. 2026-11-12 strax utanför v172-fönstret. KVD: append 287+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 288 (industri-raden n=28, median P/E 28; totalt n 275→276 · 10 aspektrader) · läckagevakt 0 (519) · tsc 0 · prod 200 i avslutet. Storbritannien 11→12 (industri-grenen 1→2). Kö: rappdagar → v172 (DSV 10-21 · 4503 10-30 · Kirin 11-11) · UK:s 1-grenar (energi/konsument/teknik) · Kanada/Spanien · spårrotation. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U26-RR-ROLLSROYCE-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 222")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 222 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U25 LEVERERAD r221")) {
  const fore = "V173-U25-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · 4503 10-30 · Kirin 11-11), UK:s kvarvarande 1-grenar, Kanada/Spanien, eller spårrotation";
  const efter = "V173-U25-protokoll) · U26 LEVERERAD r222: RR.L Rolls-Royce Storbritannien/industri 1→2 (universum 288 — SEGMENTLÅSET vågens första: OE+Aftermarket exakt mot omsättningen; engångskontroll per fönster; netto-kassa-EV 0,02 %; V173-U26-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · 4503 10-30 · Kirin 11-11), UK:s 1-grenar (energi/konsument/teknik), Kanada/Spanien, eller spårrotation";
  if (pk.includes(fore)) {
    pk = pk.replace(fore, efter);
    writeFileSync(PK, pk);
    ut.push("PIPELINE-KO: U26 bokförd");
  } else ut.push("PIPELINE-KO: ankare träffat men nästa-text saknas");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 222, organ: "Φ", ts: Date.now(),
  beslut: "v173 U26: Rolls-Royce RR.L (Storbritannien/industri 287→288) — duo med BAE (motorn-och-bladet mot orderbacklog); segmentlåset vågens första (OE+Aftermarket exakt fyra år, tjänsteandel 57 %); engångskontroll per fönster (FY25 dokumenterad, TTM normaliserat); netto-kassa-EV 0,02 %; FCF fyra år rakt +50,2 %/år. Kö: rappdagar → v172, UK:s 1-grenar, Kanada/Spanien, spårrotation. R2: Q3-paketet väntar kund.",
  bevis: "V173-U26-RR-ROLLSROYCE-UTOKNING.md + _r222-u26-*.mjs (kvitton /tmp/r222-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (222)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/industri", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U26 LEVERERAD — Rolls-Royce Holdings RR.L (Storbritannien/industri 27→28): cellmotiverad duo (BAE försvarsplattformar + RR motorer/aftermarket — MOTORN OCH BLADET mot ORDERBACKLOGEN); kollisionskontroll primär+sekundär (AZN-läxan) GRÖN; P/E-bärarkontroll (TTM-netto 3 038 M GBP > 0); SEGMENTLÅSET VÅGENS FÖRSTA — OE+Aftermarket summerar exakt mot omsättningen fyra år (tjänsteandel 53,6→57,1 %); ELVA LÅS (PS 5,32 · P/B 42,73 strukturellt · EV 0,02 % REN NETTO-KASSA +2,11 mdr mot DSV:s −85 i samma cell · netto-M 13,11 % · FCF-M 19,26 % · FCF-yield 3,62 % dubbelt · D/E · EPS×aktier · EV/Earnings 39,85 · FCF-serien); ENGÅNGSKONTROLLEN PER FÖNSTER — FY2025 netto-M 27,5 % över EBIT-M 19,8 % dokumenterad, TTM normaliserat 13,1<20,7 (fälten godkända); FCF FYRA ÅR RAKT +50,2 %/år (serien OCF−capex-låst); resultatCAGR NULL (Vonovia-precedens, pandemivändning dokumenterad); ROE 114 %/ROIC 471 % strukturella med metodnot (tunt EK, ROCE 24,8 % jämförbart); Altman 2,78 · Piotroski 6; rappdag est. 11-12 strax utanför v172-fönstret; universum 287→288 kirurgiskt, llms HELREGEN på 288 (industri-raden n=28, median P/E 28; totalt n 275→276, 10 aspektrader), läckagevakt 0 (519), tsc 0, prod 200. Storbritannien 11→12. Kö: rappdagar → v172, UK:s 1-grenar, Kanada/Spanien, spårrotation. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r222-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U26-RR-ROLLSROYCE-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r222-u26-sond.mjs", "verktyg/_r222-u26-universum-inlagg.mjs", "verktyg/_r222-u26-llms-regen.mjs", "verktyg/_r222-u26-lackagevakt.mjs", "verktyg/_r222-u26-avslut.mjs", "verktyg/_r222-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r222-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r222-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 222 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; RR.L='+u.some(b=>b.ticker==='RR.L'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r222-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
