import fs from 'node:fs';
import { execSync } from 'node:child_process';
const P = '/home/ak1a/AK1';
const las = (p) => { try { return fs.readFileSync(p, 'utf8').trim(); } catch { return '(saknas)'; } };

console.log('=== prod HEAD ===');
try { console.log(execSync(`git -C ${P} log --oneline -3`, { timeout: 15000 }).toString()); } catch (e) { console.log('FEL', String(e.message).slice(0, 100)); }
console.log('=== prod git-status (kort) ===');
try { console.log(execSync(`git -C ${P} status --porcelain | head -5`, { timeout: 15000 }).toString() || '(rent)'); } catch (e) { console.log('FEL', String(e.message).slice(0, 100)); }

console.log('=== universumfilen i prod ===');
try {
  const u = JSON.parse(fs.readFileSync(`${P}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
  const lista = Array.isArray(u) ? u : (u.bolag || u.universum || Object.values(u)[0]);
  console.log('antal:', lista.length);
  console.log('sista 3 tickers:', lista.slice(-3).map((b) => b.ticker).join(', '));
} catch (e) { console.log('FEL', String(e.message).slice(0, 150)); }

console.log('=== cache-mtimes ===');
for (const f of ['data/cache/bolags-publicerade.json', 'data/portfolj-system/bolagsunivers.json', '.next/BUILD_ID']) {
  try { const st = fs.statSync(`${P}/${f}`); console.log(f, '→', st.mtime.toISOString()); } catch { console.log(f, '→ saknas'); }
}

console.log('=== U49-protokollet i prod? ===');
try { console.log(execSync(`ls ${P}/data/forskning/ | grep -i 'U49\\|APOLLO' || echo '(saknas)'`, { timeout: 15000 }).toString()); } catch { console.log('(saknas)'); }
console.log('=== arbetsytans HEAD ===');
try { console.log(execSync('git -C /home/ak1a/agent/ak1 log --oneline -2', { timeout: 15000 }).toString()); } catch (e) { console.log('FEL', String(e.message).slice(0, 100)); }
console.log('=== arbetsytans universum-antal ===');
try {
  const u = JSON.parse(fs.readFileSync('/home/ak1a/agent/ak1/data/portfolj-system/bolagsunivers.json', 'utf8'));
  const lista = Array.isArray(u) ? u : (u.bolag || u.universum || Object.values(u)[0]);
  console.log('antal:', lista.length);
} catch (e) { console.log('FEL', String(e.message).slice(0, 150)); }
