/**
 * TESTA AI-MENTORN — NÄSTA FÖRHANDSFRÅGOR (spår 6, omgång 3), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-nasta.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Kompletterar bassviten (testa-ai-mentor.mjs), u2 (testa-ai-mentor-u2.mjs),
 * u3-extra (testa-ai-mentor-extra.mjs), spar6 (testa-ai-mentor-spar6.mjs)
 * och makro (testa-ai-mentor-makro.mjs) — och testar
 * src/lib/ai-mentor-nasta-fragor.ts:
 *
 *   A  3 kanoniska förhandsfrågor   → rätt ämne + primärkälla + källrad
 *   B  3 varianter/felstavningar    → samma träff som den kanoniska
 *   C  omatchad fråga → null
 *   D  determinism                  → samma fråga två gånger ⇒ bitidentiskt
 *   E  källmärkning                 → flerkällsrad, slugar äkta, fordjupa
 *   F  kursläkthet                  → ≥4 handlings, ≥3 kurslänkar, 0 fantom
 *   G  ANTISTÖLD (regression)       → 20 nyckelfrågor från makro/extra/bas
 *                                      (inkl syskon-u2:s kapitalstruktur +
 *                                      tillväxt) och V-uppslaget → null här
 *   H  HELA KEDJAN                  → makro ?? extra ?? bas ?? nästa: rätt
 *                                      lager på 9 tvärsnittsfrågor
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-nasta.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Importerar den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltNasta, NASTA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-nasta-fragor.ts")).href);
const { svaraLokalt, MONSTER, diafri } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltExtra, EXTRA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-extra-fragor.ts")).href);
const { svaraLokaltMakro, MAKRO_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-makro-fragor.ts")).href);

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

// ── FALL A: de 3 kanoniska förhandsfrågorna ────────────────────────────────
const KANONISKA = [
  { fraga: "Hur värderar man ett bolag med DCF?", amne: "värdering", slug: "km-007-dcf" },
  { fraga: "Vad är substansvärde?", amne: "investmentbolag", slug: "km-067-investmentbolag" },
  { fraga: "Vad är en option?", amne: "options", slug: "km-059-optionsgrunder" },
];

for (const { fraga, amne, slug } of KANONISKA) {
  const s = svaraLokaltNasta(fraga, KURSREGISTER);
  kontroll(
    "A: " + fraga,
    s !== null && s.amne === amne && s.kalla.slug === slug && s.text.includes("📖 Källor ("),
    s ? "ämne=" + s.amne + " · källa=" + s.kalla.slug + " · flerkällsrad" : "null",
  );
}

// ── FALL B: varianter/felstavade → samma träff som den kanoniska ───────────
const VARIANTER = [
  { fraga: "vad ar inre vardet?", amne: "värdering" }, // diafri: ä→a räcker
  { fraga: "vad menas med nav rabatt?", amne: "investmentbolag" },
  { fraga: "vad är en call eller put?", amne: "options" },
];

for (const { fraga, amne } of VARIANTER) {
  const s = svaraLokaltNasta(fraga, KURSREGISTER);
  kontroll(
    "B: " + fraga,
    s !== null && s.amne === amne,
    s ? "ämne=" + s.amne : "null",
  );
}

// ── FALL C: omatchad → null (rad-frågan ägs av basen) ──────────────────────
kontroll(
  "C: omatchad fråga → null",
  svaraLokaltNasta("vilket bolag ska jag köpa?", KURSREGISTER) === null,
  "lagret lämnar frågan (basens juridiksvar äger den)",
);

// ── FALL D: determinism — samma fråga två gånger ⇒ bitidentiskt ────────────
for (const { fraga } of KANONISKA) {
  const a = svaraLokaltNasta(fraga, KURSREGISTER);
  const b = svaraLokaltNasta(fraga, KURSREGISTER);
  kontroll(
    "D: determinism (" + fraga + ")",
    JSON.stringify(a) === JSON.stringify(b),
    a ? "bitidentiskt" : "null",
  );
}

// ── FALL E: källmärkning — slug äkta, flerkällsrad, fordjupa ───────────────
for (const { fraga, slug } of KANONISKA) {
  const s = svaraLokaltNasta(fraga, KURSREGISTER);
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
  const s = svaraLokaltNasta(fraga, KURSREGISTER);
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
// Inkluderar syskon-u2:s PÅGÅENDE mönster (kapitalstruktur, tillväxtens
// källa) — kassationsbeslutet verifieras: de äger sina frågor, inte vi.
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
  // syskon-u2:s pågående mönster i basens MONSTER
  "vad är kapitalstruktur?",
  "vad är soliditet?",
  "vad är hävstång?",
  "vad är skuldsättning?",
  "vad är tillväxt?",
  "vad är organisk tillväxt?",
  // basens data-drivna V-uppslag (V-nummer + titelord)
  "vad är V10?",
  "vad är skuldsättningsgrad?",
];
let stulna = 0;
for (const f of TIDLIGARE) {
  const s = svaraLokaltNasta(f, KURSREGISTER);
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

// ── FALL H: hela kedjan (makro ?? extra ?? bas ?? nästa) ───────────────────
const KEDJEFALL = [
  { fraga: "Hur värderar man ett bolag med DCF?", amne: "värdering" },
  { fraga: "Vad är substansvärde?", amne: "investmentbolag" },
  { fraga: "Vad är en option?", amne: "options" },
  { fraga: "vad är ränta?", amne: "ränta" },
  { fraga: "vad är kassaflödesanalys?", amne: "kassaflödesanalys" },
  { fraga: "vad är P/E?", amne: "nyckeltal" },
  { fraga: "vad är AKM1?", amne: "akm1" },
  { fraga: "vad är V10?", amne: "variabel-V10" },
  // OBS: syskon-u2:s pågående mönster (kapitalstruktur, tillväxt) testas
  // medvetet INTE här — deras närvaro i basens MONSTER svänger under
  // pågående arbete. Fall G vakar att de ALDRIG stjäls av detta lager,
  // och fall K fångar deras kärnord live när de landar.
];
let kedjaFel = 0;
for (const { fraga, amne } of KEDJEFALL) {
  const s = svaraLokaltMakro(fraga, KURSREGISTER) ??
    svaraLokaltExtra(fraga, KURSREGISTER) ??
    svaraLokalt(fraga, KURSREGISTER) ??
    svaraLokaltNasta(fraga, KURSREGISTER);
  if (!s || s.amne !== amne) {
    kedjaFel++;
    console.log("      KEDJEFEL: '" + fraga + "' → " + (s ? s.amne : "null") + " (väntat " + amne + ")");
  }
}
kontroll(
  "H: hela kedjan — " + KEDJEFALL.length + " frågor når rätt lager",
  kedjaFel === 0,
  kedjaFel === 0 ? "makro ?? extra ?? bas ?? nästa ✓" : kedjaFel + " fel",
);

// ── FALL I: JURIDIKGRINDEN — inga rådsfraser i svartexterna ─────────────────
const RADFRASER = /\b(köp|sälj|rekommendera|rekommenderar|bör du|min rekommendation|bra affär för dig)\b/i;
let radTraff = 0;
for (const { fraga } of KANONISKA) {
  const s = svaraLokaltNasta(fraga, KURSREGISTER);
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
  { fraga: "Hur värderar man ett bolag med DCF?", slug: "km-007-dcf" },
  { fraga: "Vad är substansvärde?", slug: "km-067-investmentbolag" },
  { fraga: "Vad är en option?", slug: "km-059-optionsgrunder" },
];
let jFel = 0;
for (const { fraga, slug } of REGFAKTA) {
  const rad = KURSREGISTER.find((r) => r.slug === slug);
  const s = svaraLokaltNasta(fraga, KURSREGISTER);
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

// ── FALL K: kärnordsdisjunktion mot alla tidigare mönster (LIVE) ───────────
// Syskon-agenter skriver SAMTIDIGT i basens MONSTER (obs! omgång 2 visade
// att export-nyckelordet kan saknas i mellanlägen) — importerna görs därför
// tåligt: ett oläsligt/omodifierat lager hoppas över med tydlig NOT i
// stället för att feltolkas som kollision (samma filosofi som u3:s test).
const tidigareKarnord = new Set();
const lagerLista = [];
const karnordUppsettt = [];
if (Array.isArray(MAKRO_MONSTER)) karnordUppsettt.push(["makro", MAKRO_MONSTER]);
if (Array.isArray(EXTRA_MONSTER)) karnordUppsettt.push(["extra", EXTRA_MONSTER]);
if (Array.isArray(MONSTER)) karnordUppsettt.push(["bas", MONSTER]);
for (const [namn, monster] of karnordUppsettt) {
  lagerLista.push(namn);
  for (const m of monster) {
    for (const k of m.karnord ?? []) tidigareKarnord.add(diafri(k));
  }
}
if (karnordUppsettt.length < 3) {
  console.log("NOT  fall K: " + (3 - karnordUppsettt.length) + " tidigare lager oläsliga i Node just nu (syskonedrag pågår) — disjunktion kontrolleras mot: " + (lagerLista.join(", ") || "inga"));
}
const minaKarnord = new Set();
for (const m of NASTA_MONSTER) {
  for (const k of m.karnord) minaKarnord.add(diafri(k));
}
const overlapp = [...minaKarnord].filter((k) => tidigareKarnord.has(k));
kontroll(
  "K: kärnordsdisjunktion — 0 överlapp mot " + tidigareKarnord.size + " tidigare kärnord",
  overlapp.length === 0 && NASTA_MONSTER.length === 3 && new Set(NASTA_MONSTER.map((m) => m.id)).size === 3,
  overlapp.length === 0
    ? "3 mönster, disjunkta id och kärnord"
    : "överlapp: " + overlapp.join(", "),
);

// ── Sammanfattning ─────────────────────────────────────────────────────────
console.log("AI-MENTORN NÄSTA (spår 6 omgång 3): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
