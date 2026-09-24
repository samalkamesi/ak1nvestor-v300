// Rond 151-bokföring: våg 232-statusdom (jakt död, attempt 5 villkorat) — worklog + beslutsminne + commit + push
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 32 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 250); } };
const blockerare = () => S(P, 'git', ['status', '--porcelain'], 30000).trim().split('\n').filter(r => r && !r.startsWith('??'));
const ut = { nu: new Date().toISOString() };
if (/rond 151/.test(S(A, 'git', ['log', '--oneline', '-2'], 30000))) { ut.hoppa = 'redan bokförd'; console.log(JSON.stringify(ut, null, 1)); process.exit(0); }

fs.appendFileSync(A + '/worklog.md', '\n## ROND 151 [organ:Ψ] — VÅG 232-STATUSDOM: V230-jakten DÖD utan suffixrapport (pid 3764362 borta; senaste aggregator-på-disk = 09-20 13:39Z mini-rapport 1 svit; attempt 4:s loggbevarade 154 mätta förblir sista fulla sanningen). STRATEGIDOM: fullsvep attempt 5 VILLKORAT — först grönt prodbygg (fyra mördade byggen 09-21 kväll + saknad .next är minnesbeviset) OCH tommare fabrik; aggregatorns V217/V223-skydd bär körningen. PIPELINE-KO:s våg 232-rad uppdaterad med status + villkor. SYSTEMKARTAN-gapet (rad 2670/2680) förblir öppet till attempt 5:s SENASTE-rapport. DoD-spåret: synk-poll 20:07Z + svältstopp ~20:27Z; bevakare 1+2 pollar (tak 20:27Z/21:39Z).\n');
const rad = JSON.stringify({
  ts: ut.nu, rond: 151,
  beslut: 'Våg 232-statusdom: V230-jakten död utan suffixrapport bokförd ärligt; fullsvep attempt 5 villkorat (grönt bygg + tommare fabrik — minnesbevis: fyra mördade byggen); PIPELINE-KO-rad uppdaterad; helsvepsbevis-gapet i SYSTEMKARTAN förblir öppet till dess',
  landat: 'PIPELINE-KO våg 232-rad + worklog'
}) + '\n';
for (const t of [A + '/data/vakten/beslutsminne.jsonl', P + '/data/vakten/beslutsminne.jsonl']) { try { fs.appendFileSync(t, rad); } catch (e) { ut.minneFEL = e.message.slice(0, 60); } }

S(A, 'git', ['add', '-A'], 60000);
ut.commit = S(A, 'git', ['commit', '-m', 'studio: rond 151 [organ:Ψ] — våg 232-statusdom: V230-jakten död utan suffixrapport; fullsvep attempt 5 villkorat (grönt bygg + tommare fabrik); PIPELINE-KO-rad uppdaterad; helsvepsbevis-gapet öppet till attempt 5'], 300000).split('\n').find(r => /files changed|develop/i.test(r)) || 'OK';
for (let i = 1; i <= 4; i++) {
  if ((blockerare() || []).length === 0) {
    S(A, 'git', ['fetch', 'prod', 'develop'], 60000);
    const bakom = +(S(A, 'git', ['rev-list', '--count', 'HEAD..prod/develop'], 30000).trim() || '0');
    if (bakom > 0) S(A, 'git', ['merge', 'prod/develop', '--no-edit', '-m', 'studio: merge prod → develop (rond 151)'], 120000);
    const push = S(A, 'git', ['push', 'prod', 'develop'], 120000);
    if (!/FEL/.test(push)) { ut.pushad = true; break; }
    ut['retry' + i] = push.slice(0, 90);
  } else { ut['vantar' + i] = blockerare().slice(0, 2); }
  if (i < 4) await new Promise(r => setTimeout(r, 50000));
}
ut.head = S(A, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 70);
console.log(JSON.stringify(ut, null, 1));
