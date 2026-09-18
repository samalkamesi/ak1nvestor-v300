// Bygg sa-laser-du-seb-q3-2026.json ur _s4u3-seb-body.md — s4-u3 (manifest auto-s4-1789700129983).
// Ren dataleverans: skriver UTANFÖR data/blogg/ (blogg-utkast), rör ej src/.
import { readFileSync, writeFileSync } from 'node:fs';

const body = readFileSync('/home/ak1a/AK1/verktyg/_s4u3-seb-body.md', 'utf8').trim();
const ord = body.split(/\s+/).filter(Boolean).length;

const paket = {
  slug: 'sa-laser-du-seb-q3-2026',
  title: 'SEBs Q3-rapport 2026: så läser du den — bankpaket nummer fyra: storbankquadern komplett, residualtrappans minsta positiva steg och PEG-fyrklangen sluten',
  description: 'SEB publicerar tredje kvartalet 2026 torsdagen 22 oktober. Här är läspaketet: nyckeltalen mot finansgrenens medianer, identitetstestets tredje profil (fyra procent, båda vägrarna), absolutkontrollens plus 1,9 procent — residualtrappans minsta positiva steg — och källans PEG-fält som faller för fjärde banken i rad. Scenariorutan räknas i ren aritmetik i kronor, och varje siffra har sin källa.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-22',
  readingMinutes: Math.round(ord / 600),
  tags: ['kvartalsrapport', 'SEB', 'finans', 'bankaktier', 'nyckeltal', 'läspaket'],
  body,
};

const UTF = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-seb-q3-2026.json';
writeFileSync(UTF, JSON.stringify(paket, null, 2) + '\n');
console.log('SKREV', UTF, 'ord=' + ord, 'readingMinutes=' + paket.readingMinutes);
