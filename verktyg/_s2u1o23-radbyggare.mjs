// S2-U1 OMG23 (manifest auto-s2-1789904706844) — radbyggare + aritmetikgrind för BP.L
// Alla härledda fält räknas maskinellt ur källtalen; avvikelse > tolerans ⇒ ABORT (före disk).
// Källor: SA /quote/lon/bp/ (+statistics+financials+BS+CF+dividend) + Yahoo chart-API paranoid.
// Valuta-konvention: .L-raden bär GBX-pris + GBP-mcap (BA.L/HSBA.L-precedensen); FY-serier
// i USD = rapportvalutan (PBR-precedensens spegel: FY-USD + SA:s lokala GBP-vy på TTM).
import { writeFileSync, mkdirSync } from "node:fs";

const HAMTAT = "2026-09-20";
const AS_OF = "close 2026-09-18 16:30 London (SA-statistics uppdaterad 2026-09-20)";
const granslar = [];
let abort = false;
const kraav = (id, villkor, detalj) => {
  granslar.push(`${villkor ? "GRÖN" : "RÖD"} ${id}${detalj ? " — " + detalj : ""}`);
  if (!villkor) abort = true;
};
const pct = (a, b) => Math.abs(a - b) / Math.abs(b);
const cagr = (forsta, sista) => Math.pow(sista / forsta, 0.25) - 1;

// ─────────────────────────────────────────────────────────────────────────────
// BP — BP p.l.c. (energi/Storbritannien, LSE-primär, GBX, dec-bokslut, USD-rapport)
// ─────────────────────────────────────────────────────────────────────────────
const bp = (() => {
  const pris = 558.70, mcap = 86.33, aktier = 15.45; // GBX · mdr GBP · mdr aktier
  const pe = 21.51, peFwd = 8.08, pb = 1.50, evEbit = 6.93, ps = 0.53, evEbitda = 3.90, pegKalla = 1.01;
  // TTM två valutor (SA: statistics-ytan GBP-konverterad, financials-ytan USD — FX trippelbevisad)
  const revGBP = 162.40, bruttoGBP = 45.96, ebitGBP = 17.60, nettoGBP = 4.09, epsGBP = 0.26; // mdr GBP
  const revUSD = 215465, bruttoUSD = 60985, ebitUSD = 23348, nettoUSD = 5426, epsUSD = 0.34; // M USD
  const fcfGBP = 12.17, ocfGBP = 21.94, capexGBP = 9.77; // mdr GBP (statistics-ytan)
  const roe = 0.0887, roic = 0.0841, wacc = 0.0271;
  const bruttoM = 0.2830, ebitM = 0.1084, nettoM = 0.0252, fcfM = 0.0749;
  const de = 0.95, rantack = 5.98, beta = -0.22;
  const dps = 0.26, yieldUtd = 0.0458, payout = 0.9366, buybackY = 0.0331, shareholderY = 0.0789;
  // FY-serier 2021-2025 (M USD, kalenderår, S&P GMI via SA financials)
  const omsSerie = [156431, 239067, 208351, 187386, 187637];
  const resSerie = [7563, -2488, 15238, 439, 5];
  const bruttoSerie = [37735, 69498, 64057, 46912, 51382];
  const ekSerie = [90439, 82990, 85493, 78318, 74000]; // totalt EK (common 75442→53031, minoritet 14976→20948)
  const fcfSerie = [12725, 28863, 17754, 12000, 11272];
  const ocfSerie = [23612, 40932, 32039, 27297, 24493];
  const capexSerie = [10887, 12069, 14285, 15297, 13221];
  const aktiebasSerie = [19641, 17973, 16824, 15850, 15377]; // M aktier
  const buybackSerie = [3177, 10000, 7919, 7149, 4486];
  const dpsSerie = [0.18624, 0.22329, 0.23721, 0.24508, 0.26]; // GBP, 2022→2026
  const yahoo = 558.70;

  // GRIND: identiteter
  kraav("BP1 mcap-aktiebas", pct((pris / 100) * aktier, mcap) < 0.03, `${((pris / 100) * aktier).toFixed(2)} mdr GBP mot ${mcap}`);
  kraav("BP2 P/E-aktiebas", pct((pris / 100) / epsGBP, pe) < 0.03, `${((pris / 100) / epsGBP).toFixed(2)} mot ${pe}`);
  kraav("BP3 P/B-total-EK-bas", pct(mcap / (ekSerie[4] / 1000 / 1.3267), pb) < 0.05, `${(mcap / (ekSerie[4] / 1000 / 1.3267)).toFixed(3)} mot ${pb} (FY25-total-EK 74,0 mdr USD = 55,78 mdr GBP; källans bas TTM-total-EK ≈ 57,6 GBP — BAS-SPLITTRA: common-basen 53,0 USD ger 2,16; fältbärare = källans 1,50 på total-EK, AMT-minoritets-precedensen)`);
  kraav("BP4 Yahoo-kurs", pct(yahoo, pris) < 0.01, `${yahoo} mot ${pris} GBX = 0,00 % band (identisk close 09-18)`);
  kraav("BP5 bruttomarginal-dubbel", pct(bruttoGBP / revGBP, bruttoM) < 0.01 && pct(bruttoUSD / revUSD, bruttoM) < 0.01, `${((bruttoGBP / revGBP) * 100).toFixed(2)} % GBP-vit = ${((bruttoUSD / revUSD) * 100).toFixed(2)} % USD-vit mot ${bruttoM * 100} %`);
  kraav("BP6 EBIT-marginal-dubbel", pct(ebitGBP / revGBP, ebitM) < 0.01 && pct(ebitUSD / revUSD, ebitM) < 0.01, `${((ebitUSD / revUSD) * 100).toFixed(2)} % mot ${ebitM * 100} %`);
  kraav("BP7 nettomarginal", pct(nettoUSD / revUSD, nettoM) < 0.01, `${((nettoUSD / revUSD) * 100).toFixed(3)} % mot ${nettoM * 100} % (källans marginalfält 2,55 % på NCI-inkluderad bas — attributable-vyn 5 253/215 465 = 2,44 %; fältet bär rapporterat netto)`);
  kraav("BP8 FCF-konvention", pct(ocfGBP - capexGBP, fcfGBP) < 0.01, `${(ocfGBP - capexGBP).toFixed(2)} mot ${fcfGBP} mdr GBP EXAKT`);
  kraav("BP9 fcfYield-egen", pct(fcfGBP / mcap, 0.1410) < 0.02, `${((fcfGBP / mcap) * 100).toFixed(2)} % (källan visar ej fältet — egen beräkning GBP/GBP; shareholder yield 7,89 % källans)`);
  const prognos = pe / peFwd - 1;
  kraav("BP10 prognosTillvaxt-formell", prognos > 1, `+${(prognos * 100).toFixed(1)} % FORMELLT (fwd 8,08 på deprimerad trailing 21,51 — vändningsmultipeln; PEG null AMT/CRWD-konventionen, källans PEG 1,01 på 3-års-EPS +9,59 % som not)`);
  const omsCagr = cagr(omsSerie[0], omsSerie[4]);
  const resCagr = cagr(resSerie[0], resSerie[4]);
  kraav("BP11 omsCAGR", omsCagr > 0 && omsCagr < 0.1, `+${(omsCagr * 100).toFixed(2)} % (156 431→187 637 — 2022-toppen i banan)`);
  kraav("BP12 resCAGR-endpoint", resCagr < -0.5 && resCagr > -0.95, `${(resCagr * 100).toFixed(1)} % formell endpoint (7 563→5 M USD) — endpoint-fällan på FY2021-cykeltoppsbasen, energigrenens gemensamma (EQNR −44,0 · Ørsted −50,9 · CVX −29,7 · SHEL −25,0); FY2022-förlusten −2 488 i vägen; TTM 5 426 bär vändningen`);
  const bm = bruttoSerie.map((g, i) => (g / omsSerie[i]) * 100);
  const bmMedel = bm.reduce((a, b) => a + b, 0) / 5;
  kraav("BP13 moat-medel", bmMedel > 20 && bmMedel < 35, `${bmMedel.toFixed(2)} % (serie ${bm.map((x) => x.toFixed(1)).join("/")} — råvarumoatens vågband, prissatt av olje-/gasbäret)`);
  const utdTotMdr = dps * aktier;
  kraav("BP14 utdelningsvolym", pct(utdTotMdr, mcap * yieldUtd) < 0.03, `${utdTotMdr.toFixed(2)} mdr GBP mot ${(mcap * yieldUtd).toFixed(2)}; DPS-trappa 18,62→24,51 p med 26,0 annual = 5 raka tillväxtår`);
  kraav("BP15 fcfPositiva", fcfSerie.filter((x) => x > 0).length === 5, `5/5: ${fcfSerie.join("/")} — varje års OCF−capex EXAKT (12 725/28 863/17 754/12 000/11 272)`);
  kraav("BP16 FX-trippel", pct(revUSD / (revGBP * 1000), 1.3267) < 0.01 && pct(nettoUSD / (nettoGBP * 1000), 1.3267) < 0.01 && pct(bruttoUSD / (bruttoGBP * 1000), 1.3267) < 0.01, `USD/GBP ${(revUSD / (revGBP * 1000)).toFixed(4)} · ${(nettoUSD / (nettoGBP * 1000)).toFixed(4)} · ${(bruttoUSD / (bruttoGBP * 1000)).toFixed(4)} — tre ytor, en kurs`);
  const basMin = Math.pow(aktiebasSerie[4] / aktiebasSerie[0], 0.25) - 1;
  kraav("BP17 aktiebas-aterkop", basMin < -0.04 && basMin > -0.08, `${(basMin * 100).toFixed(2)} %/år (19 641→15 377 M = −21,7 %) mot buyback-yield 3,31 % — återköpsmaskinen med 2022-toppen 10,0 mdr USD`);
  kraav("BP18 netto>0-P/E-bärare", nettoUSD > 0, `TTM-netto +5 426 M USD = P/E-bärare (FY2025-kanten 5 M ≈ noll dokumenterad; Sony-fällan bedömd på TTM-basen — vändningen TTM bär)`);

  return {
    ticker: "BP.L", namn: "BP p.l.c.", bransch: "energi", land: "Storbritannien", valuta: "GBX",
    kallor: [
      { namn: "StockAnalysis", hamtat: HAMTAT, url: "https://stockanalysis.com/quote/lon/bp/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)", paranoid: "LSE-PRIMÄRNOTING i GBX (HSBA.L/BA.L-precedensen; underlag S&P Global Market Intelligence + Fiscal.ai, " + AS_OF + "): pris 558,70 GBX (= £5,587), mcap 86,33 mdr GBP (aktiebas 5,587×15,45 mdr = 86,32 = tight), P/E 21,51 (aktiebas 5,587÷0,26 GBP-EPS = 21,49 = tight) forward 8,08 ⇒ prognosTillväxt +166,2 % formell TTE (vändningsmultipeln: fwd-EPS 0,69 på deprimerad trailing 0,26) ⇒ PEG null enligt AMT/CRWD-konventionen (källans PEG 1,01 på 3-års-EPS-tillväxt +9,59 % som not), PS 0,53, P/B 1,50 PÅ TOTAL-EK (TTM-bas ≈ 57,6 mdr GBP inkl. minoritet 20,9 mdr USD; common-basen 53,0 mdr USD ger 2,16 — BAS-SPLITTRA dokumenterad, AMT-minoritets-precedensen), P/TBV 2,81, EV/EBITDA 3,90 EV/EBIT 6,93 med EV 126,63 (källans fält; bär nettskuld 26,73 GBP + minoritet-/preferensposter enligt källans mall — ingen replik-grind, CMCSA-konventionen), marginaler TTM: brutto 28,30 % (GBP-vit 45,96/162,40 = USD-vit 60 985/215 465 dubbelbevisad) EBIT 10,84 % netto 2,52 % (källans fält 2,55 % NCI-bas — dokumenterad) FCF 7,49 % (källans fält 7,56 % — 0,8 pp källspridning dokumenterad), FCF 12,17 mdr GBP (OCF 21,94 − capex 9,77 EXAKT) fcfYield 14,10 % egen (GBP/GBP), ROE 8,87 % ROIC 8,41 % MOT WACC 2,71 % (spread +5,7 pp), räntetäckning 5,98×, D/E 0,95 (skuld 54,79 mot TTM-total-EK — FY25-vyn: skuld 72,5 mot EK 74,0 USD), skatt 59,06 % effektiv (betalt 7,53 mdr — olje-/gassektorns strukturella skattebas), Altman n/a (källan), Piotroski 8, anställda 93 700, institutions 77,99 %, insiders 0,01 %, beta −0,22 (5Y — negativ: universumets ovanligaste signatur), 52-v 399,40–609,40 (+33,31 % källans 52-v-fält, −8,4 % från toppen); TTM (M USD): rev 215 465 netto 5 426 EPS 0,34 (GBP-vyn 162,4/4,09/0,26 — FX 1,3267 trippelbevisad rev+netto+brutto); FY-serier kalenderår (M USD): rev 156 431→239 067→208 351→187 386→187 637 (+4,65 %/år — 2022-toppen i banan), netto 7 563→−2 488→15 238→439→5 (endpoint −84,0 % = endpoint-fällan på cykeltoppsbasen; −2 488 = Rosneft-exiten 2022, 439/5 = raffinaderi-/nedskrivningsåren, TTM 5 426 = återhämtningen), bruttomarginalserie 24,12/29,07/30,74/25,04/27,38 % (medel 27,27 %), ek totalt 90 439→82 990→85 493→78 318→74 000 (common 75 442→53 031, minoritet 14 976→20 948), fcf 12 725→28 863→17 754→12 000→11 272 (5/5 positiva, varje år OCF−capex EXAKT); aktiebas 19 641→15 377 M (−21,7 % = återköpsmaskinen, −5,94 %/år; buyback-serie 3 177→10 000→7 919→7 149→4 486 mdr USD); utdelning 0,26 GBP (4,58 %) DPS-trappa 0,18624→0,22329→0,23721→0,24508→0,26 (5 raka tillväxtår, kvartalsvis, senaste ex 2026-08-13), payout 93,66 % källans, återköp buyback-yield 3,31 %, shareholder yield 7,89 %; nästa rapport 2026-10-30" },
      { namn: "Yahoo Finance (chart-API)", hamtat: HAMTAT, url: "https://query1.finance.yahoo.com/v8/finance/chart/BP.L", paranoid: "paranoid kurskoll via WebFetch-kanal (curl-IP rate-limitad 429, dokumenterat): Yahoo 09-18 558,70 GBp mot SA 558,70 GBX = 0,00 % band (identisk close, sista minutstrecket 558,70 vid 16:30 London); dagens spannn 553,1–562,3 på volym 65,6 M; previousClose 564,0 (−0,94 % på dagen)" },
    ],
    hamtat: HAMTAT, pris, marknadsKapitalMdr: 86.33,
    tillvaxt: { omsattningCAGR5ar: +omsCagr.toFixed(4), resultatCAGR5ar: +resCagr.toFixed(4), omsattningTillvaxtTTM: 0.16, prognosTillvaxt: +prognos.toFixed(4) },
    lonksamhet: { roe, roic, bruttoMarginal: bruttoM, ebitMarginal: ebitM, nettoMarginal: nettoM, fcfMarginal: fcfM },
    stabilitet: { skuldEgenkapital: de, rantaTackning: rantack, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: +(mcap * buybackY).toFixed(3), andelUtestande: 0.0001, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: +bmMedel.toFixed(2), bruttoMarginalSpread5ar: +(Math.max(...bm) - Math.min(...bm)).toFixed(2), roeMedel5ar: null },
    vardering: { pe, pb, evEbit, peg: null, fcfYield: +(fcfGBP / mcap).toFixed(4), egenKapitalMultipl: pb },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: omsSerie.map((x) => x * 1e6), resultat: resSerie.map((x) => x * 1e6), egetKapital: ekSerie.map((x) => x * 1e6), fcf: fcfSerie.map((x) => x * 1e6) },
    notering: "Kalenderårsbokslut (31 dec, USD-rapportvaluta; GBX-noting enl. HSBA.L/BA.L-precedensen); SUPERMAJOR-KVINTETTEN KOMPLETT: BP · CVX Chevron · XOM ExxonMobil · SHEL Shell · TTE TotalEnergies — världens fem klassiska supermajors nu alla i universumet (SHEL USA-klassad enl. NYSE-primärnoting-konventionen; BP.L bär Storbritannien/energi-cellen 0→1 = världens 6:e största börsekonomi fick energigrenen, UK 5→6 grenar); FYND 1 — VÄNDNINGSMULTIPLENS OLJE-UPPLAGA: netto-serien 7 563→−2 488→15 238→439→5→TTM 5 426 M USD (Rosneft-exiten 2022 · efterpandemi-toppen 2023 · raffinaderi-/nedskrivningsåren 2024-25 · TTM-återhämtningen) med P/E 21,51 mot forward 8,08 = prognosgap som bär lektionen: trailing-multipeln är DYRAST i kvintetten, framåtblickanden BILLIGASTE (8,08 under TTE 11,32 och SHEL 10,27) — vinstcykeln, inte värdefallen, är utbildningsfrågan (FCX/S32-klassen); FYND 2 — ÅTERKÖPSMASKINEN: aktiebasen 19 641→15 377 M (−21,7 % fyra år, −5,94 %/år) med buyback-bågen 3,2→10,0→7,9→7,1→4,5 mdr USD + DPS-trappan 18,6→26,0 p (5 raka år) = shareholder yield 7,89 %; FYND 3 — endpoint-fällans klassrum: resultatCAGR −84,0 % formell på FY2021-cykeltoppsbasen — energigrenens gemensamma läxa (EQNR −44,0 · Ørsted −50,9 · CVX −29,7 · SHEL −25,0 på samma basval), TTM 5 426 dokumenterar varför endpoint-CAGR inte är en prognos; FYND 4 — negativ beta −0,22 (5Y, källans fält): olje-/gasbalansen mot börsmarknadens svängningar — universumets uvanligaste betasignatur, pedagogiskt kontrastfall till ITUB 0,14; bruttomarginalens vågband 24,1→30,7 % (medel 27,3, spread 6,6 pp) = prissatt råvarumoat mot mjukvarumoatens 74,8/±2,0 (CRWD-kontrasten i samma leveransfamilj); fcf 5/5 positiva med varje års OCF−capex EXAKT; P/B 1,50 på total-EK (minoritet 20,9 mdr USD) med common-bas 2,16 dokumenterad (AMT-precedensen); skatt 59,06 % effektiv — olje-/gassektorns strukturella skattebas som marginałförklarare; nästa rapport 2026-10-30 (Q3).",
  };
})();

// ── Grindutvärdering ──
const antalGröna = granslar.filter((g) => g.startsWith("GRÖN")).length;
const antalRöda = granslar.filter((g) => g.startsWith("RÖD")).length;
console.log(granslar.join("\n"));
console.log(`\nARITMETIKGRIND: ${antalGröna} GRÖNA / ${antalRöda} RÖDA av ${granslar.length}`);
if (abort) { console.log("ABORT — filen orörd, rättning krävs."); process.exit(1); }
mkdirSync("/tmp/s2u1o23", { recursive: true });
writeFileSync("/tmp/s2u1o23/rader-nya.json", JSON.stringify([bp], null, 1));
console.log("→ /tmp/s2u1o23/rader-nya.json skriven (1 rad, alla fält maskinräknade)");
