#!/usr/bin/env node
// _s7u2b-djup.mjs — s7-u2: detaljläsning av _rsc-requests (status, resourceSize,
// cache/priority-fält) för att avgöra vad EN:s 0 B-transfer är tekniskt.
import { readFileSync } from "node:fs";

const KAT = "data/forskning/OPTIMERING/lighthouse";
for (const fil of ["blogg-blogg-gap-efter.json", "en_blogg-blogg-gap-efter.json"]) {
  const r = JSON.parse(readFileSync(`${KAT}/${fil}`, "utf8"));
  const reqs = r.audits?.["network-requests"]?.details?.items ?? [];
  console.log(`\n=== ${fil} ===`);
  for (const q of reqs) {
    const u = new URL(q.url);
    if (u.searchParams.get("_rsc") === null) continue;
    console.log(
      `${u.pathname}` +
      ` status=${q.statusCode} transfer=${q.transferSize}B resource=${q.resourceSize}B` +
      ` fromCache=${q.fromDiskCache === true ? "disk" : q.fromMemoryCache === true ? "mem" : "-"}` +
      ` prio=${q.priority} start=${Math.round(q.networkRequestTime)}ms` +
      ` _rsc=${u.searchParams.get("_rsc")?.slice(0, 8)}`
    );
  }
}
// Next-versionen för kontext
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
console.log(`\nnext-version: ${pkg.dependencies?.next ?? pkg.devDependencies?.next}`);
