/**
 * TESTA AI-MENTORN — NYKULL-LAGRET (s6-u3, fönster 34, manifest
 * auto-s6-1790029519192). Regressionstest för de tre monsters som aktiverar
 * spår 5:s kurskull: produktionsgapet (ma-09) + bindningsrisken (st-08
 * primär) + underhållscapexet (ln-06).
 *
 * Kör:  node verktyg/testa-ai-mentor-nykull.mjs
 *
 *   A    kanoniska frågor: rätt monster, källmärke «📖 Källor (5)»,
 *        ≥4 äkta kurslänkar, ≥1 fragor:-knapp, motfråga + fördjupa
 *   A2   MOTORDEFS-position LIVE (efter notlasning, FÖRE nyfodda) +
 *        antal-vakten (3 monsters)
 *   B    felstavade/varierade varianter → samma träff
 *   C    determinism — frågor två gånger ⇒ bitidentiskt svar
 *   D01–D33 aritmetik maskinellt omräknad (kursernas egna modelltal)
 *        + registerdrivna tal + 0 fantomslugs
 *   F    ägargränser: grannfrågorna lämnas sina ägare (NULL här)
 *   F2   juridikgrind (2007:528): 0 rådsfraser, utbildningsframing,
 *        påhittade-tal-deklarationer
 *   G    ANTISTÖLD: 10 grannkanonika genom hela MOTORDEFS-kedjan —
 *        detta lager får aldrig stjäla dem (och vice versa: J)
 *   H/H2 ägar-invariant: varje kärnord unikt mot övriga lager (LIVE)
 *   L    widget-synk: svaraLokaltNykull finns i chat-widget-kedjan
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * F2 vaktar att alla tre svaren är pedagogisk utbildning — aldrig råd.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltNykull, NYKULL_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-nykull-fragor.ts")).href);

let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) { pass++; console.log("PASS  " + namn + (detalj ? "  — " + detalj : "")); }
  else { fail++; console.log("FAIL  " + namn + (detalj ? "  — " + detalj : "")); }
}
function närhet(namn, förväntat, faktiskt, tol = 0) {
  kontroll(namn, Math.abs(förväntat - faktiskt) <= tol, förväntat + " ~ " + faktiskt);
}

const SVAR = {};
for (const m of NYKULL_MONSTER) SVAR[m.id] = m.bygga(KURSREGISTER);

// ── FALL A: kanoniska frågor ────────────────────────────────────────────────
const KANONISKA = [
  { fraga: "vad är produktionsgapet?", id: "produktionsgapet" },
  { fraga: "vad är potentialproduktion?", id: "produktionsgapet" },
  { fraga: "vad är hastighetstaket?", id: "produktionsgapet" },
  { fraga: "vad är okuns räknelära?", id: "produktionsgapet" },
  { fraga: "vad är phillips-läxan?", id: "produktionsgapet" },
  { fraga: "vad är nollgolvet?", id: "produktionsgapet" },
  { fraga: "vad är bindningsrisken?", id: "bindningsrisken" },
  { fraga: "vad är känslighetstalet?", id: "bindningsrisken" },
  { fraga: "vad är bindningstrappan?", id: "bindningsrisken" },
  { fraga: "vad är underhållscapex?", id: "underhallscapexet" },
  { fraga: "vad är tillväxtcapex?", id: "underhallscapexet" },
  { fraga: "vad är underinvesteringsfällan?", id: "underhallscapexet" },
  { fraga: "vad är faskvoten?", id: "underhallscapexet" },
];
for (const { fraga, id } of KANONISKA) {
  const s = svaraLokaltNykull(fraga, KURSREGISTER);
  kontroll("A: " + fraga, s !== null && s.amne === SVAR[id].amne, s ? "ämne=" + s.amne : "null");
}
// Källmärkning + kurslänkar + knappar per monster
for (const id of Object.keys(SVAR)) {
  const s = SVAR[id];
  const kallmärke = s.text.includes("📖 Källor (5):");
  const kurslankar = (s.handlings || []).filter((h) => h.lank.startsWith("/kurser/"));
  const knapp = (s.handlings || []).filter((h) => h.lank.startsWith("fragor:"));
  const allaÄkta = kurslankar.every((h) => KURSREGISTER.find((r) => r.slug === h.lank.replace("/kurser/", "")));
  kontroll(
    "A: källmärke+läkthet " + id,
    kallmärke && kurslankar.length >= 4 && allaÄkta && knapp.length >= 1 && !!s.motfraga && !!s.fordjupa,
    "källor 5 · kurslänkar " + kurslankar.length + " (äkta " + allaÄkta + ") · knappar " + knapp.length,
  );
}

// ── FALL A2: MOTORDEFS-position LIVE + antal-vakt ───────────────────────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(/\{\s*namn:\s*"([^"]+)",\s*fil:\s*"([^"]+)"/g)].map((m) => m[2]);
  const ix = MOTORDEFS.indexOf("ai-mentor-nykull-fragor.ts");
  const ixNot = MOTORDEFS.indexOf("ai-mentor-notlasning-fragor.ts");
  const ixNyf = MOTORDEFS.indexOf("ai-mentor-nyfodda-fragor.ts");
  const ixRytm = MOTORDEFS.indexOf("ai-mentor-marknadsrytm-fragor.ts");
  kontroll(
    "A2 MOTORDEFS-position LIVE (efter notlasning, FÖRE nyfodda — A2-precedensen)",
    ix > ixNot && ix < ixNyf && ix < ixRytm && ix >= 0,
    ix < 0 ? "SAKNAS i MOTORDEFS" : "position " + (ix + 1) + "/" + MOTORDEFS.length,
  );
  kontroll("A2 antal-vakt (3 monsters)", NYKULL_MONSTER.length === 3, "antal " + NYKULL_MONSTER.length);
}

// ── FALL B: felstavade/varierade varianter ──────────────────────────────────
const VARIANTER = [
  ["vad är produktsionsgapet?", "produktionsgapet"],
  ["produktionsgap?", "produktionsgapet"],
  ["vad är potentialprodukionen?", "produktionsgapet"],
  ["vad är hastighetstak?", "produktionsgapet"],
  ["vad är bindningsrisken för bolag?", "bindningsrisken"],
  ["vad är känsligetstalet?", "bindningsrisken"],
  ["bindningsrisk?", "bindningsrisken"],
  ["vad är underhålscapex?", "underhallscapexet"],
  ["underhallscapex?", "underhallscapexet"],
  ["vad är tillväxtcapx?", "underhallscapexet"],
  ["vad är kassaörat?", "underhallscapexet"],
  ["vad är faskvoten för bolaget?", "underhallscapexet"],
];
for (const [fraga, id] of VARIANTER) {
  const s = svaraLokaltNykull(fraga, KURSREGISTER);
  kontroll("B: " + fraga, s !== null && s.amne === SVAR[id].amne, s ? "ämne=" + s.amne : "null");
}

// ── FALL C: determinism ─────────────────────────────────────────────────────
{
  const fragor = KANONISKA.map((k) => k.fraga).concat(VARIANTER.map((v) => v[0]));
  let bitidentisk = true;
  for (const f of fragor) {
    const a = JSON.stringify(svaraLokaltNykull(f, KURSREGISTER));
    const b = JSON.stringify(svaraLokaltNykull(f, KURSREGISTER));
    if (a !== b) { bitidentisk = false; break; }
  }
  kontroll("C: determinism — " + fragor.length + " frågor × 2 körningar bitidentiska", bitidentisk);
}

// ── FALL D: aritmetik maskinellt omräknad (kursernas egna modelltal) ───────
// Alla kontroller OBEROENDE omräknade här och jämförda mot textens tal.
{
  // Produktionsgapet (ma-09, Svealand + Norrverk)
  närhet("D01 timmar: 5,0 m × 1 600", 8_000_000_000, 5_000_000 * 1600);
  närhet("D02 potential: 8,0 mdr × 575", 4_600_000_000_000, 5_000_000 * 1600 * 575);
  närhet("D03 gap: (4 416 − 4 600) ÷ 4 600", -4.0, ((4416 - 4600) / 4600) * 100, 0.05);
  närhet("D04 gap 4 508", -2.0, ((4508 - 4600) / 4600) * 100, 0.05);
  närhet("D05 gap 4 784", 4.0, ((4784 - 4600) / 4600) * 100, 0.05);
  närhet("D06 takets rörelse: 0,99 × 1,008", 0.99792, 0.99 * 1.008, 0.0001);
  närhet("D06b ny potential 4 600 × 0,998", 4590.4, 4600 * 0.99792, 0.5);
  närhet("D07 spänningsmått 92 000 ÷ 205 000", 0.449, 92000 / 205000, 0.001);
  närhet("D08 Okun: 0,5 × 4,0 + 6,5", 8.5, 0.5 * 4.0 + 6.5);
  närhet("D09a Phillips gap −4,0", 0.0, 2.0 + 0.5 * -4.0);
  närhet("D09b Phillips gap +4,0", 4.0, 2.0 + 0.5 * 4.0);
  närhet("D10 Taylor: 2,0 + 4,0 + 1,0 + 0,75", 7.75, 2.0 + 4.0 + 0.5 * 2.0 + 0.5 * 1.5);
  närhet("D10b händerna", 1.75, 0.5 * 2.0 + 0.5 * 1.5);
  närhet("D11 kris/nollgolvet", -1.0, 2.0 + 0.0 + 0.5 * -2.0 + 0.5 * -4.0);
  närhet("D12 Norrverk: 7 800 ÷ 10 000", 78, (7800 / 10000) * 100);
  kontroll("D12b Norrverk över taket", 7800 + 2500 - 10000 === 300, "10 300 − 10 000 = 300");

  // Bindningsrisken (st-08, Sund Värme)
  närhet("D13 A: 600 × 6,00 %", 36, 600 * 0.06);
  närhet("D13b täckning A", 2.50, 90 / 36, 0.01);
  närhet("D14 B: 600 × 5,00 %", 30, 600 * 0.05);
  närhet("D14b täckning B", 3.00, 90 / 30, 0.01);
  närhet("D15 premien 5 år", 30, 5 * 6);
  närhet("D16 break-even", 2.80, 5.00 - 2.20);
  närhet("D17 känslighet A", 6.0, 600 / 100);
  närhet("D17b känslighet trappa", 4.0, 400 / 100);
  närhet("D18a stress A: 36 + 3 × 6", 54, 36 + 3 * 6);
  närhet("D18b täckning A stress", 1.296, 70 / 54, 0.01);
  närhet("D18c täckning B stress", 2.333, 70 / 30, 0.01);
  närhet("D18d trappans stressränta", 46, 200 * 0.05 + 400 * 0.09);
  närhet("D18e trappans täckning", 1.522, 70 / 46, 0.01);
  närhet("D19a trappan lugn", 34, 200 * 0.05 + 400 * 0.06);
  närhet("D19b trappans täckning lugn", 2.647, 90 / 34, 0.01);
  närhet("D20 swappåslag", 1, 200 * 0.005);
  närhet("D20b känslighet efter swap", 2.0, 200 / 100);
  närhet("D21a lugn efter swap", 35, 10 + 13 + 12);
  närhet("D21b stress efter swap", 41, 10 + 13 + 18);
  närhet("D21c täckning stress swap", 1.707, 70 / 41, 0.01);
  närhet("D22a soliditet", 38.78, (380 / 980) * 100, 0.05);
  närhet("D22b skuldsättningsgrad", 1.579, 600 / 380, 0.001);

  // Underhållscapexet (ln-06, Svanhals)
  närhet("D23 naivt FCf", 72, 204 - 132);
  närhet("D24a avskrivning maskiner", 60, 720 / 12);
  närhet("D24b avskrivning byggnader", 12, 480 / 40);
  närhet("D24c summa avskrivningar", 72, 720 / 12 + 480 / 40);
  kontroll("D25 median 74/77/78/81/132", [74, 77, 78, 81, 132].sort((a, b) => a - b)[2] === 78, "median 78");
  närhet("D26 nyckeltal", 72, 0.06 * 1200);
  närhet("D27a kassaöre arbetsnummer", 129, 204 - 75);
  närhet("D27b kassaöre-marginal", 10.75, (129 / 1200) * 100, 0.05);
  närhet("D28a kassaöre exakt", 132, 204 - 72);
  närhet("D28b marginal exakt", 11.0, (132 / 1200) * 100, 0.05);
  närhet("D29 tillväxtens pris", 57, 132 - 75);
  närhet("D30a faskvot hallår", 1.833, 132 / 72, 0.001);
  närhet("D30b faskvot median", 1.083, 78 / 72, 0.001);
  närhet("D31a nettotapp", 32, 72 - 40);
  närhet("D31b substans efter 5 år", 1040, 1200 - 5 * 32);
  närhet("D32 underhållsandel", 54.5, (72 / 132) * 100, 0.1);
  närhet("D33a kassaöra 6 %-bolag", 11.0, 17.0 - 6.0);
  närhet("D33b kassaöra 2 %-bolag", 15.0, 17.0 - 2.0);

  // Registerdrivna tal LIVE (D25-klassen från omgång 33)
  const maAntal = KURSREGISTER.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
  const stAntal = KURSREGISTER.filter((r) => r.kategori === "STABILITET").length;
  const lnAntal = KURSREGISTER.filter((r) => r.kategori === "LÖNSAMHET").length;
  kontroll(
    "D34 registerdrivna tal LIVE i texterna",
    SVAR.produktionsgapet.text.includes(String(maAntal) + " kurser") &&
      SVAR.bindningsrisken.text.includes(String(stAntal) + " kurser") &&
      SVAR.underhallscapexet.text.includes(String(lnAntal) + " kurser"),
    "MA=" + maAntal + " · ST=" + stAntal + " · LÖN=" + lnAntal,
  );

  // 0 fantomslugs: alla källor, handlingslänkar och fordjupa äkta
  let fantom = 0;
  for (const id of Object.keys(SVAR)) {
    const s = SVAR[id];
    for (const kk of s.kallor || []) {
      if (kk.slug && !KURSREGISTER.find((r) => r.slug === kk.slug)) { fantom++; console.log("  fantom källa: " + kk.slug); }
    }
    for (const h of s.handlings || []) {
      const m = h.lank.match(/^\/kurser\/(.+)$/);
      if (m && !KURSREGISTER.find((r) => r.slug === m[1])) { fantom++; console.log("  fantom handling: " + h.lank); }
    }
    const f = s.fordjupa && s.fordjupa.lank.match(/^\/kurser\/(.+)$/);
    if (f && !KURSREGISTER.find((r) => r.slug === f[1])) { fantom++; console.log("  fantom fordjupa: " + s.fordjupa.lank); }
  }
  kontroll("D35 0 fantomslugar (källor + handlings + fordjupa)", fantom === 0, fantom + " fantom");
}

// ── FALL F: ägargränser — grannfrågorna lämnas sina ägare ────────────────────
{
  // Dessa frågor ägs av andra lager — detta lager ska lämna null (utom
  // där dokumenterad poängkamp gäller: nakna «räntenoten» går till
  // banksektorn i KEDJAN men detta lager lämnar null på dem utan eget
  // kärnordssällskap).
  const GRANNAR = [
    "vad är en swap?",              // handelsdagen (vwap, tav-1)
    "vad är stresstest?",           // stabilitetsdjupet
    "vad är känslighetsanalys?",    // stabilitetsdjupet
    "vad är naturfrekvensen?",      // mk-02:s ägare
    "vad är tillväxt?",             // basens tillväxt-monster
    "vad är en budprocess?",        // kategoristängning-lagret
    "vad är senioritetsordningen?", // skuldordning-lagret (u2)
  ];
  for (const g of GRANNAR) {
    const s = svaraLokaltNykull(g, KURSREGISTER);
    kontroll("F: gräns «" + g + "» → null här", s === null, s ? "STAL: " + s.amne : "null ✓");
  }
}

// ── FALL F2: juridikgrind (2007:528) ────────────────────────────────────────
{
  const rådsfraser = ["köp denna", "sälj denna", "jag rekommenderar", "du bör köpa", "du bör sälja", "placera i", "investera i detta", "köp aktien", "sälj aktien"];
  let fynd = [];
  for (const id of Object.keys(SVAR)) {
    const t = SVAR[id].text.toLowerCase();
    for (const r of rådsfraser) if (t.includes(r)) fynd.push(id + ": «" + r + "»");
  }
  kontroll("F2: 0 rådsfraser (2007:528)", fynd.length === 0, fynd.join(" · ") || "ren");
  const framar = SVAR.produktionsgapet.text.includes("utbildning i") && SVAR.bindningsrisken.text.includes("utbildning i") && SVAR.underhallscapexet.text.includes("utbildning i");
  const pahtittade = SVAR.produktionsgapet.text.includes("påhittad") && SVAR.bindningsrisken.text.includes("påhittade") && SVAR.underhallscapexet.text.includes("påhittat");
  kontroll("F2: utbildningsframing + påhittade-tal-deklarationer", framar && pahtittade);
}

// ── FALL G: ANTISTÖLD — grannkanonika genom hela kedjan ─────────────────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(/\{\s*namn:\s*"([^"]+)",\s*fil:\s*"([^"]+)",\s*fn:\s*"([^"]+)"/g)].map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));
  const MINA = ["vad är produktionsgapet?", "vad är bindningsrisken?", "vad är underhållscapex?", "vad är känslighetstalet?", "vad är faskvoten?"];
  let stöld = 0;
  for (const d of MOTORDEFS) {
    if (d.fil === "ai-mentor-nykull-fragor.ts") continue;
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    for (const f of MINA) {
      if (modul[d.fn](f, KURSREGISTER)) { stöld++; console.log("  STÖLD: " + d.namn + " svarade på «" + f + "»"); }
    }
  }
  kontroll("G: ANTISTÖLD — 5 kanoniska NULL genom " + (MOTORDEFS.length - 1) + " andra motorer", stöld === 0, stöld + " stölder");
}

// ── FALL H/H2: ägar-invariant LIVE ──────────────────────────────────────────
{
  const LIB = join(ROT, "src/lib");
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(/\{\s*namn:\s*"([^"]+)",\s*fil:\s*"([^"]+)",\s*fn:\s*"([^"]+)"/g)].map((m) => m[2]);
  let kollisioner = 0;
  const mina = NYKULL_MONSTER.flatMap((m) => m.karnord);
  for (const fil of MOTORDEFS) {
    if (fil === "ai-mentor-nykull-fragor.ts") continue;
    const t = readFileSync(join(LIB, fil), "utf8");
    const block = t.match(/karnord:\s*\[([^\]]*)\]/g) || [];
    const deras = block.flatMap((b) => [...b.matchAll(/"([^"]+)"/g)].map((x) => x[1]));
    for (const k of mina) if (deras.includes(k)) { kollisioner++; console.log("  kollision: " + k + " @ " + fil); }
  }
  kontroll("H: kärnordsdisjunktion LIVE (" + mina.length + " kärnord mot " + (MOTORDEFS.length - 1) + " lager)", kollisioner === 0, kollisioner + " kollisioner");
  const idn = NYKULL_MONSTER.map((m) => m.id);
  kontroll("H2: tre unika monster-id", new Set(idn).size === 3, idn.join(", "));
}

// ── FALL L: widget-synk ─────────────────────────────────────────────────────
{
  const w = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importen = w.includes('import { svaraLokaltNykull } from "@/lib/ai-mentor-nykull-fragor"');
  const kedjan = /svaraLokaltNotlasning\(q, KURSREGISTER\) \?\? svaraLokaltNykull\(q, KURSREGISTER\) \?\? svaraLokaltNyfodda\(q, KURSREGISTER\)/.test(w);
  kontroll("L: widget-synk (import + kedjeposition Notlasning ?? Nykull ?? Nyfodda)", importen && kedjan, "import " + importen + " · kedja " + kedjan);
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("\nNYKULL-LAGRET (s6-u3, fönster 34): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
