// r358: beslutsminne-append + commit + push-loop + städning
import { execSync } from 'node:child_process';
import { appendFileSync, rmSync } from 'node:fs';

const AGENT = '/home/ak1a/agent/ak1';
const kör = (cmd) => {
  try { return { ok: true, ut: execSync(cmd, { cwd: AGENT, timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim() }; }
  catch (e) { return { ok: false, ut: ((e.stdout || '') + (e.stderr || '')).toString().trim() }; }
};

// 1. beslutsminne (gitignorerad disk-yta — append idempotensskyddad)
const MINNE = AGENT + '/data/vakten/beslutsminne.jsonl';
const rad = '{"ts":"2026-09-30T22:55:00.000Z","rond":358,"beslut":"r358 [Φ]: RAD-raden domad FRISKT med mätning (51 GB available, swap-enhet saknas 0/0 — helsprovets klassfel, inte resurs; deploy bevittnad levande under flock, prod 200) · kön refillad 3 vågor ur evighetskatalogen (v215 swap-provkur, v216 gap-forskning v2, v217 cache-headers) · täcker även r353-r357:s landningar (F7-kur + prod-rena + o571-efterdyning grön)","landat":"commit r358"}\n';
const befintligt = kör('tail -1 data/vakten/beslutsminne.jsonl').ut;
if (!befintligt.includes('"rond":358')) {
  appendFileSync(MINNE, rad);
  console.log('beslutsminne: rad appenderad');
} else {
  console.log('beslutsminne: fanns redan (idempotent)');
}

// 2. commit
const co = kör('git add data/forskning/PIPELINE-KO.md worklog.md && git commit -F verktyg/_r358-msg.txt');
if (!co.ok) { console.log('commit FEL\n' + co.ut); process.exit(1); }
console.log('commit: OK ' + co.ut.split('\n')[0]);

// 3. push-loop
for (let försök = 1; försök <= 5; försök++) {
  kör('git fetch prod develop');
  const n = parseInt(kör('git rev-list --count HEAD..FETCH_HEAD').ut || '0', 10);
  if (n > 0) {
    const m = kör('git merge --no-ff FETCH_HEAD -m "merge: prod -> develop — r358"');
    if (!m.ok) { console.log('merge FEL\n' + m.ut); process.exit(1); }
    console.log('merge: OK (' + n + ' nya)');
  }
  const p = kör('git push prod develop');
  if (p.ok) {
    console.log('PUSH OK');
    console.log(kör('git log --oneline -1').ut);
    for (const f of ['_r358-commit']) rmSync(AGENT + '/verktyg/' + f + '.mjs', { force: true });
    rmSync(AGENT + '/verktyg/_r358-msg.txt', { force: true });
    console.log('städning: OK');
    process.exit(0);
  }
  console.log('push avslag (försök ' + försök + ')');
  await new Promise(r => setTimeout(r, 8000));
}
console.log('PUSH MISSLYCKADES');
process.exit(1);
