#!/usr/bin/env node
// _s7u3n-isrtrigg.mjs — ISR-trigga ×2 + 8 s per sida (11163-metoden):
// första hämtningen sparkar SWR-omvalidieringen, vila 8 s, andra hämtningen
// verifierar färsk HTML (x-nextjs-cache) före Lighthouse-mätning.
const BAS = "http://localhost:3000";
const SIDOR = ["/", "/kurser", "/blogg", "/en/blogg"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const s of SIDOR) {
  const t1 = await fetch(BAS + s);
  const cache1 = t1.headers.get("x-nextjs-cache") ?? "-";
  await t1.text();
  await sleep(8000);
  const t0 = Date.now();
  const t2 = await fetch(BAS + s);
  const cache2 = t2.headers.get("x-nextjs-cache") ?? "-";
  await t2.text();
  console.log(`${s}: första=${cache1} andra=${cache2} ${Date.now() - t0}ms (status ${t2.status})`);
}
