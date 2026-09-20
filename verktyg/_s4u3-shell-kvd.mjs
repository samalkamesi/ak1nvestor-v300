// _s4u3-shell-kvd.mjs — KVD för Shell Q3-läspaketet (s4-u3, manifest auto-s4-1789908909779)
// Kontrollerar: struktur, källtalsparitet (universumrad + sökverifierade Q2-tal),
// aritmetikmotor (avrundningstolerans ±0,5 på sista siffran), medianer/rang live ur
// data/portfolj-system/bolagsunivers.json, juridikgrind (2007:528 exakt 1, rådmönster 0),
// internlänkar HTTP 200 mot localhost. GRÖN = 0 FEL 0 VARNING.
import { readFileSync } from 'node:fs';

const paket = JSON.parse(readFileSync(
  new URL('../data/blogg-utkast/kvartal/2026-q3/sa-laser-du-shell-q3-2026.json', import.meta.url), 'utf8'));
import { createHash } from 'node:crypto';
const uniRaw = readFileSync(new URL('../data/portfolj-system/bolagsunivers.json', import.meta.url));
const uni = JSON.parse(uniRaw);
console.log('universumfilens md5 (snapshot för denna kontroll): ' + createHash('md5').update(uniRaw).digest('hex'));
const b = paket.body;
let PASS = 0, FEL = 0, VARN = 0;
const fel = (m) => { FEL++; console.log('  FEL: ' + m); };
const varn = (m) => { VARN++; console.log('  VARNING: ' + m); };
const pass = (m) => PASS++;
const ok = (cond, m) => (cond ? pass() : fel(m));

// ---------- 1. Struktur ----------
console.log('1. Struktur');
ok(paket.slug === 'sa-laser-du-shell-q3-2026', 'slug');
ok(paket.author === 'AK1A Research Lab' && paket.pillar === 'Institutionell metodik', 'author/pillar');
ok(paket.publishedAt === '2026-10-29', 'publishedAt = rappdagen');
const ord = b.split(/\s+/).length;
ok(ord >= 2300 && ord <= 3900, `ord ${ord} i spannet 2300–3900`);
ok(paket.readingMinutes === Math.round(ord / 600), `readingMinutes ${paket.readingMinutes} = round(${ord}/600)`);
ok(paket.description.length >= 400 && paket.description.length <= 727, `description ${paket.description.length} tecken`);
ok(Array.isArray(paket.tags) && paket.tags.length >= 5 && paket.tags.includes('Shell'), 'tags');
const h2 = [...b.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
ok(h2.length === 7, `7 H2-rubriker (fann ${h2.length})`);
ok(h2[0].startsWith('Urvalet') && h2[1].startsWith('Nyckeltalen') && h2[2].startsWith('Datavakten')
  && h2[3].startsWith('Så står sig') && h2[4].startsWith('Tre sätt') && h2[5].startsWith('Praktiskt')
  && h2[6] === 'Källor', 'H2-ordning enligt seriens mall');
const sistaStycke = b.trim().split(/\n\n/).pop();
ok(sistaStycke.startsWith('*') && sistaStycke.endsWith('*')
  && sistaStycke.includes('inte investeringsrådgivning')
  && sistaStycke.includes('publiceringen av detta paket är kundens beslut'), 'kursiv disclaimer exakt sista stycket');
const provnamn = [...b.matchAll(/\*\*Prov (\d): ([^*]+)\*\*/g)].map((m) => m[1]);
ok(provnamn.length === 5, `fem namngivna datavaktsprov (fann ${provnamn.length})`);

// ---------- 2. Källtalsparitet ----------
console.log('2. Källtalsparitet (tal i bodyn mot källmängderna)');
const sh = (Array.isArray(uni) ? uni : uni.lista).find((x) => x.ticker === 'SHEL');
ok(!!sh, 'SHEL-rad i universumfilen');
ok(sh.hamtat === '2026-09-03', 'universumradens hämtdatum');
const en = (Array.isArray(uni) ? uni : uni.lista).filter((x) => x.bransch === 'energi');
const median = (f) => { const v = en.map(f).filter((x) => x !== null && x !== undefined); v.sort((a, c) => a - c); const m = v.length >> 1; return [v.length ? (v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2) : null, v.length]; };
const rang = (f, desc) => { const v = en.map(f).filter((x) => x !== null && x !== undefined).sort((a, c) => (desc ? c - a : a - c)); const mine = f(sh); return [v.indexOf(mine) + 1, v.length]; };
const num = (x, dec) => x.toFixed(dec).replace('.', ',').replace('-', '−');
const falt = [
  ['pris', sh.pris, 2], ['mcap', sh.marknadsKapitalMdr, 3],
  ['pe', sh.vardering.pe, 3], ['pb', sh.vardering.pb, 2], ['evEbit', sh.vardering.evEbit, 3],
  ['peg', sh.vardering.peg, 2], ['fcfY %', sh.vardering.fcfYield * 100, 2],
  ['roe %', sh.lonksamhet.roe * 100, 2], ['roic %', sh.lonksamhet.roic * 100, 2],
  ['brutto %', sh.lonksamhet.bruttoMarginal * 100, 2], ['ebit %', sh.lonksamhet.ebitMarginal * 100, 2],
  ['netto %', sh.lonksamhet.nettoMarginal * 100, 2], ['fcfm %', sh.lonksamhet.fcfMarginal * 100, 2],
  ['skuldEK', sh.stabilitet.skuldEgenkapital, 3],
  ['omsCAGR %', sh.tillvaxt.omsattningCAGR5ar * 100, 2], ['resCAGR %', sh.tillvaxt.resultatCAGR5ar * 100, 2],
  ['ttm %', sh.tillvaxt.omsattningTillvaxtTTM * 100, 1], ['prognos %', sh.tillvaxt.prognosTillvaxt * 100, 2],
  ['oms22', sh.serier.omsattning[0] / 1e9, 3], ['oms23', sh.serier.omsattning[1] / 1e9, 3],
  ['oms24', sh.serier.omsattning[2] / 1e9, 3], ['oms25', sh.serier.omsattning[3] / 1e9, 3],
  ['res22', sh.serier.resultat[0] / 1e9, 3], ['res24', sh.serier.resultat[2] / 1e9, 3], ['res25', sh.serier.resultat[3] / 1e9, 3],
];
for (const [namn, v, dec] of falt) {
  const s = num(v, dec);
  ok(b.includes(s), `universumfält ${namn} = ${s} finns i bodyn`);
}
const sok = ['0,3906', '0,7812', '0,3366', '28,92', '21 september', '9,84', '4,26', '6,92', '41,8', '52,6',
  '8,4', '24–26', '21 miljarder', '3,0 miljarder', '1,2 miljarder', '4,2 miljarder', '2 523', '354',
  '29 oktober', '07:00 GMT', '30 juli', 'cirka 9 procent'];
for (const s of sok) ok(b.includes(s), `sökverifierat tal "${s}" finns i bodyn`);

// ---------- 3. Aritmetikmotor ----------
console.log('3. Aritmetikmotor (omräkning med avrundningstolerans)');
const motor = [
  ['P/B÷ROE', sh.vardering.pb / sh.lonksamhet.roe, '9,97', 'identitetstestets P/E-bakväg'],
  ['gap identitet', (sh.vardering.pe / (sh.vardering.pb / sh.lonksamhet.roe) - 1) * 100, '2,9', 'gap mot P/E-fältet'],
  ['EK = mcap/PB', sh.marknadsKapitalMdr / sh.vardering.pb, '178,464', 'härlett bokfört kapital'],
  ['aktier = mcap/kurs', sh.marknadsKapitalMdr / sh.pris, '2,7500', 'härlett aktieantal'],
  ['BVPS = EK/aktier', (sh.marknadsKapitalMdr / sh.vardering.pb) / (sh.marknadsKapitalMdr / sh.pris), '64,90', 'bokfört värde per aktie'],
  ['kurs/BVPS', sh.pris / ((sh.marknadsKapitalMdr / sh.vardering.pb) / (sh.marknadsKapitalMdr / sh.pris)), '1,430', 'P/B tredje vägen'],
  ['netto­skuld/EK', 41.8 / (sh.marknadsKapitalMdr / sh.vardering.pb), '0,234', 'nettoskuldsvikt'],
  ['direktavkastning', (4 * 0.3906 / sh.pris) * 100, '1,68', '4×0,3906 ÷ kurs'],
  ['återköp % av bolaget', (4.2 / sh.marknadsKapitalMdr) * 100, '1,65', '4,2 ÷ mcap'],
  ['EPS-mekanik', (1 / (1 - 4.2 / sh.marknadsKapitalMdr) - 1) * 100, '1,67', '1÷(1−x)−1'],
  ['halv takt %', (2.1 / sh.marknadsKapitalMdr) * 100, '0,82', '2,1 ÷ mcap'],
  ['halv takt EPS', (1 / (1 - 2.1 / sh.marknadsKapitalMdr) - 1) * 100, '0,83', 'halv takt mekanik'],
  ['vinstavkastning', (1 / sh.vardering.pe) * 100, '9,74', '1 ÷ P/E'],
  ['EBIT-avkastning', (1 / sh.vardering.evEbit) * 100, '16,4', '1 ÷ EV/EBIT'],
  ['EBIT/netto-kvot', (1 / sh.vardering.evEbit) / (1 / sh.vardering.pe), '1,69', 'diskontkvot'],
  ['utdelning/kvartal', 0.3906 * (sh.marknadsKapitalMdr / sh.pris), '1,0742', '0,3906 × aktieantal'],
  ['payout %', (0.3906 * (sh.marknadsKapitalMdr / sh.pris)) / 9.84 * 100, '10,9', 'utdelning av Q2-vinst'],
  ['utdelning/år', 4 * 0.3906 * (sh.marknadsKapitalMdr / sh.pris), '4,297', '4 × kvartal'],
  ['återlämnat 2026', 4 * 0.3906 * (sh.marknadsKapitalMdr / sh.pris) + 4.2, '8,497', 'utdelning + återköp'],
  ['omsättningsglidning', (sh.serier.omsattning[3] / sh.serier.omsattning[0] - 1) * 100, 'minus 30,0', '2025/2022−1 (bodyn skriver med ord)'],
  ['resultatvändning', (sh.serier.resultat[3] / sh.serier.resultat[2] - 1) * 100, 'plus 10,8', '2025/2024−1 (bodyn skriver med ord)'],
  ['Q2-vändning', (9.84 / 4.26 - 1) * 100, '131', '9,84/4,26−1'],
  ['P/E-rabatt', (sh.vardering.pe / median((x) => x.vardering.pe)[0] - 1) * 100, '40,7', 'P/E mot live-median (bodyn: "40,7 procent under")'],
  ['EV-rabatt', (sh.vardering.evEbit / median((x) => x.vardering.evEbit)[0] - 1) * 100, 'minus 54,7', 'EV/EBIT mot live-median (bodyn skriver med ord)'],
  ['PEG-implierad', sh.vardering.pe / sh.vardering.peg, '6,5', 'P/E ÷ PEG'],
];
for (const [namn, v, s, motiv] of motor) {
  const dec = (s.split(',')[1] || '').replace(/[^0-9]/g, '').length;
  const tol = 0.5 * Math.pow(10, -dec) + 1e-9;
  const pv = parseFloat(s.replace(/,/g, '.').replace(/−/g, '-').replace(/^minus /, '-').replace(/^plus /, '+'));
  if (Number.isNaN(pv)) { fel(`${namn}: kunde inte tolka text "${s}"`); continue; }
  // Textriktning: teckenlöst tal = belopp (bodyn bär riktningen i orden, t.ex. "40,7 procent under");
  // "minus X"/"plus X" = signerat. Motiverat: seriens svenska formuleringkonvention.
  const signed = /^(−|-|minus |plus )/.test(s.trim());
  const target = signed ? v : Math.abs(v);
  ok(Math.abs(target - pv) <= tol, `${namn}: motor ${v.toFixed(6)} mot text "${s}" (motiv: ${motiv})`);
  ok(b.includes(s), `${namn}: texten "${s}" finns i bodyn`);
}

// ---------- 4. Medianer och rang live ----------
console.log('4. Medianer och rang (live ur universumfilen, energigrenen)');
const medTXT = [
  ['P/E-median 17,3125/17,31', median((x) => x.vardering.pe), [[17.3125, 20]]],
  ['P/B-median 2,275/2,28', median((x) => x.vardering.pb), [[2.275, 21]]],
  ['EV/EBIT-median 13,44', median((x) => x.vardering.evEbit), [[13.44, 21]]],
  ['PEG-median 0,74', median((x) => x.vardering.peg), [[0.74, 16]]],
  ['fcfY-median 5,53', median((x) => x.vardering.fcfYield), [[0.0553, 21]]],
  ['ROE-median 12,91', median((x) => x.lonksamhet.roe), [[0.1291, 21]]],
  ['ROIC-median 11,63', median((x) => x.lonksamhet.roic), [[0.1163, 21]]],
  ['bruttomedian 39,42', median((x) => x.lonksamhet.bruttoMarginal), [[0.3942, 21]]],
  ['skuldmedian 0,56', median((x) => x.stabilitet.skuldEgenkapital), [[0.56, 21]]],
  ['TTM-median 12,0', median((x) => x.tillvaxt.omsattningTillvaxtTTM), [[0.12, 21]]],
];
for (const [namn, [mv, n], [[ev, en_]]] of medTXT) {
  ok(Math.abs(mv - ev) < 1e-9 && n === en_, `${namn} (live ${mv}/${n})`);
}
const rangTXT = [
  ['P/E 3 av 20', rang((x) => x.vardering.pe, false), [3, 20], '3 av 20'],
  ['P/B 4 av 21', rang((x) => x.vardering.pb, false), [4, 21], '4 av 21'],
  ['EV/EBIT 3 av 21', rang((x) => x.vardering.evEbit, false), [3, 21], '3 av 21'],
  ['fcfY 6 av 21', rang((x) => x.vardering.fcfYield, true), [6, 21], '6 av 21'],
  ['ROE 8 av 21', rang((x) => x.lonksamhet.roe, true), [8, 21], '8 av 21'],
  ['ROIC 4 av 21', rang((x) => x.lonksamhet.roic, true), [4, 21], '4 av 21'],
  ['brutto 17 av 21', rang((x) => x.lonksamhet.bruttoMarginal, true), [17, 21], '17 av 21'],
  ['skuld 5 av 21', rang((x) => x.stabilitet.skuldEgenkapital, false), [5, 21], '5 av 21'],
];
for (const [namn, [r, n], [er, en_], txt] of rangTXT) {
  ok(r === er && n === en_ && b.includes(txt), `${namn} (live ${r}/${n}) + texten "${txt}"`);
}
ok(b.includes('tolfte plats'), 'netto rang tolfte plats (12 av 21) i text');

// ---------- 5. Juridikgrind ----------
console.log('5. Juridikgrind');
const lagrum = (b.match(/2007:528/g) || []).length;
ok(lagrum === 1, `exakt ett lagrum 2007:528 (fann ${lagrum})`);
ok(b.includes('2 kap 5 §'), 'lagrummets paragraf');
// Rådverb: fristående köp/sälj/rekommendation. Notera motiv: "återköp", "insiderköp",
// "återköpsprogram*" är sammansättningar och skall INTE trigga (\b kräver ordgräns);
// "köper råolja" (företagets inköp) är inte rådgivning och hålls utanför mönstret med vilja.
// Disclaimerns standardnekande "Inga köp-, sälj- eller hållningsrekommendationer" strippas
// före matchning: det är en utsaga OM avsaknaden av råd, inte ett råd (seriens konvention).
const bUtanNekande = b.replace(/Inga köp-, sälj- eller hållningsrekommendationer/g, '');
const rad = bUtanNekande.match(/\b(köp|sälj|sälja|rekommenderar|rekommendera)\b/g) || [];
ok(rad.length === 0, `rådmönster 0 (fann ${JSON.stringify(rad)})`);
ok((b.match(/investeringsrådgivning/g) || []).length >= 2, 'utbildningsformulering närvarande');

// ---------- 6. Internlänkar ----------
console.log('6. Internlänkar mot localhost');
const links = [...new Set([...b.matchAll(/\]\((\/dataset\/energi\/[a-z0-9-]+)\)/g)].map((m) => m[1]))];
ok(links.length >= 14, `minst 14 dataset-länkar (fann ${links.length})`);
for (const l of links) {
  try {
    const r = await fetch('http://localhost:3000' + l, { method: 'GET' });
    ok(r.status === 200, `${l} → ${r.status}`);
  } catch (e) {
    fel(`${l} kunde inte hämtas: ${e.message}`);
  }
}

// ---------- 7. Inga förbjudna ytor i paketet ----------
console.log('7. Spårregler');
ok(!JSON.stringify(paket).includes('data/blogg/'), 'ingen live-sökväg i paketet');
ok(paket.tags.every((t) => !/pris|tier|publicer/i.test(t)), 'inga R2-ord i tags');

console.log(`\nKVD SLUT: ${PASS} PASS, ${FEL} FEL, ${VARN} VARNING`);
process.exit(FEL + VARN > 0 ? 1 : 0);
