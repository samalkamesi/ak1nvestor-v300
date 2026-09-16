/**
 * TESTA AI-MENTORN — HELA KEDJAN (våg 176, spår 6), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-kedja.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * De per-fil-testerna (testa-ai-mentor*.mjs) vakar var sin motor — men ingen
 * vakar SAMMANSPELLET: chat-widget.tsx komponerar sexton motorer i en ??-kedja
 * där första icke-null vinner. Ett monster i en TIDIG motor kan tyst skugga
 * en senare motors fråga, och per-fil-testerna kan aldrig se det. Detta test
 * vakar kedjan:
 *
 *   G  driftvakt    — widgetens kompositionsordning läses ur källan och
 *                     måste överensstämma med testets kedja (testet kan
 *                     inte ljuga om ordningen)
 *   A  kanoniska    — en fråga per motor: alla TIDIGARE motorer → null,
 *                     förväntad motor → icke-null, kedja ≡ motorns svar
 *   B  skuggprober  — högriskfrågor där tidiga motorers kärnordsfamiljer
 *                     ligger nära (räntenetto vs ränta, substansvärde,
 *                     utspädning, indexfonder)
 *   C  genomström-  — omatchad fråga → null (API-flödet tar över);
 *                     juridikfråga → basens juridikmonster svarar
 *      ning
 *   D  determinism  — samma fråga två gånger ⇒ bitidentiskt svar
 *   E  källmärkning — ALLA monsters (63 i sexton motorer) bygga() ger
 *                     källrad i texten; varje kalla-slug och varje
 *                     fordjupa-/handlings-kurslänk pekar på en äkta slug
 *   F  kursläkthet  — varje monster har ≥2 handlings och ≥1 äkta
 *                     /kurser/-länk
 *   H  struktur     — inventarieråkning per motor + disjunkta id:n över
 *                     alla motorer (nytt monster ⇒ uppdatera inventarien
 *                     medvetet, inte tyst)
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Testfall C vaktar att juridikfrågor ("vilket bolag ska jag köpa?")
 * får ett pedagogiskt svar — aldrig en rekommendation.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// Node >= 22.18 kör .ts-importer direkt; 22.6–22.17 behöver flaggan.
const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-kedja.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// ── Motorerna i KEDJEORDNING (måste spegla chat-widget.tsx — fall G vaktar) ─
// 2026-09-16: sexton motorer / 63 monsters efter fabrikens s6-u1/u2/u3 + om-
// gång 9–10 (ägande, redovisningsdjup, djup, historia, lonsamhetsdjup, tsdjup,
// skattedjup). Workloggen räknar
// frågeformuleringar — monsterantalet här är KODENS sanning (mätt med import).
const MOTORDEFS = [
  { namn: "makro",          fil: "ai-mentor-makro-fragor.ts",          fn: "svaraLokaltMakro",          arr: "MAKRO_MONSTER",          antal: 2 },
  { namn: "extra",          fil: "ai-mentor-extra-fragor.ts",          fn: "svaraLokaltExtra",          arr: "EXTRA_MONSTER",          antal: 3 },
  { namn: "bas",            fil: "ai-mentor-svar.ts",                  fn: "svaraLokalt",               arr: "MONSTER",                antal: 25 },
  { namn: "nästa",          fil: "ai-mentor-nasta-fragor.ts",          fn: "svaraLokaltNasta",          arr: "NASTA_MONSTER",          antal: 3 },
  { namn: "kapitalmekanik", fil: "ai-mentor-kapitalmekanik-fragor.ts", fn: "svaraLokaltKapitalmekanik", arr: "KAPITALMEKANIK_MONSTER", antal: 2 },
  { namn: "sektor",         fil: "ai-mentor-sektor-fragor.ts",         fn: "svaraLokaltSektor",         arr: "SEKTOR_MONSTER",         antal: 3 },
  { namn: "case",           fil: "ai-mentor-case-fragor.ts",           fn: "svaraLokaltCase",           arr: "CASE_MONSTER",           antal: 1 },
  { namn: "praktik",        fil: "ai-mentor-praktik-fragor.ts",        fn: "svaraLokaltPraktik",        arr: "PRAKTIK_MONSTER",        antal: 3 },
  { namn: "portföljgrund",  fil: "ai-mentor-portfoljgrund-fragor.ts",  fn: "svaraLokaltPortfoljgrund",  arr: "PORTFOLJGRUND_MONSTER",  antal: 2 },
  { namn: "ägande",         fil: "ai-mentor-agande-fragor.ts",         fn: "svaraLokaltAgande",         arr: "AGANDE_MONSTER",         antal: 2 },
  { namn: "redovisningsdjup", fil: "ai-mentor-redovisningsdjup-fragor.ts", fn: "svaraLokaltRedovisningsdjup", arr: "REDOVISNINGSDJUP_MONSTER", antal: 2 },
  { namn: "djup",           fil: "ai-mentor-djup-fragor.ts",           fn: "svaraLokaltDjup",           arr: "DJUP_MONSTER",           antal: 3 },
  { namn: "historia",       fil: "ai-mentor-historia-fragor.ts",       fn: "svaraLokaltHistoria",       arr: "HISTORIA_MONSTER",       antal: 3 },
  { namn: "lonsamhetsdjup", fil: "ai-mentor-lonsamhetsdjup-fragor.ts", fn: "svaraLokaltLonsamhetsdjup", arr: "LONSAMHETSDJUP_MONSTER", antal: 2 },
  { namn: "tsdjup",          fil: "ai-mentor-tsdjup-fragor.ts",          fn: "svaraLokaltTsdjup",          arr: "TSDJUP_MONSTER",          antal: 4 },
  { namn: "skattedjup",      fil: "ai-mentor-skattedjup-fragor.ts",      fn: "svaraLokaltSkattedjup",      arr: "SKATTEDJUP_MONSTER",      antal: 3 },
  { namn: "skattedjup",     fil: "ai-mentor-skattedjup-fragor.ts",     fn: "svaraLokaltSkattedjup",     arr: "SKATTEDJUP_MONSTER",     antal: 3 },
];

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const d of MOTORDEFS) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ ...d, fnk: modul[d.fn], monster: modul[d.arr] });
}
const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); // 63 (2026-09-16, 16-läget)

/** Kedjan exakt som chat-widget.tsx komponerar den: första icke-null vinner. */
function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return { svar: s, motor: m.namn };
  }
  return null;
}

// ── Testharness (samma form som syskonsviterna) ─────────────────────────────
let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) {
    pass++;
    console.log("PASS  " + namn + (detalj ? "  — " + detalj : ""));
  } else {
    fail++;
    console.log("FAIL  " + namn + (detalj ? "  — " + detalj : ""));
  }
}

// ── FALL G: driftvakt — kedjan speglar widgetens komposition ────────────────
{
  const kalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rad = kalla.match(/const lokalt = ([^;]+);/);
  const widgetOrdning = rad ? [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]) : [];
  const testOrdning = MOTORER.map((m) => m.fnk.name || m.fn);
  kontroll(
    "G: kedjan speglar widgetens kompositionsordning",
    widgetOrdning.length === MOTORER.length && widgetOrdning.every((f, i) => f === (MOTORER[i].fnk.name || MOTORER[i].fn)),
    widgetOrdning.length ? "widget: " + widgetOrdning.join(" ?? ") : "kompositionsraden hittades ej i chat-widget.tsx",
  );
}

// ── FALL A: kanonisk fråga per motor — ingen tidigare motor får skugga ──────
const KANONISKA = [
  { fraga: "vad är styrräntan?",         motor: 0 },
  { fraga: "vad är kassaflödesanalys?",  motor: 1 },
  { fraga: "vad är AKM1?",               motor: 2 },
  { fraga: "vad är optioner?",           motor: 3 },
  { fraga: "vad är goodwill?",           motor: 4 },
  { fraga: "hur analyserar jag banker?", motor: 5 },
  { fraga: "vad är praktiska case?",     motor: 6 },
  { fraga: "vad är blankning?",          motor: 7 },
  { fraga: "vad är valutarisk?",         motor: 8 },
  { fraga: "vad är diversifiering?",     motor: 8 },
  { fraga: "vad är bolagsstämma?",       motor: 9 },
  { fraga: "vad är avskrivningar?",      motor: 10 },
  { fraga: "vad är värderingsmultipel?", motor: 11 },
  { fraga: "vad är tulpanmanin?",        motor: 12 },
  { fraga: "vad är dupont-analysen?",    motor: 13 },
  { fraga: "vad är fibonacci retracements?", motor: 14 },
  { fraga: "vad är personaloptioner?",  motor: 15 },
  { fraga: "vad är kapitalförsäkring?",  motor: 15 },
];
for (const { fraga, motor } of KANONISKA) {
  const skuggor = MOTORER.slice(0, motor).filter((m) => m.fnk(fraga, KURSREGISTER) !== null).map((m) => m.namn);
  const vantan = MOTORER[motor].fnk(fraga, KURSREGISTER);
  const k = kedja(fraga);
  kontroll(
    "A: " + fraga,
    skuggor.length === 0 && vantan !== null && k !== null && JSON.stringify(k.svar) === JSON.stringify(vantan),
    skuggor.length ? "SKUGGAD av: " + skuggor.join(", ") : (k ? "motor=" + k.motor : "kedjan null"),
  );
}

// ── FALL B: skuggprober — nära kärnordsfamiljer över motorgränser ──────────
// "räntenetto" är bankens mått men ligger en redigering från "räntan";
// "substansvärde"/"utspädning"/"indexfonder" har grannar i tidigare motorer.
const PROBER = [
  { fraga: "vad är räntenetto?",   motor: 5 },
  { fraga: "vad är substansvärde?", motor: 3 },
  { fraga: "vad är utspädning?",   motor: 4 },
  { fraga: "vad är indexfonder?",  motor: 7 },
  // Nya lagers gränser (rond 50): basens värderings-/aktieslagsfamiljer ligger
  // nära djup- respektive ägande-lagrets kärnord — kedjan måste skilja dem.
  { fraga: "vad är rösträtt?",         motor: 9 },
  { fraga: "vad är jämförelsebolag?",  motor: 11 },
];
for (const { fraga, motor } of PROBER) {
  const skuggor = MOTORER.slice(0, motor).filter((m) => m.fnk(fraga, KURSREGISTER) !== null).map((m) => m.namn);
  const vantan = MOTORER[motor].fnk(fraga, KURSREGISTER);
  const k = kedja(fraga);
  kontroll(
    "B: " + fraga,
    skuggor.length === 0 && vantan !== null && k !== null && JSON.stringify(k.svar) === JSON.stringify(vantan),
    skuggor.length ? "SKUGGAD av: " + skuggor.join(", ") : (k ? "motor=" + k.motor : "kedjan null"),
  );
}

// ── FALL C: genomströmning + juridik ────────────────────────────────────────
kontroll(
  "C: omatchad fråga → kedjan null (API-flödet tar över)",
  kedja("vilken färg har månen?") === null,
  "sexton motorer lämnar frågan ifred",
);
{
  const k = kedja("vilket bolag ska jag köpa?");
  kontroll(
    "C: juridikfråga → pedagogiskt lokalt svar (ej tystnad)",
    k !== null,
    k ? "motor=" + k.motor + " · ämne=" + k.svar.amne : "null",
  );
}

// ── FALL D: determinism genom hela kedjan ───────────────────────────────────
for (const { fraga } of [...KANONISKA.slice(0, 3), ...PROBER.slice(0, 2)]) {
  const a = kedja(fraga);
  const b = kedja(fraga);
  kontroll(
    "D: determinism (" + fraga + ")",
    JSON.stringify(a) === JSON.stringify(b),
    a ? "bitidentiskt via " + a.motor : "null",
  );
}

// ── FALL E + F: källmärkning och kursläkthet på ALLA monsters ───────────────
const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
const akaKursLank = (lank) => lank.startsWith("/kurser/") && slugSet.has(lank.replace("/kurser/", ""));
let eFel = 0;
let fFel = 0;
const eDetaljer = [];
const fDetaljer = [];
for (const m of MOTORER) {
  for (const monster of m.monster) {
    let s;
    try {
      s = monster.bygga(KURSREGISTER);
    } catch (e) {
      eFel++;
      eDetaljer.push(m.namn + "/" + monster.id + " kastade: " + String(e?.message).slice(0, 60));
      continue;
    }
    // E1: källrad i texten (enskild "📖 Källa:" eller numrerad "📖 Källor (n)")
    if (!s.text.includes("📖 Käll")) { eFel++; eDetaljer.push(m.namn + "/" + monster.id + " saknar källrad"); }
    // E2: varje kalla-slug äkta
    const kallor = s.kallor ?? (s.kalla ? [s.kalla] : []);
    for (const k of kallor) {
      if (k.slug && !slugSet.has(k.slug)) { eFel++; eDetaljer.push(m.namn + "/" + monster.id + " kalla.slug " + k.slug + " finns ej i registret"); }
    }
    // E3: fordjupa-kurslänk äkta (om den pekar på /kurser/)
    if (s.fordjupa?.lank?.startsWith("/kurser/") && !akaKursLank(s.fordjupa.lank)) {
      eFel++;
      eDetaljer.push(m.namn + "/" + monster.id + " fordjupa " + s.fordjupa.lank + " är en död kurslänk");
    }
    // F1: ≥2 handlings
    if ((s.handlings?.length ?? 0) < 2) { fFel++; fDetaljer.push(m.namn + "/" + monster.id + " har " + (s.handlings?.length ?? 0) + " handlings"); }
    // F2: ≥1 äkta kurslänk, inga döda
    const lankar = (s.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/"));
    const doda = lankar.filter((h) => !akaKursLank(h.lank));
    if (lankar.length < 1) { fFel++; fDetaljer.push(m.namn + "/" + monster.id + " saknar kurslänk i handlings"); }
    if (doda.length > 0) { fFel++; fDetaljer.push(m.namn + "/" + monster.id + " döda länkar: " + doda.map((h) => h.lank).join(", ")); }
  }
}
kontroll(
  "E: källmärkning på samtliga " + TOTALT + " monsters",
  eFel === 0,
  eFel === 0 ? "källrad + äkta slugs + äkta fordjupa överallt" : eDetaljer.slice(0, 6).join(" · "),
);
kontroll(
  "F: kursläkthet på samtliga " + TOTALT + " monsters",
  fFel === 0,
  fFel === 0 ? "≥2 handlings och ≥1 äkta kurslänk överallt" : fDetaljer.slice(0, 6).join(" · "),
);

// ── FALL H: struktur — inventarie + disjunkta id:n ──────────────────────────
{
  const fel = MOTORER.filter((m) => m.monster.length !== m.antal);
  kontroll(
    "H: inventarie per motor (" + MOTORER.map((m) => m.namn + "=" + m.antal).join(" · ") + ", totalt " + TOTALT + ")",
    fel.length === 0,
    fel.length ? fel.map((m) => m.namn + " har " + m.monster.length + " (väntat " + m.antal + ") — uppdatera inventarien medvetet").join(" · ")
      : "inventarien stämmer",
  );
  const idn = MOTORER.flatMap((m) => m.monster.map((x) => x.id));
  const dubletter = idn.filter((id, i) => idn.indexOf(id) !== i);
  kontroll(
    "H: disjunkta monster-id:n över alla sexton motorer",
    new Set(idn).size === idn.length,
    dubletter.length ? "dubletter: " + [...new Set(dubletter)].join(", ") : idn.length + " unika id",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("AI-MENTORN KEDJAN (våg 176): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
