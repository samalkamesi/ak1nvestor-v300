// Rond 152-leverans: svältstoppets RAM-vaccin i prod-synk — worklog + beslutsminne + commit + push
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 32 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 250); } };
const blockerare = () => S(P, 'git', ['status', '--porcelain'], 30000).trim().split('\n').filter(r => r && !r.startsWith('??'));
const ut = { nu: new Date().toISOString() };
if (/rond 152/.test(S(A, 'git', ['log', '--oneline', '-2'], 30000))) { ut.hoppa = 'redan levererad'; console.log(JSON.stringify(ut, null, 1)); process.exit(0); }

fs.appendFileSync(A + '/worklog.md', '\n## ROND 152 [organ:Δ] — SVÄLTSTOPPETS RAM-VACCIN (prod-synk.mjs): FEMTE mördade bygget (20:07→20:11:50Z, synkens svältstopps-tvång) föranledde rotkur — svältstoppets "bygg ändå vid aktiv fabrik" lit på ps-reserven 850 MB/barn ensam, men ett KALLT Turbopack-bygg (rivet .next sedan 18:46Z) äter mer än reserven skyddar: samtliga fem döda (18:37, 19:27, 19:32-död, 19:37, 20:07) föll i "Creating an optimized production build" med kernel-Killed. KUR: TVINGAT_BYGG_MIN_MB=5000 — tvingat bygg vid aktiv fabrik kräver även ≥5 000 MB fritt, annars VÄNTAR-RAM-TVINGAT (fabrikens egna 25-min-tak gör svälten icke-evig; HEAD orörd). node --check grön + ramvakts-kontraktssviten 22/22 PASS (strukturkontraktet för 2b hittar sina markörer). Verkställs vid prod-trädets nästa poll efter push.\n');
const rad = JSON.stringify({
  ts: ut.nu, rond: 152,
  beslut: 'Svältstoppets RAM-vaccin i prod-synk: tvingat bygg vid aktiv fabrik kräver ≥5 000 MB fritt (TVINGAT_BYGG_MIN_MB) — ps-reserven ensam bevisad otillräcklig av fem kernel-dödade kallbyggen 09-21; annars VÄNTAR-RAM-TVINGAT till nästa poll; kontraktssvit 22/22 PASS',
  landat: 'prod-synk.mjs (2b-grenen + konstant + V235-kommentar) + worklog'
}) + '\n';
for (const t of [A + '/data/vakten/beslutsminne.jsonl', P + '/data/vakten/beslutsminne.jsonl']) { try { fs.appendFileSync(t, rad); } catch (e) { ut.minneFEL = e.message.slice(0, 60); } }

S(A, 'git', ['add', '-A'], 60000);
ut.commit = S(A, 'git', ['commit', '-m', 'studio: rond 152 [organ:Δ] — svältstoppets RAM-vaccin: prod-synkens tvingade bygg vid aktiv fabrik kräver nu ≥5000 MB fritt (TVINGAT_BYGG_MIN_MB) — fem kernel-dödade kallbyggen 09-21 (varav två svältstopps-tvång) bevisar ps-reserven ensam otillräcklig för Turbopacks optimeringsfas; VÄNTAR-RAM-TVINGAT-väntan är icke-evig (fabrikens 25-min-tak); 22/22 kontrakt PASS'], 300000).split('\n').find(r => /files changed|develop/i.test(r)) || 'OK';
for (let i = 1; i <= 4; i++) {
  if ((blockerare() || []).length === 0) {
    S(A, 'git', ['fetch', 'prod', 'develop'], 60000);
    const bakom = +(S(A, 'git', ['rev-list', '--count', 'HEAD..prod/develop'], 30000).trim() || '0');
    if (bakom > 0) S(A, 'git', ['merge', 'prod/develop', '--no-edit', '-m', 'studio: merge prod → develop (rond 152)'], 120000);
    const push = S(A, 'git', ['push', 'prod', 'develop'], 120000);
    if (!/FEL/.test(push)) { ut.pushad = true; break; }
    ut['retry' + i] = push.slice(0, 90);
  } else { ut['vantar' + i] = blockerare().slice(0, 2); }
  if (i < 4) await new Promise(r => setTimeout(r, 50000));
}
ut.head = S(A, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 70);
console.log(JSON.stringify(ut, null, 1));
