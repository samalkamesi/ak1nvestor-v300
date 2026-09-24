// rond 157: vänta ut fabrikens barn i prod-trädet — polla ren yta → push
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const ut = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const borja = Date.now();
let pushad = false;
while (Date.now() - borja < 420000) {
  let smutsiga = [];
  try {
    smutsiga = execFileSync('git', ['-C', P, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.trim());
  } catch (e) { ut.push('status-fel: ' + String(e.message).slice(0, 100)); }

  if (smutsiga.length === 0) {
    ut.push(`prod-ytan REN efter ${Math.round((Date.now() - borja) / 1000)} s — pushar`);
    try {
      execFileSync('git', ['-C', R, 'fetch', 'prod', 'develop'], { encoding: 'utf8', timeout: 60000 });
      const prodRef = execFileSync('git', ['-C', R, 'rev-parse', 'prod/develop'], { encoding: 'utf8' }).trim();
      const min = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
      if (prodRef !== min) {
        ut.push('prod/develop flyttade igen — merge först');
        execFileSync('git', ['-C', R, 'merge', 'prod/develop', '-m', "Merge remote-tracking branch 'prod/develop' into develop — rond 157 [organ:Φ] vaktomstart"], { encoding: 'utf8', timeout: 480000 });
      }
      execFileSync('git', ['-C', R, 'push', 'prod', 'develop'], { encoding: 'utf8', timeout: 120000 });
      const prodHead = execFileSync('git', ['-C', P, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
      const minNu = execFileSync('git', ['-C', R, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
      ut.push(`PUSH OK · prod ${prodHead.slice(0, 8)} · min ${minNu.slice(0, 8)} ${prodHead === minNu ? 'SYNKAD ✓' : '(synkpoll bygger snart)'}`);
      for (const f of ['_r147-dod', '_r147-omstart', '_r153-dod-sond', '_s1u2-wihlborgs-q3-kontroll', '_s7u2o139efter-kor']) {
        const kod = fs.readFileSync(`${P}/verktyg/${f}.mjs`, 'utf8');
        ut.push(`prod ${f}.mjs: interpolerad execSync = ${(kod.match(/execSync\(`[^`]*\$\{/g) || []).length}`);
      }
      pushad = true;
      break;
    } catch (e) {
      ut.push('push-försök FEL: ' + String(e.message).slice(0, 200));
      break;
    }
  } else {
    ut.push(`väntar (${Math.round((Date.now() - borja) / 1000)} s): ${smutsiga.length} smutsiga i prod (${smutsiga[0].slice(0, 70)}…)`);
  }
  await sleep(60000);
}
if (!pushad) ut.push('FÖNSTRET UTGÅTT — prod-ytan fortfarande upptagen; ny poll behövs');

const rapport = ut.join('\n');
fs.writeFileSync(R + '/data/vakten/r157-vanta.txt', rapport);
console.log(rapport);
