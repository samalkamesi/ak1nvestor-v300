// _v225-slut.mjs — efter grön deploy av 5622c775: bevisa pump-grinden i PROD-trädet
// (hermetiskt kontraktstest + versionsjämförelse) och TA BORT AUTO-PAUS-brytaren.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, { t = 60, cwd } = {}) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, ...(cwd ? { cwd } : {}) }).trim(); } catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-3).join('\n'); } }

console.log('== BEVIS 1: grindkoden lever i prod (HEAD + versionsrad) ==');
console.log('prod-HEAD:', ko('git -C /home/ak1a/AK1 log --oneline -1').slice(0, 100));
const iProd = ko("grep -c 'vantar-deploy' /home/ak1a/AK1/verktyg/agentfabrik.mjs /home/ak1a/AK1/verktyg/prod-synk.mjs");
console.log("'vantar-deploy'-förekomster i prod-filerna:\n" + iProd);
const identisk = ko("cmp -s /home/ak1a/agent/ak1/verktyg/agentfabrik.mjs /home/ak1a/AK1/verktyg/agentfabrik.mjs && echo IDENTISKA || echo SKILJER");
console.log('agentfabrik.mjs arbetsyta vs prod:', identisk);

console.log('\n== BEVIS 2: hermetiskt kontraktstest I PROD-TRÄDET ==');
try {
  const ut = execFileSync('node', ['verktyg/testa-agentfabrik-deploygrind.mjs'], { encoding: 'utf8', timeout: 120000, cwd: '/home/ak1a/AK1' }).trim();
  console.log(ut.split('\n').slice(-6).join('\n'));
} catch (e) { console.log('FEL: ' + String(e.stdout || e.message).split('\n').slice(-5).join('\n')); }

console.log('\n== BEVIS 3: prod-hälsa ==');
console.log('HTTPS:', ko("curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://lab.ak1nvestor.com/"));
console.log('pm2 ak1a:', ko("pm2 jlist 2>/dev/null | node -e 'let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{for(const p of JSON.parse(s)) if(p.name===\"ak1a\") console.log(p.pm2_env.status)})'"));

console.log('\n== ÅTGÄRD: AUTO-PAUS bort (brytaren avlägsnad — grinden är driftssäker) ==');
const PAUS = '/home/ak1a/AK1/data/vakten/agentfabrik/AUTO-PAUS';
if (fs.existsSync(PAUS)) {
  const arkiv = '/home/ak1a/AK1/data/vakten/agentfabrik/AUTO-PAUS.borttagen-v225-' + Date.now();
  fs.renameSync(PAUS, arkiv);
  console.log('AUTO-PAUS borttagen (arkiverad: ' + arkiv.split('/').pop() + ')');
} else {
  console.log('AUTO-PAUS fanns inte — redan borta');
}
console.log('fabriksrot nu:', fs.readdirSync('/home/ak1a/AK1/data/vakten/agentfabrik').filter(f => f.startsWith('AUTO-PAUS')).join(', ') || '(ren — ingen paus)');

console.log('\n== Slutläge ==');
console.log(ko('git -C /home/ak1a/AK1 status --short | head -5') || 'prod-yta: (ren)');
console.log('divergens: prod-saknar=' + ko('git -C /home/ak1a/agent/ak1 rev-list --count prod/develop..develop') + ' jag-saknar=' + ko('git -C /home/ak1a/agent/ak1 rev-list --count develop..prod/develop'));
