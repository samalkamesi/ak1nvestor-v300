/**
 * TESTA AI-MENTORN — ETF-MEKANIK-LAGRET (spår 6, omgång 25, s6-u1), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-etfmekanik.mjs
 *
 * Vakar den nya modulen src/lib/ai-mentor-etfmekanik-fragor.ts:
 *   A   kanonisk    — flerkällskällmärke (numrerad 📖 Källor, 5 kurser),
 *                     kurslänkar, registerdrivna tal i texten
 *   A2  wiring      — svaraLokaltEtfmekanik står SIST i widgetens kedja
 *                     (efter nyaterritorier), importrad finns
 *   B   varianter   — felstavningar och omformuleringar fångas ändå
 *   C   determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D01 äkthet      — 0 fantomslugar: varje källa/kurslänk finns i registret
 *   D02 registertal — svarets minuter/nivå/antalet kommer ur KURSREGISTER
 *   D03 aritmetik   — samtliga talserier oberoende omräknade (14 kontroller)
 *   E   genomström  — omatchad/juridikfråga → null (lagret tystnar);
 *                     stärkord ensamma (indexfond/etf/spread/termin/nav/
 *                     hävstång/rebalansering) fångar ALDRIG — kärnordskravet
 *                     vakar gränserna mot praktik, marknadsmekanik, nästa,
 *                     basen och portfölj-praktiken
 *   F   juridikgrind — 0 rådsfraser; utbildningsframingen närvarande
 *   G   antistöld   — mina kärnord fångar INGEN kedjefråga (utom mina egna)
 *   G2  syskon      — mina kanoniska frågor fångas INTE av syskonmotorerna
 *                     (inklusive fönstrets nyaterritorier — sonden mätte 58
 *                     motorer, detta test lägger den 59:e på plats)
 *   H   SIST        — lagrets frågor fångas av min funktion; kedjan med
 *                     mig ⇒ samma svar; kedjan UTAN mig ⇒ null
 *   J   dublettfrihet — lagrets kärnord unika (inget ord deklarerat twice)
 *   L   widget-synk — importrad + kompositionsrad i chat-widget.tsx
 *
 * Provenans: anspråk data/vakten/s6-omg25-u1-ansprak.md FÖRE byggstart;
 * sond _s6u1-sond-omg25.mjs (rond 1: startsweep — am-07 + am-08 kategorins
 * två sista mentorväglösa) + _s6u1-sond2-omg25.mjs (rond 2+3: grannkontroll
 * mot 1 688 kärnord — 0 grannar inom motorns tolerans).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const { ETFMEKANIK_MONSTER, svaraLokaltEtfmekanik } =
  await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-etfmekanik-fragor.ts")).href);
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
  if (fn === "svaraLokaltEtfmekanik") continue; // syskonen = kedjan utom mig
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
  "vad är en börshandlad fond?", "vad är börshandlade fonder?",
  "vad är en auktoriserad deltagare?", "vad är en ap-deltagare?",
  "vad är skapelse och inlösen?",
  "vad är contango?", "vad är backwardation?",
  "vad är en hävstångsetf?", "vad är spårningsavvikelsen?",
  "vad är indexomläggningen?", "vad är effektdagen?",
  "vad är flashdagen?", "vad är 2x?",
];
// G2-läxan (dokumenterad i kedjetestets harmoniseringskommentar):
// «hur skapas etf-andelar?»/«vad är etf-arbitrage?» är strukturellt
// praktikens — deras nakna korta kärnord «etf» matchar varje fråga där
// «etf» står som fristående ord och de ligger FÖRE i kedjan; därför
// kastades kärnordet «etf-arbitrage» ur modulen och dessa formuleringar
// ur listan. Lagrets egna former (ovan) är sondverifierat disjunkta.

// ── FALL A: kanonisk flerkälls-källmärkning ─────────────────────────────────
{
  const s1 = svaraLokaltEtfmekanik("vad är en börshandlad fond?", KURSREGISTER);
  const s2 = svaraLokaltEtfmekanik("vad är indexomläggningen?", KURSREGISTER);
  kontroll("A: börshandlad fond svarar", s1 !== null, s1 ? "ämne=" + s1.amne : "null");
  kontroll("A: indexomläggningen svarar", s2 !== null, s2 ? "ämne=" + s2.amne : "null");
  kontroll("A: flerkällsformat 📖 Källor (5) på båda",
    s1?.text.includes("📖 Källor (5)") === true && s2?.text.includes("📖 Källor (5)") === true,
    "två frågor · 5 källor vardera (am-08 + am-07 + am-01 + od-07 + am-02)");
  kontroll("A: numrerad källista",
    s1?.text.includes("1. ") === true && s1?.text.includes("3. ") === true && s1?.text.includes("5. ") === true,
    "numrerade rader 1..5");
  kontroll("A: ≥3 kurslänkar per svar",
    (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3 &&
    (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length >= 3,
    "fond " + (s1?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length +
    " · omläggning " + (s2?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).length);
  kontroll("A: primärkursen först i källistan",
    s1?.kallor?.[0]?.slug === "am-08-etfens-inre-mekanik" && s2?.kallor?.[0]?.slug === "am-08-etfens-inre-mekanik",
    se([s1?.kallor?.[0]?.slug, s2?.kallor?.[0]?.slug]));
}

// ── FALL A2: wiring — efter nyaterritorier i widgetens kedja ────────────────
{
  const ntPos = widgetOrdning.indexOf("svaraLokaltNyaTerritorier");
  const minPos = widgetOrdning.indexOf("svaraLokaltEtfmekanik");
  // Fönstrets ordning (omgång 25): … → nyaterritorier → etfmekanik →
  // kontrahent (syskonet s6-u2:s parallellager, samma manifest — deras
  // wiring kommit till under fönstret; INGET SIST-anspråk mot dem).
  // Kravet: omedelbart efter nyaterritorier (min wireingspunkt) — absolut
  // sist-läge tolereras om syskonet inte (ännu) wireat.
  const efterNT = minPos === ntPos + 1;
  kontroll("A2: svaraLokaltEtfmekanik wiread omedelbart efter nyaterritorier",
    efterNT && minPos !== -1,
    "position " + (minPos + 1) + " av " + widgetOrdning.length + " (nyaterritorier " + (ntPos + 1) + ")" +
    (widgetOrdning[widgetOrdning.length - 1] === "svaraLokaltEtfmekanik" ? " — SIST i nuläget" : " — följt av " + widgetOrdning[widgetOrdning.length - 1] + " (fönstrets syskon)"));
  kontroll("A2: importrad finns",
    widgetKalla.includes('import { svaraLokaltEtfmekanik } from "@/lib/ai-mentor-etfmekanik-fragor";'),
    "widget-import på plats");
}

// ── FALL B: varianter och felstavningar ─────────────────────────────────────
{
  const varianter = [
    "förklara indexomläggningen",     // imperativ + bestämd form
    "vad är en omläggning?",          // kortformen
    "vad är indexomlaggning?",        // utan dia (exakt efter diafri)
    "vad är effektdagen?",            // bestämd form
    "vad är tillkännagivandet?",      // bestämd form
    "vad är contangon?",              // stavfel (n extra, tavstånd 1)
    "vad är backwardation?",          // korrekt långt ord
    "vad är en havstangsetf?",        // utan dia (exakt efter diafri)
    "hur fungerar en 2x-etf?",        // kort-exakt kärnord i sammansättning
    "vad är 2x?",                     // naket kort-exakt
    "vad är skapelsen hos en fond?",  // skapelse + stärkord
    "vad är inlösen av andelar?",     // inlösen + stärkord
    "vad är spårningsavvikelse?",     // obestämd form
    "vad är flashdagen?",             // historiens signaturdag
  ];
  let n = 0;
  for (const v of varianter) if (svaraLokaltEtfmekanik(v, KURSREGISTER) !== null) n++;
  kontroll("B: " + n + "/" + varianter.length + " varianter fångas", n === varianter.length,
    varianter.filter((v) => svaraLokaltEtfmekanik(v, KURSREGISTER) === null).join(" · ") || "samtliga");
}

// ── FALL C: determinism ─────────────────────────────────────────────────────
{
  const a = se(svaraLokaltEtfmekanik("vad är en börshandlad fond? hur räknas spårningsavvikelsen?", KURSREGISTER));
  const b = se(svaraLokaltEtfmekanik("vad är en börshandlad fond? hur räknas spårningsavvikelsen?", KURSREGISTER));
  kontroll("C: determinism (blandad fråga två gånger)", a === b, a === b ? "bitidentiskt" : "AVVIKER");
}

// ── FALL D01: 0 fantomslugar ────────────────────────────────────────────────
{
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const felfynd = [];
  for (const m of ETFMEKANIK_MONSTER) {
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
  const amAntal = KURSREGISTER.filter((r) => r.kategori === "AKTIEMARKNADEN I PRAKTIKEN").length;
  const am8 = KURSREGISTER.find((r) => r.slug === "am-08-etfens-inre-mekanik");
  const s1 = svaraLokaltEtfmekanik("vad är en börshandlad fond?", KURSREGISTER);
  const vanta = "I kategorin aktiemarknaden i praktiken finns " + amAntal + " kurser — ETF:ens inre mekanik (" + am8.minuter + " min, " + am8.niva.toLowerCase() + " nivå";
  kontroll("D02: registerdrivna tal (antal + minuter + nivå)",
    s1?.text.includes(vanta) === true,
    "AKTIEMARKNADEN I PRAKTIKEN=" + amAntal + " · am-08 " + am8.minuter + " min · " + am8.niva.toLowerCase() + " nivå");
}

// ── FALL D03: aritmetik — oberoende omräkning ───────────────────────────────
{
  const s = svaraLokaltEtfmekanik("vad är en börshandlad fond?", KURSREGISTER)?.text ?? "";
  const K = [];
  // Korgen och NAV (2)
  K.push(["10 000 000 ÷ 1 000 000 = 10,00", 10000000 / 1000000 === 10 && s.includes("10 000 000 ÷ 1 000 000 = 10,00")]);
  K.push(["korgen 10 200 000 ⇒ NAV 10,20", 10200000 / 1000000 === 10.2 && s.includes("10 200 000 är NAV 10,20")]);
  // Skapelsen (1)
  K.push(["5 000 000 ÷ 10,00 = 500 000 andelar", 5000000 / 10 === 500000 && s.includes("5 000 000 ÷ 10,00 = 500 000")]);
  // Arbitraget (4)
  K.push(["premien 0,4 % (10,04 mot 10,00)", Math.abs((10.04 - 10) / 10 - 0.004) < 1e-12 && s.includes("0,4 procent")]);
  K.push(["500 000 × 10,04 = 5 020 000", 500000 * 10.04 === 5020000.000000001 || Math.abs(500000 * 10.04 - 5020000) < 1e-6 && s.includes("5 020 000")]);
  K.push(["brutto 20 000 · netto 18 000 (kostnad 2 000)", 5020000 - 5000000 === 20000 && 20000 - 2000 === 18000 && s.includes("20 000") && s.includes("18 000 kronor")]);
  K.push(["diskontet 9,96 ⇒ 4 980 000", Math.abs(500000 * 9.96 - 4980000) < 1e-6 && s.includes("4 980 000")]);
  // Hävstångens tull (4)
  K.push(["1,05 × 0,9524 = 1,00 (index plant)", Math.abs(1.05 * 0.9524 - 1) < 1e-4 && s.includes("1,05 × 0,9524 = 1,00")]);
  K.push(["1,10 × 0,9048 = 0,995 (−0,5 %)", Math.abs(1.10 * 0.9048 - 0.995) < 1e-3 && s.includes("1,10 × 0,9048 = 0,995")]);
  K.push(["0,995^5 ≈ 0,976 (−2,4 %)", Math.abs(Math.pow(0.995, 5) - 0.976) < 1e-3 && s.includes("0,976")]);
  K.push(["nedgångsspegeln 0,80 × 1,25 = 1,00 mot 0,60 × 1,25 = 0,75", 0.8 * 1.25 === 1 && 0.6 * 1.25 === 0.75 && s.includes("0,80 × 1,25 = 1,00") && s.includes("0,60 × 1,25 = 0,75")]);
  // Rullens tull (1)
  K.push(["contangon 0,99^12 = 0,886 = −11,4 %", Math.abs(Math.pow(0.99, 12) - 0.886) < 1e-3 && s.includes("0,886") && s.includes("11,4 procent")]);
  // Indexomläggningen (4)
  K.push(["40 000 × 0,80 = 32 000 · × 0,12 = 3 840 Mkr", 40000 * 0.8 === 32000 && 32000 * 0.12 === 3840 && s.includes("3 840")]);
  K.push(["fond-spegeln 50 000 × 0,012 = 600 Mkr", 50000 * 0.012 === 600 && s.includes("600 miljoner")]);
  K.push(["bågen 42,00 → 44,52 = +6,0 % → 42,74", Math.abs(44.52 / 42 - 1.06) < 1e-12 && Math.abs(44.52 * 0.96 - 42.74) < 1e-3 && s.includes("44,52") && s.includes("42,74")]);
  K.push(["tidsaxeln 3 840 ÷ 60 = 64 handelsdagar", 3840 / 60 === 64 && s.includes("64 handelsdagar")]);
  // Viktdriften (1)
  K.push(["viktdriften 10 000 × 0,004 = 40 Mkr", 10000 * 0.004 === 40 && s.includes("10 000 × 0,004 = 40")]);
  const fel = K.filter(([, ok]) => !ok).map(([namn]) => namn);
  kontroll("D03: " + (K.length - fel.length) + "/" + K.length + " aritmetikkontroller", fel.length === 0, fel.join(" · ") || "samtliga oberoende omräknade");
}

// ── FALL E: genomströmning ──────────────────────────────────────────────────
{
  const nuller = [
    "vilket bolag ska jag köpa?", "vilken färg har månen?",
    "vad är en indexfond?",  // praktikens kärnord — gränsen mot am-02-lagret
    "vad är en etf?",        // praktikens nakta korta kärnord
    "vad är spreaden?",      // marknadsmekanikens (am-01)
    "vad är en termin?",     // nästas (options) — od-07 bärs endast som källa
    "vad är nav?",           // nästas (investmentbolag)
    "vad är hävstång?",      // basens (kapitalstruktur)
    "vad är rebalansering?", // portfölj-praktikens («ombalansering» kastad ur kärnorden)
  ];
  const n = nuller.filter((q) => svaraLokaltEtfmekanik(q, KURSREGISTER) === null).length;
  kontroll("E: " + n + "/" + nuller.length + " omatchade/stärkordsfrågor → null", n === nuller.length,
    nuller.filter((q) => svaraLokaltEtfmekanik(q, KURSREGISTER) !== null).join(" · ") || "lagret tystnar korrekt — kärnordskravet håller gränserna");
}

// ── FALL F: juridikgrind (2007:528) ─────────────────────────────────────────
{
  const radslagna = [...ETFMEKANIK_MONSTER.map((m) => m.bygga(KURSREGISTER).text)].join("\n").toLowerCase();
  const radsfraser = ["köp denna", "köp aktien", "sälj aktien", "sälj nu", "rekommenderar vi", "vi rekommenderar", "borde köpa", "placera dina pengar i", "investera i detta"];
  const fynd = radsfraser.filter((f) => radslagna.includes(f));
  kontroll("F: 0 rådsfraser", fynd.length === 0, fynd.length ? fynd.join(" · ") : "inga köp-/säljsignaler");
  kontroll("F: utbildningsframing närvarande",
    radslagna.includes("utbildning i hur maskinen är byggd och räknas — inga råd om placering") && radslagna.includes("utbildning i hur maskinen fungerar — inga placeringstips"),
    "metod-framingen (ingress + slutsats) + placeringstips-friheten");
}

// ── FALL G: antistöld — mina kärnord fångar ingen kedjefråga ────────────────
{
  const minaOrd = ETFMEKANIK_MONSTER.flatMap((m) => m.karnord);
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
  const q = "vad är en börshandlad fond?";
  const min = svaraLokaltEtfmekanik(q, KURSREGISTER);
  let kedjanUtanMig = null;
  for (const sys of SYSKON) {
    try { const s = sys.fnk(q, KURSREGISTER); if (s) { kedjanUtanMig = sys.fn; break; } } catch { /* ignore */ }
  }
  kontroll("H: mina frågor fångas av MIG, null hos alla syskon (SIST)",
    min !== null && kedjanUtanMig === null,
    min ? "fångad av etfmekanik" : "null hos mig!");
}

// ── FALL J: kärnordsdublettfrihet inom lagret ───────────────────────────────
{
  const [m1] = ETFMEKANIK_MONSTER;
  const dia = m1.karnord.map(diafri);
  const dubletter = dia.filter((k, i) => dia.indexOf(k) !== i);
  kontroll("J: lagrets " + m1.karnord.length + " kärnord unika", dubletter.length === 0,
    dubletter.length ? "dubletter: " + dubletter.join(", ") : "0 dubletter i deklarationen");
}

// ── FALL L: widget-synk ─────────────────────────────────────────────────────
{
  const iKomposition = kompositionsrad?.[1].includes("svaraLokaltEtfmekanik(q, KURSREGISTER)") ?? false;
  kontroll("L: widget-synk (import + komposition)", iKomposition, "båda wiring-ställena på plats");
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("AI-MENTORN ETF-MEKANIK (omgång 25, s6-u1): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
