#!/usr/bin/env node
// vaxthus-chatt-vakt.mjs — Växthuset Fas 1 (r288): chatt-jobbens hämtare.
// =====================================================================================
// BAKGRUND: chatt-API:t (src/app/api/vaxthus/[slug]/chatt/route.ts) skriver
// hyresgästens jobb till ~/tenants/chatt-jobb.txt + sätter pågar-flaggan —
// men FICK INTE självt spawn:a runern: Next 16 Turbopack spårar spawn-
// argument i bundlad kod och försöker resolva dem som moduler (tre fällda
// byggfönster 2026-09-28 05:08–06:11: '/ROOT/verktyg/…', sedan ('' |
// <dynamic>') — runtime-tillstånd räckte inte). KUREN är arkitekturen som
// Mimosa-kontraktet redan antyd: requesten äger FILERNA, daemonen äger
// PROCESSERNA. Denna vakt ropas minutvis av pumpor-daemonen.
//
// Kontrakt: finns ingen chatt-jobb.txt ⇒ tyst exit 0. Finns den ⇒ spawn:a
// verktyg/vaxthus-agent-chatt.mjs (avgrepad, stdio ignore — runern loggar
// själv till chatt/logg.jsonl). Dubbelplock är harmlöst BY DESIGN: runern
// raderar jobbfilen inom millisekunder och avslutar tyst utan jobb — dess
// eget kontrakt är låset.
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JOBB = path.join(process.env.HOME ?? "/home/ak1a", "tenants", "chatt-jobb.txt");
const RUNNER = path.join(ROT, "verktyg", "vaxthus-agent-chatt.mjs");

if (!fs.existsSync(JOBB)) process.exit(0);

const barn = spawn("node", [RUNNER], {
  cwd: path.dirname(JOBB),
  detached: true,
  stdio: "ignore",
});
barn.unref();
console.log(`vaxthus-chatt-vakt: jobb hämtat (pid ${barn.pid}) — runern har ordet`);
