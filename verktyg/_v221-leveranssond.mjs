// _v221-leveranssond.mjs — kartlägger fabrikens s5-leverans: finns den i min yta? vad är ändrat i prod?
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const MIN = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const kurser = ['am-10-insynslistan', 'bk-10-verkligt-varde-hierarkin', 'kt-12-vd-bytet', 'mt-10-erfarenhetskurvan', 'st-09-konkursordningen', 'vm-12-reverserad-dcf'];

console.log('== Kurser i MIN yta ==');
for (const k of kurser) {
  const finnsl = fs.existsSync(`${MIN}/data/kurser-tillagg/${k}.json`);
  console.log(`${k}: ${finnsl ? 'FINNS' : 'SAKNAS'}`);
}

console.log('\n== src-diff i PROD (fabrikens barns kodändring) ==');
try {
  const ut = execFileSync('git', ['diff', '--stat', '--', 'src/lib/ai-mentor-register.ts', 'src/lib/larvag-karta.ts'], { encoding: 'utf8', timeout: 15000, cwd: PROD });
  console.log(ut.trim());
} catch (e) { console.log('FEL: ' + e.message); }

console.log('\n== src-diff innehåll (första 80 raderna) ==');
try {
  const ut = execFileSync('git', ['diff', '--', 'src/lib/ai-mentor-register.ts', 'src/lib/larvag-karta.ts'], { encoding: 'utf8', timeout: 15000, cwd: PROD });
  console.log(ut.trim().split('\n').slice(0, 80).join('\n'));
} catch (e) { console.log('FEL: ' + e.message); }

console.log('\n== Prod HEAD ==');
try {
  console.log(execFileSync('git', ['log', '--oneline', '-1'], { encoding: 'utf8', timeout: 15000, cwd: PROD }).trim());
} catch (e) { console.log('FEL: ' + e.message); }

console.log('\n== Fabrikens s5-statusfiler (ko + utdata kvar?) ==');
for (const d of ['data/vakten/agentfabrik/ko', 'data/vakten/agentfabrik/utdata']) {
  const p = `${MIN}/${d}`;
  const finns = fs.existsSync(p);
  const filer = finns ? fs.readdirSync(p).slice(-8) : [];
  console.log(`${d}: ${finns ? filer.join(', ') || 'tom' : 'saknas'}`);
}
