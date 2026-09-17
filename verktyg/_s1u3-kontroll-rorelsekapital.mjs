#!/usr/bin/env node
// s1-u3 (auto-s1-1789649728193): maskinell granskning av rorelsekapital-och-kassstrom.json
// (m9-tillskott våg 171 #3). Läser endast: utkast-JSON, bolagsunivers.json @ 0e399f13
// (115-versionen, den som gällde vid bygget 09-15 23:59) + aktuell version som notis,
// varumarke.json, deep-courses.json, data/blogg/. Skriver inget.
import { readFileSync, existsSync } from 'node:fs';

const UT = '/home/ak1a/AK1/data/blogg-utkast/rorelsekapital-och-kassstrom.json';
const u = JSON.parse(readFileSync(UT, 'utf8'));
const vm = JSON.parse(readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const body = u.body;
const rader = body.split('\n');
const R = [];
const GRON = [], ROD = [];

// 0) KÄLLOR — bolagsunivers @ 0e399f13 (115) och aktuell
const u115 = JSON.parse(readFileSync('/tmp/s1u3-bolagsunivers-115.json', 'utf8'));
const uNu = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
R.push(`UNIVERSUM: @0e399f13 (09-15 20:31, byggversion) = ${u115.length} bolag — utkastet påstår 115: ${u115.length === 115 ? 'STÄMMER' : 'AVVIKER'}`);
R.push(`UNIVERSUM NU: aktuell fil = ${uNu.length} bolag (notis: filen växer av dataset-spåret; utkastets tal SKA granskas mot 115-versionen)`);
const hamtat = new Set();
u115.forEach(b => (b.kallor || []).forEach(k => hamtat.add(`${k.namn} ${k.hamtat}`)));
R.push(`KÄLOR I FILEN: ${[...hamtat].slice(0, 4).join(' | ')} — utkastets källnotis "Yahoo Finance och MarketStack, insamling 2026-09-03": ${[...hamtat].every(h => h.includes('2026-09-03')) && [...hamtat].every(h => h.includes('Yahoo') || h.includes('MarketStack')) ? 'STÄMMER' : 'KONTROLLERA'}`);

// 1) Konverteringsgrad-omräkning (FCF-marginal ÷ nettomarginal, härledd — som utkastet deklarerar)
const matabara = u115.filter(b => b.lonksamhet?.fcfMarginal != null && b.lonksamhet?.nettoMarginal != null);
R.push(`MÄTBARA: ${matabara.length} av ${u115.length} — utkastet påstår 97: ${matabara.length === 97 ? 'STÄMMER' : 'AVVIKER (' + matabara.length + ')'}`);
const kvoter = matabara.map(b => ({ ticker: b.ticker, namn: b.namn, n: b.lonksamhet.nettoMarginal, f: b.lonksamhet.fcfMarginal, k: b.lonksamhet.fcfMarginal / b.lonksamhet.nettoMarginal })).sort((a, b) => a.k - b.k);
const median = (a) => a.length % 2 ? a[(a.length - 1) / 2].k : (a[a.length / 2 - 1].k + a[a.length / 2].k) / 2;
const med = median(kvoter);
const med1dec = Math.round(med * 100) / 100;
R.push(`MEDIAN kvot: ${med.toFixed(4)} → ${med1dec.toFixed(2)} — utkastet påstår 0,84: ${Math.abs(med1dec - 0.84) < 0.005 ? 'STÄMMER' : 'AVVIKER (' + med1dec.toFixed(2) + ')'}`);
const over1 = kvoter.filter(q => q.k > 1.0).length;
const under05 = kvoter.filter(q => q.k < 0.5).length;
R.push(`> 1,0: ${over1} — utkastet påstår 37: ${over1 === 37 ? 'STÄMMER' : 'AVVIKER (' + over1 + ')'}`);
R.push(`< 0,5: ${under05} — utkastet påstår 26: ${under05 === 26 ? 'STÄMMER' : 'AVVIKER (' + under05 + ')'}`);
// variant utan negativa nämnare (om talen avviker — dokumentation av metodkänslighet)
const posN = kvoter.filter(q => q.n > 0);
R.push(`VARIANT endast netto>0: n=${posN.length}, median=${median(posN).toFixed(4)}, >1,0: ${posN.filter(q=>q.k>1).length}, <0,5: ${posN.filter(q=>q.k<0.5).length}`);

// 2) Tabellens fyra bolag
const hitta = (txt) => u115.find(b => (b.namn || '').toLowerCase().includes(txt) || (b.ticker || '').toLowerCase().includes(txt));
const tabell = [
  ['H&M', 'hm-b', 5.6, 10.1, 1.82],
  ['Atlas Copco', 'atco', 15.7, 15.3, 0.98],
  ['SKF', 'skf', 5.0, 3.5, 0.70],
  ['Volvo Car', 'volcar', 2.8, -4.5, -1.61],
];
for (const [namn, tick, nE, fE, kE] of tabell) {
  const b = hitta(tick);
  if (!b) { R.push(`TABELL ${namn}: EJ HITTAD i universumet — ROD`); ROD.push(`${namn} saknas i källfilen`); continue; }
  const n = b.lonksamhet?.nettoMarginal, f = b.lonksamhet?.fcfMarginal;
  const nAv = Math.abs(n - nE) <= 0.051, fAv = Math.abs(f - fE) <= 0.051;
  const kRakn = f / n, kAv = Math.abs(Math.round(kRakn * 100) / 100 - kE) <= 0.011;
  // alt: kvot ur avrundade visningstal
  const kVis = Math.round((fE / nE) * 100) / 100;
  const ok = nAv && fAv && (kAv || Math.abs(kVis - kE) <= 0.011);
  R.push(`TABELL ${namn} (${b.ticker}): källa n=${n} f=${f} → kvot=${kRakn.toFixed(4)} (ur visningstal ${nE}/${fE}=${kVis.toFixed(2)}) — utkast ${nE}/${fE}/${kE}: netto ${nAv ? '✓' : '✗'}, fcf ${fAv ? '✓' : '✗'}, kvot ${kAv ? '✓' : (Math.abs(kVis - kE) <= 0.011 ? '✓(visningstal)' : '✗')}`);
  if (!ok) ROD.push(`${namn}: källa ${n}/${f}/kvot ${kRakn.toFixed(3)} mot utkast ${nE}/${fE}/${kE}`);
  else GRON.push(`${namn}-raden`);
}

// 3) kontrolleraText-replik (varumarke.jsons egna regexer) på titel + desc + varje kroppsrad
let fel = 0, varningar = 0; const traffor = [];
for (const f of vm.forbjudnaFraser) {
  let re;
  try { re = new RegExp(f.fran, 'giu'); } catch (e) { R.push(`REGEX-FEL ${f.fran}: ${e.message}`); continue; }
  const targets = [[u.title, 'title'], [u.description, 'desc'], ...rader.map((r, i) => [r, `rad${i}`])];
  for (const [t, namn] of targets) {
    re.lastIndex = 0;
    const m = re.exec(t);
    if (m) { (f.allvar === 'FEL' ? fel++ : varningar++); traffor.push(`${f.allvar}: "${m[0]}" (${namn}) — ${f.motiv}`); }
  }
}
R.push(`VARUMARKE-GRIND: ${fel} FEL, ${varningar} varningar av ${vm.forbjudnaFraser.length} mönster (=kontrolleraText-replik)`);
traffor.forEach(t => R.push('  ' + t));
if (fel === 0) GRON.push('varumärkesgrind 0 FEL');

// 4) Struktur
const falt = Object.keys(u);
R.push(`FÄLT: ${falt.length} st (${falt.join(', ')}) — BlogPost 9 fält: ${falt.length === 9 ? '✓' : '✗'}`);
const ord = body.trim().split(/\s+/).filter(w => /\p{L}/u.test(w)).length;
R.push(`ORD: ${ord} (guide-span 800–1 400; denna är m9-tillskott — kontrollera mot syskon)`);
R.push(`TITLE: "${u.title}" = ${u.title.length} tkn (≤ 60: ${u.title.length <= 60 ? '✓' : '✗'})`);
R.push(`DESC(OG): ${u.description.length} tkn (≤ 155: ${u.description.length <= 155 ? '✓' : '✗'})`);
R.push(`READINGMINUTES: ${u.readingMinutes} — kontrakt round(ord/600) = ${Math.round(ord / 600)}`);
const h2 = rader.filter(r => r.startsWith('## '));
R.push(`H2: ${h2.length} st: ${h2.map(h => h.slice(3, 45)).join(' | ')}`);
const sok = 'rörelsekapital';
R.push(`SÖKORD "${sok}": title=${u.title.toLowerCase().includes(sok)}, ingress=${rader[0].toLowerCase().includes(sok)}, någon H2=${h2.some(h => h.toLowerCase().includes(sok))}`);
const sista = [...rader].reverse().find(r => r.trim() !== '');
R.push(`DISCLAIMER SIST: "${sista.trim().slice(0, 80)}" — negerat investeringsråd: ${/inte investeringsråd/i.test(sista)}`);
R.push(`BODY-LÄNGD: ${body.length} tkn (krav ≥ 800)`);
// pillar-giltighet: de 6 pelarna bland publicerade poster
const bloggDir = '/home/ak1a/AK1/data/blogg/';
import { readdirSync } from 'node:fs';
const pillars = new Set();
for (const f of readdirSync(bloggDir)) { if (f.endsWith('.json')) { try { pillars.add(JSON.parse(readFileSync(bloggDir + f, 'utf8')).pillar); } catch {} } }
R.push(`PILLAR "${u.pillar}": giltig bland publicerade (${[...pillars].join(', ')}): ${pillars.has(u.pillar) ? '✓' : '✗'}`);
R.push(`AUTHOR: ${u.author} — korrekt: ${u.author === 'AK1A Research Lab' ? '✓' : '✗'}`);
R.push(`SLUG: ${u.slug} ^[a-z0-9-]+$: ${/^[a-z0-9-]+$/.test(u.slug) ? '✓' : '✗'}`);

// 5) 911-referenser (sex mönster, seriestandard)
const p911 = [['911', /911/], ['9/11', /9\s*\/\s*11/], ['11 september', /11\s+september/i], ['september 11', /september\s*11/i], ['nine-eleven', /nine[\s\-]?eleven/i], ['9-1-1', /9[\s\-]1[\s\-]1/]];
let a911 = 0;
for (const [namn, re] of p911) {
  const m = (u.title + ' ' + u.description + ' ' + body).match(re);
  if (m) { a911++; R.push(`911-TRÄFF ${namn}: "${m[0]}"`); }
}
R.push(`911-REFERENSER: ${a911} träffar på ${p911.length} mönster`);
if (a911 === 0) GRON.push('911 = 0/6');

// 6) Rådverb + lagrum
const rad = (body + ' ' + u.title + ' ' + u.description).match(/\b(köp|sälj|rekommenderar|undvik|tipsa|aktietips|råd)\b/gi) || [];
R.push(`RÄDVERB/KVP-ORD: ${rad.length} träffar: ${[...new Set(rad.map(s => s.toLowerCase()))].join(', ') || '—'}`);
const lag = ['2007:528', '2022:260', '2022:261', '1985:716', '2005:59', '2022:482'].filter(l => (body + u.title + u.description).includes(l));
R.push(`LAGRUM i texten: ${lag.length ? lag.join(', ') : 'inga (därmed ingen blandningsrisk; 2007:528 gäller granskarens dom, inte textens)'}`);

// 7) Mjuka bindestreck + tankestreck-hygien
const mjuka = (body.match(/[\u2010\u2011]/g) || []).length;
R.push(`MJUKA BINDESTRECK: ${mjuka}`);

// 8) Interna länkar — register + HTTP
const lankar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
R.push(`LÄNKAR: ${lankar.length} st`);
const dc = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
let kurser = new Set();
const gor = (o) => { if (o && typeof o === 'object') { for (const k of ['id', 'slug', 'kursId', 'url']) if (typeof o[k] === 'string') kurser.add(o[k]); Object.values(o).forEach(gor); } };
gor(dc);
for (const l of lankar) {
  if (l.startsWith('/kurser/')) {
    const id = l.replace('/kurser/', '');
    const ok = kurser.has(id) || kurser.has('/kurser/' + id);
    R.push(`  ${l} → deep-courses: ${ok ? 'FINNS' : 'SAKNAS'}`);
    if (!ok) ROD.push(`länk ${l} saknas i kursregistret`);
  } else if (l.startsWith('/blogg/')) {
    const slug = l.replace('/blogg/', '');
    const live = existsSync(`/home/ak1a/AK1/data/blogg/${slug}.json`);
    R.push(`  ${l} → data/blogg live: ${live ? 'FINNS' : 'SAKNAS'}${live ? '' : ' (utkast?' + (existsSync(`/home/ak1a/AK1/data/blogg-utkast/${slug}.json`) ? ' JA — FEL: länk till outgivet utkast)' : ' NEJ — DÖD LÄNK)')}`);
    if (!live) ROD.push(`länk ${l} ej publicerad`);
  } else R.push(`  ${l} → ANNAN SÖKVÄG`);
}

// 9) Aritmetik räkneexempel
const matte = [
  ['cykelexempel 10+5−8', 10 + 5 - 8, 7],
];
for (const [namn, raknad, expect] of matte) {
  R.push(`MATTE ${namn}: ${raknad} == ${expect}: ${raknad === expect ? '✓' : '✗'}`);
  if (raknad === expect) GRON.push(namn);
}
// tabellkvoter ur visningstal
const kvotVis = [['H&M', 10.1 / 5.6], ['Atlas Copco', 15.3 / 15.7], ['SKF', 3.5 / 5.0], ['Volvo Car', -4.5 / 2.8]];
for (const [n, v] of kvotVis) R.push(`KVOT(visningstal) ${n}: ${v.toFixed(4)}`);

// Sammanfattning
R.push('---');
R.push(`SAMMANFATTNING: gröna=${GRON.length}, röda fynd=${ROD.length}`);
ROD.forEach(x => R.push('ROD: ' + x));
console.log(R.join('\n'));
