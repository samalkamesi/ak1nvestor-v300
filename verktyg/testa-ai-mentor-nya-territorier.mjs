/**
 * TESTA AI-MENTORN — NYA TERRITORIER-LAGRET (spår 6 omgång 24, s6-u3), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-nya-territorier.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers tre monsters — aktivisten (kt-07 + ib-04: kampanjens
 * fem etapper, kravbrevets tre poster, prisbanan, röststruktur-fällan),
 * guidningen (kt-06 + kt-04 + kt-05: det dubbla slaget, kalibreringsserien,
 * fem rader, tystnaden och kalendern) och bostadsmekaniken + demografin
 * (ma-08 + mk-12: transmissionen, lånekraftsekvationen, reglerna, trögheten,
 * hävstången, beroendekvoten):
 *   A  kanonisk    — 3 frågor: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), ≥2 källor), ≥2 registeräkta kurslänkar
 *   A2 wiring      — komponenten i chat-widget.tsx kompositionsrad, EFTER
 *                    moatdjup (57:e motorn i 57-läget), ingen SIST-anspråk
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (57 lager)
 *   D02 register   — kategoriantal i texten ur registret (VID SVARSTID)
 *   D03 aritmetik  — kursexempelens tal OBEROENDE omräknade (gapet, röst-
 *                    längden, prisbanan, det dubbla slaget, kalibreringen,
 *                    lånekraften, tjänstegraden, hävstången, kvoterna)
 *   E  genomström  — gränsfrågorna → null hos DETTA lager (ägarnas orden
 *                    är inte kärnord här)
 *   F  juridik     — inga köp/sälj-rådfraser (lagen 2007:528 — utbildning)
 *   G  antistöld   — tidigare kanoniska (inkl. fönstrets syskonlager) →
 *                    oförändrade
 *   G2 syskonkärnord — ALLA andra lagers kärnord LIVE som frågor → 0
 *   H  kedja       — lager-invarianten: gamla svar bitidentiska
 *                    med/utan detta lager + nya når rätt lager
 *   I  omkastad    — de nya kanoniska → null i kedjan UTAN detta lager
 *   J  disjunktion — kärnorden överlappar inget annat lagers (mekaniskt,
 *                    tavstånd inom motorns tolerans)
 *   L  widget-synk — kedjeraden i chat-widget.tsx bär samtliga 57 lager i
 *                    ordning + import + inga okända komponenter
 *
 * KEDJAN LÄSES DYNAMISKT ur testa-ai-mentor-kedja.mjs MOTORDEFS (samma
 * källa som kedjetestets G-fall vakar mot widgeten) — tål syskonens
 * pågående wiring i samma fönster utan att detta test blir inaktuellt.
 *
 * DOKUMENTERADE GRÄNSER (sond _s6u3-sond{,2,3}-omg24.mjs, tre ronder;
 * anspråk data/vakten/auto-s6-1789840407-u3-ansprak.md — dekonflikten
 * mot u1:s försäkring är bokförd där och i modulens kommentar):
 *   • BAS äger naked «katalysator» («vad är en tillverkad katalysator?»
 *     sondbekräftat) — knapp här, aldrig kärnord.
 *   • NÄSTA äger substansvärde-orden, ÄGANDE bolagsstämma/rösträtt —
 *     knappar här; ib-04:s NAV/rabatt är KÄLLA, inte kärnord.
 *   • MAKRO äger ränte-/inflations-orden — starkord + knappar här.
 *   • BAS äger «hur påverkar X börsen?»-formerna — knapp här (kedjan
 *     svarar via bas FÖRE detta lager; fallet H vaktar att detta lager
 *     aldrig ändrar bas-svaret).
 *   • u1 FÖRSÄKRING äger combined ratio-/float-/försäkrings-compound-
 *     familjen (deras anspråk vann); u2 MOATDJUP äger prisfullmakt/
 *     byteskostnad — orörda här.
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — aktivist-monstret bär
 * dessutom kursens egen avgränsning rakt ut i texten: «rabatten är en
 * post att räkna, aldrig ett köpskäl i sig».
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-nya-territorier.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltNyaTerritorier, NYA_TERRITORIER_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-nya-territorier-fragor.ts")).href);

// ── Kedjan DYNAMISKT ur kedjetestets MOTORDEFS (syskon-tålighet) ────────────
const kedjeSrc = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defsBlock = kedjeSrc.slice(kedjeSrc.indexOf("const MOTORDEFS = ["), kedjeSrc.indexOf("];", kedjeSrc.indexOf("const MOTORDEFS = [")));
const MOTORDEFS = [...defsBlock.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
const MIN_FIL = "ai-mentor-nya-territorier-fragor.ts";
if (!MOTORDEFS.some((d) => d.fil === MIN_FIL)) {
  console.error("FEL: " + MIN_FIL + " saknas i kedjetestets MOTORDEFS — wirea först.");
  process.exit(1);
}
const LAGER = [];
for (const d of MOTORDEFS) {
  const mod = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  LAGER.push({ namn: d.namn, fil: d.fil, fnk: mod[d.fn], monster: mod[d.arr], antal: d.antal });
}
function kora(lager, fraga) {
  for (const l of lager) {
    const s = l.fnk(fraga, KURSREGISTER);
    if (s) return s;
  }
  return null;
}
const MED = LAGER;
const UTAN = LAGER.filter((l) => l.fil !== MIN_FIL);

// ── Testharness ─────────────────────────────────────────────────────────────
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
function norm(n) { return n.replace(/,/g, ".").replace(/\s/g, ""); }
function nara(faktiskt, vantat, tol = 0.051) { return Math.abs(Number(norm(faktiskt)) - vantat) <= tol; }

// ── FALL A: de tre kanoniska med flerkällskrav ──────────────────────────────
const NYA = [
  { fraga: "Vad är en aktivist?", amne: "aktivisten", slug: "kt-07-den-tillverkade-katalysatorn", kallorMin: 2 },
  { fraga: "Vad är guidningen?", amne: "guidningen", slug: "kt-06-guidningen", kallorMin: 3 },
  { fraga: "Hur fungerar bostadsmarknaden?", amne: "bostadsmekaniken", slug: "ma-08-bostadsmarknadens-mekanik", kallorMin: 2 },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltNyaTerritorier(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length >= f.kallorMin;
  const kallradOk = svar.text.includes("📖 Källor (");
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/"));
  const kurslankarOk = kurslankar.length >= 2;
  kontroll(
    nr + " " + f.amne + " — '" + f.fraga + "'",
    amneOk && kallaOk && kallorFinns && kallradOk && kurslankarOk,
    "ämne=" + svar.amne + " · källa=" + svar.kalla.slug +
      " · källor=" + (svar.kallor ? svar.kallor.length : 0) +
      " · kurslänkar=" + kurslankar.length,
  );
});

// ── FALL A2: wiring — komponenten i widgetens kompositionsrad ──────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rad = widget.match(/const lokalt = ([^;]+);/);
  const ordning = rad ? [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]) : [];
  const minPos = ordning.indexOf("svaraLokaltNyaTerritorier");
  const moatPos = ordning.indexOf("svaraLokaltMoatdjup");
  kontroll(
    "A2 wiring — nyaterritorier i kompositionsraden efter moatdjup (" + LAGER.length + " lager, ingen SIST-anspråk)",
    // Omgång 25 (s6-u2-harmonisering): SIST-kravetulet avlägsnat — lagrets
    // egen worklog deklarerar «INGEN SIST-anspråk», och omgång 25 wireade tre
    // lager efter det (etfmekanik/kontrahent/marknadsrytm). Kvar vaktar:
    // EFTER moatdjup + widgetens längd == MOTORDEFS (G-speglingen).
    minPos === moatPos + 1 && ordning.length === LAGER.length,
    "position=" + (minPos + 1) + " av " + ordning.length + " (moatdjup=" + (moatPos + 1) + ")",
  );
}

// ── FALL B: felstavningar och varianter ─────────────────────────────────────
{
  const VARIANTER = [
    ["vad är en aktivist?", "aktivisten"],
    ["vad är en aktiviste?", "aktivisten"],
    ["vad är aktivism?", "aktivisten"],
    ["vad är aktivister?", "aktivisten"],
    ["vad är ett kravbrev?", "aktivisten"],
    ["vad är kravbrevet?", "aktivisten"],
    ["vad är en aktiekampanj?", "aktivisten"],
    ["vad är guidning?", "guidningen"],
    ["vad är guidningen?", "guidningen"],
    ["vad är guidningar?", "guidningen"],
    ["vad är en prognos?", "guidningen"],
    ["vad är prognoser?", "guidningen"],
    ["vad är bolagsprognos?", "guidningen"],
    ["hur funkar bostadsmarknaden?", "bostadsmekaniken"],
    ["vad är bostadsmarknaden?", "bostadsmekaniken"],
    ["vad är bostadspriser?", "bostadsmekaniken"],
    ["vad är lånekraften?", "bostadsmekaniken"],
    ["vad är ett bolån?", "bostadsmekaniken"],
    ["vad är demografin?", "bostadsmekaniken"],
    ["vad är en befolkningspyramid?", "bostadsmekaniken"],
  ];
  const fel = [];
  for (const [fraga, amne] of VARIANTER) {
    const s = svaraLokaltNyaTerritorier(fraga, KURSREGISTER);
    if (!s || s.amne !== amne) fel.push("'" + fraga + "' ⇒ " + (s ? s.amne : "null") + " (väntat " + amne + ")");
  }
  kontroll("B varianter — " + VARIANTER.length + " formuleringar når rätt monster", fel.length === 0,
    fel.length ? fel.join(" | ") : VARIANTER.length + "/" + VARIANTER.length + " rätt");
}

// ── FALL C: determinism ─────────────────────────────────────────────────────
{
  const ALLA = NYA.map((f) => f.fraga);
  const fel = [];
  for (const f of ALLA) {
    const a = JSON.stringify(svaraLokaltNyaTerritorier(f, KURSREGISTER));
    const b = JSON.stringify(svaraLokaltNyaTerritorier(f, KURSREGISTER));
    if (a !== b) fel.push("'" + f + "' ej bitidentisk");
  }
  kontroll("C determinism — samma fråga × 2 ⇒ bitidentiskt svar", fel.length === 0,
    fel.length ? fel.join(" | ") : ALLA.length + " × 2 gröna");
}

// ── FALL D01: källaäkthet — 0 fantomslugar ─────────────────────────────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const monster of NYA_TERRITORIER_MONSTER) {
    const svar = monster.bygga(KURSREGISTER);
    if (svar.kalla.slug && !slugFinns.has(svar.kalla.slug)) FEL.push("kalla '" + svar.kalla.slug + "'");
    for (const k of svar.kallor ?? []) if (k.slug && !slugFinns.has(k.slug)) FEL.push("källa '" + k.slug + "'");
    for (const h of svar.handlings) {
      const m = h.lank.match(/^\/kurser\/([a-z0-9-]+)$/);
      if (m && !slugFinns.has(m[1])) FEL.push("handling '" + h.lank + "'");
    }
    const fm = svar.fordjupa.lank.match(/^\/kurser\/([a-z0-9-]+)$/);
    if (fm && !slugFinns.has(fm[1])) FEL.push("fordjupa '" + svar.fordjupa.lank + "'");
  }
  kontroll("D01 källaäkthet — inga fantomslugar i de nya svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta (7 källor: kt-07 + ib-04 + kt-06 + kt-04 + kt-05 + ma-08 + mk-12)");
}

// ── FALL D01b: fragor:-knappar levande mot HELA kedjan ──────────────────────
{
  const KNAPPAR = [
    "vad är substansvärde?",
    "vad är en bolagsstämma?",
    "vad är en katalysator?",
    "vad är förväntningsanalys?",
    "vad är räntan?",
    "hur påverkar bostadsmarknaden börsen?",
    "vad är konjunkturindikatorer?",
    "vad är utdelning?",
    "hur analyserar jag en bank?",
    "vad är inflation och KPI?",
  ];
  const FEL = [];
  for (const q of KNAPPAR) {
    const mal = kora(MED, q);
    if (!mal) FEL.push("knapp '" + q + "' landar null i HELA kedjan — död knapp");
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (" + LAGER.length + " lager)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar (" + KNAPPAR.length + " provade)");
}

// ── FALL D02: registerdrivna tal VID SVARSTID ───────────────────────────────
{
  const ktAntal = KURSREGISTER.filter((r) => r.kategori === "KATALYSATOR").length;
  const maAntal = KURSREGISTER.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
  const mkAntal = KURSREGISTER.filter((r) => r.kategori === "MAKROEKONOMI").length;
  const kt07 = KURSREGISTER.find((r) => r.slug === "kt-07-den-tillverkade-katalysatorn");
  const fel = [];
  const a = svaraLokaltNyaTerritorier("vad är en aktivist?", KURSREGISTER);
  const g = svaraLokaltNyaTerritorier("vad är guidningen?", KURSREGISTER);
  const b = svaraLokaltNyaTerritorier("hur fungerar bostadsmarknaden?", KURSREGISTER);
  if (!a.text.includes("I kategorin katalysator finns " + ktAntal + " kurser")) fel.push("ktAntal " + ktAntal + " saknas i aktivisten");
  if (kt07 && !a.text.includes(kt07.minuter + " min")) fel.push("kt-07 minuter (" + kt07.minuter + ") saknas");
  if (!g.text.includes("I kategorin katalysator finns " + ktAntal + " kurser")) fel.push("ktAntal " + ktAntal + " saknas i guidningen");
  if (!b.text.includes("I kategorierna finns " + maAntal + " ränt- och makrokurser samt " + mkAntal + " makroekonomiska")) fel.push("maAntal/mkAntal (" + maAntal + "/" + mkAntal + ") saknas i bostaden");
  kontroll("D02 register — kategoriantal + kurstal ur registret i svaren", fel.length === 0,
    fel.length ? fel.join(" | ") : "KATALYSATOR=" + ktAntal + " · MA&R=" + maAntal + " · MAKRO=" + mkAntal + " · kt-07 " + (kt07 ? kt07.minuter + " min" : "?"));
}

// ── FALL D03: aritmetik — oberoende omräkning av kursexempelens tal ─────────
{
  const a = svaraLokaltNyaTerritorier("vad är en aktivist?", KURSREGISTER).text;
  const g = svaraLokaltNyaTerritorier("vad är guidningen?", KURSREGISTER);
  const b = svaraLokaltNyaTerritorier("hur fungerar bostadsmarknaden?", KURSREGISTER).text;
  const fel = [];
  const krav = (txt, del, varde, vantat, tol = 0.051) => { if (!txt.includes(del)) fel.push("fragment '" + del + "' saknas"); else if (!nara(varde, vantat, tol)) fel.push(del + ": " + varde + " ≠ " + vantat); };
  const kravP = (txt, del) => { if (!txt.includes(del)) fel.push("fragment '" + del + "' saknas"); };

  // AKTIVISTEN (kt-07 + ib-04)
  krav(a, "178,0 − 124,0 = 54,0", "54,0", 178 - 124, 0);
  krav(a, "54,0 ÷ 124,0 = 43,5", "43,5", 54 / 124 * 100, 0.051);
  krav(a, "20,0 miljoner A-aktier", "20,0", 20, 0);
  krav(a, "28,0 miljoner röster", "28,0", 20 + 80 * 0.1, 0);
  krav(a, "51,4 procent av RÖSTERNA", "51,4", 14.4 / 28 * 100, 0.051);
  krav(a, "1,9 procent av rösterna", "1,9", 5.4 * 0.1 / 28 * 100, 0.051);
  krav(a, "4,6 procent till 129,7", "129,7", 124 * 1.046, 0.051);
  krav(a, "2,3 procent till 132,7", "132,7", 129.7 * 1.023, 0.051);
  krav(a, "144,8", "144,8", 132.7 * 1.091, 0.051);
  krav(a, "146,0", "146,0", 178 * (1 - 0.18), 0.051);
  krav(a, "17,7 procent över start", "17,7", (146 - 124) / 124 * 100, 0.051);
  krav(a, "9,7 procent", "9,7", 1200 / 12400 * 100, 0.051);
  krav(a, "1 200 miljoner", "1 200", 1200, 0);
  // 30,3 % rabatt: 1 − 124/178
  krav(a, "30,3 procent", "30,3", (1 - 124 / 178) * 100, 0.051);

  // GUIDNINGEN (kt-06 + kt-04 + kt-05)
  krav(g.text, "15,0 × 10,80 = 162,0", "162,0", 15 * 10.8, 0);
  krav(g.text, "13,5 × 10,80 = 145,8", "145,8", 13.5 * 10.8, 0);
  krav(g.text, "0,90 × 0,90 = 0,81", "0,81", 0.9 * 0.9, 0);
  krav(g.text, "19,0 procent", "19,0", (180 - 145.8) / 180 * 100, 0.051);
  krav(g.text, "12,00 → 11,50 → 11,00 → 10,50", "10,50", 12 - 0.5 * 3, 0);
  krav(g.text, "tjugo procent över den justerade väntan 9,00", "9,00", 10.8 / 1.2, 0.051);
  krav(g.text, "P/E 21 mot sektorns 15", "21", 21, 0);
  krav(g.text, "ett per 30,7 dagar", "30,7", 92 / 3, 0.051);
  kravP(g.text, "sju gånger"); // närvaro: 30,7 ÷ 4 ≈ 7,7 ⇒ «drygt sju» (kursens egen ordning)

  // BOSTADSMEKANIKEN (ma-08 + mk-12)
  krav(b, "60 000 kronor", "60 000", 3e6 * 0.02, 0);
  krav(b, "150 000", "150 000", 3e6 * 0.05, 0);
  krav(b, "90 000 kronor per år", "90 000", 3e6 * (0.05 - 0.02), 0);
  krav(b, "7 500", "7 500", 90000 / 12, 0);
  krav(b, "11,25 procent", "11,25", 90000 / 800000 * 100, 0);
  krav(b, "144 000 ÷ 0,040 = 3 600 000", "3 600 000", 144000 / 0.04, 0);
  krav(b, "144 000 ÷ 0,020 = 7 200 000", "7 200 000", 144000 / 0.02, 0);
  krav(b, "7 200 000 ÷ 3 600 000 = 2,0", "2,0", 7.2e6 / 3.6e6, 0);
  krav(b, "4 000 000 × 0,85 = 3 400 000", "3 400 000", 4e6 * 0.85, 0);
  krav(b, "3 600 000 ÷ 800 000 = 4,5", "4,5", 3.6e6 / 8e5, 0);
  krav(b, "72 000 plus ränta 144 000 = 216 000", "216 000", 3.6e6 * 0.02 + 3.6e6 * 0.04, 0);
  krav(b, "27,0 procent", "27,0", 216000 / 800000 * 100, 0.051);
  krav(b, "10 000 ÷ 20 000", "10 000", 10000, 0);
  krav(b, "12 000 × 0,60 = 7 200", "7 200", 12000 * 0.6, 0);
  krav(b, "144 miljoner per år vid 2,0 procent", "144", 7200 * 0.02, 0);
  krav(b, "4 800 till 3 000", "3 000", 12000 * 0.85 - 7200, 0);
  krav(b, "37,5 procent", "37,5", 1800 / 4800 * 100, 0.051);
  krav(b, "37,5 ÷ 15 = 2,5", "2,5", 37.5 / 15, 0);
  krav(b, "(6,0 + 2,4) ÷ 10,0 = 0,84", "0,84", (6 + 2.4) / 10, 0.001);
  krav(b, "(5,0 + 4,0) ÷ 9,0 = 1,00", "1,00", (5 + 4) / 9, 0.001);
  krav(b, "41,7", "41,7", 100 / 2.4, 0.051);
  krav(b, "25,0", "25,0", 100 / 4, 0);

  kontroll("D03 aritmetik — kurstal oberoende omräknade", fel.length === 0,
    fel.length ? fel.join(" | ") : "36 poster omräknade (aktivist 13 · guidning 9 · bostad 14)");
}

// ── FALL E: genomströmning — gränsfrågor lämnas till ägarna ────────────────
{
  const GRÄNSER = [
    "vad är en katalysator?",       // bas
    "vad är en tillverkad katalysator?", // bas (naked katalysator)
    "vad är substansvärde?",        // nästa
    "vad är en bolagsstämma?",      // ägande
    "vad är räntan?",               // makro
    "vad är inflation?",            // makro
    "vad är förväntningsanalys?",   // förväntningsdjup
    "vad är combined ratio?",       // u1 försäkring (deras familj)
    "vad är float?",                // u1 försäkring
    "vad är prisfullmakten?",       // u2 moatdjup
    "vad är byteskostnader?",       // u2 moatdjup
  ];
  const fel = [];
  for (const f of GRÄNSER) {
    if (svaraLokaltNyaTerritorier(f, KURSREGISTER) !== null) fel.push("'" + f + "' fångas av DETTA lager (ägarens territorium)");
  }
  kontroll("E genomströmning — gränsfrågor → null hos detta lager", fel.length === 0,
    fel.length ? fel.join(" | ") : GRÄNSER.length + " gränser respekterade");
}

// ── FALL F: juridikgrinden (lagen 2007:528) ─────────────────────────────────
{
  // RådFRASER — inte blotta verb: texten får gärna säga «aldrig ett köpskäl»
  // och «inga uppmaningar att köpa eller sälja» (anti-råd-formuleringar);
  // grinden vaktar faktiska uppmaningar/rekommendationer.
  const RADCITAT = /(rekommenderar att (köpa|sälja)|vi rekommenderar|borde du (köpa|sälja)|bör du (köpa|sälja)|köp (denna|aktien|nu)|sälj (denna|aktien|nu)|detta är värt att (köpa|äga)|tips: (köp|sälj)|råd att (köpa|sälja)|köpsignal|säljsignal|det är dags att (köpa|sälja))/i;
  const fel = [];
  for (const monster of NYA_TERRITORIER_MONSTER) {
    const svar = monster.bygga(KURSREGISTER);
    if (RADCITAT.test(svar.text)) fel.push(monster.id + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) fel.push(monster.id + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser i de nya svaren", fel.length === 0,
    fel.length ? fel.join(" | ") : "ren utbildningsformulering (rabatten: «en post att räkna, aldrig ett köpskäl»)");
}

// ── FALL G: antistöld — tidigare kanoniska oförändrade (lager-invarianten) ──
const GAMLA = [
  "vad är AKM1?",
  "vad är rsi?",
  "vad är macd?",
  "vad är utdelning?",
  "vad är substansvärde?",
  "vad är en bolagsstämma?",
  "vad är räntan?",
  "vad är inflation och KPI?",
  "vad är väntan på rapport?",
  "hur analyserar jag en bank?",
  "vad är en katalysator?",
  "vad är förväntningsanalys?",
  "hur påverkar bostadsmarknaden börsen?",
  "vad är realekonomin?",
  "vad är motiverat värde?",
  "hur analyserar jag ett energibolag?",
  "hur analyserar jag ett telekombolag?",
  "vad är konvertibler?",
  "vad är volatilitetsbudgeten?",
  "vad är faktorpremierna?",
  "vad är redovisningsdetektiven?",
  "vad är combined ratio?",
  "vad är float?",
  "vad är krypto?",
  "vad är bitcoin?",
  "vad är prisfullmakten?",
  "vad är byteskostnader?",
  "vad är konjunkturindikatorer?",
];
{
  const fel = [];
  for (const f of GAMLA) {
    const med = kora(MED, f);
    const utan = kora(UTAN, f);
    if (JSON.stringify(med) !== JSON.stringify(utan)) {
      fel.push("'" + f + "' ändrad av nyaterritorier-lagret (med=" + (med ? med.amne : "null") + ", utan=" + (utan ? utan.amne : "null") + ")");
    }
  }
  kontroll("G01 antistöld — " + GAMLA.length + " tidigare kanoniska oförändrade med/utan detta lager", fel.length === 0,
    fel.length ? fel.join(" | ") : GAMLA.length + "/" + GAMLA.length + " bitidentiska");
}

// ── FALL G2: ALLA andra lagers kärnord LIVE som frågor → 0 fångster ────────
{
  let ord = 0;
  const fel = [];
  for (const l of LAGER) {
    if (l.fil === MIN_FIL) continue;
    for (const monster of l.monster) {
      for (const k of monster.karnord ?? []) {
        ord++;
        const fraga = "vad är " + k + "?";
        const s = svaraLokaltNyaTerritorier(fraga, KURSREGISTER);
        if (s) fel.push("'" + k + "' (" + l.namn + ") ⇒ " + s.amne);
      }
    }
  }
  kontroll("G2 syskonkärnord — " + ord + " kärnord LIVE som frågor → 0 fångster", fel.length === 0,
    fel.length ? fel.slice(0, 8).join(" | ") : "0 av " + ord);
}

// ── FALL H: kedjan — lager-invarianten + nya når rätt lager ────────────────
{
  const fel = [];
  for (const f of NYA) {
    const med = kora(MED, f.fraga.toLowerCase());
    if (!med || med.amne !== f.amne) fel.push("NY '" + f.fraga + "' ⇒ " + (med ? med.amne : "null") + " (väntat " + f.amne + ")");
  }
  // Gamla förblir oförändrade (samma invariant som G01, här via MED/UTAN).
  for (const f of GAMLA) {
    if (JSON.stringify(kora(MED, f)) !== JSON.stringify(kora(UTAN, f))) fel.push("'" + f + "' ändrad");
  }
  kontroll("H01 kedja — " + LAGER.length + " lager: " + NYA.length + " nya når rätt lager + " + GAMLA.length + " gamla oförändrade",
    fel.length === 0, fel.length ? fel.join(" | ") : "invarianten håller (" + LAGER.length + " lager, som chat-widget.tsx)");
}

// ── FALL I: omkastad — nya kanoniska → null i kedjan UTAN detta lager ──────
{
  const fel = [];
  for (const f of NYA) {
    const utan = kora(UTAN, f.fraga.toLowerCase());
    if (utan) fel.push("'" + f.fraga + "' fångas av '" + utan.amne + "' även utan detta lager — skugga, ej ny mark");
  }
  kontroll("I omkastad — " + NYA.length + " nya kanoniska → null i kedjan utan detta lager", fel.length === 0,
    fel.length ? fel.join(" | ") : "äkta nya territorier (sondens rond 1 bevisat, nu mekaniskt)");
}

// ── FALL J: kärnordsdisjunktion — mekaniskt, tavstånd inom tolerans ────────
{
  function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
  function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
  function tav(a, b) {
    if (a === b) return 0; const n = a.length, m = b.length;
    if (!n) return m; if (!m) return n;
    let fore = Array.from({ length: m + 1 }, (_, j) => j); const nu = new Array(m + 1);
    for (let i = 1; i <= n; i++) { nu[0] = i; for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1)); fore = [...nu]; }
    return fore[m];
  }
  const mina = new Set();
  for (const monster of NYA_TERRITORIER_MONSTER) for (const k of monster.karnord) mina.add(diafri(k));
  const fel = [];
  let jamkorda = 0;
  for (const l of LAGER) {
    if (l.fil === MIN_FIL) continue;
    for (const monster of l.monster) {
      for (const k of monster.karnord ?? []) {
        const b = diafri(k);
        jamkorda++;
        if (mina.has(b)) { fel.push("exakt: '" + k + "' (" + l.namn + ")"); continue; }
        if (b.includes(" ")) continue;
        for (const m of mina) {
          if (m.includes(" ")) continue;
          const d = tav(m, b);
          const maxM = m.length <= 3 ? 0 : m.length <= 7 ? 1 : 2;
          const maxB = b.length <= 3 ? 0 : b.length <= 7 ? 1 : 2;
          if (d <= Math.min(maxM, maxB)) fel.push("tav " + d + ": '" + m + "' ↔ '" + b + "' (" + l.namn + ")");
        }
      }
    }
  }
  kontroll("J kärnordsdisjunktion — NYA_TERRITORIER_MONSTER vs " + (LAGER.length - 1) + " andra lager (" + jamkorda + " kärnord)", fel.length === 0,
    fel.length ? fel.join(" | ") : "0 överlapp (min-tolerans, strängare än motorns)");
}

// ── FALL L: WIDGET-SYNK — kedjeraden bär alla lager i ordning ───────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const KOMPONENTER = LAGER.map((l) => "svaraLokalt" + l.fnk.name.replace(/^svaraLokalt/, ""));
  const kedjerader = widget.split("\n").filter((rad) => rad.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const FEL = [];
  if (kedjerader.length !== 1) FEL.push("hittade " + kedjerader.length + " kedjerader (väntat exakt 1)");
  const rad = kedjerader[0] ?? "";
  let senaste = -1;
  for (const komp of KOMPONENTER) {
    const pos = rad.indexOf(komp + "(");
    if (pos === -1) FEL.push(komp + " saknas i kedjeraden");
    else if (pos < senaste) FEL.push(komp + " i fel ordning i kedjeraden");
    else senaste = pos;
  }
  if (!widget.includes('from "@/lib/ai-mentor-nya-territorier-fragor"')) {
    FEL.push("importen av ai-mentor-nya-territorier-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
    // Fönster 29 (s6-u1, _s6u1o29-): kemisektor i widgetordning (efter lonsamhetsgrund,
  // före marknadsrytm) — svitharmoniseringens dokumentationsplikt (V219-läxan).
  const kanda = new Set([...KOMPONENTER, "svaraLokaltKemisektor"]);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär samtliga " + KOMPONENTER.length + " lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "nyaterritorier lager " + KOMPONENTER.length + " (efter moatdjup), inga okända komponenter",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN NYA TERRITORIER (s6-u3 omgång 24): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("Nya förhandsfrågor: 3 (aktivisten · guidningen · bostadsmekaniken/demografin) · Register: " + KURSREGISTER.length + " kurser");
process.exit(fail > 0 ? 1 : 0);
