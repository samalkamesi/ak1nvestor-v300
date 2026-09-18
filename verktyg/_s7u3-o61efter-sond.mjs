#!/usr/bin/env node
// _s7u3-o61efter-sond.mjs — o61-EFTER: mekanisk verifiering av palett-chunkfamiljen.
// Läser en Lighthouse-rapport, listar ALLA _next-JS-requests med timing och
// signaturgrep:ar varje chunks INNEHÅLL via localhost (o61 §7: identifiera efter-
// följaren via signatur, aldrig via hash). Signaturer:
//   "ak1a:oppna-sok"  — paletten/vakten (event-namn lever i minifierad kod)
//   "registreraBesok" — besöksregistreringen (palett-familjen)
//   "requestIdleCallback" + 8e3/8000 — vaktens tvåstegs-basfall (o61-kuren)
import { readFileSync } from "node:fs";

const fil = process.argv[2];
const r = JSON.parse(readFileSync(fil, "utf8"));
const reqs = (r.audits?.["network-requests"]?.details?.items ?? [])
  .filter((q) => q.url.includes("/_next/") && q.url.endsWith(".js"))
  .map((q) => ({
    url: q.url,
    namn: q.url.split("/").slice(-1)[0],
    start: Math.round(q.networkRequestTime ?? 0),
    transfer: q.transferSize ?? 0,
  }))
  .sort((a, b) => a.start - b.start);

console.log(`${fil.split("/").slice(-1)[1] ?? fil} — ${reqs.length} _next-JS-requests;`);
const signaturer = ["ak1a:oppna-sok", "registreraBesok", "sokIIndex", "requestIdleCallback", "8e3", ",8000", ":8000"];
const trafar = [];
for (const q of reqs) {
  let body = "";
  try {
    body = readFileSync(`/tmp/o61chunk-${q.namn}`, "utf8");
  } catch {
    try {
      const res = await fetch(q.url);
      body = await res.text();
      // cache:a lokalt för nästa sondkörning (inget repo-spår)
      const { writeFileSync } = await import("node:fs");
      writeFileSync(`/tmp/o61chunk-${q.namn}`, body);
    } catch (e) {
      console.log(`  HÄMTFEL ${q.namn}: ${String(e).slice(0, 80)}`);
      continue;
    }
  }
  const hits = signaturer.filter((s) => body.includes(s));
  const m = `${String(q.start).padStart(5)} ms ${String(q.transfer).padStart(6)} B ${q.namn}`;
  if (hits.length) {
    trafar.push({ ...q, hits });
    console.log(`  ${m}  ← ${hits.join(" · ")}`);
  } else if (q.transfer > 8000 && q.transfer < 33000) {
    console.log(`  ${m}  (8–33 K, ingen signatur)`);
  }
}
console.log(`\nSignaturträffar: ${trafar.length} st`);
for (const t of trafar) {
  console.log(`  ${t.namn} @ ${t.start} ms · ${t.transfer} B · [${t.hits.join(", ")}]`);
}
