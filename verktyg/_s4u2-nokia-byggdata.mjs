// Byggdata för Nokia Q3-2026-läspaketet — ALLA tal som texten bygger på, maskinellt.
import fs from 'node:fs';
const U = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const b = U.find(x => x.ticker === 'NOKIA.HE');
const er = U.find(x => x.ticker === 'ERIC-B.ST');
const r2 = (x) => Math.round(x * 100) / 100;
const r1 = (x) => Math.round(x * 10) / 10;
const med = (a) => { const v = a.filter(x => typeof x === 'number' && isFinite(x)).sort((x, y) => x - y); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const rank = (a, own) => a.filter(x => typeof x === 'number' && isFinite(x) && x < own).length + 1;
const out = {};
out.kalla = { pris: b.pris, mcap: b.marknadsKapitalMdr, pe: b.vardering.pe, pb: b.vardering.pb, evEbit: b.vardering.evEbit, peg: b.vardering.peg, fcfY: b.vardering.fcfYield, roe: b.lonksamhet.roe, roic: b.lonksamhet.roic, bruttoM: b.lonksamhet.bruttoMarginal, ebitM: b.lonksamhet.ebitMarginal, nettoM: b.lonksamhet.nettoMarginal, fcfM: b.lonksamhet.fcfMarginal, skuldEk: b.stabilitet.skuldEgenkapital, progT: b.tillvaxt.prognosTillvaxt, ttm: b.tillvaxt.omsattningTillvaxtTTM, omsCagr: b.tillvaxt.omsattningCAGR5ar, resCagr: b.tillvaxt.resultatCAGR5ar, hamtat: b.hamtat, ar: b.serier.ar, oms: b.serier.omsattning, res: b.serier.resultat };
// IDENTITET
out.identitet = { fram: r2(b.vardering.pb / b.lonksamhet.roe), peKalla: b.vardering.pe, avvPct: r2((b.vardering.pe - b.vardering.pb / b.lonksamhet.roe) / b.vardering.pe * 100), bak: r2(b.vardering.pe * b.lonksamhet.roe), pbKalla: b.vardering.pb, avvBakPct: r2((b.vardering.pe * b.lonksamhet.roe - b.vardering.pb) / b.vardering.pb * 100) };
// IMPLICITA + ABSOLUT
const res25 = b.serier.resultat[3];
out.implicit = { eps: r2(b.pris / b.vardering.pe * 100) / 100, vinstMdr: r1(b.marknadsKapitalMdr / b.vardering.pe), ekMdr: r1(b.marknadsKapitalMdr / b.vardering.pb), roeKorsPct: r2(b.marknadsKapitalMdr / b.vardering.pe / (b.marknadsKapitalMdr / b.vardering.pb) * 100), roeFaltPct: r2(b.lonksamhet.roe * 100) };
out.absolut = { peGangerMdr: r1(b.vardering.pe * res25 / 1000), mcap: b.marknadsKapitalMdr, residualPct: r2((b.vardering.pe * res25 / 1000 - b.marknadsKapitalMdr) / b.marknadsKapitalMdr * 100), ttmAvvikPct: r2((b.marknadsKapitalMdr / b.vardering.pe * 1000 - res25) / res25 * 100) };
// PEG
out.peg = { kalla: b.vardering.peg, konvention: r2(b.vardering.pe / (b.tillvaxt.prognosTillvaxt * 100)), kvot: r2(b.vardering.peg / (b.vardering.pe / (b.tillvaxt.prognosTillvaxt * 100))), implicitTillvaxtPct: r2(b.vardering.pe / b.vardering.peg) };
// CAGR/STEG/SERIER
const o = b.serier.omsattning, rr = b.serier.resultat;
out.cagr = { omsEgen: r2(((o[3] / o[0]) ** (1 / 3) - 1) * 100), omsFalt: r2(b.tillvaxt.omsattningCAGR5ar * 100), resEgen: r2(((rr[3] / rr[0]) ** (1 / 3) - 1) * 100), resFalt: r2(b.tillvaxt.resultatCAGR5ar * 100) };
out.steg = { oms: [r2((o[1] / o[0] - 1) * 100), r2((o[2] / o[1] - 1) * 100), r2((o[3] / o[2] - 1) * 100)], res: [r2((rr[1] / rr[0] - 1) * 100), r2((rr[2] / rr[1] - 1) * 100), r2((rr[3] / rr[2] - 1) * 100)] };
out.nettoSerie = rr.map((x, i) => r2(x / o[i] * 100));
// EV-KEDJA fem steg + FCF
const ekMdr = b.marknadsKapitalMdr / b.vardering.pb, skuldMdr = ekMdr * b.stabilitet.skuldEgenkapital, evKedja = ekMdr + skuldMdr;
const ebit25 = o[3] * b.lonksamhet.ebitMarginal;
out.evkedja = { ekMdr: r1(ekMdr), skuldMdr: r1(skuldMdr), evKedjaMdr: r1(evKedja), ebit25M: r1(ebit25), multKedja: r2(evKedja * 1000 / ebit25), multFalt: b.vardering.evEbit, kvot: r2(evKedja * 1000 / ebit25 / b.vardering.evEbit), evFaltMdr: r1(b.vardering.evEbit * ebit25 / 1000), residualMdr: r1(evKedja - b.vardering.evEbit * ebit25 / 1000) };
out.fcf = { marginalVagM: r1(o[3] * b.lonksamhet.fcfMarginal), yieldVagPct: r2(o[3] * b.lonksamhet.fcfMarginal / (b.marknadsKapitalMdr * 1000) * 100), yieldFaltPct: r2(b.vardering.fcfYield * 100), kvot: r2((o[3] * b.lonksamhet.fcfMarginal / (b.marknadsKapitalMdr * 1000) * 100) / (b.vardering.fcfYield * 100)) };
// MEDIANER + RANG teknik + universum
const T = U.filter(x => x.bransch === 'teknik');
out.teknik = { n: T.length, pe: { n: T.filter(x => x.vardering.pe != null).length, med: r2(med(T.map(x => x.vardering.pe))) }, pb: { n: T.filter(x => x.vardering.pb != null).length, med: r2(med(T.map(x => x.vardering.pb))) }, roe: { n: T.filter(x => x.lonksamhet.roe != null).length, medPct: r2(med(T.map(x => x.lonksamhet.roe)) * 100) }, ebit: { n: T.filter(x => x.lonksamhet.ebitMarginal != null).length, medPct: r2(med(T.map(x => x.lonksamhet.ebitMarginal)) * 100) }, netto: { n: T.filter(x => x.lonksamhet.nettoMarginal != null).length, medPct: r2(med(T.map(x => x.lonksamhet.nettoMarginal)) * 100) }, brutto: { n: T.filter(x => x.lonksamhet.bruttoMarginal != null).length, medPct: r2(med(T.map(x => x.lonksamhet.bruttoMarginal)) * 100) }, evEbit: { n: T.filter(x => x.vardering.evEbit != null).length, med: r2(med(T.map(x => x.vardering.evEbit))) }, peg: { n: T.filter(x => x.vardering.peg != null).length, med: r2(med(T.map(x => x.vardering.peg))) } };
out.rang = { peAv: rank(T.map(x => x.vardering.pe), b.vardering.pe), peN: T.filter(x => x.vardering.pe != null).length, pbAv: rank(T.map(x => x.vardering.pb), b.vardering.pb), pbN: T.filter(x => x.vardering.pb != null).length, roeAv: rank(T.map(x => x.lonksamhet.roe), b.lonksamhet.roe), roeN: T.filter(x => x.lonksamhet.roe != null).length, bruttoAv: rank(T.map(x => x.lonksamhet.bruttoMarginal), b.lonksamhet.bruttoMarginal), bruttoN: T.filter(x => x.lonksamhet.bruttoMarginal != null).length, nettoAv: rank(T.map(x => x.lonksamhet.nettoMarginal), b.lonksamhet.nettoMarginal), nettoN: T.filter(x => x.lonksamhet.nettoMarginal != null).length };
out.universum = { n: U.length, pe: { n: U.filter(x => x.vardering.pe != null).length, med: r2(med(U.map(x => x.vardering.pe))) }, pb: { n: U.filter(x => x.vardering.pb != null).length, med: r2(med(U.map(x => x.vardering.pb))) }, roe: { n: U.filter(x => x.lonksamhet.roe != null).length, medPct: r2(med(U.map(x => x.lonksamhet.roe)) * 100) } };
// SCENARIORUTA
const om25 = o[3], m25 = b.lonksamhet.ebitMarginal;
const rad = [om25 * 0.97, om25, om25 * 1.03], kol = [m25 - 0.01, m25, m25 + 0.01];
out.scen = { basMkr: om25, basMargPct: r2(m25 * 100), basEbit: r1(om25 * m25), rader: rad.map(x => r1(x)), celler: rad.map(rd => kol.map(k => r1(rd * k))), enPp: r1(om25 * 0.01), treProc: r1(om25 * 0.03 * m25), rattKvot: r2(om25 * 0.03 * m25 / (om25 * 0.01)), marginalvikt: r2(1 / (3 * m25)) };
out.multipl = { framPe: r2(b.vardering.pe / (1 + b.tillvaxt.prognosTillvaxt)) };
// DUOPOL-TVILLING Ericsson
out.ericsson = { pe: er.vardering.pe, pb: er.vardering.pb, evEbit: er.vardering.evEbit, roePct: r2(er.lonksamhet.roe * 100), ebitM: r2(er.lonksamhet.ebitMarginal * 100), nettoM: r2(er.lonksamhet.nettoMarginal * 100), bruttoM: r2(er.lonksamhet.bruttoMarginal * 100), fcfM: r2(er.lonksamhet.fcfMarginal * 100), mcap: er.marknadsKapitalMdr, omsCagrPct: r2(er.tillvaxt.omsattningCAGR5ar * 100), resCagrPct: r2(er.tillvaxt.resultatCAGR5ar * 100), ttmPct: r2(er.tillvaxt.omsattningTillvaxtTTM * 100), progPct: r2(er.tillvaxt.prognosTillvaxt * 100) };
console.log(JSON.stringify(out, null, 1));
