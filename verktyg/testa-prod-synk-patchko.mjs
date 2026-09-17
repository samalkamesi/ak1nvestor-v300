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
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  tulkPatchPost,
  lasPatchKo,
  lasPatchKvitton,
  aktivPatchPlan,
  skrivPatchKvitto,
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

console.log("== kvittofilens format (korSynk läser samma rader) ==");
const rader = readFileSync(kvittoFil, "utf8").trim().split("\n");
kolla("alla kvittorader är giltig JSON med ts+paket+version+resultat", rader.every((r) => { const j = JSON.parse(r); return j.ts && j.paket && j.version && (j.resultat === "ok" || j.resultat === "misslyckad"); }));
kolla("ok-kvitto innehåller detalj-fält", JSON.parse(rader[rader.length - 1]).detalj === "andra försöket");

console.log(`\nRESULTAT: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) {
  console.log("FELSAKADE: " + felsakad.join(", "));
  process.exitCode = 1;
}
