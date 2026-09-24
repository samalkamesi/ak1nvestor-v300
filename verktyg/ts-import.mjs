#!/usr/bin/env node
// TS-IMPORT-BRYGGAN (V213b, s8-u2 2026-09-20) — öppnar src/**/*.ts för
// kontraktssviter under ren node.
//
// Node ≥ 22.18 strippar typer i .ts-filer vid import (type stripping), men
// lösningen följer ESM-bokstaven: "@/lib/x"-alias (tsconfig paths) och
// extensionless relativa importer ("./datacache") som Next/bundlarna tolererar
// går INTE att lösa. Bryggan registrerar en resolver-hook
// (verktyg/_ts-resolve-hooks.mjs) som översätter båda mönstren och exponerar
//
//   importeraTs("../src/lib/signal-bus.ts")  → dynamic import av modulen
//
// Registrationen är idempotent per process. Kontraktssviterna (V213b) importerar
// enbart via denna brygga; nya sviter gör likadant i stället för textgrep.
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

if (!globalThis.__ak1aTsResolveRegistrerad) {
  register(pathToFileURL(join(HÄR, "_ts-resolve-hooks.mjs")).href, pathToFileURL(HÄR).href);
  globalThis.__ak1aTsResolveRegistrerad = true;
}

/** Dynamic import av en repo-relativ sökväg till en .ts-modul (med alias-lösning). */
export async function importeraTs(relSokvag) {
  return import(pathToFileURL(join(ROT, relSokvag)).href);
}

/**
 * Kompatibilitets-API från _o106-ts-import (o112-konsolideringen): sviter som
 * laddar .ts-moduler med EGNA pathToFileURL-importer aktiverar bryggan explicit.
 * Registreringen sker redan idempotent vid import av denna modul — funktionen
 * behåller bara det gamla anropsmönstret så migreringen är en rad per svit.
 */
export function aktiveraTsImport() {}
