// _s4u1-eli-lilly-kvd.mjs — kvalitetsverifikation av sa-laser-du-eli-lilly-q3-2026.json
// Kör: node verktyg/_s4u1-eli-lilly-kvd.mjs   (kräver localhost:3000 för länkkontroll)
import { readFileSync } from 'node:fs';

const FIL = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-eli-lilly-q3-2026.json';
const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const poster = Array.isArray(U) ? U : (U.poster || U.bolag || U.universum || []);
const L = poster.find(p => p.ticker === 'LLY');
const P = JSON.parse(readFileSync(FIL, 'utf8'));
const body = P.body;

let pass = 0, fel = 0, varning = 0;
const ok = (villkor, namn, detalj = '') => {
  if (villkor) { pass++; console.log('  PASS ' + namn + (detalj ? ' — ' + detalj : '')); }
  else { fel++; console.log('  FEL  ' + namn + (detalj ? ' — ' + detalj : '')); }
};
const warn = (villkor, namn, detalj = '') => {
  if (villkor) pass++; else { varning++; console.log('  VARN ' + namn + (detalj ? ' — ' + detalj : '')); }
};
const nära = (a, b, tol, namn) => ok(Math.abs(a - b) <= tol, namn, `${a} mot ${b} (tol ${tol})`);

console.log('== 1. STRUKTUR ==');
ok(P.slug === 'sa-laser-du-eli-lilly-q3-2026', 'slug matchar filnamn');
ok(typeof P.title === 'string' && P.title.length > 50 && P.title.length < 400, 'title-längd', `${P.title.length} tkn`);
ok(typeof P.description === 'string' && P.description.length > 150 && P.description.length < 900, 'description-längd', `${P.description.length} tkn`);
ok(P.pillar === 'Institutionell metodik', 'pillar');
ok(P.author === 'AK1A Research Lab', 'author');
ok(P.publishedAt === '2026-10-29', 'publishedAt = rappdagen', P.publishedAt);
ok(Array.isArray(P.tags) && P.tags.length >= 4 && P.tags.includes('kvartalsrapport') && P.tags.includes('Eli Lilly'), 'tags', P.tags.join(', '));
const ord = body.trim().split(/\s+/).filter(Boolean).length;
ok(P.readingMinutes === Math.round(ord / 600), 'readingMinutes = round(ord/600)', `${ord} ord → ${Math.round(ord / 600)} (filen ${P.readingMinutes})`);
ok(body.includes('## Urvalet') && body.includes('## Nyckeltalen') && body.includes('## Datavakten') && body.includes('## Så står sig bolaget') && body.includes('## Tre sätt') && body.includes('## Praktiskt') && body.includes('## Källor'), 'sektionsrubriper enligt serieformat');

console.log('== 2. KÄLLTALSPARITET mot universumpost LLY 2026-09-03 ==');
const par = [
  ['1 160,08', L.pris === 1160.08], ['1 034,491', L.marknadsKapitalMdr === 1034.491],
  ['31,69 % CAGR', L.tillvaxt.omsattningCAGR5ar === 0.3169], ['48,96 % CAGR', L.tillvaxt.resultatCAGR5ar === 0.4896],
  ['47,7 TTM', L.tillvaxt.omsattningTillvaxtTTM === 0.477], ['28,72 prognos', L.tillvaxt.prognosTillvaxt === 0.2872],
  ['102,29 ROE', L.lonksamhet.roe === 1.0229], ['48,65 ROIC', L.lonksamhet.roic === 0.4865],
  ['83,40 brutto', L.lonksamhet.bruttoMarginal === 0.834], ['54,22 EBIT', L.lonksamhet.ebitMarginal === 0.5422],
  ['33,53 netto', L.lonksamhet.nettoMarginal === 0.3353], ['13,89 FCFm', L.lonksamhet.fcfMarginal === 0.1389],
  ['1,6207 skuld', L.stabilitet.skuldEgenkapital === 1.6207], ['38,916 PE', L.vardering.pe === 38.916],
  ['30,527 PB', L.vardering.pb === 30.527], ['25,002 EVEBIT', L.vardering.evEbit === 25.002],
  ['1,12 PEG', L.vardering.peg === 1.12], ['1,07 FCFy', L.vardering.fcfYield === 0.0107],
  ['25 insider', L.aterkop.insiderkopSenaste6man === 25],
  ['serie om 28 541', L.serier.omsattning[0] === 28541400000], ['serie om 65 179', L.serier.omsattning[3] === 65179000000],
  ['serie res 6 245', L.serier.resultat[0] === 6244800000], ['serie res 20 640', L.serier.resultat[3] === 20640000000],
];
for (const [namn, villkor] of par) ok(villkor, 'universumfält stämmer: ' + namn);
// varje tal ska faktiskt förekomma i texten:
for (const t of ['1 160,08', '1 034,491', '31,69', '48,96', '47,7', '28,72', '102,29', '48,65', '83,40', '54,22', '33,53', '13,89', '1,6207', '38,916', '30,527', '25,002', '1,12', '1,07', '28 541', '65 179', '20 640', '6 245'])
  ok(body.includes(t), 'talet förekommer i body: ' + t);

console.log('== 3. ARITMETIK — oberoende omräkning ==');
const om = [28541, 34124.1, 45042.7, 65179], res = [6244.8, 5240.4, 10590, 20640];
const mcap = 1034.491, PE = 38.916, PB = 30.527, ROE = 1.0229, NETTOm = 0.3353, EBITm = 0.5422, EVEBIT = 25.002, skuldEK = 1.6207, FCFY = 0.0107, FCFF = 0.1389, prognos = 0.2872;
nära(((om[3] / om[0]) ** (1 / 3) - 1) * 100, 31.69, 0.005, 'CAGR intäkter 31,69');
nära(((res[3] / res[0]) ** (1 / 3) - 1) * 100, 48.96, 0.005, 'CAGR resultat 48,96');
nära((om[1] / om[0] - 1) * 100, 19.6, 0.05, 'steg 2023 +19,6');
nära((om[2] / om[1] - 1) * 100, 32.0, 0.05, 'steg 2024 +32,0');
nära((om[3] / om[2] - 1) * 100, 44.7, 0.05, 'steg 2025 +44,7');
for (let i = 0; i < 4; i++) nära(res[i] / om[i] * 100, [21.88, 15.36, 23.51, 31.67][i], 0.005, 'nettomarginal ' + ['2022', '2023', '2024', '2025'][i]);
const ek = mcap / PB, skuld = skuldEK * ek, ev = mcap + skuld;
nära(ek, 33.89, 0.005, 'EK 33,89 mdr');
nära(skuld, 54.92, 0.005, 'skuld 54,92 mdr');
nära(ev, 1089.4, 0.1, 'EV 1 089,4 mdr');
const ttmRev = 17600 + 19300 + 19800 + 22970;
ok(ttmRev === 79670, 'TTM-serien 79,67 mdr', String(ttmRev));
const ttmEBIT = EBITm * ttmRev;
nära(EVEBIT * ttmEBIT / 1000, 1080.0, 0.5, 'EV-fältväg 1 080,0');
nära((EVEBIT * ttmEBIT / 1000 / ev - 1) * 100, -0.86, 0.02, 'EV-kedjebrott −0,86 %');
nära(FCFY * mcap, 11.07, 0.005, 'FCF-yield-väg 11,07');
nära(FCFF * ttmRev / 1000, 11.07, 0.005, 'FCF-marginal-väg 11,07');
const vinstPE = mcap / PE, vinstROE = ROE * ek;
nära(vinstPE, 26.58, 0.005, 'P/E-nämnare 26,58');
nära(vinstROE, 34.66, 0.005, 'ROE-vinst 34,66');
nära(vinstROE / vinstPE, 1.304, 0.001, 'glidningsfaktor 1,304');
nära((PB / ROE), 29.844, 0.001, 'P/B÷ROE 29,844');
nära(((PB / ROE) / PE - 1) * 100, -23.31, 0.02, 'identitetsbrott −23,31 %');
nära(PE * ROE, 39.8, 0.05, 'P/E×ROE 39,8');
nära(PE * 20.640, 803.2, 0.1, 'absolutkontroll 803,2');
nära((PE * 20.64 / mcap - 1) * 100, -22.36, 0.01, 'absolutresidual −22,4 %');
nära(ttmRev * NETTOm / 1000, 26.71, 0.005, 'TTM×netto 26,71');
nära(mcap / 20.640, 50.1, 0.05, 'P/E fönster1 50,1');
nära(mcap / 26.583, 38.9, 0.05, 'P/E fönster2 38,9');
nära(mcap / 34.664, 29.8, 0.05, 'P/E fönster3 29,8');
nära(PE / (prognos * 100), 1.355, 0.001, 'PEG-konvention 1,355');
nära(PE / 1.12, 34.75, 0.05, 'PEG implicit 34,75');
nära(NETTOm * (ttmRev / 1000 / ek) * 100, 78.8, 0.05, 'DuPont TTM 78,8');
nära(NETTOm * (om[3] / 1000 / ek) * 100, 64.5, 0.05, 'DuPont FY25 64,5');
nära(1 / (3 * NETTOm), 0.99, 0.005, 'marginalvikt 0,99');
nära(ttmRev * 0.01 / 1000, 0.80, 0.005, '1 pp marginal 0,80 mdr');
nära(ttmRev * 0.03 / 1000, 2.39, 0.005, '3 % volym 2,39 mdr');
nära(mcap / 25.88, 40.0, 0.05, 'multiplmöte 40,0 mdr');
nära(85 * 0.3167, 26.9, 0.05, 'vägledning låg 26,9');
nära(87 * 0.3167, 27.6, 0.05, 'vägledning hög 27,6');
const cell = [[25.37, 26.15, 26.93], [26.02, 26.82, 27.62], [26.67, 27.49, 28.31]];
const marginaler = [0.3253, 0.3353, 0.3453], intakter = [78, 80, 82];
let sci = 0;
for (const iv of intakter) for (const mv of marginaler) { nära(iv * mv, cell.flat()[sci], 0.005, `scenariecell ${Math.floor(sci / 3) + 1}${sci % 3 + 1} (${iv}x${mv})`); sci++; }
ok(body.includes('25,37') && body.includes('26,15') && body.includes('26,93') && body.includes('26,02') && body.includes('26,82') && body.includes('27,62') && body.includes('26,67') && body.includes('27,49') && body.includes('28,31'), 'alla 9 scenarieceller i text');

console.log('== 4. MEDIANER OCH RANG ur 201-postfilen ==');
const halso = poster.filter(p => p.bransch === 'halso');
ok(poster.length === 201, 'universumfilen 201 poster', String(poster.length));
ok(halso.length === 23, 'hälsogrenen 23 bolag', String(halso.length));
const med = a => { const v = a.filter(x => x != null && Number.isFinite(x)).sort((x, y) => x - y); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const M = {
  pe: med(halso.map(p => p.vardering?.pe)), pb: med(halso.map(p => p.vardering?.pb)), evebit: med(halso.map(p => p.vardering?.evEbit)),
  peg: med(halso.map(p => p.vardering?.peg)), roe: med(halso.map(p => p.lonksamhet?.roe)), roic: med(halso.map(p => p.lonksamhet?.roic)),
  brutto: med(halso.map(p => p.lonksamhet?.bruttoMarginal)), ebit: med(halso.map(p => p.lonksamhet?.ebitMarginal)),
  netto: med(halso.map(p => p.lonksamhet?.nettoMarginal)), fcfy: med(halso.map(p => p.vardering?.fcfYield)),
  ttm: med(halso.map(p => p.tillvaxt?.omsattningTillvaxtTTM)), cagr: med(halso.map(p => p.tillvaxt?.omsattningCAGR5ar)),
  prog: med(halso.map(p => p.tillvaxt?.prognosTillvaxt)), skuld: med(halso.map(p => p.stabilitet?.skuldEgenkapital)),
  uPe: med(poster.map(p => p.vardering?.pe)), uPb: med(poster.map(p => p.vardering?.pb)), uEvebit: med(poster.map(p => p.vardering?.evEbit)),
  uPeg: med(poster.map(p => p.vardering?.peg)), uRoe: med(poster.map(p => p.lonksamhet?.roe)), uRoic: med(poster.map(p => p.lonksamhet?.roic)),
  uBrutto: med(poster.map(p => p.lonksamhet?.bruttoMarginal)), uEbit: med(poster.map(p => p.lonksamhet?.ebitMarginal)),
  uNetto: med(poster.map(p => p.lonksamhet?.nettoMarginal)), uFcfy: med(poster.map(p => p.vardering?.fcfYield)),
  uTtm: med(poster.map(p => p.tillvaxt?.omsattningTillvaxtTTM)), uCagr: med(poster.map(p => p.tillvaxt?.omsattningCAGR5ar)),
  uProg: med(poster.map(p => p.tillvaxt?.prognosTillvaxt)), uSkuld: med(poster.map(p => p.stabilitet?.skuldEgenkapital)),
};
nära(M.pe, 25.88, 0.005, 'grenmedian P/E 25,88'); nära(M.pb, 3.988, 0.005, 'grenmedian P/B 3,988');
nära(M.evebit, 17.543, 0.005, 'grenmedian EV/EBIT 17,543'); nära(M.peg, 0.785, 0.005, 'grenmedian PEG 0,785');
nära(M.roe * 100, 16.23, 0.005, 'grenmedian ROE 16,23'); nära(M.roic * 100, 16.63, 0.005, 'grenmedian ROIC 16,63');
nära(M.brutto * 100, 72.79, 0.005, 'grenmedian brutto 72,79'); nära(M.ebit * 100, 24.99, 0.005, 'grenmedian EBIT 24,99');
nära(M.netto * 100, 14.00, 0.005, 'grenmedian netto 14,00'); nära(M.fcfy * 100, 4.34, 0.005, 'grenmedian FCFy 4,34');
nära(M.ttm * 100, 4.68, 0.005, 'grenmedian TTM 4,68'); nära(M.cagr * 100, 7.27, 0.005, 'grenmedian CAGR 7,27');
nära(M.prog * 100, 25.14, 0.005, 'grenmedian prognos 25,14'); nära(M.skuld, 0.6461, 0.0005, 'grenmedian skuld 0,6461');
nära(M.uPe, 20.80, 0.005, 'universummedian P/E 20,80'); nära(M.uPb, 2.8065, 0.0005, 'universummedian P/B 2,8065');
nära(M.uEvebit, 18.085, 0.005, 'universummedian EV/EBIT 18,085'); nära(M.uPeg, 1.375, 0.005, 'universummedian PEG 1,375');
nära(M.uRoe * 100, 15.34, 0.005, 'universummedian ROE 15,34'); nära(M.uRoic * 100, 13.62, 0.005, 'universummedian ROIC 13,62');
nära(M.uBrutto * 100, 47.76, 0.005, 'universummedian brutto 47,76'); nära(M.uEbit * 100, 20.71, 0.005, 'universummedian EBIT 20,71');
nära(M.uNetto * 100, 14.00, 0.005, 'universummedian netto 14,00'); nära(M.uFcfy * 100, 3.94, 0.005, 'universummedian FCFy 3,94');
nära(M.uTtm * 100, 6.80, 0.005, 'universummedian TTM 6,80'); nära(M.uCagr * 100, 4.38, 0.005, 'universummedian CAGR 4,38');
nära(M.uProg * 100, 13.37, 0.005, 'universummedian prognos 13,37'); nära(M.uSkuld, 0.51, 0.005, 'universummedian skuld 0,51');
// rang: LLY ROE högst i grenen, netto 2:a, P/B 2:a, TTM/CAGR/ROIC/EBIT högst, P/E 4:a
const rg = (f, dir = 'desc') => { const v = halso.map(p => f(p)).filter(x => x != null && Number.isFinite(x)).sort((a, b) => dir === 'desc' ? b - a : a - b); return v.indexOf(f(L)) + 1; };
ok(rg(p => p.lonksamhet?.roe) === 1, 'rang ROE 1/22'); ok(rg(p => p.lonksamhet?.roic) === 1, 'rang ROIC 1');
ok(rg(p => p.lonksamhet?.ebitMarginal) === 1, 'rang EBIT-marg 1'); ok(rg(p => p.tillvaxt?.omsattningTillvaxtTTM) === 1, 'rang TTM 1');
ok(rg(p => p.tillvaxt?.omsattningCAGR5ar) === 1, 'rang CAGR 1'); ok(rg(p => p.vardering?.pb) === 2, 'rang P/B 2');
ok(rg(p => p.vardering?.pe) === 4, 'rang P/E 4'); ok(rg(p => p.vardering?.evEbit) === 2, 'rang EV/EBIT 2');
ok(rg(p => p.lonksamhet?.bruttoMarginal) === 2, 'rang brutto 2'); ok(rg(p => p.lonksamhet?.nettoMarginal) === 2, 'rang netto 2');
ok(rg(p => p.vardering?.fcfYield, 'asc') === 2, 'rang FCF-yield näst lägst (2 asc)');

console.log('== 5. JURIDIKGRIND ==');
const lagrum = (body.match(/2007:528/g) || []).length;
ok(lagrum === 1, 'exakt ett lagrum 2007:528', String(lagrum));
ok(body.includes('2 kap 5 §'), 'lagen 2 kap 5 § nämns');
ok(/inte investeringsrådgivning|inte en rekommendation att köpa/.test(body), 'utbildningsdisclaimer');
ok(/publiceringen av detta paket är kundens beslut/.test(body), 'R2-disclaimer');
const rådslingor = ['köp denna', 'sälj denna', 'rekommenderar köp', 'rekommenderar sälj', 'bör du köpa', 'bör du sälja', 'vi rekommenderar'];
ok(!rådslingor.some(r => body.toLowerCase().includes(r)), '0 rådverb i rådgivande kontext');
ok((body.match(/rekommendera|rekommendation/g) || []).length <= 3, 'rekommendationsord endast i nekande kontext', String((body.match(/rekommendera|rekommendation/g) || []).length));
const annanLag = ['2022:260', '2022:261', '1985:716', '2005:59', '2022:482', '4 kap', '5 kap'];
ok(!annanLag.some(x => body.includes(x)), '0 främmande lagrum');

console.log('== 6. SPRÅKGRIND ==');
ok(!/ {2}/.test(body), '0 dubbla mellanslag');
ok(!body.includes('\t'), '0 tabbar');
ok(!/[\u201c\u201d\u2018\u2019]/.test(body), '0 typografiska citat');
ok(!/[\u4e00-\u9fff\u0400-\u04ff]/.test(body), '0 CJK/kyrilliska');
ok(!/\r/.test(body), '0 CR');
ok(!body.includes('Possible') && !body.includes('Same ') && !body.includes('Detaljvakten') && !body.includes('FCG-') && !body.includes('redovisna') && !body.includes('läster') && !body.includes('miljoner av Q2'), '0 kända skrivfelsklasser');

console.log('== 7. LÄNKAR ==');
const interna = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const unika = [...new Set(interna)];
ok(unika.length >= 18, 'minst 18 unika interna länkar', String(unika.length));
let lbad = [];
for (const u of unika) { try { const r = await fetch('http://localhost:3000' + u); if (r.status !== 200) lbad.push(u + ':' + r.status); } catch (e) { lbad.push(u + ':ERR'); } }
ok(lbad.length === 0, 'alla interna länkar HTTP 200', lbad.join(', ') || unika.length + ' st OK');
const externa = [...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
ok(externa.length >= 1 && externa.every(u => u.includes('lilly')), 'externa länkar endast bolagets egna domäner', externa.join(', '));
ok(!body.includes('](/data/') && !body.includes('](../'), '0 länkar till interna filsökvägar');

console.log('== 8. KVARTALSTAL sökverifierade 2026-09-19 ==');
for (const t of ['22,97', '19,8 miljarder (+56', '17,60', '19,3 mdr (+43', '9,94', '4,93', '6,52', '3,59', '7,94', '8,55', '6,21', '7,39', '86,3', '82,6', '85–87', '82–85', '63,0–63,5', '2026-08-05', '2026-04-30', '2025-10-30', '2026-02-04', '10:00 östkusttid'])
  ok(body.includes(t), 'sökverifierat tal/datum i text: ' + t);
ok(body.includes('29 oktober 2026'), 'rappdagen i text');

console.log(`\n=== KVD SLUT: ${pass} PASS · ${fel} FEL · ${varning} VARNINGAR ===`);
process.exit(fel === 0 && varning === 0 ? 0 : 1);
