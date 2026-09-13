#!/usr/bin/env node
/**
 * INSTALLERA KVALITETSGRINDEN (våg 139) — skriver .git/hooks/pre-commit.
 * =====================================================================
 * Kunddirektiv 2026-09-14: mekanisk kvalitetsgrind, ALDRIG --no-verify.
 * Körs EN Gång per repo:
 *   node verktyg/installa-kvalitetsgrind.mjs          (denna arbetsyta)
 *   cd /home/ak1a/AK1 && node verktyg/installa-kvalitetsgrind.mjs  (prod)
 * Git-hooks versionshanteras inte — därav detta installationsverktyg.
 * Hooken delegerar allt arbete till verktyg/kvalitetsgrind.mjs som ÄR
 * versionerad, så en förbättring av grinden landar med vanlig commit.
 */
import { writeFileSync, chmodSync, mkdirSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const rot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const hook = path.join(rot, ".git", "hooks", "pre-commit");

const HOOK_INNEHALL = `#!/bin/sh
# AK1A KVALITETSGRINDEN (våg 139) — mekanisk pre-commit.
# tsc 0 + R2-hemlighetsskydd; ALDRIG --no-verify (AGENTS.md).
cd "$(git rev-parse --show-toplevel)" || exit 1
exec node verktyg/kvalitetsgrind.mjs
`;

mkdirSync(path.dirname(hook), { recursive: true });
writeFileSync(hook, HOOK_INNEHALL, { mode: 0o755 });
chmodSync(hook, 0o755);
console.log("Kvalitetsgrinden installerad: " + hook);
