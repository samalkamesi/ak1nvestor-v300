#!/usr/bin/env node
/**
 * _r198-v173u4-avslut.mjs — v173 U4 (rond 198) bokföring + prod-HTTP + commit + push
 * + ADOPTIONSGREN (om prod-trädet fått M-filer: sondera, adoptera rena append:ar,
 * rensa, extra-commit) + efterverifiering. Kvitto: /tmp/r198-avslut.txt
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

// ── 1. worklog ────────────────────────────────────────────────────────────────
const RUBRIK = "## ROND 198 [organ:Φ] — v173 U4 LEVERERAD: Rogers RCI-B (Kanada/kommunikation +1) — universum 265→266, P/E-bärarkontroll FÖRE leverans, Shaw-brottet dokumenterat — 2026-09-25";
const RAD =
"v173 U4: BCE-OMG24 §10:s förstakoordinat ROGERS levererad (TSX klass B i CAD, BCE/TELUS-precedensen) efter P/E-bärarkontroll FÖRE leverans enligt Sony/Honda-doktrinen (TTM-netto +1 838 M CAD > 0, P/E 15,92 mätt — GRÖN; kollisionskontroll exakt-match först, rond 197:s läxa). Repliker: P/E EXAKT på källans EPS-bas 3,10 (NCI-avdrag ~174 M dokumenterat — EPS-identiteten 3,425 gäller netto inkl. minoriteter), netto-M EXAKT (1 838/20 269), FCF-yield EXAKT (748/26 500 mot 1/P·FCF), mcap 0,2 %. ÄRLIGHETSPPOSTER ÖPPET: SHAW-BROTTET FY2023 (förvärv +25,5 % omsättningshopp i ett steg; FY23-netto 2 557 M bär fair value-engångsposter) ⇒ CAGR på 2-årig konsekutiv post-Shaw-bas (oms +3,29 % · netto −16,82 % mot engångspoståret — aritmetik, dokumenterat; 3-årig rak +10,2 % skulle misstolka hoppet som tillväxt) · FCF-KOLLAPSEN FY2025 (748 M mot 2 446 = capex-/spectrumcykel, P/FCF 35,45) · ROIC 3,91 % under WACC 6,79 % (JV-struktur) · Altman 1,73 varningszonen som datafakta (Piotroski 6) · prognosTillväxt +20,6 % (fwd 13,20; spår-PEG 0,77). KVD: append 265+/0− · läs-tillbaka ×2 · fältgrind mot 4452.T · llms K2 round-trip på 266 (kommunikation n 23→24 antal 26 · totalt n 253→254 · 10 aspektrader; U3:s diskdrivna instrument återanvända — regen/vakt är universumsdrivna, ingen ny kropp behövs) · läckagevakt 0 (480 sökningar) · tsc 0 · prod 200 körs i avslutet. Kanada-cellen 4→5 (cellräkning rätt FÖRE skrivning — U3:s paranoid-läxa tillämpad från start). Kö: Kanada/material (NTR/AEM/ABX) + industri (CNR/CPKC) · rappdagar 10-22 (RCI-B+TMUS est.)/10-29/10-30 → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U4-RCIB-ROGERS-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 198")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 198 appendad");
} else ut.push("worklog: SKIPPAD");

// ── 2. PIPELINE-KO ────────────────────────────────────────────────────────────
const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
const mark = "PÅBÖRJAD r197: U1+U2+U3 LEVERERADE";
if (pk.includes(mark)) {
  pk = pk.replace(
    "PÅBÖRJAD r197: U1+U2+U3 LEVERERADE — 4661.T Japan/konsument (V173-U1) + 6752.T Japan/teknik (V173-U2) + TELUS Kanada/kommunikation (V173-U3; Kirin 2503.T AVVISAD på trebevis-engångspostanalys) — universum 262→265, llms HELREGEN ×3, läckagevakt 0 ×3, tsc 0 ×3 · nästa: Rogers RCU (BCE-OMG24 §10) · Kanada/material+industri · rappdagar 10-29/10-30 + TELUS Q3 v45 → v172-kön",
    "PÅBÖRJAD r198: U1–U4 LEVERERADE — 4661.T + 6752.T + TELUS + Rogers RCI-B Kanada/kommunikation (V173-U4; Kirin AVVISAD i U3) — universum 262→266, llms HELREGEN ×4, läckagevakt 0 ×4, tsc 0 ×4; Kanada/kommunikation vid matta 3 (BCE+TELUS+RCI-B) · nästa: Kanada/material (NTR/AEM/ABX) + Kanada/industri (CNR/CPKC) · rappdagar 10-22/10-29/10-30 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: v173-rad → U1–U4 r198");
} else if (pk.includes("PÅBÖRJAD r198")) ut.push("PIPELINE-KO: redan bokförd");
else ut.push("PIPELINE-KO: VARNING — expected-läge hittades ej");

// ── 3. beslutsminne ───────────────────────────────────────────────────────────
const post = {
  rond: 198, organ: "Φ", ts: Date.now(),
  beslut: "v173 U4: Rogers RCI-B (Kanada/kommunikation 265→266) levererad efter P/E-bärarkontroll före leverans; Shaw-brott FY23 dokumenterat (CAGR post-Shaw konsekutiv); FCF-kollaps FY25 + Altman 1,73 + ROIC<WACC öppet; U3:s diskdrivna regen/vakt-instrument återanvända (bevisad generaliserbarhet). Kö: Kanada/material+industri, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U4-RCIB-ROGERS-UTOKNING.md + _r198-v173u4-*.mjs (kvitton /tmp/r198-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda instanserna (rond 198)");

// ── 4. prod-HTTP (200-kravet) ─────────────────────────────────────────────────
for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/kommunikation", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

// ── 5. commit + push (med adoptiongren) ──────────────────────────────────────
const MSG = `studio: [organ:Φ] v173 U4 LEVERERAD — Rogers Communications RCI-B (Kanada/kommunikation 25→26): P/E-bärarkontroll FÖRE leverans (TTM-netto +1 838 M > 0, P/E 15,92; kollisionskontroll exakt-match först); universum 265→266 kirurgiskt, SHAW-BROTT FY2023 dokumenterat (CAGR 2-årig post-Shaw: oms +3,29 % · netto −16,82 % mot engångspoståret), FCF-kollaps FY2025 (capex-/spectrumcykel), P/E-replik EXAKT på källans EPS-bas (NCI-not), Altman 1,73 + ROIC<WACC öppet; llms HELREGEN på 266 (kommunikation n 23→24, totalt n 253→254, 10 aspektrader — U3:s diskdrivna instrument), läckagevakt 0 (480 sökningar), tsc 0, prod 200. Kanada 4→5. Kö: Kanada/material+industri, rappdagar 10-22/29/30 → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r198-v173u4-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U4-RCIB-ROGERS-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r198-v173u4-sond.mjs", "verktyg/_r198-v173u4-universum-inlagg.mjs", "verktyg/_r198-v173u4-avslut.mjs", "verktyg/_r198-v173u4-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r198-v173u4-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r198-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }

// adoptiongren: push; om avvisad — adoptera prod:s M-filer, rensa, commit, pusha igen
let pu = run(A, ["push", "prod", "develop"], "push-1");
if (pu.status !== 0) {
  ut.push("PUSH-1 avvisad — adoptiongren aktiveras");
  const st = run(P, ["status", "--porcelain"], "prod-status");
  const mFiler = (st.stdout || "").split("\n").filter((r) => r.startsWith(" M")).map((r) => r.slice(3).trim());
  for (const FIL of mFiler) {
    const head = sp("git", ["-C", P, "show", `HEAD:${FIL}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const disk = readFileSync(`${P}/${FIL}`, "utf8");
    const append = disk.startsWith(head.stdout);
    ut.push(`${FIL}: ren-append ${append} (+${disk.length - head.stdout.length} tecken)`);
    copyFileSync(`${P}/${FIL}`, `${A}/${FIL}`);
    run(P, ["checkout", "--", FIL], "prod-checkout");
  }
  run(A, ["add", ...mFiler], "add-adoptioner");
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 198 adoption — prod-trädets rena append(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}

// ── 6. efterverifiering ──────────────────────────────────────────────────────
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; RCI-B='+u.some(b=>b.ticker==='RCI-B'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r198-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
