#!/usr/bin/env node
// _s7u1o71-sond — strukturplan ur Lighthouse-rapport (o71 FÖRE): JS-chunk-
// tidslinje, ScriptEval-fördelning, unused-js, FCP. Lastokänsligt urval.
import { readFileSync } from "node:fs";

const fil = process.argv[2] || "data/forskning/OPTIMERING/lighthouse/start-s7u1o71-fore.json";
const r = JSON.parse(readFileSync(fil, "utf8"));
const a = r.audits;

const fcp = a["first-contentful-paint"]?.displayValue ?? "?";
const tbt = a["total-blocking-time"]?.displayValue ?? "?";
console.log(`FCP ${fcp} · TBT ${tbt} · poäng ${r.categories.performance.score * 100}`);

// Nätverkets JS-chunkar i laddningsordning med start/slut/transfer
const reqs = (a["network-requests"]?.details?.items ?? []).filter(
  (n) => n.resourceType === "Script",
);
console.log(`\nScript-requests: ${reqs.length} · transfer ${(reqs.reduce((s, n) => s + (n.transferSize || 0), 0) / 1024).toFixed(0)} KiB`);
const sorterade = [...reqs].sort((x, y) => (x.networkRequestTime ?? 0) - (y.networkRequestTime ?? 0));
for (const n of sorterade) {
  const url = String(n.url);
  const chunk = url.split("/").pop()?.slice(0, 28) ?? url.slice(0, 40);
  console.log(
    `  start ${(n.networkRequestTime ?? 0).toFixed(0).padStart(5)} ms · slut ${(n.networkEndTime ?? 0).toFixed(0).padStart(5)} ms · ${(n.transferSize / 1024).toFixed(1).padStart(6)} KiB · ${chunk}`,
  );
}

// Script Evaluation + långa tasks från main-thread
const mt = a["mainthread-work-breakdown"]?.details?.items ?? [];
for (const m of mt.slice(0, 6)) {
  console.log(`  MT ${m.groupLabel}: ${(m.duration).toFixed(0)} ms`);
}
const lt = a["long-tasks"]?.details?.items ?? [];
console.log(`\nLånga tasks: ${lt.length} · totalt ${(lt.reduce((s, t) => s + t.duration, 0)).toFixed(0)} ms`);
for (const t of lt.slice(0, 10)) {
  console.log(`  start ${(t.startTime).toFixed(0).padStart(5)} ms · ${(t.duration).toFixed(0).padStart(5)} ms · ${String(t.url ?? "").split("/").pop()?.slice(0, 30) ?? "(main)"}`);
}

// unused-javascript med chunkdetalj
const uj = a["unused-javascript"]?.details?.items ?? [];
console.log(`\nUnused-JS: ${uj.length} poster`);
for (const u of uj.slice(0, 8)) {
  console.log(`  ${u.wastedPercent?.toFixed(0) ?? "?"}% oanvänt · ${(u.wastedBytes / 1024).toFixed(1)} KiB spill · ${String(u.url).split("/").pop()?.slice(0, 34)}`);
}
