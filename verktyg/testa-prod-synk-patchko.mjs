#!/usr/bin/env node
/**
 * TESTSVIT — PATCH-KÖN i prod-synk.mjs (o46, spår 8)
 * ====================================================================
 * Testar de exporterade funktionerna lasPatchKo / tulkPatchPost /
 * lasPatchKvitton / aktivPatchPlan / skrivPatchKvitto mot fixturer i
 * OS-temp (mkdtemp — zonavtalet: sviten kan aldrig lämma spår i repot
 * eller läsas av tsc). Kontrakten som SVARAR mot korSynk-integrationen:
 *   · leveranskedjeskydd: främmande paket (ej i package.json) vägras
 *   · exakt semver: ranges (^, ~) och "latest" vägras — determinism
 *   · injektionshärdning: namn/version med skal-metatecken vägras av
 *     regex LÅNGT före att de når bash-strängen i korSynk
 *   · loop-skydd: 3 misslyckade för exakt (paket, version) = död post;
 *     versionbyte i köfilen nollar räkningen; ok-kvitto = klar
 *   · patch-fel blockerar aldrig kodleverans (misslyckad install ⇒
 *     fortsätt) testas indirekt: felposter plockas bort ur planen men
 *     genererar ALDRIG undantag
 * Körning: node verktyg/testa-prod-synk-patchko.mjs  (exit 0 = GRÖN)
 */
import { mkdtempSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  tulkPatchPost,
  lasPatchKo,
  lasPatchKvitton,
  aktivPatchPlan,
  skrivPatchKvitto,
  bedomByggMisslyckande,
  bevaraByggLoggar,
} from "./prod-synk.mjs";

let pass = 0;
let fail = 0;
const felsakad = [];

function kolla(namn, villkor) {
  if (villkor) {
    pass++;
    console.log(`  PASS ${namn}`);
  } else {
    fail++;
    felsakad.push(namn);
    console.log(`  FAIL ${namn}`);
  }
}

const TMP = mkdtempSync(path.join(tmpdir(), "patchko-test-"));
const koFil = path.join(TMP, "patch-ko.json");
const kvittoFil = path.join(TMP, "patch-kvitton.jsonl");
const kanda = new Set(["next", "eslint-config-next", "@supabase/supabase-js"]);

console.log("== tulkPatchPost: giltiga poster ==");
kolla("giltigt enkelnamn + exakt version", tulkPatchPost({ paket: "next", version: "16.3.5" }).paket === "next");
kolla("giltigt scoped-namn", tulkPatchPost({ paket: "@supabase/supabase-js", version: "2.116.0" }).version === "2.116.0");
kolla("prerelease-suffix tillåtet (kanarisklasser)", tulkPatchPost({ paket: "next", version: "16.3.5-beta.1" }).version === "16.3.5-beta.1");

console.log("== tulkPatchPost: ogiltiga poster (injektion + determinism) ==");
kolla("caret-range vägras", Boolean(tulkPatchPost({ paket: "next", version: "^16.3.5" }).fel));
kolla("tilde-range vägras", Boolean(tulkPatchPost({ paket: "next", version: "~16.3.5" }).fel));
kolla("'latest' vägras", Boolean(tulkPatchPost({ paket: "next", version: "latest" }).fel));
kolla("partial semver vägras (16.3)", Boolean(tulkPatchPost({ paket: "next", version: "16.3" }).fel));
kolla("x-range vägras", Boolean(tulkPatchPost({ paket: "next", version: "16.3.x" }).fel));
kolla("version med skal-metatecken vägras", Boolean(tulkPatchPost({ paket: "next", version: "16.3.5; rm -rf /" }).fel));
kolla("version med $( ) vägras", Boolean(tulkPatchPost({ paket: "next", version: "16.3.5$(whoami)" }).fel));
kolla("paketnamn med mellanslag vägras", Boolean(tulkPatchPost({ paket: "next evil", version: "1.0.0" }).fel));
kolla("paketnamn med ; vägras", Boolean(tulkPatchPost({ paket: "next;touch/tmp/x", version: "1.0.0" }).fel));
kolla("paketnamn med $( ) vägras", Boolean(tulkPatchPost({ paket: "$(reboot)", version: "1.0.0" }).fel));
kolla("paketnamn med ../ vägras (path traversal)", Boolean(tulkPatchPost({ paket: "../package", version: "1.0.0" }).fel));
kolla("icke-objekt vägras", Boolean(tulkPatchPost("next@16.3.5").fel));
kolla("saknat paket vägras", Boolean(tulkPatchPost({ version: "1.0.0" }).fel));
kolla("saknad version vägras", Boolean(tulkPatchPost({ paket: "next" }).fel));

console.log("== lasPatchKo: filnivå ==");
kolla("saknad fil = saknas, 0 poster, 0 fel", (() => { const r = lasPatchKo(path.join(TMP, "finns-ej.json"), kanda); return r.saknas && r.poster.length === 0 && r.fel.length === 0; })());
writeFileSync(path.join(TMP, "dallig.json"), "{ inte json");
kolla("ogiltig JSON = fel + 0 poster (VÄGRAR, aldrig tyst)", (() => { const r = lasPatchKo(path.join(TMP, "dallig.json"), kanda); return r.fel.length === 1 && r.poster.length === 0; })());
writeFileSync(path.join(TMP, "objekt.json"), JSON.stringify({ paket: "next", version: "16.3.5" }));
kolla("icke-array vägras", lasPatchKo(path.join(TMP, "objekt.json"), kanda).fel.length === 1);

console.log("== lasPatchKo: leveranskedjeskydd + dedup + tak ==");
writeFileSync(koFil, JSON.stringify([
  { paket: "next", version: "16.3.4" },
  { paket: "next", version: "16.3.5" },
  { paket: "eslint-config-next", version: "16.3.5" },
  { paket: "evil-nyttopaket", version: "1.0.0" },
  { paket: "next", version: "16.3.6; rm -rf /" },
]));
const ko1 = lasPatchKo(koFil, kanda);
kolla("dedup: senaste raden per paket vinner (next → 16.3.5)", ko1.poster.some((p) => p.paket === "next" && p.version === "16.3.5") && ko1.poster.filter((p) => p.paket === "next").length === 1);
kolla("främmande paket vägras + fel rapporteras", !ko1.poster.some((p) => p.paket === "evil-nyttopaket") && ko1.fel.some((f) => f.includes("evil-nyttopaket")));
kolla("injektionspost vägras utan att döda sviten", ko1.fel.some((f) => f.includes("ogiltig version")));
kolla("2 giltiga poster kvar", ko1.poster.length === 2);
kolla("null som känt-uppsättning = ingen paketfiltrering (explicit läge)", lasPatchKo(koFil, null).poster.length === 3);
const manga = Array.from({ length: 12 }, (_, i) => ({ paket: `p${i}`, version: "1.0.0" }));
writeFileSync(koFil, JSON.stringify(manga));
const ko2 = lasPatchKo(koFil, null);
kolla("tak 10 poster + felpåminnelse", ko2.poster.length === 10 && ko2.fel.some((f) => f.includes("för många")));

console.log("== kvitton: roundtrip + aktivPatchPlan ==");
writeFileSync(koFil, JSON.stringify([
  { paket: "next", version: "16.3.5" },
  { paket: "eslint-config-next", version: "16.3.5" },
  { paket: "zod", version: "4.6.5" },
]));
kolla("tom kvittofil-lista när fil saknas", lasPatchKvitton(path.join(TMP, "finns-ej.jsonl")).length === 0);
kolla("plan utan kvitton = alla poster", aktivPatchPlan(ko1, []).length === ko1.poster.length);
// next@16.3.5 ok-kvitterad → borta ur planen
skrivPatchKvitto(kvittoFil, { paket: "next", version: "16.3.5" }, "ok", "test");
kolla("ok-kvitto tar posten ur planen", !aktivPatchPlan(ko1, lasPatchKvitton(kvittoFil)).some((p) => p.paket === "next"));
// eslint-config-next: 2 misslyckade = levande, 3 = död
skrivPatchKvitto(kvittoFil, { paket: "eslint-config-next", version: "16.3.5" }, "misslyckad", "f1");
skrivPatchKvitto(kvittoFil, { paket: "eslint-config-next", version: "16.3.5" }, "misslyckad", "f2");
kolla("2 misslyckade = posten lever (omförsök)", aktivPatchPlan(ko1, lasPatchKvitton(kvittoFil)).some((p) => p.paket === "eslint-config-next"));
skrivPatchKvitto(kvittoFil, { paket: "eslint-config-next", version: "16.3.5" }, "misslyckad", "f3");
kolla("3 misslyckade = död post (loop-skydd)", !aktivPatchPlan(ko1, lasPatchKvitton(kvittoFil)).some((p) => p.paket === "eslint-config-next"));
// versionbyte nollar räkningen: next@16.3.6 är ny post trots next@16.3.5-ok
writeFileSync(koFil, JSON.stringify([{ paket: "next", version: "16.3.6" }]));
const koNy = lasPatchKo(koFil, kanda);
kolla("versionbyte i köfilen = nytt liv (gamla kvitton räknas ej)", aktivPatchPlan(koNy, lasPatchKvitton(kvittoFil)).length === 1);
// ok efter misslyckade = slutgiltigt ok (senaste vinner inte — NÅGON ok räcker)
skrivPatchKvitto(kvittoFil, { paket: "zod", version: "4.6.5" }, "misslyckad", "f1");
skrivPatchKvitto(kvittoFil, { paket: "zod", version: "4.6.5" }, "ok", "andra försöket");
kolla("ok efter misslyckad = posten klar", !aktivPatchPlan(lasPatchKo(koFil, kanda), lasPatchKvitton(kvittoFil)).some((p) => p.paket === "zod"));

console.log("== bedomByggMisslyckande (o49: flock-skiljning + OOM) ==");
kolla("båda loggarna tomma = startade-aldrig (flock -w 900 utan lås)", bedomByggMisslyckande("", "") === "startade-aldrig");
kolla("endast whitespace i loggarna = startade-aldrig", bedomByggMisslyckande("  \n\t", "\n ") === "startade-aldrig");
kolla("saknade loggfiler (undefined) = startade-aldrig (bash >> skapar alltid — barnet körde aldrig)", bedomByggMisslyckande(undefined, undefined) === "startade-aldrig");
kolla("npm ci skrev men byggloggen tom = riktigt-fel (npm ci failade)", bedomByggMisslyckande("added 800 packages in 40s\nnpm error code ELIFECYCLE", "") === "riktigt-fel");
kolla("'Killed' i byggloggen = oom", bedomByggMisslyckande("added 800 packages", "Killed\nnpm error code 134") === "oom");
kolla("'heap out of memory' = oom", bedomByggMisslyckande("ok", "<--- Last few GCs --->\nFATAL ERROR: Reached heap limit — heap out of memory") === "oom");
kolla("'CBKilled' (cgroup-v2 OOM-killern) = oom", bedomByggMisslyckande("ok", "build failed — CBKilled") === "oom");
kolla("vanligt kompileringsfel = riktigt-fel", bedomByggMisslyckande("ok", "Type error: Property 'x' does not exist") === "riktigt-fel");
kolla("'Killed' ENDAST i npmci-loggen räknas inte (citerat i text) = riktigt-fel", bedomByggMisslyckande("Killed in logs", "Type error") === "riktigt-fel");
kolla("null-input hanteras som saknad (sträng-tvång saknas → tomt)", bedomByggMisslyckande(null, null) === "startade-aldrig");

console.log("== bevaraByggLoggar (o49 Kur B: diagnosen överlever /tmp-omskrivningen) ==");
const kalla1 = path.join(TMP, "kalla-npmci.log");
const kalla2 = path.join(TMP, "kalla-build.log");
writeFileSync(kalla1, "npm ci körd 09-17\n");
writeFileSync(kalla2, "Failed to compile.\n./src/app/x.ts:7:22\n");
const bevarMapp = path.join(TMP, "patch-byggfel");
const sparade1 = bevaraByggLoggar(bevarMapp, [[kalla1, "npmci.log"], [kalla2, "build.log"]]);
kolla("båda loggfilerna bevarade", sparade1.length === 2 && sparade1.includes("npmci.log") && sparade1.includes("build.log"));
const bevarFiler = readdirSync(bevarMapp).filter((f) => f.endsWith(".log"));
kolla("tidsstämpel-prefix i filnamnen (ISO med : och . utbytta)", bevarFiler.every((f) => /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d+Z-(npmci|build)\.log$/.test(f)));
kolla("innehållet kopierat ordagrant", bevarFiler.some((f) => readFileSync(path.join(bevarMapp, f), "utf8") === "npm ci körd 09-17\n"));
kolla("idempotens: ny anrop sparar NY uppsättning (raderingar sker aldrig)", (() => { const fore = readdirSync(bevarMapp).length; bevaraByggLoggar(bevarMapp, [[kalla1, "npmci.log"], [kalla2, "build.log"]]); return readdirSync(bevarMapp).length === fore + 2; })());
const sparade2 = bevaraByggLoggar(bevarMapp, [[path.join(TMP, "finns-ej.log"), "spok.log"], [kalla1, "npmci.log"]]);
kolla("saknad källa skippas utan att döda anropet", sparade2.length === 1 && !sparade2.includes("spok.log"));
// OBS (o49-doktrinär lärdom): målet här är ENOTDIR (katalog under en FIL) —
// ALDRIG /proc/…: fs.mkdirSync recursive på procfs SPINNAR i kerneln
// (syscall-storm, empiriskt bevisat 2026-09-17: tre svitprocesser i R-läge,
// stime +227 ticks/3 s, dödade manuellt). ENOTDIR kastar direkt = samma
// kontrakt (omöjlig målmapp → tom lista) utan procfs-fällan.
kolla("omöjlig målmapp = tom lista, ALDRIG undantag", bevaraByggLoggar(path.join(kalla1, "under-fil"), [[kalla1, "npmci.log"]]).length === 0);

console.log("== kvittofilens format (korSynk läser samma rader) ==");
const rader = readFileSync(kvittoFil, "utf8").trim().split("\n");
kolla("alla kvittorader är giltig JSON med ts+paket+version+resultat", rader.every((r) => { const j = JSON.parse(r); return j.ts && j.paket && j.version && (j.resultat === "ok" || j.resultat === "misslyckad"); }));
kolla("ok-kvitto innehåller detalj-fält", JSON.parse(rader[rader.length - 1]).detalj === "andra försöket");

console.log(`\nRESULTAT: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) {
  console.log("FELSAKADE: " + felsakad.join(", "));
  process.exitCode = 1;
}
