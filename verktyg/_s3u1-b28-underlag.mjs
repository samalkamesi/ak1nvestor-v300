// Underlagsskript B28 — läs B26:s struktur + hitta substans-kursankare +Verifiera länkytor
import fs from 'node:fs';

const b26 = JSON.parse(fs.readFileSync('data/blogg-utkast/skogsaktier-sa-analyserar-du-skogsbolag.json', 'utf8'));
const lankar = [...new Set([...b26.body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
console.log('B26 interna länkar:');
lankar.forEach(l => console.log(' ', l));
console.log('B26 H2:');
[...b26.body.matchAll(/^## (.*)$/gm)].forEach(h => console.log(' ', h[1]));
console.log('B26 META:', JSON.stringify({ slug: b26.slug, title: b26.title, description: b26.description, pillar: b26.pillar, author: b26.author, publishedAt: b26.publishedAt, readingMinutes: b26.readingMinutes, tags: b26.tags }));
console.log('B26 sista rader:', JSON.stringify(b26.body.trim().split('\n').slice(-3)));

// deep-courses struktur
const dc = JSON.parse(fs.readFileSync('public/deep-courses.json', 'utf8'));
const nycklar = Object.keys(dc);
console.log('\ndeep-courses toppnycklar:', nycklar.slice(0, 10).join(','));
for (const k of nycklar) {
  if (Array.isArray(dc[k]) && dc[k].length > 0 && typeof dc[k][0] === 'object') {
    const arr = dc[k];
    const slugs = arr.map(c => c.slug || c.id || c.kod).filter(Boolean);
    console.log(`  ${k}: ${arr.length} poster; exempel:`, slugs.slice(0, 8).join(' | '));
    const subst = arr.filter(c => /substans|investment|nav|rabatt/i.test(JSON.stringify(c)));
    subst.forEach(c => console.log('   SUBSTANS-TRÄFF:', JSON.stringify({ slug: c.slug || c.id, title: (c.title || c.titel || '').slice(0, 70) })));
  }
}

// publicerade bloggslugs (korslänksmål)
const live = fs.readdirSync('data/blogg').filter(f => f.endsWith('.json'));
console.log('\nlive blogg totalt:', live.length);
const want = ['begreppet-substansrabatt', 'pb-tal-nar-jamfor-man-bokvarde-ratt', 'analys-investor-2026', 'analys-industrivarden-2026', 'sa-laser-du-industrivarden-q3-2026', 'sa-laser-du-investor-ab-q3-2026', 'komplett-guide-svensk-aktieanalys-2026', 'branschmedianer-akm2', 'roic-den-glomda-nyckeltalen-v11', 'aktieanalys-steg-for-steg', 'hur-raknar-man-roe', 'sa-laser-du-en-balansrakning-pa-15-minuter', 'sa-laser-du-en-svensk-arsredovisning', 'mr-market-psykologi-svenska-borsen'];
for (const w of want) console.log(live.includes(w + '.json') ? 'LIVE: ' + w : 'SAKNAS: ' + w);
