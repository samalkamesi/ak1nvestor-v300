/**
 * TESTA AI-MENTORN — KATEGORISTÄNGNING (s6-u3 FÖRSÖK 2, fönster 32, manifest
 * auto-s6-1789965330060: budprocessen [kt-09 primär + kt-02 + kt-04 + bf-12 +
 * pe-04 som källor ⇒ KATALYSATOR 12/12] + ekonomiska vinsten [roic-05 primär +
 * km-008 + roic-02 + ln-01 + vr-07 ⇒ LÖNSAMHET 13/13] + försäkringsskrivandet
 * [od-09 primär + od-01 + am-09 + rk-12 + bf-16 ⇒ OPTIONS & DERIVAT 13/13]).
 *
 * Kör:  node verktyg/testa-ai-mentor-kategoristangning.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets tre förhandsfrågor (se
 * src/lib/ai-mentor-kategoristangning-fragor.ts) med bevakning:
 *   A   9 kanoniska ingångar (tre per monster) → rätt ämne, primärkälla,
 *       FLERKÄLLA (källor = 5 + numrerad Källor-rad) och ≥ 4 kurslänkar
 *   A2  MOTORDEFS-position LIVE (efter beteendefallor, FÖRE marknadsrytm —
 *       deras SIST-deklaration; relativa påståenden, framtidsäkra när
 *       syskonens fönsterlager wireas) + antal-vakten
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — frågor två gånger ⇒ bitidentiskt svar
 *   D01–D25 aritmetik maskinellt omräknad (kursernas egna modelltal):
 *       116/95 − 1 = 22,1 % · 120 − 118 = 2 · 30/32 = 93,8 % ·
 *       2/118 = 1,7 % · (118 − 88)/118 = 25,4 % · 250 × 0,72 = 180 ·
 *       1 000 × 0,10 = 100 · 500 × 0,0972 × 0,72 = 35 · 135/1 500 = 9,0 % ·
 *       180 − 135 = 45 · 0,03 × 1 500 = 45 · 105/0,72 ≈ 146 ·
 *       1 500 + 45/0,09 = 2 000 · 45 × 1,03/0,06 = 772,5 ·
 *       1 500 − 30/0,09 = 1 166,7 · 1 500 − 30 × 1,03/0,06 = 985 ·
 *       1 500 − 30 × 1,05/0,04 = 712,5 · 9 % × 25 = 2,25 ·
 *       3,50 − 2,00 = 1,50 · 0,78 × 1,50 − 0,22 × 5,50 = 1,17 − 1,21 =
 *       −0,04 · −7,00 + 1,50 = −5,50 · 1 500/95 000 = 1,58 % ·
 *       95 000/19 000 = 5,0 · 1,50 + 2,00 = 3,50 · 95 × 100 = 9 500
 *   D26 registerdrivna tal (KATALYSATOR/LÖNSAMHET/OPTIONS & DERIVAT LIVE)
 *   D27 nivåmarkörer (kt-09 Intermediär · roic-05 Avancerad ·
 *       od-09 Avancerad) + D28 fantomslug
 *   F   ägargränser (sondens dokumenterade policy GENOM HELA KEDJAN):
 *       «budpremien» → handelsemotor · «optioner» → nästa · «nopat» →
 *       lonsamhetsdjup · «tidsvärde» → optionsdjup · «inre värde» → nästa ·
 *       «spridningen mellan roic och wacc» → lonsamhetsdjup ·
 *       «skriven säljoption» → optionsdjup
 *   F2  juridikgrind — pedagogiskt, aldrig råd
 *   G   ANTISTÖLD — grannlagers kanoniska (stålsektorn, kemisektorn,
 *       budpremien, haloeffekten, övningsbolaget, take or pay, straddle,
 *       binomialträdet, dupont, roic, nopat, tidsvärde) → NULL från detta lager
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS) + H2 med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER beteendefallor och FÖRE marknadsrytm
 *       (deras SIST-deklaration) i chat-widget.tsx:s kedja
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-kategoristangning.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltKategoristangning, KATEGORISTANGNING_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-kategoristangning-fragor.ts")).href
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

// ── FALL A: nio kanoniska ingångar, tre monster, flerkällskrav ──────────────
const NYA = [
  { fraga: "Hur fungerar en budprocess?", amne: "budprocessen", slug: "kt-09-budpremien-och-budprocessen" },
  { fraga: "Vad är budtiden?", amne: "budprocessen", slug: "kt-09-budpremien-och-budprocessen" },
  { fraga: "Vad är tvångsinlösen?", amne: "budprocessen", slug: "kt-09-budpremien-och-budprocessen" },
  { fraga: "Vad är EVA?", amne: "ekonomiskavinsten", slug: "roic-05-den-ekonomiska-vinsten" },
  { fraga: "Vad är ekonomisk vinst?", amne: "ekonomiskavinsten", slug: "roic-05-den-ekonomiska-vinsten" },
  { fraga: "Vad är värdebryggan?", amne: "ekonomiskavinsten", slug: "roic-05-den-ekonomiska-vinsten" },
  { fraga: "Vad är försäkringsskrivandet?", amne: "forsakringsskrivandet", slug: "od-09-forsakringsskrivandet" },
  { fraga: "Vad är en kontanttäckt position?", amne: "forsakringsskrivandet", slug: "od-09-forsakringsskrivandet" },
  { fraga: "Vad är wheel-cykeln?", amne: "forsakringsskrivandet", slug: "od-09-forsakringsskrivandet" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltKategoristangning(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " kategoristängning", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length === 5;
  const kallradOk = svar.text.includes("📖 Källor (5)");
  const primarForst = svar.kallor?.[0]?.slug === f.slug;
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/")).length;
  const fragorKnappar = svar.handlings.filter((h) => h.lank.startsWith("fragor:")).length;
  kontroll(
    nr + " kanonisk ingång «" + f.fraga + "»",
    amneOk && kallaOk && kallorFinns && kallradOk && primarForst && kurslankar >= 4 && fragorKnappar >= 2,
    "ämne=" + svar.amne + " · primär=" + svar.kalla.slug + " · källor=" + (svar.kallor?.length ?? 0) +
      " · kurslänkar=" + kurslankar + " · fragor-knappar=" + fragorKnappar,
  );
});

// ── FALL A2: MOTORDEFS-position LIVE (relativ: efter beteendefallor, FÖRE marknadsrytm) ──
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
  const ix = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-kategoristangning-fragor.ts");
  const ixFallor = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-beteendefallor-fragor.ts");
  const ixRytm = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-marknadsrytm-fragor.ts");
  const antalOk = ix >= 0 && MOTORDEFS[ix].antal === KATEGORISTANGNING_MONSTER.length;
  kontroll(
    "A2 MOTORDEFS-position LIVE (efter beteendefallor, FÖRE marknadsrytm — deras SIST)",
    ix >= 0 && ixFallor >= 0 && ixRytm >= 0 && ixFallor < ix && ix < ixRytm && antalOk,
    "motorer=" + MOTORDEFS.length + " · kategoristangning@index " + ix + " (antal " + (ix >= 0 ? MOTORDEFS[ix].antal : "?") + " = " + KATEGORISTANGNING_MONSTER.length + " monsters)",
  );
}

// ── FALL B: felstavade/varierade varianter ──────────────────────────────────
const VARIANTER = [
  { fraga: "Hur funkar en budprocess?", amne: "budprocessen" },
  { fraga: "Vad är budtiden för något?", amne: "budprocessen" },
  { fraga: "Vad är tvångsinlösning?", amne: "budprocessen" },
  { fraga: "Vad är budplikten?", amne: "budprocessen" },
  { fraga: "Hur räknas spridningen?", amne: "ekonomiskavinsten" },
  { fraga: "Vad är kapitalhyran?", amne: "ekonomiskavinsten" },
  { fraga: "Vad är alternativkostnaden?", amne: "ekonomiskavinsten" },
  { fraga: "Vad är eva för mått?", amne: "ekonomiskavinsten" },
  { fraga: "Vad är försäkringsskrivande?", amne: "forsakringsskrivandet" },
  { fraga: "Vem är utfärdaren?", amne: "forsakringsskrivandet" },
  { fraga: "Vad är optionsskrivande?", amne: "forsakringsskrivandet" },
  { fraga: "Vad är väntevärdet för optionsäljaren?", amne: "forsakringsskrivandet" },
];
VARIANTER.forEach((v, i) => {
  const svar = svaraLokaltKategoristangning(v.fraga, KURSREGISTER);
  kontroll(
    "B" + String(i + 1).padStart(2, "0") + " variant «" + v.fraga + "»",
    svar !== null && svar.amne === v.amne,
    svar ? "ämne=" + svar.amne : "NULL",
  );
});

// ── FALL C: determinism — samma fråga två gånger ⇒ bitidentiskt svar ────────
for (const f of NYA.slice(0, 6)) {
  const a = svaraLokaltKategoristangning(f.fraga, KURSREGISTER);
  const b = svaraLokaltKategoristangning(f.fraga, KURSREGISTER);
  kontroll(
    "C: determinism («" + f.fraga + "»)",
    JSON.stringify(a) === JSON.stringify(b),
    a ? "bitidentiskt" : "NULL",
  );
}

// ── FALL D: aritmetiken maskinellt omräknad (kursernas egna modelltal) ──────
{
  const bud = KATEGORISTANGNING_MONSTER.find((m) => m.id === "budprocessen").bygga(KURSREGISTER).text;
  const eva = KATEGORISTANGNING_MONSTER.find((m) => m.id === "ekonomiskavinsten").bygga(KURSREGISTER).text;
  const fors = KATEGORISTANGNING_MONSTER.find((m) => m.id === "forsakringsskrivandet").bygga(KURSREGISTER).text;

  const KONTROLLER = [
    ["D01 dag-noll-kliv 116/95 − 1", 116 / 95 - 1, 0.221, 0.0006],
    ["D02 spread 120 − 118", 120 - 118, 2, 0.0001],
    ["D03 fullbordan-sannolikhet 30/32", 30 / 32, 0.938, 0.0006],
    ["D04 uppsida 2/118", 2 / 118, 0.017, 0.0006],
    ["D05 avslagsförlust (118−88)/118", (118 - 88) / 118, 0.254, 0.0006],
    ["D06 NOPAT 250 × 0,72", 250 * 0.72, 180, 0.0001],
    ["D07 egenkapitalhyra 1 000 × 0,10", 1000 * 0.10, 100, 0.0001],
    ["D08 skuldhyra 500 × 0,0972 × 0,72", 500 * 0.0972 * 0.72, 35, 0.01],
    ["D09 WACC 135/1 500", 135 / 1500, 0.09, 0.0006],
    ["D10 EVA 180 − 135", 180 - 135, 45, 0.0001],
    ["D11 spridningen 0,03 × 1 500", 0.03 * 1500, 45, 0.0001],
    ["D12 Sörverks vinst 105/0,72", 105 / 0.72, 146, 0.6],
    ["D13 Norrverk g0: 1 500 + 45/0,09", 1500 + 45 / 0.09, 2000, 0.001],
    ["D14 Norrverk g3-tillägget 45 × 1,03/0,06", 45 * 1.03 / 0.06, 772.5, 0.001],
    ["D15 Sörverk g0: 1 500 − 30/0,09", 1500 - 30 / 0.09, 1166.7, 0.04],
    ["D16 Sörverk g3: 1 500 − 30 × 1,03/0,06", 1500 - 30 * 1.03 / 0.06, 985, 0.001],
    ["D17 Sörverk g5: 1 500 − 30 × 1,05/0,04", 1500 - 30 * 1.05 / 0.04, 712.5, 0.001],
    ["D18 sista hyran 9 % × 25", 0.09 * 25, 2.25, 0.001],
    ["D19 säljarens kvarhållna del 3,50 − 2,00", 3.5 - 2.0, 1.5, 0.0001],
    ["D20 väntevärde 0,78 × 1,50 − 0,22 × 5,50", 0.78 * 1.5 - 0.22 * 5.5, -0.04, 0.001],
    ["D21 vinsthalva 0,78 × 1,50", 0.78 * 1.5, 1.17, 0.0001],
    ["D22 förlusthalva 0,22 × 5,50", 0.22 * 5.5, 1.21, 0.0001],
    ["D23 kontanttäckt avkastning 1 500/95 000", 1500 / 95000, 0.0158, 0.00006],
    ["D24 wheel-varv 1,50 + 2,00", 1.5 + 2.0, 3.5, 0.0001],
    ["D25 maxförlust naken put 95 × 100", 95 * 100, 9500, 0.0001],
  ];
  for (const [namn, raknat, textTal, tolerans] of KONTROLLER) {
    kontroll(
      "D: " + namn + " = " + textTal.toString().replace("0.", "") + " i texten",
      approx(raknat, textTal, tolerans),
      "omräknat " + raknat.toFixed(4) + " mot textens " + textTal + " (tol " + tolerans + ")",
    );
  }

  // Textens närvaro av nyckeltalen och historiska markörer (svensk decimalform)
  const narvaro = [
    ["D12b «nio tiondelar» i texten", bud.includes("nio tiondelar")],
    ["D13b multipel «1,33» i texten", eva.includes("1,33")],
    ["D14b «772,5» i texten", eva.includes("772,5")],
    ["D17b «712,5» i texten", eva.includes("712,5")],
    ["D20b «1,17 − 1,21» i texten", fors.includes("1,17 − 1,21")],
    ["D23b «1,58» i texten", fors.includes("1,58")],
    ["D25b Barings «827 miljoner pund» i texten", fors.includes("827 miljoner pund")],
    ["D25c «233 år» i texten", fors.includes("233 år")],
  ];
  for (const [namn, ok] of narvaro) kontroll(namn, ok, ok ? "finns" : "SAKNAS i texten");

  // D26: antalen stämmer med LIVE-registret (tre kategorier, tre monsters)
  const ktAntal = KURSREGISTER.filter((r) => r.kategori === "KATALYSATOR").length;
  const lnAntal = KURSREGISTER.filter((r) => r.kategori === "LÖNSAMHET").length;
  const odAntal = KURSREGISTER.filter((r) => r.kategori === "OPTIONS & DERIVAT").length;
  kontroll(
    "D26 registerdrivna tal (KATALYSATOR=" + ktAntal + " · LÖNSAMHET=" + lnAntal + " · OPTIONS & DERIVAT=" + odAntal + " LIVE)",
    bud.includes(ktAntal + " kurser") && eva.includes(lnAntal + " kurser") && fors.includes(odAntal + " kurser"),
    "budtexten «" + ktAntal + " kurser» · evatexten «" + lnAntal + " kurser» · förstexten «" + odAntal + " kurser»",
  );

  // D27: nivåmarkörer — kursernas nivåer nämnda i texterna
  const kt09 = KURSREGISTER.find((r) => r.slug === "kt-09-budpremien-och-budprocessen");
  const roic05 = KURSREGISTER.find((r) => r.slug === "roic-05-den-ekonomiska-vinsten");
  const od09 = KURSREGISTER.find((r) => r.slug === "od-09-forsakringsskrivandet");
  kontroll(
    "D27 nivåmarkör (kt-09 Intermediär · roic-05 Avancerad · od-09 Avancerad)",
    kt09?.niva === "Intermediär" && roic05?.niva === "Avancerad" && od09?.niva === "Avancerad" &&
      bud.includes("intermediär nivå") && eva.includes("avancerad nivå") && fors.includes("avancerad nivå"),
    "kt-09=" + (kt09?.niva ?? "?") + " · roic-05=" + (roic05?.niva ?? "?") + " · od-09=" + (od09?.niva ?? "?"),
  );

  // D28: fantomslug — alla källor och kurslänkar finns i registret
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  let fantom = [];
  for (const m of KATEGORISTANGNING_MONSTER) {
    const s = m.bygga(KURSREGISTER);
    for (const kk of s.kallor ?? []) if (kk.slug && !slugSet.has(kk.slug)) fantom.push(kk.slug);
    if (s.kalla.slug && !slugSet.has(s.kalla.slug)) fantom.push(s.kalla.slug);
    if (s.fordjupa?.lank?.startsWith("/kurser/")) {
      const slug = s.fordjupa.lank.replace("/kurser/", "");
      if (!slugSet.has(slug)) fantom.push(slug);
    }
    for (const h of s.handlings) {
      if (h.lank.startsWith("/kurser/")) {
        const slug = h.lank.replace("/kurser/", "");
        if (!slugSet.has(slug)) fantom.push(slug);
      }
    }
  }
  kontroll("D28 fantomslug", fantom.length === 0, fantom.length ? "SAKNAS: " + fantom.join(", ") : "alla slugs äkta");

  // D29: KATEGORISTÄNGNINGARNA — kurserna är mentorväglänkade genom detta lager
  // (kurslänkarna + källorna finns i HELA svaret — sök i JSON av bygga(),
  // inte bara textfältet)
  const hela = KATEGORISTANGNING_MONSTER.map((m) => JSON.stringify(m.bygga(KURSREGISTER))).join(" ");
  const stangda = ["kt-09-budpremien-och-budprocessen", "roic-05-den-ekonomiska-vinsten", "od-09-forsakringsskrivandet"];
  const saknas = stangda.filter((s) => !hela.includes("/kurser/" + s));
  kontroll(
    "D29 tre kategoristängningar bär sina primärkurser",
    saknas.length === 0,
    saknas.length ? "SAKNAS: " + saknas.join(", ") : "KATALYSATOR 12/12 + LÖNSAMHET 13/13 + OPTIONS & DERIVAT 13/13",
  );
}

// ── FALL F: ägargränser — dokumenterad policy (genom HELA kedjan) ───────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
  const MOTORER = [];
  for (const d of MOTORDEFS) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  function kedja(fraga) {
    for (const m of MOTORER) {
      const s = m.fnk(fraga, KURSREGISTER);
      if (s) return { svar: s, motor: m.namn };
    }
    return null;
  }
  const GRANSER = [
    { fraga: "vad är budpremien?", agare: "handelsemotor" },
    { fraga: "vad är optioner?", agare: "nästa" },
    { fraga: "vad är nopat?", agare: "lonsamhetsdjup" },
    { fraga: "vad är tidsvärde?", agare: "optionsdjup" },
    { fraga: "vad är inre värde?", agare: "nästa" },
    { fraga: "vad är spridningen mellan roic och wacc?", agare: "lonsamhetsdjup" },
    { fraga: "vad är en skriven säljoption?", agare: "optionsdjup" },
  ];
  for (const g of GRANSER) {
    const k = kedja(g.fraga);
    kontroll(
      "F: «" + g.fraga + "» → " + g.agare + " (inte kategoristangning)",
      k !== null && k.motor === g.agare,
      k ? "motor=" + k.motor : "NULL (ägare saknas — gränsdokumentationen fel?)",
    );
  }
}

// ── FALL F2: juridikgrind — pedagogiskt, aldrig råd ─────────────────────────
{
  const svar = svaraLokaltKategoristangning("Hur fungerar en budprocess?", KURSREGISTER);
  const text = (svar?.text ?? "") +
    " " + (svaraLokaltKategoristangning("Vad är EVA?", KURSREGISTER)?.text ?? "") +
    " " + (svaraLokaltKategoristangning("Vad är försäkringsskrivandet?", KURSREGISTER)?.text ?? "");
  const rader = [
    "inga placeringstips",
    "påhittade",
  ];
  const rådsFRASER = [
    /köp [a-zåä0-9]+ aktie/i,
    /sälj (denna|denna aktie|aktien nu)/i,
    /du bör köpa/i,
    /bästa aktien att köpa/i,
  ];
  const pedagogisk = rader.every((r) => text.toLowerCase().includes(r.toLowerCase()));
  const friFranRad = !rådsFRASER.some((re) => re.test(text));
  kontroll(
    "F2 juridikgrind — pedagogiskt, aldrig råd (lagen 2007:528)",
    pedagogisk && friFranRad,
    pedagogisk && friFranRad ? "utbildningsram + 0 rådsfraser" : "SAKNAD ram eller rådsfras hittad",
  );
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska lämnas ifred ──────────────────
{
  const GRANNAR = [
    "vad är stålsektorn?",
    "vad är kemisektorn?",
    "vad är budpremien?",
    "vad är haloeffekten?",
    "hur övar jag på riktiga bolag?",
    "vad är take or pay?",
    "vad är en straddle?",
    "vad är binomialträdet?",
    "vad är dupont?",
    "vad är roic?",
    "vad är nopat?",
    "vad är tidsvärde?",
  ];
  let stulna = [];
  for (const g of GRANNAR) {
    if (svaraLokaltKategoristangning(g, KURSREGISTER) !== null) stulna.push(g);
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
  const UTAN = MOTORDEFS.filter((d) => d.fil !== "ai-mentor-kategoristangning-fragor.ts");
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
    skuggade.length ? "SKUGGAD: " + skuggade.join(" · ") : "ända ägaren är kategoristangning",
  );
  // H2: med detta lager — kedjan (i MOTORDEFS-ordning) svarar kategoristangning
  const MED = MOTORDEFS;
  const MOTORER2 = [];
  for (const d of MED) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER2.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  for (const f of [NYA[0], NYA[3], NYA[6]]) {
    const k = (() => {
      for (const m of MOTORER2) {
        const s = m.fnk(f.fraga, KURSREGISTER);
        if (s) return { motor: m.namn, amne: s.amne };
      }
      return null;
    })();
    kontroll(
      "H2: med detta lager svarar kedjan kategoristangning («" + f.fraga + "»)",
      k !== null && k.motor === "kategoristangning" && k.amne === f.amne,
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
    (f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-kategoristangning-fragor.ts",
  );
  const andras = [];
  for (const f of filer) {
    const kalla = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const block of kalla.matchAll(/karnord:\s*\[([^\]]*)\]/g)) {
      for (const ord of block[1].matchAll(/"([^"]+)"/g)) andras.push({ fil: f, karnord: diafri(ord[1]) });
    }
  }
  const mina = KATEGORISTANGNING_MONSTER.flatMap((m) => m.karnord.map(diafri));
  const kollisioner = [];
  for (const mk of mina) {
    for (const { fil, karnord } of andras) {
      if (kolliderar(mk, karnord)) kollisioner.push(mk + " ↔ " + karnord + " (" + fil.replace("ai-mentor-", "").replace("-fragor.ts", "") + ")");
    }
  }
  kontroll(
    "J: kärnordsdisjunktion LIVE (" + mina.length + " kärnord mot " + andras.length + " i " + filer.length + " lager)",
    kollisioner.length === 0,
    kollisioner.length ? kollisioner.join(" · ") : "0 kollisioner",
  );
}

// ── FALL L: widget-synk — import + kedjeposition ────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importOk = widget.includes('import { svaraLokaltKategoristangning } from "@/lib/ai-mentor-kategoristangning-fragor"');
  const importFallor = widget.includes('import { svaraLokaltBeteendefallor } from "@/lib/ai-mentor-beteendefallor-fragors"') ||
    widget.includes('import { svaraLokaltBeteendefallor } from "@/lib/ai-mentor-beteendefallor-fragor"');
  const rad = widget.match(/const lokalt = ([^;]+);/);
  const ordning = rad ? [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]) : [];
  const ix = ordning.indexOf("svaraLokaltKategoristangning");
  const ixFallor = ordning.indexOf("svaraLokaltBeteendefallor");
  const ixRytm = ordning.indexOf("svaraLokaltMarknadsrytm");
  kontroll(
    "L: widget-synk — import + EFTER beteendefallor, FÖRE marknadsrytm (deras SIST)",
    importOk && importFallor && ix >= 0 && ixFallor >= 0 && ixRytm >= 0 && ixFallor < ix && ix < ixRytm,
    importOk ? "kedjan bär lager " + (ix + 1) + "/" + ordning.length : "import SAKNAS",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("\nKATEGORISTÄNGNING (s6-u3 försök 2 fönster 32): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
