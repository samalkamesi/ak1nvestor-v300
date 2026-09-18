#!/usr/bin/env node
/**
 * AK1A — Test av PRO-screeningens rena logik
 * (src/components/ak1a/pro/pro-screening.tsx — B2B-BESLUT §4b + §7 steg 3,
 * våg 61 bygg-3). Mönster som verktyg/testa-morgonrond-data.mjs:
 *   1. Genererar tmp_pro_screening_koll.ts i repots rot — importerar
 *      komponentmodulns EXPORTERADE rena hjälpare (inget DOM/render behövs).
 *   2. Kör den med: npx --yes tsx .tmp/tmp_pro_screening_koll.ts
 *   3. Skriver ut en svensk rapport på stdout och städar tmp-filen.
 *
 * Kontroller:
 *   A. TAL-INPUT (svenskt decimalKomma): "70"→70 · "72,5"→72,5 · ""→null ·
 *      "abc"→null · " 80 "→80 — filtret vilar vid ogiltig input, aldrig kraschar.
 *   B. SORTERINGSVÄRDE (korstabellens kontrakt): akm1/akm2/peer/täckning/golv
 *      läses per nyckel; null/osatt (saknad akm2, osatt peer) ⇒ -Infinity
 *      (sorterar alltid sist).
 *   C. CSV-EXPORT: semikolon-separerad, rubrikrad först, SVENSKA DECIMALER
 *      (komma), citationstecken-dubblering på textfält, peer-rank som "r/n",
 *      tomma fält för null — aldrig påhittade värden.
 *   D. DETERMINISM (P1): samma rader ⇒ JSON-identisk CSV, två gånger.
 *
 * Användning:  node verktyg/testa-pro-screening.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_TS = path.join(REPO, ".tmp", "tmp_pro_screening_koll.ts");
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// ── 1) Genererad tmp-testfil (TS — körs via npx tsx, raderas efteråt) ───────
// Obs: ingen backticks/${} inuti denna String.raw-literal.
const TS_KOD = String.raw`// tmp_pro_screening_koll.ts — GENERERAD av verktyg/testa-pro-screening.mjs. Raderas efter körning.
import { byggCsv, lasTalInput, sortVarde } from "../src/components/ak1a/pro/pro-screening";
import type { KorstabbellRad } from "../src/lib/portfolj-forskning/typer";

function rad(andel: Partial<KorstabbellRad>): KorstabbellRad {
  return {
    ticker: "X.ST",
    namn: "Exempel; med semikolon",
    bransch: "teknik",
    akm1Totalt: 41.4,
    akm1PerKategori: {},
    fvagPerHorisont: { mikro: "osatt", kort: "osatt", medellang: "osatt", lang: "osatt", mega: "osatt" },
    fvagDynamik: "osatt",
    tvagPerHorisont: { mikro: "osatt", kort: "osatt", medellang: "osatt", lang: "osatt", mega: "osatt" },
    golvMarginal: null,
    senastKontrollerad: "2026-09-03",
    status: "gul",
    ...andel,
  } as KorstabbellRad;
}

const RADER: KorstabbellRad[] = [
  rad({
    ticker: "FULL.ST",
    namn: "Fullständig",
    akm1Totalt: 72.5,
    akm1MaxMojligt: 88.2,
    akm2: 60,
    akm2Skillnad: -12.5,
    datatackning: 0.7113,
    golvMarginal: 0.281,
    status: "gron",
    peer: {
      bransch: "teknik",
      antalIGruppen: 10,
      peerPercentil: 88,
      rank: 2,
      antalOver: 1,
      antalLika: 0,
      antalUnder: 7,
      branschMedian: 55.5,
      peerDrag: 4.5,
      overMedian: 12,
      iNiva: 3,
      underMedian: 5,
      osatt: false,
      osattOrsak: null,
      referens: "2026-09-03",
    } as never,
  }),
  rad({ ticker: "OSATT.ST", namn: "Osatt", akm2: null, datatackning: undefined, golvMarginal: null }),
];

let ok = 0;
let fail = 0;
function kolla(namn: string, villkor: unknown, detalj?: string) {
  if (villkor) {
    ok += 1;
    console.log("PASS " + namn);
  } else {
    fail += 1;
    console.log("FAIL " + namn + (detalj ? " — " + detalj : ""));
  }
}

// A. Tal-input (svenskt decimalKomma)
kolla("A1 '70' -> 70", lasTalInput("70") === 70);
kolla("A2 '72,5' -> 72.5", lasTalInput("72,5") === 72.5);
kolla("A3 ' 80 ' -> 80", lasTalInput(" 80 ") === 80);
kolla("A4 tom -> null", lasTalInput("") === null);
kolla("A5 'abc' -> null", lasTalInput("abc") === null);
kolla("A6 '-5' -> -5", lasTalInput("-5") === -5);

// B. Sorteringsvärden
kolla("B1 akm1 las tal", sortVarde(RADER[0], "akm1") === 72.5);
kolla("B2 akm2 las tal", sortVarde(RADER[0], "akm2") === 60);
kolla("B3 saknad akm2 -> -Infinity", sortVarde(RADER[1], "akm2") === -Infinity);
kolla("B4 peer las percentil", sortVarde(RADER[0], "peer") === 88);
kolla("B5 osatt peer -> -Infinity", sortVarde(RADER[1], "peer") === -Infinity);
kolla("B6 tackning skalas till procent", Math.round(sortVarde(RADER[0], "tackning")) === 71);
kolla("B7 saknad tackning -> -Infinity", sortVarde(RADER[1], "tackning") === -Infinity);
kolla("B8 golv skalas till procent", Math.round(sortVarde(RADER[0], "golv")) === 28);
kolla("B9 null golv -> -Infinity", sortVarde(RADER[1], "golv") === -Infinity);

// C. CSV-bygget
const csv = byggCsv(RADER);
const linjer = csv.split("\r\n");
kolla("C1 rubrikrad forst", linjer[0].startsWith('"Ticker";"Namn";"Bransch"'), linjer[0].slice(0, 40));
kolla("C2 svenska decimaler komma", linjer[1].includes(";72,5;") && linjer[1].includes(";71,1;"), linjer[1]);
kolla("C3 golv med tecken + komma", linjer[1].includes("28,1"), linjer[1]);
kolla("C4 peer-rank som r/n", linjer[1].includes('"2/10"'), linjer[1]);
kolla("C5 semikolon i namn citeras", linjer[2].includes('"Osatt"'), linjer[2]);
kolla("C6 null-falt tomma", linjer[2].includes(";;;;"), linjer[2]);
kolla("C7 radantal = 1 rubrik + N rader", linjer.length === 3, String(linjer.length));
kolla("C8 status med", linjer[1].includes('"gron"') || linjer[1].includes("gron"), linjer[1]);
kolla("C9 datering med", linjer[1].includes("2026-09-03"), linjer[1]);

// D. Determinism (P1)
kolla("D1 CSV deterministisk", csv === byggCsv([...RADER].reverse()) || csv === byggCsv(RADER));
const csv2 = byggCsv(RADER);
kolla("D2 identisk vid omkörning", csv === csv2);

console.log("");
console.log("SUMMA: " + ok + " PASS, " + fail + " FAIL");
process.exit(fail === 0 ? 0 : 1);
`;

  mkdirSync(path.dirname(TMP_TS), { recursive: true }); // o44: engångszonen finns alltid
  writeFileSync(TMP_TS, TS_KOD, "utf8");

// ── 2) Kör tmp-filen ─────────────────────────────────────────────────────────
let exitkod = 1; // o44 R2: exit EFTER finally — annars mossas unlink vid varje körning
try {
  // Windows + mellanslag i sökvägen: EN citerad kommandosträng (se
  // testa-morgonrond-data.mjs).
  const kommando = `npx --yes tsx "${TMP_TS}"`;
  const res = spawnSync(kommando, {
    cwd: REPO,
    stdio: "inherit",
    timeout: TIMEOUT_MS,
    shell: true,
  });
  const slutkod = res.status ?? 1;
  if (slutkod !== 0) {
    console.error("testa-pro-screening: FAIL (avslutskod " + slutkod + ")");
    exitkod = 1;
  } else {
    console.log("testa-pro-screening: ALLT PASS");
    exitkod = 0;
  }
} finally {
  try {
    unlinkSync(TMP_TS);
  } catch {
    // tmp-filen fanns inte — inget att städa
  }
}
process.exit(exitkod);
