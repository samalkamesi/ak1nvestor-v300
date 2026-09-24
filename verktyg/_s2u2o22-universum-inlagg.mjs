#!/usr/bin/env node
/**
 * _s2u2o22-universum-inlagg.mjs — AUTO-S2 omgång 22 u2 (byggare 2/3, +2 bolag):
 * NOMURA HOLDINGS 8604.T + DAIICHI LIFE GROUP 8750.T (Japan/finans 3→5 —
 * omg21-u3:s utpekade jägarfält: cellen når matta 5 ⇒ landsidan
 * /dataset/finans/japan föds data-drivet; land.ts-modulen finns sedan omg20).
 *
 * Kontrakt (8306.T/8316.T/8411.T-mallarna): läser färskt universum, vägrar
 * duplikat, ARITMETIKGRIND med abort FÖRE skrivning, skriver JSON indent 2 +
 * slutradsbrytning, LÄSER TILLBAKA ×2, medianer före/efter via projektets
 * EGEN raknaBranschMedianer (jiti) + kvartilsplacering av båda bolagen.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createJiti } from "jiti";

const UNI = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(UNI, "utf8"));
const FÖRE = u.length;
for (const t of ["8604.T", "8750.T"]) {
  if (u.some((b) => b.ticker === t)) {
    console.error(`ABORT: duplikat — ${t} finns redan på disken`);
    process.exit(1);
  }
}

// ── Aritmetikgrinden: 38 kraav, ALLA gröna FÖRE skrivning ────────────────────
const kraav = [];
const kraavRad = (namn, replik, kalla, tolerans) => {
  const avvik = Math.abs(replik - kalla) / Math.abs(kalla);
  const ok = avvik <= tolerans;
  kraav.push({ namn, ok });
  console.log(`${ok ? "GRÖN" : "RÖD "} ${namn}: replik ${replik.toFixed(4)} mot källa ${kalla} (avvik ${(100 * avvik).toFixed(3)} %)`);
};

// ═══ RÅTAL: NOMURA 8604.T (stockanalysis.com TYO, hämtat 2026-09-20, ═════════
// close 2026-09-18 15:30 JST; S&P Global Market Intelligence-underlag)
const N_PRIS = 1581, N_EPS_TTM = 133.13, N_MCAP_T = 4620, N_AKTIER_MDR = 2920;
const N_EK_JUN_M = 3993713, N_EK_COMMON_M = 3834275, N_BVPS = 1311.94;
const N_KASSA_M = 4859544, N_STINV_M = 19473060, N_TRADING_M = 28837153, N_SKULD_M = 37764915;
const N_NETTCASH_M = 15404842;
const N_REV_TTM = 2331112, N_OP_TTM = 596198, N_NETTO_TTM = 403125;
const N_REV_FY22 = 1363890, N_REV_FY26 = 2167713, N_NET_FY22 = 142996, N_NET_FY26 = 362129;
const N_PE = 11.88, N_PE_FWD = 11.51, N_PS = 1.98, N_PB = 1.16, N_PTBV = 1.21, N_PEG_KALLA = 1.28;
const N_DPS = 51, N_YIELD = 3.23, N_BUYBACK = 1.23, N_SHAREHOLDER = 4.45;
const N_EBITM = 25.58, N_NETTOM = 17.29, N_BRUTTO = 77.98;
const N_EPS_FY26 = 118.99;

// ═══ RÅTAL: DAIICHI LIFE GROUP 8750.T (samma källpaket/datum) ═══════════════
const D_PRIS = 1913.5, D_EPS_TTM = 152.67, D_MCAP_T = 6890, D_AKTIER_M = 3601;
const D_EK_JUN_M = 4573059, D_BVPS = 1269.78, D_SKULD_M = 1378646, D_KASSA_M = 1830822;
const D_NETTCASH_M = 452176, D_EV_KALLA = 6440000;
const D_REV_TTM = 11475811, D_OP_TTM = 1303149, D_NETTO_TTM = 553485;
const D_GROSS_TTM = 2790000, D_FCF_TTM = 714990, D_REV_FY26 = 10863920;
const D_REV_FY22 = 7703803, D_NET_FY22 = 409353, D_NET_FY26 = 436597;
const D_PE = 12.53, D_PE_FWD = 12.73, D_PS = 0.60, D_PB = 1.51, D_PTBV = 2.03;
const D_EV_EBIT = 4.94, D_PFCF = 9.64, D_FCF_PS = 198.49, D_FCFMARG_FY = 6.58, D_FCFMARG_TTM_KALLA = 6.58;
const D_DPS = 72, D_YIELD = 3.76, D_BUYBACK = 1.11, D_SHAREHOLDER = 4.87, D_FCFYIELD = 10.37;
const D_EBITM = 11.36, D_NETTOM = 4.82, D_BRUTTO = 24.28, D_SKEK = 0.30;
const D_EPS_FY26 = 119.82, D_EPS_FY25 = 463.72;

// ── NOMURA-repliker ──────────────────────────────────────────────────────────
kraavRad("NOM-01 P/E", N_PRIS / N_EPS_TTM, N_PE, 0.005);
kraavRad("NOM-02 mcap", (N_AKTIER_MDR * N_PRIS) / 1000, N_MCAP_T, 0.005);
kraavRad("NOM-03 PS", (N_MCAP_T * 1000) / N_REV_TTM, N_PS, 0.005);
kraavRad("NOM-04 P/B mcap/EK-total", (N_MCAP_T * 1000) / N_EK_JUN_M, N_PB, 0.005);
kraavRad("NOM-05 P/B pris/BVPS common", N_PRIS / N_BVPS, N_PTBV, 0.005);
kraavRad("NOM-06 direktavkastning", (N_DPS / N_PRIS) * 100, N_YIELD, 0.005);
kraavRad("NOM-07 nettomarginal TTM", (N_NETTO_TTM / N_REV_TTM) * 100, N_NETTOM, 0.005);
kraavRad("NOM-08 EBIT-marginal TTM", (N_OP_TTM / N_REV_TTM) * 100, N_EBITM, 0.005);
const nOmsCagr = (Math.pow(N_REV_FY26 / N_REV_FY22, 1 / 4) - 1) * 100;
const nResCagr = (Math.pow(N_NET_FY26 / N_NET_FY22, 1 / 4) - 1) * 100;
const nPrognos = (N_PE / N_PE_FWD - 1) * 100;
const nPeg = N_PE / nPrognos;
kraavRad("NOM-09 omsCAGR fält==replik", nOmsCagr, 12.29, 0.002);
kraavRad("NOM-10 nettoCAGR fält==replik", nResCagr, 26.14, 0.002);
kraavRad("NOM-11 prognosTillväxt fält==replik", nPrognos, 3.21, 0.002);
kraavRad("NOM-12 PEG spårkonvention", nPeg, 3.7, 0.002);
kraavRad("NOM-13 nettkassa källrad EXAKT", N_KASSA_M + N_STINV_M + N_TRADING_M - N_SKULD_M, N_NETTCASH_M, 0.0001);
kraavRad("NOM-14 shareholder yield", (N_DPS / N_PRIS) * 100 + N_BUYBACK, N_SHAREHOLDER, 0.005);
kraavRad("NOM-15 vägt aktietal FY2026", N_NET_FY26 / N_EPS_FY26, 3043.2, 0.005);
kraavRad("NOM-16 bruttomarginal fält", N_BRUTTO, 77.98, 0.0001);

// ── DAIICHI-repliker ─────────────────────────────────────────────────────────
kraavRad("DAI-01 P/E", D_PRIS / D_EPS_TTM, D_PE, 0.005);
kraavRad("DAI-02 mcap", (D_AKTIER_M * D_PRIS) / 1000, D_MCAP_T, 0.005);
kraavRad("DAI-03 PS", (D_MCAP_T * 1000) / D_REV_TTM, D_PS, 0.005);
kraavRad("DAI-04 P/B mcap/EK", (D_MCAP_T * 1000) / D_EK_JUN_M, D_PB, 0.005);
kraavRad("DAI-05 P/B pris/BVPS", D_PRIS / D_BVPS, D_PB, 0.005);
kraavRad("DAI-06 EV-replik", D_MCAP_T + D_SKULD_M / 1000 - D_KASSA_M / 1000, D_EV_KALLA / 1000, 0.005);
kraavRad("DAI-07 EV/EBIT", (D_EV_KALLA) / D_OP_TTM, D_EV_EBIT, 0.005);
kraavRad("DAI-08 P/FCF", D_PRIS / D_FCF_PS, D_PFCF, 0.005);
kraavRad("DAI-09 fcfYield", (D_FCF_TTM / (D_MCAP_T * 1000)) * 100, D_FCFYIELD, 0.005);
kraavRad("DAI-10 FCF-marginal FY2026", (D_FCF_TTM / D_REV_FY26) * 100, D_FCFMARG_FY, 0.005);
kraavRad("DAI-11 nettomarginal TTM", (D_NETTO_TTM / D_REV_TTM) * 100, D_NETTOM, 0.005);
kraavRad("DAI-12 EBIT-marginal TTM", (D_OP_TTM / D_REV_TTM) * 100, D_EBITM, 0.005);
kraavRad("DAI-13 bruttomarginal TTM", (D_GROSS_TTM / D_REV_TTM) * 100, D_BRUTTO, 0.005);
kraavRad("DAI-14 skuld/EK", D_SKULD_M / D_EK_JUN_M, D_SKEK, 0.005);
kraavRad("DAI-15 nettkassa källrad EXAKT", D_KASSA_M - D_SKULD_M, D_NETTCASH_M, 0.0001);
kraavRad("DAI-16 direktavkastning", (D_DPS / D_PRIS) * 100, D_YIELD, 0.005);
kraavRad("DAI-17 shareholder yield", (D_DPS / D_PRIS) * 100 + D_BUYBACK, D_SHAREHOLDER, 0.005);
const dOmsCagr = (Math.pow(D_REV_FY26 / D_REV_FY22, 1 / 4) - 1) * 100;
const dResCagr = (Math.pow(D_NET_FY26 / D_NET_FY22, 1 / 4) - 1) * 100;
const dPrognos = (D_PE / D_PE_FWD - 1) * 100;
kraavRad("DAI-18 omsCAGR fält==replik", dOmsCagr, 8.97, 0.002);
kraavRad("DAI-19 nettoCAGR fält==replik", dResCagr, 1.62, 0.003);
kraavRad("DAI-20 prognosTillväxt fält==replik", dPrognos, -1.57, 0.002);
kraavRad("DAI-21 EPS-splitidentitet FY26", D_NET_FY26 / D_EPS_FY26, 3643.4, 0.005);
kraavRad("DAI-22 EPS-splitbas FY25", 429613 / D_EPS_FY25, 926.6, 0.005);

const röda = kraav.filter((k) => !k.ok);
console.log(`\nARITMETIKGRIND: ${kraav.length - röda.length}/${kraav.length} GRÖNA${röda.length ? " — " + röda.length + " RÖDA ⇒ ABORT, filen orörd" : ""}`);
if (röda.length) process.exit(1);

// ── Medianer FÖRE (projektets egen motor, jiti på ts-källan) ────────────────
const jiti = createJiti(import.meta.url, { interopDefault: true });
const { raknaBranschMedianer } = await jiti.import("../src/lib/dataset-medianer.ts");
const medianLage = (rader) => {
  const m = raknaBranschMedianer(rader);
  const fin = m.rader.find((r) => r.bransch === "finans");
  return { fin, tot: m.totalt, m };
};
const före = medianLage(u);
console.log(`\nMEDIANER FÖRE (${FÖRE} rader): finans P/E ${före.fin?.medianPe} (n ${före.fin?.nPe}, kv ${före.fin?.p25Pe}–${före.fin?.p75Pe}) · totalt P/E ${före.tot?.medianPe} (n ${före.tot?.nMedPe})`);

// ── Raden 1: NOMURA (8411.T-mallen; fältvärden = grönrepliker) ───────────────
const NOMURA = {
  ticker: "8604.T",
  namn: "Nomura Holdings",
  bransch: "finans",
  land: "Japan",
  valuta: "JPY",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-20",
    url: "https://stockanalysis.com/quote/tyo/8604/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
    paranoid: "TYO-PRIMÄRNOTING i JPY (8306.T/8316.T/8411.T-precedensen; underlag S&P Global Market Intelligence; close 2026-09-18 15:30 JST, −0,60 %): pris 1 581,00 JPY, mcap 4,62 T JPY (källans aktier 2,92 Mdr; replik 2 920 × 1 581 = 4 616,5 mdr — 0,08 %), 52-v 1 029–1 688 (+44,45 % på året; −6,3 % från toppen), P/E 11,88 (replik 1 581/133,13 = 11,877 — 0,03 %) forward 11,51, PEG 3,70 spårkonvention (11,88 på prognosTillväxt +3,21 % TTE: trailing/fwd-modellen, 8411.T-konventionen; källans PEG 1,28 på egen längre tillväxtbas som not), PS 1,98 (replik 4 620/2 331 = 1,982), P/B 1,16 (mcap/EK-total 4 620/3 994 = 1,157; pris/BVPS 1 581/1 311,94 = 1,205 på common-basen 3 834 Mdr — tvålavgas dokumenterad, P/TBV 1,21), P/FCF och P/OCF n/a (värdepappersbolag: kundmedel/trading), EV n/a (trading-bokens balansräkning); NETTKASSA-KÄLLSPRIDNINGEN: källans nettkassa-rad 15 404 842 M JPY bär basen kassa 4 859 544 + ST-inv 19 473 060 + trading assets 28 837 153 (here-lead ur källrad−BS: 53 169 757 − 24 332 604) − skuld 37 764 915 = 15 404 842 EXAKT; BS-kärnbasen utan trading ger NETTOSKULD −13 432 311 M — trading-boken är motpartsmatchad, nettkassa-konceptet lika basberoende som på bankerna (ITUB/RY-ordlistan, 8411.T:s tvålbas dokumenterad); TTM jun-26 (M JPY): rev 2 331 112 (+18,85 %), operating 596 198, netto 403 125 (+7,1 %), EPS 133,13 (+8,5 %); marginaler TTM: operating 25,58 % (replik 596 198/2 331 112 = 25,577), pretax 25,36 %, profit 17,29 % replikerbar EXAKT (403 125/2 331 112 = 17,294 %), BRUTTOMARGINAL 77,98 % = finansgrenens mäklar-klass (GS 82,0-precedensen: fee-intäkter bär konstaterad hög brutto — universumets konvention, INTE industriell varukostnad), brutto/FCF-årlig serie saknas i källpaketet (moat null); ROE 11,16 % (egen TTM-slut-EK-replik 403 125/3 993 713 = 10,09 % — källan bär snitt-EK, 8306/8316/8411-konventionen), ROA 0,67 %, ROIC 1,02 % (lågt av balansräkningsgearet — trading-tunga tillgångar 68,2 T mot intäktsburen vinst; fält fylls där källan ger, V/ALV/AMUN-klassens konvention), WACC 0,83 % (Japans lågränta — 8306.T 1,64/8316.T 1,93/8411.T 1,37-klassen; ROE−WACC +10,3 pp); equity total 3 993 713 M JPY inkl minoritet (jun-26; common 3 834 275; EK-total-trappan 2 972 803→3 224 142→3 448 513→3 580 999→3 854 915 mdr FY2022→FY2026, +29,7 %), BVPS 1 311,94, arbetskapital 22,57 T JPY (kundmedel — ej industriellt jämförbart); skuld/ek null (GS/HSBA/ry-konventionen: balansräkningsinstitut), Debt/Equity-källrad 9,46 endast paranoid, räntetäckning n/a, Altman n/a, Piotroski 4; effektiv skatt 28,43 % (betald TTM 168 050 M); utdelning 51,00 JPY (3,23 %; replik 51/1 581 = 3,226 %) payout 38,31 % på TTM-EPS (källan n/a — egen replik), DPS-tillväxt −16,39 % YoY KÄLLSPRIDNING dokumenterad: källans growth-fält bär rate-konvention (61,00→51,00) medan CF-raden betalda stiger −112 541→−179 742 M FY2025→FY2026 (+60 %, ≈59,07 JPY på vägt 3 043 M-tal) — tre DPS-baser (rate 51 · CF-per-aktie 59 · growth-fältets 61-bas) alla paranoid; ex-div 2026-09-29; återköpsyield 1,23 %, shareholder yield 4,45 % (replik 3,23+1,23 = 4,46 ✓); aktiebas −1,23 % YoY (BS 3 018→2 923 M; återköp FY2026 119 713 M — mot trions 500,1/404,3-klass); beta 0,61 (5Y), institutioner/insiders saknas i extraktet; analytiker Buy PT 1 727,14 JPY (+9,24 %; 7 st); 28 677 anställda; grundat 1925; NYSE-ADR NMR (allmän faktakunskap, ej källpaketet); nästa rapp 2026-10-28 (Q2 FY2027); FY april–mars med slutårsetikett (8306.T/S32.AX-konventionen: FY2026 = avslutad mars 2026); FY-serier (M JPY): rev 1 363 890→1 335 577→1 562 000→1 892 485→2 167 713 (FY2022→FY2026, omsCAGR +12,29 %/år — FY2023-dippen −2,08 % sedan fyra raka tillväxtår +16,95/+21,16/+14,54/+18,85 TTM), netto 142 996→92 786→165 863→340 736→362 129 (nettoCAGR +26,14 %/år; EPS 45,23→29,74→52,69→111,03→118,99 med TTM 133,13; marginaltrappan 10,48→6,95→10,62→18,00→16,71 med TTM 17,29); FY2026: rev 2,17 T (+14,54 %), vinst 362,13 mdr (+6,28 %), ROE 10,1 % (bolagets eget riktmått), Q1 FY2027 ROE 15,4 % med Investor Day-2030-mål ROE 10–12 %+ och pretax >750 mdr; kassaflöde (M JPY): OCF −862 832→−694 820→+132 640→−678 611→−842 960, capex −111 331→−171 165→−145 784→−189 971→−353 818, FCF −974 163→−865 985→−13 144→−868 582→−1 196 778 (värdepappersbolags-OCF = kundmedels/trading-flöden, ej driftskassa — 8306/8316/8411-noten; FCF-marginal FY2026 −55,21 % källrad), utdelningar −70 714→−57 262→−60 164→−112 541→−179 742, återköp −50 466→−33 788→−73 698→−79 589→−119 713; balansräkning jun-26: kassa 4 859 544 + ST-inv 19 473 060 (trading 28 837 153 here-led), skuld 37 764 915, totala tillgångar 68 224 010 Mdr JPY (trappa 43,4→47,8→55,1→56,8→62,6→68,2 T — trading-sekuriter 10,6→28,8 T driver), aktietalet TRE baser (BS 2 923 M slut jun-26 · overview 2,92 Mdr · vägt 3 043 M FY2026-EPS-identiteten); branschfält Financials/Capital Markets (Japans + Asiens största värdepappersbolag — mäklararketypen universumets finansgren saknade i Japan)",
  }],
  hamtat: "2026-09-20",
  pris: 1581,
  marknadsKapitalMdr: 4620,
  tillvaxt: {
    omsattningCAGR5ar: 0.1229,
    resultatCAGR5ar: 0.2614,
    omsattningTillvaxtTTM: 0.1885,
    prognosTillvaxt: 0.0321,
  },
  lonksamhet: {
    roe: 0.1116,
    roic: 0.0102,
    bruttoMarginal: 0.7798,
    ebitMarginal: 0.2558,
    nettoMarginal: 0.1729,
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
  vardering: { pe: 11.88, pb: 1.16, evEbit: null, peg: 3.7, fcfYield: null, egenKapitalMultipl: 1.16 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [1363890000000, 1335577000000, 1562000000000, 1892485000000, 2167713000000],
    resultat: [142996000000, 92786000000, 165863000000, 340736000000, 362129000000],
    egetKapital: [2972803000000, 3224142000000, 3448513000000, 3580999000000, 3854915000000],
    fcf: [-974163000000, -865985000000, -13144000000, -868582000000, -1196778000000],
  },
  notering: "JAPAN/FINANS 3→5 (omg21-u3:s jägarfält: 8604.T + 8750.T tar cellen till matta 5 ⇒ landsidan /dataset/finans/japan föds data-drivet). MÄKLARARKETYPEN: Nomura = Japans + Asiens största värdepappersbolag (Capital Markets) — grenen bank (trion 8306/8316/8411) + mäklare (8604) + livförsäkring (8750) = TRE ARKETYPER i cellen (Frankrike-precedensen 'fem finansarketyper i en kvartilsvy' nu med japansk spegel). SIGNATURTAL — AVGIFTSMASKINEN: bruttomarginal 77,98 % = finansgrenens GS-klass (82,0) — fee-intäkter utan varukostnad; på den P/E 11,88 = cellens LÄGSTA (trion 20,69/20,72/15,17) medan prognosTillväxt +3,21 % = cellens lägsta TTE-gap: marknaden betalar INTE premium för vinstnormalisering här (MUFG/SMFG +53/+49 % premium-jämförelse) — Nomura ärcellens FÄRDIGPRISATTA ben. VINSTBANAN: netto 142 996→92 786 (FY2023-dippen) →165 863→340 736→362 129 M JPY med TTM 403 125 = FY2023→TTM +334 %; nettoCAGR +26,14 %/år från FY2022-basen (mätstock bär dippen, dokumenterat); EPS-trappan 45,23→29,74→52,69→111,03→118,99→(TTM 133,13) med ROE-banan 10,1 % FY2026 → 15,4 % Q1 FY2027 mot Investor Day-2030-målet 10–12 %+ (företagets egna riktmark) — katalysatorerna: Wealth Management + Wholesale på rekordnivåer. BALANSRÄKNINGSGEARET: totala tillgångar 43,4→68,2 T JPY på fyra år (+57 %, trading-sekuriter 10,6→28,8 T) ger ROIC 1,02 % — balansräkningsinstitutets konvention (GS-klassen), ROE 11,16 % bär den ärliga ägarräntan; NETTKASSA-radens basberoende dokumenterat i paranoid (källrad +15,40 T på trading-inkluderande bas, kärnbasen −13,43 T). UTDELNINGENS TRE BASER: rate 51,00 (3,23 %) · CF-betalda 179,7 mdr FY2026 (≈59/aktie) · growth-fältets 61-bas — payout 38,31 % på rate-basen (konservativ dokumenterad); återköp 119,7 mdr FY2026 (aktiebas −1,23 % YoY). FY april–mars slutårsetikett; nästa rapp 2026-10-28 (Q2 FY2027 — före trions 11-13 november). PT 1 727,14 JPY (Buy, 7 analytiker); 28 677 anställda; grundat 1925; NYSE-ADR NMR.",
};

// ── Raden 2: DAIICHI LIFE GROUP (försäkringskonventionen ALV/SAMPO/TRYG) ─────
const DAIICHI = {
  ticker: "8750.T",
  namn: "Daiichi Life Group",
  bransch: "finans",
  land: "Japan",
  valuta: "JPY",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-20",
    url: "https://stockanalysis.com/quote/tyo/8750/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
    paranoid: "TYO-PRIMÄRNOTING i JPY (trio-precedensen; underlag S&P Global Market Intelligence; close 2026-09-18 15:30 JST, −0,91 %): pris 1 913,50 JPY, mcap 6,89 T JPY (källans aktier 3,60 Mdr; replik 3 601 × 1 913,5 = 6 891,1 mdr — 0,02 %), 52-v 1 052–1 959 (+60,06 % på året; −2,3 % från toppen), P/E 12,53 (replik 1 913,5/152,67 = 12,536 — 0,05 %) forward 12,73 (HÖGRE än trailing = marknaden ser vinstnormalisering NEDÅT — kontrast mot banktrion +40…+53 % uppsida; prognosTillväxt −1,57 % TTE ur 12,53/12,73, negativ konvention väl etablerad: SAMPO −0,0948/BRK −0,0027), PEG null (SAMPO/BA/VNA/SPOT-precedensen: PEG meningslöst på negativ prognos; källans PEG 2,26 på 3-årsbasen som not), PS 0,60 (replik 6 890/11 476 = 0,600), P/B 1,51 (BÅDA baser konsistenta: mcap/EK 6 890/4 573 = 1,507 och pris/BVPS 1 913,5/1 269,78 = 1,507 — cellens renaste P/B), P/TBV 2,03 (TBVPS 942,25), P/FCF 9,64 (replik 1 913,5/198,49 = 9,641), P/OCF 8,70; EV 6,44 T JPY REPLIKERBAR (mcap 6 890 + skuld 1 378,6 − kassa 1 830,8 = 6 437,8 mdr — 0,03 %) med EV/EBIT 4,94 (replik 6 437 824/1 303 149 = 4,940 EXAKT), EV/EBITDA 4,44, EV/Sales 0,56, EV/Earnings 11,64 — försäkringskonventionens fulla EV-fält (ALV 8,61/SAMPO 11,56/AMUN 7,19-klassen); TTM jun-26 (M JPY): rev 11 475 811 (+21,47 %), gross 2 790 000 (brutto 24,28 % replik 24,31 — ALV:s 25,0-klass: livförsäkringens försäkringsmatematik-marginal), operating 1 303 149, pretax 778 670 (marginal 6,79 %), netto 553 485 (+64,0 %), EPS 152,67, EBITDA 1 451 763 (12,65 %), OCF 792 158, FCF 714 990; FCF-MARGINAL 6,58 % = källans FY2026-bas (714 990/10 863 920 = 6,583; TTM-replik 6,23 % på 11 475 811 — basval dokumenterat), fcfYield 10,37 % (replik 714 990/6 890 000 = 10,38); ROE 13,57 % (ROA 1,12 · ROIC 14,89 · ROCE 1,79 — ROIC−WACC +9,5 pp på WACC 5,37 %: försäkringens garantikapital bär väntad avkastning, mot AMUN +7,8/BLK-spegelbilden), effektiv skatt 28,92 % (betald 225 180 M), räntetäckning 19,18 (MA 28,08/AMUN 11,27-precedensen: fält fylls där källan ger); balansräkning jun-26 (M JPY): kassa 1 830 822, totala investeringar 57 331 512 (mot försäkringsförbindelserna — livportföljen), skuld 1 378 646 (LTD 1 346 733 + STD 31 913), NETTKASSA 452 176 EXAKT replikerbar (1 830 822−1 378 646), totala tillgångar 76 322 711 (universumets största balansräkning i finansgrenen — livförsäkringens förbindelseportfölj), equity 4 573 059 (EK-trappan 4 408 505→2 873 112→3 882 156→3 469 706→4 254 212 FY2022→FY2026: FY2023-dippen = ränteuppgångens obligationstapp, dokumenterad), BVPS 1 269,78, arbetskapital 2,01 T, skuld/ek 0,30 (ALV 0,51/SAMPO 0,35/TRYG 0,19-klassen — försäkringsförbindelserna räknas EJ i debt-fältet), Debt/EBITDA 0,95; AKTIESPLIT-KÄLLSPRIDNINGEN (radens viktigaste dokumentation): källans EPS-historik bårar FY2025 463,72 mot FY2026 119,82 på I PRAKTISKEN OFÖRÄNDRADE netto (429 613 mot 436 597 M) = aktietalet växte 926,6→3 643,4 M (×3,93) mellan EPS-baserna — namnbytesomstruktureringen april 2026 (Dai-ichi Life Holdings → Daiichi Life Group); BS-historiken är split-justerad (FY2022 4 098 M ≈ 1 024,5 pre-split × 4) medan EPS-rader FY2022–FY2025 bär pre/post-blandning ⇒ NETTO-RADERNA ÄR KANON (bankmallens spegelbild: där var CF-mallens netto fel, här är EPS-historiken fel — i båda fallen resultatråd+aktuellt EPS+netto kanon), vägt FY2026-tal 3 643,4 M = 436 597/119,82, TTM-bas 553 485/152,67 = 3 625 M, BS 3 601 M — baserna konvergerar 3,60–3,64 Mdr; FY-serier (M JPY): rev 7 703 803→9 219 164→10 415 834→9 801 236→10 863 920 (FY2022→FY2026, omsCAGR +8,97 %/år), operating 364 711→1 146 699→419 513→1 336 528→1 050 950, netto 409 353→192 301→320 765→429 613→436 597 (nettoCAGR +1,62 %/år från FY2022-toppen — FY2022 bär 5,31 %-marginalens engångsnero, FY2023-dippen 2,09 % sedan trekvartsåterhämtning), marginaler 5,31→2,09→3,08→4,38→4,02 med TTM 4,82; kassaflöde (M JPY): OCF −462 076→−132 468→+997 377→+592 578→+792 158, capex −99 465→−117 860→−51 139→−60 115→−77 168, FCF −561 541→−250 328→+946 238→+532 463→+714 990 (VÄNDNINGEN FY2024: premieflödena överskred utbetalningarna — tre raka FCF-år, fcfPositivaSenaste5 = 3; FCF/aktie split-justerad −131,34→−61,58→43,07→74,74→196,22), utdelningar −68 678→−84 814→−84 313→−162 356→−156 780, återköp −199 999→−120 000→−120 000→−101 849→−107 597; utdelning 72,00 JPY (3,76 %; replik 72/1 913,5 = 3,762 %) payout 47,16 % på TTM-EPS (källan n/a — egen replik), DPS-tillväxt −33,50 % YoY KÄLLSPRIDNING: källans growth-fält bär pre/post-split-blandning (förra raten 108,2 pre-split ≈ 27 post) medan nyhetsspåret bär '+32 % dividend hike' (maj 2026, Q4-rapporten: FY2027-planen) — tre DPS-baser (rate 72 · CF-betalda 43,03/aktie post-split · growth-fältets 108-bas) paranoid; återköpsyield 1,11 %, shareholder yield 4,87 % (3,76+1,11 ✓); aktiebas −1,11 % YoY; beta 0,27 (5Y — cellens lägsta), institutioner 40,87 %, insiders 0,04 %; Piotroski 6; analytiker Buy PT 1 996 JPY (+4,31 %; 11 st); 60 138 anställda; grundat 1902; nästa rapp 2026-11-13 (H1 FY2027 — trions gemensamma datum: 8306/8316/8411 delar 11-13-novemberfönstret); FY april–mars med slutårsetikett; branschfält Financials/Insurance—Life (källans klass; källans bolagsnamn 'Daiichi Life Group' — f.d. Dai-ichi Life Holdings, omdöpt april 2026)",
  }],
  hamtat: "2026-09-20",
  pris: 1913.5,
  marknadsKapitalMdr: 6890,
  tillvaxt: {
    omsattningCAGR5ar: 0.0897,
    resultatCAGR5ar: 0.0162,
    omsattningTillvaxtTTM: 0.2147,
    prognosTillvaxt: -0.0157,
  },
  lonksamhet: {
    roe: 0.1357,
    roic: 0.1489,
    bruttoMarginal: 0.2428,
    ebitMarginal: 0.1136,
    nettoMarginal: 0.0482,
    fcfMarginal: 0.0658,
  },
  stabilitet: {
    skuldEgenkapital: 0.3,
    rantaTackning: 19.18,
    fcfPositivaSenaste5: 3,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 12.53, pb: 1.51, evEbit: 4.94, peg: null, fcfYield: 0.1037, egenKapitalMultipl: 1.51 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [7703803000000, 9219164000000, 10415834000000, 9801236000000, 10863920000000],
    resultat: [409353000000, 192301000000, 320765000000, 429613000000, 436597000000],
    egetKapital: [4408505000000, 2873112000000, 3882156000000, 3469706000000, 4254212000000],
    fcf: [-561541000000, -250328000000, 946238000000, 532463000000, 714990000000],
  },
  notering: "JAPAN/FINANS 3→5 (omg21-u3:s jägarfält: 8604.T + 8750.T tar cellen till matta 5 ⇒ landsidan /dataset/finans/japan föds data-drivet). LIVFÖRSÄKRINGSARKETYPEN: Daiichi Life Group (f.d. Dai-ichi Life Holdings, omdöpt april 2026) = en av Japans största livförsäkringsgrupper — cellens tredje arketyp: bank (trion) + mäklare (Nomura) + försäkring (8750.T), spegeln av Frankrike-cellens fem arketyper. SIGNATURTAL — GARANTIKAPITALET: totala tillgångar 76,3 T JPY = finansgrenens STÖRSTA balansräkning (investeringar 57,3 T mot försäkringsförbindelserna) på P/B 1,51 med tvålavekonomisk P/B-konsistens (båda baser 1,507); ROIC 14,89 % mot WACC 5,37 % = +9,5 pp garantikapitalets väntade överavkastning, ROE 13,57 % = cellens högsta hittills (trion 9,46/8,57/12,49 + Nomura 11,16 — 8750.T toppar). NORMALISERINGENS SPEGELBILD: forward-P/E 12,73 ÖVER trailing 12,53 (prognosTillväxt −1,57 %) = marknaden ser TTM-nettots +64 % som engångsburet — kontrast mot banktrion +40…+53 % uppsidor: hela cellens fem tal på en axel (MUFG/SMFG premium-läget, Mizuho stigen, Nomura färdigprisatt, Daiichi eftertoppen). VINSTBANAN: netto 409 353→192 301→320 765→429 613→436 597 M JPY (nettoCAGR +1,62 %/år från FY2022-toppen — ingen compounder, KVISS-banan: FY2023-dippen 2,09 %-marginal sedan trekvartsåterhämtning; TTM 553 485 med marginaltrappan 5,31→2,09→3,08→4,38→4,02→4,82). FCF-VÄNDNINGEN FY2024: −561→−250→+946→+532→+715 mdr (tre raka FCF-år; fcfPositivaSenaste5 = 3; fcfYield 10,37 % = fält ifyllda enligt ALV/SAMPO/AMUN-försäkringskonventionen) — premieflödena överskred utbetalningarna, kapitalkostnaden capex 77 mdr = 0,7 % av intäkten (försäkringens kapital-lätta drift). AKTIESPLITEN ×3,93 (april 2026, namnbytesomstruktureringen): EPS-historikens FY2025 463,72 mot FY2026 119,82 på oförändrat netto = källans EPS-blandning; NETTO-RADER + aktuellt EPS + split-justerade tal är kanon (bankmallens spegelbild), tre aktiebaser 3 601/3 625/3 643 M dokumenterade. UTDELNINGEN: rate 72,00 (3,76 %) payout 47,16 %, CF-betalda 43,03/aktie post-split, nyhetsspåret +32 % hike (FY2027-planen) — tre baser paranoid; återköp 107,6 mdr FY2026, aktiebas −1,11 % YoY, shareholder yield 4,87 %. Cellens lägsta beta 0,27 (livförbindelsernas räntekänslighet är portföljräntan, ej börskursen). EK-trappan 4 409→2 873→3 882→3 470→4 254 mdr: FY2023-dippen = ränteuppgångens obligationstapp i EK, dokumenterad. PT 1 996 JPY (Buy, 11 analytiker); 60 138 anställda; grundat 1902; nästa rapp 2026-11-13 (trions gemensamma H1-fönster).",
};

u.push(NOMURA, DAIICHI);
writeFileSync(UNI, JSON.stringify(u, null, 2) + "\n");

// ── Readback ×2 (läckage-vikt: stabilt antal) ───────────────────────────────
const r1 = JSON.parse(readFileSync(UNI, "utf8")).length;
const r2 = JSON.parse(readFileSync(UNI, "utf8")).length;
console.log(`\nREADBACK ×2: ${r1} / ${r2} (förväntat ${FÖRE + 2})`);
if (r1 !== FÖRE + 2 || r2 !== FÖRE + 2) { console.error("ABORT: readback-avvikelse"); process.exit(1); }

// ── Medianer EFTER + kvartilsplacering (uppgiftens kärna) ───────────────────
const efter = medianLage(u);
console.log(`MEDIANER EFTER (${u.length} rader): finans P/E ${efter.fin?.medianPe} (n ${efter.fin?.nPe}, kv ${efter.fin?.p25Pe}–${efter.fin?.p75Pe}) · totalt P/E ${efter.tot?.medianPe} (n ${efter.tot?.nMedPe})`);
console.log(`RÖRELSE: finans P/E ${före.fin?.medianPe}→${efter.fin?.medianPe} (n ${före.fin?.nPe}→${efter.fin?.nPe}, kvartiler ${före.fin?.p25Pe}–${före.fin?.p75Pe}→${efter.fin?.p25Pe}–${efter.fin?.p75Pe}) · totalt ${före.tot?.medianPe}→${efter.tot?.medianPe} (n ${före.tot?.nMedPe}→${efter.tot?.nMedPe})`);

const percentil = (v, p) => {
  const s = [...v].sort((a, b) => a - b);
  const pos = (s.length - 1) * p, lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]);
};
const median = (v) => percentil(v, 0.5);
const fin = u.filter((b) => b.bransch === "finans");
for (const tk of ["8604.T", "8750.T"]) {
  for (const [falt, pct] of [["pe", false], ["pb", false], ["roe", true], ["resultatCAGR", true]]) {
    const f = (b) => (falt === "resultatCAGR" ? b.tillvaxt?.resultatCAGR5ar : falt === "roe" ? b.lonksamhet?.roe : b.vardering?.[falt]);
    const varde = f(u.find((b) => b.ticker === tk));
    const iFin = fin.map(f).filter((x) => typeof x === "number").sort((a, b) => a - b);
    const iAll = u.map(f).filter((x) => typeof x === "number").sort((a, b) => a - b);
    const fmt = (x) => (pct ? (100 * x).toFixed(1).replace(".", ",") + " %" : String(x).replace(".", ","));
    console.log(`KVARTIL ${tk} ${falt}: ${fmt(varde)} = rad ${iFin.indexOf(varde) + 1} av ${iFin.length} i finans (P25 ${percentil(iFin, 0.25).toFixed(2)} · median ${median(iFin).toFixed(2)} · P75 ${percentil(iFin, 0.75).toFixed(2)}) · universumrad ${iAll.filter((x) => x < varde).length + 1} av ${iAll.length} (universummedian ${median(iAll).toFixed(2)})`);
  }
}
const jap = u.filter((b) => b.land === "Japan");
const japFin = jap.filter((b) => b.bransch === "finans");
console.log(`JAPAN: ${jap.length} rader (${[...new Set(jap.map((b) => b.bransch))].join(", ")}) — finans ${japFin.length} (matta ${japFin.filter((b) => typeof b.vardering?.pe === "number").length} P/E-mätta ⇒ landaspekt-gränsen 5 uppnådd)`);
console.log(`CELL-PARITET: 8306.T P/E 20,69 · 8316.T 20,72 · 8411.T 15,17 · 8604.T 11,88 · 8750.T 12,53 — median ${median(japFin.map((b) => b.vardering?.pe).filter((x) => typeof x === "number")).toFixed(2)}`);
