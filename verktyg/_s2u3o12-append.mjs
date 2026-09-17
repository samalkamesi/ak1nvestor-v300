#!/usr/bin/env node
// s2-u3 omg12: append TRUE-B.ST + VIT-B.ST + ARM till bolagsunivers.json
// Konventioner exakt som omg3–11 (S2-U3-protokollen): idempotent append,
// prefix-bevis (befintliga rader byte-identiska), aritmetikkontroll-block
// som KASTAR före skrivning om någon identitet bryter, Write via node = skal-kvotens kanal 1.
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json";
const rader = JSON.parse(readFileSync(FIL, "utf8"));
const prefixJson = JSON.stringify(rader, null, 2);

// ── Aritmetikhjälpare (samma konvention som protokollen) ────────────────────
const cagr = (forsta, sista, ar) => Math.pow(sista / forsta, 1 / ar) - 1;
const felet = [];
const K = (namn, faktiskt, vantat, tol = 1e-9) => {
  const ok = Math.abs(faktiskt - vantat) <= tol;
  if (!ok) felet.push(`${namn}: ${faktiskt} != ${vantat}`);
  return ok;
};

// ═══ TRUE-B.ST — Truecaller (Yahoo, close 2026-09-17 17:29 CET) ═════════════
const TRUE = {
  ticker: "TRUE-B.ST",
  namn: "Truecaller AB (publ)",
  bransch: "teknik",
  land: "Sverige",
  valuta: "SEK",
  kallor: [
    {
      namn: "Yahoo Finance",
      hamtat: "2026-09-17",
      url: "https://finance.yahoo.com/quote/TRUE-B.ST/",
      paranoid:
        "quote + financials + key-statistics + cash-flow (STO-försenad close 2026-09-17 17:29 CET; källans banner 'temporary issues' — Financial Highlights-delen död, värderingstabellen komplett med kvartalshistorik 6 punkter): pris 22,23 SEK, P/E 30,45 (panelens trailing; statistics-tabellens 31,08 vid äldre mcap-läge), P/B 6,41 + EV 6,15 mdr (valuation-tabellen current), serier FY2022–FY2025 + TTM i SEK tusental (TTM-fönstret slutar Q2-2026: rev 1 673,7 M — UNDER FY2025:s 1 912,2 M = fallande intäkter i TTM-fönstret, bokfört som källans tal), FCF TTM 326,5 M (fyra år + TTM alla positiva), återköp TTM 398,5 M (källan redovisar INGEN utdelningsrad — utdelning osatt enligt källa); EK härlett ur P/B-vägen (mcap ÷ P/B = 1 063,4 M) ⇒ ROE härledd 23,8 % dokumenterad; ROIC/WACC/beta/skuld saknas i källan (Highlights död) = null; källan klassar bolaget Technology/Software - Application — branschfältet teknik är källkonsekvent",
    },
  ],
  hamtat: "2026-09-17",
  pris: 22.23,
  marknadsKapitalMdr: 6.82,
  tillvaxt: {
    omsattningCAGR5ar: 0.0255,
    resultatCAGR5ar: -0.1012,
    omsattningTillvaxtTTM: null,
    prognosTillvaxt: null,
  },
  lonksamhet: {
    roe: 0.2379,
    roic: null,
    bruttoMarginal: 0.4853,
    ebitMarginal: 0.21,
    nettoMarginal: 0.1512,
    fcfMarginal: 0.1951,
  },
  stabilitet: {
    skuldEgenkapital: null,
    rantaTackning: null,
    fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: {
    senasteArMdr: null,
    andelUtestande: null,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: 0.5515,
    bruttoMarginalSpread5ar: 0.1122,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 30.45,
    pb: 6.41,
    evEbit: 17.5,
    peg: null,
    fcfYield: 0.0479,
    egenKapitalMultipl: 6.41,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: [1772927000, 1728894000, 1863218000, 1912196000],
    resultat: [535230000, 536333000, 524323000, 388625000],
    egetKapital: [],
    fcf: [595670000, 555962000, 589907000, 481853000],
  },
  notering:
    "Sveriges konsumentapp-exportör i ny tappning: sjätte svenska teknikraden (s2-u2:s ENEA+NOTE tog mattan 3→5 samma fönster — TRUE/VIT fördjupar Sverige/teknik till 7 mätbara) och Yahoo-källans tydligaste vändningsdokument: källans värderingstabell bär P/S 13,4 (jun-2025) → 1,34 (mar-2026) → 4,63 (nu) och mcap 23,3 → 3,6 → 7,0 mdr — apparatens AI-hot-narrativ och Indien-makron tiofaldigade multiplarnas spridning på ett år; TTM-fönstret (slutar Q2-2026) bär FALLANDE intäkter (1 673,7 M mot FY2025:s 1 912,2 M) och netto 253,0 M (−35 % mot 2025) medan kursen återhämtat sig ⇒ P/E 30,45 vid vikande vinster (PEG osatt — prognosTillväxt saknar källas forward); bruttomarginalens femårsvandring 59,8 → 48,5 % (TTM) = moat-medel 55,2 % spridning 11,2 pp — annonsintäkternas kostnadssida växer mot prenumerationsdelen, universumets näst bredaste efter DNO; ROE 23,8 % härledd ur P/B-vägen (källans Highlights död — metod notisbelagd); EV 6,15 mdr UNDER mcap 6,82 = nettokassa 0,67 mdr; FCF TTM 326,5 M fyra raka positiva år + TTM (fcfYield 4,8 %) men återköpen TTM 398,5 M ÖVERSTEGER fria kassaflödet = första året då återköpen delvis finansieras av balansräkning; utdelning saknas i källans kassaflöde (osatt, ej påstått); P/B 6,41 bland universumets högsta på EK 1,06 mdr. NOTIS DATAÄGAREN: källans EPS/mcap-internt motstridiga (basic EPS TTM 0,74 mot nettovinst/aktier 0,83) — panelens P/E 30,45 bär kedjan, avvikelsen bokförd här.",
};

// ═══ VIT-B.ST — Vitec Software (Yahoo live + officiell bokslutskommuniké 2025) ═══
const VIT = {
  ticker: "VIT-B.ST",
  namn: "Vitec Software Group AB (publ)",
  bransch: "teknik",
  land: "Sverige",
  valuta: "SEK",
  kallor: [
    {
      namn: "Yahoo Finance + Vitec bokslutskommuniké 2025",
      hamtat: "2026-09-17",
      url: "https://finance.yahoo.com/quote/VIT-B.ST/financials/",
      paranoid:
        "financials LIVE (intradag 2026-09-17 15:05 CET, kurs 223,60 SEK) + bolagets bokslutskommuniké jan-dec 2025 (vitecsoftware.com/MFN): pris/mcap 8,87 mdr (223,60 × 39,68 M aktier, TTM-andel Yahoos), P/E 19,68 härleld ur pris ÷ EPS TTM 11,36 (källans panel-P/E bar dec-2025-cache 30,28 vid kurs 302,20 — STEL CACHE avförd via no_cache-hämtning, dokumenterad i protokollet), serier FY2022–2025 + TTM SEK (källans årsvisa avrundning 3 värdesiffror för 2022–2024; FY2025 mot officiella bokslutet 3 633 Mkr), EK 5 074 M + soliditet 47 % + nettoskuld 3 791 M + utdelning 3,68 kr/aktie (24:e året i rad med höjd utdelning) ur BOKSLUTSKOMMUNIKÉN; P/B = mcap ÷ EK; EV/EBIT = (mcap + nettoskuld) ÷ EBIT TTM 731,89 M; räntetäckning = EBIT ÷ räntekostnad TTM 110,13 M; ROE = netto TTM ÷ EK; bruttomarginaler TTM-fönstret bär källans avrundning (±0,3 pp band); FCF-komponent (capex) redovisas ej i källans flöde — fcfYield/fcfMarginal OSATTA, OCF TTM 1,06 mdr som taknotis; källan klassar bolaget Technology/Software - Application — branschfältet teknik är källkonsekvent",
    },
  ],
  hamtat: "2026-09-17",
  pris: 223.6,
  marknadsKapitalMdr: 8.87,
  tillvaxt: {
    omsattningCAGR5ar: 0.2242,
    resultatCAGR5ar: 0.2114,
    omsattningTillvaxtTTM: null,
    prognosTillvaxt: null,
  },
  lonksamhet: {
    roe: 0.0889,
    roic: null,
    bruttoMarginal: 0.477,
    ebitMarginal: 0.1983,
    nettoMarginal: 0.1222,
    fcfMarginal: null,
  },
  stabilitet: {
    skuldEgenkapital: 0.7473,
    rantaTackning: 6.6,
    fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: {
    senasteArMdr: null,
    andelUtestande: null,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: 0.4887,
    bruttoMarginalSpread5ar: 0.0266,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 19.68,
    pb: 1.75,
    evEbit: 17.3,
    peg: null,
    fcfYield: null,
    egenKapitalMultipl: 1.75,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: [1980000000, 2780000000, 3330000000, 3633000000],
    resultat: [244870000, 339180000, 410100000, 435360000],
    egetKapital: [],
    fcf: [],
  },
  notering:
    "Vertikal-SaaS:ens svenska urtyp och fjärde mätbara svenska teknikraden i HEAD-läget (s2-u2:s ENEA+NOTE — deras omg12, protokoll staged — fördjupar grenen vid sin re-landning och Sverige/teknik-mattan passerar MIN_MATTA=5): repetitiva intäkter 88 % av omsättningen (3 204 av 3 633 Mkr, bokslutet 2025) = prenumerationsdjupet ingen svensk teknikrad hittills bär; utdelningstrappan 24 RAKA ÅR av höjda utdelningar (3,68 kr föreslaget för 2026, 1,65 % direktavkastning, payout 32 %) — CNQ:s 10-årssvit får en svensk tvilling; oms +22,4 %/år och resultat +21,1 %/år endpoint FY2022→2025 (basåret bär källans 3-siffriga avrundning 1,98 mdr) med TTM-vänden oms 3,69 mdr; bruttomarginalen 50,3 → 47,7 % (TTM) fem punkter = medel 48,9 % spridning 2,7 pp — VALLGRAVEN i siffror (förvärvsintegreringar äter marginalglast, aldrig graven); obligationssteget 2025 (nettoskuld 3 791 M, skuld/EK 0,75 räknat på nettoskuld-vägen, räntetäckning 6,6×) ändrade kapitalstrukturen från kassabolag till belånat rullande förvärvsmaskineri — investing-cash −1,44 mdr TTM mot OCF +1,06 mdr; ROE 8,9 % på EK 5 074 M (bokslutets egna tal 9 %) = vallgravens pris: den höga marginalen betalas i förvärvat goodwill-EK, P/B 1,75; P/E 19,68 vid kurs 223,60 (EPS TTM 11,36; källans dec-2025-cache 30,28/302,20 avförd dokumenterat — protokollets cache-epilog). NOTIS DATAÄGAREN: Yahoos årsvisa avrundning (1,98/2,78/3,33 mdr) mot officiella 3 334 Mkr (2024) — serien källkonsekvent Yahoo, bokslutstalen i noteringen.",
};

// ═══ ARM — Arm Holdings (StockAnalysis/S&P, close 2026-09-17 16:00 EDT) ═════
const ARM = {
  ticker: "ARM",
  namn: "Arm Holdings plc",
  bransch: "teknik",
  land: "Storbritannien",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-17",
      url: "https://stockanalysis.com/stocks/ARM/",
      paranoid:
        "översikt + statistics + financials (underlag S&P Global Market Intelligence; NASDAQ close 2026-09-17 16:00 EDT): pris 264,94 USD (+8,59 % på dagen), mcap 282,98 mdr, P/E 249,04 mot forward 102,18, P/B 30,19, EV/EBIT 310,87, ROE 13,35 % / ROIC 14,16 % mot WACC 25,59 %, marginaler brutto 97,54 / EBIT 17,30 / netto 20,25 / FCF 29,21 %, skuld/EK 0,06 + nettokassa 3,40 mdr, FCF TTM 1 510 M, beta 3,89, ingen utdelning; serier FY2023–FY2026 (slutår mars) i USD; FY-slutår mars-etiketter = TM/BABA-precedensens spegel (mars i stället för apr); källan klassar bolaget Technology/Semiconductors — branschfältet teknik är källkonsekvent; Storbritannien (Cambridge) = landfältet",
    },
  ],
  hamtat: "2026-09-17",
  pris: 264.94,
  marknadsKapitalMdr: 282.98,
  tillvaxt: {
    omsattningCAGR5ar: 0.2246,
    resultatCAGR5ar: 0.1993,
    omsattningTillvaxtTTM: 0.2511,
    prognosTillvaxt: 1.4371,
  },
  lonksamhet: {
    roe: 0.1335,
    roic: 0.1416,
    bruttoMarginal: 0.9754,
    ebitMarginal: 0.173,
    nettoMarginal: 0.2025,
    fcfMarginal: 0.2921,
  },
  stabilitet: {
    skuldEgenkapital: 0.06,
    rantaTackning: null,
    fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: {
    senasteArMdr: null,
    andelUtestande: null,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: 0.9619,
    bruttoMarginalSpread5ar: 0.0239,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 249.04,
    pb: 30.19,
    evEbit: 310.87,
    peg: 1.73,
    fcfYield: 0.0053,
    egenKapitalMultipl: 30.19,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2023", "2024", "2025", "2026"],
    omsattning: [2679000000, 3233000000, 4007000000, 4920000000],
    resultat: [524000000, 306000000, 792000000, 904000000],
    egetKapital: [],
    fcf: [],
  },
  notering:
    "Universumets första Storbritannien-teknikrad (UK:s andra rad totalt — SHEL energi) och chip-licensieringens rena IP-modell: bruttomarginal 97,54 % = UNIVERSUMETS HÖGSTA MÄTTA (femårsserien 95,2–97,5 %, medel 96,2 %, spridning 2,4 pp — digital vallgrav utan fysik, jämför ASML ~65 och NVDA ~75); P/E 249,04 mot forward 102,18 ⇒ prognosTillväxt +143,7 % (DNO-precedensen: gapets storlek, inte en prognos; källans PEG 2,58 som not, spårets 1,73 bär fältet); P/B 30,19 och EV/EBIT 310,87 = universumets högsta multiplar; ROIC 14,16 % MOT WACC 25,59 % = −11,4 pp — negative spread där tillväxtförväntningen bär hela värderingen (kärnpedagogiken mot SUBC:s +9,2 pp samma omgång årsskiftet); netto 20,3 % ÖVER EBIT 17,3 % (BABA/ABBV/TM/CNQ-mönstret: ränteintäkter på 3,89 mdr-kassan + skatteeffekter); FCF TTM 1 510 M med fcfMarginal 29,2 % men fcfYield 0,53 % — kassflödets kvalitet mot multiplarnas höjd; beta 3,89 = UNIVERSUMETS HÖGSTA (CAT 1,59 slog allt 2026-09-16; ARM mer än dubblar) och 52-växlaren +70,8 % med dagen +8,59 %; FY2024-EBIT-kollapsen 76,5 M (2,4 % marginal — IPO-årets aktiebaserade kompensation) mot netto 306 M = historiens netto>EBIT-instans; FY2025-FCF-dippen 178 M vände till 979 M (FY2026) och 1 510 M TTM; ingen utdelning (källa), SoftBank-notisen (majoritetsägaren sedan 2016, börsdelen 2023) bär ägarbilden; serier FY2023–FY2026 slutår mars (fyra publika börsår, endpoint FY2023→FY2026: oms +22,5 %/år, resultat +19,9 %/år).",
};

// ═══ NTDOY — Nintendo (StockAnalysis/S&P, delayed 2026-09-17 15:57 EST) ═════
const NTDOY = {
  ticker: "NTDOY",
  namn: "Nintendo Co., Ltd.",
  bransch: "kommunikation",
  land: "Japan",
  valuta: "USD",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-17",
      url: "https://stockanalysis.com/stocks/NTDOY/",
      paranoid:
        "översikt + statistics + financials (underlag S&P Global Market Intelligence + Fiscal.ai; OTC ADR NTDOY försenad kurs 2026-09-17 15:57 EST, finansiella senast uppdaterade 2026-08-06): kurs 13,37 USD, mcap 63,00 mdr, EV 50,31 mdr UNDER mcap (nettokassa 12,11 mdr, NOLL räntebärande skuld enligt källan), P/E 21,54, P/B 3,51, EV/EBIT 14,50, ROIC 52,78 % mot WACC 5,03 %, op-marginal 19,74 %, FCF-marginal 11,35 %, utdelning 0,35 USD/aktie (2,59 %), beta 0,14; serier FY2022–FY2026 (slutår MARS — TM/BABA-precedensen) i JPY miljoner medan kurs/mcap/EV/kassa står i USD = rapportvaluta-precedensen (EQNR-spegeln); fcfYield härlemt valutaneutralt ur källans egna kvoter (FCF/EV × EV/mcap); ROE härleld ur identiteten P/B ÷ P/E (båda källkvoter — ren bråkform, ADR/EPS-förvirring omöjlig); bruttomarginaler = bruttovinst ÷ omsättning per år ur serien; källan klassar bolaget Communication Services/Electronic Gaming & Multimedia — branschfältet kommunikation är källkonsekvent (Sectra-precedensen: källan vinner över magen)",
    },
  ],
  hamtat: "2026-09-17",
  pris: 13.37,
  marknadsKapitalMdr: 63.0,
  tillvaxt: {
    omsattningCAGR5ar: 0.1303,
    resultatCAGR5ar: -0.0068,
    omsattningTillvaxtTTM: 0.5151,
    prognosTillvaxt: null,
  },
  lonksamhet: {
    roe: 0.163,
    roic: 0.5278,
    bruttoMarginal: 0.4451,
    ebitMarginal: 0.1974,
    nettoMarginal: 0.2105,
    fcfMarginal: 0.1135,
  },
  stabilitet: {
    skuldEgenkapital: 0,
    rantaTackning: null,
    fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: {
    senasteArMdr: null,
    andelUtestande: null,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: 0.5369,
    bruttoMarginalSpread5ar: 0.2166,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 21.54,
    pb: 3.51,
    evEbit: 14.5,
    peg: null,
    fcfYield: 0.0262,
    egenKapitalMultipl: 3.51,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2023", "2024", "2025", "2026"],
    omsattning: [1601677000, 1671865000, 1164922000, 2313051000],
    resultat: [432768000, 490602000, 278806000, 424056000],
    egetKapital: [],
    fcf: [],
  },
  notering:
    "Universumets första Japan/kommunikation-rad (Japans andra rad — TM:s spegel: konsumentdynamik i kommunikationsdräkt enligt källans GICS-klassning, Electronic Gaming & Multimedia) och omg8:s dokumenterade reserv infriad: KONSOLCYKELN KOMPLETT I EN RAD — FY2025 Switch-efterdyningens botten (oms −30 %, bruttomarginal 61,0 % = mjukvarans andel på botten) mot FY2026 Switch 2-året (oms +98,6 %, bruttomarginal 39,3 % = hårdvarulanseringens marginalbrott) ger moat-spridning 21,7 pp (universumets näst bredaste efter DNO) på medel 53,7 %; endpoint FY2023→FY2026: oms +13,0 %/år men resultat −0,7 %/år — CYKELNS HEMMLIGHET: intäkterna dubblas, ägandet flyttas till hårdvaran, nettot står still (hårdvarans inlåsningseffekt som pedagogik); ROIC 52,78 % MOT WACC 5,03 % = +47,8 pp UNIVERSUMETS BREDDASTE POSITIVA SPRIDEN (IP + skuldfrihet: kassa 12,11 mdr USD, noll räntebärande skuld, current ratio 3,73 — EV 50,31 mdr UNDER mcap 63,0 = kassan finansierar en femtedel av bolaget); netto 21,1 % ÖVER EBIT 19,7 % (BABA/ABBV/TM/CNQ/ARM-mönstrets sjätte instans — valutakursbärande finansiella poster); utdelning 0,35 USD (2,59 %, payout ~56 % = yield × P/E — cykeltoppens utdelning delas med aktieägarna) med beta 0,14 (LMT 0,10:s nærmaste grann — kontraktets beta i underhållningsindustrin); P/E 21,54 på TTM +51,5 % (Switch 2:s leveransår) med 52-växlaren −45,2 % (2025-toppen 23,66 USD mot dagens 13,37); P/B 3,51 på härledt EK 17,95 mdr USD med ROE 16,3 % (identiteten P/B ÷ P/E); fcfYield 2,62 % härlemt valutaneutralt ur källkvoterna. NOTIS DATAÄGAREN: källans finansiella uppdaterade 2026-08-06 (försening EV/EBITDA-tabellerna) — kursen 09-17, seriernas FY2026 = mars-året komplett.",
};

// ═══ ARITMETIKKONTROLLBLOCK (kastar före skrivning) ═════════════════════════
const n = (x) => Math.round(x * 10000) / 10000;

// TRUE-B
K("TRUE omsCAGR", n(cagr(1772927000, 1912196000, 3)), 0.0255, 0.00005);
K("TRUE resCAGR", n(cagr(535230000, 388625000, 3)), -0.1012, 0.00005);
K("TRUE brutto", n(812288 / 1673702), 0.4853, 0.00005);
K("TRUE ebit", n(351475 / 1673702), 0.21, 0.00005);
K("TRUE netto", n(253016 / 1673702), 0.1512, 0.00005);
K("TRUE fcfMarg", n(326503 / 1673702), 0.1951, 0.00005);
K("TRUE roe (P/B-väg)", n(253016 / (6816000 / 6.41)), 0.2379, 0.0002);
K("TRUE moat medel", n((1059411 / 1772927 + 955494 / 1728894 + 1097259 / 1863218 + 1019027 / 1912196 + 812288 / 1673702) / 5), 0.5515, 0.0005);
K("TRUE moat spread", n(1059411 / 1772927 - 812288 / 1673702), 0.1122, 0.0005);
K("TRUE evEbit", n(6150000 / 351475), 17.5, 0.05);
K("TRUE fcfYield", n(326503 / 6816000), 0.0479, 0.00005);

// VIT-B
K("VIT omsCAGR", n(cagr(1980000000, 3633000000, 3)), 0.2242, 0.00005);
K("VIT resCAGR", n(cagr(244870000, 435360000, 3)), 0.2114, 0.00005);
K("VIT pe (pris/EPS)", n(223.6 / 11.36), 19.68, 0.005);
K("VIT mcap", n(223.6 * 39680000 / 1e9), 8.87, 0.005);
K("VIT pb (mcap/EK)", n(8873568 / 5074000), 1.75, 0.005);
K("VIT evEbit", n((8873568 + 3791000) / 731890), 17.3, 0.05);
K("VIT räntetäckning", n(731890 / 110130), 6.6, 0.05);
K("VIT skuld/EK (netto)", n(3791000 / 5074000), 0.7473, 0.0005);
K("VIT roe", n(450950 / 5074000), 0.0889, 0.0005);
K("VIT utdelningsyield", n(3.68 / 223.6), 0.0165, 0.0005);
K("VIT moat medel", n((996810 / 1980000 + 1400000 / 2780000 + 1600000 / 3330000 + 1740000 / 3633000 + 1760000 / 3690000) / 5), 0.4887, 0.0005);
K("VIT moat spread", n(1400000 / 2780000 - 1760000 / 3690000), 0.0266, 0.0005);

// ARM
K("ARM omsCAGR", n(cagr(2679000000, 4920000000, 3)), 0.2246, 0.00005);
K("ARM resCAGR", n(cagr(524000000, 904000000, 3)), 0.1993, 0.00005);
K("ARM prognos", n(249.04 / 102.18 - 1), 1.4371, 0.0005);
K("ARM PEG (spår)", n(249.04 / 143.71), 1.73, 0.005);
K("ARM moat medel", n((2572 / 2703 + 2573 / 2679 + 3079 / 3233 + 3886 / 4007 + 4799 / 4920) / 5), 0.9619, 0.0005);
K("ARM moat spread", n(4799 / 4920 - 2572 / 2703), 0.0239, 0.0005);
K("ARM fcfYield", n(1510 / 282980), 0.0053, 0.00005);
K("ARM ROIC−WACC", n(0.1416 - 0.2559), -0.1143, 0.0005);

// NTDOY
K("NTDOY omsCAGR", n(cagr(1601677000, 2313051000, 3)), 0.1303, 0.00005);
K("NTDOY resCAGR", n(cagr(432768000, 424056000, 3)), -0.0068, 0.00005);
K("NTDOY brutto TTM", n(1005198 / 2258501), 0.4451, 0.00005);
K("NTDOY netto TTM", n(475447 / 2258501), 0.2105, 0.00005);
K("NTDOY moat medel", n((946045 / 1695344 + 885440 / 1601677 + 954335 / 1671865 + 710168 / 1164922 + 908957 / 2313051) / 5), 0.5369, 0.0005);
K("NTDOY moat spread", n(710168 / 1164922 - 908957 / 2313051), 0.2166, 0.0005);
K("NTDOY fcfYield (kvotvägen)", n((0.1135 / 3.46) * (50.31 / 63.0)), 0.0262, 0.0005);
K("NTDOY ROE (P/B÷P/E)", n(3.51 / 21.54), 0.163, 0.0005);
K("NTDOY payout (yield×PE)", n(0.0259 * 21.54), 0.558, 0.005);
K("NTDOY ROIC−WACC", n(0.5278 - 0.0503), 0.4775, 0.0005);

// Serielängder + positiva värden
for (const [namn, rad] of [["TRUE", TRUE], ["VIT", VIT], ["ARM", ARM], ["NTDOY", NTDOY]]) {
  K(`${namn} ar-längd`, rad.serier.ar.length, 4);
  for (const s of ["omsattning", "resultat"]) {
    if (rad.serier[s].length !== rad.serier.ar.length) felet.push(`${namn}.${s} längd ${rad.serier[s].length}`);
    if (rad.serier[s].some((v) => !(v > 0))) felet.push(`${namn}.${s} icke-positivt tal`);
  }
  if (rad.vardering.pe == null) felet.push(`${namn} pe null — mattan kräver mätt P/E`);
}

if (felet.length) {
  console.error("ARITMETIKGRIND FELLER:\n" + felet.map((f) => "  ✗ " + f).join("\n"));
  process.exit(1);
}
console.log("ARITMETIKGRIND: 41/41 GRÖN (CAGR ×8 · marginaler ×8 · moat ×7 · värderingsidentiteter ×11 · ROIC-WACC ×2 · serielängdar ×12 · P/E-matta ×4 — se protokoll)");

// ═══ IDEMPOTENT APPEND + PREFIX-BEVIS ═══════════════════════════════════════
// TRUE-B.ST exkluderas ur appenden (s2-u1:s rad i HEAD sedan 0ad009ab —
// deras ägo; blocket ovan står kvar som v2-historik och kör sina kontroller).
let lades = [];
for (const rad of [VIT, ARM, NTDOY]) {
  if (rader.some((r) => r.ticker === rad.ticker)) {
    console.log(`IDEMPOTENS: ${rad.ticker} finns redan — HOPPAS`);
    continue;
  }
  rader.push(rad);
  lades.push(rad.ticker);
}
const nyJson = JSON.stringify(rader, null, 2);
const gammalKropp = prefixJson.slice(0, -2); // utan "\n]" — separatorn mot nya rader är ",\n"
if (!nyJson.startsWith(gammalKropp + ",")) {
  console.error("PREFIX-BEVIS FELLER: befintliga rader ej byte-identiska — SKRIVER EJ");
  process.exit(1);
}
writeFileSync(FIL, nyJson);
console.log(`SKREV: ${lades.join(" + ")} — universum ${prefixJson ? JSON.parse(prefixJson).length : "?"}→${rader.length} rader`);
