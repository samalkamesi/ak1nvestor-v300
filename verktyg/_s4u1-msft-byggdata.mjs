// _s4u1-msft-byggdata.mjs — beräkningsmotor för Microsoft Q3-läspaket 2026 (fabrik auto-s4-1789959329360-s4-u1).
// Läser MSFT-raden LIVE ur bolagsunivers.json, räknar teknikgrenens medianer + rang
// samt paketets alla härledningar, och skriver _s4u1-msft-berakning.json.
// ABORT-grind: null/ej-tal i bärande fält stannar bygget. Enheter: mdr USD genomgående.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const U = JSON.parse(readFileSync(UNI, 'utf8'));
const list = Array.isArray(U) ? U : (U.bolag || U.universum || U);
const d = list.find(x => x.ticker === 'MSFT');
if (!d) throw new Error('MSFT saknas i universumet');

const bär = {
  pris: d.pris, mcap: d.marknadsKapitalMdr,
  pe: d.vardering?.pe, pb: d.vardering?.pb, evEbit: d.vardering?.evEbit,
  peg: d.vardering?.peg, fcfY: d.vardering?.fcfYield,
  roe: d.lonksamhet?.roe, brutto: d.lonksamhet?.bruttoMarginal,
  ebit: d.lonksamhet?.ebitMarginal, netto: d.lonksamhet?.nettoMarginal,
  fcfM: d.lonksamhet?.fcfMarginal, skuldEk: d.stabilitet?.skuldEgenkapital,
  omsCagr: d.tillvaxt?.omsattningCAGR5ar, resCagr: d.tillvaxt?.resultatCAGR5ar,
  prognos: d.tillvaxt?.prognosTillvaxt, ttm: d.tillvaxt?.omsattningTillvaxtTTM,
};
for (const [k, v] of Object.entries(bär)) {
  if (v === null || v === undefined || !Number.isFinite(v)) throw new Error(`ABORT: bärande fält ${k} är null/ej tal hos källan`);
}
const oms = d.serier.omsattning.map(v => v / 1e9);
const res = d.serier.resultat.map(v => v / 1e9);
if (oms.length < 4 || res.length < 4) throw new Error('ABORT: serier under 4 år');

// — teknikgrenen: medianer och rang, LIVE —
const gren = list.filter(x => x.bransch === 'teknik');
const val = (arr) => arr.filter(v => typeof v === 'number' && Number.isFinite(v)).sort((a, b) => a - b);
const median = (arr) => { const s = val(arr); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const rang = (arr, x, högre) => { const s = val(arr); const n = s.length; if (!n) return null; const pos = högre ? [...s].reverse().filter(v => v > x).length + 1 : s.filter(v => v < x).length + 1; return { pos, n }; };
const f = {
  pe: x => x.vardering?.pe, pb: x => x.vardering?.pb, evEbit: x => x.vardering?.evEbit, peg: x => x.vardering?.peg,
  fcfYield: x => x.vardering?.fcfYield, roe: x => x.lonksamhet?.roe, roic: x => x.lonksamhet?.roic,
  bruttoMarginal: x => x.lonksamhet?.bruttoMarginal, ebitMarginal: x => x.lonksamhet?.ebitMarginal,
  nettoMarginal: x => x.lonksamhet?.nettoMarginal, skuldEgenkapital: x => x.stabilitet?.skuldEgenkapital,
  omsattningTillvaxtTTM: x => x.tillvaxt?.omsattningTillvaxtTTM, omsattningCAGR5ar: x => x.tillvaxt?.omsattningCAGR5ar,
  prognosTillvaxt: x => x.tillvaxt?.prognosTillvaxt, fcfMarginal: x => x.lonksamhet?.fcfMarginal,
};
const högre = { fcfYield: 1, roe: 1, roic: 1, bruttoMarginal: 1, ebitMarginal: 1, nettoMarginal: 1, fcfMarginal: 1, omsattningTillvaxtTTM: 1, omsattningCAGR5ar: 1, prognosTillvaxt: 1 };
const tabell = {};
for (const [namn, fn] of Object.entries(f)) {
  const arr = gren.map(fn); const egen = fn(d);
  tabell[namn] = { egen, median: median(arr), rang: (egen === null || egen === undefined) ? null : rang(arr, egen, högre[namn] || 0), n: val(arr).length };
}

// — teknikgrenens redan levererade paket (för ordningstalet) —
const slugTick = { 'ericsson': 'ERIC-B.ST', 'hexagon': 'HEXO-B.ST', 'nokia': 'NOKIA.HE', 'asml': 'ASML.AS', 'sap': 'SAP.DE', 'truecaller': 'TRUE-B.ST', 'samsung': '005930.KS', 'precise-biometrics': 'PREC-ST', 'logitech': 'LOGN.SW', 'kambi': 'KAMBI.ST', 'evolution': 'EVO.ST' };
const tekPaket = [];
for (const fil of readdirSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3')) {
  const m = fil.match(/^sa-laser-du-(.+)-q3-2026\.json$/); if (!m) continue;
  const t = slugTick[m[1]]; if (t && gren.some(g => g.ticker === t)) tekPaket.push(m[1]);
}

// — härledningar —
const r = {};
r.aktier = d.marknadsKapitalMdr / d.pris;                        // mdr aktier
r.ek = d.marknadsKapitalMdr / d.vardering.pb;
r.bvps = r.ek / r.aktier;
r.pbKontroll = d.pris / r.bvps;
r.identitet = d.vardering.pb / d.lonksamhet.roe;
r.identitetGap = (r.identitet / d.vardering.pe - 1) * 100;
r.roeBokslut = res[3] / r.ek;
r.nettoTTM = d.marknadsKapitalMdr / d.vardering.pe;              // absolutkontrollen
r.absolutGap = (r.nettoTTM / res[3] - 1) * 100;
r.epsTTM = r.nettoTTM / r.aktier;
r.epsFY26 = res[3] / r.aktier;
// EV-kedjan
r.ebitKvot = d.lonksamhet.ebitMarginal / d.lonksamhet.nettoMarginal;
r.evTillMcap = (d.vardering.evEbit / d.vardering.pe) * r.ebitKvot;
r.evImpl = d.marknadsKapitalMdr * r.evTillMcap;
r.nettoskuldPekare = r.evImpl - d.marknadsKapitalMdr;
r.skuld = d.stabilitet.skuldEgenkapital * r.ek;
r.kassaImpl = r.skuld - r.nettoskuldPekare;
r.ebitAvk = 1 / d.vardering.evEbit; r.netoAvk = 1 / d.vardering.pe;
// FCF-paradoxen
r.vinstPerKassa = d.lonksamhet.nettoMarginal / d.lonksamhet.fcfMarginal;
r.fcfFY26 = d.lonksamhet.fcfMarginal * oms[3];
r.fcfnettoGap = res[3] - r.fcfFY26;
r.capexFart = 4 * 41;                                             // Q4-FY26-farten årsförd
r.cffoImpl = r.fcfFY26 + r.capexFart;
r.capexAndelCffo = r.capexFart / r.cffoImpl;
r.fcfYieldKontroll = r.fcfFY26 / d.marknadsKapitalMdr;
// marginalexpansion
r.nettomarginaler = oms.map((o, i) => res[i] / o);
r.omscagrEgen = (Math.pow(oms[3] / oms[0], 1 / 3) - 1) * 100;
r.rescagrEgen = (Math.pow(res[3] / res[0], 1 / 3) - 1) * 100;
r.ressteg = [1, 2, 3].map(i => (res[i] / res[i - 1] - 1) * 100);
// kvartalskedja (sökbelagt + ren subtraktion)
r.q1fy26 = { oms: 77.7, ror: 38.0, netto: 27.7, eps: 3.72 };
r.nioMan = oms[3] - 90.01;                                       // FY26 minus Q4
r.q2q3fy26 = r.nioMan - 77.7;                                    // ren subtraktion
r.q4Andel = 90.01 / oms[3] * 100;
r.q4vaxt = (90.01 / 76.4 - 1) * 100;
// Q1-FY27-ekvationen
r.q1MarginalBas = 27.7 / 77.7;
r.konsensusNetto = 4.72 * r.aktier;
r.bana18 = { oms: 77.7 * 1.18, nettoMarg: r.konsensusNetto / (77.7 * 1.18) };
r.bana15 = { oms: 77.7 * 1.15, nettoMarg: r.konsensusNetto / (77.7 * 1.15) };
r.epsTillvaxtKonsensus = (4.72 / 3.72 - 1) * 100;
// Utdelning
r.utdAr = 0.98 * 4;
r.utdYield = r.utdAr / d.pris;
r.utdKostnad = r.utdAr * r.aktier;
r.payout = r.utdKostnad / res[3];
r.hojn1 = (0.91 / 0.83 - 1) * 100;
r.hojn2 = (0.98 / 0.91 - 1) * 100;
r.capexPerUtd = 175 / r.utdKostnad;
// Återbäring
r.aterbaringQ1Andel = 10.7 / d.marknadsKapitalMdr * 100;
// PEG-treen
r.pegImplicit = d.vardering.pe / d.vardering.peg;
r.pegPrognos = d.vardering.pe / (d.tillvaxt.prognosTillvaxt * 100);
r.pegCagr = d.vardering.pe / (d.tillvaxt.resultatCAGR5ar * 100);
// Scenarioruta 3×3 på FY26-basen (EBIT)
r.basEbit = d.lonksamhet.ebitMarginal * oms[3];
const rad = (dv) => [0.97, 1.00, 1.03].map(k => oms[3] * k * (d.lonksamhet.ebitMarginal + dv / 100));
r.scen = { celler: { m2: rad(-2), m0: rad(0), m2p: rad(2) }, intäktspp: 3 * oms[3] / 100, marginalpp: oms[3] / 100 };
r.marginalvikt = 3 * d.lonksamhet.ebitMarginal;

const ut = { genererad: new Date().toISOString(), universumAntal: list.length, grenBolag: gren.length, universumHamtad: d.hamtat, serierMdr: { ar: d.serier.ar, omsattning: oms, resultat: res }, teknikkPaket: tekPaket, falt: d, tabell, härledningar: r };
writeFileSync('/home/ak1a/AK1/verktyg/_s4u1-msft-berakning.json', JSON.stringify(ut, null, 1));

const p1 = (x, n = 2) => (x === null || x === undefined) ? 'null' : (Number.isFinite(x) ? x.toFixed(n) : 'ej-tal');
console.log(`universum ${list.length} poster | teknikgrenen ${gren.length} bolag | levererade teknikpaket: ${tekPaket.join(', ')} (${tekPaket.length} st)`);
console.log('\n— MEDIANER OCH RANG (teknikgrenen, LIVE) —');
for (const [k, v] of Object.entries(tabell)) console.log(`${k}: egen ${p1(v.egen, 4)} | median ${p1(v.median, 4)} | rang ${v.rang ? `${v.rang.pos} av ${v.rang.n}` : 'null'} | n ${v.n}`);
console.log('\n— HÄRLEDNINGAR —');
console.log(`aktier ${p1(r.aktier, 4)} mdr | EK ${p1(r.ek, 1)} mdr | BVPS ${p1(r.bvps, 2)} | P/B-kontroll ${p1(r.pbKontroll, 4)} (fält ${d.vardering.pb})`);
console.log(`identitet P/B÷ROE ${p1(r.identitet, 3)} mot P/E ${d.vardering.pe} | gap ${p1(r.identitetGap, 1)} % | ROE bokslutsväg ${p1(r.roeBokslut * 100, 2)} % (fält ${p1(d.lonksamhet.roe * 100, 2)})`);
console.log(`ABSOLUTKONTROLLEN: netto-TTM ${p1(r.nettoTTM, 2)} mdr mot FY26 ${p1(res[3], 3)} | ${p1(r.absolutGap, 2)} % | EPS TTM ${p1(r.epsTTM, 3)} | EPS FY26 ${p1(r.epsFY26, 3)}`);
console.log(`EV: EV/mcap ${p1(r.evTillMcap, 4)} | EV-impl ${p1(r.evImpl, 0)} mdr | nettoskuld-pekare ${p1(r.nettoskuldPekare, 1)} | skuld ${p1(r.skuld, 1)} | kassa-impl ${p1(r.kassaImpl, 1)}`);
console.log(`EV/EBIT-avk ${p1(r.ebitAvk * 100, 2)} % | netto-avk ${p1(r.netoAvk * 100, 2)} %`);
console.log(`FCF-PARADOXEN: netto/FCF ${p1(r.vinstPerKassa, 2)}× | FCF-FY26 ${p1(r.fcfFY26, 1)} mdr | gap mot netto ${p1(r.fcfnettoGap, 1)} mdr | capexfart ${r.capexFart} mdr/år | CFFO-impl ${p1(r.cffoImpl, 0)} | capex/CFFO ${p1(r.capexAndelCffo * 100, 1)} % | FCF-yield ${p1(r.fcfYieldKontroll * 100, 3)} % (fält ${d.vardering.fcfYield})`);
console.log(`marginaler FY23-26: ${r.nettomarginaler.map(m => p1(m * 100, 2) + ' %').join(' / ')} | omsCAGR ${p1(r.omscagrEgen, 2)} (fält ${p1(d.tillvaxt.omsattningCAGR5ar * 100, 2)}) | resCAGR ${p1(r.rescagrEgen, 2)} (fält ${p1(d.tillvaxt.resultatCAGR5ar * 100, 2)}) | steg ${r.ressteg.map(s => p1(s, 1)).join(' / ')} %`);
console.log(`kvartal: nioMån FY26 ${p1(r.nioMan, 1)} | Q2+Q3 härlellt ${p1(r.q2q3fy26, 1)} | Q4-andel ${p1(r.q4Andel, 1)} % | Q4-tillväxt ${p1(r.q4vaxt, 1)} %`);
console.log(`Q1-FY27: Q1-marginalbas ${p1(r.q1MarginalBas * 100, 2)} % | konsensusnetto ${p1(r.konsensusNetto, 1)} mdr | bana+18 %: oms ${p1(r.bana18.oms, 1)} marginal ${p1(r.bana18.nettoMarg * 100, 1)} % | bana+15 %: oms ${p1(r.bana15.oms, 1)} marginal ${p1(r.bana15.nettoMarg * 100, 1)} % | EPS-tillväxt ${p1(r.epsTillvaxtKonsensus, 1)} %`);
console.log(`utdelning: årsrad ${p1(r.utdAr, 2)} | yield ${p1(r.utdYield * 100, 2)} % | kostnad ${p1(r.utdKostnad, 1)} mdr | payout ${p1(r.payout * 100, 1)} % | höjningar ${p1(r.hojn1, 1)} % och ${p1(r.hojn2, 1)} % | capex/utdelning ${p1(r.capexPerUtd, 1)}×`);
console.log(`återbäring Q1: ${p1(r.aterbaringQ1Andel, 2)} % av mcap`);
console.log(`PEG: implicit ${p1(r.pegImplicit, 2)} % | på prognos ${p1(r.pegPrognos, 3)} | på resCAGR ${p1(r.pegCagr, 3)} (fält ${d.vardering.peg})`);
console.log(`scen: bas-EBIT ${p1(r.basEbit, 1)} mdr | 3 % intäkt ${p1(r.scen.intäktspp, 1)} mdr | 1 pp marginal ${p1(r.scen.marginalpp, 1)} mdr | marginalvikt ${p1(r.marginalvikt, 2)} pp per 3 %`);
for (const [k, v] of Object.entries(r.scen.celler)) console.log(`  ${k}: ${v.map(x => p1(x, 1)).join(' / ')}`);
