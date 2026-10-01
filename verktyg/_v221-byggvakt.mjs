// _v221-byggvakt.mjs — väntar in next build (PID) + BUILD_ID, pm2 restart, full sond.
// Regler: startar ALDRIG om innan next build-processen är borta OCH BUILD_ID lever.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const LOGG = '/tmp/v221-byggvakt.log';
fs.writeFileSync(LOGG, `start ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + '\n'); console.log(s); };
const kora = (cmd, args, t = 30000) => execFileSync(cmd, args, { encoding: 'utf8', timeout: t }).trim();

const leverBygg = () => {
  try {
    const ut = execFileSync('bash', ['-c', "ps -eo pid,cmd | grep -E 'next build|npm run build' | grep -v grep || true"], { encoding: 'utf8', timeout: 10000 }).trim();
    return ut.length > 0 ? ut.split('\n').length : 0;
  } catch { return -1; }
};
const buildId = () => (fs.existsSync('/home/ak1a/AK1/.next/BUILD_ID') ? fs.readFileSync('/home/ak1a/AK1/.next/BUILD_ID', 'utf8').trim() : null);

// Vänta max ~35 min på att byggprocesserna försvinner + BUILD_ID materialiseras
let klar = false;
for (let i = 0; i < 70; i++) {
  const n = leverBygg();
  const bid = buildId();
  if (n === 0 && bid) { klar = true; logga(`bygg KLART efter ${i * 30} s vakt — BUILD_ID ${bid}`); break; }
  if (i % 4 === 0) logga(`vakt ${i * 30} s: ${n} byggprocesser · BUILD_ID ${bid ?? 'saknas'}`);
  await new Promise((r) => setTimeout(r, 30000));
}
if (!klar) { logga('VAKT: bygget blev inte klart inom 35 min — läge kvarstår, INGEN restart'); process.exit(1); }

// flock: INGEN annan bygger (vår föräldralösa flock kan lämna spår; flock -n testar)
try { execFileSync('flock', ['-n', '/tmp/ak1a-deploy.lock', 'true'], { timeout: 5000 }); logga('flock ledig'); }
catch { logga('flock fortfarande upptagen — avvaktar 60 s och testar igen'); await new Promise((r) => setTimeout(r, 60000)); }

logga('pm2 restart ak1a:\n' + kora('pm2', ['restart', 'ak1a'], 60000).split('\n').slice(0, 4).join('\n'));
await new Promise((r) => setTimeout(r, 20000));

const sond = async (url) => { try { return (await fetch(url, { signal: AbortSignal.timeout(25000), redirect: 'manual' })).status; } catch (e) { return 'FEL ' + String(e).slice(0, 50); } };
logga('roten: ' + (await sond('https://lab.ak1nvestor.com/')));
logga('zcode-rutten (r359-notisens 404): ' + (await sond('https://lab.ak1nvestor.com/api/studio/stream')));
for (const r of ['/kurser/am-10-insynslistan', '/kurser/ud-10-ex-dagens-mekanik', '/kurser/vm-12-reverserad-dcf', '/kurser/pe-09-utdelningsrekapitaliseringen', '/kurser/bk-09-valutadifferenserna', '/kurser/kt-11-indexinklusionen']) {
  logga(r + ': ' + (await sond('https://lab.ak1nvestor.com' + r)));
}
logga('VAKT KLAR');
