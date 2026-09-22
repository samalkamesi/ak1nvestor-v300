#!/usr/bin/env node
// _s4u1-nvda-kvd.mjs — KVD för NVIDIA Q3-läspaket 2026 (s4-u1, manifest auto-s4-1790046905434)
// Oberoende av byggmotorn: rådata hårdkodad här + universumfilen läses om (md5-lås).
// Användning: node verktyg/_s4u1-nvda-kvd.mjs [--http]
import fs from 'node:fs';
import crypto from 'node:crypto';

const HTTP = process.argv.includes('--http');
const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-nvda-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const MD5VANT = '6e540c8753d28f8b905a2aab9f15b29d';

let pass = 0, fel = 0, varning = 0;
const felposter = [], varnposter = [];
const fejl = (namn, motiv) => { fel++; felposter.push(`${namn}: ${motiv}`); };
const warn = (namn, motiv) => { varning++; varnposter.push(`${namn}: ${motiv}`); };

const p = JSON.parse(fs.readFileSync(PAKET, 'utf8'));
const uniRaw = fs.readFileSync(UNI);
const md5 = crypto.createHash('md5').update(uniRaw).digest('hex');
const uni = JSON.parse(uniRaw);
const nv = uni.find(b => b.ticker === 'NVDA');
const gren = uni.filter(b => b.bransch === 'tillvaxt');
const B = p.body.replace(/\u00a0/g, ' '), T = p.title, D = p.description;

md5 === MD5VANT ? pass++ : fejl('universum/md5', `${md5} ≠ ${MD5VANT} — medianer/rang mot förändrad fil`);

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
const vantaH2 = ['Urvalet: varför NVIDIA är nästa paket i serien', 'Nyckeltalen att ha med sig — med fönstrens fyra världar i ryggsäcken', 'Källkritiken: P/E-fältet som återvinns — och tre fält som inte håller', 'Kvartalskedjan: dubblingen som guidad, marginalen som resatt', 'Så står sig bolaget mot branschen', 'Tre sätt att läsa utfallet — övningar i metod', 'Praktiskt inför tisdagen 17 november — Q3 FY2027', 'Källor'];
h2.length === 8 && h2.every((h, i) => h === vantaH2[i]) ? pass++ : fejl('struktur/h2', `fick ${JSON.stringify(h2)}`);
p.slug === 'sa-laser-du-nvda-q3-2026' ? pass++ : fejl('struktur/slug', p.slug);
T.startsWith('NVIDIA Q3-rapport 2026: så läser du den') ? pass++ : fejl('struktur/title', 'titelns led saknas');
D.length >= 600 && D.length <= 950 ? pass++ : warn('struktur/description', `${D.length} tecken utanför 600–950`);
/Publicering av utkastet är kundens beslut \(R2\)\.$/.test(B.trimEnd().split('\n').pop()) ? pass++ : fejl('struktur/disclaimer', 'sista raden är inte disclaimern');
const ord = B.trim().split(/\s+/).length;
ord >= 2200 && ord <= 3400 ? pass++ : warn('struktur/ord', `${ord} ord utanför 2200–3400`);
p.readingMinutes >= 4 && p.readingMinutes <= 6 ? pass++ : fejl('struktur/rm', `${p.readingMinutes} min`);
Math.abs(p.readingMinutes - Math.round(ord / 600)) <= 1 ? pass++ : fejl('struktur/rm-konsistens', `rm ${p.readingMinutes} mot ord ${ord}`);
p.tags.includes('NVIDIA') && p.tags.includes('tillväxt') && p.tags.includes('läspaket') ? pass++ : fejl('struktur/tags', JSON.stringify(p.tags));
p.publishedAt === '2026-11-17' ? pass++ : fejl('struktur/datum', p.publishedAt);

// ---------- 2. UNIVERSUMPARITET (fält för fält mot NVDA-raden) ----------
const fp = [
  ['pris', /kursen (\d+,\d\d) delat med den ger/, 1, nv.pris, 0.005],
  ['mcap', /(\d[\d\s]*,\d) miljarder dollar i börsvärde/, 1, nv.marknadsKapitalMdr, 0.05],
  ['pe-ingress', /mot universumfältets (\d+,\d) \(gap/, 1, nv.vardering.pe, 0.06],
  ['pe-lista', /\*\*P\/E (\d+,\d)\*\*/, 1, nv.vardering.pe, 0.06],
  ['pb', /\*\*P\/B (\d+,\d\d)\*\*/, 1, nv.vardering.pb, 0.005],
  ['evEbit', /\*\*EV\/EBIT (\d+,\d)\*\*/, 1, nv.vardering.evEbit, 0.06],
  ['peg', /\*\*PEG (\d+,\d\d)\*\*/, 1, nv.vardering.peg, 0.005],
  ['fcfYield', /\*\*FCF-avkastning (\d+,\d\d) %\*\*/, 1, nv.vardering.fcfYield * 100, 0.005],
  ['roe', /\[ROE\]\(\/dataset\/tillvaxt\/roe\) (\d+,\d) %/, 1, nv.lonksamhet.roe * 100, 0.06],
  ['roic', /\[ROIC\]\(\/dataset\/tillvaxt\/roic\) (\d+,\d) %/, 1, nv.lonksamhet.roic * 100, 0.06],
  ['brutto', /brutto-marginal\) (\d+,\d) %/, 1, nv.lonksamhet.bruttoMarginal * 100, 0.06],
  ['ebitM', /EBIT TTM = (\d+,\d\d) % ×/, 1, nv.lonksamhet.ebitMarginal * 100, 0.006],
  ['netto', /netto-marginal\) (\d+,\d\d) %/, 1, nv.lonksamhet.nettoMarginal * 100, 0.006],
  ['skuldEk', /skuld\/eget kapital (\d+,\d\d)/, 1, nv.stabilitet.skuldEgenkapital, 0.005],
  ['ttmFalt', /Intäktstillväxten TTM[^)]*\) \+(\d+,\d) procent/, 1, nv.tillvaxt.omsattningTillvaxtTTM * 100, 0.06],
  ['prognosTillvaxt', /prognostillväxten \+(\d+,\d\d) procent/, 1, nv.tillvaxt.prognosTillvaxt * 100, 0.006],
  ['omsCagr', /femårstillväxten \+(\d+,\d) procent per år/, 1, nv.tillvaxt.omsattningCAGR5ar * 100, 0.06],
  ['fy26-intakt', /Helåret FY2026: intäkt (\d+,\d) \(/, 1, nv.serier.omsattning[3] / 1e9, 0.06],
  ['fy26-netto', /GAAP-netto (\d+,\d), EPS/, 1, nv.serier.resultat[3] / 1e9, 0.06],
  ['fy23', /FY2023:s (\d+,\d\d\d) miljarder/, 1, nv.serier.omsattning[0] / 1e9, 0.0006]
];
for (const [namn, re, g, v, tol] of fp) hitta(namn, re, g, v, tol, 'universumraden NVDA 2026-09-03');

// ---------- 3. KVARTALSTAL (sökverifierade 2026-09-22, hårdkodade) ----------
const kq = [
  ['q3fy26-intakt', /Q3 FY2026 \(19 november 2025\):\*\* intäkt (\d+,\d\d\d) miljarder/, 57.006, 0.0006],
  ['q3fy26-netto', /GAAP-netto (\d+,\d\d\d) \(\+65 procent\), GAAP-EPS/, 31.910, 0.0006],
  ['q3fy26-eps', /GAAP-EPS 1,30 mot (\d+,\d\d) året före/, 0.78, 0.005],
  ['q3fy26-dc', /Data Center (\d+,\d) \(\+66 procent\)/, 51.2, 0.05],
  ['q3fy26-retur9m', /Nio månader FY2026: (\d+,\d) miljarder returnerade/, 37.0, 0.05],
  ['q4fy26-intakt', /intäkt (\d+,\d\d\d) \(\+20 procent mot förra kvartalet, \+73/, 68.127, 0.0006],
  ['q4fy26-netto', /GAAP-netto (\d+,\d\d\d), GAAP-EPS 1,76/, 42.960, 0.0006],
  ['q4fy26-epsng', /justerad EPS (\d+,\d\d) mot väntade ~1,53/, 1.62, 0.005],
  ['q4fy26-brutto', /bruttomarginal (\d+,\d) %, fritt kassaflöde 34,9/, 75.2, 0.05],
  ['q4fy26-fcf', /fritt kassaflöde (\d+,\d) i kvartalet/, 34.9, 0.05],
  ['fy26-dc', /Data Center (\d+,\d), rörelseresultat 130,4/, 197.3, 0.05],
  ['fy26-rorelse', /rörelseresultat (\d+,\d), GAAP-netto 120,1/, 130.4, 0.05],
  ['fy26-epsG', /EPS (\d+,\d\d) GAAP \/ 4,77 justerad/, 4.90, 0.005],
  ['fy26-epsNG', /\/ (\d+,\d\d) justerad, fritt kassaflöde/, 4.77, 0.005],
  ['fy26-fcf', /fritt kassaflöde (\d+,\d)\.\n/, 96.6, 0.05],
  ['q1fy27-intakt', /intäkt (\d+,\d\d\d) \(\+20 procent mot förra kvartalet, \+85/, 81.615, 0.0006],
  ['q1fy27-netto', /GAAP-netto (\d+,\d\d\d) \(\+126 procent\)/, 58.321, 0.0006],
  ['q1fy27-eps', /GAAP-EPS (\d+,\d\d), bruttomarginal 74,9/, 2.39, 0.005],
  ['q2fy27-intakt', /intäkt (\d+,\d\d\d) \(\+18 procent mot förra kvartalet, \+106/, 96.221, 0.0006],
  ['q2fy27-dc', /Data Center (\d+,\d\d) \(\+18 procent mot förra kvartalet, \+117/, 89.02, 0.005],
  ['q2fy27-netto', /GAAP-netto (\d+,\d\d\d) \(\+2 procent/, 59.688, 0.0006],
  ['q2fy27-epsG', /GAAP-EPS (\d+,\d\d) mot justerad 2,22/, 2.46, 0.005],
  ['q2fy27-epsNG', /mot justerad (\d+,\d\d), bruttomarginal 75,0 %, rekord/, 2.22, 0.005],
  ['q2fy27-retur', /rekord i returnerat kapital: (\d+) miljarder i kvartalet/, 26, 0.5],
  ['guide-q3', /intäktsguiden (\d+,\d) miljarder dollar \(±2/, 108.0, 0.05],
  ['guide-brutto', /bruttomarginalen guidades ned till (\d+,\d) %/, 74.0, 0.05],
  ['konsensus-q2', /konsensus ~(\d+,\d)\)/, 92.1, 0.05],
  ['utdelning-kvart', /från 0,01 till \*\*(0,25) dollar per kvartal\*\*/, 0.25, 0.001],
  ['aterkop-nytt', /nytt återköpsprogram på (\d+) miljarder \(på 39 kvarstående\)/, 80, 0.5],
  ['aterkop-kvar', /\(på (\d+) kvarstående\)/, 39, 0.5]
];
for (const [namn, re, v, tol] of kq) hitta(namn, re, 1, v, tol, 'sökverifierat 2026-09-22');
// rappdagssträngar
for (const s of ['tisdagen 17 november 2026 efter amerikansk börsstängning', 'tisdagen 2026-11-17, after market close', '19 november 2025', '25 februari 2026', '20 maj 2026', '26 augusti 2026']) B.includes(s) ? pass++ : fejl('datum/strang', `"${s}" saknas`);

// ---------- 4. ARITMETIK (oberoende omräknad) ----------
const pris = nv.pris, mcap = nv.marknadsKapitalMdr;
const rullEPS = 1.30 + 1.76 + 2.39 + 2.46;
const peKedja = pris / rullEPS;
const peGap = Math.abs(peKedja - nv.vardering.pe) / nv.vardering.pe * 100;
const yyKvot = 96.221 / 46.743;
const ttmI = 57.006 + 68.127 + 81.615 + 96.221, ttmF = 35.082 + 39.331 + 44.062 + 46.743;
const ttmT = (ttmI / ttmF - 1) * 100;
const rullN = 31.910 + 42.960 + 58.321 + 59.688;
const rullM = rullN / ttmI * 100;
const ekS = mcap / nv.vardering.pb, ekM = rullN / nv.lonksamhet.roe;
const ekT = (ekS / ekM - 1) * 100;
const roeS = rullN / ekS * 100;
const ebitT = nv.lonksamhet.ebitMarginal * ttmI;
const ev = nv.vardering.evEbit * ebitT;
const nka = mcap - ev;
const aktG = mcap / pris, aktU = 59.688 / 2.46;
const pegF = nv.vardering.pe / nv.vardering.peg;
const pegK = nv.vardering.pe / (nv.tillvaxt.prognosTillvaxt * 100);
const pegQ = nv.vardering.pe / (nv.tillvaxt.omsattningTillvaxtTTM * 100);
const ar = [
  ['rullEPS-uttryck', /1,30 \+ 1,76 \+ 2,39 \+ 2,46 = (\d+,\d\d) dollar/, rullEPS, 0.005],
  ['epsBasFalt', /implicerar en EPS-bas på (\d+,\d\d\d) dollar/, pris / nv.vardering.pe, 0.0006],
  ['peKedja', /ger (\d+,\d) mot universumfältets/, peKedja, 0.06],
  ['peGap', /gap (\d+,\d\d) procent/, peGap, 0.006],
  ['yykvot', /96,221 \/ 46,743 = (\d+,\d) %/, (yyKvot - 1) * 100, 0.06],
  ['ttm-intakt', /TTM-räknningen är (\d+,\d\d\d) mot/, ttmI, 0.0006],
  ['ttm-fjor', /mot (\d+,\d\d\d) = \+83,\d procent/, ttmF, 0.0006],
  ['ttm-tillv', /= \+(\d+,\d) procent/, ttmT, 0.06],
  ['rull-netto', /rullande netto (\d+,\d\d\d) miljarder på TTM-intäkten/, rullN, 0.0006],
  ['rull-marginal', /nettomarginal (\d+,\d\d) %, mot universumfältets/, rullM, 0.006],
  ['ekMedel', /(\d+,\d\d\d) \/ 1,1721 = (\d+,\d) miljarder/, 2, ekM, 0.06],
  ['ekTillv', /växte eget kapital (\d+,\d) %/, ekT, 0.06],
  ['ekSlut-ovn2', /slut-EK (\d+,\d+) \/ (\d+,\d\d\d) = (\d+,\d) miljarder/, 3, ekS, 0.06],
  ['roeSlutEk', /= (\d+,\d\d) % på dagens slut-EK/, roeS, 0.006],
  ['ebitTtm', /EBIT TTM = (\d+,\d\d) % × (\d+,\d\d\d) = (\d+,\d) miljarder/, 3, ebitT, 0.06],
  ['ev', /EV = (\d+,\d\d\d) × (\d+,\d) = (\d+) miljarder/, 3, ev, 0.51],
  ['nettokassa', /nettokassa på cirka (\d+) miljarder/, nka, 0.51],
  ['aktier-utspadd', /(\d+,\d\d\d) \/ 2,46 = (\d+,\d\d\d) miljarder/, 2, aktU, 0.0006],
  ['aktier-grund', /per aktie på (\d+,\d\d\d) miljarder aktier/, aktG, 0.0006],
  ['utdelning-ar', /(\d+,\d\d) dollar om åren = (\d+,\d\d) % direktavkastning/, 1, 0.25 * 4, 0.005],
  ['dirAvk', /= (\d+,\d\d) % direktavkastning/, (0.25 * 4) / pris * 100, 0.006],
  ['guideKvot', /ett år tidigare = \+(\d+,\d) procent/, (108.0 / 57.006 - 1) * 100, 0.06],
  ['guideQQ', /\+(\d+,\d) procent mot förra kvartalet i spannets mitt/, (108.0 / 96.221 - 1) * 100, 0.06],
  ['dcAndel', /året före — (\d+,\d) % av koncernintäkten/, 89.02 / 96.221 * 100, 0.06],
  ['pegFaltN', /implicerar tillväxt (\d+,\d) procent per år/, pegF, 0.06],
  ['pegKonv', /ger PEG (\d+,\d\d\d)\./, pegK, 0.0006],
  ['pegKvart', /procent ger (\d+,\d\d\d)\./, pegQ, 0.0006],
  ['bryt25', /krävs rullande (\d+,\d\d) dollar, alltså Q3-EPS/, pris / 25, 0.006],
  ['x25', /alltså Q3-EPS (\d+,\d\d)/, pris / 25 - (1.76 + 2.39 + 2.46), 0.006],
  ['x22', /för P\/E 22 krävs (\d+,\d\d)/, pris / 22 - (1.76 + 2.39 + 2.46), 0.006],
  ['slag-triad', /slagit sin egen intäktsguide — (\d+,\d), (\d+,\d) och (\d+,\d) procent/, 1, 81.615 / 78.0 * 100 - 100, 0.06],
  ['fcf26marg', /(\d+,\d) % marginal, (\d+,\d\d) dollar per aktie = (\d+,\d\d) % avkastning/, 1, 96.6 / 215.938 * 100, 0.06],
  ['fcfPerAktie', /, (\d+,\d\d) dollar per aktie = /, 96.6 / aktU, 0.006],
  ['fcfYieldReal', /per aktie = (\d+,\d\d) % avkastning/, 96.6 / aktU / pris * 100, 0.006],
  ['resetKostnad', /är (\d+,\d) miljarder på ett kvartal, i nivå med/, (75.0 - 71) * 108.0 / 100, 0.06],
  ['marginalTick', /guide-mitt är (\d+,\d\d) miljarder = (\d+,\d\d\d) dollar i EPS/, 2, 108.0 * 0.01 / aktU, 0.0006],
  ['reset-spann', /flyttar EPS (\d+,\d\d) dollar/, 0.06 * 108.0 / aktU, 0.006],
  ['guide-spann', /±2 procent är ±(\d+,\d) miljarder = (\d+,\d\d) dollar per aktie/, 1, 108.0 * 0.02, 0.06]
];
for (const rad of ar) {
  const [namn, re, g, v, tol] = rad.length === 5 ? rad : [rad[0], rad[1], 1, rad[2], rad[3]];
  hitta(namn, re, g, v, tol, 'oberoende omräknad');
}

//Scenariorutans 9 celler (netto · EPS · nytt rullande P/E) — varje tal omräknat
const scInt = [108 * 0.98, 108.0, 108 * 1.02], scMarg = [0.58, 0.61, 0.64];
for (let r = 0; r < 3; r++) {
  const rad = [...B.matchAll(new RegExp(`^\\| \\*\\*${Math.round(scMarg[r] * 100)} %\\*\\* \\| ([\\d,\\.]+) · ([\\d,]+) · ([\\d,]+) \\| ([\\d,]+) · ([\\d,]+) · ([\\d,]+) \\| ([\\d,]+) · ([\\d,]+) · ([\\d,]+) \\|$`, 'gm'))];
  if (!rad.length) { fejl(`scenario/rad${r + 1}`, 'tabellrad hittas inte'); continue; }
  for (let c = 0; c < 3; c++) {
    const netto = scInt[c] * scMarg[r], eps = netto / aktU;
    const pe = pris / (1.76 + 2.39 + 2.46 + eps);
    const [fNetto, fEps, fPe] = [num(rad[0][1 + c * 3]), num(rad[0][2 + c * 3]), num(rad[0][3 + c * 3])];
    Math.abs(fNetto - netto) <= 0.06 && Math.abs(fEps - eps) <= 0.006 && Math.abs(fPe - pe) <= 0.06
      ? pass++ : fejl(`scenario/cell${r + 1}${c + 1}`, `väntade ${netto.toFixed(2)}·${eps.toFixed(3)}·${pe.toFixed(2)}, fann ${fNetto}·${fEps}·${fPe}`);
  }
}
hitta('scenario-spann-text', /hela rutan landar P\/E (\d+,\d)–(\d+,\d) mot dagens/, 1, pris / (1.76 + 2.39 + 2.46 + scInt[2] * 0.64 / aktU), 0.06, 'högsta P/E-cell');

// ---------- 5. MEDIAN/RANG-PARITET LIVE (tillväxtgrenen ur filen) ----------
const med = v => { const x = v.filter(t => typeof t === 'number' && isFinite(t)).sort((a, b) => a - b); return x[Math.floor(x.length / 2)]; };
const rangH = (val, f) => { const xs = gren.map(f).filter(t => typeof t === 'number' && isFinite(t)).sort((a, b) => b - a); return xs.indexOf(val) + 1; };
//Median: filtrera på RÅVÄRDEN (null×100 = 0 hade förfalskat medianen), transformera sedan.
const medR = (f, tf = x => x) => { const x = gren.map(f).filter(t => typeof t === 'number' && isFinite(t)).sort((a, b) => a - b); return tf(x[Math.floor(x.length / 2)]); };
const mp = [
  ['median-pe', /\| P\/E \| [\d,]+ \| (\d+,\d) \|/, b => b.vardering.pe],
  ['median-pb', /\| P\/B \| [\d,]+ \| (\d+,\d\d) \|/, b => b.vardering.pb],
  ['median-roe', /\| ROE \| [\d,]+ % \| (\d+,\d) % \|/, b => b.lonksamhet.roe, x => x * 100],
  ['median-roic', /\| ROIC \| [\d,]+ % \| (\d+,\d) % \|/, b => b.lonksamhet.roic, x => x * 100],
  ['median-brutto', /\| Bruttomarginal \| [\d,]+ % \| (\d+,\d) % \|/, b => b.lonksamhet.bruttoMarginal, x => x * 100],
  ['median-netto', /\| Nettomarginal \| [\d,]+ % \| (\d+,\d) % \|/, b => b.lonksamhet.nettoMarginal, x => x * 100],
  ['median-skuldEk', /\| Skuld\/eget kapital \| [\d,]+ \| (\d+,\d\d) \|/, b => b.stabilitet.skuldEgenkapital],
  ['median-ttm', /\| Intäktstillväxt TTM-fält \| \+[\d,]+ % \| \+(\d+,\d) % \|/, b => b.tillvaxt.omsattningTillvaxtTTM, x => x * 100]
];
for (const [namn, re, f, tf] of mp) {
  const m = B.match(re);
  if (!m) { fejl(namn, 'medianen hittas inte i tabellen'); continue; }
  Math.abs(num(m[1]) - medR(f, tf)) <= 0.06 ? pass++ : fejl(namn, `text ${m[1]} mot LIVE-median ${medR(f, tf)}`);
}
const rp = [
  ['rang-roe', /\| ROE \|[\s\S]*?\| (\d+):a högst av (\d+) \|/, rangH(nv.lonksamhet.roe, b => b.lonksamhet.roe)],
  ['rang-roic', /\| ROIC \|[\s\S]*?\| (\d+):a högst av (\d+) \|/, rangH(nv.lonksamhet.roic, b => b.lonksamhet.roic)],
  ['rang-netto', /\| Nettomarginal \|[\s\S]*?\| (\d+):a högst av (\d+) \|/, rangH(nv.lonksamhet.nettoMarginal, b => b.lonksamhet.nettoMarginal)]
];
for (const [namn, re, rVant] of rp) {
  const m = B.match(re);
  if (!m) { fejl(namn, 'rangtexten hittas inte'); continue; }
  num(m[1]) === rVant ? pass++ : fejl(namn, `text ${m[1]} mot LIVE-rang ${rVant}`);
}
//P/E-raden bär dubbelrang ("12:e högst av 14 (3:e lägst)") — explicit radmatch, båda talen kontrolleras
const peRad = B.match(/\| P\/E \| [\d,]+ \| [\d,]+ \| (\d+):e högst av (\d+) \((\d+):e lägst\) \|/);
if (!peRad) fejl('rang-pe', 'P/E-raden med dubbelrang hittas inte');
else {
  const rH = rangH(nv.vardering.pe, b => b.vardering.pe), rL = gren.map(b => b.vardering.pe).filter(t => typeof t === 'number' && isFinite(t)).length + 1 - rH;
  num(peRad[1]) === rH && num(peRad[3]) === rL ? pass++ : fejl('rang-pe', `text ${peRad[1]} högst/${peRad[3]} lägst mot LIVE ${rH}/${rL}`);
}
gren.length === 19 ? pass++ : fejl('gren/storlek', `tillväxtgrenen ${gren.length} bolag (väntade 19 — filbyte? kolla md5)`);

// ---------- 6. JURIDIK ----------
const lagrum = (B.match(/2007:528/g) || []).length;
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
const externa = lnk.filter(u => /^https?:/.test(u));
interna.length >= 13 ? pass++ : fejl('lankar/interna', `${interna.length} < 13`);
const vantaInterna = ['/dataset/tillvaxt/pe', '/dataset/tillvaxt/pb', '/dataset/tillvaxt/ev-ebit', '/dataset/tillvaxt/peg', '/dataset/tillvaxt/fcf-avkastning', '/dataset/tillvaxt/roe', '/dataset/tillvaxt/roic', '/dataset/tillvaxt/brutto-marginal', '/dataset/tillvaxt/netto-marginal', '/dataset/tillvaxt/omsattningstillvaxt-ttm', '/dataset/tillvaxt/universumjamforelse', '/kurser', '/transparens', '/kallor'];
for (const u of vantaInterna) interna.includes(u) ? pass++ : fejl('lankar/intern-saknas', u);
externa.length && externa.every(u => /nvidia\.com/.test(new URL(u).hostname)) ? pass++ : fejl('lankar/externa', `tillåtna: nvidia.com-domäner; fann ${externa.join(' ')}`);
if (HTTP) {
  const { execFileSync } = await import('node:child_process');
  for (const u of [...new Set(interna)]) {
    try {
      const kod = execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '10', `http://localhost:3000${u}`], { encoding: 'utf8' }).trim();
      kod === '200' ? pass++ : fejl('lankar/http', `${u} → ${kod}`);
    } catch (e) { fejl('lankar/http', `${u} kunde inte hämtas: ${e.message.slice(0, 60)}`); }
  }
} else {
  interna.every(u => /^\/[a-z0-9\/\-]+$/.test(u)) ? pass++ : fejl('lankar/format', 'interna länkar utanför slugmönstret');
  warn('lankar/http-hoppat', 'kör med --http för 200-kontroll (appen var nere vid byggtillfället)');
}

// ---------- 9. SÖKORD ----------
T.includes('NVIDIA') && T.includes('Q3') ? pass++ : fejl('sokord/title', 'NVIDIA/Q3 saknas i titeln');
const ingress = B.split('\n')[0];
ingress.includes('NVIDIA') && ingress.includes('Q3') ? pass++ : fejl('sokord/ingress', 'NVIDIA/Q3 saknas i ingressen');
h2.filter(h => /NVIDIA|Q3/.test(h)).length >= 2 ? pass++ : fejl('sokord/h2', 'färre än 2 H2 bär NVIDIA/Q3');
D.includes('NVIDIA') && D.includes('Q3') ? pass++ : fejl('sokord/description', 'NVIDIA/Q3 saknas i description');

// ---------- RAPPORT ----------
console.log(`KVD NVDA Q3-2026: ${pass} PASS, ${fel} FEL, ${varning} VARNINGAR`);
if (felposter.length) { console.log('FEL:'); for (const x of felposter) console.log('  ✗', x); }
if (varnposter.length) { console.log('VARNING:'); for (const x of varnposter) console.log('  ⚠', x); }
console.log(fel === 0 ? 'DOM: GRÖN' : 'DOM: EJ GRÖN');
process.exit(fel === 0 ? 0 : 1);
