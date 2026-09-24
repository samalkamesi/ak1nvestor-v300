// Rondsond 167 — stänger deploy-kedjan på bevis: dirigent, pm2, prod/ytor, live, fabrik, v164
import { execSync } from 'node:child_process';

const t = (fn) => { try { return fn(); } catch (e) { return 'ERR ' + String(e.message).slice(0, 140); } };
const out = { nu: new Date().toISOString() };

out.dirigentProcess = t(() => execSync("pgrep -af 'r163|dirigent' | head -4", { encoding: 'utf8' }).trim() || 'ingen');
out.pushpollProcess = t(() => execSync("pgrep -af 'pushpoll|r167' | grep -v rondsond | head -4", { encoding: 'utf8' }).trim() || 'ingen');
out.byggerNu = t(() => execSync("pgrep -af 'next-server|next build|npm run build' | grep -v grep | head -3", { encoding: 'utf8' }).trim() || 'nej');

out.wsHead = t(() => execSync('git -C /home/ak1a/agent/ak1 rev-parse --short HEAD', { encoding: 'utf8' }).trim());
out.wsStatus = t(() => execSync('git -C /home/ak1a/agent/ak1 status --porcelain | head -6', { encoding: 'utf8' }).trim() || 'REN');
out.prodHead = t(() => execSync('git -C /home/ak1a/AK1 rev-parse --short HEAD', { encoding: 'utf8' }).trim());
out.prodStatus = t(() => execSync('git -C /home/ak1a/AK1 status --porcelain | head -6', { encoding: 'utf8' }).trim() || 'REN');

out.pm2Ak1a = t(() => execSync("pm2 describe ak1a 2>/dev/null | grep -iE 'uptime|restarts' | head -3", { encoding: 'utf8' }).replace(/\s+/g, ' ').trim());
out.ram = t(() => execSync("free -m | awk '/Mem:/{print $7\" MB\"}'", { encoding: 'utf8' }).trim());

const BASE = 'https://lab.ak1nvestor.com'; // fast endpoint; sökväg binds via URL-objekt (mimosa-vittne worklog 5014)
const hamta = async (sokvag) => {
  try {
    const url = new URL(sokvag, BASE);
    const r = await fetch(url, { redirect: 'manual' });
    const txt = await r.text();
    return { s: r.status, txt };
  } catch (e) { return { s: 'ERR', txt: '' }; }
};
const [start, sitemap, fas2, konfluens] = await Promise.all(['/', '/sitemap.xml', '/fas2', '/konfluens'].map(hamta));
out.start = start.s;
out.sitemapFas2 = sitemap.txt.includes('/fas2');
out.fas2 = { s: fas2.s, borjaGratis: fas2.txt.includes('Börja gratis'), guldToken: fas2.txt.includes('guld-hero'), guldKlass: fas2.txt.includes('guld') };
out.konfluens = { s: konfluens.s, sektionsCtaBorjaGratis: konfluens.txt.includes('Börja gratis'), guldToken: konfluens.txt.includes('guld-hero') };

out.fabrikKo = t(() => execSync('ls /home/ak1a/AK1/data/vakten/agentfabrik/ko/ 2>/dev/null | head -8', { encoding: 'utf8' }).trim() || 'tom');
out.fabrikStatusTopp = t(() => execSync("ls -t /home/ak1a/AK1/data/vakten/agentfabrik/status/ 2>/dev/null | head -3", { encoding: 'utf8' }).trim());
out.v164Parkering = t(() => execSync("find /home/ak1a/agent/ak1/data /home/ak1a/AK1/data -iname '*v164*' -not -path '*/node_modules/*' 2>/dev/null | head -6", { encoding: 'utf8' }).trim() || 'saknas');
out.kvRapportTid = t(() => execSync("stat -c %y /home/ak1a/AK1/data/rapporter/kvalitetsrapport-SENASTE.md | cut -c1-19", { encoding: 'utf8' }).trim());
out.synkLogg = t(() => execSync("tail -3 $(ls -t /home/ak1a/AK1/data/infra/contabo/*synk*.log 2>/dev/null | head -1) 2>/dev/null", { encoding: 'utf8' }).trim() || 'ingen logg');

console.log(JSON.stringify(out, null, 1));
