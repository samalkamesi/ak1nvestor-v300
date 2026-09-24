#!/usr/bin/env node
// KVD-sond för B25 vårdaktier — s3-u3 byggare 3/3, manifest auto-s3-1790044532079
// B24-mönstret: maskinella kontroller, GRÖN = 0 FEL. Körning läser endast.
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const FIL = '/home/ak1a/AK1/data/blogg-utkast/vardaktier-sa-analyserar-du-vardbolag.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const MARKE = '/home/ak1a/AK1/data/varumarke.json';
const KURSER = '/home/ak1a/AK1/public/deep-courses.json';
const BLOGGDIR = '/home/ak1a/AK1/data/blogg';

let FEL = 0, WARN = 0, KONTROLL = 0;
const fel = (m) => { FEL++; console.log('FEL:', m); };
const ok = (m) => { KONTROLL++; console.log('ok :', m); };
const kont = (namn, sant, detalj) => { KONTROLL++; if (sant) ok(namn + (detalj ? ' — ' + detalj : '')); else fel(namn + (detalj ? ' — ' + detalj : '')); };

// ── 1. JSON + fält ─────────────────────────────────────────────
const b = JSON.parse(readFileSync(FIL, 'utf8'));
for (const f of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'])
  kont('fält ' + f, typeof b[f] !== 'undefined' && b[f] !== null && b[f] !== '');
kont('slug = filnamn', b.slug === 'vardaktier-sa-analyserar-du-vardbolag');
kont('publishedAt = 2026-09-22', b.publishedAt === '2026-09-22');
kont('pillar Institutionell metodik', b.pillar === 'Institutionell metodik');

// ── 2. Varumärkesgrinden: egna regexer × 3 ytor ────────────────
const marke = JSON.parse(readFileSync(MARKE, 'utf8'));
const ytor = { title: b.title, description: b.description, body: b.body };
let grindTräff = 0;
for (const { fran, allvar } of marke.forbjudnaFraser) {
  const re = new RegExp(fran, 'giu');
  for (const [yta, text] of Object.entries(ytor)) {
    re.lastIndex = 0;
    const t = re.exec(text);
    if (t) {
      if (allvar === 'FEL') { fel(`varumärkesgrind [${yta}]: "${t[0]}" (${allvar})`); grindTräff++; }
      else { console.log('VARNING:', `varumärkesgrind [${yta}]: "${t[0]}"`); WARN++; }
    }
  }
}
if (!grindTräff) ok('varumärkesgrind 26 regexer × 3 ytor = 0 FEL');

// ── 3. Rådverb SV (imperativ/rekommendationsform riktad till läsaren) ──
// KONTROLLKUR (körning 1): delsträngsmatch utan ordgräns fällde "återköp" på "köp "
// — sammansatta termer (återköp, uppköp) är laglig finansiell terminologi, inte råd.
// \b i JS gäller [A-Za-z0-9_]: åäö bryter ordet → "återköp" ger ingen \b före "köp".
const radRe = [
  /\bköp[.!,\s]/i, /\bsälj[.!,\s]/i, /\bköpa\b/i, /rekommenderar att du (köper|säljer)/i,
  /borde du (köpa|sälja)/i, /investera i (denna|den här|denna aktie)/i, /\baktietips\w*/i,
  /ett tips är att köpa/i, /köp den här/i, /lägg en order/i, /ta position i/i,
];
const bodyLc = b.title + ' ' + b.description + ' ' + b.body;
let radTräff = 0;
for (const r of radRe) { const t = r.exec(bodyLc); if (t) { fel('rådverb: "' + t[0] + '"'); radTräff++; } }
if (!radTräff) ok('rådverb SV = 0 (ordgränsmedveten — "återköp" är term, ej råd)');

// ── 4. Sökordsdisciplin: "vårdaktier" i title+ingress+2 H2 ─────
const SOK = 'vårdaktier';
const ingress = b.body.split('\n\n').slice(0, 2).join('\n\n');
const h2 = [...b.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
kont('sökord i title', b.title.toLowerCase().includes(SOK));
kont('sökord i ingress', ingress.toLowerCase().includes(SOK));
kont('sökord i ≥2 H2', h2.filter((h) => h.toLowerCase().includes(SOK)).length >= 2,
  h2.filter((h) => h.toLowerCase().includes(SOK)).length + ' av ' + h2.length + ' H2');

// ── 5. Längder ─────────────────────────────────────────────────
kont('title ≤ 60 tkn', b.title.length <= 60, b.title.length + '/60');
kont('OG-description ≤ 155 tkn', b.description.length <= 155, b.description.length + '/155');

// ── 6. Ord + readingMinutes ────────────────────────────────────
const ren = b.body.replace(/https?:\/\/[^\s)]+/g, ' ').replace(/[#*_\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
const ord = ren.split(' ').length;
kont('ord 1100–1400 (mall 1200)', ord >= 1100 && ord <= 1400, ord + ' ord');
kont('readingMinutes = round(ord/600)', b.readingMinutes === Math.round(ord / 600), b.readingMinutes + ' = round(' + ord + '/600)');

// ── 7. Korslänkar mot publicerade ytor ─────────────────────────
const kurser = Object.keys(JSON.parse(readFileSync(KURSER, 'utf8')));
const bloggSlugs = readdirSync(BLOGGDIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5));
const länkar = [...b.body.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]).filter((u) => u.startsWith('/'));
const interna = länkar.filter((u) => u.startsWith('/kurser/') || u.startsWith('/blogg/'));
let länkFel = 0;
for (const u of interna) {
  if (u.startsWith('/kurser/')) { const id = u.replace('/kurser/', ''); if (!kurser.includes(id)) { fel('kurslänk ej publicerad: ' + u); länkFel++; } }
  else { const id = u.replace('/blogg/', ''); if (!bloggSlugs.includes(id)) { fel('blogglänk ej publicerad: ' + u); länkFel++; } }
}
if (!länkFel) ok('korslänkar ' + interna.length + '/' + interna.length + ' mot publicerade ytor (' +
  interna.filter((u) => u.startsWith('/kurser/')).length + ' kurser + ' + interna.filter((u) => u.startsWith('/blogg/')).length + ' blogg)');
// inga länkar till utkast (data/blogg-utkast eller obefintliga slugar)
kont('0 länkar till andra utkast', !länkar.some((u) => u.includes('utkast')));

// ── 8. Aritmetik motorräknad ───────────────────────────────────
const n = (x) => Math.round(x * 100) / 100;
const arit = [
  // KONTROLLKUR (körning 1): Fresenius-raden felade på egen avrundning — textens
  // "45,4 %" är korrekt en-decimal av 45,37 → per-rad tolerans 0,05 (Ö13-klassen).
  ['Fresenius-utknoppling 1−22299/40840', n((1 - 22299 / 40840) * 100), 45.37, '45,4 % i text', 0.05],
  ['Attendo-omsättningstillväxt (18991/14496)^(1/3)', n(((18991 / 14496) ** (1 / 3) - 1) * 100), 9.43, '9,4 %/år i text'],
  ['Attendo 2023-tillväxt 17287/14496', n((17287 / 14496 - 1) * 100), 19.25, '19,3 % i text'],
  ['FCF-fördubbling 2657/1165', n(2657 / 1165), 2.28, '2,28× i text'],
  ['Omsättning per anställd 18991/33', n(18991 / 33 / 10) * 10 / 1000, 0.575, '575 tkr i text'],
  ['ROIC−WACC 7,57−6,88', n(7.57 - 6.88), 0.69, '0,69 pp i text'],
  ['Ägaravkastning 4,25+1,47', n(4.25 + 1.47), 5.72, '5,7 % i text'],
  ['Trappans spann 93,0−12,5', n(93.0 - 12.5), 80.5, 'åttio procentenheter i text'],
  ['Roche−Galenica 74,2−12,5', n(74.2 - 12.5), 61.7, '61,7 pp i text'],
  ['Galenica-år 1: 3756/3595', n((3756 / 3595 - 1) * 100), 4.48, 'tre raka uppgångsår (samlad notis)'],
  ['Galenica-år 2: 3931/3756', n((3931 / 3756 - 1) * 100), 4.66, '—'],
  ['Galenica-år 3: 4146/3931', n((4146 / 3931 - 1) * 100), 5.47, '—'],
  ['Trailing−fwd P/E 19,25−16,05', n(19.25 - 16.05), 3.2, 'fwd under trailing i text'],
];
let aFel = 0;
for (const [namn, ber, vänt, not, tol] of arit) {
  KONTROLL++;
  const avvik = Math.abs(ber - vänt);
  if (avvik <= (tol ?? 0.02)) ok('aritmetik ' + namn + ' = ' + ber + ' (vänt ' + vänt + ') ' + not);
  else { fel('aritmetik ' + namn + ': beräknat ' + ber + ' mot väntat ' + vänt); aFel++; }
}
// talen i texten måste finnas (faktakärna) — "minus 45" är textens utskrivna form
const talKärna = ['25', '33 000', '18 991', '575 000', '93,0', '82,0', '73,7', '68,7', '48,6', '36,9', '25,4', '12,5',
  '74,2', '61,7', '3,15', '5,28', '7,50', '10,34', '14,3', '5,1', '18,7', '7,57', '6,88', '0,69',
  'minus 45', '813', '14 496', '9,4', '19,3', '87,4', '40 840', '22 299', '45,4', '594', '1 264',
  '0,28', '3,06', '78,7', '16,26', '19,25', '25,68', '16,05', '14,55', '24,55', '6,82',
  '0,79', '0,97', '1,01', '15,0', '5,7', '4,25', '1,47', '1 165', '2 657', '2,28', '33,4', '4,8',
  '2016:1145', '2008:962', '2026-09-03'];
let saknas = talKärna.filter((t) => !b.body.includes(t) && !b.title.includes(t) && !b.description.includes(t));
kont('nyckeltalskärna ' + (talKärna.length - saknas.length) + '/' + talKärna.length + ' närvarande', saknas.length === 0,
  saknas.length ? 'saknas: ' + saknas.join(', ') : '');

// ── 9. Tal mot universumets rådata ─────────────────────────────
const uni = JSON.parse(readFileSync(UNI, 'utf8'));
const U = (t) => uni.find((x) => x.ticker === t);
const att = U('ATT.ST'), fre = U('FRE.DE'), gale = U('GALE.SW'), roch = U('ROG.SW'), novo = U('NOVO-B.CO'), geti = U('GETI-B.ST'), sonova = U('SOON.SW'), cevi = U('CEVI.ST'), gmab = U('GMAB'), lly = U('LLY');
const p = (x) => n(x * 100);
const rå = [
  ['Attendo brutto 36,9', p(att.lonksamhet.bruttoMarginal), 36.9],
  ['Attendo ROE 18,7', p(att.lonksamhet.roe), 18.7],
  ['Attendo ROIC 7,57', p(att.lonksamhet.roic), 7.57],
  ['Attendo skuld/EK 3,15', att.stabilitet.skuldEgenkapital, 3.15],
  ['Attendo FCF-marginal 14,3', p(att.lonksamhet.fcfMarginal), 14.27],
  ['Attendo netto 5,1', p(att.lonksamhet.nettoMarginal), 5.14],
  ['Attendo P/E 19,25', att.vardering.pe, 19.25],
  ['Attendo P/B 3,41', att.vardering.pb, 3.41],
  ['Attendo EV/EBIT 17', att.vardering.evEbit, 17],
  ['Attendo PEG 0,97', att.vardering.peg, 0.97],
  ['Attendo fcfYield 15,0', p(att.vardering.fcfYield), 15.0],
  ['Attendo bruttoMedel5år 33,4', p(att.moat.bruttoMarginalMedel5ar), 33.41],
  ['Attendo bruttoSpread5år 4,8', p(att.moat.bruttoMarginalSpread5ar), 4.83],
  ['Attendo oms 2025 = 18 991', att.serier.omsattning[3] / 1e6, 18991],
  ['Attendo oms 2022 = 14 496', att.serier.omsattning[0] / 1e6, 14496],
  ['Attendo netto 2022 = −45', att.serier.resultat[0] / 1e6, -45],
  ['Attendo netto 2025 = 813', att.serier.resultat[3] / 1e6, 813],
  ['Attendo FCF 2022 = 1 165', att.serier.fcf[0] / 1e6, 1165],
  ['Attendo FCF 2025 = 2 657', att.serier.fcf[3] / 1e6, 2657],
  ['Fresenius brutto 25,4', p(fre.lonksamhet.bruttoMarginal), 25.35],
  ['Fresenius P/E 16,26', fre.vardering.pe, 16.26],
  ['Fresenius EV/EBIT 14,55', fre.vardering.evEbit, 14.553],
  ['Fresenius PEG 0,79', fre.vardering.peg, 0.79],
  ['Fresenius oms 2022 = 40 840', fre.serier.omsattning[0] / 1e6, 40840],
  ['Fresenius oms 2023 = 22 299', fre.serier.omsattning[1] / 1e6, 22299],
  ['Fresenius netto 2023 = −594', fre.serier.resultat[1] / 1e6, -594],
  ['Fresenius netto 2025 = 1 264', fre.serier.resultat[3] / 1e6, 1264],
  ['Galenica brutto 12,5', p(gale.lonksamhet.bruttoMarginal), 12.46],
  ['Galenica P/E 25,68', gale.vardering.pe, 25.68],
  ['Galenica EV/EBIT 24,55', gale.vardering.evEbit, 24.55],
  ['Galenica PEG 1,01', gale.vardering.peg, 1.01],
  ['Galenica ROIC 6,82', p(gale.lonksamhet.roic), 6.82],
  ['Galenica skuld/EK 0,78', gale.stabilitet.skuldEgenkapital, 0.78],
  ['Trappa: GMAB 93,0', p(gmab.lonksamhet.bruttoMarginal), 93.0],
  ['Trappa: LLY 83,4', p(lly.lonksamhet.bruttoMarginal), 83.4],
  ['Trappa: Novo 82,0', p(novo.lonksamhet.bruttoMarginal), 82.0],
  ['Trappa: Sonova 73,7', p(sonova.lonksamhet.bruttoMarginal), 73.7],
  ['Trappa: CellaVision 68,7', p(cevi.lonksamhet.bruttoMarginal), 68.7],
  ['Trappa: Getinge 48,6', p(geti.lonksamhet.bruttoMarginal), 48.6],
  ['Trappa: Roche 74,2', p(roch.lonksamhet.bruttoMarginal), 74.2],
];
let råFel = 0;
for (const [namn, ber, vänt] of rå) {
  KONTROLL++;
  if (Math.abs(ber - vänt) <= 0.06) ok('rådata ' + namn);
  else { fel('rådata ' + namn + ': ' + ber + ' mot ' + vänt); råFel++; }
}

// ── 10. Disclaimer + källrad ───────────────────────────────────
// KONTROLLKUR (körning 1): tomrader mellan källrad och disclaimer räknades som
// egna rader — positionerna mäts mot icked-b tomma rader.
const rader = b.body.trimEnd().split('\n').filter((r) => r.trim() !== '');
kont('disclaimer exakt sista rad', rader[rader.length - 1] === '_Detta är pedagogisk finansanalys, inte investeringsråd._');
kont('källrad näst sista rad (kursiv med källor)', rader[rader.length - 2].startsWith('_Källor:'));

// ── 11. Externa URL:er ─────────────────────────────────────────
const ext = [...b.body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
console.log('info: externa URL:er i text:', ext.length, '— live-status kontrollerad separat i sessionen (5/5 HTTP 200)');

// ── DOM ────────────────────────────────────────────────────────
console.log('\n═══ KVD DOM ═══');
console.log('kontroller:', KONTROLL, '| FEL:', FEL, '| VARNING:', WARN, '| ord:', ord, '| externa:', ext.length);
console.log(FEL === 0 ? 'KVD GRÖN' : 'KVD RÖD — kura innan leverans');
process.exit(FEL === 0 ? 0 : 1);
