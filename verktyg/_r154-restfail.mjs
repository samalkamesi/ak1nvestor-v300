// Rond 154 — rest-FAIL i warrant + multipel: samma klass eller annan yta?
import { execFile } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
for (const s of ['testa-ai-mentor-warrant.mjs', 'testa-ai-mentor-multipel.mjs']) {
  const r = await new Promise((res) => {
    execFile('node', ['verktyg/' + s], { cwd: ROT, timeout: 90000, maxBuffer: 6 * 1024 * 1024 }, (fel, ut) => res(String(ut)));
  });
  console.log('=== ' + s + ' ===');
  console.log(r.split('\n').filter(x => /FAIL/i.test(x)).join('\n').slice(0, 700));
}
