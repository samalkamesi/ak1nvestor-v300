#!/usr/bin/env node
/**
 * KVALITETSGRINDEN (våg 139) — mekanisk pre-commit-hook.
 * =====================================================================
 * Kundens direktiv 2026-09-14: "KVALITETSGRINDEN är nu MEKANISK
 * (pre-commit: tsc 0 + R2-hemlighetsskydd; ALDRIG --no-verify)."
 *
 * Två grindar, i snabbhetsordning:
 *
 *   1. R2-HEMLIGHETSSKYDD (alltid, alla filtyper, millisekunder):
 *      - förbjudna sökvägar (.env*, nyckel-/pem-filer, secrets-kataloger;
 *        *.example tillåts som dokumentation)
 *      - hemlighetsexponenter i staged innehåll (privata nycklar,
 *        Supabase service-nycklar, sk-…-API-nycklar, hårdkodade
 *        lösenord/nycklar/token med värde ≥ 12 tecken)
 *
 *   2. TSC 0 (endast när kod är staged — rena dataleveranser
 *      hoppas över för snabbhet): npx tsc --noEmit mot baslinjen
 *      NOLL fel (våg 133). Fel ⇒ commit avslås.
 *
 * Installeras av verktyg/installa-kvalitetsgrind.mjs i .git/hooks/pre-commit
 * (arbetsyta OCH prod-repot /home/ak1a/AK1). --no-verify är FÖRBJUDET —
 * se AGENTS.md § KVALITETSGRINDEN.
 *
 * Obs: innehållsskanningen läser filerna på disk. Vid commit är den
 * staged versionen normalt identisk med diskversionen (git add föregår);
 * syftet är att fånga oaktsatshemligheter, inte motståndare.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import process from "node:process";

const ROTE = process.cwd();

/** Staged sökvägar (endast namn). */
function stagedFiler() {
  try {
    return execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
      cwd: ROTE,
      encoding: "utf8",
    })
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  } catch {
    return [];
  }
}

/** R2: sökvägar som ALDRIG får committas (exempelfiler tillåts). */
const FORBJUDNA_SOKVAGAR = [
  /^\.env/i,
  /(^|\/)\.env\./i,
  /(^|\/)id_rsa/i,
  /\.pem$/i,
  /\.key$/i,
  /(^|\/)secrets?\//i,
  /(^|\/)\.ssh\//i,
  /service-account.*\.json$/i,
];
const TILLATEN_EXEMPEL = /\.example(\.|$)/i;

/** R2: innehållsexponenter — [mönster, mänsklig förklaring]. */
const HEMLIGHETSMONSTER = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "privat nyckel"],
  [/SUPABASE_(?:SERVICE|SERVICE_ROLE)_?(?:KEY|SECRET)/i, "Supabase service-nyckel"],
  [/\bservice_role\b/i, "service_role-referens"],
  [/\bsk-[A-Za-z0-9_-]{16,}/, "API-nyckel (sk-…)"],
  [/(?:api[-_]?nyckel|api[-_]?key|hemlighet|secret|token|lösenord|password)\s*[:=]\s*["'][^"']{12,}["']/i, "hårdkodad hemlighet"],
];

/** Max filstorlek för innehållsskanning (2 MB). */
const MAX_BYTE = 2 * 1024 * 1024;

/** Grindens egen mönsterfil — detektorerna ligger som literals i källan och
 *  triggar på sig själva (bevisat vid våg 139:s första commit: "service_role"
 *  i mönsterregistret matchade mönstret). Innehållsskanningen hoppar över
 *  den; sökvägsgrindarna (1a) gäller den fortfarande. */
const EXKLUDERADE_FRAN_INNEHALL = new Set(["verktyg/kvalitetsgrind.mjs"]);

const fel = [];
const staged = stagedFiler();

// --- Grind 1a: förbjudna sökvägar ---
for (const fil of staged) {
  if (TILLATEN_EXEMPEL.test(fil)) continue;
  if (FORBJUDNA_SOKVAGAR.some((re) => re.test(fil))) {
    fel.push(`R2 Förbjuden sökväg stadgad: ${fil} (nyckel-/miljöfiler commitas ALDRIG)`);
  }
}

// --- Grind 1b: hemlighetsexponenter i innehållet ---
for (const fil of staged) {
  if (EXKLUDERADE_FRAN_INNEHALL.has(fil)) continue;
  let storlek = 0;
  try {
    storlek = statSync(fil).size;
  } catch {
    continue; // raderad/Finns ej — sökvägsregeln ovan räcker
  }
  if (storlek > MAX_BYTE || storlek === 0) continue;
  let innehall = "";
  try {
    innehall = readFileSync(fil, "utf8");
  } catch {
    continue; // binär — hoppa över
  }
  for (const [monster, forklaring] of HEMLIGHETSMONSTER) {
    if (monster.test(innehall)) {
      fel.push(`R2 ${forklaring} hittad i: ${fil}`);
    }
  }
}

if (fel.length > 0) {
  console.error("\n=== KVALITETSGRINDEN: AVSLÅR COMMIT (R2-hemlighetsskydd) ===");
  for (const f of fel) console.error("  ✗ " + f);
  console.error("Rätta filerna och commita igen. --no-verify är FÖRBJUDET (AGENTS.md).\n");
  process.exit(1);
}

// --- Grind 2: tsc 0 — endast när kod är staged (dataleveranser går snabbt) ---
const kodFiler = staged.filter(
  (f) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f) && !f.startsWith("data/"),
);
if (kodFiler.length > 0) {
  console.log("Kvalitetsgrinden: npx tsc --noEmit (baslinje 0, våg 133) …");
  try {
    execFileSync("npx", ["tsc", "--noEmit"], { stdio: "inherit", cwd: ROTE, timeout: 300_000 });
  } catch {
    console.error("\n=== KVALITETSGRINDEN: AVSLÅR COMMIT (tsc != 0) ===");
    console.error("Typfelen ovan måste rättas innan commit. --no-verify är FÖRBJUDET (AGENTS.md).\n");
    process.exit(1);
  }
}

process.exit(0);
