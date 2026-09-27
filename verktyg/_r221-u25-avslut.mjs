#!/usr/bin/env node
/** _r221-u25-avslut.mjs — v173 U25 (rond 221) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r221-avslut.txt */
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

const RUBRIK = "## ROND 221 [organ:Φ] — v173 U25 LEVERERAD: DSV DSV.CO (Danmark/industri 1→2) — universum 286→287, AZN-KOLLISIONEN tagen av grunden först (AstraZeneca = AZN.ST/Sverige sedan 09-03 — UK/hälsa-duon avbröts), Maersk+DSV = ägare-mot-hyrare (freenet-klassen), tio prisneutrala lås efter kursbasfyndet — 2026-09-25";
const RAD =
"v173 U25: rondens första kandidat (Storbritannien/hälsa: GSK+AZN) AVBRÖTS av kollisionsgrinden — AstraZeneca levererad 2026-09-03 som AZN.ST (land=Sverige, Stockholm-noteringen); läxa bokförd: sök både primär- och sekundärnoteringar. ERSÄTTARE med vågens renaste modellkontrast sedan freenet: Danmark/industri — MAERSK (tillgångstungt integrerat containerrederi, äger flottan) + DSV (tillgångslös fraktförmedling, hyr kapaciteten; post-Schenker världens största forwarder) = ÄGARE-MOT-HYRARE. P/E-bärarkontroll före leverans GRÖN (TTM-netto 6 869 M DKK > 0) + kollisionskontroll exakt-match. KURSBASFYNDET: källans mcap-rad (282,23) och P/E-rad (39,25) bär äldre prisbaser än citatpanelens 1 235 DKK (mcap-raden ≈1 182-aktie, P/E-raden ≈1 134) — fälten = källrader (E.ON/freenet-precedenserna), replikerna 42,8/41,1 noterade, och leveransen bärs av TIO PRISNEUTRALA LÅS: PS 0,97 · P/B 2,24 · EV-DEKOMPOSITION 0,1 % REN (282,23+95,53−10,06 = 367,70 mot 368,07 — Schenker-lånet i skuldposten) · netto-M 2,36 % · FCF-M 3,36 % · FCF-yield 3,46 % DUBBELT · D/E 0,76 · EPS×aktier 0,4 % · payout 24,2 % · FCF-serien. FCF-serien intern låst (OCF−capex exakt fem fönster — HEI/Astellas-klassen); en enhetsbugg (TTM mdr/M) fångades av grindsystemet FÖRE append — vågens femte. INTEGRATIONSPROFILEN (datafakta): netto FALLANDE VARJE ÅR [17 568 · 12 315 · 10 109 · 8 095] (fraktrecension+Schenker-kostnader; rak CAGR −22,8 %) mot förvärvsdriven oms +48 % FY25 (basblandningen dokumenterad); fwd P/E 17,39 ⇒ implied EPS +126 % = normaliseringsscenario (konsensus +24,85 %/3 år — aldrig löfte); ROIC 7,17 % < WACC 7,82 % = integrationsåret; Altman 3,0 · Piotroski 8 · beta 0,96; utdelning 7,00 DKK (0,59 %) FCF-payout 17,1 %; nyemission 1 (aktieantal +3,86 %); RAPPDAG 2026-10-21 INOM v172-FÖNSTRET — könotis. KVD: append 286+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 287 (industri-raden n=27, median P/E 27,8; totalt n 274→275 · 10 aspektrader) · läckagevakt 0 (517) · tsc 0 · prod 200 i avslutet. Danmark 10→11 (industri-grenen 1→2). Kö: rappdagar 10-20→11-04 → v172 (DSV 10-21 · 4503 10-30 · Kirin 11-11) · UK:s fyra kvarvarande 1-grenar · Kanada/Spanien · spårrotation. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U25-DSV-INDUSTRI-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 221")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 221 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U24 LEVERERAD r220")) {
  const fore = "V173-U24-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (4503:s rappdag 10-30 bokförd), nya länder/celler eller spårrotation";
  const efter = "V173-U24-protokoll) · U25 LEVERERAD r221: DSV.CO Danmark/industri 1→2 (universum 287 — AZN-kollisionen tagen av grunden: GSK+AZN-duon avbröts, AstraZeneca = AZN.ST/Sverige sedan 09-03; Maersk+DSV = ägare-mot-hyrare; tio prisneutrala lås efter kursbasfyndet; V173-U25-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · 4503 10-30 · Kirin 11-11), UK:s kvarvarande 1-grenar, Kanada/Spanien, eller spårrotation";
  if (pk.includes(fore)) {
    pk = pk.replace(fore, efter);
    writeFileSync(PK, pk);
    ut.push("PIPELINE-KO: U25 bokförd");
  } else ut.push("PIPELINE-KO: ankare träffat men nästa-text saknas");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 221, organ: "Φ", ts: Date.now(),
  beslut: "v173 U25: DSV DSV.CO (Danmark/industri 286→287) — ägare-mot-hyrare-duo med Maersk; AZN-kollisionen tagen av grunden (AstraZeneca = AZN.ST/Sverige sedan 09-03 — UK/hälsa-duon avbröts, läxa om sekundärnoteringar); tio prisneutrala lås efter kursbasfyndet (källans mcap/P/E-rader bär äldre prisbaser); integrationsprofilen dokumenterad (netto fallande varje år, förvärvsdriven oms-bas); rappdag 10-21 i v172-fönstret. Kö: rappdagar → v172, UK:s 1-grenar, Kanada/Spanien, spårrotation. R2: Q3-paketet väntar kund.",
  bevis: "V173-U25-DSV-INDUSTRI-UTOKNING.md + _r221-u25-*.mjs (kvitton /tmp/r221-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (221)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/industri", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U25 LEVERERAD — DSV A/S DSV.CO (Danmark/industri 26→27): AZN-KOLLISIONEN tagen av grunden först — rondens UK/hälsa-duo (GSK+AZN) avbröts då AstraZeneca levererad 2026-09-03 som AZN.ST/Sverige (läxa: sök sekundärnoteringar); ersättare med vågens renaste modellkontrast sedan freenet: Maersk tillgångstungt containerrederi + DSV tillgångslös fraktförmedling (post-Schenker världens största forwarder) = ÄGARE-MOT-HYRARE; P/E-bärarkontroll före leverans (TTM-netto 6 869 M DKK > 0); KURSBASFYNDET — källans mcap/P/E-rader bär äldre prisbaser (≈1 182/1 134 mot citat 1 235): fälten = källrader, TIO PRISNEUTRALA LÅS bär leveransen (PS 0,97 · P/B 2,24 · EV 0,1 % REN med Schenker-lånet · netto-M 2,36 % · FCF-M 3,36 % · FCF-yield 3,46 % dubbelt · D/E 0,76 · EPS×aktier · payout · FCF-serien); FCF-serien intern låst (OCF−capex exakt fem fönster); en enhetsbugg fångad FÖRE append (vågens femte); INTEGRATIONSPROFILEN: netto fallande varje år 17 568→8 095 (rak CAGR −22,8 %) på förvärvsdriven oms +48 % (basblandning dokumenterad); fwd implied EPS +126 % = normaliseringsscenario (aldrig löfte); ROIC 7,17 % < WACC 7,82 % = integrationsåret; Altman 3,0 · Piotroski 8; nyemission 1; rappdag 2026-10-21 i v172-fönstret; universum 286→287 kirurgiskt, llms HELREGEN på 287 (industri-raden n=27, median P/E 27,8; totalt n 274→275, 10 aspektrader), läckagevakt 0 (517), tsc 0, prod 200. Danmark 10→11. Kö: rappdagar → v172 (DSV 10-21 · 4503 10-30 · Kirin 11-11), UK:s 1-grenar, Kanada/Spanien, spårrotation. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r221-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U25-DSV-INDUSTRI-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r221-u25-sond.mjs", "verktyg/_r221-u25-sond2.mjs", "verktyg/_r221-u25-universum-inlagg.mjs", "verktyg/_r221-u25-llms-regen.mjs", "verktyg/_r221-u25-lackagevakt.mjs", "verktyg/_r221-u25-avslut.mjs", "verktyg/_r221-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r221-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r221-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 221 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; DSV.CO='+u.some(b=>b.ticker==='DSV.CO'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r221-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
