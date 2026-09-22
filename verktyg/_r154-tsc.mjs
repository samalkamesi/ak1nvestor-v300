// Rond 154 — tsc-verifiering efter dev-artefaktrensning
import fs from 'node:fs';
import { execFile } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const u = { devKatalog: fs.existsSync(ROT + '/.next/dev') };
const r = await new Promise((res) => {
  execFile('node', ['node_modules/typescript/bin/tsc', '--noEmit'], { cwd: ROT, timeout: 240000, maxBuffer: 8 * 1024 * 1024 }, (fel, ut, err) => res({ fel, ut: String(ut), err: String(err) }));
});
u.tscFel = r.fel ? (r.ut + r.err).trim().split('\n').slice(0, 6) : [];
u.tscGron = !r.fel;
fs.writeFileSync(ROT + '/data/vakten/r154-tsc.json', JSON.stringify(u, null, 1));
console.log(JSON.stringify(u, null, 1));
