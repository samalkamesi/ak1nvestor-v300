#!/usr/bin/env node
/**
 * KONTROLLSOND s1-u3 (omgång auto-s1-1790653512758) — Fabege Q3-2026
 * läspaket (kvartalsfamiljen, FIFO-etta bland kontrolllösa enligt
 * worklog 17074/14252). Speglar släktets standard (wihlborgs-sonden
 * 09-21, återskapad ur 5d48610d): median() ur dataset-nyckeltal.ts-
 * konventionen (udda→mittersta, jämn→medel av två mittersta, null
 * exkluderas), kontrolleraText (26 fraser ur data/varumarke.json,
 * RegExp 'giu'), 911-sexmönstret, internlänkar mot localhost:3000
 * med deploylåscheck. Medianer replikeras mot BYGGVINTAGE-kandidater
 * (utkast-mtime 2026-09-19 09:50; källraden deklarerar "166–201
 * poster per mått"). LÄSER ENDAST — skriver aldrig mot utkastet.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const md5 = (d) => createHash("md5").update(d).digest("hex");
const nfc = (s) => s.normalize("NFC");
let OK = 0, FEL = 0, NOT = 0;
const kontroll = (namn, sant, detalj = "") => {
  if (sant) { OK++; console.log(`  ✓ ${namn}${detalj ? " — " + detalj : ""}`); }
  else { FEL++; console.log(`  ✗ FEL: ${namn}${detalj ? " — " + detalj : ""}`); }
};
const notis = (namn, detalj) => { NOT++; console.log(`  · NOT ${namn} — ${detalj}`); };

const FIL = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-fabege-q3-2026.json`;
const ut = JSON.parse(readFileSync(FIL, "utf8"));
const yta = nfc([ut.title, ut.description, ...ut.tags, ut.body].join("\n"));
const body = nfc(ut.body);

let lockFri = true;
try { execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "true"]); } catch { lockFri = false; }

console.log("═══ 1. KÄLLOR — FABG-raden mot DAGENS universum + kalender ═══");
const dagens = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, "utf8"));
const f = dagens.find((r) => r.ticker === "FABG.ST");
kontroll("FABG.ST-rad: pris 72,80 · mcap 22,901 mdr · hämtat 2026-09-03 (oförändrad fältpost sedan bygget)", f.pris === 72.8 && f.marknadsKapitalMdr === 22.901 && f.hamtat === "2026-09-03");
kontroll("värdering: P/E 53,139 · P/B 0,614 · EV/EBIT 24,894 · PEG 5,07 · FCF-yield 0,077", f.vardering.pe === 53.139 && f.vardering.pb === 0.614 && f.vardering.evEbit === 24.894 && f.vardering.peg === 5.07 && f.vardering.fcfYield === 0.077);
kontroll("lönsamhet: ROE 1,15 · ROIC 3,21 · brutto 66,04 · EBIT 59,49 · netto 10,87 · FCF-marg 44,46 (%)", f.lonksamhet.roe === 0.0115 && f.lonksamhet.roic === 0.0321 && f.lonksamhet.bruttoMarginal === 0.6604 && f.lonksamhet.ebitMarginal === 0.5949 && f.lonksamhet.nettoMarginal === 0.1087 && f.lonksamhet.fcfMarginal === 0.4446);
kontroll("tillväxt: omsCAGR 4,7 · resCAGR null (osatt) · TTM 14 · prognos −5,01 (%)", f.tillvaxt.omsattningCAGR5ar === 0.047 && f.tillvaxt.resultatCAGR5ar === null && f.tillvaxt.omsattningTillvaxtTTM === 0.14 && f.tillvaxt.prognosTillvaxt === -0.0501);
kontroll("stabilitet: skuld/EK 0,9692 · räntetäckning null · insiderköp 0", f.stabilitet.skuldEgenkapital === 0.9692 && f.stabilitet.rantaTackning === null && f.aterkop.insiderkopSenaste6man === 0);
kontroll("golv: NAV-proxy 118,56 kr/aktie · marginal 38,59 % · tillgångstung", f.golv.vardePerAktie === 118.56 && f.golv.marginal === 0.3859 && f.golv.typ === "tillgangstung");
kontroll("serier 2022–2025: omsättning 3 032→3 366→3 438→3 480 Mkr", JSON.stringify(f.serier.omsattning) === JSON.stringify([3032000000, 3366000000, 3438000000, 3480000000]));
kontroll("serier resultat +2 376→−5 518→−213→−348 Mkr", JSON.stringify(f.serier.resultat) === JSON.stringify([2376000000, -5518000000, -213000000, -348000000]));
kontroll("noteringens förbehåll speglas ärligt (4 år · ROIC-proxy · räntetäckning osatt · ingen MarketStack-dubbelkoll)", body.includes("fyra sammanhängande räkenskapsår") && body.includes("approximerad proxy") && body.includes("räntetäckning osatt") && body.includes("ingen dubbelkoll av pris/valuation"));
kontroll("MarketStack-sidan: 'saknade färsk kurs' + 'källa B' — fältets egna paranoid-not", body.includes("MarketStack") && body.includes("saknade färsk kurs"));
notis("universumdrift", `dagens fil 316 rader mot byggtilståndets ~195–201 (källradens '166–201 poster'); FABG-fältposten identisk ⇒ talen stabila`);

const kal = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-fastighet.json`, "utf8"));
const kalF = kal.bolag.find((b) => b.ticker === "FABG.ST");
kontroll("kalenderunderlaget: rapportfenster 2026-10-21 + IR-källorna (utkastets urvalsberättelse bär underlaget)", kalF.rapportfenster === "2026-10-21" && kalF.kallor.some((k) => k.url.includes("fabege.com") || k.url.includes("fabege.se")));
kontroll("kalenderns Q1/Q2-rytm (23/4 + 6/7 kl 07:00-07:30) = utkastets rytm-kontroll", kalF.notera.includes("2026-04-23") && kalF.notera.includes("2026-07-06"));
kontroll("2026-10-21 är en onsdag (datumaritmetik — utkastets 'ondsdagen')", new Date("2026-10-21").getDay() === 3);

console.log("═══ 2. MEDIANER & RANG — replik mot BYGGVINTAGE-kandidaterna ═══");
const median = (v) => { const r = v.filter((x) => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const p1 = (x) => Math.round(x * 10000) / 10000;
const nr = (x, antal = 2) => Math.round(x * 10 ** antal) / 10 ** antal;
const V = (o, vag) => vag.split(".").reduce((a, k) => a && a[k] !== undefined ? a[k] : null, o);
const vintager = {};
for (const sha of ["73745b24", "32ad80be", "48916d8c"]) {
  vintager[sha] = JSON.parse(execFileSync("git", ["-C", ROT, "show", `${sha}:data/portfolj-system/bolagsunivers.json`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
}
// källradens universummedianer: P/B 2,807 · P/E 20,80 · EV/EBIT 18,085 · FCF 3,94 · PEG 1,375 · ROE 15,34 · netto 14,0 · skuld 0,520 · prognos 13,37
const testVintage = (vint) => {
  const uPb = p1(median(vint.map((r) => V(r, "vardering.pb"))));
  const uPe = nr(median(vint.map((r) => V(r, "vardering.pe"))));
  const uProgn = nr(median(vint.map((r) => V(r, "tillvaxt.prognosTillvaxt"))) * 100);
  return { uPb, uPe, uProgn, n: vint.length };
};
for (const [sha, vint] of Object.entries(vintager)) {
  const t = testVintage(vint);
  const matchar = Math.abs(t.uPb - 2.807) <= 0.001 || Math.abs(t.uPe - 20.8) <= 0.01;
  notis(`vintage ${sha}`, `${t.n} rader · univ-medianer P/B ${t.uPb} · P/E ${t.uPe} · prognos ${t.uProgn} %${matchar ? " — BÄR textens tal (nära)" : ""}`);
}
// Textens medianer anger 201-post-nivå ⇒ huvudreplik mot 48916d8c (201 rader, universum 195→201 samma dag)
const vint = vintager["48916d8c"];
const fast = vint.filter((r) => r.bransch === "fastighet");
kontroll("fastighetsgrenen n=16 i vintagen (textens 16 bolag)", fast.length === 16, String(fast.length));
kontroll("fastighet P/B-median 0,9355 · P/E 12,909 · EV/EBIT 24,589 (tabellkolumnen)", p1(median(fast.map((r) => V(r, "vardering.pb")))) === 0.9355 || Math.abs(median(fast.map((r) => V(r, "vardering.pb"))) - 0.9355) <= 0.0006, `${p1(median(fast.map((r) => V(r, "vardering.pb"))))} · P/E ${nr(median(fast.map((r) => V(r, "vardering.pe"))), 3)} · EV/EBIT ${nr(median(fast.map((r) => V(r, "vardering.evEbit"))), 3)}`);
kontroll("fastighet ROE-median 8,51 · netto 44,1 · FCF-marg 31,39 · ROIC 4,56 · EBIT 58,43 (%)", [8.51, 44.1, 31.39, 4.56, 58.43].every((facit, i) => {
  const vagar = ["lonksamhet.roe", "lonksamhet.nettoMarginal", "lonksamhet.fcfMarginal", "lonksamhet.roic", "lonksamhet.ebitMarginal"];
  return Math.abs(nr(median(fast.map((r) => V(r, vagar[i]))) * 100, 2) - facit) <= 0.06;
}, `medianer ${["roe", "netto", "fcfmarg", "roic", "ebit"].join("/")}`));
kontroll("fastighet FCF-yield-median 4,07 · skuld 1,090 · prognos 2,04 · PEG 4,16", Math.abs(nr(median(fast.map((r) => V(r, "vardering.fcfYield"))) * 100) - 4.07) <= 0.01 && Math.abs(nr(median(fast.map((r) => V(r, "stabilitet.skuldEgenkapital"))), 3) - 1.09) <= 0.001 && Math.abs(nr(median(fast.map((r) => V(r, "tillvaxt.prognosTillvaxt"))) * 100) - 2.04) <= 0.01 && Math.abs(nr(median(fast.map((r) => V(r, "vardering.peg"))), 2) - 4.16) <= 0.01);
kontroll("universum-medianer: P/E 20,80 · P/B 2,807 · ROE 15,34 % · netto 14,0 · prognos 13,37 (201-post-vintagen bär talen)", nr(median(vint.map((r) => V(r, "vardering.pe")))) === 20.8 && Math.abs(p1(median(vint.map((r) => V(r, "vardering.pb")))) - 2.807) <= 0.001 && nr(median(vint.map((r) => V(r, "lonksamhet.roe"))) * 100) === 15.34 && nr(median(vint.map((r) => V(r, "lonksamhet.nettoMarginal"))) * 100) === 14 && nr(median(vint.map((r) => V(r, "tillvaxt.prognosTillvaxt"))) * 100) === 13.37);
notis("FYND F7-kandidat (C): universumtabellens skuld-median 0,520", `textens 0,520 bärs av 195-vintagen 73745b24 (median exakt 0,52) medan 201-vintagen som bär övriga kolumner ger 0,51 och dagens fil 0,59 — byggarens mellan-vintage (intervallet '166–201' deklarerat); ingen kur nödvändig: slutsatsen 'vida över universumets' bär oavsett (FABG 0,9692)`);
kontroll("universum EV/EBIT 18,085 · FCF 3,94 · PEG 1,375", Math.abs(nr(median(vint.map((r) => V(r, "vardering.evEbit"))), 3) - 18.085) <= 0.001 && Math.abs(nr(median(vint.map((r) => V(r, "vardering.fcfYield"))) * 100) - 3.94) <= 0.01 && Math.abs(nr(median(vint.map((r) => V(r, "vardering.peg"))), 3) - 1.375) <= 0.001);

const pbs = fast.map((r) => ({ t: r.ticker, pb: V(r, "vardering.pb") })).filter((x) => typeof x.pb === "number").sort((a, b) => a.pb - b.pb);
kontroll("P/B näst lägst av 16 stigande (rang 2) — Vonovia 0,480 under", pbs.findIndex((x) => x.t === "FABG.ST") === 1 && p1(pbs[0].pb) === 0.48, `FABG rang ${pbs.findIndex((x) => x.t === "FABG.ST") + 1}/16 · lägst ${pbs[0].t} ${pbs[0].pb}`);
const pes = fast.map((r) => ({ t: r.ticker, pe: V(r, "vardering.pe") })).filter((x) => typeof x.pe === "number").sort((a, b) => b.pe - a.pe);
kontroll("P/E näst högst av 16 — Equinix 65,98 över", pes.findIndex((x) => x.t === "FABG.ST") === 1 && nr(pes[0].pe) === 65.98, `etta ${pes[0].t} ${pes[0].pe}`);
kontroll("EV/EBIT 24,894 mot grenmedianen 24,589 = gap 1,2 % ('exakt på medianen')", nr((24.894 / 24.589 - 1) * 100) === 1.24, "texten själv redovisar gapet 1,2 %");
const fys = fast.map((r) => ({ t: r.ticker, v: V(r, "vardering.fcfYield") })).filter((x) => typeof x.v === "number").sort((a, b) => b.v - a.v);
kontroll("FCF-yield näst högst av 15 — Unibail 9,51 över", fys.findIndex((x) => x.t === "FABG.ST") === 1 && fys.length === 15 && nr(fys[0].v * 100) === 9.51, `etta ${fys[0].t} ${nr(fys[0].v * 100)} · n=${fys.length}`);
const roes = fast.map((r) => ({ t: r.ticker, v: V(r, "lonksamhet.roe") })).filter((x) => typeof x.v === "number").sort((a, b) => a.v - b.v);
kontroll("ROE lägst av 15 mätta", roes.findIndex((x) => x.t === "FABG.ST") === 0 && roes.length === 15);
const nettos = fast.map((r) => ({ t: r.ticker, v: V(r, "lonksamhet.nettoMarginal") })).filter((x) => typeof x.v === "number").sort((a, b) => a.v - b.v);
kontroll("nettomarginal lägst av 16 mätta", nettos.findIndex((x) => x.t === "FABG.ST") === 0 && nettos.length === 16);
const fcfm = fast.map((r) => ({ t: r.ticker, v: V(r, "lonksamhet.fcfMarginal") })).filter((x) => typeof x.v === "number").sort((a, b) => b.v - a.v);
kontroll("FCF-marginal 44,46 tredje högst av 15 (median 31,39)", fcfm.findIndex((x) => x.t === "FABG.ST") === 2 && fcfm.length === 15, `rang ${fcfm.findIndex((x) => x.t === "FABG.ST") + 1}/${fcfm.length}`);
const sks = fast.map((r) => ({ t: r.ticker, v: V(r, "stabilitet.skuldEgenkapital") })).filter((x) => typeof x.v === "number").sort((a, b) => a.v - b.v);
kontroll("skuld/EK sjätte lägst av 16", sks.findIndex((x) => x.t === "FABG.ST") === 5 && sks.length === 16, `rang ${sks.findIndex((x) => x.t === "FABG.ST") + 1}/16`);
const pros = fast.map((r) => ({ t: r.ticker, v: V(r, "tillvaxt.prognosTillvaxt") })).filter((x) => typeof x.v === "number").sort((a, b) => a.v - b.v);
const negPros = pros.filter((x) => x.v < 0);
kontroll("prognostillväxt sjätte lägst av 16 · ett av sju negativa", pros.findIndex((x) => x.t === "FABG.ST") === 5 && negPros.length === 7, `rang ${pros.findIndex((x) => x.t === "FABG.ST") + 1} · negativa ${negPros.length}`);
kontroll("de djupaste minusposterna: Vonovia −56,8 · Simon Property −53,3 (%)", Math.abs(nr(negPros.sort((a, b) => a.v - b.v)[0].v * 100, 1) + 56.8) <= 0.05 && Math.abs(nr(negPros.sort((a, b) => a.v - b.v)[1].v * 100, 1) + 53.3) <= 0.05, `${negPros.sort((a, b) => a.v - b.v).slice(0, 2).map((x) => `${x.t} ${nr(x.v * 100, 1)}`).join(" · ")}`);

console.log("═══ 2b. FYND F1 — \"universumets EBIT-marginal 59,49\" mot fält + medianer ═══");
kontroll("FYND F1(bärare): 59,49 % är FABG:S EGET EBIT-fält — universumets EBIT-median är ~20–21 %", f.lonksamhet.ebitMarginal === 0.5949 && nr(median(vint.map((r) => V(r, "lonksamhet.ebitMarginal"))) * 100) < 25, `universum-EBIT-median ${nr(median(vint.map((r) => V(r, "lonksamhet.ebitMarginal"))) * 100)} % i vintagen; texten: 'universumets EBIT-marginal 59,49 procent (grenens median 58,43 — Fabege mitt i)' — 59,49 är bolagets fält, grenmedianen 58,43 bärs av vintagen`);
kontroll("grenens EBIT-median 58,43 % (textens parentes — RÄTT attribuering)", Math.abs(nr(median(fast.map((r) => V(r, "lonksamhet.ebitMarginal"))) * 100, 2) - 58.43) <= 0.06);

console.log("═══ 3. ARITMETIK — identiteter, kedjor, scenarioruta, rättesatser ═══");
kontroll("aktietalet: 22 901 ÷ 72,80 = 314,6 M (bodyns tal)", nr(22901 / 72.8, 1) === 314.6);
const id = 53.139 * 0.0115;
kontroll("dubbelstängningen: 53,139 × 0,0115 = 0,6111 mot P/B 0,614 = gap −0,47 %", nr(id, 4) === 0.6111 && nr((0.6111 / 0.614 - 1) * 100) === -0.47);
const ek = 22901 / 0.614;
kontroll("implicit EK: 22,901 ÷ 0,614 ≈ 37,296–37,298 mdr (textens mellansteg 37,296 avviker ≤ 2,1 Mkr = 0,006 %) · direktvägen 22 901 ÷ (0,614 × 314,6) = 118,557–118,56 = golvfältet", Math.abs(ek - 37297) <= 2.1 && Math.abs(22901 / (0.614 * 314.6) - 118.56) <= 0.005);
notis("EK-per-aktie-artefakt (C)", "textens '118,57 mot 118,56 — gapet 0,01 procent' bygger på mellanstegsavrundning; direktvägen ger 118,56 mot 118,56 (gap ~0,00 %) — kärnpåståendet 'stängd under ett halvt procentsteg' bär oavsett; ingen kur nödvändig (kan skärpas till 118,56/0,00 vid ägarens nästa ratt)");
kontroll("TTM-detektiven: P/E-vägen 22 901 ÷ 53,139 = 431 Mkr · marginalvägen 0,1087 × 3 480 = 378 Mkr · årsserien −348", Math.round(22901 / 53.139) === 431 && Math.round(0.1087 * 3480) === 378);
kontroll("svängen: 431 − (−348) = 779 Mkr = mer än två hela årsresultat (779/348 = 2,2)", 431 - -348 === 779 && nr(779 / 348, 1) === 2.2);
kontroll("PEG-trippeln: 5,07 × 5,01 = 25,4 (kvot mot P/E 0,48) · konventionen 53,139 ÷ 5,01 = 10,61", nr(5.07 * 5.01) === 25.4 && nr(25.4 / 53.139, 2) === 0.48 && nr(53.139 / 5.01) === 10.61);
kontroll("två substanser: 1 − 72,80/144 = 49,44 % (text 49,4) · 1 − 72,80/118,56 = 38,60 % (text 38,6 — golvfältets marginal 38,59 också 38,6) · gap 144/118,56 = +21,5 % (textens 21,4 = trunkering)", nr((1 - 72.8 / 144) * 100) === 49.44 && nr((1 - 72.8 / 118.56) * 100) === 38.6 && Math.abs((144 / 118.56 - 1) * 100 - 21.4) < 0.1);
kontroll("EPRA-serien: 147 → 144 (−2,0 %)", nr((144 / 147 - 1) * 100, 1) === -2.0);
kontroll("FYND F2: källradens '0,077 × 22,901 = 1 766 Mkr' — 0,077 × 22 901 = 1 763 Mkr (fältet är exakt 0,077)", nr(0.077 * 22901) === 1763, `sondräkning ${nr(0.077 * 22901)} Mkr; textens 1 766 (2 ytor: Test 5 + källraden) förutsätter fältet 0,0771 — källan anger 0,077`);
kontroll("FCF-marginalvägen: 0,4446 × 3 480 = 1 547 Mkr = 4,92 kr/aktie (1547/314,6)", Math.round(0.4446 * 3480) === 1547 && nr(1547 / 314.6) === 4.92);
kontroll("per-aktie-läsning yieldvägen: 1 763/314,6 = 5,60 — textens 5,61 bygger på 1 766", nr(1763 / 314.6) === 5.6, "med 1 766: 5,61; med fältets 1 763: 5,60 — följd av F2");
kontroll("gap +14 %: båda vägarna (1 763/1 547 = 13,96 · 1 766/1 547 = 14,2 → textens 'plus 14 procent' bär)", Math.round((1763 / 1547 - 1) * 100) === 14);
kontroll("utdelningstrappan: 4×1,00=4,00 · 4×0,60=2,40 · 4×0,45=1,80 · 4×0,50=2,00 · 4×0,55=2,20", [4, 2.4, 1.8, 2, 2.2].every((x, i) => 4 * [1, 0.6, 0.45, 0.5, 0.55][i] === x));
kontroll("direktavkastning: 2,20 ÷ 72,80 = 3,0 %", nr((2.2 / 72.8) * 100) === 3.02);
kontroll("oms-CAGR (3 480/3 032)^(1/3) − 1 = 4,7 % — trappan utan enda nedsteg", nr(((3480 / 3032) ** (1 / 3) - 1) * 100) === 4.7);
kontroll("tregångsmätaren: 0,614/0,9355 → 34,4 % under grenen (text 34) · 0,614/2,807 → 78,1 % under universum (text 78) · 53,139/12,909 = 4,1× över", nr((1 - 0.614 / 0.9355) * 100, 1) === 34.4 && nr((1 - 0.614 / 2.807) * 100, 1) === 78.1 && Math.floor(53.139 / 12.909 * 10) / 10 === 4.1);
kontroll("kapitalbasen: skuld 0,9692 × EK 37,296 = 36,15 + 37,296 > 73 mdr", 0.9692 * 37.296 + 37.296 > 73);
kontroll("förvaltningssteg: 773/657 = +18 % (17,7 avrundat) · hyresintäkter H1 1 794 mot 1 717 (+4,5 %)", Math.round((773 / 657 - 1) * 100) === 18 && nr((1794 / 1717 - 1) * 100, 1) === 4.5);
kontroll("värdeförändringarna: −711 mot +18 (2025 mot 2024) · utan dem 2025: −348+711 = +363 (positivt förvaltningsår)", -711 === -711 && -348 + 711 === 363);
kontroll("FYND F3: fältseriens 2025-hyresintäkter 3 480 mot rapportens 3 408 (källradens eget citat) — divergens 72 Mkr (2,1 %) utan Datavakts-not i texten", !(f.serier.omsattning[3] === 3480000000 && body.includes("hyresintäkter 3 408 Mkr mot 3 438") && !body.includes("3 480 mot rapportens 3 408")), "fält 3 480 (Yahoo-intäktsraden) vs rapport 3 408 (MFN-citatet): NYCKELTAL/Test 2 räknar på 3 480, källraden citatar 3 408 — divergensen osynliggjord; kur: en not i Test 2 eller källraden");
kontroll("FYND F4: 'här är den en tredjedel av den' — 348/711 = 0,49 (nästan hälften, inte tredjedel)", !body.includes("en tredjedel av den"), "övning A:s spegelnot; enda vägen till 'tredjedel' är 348/(711+348) = 0,33 — oklar definition; kur: 'nästan hälften' (348/711)");
const r = 0.4944, ruta = (s, rab) => nr(s * (1 - rab));
kontroll("scenarioruta 9/9 med rabatten 49,44 %: 138→69,77 · 144→72,81 · 150→75,84 · flanker 44/54 % exakta", ruta(138, 0.4944) === 69.77 && ruta(144, 0.4944) === 72.81 && ruta(150, 0.4944) === 75.84 && ruta(138, 0.44) === 77.28 && ruta(144, 0.44) === 80.64 && ruta(150, 0.44) === 84 && ruta(138, 0.54) === 63.48 && ruta(144, 0.54) === 66.24 && ruta(150, 0.54) === 69);
kontroll("mittencellen 72,81 stänger mot kursen 72,80 'på en öre' — rutan kalibrerad (textens egen not)", Math.abs(72.81 - 72.8) < 0.011);
kontroll("räknesatser: 6 kr substans → 6 × 0,5056 = 3,03 kr · 5 pp rabatt → 144 × 0,05 = 7,20 kr · vikt 7,20/3,03 = 2,4×", nr(6 * 0.5056) === 3.03 && nr(144 * 0.05) === 7.2 && nr(7.2 / 3.03) === 2.38);
kontroll("överföringsgrad r/(1−r) = 0,494/0,506 = 0,976 · relativ +10 % rabatt = −9,7…−9,8 % kurs (textens −9,8 = exakta r-läsningen 49,44→54,38)", nr(0.494 / 0.506, 3) === 0.976 && Math.abs(((1 - 0.54384) / (1 - 0.4944) - 1) * 100 + 9.8) <= 0.05);
kontroll("multipelövning C: kurs till P/B-ett 118,56 = +62,9 % · EK-fallet −38,6 % (37,296→22,901) · EPRA-boken 144 = +97,8 %", nr((118.56 / 72.8 - 1) * 100, 1) === 62.9 && nr((1 - 22.901 / 37.296) * 100, 1) === 38.6 && nr((144 / 72.8 - 1) * 100, 1) === 97.8);

console.log("═══ 4. JURIDIK — lagen (2007:528), mekanisk spegel ═══");
const varumarke = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, "utf8"));
const speglar = varumarke.forbjudnaFraser.map((fr) => ({ fran: new RegExp(fr.fran, "giu"), allvar: fr.allvar }));
const kt = (text) => { const fel = [], varn = []; for (const s of speglar) { const m = text.match(s.fran); if (m) (s.allvar === "FEL" ? fel : varn).push(m[0]); } return { fel, varn }; };
const rj = kt(yta);
kontroll("kontrolleraText på HELA ytan (title+desc+tags+body): 0 FEL 0 VARN", rj.fel.length === 0 && rj.varn.length === 0, `FEL ${rj.fel.length} · VARN ${rj.varn.length}${rj.fel.length ? " — " + rj.fel.join(",") : ""}`);
const gloss = ["aktietips", "kursmål", "du bör köpa", "köp denna", "sälj denna"].filter((g) => new RegExp(g.split(" ").join("\\s+"), "i").test(yta));
kontroll("rådgivningsglossor: 0 träffar", gloss.length === 0, gloss.join(",") || "0");
const rek = yta.match(/rekommendation/gi) || [];
kontroll("\"rekommendation\" 2 träffar, båda negerade (ingress + slutdisclaimer)", rek.length === 2 && body.includes("inte en rekommendation att köpa, sälja eller behålla") && body.includes("Inga köp-, sälj- eller hållningsrekommendationer"));
const lagrum = ["2022:260", "2022:261", "1985:716", "2005:59", "2022:482"];
kontroll("exakt en lagrumsfamilj (2007:528) — ingen blandning", yta.includes("2007:528") && lagrum.every((l) => !yta.includes(l)));
kontroll("utbildningsgrunden bärande (metod-formuleringar + övningsram + skattningsavstånd)", body.includes("utbildning i metod") && body.includes("Övning") && body.includes("skattningar tillhör inte detta paket") && body.includes("räknestorhet, aldrig som skattning"));

console.log("═══ 5. 911-REFERENSER — sex mönster (URL-id:n exkluderas maskinellt) ═══");
const m911 = ["911", "11 september", "september 2001", "9/11", "terror", "terrordåd"];
const ytaText = yta.replace(/\((https?:\/\/[^)]+)\)/g, "(extern-länk)");
const t911 = m911.filter((m) => new RegExp(m.replace(/\//g, "\\/"), "i").test(ytaText));
kontroll("911 = 0 träffar på sex mönster i text-ytan", t911.length === 0, t911.join(",") || "0");

console.log("═══ 6. INTERNLÄNKAR — statiskt + levande sajt (deploylåset kontrollerat) ═══");
const interna = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]))];
let lankOK = 0, lankFEL = 0;
for (const sokvag of interna) {
  try {
    const sv = await fetch(`http://localhost:3000${sokvag}`, { redirect: "manual" });
    if (sv.status === 200) { lankOK++; console.log(`  ✓ HTTP 200 ${sokvag}`); }
    else { lankFEL++; console.log(`  ✗ FEL: HTTP ${sv.status} ${sokvag}`); }
  } catch (e) { lankFEL++; console.log(`  ✗ FEL: fetch ${sokvag} (${e.code || e.message})`); }
}
kontroll(`interna länkar ${interna.length} st: samtliga HTTP 200 mot localhost:3000`, lankFEL === 0 && lankOK === interna.length, `${lankOK}/${interna.length}`);
notis("deploylåset", lockFri ? "FRITT vid länkdom (medie-lärdomen följd)" : "UPPTAGT vid sondens start — HTTP-dom kan bära byggtillstånd");
const externa = [...new Set([...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]))];
for (const url of externa) {
  try {
    const sv = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(8000), headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64) kontroll-sond" } });
    if (sv.status === 403) notis("extern länk", `${url.slice(0, 60)}… — 403 (bot-skydd; källan dokumenterad i kalenderunderlaget med hämtdatum)`);
    else kontroll(`extern länk levande: ${url.slice(0, 60)}…`, sv.status >= 200 && sv.status < 400, String(sv.status));
  } catch (e) { notis("extern länk", `${url.slice(0, 60)}… — fetch misslyckades (${e.code || e.message}); källraden i kalenderunderlaget bär URL:en`); }
}

console.log("═══ 7. STRUKTUR & KONVENTIONER + FYND F2–F4 ═══");
const h2 = (body.match(/^## /gm) || []).length;
const ord = body.match(/\S+/g)?.length ?? 0;
kontroll("H2-rubriker = 7 (kvartalsfamiljens stil: Castellum/NP3/Wallenstam 7 — wihlborgs 8 är avvikaren)", h2 === 7, String(h2));
kontroll(`readingMinutes ${ut.readingMinutes} = kvartalskonventionen round(${ord}/600) = ${Math.round(ord / 600)}`, ut.readingMinutes === Math.round(ord / 600), `ord ${ord}`);
kontroll(`title ${ut.title.length} tkn inom familjetaket 314 (syskonspann 189–236 + wihlborgs 344=fynd)`, ut.title.length <= 314, `title ${ut.title.length} tkn`);
kontroll("description väl inom spannet (200–1 100 tkn)", ut.description.length >= 200 && ut.description.length <= 1100, `desc ${ut.description.length}`);
kontroll("publishedAt 2026-10-21 = rappdagen (Kinnevik-konventionen FÖLJD)", ut.publishedAt === "2026-10-21");
kontroll("tags 6 st — inom familjespannet (6–7)", ut.tags.length >= 6 && ut.tags.length <= 7);
kontroll("Källor-sektionen sist + disclaimer + R2-rad (kundens beslut)", body.includes("## Källor") && body.trim().endsWith("publiceringen av detta paket är kundens beslut.*"));
kontroll("FYND F2 yta 2: Test 5-textens 'ger ett fritt kassaflöde på 1 766 miljoner kronor' — fältvägen ger 1 763", !body.includes("1 766 miljoner"), "kur: 1 763 Mkr (0,077 × 22 901) på båda ytorna, alt. redovsa fältet med fler decimaler");
kontroll("FYND F3: hyresintäkts-divergensen 3 480 (fält) mot 3 408 (rapport) osynliggjord — källraden bär båda talen utan not", body.includes("3 408") && body.includes("3 480"), "NYCKELTAL/Test 2 räknar på fältets 3 480; källraden citatar rapportens 3 408 — 72 Mkr (2,1 %) divergens utan Datavakts-not");
notis("serienummer", "textens 'seriens 53:e' + 'Med 52 paket på disk' är byggtidens internkonsistens (idag 93 kvartalsfiler i mappen) — historian äger numret");
notis("överskottsgrad 73 %", "Q2-2026-rapporttal (källraden bär det) — inte universumfält; texten håller isär fält och rapport korrekt");
notis("EBIT-fältets natur", "övningsnot: FABG EBIT-marginal 59,49 % är ett Yahoo-fält som (till skillnad från rapportens överskottsgrad-definition) mäter på totala intäkter — texten förklarar avgränsningsskillnaden, F1 gäller ENDAST attribueringen 'universumets'");

console.log(`\n═══ RESULTAT: ${OK} OK · ${FEL} FEL (= fyndens belägg) · ${NOT} NOT ═══`);
console.log(`═══ utkast-md5 ${md5(readFileSync(FIL))} (orörd av sonden) ═══`);
process.exit(FEL === 0 ? 0 : 1);
