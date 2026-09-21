#!/usr/bin/env node
// _s4u3-mtg-kvd.mjs — KVD för MTG-B Q3-läspaket 2026 (s4-u3)
// Oberoende av byggmotorn: rådata hårdkodad här + universumfilen läses om.
// Användning: node verktyg/_s4u3-mtg-kvd.mjs [--http]
import fs from 'node:fs';
import crypto from 'node:crypto';

const HTTP = process.argv.includes('--http');
const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-mtg-b-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';

let pass = 0, fel = 0, varning = 0;
const felposter = [], varnposter = [];
const fejl = (namn, motiv) => { fel++; felposter.push(`${namn}: ${motiv}`); };
const warn = (namn, motiv) => { varning++; varnposter.push(`${namn}: ${motiv}`); };

const p = JSON.parse(fs.readFileSync(PAKET, 'utf8'));
const uniRaw = fs.readFileSync(UNI);
const md5 = crypto.createHash('md5').update(uniRaw).digest('hex');
const uni = JSON.parse(uniRaw);
const mz = uni.find(b => b.ticker === 'MTG-B.ST');
const B = p.body.replace(/\u00a0/g, ' '), T = p.title, D = p.description;

const num = s => parseFloat(String(s).replace(/\s/g, '').replace(/,/g, '.').replace(/[−–]/g, '-'));
const MM = '[−-]';
function hitta(namn, re, gruppa, forvantat, tol, motiv) {
  const re2 = re.flags.includes('g') ? re : new RegExp(re.source, re.flags + 'g');
  const m = [...B.matchAll(re2)];
  if (!m.length) return fejl(namn, `frasen hittas inte: ${re.source}`);
  const fick = m.map(x => x[gruppa]).filter(v => v != null).map(num);
  if (!fick.some(v => Math.abs(v - forvantat) <= tol)) return fejl(namn, `väntade ≈${forvantat} (tol ${tol}), fann ${fick.join(' | ')} — ${motiv}`);
  pass++;
}

// ---------- 1. STRUKTUR ----------
const h2 = [...B.matchAll(/^## (.+)$/gm)].map(m => m[1]);
const vantaH2 = ['Urvalet: varför MTG är nästa paket i serien', 'Nyckeltalen att ha med sig — med tio EPS-världar i ryggsäcken', 'Källkritiken: P/E-klyftan som tiofaldig — och en källa som saknar dubbelkoll', 'Kvartalskedjan: rekordmarginaler på en GAAP-förlust', 'Så står sig bolaget mot branschen', 'Tre sätt att läsa utfallet — övningar i metod', 'Praktiskt inför torsdagen 5 november', 'Källor'];
h2.length === 8 && h2.every((h, i) => h === vantaH2[i]) ? pass++ : fejl('struktur/h2', `fick ${JSON.stringify(h2)}`);
p.slug === 'sa-laser-du-mtg-b-q3-2026' ? pass++ : fejl('struktur/slug', p.slug);
T.startsWith('MTG Q3-rapport 2026: så läser du den') ? pass++ : fejl('struktur/title', 'titelns led saknas');
D.length >= 600 && D.length <= 950 ? pass++ : warn('struktur/description', `${D.length} tecken utanför 600–950`);
/Publicering av utkastet är kundens beslut \(R2\)\.$/.test(B.trimEnd().split('\n').pop()) ? pass++ : fejl('struktur/disclaimer', 'sista raden är inte disclaimern');
const ord = B.trim().split(/\s+/).length;
ord >= 2200 && ord <= 3400 ? pass++ : warn('struktur/ord', `${ord} ord utanför 2200–3400`);
p.readingMinutes >= 4 && p.readingMinutes <= 6 ? pass++ : fejl('struktur/rm', `${p.readingMinutes} min`);
p.tags.includes('MTG') && p.tags.includes('kommunikation') && p.tags.includes('läspaket') ? pass++ : fejl('struktur/tags', JSON.stringify(p.tags));
p.publishedAt === '2026-11-05' ? pass++ : fejl('struktur/datum', p.publishedAt);

// ---------- 2. UNIVERSUMPARITET ----------
const fp = [
  ['pris', new RegExp(`kursen (${MM}?\\d+,\\d\\d) kronor`), 1, mz.pris, 0.005],
  ['mcap', /(\d+,\d+) miljarder kronor i börsvärde/, 1, mz.marknadsKapitalMdr, 0.0005],
  ['pe', new RegExp(`universumfältet säger (${MM}?\\d+,\\d+),`), 1, mz.vardering.pe, 0.06],
  ['pe-tabell', /\| P\/E \| (-?\d+,\d+) \|/, 1, mz.vardering.pe, 0.06],
  ['pb', new RegExp(`ska ge P\/E: ${MM}?(\\d+,\\d+) \/`), 1, mz.vardering.pb, 0.0005],
  ['pb-tabell', /\| P\/B \| (-?\d+,\d+) \|/, 1, mz.vardering.pb, 0.0005],
  ['evEbit', /\*\*EV\/EBIT (-?\d+,\d+)\*\*/, 1, mz.vardering.evEbit, 0.06],
  ['peg', /\*\*PEG (-?\d+,\d\d)\*\*/, 1, mz.vardering.peg, 0.005],
  ['fcfYield', /\*\*FCF-avkastning (-?\d+,\d+) %\*\*/, 1, mz.vardering.fcfYield * 100, 0.005],
  ['fcfM', /FCF-marginal (-?\d+,\d+) %\)/, 1, mz.lonksamhet.fcfMarginal * 100, 0.005],
  ['roe', /ROE\]\([^)]+\) (-?\d+,\d+) % mot median/, 1, mz.lonksamhet.roe * 100, 0.005],
  ['roic', /ROIC\]\([^)]+\) (-?\d+,\d+) % mot/, 1, mz.lonksamhet.roic * 100, 0.005],
  ['brutto', /bruttomarginal\]\([^)]+\) (-?\d+,\d+) % mot/, 1, mz.lonksamhet.bruttoMarginal * 100, 0.05],
  ['ebitM', /EBIT-marginal (-?\d+,\d+) %;/, 1, mz.lonksamhet.ebitMarginal * 100, 0.05],
  ['nettoM', /nettomarginal\]\([^)]+\) (-?\d+,\d+) % mot/, 1, mz.lonksamhet.nettoMarginal * 100, 0.005],
  ['skuldEk', new RegExp(`skuld\/eget kapital (${MM}?\\d+,\\d+)`), 1, mz.stabilitet.skuldEgenkapital, 0.005],
  ['omsCAGR', /\+(-?\d+,\d) procent per år/, 1, mz.tillvaxt.omsattningCAGR5ar * 100, 0.05],
  ['ttm', new RegExp(`omsattningstillvaxt-ttm\\) \\+(-?\\d+,\\d) %`), 1, mz.tillvaxt.omsattningTillvaxtTTM * 100, 0.05],
  ['prognos', /prognostillväxt \+(-?\d+,\d\d) %/, 1, mz.tillvaxt.prognosTillvaxt * 100, 0.005],
  ['oms2022', /(\d+ \d\d\d) miljoner kronor\) var större/, 1, mz.serier.resultat[0] / 1e6, 0.5e0],
  ['oms2022b', /2022 års resultat \((\d+ \d\d\d) miljoner/, 1, mz.serier.resultat[0] / 1e6, 0.5],
  ['res2025', /helåret landade på (\d+ \d\d\d) miljoner/, 1, mz.serier.omsattning[3] / 1e6, 0.5],
  ['netto2025', new RegExp(`GAAP-nettot blev (${MM}?\\d+) miljoner`), 1, mz.serier.resultat[3] / 1e6, 0.5],
  ['insider', /(-?\d+) insiderköp senaste/, 1, mz.aterkop.insiderkopSenaste6man, 0.1],
  ['resCAGR-null', /resultatCAGR är null/, 0, 0, 0],
];
for (const r of fp) { if (r[2] === 0) { B.includes('resultatCAGR är null') ? pass++ : fejl('paritet/resCAGR-null', 'nullförklaringen saknas'); continue; } hitta('paritet/' + r[0], r[1], r[2], r[3], r[4], 'universumfältet i texten'); }

// ---------- 3. SÖKVERIFIERAD DATA ----------
const Q = {
  q325: { intakt: 2987, organisk: 15, ebitda: 675, ebitdaM: 22.6, ro: 232 },
  fy25: { intakt: 11579, netto: -62, eps: -0.53, ebitdaAr: 2600, organisk: 9.4 },
  q126: { intakt: 3159, q125: 2557, ebitdaM: 25 },
  q226: { intakt: 2965, organisk: 6, ebitdaM: 24, cashConv: 81 },
  epsJ: 14.72, nettorJ: 1.8, fjol: '13 november', rappdag: '5 november',
};
const sp = [
  ['q325-intakt', /nettointäkt (\d+ \d\d\d) miljoner kronor \(\+108/, 1, Q.q325.intakt, 0.5, 'Q3-25'],
  ['q325-organisk', /organisk \+(\d+,\d+) procent\)/, 1, Q.q325.organisk, 0.05, 'Q3-25'],
  ['q325-ebitda', /justerad EBITDA (\d+) miljoner \(/, 1, Q.q325.ebitda, 0.5, 'Q3-25'],
  ['q325-ebitdaM', /\((\d+,\d+) % — mot 27,1/, 1, Q.q325.ebitdaM, 0.05, 'Q3-25'],
  ['q325-ro', /rörelseresultat (\d+) miljoner/, 1, Q.q325.ro, 0.5, 'Q3-25'],
  ['fy25-intakt', /landade på (\d+ \d\d\d) miljoner/, 1, Q.fy25.intakt, 0.5, 'FY25'],
  ['fy25-netto', new RegExp(`GAAP-nettot blev (${MM}?\\d+) miljoner`), 1, Q.fy25.netto, 0.5, 'FY25'],
  ['fy25-eps', new RegExp(`EPS (${MM}?\\d+,\\d\\d) kronor \\(2024`), 1, Q.fy25.eps, 0.005, 'FY25'],
  ['fy25-ebitda', /rekord cirka (\d+ \d\d\d) miljoner för året/, 1, Q.fy25.ebitdaAr, 0.5, 'FY25'],
  ['fy25-organisk', /organisk tillväxt \+(\d+,\d+) procent, över/, 1, Q.fy25.organisk, 0.05, 'FY25'],
  ['q126-intakt', /nettointäkt (\d+ \d\d\d) miljoner \(\+24/, 1, Q.q126.intakt, 0.5, 'Q1-26'],
  ['q126-q125', /mot (\d+ \d\d\d); pro forma/, 1, Q.q126.q125, 0.5, 'Q1-26'],
  ['q126-ebitdaM', /EBITDA-marginal (\d+,\d) %\. Guiden/, 1, Q.q126.ebitdaM, 0.05, 'Q1-26'],
  ['q226-intakt', /nettointäkt (\d+ \d\d\d) miljoner \(\+(\d+,\d+) procent organisk/, 1, Q.q226.intakt, 0.5, 'Q2-26'],
  ['q226-organisk', /nettointäkt (\d+ \d\d\d) miljoner \(\+(\d+,\d+) procent organisk/, 2, Q.q226.organisk, 0.05, 'Q2-26'],
  ['q226-ebitdaM', /EBITDA-marginal (\d+,\d) %, kassakonvertering (\d+,\d) %/, 1, Q.q226.ebitdaM, 0.05, 'Q2-26'],
  ['q226-cashconv', /EBITDA-marginal (\d+,\d) %, kassakonvertering (\d+,\d) %/, 2, Q.q226.cashConv, 0.05, 'Q2-26'],
  ['epsJ', /justerat rullande EPS (-?\d+,\d\d) kronor/, 1, Q.epsJ, 0.005, 'Q3-25-rapporten'],
  ['nettorJ', /rullande netto cirka (-?\d+,\d+) miljarder/, 1, Q.nettorJ, 0.05, 'Q3-25-rapporten'],
  ['rappdag', /torsdagen (\d+) november 2026 i bolagets egen/, 1, 5, 0.1, 'finansiella kalendern'],
  ['fjol', /torsdagen (\d+) november kl 07:30 CET/, 1, 13, 0.1, 'Q3-25 07:30'],
];
for (const r of sp) hitta('sok/' + r[0], r[1], r[2], r[3], r[4], r[5]);

// ---------- 4. ARITMETIK OBEROENDE ----------
const aktier = mz.marknadsKapitalMdr * 1000 / mz.pris;
const epsFalt = mz.pris / mz.vardering.pe;
const nettoTTM = epsFalt * aktier;
const ekH = mz.marknadsKapitalMdr * 1000 / mz.vardering.pb;
const ebitImpl = mz.lonksamhet.ebitMarginal * Q.fy25.intakt;
const skuldKvot = ekH * mz.stabilitet.skuldEgenkapital;
const evFalt = mz.vardering.evEbit * ebitImpl / 1000;
const ap = [
  ['aktier-text', new RegExp(`(${MM}?\\d+,\\d+) miljoner`), 0, 0, 0], // närvaro hanteras ej
  ['epsFalt', new RegExp(`GAAP-EPS (${MM}?\\d+,\\d\\d) kronor rullande`), 1, epsFalt, 0.005],
  ['nettoTTM', new RegExp(`netto (${MM}?\\d+) miljoner delat med härlett`), 1, nettoTTM, 0.6],
  ['peJ', new RegExp(`det ger \\*\\*P\\/E (${MM}?\\d+,\\d)\\*\\*`), 1, mz.pris / Q.epsJ, 0.06],
  ['peKvot', new RegExp(`Kvot: (${MM}?\\d+,\\d)×`), 1, mz.vardering.pe / (mz.pris / Q.epsJ), 0.06],
  ['epsKvot', new RegExp(`en faktor (${MM}?\\d+,\\d)`), 1, Q.epsJ / epsFalt, 0.06],
  ['eps-gap', new RegExp(`differensen på (${MM}?\\d+,\\d\\d) kronor`), 1, Q.epsJ - epsFalt, 0.005],
  ['pbRoe', new RegExp(`= (${MM}?\\d+,\\d\\d) mot P\/E 93,6`), 1, mz.vardering.pb / mz.lonksamhet.roe, 0.005],
  ['idGap', new RegExp(`gap (${MM}?\\d+,\\d\\d) procent\\)`), 1, (mz.vardering.pb / mz.lonksamhet.roe - mz.vardering.pe) / mz.vardering.pe * 100, 0.005],
  ['ekHärled', new RegExp(`/ ${MM}?(\\d+,\\d+) = (${MM}?\\d+,\\d+) miljarder`), 2, ekH / 1000, 0.06],
  ['bvps', new RegExp(`bokfört per aktie (${MM}?\\d+,\\d\\d) kronor`), 1, ekH / aktier, 0.005],
  ['kursBvps', new RegExp(`kurs delat med bokfört (${MM}?\\d+,\\d+)`), 1, mz.pris / (ekH / aktier), 0.0005],
  ['roeKontroll', new RegExp(`= (${MM}?\\d+,\\d+) % mot fältets`), 1, nettoTTM / ekH * 100, 0.005],
  ['ebitImpl', new RegExp(`\\((${MM}?\\d+,\\d %) × (\\d+ \\d\\d\\d) = (\\d+ \\d\\d\\d|\\d+) miljoner`), 3, ebitImpl, 0.6],
  ['evFalt', new RegExp(`ger EV (${MM}?\\d+,\\d+) miljarder`), 1, evFalt, 0.06],
  ['implNettoskuld', new RegExp(`implicit nettoskuld (${MM}?\\d+,\\d+) miljarder`), 1, evFalt - mz.marknadsKapitalMdr, 0.06],
  ['implKassa', new RegExp(`kassa runt (${MM}?\\d+,\\d+) miljarder`), 1, skuldKvot / 1000 - (evFalt - mz.marknadsKapitalMdr), 0.06],
  ['roicProxy', new RegExp(`\\((${MM}?\\d+,\\d) \\+ (${MM}?\\d+,\\d+)\\) = (${MM}?\\d+,\\d+) % mot fältets 8,19`), 3, ebitImpl / (skuldKvot + ekH) * 100, 0.06],
  ['roicGap', new RegExp(`\\(gap (${MM}?\\d+,\\d+) procent`), 1, Math.abs(ebitImpl / (skuldKvot + ekH) - mz.lonksamhet.roic) / mz.lonksamhet.roic * 100, 0.06],
  ['pegKonv', new RegExp(`ger PEG (${MM}?\\d+,\\d)`), 1, mz.vardering.pe / (mz.tillvaxt.prognosTillvaxt * 100), 0.06],
  ['pegKvot', new RegExp(`Kvot (${MM}?\\d+,\\d+)`), 1, mz.vardering.peg / (mz.vardering.pe / (mz.tillvaxt.prognosTillvaxt * 100)), 0.0005],
  ['pegImpl', new RegExp(`vinsttillväxt på (${MM}?\\d+) procent`), 1, mz.vardering.pe / mz.vardering.peg, 0.5],
  ['bruttoNetto', new RegExp(`slukar (${MM}?\\d+,\\d+) procentenheter`), 1, (mz.lonksamhet.bruttoMarginal - mz.lonksamhet.nettoMarginal) * 100, 0.06],
  ['dubbling', new RegExp(`\\+(${MM}?\\d+,\\d+) procent mot 2024`), 1, (Q.fy25.intakt / 6015 - 1) * 100, 0.06],
  ['viaplayAndel', new RegExp(`(${MM}?\\d+,\\d+) procent av årets omsättning`), 1, mz.serier.resultat[0] / mz.serier.omsattning[0] * 100, 0.06],
  ['q4ebitda', new RegExp(`1 931 = (${MM}?\\d+) miljoner`), 1, Q.fy25.ebitdaAr - 1931, 0.6],
  ['vandning', new RegExp(`differensen (${MM}?\\d+) miljoner`), 1, nettoTTM - Q.fy25.netto, 0.6],
  ['marginalvikt-mkr', new RegExp(`flyttar nettot (${MM}?\\d+) miljoner`), 1, Q.fy25.intakt * 1.055 * 0.01, 0.6],
  ['marginalvikt-kr', new RegExp(`= (${MM}?\\d+,\\d\\d) kronor per aktie`), 1, Q.fy25.intakt * 1.055 * 0.01 / aktier, 0.005],
];
for (const r of ap) { if (r[3] === 0) continue; hitta('arit/' + r[0], r[1], r[2], r[3], r[4], 'oberoende omräknad'); }
// 9 scenarieceller (dokumentordning: rad=marginal, kolumn=tillväxt → permutation)
const scen = [];
for (const t of [0.02, 0.055, 0.09]) for (const m of [0.005, mz.lonksamhet.nettoMarginal, 0.025]) {
  const netto = Q.fy25.intakt * (1 + t) * m, eps = netto / aktier;
  scen.push({ netto, eps, pe: mz.pris / eps });
}
const cellre = [...B.matchAll(/(-?\d+,\d\d?) · (-?\d+,\d\d) · (-?\d+,\d+)/g)].map(m => [num(m[1]), num(m[2]), num(m[3])]);
cellre.length === 9 ? pass++ : fejl('arit/scen-antal', `fick ${cellre.length} celler`);
const perm = [0, 3, 6, 1, 4, 7, 2, 5, 8];
perm.forEach((si, i) => {
  const s2 = scen[si], c = cellre[i]; if (!c) return;
  Math.abs(c[0] - s2.netto) <= 0.6 && Math.abs(c[1] - s2.eps) <= 0.005 && Math.abs(c[2] - s2.pe) <= 0.06 ? pass++ : fejl(`arit/scen-cell-${i + 1}`, `väntade ${s2.netto.toFixed(1)}/${s2.eps.toFixed(2)}/${s2.pe.toFixed(1)}, fann ${c}`);
});
hitta('arit/scen-mitt', /\| \*\*1,40 %\*\* \| [^|]+ \| (-?\d+,\d+) · (-?\d+,\d\d) · (-?\d+,\d+) \|/, 2, scen[4].eps, 0.005, 'mittencellens EPS');

// ---------- 5. GRENMEDIANER + RANG LIVE ----------
const kom = uni.filter(b => b.bransch === 'kommunikation');
const median = v => { const s = v.filter(x => x != null).sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const medR = [
  ['pe', b => b.vardering?.pe, /\| P\/E \| [^|]+ \| (-?\d+,\d+) \| (\d+):e högst av (\d+) \|/, 'fall'],
  ['pb', b => b.vardering?.pb, /\| P\/B \| [^|]+ \| (-?\d+,\d+) \| (\d+):e lägst av (\d+) \|/, 'stig'],
  ['evEbit', b => b.vardering?.evEbit, /\| EV\/EBIT \| [^|]+ \| (-?\d+,\d+) \| (\d+):e av (\d+) \|/, 'fall'],
  ['peg', b => b.vardering?.peg, /\| PEG \| [^|]+ \| (-?\d+,\d+) \| (\d+):e lägst av (\d+) \|/, 'stig'],
  ['fcfYield', b => b.vardering?.fcfYield, /\| FCF-avkastning \| [^|]+ \| (-?\d+,\d+) % \| (\d+):e lägst av (\d+) \|/, 'stig'],
  ['roe', b => b.lonksamhet?.roe, /\| ROE \| [^|]+ \| (-?\d+,\d+) % \| (\d+):e lägst av (\d+) \|/, 'stig'],
  ['roic', b => b.lonksamhet?.roic, /\| ROIC \| [^|]+ \| (-?\d+,\d+) % \| (\d+):e högst av (\d+) \|/, 'fall'],
  ['brutto', b => b.lonksamhet?.bruttoMarginal, /\| Bruttomarginal \| [^|]+ \| (-?\d+,\d+) % \| (\d+):e högst av (\d+) \|/, 'fall'],
  ['ebitM', b => b.lonksamhet?.ebitMarginal, /\| EBIT-marginal \| [^|]+ \| (-?\d+,\d+) % \| (\d+):e högst av (\d+) \|/, 'fall'],
  ['netto', b => b.lonksamhet?.nettoMarginal, /\| Nettomarginal \| [^|]+ \| (-?\d+,\d+) % \| (\d+):e lägst av (\d+) \|/, 'stig'],
  ['skuldEk', b => b.stabilitet?.skuldEgenkapital, /\| Skuld\/eget kapital \| [^|]+ \| (-?\d+,\d+) \| (\d+):e lägsta av (\d+) \|/, 'stig'],
];
for (const [namn, fn, re, rikt] of medR) {
  const vals = kom.map(fn); const m = median(vals); const n = vals.filter(x => x != null).length;
  const mt = B.match(re);
  if (!mt) { fejl('median/' + namn, 'tabellrad hittas inte'); continue; }
  const procent = ['fcfYield', 'roe', 'roic', 'brutto', 'ebitM', 'netto'].includes(namn);
  const exp = procent ? m * 100 : m;
  Math.abs(num(mt[1]) - exp) <= 0.06 ? pass++ : fejl('median/' + namn, `väntade ${exp}, fann ${mt[1]}`);
  num(mt[3]) === n ? pass++ : fejl('median/' + namn + '-n', `väntade n=${n}, fann ${mt[3]}`);
  const stig = [...vals.filter(x => x != null)].sort((a, b) => a - b).indexOf(fn(mz)) + 1;
  const fall = [...vals.filter(x => x != null)].sort((a, b) => b - a).indexOf(fn(mz)) + 1;
  num(mt[2]) === (rikt === 'fall' ? fall : stig) ? pass++ : fejl('rang/' + namn, `väntade ${rikt === 'fall' ? fall : stig}, fann ${mt[2]}`);
}
// ttm-radens rang + n (raden bär rang i grupp 1, medianen i cell 2 — egen kontroll)
{
  const vals = kom.map(b => b.tillvaxt?.omsattningTillvaxtTTM).filter(x => x != null);
  const fall = [...vals].sort((a, b) => b - a).indexOf(mz.tillvaxt.omsattningTillvaxtTTM) + 1;
  const mt = B.match(/\| Intäktstillväxt TTM \| [^|]+ \| [^|]+ \| (\d+):e högst av (\d+) \|/);
  if (!mt) fejl('rang/ttm', 'rad hittas inte');
  else {
    num(mt[1]) === fall && num(mt[2]) === vals.length ? pass++ : fejl('rang/ttm', `väntade ${fall} av ${vals.length}, fann ${mt[1]} av ${mt[2]}`);
    num(mt[2]) === vals.length ? pass++ : fejl('rang/ttm-n', `väntade n=${vals.length}, fann ${mt[2]}`);
  }
}

// ---------- 6. JURIDIK ----------
const lagrum = [...B.matchAll(/2007:528/g)].length;
lagrum === 1 ? pass++ : fejl('juridik/lagrum', `${lagrum} förekomster`);
B.includes('2 kap 5 §') ? pass++ : fejl('juridik/paragraf', '2 kap 5 § saknas');
const radOrd = [...B.matchAll(/köpa|sälja|behåll/g)];
radOrd.length && radOrd.every(m => /rekommendation/.test(B.slice(Math.max(0, m.index - 80), m.index + 80))) ? pass++ : fejl('juridik/radord', `${radOrd.length} förekomster, inte alla i standardnekande`);
for (const f2 of ['väntas', 'målkurs', 'undvik denna', 'köp denna', 'sälj denna']) B.toLowerCase().includes(f2) ? fejl('juridik/forbjuden', `"${f2}" förekommer`) : pass++;

// ---------- 7. SPRÅK ----------
for (const [namn, re] of [['rak+citattecken', /"/], ['typografiska citat', /[\u201c\u201d\u00ab\u00bb\u2018\u2019\u2039\u203a]/], ['dubbla mellanslag', /  /], ['tabb', /\t/], ['CJK', /[\u4e00-\u9fff\u3040-\u30ff]/]]) {
  const rg = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  const m = [...B.matchAll(rg)].length + [...T.matchAll(rg)].length + [...D.matchAll(rg)].length;
  m === 0 ? pass++ : fejl('sprak/' + namn, `${m} förekomster`);
}
for (const art of ['${', 'NaN', 'undefined', 'Infinity']) B.includes(art) ? fejl('artefakt/' + art, 'förekommer i body') : pass++;

// ---------- 8. LÄNKAR ----------
const lnk = [...B.matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]);
const interna = lnk.filter(u => u.startsWith('/'));
const externa = lnk.filter(u => u.startsWith('http'));
const unika = [...new Set(interna)];
unika.length >= 12 ? pass++ : warn('lank/antal', `${unika.length} unika interna (<12)`);
if (HTTP) {
  const doda = [];
  for (const u of unika) {
    try { const r = await fetch('http://localhost:3000' + u, { redirect: 'manual' }); if (r.status !== 200) doda.push(`${u} → ${r.status}`); }
    catch (e) { doda.push(`${u} → fel ${e.message}`); }
  }
  doda.length === 0 ? pass++ : fejl('lank/http', doda.join(', '));
}
const ogiltiga = externa.filter(u => !/^https:\/\/(www\.)?mtg\.com/.test(u));
ogiltiga.length === 0 ? pass++ : fejl('lank/externa', ogiltiga.join(', '));

console.log(`KVD MTG-B Q3-2026 — ${HTTP ? 'med nätverkskontroll' : 'utan nätverkskontroll'}`);
console.log(`universum-md5: ${md5}`);
console.log(`PASS ${pass} · FEL ${fel} · VARNING ${varning}`);
if (varnposter.length) console.log('VARNINGAR:\n  ' + varnposter.join('\n  '));
if (felposter.length) console.log('FEL:\n  ' + felposter.join('\n  '));
console.log(fel === 0 ? 'KVD GRÖN' : 'KVD RÖD');
process.exit(fel === 0 ? 0 : 1);
