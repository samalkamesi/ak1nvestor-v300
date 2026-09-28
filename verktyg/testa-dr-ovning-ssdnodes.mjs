#!/usr/bin/env node
// Svit för verktyg/dr-ovning-ssdnodes.mjs (v193, r288).
// =====================================================================================
// Kontrakt:
//   1. IMPORT-SÄKERHET: modulen får ALDRIG köra huvudflödet vid import
//      (arHuvudprogram-vakten) — denna svit lever bara om den håller.
//   2. valSenasteDumpUr: daterade db-YYYY-MM-DD.sql.gz företräde (nyaste namn);
//      annars nyaste db-*.sql.gz på MTIME (cutover-fallback); tom/saknad
//      katalog ⇒ felmeddelande (fail-fast, aldrig tyst).
//   3. kategoriseraFel (ärvt syskonkontrakt): Supabase-moln-roller/scheman/
//      extensions + "does not exist/must be owner/already exists" är KÄNDA;
//      HINT/DETAIL/LINE/CONTEXT/WARNING/NOTICE är fortsättningsrader; allt
//      annat = OKÄNDA (fynd).
// Körs: node verktyg/testa-dr-ovning-ssdnodes.mjs  (exit 0 = alla PASS)

import { kategoriseraFel, valSenasteDumpUr } from "./dr-ovning-ssdnodes.mjs";
import { mkdtempSync, writeFileSync, rmSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

let pass = 0;
let fail = 0;
const resultat = [];
function kontroll(namn, ok, detalj = "") {
  if (ok) { pass++; resultat.push(`PASS ${namn}`); }
  else { fail++; resultat.push(`FAIL ${namn}${detalj ? " — " + detalj : ""}`); }
}

// ── A: import-säkerhet (vi nådde hit = main kördes ej vid import) ────────────
kontroll("A1 import triggar ej huvudflödet", true);

// ── B: valSenasteDumpUr ───────────────────────────────────────────────────────
{
  const kat = mkdtempSync(path.join(tmpdir(), "dr-dumpval-"));
  try {
    // B1: daterad företräde — även när cutover-namnet är NYARE på mtime
    writeFileSync(path.join(kat, "db-2026-09-26.sql.gz"), "x");
    writeFileSync(path.join(kat, "db-2026-09-27.sql.gz"), "x");
    writeFileSync(path.join(kat, "db-cutover-test.sql.gz"), "x");
    const nu = Date.now() / 1000;
    utimesSync(path.join(kat, "db-cutover-test.sql.gz"), nu, nu); // nyast
    utimesSync(path.join(kat, "db-2026-09-26.sql.gz"), nu - 9e4, nu - 9e4);
    utimesSync(path.join(kat, "db-2026-09-27.sql.gz"), nu - 8e4, nu - 8e4);
    kontroll("B1 daterad dump vinner över nyare cutover-namn",
      path.basename(valSenasteDumpUr(kat)) === "db-2026-09-27.sql.gz");

    // B2: fallback — bara cutover-dumpar ⇒ nyaste mtime
    rmSync(path.join(kat, "db-2026-09-26.sql.gz"));
    rmSync(path.join(kat, "db-2026-09-27.sql.gz"));
    writeFileSync(path.join(kat, "db-cutover-gammal.sql.gz"), "x");
    utimesSync(path.join(kat, "db-cutover-gammal.sql.gz"), nu - 5e5, nu - 5e5);
    kontroll("B2 cutover-fallback tar nyaste mtime",
      path.basename(valSenasteDumpUr(kat)) === "db-cutover-test.sql.gz");

    // B3: fel-i-detaljerna dumpar ignoreras (inte db-prefixerade)
    writeFileSync(path.join(kat, "annan-2026-09-28.sql.gz"), "x");
    kontroll("B3 icke-db-filer ignoreras", path.basename(valSenasteDumpUr(kat)).startsWith("db-"));

    // B4: tom katalog ⇒ kast
    const tom = mkdtempSync(path.join(tmpdir(), "dr-tom-"));
    let kast = null;
    try { valSenasteDumpUr(tom); } catch (e) { kast = e; }
    kontroll("B4 tom katalog kastar med förklaring", Boolean(kast) && /inga db-/i.test(kast.message));
    rmSync(tom, { recursive: true, force: true });

    // B5: saknad katalog ⇒ kast
    let kast2 = null;
    try { valSenasteDumpUr(path.join(kat, "finns-ej")); } catch (e) { kast2 = e; }
    kontroll("B5 saknad katalog kastar", Boolean(kast2));
  } finally {
    rmSync(kat, { recursive: true, force: true });
  }
}

// ── C: kategoriseraFel ────────────────────────────────────────────────────────
{
  const r = kategoriseraFel([
    'ERROR:  role "supabase_admin" does not exist',
    'ERROR:  schema "supabase_functions" does not exist',
    'ERROR:  extension "pg_graphql" is not available',
    'ERROR:  permission denied: must be owner of table profiles',
    'ERROR:  relation "finns_redan" already exists',
    "HINT:  något föregående fel förklarar detta",
    "DETAIL:  Key (id)=(42) is still referenced",
    "LINE 12:  CREATE EXTENSION ...",
    "        ^",
    "WARNING:  rounded combination...",
    "ERROR:  något helt okänt hände",
    "",
  ]);
  kontroll("C1 roller kategoriserade", r.kanda.roller.supabase_admin === 1);
  kontroll("C2 scheman kategoriserade", r.kanda.scheman.supabase_functions === 1);
  kontroll("C3 extensions kategoriserade", r.kanda.extensions.pg_graphql === 1);
  kontroll("C4 ovrigt kända (owner/exists)", r.kanda.ovrigtKant === 2);
  kontroll("C5 fortsättningsrader räknas ej som fynd", r.kanda.fortsattning === 5);
  kontroll("C6 okänd rad = fynd", r.okanda.length === 1 && r.okanda[0].includes("okänt"));
  const ren = kategoriseraFel([]);
  kontroll("C7 tom logg ⇒ noll fynd", ren.okanda.length === 0);
}

console.log(resultat.join("\n"));
console.log(`\n${pass} PASS · ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
