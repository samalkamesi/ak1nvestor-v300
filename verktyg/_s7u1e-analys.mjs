#!/usr/bin/env node
// _s7u1e-analys.mjs — s7-u1 (auto-s7-1789640127873): EFTER-analys av o41:s
// slug-prefetch-kur. Jämför FÖRE (blogg-gap-efter*, 04:10Z-bygget 0h_7ANLO —
// o37-kur live, o41-kur EJ) mot EFTER (slugprefetch-efter*, bygge 2rW0uv
// 11:39:50 — o41-kur 8fa5f0ce live). Strukturbevis = _rsc-förfrågningar per
// pathname i initial load (lastokänsligt); CPU-tal redovisas med
// s6-drift-reserven (o38 §4: register 390→396 mellan byggena).
import { readFileSync } from "node:fs";

const KAT = "data/forskning/OPTIMERING/lighthouse";
const PAR = [
  { sida: "SV /blogg", fore: "blogg-blogg-gap-efter.json", efter: "blogg-slugprefetch-efter-sv.json" },
  { sida: "EN /en/blogg", fore: "en_blogg-blogg-gap-efter.json", efter: "en_blogg-slugprefetch-efter-en.json" },
];

function parsed(fil) {
  const r = JSON.parse(readFileSync(`${KAT}/${fil}`, "utf8"));
  const reqs = r.audits?.["network-requests"]?.details?.items ?? [];
  let totalt = 0, antal = 0;
  const rsc = new Map();
  for (const q of reqs) {
    if (q.transferSize == null) continue;
    totalt += q.transferSize;
    antal++;
    const u = new URL(q.url);
    if (u.searchParams.get("_rsc") !== null) {
      const k = u.pathname;
      if (!rsc.has(k)) rsc.set(k, []);
      rsc.get(k).push({
        byte: q.transferSize,
        start: Math.round(q.networkRequestTime),
        status: q.statusCode,
        cacheBust: u.searchParams.get("x-nextjs-cache-bust") ? "xb" : "",
      });
    }
  }
  const a = (k) => r.audits?.[k];
  const num = (k) => (a(k)?.numericValue != null ? Math.round(a(k).numericValue) : null);
  return {
    fil,
    requests: antal,
    kib: Math.round(totalt / 1024),
    rsc,
    P: r.categories?.performance?.score,
    LCP: num("largest-contentful-paint"),
    TBT: num("total-blocking-time"),
    FCP: num("first-contentful-paint"),
    CLS: a("cumulative-layout-shift")?.numericValue,
    TTI: num("interactive"),
    totalByteWeightRad: a("total-byte-weight")?.displayValue ?? "",
  };
}

// En kort-slug = artikel-URL under /blogg/ (ej /, /logga-in, /kurser/*)
function slugRsc(m) {
  const ut = [];
  for (const [pathname, list] of m.rsc) {
    if (/^\/(en\/|ar\/)?blogg\/.+/.test(pathname)) ut.push({ pathname, list });
  }
  return ut;
}

for (const { sida, fore, efter } of PAR) {
  const F = parsed(fore);
  const E = parsed(efter);
  console.log(`\n=== ${sida} ===`);
  console.log(`FÖRE  ${fore}: requests=${F.requests} vikt=${F.kib} KiB · P${Math.round((F.P ?? 0) * 100)} · FCP ${F.FCP} · LCP ${F.LCP} · TBT ${F.TBT} · CLS ${F.CLS} · TTI ${F.TTI}`);
  console.log(`EFTER ${efter}: requests=${E.requests} vikt=${E.kib} KiB · P${Math.round((E.P ?? 0) * 100)} · FCP ${E.FCP} · LCP ${E.LCP} · TBT ${E.TBT} · CLS ${E.CLS} · TTI ${E.TTI}`);
  console.log(`delta: requests ${E.requests - F.requests >= 0 ? "+" : ""}${E.requests - F.requests} · vikt ${E.kib - F.kib >= 0 ? "+" : ""}${E.kib - F.kib} KiB`);

  const fSlugs = slugRsc(F), eSlugs = slugRsc(E);
  const fTot = fSlugs.reduce((s, x) => s + x.list.reduce((q, i) => q + i.byte, 0), 0);
  const eTot = eSlugs.reduce((s, x) => s + x.list.reduce((q, i) => q + i.byte, 0), 0);
  console.log(`slug-_rsc FÖRE: ${fSlugs.map((x) => `${x.pathname}×${x.list.length}`).join(", ") || "0"} = ${(fTot / 1024).toFixed(1)} KiB`);
  console.log(`slug-_rsc EFTER: ${eSlugs.map((x) => `${x.pathname}×${x.list.length}`).join(", ") || "0"} = ${(eTot / 1024).toFixed(1)} KiB`);

  console.log(`övrig _rsc FÖRE: ${[...F.rsc.entries()].filter(([p]) => !/^\/(en\/|ar\/)?blogg\/.+/.test(p)).map(([p, l]) => `${p}×${l.length} (${l.reduce((s, i) => s + i.byte, 0)}B)`).join(", ")}`);
  console.log(`övrig _rsc EFTER: ${[...E.rsc.entries()].filter(([p]) => !/^\/(en\/|ar\/)?blogg\/.+/.test(p)).map(([p, l]) => `${p}×${l.length} (${l.reduce((s, i) => s + i.byte, 0)}B)`).join(", ")}`);
}
