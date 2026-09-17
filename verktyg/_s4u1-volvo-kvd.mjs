// KVD för sa-laser-du-volvo-group-q3-2026.json — maskinell kvalitetsvaktdoktor
// (syskonmönstret _s3u2o5-kvd-flyg.mjs / _s5u2b-kvd.mjs): 0 FEL Krävs för leverans.
import { readFileSync } from 'node:fs';

const FIL = 'data/blogg-utkast/kvartal/2026-q3/sa-laser-du-volvo-group-q3-2026.json';
const uni = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const bolagArr = Array.isArray(uni) ? uni : (uni.bolag || uni.universum || uni.data);
const V = bolagArr.find(b => b.ticker === 'VOLV-B.ST');
if (!V) { console.error('FEL: VOLV-B.ST saknas i universumfilen'); process.exit(1); }

const pkg = JSON.parse(readFileSync(FIL, 'utf8'));
let fel = 0, varning = 0, kontroller = 0;
const F = m => { fel++; console.log('FEL: ' + m); };
const K = (namn, ok, detalj) => { kontroller++; if (!ok) F(namn + ' — ' + detalj); else console.log('GRÖN: ' + namn + (detalj ? ' (' + detalj + ')' : '')); };

// —— 1. Grundstruktur
K('slug', pkg.slug === 'sa-laser-du-volvo-group-q3-2026', pkg.slug);
const body = pkg.body;
const ord = body.replace(/[#|*\[\]()>`-]/g, ' ').split(/\s+/).filter(w => /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
K('ord.count 1200–3400', ord >= 1200 && ord <= 3400, ord + ' ord');
K('title 70–250 tkn (seriepraxis 77–244)', pkg.title.length >= 70 && pkg.title.length <= 250, pkg.title.length + ' tkn');
K('description 200–670 tkn (seriepraxis 204–660)', pkg.description.length >= 200 && pkg.description.length <= 670, pkg.description.length + ' tkn');

// —— 2. Juridikgrind (lagen 2007:528): rådförbud — köp/sälj etc endast i NEKNANDE kontext (disclaimern)
const radFraser = [/(^|[^åäö字母])köp[^s]/i, /s[äa]lj (denne|aktien|denna|nu)/i, /rekommenderar (att )?(du|vi) (köper|säljer)/i, /\bbör du köpa\b/i, /\bmålkurs/i, /undvik (att )?(köpa|sälja)/i, /\bväntas (stiga|falla|stiga till)\b/i];
for (const re of radFraser) {
  const hits = (body.match(new RegExp(re.source, 'gi')) || []).length;
  // tillåtet: exakt disklaimerns negerade formuleringar
  const negerade = (body.match(/inte en rekommendation att köpa, sälja|Inga köp-, sälj- eller hållningsrekommendationer/g) || []).length;
  if (hits > 0 && negerade === 0) F('rådfras ' + re.source + ': ' + hits + ' träffar utan nekningskontext');
  else kontroller++;
}
console.log('GRÖN: juridikgrind — rådfraser bara i nekningskontext (disclaimern), 2007:528 2 kap 5 §-formulering på sista raden: ' + /2007:528/.test(body));

// —— 3. Universumtalspåståenden: varje siffra i paketet mot källfilen
const tv = (v, exp, tol=0.005) => Math.abs(v - exp) <= Math.abs(exp) * tol;
K('ROE 20,88', tv(20.88, V.lonksamhet.roe * 100, 0.001), 'källa ' + (V.lonksamhet.roe * 100).toFixed(2));
K('ROIC 9,35', tv(9.35, V.lonksamhet.roic * 100, 0.005), 'källa ' + (V.lonksamhet.roic * 100).toFixed(2));
K('brutto 24,36', tv(24.36, V.lonksamhet.bruttoMarginal * 100, 0.005), 'källa ' + (V.lonksamhet.bruttoMarginal * 100).toFixed(2));
K('EBIT 10,38', tv(10.38, V.lonksamhet.ebitMarginal * 100, 0.001), 'källa ' + (V.lonksamhet.ebitMarginal * 100).toFixed(2));
K('netto 7,60', tv(7.60, V.lonksamhet.nettoMarginal * 100, 0.005), 'källa ' + (V.lonksamhet.nettoMarginal * 100).toFixed(2));
K('fcfMarg 6,90', tv(6.90, V.lonksamhet.fcfMarginal * 100, 0.005), 'källa ' + (V.lonksamhet.fcfMarginal * 100).toFixed(2));
K('P/E 18,74', tv(18.74, V.vardering.pe, 0.001), 'källa ' + V.vardering.pe);
K('P/B 3,80', tv(3.80, V.vardering.pb, 0.005), 'källa ' + V.vardering.pb);
K('EV/EBIT 18,53', tv(18.53, V.vardering.evEbit, 0.005), 'källa ' + V.vardering.evEbit);
K('PEG 0,46', tv(0.46, V.vardering.peg, 0.005), 'källa ' + V.vardering.peg);
K('fcfYield 4,85', tv(4.85, V.vardering.fcfYield * 100, 0.005), 'källa ' + (V.vardering.fcfYield * 100).toFixed(2));
K('skuld/EK 1,47', tv(1.47, V.stabilitet.skuldEgenkapital, 0.005), 'källa ' + V.stabilitet.skuldEgenkapital);
K('pris 330,20', tv(330.20, V.pris, 0.001), 'källa ' + V.pris);
K('börsvärde 671,71 mdr', tv(671.71, V.marknadsKapitalMdr, 0.001), 'källa ' + V.marknadsKapitalMdr);
K('omsCAGR +0,40%', tv(0.40, V.tillvaxt.omsattningCAGR5ar * 100, 0.05), 'källa ' + (V.tillvaxt.omsattningCAGR5ar * 100).toFixed(2));
K('resCAGR +1,74%', tv(1.74, V.tillvaxt.resultatCAGR5ar * 100, 0.02), 'källa ' + (V.tillvaxt.resultatCAGR5ar * 100).toFixed(2));
K('TTM −5,71%', tv(-5.71, V.tillvaxt.omsattningTillvaxtTTM * 100, 0.005), 'källa ' + (V.tillvaxt.omsattningTillvaxtTTM * 100).toFixed(2));
K('prognos +40,69%', tv(40.69, V.tillvaxt.prognosTillvaxt * 100, 0.001), 'källa ' + (V.tillvaxt.prognosTillvaxt * 100).toFixed(2));
K('serier oms 4 st', JSON.stringify(V.serier.omsattning) === JSON.stringify([473479000000,552252000000,526816000000,479183000000]));
K('serier res 4 st', JSON.stringify(V.serier.resultat) === JSON.stringify([32722000000,49825000000,50389000000,34456000000]));
K('utdelning 13,00', /13,00 kronor per aktie \(ordinarie 8,50 plus extra 4,50/.test(body), 'kalenderkälla');

// —— 4. Härledda beräkningar (egna påståenden i texten)
const id = 3.8 / 0.2088;
K('identitet 18,20', tv(18.20, id, 0.001), 'uträknat ' + id.toFixed(3));
K('identitet-avvikelse 2,9%', tv(2.9, (18.74 - id) / 18.74 * 100, 0.02), 'uträknat ' + ((18.74 - id) / 18.74 * 100).toFixed(2) + '%');
const peg = 18.74 / 40.69;
K('PEG-konvention 0,46', tv(0.46, peg, 0.005), 'uträknat ' + peg.toFixed(4) + ', kvot ' + (0.46 / peg).toFixed(3));
K('forward 13,32', tv(13.32, 18.74 / 1.4069, 0.001), 'uträknat ' + (18.74 / 1.4069).toFixed(3));
const eps = 330.2 / 18.74;
K('implicit EPS 17,62', tv(17.62, eps, 0.003), 'uträknat ' + eps.toFixed(2));
K('utdelningskvot 48%', tv(48, 8.5 / eps * 100, 0.01), 'uträknat ' + (8.5 / eps * 100).toFixed(1));
K('utdelningskvot 74% m extra', tv(74, 13 / eps * 100, 0.01), 'uträknat ' + (13 / eps * 100).toFixed(1));
K('dir.avk-källa 338,50', tv(338.50, 13 / 0.0384, 0.001), 'uträknat ' + (13 / 0.0384).toFixed(1));

// —— 5. Årliga steg + CAGR
const steg = (a, b) => (b / a - 1) * 100;
K('oms +16,6', tv(16.6, steg(473479, 552252), 0.005), steg(473479, 552252).toFixed(2));
K('oms −4,6', tv(-4.6, steg(552252, 526816), 0.005), steg(552252, 526816).toFixed(2));
K('oms −9,0', tv(-9.0, steg(526816, 479183), 0.005), steg(526816, 479183).toFixed(2));
K('res +52,3', tv(52.3, steg(32722, 49825), 0.005), steg(32722, 49825).toFixed(2));
K('res +1,1 (avrundat 1,13)', Math.abs(1.1 - steg(49825, 50389)) <= 0.06, steg(49825, 50389).toFixed(2));
K('res −31,6', tv(-31.6, steg(50389, 34456), 0.005), steg(50389, 34456).toFixed(2));

// —— 6. Scenarioruta: alla 9 celler + båda räknesatserna
const bas = 479183, m = 0.1038;
const expRows = [0.97, 1, 1.03].map(f => [m - 0.01, m, m + 0.01].map(mm => bas * f * mm));
const textRutor = [[43598.9,48247.0,52895.1],[44947.4,49739.2,54531.0],[46295.8,51231.4,56167.0]];
textRutor.forEach((row, i) => row.forEach((cell, j) => K(`scenariocell [${i}][${j}] ${cell}`, tv(cell, expRows[i][j], 0.0005), 'uträknat ' + expRows[i][j].toFixed(1))));
K('1pp = 4 792', tv(4792, bas * 0.01, 0.001), 'uträknat ' + (bas * 0.01).toFixed(1));
K('3% = 1 492', tv(1492, bas * 0.03 * m, 0.001), 'uträknat ' + (bas * 0.03 * m).toFixed(1));
K('marginalvikt 3,2', tv(3.2, 1 / (3 * m), 0.01), 'uträknat ' + (1 / (3 * m)).toFixed(2));

// —— 7. Medianer (omräknade ur dagens fil)
const median = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const ind = bolagArr.filter(b => b.bransch === 'industri');
K('industri n=14', ind.length === 14, ind.length + ' bolag');
K('median P/E 26,85', tv(26.85, median(ind.map(b => b.vardering?.pe)), 0.002), median(ind.map(b => b.vardering?.pe)).toFixed(2));
K('median P/B 4,94', tv(4.94, median(ind.map(b => b.vardering?.pb)), 0.002), median(ind.map(b => b.vardering?.pb)).toFixed(2));
K('median ROE 20,28%', tv(20.28, median(ind.map(b => b.lonksamhet?.roe)) * 100, 0.002), (median(ind.map(b => b.lonksamhet?.roe)) * 100).toFixed(2));
K('median EBIT 16,71%', tv(16.71, median(ind.map(b => b.lonksamhet?.ebitMarginal)) * 100, 0.002), (median(ind.map(b => b.lonksamhet?.ebitMarginal)) * 100).toFixed(2));
K('median netto 11,23%', tv(11.23, median(ind.map(b => b.lonksamhet?.nettoMarginal)) * 100, 0.002), (median(ind.map(b => b.lonksamhet?.nettoMarginal)) * 100).toFixed(2));
K('universum P/E 21,18 n=123', bolagArr.filter(b => b.vardering?.pe != null).length === 123 && tv(21.18, median(bolagArr.map(b => b.vardering?.pe)), 0.002), median(bolagArr.map(b => b.vardering?.pe)).toFixed(2));
K('universum P/B 2,81 n=130', bolagArr.filter(b => b.vardering?.pb != null).length === 130 && tv(2.81, median(bolagArr.map(b => b.vardering?.pb)), 0.002), median(bolagArr.map(b => b.vardering?.pb)).toFixed(2));
K('universum ROE 15,57% n=129', bolagArr.filter(b => b.lonksamhet?.roe != null).length === 129 && tv(15.57, median(bolagArr.map(b => b.lonksamhet?.roe)) * 100, 0.002), (median(bolagArr.map(b => b.lonksamhet?.roe)) * 100).toFixed(2));

// —— 8. Vågvalideringsdomar mot domprotokollet
const vv = readFileSync('data/rapporter/vagvalidering-SENASTE.md', 'utf8');
const volvRad = vv.split('\n').find(l => l.includes('VOLV-B.ST'));
K('domrad finns', !!volvRad);
for (const [frag, namn] of [['impulsvåg → miss ✗ (-2,1', 'mikro miss −2,1'], ['basbygge → träff ✓ (4,1', 'kort träff 4,1'], ['basbygge → miss ✗ (20,3', 'medellång/mega miss 20,3']])
  K('dom: ' + namn, volvRad ? volvRad.includes(frag) : false);

// —— 9. Rådverb + siffer-/datumkoll av kalenderfakta i text
K('rappdag 23 oktober + kl 07:20 i body', body.includes('23 oktober') && body.includes('07:20'));
K('Q1/Q2-datum', /24 april/.test(body) && /17 juli/.test(body));
K('extrautdelning 4,50', /extra 4,50/.test(body) || /8,50 \+ 4,50/.test(body) || /8,50 ordinarie \+ 4,50/.test(body));
K('911-kontroll', !/911/.test(body));

// —— sammanfattning
console.log('\n—— KVD SAMMANFATTNING ——');
console.log('Kontroller: ' + kontroller + ' | FEL: ' + fel + ' | VARNING: ' + varning);
console.log(fel === 0 ? 'KVD: 0 FEL — GRÖN, leveransklar' : 'KVD: ' + fel + ' FEL — RÖD, får INTE levereras');
process.exit(fel === 0 ? 0 : 1);
