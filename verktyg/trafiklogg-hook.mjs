#!/usr/bin/env node
/**
 * TRAFIKLOGG-HOOK — R4 FAS 1: SessionStart-telemetri
 * (verktyg för deklarationen i ~/.zcode/cli/config.json → hooks.events.
 * SessionStart; karta: data/forskning/zcode-kallkod/R4-HOOKS.md §7–9).
 *
 * Körs av zcode-core-runtimen som EN hook per sessionstart (guard
 * sessionStartHookRan), deklarerad async:true + alltid exit 0 — stdout
 * tolkas per design ALDRIG och hooken kan INTE blockera en turn.
 *
 * Gör EN sak: läs hook-stdin (Claude-kompatibel JSON), plocka MINIMALT med
 * metadata (session_id, source, agent_type — ALDRIG prompt/svar-innehåll,
 * R4-HOOKS §8.6 GDPR-minimi) och POSTa till loopback-rutten
 * /api/studio/sessionstart med hemlig query-param.
 *
 * Nyckelkälla: ADMIN_PASSWORD ur process-miljön; om den saknas (cron-barn
 * startade utan env) läses .env med process.loadEnvFile — ETABLERAT mönster
 * från verktyg/backup-fran-molnet.mjs ("ENDAST env — Mimosa-kontraktet").
 * Värdet loggas ALDRIG och skickas ENDAST till 127.0.0.1:3000.
 *
 * Felhantering: ALLT tyst + exit 0 (R4-HOOKS §7.2, §8 risk 2/5/9) — vid
 * nätverksfel, ogiltig JSON, saknad nyckel eller nere-api avslutas stilla.
 * Hårt processtak 7 s < per-hook-timeoutMs 8 s (aldrig en zombie).
 */

const RUTT = "http://127.0.0.1:3000/api/studio/sessionstart";
const FETCH_TAK_MS = 5000;
const PROCESS_TAK_MS = 7000;

setTimeout(() => process.exit(0), PROCESS_TAK_MS).unref();

function lasIndata() {
  return new Promise((resolve) => {
    let text = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (del) => {
      text += del;
      if (text.length > 65536) resolve(text); // hårt tak — hook-stdin är liten
    });
    process.stdin.on("end", () => resolve(text));
    process.stdin.on("error", () => resolve(""));
  });
}

async function main() {
  let body = {};
  try {
    body = JSON.parse((await lasIndata()) || "{}");
  } catch {
    return; // ogiltig stdin är ett hook-fel vi äger tyst
  }

  // Fas 1: ENBART SessionStart (R4-HOOKS §9.1 — Stop fejar per svar, risk #1).
  if (body.hook_event_name !== "SessionStart") return;

  if (!process.env.ADMIN_PASSWORD) {
    try {
      process.loadEnvFile("/home/ak1a/AK1/.env");
    } catch {
      /* dev eller saknad fil — nyckel saknas, tyst hemma */
    }
  }
  const nyckel = process.env.ADMIN_PASSWORD;
  if (!nyckel) return;

  const payload = {
    session_id: String(body.session_id ?? "").slice(0, 64),
    source: String(body.source ?? "okand").slice(0, 16),
    ts: Date.now(),
    agent: String(body.agent_type ?? "okand").slice(0, 24),
  };
  if (!payload.session_id) return;

  await fetch(`${RUTT}?nyckel=${encodeURIComponent(nyckel)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(FETCH_TAK_MS),
  });
  // Svaret (200/4xx/5xx) är oviktigt för hooken — raden landar eller den gör ej det.
}

main().catch(() => {}).finally(() => process.exit(0));
