// Rond 148-kur del A: tsc → commit → push (merge-retry + blockerar-väntan)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 32 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 300); } };
const blockerare = () => S(P, 'git', ['status', '--porcelain'], 30000).trim().split('\n').filter(r => r && !r.startsWith('??'));
const ut = { nu: new Date().toISOString() };

// (1) typkontroll — baslinje 0 (kvalitetsgrinden kör den igen vid commit)
ut.tsc = S(A, 'node', ['node_modules/typescript/bin/tsc', '--noEmit'], 300000).trim();
ut.tscOK = ut.tsc === '';

// (2) commit
const msg = 'studio: rond 148 [organ:Δ] — GRÄNSSNITTSVAKTSKUR /rapportakademin: GET /api/rapportakademin/pass svarar 200+kod-i-kropp för gäst/fas1 (i stället för 401/403 som webbläsaren loggar som resursfel i kundens devtools vid varje sidladdning — vaktens 4 fynd, alla samma rot) — skyddet oförändrat (skalet exponeras aldrig), POST behåller 401/403 som mutationens status, klienten hanterar båda formerna (sömlös över deployfönstret); ROT: avsiktlig 401-design + webbläsarens icke-tystbara resursloggning';
fs.writeFileSync(A + '/verktyg/_r148-commitmsg.txt', msg);
try {
  S(A, 'git', ['add', '-A']);
  ut.commit = S(A, 'git', ['commit', '-F', 'verktyg/_r148-commitmsg.txt'], 300000).split('\n').find(r => /files changed|develop/i.test(r)) || 'OK';
} catch (e) { ut.commit = 'FEL: ' + e.message.slice(0, 250); }

// (3) push med tålig retry (fabrikagent kan hålla prod-trädet)
if (ut.tscOK && !/FEL/.test(String(ut.commit))) {
  for (let i = 1; i <= 6; i++) {
    if ((blockerare() || []).length === 0) {
      S(A, 'git', ['fetch', 'prod', 'develop'], 60000);
      const bakom = +(S(A, 'git', ['rev-list', '--count', 'HEAD..prod/develop'], 30000).trim() || '0');
      if (bakom > 0) {
        S(A, 'git', ['merge', 'prod/develop', '--no-edit', '-m', 'studio: merge prod → develop (rond 148-kur möter fabrikens leveranser)'], 120000);
      }
      const push = S(A, 'git', ['push', 'prod', 'develop'], 120000);
      if (!/FEL/.test(push)) { ut.push = push.split('\n').filter(r => /develop|->/.test(r)).join(' | ').slice(0, 140); ut.pushad = true; break; }
      ut['pushForsok' + i] = push.slice(0, 120);
      if (!/staged changes|unstaged|fetch first/.test(push)) break;
    } else { ut['vantar' + i] = blockerare().slice(0, 3); }
    if (i < 6) await new Promise(r => setTimeout(r, 60000));
  }
}
ut.head = S(A, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 70);
console.log(JSON.stringify(ut, null, 1));
