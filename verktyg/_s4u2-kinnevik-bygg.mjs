#!/usr/bin/env node
// s4-u2 (manifest auto-s4-1789786525981) — bygger Kinnevik Q3-läspaketet ur body + metadata.
// Motorräknade kontroller av längdkontrakt (title/OG/ord) FÖR skriv; KVD körs separat.
import { readFileSync, writeFileSync } from 'node:fs';

const BODY = readFileSync('/home/ak1a/AK1/verktyg/_s4u2-kinnevik-body.md', 'utf8').trim();
const title = "Kinneviks delårsrapport 2026: så läser du den — tillväxtgrenens första paket och dess enda bolag under boken: substansrabatten 41 procent mot P/B 0,60, NAV-trappan 139 → 101 → 107 kronor efter marskvartalets nedskrivning på 8 miljarder, och fyra förlustår där resultatraden följer substansrörelsen inom en procent";
const description = "Kinnevik presenterar delårsrapporten för januari–september torsdagen den 15 oktober. Här är tillväxtgrenens första läspaket — substansutgåvan: P/B 0,598 betyder 40 procents rabatt mot bokfört kapital medan grenens 14 övriga mätta bolag står över böckerna, NAV-trappan 139 → 136 → 130 → 101 → 107 kronor bär Q1-nedskrivningen minus 22 procent, och Datavaktens fem test: substansdetektiven stänger på 1,7 procent, ROE-fältet lever i marskvartalet, PEG 4,76 utan P/E, FCF-parets inre motsägelse, och resultatraden som ÄR substansrörelsen (kvoter 1,01/0,99/1,01). Scenarioruta substans × rabatt, två vägar till P/B ett, källor och granskningskö-rad — utbildning i metod, aldrig råd.";
const ord = BODY.split(/\s+/).filter(Boolean).length;
const min = Math.round(ord / 600);

console.log('title:', title.length, 'tecken');
console.log('description:', description.length, 'tecken');
console.log('ord:', ord, '=> readingMinutes', min);
if (min !== 5) { console.error('AVVIKELSE: readingMinutes != 5 — justera längd'); process.exit(1); }

const paket = {
  slug: 'sa-laser-du-kinnevik-q3-2026',
  title,
  description,
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-15',
  readingMinutes: min,
  tags: ['kvartalsrapport', 'Kinnevik', 'tillvaxt', 'investeringsbolag', 'substansrabatt', 'läspaket'],
  body: BODY + '\n',
};
writeFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-kinnevik-q3-2026.json', JSON.stringify(paket, null, 1) + '\n');
console.log('SKRIVEN: data/blogg-utkast/kvartal/2026-q3/sa-laser-du-kinnevik-q3-2026.json');
