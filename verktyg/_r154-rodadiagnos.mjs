// Rond 154 — rotdiagnos av de röda AI-Mentorn-sviterna: kör 2 st isolerat, fånga FAIL-rader
import fs from 'node:fs';
import { execFile } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const u = {};

for (const svit of ['testa-ai-mentor-historia.mjs', 'testa-ai-mentor-kapitalbindning.mjs']) {
  const r = await new Promise((res) => {
    execFile('node', ['verktyg/' + svit], { cwd: ROT, timeout: 60000, maxBuffer: 4 * 1024 * 1024 },
      (fel, ut, err) => res({ fel: fel ? String(fel).slice(0, 100) : null, ut: String(ut), err: String(err) }));
  });
  const rader = (r.ut + '\n' + r.err).split('\n');
  const failRader = rader.filter(x => /FAIL|röd|RÖD|✗/i.test(x));
  u[svit] = { fel: r.fel, failRader: failRader.slice(0, 12).map(x => x.slice(0, 160)) };
}
fs.writeFileSync(ROT + '/data/vakten/r154-rodadiagnos.json', JSON.stringify(u, null, 1));
console.log(JSON.stringify(u, null, 1));
