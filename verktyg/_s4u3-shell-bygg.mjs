// _s4u3-shell-bygg.mjs — packar Shell Q3-läspaketet (s4-u3, manifest auto-s4-1789908909779)
// Källa till body: verktyg/_s4u3-shell-body.md (samma katalog). KVD: verktyg/_s4u3-shell-kvd.mjs.
import { readFileSync, writeFileSync } from 'node:fs';

const body = readFileSync(new URL('./_s4u3-shell-body.md', import.meta.url), 'utf8').trim();
const ord = body.split(/\s+/).length;
const description =
  'Shell redovisar tredje kvartalet torsdagen 29 oktober 2026 kl 07:00 GMT med interim utdelning i samma annonsering. ' +
  'Energigrenens åttonde läspaket: P/E 10,3 mot grenens median 17,3, EV/EBIT 6,1 mot 13,4, ROIC 19,7 procent på en bruttomarginal i botten — ' +
  'supermajorprofilens fingeravtryck — samt återköpsprogrammet på 4,2 miljarder dollar som ska vara fullföljt på rappdagen, ' +
  'Q2-vändningen till 9,84 miljarder justerat och fem datavaktsprov: identitetstestet, bruttofällan, teckenkollisionen, valutaläxan och EBIT-diskonten.';

const paket = {
  slug: 'sa-laser-du-shell-q3-2026',
  title:
    'Shells kvartalsrapport 2026: så läser du den — energigrenens åttonde paket: P/E 10,3 mot medianen 17,3 och återköpen som slutar på rappdagen',
  description,
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-29',
  readingMinutes: Math.round(ord / 600),
  tags: ['kvartalsrapport', 'Shell', 'energi', 'olja', 'återköp', 'läspaket'],
  body,
};

const slut = 'data/blogg-utkast/kvartal/2026-q3/sa-laser-du-shell-q3-2026.json';
writeFileSync(new URL('../' + slut, import.meta.url), JSON.stringify(paket, null, 2) + '\n');
console.log(`skrev ${slut}`);
console.log(`ord ${ord} | readingMinutes ${paket.readingMinutes} | description ${description.length} tecken (seriens span 469–727)`);
if (description.length > 727) { console.error('FEL: description över seriens spann'); process.exit(1); }
if (ord < 2300 || ord > 3900) { console.error('FEL: ordantalet utanför seriens spann 2300–3900'); process.exit(1); }
