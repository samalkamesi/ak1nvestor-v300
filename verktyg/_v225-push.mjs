// _v225-push.mjs — pusha 5622c775 (v225 + merge) till prod — ENDAST när låset är FRIKT.
// Dubbelskydd: sonderar låset + fabrikstystnad FÖRE push; avbryter utan att röra prod.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 60) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); } catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-3).join('\n'); } }

console.log('== FÖRKOLL ==');
const prodRen = ko('git -C /home/ak1a/AK1 status --short | head -3');
console.log('prod-yta:', prodRen || '(ren)');
if (prodRen) { console.log('AVBRYTER — prod-ytan är icke-ren'); process.exit(1); }

const las = ko("exec 9<>/tmp/ak1a-deploy.lock && flock -n 9 && echo FREET || echo UPPTAGET");
console.log('deploy-lås:', las);
if (las !== 'FREET') { console.log('AVBRYTER — byggfönster löper'); process.exit(1); }

let aktiva = 0;
try { for (const f of fs.readdirSync('/home/ak1a/AK1/data/vakten/agentfabrik/status')) {
  if (!f.endsWith('.json')) continue;
  try { const j = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/' + f, 'utf8'));
    if (j.status === 'pågår' || j.status === 'vantar-ram' || j.status === 'vantar-deploy') aktiva++;
  } catch {}
} } catch {}
console.log('aktiva fabrikens manifest (pågår/vantar-*):', aktiva);

console.log('\n== PUSH ==');
console.log(ko('git push prod develop 2>&1 | tail -4', 180));
console.log('\n== BEVIS ==');
console.log('prod-HEAD:', ko('git -C /home/ak1a/AK1 log --oneline -1 | head -c 120'));
console.log('mitt HEAD:', ko('git log --oneline -1 | head -c 120'));
console.log('divergens kvar: prod-saknar=' + ko('git rev-list --count prod/develop..develop') + ' jag-saknar=' + ko('git rev-list --count develop..prod/develop'));
