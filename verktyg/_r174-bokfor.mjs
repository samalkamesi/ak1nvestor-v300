// Rond 174: design-commit + worklog
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1';
const git = (args, t = 300000) => execFileSync('git', args, { cwd: ws, timeout: t }).toString().trim();

const wl = `
## ROND 174 [organ:Φ] — v166-DESIGN FASTSTÄLLD + dirigentläge klargjort (buffrad logg) — 2026-09-24 ~13:5x lokal
Dirigentfynd: den härdade dirigenten (pid 3273252) LEVER — loggens 13:51-slut är blockbuffrad stdout till fil (icke-tty fd), ps är sanningen; den väntar korrekt (4 s9-barn lever, RAM 1,0 GB, prod-ytan spådat-ren, ammars=true sedan emottag 81fabc02) och pushar när omgången går ut — deadline 14:34Z. DESIGN v166 (Fas 3-djupintegrering) FASTSTÄLLD efter formatgrävning i flaggskeppet: ETT avslutande djupkapitel "Från boken till egen analys" per kurs, underlagets 5 sektioner mappade på blocktyperna text/insikt/utmaning/tabell, quiz 3 (q/alternativ/ratt/tips), append-only (chapters+chapters_list+chapterCount+totalMinutes, Σ-konsistens = vaktkrav), räkneexempel ÖVERFÖRS ORDAGRANT med sin käll-/övningsdeklaration, R2 orörd (kurserna förblir låsta). Manifest 24 uppgifter skrivs+släpps FÖRST efter landad push-kedja (sekvensregeln). Dokument: data/forskning/KURS-FAS3/DESIGN-v166-djupintegrering.md. Verktyg: _r174-{sond,grav,bokfor}.mjs.
`;
fs.appendFileSync(`${ws}/worklog.md`, wl);

fs.writeFileSync('/tmp/r174.txt', 'studio: rond 174 [organ:\u03a6] \u2014 v166-design fastst\u00e4lld: ett djupkapitel per Fas 3-kurs (append-only, \u03a3-konsistens, ordagrann tal\u00f6verf\u00f6ring, R2 or\u00f6rd) \u2014 manifest sl\u00e4pps efter landad push-kedja');
console.log(git(['add', 'data/forskning/KURS-FAS3/DESIGN-v166-djupintegrering.md', 'worklog.md',
  'verktyg/_r174-sond.mjs', 'verktyg/_r174-grav.mjs', 'verktyg/_r174-bokfor.mjs']));
console.log(git(['commit', '-F', '/tmp/r174.txt']).split('\n')[0]);
console.log('HEAD:', git(['log', '--oneline', '-1']));
console.log('STATUS:', git(['status', '--porcelain']) || '(ren)');
