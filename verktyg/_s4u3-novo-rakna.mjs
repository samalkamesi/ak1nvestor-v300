// Räkneunderlag för Novo Nordisk-paketet — alla tal ur bolagsunivers.json (165-filen).
// Skriver ut grenmedianer, rangplatser, kontrollkedjor och scenarioruta till konsolen.
import { readFileSync } from 'node:fs';

const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const B = U.find((b) => b.ticker === 'NOVO-B.CO');
const gren = U.filter((b) => b.bransch === 'halso');
console.log('GREN n =', gren.length, '->', gren.map((b) => b.ticker).join(', '));
console.log('UNIVERSUM n =', U.length);

const pct = (x) => (x === null || x === undefined ? null : x * 100);
function med(v) {
  const s = v.filter((x) => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b);
  if (!s.length) return { m: null, n: 0 };
  const mit = Math.floor(s.length / 2);
  return { m: s.length % 2 ? s[mit] : (s[mit - 1] + s[mit]) / 2, n: s.length };
}
function rang(lista, varde, storstArBast) {
  const s = lista.filter((x) => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => (storstArBast ? b - a : a - b));
  const i = s.indexOf(varde);
  return i === -1 ? null : `${i + 1}/${s.length}`;
}

const falt = {
  'P/E': (b) => b.vardering?.pe,
  'P/B': (b) => b.vardering?.pb,
  'EV/EBIT': (b) => b.vardering?.evEbit,
  PEG: (b) => b.vardering?.peg,
  'FCF-avk %': (b) => pct(b.vardering?.fcfYield),
  ROE: (b) => pct(b.lonksamhet?.roe),
  ROIC: (b) => pct(b.lonksamhet?.roic),
  Brutto: (b) => pct(b.lonksamhet?.bruttoMarginal),
  EBIT: (b) => pct(b.lonksamhet?.ebitMarginal),
  Netto: (b) => pct(b.lonksamhet?.nettoMarginal),
  'FCF-marg': (b) => pct(b.lonksamhet?.fcfMarginal),
  'Skuld/EK': (b) => b.stabilitet?.skuldEgenkapital,
  'Prog.tillv %': (b) => pct(b.tillvaxt?.prognosTillvaxt),
  'Res-CAGR %': (b) => pct(b.tillvaxt?.resultatCAGR5ar),
  'Oms-CAGR %': (b) => pct(b.tillvaxt?.omsattningCAGR5ar),
  'TTM-tillv %': (b) => pct(b.tillvaxt?.omsattningTillvaxtTTM),
};
const storst = new Set(['ROE', 'ROIC', 'Brutto', 'EBIT', 'Netto', 'FCF-marg', 'FCF-avk %', 'Prog.tillv %', 'Res-CAGR %', 'Oms-CAGR %', 'TTM-tillv %']);

console.log('\n=== MEDIANER + RANG (halso-grenen + universumet) ===');
for (const [namn, fn] of Object.entries(falt)) {
  const g = gren.map(fn);
  const au = U.map(fn);
  const v = fn(B);
  const mg = med(g), mu = med(au);
  console.log(
    `${namn.padEnd(13)} NOVO=${v === null ? 'null' : v.toFixed(3)}  grenMed=${mg.m === null ? '-' : mg.m.toFixed(3)} (n=${mg.n})  uniMed=${mu.m === null ? '-' : mu.m.toFixed(3)} (n=${mu.n})  rang=${rang(g, v, storst.has(namn))}`
  );
}

console.log('\n=== SERIER 2022-2025 (mdr DKK) ===');
const ar = B.serier.ar, om = B.serier.omsattning, re = B.serier.resultat;
for (let i = 0; i < ar.length; i++) {
  const m = (re[i] / om[i]) * 100;
  const oStep = i ? ((om[i] / om[i - 1] - 1) * 100) : null;
  const rStep = i ? ((re[i] / re[i - 1] - 1) * 100) : null;
  console.log(`${ar[i]}  oms=${om[i] / 1e9}  res=${re[i] / 1e9}  netto=${m.toFixed(2)}%  omsSteg=${oStep === null ? '-' : oStep.toFixed(2) + '%'}  resSteg=${rStep === null ? '-' : rStep.toFixed(2) + '%'}`);
}
const cagrO = ((om[3] / om[0]) ** (1 / 3) - 1) * 100;
const cagrR = ((re[3] / re[0]) ** (1 / 3) - 1) * 100;
console.log(`CAGR oms = ${cagrO.toFixed(2)}% (fält ${(B.tillvaxt.omsattningCAGR5ar * 100).toFixed(2)}%)  CAGR res = ${cagrR.toFixed(2)}% (fält ${(B.tillvaxt.resultatCAGR5ar * 100).toFixed(2)}%)`);

console.log('\n=== KONTROLLER ===');
const pe = B.vardering.pe, pb = B.vardering.pb, roe = B.lonksamhet.roe, mv = B.marknadsKapitalMdr;
const om25 = om[3] / 1e9, re25 = re[3] / 1e9;
console.log('MV =', mv, 'mdr DKK;  pris =', B.pris, 'DKK');
console.log(`Identitet: P/B÷ROE = ${pb}÷${roe} = ${(pb / roe).toFixed(3)}  mot P/E-fält ${pe}  → differens ${(((pe - pb / roe) / (pb / roe)) * 100).toFixed(1)}%`);
console.log(`Vinstavkastning ROE÷P/B = ${(roe / pb * 100).toFixed(2)}%  invers = ${(pb / roe).toFixed(3)}`);
const abs = pe * re25;
console.log(`Absolut: P/E×res2025 = ${pe}×${re25} = ${abs.toFixed(1)} mdr  mot MV ${mv}  → residual ${(((mv - abs) / abs) * 100).toFixed(1)}%`);
const implUnd = mv / pe;
console.log(`Implicit årsunderlag = ${mv}÷${pe} = ${implUnd.toFixed(1)} mdr DKK`);
const ek = mv / pb;
console.log(`EK via P/B = ${mv}÷${pb} = ${ek.toFixed(1)} mdr DKK`);
console.log(`ROE på bokfört res: ${(re25 / ek * 100).toFixed(2)}%   ROE på implicit TTM: ${(implUnd / ek * 100).toFixed(2)}%   fält: ${(roe * 100).toFixed(2)}%`);
const ebit25 = B.lonksamhet.ebitMarginal * om25;
const skuld = ek * B.stabilitet.skuldEgenkapital;
const ev = mv + skuld;
console.log(`EV-kedja: EBIT2025 = ${om25}×${(B.lonksamhet.ebitMarginal * 100).toFixed(2)}% = ${ebit25.toFixed(1)} mdr;  skuld = EK×${B.stabilitet.skuldEgenkapital} = ${skuld.toFixed(1)};  EV = ${ev.toFixed(1)}  → EV/EBIT = ${(ev / ebit25).toFixed(3)} mot fält ${B.vardering.evEbit} (${(((ev / ebit25) / B.vardering.evEbit - 1) * 100).toFixed(1)}%)`);
const evFalt = B.vardering.evEbit * ebit25;
console.log(`Fältets EV = ${B.vardering.evEbit}×${ebit25.toFixed(1)} = ${evFalt.toFixed(1)} mdr → minus MV = ${(evFalt - mv).toFixed(1)} mdr (negativt = implicerar nettokassa)`);
const fcf = B.lonksamhet.fcfMarginal * om25;
console.log(`FCF-par: FCF = ${om25}×${(B.lonksamhet.fcfMarginal * 100).toFixed(2)}% = ${fcf.toFixed(1)} mdr → avkastning ${(fcf / mv * 100).toFixed(3)}% mot fält ${(B.vardering.fcfYield * 100).toFixed(2)}% (differens ${((fcf / mv / B.vardering.fcfYield - 1) * 100).toFixed(1)}%)`);
console.log(`PEG: fält ${B.vardering.peg}; konvention PE÷prog = ${pe}÷${(B.tillvaxt.prognosTillvaxt * 100).toFixed(2)} = ${(pe / (B.tillvaxt.prognosTillvaxt * 100)).toFixed(3)}; implicit tillv ur fält = ${(pe / B.vardering.peg).toFixed(2)}%; bakåtblick PE÷resCAGR = ${(pe / cagrR).toFixed(3)}; klyfta fält/bakåt = ${(B.vardering.peg / (pe / cagrR)).toFixed(2)}×`);

console.log('\n=== SCENARIORUTA: netto 2025-bas (oms ±3 % × netto ±2 pp kring ' + ((re25 / om25) * 100).toFixed(2) + '%) ===');
const basM = (re25 / om25) * 100;
for (const dm of [-2, 0, 2]) {
  const rad = [];
  for (const dvo of [-3, 0, 3]) {
    rad.push((om25 * (1 + dvo / 100) * ((basM + dm) / 100)).toFixed(1));
  }
  console.log(`marginal ${((basM + dm)).toFixed(2)}%:  ${rad.join('  ')}`);
}
const enPp = om25 * 0.01;
const treProc = om25 * 0.03 * (basM / 100);
console.log(`1 pp marginal = ${enPp.toFixed(2)} mdr; 3 % volym = ${treProc.toFixed(2)} mdr i netto;  marginalvikt = ${(enPp / treProc).toFixed(3)} = 1/(3×${(basM / 100).toFixed(4)})`);

console.log('\n=== ÖVRIGT ===');
console.log('insiderköp 6 mån:', B.aterkop?.insiderkopSenaste6man, ' återköp:', B.aterkop?.senasteArMdr, ' utdelning:', B.aterkop?.andelUtestande);
console.log('säsongsnöt: kalenderfenster 2026-11-04 07:30 CEST (bolagsbekräftat)');
const filer = U.length;
console.log('universum n =', filer);
