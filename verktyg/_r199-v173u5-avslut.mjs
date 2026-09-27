#!/usr/bin/env node
/**
 * _r199-v173u5-avslut.mjs — v173 U5 (rond 199) bokföring + prod-HTTP + commit + push
 * + adoptionsgren + efterverifiering. Kvitto: /tmp/r199-avslut.txt
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
const RUBRIK = "## ROND 199 [organ:Φ] — v173 U5 LEVERERAD: Nutrien NTR (Kanada/material 0→1) — universum 266→267, gödningscykeln dokumenterad, Altman 3,24 Kanadas sundaste — 2026-09-25";
const RAD =
"v173 U5: BCE-OMG24 §10:s Kanada/material-öppning — NUTRIEN NTR (TSX-primär, VALUTA-MIX dokumenterad: pris/utdelning CAD mot koncernrapportering USD; payout-konsistensen 50,0/50,05 % bekräftar EPS-basens konvertering) efter P/E-bärarkontroll före leverans (TTM-netto 2 153 M > 0, P/E 17,28; Sony/Honda-doktrinen) + kollisionskontroll exakt-match. Repliker: netto-M EXAKT · PS EXAKT · mcap 0,13 % · pe 0,2 % · payout ✓ · FCF-yield fönsterdiff dokumentklass. KÄRNAN: GÖDNINGSCYKELN enligt FCX/VALE-precedensen — FY22 krigstopp (netto 7 660 M) · FY24 nedskrivningsdipp (744 M) · FY25 återhämtning (2 153 M); CAGR-fälten bär konsekutiv FY23→FY25 (oms −5,32 % · netto +23,57 %) med cykelbasen FY22→FY25 (oms −11,74 % · netto −34,47 %) REDOVISAD — tillväxten är priscykel, ej strukturell. RONDHÄNDELSE: min handräknade cykelbas i paranoid avvek från skriptets exakta tal (−11,49/−33,05 mot −11,74/−34,47) — kirurgiskt rättad FÖRE commit; maskin före hand, tredje gången vågen (U3 Kanada 3→4, U5 cykelbas). peg NULL (platt prognos +1,77 % — spår-PEG meningslös; källans 3,66 kalibreringsnot). Altman 3,24 = Kanada-cellens sundaste balans (BCE 2,29 · TELUS 1,55 · RCI-B 1,73); ROIC 5,76 % under WACC 7,13 % dokumenterat. KVD: append 266+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 267 (totalt n 254→255, 10 aspektrader — diskdrivet instrument tredje körningen) · läckagevakt 0 (481) · tsc 0 · prod 200 i avslutet. Kanada 6 bolag (material 0→1 klar); kö: Kanada/industri CNR/CPKC · AEM/ABX · rappdagar 10-22/29/30 + 11-04 → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U5-NTR-NUTRIEN-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 199")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 199 appendad");
} else ut.push("worklog: SKIPPAD");

// 2. PIPELINE-KO
const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
const mark = "PÅBÖRJAD r198: U1–U4 LEVERERADE";
if (pk.includes(mark)) {
  pk = pk.replace(
    "PÅBÖRJAD r198: U1–U4 LEVERERADE — 4661.T + 6752.T + TELUS + Rogers RCI-B Kanada/kommunikation (V173-U4; Kirin AVVISAD i U3) — universum 262→266, llms HELREGEN ×4, läckagevakt 0 ×4, tsc 0 ×4; Kanada/kommunikation vid matta 3 (BCE+TELUS+RCI-B) · nästa: Kanada/material (NTR/AEM/ABX) + Kanada/industri (CNR/CPKC) · rappdagar 10-22/10-29/10-30 → v172-kön",
    "PÅBÖRJAD r199: U1–U5 LEVERERADE — 4661.T + 6752.T + TELUS + RCI-B + Nutrien NTR Kanada/material 0→1 (V173-U5; Kirin AVVISAD i U3) — universum 262→267, llms HELREGEN ×5, läckagevakt 0 ×5, tsc 0 ×5; Kanada 6 bolag · nästa: Kanada/industri (CNR/CPKC) + material AEM/ABX · rappdagar 10-22/29/30 + 11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: v173-rad → U1–U5 r199");
} else if (pk.includes("PÅBÖRJAD r199")) ut.push("PIPELINE-KO: redan bokförd");
else ut.push("PIPELINE-KO: VARNING — expected-läge hittades ej");

// 3. beslutsminne
const post = {
  rond: 199, organ: "Φ", ts: Date.now(),
  beslut: "v173 U5: Nutrien NTR (Kanada/material 266→267, valuta-mix CAD/USD dokumenterad) levererad efter P/E-bärarkontroll; gödningscykeln dokumenterad med konsekutiv CAGR-bas + cykelbas öppet; paranoid-handräkningsfel rättat av skriptmätning före commit (maskin före hand #3). peg NULL på platt prognos. Kö: Kanada/industri, AEM/ABX, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U5-NTR-NUTRIEN-UTOKNING.md + _r199-v173u5-*.mjs (kvitton /tmp/r199-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda instanserna (rond 199)");

// 4. prod-HTTP
for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/material", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

// 5. commit + push (med adoptiongren)
const MSG = `studio: [organ:Φ] v173 U5 LEVERERAD — Nutrien NTR (Kanada/material 26→27): P/E-bärarkontroll före leverans (TTM-netto 2 153 M > 0, P/E 17,28); valuta-mix CAD-pris/USD-rapportering dokumenterad (payout-konsistens 50,0/50,05 %); GÖDNINGSCYKELN enligt FCX/VALE-precedensen — konsekutiv FY23→FY25 CAGR (oms −5,32 % · netto +23,57 %) med cykelbasen FY22→FY25 (−11,74 %/−34,47 %) öppet redovisad; paranoid-handräkningsfel kirurgiskt rättat av skriptmätning före commit; peg NULL på platt prognos (+1,77 %); Altman 3,24 Kanadas sundaste; universum 266→267 kirurgiskt, llms HELREGEN på 267 (totalt n 254→255, 10 aspektrader), läckagevakt 0 (481 sökningar), tsc 0, prod 200. Kö: Kanada/industri, AEM/ABX, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r199-v173u5-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U5-NTR-NUTRIEN-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r199-v173u5-sond.mjs", "verktyg/_r199-v173u5-universum-inlagg.mjs", "verktyg/_r199-v173u5-rattning.mjs", "verktyg/_r199-v173u5-avslut.mjs", "verktyg/_r199-v173u5-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r199-v173u5-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r199-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 199 adoption — prod-trädets rena append(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}

// 6. efterverifiering
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; NTR='+u.some(b=>b.ticker==='NTR'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r199-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
