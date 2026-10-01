// _v221-laslat.mjs — vem håller deploy-låset? prod-synkens logg + processkort.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const kora = (cmd, args, t = 15000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t }).trim(); } catch (e) { return 'FEL: ' + String(e.message).slice(0, 120); } };

console.log('== Låshållare (fuser) ==');
console.log(kora('bash', ['-c', 'fuser -v /tmp/ak1a-deploy.lock 2>&1 || true']));

console.log('\n== Processer med låsfilen öppen ==');
console.log(kora('bash', ['-c', "grep -l 'ak1a-deploy.lock' /proc/[0-9]*/fd/* 2>/dev/null | head -5 || echo '(ingen)'"]));

console.log('\n== npm/next-byggprocesser ==');
console.log(kora('bash', ['-c', "ps -eo pid,etime,cmd | grep -E 'npm (ci|run)|next build' | grep -v grep || echo '(inga)'"]));

console.log('\n== prod-synk-loggen (sista 25 raderna) ==');
for (const kandidat of ['/tmp/prod-synk.log', 'data/infra/contabo/prod-synk.log', '/tmp/ak1a-prod-synk.log']) {
  for (const bas of ['/home/ak1a/AK1', '/home/ak1a/agent/ak1']) {
    const p = bas + '/' + kandidat;
    if (fs.existsSync(p)) {
      console.log(`--- ${p} ---`);
      console.log(fs.readFileSync(p, 'utf8').trim().split('\n').slice(-25).join('\n'));
    }
  }
}

console.log('\n== .next-läge ==');
console.log('.next finns: ' + fs.existsSync('/home/ak1a/AK1/.next'));
try { console.log('.next innehåll: ' + fs.readdirSync('/home/ak1a/AK1/.next').slice(0, 10).join(', ')); } catch (e) { console.log('(läsfel)'); }
console.log('.bygg-kopia finns: ' + fs.existsSync('/home/ak1a/AK1/.bygg-kopia'));
console.log('.next-senast-bra finns: ' + fs.existsSync('/home/ak1a/AK1/.next-senast-bra'));
try { console.log('.next-senast-bra BUILD_ID: ' + fs.readFileSync('/home/ak1a/AK1/.next-senast-bra/BUILD_ID', 'utf8').trim()); } catch {}
