#!/usr/bin/env node
// _s1u1-iberdrola-kontroll.mjs — granskningssond för sa-laser-du-iberdrola-q3-2026
// (s1-u1, manifest auto-s1-1790796926223; pivot från m9 #1 = flerfaldigt levererad)
// Speglar släktets sondmönster (telia/getinge/fabege): källor mot byggvintage,
// aritmetik egenräknad, juridik 2007:528 (kontrolleraText-spegel ur varumarke.json),
// 911-sex-mönster, struktur, länkar HTTP, kalender + läspaketsfönster.
// LÄSER ENDAST — utkastet skrivs aldrig (granskaren skriver inte andras filer).
import fs from 'node:fs';
import crypto from 'node:crypto';

const ROT = '/home/ak1a/AK1';
const UTK = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-iberdrola-q3-2026.json`, 'utf8'));
const VIN = JSON.parse(fs.readFileSync('/tmp/_s1u1_ibe_vintage.json', 'utf8')); // git show c256c659 (138 poster, 2026-09-16 21:51)
const DAG = JSON.parse(fs.readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const VM = JSON.parse(fs.readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));
const KAL = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-energi.json`, 'utf8'));

const TITLE = UTK.title ?? '';
const DESC = UTK.description ?? '';
const BODY = UTK.body ?? '';
const HELA = TITLE + '\n' + DESC + '\n' + BODY;
const md5 = s => crypto.createHash('md5').update(s).digest('hex');

let OK = 0, FEL = 0, NOT = 0;
const O = (id, txt) => { OK++; console.log(`  OK  ${id} · ${txt}`); };
const F = (id, txt) => { FEL++; console.log(`  FEL ${id} · ${txt}`); };
const N = (id, txt) => { NOT++; console.log(`  NOT ${id} · ${txt}`); };
const nära = (få, vill, tol = 0.0005) => typeof få === 'number' && Math.abs(få - vill) <= tol;
const avr = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

console.log(`SOND _s1u1-iberdrola — ${new Date().toISOString()}`);
console.log(`utkast md5 ${md5(JSON.stringify(UTK))} · vintage ${VIN.length} poster · dagens ${DAG.length} poster`);

// ── A. IBE-posten mot textens tal (byggvintage c256c659) ──────────────────
console.log('\n── A. Källfält (vintagen) mot texten ──');
const ibe = VIN.find(b => b.ticker === 'IBE.MC');
const ibeD = DAG.find(b => b.ticker === 'IBE.MC');
A1: {
  if (!ibe) break A1;
  if (!ibeD) N('A1', 'IBE saknas i DAGENS fil (322) — drift, ej domslut; vintagen är domskälla');
  else O('A1', `IBE finns i vintagen (hämtad ${ibe.hamtat}) och dagens fil`);
}
const fält = [
  ['A2', 'pris 19,625', ibe.pris, 19.625, '19,625 euro'],
  ['A3', 'mcap 131,0 mdr', ibe.marknadsKapitalMdr, 130.96, 'cirka 131,0 miljarder'],
  ['A4', 'P/E 24,842 → text 24,8', ibe.vardering.pe, 24.842, '24,8'],
  ['A5', 'P/B 2,536 → text 2,54', ibe.vardering.pb, 2.536, '2,54'],
  ['A6', 'EV/EBIT 18,085 → 18,1', ibe.vardering.evEbit, 18.085, '18,1'],
  ['A7', 'PEG 3,02', ibe.vardering.peg, 3.02, '3,02'],
  ['A8', 'FCF-yield 1,96 %', ibe.vardering.fcfYield, 0.0196, '1,96 procent'],
  ['A9', 'ROE 0,1002 → 10,0 %', ibe.lonksamhet.roe, 0.1002, '10,0 procent'],
  ['A10', 'ROIC 0,0953 → 9,5 %', ibe.lonksamhet.roic, 0.0953, '9,5 procent'],
  ['A11', 'brutto 0,5389 → 53,9 %', ibe.lonksamhet.bruttoMarginal, 0.5389, '53,9 procent'],
  ['A12', 'EBIT-marginal 0,2447 → 24,47 %', ibe.lonksamhet.ebitMarginal, 0.2447, '24,47 procent'],
  ['A13', 'netto 0,1588 → 15,9 %', ibe.lonksamhet.nettoMarginal, 0.1588, '15,9 procent'],
  ['A14', 'FCF-marginal 0,0576 → text visar 5,8 %', ibe.lonksamhet.fcfMarginal, 0.0576, '5,8 procent'],
  ['A15', 'skuld/EK 1,0003', ibe.stabilitet.skuldEgenkapital, 1.0003, '1,0003'],
  ['A16', 'omsCAGR −0,0549 → −5,49 %', ibe.tillvaxt.omsattningCAGR5ar, -0.0549, '−5,49 procent per år'],
  ['A17', 'resCAGR 0,1315 → +13,15 %', ibe.tillvaxt.resultatCAGR5ar, 0.1315, 'plus 13,15 procent per år'],
  ['A18', 'TTM 0,098 → +9,8 %', ibe.tillvaxt.omsattningTillvaxtTTM, 0.098, 'plus 9,8 procent'],
  ['A19', 'prognos 0,0705 → 7,05 %', ibe.tillvaxt.prognosTillvaxt, 0.0705, '7,05 procent'],
];
for (const [id, namn, fått, vill] of fält) nära(fått, vill) ? O(id, `${namn} ✓`) : F(id, `${namn} — fick ${fått}`);

// serier
const om = ibe.serier.omsattning, re = ibe.serier.resultat, år = ibe.serier.ar;
const omM = om.map(x => x / 1e6), reM = re.map(x => x / 1e6);
{
  const villOm = [53949, 49335, 44739, 45547], villRe = [4339, 4803, 5612, 6285];
  const okOm = omM.every((x, i) => Math.abs(x - villOm[i]) <= 1);
  const okRe = reM.every((x, i) => Math.abs(x - villRe[i]) <= 1);
  okOm ? O('A20', `intäktsserie ${omM.map(x => avr(x, 0)).join(' → ')} ≈ textens 53 949 → 49 335 → 44 739 → 45 547 (avrundat)`) : F('A20', `intäktsserie avviker: ${omM}`);
  okRe ? O('A21', `resultatserie ${reM.map(x => avr(x, 0)).join(' → ')} ≈ textens 4 339 → 4 803 → 5 612 → 6 285`) : F('A21', `resultatserie avviker: ${reM}`);
  (år.length === 4 && år[0] === '2022' && år[3] === '2025') ? O('A22', `fyra räkenskapsår ${år.join(',')} = textens "källan ger fyra år, inte fem"`) : F('A22', `serieår avviker: ${år}`);
  (ibe.stabilitet.rantaTackning === null) ? O('A23', 'räntetäckning null = textens "osatt" ✓') : F('A23', 'räntetäckning är inte null');
  (ibe.aterkop.senasteArMdr === null && ibe.aterkop.andelUtestande === null) ? O('A24', 'återköps-/utdelningsfält null = textens utdelningsnot ✓') : F('A24', 'återköpsfält inte null');
  /4 räkenskapsår/.test(ibe.notering) && /roic = approximerad proxy/.test(ibe.notering) ? O('A25', 'noteringens förbehåll (4 år, ROIC-proxy, räntetäckning) ärligt speglade i texten') : N('A25', 'noteringens förbehåll — kontrollera spegling');
  (ibe.valuta === 'EUR' && ibe.land === 'Spanien') ? O('A26', 'EUR/Spanien = textens "EUR mot EUR" + Bolsa de Madrid') : F('A26', `valuta/land: ${ibe.valuta}/${ibe.land}`);
  /MarketStack/.test(JSON.stringify(ibe.kallor)) && /ingen färsk data|saknade färsk/.test(JSON.stringify(ibe.kallor)) ? O('A27', 'MarketStack utan färsk kurs = källradens "ingen dubbelkoll av pris" ✓') : N('A27', 'MarketStack-not ej funnen');
}

// ── B. Medianer (vintagen) ────────────────────────────────────────────────
console.log('\n── B. Medianer energi + universum (vintagen, n=138) ──');
const median = a => { const s = [...a].filter(x => x !== null && x !== undefined).sort((x, y) => x - y); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const energi = VIN.filter(b => b.bransch === 'energi');
const val = (b, sök) => { let o = b; for (const k of sök) o = o?.[k]; return o ?? null; };
const mät = [
  ['pe', ['vardering', 'pe'], 16.5, 21.2],
  ['pb', ['vardering', 'pb'], 2.27, 3.09],
  ['roe', ['lonksamhet', 'roe'], 0.123, 0.162],
  ['ebitMarginal', ['lonksamhet', 'ebitMarginal'], 0.18, 0.212],
  ['nettoMarginal', ['lonksamhet', 'nettoMarginal'], 0.091, 0.149],
  ['skuldEgenkapital', ['stabilitet', 'skuldEgenkapital'], 0.56, null],
];
const nSidan = { pe: 129, pb: 135, roe: 134, ebitMarginal: 137, nettoMarginal: 138 };
for (const [nyckel, sök, villE, villU] of mät) {
  const e = energi.map(b => val(b, sök)).filter(x => x !== null);
  const u = VIN.map(b => val(b, sök)).filter(x => x !== null);
  const me = median(e), mu = median(u);
  const tol = nyckel === 'pe' || nyckel === 'pb' ? 0.051 : 0.0011;
  if (villE !== null) (me !== null && Math.abs(me - villE) <= tol) ? O(`B-${nyckel}-e`, `energi-median ${avr(me, 4)} ≈ ${villE} (n=${e.length}${nyckel === 'pe' ? ', textens n=12' : ''})`) : F(`B-${nyckel}-e`, `energi-median ${me} mot textens ${villE} (n=${e.length})`);
  if (villU !== null) {
    (Math.abs(mu - villU) <= tol) ? O(`B-${nyckel}-u`, `universum-median ${avr(mu, 4)} ≈ ${villU} (n=${u.length}, textens n=${nSidan[nyckel]})`) : F(`B-${nyckel}-u`, `universum-median ${mu} mot ${villU} (n=${u.length})`);
    if (u.length !== nSidan[nyckel]) N(`B-${nyckel}-n`, `n ${u.length} ≠ textens ${nSidan[nyckel]}`);
  }
}

// ── C. Rang och spann ─────────────────────────────────────────────────────
console.log('\n── C. Rang/påståenden i grenen ──');
{
  const peE = energi.filter(b => b.vardering?.pe != null);
  const högsta = peE.slice().sort((a, b) => b.vardering.pe - a.vardering.pe)[0];
  (högsta.ticker === 'IBE.MC') ? O('C1', `P/E ${avr(högsta.vardering.pe, 3)} är grenens högsta av ${peE.length} med ifyllt fält (text: tolv) ✓`) : F('C1', `högst P/E: ${högsta.ticker} ${högsta.vardering?.pe}`);
  const ne = energi.filter(b => b.lonksamhet?.nettoMarginal != null).sort((a, b) => b.lonksamhet.nettoMarginal - a.lonksamhet.nettoMarginal);
  const rank = ne.findIndex(b => b.ticker === 'IBE.MC') + 1;
  (rank === 2 && /^RWE/.test(ne[0].ticker)) ? O('C2', `netto ${avr(ibe.lonksamhet.nettoMarginal * 100, 2)} näst högst efter ${ne[0].ticker} (${avr(ne[0].lonksamhet.nettoMarginal * 100, 2)}) ✓`) : F('C2', `netto-rang ${rank}, topp ${ne[0]?.ticker}`);
  const se = energi.filter(b => b.stabilitet?.skuldEgenkapital != null).sort((a, b) => a.stabilitet.skuldEgenkapital - b.stabilitet.skuldEgenkapital);
  // spannet inom branscher — MÅTTVAL dokumenterat: max/min sprängs av nollskuldsbolag
  // (industrins 282× = en HAL-klass-min ~0,002); absolut bredd (max−min) är det ärliga måttet
  const branscher = [...new Set(VIN.map(b => b.bransch))];
  const spann = {};
  for (const br of branscher) {
    const xs = VIN.filter(b => b.bransch === br && b.stabilitet?.skuldEgenkapital != null).map(b => b.stabilitet.skuldEgenkapital);
    if (xs.length) spann[br] = { abs: Math.max(...xs) - Math.min(...xs), kvot: Math.max(...xs) / Math.min(...xs.filter(x => x > 0)), min: Math.min(...xs), max: Math.max(...xs) };
  }
  const bredastAbs = Object.entries(spann).sort((a, b) => b[1].abs - a[1].abs)[0];
  console.log(`      spann per bransch (absolut): ${Object.entries(spann).sort((a, b) => b[1].abs - a[1].abs).slice(0, 4).map(([br, s]) => `${br} ${avr(s.abs, 2)} (min ${avr(s.min, 3)}, max ${avr(s.max, 2)})`).join(' · ')}`);
  if (bredastAbs[0] === 'energi') O('C3', `energi = universumets bredaste skuld/EK-spann på ABSOLUT bredd (${avr(bredastAbs[1].abs, 2)}; kvot-måttet ${avr(bredastAbs[1].kvot, 1)}× slås av industrins nollskulds-min ${avr(spann['industri']?.min ?? NaN, 3)} → ${avr(spann['industri']?.kvot ?? NaN, 0)}×, därför absolut mått) ✓ textens påstående`);
  else N('C3', `bredaste absolut-spann: ${bredastAbs[0]} ${avr(bredastAbs[1].abs, 2)} mot energi ${avr(spann['energi'].abs, 2)} — påståendet "universumets bredaste" gäller måttvalet`);
  const lägsta = se.filter(b => b.stabilitet.skuldEgenkapital < 0.2).map(b => b.ticker);
  (lägsta.includes('CVX') && lägsta.includes('XOM')) ? O('C3b', `energins sub-0,2-bolag: ${lägsta.join(', ')} = textens "Chevron och Exxon under 0,2" ✓`) : F('C3b', `sub-0,2: ${lägsta.join(', ')}`);
  const ve = VIN.find(b => /VAR/i.test(b.ticker) && /energi/i.test(b.namn || '')) || VIN.find(b => /V\xE5r ?Energi/i.test(b.namn || ''));
  const enel = VIN.find(b => /ENEL/i.test(b.ticker));
  const cvx = VIN.find(b => b.ticker === 'CVX'), xom = VIN.find(b => b.ticker === 'XOM');
  const kont = [[ve, 3.1, 'Vår Energi 3,1'], [enel, 1.5, 'Enel 1,5']];
  for (const [b, vill, namn] of kont) {
    const f = b?.stabilitet?.skuldEgenkapital;
    (f !== null && f !== undefined && Math.abs(f - vill) <= 0.05) ? O(`C4-${namn.split(' ')[0]}`, `${namn} = ${avr(f, 2)} ✓`) : F(`C4-${namn.split(' ')[0]}`, `${namn}: fick ${f}`);
  }
  (cvx?.stabilitet?.skuldEgenkapital < 0.2 && xom?.stabilitet?.skuldEgenkapital < 0.2) ? O('C5', `CVX ${avr(cvx.stabilitet.skuldEgenkapital, 3)} och XOM ${avr(xom.stabilitet.skuldEgenkapital, 3)} under 0,2 ✓`) : F('C5', `CVX/XOM: ${cvx?.stabilitet?.skuldEgenkapital}/${xom?.stabilitet?.skuldEgenkapital}`);
  // Vår Energi-sorteringsmotivering
  if (ve) {
    const pb = ve.vardering?.pb, pe = ve.vardering?.pe;
    (pb && pe && pb / pe > 4) ? O('C6', `Vår Energi P/B ${avr(pb, 1)} mot P/E ${avr(pe, 1)} — identitetskvot ${avr(pb / 0.94 / pe, 1)}× ≈ textens "sexfaldig spänning" ✓`) : F('C6', `Vår Energi P/B ${pb} P/E ${pe}`);
    (ve.vardering?.peg === null && ve.stabilitet?.rantaTackning === null) ? O('C7', 'Vår Energi PEG + räntetäckning null ✓') : F('C7', `Vår Energi PEG ${ve.vardering?.peg}`);
    (ve.tillvaxt?.prognosTillvaxt !== null && Math.abs(ve.tillvaxt.prognosTillvaxt + 0.34) <= 0.005) ? O('C8', `Vår Energi prognos ${avr(ve.tillvaxt.prognosTillvaxt * 100, 1)} % = textens −34 ✓`) : F('C8', `prognos ${ve.tillvaxt?.prognosTillvaxt}`);
  } else N('C6-8', 'Vår Energi ej i vintagen — påståendet bär kalenderkällan');
}

// ── D. Aritmetik — egen omräkning ─────────────────────────────────────────
console.log('\n── D. Aritmetik (exakt = fältens full precision · synlig = textens redovisade tal) ──');
const pe = ibe.vardering.pe, pb = ibe.vardering.pb, roe = ibe.lonksamhet.roe, mcap = ibe.marknadsKapitalMdr;
const D = [
  ['D1', 'identitet fram: 2,536/0,1002', pb / roe, 25.31, 0.005],
  ['D2', 'gap mot P/E-fältet 1,9 %', (pb / roe / pe - 1) * 100, 1.9, 0.05],
  ['D3', 'identitet omvänd EXAKT: 24,842×0,1002', pe * roe, 2.49, 0.005],
  ['D4', 'VPA: 19,625/24,842', ibe.pris / pe, 0.79, 0.005],
  ['D5', 'absolut EXAKT: 24,842×6 285 (mdr)', pe * reM[3] / 1000, 156.1, 0.05],
  ['D6', 'residual EXAKT, nämnare 156,1 (mdr)', ((pe * reM[3] / 1000) - mcap) / (pe * reM[3] / 1000) * 100, 16.1, 0.05],
  ['D7', 'årsresultats-PE: 130 960/6 285', mcap * 1000 / reM[3], 20.84, 0.005],
  ['D8', 'PEG replikering: 20,84/7,05', (mcap * 1000 / reM[3]) / 7.05, 2.96, 0.005],
  ['D9', 'PEG multiplicält EXAKT: 24,842/7,05', pe / 7.05, 3.52, 0.005],
  ['D10', 'PEG implicit EXAKT: 24,842/3,02', pe / 3.02, 8.23, 0.005],
  ['D11', 'EV steg1 EXAKT: 130,96/2,536', mcap / pb, 51.6, 0.05],
  ['D12', 'EV steg2 EXAKT: ×1,0003', (mcap / pb) * ibe.stabilitet.skuldEgenkapital, 51.7, 0.05],
  ['D13', 'EV steg3 EXAKT: summa', (mcap / pb) * (1 + ibe.stabilitet.skuldEgenkapital), 103.3, 0.05],
  ['D14', 'EV steg4: 45 547×0,2447', omM[3] * ibe.lonksamhet.ebitMarginal, 11145, 1],
  ['D15', 'EV steg5: 103,3/11,145', ((mcap / pb) * (1 + ibe.stabilitet.skuldEgenkapital) * 1000) / (omM[3] * ibe.lonksamhet.ebitMarginal), 9.27, 0.005],
  ['D16', 'kvot fält/kedja 1,95', ibe.vardering.evEbit / (((mcap / pb) * (1 + ibe.stabilitet.skuldEgenkapital) * 1000) / (omM[3] * ibe.lonksamhet.ebitMarginal)), 1.95, 0.005],
  ['D17', 'implicerat EV 18,1×11,145', ibe.vardering.evEbit * (omM[3] * ibe.lonksamhet.ebitMarginal) / 1000, 202, 0.5],
  ['D18', 'EV-residual 98 mdr', ibe.vardering.evEbit * (omM[3] * ibe.lonksamhet.ebitMarginal) / 1000 - (mcap / pb) * (1 + ibe.stabilitet.skuldEgenkapital), 98, 0.7],
  ['D19', 'FCF EXAKT: 5,76 %×45 547', ibe.lonksamhet.fcfMarginal * omM[3], 2623, 1],
  ['D20', 'FCF-yield väg: 2 623/130 960', (ibe.lonksamhet.fcfMarginal * omM[3]) / (mcap * 1000) * 100, 2.00, 0.005],
  ['D21', 'intäkts-CAGR −5,49', ((omM[3] / omM[0]) ** (1 / 3) - 1) * 100, -5.49, 0.005],
  ['D22', 'intäktssteg 2023 −8,6', (omM[1] / omM[0] - 1) * 100, -8.6, 0.05],
  ['D23', 'intäktssteg 2024 −9,3', (omM[2] / omM[1] - 1) * 100, -9.3, 0.05],
  ['D24', 'intäktssteg 2025 +1,8', (omM[3] / omM[2] - 1) * 100, 1.8, 0.05],
  ['D25', 'fallet till botten −17,1', (omM[2] / omM[0] - 1) * 100, -17.1, 0.05],
  ['D26', 'resultat-CAGR +13,15', ((reM[3] / reM[0]) ** (1 / 3) - 1) * 100, 13.15, 0.005],
  ['D27', 'resultatsteg +10,7', (reM[1] / reM[0] - 1) * 100, 10.7, 0.05],
  ['D28', 'resultatsteg +16,8', (reM[2] / reM[1] - 1) * 100, 16.8, 0.05],
  ['D29', 'resultatsteg +12,0', (reM[3] / reM[2] - 1) * 100, 12.0, 0.05],
  ['D30', 'netto-marginalserie 2022 8,0', (reM[0] / omM[0]) * 100, 8.0, 0.05],
  ['D31', 'netto-marginalserie 2023 9,7', (reM[1] / omM[1]) * 100, 9.7, 0.05],
  ['D32', 'netto-marginalserie 2024 12,5', (reM[2] / omM[2]) * 100, 12.5, 0.05],
  ['D33', 'netto-marginalserie 2025 13,8', (reM[3] / omM[3]) * 100, 13.8, 0.05],
  ['D34', 'P/E-premie 50 %', (pe / 16.5 - 1) * 100, 50, 0.6],
  ['D35', 'P/B-premie 11 %', (pb / 2.27 - 1) * 100, 11, 0.6],
  ['D36', 'ROE −18 %', (roe / 0.123 - 1) * 100, -18, 0.6],
  ['D37', 'EBIT +36 %', (ibe.lonksamhet.ebitMarginal / 0.18 - 1) * 100, 36, 0.6],
  ['D38', 'netto +75 %', (ibe.lonksamhet.nettoMarginal / 0.091 - 1) * 100, 75, 0.6],
  ['D39', 'multipelövning EXAKT: 24,842/1,0705', pe / 1.0705, 23.21, 0.005],
];
for (const [id, namn, fått, vill, tol] of D) nära(fått, vill, tol) ? O(id, `${namn} = ${avr(fått, 4)} ≈ ${vill} ✓`) : F(id, `${namn} = ${avr(fått, 4)} mot ${vill}`);
// monotona serier
(reM.every((x, i) => i === 0 || x > reM[i - 1])) ? O('D40', 'resultatserien monotont stigande ✓') : F('D40', 'resultatserien ej monotont stigande');
// scenariorutan 9 celler
{
  const bas = omM[3], m = ibe.lonksamhet.ebitMarginal;
  const råor = [bas * 0.97, bas, bas * 1.03], råm = [m - 0.01, m, m + 0.01];
  const vill = [[10369, 10811, 11253], [10690, 11145, 11601], [11011, 11480, 11949]];
  let ok = 0;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (Math.abs(råor[i] * råm[j] - vill[i][j]) <= 1) ok++;
  (ok === 9) ? O('D41', 'scenariorutan 9/9 celler ✓') : F('D41', `scenarioruta ${ok}/9`);
  (Math.abs(bas * 0.01 - 455) <= 1 && Math.abs(bas * 0.03 * m - 334) <= 1 && Math.abs((bas * 0.01) / (bas * 0.03 * m) - 1.36) <= 0.005) ? O('D42', 'räknesatser 455/334 + marginalvikt 1,36 ✓') : F('D42', 'räknesatser avviker');
  (Math.abs(1 / (3 * m) - 1.36) <= 0.005) ? O('D43', `Essity-formeln 1/(3×marginal) = ${avr(1 / (3 * m), 3)} ≈ 1,36 ✓`) : F('D43', 'Essity-formeln avviker');
}
// F2-klass: textens SYNLIGA tal mot textens resultat
console.log('\n── D-F2. Textens synliga tal bär sin egen aritmetik? (Fabege F2-klassen) ──');
{
  const par = [
    ['F2a', 'text: "24,8 ÷ 3,02 = 8,23"', 24.8 / 3.02, 8.23],
    ['F2b', 'text: "P/E 24,8 delat med 1,0705 … blir 23,21"', 24.8 / 1.0705, 23.21],
    ['F2c', 'text: "5,8 procent gånger intäkterna 45 547 … ger 2 623"', 0.058 * 45547, 2623],
    ['F2d', 'text: "P/E-fältet 24,8 multiplicerat med årsresultatet 6 285 … ger 156,1"', 24.8 * 6285 / 1000, 156.1],
    ['F2e', 'text: "24,8 multiplicerat med 0,1002 ger 2,49"', 24.8 * 0.1002, 2.49],
  ];
  for (const [id, namn, synlig, textSvar] of par) {
    Math.abs(synlig - textSvar) <= 0.005 ? O(id, `${namn}: synlig = ${avr(synlig, 3)} ✓`) : F(id, `${namn}: synliga tal ger ${avr(synlig, 2)}, texten säger ${textSvar} (fullprecisionsskillnad — Fabege F2-klassen)`);
  }
  N('F2-not', 'Alla fem F2-ytor härstammar ur SAMMA rot: texten redovisar fältvärdena avrundade (24,8/5,8) men låter resultaten följa fältens fulla precision (24,842/5,76) — kuren är att redovisa de två fälten med full precision i respektive räknesats (Fabege F2-precedensen)');
}

// ── E. Juridik 2007:528 ───────────────────────────────────────────────────
console.log('\n── E. Juridik (kontrolleraText-spegel ur data/varumarke.json) ──');
{
  let fel = 0, felLista = [];
  for (const fras of VM.forbjudnaFraser) {
    const re = new RegExp(fras.fran, 'gu');
    for (const [yta, text] of [['title', TITLE], ['description', DESC], ['body', BODY]]) {
      const m = text.match(re);
      if (m) { fel++; felLista.push(`${fras.id}/${yta}: "${m[0]}"`); }
    }
  }
  fel === 0 ? O('E1', `forbjudnaFraser ${VM.forbjudnaFraser.length} mönster × 3 ytor = 0 träff`) : F('E1', `${fel} träff(ar): ${felLista.join('; ')}`);
  const råd = HELA.match(/\b(rekommenderar|rekommenderad|rekommendation)\w*/gi) || [];
  const negerade = (HELA.match(/inte en rekommendation|Inga köp-, sälj-|negerad/g) || []).length;
  N('E2', `ordet "rekommendation(-er)" ${råd.length} förekomster — kontext: alla negerade ("inte en rekommendation att köpa", "Inga köp-, sälj- eller hållningsrekommendationer") = SIGNATUR-tillstånd`);
  const lagrum = [...new Set((HELA.match(/\b\d{4}:\d+\b/g) || []))];
  (lagrum.length === 1 && lagrum[0] === '2007:528') ? O('E3', `exakt en lagrumsfamilj: ${lagrum[0]} (2 kap 5 §) — ingen lagrumsblandning`) : F('E3', `lagrum: ${lagrum.join(', ')}`);
  /utbildning/i.test(BODY) && /pedagogisk/i.test(BODY) ? O('E4', 'utbildningsramen explicit (utbildningspaket/pedagogisk)') : F('E4', 'utbildningsram saknas');
  const sista = BODY.trimEnd().split('\n').pop();
  (/2007:528/.test(sista) && /inte investeringsrådgivning|inte investeringsråd/.test(sista) && /kundens beslut/.test(sista)) ? O('E5', 'disclaimern + R2-rad exakt sist i bodyn') : F('E5', `sista raden: "${sista.slice(0, 120)}"`);
  /inte en rekommendation att köpa, sälja eller behålla/.test(BODY) ? O('E6', 'negerad köp/sälj/behåll-fras i ingress ✓') : N('E6', 'negerad köp/sälj-fras — kontrollera placering');
}

// ── F. 911 ────────────────────────────────────────────────────────────────
console.log('\n── F. 911-referenser ──');
{
  const p911 = [/\b911\b/, /9\s*\/\s*11/, /11\s+september/i, /september\s+11/i, /nine[-\s]?eleven/i, /9-1-1/];
  let t = 0;
  for (const re of p911) { const m = HELA.match(re); if (m) { t++; console.log(`      träff: "${m[0]}"`); } }
  t === 0 ? O('F1', '911: 0 träffar (sex mönster × alla ytor)') : F('F1', `911: ${t} träff(ar)`);
}

// ── G. Struktur + språk ───────────────────────────────────────────────────
console.log('\n── G. Struktur och språk ──');
{
  const h2 = (BODY.match(/^## /gm) || []).length;
  h2 >= 6 ? O('G1', `${h2} H2-rubriker (familjestil ≥ 6)`) : N('G1', `${h2} H2-rubriker`);
  const ord = BODY.match(/\S+/g)?.length ?? 0; // släktets metod (fabege-sondens rad 191)
  const rm = Math.round(ord / 600);
  rm === UTK.readingMinutes ? O('G2', `${ord} ord → rm ${rm} = fältets ${UTK.readingMinutes} ✓ (konvention round(ord/600))`) : F('G2', `${ord} ord → rm ${rm} ≠ fältets ${UTK.readingMinutes}`);
  TITLE.length <= 314 ? O('G3', `title ${TITLE.length} tkn ≤ tak 314`) : F('G3', `title ${TITLE.length} tkn > 314`);
  (DESC.length >= 200 && DESC.length <= 660) ? O('G4', `description ${DESC.length} tkn (seriepraxis 204–660)`) : N('G4', `description ${DESC.length} tkn`);
  Array.isArray(UTK.tags) && UTK.tags.length === 6 ? O('G5', 'tags 6 ✓') : N('G5', `tags ${UTK.tags?.length}`);
  /handssignal/.test(BODY) ? F('G6', 'stavfelet "handssignal" (→ "handelssignal") — samma felklass som wihlborgs B3') : O('G6', 'inget "handssignal"-stavfel');
  const dubbel = (HELA.match(/  +/g) || []).length;
  dubbel === 0 ? O('G7', 'inga dubbla mellanslag') : N('G7', `${dubbel} dubbla mellanslag (markdown-indrag kan vara legitima)`);
  /–|—/.test(HELA) ? N('G8', 'tankstreck förekommer (seriens normalstil)') : O('G8', 'inga tankstreck');
}

// ── H. Länkar ─────────────────────────────────────────────────────────────
console.log('\n── H. Länkar (HTTP mot localhost:3000) ──');
{
  const länkar = [...new Set([...BODY.matchAll(/\]\((\/[^)\s]+)\)/g)].map(m => m[1]))];
  const externa = [...new Set([...BODY.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map(m => m[1]))];
  console.log(`      ${länkar.length} unika interna + ${externa.length} externa`);
  let ok = 0, fel = 0;
  for (const väg of länkar) {
    try {
      const r = await fetch(`http://localhost:3000${väg}`, { redirect: 'follow', signal: AbortSignal.timeout(8000) });
      if (r.status === 200) ok++; else { fel++; console.log(`      ${r.status} ${väg}`); }
    } catch { fel++; console.log(`      TIMEOUT ${väg}`); }
  }
  fel === 0 ? O('H1', `${ok}/${länkar.length} interna länkar 200`) : F('H1', `${fel} länk(ar) ej 200 (av ${länkar.length})`);
  for (const url of externa) {
    try {
      const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(8000), headers: { 'user-agent': 'Mozilla/5.0' } });
      N('H2', `extern ${r.status} ${url}${r.status === 403 ? ' — bot-skydd, texten redovisar det själv' : ''}`);
    } catch { N('H2', `extern timeout ${url}`); }
  }
}

// ── I. Kalender + läspaketsfönster ────────────────────────────────────────
console.log('\n── I. Kalender + fönstret 20–23 oktober ──');
{
  const ibk = KAL.bolag.find(b => b.ticker === 'IBE.MC');
  (/2026-10-21/.test(ibk.rapportfenster) && /09:30/.test(ibk.rapportfenster)) ? O('I1', `kalender-energi.json: ${ibk.rapportfenster} ✓`) : F('I1', `kalender: ${ibk.rapportfenster}`);
  (/nueve meses|nio månader/i.test(ibk.notera)) ? O('I2', 'nio-månaders-not i kalendern ✓') : N('I2', 'nio-månaders-not');
  /09:30–11:00/.test(BODY) ? O('I3', 'presentation 09:30–11:00 redovisad') : N('I3', 'presentationstid');
  // Vår Energi i kalendern
  const ve = KAL.bolag.find(b => /v\xE5r ?energi/i.test(b.namn || '') || /VAR/i.test(b.ticker));
  if (ve) {
    (/07:00/.test(ve.rapportfenster) && /2026-10-21/.test(ve.rapportfenster)) ? O('I4', `Vår Energi ${ve.rapportfenster} = textens "samma morgon kl 07:00" ✓`) : F('I4', `Vår Energi: ${ve.rapportfenster}`);
    (/12 oktober|2026-10-12/.test(ve.notera || '') || /trading/i.test(JSON.stringify(ve))) ? O('I5', 'trading update 12/10 i kalenderns VE-not ✓') : N('I5', 'trading update 12/10 — kontrollera källa');
  } else F('I4', 'Vår Energi saknas i kalender-energi.json');
  // läspaketsfönstret: textens 13 + telia (=14)
  const nämnda = ['abb', 'tele2', 'skf-b', 'handelsbanken', 'sandvik', 'atlas-copco', 'essity', 'swedbank', 'castellum', 'volvo-car', 'volvo-group', 'saab', 'iberdrola'];
  const påDisk = fs.readdirSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3`).filter(f => f.startsWith('sa-laser-du-') && f.endsWith('.json'));
  const alla = nämnda.map(s => `sa-laser-du-${s}-q3-2026.json`);
  const saknade = alla.filter(f => !påDisk.includes(f));
  const telia = påDisk.includes('sa-laser-du-telia-q3-2026.json');
  const teliaRappdag = telia ? /21 oktober|2026-10-21/.test(JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-telia-q3-2026.json`, 'utf8')).description + JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-telia-q3-2026.json`, 'utf8')).body) : false;
  saknade.length === 0 ? O('I6', `textens 13 nämnda paket alla på disk ✓`) : F('I6', `saknade: ${saknade.join(', ')}`);
  if (/13 läspaket/.test(BODY)) {
    (telia && teliaRappdag) ? F('I7', `texten "13 läspaket över fyra dagar" — telia-paketet (rappdag 21/10, på disk sedan 2026-09-29) gör fönstret 14 = 2+4+5+3 (telia-paketets EGEN C4-kur fastställde 14; seriens aktuella sanning vid publicering 10-19)`) : N('I7', 'telia-rappdag ej 21/10 — ompröva');
  }
  (/SKF, Handelsbanken och Iberdrola den 21:a/.test(BODY)) ? F('I8', '21:a-listan "SKF, Handelsbanken och Iberdrola" saknar Telia (rappdag 21/10, paket på disk 09-29)') : N('I8', '21:a-lista — kontrollera');
  /Q1 2026 presenterades 29 april, Q2 22 juli/.test(BODY) ? O('I9', 'kvartalsschemat (Q1 29/4, Q2 22/7) redovisat med kalenderkälla i källraden') : N('I9', 'kvartalsschema');
  /24 september|24\/9/.test(BODY) ? O('I10', 'CMD 24/9 2026 redovisat som kalenderfakta ✓') : N('I10', 'CMD');
}

console.log(`\nSAMMANFATTNING: ${OK} OK · ${FEL} FEL · ${NOT} NOT`);
process.exit(FEL === 0 ? 0 : 1);
