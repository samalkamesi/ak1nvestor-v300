#!/usr/bin/env node
// s4-u3 VÅR ENERGI — KVD för Q3-läspaketet (2026-09-18)
// Kontrollerar: struktur, källtalsparitet mot universumposten, aritmetik (oberoende omräkning),
// medianer/rang ur 177-postfilen, scenarieceller, juridikgrind, interna länkar HTTP 200.
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-var-energi-q3-2026.json';
const U = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const p = U.find(x => x.ticker === 'VAR.OL');
const j = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const body = j.body;
let pass = 0, fel = 0, varn = 0;
const ok = namn => { pass++; };
const nej = (namn, detalj) => { fel++; console.log('FEL:', namn, detalj ?? ''); };
const P = (villkor, namn, detalj) => villkor ? ok() : nej(namn, detalj);
const fmt = x => String(x).replace('.', ',');
const har = s => body.includes(s);

// === 1. STRUKTUR ===
P(j.slug === 'sa-laser-du-var-energi-q3-2026', 'slug');
for (const k of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body']) P(typeof j[k] !== 'undefined' && j[k] !== '', 'fält ' + k);
P(j.pillar === 'Institutionell metodik' && j.author === 'AK1A Research Lab', 'pillar/author');
P(j.publishedAt === '2026-10-21', 'publishedAt = rappdagen 21 oktober');
P(Array.isArray(j.tags) && j.tags.length === 7 && j.tags.includes('Vår Energi') && j.tags.includes('läspaket'), 'tags 7 st');
const ord = body.split(/\s+/).filter(Boolean).length;
P(Math.round(ord / 600) === j.readingMinutes, 'readingMinutes = round(ord/600)', ord + ' ord → ' + Math.round(ord / 600) + ' ≠ ' + j.readingMinutes);
P(!/\u00AD/.test(body), '0 mjuka bindestreck');
P(body.startsWith('Vår Energi ASA'), 'ingress först');
for (const sektion of ['## Urvalet', '## Nyckeltalen', '## Källkritik', '## Så står sig bolaget', '## Tre sätt att läsa', '## Praktiskt inför 21 oktober', '## Källor'])
  P(har(sektion), 'sektion ' + sektion);

// === 2. KÄLLTALSPARITET mot VAR.OL-posten (hämtad 2026-09-03) ===
const talpar = [
  ['pris', fmt(p.pris.toFixed(2)), '50,48'], ['mcap', '126,0', null], ['mcap-kalla', '126,011', null],
  ['pe', '10,18', '10,177'], ['pe-exakt', '10,177', null], ['pb', '57,9', '57,915'], ['pb-exakt', '57,915', null],
  ['evEbit', '20,4', '20,373'], ['fcfYield', '3,94', null], ['roe', '93,98', null], ['roic', '76,52', null],
  ['brutto', '88,11', null], ['ebit', '59,41', null], ['netto', '13,02', null], ['fcfMarg', '46,51', null],
  ['skuldEk', '3,08', '3,0773'], ['omsCAGR', '6,26', null], ['resCAGR', '5,70', null],
  ['omsTTM', '102,7', null], ['prognos', '34,05', null],
  ['ser-oms-2022', '9 827,6', null], ['ser-oms-2023', '6 849,7', null], ['ser-oms-2024', '7 450,1', null], ['ser-oms-2025', '8 095,6', null],
  ['ser-res-2022', '936,4', null], ['ser-res-2023', '610,2', null], ['ser-res-2024', '311,5', null], ['ser-res-2025', '785,2', null],
];
for (const [namn, hittat] of talpar) P(har(hittat), 'källtalsparitet ' + namn + ' (' + hittat + ')');
// källvärden i filen stämmer med det paketet påstår
P(Math.abs(p.pris - 50.48) < 1e-9 && Math.abs(p.vardering.pb - 57.915) < 1e-9 && Math.abs(p.lonksamhet.roe - 0.9398) < 1e-9, 'filvärden P/B+ROE+pris');
P(Math.abs(p.marknadsKapitalMdr - 126.011) < 1e-9, 'filvärde mcap');
P(p.serier.omsattning.join(',') === '9827630000,6849716000,7450056000,8095600000' && p.serier.resultat.join(',') === '936402000,610229000,311508000,785200000', 'filvärden serier');
P(p.vardering.peg === null && p.stabilitet.rantaTackning === null, 'PEG + räntetäckning null i filen');

// === 3. ARITMETIK (oberoende omräkning; formatsträngar som bodyn måste innehålla) ===
const r = (x, d) => Number(x.toFixed(d));
const A = [];
const ek = p.marknadsKapitalMdr / p.vardering.pb;               // 2,1763 mdr
const aktier = p.marknadsKapitalMdr * 1000 / p.pris;            // 2496,3 M
const skuld = p.stabilitet.skuldEgenkapital * ek;
const ev = ek + skuld;
const ebit25 = p.serier.omsattning[3] * p.lonksamhet.ebitMarginal;
A.push(['identitet P/B÷ROE', ek && p.vardering.pb / p.lonksamhet.roe, 61.63, '61,63']);
A.push(['identitet omvänd P/E×ROE', p.vardering.pe * p.lonksamhet.roe, 9.56, '9,56']);
A.push(['identitetskvot', (p.vardering.pb / p.lonksamhet.roe) / p.vardering.pe, 6.06, '6,06']);
A.push(['implicit EPS', p.pris / p.vardering.pe, 4.96, '4,96']);
A.push(['valutafria testet', (p.pris / p.vardering.pe) / (p.lonksamhet.roe * (p.pris / p.vardering.pb)), 6.055, '6,055']);
A.push(['ROE×BV-underlag', p.lonksamhet.roe * (p.pris / p.vardering.pb), 0.819, '0,819']);
A.push(['EK härlett', ek, 2.176, '2,176']);
A.push(['aktier härledda', aktier, 2496, '2 496']);
A.push(['skuld härledd', skuld, 6.697, '6,697']);
A.push(['EV kedja', ev, 8.873, '8,873']);
A.push(['EBIT 2025', ebit25 / 1e6, 4810, '4 810']);
A.push(['EV/EBIT kedja', (ev * 1000) / (ebit25 / 1e6), 1.85, '1,85']);
A.push(['EV-kvot', (ev * 1000) / (ebit25 / 1e6) / p.vardering.evEbit, 0.091, '0,091']);
A.push(['fält-EV', p.vardering.evEbit * (ebit25 / 1e6) / 1000, 98.0, '98,0']);
A.push(['imp nettokassa', p.marknadsKapitalMdr - p.vardering.evEbit * (ebit25 / 1e6) / 1000, 28, '28']);
A.push(['DuPont oms/EK', p.serier.omsattning[3] / (ek * 1e9), 3.72, '3,72']);
A.push(['DuPont före hävstång %', p.lonksamhet.nettoMarginal * (p.serier.omsattning[3] / (ek * 1e9)) * 100, 48.4, '48,4']);
A.push(['DuPont full %', p.lonksamhet.nettoMarginal * (p.serier.omsattning[3] / (ek * 1e9)) * (1 + p.stabilitet.skuldEgenkapital) * 100, 197.5, '197,5']);
A.push(['DuPont-faktor', (p.lonksamhet.nettoMarginal * (p.serier.omsattning[3] / (ek * 1e9)) * (1 + p.stabilitet.skuldEgenkapital)) / p.lonksamhet.roe, 2.10, '2,10']);
A.push(['FCF M', (p.serier.omsattning[3] * p.lonksamhet.fcfMarginal) / 1e6, 3766, '3 766']);
A.push(['FCF-yield bland %', (p.serier.omsattning[3] * p.lonksamhet.fcfMarginal / 1e6) / (p.marknadsKapitalMdr * 1000) * 100, 2.99, '2,99']);
A.push(['FCF-kvot bland', (p.serier.omsattning[3] * p.lonksamhet.fcfMarginal / 1e6) / (p.marknadsKapitalMdr * 1000) / p.vardering.fcfYield, 0.76, '0,76']);
A.push(['ROIC-proxy %', (ebit25 / 1e6) / (ev * 1000) * 100, 54.2, '54,2']);
A.push(['ROIC-kvot', (ebit25 / 1e6) / (ev * 1000) / p.lonksamhet.roic, 0.71, '0,71']);
A.push(['PEG-konvention', p.vardering.pe / -34.05, -0.30, '\u22120,30']);
A.push(['multipl 15,43', p.vardering.pe / (1 + p.tillvaxt.prognosTillvaxt), 15.43, '15,43']);
A.push(['marginalvikt', 1 / (3 * p.lonksamhet.ebitMarginal), 0.56, '0,56']);
A.push(['1 pp marginal M', p.serier.omsattning[3] * 0.01 / 1e6, 81, '81']);
A.push(['3 % intäkter M', p.serier.omsattning[3] * 0.03 / 1e6, 243, '243']);
A.push(['bottenår 338 M', p.serier.omsattning[3] * 0.0418 / 1e6, 338, '338']);
A.push(['huvudcell/botten', (ebit25 / 1e6) / (p.serier.omsattning[3] * 0.0418 / 1e6), 14.2, 'fjorton']);
A.push(['netto/EBIT andel %', (p.lonksamhet.nettoMarginal / p.lonksamhet.ebitMarginal) * 100, 21.9, '22']);
A.push(['klipp-andel %', (1 - p.lonksamhet.nettoMarginal / p.lonksamhet.ebitMarginal) * 100, 78.1, '78,1']);
A.push(['klipp pp', (p.lonksamhet.ebitMarginal - p.lonksamhet.nettoMarginal) * 100, 46.4, '46,4']);
A.push(['brutto-EBIT pp', (p.lonksamhet.bruttoMarginal - p.lonksamhet.ebitMarginal) * 100, 28.7, '28,7']);
A.push(['FCF/netto-kvot', p.lonksamhet.fcfMarginal / p.lonksamhet.nettoMarginal, 3.57, '3,6']);
for (const [namn, min, exp, str] of A) {
  P(Math.abs(min - exp) <= Math.max(Math.abs(exp) * 0.005, 0.05), 'aritmetik ' + namn + ' = ' + r(min, 3) + ' (väntat ' + exp + ')');
  P(har(str), 'body innehåller ' + namn + ' → "' + str + '"');
}
// CAGR + steg + marginalserie
const cagr = (a, b) => Math.pow(b / a, 1 / 3) - 1;
P(Math.abs(cagr(p.serier.omsattning[0], p.serier.omsattning[3]) * 100 + 6.26) < 0.01, 'omsCAGR −6,26 replikerad');
P(Math.abs(cagr(p.serier.resultat[0], p.serier.resultat[3]) * 100 + 5.70) < 0.01, 'resCAGR −5,70 replikerad');
for (const [str] of [['−30,30'], ['+8,76'], ['+8,66'], ['−34,83'], ['−48,95'], ['+152,06'], ['9,53'], ['8,91'], ['4,18'], ['9,70']])
  P(har(str), 'serie/steg i body: ' + str);
// scenarieceller 9 st (miljoner dollar, avrundat)
const cell = (df, dm) => Math.round(p.serier.omsattning[3] * (1 + df) * (p.lonksamhet.ebitMarginal + dm) / 1e6);
const cells = [cell(-0.03, -0.01), cell(-0.03, 0), cell(-0.03, 0.01), cell(0, -0.01), cell(0, 0), cell(0, 0.01), cell(0.03, -0.01), cell(0.03, 0), cell(0.03, 0.01)];
const forv = ['4 587', '4 665', '4 744', '4 729', '4 810', '4 891', '4 870', '4 954', '5 037'];
for (let i = 0; i < 9; i++) P(cells[i] === Number(forv[i].replace(/\s/g, '')), 'scenariecell ' + (i + 1) + ' = ' + cells[i] + ' (body: ' + forv[i] + ')');
const tabellRader = (body.match(/\| Intäkter /g) || []).length;
P(tabellRader === 3, 'scenariotabell 3 intäktsrader', tabellRader);

// === 4. MEDIANER & RANG (oberoende ur 177-postfilen) ===
const E = U.filter(x => x.bransch === 'energi');
const med = arr => { const v = arr.filter(x => typeof x === 'number' && isFinite(x)).sort((a, b) => a - b); return v[(v.length - 1) >> 1]; };
const rang = (fn, eget) => { const v = E.map(fn).filter(x => typeof x === 'number' && isFinite(x)).sort((a, b) => a - b); return [v.indexOf(eget) + 1, v.length]; };
P(U.length === 177 && E.length === 19, 'filen 177 poster / 19 energi', U.length + '/' + E.length);
const medpar = [
  ['P/E gren 16,05', med(E.map(x => x.vardering?.pe)), 16.05], ['P/B gren 2,28', med(E.map(x => x.vardering?.pb)), 2.275],
  ['EV/EBIT gren 13,44', med(E.map(x => x.vardering?.evEbit)), 13.44], ['ROE gren 12,91%', med(E.map(x => x.lonksamhet?.roe)) * 100, 12.91],
  ['EBIT gren 18,22%', med(E.map(x => x.lonksamhet?.ebitMarginal)) * 100, 18.22], ['netto gren 9,08%', med(E.map(x => x.lonksamhet?.nettoMarginal)) * 100, 9.08],
  ['skuld/EK gren 0,50', med(E.map(x => x.stabilitet?.skuldEgenkapital)), 0.5037], ['FCF-y gren 5,28%', med(E.map(x => x.vardering?.fcfYield)) * 100, 5.28],
  ['ROIC gren 11,63%', med(E.map(x => x.lonksamhet?.roic)) * 100, 11.63], ['omsCAGR gren −8,44%', med(E.map(x => x.tillvaxt?.omsattningCAGR5ar)) * 100, -8.44],
];
for (const [namn, egen, exp] of medpar) P(Math.abs(egen - exp) < 0.006, 'median ' + namn + ' = ' + r(egen, 3));
const univPE = med(U.map(x => x.vardering?.pe)), univPB = med(U.map(x => x.vardering?.pb));
P(Math.abs(univPE - 21.153) < 0.01 && Math.abs(univPB - 2.806) < 0.01, 'universummedianer P/E 21,15 + P/B 2,81');
for (const s of ['16,05', '2,28', '13,44', '12,91', '18,22', '9,08', '0,50', '5,28', '11,63', '8,44', '21,15', '2,81', '15,34', '21,11', '14,09', '3,80'])
  P(har(s), 'median i body: ' + s);
const [peR] = [rang(x => x.vardering?.pe, p.vardering.pe)];
P(peR[0] === 2 && peR[1] === 18, 'P/E rang 2/18 (näst lägsta)', peR.join('/'));
P(rang(x => x.vardering?.pb, p.vardering.pb)[0] === 19, 'P/B rang 19/19 (högst)');
P(rang(x => x.lonksamhet?.roe, p.lonksamhet.roe)[0] === 19, 'ROE rang 19/19 (högst)');
P(rang(x => x.stabilitet?.skuldEgenkapital, p.stabilitet.skuldEgenkapital)[0] === 19, 'skuld/EK rang 19/19 (högst)');
P(rang(x => x.lonksamhet?.bruttoMarginal, p.lonksamhet.bruttoMarginal)[0] === 18, 'brutto rang 18/19 (näst högst)');
P(rang(x => x.lonksamhet?.ebitMarginal, p.lonksamhet.ebitMarginal)[0] === 18, 'EBIT rang 18/19 (näst högst)');
P(rang(x => x.tillvaxt?.prognosTillvaxt, p.tillvaxt.prognosTillvaxt)[0] === 1, 'prognos rang 1/18 (lägst)');
P(har('177-postfilen') && har('2026-09-18'), 'median-datum + filstorlek redovisade');
P(har('2026-09-03'), 'postens hämtdatum redovisat');

// === 5. JURIDIKGRIND (lagen 2007:528 — utbildning, aldrig råd) ===
const lagrum = (body.match(/2007:528/g) || []).length;
P(lagrum === 1, 'exakt ett lagrum 2007:528', lagrum);
P(har('2 kap 5 §'), 'paragraf angiven');
const radorader = body.split(/(?<=[.!?])\s+/).filter(m => /\b(köp|sälj|köpa|sälja|rekommendera|rekommendation\w*|råd\b|råd)\b/i.test(m));
const tillatna = [/inte en rekommendation att köpa/i, /inga köp-, sälj- eller hållningsrekommendationer/i, /inga siffror, inga råd/i, /insiderköp/i, /Insiderköp senaste/i];
for (const mening of radorader) {
  const okMening = tillatna.some(re => re.test(mening)) || !/(^|\s)(köp|sälj|köpa|sälja|rekommendera|rekommendation)/i.test(mening.replace(/insiderköp/gi, '').replace(/utdelnings-/gi, ''));
  P(okMening, 'rådkontext neutral: "' + mening.slice(0, 70) + '…"');
}
P(har('publiceringen av detta paket är kundens beslut'), 'R2-disclaimer');

// === 6. INTERNA LÄNKAR HTTP 200 ===
const m = body.match(/\]\((\/[^)]+)\)/g) || [];
const links = [...new Set(m.map(s => s.slice(2, -1)))].filter(u => !u.includes('http'));
const forvLinks = ['/dataset/energi/pe', '/dataset/energi/pb', '/dataset/energi/ev-ebit', '/dataset/energi/fcf-avkastning', '/dataset/energi/peg', '/dataset/energi/vardering', '/dataset/energi/roe', '/dataset/energi/roic', '/dataset/energi/brutto-marginal', '/dataset/energi/netto-marginal', '/dataset/energi/omsattning-cagr-5ar', '/dataset/energi/resultat-cagr-5ar', '/dataset/energi/omsattningstillvaxt-ttm', '/dataset/energi/prognos-tillvaxt', '/dataset/energi/skuldsattning', '/dataset/energi/universumjamforelse', '/bolag/var-ol', '/kurser', '/transparens', '/kallor'];
P(links.length === forvLinks.length, '20 unika interna länkar', links.length);
for (const l of forvLinks) P(links.includes(l), 'förväntad länk ' + l);
let lankOk = 0, lankFel = 0;
for (const l of links) {
  try { const res = await fetch('http://localhost:3000' + l, { redirect: 'follow' }); if (res.ok) lankOk++; else { lankFel++; console.log('LÄNK FEL', res.status, l); } }
  catch { lankFel++; console.log('LÄNK FETCH-FEL', l); }
}
P(lankFel === 0 && lankOk === links.length, 'samtliga interna länkar HTTP 200', lankOk + '/' + links.length);
console.log('Länkar: ' + lankOk + '/' + links.length + ' HTTP 200');

// === 7. ÖVRIGT ===
P(har('varenergi.no/en/investor/financial-calendar'), 'kalenderkälla angiven');
P(har('2026-10-21') || har('21 oktober'), 'rappdag 21 oktober');
P(har('12 oktober'), 'trading update 12 oktober');
P((body.match(/Endast kalenderfakta — inga siffror, inga råd/g) || []).length === 1, 'kalenderns citatrad citerad korrekt');
P(har('Iberdrola'), 'seriens position mot Iberdrola-paketet');
P(!har('data/blogg/') || !body.includes('](/data'), 'inga interna sökvägar i body');

console.log('\n=== KVD RESULTAT: ' + pass + ' PASS | ' + fel + ' FEL | ' + varn + ' VARNINGAR ===');
console.log('ord: ' + ord + ' | readingMinutes: ' + j.readingMinutes + ' | länkar: ' + lankOk + '/' + links.length);
process.exit(fel ? 1 : 0);
