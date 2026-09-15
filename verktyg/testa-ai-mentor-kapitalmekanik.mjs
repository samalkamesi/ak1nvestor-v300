/**
 * TESTA AI-MENTORN — KAPITALMEKANIK-FÖRHANDSFRÅGOR (spår 6, omgång 4), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-kapitalmekanik.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Kompletterar bassviten (testa-ai-mentor.mjs), u2 (testa-ai-mentor-u2.mjs),
 * u3-extra (testa-ai-mentor-extra.mjs), spar6 (testa-ai-mentor-spar6.mjs),
 * makro (testa-ai-mentor-makro.mjs), s6u2-omg2 (testa-ai-mentor-s6u2-omg2.mjs)
 * och nästa (testa-ai-mentor-nasta.mjs) — och testar
 * src/lib/ai-mentor-kapitalmekanik-fragor.ts:
 *
 *   A  2 kanoniska förhandsfrågor   → rätt ämne + primärkälla + källrad
 *   B  3 varianter/felstavningar    → samma träff som den kanoniska
 *   C  omatchad fråga → null
 *   D  determinism                  → samma fråga två gånger ⇒ bitidentiskt
 *   E  källmärkning                 → flerkällsrad, slug äkta, fordjupa
 *   F  kursläkthet                  → ≥4 handlings, ≥3 kurslänkar, 0 fantom
 *   G  ANTISTÖLD (regression)       → 24 nyckelfrågor från makro/extra/bas/
 *                                      nästa och V-uppslaget → null här
 *   H  HELA KEDJAN                  → makro ?? extra ?? bas ?? nästa ?? denna:
 *                                      rätt lager på 10 tvärsnittsfrågor,
 *                                      inkl. "emission"-ordet → basens V19
 *                                      (ansvarsfördelningen dokumenterad)
 *   I  JURIDIKGRIND                 → inga rådsfraser i svartexterna
 *   J  registerdriven fakta         → minuter-talen läses ur registret,
 *                                      inga hårdkodade siffror
 *   K  kärnordsdisjunktion          → 0 överlapp mot tidigare mönsters
 *                                      kärnord (läses LIVE ur modulerna —
 *                                      fångar även framtida tillägg)
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-kapitalmekanik.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Importerar den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltKapitalmekanik, KAPITALMEKANIK_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-kapitalmekanik-fragor.ts")).href);
const { svaraLokalt, MONSTER, diafri } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltExtra, EXTRA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-extra-fragor.ts")).href);
const { svaraLokaltMakro, MAKRO_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-makro-fragor.ts")).href);
const { svaraLokaltNasta, NASTA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-nasta-fragor.ts")).href);

const slugSet = new Set(KURSREGISTER.map((r) => r.slug));

// ── Testharness (samma form som syskonsviterna) ────────────────────────────
let pass = 0;
let fail = 0;
const fallen = [];

function kontroll(namn, ok, detalj) {
  if (ok) {
    pass++;
    console.log("PASS  " + namn + (detalj ? "  — " + detalj : ""));
  } else {
    fail++;
    console.log("FAIL  " + namn + (detalj ? "  — " + detalj : ""));
  }
  fallen.push({ namn, ok });
}

// ── FALL A: de 2 kanoniska förhandsfrågorna ────────────────────────────────
const KANONISKA = [
  { fraga: "Vad är utspädning?", amne: "emission", slug: "rk-02-emissionrisk" },
  { fraga: "Vad är goodwill?", amne: "goodwill", slug: "km-022-goodwill-och-immateriella-tillgangar" },
];

for (const { fraga, amne, slug } of KANONISKA) {
  const s = svaraLokaltKapitalmekanik(fraga, KURSREGISTER);
  kontroll(
    "A: " + fraga,
    s !== null && s.amne === amne && s.kalla.slug === slug && s.text.includes("📖 Källor ("),
    s ? "ämne=" + s.amne + " · källa=" + s.kalla.slug + " · flerkällsrad" : "null",
  );
}

// ── FALL B: varianter/felstavade → samma träff som den kanoniska ───────────
const VARIANTER = [
  { fraga: "hur fungerar företrädesrätt?", amne: "emission" }, // ABL-mekanismen
  { fraga: "vad menas med överpris?", amne: "goodwill" },
  { fraga: "vad ar utspadning for nagot?", amne: "emission" }, // diafri: ä→a
];

for (const { fraga, amne } of VARIANTER) {
  const s = svaraLokaltKapitalmekanik(fraga, KURSREGISTER);
  kontroll(
    "B: " + fraga,
    s !== null && s.amne === amne,
    s ? "ämne=" + s.amne : "null",
  );
}

// ── FALL C: omatchad → null (råd-frågan ägs av basen) ──────────────────────
kontroll(
  "C: omatchad fråga → null",
  svaraLokaltKapitalmekanik("vilket bolag ska jag köpa?", KURSREGISTER) === null,
  "lagret lämnar frågan (basens juridiksvar äger den)",
);

// ── FALL D: determinism — samma fråga två gånger ⇒ bitidentiskt ────────────
for (const { fraga } of KANONISKA) {
  const a = svaraLokaltKapitalmekanik(fraga, KURSREGISTER);
  const b = svaraLokaltKapitalmekanik(fraga, KURSREGISTER);
  kontroll(
    "D: determinism (" + fraga + ")",
    JSON.stringify(a) === JSON.stringify(b),
    a ? "bitidentiskt" : "null",
  );
}

// ── FALL E: källmärkning — slug äkta, flerkällsrad, fordjupa ───────────────
for (const { fraga, slug } of KANONISKA) {
  const s = svaraLokaltKapitalmekanik(fraga, KURSREGISTER);
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
  const s = svaraLokaltKapitalmekanik(fraga, KURSREGISTER);
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

// ── FALL G: ANTISTÖLD — tidigare lagers frågor ger null här ────────────────
// Inkluderar "vad är en emission?" — orden emission/nyemission är medvetet
// STARKORD (ej kärnord) här: basens V19-titeluppslag äger dem (testfall H
// bevisar den fördelningen i hela kedjan).
const TIDLIGARE = [
  // makro-lagret (omgång 2 u1)
  "vad är ränta?",
  "vad är inflation?",
  // extra-lagret (u3 omgång 1)
  "vad är kassaflödesanalys?",
  "vad är fundamental analys?",
  "vad är en moat?",
  // basens mönster (ordning i MONSTER)
  "vad är AKM1?",
  "vad är teknisk analys?",
  "hur läser jag en kvartalsrapport?",
  "vad är P/E?",
  "vad är utdelning?",
  "vad är ISK?",
  "vad är risk?",
  "vad är kapitalstruktur?",
  "vad är soliditet?",
  "vad är hävstång?",
  "vad är tillväxt?",
  "vad är organisk tillväxt?",
  // nästa-lagret (u3 omgång 3)
  "hur värderar man ett bolag med DCF?",
  "vad är substansvärde?",
  "vad är en option?",
  // basens data-drivna V-uppslag (V-nummer + titelord) — emission ägs av V19
  "vad är V10?",
  "vad är V19?",
  "vad är en emission?",
  "vad är en nyemission?",
];
let stulna = 0;
for (const f of TIDLIGARE) {
  const s = svaraLokaltKapitalmekanik(f, KURSREGISTER);
  if (s !== null) {
    stulna++;
    console.log("      STJÄLEN: '" + f + "' → " + s.amne);
  }
}
kontroll(
  "G: antistöld — " + TIDLIGARE.length + " tidigare frågor ger null",
  stulna === 0,
  stulna === 0 ? "0 stölder ✓" : stulna + " stölder!",
);

// ── FALL H: hela kedjan (makro ?? extra ?? bas ?? nästa ?? kapitalmekanik) ─
const KEDJEFALL = [
  { fraga: "vad är ränta?", amne: "ränta" },                      // makro
  { fraga: "vad är kassaflödesanalys?", amne: "kassaflödesanalys" }, // extra
  { fraga: "vad är P/E?", amne: "nyckeltal" },                    // bas
  { fraga: "vad är V10?", amne: "variabel-V10" },                 // bas (V-uppslag)
  { fraga: "vad är en option?", amne: "options" },                // nästa
  { fraga: "vad är kapitalstruktur?", amne: "kapitalstruktur" },  // bas (syskon-u2)
  { fraga: "vad är en emission?", amne: "variabel-V19" },         // basens V19-titelord
  { fraga: "vad är utspädning?", amne: "emission" },              // kapitalmekanik
  { fraga: "vad är goodwill?", amne: "goodwill" },                // kapitalmekanik
  { fraga: "hur fungerar nedskrivningar?", amne: "goodwill" },    // kapitalmekanik
];
let kedjaFel = 0;
for (const { fraga, amne } of KEDJEFALL) {
  const s = svaraLokaltMakro(fraga, KURSREGISTER) ??
    svaraLokaltExtra(fraga, KURSREGISTER) ??
    svaraLokalt(fraga, KURSREGISTER) ??
    svaraLokaltNasta(fraga, KURSREGISTER) ??
    svaraLokaltKapitalmekanik(fraga, KURSREGISTER);
  if (!s || s.amne !== amne) {
    kedjaFel++;
    console.log("      KEDJEFEL: '" + fraga + "' → " + (s ? s.amne : "null") + " (väntat " + amne + ")");
  }
}
kontroll(
  "H: hela kedjan — " + KEDJEFALL.length + " frågor når rätt lager",
  kedjaFel === 0,
  kedjaFel === 0 ? "makro ?? extra ?? bas ?? nästa ?? kapitalmekanik ✓" : kedjaFel + " fel",
);

// ── FALL I: JURIDIKGRINDEN — inga rådsfraser i svartexterna ─────────────────
const RADFRASER = /\b(köp|sälj|rekommendera|rekommenderar|bör du|min rekommendation|bra affär för dig)\b/i;
let radTraff = 0;
for (const { fraga } of KANONISKA) {
  const s = svaraLokaltKapitalmekanik(fraga, KURSREGISTER);
  if (s && RADFRASER.test(s.text)) {
    radTraff++;
    console.log("      RÅDFRAS i: " + fraga);
  }
}
kontroll(
  "I: juridikgrind — 0 rådsfraser i de två svaren",
  radTraff === 0,
  radTraff === 0 ? "ren utbildningsformulering (lagen 2007:528)" : radTraff + " träffar!",
);

// ── FALL J: registerdriven fakta — minuter-tal ur registret, ej hårdkodat ──
// Primärkällan + en syskonkälla per mönster: siffrorna måste komma ur
// registret VID SVARSTID (rebakes får aldrig göra texten till lögn).
const REGFAKTA = [
  { fraga: "Vad är utspädning?", slug: "rk-02-emissionrisk" },
  { fraga: "Vad är utspädning?", slug: "v19-kapitalforbranning" },
  { fraga: "Vad är goodwill?", slug: "km-022-goodwill-och-immateriella-tillgangar" },
  { fraga: "Vad är goodwill?", slug: "foretagsvardering-med-fundamental-analys" },
];
let jFel = 0;
for (const { fraga, slug } of REGFAKTA) {
  const rad = KURSREGISTER.find((r) => r.slug === slug);
  const s = svaraLokaltKapitalmekanik(fraga, KURSREGISTER);
  const bärMinuter = !!rad && !!s && s.text.includes(rad.minuter + " min");
  if (!bärMinuter) {
    jFel++;
    console.log("      SIFFRA FÖRLORAD: " + slug + " (" + (rad ? rad.minuter + " min väntades i texten" : "kurs saknas i registret") + ")");
  }
}
kontroll(
  "J: registerdriven fakta — minuter ur registret i båda svaren (4 källor)",
  jFel === 0,
  jFel === 0 ? "kursernas minuter läses vid svarstid" : jFel + " avvikelser",
);

// ── FALL K: kärnordsdisjunktion mot alla tidigare mönster (LIVE) ───────────
// Syskon-agenter skriver SAMTIDIGT i fler lager (omgång 2 visade att
// export-nyckelordet kan saknas i mellanlägen) — importerna görs därför
// tåligt: ett oläsligt/omodifierat lager hoppas över med tydlig NOT i
// stället för att feltolkas som kollision (samma filosofi som syskonen).
const tidigareKarnord = new Set();
const lagerLista = [];
const karnordUppsettt = [];
if (Array.isArray(MAKRO_MONSTER)) karnordUppsettt.push(["makro", MAKRO_MONSTER]);
if (Array.isArray(EXTRA_MONSTER)) karnordUppsettt.push(["extra", EXTRA_MONSTER]);
if (Array.isArray(MONSTER)) karnordUppsettt.push(["bas", MONSTER]);
if (Array.isArray(NASTA_MONSTER)) karnordUppsettt.push(["nästa", NASTA_MONSTER]);
for (const [namn, monster] of karnordUppsettt) {
  lagerLista.push(namn);
  for (const m of monster) {
    for (const k of m.karnord ?? []) tidigareKarnord.add(diafri(k));
  }
}
if (karnordUppsettt.length < 4) {
  console.log("NOT  fall K: " + (4 - karnordUppsettt.length) + " tidigare lager oläsliga i Node just nu (syskonedrag pågår) — disjunktion kontrolleras mot: " + (lagerLista.join(", ") || "inga"));
}
const minaKarnord = new Set();
for (const m of KAPITALMEKANIK_MONSTER) {
  for (const k of m.karnord) minaKarnord.add(diafri(k));
}
const overlapp = [...minaKarnord].filter((k) => tidigareKarnord.has(k));
kontroll(
  "K: kärnordsdisjunktion — 0 överlapp mot " + tidigareKarnord.size + " tidigare kärnord",
  overlapp.length === 0 && KAPITALMEKANIK_MONSTER.length === 2 && new Set(KAPITALMEKANIK_MONSTER.map((m) => m.id)).size === 2,
  overlapp.length === 0
    ? "2 mönster, disjunkta id och kärnord"
    : "överlapp: " + overlapp.join(", "),
);

// ── Sammanfattning ─────────────────────────────────────────────────────────
console.log("AI-MENTORN KAPITALMEKANIK (spår 6 omgång 4): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
