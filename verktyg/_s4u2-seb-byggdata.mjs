// Byggdata för SEB Q3-2026-läspaketet — ALLA tal som texten bygger på, maskinellt.
// KVD-skriptet (verktyg/_s4u2-kvd-seb.mjs) verifierar textens tal mot samma formler.
import fs from 'node:fs';
const U = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const b = U.find(x => x.ticker === 'SEB-A.ST');
const r2 = (x) => Math.round(x * 100) / 100;
const r1 = (x) => Math.round(x * 10) / 10;
const med = (a) => { const v = a.filter(x => typeof x === 'number' && isFinite(x)).sort((x, y) => x - y); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const rank = (a, own) => a.filter(x => typeof x === 'number' && isFinite(x) && x < own).length + 1; // rang = antal strikt lägre + 1

const out = {};
// KÄLNTAL
out.kalla = { pris: b.pris, mcap: b.marknadsKapitalMdr, pe: b.vardering.pe, pb: b.vardering.pb, evEbit: b.vardering.evEbit, peg: b.vardering.peg, roe: b.lonksamhet.roe, ebitM: b.lonksamhet.ebitMarginal, nettoM: b.lonksamhet.nettoMarginal, bruttoM: b.lonksamhet.bruttoMarginal, progT: b.tillvaxt.prognosTillvaxt, ttm: b.tillvaxt.omsattningTillvaxtTTM, omsCagr: b.tillvaxt.omsattningCAGR5ar, resCagr: b.tillvaxt.resultatCAGR5ar, hamtat: b.hamtat, ar: b.serier.ar, oms: b.serier.omsattning, res: b.serier.resultat };
// IDENTITET båda vägrarna
out.identitet = { fram: r2(b.vardering.pb / b.lonksamhet.roe), peKalla: b.vardering.pe, avvPct: r2((b.vardering.pe - b.vardering.pb / b.lonksamhet.roe) / b.vardering.pe * 100), bak: r2(b.vardering.pe * b.lonksamhet.roe), pbKalla: b.vardering.pb, avvBakPct: r2((b.vardering.pe * b.lonksamhet.roe - b.vardering.pb) / b.vardering.pb * 100) };
// IMPLICITA
out.implicit = { eps: r2(b.pris / b.vardering.pe), vinstMdr: r1(b.marknadsKapitalMdr / b.vardering.pe), ekMdr: r1(b.marknadsKapitalMdr / b.vardering.pb), roeKorsPct: r2(b.marknadsKapitalMdr / b.vardering.pe / (b.marknadsKapitalMdr / b.vardering.pb) * 100), roeFaltPct: r2(b.lonksamhet.roe * 100), roeKorsAvvPct: r2((b.marknadsKapitalMdr / b.vardering.pe / (b.marknadsKapitalMdr / b.vardering.pb) - b.lonksamhet.roe) / b.lonksamhet.roe * 100) };
// ABSOLUTKONTROLL
const res2025Mkr = b.serier.resultat[3];
out.absolut = { peGanger: r1(b.vardering.pe * res2025Mkr / 1000), mcap: b.marknadsKapitalMdr, residualPct: r2((b.vardering.pe * res2025Mkr / 1000 - b.marknadsKapitalMdr) / b.marknadsKapitalMdr * 100), ttmAvvikPct: r2((b.marknadsKapitalMdr / b.vardering.pe * 1000 - res2025Mkr) / res2025Mkr * 100) };
// PEG
out.peg = { kalla: b.vardering.peg, konvention: r2(b.vardering.pe / (b.tillvaxt.prognosTillvaxt * 100)), kvot: r2(b.vardering.peg / (b.vardering.pe / (b.tillvaxt.prognosTillvaxt * 100))), implicitTillvaxtPct: r2(b.vardering.pe / b.vardering.peg) };
// CAGR + STEG + MARGINALSERIE
const o = b.serier.omsattning, rr = b.serier.resultat;
out.cagr = { omsEgen: r2(((o[3] / o[0]) ** (1 / 3) - 1) * 100), omsFalt: r2(b.tillvaxt.omsattningCAGR5ar * 100), resEgen: r2(((rr[3] / rr[0]) ** (1 / 3) - 1) * 100), resFalt: r2(b.tillvaxt.resultatCAGR5ar * 100) };
out.steg = { oms: [r2((o[1] / o[0] - 1) * 100), r2((o[2] / o[1] - 1) * 100), r2((o[3] / o[2] - 1) * 100)], res: [r2((rr[1] / rr[0] - 1) * 100), r2((rr[2] / rr[1] - 1) * 100), r2((rr[3] / rr[2] - 1) * 100)] };
out.nettoSerie = rr.map((x, i) => r2(x / o[i] * 100));
// MEDIANER + RANG (finans + universum, ur 171-filen)
const F = U.filter(x => x.bransch === 'finans');
out.finans = { n: F.length, pe: { n: F.filter(x => x.vardering.pe != null).length, med: r2(med(F.map(x => x.vardering.pe))) }, pb: { n: F.filter(x => x.vardering.pb != null).length, med: r2(med(F.map(x => x.vardering.pb))) }, roe: { n: F.filter(x => x.lonksamhet.roe != null).length, medPct: r2(med(F.map(x => x.lonksamhet.roe)) * 100) }, ebit: { n: F.filter(x => x.lonksamhet.ebitMarginal != null).length, medPct: r2(med(F.map(x => x.lonksamhet.ebitMarginal)) * 100) }, netto: { n: F.filter(x => x.lonksamhet.nettoMarginal != null).length, medPct: r2(med(F.map(x => x.lonksamhet.nettoMarginal)) * 100) }, evEbit: { n: F.filter(x => x.vardering.evEbit != null).length, med: r2(med(F.map(x => x.vardering.evEbit))) }, peg: { n: F.filter(x => x.vardering.peg != null).length, med: r2(med(F.map(x => x.vardering.peg))) } };
out.rang = { peAv: rank(F.map(x => x.vardering.pe), b.vardering.pe), pbAv: rank(F.map(x => x.vardering.pb), b.vardering.pb), roeAv: rank(F.map(x => x.lonksamhet.roe), b.lonksamhet.roe), ebitAv: rank(F.map(x => x.lonksamhet.ebitMarginal), b.lonksamhet.ebitMarginal), nettoAv: rank(F.map(x => x.lonksamhet.nettoMarginal), b.lonksamhet.nettoMarginal) };
out.universum = { n: U.length, pe: { n: U.filter(x => x.vardering.pe != null).length, med: r2(med(U.map(x => x.vardering.pe))) }, pb: { n: U.filter(x => x.vardering.pb != null).length, med: r2(med(U.map(x => x.vardering.pb))) }, roe: { n: U.filter(x => x.lonksamhet.roe != null).length, medPct: r2(med(U.map(x => x.lonksamhet.roe)) * 100) } };
// SCENARIORUTA på 2025-basen: intäkter ±3 %, EBIT-marginal ±1 pp
const om25 = o[3], m25 = b.lonksamhet.ebitMarginal;
const rad = [om25 * 0.97, om25, om25 * 1.03], kol = [m25 - 0.01, m25, m25 + 0.01];
out.scen = { basMkr: om25, basMargPct: r2(m25 * 100), basEbit: r1(om25 * m25), rader: rad.map(x => r1(x)), celler: rad.map(rd => kol.map(k => r1(rd * k))), enPp: r1(om25 * 0.01), treProc: r1(om25 * 0.03 * m25), rattKvot: r2(om25 * 0.03 * m25 / (om25 * 0.01)), marginalvikt: r2(1 / (3 * m25)) };
// MULTIPPLÖVNING
out.multipl = { framPe: r2(b.vardering.pe / (1 + b.tillvaxt.prognosTillvaxt)) };
// P/B–ROE-RANKNING (fyra storbanker ur filen)
out.banker = ['SHB-A.ST', 'SEB-A.ST', 'NDA-SE.ST', 'SWED-A.ST'].map(t => { const x = U.find(y => y.ticker === t); return { t, pb: x.vardering.pb, roePct: r2(x.lonksamhet.roe * 100), pe: x.vardering.pe }; });
console.log(JSON.stringify(out, null, 1));
