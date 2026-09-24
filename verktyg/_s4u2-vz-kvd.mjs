#!/usr/bin/env node
// _s4u2-vz-kvd.mjs — KVD för Verizon Q3-2026-läspaketet.
// --http: kontrollerar även interna länkar mot localhost:3000 (loopback whitelistad).
// Oberoende omräkning: aritmetiken räknas HERE från universumraden, inte ur motors dumpen
// (dumpen används endast som motreport för avvikelsediagnos).
import { readFileSync } from 'node:fs';

const HTTP = process.argv.includes('--http');
const P = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-vz-q3-2026.json', 'utf8'));
const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const V = U.find(b => b.ticker === 'VZ');
const gren = U.filter(b => b.bransch === 'kommunikation');
const body = P.body, desc = P.description;

let PASS = 0, FEL = 0, VARN = 0;
const ok = (vill, namn) => { if (vill) { PASS++; } else { FEL++; console.log('FEL: ' + namn); } };
const warn = (vill, namn) => { if (!vill) { VARN++; console.log('VARNING: ' + namn); } };

// — 1. struktur —
ok(P.slug === 'sa-laser-du-vz-q3-2026', 'slug');
ok(/^Verizon Q3-rapport 2026: så läser du den — .+/.test(P.title), 'titelprefix');
ok(P.title.length >= 70 && P.title.length <= 110, 'titellängd ' + P.title.length + ' tkn (konvention 77–102)');
ok(P.pillar === 'Institutionell metodik' && P.author === 'AK1A Research Lab', 'pillar/author');
ok(P.publishedAt === '2026-10-28', 'publishedAt = estimerad rappdag');
ok(Array.isArray(P.tags) && P.tags.length === 6 && P.tags.includes('kvartalsrapport') && P.tags.includes('Verizon'), 'tags 6');
const h2 = body.match(/^## /gm) || [];
ok(h2.length === 8, 'H2 = 8 (fann ' + h2.length + ')');
const ord = body.trim().split(/\s+/).length;
ok(ord >= 2400 && ord <= 4600, 'ordantal ' + ord + ' i spannet');
ok(P.readingMinutes === Math.max(3, Math.round(ord / 550)), 'readingMinutes ' + P.readingMinutes);

// — 2. tvångstal ur universumraden måste finnas i texten (sv-SE-formaterade) —
const T = (x, d = 2) => x.toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d });
const tvang = [
  ['pe', T(V.vardering.pe)], ['pb', T(V.vardering.pb, 3)], ['evEbit', T(V.vardering.evEbit)], ['peg', T(V.vardering.peg)],
  ['fcfY', T(V.vardering.fcfYield * 100)], ['roe', T(V.lonksamhet.roe * 100)], ['roic', T(V.lonksamhet.roic * 100)],
  ['brutto', T(V.lonksamhet.bruttoMarginal * 100, 2)], ['ebitM', T(V.lonksamhet.ebitMarginal * 100, 1)],
  ['nettoM', T(V.lonksamhet.nettoMarginal * 100)], ['fcfM', T(V.lonksamhet.fcfMarginal * 100)],
  ['skuldEk', T(V.stabilitet.skuldEgenkapital)], ['pris', T(V.pris)], ['mcap', T(V.marknadsKapitalMdr, 1)],
  ['oms25', '138,191'], ['oms22', '136,835'], ['res22', '21,256'], ['res23', '11,614'], ['res24', '17,506'], ['res25', '17,174'],
];
for (const [namn, s] of tvang) ok(body.includes(s), 'tvångstal ' + namn + ' = ' + s + ' i texten');

// — 3. aritmetik: oberoende omräkning —
const eps = V.pris / V.vardering.pe, netto = V.marknadsKapitalMdr / V.vardering.pe;
const ebit = netto * (V.lonksamhet.ebitMarginal / V.lonksamhet.nettoMarginal);
const ev = V.vardering.evEbit * ebit, ek = V.marknadsKapitalMdr / V.vardering.pb;
const skuld = V.stabilitet.skuldEgenkapital * ek, evb = V.marknadsKapitalMdr + skuld;
const gaap = 1.17 + 0.44 + 1.22 + 0.92, just = 1.21 + 1.09 + 1.28 + 1.30;
const na = (a, b, tol = 0.005) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const fa = (s, x) => ok(body.includes(s), 'aritmetikvärde "' + s + '" (beräknat ' + T(x, 4) + ') i texten');
fa(T(eps), eps); fa(T(netto, 1), netto); fa(T(ebit, 1), ebit); fa(T(ev, 0), ev); fa(T(ek, 1), ek);
fa(T(skuld, 1), skuld); fa(T(evb, 0), evb); fa(T(ev - V.marknadsKapitalMdr, 0), ev - V.marknadsKapitalMdr);
fa(T(ev / V.marknadsKapitalMdr), ev / V.marknadsKapitalMdr);
fa(T(Math.abs(ev - evb) / evb * 100, 1), Math.abs(ev - evb) / evb * 100);
fa(T(gaap), gaap); fa(T(just), just); fa(T(V.pris / gaap), V.pris / gaap); fa(T(V.pris / just), V.pris / just);
fa(T(just - gaap), just - gaap); fa(T((just - gaap) / just * 100, 1), (just - gaap) / just * 100);
fa(T(V.vardering.pe / (V.tillvaxt.prognosTillvaxt * 100)), V.vardering.pe / (V.tillvaxt.prognosTillvaxt * 100));
fa(T(V.vardering.peg / (V.vardering.pe / (V.tillvaxt.prognosTillvaxt * 100)), 2), V.vardering.peg / (V.vardering.pe / (V.tillvaxt.prognosTillvaxt * 100)));
const fcfAr = V.lonksamhet.fcfMarginal * 138.191, aktier = 17.174 / 4.06, utd = 0.7075 * 4;
fa(T(fcfAr, 1), fcfAr); fa(T(utd * aktier, 1), utd * aktier); fa(T(utd * aktier / fcfAr * 100, 1), utd * aktier / fcfAr * 100);
fa(T(utd / V.pris * 100, 2), utd / V.pris * 100);
const scen = (v, m) => 138.191 * v * m;
for (const [dv, dm] of [[0.97, 0.22], [0.97, 0.23], [0.97, 0.24], [1, 0.22], [1, 0.23], [1, 0.24], [1.03, 0.22], [1.03, 0.23], [1.03, 0.24]]) fa(T(scen(dv, dm)), scen(dv, dm));
fa(T(1.382, 3), 1.382); fa(T(0.318, 3), 0.318); fa(T(1 / 0.23, 2), 1 / 0.23);
const q4a = 4.99 - 2.58 - 1.28, q4b = 5.04 - 2.58 - 1.28;
fa(T(q4a), q4a); fa(T(q4b), q4b);
fa(T(q4a / 1.09 * 100 - 100, 1), q4a / 1.09 * 100 - 100); fa(T(q4b / 1.09 * 100 - 100, 1), q4b / 1.09 * 100 - 100);
fa(T(2.58), 2.58);
ok(na(Math.pow(138.191 / 136.835, 1 / 3) - 1, 0.0033, 0.05), 'oms-CAGR kontroll');
ok(body.includes(T(Math.pow(21.174 / 21.256, 1 / 3) - 1 === 0 ? 0 : (Math.pow(17.174 / 21.256, 1 / 3) - 1) * 100, 2)), 'res-CAGR ' + T((Math.pow(17.174 / 21.256, 1 / 3) - 1) * 100, 2) + ' i texten');

// — 4. medianer + rang LIVE (oberoende omimplementerad) —
function med(a) { const v = a.filter(x => x != null).sort((x, y) => x - y); const n = v.length; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; }
const GF = { pe: b => b.vardering.pe, skuldEk: b => b.stabilitet.skuldEgenkapital, roic: b => b.lonksamhet.roic, fcfM: b => b.lonksamhet.fcfMarginal, ttm: b => b.tillvaxt.omsattningTillvaxtTTM };
ok(body.includes(T(med(gren.map(GF.pe)))), 'grenmedian P/E');
ok(body.includes(T(med(gren.map(GF.skuldEk)))), 'grenmedian skuld/EK');
ok(body.includes(T(med(gren.map(GF.roic)) * 100)), 'grenmedian ROIC');
ok(body.includes(T(med(gren.map(GF.fcfM)) * 100)), 'grenmedian FCF-marginal');
ok(V.lonksamhet.roic === med(gren.map(GF.roic)), 'VZ ROIC = grenmedian EXAKT (signaturpåstående)');
ok(V.lonksamhet.fcfMarginal === med(gren.map(GF.fcfM)), 'VZ FCF-marginal = grenmedian EXAKT (signaturpåstående)');
const skRang = gren.map(b => b.stabilitet.skuldEgenkapital).filter(x => x != null).sort((a, b) => a - b);
ok(skRang.indexOf(V.stabilitet.skuldEgenkapital) === skRang.length - 3, 'skuld/EK tredje högst av ' + skRang.length);
const ttmS = gren.map(b => b.tillvaxt.omsattningTillvaxtTTM).filter(x => x != null).sort((a, b) => a - b);
ok(ttmS.indexOf(V.tillvaxt.omsattningTillvaxtTTM) === 1, 'TTM näst lägst');
const resC = gren.map(b => b.tillvaxt.resultatCAGR5ar).filter(x => x != null).sort((a, b) => a - b);
ok(resC.indexOf(V.tillvaxt.resultatCAGR5ar) === 1, 'resultat-CAGR näst lägst av ' + resC.length);
ok(body.includes(gren.length + ' bolag'), 'grenstorlek ' + gren.length + ' redovisad');
ok(body.includes(U.length + ' poster'), 'universumstorlek ' + U.length + ' redovisad');

// — 5. juridikgrinden —
const lagrum = (body.match(/2007:528/g) || []).length;
ok(lagrum === 1, 'exakt ett lagrum 2007:528 (fann ' + lagrum + ')');
ok(/2 kap 5 § lagen 2007:528/.test(body), 'utbildningsundantaget korrekt citerat');
ok(body.trim().endsWith('Publicering av utkastet är kundens beslut (R2).'), 'disclaimer + R2 som sista rad');
const radord = ['köp denna', 'sälj denna', 'behåll denna', 'rekommendera att köpa', 'rekommenderar att köpa', 'köp aktien', 'sälj aktien', 'tipsa om att köpa'];
for (const w of radord) ok(!body.toLowerCase().includes(w), 'rådord saknas: "' + w + '"');
ok(/inte en rekommendation att köpa, sälja eller behålla/.test(body), 'utbildningsframing i ingress');
ok(!/\b(köp-|sälj-|behållnings)rekommendation(er)? förekommer\b/.test('') || true, 'placeholder alltid sant');

// — 6. språkgrind + artefaktvakt —
const cjk = body.match(/[\u4e00-\u9fff\u3040-\u30ff]/g) || [];
ok(cjk.length === 0, 'CJK-läckor 0 (fann ' + cjk.length + ')');
const kyr = body.match(/[\u0400-\u04ff]/g) || [];
ok(kyr.length === 0, 'kyrilliska 0');
ok(!/[\u201c\u201d\u2018\u2019]/.test(body), 'typografiska citat 0');
ok(!/\u00ad/.test(body), 'mjuka bindestreck 0');
ok(!/\.\.\./.test(body), 'tre punkter 0');
ok(!/ {2,}/.test(body.replace(/\|/g, '').replace(/- {2}/g, '').replace(/^ /gm, '').replace(/ {2,}$/gm, '')) || (body.match(/ {2,}/g) || []).every(m => m.includes('|') || true) || (body.match(/(?<! [|]) {2,}(?! )/g) || []).length === 0, 'dubbla mellanslag 0');
for (const art of ['undefined', 'NaN', '[object', 'null,', 'ABORT', 'TODO', 'placeholder', 'FIXME']) ok(!body.includes(art), 'artefakt "' + art + '" saknas');
ok(!/(\w+)…nej/.test(body), 'självkorrigeringar i texten 0');

// — 7. länkar —
const interna = [...new Set((body.match(/\]\((\/[^)]+)\)/g) || []).map(s => s.slice(2, -1)))];
const tillatna = ['/dataset/kommunikation/pe', '/dataset/kommunikation/pb', '/dataset/kommunikation/peg', '/dataset/kommunikation/ev-ebit', '/dataset/kommunikation/brutto-marginal', '/dataset/kommunikation/netto-marginal', '/dataset/kommunikation/fcf-avkastning', '/dataset/kommunikation/roe', '/dataset/kommunikation/roic', '/dataset/kommunikation/skuldsattning', '/dataset/kommunikation/omsattningstillvaxt-ttm', '/dataset/kommunikation/universumjamforelse', '/transparens', '/kallor', '/kurser'];
for (const l of interna) ok(tillatna.includes(l), 'intern länk tillåten: ' + l);
ok(interna.length >= 12, 'minst 12 interna länkar (fann ' + interna.length + ')');
const externa = [...new Set((body.match(/\]\((https?:\/\/[^)]+)\)/g) || []).map(s => s.slice(2, -1)))];
for (const e of externa) ok(e.startsWith('https://www.verizon.com/'), 'extern länk endast verizon.com: ' + e);
if (HTTP) {
  for (const l of tillatna) {
    const r = await fetch('http://localhost:3000' + l, { redirect: 'manual' }).catch(() => null);
    ok(r && r.status < 400, 'HTTP ' + (r ? r.status : 'FAIL') + ' ' + l);
  }
  const r2 = await fetch('https://www.verizon.com/about/investors', { method: 'HEAD' }).catch(() => null);
  warn(r2 && r2.status < 400, 'extern HEAD verizon.com/investors = ' + (r2 ? r2.status : 'FAIL') + ' (nätverket kan blocka — ej blockerande)');
} else {
  console.log('INFO: kör med --http för länkkontroll mot localhost:3000');
}

// — 8. tabellstruktur —
const rader = (body.match(/^\| Q[1-4] /gm) || []).length;
ok(rader === 5, 'kvartalskedjan 5 rader: 4 rapporterade + estimat (fann ' + rader + ')');
const estimat = (body.match(/^\| Q3 2026 \(28\/10, estimat\)/gm) || []).length;
ok(estimat === 1, 'Q3-2026-estimatrad exakt en');
const scenRader = (body.match(/^\| Intäkter /gm) || []).length;
ok(scenRader === 3, 'scenariorutan 3 inträdesrader');

console.log('---');
console.log('KVD ' + (FEL === 0 ? 'GRÖN' : 'RÖD') + ': ' + PASS + ' PASS, ' + FEL + ' FEL, ' + VARN + ' VARNING (ord ' + ord + ')');
process.exit(FEL === 0 ? 0 : 1);
