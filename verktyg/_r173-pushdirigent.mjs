// Rond 173: push-dirigent — fristående bevakare som pushar ws→prod vid rent fönster.
// Regler: väntar tills (a) prod-ytans SPÅRADE filer är ren-a (?? tolereras),
// (b) fabrikens senaste manifest är klart/ko tom, (c) RAM >= 1500.
// Push = fast-forward via updateInstead; INGET bygge (kedjan bär ingen src/).
// Efter push: verifiera paritet + kör kvalitetsvakten I PROD-trädet; logga allt.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const WS = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const log = (m) => console.log(`[${new Date().toISOString()}] ${m}`);
const git = (args, cwd, t = 60000) => execFileSync('git', args, { cwd, timeout: t }).toString().trim();

const target = () => git(['rev-parse', 'HEAD'], WS);
const prodSpadadRen = () => {
  const s = git(['status', '--porcelain'], PROD);
  return s.split('\n').filter(r => r.trim() && !r.trim().startsWith('??')).length === 0;
};
const fabrikenLedig = () => {
  const ko = `${PROD}/data/vakten/agentfabrik/ko`;
  const filer = fs.existsSync(ko) ? fs.readdirSync(ko).filter(f => f.endsWith('.json')) : [];
  if (filer.length > 0) return false;
  // KO tom räcker inte: aktiva/föräldralösa barn committar under omgångens svans.
  // Krav: inga levande fabriksagent-processer alls.
  try {
    const ps = execFileSync('ps', ['aux'], { timeout: 15000 }).toString();
    if (/Du är en fabriksagent/.test(ps)) return false;
  } catch { return false; } // ps-svikt = anta upptagen
  return true;
};
const ramAvail = () => {
  const mem = fs.readFileSync('/proc/meminfo', 'utf8');
  return Math.round(parseInt(mem.match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024);
};

const START_TARGET = target();
log(`dirigent start; ws HEAD=${START_TARGET.slice(0, 8)}; väntar rent prod-fönster (max 45 min)`);

const deadline = Date.now() + 45 * 60 * 1000;
let pushad = false;
while (Date.now() < deadline && !pushad) {
  const prodHead = git(['rev-parse', 'HEAD'], PROD);
  // prod får inte ha committat nytt utöver det ws redan mergat
  let prodAmmars = true;
  try { execFileSync('git', ['merge-base', '--is-ancestor', prodHead, 'HEAD'], { cwd: WS, timeout: 30000 }); }
  catch { prodAmmars = false; }
  const ram = ramAvail();
  log(`tick: prod=${prodHead.slice(0, 8)} ammars=${prodAmmars} spadadRen=${prodSpadadRen()} fabrikenLedig=${fabrikenLedig()} ram=${ram}`);
  if (prodAmmars && prodSpadadRen() && fabrikenLedig() && ram >= 1500) {
    try {
      const ut = git(['push', 'prod', 'develop'], WS, 120000);
      log('PUSH-UTDATA: ' + (ut || '(tyst ok)'));
      const efter = git(['rev-parse', 'HEAD'], PROD);
      if (efter === target()) {
        pushad = true;
        log(`PUSH-GRÖN: prod=${efter.slice(0, 8)} == ws`);
      } else {
        log(`PULL-EFTERKOLL AVVIKER: prod=${efter.slice(0, 8)} ws=${target().slice(0, 8)} — avbryter`);
      }
    } catch (e) {
      log('PUSH-FEL: ' + String(e.stderr || e.stdout || e.message).slice(0, 400));
    }
  }
  if (!pushad) await new Promise(r => setTimeout(r, 60000));
}

if (!pushad) { log('SLUT utan push (fönstret öppnades ej inom 45 min) — nästa rond tar kedjan'); process.exit(2); }

// Färsk kvalitetsvakt I prod-trädet (mål: 0 fynd GRÖN med härden på plats)
try {
  const v = execFileSync('node', ['verktyg/kvalitetsvakt.mjs'], { cwd: PROD, timeout: 300000 }).toString();
  const sammanfattning = v.split('\n').filter(r => /SAMMANFATTNING|RESULTAT_JSON/.test(r)).join(' | ');
  log('PROD-VAKT: ' + sammanfattning);
} catch (e) {
  log('PROD-VAKT-FEL: ' + String(e.stdout || e.message).slice(0, 400));
}
// prod 200-prob
try {
  const kod = execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'https://lab.ak1nvestor.com/'], { timeout: 30000 }).toString();
  log(`PROD HTTPS: ${kod}`);
} catch (e) { log('PROD-PROB-FEL: ' + e.message.slice(0, 200)); }
log('dirigent klar');
