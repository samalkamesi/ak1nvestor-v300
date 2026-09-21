#!/usr/bin/env node
// Svit för verktyg/pumpor-tick-matning.mjs (o140, s8-vakt).
// =====================================================================================
// Kontrakt (mot o140): modulen är daemonens tick-svält-instrument —
//   1. DRIFT mäts start-till-start minus intervall; första tick = null.
//   2. Event-loop-histogrammet läses + RESETAS varje tick (färskt fönster).
//   3. Träffas tröskel (drift eller loop-max) loggas EN maskinläsbar
//      TICK-SVÄLT-rad med resurskontext — raden får INTE matcha rop-hälsans
//      rop-/startmönster (dess parsning är helig).
//   4. tick() kastar ALDRIG — varken från histogram, resursläsning eller
//      loggning (daemonen får aldrig dö av sitt instrument).
// Alla beroenden overridas (fake klocka, fake histogram, fake resurs) —
// sviten rör aldrig daemonen, pm2 eller /proc (utom O: äkta lasResurs-sond).
//
// Körs: node verktyg/testa-pumpor-tick.mjs  (exit 0 = alla PASS)

import { byggTickMatning, lasResurs, TRÖSKEL_DRIFT_MS, TRÖSKEL_LOOP_MS } from "./pumpor-tick-matning.mjs";

let pass = 0;
let fail = 0;
const resultat = [];
function kontroll(namn, ok, detalj = "") {
  if (ok) { pass++; resultat.push(`PASS ${namn}`); }
  else { fail++; resultat.push(`FAIL ${namn}${detalj ? " — " + detalj : ""}`); }
}

/** Fake-histogramfabrik: styrbara max/mean per läsning, reset-räknare. */
function fakeHistogramFabrik() {
  const state = { max: 0, mean: 0, resets: 0, enables: 0 };
  state.obj = {
    enable() { state.enables++; },
    reset() { state.resets++; },
    get max() { return state.max; },
    get mean() { return state.mean; },
  };
  const fabrik = () => state.obj;
  fabrik.state = state;
  return fabrik;
}

/** Bygg en mätning med styrd klocka + insamlade loggrader. */
function byggMätning({ tider, hist, resurs, tröskelDriftMs, tröskelLoopMs, loggaKastar }) {
  const rader = [];
  let i = 0;
  const m = byggTickMatning({
    logga: loggaKastar ? () => { throw new Error("logga-kanal död"); } : (r) => rader.push(r),
    nu: () => tider[Math.min(i++, tider.length - 1)],
    lasResurs: resurs ?? (() => ({ memTillgangligMB: 1234, load1: 0.5, rssMB: 42 })),
    monitor: hist ?? fakeHistogramFabrik(),
    tröskelDriftMs,
    tröskelLoopMs,
  });
  return { m, rader };
}

const RAD_RE = /^TICK-SVÄLT (\{.*\})$/;
const ROP_RE = /▶ \S+/; // rop-hälsans ropmönster — får ALDRIG träffas
const START_RE = /PUMPOR-DAEMONEN.*startar/; // rop-hälsans startmönster — samma

// ── A: första ticken har ingen föregångare — drift null, ingen rad ──────────
{
  const { m, rader } = byggMätning({ tider: [0] });
  const r = m.tick();
  kontroll("A första tick: driftMs=null", r.driftMs === null, `driftMs=${r.driftMs}`);
  kontroll("A första tick: ingen rad", rader.length === 0 && r.loggad === false);
}

// ── B: normal drift (schemaligt + några ms) — ingen rad ─────────────────────
{
  const h = fakeHistogramFabrik();
  const { m, rader } = byggMätning({ tider: [0, 30_040, 60_020, 90_070], hist: h });
  m.tick();
  const r2 = m.tick();
  m.tick();
  const r4 = m.tick();
  kontroll("B normal drift: inga rader", rader.length === 0);
  kontroll("B driftvärden korrekta", r2.driftMs === 40 && r4.driftMs === 50, `r2=${r2.driftMs} r4=${r4.driftMs}`);
}

// ── C: drift över tröskel — EN rad, maskinläsbar, med resursfält ────────────
{
  const { m, rader } = byggMätning({ tider: [0, 30_050, 90_500] }); // drift 2 = 30 450 ms
  m.tick();
  m.tick();
  const r3 = m.tick();
  kontroll("C drift 30 450 ms loggad", r3.loggad === true && rader.length === 1, `rader=${JSON.stringify(rader)}`);
  const m2 = rader[0]?.match(RAD_RE);
  kontroll("C radformat TICK-SVÄLT {json}", Boolean(m2));
  if (m2) {
    const j = JSON.parse(m2[1]);
    kontroll("C fält: driftMs avrundat", j.driftMs === 30450, `driftMs=${j.driftMs}`);
    kontroll("C fält: loopvärden ns→ms", typeof j.loopMaxMs === "number" && typeof j.loopMedelMs === "number");
    kontroll("C fält: resurs med", j.memTillgangligMB === 1234 && j.load1 === 0.5 && j.rssMB === 42, JSON.stringify(j));
    kontroll("C raden bryter ej rop-hälsans mönster", !ROP_RE.test(rader[0]) && !START_RE.test(rader[0]));
  }
}

// ── D: loop-max över tröskel med drift under — rad (event-loop-signaturen) ──
{
  const h = fakeHistogramFabrik();
  const { m, rader } = byggMätning({ tider: [0, 30_010, 60_020], hist: h });
  m.tick();
  h.state.max = 1_500_000_000; // 1,5 s loop-blockering (ns)
  h.state.mean = 25_000_000; // 25 ms (ns)
  const r = m.tick(); // drift = 60_020 − 30_010 − 30_000 = 10 ms (under tröskeln)
  kontroll("D loop-max 1 500 ms → rad", r.loggad === true && rader.length === 1, `rader=${JSON.stringify(rader)}`);
  const m2 = rader[0]?.match(RAD_RE);
  if (m2) {
    const j = JSON.parse(m2[1]);
    kontroll("D loopMaxMs=1500 i raden", j.loopMaxMs === 1500, `loopMaxMs=${j.loopMaxMs}`);
    kontroll("D driftMs under tröskel med i raden", j.driftMs === 10, `driftMs=${j.driftMs}`);
  }
}

// ── E: båda över tröskel — EN rad (aldrig dubbel) ───────────────────────────
{
  const h = fakeHistogramFabrik();
  const { m, rader } = byggMätning({ tider: [0, 30_020, 63_000], hist: h });
  m.tick();
  h.state.max = 2_000_000_000;
  const r = m.tick(); // drift = 63_000 − 30_020 − 30_000 = 2 980 ms (över tröskeln)
  kontroll("E drift+loop över: exakt EN rad", r.loggad === true && rader.length === 1, `rader=${rader.length}`);
}

// ── F: histogrammet RESETAS varje tick — fönstret är alltid sedan förra ─────
{
  const h = fakeHistogramFabrik();
  const { m } = byggMätning({ tider: [0, 30_010, 60_010, 90_010], hist: h });
  m.tick(); m.tick(); m.tick();
  kontroll("F reset per tick (3 tick ⇒ 3 reset)", h.state.resets === 3, `resets=${h.state.resets}`);
  kontroll("F enable en gång vid konstruktion", h.state.enables === 1, `enables=${h.state.enables}`);
}

// ── G: lasResurs kastar ⇒ rad med resursFel, ALDRIG kast från tick ─────────
{
  const { m, rader } = byggMätning({
    tider: [0, 30_020, 90_000],
    resurs: () => { throw new Error("/proc borta"); },
  });
  m.tick();
  m.tick(); // drift 20 ms — under tröskeln
  let kast = null;
  let r = null;
  try { r = m.tick(); } catch (e) { kast = e; } // drift 29 980 ms — över
  kontroll("G resurs-kast fångat (tick kastar ej)", kast === null);
  kontroll("G rad loggad ändå", r?.loggad === true && rader.length === 1);
  const j = rader[0]?.match(RAD_RE) ? JSON.parse(rader[0].match(RAD_RE)[1]) : null;
  kontroll("G resursFel-fält i raden", j?.resursFel === "/proc borta", JSON.stringify(j));
}

// ── H: logga-kanalen dör ⇒ tick kastar ALDRIG (daemon-säkerhet) ─────────────
{
  const { m } = byggMätning({ tider: [0, 30_020, 90_000], loggaKastar: true });
  m.tick();
  let kast = null;
  try { m.tick(); } catch (e) { kast = e; }
  kontroll("H död loggkanal: tick kastar ej", kast === null, String(kast));
}

// ── I: trösklar overridabara (svitens låg-tröskel-läge) ─────────────────────
{
  const { m, rader } = byggMätning({ tider: [0, 30_010, 60_060], tröskelDriftMs: 20 });
  m.tick();
  m.tick(); // drift 10 ms — under
  const r = m.tick(); // drift 50 ms — över tröskeln 20
  kontroll("I tröskelDriftMs=20: drift 50 ms loggas", r.loggad === true && rader.length === 1);
}

// ── K: standardtrösklarna exporteras och är de protokollförda ───────────────
{
  kontroll("K TRÖSKEL_DRIFT_MS=2000", TRÖSKEL_DRIFT_MS === 2_000, String(TRÖSKEL_DRIFT_MS));
  kontroll("K TRÖSKEL_LOOP_MS=1000", TRÖSKEL_LOOP_MS === 1_000, String(TRÖSKEL_LOOP_MS));
}

// ── O: äkta sond — lasResurs() mot riktiga /proc (linux-servern) ────────────
{
  const r = lasResurs();
  kontroll("O äkta lasResurs: mem>0 load≥0 rss>0",
    r.memTillgangligMB > 0 && r.load1 >= 0 && r.rssMB > 0, JSON.stringify(r));
}

// ── L: tomt histogram → NaN i perf_hooks — härdas till 0 (inte NaN) ─────────
{
  const h = fakeHistogramFabrik();
  const { m } = byggMätning({ tider: [0, 30_010], hist: h });
  m.tick();
  h.state.max = NaN; // perf_hooks' tomt-histogram-värde
  h.state.mean = NaN;
  const r = m.tick();
  kontroll("L NaN-histogram → 0 (aldrig NaN)", r.loopMaxMs === 0 && r.loopMedelMs === 0 && r.loggad === false,
    JSON.stringify(r));
}

// ── Rapport ──────────────────────────────────────────────────────────────────
for (const rad of resultat) console.log(rad);
console.log(`\npumpor-tick-matning-svit: ${pass} PASS · ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
