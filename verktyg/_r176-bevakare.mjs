// Rond 176: v166-bevakare — autonom emottag+granska-loop, rapporterar läge till /tmp/r176-läge.txt
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1', prod = '/home/ak1a/AK1';
const git = (args, cwd = ws, t = 180000) => execFileSync('git', args, { cwd, timeout: t }).toString().trim();
const rapp = (t) => fs.writeFileSync('/tmp/r176-läge.txt', t + '\n');
const log = (m) => { const rad = `[${new Date().toISOString()}] ${m}`; rapp(rad); console.log(rad); };

log('bevakare start (max 100 min): emottager + granskar v166 allteftersom fabriken levererar');
const deadline = Date.now() + 100 * 60 * 1000;
let senastProd = '';
while (Date.now() < deadline) {
  let klara = -1, status = '?';
  try {
    const st = JSON.parse(fs.readFileSync(`${prod}/data/vakten/agentfabrik/status/v166-fas3-djupintegrering.json`, 'utf8'));
    klara = (st.klara || []).length; status = st.status;
  } catch {}
  const prodH = git(['rev-parse', 'HEAD'], prod);
  if (prodH !== senastProd) {
    senastProd = prodH;
    try {
      git(['fetch', 'prod', 'develop']);
      const m = git(['merge', 'FETCH_HEAD', '--no-edit']);
      const ut = execFileSync('node', ['verktyg/_r175-granska.mjs'], { cwd: ws, timeout: 300000 }).toString().split('\n').find(r => /^===/.test(r)) || '';
      log(`EMOTTAG ${prodH.slice(0, 8)} (v166 ${status} klara=${klara}/24): ${ut} — merge: ${m.split('\n')[0].slice(0, 60)}`);
      if (/FEL [1-9]/.test(ut) || /· [1-9]\d* FEL/.test(ut)) log('OBS: FEL FYND — huvudagenten kurar');
    } catch (e) {
      log('FEL: ' + String(e.stdout || e.message).slice(0, 250));
    }
  } else {
    log(`tick: v166 ${status} klara=${klara}/24 prod=${prodH.slice(0, 8)}`);
  }
  if (status === 'klar' && klara === 24) { log('V166 FÄRDIGT: 24/24 — bevakare klar'); break; }
  await new Promise(r => setTimeout(r, 150000));
}
log('bevakare slut');
