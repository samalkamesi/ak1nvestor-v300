#!/usr/bin/env node
// _r158-prodlage.mjs — rond 158 [organ:Φ]: prod-läge på djupet — kf1-kf3-granskning,
// mimosa-kur-filernas läge i prod, mimosa full-scan i PROD-trädet (cwd=PROD),
// diff-läge arbetsyta↔prod åt båda håll + deploylåsets ägare.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const out = {};

const git = (repo, ...args) => {
  try {
    return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', timeout: 30000 }).trim();
  } catch (e) {
    return 'FEL:' + String(e.stdout || e.message || e).slice(0, 200);
  }
};

// 1. kf1-kf3: datum + berörda filer
out.kfCommits = {};
for (const h of ['f86f8590', '7cb6177b', '6c1ab6fb']) {
  const visa = git(PROD, 'show', '--name-status', '--format=%ci :: %s', h);
  out.kfCommits[h] = visa.split('\n').slice(0, 14);
}

// 2. mimosa-kur II:s filer (ur arbetsytans ebf5269f) — läge i prod?
const kurFiler = git(WS, 'show', '--name-only', '--format=', 'ebf5269f').split('\n').filter(Boolean);
out.kurFilerWS = kurFiler;
const samma = (a, b) => {
  try { return spawnSync('cmp', ['-s', a, b], { timeout: 10000 }).status === 0; } catch { return false; }
};
out.kurFilerProd = kurFiler.map(f => ({
  f,
  finnsIProd: fs.existsSync(PROD + '/' + f),
  identiska: fs.existsSync(PROD + '/' + f) ? samma(WS + '/' + f, PROD + '/' + f) : false
}));

// 3. mimosa full-scan i PROD-trädet
const r = spawnSync('node', [PROD + '/verktyg/mimosa-paritet.mjs', '--doman', '.'], { cwd: PROD, encoding: 'utf8', timeout: 420000, maxBuffer: 64 * 1024 * 1024 });
out.mimosaProdExit = r.status;
out.mimosaProdSista = ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-12);

// 4. diff-läge båda riktningar (fetch först för färsk remote-tracking)
git(WS, 'fetch', 'prod', 'develop');
const BARA_I_WS = git(WS, 'log', '--oneline', 'prod/develop..develop').split('\n').filter(Boolean);
const BARA_I_PROD = git(WS, 'log', '--oneline', 'develop..prod/develop').split('\n').filter(Boolean);
out.baraIWS = BARA_I_WS;
out.baraIProd = BARA_I_PROD;

// 5. deploylåset (mätfönster-grinden — SSR mäts aldrig i deployfönster)
try {
  out.deployLock = execFileSync('fuser', ['/tmp/ak1a-deploy.lock'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || 'fri';
} catch (e) {
  out.deployLock = 'fri';
}

// 6. arbetsytans smuts
out.wsDirty = git(WS, 'status', '--porcelain').split('\n').filter(Boolean);

console.log(JSON.stringify(out, null, 1));
