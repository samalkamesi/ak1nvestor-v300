#!/usr/bin/env node
// TEST: statisk-sondens rena logik (s8-u1 omgång 5, 2026-09-16) — ingen IO.
// Scenarierna mappas mot incidenten 2026-09-16 10:02–10:2x: HTML-referenser
// ORDAGRANTA ur prod-/kurser-HTML:n under incidenten (chunks som 500:ade),
// plus grön-fallet och sida-nere-fallet.
// Körs: node verktyg/testa-statisk-sond.mjs → "PASS n/n" och exit 0.
import { extraheraStatiskaRefs, bedom } from "./statisk-sond.mjs";

let pass = 0;
const fel = [];
function krav(namn, villkor) {
  if (villkor) pass++;
  else fel.push(namn);
}

// ── extraheraStatiskaRefs ────────────────────────────────────────────────────
const INCIDENT_HTML = `<!DOCTYPE html><html><head>
<link rel="stylesheet" href="/_next/static/chunks/0dkvqmwqb0ena.css" data-precedence="next">
<link rel="stylesheet" href="/_next/static/chunks/2fvnot_pbumt6.css" data-precedence="next">
<link rel="preload" as="font" href="/_next/static/media/68d403cf9f2c68c5-s.p.20at88_q9f_kt.woff" crossorigin>
</head><body>
<script src="/_next/static/chunks/webpack-abc.js" async=""></script>
<script src="/_next/static/chunks/main-app-xyz.js" async=""></script>
<a href="/kurser">Kurser</a>
<img src="/bilder/hero.png">
</body></html>`;

krav(
  "E1 extraherar link+script+font-refs ur HTML (incidentens mönster)",
  JSON.stringify(extraheraStatiskaRefs(INCIDENT_HTML)) ===
    JSON.stringify([
      "/_next/static/chunks/0dkvqmwqb0ena.css",
      "/_next/static/chunks/2fvnot_pbumt6.css",
      "/_next/static/media/68d403cf9f2c68c5-s.p.20at88_q9f_kt.woff",
      "/_next/static/chunks/webpack-abc.js",
      "/_next/static/chunks/main-app-xyz.js",
    ])
);
krav("E2 utesluter icke-_next-resurser (a/img)", !extraheraStatiskaRefs(INCIDENT_HTML).some((r) => !r.includes("_next/static/")));
krav("E3 deduplicerar identiska refs", extraheraStatiskaRefs('<link href="/_next/static/chunks/x.css"><link href="/_next/static/chunks/x.css">').length === 1);
krav("E4 tom/null-HTML → tom lista", extraheraStatiskaRefs("").length === 0 && extraheraStatiskaRefs(null).length === 0);

// ── bedom ───────────────────────────────────────────────────────────────────
krav(
  "B1 INCIDENTFALLET: HTML 200 + chunk-500 → trasig-bygg",
  bedom({
    sidaStatus: 200,
    tillgangar: [
      { url: "/_next/static/chunks/0dkvqmwqb0ena.css", status: 500 },
      { url: "/_next/static/chunks/2fvnot_pbumt6.css", status: 500 },
    ],
  }).status === "trasig-bygg"
);
krav(
  "B2 INCIDENTFALLET räknar trasiga: 2 av 2",
  bedom({
    sidaStatus: 200,
    tillgangar: [
      { url: "/a.css", status: 500 },
      { url: "/b.css", status: 500 },
    ],
  }).trasiga.length === 2
);
krav(
  "B3 helgods: sidan + alla tillgångar 200 → gron",
  bedom({ sidaStatus: 200, tillgangar: [{ url: "/a.css", status: 200 }, { url: "/b.js", status: 200 }] }).status === "gron"
);
krav(
  "B4 sida-nere (502): tillgångar omöjliga → sida-nere, ej trasig-bygg",
  bedom({ sidaStatus: 502, tillgangar: [] }).status === "sida-nere"
);
krav(
  "B5 hämtningsfall (status 0) räknas som trasig när sidan lever",
  bedom({ sidaStatus: 200, tillgangar: [{ url: "/a.css", status: 0 }] }).status === "trasig-bygg"
);
krav(
  "B6 404-chunk (hash-rotation) → trasig-bygg",
  bedom({ sidaStatus: 200, tillgangar: [{ url: "/_next/static/chunks/gammal.js", status: 404 }] }).status === "trasig-bygg"
);

// ── Resultat ────────────────────────────────────────────────────────────────
console.log(`\n${fel.length === 0 ? "PASS" : "FAIL"} ${pass}/${pass + fel.length} — statisk-sond (bygg-tillgångars kontrakt)`);
if (fel.length) {
  for (const f of fel) console.error(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
