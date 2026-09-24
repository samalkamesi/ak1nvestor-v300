#!/usr/bin/env node
// _s4u3-nem-byggdata.mjs — beräkningsmotor för Newmont Q3-läspaketet (s4-u3, manifest auto-s4-1789959329360)
// Läser 243-posts universumfilen LIVE, räknar medianer/rang + härledningar + scenarioruta,
// skriver talbank _s4u3-nem-tal.json. ABORT-grind: kastar vid NaN eller omotiverat negativa belopp.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const UNIV_SOKVAG = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const raw = readFileSync(UNIV_SOKVAG, 'utf8');
const md5 = createHash('md5').update(raw).digest('hex');
const u = JSON.parse(raw);
const arr = Array.isArray(u) ? u : (u.poster || u.bolag || u.universum);
const nem = arr.find(p => p.ticker === 'NEM');
if (!nem) throw new Error('ABORT: NEM saknas i universumfilen');

const num = x => (x === null || x === undefined) ? null : Number(x);
function med(v){ const s=v.filter(x=>x!==null&&Number.isFinite(x)).sort((a,b)=>a-b); if(!s.length) return {v:null,n:0}; const m=Math.floor(s.length/2); return {v: s.length%2 ? s[m] : (s[m-1]+s[m])/2, n: s.length}; }
function rang(v,t){ const s=v.filter(x=>x!==null&&Number.isFinite(x)).sort((a,b)=>a-b); const i=s.indexOf(t); return i<0?null:{plats:i+1,av:s.length}; }
function fin(x){ if(!Number.isFinite(x)) throw new Error('ABORT: NaN i härledning'); return x; }

// — gren och grenfält —
const mat = arr.filter(p => p.bransch === 'material');
const F = {
  pe:      { f: p=>num(p.vardering?.pe),          pkt: nem.vardering?.pe },
  pb:      { f: p=>num(p.vardering?.pb),          pkt: nem.vardering?.pb },
  evEbit:  { f: p=>num(p.vardering?.evEbit),      pkt: nem.vardering?.evEbit },
  peg:     { f: p=>num(p.vardering?.peg),         pkt: nem.vardering?.peg },
  fcfY:    { f: p=>num(p.vardering?.fcfYield),    pkt: nem.vardering?.fcfYield },
  brutto:  { f: p=>num(p.lonksamhet?.bruttoMarginal), pkt: nem.lonksamhet?.bruttoMarginal },
  ebit:    { f: p=>num(p.lonksamhet?.ebitMarginal),  pkt: nem.lonksamhet?.ebitMarginal },
  netto:   { f: p=>num(p.lonksamhet?.nettoMarginal),  pkt: nem.lonksamhet?.nettoMarginal },
  roe:     { f: p=>num(p.lonksamhet?.roe),           pkt: nem.lonksamhet?.roe },
  roic:    { f: p=>num(p.lonksamhet?.roic),          pkt: nem.lonksamhet?.roic },
  skuldEk: { f: p=>num(p.stabilitet?.skuldEgenkapital), pkt: nem.stabilitet?.skuldEgenkapital },
  ttm:     { f: p=>num(p.tillvaxt?.omsattningTillvaxtTTM), pkt: nem.tillvaxt?.omsattningTillvaxtTTM },
};
const grendata = {};
for (const [k,d] of Object.entries(F)) {
  const vals = mat.map(d.f);
  grendata[k] = { nem: d.pkt, ...med(vals), rang: rang(vals, d.pkt) };
}

// — serier konverterade till MUSD FÖRE alla härledningar (ABORT-grinden fångade råtalsfällan) —
const [o1,o2,o3,o4] = nem.serier.omsattning.map(x=>fin(x/1e6));
const [r1,r2,r3,r4] = nem.serier.resultat.map(x=>fin(x/1e6));

// — hereledningar på raden —
const pris = nem.pris, mcapMdr = nem.marknadsKapitalMdr, mcapM = fin(mcapMdr*1000);
const epsT = fin(pris/nem.vardering.pe);                 // trailingvinst/aktie USD
const bvps = fin(pris/nem.vardering.pb);                 // bokfört kapital/aktie USD
const roeHarled = fin(epsT/bvps);                        // identitets-ROE
const identPBoROE = fin(nem.vardering.pb/nem.lonksamhet.roe);
const gapIdent = fin((nem.vardering.pe-identPBoROE)/identPBoROE);
const gapRoe = fin((roeHarled-nem.lonksamhet.roe)/nem.lonksamhet.roe);
const aktierM = fin(mcapM/pris);                          // miljoner aktier
const ebit2025 = fin(nem.lonksamhet.ebitMarginal*o4);   // MUSD
const evFranFalt = fin(nem.vardering.evEbit*ebit2025);                          // MUSD
const ek = fin(mcapM/nem.vardering.pb);
const skuld = fin(nem.stabilitet.skuldEgenkapital*ek);
const kassaImplicit = fin(mcapM+skuld-evFranFalt);        // residual-läsning, kan ej vara negativ här
if (kassaImplicit < 0) throw new Error('ABORT: negativ implicit kassa utan motivering');
const fcfVag1 = fin(nem.vardering.fcfYield*mcapM);        // via yield × mcap
const fcfVag2 = fin(nem.lonksamhet.fcfMarginal*o4); // via marginal × omsättning
const fcfGap = fin((fcfVag1-fcfVag2)/fcfVag2);
const utdAr = 1.04;                                       // 0,26/kv × 4 (sökverifierad newmont.com Q4-25-release + 2026-betalningar)
const direktAvk = fin(utdAr/pris);
const utdBolag = fin(utdAr*aktierM);
const payoutEps = fin(utdAr/epsT);
const payoutFcf = fin(utdBolag/fcfVag2);
const progAterkop = 6000;                                 // MUSD, nytt program 2026-04-23 (sökverifierat)
const aterkopAndel = fin(progAterkop/mcapM);
const epsLyft = fin(1/(1-aterkopAndel)-1);
const q1kop = 1895;                                       // MUSD Q1-26 (sökverifierat)
const kvarterPerProgram = fin(progAterkop/q1kop);
// växlingen
const oms = [o1,o2,o3,o4];
const nettoMargAr = [r1,r2,r3,r4].map((r,i)=>fin(r/oms[i]));
const vandelse = fin(r4-r2);
const marginalsvang = fin((nettoMargAr[3]-nettoMargAr[1])*100); // pp
const omsTotal = fin((o4/o1-1));
// AISC-marginal Q2-26 (sökverifierad): realiserat 4414, AISC 1621
const realiserat=4414, aisc=1621, margOz=fin(realiserat-aisc), aiscMarginal=fin(margOz/realiserat);
const prisMinus10 = fin(realiserat*0.9), margOzMinus10 = fin(prisMinus10-aisc), marginalfall=fin(margOzMinus10/margOz-1), forstorning=fin(marginalfall/-0.1);
// PEG-läxor
const pegKonv = fin(nem.vardering.pe/(nem.tillvaxt.prognosTillvaxt*100));
const pegImplicitTillvaxt = fin(nem.vardering.pe/nem.vardering.peg);
// EBIT-diskont
const ebitDiskont = fin(nem.vardering.pe/nem.vardering.evEbit);
// scenarioruta 3×3 på 2025-basen: intäkt ×(1+p), kostnad ×(1+c), netto andel av EBIT konstant
const basIntakt=o4, basKostnad=fin(o4-ebit2025), nettoAvEbit=fin(r4/ebit2025);
const scen=[];
for(const p of [-0.10,0,0.10]) for(const c of [-0.10,0,0.10]){
  const ebitS=fin(basIntakt*(1+p)-basKostnad*(1+c));
  scen.push({pris:p,kostnad:c,ebit:ebitS,netto:fin(ebitS*nettoAvEbit),nettoMotBas:fin(ebitS*nettoAvEbit/r4-1)});
}

const tal = {
  kalla: { sokvag: UNIV_SOKVAG, md5, hamtad: nem.hamtat, poster: arr.length, grenN: mat.length,
           grenTickers: mat.map(p=>p.ticker) },
  rad: { pris, mcapMdr, utdelningAr: utdAr, insiderkop: nem.aterkop?.insiderkopSenaste6man },
  grendata, harled: {
    epsT, bvps, roeHarled, identPBoROE, gapIdent, gapRoe, aktierM, ebit2025, evFranFalt, ek, skuld, kassaImplicit,
    fcfVag1, fcfVag2, fcfGap, direktAvk, utdBolag, payoutEps, payoutFcf,
    progAterkop, aterkopAndel, epsLyft, kvarterPerProgram,
    vandelse, nettoMargAr, marginalsvang, omsTotal,
    realiserat, aisc, margOz, aiscMarginal, prisMinus10, margOzMinus10, marginalfall, forstorning,
    pegKonv, pegImplicitTillvaxt, ebitDiskent: ebitDiskont },
  serier: { ar: nem.serier.ar, omsMUSD: [o1,o2,o3,o4], resMUSD: [r1,r2,r3,r4] },
  scenario: { basIntakt, basKostnad, nettoAvEbit, basNetto: r4, celler: scen },
};
writeFileSync('/home/ak1a/AK1/verktyg/_s4u3-nem-tal.json', JSON.stringify(tal, null, 1));
console.log('OK talbank skriven. md5=' + md5 + ' gren n=' + mat.length);
console.log('kontroller: epsT=' + epsT.toFixed(4) + ' bvps=' + bvps.toFixed(3) + ' gapIdent=' + (gapIdent*100).toFixed(2) + '%');
console.log('EBIT25=' + ebit2025.toFixed(1) + ' EV=' + evFranFalt.toFixed(0) + ' implicitKassa=' + kassaImplicit.toFixed(0));
console.log('scenarioruta netto bas ' + r4 + ' → celler [' + scen.map(s=>s.netto.toFixed(0)).join(', ') + ']');
