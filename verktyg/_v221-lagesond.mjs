// _v221-lagesond.mjs — samlar läget för 24/7-ronden: flock, fabrik, bygg, pm2, git.
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const r = {};
const lag = (namn, fn) => { try { r[namn] = fn(); } catch (e) { r[namn] = 'FEL: ' + e.message; } };

lag('tid', () => new Date().toISOString());
lag('flock', () => { try { execSync('flock -n /tmp/ak1a-deploy.lock true', { timeout: 5000 }); return 'LEDIG'; } catch { return 'UPPTAGEN'; } });
lag('fabrikStatusFiler', () => {
  const dir = 'data/vakten/agentfabrik/status';
  if (!fs.existsSync(dir)) return 'katalog saknas';
  const filer = fs.readdirSync(dir).sort().reverse().slice(0, 4);
  return filer.map(f => {
    const j = JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'));
    return { fil: f, status: j.status, klara: (j.uppgifter || []).filter(u => u.klar).length, totalt: (j.uppgifter || []).length, uppdaterad: j.uppdaterad };
  });
});
lag('processer', () => {
  const ut = execSync("pgrep -af 'agentfabrik|auto-s5|npm run build|next build' || true", { timeout: 5000 }).toString().trim();
  return ut ? ut.split('\n').slice(0, 6) : 'inga';
});
lag('pm2', () => {
  const j = JSON.parse(execSync('pm2 jlist', { timeout: 10000 }).toString());
  return j.map(p => `${p.name}=${p.pm2_env.status}`);
});
lag('gitSenaste', () => execSync('git log --oneline -3', { timeout: 5000 }).toString().trim());
lag('gitSmutsig', () => execSync('git status --porcelain', { timeout: 5000 }).toString().trim());
lag('prod', () => {
  const sv = execSync('curl -s -o /dev/null -w "%{http_code}" -m 15 https://lab.ak1nvestor.com/', { timeout: 20000 }).toString();
  return 'HTTP ' + sv;
});
console.log(JSON.stringify(r, null, 1));
