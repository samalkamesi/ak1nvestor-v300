// Full sond: ALLA bolags-URL:er i prod-sitemap + dataset-rutter — hitta alla != 200
const BAS = 'http://localhost:3000';

const svar = await fetch(BAS + '/sitemap.xml');
const sitemap = await svar.text();
const bolagUrls = [...new Set([...sitemap.matchAll(/bolag\/[a-z0-9-]+/g)].map((m) => m[0]))].sort();
console.log('sitemap bolags-URL:er:', bolagUrls.length);

const dods = [];
const ovriga = [];
// Kör 12 parallellt i tagterade omgångar för att inte öbelasta pm2
const OMGN = 12;
for (let i = 0; i < bolagUrls.length; i += OMGN) {
  const bit = bolagUrls.slice(i, i + OMGN);
  const status = await Promise.all(
    bit.map(async (u) => {
      const r = await fetch(BAS + '/' + u);
      return { u, s: r.status };
    }),
  );
  for (const { u, s } of status) {
    if (s !== 200) dods.push(`${u} → ${s}`);
    else ovriga.push(u);
  }
}
console.log('!= 200:', dods.length);
for (const d of dods) console.log('  ' + d);

// Dataset-rutter ur sitemap
const datasetUrls = [...new Set([...sitemap.matchAll(/dataset\/[a-z0-9-]+(?:\/[a-z0-9-]+)?/g)].map((m) => m[0]))].sort();
console.log('\ndataset-URL:er:', datasetUrls.length);
const datasetDoda = [];
for (let i = 0; i < datasetUrls.length; i += OMGN) {
  const bit = datasetUrls.slice(i, i + OMGN);
  const status = await Promise.all(
    bit.map(async (u) => {
      const r = await fetch(BAS + '/' + u);
      return { u, s: r.status };
    }),
  );
  for (const { u, s } of status) if (s !== 200) datasetDoda.push(`${u} → ${s}`);
}
console.log('dataset != 200:', datasetDoda.length);
for (const d of datasetDoda) console.log('  ' + d);
