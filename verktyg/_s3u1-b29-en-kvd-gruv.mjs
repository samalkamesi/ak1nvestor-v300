#!/usr/bin/env node
// KVD för B29-en gruvaktier-en — engelsk spegel av B29 (översättningsklassen, Ö14/Ö22/Ö26-traditionen).
import fs from 'node:fs';
import https from 'node:https';

const FIL = '/home/ak1a/AK1/data/blogg-utkast/gruvaktier-sa-analyserar-du-gruvbolag-en.json';
const ORIG = '/home/ak1a/AK1/data/blogg-utkast/gruvaktier-sa-analyserar-du-gruvbolag.json';
const vm = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const j = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const o = JSON.parse(fs.readFileSync(ORIG, 'utf8'));

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
const sok = 'mining stocks';
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

// 5. Ord (B32-metoden: markdown rensat, URL:er borta, ord = innehåller bokstav/siffra)
const ren = (s) => s.replace(/^[-#>*_]+/gm, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/https?:\/\/\S+/g, '').replace(/[*_`]/g, '');
const ord = ren(body).split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
if (ord < 1200 || ord > 1400) F(`ord ${ord} utanför 1200–1400`);
OK(`ord ${ord}/1200–1400`);

// 6. Korslänkar: MULTISET-identiska med originalet + mot publicerade ytor
const lankLista = (s) => [...s.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map(m => m[1]);
const mina = lankLista(body), origs = lankLista(o.body);
const sort = (a) => [...a].sort().join('|');
if (sort(mina) !== sort(origs)) {
  F(`korslänkar ej MULTISET-identiska med originalet (EN ${mina.length}, SV ${origs.length})`);
  const mSet = new Set(mina), oSet = new Set(origs);
  for (const l of oSet) if (!mSet.has(l)) console.log('  saknas i EN:', l);
  for (const l of mSet) if (!oSet.has(l)) console.log('  extra i EN:', l);
} else OK(`korslänkar ${mina.length} MULTISET-identiska med originalet`);
const dc = JSON.parse(fs.readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
const kurser = (Array.isArray(dc) ? dc : (dc.courses || Object.values(dc))).map(x => x.id ?? x.slug).filter(Boolean);
const blogg = fs.readdirSync('/home/ak1a/AK1/data/blogg').filter(f => f.endsWith('.json'))
  .flatMap(f => { try { return [JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/blogg/' + f, 'utf8')).slug]; } catch { return []; } });
const interna = mina.map(l => l.replace('/kurser/', '').replace('/blogg/', ''));
const döda = interna.filter(l => !kurser.includes(l) && !blogg.includes(l));
if (döda.length) F(`korslänkar mot icke-publicerade ytor: ${[...new Set(döda)].join(', ')}`);
else OK(`korslänkar ${mina.length} (${new Set(mina).size} unika) mot publicerade ytor`);

// 7. Externa URL:er — identiska uppsättning med originalet + slutstatus 200 (redirect följs)
const extLista = (s) => [...new Set([...s.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]))];
const minaExt = extLista(body), origExt = extLista(o.body);
if (sort(minaExt) !== sort(origExt)) F(`externa URL:er ej identiska med originalet (${minaExt} mot ${origExt})`);
else OK(`externa URL:er ${minaExt.length} identiska med originalet`);
const hamta = (u, hopp = 0) => new Promise(res => {
  const req = https.get(u, { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64)' }, timeout: 15000 }, r => {
    if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location && hopp < 5) { req.destroy(); return res(hamta(new URL(r.headers.location, u).href, hopp + 1)); }
    res(String(r.statusCode));
  });
  req.on('error', () => res('ERR')).on('timeout', () => { req.destroy(); res('TIMEOUT'); });
});
for (const u of minaExt) {
  const code = await hamta(u);
  if (code === '200') OK(`extern ${code} ${u}`);
  else F(`extern ${code} ${u}`);
}

// 8. Aritmetik motorräknad (originalets 22-klass, motor mot text med tolerans)
const arit = [
  [' halt 1.0% => 100 ton', 1 / 0.01, 100],
  ['100 ton x 40 = 4000', 100 * 40, 4000],
  ['halt 2.0% => 50 ton', 1 / 0.02, 50],
  ['50 ton x 40 = 2000', 50 * 40, 2000],
  ['marginal nord 4.00-1.60', 4.00 - 1.60, 2.40],
  ['marginal hoegfjaell 4.00-2.80', 4.00 - 2.80, 1.20],
  ['haevstaang nord 4.00/2.40', 4.00 / 2.40, 1.67],
  ['haevstaang hoegfjaell 4.00/1.20', 4.00 / 1.20, 3.33],
  ['pris +10% => 4.40', 4.00 * 1.10, 4.40],
  ['marginal nord vid 4.40', 4.40 - 1.60, 2.80],
  ['marginal hoegfjaell vid 4.40', 4.40 - 2.80, 1.60],
  ['marginaloekning nord %', (4.40 - 1.60) / 2.40 - 1, 0.167],
  ['marginaloekning hoegfjaell %', (4.40 - 2.80) / 1.20 - 1, 0.333],
  ['pris -10% => 3.60', 4.00 * 0.90, 3.60],
  ['marginal nord vid 3.60', 3.60 - 1.60, 2.00],
  ['marginal hoegfjaell vid 3.60', 3.60 - 2.80, 0.80],
  ['prischock +100%', 4.00 / 2.00 - 1, 1.00],
  ['prisfall till 2.20 %', 2.20 / 4.00 - 1, -0.45],
  ['guldkredit 0.5x65', 0.5 * 65, 33],
  ['intakt per ton 106+33', 106 + 33, 139],
  ['guldkreditandel < 25%', 33 / 139, 0.237],
  ['livslaengd 6.0/0.2', 6.0 / 0.2, 30],
  ['FMG utdelning %', 2529 / 6699 - 1, -0.622],
  ['FMG bruttoenheter', 40.1 - 56.0, -15.9],
  ['NST bruttoenheter', 37.8 - 14.3, 23.4],
  ['Boliden oms %', 93509 / 86437 - 1, 0.082],
  ['Boliden resultat %', 9404 / 12410 - 1, -0.242],
  ['minoritetsandel 12.1/32.2', 12.1 / 32.2, 0.376]
];
for (const [namn, motor, text] of arit) {
  if (Math.abs(motor - text) > Math.max(0.051, Math.abs(text) * 0.02)) F(`aritmetik ${namn}: motor ${motor.toFixed(4)} mot text ${text}`);
}
OK(`aritmetik ${arit.length}/${arit.length} motorräknad`);

// 9. Talparitet SV-originalet == EN (språkmedveten multiset, AR8/Ö14-klassen)
// Termartefakter strippas symmetriskt FÖRE extraktionen: C1 (kostnadstermen) och AK1A
// (varumärket) innehåller siffran 1 utan att vara innehållstal — Ö25/AR20-precedensen.
const stripYta = (s) => s.replace(/\((?:https?:\/\/|\/)[^)]*\)/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/C1/g, ' ').replace(/AK1A/g, ' ');
const svTalfloor = (s) => {
  // SV: mellanslagstusental exakta 3-siffrorsgrupper, komma=decimal alltid
  return stripYta(s).replace(/\d{4}-\d{2}-\d{2}/g, ' ')
    .replace(/(\d) (\d{3})(?=\D|$)/g, '$1$2')
    .replace(/(\d),(\d)/g, '$1.$2')
    .match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
};
const enTalfloor = (s) => {
  // EN: komma med exakt 3 siffror=tusental (strippas), punkt=decimal
  return stripYta(s).replace(/\d{4}-\d{2}-\d{2}/g, ' ')
    .replace(/(\d),(\d{3})(?=\D|$)/g, '$1$2')
    .match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
};
const svTal = svTalfloor(o.body), enTal = enTalfloor(body);
const multisetDiff = (a, b) => {
  const m = new Map();
  for (const x of a) m.set(x, (m.get(x) ?? 0) + 1);
  for (const x of b) m.set(x, (m.get(x) ?? 0) - 1);
  const baraA = [], baraB = [];
  for (const [k, v] of m) { if (v > 0) baraA.push(`${k}×${v}`); if (v < 0) baraB.push(`${k}×${-v}`); }
  return { baraA, baraB };
};
const { baraA, baraB } = multisetDiff(svTal, enTal);
if (baraA.length || baraB.length) {
  F(`talparitet bruten: endast-SV [${baraA.join(', ')}] endast-EN [${baraB.join(', ')}]`);
} else OK(`talparitet ${svTal.length} tal multiset-identiska (svensk→engelsk normalisering)`);

// 10. Svenska läckor (URL-slugar + egennamn + valutetermer vitlistade)
const lackYta = body.replace(/\([^)]*\)/g, ' ').replace(/https?:\/\/\S+/g, ' ');
const vitlista = ['Bergsstaten', 'kronor', 'AK1A', 'South32'];
// "per" är legitimt engelskt ord ("per pound", "per ton") — inte en svensk läcka.
const svLackor = [...lackYta.matchAll(/\b(och|att|är|för|med|som|till|från|eller|men|vid|ur|av|en|ett|den|det|de)\b/gi)].map(m => m[0])
  .filter(w => !vitlista.some(v => w.toLowerCase() === v.toLowerCase()));
if (svLackor.length) F(`svenska läckor i EN-text: ${[...new Set(svLackor)].join(', ')}`);
else OK('svenska läckor 0');

// 11. Struktur
if (h2or.length !== 8) F(`H2 ${h2or.length} != 8 (originalets)`);
if ((body.match(/^# /gm) || []).length !== 1) F('H1 != 1');
const sista = body.trimEnd().split('\n').pop();
if (sista !== '_This is educational financial analysis, not investment advice._') F(`disclaimer ej exakt sista rad: "${sista}"`);
const rm = Math.round(ord / 600);
if (j.readingMinutes !== rm) F(`readingMinutes ${j.readingMinutes} != round(${ord}/600)=${rm}`);
if (o.h2or === undefined) { /* originalets H2-antal kontrolleras direkt */ }
const origH2 = [...o.body.matchAll(/^## (.+)$/gm)].length;
if (h2or.length !== origH2) F(`H2-paritet ${h2or.length} != ${origH2}`);
for (const fält of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body']) if (!(fält in j)) F(`BlogPost-fält saknas: ${fält}`);
if (j.slug !== o.slug + '-en') F(`slug ${j.slug} != originalets + '-en'`);
OK(`H2 ${h2or.length} == originalets, H1 1, readingMinutes ${rm}, BlogPost-formen komplett, disclaimer exakt sista rad, slug-konvention`);

console.log(`\n=== KVD B29-en: ${fel} FEL, ${varn} VARN ===`);
process.exit(fel ? 1 : 0);
