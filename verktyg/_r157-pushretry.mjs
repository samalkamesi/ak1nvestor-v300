// rond 157: push-retry — vänta ut fabrikens rörliga prod-träd (mönster r153/r154)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/home/ak1a/agent/ak1';
const ut = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const borja = Date.now();
for (let forsok = 1; forsok <= 5; forsok++) {
  // hämta prod-läget
  let prodHead = '';
  try {
    execFileSync('git', ['-C', R, 'fetch', 'prod', 'develop'], { encoding: 'utf8', timeout: 60000 });
    prodHead = execFileSync('git', ['-C', R, 'rev-parse', 'prod/develop'], { encoding: 'utf8' }).trim();
  } catch (e) { ut.push(`[f${forsok}] fetch-fel: ${String(e.message).slice(0, 120)}`); await sleep(60000); continue; }

  // behöver vi merga?
  const min = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const prodArVillkorlig = prodHead !== min;
  ut.push(`[f${forsok}] min HEAD ${min.slice(0, 8)} · prod ${prodHead.slice(0, 8)}${prodArVillkorlig ? ' → merge krävs' : ' → i fas, pusha'}`);

  if (prodArVillkorlig) {
    try {
      execFileSync('git', ['-C', R, 'merge', 'prod/develop', '-m', "Merge remote-tracking branch 'prod/develop' into develop — rond 157 [organ:Φ] push-retry"], { encoding: 'utf8', timeout: 480000 });
      ut.push(`[f${forsok}] merge OK → ${execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim().slice(0, 8)}`);
    } catch (e) {
      // konflikt? enbart motorervalidering är kandidat — prod auktoritär
      try {
        execFileSync('git', ['-C', R, 'checkout', '--theirs', 'data/rapporter/motorervalidering-2026-09-02.md'], { stdio: 'pipe' });
        execFileSync('git', ['-C', R, 'add', 'data/rapporter/motorervalidering-2026-09-02.md'], { stdio: 'pipe' });
        const msg = R + '/data/vakten/r157-retrymsg.txt';
        fs.writeFileSync(msg, "Merge remote-tracking branch 'prod/develop' into develop — rond 157 [organ:Φ] push-retry; motorervalidering löst med prod:s version");
        execFileSync('git', ['-C', R, 'commit', '-F', msg], { encoding: 'utf8', timeout: 480000 });
        ut.push(`[f${forsok}] merge-konflikt löst + commit OK`);
      } catch (e2) {
        ut.push(`[f${forsok}] merge-FEL: ${String(e2.message).slice(0, 200)}`);
        await sleep(90000); continue;
      }
    }
  }

  // pusha
  try {
    execFileSync('git', ['-C', R, 'push', 'prod', 'develop'], { encoding: 'utf8', timeout: 120000 });
    const efter = execFileSync('git', ['-C', '/home/ak1a/AK1', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const minNu = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    ut.push(`[f${forsok}] PUSH OK · prod HEAD ${efter.slice(0, 8)} (${efter === minNu ? 'SYNKAD ✓' : 'synkpoll pågår'})`);
    if (efter === minNu) {
      // mimosa-filerna i prod nu?
      for (const f of ['_r147-dod', '_r147-omstart', '_r153-dod-sond', '_s1u2-wihlborgs-q3-kontroll', '_s7u2o139efter-kor']) {
        const kod = fs.readFileSync(`/home/ak1a/AK1/verktyg/${f}.mjs`, 'utf8');
        ut.push(`prod ${f}.mjs: interpolerad execSync = ${(kod.match(/execSync\(`[^`]*\$\{/g) || []).length}`);
      }
      break;
    }
  } catch (e) {
    ut.push(`[f${forsok}] push avvisad (prod rör sig) — väntar 60 s`);
  }
  if (forsok < 5) await sleep(60000);
}

ut.push(`total tid: ${Math.round((Date.now() - borja) / 1000)} s`);
const rapport = ut.join('\n');
fs.writeFileSync(R + '/data/vakten/r157-pushretry.txt', rapport);
console.log(rapport);
