// Vänta in ett rent fönster i prod-trädet (/home/ak1a/AK1) och pusha då:
// pollar var 20:e sekund (max 9 min). Rent = inga staged/unstaged rader
// (untracked ?? är harmlösa för push när namnkrockar är borta).
// Vid rent: fetch → merge → push; loopar vid non-ff (pari session pushar).
import { execFileSync } from 'node:child_process';

const gitLokal = (args) => { try { return { ok: true, ut: execFileSync('git', args, { encoding: 'utf8', stderr: 'pipe' }) }; } catch (e) { return { ok: false, ut: (e.stdout || '') + (e.stderr || '') }; } };

function prodRent() {
  try {
    const ut = execFileSync('git', ['-C', '/home/ak1a/AK1', 'status', '--porcelain'], { encoding: 'utf8', stderr: 'pipe' });
    const blockerande = ut.trim().split('\n').filter(Boolean).filter(r => !r.startsWith('??'));
    return blockerande.length === 0;
  } catch { return false; }
}

const start = Date.now();
const takMs = 9 * 60 * 1000;
let försök = 0;
while (Date.now() - start < takMs) {
  försök++;
  if (!prodRent()) {
    if (försök % 3 === 1) console.log(`[${new Date().toISOString().slice(11, 19)}] prod-trädet upptaget — väntar 20 s (försök ${försök})`);
    await new Promise(r => setTimeout(r, 20000));
    continue;
  }
  console.log(`[${new Date().toISOString().slice(11, 19)}] RENT FÖNSTER — synkar`);
  const f = gitLokal(['fetch', 'prod']); if (!f.ok) { console.log('fetch FEL', f.ut.slice(0, 200)); process.exit(1); }
  const m = gitLokal(['merge', 'prod/develop', '--no-edit']);
  if (!m.ok) { console.log('merge KONFLIKT — manuell lösning krävs:\n' + m.ut.slice(0, 300)); process.exit(1); }
  console.log('merge:', (m.ut || '(up to date)').trim().split('\n').slice(-3).join(' | ').slice(0, 200));
  const p = gitLokal(['push', 'prod', 'develop']);
  if (p.ok) { console.log('PUSH GRÖN:\n' + p.ut.trim().slice(0, 300)); process.exit(0); }
  console.log('push avvisad (kapplöpning?) — fortsätter loopen:', p.ut.split('\n').filter(l => l.includes('rejected') || l.includes('error')).join(' ').slice(0, 200));
  await new Promise(r => setTimeout(r, 15000));
}
console.log('TAK NÅTT — inget rent fönster inom 9 min; push förblir nästa ronds första steg');
process.exit(3);
