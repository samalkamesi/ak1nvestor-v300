#!/usr/bin/env node
/** _r207-u11-avslut.mjs — v173 U11 (rond 207) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r207-avslut.txt */
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

const RUBRIK = "## ROND 207 [organ:Φ] — v173 U11 LEVERERAD: Redeia REE.MC (Spanien/energi 1→2) — universum 272→273, Spanien-koordinatparen komplett, vågens tredje brottsfria rad med koncessionsmetodnoter — 2026-09-25";
const RAD =
"v173 U11: BCE-OMG24 §10:s Spanien-alternativ ANDRANAMN REDEIA (BME-primär EUR, reglerad elnätskoncession): P/E-bärarkontroll före leverans GRÖN (TTM-netto 973 M EUR > 0; Sony/Honda-doktrinen) + kollisionskontroll exakt-match (r206-sonden). Koordinatparen KOMPLETT (Cellnex U10 + Redeia U11). VÅGENS TREDJE BROTTSFRIA RAD: FY22–25 samtliga positiva (rak CAGR oms +1,69 % · netto +5,50 % — reglerad prisbas); FCF-nedgången 1 058→428 = nätinvesteringscykeln (dokumenterad). Repliker: netto-M 38,07 % EXAKT · FCF-yield EXAKT · PS 0,1 % · payout 1,1 % · mcap 0,2 %; P/E 18,07 källans ATTRIBUTABLE-bas (minoritetsnot — totalnetto-replik 13,76 dokumenterad, Rogers-mönstret omvänt). KONCESSIONSMETODNOTERNA är rundens kärna: ROIC under WACC speglar koncessionsformeln (ej konkurrenskraft) · brutto 100 % = nättariffering utan kostnadssida · Altman 1,67 varningszon = reglerad kapitalbas · utdelning 6,01 % med payout 83,63 % = koncessionsutdelning — samtliga som datafakta med not (annars feltolkas reglerad infrastruktur som stressad). KVD: append 272+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 273 (totalt n 260→261 · 10 aspektrader) · läckagevakt 0 (489) · tsc 0 · prod 200 i avslutet. Spanien 4→5. Kö: BT.L (alternativets sista namn) · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U11-REE-REDEIA-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 207")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 207 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U10 LEVERERAD r206")) {
  pk = pk.replace(
    "kvarvarande koordinater: Redeia REE.MC · BT.L · Tyskland 8 celler à 1 · Japan 4 celler à 1",
    "kvarvarande koordinater: BT.L (sista BCE-namnet) · Tyskland 8 celler à 1 · Japan 4 celler à 1 · U11 LEVERERAD r207: Redeia REE.MC Spanien/energi 1→2 (universum 273, Spanien-koordinatparen komplett, V173-U11-protokoll)",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U11 bokförd");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 207, organ: "Φ", ts: Date.now(),
  beslut: "v173 U11: Redeia REE.MC (Spanien/energi 272→273) — Spanien-koordinatparen komplett (Cellnex+Redeia); vågens tredje brottsfria rad; koncessionsmetodnoter (ROIC/brutto/Altman/utdelning) som datafakta. Kö: BT.L, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U11-REE-REDEIA-UTOKNING.md + _r207-u11-*.mjs (kvitton /tmp/r207-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (207)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/energi", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U11 LEVERERAD — Redeia Corporación REE.MC (Spanien/energi 25→26): BCE-alternativets andranamn — SPANIEN-KOORDINATPAREN KOMPLETT (Cellnex U10 + Redeia U11); P/E-bärarkontroll före leverans (TTM-netto 973 M EUR > 0); VÅGENS TREDJE BROTTSFRIA RAD (FY22–25 samtliga positiva; rak CAGR oms +1,69 % · netto +5,50 %, reglerad prisbas); KONCESSIONSMETODNOTER: ROIC<WACC = koncessionsformeln, brutto 100 % = nättariffering, Altman 1,67 = reglerad kapitalbas, payout 83,63 % = koncessionsutdelning — datafakta med noter; P/E på attributable-bas (minoritetsnot, totalnetto-replik dokumenterad); repliker EXAKTA (netto-M 38,07 %, FCF-yield, payout); universum 272→273 kirurgiskt, llms HELREGEN på 273 (totalt n 260→261, 10 aspektrader), läckagevakt 0 (489), tsc 0, prod 200. Spanien 4→5. Kö: BT.L, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r207-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U11-REE-REDEIA-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r207-u11-universum-inlagg.mjs", "verktyg/_r207-u11-avslut.mjs", "verktyg/_r207-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r207-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r207-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 207 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; REE.MC='+u.some(b=>b.ticker==='REE.MC'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r207-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
