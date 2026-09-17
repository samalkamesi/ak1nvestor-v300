#!/usr/bin/env node
// TEST: gränsnittsvakten​s delresurs-deployklassificerare (s8-u1 omgång 5,
// 2026-09-16) — ren logik, ingen IO: varje scenario mappas mot ett bevisat
// fall. Primärkällan är data/vakten/granssnitt-2026-09-16T1003.json —
// strängarna T1–T3 är ORDAGRANTA ur den falska rapporten (31 chunk-500
// under prod-synkens OOM-dödade byggförsök 10:02:39 → 30 skenkontraster
// i en "ok"-rapport). T4 = våg 142:s dokumenterade 2026-09-13-fall.
// Körs: node verktyg/testa-granssnitt-konsol.mjs → "PASS n/n" och exit 0.
import { konsolFelIndikerarDeployStorning } from "./granssnitt-konsol.mjs";

let pass = 0;
const fel = [];
function krav(namn, villkor) {
  if (villkor) pass++;
  else fel.push(namn);
}

// ── FALLET SELVÄ (10:03-rapportens ordagranna strängar) ──────────────────
krav(
  "T1 CSS-chunk-500 (10:03 ordagrant) → signatur",
  konsolFelIndikerarDeployStorning([
    "[http://localhost:3000/_next/static/chunks/0dkvqmwqb0ena.css] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
  ]) === true
);
krav(
  "T2 JS-chunk-500 (10:03 ordagrant) → signatur",
  konsolFelIndikerarDeployStorning([
    "[http://localhost:3000/_next/static/chunks/3s6nzrbk-8mnv.js] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
  ]) === true
);
krav(
  "T3 woff-media-500 (10:03 ordagrant) → signatur",
  konsolFelIndikerarDeployStorning([
    "[http://localhost:3000/_next/static/media/68d403cf9f2c68c5-s.p.20at88_q9f_kt.woff] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
  ]) === true
);

// ── 2026-09-13-fallet (våg 142:s dokumentation): chunk-404 vid
//    hash-rotation — gammal chunk dör när nytt byggs chunks publicerats ──
krav(
  "T4 _next/static-chunk-404 → signatur (2026-09-13-fallet)",
  konsolFelIndikerarDeployStorning([
    "[http://localhost:3000/_next/static/chunks/webpack-8f的老hash.js] Failed to load resource: the server responded with a status of 404 (Not Found)",
  ]) === true
);

// ── pm2-omstartens fönster: delresurs-anslutningsbrott ───────────────────
krav(
  "T5 net::ERR_CONNECTION_REFUSED på delresurs → signatur",
  konsolFelIndikerarDeployStorning([
    "[http://localhost:3000/_next/static/chunks/main-app.js] Failed to load resource: net::ERR_CONNECTION_REFUSED",
  ]) === true
);

// ── NEGATIV: äkta fel som SKA larma (frisk bas i sweepet gör det) ────────
krav(
  "N1 bild-404 EJ i _next/static → INTE signatur (äkta innehållsfel)",
  konsolFelIndikerarDeployStorning([
    "[https://lab.ak1nvestor.com/bilder/saknad-illustration.png] Failed to load resource: the server responded with a status of 404 (Not Found)",
  ]) === false
);
krav(
  "N2 favicon-404 → INTE signatur (filtreras redan upstream)",
  konsolFelIndikerarDeployStorning([
    "[http://localhost:3000/favicon.ico] Failed to load resource: the server responded with a status of 404 (Not Found)",
  ]) === false
);
krav(
  "N3 pageerror (JS-undantag) → INTE signatur",
  konsolFelIndikerarDeployStorning(["Uncaught TypeError: Cannot read properties of null (reading 'map')"]) === false
);
krav(
  "N4 429 → INTE signatur (egen throttle, våg 105)",
  konsolFelIndikerarDeployStorning(["Failed to load resource: the server responded with a status of 429 (Too Many Requests)"]) === false
);
krav(
  "N5 _next/icke-static-404 (t.ex. /_next/image) → INTE signatur",
  konsolFelIndikerarDeployStorning([
    "[http://localhost:3000/_next/image?url=%2Ffoto.jpg] Failed to load resource: the server responded with a status of 404 (Not Found)",
  ]) === false
);

// ── Robusthet + some-semantik (10:03-fallet: flera signaturer bland 31) ──
krav("R1 tom lista → false", konsolFelIndikerarDeployStorning([]) === false);
krav("R2 null/undefined-input → false", konsolFelIndikerarDeployStorning(null) === false && konsolFelIndikerarDeployStorning(undefined) === false);
krav(
  "R3 ONE signatur bland många oskyldiga → true (some-semantik)",
  konsolFelIndikerarDeployStorning([
    "Uncaught ReferenceError: hydration mismatch",
    "[http://localhost:3000/favicon.ico] Failed to load resource: the server responded with a status of 404 (Not Found)",
    "[http://localhost:3000/_next/static/chunks/2fvnot_pbumt6.css] Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
  ]) === true
);
krav(
  "R4 502/503-variant (5xx-klassens bredd) → true",
  konsolFelIndikerarDeployStorning([
    "[http://localhost:3000/_next/static/chunks/x.css] Failed to load resource: the server responded with a status of 503 (Service Unavailable)",
  ]) === true
);

// ── Resultat ────────────────────────────────────────────────────────────────
console.log(`\n${fel.length === 0 ? "PASS" : "FAIL"} ${pass}/${pass + fel.length} — granssnitt-konsol (delresurs-deploysignaturer)`);
if (fel.length) {
  for (const f of fel) console.error(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
