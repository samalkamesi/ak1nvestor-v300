#!/usr/bin/env node
/**
 * o118 — RIKTAD LONGTASK-SOND (CDP-spår) för /en/blogg TBT-anomalin.
 * Köpost o110 §4.1: "riktad /en/blogg-sond på vilofönster (longtask-
 * snapshot per chunk, CDP)". Verkställs som Lighthouse --save-assets:
 * äkta Chrome-trace med callstack-attribution per task — mycket starkare
 * än rapportens "Unattributable".
 *
 * Upplägg (kontaminationssäkra kontrollen i samma fönster — o110:s eget
 * argument: delta en↔ar gäller även om fönstret bär last):
 *   /en/blogg  n=2  (mätobjekt)
 *   /ar/blogg  n=1  (kontroll, samma träd/bygge)
 *
 * Per main-thread-task >50 ms rapporteras: start, duration och de största
 * barn-events (FunctionCall/EvaluateScript/ParseHTML/Layout/Styles/GC …)
 * med url där trace bär den — det pekar ut mekANISMEN (hydrat, parse,
 * style-recalc, GC) och chunken.
 *
 * Utdata:
 *   data/forskning/OPTIMERING/lighthouse/o118-tracesond-<sida>-<n>.json  (summerad)
 *   verktyg/_o118-trace-tmp/ (råa trace+rapporthämteter — städas ej, bevismaterial)
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, copyFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BAS = process.env.LH_BAS || "http://localhost:3000";
const TMP = join(process.cwd(), "verktyg", "_o118-trace-tmp");
const KAT = join(process.cwd(), "data", "forskning", "OPTIMERING", "lighthouse");
mkdirSync(TMP, { recursive: true });

const SPOR = [
  ["en_blogg", "/en/blogg", 2],
  ["ar_blogg", "/ar/blogg", 1],
];

/** Kör en Lighthouse-passning med --save-assets i TMP; returnerar sökvägar. */
function kor(sida, sokvag, n) {
  const url = new URL(sokvag, BAS).href;
  const ut = join(TMP, `${sida}-${n}`);
  mkdirSync(ut, { recursive: true });
  console.log(`→ Lighthouse ${url} (pass ${n}) …`);
  execFileSync(
    "npx",
    [
      "--yes", "lighthouse", url,
      "--output=json", `--output-path=${join(ut, "rapport.json")}`,
      "--save-assets",
      "--form-factor=mobile",
      "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
      "--max-wait-for-load=60000",
      "--quiet",
    ],
    { encoding: "utf8", timeout: 240_000, maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] },
  );
  return ut;
}

// — analys: läsa trace med readFileSync (ESM, inget require) —
import { readFileSync } from "node:fs";

function lasta(traceFil) {
  return JSON.parse(readFileSync(traceFil, "utf8")).traceEvents;
}

function huvudanalys(events) {
  // main-thread = tråd med flest RunTask
  const perTrad = new Map();
  for (const e of events) {
    if (e.name === "RunTask" && e.ph === "X") {
      const nyckel = `${e.pid}:${e.tid}`;
      perTrad.set(nyckel, (perTrad.get(nyckel) ?? 0) + (e.dur ?? 0));
    }
  }
  const mainNyckel = [...perTrad.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!mainNyckel) return { fel: "ingen RunTask-tråd" };
  const [pid, tid] = mainNyckel.split(":").map(Number);
  const main = events.filter((e) => e.pid === pid && e.tid === tid && e.ph === "X");

  const tasks = main
    .filter((e) => e.name === "RunTask" && (e.dur ?? 0) > 50)
    .sort((a, b) => a.ts - b.ts);
  const barn = main.filter((e) => e.name !== "RunTask" && (e.dur ?? 0) > 3);

  const ut = [];
  for (const t of tasks) {
    const slut = t.ts + t.dur;
    const inuti = barn.filter((b) => b.ts >= t.ts && b.ts < slut).sort((a, b) => (b.dur ?? 0) - (a.dur ?? 0));
    const toppBarn = inuti.slice(0, 6).map((b) => {
      const d = b.args?.data ?? {};
      let url = d.url ?? d.styleSheetUrl ?? d.frame ?? "";
      if (!url && d.stackTrace?.[0]?.url) url = d.stackTrace[0].url;
      return {
        namn: b.name,
        dur: Math.round(b.dur ?? 0),
        url: String(url).replace(/^https?:\/\/[^/]+/, "").slice(0, 90),
        rad: d.stackTrace?.[0]?.lineNumber ?? d.lineNumber ?? null,
        funktion: d.functionName ?? d.stackTrace?.[0]?.functionName ?? "",
      };
    });
    ut.push({
      startMs: Math.round(t.ts / 1000),
      durMs: Math.round(t.dur),
      toppBarn,
    });
  }
  return { tasks: ut, antalTasks: tasks.length };
}

const resultat = {};
for (const [sida, sokvag, antal] of SPOR) {
  for (let n = 1; n <= antal; n++) {
    const utKat = kor(sida, sokvag, n);
    // Lighthouse döper assets <sidnamn>-<tidsstämpel>.trace.json
    const traceFil = readdirSync(utKat).find((f) => f.endsWith(".trace.json"));
    if (!traceFil) {
      console.log(`  ✗ ingen trace i ${utKat}: ${readdirSync(utKat).join(", ")}`);
      continue;
    }
    const analys = huvudanalys(lasta(join(utKat, traceFil)));
    // TBT ur rapporten för korrelation
    const rapport = JSON.parse(readFileSync(join(utKat, "rapport.json"), "utf8"));
    const tbt = Math.round(rapport.audits?.["total-blocking-time"]?.numericValue ?? -1);
    const fcp = Math.round(rapport.audits?.["first-contentful-paint"]?.numericValue ?? -1);
    analys.tbt = tbt;
    analys.fcp = fcp;
    analys.bygge = readFileSync(join(process.cwd(), ".next", "BUILD_ID"), "utf8").trim();
    const dest = join(KAT, `o118-tracesond-${sida}-${n}.json`);
    writeFileSync(dest, JSON.stringify(analys, null, 1));
    console.log(`  ✓ TBT ${tbt} · FCP ${fcp} · ${analys.tasks?.length ?? 0} longtasks → ${dest}`);
    resultat[`${sida}-${n}`] = analys;
  }
}

// Kompakt jämförelse på stdout
console.log("\n════ MONSTER-TASKS (>150 ms) per passning ════");
for (const [nyckel, a] of Object.entries(resultat)) {
  if (!a.tasks) continue;
  console.log(`\n— ${nyckel} (TBT ${a.tbt}, FCP ${a.fcp}) —`);
  for (const t of a.tasks.filter((x) => x.durMs > 150)) {
    console.log(`  @${t.startMs}ms ${t.durMs}ms`);
    for (const b of t.toppBarn.slice(0, 4)) {
      console.log(`      ${b.namn} ${b.dur}ms ${b.url} ${b.funktion ? `ƒ${b.funktion}` : ""}${b.rad != null ? `:${b.rad + 1}` : ""}`);
    }
  }
}
console.log("\nSond klar.");
