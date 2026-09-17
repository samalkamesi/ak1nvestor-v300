// Bygg sa-laser-du-samsung-q3-2026.json ur body-fil — fabrik auto-s4-1789679729562 s4-u2
import { readFileSync, writeFileSync } from 'node:fs';

const body = readFileSync('./verktyg/_s4-u2-samsung-body.md', 'utf8').trim();
const ord = body.split(/\s+/).filter(Boolean).length;
const minuter = Math.max(1, Math.round(ord / 600));

const post = {
  slug: 'sa-laser-du-samsung-q3-2026',
  title: "Samsungs kvartalsrapport Q3 2026: så läser du den — teknikgrenens cykelpaket: resultatet föll 74 procent och steg 132 på två år medan femårstillväxten blev minus 6,8, P/E 12,4 mot halvledartrions ASML 50 och TSMC 28 på samma bruttomarginalfamilj — seriens första Asien-paket i ren won",
  description: 'Samsung Electronics redovisar januari-september 2026 onsdagen 28 oktober (kalenderårsbokslut). Här är kvartalsrapportseriens 34:e läspaket — det första utanför Europa och Nordamerika: minnescykeln i fyra akter (resultat 54,7 som föll till 14,5 och återvände till 44,3 biljoner won medan intäkterna växte 3,4 procent per år), 2026 års supercykel i TTm-talen (omsättning +57,3 procent, bruttomarginal 57,5 mot femårsmedlets 36,2), halvledartrion ASML-TSMC-Samsung som tre priser på samma kedja, och datavakten där identitetstestet vägrar medan EV-kedjan och FCF-kontrollen stänger. Utbildning, inte råd.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-27',
  readingMinutes: minuter,
  tags: ['kvartalsrapport', 'Samsung', 'teknik', 'halvledare', 'nyckeltal', 'läspaket'],
  body,
};

const slut = JSON.stringify(post, null, 2) + '\n';
writeFileSync('./data/blogg-utkast/kvartal/2026-q3/sa-laser-du-samsung-q3-2026.json', slut);
console.log('SKREV paket: ord=' + ord + ' readingMinutes=' + minuter +
  ' title-tkn=' + post.title.length + ' desc-tkn=' + post.description.length);
