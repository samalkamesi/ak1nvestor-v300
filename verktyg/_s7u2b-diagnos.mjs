#!/usr/bin/env node
// _s7u2b-diagnos.mjs — s7-u2 (auto-s7-1789617927277): diagnos av SV:s dubbla
// blogg-slug-prefetchar ur syskonens färska EFTER-rådata (blogg-gap-efter,
// prefetch-kuren 7f419839 live). Listar alla requests i initial load med
// _rsc/query + grupperar per slug för SV (/blogg) mot EN (/en/blogg).
import { readFileSync } from "node:fs";

const KAT = "data/forskning/OPTIMERING/lighthouse";
const filer = ["blogg-blogg-gap-efter.json", "en_blogg-blogg-gap-efter.json"];

for (const fil of filer) {
  const r = JSON.parse(readFileSync(`${KAT}/${fil}`, "utf8"));
  const url = r.finalDisplayedUrl || r.fetchedUrl || "?";
  console.log(`\n=== ${fil} (${url}) — networkrequests i initial load ===`);
  const reqs = r.audits?.["network-requests"]?.details?.items ?? [];
  let totalt = 0, antal = 0;
  const rscPerSlug = new Map();
  for (const q of reqs) {
    if (q.transferSize == null) continue;
    totalt += q.transferSize;
    antal++;
    const u = new URL(q.url);
    const rsc = u.searchParams.get("_rsc");
    if (rsc !== null) {
      const nyckel = u.pathname;
      if (!rscPerSlug.has(nyckel)) rscPerSlug.set(nyckel, []);
      rscPerSlug.get(nyckel).push({
        cacheBust: u.searchParams.get("x-nextjs-cache-bust") ? "xb" : null,
        rsc: rsc.slice(0, 8),
        byte: q.transferSize,
        start: Math.round(q.networkRequestTime),
      });
    }
  }
  console.log(`requests=${antal} totalTransferSize=${Math.round(totalt / 1024)} KiB`);
  const sorterade = [...rscPerSlug.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]));
  for (const [slug, list] of sorterade) {
    const tot = list.reduce((s, x) => s + x.byte, 0);
    console.log(
      `  ${slug}: ${list.length} st _rsc, totalt ${(tot / 1024).toFixed(1)} KiB — ` +
      list.map((x) => `#${x.rsc}@${x.start}ms ${x.byte}B`).join(" | ")
    );
  }
  // Även: longtasks + script evaluation för kontext
  const se = r.audits?.["script-treemap-data"];
  void se;
}
