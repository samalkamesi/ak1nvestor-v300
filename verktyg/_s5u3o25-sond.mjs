// _s5u3o25-sond.mjs — sond mot 476-registrets alla textfält (s5-u3, omgång 25, manifest auto-s5-1789962309223)
// Söker tre kandidaters nyckeltermer i titel+summary+why+learn+chapters+chapters_list+sektioner+history.
import { readFileSync } from 'node:fs';

const reg = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));

function textOf(c) {
  const parts = [c.title, c.summary, c.why, c.learn, c.history && (c.history.origin + ' ' + c.history.evolution)];
  if (Array.isArray(c.chapters_list)) parts.push(c.chapters_list.map(k => k.title).join(' '));
  if (Array.isArray(c.chapters)) for (const k of c.chapters) {
    parts.push(k.title, k.intro);
    if (Array.isArray(k.blocks)) for (const b of k.blocks) parts.push(typeof b.content === 'string' ? b.content : JSON.stringify(b.content));
  }
  for (const s of ['lynchSection', 'grahamSection', 'ak1Section']) if (c[s]) parts.push(typeof c[s] === 'string' ? c[s] : JSON.stringify(c[s]));
  return parts.filter(Boolean).join(' ').toLowerCase();
}

const corpus = new Map();
for (const [slug, c] of Object.entries(reg)) corpus.set(slug, textOf(c));

function sond(term) {
  const t = term.toLowerCase();
  const agare = [];
  for (const [slug, txt] of corpus) if (txt.includes(t)) agare.push(slug);
  return agare;
}

const FRAGOR = [
  // bf-17-kandidat: hyperbolisk diskontering / tidspreferens
  ['hyperbolisk', 'bf'], ['tidspreferens', 'bf'], ['nutidsbias', 'bf'], ['kortsiktighet', 'bf'],
  ['fördröjd belöning', 'bf'], ['tålamod', 'bf'], ['marshmallow', 'bf'], ['diskonteringskurva', 'bf'],
  ['beteendemässig utmattning', 'bf'], ['utmattning', 'bf'], ['disciplin', 'bf'],
  // od-09-kandidat: försäkringsskrivande / premieinkomst
  ['sälja optioner', 'od'], ['sälja put', 'od'], ['premieinkomst', 'od'], ['kontanttäckt', 'od'],
  ['wheel', 'od'], ['volatilitetspremium', 'od'], ['försäkringspremie', 'od'], ['termstruktur', 'od'],
  ['contango', 'od'], ['backwardation', 'od'], ['försäkringsskriv', 'od'], ['inlösen', 'od'], [' Utfärdande', 'od'],
  ['utfärdar', 'od'], ['täckt köpoption', 'od'], ['gåva till marknaden', 'od'],
  // se-22-kandidat: byggentreprenad
  ['byggentreprenad', 'se'], ['entreprenad', 'se'], ['fastpris', 'se'], ['totalentreprenad', 'se'],
  ['skanska', 'se'], ['ncc', 'se'], ['peab', 'se'], ['veidekke', 'se'], ['byggkonjunktur', 'se'],
  ['bygglov', 'se'], ['byggbransch', 'se'], ['byggsektorn', 'se'], ['generalentreprenör', 'se'],
  ['garantitid', 'se'], ['förskottsbetalning', 'se'], ['slitagedel', 'se'],
  // kollisionskoll: syskonens tänkbara nästa steg (läser bara)
  ['kapitalstruktur', 'ks-lys'], ['aktiv ägare', 'ib-lys'], ['shortseller', 'rk-lys'], ['bostad', 'ma-lys'],
];

console.log('Register:', Object.keys(reg).length, 'kurser\n');
for (const [term, fam] of FRAGOR) {
  const a = sond(term);
  console.log(`[${fam}] "${term}": ${a.length} träffar${a.length ? ' → ' + a.slice(0, 12).join(', ') + (a.length > 12 ? ' …' : '') : ''}`);
}
