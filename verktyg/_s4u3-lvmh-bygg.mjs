// _s4u3-lvmh-bygg.mjs — bygger sa-laser-du-lvmh-q3-2026.json ur _s4u3-lvmh-body.md
// (s4-u3, manifest auto-s4-1789931110711). Ren dataleverans: ingen src/, inget bygge.
import { readFileSync, writeFileSync } from 'node:fs';

const body = readFileSync(new URL('./_s4u3-lvmh-body.md', import.meta.url), 'utf8').trim();
const ord = body.split(/\s+/).length;
const paket = {
  slug: 'sa-laser-du-lvmh-q3-2026',
  title: 'LVMH:s kvartalsrapport 2026: så läser du den — konsumentgrenens åttonde paket: rapporten utan vinstsiffra, bruttomarginalen på tredje plats och tillväxten i botten',
  description: 'LVMH redovisar tredje kvartalets omsättning i oktober 2026 — en omsättnings-flash utan vinstsiffra, där fullständigt resultat kommer först i januari. Konsumentgrenens åttonde läspaket: bruttomarginalen 66,36 procent på tredje plats av 35 mot medianen 50,37 samtidigt som omsättningstillväxten ligger 28:a av 35, identitetstestet P/B ÷ ROE med gap 5,9 procent, absolutkontrollen som stänger på minus 1,9 procent, organisk plus 2 mot rapporterat minus 3 i halåret, utdelningen 13,00 euro på 3,05 procent direktavkastning med payout 58,9 procent — och fem datavaktsprov samt tre räkneövningar för dagen då rapporten bara bär en enda rad: omsättningen per affärsgrupp.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-20',
  readingMinutes: Math.round(ord / 600),
  tags: ['kvartalsrapport', 'LVMH', 'lyx', 'konsument', 'läspaket', 'omsättning'],
  body,
};
const MAL = '../data/blogg-utkast/kvartal/2026-q3/sa-laser-du-lvmh-q3-2026.json';
writeFileSync(new URL(MAL, import.meta.url), JSON.stringify(paket, null, 2) + '\n');
console.log('skrev ' + MAL + ' — ' + ord + ' ord, readingMinutes ' + paket.readingMinutes
  + ', description ' + paket.description.length + ' tecken');
