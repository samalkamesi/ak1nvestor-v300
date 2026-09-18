/**
 * TESTA AI-MENTORN — TILLVÄXTDJUP-LAGRET (spår 6, omgång 21, s6-u2), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-tillvaxtdjup.mjs
 *
 * Vakar den nya modulen src/lib/ai-mentor-tillvaxtdjup-fragor.ts:
 *   A   kanonisk    — flerkällskällmärke (numrerad 📖 Källor), ≥3 källor,
 *                     kurslänkar, registerdrivna tal i texten
 *   A2  wiring      — svaraLokaltTillvaxtdjup står SIST i widgetens kedja
 *                     (efter koncernläsningen), importrad finns
 *   B   varianter   — felstavningar och omformuleringar fångas ändå
 *   C   determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D01 äkthet      — 0 fantomslugar: varje källa/kurslänk finns i registret
 *   D02 registertal — svarets minuter/nivå/antalet kommer ur KURSREGISTER
 *   D03 aritmetik   — samtliga talserier oberoende omräknade (11 kontroller)
 *   E   genomström  — omatchad/juridikfråga → null (lagret tystnar)
 *   F   juridikgrind — 0 rådsfraser; utbildningsframingen närvarande
 *   G   antistöld   — mina kärnord fångar INGEN kedjefråga (utom mina egna)
 *   G2  syskon      — mina kanoniska frågor fångas INTE av syskonmotorerna
 *   H   SIST        — mina monsters frågor fångas av min funktion; kedjan
 *                     med mig ⇒ samma svar; kedjan UTAN mig ⇒ null
 *   J   disjunktion — lagrets två monsters kärnord är inbördes disjunkta
 *   L   widget-synk — importrad + kompositionsrad i chat-widget.tsx
 *
 * Sondestensläxa (omgång 21): funktionskartan läser importlistor med FLERA
 * namn (basens "svaraLokalt, fallbackSvar") — sondens rund 1–2 missade
 * basen och frysen var fel; detta test läser kartan rätt.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const { TILLVAXTDJUP_MONSTER, svaraLokaltTillvaxtdjup } =
  await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-tillvaxtdjup-fragor.ts")).href);
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
  if (fn === "svaraLokaltTillvaxtdjup") continue; // syskonen = kedjan utom mig
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
  "vad är s-kurvan?", "vad är mättnad?", "vad är marknadsmättnad?",
  "vad är utrymmesräkning?", "vad är prismix?", "vad är mixeffekten?",
  "vad är prisvolym?", "vad är volympris?", "vad är produktmix?",
  "vad är mixanalys?", "vad är intäktsmotorer?", "vad är tillväxtmotorer?",
];

// ── FALL A: kanonisk flerkälls-källmärkning ─────────────────────────────────
{
  const s1 = svaraLokaltTillvaxtdjup("vad är s-kurvan?", KURSREGISTER);
  const s2 = svaraLokaltTillvaxtdjup("vad är prismix?", KURSREGISTER);
  kontroll("A: s-kurvan svarar", s1 !== null, s1 ? "ämne=" + s1.amne : "null");
  kontroll("A: prismix svarar", s2 !== null, s2 ? "ämne=" + s2.amne : "null");
  kontroll("A: flerkällsformat 📖 Källor ( på båda",
    s1?.text.includes("📖 Källor (4)") === true && s2?.text.includes("📖 Källor (3)") === true,
    "s-kurvan 4 källor · prismix 3 källor");
  kontroll("A: numrerad källista",
    s1?.text.includes("1. ") === true && s1?.text.includes("2. ") === true && s1?.text.includes("4. ") === true,
    "numrerade rader 1..4");
  kontroll("A: ≥3 kurslänkar per svar",
    (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3 &&
    (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3,
    "s-kurvan " + (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length +
    " · prismix " + (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length);
  kontroll("A: primärkursen först i källistan",
    s1?.kallor?.[0]?.slug === "tx-04-tillvaxtens-granser" && s2?.kallor?.[0]?.slug === "tx-02-volym-pris-och-mix",
    se([s1?.kallor?.[0]?.slug, s2?.kallor?.[0]?.slug]));
}

// ── FALL A2: wiring — SIST i widgetens kedja ────────────────────────────────
{
  const sist = widgetOrdning[widgetOrdning.length - 1] === "svaraLokaltTillvaxtdjup";
  const koncernPos = widgetOrdning.indexOf("svaraLokaltRiskpremie", "svaraLokaltKoncernlasning");
  const minPos = widgetOrdning.indexOf("svaraLokaltTillvaxtdjup");
  kontroll("A2: svaraLokaltTillvaxtdjup står SIST i kedjan",
    sist && minPos > koncernPos,
    "position " + (minPos + 1) + " av " + widgetOrdning.length + " (koncernläsning " + (koncernPos + 1) + ")");
  kontroll("A2: importrad finns",
    widgetKalla.includes('import { svaraLokaltTillvaxtdjup } from "@/lib/ai-mentor-tillvaxtdjup-fragor";'),
    "widget-import på plats");
}

// ── FALL B: varianter och felstavningar ─────────────────────────────────────
{
  const varianter = [
    "vad är s kurvan?",          // bindestreck bort
    "förklara s-kurvan",         // imperativ-formulering
    "vad är mättnaden?",         // bestämd form
    "vad är marknadsmattnad?",   // stavfel (á→a)
    "vad är utrymmesrakningen?", // stavfel
    "vad är mixeffekten?",       // bestämd form
    "vad är prisvolymen?",       // bestämd form
    "vad är volympriset?",      // bestämd form
    "vad är produktmixen?",      // bestämd form
    "vad är tillväxtmotorerna?", // bestämd form
  ];
  let n = 0;
  for (const v of varianter) if (svaraLokaltTillvaxtdjup(v, KURSREGISTER) !== null) n++;
  kontroll("B: " + n + "/" + varianter.length + " varianter fångas", n === varianter.length,
    varianter.filter((v) => svaraLokaltTillvaxtdjup(v, KURSREGISTER) === null).join(" · ") || "samtliga");
}

// ── FALL C: determinism ─────────────────────────────────────────────────────
{
  const a = se(svaraLokaltTillvaxtdjup("vad är s-kurvan? kan man räkna utrymmet?", KURSREGISTER));
  const b = se(svaraLokaltTillvaxtdjup("vad är s-kurvan? kan man räkna utrymmet?", KURSREGISTER));
  kontroll("C: determinism (blandad fråga två gånger)", a === b, a === b ? "bitidentiskt" : "AVVIKER");
}

// ── FALL D01: 0 fantomslugar ────────────────────────────────────────────────
{
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const felfynd = [];
  for (const m of TILLVAXTDJUP_MONSTER) {
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
  const txAntal = KURSREGISTER.filter((r) => r.kategori === "TILLVÄXT").length;
  const tx04 = KURSREGISTER.find((r) => r.slug === "tx-04-tillvaxtens-granser");
  const tx02 = KURSREGISTER.find((r) => r.slug === "tx-02-volym-pris-och-mix");
  const s1 = svaraLokaltTillvaxtdjup("vad är s-kurvan?", KURSREGISTER);
  const s2 = svaraLokaltTillvaxtdjup("vad är prismix?", KURSREGISTER);
  const vanta1 = "I tillväxt-kategorin finns " + txAntal + " kurser — huvudkursen (" + tx04.minuter + " min, " + tx04.niva.toLowerCase() + " nivå";
  const vante2 = "I tillväxt-kategorin finns " + txAntal + " kurser — huvudkursen (" + tx02.minuter + " min, " + tx02.niva.toLowerCase() + " nivå";
  kontroll("D02: registerdrivna tal (antal + minuter + nivå)",
    s1?.text.includes(vanta1) === true && s2?.text.includes(vante2) === true,
    "TILLVÄXT=" + txAntal + " · tx-04 " + tx04.minuter + " min · tx-02 " + tx02.minuter + " min");
}

// ── FALL D03: aritmetik — oberoende omräkning ───────────────────────────────
{
  const s1 = svaraLokaltTillvaxtdjup("vad är s-kurvan?", KURSREGISTER)?.text ?? "";
  const s2 = svaraLokaltTillvaxtdjup("vad är prismix?", KURSREGISTER)?.text ?? "";
  const K = [];
  // S-kurvans kontroller (7)
  K.push(["1,15^5 = 2,0114", Math.abs(1.15 ** 5 - 2.0114) < 0.0001 && s1.includes("2,0114")]);
  K.push(["40 × 2,0114 = 80,5 mdr", Math.abs(40 * 1.15 ** 5 - 80.5) < 0.06 && s1.includes("80,5")]);
  K.push(["andelen 10 %: 4,0 → 8,05", Math.abs(0.1 * 40 * 1.15 ** 5 - 8.05) < 0.006 && s1.includes("8,05")]);
  K.push(["taket 100 ÷ 40 = 2,5× och 10 ÷ 4 = 2,5×", 100 / 40 === 2.5 && 10 / 4 === 2.5 && s1.includes("2,5")]);
  K.push(["(100 − 60) ÷ 60 = 67 %", Math.round(((100 - 60) / 60) * 100) === 67 && s1.includes("67 procent")]);
  K.push(["kurvår +2 +8 +20 +35 +28 +15 +6", [2, 8, 20, 35, 28, 15, 6].reduce((a, b) => a + b, 0) === 114 && s1.includes("+35")]);
  K.push(["toppen år fyra (35)", Math.max(2, 8, 20, 35, 28, 15, 6) === 35 && s1.includes("toppen år fyra")]);
  // Prismixens kontroller (8)
  K.push(["1 060 × 10,50 = 11 130", 1060 * 10.5 === 11130 && s2.includes("11 130")]);
  K.push(["tillväxten 11,3 %", Math.abs((11130 - 10000) / 10000 - 0.113) < 0.0005 && s2.includes("11,3")]);
  K.push(["volym 600 + pris 500 + samverkan 30 = 1 130", (1060 - 1000) * 10 === 600 && (10.5 - 10) * 1000 === 500 && 60 * 0.5 === 30 && 600 + 500 + 30 === 1130 && s2.includes("600 + 500 + 30 = 1 130")]);
  K.push(["mixbas 2 000×10 + 500×40 = 40 000", 2000 * 10 + 500 * 40 === 40000 && s2.includes("40 000")]);
  K.push(["mixår 2 200×10 + 460×40 = 40 400 (+1,0 %)", 2200 * 10 + 460 * 40 === 40400 && Math.abs((40400 - 40000) / 40000 - 0.01) < 1e-9 && s2.includes("+1,0")]);
  K.push(["genomsnittspris 16,00 → 15,19", 40000 / 2500 === 16 && Math.abs(40400 / 2660 - 15.19) < 0.005 && s2.includes("16,00") && s2.includes("15,19")]);
  K.push(["prisfallet 5,1 %", Math.abs((15.19 - 16) / 16 + 0.051) < 0.001 && s2.includes("5,1")]);
  K.push(["enheterna +6,4 %", Math.abs((2660 - 2500) / 2500 - 0.064) < 1e-9 && s2.includes("6,4")]);
  const fel = K.filter(([, ok]) => !ok).map(([namn]) => namn);
  kontroll("D03: " + (K.length - fel.length) + "/" + K.length + " aritmetikkontroller", fel.length === 0, fel.join(" · ") || "samtliga oberoende omräknade");
}

// ── FALL E: genomströmning ──────────────────────────────────────────────────
{
  const nuller = ["vilket bolag ska jag köpa?", "vilken färg har månen?", "vad är en balansräkning?", "vad är optioner?"];
  const n = nuller.filter((q) => svaraLokaltTillvaxtdjup(q, KURSREGISTER) === null).length;
  kontroll("E: " + n + "/" + nuller.length + " omatchade → null", n === nuller.length,
    nuller.filter((q) => svaraLokaltTillvaxtdjup(q, KURSREGISTER) !== null).join(" · ") || "lagret tystnar korrekt");
}

// ── FALL F: juridikgrind (2007:528) ─────────────────────────────────────────
{
  const radslagna = [...TILLVAXTDJUP_MONSTER.map((m) => m.bygga(KURSREGISTER).text)].join("\n").toLowerCase();
  const radsfraser = ["köp denna", "köp aktien", "sälj aktien", "sälj nu", "rekommenderar vi", "vi rekommenderar", "borde köpa", "placera dina pengar i", "investera i detta"];
  const fynd = radsfraser.filter((f) => radslagna.includes(f));
  kontroll("F: 0 rådsfraser", fynd.length === 0, fynd.length ? fynd.join(" · ") : "inga köp-/säljsignaler");
  kontroll("F: utbildningsframing närvarande",
    radslagna.includes("utbildning i en metod") && radslagna.includes("inga placeringstips") && radslagna.includes("påhittade exempel"),
    "metod-framing + placeringstips-frihet + påhittade-tal-deklaration");
}

// ── FALL G: antistöld — mina kärnord fångar ingen kedjefråga ────────────────
{
  const minaOrd = TILLVAXTDJUP_MONSTER.flatMap((m) => m.karnord);
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
  const q = "vad är s-kurvan?";
  const min = svaraLokaltTillvaxtdjup(q, KURSREGISTER);
  let kedjanUtanMig = null;
  for (const sys of SYSKON) {
    try { const s = sys.fnk(q, KURSREGISTER); if (s) { kedjanUtanMig = sys.fn; break; } } catch { /* ignore */ }
  }
  kontroll("H: mina frågor fångas av MIG, null hos alla syskon (SIST)",
    min !== null && kedjanUtanMig === null,
    min ? "fångad av tillväxtdjup" : "null hos mig!");
}

// ── FALL J: inbördes kärnordsdisjunktion ────────────────────────────────────
{
  const [m1, m2] = TILLVAXTDJUP_MONSTER;
  const k1 = new Set(m1.karnord.map(diafri));
  const overlap = m2.karnord.filter((k) => k1.has(diafri(k)));
  kontroll("J: lagrets monsters kärnord disjunkta", overlap.length === 0,
    overlap.length ? "delade: " + overlap.join(", ") : m1.karnord.length + " + " + m2.karnord.length + " skilda ord");
}

// ── FALL L: widget-synk ─────────────────────────────────────────────────────
{
  const iKomposition = kompositionsrad?.[1].includes("svaraLokaltTillvaxtdjup(q, KURSREGISTER)") ?? false;
  kontroll("L: widget-synk (import + komposition)", iKomposition, "båda wiring-ställena på plats");
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("AI-MENTORN TILLVÄXTDJUP (omgång 21, s6-u2): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
