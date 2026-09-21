// Prod-trädets hygienläge: vad är okommittat? (beslutunderlag före push)
import { execFileSync } from 'node:child_process';
const P = '/home/ak1a/AK1';
const S = (cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd: P, maxBuffer: 16 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 200); } };
const ut = { nu: new Date().toISOString() };
ut.status = S('git', ['status', '--porcelain']).trim().split('\n').filter(Boolean).slice(0, 20);
ut.branch = S('git', ['branch', '--show-current']).trim();
ut.head = S('git', ['log', '--oneline', '-1']).trim().slice(0, 100);
// diff-statistik för tracked-modifikationer
if (ut.status.some(r => /^ M/.test(r))) ut.diffStat = S('git', ['diff', '--stat']).trim().split('\n').slice(-8);
console.log(JSON.stringify(ut, null, 1));
