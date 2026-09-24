// Rond 154 — vem äger .next/dev? + svepets progress
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const u = {};
try {
  const ps = execFileSync('ps', ['eo', 'pid,ppid,etime,args'], { stdio: 'pipe' }).toString();
  u.nextDev = ps.split('\n').filter(r => /next dev|next-server|\bdev\b.*next/i.test(r) && !/grep/.test(r)).map(r => r.trim().slice(0, 130)).slice(0, 5);
  u.svepBarn = ps.split('\n').filter(r => /kor-alla-tester|testa-/.test(r) && !/grep/.test(r)).map(r => r.trim().slice(0, 110)).slice(0, 5);
} catch (e) { u.psFel = String(e).slice(0, 100); }
try {
  const st = fs.statSync(ROT + '/.next/dev/types/routes.d.ts');
  u.routesDts = { mtime: st.mtime.toISOString(), strl: st.size };
} catch (e) { u.routesFel = String(e).slice(0, 80); }
try {
  const log = fs.readFileSync(ROT + '/data/vakten/r154-fullsvep5-fortsatt.log', 'utf8').trim().split('\n');
  u.svepSista = log[log.length - 1]?.slice(0, 120);
  u.svepRader = log.length;
} catch {}
console.log(JSON.stringify(u, null, 1));
