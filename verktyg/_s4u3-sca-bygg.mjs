// Bygger sa-laser-du-sca-q3-2026.json ur _s4u3-sca-body.md
import fs from 'node:fs';
const body = fs.readFileSync('/home/ak1a/AK1/verktyg/_s4u3-sca-body.md', 'utf8').trim();
const ut = {
  slug: 'sa-laser-du-sca-q3-2026',
  title: 'SCA:s tredjekvartalsrapport 2026: så läser du den — bokvärdets läsart: P/B 0,80 och P/E 36,5 vid räntabilitet 2,2 procent, netto 5,8 procentenheter över EBIT, marginalglidningen 32,8 → 15,7, absolutkontrollens rekord 44 procent',
  description: 'SCA redovisar interim rapport för tredje kvartalet fredagen den 23 oktober — samma dag som Norsk Hydro. Läspaketet: kursen cirka 20 procent under bokfört värde med P/E 36,5 — samma påstående i två multiplar när räntabiliteten är 2,2 procent; netto 5,8 procentenheter över rörelsemarginalen; marginalglidningen 32,8 → 15,7; absolutkontrollen gapar 44 procent — seriens grövsta — och tre oberoende fält vittnar om ett svagare tolvmånadersfönster.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-22',
  readingMinutes: 5,
  tags: ['kvartalsrapport', 'SCA', 'material', 'nyckeltal', 'läspaket', 'skog', 'bokvärde', 'råvarucykel'],
  body,
};
fs.writeFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-sca-q3-2026.json', JSON.stringify(ut, null, 2) + '\n');
const ord = (body.match(/\S+/g) || []).length;
console.log('BYGGD. ord=' + ord + ' readingMinutes borde = ' + Math.round(ord / 600) + ' title=' + ut.title.length + ' tkn desc=' + ut.description.length + ' tkn');
