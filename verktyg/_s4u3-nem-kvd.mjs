#!/usr/bin/env node
// _s4u3-nem-kvd.mjs — kvalitetsverifiering av Newmont Q3-läspaketet (s4-u3).
// Kontrollerar källtalsparitet mot universumfilen (md5-låst), aritmetik oberoende omräknad,
// medianer/rang LIVE, juridikgrinden, språk-/strukturprov. GRÖN = 0 FEL 0 VARNING.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const P = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-newmont-q3-2026.json', 'utf8'));
const T = JSON.parse(readFileSync('/home/ak1a/AK1/verktyg/_s4u3-nem-tal.json', 'utf8'));
const rawU = readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8');
const md5 = createHash('md5').update(rawU).digest('hex');
const arr = JSON.parse(rawU); const univ = (Array.isArray(arr) ? arr : arr.poster).find(p => p.ticker === 'NEM');
const body = P.body, g = T.grendata, h = T.harled, s = T.scenario;
const norm = t => t.replace(/[\u00A0\u202F]/g, ' ').replace(/−/g, '-');
const B = norm(body);
let pass = 0, fel = 0, varning = 0;
const F = (m) => { fel++; console.log('FEL: ' + m); };
const W = (m) => { varning++; console.log('VARNING: ' + m); };
const OK = (m) => { pass++; };
const finns = (str, m) => { if (B.includes(norm(str))) OK(); else F((m || 'saknas i texten: ') + str); };
const numF = (x, m) => { if (Number.isFinite(x)) OK(); else F('NaN/icke-tal: ' + m); };

// — 0. fil-lås —
if (md5 === T.kalla.md5) OK(); else F('universumfilens md5 avviker från talbankens snapshot');

// — 1. källtalsparitet mot universumraden (sv-SE-formatterade fältvärden i paketet) —
const f2 = x => x.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const f4 = x => x.toLocaleString('sv-SE', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const pctS = (x, a) => (x * 100).toLocaleString('sv-SE', { minimumFractionDigits: a, maximumFractionDigits: a });
const pari = [
  [f2(univ.pris), 'kurs'], [f2(univ.marknadsKapitalMdr), 'mcap'], [f2(univ.vardering.pe), 'P/E'], [f2(univ.vardering.pb), 'P/B'],
  [f2(univ.vardering.evEbit), 'EV/EBIT'], [f2(univ.vardering.peg), 'PEG'], [pctS(univ.vardering.fcfYield, 2) + ' procent', 'FCF-yield'],
  [pctS(univ.lonksamhet.bruttoMarginal, 2) + ' procent', 'bruttomarginal'], [pctS(univ.lonksamhet.ebitMarginal, 2) + ' procent', 'rörelsemarginal'],
  [pctS(univ.lonksamhet.nettoMarginal, 2) + ' procent', 'nettomarginal'], [pctS(univ.lonksamhet.roe, 2) + ' procent', 'ROE'],
  [pctS(univ.lonksamhet.roic, 2) + ' procent', 'ROIC'], [f4(univ.stabilitet.skuldEgenkapital), 'skuldkvot'],
  [pctS(univ.tillvaxt.omsattningTillvaxtTTM, 1) + ' procent', 'TTM'], [pctS(univ.tillvaxt.prognosTillvaxt, 1) + ' procent', 'prognos'],
  ['0,1581', 'skuldkvot långform'], [String(univ.aterkop.insiderkopSenaste6man), 'insiderköp'],
  ...univ.serier.omsattning.map(x => [Math.round(x / 1e6).toLocaleString('sv-SE'), 'omsättning år']),
  ...univ.serier.resultat.map(x => [Math.round(x / 1e6).toLocaleString('sv-SE'), 'resultat år']),
];
for (const [str, namn] of pari) finns(str, 'paritet ' + namn + ' — ');

// — 2. aritmetik oberoende omräknad (ur universumraden, ej ur talbanken) —
const o4 = univ.serier.omsattning[3] / 1e6, r4 = univ.serier.resultat[3] / 1e6;
const r2 = univ.serier.resultat[1] / 1e6, o1 = univ.serier.omsattning[0] / 1e6;
const ebit = univ.lonksamhet.ebitMarginal * o4, ev = univ.vardering.evEbit * ebit;
const ek = univ.marknadsKapitalMdr * 1000 / univ.vardering.pb, sk = univ.stabilitet.skuldEgenkapital * ek;
const kassa = univ.marknadsKapitalMdr * 1000 + sk - ev;
const epsT = univ.pris / univ.vardering.pe, bvps = univ.pris / univ.vardering.pb;
const arit = [
  [epsT, h.epsT, 'epsT'], [bvps, h.bvps, 'bvps'], [univ.vardering.pb / univ.lonksamhet.roe, h.identPBoROE, 'P/B÷ROE'],
  [(univ.vardering.pe - h.identPBoROE) / h.identPBoROE, h.gapIdent, 'gapIdent'], [epsT / bvps, h.roeHarled, 'ROE härled'],
  [ebit, h.ebit2025, 'EBIT 2025'], [ev, h.evFranFalt, 'EV'], [ek, h.ek, 'EK'], [sk, h.skuld, 'skuld'], [kassa, h.kassaImplicit, 'implicit kassa'],
  [univ.vardering.fcfYield * univ.marknadsKapitalMdr * 1000, h.fcfVag1, 'FCF väg 1'], [univ.lonksamhet.fcfMarginal * o4, h.fcfVag2, 'FCF väg 2'],
  [(h.fcfVag1 - h.fcfVag2) / h.fcfVag2, h.fcfGap, 'FCF-gap'], [1.04 / univ.pris, h.direktAvk, 'direktavkastning'],
  [1.04 / epsT, h.payoutEps, 'payout EPS'], [6000 / (univ.marknadsKapitalMdr * 1000), h.aterkopAndel, 'återköpsandel'],
  [1 / (1 - h.aterkopAndel) - 1, h.epsLyft, 'EPS-lyft'], [6000 / 1895, h.kvarterPerProgram, 'kvartal per program'],
  [r4 - r2, h.vandelse, 'vändelse'], [(r4 / o4 - r2 / univ.serier.omsattning[1] * 1e6) * 100, h.marginalsvang, 'marginalsväng pp'],
  [o4 / o1 - 1, h.omsTotal, 'omsättning totalt'], [(4414 - 1621) / 4414, h.aiscMarginal, 'uns-marginal'],
  [(4414 * 0.9 - 1621) / (4414 - 1621) - 1, h.marginalfall, 'marginalfall'],
  [univ.vardering.pe / (univ.tillvaxt.prognosTillvaxt * 100), h.pegKonv, 'PEG konvention'],
  [univ.vardering.pe / univ.vardering.peg, h.pegImplicitTillvaxt, 'PEG implicit'],
  [univ.vardering.pe / univ.vardering.evEbit, h.ebitDiskent, 'EBIT-diskont'],
];
for (const [ber, talbank, namn] of arit) {
  numF(ber, namn); numF(talbank, namn + ' (talbank)');
  if (Math.abs(ber - talbank) < Math.max(1e-9, Math.abs(ber) * 1e-9)) OK(); else F('aritmetikavvikelse ' + namn + ': beräknat ' + ber + ' mot talbank ' + talbank);
}
// aritmetik som textpåståenden (sv-SE-komma + NNBSP hanteras av norm(); punkt-formatterade söksträngar var KVD-bugg nr 1-4, vaccinerad)
const svN = (x, a) => x.toLocaleString('sv-SE', { minimumFractionDigits: a, maximumFractionDigits: a });
const txtArit = [
  [svN(h.epsT, 2), 'epsT i text'], [svN(h.bvps, 2), 'bvps i text'], [svN(h.identPBoROE, 3), 'P/B÷ROE i text'],
  [pctS(h.gapIdent, 2) + ' procent', 'gapIdent i text'], [pctS(h.gapRoe, 2).replace('-', '') + ' procent', 'gapRoe i text (belopp)'],
  [Math.round(h.ebit2025).toLocaleString('sv-SE'), 'EBIT i text'], [Math.round(h.evFranFalt).toLocaleString('sv-SE'), 'EV i text'],
  [Math.round(h.ek).toLocaleString('sv-SE'), 'EK i text'], [Math.round(h.skuld).toLocaleString('sv-SE'), 'skuld i text'],
  [Math.round(h.kassaImplicit).toLocaleString('sv-SE'), 'implicit kassa i text'], [Math.round(h.fcfVag1).toLocaleString('sv-SE'), 'FCF1 i text'],
  [Math.round(h.fcfVag2).toLocaleString('sv-SE'), 'FCF2 i text'], [Math.round(h.vandelse).toLocaleString('sv-SE'), 'vändelse i text'],
  [svN(h.marginalsvang, 1), 'marginalsväng i text'],
  [pctS(h.aterkopAndel, 2) + ' procent', 'återköpsandel i text'], [pctS(h.epsLyft, 2) + ' procent', 'EPS-lyft i text'],
  [pctS(h.direktAvk, 2) + ' procent', 'direktavkastning i text'], [svN(h.forstorning, 2), 'förstoring i text'],
  [svN(h.aktierM, 1), 'aktietal i text'],
];
for (const [str, namn] of txtArit) finns(str, namn + ' — ');

// — 3. medianer + rang LIVE ur filen —
const mat = (Array.isArray(arr) ? arr : arr.poster).filter(p => p.bransch === 'material');
const med = v => { const s = v.filter(x => x !== null && Number.isFinite(x)).sort((a, b) => a - b); const m = Math.floor(s.length / 2); return { v: s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2, n: s.length }; };
const GF = { pe: p => p.vardering?.pe, pb: p => p.vardering?.pb, evEbit: p => p.vardering?.evEbit, peg: p => p.vardering?.peg, fcfY: p => p.vardering?.fcfYield, brutto: p => p.lonksamhet?.bruttoMarginal, ebit: p => p.lonksamhet?.ebitMarginal, netto: p => p.lonksamhet?.nettoMarginal, roe: p => p.lonksamhet?.roe, roic: p => p.lonksamhet?.roic, skuldEk: p => p.stabilitet?.skuldEgenkapital, ttm: p => p.tillvaxt?.omsattningTillvaxtTTM };
if (mat.length === T.kalla.grenN) OK(); else F('grenens n förändrad sedan talbanken');
for (const [k, fn] of Object.entries(GF)) {
  const m = med(mat.map(fn));
  if (Math.abs(m.v - g[k].v) < 1e-9 && m.n === g[k].n) OK(); else F('medianavvikelse ' + k + ': live ' + m.v + '/' + m.n + ' mot talbank ' + g[k].v + '/' + g[k].n);
  const s = mat.map(fn).filter(x => x !== null && Number.isFinite(x)).sort((a, b) => a - b);
  const i = s.indexOf(g[k].nem);
  if (i < 0 || (i + 1) !== g[k].rang.plats || s.length !== g[k].rang.av) F('rangavvikelse ' + k); else OK();
  // tabellraden finns i paketet — procentfält söks i procentform, övriga med sin decimalform
  // (råfälts-formattering av procentfält var KVD-bugg nr 5-10, vaccinerad)
  const sokStr = ['fcfY', 'brutto', 'ebit', 'netto', 'roe', 'roic', 'ttm'].includes(k) ? pctS(g[k].nem, k === 'ttm' ? 1 : 2) + ' procent' : (k === 'skuldEk' ? f4(g[k].nem) : f2(g[k].nem));
  finns(sokStr, 'fältnivå ' + k + ' i tabell — ');
}

// — 4. scenarioruta: alla 9 celler + bas —
const cells = s.celler.filter(c => Number.isFinite(c.netto) && Number.isFinite(c.nettoMotBas));
if (cells.length === 9) OK(); else F('scenariorutan har ' + cells.length + ' celler, ej 9');
for (const c of cells) {
  const ber = s.basIntakt * (1 + c.pris) - s.basKostnad * (1 + c.kostnad);
  if (Math.abs(ber * s.nettoAvEbit - c.netto) < 0.5) OK(); else F('scenariocell pris=' + c.pris + ' kostnad=' + c.kostnad + ' stämmer ej');
  finns(Math.round(c.netto).toLocaleString('sv-SE'), 'scenariocell ' + c.pris + '/' + c.kostnad + ' i text — ');
}
if (s.basNetto === r4) OK(); else F('scenariobasen ej 2025-resultatet');

// — 5. juridikgrinden —
const lagrum = (B.match(/2007:528/g) || []).length;
if (lagrum === 1) OK(); else F('lagrum 2007:528 förekommer ' + lagrum + ' gånger, ska vara exakt 1');
const radord = B.match(/\b(köp|köpa|köper|sälj|sälja|säljer|rekommendera|rekommendation|tips)\b/gi) || [];
if (radord.length === 0) OK(); else F('rådord i texten: ' + radord.join(','));
if (/rådgivning kräver tillstånd/.test(B) && /inte investeringsråd/.test(B)) OK(); else F('juridiktextens negerande formuleringar saknas');
const rader = body.trim().split('\n').filter(x => x.trim());
if (rader[rader.length - 1].startsWith('Detta läspaket är utbildningsmaterial')) OK(); else F('disclaimern är ej sista raden');

// — 6. språk- och strukturprov —
if (/\$\{|undefined|NaN\b/.test(body)) F('template-läcka i bodyn'); else OK();
const h2 = (body.match(/^## /gm) || []).length;
if (h2 === 7) OK(); else F('antal H2-sektioner ' + h2 + ', ska vara 7');
const eng = (B.match(/\b(the|and|with|both|complete|this|that|not|is|are)\b/g) || []).length;
if (eng === 0) OK(); else W('engelska funktionsord i texten: ' + eng + ' träffar');
const ord = body.split(/\s+/).filter(Boolean).length;
if (ord >= 2000 && ord <= 3900) OK(); else W('ordmängd ' + ord + ' utanför familjepraxis 2266-3784');
const lank = (body.match(/\]\(\/blogg\/[a-z0-9-]+\)/g) || []).length;
if (lank >= 8 && lank <= 18) OK(); else W('interna länkar ' + lank + ' utanför spannet 8-18');
if (P.publishedAt === '2026-10-21' && P.slug === 'sa-laser-du-newmont-q3-2026') OK(); else F('metadata avviker');
if ((P.tags || []).length === 6) OK(); else F('tags != 6');
// sökverifierade konstanter deklarerade (källa: webbverifiering 2026-09-21, dokumenterad i klaim/worklog)
for (const k of ['0,26 dollar', '1,04', '5,26', '1,29', '2,2 miljarder', '4 414', '1 621', '1 895', '2,10', '1,92', '52']) finns(k, 'sökverifierad konstant — ');

console.log('\nKVD Newmont Q3: ' + pass + ' PASS, ' + fel + ' FEL, ' + varning + ' VARNING');
console.log(fel === 0 && varning === 0 ? 'KVD GRÖN' : 'KVD EJ GRÖN');
process.exit(fel === 0 && varning === 0 ? 0 : 1);
