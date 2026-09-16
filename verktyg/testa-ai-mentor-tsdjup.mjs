/**
 * TESTA AI-MENTORN — SPÅR 6, OMGÅNG 10, BYGGARE s6-u1 (ts-djup-lagret).
 *
 * Kör:  node verktyg/testa-ai-mentor-tsdjup.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för s6-u1:s fyra nya förhandsfrågor ur AK1TS-familjen
 * (fibonacci-retracements/gyllene snittet/lucas + extensions/kluster/tidszoner
 * + gann-vinklar/cyklar + volymdjup: profil/VPOC/order flow/market profile —
 * se src/lib/ai-mentor-tsdjup-fragor.ts) med bevakning av:
 *   A  4 nya kanoniska → rätt ämne, primärkälla, FLERKÄLLA (kallor ≥ 2 +
 *      numrerad Källor-rad i texten) och ≥ 3 kurslänkar per svar
 *   B  12 felstavade/varierade varianter → samma träff som den kanoniska
 *   C  determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D  källaäkthet — varje källa/kurslänk i de nya svaren FINNS i registret
 *      (fantomslugar är testfel) + registerdrivna räknekontroller i texten
 *      (ts-kursernas minuter ur registret, ej inbakade) + aritmetiklinten
 *      (0,618 × 0,618 = 0,382 · 1,618 × 1,618 = 2,618 · 8 ÷ 13 · 29 ÷ 47)
 *   E  3 omatchade frågor → null (API-flödet får dem)
 *   F  juridikgrind-lint — inga rådfraser (köp/sälj) i de nya svaren
 *   G2 SYSKONKÄRNORD — samtliga kärnord i de FJORTON tidigare lagren läses
 *      LIVE ur modulerna och ställs som frågor ("vad är X?") → 0 fångster
 *      i detta lager (fångar även framtida syskonkrockar — samma fall som
 *      praktik-/portfoljgrund-/djup-lagrens test)
 *   H  hela kedjan (makro ?? extra ?? bas ?? nästa ?? kapitalmekanik ??
 *      sektor ?? case ?? praktik ?? portfoljgrund ?? ägande ??
 *      redovisningsdjup ?? djup ?? historia ?? lonsamhetsdjup ?? tsdjup,
 *      som chat-widget.tsx): urvals-tvärsnitt når RÄTT lager
 *   I  OMKASTAD ANTISTÖLD — mina kärnord ställda som frågor ger NULL i
 *      kedjan UTAN tsdjup-lagret: inget tidigare lager fångar dem
 *   J  kärnordsdisjunktion MEKANISKT — TSDJUP_MONSTER:s kärnord är
 *      disjunkta mot samtliga fjorton tidigare lagers kärnord, lästa LIVE
 *   L  WIDGET-SYNK — chat-widget.tsx:s kedjerad bär ALLA femton lager i
 *      rätt ordning + importen finns (dödkodsmissen c363ec8b — sektor
 *      levererad utan inkoppling — kan inte upprepas tyst; samma fall som
 *      syskontesterna, 23bfd63f-precedensen)
 *
 * NOTIS Node 22.23 (module-typeless-reparse): modul-namespace-åtkomst via
 * punktnotation kan ge undefined för .ts-moduler i denna miljö — alla
 * importer destruktureras (samma mönster som samtliga syskontest).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-tsdjup.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { TSDJUP_MONSTER, svaraLokaltTsdjup } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-tsdjup-fragor.ts")).href);

// Syskonlager — toleranta importer (syskon kan skriva just nu).
async function tystImport(fil) {
  try { return await import(pathToFileURL(join(ROT, "src/lib/" + fil)).href); } catch { return null; }
}
const SYSKON = [
  ["makro", "ai-mentor-makro-fragor.ts", "svaraLokaltMakro", "MAKRO_MONSTER"],
  ["extra", "ai-mentor-extra-fragor.ts", "svaraLokaltExtra", "EXTRA_MONSTER"],
  ["bas", "ai-mentor-svar.ts", "svaraLokalt", "MONSTER"],
  ["nasta", "ai-mentor-nasta-fragor.ts", "svaraLokaltNasta", "NASTA_MONSTER"],
  ["kapitalmekanik", "ai-mentor-kapitalmekanik-fragor.ts", "svaraLokaltKapitalmekanik", "KAPITALMEKANIK_MONSTER"],
  ["sektor", "ai-mentor-sektor-fragor.ts", "svaraLokaltSektor", "SEKTOR_MONSTER"],
  ["case", "ai-mentor-case-fragor.ts", "svaraLokaltCase", "CASE_MONSTER"],
  ["praktik", "ai-mentor-praktik-fragor.ts", "svaraLokaltPraktik", "PRAKTIK_MONSTER"],
  ["portfoljgrund", "ai-mentor-portfoljgrund-fragor.ts", "svaraLokaltPortfoljgrund", "PORTFOLJGRUND_MONSTER"],
  ["agande", "ai-mentor-agande-fragor.ts", "svaraLokaltAgande", "AGANDE_MONSTER"],
  ["redovisningsdjup", "ai-mentor-redovisningsdjup-fragor.ts", "svaraLokaltRedovisningsdjup", "REDOVISNINGSDJUP_MONSTER"],
  ["djup", "ai-mentor-djup-fragor.ts", "svaraLokaltDjup", "DJUP_MONSTER"],
  ["historia", "ai-mentor-historia-fragor.ts", "svaraLokaltHistoria", "HISTORIA_MONSTER"],
  ["lonsamhetsdjup", "ai-mentor-lonsamhetsdjup-fragor.ts", "svaraLokaltLonsamhetsdjup", "LONSAMHETSDJUP_MONSTER"],
];
const motorer = [];
for (const [namn, fil, fn, arr] of SYSKON) {
  const m = await tystImport(fil);
  if (m && m[fn] && m[arr]) motorer.push({ namn, fn: m[fn], monster: m[arr] });
}

// Testharness (samma form som syskonsviterna).
let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) { pass++; console.log("PASS  " + namn + (detalj ? "  — " + detalj : "")); }
  else { fail++; console.log("FAIL  " + namn + (detalj ? "  — " + detalj : "")); }
}

// ── FALL A: kanoniska frågor — rätt ämne, flerkälla, kurslänkar ─────────────
const KANONISKA = [
  { fraga: "vad är fibonacci retracements?", amne: "fibonacci", primar: "ts-03-fibonacciretracements" },
  { fraga: "hur fungerar fibonacci extensions?", amne: "extension", primar: "ts-04-fibonacciextensions" },
  { fraga: "vad är gann-vinklar?", amne: "gann", primar: "ts-05-gannvinklar" },
  { fraga: "vad är en volymprofil och vpoc?", amne: "volymdjup", primar: "ts-09-volymprofiler" },
];
const svarA = new Map();
for (const { fraga, amne, primar } of KANONISKA) {
  const s = svaraLokaltTsdjup(fraga, KURSREGISTER);
  svarA.set(fraga, s);
  const kurslankar = (s?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length;
  kontroll(
    "A: " + fraga,
    s !== null && s.amne === amne && (s.kallor?.length ?? 0) >= 2 && s.text.includes("📖 Källor (") && kurslankar >= 3 && s.kallor?.[0]?.slug === primar,
    "ämne=" + s?.amne + " · källor=" + (s?.kallor?.length ?? 0) + " · kurslänkar=" + kurslankar + " · primär=" + s?.kallor?.[0]?.slug,
  );
}

// ── FALL B: felstavningar/varianter → samma träff som kanonisk ─────────────
const VARIANTER = [
  ["vad är fibonacci retracement?", "vad är fibonacci retracements?"],
  ["fibonacciretracements förklarat", "vad är fibonacci retracements?"],
  ["vad är det gyllene snittet?", "vad är fibonacci retracements?"],
  ["förklara lucas talserien", "vad är fibonacci retracements?"],
  ["fibonacci extension nivåer", "hur fungerar fibonacci extensions?"],
  ["vad är klusterzoner?", "hur fungerar fibonacci extensions?"],
  ["fibonaccis tidszoner", "hur fungerar fibonacci extensions?"],
  ["vad är ganncyklar?", "vad är gann-vinklar?"],
  ["förklara gann vinklar", "vad är gann-vinklar?"],
  ["vad är tidscykler?", "vad är gann-vinklar?"],
  ["vad är vpoc?", "vad är en volymprofil och vpoc?"],
  ["orderflöde och marknadsdjup", "vad är en volymprofil och vpoc?"],
  ["vad är market profile?", "vad är en volymprofil och vpoc?"],
  ["hur fungerar volymanalys?", "vad är en volymprofil och vpoc?"],
];
for (const [variant, kanon] of VARIANTER) {
  const v = svaraLokaltTsdjup(variant, KURSREGISTER);
  const k = svarA.get(kanon);
  kontroll(
    "B: " + variant,
    v !== null && k !== null && v.amne === k.amne,
    v ? "→ " + v.amne : "null",
  );
}

// ── FALL C: determinism — bitidentiskt svar ────────────────────────────────
for (const { fraga } of KANONISKA) {
  const a = svaraLokaltTsdjup(fraga, KURSREGISTER);
  const b = svaraLokaltTsdjup(fraga, KURSREGISTER);
  kontroll("C: determinism (" + fraga + ")", JSON.stringify(a) === JSON.stringify(b), a ? "bitidentiskt" : "null");
}

// ── FALL D: källaäkthet + registerdriven data + aritmetiklint ──────────────
{
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  let fel = 0;
  const detaljer = [];
  for (const m of TSDJUP_MONSTER) {
    const s = m.bygga(KURSREGISTER);
    for (const kall of s.kallor ?? []) {
      if (kall.slug && !slugSet.has(kall.slug)) { fel++; detaljer.push(m.id + ": kalla.slug " + kall.slug + " ej i registret"); }
    }
    for (const h of s.handlings ?? []) {
      if (h.lank.startsWith("/kurser/") && !slugSet.has(h.lank.replace("/kurser/", ""))) { fel++; detaljer.push(m.id + ": död kurslänk " + h.lank); }
    }
    if (s.fordjupa?.lank?.startsWith("/kurser/") && !slugSet.has(s.fordjupa.lank.replace("/kurser/", ""))) { fel++; detaljer.push(m.id + ": död fordjupa " + s.fordjupa.lank); }
    if (s.text.includes("undefined")) { fel++; detaljer.push(m.id + ": 'undefined' i texten (registerfält saknas)"); }
  }
  kontroll("D1: källaäkthet — alla slugar/länkar i registret, ingen 'undefined'", fel === 0, fel ? detaljer.slice(0, 5).join(" | ") : "15 ts-källor + trading-for-a-living, alla äkta");

  // Registerdriven fakta: minuten i texten ska matcha registrets värde (bevis
  // mot inbakade tal som blir lögn vid nästa rebake).
  const retr = KURSREGISTER.find((r) => r.slug === "ts-03-fibonacciretracements");
  const fibSvar = svarA.get("vad är fibonacci retracements?");
  kontroll(
    "D2: registerdriven fakta — ts-03:s minuter ur registret i texten",
    retr && fibSvar?.text.includes(retr.minuter + " min") && fibSvar.text.includes(retr.niva.toLowerCase()),
    "registret " + retr.minuter + " min/" + retr.niva.toLowerCase() + " · texten bär båda",
  );

  // Aritmetiklint — svarets egna ekvationer måste stämma.
  const ekv =
    Math.abs(0.618 * 0.618 - 0.382) < 0.0005 &&
    Math.abs(1.618 * 1.618 - 2.618) < 0.0005 &&
    Math.abs(8 / 13 - 0.615) < 0.0005 &&
    Math.abs(29 / 47 - 0.617) < 0.0005 &&
    Math.abs(21 / 34 - 0.6176) < 0.00005;
  const harEkv = fibSvar?.text.includes("0,618 × 0,618 = 0,382");
  kontroll("D3: aritmetiklint — talseriens ekvationer i texten är sanna", ekv && !!harEkv, "0,618² = 0,382 · 1,618² = 2,618 · 8/13 · 29/47 · 21/34");
}

// ── FALL E: omatchade → null (API-flödet får dem) ─────────────────────────
for (const f of ["vilken färg har tulpanen?", "vem vann VM 1958?", "vad kostar en kaffe?"]) {
  kontroll("E: omatchad → null (" + f + ")", svaraLokaltTsdjup(f, KURSREGISTER) === null, "null");
}

// ── FALL F: juridikgrind-lint — inga rådfraser ─────────────────────────────
{
  const radsFrasor = ["köp ", "sälj ", "jag rekommenderar", "du bör köpa", "snabba pengar", "garanterad avkastning"];
  let fel = 0;
  const detaljer = [];
  for (const m of TSDJUP_MONSTER) {
    const s = m.bygga(KURSREGISTER);
    const lcase = s.text.toLowerCase();
    for (const fras of radsFrasor) {
      if (lcase.includes(fras)) { fel++; detaljer.push(m.id + ": '" + fras + "'"); }
    }
    if (!s.text.includes("aldrig") && !s.text.includes("utbildning")) { fel++; detaljer.push(m.id + ": saknar utbildningsram"); }
  }
  kontroll("F: juridikgrind — 0 rådfraser, utbildningsram i alla fyra", fel === 0, fel ? detaljer.join(" | ") : "ren (2007:528 — utbildning, inte råd)");
}

// ── FALL G2: SYSKONKÄRNORD — tidigare lagers kärnord som frågor → null ────
{
  let sonderade = 0;
  const fangster = [];
  for (const { namn, monster } of motorer) {
    for (const m of monster) {
      for (const k of m.karnord) {
        sonderade++;
        const s = svaraLokaltTsdjup("vad är " + k + "?", KURSREGISTER);
        if (s) fangster.push("'vad är " + k + "?' (" + namn + "/" + m.id + ") → " + s.amne);
      }
    }
  }
  kontroll(
    "G2: syskonkärnord LIVE — " + sonderade + " ord som frågor → 0 fångster",
    fangster.length === 0,
    fangster.length ? fangster.slice(0, 5).join(" | ") : sonderade + " sonderade, 0 fångster",
  );
}

// ── FALL H: hela kedjan — tvärsnitt når rätt lager ─────────────────────────
const KEDJA = [...motorer.map((m) => ({ namn: m.namn, fn: m.fn })), { namn: "tsdjup", fn: svaraLokaltTsdjup }];
// Syskonet u3:s skattedjup (wire:at efter detta lager samma omgång) läses
// tolerant — finns den är kedjan komplett, saknas den testas 15-läget.
const skattMod = await tystImport("ai-mentor-skattedjup-fragor.ts");
if (skattMod?.svaraLokaltSkattedjup) KEDJA.push({ namn: "skattedjup", fn: skattMod.svaraLokaltSkattedjup });
function kedja(fraga) {
  for (const m of KEDJA) {
    const s = m.fn(fraga, KURSREGISTER);
    if (s) return { svar: s, motor: m.namn };
  }
  return null;
}
const TVARSNITT = [
  { fraga: "vad är styrräntan?", motor: "makro" },
  { fraga: "vad är kassaflödesanalys?", motor: "extra" },
  { fraga: "vad är AKM1?", motor: "bas" },
  { fraga: "vad är goodwill?", motor: "kapitalmekanik" },
  { fraga: "vad är blankning?", motor: "praktik" },
  { fraga: "vad är bolagsstämma?", motor: "agande" },
  { fraga: "vad är tulpanmanin?", motor: "historia" },
  { fraga: "vad är dupont-analysen?", motor: "lonsamhetsdjup" },
  { fraga: "vad är fibonacci retracements?", motor: "tsdjup" },
  { fraga: "vad är gann-vinklar?", motor: "tsdjup" },
  { fraga: "vad är teknisk analys?", motor: "bas" },
  { fraga: "vad är rsi?", motor: "bas" },
];
{
  const fel = [];
  for (const { fraga, motor } of TVARSNITT) {
    const k = kedja(fraga);
    if (!k || k.motor !== motor) fel.push("'" + fraga + "' ⇒ " + (k ? k.motor : "null") + " (väntat " + motor + ")");
  }
  kontroll(
    "H: hela kedjan (16 lager) — " + TVARSNITT.length + " tvärsnitt når rätt lager",
    fel.length === 0,
    fel.length ? fel.join(" | ") : TVARSNITT.length + "/" + TVARSNITT.length + " rätt (inkl basens teknisk/RSI-familj vs detta lagret fibonacci/gann/volym)",
  );
}

// ── FALL I: OMKASTAD ANTISTÖLD — mina kärnord → kedjan UTAN tsdjup = null ──
{
  const fangster = [];
  let sonderade = 0;
  for (const m of TSDJUP_MONSTER) {
    for (const k of m.karnord) {
      sonderade++;
      for (const { namn, fn } of motorer) {
        const s = fn("vad är " + k + "?", KURSREGISTER);
        if (s) fangster.push("'vad är " + k + "?' fångas av " + namn + " (" + s.amne + ")");
      }
    }
  }
  kontroll(
    "I: omkastad antistöld — " + sonderade + " egna kärnord → 0 fångster i tidigare lager",
    fangster.length === 0,
    fangster.length ? fangster.slice(0, 5).join(" | ") : sonderade + " sonderade, 0 skuggor",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT (mängd-intersection) ─────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const mina = new Set(TSDJUP_MONSTER.flatMap((m) => m.karnord.map(dia)));
  const tidigare = new Set();
  for (const { monster } of motorer) for (const m of monster) for (const k of m.karnord) tidigare.add(dia(k));
  const krock = [...mina].filter((k) => tidigare.has(k));
  kontroll(
    "J: kärnordsdisjunktion — TSDJUP vs " + tidigare.size + " tidigare kärnord",
    krock.length === 0,
    krock.length ? "krockar: " + krock.join(", ") : mina.size + " unika ord, 0 överlapp",
  );
}

// ── FALL L: WIDGET-SYNK — kedjeraden bär alla 15 lager i ordning ───────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const forvantade = [
    "svaraLokaltMakro(q, KURSREGISTER)", "svaraLokaltExtra(q, KURSREGISTER)",
    "svaraLokalt(q, KURSREGISTER)", "svaraLokaltNasta(q, KURSREGISTER)",
    "svaraLokaltKapitalmekanik(q, KURSREGISTER)", "svaraLokaltSektor(q, KURSREGISTER)",
    "svaraLokaltCase(q, KURSREGISTER)", "svaraLokaltPraktik(q, KURSREGISTER)",
    "svaraLokaltPortfoljgrund(q, KURSREGISTER)", "svaraLokaltAgande(q, KURSREGISTER)",
    "svaraLokaltRedovisningsdjup(q, KURSREGISTER)", "svaraLokaltDjup(q, KURSREGISTER)",
    "svaraLokaltHistoria(q, KURSREGISTER)", "svaraLokaltLonsamhetsdjup(q, KURSREGISTER)",
    "svaraLokaltTsdjup(q, KURSREGISTER)",
    "svaraLokaltSkattedjup(q, KURSREGISTER)",
  ];
  const rad = widget.match(/const lokalt = ([^;]+);/);
  const strang = rad ? rad[1] : "";
  const fel = [];
  let pos = -1;
  for (const komp of forvantade) {
    const nastaPos = strang.indexOf(komp, pos + 1);
    if (nastaPos === -1) { fel.push("saknas/oordning: " + komp); break; }
    pos = nastaPos;
  }
  if (!rad) fel.push("kedjeraden 'const lokalt = …' hittades inte");
  if (!widget.includes('from "@/lib/ai-mentor-tsdjup-fragor"')) fel.push("importen av ai-mentor-tsdjup-fragor saknas");
  kontroll(
    "L: widget-synk — kedjan bär alla 16 lager i ordning + import",
    fel.length === 0,
    fel.length ? fel.join(" | ") : "16/16 lager i ordning (tsdjup + syskonens skattedjup sist), import på plats — dödkodsmissen c363ec8b kan inte upprepas tyst",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("AI-MENTORN TSDJUP (s6-u1 omgång 10): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
