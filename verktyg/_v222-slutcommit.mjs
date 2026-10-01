// _v222-slutcommit.mjs — rondens bokföringscommit (worklog-addendum + pipeline + verktyg).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

function ko(kommando, takSek = 60) {
  try { return execFileSync('bash', ['-c', kommando], { encoding: 'utf8', timeout: takSek * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); }
  catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-5).join('\n'); }
}

fs.writeFileSync('/tmp/v222b-msg.txt', `studio: [organ:Φ] v222 bokföring — dubbelleveransens efterhänder + rondstatus i PIPELINE-KO

- Worklog-addendum: (1) DUBBELLEVERANSEN bokförd — v222 och fabrikens s8-u1
  löste samma GUL-fel (/zcode) med samma roträttsbeslut; merge ccac7fbd
  förenade (konflikt endast i kommentartext, kodraden identisk); koordstatus-
  fil skriven FÖRE merge enligt v221-regeln. (2) Gränsnittsvakten 0 fynd
  (01:39-svepet) — "vakten till 0 fynd" kvitterat på båda fronterna.
  (3) deep-courses.json-diagnos: avskriven som kundproblem (admin+crawlers
  hämtar hel; kunder via per-kurs-API). (4) Deploy-bygget rullar sedan
  03:27 i JÄRN-U1-ställning. (5) v219-fönstrets ordning bokförd.
- PIPELINE-KO: ROND v222-tillagd (sex rader: byggutfall, zcode-dubbelleverans,
  gränsnitt kvitterad, deep-courses-notis, långpollare-push, v219-väntan).
- Verktyg: _v222-vanta/-vanta2/-langpollare (fönsterväntarna) +
  _v222-status/-granssnittlas/-mergelas/-mergecommit (rondens sonder).`);

console.log('== ADD + COMMIT ==');
console.log(ko('git add worklog.md data/forskning/PIPELINE-KO.md verktyg/_v222-vanta.mjs verktyg/_v222-vanta2.mjs verktyg/_v222-langpollare.mjs verktyg/_v222-status.mjs verktyg/_v222-granssnittlas.mjs verktyg/_v222-mergelas.mjs verktyg/_v222-mergecommit.mjs 2>&1 | tail -2'));
console.log(ko('git commit -F /tmp/v222b-msg.txt 2>&1 | tail -3', 300));
console.log('\n== LÄGE ==');
console.log(ko('git log --oneline -3'));
console.log('yta: ' + (ko('git status --short | head -4') || '(ren)'));
