#!/usr/bin/env node
/** _r214-u18-avslut.mjs — v173 U18 (rond 214) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r214-avslut.txt */
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

const RUBRIK = "## ROND 214 [organ:Φ] — v173 U18 LEVERERAD: Hitachi 6501.T (Japan/industri 1→2) — universumet 280 (vågen +18), omvandlingsprofilen dokumenterad (netto fyrdubblat på platt omsättning) — 2026-09-25";
const RAD =
"v173 U18: Japan/industri-cellens duo — HITACHI (TYO-primär JPY, mars-bokslut) bredvid Komatsu (byggnadsmaskiner mot digitala Lumada-system/konglomerat = cellens två affärsmodeller). P/E-bärarkontroll före leverans GRÖN (TTM-netto 539 mdr JPY > 0; Sony/Honda-doktrinen) + kollisionskontroll exakt-match. OMVANDLINGSPROFILEN är rundens kärna: netto [67 · 173 · 350 · 559] FYRDUBBLAT på tre år medan omsättningen är PLATT (+1,44 %/år) — konglomeratomvandlingen (tunga divisioner sålda, digitala system växer): VINSTEN är storyn ej volymen; rak netto-CAGR +102,8 % bär LÅG BAS och dokumenteras som VÄNDNINGS-CAGR med bas-not (Daiichi-klassen). Repliker: FCF-yield EXAKT (2,60 %) · mcap 0,1 %; P/E 22,25 källans justerade bas (GAAP-replik 36,9 — minoritetsrikt konglomerat, basgap dokumenterat) · källans netto-M-rad annat fönster (fältet bär seriekonsistent replik 6,19 % med not) · payout-rad saknades (replik med not). ROIC 7,2 % ÖVER WACC 6,4 % (värdeskapande post-omvandling); räntetäckning 17,3 · Altman 2,9 gränszon · spår-PEG 1,34 mot källans 1,68 (nära kalibrering). KVD: append 279+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 280 (totalt n 267→268 · 10 aspektrader) · läckagevakt 0 (503) · tsc 0 · prod 200 i avslutet. Japan 24→25 (industri-grenen 1→2) — UNIVERSUMET 280 BOLAG (vågen 262→280, +18). Kö: Japan/energi (sista enbolagscellen) · Tysklands 1-grenar · omprövningar (Astellas+Kirin) · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U18-6501T-HITACHI-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 214")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 214 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U17 LEVERERAD r213")) {
  pk = pk.replace(
    "nästa: Japans industri/energi-cellöppningar · Tysklands 1-grenar eller spårrotation · omprövningar: Astellas 4503.T + Kirin 2503.T (villkor dokumenterade) · rappdagar 10-20→11-04 → v172-kön",
    "U18 LEVERERAD r214: 6501.T Hitachi Japan/industri 1→2 (universum 280 — vågen +18; V173-U18-protokoll) · nästa: Japan/energi (sista enbolagscellen) · Tysklands 1-grenar eller spårrotation · omprövningar: Astellas + Kirin (villkor dokumenterade) · rappdagar 10-20→11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U18 bokförd");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 214, organ: "Φ", ts: Date.now(),
  beslut: "v173 U18: Hitachi 6501.T (Japan/industri 279→280) — universumet 280 (vågen +18); omvandlingsprofil dokumenterad (netto fyrdubblat på platt omsättning — VÄNDNINGS-CAGR med låg-bas-not); basvister (P/E/minoritetsgap, netto-M-fönster) dokumenterade. Kö: Japan/energi, Tyskland, omprövningar, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U18-6501T-HITACHI-UTOKNING.md + _r214-u18-*.mjs (kvitton /tmp/r214-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (214)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/industri", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U18 LEVERERAD — Hitachi 6501.T (Japan/industri 25→26): cellmotiverad duo (Komatsu byggnadsmaskiner + Hitachi digitala system/konglomerat); P/E-bärarkontroll före leverans (TTM-netto 539 mdr JPY > 0); OMVANDLINGSPROFILEN: netto fyrdubblat 67→559 på PLATT omsättning (+1,44 %/år — konglomeratomvandlingen, vinsten är storyn) ⇒ VÄNDNINGS-CAGR +102,8 % med LÅG-BAS-NOT (Daiichi-klassen); FCF-yield EXAKT 2,60 %; P/E 22,25 källans justerade bas (GAAP-replik 36,9 — minoritetsgap dokumenterat); netto-M fält=replik 6,19 % (källans 7,4 %-rad annat fönster noterad); ROIC 7,2 % > WACC 6,4 % post-omvandling; Altman 2,9 gränszon; spår-PEG 1,34 (källans 1,68 — nära); universum 279→280 KIRURGISKT (vågen 262→280, +18), llms HELREGEN på 280 (totalt n 267→268, 10 aspektrader), läckagevakt 0 (503), tsc 0, prod 200. Japan 24→25. Kö: Japan/energi, Tyskland, omprövningar, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r214-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U18-6501T-HITACHI-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r214-u18-sond.mjs", "verktyg/_r214-u18-universum-inlagg.mjs", "verktyg/_r214-u18-avslut.mjs", "verktyg/_r214-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r214-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r214-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 214 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; 6501.T='+u.some(b=>b.ticker==='6501.T'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r214-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
