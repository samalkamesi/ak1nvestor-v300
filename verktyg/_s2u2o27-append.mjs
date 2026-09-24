#!/usr/bin/env node
/**
 * _s2u2o27-append.mjs — AUTO-S2 omgång 27 u2: SRT3.DE + HFG.DE append i
 * bolagsunivers.json (Tyskland/tillvaxt 0→2). Idempotent: hoppar över rader
 * som redan finns; RONDELL-bevis: alla gamla rader byte-identiska efteråt;
 * 1-mellanslagsindentering = trädets/HEAD:s konvention (od-bevisad race 17:
 * "[ { \"ticker\"" — 1/2 indrag; 2-mellanslagsvarianten gav 23 149 raders
 * kosmetisk helbytesdiff, git diff -w tom).
 * Kvartiler + universumjämförelse skrivs till stdout för protokoll/worklog.
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const rå = readFileSync(UNI, "utf8");
const uni = JSON.parse(rå);
const FÖRE = uni.length;
const gamlaFöre = uni.map((r) => JSON.stringify(r));

const median = (v) => { const s = v.slice().sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const p25 = (v) => { const s = v.slice().sort((a, b) => a - b); const pos = (s.length - 1) * 0.25; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const p75 = (v) => { const s = v.slice().sort((a, b) => a - b); const pos = (s.length - 1) * 0.75; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const kvartilTabell = (universum) => {
  const t = universum.filter((r) => r.bransch === "tillvaxt" && typeof r.vardering?.pe === "number");
  const alla = universum.filter((r) => typeof r.vardering?.pe === "number");
  return { t, alla };
};

const { t: tFöre, alla: aFöre } = kvartilTabell(uni);
console.log(`FÖRE: universum ${FÖRE} rader · tillväxt mätbara P/E ${tFöre.length} · universum mätbara ${aFöre.length} · totalmedian ${median(aFöre.map((r) => r.vardering.pe)).toFixed(2)} · tillväxt-median ${tFöre.length ? median(tFöre.map((r) => r.vardering.pe)).toFixed(2) : "—"} (kv ${tFöre.length ? p25(tFöre.map((r) => r.vardering.pe)).toFixed(1) : "–"}–${tFöre.length ? p75(tFöre.map((r) => r.vardering.pe)).toFixed(1) : "–"})`);

const SRT3 = {
  ticker: "SRT3.DE", namn: "Sartorius AG", bransch: "tillvaxt", land: "Tyskland", valuta: "EUR",
  kallor: [{
    namn: "StockAnalysis", hamtat: "2026-09-21",
    url: "https://stockanalysis.com/quote/etr/SRT3/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
    paranoid: "ETR-PRIMÄRNOTING i EUR (Xetra; SAP.DE/BAS.DE-precedenserna; underlag S&P Global Market Intelligence + S&P Capital IQ financials-tabell; intradag 2026-09-21 17:35 CET): pris 248,70 EUR intraday (föregående close 247,30 = +0,57 % dagen), mcap 15,41 mdr (replik 15 410/248,70 = 61,96 M aktiers TTM-bas mot aktiefältets 69,04 M — BAS-SPRIDNING dokumenterad, CAP.PA-precedensen; BVPS-pariteten 39,20 × 69,05 = 2 707 = common-EK FY2025 EXAKT — TVÅ EK-BASER: common 2 823 mot total 3 998 TTM, ~1 175 M förlagslån/minoritet), P/E 78,58 (replik 15 410/196,1 EXAKT) fwd 60,69 ⇒ prognosTillväxt +29,49 % (vändningsåret: TTM-netto +88,4 %), PEG 2,66 spårkonventionen (källans fält 3,32 på 3-års-EPS-prognos 15,97 %/år — båda belagda), PS 4,30 (replik 4,302 ✓), P/B 3,85 = mcap/EK-total 3 998 (replik 3,854 ✓), P/FCF 32,75 (replik EXAKT), EV 20,35 mdr (källfält; replik TTM 15 410+4 052−291,3 = 19,17 — källans EV-bas 4 940 ≈ FY2023-nettoskulden 4 917, SPRIDNING 5,8 % dokumenterad), EV/EBIT 33,20 (replik 33,03 — 0,5 %), EV/EBITDA 20,89 (bas 974 mot tabell-EBITDA 938,5 — 3,7 % dokumenterad), marginaler TTM: brutto 45,71 % (1 637/3 582 ✓) · EBIT 17,20 % (616,1/3 582 EXAKT) · netto 5,48 % · FCF 13,14 % (EXAKT), fcfYield 3,05 % (EXAKT), ROE 7,18 ROIC 5,54 mot WACC 10,29 = −4,75 pp (PREMIUM-MULTIPLEN PÅ SUB-WACC-AVKASTNING — vändningscykelns pris), effektiv skatt 30,84 % (124,7/404,4), kassa 291,3 M €, skuld 4 052 M €, NETTOSKULD 3 761 M € (net debt/share −54,47), D/E 1,01 (replik 4 052/3 998 ✓), räntetäckning 4,19, Altman 2,47, Piotroski 6, utdelning 0,74 EUR (0,30 %) payout 25,91 %, DPS-tratta 1,26→1,44→0,74→0,74→0,74 (KLIPPNINGEN −48,61 % 2023 + TRE PLATTA år), institutioner 13,66 %, 52-v 189,90–267,70 (+18,83 % på året), analytiker Buy 20 st PT 271,74 (+9,26 %), 14 279 ANSTÄLLDA (rev/anställd 250 837 €), GRUNDAT 1870 (Göttingen — 156 års labbhistoria), nästa rapp 2026-10-22 (Q3); FY KALENDER (rev 3 449→4 175→3 396→3 381→3 538 M € FY2021-25; omsCAGR +0,64 %/år — pandemiboomen +21,03 % FY22 sedan tre platta/krympande år, TTM 3 582 +1,24 % mot FY2025 spårkonventionen), netto 318,9→678,1→205,2→84,0→154,9 M € (FY23 = 205,2 CapIQ-tabell korsbelagt av EPS 3,01 × 68,42 = 205,9 — GMI-översiktens nyrad skjuten ett år, dokumenterat; topp FY22 678,1 → botten FY24 84,0 → vändning TTM 196,1 = PANDEMIKAVAJEN), bruttomarginal 53,31→52,62→46,16→45,09→46,26 % (femårsmedel 48,69 % spread 8,22 pp — DET BREDA PANDEMI-BANDET, mot DSY:s 0,17 pp smalaste), EBIT-marginal 27,05→16,04 %, CF: OCF 873,2→837,0 M € · capex 407,2→522,6→559,7→409,9→441,9 (47–53 % av OCF — KAPITALTUNG skala) · FCF 466,0→211,6→293,9→566,3→395,1 M € (5/5 positiva, TTM 470,5), utdelningar betalda 48,2→85,9→98,2→50,7→50,7 M €, skuld 2 075→2 541→5 311→4 560→4 283 M € (FY2023-hoppet +2 770 — LT-utgivning 6 059 samma år, dokumenterat utan orsaksspekulation), goodwill 1 362→3 470 M € (FY2022-förvärvsvågen +1 358), EK-total 1 720→3 867 M €, SEGMENT: Bioprocess 2 727→3 327→2 678→2 690→2 865 · Lab 722→848→718→691→673 (FY25-summa 3 538 EXAKT); branschfält Healthcare/Medical Instruments & Supplies — SPÅRKLASSNINGEN tillväxt (stil-grenen, ADYEN.AS/BOOZT-precedenserna): P/E 78,6 i TTM-vändning, inte stabil storföretagsvinst"
  }],
  hamtat: "2026-09-21", pris: 248.7, marknadsKapitalMdr: 15.41,
  tillvaxt: { omsattningCAGR5ar: 0.0064, resultatCAGR5ar: -0.1652, omsattningTillvaxtTTM: 0.0124, prognosTillvaxt: 0.2949 },
  lonksamhet: { roe: 0.0718, roic: 0.0554, bruttoMarginal: 0.4571, ebitMarginal: 0.172, nettoMarginal: 0.0548, fcfMarginal: 0.1314 },
  stabilitet: { skuldEgenkapital: 1.01, rantaTackning: 4.19, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: 0.0507, andelUtestande: 0.2591, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.4869, bruttoMarginalSpread5ar: 0.0822, roeMedel5ar: null },
  vardering: { pe: 78.58, pb: 3.85, evEbit: 33.2, peg: 2.66, fcfYield: 0.0305, egenKapitalMultipl: 3.85 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [3449000000, 4175000000, 3396000000, 3381000000, 3538000000], resultat: [318900000, 678100000, 205200000, 84000000, 154900000], egetKapital: [], fcf: [] }
};

const HFG = {
  ticker: "HFG.DE", namn: "HelloFresh SE", bransch: "tillvaxt", land: "Tyskland", valuta: "EUR",
  kallor: [{
    namn: "StockAnalysis", hamtat: "2026-09-21",
    url: "https://stockanalysis.com/quote/etr/HFG/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
    paranoid: "ETR-PRIMÄRNOTING i EUR (Xetra; MAERSK-B.CO/ADYEN.AS-precedenserna; underlag S&P Global Market Intelligence, uppdaterad 2026-08-13; intradag 2026-09-21 17:36 CET): pris 2,633 EUR intraday (föregående close 2,673 = −1,50 % dagen), mcap 385,13 M (replik 144,08 M × 2,633 = 379,5 — 1,5 % BAS-SPRIDNING, källans TTM-bas 146,2 M; aktiebasen KRYMPER: 173,54→144,4 M = −16,79 % på fyra år, återköpsmaskinen dokumenterad nedan), P/E n/a (TTM-förlust −34,8 M € — Ørsted/VWS-precedenserna: pe=null är INFORMATION), fwd P/E 6,86 ⇒ prognosTillväxt +259,9 % (VÄNDNINGEN: fwd-EPS 2,633/6,86 = 0,3838 mot TTM −0,24 — ELUX-mönstrets vändningsräkning, (0,3838+0,24)/0,24), PS 0,06 (replik 0,0606 ✓ — SEX MILJARDER omsättning till 385 M börsvärde: VÄRDERINGSGOLVET), P/B 0,61 = mcap/common-EK 633,5 (replik 0,6079 ✓; BVPS 4,39 × 144,4 = 633,9 ✓ — pris/BVPS 2,633/4,39 = 0,60 mot P/TBV 1,60 = goodwill-väggens två lava), P/FCF 3,27 (replik 3,266 ✓), EV 885,73 M (replik 385,13+503,8 = 888,9 — 0,4 % spridning), EV/Sales 0,14 ✓, EV/EBIT 16,16 (replik 885,73/54,8 EXAKT), EV/EBITDA 3,51 (källbas 252,3 mot tabell-EBITDA 156,0 — 61,7 % SPRIDNING dokumenterad: lease-/justeringsbas), marginaler TTM: brutto 60,42 % (3 840/6 356 EXAKT) · EBIT 0,86 % (54,8/6 356 ✓ — ENPROCENTSMASKINEN) · netto −0,55 % · FCF 1,86 %, fcfYield 30,61 % (117,9/385,13 EXAKT — VÄRDETS SISTA VAKTPOST: kassflödet lever medan vinsten saknas), ROE −5,33 ROIC 4,81 mot WACC 4,38 = +0,43 pp (på nollstrecket), skatt: pretax −4,0 − tax 31,9 = −35,9 ≈ netto −34,8 (±minoritet, identitet dokumenterad), kassa 246,9 M €, skuld 750,7 M €, NETTOSKULD 503,8 M € (net cash/share −3,50), D/E 1,19 (replik 750,7/630,3 EXAKT), räntetäckning 1,67 (BALANSENS VAKTPOST — under Sartorius 4,19 i samma cell), Altman 3,3, Piotroski 4, utdelning n/a (aldrig delat ut), buyback yield 8,15 % ⇒ shareholder yield 8,15 % (återköp FY2025: 39,6+93,0 = 132,6 M € = 0,13 mdr — ETT TREDJEDEL AV börsvärdet), institutioner 57,63 insiders 6,85 %, 52-v 2,612–7,920 (−65,87 % på året — distans till toppen −66,8 %), analytiker Hold 13 st PT 4,97 (+88,76 %), 17 459 ANSTÄLLDA (rev/anställd 439 736 € = 1,75× Sartorius 250 837 — VOLYMMOTORNS produktivitetsparadox i samma cell), GRUNDAT 2011 (Berlin — 15 år mot Sartorius 156), nästa rapp 2026-11-05 (Q3); FY KALENDER (rev 5 993→7 607→7 597→7 661→6 761 M € FY2021-25; omsCAGR +3,06 %/år men TRE RAKA NEGATIVA år: −0,14/+0,85/−11,75 % och TTM −5,99 % mot FY25 spårkonventionen; pandemi-boomen +59,83/+26,93 % FY21-22 sedan konsolideringskrymp), netto 242,8→127,0→19,4→−136,4→−92,6 M € (FÖRLUSTTRAPPAN: vinst FY21-23 → två förlustår — resultatCAGR = null enligt EKTA/ELUX-konventionen, negativt slutår), bruttomarginal 65,86→65,55→64,78→62,49→61,67 % (FEM RAKA FALLANDE ÅR −6,36 % totalt; femårsmedel 64,07 % spread 4,19 pp — mot Sartorius breda pandemiband men HÖGRE nivå: råvaruhandeln bär marginalen, logistiken äter den), EBIT-marginal 6,29→0,03 % FY24 (nollstrecksåret) →1,54, CF: OCF 691,8→300,4 · capex 115,4→77,9 · FCF 224,1→−58,6→133,4→147,5→222,5 M € (4/5 positiva — FY2022 brast), återköp 158,6→132,6 M €, NETTOPENDELN: nettokassa +365,4 (FY21) → nettoskuld −503,8 (TTM) — pandemikassan blev förvärvs- och återköpsskuld (balansraden berättar omvandlingen), EK 899,9→672,7 M € (−25 %), goodwill 262,2 M € (12 % av tillgångarna — lätt balans); branschfält Consumer Staples/Grocery Stores — SPÅRKLASSNINGEN tillväxt (BOOZT/ADYEN.AS-precedenserna: e-handels-/plattformsprofilen i stil-grenen)"
  }],
  hamtat: "2026-09-21", pris: 2.633, marknadsKapitalMdr: 0.38513,
  tillvaxt: { omsattningCAGR5ar: 0.0306, resultatCAGR5ar: null, omsattningTillvaxtTTM: -0.0599, prognosTillvaxt: 2.599 },
  lonksamhet: { roe: -0.0533, roic: 0.0481, bruttoMarginal: 0.6042, ebitMarginal: 0.0086, nettoMarginal: -0.0055, fcfMarginal: 0.0186 },
  stabilitet: { skuldEgenkapital: 1.19, rantaTackning: 1.67, fcfPositivaSenaste5: 4, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: 0.1326, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.6407, bruttoMarginalSpread5ar: 0.0419, roeMedel5ar: null },
  vardering: { pe: null, pb: 0.61, evEbit: 16.16, peg: null, fcfYield: 0.3061, egenKapitalMultipl: 0.61 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [5993000000, 7607000000, 7597000000, 7661000000, 6761000000], resultat: [242800000, 127000000, 19400000, -136400000, -92600000], egetKapital: [], fcf: [] }
};

let lade = 0;
for (const rad of [SRT3, HFG]) {
  if (uni.some((r) => r.ticker === rad.ticker)) { console.log(`SKIP ${rad.ticker} (finns)`); continue; }
  uni.push(rad); lade++;
}
const gamlaEfter = uni.slice(0, FÖRE).map((r) => JSON.stringify(r));
let förändrade = 0;
for (let i = 0; i < FÖRE; i++) if (gamlaFöre[i] !== gamlaEfter[i]) förändrade++;
console.log(`RONDELL: ${FÖRE} gamla rader, ${förändrade} förändrade (krav 0) · lade ${lade} nya · totalt ${uni.length}`);

if (förändrade !== 0) { console.log("ABORT — gamla rader förändrade"); process.exit(1); }

writeFileSync(UNI, JSON.stringify(uni, null, 1) + "\n");
console.log("SKREV bolagsunivers.json (1-mellanslagsindentering = HEAD-format)");

/* KVARTILER + UNIVERSUMJÄMFÖRELSE (efter-läget) */
const { t: tEfter, alla: aEfter } = kvartilTabell(uni);
const peT = tEfter.map((r) => r.vardering.pe);
const peA = aEfter.map((r) => r.vardering.pe);
const srt3RankT = tEfter.filter((r) => r.vardering.pe < 78.58).length + 1;
const srt3RankA = aEfter.filter((r) => r.vardering.pe < 78.58).length + 1;
console.log(`\nKVARTILER EFTER: universum ${uni.length} rader · mätbara P/E ${aEfter.length}`);
console.log(`tillväxt: n ${peT.length} · median ${median(peT).toFixed(1)} · kv ${p25(peT).toFixed(1)}–${p75(peT).toFixed(1)}`);
console.log(`FÖRE→EFTER tillväxt: n ${tFöre.length}→${peT.length} · median ${tFöre.length ? median(tFöre.map((r) => r.vardering.pe)).toFixed(1) : "—"}→${median(peT).toFixed(1)} · kv ${tFöre.length ? p25(tFöre.map((r) => r.vardering.pe)).toFixed(1) : "–"}–${tFöre.length ? p75(tFöre.map((r) => r.vardering.pe)).toFixed(1) : "–"}→${p25(peT).toFixed(1)}–${p75(peT).toFixed(1)}`);
console.log(`totalt: median ${median(aFöre.map((r) => r.vardering.pe)).toFixed(1)}→${median(peA).toFixed(1)} (n ${aFöre.length}→${aEfter.length})`);
console.log(`SRT3 78,58: rad ${srt3RankT}/${peT.length} i tillväxt · rad ${srt3RankA}/${peA.length} i universumet`);
console.log(`HFG: pe=null (förlustår) — tillväxt-cellen bär nu n ${peT.length} mätbara av ${uni.filter((r) => r.bransch === "tillvaxt").length}`);
const tyskland = uni.filter((r) => r.land === "Tyskland");
console.log(`Tyskland: ${tyskland.length} bolag · grenar ${new Set(tyskland.map((r) => r.bransch)).size}/10 KOMPLETT`);
