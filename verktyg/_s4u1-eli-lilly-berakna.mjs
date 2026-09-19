// _s4u1-eli-lilly-berakna.mjs — medianer/rang + kontrollberäkningar för LLY-paketet
// Källa: data/portfolj-system/bolagsunivers.json (2026-09-03-posten för LLY)
import { readFileSync } from 'node:fs';

const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const poster = Array.isArray(U) ? U : (U.poster || U.bolag || U.universum || []);
const L = poster.find(p => p.ticker === 'LLY');
const halso = poster.filter(p => p.bransch === 'halso');

const med = (arr) => {
  const v = arr.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};
const rang = (arr, val, dir = 'desc') => {
  const v = arr.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => dir === 'desc' ? b - a : a - b);
  return { rang: v.indexOf(val) + 1, n: v.length };
};

const f = (x) => [
  ['PE', x.vardering?.pe], ['PB', x.vardering?.pb], ['PEG', x.vardering?.peg],
  ['ROE', x.lonksamhet?.roe], ['EBITm', x.lonksamhet?.ebitMarginal],
  ['NETTOm', x.lonksamhet?.nettoMarginal], ['BRUTo', x.lonksamhet?.bruttoMarginal],
  ['PROG', x.tillvaxt?.prognosTillvaxt], ['TTM', x.tillvaxt?.omsattningTillvaxtTTM],
  ['SKULD', x.stabilitet?.skuldEgenkapital], ['EVEBIT', x.vardering?.evEbit],
];

console.log('=== POSTER TOTALT:', poster.length, '| hälsogrenen:', halso.length);

constmap: {
  const rad = (namn, nyckel, dir) => {
    const grenV = halso.map(p => ({ t: p.ticker, v: nyckel(p) })).filter(x => x.v !== null && x.v !== undefined);
    const uniV = poster.map(p => nyckel(p)).filter(x => x !== null && x !== undefined);
    const lly = nyckel(L);
    const g = rang(grenV.map(x => x.v), lly, dir);
    const u = rang(uniV, lly, dir);
    console.log(`${namn} | LLY ${typeof lly === 'number' ? lly.toFixed(4) : lly} | grenmedian ${med(grenV.map(x => x.v))?.toFixed(4)} (n=${grenV.length}) | gren-rang ${g.rang}/${g.n} (${dir === 'desc' ? 'högst=1' : 'lägst=1'}) | universummedian ${med(uniV)?.toFixed(4)} (n=${uniV.length}) | uni-rang ${u.rang}/${u.n}`);
  };
  rad('P/E      ', p => p.vardering?.pe, 'desc');
  rad('P/B      ', p => p.vardering?.pb, 'desc');
  rad('EV/EBIT  ', p => p.vardering?.evEbit, 'desc');
  rad('PEG      ', p => p.vardering?.peg, 'desc');
  rad('ROE      ', p => p.lonksamhet?.roe, 'desc');
  rad('ROIC     ', p => p.lonksamhet?.roic, 'desc');
  rad('brutto   ', p => p.lonksamhet?.bruttoMarginal, 'desc');
  rad('EBIT-marg', p => p.lonksamhet?.ebitMarginal, 'desc');
  rad('netto    ', p => p.lonksamhet?.nettoMarginal, 'desc');
  rad('FCF-marg ', p => p.lonksamhet?.fcfMarginal, 'desc');
  rad('FCF-yield', p => p.vardering?.fcfYield, 'desc');
  rad('prognos  ', p => p.tillvaxt?.prognosTillvaxt, 'desc');
  rad('TTM      ', p => p.tillvaxt?.omsattningTillvaxtTTM, 'desc');
  rad('omsCAGR  ', p => p.tillvaxt?.omsattningCAGR5ar, 'desc');
  rad('resCAGR  ', p => p.tillvaxt?.resultatCAGR5ar, 'desc');
  rad('skuld/EK ', p => p.stabilitet?.skuldEgenkapital, 'desc');
  rad('insider  ', p => p.aterkop?.insiderkopSenaste6man, 'desc');
}

console.log('\n=== KONTROLLBERÄKNINGAR (LLY) ===');
const mcap = 1034.491, pris = 1160.08, PE = 38.916, PB = 30.527, EVEBIT = 25.002,
  ROE = 1.0229, EBITm = 0.5422, NETTOm = 0.3353, BRUTTOm = 0.834, FCFF = 0.1389,
  FCFY = 0.0107, skuldEK = 1.6207, PEGk = 1.12, prognos = 0.2872, TTMf = 0.477;
const om = [28541, 34124.1, 45042.7, 65179]; // MUSD
const res = [6244.8, 5240.4, 10590, 20640];

const ek = mcap / PB;
const vinstPE = mcap / PE;
const vinstROE = ROE * ek;
const skuld = skuldEK * ek;
const ev = mcap + skuld;
const ttmRev = 17600 + 19300 + 19800 + 22970; // MUSD sökverifierade kvartal
const ttmEBIT = EBITm * ttmRev;
const evFalt = EVEBIT * ttmEBIT;
const fcfY = FCFY * mcap;
const fcfM = FCFF * ttmRev;
console.log(`EK implicit = ${ek.toFixed(3)} mdr | aktier = ${(mcap * 1000 / pris).toFixed(1)} M | EPS-vektor FY25 = ${(res[3] / (mcap * 1000 / pris)).toFixed(2)}`);
console.log(`P/E-nämnare (vinst) = ${vinstPE.toFixed(3)} GUSD | ROE-vinst = ${vinstROE.toFixed(3)} GUSD | glidning ${(vinstROE / vinstPE).toFixed(3)}x`);
console.log(`skuld = ${skuld.toFixed(3)} | EV = ${ev.toFixed(3)} | TTM-rev = ${ttmRev} | TTM-EBIT = ${ttmEBIT.toFixed(1)} | EV/EBIT-fält×TTM-EBIT = ${evFalt.toFixed(1)} | kedjebrott ${((evFalt / ev - 1) * 100).toFixed(2)} %`);
console.log(`FCF-yield-väg = ${fcfY.toFixed(3)} | FCF-marginal-väg = ${fcfM.toFixed(3)} | kvot ${(fcfY / fcfM).toFixed(4)}`);
console.log(`identitet P/B÷ROE = ${(PB / ROE).toFixed(3)} mot P/E ${PE} → brott ${(((PB / ROE) / PE - 1) * 100).toFixed(2)} %`);
console.log(`absolutkontroll bokförd FY25: P/E × 20,640 = ${(PE * 20.640).toFixed(1)} mot mcap → residual ${((PE * 20.64 / mcap - 1) * 100).toFixed(2)} %`);
console.log(`TTM-rev × netto-marginal = ${(ttmRev * NETTOm / 1000).toFixed(3)} GUSD mot P/E-nämnare ${vinstPE.toFixed(3)} → kvot ${(ttmRev * NETTOm / 1000 / vinstPE).toFixed(4)}`);
console.log(`CAGR om: ${((om[3] / om[0]) ** (1 / 3) - 1).toFixed(4)} (fält 0,3169) | CAGR res: ${((res[3] / res[0]) ** (1 / 3) - 1).toFixed(4)} (fält 0,4896)`);
console.log(`steg om: ${((om[1] / om[0] - 1) * 100).toFixed(1)} / ${((om[2] / om[1] - 1) * 100).toFixed(1)} / ${((om[3] / om[2] - 1) * 100).toFixed(1)} %`);
console.log(`steg res: ${((res[1] / res[0] - 1) * 100).toFixed(1)} / ${((res[2] / res[1] - 1) * 100).toFixed(1)} / ${((res[3] / res[2] - 1) * 100).toFixed(1)} %`);
console.log(`nettomarginaler: ${(res[0] / om[0] * 100).toFixed(2)} / ${(res[1] / om[1] * 100).toFixed(2)} / ${(res[2] / om[2] * 100).toFixed(2)} / ${(res[3] / om[3] * 100).toFixed(2)} %`);
console.log(`PEG konvention = P/E ÷ (prognos×100) = ${(PE / (prognos * 100)).toFixed(4)} mot källa ${PEGk} → kvot ${(PEGk / (PE / (prognos * 100))).toFixed(3)} | implicit nämnare ${(PE / PEGk).toFixed(2)} %`);
console.log(`marginalvikt netto = 1/(3×NETTOm) = ${(1 / (3 * NETTOm)).toFixed(3)} | 1 pp marginal på TTM-rev = ${(ttmRev * 0.01 / 1000).toFixed(3)} GUSD | 3 % volym = ${(ttmRev * 0.03 / 1000).toFixed(3)} GUSD`);
console.log(`DuPont: netto×turnover(TTM) = ${NETTOm} × ${(ttmRev / 1000 / ek).toFixed(4)} = ${(NETTOm * (ttmRev / 1000 / ek) * 100).toFixed(1)} % mot fält-ROE 102,29 %`);
console.log(`DuPont FY25: ${NETTOm} × ${(om[3] / 1000 / ek).toFixed(4)} = ${(NETTOm * (om[3] / 1000 / ek) * 100).toFixed(1)} %`);
console.log(`PEG-par: källa×TTM? ${PEGk}×${TTMf * 100} = ${(PEGk * TTMf * 100).toFixed(2)} mot P/E ${PE}`);
console.log(`vägledningskontroll: FY26 82–85 → 85–87 mdr; FY25 slutlig 65,179 mot Q3-25-vägledning 63,0–63,5`);
console.log(`kvartalsserie: Q1-25 ≈ ${(19800 / 1.56).toFixed(0)} (härledd +56 %), Q2-25 ≈ ${(22970 / 1.48).toFixed(0)} (härledd +48 %)`);
