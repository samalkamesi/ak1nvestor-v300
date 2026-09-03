// Pass 3: globala residualrättningar inom batch C (ytterligare instanser i ej samplade kapitel)
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'deep-courses.json');
const raw = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);
const trailingNL = /\n$/.test(raw);
const body = raw.replace(/\n+$/, '');
const FMT = (JSON.stringify(data, null, 2) === body) ? 2 : (JSON.stringify(data) === body ? 0 : null);
if (FMT === null) { console.error('FEL: round-trip matchar inte. Avbryter.'); process.exit(1); }

const batch = Object.keys(data).sort().slice(168, 252);

// Ordnade ersättningar: tidiga rader först (beroenden)
const G = [
  ['förlöpå värde', 'förlora värde'],
  ['är äkta bokens ända?', 'är äkta enligt bokens ände?'],
  ['kurvartiken', 'kurvigheten'],
  ['kurvartik', 'kurvighet'],
  ['bokens ända', 'bokens ände'],
  ['aktiedepö', 'aktiedepå'],
  ['att att ', 'att '],
  ['lönär ', 'lönar '],
  ['VD:är', 'VD:ar'],
  ['Sekorns utveckling', 'Sektorns utveckling'],
  ['utspäddar', 'utspäder'],
  ['Sanna mästerskap', 'Sant mästerskap'],
  ['underliggende', 'underliggande'],
  ['operational effektivitet', 'operativ effektivitet'],
  ['systematisk approach som går bortom', 'systematiskt angreppssätt som går bortom'],
  ['en disciplinerad och systematisk approach som', 'ett disciplinerat och systematiskt angreppssätt som'],
  ['löpå', 'löpa'],
  ['multiplelnivå', 'multipelnivå'],
  ['utanförperspektet', 'utanförperspektivet'],
  ['motgifet:', 'motgiften:'],
  ['exponeringsiffror', 'exponeringssiffror'],
  ['CDO-alcin', 'CDO-alkemi'],
  ['Kelly-ärftet', 'Kelly-arvet'],
  ['journal och revy', 'journal och genomgång'],
  ['trängs och tvinar', 'trängs och tunnas ut'],
  ['Fibonacci-retrakt', 'Fibonacci-retracements'],
  ['stressresponen', 'stressresponsen'],
  ['den fina ledarskapets', 'det fina ledarskapets'],
  ['nobelpristag', 'Nobelpristag'],
  ['åndning', 'andning'],
  ['egetkonto', 'eget konto'],
  ['speltilverkare', 'speltillverkare'],
  ['prisMÅL', 'prismål'],
  ['utbuds zon', 'utbudszon'],
  ['inte en läg utan undantag', 'inte en lag utan undantag'],
  ['av ett mönster, inte en läg', 'av ett mönster, inte en lag'],
  ['första läg', 'första lag'],
  ['Kassacykelns läg', 'Kassacykelns lag'],
  ['story tillsatt att dominera', 'story tillåts att dominera'],
];

let tot = 0;
const perKey = {};
for (const k of batch) {
  const obj = data[k];
  let s = JSON.stringify(obj);
  let changed = false;
  for (const [f, r] of G) {
    if (s.includes(f)) { const n = s.split(f).length - 1; s = s.split(f).join(r); tot += n; perKey[k] = (perKey[k] || 0) + n; changed = true; }
  }
  if (changed) {
    const parsed = JSON.parse(s);
    Object.keys(obj).forEach(x => delete obj[x]);
    Object.assign(obj, parsed);
  }
}
for (const [k, n] of Object.entries(perKey)) console.log(k + ' | ' + n + ' ersättningar');
console.log('Totalt pass 3:', tot);

const out = (FMT === 2 ? JSON.stringify(data, null, 2) : JSON.stringify(data)) + (trailingNL ? '\n' : '');
JSON.parse(out);
fs.writeFileSync(FILE, out, 'utf8');
console.log('Klar. Storlek:', out.length);
