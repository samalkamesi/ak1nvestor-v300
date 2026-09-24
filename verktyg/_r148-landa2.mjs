// Rond 148-landning 2: stagea + committa dubblettrensningen + push
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 32 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 250); } };
const blockerare = () => S(P, 'git', ['status', '--porcelain'], 30000).trim().split('\n').filter(r => r && !r.startsWith('??'));
const ut = { nu: new Date().toISOString() };

ut.statusFore = S(A, 'git', ['status', '--porcelain'], 30000).trim().split('\n').filter(Boolean).slice(0, 5);
if ((ut.statusFore || []).length > 0) {
  S(A, 'git', ['add', '-A'], 60000);
  ut.commit = S(A, 'git', ['commit', '-m', 'studio: rond 148 tillägg — dubblettrensning worklog + beslutsminne (retry-skript var icke-idempotent: rondens rader landade två gånger, exakta dubbletter kirurgiskt borttagna; 112+190 rader kvar)'], 300000).split('\n').find(r => /files changed|develop/i.test(r)) || 'OK';
  for (let i = 1; i <= 3; i++) {
    if ((blockerare() || []).length === 0) {
      S(A, 'git', ['fetch', 'prod', 'develop'], 60000);
      const bakom = +(S(A, 'git', ['rev-list', '--count', 'HEAD..prod/develop'], 30000).trim() || '0');
      if (bakom > 0) S(A, 'git', ['merge', 'prod/develop', '--no-edit', '-m', 'studio: merge prod → develop (rond 148 rensning)'], 120000);
      const push = S(A, 'git', ['push', 'prod', 'develop'], 120000);
      if (!/FEL/.test(push)) { ut.pushad = true; break; }
      ut['retry' + i] = push.slice(0, 100);
    } else { ut['vantar' + i] = blockerare().slice(0, 2); }
    if (i < 3) await new Promise(r => setTimeout(r, 50000));
  }
}
ut.head = S(A, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 70);
ut.ren = S(A, 'git', ['status', '--porcelain'], 30000).trim() === '';
console.log(JSON.stringify(ut, null, 1));
