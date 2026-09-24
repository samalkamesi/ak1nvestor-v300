#!/usr/bin/env node
/**
 * RAPPORTAKADEMIN — KONTRAKTSSVIT (v169, kunduppdragets gröna sviter).
 *
 * Mäter det som är maskinellt möjligt utan autentiserat konto (testelev-
 * e2e är kvar som frivillig fördjupning enligt rond 131) — på PROD-APPEN
 * (localhost:3000 bär Next-processens env, loopback-whitelistad som i
 * gränssnittsvakten). Fil-skrivande rapport (skal-kvoten: stdout kan
 * förloras); stdout bär endast sammanfattningen.
 *
 * Kontrakt (fabrikens E39-kö + LAGBESLUTets grindar):
 *   A. GET  /api/rapportakademin/pass — gäst: 200 + kod "inloggning" och
 *      kroppen UTAN rattSvar/tolerans/expertlasning (passSkal-stripping).
 *   B. POST /api/rapportakademin/pass — gäst: 401, ingen expert i kroppen
 *      (bedöm-först-grinden: mutationen avvisar FÖRE exponering).
 *   C. POST /api/rapportakademin — gäst: 401 (elev-ytans auth-grind).
 *   D. GET  /api/cron/rapportakademin-gallring — antingen 401 (CRON_SECRET
 *      satt = skyddet lever) eller 200 med ok/gallrade/raderadeRader/
 *      felAntal (drivaren LEVER; körs två gånger — idempotens mäts).
 *   E. /rapportakademin — 200 och SSR-HTML utan facit-nycklar (publikt skal).
 *   F. Driftsbevis i källträdet: pumpor-daemonens ra-gallring-rad finns.
 */
import { writeFileSync, readFileSync } from "node:fs";

const BAS = "http://localhost:3000";
const ROT = new URL("..", import.meta.url).pathname; // repo-roten
const ut = [];
let pass = 0;
let fel = 0;

function rapport(namn, ok, detalj) {
  if (ok) { pass++; ut.push(`PASS ${namn} — ${detalj}`); }
  else { fel++; ut.push(`FEL ${namn} — ${detalj}`); }
}

async function hamta(url, init, tak) {
  const r = await fetch(url, { signal: AbortSignal.timeout(tak ?? 15000), ...init });
  const text = await r.text();
  return { status: r.status, text };
}

// ── A: GET pass-skalet som gäst ──────────────────────────────────────────────
try {
  const r = await hamta(`${BAS}/api/rapportakademin/pass?slug=abb-ar-2025`);
  const lacker = ["rattSvar", "expertlasning", "tolerans"].filter((k) => r.text.includes(k));
  rapport(
    "A GET pass (gäst)",
    r.status === 200 && r.text.includes("inloggning") && lacker.length === 0,
    `HTTP ${r.status} · kod-inloggning=${r.text.includes("inloggning")} · läckta nycklar: ${lacker.length ? lacker.join(",") : "0"}`,
  );
} catch (e) { rapport("A GET pass (gäst)", false, "fetch-fel: " + e.message); }

// ── B: POST bedömning som gäst ───────────────────────────────────────────────
try {
  const r = await hamta(`${BAS}/api/rapportakademin/pass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug: "abb-ar-2025", sektionIndex: 0, elevensSvar: 4.1 }),
  });
  rapport(
    "B POST bedömning (gäst)",
    r.status === 401 && !r.text.includes("expertlasning"),
    `HTTP ${r.status} · expert i kropp: ${r.text.includes("expertlasning")}`,
  );
} catch (e) { rapport("B POST bedömning (gäst)", false, "fetch-fel: " + e.message); }

// ── C: POST elev-ytan som gäst ───────────────────────────────────────────────
try {
  const r = await hamta(`${BAS}/api/rapportakademin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handling: "export" }),
  });
  rapport("C POST elev-yta (gäst)", r.status === 401, `HTTP ${r.status}`);
} catch (e) { rapport("C POST elev-yta (gäst)", false, "fetch-fel: " + e.message); }

// ── D: gallringsdrivaren (två körningar — idempotens) ────────────────────────
try {
  const r1 = await hamta(`${BAS}/api/cron/rapportakademin-gallring`, undefined, 60000);
  if (r1.status === 401) {
    rapport("D gallringsrutt", true, "HTTP 401 — CRON_SECRET satt, skyddet lever (drivarens körning sker via daemonens kanal)");
  } else if (r1.status === 200) {
    const j = JSON.parse(r1.text);
    const formOk = typeof j.gallrade === "number" && typeof j.raderadeRader === "number" && typeof j.felAntal === "number";
    const r2 = await hamta(`${BAS}/api/cron/rapportakademin-gallring`, undefined, 60000);
    const j2 = JSON.parse(r2.text);
    const idempotent = j2.felAntal === 0;
    rapport(
      "D gallringsrutt",
      formOk && j.felAntal === 0 && idempotent,
      `körning1 gallrade=${j.gallrade} raderade=${j.raderadeRader} fel=${j.felAntal} · körning2 fel=${j2.felAntal} (idempotent) · kanoniskt svar: ${formOk}`,
    );
  } else {
    rapport("D gallringsrutt", false, `oväntad HTTP ${r1.status}: ${r1.text.slice(0, 120)}`);
  }
} catch (e) { rapport("D gallringsrutt", false, "fetch-fel: " + e.message); }

// ── E: den publika sidan ─────────────────────────────────────────────────────
try {
  const r = await hamta(`${BAS}/rapportakademin`);
  const lacker = ["rattSvar", "expertlasning"].filter((k) => r.text.includes(k));
  rapport("E sidan /rapportakademin", r.status === 200 && lacker.length === 0, `HTTP ${r.status} · facit-nycklar i SSR: ${lacker.length ? lacker.join(",") : "0"}`);
} catch (e) { rapport("E sidan /rapportakademin", false, "fetch-fel: " + e.message); }

// ── F: driftsbevis i källträdet ─────────────────────────────────────────────
try {
  const daemon = readFileSync(`${ROT}verktyg/pumpor-daemon.mjs`, "utf8");
  rapport("F daemon-rad ra-gallring", daemon.includes("ra-gallring") && daemon.includes("rapportakademin-gallring"), `ra-gallring-rad: ${daemon.includes("ra-gallring")} · cron-url: ${daemon.includes("rapportakademin-gallring")}`);
} catch (e) { rapport("F daemon-rad ra-gallring", false, "läs-fel: " + e.message); }

ut.push(`TOTALT: ${pass} PASS · ${fel} FEL`);
writeFileSync("/tmp/v169-svit.txt", ut.join("\n") + "\n");
console.log(`KLAR ${pass}/${pass + fel}`);
if (fel > 0) process.exitCode = 1;
