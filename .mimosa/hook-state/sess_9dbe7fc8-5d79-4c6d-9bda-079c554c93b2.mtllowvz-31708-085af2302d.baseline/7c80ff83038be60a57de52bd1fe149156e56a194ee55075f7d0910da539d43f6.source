// Pass 2: korrigerade fyndsträngar för de 13 missade rättningarna
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'deep-courses.json');
const raw = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);
const trailingNL = /\n$/.test(raw);
const body = raw.replace(/\n+$/, '');
const FMT = (JSON.stringify(data, null, 2) === body) ? 2 : (JSON.stringify(data) === body ? 0 : null);
if (FMT === null) { console.error('FEL: round-trip matchar inte. Avbryter.'); process.exit(1); }

function applyTo(obj, find, replace, key) {
  const before = JSON.stringify(obj);
  if (!before.includes(find)) { console.log('MISS ' + key + ' | ' + find); return; }
  const after = before.split(find).join(replace);
  const parsed = JSON.parse(after);
  Object.keys(obj).forEach(k => delete obj[k]);
  Object.assign(obj, parsed);
  console.log('OK   ' + key + ' | ' + find);
}

const F = {
  'rk-01-kapitalforbranning': [['AK1M använder kapitalförbränning', 'AKM1 använder kapitalförbränning']],
  'rk-02-emissionrisk': [['finansierer en strategisk initiativ', 'finansierar ett strategiskt initiativ']],
  'rk-05-cykelrisk': [['kan anpassas sig när marknaden', 'kan anpassa sig när marknaden']],
  'rk-06-regulatorisk-risk': [['Han skulle letta efter tecken', 'Han skulle leta efter tecken']],
  'se-01-saassektorn': [['analys av en SaaS-företags finansiella hälsa', 'analys av ett SaaS-företags finansiella hälsa']],
  'se-03-forsvarssektorn': [['inte bara tillverkommer enskilda plattformar', 'inte bara tillverkar enskilda plattformar']],
  'se-04-logistiksektorn': [['manifesteras i en organisationens förmåga', 'manifesteras i en organisations förmåga']],
  'se-05-lyxsektorn': [
    ['vilket skaper en prispåslag', 'vilket skapar ett prispåslag'],
    ['mellan datadriverna insikter', 'mellan datadrivna insikter'],
  ],
  'the-everything-store': [['det bolag som Aktieanalytiker missförstod', 'det bolag som aktieanalytiker missförstod']],
  'pf-13-esgportfolj': [['Esg-portfölj: Ett koncept', 'ESG-portfölj: Ett koncept']],
};
for (const [key, list] of Object.entries(F)) for (const [f, r] of list) applyTo(data[key], f, r, key);

const out = (FMT === 2 ? JSON.stringify(data, null, 2) : JSON.stringify(data)) + (trailingNL ? '\n' : '');
JSON.parse(out);
fs.writeFileSync(FILE, out, 'utf8');
console.log('Klar. Storlek:', out.length);
