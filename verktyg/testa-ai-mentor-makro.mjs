/**
 * TESTA AI-MENTORN — SPÅR 6, OMGÅNG 2, BYGGARE u1 (auto-s6, våg 158).
 *
 * Kör:  node verktyg/testa-ai-mentor-makro.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för u1:s två nya makroförhandsfrågor (ränta + inflation —
 * se src/lib/ai-mentor-makro-fragor.ts) med bevakning av:
 *   A  2 nya kanoniska → rätt ämne, primärkälla, FLERKÄLLA (kallor ≥ 2 +
 *      numrerad Källor-rad i texten) och ≥ 3 kurslänkar per svar
 *   B  6 felstavade/varierade varianter → samma träff som den kanoniska
 *   C  determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D  källäkthet — varje källa/kurslänk i de nya svaren FINNS i registret
 *      (fantomslugar är testfel) + registerdriven räknekontroll i texten
 *   E  3 omatchade frågor → null (API-flödet får dem, inte makromönstren)
 *   F  juridikgrind-lint — inga rådfraser (köp/sälj) i de nya svaren
 *   G  ANTISTÖLD — samtliga 24 tidigare kanoniska frågor (basens 15 + våg
 *      158-omgångens 9) ger NULL i makro-lagret: det nya lagret kan aldrig
 *      stjäla ett existerande svar
 *   H  hela kedjan (makro ?? extra ?? svaraLokalt, som chat-widget.tsx):
 *      alla 26 kanoniska frågor når RÄTT lager
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-makro.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltMakro } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-makro-fragor.ts")).href);

// Syskonlager (u3:s extra-lager) — kedje-testerna (fall H) hoppas över
// versätfullt OM importen misslyckas (syskonet kan skriva just nu).
let svaraLokaltExtra = null;
try {
  ({ svaraLokaltExtra } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-extra-fragor.ts")).href));
} catch {
  console.log("NOT  fall H: ai-mentor-extra-fragor.ts ej importbar just nu — kedjetest körs utan extra-lager");
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

// ── FALL A: de två nya kanoniska (s6-u1 omgång 2) med flerkällskrav ────────
const NYA = [
  {
    fraga: "Vad är ränta och hur påverkar den aktier?",
    amne: "ränta",
    slug: "km-054-ranta",
  },
  {
    fraga: "Vad är inflation och KPI?",
    amne: "inflation",
    slug: "km-055-inflation",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltMakro(f.fraga, KURSREGISTER);
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

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad är ränta på ränta?", amne: "ränta" },
  { fraga: "hur paverkar räntan aktier?", amne: "ränta" },
  { fraga: "vad gör riksbanken med styrräntan?", amne: "ränta" },
  { fraga: "vad är inflaton?", amne: "inflation" },
  { fraga: "vad betyder kpi?", amne: "inflation" },
  { fraga: "vad är realränta?", amne: "inflation" },
];

FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltMakro(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltMakro(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltMakro(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL D: källäkthet — källor och kurslänkar FINNS i registret ───────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltMakro(f.fraga, KURSREGISTER);
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
      } else if (!h.lank.startsWith("fragor:")) {
        FEL.push("oväntad länk '" + h.lank + "' i " + f.amne);
      }
    }
  }
  kontroll("D01 källäkthet — inga fantomslugar i källor/länkar", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta");

  // Registerdriven räknekontroll: makrokategorins antal i texten ska komma
  // ur registret (klipp-skydd vid registerändring).
  const makroAntal = KURSREGISTER.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
  const rSvar = svaraLokaltMakro(NYA[0].fraga, KURSREGISTER);
  const iSvar = svaraLokaltMakro(NYA[1].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivet tal — MAKROEKONOMI & RÄNTA = " + makroAntal + " i båda svaren",
    rSvar && rSvar.text.includes(makroAntal + " kurser") &&
      iSvar && iSvar.text.includes("(" + makroAntal + " kurser)"),
    "texten ska bära registrets egna tal",
  );
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Stockholm imorgon?",
  "Vem vann fotbolls-VM 1958?",
  "Hur många ben har en spindel?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltMakro(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltMakro(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser i makrosvaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL G: ANTISTÖLD — makro-lagret returnerar null för ALLA 24 gamla ─────
{
  const GAMLA = [
    // Basens femton kanoniska (våg 106 + u2 + u1, alla i dagens MONSTER)
    { fraga: "Vad är AKM1?", amne: "akm1" },
    { fraga: "Hur börjar jag lära mig aktieanalys?", amne: "borja" },
    { fraga: "Vad är en impulsvåg?", amne: "impulsvåg" },
    { fraga: "Vad kostar det?", amne: "kostnad" },
    { fraga: "Ger ni investeringsråd?", amne: "råd" },
    { fraga: "Vad är V09?", amne: "variabel-V09" },
    { fraga: "Vad är teknisk analys?", amne: "teknisk analys" },
    { fraga: "Hur hanterar jag risk?", amne: "risk" },
    { fraga: "Hur bygger jag en portfölj?", amne: "portfölj" },
    { fraga: "Vilka böcker ska jag läsa?", amne: "böcker" },
    { fraga: "Hur fungerar quiz och XP?", amne: "quiz-xp" },
    { fraga: "Vad är Fas 1, 2 och 3?", amne: "faser" },
    { fraga: "Vad är konfluens?", amne: "konfluens" },
    { fraga: "Vad är vågfundamentet?", amne: "vågfundament" },
    { fraga: "Vad är AK1TS?", amne: "ak1ts" },
    // Våg 158 omgång 1 — u1:s fyra
    { fraga: "Vad är utdelning och direktavkastning?", amne: "utdelning" },
    { fraga: "Vilken lärväg ska jag välja?", amne: "lärväg" },
    { fraga: "Hur påverkar psykologin mitt sparande?", amne: "beteende" },
    { fraga: "Hur fungerar ISK och skatt?", amne: "skatt" },
    // Våg 158 omgång 1 — u2:s två
    { fraga: "Hur läser jag en kvartalsrapport?", amne: "rapportläsning" },
    { fraga: "Vad är nyckeltal?", amne: "nyckeltal" },
    // Våg 158 omgång 1 — u3:s tre (extra-lagret, prövas EFTER makro)
    { fraga: "Vad är kassaflödesanalys?", amne: "kassaflödesanalys" },
    { fraga: "Vad är fundamental analys?", amne: "fundamental analys" },
    { fraga: "Vad är en moat?", amne: "moat" },
  ];
  const STJALDA = GAMLA.filter((f) => svaraLokaltMakro(f.fraga, KURSREGISTER) !== null);
  kontroll("G01 antistöld — 24 tidigare kanoniska ger null i makro-lagret", STJALDA.length === 0,
    STJALDA.length ? STJALDA.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltMakro(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓");

  // FALL H: hela kedjan (som chat-widget.tsx) — alla når RÄTT lager.
  // Båda gamla lagren + mitt: basen svarar via svaraLokalt, extra-lagret
  // via svaraLokaltExtra — kedjans totala ämne ska alltid vara det väntade.
  if (svaraLokaltExtra) {
    const kedja = (fraga) =>
      svaraLokaltMakro(fraga, KURSREGISTER) ??
      (svaraLokaltExtra ? svaraLokaltExtra(fraga, KURSREGISTER) : null) ??
      svaraLokalt(fraga, KURSREGISTER);
    const fel = [];
    for (const f of [...GAMLA, ...NYA]) {
      const svar = kedja(f.fraga);
      if (!svar || svar.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (svar ? svar.amne : "null") + " (väntat " + f.amne + ")");
    }
    kontroll("H01 kedja — 24 gamla + 2 nya når rätt lager (makro ?? extra ?? bas)", fel.length === 0,
      fel.length ? fel.join(" | ") : "26/26 rätt lager");
  } else {
    console.log("NOT  H01 hoppas över (extra-lager saknas)");
  }
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN spår 6 u1 omgång 2 (våg 158): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("Nya förhandsfrågor: ränta, inflation · Register: " + KURSREGISTER.length + " kurser");
console.log("────────────────────────────────────────");
process.exitCode = fail === 0 ? 0 : 1;
