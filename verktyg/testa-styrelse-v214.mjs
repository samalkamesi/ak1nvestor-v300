#!/usr/bin/env node
/**
 * VÅG 214 — KONTRAKTSTEST: PER-ÅTGÄRDS R2-STÄNGSEL (deterministisk modulsvit).
 *
 * Till skillnad från testa-styrelse.mjs (E2E mot dev-fönster, mötesutfall
 * kontextberoende) bevisar denna svit stängslets KÄRNA deterministiskt mot
 * modulens exporter: klassaExistential + EXISTENTIELLA_NYCKELORD.
 *
 * R108-ROTFALLET reproduceras: ett drift-mekaniskt möte (kärna utan R2-ord)
 * med EN åtgärd som rör R2-domän — mötet ska KUNNA KÖRS DIREKT medan
 * just den åtgärden klassas existential=true (stängs in sig själv).
 *
 * Kontroller:
 *   V1  KÄRNAN styr: R2-träff i beslut+motivering ⇒ existential=true
 *       med träffat nyckelord rapporterat.
 *   V2  PER-ÅTGÄRD (R108-fallet): kärna utan träff ⇒ false, medan en
 *       syskonåtgärd med R2-ord ⇒ true och en drift-mekanisk ⇒ false.
 *   V3  NEGATION: finans-/driftspråk ("höja kvaliteten", "klassordning")
 *       ger INGEN träff — överklassning sker bara på verkliga R2-ord.
 *   V4  LISTINTEGRITET: EXISTENTIELLA_NYCKELORD tom-strängfritt och
 *       gemener (matchningen lowercasar — stora bokstäver i listan vore
 *       döda poster).
 *
 * Körs med: node verktyg/testa-styrelse-v214.mjs (ingen server, <2 s).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { importeraTs } from "./ts-import.mjs";

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, "..");

// Kanonisk brygga (V213b): löser @/-alias + extensionless importer i .ts.
const { klassaExistential, EXISTENTIELLA_NYCKELORD } = await importeraTs("src/lib/studio/styrelse.ts");

let fallen = 0;
function kontroll(namn, ok, detalj = "") {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${namn}${detalj ? ` — ${detalj}` : ""}`);
  if (!ok) fallen += 1;
}

// V1 — kärnan: R2-träff i beslut+motivering ⇒ hela mötet klassas existential
const v1 = klassaExistential([
  "Styrelsen beslutar att flytta sajten till ny domän hos annan registrar.",
  "Motivering: driftsäkerheten kräver flytten.",
]);
kontroll(
  "V1 kärnträff ⇒ existential=true med nyckelord rapporterat",
  v1.existential === true && v1.traffadeNyckelord.length > 0 && v1.traffadeNyckelord.includes("domän"),
  `träffade: ${v1.traffadeNyckelord.join(", ")}`,
);

// V2 — R108-fallet: kärnan mekanisk, EN åtgärd R2, syskon drift-mekaniskt
const karna = klassaExistential([
  "Styrelsen beslutar att köra nästa kvalitetssvep i aggregatorns klassordning.",
  "Motivering: billigaste sviterna först ger snabbast återkoppling.",
]);
const atgardR2 = klassaExistential(["Rotera dev-api-nyckel i testfönstret innan nästa svep"]);
const atgardMekanisk = klassaExistential(["Kör testaggregatorn med --klass=tung och arkivera rapporten"]);
kontroll(
  "V2 R108-fallet: kärna false + R2-åtgärd true + mekaniskt syskon false",
  karna.existential === false && atgardR2.existential === true && atgardMekanisk.existential === false,
  `kärna=${String(karna.existential)} · R2-åtgärd=${String(atgardR2.existential)} (${atgardR2.traffadeNyckelord.join(", ")}) · syskon=${String(atgardMekanisk.existential)}`,
);

// V3 — negation: finans-/driftspråk träffas inte
const v3 = klassaExistential(["Höja kvaliteten på sviterna och hålla klassordningen intakt"]);
kontroll(
  "V3 negation: driftspråk ger ingen träff",
  v3.existential === false && v3.traffadeNyckelord.length === 0,
  `träffade: ${v3.traffadeNyckelord.join(", ") || "(ingen)"}`,
);

// V4 — listintegritet: inga tomma poster, allt gemener
const tomma = EXISTENTIELLA_NYCKELORD.filter((k) => k.trim() === "").length;
const stora = EXISTENTIELLA_NYCKELORD.filter((k) => k !== k.toLowerCase()).length;
kontroll(
  "V4 nyckelordslistan intakt (0 tomma, 0 versalposter)",
  tomma === 0 && stora === 0,
  `${String(EXISTENTIELLA_NYCKELORD.length)} nyckelord · tomma=${String(tomma)} · versaler=${String(stora)}`,
);

// ── Sammanfattning ───────────────────────────────────────────────────────────
const manifestRad = readFileSync(join(ROT, "src", "lib", "studio", "styrelse.ts"), "utf8");
kontroll(
  "V5 motorn bär v214-stängslet (atgardKlassning i källan)",
  manifestRad.includes("atgardKlassning") && manifestRad.includes("⚠ VÄNTAR KUND"),
  "AtgardKlassning-typ + ⚠-rad kontrakt närvarande i styrelse.ts",
);

console.log(fallen > 0 ? `\nSAMMANFATTNING: FAIL (${String(fallen)} kontroll(er) föll)` : "\nSAMMANFATTNING: PASS (v214-stängslets kontrakt bevisat deterministiskt)");
process.exit(fallen > 0 ? 1 : 0);
