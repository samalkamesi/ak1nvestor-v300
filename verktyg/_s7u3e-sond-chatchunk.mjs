#!/usr/bin/env node
/** Sond: hitta chat-chunkens bidrag i FÖRE-mätningens Lighthouse-rapporter. */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const KAT = "data/forskning/OPTIMERING/lighthouse";
for (const sida of ["start", "kurser", "blogg"]) {
  const r = JSON.parse(readFileSync(join(process.cwd(), KAT, `${sida}-s7u3e-chatfore.json`), "utf8"));
  const aud = r.audits ?? {};
  console.log(`\n=== /${sida === "start" ? "" : sida} (FÖRE) ===`);

  // Nätverksrequests: alla JS-chunkar med timing
  const reqs = (aud["network-requests"]?.details?.items ?? []).filter(
    (x) => x.resourceType === "Script" && /chat|mentor|widget/i.test(x.url) === false ? false : true,
  );
  const jsReqs = (aud["network-requests"]?.details?.items ?? []).filter((x) => x.resourceType === "Script");
  const stora = jsReqs.sort((a, b) => (b.transferSize ?? 0) - (a.transferSize ?? 0)).slice(0, 6);
  for (const q of stora) {
    const namn = q.url.split("/").pop();
    console.log(
      `  JS ${namn} · transfer ${(q.transferSize / 1024).toFixed(1)} K · start ${Math.round(q.networkRequestTime)} ms · slut ${Math.round(q.networkEndTime)} ms`,
    );
  }

  // Long tasks
  const lt = aud["long-tasks"]?.details?.items ?? [];
  const chatLt = lt.filter((t) => t.url && /chat|mentor/i.test(t.url));
  console.log(`  long-tasks totalt ${lt.length} · med chat-URL ${chatLt.length} (${chatLt.reduce((s, t) => s + t.duration, 0).toFixed(0)} ms)`);

  // Bootup per URL
  const bu = (aud["bootup-time"]?.details?.items ?? []).filter((x) => /chat|widget/i.test(x.url));
  for (const b of bu) console.log(`  bootup ${b.url.split("/").pop()}: scripting ${b.scripting} ms`);
}
