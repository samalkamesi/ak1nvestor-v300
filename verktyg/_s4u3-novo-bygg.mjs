// Bygger data/blogg-utkast/kvartal/2026-q3/sa-laser-du-novo-nordisk-q3-2026.json
// ur verktyg/_s4u3-novo-body.md — Spår 4 kvartalsrapportserie, fabrik auto-s4-1789679729562 s4-u3.
import { readFileSync, writeFileSync } from 'node:fs';

const body = readFileSync('/home/ak1a/AK1/verktyg/_s4u3-novo-body.md', 'utf8').trim();
const ord = body.split(/\s+/).filter(Boolean).length;
const paket = {
  slug: 'sa-laser-du-novo-nordisk-q3-2026',
  title:
    'Novo Nordisks tredjekvartalsrapport 2026: så läser du den — trappan som planar ut: omsättningen +75 procent på tre år men sista steget +6,4; grenens lägsta P/E 11,8 vid grenens högsta nettomarginal 35,4 — och PEG-klyftan 6,2×',
  description:
    'Novo Nordisk redovisar nio månader 2026 onsdagen 4 november 07:30 — hälsogrenens fjärde paket och seriens första Köpenhamn-noterade bolag. Läspaketet: intäkterna 177 → 309 miljarder DKK på fyra år med årsstegen +31,3 → +25,0 → +6,4 procent och nettomarginalbanan 36,0 → 33,1; grenens lägsta P/E 11,795 och EV/EBIT 10,21 vid grenens högsta nettomarginal 35,35 procent; PEG-fältet 3,22 mot bakåtblickande 0,52 — klyfta 6,2×; netto-till-FCF-klyftan 23,9 procentenheter och EV-fältets implicita nettokassa på 26 miljarder DKK. 16 medianmått, scenarioruta med marginalvikt 1,01 och full källkritik.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-11-04',
  readingMinutes: Math.round(ord / 600),
  tags: ['kvartalsrapport', 'Novo Nordisk', 'halso', 'nyckeltal', 'läspaket', 'pharma', 'danmark', 'marginaler'],
  body,
};
const mal = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-novo-nordisk-q3-2026.json';
writeFileSync(mal, JSON.stringify(paket, null, 2) + '\n');
console.log('SKREV', mal, '| ord =', ord, '| readingMinutes =', paket.readingMinutes, '| bytes =', Buffer.byteLength(JSON.stringify(paket)));
