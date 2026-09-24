/**
 * TESTA AI-MENTORN — SKULDORDNING (s6-u2, omgång 34, manifest
 * auto-s6-1790029519192: senioritetsordningen [ks-09 primär + ks-03 + ks-05
 * + ks-06 + rk-03 + st-07 ⇒ KAPITALSTRUKTUR fullt mentorlänkad 9/9] +
 * valutasäkringen i rapporten [ks-08 primär + od-07 + od-11 + ma-07 + km-058
 * + rk-07 — RACE mot u1 öppet bokförd: od-11 deras primär, här endast
 * källa]).
 *
 * Kör:  node verktyg/testa-ai-mentor-skuldordning.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets två förhandsfrågor (se
 * src/lib/ai-mentor-skuldordning-fragor.ts) med bevakning:
 *   A   8 kanoniska ingångar (fyra per monster) → rätt ämne, primärkälla,
 *       FLERKÄLLA (källor ≥ 5 + numrerad Källor-rad) och ≥ 4 kurslänkar
 *   A2  MOTORDEFS-position LIVE (efter ränteswapen, FÖRE marknadsrytm —
 *       deras SIST-deklaration) + antal-vakten (2 monsters)
 *   B   10 felstavade/varierade varianter → samma träff
 *   C   determinism — frågor två gånger ⇒ bitidentiskt svar
 *   D01–D24 aritmetik maskinellt omräknad (kursernas egna modelltal,
 *       NorrVerk Maskiner + Norrsken Verktyg AB, alla påhittade):
 *       420×0,61 = 256,2 · 380×0,35 = 133,0 · 389,2 (48,7 %) · 377,2 ·
 *       123,8 · 79,0 · 79,0/381,8 = 20,7 % · 123,8×0,207 = 25,6 ·
 *       281,8/380 = 74,2 % · 150×0,207 = 31,0 · klyfta 53,5 pp ·
 *       kontroll 256,2+42+79,0 = 377,2 · LGD 0,793 · 0,045×0,793 = 3,6 ·
 *       rekonstruktion 25+15 = 40 · stress 214,2 · övningar 210/40 ·
 *       60/150 = 40,0 % · 0,060×0,650 = 3,9 · 11,50×1,040/1,025 = 11,67 ·
 *       40/1,025 = 39,0 · 448,8 · 466,7/466,8 · 14,0 · 11,39 · +6,8/−4,8 ·
 *       31/40 = 78 % · 280+20 = 300 · 50−40 = 10
 *   D25 registerdrivna tal (KAPITALSTRUKTUR LIVE)
 *   D26 KATEGORISTÄNGNING LIVE — 0 mentorväglösa i KAPITALSTRUKTUR efter
 *       detta lager (sluggen finns i frågemodulen)
 *   D27 nivåmarkörer (ks-09 Intermediär · ks-08 Intermediär) +
 *   D28 fantomslug (samtliga källor + kurslänkar finns i registret)
 *   F   ägargränser genom HELA kedjan: «valutasäkring» → valutamekaniken
 *       (deras hedging-monster — översiktsord) · «konkursprognos» →
 *       överlevnadsdjupet · «terminer» → EJ detta lager · «covenants» →
 *       EJ detta lager · «borgen» → notlasningen · «skuldfällan» →
 *       riskdjupet
 *   F2  juridikgrind — pedagogiskt, aldrig råd
 *   G   ANTISTÖLD — grannlagers kanoniska (u1:s ränteswap-territorium,
 *       nyfodda, banksektorn, notlasningens skuggskulder, valutamekanikens
 *       ppp/ränteparitet, överlevnadsdjupets z-score) → NULL från detta lager
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS) + H2 med detta
 *       lager svarar skuldordning
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER ränteswapen och FÖRE marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-skuldordning.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltSkuldordning, SKULDORDNING_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-skuldordning-fragor.ts")).href
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
  { fraga: "Vad är senioritetsordningen?", amne: "senioritetsordningen", slug: "ks-09-senioritetsordningen" },
  { fraga: "Vad är senioritet?", amne: "senioritetsordningen", slug: "ks-09-senioritetsordningen" },
  { fraga: "Vad är en rekonstruktion?", amne: "senioritetsordningen", slug: "ks-09-senioritetsordningen" },
  { fraga: "Hur räknas likvidationsordningen?", amne: "senioritetsordningen", slug: "ks-09-senioritetsordningen" },
  { fraga: "Vad är säkringsgraden?", amne: "valutasakringen", slug: "ks-08-valutasakringen" },
  { fraga: "Vad är en valutatermin?", amne: "valutasakringen", slug: "ks-08-valutasakringen" },
  { fraga: "Hur räknas terminspremien ut?", amne: "valutasakringen", slug: "ks-08-valutasakringen" },
  { fraga: "Vad är överhedg?", amne: "valutasakringen", slug: "ks-08-valutasakringen" },
];
{
  for (const f of NYA) {
    const s = svaraLokaltSkuldordning(f.fraga, KURSREGISTER);
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
  const min = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-skuldordning-fragor.ts");
  const ixFodda = MOTORDEFS.findIndex((d) => d.namn === "nyfodda");
  const ixRytm = MOTORDEFS.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2: MOTORDEFS — skuldordning " + (min + 1) + "/" + MOTORDEFS.length + ", efter nyfodda, FÖRE marknadsrytm (SIST)",
    min >= 0 && ixFodda >= 0 && ixRytm >= 0 && ixFodda < min && min < ixRytm,
    MOTORDEFS[min] ? "antal " + MOTORDEFS[min].antal + " · motorer " + MOTORDEFS.length : "rad SAKNAS",
  );
  kontroll(
    "A2b: antal-vakt — MOTORDEFS.antal 2 = modulens " + SKULDORDNING_MONSTER.length + " monsters",
    min >= 0 && MOTORDEFS[min].antal === 2 && SKULDORDNING_MONSTER.length === 2,
    "monster-id:n " + SKULDORDNING_MONSTER.map((m) => m.id).join(", "),
  );
}

// ── FALL B: felstavningar och varianter → samma träff ───────────────────────
{
  const VARIANTER = [
    { fraga: "vad är senioritetsordningn?", amne: "senioritetsordningen" },
    { fraga: "vad ar sakratt?", amne: "senioritetsordningen" },
    { fraga: "efterställd skuld — vad betyder det?", amne: "senioritetsordningen" },
    { fraga: "vad är ackordet?", amne: "senioritetsordningen" },
    { fraga: "vad gör en likvidator?", amne: "senioritetsordningen" },
    { fraga: "vad är säkringsgradn?", amne: "valutasakringen" },
    { fraga: "terminsprogrammet?", amne: "valutasakringen" },
    { fraga: "vad är valutaswappen?", amne: "valutasakringen" },
    { fraga: "vad är naturlig säkring?", amne: "valutasakringen" },
    { fraga: "vad är den osäkrade resten?", amne: "valutasakringen" },
  ];
  for (const v of VARIANTER) {
    const s = svaraLokaltSkuldordning(v.fraga, KURSREGISTER);
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
    const a = svaraLokaltSkuldordning(f.fraga, KURSREGISTER);
    const b = svaraLokaltSkuldordning(f.fraga, KURSREGISTER);
    kontroll(
      'C: determinism "' + f.fraga + '"',
      a !== null && b !== null && a.text === b.text && a.kallor?.length === b.kallor?.length,
      a?.text === b?.text ? "bitidentiskt" : "AVVIKER",
    );
  }
}

// ── FALL D01–D24: aritmetiken omräknad maskinellt ────────────────────────────
{
  const S = svaraLokaltSkuldordning("Vad är senioritetsordningen?", KURSREGISTER);
  const V = svaraLokaltSkuldordning("Vad är säkringsgraden?", KURSREGISTER);
  const t = (s) => s?.text ?? "";

  // Senioritetsordningen (ks-09, NorrVerk Maskiner — påhittat)
  kontroll("D01: pantrealisation 420×0,61 = 256,2", approx(420 * 0.61, 256.2) && t(S).includes("256,2"), "");
  kontroll("D02: fri substans 380×0,35 = 133,0", approx(380 * 0.35, 133.0) && t(S).includes("133,0"), "");
  kontroll("D03: summa 389,2 = 48,7 % av 800", approx(256.2 + 133.0, 389.2) && approx(389.2 / 800, 0.487) && t(S).includes("48,7"), "");
  kontroll("D04: fördelningsbart 389,2−12,0 = 377,2", approx(389.2 - 12.0, 377.2) && t(S).includes("377,2"), "");
  kontroll("D05: bankens rest 380−256,2 = 123,8", approx(380 - 256.2, 123.8) && t(S).includes("123,8"), "");
  kontroll("D06: pott 133,0−12,0−42 = 79,0", approx(133.0 - 12.0 - 42, 79.0) && t(S).includes("79,0"), "");
  kontroll("D07: kvot 79,0/381,8 = 20,7 %", approx(79.0 / 381.8, 0.207, 0.0005) && t(S).includes("20,7"), "");
  kontroll("D08: banken 256,2+25,6 = 281,8 = 74,2 %", approx(123.8 * 0.207, 25.6, 0.05) && approx(256.2 + 25.6, 281.8) && approx(281.8 / 380, 0.742) && t(S).includes("74,2"), "");
  kontroll("D09: obligationen 150×0,207 = 31,0 · klyfta 53,5 pp", approx(150 * 0.207, 31.0, 0.05) && approx(74.2 - 20.7, 53.5, 0.05) && t(S).includes("53,5"), "");
  kontroll("D10: kontroll 256,2+42+79,0 = 377,2", approx(256.2 + 42 + 79.0, 377.2) && t(S).includes("256,2 + 42 + 79,0"), "");
  kontroll("D11: LGD 79,3 % · 4,5 %×79,3 % = 3,57 ≈ 3,6", approx(1 - 0.207, 0.793) && approx(0.045 * 0.793, 0.0357, 0.0005) && t(S).includes("79,3") && t(S).includes("3,57") && t(S).includes("3,6"), "");
  kontroll("D12: rekonstruktion 25+15 = 40 mot 20,7", approx(25 + 15, 40) && t(S).includes("25 procent kontant") && t(S).includes("15 procent i nya aktier"), "");
  kontroll("D13: stress 420×0,51 = 214,2", approx(420 * 0.51, 214.2) && t(S).includes("214,2"), "");
  kontroll("D14: övningar 210/rest 40 · 40,0 % · 32 · 3,9", approx(300 * 0.7, 210) && approx(250 - 210, 40) && approx(60 / 150, 0.4) && approx(0.4 * 80, 32) && approx(0.06 * 0.65, 0.039) && t(S).includes("40,0") && t(S).includes("3,9"), "");

  // Valutasäkringen (ks-08, Norrsken Verktyg AB — påhittat)
  kontroll("D15: termin 11,50×1,040/1,025 = 11,67", approx(11.5 * 1.04 / 1.025, 11.668, 0.005) && t(V).includes("11,67"), "");
  kontroll("D16: eurolånet 40/1,025 = 39,0", approx(40 / 1.025, 39.024, 0.005) && t(V).includes("39,0"), "");
  kontroll("D17: pengmarknad 448,8 · 466,7 mot 466,8", approx(39.024 * 11.5, 448.78, 0.05) && approx(448.78 * 1.04, 466.73, 0.05) && approx(40 * 11.67, 466.8, 0.05) && t(V).includes("448,8") && t(V).includes("466,7") && t(V).includes("466,8"), "");
  kontroll("D18: optionspremie 0,35×40 = 14,0", approx(0.35 * 40, 14.0) && t(V).includes("14 miljoner"), "");
  kontroll("D19: vänd ränta 11,50×1,020/1,030 = 11,39", approx(11.5 * 1.02 / 1.03, 11.388, 0.005) && t(V).includes("11,39"), "");
  kontroll("D20: premiecykel 40×0,17 = 6,8 · 40×0,12 = 4,8", approx(40 * 0.17, 6.8) && approx(40 * 0.12, 4.8) && t(V).includes("6,8") && t(V).includes("4,8"), "");
  kontroll("D21: noten 31/40 = 78 % · 9 osäkrat", approx(31 / 40, 0.775) && approx(40 - 31, 9) && t(V).includes("78 procent") && t(V).includes("9 miljoner"), "");
  kontroll("D22: nettoinvestering 280+20 = 300 = 100 %", approx(280 + 20, 300) && t(V).includes("hundra procent matchad"), "");
  kontroll("D23: överhedg 50−40 = 10", approx(50 - 40, 10) && t(V).includes("10 miljoner"), "");
  kontroll("D24: medeltermin 11,52 mot spot 11,50", t(V).includes("11,52") && t(V).includes("11,50"), "");
}

// ── FALL D25: registerdrivna tal LIVE ────────────────────────────────────────
{
  const ksAntal = KURSREGISTER.filter((r) => r.kategori === "KAPITALSTRUKTUR").length;
  const S = svaraLokaltSkuldordning("Vad är senioritetsordningen?", KURSREGISTER);
  const V = svaraLokaltSkuldordning("Vad är säkringsgraden?", KURSREGISTER);
  kontroll(
    "D25: kategoriräknare LIVE — KAPITALSTRUKTUR " + ksAntal,
    S?.text.includes("I kategorin kapitalstruktur finns " + ksAntal + " kurser") &&
      V?.text.includes("I kategorin kapitalstruktur finns " + ksAntal + " kurser"),
    "siffrorna ur KURSREGISTER vid svarstid",
  );
}

// ── FALL D26: KATEGORISTÄNGNING LIVE — 0 mentorväglösa i KAPITALSTRUKTUR ────
{
  const libFiler = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));
  libFiler.push("ai-mentor-svar.ts");
  let allt = "";
  for (const f of libFiler) allt += readFileSync(join(ROT, "src/lib", f), "utf8");
  const mentorlosa = KURSREGISTER.filter(
    (r) => r.kategori === "KAPITALSTRUKTUR" && !allt.includes('"' + r.slug + '"'),
  );
  kontroll(
    "D26: KAPITALSTRUKTUR fullt mentorlänkad",
    mentorlosa.length === 0,
    mentorlosa.length ? "lösa: " + mentorlosa.map((r) => r.slug).join(", ") : "0 mentorväglösa av " + KURSREGISTER.filter((r) => r.kategori === "KAPITALSTRUKTUR").length,
  );
}

// ── FALL D27+D28: nivåmarkörer + fantomslug ─────────────────────────────────
{
  const S = svaraLokaltSkuldordning("Vad är senioritetsordningen?", KURSREGISTER);
  const V = svaraLokaltSkuldordning("Vad är säkringsgraden?", KURSREGISTER);
  kontroll(
    "D27: nivåmarkörer — ks-09 intermediär · ks-08 intermediär",
    S?.text.includes("intermediär nivå") && V?.text.includes("intermediär nivå"),
    "nivåerna LIVE ur registret",
  );
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  const alla = [S, V].flatMap((s) => [
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
    { fraga: "vad är valutasäkring?", ej: "skuldordning", krav: "ägare" },
    { fraga: "vad är valutahedging?", ej: "skuldordning", krav: "ägare" },
    { fraga: "vad är konkursprognos?", ej: "skuldordning", krav: "ägare" },
    { fraga: "vad är z-score?", ej: "skuldordning", krav: "ägare" },
    { fraga: "vad är terminer?", ej: "skuldordning", krav: null },
    { fraga: "vad är covenants?", ej: "skuldordning", krav: null },
    { fraga: "vad är en borgen?", ej: "skuldordning", krav: null },
    { fraga: "vad är en skuldfälla?", ej: "skuldordning", krav: "ägare" },
  ];
  for (const g of GRANSER) {
    const agare = (() => {
      for (const m of MOTORER) {
        if (m.fnk(g.fraga, KURSREGISTER) !== null) return m.namn;
      }
      return null;
    })();
    const ok = g.krav === "ägare" ? agare !== null && agare !== g.ej : agare !== g.ej;
    kontroll(
      'F: "' + g.fraga + '" ägs EJ av skuldordning' + (g.krav === "ägare" ? " (och HAR en ägare)" : ""),
      ok,
      agare ? "ägare: " + agare : "NULL (ingen motor)",
    );
  }
}

// ── FALL F2: juridikgrind — pedagogiskt, aldrig råd ─────────────────────────
{
  const S = svaraLokaltSkuldordning("Vad är senioritetsordningen?", KURSREGISTER);
  const V = svaraLokaltSkuldordning("Vad är säkringsgraden?", KURSREGISTER);
  for (const [namn, s] of [["senioritetsordningen", S], ["valutasäkringen", V]]) {
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
    // u1:s ränteswap-territorium (fönster 34) — deras anspråk respekteras
    "vad är en ränteswap?",
    "vad är swapkurvan?",
    "vad är brytvärdet?",
    // nyfodda (omgång 33)
    "vad är kreditderivatet?",
    "vad är en avknoppning?",
    "vad är kompetensillusionen?",
    // banksektorn + notläsning
    "vad är banksektorn?",
    "vad är nätlånet?",
    "vad är skuggskulder?",
    "vad är en borgen?",
    // valutamekaniken äger översiktsfamiljen
    "vad är ppp?",
    "vad är ränteparitet?",
    "vad är valutarisk?",
    // överlevnadsdjupet äger dödsfallen
    "vad är altman z-score?",
    "vad är överlevnadstid?",
  ];
  let stulna = [];
  for (const g of GRANNAR) {
    if (svaraLokaltSkuldordning(g, KURSREGISTER) !== null) stulna.push(g);
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
  const UTAN = MOTORDEFS.filter((d) => d.fil !== "ai-mentor-skuldordning-fragor.ts");
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
    skuggade.length ? "SKUGGAD: " + skuggade.join(" · ") : "ända ägaren är skuldordning",
  );
  // H2: med detta lager — kedjan (i MOTORDEFS-ordning) svarar skuldordning
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
      'H2: med detta lager svarar kedjan skuldordning ("' + f.fraga + '")',
      k !== null && k.motor === "skuldordning" && k.amne === f.amne,
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
    (f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-skuldordning-fragor.ts",
  );
  const andras = [];
  for (const f of filer) {
    const kalla = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const block of kalla.matchAll(/karnord:\s*\[([^\]]*)\]/g)) {
      for (const ord of block[1].matchAll(/"([^"]+)"/g)) andras.push({ fil: f, karnord: diafri(ord[1]) });
    }
  }
  const mina = SKULDORDNING_MONSTER.flatMap((m) => m.karnord.map(diafri));
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
  const importOk = widget.includes('import { svaraLokaltSkuldordning } from "@/lib/ai-mentor-skuldordning-fragor"');
  const rad = widget.match(/const lokalt = ([^;]+);/);
  const ordning = rad ? [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]) : [];
  const ix = ordning.indexOf("svaraLokaltSkuldordning");
  const ixFodda = ordning.indexOf("svaraLokaltNyfodda");
  const ixRytm = ordning.indexOf("svaraLokaltMarknadsrytm");
  kontroll(
    "L: widget-synk — import + EFTER nyfodda, FÖRE marknadsrytm (deras SIST)",
    importOk && ix >= 0 && ixFodda >= 0 && ixRytm >= 0 && ixFodda < ix && ix < ixRytm,
    importOk ? "kedjan bär lager " + (ix + 1) + "/" + ordning.length : "import SAKNAS",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("\nSKULDORDNING (s6-u2 omgång 34): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
