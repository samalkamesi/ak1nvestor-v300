#!/usr/bin/env node
// _r157-slutkontroll.mjs — rond 157 slutkontroll: push-läge, prod-yta, fabrik, prod-hälsa + mimosa full-domän i PROD-trädet (cwd=PROD) när ytan är ren
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const out = {};

const git = (repo, ...args) => {
  try {
    return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', timeout: 30000 }).trim();
  } catch (e) {
    return 'FEL:' + String(e.stdout || e.message || e).slice(0, 160);
  }
};

out.wsHead = git(WS, 'rev-parse', 'HEAD');
out.wsDirty = git(WS, 'status', '--porcelain').split('\n').filter(Boolean);
out.prodHead = git(PROD, 'rev-parse', 'HEAD');
const prodStatus = git(PROD, 'status', '--porcelain').split('\n').filter(Boolean);
out.prodDirtyCount = prodStatus.length;
out.prodDirtyExempel = prodStatus.slice(0, 8);
out.prodLog = git(PROD, 'log', '--oneline', '-5').split('\n');
out.wsHeadIProd = spawnSync('git', ['-C', PROD, 'merge-base', '--is-ancestor', out.wsHead, 'HEAD'], { timeout: 30000 }).status === 0;

const mi = fs.readFileSync('/proc/meminfo', 'utf8');
out.memAvailableMB = Math.round(parseInt(/MemAvailable:\s+(\d+)/.exec(mi)[1], 10) / 1024);

// Fabrikskö + senaste status
try {
  out.fabrikKo = fs.readdirSync(WS + '/data/vakten/agentfabrik/ko').filter(f => f.endsWith('.json'));
} catch { out.fabrikKo = 'saknas'; }
try {
  const stDir = WS + '/data/vakten/agentfabrik/status';
  out.fabrikSenaste = fs.readdirSync(stDir).filter(f => f.endsWith('.json')).sort().slice(-4).map(f => {
    try {
      const j = JSON.parse(fs.readFileSync(stDir + '/' + f, 'utf8'));
      const u = j.uppgifter || [];
      return { f, status: j.status, klara: u.filter(x => x.status === 'klar').length + '/' + u.length };
    } catch { return { f, status: 'oläslig' }; }
  });
} catch { out.fabrikSenaste = 'saknas'; }

// Beslutsminne-läge (hitta filerna)
const beslutSok = (dir) => {
  try { return fs.readdirSync(dir).filter(f => f.toLowerCase().includes('beslut')); } catch { return []; }
};
out.beslutFiler = { forskning: beslutSok(WS + '/data/forskning'), vakten: beslutSok(WS + '/data/vakten') };

// Prod-hälsa
const hamta = async (url) => {
  try {
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    return r.status;
  } catch (e) { return 'FEL:' + String(e.cause?.code || e.message).slice(0, 60); }
};
out.httpLocal = await hamta('http://localhost:3000/');
out.httpProd = await hamta('https://lab.ak1nvestor.com/');
try {
  const st = fs.statSync(PROD + '/.next/BUILD_ID');
  out.buildAgeMin = Math.round((Date.now() - st.mtimeMs) / 60000);
} catch { out.buildAgeMin = 'saknas'; }

// Mimosa full-domän i PROD — endast när prod-ytan är ren och push är igenom
out.mimosaVerktyg = fs.readdirSync(PROD + '/verktyg').filter(f => f.toLowerCase().includes('mimosa') && f.endsWith('.mjs'));
if (out.prodDirtyCount === 0 && out.wsHeadIProd) {
  const scanner = out.mimosaVerktyg.find(f => /skann|scan|kvalitet/.test(f)) || out.mimosaVerktyg[0];
  out.mimosaScanner = scanner ?? null;
  if (scanner) {
    const r = spawnSync('node', [PROD + '/verktyg/' + scanner, '--doman', '.'], { cwd: PROD, encoding: 'utf8', timeout: 420000, maxBuffer: 64 * 1024 * 1024 });
    out.mimosaExit = r.status;
    out.mimosaSista = ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-30);
  }
} else {
  out.mimosaSkipped = `prodDirty=${out.prodDirtyCount} wsHeadIProd=${out.wsHeadIProd}`;
}

console.log(JSON.stringify(out, null, 1));
