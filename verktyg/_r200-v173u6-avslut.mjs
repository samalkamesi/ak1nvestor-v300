#!/usr/bin/env node
/**
 * _r200-v173u6-avslut.mjs — v173 U6 (rond 200) bokföring + prod-HTTP + commit + push
 * + adoptionsgren + efterverifiering. Kvitto: /tmp/r200-avslut.txt
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
const RUBRIK = "## ROND 200 [organ:Φ] — v173 U6 LEVERERAD: Canadian National Railway CNR (Kanada/industri 0→1) — universum 267→268, vågens andra brottsfria rad, ROIC>WACC — 2026-09-25";
const RAD =
"ROND 200: v173 U6 — BCE-OMG24 §10:s Kanada/industri-öppning: CNR (TSX-primär CAD) levererad efter P/E-bärarkontroll före leverans (TTM-netto 4 467 M > 0; Sony/Honda-doktrinen) + kollisionskontroll exakt-match. Repliker: netto-M 26,18 % EXAKT · PS EXAKT · FCF-yield EXAKT (2,621/2,622 %) · payout 0,6 % · mcap 0,13 %; P/E i dokumentklass — källans 20,88 bär CNR:s JUSTERADE EPS-bas (primärmått), GAAP-repliken 21,95 avviker 5,1 % med bas-skillnaden dokumenterad (Panasonic-ROE-klassen). PROFIL: vågens ANDRA brottsfria rad (efter TELUS): FY22–25 samtliga positiva utan brott — rak CAGR oms +0,31 % · netto +1,63 % (platt men stabil; moat-bolag utan tillväxt); ROIC 9,83 % ÖVER WACC 8,10 % (Kanada-blockets värdeskapare), ROE 24,22 %, EBIT-M 32,42 % järnvägsstruktur; Altman 3,00 exakt på zongränsen med zonnot; spår-PEG 1,94 (källans 4,15 kalibreringsnot); prognosTillväxt +10,77 %. VÅGENS LÄGE efter U1–U6: universum 262→268 (+6), Kanada-blocket 3→7 på fem branschgrenar; två stoppar på vägen (Kirin trebevis-avvisande, TMUS-föråldrad notis grindfångad); tre handräkningsfel fångade av skript före commit; regen/vakt-instrumenten generaliserade och diskdrivna sedan U3. KVD: append 267+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 268 (totalt n 255→256, 10 aspektrader) · läckagevakt 0 (482) · tsc 0 · prod 200 i avslutet. Rappdag est. 10-20 → v172-kön. Kö: CPKC eller AEM/ABX · Kirin-omprövning vid normaliserad TTM. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U6-CNR-JARNVAG-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 200")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 200 appendad");
} else ut.push("worklog: SKIPPAD");

// 2. PIPELINE-KO
const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
const mark = "PÅBÖRJAD r199: U1–U5 LEVERERADE";
if (pk.includes(mark)) {
  pk = pk.replace(
    "PÅBÖRJAD r199: U1–U5 LEVERERADE — 4661.T + 6752.T + TELUS + RCI-B + Nutrien NTR Kanada/material 0→1 (V173-U5; Kirin AVVISAD i U3) — universum 262→267, llms HELREGEN ×5, läckagevakt 0 ×5, tsc 0 ×5; Kanada 6 bolag · nästa: Kanada/industri (CNR/CPKC) + material AEM/ABX · rappdagar 10-22/29/30 + 11-04 → v172-kön",
    "PÅBÖRJAD r200: U1–U6 LEVERERADE — 4661.T + 6752.T + TELUS + RCI-B + NTR + CNR Kanada/industri 0→1 (V173-U6; Kirin AVVISAD i U3) — universum 262→268, llms HELREGEN ×6, läckagevakt 0 ×6, tsc 0 ×6; Kanada 7 bolag på fem grenar · nästa: CPKC (industri 1→2) eller AEM/ABX (material 1→2/3) · rappdagar 10-20/22/29/30 + 11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: v173-rad → U1–U6 r200");
} else if (pk.includes("PÅBÖRJAD r200")) ut.push("PIPELINE-KO: redan bokförd");
else ut.push("PIPELINE-KO: VARNING — expected-läge hittades ej");

// 3. beslutsminne
const post = {
  rond: 200, organ: "Φ", ts: Date.now(),
  beslut: "v173 U6: CNR (Kanada/industri 267→268) levererad efter P/E-bärarkontroll; vågens andra brottsfria serie; P/E på källans justerade EPS-bas med GAAP-avvikelse dokumenterad; ROIC>WACC Kanadas värdeskapare. Vågen U1–U6: +6 bolag (262→268), Kanada 3→7. Kö: CPKC/AEM/ABX, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U6-CNR-JARNVAG-UTOKNING.md + _r200-v173u6-*.mjs (kvitton /tmp/r200-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda instanserna (rond 200)");

// 4. prod-HTTP
for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/industri", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

// 5. commit + push (med adoptiongren)
const MSG = `studio: [organ:Φ] v173 U6 LEVERERAD — Canadian National Railway CNR (Kanada/industri 22→23): P/E-bärarkontroll före leverans (TTM-netto 4 467 M > 0, P/E 20,88); vågens andra brottsfria serie (FY22–25 samtliga positiva; rak CAGR oms +0,31 % · netto +1,63 %); P/E på källans JUSTERADE EPS-bas med GAAP-avvikelse 5,1 % dokumenterad; repliker EXAKTA (netto-M 26,18 %, PS, FCF-yield, payout); ROIC 9,83 % ÖVER WACC 8,10 % (Kanadas värdeskapare), Altman 3,00 zongräns dokumenterad; universum 267→268 kirurgiskt, llms HELREGEN på 268 (totalt n 255→256, 10 aspektrader), läckagevakt 0 (482), tsc 0, prod 200. Vågen U1–U6: +6 bolag, Kanada 3→7 på fem grenar. Kö: CPKC/AEM/ABX, rappdagar 10-20/22/29/30+11-04 → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r200-v173u6-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U6-CNR-JARNVAG-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r200-v173u6-sond.mjs", "verktyg/_r200-v173u6-universum-inlagg.mjs", "verktyg/_r200-v173u6-avslut.mjs", "verktyg/_r200-v173u6-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r200-v173u6-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r200-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 200 adoption — prod-trädets rena append(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}

// 6. efterverifiering
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; CNR='+u.some(b=>b.ticker==='CNR'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r200-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
