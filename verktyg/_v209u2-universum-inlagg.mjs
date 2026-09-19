#!/usr/bin/env node
/**
 * _v209u2-universum-inlagg.mjs — VÅG 209 u2 (byggare 2/3, +2 bolag):
 * SMFG 8316.T (Japan/finans, MUFG-precedensens bankpaket) + AXA CS.PA
 * (Frankrike/finans, TRYG-precedensens försäkringspaket) — könotisens arv
 * ("SMFG + AXA lediga, u2:notis", omg19-u1:s bokföring).
 *
 * Kontrakt: läser färskt universum, vägrar duplikat, validerar fältpaket
 * mot 8306.T/BNP.PA-mallarna, skriver JSON, LÄSER TILLBAKA ×2 (läckagevakt:
 * samma antal båda gångerna) + kontraktstest på djupet (nya radernas
 * nyckeltal + medianer före/efter).
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(UNI, "utf8"));
const FÖRE = u.length;
const finns = (t) => u.some((b) => b.ticker === t);
if (finns("8316.T") || finns("CS.PA")) {
  console.error("ABORT: duplikat — 8316.T/CS.PA finns redan på disken");
  process.exit(1);
}

// ── Exakta repliker (källbelagda i paranoid nedan) ───────────────────────────
const smfgPe = 6830 / 329.62;            // P/E 20,72 EXAKT
const smfgYield = 180 / 6830;            // 2,635 % EXAKT
const smfgPayout = 180 / 329.62;         // 54,6 % på TTM-EPS
const smfgOmsCagr = Math.pow(4379303 / 2810865, 1 / 4) - 1;
const smfgResCagr = Math.pow(1137557 / 499573, 1 / 4) - 1;
const smfgNettoM = 1262031 / 4715949;    // 26,76 % EXAKT replik
const smfgPb = 6830 / (16240 / 3.76);    // 1,581 (källa 1,58)
const smfgPrognos = (6830 / 329.62) / 13.87 - 1; // trailing/fwd − 1
const smfgPeg = smfgPe / (smfgPrognos * 100);

const axaYield = 2.32 / 44.73;           // 5,187 % EXAKT
const axaMcapReplik = 2.02 * 44.73;      // 90,35 mot 90,50 (0,17 %)
const axaOmsCagr = Math.pow(94691 / 122171, 1 / 4) - 1;   // IFRS17-brott
const axaOmsCagr3 = Math.pow(94691 / 86793, 1 / 3) - 1;   // konsekutiv bas
const axaResCagr = Math.pow(9623 / 7100, 1 / 4) - 1;
const axaEbitM = 10418 / 94691;
const axaNettoM = 9883 / 96794;          // 10,21 % replik (källa 10,38)
const axaFcfM = 14501 / 96794;
const axaFcfY = 14501 / 90500;
const axaPrognos = 12.07 / 10.32 - 1;
const axaPeg = 12.07 / (axaPrognos * 100);
const p = (x, d = 4) => (100 * x).toFixed(d >= 4 ? 2 : d);
console.log("REPLIKER SMFG: P/E", smfgPe.toFixed(2), "· yield", p(smfgYield), "% · payout", p(smfgPayout), "% · omsCAGR", p(smfgOmsCagr), "% · resCAGR", p(smfgResCagr), "% · nettoM", p(smfgNettoM), "% · P/B", smfgPb.toFixed(3), "· prognos", p(smfgPrognos), "% · PEG", smfgPeg.toFixed(2));
console.log("REPLIKER AXA: yield", p(axaYield), "% · mcap-replik", axaMcapReplik.toFixed(2), "· omsCAGR(5å, IFRS17-brott)", p(axaOmsCagr), "% · omsCAGR(3å konsekvent)", p(axaOmsCagr3), "% · resCAGR", p(axaResCagr), "% · ebitM", p(axaEbitM), "% · nettoM", p(axaNettoM), "% · fcfM", p(axaFcfM), "% · fcfY", p(axaFcfY), "% · prognos", p(axaPrognos), "% · PEG", axaPeg.toFixed(2));

const SMFG = {
  ticker: "8316.T",
  namn: "Sumitomo Mitsui Financial Group",
  bransch: "finans",
  land: "Japan",
  valuta: "JPY",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-19",
    url: "https://stockanalysis.com/quote/tyo/8316/ (+ /statistics/ + /financials/)",
    paranoid: "TYO-PRIMÄRNOTING i JPY (8306.T/9983.T-precedensen; underlag S&P Global Market Intelligence + Fiscal.ai; close 2026-09-18 15:30 JST, −0,70 %): pris 6 830,00 JPY, mcap 25,69 T JPY på 3,76 Mdr aktier (replik 3,76 × 6 830 = 25 681 mdr — 0,04 % mot källans 25 690), P/E 20,72 replikerbar EXAKT (6 830/329,62 = 20,721) mot forward 13,87 ⇒ prognosTillväxt +49,40 % TTE (trailing/fwd-modellen, MUFG-konventionen; källans PEG 0,99 på 3-års EPS-tillväxt som kalibreringsnot — spår-PEG 20,72/49,40 = 0,42), P/B 1,58 replikerbar (6 830/(16 240/3,76) = 1,581 på EK/utestående aktier) med BVPS-raden 4 238,67 JPY ⇒ 1,611 (+2,0 % — vägt aktietal 3,834 Mdr, HEN3/JNJ-klassen), P/TBV 1,72; TTM JPY (mdr): rev 4 715,949 (+40,9 % YoY), netto 1 262,031 (+154,6 %) med nettoMarginal 26,76 % replikerbar EXAKT (1 262 031/4 715 949 = 0,26761; statistics-raden 27,82 % bär annat fönster), EPS 329,62 (EPS-identitet 1 137 557/3 840 vägt = 296,2 på FY2026 — vägt aktietalsklassen); BANK-KASSAFLÖDETS TECKEN: FY-serien OCF/FCF svänger −1,08 → −14,90 → −7,00 → −5,08 → +17,51 T JPY — kundmedelsflöden (depos/utlåning), fcfYield/fcfMarginal NULL enligt RBC/ITUB/RY/HSBA/8306.T-konventionen; balans: kassa 114,33 T, skuld 59,16 T, NETTOKASSA 55,17 T JPY (14 667,40/aktie) — kreditportföljen är tillgången, EV-konceptet meningslöst (ITUB/RY-ordlistan); bokfört EK 16,24 T JPY; ROE 8,57 % (källa; TTM-slut-EK-replik 1 262/16 240 = 7,77 % — källan bär snitt-EK), ROA 0,42 %, ROIC n/a, WACC 1,93 % (Japans räntenivå — 8306.T:s 1,64 %-klass; ROE−WACC +6,6 pp); FY2022→FY2026 (april–mars, slutårsetikett FY2026 = apr 2025–mar 2026, HDFC/8306.T-konventionen exakt) i mdr JPY: rev 2 810,9→3 567,4→3 549,2→3 274,7→4 379,3, netto 499,6→911,8→873,3→478,1→1 137,6, EPS 121,44→222,63→218,98→122,36→295,99; nettoCAGR +22,84 %/år (positiv bas — mätbar, till skillnad från 8306.T:s negativa FY2022-bas), omsCAGR +11,72 %/år; FY2025-DIPPEN netto 478,1 mdr (−45,3 % YoY) med FY2026-återhämtning 1 137,6 (+137,9 %) — orsaken redovisas ej i källpaketet, dippen dokumenteras som den är; utdelning 180 JPY (2,64 %; replik 180/6 830 = 2,635 %) payout 54,61 % replikerbar (180/329,62) — källans payout-rad n/a; ex-div 2026-09-29, nästa rapp 2026-11-13 (8306.T:s datum — sektorns gemensamma H1-rapp); beta 0,39 (5 år), 52v 3 868–7 260 med kursen −5,9 % från toppen; institutioner 41,16 %; analytiker-PT saknas på overview (8316-raden redovisar ej), anställda 123 000; grundat 2002 (Sumitomo-banktradition sedan 1876 — allmän faktakunskap, ej källpaketet); branschfältet Financials/Banks källkonsekvent med 8306.T/RY/HSBA.L/ITUB-radernas finansklass",
  }],
  hamtat: "2026-09-19",
  pris: 6830,
  marknadsKapitalMdr: 25690,
  tillvaxt: {
    omsattningCAGR5ar: 0.1172,
    resultatCAGR5ar: 0.2284,
    omsattningTillvaxtTTM: 0.409,
    prognosTillvaxt: 0.494,
  },
  lonksamhet: {
    roe: 0.0857,
    roic: null,
    bruttoMarginal: null,
    ebitMarginal: null,
    nettoMarginal: 0.2676,
    fcfMarginal: null,
  },
  stabilitet: {
    skuldEgenkapital: null,
    rantaTackning: null,
    fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 20.72, pb: 1.58, evEbit: null, peg: 0.42, fcfYield: null, egenKapitalMultipl: 1.58 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [2810865000000, 3567413000000, 3549224000000, 3274689000000, 4379303000000],
    resultat: [499573000000, 911831000000, 873346000000, 478132000000, 1137557000000],
    egetKapital: [],
    fcf: [-1077892000000, -14902721000000, -7004421000000, -5084339000000, 17506447000000],
  },
  notering: "JAPAN/FINANS-CELLENS ANDRA RAD (Japan 8→9: finans 1→2 bredvid 8306.T — megabank-trion MUFG/SMFG/Mizuho får sitt andra ben i universumet; infriar omg19-u1:s könotis 'SMFG lediga (u2:notis)') och RÄNTEVÄNDANSENS ANDRA BEVIS: nettoresultatet 499,6 mdr JPY (FY2022) → 911,8 → 873,3 → 478,1 (FY2025-dippen −45,3 % YoY, orsak ej redovisad i källpaketet — dokumenterad som den är) → 1 137,6 mdr (FY2026) med TTM 1 262,0 (+154,6 % mot dipettåret) — BOJ:s utgång ur negativa räntor syns i samma intäktstrappa som 8306.T:s men med POSITIV FY2022-bas: resultatCAGR +22,84 %/år mätbar där MUFG:s var NULL (negativ bas) — parets pedagogik: basåret avgör om CAGR ens får finnas. MULTIPEL-PEDAGOGEN: P/E 20,72 mot forward 13,87 = marknadens prissatta vinsttillväxt +49 % (PEG 0,42 spår / källans 0,99 på 3-års EPS-tillväxt — läs alltid vilken tillväxtmultipeln står på); P/B 1,58 mot 8306.T:s 1,68 — två japanska megabanker inom samma P/B-fack medan ROE 8,57 % mot 9,46 %. KAPITALÅTERKOMSTEN: utdelning 180 JPY (2,64 %) payout 54,61 % replikerbar — RBI-liknande kapitalbasdisiplin finns ej här (japanska banker under BOJ:s kapitalkrav) men payout-klass ~55 % mot MUFG:s 54,87 % — sektorns gemensamma fack. BANKENS REALIA: NETTOKASSA 55,17 T JPY (kassa 114,33 − skuld 59,16) — EV meningslöst (ITUB/RY-ordlistan); OCF-svängen −5,08 → +17,51 T JPY FY2025→FY2026 = kreditportföljens svängning, inte driftskassa; WACC 1,93 % (Japans klass) ⇒ ROE−WACC +6,6 pp; beta 0,39 (5 år); ex-div 2026-09-29, nästa rapp 2026-11-13 (8306.T:s datum — H1-gemensam). Institutioner 41,16 % (mot 8306.T:s högre klass — free float-skillnaden i samma börsklass). Anställda 123 000. UTBILDNINGSDOKTRIN: nyckeltalen visar hur en japansk megabank räknas — ALDRIG köp-/säljsignaler.",
};

const AXA = {
  ticker: "CS.PA",
  namn: "AXA SA",
  bransch: "finans",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-19",
    url: "https://stockanalysis.com/quote/epa/CS/ (+ /statistics/ + /financials/)",
    paranoid: "EURONEXT-PARIS-PRIMÄRNOTING i EUR (BNP.PA/MC.PA-precedensen; underlag S&P Global Market Intelligence + Fiscal.ai; close 2026-09-18 17:39 CET, −0,73 %): pris 44,73 EUR, mcap 90,50 mdr EUR på 2,02 Mdr aktier (replik 2,02 × 44,73 = 90,35 — 0,17 %), P/E 12,07 med MULTI-EPS-PEDAGOGEN dokumenterad: källans EPS-rad 4,79 EUR (justerad) ger replik 44,73/4,79 = 9,34 medan P/E-raden 12,07 implicerar EPS 3,705 (rapporterat GAAP-netto ≈ 7,49 mdr) och payout-raden 51,67 % implicerar 2,32/0,5167 = 4,49 — TRE EPS-VARIANTER i samma källpaket (försäkringskonventionens underliggande/räknat-väsentliga-skillnad); huvudfältet bär källans P/E-rad 12,07 (källkonsekvens), alla tre varianterna här i protokollet — LÄXAN: läs alltid vilken EPS multipeln står på; forward P/E 10,32 ⇒ prognosTillväxt +16,96 % TTE (trailing/fwd-modellen; källans EPS-prognos 3 år +7,54 %/år som kalibreringsnot; PEG 0,71 spår / källans 1,52), P/B 1,77 med BVPS-spridningen dokumenterad (BVPS-raden 22,09 EUR ⇒ replik 44,73/22,09 = 2,024, +14 % — totalt EK inklusive minoritet/hybrids mot common-EK, HDFC:s BVSP-spridningsklass i större skala); TTM EUR (mdr): rev 96,794 (+3,8 %), netto 9,883 (+29,0 %) med nettoMarginal 10,21 % replikerbar (9 883/96 794 = 0,10210; statistics-raden 10,38 % bär annat fönster), EPS 4,79 (+36,5 %), FCF 14,501 mdr (fcfYield 16,02 % = 14 501/90 500 · fcfMarginal 14,98 % — TRYG/SAMPO-försäkringskonventionen TILLÅTER FCF-fält med ALV/BRK-reservationen: premieflöden intas FÖRE skadeutbetalning, ej utdelningsbar kassa), operating income FY2025 10,418 mdr ⇒ ebitMarginal 11,00 % (10 418/94 691), evEbit NULL med dokumentation (nettokassa −42,59 mdr gör EV till glädjesiffra — bank-ordlistan applicerad: källans Net Cash/aktie −21,05 EUR bär kundmedel); balans: kassa 99,86 mdr, skuld 61,11 mdr; ROE 14,88 % (källa; BVPS-EK-replik 9,883/44,7 = 22,1 % — spridningen dokumenterad: källans ROE bär totalt EK ≈ 66,4 mdr inklusive minoritet/hybrids), ROA 1,05 %, ROIC 7,47 % (försäkringskonventionen bär ROIC — TRYG 10,89 %-klassen), WACC 4,83 % (ROE−WACC +10,1 pp); FY2021→FY2025 (kalenderår, januari–december) i mdr EUR: rev 122,171→86,793→85,717→91,255→94,691, netto 7,100→4,879→7,004→7,685→9,623, EPS 2,97→2,12→3,12→3,50→4,53, FCF 6,176→8,307→3,573→11,402→22,242; IFRS 17/9-BROTTET: FY2021:s 122,2 mdr rev är pre-IFRS17-beräknat medan FY2022+ är restaterat ⇒ 5-års omsCAGR −6,17 %/år är BASEFFEKTEN (Holcim/GSK-scope-klassen), den konsekventa IFRS17-basen FY2022→FY2025 = +2,95 %/år (dokumenterad not) — intäktsradens −29 %-hopp 2021→2022 är omräkning, inte kollaps; nettoCAGR +7,90 %/år (positiv bas — mätbar); segment FY2025: P&C 58,0 · Life 37,5 · Health 19,0 · Asset Management 1,7 · Banking 0,1 (−0,9 koncernrad) — tre ben över 19 mdr; utdelning 2,32 EUR (5,19 %; replik 2,32/44,73 = 5,187 %) payout 51,67 % (källa; repliken på justerad EPS 2,32/4,79 = 48,4 % — multi-EPS-klassen igen), ex-div 2026-05-11, nästa rapp 2026-10-29; beta 0,58 (5 år), 52v 36,55–45,66 med kursen −2,0 % från toppen; institutioner 33,60 %; analytiker Buy 18 st PT 52,01 EUR (+16,28 %); anställda 107 756; grundat 1817 (Compagnie d'Assurances Générales — allmän faktakunskap, ej källpaketet); branschfältet Financials/Insurance källkonsekvent med TRYG.CO/SAMPO.HE-radernas finansklass",
  }],
  hamtat: "2026-09-19",
  pris: 44.73,
  marknadsKapitalMdr: 90.5,
  tillvaxt: {
    omsattningCAGR5ar: -0.0617,
    resultatCAGR5ar: 0.079,
    omsattningTillvaxtTTM: 0.038,
    prognosTillvaxt: 0.1696,
  },
  lonksamhet: {
    roe: 0.1488,
    roic: 0.0747,
    bruttoMarginal: null,
    ebitMarginal: 0.11,
    nettoMarginal: 0.1021,
    fcfMarginal: 0.1498,
  },
  stabilitet: {
    skuldEgenkapital: null,
    rantaTackning: null,
    fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 12.07, pb: 1.77, evEbit: null, peg: 0.71, fcfYield: 0.1602, egenKapitalMultipl: 1.77 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [122171000000, 86793000000, 85717000000, 91255000000, 94691000000],
    resultat: [7100000000, 4879000000, 7004000000, 7685000000, 9623000000],
    egetKapital: [],
    fcf: [6176000000, 8307000000, 3573000000, 11402000000, 22242000000],
  },
  notering: "FRANKRIKE/FINANS-CELLENS ANDRA RAD (Frankrike 5→6: BNP.PA banken + CS.PA försäkringen — eurozons andra ekonomi får sitt andra finansben; infriar omg19-u1:s könotis 'AXA lediga (u2:notis)') och VÄRLDENS STÖRSTA SKADEFÖRSÄKRARE-KLASS I UNIVERSUMET: mcap 90,5 mdr EUR mot TRYG.CO:S pocket-format — försäkringspedagogiken får sin europeiska fullskala bredvid de nordiska ankarna (TRYG/SAMPO). MULTI-EPS-PEDAGOGEN (cellens kärnfynd): källpaketet bär TRE EPS-VARIANTER — justerad 4,79 EUR, P/E-implicit 3,705 (rapporterat), payout-implicit 4,49 — och multipeln 12,07 står på den RAPPORTERADE: läs alltid vilken EPS en multipel står på innan du jämför mellan bolag (P/E 12,07 mot repliken 9,34 på justerad = 29 %-skillnad i samma bolag samma dag). IFRS 17/9-BROTTET: intäktsraden 122,2 (FY2021, pre-IFRS17) → 86,8 (FY2022, restaterat) = OM RäKNNING, inte kollaps — 5-års omsCAGR −6,17 %/år är baseffekten (Holcim/GSK-scope-klassen) medan den konsekventa IFRS17-basen FY2022→FY2025 = +2,95 %/år som dokumenterad not; nettoresultatet växer genom brottet: 7,1→4,9→7,0→7,7→9,6 mdr EUR (+7,90 %/år) med TTM 9,88 mdr (+29,0 %). UTDDELNINGEN SOM KÄRNA: 2,32 EUR (5,19 % EXAKT replik 2,32/44,73 = 5,187 %) payout 51,67 % — EU-försäkringens utdelningslokal med fem procent-klassens yield mot TRYG:s nordiska motsvarighet; FCF 14,5 mdr TTM (yield 16,02 %) med ALV/BRK-reservationen: premieflöden intas före skadeutbetalning — ej utdelningsbar kassa (TRYG-konventionens dokumentation). BALANSEN: nettokassa −42,59 mdr EUR (kassa 99,86 − skuld 61,11) — EV meningslöst, bank-ordlistan; ROE 14,88 % mot TRYG 12,15 % och ROIC 7,47 % mot WACC 4,83 % (+2,6 pp — försäkringens smalare moat-spridning än bankens); segmenten FY2025: P&C 58,0 · Life 37,5 · Health 19,0 mdr — tre ben över 19 mdr (diversifieringen TRYG saknar). Beta 0,58; 52v 36,55–45,66 (−2,0 % från toppen); institutioner 33,60 %; analytiker Buy 18 st PT 52,01 (+16,28 %); ex-div 2026-05-11, nästa rapp 2026-10-29; anställda 107 756. UTBILDNINGSDOKTRIN: nyckeltalen visar hur en europeisk försäkringskoncern räknas — ALDRIG köp-/säljsignaler.",
};

// ── Kontraktstest: fältfattnet mot mallarna (8306.T + BNP.PA) ─────────────────
const mall = u.find((b) => b.ticker === "8306.T");
const mallFalt = Object.keys(mall);
for (const ny of [SMFG, AXA]) {
  const saknas = mallFalt.filter((f) => !(f in ny));
  if (saknas.length) { console.error("ABORT: fält saknas på", ny.ticker, ":", saknas); process.exit(1); }
  const extra = Object.keys(ny).filter((f) => !mallFalt.includes(f));
  if (extra.length) { console.error("ABORT: extra fält på", ny.ticker, ":", extra); process.exit(1); }
  for (const grupp of ["tillvaxt", "lonksamhet", "stabilitet", "aterkop", "moat", "vardering", "golv", "serier"]) {
    const a = JSON.stringify(Object.keys(mall[grupp]).sort());
    const b = JSON.stringify(Object.keys(ny[grupp]).sort());
    if (a !== b) { console.error("ABORT: grupp", grupp, "avviker på", ny.ticker); process.exit(1); }
  }
}

u.push(SMFG, AXA);
writeFileSync(UNI, JSON.stringify(u, null, 2) + "\n");

// ── Läckagevakt inbyggd: läs tillbaka ×2, samma antal båda gångerna ──────────
const las1 = JSON.parse(readFileSync(UNI, "utf8"));
const las2 = JSON.parse(readFileSync(UNI, "utf8"));
if (las1.length !== las2.length || las1.length !== FÖRE + 2) {
  console.error(`ABORT L1: antal ${FÖRE}→${las1.length}/${las2.length} — ej stabilt ×2`);
  process.exit(1);
}
const s1 = las1.find((b) => b.ticker === "8316.T");
const a1 = las1.find((b) => b.ticker === "CS.PA");
if (!s1 || !a1) { console.error("ABORT L1: nya raderna hittades ej i readback"); process.exit(1); }
if (s1.vardering.pe !== 20.72 || a1.vardering.pe !== 12.07) { console.error("ABORT L1: tal-paritet bruten i readback"); process.exit(1); }
const lander = {};
las2.forEach((b) => lander[b.land] = (lander[b.land] || 0) + 1);
console.log(`INLÄGG GRÖN: ${FÖRE}→${las1.length} (readback ×2 identiskt ${las2.length}) · Japan ${lander["Japan"]} · Frankrike ${lander["Frankrike"]} · finans ${las2.filter((b) => b.bransch === "finans").length}`);
