// _v224b-commit.mjs — footer-kurens commit.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 60) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); } catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-4).join('\n'); } }
fs.writeFileSync('/tmp/v224b-msg.txt', `studio: [organ:Φ] v224 fortsättning — footerns kurstal ur guldkällan ("300+"-föråldringen; samma klass som 307:an)

FYND 2 i finslipningsklassen: footer.tsx "300+ moduler i 27 kategorier"
var hårdkodad trots kommentaren "ur deep-courses.json via siffror.ts" —
kommentaren beskrev en sanning som aldrig kopplades; texten understated
kursutbudet med 200 kurser (registret: 507).

KUR: {SIFFROR.kurser} moduler i 27 kategorier — kurstalet ur guldkällan
(siffror.ts, genereras av rakna-siffror efter varje kurstillägg) kan
aldrig åldras igen; kategoriantalet 27 VERIFIERAT mot registret (exakt 27
unika kategorier, räknare _v224-kategorier.mjs) och lämnas design-hård-
kodat. TSC GRÖN 0 fel · landar via nästa byggcykel · gränsnittsvakten
verifierar efter deploy ("507 moduler" = +2 tecken i xs-rad — vakten
passerar eller kur levereras).`);
console.log(ko('git add src/components/ak1a/footer.tsx worklog.md verktyg/_v224-kategorier.mjs verktyg/_v224-commit.mjs 2>&1 | tail -2'));
console.log(ko('git commit -F /tmp/v224b-msg.txt 2>&1 | tail -3', 300));
console.log('\n' + ko('git log --oneline -2'));
console.log('yta: ' + (ko('git status --short | head -3') || '(ren)'));
