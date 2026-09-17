// Bygger sa-laser-du-boston-scientific-q3-2026.json ur _s4u1-bsx-body.md
import fs from 'node:fs';
const body = fs.readFileSync('/home/ak1a/AK1/verktyg/_s4u1-bsx-body.md', 'utf8').trim();
const ut = {
  slug: 'sa-laser-du-boston-scientific-q3-2026',
  title: 'Boston Scientifics tredjekvartalsrapport 2026: så läser du den — trappans läsart: nettomarginalen 5,1 → 14,4 procent på fyra år, resultatet 4,5× vid intäkter +58; PEG 0,67 mot konventionen 4,96 — seriens största klyfta; P/E fjärde lägsta i grenen',
  description: 'Boston Scientific redovisar Q3-resultatet onsdagen den 28 oktober — hälsogrenens tredje paket och USA-halvans andra. Läspaketet: lönsamheten byggd steg för steg (642 → 2 898 miljoner dollar) medan intäkterna gick 12,7 → 20,1 miljarder; identitet 5,8 procent, EV-kedja 1,05, FCF-par 1,05 och TTM-vittnet som förklarar absolutkontrollens −19,7 procent — Johnson & Johnson-paketets spegelbild. PEG faller med faktor 7,4.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-27',
  readingMinutes: 5,
  tags: ['kvartalsrapport', 'Boston Scientific', 'halso', 'nyckeltal', 'läspaket', 'medtech', 'usa', 'tillvaxt'],
  body,
};
fs.writeFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-boston-scientific-q3-2026.json', JSON.stringify(ut, null, 2) + '\n');
const ord = (body.match(/\S+/g) || []).length;
console.log('BYGGD. ord=' + ord + ' readingMinutes borde = ' + Math.round(ord / 600) + ' title=' + ut.title.length + ' tkn desc=' + ut.description.length + ' tkn');
