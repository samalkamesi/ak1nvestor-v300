// Sond: var pekar prod-DNS, och vad svarar den? (v227 drift-rond)
import { resolve4 } from 'node:dns/promises';

const doman = 'lab.ak1nvestor.com';
try {
  const adr = await resolve4(doman);
  console.log('DNS A:', adr.join(', '));
} catch (e) {
  console.log('DNS FEL:', e.code || e.message);
}

for (const url of ['https://lab.ak1nvestor.com/', 'http://lab.ak1nvestor.com/']) {
  const t0 = Date.now();
  try {
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(8000) });
    console.log(url, '→', r.status, `${Date.now() - t0} ms`);
  } catch (e) {
    console.log(url, '→ FEL', e.cause?.code || e.message, `${Date.now() - t0} ms`);
  }
}
