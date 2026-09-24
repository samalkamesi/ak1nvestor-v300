/**
 * TESTA AI-MENTORN — MOATDJUP-LAGRET (spår 6, omgång 24, s6-u2, manifest
 * auto-s6-1789839901194), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-moatdjup.mjs
 *
 * Vakar den nya modulen src/lib/ai-mentor-moatdjup-fragor.ts:
 *   A   kanonisk    — flerkällskällmärke (numrerad 📖 Källor), ≥3 källor,
 *                     kurslänkar, registerdrivna tal i texten
 *   A2  wiring      — svaraLokaltMoatdjup wiread i widgetens kedja efter
 *                     realekonomi (position 54+; trefönster-tolerant: syskon
 *                     i samma fönster — u1, u3 — kan wirea mellan/efter utan
 *                     att detta fall roterar, omgång 20–23-presedensen)
 *   B   varianter   — felstavningar och omformuleringar fångas ändå
 *   C   determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D01 äkthet      — 0 fantomslugar: varje källa/kurslänk finns i registret
 *   D02 registertal — svarets minuter/nivå/antalet kommer ur KURSREGISTER
 *   D03 aritmetik   — lagrets egna talserier oberoende omräknade (14 kontroller)
 *   E   genomström  — omatchad/juridik/moat-gränsfråga → null (lagret tystnar)
 *   F   juridikgrind — 0 rådsfraser; utbildningsframingen närvarande
 *   G   antistöld   — mina kärnord fångar INGEN kedjefråga (utom mina egna)
 *   G2  syskon      — mina kanoniska frågor fångas INTE av syskonmotorerna
 *   H   SIST-invariant — mina monsters frågor fångas av min funktion; null
 *                     hos alla syskon (kedjan utan mig ⇒ null)
 *   I   omvänd stöld — moat-fallet: extra-lagrets «vad är en moat?» förblir
 *                     deras; dokumenterad gräns, aldrig min
 *   J   disjunktion — lagrets två monsters kärnord är inbördes disjunkta
 *   L   widget-synk — importrad + kompositionsrad i chat-widget.tsx
 *
 * Sondestensdoktrin (omgång 21–24): funktionskartan läser importlistor med
 * FLERA namn (basens «svaraLokalt, fallbackSvar») — basen med i syskonmängden.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const { MOATDJUP_MONSTER, svaraLokaltMoatdjup } =
  await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-moatdjup-fragor.ts")).href);
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
  if (fn === "svaraLokaltMoatdjup") continue; // syskonen = kedjan utom mig
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
  "vad är prisfullmakten?", "vad är prisfullmakt?", "hur testar man prisfullmakten?",
  "förklara prisfullmakten", "vad menas med prisfullmakten?",
  "vad är byteskostnader?", "vad är byteskostnad?", "hur räknar man på byteskostnader?",
  "vad är inlåsningseffekten?", "vad menas med byteskostnaderna?",
];

// ── FALL A: kanonisk flerkälls-källmärkning ─────────────────────────────────
{
  const s1 = svaraLokaltMoatdjup("vad är prisfullmakten?", KURSREGISTER);
  const s2 = svaraLokaltMoatdjup("vad är byteskostnader?", KURSREGISTER);
  kontroll("A: prisfullmakten svarar", s1 !== null, s1 ? "ämne=" + s1.amne : "null");
  kontroll("A: byteskostnad svarar", s2 !== null, s2 ? "ämne=" + s2.amne : "null");
  kontroll("A: flerkällsformat 📖 Källor ( på båda",
    s1?.text.includes("📖 Källor (3)") === true && s2?.text.includes("📖 Källor (4)") === true,
    "prisfullmakten 3 källor · byteskostnad 4 källor");
  kontroll("A: numrerad källista",
    s1?.text.includes("1. ") === true && s1?.text.includes("3. ") === true && s2?.text.includes("4. ") === true,
    "numrerade rader på båda (till respektive antal)");
  kontroll("A: ≥3 kurslänkar per svar",
    (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3 &&
    (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3,
    "prisfullmakt " + (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length +
    " · byteskostnad " + (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length);
  kontroll("A: primärkursen först i källistan",
    s1?.kallor?.[0]?.slug === "mt-07-prisfullmakten" && s2?.kallor?.[0]?.slug === "mt-05-byteskostnader-och-inlasning",
    se([s1?.kallor?.[0]?.slug, s2?.kallor?.[0]?.slug]));
}

// ── FALL A2: wiring — i widgetens kedja efter realekonomi ───────────────────
{
  const minPos = widgetOrdning.indexOf("svaraLokaltMoatdjup");
  const realPos = widgetOrdning.indexOf("svaraLokaltRealekonomi");
  kontroll("A2: svaraLokaltMoatdjup wiread efter realekonomi",
    minPos > realPos && minPos >= 53,
    "position " + (minPos + 1) + " av " + widgetOrdning.length + " (realekonomi " + (realPos + 1) + ")");
  kontroll("A2: importrad finns",
    widgetKalla.includes('import { svaraLokaltMoatdjup } from "@/lib/ai-mentor-moatdjup-fragor";'),
    "widget-import på plats");
}

// ── FALL B: varianter och felstavningar ─────────────────────────────────────
{
  const varianter = [
    "vad är prisfullmakt?",           // obestämd form
    "vad är prisfulmakten?",          // stavfel (dubbelt l → enkelt, tol 1)
    "förklara prisfullmakten",        // imperativ + bestämd form
    "hur testar man moatens prisfullmakt?", // moat-kontext + obestämd
    "vad är prisfullmakterna?",       // plural
    "vad är byteskostnad?",           // obestämd form
    "byteskostnaderna?",              // bestämd plural
    "hur räknar man på byteskostnadr?", // stavfel (tol 1 från byteskostnad)
    "vad är inlåsningseffekten?",     // syskonbegreppet i familjen
    "vad menas med bytes kostnader?", // särskrivning (fras-träff)
  ];
  let n = 0;
  for (const v of varianter) if (svaraLokaltMoatdjup(v, KURSREGISTER) !== null) n++;
  kontroll("B: " + n + "/" + varianter.length + " varianter fångas", n === varianter.length,
    varianter.filter((v) => svaraLokaltMoatdjup(v, KURSREGISTER) === null).join(" · ") || "samtliga");
}

// ── FALL C: determinism ─────────────────────────────────────────────────────
{
  const a = se(svaraLokaltMoatdjup("vad är prisfullmakten? hur räknar jag brytpunkten?", KURSREGISTER));
  const b = se(svaraLokaltMoatdjup("vad är prisfullmakten? hur räknar jag brytpunkten?", KURSREGISTER));
  kontroll("C: determinism (blandad fråga två gånger)", a === b, a === b ? "bitidentiskt" : "AVVIKER");
}

// ── FALL D01: 0 fantomslugar ────────────────────────────────────────────────
{
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const felfynd = [];
  for (const m of MOATDJUP_MONSTER) {
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
  const moatAntal = KURSREGISTER.filter((r) => r.kategori === "MOAT").length;
  const mt07 = KURSREGISTER.find((r) => r.slug === "mt-07-prisfullmakten");
  const mt05 = KURSREGISTER.find((r) => r.slug === "mt-05-byteskostnader-och-inlasning");
  const s1 = svaraLokaltMoatdjup("vad är prisfullmakten?", KURSREGISTER);
  const s2 = svaraLokaltMoatdjup("vad är byteskostnader?", KURSREGISTER);
  const vanta1 = "I moat-kategorin finns " + moatAntal + " kurser — huvudkursen (" + mt07.minuter + " min, " + mt07.niva.toLowerCase() + " nivå";
  const vante2 = "I moat-kategorin finns " + moatAntal + " kurser — huvudkursen (" + mt05.minuter + " min, " + mt05.niva.toLowerCase() + " nivå";
  kontroll("D02: registerdrivna tal (antal + minuter + nivå)",
    s1?.text.includes(vanta1) === true && s2?.text.includes(vante2) === true,
    "MOAT=" + moatAntal + " · mt-07 " + mt07.minuter + " min · mt-05 " + mt05.minuter + " min");
}

// ── FALL D03: aritmetik — oberoende omräkning av lagrets egna tal ───────────
{
  const s1 = svaraLokaltMoatdjup("vad är prisfullmakten?", KURSREGISTER)?.text ?? "";
  const s2 = svaraLokaltMoatdjup("vad är byteskostnader?", KURSREGISTER)?.text ?? "";
  const K = [];
  // Prisfullmakten-kontroller (8)
  K.push(["basen (100 − 60) × 100 000 = 4,0 Mkr",
    (100 - 60) * 100000 === 4000000 && s1.includes("(100 − 60) × 100 000 = 4,0 miljoner")]);
  K.push(["höjningen (105 − 60) × 100 000 = 4,5 Mkr",
    (105 - 60) * 100000 === 4500000 && s1.includes("(105 − 60) × 100 000 = 4,5 miljoner")]);
  K.push(["hävstången 4,5 ÷ 4,0 − 1 = 12,5 procent",
    Math.abs(4.5 / 4 - 1 - 0.125) < 1e-12 && s1.includes("4,5 ÷ 4,0 − 1 = 12,5 procent")]);
  K.push(["spegeln (95 − 60) × 100 000 = 3,5 Mkr = −12,5 %",
    (95 - 60) * 100000 === 3500000 && s1.includes("(95 − 60) × 100 000 = 3,5 miljoner") && s1.includes("minus 12,5 procent")]);
  K.push(["brytpunkten 4 000 000 ÷ 45 = 88 888,9",
    Math.abs(4000000 / 45 - 88888.888) < 0.01 && s1.includes("4 000 000 ÷ 45 = 88 888,9")]);
  K.push(["tappet 100 000 − 88 888,9 = 11 111,1",
    Math.abs(100000 - 88888.9 - 11111.1) < 0.05 && s1.includes("100 000 − 88 888,9 = 11 111,1")]);
  K.push(["andelen 11,1 procent",
    Math.abs(11111.1 / 100000 - 0.111) < 0.001 && s1.includes("11,1 procent av kunderna")]);
  K.push(["spegel-hävstången −12,5 % = 3,5/4,0 − 1",
    Math.abs(3.5 / 4 - 1 + 0.125) < 1e-12 && s1.includes("minus 12,5 procent")]);
  // Byteskostnad-kontroller (6)
  K.push(["livstid djup 1 ÷ 0,02 = 50 år",
    Math.abs(1 / 0.02 - 50) < 1e-9 && s2.includes("1 ÷ 0,02 = 50 år")]);
  K.push(["värde djup 8 000 × 50 = 400 000",
    8000 * 50 === 400000 && s2.includes("8 000 × 50 = 400 000")]);
  K.push(["livstid grund 1 ÷ 0,20 = 5 år",
    Math.abs(1 / 0.2 - 5) < 1e-9 && s2.includes("1 ÷ 0,20 = 5 år")]);
  K.push(["värde grund 8 000 × 5 = 40 000",
    8000 * 5 === 40000 && s2.includes("8 000 × 5 = 40 000")]);
  K.push(["kvoten 400 000 ÷ 40 000 = 10",
    400000 / 40000 === 10 && s2.includes("400 000 ÷ 40 000 = 10")]);
  K.push(["tiofalt på oförändrad marginal",
    8000 === 8000 && s2.includes("TIOFALT kundvärde på exakt samma marginal")]);
  const fel = K.filter(([, ok]) => !ok).map(([namn]) => namn);
  kontroll("D03: " + (K.length - fel.length) + "/" + K.length + " aritmetikkontroller", fel.length === 0, fel.join(" · ") || "samtliga oberoende omräknade");
}

// ── FALL E: genomströmning ──────────────────────────────────────────────────
{
  const nuller = [
    "vilket bolag ska jag köpa?", "vilken färg har månen?",
    "vad är en moat?",               // extra-lagrets — dokumenterad gräns
    "vad är en vallgrav?",           // extra-lagrets
    "vallgraven i siffror?",         // extra-lagrets (sond-rond 1-bevis)
    "hur föds en vallgrav?",         // extra-lagrets
    "vad är kostnadsöverlägsenhet?", // stärkord kan inte trigga — gränsvakt
    "vad är kvalitetspremien?",      // stärkord kan inte trigga — gränsvakt
    "vad är moat-erosion?",          // mt-02:s område — aldrig mitt kärnord
    "vad är en konkurs?",            // överlevnadsdjupets
    "vad är en bullmarknad?",        // dokumenterad fribit för framtida lager
  ];
  const n = nuller.filter((q) => svaraLokaltMoatdjup(q, KURSREGISTER) === null).length;
  kontroll("E: " + n + "/" + nuller.length + " omatchade/gränsfrågor → null", n === nuller.length,
    nuller.filter((q) => svaraLokaltMoatdjup(q, KURSREGISTER) !== null).join(" · ") || "lagret tystnar korrekt (gränserna respekterade)");
}

// ── FALL F: juridikgrind (2007:528) ─────────────────────────────────────────
{
  const radslagna = [...MOATDJUP_MONSTER.map((m) => m.bygga(KURSREGISTER).text)].join("\n").toLowerCase();
  const radsfraser = ["köp denna", "köp aktien", "sälj aktien", "sälj nu", "rekommenderar vi", "vi rekommenderar", "borde köpa", "placera dina pengar i", "investera i detta"];
  const fynd = radsfraser.filter((f) => radslagna.includes(f));
  kontroll("F: 0 rådsfraser", fynd.length === 0, fynd.length ? fynd.join(" · ") : "inga köp-/säljsignaler");
  kontroll("F: utbildningsframing närvarande",
    radslagna.includes("utbildning i hur metoden fungerar") && radslagna.includes("inga placeringstips") && radslagna.includes("påhittade tal"),
    "metod-framing + placeringstips-frihet + påhittade-tal-deklaration");
}

// ── FALL G: antistöld — mina kärnord fångar ingen kedjefråga ────────────────
{
  const minaOrd = MOATDJUP_MONSTER.flatMap((m) => m.karnord);
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
  const q1 = "vad är prisfullmakten?";
  const q2 = "vad är byteskostnader?";
  let kedjanUtanMig1 = null;
  let kedjanUtanMig2 = null;
  for (const sys of SYSKON) {
    try { const s = sys.fnk(q1, KURSREGISTER); if (s) { kedjanUtanMig1 = sys.fn; break; } } catch { /* ignore */ }
  }
  for (const sys of SYSKON) {
    try { const s = sys.fnk(q2, KURSREGISTER); if (s) { kedjanUtanMig2 = sys.fn; break; } } catch { /* ignore */ }
  }
  kontroll("H: mina två frågor fångas av MIG, null hos alla syskon",
    svaraLokaltMoatdjup(q1, KURSREGISTER) !== null &&
    svaraLokaltMoatdjup(q2, KURSREGISTER) !== null &&
    kedjanUtanMig1 === null && kedjanUtanMig2 === null,
    "prisfullmakt: " + (kedjanUtanMig1 ?? "null") + " · byteskostnad: " + (kedjanUtanMig2 ?? "null") + " hos syskonen");
}

// ── FALL I: omvänd stöld — «vad är en moat?» förblir extra-lagrets ──────────
{
  const extra = SYSKON.find((s) => s.fn === "svaraLokaltExtra");
  const moatSvar = extra ? extra.fnk("vad är en moat?", KURSREGISTER) : null;
  kontroll("I: «vad är en moat?» förblir extra-lagrets (dokumenterad gräns)",
    moatSvar !== null && svaraLokaltMoatdjup("vad är en moat?", KURSREGISTER) === null,
    "moat " + (moatSvar ? "fångas av extra" : "NULL hos extra!") + " · NULL hos mig");
}

// ── FALL J: inbördes kärnordsdisjunktion ────────────────────────────────────
{
  const [m1, m2] = MOATDJUP_MONSTER;
  const k1 = new Set(m1.karnord.map(diafri));
  const overlap = m2.karnord.filter((k) => k1.has(diafri(k)));
  kontroll("J: lagrets monsters kärnord disjunkta", overlap.length === 0,
    overlap.length ? "delade: " + overlap.join(", ") : m1.karnord.length + " + " + m2.karnord.length + " skilda ord");
}

// ── FALL L: widget-synk ─────────────────────────────────────────────────────
{
  const iKomposition = kompositionsrad?.[1].includes("svaraLokaltMoatdjup(q, KURSREGISTER)") ?? false;
  kontroll("L: widget-synk (import + komposition)", iKomposition, "båda wiring-ställena på plats");
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("AI-MENTORN MOATDJUP (omgång 24, s6-u2): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
