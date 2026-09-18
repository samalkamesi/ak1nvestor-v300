// Seriejämförelser: CellaVisions kontroller mot seriens 36 levererade paketbolag
import fs from 'node:fs';
const U = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const arr = Array.isArray(U) ? U : Object.values(U);
const slugs = fs.readdirSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3')
  .filter(f => f.startsWith('sa-laser-du-')).map(f => f.slice('sa-laser-du-'.length, -'-q3-2026.json'.length));

// mappa slug → ticker (namn-matchning i två steg)
const byNamn = new Map(arr.map(b => [b.namn, b.ticker]));
const TICK = {
  'abb': 'ABBN.SW', 'alfa-laval': 'ALFA.ST', 'astrazeneca': 'AZN.ST', 'atlas-copco': 'ATCO-A.ST',
  'att': 'T', 'boliden': 'BOL.ST', 'boston-scientific': 'BSX', 'castellum': 'CAST.ST',
  'ericsson': 'ERIC-B.ST', 'essity': 'ESSITY-B.ST', 'evolution': 'EVO.ST',
  'handelsbanken': 'SHB-A.ST', 'hm-b': 'HM-B.ST', 'holm': 'HOLM-B.ST', 'iberdrola': 'IBE.MC',
  'industrivarden': 'INDU-C.ST', 'jnj': 'JNJ', 'nike': 'NKE', 'nordea': 'NDA-FI.HE',
  'norsk-hydro': 'NHY.OL', 'novo-nordisk': 'NOVO-B.CO', 'np3': 'NP3.ST',
  'precise-biometrics': 'PREC.ST', 'saab': 'SAAB-B.ST', 'samsung': '005930.KS', 'sandvik': 'SAND.ST',
  'sap': 'SAP.DE', 'sca': 'SCA-B.ST', 'skf-b': 'SKF-B.ST', 'swedbank': 'SWED-A.ST',
  'tele2': 'TEL2-B.ST', 'telia': 'TELIA.ST', 'volvo-car': 'VOLCAR-B.ST', 'volvo-group': 'VOLV-B.ST',
  'wallenstam': 'WALL-B.ST', 'yara': 'YAR.OL',
};
const rows = [];
for (const s of slugs) {
  let b = arr.find(x => x.ticker === TICK[s]);
  if (!b) { console.log('SAKNAS:', s, TICK[s]); continue; }
  const v = b.vardering || {}, l = b.lonksamhet || {}, t = b.tillvaxt || {};
  const ser = b.serier || {};
  const res = (ser.resultat || []).length ? ser.resultat[ser.resultat.length - 1] : null;
  const oms = (ser.omsattning || []).length ? ser.omsattning[ser.omsattning.length - 1] : null;
  const MC = b.marknadsKapitalMdr;
  const r = { slug: s, tick: b.ticker, valuta: b.valuta, mc: MC };
  r.absolut = (v.pe != null && res != null) ? (v.pe * (res / 1e9) / MC - 1) * 100 : null;
  r.ident = (v.pb != null && l.roe != null && v.pe != null) ? Math.abs((v.pb / l.roe - v.pe) / v.pe) * 100 : null;
  if (oms != null && l.ebitMarginal != null && v.pb != null && l.roe != null && b.stabilitet?.skuldEgenkapital != null && v.evEbit != null) {
    const ek = MC / v.pb, ev = MC + ek * b.stabilitet.skuldEgenkapital, ebit = l.ebitMarginal * (oms / 1e9);
    r.evdiff = Math.abs((ev / ebit) / v.evEbit - 1) * 100;
  } else r.evdiff = null;
  rows.push(r);
}
const CEV = rows.find(r => r.slug === 'cellavision');
console.log('cellavision med?', !!CEV, '(ej levererat — jämförelseraden läggs till separat)');
// CellaVisions egna tal
const c = arr.find(x => x.ticker === 'CEVI.ST');
const res25 = c.serier.resultat[3] / 1e9;
const cevAbs = (c.vardering.pe * res25 / c.marknadsKapitalMdr - 1) * 100;
const cevIdent = Math.abs((c.vardering.pb / c.lonksamhet.roe - c.vardering.pe) / c.vardering.pe) * 100;
const ek = c.marknadsKapitalMdr / c.vardering.pb;
const ev = c.marknadsKapitalMdr + ek * c.stabilitet.skuldEgenkapital;
const ebit = c.lonksamhet.ebitMarginal * (c.serier.omsattning[3] / 1e9);
const cevEv = Math.abs((ev / ebit) / c.vardering.evEbit - 1) * 100;

const rank = (key, val, desc) => {
  const xs = rows.filter(r => r[key] != null).map(r => r[key]).concat([val]).sort((a, b) => desc ? b - a : a - b);
  return { rang: xs.indexOf(val) + 1, n: xs.length, top: xs.slice(desc ? 0 : 0, 5) };
};
console.log('\n=== CELLAVISION vs SERIENS 36 (signatur-verifiering) ===');
const A = rank('absolut', cevAbs, true);
console.log(`absolutresidual +${cevAbs.toFixed(1)} % — rang ${A.rang}/${A.n} (högst positiv); topp: ${A.top.slice(0, 5).map(x => x.toFixed(1)).join(', ')}`);
const I = rank('ident', cevIdent, false);
console.log(`identitetsdiff ${cevIdent.toFixed(1)} % — rang ${I.rang}/${I.n} (lägst = tajtast); bästa: ${I.top.slice(0, 5).map(x => x.toFixed(1)).join(', ')}`);
const E = rank('evdiff', cevEv, false);
console.log(`EV-kedjediff ${cevEv.toFixed(1)} % — rang ${E.rang}/${E.n} (lägst = tajtast); bästa: ${E.top.slice(0, 5).map(x => x.toFixed(1)).join(', ')}`);

console.log('\n=== SKALA: SEK-noterade paketbolag + hälsogrenen SEK ===');
const sek = rows.filter(r => r.valuta === 'SEK').map(r => `${r.slug}: ${r.mc}`).join(' · ');
console.log('SEK-paket:', sek);
const halso = arr.filter(b => b.bransch === 'halso' && b.valuta === 'SEK').map(b => `${b.ticker}: ${b.marknadsKapitalMdr} mdr`).join(' · ');
console.log('hälsogrenen SEK:', halso);
const prec = arr.find(x => x.ticker.startsWith('PREC'));
console.log('PREC-post:', prec ? `${prec.ticker} ${prec.marknadsKapitalMdr} mdr ${prec.valuta}` : 'saknas');
