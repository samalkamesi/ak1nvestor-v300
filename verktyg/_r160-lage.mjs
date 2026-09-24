#!/usr/bin/env node
// _r160-lage.mjs — iterationens lägessond: deploy-läge, /fas2 i live-sitemap,
// fabrik, RAM, kvalitetsrapport, git-läge båda träden.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';

const PROD = '/home/ak1a/AK1';
const WS = process.cwd();
const out = { ts: new Date().toISOString() };

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 20000, ...opts }).trim();
}

// --- RAM
try {
  const mi = readFileSync('/proc/meminfo', 'utf8');
  out.ramMB = Math.round(parseInt(mi.match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024);
} catch (e) { out.ramMB = 'ERR ' + e.message; }

// --- git båda träd
for (const [key, dir] of [['ws', WS], ['prod', PROD]]) {
  try {
    out[key] = {
      head: sh('git', ['-C', dir, 'rev-parse', '--short', 'HEAD']),
      dirty: sh('git', ['-C', dir, 'status', '--porcelain']).split('\n').filter(Boolean),
    };
  } catch (e) { out[key] = 'ERR ' + e.message; }
}
out.wsHeadIProd = !!(out.ws?.head && out.prod?.head && out.ws.head === out.prod.head);

// --- prod-synk-log: hitta + svans
try {
  const r = sh('find', [`${PROD}/data`, '-maxdepth', '3', '-name', '*synk*', '-type', 'f']);
  const kand = r.split('\n').filter(Boolean);
  kand.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  out.synkFil = kand[0] || null;
  if (out.synkFil) out.synkSvans = readFileSync(out.synkFil, 'utf8').trimEnd().split('\n').slice(-16);
} catch (e) { out.synk = 'ERR ' + e.message; }

// --- live-sitemap + sidor (loopback)
for (const [key, url] of [['sitemap', 'http://localhost:3000/sitemap.xml'], ['fas2Sida', 'http://localhost:3000/fas2'], ['startsida', 'http://localhost:3000/']]) {
  try {
    const r = await fetch(url);
    if (key === 'sitemap') {
      const body = await r.text();
      out.sitemap = { status: r.status, fas2: body.includes('/fas2'), langd: body.length };
    } else out[key] = r.status;
  } catch (e) { out[key] = 'ERR ' + e.message; }
}

// --- fabrikstatus
try {
  const dir = `${PROD}/data/vakten/agentfabrik/status`;
  if (existsSync(dir)) {
    out.fabrik = readdirSync(dir).map((f) => {
      try {
        const j = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
        const u = j.uppgifter || [];
        return { id: j.id || f, status: j.status, klara: u.filter((x) => x.status === 'klar').length, total: u.length };
      } catch { return { id: f, las: 'FEL' }; }
    });
  } else out.fabrik = 'ingen statuskatalog';
} catch (e) { out.fabrik = 'ERR ' + e.message; }

// --- kvalitetsrapport + vaktskript
try {
  const p = `${PROD}/data/rapporter/kvalitetsrapport-SENASTE.md`;
  if (existsSync(p)) {
    const t = readFileSync(p, 'utf8');
    out.kvalitet = t.split('\n').filter((l) => /ANTAL FEL|STATUS|[Gg]enererad/i.test(l)).slice(0, 5);
  } else out.kvalitet = 'saknas';
} catch (e) { out.kvalitet = 'ERR ' + e.message; }
out.vaktSkript = {
  prodKvalitetsvakt: existsSync(`${PROD}/verktyg/kvalitetsvakt.mjs`),
  wsKvalitetsvakt: existsSync(`${WS}/verktyg/kvalitetsvakt.mjs`),
  prodVerktygKvalit: readdirSync(`${PROD}/verktyg`).filter((f) => /kvalit/i.test(f)),
};

console.log(JSON.stringify(out, null, 1));
