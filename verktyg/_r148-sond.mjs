// Rond 148-sond: lever byggprocessen? Lås? pm2? prod? API-form?
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const S = (cmd, args, t = 30000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd: A, maxBuffer: 32 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 150); } };
const ut = { nu: new Date().toISOString() };

// byggprocess vid liv? (npm/next build/fristående bash med deploy-kommandot)
const ps = S('ps', ['-eo', 'pid,etimes,rss,args']);
ut.byggProcesser = ps.split('\n').filter(r => /next build|npm ci|npm run build|flock.*ak1a-deploy/.test(r)).map(r => r.trim().slice(0, 140)).slice(0, 5);

// deploylås
try { execFileSync('flock', ['-n', '/tmp/ak1a-deploy.lock', '-c', 'true'], { timeout: 5000 }); ut.deploylas = 'LEDIGT'; } catch { ut.deploylas = 'UPPTAGET'; }

// pm2 ak1a
try {
  const jl = JSON.parse(S('pm2', ['jlist'], 20000));
  const p = jl.find(x => x.name === 'ak1a');
  ut.ak1a = { status: p?.pm2_env?.status, rssMB: Math.round((p?.monit?.memory || 0) / 1048576), restarts: p?.pm2_env?.restart_time, upMin: p?.pm2_env?.pm_uptime ? Math.round((Date.now() - p.pm2_env.pm_uptime) / 60000) : null };
} catch (e) { ut.ak1a = 'FEL ' + e.message.slice(0, 80); }

// prod + API-form (ny kod = 200 + ok:false; gammal = 401)
ut.prodRot = S('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', 'https://lab.ak1nvestor.com/']);
ut.apiStatus = S('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', 'http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025']);
ut.snitt = S('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', 'https://lab.ak1nvestor.com/rapportakademin']);

// prod-synkens senaste rad (bygger den?)
try { ut.synkSvans = fs.readFileSync('/home/ak1a/AK1/data/vakten/prod-synk.log', 'utf8').trimEnd().split('\n').slice(-5); } catch (e) { ut.synkSvans = 'log saknas: ' + e.message.slice(0, 60); }

// .next-byggets ålder i prod-trädet
try { const st = fs.statSync('/home/ak1a/AK1/.next/BUILD_ID'); ut.buildIdAlderMin = Math.round((Date.now() - st.mtimeMs) / 60000); } catch { ut.buildIdAlderMin = 'saknas'; }

console.log(JSON.stringify(ut, null, 1));
