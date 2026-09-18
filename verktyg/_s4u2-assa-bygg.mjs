// _s4u2-assa-bygg.mjs — bygger läspaket-JSON ur body-markdown (spår 4, auto-s4-1789742101501 u2)
// Användning: node verktyg/_s4u2-assa-bygg.mjs [kvd]  (kvd-läge: kör kontroller, skriver ej)
import { readFileSync, writeFileSync } from 'node:fs';

const body = readFileSync(new URL('_s4u2-assa-body.md', import.meta.url), 'utf8').replace(/\s+$/, '');
const ord = (body.match(/\S+/g) || []).length;
const paket = {
  slug: 'sa-laser-du-assa-abloy-q3-2026',
  title: 'ASSA ABLOY Q3-rapport 2026: så läser du den — grenens tillväxtbarn på glidande marginal: intäkter i dubbeltempo mot grenen, vinst på halva takten, nettomarginalen exakt på grenens median, brutto tredje högst men ROE fjärde lägst — och EV-kedjan baklänges när källan saknar börsvärde',
  description: 'ASSA ABLOY rapporterar tredje kvartalet tisdagen 27 oktober kl 08:00. Här är läspaketet: nyckeltalen mot industrigrenens medianer, identitetstestet där P/B delat med ROE landar 5,6 procent under P/E-fältet, underlagsdetektiven med rullande vinst 15,9 procent över bokförd bas, PEG-fältet vars implicita tillväxt inte finns i filen, och en scenarioruta där en procentenhet marginal väger dubbelt mot tre procent volym. Börsvärdet saknas i källan — paketet visar hur balansräkningen byggs baklänges ur multiplar i stället. Varje siffra har sin källa, och ingenting är en rekommendation.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-27',
  readingMinutes: Math.round(ord / 600),
  tags: ['kvartalsrapport', 'ASSA ABLOY', 'industri', 'nyckeltal', 'läspaket', 'lås'],
  body,
};

if (process.argv[2] !== 'kvd') {
  const sokvag = new URL('../data/blogg-utkast/kvartal/2026-q3/sa-laser-du-assa-abloy-q3-2026.json', import.meta.url);
  writeFileSync(sokvag, JSON.stringify(paket, null, 2) + '\n');
  console.log('skrev', sokvag.pathname);
}
console.log('ord:', ord, '| readingMinutes:', paket.readingMinutes, '| title tkn:', paket.title.length, '| desc tkn:', paket.description.length);
