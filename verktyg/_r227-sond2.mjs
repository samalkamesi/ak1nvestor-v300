#!/usr/bin/env node
// Rond 227 — sond 2: motorervalideringens rapportrubriker i prod + lighthouse-precedens + kollisionskoll för de 26 untracked
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';

// A. Prods status nu (fånga ev. ny rapport under arbetet)
const status = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.trim());
console.log(`A. PROD-SMUTS: ${status.length} rader`);

// B. Motorervalidering i prod: senaste rapportrubrikerna + längd + vad arbetsytan har
const prodRap = `${PROD}/data/rapporter/motorervalidering-2026-09-02.md`;
const text = readFileSync(prodRap, 'utf8');
const rubriker = [...text.matchAll(/^# Motorervalidering — 100%-väktaren — (\S+)$/gm)].map(m => m[1]);
console.log(`B. RAPPORTER totalt ${rubriker.length}; sista 3: ${rubriker.slice(-3).join(' | ')}`);
const resultat = [...text.matchAll(/\*\*RESULTAT: (\d+) PASS \/ (\d+) FAIL \/ (\d+) SKIP\*\*/g)].map(m => `${m[1]}/${m[2]}/${m[3]}`);
console.log(`   senaste RESULTAT: ${resultat[resultat.length - 1]} (av ${resultat.length})`);
console.log(`   prod längd ${statSync(prodRap).size} B; arbetsyta längd ${statSync(`${ROT}/data/rapporter/motorervalidering-2026-09-02.md`).size} B`);

// C. Lighthouse-katalogen: precedens i arbetsytan (vad är tracked/commit historik)
console.log('C. LIGHTHOUSE i arbetsytan:');
const ls = execFileSync('ls', ['-la', `${ROT}/data/forskning/OPTIMERING/lighthouse/`], { encoding: 'utf8' });
console.log(ls.split('\n').slice(0, 20).join('\n'));
const logg = execFileSync('git', ['-C', ROT, 'log', '--oneline', '-3', '--', 'data/forskning/OPTIMERING/lighthouse/'], { encoding: 'utf8' });
console.log(`   git log (sista 3): ${logg.trim().split('\n').join(' ⏎ ') || '(tom — katalogen ny i git)'}`);

// D. Kollisionskoll: finns prodens untracked-filer redan i arbetsytan (och i så fall identiska?)
console.log('D. KOLLISIONSKOLL (untracked i prod → arbetsyta):');
const untracked = status.filter(r => r.startsWith('??')).map(r => r.slice(3).replace(/"/g, ''));
let identiska = 0, saknas = 0, skiljer = 0;
for (const f of untracked) {
  const a = `${ROT}/${f}`, b = `${PROD}/${f}`;
  if (!existsSync(a)) { saknas++; continue; }
  if (readFileSync(a).equals(readFileSync(b))) { identiska++; console.log(`   IDENTISK  ${f}`); }
  else { skiljer++; console.log(`   SKILJER   ${f} (arbetsytan ${statSync(a).size} B vs prod ${statSync(b).size} B)`); }
}
console.log(`   sammanfattning: ${saknas} saknas i arbetsytan · ${identiska} identiska · ${skiljer} skiljer`);
