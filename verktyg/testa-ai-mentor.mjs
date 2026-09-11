/**
 * TESTA AI-MENTORN 2.0 (våg 106 H2) — svärmotor + kursregister, 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor.mjs
 * Krav: Node >= 22.18 (type stripping default; annars kör med
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Fall:
 *   A  15 kanoniska förhandsfrågor → rätt ämne + källmärke
 *   B   5 felstavade varianter     → samma träff som den kanoniska
 *   C   3 omatchade frågor         → null (API-flödet får dem) + fallback
 *   D   determinism                → samma fråga två gånger ⇒ bitidentiskt
 *   E   registeräkthet             → KURSREGISTER == byggKursregister(
 *                                    public/deep-courses.json) fält för fält
 *
 * --baka: skriv om register-arrayens rader (ur deep-courses.json) till stdout —
 *         klistra in i src/lib/ai-mentor-register.ts efter kurstillägg:
 *         node verktyg/testa-ai-mentor.mjs --baka > nya-rader.txt
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Importerar den RIKTIGA koden ur src/ (ingen duplikation i testet).
// Windows: absoluta sökvägar måste vara file://-URL:er i dynamic import.
const { KURSREGISTER, byggKursregister } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokalt, fallbackSvar } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);

// ── --baka: regenerera register-rader ur deep-courses.json ──────────────────
if (process.argv.includes("--baka")) {
  const json = JSON.parse(readFileSync(join(ROT, "public", "deep-courses.json"), "utf8"));
  const rader = byggKursregister(Object.values(json));
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  for (const r of rader) {
    console.log(
      '  { slug: "' + esc(r.slug) + '", titel: "' + esc(r.titel) + '", kategori: "' + esc(r.kategori) +
      '", variabel: ' + (r.variabel ? '"' + r.variabel + '"' : "undefined") +
      ", kapitel: " + r.kapitel + ", quiz: " + r.quiz + ", minuter: " + r.minuter + ', niva: "' + esc(r.niva) + '" },',
    );
  }
  process.exit(0);
}

// ── Testharness ─────────────────────────────────────────────────────────────
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

// ── FALL A: de 15 kanoniska förhandsfrågorna ────────────────────────────────
// Förväntat: ämnes-id + källa (slug eller lägesmarkör) + källrad i texten.
const KANONISKA = [
  { fraga: "Vad är AKM1?", amne: "akm1", slug: "akm1-den-kontroversiella-modellen" },
  { fraga: "Hur börjar jag lära mig aktieanalys?", amne: "borja", slug: "v01-forsaljningstillvaxt" },
  { fraga: "Vad är en impulsvåg?", amne: "impulsvåg", slug: "ts-01-elliott-wave" },
  { fraga: "Vad kostar det?", amne: "kostnad", lagrow: "Fas 1" },
  { fraga: "Ger ni investeringsråd?", amne: "råd", text: "2007:528" },
  { fraga: "Vad är V09?", amne: "variabel-V09", slug: "v09-roe" },
  { fraga: "Vad är teknisk analys?", amne: "teknisk analys", slug: "ts-10-ak1ts-25cellers-matris" },
  { fraga: "Hur hanterar jag risk?", amne: "risk", slug: "pf-02-position-sizing" },
  { fraga: "Hur bygger jag en portfölj?", amne: "portfölj", slug: "pf-01-portfoljbyggande" },
  { fraga: "Vilka böcker ska jag läsa?", amne: "böcker", slug: "the-intelligent-investor" },
  { fraga: "Hur fungerar quiz och XP?", amne: "quiz-xp", lank: "/certifikat" },
  { fraga: "Vad är Fas 1, 2 och 3?", amne: "faser", lagrow: "Fas" },
  { fraga: "Vad är konfluens?", amne: "konfluens", slug: "konfluens-varde-moter-vagor" },
  { fraga: "Vad är vågfundamentet?", amne: "vågfundament", slug: "vagfundament-variablerna-som-tidsserier" },
  { fraga: "Vad är AK1TS?", amne: "ak1ts", slug: "ak1ts-vaglarans-hierarki" },
];

KANONISKA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  let ok = svar.amne === f.amne;
  let detalj = "ämne=" + svar.amne;
  if (f.slug) {
    const slugOk = svar.kalla.slug === f.slug;
    ok = ok && slugOk;
    detalj += " · källa=" + svar.kalla.slug;
  }
  if (f.lagrow) {
    const lagOk = (svar.kalla.lagrow || "").includes(f.lagrow);
    ok = ok && lagOk;
    detalj += " · läge=" + svar.kalla.lagrow;
  }
  if (f.text) {
    const textOk = svar.text.includes(f.text);
    ok = ok && textOk;
    detalj += " · text≈" + f.text;
  }
  if (f.lank) {
    const lankOk = svar.handlings.some((h) => h.lank === f.lank);
    ok = ok && lankOk;
    detalj += " · länk=" + f.lank;
  }
  const kallOk = svar.text.includes("Källa:");
  ok = ok && kallOk;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, detalj + (kallOk ? "" : " · SAKNAR källrad"));
});

// ── FALL B: 5 felstavade varianter (redigeringstavstånd + åäö-plan) ────────
const FELSTAVADE = [
  { fraga: "va är akm 1?", amne: "akm1" },
  { fraga: "vad e en impulsvag?", amne: "impulsvåg" },
  { fraga: "hur byger jag en portfölh?", amne: "portfölj" },
  { fraga: "vad är vägfundamentet?", amne: "vågfundament" },
  { fraga: "vilka bökar ska jag läse?", amne: "böcker" },
];

FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: 3 omatchade frågor → null (API-flödet) + fallback ───────────────
const OMATCHADE = [
  "Vad blir vädret i Stockholm imorgon?",
  "Vem vann fotbolls-VM 1958?",
  "Hur många ben har en spindel?",
];

OMATCHADE.forEach((fraga, i) => {
  const nr = "C" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(fraga, KURSREGISTER);
  const ok = svar === null;
  kontroll(nr + " omatchad — '" + fraga + "'", ok, svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått till API:t" : "null ✓");
});

// Fallbacken: ärligt "vet inte" + 3 närmaste kurser ur registret
{
  const fb = fallbackSvar(OMATCHADE[0], KURSREGISTER);
  const arlig = /vet\b/i.test(fb.text) && /inte/i.test(fb.text);
  const kursLankar = (fb.handlings || []).filter((h) => h.lank.startsWith("/kurser/"));
  const treKurser = kursLankar.length === 3;
  const kallad = fb.text.includes("Källa:");
  kontroll(
    "C04 fallback — 'vet inte' + 3 närmaste + källmärke",
    arlig && treKurser && kallad,
    "kurser=" + kursLankar.length + " · källa=" + (kallad ? "ja" : "NEJ"),
  );
}

// ── FALL D: determinism — samma fråga ⇒ bitidentiskt svar ──────────────────
{
  const alla = [...KANONISKA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokalt(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokalt(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("D01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL E: registeräkthet — inbakad data == byggd ur deep-courses.json ────
{
  const json = JSON.parse(readFileSync(join(ROT, "public", "deep-courses.json"), "utf8"));
  const byggd = byggKursregister(Object.values(json));
  const sammaAntal = byggd.length === KURSREGISTER.length;
  if (!sammaAntal) {
    kontroll("E01 registeräkthet", false,
      "antal skiljer: inbakad=" + KURSREGISTER.length + " · byggd=" + byggd.length + " — kör --baka och klistra in");
  } else {
    const falt = ["slug", "titel", "kategori", "variabel", "kapitel", "quiz", "minuter", "niva"];
    const diffar = [];
    for (let i = 0; i < byggd.length && diffar.length < 3; i++) {
      for (const f of falt) {
        if (byggd[i][f] !== KURSREGISTER[i][f]) {
          diffar.push(f + " @" + byggd[i].slug + ": byggd=" + JSON.stringify(byggd[i][f]) + " inbakad=" + JSON.stringify(KURSREGISTER[i][f]));
        }
      }
    }
    kontroll("E01 registeräkthet — " + byggd.length + " kurser fält-för-fält", diffar.length === 0,
      diffar.length ? diffar.join(" | ") + " — kör --baka och klistra in" : "identisk med getCourses()-källan");
  }
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN 2.0 (våg 106 H2): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("Register: " + KURSREGISTER.length + " kurser · " +
  KURSREGISTER.reduce((s, r) => s + r.quiz, 0) + " quizfrågor · " +
  KURSREGISTER.filter((r) => r.variabel).length + " AKM1-variabler (V01–V20)");
console.log("────────────────────────────────────────");
process.exitCode = fail === 0 ? 0 : 1;
