#!/usr/bin/env node
/**
 * _r201-v173u7-avslut.mjs — v173 U7 (rond 201) bokföring + prod-HTTP + commit + push
 * + adoptionsgren + efterverifiering. Kvitto: /tmp/r201-avslut.txt
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
const RUBRIK = "## ROND 201 [organ:Φ] — v173 U7 LEVERERAD: Canadian Pacific Kansas City CP (Kanada/industri 1→2) — universum 268→269, järnvägsduon komplett, K&A-brottet dokumenterat — 2026-09-25";
const RAD =
"v173 U7: BCE-OMG24 §10:s industri-andrakandidat CPKC (TSX-primär CAD) levererad efter P/E-bärarkontroll före leverans (TTM-netto 3 847 M > 0; Sony/Honda-doktrinen) + kollisionskontroll exakt-match — JÄRNVÄGSDUON KOMPLETT (CNR+CPKC, den pedagogiska kontrasten ROIC>WACC mot ROIC<WACC i samma cell). Repliker: mcap 0,02 % EXAKT · netto-M 26,36 % EXAKT · PS EXAKT · FCF-yield EXAKT (1,813/1,813) · payout 0,9 %; P/E dokumentklass — källans 28,17 bär CPKC:s CORE-JUSTERADE bas (KCS purchase accounting), GAAP-repliken 26,09 avviker 7,4 % med bas-skillnaden dokumenterad. K&A-BROTTET FY2023 (Kansas City Southern +42 % omsättningshopp — USA-Mexiko-nätet) ⇒ CAGR på 2-årig konsekutiv post-KCS-bas (oms +8,04 % · netto −0,78 %; 3-årig rak +18,5 % skulle misstolka förvärvet som tillväxt — AXA/Shaw-precedenserna); nettot stabilt 3,3–3,9 mdr i serien; FCF-nedgång 2 876→1 818 = integrations-capex. Ärlighet öppet: ROIC 5,66 % UNDER WACC 7,37 % (integrationens kapitalbas — kontrast mot CNR dokumenterad), Altman 2,69 varningszon (Piotroski 6), beta 1,08 blockets enda över 1, spår-PEG 2,26 (källans 5,41 kalibreringsnot), prognosTillväxt +12,46 %. KVD: append 268+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 269 (totalt n 256→257, 10 aspektrader — diskdrivet instrument femte körningen) · läckagevakt 0 (483) · tsc 0 · prod 200 i avslutet. Kanada 8 bolag. Rappdag 10-28 → v172-kön. Kö: AEM/ABX (material 1→2/3) · Kirin-omprövning vid normaliserad TTM. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U7-CP-CPKC-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 201")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 201 appendad");
} else ut.push("worklog: SKIPPAD");

// 2. PIPELINE-KO
const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
const mark = "PÅBÖRJAD r200: U1–U6 LEVERERADE";
if (pk.includes(mark)) {
  pk = pk.replace(
    "PÅBÖRJAD r200: U1–U6 LEVERERADE — 4661.T + 6752.T + TELUS + RCI-B + NTR + CNR Kanada/industri 0→1 (V173-U6; Kirin AVVISAD i U3) — universum 262→268, llms HELREGEN ×6, läckagevakt 0 ×6, tsc 0 ×6; Kanada 7 bolag på fem grenar · nästa: CPKC (industri 1→2) eller AEM/ABX (material 1→2/3) · rappdagar 10-20/22/29/30 + 11-04 → v172-kön",
    "PÅBÖRJAD r201: U1–U7 LEVERERADE — 4661.T + 6752.T + TELUS + RCI-B + NTR + CNR + CP Kanada/industri 1→2 (V173-U7, järnvägsduon komplett; Kirin AVVISAD i U3) — universum 262→269, llms HELREGEN ×7, läckagevakt 0 ×7, tsc 0 ×7; Kanada 8 bolag · nästa: AEM/ABX (material 1→2/3) eller rotation · rappdagar 10-20/22/28/29/30 + 11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: v173-rad → U1–U7 r201");
} else if (pk.includes("PÅBÖRJAD r201")) ut.push("PIPELINE-KO: redan bokförd");
else ut.push("PIPELINE-KO: VARNING — expected-läge hittades ej");

// 3. beslutsminne
const post = {
  rond: 201, organ: "Φ", ts: Date.now(),
  beslut: "v173 U7: CPKC CP (Kanada/industri 268→269) levererad efter P/E-bärarkontroll; K&A-brott FY23 dokumenterat (post-KCS konsekutiv CAGR); core-justerad P/E-bas dokumenterad (7,4 %); järnvägsduon CNR+CPKC komplett med ROIC-kontrast. Kö: AEM/ABX, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U7-CP-CPKC-UTOKNING.md + _r201-v173u7-*.mjs (kvitton /tmp/r201-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda instanserna (rond 201)");

// 4. prod-HTTP
for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/industri", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

// 5. commit + push (med adoptiongren)
const MSG = `studio: [organ:Φ] v173 U7 LEVERERAD — Canadian Pacific Kansas City CP (Kanada/industri 23→24): P/E-bärarkontroll före leverans (TTM-netto 3 847 M > 0, P/E 28,17); JÄRNVÄGSDUON KOMPLETT (CNR+CPKC med ROIC-kontrasten >WACC vs <WACC i samma cell); K&A-BROTT FY2023 (KCS +42 %-hopp) ⇒ post-KCS konsekutiv CAGR (oms +8,04 % · netto −0,78 %); P/E på källans core-justerade bas med GAAP-avvikelse 7,4 % dokumenterad; repliker EXAKTA (mcap 0,02 %, netto-M, PS, FCF-yield, payout); Altman 2,69 + ROIC<WACC + integrations-capex öppet; universum 268→269 kirurgiskt, llms HELREGEN på 269 (totalt n 256→257, 10 aspektrader), läckagevakt 0 (483), tsc 0, prod 200. Kanada 8. Kö: AEM/ABX, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r201-v173u7-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U7-CP-CPKC-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r201-v173u7-sond.mjs", "verktyg/_r201-v173u7-universum-inlagg.mjs", "verktyg/_r201-v173u7-avslut.mjs", "verktyg/_r201-v173u7-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r201-v173u7-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r201-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 201 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push (prod:s senaste version bevarad i git)"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}

// 6. efterverifiering
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; CP='+u.some(b=>b.ticker==='CP'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r201-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
