#!/usr/bin/env node
/**
 * PUMPOR-TICK-MÄTNING (o140, spår 8) — daemonens tick-svält-instrument
 * =====================================================================================
 * ROTFYND (o136 §5, bokad som §6.3 "egen våg"): pumpor-daemonens rop-gap
 * (organ-gap 100–146 s, hel-tystnad 94–205 s, korrelerade med bygg/höglast)
 * kan inte ROTORSAKSDÖMAS — tre hypoteser lever samtidigt:
 *   (a) event-loop-blockering i daemonen (loop-frys),
 *   (b) CPU/IO-svält (hela servern seg — daemonen svälter med den),
 *   (c) pm2-pipe-backpressure (ut-loggen blockeras vid höglast).
 * Utan instrument är gapen bara symtom. Denna modul ger daemonen mätögon:
 *
 *   · DRIFT   — start-till-start-avstånd minus schemalagt intervall
 *               (30 000 ms). Normalt några ms; > 2 s = tick-svält.
 *               Fångar (a) och (b) som FÖRDRÖJNING oavsett orsak.
 *   · LOOP    — perf_hooks.monitorEventLoopDelay-histogram, max/medel
 *               sedan förra tick (fönstret nollställs varje tick).
 *               Hög loop-max med låg drift = kort blockering som
 *               schemat ännu hann ikapp; fångar (a) direkt.
 *   · RESURS  — vid tröskelträff endast: MemAvailable, loadavg 1 min,
 *               daemonens RSS. Skiljer (b) höglast/ressvält från (a)/(c).
 *
 * Träffas tröskeln loggas EN maskinläsbar rad via daemonens logga() (hamnar
 * i pm2-ut-loggen — SAMMA kanal som rop-hälsa.mjs läser):
 *   TICK-SVÄLT {"driftMs":…,"loopMaxMs":…,"loopMedelMs":…,
 *               "memTillgangligMB":…,"load1":…,"rssMB":…}
 * Radkontrakt mot rop-hälsa: INGET "▶ " och inte "PUMPOR-DAEMONEN…startar"
 * ⇒ parsningen opåverkad (▶-rader och start-rader är dess enda mönster).
 *
 * Filosofin är o136:s: instrument DÖMER ALDRIG kausaliteten åt oss — den
 * gör skillnaden mellan hypoteserna MÄTBAR. Rotdomen (a)/(b)/(c) förs i
 * protokollet när första äkta TICK-SVÄLT-raderna finns.
 *
 * Härdning: tick() kastar ALDRIG (daemonen får aldrig dö av sitt instrument)
 * — histogram-läsning, resursläsning och loggning bärs alla av try/catch.
 * Ren filläsning för resurs (inga barnprocesser — mimosa-ren från födelsen,
 * o123-doktrinen). Import startar ALDRIG mätning (o80 — main-guard sist).
 */
import { monitorEventLoopDelay, performance } from "node:perf_hooks";
import { readFileSync } from "node:fs";

export const VERSION = "1.0.0";
export const STANDARD_INTERVALL_MS = 30_000;
export const TRÖSKEL_DRIFT_MS = 2_000;
export const TRÖSKEL_LOOP_MS = 1_000;

/** Resurskontext — ren filläsning ur /proc (inga skal-anrop). */
export function lasResurs() {
  const meminfo = readFileSync("/proc/meminfo", "utf8");
  const m = meminfo.match(/^MemAvailable:\s+(\d+) kB$/m);
  const loadavg = readFileSync("/proc/loadavg", "utf8").trim().split(/\s+/);
  return {
    memTillgangligMB: m ? Math.round(Number(m[1]) / 1024) : -1,
    load1: Number(loadavg[0] ?? -1),
    rssMB: Math.round(process.memoryUsage().rss / 1048576),
  };
}

/**
 * byggTickMatning(opts) → { tick() } — anropas EN gång per daemon-tick,
 * FÖRRE schemakörningarna (de är asynkrona spawn:ar; tick-callbacken
 * själv är mikrosekunder). Overridbara beroenden för sviten:
 * logga · nu · lasResurs · monitor (histogram-fabrik) · intervallMs ·
 * tröskelDriftMs · tröskelLoopMs.
 */
export function byggTickMatning(opts = {}) {
  const logga = opts.logga ?? ((rad) => console.log(rad));
  const nu = opts.nu ?? (() => performance.now());
  const lasR = opts.lasResurs ?? lasResurs;
  const monitor = opts.monitor ?? monitorEventLoopDelay;
  const intervallMs = opts.intervallMs ?? STANDARD_INTERVALL_MS;
  const tröskelDrift = opts.tröskelDriftMs ?? TRÖSKEL_DRIFT_MS;
  const tröskelLoop = opts.tröskelLoopMs ?? TRÖSKEL_LOOP_MS;

  let histogram = monitor({ resolution: 20 });
  try { histogram.enable(); } catch { /* ofarligt: värdena blir 0 */ }
  let forrStart = null;

  return {
    /** Mät en tick. Returnerar alltid { driftMs, loopMaxMs, loopMedelMs,
     *  loggad } — kastar ALDRIG (daemon-säkerhet). */
    tick() {
      let driftMs = null;
      let loopMaxMs = 0;
      let loopMedelMs = 0;
      let loggad = false;
      try {
        const start = nu();
        if (forrStart !== null) driftMs = start - forrStart - intervallMs;
        forrStart = start;

        // Histogram-fönstret sedan förra tick: läs, nollställ (färskt fönster).
        // (Tomt histogram → NaN i perf_hooks — Number.isFinite härdar, ?? gör ej.)
        const råMax = Number(histogram.max ?? 0);
        const råMedel = Number(histogram.mean ?? 0);
        loopMaxMs = Number.isFinite(råMax) ? råMax / 1e6 : 0; // ns → ms
        loopMedelMs = Number.isFinite(råMedel) ? råMedel / 1e6 : 0;
        try { histogram.reset(); } catch { /* ofarligt */ }

        if (driftMs !== null && (driftMs > tröskelDrift || loopMaxMs > tröskelLoop)) {
          const falt = {
            driftMs: Math.round(driftMs),
            loopMaxMs: Math.round(loopMaxMs),
            loopMedelMs: Math.round(loopMedelMs * 10) / 10,
          };
          try {
            const r = lasR();
            falt.memTillgangligMB = r.memTillgangligMB;
            falt.load1 = r.load1;
            falt.rssMB = r.rssMB;
          } catch (e) {
            falt.resursFel = String(e?.message || e).slice(0, 80);
          }
          logga(`TICK-SVÄLT ${JSON.stringify(falt)}`);
          loggad = true;
        }
      } catch (e) {
        // Instrumentet dör ALDRIG med daemonen — felet syns men kastar ej.
        try { logga(`TICK-MÄTNING-FEL ${String(e?.message || e).slice(0, 100)}`); } catch { /* tyst */ }
      }
      return { driftMs, loopMaxMs, loopMedelMs, loggad };
    },
  };
}

// ── main-guard (o80): direktkörning = engångs-sond, import = bibliotek ────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const m = byggTickMatning({ logga: (r) => console.log(r) });
  console.log(`pumpor-tick-matning v${VERSION} — sond: en tick med riktiga värden`);
  console.log(JSON.stringify({ ...m.tick(), resurs: lasResurs() }));
}
