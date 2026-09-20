// S2-U3 OMG22 — radbyggare + aritmetikgrind för CMCSA + AMT + CRWD
// Alla härledda fält räknas maskinellt ur källtalen; avvikelse > tolerans ⇒ ABORT (före disk).
import { writeFileSync } from "node:fs";

const HAMTAT = "2026-09-20";
const AS_OF = "close 2026-09-18 (SA-statistics uppdaterad 2026-09-19)";
const granslar = [];
let abort = false;
const kraav = (id, villkor, detalj) => {
  granslar.push(`${villkor ? "GRÖN" : "RÖD"} ${id}${detalj ? " — " + detalj : ""}`);
  if (!villkor) abort = true;
};
const pct = (a, b) => Math.abs(a - b) / Math.abs(b); // relativ avvikelse
const cagr = (forsta, sista) => Math.pow(sista / forsta, 0.25) - 1;

// ─────────────────────────────────────────────────────────────────────────────
// CMCSA — Comcast Corporation (kommunikation/USA, NASDAQ, USD, dec-bokslut)
// Källa: SA översikt+statistics+financials+BS+CF+dividend, underlag S&P GMI
// ─────────────────────────────────────────────────────────────────────────────
const cmcsa = (() => {
  const pris = 22.74, mcap = 80.70, aktier = 3.55; // mdr aktier
  const pe = 7.36, peFwd = 6.53, pb = 0.90, evEbit = 8.92, ps = 0.65, evEbitda = 4.80;
  const revTTM = 124904, bruttoTTM = 86671, ebitTTM = 18313, nettoTTM = 11199, epsTTM = 3.09;
  const fcfTTM = 20436, ocfTTM = 32517, capexTTM = 12081;
  const roe = 0.1149, roic = 0.0815, wacc = 0.0570;
  const bruttoM = 0.6939, ebitM = 0.1466, nettoM = 0.0897, fcfM = 0.1636;
  const de = 1.00, rantack = 4.16;
  const ekSerie = [98009, 82038, 83467, 86274, 97376]; // FY21-25, mkr — TTM 89955
  const omsSerie = [116385, 121427, 121572, 123731, 123707];
  const resSerie = [14159, 5370, 15388, 16192, 19998];
  const bruttoSerie = [77935, 83214, 84810, 86705, 88756];
  const fcfSerie = [18996, 15457, 16122, 15376, 21882];
  const dps = 1.32, yieldUtd = 0.0581, payout = 0.4273, buybackY = 0.0474;
  const yahoo = 22.74;

  // GRIND: identiteter
  kraav("CM1 mcap-aktiebas", pct(pris * aktier, mcap) < 0.03, `${(pris * aktier).toFixed(2)} mdr mot ${mcap}`);
  kraav("CM2 P/E-aktiebas", pct(pris / epsTTM, pe) < 0.03, `${(pris / epsTTM).toFixed(2)} mot ${pe}`);
  kraav("CM3 P/B-ekvibas", pct(mcap * 1000 / 89955, pb) < 0.03, `${(mcap * 1000 / 89955).toFixed(3)} mot ${pb} (TTM-EK 89 955 — källans bas, statistics 'Equity Book Value' 89,96 mdr)`);
  kraav("CM4 Yahoo-kurs", pct(yahoo, pris) < 0.01, `${yahoo} mot ${pris}`);
  kraav("CM5 bruttomarginal", pct(bruttoTTM / revTTM, bruttoM) < 0.01, `${(bruttoTTM / revTTM * 100).toFixed(2)} % mot ${bruttoM * 100} %`);
  kraav("CM6 EBIT-marginal", pct(ebitTTM / revTTM, ebitM) < 0.01, `${(ebitTTM / revTTM * 100).toFixed(2)} %`);
  kraav("CM7 nettomarginal", pct(nettoTTM / revTTM, nettoM) < 0.01, `${(nettoTTM / revTTM * 100).toFixed(2)} %`);
  kraav("CM8 FCF-konvention", pct((ocfTTM - capexTTM) / 1e3, fcfTTM / 1e3) < 0.01, `${ocfTTM - capexTTM} mot ${fcfTTM}`);
  kraav("CM9 fcfYield", pct(fcfTTM / 1e3 / mcap, 0.2532) < 0.02, `${(fcfTTM / 1e3 / mcap * 100).toFixed(2)} % mot källans 25,32 %`);
  const prognos = pe / peFwd - 1;
  kraav("CM10 prognosTillvaxt", prognos > 0 && prognos < 0.5, `+${(prognos * 100).toFixed(1)} %`);
  const omsCagr = cagr(omsSerie[0], omsSerie[4]);
  const resCagr = cagr(resSerie[0], resSerie[4]);
  kraav("CM11 omsCAGR", omsCagr > 0 && omsCagr < 0.1, `+${(omsCagr * 100).toFixed(2)} %`);
  kraav("CM12 resCAGR-positiv", resCagr > 0 && resCagr < 0.3, `+${(resCagr * 100).toFixed(2)} % (FY22-dippen ${resSerie[1]} i serien)`);
  const bm = bruttoSerie.map((g, i) => g / omsSerie[i] * 100);
  const bmMedel = bm.reduce((a, b) => a + b, 0) / 5;
  kraav("CM13 moat-medel", bmMedel > 60 && bmMedel < 80, `${bmMedel.toFixed(2)} % (serie ${bm.map(x => x.toFixed(1)).join("/")})`);
  const utdTotMdr = dps * aktier; // års-DPS × aktier
  kraav("CM14 utdelningsvolym", pct(utdTotMdr, mcap * yieldUtd) < 0.03, `${utdTotMdr.toFixed(2)} mdr mot ${mcap * yieldUtd} mdr`);
  const fcfPos = fcfSerie.filter(x => x > 0).length;
  kraav("CM15 fcfPositiva", fcfPos === 5, `${fcfPos}/5`);

  return {
    ticker: "CMCSA", namn: "Comcast Corporation", bransch: "kommunikation", land: "USA", valuta: "USD",
    kallor: [
      { namn: "StockAnalysis", hamtat: HAMTAT, url: "https://stockanalysis.com/stocks/cmcsa/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)", paranoid: "NASDAQ-noting i USD; S&P GMI-underlag, " + AS_OF + ": pris 22,74 USD, mcap 80,70 mdr (aktiebas 22,74×3 550 M = 80,73 = +0,04 %), P/E 7,36 (aktiebas 22,74÷3,09 = 7,36 EXAKT) forward 6,53 ⇒ prognosTillväxt +12,7 % TTE (källans PEG-fält n/a — 3-års-EPS-prognos −3,72 % som not), P/B 0,90 (80,70÷89,955 = 0,897 EXAKT mot TTM-EK), PS 0,65, EV/EBITDA 4,80, EV/EBIT 8,92 med EV 163,42 mdr (nettoskuld 82,72 = kabelmodellens skuldbälte, D/E 1,00 skuld 90,38 mot EK 89,96), marginaler TTM: brutto 69,39 % EBIT 14,66 % netto 8,97 % FCF 16,36 % (OCF 32,52 − capex 12,08 = 20,44 mdr, fcfYield 25,32 % källans fält), ROE 11,49 % ROIC 8,15 % MOT WACC 5,70 % (spread +2,5 pp), räntetäckning 4,16×, Altman 1,4 (kabelbalansens signatur — kontantflödet bär, inte Z-scoren), skatt 22,95 %, anställda 179 000, institutions 90,36 %, insiders 0,94 %, beta 0,66, 52-v 21,28–32,86 (−29,9 % — universumets communications-dipp); TTM (M USD): rev 124 904 (+0,58 %) netto 11 199 EPS 3,09; FY-serier kalenderår (M USD): rev 116 385→121 427→121 572→123 731→123 707 (+1,5 %/år), netto 14 159→5 370→15 388→16 192→19 998 (+9,0 %/år endpoint; FY2022-botten 5 370 = Sky/NBCU-nedskrivningar), bruttomarginalserie 66,97→68,52→69,76→70,08→71,74 % (medel 69,41 % — stigande moat-bana), ek 98 009→82 038→83 467→86 274→97 376, fcf 18 996→15 457→16 122→15 376→21 882 (5/5 positiva); utdelning 1,32 USD (5,81 %) DPS-trappa 1,00→1,08→1,16→1,24→1,32 (kvartal 0,25→0,33, 6 år tillväxt, payout 42,7 %), återköp buyback-yield 4,74 % (≈3,8 mdr TTM, aktieantalet −4,74 % YoY), shareholder yield 10,55 %; ROIC−WACC +2,5 pp; nästa rapport 2026-10-22 FÖRE öppning" },
      { namn: "Yahoo Finance (chart-API)", hamtat: HAMTAT, url: "https://query1.finance.yahoo.com/v8/finance/chart/CMCSA", paranoid: "paranoid kurskoll via WebFetch-kanal (curl-IP rate-limitad 429, dokumenterat): Yahoo 09-18 22,74 mot SA 22,74 = 0,00 % band (identisk close); serie 09-14 24,88 · 09-15 24,42 · 09-16 23,73 · 09-17 22,91 · 09-18 22,74 kalibrerar nedåtbanan" },
    ],
    hamtat: HAMTAT, pris, marknadsKapitalMdr: 80.7,
    tillvaxt: { omsattningCAGR5ar: +omsCagr.toFixed(4), resultatCAGR5ar: +resCagr.toFixed(4), omsattningTillvaxtTTM: 0.0058, prognosTillvaxt: +prognos.toFixed(4) },
    lonksamhet: { roe, roic, bruttoMarginal: bruttoM, ebitMarginal: ebitM, nettoMarginal: nettoM, fcfMarginal: fcfM },
    stabilitet: { skuldEgenkapital: de, rantaTackning: rantack, fcfPositivaSenaste5: fcfPos, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: +(mcap * buybackY).toFixed(3), andelUtestande: 0.0094, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: +bmMedel.toFixed(2), bruttoMarginalSpread5ar: +(Math.max(...bm) - Math.min(...bm)).toFixed(2), roeMedel5ar: null },
    vardering: { pe, pb, evEbit, peg: +(pe / (prognos * 100)).toFixed(2), fcfYield: +(fcfTTM / 1e3 / mcap).toFixed(4), egenKapitalMultipl: pb },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: omsSerie.map(x => x * 1e6), resultat: resSerie.map(x => x * 1e6), egetKapital: ekSerie.map(x => x * 1e6), fcf: fcfSerie.map(x => x * 1e6) },
    notering: "Kalenderårsbokslut (31 dec); USA:s största kabel-/bredbandsoperatör (Connectivity & Platforms) + NBCUniversal/Peacock + Universal-temaparker — segmentbrottet är sidans pedagogiska kärna: anslutningsrörelsen bär moaten ( Residential+Business ~2/3 av EBITDA) medan media/temaparker bär svängningarna; FYND: TTM-vinsten HALVERAD (netto 11,2 mdr mot FY2025:s 20,0, EPS −48,6 %) medan kursen −29,9 % ⇒ P/E 7,36 = kommunikationscellens LÄGSTA multipel (under AT&T 8,59) — vinstcykeln, inte värdefälla i sig, är utbildningsfrågan; P/E 7,36 mot EV/EBITDA 4,80 visar skuldens roll: kabelvärdering lever i EV/EBITDA-världen (D/E 1,00, Altman 1,4 — kontantflödesbolagets balans); utdelning 1,32 USD 5,81 % (6 års tillväxt, payout 42,7 %) + återköp 4,74 %/år (aktiebas −4,7 % YoY) = shareholder yield 10,55 % på P/FCF 3,95; prognosTillväxt ur trailing/fwd-P/E (7,36/6,53 ⇒ +12,7 % implicit ettårs-EPS); peg 0,58 spårkonvention (källans PEG n/a på 3-årsbasen −3,72 % — teckenvänd konvention som not); bruttomarginalbanan 67,0→71,7 % fem år = moaten fördjupas; fcfYield 25,3 % på 20,4 mdr FCF.",
  };
})();

// ─────────────────────────────────────────────────────────────────────────────
// AMT — American Tower Corporation (fastighet/USA, NYSE, USD, dec-bokslut)
// REIT-konventionen: utdelning/payout/capex-etalogi ur källans REIT-vy
// ─────────────────────────────────────────────────────────────────────────────
const amt = (() => {
  const pris = 173.98, mcap = 81.07, aktier = 465.96; // M aktier
  const pe = 23.93, peFwd = 25.93, pb = 21.79, evEbit = 24.99, ps = 7.41, evEbitda = 17.64, pegKalla = 24.99;
  const revTTM = 10942, bruttoTTM = 8070, ebitTTM = 4970, nettoTTM = 3401, epsTTM = 7.27;
  const fcfTTM = 3960, ocfTTM = 5775, reCapexTTM = 1815; // capex = Acquisition of Real Estate Assets
  const roe = 0.3391, roic = 0.0803, wacc = 0.0689;
  const bruttoM = 0.7377, ebitM = 0.4545, nettoM = 0.3108, fcfM = 0.3619;
  const de = 4.39, rantack = 3.57;
  const ekSerie = [9070, 12409, 10865, 9649, 10355]; // FY21-25 total — common: 5081→5572→4198→3382→3653 (minority 3988→6836→6667→6267→6703)
  const omsSerie = [9357, 9645, 10012, 10127, 10645];
  const resSerie = [2568, 1766, 1483, 2255, 2530];
  const fcfSerie = [3633, 2018, 2802, 2762, 2829]; // källans FCF-rad (definitionsnot)
  const dps = 7.16, yieldUtd = 0.0412, payout = 0.9849, buybackY = 0.0019;
  const yahoo = 173.98;

  kraav("AM1 mcap-aktiebas", pct(pris * aktier / 1000, mcap) < 0.03, `${(pris * aktier / 1000).toFixed(2)} mdr mot ${mcap}`);
  kraav("AM2 P/E-aktiebas", pct(pris / epsTTM, pe) < 0.03, `${(pris / epsTTM).toFixed(2)} mot ${pe}`);
  kraav("AM3 P/B-common-ekvibas", pct(mcap * 1000 / 3653, pb) < 0.03, `${(mcap * 1000 / 3653).toFixed(2)} mot ${pb} (P/B på COMMON equity — minority 6,5 mdr ej med)`);
  kraav("AM4 Yahoo-kurs", pct(yahoo, pris) < 0.01, `${yahoo} mot ${pris}`);
  kraav("AM5 bruttomarginal", pct(bruttoTTM / revTTM, bruttoM) < 0.01, `${(bruttoTTM / revTTM * 100).toFixed(2)} %`);
  kraav("AM6 EBIT-marginal", pct(ebitTTM / revTTM, ebitM) < 0.01, `${(ebitTTM / revTTM * 100).toFixed(2)} %`);
  kraav("AM7 nettomarginal", pct(nettoTTM / revTTM, nettoM) < 0.01, `${(nettoTTM / revTTM * 100).toFixed(2)} %`);
  kraav("AM8 FCF-konvention", pct((ocfTTM - reCapexTTM) / 1e3, fcfTTM / 1e3) < 0.01, `OCF 5 775 − RE-capex 1 815 = 3 960 mot källans FCF-yta 3,96 mdr EXAKT (CF-panelens FCF-radserie 2 829 FY25 bär bredare definitionsbas — not)`);
  kraav("AM9 fcfYield", pct(fcfTTM / 1e3 / mcap, 0.0488) < 0.02, `${(fcfTTM / 1e3 / mcap * 100).toFixed(2)} % mot källans 4,88 %`);
  const prognos = pe / peFwd - 1; // NEGATIV
  kraav("AM10 prognosTillvaxt-negativ", prognos < 0 && prognos > -0.3, `${(prognos * 100).toFixed(1)} % ⇒ PEG null (BUD/FMG-konventionen)`);
  const omsCagr = cagr(omsSerie[0], omsSerie[4]);
  const resCagr = cagr(resSerie[0], resSerie[4]);
  kraav("AM11 omsCAGR", omsCagr > 0 && omsCagr < 0.1, `+${(omsCagr * 100).toFixed(2)} %`);
  kraav("AM12 resCAGR-nära-noll", resCagr > -0.05 && resCagr < 0.02, `${(resCagr * 100).toFixed(2)} % (endpoint 2 568→2 530 — FY-banan bär räntechocken)`);
  const utdTotMdr = dps * aktier / 1000;
  kraav("AM13 utdelningsvolym", pct(utdTotMdr, mcap * yieldUtd) < 0.03, `${utdTotMdr.toFixed(2)} mdr mot ${mcap * yieldUtd} mdr; payout ${payout * 100} % = REIT-lagen`);
  const fcfPos = fcfSerie.filter(x => x > 0).length;
  kraav("AM14 fcfPositiva", fcfPos === 5, `${fcfPos}/5`);

  return {
    ticker: "AMT", namn: "American Tower Corporation", bransch: "fastighet", land: "USA", valuta: "USD",
    kallor: [
      { namn: "StockAnalysis", hamtat: HAMTAT, url: "https://stockanalysis.com/stocks/amt/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)", paranoid: "NYSE-noting i USD; S&P GMI-underlag, " + AS_OF + ": pris 173,98 USD, mcap 81,07 mdr (aktiebas 173,98×465,96 M = 81,07 EXAKT), P/E 23,93 (aktiebas 173,98÷7,27 = 23,93 EXAKT) forward 25,93 ⇒ prognosTillväxt NEGATIV −7,7 % TTE (fwd>trailing — BUD/FMG-konventionen) ⇒ PEG null (källans PEG-fält 24,99 som not), PS 7,41, P/B 21,79 PÅ COMMON EQUITY 3 653 M USD (totalt EK 10 355 inkl. 6 703 M minority = funding trusts — REIT-strukturens signatur; P/B som jämförelsemått meningslöst för REIT, dokumenterat), EV/EBITDA 17,64 EV/EBIT 24,99 med EV 124,29 mdr (nettoskuld 43,22, D/E 4,39 skuld 44,98 mdr), marginaler TTM: brutto 73,77 % EBIT 45,45 % netto 31,08 % FCF 36,19 % (OCF 5 775 − RE-capex 1 815 = 3 960 mdr = källans FCF-yta EXAKT; CF-panelens FCF-radserie 3 633→2 018→2 802→2 762→2 829 bär bredare definitionsbas — BAS-SPLITTRA-noten), ROE 33,91 % på den tunna common-eken, ROIC 8,03 % MOT WACC 6,89 % (spread +1,1 pp), räntetäckning 3,57×, skatt 10,83 % (REIT-pass-through), anställda 4 866, institutions 96,28 % (universumets högsta klass), insiders 0,18 %, beta 0,90, 52-v 160,06–197,41 (−11,8 %); TTM (M USD): rev 10 942 (+6,65 %) netto 3 401 EPS 7,27 (TTM-utdelningar per aktie slår EPS: 7,16 mot 7,27); FY-serier kalenderår (M USD): rev 9 357→9 645→10 012→10 127→10 645 (+3,3 %/år), netto 2 568→1 766→1 483→2 255→2 530 (−0,4 %/år endpoint — FY2022-23-botten = räntechockens REIT-matematik, netto +89 % från FY2023 till TTM), ek totalt 9 070→12 409→10 865→9 649→10 355 (common 5 081→5 572→4 198→3 382→3 653), fcf 3 633→2 018→2 802→2 762→2 829 (5/5 positiva); utdelning 7,16 USD (4,12 %) DPS-trappa kvartal 1,39→1,79 (14 års tillväxt, payout 98,49 % = REIT-utdelningslagen 90 %+), återköp buyback-yield 0,19 %, D&A 2 071 M = 19 % av intäkten (tornens avskrivningsmaskin); nästa rapport Q3 2026-10-29 (est)" },
      { namn: "Yahoo Finance (chart-API)", hamtat: HAMTAT, url: "https://query1.finance.yahoo.com/v8/finance/chart/AMT", paranoid: "paranoid kurskoll via WebFetch-kanal (curl-IP rate-limitad 429, dokumenterat): Yahoo 09-18 173,98 mot SA 173,98 = 0,00 % (identisk close); serie 09-14 176,94 · 09-15 177,71 · 09-16 176,39 · 09-17 175,58 · 09-18 173,98" },
    ],
    hamtat: HAMTAT, pris, marknadsKapitalMdr: 81.07,
    tillvaxt: { omsattningCAGR5ar: +omsCagr.toFixed(4), resultatCAGR5ar: +resCagr.toFixed(4), omsattningTillvaxtTTM: 0.0665, prognosTillvaxt: +prognos.toFixed(4) },
    lonksamhet: { roe, roic, bruttoMarginal: bruttoM, ebitMarginal: ebitM, nettoMarginal: nettoM, fcfMarginal: fcfM },
    stabilitet: { skuldEgenkapital: de, rantaTackning: rantack, fcfPositivaSenaste5: fcfPos, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: +(mcap * buybackY).toFixed(3), andelUtestande: 0.0018, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
    vardering: { pe, pb, evEbit, peg: null, fcfYield: +(fcfTTM / 1e3 / mcap).toFixed(4), egenKapitalMultipl: pb },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: omsSerie.map(x => x * 1e6), resultat: resSerie.map(x => x * 1e6), egetKapital: ekSerie.map(x => x * 1e6), fcf: fcfSerie.map(x => x * 1e6) },
    notering: "Kalenderårsbokslut (31 dec); REIT — världens största telekom-tornoperatör (~148 000 sajter, hyreskontrakt i luften): P/B 21,79 mäter common-eken 3,7 mdr medan totalt EK 10,4 mdr bär 6,7 mdr minority (funding trusts) — REIT:s P/B-jämförelse meningslös, fcfYield 4,88 % och EV/EBITDA 17,64 bär bilden (BLK/AXA-förvaltarstrukturens spegelbild: fältet bär källans common-bas); payout 98,49 % = REIT-utdelningslagen (90 %+ av beskattningsbar inkomst) — utdelningen 7,16 USD (4,12 %, 14 års tillväxt) är LAGSTYRD, inte diskretionär; capex-etiketten är 'Acquisition of Real Estate Assets' (REIT-konventionen) 1,8 mdr/år mot OCF 5,8 mdr; prognosgapet NEGATIVT (fwd 25,93 > trailing 23,93 ⇒ −7,7 %) = fastighetscellens enda negativa — PEG null enligt BUD/FMG-konventionen (källans PEG 24,99 som not); D/E 4,39 + räntetäckning 3,57 = räntekänsligheten (10-åriga tekniska livslängden på tornen mot 5-åriga hyresavtal); ROE 33,9 % på common-tunn EK kontra ROIC 8,0 % — golv- och takmått på samma balans; nettoresultatbanan 2 568→1 766→1 483→2 255→2 530→TTM 3 401 = räntechock + återhämtning i en serie.",
  };
})();

// ─────────────────────────────────────────────────────────────────────────────
// CRWD — CrowdStrike Holdings (tillvaxt/USA, NASDAQ, USD, jan-bokslut)
// SaaS-konventionen: GAAP-förlust vs FCF-styrka; P/E 5 420 = multiplens gränsfall
// ─────────────────────────────────────────────────────────────────────────────
const crwd = (() => {
  const pris = 237.65, mcap = 243.86, aktier = 1026; // M aktier (1,03 mdr)
  const pe = 5419.71, peFwd = 168.49, pb = 47.69, ps = 45.19;
  const revTTM = 5396, bruttoTTM = 4057, ebitTTM = -133.18, nettoTTM = 45.0, epsTTM = 0.04;
  const fcfTTM = 1609, ocfTTM = 2017, capexTTM = 407.9;
  const roe = 0.0146, roic = -0.1410, wacc = 0.1112;
  const bruttoM = 0.7519, ebitM = -0.0247, nettoM = 0.0083, fcfM = 0.2981;
  const de = 0.16, rantack = -5.0;
  const ekSerie = [1038, 1487, 2337, 3319, 4473]; // FY22-26 (jan-bokslut)
  const omsSerie = [1452, 2241, 3056, 3954, 4812];
  const resSerie = [-234.8, -183.25, 72.18, -15.24, -162.5];
  const bruttoSerie = [1068, 1640, 2297, 2963, 3600];
  const fcfSerie = [462.64, 705.99, 989.68, 1127, 1310];
  const sbcTTM = 1244, nettkassaMdr = 4.19;
  const yahoo = 237.65;

  kraav("CR1 mcap-aktiebas", pct(pris * aktier / 1000, mcap) < 0.03, `${(pris * aktier / 1000).toFixed(2)} mdr mot ${mcap}`);
  kraav("CR2 P/E-mikro-EPS", pct(pris / epsTTM, pe) < 0.5, `${(pris / epsTTM).toFixed(0)} mot ${pe} — EPS 0,04 rundad: aktiebasen reder ut mikro-EPS (källans fält bär)`);
  kraav("CR3 P/B-ekvibas", pct(mcap * 1000 / 5140, pb) < 0.03, `${(mcap * 1000 / 5140).toFixed(2)} mot ${pb} (TTM-EK 5 140 — källans bas; FY-jan-ek 4 473 ger 54,5 = BAS-SPLITTRA-noten)`);
  kraav("CR4 Yahoo-kurs", pct(yahoo, pris) < 0.01, `${yahoo} mot ${pris}`);
  kraav("CR5 bruttomarginal", pct(bruttoTTM / revTTM, bruttoM) < 0.01, `${(bruttoTTM / revTTM * 100).toFixed(2)} %`);
  kraav("CR6 EBIT-marginal-negativ-precedens", ebitM < 0 && ebitM > -0.05, `${(ebitM * 100).toFixed(2)} % — negativ EBIT-marginal med positivt netto: precedens ELUX-B/BILL/PCELL/PSNY/BA/KLAR`);
  kraav("CR7 nettomarginal", pct(nettoTTM / revTTM, nettoM) < 0.01, `${(nettoTTM / revTTM * 100).toFixed(3)} %`);
  kraav("CR8 FCF-konvention", pct((ocfTTM - capexTTM) / 1e3, fcfTTM / 1e3) < 0.01, `${(ocfTTM - capexTTM).toFixed(1)} mot ${fcfTTM}`);
  kraav("CR9 fcfYield", pct(fcfTTM / 1e3 / mcap, 0.0066) < 0.05, `${(fcfTTM / 1e3 / mcap * 100).toFixed(2)} % mot källans 0,66 %`);
  const prognos = pe / peFwd - 1;
  kraav("CR10 prognosTillvaxt-formell", prognos > 1, `+${(prognos * 100).toFixed(0)} % FORMELLT (mikro-EPS gör formeln tom som mått — PEG null-markering med not; källans PEG 5,75 på 3-årsbas)`);
  const omsCagr = cagr(omsSerie[0], omsSerie[4]);
  kraav("CR11 omsCAGR", omsCagr > 0.3 && omsCagr < 0.4, `+${(omsCagr * 100).toFixed(2)} %`);
  const resCagr = null; // negativ → negativ endpoint: OSATT (BASF-precedensen)
  kraav("CR12 resCAGR-osatt", resSerie[0] < 0 && resSerie[4] < 0, "endpoint −234,8→−162,5 M USD: CAGR osatt (negativt startvärde, BASF-precedensen)");
  const bm = bruttoSerie.map((g, i) => g / omsSerie[i] * 100);
  const bmMedel = bm.reduce((a, b) => a + b, 0) / 5;
  kraav("CR13 moat-medel", bmMedel > 70 && bmMedel < 80, `${bmMedel.toFixed(2)} % (serie ${bm.map(x => x.toFixed(1)).join("/")})`);
  kraav("CR14 fcfPositiva", fcfSerie.filter(x => x > 0).length === 5, `5/5: ${fcfSerie.join("/")} — växande varje år`);
  kraav("CR15 netto>0-P/E-bärare", nettoTTM > 0, `netto +45,0 M USD = P/E-bärare (5 419,71) — Sony-fällan passerad`);

  return {
    ticker: "CRWD", namn: "CrowdStrike Holdings, Inc.", bransch: "tillvaxt", land: "USA", valuta: "USD",
    kallor: [
      { namn: "StockAnalysis", hamtat: HAMTAT, url: "https://stockanalysis.com/stocks/crwd/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)", paranoid: "NASDAQ-noting i USD; S&P GMI-underlag, " + AS_OF + ": pris 237,65 USD, mcap 243,86 mdr (aktiebas 237,65×1 026 M = 243,8 = tight), P/E 5 419,71 (TTM-netto +45,0 M USD, EPS 0,04 — MIKRO-EPS: multiplens gränsfall) forward 168,49, PS 45,19, P/B 47,69 (243,86÷4,473 = 54,5 på FY-ek; TTM-ek 5,14 ⇒ 47,4 — källans fält bär TTM-basen), P/TBV 103,29, P/FCF 151,59, EV/EBITDA 2 242,78 med EV 239,67 mdr UNDER mcap (NETTKASSA 4,19 mdr: kassa 5,01 mot skuld 0,82), EV/EBIT n/a (EBIT negativt), marginaler TTM: brutto 75,19 % EBIT −2,47 % netto +0,83 % FCF 29,81 % — GAAP-operativ förlust med positivt netto ENDAST via finansnetto (ränteintäkter på nettkassan) och skatt −1,18 M: SaaS-konventionens kärna i en vy, FCF 1 609 M (OCF 2 017 − capex 408) mot netto 45 M = 36× skillnad, ROE 1,46 % ROIC −14,10 % MOT WACC 11,12 % (spread −25,2 pp — GAAP-linsens dom), D/E 0,16, räntetäckning −5,00 (källans fält på negativ EBIT — meningslöst som täckningsmått, bärs med not), skatt n/a (−1,18 M), anställda 10 698, institutions 77,72 %, insiders 1,56 %, beta 1,26, 52-v 85,68–250,32 (+113,4 % — cellens största ettårsrörelse); TTM (M USD): rev 5 396 (+24,3 %) brutto 4 057; FY-serier jan-bokslut (M USD, årsetikett = slutår enl. WMT/BHP-konvention): rev 1 452→2 241→3 056→3 954→4 812 (+34,9 %/år), brutto 1 068→1 640→2 297→2 963→3 600, EBIT −142,6→−190,1→−19,1→−116,4→−248,5 (GAAP-förlusten består — SBC bär den), netto −234,8→−183,3→+72,2→−15,2→−162,5 (FY2024 = juli-incidentens räddningskvartal +248 % årsomgång, endpoint CAGR osatt), ek 1 038→1 487→2 337→3 319→4 473 (SBC-byggd), fcf 462,6→706,0→989,7→1 127→1 310 (5/5 växande — tillväxtcellens renaste FCF-bana), SBC 1 244 M TTM = 23 % av intäkten mot aktieökning +3,24 % (buyback-yield −3,24 % = netto-dilution); ingen utdelning; nästa rapport Q3 FY2027 ~2026-12 (senaste 2026-08-26)" },
      { namn: "Yahoo Finance (chart-API)", hamtat: HAMTAT, url: "https://query1.finance.yahoo.com/v8/finance/chart/CRWD", paranoid: "paranoid kurskoll via WebFetch-kanal (curl-IP rate-limitad 429, dokumenterat): Yahoo 09-18 237,65 mot SA 237,65 = 0,00 % (identisk close); serie 09-14 235,38 · 09-15 242,49 · 09-16 241,36 · 09-17 245,70 · 09-18 237,65" },
    ],
    hamtat: HAMTAT, pris, marknadsKapitalMdr: 243.86,
    tillvaxt: { omsattningCAGR5ar: +omsCagr.toFixed(4), resultatCAGR5ar: null, omsattningTillvaxtTTM: 0.243, prognosTillvaxt: +prognos.toFixed(4) },
    lonksamhet: { roe, roic, bruttoMarginal: bruttoM, ebitMarginal: ebitM, nettoMarginal: nettoM, fcfMarginal: fcfM },
    stabilitet: { skuldEgenkapital: de, rantaTackning: rantack, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: 0, andelUtestande: 0.0156, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: +bmMedel.toFixed(2), bruttoMarginalSpread5ar: +(Math.max(...bm) - Math.min(...bm)).toFixed(2), roeMedel5ar: null },
    vardering: { pe, pb, evEbit: null, peg: null, fcfYield: +(fcfTTM / 1e3 / mcap).toFixed(4), egenKapitalMultipl: pb },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2022", "2023", "2024", "2025", "2026"], omsattning: omsSerie.map(x => x * 1e6), resultat: resSerie.map(x => x * 1e6), egetKapital: ekSerie.map(x => x * 1e6), fcf: fcfSerie.map(x => x * 1e6) },
    notering: "Januari-bokslut (31 jan; WMT/BHP-konventionen — årsetikett = slutår, FY2026 slutade 31 jan 2026); cybersäkerhetens flaggskepp (Falcon-plattformen, single-agent-arkitekturen) = universumets FÖRSTA cyber-säkerhetsrad — sektorn saknades helt; FYND 1 — multiplens gränsfall: P/E 5 419,71 på TTM-EPS 0,04 USD (netto +45,0 M) med forward 168 och P/S 45,19 som bärarbilden: pedagogiken är ATT talet blir meningslöst vid mikro-EPS (prognosTillväxt-fältet bär formeln +3 117 % formellt men PEG markeras null — källans PEG 5,75 på 3-årsbas som not); FYND 2 — SaaS-konventionens kärna: GAAP-EBIT −133 M och GAAP-netto +45 M ENDAST genom ränteintäkter på 4,19 mdr nettkassa, medan FCF +1 609 M (29,8 % marginal, 5/5 växande år 462,6→1 310) —skillnaden 36× = förskottsbetald prenumerationsintäkt + SBC 1 244 M (23 % av intäkten, aktieökning +3,24 %/år); bruttomarginalserien 73,6/73,2/75,2/74,9/74,8 % (medel 74,3 ± 2,0 pp) = mjukvarumoatens stabilitet; ROIC −14,1 % mot WACC 11,1 % = −25,2 pp GAAP-lins; 52-v +113,4 % (tillväxtcellens största rörelse 2025-26); evEbit null (negativ EBIT), resultatCAGR null (negativ endpoint, BASF-precedensen).",
  };
})();

// ── Grindutvärdering ──
const antalGröna = granslar.filter(g => g.startsWith("GRÖN")).length;
const antalRöda = granslar.filter(g => g.startsWith("RÖD")).length;
console.log(granslar.join("\n"));
console.log(`\nARITMETIKGRIND: ${antalGröna} GRÖNA / ${antalRöda} RÖDA av ${granslar.length}`);
if (abort) { console.log("ABORT — filen orörd, rättning krävs."); process.exit(1); }
writeFileSync("/tmp/s2u3o22/rader-nya.json", JSON.stringify([cmcsa, amt, crwd], null, 1));
console.log("→ /tmp/s2u3o22/rader-nya.json skriven (3 rader, alla fält maskinräknade)");
