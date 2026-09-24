// Rond 154 — lägessond: push-retry, prod-synk, RAM, fabrik, HM-B-intaget
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const u = {};

// 1. Push-retry-sondens utfall
for (const rot of [ROT, PROD]) {
  try { u.pushretry = JSON.parse(fs.readFileSync(rot + '/data/vakten/r153-pushretry.json', 'utf8')).status; }
  catch { u.pushretry = 'löper ännu'; break; }
}

// 2. Prod-synk senaste rader (har o151-deployen landat?)
try {
  const log = fs.readFileSync(PROD + '/data/infra/contabo/prod-synk.log', 'utf8').trim().split('\n');
  u.synk = log.slice(-3);
} catch (e) { u.synkFel = String(e).slice(0, 100); }

// 3. RAM + BUILD_ID
try {
  const mem = fs.readFileSync('/proc/meminfo', 'utf8');
  const avail = Number(mem.match(/MemAvailable:\s+(\d+) kB/)?.[1] ?? 0);
  u.ramMB = Math.round(avail / 1024);
  u.byggd = fs.existsSync(PROD + '/.next/BUILD_ID') ? fs.readFileSync(PROD + '/.next/BUILD_ID', 'utf8').trim().slice(0, 12) : 'SAKNAS';
} catch (e) { u.ramFel = String(e).slice(0, 100); }

// 4. Fabrikens kö (ko/) + aktiva manifest
try {
  u.fabrikKo = fs.readdirSync(PROD + '/data/vakten/agentfabrik/ko').filter(f => f.endsWith('.json')).slice(-5);
  const st = fs.readdirSync(PROD + '/data/vakten/agentfabrik/status').sort().slice(-3);
  u.fabrikStatus = st;
} catch (e) { u.fabrikFel = String(e).slice(0, 100); }

// 5. Mitt träd + prod-trädets HEAD
const run = (args, cwd) => { try { return execFileSync('git', args, { cwd, stdio: 'pipe' }).toString().trim(); } catch (e) { return 'FEL ' + String(e.stderr || e).slice(0, 80); } };
u.headMitt = run(['log', '--oneline', '-1'], ROT);
u.headProd = run(['log', '--oneline', '-1'], PROD);
u.prodRen = run(['status', '--porcelain'], PROD) === '';

// 6. HM-B-intagets storlek (omtolkningskandidaten)
try {
  const dir = PROD + '/data/rapportintag/leveranser';
  u.intag = fs.readdirSync(dir).filter(f => f.startsWith('HM')).map(f => {
    const st = fs.statSync(dir + '/' + f);
    return { fil: f, kB: Math.round(st.size / 1024) };
  });
} catch (e) { u.intagFel = String(e).slice(0, 100); }

fs.writeFileSync(ROT + '/data/vakten/r154-lagesond.json', JSON.stringify(u, null, 1));
console.log(JSON.stringify(u, null, 1));
