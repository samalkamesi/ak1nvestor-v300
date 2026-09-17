#!/usr/bin/env node
/**
 * AK1A — Testsvit för portföljuppföljningen (src/lib/portfolj-forskning/uppfoljning.ts).
 *
 * Fem tester enligt direktivet (node kan inte importera TS direkt — samma mönster
 * som verktyg/testa-riskportfolj.mjs):
 *   (a) SKAPASNAPSHOT: delta-räkning mot tidigare snapshot (pris i procent,
 *       AKM1 i poäng), null utan tidigare mätning, sanitring av ogiltiga
 *       vågklasser → "osatt", datum härleds ur senastKontrollerad.
 *   (b) JAMFORDÅNU: 3 tickers × 2 tillfällen — AKM1-delta, vågklassbyten per
 *       horisont (fundamental + teknisk) hittas exakt, pris-% räknas rätt.
 *   (c) BETYDELSEGRAD: AKM1-delta ≥ 10 → "stor"; vågklassbyte på lång/mega →
 *       "stor"; byte på kort/medellång → "man"; pris ±20 % → "man"; mikro-byte
 *       och oförändrat → "liten"; första mätningen → "liten".
 *   (d) NOTISTEXTER: max 3 per portfölj, de 2 största + sammanfattning,
 *       väsentlighetsräkning i texten, ALDRIG köp/sälj-formuleringar.
 *   (e) DETERMINISM + beslutaIntervall-gränser: två körningar JSON-identiska;
 *       manad 29 dagar = false / 30 = true / 31 = true; kvartal 89 = false /
 *       90 = true / 92 = true; saknat datum = true.
 *
 * Användning:  node verktyg/testa-uppfoljning.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_KAT = path.join(REPO, ".tmp");
const TMP_NAMN = "tmp_uppfoljning_test.ts";
const TMP = path.join(TMP_KAT, TMP_NAMN);
const MARK_START = "===UPPFOLJNING_JSON_START===";
const MARK_END = "===UPPFOLJNING_JSON_END===";

// ── Genererad tmp-testfil (TS, körs via npx tsx, raderas efteråt) ─────────────
// OBS: inga backticks i koden nedan (den ligger själv i en template-literal).
// OBS: å/ä/ö skrivs som RIKTIGA tecken — unicode-escapes är ogiltiga i
// TS-identifierare ( jamforDåNu ) och riskerar förvirring i strängar.
const TS_KOD = String.raw`
// tmp_uppfoljning_test.ts — GENERERAD av verktyg/testa-uppfoljning.mjs. Raderas efter körning.
import {
  skapaSnapshot, jamforDåNu, raknaNotisTexter, beslutaIntervall,
  AKM1_STOR_DELTA, PRIS_MAN_TROSKEL, INTERVALL_DAGAR, MAX_NOTISTEXTER,
} from "../src/lib/portfolj-forskning/uppfoljning";
import type {
  Bransch, Horisont, KorstabbellRad, UppfoljningSnapshot, VagKlass,
} from "../src/lib/portfolj-forskning/typer";

const MARK_START = "===UPPFOLJNING_JSON_START===";
const MARK_END = "===UPPFOLJNING_JSON_END===";
const HZ: Horisont[] = ["mikro", "kort", "medellang", "lang", "mega"];

type TestRad = { test: string; namn: string; ok: boolean; detalj: string };
const RADER: TestRad[] = [];
function kolla(test: string, namn: string, ok: boolean, detalj = ""): void {
  RADER.push({ test: test, namn: namn, ok: !!ok, detalj: detalj });
}
function v5(a: VagKlass, b: VagKlass, c: VagKlass, d: VagKlass, e: VagKlass): Record<Horisont, VagKlass> {
  return { mikro: a, kort: b, medellang: c, lang: d, mega: e };
}
function snap(
  ticker: string, datum: string, akm1: number, pris: number | null,
  f: Record<Horisont, VagKlass>, t: Record<Horisont, VagKlass>
): UppfoljningSnapshot {
  return {
    ticker: ticker, datum: datum, akm1Totalt: akm1, fvagPerHorisont: f, tvagPerHorisont: t,
    pris: pris, forandringPris: null, forandringAkm1: null,
  };
}
function rad(
  ticker: string, akm1: number, senast: string,
  f: Record<Horisont, VagKlass>, t: Record<Horisont, VagKlass>
): KorstabbellRad {
  return {
    ticker: ticker, namn: "Test " + ticker, bransch: "teknik" as Bransch, akm1Totalt: akm1,
    akm1PerKategori: {}, fvagPerHorisont: f, fvagDynamik: "osatt", tvagPerHorisont: t,
    golvMarginal: null, senastKontrollerad: senast, status: "osatt" as const,
  };
}

// ═══ (a) skapaSnapshot ═══════════════════════════════════════════════════════

const grundF = v5("impulsvag", "basbygge", "impulsvag", "basbygge", "basbygge");
const grundT = v5("basbygge", "impulsvag", "basbygge", "basbygge", "osatt");

const s0 = skapaSnapshot(rad("SIM-UPP", 82, "2026-09-01", grundF, grundT), 112, undefined);
kolla("a", "utan tidigare: forandringPris = null", s0.forandringPris === null);
kolla("a", "utan tidigare: forandringAkm1 = null", s0.forandringAkm1 === null);
kolla("a", "datum härleds ur senastKontrollerad", s0.datum === "2026-09-01", s0.datum);
kolla("a", "pris och AKM1 kopieras", s0.pris === 112 && s0.akm1Totalt === 82);
kolla("a", "vågstatus har alla 5 horisonter",
  HZ.every((h) => s0.fvagPerHorisont[h] !== undefined && s0.tvagPerHorisont[h] !== undefined));

const tidigare = snap("SIM-UPP", "2026-08-01", 82, 100, grundF, grundT); // AKM1 82, pris 100
const s1 = skapaSnapshot(rad("SIM-UPP", 74, "2026-09-01", grundF, grundT), 112, tidigare);
kolla("a", "pris-% mot tidigare: 100 → 112 = +0,12",
  s1.forandringPris !== null && Math.abs(s1.forandringPris - 0.12) < 1e-12, String(s1.forandringPris));
kolla("a", "AKM1-delta mot tidigare: 82 → 74 = -8",
  s1.forandringAkm1 !== null && Math.abs(s1.forandringAkm1 - (-8)) < 1e-12, String(s1.forandringAkm1));
kolla("a", "tidigare pris 0 → forandringPris null (ej delat med noll)",
  skapaSnapshot(rad("X", 50, "2026-09-01", grundF, grundT), 10, { ...tidigare, pris: 0 }).forandringPris === null);

const fulRad = rad("SIM-FUL", 70, "2026-09-01",
  { mikro: "impulsvåg" as unknown as VagKlass, kort: "korrigering", medellang: "basbygge", lang: "impulsvag", mega: undefined as unknown as VagKlass },
  v5("osatt", "osatt", "osatt", "osatt", "osatt"));
const sFul = skapaSnapshot(fulRad, null, undefined);
kolla("a", "ogiltig vågklass (med å) och saknad nyckel → osatt",
  sFul.fvagPerHorisont.mikro === "osatt" && sFul.fvagPerHorisont.mega === "osatt" &&
  sFul.fvagPerHorisont.lang === "impulsvag" && sFul.fvagPerHorisont.kort === "korrigering");
kolla("a", "pris null → forandringPris null även med tidigare",
  skapaSnapshot(fulRad, null, { ...tidigare, pris: 100 }).forandringPris === null);

// ═══ (b) + (c) jamforDåNu — 3 tickers × 2 tillfällen (+2 riktade fall) ════════

// SIM-UPP: AKM1 72 → 85 ( delta 13 ≥ 10 ) → STOR.
const daUPP = snap("SIM-UPP", "2026-05-31", 72, 100, grundF, grundT);
const nuUPP = snap("SIM-UPP", "2026-08-31", 85, 105, grundF, grundT);

// SIM-VAG: fundamental byte på MEGA ( impulsvag → korrigering ) → STOR;
// teknisk byte på kort; pris +20 % ( 200 → 240 ).
const daVAG = snap("SIM-VAG", "2026-05-31", 80, 200,
  v5("impulsvag", "impulsvag", "basbygge", "impulsvag", "impulsvag"),
  v5("basbygge", "basbygge", "basbygge", "basbygge", "osatt"));
const nuVAG = snap("SIM-VAG", "2026-08-31", 82, 240,
  v5("impulsvag", "impulsvag", "basbygge", "impulsvag", "korrigering"),
  v5("basbygge", "impulsvag", "basbygge", "basbygge", "osatt"));

// SIM-MAN: teknisk byte på MEDELLÅNG ( korrigering → basbygge ) + pris
// +22 % ( 50 → 61 ) → MAN; AKM1 i princip oförändrad.
const daMAN = snap("SIM-MAN", "2026-05-31", 78, 50, grundF,
  v5("basbygge", "basbygge", "korrigering", "basbygge", "osatt"));
const nuMAN = snap("SIM-MAN", "2026-08-31", 79, 61, grundF,
  v5("basbygge", "basbygge", "basbygge", "basbygge", "osatt"));

// SIM-STILL: identisk bild + endast mikro-byte → LITEN.
const daSTILL = snap("SIM-STILL", "2026-05-31", 70, 100, grundF,
  v5("basbygge", "basbygge", "basbygge", "basbygge", "basbygge"));
const nuSTILL = snap("SIM-STILL", "2026-08-31", 71, 103, grundF,
  v5("impulsvag", "basbygge", "basbygge", "basbygge", "basbygge"));

// SIM-FORSTA: finns bara i NU → delta null, LITEN ( första mätningen ).
const nuFORSTA = snap("SIM-FORSTA", "2026-08-31", 66, 42, grundF, grundT);

const daLista = [daUPP, daVAG, daMAN, daSTILL];
const nuLista = [nuUPP, nuVAG, nuMAN, nuSTILL, nuFORSTA];
const j = jamforDåNu(nuLista, daLista);
const J = new Map(j.map((x) => [x.ticker, x]));

kolla("b", "en jämförelse per ny ticker ( 5 st )", j.length === 5, String(j.length));
kolla("b", "AKM1-delta SIM-UPP = 13", (J.get("SIM-UPP")?.akm1Delta ?? NaN) === 13);
kolla("b", "AKM1-delta SIM-VAG = 2", (J.get("SIM-VAG")?.akm1Delta ?? NaN) === 2);
kolla("b", "AKM1-delta SIM-FORSTA = null ( ingen då-mätning )", J.get("SIM-FORSTA")?.akm1Delta == null);
kolla("b", "pris-% SIM-VAG = +0,20",
  Math.abs((J.get("SIM-VAG")?.prisForandring ?? NaN) - 0.2) < 1e-12, String(J.get("SIM-VAG")?.prisForandring));
kolla("b", "pris-% SIM-MAN = +0,22",
  Math.abs((J.get("SIM-MAN")?.prisForandring ?? NaN) - 0.22) < 1e-12, String(J.get("SIM-MAN")?.prisForandring));
kolla("b", "SIM-VAG: fundamental byte på mega hittad ( impulsvag → korrigering )",
  (J.get("SIM-VAG")?.vagbytes ?? []).some(
    (b) => b.typ === "fundamental" && b.horisont === "mega" && b.fran === "impulsvag" && b.till === "korrigering"));
kolla("b", "SIM-VAG: teknisk byte på kort hittad ( basbygge → impulsvag )",
  (J.get("SIM-VAG")?.vagbytes ?? []).some(
    (b) => b.typ === "teknisk" && b.horisont === "kort" && b.fran === "basbygge" && b.till === "impulsvag"));
kolla("b", "SIM-MAN: exakt ett vågbyte ( teknisk medellång )",
  (J.get("SIM-MAN")?.vagbytes ?? []).length === 1 &&
  J.get("SIM-MAN")!.vagbytes[0].typ === "teknisk" && J.get("SIM-MAN")!.vagbytes[0].horisont === "medellang");
kolla("b", "SIM-UPP: inga vågbytes ( oförändrad bild )", (J.get("SIM-UPP")?.vagbytes ?? []).length === 0);

kolla("c", "AKM1-delta 13 → stor", J.get("SIM-UPP")?.betydelse === "stor", String(J.get("SIM-UPP")?.betydelse));
kolla("c", "fundamental byte på mega → stor", J.get("SIM-VAG")?.betydelse === "stor", String(J.get("SIM-VAG")?.betydelse));
kolla("c", "teknisk byte på medellång + pris +22 % → man", J.get("SIM-MAN")?.betydelse === "man", String(J.get("SIM-MAN")?.betydelse));
kolla("c", "endast mikro-byte + pris +3 % → liten", J.get("SIM-STILL")?.betydelse === "liten", String(J.get("SIM-STILL")?.betydelse));
kolla("c", "första mätningen → liten", J.get("SIM-FORSTA")?.betydelse === "liten", String(J.get("SIM-FORSTA")?.betydelse));

// Gränsvärden: AKM1-delta exakt 10 → stor; pris exakt ±20 % → man.
const daGRANS = snap("SIM-GRANS", "2026-05-31", 70, 100, grundF, grundT);
const nuGRANS = snap("SIM-GRANS", "2026-08-31", 80, 120, grundF, grundT);
kolla("c", "AKM1-delta exakt " + AKM1_STOR_DELTA + " → stor",
  jamforDåNu([nuGRANS], [daGRANS])[0].betydelse === "stor");
const nuGRANS2 = snap("SIM-GRANS2", "2026-08-31", 71, 120, grundF, grundT);
const daGRANS2 = snap("SIM-GRANS2", "2026-05-31", 71, 100, grundF, grundT);
kolla("c", "pris exakt +20 % ( tröskel " + PRIS_MAN_TROSKEL + " ) → man",
  jamforDåNu([nuGRANS2], [daGRANS2])[0].betydelse === "man");

// ═══ (d) raknaNotisTexter ════════════════════════════════════════════════════

const texter = raknaNotisTexter(j, "Balanserad Bas");
kolla("d", "max " + MAX_NOTISTEXTER + " notistexter", texter.length <= MAX_NOTISTEXTER && texter.length > 0, String(texter.length));
kolla("d", "3 väsentliga förändringar → 2 detaljer + 1 sammanfattning = 3",
  texter.length === 3, String(texter.length));
kolla("d", "sammanfattningen räknar väsentliga förändringar",
  texter[texter.length - 1].includes("3 väsentliga förändringar"), texter[texter.length - 1].slice(0, 80));
kolla("d", "största förändringen ( SIM-UPP ) först i notiserna", texter[0].startsWith("SIM-UPP:"), texter[0].slice(0, 30));
kolla("d", "ALDRIG köp/sälj/uppmaning i någon text",
  texter.every((t) => !/köp|sälj|rekommenderar|agera nu/i.test(t)));
kolla("d", "texterna beskriver då mot nu",
  texter.some((t) => /mot \d+ senast/.test(t)) && texter[texter.length - 1].includes("då mot nu"));

const texterLugn = raknaNotisTexter(
  jamforDåNu([snap("SIM-LUGN", "2026-08-31", 70, 100, grundF, grundT)],
                  [snap("SIM-LUGN", "2026-05-31", 70, 101, grundF, grundT)]),
  "Lugna Lista");
kolla("d", "inga väsentliga förändringar → endast sammanfattning",
  texterLugn.length === 1 && texterLugn[0].includes("inga väsentliga förändringar"), String(texterLugn.length));
kolla("d", "tom portföljsbild → ändå en värmande sammanfattning",
  raknaNotisTexter([], "Tom").length === 1);
kolla("d", "portföljnamn saknas → fallback utan undefined i texten",
  !raknaNotisTexter(j, "").some((t) => t.includes("undefined")));

// ═══ (e) determinism + beslutaIntervall ══════════════════════════════════════

kolla("e", "jamforDåNu deterministisk",
  JSON.stringify(jamforDåNu(nuLista, daLista)) === JSON.stringify(j));
kolla("e", "skapaSnapshot deterministisk",
  JSON.stringify(skapaSnapshot(rad("SIM-UPP", 74, "2026-09-01", grundF, grundT), 112, tidigare)) === JSON.stringify(s1));
kolla("e", "raknaNotisTexter deterministisk",
  JSON.stringify(raknaNotisTexter(j, "Balanserad Bas")) === JSON.stringify(texter));
kolla("e", "ordning på indata påverkar inte per-ticker-resultat",
  JSON.stringify(jamforDåNu([...nuLista].reverse(), [...daLista].reverse()).sort((a, b) => (a.ticker < b.ticker ? -1 : 1))) ===
  JSON.stringify([...j].sort((a, b) => (a.ticker < b.ticker ? -1 : 1))));

kolla("e", "manad: 29 dagar = false", beslutaIntervall("2026-07-03", "manad", "2026-08-01") === false);
kolla("e", "manad: 30 dagar = true ( gräns )", beslutaIntervall("2026-06-30", "manad", "2026-07-30") === true);
kolla("e", "manad: 31 dagar = true", beslutaIntervall("2026-07-01", "manad", "2026-08-01") === true);
kolla("e", "kvartal: 89 dagar = false", beslutaIntervall("2026-06-03", "kvartal", "2026-08-31") === false);
kolla("e", "kvartal: 90 dagar = true ( gräns )", beslutaIntervall("2026-06-02", "kvartal", "2026-08-31") === true);
kolla("e", "kvartal: 92 dagar = true", beslutaIntervall("2026-05-31", "kvartal", "2026-08-31") === true);
kolla("e", "saknat senasteDatum = true ( första mätningen )",
  beslutaIntervall(null, "manad", "2026-08-01") === true && beslutaIntervall("", "kvartal", "2026-08-01") === true);
kolla("e", "ogiltigt datum = true ( mät hellre än gissa )", beslutaIntervall("31/07/2026", "manad", "2026-08-01") === true);
kolla("e", "framtida datum = false ( ej negativ ålder )", beslutaIntervall("2026-09-01", "manad", "2026-08-01") === false);
kolla("e", "INTERVALL_DAGAR-kontrakt: manad 30, kvartal 90",
  INTERVALL_DAGAR.manad === 30 && INTERVALL_DAGAR.kvartal === 90);

// ── Utdata ──────────────────────────────────────────────────────────────────
const totalt = RADER.length;
const fail = RADER.filter((r) => !r.ok).length;
console.log(MARK_START);
console.log(JSON.stringify({ rader: RADER, totalt: totalt, fail: fail }));
console.log(MARK_END);
`;

// ── Kör tmp-filen via tsx och tolka JSON-blocket ─────────────────────────────
// .tmp/ = våg 150:s gitignorerade engångsyta, tsconfig-exkluderad (o44).
let resultat = null;
try {
  mkdirSync(TMP_KAT, { recursive: true });
  writeFileSync(TMP, TS_KOD, "utf8");
  const proc = spawnSync("npx", ["--yes", "tsx", ".tmp/" + TMP_NAMN], {
    cwd: REPO,
    shell: true,
    encoding: "utf8",
    timeout: 180000,
    env: { ...process.env, NO_COLOR: "1" },
  });
  const ut = proc.stdout ?? "";
  const start = ut.indexOf(MARK_START);
  const end = ut.indexOf(MARK_END);
  if (start >= 0 && end > start) {
    resultat = JSON.parse(ut.slice(start + MARK_START.length, end).trim());
  } else {
    console.error("Kunde inte läsa JSON-block från testkörningen.");
    console.error("--- stdout (första 3000 tecknen) ---");
    console.error(ut.slice(0, 3000));
    console.error("--- stderr (första 3000 tecknen) ---");
    console.error((proc.stderr ?? "").slice(0, 3000));
    process.exitCode = 1;
  }
} catch (fel) {
  console.error("Testkörningen misslyckades: " + (fel && fel.message ? fel.message : String(fel)));
  process.exitCode = 1;
} finally {
  try {
    unlinkSync(TMP);
  } catch {
    /* tmp-filen fanns inte — ignoreras */
  }
}

// ── Rapport ──────────────────────────────────────────────────────────────────
if (resultat) {
  console.log("");
  console.log("AK1A PORTFÖLJUPPFÖLJNING — TESTSVIT (skapaSnapshot · jamforDåNu · betydelsegrad · notisTexter · intervall)");
  console.log("=".repeat(100));
  for (const r of resultat.rader) {
    const status = r.ok ? "PASS" : "FAIL";
    const detalj = r.detalj ? "  — " + r.detalj : "";
    console.log("[" + status + "] (" + r.test + ") " + r.namn + detalj);
  }
  console.log("=".repeat(100));
  const pass = resultat.totalt - resultat.fail;
  console.log("Resultat: " + pass + " PASS / " + resultat.fail + " FAIL av " + resultat.totalt + " kontroller.");
  if (resultat.fail > 0) process.exitCode = 1;
}
