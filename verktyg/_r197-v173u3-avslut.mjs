#!/usr/bin/env node
/**
 * _r197-v173u3-avslut.mjs — v173 U3 (rond 197) bokföring + commit + push + verifiering.
 * Kvitto: /tmp/r197-avslut.txt
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { spawnSync as sp } from "node:child_process";

const A = "/home/ak1a/agent/ak1";
const ut = [];
const run = (args, tag, cwd = A) => {
  const r = sp("git", args, { cwd, encoding: "utf8", maxBuffer: 32 * 1024 * 1024, timeout: 240000 });
  ut.push(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-2).join(" | ").slice(0, 240)}`);
  return r;
};

// ── 1. worklog ────────────────────────────────────────────────────────────────
const RUBRIK = "## ROND 197 [organ:Φ] — v173 U3: KIRIN AVVISAD på tre oberoende bevis, TMUS-kollision fångad av grinden, TELUS LEVERERAD (Kanada/kommunikation +1) — universum 264→265 — 2026-09-25";
const RAD =
"v173 U3 blev rundens starkaste kvalitetsfall: (1) KIRIN 2503.T AVVISAD efter engångspostanalys — tre oberoende bevis (netto-marginal 16,86 % ÖVER EBIT-marginalen 12,56 % ⇒ bokföringsvinster under EBIT-linjen; omsättning platt −0,6 % medan netto +56 %; fwd P/E 19,67 > trailing 14,45 = marknadens −27 %-normalisering) bekräftar OMG20:s flagga — en rad med de talen skulle förgifta konsument-cellens kvartiler med icke-återkommande tal (OMG20-precedensen + Honda-doktrinen; protokoll V173-U3 del 1). (2) KANDIDATJAKTEN: OMG23:s 'TMUS → ledig' var FÖRÅLDRAD — syskon levererade 2026-09-20 (dubbelkälla) och mitt inläggs DUPlikATGRIND abortade korrekt medan sondens regex-dubbelkoll missade (läxa: exakt ticker-matchning mot disk, aldrig regex-gissning — rond 188:s arv); sond v2 genom hela protokollskörden: TEF/VOD dokumenterat P/E-döda, BCE-OMG24 §10:s kö-notis 'Kanada/kommunikation 1→2: RCU + TELUS' = dokumenterad öppen cell. (3) VAL+LEVERANS: TELUS (TSX-primär CAD, BCE-precedensen) — P/E-bärarkriteriet konfirmerat (26,54); repliker: netto-M EXAKT, mcap 0,6 %, fcfY 0,6 %, pe 1,8 % (dokumentklass); FY2022–25 SAMTLIGA positiva = vågens FÖRSTA RAD UTAN BROTTS- ELLER NEGATIVBAS-DOKUMENTATION (rak CAGR: oms −0,13 % · netto +5,76 %); ärlighet öppet: payout 163,89 % (utdelning över vinst — balansfinansierad, 6,04 % direktavkastning), Altman 1,55 djup varningszon som datafakta, prognosTillväxt +66,2 % = D&A-normalisering (spår-PEG 0,40); paranoid-räknefel (Kanada 4→5) kirurgiskt rättat till 3→4 före commit — maskin-mätning före hand-påstående igen. KVD: append 264+/0− · läs-tillbaka ×2 · fältgrind mot 4452.T · llms K2 round-trip på 265 (kommunikation P75 24,5→26 n 22→23 · totalt n 252→253 · 10 aspektrader) · läckagevakt 0 (265 bolag/478 sökningar) · tsc 0 · prod 200 körs här. Kö: Rogers RCU (BCE §10 förstakoordinat) · Kanada/material+industri · rappdagar 10-29/10-30 + TELUS Q3 v45 → v172. Kirin kan omprövas när normaliserat TTM slår igenom (villkor dokumenterat). R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U3-KIRIN-AVVISAD-TELUS-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 197")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 197 appendad");
} else ut.push("worklog: SKIPPAD (fanns)");

// ── 2. PIPELINE-KO: v173 U1+U2 → U1+U2+U3 ────────────────────────────────────
const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
const gammal = "PÅBÖRJAD r196: U1+U2 LEVERERADE";
if (pk.includes(gammal)) {
  pk = pk.replace(
    "PÅBÖRJAD r196: U1+U2 LEVERERADE — Oriental Land 4661.T Japan/konsument + Oriental Land… se protokoll V173-U1-4661T + U2 Panasonic 6752.T Japan/teknik (universum 262→264, llms HELREGEN ×2, läckagevakt 0 ×2, prod 200 ×2; protokoll V173-U2-6752T) · nästa: Kirin 2503.T (engångspost-analys) · rappdagar 10-29/10-30 → v172-kön",
    "PÅBÖRJAD r197: U1+U2+U3 LEVERERADE — 4661.T Japan/konsument (V173-U1) + 6752.T Japan/teknik (V173-U2) + TELUS Kanada/kommunikation (V173-U3; Kirin 2503.T AVVISAD på trebevis-engångspostanalys) — universum 262→265, llms HELREGEN ×3, läckagevakt 0 ×3, tsc 0 ×3 · nästa: Rogers RCU (BCE-OMG24 §10) · Kanada/material+industri · rappdagar 10-29/10-30 + TELUS Q3 v45 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: v173-rad → U1+U2+U3 r197");
} else if (pk.includes("PÅBÖRJAD r197")) ut.push("PIPELINE-KO: redan bokförd");
else ut.push("PIPELINE-KO: VARNING — expected-läge hittades ej");

// ── 3. beslutsminne ───────────────────────────────────────────────────────────
const post = {
  rond: 197, organ: "Φ", ts: Date.now(),
  beslut: "v173 U3: Kirin 2503.T AVVISAD (trebevis-engångspostanalys: netto-M>EBIT-M, rev platt+netto+56 %, fwd>trailing −27 %) — avvisandet är kvalitetsskydd av cellen; TMUS-kollision: OMG23-notis föråldrad, duplikatgrind bevisad; TELUS levererad (Kanada/kommunikation 264→265, TSX/CAD) med payout 163,89 % + Altman 1,55 öppet. Kö: Rogers RCU, Kanada/material+industri, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U3-KIRIN-AVVISAD-TELUS-UTOKNING.md + _r197-v173u3-*.mjs (kvitton /tmp/r197-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda instanserna (rond 197)");

// ── 4. prod-HTTP (200-kravet) ─────────────────────────────────────────────────
for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/kommunikation", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

// ── 5. commit + push ─────────────────────────────────────────────────────────
const MSG = `studio: [organ:Φ] v173 U3 LEVERERAD med avvisandedoktrin — Kirin 2503.T AVVISAD på tre oberoende engångspostbevis (netto-M 16,9 % över EBIT-M 12,6 %; rev platt medan netto +56 %; fwd P/E 19,67>trailing 14,45 = −27 % normalisering — OMG20-flaggan bekräftad, cellen skyddad); TMUS-kollision: OMG23:s ledig-notis föråldrad (syskon 09-20), duplikatgrinden ABORTADE korrekt (läxa: exakt ticker-matchning, aldrig regex); VAL enligt BCE-OMG24 §10 kö-notis: TELUS (Kanada/kommunikation 24→25, TSX-primär CAD) — universum 264→265 kirurgiskt, FY22–25 SAMTLIGA positiva (vågens första brottsfria rad; rak CAGR oms −0,13 % · netto +5,76 %), payout 163,89 % + Altman 1,55 + prognos +66,2 % (D&A-normalisering, spår-PEG 0,40) alla öppet; llms HELREGEN på 265 (kommunikation P75 24,5→26, n 252→253, 10 aspektrader), läckagevakt 0 (478 sökningar), tsc 0, prod 200. Paranoid-räknerättning (Kanada 3→4) före commit. Kö: Rogers RCU, Kanada/material+industri, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r197-v173u3-commitmsg.txt", MSG);
run(["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U3-KIRIN-AVVISAD-TELUS-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r197-v173u3-sond.mjs", "verktyg/_r197-v173u3-tmussond.mjs", "verktyg/_r197-v173u3-landsond.mjs", "verktyg/_r197-v173u3-kandidater.mjs", "verktyg/_r197-v173u3-universum-inlagg.mjs", "verktyg/_r197-v173u3-telus-inlagg.mjs", "verktyg/_r197-v173u3-telus-rattning.mjs", "verktyg/_r197-v173u3-llms-regen.mjs", "verktyg/_r197-v173u3-lackagevakt.mjs", "verktyg/_r197-v173u3-commitmsg.txt", "verktyg/_r197-v173u3-avslut.mjs"], "add");
const c = run(["commit", "-F", "verktyg/_r197-v173u3-commitmsg.txt"], "commit");
if (c.status === 0) {
  run(["push", "prod", "develop"], "push");
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; TELUS='+u.some(b=>b.ticker==='TELUS'))"], { encoding: "utf8" });
  ut.push("prod-trädet universum: " + (uni.stdout || "").trim());
  run(["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r197-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
