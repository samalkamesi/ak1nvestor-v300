// Steg 1: Kolla PROD-trädets status (modifierade trackade filer, untracked ignoreras)
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

let ut = '';
try {
  const status = execFileSync('git', ['-C', '/home/ak1a/AK1', 'status', '--porcelain'], {
    encoding: 'utf8',
    timeout: 30000,
  });
  const rader = status.split('\n').filter(Boolean);
  const blockerande = rader.filter((r) => {
    const xy = r.slice(0, 2);
    return /[MUA]/.test(xy);
  });
  const untracked = rader.filter((r) => r.startsWith('??'));
  ut = JSON.stringify({
    ok: true,
    rent: blockerande.length === 0,
    blockerande,
    untrackedAntal: untracked.length,
    untrackedExempel: untracked.slice(0, 5),
    allaRader: rader.slice(0, 30),
  }, null, 2);
} catch (e) {
  ut = JSON.stringify({ ok: false, fel: String(e && e.message ? e.message : e) }, null, 2);
}
writeFileSync('/home/ak1a/agent/ak1/.tmp-deploy-steg1-status.txt', ut);
console.log(ut);
