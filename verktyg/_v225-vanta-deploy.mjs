// _v225-vanta-deploy.mjs — vänta tills prod-synken deployat MIN push (5622c775):
// DEPLOYAD/omstart-rad + lås släppt + prod 200 + versionslogg-rad. Tak ~55 min.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 25) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000 }).trim(); } catch { return '(fel)'; } }
function logg() { try { return fs.readFileSync('/home/ak1a/AK1/data/vakten/prod-synk.log', 'utf8').trim().split('\n'); } catch { return []; } }
const MAL = '5622c775';

console.log('väntar på deploy av', MAL, '— start', new Date().toISOString());
let senast = '';
for (let i = 0; i < 150; i++) {
  const rader = logg();
  const relevanta = rader.filter(r => r.includes(MAL) || /DEPLOYAD|RESTART|omstart|GRÖN|HTTPS|version-stämpel|larm|KRITISK|AVBRUTEN|avbröt|fail/i.test(r)).slice(-6);
  const svans = relevanta.join('\n');
  if (svans !== senast && svans) { console.log('[' + new Date().toISOString().slice(11, 19) + ']\n' + svans + '\n'); senast = svans; }
  const las = ko("exec 9<>/tmp/ak1a-deploy.lock && flock -n 9 && echo FREET || echo UPPTAGET");
  const deployad = rader.some(r => r.includes(MAL) && /DEPLOYAD/i.test(r));
  const https = ko("curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://lab.ak1nvestor.com/");
  if (deployad && las === 'FREET' && https === '200') {
    console.log('⏺ DEPLOY AV ' + MAL + ' GRÖN: DEPLOYAD-rad + lås släppt + prod ' + https);
    process.exit(0);
  }
  if (/KRITISK|AVBRUTEN|avbröt/.test(rader.slice(-3).join(' '))) {
    console.log('⏻ AVBROTT/ALRM upptäckt — avslutar bevakningen för manuell hantering:');
    console.log(rader.slice(-5).join('\n'));
    process.exit(2);
  }
  await new Promise(r => setTimeout(r, 22000));
}
console.log('⏻ Tak nått utan GRÖN — avslutar för manuell hantering');
process.exit(1);
