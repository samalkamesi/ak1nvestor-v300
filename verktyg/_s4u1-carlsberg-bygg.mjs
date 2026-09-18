#!/usr/bin/env node
// Byggskript s4-u1 (manifest auto-s4-1789764325017) — Carlsberg Q3-läspaket.
// Motorräknar samtliga tal ur bolagsuniversumets CARL-B.CO-post + konsumentmedianer.
// KVD:n (verktyg/_s4u1-carlsberg-kvd.mjs) räknar OM allt oberoende.
import { readFileSync } from 'node:fs';

const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const u = JSON.parse(readFileSync(UNI, 'utf8'));
const list = Array.isArray(u) ? u : (u.bolag || u.universum);
const p = list.find(x => x.ticker === 'CARL-B.CO');

const pct = (x, d = 2) => (x * 100).toFixed(d);
const sv = (x, d = 0) => x.toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/\u00A0/g, ' ');
const median = a => { const s = a.filter(v => v !== null && v !== undefined && Number.isFinite(v)).sort((x, y) => x - y); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const rankDesc = (a, v) => { const s = a.filter(x => Number.isFinite(x)).sort((x, y) => y - x); return { rang: s.indexOf(v) + 1, n: s.length }; };
const rankAsc = (a, v) => { const s = a.filter(x => Number.isFinite(x)).sort((x, y) => x - y); return { rang: s.indexOf(v) + 1, n: s.length }; };

console.log('===== CARL-B.CO-post (källa ' + p.hamtat + ') =====');
console.log('pris:', p.pris, 'DKK | mcap-fält:', p.marknadsKapitalMdr);
console.log('vardering:', JSON.stringify(p.vardering));
console.log('lonksamhet:', JSON.stringify(p.lonksamhet));
console.log('stabilitet:', JSON.stringify(p.stabilitet));

// ===== Serier =====
const ar = p.serier.ar, oms = p.serier.omsattning.map(x => x / 1e6), res = p.serier.resultat.map(x => x / 1e6);
console.log('\n===== Serier (MDKK) =====');
for (let i = 0; i < ar.length; i++) console.log(ar[i], 'oms', sv(oms[i]), 'res', sv(res[i]), 'nettomarginal härledd', pct(res[i] / oms[i]));
const cagr = (a, b, n) => Math.pow(b / a, 1 / n) - 1;
console.log('oms-CAGR replik (3 steg):', pct(cagr(oms[0], oms[3], 3), 2), '| fält:', pct(p.tillvaxt.omsattningCAGR5ar, 2));
console.log('res-CAGR-fält:', p.tillvaxt.resultatCAGR5ar, '(null — negativa basår 2022 OCH 2023)');
console.log('oms-steg:', oms.slice(1).map((v, i) => pct(v / oms[i] - 1, 2)).join(' / '));
console.log('res-steg 2023→2024→2025:', pct(res[2] / res[1] - 1, 2), '/(teckenvänd)', '/', pct(res[3] / res[2] - 1, 2));
const ttmOms = oms[3] * (1 + p.tillvaxt.omsattningTillvaxtTTM);
console.log('TTM-omsättning:', sv(ttmOms), 'MDKK');

// ===== Datavakten =====
const { pe, pb, evEbit, peg } = p.vardering;
const { roe, bruttoMarginal, ebitMarginal, nettoMarginal, fcfMarginal } = p.lonksamhet;
const ident = pb / roe;
console.log('\n===== Datavakten =====');
console.log('IDENTITET: P/B ÷ ROE =', pb, '÷', roe, '=', ident.toFixed(3), 'mot P/E', pe, '=> avvikelse', pct(Math.abs(pe - ident) / pe, 2), '%');
const nettoTTM = nettoMarginal * ttmOms;
const mcapPE = pe * nettoTTM / 1000, ekROE = nettoTTM / roe / 1000, mcapPB = pb * ekROE;
console.log('netto TTM (' + pct(nettoMarginal) + ' % × TTM-oms):', sv(nettoTTM), 'MDKK | bokförd 2025:', sv(res[3]));
console.log('MCAP P/E-vägen:', mcapPE.toFixed(1), 'mdr | EK ur ROE:', ekROE.toFixed(1), 'mdr | MCAP P/B-vägen:', mcapPB.toFixed(1), 'mdr');
console.log('  spridning mellan vägarna:', pct(Math.abs(mcapPE - mcapPB) / mcapPE, 1), '%');
console.log('  P/E på bokförd 2025-vinst: P/E-vägen', (mcapPE * 1000 / res[3]).toFixed(1), '| P/B-vägen', (mcapPB * 1000 / res[3]).toFixed(1));
console.log('  TTM netto över bokförd:', pct(nettoTTM / res[3] - 1, 1));
const pegConv = pe / (p.tillvaxt.prognosTillvaxt * 100);
console.log('PEG: källa', peg, 'mot konvention P/E ÷ prognos% =', pe, '÷', pct(p.tillvaxt.prognosTillvaxt, 2), '=', pegConv.toFixed(2), '| kvot', (peg / pegConv).toFixed(2));
console.log('  implicit tillväxt i källans PEG: P/E ÷', peg, '=', (pe / peg).toFixed(2), '%');
const skuldKvot = p.stabilitet.skuldEgenkapital;
const skuld = ekROE * skuldKvot, evKedja = ekROE + skuld;
const ebitTTM = ebitMarginal * ttmOms;
console.log('EV-KEDJA: EK', ekROE.toFixed(1), '+ skuld (' + skuldKvot + ' × EK)', skuld.toFixed(1), '= EV', evKedja.toFixed(1), 'mdr');
console.log('  EBIT TTM (' + pct(ebitMarginal) + ' % × TTM-oms):', sv(ebitTTM), 'MDKK');
console.log('  kedje-multipel EV ÷ EBIT-TTM =', (evKedja * 1000 / ebitTTM).toFixed(2), 'mot fält', evEbit, '=> kvot', (evKedja * 1000 / ebitTTM / evEbit).toFixed(2));
const evFalt = evEbit * ebitTTM / 1000;
console.log('  fältvägens EV:', evFalt.toFixed(1), 'mdr — residual mot kedjan:', (evFalt - evKedja).toFixed(1), 'mdr');
console.log('  fältvägan − skuld =', (evFalt - skuld).toFixed(1), 'mdr mot mcap P/E-vägen', mcapPE.toFixed(1), '=> lucka', (evFalt - skuld - mcapPE).toFixed(1), 'mdr');
console.log('  fältvägan − skuld mot mcap P/B-vägen:', (evFalt - skuld).toFixed(1), 'mot', mcapPB.toFixed(1), '=> lucka', (evFalt - skuld - mcapPB).toFixed(1), 'mdr =', pct(Math.abs(evFalt - skuld - mcapPB) / mcapPB, 1), '%');
console.log('FCF-PARET: fcfMarginal', pct(fcfMarginal, 2), '% × TTM-oms =', sv(fcfMarginal * ttmOms), 'MDKK mot netto', sv(nettoTTM), '=> kvot', (fcfMarginal / nettoMarginal).toFixed(3));

// DuPont
const havstang = 1 + skuldKvot;
const kapOms = roe / (nettoMarginal * havstang);
console.log('DuPONT: ROE', pct(roe, 2), '= netto', pct(nettoMarginal, 2), '× kapitalomsättning', kapOms.toFixed(3), '× hävstång', havstang.toFixed(4));
console.log('  kontroll:', pct(nettoMarginal * kapOms * havstang, 2));

// Multiplövning
console.log('MULTIPLÖVNING: P/E', pe, '÷', (1 + p.tillvaxt.prognosTillvaxt).toFixed(4), '=', (pe / (1 + p.tillvaxt.prognosTillvaxt)).toFixed(2), '| ÷', (1 + p.tillvaxt.omsattningTillvaxtTTM).toFixed(4), '(TTM) =', (pe / (1 + p.tillvaxt.omsattningTillvaxtTTM)).toFixed(2), '| ÷', (1 + p.tillvaxt.omsattningCAGR5ar).toFixed(4), '(CAGR) =', (pe / (1 + p.tillvaxt.omsattningCAGR5ar)).toFixed(2));

// ===== Medianer konsumentgren + universum (färsk 189-postfil) =====
const kons = list.filter(x => x.bransch === 'konsument');
console.log('\n===== MEDIANER (ur ' + list.length + '-postfilen; konsument n=' + kons.length + ') =====');
const meas = {
  'P/E': x => x.vardering?.pe, 'P/B': x => x.vardering?.pb, 'EV/EBIT': x => x.vardering?.evEbit,
  'PEG': x => x.vardering?.peg, 'ROE': x => x.lonksamhet?.roe, 'ROIC': x => x.lonksamhet?.roic,
  'Brutto': x => x.lonksamhet?.bruttoMarginal, 'EBIT-marg': x => x.lonksamhet?.ebitMarginal,
  'Netto-marg': x => x.lonksamhet?.nettoMarginal, 'FCF-marg': x => x.lonksamhet?.fcfMarginal,
  'Oms-CAGR': x => x.tillvaxt?.omsattningCAGR5ar, 'Res-CAGR': x => x.tillvaxt?.resultatCAGR5ar,
  'Skuld/EK': x => x.stabilitet?.skuldEgenkapital
};
const carlVal = { 'P/E': pe, 'P/B': pb, 'EV/EBIT': evEbit, 'PEG': peg, 'ROE': roe, 'ROIC': p.lonksamhet.roic, 'Brutto': bruttoMarginal, 'EBIT-marg': ebitMarginal, 'Netto-marg': nettoMarginal, 'FCF-marg': fcfMarginal, 'Oms-CAGR': p.tillvaxt.omsattningCAGR5ar, 'Res-CAGR': p.tillvaxt.resultatCAGR5ar, 'Skuld/EK': skuldKvot };
// Multipler (P/E, P/B, EV/EBIT, PEG) ligger i filen i gånger-form — skrivs råa;
// andelar (roe, marginaler, CAGR, skuldkvot) ligger som andelar — skrivs i procent.
const FLER = new Set(['P/E', 'P/B', 'EV/EBIT', 'PEG']);
const fmt = (namn, v) => v === null || v === undefined ? 'null' : (FLER.has(namn) ? v.toFixed(2).padStart(7) : pct(v, 2).padStart(7));
for (const [namn, f] of Object.entries(meas)) {
  const kArr = kons.map(f), uArr = list.map(f);
  const kMed = median(kArr), uMed = median(uArr);
  const v = carlVal[namn];
  const r = v === null || v === undefined ? { rang: '-', n: kArr.filter(Number.isFinite).length } : rankDesc(kArr, v);
  console.log(namn.padEnd(10), 'CARL', fmt(namn, v), '| kons-med', fmt(namn, kMed), '(n=' + kArr.filter(Number.isFinite).length + ')', '| uni-med', fmt(namn, uMed), '(n=' + uArr.filter(Number.isFinite).length + ')', '| rang desc', r.rang + '/' + r.n);
}
// skuldkvot rankas uppåt (lägre = bättre) men redovisas som desc-rang för läge
const skArr = kons.map(meas['Skuld/EK']);
console.log('Skuld/EK rang stigande (lägst först):', rankAsc(skArr, skuldKvot));

// ===== Scenarioruta (EBIT, 2025-bas) =====
const basOms = oms[3], basMarg = ebitMarginal;
console.log('\n===== SCENARIORUTA EBIT (MDKK), bas 2025: oms', sv(basOms), '× marginal', pct(basMarg), '% =', sv(basOms * basMarg), '=====');
for (const dm of [-0.01, 0, 0.01]) {
  const rad = [];
  for (const doms of [-0.03, 0, 0.03]) rad.push(sv(basOms * (1 + doms) * (basMarg + dm)));
  console.log('marginal', pct(basMarg + dm), ':', rad.join(' | '));
}
console.log('1 pp marginal =', sv(basOms * 0.01), 'MDKK | 3 % intäkter =', sv(basOms * basMarg * 0.03), 'MDKK');
console.log('marginalvikt = 1 ÷ (3 × marginalnivå) = 1 ÷', (3 * basMarg).toFixed(4), '=', (1 / (3 * basMarg)).toFixed(2));
console.log('marginalvikt brutto = 1 ÷ (3 ×', pct(bruttoMarginal), ') =', (1 / (3 * bruttoMarginal)).toFixed(2));

// ===== Seriepaketsräkning =====
const { readdirSync } = await import('node:fs');
const q3 = readdirSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3').filter(f => f.startsWith('sa-laser-du'));
console.log('\n===== SERIEN: ' + q3.length + ' levererade paket på disk — Carlsberg = paket nummer', (q3.length + 1), '=====');
const konsPaket = ['hm-b', 'nike', 'volvo-car', 'essity', 'electrolux'];
console.log('konsumentgrenens paket hittills (branschfältet=konsument):', konsPaket.join(', '), '=> Carlsberg = grenens', ['första','andra','tredje','fjärde','femte','sjätte','sjunde'][konsPaket.length], 'paket enligt filens branschräkning');
