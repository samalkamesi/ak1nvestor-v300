// Rond 147-push del 3: vänta ut aktiv fabrikagent i prod-trädet → push när tracked-ytan är ren
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 16 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 250); } };
const trackedSmutsig = () => S(P, 'git', ['status', '--porcelain']).trim().split('\n').filter(r => r && !r.startsWith('??') && !/^[AM]  /.test(r));

const ut = { forsok: [] };
for (let i = 1; i <= 5; i++) {
  const smuts = trackedSmutsig();
  if ((smuts || []).length === 0) {
    const push = S(A, 'git', ['push', 'prod', 'develop'], 120000);
    if (/FEL/.test(push)) {
      // ny smuts kan ha uppstått under pushen — rapportera och ev. försök igen
      ut.forsok.push({ i, push: push.slice(0, 180), smutsEfter: trackedSmutsig().slice(0, 3) });
      if (!/unstaged|fetch first/.test(push)) break;
    } else {
      ut.forsok.push({ i, push: push.split('\n').filter(r => /develop|->/.test(r)).join(' | ').slice(0, 140) });
      ut.pushad = true;
      break;
    }
  } else {
    ut.forsok.push({ i, vantAr: smuts.slice(0, 4) });
  }
  if (i < 5) await new Promise(r => setTimeout(r, 90000));
}
ut.headAgent = S(A, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 60);
ut.headProd = S(P, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 60);
ut.sammaHead = ut.headAgent === ut.headProd;
ut.prodHalsa = S(A, 'curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', 'https://lab.ak1nvestor.com/rapportakademin']).trim();
console.log(JSON.stringify(ut, null, 1));
