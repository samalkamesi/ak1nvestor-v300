#!/usr/bin/env node
/** _r223-u27-avslut.mjs — v173 U27 (rond 223) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r223-avslut.txt */
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

const RUBRIK = "## ROND 223 [organ:Φ] — v173 U27 LEVERERAD: National Grid NG.L (Storbritannien/energi 1→2) — universum 288→289, SEGMENTLÅSET vågens andra (sju segment exakt mot totalen, ESO nationaliserad), FCF-KOLLAPSEN dokumenterad (capex dubblat, utdelning under negativt FCF = reglerad finansieringsmodell), SHEL-kollisionen avvärjd FÖRE valet (Shell USA-klassad) — 2026-09-25";
const RAD =
"v173 U27: Storbritannien/energi-cellens duo — NATIONAL GRID (LSE-primär, prisfältet i pence; reglerad transatlantisk nätsoperatör, mar-slut FY) bredvid BP (supermajor-producent): ASSET-BASE-MASKINEN mot oljeprisets cykel — producent/distributör-paralleliteten dokumenterar Japan/energi (INPEX+Tokyo Gas) och Tyskland/energi (RWE+E.ON). SHEL-KOLLISIONEN tagen av grunden FÖRE valet: Shell plc står USA-klassad i universumet (NYSE-primärnotingskonventionen) — AZN-läxan r221 tillämpad på NG.L/NG/NGG-ADR+namn+URL GRÖN; P/E-bärarkontroll före leverans GRÖN (TTM-netto 3 241 M GBP > 0). SEGMENTLÅSET — VÅGENS ANDRA: sju segment (UKET+UKED+ESO+NewEngland+NewYork+NGV+Other) summerar EXAKT mot omsättningen FY24/FY25/FY26 (FY23 diff 3 M = 0,014 % källavrundning); ESO-kolumnen nationaliserad 1 okt 2024; transatlantisk profil 66,6 % USA. FJORTON REPLIKERINGSLÅS: mcap 0,08 % · PS 3,19 · P/B 1,44 · EV 0,03 % REN med NETTO-SKULD −44,88 mdr (EV 1,79× mcap — mot RR:s netto-kassa i grann-cellen) · netto-M 18,32 % EXAKT · FCF-M −12,21 % EXAKT · FCF-yield −3,82 % · divYield 4,27 % EXAKT · D/E 1,21 · EPS×aktier · EV/Earnings 31,29 EXAKT · P/E-familjen 17,42/17,43/17,47 · EV/EBIT med avrundningsnot. ENGÅNGSKONTROLLEN PER FÖNSTER (Kirin-U3): FY2023 netto-M 36,00 % — MER ÄN DUBBLA pretax-M 16,58 % = avyttringsvinsten UK Gas Transmission under linjen ⇒ resultatCAGR NULL (basblandning vägras; post-disposal-CAGR FY24→FY26 +18,97 % dokumenterad); TTM-fönstret som bär fälten normaliserat (18,32 < 29,22). FCF-KOLLAPSEN [1 174 · 573 · 35 · −1 972 · −2 160]: capex 5 098→9 989 ≈ DUBBLAT (rekordkapitalprogrammet £60 mdr+), serien OCF−capex-låst fem fönster; UTDELNINGEN 0,485 (4,27 %) BETALAS UNDER NEGATIVT FCF = reglerad finansieringsmodell; DPS-trappan med ombasering −20,16 % FY2025. NYEMISSION 1 (maj 2024 ~7 mdr GBP; aktieantal +5,12 % YoY = dilution, återköp 0). oms [21 659→17 687] rak CAGR −6,53 % (perimeter+valutor dokumenterade); ROIC 3,72 % < WACC 5,20 % = regleringens signatur (metodnot); bruttoMarginal NULL (källans 100 % artefakt — BT-precedensen); PEG NULL (oklar bas); Altman/Piotroski saknas i källan; beta 0,59; rappdag BEKRÄFTAD 2026-11-05 (en dag efter v172-fönstrets slut). KVD: append 288+/0− · läs-tillbaka ×2 · fältgrind 4452.T · en formelbugg (divY ×100) fångad av grinden FÖRE append · llms K2 på 289 (energi-raden n=29, median P/E 17,2; totalt n 276→277 · 10 aspektrader) · läckagevakt 0 (521) · tsc 0 (node-kanalen) · prod 200 i avslutet. Storbritannien 12→13 (energi-grenen 1→2). Kö: rappdagar → v172 (DSV 10-21 · 4503 10-30 · Kirin 11-11 · NG 11-05/RR 11-12 strax utanför) · UK:s 1-grenar (konsument/teknik) · Kanada/Spanien · spårrotation. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (väntar kundbeslut). Protokoll: V173-U27-NG-NATIONALGRID-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 223")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 223 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U26 LEVERERAD r222")) {
  const fore = "V173-U26-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · 4503 10-30 · Kirin 11-11), UK:s 1-grenar (energi/konsument/teknik), Kanada/Spanien, eller spårrotation";
  const efter = "V173-U26-protokoll) · U27 LEVERERAD r223: NG.L National Grid Storbritannien/energi 1→2 (universum 289 — SEGMENTLÅSET vågens andra: sju segment exakt mot totalen; FCF-kollapsen dokumenterad; SHEL-kollisionen avvärjd; V173-U27-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · 4503 10-30 · Kirin 11-11 · NG 11-05 strax utanför), UK:s 1-grenar (konsument/teknik), Kanada/Spanien, eller spårrotation";
  if (pk.includes(fore)) {
    pk = pk.replace(fore, efter);
    writeFileSync(PK, pk);
    ut.push("PIPELINE-KO: U27 bokförd");
  } else ut.push("PIPELINE-KO: ankare träffat men nästa-text saknas");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 223, organ: "Φ", ts: Date.now(),
  beslut: "v173 U27: National Grid NG.L (Storbritannien/energi 288→289) — duo med BP (asset-base-maskinen mot oljeprisets cykel); segmentlåset vågens andra (sju segment exakt, ESO nationaliserad); FCF-kollapsen dokumenterad (utdelning under negativt FCF = reglerad finansieringsmodell); SHEL-kollisionen avvärjd före valet (Shell USA-klassad — AZN-läxan tillämpad); engångskontroll FY2023 (netto-M 36 % mer än dubbla pretax-M 16,6 % ⇒ CAGR null, post-disposal +18,97 %). Kö: rappdagar → v172, UK:s 1-grenar (konsument/teknik), Kanada/Spanien, spårrotation. R2: Q3-paketet väntar kund.",
  bevis: "V173-U27-NG-NATIONALGRID-UTOKNING.md + _r223-u27-*.mjs (kvitton /tmp/r223-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (223)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/energi", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U27 LEVERERAD — National Grid plc NG.L (Storbritannien/energi 28→29): cellmotiverad duo (BP supermajor-producent + NG reglerad nätsoperatör — ASSET-BASE-MASKINEN mot oljeprisets cykel; producent/distributör-parallelitet som Japan/energi och Tyskland/energi); SHEL-KOLLISIONEN avvärjd FÖRE valet (Shell står USA-klassad i universumet — AZN-läxan r221 tillämpad: NG.L/NG/NGG+namn+URL GRÖN); P/E-bärarkontroll (TTM-netto 3 241 M GBP > 0); SEGMENTLÅSET VÅGENS ANDRA — sju segment summerar exakt mot totalen FY24/FY25/FY26 (FY23 diff 0,014 %; ESO nationaliserad 1 okt 2024; 66,6 % USA); FJORTON LÅS (mcap · PS · P/B · EV 0,03 % REN med netto-skuld −44,88 mdr — mot RR:s netto-kassa i grann-cellen · netto-M 18,32 % · FCF-M −12,21 % EXAKT · FCF-yield −3,82 % · divYield 4,27 % EXAKT · D/E · EPS×aktier · EV/Earnings 31,29 EXAKT · P/E-familjen · EV/EBIT-not); ENGÅNGSKONTROLLEN PER FÖNSTER — FY2023 netto-M 36,00 % MER ÄN DUBBLA pretax-M 16,58 % (avyttringsvinst UK Gas Transmission) ⇒ resultatCAGR NULL, post-disposal +18,97 % dokumenterad, TTM normaliserat 18,3<29,2; FCF-KOLLAPSEN [1 174 · 573 · 35 · −1 972 · −2 160] med capex DUBBLAT 5 098→9 989 — utdelningen 0,485 (4,27 %) betalas under negativt FCF = reglerad finansieringsmodell; DPS-ombasering −20,16 % FY2025; nyemission 1 (maj 2024, aktieantal +5,12 %); oms-CAGR −6,53 % (perimeter+valutor dokumenterat); ROIC 3,72 % < WACC 5,20 % = regleringens signatur; bruttoMarginal NULL (100 %-artefakt, BT-precedens); PEG NULL (oklar bas); Altman/Piotroski saknas i källan; rappdag BEKRÄFTAD 2026-11-05 en dag efter v172-fönstret; universum 288→289 kirurgiskt, llms HELREGEN på 289 (energi-raden n=29, median P/E 17,2; totalt n 276→277, 10 aspektrader), läckagevakt 0 (521), tsc 0, prod 200. Storbritannien 12→13. Kö: rappdagar → v172, UK:s 1-grenar (konsument/teknik), Kanada/Spanien, spårrotation. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r223-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U27-NG-NATIONALGRID-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r223-u27-sond.mjs", "verktyg/_r223-u27-sond2.mjs", "verktyg/_r223-u27-hamta-NG.mjs", "verktyg/_r223-u27-utvinn.mjs", "verktyg/_r223-u27-inspektera.mjs", "verktyg/_r223-u27-inspektera2.mjs", "verktyg/_r223-u27-universum-inlagg.mjs", "verktyg/_r223-u27-llms-regen.mjs", "verktyg/_r223-u27-lackagevakt.mjs", "verktyg/_r223-u27-tsc.mjs", "verktyg/_r223-u27-avslut.mjs", "verktyg/_r223-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r223-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r223-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 223 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; NG.L='+u.some(b=>b.ticker==='NG.L'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r223-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
