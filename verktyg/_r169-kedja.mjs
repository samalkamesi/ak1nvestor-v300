// Rond 169: mimosa-självhärdning commit → emottag+push → färsk vakt → v164-status (allt execFileSync-array)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const WS = '/home/ak1a/agent/ak1', PROD = '/home/ak1a/AK1';
const git = (args, cwd, tmo = 420000) => execFileSync('git', args, { cwd, encoding: 'utf8', timeout: tmo, maxBuffer: 32 * 1024 * 1024 });
const logg = (m) => console.log(m);

// 1) commit
git(['add', 'verktyg/_r167-commit.mjs', 'verktyg/_r168-pollfix.mjs', 'verktyg/_r168-tsc.mjs', 'verktyg/_r168-bokfor.mjs', 'verktyg/_r169-kedja.mjs'], WS);
git(['commit', '-m', 'studio: rond 169 [organ:Φ] — mimosa-självhärdning: tre egna commit-runers interpolerade git-anrop → execFileSync-array (skannerns 3 prod-fynd var MINA; arbetsytan 0 fynd GRÖN)'], WS);
logg('HEAD: ' + git(['rev-parse', '--short', 'HEAD'], WS).trim());
logg('yta: ' + (git(['status', '--porcelain'], WS).trim() || 'REN'));

// 2) prod-ytans spårade rader + emottag/push om rent
const prodYta = git(['status', '--porcelain'], PROD).trim().split('\n').filter(l => l && !l.startsWith('??'));
if (prodYta.length) {
  logg('PUSH SKIPPAD: prod spårad-smutsig (' + prodYta.length + ' rader) — barn arbetar, poll körs nästa rond');
} else {
  git(['fetch', 'prod', 'develop'], WS);
  try {
    const m = git(['merge', 'prod/develop', '-m', 'merge: iteration emottag prod — rond 169 självhärdning'], WS);
    logg('EMOTTAGEN: ' + m.trim().split('\n').slice(-1)[0].slice(0, 100));
    git(['push', 'prod', 'develop'], WS);
    const wsH = git(['rev-parse', '--short', 'HEAD'], WS).trim(), prH = git(['rev-parse', '--short', 'HEAD'], PROD).trim();
    logg(wsH === prH ? 'PUSH-GRON: ws=prod=' + wsH : 'DIVERGERAR ws=' + wsH + ' prod=' + prH);
  } catch (e) {
    try { git(['merge', '--abort'], WS); } catch {}
    logg('MERGE-KONFLIKT (avbruten): ' + String(e.message).slice(0, 200));
  }
}

// 3) färsk vakt i prod-trädet (oavsett push — trädets kurstatus mäts)
logg('VAKT-START');
try {
  const v = execFileSync('node', ['verktyg/kvalitetsvakt.mjs'], { cwd: PROD, encoding: 'utf8', timeout: 330000, maxBuffer: 32 * 1024 * 1024 });
  const rad = (v.match(/SAMMANFATTNING: ANTAL FEL[^\n]*/) || ['?'])[0];
  logg('VAKT: ' + rad);
} catch (e) { logg('VAKT-FEL: ' + String(e.message).slice(0, 200)); }

// 4) v164 i fabrikskö + status
const koFinns = fs.existsSync(PROD + '/data/vakten/agentfabrik/ko/v164-fas3-djup.json');
const stat = fs.readdirSync(PROD + '/data/vakten/agentfabrik/status/').sort().slice(-3);
logg('v164 i ko/: ' + koFinns + ' | statusfiler: ' + stat.join(', '));
