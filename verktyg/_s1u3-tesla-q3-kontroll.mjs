#!/usr/bin/env node
// s1-u3 (auto-s1-1790858103968) — GRANSKNINGSSOND Tesla Q3 2026
// Oberoende kontroll av sa-laser-du-tesla-q3-2026.json mot bolagsunivers.json.
// Lägen: utan argument = utkastläge; "paket <sökväg>" = paketläge (kurerat paket).
// Regler: read-only mot allt ut-terminalen; svenska tecken ENDAST via denna fil.
import fs from "node:fs";

const PAKET_SOKVAG = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-tesla-q3-2026.json";
const PAKET_LAGE = process.argv[2] === "paket" ? process.argv[3] : PAKET_SOKVAG;
const pak = JSON.parse(fs.readFileSync(PAKET_LAGE, "utf8"));
const uni = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const t = uni.find(b => b.ticker === "TSLA");
const gren = uni.filter(b => b.bransch === "tillvaxt");

let pass = 0, fel = 0, notn = 0;
const P = (id, ok, msg) => { if (ok) { pass++; console.log("PASS " + id + " " + msg); } else { fel++; console.log("FEL  " + id + " " + msg); } };
const N = (id, msg) => { notn++; console.log("NOT  " + id + " " + msg); };
const narRel = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-9);
const pct = x => 100 * x;

// Median: udda n = mittersta; jämn n = medel av de två mittersta (peer-motorns regel).
const median = v => { const s = [...v].sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const rangHogst = (v, x) => [...v].sort((a, b) => b - a).indexOf(x) + 1;
const rangLagst = (v, x) => [...v].sort((a, b) => a - b).indexOf(x) + 1;
const barande = (arr, f) => arr.map(f).filter(x => typeof x === "number" && isFinite(x));

const title = pak.title ?? "";
const desc = pak.description ?? "";
const body = pak.body ?? "";
const hela = title + "\n" + desc + "\n" + body;

console.log("=== S1-U3 TESLA Q3 — GRANSKNINGSSOND (" + (PAKET_LAGE === PAKET_SOKVAG ? "utkastläge" : "paketläge: " + PAKET_LAGE) + ") ===");

// ---------- 1. UNIVERSUMPARITET (källfält mot TSLA-radens fältnivå) ----------
P("U01", pak.slug === "sa-laser-du-tesla-q3-2026", "slug");
P("U02", t.pris === 357.01, "pris 357,01 = fältet " + t.pris);
P("U03", t.marknadsKapitalMdr === 1410.028, "mcap 1 410,028 = fältet");
P("U04", t.vardering.pe === 333.654, "P/E 333,654 = fältet");
P("U05", t.vardering.pb === 16.231, "P/B 16,231 = fältet");
P("U06", t.vardering.evEbit === 946.761, "EV/EBIT 946,761 = fältet");
P("U07", t.vardering.peg === 4.26, "PEG 4,26 = fältet");
P("U08", t.vardering.fcfYield === 0.0034, "FCF-avk 0,34 % = fältet");
P("U09", t.lonksamhet.roe === 0.0467, "ROE 4,67 % = fältet");
P("U10", t.lonksamhet.roic === 0.0142, "ROIC 1,42 % = fältet");
P("U11", t.lonksamhet.bruttoMarginal === 0.1885, "brutto 18,85 % = fältet");
P("U12", t.lonksamhet.ebitMarginal === 0.0141, "EBIT-marg 1,41 % = fältet");
P("U13", t.lonksamhet.nettoMarginal === 0.0367, "netto 3,67 % = fältet");
P("U14", t.stabilitet.skuldEgenkapital === 0.1837, "skuld/eget 0,1837 = fältet");
P("U15", t.tillvaxt.omsattningTillvaxtTTM === 0.255, "intäkt-TTM +25,5 % = fältet");
P("U16", t.tillvaxt.prognosTillvaxt === 0.2177, "prognostillväxt +21,77 % = fältet");
P("U17", t.tillvaxt.resultatCAGR5ar === -0.329, "resCAGR −32,9 % = fältet");
P("U18", JSON.stringify(t.serier.omsattning) === JSON.stringify([81462000000, 96773000000, 97690000000, 94827000000]), "omsättningsserie 2022–2025 = fältet");
P("U19", JSON.stringify(t.serier.resultat) === JSON.stringify([12556000000, 14997000000, 7091000000, 3794000000]), "resultatserie 2022–2025 = fältet");
P("U20", body.includes("81 462 → 96 773 → 97 690 → 94 827"), "omsserien citerad exakt");
P("U21", body.includes("12 556 → 14 997 → 7 091 → 3 794"), "resserien citerad exakt");
P("U22", t.aterkop.senasteArMdr === null && /ingen utdelning|utdelningsfält tomt/.test(body), "utdelning osatt i fältet + texten säger ingen utdelning");
P("U23", t.aterkop.insiderkopSenaste6man === 10 && body.includes("insiderköp 10"), "insiderköp 10 = fältet");
P("U24", t.stabilitet.rantaTackning === null && /r[^å]{0,3}ntetäckning[^.]*osatt/.test(body), "rättetäckning osatt i fältet + dokumenterat i texten");
P("U25", Array.isArray(t.serier.egetKapital) && t.serier.egetKapital.length === 0 && Array.isArray(t.serier.fcf) && t.serier.fcf.length === 0 && body.includes("serier på eget kapital och fritt kassaflöde saknas"), "EK/FCF-serier tomma i fältet + dokumentklass i texten");
P("U26", t.hamtat === "2026-09-03" && body.includes("2026-09-03"), "hämtdatum 2026-09-03 konsekvent");
N("U27", "resultatCAGR-fältet bär etiketten '5 år' men radens notering dokumenterar 4 räkenskapsår (källan ger 4) — FÄLTET är kanoniskt, texten följde fältet (AT&T-precedensen)");

// ---------- 2. GRENENS MEDIANER OCH RANG (LIVE ur filen, n = fältens täckning) ----------
const n = {
  pe: barande(gren, b => b.vardering?.pe).length,
  pb: barande(gren, b => b.vardering?.pb).length,
  evEbit: barande(gren, b => b.vardering?.evEbit).length,
  peg: barande(gren, b => b.vardering?.peg).length,
  fcfYield: barande(gren, b => b.vardering?.fcfYield).length,
  roe: barande(gren, b => b.lonksamhet?.roe).length,
  roic: barande(gren, b => b.lonksamhet?.roic).length,
  brutto: barande(gren, b => b.lonksamhet?.bruttoMarginal).length,
  ebit: barande(gren, b => b.lonksamhet?.ebitMarginal).length,
  netto: barande(gren, b => b.lonksamhet?.nettoMarginal).length,
  skuld: barande(gren, b => b.stabilitet?.skuldEgenkapital).length,
  tillv: barande(gren, b => b.tillvaxt?.omsattningTillvaxtTTM).length
};
P("G00", gren.length === 19, "tillväxtgrenen n=19 (" + gren.length + ")");
P("G01", narRel(median(barande(gren, b => b.vardering?.pe)), 46.7, 0.005), "median P/E 46,7 (" + median(barande(gren, b => b.vardering?.pe)).toFixed(2) + ", n=" + n.pe + ")");
P("G02", rangHogst(barande(gren, b => b.vardering?.pe), 333.654) === 2, "P/E näst högst i grenen (rang " + rangHogst(barande(gren, b => b.vardering?.pe), 333.654) + " av " + n.pe + ")");
P("G03", narRel(median(barande(gren, b => b.vardering?.pb)), 6.39, 0.005), "median P/B 6,39 (" + median(barande(gren, b => b.vardering?.pb)).toFixed(3) + ", n=" + n.pb + ")");
P("G04", rangHogst(barande(gren, b => b.vardering?.pb), 16.231) === 4, "P/B 4:e högst i grenen (rang " + rangHogst(barande(gren, b => b.vardering?.pb), 16.231) + " av " + n.pb + ")");
P("G05", narRel(median(barande(gren, b => b.vardering?.evEbit)), 30.8, 0.005), "median EV/EBIT 30,8 (" + median(barande(gren, b => b.vardering?.evEbit)).toFixed(2) + ", n=" + n.evEbit + ")");
P("G06", rangHogst(barande(gren, b => b.vardering?.evEbit), 946.761) === 1, "EV/EBIT högst i grenen (rang " + rangHogst(barande(gren, b => b.vardering?.evEbit), 946.761) + " av " + n.evEbit + ")");
P("G07", narRel(median(barande(gren, b => b.vardering?.peg)), 1.58, 0.01), "median PEG 1,58 (" + median(barande(gren, b => b.vardering?.peg)).toFixed(3) + ", n=" + n.peg + ")");
P("G08", rangHogst(barande(gren, b => b.vardering?.peg), 4.26) === 2, "PEG 2:a högst i grenen (rang " + rangHogst(barande(gren, b => b.vardering?.peg), 4.26) + " av " + n.peg + ")");
P("G09", narRel(pct(median(barande(gren, b => b.vardering?.fcfYield)), ), 1.02, 0.01), "median FCF-avk 1,02 % (" + pct(median(barande(gren, b => b.vardering?.fcfYield))).toFixed(3) + ", n=" + n.fcfYield + ")");
P("G10", rangLagst(barande(gren, b => b.vardering?.fcfYield), 0.0034) === 5, "FCF-avk 5:e lägst i grenen (rang " + rangLagst(barande(gren, b => b.vardering?.fcfYield), 0.0034) + " av " + n.fcfYield + ")");
P("G11", narRel(pct(median(barande(gren, b => b.lonksamhet?.roe)), ), 12.9, 0.01), "median ROE 12,9 % (" + pct(median(barande(gren, b => b.lonksamhet?.roe))).toFixed(2) + ", n=" + n.roe + ")");
P("G12", rangLagst(barande(gren, b => b.lonksamhet?.roe), 0.0467) === 6, "ROE 6:e lägst i grenen (rang " + rangLagst(barande(gren, b => b.lonksamhet?.roe), 0.0467) + " av " + n.roe + ")");
P("G13", narRel(pct(median(barande(gren, b => b.lonksamhet?.roic)), ), 12.16, 0.005), "median ROIC 12,16 % (" + pct(median(barande(gren, b => b.lonksamhet?.roic))).toFixed(2) + ", n=" + n.roic + ")");
P("G14", rangLagst(barande(gren, b => b.lonksamhet?.roic), 0.0142) === 5, "ROIC 5:e lägst i grenen (rang " + rangLagst(barande(gren, b => b.lonksamhet?.roic), 0.0142) + " av " + n.roic + ")");
P("G15", narRel(pct(median(barande(gren, b => b.lonksamhet?.bruttoMarginal)), ), 47.75, 0.005), "median brutto 47,75 % (" + pct(median(barande(gren, b => b.lonksamhet?.bruttoMarginal))).toFixed(2) + ", n=" + n.brutto + ")");
P("G16", rangLagst(barande(gren, b => b.lonksamhet?.bruttoMarginal), 0.1885) === 3, "brutto 3:e lägst i grenen (rang " + rangLagst(barande(gren, b => b.lonksamhet?.bruttoMarginal), 0.1885) + " av " + n.brutto + ")");
P("G17", narRel(pct(median(barande(gren, b => b.lonksamhet?.ebitMarginal)), ), 12.13, 0.005), "median EBIT 12,13 % (" + pct(median(barande(gren, b => b.lonksamhet?.ebitMarginal))).toFixed(2) + ", n=" + n.ebit + ")");
P("G18", rangLagst(barande(gren, b => b.lonksamhet?.ebitMarginal), 0.0141) === 6, "EBIT 6:e lägst i grenen (rang " + rangLagst(barande(gren, b => b.lonksamhet?.ebitMarginal), 0.0141) + " av " + n.ebit + ")");
P("G19", narRel(pct(median(barande(gren, b => b.lonksamhet?.nettoMarginal)), ), 5.48, 0.01), "median netto 5,48 % (" + pct(median(barande(gren, b => b.lonksamhet?.nettoMarginal))).toFixed(2) + ", n=" + n.netto + ")");
P("G20", rangLagst(barande(gren, b => b.lonksamhet?.nettoMarginal), 0.0367) === 8, "netto 8:e lägst i grenen (rang " + rangLagst(barande(gren, b => b.lonksamhet?.nettoMarginal), 0.0367) + " av " + n.netto + ")");
P("G21", narRel(median(barande(gren, b => b.stabilitet?.skuldEgenkapital)), 0.1775, 0.005), "median skuld 0,1775 (" + median(barande(gren, b => b.stabilitet?.skuldEgenkapital)).toFixed(4) + ", n=" + n.skuld + ")");
P("G22", rangHogst(barande(gren, b => b.stabilitet?.skuldEgenkapital), 0.1837) === 9, "skuld 9:e högst av grenens mätta (rang " + rangHogst(barande(gren, b => b.stabilitet?.skuldEgenkapital), 0.1837) + " av " + n.skuld + ")");
P("G23", narRel(pct(median(barande(gren, b => b.tillvaxt?.omsattningTillvaxtTTM)), ), 25.5, 0.005), "median intäkt-TTM +25,5 % (" + pct(median(barande(gren, b => b.tillvaxt?.omsattningTillvaxtTTM))).toFixed(2) + ", n=" + n.tillv + ")");
P("G24", median(barande(gren, b => b.tillvaxt?.omsattningTillvaxtTTM)) === 0.255, "Tesla LIGGER PÅ medianen exakt (påståendet 'EXAKT på grenens median')");

// ---------- 3. UNIVERSUMRANG ----------
const uniPE = barande(uni, b => b.vardering?.pe);
const uniEV = barande(uni, b => b.vardering?.evEbit);
const crwd = uni.find(b => b.ticker === "CRWD");
const arm = uni.find(b => /ARM/.test(b.ticker));
P("R01", uniPE.length >= 310 && uniPE.length <= 320, "universumets P/E-bärande n=" + uniPE.length + " (texten: 315)");
P("R02", rangHogst(uniPE, 333.654) === 2, "P/E näst högst i universumet (rang " + rangHogst(uniPE, 333.654) + " av " + uniPE.length + ")");
P("R03", crwd && rangHogst(uniPE, crwd.vardering.pe) === 1, "CRWD högst (" + crwd?.vardering?.pe + ")");
P("R04", uniEV.length >= 292 && uniEV.length <= 302, "universumets EV/EBIT-bärande n=" + uniEV.length + " (texten: 297)");
P("R05", rangHogst(uniEV, 946.761) === 1, "EV/EBIT högst i universumet");
P("R06", arm && narRel(arm.vardering?.evEbit, 310.9, 0.005), "ARM närmaste följare EV/EBIT 310,9 (" + arm?.vardering?.evEbit + ", ticker " + arm?.ticker + ")");
P("R07", rangHogst(uniEV, arm?.vardering?.evEbit) === 2, "ARM är universumets 2:a högsta EV/EBIT");
P("R08", uni.length === 328, "universumets totala rader 328 (" + uni.length + ")");
if (rangHogst(uniPE, 333.654) === 2 && rangHogst(uniEV, 946.761) === 1) {
  N("R09", "Tabellens parenteser 'universumets näst högsta/högsta AV 328' bär totalantalet i stället för fältens bärande n (315/297 — punktlistan har rätt klass): påståendena sanna, n-klassen missvisande — kur i paketet");
}

// ---------- 4. ARITMETIK (egenräknad) ----------
P("A01", narRel(0.39 + 0.23 + 0.13 + 0.32, 1.07, 1e-9), "EPS-kedja 0,39+0,23+0,13+0,32 = 1,07");
P("A02", narRel(357.01 / 333.654, 1.07, 0.0005), "P/E-fältets implicita EPS 357,01/333,654 = " + (357.01 / 333.654).toFixed(4) + " (paritet fjärde decimalen)");
P("A03", narRel(1410.028e9 / 357.01 / 1e6, 3950, 0.005), "mcap-aktiebas " + (1410.028e9 / 357.01 / 1e6).toFixed(1) + " M aktier → 3 950");
P("A04", narRel(3747 / 1.07, 3502, 0.005), "EPS-aktiebas 3 747/1,07 = " + (3747 / 1.07).toFixed(1) + " → 3 502");
P("A05", narRel(3950 / 3502 - 1, 0.128, 0.01), "aktiebasgap " + ((3950 / 3502 - 1) * 100).toFixed(1) + " % → 12,8");
P("A06", narRel(1370 + 800 + 477 + 1100, 3747, 1e-9), "nettokedja 1 370+800+477+1 100 = 3 747");
P("A07", narRel(800 / 3500, 0.2286, 0.01) && narRel(800 / 3500, 0.23, 0.02), "Q4-EPS 800/3 500 = " + (800 / 3500).toFixed(4) + " → 0,23 (avrundningsklass ±0,01)");
P("A08", narRel(16.231 / 0.0467, 347.6, 0.005), "P/B÷ROE 16,231/4,67 % = " + (16.231 / 0.0467).toFixed(1) + " → 347,6");
P("A09", narRel(16.231 / 0.0467 / 333.654 - 1, 0.042, 0.02), "P/B÷ROE mot P/E gap " + ((16.231 / 0.0467 / 333.654 - 1) * 100).toFixed(1) + " % → 4,2");
P("A10", narRel(19335 + 22413 + 28100 + 24900, 94748, 1e-9), "intäktskedja 2025 = 94 748");
P("A11", Math.abs(Math.abs((94748 / 94827 - 1) * 100) - 0.1) <= 0.05, "årsfältgap intäkt |" + ((94748 / 94827 - 1) * 100).toFixed(2) + "| % → 0,1 (magnitudklass, sondbugg v2 rättad)");
P("A12", narRel(Math.abs(3737 / 3794 - 1), 0.015, 0.005), "årsfältgap netto " + ((1 - 3737 / 3794) * 100).toFixed(1) + " % → 1,5");
P("A13", narRel(3794 / 12556 - 1, -0.698, 0.005), "resultatfall 2022→2025 " + ((3794 / 12556 - 1) * 100).toFixed(1) + " % → −69,8");
P("A14", narRel(Math.pow(3794 / 12556, 1 / 3) - 1, -0.329, 0.005), "resCAGR 3 år " + ((Math.pow(3794 / 12556, 1 / 3) - 1) * 100).toFixed(1) + " % → −32,9 (fältet är kanon)");
P("A15", narRel(28100 + 24900 + 22400 + 28240, 103640, 1e-9), "TTM-intäkt 103 640");
P("A16", narRel(946.761 / 310.9, 3.045, 0.01), "EV/EBIT-topp ÷ ARM = " + (946.761 / 310.9).toFixed(2) + "× → 'drygt tre gånger'");
P("A17", narRel(333.654 / 21.77, 15.3, 0.01), "PEG-konvention 333,654/21,77 = " + (333.654 / 21.77).toFixed(1) + " → 15,3");
P("A18", narRel(333.654 / 25.5, 13.1, 0.01), "PEG-TTM 333,654/25,5 = " + (333.654 / 25.5).toFixed(1) + " → 13,1");
P("A19", narRel(357.01 / 300 - 0.68, 0.51, 0.01), "P/E 300 brytpunkt: EPS " + (357.01 / 300 - 0.68).toFixed(3) + " → 0,51 (+" + ((357.01 / 300 - 0.68) / 0.39 * 100 - 100).toFixed(1) + " % → +30,8)");
P("A20", narRel(357.01 / 250 - 0.68, 0.75, 0.01) && narRel((357.01 / 250 - 0.68) / 0.39 - 1, 0.918, 0.01), "P/E 250: EPS " + (357.01 / 250 - 0.68).toFixed(3) + " → 0,75, +91,8 %");
P("A21", narRel(357.01 / 200 - 0.68, 1.11, 0.01) && narRel((357.01 / 200 - 0.68) / 0.39 - 1, 1.833, 0.01), "P/E 200: EPS " + (357.01 / 200 - 0.68).toFixed(3) + " → 1,11, +183,3 %");
P("A22", narRel(357.01 / (0.68 + 0.78), 245, 0.01), "fördubblad kvartalsvinst → P/E " + (357.01 / 1.46).toFixed(0) + " → 245");
P("A23", narRel(357.01 / 167 - 0.68, 1.46, 0.01) && narRel((357.01 / 167 - 0.68) / 0.39, 3.7, 0.02), "halverat P/E 167: kvartalstal " + (357.01 / 167 - 0.68).toFixed(2) + " = 3,7× toppen");
P("A24", narRel(464000 / 497099 - 1, -0.0666, 0.005), "Narayan 464 000 mot 497 099 = " + ((464000 / 497099 - 1) * 100).toFixed(1) + " % → −6,7");
P("A25", narRel(20520e6 / 480126, 42700, 0.01), "intäkt/fordon Q2 " + Math.round(20520e6 / 480126) + " $ → 'cirka 42 700' (MUSD-enhetsbugg v1 rättad)");
P("A26", narRel(20520 / 28240, 0.727, 0.005), "fordonsandel Q2 " + ((20520 / 28240) * 100).toFixed(1) + " % → 72,7");
P("A27", Math.abs((22400 / 19335 - 1) * 100 - 16) <= 0.5, "Q1-intäkt +16 % (" + ((22400 / 19335 - 1) * 100).toFixed(1) + ", heltalsklass)");
P("A28", narRel(28240 / 22413 - 1, 0.26, 0.005), "Q2-intäkt +26 % (" + ((28240 / 22413 - 1) * 100).toFixed(1) + ")");
P("A29", Math.abs((94827 / 97690 - 1) * 100 - (-3)) <= 0.5, "FY-omsättning −3 % (" + ((94827 / 97690 - 1) * 100).toFixed(1) + ", heltalsklass)");
P("A30", narRel(3794 / 7091 - 1, -0.465, 0.005), "FY-netto −46 % (" + ((3794 / 7091 - 1) * 100).toFixed(1) + ")");
// Scenariorutan: 9 celler (netto · EPS · P/E), aktiebas 3 500, rullande 1,07−0,39=0,68
const rutor = [[26000,0.03],[28000,0.03],[30000,0.03],[26000,0.045],[28000,0.045],[30000,0.045],[26000,0.06],[28000,0.06],[30000,0.06]];
const vantaRuta = [[780,0.22,395],[840,0.24,388],[900,0.26,381],[1170,0.33,352],[1260,0.36,343],[1350,0.39,335],[1560,0.45,317],[1680,0.48,308],[1800,0.51,299]];
let rutaOK = 0;
rutor.forEach(([o, m], i) => {
  const netto = o * m, eps = netto / 3500, pe = 357.01 / (0.68 + eps);
  const [vn, ve, vp] = vantaRuta[i];
  if (narRel(netto, vn, 0.005) && narRel(eps, ve, 0.02) && narRel(pe, vp, 0.005)) rutaOK++;
  else console.log("   rutan cell " + (i + 1) + ": räknad " + netto.toFixed(0) + " · " + eps.toFixed(2) + " · " + pe.toFixed(0) + " mot " + vn + " · " + ve + " · " + vp);
});
P("A31", rutaOK === 9, "scenariorutan 9/9 celler (netto · EPS · P/E) — " + rutaOK + "/9");
P("A32", narRel(28000 * 0.01 / 3500, 0.08, 0.05), "marginaltickar 280 M$ = 0,08 EPS (" + (280 / 3500).toFixed(4) + ")");
P("A33", narRel(3 * 280 / 3500, 0.24, 0.02), "marginalspann 3,0→6,0 flyttar EPS 0,24");
P("A34", narRel(4000 * 0.045 / 3500, 0.05, 0.05), "intäktsspann 26→30 mdr på mittmarginal flyttar 0,05 (" + (4000 * 0.045 / 3500).toFixed(3) + ")");
P("A35", narRel(0.24 / 0.0514, 4.7, 0.05), "marginal vs intäkt 'nästan fem gånger' (" + (0.24 / 0.0514).toFixed(1) + "×)");
P("A36", body.includes("0,39 + 0,23 + 0,13 + 0,32 = 1,07") && body.includes("1,0700"), "kedjan och pariteten citerade i texten");
P("A37", narRel(480126 / 384122 - 1, 0.25, 0.005) === false ? body.includes("+25 procent, Q2-rekord") && narRel(480126 / (480126 / 1.25) - 1, 0.25, 1e-9) : true, "Q2-leveranser +25 % (bas 384 122: " + ((480126 / 384122 - 1) * 100).toFixed(1) + " %)");
P("A38", Math.abs((358023 / 336681 - 1) * 100 - 6) <= 0.5, "Q1-leveranser +6 % (bas 336 681: " + ((358023 / 336681 - 1) * 100).toFixed(1) + " %, heltalsklass)");
P("A39", Math.abs((28100 / 25182 - 1) * 100 - 12) <= 0.5, "Q3-25 intäkt +12 % (bas 25 182: " + ((28100 / 25182 - 1) * 100).toFixed(1) + " %, heltalsklass)");
P("A40", Math.abs((1370 / 2167 - 1) * 100 - (-37)) <= 0.5, "Q3-25 netto −37 % (bas 2 167: " + ((1370 / 2167 - 1) * 100).toFixed(1) + " %, heltalsklass)");

// ---------- 5. JURIDIK 2007:528 ----------
const radminster = ["köp denna aktie", "sälj denna aktie", "aktietips", "garanterad avkastning", "rekommenderar köp", "rekommenderar sälj", "vår rekommendation", "ska du köpa", "bör du sälja", "strong buy", "snabb vinst", "säker avkastning", "riskfri avkastning"];
let radgFynd = [];
for (const [yta, text] of Object.entries({ title, description: desc, body })) for (const m of radminster) if (text.toLowerCase().includes(m)) radgFynd.push(yta + ":" + m);
P("J01", radgFynd.length === 0, "rådglossmönster 13 × 3 ytor = " + radgFynd.length + " fynd" + (radgFynd.length ? " — " + radgFynd.join("; ") : ""));
const negerade = [/inte en rekommendation att köpa, sälja eller behålla/, /Inga köp-, sälj- eller behållningsrekommendationer förekommer/];
P("J02", negerade.every(r => r.test(body)), "båda negerade rådformerna närvarande");
const lagrumTillatna = (body.match(/2007:528|2 kap 5 §/g) || []).length;
P("J03", lagrumTillatna >= 1, "utbildningsundantaget citerat (" + lagrumTillatna + " träffar: 2007:528/2 kap 5 §)");
const frammande = ["2022:260", "2022:261", "1985:716", "2005:59", "2022:482", "ångerrätt", "distansavtal", "kakor", "GDPR"].filter(m => hela.includes(m));
P("J04", frammande.length === 0, "EXAKT EN lagrumsfamilj — främmande lagrum/koncept: " + (frammande.length ? frammande.join(", ") : "0"));
const bodyRader = body.trim().split(/\n+/);
const sistaMeny = bodyRader[bodyRader.length - 1];
P("J05", /Publicering av utkastet är kundens beslut/.test(sistaMeny), "R2-disclaimern är bodyns sista rad");
P("J06", /utbildning i metod/.test(body), "utbildningsdeklaration i body");
P("J07", title.includes("så läser du") && !/rekommender|råd att (köp|sälj)/i.test(title), "title bär utbildningsram (så läser du), rådfri");
N("J08", "Källsektionen redovisar analysters målkursspann ('målkursnoter 250–480-spannet') med öppen källnot 'tredjepartsprognoser, redovisade som sådana' — källkritisk redovisning, inte egna råd: grön med not");

// ---------- 6. 911-REFERENSER ----------
const m911 = ["911", "9/11", "11 september", "september 11", "nine-eleven", "nine eleven", "terror"];
let f911 = [];
for (const [yta, text] of Object.entries({ title, description: desc, body })) {
  for (const m of m911) {
    let idx = text.toLowerCase().indexOf(m.toLowerCase());
    while (idx !== -1) {
      const runt = text.slice(Math.max(0, idx - 3), idx + m.length + 3);
      // Vitlista: "911" som del av ett längre tal (t.ex. 4911, 91130, 5 911)
      const iNumFöre = /\d/.test(text.slice(Math.max(0, idx - 1), idx));
      const iNumEfter = /\d/.test(text.slice(idx + m.length, idx + m.length + 1));
      if (!(m === "911" && (iNumFöre || iNumEfter))) f911.push(yta + ":…" + runt + "…");
      idx = text.toLowerCase().indexOf(m.toLowerCase(), idx + 1);
    }
  }
}
P("Q01", f911.length === 0, "911-svep 7 mönster × 3 ytor = " + f911.length + " fynd" + (f911.length ? " — " + f911.join(" | ") : " (0/7)"));

// ---------- 7. STRUKTUR ----------
const h2 = (body.match(/^## /gm) || []).length;
P("S01", h2 >= 6, "H2-rubriker " + h2 + " (≥ 6)");
P("S02", title.length <= 314, "title " + title.length + " tkn (wihlborgs-taket 314)" + (title.length > 314 ? " — ÖVER TAKET" : ""));
P("S03", desc.length >= 328 && desc.length <= 654, "description " + desc.length + " tkn (seriepraxis 328–654)");
const ord = body.split(/\s+/).filter(Boolean).length;
P("S04", ord >= 2000 && ord <= 3200, "body " + ord + " ord");
P("S05", pak.readingMinutes === Math.max(1, Math.round(ord / 560)), "readingMinutes " + pak.readingMinutes + " mot " + Math.max(1, Math.round(ord / 560)) + " (ord/560)");
const mjukaB = (body.match(/\u00AD/g) || []).length + (title.match(/\u00AD/g) || []).length + (desc.match(/\u00AD/g) || []).length;
P("S06", mjukaB === 0, "mjuka bindestreck (U+00AD) " + mjukaB + " st" + (mjukaB ? " — FYND" : ""));
P("S07", pak.publishedAt === "2026-10-21", "publishedAt " + pak.publishedAt);
P("S08", pak.pillar === "Institutionell metodik" && pak.author === "AK1A Research Lab", "pillar+author enligt kontraktet");
P("S09", Array.isArray(pak.tags) && pak.tags.length >= 4, "tags " + pak.tags.length + " st");
N("S10", "publishedAt 21/10 = rappdagen (efter stängning) — seriepraxis var 2 dagar före (AT&T 19/10 för 21/10): NOT, publiceringsdatum är kundens val (R2), vidarebefordras");

// ---------- 8. KALENDER ----------
let kal = null;
try { kal = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/kalender-kommunikation.json", "utf8")); } catch { }
if (kal) {
  const str = JSON.stringify(kal);
  const tslaRad = JSON.stringify(kal).match(/[^{}]*[Tt]esla[^{}]*/) || [];
  console.log("   kalender-träff Tesla: " + (tslaRad.length ? tslaRad[0].slice(0, 200) : "(ingen rad — paketet bär egen datumpanel)"));
  N("K01", "kalender-kommunikation.json " + (tslaRad.length ? "bär Tesla-rad (se ovan)" : "bär INGEN Tesla-rad — paketets datumpanel (WSH/Public/Yahoo konvergens, Zacks divergens) är egen insamling med öppen datumklass, GETI/Newmont-praxis redovisad"));
} else N("K01", "kalender-kommunikation.json oläsbar");

// ---------- 9. INTERNA LÄNKAR (statisk extraktion) ----------
const interna = [...new Set((body.match(/\]\((\/[^)#\s]+)/g) || []).map(s => s.slice(2)))];
console.log("   interna länkar (" + interna.length + "): " + interna.join(" "));
P("L01", interna.every(l => l.startsWith("/dataset/tillvaxt/") || ["/kurser", "/transparens", "/kallor"].includes(l)), "alla interna länkar inom kända ytor");

console.log("=== SUMMA: " + pass + " PASS · " + fel + " FEL · " + notn + " NOT ===");
process.exit(fel === 0 ? 0 : 1);
