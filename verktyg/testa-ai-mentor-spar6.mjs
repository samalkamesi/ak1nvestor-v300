/**
 * TESTA AI-MENTORN — SPÅR 6, BYGGARE u1 (våg 158, agentfabrik auto-s6).
 *
 * Kör:  node verktyg/testa-ai-mentor-spar6.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för s6-u1:s fyra nya förhandsfrågor (lärväg, beteende,
 * skatt, utdelning — se src/lib/ai-mentor-spar6-monster.ts) med bevakning av:
 *   A  15 kanoniska våg 106-frågor oförändrade (ämne + källa) — regression
 *   B  4 nya kanoniska → rätt ämne, primärkälla, FLERKÄLLA (kallor ≥ 2 +
 *      numrerad Källor-rad i texten) och ≥ 3 kurslänkar per svar
 *   C  5 felstavade varianter → samma träff som den kanoniska
 *   D  determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   E  källäkthet — varje källa/kurslänk i de nya svaren FINNS i registret
 *      (fantomslugar är testfel) + registerdriven räknekontroll i texten
 *   F  3 omatchade frågor → null (API-flödet får dem, inte mönstren)
 *   G  juridikgrind-lint — inga rådfraser (köp/sälj) i de nya svaren
 *   H  hela kedjan (s6-u3:s extra-lager ?? svaraLokalt, om modulen finns):
 *      kanoniska + nya frågor når RÄTT lager — inga stölder mellan lager
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-spar6.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);

// s6-u3:s extra-lager är syskonets fil och kan vara mitt i omskrivning —
// kedje-testerna (fall H) hoppas över versätfullt OM importen misslyckas.
let svaraLokaltExtra = null;
try {
  ({ svaraLokaltExtra } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-extra-fragor.ts")).href));
} catch {
  console.log("NOT  fall H: ai-mentor-extra-fragor.ts ej importbar just nu — kedjetest hoppas över");
}

// ── Testharness (samma stil som testa-ai-mentor.mjs) ────────────────────────
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

// ── FALL A: regression — de 15 kanoniska är oförändrade ────────────────────
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
  if (f.slug) ok = ok && svar.kalla.slug === f.slug;
  if (f.lagrow) ok = ok && (svar.kalla.lagrow || "").includes(f.lagrow);
  if (f.text) ok = ok && svar.text.includes(f.text);
  if (f.lank) ok = ok && svar.handlings.some((h) => h.lank === f.lank);
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, detalj);
});

// ── FALL B: de fyra nya kanoniska (s6-u1) med flerkällskrav ─────────────────
const NYA = [
  {
    fraga: "Vad är utdelning och direktavkastning?",
    amne: "utdelning",
    slug: "km-063-direktavkastning",
  },
  {
    fraga: "Vilken lärväg ska jag välja?",
    amne: "lärväg",
    slug: "v01-forsaljningstillvaxt",
  },
  {
    fraga: "Hur påverkar psykologin mitt sparande?",
    amne: "beteende",
    slug: "km-035-flockbeteende",
  },
  {
    fraga: "Hur fungerar ISK och skatt?",
    amne: "skatt",
    slug: "km-052-isk",
  },
];

NYA.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length >= 2;
  const kallradOk = svar.text.includes("📖 Källor (");
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/"));
  const kurslankarOk = kurslankar.length >= 3;
  kontroll(
    nr + " " + f.amne + " — '" + f.fraga + "'",
    amneOk && kallaOk && kallorFinns && kallradOk && kurslankarOk,
    "ämne=" + svar.amne + " · källa=" + svar.kalla.slug +
      " · källor=" + (svar.kallor ? svar.kallor.length : 0) +
      " · kurslänkar=" + kurslankar.length,
  );
});

// ── FALL C: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad är utdelnig?", amne: "utdelning" },
  { fraga: "vilken lärvg passar mig?", amne: "lärväg" },
  { fraga: "vad är beteendefians?", amne: "beteende" },
  { fraga: "psikologi och aktier?", amne: "beteende" },
  { fraga: "vad är skat på aktier?", amne: "skatt" },
  { fraga: "hur beskatas utdelning i isk?", amne: "skatt" },
];

FELSTAVADE.forEach((f, i) => {
  const nr = "C" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL D: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...KANONISKA.map((f) => f.fraga), ...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokalt(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokalt(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("D01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL E: källäkthet — källor och kurslänkar FINNS i registret ───────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const nastanKurs = new Set(["/profil", "/laroplan", "/min-sida"]); // navigering, ej kurser
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokalt(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const k of svar.kallor ?? []) {
      if (k.slug && !slugFinns.has(k.slug)) FEL.push("källa '" + k.slug + "' (" + f.amne + ") finns ej i registret");
    }
    if ((svar.kallor ?? []).length > 0 && svar.kallor[0].slug !== svar.kalla.slug) {
      FEL.push("kallor[0] (" + svar.kallor[0].slug + ") != kalla (" + svar.kalla.slug + ") i " + f.amne);
    }
    for (const h of svar.handlings) {
      if (h.lank.startsWith("/kurser/")) {
        const s = h.lank.slice("/kurser/".length);
        if (!slugFinns.has(s)) FEL.push("kurslänk '" + s + "' (" + f.amne + ") finns ej i registret");
      } else if (!h.lank.startsWith("fragor:") && !nastanKurs.has(h.lank)) {
        FEL.push("oväntad länk '" + h.lank + "' i " + f.amne);
      }
    }
  }
  kontroll("E01 källäkthet — inga fantomslugar i källor/länkar", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta");

  // Registerdrivna räknekontroller: antalen i texten ska komma ur registret
  const beteendeAntal = KURSREGISTER.filter((r) => r.kategori === "BETEENDEFINANS").length;
  const skattAntal = KURSREGISTER.filter((r) => r.kategori.includes("SKATT")).length;
  const utdelningAntal = KURSREGISTER.filter((r) => r.kategori === "UTDELNINGSSTRATEGI").length;
  const bSvar = svaraLokalt(NYA[2].fraga, KURSREGISTER);
  const sSvar = svaraLokalt(NYA[3].fraga, KURSREGISTER);
  const uSvar = svaraLokalt(NYA[0].fraga, KURSREGISTER);
  kontroll(
    "E02 registerdrivna tal — beteende " + beteendeAntal + " · skatt " + skattAntal + " · utdelning " + utdelningAntal,
    bSvar && bSvar.text.includes(String(beteendeAntal) + " beteendekurser") &&
      sSvar && sSvar.text.includes(String(skattAntal) + " skatte- och juridikkurser") &&
      uSvar && uSvar.text.includes(String(utdelningAntal) + " kurser"),
    "texten ska bära registrets egna tal (klipp-skydd vid registerändring)",
  );
}

// ── FALL F: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Stockholm imorgon?",
  "Vem vann fotbolls-VM 1958?",
  "Hur många ben har en spindel?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "F" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått till API:t" : "null ✓");
});

// ── FALL G: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokalt(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("G01 juridikgrind — inga köp/sälj-rådfraser i s6-u1:s svar", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL H: hela kedjan (extra-lager ?? svaraLokalt) stjäl inte ─────────────
if (svaraLokaltExtra) {
  const kedja = (fraga) => svaraLokaltExtra(fraga, KURSREGISTER) ?? svaraLokalt(fraga, KURSREGISTER);
  const fel = [];
  // Kanoniska ska nå grundmönstret även genom kedjan
  for (const f of [KANONISKA[0], KANONISKA[4], KANONISKA[13]]) {
    const svar = kedja(f.fraga);
    if (!svar || svar.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (svar ? svar.amne : "null") + " (väntat " + f.amne + ")");
  }
  // Nya (s6-u1) ska nå MITT lager — extra-lagrets utdelnings-/rapportmönster
  // får inte sluka skattfrågan "hur beskattas isk?" osv.
  for (const f of NYA) {
    const svar = kedja(f.fraga);
    if (!svar || svar.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (svar ? svar.amne : "null") + " (väntat " + f.amne + ")");
  }
  kontroll("H01 kedja — 3 kanoniska + 4 nya når rätt lager", fel.length === 0,
    fel.length ? fel.join(" | ") : "s6-u3-extra ?? svaraLokalt levererar s6-u1:s svar");
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN spår 6 u1 (våg 158): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("Nya förhandsfrågor: utdelning, lärväg, beteende, skatt · Register: " + KURSREGISTER.length + " kurser");
console.log("────────────────────────────────────────");
process.exitCode = fail === 0 ? 0 : 1;
