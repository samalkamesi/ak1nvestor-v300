#!/usr/bin/env node
/**
 * s2-u1 omg28 (manifest auto-s2-1790017500456) — Komatsu 6301.T, Japan/industri 0→1.
 * Aritmetikgrind med ABORT FÖRE skrivning (omg13-läxan): varje identitet kontroll-
 * räknas ur rådata; EN röd ⇒ filen orörd + exit 1. Idempotent (redan där ⇒ no-op)
 * och race-säker (appendar efter diskens faktiska läge, syskonrader oberoende).
 * Konventioner enligt 4502.T/5401.T (TYO, marslutande FY-etiketter = slutåret).
 * Enhetssystem: alla balans/strömt-fält i mdr ¥; kvartalslistor i M ¥ (summan/1000).
 * TTM = kvartalsreplik (Q2FY26+Q3FY26+Q4FY26+Q1FY27) — varje TTM-fält på
 * statistics-ytan har verifierats EXAKT mot kvartalssummorna.
 * Publicerad värdekedja = pris-koherent vintage (kurs 7 012 ¥ 2026-09-18,
 * S&P+Yahoo korsade); statistics-sidans eget pris-vintage (implied 7 445 ¥,
 * aug-12-FMP-fördröjning) dokumenteras i paranoid som källspridning.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));

if (u.some((r) => r.ticker === "6301.T")) {
  console.log("6301.T finns redan — idempotent no-op, disk =", u.length);
  process.exit(0);
}
const FÖRE = u.length;

// ── RÅDATA (StockAnalysis tyo/6301 fem ytor, hämtat 2026-09-21; S&P GMI-underlag,
//    SA-close 2026-09-18 15:30 JST; Yahoo chart-API paranoid 7 012 ¥ = 0,00 % band.
//    TTM-komponenter = kvartalssummor (M ¥), alla replikerade EXAKT mot statistics.) ──
const R = {
  kurs: 7012, yahoo: 7012,
  aktiebas: 891.51,            // M aktier (statistics Shares Outstanding, aktuell)
  aktiebasViktad: 903.15,      // M aktier (källans EPS-bas: nettoTTM/EPS)
  mcap: 6252.642,              // mdr ¥ = kurs × aktiebas (översiktens fält 6,25 T)
  mcapStatFalt: 6635.7,        // statistics-sidans mcap-fält (aug-12-vintage, dokumentation)
  epsTTM: 422.04, epsKvartal: [92.62, 104.08, 118.15, 107.20], // Q2FY26..Q1FY27
  pe: 16.61, fwdPe: 15.61, pegFalt: 3.30,
  pb: 1.68, pbBVPSbas: 1.7785,
  evEbit: 13.08, evEbitStatFalt: 13.50,
  pFcftStatFalt: 26.26,        // statistics-fält på deras mcap-vintage (dokumentation)
  dps: 190, dpsYieldFalt: 2.71,
  revTTM: 4266.370, bruttoTTM: 1296.473, ebitTTM: 581.703, nettoTTM: 381.150,
  pretaxTTM: 556.430, skattTTM: 150.860, minoritetResultatTTM: 24.382,
  ebitdaTTM: 747.2, daTTM: 165.490,
  ocfTTM: 484.311, capexTTM: 231.566, fcfTTM: 252.745,
  kassaTTM: 571.869, skuldTTM: 1731.444, ekTotalTTM: 3710.209,
  ekCommonTTM: 3515.432, bvps: 3943.23, minoritetTTM: 194.777,
  deFalt: 0.47, debtEbitdaFalt: 2.32, debtFcfFalt: 6.85,
  roeFalt: 0.1162, roicFalt: 0.0887, waccFalt: 0.0813, rantaTackningFalt: 10.61,
  kassaRantaFY26: 53.138,
  ser: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    oms: [2802323, 3543475, 3865122, 4104395, 4132751],
    brutto: [null, 1184604, 1248713, 1322383, 1259854], // FY22 saknas (se paranoid)
    ebit: [324165, 499912, 613754, 657125, 570541],
    netto: [224927, 326398, 393426, 439256, 376191],
    ek: [2356277, 2677955, 3198452, 3344853, 3708427],
    ocf: [300970, 206474, 434778, 517167, 448963],
    capex: [162956, 183533, 202947, 205855, 212261],
    fcf: [138014, 22941, 231831, 311312, 236702],
    utdel: [72815, 113505, 139090, 166565, 185142],
    aterkop: [0, 0, 0, 101249, 105734],
    skuld: [1008462, 1118531, 1273194, 1223045, 1427531],
    kassa: [315360, 289975, 403178, 385569, 439701],
    goodwill: [187615, 207060, 248393, 245833, 272823],
    intang: [169003, 167292, 180403, 169953, 169345],
    tillgangar: [4347522, 4875847, 5636656, 5773523, 6423941],
    aktiebas: [944.17, 945.6, 945.98, 927.8, 901.1],
  },
  // kvartalsvärden för TTM-replik (M ¥): Q2FY26, Q3FY26, Q4FY26, Q1FY27
  kvRev: [982063, 1023897, 1217267, 1043143],
  kvBrutto: [306212, 313008, 343124, 334129],
  kvEbit: [136670, 141954, 151526, 151553],
  kvNetto: [84389, 94226, 106382, 96153],
  kvOcf: [97859, 128382, 192924, 65146],
  kvCapex: [56330, 37921, 71728, 65587],
  kvNettoQ1par: [91194, 96153], // Q1FY26, Q1FY27 (vändningsmåttet)
  kvRevQ1par: [909524, 1043143],
  omsTillFalt: 0.052,          // översiktens "+5,2 %" (heltalsavrundat fält)
};

// ── ARITMETIKGRIND ────────────────────────────────────────────────────────────
const kontroller = [];
const K = (namn, beraknad, falt, tolerans) => {
  const dev = falt === 0 ? Math.abs(beraknad) : Math.abs((beraknad - falt) / falt);
  kontroller.push({ namn, beraknad, falt, dev, ok: dev <= tolerans, tolerans });
};
const sum = (a) => a.reduce((x, y) => x + y, 0);

K("kurs Yahoo==SA", R.yahoo, R.kurs, 0.001);
K("mcap = kurs × aktiebas", (R.kurs * R.aktiebas) / 1000, R.mcap, 0.005);
K("mcap mot översiktens 6,25 T-fält", R.mcap, 6250, 0.005);
K("EPS TTM = kvartalssumma", sum(R.epsKvartal), R.epsTTM, 0.001);
K("P/E = kurs/EPS TTM", R.kurs / R.epsTTM, R.pe, 0.005);
K("EPS-bas: netto/viktad aktiebas", (R.nettoTTM * 1000) / R.aktiebasViktad, R.epsTTM, 0.005);
K("netto TTM = kvartalssumma", sum(R.kvNetto) / 1000, R.nettoTTM, 0.0005);
K("EBIT TTM = kvartalssumma", sum(R.kvEbit) / 1000, R.ebitTTM, 0.0005);
K("rev TTM = kvartalssumma", sum(R.kvRev) / 1000, R.revTTM, 0.0005);
K("brutto TTM = kvartalssumma", sum(R.kvBrutto) / 1000, R.bruttoTTM, 0.0005);
K("bruttoMarginal TTM", R.bruttoTTM / R.revTTM, 0.3039, 0.005);
K("ebitMarginal TTM", R.ebitTTM / R.revTTM, 0.1363, 0.005);
K("nettoMarginal TTM", R.nettoTTM / R.revTTM, 0.0893, 0.005);
K("pretax−skatt−minoritet = netto", R.pretaxTTM - R.skattTTM - R.minoritetResultatTTM, R.nettoTTM, 0.005);
K("EBITDA = EBIT + D&A", R.ebitTTM + R.daTTM, R.ebitdaTTM, 0.005);
K("OCF TTM = kvartalssumma", sum(R.kvOcf) / 1000, R.ocfTTM, 0.0005);
K("capex TTM = kvartalssumma", sum(R.kvCapex) / 1000, R.capexTTM, 0.0005);
K("FCF TTM = OCF − capex", R.ocfTTM - R.capexTTM, R.fcfTTM, 0.0005);
K("fcfMarginal TTM", R.fcfTTM / R.revTTM, 0.0592, 0.005);
K("fcfYield = FCF/mcap", R.fcfTTM / R.mcap, 0.0404, 0.005);
K("P/FCF = mcap/FCF", R.mcap / R.fcfTTM, 24.74, 0.005);
K("källans P/FCF på deras mcap-vintage (dok.)", R.mcapStatFalt / R.fcfTTM, R.pFcftStatFalt, 0.005);
K("P/B = mcap/total-EK", R.mcap / R.ekTotalTTM, R.pb, 0.005);
K("P/B BVPS-bas (not — BAS-SPLITTRA minoritet)", R.kurs / R.bvps, R.pbBVPSbas, 0.005);
K("aktiebas-identitet EK-common/BVPS", (R.ekCommonTTM * 1000) / R.bvps, R.aktiebas, 0.005);
const evMin = R.mcap + R.skuldTTM - R.kassaTTM + R.minoritetTTM;
K("EV = mcap+skuld−kassa+minoritet", evMin, 7606.994, 0.005);
K("EV/EBIT = min kedja", evMin / R.ebitTTM, R.evEbit, 0.005);
K("källans EV-kedja på deras vintage (dok. — minoritetskonventionen)", R.mcapStatFalt + R.skuldTTM - R.kassaTTM + R.minoritetTTM, 7990, 0.005);
K("D/E", R.skuldTTM / R.ekTotalTTM, R.deFalt, 0.01); // 0,467→0,47 avrundning
K("Debt/EBITDA", R.skuldTTM / R.ebitdaTTM, R.debtEbitdaFalt, 0.005);
K("Debt/FCF", R.skuldTTM / R.fcfTTM, R.debtFcfFalt, 0.005);
K("DPS-yield", R.dps / R.kurs, R.dpsYieldFalt / 100, 0.005);
K("prognosTillväxt = pe/fwdPe − 1", R.pe / R.fwdPe - 1, 0.0641, 0.005);
K("omsCAGR FY22→26", Math.pow(R.ser.oms[4] / R.ser.oms[0], 1 / 4) - 1, 0.102, 0.005);
K("resCAGR FY22→26", Math.pow(R.ser.netto[4] / R.ser.netto[0], 1 / 4) - 1, 0.1372, 0.005);
K("omsTill TTM (mot årsgammal TTM 4 054,082 mdr)", R.revTTM / 4054.082 - 1, R.omsTillFalt, 0.01); // fältet heltalsavrundat
K("omsTill publicerat (4 decimaler)", R.revTTM / 4054.082 - 1, 0.0524, 0.005);
K("FY26 oms = kvartalssumma mot +0,69 %", R.ser.oms[4] / R.ser.oms[3] - 1, 0.0069, 0.005);
K("FY26 netto −14,36 % mot översiktens fält", R.ser.netto[4] / R.ser.netto[3] - 1, -0.1436, 0.005);
K("Q1FY27 netto-vändning +5,4 %", R.kvNettoQ1par[1] / R.kvNettoQ1par[0] - 1, 0.0543, 0.005);
K("Q1FY27 omsättning +14,7 %", R.kvRevQ1par[1] / R.kvRevQ1par[0] - 1, 0.1469, 0.005);
K("räntetäckning (replik EBIT/kassaränta FY26, dok.)", R.ser.ebit[4] / 1000 / R.kassaRantaFY26, R.rantaTackningFalt, 0.02);
// FCF-serien: OCF − capex = fcf, 5/5 EXAKT (hardekrav)
for (let i = 0; i < 5; i++) K(`FCF FY${R.ser.ar[i]} = OCF−capex`, R.ser.ocf[i] - R.ser.capex[i], R.ser.fcf[i], 0.0005);
// moat-serien: fem punkter FY23–FY26 + TTM (FY22-brutto saknas på alla ytor — dokumenterat)
const gmPunkter = [1, 2, 3, 4].map((i) => (R.ser.brutto[i] / R.ser.oms[i]) * 100).concat([(R.bruttoTTM / R.revTTM) * 100]);
const gmMedel = sum(gmPunkter) / gmPunkter.length;
const gmSpread = Math.max(...gmPunkter) - Math.min(...gmPunkter);
kontroller.push({ namn: "moat medel fem punkter (→31,8)", beraknad: gmMedel, falt: 31.8, dev: Math.abs(gmMedel - 31.8) / 31.8, ok: Math.abs(gmMedel - 31.8) / 31.8 <= 0.005, tolerans: 0.005 });
kontroller.push({ namn: "moat spread fem punkter (→3,04)", beraknad: gmSpread, falt: 3.04, dev: Math.abs(gmSpread - 3.04) / 3.04, ok: Math.abs(gmSpread - 3.04) / 3.04 <= 0.005, tolerans: 0.005 });
// Sony-fällan-grinden: positivt TTM ⇒ pe/peg/prognosTillväxt MÄTTA (bindning)
kontroller.push({ namn: "Sony-fällan: TTM>0 ⇒ pe mätt", beraknad: R.nettoTTM > 0 ? "mätt ✓" : "negativt?!", falt: "mätt", dev: 0, ok: R.nettoTTM > 0, tolerans: 0 });
kontroller.push({ namn: "endpoint>0 ⇒ resCAGR mätt", beraknad: R.ser.netto[4] > 0 && R.ser.netto[0] > 0 ? "mätt ✓" : "null?!", falt: "mätt", dev: 0, ok: R.ser.netto[4] > 0 && R.ser.netto[0] > 0, tolerans: 0 });

let roda = kontroller.filter((k) => !k.ok);
for (const k of kontroller) {
  console.log(`${k.ok ? "✓" : "✗"} ${k.namn}: beräknad ${typeof k.beraknad === "number" ? k.beraknad.toFixed(6) : k.beraknad} mot fält ${k.falt} (avvik ${(k.dev * 100).toFixed(3)} %, tol ${(k.tolerans * 100).toFixed(1)} %)`);
}
if (roda.length) {
  console.error(`\nARITMETIKGRIND RÖD — ${roda.length} fel — ABORT, filen orörd`);
  process.exit(1);
}
console.log(`\nARITMETIKGRIND GRÖN — ${kontroller.length}/${kontroller.length} — skriver ${FÖRE}→${FÖRE + 1}`);

// ── RADEN (kanonisk fältordning enligt 4502.T, 1-space-indent = diskens format) ──
const rad = {
  ticker: "6301.T",
  namn: "Komatsu Ltd.",
  bransch: "industri",
  land: "Japan",
  valuta: "JPY",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-21",
      url: "https://stockanalysis.com/quote/tyo/6301/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + kvartalsvyerna ?p=quarterly)",
      paranoid: "TYO-PRIMÄRNOTING i JPY (S&P GMI-underlag, SA-close 2026-09-18 15:30 JST; översikt 'Last checked 2026-09-21', TTM via Q1 FY2027 rapporterat 2026-07-29): kurs 7 012 ¥ (Yahoo chart-API 7 012 = 0,00 % band EXAKT; previousClose 7 059, veckoserien 7 139→7 060→7 045→7 059→7 012), mcap 6 252,6 mdr ¥ = 7 012 × 891,51 M EXAKT (översiktens fält 6,25 T; statistics-sidans 6,64 T är aug-12-prisvintage med implied kurs 7 445 — SAMMA 1,3 %-klass som Takedas 9 530/9 409-spridning; publicerade värden = den pris-koherenta kedjan), P/E 16,61 = 7 012/422,04 EXAKT (EPS TTM 422,04 = kvartalssumman 92,62+104,08+118,15+107,20; punktbasen 891,51 M ger 427,6 — källans viktade bas 903,2 M), fwd PE 15,61 ⇒ prognosTillväxt +6,4 % mekanisk konvention (implicerat framåt-EPS ≈ 449 ¥), PEG 3,30 källans 3-årsbas, P/B 1,68 på mcap/total-EK 6 252,6/3 710,2 (BVPS-basen 7 012/3 943,23 = 1,78 — BAS-SPLITTRA: minoritetsintresse 194,8 mdr = 5,2 % av EK; aktiebas-identiteten EK-common/BVPS = 3 515,4/3 943,23 = 891,51 M EXAKT), EV 7 607 mdr = mcap+skuld 1 731,4−kassa 571,9+minoritet 194,8 (källans EV-konvention BEVISAD: deras fält 7,99 T replikeras 6 635,7+1 731,4−571,9+194,8 = 7 990,1 EXAKT på deras vintage) ⇒ EV/EBIT 13,08 mot källans fält 13,50 (deras bredare EBIT-bas 591,9 — dokumenterad källspridning), EV/EBITDA 10,18, P/FCF 24,7 mot källans 26,26 (deras 6 635,7-vintage: replik EXAKT — spridningen är ren prisvintage), marginaler TTM (kvartals-exakta): brutto 30,39 % (1 296 473/4 266 370 EXAKT) EBIT 13,63 % (581 703 EXAKT) netto 8,93 % (fältet 8,94 — avrundning) FCF 5,92 % (EXAKT), pretax 556,4 − skatt 150,9 (27,11 % effektiv) − minoritet 24,4 = netto 381,2 EXAKT, ROE 11,62 % (S&P-bas; replik 10,3–11,4 % beroende på EK-bas), ROIC 8,87 % mot WACC 8,13 % = +0,74 pp (cykelbolagets trånga spread — Takeda +1,12 pp), räntetäckning 10,61 (replik EBIT/kassaränta FY2026 570,5/53,1 = 10,74), D/E 0,47 (1 731,4/3 710,2 = 0,467), Debt/EBITDA 2,32 EXAKT, Debt/FCF 6,85 EXAKT, Altman 2,85 (gråzonen under 3), Piotroski 5, beta 0,98 (5Y), NETTOSKULD −1 159,6 mdr ¥ (kassa 571,9 − skuld 1 731,4; fältet −1 159,58 EXAKT), utdelning 190 ¥/år semi-årlig 95+95 (2,71 %; DPS-vägen 139→167→190→190: +13,8 % året före toppen, PLAN vid cykelviken; källans 'Dividend Growth −5,94 %' är TTM-fönsterartefakt mot årets FLAT — dokumenterad utan tolkning), betalda 185,1 mdr ¥ FY2026 (jun-finalen 107 ¥ = 98,8 + dec-interimin 95 ¥ = 86,3 — kontantströmskonventionen inkluderar föregående års final), återköp 105,7 mdr ⇒ shareholder yield ≈ 4,4 % (2,71+1,69), aktiebas −2,10 % YoY (−0,46 % QoQ), institutioner 52,09 % insiders 0,07 %, 52-v 4 914–7 840 (+31,8 %), analytiker Hold 12 st PT 6 902,73 (−1,6 %), 66 697 anställda (FY2026; statistikbasen 67 279 ger rev/anställd 63,41 M ¥ EXAKT), grundat 1884, nästa rapport 2026-10-29 (Q2 FY2027 — samma dag som Takeda); FY-serier marslutande SA-etiketter FY2022–FY2026 (M ¥): rev 2 802 323→3 543 475→3 865 122→4 104 395→4 132 751 (FY2026 = kvartalssumma EXAKT mot översiktens '4,13 T +0,69 %'; TTM 4 266 370 +5,2 % mot årsgammal TTM 4 054 082), EBIT 324 165→499 912→613 754→657 125→570 541 (fyra raka tillväxtår som klipps −13,2 % i FY2026; TTM 581 703 vänder +2,0 %), netto 224 927→326 398→393 426→439 256→376 191 (FY2026 −14,36 % EXAKT; fyra raka tillväxtår +13,7 % CAGR sedan FY2022; TTM 381 150 +1,3 %), bruttomarginalens kvartalskoherenta punkter 33,4 (FY23)→32,3→32,2→30,5 (FY26)→30,4 % TTM — års-sidans äldre kolonner är kolrupterade (NI/EPS-rader etikettförskjutna ett år: 'FY2024'-kolonnen visar Mar'23-värdet 326 398 — kvartals-/kassaflödes-/balans-ytornas majoritet bär; FY22-brutto saknas på ALLA ytor ⇒ moat-medlet på fem punkter FY23+FY24+FY25+FY26+TTM = 31,8 %/spread 3,04 dokumenterat), EK totalt 2 356 277→3 708 427 (BVPS 2 364,53→3 896,10; TTM 3 943,23), skuld 1 008 462→1 427 531 (+42 % fem år, retailfinance-segmentet 25,8 mdr/kvartal) medan kassa 315 360→439 701 (TTM 571 869), goodwill 187 615→272 823 + intangibla 169 003→169 345 = 442 mdr FY2026 = 6,9 % av tillgångarna 6 423 941 (maskinkulturens låga goodwill mot Takedas 59,3 % — fabriken kontra rätten), OCF 300 970→448 963, capex 162 956→212 261, FCF 138 014→22 941→231 831→311 312→236 702 (5/5 positiva; varje år OCF−capex EXAKT; TTM 252 745), D&A 133 256→170 426 (TTM 165 490 — EBITDA-identiteten 581,7+165,5 = 747,2 EXAKT), utdelningar betalda 72 815→185 142, återköp 0→0→0→101 249→105 734 (motorn startade FY2025), arbetskapital-pendeln: FY2023:s FCF-dip 22 941 M¥ (0,6 % marginal) = lagrets år (inventory −214 520) och Q1-kvartalen alltid svaga (Q1 FY2027 −0,4 mdr mot Q4 FY2026 +121,2 — gruv- och byggkundernas betalningsrytm som mönster)",
    },
    {
      namn: "Yahoo Finance (chart-API)",
      hamtat: "2026-09-21",
      url: "https://query2.finance.yahoo.com/v8/finance/chart/6301.T",
      paranoid: "paranoid kurskoll: Yahoo regularMarketPrice 7 012 ¥ mot SA-close 7 012,00 = 0,00 % band EXAKT (samma streck 2026-09-18 15:30 JST; chartPreviousClose 7 139, veckoserien 7 139→7 060→7 045→7 059→7 012, valuta JPY verifierad i meta — query2 utan rate-limit på första försöket)",
    },
  ],
  hamtat: "2026-09-21",
  pris: 7012,
  marknadsKapitalMdr: 6253,
  tillvaxt: {
    omsattningCAGR5ar: 0.102,
    resultatCAGR5ar: 0.1372,
    omsattningTillvaxtTTM: 0.0524,
    prognosTillvaxt: 0.0641,
  },
  lonksamhet: {
    roe: 0.1162,
    roic: 0.0887,
    bruttoMarginal: 0.3039,
    ebitMarginal: 0.1363,
    nettoMarginal: 0.0893,
    fcfMarginal: 0.0592,
  },
  stabilitet: {
    skuldEgenkapital: 0.47,
    rantaTackning: 10.61,
    fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: {
    senasteArMdr: 185.142,
    andelUtestande: 0.0007,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: 31.8,
    bruttoMarginalSpread5ar: 3.04,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 16.61,
    pb: 1.68,
    evEbit: 13.08,
    peg: 3.3,
    fcfYield: 0.0404,
    egenKapitalMultipl: 1.68,
  },
  golv: {
    typ: "osatt",
    vardePerAktie: null,
    marginal: null,
  },
  serier: {
    ar: R.ser.ar,
    omsattning: R.ser.oms.map((x) => x * 1e6),
    resultat: R.ser.netto.map((x) => x * 1e6),
    egetKapital: R.ser.ek.map((x) => x * 1e6),
    fcf: R.ser.fcf.map((x) => x * 1e6),
  },
  notering: "Japan/industri 0→1 — Japans SJUNDE gren (konsument 5 · kommunikation 5 · finans 5 · material 1 · teknik 1 · halso 1 ⇒ +industri) och universumets första japanska maskinrad; med Caterpillar (CAT, USA/industri) och Volvo CE (via VOLV-B, Sverige/industri) finns de tre stora västerländska tillverkarna av anläggnings- och gruvmaskiner SLUTLIGEN i samma universum — SAMMA cykel i tre valutor och redovisningssystem (USD · JPY · SEK): cykel-pedagogikens triangulering. SIGNATURTAL — CYKELTOPPENS ANATOMI (vinstcykeln viker FÖRE volymcykeln): (1) RESULTATTRAPPAN 224,9→326,4→393,4→439,3 mdr ¥ (fyra raka tillväxtår, +13,7 % CAGR) som KLIPPS av FY2026 −14,4 % MEDAN omsättningen +0,7 % — bruttomarginalens punkter 33,4→32,3→32,2→30,5→30,4 % planar i samma viktning (prishöjningarnas efterspel); Q1 FY2027 VÄNDER: netto +5,4 % (96,2 mot 91,2) på rekordkvartal +14,7 % (1 043,1 mot 909,5) — kvartalsvändningen dokumenterad. (2) ARBETSKAPITALS-PENDELN: FCF 5/5 positiva år (138,0→22,9→231,8→311,3→236,7 mdr) men FY2023:s 22,9 mdr (0,6 % marginal) = lagrets år (inventory −214,5 mdr) och Q1-kvartalen alltid svaga (Q1 FY2027 −0,4 mot Q4 FY2026 +121,2) — gruv- och byggkundernas betalningsrytm: FCF-säsongen är cykelns hjärta, årssumman dess sanning. (3) SKULDENS FEMÅRSRESA: 1 008→1 427 mdr ¥ (+42 %, retailfinance-segmentet 25,8 mdr/kvartal) MEDAN räntetäckningen 10,61×, Debt/EBITDA 2,32 och kassan växer 315→440 (TTM 572) — expansion utan stress; Altman 2,85 (gråzonen under 3) + Piotroski 5; minoritetsandelen 123,8→194,8 mdr (5,2 % av EK — P/B-bas-splittran 1,68 total mot 1,78 common). (4) ROIC 8,87 % mot WACC 8,13 % = +0,74 pp — cykelbolagets trånga spread: kapitalet tjänar knappt sin riskjusterade kostnad genom HELA boomen (jfr Takeda +1,12 pp) — det är anläggningsmaskinernas ekonomi och kapitaldisciplinens eviga läxa. (5) UTDELNINGEN 95+95 = 190 ¥ semi-årlig (2,71 %): DPS-vägen 139→167→190→190 — höjt +13,8 % året före toppen, PLAN vid cykelviken (betalda 185,1 mdr inklusive FY25-finalen 107) + återköpen startade FY2025 (101,2 → 105,7 mdr) ⇒ shareholder yield ≈ 4,4 %: utdelningspolitiken som cykeltermometer. (6) GRUNDAT 1884 — Japans tredje äldsta rad efter Takeda 1781 och Mitsubishi 1873, före Mercedes 1886; goodwill+intangibla 442 mdr = 6,9 % av tillgångarna — maskinkoncernens balansräkning äger fabriker (Takedas spegelbild 59,3 % immateriellt). Kontrastpartnerna: Caterpillar (skal-motpolen i samma gren) · Volvo CE (den europeiska systern via VOLV-B) · Toyota (samma monozukuri-precisionskultur i konsumentgrenen). FIFO: Q2 FY2027 2026-10-29 (samma rapportdag som Takeda — Japans marsbolag rapporterar i par).",
};

const gammal = readFileSync(FIL, "utf8");
u.push(rad);
const ny = JSON.stringify(u, null, 1) + "\n";
// prefix-bevis: gamla filen skall vara byte-identisk prefix av nya
// (nya filen fortsätter efter sista radens } med ",\n {..." — kirurgisk append)
const prefix = gammal.slice(0, gammal.lastIndexOf("}") + 1);
if (!ny.startsWith(prefix)) {
  console.error("PREFIX-BEVIS RÖTT — gammal fil ej prefix av ny — ABORT");
  process.exit(1);
}
writeFileSync(FIL, ny);
const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`APPEND KIRURGISK: ${FÖRE}→${efter.length} (0 gamla rader förändrade, prefix bit-identisk)`);
console.log(`LÄS-TILLBAKA ×1: 6301.T närvarande = ${efter.some((r) => r.ticker === "6301.T")} · bransch/land = ${(() => { const r = efter.find((x) => x.ticker === "6301.T"); return r.bransch + "/" + r.land; })()}`);
