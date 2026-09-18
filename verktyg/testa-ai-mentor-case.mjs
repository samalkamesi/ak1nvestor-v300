/**
 * TESTA AI-MENTORN — CASE-FÖRHANDSFRÅGA + KEDJEWIRING (spår 6, omgång 5), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-case.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Complete bassviten (testa-ai-mentor.mjs), u2, u3-extra, spar6, makro,
 * s6u2-omg2, nästa, kapitalmekanik, sektor — och testar
 * src/lib/ai-mentor-case-fragor.ts + WIRINGEN i chat-widget.tsx:
 *
 *   A  2 kanoniska förhandsfrågor   → rätt ämne + primärkälla + källrad
 *   B  3 varianter/felstavningar    → samma träff som den kanoniska
 *   C  omatchad fråga → null
 *   D  determinism                  → samma fråga två gånger ⇒ bitidentiskt
 *   E  källmärkning                 → flerkällsrad, slug äkta, fordjupa
 *   F  kursläkthet                  → ≥4 handlings, ≥3 kurslänkar, 0 fantom
 *   G  ANTISTÖLD (regression)       → 30 nyckelfrågor från makro/extra/bas/
 *                                      nästa/kapitalmekanik/sektor → null här
 *   H  HELA KEDJAN (7 lager)        → makro ?? extra ?? bas ?? nästa ??
 *                                      kapitalmekanik ?? sektor ?? case:
 *                                      rätt lager på 12 tvärsnitt — inkl.
 *                                      sektorfrågorna (död-kod-kurationen)
 *   I  JURIDIKGRIND                 → inga rådsfraser i svartexterna
 *   J  registerdriven fakta         → antal case-kurser + minuter-talen
 *                                      läses ur registret vid svarstid
 *   K  kärnordsdisjunktion          → 0 överlapp mot tidigare mönsters
 *                                      kärnord (läses LIVE ur modulerna)
 *   L  WIDGET-BEVIS (nytt i spåret) → chat-widget.tsx:s kedjerad bär ALLA
 *                                      sju lager i rätt ordning + båda
 *                                      importerna — omgång 3:s sektor-
 *                                      leverans dog just på denna kontroll
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-case.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Importerar den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltCase, CASE_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-case-fragor.ts")).href);
const { svaraLokalt, MONSTER, diafri } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltExtra, EXTRA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-extra-fragor.ts")).href);
const { svaraLokaltMakro, MAKRO_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-makro-fragor.ts")).href);
const { svaraLokaltNasta, NASTA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-nasta-fragor.ts")).href);
const { svaraLokaltKapitalmekanik, KAPITALMEKANIK_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-kapitalmekanik-fragor.ts")).href);
const { svaraLokaltSektor, SEKTOR_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-sektor-fragor.ts")).href);

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

// ── FALL A: de kanoniska förhandsfrågorna ──────────────────────────────────
const KANONISKA = [
  { fraga: "Vad är praktiska case?", amne: "case", slug: "portfolj-ekosystemet" },
  // "träna"-form: "lära mig"-formuleringar ägs av basen — kärnordet "läsa"
  // (5 tkn, tål 1 fel) fångar "lära" på redigeringstavstånd 1. Dokumenterad
  // ansvarsfördelning, inte kollision (bas FÖRE case i kedjan, med vilje).
  { fraga: "Hur tränar jag med fallstudier på riktiga bolag?", amne: "case", slug: "portfolj-ekosystemet" },
];

for (const { fraga, amne, slug } of KANONISKA) {
  const s = svaraLokaltCase(fraga, KURSREGISTER);
  kontroll(
    "A: " + fraga,
    s !== null && s.amne === amne && s.kalla.slug === slug && s.text.includes("📖 Källor ("),
    s ? "ämne=" + s.amne + " · källa=" + s.kalla.slug + " · flerkällsrad" : "null",
  );
}

// ── FALL B: varianter/felstavade → samma träff som den kanoniska ───────────
const VARIANTER = [
  { fraga: "finns det case på verkliga bolag?", amne: "case" }, // flerordskärnord
  { fraga: "vad ar en fallstudie for nagot?", amne: "case" },   // diafri: ä→a
  { fraga: "hur tränar jag på att analysera bolagscase?", amne: "case" },
];

for (const { fraga, amne } of VARIANTER) {
  const s = svaraLokaltCase(fraga, KURSREGISTER);
  kontroll(
    "B: " + fraga,
    s !== null && s.amne === amne,
    s ? "ämne=" + s.amne : "null",
  );
}

// ── FALL C: omatchad → null (råd-frågan ägs av basen) ──────────────────────
kontroll(
  "C: omatchad fråga → null",
  svaraLokaltCase("vilket bolag ska jag köpa?", KURSREGISTER) === null,
  "lagret lämnar frågan (basens juridiksvar äger den)",
);

// ── FALL D: determinism — samma fråga två gånger ⇒ bitidentiskt ────────────
for (const { fraga } of KANONISKA) {
  const a = svaraLokaltCase(fraga, KURSREGISTER);
  const b = svaraLokaltCase(fraga, KURSREGISTER);
  kontroll(
    "D: determinism (" + fraga + ")",
    JSON.stringify(a) === JSON.stringify(b),
    a ? "bitidentiskt" : "null",
  );
}

// ── FALL E: källmärkning — slug äkta, flerkällsrad, fordjupa ───────────────
for (const { fraga, slug } of KANONISKA) {
  const s = svaraLokaltCase(fraga, KURSREGISTER);
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
  const s = svaraLokaltCase(fraga, KURSREGISTER);
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
  // kapitalmekanik-lagret (omgång 4)
  "vad är utspädning?",
  "vad är goodwill?",
  // sektor-lagret (omgång 3 — wiring från omgång 5)
  "vad är sektorsanalys?",
  "hur fungerar banker?",
  "hur fungerar fastighetsbolag?",
  // basens data-drivna V-uppslag
  "vad är V10?",
  "vad är V19?",
  "vad är en emission?",
];
let stulna = 0;
for (const f of TIDLIGARE) {
  const s = svaraLokaltCase(f, KURSREGISTER);
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

// ── FALL H: hela kedjan (7 lager, inkl sektor-kurationen) ──────────────────
const KEDJEFALL = [
  { fraga: "vad är ränta?", amne: "ränta" },                        // makro
  { fraga: "vad är kassaflödesanalys?", amne: "kassaflödesanalys" }, // extra
  { fraga: "vad är P/E?", amne: "nyckeltal" },                      // bas
  { fraga: "vad är V10?", amne: "variabel-V10" },                   // bas (V-uppslag)
  { fraga: "vad är en option?", amne: "options" },                  // nästa
  { fraga: "vad är en emission?", amne: "variabel-V19" },           // basens V19-titelord
  { fraga: "vad är utspädning?", amne: "emission" },                // kapitalmekanik
  { fraga: "vad är goodwill?", amne: "goodwill" },                  // kapitalmekanik
  { fraga: "vad är sektorsanalys?", amne: "sektorsanalys" },        // sektor (kurerad wiring)
  { fraga: "hur fungerar banker?", amne: "bank" },                  // sektor (kurerad wiring)
  { fraga: "hur fungerar fastighetsbolag?", amne: "fastighet" },    // sektor (kurerad wiring)
  { fraga: "Hur tränar jag med fallstudier på riktiga bolag?", amne: "case" }, // case
];
let kedjaFel = 0;
for (const { fraga, amne } of KEDJEFALL) {
  const s = svaraLokaltMakro(fraga, KURSREGISTER) ??
    svaraLokaltExtra(fraga, KURSREGISTER) ??
    svaraLokalt(fraga, KURSREGISTER) ??
    svaraLokaltNasta(fraga, KURSREGISTER) ??
    svaraLokaltKapitalmekanik(fraga, KURSREGISTER) ??
    svaraLokaltSektor(fraga, KURSREGISTER) ??
    svaraLokaltCase(fraga, KURSREGISTER);
  if (!s || s.amne !== amne) {
    kedjaFel++;
    console.log("      KEDJEFEL: '" + fraga + "' → " + (s ? s.amne : "null") + " (väntat " + amne + ")");
  }
}
kontroll(
  "H: hela kedjan — " + KEDJEFALL.length + " frågor når rätt lager",
  kedjaFel === 0,
  kedjaFel === 0 ? "makro ?? extra ?? bas ?? nästa ?? kapitalmekanik ?? sektor ?? case ✓" : kedjaFel + " fel",
);

// ── FALL I: JURIDIKGRINDEN — inga rådsfraser i svartexterna ─────────────────
const RADFRASER = /\b(köp|sälj|rekommendera|rekommenderar|bör du|min rekommendation|bra affär för dig)\b/i;
let radTraff = 0;
for (const { fraga } of KANONISKA) {
  const s = svaraLokaltCase(fraga, KURSREGISTER);
  if (s && RADFRASER.test(s.text)) {
    radTraff++;
    console.log("      RÅDFRAS i: " + fraga);
  }
}
// Case-texten namnger dessutom verkliga bolag — utbildningsramen måste
// finnas uttryckligen ("exempel, inte som placeringar").
const ramsatt = (() => {
  const s = svaraLokaltCase(KANONISKA[0].fraga, KURSREGISTER);
  return !!s && /inte som placeringar/.test(s.text);
})();
kontroll(
  "I: juridikgrind — 0 rådsfraser + exempel-ram uttryckt",
  radTraff === 0 && ramsatt,
  radTraff === 0 && ramsatt ? "ren utbildningsformulering, bolagen ramade som exempel (lagen 2007:528)" : (radTraff ? radTraff + " rådsfraser!" : "exempel-ram saknas!"),
);

// ── FALL J: registerdriven fakta — talen ur registret, ej hårdkodade ───────
// Tre kontroller: kategoriantalet (PRAKTISKA CASE), minuter för primär-
// källan och minuten för båda kontrast-casen. Rebakes får aldrig göra
// texten till lögn.
const REGFAKTA = [
  { slug: "portfolj-ekosystemet" },
  { slug: "pc-01-case-atlas-copco" },
  { slug: "pc-06-case-hm" },
];
let jFel = 0;
const s0 = svaraLokaltCase(KANONISKA[0].fraga, KURSREGISTER);
const vantaAntal = KURSREGISTER.filter((r) => r.kategori === "PRAKTISKA CASE").length;
if (!s0 || !s0.text.includes(String(vantaAntal) + " kurser")) {
  jFel++;
  console.log("      SIFFRA FÖRLORAD: kategoriantal " + vantaAntal + " saknas i texten");
}
for (const { slug } of REGFAKTA) {
  const rad = KURSREGISTER.find((r) => r.slug === slug);
  const bärMinuter = !!rad && !!s0 && s0.text.includes(rad.minuter + " min");
  if (!bärMinuter) {
    jFel++;
    console.log("      SIFFRA FÖRLORAD: " + slug + " (" + (rad ? rad.minuter + " min väntades i texten" : "kurs saknas i registret") + ")");
  }
}
kontroll(
  "J: registerdriven fakta — kategoriantal + 3 källors minuter ur registret",
  jFel === 0,
  jFel === 0 ? vantaAntal + " case-kurser · minuter läses vid svarstid" : jFel + " avvikelser",
);

// ── FALL K: kärnordsdisjunktion mot alla tidigare mönster (LIVE) ───────────
// Syskon-agenter skriver SAMTIDIGT i fler lager — importerna görs därför
// tåligt: ett oläsligt/omodifierat lager hoppas över med tydlig NOT i
// stället för att feltolkas som kollision (samma filosofi som syskonen).
const tidigareKarnord = new Set();
const lagerLista = [];
const karnordUppsettt = [];
if (Array.isArray(MAKRO_MONSTER)) karnordUppsettt.push(["makro", MAKRO_MONSTER]);
if (Array.isArray(EXTRA_MONSTER)) karnordUppsettt.push(["extra", EXTRA_MONSTER]);
if (Array.isArray(MONSTER)) karnordUppsettt.push(["bas", MONSTER]);
if (Array.isArray(NASTA_MONSTER)) karnordUppsettt.push(["nästa", NASTA_MONSTER]);
if (Array.isArray(KAPITALMEKANIK_MONSTER)) karnordUppsettt.push(["kapitalmekanik", KAPITALMEKANIK_MONSTER]);
if (Array.isArray(SEKTOR_MONSTER)) karnordUppsettt.push(["sektor", SEKTOR_MONSTER]);
for (const [namn, monster] of karnordUppsettt) {
  lagerLista.push(namn);
  for (const m of monster) {
    for (const k of m.karnord ?? []) tidigareKarnord.add(diafri(k));
  }
}
if (karnordUppsettt.length < 6) {
  console.log("NOT  fall K: " + (6 - karnordUppsettt.length) + " tidigare lager oläsliga i Node just nu (syskonedrag pågår) — disjunktion kontrolleras mot: " + (lagerLista.join(", ") || "inga"));
}
const minaKarnord = new Set();
for (const m of CASE_MONSTER) {
  for (const k of m.karnord) minaKarnord.add(diafri(k));
}
const overlapp = [...minaKarnord].filter((k) => tidigareKarnord.has(k));
kontroll(
  "K: kärnordsdisjunktion — 0 överlapp mot " + tidigareKarnord.size + " tidigare kärnord",
  overlapp.length === 0 && CASE_MONSTER.length === 1,
  overlapp.length === 0
    ? "1 mönster, disjunkta kärnord"
    : "överlapp: " + overlapp.join(", "),
);

// ── FALL L: WIDGET-BEVIS — kedjan I FILEN chat-widget.tsx ──────────────────
// Omgång 3:s sektor-leverans dog på exakt denna kontroll: filen + testet
// fanns, men wiringen saknades (död kod i prod). Nu vaktas själva
// widget-filen: kedjeraden måste bära ALLA lager I ORDNING och
// importerna måste finnas.
// Uppdaterad av s6-u3 omgång 6 (abca6047): praktik-lagret tillagt som
// ÅTTONDE lager SIST (index/passivt, blankning, marginal) — komponentlistan
// följer kedjan, okända komponenter fortsätter att underkännas.
// Uppdaterad av s6-u2 omgång 7: portfoljgrund-lagret tillagt som NIONDE
// lager SIST (diversifiering/korrelation, valutarisk).
// Uppdaterad av s6-u2 omgång 8: ägande-lagret tillagt som TIONDE lager
// SIST (bolagsstämma/rösträtt, styrelse/bolagsstyrning).
// Uppdaterad av s6-u3 omgång 11: beteendedjup-lagret tillagt som SJUTTONDE
// lager SIST (bekräftelsefällan, ankareffekten, mental accounting) +
// syskonet u2:s riskdjup som ARTONDE SIST (på-disk-läge).
// Uppdaterad av s6-u3 omgång 9: historia-lagret tillagt som TRETTONDE
// lager SIST (tulpanmanin, börsbubbla, aktiekraschen 1929).
const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const kedjekomponenter = [
  "svaraLokaltMakro(q, KURSREGISTER)",
  "svaraLokaltExtra(q, KURSREGISTER)",
  "svaraLokalt(q, KURSREGISTER)",
  "svaraLokaltNasta(q, KURSREGISTER)",
  "svaraLokaltKapitalmekanik(q, KURSREGISTER)",
  "svaraLokaltSektor(q, KURSREGISTER)",
  "svaraLokaltCase(q, KURSREGISTER)",
  "svaraLokaltPraktik(q, KURSREGISTER)",
  "svaraLokaltPortfoljgrund(q, KURSREGISTER)",
  "svaraLokaltAgande(q, KURSREGISTER)",
  "svaraLokaltRedovisningsdjup(q, KURSREGISTER)",
  "svaraLokaltDjup(q, KURSREGISTER)",
  "svaraLokaltHistoria(q, KURSREGISTER)",
  "svaraLokaltLonsamhetsdjup(q, KURSREGISTER)",
  "svaraLokaltTsdjup(q, KURSREGISTER)",
  "svaraLokaltSkattedjup(q, KURSREGISTER)",
  "svaraLokaltBeteendedjup(q, KURSREGISTER)",
  "svaraLokaltRiskdjup(q, KURSREGISTER)",
  "svaraLokaltRiskmattsdjup(q, KURSREGISTER)",
  "svaraLokaltUtdelningsdjup(q, KURSREGISTER)",
  "svaraLokaltForvantningsdjup(q, KURSREGISTER)",

  "svaraLokaltPortfoljbalans(q, KURSREGISTER)",
  "svaraLokaltStabilitetsdjup(q, KURSREGISTER)",
  "svaraLokaltGrahamgolv(q, KURSREGISTER)",
  // Omgång 14:s fönsterlager (disk-läge): u2 varderjustering + u1 optionsdjup
  // + s6-u3 riskläsningsdjup — SIST av 27.
  "svaraLokaltVarderjustering(q, KURSREGISTER)",
  "svaraLokaltOptionsdjup(q, KURSREGISTER)",
  "svaraLokaltRisklasningsdjup(q, KURSREGISTER)",
  "svaraLokaltAvkastningskurva(q, KURSREGISTER)",
  "svaraLokaltAvkastningsdjup(q, KURSREGISTER)",
  "svaraLokaltVarderingsverktyg(q, KURSREGISTER)",
  // Omgång 16:s fönsterlager (2026-09-18): u1 warrant + u2 tidsaxel +
  // u3 kapitalbindning — harmoniserat av u2:s widget-vaktspass.
  "svaraLokaltWarrant(q, KURSREGISTER)",
  "svaraLokaltTidsaxel(q, KURSREGISTER)",
  "svaraLokaltKapitalbindning(q, KURSREGISTER)",
  "svaraLokaltEkosystemdjup(q, KURSREGISTER)",
  "svaraLokaltHandelsdag(q, KURSREGISTER)",
  "svaraLokaltPortfoljpraktik(q, KURSREGISTER)",
];
const kedjeread = widget.match(/const lokalt = ([^;]+);/);
const kedjaStrang = kedjeread ? kedjeread[1] : "";
let lFel = 0;
if (!kedjeread) {
  lFel++;
  console.log("      kedjeraden 'const lokalt = …' hittades inte i chat-widget.tsx");
} else {
  // Alla sju måste finnas, i deklarerad ordning (SIST-principen: nya
  // lager läggs sist och kan aldrig stjäla frågor från tidigare lager).
  let pos = -1;
  for (const komp of kedjekomponenter) {
    const nastaPos = kedjaStrang.indexOf(komp, pos + 1);
    if (nastaPos < 0) {
      lFel++;
      console.log("      kedjan saknar/felordning: " + komp);
    } else {
      pos = nastaPos;
    }
  }
  // Inga okända lager i kedjan (en länk till ett lager som inte finns =
  // brutet bygg eller halvfärdigt syskonarbete).
  const delar = kedjaStrang.split("??").map((d) => d.trim());
  for (const d of delar) {
    if (!kedjekomponenter.includes(d)) {
      lFel++;
      console.log("      okänd kedjekomponent: '" + d + "'");
    }
  }
}
const importSektor = widget.includes('from "@/lib/ai-mentor-sektor-fragor"');
const importCase = widget.includes('from "@/lib/ai-mentor-case-fragor"');
if (!importSektor) { lFel++; console.log("      import av sektor-lagret saknas"); }
if (!importCase) { lFel++; console.log("      import av case-lagret saknas"); }
const importPraktik = widget.includes('from "@/lib/ai-mentor-praktik-fragor"');
if (!importPraktik) { lFel++; console.log("      import av praktik-lagret saknas"); }
const importPortfoljgrund = widget.includes('from "@/lib/ai-mentor-portfoljgrund-fragor"');
if (!importPortfoljgrund) { lFel++; console.log("      import av portfoljgrund-lagret saknas"); }
const importAgande = widget.includes('from "@/lib/ai-mentor-agande-fragor"');
if (!importAgande) { lFel++; console.log("      import av ägande-lagret saknas"); }
const importHistoria = widget.includes('from "@/lib/ai-mentor-historia-fragor"');
if (!importHistoria) { lFel++; console.log("      import av historia-lagret saknas"); }
kontroll(
  "L: widget-bevis — kedjeraden bär 33 lager i ordning + 7 importer",
  lFel === 0,
  lFel === 0 ? "chat-widget.tsx wired: sektor + case + praktik + portfoljgrund + ägande + redovisningsdjup + djup + historia + lonsamhetsdjup live i klientkedjan" : lFel + " fel",
);

// ── Sammanfattning ─────────────────────────────────────────────────────────
console.log("AI-MENTORN CASE + KEDJEWIRING (spår 6 omgång 5): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
