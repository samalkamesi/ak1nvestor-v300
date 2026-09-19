/**
 * TESTA AI-MENTORN — RISKBUDGET-LAGRET (spår 6, omgång 22, s6-u2, manifest
 * auto-s6-1789791914561), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-riskbudget.mjs
 *
 * Vakar den nya modulen src/lib/ai-mentor-riskbudget-fragor.ts:
 *   A   kanonisk    — flerkällskällmärke (numrerad 📖 Källor), ≥3 källor,
 *                     kurslänkar, registerdrivna tal i texten
 *   A2  wiring      — svaraLokaltRiskbudget wiread i widgetens kedja efter
 *                     tillväxtdjup (position 47+; trefönster-tolerant: syskon
 *                     i samma fönster — u1 konvertibel, u3 bokmastar — kan
 *                     wirea efter utan att detta fall roterar, omgång 20–21-
 *                     presedensen), importrad finns
 *   B   varianter   — felstavningar och omformuleringar fångas ändå
 *   C   determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D01 äkthet      — 0 fantomslugar: varje källa/kurslänk finns i registret
 *   D02 registertal — svarets minuter/nivå/antalet kommer ur KURSREGISTER
 *   D03 aritmetik   — kursens egna talserier oberoende omräknade (18 kontroller)
 *   E   genomström  — omatchad/juridikfråga → null (lagret tystnar)
 *   F   juridikgrind — 0 rådsfraser; utbildningsframingen närvarande
 *   G   antistöld   — mina kärnord fångar INGEN kedjefråga (utom mina egna)
 *   G2  syskon      — mina kanoniska frågor fångas INTE av syskonmotorerna
 *   H   SIST-invariant — mina monsters frågor fångas av min funktion; null
 *                     hos alla syskon (kedjan utan mig ⇒ null)
 *   J   disjunktion — lagrets två monsters kärnord är inbördes disjunkta
 *   L   widget-synk — importrad + kompositionsrad i chat-widget.tsx
 *
 * Sondestensdoktrin (omgång 21–22): funktionskartan läser importlistor med
 * FLERA namn (basens «svaraLokalt, fallbackSvar») — basen med i syskonmängden.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const { RISKBUDGET_MONSTER, svaraLokaltRiskbudget } =
  await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-riskbudget-fragor.ts")).href);
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
  if (fn === "svaraLokaltRiskbudget") continue; // syskonen = kedjan utom mig
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
  "vad är volatilitetsbudgeten?", "vad är volatilitetsbudget?",
  "vad är riskbudget?",
  "vad är sortino?", "vad är sortino-kvoten?", "vad är sortinokvoten?",
  "vad är calmar?", "vad är calmar-kvoten?", "vad är calmarkvoten?",
  "vad är tre mått tre frågor?",
];

// ── FALL A: kanonisk flerkälls-källmärkning ─────────────────────────────────
{
  const s1 = svaraLokaltRiskbudget("vad är volatilitetsbudgeten?", KURSREGISTER);
  const s2 = svaraLokaltRiskbudget("vad är sortino?", KURSREGISTER);
  kontroll("A: volatilitetsbudgeten svarar", s1 !== null, s1 ? "ämne=" + s1.amne : "null");
  kontroll("A: sortino svarar", s2 !== null, s2 ? "ämne=" + s2.amne : "null");
  kontroll("A: flerkällsformat 📖 Källor ( på båda",
    s1?.text.includes("📖 Källor (4)") === true && s2?.text.includes("📖 Källor (3)") === true,
    "budgeten 4 källor · sortino 3 källor");
  kontroll("A: numrerad källista",
    s1?.text.includes("1. ") === true && s1?.text.includes("4. ") === true && s2?.text.includes("3. ") === true,
    "numrerade rader 1..4 respektive 1..3");
  kontroll("A: ≥3 kurslänkar per svar",
    (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3 &&
    (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3,
    "budgeten " + (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length +
    " · sortino " + (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length);
  kontroll("A: primärkursen först i källistan",
    s1?.kallor?.[0]?.slug === "rp-04-volatilitetsbudgeten" && s2?.kallor?.[0]?.slug === "rp-02-tre-matt-tre-fragor",
    se([s1?.kallor?.[0]?.slug, s2?.kallor?.[0]?.slug]));
}

// ── FALL A2: wiring — i widgetens kedja efter tillväxtdjup ──────────────────
{
  const minPos = widgetOrdning.indexOf("svaraLokaltRiskbudget");
  const tvxPos = widgetOrdning.indexOf("svaraLokaltTillvaxtdjup");
  kontroll("A2: svaraLokaltRiskbudget wiread efter tillväxtdjup",
    minPos > tvxPos && minPos >= 46,
    "position " + (minPos + 1) + " av " + widgetOrdning.length + " (tillväxtdjup " + (tvxPos + 1) + ")");
  kontroll("A2: importrad finns",
    widgetKalla.includes('import { svaraLokaltRiskbudget } from "@/lib/ai-mentor-riskbudget-fragor";'),
    "widget-import på plats");
}

// ── FALL B: varianter och felstavningar ─────────────────────────────────────
{
  const varianter = [
    "vad är volatilitetsbudget?",      // obestämd form
    "vad menas med volatilitetsbudget?", // omformulering
    "hur sätter jag en volatilitetsbudget?", // hur-fråga
    "vad är volatilitetsbudgtet?",     // stavfel (d→t, tol 2)
    "vad är riskbudgeten?",            // bestämd form
    "förklara sortino",                // imperativ-formulering
    "vad är sortinokvoten?",           // sammansatt form
    "vad är sortino måttet?",          // mått-formulering
    "vad är calmarkvoten?",            // sammansatt form
    "vad är calmar talet?",            // tal-formulering
  ];
  let n = 0;
  for (const v of varianter) if (svaraLokaltRiskbudget(v, KURSREGISTER) !== null) n++;
  kontroll("B: " + n + "/" + varianter.length + " varianter fångas", n === varianter.length,
    varianter.filter((v) => svaraLokaltRiskbudget(v, KURSREGISTER) === null).join(" · ") || "samtliga");
}

// ── FALL C: determinism ─────────────────────────────────────────────────────
{
  const a = se(svaraLokaltRiskbudget("vad är volatilitetsbudgeten? hur återförs vikten?", KURSREGISTER));
  const b = se(svaraLokaltRiskbudget("vad är volatilitetsbudgeten? hur återförs vikten?", KURSREGISTER));
  kontroll("C: determinism (blandad fråga två gånger)", a === b, a === b ? "bitidentiskt" : "AVVIKER");
}

// ── FALL D01: 0 fantomslugar ────────────────────────────────────────────────
{
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const felfynd = [];
  for (const m of RISKBUDGET_MONSTER) {
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
  const rpAntal = KURSREGISTER.filter((r) => r.kategori === "RISKHANTERING & PORTFÖLJTEORI").length;
  const rp04 = KURSREGISTER.find((r) => r.slug === "rp-04-volatilitetsbudgeten");
  const rp02 = KURSREGISTER.find((r) => r.slug === "rp-02-tre-matt-tre-fragor");
  const s1 = svaraLokaltRiskbudget("vad är volatilitetsbudgeten?", KURSREGISTER);
  const s2 = svaraLokaltRiskbudget("vad är sortino?", KURSREGISTER);
  const vanta1 = "I kategorin riskhantering & portföljteori finns " + rpAntal + " kurser — huvudkursen (" + rp04.minuter + " min, " + rp04.niva.toLowerCase() + " nivå";
  const vante2 = "I kategorin riskhantering & portföljteori finns " + rpAntal + " kurser — huvudkursen (" + rp02.minuter + " min, " + rp02.niva.toLowerCase() + " nivå";
  kontroll("D02: registerdrivna tal (antal + minuter + nivå)",
    s1?.text.includes(vanta1) === true && s2?.text.includes(vante2) === true,
    "RP=" + rpAntal + " · rp-04 " + rp04.minuter + " min · rp-02 " + rp02.minuter + " min");
}

// ── FALL D03: aritmetik — oberoende omräkning av kursens egna tal ───────────
{
  const s1 = svaraLokaltRiskbudget("vad är volatilitetsbudgeten?", KURSREGISTER)?.text ?? "";
  const s2 = svaraLokaltRiskbudget("vad är sortino?", KURSREGISTER)?.text ?? "";
  const K = [];
  // Volatilitetsbudgetens kontroller (11)
  const w60 = 0.6, w70 = 0.7, wB = (2 + Math.sqrt(124)) / 20, wA = (2 + Math.sqrt(208)) / 34;
  K.push(["60/40: 116,64 + 5,76 = 122,4 ⇒ 11,06",
    Math.abs(w60 ** 2 * 324 - 116.64) < 1e-9 && Math.abs((1 - w60) ** 2 * 36 - 5.76) < 1e-9 &&
    Math.abs(Math.sqrt(w60 ** 2 * 324 + (1 - w60) ** 2 * 36) - 11.06) < 0.005 &&
    s1.includes("116,64 + 5,76 = 122,4") && s1.includes("11,06")]);
  K.push(["70/30: 158,76 + 3,24 = 162,0 ⇒ 12,73",
    Math.abs(w70 ** 2 * 324 - 158.76) < 1e-9 && Math.abs((1 - w70) ** 2 * 36 - 3.24) < 1e-9 &&
    Math.abs(Math.sqrt(162) - 12.73) < 0.005 && s1.includes("158,76 + 3,24 = 162,0") && s1.includes("12,73")]);
  K.push(["10w² − 2w − 3 = 0 ⇒ w = 0,6568 (65,7 %)",
    Math.abs(wB - 0.6568) < 0.0005 && Math.abs(10 * wB ** 2 - 2 * wB - 3) < 1e-9 && s1.includes("0,6568") && s1.includes("65,7")]);
  K.push(["kontroll 139,76 + 4,24 = 144,00 ⇒ 12,00",
    Math.abs(wB ** 2 * 324 - 139.76) < 0.02 && Math.abs((1 - wB) ** 2 * 36 - 4.24) < 0.01 &&
    Math.abs(Math.sqrt(144) - 12) < 1e-9 && s1.includes("139,76 + 4,24 = 144,00")]);
  K.push(["kvadratlagen 3:1 ⇒ 9:1 (90/10)",
    (3 ** 2 === 9) && s1.includes("90/10")]);
  K.push(["svängen 24² = 576 ⇒ 248,46 + 4,24 = 252,70 ⇒ 15,90",
    24 ** 2 === 576 && Math.abs(wB ** 2 * 576 - 248.46) < 0.03 &&
    Math.abs(Math.sqrt(252.7) - 15.9) < 0.005 && s1.includes("248,46 + 4,24 = 252,70") && s1.includes("15,90")]);
  K.push(["överskott 3,90 pp = 32,5 % över taket",
    Math.abs(15.9 - 12 - 3.9) < 1e-9 && Math.abs(3.9 / 12 - 0.325) < 1e-9 && s1.includes("3,90") && s1.includes("32,5")]);
  K.push(["återförd 17w² − 2w − 3 = 0 ⇒ w = 0,4830 (48,3/51,7)",
    Math.abs(wA - 0.483) < 0.0005 && Math.abs(17 * wA ** 2 - 2 * wA - 3) < 1e-9 && s1.includes("0,4830") && s1.includes("48,3/51,7")]);
  K.push(["återförd kontroll 134,38 + 9,62 = 144,00",
    Math.abs(wA ** 2 * 576 - 134.38) < 0.02 && Math.abs((1 - wA) ** 2 * 36 - 9.62) < 0.01 && s1.includes("134,38 + 9,62 = 144,00")]);
  K.push(["bandet tolv plus minus ett",
    s1.includes("tolv plus minus ett")]);
  K.push(["65,7/34,3 budgetviktens andel stavas rätt",
    s1.includes("65,7 procent aktier och 34,3 procent räntepapper")]);
  // Sortino/Calmar-kontroller (7)
  K.push(["Sharpe (12,0 − 2,0) ÷ 10,0 = 1,00",
    Math.abs((12 - 2) / 10 - 1) < 1e-9 && s2.includes("(12,0 − 2,0) ÷ 10,0 = 1,00")]);
  K.push(["Sortino (12,0 − 2,0) ÷ 7,0 = 1,43",
    Math.abs((12 - 2) / 7 - 1.4286) < 0.0005 && s2.includes("÷ 7,0 = 1,43")]);
  K.push(["Calmar 12,0 ÷ 15,0 = 0,80",
    Math.abs(12 / 15 - 0.8) < 1e-9 && s2.includes("12,0 ÷ 15,0 = 0,80")]);
  K.push(["spegel Sharpe (9,0 − 2,0) ÷ 7,0 = 1,00 — identiskt",
    Math.abs((9 - 2) / 7 - 1) < 1e-9 && s2.includes("(9,0 − 2,0) ÷ 7,0 = 1,00") && s2.includes("IDENTISKT")]);
  K.push(["spegel Sortino ÷ 6,0 = 1,17 — exempelportföljen vinner",
    Math.abs((9 - 2) / 6 - 1.1667) < 0.0005 && s2.includes("÷ 6,0 = 1,17") && s2.includes("1,43")]);
  K.push(["spegel Calmar 9,0 ÷ 8,0 = 1,13 — spegeln vinner",
    Math.abs(9 / 8 - 1.125) < 1e-9 && s2.includes("9,0 ÷ 8,0 = 1,13") && s2.includes("1,13")]);
  K.push(["√12 ≈ 3,46 · 0,29 × 3,46 ≈ 1,0",
    Math.abs(Math.sqrt(12) - 3.46) < 0.005 && Math.abs(0.29 * 3.46 - 1.0) < 0.005 && s2.includes("3,46")]);
  const fel = K.filter(([, ok]) => !ok).map(([namn]) => namn);
  kontroll("D03: " + (K.length - fel.length) + "/" + K.length + " aritmetikkontroller", fel.length === 0, fel.join(" · ") || "samtliga oberoende omräknade");
}

// ── FALL E: genomströmning ──────────────────────────────────────────────────
{
  const nuller = ["vilket bolag ska jag köpa?", "vilken färg har månen?", "vad är volatilitet?", "vad är risk?", "vad är kelly?", "vad är riskparitet?", "vad är sharpe-kvoten?", "vad är value at risk?"];
  const n = nuller.filter((q) => svaraLokaltRiskbudget(q, KURSREGISTER) === null).length;
  kontroll("E: " + n + "/" + nuller.length + " omatchade/gränsfrågor → null", n === nuller.length,
    nuller.filter((q) => svaraLokaltRiskbudget(q, KURSREGISTER) !== null).join(" · ") || "lagret tystnar korrekt (gränserna respekterade)");
}

// ── FALL F: juridikgrind (2007:528) ─────────────────────────────────────────
{
  const radslagna = [...RISKBUDGET_MONSTER.map((m) => m.bygga(KURSREGISTER).text)].join("\n").toLowerCase();
  const radsfraser = ["köp denna", "köp aktien", "sälj aktien", "sälj nu", "rekommenderar vi", "vi rekommenderar", "borde köpa", "placera dina pengar i", "investera i detta"];
  const fynd = radsfraser.filter((f) => radslagna.includes(f));
  kontroll("F: 0 rådsfraser", fynd.length === 0, fynd.length ? fynd.join(" · ") : "inga köp-/säljsignaler");
  kontroll("F: utbildningsframing närvarande",
    radslagna.includes("utbildning i en metod") && radslagna.includes("inga placeringstips") && radslagna.includes("påhittade tal"),
    "metod-framing + placeringstips-frihet + påhittade-tal-deklaration");
}

// ── FALL G: antistöld — mina kärnord fångar ingen kedjefråga ────────────────
{
  const minaOrd = RISKBUDGET_MONSTER.flatMap((m) => m.karnord);
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
  const q = "vad är volatilitetsbudgeten?";
  const min = svaraLokaltRiskbudget(q, KURSREGISTER);
  let kedjanUtanMig = null;
  for (const sys of SYSKON) {
    try { const s = sys.fnk(q, KURSREGISTER); if (s) { kedjanUtanMig = sys.fn; break; } } catch { /* ignore */ }
  }
  kontroll("H: mina frågor fångas av MIG, null hos alla syskon",
    min !== null && kedjanUtanMig === null,
    min ? "fångad av riskbudget" : "null hos mig!");
}

// ── FALL J: inbördes kärnordsdisjunktion ────────────────────────────────────
{
  const [m1, m2] = RISKBUDGET_MONSTER;
  const k1 = new Set(m1.karnord.map(diafri));
  const overlap = m2.karnord.filter((k) => k1.has(diafri(k)));
  kontroll("J: lagrets monsters kärnord disjunkta", overlap.length === 0,
    overlap.length ? "delade: " + overlap.join(", ") : m1.karnord.length + " + " + m2.karnord.length + " skilda ord");
}

// ── FALL L: widget-synk ─────────────────────────────────────────────────────
{
  const iKomposition = kompositionsrad?.[1].includes("svaraLokaltRiskbudget(q, KURSREGISTER)") ?? false;
  kontroll("L: widget-synk (import + komposition)", iKomposition, "båda wiring-ställena på plats");
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("AI-MENTORN RISKBUDGET (omgång 22, s6-u2): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
