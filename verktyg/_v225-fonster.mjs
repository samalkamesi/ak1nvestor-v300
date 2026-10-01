// _v225-fonster.mjs — sond av push-fönstret: prod-trädet, fabriken, låset, divergens.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 45) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000 }).trim(); } catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-3).join('\n'); } }

console.log('== PROD-TRÄD (/home/ak1a/AK1) ==');
console.log('status:', ko('git -C /home/ak1a/AK1 status --short | head -10') || '(rent)');
console.log(ko('git -C /home/ak1a/AK1 log --oneline -6'));

console.log('\n== DIVERGENS (mitt träd vs prod) ==');
console.log('fetch:', ko('git fetch prod develop 2>&1 | tail -1') || '(upp till datum)');
const saknasIProd = ko('git rev-list --count prod/develop..develop');
const saknasHosMig = ko('git rev-list --count develop..prod/develop');
console.log('commits prod saknar (jag ska pusha):', saknasIProd);
console.log('commits jag saknar (prod har lokala):', saknasHosMig);
if (saknasHosMig !== '0') console.log(ko('git log --oneline develop..prod/develop | head -8'));

console.log('\n== FABRIK (prod) ==');
const fdir = '/home/ak1a/AK1/data/vakten/agentfabrik';
try {
  console.log('rot:', fs.readdirSync(fdir).filter(f => f === 'AUTO-PAUS' || f.startsWith('LOCK') || f.startsWith('ko')).join(', ') || '(ingen AUTO-PAUS/LOCK/ko)');
  const st = fs.readdirSync(fdir + '/status');
  for (const f of st) {
    try { const j = JSON.parse(fs.readFileSync(fdir + '/status/' + f, 'utf8'));
      console.log(`  ${f}: status=${j.status} progress=${j.klara ?? '?'}/${j.totalt ?? '?'} uppdaterad=${j.uppdaterad ?? '?'}`);
    } catch { console.log(`  ${f}: (ogiltig JSON)`); }
  }
} catch (e) { console.log('(fabrikskat:', e.message.split('\n')[0], ')'); }

console.log('\n== DEPLOY-LÅS ==');
console.log('låsfil finns:', fs.existsSync('/tmp/ak1a-deploy.lock'));
console.log('flock-probe:', ko("exec 9<>/tmp/ak1a-deploy.lock && flock -n 9 && echo 'FREET (fönster öppet)' || echo 'UPPTAGET (byggfönster löper)'"));

console.log('\n== PM2 ==');
console.log(ko("pm2 jlist 2>/dev/null | node -e 'let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{for(const p of JSON.parse(s)) console.log(p.name+\": \"+p.pm2_env.status)})'"));
