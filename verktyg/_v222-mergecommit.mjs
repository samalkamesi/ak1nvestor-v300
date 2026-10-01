// _v222-mergecommit.mjs — verifiera + committa merge + pusha prod (node-kanal).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function ko(kommando, takSek = 90) {
  try { return execFileSync('bash', ['-c', kommando], { encoding: 'utf8', timeout: takSek * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); }
  catch (e) { return 'FEL:\n' + String(e.stdout || '') + String(e.stderr || ''); }
}

// 1) Syntaxkontroll av sammanslagen vakt
console.log('== SYNTAX ==');
console.log(ko('node --check verktyg/kvalitetsvakt.mjs && echo SYNTAX-OK'));

// 2) Konfliktmarkörer kvar?
const src = fs.readFileSync('verktyg/kvalitetsvakt.mjs', 'utf8');
console.log('konfliktmarkörer kvar:', (src.match(/[<>=]{7}/g) || []).length);

// 3) Worklog-unionen: visas fabrikens s8-rader + min v222-sektion?
const wl = fs.readFileSync('worklog.md', 'utf8');
console.log('worklog: v222-sektion', wl.includes('VÅG 222') ? 'FINNS' : 'SAKNAS', '· s8/o573-rader', wl.includes('o573') ? 'FINNS' : 'SAKNAS');

// 4) Stage + commit
fs.writeFileSync('/tmp/v222-merge-msg.txt', `merge: prod -> develop — v222 rund-commit + fabrikens auto-s8-u1 (o573 byggartefaktkuren) förenade

DUBBELLEVERANS av samma roträttsbeslut (v221-ko-incidentens andra händelse,
denna gång utan kollision): både v222 (organ:Φ, commit 890de2d5) och fabrikens
auto-s8-u1 (o573/v180, commit b55660a4) löste kvalitetsrapportens GUL-fel
"/zcode saknas i sitemap" med SAMMA roträttsbeslut — /zcode är v216:s
en-trycks-ingång till agentchatten, layouten bär MEDVETET robots noindex/
nofollow, alltså hör den hemma i vaktens SITEMAP_EXKLUDERA (syskonet /studio)
och ALDRIG i sitemap (Search Console "Submitted URL marked 'noindex'").

Konfliktlösning: kommentarblocket förenat (dubbelleveransen bokförd i koden),
kodraden var identisk på båda sidor. Med sig från prod: o573-byggartefakt-
kuren (.bygg-kopia ur mimosa-domänen v1.7 + 2,5 GB-städning + dokumenterad
OPTIMERING-not) + mimosa-paritet/testa-mimosa-paritet-förbättringar.

Koordstatusfil skriven FÖRE merge: data/vakten/v222-merge-status.md
(v221-regeln: merge-lösningar kommuniceras via statusfiler FÖRE commit).`);

console.log('\n== STAGE ==');
console.log(ko('git add verktyg/kvalitetsvakt.mjs data/vakten/v222-merge-status.md verktyg/_v222-mergea.mjs verktyg/_v222-mergelas.mjs verktyg/_v222-pusha.mjs && git status --short | head -10'));

console.log('\n== COMMIT ==');
console.log(ko('git commit -F /tmp/v222-merge-msg.txt 2>&1 | tail -4', 300));

console.log('\n== PUSH ==');
console.log(ko('git push prod develop 2>&1 | tail -4', 180));

console.log('\n== VERIFIERING ==');
console.log(ko('git log --oneline -3'));
try { console.log('PROD: ' + execFileSync('bash', ['-c', 'cd /home/ak1a/AK1 && git log --oneline -1'], { encoding: 'utf8', timeout: 20000 }).trim()); } catch (e) { console.log('(prod-läsning fel)'); }
