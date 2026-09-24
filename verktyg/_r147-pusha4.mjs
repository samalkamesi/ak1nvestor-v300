// Rond 147-push del 4: RÄTT filter (staged ELLER unstaged tracked blockerar) → vänta → merge vid fetch-first → push
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 16 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 250); } };
const blockerare = () => S(P, 'git', ['status', '--porcelain']).trim().split('\n').filter(r => r && !r.startsWith('??'));

const ut = { forsok: [] };
for (let i = 1; i <= 5; i++) {
  const blo = blockerare();
  if ((blo || []).length === 0) {
    S(A, 'git', ['fetch', 'prod', 'develop'], 60000);
    const bakom = S(A, 'git', ['rev-list', '--count', 'HEAD..prod/develop'], 30000).trim();
    if (+bakom > 0) {
      // merge före push (fabriken kan ha landat nya commits)
      const m = S(A, 'git', ['merge', 'prod/develop', '--no-edit', '-m', 'studio: merge prod → develop (rond 147 del 2 möter fabrikens leveranser)'], 120000);
      ut.forsok.push({ i, merge: /FEL/.test(m) ? m.slice(0, 120) : 'OK' });
    }
    const push = S(A, 'git', ['push', 'prod', 'develop'], 120000);
    const smutsEfter = blockerare();
    if ((smutsEfter || []).length === 0 && !/FEL/.test(push)) {
      ut.forsok.push({ i, push: push.split('\n').filter(r => /develop|->/.test(r)).join(' | ').slice(0, 140) });
      ut.pushad = true;
      break;
    }
    ut.forsok.push({ i, push: push.slice(0, 130), blockeradAv: smutsEfter.slice(0, 4) });
  } else {
    ut.forsok.push({ i, vantarPå: blo.slice(0, 4) });
  }
  if (i < 5) await new Promise(r => setTimeout(r, 90000));
}
ut.headAgent = S(A, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 60);
ut.headProd = S(P, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 60);
ut.sammaHead = ut.headAgent === ut.headProd;
ut.snitt = S(A, 'curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', 'https://lab.ak1nvestor.com/rapportakademin']).trim();
console.log(JSON.stringify(ut, null, 1));
