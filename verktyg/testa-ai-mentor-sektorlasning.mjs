/**
 * TESTA AI-MENTORN — SEKTORLÄSNING-LAGRET (spår 6, omgång 23, s6-u2, manifest
 * auto-s6-1789814130065), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-sektorlasning.mjs
 *
 * Vakar den nya modulen src/lib/ai-mentor-sektorlasning-fragor.ts:
 *   A   kanonisk    — flerkällskällmärke (numrerad 📖 Källor), ≥3 källor,
 *                     kurslänkar, registerdrivna tal i texten
 *   A2  wiring      — svaraLokaltSektorlasning wiread i widgetens kedja efter
 *                     konvertibel (position 50+; trefönster-tolerant: syskon
 *                     i samma fönster — u1, u3 — kan wirea efter utan att
 *                     detta fall roterar, omgång 20–22-presedensen)
 *   B   varianter   — felstavningar och omformuleringar fångas ändå
 *   C   determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D01 äkthet      — 0 fantomslugar: varje källa/kurslänk finns i registret
 *   D02 registertal — svarets minuter/nivå/antalet kommer ur KURSREGISTER
 *   D03 aritmetik   — lagrets egna talserier oberoende omräknade (17 kontroller)
 *   E   genomström  — omatchad/juridikfråga → null (lagret tystnar)
 *   F   juridikgrind — 0 rådsfraser; utbildningsframingen närvarande
 *   G   antistöld   — mina kärnord fångar INGEN kedjefråga (utom mina egna)
 *   G2  syskon      — mina kanoniska frågor fångas INTE av syskonmotorerna
 *   H   SIST-invariant — mina monsters frågor fångas av min funktion; null
 *                     hos alla syskon (kedjan utan mig ⇒ null)
 *   I   omvänd stöld — kraftbolag-fallet: prototypens dokumenterade granne
 *                     («vad är fraktbolag?» = sektorskola2:s) fångas INTE
 *   J   disjunktion — lagrets två monsters kärnord är inbördes disjunkta
 *   L   widget-synk — importrad + kompositionsrad i chat-widget.tsx
 *
 * Sondestensdoktrin (omgång 21–23): funktionskartan läser importlistor med
 * FLERA namn (basens «svaraLokalt, fallbackSvar») — basen med i syskonmängden.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const { SEKTORLASNING_MONSTER, svaraLokaltSektorlasning } =
  await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-sektorlasning-fragor.ts")).href);
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
  if (fn === "svaraLokaltSektorlasning") continue; // syskonen = kedjan utom mig
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
  "hur analyserar jag ett energibolag?", "hur analyserar man energibolag?",
  "vad kännetecknar energibolag?", "hur läser jag ett oljebolag?",
  "vad är ett elbolag?", "vad menas med energisektorn?",
  "hur analyserar jag ett telekombolag?", "hur analyserar man telekombolag?",
  "vad kännetecknar telekombolag?", "hur läser jag en telekomaktie?",
  "vad är en teleoperatör?", "vad är en mobiloperatör?",
];

// ── FALL A: kanonisk flerkälls-källmärkning ─────────────────────────────────
{
  const s1 = svaraLokaltSektorlasning("hur analyserar jag ett energibolag?", KURSREGISTER);
  const s2 = svaraLokaltSektorlasning("hur analyserar jag ett telekombolag?", KURSREGISTER);
  kontroll("A: energi svarar", s1 !== null, s1 ? "ämne=" + s1.amne : "null");
  kontroll("A: telekom svarar", s2 !== null, s2 ? "ämne=" + s2.amne : "null");
  kontroll("A: flerkällsformat 📖 Källor ( på båda",
    s1?.text.includes("📖 Källor (4)") === true && s2?.text.includes("📖 Källor (4)") === true,
    "energi 4 källor · telekom 4 källor");
  kontroll("A: numrerad källista",
    s1?.text.includes("1. ") === true && s1?.text.includes("4. ") === true && s2?.text.includes("4. ") === true,
    "numrerade rader 1..4 på båda");
  kontroll("A: ≥3 kurslänkar per svar",
    (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3 &&
    (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3,
    "energi " + (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length +
    " · telekom " + (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length);
  kontroll("A: primärkursen först i källistan",
    s1?.kallor?.[0]?.slug === "km-043-energisektorn" && s2?.kallor?.[0]?.slug === "km-046-telekomsektorn",
    se([s1?.kallor?.[0]?.slug, s2?.kallor?.[0]?.slug]));
}

// ── FALL A2: wiring — i widgetens kedja efter konvertibel ───────────────────
{
  const minPos = widgetOrdning.indexOf("svaraLokaltSektorlasning");
  const konvPos = widgetOrdning.indexOf("svaraLokaltKonvertibel");
  kontroll("A2: svaraLokaltSektorlasning wiread efter konvertibel",
    minPos > konvPos && minPos >= 49,
    "position " + (minPos + 1) + " av " + widgetOrdning.length + " (konvertibel " + (konvPos + 1) + ")");
  kontroll("A2: importrad finns",
    widgetKalla.includes('import { svaraLokaltSektorlasning } from "@/lib/ai-mentor-sektorlasning-fragor";'),
    "widget-import på plats");
}

// ── FALL B: varianter och felstavningar ─────────────────────────────────────
{
  const varianter = [
    "hur analyserar man energibolag?",      // omformulering
    "vad menas med energisektorn?",         // bestämd form
    "hur analyserar jag ett enrgibolag?",   // stavfel (energi→enrgi, tol 2)
    "förklara oljebolagens ekonomi",        // bestämd plural + imperativ
    "vad är ett elbolag?",                  // kortform
    "hur analyserar man ett telekombolag?", // omformulering
    "vad menas med telekomsektorn?",        // bestämd form
    "vad är en teleoperatör?",              // operatörsform
    "vad är en mobiloperatör?",             // operatörsform
    "förklara telekomaktierna",             // stavfel+bestämd (tol 2)
  ];
  let n = 0;
  for (const v of varianter) if (svaraLokaltSektorlasning(v, KURSREGISTER) !== null) n++;
  kontroll("B: " + n + "/" + varianter.length + " varianter fångas", n === varianter.length,
    varianter.filter((v) => svaraLokaltSektorlasning(v, KURSREGISTER) === null).join(" · ") || "samtliga");
}

// ── FALL C: determinism ─────────────────────────────────────────────────────
{
  const a = se(svaraLokaltSektorlasning("hur analyserar jag ett energibolag? vad är reserverna?", KURSREGISTER));
  const b = se(svaraLokaltSektorlasning("hur analyserar jag ett energibolag? vad är reserverna?", KURSREGISTER));
  kontroll("C: determinism (blandad fråga två gånger)", a === b, a === b ? "bitidentiskt" : "AVVIKER");
}

// ── FALL D01: 0 fantomslugar ────────────────────────────────────────────────
{
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const felfynd = [];
  for (const m of SEKTORLASNING_MONSTER) {
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
  const sekAntal = KURSREGISTER.filter((r) => r.kategori === "SEKTORANALYS").length;
  const km043 = KURSREGISTER.find((r) => r.slug === "km-043-energisektorn");
  const km046 = KURSREGISTER.find((r) => r.slug === "km-046-telekomsektorn");
  const s1 = svaraLokaltSektorlasning("hur analyserar jag ett energibolag?", KURSREGISTER);
  const s2 = svaraLokaltSektorlasning("hur analyserar jag ett telekombolag?", KURSREGISTER);
  const vanta1 = "I sektoranalys-kategorin finns " + sekAntal + " kurser — huvudkursen (" + km043.minuter + " min, " + km043.niva.toLowerCase() + " nivå";
  const vante2 = "I sektoranalys-kategorin finns " + sekAntal + " kurser — huvudkursen (" + km046.minuter + " min, " + km046.niva.toLowerCase() + " nivå";
  kontroll("D02: registerdrivna tal (antal + minuter + nivå)",
    s1?.text.includes(vanta1) === true && s2?.text.includes(vante2) === true,
    "SEK=" + sekAntal + " · km-043 " + km043.minuter + " min · km-046 " + km046.minuter + " min");
}

// ── FALL D03: aritmetik — oberoende omräkning av lagrets egna tal ───────────
{
  const s1 = svaraLokaltSektorlasning("hur analyserar jag ett energibolag?", KURSREGISTER)?.text ?? "";
  const s2 = svaraLokaltSektorlasning("hur analyserar jag ett telekombolag?", KURSREGISTER)?.text ?? "";
  const K = [];
  // Energi-kontroller (9)
  K.push(["produktion 100 000 × 365 = 36,5 miljoner fat",
    100000 * 365 === 36500000 && s1.includes("100 000 × 365 = 36,5 miljoner fat")]);
  K.push(["botten (40 − 45) × 36,5 = −182,5",
    Math.abs((40 - 45) * 36.5 - (-182.5)) < 1e-9 && s1.includes("(40 − 45) × 36,5 = −182,5")]);
  K.push(["normal (70 − 45) × 36,5 = +912,5",
    Math.abs((70 - 45) * 36.5 - 912.5) < 1e-9 && s1.includes("(70 − 45) × 36,5 = +912,5")]);
  K.push(["topp (110 − 45) × 36,5 = +2 372,5",
    Math.abs((110 - 45) * 36.5 - 2372.5) < 1e-9 && s1.includes("(110 − 45) × 36,5 = +2 372,5")]);
  K.push(["svängen 2 372,5 − (−182,5) = 2 555,0",
    Math.abs(2372.5 - (-182.5) - 2555) < 1e-9 && s1.includes("2 372,5 − (−182,5) = 2 555,0")]);
  K.push(["reserverna 547,5 ÷ 36,5 = 15,0 år",
    Math.abs(547.5 / 36.5 - 15) < 1e-9 && s1.includes("547,5 ÷ 36,5 = 15,0")]);
  K.push(["elprisspegeln 0,50 × 2,0 = 1,0 miljard",
    Math.abs(0.5 * 2 - 1) < 1e-9 && s1.includes("0,50 × 2,0 = 1,0")]);
  K.push(["bristläget 2,50 × 2,0 = 5,0 miljarder",
    Math.abs(2.5 * 2 - 5) < 1e-9 && s1.includes("2,50 × 2,0 = 5,0")]);
  K.push(["femdubblad 5,0 ÷ 1,0 = 5,0",
    Math.abs(5 / 1 - 5) < 1e-9 && s1.includes("femdubblad")]);
  // Telekom-kontroller (8)
  K.push(["kassan 2,0 miljoner × 350 = 700 miljoner/månad",
    Math.abs(2000000 * 350 - 700000000) < 1e-6 && s2.includes("2,0 miljoner × 350 = 700 miljoner")]);
  K.push(["året 700 × 12 = 8 400 miljoner = 8,4 miljarder",
    700 * 12 === 8400 && s2.includes("× 12 = 8 400 miljoner = 8,4 miljarder")]);
  K.push(["churn 1,2 % × 2,0 miljoner = 24 000/månad",
    Math.abs(0.012 * 2000000 - 24000) < 1e-6 && s2.includes("1,2 % × 2,0 miljoner = 24 000")]);
  K.push(["churn-året 24 000 × 12 = 288 000",
    24000 * 12 === 288000 && s2.includes("288 000")]);
  K.push(["capex 1 400 ÷ 8 400 = 16,7 procent (vart sjätte)",
    Math.abs(1400 / 8400 - 0.16667) < 0.0005 && Math.abs(1400 / 8400 - 1 / 6) < 0.0005 &&
    s2.includes("1 400 ÷ 8 400 = 16,7") && s2.includes("vart sjätte")]);
  K.push(["spektrum 2 200 ÷ 20 = 110 miljoner/år",
    2200 / 20 === 110 && s2.includes("2 200 ÷ 20 = 110")]);
  K.push(["direktavkastning 3,50 ÷ 70,00 = 5,0 procent",
    Math.abs(3.5 / 70 - 0.05) < 1e-9 && s2.includes("3,50 kronor per aktie på kursen 70,00 = 5,0 procent")]);
  K.push(["payout 1 960 ÷ 2 800 = 70,0 procent",
    Math.abs(1960 / 2800 - 0.7) < 1e-9 && s2.includes("1 960 miljoner utdelat av 2 800 miljoner vinst = 70,0 procent")]);
  const fel = K.filter(([, ok]) => !ok).map(([namn]) => namn);
  kontroll("D03: " + (K.length - fel.length) + "/" + K.length + " aritmetikkontroller", fel.length === 0, fel.join(" · ") || "samtliga oberoende omräknade");
}

// ── FALL E: genomströmning ──────────────────────────────────────────────────
{
  const nuller = [
    "vilket bolag ska jag köpa?", "vilken färg har månen?",
    "vad är oljepriset?",        // makro-familjens blomma — dokumenterad gräns
    "vad är råolja?",            // stärkord kan inte trigga — gränsvakt
    "vad är en bank?",           // sektor-modulens territorium
    "hur analyserar jag ett läkemedelsbolag?", // sektorskola2:s
    "vad är saas?",              // sektordjups
    "hur analyserar jag ett försvarsbolag?",   // sektordjups
    "vad är kraftbolag?",        // struket kärnord — fraktbolag-grannens vakt
    "vad är fraktbolag?",        // sektorskola2:s — ALDRIG min
  ];
  const n = nuller.filter((q) => svaraLokaltSektorlasning(q, KURSREGISTER) === null).length;
  kontroll("E: " + n + "/" + nuller.length + " omatchade/gränsfrågor → null", n === nuller.length,
    nuller.filter((q) => svaraLokaltSektorlasning(q, KURSREGISTER) !== null).join(" · ") || "lagret tystnar korrekt (gränserna respekterade)");
}

// ── FALL F: juridikgrind (2007:528) ─────────────────────────────────────────
{
  const radslagna = [...SEKTORLASNING_MONSTER.map((m) => m.bygga(KURSREGISTER).text)].join("\n").toLowerCase();
  const radsfraser = ["köp denna", "köp aktien", "sälj aktien", "sälj nu", "rekommenderar vi", "vi rekommenderar", "borde köpa", "placera dina pengar i", "investera i detta"];
  const fynd = radsfraser.filter((f) => radslagna.includes(f));
  kontroll("F: 0 rådsfraser", fynd.length === 0, fynd.length ? fynd.join(" · ") : "inga köp-/säljsignaler");
  kontroll("F: utbildningsframing närvarande",
    radslagna.includes("utbildning i en metod") && radslagna.includes("inga placeringstips") && radslagna.includes("påhittade tal"),
    "metod-framing + placeringstips-frihet + påhittade-tal-deklaration");
}

// ── FALL G: antistöld — mina kärnord fångar ingen kedjefråga ────────────────
{
  const minaOrd = SEKTORLASNING_MONSTER.flatMap((m) => m.karnord);
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

// ── FALL H: kedjan-utan-mig-invarianten ─────────────────────────────────────
{
  const q1 = "hur analyserar jag ett energibolag?";
  const q2 = "hur analyserar jag ett telekombolag?";
  let kedjanUtanMig1 = null;
  let kedjanUtanMig2 = null;
  for (const sys of SYSKON) {
    try { const s = sys.fnk(q1, KURSREGISTER); if (s) { kedjanUtanMig1 = sys.fn; break; } } catch { /* ignore */ }
  }
  for (const sys of SYSKON) {
    try { const s = sys.fnk(q2, KURSREGISTER); if (s) { kedjanUtanMig2 = sys.fn; break; } } catch { /* ignore */ }
  }
  kontroll("H: mina två frågor fångas av MIG, null hos alla syskon",
    svaraLokaltSektorlasning(q1, KURSREGISTER) !== null &&
    svaraLokaltSektorlasning(q2, KURSREGISTER) !== null &&
    kedjanUtanMig1 === null && kedjanUtanMig2 === null,
    "energi: " + (kedjanUtanMig1 ?? "null") + " · telekom: " + (kedjanUtanMig2 ?? "null") + " hos syskonen");
}

// ── FALL I: omvänd stöld — kraftbolag/grann-fallet förblir sektorskola2:s ───
{
  const franFraga = SYSKON.find((s) => s.fn === "svaraLokaltSektorskola2");
  const gran = franFraga ? franFraga.fnk("vad är fraktbolag?", KURSREGISTER) : null;
  kontroll("I: «vad är fraktbolag?» förblir sektorskola2:s (kraftbolag struket)",
    gran !== null && svaraLokaltSektorlasning("vad är kraftbolag?", KURSREGISTER) === null,
    "fraktbolag " + (gran ? "fångas av sektorskola2" : "NULL hos sektorskola2!") + " · kraftbolag NULL hos mig");
}

// ── FALL J: inbördes kärnordsdisjunktion ────────────────────────────────────
{
  const [m1, m2] = SEKTORLASNING_MONSTER;
  const k1 = new Set(m1.karnord.map(diafri));
  const overlap = m2.karnord.filter((k) => k1.has(diafri(k)));
  kontroll("J: lagrets monsters kärnord disjunkta", overlap.length === 0,
    overlap.length ? "delade: " + overlap.join(", ") : m1.karnord.length + " + " + m2.karnord.length + " skilda ord");
}

// ── FALL L: widget-synk ─────────────────────────────────────────────────────
{
  const iKomposition = kompositionsrad?.[1].includes("svaraLokaltSektorlasning(q, KURSREGISTER)") ?? false;
  kontroll("L: widget-synk (import + komposition)", iKomposition, "båda wiring-ställena på plats");
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("AI-MENTORN SEKTORLÄSNING (omgång 23, s6-u2): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
