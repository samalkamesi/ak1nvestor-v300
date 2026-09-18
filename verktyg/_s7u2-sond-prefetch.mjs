#!/usr/bin/env node
// s7-u2 o49-sond: räkna _rsc-prefetch requests i en Lighthouse-rapport — vilka URL:er, hur många bytes
import { readFileSync } from "node:fs";

const fil = process.argv[2];
const rapp = JSON.parse(readFileSync(fil, "utf8"));
const reqs = rapp.audits["network-requests"]?.details?.items ?? [];

const rsc = reqs.filter((r) => r.url.includes("_rsc") || r.url.includes("__next"));
console.log(`Totalt ${reqs.length} requests, varav RSC/next-relaterade ${rsc.length}:`);
let summa = 0;
for (const r of rsc) {
  summa += r.transferSize || 0;
  const u = new URL(r.url);
  console.log(
    `  ${u.pathname}${u.search} · ${(r.transferSize || 0 / 1024).toFixed ? ((r.transferSize || 0) / 1024).toFixed(1) : 0} KiB · status ${r.statusCode} · ${r.resourceType}`
  );
}
console.log(`RSC-summa: ${(summa / 1024).toFixed(1)} KiB`);
console.log(`Total transferSize: ${(reqs.reduce((a, r) => a + (r.transferSize || 0), 0) / 1024).toFixed(1)} KiB`);
