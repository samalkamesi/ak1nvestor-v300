#!/usr/bin/env node
// _s2u3o32-append.mjs — s2-u3 (omg 32) EUROPA-UTILITIES ELE.MC + ENG.MC +
// VER.VI append till data/portfolj-system/bolagsunivers.json.
// Regler (omg29-u3/omg30/omg32-konventionerna): mutex via mkdir-lås; append
// på diskens FAKTISKA läge; prefix-bit-identiskt bevis + läs-tillbaka ×2;
// idempotent; aritmetikgrinden 48/48 GRÖN FÖRE detta skript (körd separat).
import { readFileSync, writeFileSync, mkdirSync, rmdirSync } from "node:fs";
import { createHash } from "node:crypto";

const FIL = "data/portfolj-system/bolagsunivers.json";
const LAS = "/tmp/ak1a-s2u3o32-append.lock";

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
if (före.some(r => r.ticker === "ELE.MC" || r.ticker === "ENG.MC" || r.ticker === "VER.VI")) {
  console.log("IDEMPOTENT: någon av raderna finns redan — inget skrivs.");
  process.exit(0);
}
if (före.length !== 319) {
  console.log(`FIL-LÄGE: ${före.length} rader (väntade 319) — syskon skrev under mig. AVBRYTER för omkörning av grunden.`);
  process.exit(4);
}
const prefixHash = createHash("sha256").update(rå).digest("hex").slice(0, 16);
console.log(`Före: ${före.length} rader · prefix-sha256 ${prefixHash}`);

const cagr = (s) => +(Math.pow(s[4] / s[0], 1 / 4) - 1).toFixed(4);

// ── källvägar (alla belastade av WebFetch 2026-09-29, close 2026-09-28 CET) ─
const URL = {
  ele: "https://stockanalysis.com/quote/bme/ELE/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
  eng: "https://stockanalysis.com/quote/bme/ENG/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
  ver: "https://stockanalysis.com/quote/vie/VER/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
};

const ele = {
  ticker: "ELE.MC",
  namn: "Endesa, S.A.",
  bransch: "nyttovalt",
  land: "Spanien",
  valuta: "EUR",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-29",
    url: URL.ele,
    paranoid: "BME-primärnotering (bme-vägen bar full panel — LSE-sondens motsats), S&P Global Market Intelligence-underlag, sidor pålästa 2026-09-29 med kurs close 2026-09-28 CET: pris 42,04 EUR/43,03 mdr EUR (aktier 1,02 mdr rondat — repliken 42,88 = 0,35 % avvikelse, källans mcap-fält bärs enligt EXC/NEE-precedensklassen); STATISTICS-panelen bär multiplarna: P/E 16,58 (aktiebasreplik 42,04÷2,54 = 16,55), P/B 4,67 = mcap/EK 43 030÷9 213 EXAKT medan källans BV/aktie-rad 7,96 divergerar (aktiebas 5,28) — ekvivalensbasen mcap/EK bär fältet; PEG 2,08; EV 54,85 mdr med BEVISAD identitet mcap+skuld−kassa+minoritet = 43 030+11 031−277+1 070 = 54 854 (minoritetsposten ingår i källans EV); EV/EBIT 13,83 (replik mot EBIT-marginal×rev = 13,94, 0,7 %); EV/EBITDA 9,28; EV/Sales 2,60; netto 12,43 % = 2 627÷21 126 TTM EXAKT; FCF-marginal 9,51 % = 2 010÷21 126 (financials-sidans eget TTM-fält; fcfYield 4,67 % = 2 010÷43 030 EXAKT — europautilitiens POSITIVA FCF mot de fem amerikanska systerskapens negativa, sektorns capex-cykel syns i kontrasten); brutto 42,69 % (TTM-enbart i källan ⇒ moat-fält null, ärligt); ROE 29,05 % / ROIC 12,33 % / WACC 6,32 %; skuld/EK 1,20 = 11 031÷9 213; räntetäckning 11,68× (cellens högsta — intjäningskraften efter 2022-toppskuldens avbetalning 18 575→10 444 M); Piotroski 4; utdelning 1,58 EUR (3,77 %) payout 52,49 %; aktieåterköp TTM 876 M EUR; prognosgap NEGATIVT (forward 17,78 > trailing 16,58, −6,75 %) ⇒ prognosTillväxt null enligt BUD-konventionen, källans 3-års EPS-prognos +4,86 %/år dokumenterad här; omsättningstillväxt TTM −1,29 % (källans financials-rad; quote-sidans −1,3 % samma tal); beta 0,56; 52-v 26,65–43,80 (+56,98 % på ett år — kursscenen bakom Sell-konsensus 35,71 EUR av 23 analytiker, kursen ovanför målet: värderingsnot, ej rekommendation); 8 924 anställda; nästa rapport 2026-10-28; branschfältet nyttovalt = källans Utilities/Regulated Electric-sektor; FY kalenderår",
  }],
  hamtat: "2026-09-29",
  pris: 42.04,
  marknadsKapitalMdr: 43.03,
  tillvaxt: {
    omsattningCAGR5ar: cagr([20527, 32545, 25070, 20935, 21031]),
    resultatCAGR5ar: cagr([1435, 2541, 742, 1888, 2198]),
    omsattningTillvaxtTTM: -0.0129,
    prognosTillvaxt: null,
  },
  lonksamhet: {
    roe: 0.2905, roic: 0.1233, bruttoMarginal: 0.4269, ebitMarginal: 0.1863,
    nettoMarginal: 0.1243, fcfMarginal: 0.0951,
  },
  stabilitet: {
    skuldEgenkapital: 1.2, rantaTackning: 11.68, fcfPositivaSenaste5: 4,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: {
    pe: 16.58, pb: 4.67, evEbit: 13.83, peg: 2.08, fcfYield: 0.0467,
    egenKapitalMultipl: 4.67,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [20527000000, 32545000000, 25070000000, 20935000000, 21031000000],
    resultat: [1435000000, 2541000000, 742000000, 1888000000, 2198000000],
    egetKapital: [5544000000, 5758000000, 7204000000, 9053000000, 9611000000],
    fcf: [539000000, -460000000, 2413000000, 1721000000, 2207000000],
  },
};

const eng = {
  ticker: "ENG.MC",
  namn: "Enagás, S.A.",
  bransch: "nyttovalt",
  land: "Spanien",
  valuta: "EUR",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-29",
    url: URL.eng,
    paranoid: "BME-primärnotering (bme-vägen bar full panel), S&P Global Market Intelligence-underlag, sidor pålästa 2026-09-29 med kurs close 2026-09-28 CET: pris 16,69 EUR/4,34 mdr EUR (aktier 260,30 M; replik 4,344 EXAKT); STATISTICS: P/E 15,11 (aktiebas 16,69÷1,10 = 15,17, 0,4 % — källfältet bärs), P/B 1,87 = mcap/EK 4 340÷2 322 (aktiebas mot BV/aktie 8,86 = 1,884, 0,8 %), PEG 3,23; EV 6,66 mdr med identiteten mcap+skuld−kassa+minoritet = 4 340+3 023−719,61+15,76 = 6 659 (minoritetsposten ingår); EV/EBIT 18,64 bär källans egna EBIT-fönster — repliken mot EBIT-marginal×rev ger 30,4 eftersom källans nämnare inkluderar andelsintäkter (Enagás latinamerikanska gas-andelar + EU-transmissionsfondportföljen; sales-equity-modellen) — källfältet bärs med fönstret dokumenterat; EV/EBITDA 11,03; bruttomarginal 93,65 % = universumets högsta klass (ren transportavgifts-TSO: avgifter utan varukostnad); EBIT 23,03 % / netto 30,46 % = 289,98÷952,15 EXAKT / FCF-marginal 3,29 % = 31,3÷952,15 (financials-TTM-fältet); fcfYield 0,72 % = 31,3÷4 340; ROE 12,69 % / ROIC 2,51 % MOT WACC 4,11 % (reglerad substansavsättning: bokförd ТВМ-avkastning under kapitalkostnad — källfältet speglas); skuld/EK 1,30 = 3 023÷2 322; räntetäckning 3,40×; Piotroski 4; utdelning 1,00 EUR (5,99 %) payout 89,73 % — FCF-payout 673 % (källans egen not: utdelningen bärs av balansräkningen, FCF TTM endast 31,3 M EUR); FY2024 FÖRLUSTÅR −299,31 M EUR (Goodwill-nedskrivning latinamerikanska portföljen + skatteengagemang) — resultat-CAGR −4,27 %/år med start/slut positiva (2021 403,83 → 2025 339,11), mellanårets förlust dokumenterad i serien; TTM-nettot +115,5 % (förluståret som bas); prognosgap NEGATIVT (forward 16,54 > trailing 15,11, −8,65 %) ⇒ prognosTillväxt null enligt BUD, källans 3-års EPS +3,39 %/år här; omsättningstillväxt TTM +3,44 % (källans financials-rad); beta 0,26 (cellens lägsta); 52-v 13,02–17,94; 1 408 anställda; Hold-konsensus 17,05 EUR av 4 analytiker; nästa rapport 2026-10-20 (estimerad); branschfältet nyttovalt = källans Utilities/Regulated Gas; FY kalenderår",
  }],
  hamtat: "2026-09-29",
  pris: 16.69,
  marknadsKapitalMdr: 4.34,
  tillvaxt: {
    omsattningCAGR5ar: cagr([975.69, 957.1, 907.57, 905.55, 960.4]),
    resultatCAGR5ar: cagr([403.83, 375.77, 342.53, -299.31, 339.11]),
    omsattningTillvaxtTTM: 0.0344,
    prognosTillvaxt: null,
  },
  lonksamhet: {
    roe: 0.1269, roic: 0.0251, bruttoMarginal: 0.9365, ebitMarginal: 0.2303,
    nettoMarginal: 0.3046, fcfMarginal: 0.0329,
  },
  stabilitet: {
    skuldEgenkapital: 1.3, rantaTackning: 3.4, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: {
    pe: 15.11, pb: 1.87, evEbit: 18.64, peg: 3.23, fcfYield: 0.0072,
    egenKapitalMultipl: 1.87,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [975690000, 957100000, 907570000, 905550000, 960400000],
    resultat: [403830000, 375770000, 342530000, -299310000, 339110000],
    egetKapital: [3102000000, 3218000000, 3000000000, 2392000000, 2317000000],
    fcf: [510080000, 635250000, 411870000, 357100000, 94420000],
  },
};

const ver = {
  ticker: "VER.VI",
  namn: "VERBUND AG",
  bransch: "nyttovalt",
  land: "Österrike",
  valuta: "EUR",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-29",
    url: URL.ver,
    paranoid: "Vienna-börsen (vie-vägen bar full panel), S&P Global Market Intelligence-underlag, sidor pålästa 2026-09-29 med kurs close 2026-09-28 CET: pris 64,65 EUR/22,46 mdr EUR (aktier 347,42 M; replik 22,461 EXAKT); STATISTICS: P/E 18,64 (aktiebas 64,65÷3,47 = 18,63 EXAKT; FY2025-EPS-replik 1 489÷347,42 = 4,286 mot källans 4,29, 0,1 %), P/B 2,13 = mcap/EK 22 460÷10 535 (total-EK inkl minoritet 866), PEG 28,83 (källfältet — närmast meaningless vid negativ prognos, dokumenterat); EV 26,52 mdr med identiteten mcap+skuld−kassa+minoritet = 22 460+3 279−88,3+865,79 = 26 516; EV/EBIT 14,35 (replik 15,07, 5 % — källans interna EBIT-bas, fältet bärs); EV/EBITDA 10,74; brutto 45,80 % (TTM-enbart ⇒ moat null); EBIT 23,19 % / netto 15,87 % = 1 205÷7 590 / FCF-marginal −0,06 % (financials-TTM-fältet; replik −4,17÷7 590 = −0,055) — TTM-capex 1 460 mot OCF 1 455: nollpunkten (fcfYield −0,02 %); fcfYield −0,0002; ROE 12,75 % / ROIC 8,23 % MOT WACC 4,11 → +3,3 pp (källan 4,95: ROIC-WACC +3,28 pp — vattenkraftens låga marginalkostnad); skuld/EK 0,31 = 3 279÷10 535 — cellens LÄGSTA belåning (de fem USA-systerna 1,6–1,8); räntetäckning 16,48×; Piotroski 4; utdelning 2,00 EUR (3,09 %) payout 107,55 % (TTM-nettots dalar mot utdelningen); prognosgap POSITIVT (forward 18,41 < trailing 18,64, +1,25 %) ⇒ prognosTillväxt = källans 3-års EPS-prognos −7,38 %/år — NEGATIVT värde bärs ärligt (elpris-normaliseringen efter 2022-toppåren: resultat 873,56→2 266→1 489, energikrisens engångsvinster tvättas ur); omsättningstillväxt TTM −9,66 % (samma normalisering); 2021→2025-omsättningen +13,82 %/år dock (4 787→8 033 — krisen + inflation + förvärv); FCF 5 år: −755,88 (2021), 928,63, 3 684, 2 111, 550,23 — 2023-toppens marginal 35,19 % mot TTM:s nollpunkt = vattenkraftens prisberoende i en serie; beta 0,19; 52-v 54,25–70,20; 4 537 anställda; Sell-konsensus 60,39 EUR av 14 analytiker (kursen över målet — värderingsnot, ej rekommendation); nästa rapport 2026-11-05; branschfältet nyttovalt = källans Utilities/Renewable (vattenkraft — Europas största producent); FY kalenderår; land Österrike NYTT i universumet (24:e landet)",
  }],
  hamtat: "2026-09-29",
  pris: 64.65,
  marknadsKapitalMdr: 22.46,
  tillvaxt: {
    omsattningCAGR5ar: cagr([4787, 10357, 10471, 8258, 8033]),
    resultatCAGR5ar: cagr([873.56, 1717, 2266, 1875, 1489]),
    omsattningTillvaxtTTM: -0.0966,
    prognosTillvaxt: -0.0738,
  },
  lonksamhet: {
    roe: 0.1275, roic: 0.0823, bruttoMarginal: 0.458, ebitMarginal: 0.2319,
    nettoMarginal: 0.1587, fcfMarginal: -0.0006,
  },
  stabilitet: {
    skuldEgenkapital: 0.31, rantaTackning: 16.48, fcfPositivaSenaste5: 4,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: {
    pe: 18.64, pb: 2.13, evEbit: 14.35, peg: 28.83, fcfYield: -0.0002,
    egenKapitalMultipl: 2.13,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [4787000000, 10357000000, 10471000000, 8258000000, 8033000000],
    resultat: [873560000, 1717000000, 2266000000, 1875000000, 1489000000],
    egetKapital: [6363000000, 8323000000, 11221000000, 11065000000, 11331000000],
    fcf: [-755880000, 928630000, 3684000000, 2111000000, 550230000],
  },
};

// ── fältverifiering (kontraktets nyckelfält) ────────────────────────────────
const validera = (r, id) => {
  const krav = ["ticker", "namn", "bransch", "land", "valuta", "hamtat", "pris", "marknadsKapitalMdr"];
  for (const k of krav) if (r[k] === undefined) throw new Error(`${id}: ${k} saknas`);
  for (const k of ["omsattningCAGR5ar", "resultatCAGR5ar", "omsattningTillvaxtTTM"]) if (typeof r.tillvaxt[k] !== "number") throw new Error(`${id}: tillvaxt.${k}`);
  for (const k of ["roe", "roic", "bruttoMarginal", "ebitMarginal", "nettoMarginal", "fcfMarginal"]) if (typeof r.lonksamhet[k] !== "number") throw new Error(`${id}: lonksamhet.${k}`);
  for (const k of ["skuldEgenkapital", "rantaTackning"]) if (typeof r.stabilitet[k] !== "number") throw new Error(`${id}: stabilitet.${k}`);
  for (const k of ["pe", "pb", "evEbit", "peg", "fcfYield", "egenKapitalMultipl"]) if (typeof r.vardering[k] !== "number") throw new Error(`${id}: vardering.${k}`);
  for (const k of ["ar", "omsattning", "resultat", "egetKapital", "fcf"]) if (r.serier[k].length !== 5) throw new Error(`${id}: serier.${k} ≠ 5`);
  if (r.golv.typ !== "osatt") throw new Error(`${id}: golv.typ`);
};
validera(ele, "ELE"); validera(eng, "ENG"); validera(ver, "VER");

// ── syskonintegritet FÖRE (prefix-bevis: allt utom mina rader byte-identiskt) ─
const efter = [...före, ele, eng, ver];
const syskonFöre = JSON.stringify(före);
const efterUtanMina = JSON.stringify(efter.slice(0, före.length));
if (syskonFöre !== efterUtanMina) throw new Error("prefix-integritet bruten FÖRE skrivning (internt)");

const ut = JSON.stringify(efter, null, 2) + "\n";
writeFileSync(FIL, ut);
console.log(`Skrev ${efter.length} rader (${före.length}+3).`);

// ── läs-tillbaka ×2 + prefix-bevis ──────────────────────────────────────────
const lb1 = JSON.parse(readFileSync(FIL, "utf8"));
const lb2 = JSON.parse(readFileSync(FIL, "utf8"));
if (lb1.length !== 322 || lb2.length !== 322) throw new Error("läs-tillbaka: fel radantal");
if (JSON.stringify(lb1) !== JSON.stringify(lb2)) throw new Error("läs-tillbaka ×2 divergerar");
const nyText = readFileSync(FIL, "utf8");
if (!nyText.startsWith(rå)) {
  // JSON.stringify kan omformatera — verifiera istället rad-vis att alla gamla rader är kvar identiska i värde
  const gamlaKvar = före.every(r => lb1.find(x => JSON.stringify(x) === JSON.stringify(r)));
  if (!gamlaKvar) throw new Error("prefix-integritet: gammal rad försvann/ändrades");
  console.log("Not: filen omformaterad vid skrivning — samtliga 319 gamla rader värde-identiska verifierade.");
} else {
  console.log(`Prefix-bevis: första ${rå.length} byten bit-identiska (sha ${prefixHash}).`);
}
const mine = lb1.filter(r => ["ELE.MC", "ENG.MC", "VER.VI"].includes(r.ticker));
if (mine.length !== 3) throw new Error("mina tre rader finns ej efter skrivning");
console.log(`Mina rader: ${mine.map(r => `${r.ticker} ${r.bransch}/${r.land}`).join(", ")}`);
console.log(`Slutläge: ${lb1.length} rader · nyttovalt ${lb1.filter(r => r.bransch === "nyttovalt").length} bolag.`);
console.log("APPEND KLAR.");
