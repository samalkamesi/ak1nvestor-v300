#!/usr/bin/env node
// Sond: flygaktier-sa-analyserar-du-flygplansindustrin.json — granskningskontroller
// auto-s1-1789804748544 u2 (2026-09-19). Läser ENDAST; skriver INGET.
import fs from 'node:fs';

const draftP = 'data/blogg-utkast/flygaktier-sa-analyserar-du-flygplansindustrin.json';
const draft = JSON.parse(fs.readFileSync(draftP, 'utf8'));
const uni = JSON.parse(fs.readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
const body = draft.body;
const hela = JSON.stringify(draft);
let ok = 0, fel = 0, varn = 0;
const T = (c, n, d) => { if (c) { ok++; console.log('OK   ' + n + (d ? ' — ' + d : '')); } else { fel++; console.log('FEL  ' + n + ' — ' + d); } };
const W = (c, n, d) => { if (c) { ok++; console.log('OK   ' + n); } else { varn++; console.log('VARN ' + n + ' — ' + d); } };
const sv = (x, dec) => x.toFixed(dec).replace('.', ',');

const air = uni.find(r => r.ticker === 'AIR.PA');
const ge = uni.find(r => r.ticker === 'GE');
T(!!air && !!ge, 'universumradAirbus+GE', air && ge ? 'AIR.PA + GE hittade' : 'SAKNAS');

console.log('\n== 1. KÄLTALSPARITET mot bolagsunivers.json (dagens träd) ==');
const par = [
  ['Airbus brutto 16,3', 16.3, air.lonksamhet.bruttoMarginal * 100, 1],
  ['Airbus EBIT 8,7', 8.7, air.lonksamhet.ebitMarginal * 100, 1],
  ['Airbus ROIC 20,5', 20.5, air.lonksamhet.roic * 100, 1],
  ['Airbus P/E 25,9', 25.9, air.vardering.pe, 1],
  ['Airbus EV/EBIT 22,0', 22.0, air.vardering.evEbit, 1],
  ['Airbus P/B 5,9', 5.9, air.vardering.pb, 1],
  ['Airbus PEG 4,0', 4.0, air.vardering.peg, 1],
  ['Airbus prognosTillvaxt 6,5', 6.5, air.tillvaxt.prognosTillvaxt * 100, 1],
  ['Airbus skuld/EK 0,55', 0.55, air.stabilitet.skuldEgenkapital, 2],
  ['Airbus FCF-marginal 6,1', 6.1, air.lonksamhet.fcfMarginal * 100, 1],
  ['GE brutto 31,1', 31.1, ge.lonksamhet.bruttoMarginal * 100, 1],
  ['GE EBIT 20,6', 20.6, ge.lonksamhet.ebitMarginal * 100, 1],
  ['GE ROIC 27,5', 27.5, ge.lonksamhet.roic * 100, 1],
  ['GE P/E 39,0', 39.0, ge.vardering.pe, 1],
  ['GE EV/EBIT 33,8', 33.8, ge.vardering.evEbit, 1],
  ['GE P/B 19,4', 19.4, ge.vardering.pb, 1],
  ['GE PEG 4,2', 4.2, ge.vardering.peg, 1],
  ['GE prognosTillvaxt 14,7', 14.7, ge.tillvaxt.prognosTillvaxt * 100, 1],
];
for (const [namn, textTal, faltTal, dec] of par) {
  const faltStr = sv(faltTal, dec);
  T(body.includes(namn.split(' ').pop()) || true, '_n/a', undefined); // platshållare ej räknad — se nedan
  ok--; // ta bort platshållaren ur räkningen
  T(faltStr === sv(textTal, dec), 'paritet ' + namn, 'fält ' + faltStr + ' == texttal ' + sv(textTal, dec));
}
// Not-fältsbärda tal (kassa/skuld/forward-P/E)
T(body.includes('13,1 mdr euro') && air.notering.includes('kassa 13,1 mdr'), 'kassa 13,1 (not)', 'text+not överens');
T(body.includes('14,3 mdr') && air.notering.includes('skuld 14,3 mdr'), 'skuld 14,3 (not)', 'text+not överens');
T(body.includes('forward 24,4') && air.notering.includes('forward-P/E (25,94/24,35'), 'fwd P/E 24,4 (not 24,35)', 'avrundning korrekt');

console.log('\n== 2. SERIER ==');
const oms = air.serier.omsattning, res = air.serier.resultat, fcf = air.serier.fcf, ar = air.serier.ar;
T(JSON.stringify(oms) === JSON.stringify([58763000000, 65446000000, 69230000000, 73420000000]) && ar.join() === '2022,2023,2024,2025', 'omsättningsserie 2022–2025', oms.map(v => v / 1e9).join(' / ') + ' mdr');
T(JSON.stringify(res) === JSON.stringify([4247000000, 3789000000, 4232000000, 5221000000]), 'resultatserie', res.join(' / '));
T(JSON.stringify(fcf) === JSON.stringify([3824000000, 3204000000, 3733000000, 4031000000]), 'FCF-serie', fcf.join(' / '));
T(fcf.every(v => v > 0), 'FCF positivt samtliga fyra år', 'påstående i texten');
T(body.includes('3 824 → 3 204 → 3 733 → 4 031 M€'), 'FCF-serien citerad exakt i text');

console.log('\n== 3. ARITMETIK (egna omräkningar) ==');
const pct = (a, b) => (b / a - 1) * 100;
T(sv(pct(oms[0], oms[1]), 1) === '11,4', '2023 oms-tillväxt +11,4', sv(pct(oms[0], oms[1]), 2) + ' %');
T(sv(pct(oms[2], oms[3]), 1) === '6,1', '2025 oms-tillväxt +6,1', sv(pct(oms[2], oms[3]), 2) + ' %');
T(sv(pct(res[0], res[1]), 1) === '-10,8', '2023 res-fall −10,8', sv(pct(res[0], res[1]), 2) + ' %');
T(sv(pct(res[2], res[3]), 1) === '23,4', '2025 res-steg +23,4', sv(pct(res[2], res[3]), 2) + ' %');
T(Math.round(8000 / 800) === 10, 'räkneexempel 8 000 ÷ 800 = 10 år');
T(ge.lonksamhet.bruttoMarginal / air.lonksamhet.bruttoMarginal < 2 && ge.lonksamhet.bruttoMarginal / air.lonksamhet.bruttoMarginal > 1.85, '"nästan dubbelt" brutto 31,1/16,3', (ge.lonksamhet.bruttoMarginal / air.lonksamhet.bruttoMarginal).toFixed(3) + '×');
// PEG-spårkonventionen
T(sv(air.vardering.pe / (air.tillvaxt.prognosTillvaxt * 100), 2) === sv(air.vardering.peg, 2), 'Airbus PEG = spårkonventionen P/E÷prognos (1 år)', (air.vardering.pe / (air.tillvaxt.prognosTillvaxt * 100)).toFixed(3));
const gePegEttAr = ge.vardering.pe / (ge.tillvaxt.prognosTillvaxt * 100);
T(Math.abs(gePegEttAr - ge.vardering.peg) > 1, 'GE PEG 4,23 är INTE pe÷ettårslongen', 'pe÷14,7 = ' + gePegEttAr.toFixed(2) + ' ≠ 4,23 ⇒ "på ettårsprognoser" gäller ej GE (FYND B3)');
T(air.vardering.peg < 4, 'Airbus PEG 3,97 < 4 ⇒ "båda PEG-talen över 4" falskt (FYND B4)', '3,97 är under, 4,23 över');

console.log('\n== 4. UNIVERSUMPÅSTÅENDEN (dagens träd vs text) ==');
const flygrelaterade = uni.filter(r => /airbus|boeing|embraer|ge aerospace|\bsaab\b|safran|mtu|rolls.?royce|leonardo|honeywell|heico|dassault|spirit aerosystems/i.test(r.namn));
for (const r of flygrelaterade) console.log('   flygträff: ' + r.namn + ' — bransch ' + r.bransch);
const flygIndustri = flygrelaterade.filter(r => r.bransch === 'industri');
T(body.includes('bär sektorn två bolag') && flygIndustri.length !== 2, '"universum bär sektorn två bolag" MOTBEVISAT (FYND B1)', flygIndustri.length + ' flygplansindustri-bolag klassade industri idag: ' + flygIndustri.map(r => r.namn).join(', '));
const ind = uni.filter(r => r.bransch === 'industri');
const peList = ind.filter(r => r.vardering?.pe != null).map(r => r.vardering.pe).sort((a, b) => a - b);
const ebList = ind.filter(r => r.vardering?.evEbit != null).map(r => r.vardering.evEbit).sort((a, b) => a - b);
const median = a => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
T(body.includes('P/E 26,9 och EV/EBIT 21,8 på samma data (14 bolag)') && (median(peList) !== 26.9 || peList.length !== 14), 'median-citat föråldrat (FYND B2)', 'dagens: P/E ' + sv(median(peList), 1) + ' (n=' + peList.length + '), EV/EBIT ' + sv(median(ebList), 1) + ' (n=' + ebList.length + ') — byggtidens vintagen 3d9a5e89 gav 26,85/21,794 n=14');
T(air.branche === undefined || air.branch === undefined, '_skip', ''); ok--; // fält heter bransch
T(air.bransch === 'industri' && ge.bransch === 'industri', 'båda halvorna klassade industri (textens påstående)', 'stämmer');

console.log('\n== 5. JURIDIK 2007:528 ==');
const ytor = { title: draft.title, description: draft.description, body };
let juridikFel = 0, juridikVarn = 0;
for (const [ytNamn, text] of Object.entries(ytor)) {
  for (const p of vm.forbjudnaFraser) {
    const re = new RegExp(p.fran, 'giu');
    const m = text.match(re);
    if (m) {
      if (p.allvar === 'FEL') { juridikFel++; console.log('FEL  varumärke [' + ytNamn + '] ' + p.fran + ' → ' + m.join(',')); }
      else { juridikVarn++; console.log('VARN varumärke [' + ytNamn + '] ' + p.fran + ' → ' + m.join(',')); }
    }
  }
}
T(juridikFel === 0, 'varumärkesgrinden 26 mönster × 3 ytor = ' + (juridikFel + juridikVarn) + ' träffar', juridikFel + ' FEL / ' + juridikVarn + ' VARNING');
const radglossor = [...body.matchAll(/\b(köp|köpa|köper|sälj|sälja|säljer|rekommendera|rekommenderar|rekommendation|bör du)\b/gi)];
T(radglossor.length === 0, 'rådglossor med ordgräns i body', radglossor.map(m => '"' + m[0] + '"').join(' ') || '0 träffar');
T(/_Detta är pedagogisk finansanalys, inte investeringsråd\._$/.test(body.trim()), 'disclaimer exakt sista rad', body.trim().slice(-52));
T(body.includes('utbildning i metod, aldrig råd om enskilda aktier'), 'utbildningsram i ingress');
T(!/\b(2007:528|2022:260|2022:261|1985:716|2005:59|2022:482)\b/.test(body), 'inga lagrum i texten = ingen blandningsrisk');

console.log('\n== 6. 911-KONTROLL ==');
const p911 = ['911', '11 september', 'september 2001', '9/11', 'terror', 'terrordåd'];
const t911 = p911.filter(p => hela.toLowerCase().includes(p.toLowerCase()));
T(t911.length === 0, '911-mönster 0/6', t911.length ? 'träffar: ' + t911.join(', ') : '0 träffar i hel filen');

console.log('\n== 7. LÄNKAR ==');
const lankar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const unika = [...new Set(lankar)];
T(unika.every(l => l.startsWith('/kurser/') || l.startsWith('/blogg/')), 'samtliga interna sökvägar kurser/blogg', '0 externa/utkastlänkar');
const BASE = 'http://localhost:3000';
let lankOK = 0; const lankFel = [];
for (const l of unika) {
  try { const r = await fetch(BASE + l, { redirect: 'follow' }); if (r.status === 200) lankOK++; else lankFel.push(l + ' → ' + r.status); }
  catch (e) { lankFel.push(l + ' → ' + e.code); }
}
T(lankFel.length === 0, 'interna länkar HTTP 200 mot localhost:3000', lankOK + '/' + unika.length + ' gröna' + (lankFel.length ? ' — FEL: ' + lankFel.join(', ') : ''));
T(unika.includes('/kurser/se-10-flyg'), 'kursankaret se-10-flyg finns med', 'seriens ankarkonvention');

console.log('\n== 8. STRUKTUR ==');
T(draft.title.length <= 60, 'title ≤ 60 tkn', draft.title.length + '/60');
T(draft.description.length <= 155, 'description ≤ 155 tkn', draft.description.length + '/155');
const h2 = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
T(h2.length === 8, 'H2-antal', String(h2.length) + ' st: ' + h2.slice(0, 3).join(' / ') + ' / …');
T(!hela.includes('­'), '0 mjuka bindestreck (U+00AD)');
const rensat = body
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/[#*_>`]/g, ' ')
  .replace(/\s+/g, ' ').trim();
const ord = rensat.split(' ').length;
const rm = Math.round(ord / 200);
W(draft.readingMinutes === rm, 'readingMinutes', 'textrensat ' + ord + ' ord ⇒ round(ord/200) = ' + rm + '; utkastet säger ' + draft.readingMinutes + ' (FYND B5)');
console.log('   rå ord (med markdown): ' + body.split(/\s+/).length);

console.log('\n== 9. DIFF-STRÄNGAR (unikhet för verkställighet) ==');
const byt = [
  ['B1', 'I AK1A:s universum bär sektorn två bolag som tillsammans täcker samma leveranskedjas båda halvor: Airbus bygger planhalvan och GE Aerospace motorhalvan.'],
  ['B2', 'P/E 26,9 och EV/EBIT 21,8 på samma data (14 bolag)'],
  ['B3', '(4,0 respektive 4,2 på ettårsprognoser)'],
  ['B4', 'men båda PEG-talen över 4'],
  ['B6', 'Universumets multipelar för de två halvorna'],
];
for (const [id, fran] of byt) {
  const n = body.split(fran).length - 1;
  T(n === 1, 'diff ' + id + ' söksträng unik', n + ' träff(ar) i body');
}
const c2 = 'får arbetafinansiera produktionen';
T(body.split(c2).length - 1 === 1, 'förslag C2-sträng unik ("arbetfinansiera")', (body.split(c2).length - 1) + ' träff');
const c3 = 'bara skimrar';
T(body.split(c3).length - 1 === 1, 'förslag C3-sträng unik ("skimrar")', (body.split(c3).length - 1) + ' träff');

console.log('\n===========================================');
console.log('SAMMANFATTNING: ' + ok + ' OK / ' + fel + ' FEL / ' + varn + ' VARNING');
console.log('FEL-rader = utkastfynd (B-klass) eller sondfel — se rapport för dom.');
