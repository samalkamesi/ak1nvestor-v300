// _s4u2-assa-berakna.mjs — beräkningsunderlag för ASSA ABLOY Q3-2026-läspaket
// (spår 4, manifest auto-s4-1789742101501, u2). Källa: data/portfolj-system/bolagsunivers.json
// Alla tal beräknas ur filen vid körningen — inga hårdkodade källtal i skriptet.
import { readFileSync } from 'node:fs';

const U = JSON.parse(readFileSync(new URL('../data/portfolj-system/bolagsunivers.json', import.meta.url), 'utf8'));
const arr = Array.isArray(U) ? U : (U.bolag || U.universum || Object.values(U)[0]);
const A = arr.find(p => p.ticker === 'ASSA-B.ST');
const ind = arr.filter(p => p.bransch === 'industri');
const med = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); const n = s.length; return n === 0 ? null : n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const pct = x => (x * 100).toFixed(2) + ' %';
const M = x => (x / 1e6).toFixed(0) + ' Mkr'; // serierna ligger i hela kronor i filen
const rang = (v, vals) => { const s = vals.filter(x => x != null).sort((x, y) => x - y); return (s.indexOf(v) + 1) + '/' + s.length; };

const f = {
  pe: p => p.vardering?.pe, pb: p => p.vardering?.pb, evEbit: p => p.vardering?.evEbit,
  peg: p => p.vardering?.peg, fcfYield: p => p.vardering?.fcfYield,
  roe: p => p.lonksamhet?.roe, roic: p => p.lonksamhet?.roic,
  brutto: p => p.lonksamhet?.bruttoMarginal, ebit: p => p.lonksamhet?.ebitMarginal,
  netto: p => p.lonksamhet?.nettoMarginal, fcfM: p => p.lonksamhet?.fcfMarginal,
  skuldEK: p => p.stabilitet?.skuldEgenkapital,
  omsCagr: p => p.tillvaxt?.omsattningCAGR5ar, resCagr: p => p.tillvaxt?.resultatCAGR5ar,
  ttm: p => p.tillvaxt?.omsattningTillvaxtTTM, prognos: p => p.tillvaxt?.prognosTillvaxt,
};

console.log('=== UNIVERSUM & GREN');
console.log('universum n=' + arr.length + ', industri n=' + ind.length);

console.log('\n=== ASSA:FÄLT (källtalsparitet)');
for (const [k, fn] of Object.entries(f)) console.log(k.padEnd(9), fn(A) == null ? 'null' : fn(A));

console.log('\n=== SERIER + HÄRLEDADE STEG');
const [o1, o2, o3, o4] = A.serier.omsattning, [r1, r2, r3, r4] = A.serier.resultat, ar = A.serier.ar;
console.log('år', ar.join(' '));
console.log('omsättning', ...A.serier.omsattning.map(M));
console.log('resultat', ...A.serier.resultat.map(M));
const steg = (a, b) => (b / a - 1) * 100;
console.log('oms-steg %:', steg(o1, o2).toFixed(2), steg(o2, o3).toFixed(2), steg(o3, o4).toFixed(2));
console.log('res-steg %:', steg(r1, r2).toFixed(2), steg(r2, r3).toFixed(2), steg(r3, r4).toFixed(2));
console.log('nettomarginal härledd %:', ...A.serier.resultat.map((r, i) => (r / A.serier.omsattning[i] * 100).toFixed(2)));
const cagr = (a, b, n) => (Math.pow(b / a, 1 / n) - 1) * 100;
console.log('omsCAGR replikeras:', cagr(o1, o4, 3).toFixed(2), 'mot fält', pct(f.omsCagr(A)));
console.log('resCAGR replikeras:', cagr(r1, r4, 3).toFixed(2), 'mot fält', pct(f.resCagr(A)));

console.log('\n=== TTM-FÖNSTER (konvention: senaste FY × (1+TTM-tillväxt), Electrolux-precedensen)');
const ttmOms = o4 * (1 + f.ttm(A));
console.log('TTM-intäkter:', M(ttmOms), '=', M(o4), '×', (1 + f.ttm(A)).toFixed(4));
const ttmNetto = f.netto(A) * ttmOms;
console.log('TTM-netto marginalvägen:', M(ttmNetto), '=', pct(f.netto(A)), '×', M(ttmOms));
const ttmEbit = f.ebit(A) * ttmOms;
console.log('TTM-EBIT:', M(ttmEbit), '=', pct(f.ebit(A)), '×', M(ttmOms));
const ttmFcf = f.fcfM(A) * ttmOms;
console.log('TTM-FCF marginalvägen:', M(ttmFcf), '=', pct(f.fcfM(A)), '×', M(ttmOms), '(fcfYield null — envägs)');

console.log('\n=== PER-AKTIE-SPEGELN (mcap null i posten)');
const eps = A.pris / f.pe(A), bps = A.pris / f.pb(A);
console.log('EPS härledd = pris/PE =', A.pris, '/', f.pe(A), '=', eps.toFixed(3), 'kr');
console.log('BPS härledd = pris/PB =', A.pris, '/', f.pb(A), '=', bps.toFixed(3), 'kr');
console.log('EPS/BPS =', (eps / bps * 100).toFixed(2) + ' %', 'mot ROE-fält', pct(f.roe(A)), '(samma spegel som identitetstestet)');

console.log('\n=== IDENTITETSTEST P/E = P/B ÷ ROE');
const peId = f.pb(A) / f.roe(A);
console.log('P/B ÷ ROE =', f.pb(A), '/', f.roe(A), '=', peId.toFixed(3), 'mot P/E-fält', f.pe(A), '| gap', ((f.pe(A) / peId - 1) * 100).toFixed(2) + ' %');

console.log('\n=== EV-KEDJAN BAKLÄNGES (från fält till härlet kapitalstruktur)');
const ev = f.evEbit(A) * ttmEbit;
console.log('EV = EV/EBIT × TTM-EBIT =', f.evEbit(A), '×', M(ttmEbit), '=', M(ev));
// EV = mcap + skuld; mcap = PB × EK; skuld = skuld/EK × EK ⇒ EV = (PB + skuld/EK) × EK
const ekH = ev / (f.pb(A) + f.skuldEK(A));
const mcapH = f.pb(A) * ekH, skuldH = f.skuldEK(A) * ekH;
console.log('EK härlett = EV/(PB+skuld/EK) =', M(ev), '/', (f.pb(A) + f.skuldEK(A)).toFixed(3), '=', M(ekH));
console.log('mcap härledd = PB × EK =', M(mcapH), '=', (mcapH / 1e9).toFixed(1), 'mdr | skuld härledd =', M(skuldH));
const aktierH = mcapH / A.pris;
console.log('aktietal härlett = mcap/pris =', (aktierH / 1e6).toFixed(1), 'miljoner aktier (räknestorhet)');
console.log('ROE-kors på härlet EK: TTM-netto/EK =', (ttmNetto / ekH * 100).toFixed(2) + ' %', 'mot fält', pct(f.roe(A)), '| kvot', (ttmNetto / ekH / f.roe(A)).toFixed(3));
console.log('absolutkontroll på härlet mcap: P/E × TTM-netto =', M(f.pe(A) * ttmNetto), 'mot', M(mcapH), '| residual', ((f.pe(A) * ttmNetto / mcapH - 1) * 100).toFixed(2) + ' % (kedjan håller — cirkulariteten redovisas öppet)');
console.log('BPS-kors: EK härlet / aktietal =', (ekH / aktierH).toFixed(3), 'kr mot per-andel BPS', bps.toFixed(3));

console.log('\n=== UNDERLAGSDETEKTIVEN');
console.log('bokförd 2025-vinst:', M(r4), '| TTM-vittne (marginalvägen):', M(ttmNetto), '| kvot', (ttmNetto / r4).toFixed(3), '| TTM', ((ttmNetto / r4 - 1) * 100).toFixed(1) + ' % över bokfört år — vinsten stiger in i kalenderåret');

console.log('\n=== PEG');
const pegKonv = f.pe(A) / (f.prognos(A) * 100);
console.log('konvention P/E ÷ prognos =', f.pe(A), '÷', (f.prognos(A) * 100).toFixed(2), '=', pegKonv.toFixed(3), 'mot källans', f.peg(A), '| kvot', (f.peg(A) / pegKonv).toFixed(3));
console.log('källans implicita nämnare = P/E ÷ PEG =', (f.pe(A) / f.peg(A)).toFixed(2) + ' %', '— mot prognos', pct(f.prognos(A)), ', TTM', pct(f.ttm(A)), ', omsCAGR', pct(f.omsCagr(A)), ', resCAGR', pct(f.resCagr(A)));

console.log('\n=== SCENARIORUTA (bas 2025: intäkter × EBIT-marginal)');
const ebitBas = o4 * f.ebit(A);
console.log('bas-EBIT =', M(o4), '×', pct(f.ebit(A)), '=', M(ebitBas));
const rader = [o4 * 0.97, o4, o4 * 1.03], kol = [f.ebit(A) - 0.01, f.ebit(A), f.ebit(A) + 0.01];
for (const r of rader) console.log('intäkter', M(r), ':', kol.map(k => M(r * k)).join(' | '));
console.log('1 pp marginal =', M(o4 * 0.01), '| 3 % volym =', M(ebitBas * 0.03), '| marginalvikt = 1/(3×', f.ebit(A).toFixed(4), ') =', (1 / (3 * f.ebit(A))).toFixed(2));
console.log('bruttoruta (brutto', pct(f.brutto(A)), '±1 pp):');
const bk = [f.brutto(A) - 0.01, f.brutto(A), f.brutto(A) + 0.01];
for (const r of rader) console.log('intäkter', M(r), ':', bk.map(k => M(r * k)).join(' | '));
console.log('brutto: 1 pp =', M(o4 * 0.01), 'mot 3 % volym =', M(o4 * f.brutto(A) * 0.03));

console.log('\n=== MEDIANER + RANG (omräknade ur 183-filen)');
for (const [k, fn] of Object.entries(f)) {
  const vI = ind.map(fn), vA = arr.map(fn), a = fn(A);
  console.log(k.padEnd(9),
    a == null ? 'ASSA null' : 'ASSA ' + (['pe', 'pb', 'evEbit', 'peg', 'skuldEK'].includes(k) ? a.toFixed(3) : pct(a)),
    '| ind.median', vI.every(x => x == null) ? 'null' : (['pe', 'pb', 'evEbit', 'peg', 'skuldEK'].includes(k) ? med(vI).toFixed(3) : pct(med(vI))), '(n=' + vI.filter(x => x != null).length + ')',
    '| univ.median', vA.every(x => x == null) ? 'null' : (['pe', 'pb', 'evEbit', 'peg', 'skuldEK'].includes(k) ? med(vA).toFixed(3) : pct(med(vA))), '(n=' + vA.filter(x => x != null).length + ')',
    '| rang', a == null ? '—' : rang(a, vI));
}

console.log('\n=== KOSTNADSTRAPPA');
console.log('brutto → EBIT fall:', ((f.brutto(A) - f.ebit(A)) * 100).toFixed(2), 'pp | EBIT → netto fall:', ((f.ebit(A) - f.netto(A)) * 100).toFixed(2), 'pp | netto OVER EBIT? nej om positivt fall');
console.log('FCF-marginal', pct(f.fcfM(A)), 'vs netto', pct(f.netto(A)), ': FCF', ((f.fcfM(A) / f.netto(A)) * 100).toFixed(0) + ' % av netto');
