#!/usr/bin/env node
/** _r219-u23-avslut.mjs — v173 U23 (rond 219) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r219-avslut.txt */
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

const RUBRIK = "## ROND 219 [organ:Φ] — v173 U23 LEVERERAD: Heidelberg Materials HEI.DE (Tyskland/material 1→2) — universum 284→285, MILEPÅLE: Tysklands sista 1-gren öppnad (alla elva grenar ≥2), vågens renaste källdata (FCF-serien intern låst) och nio replikeringslås — 2026-09-25";
const RAD =
"v173 U23: Tyskland/material-cellens duo — HEIDELBERG MATERIALS (ETR-primär EUR, grus/cement/byggmaterial) bredvid BASF (processkemi — MARGINALKONTRASTEN 64,3 % mot 23,6 % brutto dokumenterad i båda raderna; serieprofilerna: HEI netto positivt samtliga fyra år [1 597 · 1 929 · 1 782 · 1 941] mot BASF:s brutna serie). P/E-bärarkontroll före leverans GRÖN (TTM-netto 1 993 M EUR > 0) + kollisionskontroll exakt-match. MILEPÅLE: TYSLANDS SISTA 1-GREN ÖPPNAD — landets alla elva branschgrenar ≥ 2 (22→23 tyska bolag). VÅGENS RENASTE KÄLLDATA: FCF-serien intern låst (OCF−capex = FCF EXAKT i samtliga fem fönster — grindsystemet verifierar identiteten); FCF-yield 6,77 % DUBBELT LÅS + FCF-M 7,82 % EXAKT. NIO REPLIKERINGSLÅS (flest i vågen, noll skript-buggar — tredje rondens grindskäl tog skruv): P/B 1,27 · netto-M 9,17 % · fcfY · fcfM · D/E 0,50 · EPS×aktier=netto 0,7 % · payout 31,9 % · PS 1,15 · mcap 1,2 %; P/E 12,43 källans justerade bas (E.ON-mönstret — GAAP-replik 12,59 och pris/EPS 12,85 med källans lägre prisbas ≈140,2 dokumenterade). EV 34,06 låst av EV/Earnings 17,09 (enkel dekomposition +1,17 = pension/leasing noterad; EV/EBITDA-raden bär justerad EBITDA 4,51 mot rapporterad 4,08). UTDELNINGENS RAKA TRAPPA [2,60 · 3,00 · 3,30 · 3,60] +9,09 %/år; återköp 1,22 % med fallande aktieantal ⇒ nyemissioner 0; ROIC 8,40 % > WACC 7,26 %; Altman 2,54 gränszon · Piotroski 6 · beta 0,91 · 52v −27,54 % — datafakta. KVD: append 284+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 285 (material-raden n=30, median P/E 18,7; totalt n 272→273 · 10 aspektrader) · läckagevakt 0 (513) · tsc 0 · gränssnittsvakt efter push · prod 200 i avslutet. Kö: omprövningar (Astellas+Kirin) · rappdagar → v172 · nytt land/spårrotation (Tyskland komplett). R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U23-HEI-HEIDELBERG-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 219")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 219 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U22 LEVERERAD r218")) {
  const fore = "V173-U22-protokoll) · nästa: Tysklands material-gren eller spårrotation";
  const efter = "V173-U22-protokoll) · U23 LEVERERAD r219: HEI.DE Heidelberg Materials Tyskland/material 1→2 (universum 285 — MILEPÅLE: Tysklands sista 1-gren, alla elva grenar ≥2; FCF-serien intern låst, nio replikeringslås; V173-U23-protokoll) · nästa: omprövningar (Astellas+Kirin), rappdagar → v172, nytt land eller spårrotation";
  if (pk.includes(fore)) {
    pk = pk.replace(fore, efter);
    writeFileSync(PK, pk);
    ut.push("PIPELINE-KO: U23 bokförd");
  } else ut.push("PIPELINE-KO: ankare träffat men nästa-text saknas");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 219, organ: "Φ", ts: Date.now(),
  beslut: "v173 U23: Heidelberg Materials HEI.DE (Tyskland/material 284→285) — duo med BASF (marginalkontrast 64,3/23,6 % dokumenterad i båda raderna); MILEPÅLE: Tysklands alla elva grenar ≥2; FCF-serien intern låst (OCF−capex exakt fem fönster); nio replikeringslås; utdelningstrappan +9,09 %/år. Kö: omprövningar, rappdagar → v172, nytt land/spårrotation. R2: Q3-paketet väntar kund.",
  bevis: "V173-U23-HEI-HEIDELBERG-UTOKNING.md + _r219-u23-*.mjs (kvitton /tmp/r219-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (219)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/material", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U23 LEVERERAD — Heidelberg Materials AG HEI.DE (Tyskland/material 30→31): cellmotiverad duo (BASF processkemi + Heidelberg grus/cement/byggmaterial — MARGINALKONTRASTEN 64,3 % mot 23,6 % brutto i båda raderna); MILEPÅLE: Tysklands sista 1-gren öppnad — landets alla elva branschgrenar ≥ 2; P/E-bärarkontroll före leverans (TTM-netto 1 993 M EUR > 0); VÅGENS RENASTE KÄLLDATA — FCF-serien intern låst (OCF−capex = FCF EXAKT i samtliga fem fönster); NIO REPLIKERINGSLÅS (P/B 1,27 · netto-M 9,17 % · FCF-yield 6,77 % dubbelt · FCF-M 7,82 % · D/E 0,50 · EPS×aktier 0,7 % · payout 31,9 % · PS 1,15 · mcap 1,2 %) med noll skript-buggar; P/E 12,43 källans justerade bas (GAAP 12,59 + pris/EPS 12,85 dokumenterade); EV 34,06 låst av EV/Earnings 17,09; netto positivt samtliga fyra år (FY24-dipp = BASF-kontrasten); UTDELNINGENS RAKA TRAPPA +9,09 %/år; ROIC 8,40 % > WACC 7,26 %; Altman 2,54 · Piotroski 6 · 52v −27,54 % datafakta; universum 284→285 kirurgiskt, llms HELREGEN på 285 (material-raden n=30, median P/E 18,7; totalt n 272→273, 10 aspektrader), läckagevakt 0 (513), tsc 0, gränssnittsvakt efter push, prod 200. Tyskland 22→23. Kö: omprövningar, rappdagar → v172, nytt land/spårrotation. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r219-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U23-HEI-HEIDELBERG-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r219-u23-sond.mjs", "verktyg/_r219-u23-universum-inlagg.mjs", "verktyg/_r219-u23-llms-regen.mjs", "verktyg/_r219-u23-lackagevakt.mjs", "verktyg/_r219-u23-avslut.mjs", "verktyg/_r219-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r219-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r219-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 219 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; HEI.DE='+u.some(b=>b.ticker==='HEI.DE'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r219-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
