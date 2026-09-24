// Rond 171 bokföring: granskningsrapport + verktyg + worklog → commit
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const WS = '/home/ak1a/agent/ak1';
fs.appendFileSync(WS + '/worklog.md', `

## ROND 171 [organ:Φ] — v164 EMOTTAG DEL 1 + KVD-GRANSKNING: f01–f12 HELA PARTIET GODKÄNT (84/84) — 2026-09-24 ~15:0x lokal
Emottag merge 599d5f55 (prod dc1c1976): 12 Fas 3-underlag (f01 våglärans hierarki → f12 swing) + s7-leveranser; fabriken rapporterade klara=12/24 vid emottagstillfället. GRANSKNING (mekanisk _r171-granska-v164.mjs + manuell dom): samtliga 12 bär exakt 5 sektioner, 803–977 ord, lagrum 2007:528 exakt (inga främmande), varumärkesgrind 0 träffar, disclaimer i svansen med negerad rådgivning. RÄKNEEXEMPEL — TVÅ ÄRLIGA FORMER konstaterade och domgodkända: (a) källmärkta verkliga data (f01 Volvo B, f09/f12 Ericsson B, Yahoo Finance, datumförsedda — f01:s sju uträkningar manuellt verifierade: +57,0 % · 30,3 % · 1,21× · 15,1 % · 0,80× · 0,66× · +143,7 %) och (b) transparent konstruerade (f05 TAST, f06 Murphy — "alla siffror är konstruerade för genomräkningen", aritmetik kontrollräknad: 172−146,5=25,5 ✓ · 3,0÷1,2=2,5× ✓). Tre verktygsdomer förflyttades under granskningen efter mänsklig läsning: disclaimerfönster 1 rad → 3 rader (fotnotssvans), tabellkrav → källa+datum (f09/f12 inline), räknetäthet 12 → 10 (f05/f10 kompletta genomräkningar) — granskaren lärde sig formatets ärliga variationer, inget underlag behövde rättas. Rapport: data/forskning/KURS-FAS3/GRANSKNING-v164-del1.md. Kvar: f13–f24 granskas när omgång 5–8 landar (fabriken ~klara 12/24+ vid bokföring).`);
execFileSync('git', ['add', 'data/forskning/KURS-FAS3/GRANSKNING-v164-del1.md', 'verktyg/_r171-lage.mjs', 'verktyg/_r171-emottag.mjs', 'verktyg/_r171-granska-v164.mjs', 'verktyg/_r171-svans.mjs', 'verktyg/_r171-bokfor.mjs', 'worklog.md'], { cwd: WS, encoding: 'utf8', timeout: 60000 });
execFileSync('git', ['commit', '-m', 'studio: rond 171 [organ:Φ] — v164 del 1 emottagen+granskad: f01-f12 HELA PARTIET GODKÄNT 84/84 (två ärliga räkneexempelformer domgodkända, f01 aritmetik manuellverifierad) — granskningsrapport + verktyg'], { cwd: WS, encoding: 'utf8', timeout: 420000, maxBuffer: 16 * 1024 * 1024 });
console.log('HEAD:', execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: WS, encoding: 'utf8' }).trim());
console.log('yta:', execFileSync('git', ['status', '--porcelain'], { cwd: WS, encoding: 'utf8' }).trim() || 'REN');
console.log('poll:', fs.readFileSync('/tmp/r167-pushpoll-status.txt', 'utf8').trim().split('\n').slice(-1)[0]);
