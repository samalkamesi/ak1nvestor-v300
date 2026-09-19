/**
 * TESTA AI-MENTORN — BOKMASTAR-LAGRET (spår 6, omgång 22, s6-u3), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-bokmastar.mjs
 *
 * Vakar den nya modulen src/lib/ai-mentor-bokmastar-fragor.ts:
 *   A   kanonisk    — flerkällskällmärke (numrerad 📖 Källor), ≥3 källor,
 *                     kurslänkar, registerdrivna tal i texten
 *   A2  wiring      — svaraLokaltBokmastar står SIST i widgetens kedja
 *                     (efter tillväxtdjupet), importrad finns
 *   B   varianter   — felstavningar och omformuleringar fångas ändå
 *   C   determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D01 äkthet      — 0 fantomslugar: varje källa/kurslänk finns i registret
 *   D01b knappar    — varje fragor:-knapp fångas av NÅGON motor i kedjan
 *                     (gränsfrågorna: basens årsredovisning, historiens
 *                     tulpan, praktikens blankning — aldrig död knapp)
 *   D02 registertal — kategorital + kapitel/quiz (minuten=undefined för
 *                     BOKMASTER — omgång 19:s fälla vakad med kontrolltal)
 *   D03 aritmetik   — samtliga talserier oberoende omräknade (18 kontroller)
 *   E   genomström  — omatchad/juridikfråga → null (lagret tystnar)
 *   F   juridikgrind — 0 rådsfraser; utbildningsframingen närvarande
 *   G   antistöld   — mina kärnord fångar INGEN syskonfråga
 *   G2  syskon      — mina kanoniska frågor fångas INTE av syskonmotorerna
 *   H   SIST        — mina monsters frågor fångas av min funktion; kedjan
 *                     med mig ⇒ samma svar; kedjan UTAN mig ⇒ null
 *   I   omvänd antistöld — syskonens kanoniska fångas inte av min funktion
 *   J   disjunktion — lagrets tre monsters kärnord är inbördes disjunkta
 *   L01 widget-synk — kedjeraden bär alla 50 lager i ordning + import
 *
 * Sondestensläxan (omgång 21–22): funktionskartan läser importlistor med
 * FLERA namn (basens "svaraLokalt, fallbackSvar") — annars tappas basen
 * och antistöldsfallen ljuger grönt.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const { BOKMASTAR_MONSTER, svaraLokaltBokmastar } =
  await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-bokmastar-fragor.ts")).href);
const { KURSREGISTER } =
  await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);

// ── Kedjans motorer (funktionskarta ur widgetens importrader — med stöd
// för importlistor med flera namn, basens «svaraLokalt, fallbackSvar») ───────
const widgetKalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const FN_TILL_FIL = {};
for (const m of widgetKalla.matchAll(/import \{ ([^}]+) \} from "@\/lib\/(ai-mentor-[a-z0-9-]+)";/g)) {
  for (const namn of m[1].split(",").map((x) => x.trim())) {
    if (namn.startsWith("svaraLokalt")) FN_TILL_FIL[namn] = m[2] + ".ts";
  }
}
const kompositionsrad = widgetKalla.match(/const lokalt = ([^;]+);/);
const widgetOrdning = kompositionsrad
  ? [...kompositionsrad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0])
  : [];
const SYSKON = [];
const KANONISKA = []; // kedjans egna kanoniska frågor (kärnordsderivat)
for (const fn of widgetOrdning) {
  if (fn === "svaraLokaltBokmastar") continue; // syskonen = kedjan utom mig
  const fil = FN_TILL_FIL[fn];
  if (!fil) continue;
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + fil)).href);
  SYSKON.push({ fn, fnk: modul[fn] });
  const arrNamn = Object.keys(modul).find((k) => Array.isArray(modul[k]) && /MONSTER/.test(k));
  if (arrNamn) for (const mo of modul[arrNamn]) {
    for (const nk of mo.karnord ?? []) {
      const ren = nk.replace(/-/g, " ");
      if (ren.length <= 40 && !ren.includes("  ")) KANONISKA.push({ fraga: "vad är " + ren + "?", agare: fn });
    }
  }
}

// ── Testharness ─────────────────────────────────────────────────────────────
let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) { pass++; console.log("PASS  " + namn + (detalj ? "  — " + detalj : "")); }
  else { fail++; console.log("FAIL  " + namn + (detalj ? "  — " + detalj : "")); }
}
const se = (x) => JSON.stringify(x);

// Speglade matcherfunktioner (samma semantik som modulen/motorn)
function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
function tavstand(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (n === 0) return m; if (m === 0) return n;
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      const kostnad = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kostnad);
    }
    fore = [...nu];
  }
  return fore[m];
}
function traff(fragaOrd, fragaStr, nyckelord) {
  const nk = diafri(nyckelord);
  if (!nk) return false;
  if (nk.includes(" ")) return fragaStr.includes(nk);
  if (nk.length <= 3) return fragaOrd.includes(nk);
  const max = nk.length <= 7 ? 1 : 2;
  return fragaOrd.some((o) => tavstand(o, nk) <= max);
}

const MINA_KANONISKA = [
  "vad är financial shenanigans?", "vad är redovisningstrick?",
  "vad är redovisningstricks?", "vad är resultatmassaging?",
  "vad är quality of earnings?", "vad är earnings quality?",
  "vad är resultatkvalitet?", "vad är resultatets kvalitet?",
  "vad är kreativ redovisning?", "vad är kreativ bokföring?",
  "vad är redovisningsvarning?", "vad är manias panics and crashes?",
  "vad är spekulativ mani?", "vad är this time is different?",
  "vad är den här gången är det annorlunda?", "vad är krashhistoria?",
  "vad är krashhistorien?", "vad är special situations?",
  "vad är special situation?", "vad är specialsituation?",
  "vad är specialsituationer?", "vad är spin off?", "vad är spin offs?",
  "vad är spinoff?", "vad är merger arbitrage?", "vad är mergerarbitrage?",
  "vad är distress investing?", "vad är distress?",
  // NOTERA (G/G2-dokumentation): «vad är kindleberger?» och «vad är mani
  // panik krasch?» är HISTORIA-motorns frågor (deras monster [bubbla]/
  // [krasch1929] + basens «krasch») — strukna som kärnord här efter
  // G-fångsten i första testrundan; Kindleberger bärs av källraden.
];

// ── FALL A: kanonisk flerkälls-källmärkning ─────────────────────────────────
{
  const s1 = svaraLokaltBokmastar("vad är financial shenanigans?", KURSREGISTER);
  const s2 = svaraLokaltBokmastar("vad är manias panics and crashes?", KURSREGISTER);
  const s3 = svaraLokaltBokmastar("vad är special situations?", KURSREGISTER);
  kontroll("A: detektiven svarar", s1 !== null, s1 ? "ämne=" + s1.amne : "null");
  kontroll("A: manierna svarar", s2 !== null, s2 ? "ämne=" + s2.amne : "null");
  kontroll("A: specialsituationerna svarar", s3 !== null, s3 ? "ämne=" + s3.amne : "null");
  kontroll("A: flerkällsformat 📖 Källor ( på alla tre",
    s1?.text.includes("📖 Källor (5)") === true && s2?.text.includes("📖 Källor (7)") === true && s3?.text.includes("📖 Källor (5)") === true,
    "detektiven 5 · manierna 7 · specialsituationerna 5 källor");
  kontroll("A: numrerad källista",
    s1?.text.includes("1. ") === true && s1?.text.includes("5. ") === true && s2?.text.includes("7. ") === true,
    "numrerade rader 1..5 resp 1..7");
  kontroll("A: ≥3 kurslänkar per svar",
    (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3 &&
    (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3 &&
    (s3?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3,
    "3/3 monsters ≥3 kurslänkar");
  kontroll("A: primärkursen först i källistan",
    s1?.kallor?.[0]?.slug === "financial-shenanigans" && s2?.kallor?.[0]?.slug === "manias-panics-and-crashes" && s3?.kallor?.[0]?.slug === "you-can-be-a-stock-market-genius",
    se([s1?.kallor?.[0]?.slug, s2?.kallor?.[0]?.slug, s3?.kallor?.[0]?.slug]));
}

// ── FALL A2: wiring — efter tillväxtdjupet i widgetens kedja ────────────────
{
  // Trefönstret omgång 22: u1 (konvertibel) + u2 (riskbudget) wireade sina
  // lager EFTER min 47:e position (deras anspråk 06:37/06:42 mot mitt 06:30 —
  // omgång 18-21-presedensen: SIST-läget gäller vid leverans, syskonens
  // efterföljande wiring kan aldrig stjäla mina frågor: kedjan är
  // först-icke-null och mina monsters står före deras). Vakten här kräver
  // därför prefixet (efter tillväxtdjupet) — inte absolut sista plats.
  const minPos = widgetOrdning.indexOf("svaraLokaltBokmastar");
  const txPos = widgetOrdning.indexOf("svaraLokaltTillvaxtdjup");
  const sist = widgetOrdning[widgetOrdning.length - 1] === "svaraLokaltBokmastar";
  kontroll("A2: svaraLokaltBokmastar wiread efter tillväxtdjupet (position " + (minPos + 1) + " av " + widgetOrdning.length + (sist ? ", SIST" : "; syskonens omgång-22-lager efter — trefönstret dokumenterat") + ")",
    minPos > txPos,
    "tillväxtdjup " + (txPos + 1) + " → bokmastar " + (minPos + 1));
  kontroll("A2: importrad finns",
    widgetKalla.includes('import { svaraLokaltBokmastar } from "@/lib/ai-mentor-bokmastar-fragor";'),
    "widget-import på plats");
}

// ── FALL B: varianter och felstavningar ─────────────────────────────────────
{
  const varianter = [
    "vad är financial shenanigans?",   // kanonisk fras (fraser tål ej stavfel)
    "förklara redovisningstricks",     // imperativ + plural
    "vad är resultatmassagingen?",     // bestämd form
    "vad är earnings quality?",        // omvänd engelsk form
    "vad är resultatkvaliteten?",      // svensk term, bestämd form
    "vad är kreativ bokföring?",       // syskonform
    "vad är redovisningsvarningar?",   // plural
    "vad är den här gången är det annorlunda?", // svensk titelöversättning
    "vad menas med this time is different?",    // omformulering
    "vad är krashhistorien?",          // bestämd form
    "vad är special situation?",       // singular
    "vad är en spin off?",             // artikel
    "vad är spinoff?",                 // sammansatt
    "vad är mergerarbitrage?",         // sammansatt
    "vad är distress?",                // kortform
  ];
  let n = 0;
  for (const v of varianter) if (svaraLokaltBokmastar(v, KURSREGISTER) !== null) n++;
  kontroll("B: " + n + "/" + varianter.length + " varianter fångas", n === varianter.length,
    varianter.filter((v) => svaraLokaltBokmastar(v, KURSREGISTER) === null).join(" · ") || "samtliga");
}

// ── FALL C: determinism ─────────────────────────────────────────────────────
{
  const frågor = [
    "vad är financial shenanigans? hur räknas kvaliteten?",
    "vad är manias panics and crashes? förklara faserna",
    "vad är special situations? räkna spreaden",
  ];
  let ok = 0;
  for (const q of frågor) {
    const a = se(svaraLokaltBokmastar(q, KURSREGISTER));
    const b = se(svaraLokaltBokmastar(q, KURSREGISTER));
    if (a === b) ok++;
  }
  kontroll("C: determinism (" + frågor.length + " frågor ×2)", ok === frågor.length,
    ok === frågor.length ? "bitidentiska" : (frågor.length - ok) + " avvek");
}

// ── FALL D01: 0 fantomslugar ────────────────────────────────────────────────
{
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const felfynd = [];
  for (const m of BOKMASTAR_MONSTER) {
    const s = m.bygga(KURSREGISTER);
    for (const k of s.kallor ?? []) if (k.slug && !slugSet.has(k.slug)) felfynd.push(m.id + " kalla " + k.slug);
    if (s.kalla?.slug && !slugSet.has(s.kalla.slug)) felfynd.push(m.id + " primär " + s.kalla.slug);
    for (const h of s.handlings ?? []) {
      if (h.lank.startsWith("/kurser/") && !slugSet.has(h.lank.replace("/kurser/", ""))) felfynd.push(m.id + " handlings " + h.lank);
    }
    if (s.fordjupa?.lank?.startsWith("/kurser/") && !slugSet.has(s.fordjupa.lank.replace("/kurser/", ""))) felfynd.push(m.id + " fordjupa " + s.fordjupa.lank);
  }
  kontroll("D01: 0 fantomslugar av " + KURSREGISTER.length + " registrerade", felfynd.length === 0,
    felfynd.length ? felfynd.join(" · ") : "samtliga källor/länkar äkta");
}

// ── FALL D01b: fragor:-knappar levande mot hela kedjan ──────────────────────
{
  const doda = [];
  for (const m of BOKMASTAR_MONSTER) {
    const s = m.bygga(KURSREGISTER);
    for (const h of s.handlings ?? []) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      let fangad = false;
      if (svaraLokaltBokmastar(q, KURSREGISTER) !== null) fangad = true;
      else for (const sys of SYSKON) {
        try { if (sys.fnk(q, KURSREGISTER) !== null) { fangad = true; break; } } catch { /* ignore */ }
      }
      if (!fangad) doda.push(m.id + " → «" + q + "»");
    }
  }
  kontroll("D01b: 0 döda fragor:-knappar mot " + (SYSKON.length + 1) + "-motorskedjan",
    doda.length === 0,
    doda.length ? doda.join(" · ") : "årsredovisning→bas · tulpanen→historia · blankning→praktik — alla levande");
}

// ── FALL D02: registerdrivna tal ────────────────────────────────────────────
{
  const bmAntal = KURSREGISTER.filter((r) => r.kategori === "BOKMASTER").length;
  const fs = KURSREGISTER.find((r) => r.slug === "financial-shenanigans");
  const mp = KURSREGISTER.find((r) => r.slug === "manias-panics-and-crashes");
  const ys = KURSREGISTER.find((r) => r.slug === "you-can-be-a-stock-market-genius");
  const s1 = svaraLokaltBokmastar("vad är financial shenanigans?", KURSREGISTER)?.text ?? "";
  const s2 = svaraLokaltBokmastar("vad är manias panics and crashes?", KURSREGISTER)?.text ?? "";
  const s3 = svaraLokaltBokmastar("vad är special situations?", KURSREGISTER)?.text ?? "";
  const v1 = "I bokmaster-kategorin finns " + bmAntal + " bokkurser — huvudboken (" + fs.kapitel + " kapitel och " + fs.quiz + " quizfrågor";
  const v2 = "I bokmaster-kategorin finns " + bmAntal + " bokkurser — huvudboken (" + mp.kapitel + " kapitel och " + mp.quiz + " quizfrågor";
  const v3 = "I bokmaster-kategorin finns " + bmAntal + " bokkurser — huvudboken (" + ys.kapitel + " kapitel och " + ys.quiz + " quizfrågor";
  kontroll("D02: registerdrivna tal (kategorital + kapitel + quiz — minuten=undefined-vakten)",
    s1.includes(v1) && s2.includes(v2) && s3.includes(v3) &&
    !s1.includes("undefined") && !s2.includes("undefined") && !s3.includes("undefined"),
    "BOKMASTER=" + bmAntal + " · fs " + fs.kapitel + "kap/" + fs.quiz + " · mp " + mp.kapitel + "kap/" + mp.quiz + " · ys " + ys.kapitel + "kap/" + ys.quiz + " · 0 undefined");
}

// ── FALL D03: aritmetik — oberoende omräkning ───────────────────────────────
{
  const s1 = svaraLokaltBokmastar("vad är financial shenanigans?", KURSREGISTER)?.text ?? "";
  const s2 = svaraLokaltBokmastar("vad är manias panics and crashes?", KURSREGISTER)?.text ?? "";
  const s3 = svaraLokaltBokmastar("vad är special situations?", KURSREGISTER)?.text ?? "";
  const K = [];
  // Detektivens kontroller (8)
  K.push(["avtal 5 × 1 000 000 = 5 000 000", 5 * 1000000 === 5000000 && s1.includes("5 × 1 000 000")]);
  K.push(["överdriften 5 000 000 − 1 000 000 = 4 000 000", 5000000 - 1000000 === 4000000 && s1.includes("+4 000 000")]);
  K.push(["hålet 4 × 1 000 000 (fyra år)", 4 * 1000000 === 4000000 && s1.includes("1 000 000 varje årtal")]);
  K.push(["fordringsglipan 40 ÷ 8 = 5×", 40 / 8 === 5 && s1.includes("5 gånger")]);
  K.push(["DSO år 1: 100 ÷ 1 000 × 365 = 36,5", Math.abs(100 / 1000 * 365 - 36.5) < 0.05 && s1.includes("36,5 dagar")]);
  K.push(["DSO år 2: 140 ÷ 1 080 × 365 = 47,3", Math.abs(140 / 1080 * 365 - 47.3) < 0.05 && s1.includes("47,3 dagar")]);
  K.push(["QoE 96/100 = 0,96 · 102/105 = 0,97 · 66/110 = 0,60",
    Math.abs(96 / 100 - 0.96) < 1e-9 && Math.abs(102 / 105 - 0.97) < 0.005 && Math.abs(66 / 110 - 0.60) < 1e-9 &&
    s1.includes("0,96") && s1.includes("0,97") && s1.includes("0,60")]);
  K.push(["resultatet stiger 105 → 110 medan kvoten faller 0,97 → 0,60",
    110 > 105 && 0.60 < 0.97 && s1.includes("105 till 110")]);
  // Maniernas kontroller (5)
  K.push(["kursen 100 → 420 = +320 %", Math.abs(420 / 100 - 4.2) < 1e-9 && s2.includes("+320 procent")]);
  K.push(["direktavkastning 4/100 = 4,0 %", Math.abs(4 / 100 - 0.04) < 1e-9 && s2.includes("4,0")]);
  K.push(["direktavkastning 4/420 = 0,95 %", Math.abs(4 / 420 - 0.0095) < 0.0001 && s2.includes("0,95 procent")]);
  K.push(["Dow −89 %: (41 − 381) ÷ 381", Math.abs((41 - 381) / 381 + 0.892) < 0.001 && s2.includes("89 procent") && s2.includes("381 till 41")]);
  K.push(["25 år: 1954 − 1929", 1954 - 1929 === 25 && s2.includes("25 år")]);
  // Specialsituationernas kontroller (5)
  K.push(["spin-off-rabatt (2,4 − 2,0) ÷ 2,4 = 16,7 %", Math.abs((2.4 - 2.0) / 2.4 - 0.1667) < 0.001 && s3.includes("16,7 procent")]);
  K.push(["spread (40,00 − 38,50) ÷ 38,50 = 3,9 %", Math.abs((40 - 38.5) / 38.5 - 0.039) < 0.0005 && s3.includes("3,9 procent")]);
  K.push(["spricker (34,00 − 38,50) ÷ 38,50 = −11,7 %", Math.abs((34 - 38.5) / 38.5 + 0.117) < 0.0005 && s3.includes("−11,7 procent")]);
  K.push(["väntevärde 0,8 × 1,50 + 0,2 × (−4,50) = +0,30",
    Math.abs(0.8 * 1.5 + 0.2 * -4.5 - 0.3) < 1e-9 && s3.includes("1,20 − 0,90 = +0,30")]);
  K.push(["termerna 40,00 − 38,50 = 1,50 och 34,00 − 38,50 = −4,50",
    Math.abs(40 - 38.5 - 1.5) < 1e-9 && Math.abs(34 - 38.5 + 4.5) < 1e-9 && s3.includes("× 1,50") && s3.includes("(−4,50)")]);
  const fel = K.filter(([, ok]) => !ok).map(([namn]) => namn);
  kontroll("D03: " + (K.length - fel.length) + "/" + K.length + " aritmetikkontroller", fel.length === 0, fel.join(" · ") || "samtliga oberoende omräknade");
}

// ── FALL E: genomströmning ──────────────────────────────────────────────────
{
  const nuller = ["vilket bolag ska jag köpa?", "vilken färg har månen?", "vad är en balansräkning?", "vad är optioner?", "vad är tulpanmanin?", "vad är blankning?"];
  const n = nuller.filter((q) => svaraLokaltBokmastar(q, KURSREGISTER) === null).length;
  kontroll("E: " + n + "/" + nuller.length + " omatchade/gränsfrågor → null", n === nuller.length,
    nuller.filter((q) => svaraLokaltBokmastar(q, KURSREGISTER) !== null).join(" · ") || "lagret tystnar korrekt (gränserna ägda av historia/praktik/basen)");
}

// ── FALL F: juridikgrind (2007:528) ─────────────────────────────────────────
{
  const radslagna = [...BOKMASTAR_MONSTER.map((m) => m.bygga(KURSREGISTER).text)].join("\n").toLowerCase();
  const radsfraser = ["köp denna", "köp aktien", "sälj aktien", "sälj nu", "rekommenderar vi", "vi rekommenderar", "borde köpa", "placera dina pengar i", "investera i detta", "köp boken"];
  const fynd = radsfraser.filter((f) => radslagna.includes(f));
  kontroll("F: 0 rådsfraser", fynd.length === 0, fynd.length ? fynd.join(" · ") : "inga köp-/säljsignaler");
  kontroll("F: utbildningsframing närvarande",
    radslagna.includes("utbildning i en metod") && radslagna.includes("inga placeringstips") && radslagna.includes("påhittade exempel"),
    "metod-framing + placeringstips-frihet + påhittade-tal-deklaration");
  const frammande = radslagna.match(/[\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF]/g);
  kontroll("F: 0 främmande skrivtecken (kyrilliska/CJK — omgång 20:s fälla)", frammande === null,
    frammande === null ? "endast latinska + svenska tecken" : "läcka: " + [...new Set(frammande)].join(" "));
}

// ── FALL G: antistöld — mina kärnord fångar ingen syskonfråga ───────────────
{
  const minaOrd = BOKMASTAR_MONSTER.flatMap((m) => m.karnord);
  const stolder = [];
  for (const nk of minaOrd) {
    for (const kan of KANONISKA) {
      const fs = diafri(kan.fraga);
      if (traff(fs.split(" "), fs, nk)) stolder.push(nk + " → \"" + kan.fraga + "\" (" + kan.agare + ")");
    }
  }
  kontroll("G: 0 stölder mot " + KANONISKA.length + " kedjefrågor", stolder.length === 0,
    stolder.slice(0, 4).join(" · ") || "kärnorden renta");
}

// ── FALL G2: syskonmotorerna fångar inte mina kanoniska ─────────────────────
{
  const fynd = [];
  for (const q of MINA_KANONISKA) {
    for (const sys of SYSKON) {
      try { if (sys.fnk(q, KURSREGISTER) !== null) fynd.push(q + " → " + sys.fn); } catch { /* ignore */ }
    }
  }
  kontroll("G2: 0 av " + SYSKON.length + " syskonmotorer fångar mina " + MINA_KANONISKA.length + " frågor",
    fynd.length === 0, fynd.slice(0, 4).join(" · ") || "hela familjen NULL genom kedjan");
}

// ── FALL H: SIST-invarianten ────────────────────────────────────────────────
{
  const frågor = ["vad är financial shenanigans?", "vad är manias panics and crashes?", "vad är special situations?"];
  let allaMin = true;
  let allaNull = true;
  for (const q of frågor) {
    if (svaraLokaltBokmastar(q, KURSREGISTER) === null) allaMin = false;
    for (const sys of SYSKON) {
      try { if (sys.fnk(q, KURSREGISTER) !== null) { allaNull = false; break; } } catch { /* ignore */ }
    }
  }
  kontroll("H: mina 3 monsters frågor — jag svarar, hela kedjan utan mig null (SIST)",
    allaMin && allaNull, allaMin ? "3/3 fångade av bokmastar" : "null hos mig!");
}

// ── FALL I: omvänd antistöld — syskonens kanoniska fångas inte av mig ───────
{
  const fynd = [];
  for (const kan of KANONISKA) {
    if (svaraLokaltBokmastar(kan.fraga, KURSREGISTER) !== null) fynd.push(kan.fraga + " (" + kan.agare + ")");
  }
  kontroll("I: 0 av " + KANONISKA.length + " syskonfrågor fångas av min funktion",
    fynd.length === 0, fynd.slice(0, 4).join(" · ") || "omvänd riktning ren");
}

// ── FALL J: inbördes kärnordsdisjunktion ────────────────────────────────────
{
  const [m1, m2, m3] = BOKMASTAR_MONSTER;
  const set1 = new Set(m1.karnord.map(diafri));
  const set2 = new Set(m2.karnord.map(diafri));
  const overlap = [
    ...m2.karnord.filter((k) => set1.has(diafri(k))),
    ...m3.karnord.filter((k) => set1.has(diafri(k)) || set2.has(diafri(k))),
  ];
  kontroll("J: lagrets tre monsters kärnord disjunkta", overlap.length === 0,
    overlap.length ? "delade: " + overlap.join(", ") : m1.karnord.length + " + " + m2.karnord.length + " + " + m3.karnord.length + " skilda ord");
}

// ── FALL L01: widget-synk — kedjeraden bär alla lager ───────────────────────
{
  const KOMPONENTER = [
    "svaraLokaltMakro", "svaraLokaltExtra", "svaraLokalt", "svaraLokaltNasta",
    "svaraLokaltKapitalmekanik", "svaraLokaltSektor", "svaraLokaltCase",
    "svaraLokaltPraktik", "svaraLokaltPortfoljgrund", "svaraLokaltAgande",
    "svaraLokaltRedovisningsdjup", "svaraLokaltDjup", "svaraLokaltHistoria",
    "svaraLokaltLonsamhetsdjup", "svaraLokaltTsdjup", "svaraLokaltSkattedjup",
    "svaraLokaltBeteendedjup", "svaraLokaltRiskdjup", "svaraLokaltRiskmattsdjup",
    "svaraLokaltUtdelningsdjup", "svaraLokaltForvantningsdjup",
    "svaraLokaltPortfoljbalans", "svaraLokaltStabilitetsdjup",
    "svaraLokaltGrahamgolv", "svaraLokaltVarderjustering",
    "svaraLokaltOptionsdjup", "svaraLokaltRisklasningsdjup",
    "svaraLokaltAvkastningskurva", "svaraLokaltAvkastningsdjup",
    "svaraLokaltVarderingsverktyg", "svaraLokaltWarrant",
    "svaraLokaltTidsaxel", "svaraLokaltKapitalbindning",
    "svaraLokaltEkosystemdjup", "svaraLokaltHandelsdag",
    "svaraLokaltPortfoljpraktik",
    "svaraLokaltUtdelningskalender", "svaraLokaltKreditdjup", "svaraLokaltSektordjup",
    "svaraLokaltSektorskola2", "svaraLokaltBeteendemekanik",
    "svaraLokaltPeMekanik",
    "svaraLokaltRiskpremie", "svaraLokaltOverlevnadsdjup", "svaraLokaltKoncernlasning", "svaraLokaltTillvaxtdjup",
    // Omgång 22:s syskonfönster (dokumentationsplikten ömsesidig): u1:s
    // faktordjup wireades FÖRE min position (efter tillväxtdjupet), u2:s
    // riskbudget + u1:s konvertibel EFTER — bokmastar 48:e av 50.
    "svaraLokaltFaktordjup",
    // Omgång 22: detta lager — 48:e vid leverans (prefix: efter tillväxtdjupet).
    "svaraLokaltBokmastar",
    "svaraLokaltRiskbudget",
    "svaraLokaltKonvertibel",
    // Omgång 23 (2026-09-19): u2 sektorlasning + u3 vardegrund + u1 realekonomi — svitharmonisering (dokumentationsplikten).
  "svaraLokaltSektorlasning",
  "svaraLokaltVardegrund",
  "svaraLokaltRealekonomi",
];
  const kedjerader = widgetKalla.split("\n").filter((rad) => rad.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const FEL = [];
  if (kedjerader.length !== 1) FEL.push("hittade " + kedjerader.length + " kedjerader (väntat exakt 1)");
  const rad = kedjerader[0] ?? "";
  let senaste = -1;
  for (const komp of KOMPONENTER) {
    const pos = rad.indexOf(komp + "(");
    if (pos === -1) FEL.push(komp + " saknas i kedjeraden");
    else if (pos < senaste) FEL.push(komp + " i fel ordning i kedjeraden");
    else senaste = pos;
  }
  if (!widgetKalla.includes('from "@/lib/ai-mentor-bokmastar-fragor"')) {
    FEL.push("importen av ai-mentor-bokmastar-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
  const kanda = new Set(KOMPONENTER);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla 50 lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "bokmastar 48:e av 50 (faktordjup före, riskbudget + konvertibel efter — trefönstret), inga okända komponenter",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN BOKMASTAR (s6-u3 omgång 22): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
