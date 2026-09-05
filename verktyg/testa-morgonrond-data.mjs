#!/usr/bin/env node
/**
 * AK1A — Test av morgonrondens träff-%-parser
 * (src/components/ak1a/pro/morgonrond-data.ts — B2B-BESLUT §4a kort 1,
 * våg 61 bygg-3). Mönster som verktyg/testa-akm3-kalibrering.mjs:
 *   1. Genererar tmp_morgonrond_koll.ts i repots rot — importerar parsern.
 *   2. Kör den med: npx --yes tsx tmp_morgonrond_koll.ts
 *   3. Skriver ut en svensk rapport på stdout och städar tmp-filen.
 *
 * Kontroller:
 *   A. RIKTIG RAPPORT: lasVagvalideringTraff läser
 *      data/rapporter/vagvalidering-SENASTE.md — totalrad, datering,
 *      räknare-sedan, per-horizontabell med "— (n=0)"-celler som null.
 *   B. FIXTURE (ren tolkning): syntetisk rapport med svensk decimalKomma
 *      ("52,5 % (n=10)") tolkas korrekt; tabellrubrikraden stryks.
 *   C. ÄRLIGHET: text utan totalrad → null; tom text → null; ogiltig
 *      procent ("abc %") i totalrad → null. Motorn gissar aldrig.
 *   D. DETERMINISM (P1): två tolkningar av samma text ⇒ JSON-identiskt.
 *
 * Användning:  node verktyg/testa-morgonrond-data.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { spawnSync } from "node:child_process";
import { unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_TS = path.join(REPO, "tmp_morgonrond_koll.ts");
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// ── 1) Genererad tmp-testfil (TS — körs via npx tsx, raderas efteråt) ───────
// Obs: ingen backticks/${} inuti denna String.raw-literal.
const TS_KOD = String.raw`// tmp_morgonrond_koll.ts — GENERERAD av verktyg/testa-morgonrond-data.mjs. Raderas efter körning.
import { lasVagvalideringTraff, tolkaVagvalideringText } from "./src/components/ak1a/pro/morgonrond-data";

const FIXTUR = [
  "# Vågvalidering — vågmotorns träffhistorik",
  "",
  "**Genererad:** 2026-09-01T08:00:00.000Z · **Protokoll:** vagvalidering/1 v1",
  "**Källor:** test · **Universum:** 3 tickers",
  "**Rullande räknare sedan:** 2026-08-01",
  "",
  "| Horisont | impulsvåg | korrigering | basbygge | osatt klass |",
  "|---|---|---|---|---|",
  "| mikro | 52,5 % (n=10) | 33 % (n=3) | — (n=0) | — (n=0) |",
  "| kort | — (n=0) | 100 % (n=2) | 7 % (n=14) | — (n=0) |",
  "",
  "**Totalt:** 41,5 % träff (n=29 dömda, osatta 12,5 % av alla mätningar) — räknare sedan 2026-08-01.",
].join("\n");

const UTAN_TOTALT = [
  "# Vågvalidering",
  "| mikro | 75 % (n=4) | — (n=0) | 63 % (n=8) | — (n=0) |",
].join("\n");

let ok = 0;
let fail = 0;
function kolla(namn, villkor, detalj) {
  if (villkor) {
    ok += 1;
    console.log("PASS " + namn);
  } else {
    fail += 1;
    console.log("FAIL " + namn + (detalj ? " — " + detalj : ""));
  }
}

// A. Riktiga rapportfilen (finns i repot — cronen skriver den)
const riktig = lasVagvalideringTraff();
kolla("A1 riktig fil tolkas", riktig !== null, "lasVagvalideringTraff = null");
if (riktig) {
  kolla("A2 totaltProcent heltal 0-100", Number.isInteger(riktig.totaltProcent) && riktig.totaltProcent >= 0 && riktig.totaltProcent <= 100, String(riktig.totaltProcent));
  kolla("A3 domda positiva", Number.isInteger(riktig.domda) && riktig.domda > 0, String(riktig.domda));
  kolla("A4 osattaProcent 0-100", Number.isInteger(riktig.osattaProcent) && riktig.osattaProcent >= 0 && riktig.osattaProcent <= 100, String(riktig.osattaProcent));
  kolla("A5 raknareSedan ISO-datum", /^\d{4}-\d{2}-\d{2}$/.test(riktig.raknareSedan), riktig.raknareSedan);
  kolla("A6 fem horisonter, rubrikrad struken", riktig.perHorisont.length === 5 && !riktig.perHorisont.some((h) => h.horisont === "Horisont"), String(riktig.perHorisont.length));
  const mikro = riktig.perHorisont.find((h) => h.horisont === "mikro");
  kolla("A7 mikro-cell läst med n", mikro !== undefined && mikro.impulsvag !== null && typeof mikro.impulsvag.n === "number", JSON.stringify(mikro));
  kolla("A8 genererad stamps", typeof riktig.genererad === "string" && riktig.genererad.includes("T"), riktig.genererad);
}

// B. Fixture med svensk decimalKomma + "—" celler
const fix = tolkaVagvalideringText(FIXTUR);
kolla("B1 fixture tolkas", fix !== null, "null");
if (fix) {
  kolla("B2 komma-decimal avrundas korrekt", fix.totaltProcent === 42 && fix.osattaProcent === 13, fix.totaltProcent + "/" + fix.osattaProcent);
  const mikro = fix.perHorisont.find((h) => h.horisont === "mikro");
  const kort = fix.perHorisont.find((h) => h.horisont === "kort");
  kolla("B3 komma-cell 52,5 -> 53", !!mikro && !!mikro.impulsvag && mikro.impulsvag.procent === 53 && mikro.impulsvag.n === 10, JSON.stringify(mikro && mikro.impulsvag));
  kolla("B4 streckcell blir null", !!mikro && mikro.basbygge === null, JSON.stringify(mikro && mikro.basbygge));
  kolla("B5 kort korrigering 100 %", !!kort && !!kort.korrigering && kort.korrigering.procent === 100 && kort.korrigering.n === 2, JSON.stringify(kort && kort.korrigering));
  kolla("B6 raknareSedan ur raden", fix.raknareSedan === "2026-08-01", fix.raknareSedan);
  kolla("B7 genererad utan millisekund-zon", fix.genererad === "2026-09-01T08:00:00.000Z", fix.genererad);
}

// C. Ärlighet — ogiltiga underlag ger null, aldrig påhittade siffror
kolla("C1 utan totalrad -> null", tolkaVagvalideringText(UTAN_TOTALT) === null);
kolla("C2 tom text -> null", tolkaVagvalideringText("") === null);
kolla("C3 ogiltig procent -> null", tolkaVagvalideringText("**Totalt:** abc % träff (n=x dömda, osatta y %") === null);

// D. Determinism (P1) — två tolkningar JSON-identiska
const d1 = tolkaVagvalideringText(FIXTUR);
const d2 = tolkaVagvalideringText(FIXTUR.split("\n").reverse().reverse().join("\n"));
kolla("D1 determinism", JSON.stringify(d1) === JSON.stringify(d2));

console.log("");
console.log("SUMMA: " + ok + " PASS, " + fail + " FAIL");
process.exit(fail === 0 ? 0 : 1);
`;

writeFileSync(TMP_TS, TS_KOD, "utf8");

// ── 2) Kör tmp-filen ─────────────────────────────────────────────────────────
try {
  // Windows + mellanslag i sökvägen: args-array + shell delar vid blanksteg —
  // därför EN citerad kommandosträng (repot ligger under "Workstation Z G4").
  const kommando = `npx --yes tsx "${TMP_TS}"`;
  const res = spawnSync(kommando, {
    cwd: REPO,
    stdio: "inherit",
    timeout: TIMEOUT_MS,
    shell: true,
  });
  const slutkod = res.status ?? 1;
  if (slutkod !== 0) {
    console.error("testa-morgonrond-data: FAIL (avslutskod " + slutkod + ")");
    process.exit(1);
  }
  console.log("testa-morgonrond-data: ALLT PASS");
  process.exit(0);
} finally {
  try {
    unlinkSync(TMP_TS);
  } catch {
    // tmp-filen fanns inte — inget att städa
  }
}
