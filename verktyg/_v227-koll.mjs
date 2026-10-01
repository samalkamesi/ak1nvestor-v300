// Sond v227: syntaxkoll av kurerade verktyg + snabb app-kontraktskoll
import { execFileSync } from 'node:child_process';

for (const fil of ['verktyg/prod-synk.mjs', 'verktyg/pulsvakt.mjs']) {
  try {
    execFileSync('node', ['--check', fil], { stdio: 'pipe' });
    console.log('SYNTAX GRÖN:', fil);
  } catch (e) {
    console.log('SYNTAX FEL:', fil, String(e.stderr || e.message).slice(0, 200));
    process.exitCode = 1;
  }
}

// appOk-kontraktet live: loopback 200 + "AK1A" (v227:ns domare)
try {
  const r = await fetch('http://localhost:3000/', {
    headers: { Host: 'lab.ak1nvestor.com', 'User-Agent': 'ak1a-prod-synk' },
    redirect: 'manual',
    signal: AbortSignal.timeout(8000),
  });
  const t = await r.text();
  console.log('appOk live-prov:', r.status === 200 && t.includes('AK1A') ? 'GRÖN (200+AK1A)' : `RÖD (${r.status})`);
} catch (e) {
  console.log('appOk live-prov FEL:', e.cause?.code || e.message);
  process.exitCode = 1;
}
