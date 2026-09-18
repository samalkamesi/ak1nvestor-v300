#!/usr/bin/env node
// _s7u3o61-sond-palettchunk.mjs — Spår 7 o61: hitta palett-chunkens hämtningstid
// i en Lighthouse-rapport (FÖRE-bevis). Letar js-requests 8–30 K med starttid
// under 3 s och listar dem; palett-familjen dokumenterad 15–21 K @ 0,9–1,25 s.
import { readFileSync } from "node:fs";

const fil = process.argv[2];
const r = JSON.parse(readFileSync(fil, "utf8"));
const reqs = r.audits?.["network-requests"]?.details?.items ?? [];
const js = reqs
  .filter((q) => q.url.endsWith(".js") || q.url.includes("/_next/"))
  .map((q) => ({
    url: q.url.split("/").slice(-1)[0].slice(0, 34),
    start: Math.round(q.networkRequestTime ?? 0),
    slut: Math.round(q.networkEndTime ?? 0),
    transfer: q.transferSize ?? 0,
  }))
  .filter((q) => q.transfer > 8000 && q.transfer < 32000 && q.start < 9000)
  .sort((a, b) => a.start - b.start);
console.log(`${fil.split("/").slice(-1)[0]} — kandidat-chunkar (6–32 K, start < 3,5 s):`);
for (const q of js) console.log(`  ${String(q.start).padStart(5)}–${String(q.slut).padStart(5)} ms  ${String(q.transfer).padStart(6)} B  ${q.url}`);
console.log(`  (totalt ${js.length} träffar; sökband enligt o57 §6: 15–21 K @ 0,9–1,25 s)`);
