/**
 * TESTA AI-MENTORN — NOTLÄSNING (s6-u2, fönster 33, manifest
 * auto-s6-1789999525797: skuggskulderna [st-07 primär + km-004 + st-04 +
 * st-06 + bk-06 + se-22 KÄLLAKTIVERING ⇒ STABILITET fullt mentorlänkad] +
 * intäktredovisningen [bk-08 primär + bk-02 + bk-05 + bk-06 + km-004 ⇒
 * BOKFÖRING & ÅRSREDOVISNING fullt mentorlänkad]).
 *
 * Kör:  node verktyg/testa-ai-mentor-notlasning.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets två förhandsfrågor (se
 * src/lib/ai-mentor-notlasning-fragor.ts) med bevakning:
 *   A   8 kanoniska ingångar (fyra per monster) → rätt ämne, primärkälla,
 *       FLERKÄLLA (källor ≥ 5 + numrerad Källor-rad) och ≥ 4 kurslänkar
 *   A2  MOTORDEFS-position LIVE (efter banksektorn, FÖRE marknadsrytm —
 *       deras SIST-deklaration) + antal-vakten (2 monsters)
 *   B   10 felstavade/varierade varianter → samma träff
 *   C   determinism — frågor två gånger ⇒ bitidentiskt svar
 *   D01–D24 aritmetik maskinellt omräknad (kursernas egna modelltal):
 *       45+15+42 = 102 · 180+102 = 282 · 180/300 = 60 % · 282/300 = 94 %
 *       · (180+102)/120 = 2,35 mot 180/120 = 1,50 · 102/120 = 0,85 ·
 *       102/480 = 0,21 · 12−9 = 3,0 (25 %) · 9×1,20 = 10,8 ⇒ 1,2 (10 %)
 *       · 15,0−6,0 = 9,0 · 12−13 = −1,0 · 200×0,70−120 = 20 ·
 *       25/100 = 0,25 · 110/90 = 1,22 · 15/120 = 0,13 ·
 *       600+300+100 = 1 000 · 540/270/90 (summa 900) · 900+60 = 960 ·
 *       270+60 = 330 · 0,40×270 = 108 · 90×6/24 = 22,5 ·
 *       540+108+22,5 = 670,5 · 270−108 = 162 · 90−22,5 = 67,5 ·
 *       162+67,5 = 229,5 · 690−670,5 = 19,5 · 670,5−640 = 30,5
 *   D25 registerdrivna tal (STABILITET/BOKFÖRING & ÅRSREDOVISNING LIVE)
 *   D26 KATEGORISTÄNGNING LIVE — 0 mentorväglösa i båda kategorierna
 *       efter detta lager (sluggen finns i någons frågemodul)
 *   D27 nivåmarkörer (st-07 Intermediär · bk-08 Intermediär) +
 *       D28 fantomslug (samtliga källor + kurslänkar finns i registret)
 *   F   ägargränser genom HELA kedjan: «leasing» → redovisningsdjupet ·
 *       «avsättning» → balansdjupet · «lagervärdering» → balansdjupet ·
 *       «soliditet» → stabilitetsdjupet · «kreditförlusten» → EJ detta
 *       lager (u1:s banksektor-familj) · «balansräkningen» → EJ detta lager
 *   F2  juridikgrind — pedagogiskt, aldrig råd
 *   G   ANTISTÖLD — grannlagers kanoniska (banksektorn, budprocessen,
 *       eva, försäkringsskrivandet, kemisektorn, stålsektorn, leasing,
 *       avsättning, lagervärdering, soliditet, balansräkningen +
 *       u3:s territorier: avknoppningen, kreditderivatet,
 *       kompetensillusionen) → NULL från detta lager
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS) + H2 med detta
 *       lager svarar notlasning
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER banksektorn och FÖRE marknadsrytm
 *       (deras SIST-deklaration) i chat-widget.tsx:s kedja
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Testfall F2 vaktar att svaret är pedagogiskt — aldrig rekommendation.
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readdirSync, readFileSync } from "node:fs";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-notlasning.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltNotlasning, NOTLASNING_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-notlasning-fragor.ts")).href
);

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
function approx(a, b, tolerans = 0.005) {
  return Math.abs(a - b) <= tolerans;
}

// ── FALL A: åtta kanoniska ingångar, två monster, flerkällskrav ─────────────
const NYA = [
  { fraga: "Vad är skuggskulder?", amne: "skuggskulderna", slug: "st-07-skuggskulderna" },
  { fraga: "Vad är ett borgensåtagande?", amne: "skuggskulderna", slug: "st-07-skuggskulderna" },
  { fraga: "Hur läser man förbindelsenoten?", amne: "skuggskulderna", slug: "st-07-skuggskulderna" },
  { fraga: "Vad är förbindelsekvoten?", amne: "skuggskulderna", slug: "st-07-skuggskulderna" },
  { fraga: "Vad är intäktsredovisning?", amne: "intaktsredovisningen", slug: "bk-08-intaktredovisningen" },
  { fraga: "Vad är en prestationsplikt?", amne: "intaktsredovisningen", slug: "bk-08-intaktredovisningen" },
  { fraga: "Vad är en avtalsskuld?", amne: "intaktsredovisningen", slug: "bk-08-intaktredovisningen" },
  { fraga: "Hur fungerar IFRS 15?", amne: "intaktsredovisningen", slug: "bk-08-intaktredovisningen" },
];
{
  for (const f of NYA) {
    const s = svaraLokaltNotlasning(f.fraga, KURSREGISTER);
    const ok =
      s !== null &&
      s.amne === f.amne &&
      s.kalla?.slug === f.slug &&
      (s.kallor?.length ?? 0) >= 5 &&
      s.text.includes("📖 Källor (") &&
      s.handlings.filter((h) => h.lank.startsWith("/kurser/")).length >= 4;
    kontroll(
      'A: "' + f.fraga + '" → ' + f.amne,
      ok,
      s ? "källor " + (s.kallor?.length ?? 0) + " · kurslänkar " + s.handlings.filter((h) => h.lank.startsWith("/kurser/")).length : "NULL",
    );
  }
}

// ── FALL A2: MOTORDEFS-position LIVE + antal-vakt ───────────────────────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const min = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-notlasning-fragor.ts");
  const ix = MOTORDEFS.findIndex((d) => d.namn === "banksektorn");
  const ixRytm = MOTORDEFS.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2: MOTORDEFS — notlasning " + (min + 1) + "/" + MOTORDEFS.length + ", efter banksektorn, FÖRE marknadsrytm (SIST)",
    min >= 0 && ix >= 0 && ixRytm >= 0 && ix < min && min < ixRytm,
    MOTORDEFS[min] ? "antal " + MOTORDEFS[min].antal + " · motorer " + MOTORDEFS.length : "rad SAKNAS",
  );
  kontroll(
    "A2b: antal-vakt — MOTORDEFS.antal 2 = modulens " + NOTLASNING_MONSTER.length + " monsters",
    min >= 0 && MOTORDEFS[min].antal === 2 && NOTLASNING_MONSTER.length === 2,
    "monster-id:n " + NOTLASNING_MONSTER.map((m) => m.id).join(", "),
  );
}

// ── FALL B: felstavningar och varianter → samma träff ───────────────────────
{
  const VARIANTER = [
    { fraga: "vad är skugskulder?", amne: "skuggskulderna" },
    { fraga: "vad ar borgensatagandet?", amne: "skuggskulderna" },
    { fraga: "förbindelsenoten?", amne: "skuggskulderna" },
    { fraga: "vad är en beställningsstock?", amne: "skuggskulderna" },
    { fraga: "vad betyder förbindelsekvoten?", amne: "skuggskulderna" },
    { fraga: "vad är intaksredovisning?", amne: "intaktsredovisningen" },
    { fraga: "prestationsplikta?", amne: "intaktsredovisningen" },
    { fraga: "vad är avtalsskulden?", amne: "intaktsredovisningen" },
    { fraga: "vad är fullbordandegraden?", amne: "intaktsredovisningen" },
    { fraga: "vad är backlog?", amne: "intaktsredovisningen" },
  ];
  for (const v of VARIANTER) {
    const s = svaraLokaltNotlasning(v.fraga, KURSREGISTER);
    kontroll(
      'B: "' + v.fraga + '" → ' + v.amne,
      s !== null && s.amne === v.amne,
      s ? "ämne " + s.amne : "NULL",
    );
  }
}

// ── FALL C: determinism — samma fråga två gånger ⇒ bitidentiskt ─────────────
{
  for (const f of [NYA[0], NYA[4]]) {
    const a = svaraLokaltNotlasning(f.fraga, KURSREGISTER);
    const b = svaraLokaltNotlasning(f.fraga, KURSREGISTER);
    kontroll(
      'C: determinism "' + f.fraga + '"',
      a !== null && b !== null && a.text === b.text && a.kallor?.length === b.kallor?.length,
      a?.text === b?.text ? "bitidentiskt" : "AVVIKER",
    );
  }
}

// ── FALL D01–D24: aritmetiken omräknad maskinellt ────────────────────────────
{
  const S = svaraLokaltNotlasning("Vad är skuggskulder?", KURSREGISTER);
  const I = svaraLokaltNotlasning("Vad är intäktsredovisning?", KURSREGISTER);
  const t = (s) => s?.text ?? "";

  // Skuggskulden (st-07)
  kontroll("D01: bruttoskugga 45+15+42 = 102", approx(45 + 15 + 42, 102, 0) && t(S).includes("102"), "102 i text: " + t(S).includes("102"));
  kontroll("D02: justerad skuld 180+102 = 282", approx(180 + 102, 282, 0) && t(S).includes("282"), "282 i text: " + t(S).includes("282"));
  kontroll("D03: skuldandel 180/300 = 60 %", approx(180 / 300, 0.60) && t(S).includes("60 procent"), "");
  kontroll("D04: justerad andel 282/300 = 94 %", approx(282 / 300, 0.94) && t(S).includes("94 procent"), "");
  kontroll("D05: skuldsättningsgrad 180/120 = 1,50", approx(180 / 120, 1.50) && t(S).includes("1,50"), "");
  kontroll("D06: justerad (180+102)/120 = 2,35", approx((180 + 102) / 120, 2.35) && t(S).includes("2,35"), "");
  kontroll("D07: förbindelsekvot 102/120 = 0,85", approx(102 / 120, 0.85) && t(S).includes("0,85"), "");
  kontroll("D08: förbindelseandel 102/480 = 0,21", approx(102 / 480, 0.2125, 0.0005) && t(S).includes("0,21"), "");
  kontroll("D09: täckning 12−9 = 3,0 = 25 %", approx(12 - 9, 3.0) && t(S).includes("25 procent"), "");
  kontroll("D10: stegring 9×1,20 = 10,8 ⇒ 1,2 = 10 %", approx(9 * 1.2, 10.8) && t(S).includes("10,8") && t(S).includes("1,2"), "");
  kontroll("D11: stocktapp 15,0−6,0 = 9,0", approx(15.0 - 6.0, 9.0) && t(S).includes("9,0"), "");
  kontroll("D12: förlustkontrakt 12−13 = −1,0", approx(12 - 13, -1.0) && t(S).includes("−1,0"), "");
  kontroll("D13: panttak 200×0,70−120 = 20", approx(200 * 0.7 - 120, 20) && t(S).includes("20 miljoner"), "");
  kontroll("D14: tre bolag 0,25 · 1,22 · 0,13", approx(25 / 100, 0.25) && approx(110 / 90, 1.2222, 0.0005) && approx(15 / 120, 0.125) && t(S).includes("0,25") && t(S).includes("1,22") && t(S).includes("0,13"), "");

  // Intäktredovisningen (bk-08)
  kontroll("D15: fristående 600+300+100 = 1 000", approx(600 + 300 + 100, 1000, 0) && t(I).includes("1 000"), "");
  kontroll("D16: allokering 540+270+90 = 900", approx(900 * 0.6, 540) && approx(900 * 0.3, 270) && approx(900 * 0.1, 90) && t(I).includes("540") && t(I).includes("270") && t(I).includes("90"), "");
  kontroll("D17: bonus 900+60 = 960 · 270+60 = 330", approx(900 + 60, 960) && approx(270 + 60, 330) && t(I).includes("960") && t(I).includes("330"), "");
  kontroll("D18: fullbordande 400/1 000 = 40 % ⇒ 108", approx(400 / 1000, 0.4) && approx(0.4 * 270, 108) && t(I).includes("108"), "");
  kontroll("D19: support 90×6/24 = 22,5", approx(90 * 6 / 24, 22.5) && t(I).includes("22,5"), "");
  kontroll("D20: år 1 = 540+108+22,5 = 670,5", approx(540 + 108 + 22.5, 670.5) && t(I).includes("670,5"), "");
  kontroll("D21: backlog 162+67,5 = 229,5", approx(270 - 108, 162) && approx(90 - 22.5, 67.5) && approx(162 + 67.5, 229.5) && t(I).includes("229,5"), "");
  kontroll("D22: avtalsskuld 690−670,5 = 19,5", approx(690 - 670.5, 19.5) && t(I).includes("19,5"), "");
  kontroll("D23: avtalstillgång 670,5−640 = 30,5", approx(670.5 - 640, 30.5) && t(I).includes("30,5"), "");
  kontroll("D24: huvudagent säljare 100 / marknadsplats 20", t(I).includes("redovisar intäkt 20") && t(I).includes("redovisar 100"), "");
}

// ── FALL D25: registerdrivna tal LIVE ────────────────────────────────────────
{
  const stAntal = KURSREGISTER.filter((r) => r.kategori === "STABILITET").length;
  const bkAntal = KURSREGISTER.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
  const S = svaraLokaltNotlasning("Vad är skuggskulder?", KURSREGISTER);
  const I = svaraLokaltNotlasning("Vad är intäktsredovisning?", KURSREGISTER);
  kontroll(
    "D25: kategoriräknare LIVE — STABILITET " + stAntal + " · BOKFÖRING " + bkAntal,
    S?.text.includes("I kategorin stabilitet finns " + stAntal + " kurser") &&
      I?.text.includes("I kategorin bokföring och årsredovisning finns " + bkAntal + " kurser"),
    "siffrorna ur KURSREGISTER vid svarstid",
  );
}

// ── FALL D26: KATEGORISTÄNGNING LIVE — 0 mentorväglösa i båda kategorierna ──
{
  const libFiler = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));
  libFiler.push("ai-mentor-svar.ts");
  let allt = "";
  for (const f of libFiler) allt += readFileSync(join(ROT, "src/lib", f), "utf8");
  const mentorlosa = KURSREGISTER.filter(
    (r) => (r.kategori === "STABILITET" || r.kategori === "BOKFÖRING & ÅRSREDOVISNING") &&
      !allt.includes('"' + r.slug + '"'),
  );
  kontroll(
    "D26: STABILITET + BOKFÖRING & ÅRSREDOVISNING fullt mentorlänkade",
    mentorlosa.length === 0,
    mentorlosa.length ? "lösa: " + mentorlosa.map((r) => r.slug).join(", ") : "0 mentorväglösa i båda",
  );
  kontroll(
    "D26b: källaktivering se-22 (första mentorlänken)",
    allt.includes('"se-22-byggentreprenaden"'),
    "se-22 i frågemodulerna",
  );
}

// ── FALL D27+D28: nivåmarkörer + fantomslug ─────────────────────────────────
{
  const S = svaraLokaltNotlasning("Vad är skuggskulder?", KURSREGISTER);
  const I = svaraLokaltNotlasning("Vad är intäktsredovisning?", KURSREGISTER);
  kontroll(
    "D27: nivåmarkörer — st-07 intermediär · bk-08 intermediär",
    S?.text.includes("intermediär nivå") && I?.text.includes("intermediär nivå"),
    "nivåerna LIVE ur registret",
  );
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  const alla = [S, I].flatMap((s) => [
    ...(s?.kallor ?? []).map((k) => k.slug),
    ...(s?.handlings ?? []).filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", "")),
  ]);
  const fantom = alla.filter((slug) => slug && !slugs.has(slug));
  kontroll(
    "D28: fantomslug — samtliga källor + kurslänkar i registret (" + alla.length + " st)",
    fantom.length === 0,
    fantom.length ? "FANTOM: " + fantom.join(", ") : "0 fantom",
  );
}

// ── FALL F: ägargränser genom HELA kedjan ───────────────────────────────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));
  const MOTORER = [];
  for (const d of MOTORDEFS) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  const GRANSER = [
    { fraga: "vad är leasing?", ej: "notlasning" },
    { fraga: "vad är en avsättning?", ej: "notlasning" },
    { fraga: "vad är lagervärdering?", ej: "notlasning" },
    { fraga: "vad är soliditet?", ej: "notlasning" },
    { fraga: "vad är kreditförlusten?", ej: "notlasning" },
    { fraga: "vad är en balansräkning?", ej: "notlasning" },
  ];
  for (const g of GRANSER) {
    const agare = (() => {
      for (const m of MOTORER) {
        if (m.fnk(g.fraga, KURSREGISTER) !== null) return m.namn;
      }
      return null;
    })();
    kontroll(
      'F: "' + g.fraga + '" ägs EJ av notlasning',
      agare !== "notlasning",
      agare ? "ägare: " + agare : "NULL (ingen motor)",
    );
  }
}

// ── FALL F2: juridikgrind — pedagogiskt, aldrig råd ─────────────────────────
{
  const S = svaraLokaltNotlasning("Vad är skuggskulder?", KURSREGISTER);
  const I = svaraLokaltNotlasning("Vad är intäktsredovisning?", KURSREGISTER);
  for (const [namn, s] of [["skuggskulderna", S], ["intäktsredovisningen", I]]) {
    const pedagogisk = s?.text.includes("utbildning") && s?.text.includes("inga placeringstips");
    const ejRad =
      !/köp (denna |den här |aktien)/i.test(s?.text ?? "") &&
      !/sälj (denna |den här |aktien)/i.test(s?.text ?? "") &&
      !/vi rekommenderar (köp|sälj)/i.test(s?.text ?? "");
    kontroll(
      "F2: juridikgrind — " + namn + " pedagogisk utan råd",
      Boolean(pedagogisk && ejRad),
      pedagogisk ? "utbildningsmarkör + inga rådmönster" : "markör saknas",
    );
  }
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska lämnas ifred ──────────────────
{
  const GRANNAR = [
    "vad är banksektorn?",
    "vad är nätlånet?",
    "vad är budpremien?",
    "hur fungerar en budprocess?",
    "vad är eva?",
    "vad är försäkringsskrivandet?",
    "vad är kemisektorn?",
    "vad är stålsektorn?",
    "vad är leasing?",
    "vad är en avsättning?",
    "vad är lagervärdering?",
    "vad är soliditet?",
    "vad är en balansräkning?",
    // u3:s territorier (fönster 33) — deras anspråk respekteras
    "vad är en avknoppning?",
    "vad är kreditderivatet?",
    "vad är kompetensillusionen?",
  ];
  let stulna = [];
  for (const g of GRANNAR) {
    if (svaraLokaltNotlasning(g, KURSREGISTER) !== null) stulna.push(g);
  }
  kontroll(
    "G: ANTISTÖLD — " + GRANNAR.length + " grannkanonika → NULL",
    stulna.length === 0,
    stulna.length ? "STJÄLER: " + stulna.join(", ") : "alla NULL",
  );
}

// ── FALL H: ägar-invariant — NULL genom kedjan UTAN detta lager ─────────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
  const UTAN = MOTORDEFS.filter((d) => d.fil !== "ai-mentor-notlasning-fragor.ts");
  const MOTORER = [];
  for (const d of UTAN) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  let skuggade = [];
  for (const f of NYA) {
    const s = MOTORER.find((m) => m.fnk(f.fraga, KURSREGISTER) !== null);
    if (s) skuggade.push(f.fraga + " → " + s.namn);
  }
  kontroll(
    "H: kanoniska NULL genom hela kedjan utan detta lager (" + UTAN.length + " motorer)",
    skuggade.length === 0,
    skuggade.length ? "SKUGGAD: " + skuggade.join(" · ") : "ända ägaren är notlasning",
  );
  // H2: med detta lager — kedjan (i MOTORDEFS-ordning) svarar notlasning
  const MED = MOTORDEFS;
  const MOTORER2 = [];
  for (const d of MED) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER2.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  for (const f of [NYA[0], NYA[4]]) {
    const k = (() => {
      for (const m of MOTORER2) {
        const s = m.fnk(f.fraga, KURSREGISTER);
        if (s) return { motor: m.namn, amne: s.amne };
      }
      return null;
    })();
    kontroll(
      'H2: med detta lager svarar kedjan notlasning ("' + f.fraga + '")',
      k !== null && k.motor === "notlasning" && k.amne === f.amne,
      k ? "motor=" + k.motor + " · ämne=" + k.amne : "NULL",
    );
  }
}

// ── FALL J: kärnordsdisjunktion LIVE (mot samtliga övriga lager) ────────────
{
  function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
  function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
  function tav(a, b) {
    if (a === b) return 0;
    const n = a.length, m = b.length;
    if (n === 0) return m; if (m === 0) return n;
    let fore = Array.from({ length: m + 1 }, (_, j) => j);
    const nu = new Array(m + 1);
    for (let i = 1; i <= n; i++) {
      nu[0] = i;
      for (let j = 1; j <= m; j++) {
        const kostnad = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kostnad);
      }
      fore = [...nu];
    }
    return fore[m];
  }
  function kolliderar(a, b) {
    if (a === b) return true;
    if (a.includes(" ") || b.includes(" ")) return a.includes(b) || b.includes(a);
    const max = Math.max(a.length, b.length) <= 7 ? 1 : 2;
    return tav(a, b) <= max;
  }

  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-notlasning-fragor.ts",
  );
  const andras = [];
  for (const f of filer) {
    const kalla = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const block of kalla.matchAll(/karnord:\s*\[([^\]]*)\]/g)) {
      for (const ord of block[1].matchAll(/"([^"]+)"/g)) andras.push({ fil: f, karnord: diafri(ord[1]) });
    }
  }
  const mina = NOTLASNING_MONSTER.flatMap((m) => m.karnord.map(diafri));
  const kollisioner = [];
  for (const mk of mina) {
    for (const { fil, karnord } of andras) {
      if (kolliderar(mk, karnord)) kollisioner.push(mk + " ↔ " + karnord + " (" + fil.replace("ai-mentor-", "").replace("-fragor.ts", "") + ")");
    }
  }
  kontroll(
    "J: kärnordsdisjunktion LIVE — " + mina.length + " kärnord mot " + andras.length + " i " + filer.length + " lager",
    kollisioner.length === 0,
    kollisioner.length ? "KOLLISION: " + kollisioner.slice(0, 5).join(" · ") : "0 kollisioner",
  );
}

// ── FALL L: widget-synk — import + kedjeposition ────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importOk = widget.includes('import { svaraLokaltNotlasning } from "@/lib/ai-mentor-notlasning-fragor"');
  const rad = widget.match(/const lokalt = ([^;]+);/);
  const ordning = rad ? [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]) : [];
  const ix = ordning.indexOf("svaraLokaltNotlasning");
  const ixBank = ordning.indexOf("svaraLokaltBanksektorn");
  const ixRytm = ordning.indexOf("svaraLokaltMarknadsrytm");
  kontroll(
    "L: widget-synk — import + EFTER banksektorn, FÖRE marknadsrytm (deras SIST)",
    importOk && ix >= 0 && ixBank >= 0 && ixRytm >= 0 && ixBank < ix && ix < ixRytm,
    importOk ? "kedjan bär lager " + (ix + 1) + "/" + ordning.length : "import SAKNAS",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("\nNOTLÄSNING (s6-u2 fönster 33): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
