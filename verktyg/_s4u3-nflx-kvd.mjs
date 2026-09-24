#!/usr/bin/env node
// _s4u3-nflx-kvd.mjs — KVD för Netflix Q3-läspaket 2026 (s4-u3)
// Oberoende av byggmotorn: rådata hårdkodad här + universumfilen läses om.
// Användning: node verktyg/_s4u3-nflx-kvd.mjs [--http]  (app nere 2026-09-22 → länkar valideras mot källkod)
import fs from 'node:fs';
import crypto from 'node:crypto';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-nflx-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';

let pass = 0, fel = 0, varning = 0;
const felposter = [], varnposter = [];
const ok = (namn) => { pass++; };
const fejl = (namn, motiv) => { fel++; felposter.push(`${namn}: ${motiv}`); };
const warn = (namn, motiv) => { varning++; varnposter.push(`${namn}: ${motiv}`); };

const p = JSON.parse(fs.readFileSync(PAKET, 'utf8'));
const uniRaw = fs.readFileSync(UNI);
const md5 = crypto.createHash('md5').update(uniRaw).digest('hex');
const uni = JSON.parse(uniRaw);
const N = uni.find(b => b.ticker === 'NFLX');
const B = p.body, T = p.title, D = p.description;

const num = s => parseFloat(String(s).replace(/\s/g, '').replace(/,/g, '.'));
const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;
function hitta(namn, re, grupp, forvantat, tol) {
  const m = [...B.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))];
  if (!m.length) return fejl(namn, `frasen hittas inte: ${re.source}`);
  const fick = m.map(x => x[grupp]).filter(v => v != null).map(num);
  if (!fick.some(v => Math.abs(v - forvantat) <= tol)) return fejl(namn, `väntade ≈${forvantat} (tol ${tol}), fann [${fick.join(' | ')}]`);
  ok(namn);
}
function finnes(namn, str) { B.includes(str) ? ok(namn) : fejl(namn, `saknar strängen "${str}"`); }

// ---------- 1. STRUKTUR ----------
const h2 = [...B.matchAll(/^## (.+)$/gm)].map(m => m[1]);
const vantaH2 = ['Urvalet: varför Netflix är nästa paket i serien', 'Nyckeltalen att ha med sig — med 97 miljarder timmar i ryggsäcken', 'Källkritiken: FCF-fältet ingen konvention återskapar — och engångsposten som flyttar P/E fem steg', 'Kvartalskedjan: decelerationen och marginalens V', 'Så står sig bolaget mot branschen', 'Tre sätt att läsa utfallet — övningar i metod', 'Praktiskt inför tisdagen 20 oktober', 'Källor'];
h2.length === 8 && h2.every((h, i) => h === vantaH2[i]) ? ok('struktur/h2') : fejl('struktur/h2', JSON.stringify(h2));
p.slug === 'sa-laser-du-nflx-q3-2026' ? ok('struktur/slug') : fejl('struktur/slug', p.slug);
T.startsWith('Netflix Q3-rapport 2026: så läser du den') ? ok('struktur/title') : fejl('struktur/title', 'prefix saknas');
D.length >= 600 && D.length <= 950 ? ok('struktur/description') : warn('struktur/description', `${D.length} tecken`);
/Publicering av utkastet är kundens beslut \(R2\)\.$/.test(B.trimEnd().split('\n').pop()) ? ok('struktur/disclaimer') : fejl('struktur/disclaimer', 'sista raden');
const ord = B.trim().split(/\s+/).length;
ord >= 2200 && ord <= 3400 ? ok('struktur/ord') : warn('struktur/ord', `${ord}`);
p.readingMinutes >= 4 && p.readingMinutes <= 6 ? ok('struktur/rm') : fejl('struktur/rm', `${p.readingMinutes}`);
p.readingMinutes === Math.round(ord / 600) ? ok('struktur/rm-motor') : warn('struktur/rm-motor', `${p.readingMinutes} mot ${Math.round(ord / 600)}`);
['kvartalsrapport', 'Netflix', 'kommunikation', 'USA', 'läspaket'].every(t => p.tags.includes(t)) ? ok('struktur/tags') : fejl('struktur/tags', JSON.stringify(p.tags));
p.publishedAt === '2026-10-20' ? ok('struktur/datum') : fejl('struktur/datum', p.publishedAt);
p.pillar === 'Institutionell metodik' && p.author === 'AK1A Research Lab' ? ok('struktur/meta') : fejl('struktur/meta', p.pillar + '/' + p.author);

// ---------- 2. UNIVERSUMPARITET ----------
const F = [
  ['pris', /82,73 dollar/, 0, N.pris, 0.005],
  ['mcap', /börsvärdet (\d+,\d) miljarder dollar/, 1, N.marknadsKapitalMdr, 0.05],
  ['pe', /\[P\/E\]\([^)]*\) \| (\d+,\d) \|/, 1, N.vardering.pe, 0.06],
  ['pb', /\[P\/B\]\([^)]*\) \| (\d+,\d) \|/, 1, N.vardering.pb, 0.06],
  ['pb-exakt', /(\d+,\d\d\d)/, 1, N.vardering.pb, 0.001],
  ['evEbit', /\[EV\/EBIT\]\([^)]*\) \| (\d+,\d) \|/, 1, N.vardering.evEbit, 0.06],
  ['peg', /\[PEG\]\([^)]*\) \| (\d+,\d\d) \|/, 1, N.vardering.peg, 0.005],
  ['fcfYield', /FCF-avkastning (\d+,\d) procent/, 1, N.vardering.fcfYield * 100, 0.05],
  ['fcfM', /\[FCF-marginal\]\([^)]*\) \| (\d+,\d) % \(fält\)/, 1, N.lonksamhet.fcfMarginal * 100, 0.05],
  ['roe', /\[ROE\]\([^)]*\) \| (\d+,\d) % \|/, 1, N.lonksamhet.roe * 100, 0.05],
  ['roic', /\[ROIC\]\([^)]*\) \| (\d+,\d) % \|/, 1, N.lonksamhet.roic * 100, 0.05],
  ['brutto', /\[Bruttomarginal\]\([^)]*\) \| (\d+,\d) % \|/, 1, N.lonksamhet.bruttoMarginal * 100, 0.05],
  ['ebitM', /EBIT-marginal \| (\d+,\d) % \|/, 1, N.lonksamhet.ebitMarginal * 100, 0.05],
  ['nettoM', /\[Nettomarginal\]\([^)]*\) \| (\d+,\d) % \|/, 1, N.lonksamhet.nettoMarginal * 100, 0.05],
  ['nettoM-exakt', /nettomarginal (\d+,\d\d) procent/, 1, N.lonksamhet.nettoMarginal * 100, 0.005],
  ['skuldEk', /Skuld\/eget kapital \| (\d+,\d\d) \|/, 1, N.stabilitet.skuldEgenkapital, 0.005],
  ['ttm', /\[Omsättningstillväxt\]\([^)]*\) \| (\d+,\d) % \(TTM\)/, 1, N.tillvaxt.omsattningTillvaxtTTM * 100, 0.05],
  ['omsCagr', /Femårs-CAGR-talen (\d+,\d) respektive/, 1, N.tillvaxt.omsattningCAGR5ar * 100, 0.05],
  ['resCagr', /respektive (\d+,\d) procent per år/, 1, N.tillvaxt.resultatCAGR5ar * 100, 0.05],
  ['prognos', /\+(\d+,\d\d) procent \(konsensus EPS-tillväxt/, 1, N.tillvaxt.prognosTillvaxt * 100, 0.005],
  ['insider', /(\d+) transaktioner/, 1, N.aterkop.insiderkopSenaste6man, 0.1],
];
for (const [namn, re, g, v, tol] of F) hitta('paritet/' + namn, re, g, v, tol);
finnes('paritet/oms-serie', '31 616 → 33 723 → 39 001 → 45 183');
finnes('paritet/res-serie', '4 492 → 5 408 → 8 712 → 10 981');
finnes('paritet/not-4ar', 'fyra år');

// ---------- 3. AKTIEÄGARBREV + SÖKDATA (hårdkodade råvärden) ----------
const brev = [
  ['q226-rev', /\| Intäkt \(MUSD\) \| 11 079 \| 11 510 \| 12 051 \| 12 250 \| (\d+ \d\d\d) \| 12 860 \|/, 1, 12560, 0.5],
  ['q226-oi', /\| Rörelseresultat \| 3 775 \| 3 248 \| 2 957 \| 3 957 \| (\d+ \d\d\d) \| 4 268 \|/, 1, 4193, 0.5],
  ['q126-eps', /\| Spädd EPS \(dollar\) \| 0,72 \| 0,59 \| 0,56 \| (\d+,\d\d) \| 0,80 \| 0,82 \|/, 1, 1.23, 0.005],
  ['q226-eps', /\| Spädd EPS \(dollar\) \| 0,72 \| 0,59 \| 0,56 \| 1,23 \| (\d+,\d\d) \| 0,82 \|/, 1, 0.80, 0.005],
  ['q3-eps-guide', /\| Spädd EPS \(dollar\) \| 0,72 \| 0,59 \| 0,56 \| 1,23 \| 0,80 \| (\d+,\d\d) \|/, 1, 0.82, 0.005],
  ['aktier-q225', /\| Antal aktier \(M\) \| (\d+ \d\d\d) \|/, 1, 4349, 0.5],
  ['aktier-q226', /\| Antal aktier \(M\) \| 4 349 \| 4 340 \| 4 317 \| 4 298 \| (\d+ \d\d\d) \|/, 1, 4261, 0.5],
  ['om-q226', /\| Rörelsemarginal \| 34,1 % \| 28,2 % \| 24,5 % \| 32,3 % \| (\d+,\d) % \| 33,2 % \|/, 1, 33.4, 0.05],
  ['om-q3-guide', /\| Rörelsemarginal \| 34,1 % \| 28,2 % \| 24,5 % \| 32,3 % \| 33,4 % \| (\d+,\d) % \|/, 1, 33.2, 0.05],
  ['tillv-q226', /\| Tillväxt år\/år \| 15,9 % \| 17,2 % \| 17,6 % \| 16,2 % \| (\d+,\d) % \| 11,7 % \|/, 1, 13.4, 0.05],
  ['tillv-q3f', /\| Tillväxt år\/år \| 15,9 % \| 17,2 % \| 17,6 % \| 16,2 % \| 13,4 % \| (\d+,\d) % \|/, 1, 11.7, 0.05],
  ['other-q1', /räntor och övriga intäkter (\d+ \d\d\d) miljoner dollar/, 1, 2852, 0.5],
  ['q1-pretax', /Q1:s vinst före skatt var (\d+ \d\d\d) miljoner/, 1, 6547, 0.5],
  ['q1-netto', /mot rapporterade (\d+ \d\d\d) — skillnaden/, 1, 5283, 0.5],
  ['ek', /Eget kapital (\d+ \d\d\d) miljoner dollar \(30 juni 2026\)/, 1, 30152, 0.5],
  ['skuld-brev', /(\d+ \d\d\d)\/30 152 = 0,47/, 1, 14309, 0.5],
];
for (const r of brev) hitta('brev/' + r[0], r[1], r[2], r[3], r[4]);
const strangar = [
  ['brev/fy-guide', '51,0-51,4 miljarder'], ['brev/fy-marginal', 'marginal 31,5 procent'], ['brev/fy25-marginal', '29,5'],
  ['brev/fcf-guide', '12,5'], ['brev/q2-guide-slagen', '0,8 procentenheter'],
  ['aterkop/q2', '4,7 miljarder dollar'], ['aterkop/h1', '6,0 miljarder'], ['aterkop/kvar', 'auktoriserat 27,1 miljarder'],
  ['region/ucan', '5 432'], ['region/emea', '4 034'], ['region/latam', '1 584'], ['region/apac', '1 510'],
  ['engagemang/timmar', '97 miljarder'], ['engagemang/tillvaxt', '+2 procent'], ['engagemang/genai', '300 titlar'],
  ['engagemang/live-budget', '5 procent av innehållsbudgeten'], ['engagemang/live-timmar', '1 procent av visningstimmarna'],
  ['engagemang/signup', 'sex av de tio starkaste'],
  ['sok/rappdag', '20 oktober'], ['sok/tid-pt', '13:01'], ['sok/tid-se', '22:01'], ['sok/intervju', '13:45'],
  ['sok/utlysning', '14 september'], ['sok/ir-kurs', '75,42'], ['sok/ir-dag', '17 september'],
  ['sok/split', '10-för-1'], ['sok/split-utlyst', '30 oktober 2025'], ['sok/split-handel', '17 november'],
  ['sok/split-eps', '8,00'], ['sok/split-kurs', '827'],
  ['sok/q2-eps-est', '0,80 mot 0,79'], ['sok/reaktion-q2', '-8 procent'], ['sok/reaktion-q1', '-9,7'],
  ['sok/eps-spann', '0,80-0,82'], ['sok/wbd', 'Warner Bros'],
  ['urval/nvda', '17 november'], ['urval/asm', 'ASM International'], ['urval/klaim', '05:22:48'],
];
for (const [namn, s] of strangar) finnes(namn, s);

// ---------- 4. ARITMETIK (oberoende omräkning) ----------
// TTM ur tabellvärdena
const revTTM = 11510 + 12051 + 12250 + 12560, niTTM = 2547 + 2419 + 5283 + 3401.414, oiTTM = 3248 + 2957 + 3957 + 4192.610;
const fcfTTM = 2660 + 1872 + 5094 + 1525.168;
const A = [
  ['ttm-rev', new RegExp(String(revTTM).replace(/(\d)(\d{3})$/, '$1 $2')), 0, revTTM, 0.5],
  ['ttm-ni', /rapporterat netto (\d+ \d\d\d) miljoner, justerat/, 1, niTTM, 0.5],
  ['ttm-oi', /TTM-rörelseresultatet (\d+ \d\d\d) miljoner/, 1, oiTTM, 0.5],
  ['ttm-fcf', /kvartalens fria kassaflöde är (\d+ \d\d\d) miljoner/, 1, fcfTTM, 0.5],
  ['fcf-marg-ttm', /(\d+,\d) procent marginal, alltså/, 1, (fcfTTM / revTTM) * 100, 0.05],
  ['fcf-yield-ttm', /(\d+,\d) procent avkastning på börsvärdet/, 1, (fcfTTM / 1000 / 344.483) * 100, 0.05],
  ['fcf-guide-marg', /ger (\d+,\d) procent\./, 1, 12.5 / 51.2 * 100, 0.05],
  ['fcf-kvot', /kvoten är (\d,\d)/, 1, 52.49 / 23.05, 0.05],
  ['ident-vinst', /P\/E-talet ger (\d+,\d\d) miljarder implicit/, 1, 344.483 / 25.377, 0.005],
  ['ident-gap', /gap (\d+,\d\d) procent/, 1, (niTTM / 1000 / (344.483 / 25.377) - 1) * 100, 0.01],
  ['netto-falt', /nettomarginal (\d+,\d\d) procent är exakt/, 1, niTTM / revTTM * 100, 0.005],
  ['aktiebas', /aktiebasen (\d+ \d\d\d) miljoner aktier/, 1, 344.483 / 82.73 * 1000, 0.5],
  ['ek-aktie', /ger (\d+,\d\d) dollar per aktie/, 1, 30152.052 / (344.483 / 82.73 * 1000), 0.005],
  ['pb-vag', /kursen 82,73 delat med (\d+,\d\d) är (\d+,\d\d)/, 2, 11.425, 0.005],
  ['skatt-prov', /beskatta resten med (\d+,\d) procent/, 1, 667.172 / 4068.586 * 100, 0.05],
  ['q1-just', /cirka (\d+ \d\d\d) mot rapporterade/, 1, (6547.086 - 2852.166) * (1 - 667.172 / 4068.586), 1.5],
  ['eng-just', /skillnaden (\d+ \d\d\d) miljoner/, 1, 5283 - (6547.086 - 2852.166) * (1 - 667.172 / 4068.586), 1.5],
  ['ttm-just', /justerat (\d+ \d\d\d) miljoner\. Effekten/, 1, niTTM - (5283 - (6547.086 - 2852.166) * (1 - 667.172 / 4068.586)), 1.5],
  ['pe-just', /P\/E (\d+,\d) mot (\d+,\d) — fem hela/, 2, 344.483 / ((niTTM - (5283 - (6547.086 - 2852.166) * (1 - 667.172 / 4068.586))) / 1000), 0.05],
  ['netto-just', /nettomarginal (\d+,\d) mot (\d+,\d) procent/, 2, ((niTTM - (5283 - (6547.086 - 2852.166) * (1 - 667.172 / 4068.586))) / revTTM) * 100, 0.05],
  ['peg-konv', /division (\d+,\d)\/6,43 = (\d+,\d)/, 2, 25.377 / 6.43, 0.05],
  ['peg-implicit', /implicita nämnare är (\d+,\d) procent/, 1, 25.377 / 1.49, 0.05],
  ['ev', /= (\d+,\d) miljarder\. På TTM/, 1, 344.483 + 14.309306 - 9.099232, 0.05],
  ['ev-ebit-oi', /blir EV\/EBIT (\d+,\d);/, 1, (344.483 + 14.309306 - 9.099232) / (oiTTM / 1000), 0.05],
  ['eit-implicit', /EBIT-bas på (\d+ \d\d\d) miljoner/, 1, (344.483 + 14.309306 - 9.099232) / 21.801 * 1000, 1.5],
  ['skuldkvot-brev', /14 309\/30 152 = (\d+,\d\d)/, 1, 14309.306 / 30152.052, 0.005],
  ['cagr-kontroll', /31 616 gånger 1,126 i tre steg ger (\d+ \d\d\d)/, 1, 31616 * Math.pow(1.1264, 3), 40],
  ['ni-tillvaxt', /nettoresultat \+(\d+,\d) procent/, 1, (3401.414 / 3125 - 1) * 100, 0.05],
  ['aktie-minsk', /aktieantal -(\d+,\d) procent/, 1, (1 - 4261 / 4349) * 100, 0.05],
  ['aterkop-andel', /(\d+) procent av års-guiden för fritt kassaflöde/, 1, 5.984991 / 12.5 * 100, 0.5],
  ['aterkop-program', /(\d+,\d) procent av dagens börsvärde/, 1, 27.1 / 344.483 * 100, 0.05],
  ['ads-andel', /alltså (\d+,\d) % av guidens intäktsmittpunkt/, 1, 3 / 51.2 * 100, 0.05],
  ['fy25-oi', /på fjolårets bas (\d+,\d) miljarder/, 1, 45.183 * 0.295, 0.05],
  ['fy26-krav', /betyder minst (\d+,\d) —/, 1, 45.183 * 0.295 * 1.2, 0.05],
  ['kurs-fall', /minus (\d+,\d) procent sedan raden/, 1, Math.abs((75.42 / 82.73 - 1) * 100), 0.05],
  ['pe-ir', /P\/E på dagens kurs: (\d+,\d) på fält-EPS/, 1, 75.42 / (82.73 / 25.377), 0.05],
  ['pe-ir-just', /(\d+,\d) på det justerade/, 1, 75.42 / (11456.1 / 4164.4), 0.05],
  ['eps-mekan', /landa på \+(\d+)\. Fråga/, 1, 11, 0.1],
  ['region-kontroll', /\+21 mot \+(\d+)\)/, 1, 16, 0.1],
];
for (const r of A) hitta('arit/' + r[0], r[1], r[2], r[3], r[4]);
// scenarierutan: 9 celler parsade och omräknade
const scen = [...B.matchAll(/\| Intäkt (\d+,\d) mdr \| (\d+ \d\d\d) \| (\d+ \d\d\d) \| (\d+ \d\d\d) \|/g)];
if (scen.length !== 3) fejl('arit/scen-rader', `väntade 3 rader, fann ${scen.length}`);
else {
  const marg = [30.5, 31.5, 32.5]; let cellor = 0;
  scen.forEach((rad, i) => {
    const rev = num(rad[1]);
    for (let j = 0; j < 3; j++) {
      const cell = num(rad[2 + j]), vanta = rev * marg[j] / 100 * 1000;
      if (Math.abs(cell - vanta) > 1) fejl(`arit/scen[${i}][${j}]`, `${cell} mot ${vanta.toFixed(0)}`); else cellor++;
    }
  });
  cellor === 9 ? ok('arit/scen-9-cellor') : null;
  hitta('arit/scen-mitt', /Mittrutan (\d+ \d\d\d) miljoner/, 1, 51.2 * 0.315 * 1000, 1);
  hitta('arit/scen-mitt-prov', /(\d+,\d) % mot fjolårets rörelseresultat/, 1, (16.128 / 13.329 - 1) * 100, 0.05);
  hitta('arit/scen-vikt-marg', /procentenhet marginal är (\d+) miljoner/, 1, 512, 0.5);
  hitta('arit/scen-vikt-rev', /procent intäkter är (\d+ \d\d\d) miljoner/, 1, 1536, 0.5);
  hitta('arit/scen-vikt', /Vikten (\d+,\d\d)/, 1, 512 / 1536, 0.005);
}
// EPS-mekaniken fullständigt: 1,088 × 1,021 = 1,111
const mek = (3401.414 / 3125) * (4349 / 4261);
if (Math.abs(mek * 0.72 - 0.80) > 0.005) fejl('arit/eps-cirkel', `${mek * 0.72}`); else ok('arit/eps-cirkel');

// ---------- 5. MEDIANER + RANG (live ur universumfilen) ----------
const gren = uni.filter(b => b.bransch === 'kommunikation');
const faltFn = {
  pe: b => b.vardering?.pe, pb: b => b.vardering?.pb, evEbit: b => b.vardering?.evEbit,
  peg: b => b.vardering?.peg, roe: b => b.lonksamhet?.roe, roic: b => b.lonksamhet?.roic,
  brutto: b => b.lonksamhet?.bruttoMarginal, ebitM: b => b.lonksamhet?.ebitMarginal,
  netto: b => b.lonksamhet?.nettoMarginal, fcfM: b => b.lonksamhet?.fcfMarginal,
  skuldEk: b => b.stabilitet?.skuldEgenkapital, omsCagr: b => b.tillvaxt?.omsattningCAGR5ar,
};
// tabellmedianer i texten: [regex, fält, decimaler]
const tabell = [
  [/pe\)\| (\d+,?\d*) \| (\d+,?\d*) \|/],
];
const medianForv = [
  ['pe', /\[P\/E\]\([^)]*\) \| \d+,\d \| (\d+,\d) \|/, 16.2],
  ['pb', /\[P\/B\]\([^)]*\) \| \d+,\d \| (\d+,\d\d) \|/, 2.27],
  ['evEbit', /\[EV\/EBIT\]\([^)]*\) \| \d+,\d \| (\d+,\d) \|/, 14.5],
  ['peg', /\[PEG\]\([^)]*\) \| \d+,\d\d \| (\d+,\d\d) \|/, 1.49],
  ['roe', /\[ROE\]\([^)]*\) \| \d+,\d % \| (\d+,\d) % \|/, 16.3],
  ['roic', /\[ROIC\]\([^)]*\) \| \d+,\d % \| (\d+,\d) % \|/, 10.7],
  ['brutto', /\[Bruttomarginal\]\([^)]*\) \| \d+,\d % \| (\d+,\d) % \|/, 47.8],
  ['ebitM', /EBIT-marginal \| \d+,\d % \| (\d+,\d) % \|/, 18.1],
  ['netto', /\[Nettomarginal\]\([^)]*\) \| \d+,\d % \| (\d+,\d) % \|/, 11.5],
  ['skuldEk', /Skuld\/eget kapital \| \d+,\d\d \| (\d+,\d\d) \|/, 1.28],
  ['omsCagr', /\| (\d+,\d) %\/år \(femårsbas\)/, 3.3],
  ['fcfM', /\[FCF-marginal\]\([^)]*\) \| \d+,\d % \(fält\) \| (\d+,\d) % \|/, 12.6],
];
for (const [namn, re, vanta] of medianForv) {
  const v = gren.map(faltFn[namn]).filter(x => x != null).sort((a, b) => a - b);
  const live = namn === 'omsCagr' ? v[Math.floor(v.length / 2)] * 100 : (v[Math.floor(v.length / 2)] * (namn === 'pe' || namn === 'pb' || namn === 'evEbit' || namn === 'peg' || namn === 'skuldEk' ? 1 : 100));
  if (Math.abs(live - vanta) > 0.06) { warn('median/' + namn, `text ${vanta} mot live ${live.toFixed(2)} (n=${v.length})`); continue; }
  hitta('median/' + namn, re, 1, vanta, 0.06);
}
// rang-påståenden mot live beräkning
const rangP = (namn, fkons, vantaUnder, n, text) => {
  const v = gren.map(fkons).filter(x => x != null);
  const mine = fkons(N);
  const under = v.filter(x => x < mine).length;
  Math.abs(under - vantaUnder) <= 0.01 && v.length === n ? finnes('rang/' + namn, text) : fejl('rang/' + namn, `under=${under} n=${v.length} (väntade ${vantaUnder}/${n})`);
};
rangP('roe-hogst', b => b.lonksamhet?.roe, 22, 23, 'högst av samtliga 23');
rangP('pb-2a', b => b.vardering?.pb, 21, 23, 'näst högst av 23');
rangP('ebit-2a', b => b.lonksamhet?.ebitMarginal, 21, 23, 'näst högst av 23');
rangP('evEbit-4e', b => b.vardering?.evEbit, 19, 23, 'fjärde högst av 23');
rangP('pe-5e', b => b.vardering?.pe, 16, 21, 'femte högst av 21');
rangP('roic-3e', b => b.lonksamhet?.roic, 20, 23, 'tredje högst av 23');
rangP('netto-3e', b => b.lonksamhet?.nettoMarginal, 20, 23, 'tredje högst av 23');
rangP('peg-median', b => b.vardering?.peg, 8, 17, 'exakt på medianen (av 17)');
rangP('skuldek-8e-lagst', b => b.stabilitet?.skuldEgenkapital, 7, 23, 'åttonde lägst av 23');
rangP('omscagr-6e', b => b.tillvaxt?.omsattningCAGR5ar, 17, 23, 'sjätte högst av 23');
rangP('fcfm-hogst', b => b.lonksamhet?.fcfMarginal, 21, 22, 'högst av 22');
finnes('rang/gren-n', '23 bolag');

// ---------- 6. JURIDIKGRIND ----------
const lagrum = (B.match(/2007:528/g) || []).length;
lagrum === 1 ? ok('juridik/lagrum-1') : fejl('juridik/lagrum-1', `${lagrum} förekomster`);
finnes('juridik/paragraf', '2 kap 5 §');
const radMönster = [/köp (?:denna |aktien )/i, /sälj (?:denna |aktien )/i, /rekommenderar (?:köp|sälj)/i, /strong buy/i, /stark (?:köp|sälj)/i, /ta position/i, /öka din exponering/i, /buffertköp/i, /bör du köpa/i];
const radTraff = radMönster.filter(re => re.test(B));
radTraff.length === 0 ? ok('juridik/rad-mönster') : fejl('juridik/rad-mönster', radTraff.join(', '));
finnes('juridik/utbildning', 'utbildning');
finnes('juridik/inga-rad', 'Inga köp-, sälj- eller behållningsrekommendationer');

// ---------- 7. SPRÅKGRIND ----------
const sprak = [
  [/\u00a0/g, 'nbsp'], [/[\u202f\u2009]/g, 'smalt/hårt mellanrum'], [/[“”‘’«»]/g, 'typografiska citat'],
  [/[\u4e00-\u9fff]/g, 'CJK'], [/\u2212/g, 'U+2212-minus'], [/ {2,}/g, 'dubbla mellanslag'],
];
for (const [re, namn] of sprak) { const n = (B.match(re) || []).length; n === 0 ? ok('sprak/' + namn) : fejl('sprak/' + namn, `${n} träffar`); }

// ---------- 8. LÄNKAR ----------
const lnk = [...B.matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]);
const interna = lnk.filter(u => u.startsWith('/'));
const externa = lnk.filter(u => u.startsWith('http'));
const aspektKalla = ['nyckeltal-a', 'nyckeltal-b', 'nyckeltal-pe-pb', 'omsattning-tillvaxt-ttm', 'universum', 'land', 'vardering']
  .map(f => fs.readFileSync('/home/ak1a/AK1/src/lib/dataset-aspekter/' + f + '.ts', 'utf8')).join('\n');
const aspectSlugs = new Set([...aspektKalla.matchAll(/(?:nyckeltalsModul|multiplModul|Modul)\(\s*"([a-z0-9-]+)"/g)].map(m => m[1]));
['universumjamforelse', 'omsattningstillvaxt-ttm', 'fcf-avkastning', 'skuldsattning', 'vardering', 'sverige', 'usa'].forEach(s => aspectSlugs.add(s));
const ogiltiga = interna.filter(u => {
  if (u.startsWith('/dataset/kommunikation/')) return !aspectSlugs.has(u.split('/')[3]);
  return !['/kurser', '/transparens', '/kallor'].includes(u);
});
ogiltiga.length === 0 ? ok('lank/interna-mal') : fejl('lank/interna-mal', ogiltiga.join(', '));
new Set(interna).size >= 12 ? ok('lank/interna-antal') : warn('lank/interna-antal', `${new Set(interna).size}`);
const ogiltigaExt = externa.filter(u => !/^https:\/\/(ir\.netflix\.net|s22\.q4cdn\.com)/.test(u));
ogiltigaExt.length === 0 ? ok('lank/externa') : fejl('lank/externa', ogiltigaExt.join(', '));

// ---------- 9. KONTEXT (klaim, duplikat, md5) ----------
fs.existsSync('/home/ak1a/AK1/data/vakten/klaim-s4u3-nflx-q3-2026.md') ? ok('kontext/klaim') : fejl('kontext/klaim', 'klaimfilen saknas');
const dup = fs.readdirSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/').filter(f => /nflx|netflix/i.test(f));
dup.length === 1 && dup[0] === 'sa-laser-du-nflx-q3-2026.json' ? ok('kontext/duplikat') : fejl('kontext/duplikat', JSON.stringify(dup));
B.includes(md5) ? ok('kontext/md5') : warn('kontext/md5', `paketet bär ${B.match(/md5 ([a-f0-9]{8})/)?.[1] ?? 'okänt'} mot nuvarande ${md5.slice(0, 8)}`);

// ---------- RAPPORT ----------
console.log(`KVD NFLX: ${pass} PASS, ${fel} FEL, ${varning} VARNINGAR`);
if (felposter.length) { console.log('FEL:'); felposter.forEach(f => console.log('  -', f)); }
if (varnposter.length) { console.log('VARNING:'); varnposter.forEach(v => console.log('  -', v)); }
process.exit(fel > 0 ? 1 : 0);
