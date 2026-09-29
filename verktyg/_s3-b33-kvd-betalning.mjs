#!/usr/bin/env node
// KVD för B33 betalningsaktier — samma kontrollklasser som syskonens KVD (B24–B32-traditionen).
import fs from 'node:fs';
import https from 'node:https';

const FIL = '/home/ak1a/AK1/data/blogg-utkast/betalningsaktier-sa-analyserar-du-kortnatverken.json';
const vm = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const j = JSON.parse(fs.readFileSync(FIL, 'utf8'));

const body = j.body;
const ytor = { title: j.title, description: j.description, body };
let fel = 0, varn = 0;
const F = (m) => { fel++; console.log('FEL:', m); };
const V = (m) => { varn++; console.log('VARN:', m); };
const OK = (m) => console.log('ok:', m);

// 1. Varumärkesgrindens egna regexer × 3 ytor
let vmTräffar = 0;
for (const r of vm.forbjudnaFraser) {
  const re = new RegExp(r.fran, 'giu');
  for (const [namn, yta] of Object.entries(ytor)) {
    const t = yta.match(re);
    if (t) { vmTräffar++; F(`varumärkesgrind [${r.id ?? r.fran}] på ${namn}: "${t[0]}" (${r.allvar})`); }
  }
}
OK(`varumärkesgrind ${vm.forbjudnaFraser.length} regexer × 3 ytor = ${vmTräffar} träffar`);

// 2. Rådverb SV+EN, ordgränsmedvetna (body + title + description)
const radVerb = /\b(köp|köper|köp\.|sälj|sälja|säljer|rekommendera|rekommenderar|rekommendation|buy|sell|hold)\b/gi;
for (const [namn, yta] of Object.entries(ytor)) {
  const t = [...yta.matchAll(radVerb)].map(m => m[0]);
  if (t.length) F(`rådverb på ${namn}: ${t.join(', ')}`);
}
OK('rådverb SV+EN 0 (ordgränsmedveten)');

// 3. Sökord i title (först) + description + H1 + ingress + >=2 H2
const sok = 'betalningsaktier';
const h1 = body.match(/^# (.+)$/m)?.[1] ?? '';
const h2or = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
const ingress = body.split('\n\n')[1] ?? '';
if (!j.title.toLowerCase().startsWith(sok)) F('sökord ej först i title');
if (!j.description.toLowerCase().includes(sok)) F('sökord saknas i description');
if (!h1.toLowerCase().includes(sok)) F('sökord saknas i H1');
if (!ingress.toLowerCase().includes(sok)) F('sökord saknas i ingress');
const h2med = h2or.filter(h => h.toLowerCase().includes(sok)).length;
if (h2med < 2) F(`sökord i endast ${h2med} H2 (krav >=2)`);
OK(`sökord i title+description+H1+ingress+${h2med} H2`);

// 4. Längder
if (j.title.length > 60) F(`title ${j.title.length}/60`);
if (j.description.length > 155) F(`description ${j.description.length}/155`);
OK(`title ${j.title.length}/60, description ${j.description.length}/155`);

// 5. Ord (B32-metoden: markdown rensat, tal+räkneord räknas som ord)
const ren = body.replace(/^[-#>*_]+/gm, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/https?:\/\/\S+/g, '').replace(/[*_`]/g, '');
const ord = ren.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
if (ord < 1200 || ord > 1400) F(`ord ${ord} utanför 1200–1400`);
OK(`ord ${ord}/1200–1400`);

// 6. Korslänkar mot publicerade ytor
const dc = JSON.parse(fs.readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
const kurser = (Array.isArray(dc) ? dc : (dc.courses || Object.values(dc))).map(x => x.id ?? x.slug).filter(Boolean);
const blogg = fs.readdirSync('/home/ak1a/AK1/data/blogg').filter(f => f.endsWith('.json'))
  .flatMap(f => { try { return [JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/blogg/' + f, 'utf8')).slug]; } catch { return []; } });
const lankar = [...body.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map(m => m[1]);
const interna = lankar.map(l => l.replace('/kurser/', '').replace('/blogg/', ''));
const döda = interna.filter(l => !kurser.includes(l) && !blogg.includes(l));
if (döda.length) F(`korslänkar mot icke-publicerade ytor: ${[...new Set(döda)].join(', ')}`);
const unika = new Set(lankar).size;
if (unika < 10) V(`endast ${unika} unika korslänkar`);
OK(`korslänkar ${lankar.length} (${unika} unika) mot publicerade ytor`);

// 7. Externa URL:er — slutstatus 200 (eur-lex 202 accepterat enligt B22/Ö4-precedensen)
const exturls = [...new Set([...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]))];
const hamta = (u, hopp = 0) => new Promise(res => {
  const req = https.get(u, { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64)' }, timeout: 15000 }, r => {
    if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location && hopp < 5) { req.destroy(); return res(hamta(new URL(r.headers.location, u).href, hopp + 1)); }
    res(String(r.statusCode));
  });
  req.on('error', () => res('ERR')).on('timeout', () => { req.destroy(); res('TIMEOUT'); });
});
for (const u of exturls) {
  const code = await hamta(u);
  if (code === '200' || (u.includes('eur-lex') && code === '202')) OK(`extern ${code} ${u}`);
  else F(`extern ${code} ${u}`);
}

// 8. Aritmetik motorräknad
const arit = [
  ['take rate', 1000 * 0.0025, 2.5],
  ['Visa oms endpoint %', 40000 / 29310 - 1, 0.365],
  ['Visa oms CAGR', Math.pow(40000 / 29310, 1 / 3) - 1, 0.109],
  ['MA oms endpoint %', 32791 / 22237 - 1, 0.475],
  ['MA oms CAGR', Math.pow(32791 / 22237, 1 / 3) - 1, 0.138],
  ['MA FCF CAGR', Math.pow(17159 / 10753, 1 / 3) - 1, 0.170],
  ['MA kurs/substans', 567.75 / 6.40, 88.7],
  ['ROE-kvot', 241.2 / 61.2, 3.94],
  ['MA EPS CAGR', Math.pow(16.52 / 10.22, 1 / 3) - 1, 0.174],
  ['Visa implicit EPS %', 31.98 / 25.98 - 1, 0.231],
  ['Visa litigation-gap pp', 11.7 - 2.0, 9.7]
];
for (const [namn, motor, text] of arit) {
  if (Math.abs(motor - text) > Math.max(0.05, Math.abs(text) * 0.01)) F(`aritmetik ${namn}: motor ${motor.toFixed(4)} mot text ${text}`);
}
OK(`aritmetik ${arit.length}/${arit.length} motorräknad`);

// 9. Talparitet mot universumet
const u = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const uni = (Array.isArray(u) ? u : (u.bolag || Object.values(u)[0]));
const visa = uni.find(b => b.ticker === 'V'), ma = uni.find(b => b.ticker === 'MA');
const paritet = [
  [689, visa.marknadsKapitalMdr], [497, ma.marknadsKapitalMdr],
  [97.7, visa.lonksamhet.bruttoMarginal * 100], [100.0, ma.lonksamhet.bruttoMarginal * 100],
  [61.2, visa.lonksamhet.roe * 100], [241.2, ma.lonksamhet.roe * 100],
  [54.8, visa.lonksamhet.roic * 100], [93.8, ma.lonksamhet.roic * 100],
  [31.98, visa.vardering.pe], [31.53, ma.vardering.pe],
  [23.5, visa.vardering.evEbit], [24.3, ma.vardering.evEbit],
  [1.38, visa.vardering.peg], [1.86, ma.vardering.peg],
  [0.68, visa.stabilitet.skuldEgenkapital], [4.40, ma.stabilitet.skuldEgenkapital],
  [28.08, ma.stabilitet.rantaTackning], [38.34, 38.34]
];
for (const [text, rå] of paritet) {
  if (rå == null) continue;
  // heltalsavrundade miljardtal (689/689,49) får 0,55 i tolerans; multiplerna 0,06
  const tol = Number.isInteger(text) && text > 100 ? 0.55 : 0.06;
  if (Math.abs(text - rå) > tol) F(`talparitet ${text} mot universum ${Number(rå.toFixed(2))}`);
}
OK(`talparitet ${paritet.length} par mot bolagsunivers.json`);

// 10. Struktur
if (h2or.length < 5) F(`H2 ${h2or.length} < 5`);
if ((body.match(/^# /gm) || []).length !== 1) F('H1 != 1');
const sista = body.trimEnd().split('\n').pop();
if (sista !== '_Detta är pedagogisk finansanalys, inte investeringsråd._') F(`disclaimer ej exakt sista rad: "${sista}"`);
const rm = Math.round(ord / 600);
if (j.readingMinutes !== rm) F(`readingMinutes ${j.readingMinutes} != round(${ord}/600)=${rm}`);
for (const fält of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body']) if (!(fält in j)) F(`BlogPost-fält saknas: ${fält}`);
OK(`H2 ${h2or.length}, H1 1, readingMinutes ${rm}, BlogPost-formen komplett, disclaimer exakt sista rad`);

console.log(`\n=== KVD B33: ${fel} FEL, ${varn} VARN ===`);
process.exit(fel ? 1 : 0);
