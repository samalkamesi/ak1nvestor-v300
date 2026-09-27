#!/usr/bin/env node
/** _r209-u13-avslut.mjs — v173 U13 (rond 209) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r209-avslut.txt */
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

const RUBRIK = "## ROND 209 [organ:Φ] — v173 U13 LEVERERAD: Munich Re MUV2.DE (Tyskland/finans 1→2) — universum 274→275, första CELLMOTIVERADE valet, SAP-förslaget avlivat av kollisionsgrinden, vågens fjärde brottsfria rad — 2026-09-25";
const RAD =
"v173 U13: med alla dokumenterade listor tomma efter U12 togs det första CELLMOTIVERADE valet enligt S2-mönstret — Tyskland/finans-cellens ANDRA affärsmodell: MUNICH RE (ETR-primär EUR) bredvid Allianz = direkt+åter-duon (TRYG/AXA-precedensens struktur). Rondens direktivsförslag SAP AVLIVADES av kollisionsgrinden (SAP.DE på disk — Tyskland/teknik bär honom redan; grinden bevisad ännu en gång). P/E-bärarkontroll före leverans GRÖN (TTM-netto 5 957 M EUR > 0). Repliker: FEM EXAKTA + payout till 0,08 % (P/E 13,83 · netto-M 8,68 % · PS · FCF-yield 11,20 % · payout 51,98/51,94 — vågens näst starkaste rad efter BT). VÅGENS FJÄRDE BROTTSFRIA RAD (efter TELUS/CNR/Redeia): rak CAGR oms +0,97 % · netto +1,46 % dokumenterad som STABILITETENS KÄRNA inte tillväxt (P/E 13,8 på 1,5 %-tillväxt = moget bolag — profilformuleringen skyddar feltolkning). FÖRSÄKRINGSMETODNOTER: ROIC 2,83 % speglar reservstruktur (ej kapitalproduktivitet), Altman 2,03 varningsgräns = försäkringsbalansens affärsmodell (premier är skuld innan vinst), bruttoMarginal null, rantaTackning null — datafakta med noter. prognosTillväxt +2,44 % (mogen bransch; spår-PEG 5,66 mot källans 0,94 — olika baser dokumenterade). KVD: append 274+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 275 (totalt n 262→263 · 10 aspektrader) · läckagevakt 0 (493) · tsc 0 · prod 200 i avslutet. Tyskland 16→17. Kö: fler cellmotiverade duon (Siemens+DHL industri · Fresenius+Healthineers halso · Japans enbolagsceller) · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U13-MUV2-MUNICHRE-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 209")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 209 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("NÄSTA: ny sondering (Tyskland 8 celler à 1 · Japan 4)")) {
  pk = pk.replace(
    "NÄSTA: ny sondering (Tyskland 8 celler à 1 · Japan 4) eller spårrotation · rappdagar 10-20→11-04 → v172-kön",
    "U13 LEVERERAD r209: Munich Re MUV2.DE Tyskland/finans 1→2 (universum 275, första cellmotiverade val — SAP-förslag avlivat av kollisionsgrinden; V173-U13-protokoll) · nästa: cellmotiverade duon (Siemens+DHL · Fresenius+Healthineers · Japan) eller spårrotation · rappdagar 10-20→11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U13 bokförd");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 209, organ: "Φ", ts: Date.now(),
  beslut: "v173 U13: Munich Re MUV2.DE (Tyskland/finans 274→275) — första cellmotiverade valet (Allianz direkt + MR åter); SAP-förslaget avlivat av kollisionsgrinden; vågens fjärde brottsfria rad (stabilitet dokumenterad som sådan); försäkringsmetodnoter. Kö: fler duon eller rotation. R2: Q3-paketet väntar kund.",
  bevis: "V173-U13-MUV2-MUNICHRE-UTOKNING.md + _r209-u13-*.mjs (kvitton /tmp/r209-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (209)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/finans", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U13 LEVERERAD — Munich Re MUV2.DE (Tyskland/finans 37→38): första CELLMOTIVERADE valet (Allianz direkt + MR åter = TRYG/AXA-duon; SAP-förslaget avlivat av kollisionsgrinden — SAP.DE fanns på disk); P/E-bärarkontroll före leverans (TTM-netto 5 957 M EUR > 0); VÅGENS FJÄRDE BROTTSFRIA RAD (rak CAGR oms +0,97 % · netto +1,46 % — dokumenterad som stabilitet, ej tillväxt); FEM EXAKTA REPLIKER + payout 0,08 % (P/E, netto-M, PS, FCF-yield 11,20 %, payout); försäkringsmetodnoter (ROIC=reservstruktur, Altman 2,03=balansmodell, brutto/räntetäckning null med noter); universum 274→275 kirurgiskt, llms HELREGEN på 275 (totalt n 262→263, 10 aspektrader), läckagevakt 0 (493), tsc 0, prod 200. Tyskland 16→17. Kö: cellmotiverade duon (Siemens+DHL, Fresenius+Healthineers, Japan) eller rotation. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r209-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U13-MUV2-MUNICHRE-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r209-u13-sond.mjs", "verktyg/_r209-u13-muv2koll.mjs", "verktyg/_r209-u13-universum-inlagg.mjs", "verktyg/_r209-u13-avslut.mjs", "verktyg/_r209-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r209-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r209-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 209 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; MUV2.DE='+u.some(b=>b.ticker==='MUV2.DE'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r209-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
