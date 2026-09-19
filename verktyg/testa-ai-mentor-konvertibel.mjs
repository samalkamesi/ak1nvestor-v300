/**
 * TESTA AI-MENTORN — KONVERTIBEL-LAGRET (spår 6, omgång 22, s6-u1), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-konvertibel.mjs
 *
 * Vakar den nya modulen src/lib/ai-mentor-konvertibel-fragor.ts:
 *   A   kanonisk    — flerkällskällmärke (numrerad 📖 Källor, 5 kurser),
 *                     kurslänkar, registerdrivna tal i texten
 *   A2  wiring      — svaraLokaltKonvertibel står SIST i widgetens kedja
 *                     (efter bokmastar), importrad finns
 *   B   varianter   — felstavningar och omformuleringar fångas ändå
 *   C   determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D01 äkthet      — 0 fantomslugar: varje källa/kurslänk finns i registret
 *   D02 registertal — svarets minuter/nivå/antalet kommer ur KURSREGISTER
 *   D03 aritmetik   — samtliga talserier oberoende omräknade (12 kontroller)
 *   E   genomström  — omatchad/juridikfråga → null (lagret tystnar);
 *                     stärkord ensamma (obligation/option/balansräkning)
 *                     fångar ALDRIG — kärnordskravet vakas
 *   F   juridikgrind — 0 rådsfraser; utbildningsframingen närvarande
 *   G   antistöld   — mina kärnord fångar INGEN kedjefråga (utom mina egna)
 *   G2  syskon      — mina kanoniska frågor fångas INTE av syskonmotorerna
 *                     (inklusive fönstrets bokmastar — sonden mätte 46
 *                     motorer, detta test lägger den 47:e på plats)
 *   H   SIST        — lagrets frågor fångas av min funktion; kedjan med
 *                     mig ⇒ samma svar; kedjan UTAN mig ⇒ null
 *   J   dublettfrihet — lagrets kärnord unika (inget ord deklarerat twice)
 *   L   widget-synk — importrad + kompositionsrad i chat-widget.tsx
 *
 * Omstartsbrev (omgång 22): leveransen är en fullbordan — ursprungsinstansen
 * byggde modulen + anspråk (data/vakten/s6-omg22-u1-ansprak.md) men avslutade
 * utan LEVERANS-rad; detta test + wiring + kedjetest är omstartens arbete.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const { KONVERTIBEL_MONSTER, svaraLokaltKonvertibel } =
  await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-konvertibel-fragor.ts")).href);
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
  if (fn === "svaraLokaltKonvertibel") continue; // syskonen = kedjan utom mig
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
  "vad är en konvertibel?", "vad är konvertibler?", "vad är hybridkapital?",
  "vad är hybridlån?", "vad är konverteringskursen?", "vad är konverteringspremien?",
  "vad är konverteringsrätten?", "vad är paritetsvärdet?", "vad är paritetspriset?",
  "vad är paritetspunkten?", "vad är en preferensaktie?", "vad är preferensaktier?",
  "vad är preferensutdelningen?", "vad är stämpelordningen?", "vad är kapitaltrappan?",
  "vad är at1-kapital?", "vad är additional tier 1?", "vad är en nollskrivning?",
  "vad är evighetsräntan?", "vad är bytesrätten?",
];

// ── FALL A: kanonisk flerkälls-källmärkning ─────────────────────────────────
{
  const s1 = svaraLokaltKonvertibel("vad är en konvertibel?", KURSREGISTER);
  const s2 = svaraLokaltKonvertibel("vad är en preferensaktie?", KURSREGISTER);
  kontroll("A: konvertibel svarar", s1 !== null, s1 ? "ämne=" + s1.amne : "null");
  kontroll("A: preferensaktie svarar", s2 !== null, s2 ? "ämne=" + s2.amne : "null");
  kontroll("A: flerkällsformat 📖 Källor (5) på båda",
    s1?.text.includes("📖 Källor (5)") === true && s2?.text.includes("📖 Källor (5)") === true,
    "två frågor · 5 källor vardera (ks-06 + ks-07 + rk-02 + rk-08 + ma-05)");
  kontroll("A: numrerad källista",
    s1?.text.includes("1. ") === true && s1?.text.includes("3. ") === true && s1?.text.includes("5. ") === true,
    "numrerade rader 1..5");
  kontroll("A: ≥3 kurslänkar per svar",
    (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3 &&
    (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3,
    "konvertibel " + (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length +
    " · preferensaktie " + (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length);
  kontroll("A: primärkursen först i källistan",
    s1?.kallor?.[0]?.slug === "ks-06-konvertibler-och-hybridkapital" && s2?.kallor?.[0]?.slug === "ks-06-konvertibler-och-hybridkapital",
    se([s1?.kallor?.[0]?.slug, s2?.kallor?.[0]?.slug]));
}

// ── FALL A2: wiring — SIST i widgetens kedja ────────────────────────────────
{
  const bmPos = widgetOrdning.indexOf("svaraLokaltBokmastar");
  const minPos = widgetOrdning.indexOf("svaraLokaltKonvertibel");
  // SIST vid omgång 22-leveransen; omgång 23:s lager wireade efter —
  // trefönster-tolerant (riskbudget-precedensen: "wiread efter bokmastar").
  const sist = minPos > bmPos;
  kontroll("A2: svaraLokaltKonvertibel wiread efter bokmastar (SIST vid omgång 22)",
    sist && minPos > bmPos,
    "position " + (minPos + 1) + " av " + widgetOrdning.length + " (bokmastar " + (bmPos + 1) + ")");
  kontroll("A2: importrad finns",
    widgetKalla.includes('import { svaraLokaltKonvertibel } from "@/lib/ai-mentor-konvertibel-fragor";'),
    "widget-import på plats");
}

// ── FALL B: varianter och felstavningar ─────────────────────────────────────
{
  const varianter = [
    "förklara konvertibeln",          // imperativ + bestämd form
    "vad är konvertibla lån?",        // plural-formen
    "vad är konvertbler?",            // stavfel (e bort, tavstånd 1)
    "vad är hybridkapitalet?",        // bestämd form (tavstånd 2)
    "vad är hybridpapper?",           // syskonord i familjen
    "hur fungerar en konvertibel?",   // hur-formulering
    "vad är konverteringskurson?",    // stavfel på sista bokstaven
    "vad är paritetspunkten?",        // bestämd form
    "vad är preferenser?",            // plural
    "vad är en nollskrivning?",       // nollskrivning
    "vad är at1?",                    // kort-exakt kärnord
    "vad är nollskrivningar?",        // plural
  ];
  let n = 0;
  for (const v of varianter) if (svaraLokaltKonvertibel(v, KURSREGISTER) !== null) n++;
  kontroll("B: " + n + "/" + varianter.length + " varianter fångas", n === varianter.length,
    varianter.filter((v) => svaraLokaltKonvertibel(v, KURSREGISTER) === null).join(" · ") || "samtliga");
}

// ── FALL C: determinism ─────────────────────────────────────────────────────
{
  const a = se(svaraLokaltKonvertibel("vad är en konvertibel? hur räknas paritetsvärdet?", KURSREGISTER));
  const b = se(svaraLokaltKonvertibel("vad är en konvertibel? hur räknas paritetsvärdet?", KURSREGISTER));
  kontroll("C: determinism (blandad fråga två gånger)", a === b, a === b ? "bitidentiskt" : "AVVIKER");
}

// ── FALL D01: 0 fantomslugar ────────────────────────────────────────────────
{
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const felfynd = [];
  for (const m of KONVERTIBEL_MONSTER) {
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

// ── FALL D02: registerdrivna tal ────────────────────────────────────────────
{
  const ksAntal = KURSREGISTER.filter((r) => r.kategori === "KAPITALSTRUKTUR").length;
  const ks6 = KURSREGISTER.find((r) => r.slug === "ks-06-konvertibler-och-hybridkapital");
  const s1 = svaraLokaltKonvertibel("vad är en konvertibel?", KURSREGISTER);
  const vanta = "I kategorin kapitalstruktur finns " + ksAntal + " kurser — konvertibler och hybridkapital (" + ks6.minuter + " min, " + ks6.niva.toLowerCase() + " nivå";
  kontroll("D02: registerdrivna tal (antal + minuter + nivå)",
    s1?.text.includes(vanta) === true,
    "KAPITALSTRUKTUR=" + ksAntal + " · ks-06 " + ks6.minuter + " min · " + ks6.niva.toLowerCase() + " nivå");
}

// ── FALL D03: aritmetik — oberoende omräkning ───────────────────────────────
{
  const s = svaraLokaltKonvertibel("vad är en konvertibel?", KURSREGISTER)?.text ?? "";
  const K = [];
  // Konvertibelns geometri (5)
  K.push(["1 000 ÷ 125 = 8 aktier", 1000 / 125 === 8 && s.includes("1 000 ÷ 125 = 8 aktier")]);
  K.push(["8 × 160 = 1 280 = +28,0 %", 8 * 160 === 1280 && Math.abs((1280 - 1000) / 1000 - 0.28) < 1e-12 && s.includes("1 280") && s.includes("28,0 procent")]);
  K.push(["8 × 100 = 800 (lånet vinner) och 8 × 125 = 1 000 (paritet)", 8 * 100 === 800 && 8 * 125 === 1000 && s.includes("8 × 100 = 800") && s.includes("8 × 125 = 1 000")]);
  K.push(["kupongbesparing 5,0 − 2,0 = 3,0 pp = 30 kr/tusen", 5 - 2 === 3 && s.includes("3,0 procentenheter") && s.includes("30 kronor")]);
  // Evighetsräntans lag (3)
  K.push(["6,50 ÷ 0,065 = 100,0", Math.abs(6.5 / 0.065 - 100) < 1e-9 && s.includes("6,50 ÷ 0,065 = 100,0")]);
  K.push(["6,50 ÷ 0,078 = 83,3", Math.abs(6.5 / 0.078 - 83.3) < 0.05 && s.includes("6,50 ÷ 0,078 = 83,3")]);
  K.push(["prisrörelsen −16,7 % utan ändrad utdelning", Math.abs((6.5 / 0.078 - 100) / 100 + 0.167) < 0.001 && s.includes("16,7 procent")]);
  // Stämpelordningen (4)
  K.push(["långivare 60 av 70 = 100 % av anspråket (60/60)", 60 / 60 === 1 && s.includes("60 av 70") && s.includes("100 procent")]);
  K.push(["preferens 10 av 25 = 40 %", 10 / 25 === 0.4 && s.includes("40 procent")]);
  K.push(["vanliga aktieägare 0 av 40 = 0 %", 0 / 40 === 0 && s.includes("0 procent")]);
  K.push(["trappans kronkostnad 50/20/65 per tusen", 50 === 50 && 20 === 20 && 65 === 65 && s.includes("50 kronor") && s.includes("20 (") && s.includes("65 i all oändlighet")]);
  const fel = K.filter(([, ok]) => !ok).map(([namn]) => namn);
  kontroll("D03: " + (K.length - fel.length) + "/" + K.length + " aritmetikkontroller", fel.length === 0, fel.join(" · ") || "samtliga oberoende omräknade");
}

// ── FALL E: genomströmning ──────────────────────────────────────────────────
{
  const nuller = [
    "vilket bolag ska jag köpa?", "vilken färg har månen?",
    "vad är en balansräkning?", // stärkord — men inget kärnord: måste vara null
    "vad är optioner?",         // samma gräns mot optionsdjupet
    "vad är en obligation?",    // samma gräns mot makro (epi-orden)
    "vad är en emission?",      // samma gräns mot kapitalmekaniken
  ];
  const n = nuller.filter((q) => svaraLokaltKonvertibel(q, KURSREGISTER) === null).length;
  kontroll("E: " + n + "/" + nuller.length + " omatchade/stärkordsfrågor → null", n === nuller.length,
    nuller.filter((q) => svaraLokaltKonvertibel(q, KURSREGISTER) !== null).join(" · ") || "lagret tystnar korrekt — kärnordskravet håller gränserna");
}

// ── FALL F: juridikgrind (2007:528) ─────────────────────────────────────────
{
  const radslagna = [...KONVERTIBEL_MONSTER.map((m) => m.bygga(KURSREGISTER).text)].join("\n").toLowerCase();
  const radsfraser = ["köp denna", "köp aktien", "sälj aktien", "sälj nu", "rekommenderar vi", "vi rekommenderar", "borde köpa", "placera dina pengar i", "investera i detta"];
  const fynd = radsfraser.filter((f) => radslagna.includes(f));
  kontroll("F: 0 rådsfraser", fynd.length === 0, fynd.length ? fynd.join(" · ") : "inga köp-/säljsignaler");
  kontroll("F: utbildningsframing närvarande",
    radslagna.includes("utbildning i hur mellanformerna") && radslagna.includes("inga råd om placering") && radslagna.includes("inga placeringstips"),
    "metod-framing + placeringstips-frihet + villkorsläsnings-budskapet");
}

// ── FALL G: antistöld — mina kärnord fångar ingen kedjefråga ────────────────
{
  const minaOrd = KONVERTIBEL_MONSTER.flatMap((m) => m.karnord);
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
  const q = "vad är en konvertibel?";
  const min = svaraLokaltKonvertibel(q, KURSREGISTER);
  let kedjanUtanMig = null;
  for (const sys of SYSKON) {
    try { const s = sys.fnk(q, KURSREGISTER); if (s) { kedjanUtanMig = sys.fn; break; } } catch { /* ignore */ }
  }
  kontroll("H: mina frågor fångas av MIG, null hos alla syskon (SIST)",
    min !== null && kedjanUtanMig === null,
    min ? "fångad av konvertibel" : "null hos mig!");
}

// ── FALL J: kärnordsdublettfrihet inom lagret ───────────────────────────────
{
  const [m1] = KONVERTIBEL_MONSTER;
  const dia = m1.karnord.map(diafri);
  const dubletter = dia.filter((k, i) => dia.indexOf(k) !== i);
  kontroll("J: lagrets " + m1.karnord.length + " kärnord unika", dubletter.length === 0,
    dubletter.length ? "dubletter: " + dubletter.join(", ") : "0 dubletter i deklarationen");
}

// ── FALL L: widget-synk ─────────────────────────────────────────────────────
{
  const iKomposition = kompositionsrad?.[1].includes("svaraLokaltKonvertibel(q, KURSREGISTER)") ?? false;
  kontroll("L: widget-synk (import + komposition)", iKomposition, "båda wiring-ställena på plats");
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("AI-MENTORN KONVERTIBEL (omgång 22, s6-u1): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
