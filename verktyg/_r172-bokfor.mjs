// Rond 172 bokföring → commit
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const WS = '/home/ak1a/agent/ak1';
fs.appendFileSync(WS + '/worklog.md', `

## ROND 172 [organ:Φ] — v164 EMOTTAG DEL 2 + GRANSKNING med ÄKTA FYND: dublett kasserad, riskfri-fras kurad, f13–f21 GODKÄNT 63/63 — 2026-09-24 ~15:2x lokal
Emottag merge f6ca23fb (fabriken samtidigt 21→23/24 klara). GRANSKNING del 2 (f13+) gav först 8 FYND — tre var granskarens egna blindfläckar (tredje ärlig exempelformen "deklarerad övningsaritmetik": antaganden/låtsassiffror/konstruerade tal — f19/f20/f21-psykologiböckerna räknar i HELTAL: 74–107 talmarkörer i kompletta genomräkningar, decimalräknaren mätte fel dimension), två var ÄKTA: (1) DUBBLETT-f21 — två filer (trading-in-the-zone.md 900 ord / trading-in-zone.md 907) från fabriksomstartens föräldralöshet; FABRIKENS REGISTRET dömde (leveransrad kod 0 = trading-in-the-zone.md kanonisk) → B-varianten kasserad med git rm — registerhärden (rond 170) hade förebygggt just denna klass, nu bevittnad i verkligheten; (2) f19 "pappersexemplen är riskfria kapital" — meningsmässigt oskyldigt (övningshandel) men strök längs varumärkesgrindens förbjudna ord → kirurgiskt omformulerat "riskerar inget kapital". Efter kurer + domregler: 63/63 PASS, 9 filer (f13–f21). SAMMANLAGT v164: 21/24 underlag granskade-godkända (84+63 kontroller), 1 uppgift återstår i fabriken (23/24 klara). Rapport: GRANSKNING-v164-del2.md.`);
execFileSync('git', ['add', 'data/forskning/KURS-FAS3/GRANSKNING-v164-del2.md', 'data/forskning/KURS-FAS3/underlag-f19-complete-turtletrader.md', 'verktyg/_r172-lage.mjs', 'verktyg/_r172-emottag.mjs', 'verktyg/_r172-granska-v164-del2.mjs', 'verktyg/_r172-f21dom.mjs', 'verktyg/_r172-f21reg.mjs', 'verktyg/_r172-verkstall.mjs', 'verktyg/_r172-talnod.mjs', 'verktyg/_r172-bokfor.mjs', 'worklog.md'], { cwd: WS, encoding: 'utf8', timeout: 60000 });
execFileSync('git', ['commit', '-m', 'studio: rond 172 [organ:Φ] — v164 del 2 granskad: DUBBLETT-f21 kasserad på fabrikens registerdom + f19 riskfri-fras kurad + psykologiklassens heltalsaritmetik domgodkänd — f13-f21 GODKÄNT 63/63 (21/24 totalt)'], { cwd: WS, encoding: 'utf8', timeout: 420000, maxBuffer: 16 * 1024 * 1024 });
console.log('HEAD:', execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: WS, encoding: 'utf8' }).trim());
console.log('yta:', execFileSync('git', ['status', '--porcelain'], { cwd: WS, encoding: 'utf8' }).trim() || 'REN');
console.log('poll:', fs.readFileSync('/tmp/r167-pushpoll-status.txt', 'utf8').trim().split('\n').slice(-1)[0]);
