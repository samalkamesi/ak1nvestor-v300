// _s4u2-aapl-byggdata.mjs — beräkningsmotor för Apple Q3-2026-läspaketet (kalender-Q3 = Q4 FY2026)
// Alla tal: universumraden AAPL (data/portfolj-system/bolagsunivers.json, hämtad 2026-09-03)
// + sökverifierad kvartalskedja 2026-09-29. Kör: node verktyg/_s4u2-aapl-byggdata.mjs
import fs from 'fs';

const U = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const aapl = U.find(r => r.ticker === 'AAPL');
const tek = U.filter(r => r.bransch === 'teknik');

// --- sökverifierad kvartalskedja (2026-09-29) ---
const K = {
  q4fy25: { intakt: 102.47, netto: 27.47, eps: 1.85, rappdag: '2025-10-30' },
  q1fy26: { intakt: 143.8, netto: 42.1, eps: 2.84, rappdag: '2026-01-29' },
  q2fy26: { intakt: 111.2, netto: 29.6, eps: 2.01, rappdag: '2026-04-30' },
  q3fy26: { intakt: 109.417, netto: 29.789, epsG: 2.02, epsJ: 1.91, rappdag: '2026-07-30' },
};

const pris = aapl.pris;                       // 324.96
const mcap = aapl.marknadsKapitalMdr;         // 4742.525
const pe = aapl.vardering.pe;                 // 37.309
const pb = aapl.vardering.pb;                 // 44.152
const roe = aapl.lonksamhet.roe;              // 1.4875
const nettoM = aapl.lonksamhet.nettoMarginal; // 0.2762

const epsKedja = K.q4fy25.eps + K.q1fy26.eps + K.q2fy26.eps + K.q3fy26.epsG;
const epsImplicit = pris / pe;
const ttmIntaktFalt = 466.82;   // Yahoo TTM (sökverifierad 2026-09-29)
const ttmNettoFalt = 128.93;    // Yahoo TTM
const ttmIntaktKedja = K.q4fy25.intakt + K.q1fy26.intakt + K.q2fy26.intakt + K.q3fy26.intakt;
const ttmNettoKedja = K.q4fy25.netto + K.q1fy26.netto + K.q2fy26.netto + K.q3fy26.netto;

// --- fältkontroller ---
console.log('=== FÄLTKONTROLLER ===');
console.log('EPS-kedja 1,85+2,84+2,01+2,02 =', epsKedja.toFixed(3), '| fältets implicerade =', epsImplicit.toFixed(3), '| gap % =', (100 * (epsKedja - epsImplicit) / epsImplicit).toFixed(2));
console.log('P/E på kedjan:', (pris / epsKedja).toFixed(2), 'mot fält', pe, '| gap % =', (100 * Math.abs(pris / epsKedja - pe) / pe).toFixed(2));
console.log('TTM-intäkt kedja:', ttmIntaktKedja.toFixed(3), 'mot fält', ttmIntaktFalt, '| gap % =', (100 * (ttmIntaktKedja - ttmIntaktFalt) / ttmIntaktFalt).toFixed(3));
console.log('TTM-netto kedja:', ttmNettoKedja.toFixed(3), 'mot fält', ttmNettoFalt, '| gap % =', (100 * (ttmNettoKedja - ttmNettoFalt) / ttmNettoFalt).toFixed(3));
console.log('Nettomarginal kedja:', (100 * ttmNettoKedja / ttmIntaktKedja).toFixed(3), '% mot fält', (nettoM * 100), '%');

// --- identitetstest + EK-vägar ---
console.log('\n=== IDENTITETSTEST + EK ===');
const peIdent = pb / roe;
console.log('P/B / ROE =', peIdent.toFixed(3), 'mot P/E', pe, '| gap % =', (100 * (pe - peIdent) / pe).toFixed(2));
const ekSlut = mcap / pb;
const ekMedel = ttmNettoFalt / roe;
console.log('Slut-EK (mcap/PB):', ekSlut.toFixed(2), 'mdr | Medel-EK (netto/ROE):', ekMedel.toFixed(2), 'mdr | kvot =', (ekSlut / ekMedel).toFixed(3));
const antalSpot = mcap / pris;
console.log('Aktieantal spot (mcap/pris):', antalSpot.toFixed(3), 'mdr');
console.log('Aktieantal EPS-vägar: Q4FY25', (K.q4fy25.netto / K.q4fy25.eps).toFixed(3), '| Q1', (K.q1fy26.netto / K.q1fy26.eps).toFixed(3), '| Q3 GAAP', (K.q3fy26.netto / K.q3fy26.epsG).toFixed(3));
console.log('BPS:', (ekSlut / antalSpot).toFixed(2), 'dollar');
console.log('ROE på slut-EK:', (100 * ttmNettoFalt / ekSlut).toFixed(2), '% | ROE på medel-EK (fältväg):', (100 * ttmNettoFalt / ekMedel).toFixed(2), '%');
const skuld = aapl.stabilitet.skuldEgenkapital * ekSlut;
console.log('Räntebärande skuld (skuld/EK × slut-EK):', skuld.toFixed(2), 'mdr');

// --- EV-imperativ ---
console.log('\n=== EV-IMPERATIV ===');
const ebitFalt = aapl.lonksamhet.ebitMarginal * ttmIntaktFalt;
const ev = aapl.vardering.evEbit * ebitFalt;
console.log('EBIT TTM fältväg:', ebitFalt.toFixed(2), 'mdr | EV = evEbit × EBIT:', ev.toFixed(1), 'mdr | mot mcap:', mcap, '| diff =', (ev - mcap).toFixed(1), 'mdr → implicerar', (ev - mcap > 0 ? 'nettoskuld' : 'nettokassa'));

// --- PEG tre vägar ---
console.log('\n=== PEG TRE VÄGAR ===');
const pegFalt = aapl.vardering.peg;
console.log('Fält', pegFalt, '(implicerad tillväxt', (pe / pegFalt).toFixed(2), '%) | prognos 8,11 % →', (pe / 8.11).toFixed(2), '| TTM 16,4 % →', (pe / 16.4).toFixed(2));

// --- guide + FY2026 ---
console.log('\n=== GUIDE 9–11 % & FY2026 ===');
const gl = K.q4fy25.intakt * 1.09, gm = K.q4fy25.intakt * 1.10, gh = K.q4fy25.intakt * 1.11;
console.log('Guide-låg', gl.toFixed(2), '| -mitt', gm.toFixed(2), '| -hög', gh.toFixed(2), '(bas Q4FY25 102,47)');
const fy26l = ttmIntaktKedja - K.q4fy25.intakt + gl, fy26m = ttmIntaktKedja - K.q4fy25.intakt + gm, fy26h = ttmIntaktKedja - K.q4fy25.intakt + gh;
const fy25 = 416.161;
console.log('FY2026 vid låg', fy26l.toFixed(1), '(+' + (100 * (fy26l / fy25 - 1)).toFixed(1) + '%) | mitt', fy26m.toFixed(1), '(+' + (100 * (fy26m / fy25 - 1)).toFixed(1) + '%) | hög', fy26h.toFixed(1), '(+' + (100 * (fy26h / fy25 - 1)).toFixed(1) + '%)');

// --- scenarioruta ---
console.log('\n=== SCENARIORUTA (netto mdr · kvartals-EPS · nytt rullande P/E) ===');
const rullandeBas = epsKedja - K.q4fy25.eps;  // det som blir kvar när Q4FY25 rullar ur
for (const [mn, m] of [['24 %', 0.24], ['27 %', 0.27], ['30 %', 0.30]]) {
  const rad = [];
  for (const [in_, ii] of [['låg', gl], ['mitt', gm], ['hög', gh]]) {
    const netto = m * ii;
    const epsNy = netto / antalSpot;
    const peNy = pris / (rullandeBas + epsNy);
    rad.push(`${netto.toFixed(1)} · ${epsNy.toFixed(2)} · ${peNy.toFixed(1)}`);
  }
  console.log(mn.padEnd(5), rad.join(' | '));
}
console.log('Rullande bas efter rotation:', rullandeBas.toFixed(2), '(8,72 − 1,85)');

// --- brytpunkter ---
console.log('\n=== BRYTPUNKTER ===');
for (const p of [34, 32]) {
  const epsBehov = pris / p - rullandeBas;
  console.log('P/E', p, 'kräver rullande', (pris / p).toFixed(2), '→ Q4-EPS', epsBehov.toFixed(2), '(vs Q1-rekordet 2,84)');
}

// --- utdelning + FCF ---
console.log('\n=== UTDELNING + FCF ===');
console.log('0,27 × 4 = 1,08 dollar/år | direktavkastning =', (100 * 1.08 / pris).toFixed(3), '%');
const fcfTTM = aapl.lonksamhet.fcfMarginal * ttmIntaktFalt;
console.log('FCF TTM fältväg:', fcfTTM.toFixed(1), 'mdr | per aktie', (fcfTTM / antalSpot).toFixed(2), '| marginal', (aapl.lonksamhet.fcfMarginal * 100).toFixed(2), '%');

// --- grenstatistik (medianer + ranger) ---
console.log('\n=== TEKNIKGRENNEN n=' + tek.length + ' — MEDIANER & AAPL-RANG ===');
function median(v) { const s = [...v].sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
const falt = [
  ['P/E', r => r.vardering?.pe, 'lagst'],
  ['P/B', r => r.vardering?.pb, 'lagst'],
  ['EV/EBIT', r => r.vardering?.evEbit, 'lagst'],
  ['PEG', r => r.vardering?.peg, 'lagst'],
  ['FCF-yield', r => r.vardering?.fcfYield, 'hogst'],
  ['ROE', r => r.lonksamhet?.roe, 'hogst'],
  ['ROIC', r => r.lonksamhet?.roic, 'hogst'],
  ['Brutto', r => r.lonksamhet?.bruttoMarginal, 'hogst'],
  ['EBIT-m', r => r.lonksamhet?.ebitMarginal, 'hogst'],
  ['Netto-m', r => r.lonksamhet?.nettoMarginal, 'hogst'],
  ['Skuld/EK', r => r.stabilitet?.skuldEgenkapital, 'lagst'],
  ['TTM-tillv', r => r.tillvaxt?.omsattningTillvaxtTTM, 'hogst'],
];
for (const [namn, get, rikt] of falt) {
  const lista = tek.map(r => [r.ticker, get(r)]).filter(([, v]) => typeof v === 'number' && isFinite(v));
  const sort = [...lista].sort((a, b) => rikt === 'lagst' ? a[1] - b[1] : b[1] - a[1]);
  const rang = sort.findIndex(([t]) => t === 'AAPL') + 1;
  const v = lista.find(([t]) => t === 'AAPL')[1];
  const n = lista.length;
  const hogstRang = rikt === 'lagst' ? n - rang + 1 : rang;
  console.log(`${namn}: n=${n} median=${median(lista.map(([, x]) => x))} AAPL=${v} rang-bäst(${rikt})=${rang} → ${hogstRang}:e högst`);
}

// --- kvartals-EPS världar ---
console.log('\n=== EPS-VÄRLDAR Q3FY26 ===');
console.log('GAAP 2,02 / justerad 1,91 | kvot =', (2.02 / 1.91).toFixed(3), '| konsensus 1,89: GAAP-slag', ((2.02 / 1.89 - 1) * 100).toFixed(1), '%, justerat-slag', ((1.91 / 1.89 - 1) * 100).toFixed(1), '%');
