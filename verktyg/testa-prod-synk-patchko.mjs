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
 *   · v220: tak på AKTIVA poster (kapAktivPatchPlan EFTER kvittofiltrering)
 *     — kvitterad historik konsumerar inget tak; sanitetsgräns på råa rader
 *     mot buggskrivna köfiler (de SENASTE läses)
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
  kapAktivPatchPlan,
  skrivPatchKvitto,
  bedomByggMisslyckande,
  bevaraByggLoggar,
  byggPatchInstallKommando,
  bedomPatchInstall,
  raknaTsFel,
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
const manga = Array.from({ length: 17 }, (_, i) => ({ paket: `p${i}`, version: "1.0.0" }));
writeFileSync(koFil, JSON.stringify(manga));
const ko2 = lasPatchKo(koFil, null);
kolla("v220: INGET tak på unika filposter — 17 läses hela (historik äter inget tak)", ko2.poster.length === 17 && !ko2.fel.some((f) => f.includes("för många")));
const kap17 = kapAktivPatchPlan(aktivPatchPlan(ko2, []));
kolla("v220: tak 15 på AKTIVA poster + felpåminnelse", kap17.poster.length === 15 && kap17.fel.some((f) => f.includes("för många AKTIVA")));
kolla("v220: aktiv plan ≤ tak lämnas orörd (0 fel)", (() => { const r = kapAktivPatchPlan(aktivPatchPlan(ko2, []).slice(0, 15)); return r.poster.length === 15 && r.fel.length === 0; })());

// v220 mikro-repro av den SKARPA svältningsbuggen (2026-09-29/30): köfil
// med 15 kvitterade poster + 1 NY post sist = 16 unika. o124-koden kapade
// unika > 15 FÖRE kvittofiltrering ⇒ den nya posten svälts tyst (noll
// försök, noll larm — eslint-config-next@16.3.7 i prod just nu). Kuren
// låter historiken passera fritt: planen = endast den nya posten.
const kvittoFilSvalt = path.join(TMP, "svalt-kvitton.jsonl");
const svaltKoRader = [
  ...Array.from({ length: 15 }, (_, i) => ({ paket: `hist-${i}`, version: "1.0.0" })),
  { paket: "ny-patch", version: "2.0.0" },
];
writeFileSync(koFil, JSON.stringify(svaltKoRader));
for (let i = 0; i < 15; i++) skrivPatchKvitto(kvittoFilSvalt, { paket: `hist-${i}`, version: "1.0.0" }, "ok", "historik");
const svaltPlan = kapAktivPatchPlan(aktivPatchPlan(lasPatchKo(koFil, null), lasPatchKvitton(kvittoFilSvalt)));
kolla("v220: 15 kvitterade + 1 ny = planen bär DEN NYA (svältningen kurad)", svaltPlan.poster.length === 1 && svaltPlan.poster[0].paket === "ny-patch" && svaltPlan.fel.length === 0);

// v220: sanitetsgränsen mot buggskrivna köfiler — de SENASTE 1 000 raderna läses
const spok = Array.from({ length: 1001 }, (_, i) => ({ paket: `spok-${i}`, version: "1.0.0" }));
writeFileSync(koFil, JSON.stringify(spok));
const spokKo = lasPatchKo(koFil, null);
kolla("sanitetsgräns: 1 001 rader → 1 000 poster + fel rapporteras", spokKo.poster.length === 1000 && spokKo.fel.some((f) => f.includes("sanitetsgränsen")));
kolla("sanitetsgränsen behåller de SENASTE (spok-0 borta, spok-1000 kvar)", !spokKo.poster.some((p) => p.paket === "spok-0") && spokKo.poster.some((p) => p.paket === "spok-1000"));
writeFileSync(koFil, JSON.stringify(manga)); // återställ fixture för kommande block

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
kolla("tidsstämpel-prefix i filnamnen (ISO med : och . utbytta)", bevarFiler.every((f) => /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d+Z-\d+-(npmci|build)\.log$/.test(f)));
kolla("innehållet kopierat ordagrant", bevarFiler.some((f) => readFileSync(path.join(bevarMapp, f), "utf8") === "npm ci körd 09-17\n"));
kolla("idempotens: ny anrop sparar NY uppsättning (raderingar sker aldrig)", (() => { const fore = readdirSync(bevarMapp).length; bevaraByggLoggar(bevarMapp, [[kalla1, "npmci.log"], [kalla2, "build.log"]]); return readdirSync(bevarMapp).length === fore + 2; })());
// o73: mikro-repro av roten — tight loop utan konstgjord vänting; FÖRE kuren
// krockade 171/200 anropspar (samma ms ⇒ samma filnamn ⇒ copyFileSync
// överskrev). Med monoton sekvens är namnen unika oavsett ms-lott.
kolla("o73 unika filnamn även i tight loop (samma millisekund)", (() => { const unikMapp = path.join(TMP, "patch-byggfel-unik"); const fore = (() => { try { return readdirSync(unikMapp).length; } catch { return 0; } })(); for (let i = 0; i < 30; i++) bevaraByggLoggar(unikMapp, [[kalla1, "npmci.log"]]); const efter = readdirSync(unikMapp); return efter.length === fore + 30 && new Set(efter).size === efter.length; })());
const sparade2 = bevaraByggLoggar(bevarMapp, [[path.join(TMP, "finns-ej.log"), "spok.log"], [kalla1, "npmci.log"]]);
kolla("saknad källa skippas utan att döda anropet", sparade2.length === 1 && !sparade2.includes("spok.log"));
// OBS (o49-doktrinär lärdom): målet här är ENOTDIR (katalog under en FIL) —
// ALDRIG /proc/…: fs.mkdirSync recursive på procfs SPINNAR i kerneln
// (syscall-storm, empiriskt bevisat 2026-09-17: tre svitprocesser i R-läge,
// stime +227 ticks/3 s, dödade manuellt). ENOTDIR kastar direkt = samma
// kontrakt (omöjlig målmapp → tom lista) utan procfs-fällan.
kolla("omöjlig målmapp = tom lista, ALDRIG undantag", bevaraByggLoggar(path.join(kalla1, "under-fil"), [[kalla1, "npmci.log"]]).length === 0);

console.log("== byggPatchInstallKommando (o106: tsc-grinden kedjas i patch-barnet) ==");
const patchCmd = byggPatchInstallKommando("react@19.3.0 react-dom@19.3.0");
kolla("install-delen orörd (spec + flaggor + logg)", patchCmd.startsWith("npm install react@19.3.0 react-dom@19.3.0 --no-audit --no-fund >> /tmp/synk-patch.log 2>&1"));
kolla("tsc-grinden kedjad med && (projektbinär, --noEmit)", patchCmd.endsWith(" && node node_modules/typescript/bin/tsc --noEmit >> /tmp/synk-patch.log 2>&1"));
kolla("ALDRIG npx (deployfönstrets cachedummy-fälla)", !patchCmd.includes("npx"));
kolla("kedjan sekventiell: exakt EN && (tsc körs EFTER install, aldrig parallellt)", (patchCmd.match(/ && /g) || []).length === 1);
kolla("ingen skal-metatecken utöver validerat spec (varken ; eller $()", !patchCmd.includes(";") && !patchCmd.includes("$("));

console.log("== bedomPatchInstall + raknaTsFel (o106: klassning ur barnets logg) ==");
kolla("exit 0 med npm-utdata = ok", bedomPatchInstall(true, "added 4 packages in 12s") === "ok");
kolla("exit 0 med tom logg = ok", bedomPatchInstall(true, "") === "ok");
kolla("exit != 0 med error TS-rader = tsc-fel", bedomPatchInstall(false, "src/x.ts:7:22 - error TS2322: Type 'string' is not assignable to\n") === "tsc-fel");
kolla("exit != 0 utan error TS = install-fel", bedomPatchInstall(false, "npm error code ELIFECYCLE") === "install-fel");
kolla("exit != 0 med tom logg = install-fel (flock-startade-aldrig-klassen)", bedomPatchInstall(false, "") === "install-fel");
kolla("exit != 0 + null-logg = install-fel", bedomPatchInstall(false, null) === "install-fel");
kolla("raknaTsFel räknar flera fel men skippar varningar", raknaTsFel("error TS2322: a\nwarn - b\nerror TS2741: c\n") === 2);
kolla("raknaTsFel kräver felkod med kolon ('error TS' i löp text räknas ej)", raknaTsFel("loggen nämner error TS utan kod") === 0);
kolla("raknaTsFel tål null/undefined", raknaTsFel(null) === 0 && raknaTsFel(undefined) === 0);
kolla("tsc-fel-kvittots loop-skydd: 3 tsc-fel-kvitton dödar posten som idag", (() => {
  const tscKo = { poster: [{ paket: "@types/react", version: "19.3.0" }] };
  const tscKvitton = [
    { paket: "@types/react", version: "19.3.0", resultat: "misslyckad" },
    { paket: "@types/react", version: "19.3.0", resultat: "misslyckad" },
    { paket: "@types/react", version: "19.3.0", resultat: "misslyckad" },
  ];
  return aktivPatchPlan(tscKo, tscKvitton).length === 0;
})());

console.log("== kvittofilens format (korSynk läser samma rader) ==");
const rader = readFileSync(kvittoFil, "utf8").trim().split("\n");
kolla("alla kvittorader är giltig JSON med ts+paket+version+resultat", rader.every((r) => { const j = JSON.parse(r); return j.ts && j.paket && j.version && (j.resultat === "ok" || j.resultat === "misslyckad"); }));
kolla("ok-kvitto innehåller detalj-fält", JSON.parse(rader[rader.length - 1]).detalj === "andra försöket");

console.log(`\nRESULTAT: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) {
  console.log("FELSAKADE: " + felsakad.join(", "));
  process.exitCode = 1;
}
