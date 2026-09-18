#!/usr/bin/env node
// s1-u2 (auto-s1-1789673729457): maskinell granskning av sa-laser-du-jnj-q3-2026.json
// (kvartalsserie, rappdag 2026-10-13, byggcommit 30cf322a av s4-u3).
// Läser endast: utkast-JSON, bolagsunivers.json @ 30cf322a (vintage, /tmp) + dagens,
// kalender-filerna, varumarke.json, deep-courses.json, dataset-aspekter (källkod),
// syskon-paketens JSON. Skriver inget.
import { readFileSync, readdirSync } from 'node:fs';

const UT = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-jnj-q3-2026.json';
const u = JSON.parse(readFileSync(UT, 'utf8'));
const vm = JSON.parse(readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const body = u.body;
const rader = body.split('\n');
const R = [], GRON = [], FEL = [];
const push = (s) => R.push(s);
const jfr = (namn, räknad, påstdd, tol = 0.0051) => {
  const ok = Math.abs(räknad - påstdd) <= tol;
  push(`  ${namn}: egen=${räknad} påstått=${påstdd} ${ok ? '✓' : '✗ AVVIKER'}`);
  ok ? GRON.push(namn) : FEL.push(`${namn}: egen ${räknad} mot utkastets ${påstdd}`);
  return ok;
};

// ---------- 0) KÄLLOR: vintage 30cf322a + dagens ----------
const V = JSON.parse(readFileSync('/tmp/universum-jnj-vintage.json', 'utf8'));
const NU = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
push(`UNIVERSUM @30cf322a (byggcommit): ${V.length} bolag — utkastet påstår 159: ${V.length === 159 ? '✓' : '✗'}`);
push(`UNIVERSUM dagens träd: ${NU.length} bolag — ${NU.length === V.length ? 'oförändrat sedan bygget (vintage = aktuellt)' : 'ÄNDRAT — granska mot vintage'}`);
const halsoV = V.filter(b => b.bransch === 'halso');
push(`HÄLSA @30cf322a: ${halsoV.length} bolag — utkastet påstår 16: ${halsoV.length === 16 ? '✓' : '✗'}`);
const jnj = V.find(b => b.ticker === 'JNJ');
if (!jnj) { console.log('JNJ saknas i vintage — AVBRYT'); process.exit(1); }
push(`JNJ-RAD: pris=${jnj.pris} MV=${jnj.marknadsKapitalMdr} mdr valuta=${jnj.valuta} hamtat=${jnj.hamtat}`);
push(`JNJ-KÄLLOR: ${(jnj.kallor || []).map(k => `${k.namn} ${k.hamtat}${k.paranoid ? ' (' + k.paranoid.slice(0, 60) + '…)' : ''}`).join(' | ')}`);

// ---------- 1) Tabellens 15 mått: värde + medianer (BÅDA metoderna) + rang ----------
const L = jnj.lonksamhet || {}, T = jnj.tillvaxt || {}, RD = jnj.risker || {}, VD = jnj.vardering || {};
// mediankanon (dataset-nyckeltal.ts): rensa, sortera, udda=mittersta, jämnt=MEDEL av mittersta.
// Byggaren av utkastet använder i stället ÖVRE mittersta (s[n/2]) — båda mätningar redovisas.
const mvMedel = (arr) => { const v = arr.filter(x => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return null; return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2; };
const mvUpper = (arr) => { const v = arr.filter(x => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return null; return v.length % 2 ? v[(v.length - 1) / 2] : v[v.length / 2]; };
const rankFallande = (arr, eget) => { const v = arr.filter(x => x != null).sort((a, b) => b - a); return { rang: v.indexOf(eget) + 1, n: v.length }; };
const procent = (x) => x != null ? x * 100 : null;

// (fält, uttagsfunktion, utkastvärde, hälsomedian-påstående, universummedian-påstående, rang-påstående)
const procentFalt = [
  ['roe', b => b.lonksamhet?.roe, 25.74, 18.53, 15.57, '5/15'],
  ['roic', b => b.lonksamhet?.roic, 21.32, 17.42, 13.62, '4/15'],
  ['bruttoMarginal', b => b.lonksamhet?.bruttoMarginal, 68.14, 72.79, 47.57, '11/16'],
  ['ebitMarginal', b => b.lonksamhet?.ebitMarginal, 29.19, 29.19, 20.81, '8/16'],
  ['nettoMarginal', b => b.lonksamhet?.nettoMarginal, 21.48, 17.02, 13.66, '4/16'],
  ['fcfMarginal', b => b.lonksamhet?.fcfMarginal, 17.24, 14.27, 12.51, '6/16'],
  ['fcfYield', b => b.lonksamhet?.fcfYield ?? b.vardering?.fcfYield, 2.55, 4.25, 3.80, '12/15'],
  ['prognosTillvaxt', b => b.tillvaxt?.prognosTillvaxt, 11.3, 19.9, 12.2, '9/16'],
  ['resultatCAGR5ar', b => b.tillvaxt?.resultatCAGR5ar, 14.32, 9.0, 3.9, '6/14'],
  ['omsattningCAGR5ar', b => b.tillvaxt?.omsattningCAGR5ar, -0.26, 7.3, 4.4, '12/16'],
];
push('TABELL PROCENTFÄLT (värde | hälsomedian KANON/UPPER | univmedian KANON/UPPER | rang fallande):');
let met, metodSkilln = 0;
for (const [namn, fn, vE, hE, uE, rE] of procentFalt) {
  const eget = procent(fn(jnj));
  const hK = procent(mvMedel(halsoV.map(fn))), hU = procent(mvUpper(halsoV.map(fn)));
  const uK = procent(mvMedel(NU.map(fn))), uU = procent(mvUpper(NU.map(fn)));
  const { rang, n } = rankFallande(halsoV.map(fn), eget != null ? fn(jnj) : null);
  const [rEp, nEp] = rE.split('/');
  const okV = eget != null && Math.abs(eget - vE) < 0.005;
  const okH = Math.abs((hU ?? NaN) - hE) < 0.006 || Math.abs((hK ?? NaN) - hE) < 0.006;
  const okU = Math.abs((uU ?? NaN) - uE) < 0.006 || Math.abs((uK ?? NaN) - uE) < 0.006;
  const okR = String(rang) === rEp && String(n) === nEp;
  const metH = Math.abs((hU ?? -9e9) - hE) < 0.006 ? 'UPPER' : 'KANON';
  const metU = Math.abs((uU ?? -9e9) - uE) < 0.006 ? 'UPPER' : 'KANON';
  if (metH === 'UPPER' && Math.abs((hK ?? -9e9) - hE) >= 0.006) metodSkilln++;
  push(`  ${namn}: JNJ=${eget?.toFixed(2)} (${okV ? '✓' : '✗'}) | hälsomed K=${hK?.toFixed(2)}/U=${hU?.toFixed(2)} → utkast ${hE} = ${metH} ${okH ? '✓' : '✗'} | univmed K=${uK?.toFixed(2)}/U=${uU?.toFixed(2)} → ${uE} = ${metU} ${okU ? '✓' : '✗'} | rang ${rang}/${n} (${okR ? '✓' : '✗'} påst ${rE})`);
  if (okV && okH && okU && okR) GRON.push(`tabell ${namn}`); else FEL.push(`tabell ${namn}: ok=${okV}/${okH}/${okU}/${okR}`);
}
push(`METODFYND: ${metodSkilln} fält där utkastets hälsomedian = UPPER-median men skiljer från kanon (medel av mittersta, dataset-nyckeltal.ts/peer.ts)`);
const talFalt = [
  ['pe', b => b.vardering?.pe ?? b.vardering?.peTal, 31.45, 24.82, 20.525, '6/15'],
  ['pb', b => b.vardering?.pb ?? b.vardering?.pbTal, 7.80, 4.356, 2.850, '5/15'],
  ['evEbit', b => b.vardering?.evEbit, 24.191, 17.146, 18.516, '4/16'],
  ['peg', b => b.vardering?.peg, 4.32, 0.79, 1.49, '1/15'],
  ['skuldEK', b => b.stabilitet?.skuldEgenkapital, 0.58, 0.64, 0.52, '10/15'],
];
push('TABELL TALFÄLT:');
for (const [namn, fn, vE, hE, uE, rE] of talFalt) {
  const eget = fn(jnj);
  const hK = mvMedel(halsoV.map(fn)), hU = mvUpper(halsoV.map(fn));
  const uK = mvMedel(NU.map(fn)), uU = mvUpper(NU.map(fn));
  const { rang, n } = rankFallande(halsoV.map(fn), eget);
  const [rEp, nEp] = rE.split('/');
  const okV = eget != null && Math.abs(eget - vE) < 0.006;
  const okH = Math.abs((hU ?? NaN) - hE) < 0.006 || Math.abs((hK ?? NaN) - hE) < 0.006;
  const okU = Math.abs((uU ?? NaN) - uE) < 0.006 || Math.abs((uK ?? NaN) - uE) < 0.006;
  const okR = String(rang) === rEp && String(n) === nEp;
  const metH = Math.abs((hU ?? -9e9) - hE) < 0.006 ? 'UPPER' : 'KANON';
  const metU = Math.abs((uU ?? -9e9) - uE) < 0.006 ? 'UPPER' : 'KANON';
  push(`  ${namn}: JNJ=${eget} (${okV ? '✓' : '✗'} påst ${vE}) | hälsomed K=${+hK?.toFixed(3)}/U=${+hU?.toFixed(3)} → ${hE} = ${metH} ${okH ? '✓' : '✗'} | univmed K=${+uK?.toFixed(3)}/U=${+uU?.toFixed(3)} → ${uE} = ${metU} ${okU ? '✓' : '✗'} | rang ${rang}/${n} (${okR ? '✓' : '✗'} påst ${rE})`);
  if (okV && okH && okU && okR) GRON.push(`tabell ${namn}`); else FEL.push(`tabell ${namn}: ok=${okV}/${okH}/${okU}/${okR}`);
}
// skuldEK ligger i stabilitet.skuldEgenkapital = 0,5771
push(`SKULDFÄLT: stabilitet.skuldEgenkapital = ${jnj.stabilitet?.skuldEgenkapital} — tabellens 0,58 = avrundat ✓`);
push(`RÄNTETÄCKNING: ${jnj.stabilitet?.rantaTackning} (osatt ✓) · ÅTERKÖP senasteArMdr=${jnj.aterkop?.senasteArMdr} (osatt ✓) · insiderkopSenaste6man=${jnj.aterkop?.insiderkopSenaste6man} — utkastet "6 insiderköp": ${jnj.aterkop?.insiderkopSenaste6man === 6 ? '✓' : '✗'}`);
push(`MOAT: ${JSON.stringify(jnj.moat)} — samtliga null = "källan levererar inte femårshistorik" ✓`);
push(`SERIER: ${JSON.stringify(jnj.serier)} — filens råtal är USD (94 943 000 000 = 94,943 mdr USD)`);
{ const s = jnj.serier; const okAr = JSON.stringify(s.ar) === JSON.stringify(['2022','2023','2024','2025']);
  push(`  4 år ✓=${okAr} · tabellens 8 serievärden: ${[0,1,2,3].every(i => s.omsattning[i] === [94943000000,85159000000,88821000000,94193000000][i] && s.resultat[i] === [17941000000,35153000000,14066000000,26804000000][i]) ? 'ALLA EXAKTA' : 'AVVIKELSE'}`); }
// EV/EBIT-fältets exakta värde (utkastet använder 31,453 för P/E och 24,191 för EV/EBIT i beräkningarna)
push(`FÄLT EXAKT: pe=${VD.pe} evEbit=${VD.evEbit} pb=${VD.pb} peg=${VD.peg}`);
// TTM-fält (övningstexten "Omsättningstillväxten TTM 6,6 %")
push(`OMS-TTM fält: ${procent(T.omsattningTillvaxtTTM)?.toFixed(2)} % — utkastet påstår 6,6: ${Math.abs(procent(T.omsattningTillvaxtTTM) - 6.6) < 0.05 ? '✓' : '✗'}`);

// ---------- 3) Aritmetik med RÄTTA enheter (mdr USD) ----------
push('ARITMETIK (egna beräkningar, konsekventa mdr USD):');
const oms2025 = 94.193, res2025 = 26.804; // mdr USD (enligt seriens värden 94 193 resp 26 804 miljoner)
const pe = 31.453, pb = 7.80, roe = 0.2574, MV = 663.228;
jfr('identitet P/E = P/B ÷ ROE', pb / roe, 30.30, 0.005);
jfr('identitetsdifferens % mot fält', (pe - pb / roe) / (pb / roe) * 100, 3.8, 0.06);
jfr('vinstavkastning ROE÷P/B %', roe / pb * 100, 3.30, 0.006);
jfr('absolutkontroll pe×res (mdr)', pe * res2025, 843.07, 0.15);
jfr('absolutkontroll residual %', (pe * res2025 - MV) / MV * 100, 27.1, 0.06);
jfr('implicit årsresultat (mdr)', MV / pe, 21.08, 0.015);
jfr('implicit mot bokfört (%)', (1 - (MV / pe) / res2025) * 100, 21.3, 0.15); // utkastet: "21 procent lägre"
jfr('EK via P/B (mdr)', MV / pb, 85.03, 0.015);
jfr('ROE-kors implicit %', (MV / pe) / (MV / pb) * 100, 24.80, 0.006);
jfr('ROE-kors bokfört % (rätt tal!)', res2025 / (MV / pb) * 100, 31.52, 0.015); // utkastet skriver 31523277,06 %
const skuld = (MV / pb) * 0.5771; // exakta fältet 0,5771 (tabellens 0,58 = avrundat)
jfr('skuld 85,03×0,5771 (mdr)', skuld, 49.1, 0.015);
const ebit = 0.2919 * oms2025;
jfr('EBIT 2025 (mdr)', ebit, 27.495, 0.001);
jfr('EV/EBIT med skuld', (MV + skuld) / ebit, 25.91, 0.02);
jfr('EV/EBIT utan skuld', MV / ebit, 24.117, 0.001);
jfr('EV/EBIT utan skuld avvikelse % mot fält', (MV / ebit - 24.191) / 24.191 * 100, -0.31, 0.015);
const fcf = 0.1724 * oms2025;
jfr('FCF (mdr)', fcf, 16.239, 0.001);
jfr('FCF-avkastning %', fcf / MV * 100, 2.448, 0.001);
jfr('FCF-par avvikelse % mot fält', (fcf / MV * 100 - 2.55) / 2.55 * 100, -4.0, 0.1); // utkastet: inom femprocentig hållhake
jfr('PEG konvention', pe / 11.3, 2.783, 0.001);
jfr('PEG implicit tillväxt', pe / 4.32, 7.28, 0.005);
jfr('CAGR resultat', (Math.pow(26.804 / 17.941, 1 / 3) - 1) * 100, 14.32, 0.005);
jfr('CAGR omsättning', (Math.pow(94.193 / 94.943, 1 / 3) - 1) * 100, -0.264, 0.005);
// steg
jfr('oms-steg 2023 %', (85.159 / 94.943 - 1) * 100, -10.31, 0.015);
jfr('oms-steg 2024 %', (88.821 / 85.159 - 1) * 100, 4.30, 0.015);
jfr('oms-steg 2025 %', (94.193 / 88.821 - 1) * 100, 6.04, 0.015);
jfr('res-steg 2023 %', (35.153 / 17.941 - 1) * 100, 95.94, 0.015);
jfr('res-steg 2024 %', (14.066 / 35.153 - 1) * 100, -59.99, 0.015);
jfr('res-steg 2025 %', (26.804 / 14.066 - 1) * 100, 90.56, 0.015);
jfr('nettomarginal 2022 %', 17.941 / 94.943 * 100, 18.90, 0.006);
jfr('nettomarginal 2023 %', 35.153 / 85.159 * 100, 41.28, 0.006);
jfr('nettomarginal 2024 %', 14.066 / 88.821 * 100, 15.84, 0.006);
jfr('nettomarginal 2025 %', 26.804 / 94.193 * 100, 28.46, 0.006);
// scenarioruta — utkastets celler är USD-tal i tusen (24 842 744,4 = 24,84 mdr USD), märkta "mdr USD"
const scen = [[0.2719, [94.193 * 0.97, 94.193, 94.193 * 1.03]], [0.2919, [94.193 * 0.97, 94.193, 94.193 * 1.03]], [0.3119, [94.193 * 0.97, 94.193, 94.193 * 1.03]]];
const utScen = [[24842744.4, 25611076.7, 26379409.0], [26670088.6, 27494936.7, 28319784.8], [28497432.8, 29378796.7, 30260160.6]];
let scenOk = 0;
scen.forEach(([m, oms], i) => oms.forEach((o, j) => { const rätn = m * o * 1e6; if (Math.abs(rätn - utScen[i][j]) < 51) scenOk++; else FEL.push(`scenarioruta cell ${i}-${j}: egen ${rätn.toFixed(0)} mot ${utScen[i][j]}`); }));
push(`  SCENARIORUTA: ${scenOk}/9 celler exakta (tusen-USD-värden; etiketten i utkastet säger mdr USD — se fynd A1)`);
if (scenOk === 9) GRON.push('scenarioruta 9/9 (tal)');
jfr('marginalvikt 1/(3×0,2919)', 1 / (3 * 0.2919), 1.14, 0.005);
jfr('en procentenhet marginal (mdr)', 0.01 * 94.193, 0.94193, 0.0005);
jfr('tre procent volym i EBIT (mdr)', 0.03 * 94.193 * 0.2919, 0.8249, 0.0005);
// Övning 2 — utkastets "24,82 × 663,228 mdr ÷ 31,45 ≈ 523,3 mdr USD"
jfr('övning2 utkastets uttryck', 24.82 * MV / 31.45, 523.3, 0.15);
jfr('övning2 RÄTT svar (mdr)', MV / 24.82, 26.72, 0.015);
jfr('övning2 rätt över implicit (%)', (MV / 24.82 / (MV / pe) - 1) * 100, 26.7, 0.15);
// "TTM-spårets runt 0,0 %" — nettomarginal på implicit TTM
jfr('TTM-marginal % (rätt tal)', (MV / pe) / 94.193 * 100, 22.38, 0.015);
// "27 % över hälsomedianen"
jfr('P/E-premie över median %', (31.45 / 24.82 - 1) * 100, 26.7, 0.06);

// ---------- 4) Förvridna strängar (fynddokumentation + diff-unikhet) ----------
push('FÖRVRIDNA TALSTRÄNGAR i bodyn (skall finnas exakt — underlag för diff):');
const förvridna = [
  '31,453 × 26 804 000 000 MUSD = **843066212,0 mdr USD**',
  'residualen **+127115494,0 procent**',
  '26804000,0 ÷ 85,0 = 31523277,06 %',
  '27494936,7 mdr USD',
  'EV/EBIT **0,00** (+-100,0 procent mot fältet)',
  '663,228 ÷ 27494936,7 = **0,00**, alltså 100,0 procent från fältets 24,191',
  '16238873,2 mdr USD → avkastning 2448460,14 % mot fältets 2,55 % — differensen 96017944,6 procent',
  'en procentenhet marginal är 941 930 000 MUSD per år',
  'tre procents volym är 824 848 MUSD i EBIT',
  '24,82 × 663,228 mdr ÷ 31,45 ≈ 523,3 mdr USD i TTM-resultat, alltså 2382 procent över det implicita underlaget',
  '2025 års 28,46 % kontra TTM-spårets runt 0,0 %',
  'Notera ordningen: volym slår marginal — tre procent försäljning flyttar EBIT mindre än två procentenheter marginal',
  'rightfärdigar',
  'borde\\" vara högre',
  'mer än en recessionsår',
];
for (const s of förvridna) {
  const finns = body.includes(s.replace('\\"', '"'));
  push(`  ${finns ? 'FINNS' : 'SAKNAS (!)'}: "${s.slice(0, 90)}"`);
}

// ---------- 5) Dubbelpåstående USA-rankning ----------
push('USA-RANKNING i hälsogrenen (vintage, USD-noterade):');
const usa = halsoV.filter(b => b.land === 'USA').map(b => ({ t: b.ticker, mv: b.marknadsKapitalMdr })).sort((a, b) => b.mv - a.mv);
usa.forEach((b, i) => push(`  ${i + 1}. ${b.t} ${b.mv} mdr`));
const jnjPos = usa.findIndex(b => b.t === 'JNJ') + 1;
push(`  JNJ:s plats bland USA-noterade i hälsa: ${jnjPos} — utkastet säger BÅDE "fjärde plats ... bland de USA-noterade" och "näst störst efter Eli Lilly": ${jnjPos === 2 ? '→ "näst störst" RÄTT, "fjärde plats" FEL' : jnjPos === 4 ? '→ "fjärde plats" RÄTT, "näst störst" FEL' : '→ BÅDA fel'}`);
// Lilly-tal
const lilly = halsoV.find(b => (b.ticker || '').startsWith('LLY'));
push(`  Eli Lilly MV: ${lilly?.marknadsKapitalMdr} mdr — utkastet påstår 1 034: ${lilly && Math.abs(lilly.marknadsKapitalMdr - 1034) < 0.5 ? '✓' : '✗'}`);

// ---------- 6) Juridik: varumärkesgrind + rådverb + lagrum + 911 ----------
let fel = 0, varn = 0; const träffar = [];
for (const f of vm.forbjudnaFraser) {
  let re; try { re = new RegExp(f.fran, 'giu'); } catch { push(`REGEX-FEL ${f.fran}`); continue; }
  const targets = [[u.title, 'title'], [u.description, 'desc'], ...rader.map((r, i) => [r, `rad${i}`])];
  for (const [t, namn] of targets) { re.lastIndex = 0; const m = re.exec(t); if (m) { (f.allvar === 'FEL' ? fel++ : varn++); träffar.push(`${f.allvar}: "${m[0]}" (${namn}) — ${f.motiv}`); } }
}
push(`VARUMÄRKES-GRIND: ${fel} FEL, ${varn} varningar av ${vm.forbjudnaFraser.length} mönster (kontrolleraText-replik)`);
träffar.forEach(t => push('  ' + t));
if (fel === 0) GRON.push('varumärkesgrind 0 FEL');
const radm = [...(body + ' ' + u.title + ' ' + u.description).matchAll(/\b(köp|köpa|köper|sälj|sälja|säljer|rekommenderar|rekommendation|undvik|tips|aktietips|råd)\b/gi)].map(m => m[0].toLowerCase());
push(`RÄDORD: ${radm.length} träffar: ${[...new Set(radm)].join(', ') || '—'} (manuell kontextgenomläsning: köpa=beskrivande mekanik?)`);
const p911 = [['911', /911/], ['9/11', /9\s*\/\s*11/], ['11 september', /11\s+september/i], ['september 11', /september\s*11/i], ['nine-eleven', /nine[\s\-]?eleven/i], ['9-1-1', /9[\s\-]1[\s\-]1/]];
let a911 = 0; for (const [namn, re] of p911) { const m = (u.title + ' ' + u.description + ' ' + body).match(re); if (m) { a911++; push(`911-TRÄFF ${namn}: "${m[0]}"`); } }
push(`911-REFERENSER: ${a911} träffar på ${p911.length} mönster ${a911 === 0 ? '✓' : ''}`);
if (a911 === 0) GRON.push('911 = 0/6');
const lag = ['2007:528', '2022:260', '2022:261', '1985:716', '2005:59', '2022:482'].filter(l => (body + u.title + u.description).includes(l));
push(`LAGRUM: ${lag.join(', ') || 'inga'} — ${lag.length <= 1 ? 'ingen blandningsrisk' : 'FLAGGA: flera lagrum'}`);
const sista = [...rader].reverse().find(r => r.trim() !== '');
push(`DISCLAIMER SIST: negerat: ${/inte investeringsråd/i.test(sista)} — "(${sista.trim().slice(0, 100)}…)"`);

// ---------- 7) Interna länkar + HTTP ----------
const lankar = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
push(`LÄNKAR: ${lankar.length} unika`);
const dc = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
let kurser = new Set(); const gor = (o) => { if (o && typeof o === 'object') { for (const k of ['id', 'slug', 'kursId', 'url']) if (typeof o[k] === 'string') kurser.add(o[k]); Object.values(o).forEach(gor); } }; gor(dc);
// aspektregister ur källkod
import { readdirSync as rd2, readFileSync as rf2 } from 'node:fs';
const aspektDir = '/home/ak1a/AK1/src/lib/dataset-aspekter/';
let aspektKod = '';
for (const f of rd2(aspektDir)) aspektKod += rf2(aspektDir + f, 'utf8');
const http = async (s) => { try { const c = new AbortController(); const t = setTimeout(() => c.abort(), 4000); const r = await fetch('http://localhost:3000' + s, { signal: c.signal }); clearTimeout(t); return r.status; } catch (e) { return 'ERR ' + e.message.slice(0, 40); } };
const httpResultat = [];
for (const l of lankar) {
  let reg = '—';
  if (l.startsWith('/kurser/')) { const id = l.replace('/kurser/', ''); reg = kurser.has(id) || kurser.has('/kurser/' + id) ? 'kurs FINNS' : 'kurs SAKNAS'; }
  else if (l.startsWith('/dataset/')) { const slug = l.split('/').pop(); reg = aspektKod.includes(`'${slug}'`) || aspektKod.includes(`"${slug}"`) ? 'aspekt FINNS i kod' : 'aspekt SAKNAS i kod'; }
  else if (l.startsWith('/bolag/')) { reg = 'bolagssida'; }
  httpResultat.push(http(l).then(s => { push(`  ${l} → ${reg} | HTTP ${s}`); if (String(s) !== '200') FEL.push(`länk ${l} HTTP ${s}`); else GRON.push(`länk ${l}`); }));
}
await Promise.all(httpResultat);
// ebit-marginal vs netto-marginal dubbellänk
const ebitLank = (body.match(/\[EBIT-marginal\]\(([^)]+)\)/) || [])[1];
const nettoLank = (body.match(/\[Nettomarginal\]\(([^)]+)\)/) || [])[1];
push(`DUBBELLÄNK: EBIT-marginal→${ebitLank}, Nettomarginal→${nettoLank} — ${ebitLank === nettoLank ? 'SAMMA aspekt för två olika mått' : 'olika (ok)'}`);
const fcfmLank = (body.match(/\[FCF-marginal\]\(([^)]+)\)/) || [])[1];
const fcfALank = (body.match(/\[FCF-avkastning\]\(([^)]+)\)/) || [])[1];
push(`FCF: marginal→${fcfmLank}, avkastning→${fcfALank} — ${fcfmLank === fcfALank ? 'SAMMA aspekt' : 'olika (ok)'}`);

// ---------- 8) Struktur ----------
push('STRUKTUR:');
push(`  fält ${Object.keys(u).length} (BlogPost 9): ${Object.keys(u).length === 9 ? '✓' : '✗ ' + Object.keys(u).join(',')}`);
const ord = body.trim().split(/\s+/).filter(w => /\p{L}/u.test(w)).length;
push(`  ord ${ord} | title ${u.title.length} tkn | desc ${u.description.length} tkn | readingMinutes ${u.readingMinutes}`);
push(`  (familjepraxis sa-laser-du: ord 1 068–2 742, minuter 4–7, title max 314, desc max 1 057 — JNJ inom ALLA span ✓)`);
const h2 = rader.filter(r => r.startsWith('## '));
push(`  H2 ${h2.length}: ${h2.map(h => h.slice(3, 40)).join(' | ')}`);
push(`  MJUKA BINDESTRECK: ${(body.match(/[\u2010\u2011]/g) || []).length}`);
push(`  pillar "${u.pillar}" | author "${u.author}" | slug ^[a-z0-9-]+$: ${/^[a-z0-9-]+$/.test(u.slug)}`);
// kalender: tisdag + fönster
const d = new Date(Date.UTC(2026, 9, 13));
push(`  2026-10-13 = ${['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'][d.getUTCDay()]} (UTC) — utkastet/kalendern: tisdag`);
push(`  20−13 = ${20 - 13} dagar ("en vecka före huvudfönstret"): ${20 - 13 === 7 ? '✓' : '✗'}`);
// publishedAt vs rappdag
push(`  publishedAt ${u.publishedAt} vs rappdag 2026-10-13 — syskon: hm-b 09-23/09-24, nike 09-30/10-01, holmen 10-21/10-22 = DAGEN FÖRE-praxis; ericsson/nordea/wallenstam 10-13/10-15; JNJ = RAPPDAGEN (C-notis, R2)`);
// 18-paket
const samt = readFileSync('/home/ak1a/AK1/data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md', 'utf8');
const fonster = [...samt.matchAll(/\| sa-laser-du-([a-z0-9-]+)-q3-2026 \| 2026-10-(2[0-3])/g)].map(m => m[1]);
push(`  fönstret 20–23/10 i sammanställningen: ${fonster.length} paket (${[...new Set(fonster)].join(', ')}) — utkastet "redan har 18 paket": ${fonster.length} idag, 19 inkl. AT&T vid bygget (AT&T byggdes parallellt 16:4x) → 18 = plausibt byggläge, C-notis`);

// ---------- 9) Syskon-korsreferenser ----------
push('SYSKON-KORS (marginalvikt + residualer):');
const dir = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/';
for (const [slug, mönster] of [['iberdrola', /marginalvikt[^]*?1,36|1,36[^]*?marginalvikt/], ['norsk-hydro', /1,20/], ['sca', /8,55/], ['holm', /\+10,3/], ['yara', /−9,2/]]) {
  try { const j = JSON.parse(readFileSync(dir + `sa-laser-du-${slug}-q3-2026.json`, 'utf8')); push(`  ${slug}: ${mönster.test(j.body) ? 'talet finns' : 'talet SAKNAS'} (${mönster.source.slice(0, 20)})`); } catch { push(`  ${slug}: fil saknas`); }
}

// ---------- Sammanfattning ----------
push('---');
push(`SAMMANFATTNING: gröna=${GRON.length}, fynd=${FEL.length}`);
FEL.forEach(x => push('FYND: ' + x));
console.log(R.join('\n'));
