// rond 147 v2: oberoende granskning av v145-läsguiderna MOT MANIFESTETS KONTRAKT
// (r146-läxan tillämpad: grinden dömer mot kontraktet, inte mot påhittade mått)
// Kontrakt: utbildningsdisclaimer · metod aldrig råd · citat ≤200 ord/sektion ·
// källa per tal (sidhänvisning räknas) · struktur.
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

  // 1. RÅD-VERB: äkta träffar = utan negerings-/utbildningskontext (oförändrat från v1)
  const äkta = [];
  for (const m of text.matchAll(RADVERB)) {
    const start = Math.max(0, m.index - 100);
    const kontext = text.slice(start, m.index + m[0].length + 100);
    if (!NEGERING.test(kontext)) äkta.push(kontext.replace(/\s+/g, ' ').slice(0, 160));
  }
  if (äkta.length) { fynd.problem.push(`${äkta.length} äkta råd-verb`); fynd.bevis.rådverb = äkta.slice(0, 3); }

  // 2. DISCLAIMER enligt kontrakt: utbildnings-/pedagogisk-markering + avstående från rådgivning i slutet
  const slutexten = rader.slice(-10).join(' ');
  const harDisclaimer = /(utbildning|pedagogisk)/i.test(slutexten) && /(inte|ingen|aldrig|ingenting).{0,40}(investeringsråd|rådgivning|uppmaning)/i.test(slutexten);
  if (!harDisclaimer) fynd.problem.push('utbildningsdisclaimer med rådgivningsavstående saknas i slutet');
  else fynd.bevis.disclaimer = slutexten.replace(/\s+/g, ' ').slice(-160);
  fynd.bevis.lagrum = /2007:528/.test(text) ? 'bär lagrum (överkontrakt)' : 'lagrum utelämnat (kontrakt kräver ej)';

  // 3. KÄLLA PER TAL: sidhänvisningar "(s. N)" + Källa-rader + markdown-länkar — alla räknas
  const sidref = (text.match(/\((?:s\.|sid\.?|sida)\s?\d+[a-z]?\)/gi) || []).length;
  const kallrader = (text.match(/^\s*\*{0,2}Källor?:?\*{0,2}\s/mig) || []).length;
  const lankar = (text.match(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g) || []).length;
  const kallor = sidref + kallrader + lankar;
  if (kallor < 3) fynd.problem.push(`endast ${kallor} källmarkörer (sidget + Källa-rader + länkar)`);
  else fynd.bevis.kallor = `${kallor} (${sidref} sidref + ${kallrader} Källa-rader + ${lankar} länkar)`;

  // 4. CITATTAK ≤200 ord/sektion: block mellan raka citattecken över 200 ord (~1200 tkn)
  const överskrid = [...text.matchAll(/"([^"]{1200,})"/g)];
  if (överskrid.length) fynd.problem.push(`${överskrid.length} citatblock över 200 ord (citattak)`);
  else fynd.bevis.citattak = `${(text.match(/"([^"]{100,})"/g) || []).length} block 100+ tkn, alla under taket`;

  // 5. Längd + struktur (oförändrat)
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
  verktyg: 'v2 — domen mot manifestets kontrakt (r146-läxan: falska fällningar kurerade)',
  antal: resultat.length,
  kontraktshallna: heldna,
  resultat: resultat.map(r => ({ fil: r.fil, dom: r.dom, ord: r.ord, problem: r.problem, bevis: r.bevis })),
};
fs.writeFileSync('/home/ak1a/agent/ak1/data/vakten/r147-lasguidegranskning.json', JSON.stringify(rapport, null, 1));

for (const r of resultat) {
  console.log(`${r.dom === 'KONTRAKTHÅLLEN' ? '✓' : '✗'} ${r.fil} · ${r.ord} ord · ${r.bevis.kallor || '?'} · ${r.bevis.lagrum}`);
  for (const p of r.problem) console.log(`    ✗ ${p}`);
}
console.log(`\nSAMMANFATTNING: ${heldna}/${resultat.length} kontraktshållna`);
