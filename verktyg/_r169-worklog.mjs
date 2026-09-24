// Atomisk worklog-append + commit (fönstret mellan pollens mergar)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const WS = '/home/ak1a/agent/ak1';
const rad = `

## ROND 169 [organ:Φ] — PUSH-GRÖN 2a63f2f3 + v164 SLÄPPT + mimosa-självhärdning — 2026-09-24 ~14:2x lokal
Push-poll instans 4 fullförde kedjan 12:18:12-12:20:16Z: EMOTTAGEN (s6/s7-leveranser) → PUSH-GRÖN ws=prod=2a63f2f3 (åtta commits: mimosakurerna, v164-manifestet, dataset-eyebrow, bokföringar) → färsk vakt → SLAPP-V164: ko/v164-fas3-djup.json (24 uppgifter). Vakten visade dock 3 mimosa-fynd — skannerns dom var riktig: FYNDEN VAR MINA EGNA commit-runers från rond 167-168 (interpolerade git-anrop i _r167-commit/_r168-pollfix/_r168-tsc — jag härdade fabriksbarnets verktyg men skrev egna scripts med samma synd). Självhärdning: alla tre → execFileSync-array, arbetsytan 0 fynd GRÖN, commit a42933df. Push av härden väntar på rent prod-fönster (poll instans 5 springer — ytan hålls av barnets motorervalidering + v164-omgången; inter-omgångsfönster fångas av pollens 60 s-takt). Fabriksstatus 12:3x: v164 "pågår" (plockat vid :x5-pump — Fas 3-underlagen byggs), prod-synken bygger (eyebrow-deploy på ingång), RAM under V235-vakternas sekvensering. Kvalitetsmålet 13/13 GRÖN i prod stängs när härden landat — vakten visar interim 3 FEL GUL.
`;
fs.appendFileSync(WS + '/worklog.md', rad);
execFileSync('git', ['add', 'worklog.md', 'verktyg/_r169-fabriksond.mjs', 'verktyg/_r169-worklog.mjs'], { cwd: WS, encoding: 'utf8', timeout: 60000 });
execFileSync('git', ['commit', '-m', 'studio: rond 169 bokföring [organ:Φ] — worklog: push-grön 2a63f2f3 + v164-släpp + självhärdning; eyebrow-deploy + v164-omgång pågår'], { cwd: WS, encoding: 'utf8', timeout: 420000, maxBuffer: 16 * 1024 * 1024 });
console.log('HEAD:', execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: WS, encoding: 'utf8' }).trim());
console.log('yta:', execFileSync('git', ['status', '--porcelain'], { cwd: WS, encoding: 'utf8' }).trim() || 'REN');
console.log('--- poll senaste ---');
console.log(fs.readFileSync('/tmp/r167-pushpoll-status.txt', 'utf8').trim().split('\n').slice(-2).join('\n'));
