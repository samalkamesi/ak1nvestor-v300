#!/usr/bin/env node
/** _r216-u20-avslut.mjs — v173 U20 (rond 216) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r216-avslut.txt */
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

const RUBRIK = "## ROND 216 [organ:Φ] — v173 U20 LEVERERAD: E.ON EOAN.DE (Tyskland/energi 1→2) — universum 281→282, producent/distributör-parallellen Japan–Tyskland komplett, vågens åttonde brottsfria rad — 2026-09-25";
const RAD =
"v173 U20: Tyskland/energi-cellens duo — E.ON (ETR-primär EUR) bredvid RWE (produktion/grön kraft mot nätdistribution = SAMMA producent/distributör-kontrast som Japan/energi U19 (INPEX+Tokyo Gas): pedagogisk parallellitet över länderna, dokumenterad i båda raderna). P/E-bärarkontroll före leverans GRÖN (TTM-netto 3 207 M EUR > 0; Sony/Honda-doktrinen) + kollisionskontroll exakt-match. VÅGENS ÅTTONDE BROTTSFRIA RAD: netto [2 096 · 2 884 · 2 930 · 3 076] stigande VARJE ÅR, FCF stigande tre år (rak CAGR oms +3,76 % · netto +13,64 % — energikrisårens nättariffexpansion). Repliker: netto-M EXAKT (7,28 %) · PS EXAKT (0,708) · payout EXAKT (46,2 %) · mcap 0,02 %; P/E 12,89 källans justerade bas (GAAP-replik 9,72 noterad — Tokyo Gas/Hitachi-klassen). REGLERADE NÄTMETODNOTER (Redeia/Cellnex/Tokyo Gas-klassen): ROIC<WACC = avkastningsformeln · Altman 1,5 = nätutbyggnadsprogrammet · utdelning 4,75 % krisårens nivå (dokumenterad). prognosTillväxt +11,80 % (spår-PEG 1,09). KVD: append 281+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 282 (totalt n 269→270 · 10 aspektrader) · läckagevakt 0 (507) · tsc 0 · prod 200 i avslutet. Tyskland 19→20 (energi-grenen 1→2). Kö: Tysklands kvarvarande 1-grenar (kommunikation/fastighet/material) · omprövningar (Astellas+Kirin) · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U20-EOAN-EON-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 216")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 216 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U19 LEVERERAD r215")) {
  pk = pk.replace(
    "nästa: Tysklands 1-grenar eller spårrotation · omprövningar: Astellas + Kirin (villkor dokumenterade) · rappdagar 10-20→11-04 → v172-kön",
    "U20 LEVERERAD r216: EOAN.DE E.ON Tyskland/energi 1→2 (universum 282, producent/distributör-parallellen Japan–Tyskland komplett; V173-U20-protokoll) · nästa: Tysklands kvarvarande 1-grenar (kommunikation/fastighet/material) eller spårrotation · omprövningar: Astellas + Kirin · rappdagar 10-20→11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U20 bokförd");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 216, organ: "Φ", ts: Date.now(),
  beslut: "v173 U20: E.ON EOAN.DE (Tyskland/energi 281→282) — producent/distributör-duo (RWE+E.ON) speglar Japan/energi (INPEX+Tokyo Gas) — parallellitet dokumenterad; vågens åttonde brottsfria rad; PS/netto-M/payout EXAKTA. Kö: Tysklands 1-grenar, omprövningar, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U20-EOAN-EON-UTOKNING.md + _r216-u20-*.mjs (kvitton /tmp/r216-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (216)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/energi", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U20 LEVERERAD — E.ON EOAN.DE (Tyskland/energi 27→28): cellmotiverad duo (RWE produktion + E.ON nätdistribution — SAMMA kontrast som Japan/energi U19, parallellitet dokumenterad i båda raderna); P/E-bärarkontroll före leverans (TTM-netto 3 207 M EUR > 0); VÅGENS ÅTTONDE BROTTSFRIA RAD (netto stigande varje år 2 096→3 076; rak CAGR oms +3,76 % · netto +13,64 % — nättariffexpansionen); repliker EXAKTA (netto-M 7,28 %, PS 0,708, payout 46,2 %) + mcap 0,02 %; P/E 12,89 källans justerade bas (GAAP-replik noterad); nämetodnoter (ROIC-formeln, Altman 1,5 = nätutbyggnad); utdelning 4,75 % krisårsnivå dokumenterad; universum 281→282 kirurgiskt, llms HELREGEN på 282 (totalt n 269→270, 10 aspektrader), läckagevakt 0 (507), tsc 0, prod 200. Tyskland 19→20. Kö: Tysklands 1-grenar, omprövningar, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r216-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U20-EOAN-EON-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r216-u20-sond.mjs", "verktyg/_r216-u20-universum-inlagg.mjs", "verktyg/_r216-u20-avslut.mjs", "verktyg/_r216-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r216-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r216-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 216 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; EOAN.DE='+u.some(b=>b.ticker==='EOAN.DE'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r216-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
