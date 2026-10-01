// _v224-commit.mjs — finslipningscommiten (nämnar-kuren).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 60) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); } catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-4).join('\n'); } }
fs.writeFileSync('/tmp/v224-msg.txt', `studio: [organ:Φ] v224 finslipning — läroplansnämnaren ur guldkällan (307-föråldringen kurad)

FYND: min-sida.tsx hårdkodade LAROPLAN_TOTAL = 307 (senast uppdaterad
2026-09-01) medan registret växt till 507 kurser — medlemmens dashboard
visade "X av 307 kurser" och en FÖR HÖG procent; nämnaren åldrades i
tysthet genom sex kurstilläggsomgångar. Kvalitetsvaktens sektion 10
(föråldrade tal i copy) ser inte klassen: den fångar tal i textsträngar,
inte hårdkodade konstant-nämnare.

KUR: LAROPLAN_TOTAL = SIFFROR.kurser — husets eget "ur guldkällan"-mönster
(siffror.ts genereras av rakna-siffror.mjs efter varje kurstillägg);
 talet kan aldrig åldras igen. VERIFIERAT: tsc GRÖN 0 fel · SIFFROR var
redan importerad · 507 = samma teckenbredd som 307 (noll layoutrisk).

GRANNKONTROLL: V_KURSER_TOTAL = 20 (min-sida + dashfraga) är korrekt —
V-spåret är 20/20 av design (bevisat mot registret: exakt 20 v-slugs av
507). Inga andra hårdkodade kurstal i src (333:orna i ordlistan är
historisk fas-text).

SEKVENS: landar via prod-synkens nästa byggcykel (pågående ombygg rullar
under låset — ingen tvingad build); gränsnittsvakts-verifiering efter
deploy. Worklog v224 bokförd.`);
console.log(ko('git add src/components/ak1a/min-sida.tsx worklog.md verktyg/_v223-byggbevakare2.mjs verktyg/_v223-vkurs.mjs verktyg/_v223-tsc.mjs verktyg/_v223b-commit.mjs 2>&1 | tail -2'));
console.log(ko('git commit -F /tmp/v224-msg.txt 2>&1 | tail -3', 300));
console.log('\n' + ko('git log --oneline -2'));
console.log('yta: ' + (ko('git status --short | head -3') || '(ren)'));
