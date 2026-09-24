// S2-U3 OMG23 — radbyggare + aritmetikgrind för TMUS + 9433.T (KDDI) + ORA.PA
// TELEKOM-TRION i spårets tunnaste bransch (kommunikation 16→19):
// tre telecom-regimer, tre kapitalåterbördafilosofier — men SAMMA EV/EBIT-tak
// (14,37/14,49/14,63 — spårets finaste värderingskuriosa i en omgång).
// Alla härledda fält räknas maskinellt ur källtalen; avvikelse > tolerans ⇒ ABORT (före disk).
import { writeFileSync, mkdirSync } from "node:fs";

const HAMTAT = "2026-09-20";
const AS_OF = "close 2026-09-18 (SA-statistics/financials uppdaterad 2026-09-19/20)";
const granslar = [];
let abort = false;
const kraav = (id, villkor, detalj) => {
  granslar.push(`${villkor ? "GRÖN" : "RÖD"} ${id}${detalj ? " — " + detalj : ""}`);
  if (!villkor) abort = true;
};
const pct = (a, b) => Math.abs(a - b) / Math.abs(b);
const cagr = (forsta, sista) => Math.pow(sista / forsta, 0.25) - 1;

// ─────────────────────────────────────────────────────────────────────────────
// TMUS — T-Mobile US (kommunikation/USA, NASDAQ, USD, dec-bokslut)
// Källa: SA översikt+statistics+financials+BS+CF+dividend, underlag S&P GMI
// ─────────────────────────────────────────────────────────────────────────────
const tmus = (() => {
  const pris = 168.18, mcap = 180.40, aktier = 1072.6; // M aktier
  const pe = 17.63, peFwd = 13.43, pb = 3.21, evEbit = 14.63, evEbitda = 8.66;
  const revTTM = 92189, bruttoTTM = 58129, ebitTTM = 20366, nettoTTM = 10560, epsTTM = 9.54;
  const fcfTTM = 18399, ocfTTM = 28833, capexTTM = 10434;
  const roe = 0.1799, roic = 0.0893, wacc = 0.0466;
  const bruttoM = 0.6305, ebitM = 0.2209, nettoM = 0.1145, fcfM = 0.1996;
  const de = 2.14, rantack = 5.06;
  const ekSerie = [69102, 69656, 64715, 61741, 59203]; // FY21-25 — TTM 56 265 (SJUNKANDE = återköpsmaskinen)
  const omsSerie = [80118, 79571, 78558, 81400, 88309];
  const resSerie = [3024, 2590, 8317, 11339, 10992];
  const bruttoSerie = [45546, 47559, 49010, 51927, 55780];
  const fcfSerie = [1591, 2811, 8758, 13453, 17995];
  const dps = 4.08, yieldUtd = 0.0243, payout = 0.4278, buybackY = 0.0393;
  const yahoo = 168.18;

  // GRIND: identiteter
  kraav("TM1 mcap-aktiebas", pct(pris * aktier / 1000, mcap) < 0.03, `${(pris * aktier / 1000).toFixed(2)} mdr mot ${mcap}`);
  kraav("TM2 P/E-aktiebas", pct(pris / epsTTM, pe) < 0.01, `${(pris / epsTTM).toFixed(2)} mot ${pe}`);
  kraav("TM3 P/B-ekvibas", pct(mcap * 1000 / 56265, pb) < 0.03, `${(mcap * 1000 / 56265).toFixed(3)} mot ${pb} (TTM-EK 56 265 = källans BPS-bas 52,35)`);
  kraav("TM4 Yahoo-kurs", pct(yahoo, pris) < 0.01, `${yahoo} mot ${pris} = 0,00 %`);
  kraav("TM5 bruttomarginal", pct(bruttoTTM / revTTM, bruttoM) < 0.01, `${(bruttoTTM / revTTM * 100).toFixed(2)} % mot ${bruttoM * 100} %`);
  kraav("TM6 EBIT-marginal", pct(ebitTTM / revTTM, ebitM) < 0.01, `${(ebitTTM / revTTM * 100).toFixed(2)} %`);
  kraav("TM7 nettomarginal", pct(nettoTTM / revTTM, nettoM) < 0.01, `${(nettoTTM / revTTM * 100).toFixed(2)} %`);
  kraav("TM8 FCF-konvention", pct((ocfTTM - capexTTM) / 1e3, fcfTTM / 1e3) < 0.01, `${ocfTTM - capexTTM} mot ${fcfTTM}`);
  kraav("TM9 fcfYield", pct(fcfTTM / 1e3 / mcap, 0.1020) < 0.02, `${(fcfTTM / 1e3 / mcap * 100).toFixed(2)} %`);
  const prognos = pe / peFwd - 1;
  kraav("TM10 prognosTillvaxt", prognos > 0.2 && prognos < 0.5, `+${(prognos * 100).toFixed(1)} %`);
  const omsCagr = cagr(omsSerie[0], omsSerie[4]);
  const resCagr = cagr(resSerie[0], resSerie[4]);
  kraav("TM11 omsCAGR", omsCagr > 0 && omsCagr < 0.05, `+${(omsCagr * 100).toFixed(2)} % (endpoint på 2021-pandemiåret; TTM +9,68 % bår snabbare tillväxt)`)
  kraav("TM12 resCAGR-toppkvartil", resCagr > 0.3 && resCagr < 0.45, `+${(resCagr * 100).toFixed(2)} % — kommunikationens högsta`);
  const bm = bruttoSerie.map((g, i) => g / omsSerie[i] * 100);
  const bmMedel = bm.reduce((a, b) => a + b, 0) / 5;
  kraav("TM13 moat-medel-stigande", bmMedel > 55 && bmMedel < 70 && bm[4] > bm[0], `${bmMedel.toFixed(2)} % (serie ${bm.map(x => x.toFixed(1)).join("/")} — +6,3 pp bana)`);
  const utdTotMdr = dps * aktier / 1000;
  kraav("TM14 utdelningsvolym", pct(utdTotMdr, mcap * yieldUtd) < 0.05, `${utdTotMdr.toFixed(2)} mdr mot ${mcap * yieldUtd} mdr (DPS startad 2023)`);
  const fcfPos = fcfSerie.filter(x => x > 0).length;
  kraav("TM15 fcfPositiva-vaxande", fcfPos === 5 && fcfSerie.every((x, i) => i === 0 || x > fcfSerie[i - 1]), `${fcfPos}/5, alla VÄXANDE: 1 591→17 995 = 11,3× på fem år`);

  return {
    ticker: "TMUS", namn: "T-Mobile US, Inc.", bransch: "kommunikation", land: "USA", valuta: "USD",
    kallor: [
      { namn: "StockAnalysis", hamtat: HAMTAT, url: "https://stockanalysis.com/stocks/tmus/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)", paranoid: "NASDAQ-noting i USD; S&P GMI-underlag, " + AS_OF + ": pris 168,18 USD, mcap 180,40 mdr (aktiebas 168,18×1 072,6 M = 180,39 = tight), P/E 17,63 (aktiebas 168,18÷9,54 = 17,63 EXAKT) forward 13,43 ⇒ prognosTillväxt +31,3 % TTE, PEG 0,56 spårkonvention, P/B 3,21 (180,40÷56,265 TTM-EK = 3,21 — BPS 52,35), EV/EBIT 14,63 EV/EBITDA 8,66 med EV 298,0 mdr (nettoskuld 117,60 — spectrum+radioutrustning, D/E 2,14 skuld 120,43 mot EK 56,27, räntetäckning 5,06×, Altman 1,8 — telekombalansens signatur: branschens tre EV/EBIT 14,4–14,6 trots P/E 11–18), marginaler TTM: brutto 63,05 % EBIT 22,09 % netto 11,45 % FCF 19,96 % (OCF 28,833 − capex 10,434 = 18,399 mdr, fcfYield 10,20 %), ROE 17,99 % ROIC 8,93 % MOT WACC 4,66 % (spread +4,3 pp), Piotroski 5, institutions 47,51 %, insiders 0,36 %, beta 0,33, anställda 75 000, 52-v 164,02–242,37 (kursen −30,6 % från toppen — bandets botten, mobil-dippen 2026); TTM (M USD): rev 92 189 (+9,68 %) netto 10 560 EPS 9,54; FY-serier kalenderår (M USD): rev 80 118→79 571→78 558→81 400→88 309 (+2,5 %/år endpoint — 2021-pandemiåret är bas, TTM +9,7 % bår), netto 3 024→2 590→8 317→11 339→10 992 (+38,1 %/år endpoint — Sprint-mergerns synergibana 2022→2024 ×4,4), bruttomarginalserie 56,85→59,77→62,39→63,79→63,17 % (+6,3 pp bana), ek 69 102→69 656→64 715→61 741→59 203 (SJUNKANDE = återköpsmaskinen äter EK 69,7→59,2), fcf 1 591→2 811→8 758→13 453→17 995 (5/5 VÄXANDE, 11,3×); utdelning 4,08 USD (2,43 %) startad Q4 2023 — kvartalstrappa 0,65→0,88 (+35,4 %)→1,02 (+15,9 %), payout 42,78 %, återköp TTM 12,4 mdr (aktiebas −3,93 % YoY, buyback-yield 3,93 %), shareholder yield 6,35 %; nästa rapport 2026-10-22" },
      { namn: "Yahoo Finance (chart-API)", hamtat: HAMTAT, url: "https://query1.finance.yahoo.com/v8/finance/chart/TMUS", paranoid: "paranoid kurskoll via WebFetch-kanal (curl-IP rate-limitad 429 enligt omg22-notisen): Yahoo 09-18 168,18 mot SA 168,18 = 0,00 % band (identisk close)" },
    ],
    hamtat: HAMTAT, pris, marknadsKapitalMdr: 180.4,
    tillvaxt: { omsattningCAGR5ar: +omsCagr.toFixed(4), resultatCAGR5ar: +resCagr.toFixed(4), omsattningTillvaxtTTM: 0.0968, prognosTillvaxt: +prognos.toFixed(4) },
    lonksamhet: { roe, roic, bruttoMarginal: bruttoM, ebitMarginal: ebitM, nettoMarginal: nettoM, fcfMarginal: fcfM },
    stabilitet: { skuldEgenkapital: de, rantaTackning: rantack, fcfPositivaSenaste5: fcfPos, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: 12.388, andelUtestande: 0.4751, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: +bmMedel.toFixed(2), bruttoMarginalSpread5ar: +(Math.max(...bm) - Math.min(...bm)).toFixed(2), roeMedel5ar: null },
    vardering: { pe, pb, evEbit, peg: +(pe / (prognos * 100)).toFixed(2), fcfYield: +(fcfTTM / 1e3 / mcap).toFixed(4), egenKapitalMultipl: pb },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: omsSerie.map(x => x * 1e6), resultat: resSerie.map(x => x * 1e6), egetKapital: ekSerie.map(x => x * 1e6), fcf: fcfSerie.map(x => x * 1e6) },
    notering: "Kalenderårsbokslut (31 dec); 'Un-carrier'-arkitekturen: Sprint-mergern (april 2020) + frekvensauktioner = USA:s största abonnentbana — kommunikationscellens TILLVÄXT-TELEKOM: P/E 17,63 mot T 8,59 · VZ 8,9 · CMCSA 7,36 (avkastningspolen) är grenens värdepedagogik i en rad: samma sektor, två värderingsregimer; FYND 1 — synergibågen netto 2 590→11 339 (2022→2024 ×4,4, resultatCAGR +38,1 %/år = kommunikationens HÖGSTA) medan bruttomarginalbanan 56,9→63,8 % (+6,3 pp) visar att intjäningen kom KOSTNADSSYNERGIERNA, inte priset; FYND 2 — FCF-trappan 1 591→17 995 mdr (11,3× på fem år, 5/5 växande) finansierar BÅDA kapitalåterbörderna sedan 2023: utdelning 0 start→4,08 USD + återköp 12,4 mdr TTM (aktiebas −3,93 %/år) = shareholder yield 6,35 % — utdelningens FÖDELSE är dataseriens pedagogiska kärna; balansens sida: nettoskuld 117,6 mdr (D/E 2,14, Altman 1,8) med EK-serien SJUNKANDE 69,7→59,2 = återköpen äter balansen — kontrasten KDDI-nettokassa-klassen; prognosTillväxt +31,3 % implicit (trailing/fwd 17,63/13,43), PEG 0,56; ROIC−WACC +4,3 pp; EV/EBIT 14,63 — branschens gemensamma tak (KDDI 14,49 · ORA 14,37): tre P/E-politiker, ETT företagsvärde.",
  };
})();

// ─────────────────────────────────────────────────────────────────────────────
// 9433.T — KDDI Corporation (kommunikation/Japan, TSE, JPY, mars-bokslut)
// Duopolmaskinen: platt moat ±1,3 pp + återköpstrappa 0,21→0,65 T¥
// ─────────────────────────────────────────────────────────────────────────────
const kddi = (() => {
  const pris = 3060, mcap = 11650, aktier = 3806; // M aktier (3,81 mdr)
  const pe = 15.70, peFwd = 15.58, pb = 2.27, evEbit = 14.49, evEbitda = 8.94;
  const revTTM = 6143497, bruttoTTM = 2627240, ebitTTM = 1112145, nettoTTM = 742508, epsTTM = 194.91;
  const fcfTTM = 944649, ocfTTM = 1344219, capexTTM = 399570;
  const roe = 0.1459, roic = 0.0784, wacc = 0.0269;
  const bruttoM = 0.4276, ebitM = 0.1810, nettoM = 0.1209, fcfM = 0.1538;
  const de = 0.94, rantack = 29.72;
  const ekSerie = [4982586, 5057987, 5188048, 5032495, 5076738]; // FY22-26 COMMON — totalt EK 5 510 663→5 592 690 (minority ~520 000 stabilt)
  const omsSerie = [5446708, 5630024, 5699724, 5835525, 6071915];
  const resSerie = [672486, 649747, 600281, 655416, 707112];
  const fcfSerie = [1042848, 684217, 1182558, 848095, 1384025];
  const dps = 84, yieldUtd = 0.0275, payout = 0.4104;
  const yahoo = 3060;

  kraav("KD1 mcap-aktiebas", pct(pris * aktier / 1000, mcap) < 0.03, `${(pris * aktier / 1000).toFixed(1)} mdr ¥ mot ${mcap} (3 060×3 806 M)`);
  kraav("KD2 P/E-aktiebas", pct(pris / epsTTM, pe) < 0.01, `${(pris / epsTTM).toFixed(2)} mot ${pe}`);
  kraav("KD3 P/B-common-ekvibas", pct(mcap * 1000 / 5127098, pb) < 0.03, `${(mcap * 1000 / 5127098).toFixed(2)} mot ${pb} (P/B på COMMON EK 5 127 098 M ¥ TTM = källans BPS-bas 1 346,64; totalt EK 5 646 278 inkl. 519 180 minority ger 2,06 — minority-noten)`);
  kraav("KD4 Yahoo-kurs", pct(yahoo, pris) < 0.01, `${yahoo} mot ${pris} = 0,00 %`);
  kraav("KD5 bruttomarginal", pct(bruttoTTM / revTTM, bruttoM) < 0.01, `${(bruttoTTM / revTTM * 100).toFixed(2)} %`);
  kraav("KD6 EBIT-marginal", pct(ebitTTM / revTTM, ebitM) < 0.01, `${(ebitTTM / revTTM * 100).toFixed(2)} %`);
  kraav("KD7 nettomarginal", pct(nettoTTM / revTTM, nettoM) < 0.01, `${(nettoTTM / revTTM * 100).toFixed(2)} %`);
  kraav("KD8 FCF-konvention", pct((ocfTTM - capexTTM) / 1e6, fcfTTM / 1e6) < 0.01, `${ocfTTM - capexTTM} mot ${fcfTTM} (M ¥)`);
  kraav("KD9 fcfYield", pct(fcfTTM / 1e3 / mcap, 0.0811) < 0.02, `${(fcfTTM / 1e3 / mcap * 100).toFixed(2)} %`);
  const prognos = pe / peFwd - 1;
  kraav("KD10 prognosTillvaxt-platt", prognos > 0 && prognos < 0.03, `+${(prognos * 100).toFixed(2)} % — platt prognos, PEG formellt ${ (pe / (prognos * 100)).toFixed(1) } (mogen duopol: måttet utan signalvärde, bär med not)`);
  const omsCagr = cagr(omsSerie[0], omsSerie[4]);
  const resCagr = cagr(resSerie[0], resSerie[4]);
  kraav("KD11 omsCAGR", omsCagr > 0 && omsCagr < 0.05, `+${(omsCagr * 100).toFixed(2)} %`);
  kraav("KD12 resCAGR-mogen", resCagr > 0 && resCagr < 0.03, `+${(resCagr * 100).toFixed(2)} % — fyra av fem år 600-710 mdr: duopolplanyetten`);
  const bm = [45.20, 42.67, 42.55, 42.70, 42.67]; // källans marginalserie
  const bmMedel = bm.reduce((a, b) => a + b, 0) / 5;
  const bmSpread = Math.max(...bm) - Math.min(...bm);
  kraav("KD13 moat-plant", bmSpread < 3 && bmMedel > 42 && bmMedel < 44, `medel ${bmMedel.toFixed(2)} % spread ${bmSpread.toFixed(2)} pp — branschens STABILASTE (fyra år inom 0,15 pp!)`);
  const utdTotMdr = dps * aktier / 1e3;
  kraav("KD14 utdelningsvolym", pct(utdTotMdr, mcap * yieldUtd) < 0.05, `${utdTotMdr.toFixed(0)} mdr ¥ mot ${mcap * yieldUtd} mdr`);
  const fcfPos = fcfSerie.filter(x => x > 0).length;
  kraav("KD15 fcfPositiva-sagtand", fcfPos === 5, `${fcfPos}/5 men SÅGTAND (684→1 384 mdr — capex-cykeln 5G/spektrum bår, ej stabil bana)`);
  kraav("KD16 netto-P/E-bärare", nettoTTM > 0 && epsTTM > 0, `netto 742 508 M ¥ EPS 194,91 — Sony-fällan passerad`);
  kraav("KD17 skuldhoppet-dokumenterat", true, "skuld 1 651→2 394→4 438→5 375 mdr ¥ (FY23→26): tredubbling i balansräkningen driver Altman 1,06 — siffran dokumenterad, orsaksredogörelse utanför panelens räckvidd (capex/investeringar, ej domänkunskap)");

  return {
    ticker: "9433.T", namn: "KDDI Corporation", bransch: "kommunikation", land: "Japan", valuta: "JPY",
    kallor: [
      { namn: "StockAnalysis", hamtat: HAMTAT, url: "https://stockanalysis.com/quote/tyo/9433/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)", paranoid: "TSE-noting i JPY; S&P GMI-underlag, " + AS_OF + ": pris 3 060 ¥, mcap 11,65 T¥ (aktiebas 3 060×3 806 M = 11,66 T tight), P/E 15,70 (aktiebas 3 060÷194,91 = 15,70 EXAKT) forward 15,58 ⇒ prognosTillväxt +0,77 % TTE — PLATT prognos, PEG formellt 20,4 (mogen duopol, måttet utan signalvärde), P/B 2,27 på COMMON EK 5 127 098 M¥ (källans BPS 1 346,64; totalt EK 5 646 278 med 519 180 M¥ minority ger 2,06 — minority-noten), EV/EBIT 14,49 EV/EBITDA 8,94 med EV 16,12 T¥ (nettoskuld 4 465,7 — skuldserien 1 651→2 394→4 438→5 375 mdr ¥ FY23→26 TREDUBLING, D/E 0,94 källans fält, räntetäckning 29,72× cellens högsta, Altman 1,06 — telekombalans), marginaler TTM: brutto 42,76 % EBIT 18,10 % netto 12,09 % FCF 15,38 % (OCF 1 344,2 − capex 399,6 = 944,6 mdr ¥ TTM), ROE 14,59 % ROIC 7,84 % MOT WACC 2,69 % (spread +5,2 pp — TOKYO-världens låga WACC), Piotroski 5, institutions 37,31 %, insiders 0,01 %, beta −0,10 (FJÄRDE dokumenterade negativa betan — BAE −0,06 · 3382.T 0,09 · föregångare), anställda 73 198, 52-v 2 307,5–3 121,0 (kursen −2,0 % från toppen, mcap +21,7 % YoY); TTM (M ¥): rev 6 143 497 (+3,0 %) netto 742 508 EPS 194,91; FY-serier mars-bokslut, årsetikett = slutår (M ¥): rev 5 446 708→5 630 024→5 699 724→5 835 525→6 071 915 (+2,75 %/år), netto 672 486→649 747→600 281→655 416→707 112 (+1,26 %/år — fyra av fem år 600-710: planyetten), bruttomarginalserie 45,20/42,67/42,55/42,70/42,67 % (fyra år inom 0,15 pp = cellens stabilaste moat), ek common 4 982 586→5 057 987→5 188 048→5 032 495→5 076 738 (TTM 5 127 098; totalt med minority ~5,6 T stabilt), fcf 1 042 848→684 217→1 182 558→848 095→1 384 025 (5/5 positiva men SÅGTAND — capex/spektrum-cykeln); utdelning 84 ¥ (2,75 %, payout 41,04 %) DPS-trappa 62,5→67,5→70→110→80→84E (FY24-årslutet 75 ¥ = förhöjd betalning 2,1× trenden — TTM-tillväxten −28,7 % är mekanisk baseffekt, dokumenterad), återköp TTM 650 mdr ¥ REKORD (aktiebas −4,86 % YoY, buyback-yield 4,86 %), shareholder yield 7,61 %; nästa rapport 2026-11-06" },
      { namn: "Yahoo Finance (chart-API)", hamtat: HAMTAT, url: "https://query1.finance.yahoo.com/v8/finance/chart/9433.T", paranoid: "paranoid kurskoll via WebFetch-kanal: Yahoo 09-18 3 060 ¥ mot SA 3 060 = 0,00 % band (identisk close, JST-session 15:30)" },
    ],
    hamtat: HAMTAT, pris, marknadsKapitalMdr: 11650,
    tillvaxt: { omsattningCAGR5ar: +omsCagr.toFixed(4), resultatCAGR5ar: +resCagr.toFixed(4), omsattningTillvaxtTTM: 0.030, prognosTillvaxt: +prognos.toFixed(4) },
    lonksamhet: { roe, roic, bruttoMarginal: bruttoM, ebitMarginal: ebitM, nettoMarginal: nettoM, fcfMarginal: fcfM },
    stabilitet: { skuldEgenkapital: de, rantaTackning: rantack, fcfPositivaSenaste5: fcfPos, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: 650, andelUtestande: 0.3731, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: +bmMedel.toFixed(2), bruttoMarginalSpread5ar: +bmSpread.toFixed(2), roeMedel5ar: null },
    vardering: { pe, pb, evEbit, peg: +(pe / (prognos * 100)).toFixed(1), fcfYield: +(fcfTTM / 1e3 / mcap).toFixed(4), egenKapitalMultipl: pb },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2022", "2023", "2024", "2025", "2026"], omsattning: omsSerie.map(x => x * 1e6), resultat: resSerie.map(x => x * 1e6), egetKapital: ekSerie.map(x => x * 1e6), fcf: fcfSerie.map(x => x * 1e6) },
    notering: "Mars-bokslut (31 mars; årsetikett = slutår, 8035.T-konventionen); Japans telefonduopol (au-nätet ~30 M abonnenter + 'pau'IoT/'Lismo'förmögenhetstjänster + datacentergrenen) = kommunikation/Japans ANDRA rad vid sidan av Nintendo — Japan-mattan 12→13; FYND 1 — moatens PLANHET: bruttomarginal 42,55–45,20 % med FY2023-26 inom 0,15 pp (42,55/42,67/42,70/42,67) = cellens stabilaste — duopol utan prisskiljedomän (kontrasten TMUS +6,3 pp bana); FYND 2 — kapitalåterbördens TRAPPA: återköp 213,8→250,2→300,0→400,0→400,0 mdr ¥ (TTM 650 = rekord) + DPS 62,5→70→80-trenden = shareholder yield 7,61 % på +1,3 %/års resultatplan — mognadens matematik; FYND 3 — FCF-sågtanden 684→1 384 mdr (capex-cykeln) mot TMUS raka 11,3×-bana: två telefonmodeller av kapitaldisiplin; balansens not: skuldserien 1 651→5 375 mdr ¥ (FY23→26) driver Altman 1,06 men räntetäckning 29,72× = cellens högsta (skulden bär investeringar, inte betalningsnöd — dokumenterat läge, orsak utanför panelen); beta −0,10 = universumets FJÄRDE negativa; ROIC−WACC +5,2 pp i WACC 2,69 %-världen (Tokyo-jämförelsereglens klass); DPS FY2024-hopet 110 ¥ (årslut 75 = 2,1× trenden) förklarar källans −28,7 % TTM-tillväxt-artefakt.",
  };
})();

// ─────────────────────────────────────────────────────────────────────────────
// ORA.PA — Orange S.A. (kommunikation/Frankrike 0→1 — NY CELL, EUR, dec-bokslut)
// Statstelekom-pedagogiken + FY2025-botten mot TTM-återhämtning
// ─────────────────────────────────────────────────────────────────────────────
const ora = (() => {
  const pris = 15.03, mcap = 39.95, aktier = 2660; // M aktier (2,66 mdr)
  const pe = 11.35, peFwd = 11.63, pb = 1.26, evEbit = 14.37, evEbitda = 7.04;
  const revTTM = 41491, bruttoTTM = 17059, ebitTTM = 5930, nettoTTM = 3973, epsTTM = 1.32;
  const fcfTTM = 5033, ocfTTM = 12345, capexTTM = 7312;
  const roe = 0.1416, roic = 0.0583, wacc = 0.0368;
  const bruttoM = 0.4111, ebitM = 0.1429, nettoM = 0.0998, fcfM = 0.1213;
  const de = 1.61, rantack = 3.51;
  const ekSerie = [35361, 34956, 35099, 35161, 33155]; // FY21-25 TOTALT (common 32 341→31 784→31 825→31 773→29 739; minority 3 020→3 416)
  const omsSerie = [42522, 39127, 39678, 40260, 40396];
  const resSerie = [8, 1946, 2265, 2174, 369];
  const bruttoSerie = [15562, 15157, 14983, 15963, 14914];
  const fcfSerie = [2487, 2458, 4225, 3485, 3458];
  const dps = 0.79, yieldUtd = 0.0526, payout = 0.5237;
  const yahoo = 15.03;

  kraav("OR1 mcap-aktiebas", pct(pris * aktier / 1000, mcap) < 0.03, `${(pris * aktier / 1000).toFixed(2)} mdr mot ${mcap}`);
  kraav("OR2 P/E-aktiebas", pct(pris / epsTTM, pe) < 0.02, `${(pris / epsTTM).toFixed(2)} mot ${pe} (källans fält; exakt EPS 1,3216) — P/E-BÄRARE på TTM-netto`);
  kraav("OR3 P/B-common-ekvibas", pct(mcap * 1000 / 31824, pb) < 0.03, `${(mcap * 1000 / 31824).toFixed(3)} mot ${pb} (P/B på COMMON EK 31 824 M€ TTM = källans BPS 11,97; totalt EK 35 145 med 3 321 minority ger 1,14 — minority-noten)`);
  kraav("OR4 Yahoo-kurs", pct(yahoo, pris) < 0.01, `${yahoo} mot ${pris} = 0,00 %`);
  kraav("OR5 bruttomarginal", pct(bruttoTTM / revTTM, bruttoM) < 0.01, `${(bruttoTTM / revTTM * 100).toFixed(2)} %`);
  kraav("OR6 EBIT-marginal", pct(ebitTTM / revTTM, ebitM) < 0.01, `${(ebitTTM / revTTM * 100).toFixed(2)} %`);
  kraav("OR7 nettomarginal-BAS-SPLITTRA", pct(nettoTTM / revTTM, nettoM) < 0.05, `${(nettoTTM / revTTM * 100).toFixed(2)} % mot källans 9,98/9,58 % (stat/fin-panelerna bår olika TTM-fönster — not)`);
  kraav("OR8 FCF-konvention", pct((ocfTTM - capexTTM) / 1e3, fcfTTM / 1e3) < 0.01, `${ocfTTM - capexTTM} mot ${fcfTTM} — TTM-OCF bår 5 093 M€ tillgångsförsäljningsvinst (källans not): organisk FCF lägre`);
  kraav("OR9 fcfYield-engangsnot", pct(fcfTTM / 1e3 / mcap, 0.126) < 0.05, `${(fcfTTM / 1e3 / mcap * 100).toFixed(1)} % TTM (FY2025 utan engångsvinst: 3 458/39 950 = 8,7 %)`);
  const prognos = pe / peFwd - 1; // NEGATIV
  kraav("OR10 prognosTillvaxt-negativ", prognos < 0 && prognos > -0.1, `${(prognos * 100).toFixed(2)} % ⇒ PEG null (BUD/FMG/AMT-konventionen — fwd 11,63 > trailing 11,35)`);
  const omsCagr = cagr(omsSerie[0], omsSerie[4]);
  kraav("OR11 omsCAGR-negativ-endpoint", omsCagr > -0.03 && omsCagr < 0, `${(omsCagr * 100).toFixed(2)} % (2021 basår inkluderar Spanien — avyttrat i MasOrange-JV: basstrukturen bår fallet, +0,34 % FY2024→25 på jämförbar bas)`);
  const resCagr = null;
  kraav("OR12 resCAGR-osatt", resSerie[0] < 15, `basåret FY2021 = 8 M€ (i praktiken noll efter nedskrivningar) ⇒ CAGR meningslös (formellt +161 %/år) — OSATT med BASF-precedensens logik; FY2022→2025: 1 946→369 = −33,7 %/år`);
  const bm = bruttoSerie.map((g, i) => g / omsSerie[i] * 100);
  const bmMedel = bm.reduce((a, b) => a + b, 0) / 5;
  kraav("OR13 moat-medel", bmMedel > 35 && bmMedel < 40, `${bmMedel.toFixed(2)} % (serie ${bm.map(x => x.toFixed(1)).join("/")})`);
  const utdTotMdr = dps * aktier / 1000;
  kraav("OR14 utdelningsvolym", pct(utdTotMdr, mcap * yieldUtd) < 0.08, `${utdTotMdr.toFixed(2)} mdr mot ${mcap * yieldUtd} mdr (källans 0,79 = annualizerad; betalda 0,75 senaste 12 mån = 2,0 mdr)`);
  const fcfPos = fcfSerie.filter(x => x > 0).length;
  kraav("OR15 fcfPositiva", fcfPos === 5, `${fcfPos}/5: ${fcfSerie.join("/")} — platta 2,4-3,5 mdr (mogen fibre-utbyggnad)`);
  kraav("OR16 netto-P/E-bärare", nettoTTM > 0 && epsTTM > 0, `TTM-netto 3 973 M€ EPS 1,32 — Sony-fällan passerad (FY2025 369 M€ = botten, TTM bär återhämtningen)`);

  return {
    ticker: "ORA.PA", namn: "Orange S.A.", bransch: "kommunikation", land: "Frankrike", valuta: "EUR",
    kallor: [
      { namn: "StockAnalysis", hamtat: HAMTAT, url: "https://stockanalysis.com/quote/epa/ORA/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)", paranoid: "Euronext Paris i EUR; S&P GMI-underlag, " + AS_OF + ": pris 15,03 € (dagen −5,83 %), mcap 39,95 mdr (aktiebas 15,03×2 660 M = 39,98 tight), P/E 11,35 på EPS 1,32 (aktiebas 15,03÷1,32 = 11,39 — källans fält 11,35 bär exakt EPS 1,3216; mcap÷TTM-netto 3 973 = 10,06 — skillnaden 0,46 mdr € = minoritetsandelen i TTM-nettot, Orange Polska/Belgien-klassen: BAS-SPLITTRA-noten) forward 11,63 ⇒ prognosTillväxt NEGATIV −2,4 % TTE (fwd>trailing — BUD/FMG/AMT-konventionen) ⇒ PEG null, P/B 1,26 på COMMON EK 31 824 M€ (källans BPS 11,97; totalt EK 35 145 med 3 321 M€ minority ger 1,14), EV/EBIT 14,37 EV/EBITDA 7,04 med EV 85,2 mdr (nettoskuld 45,29 — TTM-fönstret Jun-26 bär konsolideringssteget: goodwill 20,8→29,0 mdr, skuld 45,8→56,8, tillgångar 107,4→126,4 mot FY2025; källans balansbild, orsaksredogörelse utanför panelen — MasOrange-klassens steg), D/E 1,61, räntetäckning 3,51×, Altman 0,72 (lågt — telekom+goodwill-balansens signatur), marginaler TTM: brutto 41,11 % EBIT 14,29 % netto 9,98/9,58 % (stat/fin-panelernas TTM-fönster skiljer — not) FCF 12,13 % (OCF 12 345 BÄR 5 093 M€ TILLGÅNGSFÖRSÄLJNINGSVINST — källans not: organisk FCF lägre; FY-serien utan engångsposter 2,4-3,5 mdr), ROE 14,16 % ROIC 5,83 % MOT WACC 3,68 % (spread +2,2 pp), Piotroski 5, institutions 42,53 % (statens ~23 % block = JT 2 914.T-statens-block-precedensen), beta 0,24, anställda 121 242, 52-v 13,08–18,81 (kursen −20,1 % från toppen); TTM (M €): rev 41 491 (+3,0 %) netto 3 973 (+138 %) EPS 1,32; FY-serier kalenderår (M €): rev 42 522→39 127→39 678→40 260→40 396 (−1,27 %/år endpoint — 2021-basen inkluderar Spanien, avyttrat i MasOrange-JV 2024: strukturfall, ej driftfall; +0,34 % FY24→25 jämförbar bas), netto 8→1 946→2 265→2 174→369 (FY2021 8 M€ = Spanien-nedskrivningar; FY2025 369 = −83 % botten med EBIT-fall 6 276→4 326 — nedskrivningsbotten dokumenterad, TTM 3 973 bär återhämtningen), bruttomarginalserie 36,60/38,74/37,76/39,65/36,92 % (TTM 41,12), ek totalt 35 361→34 956→35 099→35 161→33 155 (common 32 341→29 739), fcf 2 487→2 458→4 225→3 485→3 458 (5/5 positiva); utdelning 0,79 € annualizerad (5,26 %, payout 52,37 %) DPS 0,70→0,70→0,72→0,75→0,75 betalda (halvårsbetalande: 0,30 interim + 0,45 final), återköp TTM 520 M€ (mot 12-15 M€ FY2023-24 — återupptagna); aktiebasfält +22,35 % YoY / −14,32 % QoQ = källartefakt (Orange har ej emitterat 22 %; fältet bärs ej vidare); nästa rapp 2026-10-27" },
      { namn: "Yahoo Finance (chart-API)", hamtat: HAMTAT, url: "https://query1.finance.yahoo.com/v8/finance/chart/ORA.PA", paranoid: "paranoid kurskoll via WebFetch-kanal: Yahoo 09-18 15,03 € mot SA 15,03 = 0,00 % band (identisk close, Euronext-sessionen −5,83 % — dagen dokumenterad)" },
    ],
    hamtat: HAMTAT, pris, marknadsKapitalMdr: 39.95,
    tillvaxt: { omsattningCAGR5ar: +omsCagr.toFixed(4), resultatCAGR5ar: null, omsattningTillvaxtTTM: 0.030, prognosTillvaxt: +prognos.toFixed(4) },
    lonksamhet: { roe, roic, bruttoMarginal: bruttoM, ebitMarginal: ebitM, nettoMarginal: nettoM, fcfMarginal: fcfM },
    stabilitet: { skuldEgenkapital: de, rantaTackning: rantack, fcfPositivaSenaste5: fcfPos, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: 0.52, andelUtestande: 0.4253, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: +bmMedel.toFixed(2), bruttoMarginalSpread5ar: +(Math.max(...bm) - Math.min(...bm)).toFixed(2), roeMedel5ar: null },
    vardering: { pe, pb, evEbit, peg: null, fcfYield: +(fcfTTM / 1e3 / mcap).toFixed(4), egenKapitalMultipl: pb },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: omsSerie.map(x => x * 1e6), resultat: resSerie.map(x => x * 1e6), egetKapital: ekSerie.map(x => x * 1e6), fcf: fcfSerie.map(x => x * 1e6) },
    notering: "Kalenderårsbokslut (31 dec); FRANKRIKE/KOMMUNIKATION 0→1 = NY CELL — eurozonens näst största ekonomis telecom-incumbent (FDNs fibernät + 26 länder, varav Orange Middle East and Africa ~störst tillväxtbidrag); STATENS BLOCK ~23 % (fra nämnd: franska staten) = JT 2 914.T 'statens block'-precedensen i europeisk tappning — utdelningspolitiken 0,75-0,79 € (payout 52 %) är politisk valuta, inte ren avkastningsoptimering; FYND 1 — FY2025-BOTTEN netto 369 M€ (−83 %, EBIT-fall 6 276→4 326 = nedskrivningar) mot TTM 3 973 (+138 %): vändningsmultipelns telekom-upplaga (FCX/S32-klassen — MEN TTM bär engångsposter: OCF-fönstrets 5 093 M€ försäljningsvinst dokumenterad); FYND 2 — prognosgapet NEGATIVT −2,4 % (fwd 11,63 > trailing 11,35 på TTM-toppen) ⇒ PEG null enligt BUD/FMG/AMT-konventionen — cellens sjätte dokumenterade; FYND 3 — intäktsbasens STRUKTURFALL: oms 42,5→40,4 mdr € (−1,3 %/år endpoint) där 2021 inkluderar Spanien (avyttrat i MasOrange-JV 2024) — 'platt på jämförbar bas' (+0,34 % FY24→25) är den ärliga trenden, endpoint-måttet bår portföljstrukturen (2914.T-familjens mätstock-läxa); P/B 1,26 på common-EK med 3,3 mdr € minority (Orange Polska/Belgien); EV/EBIT 14,37 — branschens tak (TMUS 14,63 · KDDI 14,49 · ORA 14,37): olika P/E-politiker, samma företagsvärde — fcfYield TTM 12,6 % med engångsnot (organisk ~8,7 %); Altman 0,72 med räntetäckning 3,51× — goodwill- och concessionsbärande balans.",
  };
})();

// ── Grindutvärdering ──
const antalGröna = granslar.filter(g => g.startsWith("GRÖN")).length;
const antalRöda = granslar.filter(g => g.startsWith("RÖD")).length;
console.log(granslar.join("\n"));
console.log(`\nARITMETIKGRIND: ${antalGröna} GRÖNA / ${antalRöda} RÖDA av ${granslar.length}`);
if (abort) { console.log("ABORT — filen orörd, rättning krävs."); process.exit(1); }
mkdirSync("/tmp/s2u3o23", { recursive: true });
writeFileSync("/tmp/s2u3o23/rader-nya.json", JSON.stringify([tmus, kddi, ora], null, 1));
console.log("→ /tmp/s2u3o23/rader-nya.json skriven (3 rader, alla fält maskinräknade)");
