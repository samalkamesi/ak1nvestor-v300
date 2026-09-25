#!/usr/bin/env node
/** _r217-u21-avslut.mjs — v173 U21 (rond 217) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r217-avslut.txt */
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

const RUBRIK = "## ROND 217 [organ:Φ] — v173 U21 LEVERERAD: freenet FNT.DE (Tyskland/kommunikation 1→2) — universum 282→283, Shin-Etsu-precedensen andra gången (tre lås mot källans P/E-rad), vågens nionde brottsfria rad — 2026-09-25";
const RAD =
"v173 U21: Tyskland/kommunikation-cellens duo — FREENET (ETR-primär EUR, MVNO/mobil detalj — kassageneratorn utan nätägande) bredvid Deutsche Telekom (integrerad jätte: nätägare mot hyrare = cellens kontrast). P/E-bärarkontroll före leverans GRÖN (TTM-netto 610 M EUR > 0) + kollisionskontroll exakt-match. P/E-FALLET (SHIN-ETSU-PRECEDENSEN andra gången i vågen): källans P/E-rad 11,40 MOTSAGD av källans egen EPS-rad 4,66 (11,40 × 4,66 = 53,1 ≠ pris 23,92) ⇒ fältet bär aktiebas-repliken 5,13 LÅST av TRE oberoende identiteter (EPS × aktier = netto ✓ · FCF-yield EXAKT 17,87/17,86 % · mcap 0,05 %); PS/payout-rader samma fönsterdokumentation; prognosTillväxt NULL (basblandning vägras — källans fwd enbart referens). VÅGENS NIONDE BROTTSFRIA RAD: netto [447 · 491 · 549 · 580] stigande varje år, stabil FCF ~430 (rak CAGR oms +2,06 % · netto +9,07 % — MVNO-marginalutflytten). MVNO-METODNOT: ROIC≈WACC är modellens struktur (hyr nätet); kassageneratorprofilen P/FCF 5,6 · FCF-M 22 % · DIREKTAVKASTNING 7,73 % dokumenterad; Altman 2,1 datafakta; Piotroski 7. SKRIPTETS EGENHETER: två enhetsbuggar (mcap M/mdr + fcfY-formel) fångades av grindsystemet FÖRE append och rättades — maskin före hand igen. KVD: append 282+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 283 (KOMMUNIKATIONSMEDIANEN P/E 16,9→16,2 — freenets låga multiplar syns i cellen, datasetet fångar båda riktningarna; totalt n 270→271 · 10 aspektrader) · läckagevakt 0 (509) · tsc 0 · prod 200 i avslutet. Tyskland 20→21. Kö: Tysklands fastighet/material-grenar · omprövningar (Astellas+Kirin) · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U21-FNT-FREENET-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 217")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 217 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U20 LEVERERAD r216")) {
  pk = pk.replace(
    "nästa: Tysklands kvarvarande 1-grenar (kommunikation/fastighet/material) eller spårrotation · omprövningar: Astellas + Kirin · rappdagar 10-20→11-04 → v172-kön",
    "U21 LEVERERAD r217: FNT.DE freenet Tyskland/kommunikation 1→2 (universum 283, Shin-Etsu-precedensen #2 med tre lås; V173-U21-protokoll) · nästa: Tysklands fastighet/material-grenar eller spårrotation · omprövningar: Astellas + Kirin · rappdagar 10-20→11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U21 bokförd");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 217, organ: "Φ", ts: Date.now(),
  beslut: "v173 U21: freenet FNT.DE (Tyskland/kommunikation 282→283) — MVNO-duo med Telekom; Shin-Etsu-precedensen #2 (källans P/E-rad motsagd av egen EPS — aktiebas 5,13 med tre lås; prognosTillväxt NULL); vågens nionde brottsfria rad; direktavkastning 7,73 % dokumenterad som modellfil; kommunikationsmedianen 16,9→16,2. Kö: Tyskland fastighet/material, omprövningar, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U21-FNT-FREENET-UTOKNING.md + _r217-u21-*.mjs (kvitton /tmp/r217-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (217)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/kommunikation", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U21 LEVERERAD — freenet AG FNT.DE (Tyskland/kommunikation 28→29): cellmotiverad duo (Deutsche Telekom nätjätte + freenet MVNO — nätägare mot hyrare); P/E-bärarkontroll före leverans (TTM-netto 610 M EUR > 0); SHIN-ETSU-PRECEDENSEN #2: källans P/E-rad 11,40 motsagd av källans egen EPS-rad — fältet bär aktiebas-repliken 5,13 LÅST av tre identiteter (EPS×aktier=netto · FCF-yield EXAKT 17,87 % · mcap 0,05 %); prognosTillväxt NULL (basblandning vägras); VÅGENS NIONDE BROTTSFRIA RAD (netto stigande varje år 447→580; rak CAGR oms +2,06 % · netto +9,07 %); MVNO-metodnot (ROIC≈WACC = modellstruktur); kassageneratorfilen dokumenterad (P/FCF 5,6, FCF-M 22 %, direktavkastning 7,73 %); två skript-enhetsbuggar fångade av grindsystemet FÖRE append; universum 282→283 kirurgiskt, llms HELREGEN på 283 (kommunikationsmedianen P/E 16,9→16,2 — freenet syns i cellen; totalt n 270→271, 10 aspektrader), läckagevakt 0 (509), tsc 0, prod 200. Tyskland 20→21. Kö: Tyskland fastighet/material, omprövningar, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r217-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U21-FNT-FREENET-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r217-u21-sond.mjs", "verktyg/_r217-u21-universum-inlagg.mjs", "verktyg/_r217-u21-avslut.mjs", "verktyg/_r217-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r217-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r217-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 217 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; FNT.DE='+u.some(b=>b.ticker==='FNT.DE'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r217-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
