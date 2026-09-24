// rond 147 v3: läsguidegranskning med tre bevisade grunder-kurer
// (1) källrad-regex Källor? träffade ALDRIG "Källa" (saknade a-gren) — kurad
// (2) nakna url:er (icke-markdown) räknas som källmarkörer — r146:s H&M-läxa
// (3) citattak med intilliggande parning (udda/jämna segment) — prosaparning var falsk
// Kontrakt oförändrat: utbildningsdisclaimer · metod aldrig råd · citat ≤200 ord · källa per tal · struktur
import fs from 'node:fs';
import path from 'node:path';

const KATALOG = '/home/ak1a/AK1/data/blogg-utkast/rapportakademin';
const NEGERING = /(inte\b|ingen\b|inga\b|aldrig\b|ej\b|varken\b|utbildning\b|pedagogisk\b)/i;
const RADVERB = /\b(köp aktien|sälj aktien|rekommenderar att (du )?(köper|säljer)|borde köpa|bör köpa|bör sälja|skynda att köpa|det är en köprekommendation)\b/gi;

const granska = (fil) => {
  const text = fs.readFileSync(path.join(KATALOG, fil), 'utf8');
  const rader = text.split('\n');
  const ord = text.split(/\s+/).filter(Boolean).length;
  const fynd = { fil, ord, problem: [], bevis: {} };

  // 1. RÅD-VERB (oförändrat från v1/v2 — validarat i r146)
  const äkta = [];
  for (const m of text.matchAll(RADVERB)) {
    const start = Math.max(0, m.index - 100);
    const kontext = text.slice(start, m.index + m[0].length + 100);
    if (!NEGERING.test(kontext)) äkta.push(kontext.replace(/\s+/g, ' ').slice(0, 160));
  }
  if (äkta.length) { fynd.problem.push(`${äkta.length} äkta råd-verb`); fynd.bevis.rådverb = äkta.slice(0, 3); }

  // 2. DISCLAIMER (oförändrad)
  const slutexten = rader.slice(-10).join(' ');
  const harDisclaimer = /(utbildning|pedagogisk)/i.test(slutexten) && /(inte|ingen|aldrig|ingenting).{0,40}(investeringsråd|rådgivning|uppmaning)/i.test(slutexten);
  if (!harDisclaimer) fynd.problem.push('utbildningsdisclaimer med rådgivningsavstående saknas i slutet');
  else fynd.bevis.disclaimer = slutexten.replace(/\s+/g, ' ').slice(-160);
  fynd.bevis.lagrum = /2007:528/.test(text) ? 'bär lagrum (överkontrakt)' : 'lagrum utelämnat (kontrakt kräver ej)';

  // 3. KÄLLA PER TAL — tre giltiga markörer: sidhänvisningar (även "sidorna 2 och 19–31"), Källa-rader (även "Källa"), url:er (markdown ELLER nakna)
  const sidref = (text.match(/\((?:s\.|sid\.?|sida[nr]?|sidorna|sidor)\s?\d/gi) || []).length;
  const kallrader = (text.match(/^\s*\*{0,2}K[äa]ll(a|or)?\b/mig) || []).length;
  const lankar = (text.match(/https?:\/\/\S+/g) || []).length;
  const kallor = sidref + kallrader + lankar;
  if (kallor < 3) fynd.problem.push(`endast ${kallor} källmarkörer (sidref ${sidref} + Källa-rader ${kallrader} + url:er ${lankar})`);
  else fynd.bevis.kallor = `${kallor} (sidref ${sidref} + Källa-rader ${kallrader} + url:er ${lankar})`;

  // 4. CITATTAK ≤200 ord — intilliggande parning: udda index i split('"') = äkta citerat innehåll
  const segment = text.split('"');
  const citerade = [];
  for (let i = 1; i < segment.length; i += 2) citerade.push(segment[i]);
  const over = citerade.filter(s => s.split(/\s+/).filter(Boolean).length > 200);
  const langsta = citerade.reduce((m, s) => Math.max(m, s.split(/\s+/).filter(Boolean).length), 0);
  if (over.length) fynd.problem.push(`${over.length} äkta citat över 200 ord (längsta ${langsta} ord)`);
  else fynd.bevis.citattak = `${citerade.length} citat, längsta ${langsta} ord — alla under taket`;

  // 5. Längd + struktur (oförändrad)
  if (ord < 800 || ord > 4000) fynd.problem.push(`ordantal ${ord} utanför band 800–4000`);
  const h2 = (text.match(/^##[^#]/gm) || []).length;
  if (h2 < 3) fynd.problem.push(`endast ${h2} ## rubriker (minst 3)`);
  else fynd.bevis.h2 = h2;
  if (!(text.includes('|---') || text.includes('| ---'))) fynd.problem.push('ingen nyckeltalstabell hittad');
  else fynd.bevis.tabell = true;

  fynd.dom = fynd.problem.length === 0 ? 'KONTRAKTHÅLLEN' : 'AVVIKELSE';
  return fynd;
};

const filer = fs.readdirSync(KATALOG).filter(f => f.endsWith('.md')).sort();
const resultat = filer.map(granska);
const heldna = resultat.filter(r => r.dom === 'KONTRAKTHÅLLEN').length;

const rapport = {
  ts: new Date().toISOString(),
  rond: 147,
  verktyg: 'v3 — tre kurer: Källa-regex a-gren · nakna url:er räknas · citat intilliggande parning (prosaparning bevisad falsk i ABB: längsta äkta citat 8 ord)',
  antal: resultat.length,
  kontraktshallna: heldna,
  resultat: resultat.map(r => ({ fil: r.fil, dom: r.dom, ord: r.ord, problem: r.problem, bevis: r.bevis })),
};
fs.writeFileSync('/home/ak1a/agent/ak1/data/vakten/r147-lasguidegranskning.json', JSON.stringify(rapport, null, 1));

for (const r of resultat) {
  console.log(`${r.dom === 'KONTRAKTHÅLLEN' ? '✓' : '✗'} ${r.fil} · ${r.ord} ord · ${r.bevis.kallor || '?'} · ${r.bevis.citattak || 'citat?'}`);
  for (const p of r.problem) console.log(`    ✗ ${p}`);
}
console.log(`\nSAMMANFATTNING: ${heldna}/${resultat.length} kontraktshållna`);
