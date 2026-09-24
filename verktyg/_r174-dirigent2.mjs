// Rond 174: superdirigent v2 — emottag + push + prod-vakt i EN autonom loop.
// Villkor före push: 0 fabriksagenter, ko tom, prod spådat-ren, RAM>=1500.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const WS = '/home/ak1a/agent/ak1', PROD = '/home/ak1a/AK1';
const log = (m) => console.log(`[${new Date().toISOString()}] ${m}`);
const git = (args, cwd, t = 120000) => execFileSync('git', args, { cwd, timeout: t }).toString().trim();
const gitOk = (args, cwd, t = 120000) => { try { execFileSync('git', args, { cwd, timeout: t }); return true; } catch { return false; } };

const barnAktiva = () => {
  try {
    const ps = execFileSync('ps', ['aux'], { timeout: 15000 }).toString();
    return ps.split('\n').filter(r => /fabriksagent/.test(r) && !/grep/.test(r)).length;
  } catch { return 99; }
};
const koTom = () => fs.readdirSync(`${PROD}/data/vakten/agentfabrik/ko`).filter(f => f.endsWith('.json')).length === 0;
const spadadRen = () => {
  const s = git(['status', '--porcelain'], PROD);
  return s.split('\n').filter(r => r.trim() && !r.trim().startsWith('??')).length === 0;
};
const ram = () => Math.round(parseInt(fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024);

log('v2 start — emottag+push+prod-vakt när fönstret öppnas (max 40 min)');
const deadline = Date.now() + 40 * 60 * 1000;
let klar = false;

while (Date.now() < deadline && !klar) {
  const b = barnAktiva(), k = koTom(), r = ram(), ren = spadadRen();
  log(`tick: barn=${b} koTom=${k} ren=${ren} ram=${r}`);
  if (b === 0 && k && ren && r >= 1500) {
    try {
      log('FÖNSTER ÖPPET: emottager prod i ws…');
      git(['fetch', 'prod', 'develop'], WS);
      const mergeUt = git(['merge', 'FETCH_HEAD', '--no-edit'], WS);
      log('MERGE-UTDATA: ' + mergeUt.split('\n').slice(0, 4).join(' | ').slice(0, 300));
      log('pushar ws→prod…');
      const pushUt = git(['push', 'prod', 'develop'], WS);
      log('PUSH-UTDATA: ' + (pushUt || '(tyst ok)').slice(0, 300));
      const wsH = git(['rev-parse', 'HEAD'], WS), prodH = git(['rev-parse', 'HEAD'], PROD);
      if (wsH === prodH) {
        klar = true;
        log(`PUSH-GRÖN: ws=prod=${wsH.slice(0, 8)}`);
      } else {
        log(`PARIETETSAVIKELSE ws=${wsH.slice(0, 8)} prod=${prodH.slice(0, 8)} — ny tick försöker igen`);
      }
    } catch (e) {
      log('FEL: ' + String(e.stdout || e.stderr || e.message).slice(0, 400));
    }
  }
  if (!klar) await new Promise(r2 => setTimeout(r2, 60000));
}

if (!klar) { log('SLUT utan push — kedjan tas av nästa rond'); process.exit(2); }

try {
  const v = execFileSync('node', ['verktyg/kvalitetsvakt.mjs'], { cwd: PROD, timeout: 300000 }).toString();
  log('PROD-VAKT: ' + v.split('\n').filter(r2 => /SAMMANFATTNING|RESULTAT_JSON/.test(r2)).join(' | '));
} catch (e) { log('PROD-VAKT-FEL: ' + String(e.stdout || e.message).slice(0, 400)); }
try {
  log('PROD HTTPS: ' + execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'https://lab.ak1nvestor.com/'], { timeout: 30000 }).toString());
} catch (e) { log('PROB-FEL: ' + e.message.slice(0, 200)); }
log('v2 klar');
