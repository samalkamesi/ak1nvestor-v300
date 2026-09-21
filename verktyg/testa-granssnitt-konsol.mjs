#!/usr/bin/env node
// TEST: gränsnittsvakten​s delresurs-deployklassificerare (s8-u1 omgång 5,
// 2026-09-16) — ren logik, ingen IO: varje scenario mappas mot ett bevisat
// fall. Primärkällan är data/vakten/granssnitt-2026-09-16T1003.json —
// strängarna T1–T3 är ORDAGRANTA ur den falska rapporten (31 chunk-500
// under prod-synkens OOM-dödade byggförsök 10:02:39 → 30 skenkontraster
// i en "ok"-rapport). T4 = våg 142:s dokumenterade 2026-09-13-fall.
// o148 (s8-u3, 2026-09-21): blocket A*–N* testar arForvantadAuth401 —
// autentiseringsgrindens korrekta 401 (bevis: granssnitt-2026-09-21T113043
// .json, 8 av 28 fynd = /studio:s anonyma poll på /api/studio/stream).
// Körs: node verktyg/testa-granssnitt-konsol.mjs → "PASS n/n" och exit 0.
import { konsolFelIndikerarDeployStorning, arForvantadAuth401 } from "./granssnitt-konsol.mjs";

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

// ── o148: förväntade AUTH-401 (text, url-form — vaktkonsolens gränssnitt) ──
// A1 = ORDAGRANT ur granssnitt-2026-09-21T113043.json (/studio light 390).
krav(
  "A1 studio-stream-401 localhost, URL i text-prefix (11:30Z ordagrant) → förväntad",
  arForvantadAuth401(
    "[http://localhost:3000/api/studio/stream] Failed to load resource: the server responded with a status of 401 (Unauthorized)",
    ""
  ) === true
);
krav(
  "A2 studio-stream-401 localhost, url-parameter → förväntad",
  arForvantadAuth401(
    "Failed to load resource: the server responded with a status of 401 (Unauthorized)",
    "http://localhost:3000/api/studio/stream"
  ) === true
);
krav(
  "A3 studio-stream-401 prod-domän → förväntad",
  arForvantadAuth401(
    "Failed to load resource: the server responded with a status of 401 (Unauthorized)",
    "https://lab.ak1nvestor.com/api/studio/stream"
  ) === true
);
krav(
  "A4 query-suffix (poll-parametrar) → förväntad",
  arForvantadAuth401(
    "Failed to load resource: the server responded with a status of 401 (Unauthorized)",
    "http://localhost:3000/api/studio/stream?senaste=1"
  ) === true
);

// ── o148 NEGATIV: smalhet — allt annat förblir larmande fel ────────────────
krav(
  "AN1 401 på ANNAN slutpunkt → INTE förväntad (äkta fel)",
  arForvantadAuth401(
    "Failed to load resource: the server responded with a status of 401 (Unauthorized)",
    "http://localhost:3000/api/nagon-annan"
  ) === false
);
krav(
  "AN2 404 på studio-stream → INTE förväntad (endast status 401)",
  arForvantadAuth401(
    "Failed to load resource: the server responded with a status of 404 (Not Found)",
    "http://localhost:3000/api/studio/stream"
  ) === false
);
krav(
  "AN3 500 på studio-stream → INTE förväntad (serverfel larmar)",
  arForvantadAuth401(
    "Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
    "http://localhost:3000/api/studio/stream"
  ) === false
);
krav(
  "AN4 401-text UTAN känd slutpunkt → INTE förväntad",
  arForvantadAuth401(
    "Failed to load resource: the server responded with a status of 401 (Unauthorized)",
    ""
  ) === false
);
krav(
  "AN5 pageerror med slutpektens namn i texten men utan resource-rad → INTE förväntad",
  arForvantadAuth401("Uncaught TypeError vid /api/studio/stream-hantering", "") === false
);
krav("AN6 null/undefined → false", arForvantadAuth401(null, undefined) === false && arForvantadAuth401() === false);

// ── Resultat ────────────────────────────────────────────────────────────────
console.log(`\n${fel.length === 0 ? "PASS" : "FAIL"} ${pass}/${pass + fel.length} — granssnitt-konsol (delresurs-deploysignaturer + förväntade auth-401)`);
if (fel.length) {
  for (const f of fel) console.error(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
