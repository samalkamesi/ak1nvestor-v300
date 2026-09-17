#!/usr/bin/env node
// KVD för sa-laser-du-np3-q3-2026 — aritmetik, ord, länkar, juridikgrind.
import fs from 'node:fs';
const FIL = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-np3-q3-2026.json';
const U = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const j = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const body = j.body;
const uni = JSON.parse(fs.readFileSync(U, 'utf8'));
const L = Array.isArray(uni) ? uni : (uni.bolag || []);
const np3 = L.find(b => b.ticker === 'NP3.ST');
let fel = 0, varning = 0, ok = 0;
const kontroll = (namn, villkor, detalj) => {
  if (villkor) { ok++; console.log('  GRÖN  ' + namn + (detalj ? ' — ' + detalj : '')); }
  else { fel++; console.log('  FEL   ' + namn + (detalj ? ' — ' + detalj : '')); }
};
const nal = (x) => Math.abs(x) < 0.0006; // tolerans: flyttalsresidualer, inte procentavvikelser

console.log('=== 1. Universumtal mot källfilen (påstådda värden i texten) ===');
const P = (s) => { const m = body.match(s); return m ? m[1] : null; };
kontroll('pris 260', np3.pris === 260, 'källfil ' + np3.pris);
kontroll('börsvärde 16,025 mdr', np3.marknadsKapitalMdr === 16.025, 'källfil ' + np3.marknadsKapitalMdr);
kontroll('golv 182,88', np3.golv.vardePerAktie === 182.88, 'källfil ' + np3.golv.vardePerAktie);
kontroll('P/B-fält 1,422', np3.vardering.pb === 1.422);
kontroll('P/E-fält 11,374', np3.vardering.pe === 11.374);
kontroll('ROE 14,53 %', np3.lonksamhet.roe === 0.1453);
kontroll('ROIC 6,55 %', np3.lonksamhet.roic === 0.0655);
kontroll('EBIT-marginal 74,88 %', np3.lonksamhet.ebitMarginal === 0.7488);
kontroll('nettomarginal 64,04 %', np3.lonksamhet.nettoMarginal === 0.6404);
kontroll('skuld/EK 1,4152', np3.stabilitet.skuldEgenkapital === 1.4152);
kontroll('omsCAGR-fält 13,6 %', np3.tillvaxt.omsattningCAGR5ar === 0.136);
kontroll('resCAGR-fält 1,4 %', np3.tillvaxt.resultatCAGR5ar === 0.014);
kontroll('omsTTM +10,1 %', np3.tillvaxt.omsattningTillvaxtTTM === 0.101);
kontroll('prognos −5,7 %', np3.tillvaxt.prognosTillvaxt === -0.057);
kontroll('PEG null i källan', np3.vardering.peg === null);
kontroll('FCF-yield 4,67 %', np3.vardering.fcfYield === 0.0467);
kontroll('serier 2022–2025, 4+4 poster', np3.serier.ar.length === 4 && np3.serier.omsattning.length === 4 && np3.serier.resultat.length === 4);

console.log('=== 2. Egen aritmetik (påståenden i texten) ===');
const [o1, o2, o3, o4] = np3.serier.omsattning, [r1, r2, r3, r4] = np3.serier.resultat;
kontroll('golv-kvot 260 ÷ 182,88 = 1,4217 ≈ P/B-fältet', Math.abs(260 / 182.88 - np3.vardering.pb) < 0.0005, (260 / 182.88).toFixed(4));
kontroll('premie cirka 42 % över bokfört', Math.round((260 - 182.88) / 182.88 * 100) === 42, ((260 - 182.88) / 182.88 * 100).toFixed(1) + ' %');
kontroll('omsCAGR (2274/1551)^(1/3) = 13,60 %', nal(Math.pow(o4 / o1, 1 / 3) - 1 - 0.13603), (Math.pow(o4 / o1, 1 / 3) - 1).toFixed(5));
kontroll('resCAGR (1276/1224)^(1/3) = 1,40 %', nal(Math.pow(r4 / r1, 1 / 3) - 1 - 0.014), (Math.pow(r4 / r1, 1 / 3) - 1).toFixed(5));
kontroll('ändpunkter +4,2 % totalt', nal(r4 / r1 - 1 - 0.0425), ((r4 / r1 - 1) * 100).toFixed(2) + ' %');
kontroll('årliga oms-steg +15,9/+10,9/+14,2', [o2 / o1 - 1, o3 / o2 - 1, o4 / o3 - 1].every((x, i) => nal(x - [0.1586, 0.1085, 0.1416][i])), [o2 / o1 - 1, o3 / o2 - 1, o4 / o3 - 1].map(x => (x * 100).toFixed(1)).join('/'));
kontroll('totalt +46,6 %', nal(o4 / o1 - 1 - 0.4661), ((o4 / o1 - 1) * 100).toFixed(1) + ' %');
kontroll('årsmarginaler 78,9/−3,5/45,9/56,1', [r1 / o1, r2 / o2, r3 / o3, r4 / o4].every((x, i) => nal(x - [0.7892, -0.0345, 0.4588, 0.5611][i])), [r1 / o1, r2 / o2, r3 / o3, r4 / o4].map(x => (x * 100).toFixed(1)).join('/'));
kontroll('identitet 1,422 ÷ 0,1453 = 9,79', nal(np3.vardering.pb / np3.lonksamhet.roe - 9.7866), (np3.vardering.pb / np3.lonksamhet.roe).toFixed(2));
kontroll('avvikelse ≈ 14 %', Math.round((np3.vardering.pe - np3.vardering.pb / np3.lonksamhet.roe) / np3.vardering.pe * 100) === 14, ((np3.vardering.pe - np3.vardering.pb / np3.lonksamhet.roe) / np3.vardering.pe * 100).toFixed(1) + ' %');
kontroll('omvänt 11,374 × 0,1453 = 1,65', nal(np3.vardering.pe * np3.lonksamhet.roe - 1.6526), (np3.vardering.pe * np3.lonksamhet.roe).toFixed(4));
kontroll('implicit EPS 22,86 kr', nal(260 / np3.vardering.pe - 22.8593), (260 / np3.vardering.pe).toFixed(2));
kontroll('tre-vinstvägarnas P/E 12,6/11,4/10,0', Math.abs(16025 / 1276 - 12.5588) < 0.001 && Math.abs(16025 / 1409.4 - 11.374) < 0.01 && Math.abs(16025 / (2274 * 1.101 * 0.6404) - 9.995) < 0.01, (16025 / 1276).toFixed(1) + ' / ' + (16025 / 11.374).toFixed(0) + ' mkr-vinst / ' + (16025 / (2274 * 1.101 * 0.6404)).toFixed(1));
kontroll('PEG-konvention −2,0 = meningslös', nal(np3.vardering.pe / -5.7 + 1.995), (np3.vardering.pe / -5.7).toFixed(2));
kontroll('multiplövning 11,374 ÷ 0,943 = 12,06', Math.abs(np3.vardering.pe / 0.943 - 12.0615) < 0.0005, (np3.vardering.pe / 0.943).toFixed(4));
kontroll('belåning en tredjedel högre än WALL 1,07', Math.round((1.4152 / 1.07 - 1) * 100) === 32, ((1.4152 / 1.07 - 1) * 100).toFixed(0) + ' %');

console.log('=== 3. Scenarioruta (nio celler + två räknesatser) ===');
const bas = (o4 / 1e6) * np3.lonksamhet.ebitMarginal; // mkr
kontroll('bas 2274 × 74,88 % = 1 702,8', Math.abs(bas - 1702.77) < 0.01, bas.toFixed(1));
const rader = [[2205.78, [1629.6, 1651.7, 1673.7]], [2274.0, [1680.0, 1702.8, 1725.5]], [2342.22, [1730.4, 1753.9, 1777.3]]];
const marginaler = [0.7388, 0.7488, 0.7588];
let cellNr = 0;
for (const [oms, celler] of rader) {
  for (let i = 0; i < 3; i++) {
    cellNr++;
    const beraknad = oms * marginaler[i];
    kontroll('cell ' + cellNr + ' (intäkt ' + oms + ', marginal ' + (marginaler[i] * 100).toFixed(2) + ' %)', Math.abs(beraknad - celler[i]) < 0.05, beraknad.toFixed(1) + ' mot ' + celler[i]);
  }
}
kontroll('1 pp marginal = 22,7 mkr', nal((o4 / 1e6) * 0.01 - 22.74), ((o4 / 1e6) * 0.01).toFixed(1));
kontroll('3 % intäkter = 51,1 mkr', nal(bas * 0.03 - 51.083), (bas * 0.03).toFixed(1));
kontroll('intäktsratten 2,2× tyngre', Math.abs(bas * 0.03 / ((o4 / 1e6) * 0.01) - 2.246) < 0.001, (bas * 0.03 / ((o4 / 1e6) * 0.01)).toFixed(2));
kontroll('marginalvikt 0,45 ( Essity-formeln )', nal(1 / (3 * 0.7488) - 0.445), (1 / (3 * 0.7488)).toFixed(3));

console.log('=== 4. Medianer (omräknade ur 132-bolagsfilen) ===');
const med = (a) => { const v = a.filter(x => typeof x === 'number' && isFinite(x)).sort((x, y) => x - y); const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const fast = L.filter(b => b.bransch === 'fastighet');
const g = (arr, f) => med(arr.map(f).filter(x => x !== null && x !== undefined));
kontroll('fastighet n=12', fast.length === 12, fast.length + ' bolag');
kontroll('P/E-median 11,3', nal(g(fast, b => b.vardering?.pe) - 11.2885), g(fast, b => b.vardering?.pe).toFixed(2));
kontroll('P/B-median 0,81', nal(g(fast, b => b.vardering?.pb) - 0.814), g(fast, b => b.vardering?.pb).toFixed(3));
kontroll('ROE-median 8,37 % n=11', nal(g(fast, b => b.lonksamhet?.roe) - 0.0837) && fast.filter(b => typeof b.lonksamhet?.roe === 'number').length === 11, (g(fast, b => b.lonksamhet?.roe) * 100).toFixed(2));
kontroll('EBIT-median 63,9 %', nal(g(fast, b => b.lonksamhet?.ebitMarginal) - 0.63875), (g(fast, b => b.lonksamhet?.ebitMarginal) * 100).toFixed(2));
kontroll('netto-median 46,0 %', nal(g(fast, b => b.lonksamhet?.nettoMarginal) - 0.4598), (g(fast, b => b.lonksamhet?.nettoMarginal) * 100).toFixed(2));
kontroll('universum-P/E 21,2 (n=123)', nal(g(L, b => b.vardering?.pe) - 21.181) && L.filter(b => typeof b.vardering?.pe === 'number').length === 123, g(L, b => b.vardering?.pe).toFixed(2));
kontroll('universum-P/B 2,81 (n=130)', nal(g(L, b => b.vardering?.pb) - 2.8065), g(L, b => b.vardering?.pb).toFixed(3));
kontroll('NP3 P/B 75 % över medianen', Math.round((1.422 / 0.814 - 1) * 100) === 75, ((1.422 / 0.814 - 1) * 100).toFixed(0) + ' %');
kontroll('NP3 ROE +6,2 pp över median', nal(0.1453 - 0.0837 - 0.0616), (0.1453 - 0.0837).toFixed(3));
kontroll('NP3 EBIT +11,0 pp', nal(0.7488 - 0.63875 - 0.11005), (0.7488 - 0.63875).toFixed(3));
kontroll('NP3 netto +18,1 pp', nal(0.6404 - 0.4598 - 0.1806), (0.6404 - 0.4598).toFixed(3));
kontroll('NP3 P/E på medianen (11,4 mot 11,3)', nal(11.374 - 11.2885 - 0.0855), 'diff ' + (11.374 - 11.2885).toFixed(2));
kontroll('endast NP3 + PLD över 1,4 i grenen', fast.filter(b => b.vardering?.pb > 1.4).map(b => b.ticker).join(',') === 'NP3.ST,PLD', fast.filter(b => b.vardering?.pb > 1.4).map(b => b.ticker).join(','));
kontroll('Wihlborgs strax över 1 (1,01)', nal(L.find(b => b.ticker === 'WIHL.ST').vardering.pb - 1.013), L.find(b => b.ticker === 'WIHL.ST').vardering.pb.toFixed(3));

console.log('=== 5. Ord + struktur ===');
const ord = body.replace(/\[[^\]]*\]\([^)]*\)/g, ' ').split(/\s+/).filter(x => /[a-zA-Z0-9]/.test(x)).length;
console.log('  ord i body: ' + ord);
if (ord < 2000 || ord > 3200) { varning++; console.log('  VARNING ord utanför span'); } else ok++;
const H2 = (body.match(/^## /gm) || []).length;
kontroll('H2-sektioner = 7', H2 === 7, H2 + ' st');
kontroll('tre övningar A/B/C finns', body.includes('Övning A') && body.includes('Övning B') && body.includes('Övning C'));
kontroll('disclaimer sista rad med 2007:528', body.trimEnd().endsWith('kundens beslut.*') && body.includes('2007:528'));
kontroll('title nämner NP3 + Q3 + 2026', j.title.includes('NP3') && j.title.includes('Q3-rapport 2026'));
kontroll('slug korrekt', j.slug === 'sa-laser-du-np3-q3-2026');

console.log('=== 6. Interna länkar (curl localhost:3000) ===');
const links = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
for (const path of links) {
  const r = await fetch('http://localhost:3000' + path).then(x => x.status).catch(() => 'ERR');
  kontroll('200 ' + path, r === 200, String(r));
}
console.log('  unika interna länkar: ' + links.length);

console.log('=== 7. Juridikgrind (rådverb — nekningskontext tillåten endast i disclaimern) ===');
const disclaimerStart = body.lastIndexOf('*Detta är pedagogisk');
const introNekning = 'inte en rekommendation att köpa, sälja eller behålla några värdepapper';
const huvud = body.slice(0, disclaimerStart).replace(introNekning, '[INTRO-NEKNING]');
const disclaimer = body.slice(disclaimerStart);
const råd = /\b(köp|sälj|undvik|rekommender|råd|målkurs|target price|strong buy)\b/gi;
const huvudTraff = [...huvud.matchAll(råd)].map(m => m[0]);
const diskTraff = [...disclaimer.matchAll(råd)].map(m => m[0]);
console.log('  träffar i huvudtext: ' + (huvudTraff.length ? JSON.stringify(huvudTraff) : '0'));
console.log('  träffar i disclaimer (nekningskontext, tillåtna): ' + diskTraff.length);
if (huvudTraff.length) { fel++; console.log('  FEL rådträff i huvudtext'); } else { ok++; console.log('  GRÖN  0 rådfraser i huvudtext'); }
const uppmaning = /(du bör|vi rekommenderar|aktie är attraktiv|bra köp|turboljusråd)/i;
kontroll('0 uppmaningsfraser', !uppmaning.test(body));

console.log('\n=== RESULTAT: ' + ok + ' GRÖN, ' + fel + ' FEL, ' + varning + ' VARNING ===');
process.exit(fel ? 1 : 0);
