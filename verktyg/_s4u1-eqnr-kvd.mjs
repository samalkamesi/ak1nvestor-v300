// _s4u1-eqnr-kvd.mjs — KVD för EQNR Q3-2026-läspaketet (spår 4, s4-u1).
// Oberoende omräkning av varje beräkning i paketet + talparitet mot universumraden +
// live-medianer/rang (md5-låst) + juridikgrind + internlänkskontroll (--http mot localhost).
// Körning: node verktyg/_s4u1-eqnr-kvd.mjs [--http]
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const HTTP = process.argv.includes('--http');
const P = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-eqnr-q3-2026.json', 'utf8'));
const T = JSON.parse(readFileSync('/home/ak1a/AK1/verktyg/_s4u1-eqnr-tal.json', 'utf8'));
const { F, P: PR, BER } = T;
const body = P.body;

let PASS = 0, FEL = 0, VARN = 0;
const ok = (namn, villkor, detalj = '') => { if (villkor) { PASS++; } else { FEL++; console.log(`FEL: ${namn} ${detalj}`); } };
const varna = (namn, villkor, detalj = '') => { if (villkor) { PASS++; } else { VARN++; console.log(`VARNING: ${namn} ${detalj}`); } };
const sv = (x, dec = 2) => Number(x).toFixed(dec).replace('.', ',');
const nara = (a, b, tol = 0.005) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// ═══ 1. STRUKTUR ═══
ok('slug', P.slug === 'sa-laser-du-eqnr-q3-2026');
ok('pillar', P.pillar === 'Institutionell metodik');
ok('author', P.author === 'AK1A Research Lab');
ok('publishedAt = rappdag', P.publishedAt === PR.rappdag);
ok('readingMinutes 4-6', P.readingMinutes >= 4 && P.readingMinutes <= 6);
const H2 = body.match(/^## .*$/gm) || [];
const FORV = ['## Urvalet: varför Equinor är nästa paket i serien', '## Nyckeltalen att ha med sig — AKM2:s fyra dimensioner, energiutgåvan', '## Datavakten — fem prov på en rad som gallrats två gånger', '## Så står sig bolaget mot branschen', '## Tre sätt att läsa utfallet — övningar i metod', '## Praktiskt inför 28 oktober', '## Källor'];
ok('sju H2-sektioner i ordning', JSON.stringify(H2) === JSON.stringify(FORV), JSON.stringify(H2));
const rader = body.split('\n').filter(r => r.trim());
ok('disclaimer sista raden (kursiv)', rader[rader.length - 1].startsWith('*Detta läspaket är utbildningsmaterial'));
const ord = (body.match(/[A-Za-zÅÄÖåäö]+/g) || []).length;
ok('ordtal 2000-2800', ord >= 2000 && ord <= 2800, `${ord} ord`);
ok('title nämner grenens nionde', P.title.includes('energigrenens nionde paket'));
ok('description innehåller ny primärinsamling', P.description.includes('ny primärinsamling'));
ok('tags innehåller kvartalsrapport+Equinor', P.tags.includes('kvartalsrapport') && P.tags.includes('Equinor'));

// ═══ 2. JURIDIK ═══
const lagrum = (body.match(/2007:528/g) || []).length;
ok('exakt ett lagrum 2007:528', lagrum === 1, `${lagrum} träffar`);
const utanDisclaimer = rader[rader.length - 1] + ' | ' + (body.match(/Allt i detta paket är utbildning[^;]*;/) || [''])[0];
const radordMönster = [/rekommenderar\b/i, /\bbör du köpa\b/i, /\bköp aktien\b/i, /\bsälj aktien\b/i, /\bvi råder\b/i, /\binvestera i equinor\b/i];
ok('rådfraser 0', radordMönster.every(m => !m.test(body)));
ok('utbildningsformulering + lagrumsreferens i praktiskt-avsnitt', /utbildning om hur en delårsrapport läses — inte investeringsrådgivning/.test(body) && /2 kap 5 §/.test(body));
ok('negationsraden om rekommendationer finns (disclaimer)', /Inga köp-, sälj- eller hållningsrekommendationer förekommer/.test(body));
ok('publicering = kundens beslut (R2) i disclaimer', /publiceringen av detta paket är kundens beslut/.test(body));

// ═══ 3. TALPARITET — universumradens tvångstal i texten ═══
const paritet = [
  ['kurs 401,20', '401,20'], ['mcap 952,194', '952,194'], ['P/E 11,632', '11,632'], ['P/B 2,422', '2,422'],
  ['EV/EBIT 24,25', '24,25'], ['PEG 1,13', '1,13'], ['FCF-yield 3,09', '3,09'], ['ROE 21,27', '21,27'],
  ['ROIC 9,64', '9,64'], ['brutto 40,13', '40,13'], ['netto 7,97', '7,97'], ['skuld/EK 0,7516', '0,7516'],
  ['omsCagr 10,96', '10,96'], ['resCagr 44,02', '44,02'], ['TTM 37,4', '37,4'], ['prognos 21,81', '21,81'],
  ['serOms 150,806', '150,806'], ['serOms 107,174', '107,174'], ['serOms 103,774', '103,774'], ['serOms 106,462', '106,462'],
  ['serRes 5,043', '5,043'], ['hamtat 2026-09-03', '2026-09-03'],
];
for (const [namn, str] of paritet) ok(`paritet ${namn}`, body.includes(str));

// ═══ 4. ARITMETIK — oberoende omräkning ═══
const Q = PR.kvartal;
const A = [
  ['ident P/B÷ROE', 2.422 / 0.2127, 11.3867, sv(2.422 / 0.2127, 3)],
  ['ident gap', (11.632 - 2.422 / 0.2127) / 11.632, 0.021, sv((11.632 - 2.422 / 0.2127) / 11.632 * 100, 1) + ' procent'],
  ['EBIT-marg FY25', 25.352 / 106.462, 0.23810, null],
  ['EBIT-marg gap', (0.3611 - 25.352 / 106.462) / (25.352 / 106.462), 0.5166, null],
  ['nettoMarg FY25', 5.058 / 106.462, 0.04750, null],
  ['TTM rörelseresultat', Q.q3_25.nettoOp + Q.q4_25.nettoOp + Q.q1_26.nettoOp + Q.q2_26.nettoOp, 32.533, sv(Q.q3_25.nettoOp + Q.q4_25.nettoOp + Q.q1_26.nettoOp + Q.q2_26.nettoOp, 2)],
  ['TTM IFRS-netto', Q.q3_25.nettoIf + Q.q4_25.nettoIf + Q.q1_26.nettoIf + Q.q2_26.nettoIf, 9.05, null],
  ['mcap USD', 952.194 / 9.4568, 100.70, null],
  ['EV/EBIT nedre gräns', (952.194 / 9.4568) / (Q.q3_25.nettoOp + Q.q4_25.nettoOp + Q.q1_26.nettoOp + Q.q2_26.nettoOp), 3.0956, sv((952.194 / 9.4568) / (Q.q3_25.nettoOp + Q.q4_25.nettoOp + Q.q1_26.nettoOp + Q.q2_26.nettoOp), 2)],
  ['EBIT implicerad max', (952.194 / 9.4568) / 24.25, 4.1536, sv((952.194 / 9.4568) / 24.25, 2)],
  ['EV/EBIT gap', 1 - ((952.194 / 9.4568) / (Q.q3_25.nettoOp + Q.q4_25.nettoOp + Q.q1_26.nettoOp + Q.q2_26.nettoOp)) / 24.25, 0.8723, sv((1 - ((952.194 / 9.4568) / (Q.q3_25.nettoOp + Q.q4_25.nettoOp + Q.q1_26.nettoOp + Q.q2_26.nettoOp) / 24.25)) * 100, 0) + ' procent'],
  ['PEG konvention', 11.632 / 21.81, 0.5333, sv(11.632 / 21.81, 3)],
  ['PEG kvot', 1.13 / (11.632 / 21.81), 2.1189, sv(1.13 / (11.632 / 21.81), 2)],
  ['utdelning NOK/år', 4 * 3.6882, 14.7528, sv(4 * 3.6882, 2)],
  ['direktavkastning', (4 * 3.6882) / 419, 0.03521, sv((4 * 3.6882) / 419 * 100, 2) + ' procent'],
  ['återköpsandel', 3.0 / (952.194 / 9.4568), 0.02979, sv(3.0 / (952.194 / 9.4568) * 100, 2) + ' procent'],
  ['återköps-EPS-lyft', 1 / (1 - 3.0 / (952.194 / 9.4568)) - 1, 0.03071, sv((1 / (1 - 3.0 / (952.194 / 9.4568)) - 1) * 100, 2) + ' procent'],
  ['aktie-EPS-lyft/år', 1 / (1 - 0.0723) - 1, 0.07792, sv((1 / (1 - 0.0723) - 1) * 100, 2) + ' procent'],
  ['utdelning/år mdr', 4 * 0.39 * 2.439, 3.8048, sv(4 * 0.39 * 2.439, 3)],
  ['distributioner mdr', 4 * 0.39 * 2.439 + 3.0, 6.8048, sv(4 * 0.39 * 2.439 + 3.0, 3)],
  ['distribution/av kapex', (4 * 0.39 * 2.439 + 3.0) / 13, 0.5234, sv((4 * 0.39 * 2.439 + 3.0) / 13 * 100, 1) + ' procent'],
  ['kapex+distributioner', 13 + 4 * 0.39 * 2.439 + 3.0, 19.8048, sv(13 + 4 * 0.39 * 2.439 + 3.0, 1)],
  ['kassa årsfart', 5.5 * 4, 22, null],
  ['utdelningshöjning', 0.39 / 0.37 - 1, 0.05405, sv((0.39 / 0.37 - 1) * 100, 1) + ' procent'],
  ['aktier ur mcap', 952.194 / 401.2, 2.37336, sv(952.194 / 401.2, 4)],
  ['aktiegap', (2.439 - 952.194 / 401.2) / 2.439, 0.0268, sv((2.439 - 952.194 / 401.2) / 2.439 * 100, 1) + ' procent'],
  ['P/B gap Morningstar', (2.44 - 2.422) / 2.44, 0.00738, sv((2.44 - 2.422) / 2.44 * 100, 1) + ' procent'],
  ['serRes gap årsredovisning', (5058 - 5043) / 5058, 0.00297, sv((5058 - 5043) / 5058 * 100, 1) + ' procent'],
  ['nettoskuldfall pp', 17.8 - 10.4, 7.4, sv(17.8 - 10.4, 1)],
  ['PEG implicerad tillväxt', 11.632 / 1.13, 10.293, sv(11.632 / 1.13, 1) + ' procent'],
];
for (const [namn, ber, forv, str] of A) {
  ok(`aritmetik ${namn}`, nara(ber, forv, 0.01), `${sv(ber, 4)} mot förväntat ${forv}`);
  if (str) ok(`texttal ${namn} (${str})`, body.includes(str));
}

// ═══ 5. MEDIANER + RANG LIVE (md5-låst) ═══
const univRaw = readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8');
const md5 = createHash('md5').update(univRaw).digest('hex');
const MD5_BYGGTID = '6e540c8753d28f8b905a2aab9f15b29d';
varna('universum-md5 oförändrad sedan bygget', md5 === MD5_BYGGTID, `${md5} (om ändrad: kör om paketbyggaren)`);
const U = JSON.parse(univRaw);
const arr = Array.isArray(U) ? U : (U.bolag || U.poster || Object.values(U).find(Array.isArray));
const E = arr.filter(b => b.bransch === 'energi');
const eq = E.find(b => b.ticker === 'EQNR.OL');
const median = a => { const s = a.filter(v => v != null).sort((x, y) => x - y); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const FL = [
  ['pe', b => b.vardering?.pe, 'lag'], ['pb', b => b.vardering?.pb, 'lag'], ['evEbit', b => b.vardering?.evEbit, 'lag'],
  ['peg', b => b.vardering?.peg, 'lag'], ['fcfYield', b => b.vardering?.fcfYield, 'hog'],
  ['roe', b => b.lonksamhet?.roe, 'hog'], ['roic', b => b.lonksamhet?.roic, 'hog'],
  ['brutto', b => b.lonksamhet?.bruttoMarginal, 'hog'], ['netto', b => b.lonksamhet?.nettoMarginal, 'hog'],
  ['ebit', b => b.lonksamhet?.ebitMarginal, 'hog'], ['skuldEk', b => b.stabilitet?.skuldEgenkapital, 'lag'],
  ['ttm', b => b.tillvaxt?.omsattningTillvaxtTTM, 'hog'], ['omsCagr', b => b.tillvaxt?.omsattningCAGR5ar, 'hog'], ['resCagr', b => b.tillvaxt?.resultatCAGR5ar, 'hog'],
];
const TEXTMED = { pe: sv(17.61), pb: sv(2.2575, 4), evEbit: sv(13.475, 3), peg: sv(0.79), fcfYield: sv(5.41), roe: sv(12.75), roic: sv(11.61), brutto: sv(39.22), netto: sv(8.92), skuldEk: sv(0.5319, 4), ttm: sv(11.6, 1), omsCagr: '−7,83', resCagr: '−15,11' };
const TEXTRANG = { pe: '5 av 21', pb: '13 av 22', evEbit: '19 av 22', peg: '11 av 17', fcfYield: '16 av 22', roe: '5 av 22', roic: '14 av 22', brutto: '10 av 22', ebit: '4 av 22', skuldEk: '14 av 22', ttm: '7 av 22' };
ok(`energigrenen ${E.length} bolag`, E.length === 22 && body.includes(`energigrenen ${E.length} bolag`));
for (const [namn, fn, dir] of FL) {
  const vals = E.map(fn); const n = vals.filter(v => v != null).length; const med = median(vals); const eqv = fn(eq);
  let rang = null; if (eqv != null) { const s = [...vals.filter(v => v != null)].sort((a, b) => dir === 'lag' ? a - b : b - a); rang = s.indexOf(eqv) + 1; }
  if (TEXTMED[namn]) {
    const medTxt = namn === 'omsCagr' || namn === 'resCagr' ? (med < 0 ? '−' : '+') + sv(Math.abs(med * 100), 2) : (namn === 'fcfYield' || namn === 'roe' || namn === 'roic' || namn === 'brutto' || namn === 'netto' || namn === 'ttm' ? sv(med * 100, namn === 'ttm' ? 1 : 2) : sv(med, namn === 'pb' || namn === 'skuldEk' ? 4 : namn === 'evEbit' ? 3 : 2));
    ok(`median ${namn} = ${medTxt} i text`, medTxt === TEXTMED[namn] && body.includes(TEXTMED[namn]), `live ${medTxt} mot text ${TEXTMED[namn]}`);
  }
  if (TEXTRANG[namn]) ok(`rang ${namn} = ${TEXTRANG[namn]}`, TEXTRANG[namn] === `${rang} av ${n}`, `live ${rang} av ${n}`);
}

// ═══ 6. LÄNKAR ═══
const lnkar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const tillatna = new Set(['/dataset/energi/pe', '/dataset/energi/pb', '/dataset/energi/ev-ebit', '/dataset/energi/peg', '/dataset/energi/fcf-avkastning', '/dataset/energi/roe', '/dataset/energi/roic', '/dataset/energi/brutto-marginal', '/dataset/energi/netto-marginal', '/dataset/energi/skuldsattning', '/dataset/energi/omsattningstillvaxt-ttm', '/dataset/energi/omsattning-cagr-5ar', '/dataset/energi/resultat-cagr-5ar', '/dataset/energi/prognos-tillvaxt', '/dataset/energi/universumjamforelse']);
ok('alla internlänkar i energi-vitlistan', lnkar.every(l => tillatna.has(l)), lnkar.filter(l => !tillatna.has(l)).join(' '));
ok('minst 12 olika internlänkar', new Set(lnkar).size >= 12, `${new Set(lnkar).size}`);
ok('inga externa hyperlänkar i body', !/https?:\/\//.test(body));
if (HTTP) {
  const unika = [...new Set(lnkar)];
  let misslyckade = [];
  for (const l of unika) {
    try { const r = await fetch(`http://localhost:3000${l}`, { redirect: 'follow' }); if (r.status !== 200) misslyckade.push(`${l} → ${r.status}`); else PASS++; }
    catch (e) { misslyckade.push(`${l} → ${e.message}`); }
  }
  ok(`internlänkar 200 mot localhost (${unika.length} st)`, misslyckade.length === 0, misslyckade.join(', '));
}

// ═══ 7. SERIEORDINAL ═══
const KAT = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3';
const antal = readdirSync(KAT).filter(f => f.startsWith('sa-laser-du-') && f !== 'sa-laser-du-eqnr-q3-2026.json').length;
varna(`serieordinal (${antal + 1}:e på disk nu, paketet säger 81:e)`, body.includes(`${antal + 1}:e`) || body.includes('81:e'), 'drift dokumenteras enligt Microsoft-precedensen om syskon landar');

// ═══ 8. KÄLLKRITISKA PÅSTÅENDEN ═══
ok('gallringsdokumentation citerad (fyra >15 %)', /fyra dokumenterade källavvikelser över 15 procent/.test(body) || /fyra dokumenterade avvikelser över 15 procent/.test(body));
ok('äganderegeln citerad', /den som gör den nya primärinsamlingen äger objektet/.test(body));
ok('datumklass öppen (tredjepartskonfirmerad)', /Klassen är konfirmerat-tredjepart/.test(body) && /egen utlysning ej publicerad vid byggtid/.test(body));
ok('förlustbasåret redovisat (−0,20)', body.includes('minus 0,20 miljarder dollar i IFRS-netto'));
ok('valutabrygga redovisad (9,4568)', body.includes('9,4568') && body.includes('3,6882'));
ok('källförteckning med sökverifieringsdatum 2026-09-21', /sökverifierade 2026-09-21/.test(body));
ok('Q2-kedjans tal (11,48/3,22/1,33/1,39/4,84/12,993)', ['11,48', '3,22 mdr', '1,33', '1,39', '4,84', '12,993'].every(t => body.includes(t)));
ok('kvartalskedjan Q3-25→Q2-26 komplett', ['5,27', '5,49', '8,78', '2 130', '2 198', '2 313', '2 165'].every(t => body.includes(t)));
ok('återköpsvippan 5,0/1,5/3,0 + 2–4 mdr', ['5,0 miljarder', '1,5 miljarder', '3,0 miljarder', '2–4 miljarder'].every(t => body.includes(t)));
ok('aktieantal 2,439 + −7,2 %', body.includes('2,439 miljarder') && body.includes('7,2 procent'));

// ═══ RESULTAT ═══
console.log(`\nKVD EQNR ${HTTP ? '(--http) ' : ''}— ${PASS} PASS · ${FEL} FEL · ${VARN} VARNING`);
process.exit(FEL > 0 ? 1 : 0);
