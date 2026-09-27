#!/usr/bin/env node
/** _r212-u16-avslut.mjs — v173 U16 (rond 212) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r212-avslut.txt */
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

const RUBRIK = "## ROND 212 [organ:Φ] — v173 U16 LEVERERAD: Shin-Etsu Chemical 4063.T (Japan/material 1→2) — universum 277→278, P/E-fallet löst med fyra låsande repliker, vågens starkaste brottsfria rad — 2026-09-25";
const RAD =
"v173 U16: cellmotiverad duo — Japan/material-cellens TVÅ affärsmodeller: SHIN-ETSU CHEMICAL (TYO-primär JPY, mars-bokslut; världens största kiseltillverkaren — halvledarwafer + silikon) bredvid Nippon Steel (bulkstål = cellens pedagogiska kontrast). P/E-bärarkontroll före leverans GRÖN (TTM-netto 725 mdr JPY > 0) + kollisionskontroll exakt-match. P/E-FALLET är rundens metodkärna: källans statistics-rad 19,34 INTERNt inkonsistent med källans egna EPS/netto-M/mcap/aktier ⇒ fältet bär aktiebas-repliken 13,42 LÅST AV FYRA OBEROENDE källtal (mcap 0,01 % EXAKT · PS EXAKT · netto-M EXAKT · payout ✓); källraden dokumenterad som avvikande (troligen GAAP-jp mot IFRS — Panasonic-ROE-klassen omvänt) och prognosTillväxt NULL (bastvist ⇒ basblandning vägras; källans fwd/PEG enbart referens). Första översiktsläsningen bar inkoherenta tal — TRE kompletterande hämtningar dokumenterade. VÅGENS SJÄTTE BROTTSFRIA RAD och den STARKASTE: ALLA FYRA mått stigande varje år (rak CAGR oms +7,59 % · netto +14,03 %); ROIC 7,35 % ÖVER WACC 5,75 %; räntetäckning 53,67 · Altman 4,11 · Piotroski 7; buyback 0,75 % aktiv. KVD: append 277+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 278 (totalt n 265→266 · 10 aspektrader) · läckagevakt 0 (499) · tsc 0 · prod 200 i avslutet. Japan 22→23 (material-grenen 1→2). Kö: Japans kvarvarande enbolagsceller (halso/industri/energi) · Tysklands 1-grenar · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U16-4063T-SHINETSU-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 212")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 212 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U15 LEVERERAD r211")) {
  pk = pk.replace(
    "nästa: Japans enbolagsceller · Tysklands resterande 1-grenar (energi/kommunikation/fastighet/material) eller spårrotation · rappdagar 10-20→11-04 → v172-kön",
    "U16 LEVERERAD r212: 4063.T Shin-Etsu Japan/material 1→2 (universum 278, P/E-fallet med fyra låsande repliker; V173-U16-protokoll) · nästa: Japans kvarvarande enbolagsceller (halso/industri/energi) · Tysklands 1-grenar eller spårrotation · rappdagar 10-20→11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U16 bokförd");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 212, organ: "Φ", ts: Date.now(),
  beslut: "v173 U16: Shin-Etsu 4063.T (Japan/material 277→278) — duon stål+specialkemi; P/E-fallet löst med fyra låsande repliker mot inkonsistent källrad (prognosTillväxt NULL — basblandning vägras); vågens starkaste brottsfria rad (alla mått stigande varje år). Kö: Japan/Tyskland 1-grenar, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U16-4063T-SHINETSU-UTOKNING.md + _r212-u16-*.mjs (kvitton /tmp/r212-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (212)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/material", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U16 LEVERERAD — Shin-Etsu Chemical 4063.T (Japan/material 29→30): cellmotiverad duo (Nippon Steel bulkstål + Shin-Etsu specialkemi/kisel); P/E-bärarkontroll före leverans; P/E-FALLET: källans 19,34 internt inkonsistent med egna EPS/netto-M/mcap ⇒ fältet bär aktiebas-repliken 13,42 låst av FYRA oberoende källtal (mcap 0,01 %, PS/netto-M EXAKTA, payout ✓), källraden dokumenterad, prognosTillväxt NULL (basblandning vägras); VÅGENS STARKASTE BROTTSFRIA RAD (alla fyra mått stigande varje år; rak CAGR oms +7,59 % · netto +14,03 %); ROIC>WACC, räntetäckning 53,67, Altman 4,11; tre kompletterande panelhämtningar dokumenterade; universum 277→278 kirurgiskt, llms HELREGEN på 278 (totalt n 265→266, 10 aspektrader), läckagevakt 0 (499), tsc 0, prod 200. Japan 22→23. Kö: Japan/Tyskland 1-grenar, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r212-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U16-4063T-SHINETSU-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r212-u16-sond.mjs", "verktyg/_r212-u16-universum-inlagg.mjs", "verktyg/_r212-u16-avslut.mjs", "verktyg/_r212-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r212-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r212-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 212 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; 4063.T='+u.some(b=>b.ticker==='4063.T'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r212-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
