// Beräkningsunderlag för CellaVision-paketet (s4-u1, auto-s4-1789700129983)
import fs from 'node:fs';
const U = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const arr = Array.isArray(U) ? U : Object.values(U);
const cevi = arr.find(b => b.ticker === 'CEVI.ST');
const gren = arr.filter(b => b.bransch === 'halso');

const M = [
  ['pe', b => b.vardering?.pe],
  ['pb', b => b.vardering?.pb],
  ['evEbit', b => b.vardering?.evEbit],
  ['peg', b => b.vardering?.peg],
  ['fcfYield', b => b.vardering?.fcfYield],
  ['roe', b => b.lonksamhet?.roe],
  ['roic', b => b.lonksamhet?.roic],
  ['brutto', b => b.lonksamhet?.bruttoMarginal],
  ['ebit', b => b.lonksamhet?.ebitMarginal],
  ['netto', b => b.lonksamhet?.nettoMarginal],
  ['fcfMarg', b => b.lonksamhet?.fcfMarginal],
  ['skuldEk', b => b.stabilitet?.skuldEgenkapital],
  ['prognos', b => b.tillvaxt?.prognosTillvaxt],
  ['resCagr', b => b.tillvaxt?.resultatCAGR5ar],
  ['omsCagr', b => b.tillvaxt?.omsattningCAGR5ar],
  ['tmm', b => b.tillvaxt?.omsattningTillvaxtTTM],
];
const median = v => { const s = v.filter(x => x !== null && x !== undefined).sort((a, b) => a - b); if (!s.length) return null; const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

console.log('=== CELLAVISION 16 MÅTT: värde | hälsomedian (n) | universummedian (n) | rang i grenen ===');
for (const [namn, f] of M) {
  const gv = f(cevi);
  const g = gren.map(f).filter(x => x !== null && x !== undefined);
  const a = arr.map(f).filter(x => x !== null && x !== undefined);
  const sortDesc = ['roe','roic','brutto','ebit','netto','fcfMarg','prognos','resCagr','omsCagr','tmm'].includes(namn); // högst=bäst
  // rang: lägst=bäst för multiplar+skuld (utom fcfYield högst=bäst), högst=bäst för lönsamhet/tillväxt
  const descYield = namn === 'fcfYield';
  const sorted = [...g].sort((x, y) => descYield || sortDesc ? y - x : x - y);
  const rang = gv === null || gv === undefined ? null : sorted.indexOf(gv) + 1;
  console.log(`${namn}: ${gv} | ${median(g).toFixed(4)} (n=${g.length}) | ${median(a).toFixed(4)} (n=${a.length}) | rang ${rang}/${g.length}`);
}

console.log('\n=== HÄLSOGRENNENS BOLAG (tickers) ===');
console.log(gren.map(b => b.ticker).join(', '));

console.log('\n=== MARKNADSVÄRDEN SEK-NOTERADE I SERIEN (jämförelse av skala, samma valuta) ===');
for (const t of ['CEVI.ST', 'PREC-ST', 'NP3.ST', 'WALL-B.ST', 'SAAB-B.ST', 'EVO.ST']) {
  const b = arr.find(x => x.ticker === t);
  if (b) console.log(`${t}: ${b.marknadsKapitalMdr} mdr ${b.valuta}`);
}

console.log('\n=== CELLAVISION-KEDJOR ===');
const P = cevi.pris, MC = cevi.marknadsKapitalMdr * 1000; // Mkr
const v = cevi.vardering, l = cevi.lonksamhet, t = cevi.tillvaxt, s = cevi.stabilitet, ser = cevi.serier;
const oms25 = ser.omsattning[3] / 1e6, res25 = ser.resultat[3] / 1e6; // Mkr
console.log(`pris ${P} kr, MC ${MC.toFixed(1)} Mkr`);
console.log(`2025: oms ${oms25.toFixed(3)} Mkr, res ${res25.toFixed(3)} Mkr, netto-marg ${(res25 / oms25 * 100).toFixed(2)} %`);
const ar = ser.ar, oms = ser.omsattning.map(x => x / 1e6), res = ser.resultat.map(x => x / 1e6);
for (let i = 0; i < ar.length; i++) {
  const stegO = i ? ((oms[i] / oms[i - 1] - 1) * 100).toFixed(2) + ' %' : '—';
  const stegR = i ? ((res[i] / res[i - 1] - 1) * 100).toFixed(2) + ' %' : '—';
  console.log(`${ar[i]}: oms ${oms[i].toFixed(3)} (${stegO}) res ${res[i].toFixed(3)} (${stegR}) netto ${(res[i] / oms[i] * 100).toFixed(2)} %`);
}
console.log(`CAGR oms: ${((oms[3] / oms[0]) ** (1 / 3) - 1).toFixed(6)} (fält ${t.omsattningCAGR5ar})`);
console.log(`CAGR res: ${((res[3] / res[0]) ** (1 / 3) - 1).toFixed(6)} (fält ${t.resultatCAGR5ar})`);
console.log(`identitet P/B÷ROE: ${(v.pb / l.roe).toFixed(4)} mot P/E-fält ${v.pe}, diff ${((v.pe - v.pb / l.roe) / v.pe * 100).toFixed(1)} %`);
console.log(`absolut P/E×res: ${(v.pe * res25).toFixed(1)} Mkr mot MC ${MC.toFixed(1)} → residual ${((v.pe * res25 / MC - 1) * 100).toFixed(1)} %`);
const ekPB = MC / v.pb;
console.log(`EK via P/B: ${ekPB.toFixed(1)} Mkr; skuld via S/EK: ${(ekPB * s.skuldEgenkapital).toFixed(1)} Mkr`);
const ebit25 = l.ebitMarginal * oms25;
console.log(`EBIT 2025: ${ebit25.toFixed(1)} Mkr (marg ${l.ebitMarginal})`);
const evKedja = MC + ekPB * s.skuldEgenkapital;
console.log(`EV via kedja: ${evKedja.toFixed(1)} → EV/EBIT ${(evKedja / ebit25).toFixed(3)} mot fält ${v.evEbit}, diff ${((evKedja / ebit25 / v.evEbit - 1) * 100).toFixed(1)} %`);
const evFalt = v.evEbit * ebit25;
console.log(`EV via fält: ${evFalt.toFixed(1)} Mkr; fält-EV − MC = ${(evFalt - MC).toFixed(1)} Mkr (implicit nettoskuld)`);
const fcf25 = l.fcfMarginal * oms25;
console.log(`FCF 2025: ${fcf25.toFixed(1)} Mkr → FCF-avk ${(fcf25 / MC * 100).toFixed(2)} % mot fält ${(v.fcfYield * 100).toFixed(2)} %, diff ${((fcf25 / MC / v.fcfYield - 1) * 100).toFixed(1)} %`);
console.log(`P/FCF: ${(1 / v.fcfYield).toFixed(1)}`);
console.log(`PEG konvention P/E÷prognos: ${(v.pe / (t.prognosTillvaxt * 100)).toFixed(3)}; bakåt P/E÷resCAGR: ${(v.pe / (t.resultatCAGR5ar * 100)).toFixed(3)}; klyfta faktor ${(v.pe / (t.resultatCAGR5ar * 100) / (v.pe / (t.prognosTillvaxt * 100))).toFixed(2)}`);
const roeImpl = res25 / ekPB, roeAbs = (MC / v.pe) / ekPB;
console.log(`TTM-detektiv: ROE bokfört ${roeImpl * 100} %, ROE implicit resultat ${roeAbs * 100} %, fält ${l.roe * 100} %`);
console.log(`netto→FCF-klyfta: ${((l.nettoMarginal - l.fcfMarginal) * 100).toFixed(1)} pp`);
console.log(`PEG-fält: ${v.peg}`);

console.log('\n=== SCENARIORUTA (netto Mkr, bas 2025) ===');
const m0 = res25 / oms25;
for (const dm of [-2, 0, 2]) {
  const rad = [];
  for (const dv of [-3, 0, 3]) rad.push((oms25 * (1 + dv / 100) * (m0 + dm / 100)).toFixed(1));
  console.log(`marginal ${(m0 * 100 + dm).toFixed(2)} %: ${rad.join(' | ')}`);
}
console.log(`1 pp marginal = ${(oms25 / 100).toFixed(2)} Mkr; 3 % volym = ${(0.03 * oms25 * m0).toFixed(2)} Mkr; marginalvikt ${(oms25 / 100 / (0.03 * oms25 * m0)).toFixed(2)}`);
console.log(`medianmultytövning: MC ÷ hälsomedian-P/E = ${MC} / ${median(gren.map(b => b.vardering?.pe).filter(x => x != null)).toFixed(3)} = ${(MC / median(gren.map(b => b.vardering?.pe).filter(x => x != null))).toFixed(1)} Mkr resultat`);
