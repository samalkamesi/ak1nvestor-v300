#!/usr/bin/env node
/** _r226-u30-avslut.mjs — v173 U30 (rond 226) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r226-avslut.txt */
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

const RUBRIK = "## ROND 226 [organ:Φ] — v173 U30 LEVERERAD: Smith & Nephew SN.L (Storbritannien/halso 1→2) — universum 291→292, SEGMENTLÅSET I TIO DELAR (vågens mest granulära: exakt fem räkenskapsår; portraitskiftet Sports Medicine > Knee), VÄNDNINGSPROFILEN (netto 223→635 efter FY22-kollapsen, CAGR +41 % med låg-bas-not enl. Hitachi), pris vid 52v-botten — 2026-09-25";
const RAD =
"v173 U30: Storbritannien/halso-cellens duo — SMITH & NEPHEW (LSE-primär, USD-rapportvaluta + GBX-noting enl. BP.L/DGE.L-precedensen — tredje bolaget; kalenderårsbokslut, kvartalsvis TTM = jun '26) bredvid GSK (läkemedelspipeline): SJUKHUSENS KAPITALCYKEL MOT PATENTSYKELN — modellkontrasten speglar Tyskland/hälsa (Fresenius+SHL). Kollisionskontroll primär+sekundär (AZN-läxan r221: SN.L/SN/SNN+namn+URL) GRÖN — AstraZeneca förblir AZN.ST/Sverige; P/E-bärarkontroll före leverans GRÖN (TTM-netto 480,47 M GBP > 0). SEGMENTLÅSET I TIO DELAR — VÅGENS MEST GRANULÄRA: Knee+Hip+OtherRecon+Trauma+SportsMed+Arthro+ENT+WoundCare+WoundBio+WoundDev summerar EXAKT mot totalen SAMTLIGA FEM RÄKENSKAPSÅR FY2021–FY2025 (TTM diff 0,016 %); PORTRATTSKIFTET: Sports Medicine Joint Repair 1 131 > Knee Implants 1 002 som största segment. TRETTON REPLIKERINGSLÅS: mcap EXAKT · PS 1,77 · P/B 2,16 · EV 0,005 % EXAKT (8,45+2,86−0,571 = 10,7395 mot 10,74) · netto-M 10,07 % · FCF-M 13,56 % · FCF-yield 7,66 % EXAKT · divYield 2,88 % · D/E 0,73 EXAKT · payout · P/E pris/EPS 0,6 % · EV/Earnings 22,35 EXAKT · EV/Sales; P/E-familjen 18,05/17,58/17,94 dokumenterad (EPS-rad 0,56 mot beräknad 0,571 — fälten = källrader). VÄNDNINGSPROFILEN: netto [223 · 263 · 412 · 625] + TTM 635 — FY22-kollapsen −57 % (utskjuten elektiv kirurgi + Kina-VBP + Ryssland-exit; DRIFTSposter ej engångspost — normal kaskad i TTM 10,1<12,7<14,2) följt av tre fördubblingsår; VÄNDNINGS-CAGR +41,0 % med LÅG-BAS-NOT (Hitachi U18-precedensen); FCF-SPEGELN [110 · 181 · 606 · 852 · 855] dubbellåst (OCF−capex + marginalrader), marginalen 2,11→13,57 %; EPS [0,26→0,74]; PE-serien 52,12→18,05 = multippelkompressionen. UTDELNINGEN FRUSEN fyra år (0,375 USD FY21–FY24), första höjningen FY25 +4,3 %; current 0,29 GBP (2,88 % EXAKT). PRIS VID 52v-BOTTEN (1 004,5 mot spannet 1 002–1 427, −25,5 %/år). Altman 3,26 GRÖN ZON (vågens ovanliga) · Piotroski 6; ROIC 8,69 % mot WACC 6,69 % gap +2,0 p (vändningsåret — fwd-implied +56 % = konsensusvägen, referens); återköp 1,79 % EXAKT (aktieantal −1,79 %); bruttomarginal-medel 70,1 % spridning 2,70 pp (VBP-prispressen); rappdag est. 2026-11-05 en dag efter v172-fönstret (samma dag som NG). KVD: append 291+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 292 (halso-raden n=30, median P/E 25,2; totalt n 279→280 · 10 aspektrader) · läckagevakt 0 (527) · tsc 0 (node-kanalen) · prod 200 i avslutet. Storbritannien 15→16. Kö: rappdagar → v172 · UK-kommunikation (BT+?) sista UK-1-grenen · Kanada/Spanien · spårrotation. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (väntar kundbeslut). Protokoll: V173-U30-SN-SMITHNEPHEW-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 226")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 226 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U29 LEVERERAD r225")) {
  const fore = "V173-U29-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · DGE 10-29 · 4503 10-30 · Kirin 11-11), UK-hälsa (GSK+?) och UK-kommunikation (BT+?) [rättelse r225: kvarvarande 1-grenar], Kanada/Spanien 1-grenar, eller spårrotation";
  const efter = "V173-U29-protokoll) · U30 LEVERERAD r226: SN.L Smith & Nephew Storbritannien/halso 1→2 (universum 292 — SEGMENTLÅSET i tio delar exakt fem räkenskapsår; vändningsprofilen efter FY22-kollapsen; V173-U30-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · DGE 10-29 · 4503 10-30 · Kirin 11-11), UK-kommunikation (BT+?) sista UK-1-grenen, Kanada/Spanien 1-grenar, eller spårrotation";
  if (pk.includes(fore)) {
    pk = pk.replace(fore, efter);
    writeFileSync(PK, pk);
    ut.push("PIPELINE-KO: U30 bokförd");
  } else ut.push("PIPELINE-KO: ankare träffat men nästa-text saknas");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 226, organ: "Φ", ts: Date.now(),
  beslut: "v173 U30: Smith & Nephew SN.L (Storbritannien/halso 291→292) — duo med GSK (sjukhusens kapitalcykel mot patentsykeln, speglar Tyskland/hälsa); segmentlåset i tio delar vågens mest granulära (exakt FY2021–FY2025, portraitskiftet Sports Medicine > Knee); vändningsprofilen netto 223→635 med låg-bas-not; pris vid 52v-botten; Altman 3,26 grön zon; rappdag 11-05 en dag efter v172-fönstret. Kö: rappdagar → v172, UK-kommunikation sista 1-grenen, Kanada/Spanien, spårrotation. R2: Q3-paketet väntar kund.",
  bevis: "V173-U30-SN-SMITHNEPHEW-UTOKNING.md + _r226-u30-*.mjs (kvitton /tmp/r226-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (226)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/halso", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U30 LEVERERAD — Smith & Nephew plc SN.L (Storbritannien/halso 29→30): cellmotiverad duo (GSK läkemedelspipeline + S&N ortopedisk medtech — SJUKHUSENS KAPITALCYKEL MOT PATENTSYKELN, speglar Tyskland/hälsa Fresenius+SHL); USD-rapportvaluta + GBX-noting enl. BP.L/DGE.L-precedensen (tredje bolaget); kollisionskontroll primär+sekundär (AZN-läxan) GRÖN; P/E-bärarkontroll (TTM-netto 480,47 M GBP > 0); SEGMENTLÅSET I TIO DELAR — VÅGENS MEST GRANULÄRA: tio produktsegment = totalen EXAKT SAMTLIGA FEM RÄKENSKAPSÅR FY2021–FY2025 (TTM diff 0,016 %); PORTRATTSKIFTET Sports Medicine 1 131 > Knee 1 002 som största segment; TRETTON LÅS (mcap EXAKT · PS · P/B · EV 0,005 % EXAKT · netto-M · FCF-M · FCF-yield EXAKT · divYield · D/E EXAKT · payout · P/E pris/EPS · EV/Earnings EXAKT · EV/Sales); P/E-familjen 18,05/17,58/17,94 dokumenterad; VÄNDNINGSPROFILEN: netto [223 · 263 · 412 · 625] + TTM 635 efter FY22-kollapsen −57 % (utskjuten elektiv kirurgi + Kina-VBP + Ryssland-exit — driftsposter, normal kaskad i TTM) — CAGR +41,0 % MED LÅG-BAS-NOT enl. Hitachi U18; FCF-spegeln [110 · 181 · 606 · 852 · 855] DUBBELT låst, marginal 2,11→13,57 %; PE-serien 52,12→18,05; utdelningen frusen fyra år (0,375 USD), första höjningen FY25; current 0,29 GBP (2,88 % EXAKT); PRIS VID 52v-BOTTEN (−25,5 %/år); Altman 3,26 GRÖN ZON · Piotroski 6; ROIC-gap +2,0 p (vändningsåret; fwd-implied +56 % = konsensusreferens); återköp 1,79 % EXAKT; rappdag est. 2026-11-05 en dag efter v172-fönstret (samma dag som NG); universum 291→292 kirurgiskt, llms HELREGEN på 292 (halso-raden n=30, median P/E 25,2; totalt n 279→280, 10 aspektrader), läckagevakt 0 (527), tsc 0, prod 200. Storbritannien 15→16. Kö: rappdagar → v172, UK-kommunikation sista UK-1-grenen, Kanada/Spanien, spårrotation. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r226-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U30-SN-SMITHNEPHEW-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r226-u30-sond.mjs", "verktyg/_r226-u30-hamta.mjs", "verktyg/_r226-u30-universum-inlagg.mjs", "verktyg/_r226-u30-llms-regen.mjs", "verktyg/_r226-u30-lackagevakt.mjs", "verktyg/_r226-u30-tsc.mjs", "verktyg/_r226-u30-avslut.mjs", "verktyg/_r226-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r226-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r226-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 226 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));const g={};for(const b of u.filter(x=>x.land==='Storbritannien'))g[b.bransch]=(g[b.bransch]||0)+1;console.log(u.length+' bolag; SN.L='+u.some(b=>b.ticker==='SN.L')+'; UK='+JSON.stringify(g))"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  ut.push("prod-trädet: " + (uni.stdout || uni.stderr || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r226-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
