#!/usr/bin/env node
// _s4u3-asml-underlag.mjs — beräkningsgrund för ASML Q3-läspaket
// Läser bolagsunivers.json, räknar medianer/rang för teknikgrenen + universumet,
// och alla aritmetikkontroller (datavaktens prov) med oberoende omräkning.
import { readFileSync } from "node:fs";

const U = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const poster = Array.isArray(U) ? U : (U.bolag || U.poster);
const P = poster.find(p => p.ticker === "ASML.AS");
if (!P) { console.error("ASML.AS saknas"); process.exit(1); }

const num = v => (v === null || v === undefined) ? null : Number(v);
const median = arr => {
  const a = arr.filter(v => v !== null && !Number.isNaN(v)).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
const rangAv = (val, arr, hogtArBra) => {
  const a = arr.filter(v => v !== null && !Number.isNaN(v));
  const sorterad = [...a].sort((x, y) => hogtArBra ? y - x : x - y);
  return sorterad.indexOf(val) + 1;
};

const teknik = poster.filter(p => p.bransch === "teknik");
console.log(`teknikgrenen n=${teknik.length} av ${poster.length} totalt`);

// Fält att rangmäta: [etikett, läs-funktion, hogtArBra]
const falt = [
  ["P/E", p => num(p.vardering?.pe), false],
  ["P/B", p => num(p.vardering?.pb), false],
  ["EV/EBIT", p => num(p.vardering?.evEbit), false],
  ["PEG", p => num(p.vardering?.peg), false],
  ["FCF-yield %", p => num(p.vardering?.fcfYield) === null ? null : num(p.vardering.fcfYield) * 100, true],
  ["ROE %", p => num(p.lonksamhet?.roe) === null ? null : num(p.lonksamhet.roe) * 100, true],
  ["ROIC %", p => num(p.lonksamhet?.roic) === null ? null : num(p.lonksamhet.roic) * 100, true],
  ["bruttomarginal %", p => num(p.lonksamhet?.bruttoMarginal) === null ? null : num(p.lonksamhet.bruttoMarginal) * 100, true],
  ["EBIT-marginal %", p => num(p.lonksamhet?.ebitMarginal) === null ? null : num(p.lonksamhet.ebitMarginal) * 100, true],
  ["nettomarginal %", p => num(p.lonksamhet?.nettoMarginal) === null ? null : num(p.lonksamhet.nettoMarginal) * 100, true],
  ["FCF-marginal %", p => num(p.lonksamhet?.fcfMarginal) === null ? null : num(p.lonksamhet.fcfMarginal) * 100, true],
  ["skuld/EK", p => num(p.stabilitet?.skuldEgenkapital), false],
  ["omsättningCAGR %", p => num(p.tillvaxt?.omsattningCAGR5ar) === null ? null : num(p.tillvaxt.omsattningCAGR5ar) * 100, true],
  ["resultatCAGR %", p => num(p.tillvaxt?.resultatCAGR5ar) === null ? null : num(p.tillvaxt.resultatCAGR5ar) * 100, true],
  ["omsättningTTM %", p => num(p.tillvaxt?.omsattningTillvaxtTTM) === null ? null : num(p.tillvaxt.omsattningTillvaxtTTM) * 100, true],
  ["prognosTillvaxt %", p => num(p.tillvaxt?.prognosTillvaxt) === null ? null : num(p.tillvaxt.prognosTillvaxt) * 100, true],
  ["mcap mdr", p => num(p.marknadsKapitalMdr), true],
];

console.log("\n=== ASML-fält + grenmedian + grenrang + universummedian (n per mått) ===");
for (const [namn, fn, hog] of falt) {
  const val = fn(P);
  const tVals = teknik.map(fn), uVals = poster.map(fn);
  const tN = tVals.filter(v => v !== null).length, uN = uVals.filter(v => v !== null).length;
  const r = rangAv(val, tVals, hog);
  console.log(
    `${namn.padEnd(20)} ASML=${val === null ? "null" : val.toFixed(4)} | grenMed=${median(tVals)?.toFixed(4)} rang=${val === null ? "-" : r + "/" + tN} | uniMed=${median(uVals)?.toFixed(4)} (n=${uN})`
  );
}

// === Arimetikkontroller (datavakten) — oberoende omräkning ===
console.log("\n=== DATAVAKTENS PROV (oberoende omräkning) ===");
const mcap = num(P.marknadsKapitalMdr), pris = num(P.pris);
const pe = num(P.vardering.pe), pb = num(P.vardering.pb), evEbit = num(P.vardering.evEbit), peg = num(P.vardering.peg);
const roe = num(P.lonksamhet.roe), roic = num(P.lonksamhet.roic);
const nettoM = num(P.lonksamhet.nettoMarginal), ebitM = num(P.lonksamhet.ebitMarginal), fcfM = num(P.lonksamhet.fcfMarginal);
const skuldEk = num(P.stabilitet.skuldEgenkapital), fcfY = num(P.vardering.fcfYield);
const oms = P.serier.omsattning, res = P.serier.resultat, fcf = P.serier.fcf;
const ttmT = num(P.tillvaxt.omsattningTillvaxtTTM), progT = num(P.tillvaxt.prognosTillvaxt);
const omsC = num(P.tillvaxt.omsattningCAGR5ar), resC = num(P.tillvaxt.resultatCAGR5ar);

// Serierna ligger i EUR (hela tal); normalisera till mdr EUR överallt.
const mdr = x => x / 1e9;
const omsM = oms.map(mdr), resM = res.map(mdr), fcfS = fcf.map(mdr);
const aktier = mcap / pris; // mdr aktier (mcap mdr / pris EUR)
const ttmOms = omsM[3] * (1 + ttmT);
const vinstPEvag = mcap / pe;
const vinstMargvag = nettoM * ttmOms;
const ek = mcap / pb;
const skuld = skuldEk * ek;
const nettokassa = 5.6; // ur universumpostens notering
const ev = mcap + skuld - nettokassa;
const ebitEVvag = ev / evEbit;
const ebitMargvag = ebitM * ttmOms;
const fcfYvag = fcfY * mcap;
const fcfMargvag2 = fcfM * ttmOms;
const cagrOms = Math.pow(omsM[3] / omsM[0], 1 / 3) - 1;
const cagrRes = Math.pow(resM[3] / resM[0], 1 / 3) - 1;
const cagrFcf = Math.pow(fcfS[3] / fcfS[0], 1 / 3) - 1;
const pegKonv = pe / (progT * 100);
const vpaTTM = vinstPEvag / aktier; // EUR
const peBoken = pb / roe; // P/B ÷ ROE = bok-P/E

console.log(`aktier härledda        : ${aktier.toFixed(1)} M st (mcap/pris)`);
console.log(`TTM-omsättning          : ${omsM[3]} × ${ttmT} = ${ttmOms.toFixed(3)} mdr EUR`);
console.log(`PROV1 identitet         : P/E×ROE = ${pe}×${roe} = ${(pe * roe).toFixed(3)} mot P/B ${pb} => gap ${((pe * roe / pb - 1) * 100).toFixed(2)} %`);
console.log(`PROV1b bok-P/E          : P/B÷ROE = ${(peBoken).toFixed(2)} mot fält ${pe} => gap ${((peBoken / pe - 1) * 100).toFixed(2)} %`);
console.log(`PROV2 TTM-detektiv      : P/E-väg ${mcap}/${pe} = ${vinstPEvag.toFixed(3)} | marginalväg ${nettoM}×${ttmOms.toFixed(3)} = ${vinstMargvag.toFixed(3)} => gap ${((vinstMargvag / vinstPEvag - 1) * 100).toFixed(2)} %`);
console.log(`PROV3 EV-kedja          : EK = ${mcap}/${pb} = ${ek.toFixed(3)} | skuld = ${skuldEk}×${ek.toFixed(3)} = ${skuld.toFixed(3)} | EV = ${mcap}+${skuld.toFixed(3)}−${nettokassa} = ${ev.toFixed(3)} (LÄGRE än mcap: ${(ev / mcap - 1).toFixed(4)})`);
console.log(`PROV3b EBIT-par         : EV-väg ${ev.toFixed(2)}/${evEbit} = ${ebitEVvag.toFixed(3)} | marginalväg ${ebitM}×${ttmOms.toFixed(3)} = ${ebitMargvag.toFixed(3)} => gap ${((ebitEVvag / ebitMargvag - 1) * 100).toFixed(2)} %`);
console.log(`PROV4 FCF-paret         : yield-väg ${fcfY}×${mcap} = ${fcfYvag.toFixed(3)} | marginalväg ${fcfM}×${ttmOms.toFixed(3)} = ${fcfMargvag2.toFixed(3)} => gap ${((fcfMargvag2 / fcfYvag - 1) * 100).toFixed(2)} %`);
console.log(`PROV5 CAGR              : oms (${omsM[3]}/${omsM[0]})^(1/3) = ${(cagrOms * 100).toFixed(2)} % (fält ${(omsC * 100).toFixed(2)}) | res (${resM[3]}/${resM[0]})^(1/3) = ${(cagrRes * 100).toFixed(2)} % (fält ${(resC * 100).toFixed(2)}) | FCF cagr ${(cagrFcf * 100).toFixed(2)} %`);
console.log(`PROV6 PEG               : ${pe}/(${(progT * 100).toFixed(2)}) = ${pegKonv.toFixed(4)} mot fält ${peg} => gap ${((pegKonv / peg - 1) * 100).toFixed(2)} %`);
console.log(`VPA TTM                 : ${vinstPEvag.toFixed(3)} mdr / ${aktier.toFixed(1)} M = ${vpaTTM.toFixed(2)} EUR | P/E-kontroll ${pris}/${vpaTTM.toFixed(2)} = ${(pris / vpaTTM).toFixed(2)}`);
console.log(`VPA bok 2025            : ${resM[3]} mdr / ${aktier.toFixed(1)} M = ${(res[3] * 1000 / aktier).toFixed(2)} EUR | P/E ${(pris / (res[3] * 1000 / aktier)).toFixed(2)}`);

// kvartalstal (webbverifierade ur ASML:s pressrum 2026-09-20)
console.log("\n=== KVARTALSTAL (sökverifierade 2026-09-20, asml.com) ===");
const q1 = 8.767, q2 = 9.326;
console.log(`H1-26 omsättning        : ${q1}+${q2} = ${(q1 + q2).toFixed(3)} mdr`);
console.log(`FY26 mitt (44) − H1     : ${(44 - q1 - q2).toFixed(3)} mdr H2 = ${((44 - q1 - q2) / 44 * 100).toFixed(1)} % av året`);
console.log(`Q3-guide mitt 11.5      : Q4-implied = 44 − 18.093 − 11.5 = ${(44 - q1 - q2 - 11.5).toFixed(3)} mdr`);
console.log(`Guidetrappan            : Q1 ${q1} → Q2 ${q2} (+${((q2 / q1 - 1) * 100).toFixed(1)} %) → Q3m 11.5 (+${((11.5 / q2 - 1) * 100).toFixed(1)} %) → Q4i ${(44 - q1 - q2 - 11.5).toFixed(1)} (+${(((44 - q1 - q2 - 11.5) / 11.5 - 1) * 100).toFixed(1)} %)`);
console.log(`Guidans lyft Q1→Q2      : mitt 38 → 44 = +${((44 / 38 - 1) * 100).toFixed(1)} %`);
console.log(`EPS-trappa              : Q1 7.15 → Q2 7.59 (+${((7.59 / 7.15 - 1) * 100).toFixed(1)} %), H1 ${(7.15 + 7.59).toFixed(2)}`);
console.log(`Utdelningsandel interim : 1.88×2/${pris} = ${((1.88 * 2 / pris) * 100).toFixed(2)} % (årsrun exkl. final)`);
console.log(`Återköpskvot Q2         : 1.1 mdr / ${mcap} = ${(1.1 / mcap * 100).toFixed(2)} % av mcap per kvartal`);

// scenarioruta 3×3: VPA-scenarier × multiplar, mittencell kalibrerad mot kurs
console.log("\n=== SCENARIORUTA (VPA × P/E, mittencell ≈ kurs) ===");
const vpaNed = 24.10, vpaBas = vpaTTM, vpaUpp = 33.00;
const mNed = 40, mBas = pris / vpaTTM, mUpp = 60;
for (const [etv, v] of [["ned", vpaNed], ["bas", vpaBas], ["upp", vpaUpp]]) {
  const r = [mNed, mBas, mUpp].map(m => (v * m).toFixed(0));
  console.log(`VPA ${etv.padEnd(3)} ${v.toFixed(2)} € : ${r.join(" / ")}`);
}
console.log(`mittencell = ${vpaBas.toFixed(2)} × ${mBas.toFixed(2)} = ${(vpaBas * mBas).toFixed(1)} mot kurs ${pris}`);

// FCF-seriens läsart
console.log("\n=== FCF-SERIEN (enda i universumet) ===");
const ar = P.serier.ar;
for (let i = 0; i < 4; i++) console.log(`${ar[i]}: oms ${omsM[i].toFixed(3)} mdr | res ${resM[i].toFixed(3)} mdr | fcf ${fcfS[i].toFixed(3)} mdr | fcf/oms ${((fcfS[i] / omsM[i]) * 100).toFixed(1)} % | fcf/res ${(fcfS[i] / resM[i]).toFixed(2)}`);
console.log(`2023-dip: ${(fcfS[1] / fcfS[0] * 100 - 100).toFixed(1)} % | återhämtning 2024: ${(fcfS[2] / fcfS[1] * 100 - 100).toFixed(1)} % | 2025: ${(fcfS[3] / fcfS[2] * 100 - 100).toFixed(1)} %`);
console.log(`resultatdip 2024: ${(resM[2] / resM[1] * 100 - 100).toFixed(1)} % medan FCF +${((fcfS[2] / fcfS[1] * 100 - 100)).toFixed(1)} % (fönstrens kors)`);
