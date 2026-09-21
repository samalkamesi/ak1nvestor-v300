// Rond 147-push del 2: återställ prod:s redundanta dom-rad (samma innehåll anländer via pushen) → push → verifiera
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 16 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 300); } };
const ut = { nu: new Date().toISOString() };

// (1) prod: återställ den okommittade dom-raden — IDENTISKT innehåll anländer via merge 97a9469f
ut.checkoutProd = S(P, 'git', ['checkout', '--', 'data/vakten/feljakt-bedomningar.jsonl']);
ut.prodStatusEfter = S(P, 'git', ['status', '--porcelain']).trim().split('\n').filter(r => !r.startsWith('??')).slice(0, 5); // bara tracked spelar roll för updateInstead
ut.prodRent = (ut.prodStatusEfter || []).length === 0;

// (2) push (agent-trädet)
if (ut.prodRent) {
  ut.push = S(A, 'git', ['push', 'prod', 'develop'], 120000).split('\n').filter(r => /develop|->|reject|error|Done/i.test(r)).join(' | ').slice(0, 200);
} else { ut.push = 'SKIPPAD — prod-trädet fortfarande smutsigt (tracked)'; }

// (3) verifiera: samma head i båda träden + dom-rad närvarande i prod + prod-hälsa
ut.headAgent = S(A, 'git', ['log', '--oneline', '-1']).trim().slice(0, 60);
ut.headProd = S(P, 'git', ['log', '--oneline', '-1']).trim().slice(0, 60);
ut.sammaHead = ut.headAgent && ut.headAgent === ut.headProd;
try {
  const dom = S(P, 'grep', ['-c', 'fynn-f6-vaccin', 'data/vakten/feljakt-bedomningar.jsonl']).trim();
  ut.domRadIProd = dom; // journal-kanalnamnet finns i dom-radens kur-fält
} catch { ut.domRadIProd = '0/grep-fel'; }
ut.url = S(A, 'curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', 'https://lab.ak1nvestor.com/']).trim();
ut.snitt = S(A, 'curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', 'https://lab.ak1nvestor.com/rapportakademin']).trim();

console.log(JSON.stringify(ut, null, 1));
