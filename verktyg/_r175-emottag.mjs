// Rond 175: kedjat emottag → granska → status (ett anrop när omgången landat)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1', prod = '/home/ak1a/AK1';
const git = (args, cwd = ws, t = 180000) => execFileSync('git', args, { cwd, timeout: t }).toString().trim();
const p = (...a) => console.log(...a);

// 1. status
let klara = 0, status = '?';
try {
  const st = JSON.parse(fs.readFileSync(`${prod}/data/vakten/agentfabrik/status/v166-fas3-djupintegrering.json`, 'utf8'));
  klara = (st.klara || []).length; status = st.status;
} catch {}
p(`v166: ${status} klara=${klara}/24`);

if (klara === 0) { p('inget att emottaga än'); process.exit(0); }

// 2. emottag
p(git(['fetch', 'prod', 'develop']) || 'fetch ok');
try {
  const m = git(['merge', 'FETCH_HEAD', '--no-edit']);
  p('MERGE: ' + m.split('\n').slice(0, 3).join(' | ').slice(0, 200));
} catch (e) {
  p('MERGE-KONFLIKT: ' + String(e.stdout || e.message).slice(0, 300));
  process.exit(1);
}
p('ws HEAD:', git(['log', '--oneline', '-1']).slice(0, 90));

// 3. granska
const ut = execFileSync('node', ['verktyg/_r175-granska.mjs'], { cwd: ws, timeout: 300000 }).toString();
p(ut.split('\n').slice(0, 25).join('\n'));
