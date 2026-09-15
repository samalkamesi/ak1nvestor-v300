/**
 * TESTA AI-MENTORN — S6-U3 OMGÅNG 4 (katalysator + börsen + private equity),
 * 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-s6u3-omg4.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Kompletterar bassviten (testa-ai-mentor.mjs), u2, spar6, extra, makro,
 * s6u2-omg2, nasta och kapitalmekanik — och testar de TRE SISTA mönstren i
 * basens MONSTER (ai-mentor-svar.ts, id: katalysator/aktiemarknad/
 * private-equity — tillagda av s6-u3 omgång 4 tillsammans med register-
 * rebaken 343 → 349):
 *
 *   A  3 kanoniska förhandsfrågor   → rätt ämne + primärkälla + källrad
 *   B  3 varianter/felstavningar    → samma träff som den kanoniska
 *   C  främmande ord → INETT av de tre mönstren (t.ex. "spreadsheet"
 *                                      ska inte träffa spread-kärnordet)
 *   D  determinism                  → samma fråga två gånger ⇒ bitidentiskt
 *   E  källmärkning                 → flerkällsrad, slugar äkta, fordjupa
 *   F  kursläkthet                  → ≥4 handlings, ≥3 kurslänkar, 0 fantom
 *   G  ANTISTÖLD (regression)       → 27 nyckelfrågor för samtliga tidigare
 *                                      mönster + de SENARE lagren (nasta +
 *                                      kapitalmekanik) når sina ägare —
 *                                      aldrig de tre nya mönstren
 *   H  HELA KEDJAN                  → makro ?? extra ?? bas ?? nästa ??
 *                                      kapitalmekanik: rätt lager på 12
 *                                      tvärsnittsfrågor
 *   I  JURIDIKGRIND                 → inga rådsfraser i svartexterna
 *   J  registerdriven fakta         → minuter-talen läses ur registret,
 *                                      inga hårdkodade siffror
 *   K  kärnordsdisjunktion          → 0 överlapp mot tidigare mönsters
 *                                      kärnord (läses LIVE ur modulerna —
 *                                      fångar även framtida tillägg; basens
 *                                      egna 3 nya mönster filtreras bort)
 */

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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-s6u3-omg4.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Importerar den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokalt, MONSTER, diafri } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltExtra, EXTRA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-extra-fragor.ts")).href);
const { svaraLokaltMakro, MAKRO_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-makro-fragor.ts")).href);
const { svaraLokaltNasta, NASTA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-nasta-fragor.ts")).href);

// Syskonets kapitalmekanik-lager (sist i kedjan) — tålig import: ett lager
// som syskonet skriver PÅ JUST NU kan vara oläsligt i Node; då hoppas det
// över med tydlig NOT i stället för att feltolkas som kollision.
let svaraLokaltKapitalmekanik = null;
let KAPITALMEKANIK_MONSTER = null;
try {
  const kap = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-kapitalmekanik-fragor.ts")).href);
  svaraLokaltKapitalmekanik = kap.svaraLokaltKapitalmekanik ?? null;
  KAPITALMEKANIK_MONSTER = kap.KAPITALMEKANIK_MONSTER ?? null;
} catch (e) {
  console.log("NOT  kapitalmekanik-lagret oläsligt i Node just nu (syskonedrag pågår) — kedjan testas utan det");
}

const MINA_ID = new Set(["katalysator", "aktiemarknad", "private-equity"]);
const MINA_AMNEN = new Set(["katalysator", "aktiemarknaden", "private equity"]);
const minaMonster = MONSTER.filter((m) => MINA_ID.has(m.id));

const slugSet = new Set(KURSREGISTER.map((r) => r.slug));

// ── Testharness (samma form som syskonsviterna) ────────────────────────────
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

// ── FALL A: de 3 kanoniska förhandsfrågorna ────────────────────────────────
const KANONISKA = [
  { fraga: "Vad är en katalysator?", amne: "katalysator", slug: "kt-01-vad-ar-en-katalysator" },
  { fraga: "Hur fungerar börsen?", amne: "aktiemarknaden", slug: "am-01-likviditet-och-spread" },
  { fraga: "Vad är private equity?", amne: "private equity", slug: "pe-01-private-equity-fonder" },
];

for (const { fraga, amne, slug } of KANONISKA) {
  const s = svaraLokalt(fraga, KURSREGISTER);
  kontroll(
    "A: " + fraga,
    s !== null && s.amne === amne && s.kalla.slug === slug && s.text.includes("📖 Källor ("),
    s ? "ämne=" + s.amne + " · källa=" + s.kalla.slug + " · flerkällsrad" : "null",
  );
}

// ── FALL B: varianter/felstavade → samma träff som den kanoniska ───────────
const VARIANTER = [
  { fraga: "vad ar en katalysator for aktier?", amne: "katalysator" }, // diafri: ä→a räcker
  { fraga: "vad menas med spread?", amne: "aktiemarknaden" },
  { fraga: "vad är riskkapital?", amne: "private equity" },
];

for (const { fraga, amne } of VARIANTER) {
  const s = svaraLokalt(fraga, KURSREGISTER);
  kontroll(
    "B: " + fraga,
    s !== null && s.amne === amne,
    s ? "ämne=" + s.amne : "null",
  );
}

// ── FALL C: främmande ord får inte träffa (ordvis matchning, ej delsträng) ─
const FRAMMANDE = [
  { fraga: "hur gör jag ett spreadsheet i excel?", amne: null }, // "spreadsheet" ≠ "spread"
  { fraga: "vad är en kalasp?", amne: null }, // kalasp ≈ katalysator? (distans för stor)
  { fraga: "vad betyder privat?", amne: null }, // "privat" ≠ frasen "private equity"
];
for (const { fraga } of FRAMMANDE) {
  const s = svaraLokalt(fraga, KURSREGISTER);
  const minTraff = s !== null && MINA_AMNEN.has(s.amne);
  kontroll(
    "C: främmande (" + fraga + ") träffar inte de nya mönstren",
    !minTraff,
    s ? "ämne=" + s.amne + (minTraff ? " — STÖLD!" : " (annat/ingen träff)") : "null",
  );
}

// ── FALL D: determinism — samma fråga två gånger ⇒ bitidentiskt ────────────
for (const { fraga } of KANONISKA) {
  const a = svaraLokalt(fraga, KURSREGISTER);
  const b = svaraLokalt(fraga, KURSREGISTER);
  kontroll(
    "D: determinism (" + fraga + ")",
    JSON.stringify(a) === JSON.stringify(b),
    a ? "bitidentiskt" : "null",
  );
}

// ── FALL E: källmärkning — slug äkta, flerkällsrad, fordjupa ───────────────
for (const { fraga, slug } of KANONISKA) {
  const s = svaraLokalt(fraga, KURSREGISTER);
  kontroll(
    "E: källmärkning (" + slug + ")",
    s !== null &&
      slugSet.has(s.kalla.slug) &&
      Array.isArray(s.kallor) && s.kallor.length >= 3 &&
      s.kallor.every((k) => !k.slug || slugSet.has(k.slug)) &&
      s.text.includes("📖 Källor (") &&
      s.fordjupa.lank === "/kurser/" + s.kalla.slug,
    s ? "slug äkta · " + s.kallor.length + " källor · fordjupa=" + s.fordjupa.lank : "null",
  );
}

// ── FALL F: kursläkthet — ≥4 handlings, ≥3 kurslänkar, 0 fantomlänkar ──────
for (const { fraga } of KANONISKA) {
  const s = svaraLokalt(fraga, KURSREGISTER);
  const kursLankar = (s?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/"));
  const allaEkta = kursLankar.every((h) => slugSet.has(h.lank.replace("/kurser/", "")));
  const fragoLankarOk = (s?.handlings ?? [])
    .filter((h) => h.lank.startsWith("fragor:"))
    .every((h) => decodeURIComponent(h.lank.replace("fragor:", "")).length > 3);
  kontroll(
    "F: kursläkthet (" + fraga + ")",
    (s?.handlings.length ?? 0) >= 4 && kursLankar.length >= 3 && allaEkta && fragoLankarOk,
    (s?.handlings.length ?? 0) + " handlings · " + kursLankar.length + " kurslänkar, alla äkta",
  );
}

// ── FALL G: ANTISTÖLD — tidigare OCH senare lagers frågor når sina ägare ───
// Mönstren ligger SIST i basens MONSTER med strikt poängregel: frågor som
// tidigare mönster äger måste förbli deras, och de SENARE lagrens (nasta,
// kapitalmekanik) typfrågor får aldrig stjälas av de nya kärnorden.
const TIDLIGARE = [
  // makro-lagret (omgång 2 u1)
  "vad är ränta?",
  "vad är inflation?",
  // extra-lagret (u3 omgång 1)
  "vad är kassaflödesanalys?",
  "vad är fundamental analys?",
  "vad är en moat?",
  // basens tidigare mönster (deklarerade FÖRE de tre nya)
  "vad är AKM1?",
  "vad är teknisk analys?",
  "hur läser jag en kvartalsrapport?",
  "vad är P/E?",
  "vad är utdelning?",
  "vad är ISK?",
  "vad är risk?",
  "hur bygger jag en portfölj?",
  "vad är kapitalstruktur?",
  "vad är soliditet?",
  "vad är organisk tillväxt?",
  // basens data-drivna V-uppslag (V-nummer + titelord)
  "vad är V16?",
  "vad är V18?",
  // nästa-lagret (omgång 3) — körs EFTER basen: typfrågorna är deras
  "hur värderar man ett bolag med DCF?",
  "vad är substansvärde?",
  "vad är en option?",
  // kapitalmekanik-lagret (syskonet) — körs sist: typfrågorna är deras
  "vad är utspädning?",
  "vad är en emission?",
  "vad är goodwill?",
  "vad är nedskrivning?",
];
let stulna = 0;
for (const f of TIDLIGARE) {
  const s = svaraLokalt(f, KURSREGISTER);
  if (s !== null && MINA_AMNEN.has(s.amne)) {
    stulna++;
    console.log("      STJÄLEN: '" + f + "' → " + s.amne);
  }
}
kontroll(
  "G: antistöld — " + TIDLIGARE.length + " främmande frågor når aldrig de nya mönstren",
  stulna === 0,
  stulna === 0 ? "0 stölder ✓" : stulna + " stölder!",
);

// ── FALL H: hela kedjan (makro ?? extra ?? bas ?? nästa ?? kapitalmekanik) ─
const KEDJEFALL = [
  { fraga: "Vad är en katalysator?", amne: "katalysator" },
  { fraga: "Hur fungerar börsen?", amne: "aktiemarknaden" },
  { fraga: "Vad är private equity?", amne: "private equity" },
  { fraga: "vad är ränta?", amne: "ränta" },
  { fraga: "vad är kassaflödesanalys?", amne: "kassaflödesanalys" },
  { fraga: "vad är P/E?", amne: "nyckeltal" },
  { fraga: "vad är AKM1?", amne: "akm1" },
  { fraga: "vad är V18?", amne: "variabel-V18" },
  { fraga: "vad är substansvärde?", amne: "investmentbolag" },
  { fraga: "vad är en option?", amne: "options" },
  { fraga: "vad är kapitalstruktur?", amne: "kapitalstruktur" },
  { fraga: "vad är tillväxt?", amne: "tillväxt" },
];
let kedjaFel = 0;
for (const { fraga, amne } of KEDJEFALL) {
  const s = svaraLokaltMakro(fraga, KURSREGISTER) ??
    svaraLokaltExtra(fraga, KURSREGISTER) ??
    svaraLokalt(fraga, KURSREGISTER) ??
    svaraLokaltNasta(fraga, KURSREGISTER) ??
    (svaraLokaltKapitalmekanik ? svaraLokaltKapitalmekanik(fraga, KURSREGISTER) : null);
  if (!s || s.amne !== amne) {
    kedjaFel++;
    console.log("      KEDJEFEL: '" + fraga + "' → " + (s ? s.amne : "null") + " (väntat " + amne + ")");
  }
}
kontroll(
  "H: hela kedjan — " + KEDJEFALL.length + " frågor når rätt lager",
  kedjaFel === 0,
  kedjaFel === 0 ? "makro ?? extra ?? bas ?? nästa" + (svaraLokaltKapitalmekanik ? " ?? kapitalmekanik" : "") + " ✓" : kedjaFel + " fel",
);

// ── FALL I: JURIDIKGRINDEN — inga rådsfraser i svartexterna ─────────────────
const RADFRASER = /\b(köp|sälj|rekommendera|rekommenderar|bör du|min rekommendation|bra affär för dig)\b/i;
let radTraff = 0;
for (const { fraga } of KANONISKA) {
  const s = svaraLokalt(fraga, KURSREGISTER);
  if (s && RADFRASER.test(s.text)) {
    radTraff++;
    console.log("      RÅDFRAS i: " + fraga);
  }
}
kontroll(
  "I: juridikgrind — 0 rådsfraser i de tre svaren",
  radTraff === 0,
  radTraff === 0 ? "ren utbildningsformulering (lagen 2007:528)" : radTraff + " träffar!",
);

// ── FALL J: registerdriven fakta — minuter-tal ur registret, ej hårdkodat ──
const REGFAKTA = [
  { fraga: "Vad är en katalysator?", slug: "kt-01-vad-ar-en-katalysator" },
  { fraga: "Hur fungerar börsen?", slug: "am-01-likviditet-och-spread" },
  { fraga: "Vad är private equity?", slug: "pe-01-private-equity-fonder" },
];
let jFel = 0;
for (const { fraga, slug } of REGFAKTA) {
  const rad = KURSREGISTER.find((r) => r.slug === slug);
  const s = svaraLokalt(fraga, KURSREGISTER);
  const bärMinuter = !!rad && !!s && s.text.includes(rad.minuter + " min");
  if (!bärMinuter) {
    jFel++;
    console.log("      SIFFRA FÖRLORAD: " + slug + " (" + (rad ? rad.minuter + " min väntades i texten" : "kurs saknas i registret") + ")");
  }
}
kontroll(
  "J: registerdriven fakta — minuter ur registret i alla tre svaren",
  jFel === 0,
  jFel === 0 ? "kursernas minuter läses vid svarstid" : jFel + " avvikelser",
);

// ── FALL K: kärnordsdisjunktion mot alla andra mönster (LIVE) ──────────────
// Basens MONSTER innehåller de egna tre nya mönstren — de filtreras bort ur
// jämförelsen. Kapitalmekanik-lagret ingår tåligt (syskonedrag pågår).
const andraKarnord = new Set();
const lagerLista = [];
const karnordUppsettt = [];
if (Array.isArray(MAKRO_MONSTER)) karnordUppsettt.push(["makro", MAKRO_MONSTER]);
if (Array.isArray(EXTRA_MONSTER)) karnordUppsettt.push(["extra", EXTRA_MONSTER]);
if (Array.isArray(MONSTER)) karnordUppsettt.push(["bas-första-22", MONSTER.filter((m) => !MINA_ID.has(m.id))]);
if (Array.isArray(NASTA_MONSTER)) karnordUppsettt.push(["nasta", NASTA_MONSTER]);
if (Array.isArray(KAPITALMEKANIK_MONSTER)) karnordUppsettt.push(["kapitalmekanik", KAPITALMEKANIK_MONSTER]);
for (const [namn, monster] of karnordUppsettt) {
  lagerLista.push(namn);
  for (const m of monster) {
    for (const k of m.karnord ?? []) andraKarnord.add(diafri(k));
  }
}
const minaKarnord = new Set();
for (const m of minaMonster) {
  for (const k of m.karnord) minaKarnord.add(diafri(k));
}
const overlapp = [...minaKarnord].filter((k) => andraKarnord.has(k));
kontroll(
  "K: kärnordsdisjunktion — 0 överlapp mot " + andraKarnord.size + " andra kärnord (" + lagerLista.length + " lager)",
  overlapp.length === 0 && minaMonster.length === 3 && new Set(minaMonster.map((m) => m.id)).size === 3,
  overlapp.length === 0
    ? "3 mönster, disjunkta id och kärnord mot: " + lagerLista.join(", ")
    : "överlapp: " + overlapp.join(", "),
);

// ── Sammanfattning ─────────────────────────────────────────────────────────
console.log("────────────────────────────────────────");
console.log("AI-MENTORN S6-U3 OMGÅNG 4: " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("Register: " + KURSREGISTER.length + " kurser · basens MONSTER: " + MONSTER.length + " mönster (däraf 3 nya)");
process.exit(fail > 0 ? 1 : 0);
