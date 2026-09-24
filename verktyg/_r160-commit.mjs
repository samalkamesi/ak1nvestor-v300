#!/usr/bin/env node
// _r160-commit.mjs — bokför iterationen: worklog-rad + commit av P2 + sonder.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync, unlinkSync, existsSync } from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 180000, cwd: WS, ...opts }).trim();
}
const log = (m) => console.log(m);

try {
  // 1. Worklog-raden
  appendFileSync(`${WS}/worklog.md`, readFileSync(`${WS}/verktyg/_r160-worklograd.txt`, 'utf8'));
  log('Worklog: rad appendad');

  // 2. Stage allt av rondens
  const filer = [
    'worklog.md',
    'src/app/(huvud)/cookiepolicy/page.tsx',
    'src/app/(huvud)/privacy-policy/page.tsx',
    'src/app/(huvud)/labb/[id]/page.tsx',
    'src/app/(huvud)/pro/priser/page.tsx',
    'src/app/(huvud)/pro/klienter/page.tsx',
    'src/app/(huvud)/pro/analys/page.tsx',
    'src/app/(huvud)/pro/rapporter/page.tsx',
    'src/app/(huvud)/analyser/page.tsx',
    'src/app/(huvud)/logga-in/page.tsx',
    'src/app/(huvud)/medlemskap/page.tsx',
    'src/components/ak1a/topplista.tsx',
    'src/components/ak1a/bibliotek.tsx',
    'verktyg/_r160-lage.mjs',
    'verktyg/_r160-byggfel.mjs',
    'verktyg/_r160-emottag.mjs',
    'verktyg/_r160-byggwrapper.sh',
    'verktyg/_r160-bygg.mjs',
  ];
  sh('git', ['add', ...filer]);
  log('Staged: ' + filer.length + ' filer');

  // 3. Commit med -F-mönstret (pre-commit-grinden kör tsc — 0 sedan våg 133)
  sh('git', ['commit', '-F', 'verktyg/_r160-commitmsg.txt']);
  log('Commit: ' + sh('git', ['rev-parse', '--short', 'HEAD']));

  // 4. Städning av bokföringsfilerna (meddelandefilen behålls tills pushat — kvittorad)
  for (const f of ['verktyg/_r160-worklograd.txt']) {
    if (existsSync(`${WS}/${f}`)) unlinkSync(`${WS}/${f}`);
  }
  log('Yta efter: ' + (sh('git', ['status', '--porcelain']) || 'ren'));

  // 5. Beslutsminnet (gitignorerad — ingen commit)
  const minne = {
    ts: new Date().toISOString(),
    rond: 160,
    beslut: 'v160 P2 [organ:Φ] — 13 presentationala edits (tsc 0) + byggkur ENOTEMPTY (dirigent väntar s2-barn)',
    landat: 'pending-push',
  };
  appendFileSync(`${WS}/data/forskning/beslutsminne.jsonl`, JSON.stringify(minne) + '\n');
  log('Beslutsminne: bokfört');
} catch (e) {
  console.log('FEL: ' + e.message);
  process.exit(1);
}
