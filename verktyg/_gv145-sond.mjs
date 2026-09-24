// Sondera prod: sitemap-bolag vs faktiska sidor vs datakälla
const BAS = 'http://localhost:3000';

async function hamtaText(vag) {
  const svar = await fetch(BAS + vag);
  return { status: svar.status, text: await svar.text() };
}

// 1. Sitemapens bolags-URL:er
const { text: sitemap } = await hamtaText('/sitemap.xml');
const bolagUrls = [...new Set([...sitemap.matchAll(/bolag\/[a-z0-9-]+/g)].map((m) => m[0]))].sort();
console.log('sitemap innehåller', bolagUrls.length, 'bolags-URL:er');

const misstankta = ['ai-pa', 'barc-l', 'cap-pa', 'dsy-pa', 'lloy-l', 'nwg-l'];
for (const m of misstankta) {
  const iSitemap = bolagUrls.includes(`bolag/${m}`);
  const { status } = await hamtaText(`/bolag/${m}`);
  console.log(`/bolag/${m}: i sitemap=${iSitemap}, status=${status}`);
}

// 2. Några kända bra för jämförelse
for (const b of ['abb-l', 'nDA-l']) break;
const jamforelse = bolagUrls.slice(0, 8);
console.log('\nförsta 8 bolags-URL:erna i sitemap:', jamforelse.join(', '));
if (bolagUrls.length) {
  const { status } = await hamtaText('/' + bolagUrls[0]);
  console.log(`jämförelse /${bolagUrls[0]}: status=${status}`);
}
