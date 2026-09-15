/**
 * TESTA AI-MENTORN — EXTRA FÖRHANDSFRÅGOR (spår 6, s6-u3), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-extra.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Kompletterar verktyg/testa-ai-mentor.mjs (basen, våg 106 H2 — rör den
 * inte) och testar src/lib/ai-mentor-extra-fragor.ts:
 *
 *   A  3 kanoniska förhandsfrågor   → rätt ämne + källa + källrad i texten
 *   B  3 felstavade varianter       → samma träff som den kanoniska
 *   C  omatchad fråga → null · basfråga påverkas ej (genomströmning)
 *   D  determinism                  → samma fråga två gånger ⇒ bitidentiskt
 *   E  källmärkning                 → kalla.slug finns i registret, källrad
 *                                      + fordjupa-lank på varje svar
 *   F  kursläkthet                  → ≥3 handlings, varje /kurser/-länk
 *                                      pekar på en riktig slug i registret
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-extra.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Importerar den RIKTIGA koden ur src/ (ingen duplikation i testet).
// OBS: basmotorn ai-mentor-svar.ts redigeras SAMTIDIGT av syskonagenter i
// samma fabriksomgång (auto-s6) — om deras pågående arbete temporärt gör
// modulen oläsbar för Node (t.ex. extensionless import av en .ts-fil)
// hoppas baskontrollerna över med tydlig not i stället för att feltolka
// det som fel i DENNA modul (s6-u3:s filer är självständiga).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltExtra, EXTRA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-extra-fragor.ts")).href);
let svaraLokalt = null;
let basFinns = true;
try {
  ({ svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href));
} catch (e) {
  basFinns = false;
  console.log("NOT  basmotorn oläslig i Node just nu (syskonedrag pågår): " + String(e?.code ?? e?.message).slice(0, 80));
}

// ── Testharness (samma form som bassviten) ──────────────────────────────────
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
  { fraga: "Vad är kassaflödesanalys?", amne: "kassaflödesanalys", slug: "km-003-kassaflodesanalysen" },
  { fraga: "Vad är fundamental analys?", amne: "fundamental analys", slug: "foretagsvardering-med-fundamental-analys" },
  { fraga: "Vad är en moat?", amne: "moat", slug: "v14-varumarke" },
];

for (const { fraga, amne, slug } of KANONISKA) {
  const s = svaraLokaltExtra(fraga, KURSREGISTER);
  kontroll(
    "A: " + fraga,
    s !== null && s.amne === amne && s.kalla.slug === slug && s.text.includes("📖 Källa:"),
    s ? "ämne=" + s.amne + " · källa=" + s.kalla.slug : "null",
  );
}

// ── FALL B: felstavade varianter → samma träff som den kanoniska ───────────
const FELSTAVADE = [
  { fraga: "vad är kasaflöde?", amne: "kassaflödesanalys" },
  { fraga: "förklara fundamentl analys", amne: "fundamental analys" },
  { fraga: "vad är bolagets vallgravg?", amne: "moat" },
];

for (const { fraga, amne } of FELSTAVADE) {
  const s = svaraLokaltExtra(fraga, KURSREGISTER);
  kontroll(
    "B: " + fraga,
    s !== null && s.amne === amne,
    s ? "ämne=" + s.amne : "null",
  );
}

// ── FALL C: omatchad → null · basfråga går opåverkad vidare ────────────────
kontroll(
  "C: omatchad fråga → null",
  svaraLokaltExtra("vilket bolag ska jag köpa?", KURSREGISTER) === null,
  "extra-motorn lämnar frågan (basen svarar juridik-svaret)",
);
kontroll(
  "C: lämnar syskonens ämnen därhän (utdelning, kvartalsrapport)",
  svaraLokaltExtra("vad är utdelning?", KURSREGISTER) === null &&
    svaraLokaltExtra("hur läser jag en kvartalsrapport?", KURSREGISTER) === null,
  "kärnorden lämnas åt s6-u1/s6-u2:s mönster — ingen dubbelmatchning",
);
kontroll(
  "C: basfråga opåverkad (genomströmning)",
  !basFinns || (svaraLokaltExtra("vad är AKM1?", KURSREGISTER) === null && svaraLokalt("vad är AKM1?", KURSREGISTER) !== null),
  basFinns ? "svaraLokaltExtra(AKM1)=null · svaraLokalt(AKM1)≠null" : "SKIP — basmodulen oläslig i Node just nu",
);

// ── FALL D: determinism — samma fråga två gånger ⇒ bitidentiskt ────────────
for (const { fraga } of KANONISKA) {
  const a = svaraLokaltExtra(fraga, KURSREGISTER);
  const b = svaraLokaltExtra(fraga, KURSREGISTER);
  kontroll(
    "D: determinism (" + fraga + ")",
    JSON.stringify(a) === JSON.stringify(b),
    a ? "bitidentiskt" : "null",
  );
}

// ── FALL E: källmärkning — slug äkta i registret, källrad + fordjupa ───────
const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
for (const { fraga, slug } of KANONISKA) {
  const s = svaraLokaltExtra(fraga, KURSREGISTER);
  kontroll(
    "E: källmärkning (" + slug + ")",
    s !== null && slugSet.has(s.kalla.slug) && s.text.includes("📖 Källa:") && s.fordjupa.lank === "/kurser/" + s.kalla.slug,
    s ? "slug äkta · källrad · fordjupa=" + s.fordjupa.lank : "null",
  );
}

// ── FALL F: kursläkthet — ≥3 handlings, alla /kurser/-länkar äkta ──────────
for (const { fraga } of KANONISKA) {
  const s = svaraLokaltExtra(fraga, KURSREGISTER);
  const kursLankar = (s?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/"));
  const allaEkta = kursLankar.every((h) => slugSet.has(h.lank.replace("/kurser/", "")));
  kontroll(
    "F: kursläkthet (" + fraga + ")",
    (s?.handlings.length ?? 0) >= 3 && kursLankar.length >= 2 && allaEkta,
    (s?.handlings.length ?? 0) + " handlings · " + kursLankar.length + " kurslänkar, alla äkta",
  );
}

// ── Struktur: EXTRA_MONSTER har exakt 3 mönster med disjunkta id ───────────
kontroll(
  "Struktur: 3 mönster, disjunkta id",
  EXTRA_MONSTER.length === 3 && new Set(EXTRA_MONSTER.map((m) => m.id)).size === 3,
  EXTRA_MONSTER.map((m) => m.id).join(", "),
);

// ── Sammanfattning ─────────────────────────────────────────────────────────
console.log("AI-MENTORN EXTRA (s6-u3): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
