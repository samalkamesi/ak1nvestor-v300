#!/usr/bin/env node
// ROND 101 — oberoende KVD: m9 #3 kassaflodesanalys-101 (v1) mot ORIGINAL-underlag ur git
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROT = '/home/ak1a/agent/ak1';
const FIL = 'data/blogg-utkast/m9-ko/kassaflodesanalys-101-v1.json';
const KVITTO_MD5 = 'f4cee65860922e53ded546aefaf7ca02';
const r = [];
const R = (namn, vante, faktiskt, okExtra = true) => r.push({ namn, vante, faktiskt: String(faktiskt), dom: String(vante) === String(faktiskt) && okExtra ? 'OK' : 'FEL' });

// ── Original-underlaget ur git (buffert-exakt md5, ingen trim)
const cdBuf = (args) => execFileSync('git', args, { cwd: ROT, maxBuffer: 64 * 1024 * 1024 });
let original = null, originalCommit = null;
const loggor = execFileSync('git', ['log', '--format=%H', '--', 'data/portfolj-system/bolagsunivers.json'], { cwd: ROT, encoding: 'utf-8' }).trim().split('\n');
for (const hash of loggor) {
  try {
    const blob = cdBuf(['show', `${hash}:data/portfolj-system/bolagsunivers.json`]);
    if (createHash('md5').update(blob).digest('hex') === KVITTO_MD5) { original = JSON.parse(blob.toString('utf-8')); originalCommit = hash.slice(0, 8); break; }
  } catch {}
}
if (!original) { console.error('ORIGINAL EJ ÅTERVUNNET — avbryter'); process.exit(1); }
console.log(`ORIGINAL: ${originalCommit} · ${original.length} bolag · md5 ${KVITTO_MD5.slice(0, 8)} EXAKT`);

// ── Median/pct-hjälpare (fabrikens konvention sonderas: värde som andel → procent med svensk decimal)
const tal = (v) => typeof v === 'number' && Number.isFinite(v);
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct1 = (v) => (v * 100).toLocaleString('sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const b = original;

// 1. n och median FCF-marginal (lonksamhet.fcfMarginal)
const fm = b.filter((x) => tal(x.lonksamhet?.fcfMarginal)).map((x) => x.lonksamhet.fcfMarginal);
R('FCF-marginal n', 92, fm.length);
R('FCF-marginal median', '10,8', pct1(median(fm)));

// 2. n och median FCF-avkastning (vardering.fcfYield)
const fy = b.filter((x) => tal(x.vardering?.fcfYield)).map((x) => x.vardering.fcfYield);
R('FCF-avkastning n', 87, fy.length);
R('FCF-avkastning median', '3', (median(fy) * 100).toLocaleString('sv-SE', { maximumFractionDigits: 0 }));

// 3. konverteringsgrad = fcfMarginal ÷ nettoMarginal (båda mätta, divisionsvakt: nettoMarginal > 0)
const konvRader = b.filter((x) => tal(x.lonksamhet?.fcfMarginal) && tal(x.lonksamhet?.nettoMarginal) && x.lonksamhet.nettoMarginal > 0);
const konv = konvRader.map((x) => x.lonksamhet.fcfMarginal / x.lonksamhet.nettoMarginal);
R('konverteringsgrad n', 84, konv.length);
R('konverteringsgrad median', '0,78', median(konv).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
R('konverteringsgrad >1,0', 29, konv.filter((v) => v > 1.0).length);

// 4. fördelning FCF-avkastning (av 87): >5 % · 2–5 % · <2 % (varav negativ 9)
const p = fy.map((v) => v * 100);
R('fy >5 %', 26, p.filter((v) => v > 5).length);
R('fy 2–5 %', 28, p.filter((v) => v >= 2 && v <= 5).length);
R('fy <2 %', 33, p.filter((v) => v < 2).length);
R('fy negativ', 9, p.filter((v) => v < 0).length);
R('fy summa = n', 87, p.filter((v) => v > 5).length + p.filter((v) => v >= 2 && v <= 5).length + p.filter((v) => v < 2).length);

// 5–14. per-ticker: värdet exakt + att listorna är de GLOBALA topp-5/botten-5 i FCF-marginal (bransch = notering)
const perTicker = (t) => b.find((x) => x.ticker === t);
const fmSorterad = [...b.filter((x) => tal(x.lonksamhet?.fcfMarginal))].sort((x, y) => y.lonksamhet.fcfMarginal - x.lonksamhet.fcfMarginal);
const topp5 = fmSorterad.slice(0, 5).map((x) => x.ticker);
const botten5 = fmSorterad.slice(-5).map((x) => x.ticker); // presentationen −3 → −72,9 = fortsatt sjunkande
const m = (a) => [...a].sort().join('|');
R('global topp-5 (uppsättning)', m(['KINV-B.ST', 'ORES.ST', 'INDU-C.ST', 'PLD', 'NFLX']), m(topp5));
R('global botten-5 (uppsättn.)', m(['AKRBP.OL', 'VOLCAR-B.ST', 'PSNY', 'RWE.DE', 'CAST.ST']), m(botten5));
R('botten-5 presenteras sjunkande', 'AKRBP.OL|VOLCAR-B.ST|PSNY|RWE.DE|CAST.ST', fmSorterad.slice(-5).map((x) => x.ticker).join('|'));
const kontroll = [ ['KINV-B.ST', '65,6'], ['ORES.ST', '63,9'], ['INDU-C.ST', '62,4'], ['PLD', '56'], ['NFLX', '52,5'], ['AKRBP.OL', '-3'], ['VOLCAR-B.ST', '-4,5'], ['PSNY', '-30,8'], ['RWE.DE', '-69,6'], ['CAST.ST', '-72,9'] ];
for (const [tk, vante] of kontroll) {
  const rad = perTicker(tk);
  if (!rad) { R(`${tk} rad`, 'finns', 'SAKNAS'); continue; }
  const vanteNum = parseFloat(vante.replace(',', '.'));
  const vardeOk = Math.abs(rad.lonksamhet.fcfMarginal * 100 - vanteNum) < 0.051;
  R(`${tk} FCF-marginal`, vante, vardeOk ? vante : pct1(rad.lonksamhet.fcfMarginal));
}

// datum + första-i-serien
R('hamtat 2026-09-03 (samtliga)', 100, b.filter((x) => x.hamtat === '2026-09-03').length);

// ── Juridik: kontrolleraText-spegel (forbjudnaFraser) + rådgivningsglossor + disclaimer
const utkast = JSON.parse(readFileSync(`${ROT}/${FIL}`, 'utf-8'));
const hela = JSON.stringify(utkast);
const vm = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, 'utf-8'));
const fraser = vm.kontrolleraText?.forbjudnaFraser || vm.forbjudnaFraser || [];
let fraseTräffar = [];
const textYta = (utkast.titel + ' ' + utkast.ingress + ' ' + utkast.bodyMarkdown).toLowerCase();
for (const f of fraser) {
  try { if (new RegExp(f.fran, 'i').test(textYta)) fraseTräffar.push(`${f.fran} (${f.allvar})`); } catch {}
}
const glossor = ['köp ', 'sälj ', 'rekommendera', 'bör du', 'aktietips', 'kursmål', 'riskfri', 'säker vinst', 'garanterad avkastning', 'investera i denna'];
let glossTräffar = [];
for (const g of glossor) if (textYta.includes(g)) glossTräffar.push(g);
console.log('JURIDIK: forbjudnaFraser-träffar:', JSON.stringify(fraseTräffar), '· rådgivningsglossor:', JSON.stringify(glossTräffar), '· disclaimer-sist:', utkast.bodyMarkdown.trimEnd().split('\n').pop().slice(0, 80));

// Form
console.log('FORM: titel', utkast.titel.length, 'tkn · ingress', utkast.ingress.length, 'tkn · body', utkast.bodyMarkdown.length, 'tkn · omslag', utkast.omslagUrl);

// ── Dom
const fel = r.filter((x) => x.dom === 'FEL');
console.log(`\nKONTROLLER: ${r.length - fel.length}/${r.length} OK`);
for (const x of r) console.log(`  ${x.dom === 'OK' ? '✓' : '✗ FEL'} ${x.namn}: väntat ${x.vante} · räknat ${x.faktiskt}`);
process.exit(fel.length ? 2 : 0);
