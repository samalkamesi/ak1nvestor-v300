#!/usr/bin/env node
/**
 * _r202-v173u8-avslut.mjs — v173 U8 (rond 202) bokföring + prod-HTTP + commit + push
 * + adoptionsgren + efterverifiering. Kvitto: /tmp/r202-avslut.txt
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
const RUBRIK = "## ROND 202 [organ:Φ] — v173 U8 LEVERERAD: Agnico Eagle Mines AEM (Kanada/material 1→2) — universum 269→270, vågens sundaste balans (Altman 4,89), guldcykeln dokumenterad — 2026-09-25";
const RAD =
"v173 U8: BCE-OMG24 §10:s material-andranamn AEM (Agnico Eagle, TSX-primär, VALUTA-MIX enligt NTR-mönstret: CAD-pris/utdelning mot USD-rapportering; källans EPS-rad CAD-konverterad 3,23 med P/E EXAKT replikerbar på den basen — 101,86/3,23 = 31,54) levererad efter P/E-bärarkontroll före leverans (TTM-netto 2 048 M USD > 0; Sony/Honda-doktrinen) + kollisionskontroll exakt-match. Kompletterande FCF-panelhämtning (första FY25-läsningen oläsbar — dokumenterad i källraden): FCF FY25 1 186 M med FCF-yield EXAKT replik (2,333/2,334 %) och FCF-MARGINALEN fältlagen rätt 13,8 % (källans 2,33-rad är yield — fältlagningen dokumenterad). GULDCYKELN enligt FCX/VALE/NTR-precedenserna: prisdriven boom (TTM rev +25,7 %) — rak CAGR FY22→25 (oms +13,65 % · netto +19,58 %) med cykelnot, samtliga FY positiva; FY25-dippen = kostnadsläge. ALTMAN 4,89 = vågens U1–U8 sundaste balans (spektrum 1,55 TELUS → 4,89 AEM — Kanada-blockets pedagogiska bredd); ROIC 5,41 % under WACC 6,53 % (gruvkapital) och payout 77,55 % redovisas öppet. KVD: append 269+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 270 (UNIVERSUMMEDIANEN P/E 20,4→20,5 — vågens första rörelse i totalmedianen, guldtillskottet syns; n 257→258, 10 aspektrader) · läckagevakt 0 (484) · tsc 0 · prod 200 i avslutet. Kanada 9 bolag på sex grenar. Kö: ABX (sista BCE-namnet) eller rotation · rappdagar 10-20→11-04 (sex av vågens åtta bolag i fönstret) → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U8-AEM-AGNICO-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 202")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 202 appendad");
} else ut.push("worklog: SKIPPAD");

// 2. PIPELINE-KO
const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
const mark = "PÅBÖRJAD r201: U1–U7 LEVERERADE";
if (pk.includes(mark)) {
  pk = pk.replace(
    "PÅBÖRJAD r201: U1–U7 LEVERERADE — 4661.T + 6752.T + TELUS + RCI-B + NTR + CNR + CP Kanada/industri 1→2 (V173-U7, järnvägsduon komplett; Kirin AVVISAD i U3) — universum 262→269, llms HELREGEN ×7, läckagevakt 0 ×7, tsc 0 ×7; Kanada 8 bolag · nästa: AEM/ABX (material 1→2/3) eller rotation · rappdagar 10-20/22/28/29/30 + 11-04 → v172-kön",
    "PÅBÖRJAD r202: U1–U8 LEVERERADE — 4661.T + 6752.T + TELUS + RCI-B + NTR + CNR + CP + AEM Kanada/material 1→2 (V173-U8, Altman 4,89 vågens sundaste; Kirin AVVISAD i U3) — universum 262→270, llms HELREGEN ×8 (universummedianen P/E 20,4→20,5), läckagevakt 0 ×8, tsc 0 ×8; Kanada 9 bolag · nästa: ABX (sista BCE-namnet) eller rotation · rappdagar 10-20→11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: v173-rad → U1–U8 r202");
} else if (pk.includes("PÅBÖRJAD r202")) ut.push("PIPELINE-KO: redan bokförd");
else ut.push("PIPELINE-KO: VARNING — expected-läge hittades ej");

// 3. beslutsminne
const post = {
  rond: 202, organ: "Φ", ts: Date.now(),
  beslut: "v173 U8: AEM (Kanada/material 269→270, valuta-mix CAD/USD enligt NTR) levererad efter P/E-bärarkontroll; guldcykel dokumenterad som prisdriven; Altman 4,89 vågens sundaste; universummedianen P/E rörde sig 20,4→20,5 (vågens första). Kö: ABX/rotation, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U8-AEM-AGNICO-UTOKNING.md + _r202-v173u8-*.mjs (kvitton /tmp/r202-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda instanserna (rond 202)");

// 4. prod-HTTP
for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/material", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

// 5. commit + push (med adoptiongren)
const MSG = `studio: [organ:Φ] v173 U8 LEVERERAD — Agnico Eagle Mines AEM (Kanada/material 27→28): P/E-bärarkontroll före leverans (TTM-netto 2 048 M USD > 0, P/E 31,55); valuta-mix CAD-pris/USD-rapportering enligt NTR-mönstret (P/E EXAKT på CAD-EPS-basen); guldcykeln dokumenterad som prisdriven boom (rak CAGR oms +13,65 % · netto +19,58 % med cykelnot; samtliga FY positiva); Altman 4,89 VÅGENS SUNDASTE BALANS; ROIC<WACC + payout 77,55 % öppet; repliker EXAKTA (mcap 0,04 %, P/E, netto-M, FCF-yield; FCF-marginal fältlagen rätt); kompletterande FCF-panelhämtning dokumenterad; universum 269→270 kirurgiskt, llms HELREGEN på 270 (universummedianen P/E 20,4→20,5 — vågens första rörelse, n 257→258, 10 aspektrader), läckagevakt 0 (484), tsc 0, prod 200. Kanada 9. Kö: ABX/rotation, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r202-v173u8-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U8-AEM-AGNICO-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r202-v173u8-sond.mjs", "verktyg/_r202-v173u8-universum-inlagg.mjs", "verktyg/_r202-v173u8-avslut.mjs", "verktyg/_r202-v173u8-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r202-v173u8-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r202-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 202 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}

// 6. efterverifiering
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; AEM='+u.some(b=>b.ticker==='AEM'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r202-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
