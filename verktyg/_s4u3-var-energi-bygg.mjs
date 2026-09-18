#!/usr/bin/env node
// s4-u3 VÅR ENERGI — paketera Q3-läspaketet (2026-09-18)
import fs from 'node:fs';

const body = fs.readFileSync('/home/ak1a/AK1/verktyg/_s4u3-var-energi-body.md', 'utf8').trim();
const ord = body.split(/\s+/).filter(Boolean).length;
const pkg = {
  slug: 'sa-laser-du-var-energi-q3-2026',
  title: 'Vår Energis kvartalsrapport 2026: så läser du den — energigrenens andra paket: identitetstestets största brott i serien (P/B 57,9 mot ROE 94 procent ger 61,6 mot fältets P/E 10,2 — kvoten 6,1), skatteklippan där 78 procent av rörelseresultatet försvinner före netto, och resultatformen som ett V: 936 → 610 → 312 → 785 miljoner dollar',
  description: 'Vår Energi presenterar tredje kvartalet onsdagen den 21 oktober kl 07:00 norsk tid, med trading update redan den 12 oktober. Här är energigrenens andra läspaket — P/E 10,18 under grenens median medan identitetstestet P/B ÷ ROE ger 61,6 mot fältets 10,2: seriens största brott, och valutatestet visar att ingen växelkurs stänger det (rapport i dollar, notering i kronor); bruttomarginal 88,1 och rörelsemarginal 59,4 procent med netto 13,0 — skatteklippan där 78,1 procent av rörelseresultatet försvinner; resultatserien 936 → 610 → 312 → 785 miljoner dollar som ett V med marginaldip 4,18 procent 2024; EV-kedjans kvot 0,091 som seriens nya extrem och PEG-fältet null mot prognostillväxt minus 34,05 procent. Scenariorutan räknas på 2025 års bas och varje siffra har sin källa.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-21',
  readingMinutes: Math.round(ord / 600),
  tags: ['kvartalsrapport', 'Vår Energi', 'energi', 'olja', 'gas', 'nyckeltal', 'läspaket'],
  body,
};
const dest = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-var-energi-q3-2026.json';
fs.writeFileSync(dest, JSON.stringify(pkg, null, 2) + '\n');
console.log('SKREV', dest, '| ord:', ord, '| readingMinutes:', pkg.readingMinutes);
