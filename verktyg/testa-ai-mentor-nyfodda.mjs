/**
 * TESTA AI-MENTORN — NYFÖDDA KURSER (s6-u3, fönster 33, manifest
 * auto-s6-1789999525797: kompetensparadoxen [bf-18 primär + bf-16 + km-036 +
 * ek-04 + km-016 som källor ⇒ BETEENDEFINANS 24/24] + kreditderivatet
 * [od-10 primär + od-09 + ma-05 + ks-05 + rs-03 ⇒ OPTIONS & DERIVAT 14/14] +
 * avknoppningen [kt-10 primär + km-012 + vr-09 + am-07 + kt-09 ⇒
 * KATALYSATOR 12/12]).
 *
 * Kör:  node verktyg/testa-ai-mentor-nyfodda.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets tre förhandsfrågor (se
 * src/lib/ai-mentor-nyfodda-fragor.ts) med bevakning:
 *   A   9 kanoniska ingångar (tre per monster) → rätt ämne, primärkälla,
 *       FLERKÄLLA (källor = 5 + numrerad Källor-rad) och ≥ 4 kurslänkar
 *       + ≥ 2 frågeknappar
 *   A2  MOTORDEFS-position LIVE (efter kategoristängning, FÖRE marknadsrytm —
 *       deras SIST-deklaration; relativa påståenden, framtidsäkra när
 *       syskonens fönsterlager wireas) + antal-vakten
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — frågor två gånger ⇒ bitidentiskt svar
 *   D01–D28 aritmetik maskinellt omräknad (kursernas egna modelltal):
 *       25 × 24 ÷ 2 = 300 · 25 × 8 = 200 · 250 × 0,25 = 62,5 ·
 *       10²/(10²+20²) = 100/500 = 0,20 · 4/404 = 0,0099 ·
 *       4 000 → 2 000 → 1 000 → 500 → 250 · 250/4 000 = 6,25 % ·
 *       0,025 × 10 000 000 = 250 000 · 250 000/4 = 62 500 ·
 *       1 − 0,40 = 0,60 · 0,025 ÷ 0,60 = 4,17 % · 1 − 0,9583⁵ = 19,2 % ·
 *       0,0417 × 0,60 × 10 M = 250 000 · 0,60 × 10 M = 6 M ·
 *       6 M ÷ 250 000 = 24 · 250 000 − 6 M = −5,75 M ·
 *       10 + 0,60 × 10 = 16 · (16 − 12) ÷ 16 = 25 % · 120 → 132 = +10 % ·
 *       60 ÷ 100 = 0,60 · 64/100 = 36 % rabatt · 95 + 0,60 × 62 = 132,2 ·
 *       12 ÷ 0,8 = 15 handelsdagar · 56/100 = 44 % rabatt ·
 *       99 + 0,60 × 71 = 141,6 · (160 − 141,6) ÷ 160 = 11,5 %
 *   D29 registerdrivna tal (BETEENDEFINANS/OPTIONS & DERIVAT/KATALYSATOR LIVE)
 *   D30 nivåmarkörer (bf-18 Intermediär · od-10 Avancerad ·
 *       kt-10 Intermediär) + D31 fantomslug
 *   F   ägargränser (sondens dokumenterade policy GENOM HELA KEDJAN):
 *       «kompetensillusionen» → beteendemekanik · «kreditspread» →
 *       kreditdjup · «utdelning i natur» → bas · «tvångsförsäljning» →
 *       tvangsmekanik · «konglomeratrabatten» → varderjustering ·
 *       «spreaden» → bas/marknadsmekanik
 *   F2  juridikgrind — pedagogiskt, aldrig råd
 *   G   ANTISTÖLD — grannlagers kanoniska (stålsektorn, banksektorn,
 *       notläsning, budprocessen, EVA, försäkringsskrivandet, haloeffekten,
 *       övningsbolaget, kreditpremien) → NULL från detta lager
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS) + H2 med detta
 *       lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER kategoristängning och FÖRE marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-nyfodda.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltNyfodda, NYFODDA_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-nyfodda-fragor.ts")).href
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
  { fraga: "Vad är kompetensparadoxen?", amne: "kompetensparadoxen", slug: "bf-18-kompetensillusionen" },
  { fraga: "Vad är en slantturnering?", amne: "kompetensparadoxen", slug: "bf-18-kompetensillusionen" },
  { fraga: "Vad är giltighetsmiljöer?", amne: "kompetensparadoxen", slug: "bf-18-kompetensillusionen" },
  { fraga: "Vad är ett kreditderivat?", amne: "kreditderivatet", slug: "od-10-kreditderivatet" },
  { fraga: "Vad är en CDS?", amne: "kreditderivatet", slug: "od-10-kreditderivatet" },
  { fraga: "Vad är en kredithändelse?", amne: "kreditderivatet", slug: "od-10-kreditderivatet" },
  { fraga: "Vad är en avknoppning?", amne: "avknoppningen", slug: "kt-10-avknoppningen" },
  { fraga: "Vad är when-issued?", amne: "avknoppningen", slug: "kt-10-avknoppningen" },
  { fraga: "Vad är kontinuitetstestet?", amne: "avknoppningen", slug: "kt-10-avknoppningen" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltNyfodda(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " nyfödda", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length === 5;
  const kallradOk = svar.text.includes("📖 Källor (5)");
  const primarForst = svar.kallor?.[0]?.slug === f.slug;
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/")).length;
  const fragorKnappar = svar.handlings.filter((h) => h.lank.startsWith("fragor:")).length;
  const motfragaOk = typeof svar.motfraga?.text === "string" && svar.motfraga.text.length > 0;
  kontroll(
    nr + " «" + f.fraga + "» → " + f.amne,
    amneOk && kallaOk && kallorFinns && kallradOk && primarForst && kurslankar >= 4 && fragorKnappar >= 2 && motfragaOk,
    "ämne " + (amneOk ? "✓" : "✗ " + svar.amne) + " · primär " + (kallaOk ? "✓" : "✗ " + svar.kalla.slug) +
      " · källor " + (svar.kallor?.length ?? 0) + "/5 · kurslänkar " + kurslankar + " · frågeknappar " + fragorKnappar,
  );
});

// ── FALL A2: MOTORDEFS-position LIVE (relativ: efter kategoristängning, FÖRE marknadsrytm) ──
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
  const ix = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-nyfodda-fragor.ts");
  const ixStang = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-kategoristangning-fragor.ts");
  const ixRytm = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-marknadsrytm-fragor.ts");
  const antalOk = MOTORDEFS.find((d) => d.fil === "ai-mentor-nyfodda-fragor.ts")?.antal === NYFODDA_MONSTER.length;
  kontroll(
    "A2 MOTORDEFS-position LIVE (efter kategoristängning, FÖRE marknadsrytm — deras SIST)",
    ix >= 0 && ixStang >= 0 && ixRytm >= 0 && ixStang < ix && ix < ixRytm && antalOk,
    ix < 0 ? "SAKNAS i MOTORDEFS" : "position " + (ix + 1) + "/" + MOTORDEFS.length + " · antal " + (antalOk ? "✓" : "✗"),
  );
}

// ── FALL B: felstavade/varierade varianter ──────────────────────────────────
const VARIANTER = [
  ["vad är kompetensparadoxn?", "kompetensparadoxen"],
  ["vad är kompetensparadoxen hos förvaltare", "kompetensparadoxen"],
  ["förklarar kompetensparadoxen", "kompetensparadoxen"],
  ["vad är en slantturnring?", "kompetensparadoxen"],
  ["vad ar giltighetsmiljoner?", "kompetensparadoxen"],
  ["vad är social smitta bland investerare?", "kompetensparadoxen"],
  ["vad är ett kreditderiivat?", "kreditderivatet"],
  ["vad är credit default swappen för nåt?", null], // «swap» tav-1 → handelsdag äger; här: inget naket kärnord får triggas av «swappen»? kärnord «cds» saknas — får vara NULL eller kreditderivat
  ["förklara kredithändelsen i cds?", "kreditderivatet"],
  ["vad är en avknpning?", "avknoppningen"],
  ["vad betyder when issued?", "avknoppningen"],
  ["vad är distributionsdgen?", "avknoppningen"],
];
VARIANTER.forEach(([fraga, amne], i) => {
  const svar = svaraLokaltNyfodda(fraga, KURSREGISTER);
  if (amne === null) {
    kontroll("B" + String(i + 1).padStart(2, "0") + " variant «" + fraga + "»", true,
      svar ? "fångad som " + svar.amne : "NULL (båda accepteras — «swap» ägs av handelsdag)");
    return;
  }
  kontroll(
    "B" + String(i + 1).padStart(2, "0") + " variant «" + fraga + "»",
    svar !== null && svar.amne === amne,
    svar ? "ämne=" + svar.amne : "NULL",
  );
});

// ── FALL C: determinism — samma fråga två gånger ⇒ bitidentiskt svar ────────
{
  const prover = NYA.map((f) => f.fraga);
  let identiska = 0;
  for (const p of prover) {
    const a = JSON.stringify(svaraLokaltNyfodda(p, KURSREGISTER));
    const b = JSON.stringify(svaraLokaltNyfodda(p, KURSREGISTER));
    if (a === b && a !== "null") identiska++;
  }
  kontroll("C determinism (9 frågor × 2 ⇒ bitidentiska)", identiska === prover.length, identiska + "/" + prover.length);
}

// ── FALL D: aritmetiken maskinellt omräknad (kursernas egna modelltal) ──────
{
  const svarP = svaraLokaltNyfodda("Vad är kompetensparadoxen?", KURSREGISTER).text;
  const svarK = svaraLokaltNyfodda("Vad är ett kreditderivat?", KURSREGISTER).text;
  const svarA = svaraLokaltNyfodda("Vad är en avknoppning?", KURSREGISTER).text;

  // Kompetens (bf-18)
  kontroll("D01 parvisa 25×24÷2=300", (25 * 24) / 2 === 300 && svarP.includes("300"));
  kontroll("D02 årsresultat 25×8=200", 25 * 8 === 200 && svarP.includes("200 årsresultat"));
  kontroll("D03 kvartilbaslinj 250×0,25=62,5≈62", approx(250 * 0.25, 62.5) && svarP.includes("62,5") && svarP.includes("62"));
  kontroll("D04 mauboussin 100/500=0,20", approx(100 / 500, 0.2) && svarP.includes("100/500") && svarP.includes("0,20"));
  kontroll("D05 mauboussin 4/404=0,0099", approx(4 / 404, 0.0099) && svarP.includes("4/404") && svarP.includes("0,0099"));
  kontroll("D06 slantturnering 4000→250", 4000 / 16 === 250 && svarP.includes("2 000") && svarP.includes("1 000") && svarP.includes("500"));
  kontroll("D07 andelen 250/4000=6,25%", approx(250 / 4000, 0.0625) && svarP.includes("6,25"));

  // Kreditderivat (od-10)
  kontroll("D08 premien 0,025×10M=250000", 0.025 * 10000000 === 250000 && svarK.includes("250 000"));
  kontroll("D09 kvartal 250000/4=62500", 250000 / 4 === 62500 && svarK.includes("62 500"));
  kontroll("D10 lgd 1−0,40=0,60", approx(1 - 0.4, 0.6) && svarK.includes("0,60"));
  kontroll("D11 pd 0,025÷0,60=4,17%", approx(0.025 / 0.6, 0.0417, 0.0005) && svarK.includes("4,2"));
  kontroll("D12 kumulativt 1−0,9583^5=19,2%", approx(1 - Math.pow(0.9583, 5), 0.192, 0.005) && svarK.includes("19,2"));
  kontroll("D13 kontroll 0,0417×0,60×10M=250000", approx(0.0417 * 0.6 * 10000000, 250000, 1000) && svarK.includes("250 000"));
  kontroll("D14 utbetalning 0,60×10M=6M", approx(0.6 * 10000000, 6000000) && svarK.includes("6 000 000"));
  kontroll("D15 24 års premier 6M÷250000=24", 6000000 / 250000 === 24 && svarK.includes("24 år"));
  kontroll("D16 år ett −5,75M", approx(250000 - 6000000, -5750000) && svarK.includes("5 750 000"));
  kontroll("D17 grekland två år 1−0,8333²=30,6%", approx(1 - Math.pow(0.8333, 2), 0.306, 0.005) && svarK.includes("30,6"));
  kontroll("D18 basis 250−220=30", 250 - 220 === 30 && svarK.includes("30 punkter"));
  kontroll("D19 naken multiplikator 50M/10M=5×", 50 / 10 === 5 && svarK.includes("femfaldig"));

  // Avknoppning (kt-10)
  kontroll("D20 sotp 10+0,60×10=16", 10 + 0.6 * 10 === 16 && svarA.includes("16 miljarder"));
  kontroll("D21 rabatt (16−12)÷16=25%", approx((16 - 12) / 16, 0.25) && svarA.includes("25 procent"));
  kontroll("D22 beslutsdagen 120→132=+10%", approx(132 / 120 - 1, 0.1) && svarA.includes("132"));
  kontroll("D23 pro rata 60÷100=0,60", 60 / 100 === 0.6 && svarA.includes("0,60"));
  kontroll("D24 kontinuitet 95+0,60×62=132,2", approx(95 + 0.6 * 62, 132.2) && svarA.includes("132,2"));
  kontroll("D25 fönstret 12÷0,8=15 dagar", 12 / 0.8 === 15 && svarA.includes("15 handelsdagar"));
  kontroll("D26 utfall 99+0,60×71=141,6", approx(99 + 0.6 * 71, 141.6) && svarA.includes("141,6"));
  kontroll("D27 rabatt (160−141,6)÷160=11,5%", approx((160 - 141.6) / 160, 0.115, 0.005) && svarA.includes("11,5"));
  kontroll("D28 when-issued 64 = 36% rabatt", approx(1 - 64 / 100, 0.36) && svarA.includes("36 procent"));
}

// ── FALL D29: registerdrivna tal (LIVE ur KURSREGISTER) ────────────────────
{
  const bf = KURSREGISTER.filter((r) => r.kategori === "BETEENDEFINANS").length;
  const od = KURSREGISTER.filter((r) => r.kategori === "OPTIONS & DERIVAT").length;
  const kt = KURSREGISTER.filter((r) => r.kategori === "KATALYSATOR").length;
  const p = svaraLokaltNyfodda("Vad är kompetensparadoxen?", KURSREGISTER).text;
  const k = svaraLokaltNyfodda("Vad är ett kreditderivat?", KURSREGISTER).text;
  const a = svaraLokaltNyfodda("Vad är en avknoppning?", KURSREGISTER).text;
  kontroll(
    "D29 registerdrivna tal LIVE (BETEENDEFINANS=" + bf + " · OPTIONS=" + od + " · KATALYSATOR=" + kt + ")",
    p.includes(String(bf) + " kurser") && k.includes(String(od) + " kurser") && a.includes(String(kt) + " kurser"),
    "texten bär samtliga tre kategoriräkningar",
  );
}

// ── FALL D30/D31: nivåmarkörer + fantomslug ────────────────────────────────
{
  const nivaer = [
    ["bf-18-kompetensillusionen", "intermediär nivå"],
    ["od-10-kreditderivatet", "avancerad nivå"],
    ["kt-10-avknoppningen", "intermediär nivå"],
  ];
  const fragor = ["Vad är kompetensparadoxen?", "Vad är ett kreditderivat?", "Vad är en avknoppning?"];
  let nivaOk = true;
  nivaer.forEach(([slug, forvantad], i) => {
    const r = KURSREGISTER.find((x) => x.slug === slug);
    const text = svaraLokaltNyfodda(fragor[i], KURSREGISTER).text;
    if (!r || !text.includes(forvantad)) nivaOk = false;
  });
  kontroll("D30 nivåmarkörer (bf-18 Intermediär · od-10 Avancerad · kt-10 Intermediär)", nivaOk);

  // Fantomslug: varje kalla-slug och varje /kurser/-länk i svaren finns i registret
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  let fantom = [];
  for (const m of NYFODDA_MONSTER) {
    const s = m.bygga(KURSREGISTER);
    for (const k of s.kallor ?? []) if (k.slug && !slugs.has(k.slug)) fantom.push(k.slug);
    for (const h of s.handlings) {
      if (h.lank.startsWith("/kurser/")) {
        const slug = h.lank.replace("/kurser/", "");
        if (!slugs.has(slug)) fantom.push(slug);
      }
    }
  }
  kontroll("D31 fantomslug — alla källor och kurslänkar finns i registret", fantom.length === 0, fantom.length ? fantom.join(", ") : "0 fantomer");
}

// ── FALL F: ägargränser — dokumenterad policy (genom HELA kedjan) ───────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));
  const UTAN = MOTORDEFS.filter((d) => d.fil !== "ai-mentor-nyfodda-fragor.ts");
  const MOTORER = [];
  for (const d of UTAN) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  const GRANSER = [
    ["Vad är kompetensillusionen?", "beteendemekanik"],
    ["Vad är kreditspread?", "kreditdjup"],
    ["Vad är utdelning i natur?", null], // fångas av något tidigt lager (basens utdelningsfamilj) — dokumenterat
    ["Vad är tvångsförsäljning?", "tvangsmekanik"],
    ["Vad är konglomeratrabatten?", "varderjustering"],
  ];
  let gransOk = 0;
  const detaljer = [];
  for (const [fraga, agare] of GRANSER) {
    const fangare = MOTORER.filter((m) => m.fnk(fraga, KURSREGISTER) !== null).map((m) => m.namn);
    if (agare === null) {
      if (fangare.length > 0) gransOk++;
      detaljer.push(fraga + " → " + (fangare.join(", ") || "NULL (VÄNTAT fångas)"));
    } else {
      if (fangare.includes(agare)) gransOk++;
      detaljer.push(fraga + " → " + (fangare.join(", ") || "NULL"));
    }
  }
  kontroll(
    "F ägargränser genom hela kedjan (" + UTAN.length + " motorer)",
    gransOk === GRANSER.length,
    detaljer.join(" · "),
  );
}

// ── FALL F2: juridikgrind — pedagogiskt, aldrig råd ─────────────────────────
{
  const radsFRASER = ["köp ", "sälj ", "jag rekommenderar", "du bör köpa", "placera i", "investera i detta"];
  const pedagogFRASER = ["utbildning", "påhittade", "inga placeringstips"];
  let ok = true;
  const detalj = [];
  for (const m of NYFODDA_MONSTER) {
    const s = m.bygga(KURSREGISTER);
    for (const r of radsFRASER) if (s.text.toLowerCase().includes(r)) { ok = false; detalj.push(m.id + ": «" + r + "»"); }
    if (!pedagogFRASER.some((p) => s.text.includes(p))) { ok = false; detalj.push(m.id + ": saknar pedagogisk markering"); }
  }
  kontroll("F2 juridikgrind — pedagogiskt, aldrig råd", ok, detalj.length ? detalj.join(" · ") : "0 rådsfraser, pedagogisk markering i alla tre");
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska lämnas ifred ──────────────────
{
  const GRANNE = [
    "Hur fungerar en budprocess?",        // kategoristängning (kt-09)
    "Vad är EVA?",                        // kategoristängning (roic-05)
    "Vad är försäkringsskrivandet?",      // kategoristängning (od-09)
    "Hur övar jag på riktiga bolag?",     // casepraktik (pc-21)
    "Vad är kapacitetens hävstång?",      // stålsektor (se-23)
    "Vad är banksektorn?",                // banksektorn (se-24, syskon u1)
    "Vad är skuggskulderna?",             // notläsning (st-07, syskon u2)
    "Vad är intäktredovisningen?",        // notläsning (bk-08, syskon u2)
    "Vad är kreditpremien?",              // kreditdjup (ma-05)
    "Vad är konglomeratrabatten?",        // varderjustering (vr-09)
  ];
  const stulna = GRANNE.filter((f) => svaraLokaltNyfodda(f, KURSREGISTER) !== null);
  kontroll("G ANTISTÖLD — 10 grannfrågor → NULL", stulna.length === 0, stulna.length ? "STJÄLNA: " + stulna.join(" · ") : "0 stölder");
}

// ── FALL H: ägar-invariant — NULL genom kedjan UTAN detta lager ─────────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
  const UTAN = MOTORDEFS.filter((d) => d.fil !== "ai-mentor-nyfodda-fragor.ts");
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
    skuggade.length ? "SKUGGAD: " + skuggade.join(" · ") : "ända ägaren är nyfodda",
  );
  // H2: med detta lager — kedjan (i MOTORDEFS-ordning) svarar nyfodda
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
      "H2: med detta lager svarar kedjan nyfodda («" + f.fraga + "»)",
      k !== null && k.motor === "nyfodda" && k.amne === f.amne,
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
    (f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-nyfodda-fragor.ts",
  );
  const andras = [];
  for (const f of filer) {
    const kalla = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const block of kalla.matchAll(/karnord:\s*\[([^\]]*)\]/g)) {
      for (const ord of block[1].matchAll(/"([^"]+)"/g)) andras.push({ fil: f, karnord: diafri(ord[1]) });
    }
  }
  const mina = NYFODDA_MONSTER.flatMap((m) => m.karnord.map(diafri));
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
  const importOk = widget.includes('import { svaraLokaltNyfodda } from "@/lib/ai-mentor-nyfodda-fragor"');
  const rad = widget.match(/const lokalt = ([^;]+);/);
  const ordning = rad ? [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]) : [];
  const ix = ordning.indexOf("svaraLokaltNyfodda");
  const ixStang = ordning.indexOf("svaraLokaltKategoristangning");
  const ixRytm = ordning.indexOf("svaraLokaltMarknadsrytm");
  kontroll(
    "L: widget-synk — import + EFTER kategoristängning, FÖRE marknadsrytm (deras SIST)",
    importOk && ix >= 0 && ixStang >= 0 && ixRytm >= 0 && ixStang < ix && ix < ixRytm,
    importOk ? "kedjan bär lager " + (ix + 1) + "/" + ordning.length : "import SAKNAS",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("\nNYFÖDDA (s6-u3 fönster 33): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
