/**
 * TESTA AI-MENTORN — TILLÄGG s6-u2 (fabrik auto-s6) — 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-u2.mjs
 *
 * Regressionstest för s6-u2:s två förhandsfrågor (inline i ai-mentor-svar.ts:s
 * MONSTER-array, "rapportläsning" och "nyckeltal"): testar den RIKTIGA motorn
 * end-to-end (svaraLokalt) — alltså också att kopplingen är verkställd.
 *
 * Fall:
 *   A  5 kanoniska frågor  → rätt ämne + källa + källrad
 *   B  4 felstavningar     → samma träff som den kanoniska
 *   C  7 regressioner      → existerande mönster varken stjäls eller stör
 *                            (kritiskt tie-break: "läsa" får ALDRIG stjäla
 *                            bokfrågan från rapportfrågan eller tvärtom)
 *   D  determinism         → samma fråga två gånger ⇒ bitidentiskt
 *   E  länkäkthet          → varje /kurser/-länk i s6-u2:s svar finns i
 *                            KURSREGISTER (noll fantomlänkar)
 *   F  källmärkning        → registerfakta (kapitel/minuter) ur primärraden
 *                            finns i svarets text — källan är data-driven
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-u2.mjs",
  );
  process.exit(1);
}

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);

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

// ── FALL A: kanoniska frågor → rätt ämne + källa + källrad ──────────────────
const KANONISKA = [
  { fraga: "Hur läser jag en kvartalsrapport?", amne: "rapportläsning", slug: "km-006-kvartalsrapporten" },
  { fraga: "Vad är ett bokslut?", amne: "rapportläsning", slug: "km-006-kvartalsrapporten" },
  { fraga: "Vad är årsredovisningen?", amne: "rapportläsning", slug: "km-006-kvartalsrapporten" },
  { fraga: "Vad är nyckeltal?", amne: "nyckeltal", slug: "km-009-pe" },
  { fraga: "Vad är P/E?", amne: "nyckeltal", slug: "km-009-pe" },
];

KANONISKA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "' — är MONSTER_U2 kopplad?");
    return;
  }
  const ok = svar.amne === f.amne && svar.kalla.slug === f.slug && svar.text.includes("Källa:");
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok,
    "ämne=" + svar.amne + " · källa=" + svar.kalla.slug + " · källrad=" + (svar.text.includes("Källa:") ? "ja" : "NEJ"));
});

// ── FALL B: felstavningar → samma träff som kanonisk ────────────────────────
const FELSTAVADE = [
  { fraga: "hur liser jag en kvartalsrapport?", amne: "rapportläsning" },
  { fraga: "vad e nyckeltal?", amne: "nyckeltal" },
  { fraga: "vad ar pe talet?", amne: "nyckeltal" },
  { fraga: "vad ar resultatrakningen?", amne: "rapportläsning" },
];

FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(f.fraga, KURSREGISTER);
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", svar !== null && svar.amne === f.amne,
    svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: regression — existerande mönster varken stjäls eller stör ───────
const REGRESSION = [
  { fraga: "Vilka böcker ska jag läsa?", amne: "böcker" },
  { fraga: "Hur börjar jag lära mig aktieanalys?", amne: "borja" },
  { fraga: "Vad är AKM1?", amne: "akm1" },
  { fraga: "Hur bygger jag en portfölj?", amne: "portfölj" },
  { fraga: "Vad kostar det?", amne: "kostnad" },
  { fraga: "Vad är konfluens?", amne: "konfluens" },
];

REGRESSION.forEach((f, i) => {
  const nr = "C" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(f.fraga, KURSREGISTER);
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", svar !== null && svar.amne === f.amne,
    svar ? "ämne=" + svar.amne : "inget svar");
});

// De tre omatchade från huvudtestet måste förbli null (API-flödet) — s6-u2:s
// kärnord ("p/e", "bokslut", "kvartalsrapport" …) får inte läcka ut dem.
const OMATCHADE = [
  "Vad blir vädret i Stockholm imorgon?",
  "Vem vann fotbolls-VM 1958?",
  "Hur många ben har en spindel?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "C" + String(i + 7).padStart(2, "0");
  const svar = svaraLokalt(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått till API:t" : "null ✓");
});

// ── FALL D: determinism — samma fråga ⇒ bitidentiskt svar ──────────────────
{
  const alla = [...KANONISKA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokalt(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokalt(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("D01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL E: länkäkthet — noll fantomlänkar i s6-u2:s svar ──────────────────
{
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  const fragor = [...KANONISKA.map((f) => f.fraga), "Vad är P/E-tal?", "Hur tolkar jag delårsrapporten?", "vad är nyckeltalen?"];
  const fantomer = [];
  for (const f of fragor) {
    const svar = svaraLokalt(f, KURSREGISTER);
    if (!svar) continue;
    for (const h of [...svar.handlings, svar.fordjupa]) {
      const m = String(h.lank).match(/^\/kurser\/(.+)$/);
      if (m && !slugs.has(m[1])) fantomer.push(f + " → " + h.lank);
    }
  }
  kontroll("E01 länkäkthet — alla /kurser/-länkar finns i registret", fantomer.length === 0,
    fantomer.length ? fantomer.join(" | ") : fragor.length + " svar genomsökta, 0 fantomer");
}

// ── FALL F: källmärkning — registerfakta ur primärraden finns i texten ─────
{
  const huvudRapport = KURSREGISTER.find((r) => r.slug === "km-006-kvartalsrapporten");
  const huvudPe = KURSREGISTER.find((r) => r.slug === "km-009-pe");
  const svarRapport = svaraLokalt("Hur läser jag en kvartalsrapport?", KURSREGISTER);
  const svarPe = svaraLokalt("Vad är P/E?", KURSREGISTER);
  const rapportFakta = svarRapport && huvudRapport && svarRapport.text.includes(huvudRapport.kapitel + " kapitel");
  const peFakta = svarPe && huvudPe && svarPe.text.includes(huvudPe.kapitel + " kapitel");
  const kallradRapport = svarRapport ? svarRapport.text.includes("📖 Källa: " + huvudRapport.titel) : false;
  const kallradPe = svarPe ? svarPe.text.includes("📖 Källa: " + huvudPe.titel) : false;
  kontroll("F01 källmärkning — registerfakta + källrad i båda svaren",
    !!(rapportFakta && peFakta && kallradRapport && kallradPe),
    "rapportfakta=" + !!rapportFakta + " · pe-fakta=" + !!peFakta + " · källrader=" + (kallradRapport && kallradPe ? "ja" : "NEJ"));
  // Strukturellt avtal: båda svaren har ≥3 handlingsklara knappar, motfråga
  // och en fördjupningslänk inuti sajten (widgetens kontrakt).
  const svar = [svarRapport, svarPe].filter(Boolean);
  const komplett = svar.every(
    (s) => s.handlings.length >= 3 && s.motfraga && s.motfraga.text.length > 0 &&
      s.fordjupa && s.fordjupa.lank.startsWith("/kurser/"),
  );
  kontroll("F02 struktur — handlings ≥3 + motfråga + fördjupning i båda", komplett,
    "handlings=" + svar.map((s) => s.handlings.length).join("/") + " · fördjupning=/kurser ✓");
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN s6-u2: " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("Register: " + KURSREGISTER.length + " kurser · s6-u2-mönster: rapportläsning + nyckeltal");
console.log("────────────────────────────────────────");
process.exitCode = fail === 0 ? 0 : 1;
