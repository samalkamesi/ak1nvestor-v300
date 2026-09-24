// Rond 170 evighetsläge: poll, bygg, v164-fabrik, eyebrow live, RAM
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const t = (f) => { try { return f(); } catch (e) { return 'ERR ' + String(e.message).slice(0, 140); } };
const ut = { nu: new Date().toISOString() };

ut.poll = t(() => fs.readFileSync('/tmp/r167-pushpoll-status.txt', 'utf8').trim().split('\n').slice(-2).join(' | '));
ut.bygger = t(() => execSync("pgrep -c -f 'next build' 2>/dev/null || true", { encoding: 'utf8' }).trim() + ' next-build');
ut.pm2Uptime = t(() => execSync("pm2 describe ak1a 2>/dev/null | grep -i 'uptime' | head -1", { encoding: 'utf8' }).replace(/\s+/g, ' ').trim());
ut.v164 = t(() => {
  const s = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/v164-fas3-djup.json', 'utf8'));
  const klara = (s.uppgifter || []).filter(u => u.status === 'klar').length;
  return s.status + ' — klara ' + klara + '/' + (s.uppgifter || []).length;
});
ut.ram = t(() => execSync("free -m | awk '/Mem:/{print $7\" MB\"}'", { encoding: 'utf8' }).trim());
ut.wsHead = t(() => execSync('git -C /home/ak1a/agent/ak1 rev-parse --short HEAD', { encoding: 'utf8' }).trim());
ut.prodHead = t(() => execSync('git -C /home/ak1a/AK1 rev-parse --short HEAD', { encoding: 'utf8' }).trim());

const hamta = async (url) => { try { const r = await fetch(url); return { s: r.status, txt: await r.text() }; } catch { return { s: 'ERR', txt: '' }; } };
const ds = await hamta('https://lab.ak1nvestor.com/dataset');
ut.eyebrowLive = ds.txt.includes('AK1A Research Lab') && ds.txt.includes('tracking-widest');
ut.datasetS = ds.s;
console.log(JSON.stringify(ut, null, 1));
