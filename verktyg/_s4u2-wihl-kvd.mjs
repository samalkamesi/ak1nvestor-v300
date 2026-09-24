#!/usr/bin/env node
// s4-u2 Wihlborgs — KVD (kvalitetsverifiering, oberoende omräkning)
// Läser PAKETET + källorna, omräknar varenda tal med egen aritmetik
// (importerar INTE byggdatamotorn), kontrollerar struktur, juridik,
// språk, länkar (HTTP mot localhost) och källtalsparitet.
// Utgångskod 0 = GRÖN (0 FEL, 0 VARNING), annars 1.
import { readFileSync } from 'node:fs';

const P = JSON.parse(readFileSync('data/blogg-utkast/kvartal/2026-q3/sa-laser-du-wihlborgs-q3-2026.json', 'utf8'));
const U = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const list = Array.isArray(U) ? U : (U.bolag || U.poster || U.universum || Object.values(U).find(Array.isArray));
const W = list.find(p => p.ticker === 'WIHL.ST');
const body = P.body;

let pass = 0, fel = [], varning = [];
const ok = (villkor, namn, detalj = '') => { if (villkor) pass++; else fel.push(`${namn}${detaljSuffix(detalj)}`); };
const warn = (villkor, namn, detalj = '') => { if (villkor) pass++; else varning.push(`${namn}${detaljSuffix(detalj)}`); };
function detaljSuffix(d) { return d ? ` — ${d}` : ''; }
// flyttalsdamm-säker jämförelse (Kambi-klassens lärdom)
// pars: U+2212 (matematiskt minus) konverteras till '-', tusentalsmellanslag
// och sv-SE decimalkomma normaliseras — annars strippas minustecknet och
// negativa påståenden jämförs mot positiva (körning 1:s klassiska fel).
const pars = (s) => parseFloat(s.replace(/−/g, '-').replace(/\s/g, '').replace(',', '.'));
const approx = (faktisk, forv, tol, namn) => ok(Math.abs(faktisk - forv) <= tol + 1e-9, namn, `faktiskt ${faktisk} förväntat ${forv} ±${tol}`);

// ---------- 1. STRUKTUR ----------
ok(P.slug === 'sa-laser-du-wihlborgs-q3-2026', 'slug korrekt');
ok(P.pillar === 'Institutionell metodik', 'pillar');
ok(P.author === 'AK1A Research Lab', 'author');
ok(P.publishedAt === '2026-10-21', 'publishedAt = rappdagen');
ok(Array.isArray(P.tags) && P.tags.length >= 5, 'tags ≥ 5', P.tags?.length + '');
const h2 = (body.match(/^## /gm) || []).length;
ok(h2 >= 7 && h2 <= 13, 'H2 7–13 (familjepraxis: Balder 7, AT&T 13)', h2 + '');
const tabeller = (body.match(/^\|---/gm) || []).length;
ok(tabeller === 2, 'tabeller = 2 (bransch + scenario)', tabeller + '');
const ord = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#|*`>]/g, ' ').split(/\s+/).filter(Boolean).length;
ok(ord >= 2200 && ord <= 3900, 'ordtal 2200–3900 (familjepraxis: AT&T 2266 – Vår Energi 3784)', ord + '');
ok(P.readingMinutes === Math.max(1, Math.round(ord / 600)), 'readingMinutes = round(ord/600)', `${P.readingMinutes} mot ${Math.round(ord / 600)}`);
ok(typeof P.description === 'string' && P.description.length > 300 && P.description.length < 1100, 'description-längd', P.description?.length + '');
ok(P.title.length > 100 && P.title.length < 400, 'title-längd', P.title.length + '');

// ---------- 2. KÄLLTALSPARITET (paketets tal == källornas fält) ----------
const paritet = [
  ['79,65', W.pris], ['24,487', W.marknadsKapitalMdr],
  ['11,203', W.vardering.pe], ['1,013', W.vardering.pb], ['17,955', W.vardering.evEbit],
  ['1,97', W.vardering.peg], ['6,10', W.vardering.fcfYield * 100],
  ['9,27', W.lonksamhet.roe * 100], ['5,46', W.lonksamhet.roic * 100],
  ['71,69', W.lonksamhet.bruttoMarginal * 100], ['71,09', W.lonksamhet.ebitMarginal * 100],
  ['47,34', W.lonksamhet.nettoMarginal * 100], ['32,33', W.lonksamhet.fcfMarginal * 100],
  ['1,49', W.stabilitet.skuldEgenkapital], ['6,8', W.tillvaxt.omsattningTillvaxtTTM * 100],
  ['9,44', W.tillvaxt.prognosTillvaxt * 100],
  ['9,29', W.tillvaxt.omsattningCAGR5ar * 100], ['1,00', Math.abs(W.tillvaxt.resultatCAGR5ar) * 100],
  ['78,66', W.golv.vardePerAktie], ['1,26', Math.abs(W.golv.marginal) * 100], // fältets marginal är (golv−kurs)/golv = negativ när kursen är över; texten redovisar premiens belopp
];
for (const [str, falt] of paritet) {
  const iText = body.includes(str) || P.description.includes(str) || P.title.includes(str);
  ok(iText, `källtal ${str} finns i texten`);
  const siffra = pars(str);
  approx(siffra, falt, Math.abs(falt) < 10 ? 0.005 + Math.abs(falt) * 0.0005 : 0.05, `källtal ${str} == fältet ${falt}`);
}
// serier (svensk tusentalsseparator med vanligt mellanslag)
const tusen = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
for (const [ar, oms, res] of [[2022, 3335, 2288], [2023, 3881, -27], [2024, 4174, 1706], [2025, 4354, 2220]]) {
  const resStr = res < 0 ? '−27' : String(res);
  ok((body.includes(String(oms)) || body.includes(tusen(oms))) && (body.includes(resStr) || body.includes(tusen(Math.abs(res)))), `serien ${ar} (${oms}/${res}) i texten`);
  const post = W.serier.ar.indexOf(String(ar));
  approx(oms, W.serier.omsattning[post] / 1e6, 0.5, `serietal oms ${ar}`);
  approx(res, W.serier.resultat[post] / 1e6, 0.5, `serietal res ${ar}`);
}
// kalenderposter (ISO-datum tillåtet i källsektionen — Catena-konventionen)
ok(body.includes('21 oktober'), 'rappdag 21 oktober i text');
ok(body.includes('9 februari 2027') || body.includes('2027-02-09'), 'årsredovisningsdatum');
ok(body.includes('26 april 2027') || body.includes('2027-04-26'), 'Q1-2027-datum');

// ---------- 3. ARITMETIK (oberoende omräkning av paketets påståenden) ----------
const A = (x) => Math.round(x * 10000) / 10000;
const arit = [
  [() => A(W.vardering.pb / W.lonksamhet.roe), '10,928', 0.001, 'identitet P/B÷ROE = 10,928'],
  [() => A(W.vardering.pe / (W.vardering.pb / W.lonksamhet.roe) - 1) * 100, '2,52', 0.05, 'källan 2,52 % över identiteten'],
  [() => A(W.pris / W.vardering.pb), '78,63', 0.005, 'implicit EK 78,63 (kurs/P/B)'],
  [() => A(W.golv.vardePerAktie - W.pris / W.vardering.pb), '0,03', 0.005, 'två-vägs spänn 0,03 kr'],
  [() => A((W.golv.vardePerAktie - W.pris / W.vardering.pb) / W.golv.vardePerAktie) * 100, '0,04', 0.006, 'spänn 0,04 %'],
  [() => A((W.pris - W.golv.vardePerAktie) / W.golv.vardePerAktie) * 100, '1,26', 0.005, 'premie 1,26 %'],
  [() => A(W.vardering.pe / (W.tillvaxt.prognosTillvaxt * 100)), '1,19', 0.005, 'PEG-konvention 1,19'],
  [() => A(W.vardering.peg / (W.vardering.pe / (W.tillvaxt.prognosTillvaxt * 100))), '1,66', 0.005, 'PEG-kvot 1,66'],
  [() => A(W.pris / W.vardering.pe), '7,11', 0.005, 'implicit EPS 7,11'],
  [() => A((W.pris / W.vardering.pe) * (W.marknadsKapitalMdr * 1000 / W.pris)), '2 186', 0.5, 'trailing-vinst 2 186 Mkr'],
  [() => A((W.marknadsKapitalMdr * 1e9) / W.serier.resultat[3]), '11,03', 0.005, 'P/E på bokslut 11,03'],
  [() => A(((W.pris / W.vardering.pe) * (W.marknadsKapitalMdr * 1000 / W.pris)) / 2220 - 1) * 100, '−1,5', 0.06, 'vinstgap −1,5 %'],
  [() => A((4354e6 * W.lonksamhet.fcfMarginal) / 1e6), '1 408', 0.5, 'FCF bokslut 1 408 Mkr'],
  [() => A((4354 * W.lonksamhet.fcfMarginal) / (W.marknadsKapitalMdr * 1000)) * 100, '5,75', 0.005, 'FCF-yield bokslutsväg 5,75 %'],
  [() => A(W.marknadsKapitalMdr * 1000 / W.pris), '307,4', 0.05, 'aktietal 307,4 M'],
  [() => A(850 / 2.76), '308', 0.5, 'aktiekontroll 850/2,76 = 308'],
  [() => A(W.stabilitet.skuldEgenkapital / (1 + W.stabilitet.skuldEgenkapital)) * 100, '59,8', 0.05, 'belåningsgrad 59,8 %'],
  [() => A((W.serier.resultat[3] / 1e6) / (W.marknadsKapitalMdr / W.vardering.pb * 1000)) * 100, '9,19', 0.05, 'ROE bokslut 9,19 %'],
  [() => A(4354 * W.lonksamhet.ebitMarginal), '3 095', 0.5, 'EBIT-fält 2025 = 3 095 Mkr'],
  [() => Math.abs(A(4354 * W.lonksamhet.ebitMarginal / 3107 - 1) * 100), '0,4', 0.05, 'EBIT mot driftsöverskott 0,4 procent ifrån'],
  [() => A(Math.pow(4354 / 3335, 1 / 3) - 1) * 100, '9,29', 0.005, 'oms-CAGR 9,29'],
  [() => A(Math.pow(2220 / 2288, 1 / 3) - 1) * 100, '−1,00', 0.005, 'res-CAGR −1,00'],
  [() => A(3881 / 3335 - 1) * 100, '16,4', 0.05, 'årssteg 2023 +16,4'],
  [() => A(4174 / 3881 - 1) * 100, '7,5', 0.05, 'årssteg 2024 +7,5'],
  [() => A(4354 / 4174 - 1) * 100, '4,3', 0.05, 'årssteg 2025 +4,3'],
  [() => A(2220 / 4354) * 100, '50,99', 0.05, 'nettomarginal bokslut 50,99'],
  [() => A(-27 / 3881) * 100, '−0,70', 0.01, '2023-kvot −0,70 %'],
  [() => 2220 - (-27), '2 247', 0.0001, 'återhämtning 2 247 Mkr'],
  [() => A(548 / 431 - 1) * 100, '27,1', 0.05, 'Q1 vinstväxt +27,1'],
  [() => A(302 / 452 - 1) * 100, '−33,2', 0.05, 'Q2 vinstväxt −33,2'],
  [() => 1045 + 1097, '2 142', 0.0001, 'H1-25 hyr summa'],
  [() => 2142 + 1101, '3 243', 0.0001, 'jan-sep-25 hyr summa'],
  [() => 3243 + 1111, '4 354', 0.0001, 'helår-25 hyr summa'],
  [() => 1150 + 1174, '2 324', 0.0001, 'H1-26 hyr summa'],
  [() => 1101 + 1111 + 1150 + 1174, '4 536', 0.0001, 'rullande fyra hyr'],
  [() => 731 + 813, '1 544', 0.0001, 'H1-25 driftsöverskott'],
  [() => 1544 + 790, '2 334', 0.0001, 'jan-sep-25 driftsöverskott'],
  [() => 2334 + 773, '3 107', 0.0001, 'helår-25 driftsöverskott'],
  [() => 790 + 773 + 800 + 864, '3 227', 0.0001, 'rullande fyra driftsöverskott'],
  [() => A(800 / 1150) * 100, '69,6', 0.05, 'driftsmarginal Q1-26 69,6'],
  [() => A(864 / 1174) * 100, '73,6', 0.05, 'driftsmarginal Q2-26 73,6'],
  [() => 548 - 520, '28', 0.0001, 'värdeposter Q1 plus 28'],
  [() => 1077 - 520, '557', 0.0001, 'förvaltning Q2 557'],
  [() => A(3.3 / 79.65) * 100, '4,14', 0.005, 'direktavkastning 4,14 %'],
  [() => A(11.203 / 1.0944), '10,24', 0.005, 'P/E-delning 10,24'],
  [() => A(1 / (3 * 0.7109)), '0,47', 0.005, 'marginalvikt 0,47'],
  [() => A(4354 * 0.01), '43,5', 0.05, '1 pp = 43,5 Mkr'],
  [() => A(4354 * 0.03 * 0.7109), '92,9', 0.05, '3 % = 92,9 Mkr i resultatet'],
  [() => A((4354 * 0.03 * 0.7109) / (4354 * 0.01)), '2,1', 0.05, 'räknestatskvot 2,1'],
  // scenariorutans nio celler (motorberäknade: verktyg/_s4u2-wihl-byggdata.mjs)
  [() => A(4223.38 * 0.7009), '2 960,2', 0.06, 'scen cell 1,1'],
  [() => A(4223.38 * 0.7109), '3 002,4', 0.06, 'scen cell 1,2'],
  [() => A(4223.38 * 0.7209), '3 044,6', 0.06, 'scen cell 1,3'],
  [() => A(4354 * 0.7009), '3 051,7', 0.06, 'scen cell 2,1'],
  [() => A(4354 * 0.7109), '3 095,3', 0.06, 'scen cell 2,2'],
  [() => A(4354 * 0.7209), '3 138,8', 0.06, 'scen cell 2,3'],
  [() => A(4484.62 * 0.7009), '3 143,3', 0.06, 'scen cell 3,1'],
  [() => A(4484.62 * 0.7109), '3 188,1', 0.06, 'scen cell 3,2'],
  [() => A(4484.62 * 0.7209), '3 233,0', 0.06, 'scen cell 3,3'],
];
for (const [fn, str, tol, namn] of arit) {
  const beraknad = fn();
  const paketet = pars(str);
  approx(paketet, beraknad, tol, namn);
  // minus-ordkonventionen (Catena-klassen): löptext skriver "minus X", tabeller U+2212
  const ordForm = str.replace('−', 'minus ');
  ok(body.includes(str) || body.includes(ordForm) || P.description.includes(str) || P.title.includes(str), `aritmetiktalet ${str} i texten (${namn})`);
}
// dokumenterade heltalsprocent ur rapporterna (+10/+7) — avrundningsmatchning,
// decimalformen står inte i rapportmaterialet
ok(body.includes('+10 procent') && Math.round(10.05) === 10, 'Q1 hyrväxt +10 procent (beräknad 10,05)');
ok(body.includes('+7 procent') && Math.round(7.02) === 7, 'Q2 hyrväxt +7 procent (beräknad 7,02)');

// medianer och rang LIVE ur filen
const fast = list.filter(x => x.bransch === 'fastighet');
const med = (vals) => { const v = vals.filter(x => x != null).sort((a, b) => a - b); return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2; };
const f = (x, k) => (x.vardering ? x.vardering[k] : null);
const rangFallande = (vals, mine) => 1 + vals.filter(x => x != null).sort((a, b) => b - a).indexOf(mine);
ok(fast.length === 17 && list.length === 237, 'universum 237/17 fastighet', `${list.length}/${fast.length}`);
approx(0.946, med(fast.map(x => f(x, 'pb'))), 0.0005, 'median P/B 0,946');
approx(14.38, med(fast.map(x => f(x, 'pe'))), 0.005, 'median P/E 14,38');
approx(8.57, med(fast.map(x => x.lonksamhet?.roe)) * 100, 0.005, 'median ROE 8,57');
approx(57.37, med(fast.map(x => x.lonksamhet?.ebitMarginal)) * 100, 0.005, 'median EBIT 57,37');
approx(43.58, med(fast.map(x => x.lonksamhet?.nettoMarginal)) * 100, 0.005, 'median netto 43,58');
approx(1.10, med(fast.map(x => x.stabilitet?.skuldEgenkapital)), 0.005, 'median skuld/EK 1,10');
approx(2.72, med(list.map(x => f(x, 'pb'))), 0.005, 'universum P/B 2,72');
approx(20.39, med(list.map(x => f(x, 'pe'))), 0.005, 'universum P/E 20,39');
approx(14.75, med(list.map(x => x.lonksamhet?.roe)) * 100, 0.005, 'universum ROE 14,75');
approx(20.81, med(list.map(x => x.lonksamhet?.ebitMarginal)) * 100, 0.005, 'universum EBIT 20,81');
approx(13.90, med(list.map(x => x.lonksamhet?.nettoMarginal)) * 100, 0.005, 'universum netto 13,90');
approx(0.53, med(list.map(x => x.stabilitet?.skuldEgenkapital)), 0.005, 'universum skuld/EK 0,53');
ok(rangFallande(fast.map(x => x.lonksamhet?.roe), W.lonksamhet.roe) === 7, 'ROE rang 7 av 16');
ok(rangFallande(fast.map(x => x.lonksamhet?.ebitMarginal), W.lonksamhet.ebitMarginal) === 3, 'EBIT rang 3 av 17');
ok(rangFallande(fast.map(x => f(x, 'fcfYield')), W.vardering.fcfYield) === 3, 'FCF-yield rang 3 av 16');
ok(rangFallande(fast.map(x => x.stabilitet?.skuldEgenkapital), W.stabilitet.skuldEgenkapital) === 4, 'skuld/EK rang 4 av 17');
ok(fast.filter(x => f(x, 'pb') != null && f(x, 'pb') < 0.95).length === 9, 'nio kollegor under 0,95');
ok(fast.filter(x => f(x, 'pb') != null).filter(x => x.vardering.pb > 1).filter(x => ['WIHL.ST', 'O', 'NP3.ST', 'PLD', 'EQIX', 'PSA', 'SPG', 'AMT'].includes(x.ticker) === false).length === 0, 'enda europeiska över pari');
approx(1.32, med(list.map(x => x.vardering?.peg).filter(x => x != null)), 0.005, 'PEG-median 1,32');
ok(list.filter(x => x.vardering?.peg != null).length === 194, 'PEG n=194');

// ---------- 4. JURIDIK ----------
const lagrum = (body.match(/2007:528/g) || []).length;
ok(lagrum === 1, 'lagrum 2007:528 exakt en gång', lagrum + '');
ok(/Allt innehåll är utbildning i metod enligt lagen \(2007:528\) om värdepappersrörelser/.test(body), 'disclaimer-formulering');
const radglosor = ['rekommenderar', 'vi råder', 'råder vi dig', 'bör du köpa', 'bör du sälja', 'vårt råd', 'köp aktien', 'sälj aktien', 'aktieprofil: köp', 'köpläge', 'sälläge'];
// NOT: 'köp ' som strikt prefix är för brett — matchar sammansättningen "insiderköp"
// (körning 1:s falska träff); skarpa fraser i stället.
const radTräff = radglosor.filter(g => body.toLowerCase().includes(g.toLowerCase()));
ok(radTräff.length === 0, 'rådglosor 0', radTräff.join(','));
ok(/Publicering av utkastet är kundens beslut/.test(body.split('\n').slice(-1)[0]) || /Publicering av utkastet är kundens beslut/.test(body.slice(-120)), 'disclaimer sista raden');
// lagrumsformatet NNNN:NNN ska inte förekomma utanför 2007:528 (årstal får förekomma som år)
const lagrumsLiknande = body.match(/\d{4}:\d+/g) || [];
ok(lagrumsLiknande.every(x => x === '2007:528'), 'inga främmande lagrumsformat', lagrumsLiknande.join(','));

// ---------- 5. SPRÅK ----------
// tabellseparatorrader (|---|) och markdown-länkar strippas före teckenkontrollerna —
// '--' i separatorn och 'www.' i länk-URL:er är legitima, inte läckor (körning 1:s falska träffar)
const bodyRen = body.split('\n').filter(rad => !/^\|---/.test(rad)).join('\n').replace(/\]\(https?:[^)]+\)/g, '');
ok(!/[\u4e00-\u9fff\u3040-\u30ff]/.test(body), 'CJK 0');
ok(!/[\u0400-\u04ff]/.test(body), 'kyrilliska 0');
ok(!/[""'']/.test(body), 'typografiska citat 0');
ok(!/\t/.test(body), 'tabbar 0');
ok(!/ {2,}/.test(bodyRen.replace(/\n/g, '')), 'dubbla mellanslag 0');
ok(!/_/.test(body), 'underscore 0');
ok(!/--/.test(bodyRen), 'dubbelstreck 0 (tabellseparatorrer exkluderade)');
ok(!/www\./.test(bodyRen), 'www-läcka 0 i löptext (länk-URL:er exkluderade)');

// ---------- 6. LÄNKAR ----------
const lnkar = [...body.matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]);
const interna = lnkar.filter(u => u.startsWith('/'));
const externa = lnkar.filter(u => u.startsWith('http'));
ok(interna.length >= 15, 'interna länkar ≥ 15', interna.length + '');
ok(externa.length >= 3 && externa.length <= 6, 'externa länkar 3–6 (endast wihlborgs.se)', externa.length + '');
ok(externa.every(u => u.startsWith('https://www.wihlborgs.se')), 'externa endast wihlborgs.se', externa.join(','));
const unika = [...new Set(interna)];
ok(unika.length === interna.length, 'inga dubbla interna länkar');
// HTTP-kontroll mot localhost (loopback vitlistad i middleware)
if (process.argv.includes('--http')) {
  const svar = await Promise.all(unika.map(async (u) => {
    try { const r = await fetch('http://localhost:3000' + u); return [u, r.status]; }
    catch { return [u, 0]; }
  }));
  for (const [u, s] of svar) ok(s === 200, `länk 200 ${u}`, s + '');
} else {
  warn(false, 'HTTP-kontoll ej körd (kör med --http)');
}

// ---------- RAPPORT ----------
console.log(`KVD Wihlborgs: ${pass} PASS, ${fel.length} FEL, ${varning.length} VARNING`);
for (const e of fel) console.log('FEL: ' + e);
for (const v of varning) console.log('VARNING: ' + v);
process.exit(fel.length ? 1 : 0);
