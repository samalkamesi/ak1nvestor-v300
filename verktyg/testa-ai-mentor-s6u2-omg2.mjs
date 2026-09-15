/**
 * TESTA AI-MENTORN — s6-u2 OMGÅNG 2 (fabrik auto-s6) — 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-s6u2-omg2.mjs
 *
 * Regressionstest för omgång 2:s två förhandsfrågor i BAS-motorn
 * (ai-mentor-svar.ts:s MONSTER-array, "kapitalstruktur" och "tillväxt")
 * + registerrebaken 337 → 343 som samma leverans ansvarar för.
 *
 * Fall:
 *   A  6 kanoniska frågor  → rätt ämne + primärkälla + flerkällsrad
 *   B  5 felstavningar     → samma träff som den kanoniska
 *   C  10 regressioner     → existerande mönster varken stjäls eller stör
 *                            (kritiskt juridik-tie: "ska jag köpa aktier?"
 *                            ska ALDRIG bli ett kapitalstruktur-svar)
 *   D  determinism         → samma fråga två gånger ⇒ bitidentiskt
 *   E  länkäkthet          → varje /kurser/-länk i de nya svaren finns i
 *                            KURSREGISTER (noll fantomlänkar)
 *   F  källmärkning        → 3 källor, registerfakta (kapitel/minuter ur
 *                            primärraden) i texten — data-driven källa
 *   G  hel kedja           → makro ?? extra ?? bas: de nya frågarna faller
 *                            igenom till BAS-lagret (makro/extra stjäl dem
 *                            inte), och lagerkanonikerna svarar i sitt lager
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-s6u2-omg2.mjs",
  );
  process.exit(1);
}

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltExtra } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-extra-fragor.ts")).href);
const { svaraLokaltMakro } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-makro-fragor.ts")).href);

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

// ── FALL A: kanoniska frågor → rätt ämne + primärkälla + flerkällsrad ───────
const KANONISKA = [
  { fraga: "Vad är kapitalstruktur?", amne: "kapitalstruktur", slug: "ks-01-kapitalstruktur-grunder" },
  { fraga: "Vad är skulder?", amne: "kapitalstruktur", slug: "ks-01-kapitalstruktur-grunder" },
  { fraga: "Hur fungerar hävstång?", amne: "kapitalstruktur", slug: "ks-01-kapitalstruktur-grunder" },
  { fraga: "Vad är organisk tillväxt?", amne: "tillväxt", slug: "tx-01-organisk-mot-forvarvad-tillvaxt" },
  { fraga: "Vad är ett tillväxtbolag?", amne: "tillväxt", slug: "tx-01-organisk-mot-forvarvad-tillvaxt" },
  { fraga: "Vad är förvärvad tillväxt?", amne: "tillväxt", slug: "tx-01-organisk-mot-forvarvad-tillvaxt" },
];

KANONISKA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "' — är monstret kopplat?");
    return;
  }
  const ok =
    svar.amne === f.amne &&
    svar.kalla.slug === f.slug &&
    svar.text.includes("Källor (3)");
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok,
    "ämne=" + svar.amne + " · källa=" + svar.kalla.slug + " · flerkällsrad=" + (svar.text.includes("Källor (3)") ? "ja" : "NEJ"));
});

// ── FALL B: felstavningar → samma träff som kanonisk ────────────────────────
const FELSTAVADE = [
  { fraga: "vad ar kapitalstruktur?", amne: "kapitalstruktur" },
  { fraga: "vad e skulder?", amne: "kapitalstruktur" },
  { fraga: "hur fungerar havstang?", amne: "kapitalstruktur" },
  { fraga: "vad ar organisk tillvaxt?", amne: "tillväxt" },
  { fraga: "vad ar ett forvarv?", amne: "tillväxt" },
];

FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(f.fraga, KURSREGISTER);
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", svar !== null && svar.amne === f.amne,
    svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: regression — existerande mönster varken stjäls eller stör ───────
const REGRESSION = [
  { fraga: "Ska jag köpa aktier?", amne: "råd" },
  { fraga: "Vad är risk?", amne: "risk" },
  { fraga: "Vad kostar det?", amne: "kostnad" },
  { fraga: "Vilka böcker ska jag läsa?", amne: "böcker" },
  { fraga: "Hur läser jag en kvartalsrapport?", amne: "rapportläsning" },
  { fraga: "Vad är nyckeltal?", amne: "nyckeltal" },
  { fraga: "Vad är utdelning?", amne: "utdelning" },
  { fraga: "Hur fungerar skatt på aktier?", amne: "skatt" },
  { fraga: "Vad är en lärväg?", amne: "lärväg" },
  { fraga: "Vad är beteendefinans?", amne: "beteende" },
];

REGRESSION.forEach((f, i) => {
  const nr = "C" + String(i + 1).padStart(2, "0");
  const svar = svaraLokalt(f.fraga, KURSREGISTER);
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", svar !== null && svar.amne === f.amne,
    svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL D: determinism — samma fråga två gånger ⇒ bitidentiskt ─────────────
const DETERM = [
  ...KANONISKA.map((f) => f.fraga),
  ...FELSTAVADE.map((f) => f.fraga),
  ...REGRESSION.map((f) => f.fraga),
];
{
  let identiska = 0;
  for (const q of DETERM) {
    const a = JSON.stringify(svaraLokalt(q, KURSREGISTER));
    const b = JSON.stringify(svaraLokalt(q, KURSREGISTER));
    if (a === b) identiska++;
  }
  kontroll("D01 determinism — " + DETERM.length + " frågor × 2 körningar bitidentiska", identiska === DETERM.length,
    identiska + "/" + DETERM.length + " identiska");
}

// ── FALL E: länkäkthet — inga fantomlänkar i de nya svaren ──────────────────
{
  const slugar = new Set(KURSREGISTER.map((r) => r.slug));
  const nya = ["Vad är kapitalstruktur?", "Vad är organisk tillväxt?"];
  let allaOk = true;
  let detalj = [];
  for (const q of nya) {
    const svar = svaraLokalt(q, KURSREGISTER);
    for (const h of svar.handlings) {
      const m = h.lank.match(/^\/kurser\/([a-z0-9-]+)$/);
      if (!m) continue; // fragor:- och sid-länkar (kalkylator etc.) testas ej här
      if (!slugar.has(m[1])) {
        allaOk = false;
        detalj.push(m[1]);
      }
    }
    for (const kk of svar.kallor || []) {
      if (kk.slug && !slugar.has(kk.slug)) {
        allaOk = false;
        detalj.push("källa:" + kk.slug);
      }
    }
  }
  kontroll("E01 länkäkthet — /kurser/-länkar och källor finns i registret (" + slugar.size + " kurser)", allaOk,
    detalj.length ? "fantom: " + detalj.join(", ") : "0 fantomlänkar");
}

// ── FALL F: källmärkning — registerfakta ur primärraden i texten ────────────
{
  const kap = svaraLokalt("Vad är kapitalstruktur?", KURSREGISTER);
  const til = svaraLokalt("Vad är organisk tillväxt?", KURSREGISTER);
  const kapRad = KURSREGISTER.find((r) => r.slug === "ks-01-kapitalstruktur-grunder");
  const tilRad = KURSREGISTER.find((r) => r.slug === "tx-01-organisk-mot-forvarvad-tillvaxt");
  // Kärnkontroll: 3 källor + primärkällans registerdrivna minuter i handlings-beskrivning
  const minKap = kapRad ? String(kapRad.minuter) : "";
  const minTil = tilRad ? String(tilRad.minuter) : "";
  const f1 = kap.kallor.length === 3 && kap.handlings.some((h) => h.beskrivning.includes(minKap + " min"));
  const f2 = til.kallor.length === 3 && til.handlings.some((h) => h.beskrivning.includes(minTil + " min"));
  kontroll("F01 flerkällskällmärkning — 3 källor + registerdrivna minuter i båda svaren", f1 && f2,
    "kapitalstruktur: " + kap.kallor.length + " källor · " + (f1 ? "minuter " + minKap + " ur registret" : "SAKNAS") +
    " | tillväxt: " + til.kallor.length + " källor · " + (f2 ? "minuter " + minTil + " ur registret" : "SAKNAS"));
}

// ── FALL G: hel kedja — makro ?? extra ?? bas ───────────────────────────────
{
  const kedja = (q) =>
    svaraLokaltMakro(q, KURSREGISTER) || svaraLokaltExtra(q, KURSREGISTER) || svaraLokalt(q, KURSREGISTER);
  const NYA = [
    { fraga: "Vad är kapitalstruktur?", amne: "kapitalstruktur" },
    { fraga: "Vad är skuldsättning?", amne: "kapitalstruktur" },
    { fraga: "Vad är organisk tillväxt?", amne: "tillväxt" },
    { fraga: "Vad är ett tillväxtbolag?", amne: "tillväxt" },
  ];
  let nyaOk = 0;
  for (const f of NYA) {
    const s = kedja(f.fraga);
    if (s && s.amne === f.amne) nyaOk++;
  }
  kontroll("G01 kedja — de nya frågarna faller igenom makro+extra till BAS-lagret", nyaOk === NYA.length,
    nyaOk + "/" + NYA.length + " rätt lager");

  const LAGER = [
    { fraga: "Vad är ränta?", amne: "ränta", via: "makro" },
    { fraga: "Vad är inflation?", amne: "inflation", via: "makro" },
    { fraga: "Vad är kassaflöde?", amne: "kassaflödesanalys", via: "extra" },
    { fraga: "Vad är moat?", amne: "moat", via: "extra" },
    { fraga: "Vad är AKM1?", amne: "akm1", via: "bas" },
    { fraga: "Ska jag köpa aktier?", amne: "råd", via: "bas" },
  ];
  let lagerOk = 0;
  const lagerDetalj = [];
  for (const f of LAGER) {
    const s = kedja(f.fraga);
    const ok = s && s.amne === f.amne;
    if (ok) lagerOk++;
    else lagerDetalj.push(f.fraga + "→" + (s ? s.amne : "null"));
  }
  kontroll("G02 kedja — lagerkanonikerna svarar i sitt eget lager", lagerOk === LAGER.length,
    lagerOk + "/" + LAGER.length + (lagerDetalj.length ? " · fel: " + lagerDetalj.join(", ") : ""));
}

// ── Sammanfattning ───────────────────────────────────────────────────────────
console.log("────────────────────────────────────────");
console.log(
  "AI-MENTORN s6-u2 omgång 2 (kapitalstruktur + tillväxt): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail),
);
console.log("Register: " + KURSREGISTER.length + " kurser · kedja: makro ?? extra ?? bas");
console.log("────────────────────────────────────────");
process.exitCode = fail === 0 ? 0 : 1;
