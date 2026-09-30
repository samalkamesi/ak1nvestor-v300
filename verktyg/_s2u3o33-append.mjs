#!/usr/bin/env node
// _s2u3o33-append.mjs — s2-u3 (manifest auto-s2-1790799927010) ITALIEN/FINANS-TRION
// ISP.MI + UCG.MI + G.MI append till data/portfolj-system/bolagsunivers.json.
// Regler (omg29-u3/omg32-konventionerna): mutex via mkdir-lås; append på diskens
// FAKTISKA läge (syskon kan ha skrivit); prefix-bit-identiskt bevis + läs-tillbaka ×2;
// idempotent (redan-appendat => exit 0); aritmetikgrind 56/56 GRÖN FÖRE detta skript.
import { readFileSync, writeFileSync, mkdirSync, rmdirSync } from "node:fs";
import { createHash } from "node:crypto";

const FIL = "data/portfolj-system/bolagsunivers.json";
const LAS = "/tmp/ak1a-s2u3o33-append.lock";

try { mkdirSync(LAS); } catch {
  console.log("MUTEX upptagen — annan append pågår. Avbryter (omkörning säker).");
  process.exit(2);
}
const lasBort = () => { try { rmdirSync(LAS); } catch {} };
process.on("exit", lasBort);
process.on("SIGINT", () => { lasBort(); process.exit(3); });
process.on("SIGTERM", () => { lasBort(); process.exit(3); });

const rå = readFileSync(FIL, "utf8");
const före = JSON.parse(rå);
const nya = ["ISP.MI", "UCG.MI", "G.MI"];
if (före.some(r => nya.includes(r.ticker))) {
  console.log(`IDEMPOTENT: ${före.filter(r => nya.includes(r.ticker)).map(r => r.ticker).join("+")} finns — inget skrivs.`);
  process.exit(0);
}
const prefixHash = createHash("sha256").update(rå).digest("hex").slice(0, 16);
console.log(`Före: ${före.length} rader · prefix-sha256 ${prefixHash}`);

// ── raderna (källor: StockAnalysis fem ytor ×3 bit-vägen, pålästa 2026-09-30,
//    kurs close 2026-09-30 CET S&P GMI-bas; Yahoo chart-API paranoid ISP 0,08 %-band,
//    UCG+G 0,00 % EXAKT; aritmetikgrind 56/56) ─────────────────────────────────
const isp = {
  ticker: "ISP.MI",
  namn: "Intesa Sanpaolo S.p.A.",
  bransch: "finans",
  land: "Italien",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-30",
      url: "https://stockanalysis.com/quote/bit/ISP/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
      paranoid:
        "Borsa Italiana (bit-vägen bevisad av ENI/TRN-precedenserna; full fem-ytepanel), S&P Global Market Intelligence-underlag, sidor pålästa 2026-09-30 med kurs close 2026-09-30 CET −1,60 %: pris 6,65 EUR/mcap 117,19 mdr (aktier 17,35 mdr — 2-decimals-avrundning, replik 115,38 mdr +1,6 % klassen); STATISTICS: P/E 12,17 (replik NI/aktier 9 660/17 350 = 11,94, −1,9 % dokumenterad källspridning — källans EPS-bas 0,5464 mot NI-repliken 0,5568), fwd 10,80 (⇒ prognosTillväxt +12,69 % mekanisk normaliseringsgap-konvention; källans 3-års EPS-prognos +9,98 %/år som kontrast-not), P/B 1,69 = mcap/EK 117 190÷69 154 EXAKT, P/TBV 1,98, P/FCF 33,40, PEG 1,20 källans fält; EV-mått n/a (bank — källan redovisar ej EV); ROE 14,26 % (replik NI/EK 13,96 % — källans medel-EK-bas, 2,0 %), ROA 1,00 %, ROIC n/a, WACC 2,72 % (källans kapitalkostnadsmodell) ⇒ ROE-övertryck +11,54 pp; marginaler TTM EUR: operating 59,05 % EXAKT, pretax 51,03 %, profit 36,96 %, FCF 13,43 % EXAKT (gross n/a — bank saknar varukostnad); kassa 137,62 mdr, skuld 265,55 mdr (kundinsättningarnas värld — D/E n/a bank-konventionen), EK 69,15 mdr, BVPS 3,91; OCF 3,78 mdr, capex −0,27 mdr, FCF 3,51 mdr (fcfYield 2,99 % EXAKT; FCF-payout 186,06 % = kundmedelsbalansens artefakt, ITUB-klassens not); utdelning 0,38 EUR (5,72 %, tillväxt +10,26 %/år 3 år, payout 68,46 %) + buyback 2,90 % = shareholder yield 8,61 %, earnings yield 8,24 %; skatt 3,65 mdr/27,38 %; Piotroski 3, Altman n/a (bank), beta 0,84, 52-v +19,60 % (4,81–6,94), RSI 44,67; analytiker Buy PT 7,27 (+9,41 %) av 13; rev-prognos 3 år +4,36 %/år; institutioner 33,85 %; FY kalenderår; Yahoo chart-API paranoid 6,645 = 0,08 % band (Borsa-stängd skillnad mot SA:s 6,65)",
    },
  ],
  hamtat: "2026-09-30",
  pris: 6.65,
  marknadsKapitalMdr: 117.19,
  tillvaxt: {
    omsattningCAGR5ar: 0.0856,
    resultatCAGR5ar: 0.1292,
    omsattningTillvaxtTTM: 0.0319,
    prognosTillvaxt: 0.1269,
  },
  lonksamhet: {
    roe: 0.1426,
    roic: null,
    bruttoMarginal: null,
    ebitMarginal: 0.5905,
    nettoMarginal: 0.3696,
    fcfMarginal: 0.1343,
  },
  stabilitet: {
    skuldEgenkapital: null,
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
    bruttoMarginalMedel5ar: null,
    bruttoMarginalSpread5ar: null,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 12.17,
    pb: 1.69,
    evEbit: null,
    peg: 1.20,
    fcfYield: 0.0299,
    egenKapitalMultipl: 1.69,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [18229000000, 22900000000, 25380000000, 25379000000, 25323000000],
    resultat: [5735000000, 5519000000, 7725000000, 8670000000, 9324000000],
    egetKapital: [],
    fcf: [4136000000, 5352000000, 6752000000, 3880000000, 3248000000],
  },
  notering:
    "universumets FÖRSTA Italien/finans-rad och triopens inlåningsarketyp — Italien = eurozonens tredje största ekonomi (G7) som före denna leverans bar NOLL finansbolag av grenens 41 (grenens största nationella nolla i eurozonen); Intesa = distributörsbanken: född 1998 ur saneringen av Italiens sparkasserötter, 89 725 anställda, Italiens största inlåningsbas med försäkringsgrene (Fideuram/Vitality); SIGNATURTALET ÄR PÅGÅENDE UNDER HÄMTDAGEN: fientligt bud ~36 mdr EUR på Monte dei Paschi (Italiens äldsta bank, grundad 1472) — universumets första fientliga storbank-kupp som LIVANDE händelse (motbudsmekanik mot medbankerna, källans flöde, inga slutsatser); AI-BLUFFNOTISEN Fideuram 95 M EUR i samma flöde; RESULTATTRAPPAN PÅ PLATÅ-OMSÄTTNING: netto 5 735→5 519→7 725→8 670→9 324 M EUR (+12,92 %/år fyra raka tillväxtår) medan omsättningen står stilla 25,4→25,3 mdr (2023-topp) — vinsten växer på marginaler (EBIT 59,05 %), inte på volym: FÖRSÄKRINGS- OCH PROVISIONSINTÄKTERNAS bankmodell mot UCG:s expansionsmodell i samma gren; ÅTERBÄRINGSMASKINEN: utdelning 5,72 % + buyback 2,90 % = shareholder yield 8,61 % (den högsta i triopen) med payout 68,46 % av vinsten; ROE 14,26 % mot WACC 2,72 % = +11,54 pp (inlåningsbankens kapitalkostnads-fördel — källans modell); P/B 1,69 och P/TBV 1,98 UNDER tangenta 2,0-booken; FCF-payout 186 % dokumenterad artefakt (bankens kundmedelsbalans, ITUB-precedensens not) medan FY-serien 4,1→5,4→6,8→3,9→3,2 mdr EUR är 5/5 positiv; bank-konventionen enligt BNP/SAN-mallen: evEbit/skuldEk/räntetäckning/bruttomarginal null (källan saknar), stabilitets-FCF-tal null (kundmedelsdrivet); nästa rapport 2026-10-30; rapport i EUR, räkenskapsår kalenderår",
};

const ucg = {
  ticker: "UCG.MI",
  namn: "UniCredit S.p.A.",
  bransch: "finans",
  land: "Italien",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-30",
      url: "https://stockanalysis.com/quote/bit/UCG/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
      paranoid:
        "Borsa Italiana (bit-vägen, ENI/TRN-precedenserna), S&P Global Market Intelligence-underlag, sidor pålästa 2026-09-30 med kurs close 2026-09-30 CET −1,07 %: pris 82,90 EUR/mcap 125,56 mdr (aktier 1,50 mdr avrundad; replik 124,68 mdr +0,7 %); STATISTICS: P/E 11,90 (replik 82,90/7,04 = 11,78, −1,1 % dokumenterad källspridning), fwd 10,64 (⇒ prognosTillväxt +11,84 % mekanisk konvention; källans 3-års EPS-prognos +13,53 %/år som kontrast-not), P/B 1,77 = mcap/EK 125 560÷70 820 EXAKT, P/TBV 1,86, P/FCF 7,36, PEG 0,66 källans fält (triopens enda under 1,0); EV-mått n/a (bank); ROE 15,78 % (replik NI/EK 15,15 % — källans medel-EK-bas, 4,0 %), ROA 1,23 %, ROIC n/a, WACC 3,39 % ⇒ ROE-övertryck +12,39 pp; marginaler TTM EUR: operating 62,95 % EXAKT, pretax 54,44 %, profit 43,97 % (replik NI/rev 43,20 % — källans TTM-fönster glider mot NI-raden, fältet bärs med not), FCF 68,63 % (replik 68,64 % — kundmedelsflödenas artefakt-marginal, dokumenterad); kassa 192,98 mdr, skuld 247,79 mdr, EK 70,82 mdr, BVPS 47,00; OCF 17,73 mdr, capex −0,68 mdr, FCF 17,05 mdr (fcfYield 13,58 % EXAKT); utdelning 3,15 EUR (3,80 %, tillväxt +31,07 %/år 4 år — triopens snabbast växande utdelning, payout 48,64 %) + buyback 3,15 % = shareholder yield 6,88 %; skatt 2,54 mdr/18,78 % (triopens lägsta skattesats); Piotroski 4, Altman n/a (bank), beta 1,06 (triopens enda över 1), 52-v +30,26 % (57,36–86,42), RSI 47,65; analytiker Buy PT 94,14 (+13,56 %) av 18; rev-prognos 3 år +5,98 %/år; institutioner 44,95 %; FY kalenderår; Yahoo chart-API paranoid 82,90 = 0,00 % band EXAKT",
    },
  ],
  hamtat: "2026-09-30",
  pris: 82.9,
  marknadsKapitalMdr: 125.56,
  tillvaxt: {
    omsattningCAGR5ar: 0.0532,
    resultatCAGR5ar: 0.2051,
    omsattningTillvaxtTTM: -0.0084,
    prognosTillvaxt: 0.1184,
  },
  lonksamhet: {
    roe: 0.1578,
    roic: null,
    bruttoMarginal: null,
    ebitMarginal: 0.6295,
    nettoMarginal: 0.4397,
    fcfMarginal: 0.6863,
  },
  stabilitet: {
    skuldEgenkapital: null,
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
    bruttoMarginalMedel5ar: null,
    bruttoMarginalSpread5ar: null,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 11.9,
    pb: 1.77,
    evEbit: null,
    peg: 0.66,
    fcfYield: 0.1358,
    egenKapitalMultipl: 1.77,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [20361000000, 24720000000, 24915000000, 26197000000, 25050000000],
    resultat: [5076000000, 5365000000, 9733000000, 10653000000, 10710000000],
    egetKapital: [],
    fcf: [4115000000, 10584000000, 9002000000, 15816000000, 16708000000],
  },
  notering:
    "universumets ANDRA Italien/finans-rad och triopens EXPANSIONSarketyp — ORCELS TRANSFORMATIONSBERÄTTELSE: nettoresultat 5 076→5 365→9 733→10 653→10 710 M EUR = DOUBLERAT på fyra år (+20,51 %/år) medan omsättningen bara +5,32 %/år — kostnadsmaskinen (källans ORION-program) gör vinsten tre gånger snabbare än intäkterna: samma mekanik som NetEase-arketypen men i en BANK (född 1870, 66 180 anställda); SIGNATUREN ÄR PÅGÅENDE: Commerzbank-uppbyggnaden ~48 % av den tyska rivalen säkrad — EU:s största gränsöverskridande bankfusionsdrama sedan finanskrisen, med Banco BPM-striden mot Crédit Agricole och dansk kompromiss i samma flöde (källans nyhetsyta, inga slutsatser); FIFO-NOTISEN: nästa rapport 2026-10-21 = universumets 10-21-KLUSTER (AT&T/VärEnergi/IBERDROLA samma kalenderdag — Q3-vågens markerade datum); UTDELNINGSTRAPPAN +31,07 %/år (4 år) till 3,15 EUR (3,80 %) med payout bara 48,64 % — utdelningen växer på VINSTUTRYMME, inte på payout-krymp; PEG 0,66 källans fält = triopens enda under 1,0 (marknadens prislapp på transformationsberoendet); FCF-marginal 68,63 % dokumenterad artefakt (kundmedelsbalansens flöden — ITUB/BBVA-klassens not) men FCF-serien 4,1→10,6→9,0→15,8→16,7 mdr EUR är 5/5 positiv och fcfYield 13,58 % EXAKT replikerbar; ROE 15,78 % mot WACC 3,39 % = +12,39 pp; beta 1,06 triopens enda över 1; bank-konventionen (BNP/SAN-mallen): evEbit/skuldEk/räntetäckning/brutto null; nettokassa-serien −107→−117→−73→−53→−50 mdr EUR (BS-ytans fem år) = insättningsmaskinens normala läge, dokumenterad som bankens värld ej industrins; rapport i EUR, räkenskapsår kalenderår",
};

const gene = {
  ticker: "G.MI",
  namn: "Assicurazioni Generali S.p.A.",
  bransch: "finans",
  land: "Italien",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-30",
      url: "https://stockanalysis.com/quote/bit/G/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
      paranoid:
        "Borsa Italiana (bit-vägen, ENI/TRN-precedenserna), S&P Global Market Intelligence-underlag, sidor pålästa 2026-09-30 med kurs close 2026-09-30 CET −1,75 %: pris 42,75 EUR/mcap 65,79 mdr (aktier 1,51 mdr — 2-decimals-avrundning, underliggande 1 538,9 M; EPS-replik 4 540÷1 539 = 2,95 stödjer); STATISTICS: P/E 14,76 (replik 42,75/2,96 = 14,44, −2,2 % dokumenterad källspridning), fwd 13,14 (⇒ prognosTillväxt +12,33 % mekanisk konvention; källans 3-års EPS-prognos +8,21 %/år som kontrast-not), P/B 1,89 = mcap/EK 65 790÷34 878 EXAKT, P/TBV 3,29, P/FCF 3,03, PEG 1,46 källans fält; EV 103,01 mdr (identitetsreplik mcap+skuld−kassa = 99 590, −3,3 % — källans interna minoritets-/pensionstillägg, fältet bärs); EV/EBIT 13,51 (replik 103 010÷7 630 = 13,50 EXAKT på källans EV), EV/EBITDA 12,75 EXAKT, EV/FCF 4,74 — FÖRSÄKRINGEN bär EV-mått till skillnad från bank-syskonen (AXA-mallen: investeringsportföljbalans, inte insättningsmaskin); D/E 1,19, räntetäckning 9,47×, current 2,46 (fält som bank-syskonens källor saknar — bärs); ROE 15,14 %, ROA 0,85 %, ROIC 7,32 % MOT WACC 5,37 % = +1,95 pp (kapitaltung moat); skatt 1,86 mdr/26,74 %; marginaler TTM EUR (på statistics-basens försäkringsintäkter 59,32 mdr): gross 20,42 % EXAKT (12 110), operating 12,86 % EXAKT (7 630), pretax 11,70 %, profit 7,68 %, EBITDA 13,62 %, FCF 36,62 % (21 720 — premieflödets marginal, artefakt-klassen dokumenterad); KÄLLSPRIDNING DOKUMENTERAD: statistics TTM-revenue 59,32 mdr (försäkringsintäkter) mot financials FY2025 115,93 mdr (totala intäkter inkl investeringsresultat) — IFRS-17:s två intäktsbegrepp, därför omsattningTillvaxtTTM null; kassa 7,69 mdr, skuld 41,49 mdr, EK 34,88 mdr, BVPS 21,23; OCF 22,06 mdr, capex −0,34 mdr, FCF 21,72 mdr (fcfYield 33,02 % EXAKT); utdelning 1,64 EUR (3,84 %, tillväxt +14,69 %/år 3 år, payout 59,76 %, FCF-payout 11,42 %) + buyback 2,16 % = shareholder yield 6,00 %; Piotroski 4, Altman n/a (finans), beta 0,66 (triopens lugnaste), 52-v +27,92 % (31,76–46,24), RSI 38,54; analytiker Hold PT 42,51 (−0,56 % av 14 — kursen ÖVER konsensusmålet, not ej rekommendation); rev-prognos 3 år +25,07 %/år (källans fält, IFRS-17-effekter); institutioner 12,82 %; FY kalenderår; Yahoo chart-API paranoid 42,75 = 0,00 % band EXAKT",
    },
  ],
  hamtat: "2026-09-30",
  pris: 42.75,
  marknadsKapitalMdr: 65.79,
  tillvaxt: {
    omsattningCAGR5ar: 0.0206,
    resultatCAGR5ar: 0.0143,
    omsattningTillvaxtTTM: null,
    prognosTillvaxt: 0.1233,
  },
  lonksamhet: {
    roe: 0.1514,
    roic: 0.0732,
    bruttoMarginal: 0.2042,
    ebitMarginal: 0.1286,
    nettoMarginal: 0.0768,
    fcfMarginal: 0.3662,
  },
  stabilitet: {
    skuldEgenkapital: 1.19,
    rantaTackning: 9.47,
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
    bruttoMarginalMedel5ar: null,
    bruttoMarginalSpread5ar: null,
    roeMedel5ar: null,
  },
  vardering: {
    pe: 14.76,
    pb: 1.89,
    evEbit: 13.51,
    peg: 1.46,
    fcfYield: 0.3302,
    egenKapitalMultipl: 1.89,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [106856000000, 128111000000, 118114000000, 113092000000, 115930000000],
    resultat: [3942000000, 5408000000, 5488000000, 4092000000, 4172000000],
    egetKapital: [],
    fcf: [9090000000, 10532000000, 10824000000, 11706000000, 15374000000],
  },
  notering:
    "universumets TREDJE Italien/finans-rad och triopens FÖRSÄKRINGSarketyp (AXA-mallen) — TRIESTE 1831: universumets äldsta grundade finansbolag (195 år; österrikisk rijksdalar-epokens försäkringsbolag som överlevt fem styrelseskick) och Medicineffektens motsats: bankernas vändningar mot försäkringens STABILITET (netto 3 942→5 408→5 488→4 092 M EUR, resCAGR +1,43 %/år — 2022 års kris-topp och 2024 års nedskrivningsår synliga, inga förlustår); FÖRSÄKRINGS-KONVENTIONEN dokumenterad i raden: EV-måtten BÄR (EV 103,01 mdr, EV/EBIT 13,51 replik EXAKT) och ROIC 7,32 % mot WACC 5,37 % = +1,95 pp — försäkringsbalansen är en investeringsportfölj som förvaltas mot kapitalkostnad, inte en insättningsmaskin (därför bär även D/E 1,19 och räntetäckning 9,47× som bank-syskonens källor saknar); IFRS-17-PARADOKSET som metodfynd: statistics-basen TTM 59,32 mdr (försäkringsintäkter) mot financials-basen FY2025 115,93 mdr (totala intäkter inkl investeringsresultat) — källans egna ytor bär två intäktsbegrepp, därför sätts omsattningTillvaxtTTM null (ärlig osättning hellre än en falsk siffra på skilda baser); FCF-maskinen: OCF 9,5→11,0→11,3→12,5→16,1 mdr EUR (FY2021–2025) med capex under 1 mdr/år — FCF 9,1→15,4 mdr 5/5 positiv, fcfYield 33,02 % EXAKT (premieflödets kraft, artefakt-klassen dokumenterad medan serien ändå bär); SIGNATUR I SISTA HÄNDELSEN: köpte 3,01 % av Monte dei Paschi i MPS-jakten — och Intesa svarade med 3 % i GENERALI: tvärförvärvskedjan som FÖRSÄKRINGS-DRAMAT (syskonradens budmål som mitt i Generalis egen ägarstruktur, källans flöde, inga slutsatser); 500 M EUR buyback H1 2026; utdelningstillväxt +14,69 %/år med payout 59,76 %; beta 0,66 triopens lugnaste; nästa rapport 2026-11-13; rapport i EUR, räkenskapsår kalenderår",
};

// ── append: textuell, prefix-bit-identisk ────────────────────────────────────
const klippt = rå.replace(/\]\n?$/, "");
const ser = (rad) => JSON.stringify(rad, null, 2).split("\n").map(l => (l ? "  " + l : l)).join("\n");
const ny = `${klippt},\n${ser(isp)},\n${ser(ucg)},\n${ser(gene)}\n]\n`;

// verifiera FÖRE skrivning: prefix-bevis + giltighet + antal
const gamlaBuf = Buffer.from(rå, "utf8");
const nyaBuf = Buffer.from(ny, "utf8");
if (!nyaBuf.slice(0, klippt.length).equals(gamlaBuf.slice(0, klippt.length)))
  throw new Error("PREFIX-BEVIS FÖRKASTAT — klipp ej bitidentiskt");
const efter = JSON.parse(ny);
if (efter.length !== före.length + 3) throw new Error(`antal ${efter.length} ≠ ${före.length + 3}`);
if (efter[före.length].ticker !== "ISP.MI" || efter[före.length + 1].ticker !== "UCG.MI" || efter[före.length + 2].ticker !== "G.MI")
  throw new Error("sista tre raderna fel ordning");
// källvärdes-identiteter (dubbelstängning mot grinden)
if (efter[före.length].vardering.pb !== 1.69 || efter[före.length].serier.resultat[4] !== 9324000000)
  throw new Error("ISP.MI-fält verifiering misslyckad");
if (efter[före.length + 1].vardering.pe !== 11.9 || efter[före.length + 1].serier.resultat[4] !== 10710000000)
  throw new Error("UCG.MI-fält verifiering misslyckad");
if (efter[före.length + 2].vardering.evEbit !== 13.51 || efter[före.length + 2].serier.fcf[4] !== 15374000000)
  throw new Error("G.MI-fält verifiering misslyckad");

writeFileSync(FIL, ny);

// läs-tillbaka ×2 (omg30-konventionen)
for (let i = 1; i <= 2; i++) {
  const tb = readFileSync(FIL, "utf8");
  const tbr = JSON.parse(tb);
  const tbPrefix = tb.slice(0, klippt.length);
  console.log(`läs-tillbaka ${i}: ${tbr.length} rader · prefix bitidentisk ${tbPrefix === rå.slice(0, klippt.length) ? "JA" : "NEJ"} · sista tre ${tbr[tbr.length - 3].ticker}+${tbr[tbr.length - 2].ticker}+${tbr[tbr.length - 1].ticker}`);
}
const efterHash = createHash("sha256").update(readFileSync(FIL)).digest("hex").slice(0, 16);
console.log(`EFTER: ${efter.length} rader · ny sha256 ${efterHash} (före ${prefixHash})`);
console.log(`Italien: ${efter.filter(r => r.land === "Italien").map(r => r.ticker).join("·")}`);
console.log(`finans n=${efter.filter(r => r.bransch === "finans").length}`);
console.log(`syskonkoll — Kina: ${efter.filter(r => r.land === "Kina").length} · UK: ${efter.filter(r => r.land === "Storbritannien").length} (om syskon levererat under mitt fönster syns det här)`);
