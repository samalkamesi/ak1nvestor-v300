#!/usr/bin/env node
// ROND 99 — oberoende granskningskontroll AR1 (fastighet) + AR2 (bank) mot sina originalet B1/B2.
// AR3–AR5 har fulla KVD-skript (återkörda gröna oberoende); dessa två levererades 09-17
// och deras skript städats — denna sond täcker kärnklasserna.
import { readFileSync } from 'node:fs';

const PAR = [
  ['AR1 fastighet', 'fastighetsaktier-sa-analyserar-du-fastighetsbolag-ar.json', 'fastighetsaktier-sa-analyserar-du-fastighetsbolag.json'],
  ['AR2 bank', 'sa-analyserar-du-bankaktier-ar.json', 'sa-analyserar-du-bankaktier.json'],
];
const BAS = '/home/ak1a/agent/ak1/data/blogg-utkast';
const RADVERB_AR = ['اشترِ', 'اشتري', 'بِع ', 'أنصحك', 'نوصي بشراء', 'استثمر في هذا', 'استثمر في هذه'];
const nal = (n) => Number(n) === n && Number.isFinite(n);

let fel = 0, varn = 0;
const pass = (m) => console.log('  PASS ' + m);
const fall = (m) => { console.log('  FEL  ' + m); fel++; };
const not = (m) => { console.log('  NOT  ' + m); varn++; };

for (const [namn, arFil, svFil] of PAR) {
  console.log(`\n== ${namn} ==`);
  const ar = JSON.parse(readFileSync(`${BAS}/${arFil}`, 'utf8'));
  const sv = JSON.parse(readFileSync(`${BAS}/${svFil}`, 'utf8'));

  nal(1) && ar.slug === sv.slug + '-ar' ? pass(`slug = originalet + -ar (${ar.slug})`) : fall(`slug-konvention: ${ar.slug} vs ${sv.slug}-ar`);
  ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'].every((f) => f in ar)
    ? pass('BlogPost-form — fält exakta') : fall('BlogPost-form saknar fält');

  const ordAr = ar.body.split(/\s+/).filter(Boolean).length;
  (ordAr >= 800 && ordAr <= 1400) ? pass(`ord ${ordAr}/800–1400 (originalet ${sv.body.split(/\s+/).filter(Boolean).length})`)
    : fall(`ordmål ${ordAr} utanför 800–1400`);
  ar.readingMinutes === Math.round(ordAr / 600) ? pass(`readingMinutes ${ar.readingMinutes} = round(${ordAr}/600)`)
    : fall(`readingMinutes ${ar.readingMinutes} ≠ round(${ordAr}/600)`);
  ar.title.length <= 60 ? pass(`title ${ar.title.length}/60 tkn`) : fall(`title ${ar.title.length} > 60`);
  ar.description.length <= 155 ? pass(`OG ${ar.description.length}/155 tkn`) : fall(`OG ${ar.description.length} > 155`);

  const h2 = (t) => (t.match(/^## .+$/gm) || []).length;
  h2(ar.body) === h2(sv.body) ? pass(`H2-paritet ${h2(ar.body)} == ${h2(sv.body)}`) : fall(`H2 ${h2(ar.body)} ≠ ${h2(sv.body)} (originalet)`);

  const lank = (t) => (t.match(/\]\((\/[^)]+)\)/g) || []).map((x) => x.slice(2, -1)).sort().join('|');
  lank(ar.body) === lank(sv.body) ? pass(`korslänkar multiset identiska (${(lank(ar.body).match(/\|/g) || []).length + (lank(ar.body) ? 1 : 0)} st)`)
    : fall('korslänkar avviker från originalet');
  const ext = (t) => (t.match(/https?:\/\/[^\s)]+/g) || []).sort().join('|');
  ext(ar.body) === ext(sv.body) ? pass(`externa URL:er identiska (${(ext(ar.body).match(/https?:/g) || []).length} st)`)
    : fall('externa URL:er avviker');

  const rader = ar.body.trim().split('\n');
  const sista = rader[rader.length - 1];
  /ليس نصيحة استثمارية|وليست نصيحة/.test(sista) ? pass('disclaimer arabisk form exakt sista rad') : fall('disclaimer saknas/är ej sista rad: ' + sista.slice(0, 60));

  const utanDiscl = rader.slice(0, -1).join('\n');
  const radverb = RADVERB_AR.filter((p) => utanDiscl.includes(p));
  radverb.length === 0 ? pass('arabiska rådgivningsmönster utanför disclaimer: 0') : fall('rådmönster: ' + radverb.join(', '));

  const stripUrl = (t) => t.replace(/https?:\/\/[^\s)]+/g, ' ').replace(/\([^)]*\)/g, ' ');
  const svLack = (stripUrl(ar.body).match(/[åäö]/gi) || []).length;
  svLack === 0 ? pass('svenska tecken (å/ä/ö) efter URL/parentes-strip: 0') : fall(`svenska läckor ${svLack}`);

  const normTal = (t, arStil) => t.replace(/\u00a0/g, ' ')
    .replace(arStil ? /(\d),(\d{3})/g : /(\d) (\d{3})/g, '$1$2')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/).filter((w) => /^\d+$/.test(w));
  const a = normTal(ar.body, true).sort().join('|');
  const s = normTal(sv.body, false).sort().join('|');
  a === s ? pass(`sifferparitet multiset identiska (${a ? a.split('|').length : 0} token)`)
    : not(`siffermultiset skiljer — AR [${a}] vs SV [${s}] (ord-tal kan ingå; se rapport)`);

  const h2or = (ar.body.match(/^## .+$/gm) || []);
  const t3 = ar.title.replace(/[|—–:].*$/, '').trim().split(/\s+/).slice(0, 3).join(' ');
  const h2traff = h2or.filter((h) => h.includes(t3)).length;
  const ingress = ar.body.split('\n\n')[1] || '';
  (h2traff >= 2 && ingress.includes(t3)) ? pass(`sökordsbärning: "${t3}" i title+ingress+${h2traff} H2`)
    : not(`sökordsbärning svag: fras "${t3}" i ${h2traff} H2, ingress ${ingress.includes(t3) ? 'JA' : 'NEJ'} — granska manuellt`);
  console.log('  NOT  title: ' + ar.title);
  console.log('  NOT  H2-lista: ' + h2or.map((h) => h.replace(/^## /, '')).join(' § ').slice(0, 300));
}

console.log(`\n== DOM AR1+AR2: ${fel === 0 ? 'GRÖN' : 'RÖD'} — ${fel} FEL, ${varn} NOT ==`);
process.exit(fel === 0 ? 0 : 1);
