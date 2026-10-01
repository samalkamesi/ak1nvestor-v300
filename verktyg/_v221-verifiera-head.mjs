// _v221-verifiera-head.mjs — vad landade i HEAD? Kurser, karta, register, merge-föräldrar, status.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const git = (args, t = 60000) => { try { return execFileSync('git', args, { encoding: 'utf8', timeout: t, cwd: ROT, maxBuffer: 64 * 1024 * 1024 }).trim(); } catch (e) { return 'FEL: ' + String(e.message).slice(0, 120); } };

console.log('== HEAD (senaste 2) ==');
console.log(git(['log', '--format=%h %ci %s', '-2']).split('\n').map((r) => r.slice(0, 200)).join('\n'));

console.log('\n== merge-föräldrar ==');
console.log(git(['log', '-1', '--format=%P']));

console.log('\n== deep-courses i HEAD ==');
try {
  const dc = JSON.parse(execFileSync('git', ['show', 'HEAD:public/deep-courses.json'], { encoding: 'utf8', cwd: ROT, maxBuffer: 64 * 1024 * 1024 }));
  console.log(`kurser: ${Object.keys(dc).length}`);
  for (const k of ['am-10-insynslistan', 'ud-10-ex-dagens-mekanik', 'bk-09-valutadifferenserna', 'vm-12-reverserad-dcf', 'pe-09-utdelningsrekapitaliseringen', 'vr-10-enhetsmultiplar'])
    console.log(`  ${k}: ${k in dc ? 'FINNS' : 'SAKNAS'}`);
} catch (e) { console.log('FEL: ' + String(e.message).slice(0, 150)); }

console.log('\n== larvag-karta i HEAD (antal) ==');
try {
  const karta = execFileSync('git', ['show', 'HEAD:src/lib/larvag-karta.ts'], { encoding: 'utf8', cwd: ROT, maxBuffer: 16 * 1024 * 1024 });
  const m = karta.match(/\(495 kurser\)|\(501 kurser\)|\(507 kurser\)/);
  console.log('rubrik: ' + (m ? m[0] : 'okänd'));
  console.log('am-10 i karta: ' + karta.includes('am-10-insynslistan') + ' · ud-10: ' + karta.includes('ud-10-ex-dagens-mekanik'));
} catch (e) { console.log('FEL: ' + String(e.message).slice(0, 150)); }

console.log('\n== register i HEAD ==');
try {
  const reg = execFileSync('git', ['show', 'HEAD:src/lib/ai-mentor-register.ts'], { encoding: 'utf8', cwd: ROT, maxBuffer: 16 * 1024 * 1024 });
  console.log('am-10: ' + reg.includes('"am-10-insynslistan"') + ' · ud-10: ' + reg.includes('"ud-10-ex-dagens-mekanik"') + ' · pe-09: ' + reg.includes('"pe-09-utdelningsrekapitaliseringen"'));
} catch (e) { console.log('FEL: ' + String(e.message).slice(0, 150)); }

console.log('\n== arbetsytan vs HEAD (diff i genererade filer?) ==');
const st = git(['status', '--porcelain']);
console.log(st ? st.split('\n').slice(0, 15).join('\n') : '(ren yta)');

console.log('\n== prod/develop vs develop ==');
console.log('bakom prod: ' + git(['rev-list', '--count', 'develop..prod/develop']));
console.log('före prod: ' + git(['rev-list', '--count', 'prod/develop..develop']));
