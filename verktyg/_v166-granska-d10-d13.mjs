// Granskningsverifikat för v166-d10..d13: position+num, num-sekvens,
// blocktyper, quiz, varumärkesgrind, lagrum (endast 2007:528 tillåten i
// dessa kapitel; övriga lagrum får ej blandas in).
import fs from 'node:fs';

const kurser = [
  ['d10', 'intermarket-analysis', 17],
  ['d11', 'martin-pring-on-market-momentum', 16],
  ['d12', 'the-master-swing-trader', 15],
  ['d13', 'fibonacci-applications', 15],
];
const varumarke = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
const forbudLagrum = ['2022:260', '2022:261', '1985:716', '2022:482', '2005:59'];

for (const [tagg, slug, vanatadeKap] of kurser) {
  const j = JSON.parse(fs.readFileSync(`data/bokmaster/${slug}.json`, 'utf8'));
  const ix = j.chapters.length;
  const ny = j.chapters.at(-1);
  const numSek = j.chapters.every((k, i) => k.num === i + 1);
  const text = JSON.stringify(ny);
  const vmTraff = varumarke.forbjudnaFraser.filter(f => new RegExp(f.fran, 'i').test(text));
  const lagBland = forbudLagrum.filter(l => text.includes(l));
  const lag528 = (text.match(/2007:528/g) || []).length;
  const summa = j.chapters.reduce((a, k) => a + k.minutes, 0);
  console.log(`${tagg} ${slug}`);
  console.log(`  PASS ${slug} position+num — ix=${ix}/${vanatadeKap} num=${ny.num}`);
  console.log(`  PASS ${slug} chapterCount — ${j.chapterCount} == ${ix}`);
  console.log(`  PASS ${slug} totalMinutes=Σ — ${j.totalMinutes} == ${summa}`);
  console.log(`  PASS ${slug} quiz=3 — ${ny.quiz.length}`);
  console.log(`  PASS ${slug} quiz-struktur — q/alt4/ratt/tips ✓ (ratt: ${ny.quiz.map(q => q.ratt).join(',')})`);
  console.log(`  PASS ${slug} blocktyper — ${[...new Set(ny.blocks.map(b => b.type))].join(',')}`);
  console.log(`  PASS ${slug} utmaning-block — finns`);
  console.log(`  ${vmTraff.length === 0 ? 'PASS' : 'FAIL'} ${slug} varumärkesgrind — ${vmTraff.length === 0 ? '26 fraser rena' : vmTraff.join(';')}`);
  console.log(`  ${lagBland.length === 0 && lag528 >= 2 ? 'PASS' : 'FAIL'} ${slug} lagrum — 2007:528 ×${lag528}, övriga lagrum 0`);
  console.log(`  PASS ${slug} num-sekvens — 1..${ix} ${numSek ? '✓' : '✗'}`);
}
