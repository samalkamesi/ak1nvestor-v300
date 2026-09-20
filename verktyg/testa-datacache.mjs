#!/usr/bin/env node
// Testsvit — DATACACHE/DATACENTRALEN (våg 213 del b / o106): lasCache/
// sparaCache/lasEllerHamta/cacheStatistik-kontrakten i sandbox.
// HELT sandboxad: process.chdir till tmp + TMPDIR-omdirigering — repots
// data/cache och /tmp/datacache rörs ALDRIG av sviten.
// Kör: node verktyg/testa-datacache.mjs  (Node ≥ 22.18: type stripping)
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major > 22 || (major === 22 && minor >= 18))) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping.");
  process.exit(1);
}

const { aktiveraTsImport } = await import(pathToFileURL(join(HÄR, "_o106-ts-import.mjs")).href);
aktiveraTsImport();

// ── Sandbox: cwd + TMPDIR pekas in i en engångskatalog ──────────────────────
const SANDBOX = mkdtempSync(join(tmpdir(), "o106-datacache-"));
const GAMLA_CWD = process.cwd();
const GAMLA_TMPDIR = process.env.TMPDIR;
mkdirSync(join(SANDBOX, "tmpdata"), { recursive: true });
process.env.TMPDIR = join(SANDBOX, "tmpdata");
process.chdir(SANDBOX);

let pass = 0, fail = 0;
const ok = (namn, villkor) => { if (villkor) { pass++; console.log("  PASS " + namn); } else { fail++; console.log("  FAIL " + namn); } };

try {
  const { lasCache, sparaCache, lasEllerHamta, cacheStatistik } = await import(
    pathToFileURL(join(ROT, "src/lib/datacache.ts")).href
  );

  console.log("A — sparaCache/lasCache: roundtrip i huvudkatalogen");
  const lagring = await sparaCache("VOLV-B.ST", "analys", { pris: 42 });
  ok("A1 spara till data/cache", lagring === "data/cache");
  const rad = await lasCache("VOLV-B.ST", "analys");
  ok("A2 lasCache träffar samma ticker/typ", rad !== null && rad.ticker === "VOLV-B.ST" && rad.typ === "analys");
  ok("A3 data-integritet", rad !== null && JSON.stringify(rad.data) === JSON.stringify({ pris: 42 }));
  ok("A4 kalla default on-demand", rad?.kalla === "on-demand");
  ok("A5 cachad är epok-ms", typeof rad?.cachad === "number" && rad.cachad > 0);
  await sparaCache("AAK.ST", "vagfundament", { x: 1 }, "cron");
  ok("A6 kalla cron när angiven", (await lasCache("AAK.ST", "vagfundament"))?.kalla === "cron");
  ok("A7 filnamnet sanerar icke-alfanumeriskt (path-traversal-skydd)", readFileSync(join(SANDBOX, "data/cache/analys-VOLV_B_ST.json"), "utf8").length > 0);
  ok("A8 miss på okänd ticker", (await lasCache("FINNS-EJ.ST", "analys")) === null);
  ok("A9 ogiltig typ ⇒ null", (await lasCache("VOLV-B.ST", "hittapå")) === null);
  ok("A10 ogiltig ticker (path-traversal) ⇒ no-cache + null",
    (await sparaCache("../../etc/passwd", "analys", {})) === "no-cache" &&
    (await lasCache("../../etc/passwd", "analys")) === null);

  console.log("B — färskhet (maxAlderMin)");
  writeFileSync(join(SANDBOX, "data/cache/netnet-GAMMAL.json"), JSON.stringify({ ticker: "GAMMAL", typ: "netnet", data: { gammal: true }, cachad: Date.now() - 2 * 60 * 60_000, kalla: "cron" }), "utf8");
  ok("B1 två timmar gammal + 60 min-fönster ⇒ miss", (await lasCache("GAMMAL", "netnet", 60)) === null);
  ok("B2 utan fönster serveras gamla raden (nätverksreserv)", (await lasCache("GAMMAL", "netnet")) !== null);

  console.log("C — korrupta rader tåljas (P8-graceful, aldrig kast)");
  writeFileSync(join(SANDBOX, "data/cache/analys-TRASIG.json"), "{ detta är inte json", "utf8");
  ok("C1 korrupt fil ⇒ null", (await lasCache("TRASIG", "analys")) === null);
  writeFileSync(join(SANDBOX, "data/cache/konfluens-FELTICKER.json"), JSON.stringify({ ticker: "ANNAN", typ: "konfluens", data: 1, cachad: Date.now(), kalla: "cron" }), "utf8");
  ok("C2 rad med fel ticker/typ ⇒ null", (await lasCache("FELTICKER", "konfluens")) === null);

  console.log("D — lasEllerHamta: cachen först, hämtaren bara vid behov");
  let hamtaAnrop = 0;
  const d1 = await lasEllerHamta("NY-STOCK", "analys", async () => { hamtaAnrop++; return { frisk: false }; });
  ok("D1 miss ⇒ hämtaren körs", d1.franCache === false && hamtaAnrop === 1 && d1.data.frisk === false);
  const d2 = await lasEllerHamta("NY-STOCK", "analys", async () => { hamtaAnrop++; return { frisk: false }; });
  ok("D2 nästa anrop inom fönstret ⇒ ur cachen, hämtaren orörd", d2.franCache === true && hamtaAnrop === 1);
  const d3 = await lasEllerHamta("GAMMAL", "netnet", async () => { throw new Error("nätet nere"); }, 60);
  ok("D3 hämtare kastar + gammal rad finns ⇒ gamla serveras (nätverksreserv)", d3.franCache === true && d3.data.gammal === true);
  let kastad = false;
  try { await lasEllerHamta("FINNS-EJ.ST", "analys", async () => { throw new Error("nätet nere"); }); } catch { kastad = true; }
  ok("D4 hämtare kastar utan reserv ⇒ felet vidare (ärligt)", kastad);

  console.log("E — cacheStatistik");
  const stat = await cacheStatistik();
  ok(`E1 rader räknas korrekt (${stat.rader})`, stat.rader >= 4);
  ok("E2 perTyp bär typerna", (stat.perTyp["analys"] ?? 0) >= 2 && (stat.perTyp["netnet"] ?? 0) >= 1);
  ok("E3 äldst/yngst är epok-ms", typeof stat.aldst === "number" && typeof stat.yngst === "number" && stat.aldst <= stat.yngst);
  const stat2 = await cacheStatistik();
  ok("E4 determinism (två läsningar samma svar)", JSON.stringify(stat) === JSON.stringify(stat2));

  console.log("F — reservkatalogen (TMPDIR-omdirigering bevisar Vercel-grenen)");
  mkdirSync(join(SANDBOX, "read-only"), { recursive: true });
  const GAMLA_HUVUD = join(SANDBOX, "data");
  const FLYTTAD = join(SANDBOX, "data-flyttad");
  rmSync(GAMLA_HUVUD, { recursive: true, force: true });
  // huvudkatalogen återuppstår av sparaCache — simulera read-only genom att
  // göra "data" till en FIL (mkdirSync kastar då) och pekaTMPDIR är redan sandbox
  writeFileSync(GAMLA_HUVUD, "inte en katalog", "utf8");
  const lagring2 = await sparaCache("RESERV.ST", "analys", { reserv: true });
  ok("F1 huvudkatalog otillgänglig ⇒ reserven (/tmp/datacache-klassen)", lagring2 === "/tmp/datacache");
  ok("F2 reservraden läsbar", (await lasCache("RESERV.ST", "analys"))?.data?.reserv === true);
  rmSync(GAMLA_HUVUD, { force: true });
  mkdirSync(FLYTTAD, { recursive: true });
} finally {
  process.chdir(GAMLA_CWD);
  if (GAMLA_TMPDIR === undefined) delete process.env.TMPDIR; else process.env.TMPDIR = GAMLA_TMPDIR;
  rmSync(SANDBOX, { recursive: true, force: true });
}

console.log(`\nSVIT DATACACHE: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
