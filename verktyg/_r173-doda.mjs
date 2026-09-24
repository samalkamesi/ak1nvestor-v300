// Döda gamla push-dirigenten (pid 3260769) — den saknar process-koll
import fs from 'node:fs';
const pid = 3260769;
try {
  process.kill(pid, 'SIGKILL');
  console.log('SIGKILL skickad till', pid);
} catch (e) {
  console.log('kill-fel:', e.message);
}
// verifiera via /proc
setTimeout(() => {
  try { fs.statSync(`/proc/${pid}/cmdline`); console.log('LEVER fortfarande'); }
  catch { console.log('BAORT ur processtabålen'); }
}, 1500);
