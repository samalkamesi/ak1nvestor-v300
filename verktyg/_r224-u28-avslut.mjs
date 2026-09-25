#!/usr/bin/env node
/** _r224-u28-avslut.mjs — v173 U28 (rond 224) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r224-avslut.txt */
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

const RUBRIK = "## ROND 224 [organ:Φ] — v173 U28 LEVERERAD: Diageo DGE.L (Storbritannien/konsument 1→2) — universum 289→290, EARNINGS-VS-CASH-KLIVET (netto kollapsar på nedskrivningar 1 666 M USD medan FCF stiger fyra år rakt, serien dubbellåst), utdelningen halverad FY26 (−51,7 %), rappdag 10-29 INOM v172-fönstret — 2026-09-25";
const RAD =
"v173 U28: Storbritannien/konsument-cellens duo — DIAGEO (LSE-primär, USD-rapportvaluta + GBX-noting enl. BP.L-precedensen; jun-slut FY, rapporterar halvårsvis) bredvid Unilever (dagligvarubredd 400 varumärken): BREDD-STAPLES MOT VARUMÄRKESPREMIUM (Johnnie Walker, Guinness, Don Julio). Kollisionskontroll primär+sekundär (AZN-läxan r221: DGE.L/DGE/DEO-ADR+namn+URL) GRÖN; P/E-bärarkontroll före leverans GRÖN (TTM-netto 1,31 mdr GBP > 0 — bäraren bär ett DEPRIMERAT men positivt netto). EARNINGS-VS-CASH-KLIVET — cellens kärna: netto [4 445 · 3 870 · 2 354 · 1 737] M USD (kollapsen NEDSKRIVNINGSBUREN: kassaflödets rad Asset Writedown & Restructuring 1 666 M USD FY2026 källbelagd; rörelseresultatet −9,6 % från FY23-toppen) medan FCF FYRA ÅR RAKT [2 219 · 2 595 · 2 685 · 3 195] rak CAGR +12,9 % — serien DUBBELT LÅST (OCF−capex exakt fyra fönster + källans marginalrader 10,79/12,80/13,26/16,27 % exakt mot omsättningen). FJORTON REPLIKERINGSLÅS: mcap 0,21 % · PS 2,47 · P/B 3,74 · netto-M 8,85 % · FCF-M 16,28 % · FCF-yield 6,60 % · divYield 2,25 % EXAKT · D/E 1,71 EXAKT · EPS×aktier EXAKT · P/E-familjen 27,97/27,89/27,84 · EV/Earnings 0,08 % · EV/Sales 0,1 % · FCF/aktie; EV-DEKOMPOSITIONEN MED RESIDUAL +1,56 mdr (2,9 % — lease/pension/NCI) dokumenterad ärligt, användningarna låsta. ENGÅNGSKONTROLLEN (Kirin-U3, INVERSA signaturen): EBIT-M 29,30 % mot pretax-M 13,05 % = gap 16,25 p.p. (ränta 1 044 + nedskrivningar 1 666); TTM netto-M 8,84 % deprimerat; fwd P/E 12,97 ⇒ implied EPS +116 % = normaliseringsscenario (konsensus, ALDRIG löfte; DSV-precedensen); resultatCAGR −26,89 % ÄRLIGT LAGRAD (topp FY23 → nedskrivningsår FY26, fem positiva fönster). UTDELNINGEN HALVERAD: DPS [0,911 · 0,986 · 1,035 · 1,035 · 0,500] USD — FY26 −51,68 %, current 0,37 GBP (2,25 % EXAKT); payout tre baser (kontant 106,28 % · EPS 62,7 % · FCF 34,29 % EXAKT). oms [20 555→19 643] rak CAGR −1,50 % (fyra fallande år: Kina/valutor/aperitiv-trenden); ROIC 13,17 % mot WACC 5,27 % gap +7,9 p (varumärkesmoatet); segmentsektionen låses INTE (källan visar bruttointäkter inkl. accis ≈1,43× netto — datafakta); PEG NULL (oklar bas); Altman 2,21 (gränszon) · Piotroski 5 · beta 0,32; nyemissioner 0 · återköp 0 (aktier +0,14 %); netto-skuld −15,39 mdr; rappdag est. 2026-10-29 INOM v172-fönstret (vågens tredje rappdagsleverans: DSV 10-21 · DGE 10-29 · 4503 10-30). KVD: append 289+/0− · läs-tillbaka ×2 · fältgrind 4452.T · två grindfel fångade FÖRE append (TTM-paritet + marginaltolerans) · llms K2 på 290 (konsument-raden n=40, median P/E 20,1; totalt n 277→278 · 10 aspektrader) · läckagevakt 0 (523) · tsc 0 (node-kanalen) · prod 200 i avslutet. Storbritannien 13→14 (konsument-grenen 1→2). Kö: rappdagar → v172 · UK/teknik (ARM+Sage?) sista 1-grenen · Kanada/Spanien · spårrotation. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (väntar kundbeslut). Protokoll: V173-U28-DGE-DIAGEO-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 224")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 224 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U27 LEVERERAD r223")) {
  const fore = "V173-U27-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · 4503 10-30 · Kirin 11-11 · NG 11-05 strax utanför), UK:s 1-grenar (konsument/teknik), Kanada/Spanien, eller spårrotation";
  const efter = "V173-U27-protokoll) · U28 LEVERERAD r224: DGE.L Diageo Storbritannien/konsument 1→2 (universum 290 — earnings-vs-cash-klivet: netto kollapsar på nedskrivningar medan FCF stiger fyra år rakt; utdelningen halverad FY26; rappdag 10-29 INOM v172-fönstret; V173-U28-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (DSV 10-21 · DGE 10-29 · 4503 10-30 · Kirin 11-11), UK/teknik sista 1-grenen, Kanada/Spanien, eller spårrotation";
  if (pk.includes(fore)) {
    pk = pk.replace(fore, efter);
    writeFileSync(PK, pk);
    ut.push("PIPELINE-KO: U28 bokförd");
  } else ut.push("PIPELINE-KO: ankare träffat men nästa-text saknas");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 224, organ: "Φ", ts: Date.now(),
  beslut: "v173 U28: Diageo DGE.L (Storbritannien/konsument 289→290) — duo med Unilever (bredd-staples mot varumärkespremium); earnings-vs-cash-klivet dokumenterat (netto 4 445→1 737 på källbelagda nedskrivningar 1 666 M USD, FCF fyra år rakt +12,9 %/år, serien dubbellåst); utdelningen halverad FY26 (DPS 0,500 USD, −51,7 %); fwd implied EPS +116 % = normaliseringsscenario aldrig löfte; rappdag 10-29 INOM v172-fönstret (tredje rappdagsleveransen). Kö: rappdagar → v172, UK/teknik, Kanada/Spanien, spårrotation. R2: Q3-paketet väntar kund.",
  bevis: "V173-U28-DGE-DIAGEO-UTOKNING.md + _r224-u28-*.mjs (kvitton /tmp/r224-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (224)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/konsument", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U28 LEVERERAD — Diageo plc DGE.L (Storbritannien/konsument 39→40): cellmotiverad duo (Unilever dagligvarubredd + Diageo spritportfölj — BREDD-STAPLES MOT VARUMÄRKESPREMIUM); USD-rapportvaluta + GBX-noting enl. BP.L-precedensen (jun-slut FY); kollisionskontroll primär+sekundär (AZN-läxan) GRÖN; P/E-bärarkontroll (TTM-netto 1,31 mdr GBP > 0 — deprimerat men positivt); EARNINGS-VS-CASH-KLIVET — netto kollapsar [4 445 · 3 870 · 2 354 · 1 737] M USD på källbelagda nedskrivningar (Asset Writedown & Restructuring 1 666 M FY26 i kassaflödet) medan FCF FYRA ÅR RAKT [2 219 → 3 195] +12,9 %/år, serien DUBBELT LÅST (OCF−capex exakt + källans marginalrader exakt); FJORTON LÅS (mcap · PS · P/B · netto-M · FCF-M · FCF-yield · divYield 2,25 % EXAKT · D/E EXAKT · EPS×aktier EXAKT · P/E-familjen 27,97/27,89/27,84 · EV/Earnings 0,08 % · EV/Sales · FCF/aktie); EV-RESIDUAL +1,56 mdr (2,9 % lease/pension/NCI) dokumenterad ärligt — användningarna låsta, dekompositionen ej REN; ENGÅNGSKONTROLLEN (Kirin-U3 inversa): EBIT-M 29,3 % mot pretax-M 13,1 % (gap 16,25 p.p. = ränta + nedskrivningar), TTM netto-M 8,84 % deprimerat, fwd P/E 12,97 ⇒ implied EPS +116 % = normaliseringsscenario (ALDRIG löfte, DSV-precedens); resultatCAGR −26,89 % ÄRLIGT LAGRAD; UTDELNINGEN HALVERAD: DPS [0,911 · 0,986 · 1,035 · 1,035 · 0,500] USD (FY26 −51,7 %), current 0,37 GBP (2,25 % EXAKT), payout tre baser (kontant 106,28 % · EPS 62,7 % · FCF 34,29 % EXAKT); oms-CAGR −1,50 % (fyra fallande år dokumenterat); ROIC 13,2 % mot WACC 5,3 % (gap +7,9 p — moatet lever); segmentlås NEKAS (källans segment = bruttointäkter inkl. accis ≈1,43× netto — datafakta); PEG NULL (oklar bas); Altman 2,21 · Piotroski 5 · beta 0,32; nyemissioner 0 · återköp 0; netto-skuld −15,39 mdr; rappdag est. 2026-10-29 INOM v172-fönstret (tredje rappdagsleveransen: DSV · DGE · 4503); universum 289→290 kirurgiskt, llms HELREGEN på 290 (konsument-raden n=40, median P/E 20,1; totalt n 277→278, 10 aspektrader), läckagevakt 0 (523), tsc 0, prod 200. Storbritannien 13→14. Kö: rappdagar → v172, UK/teknik sista 1-grenen, Kanada/Spanien, spårrotation. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r224-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U28-DGE-DIAGEO-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r224-u28-sond.mjs", "verktyg/_r224-u28-bpkoll.mjs", "verktyg/_r224-u28-hamta.mjs", "verktyg/_r224-u28-universum-inlagg.mjs", "verktyg/_r224-u28-llms-regen.mjs", "verktyg/_r224-u28-lackagevakt.mjs", "verktyg/_r224-u28-tsc.mjs", "verktyg/_r224-u28-avslut.mjs", "verktyg/_r224-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r224-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r224-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 224 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; DGE.L='+u.some(b=>b.ticker==='DGE.L'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r224-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
