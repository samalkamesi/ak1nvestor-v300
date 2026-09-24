// Rond 172 läge: poll, v164-framsteg, bygg, eyebrow-exakt, prod-yta
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const t = (f) => { try { return f(); } catch (e) { return 'ERR ' + String(e.message).slice(0, 140); } };
const ut = { nu: new Date().toISOString() };

ut.poll = t(() => fs.readFileSync('/tmp/r167-pushpoll-status.txt', 'utf8').trim().split('\n').slice(-2).join(' | '));
ut.pollLever = t(() => execSync("pgrep -c -f pushpoll3 || true", { encoding: 'utf8' }).trim());
ut.v164 = t(() => {
  const s = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/v164-fas3-djup.json', 'utf8'));
  return s.status + ' klara=' + (s.klara || []).length + '/' + s.totalt;
});
ut.filerProd = t(() => execSync("ls /home/ak1a/AK1/data/forskning/KURS-FAS3/ | grep -c '^underlag' || true", { encoding: 'utf8' }).trim());
ut.bygger = t(() => execSync("pgrep -c -f 'next build' || true", { encoding: 'utf8' }).trim() + ' bygg');
ut.pm2 = t(() => execSync("pm2 describe ak1a 2>/dev/null | grep -i uptime | head -1", { encoding: 'utf8' }).replace(/\s+/g, ' ').trim());
ut.prodYta = t(() => execSync("git -C /home/ak1a/AK1 status --porcelain | grep -cv '^??' || true", { encoding: 'utf8' }).trim() + ' spårade rader');
ut.prodHead = t(() => execSync('git -C /home/ak1a/AK1 rev-parse --short HEAD', { encoding: 'utf8' }).trim());
ut.ram = t(() => execSync("free -m | awk '/Mem:/{print $7\" MB\"}'", { encoding: 'utf8' }).trim());
const r = await fetch('https://lab.ak1nvestor.com/dataset');
const txt = await r.text();
ut.dataset = { s: r.status, eyebrowExakt: txt.includes('tracking-widest text-gold') && txt.includes('>AK1A Research Lab<') };
console.log(JSON.stringify(ut, null, 1));
