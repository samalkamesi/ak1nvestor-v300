#!/usr/bin/env node
/**
 * o118 steg 2 — nätverksrequester + DOM + longtask-tidslinje ur samma rapporter.
 * Frågor:
 *  a) Hämtar /en/blogg NÅGOT som /ar/blogg inte gör (api/fetch i hydratisering)?
 *  b) DOM-storlek (dom-size-råstruktur kan variera mellan LH-versioner)?
 *  c) Ligger Unattributable-tasks före/efter FCP (= hydratisering vs load)?
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KAT = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse");
const PAR = [
  ["en_blogg-A", "en_blogg-s7u2o110-efterA.json"],
  ["en_blogg-B", "en_blogg-s7u2o110-efterB.json"],
  ["ar_blogg-A", "ar_blogg-s7u2o110-efterA.json"],
  ["ar_blogg-B", "ar_blogg-s7u2o110-efterB.json"],
  ["blogg-sv-A", "blogg-s7u2o110-efterA.json"],
];

const ut = {};
for (const [etikett, fil] of PAR) {
  const r = JSON.parse(readFileSync(join(KAT, fil), "utf8"));
  const A = r.audits ?? {};
  const rad = { fcp: Math.round(A["first-contentful-paint"]?.numericValue ?? 0) };

  // a) nätverksrequester (endast dokument/api/xhr/fetch — inte statiska assets)
  const reqs = A["network-requests"]?.details?.items ?? [];
  rad.nett = reqs
    .filter((q) => ["Document", "XHR", "Fetch", "Other", "EventSource", "Manifest", "WebSocket"].includes(q.resourceType))
    .map((q) => ({ typ: q.resourceType, url: q.url.replace(/^https?:\/\/[^/]+/, ""), status: q.statusCode,Overfört: q.transferSize, tid: Math.round(q.networkEndTime - q.networkRequestTime) }));

  // b) dom-size — råstrukturen
  const ds = A["dom-size"];
  rad.domNumeric = ds?.numericValue ?? null;
  rad.domItems = ds?.details?.items ?? null;
  rad.domStats = ds?.details?.overallSavingsNumNodes ?? null;

  // c) longtasks med start relativt FCP
  rad.longTasks = (A["long-tasks"]?.details?.items ?? []).map((t) => ({
    url: (t.url ?? "Unattributable").split("/").pop().slice(0, 40),
    start: Math.round(t.startTime),
    relFcp: Math.round(t.startTime - rad.fcp),
    dur: Math.round(t.duration),
  })).sort((a, b) => a.start - b.start);

  // extra: network-rtt/server, antal totala requester, js-byte
  rad.antalReqs = reqs.length;
  rad.jsOverford = reqs.filter((q) => q.resourceType === "Script").reduce((s, q) => s + q.transferSize, 0);
  ut[etikett] = rad;
}

for (const [k] of PAR) {
  const r = ut[k];
  console.log(`\n=== ${k} (FCP ${r.fcp} ms, ${r.antalReqs} reqs, JS ${Math.round(r.jsOverford / 1024)} KiB) ===`);
  console.log("dokument/xhr/fetch:", r.nett.map((q) => `${q.typ}:${q.url}(${q.status},${q.Overfört}B,${q.tid}ms)`).join(" · ") || "(inga)");
  console.log("dom-size numericValue:", r.domNumeric, r.domItems ? `items[0]=${JSON.stringify(r.domItems[0]).slice(0, 160)}` : "items saknas");
  console.log("longtasks (start | relFCP | dur | url):");
  for (const t of r.longTasks) console.log(`  ${String(t.start).padStart(6)} | ${String(t.relFcp).padStart(6)} | ${String(t.dur).padStart(5)} | ${t.url}`);
}

writeFileSync(join(KAT, "o118-djupanalys-steg2.json"), JSON.stringify(ut, null, 1));
console.log("\nSkriven: o118-djupanalys-steg2.json");
