#!/usr/bin/env node
// KVD s4-u3 — Fortum Q3-2026-läspaket. Oberoende verifiering av aritmetik, tabell, juridik och format.
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-fortum-q3-2026.json';
const p = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const body = p.body;
let FEL = 0, VARN = 0, OK = 0;
const fel = (m) => { FEL++; console.log('FEL:', m); };
const varn = (m) => { VARN++; console.log('VARNING:', m); };
const ok = (m) => { OK++; };

const swe = (x, dec = 0) => {
  const neg = x < 0 ? '−' : '';
  const a = Math.abs(x);
  const [h, t] = a.toFixed(dec).split('.');
  return neg + h.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + (t !== undefined ? ',' + t : '');
};

// 1. Grundstruktur
if (p.slug !== 'sa-laser-du-fortum-q3-2026') fel('slug fel: ' + p.slug); else ok('slug');
if (p.publishedAt !== '2026-10-28') fel('publishedAt'); else ok('publishedAt = rappdagen');
if (p.author !== 'AK1A Research Lab') fel('author'); else ok('author');
if (!p.title.includes('Fortum') || !p.title.includes('Q3')) fel('title saknar Fortum/Q3'); else ok('title');
if (!p.description.includes('Fortum') || !p.description.includes('28 oktober')) fel('description'); else ok('description');
const ord = body.split(/\s+/).filter(w => /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
if (ord < 2400) fel('ordantal för lågt: ' + ord); else ok('ordantal ' + ord);
if (p.readingMinutes !== Math.max(1, Math.round(ord / 600))) fel('readingMinutes stämmer ej'); else ok('readingMinutes ' + p.readingMinutes);
if (!p.tags.includes('kvartalsrapport') || !p.tags.includes('Fortum')) fel('tags'); else ok('tags');

// 2. Duplikatkontroll
const mapp = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/';
const filer = fs.readdirSync(mapp).filter(f => f.endsWith('.json') && f !== 'sa-laser-du-fortum-q3-2026.json');
if (filer.some(f => f.includes('fortum'))) fel('DUBLIKAT fortum-fil finns: ' + filer.filter(f => f.includes('fortum'))); else ok('inga fortum-dubbletter (' + filer.length + ' andra paket)');

// 3. Rådata (oberoende av byggskriptet — samma källor)
const A = { pe: 22.446, pb: 2.275, evEbit: 39.622, peg: 13.9, fcfY: 0.0424, roe: 0.0999, roic: 0.0434,
  brutto: 0.3942, ebit: 0.0952, netto: 0.1507, fcfm: 0.1431, skuldEk: 0.4748, mcap: 18.529,
  oms: [8804, 6711, 5800, 4989], res: [-2416, 1514, 1164, 765], ttm: 0.154, prog: -0.0414, omsCagr: -0.1725 };

// 4. Aritmetikkontroller: varje påstått tal ska finnas i bodyn (motorräknat här)
const kontrollera = (namn, varde, dec) => {
  const s = swe(varde, dec);
  if (body.includes(s)) ok(namn + ' = ' + s); else fel(namn + ': ' + s + ' saknas i bodyn');
};
const ident = A.pb / A.roe; kontrollera('identitet', ident, 2);
const nettoPerEbit = A.netto / A.ebit; kontrollera('netto/EBIT', nettoPerEbit, 4);
const pEbit = A.pe * nettoPerEbit; kontrollera('P/EBIT', pEbit, 2);
const evKvot = A.evEbit / pEbit; kontrollera_ev();
function kontrollera_ev() {
  const s = swe(evKvot, 4);
  if (body.includes(s)) ok('EV-kvot = ' + s); else fel('EV-kvot: ' + s + ' saknas');
}
const ek = A.mcap / A.pb; kontrollera('EK mdr', ek, 3);
const skuld = A.skuldEk * ek; kontrollera('bruttoskuld', skuld, 0);
const kassa = ((skuld / A.mcap) - (evKvot - 1)) * A.mcap; kontrollera('kassa', kassa, 0);
const turnover = A.roe / (A.netto * (1 + A.skuldEk)); kontrollera('DuPont-turnover', turnover, 3);
const margVikt = 1 / (3 * A.ebit); kontrollera('marginalvikt', margVikt, 2);
const multTtm = A.pe / 1.154, multProg = A.pe / 0.9586;
kontrollera('multipl TTM', multTtm, 2); kontrollera('multipl prognos', multProg, 2);
const bas = A.oms[3] * A.ebit; kontrollera('bas-EBIT', bas, 0);
const pegKonv = A.pe / -4.14; kontrollera('PEG konvention abs', Math.abs(pegKonv), 2);
const pegImpl = A.pe / A.peg; kontrollera('PEG implicit', pegImpl, 2);
const steg = [A.oms[1] / A.oms[0] - 1, A.oms[2] / A.oms[1] - 1, A.oms[3] / A.oms[2] - 1];
for (const s of steg) kontrollera('årssteg ' + s.toFixed(4), s * 100, 2);
const nser = A.res.map((v, i) => v / A.oms[i] * 100);
for (const s of nser) kontrollera('nettomarginalserie ' + s.toFixed(2), s, 1);
// kvartalsmarginaler
const q1oms = 3116 - 1124, q1omsPy = 2616 - 974;
kontrollera('Q1-marginal 2026', 521 / q1oms * 100, 1); kontrollera('Q2-marginal 2026', 106 / 1124 * 100, 1);
kontrollera('Q1-marginal 2025', 462 / q1omsPy * 100, 1); kontrollera('Q2-marginal 2025', 115 / 974 * 100, 1);
kontrollera('Q1-tillväxt', (q1oms / q1omsPy - 1) * 100, 1); kontrollera('Q2-tillväxt', (1124 / 974 - 1) * 100, 1);
kontrollera('Q1-resultattillväxt', (521 / 462 - 1) * 100, 1); kontrollera('Q2-resultattillväxt', Math.abs(106 / 115 - 1) * 100, 1);
// additiva kontroller
if (521 + 106 !== 627) fel('H1-addition'); else ok('H1: 521+106=627');
if (462 + 115 + 97 !== 674) fel('jan-sep-addition'); else ok('jan-sep: 462+115+97=674');
if (!body.includes('521') || !body.includes('106') || !body.includes('627')) fel('kvartalstal saknas'); else ok('kvartalstal i body');

// 5. Scenariotabellens 9 celler
let celler = 0;
for (const dd of [-0.01, 0, 0.01]) for (const dv of [-0.03, 0, 0.03]) {
  const v = swe(A.oms[3] * (1 + dv) * (A.ebit + dd), 0);
  if (body.includes(v)) celler++;
}
if (celler === 9) ok('scenarioruta 9/9 celler'); else fel('scenarioruta: endast ' + celler + '/9 celler träffade');

// 6. Tabellvärden mot färsk beräkning ur bolagsunivers.json
const u = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const listor = Array.isArray(u) ? u : (u.bolag || u.universum || Object.values(u).find(Array.isArray));
const fortumPost = listor.find(x => x.ticker === 'FORTUM.HE');
if (!fortumPost) fel('FORTUM.HE saknas i universumfilen'); else {
  const avv = (namn, kalla, paket) => { if (Math.abs(kalla - paket) / Math.abs(kalla) > 0.001) fel('tabell ' + namn + ': källa ' + kalla + ' vs paket ' + paket); else ok('tabell ' + namn); };
  avv('P/E', fortumPost.vardering.pe, A.pe); avv('P/B', fortumPost.vardering.pb, A.pb); avv('EV/EBIT', fortumPost.vardering.evEbit, A.evEbit);
  avv('ROE', fortumPost.lonksamhet.roe, A.roe); avv('ROIC', fortumPost.lonksamhet.roic, A.roic);
  avv('netto', fortumPost.lonksamhet.nettoMarginal, A.netto); avv('ebit', fortumPost.lonksamhet.ebitMarginal, A.ebit);
  avv('skuldEk', fortumPost.stabilitet.skuldEgenkapital, A.skuldEk);
  for (let i = 0; i < 4; i++) { if (fortumPost.serier.omsattning[i] / 1e6 !== A.oms[i]) fel('serie oms år ' + i); if (fortumPost.serier.resultat[i] / 1e6 !== A.res[i]) fel('serie res år ' + i); }
  ok('serier 8/8');
  // medianer
  const med = a => { const s = a.filter(x => typeof x === 'number' && isFinite(x)).sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const e = listor.filter(x => x.bransch === 'energi');
  const pbMed = med(e.map(x => x.vardering?.pb).filter(v => typeof v === 'number'));
  if (body.includes(swe(pbMed, 4))) ok('P/B-medianen ' + swe(pbMed, 4) + ' i tabellen'); else fel('P/B-median ' + pbMed + ' saknas');
  if (Math.abs(pbMed - A.pb) < 0.0006) ok('Fortum = P/B-medianen (kraftbolagets mittpunkt)'); else varn('P/B vs median: ' + pbMed + ' mot ' + A.pb);
  const peMed = med(e.map(x => x.vardering?.pe).filter(v => typeof v === 'number'));
  if (body.includes(swe(peMed, 2))) ok('P/E-medianen'); else fel('P/E-median ' + swe(peMed, 2) + ' saknas');
  // rang
  const rang = (sokVal, val) => { const vals = e.map(p2 => sokVal(p2)).filter(v => typeof v === 'number' && isFinite(v)).sort((a, b) => a - b); return (vals.indexOf(val) + 1) + '/' + vals.length; };
  const rEbit = rang(p2 => p2.lonksamhet?.ebitMarginal, A.ebit);
  const rNetto = rang(p2 => p2.lonksamhet?.nettoMarginal, A.netto);
  if (rEbit === '2/19') ok('rang EBIT 2/19'); else fel('rang EBIT: ' + rEbit);
  if (rNetto === '15/19') ok('rang netto 15/19'); else fel('rang netto: ' + rNetto);
}

// 7. Juridik: rådverb-scanner (undantar insiderköp/återköps/köpeskilling etc)
const rådMönster = /\b(köp|sälj|rekommenderar|rekommenderat|rekommendation att|undvik|avråder|ta position|exponera dig|buy|sell|strong buy)\b/gi;
const träffar = [...body.matchAll(rådMönster)].filter(m => {
  const kontext = body.slice(Math.max(0, m.index - 40), m.index + m[0].length + 60);
  return !/(insiderköp|återköps|återköp|köpeskilling|kontanterbjudande|insider|rekommenderat frivilligt|Inga köp-, sälj- eller hållningsrekommendationer)/i.test(kontext);
});
if (träffar.length) fel('rådverb: ' + träffar.map(t => '"' + body.slice(t.index - 25, t.index + 25) + '"').join(' | ')); else ok('rådverb 0');
// varumärkesgrind: Fortum + räd i samma mening
const meningar = body.split(/(?<=[.!?])\s+/);
const vm = meningar.filter(m => /\bFortum\b/.test(m) && /\b(köp|sälj|rekommendera|undvik)\b/i.test(m) && !/insiderköp|återköp/.test(m));
if (vm.length) fel('varumärkesgrind: ' + vm.length + ' meningar'); else ok('varumärkesgrind 0');
// disclaimer
if (!body.includes('pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 §')) fel('disclaimer lagrum'); else ok('disclaimer');
if (!body.includes('inte investeringsrådgivning')) fel('disclaimer rådgivning'); else ok('disclaimer rådgivning');
if (!body.includes('publiceringen av detta paket är kundens beslut')) fel('disclaimer R2'); else ok('disclaimer R2');

// 8. Länkmönster
const länkar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const tillåtna = l => /^\/(dataset\/energi\/[a-z0-9-]+|bolag\/fortum-he|kurser|transparens|kallor)$/.test(l);
const felLänkar = länkar.filter(l => !tillåtna(l));
if (felLänkar.length) fel('olika länkar: ' + felLänkar.join(', ')); else ok(länkar.length + ' interna länkar följer seriens mönster');

// 9. Publiceringsytor
const iBlogg = fs.existsSync('/home/ak1a/AK1/data/blogg/sa-laser-du-fortum-q3-2026.json');
if (iBlogg) fel('FIL I data/blogg/ — FÖRBUDET'); else ok('inte i data/blogg/ (utkast only)');

console.log('—');
console.log('KVD FORTUM: ' + OK + ' OK, ' + VARN + ' varning(ar), ' + FEL + ' FEL');
process.exit(FEL ? 1 : 0);
