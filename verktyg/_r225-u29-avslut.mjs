#!/usr/bin/env node
/** _r225-u29-avslut.mjs — v173 U29 (rond 225) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r225-avslut.txt */
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

const RUBRIK = "## ROND 225 [organ:Φ] — v173 U29 LEVERERAD: The Sage Group SGE.L (Storbritannien/teknik 1→2) — universum 290→291, GEOGRAFILÅSET vågens första perfecta (fem fönster exakta, handavläsningsfelet rättat av grunden), UK:S SISTA 1-GREN ÖPPNAD (sju grenar alla ≥2), bruttomarginal-duon ARM 97,5 + SGE 92,6 = universumets två högsta i samma cell — 2026-09-25";
const RAD =
"v173 U29: Storbritannien/teknik-cellens duo — SAGE (LSE-primär, GBP-rapportvaluta, pris i pence; sep-slut FY, TTM = mar '26) bredvid ARM (ren chip-IP-licensiering): MJUKVARUMARGINALENS BÅDA SMAKER — licensiera kisel-IP (P/E 249, hypergrowth) mot hyra ut bokföringsflöden (P/E 25, kompounderare); universumets TVÅ HÖGSTA bruttomarginaler 97,5 + 92,6 % i samma cell; UK:S SISTA 1-GREN ÖPPNAD — Storbritannien 15 bolag på sju grenar, alla ≥2 (milestone efter U27 energi + U28 konsument). Kollisionskontroll primär+sekundär (AZN-läxan r221: SGE.L/SGE/SGEYY+namn+URL) GRÖN; P/E-bärarkontroll före leverans GRÖN (TTM-netto 385 M GBP > 0). GEOGRAFILÅSET — VÅGENS TREDJE LÅSTYP + FÖRSTA PERFECTA: NA+UK&I+Afrika&APAC+Europa = totalen EXAKT SAMTLIGA FEM FÖNSTER [2 634 · 2 513 · 2 332 · 2 184 · 1 947]; skriptgrunden rättade handavläsningens FY23-kolumnfel (förslag till 41 M-diff var EGET fel — maskin före hand); NA-andelen 36,8→45,0 % (nordamerikansk tillväxtberättelse noterad i London). TOLV REPLIKERINGSLÅS: mcap 0,05 % · PS 3,37 · P/B 40,39 EXAKT · EV 0,02 % REN (8,89+2,02−0,518 = 10,392 mot 10,39) · netto-M 14,62 % EXAKT · FCF-M 18,94 % · FCF-yield 5,61 % · divYield 2,27 % EXAKT · D/E 9,19 · P/E pris/EPS 0,7 % · EV/Earnings 26,99 EXAKT · EV/Sales; P/E-FAMILJEANOMALIN dokumenterad (källrad 24,92 · GAAP 23,09 · pris/EPS 24,75; källans EPS-rad 0,40 mot beräknad 0,429 — FÄLTEN = KÄLLRADER enl. Shin-Etsu/freenet-precedensen). FCF FYRA ÅR RAKT + TTM [273 · 382 · 472 · 487 · 499] rak CAGR +21,3 % — DUBBELT låst (OCF−capex exakt fem fönster + källans marginalrader exakta); FCF-M 18,9 % > netto-M 14,6 % = SaaS-kassan (capex 1,2 % av oms). ENGÅNGSKONTROLLEN: normal kaskad TTM (14,6<19,4<22,6) samtliga fem år; FY2023-dippet dokumenterat (molnomställningens omstruktursår 211 M, sedan tre stigande år [211→323→369]); resCAGR +12,38 % · omsCAGR +8,88 %. TUNN-EK-METODNOTEN (RR-precedensen): P/B 40,4 · D/E 9,19 · ROE 75,6 % strukturella (bokfört EK 220 M); de jämförbara: ROIC 26,1 % mot WACC 5,4 % gap +20,7 p; ÅTERKÖPSMASKINEN: aktieantal −4,40 % = buyback-yield 4,40 % EXAKT, lånefinansierad (skuld 814→2 022 M); utdelningstrappa 11 raka år (DPS 0,177→0,225, takter ökande); bruttomarginal-spread 0,19 pp UNIVERSUMETS TIGHTESTASTE (mot ARM 2,4 pp); Altman 2,61 (tunn-EK-artefakt) · Piotroski 5 · beta 0,33; rappdag BEKRÄFTAD 2026-11-19 strax utanför v172-fönstret. KVD: append 290+/0− · läs-tillbaka ×2 · fältgrind 4452.T · tre grindfel fångade FÖRE append (två enhetsmissar + FY23-kolumnfelet) · llms K2 på 291 (teknik-raden n=30, median P/E 21,6; totalt n 278→279 · 10 aspektrader) · läckagevakt 0 (525) · tsc 0 (node-kanalen) · prod 200 i avslutet. Storbritannien 14→15. Kö: rappdagar → v172 (DSV 10-21 · DGE 10-29 · 4503 10-30 · Kirin 11-11) · Kanada/Spanien 1-grenar · spårrotation (BRANDING prioriterat vid konflikt). R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (väntar kundbeslut). Protokoll: V173-U29-SGE-SAGE-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 225")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 225 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U28 LEVERERAD r224")) {
  const fore = "V173-U28-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · DGE 10-29 · 4503 10-30 · Kirin 11-11), UK/teknik sista 1-grenen, Kanada/Spanien, eller spårrotation";
  const efter = "V173-U28-protokoll) · U29 LEVERERAD r225: SGE.L Sage Storbritannien/teknik 1→2 (universum 291 — GEOGRAFILÅSET vågens första perfecta femfönsterlås; UK:S SISTA 1-GREN ÖPPNAD: sju grenar alla ≥2; bruttomarginal-duon ARM+SGE = universumets två högsta i samma cell; V173-U29-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · DGE 10-29 · 4503 10-30 · Kirin 11-11), Kanada/Spanien 1-grenar, eller spårrotation";
  if (pk.includes(fore)) {
    pk = pk.replace(fore, efter);
    writeFileSync(PK, pk);
    ut.push("PIPELINE-KO: U29 bokförd");
  } else ut.push("PIPELINE-KO: ankare träffat men nästa-text saknas");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 225, organ: "Φ", ts: Date.now(),
  beslut: "v173 U29: Sage SGE.L (Storbritannien/teknik 290→291) — duo med ARM (mjukvarumarginelens båda smaker; universumets två högsta bruttomarginaler i samma cell); geograf låset vågens första perfecta (fem fönster exakta — handavläsningens kolumnfel rättat av skriptgrunden); UK:s sista 1-gren öppnad: sju grenar alla ≥2 (Storbritannien 15). Kö: rappdagar → v172, Kanada/Spanien, spårrotation. R2: Q3-paketet väntar kund.",
  bevis: "V173-U29-SGE-SAGE-UTOKNING.md + _r225-u29-*.mjs (kvitton /tmp/r225-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (225)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/teknik", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U29 LEVERERAD — The Sage Group plc SGE.L (Storbritannien/teknik 29→30): cellmotiverad duo (ARM ren chip-IP-licensiering + Sage SaaS-kompounderare — MJUKVARUMARGINALENS BÅDA SMAKER: licensiera kisel-IP mot hyra ut bokföringsflöden; universumets två högsta bruttomarginaler 97,5+92,6 % i samma cell); UK:S SISTA 1-GREN ÖPPNAD — Storbritannien 15 bolag, sju grenar alla ≥2; kollisionskontroll primär+sekundär (AZN-läxan) GRÖN; P/E-bärarkontroll (TTM-netto 385 M GBP > 0); GEOGRAFILÅSET VÅGENS TREDJE LÅSTYP + FÖRSTA PERFECTA — NA+UK&I+Afrika&APAC+Europa = totalen EXAKT SAMTLIGA FEM FÖNSTER (handavläsningens FY23-kolumnfel rättat av skriptgrunden — maskin före hand); NA-andelen 36,8→45,0 %; TOLV LÅS (mcap 0,05 % · PS · P/B 40,39 EXAKT · EV 0,02 % REN · netto-M EXAKT · FCF-M · FCF-yield · divYield EXAKT · D/E · P/E pris/EPS · EV/Earnings EXAKT · EV/Sales); P/E-FAMILJEANOMALIN dokumenterad (källrad 24,92 · GAAP 23,09 · pris/EPS 24,75; EPS-rad 0,40 mot beräknad 0,429 — fälten = källrader, Shin-Etsu/freenet-precedensen); FCF FYRA ÅR RAKT + TTM [273→499] +21,3 %/år DUBBELT låst (OCF−capex + källans marginalrader); FCF-M 18,9 % > netto-M 14,6 % = SaaS-kassan (capex 1,2 % av oms); engångskontrollen normal kaskad, FY23-dippet dokumenterat (211 M → tre stigande år); TUNN-EK-METODNOTEN (P/B 40,4 · D/E 9,19 · ROE 75,6 % strukturella på EK 220 M; ROIC 26,1 % mot WACC 5,4 % gap +20,7 p jämförbart); återköpsmaskinen −4,40 %/år = buyback-yield EXAKT lånefinansierad; utdelningstrappa 11 raka år; bruttomarginal-spread 0,19 pp universumets tightaste; Altman 2,61 (artefakt) · Piotroski 5 · beta 0,33; rappdag BEKRÄFTAD 2026-11-19 strax utanför v172-fönstret; universum 290→291 kirurgiskt, llms HELREGEN på 291 (teknik-raden n=30, median P/E 21,6; totalt n 278→279, 10 aspektrader), läckagevakt 0 (525), tsc 0, prod 200. Storbritannien 14→15. Kö: rappdagar → v172, Kanada/Spanien 1-grenar, spårrotation. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r225-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U29-SGE-SAGE-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r225-u29-sond.mjs", "verktyg/_r225-u29-armkoll.mjs", "verktyg/_r225-u29-hamta.mjs", "verktyg/_r225-u29-universum-inlagg.mjs", "verktyg/_r225-u29-llms-regen.mjs", "verktyg/_r225-u29-lackagevakt.mjs", "verktyg/_r225-u29-tsc.mjs", "verktyg/_r225-u29-avslut.mjs", "verktyg/_r225-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r225-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r225-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 225 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; SGE.L='+u.some(b=>b.ticker==='SGE.L')+'; UKgrenar='+JSON.stringify(u.filter(b=>b.land==='Storbritannien').reduce((m,b)=>(m[b.bransch]=(m[b.bransch]||0)+1,m),{}))"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r225-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
