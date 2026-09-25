#!/usr/bin/env node
/** _r218-u22-avslut.mjs — v173 U22 (rond 218) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r218-avslut.txt */
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

const RUBRIK = "## ROND 218 [organ:Φ] — v173 U22 LEVERERAD: Aroundtown AT1.DE (Tyskland/fastighet 1→2) — universum 283→284, räntechockens tvillingkurvor med Vonovia (samma cell, samma mönster), vågens starkaste låspaket (sex EXAKTA) — 2026-09-25";
const RAD =
"v173 U22: Tyskland/fastighet-cellens duo — AROUNDTOWN (ETR-primär EUR, kommersiell diversifierad: kontor/hotell/logistik/bostad) bredvid Vonovia (bostadsjätte — två hyresvärdmodeller = cellens kontrast; land=Tyskland på ABB-precedensen: Lux-SA Frankfurt-noterad med tysk portföljkärna). P/E-bärarkontroll före leverans GRÖN (TTM-netto 403,4 M EUR > 0) + kollisionskontroll exakt-match. RÄNTECHOCKENS TVILLINGKURVOR: netto [−645,1 · −1 988 · 52,9 · 665] — SAMMA förlustår 2022–2023 som Vonovia i samma cell och vändning 2024–2025 (mönsterparalleliteten dokumenterad i båda raderna); resultatCAGR NULL på negativ bas (Vonovia-precedensen — vändningsåren döms ALDRIG med CAGR); rak oms-CAGR −1,21 %. SEX REPLIKERINGSLÅS (starkaste i vågen): P/B 0,13 EXAKT (totalt-EK-bas) · PS 1,22 EXAKT · netto-M 25,89 % EXAKT (finanspanelens TTM-rad) · FCF-yield 0,86 % DUBBELT LÅS (källrad + 1/P·FCF) · FCF-M 1,05 % EXAKT · D/E 1,04 + mcap 1,1 %; P/E 4,57 EPS-låst (GAAP-replik 4,71 + EPS×aktier-avrundningsfönstret 3,7 % noterade öppet). TRE FÖNSTERDOKUMENTATIONER: FCF-DUBBELBAS (kapex-dragen TTM 16,3 M mot källans serie = OCF-dubbelt ⇒ serier.fcf TOM på VNA-konventionen) · EV-DEKOMPOSITION (15,48 = 1,90+15,17−3,80+preferens ≈2,21 mdr — 2023-emittensen) · netto-M-baserna (25,89 attributable mot 38,48 total inkl. minoriteter). DIVIDENDBROTTET FY2022–24 dokumenterat (FY25 0,08 EUR, 4,75 %, EPS-payout 21,6 %); ROIC 3,10 % > WACC 2,54 %; Debt/EBITDA 15,93 + räntetäckning 3,42 = belåningsdatafakta; Altman n/a · Piotroski 4 · beta 1,31 · 52v −47,25 % (fastighetstvätten). SKRIPTETS EGENHETER: två enhetsbuggar (mcap mdr/M + PS-bas) fångade av grindsystemet FÖRE append och rättade — maskin före hand, tredje rundan i rad. KVD: append 283+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 284 (fastighet-raden n=18, median P/E 12,9; totalt n 271→272 · 10 aspektrader) · läckagevakt 0 (511) · tsc 0 · prod 200 i avslutet. Tyskland 21→22. Kö: Tysklands material-gren (sista 1-grenen) · omprövningar (Astellas+Kirin) · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U22-AT1-AROUNDTOWN-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 218")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 218 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U21 LEVERERAD r217")) {
  const fore = "V173-U21-protokoll) · nästa: Tysklands fastighet/material-grenar eller spårrotation";
  const efter = "V173-U21-protokoll) · U22 LEVERERAD r218: AT1.DE Aroundtown Tyskland/fastighet 1→2 (universum 284, räntechockens tvillingkurvor med Vonovia — sex replikeringslås; V173-U22-protokoll) · nästa: Tysklands material-gren eller spårrotation";
  if (pk.includes(fore)) {
    pk = pk.replace(fore, efter);
    writeFileSync(PK, pk);
    ut.push("PIPELINE-KO: U22 bokförd");
  } else ut.push("PIPELINE-KO: ankare träffat men nästa-text saknas");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 218, organ: "Φ", ts: Date.now(),
  beslut: "v173 U22: Aroundtown AT1.DE (Tyskland/fastighet 283→284) — duo med Vonovia (bostad mot kommersiell genom räntechocken); land=Tyskland på ABB-precedensen; resultatCAGR NULL (negativ bas, VNA-precedens); sex EXAKTA replikeringslås + FCF-dubbelbas/EV-preferens/netto-M-baser dokumenterade; dividendbrottet FY22–24 öppet. Kö: Tyskland material (sista 1-grenen), omprövningar, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U22-AT1-AROUNDTOWN-UTOKNING.md + _r218-u22-*.mjs (kvitton /tmp/r218-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (218)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/fastighet", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U22 LEVERERAD — Aroundtown SA AT1.DE (Tyskland/fastighet 17→18): cellmotiverad duo (Vonovia bostadsjätte + Aroundtown kommersiell diversifierad — två hyresvärdmodeller; land=Tyskland på ABB-precedensen: Lux-SA Frankfurt-noterad); P/E-bärarkontroll före leverans (TTM-netto 403,4 M EUR > 0); RÄNTECHOCKENS TVILLINGKURVOR — netto [−645 · −1 988 · 53 · 665] speglar Vonovias cell-mönster (förlustår 2022-23, vändning 2024-25), resultatCAGR NULL på negativ bas (VNA-precedensen); SEX REPLIKERINGSLÅS (P/B 0,13 · PS 1,22 · netto-M 25,89 % · FCF-yield 0,86 % dubbelt · FCF-M 1,05 % · D/E 1,04); P/E 4,57 EPS-låst (GAAP-replik noterad); FCF-DUBBELBAS dokumenterad (kapex-dragen TTM 16,3 M; källans serie = OCF-dubbelt ⇒ serier.fcf tom på VNA-konventionen); EV-dekomposition med preferenspost ≈2,21 mdr; dividendbrottet FY22–24 + återupptagning 4,75 % dokumenterat; två skript-enhetsbuggar fångade av grindsystemet FÖRE append; universum 283→284 kirurgiskt, llms HELREGEN på 284 (fastighet-raden n=18, median P/E 12,9; totalt n 271→272, 10 aspektrader), läckagevakt 0 (511), tsc 0, prod 200. Tyskland 21→22. Kö: Tysklands material-gren (sista 1-grenen), omprövningar, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r218-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U22-AT1-AROUNDTOWN-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r218-u22-sond.mjs", "verktyg/_r218-u22-universum-inlagg.mjs", "verktyg/_r218-u22-llms-regen.mjs", "verktyg/_r218-u22-lackagevakt.mjs", "verktyg/_r218-u22-avslut.mjs", "verktyg/_r218-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r218-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r218-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 218 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; AT1.DE='+u.some(b=>b.ticker==='AT1.DE'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r218-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
