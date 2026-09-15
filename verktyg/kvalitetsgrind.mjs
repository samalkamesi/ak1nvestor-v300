#!/usr/bin/env node
/**
 * KVALITETSGRINDEN (våg 139 · kuras våg 150: fail-CLOSED + referens-/värdeskiljande
 * Supabas-mönster) — mekanisk pre-commit-hook.
 * =====================================================================
 * Kundens direktiv 2026-09-14: "KVALITETSGRINDEN är nu MEKANISK
 * (pre-commit: tsc 0 + R2-hemlighetsskydd; ALDRIG --no-verify)."
 *
 * KURAN 2026-09-14 (våg 150, bevisad live): två brister —
 *   1) stagedFiler() fångade git-fel till "[]" ⇒ grinden skannade INGENTING
 *      och passerade tyst när två git-processer raced (u8 kom igenom med en
 *      fil grunden avslagit 60 s tidigare). Nu: fel ⇒ AVSLAG med "försök
 *      igen"-meddelande (fail closed — ett race kostar en retry, aldrig en
 *      tyst förbi-passering).
 *   2) Supabas-mönstret träffade själva miljövariabelnamnet — varje legitim
 *      process.env.SUPABASE_SERVICE_ROLE_KEY-referens (m9-fabrik.mjs,
 *      m9-ko-dumpa.mjs, supabase-rest.ts-mönstret) blockerades, medan
 *      riktiga värden-format saknades. Nu: referenser passerar; hårdkodade
 *      tilldelningar (["']värde["'] ≥ 12), sb_secret_-tokens och service-
 *      JWT-format avslås.
 *
 * Två grindar, i snabbhetsordning:
 *
 *   1. R2-HEMLIGHETSSKYDD (alltid, alla filtyper, millisekunder):
 *      - förbjudna sökvägar (.env*, nyckel-/pem-filer, secrets-kataloger;
 *        *.example tillåts som dokumentation)
 *      - hemlighetsexponenter i staged innehåll (privata nycklar,
 *        Supabase service-nycklar som VÄRDEN, sk-…-API-nycklar, hårdkodade
 *        lösenord/nycklar/token med värde ≥ 12 tecken)
 *
 *   2. TSC 0 (endast när kod är staged — rena dataleveranser
 *      hoppas över för snabbhet): projektets egna tsc-binär
 *      --noEmit mot baslinjen NOLL fel (våg 133). Fel ⇒ commit avslås.
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
import { readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROTE = process.cwd();

/** Staged sökvägar (endast namn). Git-fel ⇒ AVSLAG (fail closed, våg 150-kuran):
 *  ett låst index vid samtidiga commits ger "försök igen", aldrig tyst förbi. */
function stagedFiler() {
  const ut = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
    cwd: ROTE,
    encoding: "utf8",
  });
  return ut
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
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

/** R2: innehållsexponenter — [mönster, mänsklig förklaring].
 *  Referensen `process.env.SUPABASE_SERVICE_ROLE_KEY` är repo-konvention
 *  (m9-fabrik.mjs, supabase-rest.ts) och träffas INTE — det är VÄRDET som
 *  är hemligheten: tilldelning med citerat värde, sb_secret_-token eller
 *  tvåsegments-JWT (Supabases service-/anon-nyckelformat). */
const HEMLIGHETSMONSTER = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "privat nyckel"],
  [/SUPABASE_(?:SERVICE|SERVICE_ROLE)_?(?:KEY|SECRET)\s*[:=]\s*["'][^"']{12,}["']/i, "hårdkodad Supabase service-nyckel (tilldelat värde)"],
  [/\bsb_secret_[A-Za-z0-9]{16,}/, "Supabase hemlig nyckel (sb_secret_-format)"],
  [/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{15,}\./, "JWT-format-nyckel (Supabase service-/anon-nyckel)"],
  [/\bsk-[A-Za-z0-9_-]{16,}/, "API-nyckel (sk-…)"],
  [/(?:api[-_]?nyckel|api[-_]?key|hemlighet|secret|token|lösenord|password)\s*[:=]\s*["'][^"']{12,}["']/i, "hårdkodad hemlighet"],
];

/** Max filstorlek för innehållsskanning (2 MB). */
const MAX_BYTE = 2 * 1024 * 1024;

/** Grindens egen mönsterfil — detektorerna ligger som literals i källan och
 *  triggar på sig själva. Innehållsskanningen hoppar över den; sökvägs-
 *  grindarna (1a) gäller den fortfarande. */
const EXKLUDERADE_FRAN_INNEHALL = new Set(["verktyg/kvalitetsgrind.mjs"]);

const fel = [];

let staged = [];
try {
  staged = stagedFiler();
} catch (e) {
  console.error("\n=== KVALITETSGRINDEN: KAN INTE LÄSA STAGED FILER — AVSLÅR (fail closed) ===");
  console.error(`  ✗ git diff --cached misslyckades (${String(e.message).split("\n")[0]})`);
  console.error("  Sannolikt låst index av en samtidig git-operation — vänta några sekunder");
  console.error("  och commita igen. Grinden passerar ALDRIG tyst när den inte kan läsa.");
  console.error("  --no-verify är FÖRBJUDET (AGENTS.md).\n");
  process.exit(1);
}

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
  console.error("Rätta filerna och commita igen. --no-verify är FÖRBJUDET (AGENTS.md § KVALITETSGRINDEN).\n");
  process.exit(1);
}

// --- Grind 2: tsc 0 — endast när kod är staged (dataleveranser går snabbt) ---
const kodFiler = staged.filter(
  (f) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f) && !f.startsWith("data/"),
);
if (kodFiler.length > 0) {
  // s8-determinism (2026-09-15): projektets EGEN tsc-binär, ALDRIG npx —
  // mitt i deploy (npm ci river .bin) kan npx lösa "tsc" till cachens
  // dummy-paket tsc@2.0.4. Saknad binär ⇒ fail closed med tydligt fel.
  const tscBin = path.join(ROTE, "node_modules", "typescript", "bin", "tsc");
  if (!existsSync(tscBin)) {
    console.error("\n=== KVALITETSGRINDEN: AVSLÅR COMMIT (node_modules/typescript saknas — deploy pågår?) ===");
    console.error("Vänta ut deployfönstret och committa igen. --no-verify är FÖRBJUDET (AGENTS.md).\n");
    process.exit(1);
  }
  console.log("Kvalitetsgrinden: node node_modules/typescript/bin/tsc --noEmit (baslinje 0, våg 133) …");
  try {
    execFileSync(process.execPath, [tscBin, "--noEmit"], { stdio: "inherit", cwd: ROTE, timeout: 300_000 });
  } catch {
    console.error("\n=== KVALITETSGRINDEN: AVSLÅR COMMIT (tsc != 0) ===");
    console.error("Typfelen ovan måste rättas innan commit. --no-verify är FÖRBJUDET (AGENTS.md).\n");
    process.exit(1);
  }
}

process.exit(0);
