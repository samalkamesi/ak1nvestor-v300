#!/usr/bin/env node
// KVD för AR32 kemiktier-ar — arabisk spegel av B31 (översättningsklassen, AR8/AR16/AR30/AR31-traditionen;
// mallad på _s3u3-b29-ar-kvd-gruv.mjs — samma originals tal, länkar och aritmetik).
import fs from 'node:fs';
import https from 'node:https';

const FIL = '/home/ak1a/AK1/data/blogg-utkast/kemiktier-sa-analyserar-du-kemibalag-ar.json';
const ORIG = '/home/ak1a/AK1/data/blogg-utkast/kemiktier-sa-analyserar-du-kemibalag.json';
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

// 2. Rådverb SV+EN+AR (AR-mönstren: اشترِ / بِع / استثمر في هذا / أنصحك / نوصي بشراء)
const radVerb = /\b(köp|köper|köp\.|sälj|sälja|säljer|rekommendera|rekommenderar|rekommendation|buy|sell|hold)\b/gi;
const radVerbAr = /(اشترِ|بِع|استثمر في هذا|أنصحك|نصيحة استثمارية نوصي|نوصي بشراء)/g;
for (const [namn, yta] of Object.entries(ytor)) {
  const t = [...yta.matchAll(radVerb)].map(m => m[0]);
  if (t.length) F(`rådverb SV+EN på ${namn}: ${t.join(', ')}`);
  const ta = [...yta.matchAll(radVerbAr)].map(m => m[0]);
  if (ta.length) F(`rådverb AR på ${namn}: ${ta.join(', ')}`);
}
OK('rådverb SV+EN+AR 0');

// 3. Sökord i title (först) + description + H1 + ingress + >=2 H2
const sok = 'أسهم الكيماويات';
const h1 = body.match(/^# (.+)$/m)?.[1] ?? '';
const h2or = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
const ingress = body.split('\n\n')[1] ?? '';
if (!j.title.startsWith(sok)) F('sökord ej först i title');
if (!j.description.includes(sok)) F('sökord saknas i description');
if (!h1.includes(sok)) F('sökord saknas i H1');
if (!ingress.includes(sok)) F('sökord saknas i ingress');
const h2med = h2or.filter(h => h.includes(sok)).length;
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
  F(`korslänkar ej MULTISET-identiska med originalet (AR ${mina.length}, SV ${origs.length})`);
  const mSet = new Set(mina), oSet = new Set(origs);
  for (const l of oSet) if (!mSet.has(l)) console.log('  saknas i AR:', l);
  for (const l of mSet) if (!oSet.has(l)) console.log('  extra i AR:', l);
} else OK(`korslänkar ${mina.length} MULTISET-identiska med originalet`);
const dc = JSON.parse(fs.readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
const kurser = (Array.isArray(dc) ? dc : (dc.courses || Object.values(dc))).map(x => x.id ?? x.slug).filter(Boolean);
const blogg = fs.readdirSync('/home/ak1a/AK1/data/blogg').filter(f => f.endsWith('.json'))
  .flatMap(f => { try { return [JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/blogg/' + f, 'utf8')).slug]; } catch { return []; } });
const interna = mina.map(l => l.replace('/kurser/', '').replace('/blogg/', ''));
const doda = interna.filter(l => !kurser.includes(l) && !blogg.includes(l));
if (doda.length) F(`korslänkar mot icke-publicerade ytor: ${[...new Set(doda)].join(', ')}`);
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

// 8. Aritmetik motorräknad (originalets klass, motor mot text med tolerans)
const arit = [
  ['bulk bruttovinst 12000x18%', 12000 * 0.18, 2160],
  ['special bruttovinst 3000x38%', 3000 * 0.38, 1140],
  ['specials andel av parets bruttovinst', 1140 / (2160 + 1140), 0.345],
  ['specials andel av omsättningen', 3000 / 15000, 0.20],
  ['gas 33x4', 33 * 4, 132],
  ['gas 33x8', 33 * 8, 264],
  ['gas 33x12', 33 * 12, 396],
  ['Yara oms -33.9%', 165.1 / 249.7 - 1, -0.339],
  ['Yara 2024 andel av toppresultatet', 157 / 28800, 0.005],
  ['Yara 2025 andel av toppresultatet', 13000 / 28800, 0.45],
  ['partner totalkostnad 396+150', 396 + 150, 546],
  ['laag totalkostnad 132+150', 132 + 150, 282],
  ['partner marginal 560-546', 560 - 546, 14],
  ['laag marginal 560-282', 560 - 282, 278],
  ['kvot 278/14', 278 / 14, 19.9],
  ['partner marginal 500-546', 500 - 546, -46],
  ['gas8 totalkostnad 264+150', 264 + 150, 414],
  ['gas8 marginal 500-414', 500 - 414, 86],
  ['laag marginal 500-282', 500 - 282, 218],
  ['FoU special 150/3000', 150 / 3000, 0.05],
  ['FoU bulk 60/12000', 60 / 12000, 0.005],
  ['gaschock marginal 560-414', 560 - 414, 146],
  ['BASF oms -31.7%', 59657 / 87327 - 1, -0.317]
];
for (const [namn, motor, text] of arit) {
  if (Math.abs(motor - text) > Math.max(0.051, Math.abs(text) * 0.02)) F(`aritmetik ${namn}: motor ${motor.toFixed(4)} mot text ${text}`);
}
OK(`aritmetik ${arit.length}/${arit.length} motorräknad`);

// 9. Talparitet SV-originalet == AR (språkmedveten multiset, AR8/AR16-klassen)
// Termartefakter strippas symmetriskt FÖRE extraktionen: AK1A (varumärket) innehåller
// siffran 1 utan att vara innehållstal — Ö25/AR20/Ö29/AR31-precedensen.
const stripYta = (s) => s.replace(/\((?:https?:\/\/|\/)[^)]*\)/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/AK1A/g, ' ');
const svTalfloor = (s) => {
  // SV: mellanslagstusental exakta 3-siffrorsgrupper, komma=decimal alltid
  return stripYta(s).replace(/\d{4}-\d{2}-\d{2}/g, ' ')
    .replace(/(\d) (\d{3})(?=\D|$)/g, '$1$2')
    .replace(/(\d),(\d)/g, '$1.$2')
    .match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
};
const arTalfloor = (s) => {
  // AR (västerländska siffror, finansiell konvention): komma med exakt 3 siffror=tusental (strippas), punkt=decimal
  return stripYta(s).replace(/\d{4}-\d{2}-\d{2}/g, ' ')
    .replace(/(\d),(\d{3})(?=\D|$)/g, '$1$2')
    .match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
};
const svTal = svTalfloor(o.body), arTal = arTalfloor(body);
const multisetDiff = (a, b) => {
  const m = new Map();
  for (const x of a) m.set(x, (m.get(x) ?? 0) + 1);
  for (const x of b) m.set(x, (m.get(x) ?? 0) - 1);
  const baraA = [], baraB = [];
  for (const [k, v] of m) { if (v > 0) baraA.push(`${k}×${v}`); if (v < 0) baraB.push(`${k}×${-v}`); }
  return { baraA, baraB };
};
const { baraA, baraB } = multisetDiff(svTal, arTal);
if (baraA.length || baraB.length) {
  F(`talparitet bruten: endast-SV [${baraA.join(', ')}] endast-AR [${baraB.join(', ')}]`);
} else OK(`talparitet ${svTal.length} tal multiset-identiska (svensk→arabisk normalisering)`);

// 10. Svenska läckor (URL-slugar + parenteser strippade; egennamn vitlistade enligt AR6/AR29-konventionen)
const lackYta = body.replace(/\([^)]*\)/g, ' ').replace(/https?:\/\/\S+/g, ' ');
const vitlista = [];
const svLackor = [...lackYta.matchAll(/\b(och|att|är|för|med|som|till|från|eller|men|vid|ur|av|en|ett|den|det|de)\b/gi)].map(m => m[0])
  .filter(w => !vitlista.some(v => w.toLowerCase() === v.toLowerCase()));
if (svLackor.length) F(`svenska läckor i AR-text: ${[...new Set(svLackor)].join(', ')}`);
else OK('svenska läckor 0');

// 11. Struktur
if (h2or.length !== 8) F(`H2 ${h2or.length} != 8 (originalets)`);
if ((body.match(/^# /gm) || []).length !== 1) F('H1 != 1');
const sista = body.trimEnd().split('\n').pop();
if (sista !== '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._') F(`disclaimer ej exakt sista rad: "${sista}"`);
const rm = Math.round(ord / 600);
if (j.readingMinutes !== rm) F(`readingMinutes ${j.readingMinutes} != round(${ord}/600)=${rm}`);
const origH2 = [...o.body.matchAll(/^## (.+)$/gm)].length;
if (h2or.length !== origH2) F(`H2-paritet ${h2or.length} != ${origH2}`);
for (const falt of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body']) if (!(falt in j)) F(`BlogPost-fält saknas: ${falt}`);
if (j.slug !== o.slug + '-ar') F(`slug ${j.slug} != originalets + '-ar'`);
OK(`H2 ${h2or.length} == originalets, H1 1, readingMinutes ${rm}, BlogPost-formen komplett, disclaimer exakt sista rad, slug-konvention`);

console.log(`\n=== KVD AR32: ${fel} FEL, ${varn} VARN ===`);
process.exit(fel ? 1 : 0);
