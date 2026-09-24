#!/usr/bin/env node
// _r158-pusha.mjs — rond 158 [organ:Φ]: push develop → prod med retry,
// verifiering (wsHeadIProd), mimosa full-scan i PROD-trädet, kvitto till disk.
// Push till lokal path-remote är git-ref-operation och river inte pågående
// bygge i prod:s utcheckade katalog (deploy-skriptet pullar FÖRE bygget).
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const out = { startad: new Date().toISOString() };

const git = (repo, ...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', timeout: 180000 }).trim();

out.wsHeadFore = git(WS, 'rev-parse', 'HEAD');

// Push med retry (r157-läxan: ETIMEDOUT vid hög last → dubbel timeout + omkörning)
out.pushForsok = [];
for (let i = 1; i <= 3; i++) {
  const r = spawnSync('git', ['-C', WS, 'push', 'prod', 'develop'], { encoding: 'utf8', timeout: 240000 });
  const rad = { forsok: i, exit: r.status, ut: ((r.stdout || '') + (r.stderr || '')).trim().slice(-400) };
  out.pushForsok.push(rad);
  if (r.status === 0) break;
}

out.wsHeadEfter = git(WS, 'rev-parse', 'HEAD');
out.prodHeadEfter = git(PROD, 'rev-parse', 'HEAD');
out.wsHeadIProd = spawnSync('git', ['-C', PROD, 'merge-base', '--is-ancestor', out.wsHeadEfter, 'HEAD'], { timeout: 30000 }).status === 0;
out.prodDirty = git(PROD, 'status', '--porcelain').split('\n').filter(Boolean).slice(0, 8);

// Mimosa full-scan i PROD — leveransbeviset (2 fynd i _r156-filerna skall vara 0)
if (out.wsHeadIProd) {
  const m = spawnSync('node', [PROD + '/verktyg/mimosa-paritet.mjs', '--doman', '.'], { cwd: PROD, encoding: 'utf8', timeout: 420000, maxBuffer: 64 * 1024 * 1024 });
  out.mimosaProdExit = m.status;
  out.mimosaProdSista = ((m.stdout || '') + (m.stderr || '')).trim().split('\n').slice(-6);
} else {
  out.mimosaSkipped = 'wsHeadIProd=false';
}

out.slutad = new Date().toISOString();
fs.writeFileSync(WS + '/data/vakten/r158-push-kvitto.txt', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
