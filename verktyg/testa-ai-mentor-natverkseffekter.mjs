/**
 * TESTA AI-MENTORN — NÄTVERKSEFFEKTERNA (s6-u1 v2, omgång 35: nätverkets
 * ekonomi [v15 primär + mt-01 + mt-02 + mt-03 + mt-05 + mt-07 + mt-08 som
 * källor] — Metcalfes kraftlag, direkta och indirekta nätverk, den tvåsidiga
 * marknaden, vinnaren-tar-mest, moat-läsningen, nätverksprotokollet —
 * KATEGORISTÄNGNING MOAT 11/11 + AKM1:S SISTA VARIABELKURS: med V15 är
 * ALLA tjugo variabelkurser V01–V20 mentorlänkade).
 *
 * Kör:  node verktyg/testa-ai-mentor-natverkseffekter.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för nätverkseffektens förhandsfråga (se
 * src/lib/ai-mentor-natverkseffekter-fragor.ts) med bevakning:
 *   A   2 kanoniska ingångar (nätverkseffekter/metcalfe) → rätt ämne,
 *       primärkälla, FLERKÄLLA (kallor = 7 + numrerad Källor-rad) och
 *       ≥ 8 kurslänkar + 2 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter enhetsekonomi, FÖRE marknadsrytm —
 *       deras SIST-deklaration); A2b monster-antal + syskon-tåligt
 *       TOTALT-tak
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D12 aritmetik maskinellt omräknad (Metcalfes kraftlag n(n−1)/2:
 *       45 · 190 · 4 950 · 499 500 · 1 999 000 kopplingar · tvåsidiga
 *       marknaden 200 × 800 = 160 000 mot 400 × 400, flaskhalsen dubblad
 *       400 × 800 = 320 000 · Metcalfe-klyftan (1,0/0,5)² = 4:1 →
 *       (1,05/0,45)² ≈ 5,4:1 · tätheten 96/120 = 0,80 mot 30/120 = 0,25 ·
 *       avgiftstaket 1 % × 320 000 × 500 = 1,6 Mkr) + gränsvakter i TEXT
 *       + registerdrivna kontroller (MOAT-antal LIVE, nivåmarkör) +
 *       fantomslug
 *   E   kanoniska extra-ingångar (nätverkseffekten, metcalfe, metcalfes
 *       lag, tvåsidig marknad, tvåsidiga marknaden, nätverksmoat,
 *       nätverksvärdet, vinnaren tar allt, kraftlagen, nätverkets
 *       täthet, databasnätverket, direkt nätverk …)
 *   F   null-gränser (dokumenterad ägarpol): «moat»/«vallgraven» →
 *       moatdjup + basen · «moat-erosion»/«vallgravstestet» → mt-02 ·
 *       «vallgraven i siffror» → mt-03 · «byteskostnader»/«inlåsning» →
 *       mt-05 · «prisfullmakten» → mt-07 · «kostnadsöverlägsenhet» →
 *       mt-06 · «kvalitetspremien» → mt-08 · naket «nätverk» →
 *       sektorskola2:s starkord · naket «plattform»/«ekosystem» →
 *       ekosystemdjup — lämnas ifred av detta lager
 *   F2  juridikgrind — pedagogisk text, PÅHITTAD-markör, inga råd
 *   G   ANTISTÖLD — grannlagers kanoniska inklusive FÖNSTRETS SYSKON:
 *       enhetsekonomi ("vad är enhetsekonomin?/konverteringstestet?") och
 *       s6-u3:s slutstenar ("vad är banklönsamheten?/cvar?/
 *       krischecklistan?") ⇒ NULL hos mig
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta
 *       lager (motorlistan läses LIVE ur kedjetestets MOTORDEFS) + H2
 *       med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE (kommentar-strippad — v1-sondens läxa)
 *   L   widget-synk — import + EFTER enhetsekonomi och FÖRE marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-natverkseffekter.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltNatverkseffekter, NATVERKSEFFEKT_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-natverkseffekter-fragor.ts")).href
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

// ── FALL A: två kanoniska ingångar, ett monster, flerkällskrav ──────────────
// OBS titel-frågan «vad är nätverkseffekter?» ägs i HELA kedjan av basens
// DATADRIVNA variabelSvar (variabelNyckelord: slug-stam + titelord ur
// registret — genererade kärnord syns aldrig i statiska sonder; översikt+
// djup-precedensen som se-24 mot km-040): basens översikt vinner på
// titelordet, detta lager äger DJUPET — därför är A-kanonerna DE fria
// djupfrågorna (H-fallet bevisar NULL genom kedjan för var och en).
const NYA = [
  { fraga: "Vad är metcalfes lag?", amne: "nätverkseffekter", slug: "v15-natverkseffekter" },
  { fraga: "Vad är en tvåsidig marknad?", amne: "nätverkseffekter", slug: "v15-natverkseffekter" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltNatverkseffekter(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " nätverkseffekter", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length === 7;
  const kallradOk = svar.text.includes("📖 Källor (7)");
  const primarForst = svar.kallor?.[0]?.slug === f.slug;
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/")).length;
  const fragorKnappar = svar.handlings.filter((h) => h.lank.startsWith("fragor:")).length;
  kontroll(
    nr + " kanonisk ingång «" + f.fraga + "»",
    amneOk && kallaOk && kallorFinns && kallradOk && primarForst && kurslankar >= 8 && fragorKnappar >= 2,
    "ämne=" + svar.amne + " · primär=" + svar.kalla.slug + " · källor=" + (svar.kallor?.length ?? 0) +
      " · kurslänkar=" + kurslankar + " · fragor-knappar=" + fragorKnappar,
  );
});

// ── FALL A2: MOTORDEFS-position LIVE ur kedjetestet ─────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const ix = defs.findIndex((d) => d.namn === "natverkseffekter");
  const ixEnhet = defs.findIndex((d) => d.namn === "enhetsekonomi");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2 MOTORDEFS — natverkseffekter wiread med antal 1, index " + ix,
    ix !== -1 && defs[ix].antal === 1 && ixEnhet !== -1 && ixRytm !== -1 && ixEnhet < ix && ix < ixRytm,
    "efter enhetsekonomi (" + ixEnhet + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer totalt " + defs.length,
  );
  kontroll(
    // Omgång 35: natverkseffekter +1 (detta lager) ⇒ 219 — syskon-tåligt
    // tak: MINST 219; senare fönsters motorer (s6-u3:s slutstenar +3)
    // bärs av sina egna leveranser. Kedjetestets TOTALT-kommentar är
    // sanningen.
    "A2b MONSTER-ANTAL — lagret bär exakt 1 monster (TOTALT ≥ 219)",
    NATVERKSEFFEKT_MONSTER.length === 1 && defs.reduce((s, d) => s + d.antal, 0) >= 219,
    "lager " + NATVERKSEFFEKT_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är nätverkseffekt?", amne: "nätverkseffekter" },       // singular exakt
  { fraga: "vad är nätverkseffekten?", amne: "nätverkseffekter" },     // bestämd form
  { fraga: "vad är natverkseffekter?", amne: "nätverkseffekter" },     // utan diakrit (normaliseras)
  { fraga: "vad är metcalfe?", amne: "nätverkseffekter" },
  { fraga: "vad är metcalfes?", amne: "nätverkseffekter" },
  { fraga: "vad är en tvåsidig marknad?", amne: "nätverkseffekter" },  // obestämd fras
  { fraga: "vad är tvåsidiga marknaden?", amne: "nätverkseffekter" },  // bestämd fras
  { fraga: "vad är nätverksmoat?", amne: "nätverkseffekter" },
  { fraga: "vad är nätverksvärdet?", amne: "nätverkseffekter" },
  { fraga: "vad betyder vinnaren tar allt?", amne: "nätverkseffekter" }, // klassisk formulering
  { fraga: "vad är databasnätverket?", amne: "nätverkseffekter" },
  { fraga: "vad är nätverkets täthet?", amne: "nätverkseffekter" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltNatverkseffekter(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är nätverkseffekter?", "vad är metcalfes lag?", "vad är en tvåsidig marknad?",
    "vad är nätverksvärdet?", "vad är metcalfe?", "vad är nätverkets täthet?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltNatverkseffekter(f, KURSREGISTER);
    const b = svaraLokaltNatverkseffekter(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (kursens EGNA modelltal) ──────────
{
  const t1 = NATVERKSEFFEKT_MONSTER[0].bygga(KURSREGISTER).text;
  kontroll(
    "D01 metcalfes kraftlag",
    (10 * 9) / 2 === 45 && (20 * 19) / 2 === 190 && (100 * 99) / 2 === 4950 &&
      (1000 * 999) / 2 === 499500 && (2000 * 1999) / 2 === 1999000 &&
      t1.includes("n(n−1)/2") && t1.includes("45") && t1.includes("190") &&
      t1.includes("4 950") && t1.includes("499 500") && t1.includes("1 999 000"),
    "10/20/100/1 000/2 000 användare ⇒ 45/190/4 950/499 500/1 999 000 kopplingar",
  );
  kontroll(
    "D02 dubbla folk = fyrdubbla kopplingar",
    (20 * 19) / (10 * 9) === 190 / 45 && t1.includes("FYRDUBBLA kopplingar") && t1.includes("fyra gånger folk ger SEXTON gånger kopplingar"),
    "20/10 = 2× folk ⇒ 190/45 ≈ 4,2× kopplingar · 2 000/500: 16× (kraftlagen)",
  );
  kontroll(
    "D03 tvåsidiga marknaden — S × K",
    200 * 800 === 160000 && 400 * 400 === 160000 && 400 * 800 === 320000 &&
      t1.includes("200 säljare möter 800 köpare = 160 000") && t1.includes("400 säljare och 400 köpare = också 160 000") && t1.includes("400 × 800 = 320 000"),
    "200 × 800 = 160 000 mot 400 × 400 = 160 000 — flaskhalsen dubblad ⇒ 320 000",
  );
  kontroll(
    "D04 metcalfe-klyftan och flykten",
    (1.0 / 0.5) ** 2 === 4 && approx((1.05 / 0.45) ** 2, 5.44, 0.02) &&
      t1.includes("4:1") && t1.includes("5,4:1") && t1.includes("B 0,50 → 0,45") && t1.includes("A 1,00 → 1,05"),
    "(1,0/0,5)² = 4:1 → (1,05/0,45)² ≈ 5,4:1 efter ett års 10 %-flykt",
  );
  kontroll(
    "D05 tätheten",
    approx(96 / 120, 0.8, 0.001) && approx(30 / 120, 0.25, 0.001) &&
      t1.includes("96 av 120") && t1.includes("0,80") && t1.includes("30 inne") && t1.includes("0,25"),
    "96/120 = 0,80 mot 30/120 = 0,25 — tätheten, inte antalet, avgör moaten",
  );
  kontroll(
    "D06 avgiftstaket",
    320000 * 0.01 * 500 === 1600000 && t1.includes("1 procent på 320 000 möten à 500 kronor = 1,6 Mkr"),
    "1 % × 320 000 × 500 = 1,6 Mkr — prisfullmaktens tak",
  );
  kontroll(
    "D07 gränsvakter i TEXT",
    ["mt-01", "mt-02", "mt-03", "mt-05", "mt-07", "mt-08", "sektorskola2", "V16"].every((g) => t1.includes(g)),
    "dokumenterade gränser bärs i text med attribution (familjen + betalningsöversikten + grannvariabeln)",
  );
  // D08–D09: registerdrivet — kategoriantal och nivå LIVE.
  const moatAntal = KURSREGISTER.filter((r) => r.kategori === "MOAT").length;
  kontroll(
    "D08 registerdrivet kategoriantal",
    moatAntal > 0 && t1.includes("I kategorin moat finns " + moatAntal + " kurser"),
    "MOAT = " + moatAntal + " LIVE ur KURSREGISTER (kategoristängningen = detta tal)",
  );
  const v15 = KURSREGISTER.find((r) => r.slug === "v15-natverkseffekter");
  kontroll(
    "D09 nivåmarkör + variabelmarkör",
    !!v15 && v15.niva === "Avancerad" && t1.includes("avancerad nivå") && v15.variabel === "V15" && t1.includes("V15"),
    "v15 = " + (v15 ? v15.niva + " · " + v15.variabel : "?") + " (registerdrivet, LIVE)",
  );
  // D10: kurslänkarnas slug:ar — alla äkta mot registret.
  const svaret = NATVERKSEFFEKT_MONSTER[0].bygga(KURSREGISTER);
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const kursSlugs = svaret.handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", ""));
  const fantomer = [...kursSlugs, ...svaret.kallor.map((k) => k.slug).filter(Boolean)].filter((s) => !slugSet.has(s));
  kontroll("D10 fantomslug", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : (kursSlugs.length + svaret.kallor.length) + " äkta slug:ar");
  // D11: kurslänkar ≥ 8 och fragor-knappar ≥ 2 (spårets källmärkningskrav).
  kontroll(
    "D11 källmärkning — ≥ 8 kurslänkar + ≥ 2 fragor-knappar",
    kursSlugs.length >= 8 && svaret.handlings.filter((h) => h.lank.startsWith("fragor:")).length >= 2,
    kursSlugs.length + " kurslänkar · " + svaret.handlings.filter((h) => h.lank.startsWith("fragor:")).length + " fragor-knappar",
  );
  kontroll(
    "D12 motfråga + fördjupning",
    svaret.motfraga?.text === "Vad är en moat?" && svaret.fordjupa?.lank === "/kurser/v15-natverkseffekter",
    "motfråga till familjens grund · fördjupa = primärkursen",
  );
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är nätverkseffekt?", "vad är nätverkseffekten?", "vad är nätverkseffektens ekonomi?",
    "vad är metcalfe?", "vad är metcalfes lag?", "vad är metcalfes?",
    "vad är en tvåsidig marknad?", "vad är tvåsidiga marknaden?",
    "vad är nätverksmoat?", "vad är nätverksvärde?", "vad är nätverksvärdet?",
    "vad betyder vinnaren tar allt?", "vad betyder vinnaren tar mest?",
    "vad är kraftlagen?", "vad är nätverkets täthet?", "vad är databasnätverket?",
    "vad är direkt nätverk?", "vad är indirekt nätverk?",
    "vad är direkta nätverket?", "vad är indirekta nätverket?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltNatverkseffekter(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är en moat?",           // moatdjup + basen (mt-01:s familjord)
    "vad är moat-erosion?",      // mt-02:s ägande
    "vad är vallgraven?",        // moatdjup/basens
    "vad är vallgraven i siffror?", // mt-03:s
    "vad är byteskostnader?",    // mt-05:s
    "vad är inlåsning?",         // mt-05:s
    "vad är prisfullmakten?",    // mt-07:s
    "vad är kostnadsöverlägsenhet?", // mt-06:s
    "vad är kvalitetspremien?",  // mt-08:s
    "vad är nätverk?",           // naket — sektorskola2:s starkord, aldrig ämne här
    "vad är ekosystem?",         // ekosystemdjupet
    "vad är enhetsekonomin?",    // fönstrets syskon (s6-u2)
    "vad är V15?",               // basens DATADRIVNA variabelSvar-översikt (deras)
  ];
  const stulna = gransor.filter((f) => svaraLokaltNatverkseffekter(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2: juridikgrind — pedagogisk text, aldrig rekommendation ──────────
{
  const t = NATVERKSEFFEKT_MONSTER[0].bygga(KURSREGISTER).text;
  const paddagogisk = t.includes("utbildning") && t.includes("inga placeringstips");
  const pahittade = t.includes("påhittad");
  const ingaRad = !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t);
  kontroll("F2 juridikgrind", paddagogisk && pahittade && ingaRad, "pedagogisk + påhittade värden + 0 rådsformuleringar");
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL hos detta lager ────────
{
  const grannar = [
    "vad är enhetsekonomin?", "vad är konverteringstestet?", // fönstrets syskon (s6-u2)
    "vad är banklönsamheten?", "vad är mätningsbytet?",      // s6-u3:s slutstenar
    "vad är cvar?", "vad är väntat fall i svansen?",         // slutstenarnas rp-07
    "vad är krischecklistan?", "vad är korrelationsfallet?", // slutstenarnas pf-07
    "vad är walk forward?", "vad är valideringsfönstret?",   // valideringsfonster
    "vad är senioritetsordningen?", "vad är valutasäkringen?", // skuldordning
    "vad är korrelationsrisken?", "vad är en bullmarknad?",  // marknadsrytm (SIST-grannen)
    "vad är en moat?",                                        // moatdjup + basen
  ];
  const stulna = grannar.filter((f) => svaraLokaltNatverkseffekter(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "natverkseffekter");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är metcalfes lag?", "vad är en tvåsidig marknad?",
    "vad är nätverkets täthet?", "vad betyder vinnaren tar allt?", "vad är databasnätverket?",
    "vad är kraftlagen?",
  ];
  const skuggor = [];
  for (const f of kanoniska) {
    for (const m of MOTORER) {
      if (m.fnk(f, KURSREGISTER) !== null) skuggor.push(f + " (" + m.namn + ")");
    }
  }
  kontroll(
    "H utan lager — samtliga " + kanoniska.length + " kanoniska NULL genom " + MOTORER.length + " motorer (LIVE)",
    skuggor.length === 0,
    skuggor.length ? "SKUGGAD: " + skuggor.join(", ") : "0 skuggor — territoriet var fritt (sond + kärnordsdisjunktion bevis)",
  );
  const svarar = kanoniska.map((f) => svaraLokaltNatverkseffekter(f, KURSREGISTER) !== null);
  kontroll("H2 med lager — samtliga kanoniska svarar", svarar.every(Boolean), svarar.filter(Boolean).length + "/" + svarar.length);
}

// ── FALL J: KÄRNORDSDISJUNKTION LIVE (kommentar-strippad) ───────────────────
{
  function diafri(s) {
    return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim()
      .normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  }
  function tavstand(a, b) {
    if (a === b) return 0;
    const n = a.length, m = b.length;
    if (!n) return m; if (!m) return n;
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
  const mina = NATVERKSEFFEKT_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-natverkseffekter-fragor.ts",
  );
  const kollisioner = [];
  for (const fil of filer) {
    const rader = readFileSync(join(ROT, "src/lib", fil), "utf8").split("\n");
    const kod = rader.filter((r) => !r.trim().startsWith("//")).join("\n");
    for (const block of kod.matchAll(/karnord: \[([^\]]+)\]/g)) {
      for (const om of block[1].matchAll(/"([^"]+)"/g)) {
        const a = diafri(om[1]);
        for (const b of mina) {
          if (a === b) { kollisioner.push(fil + "«" + om[1] + "» = «" + b + "»"); continue; }
          if (a.includes(" ") || b.includes(" ")) continue;
          const tolerans = Math.max(a.length, b.length) <= 3 ? 0 : (Math.min(a.length, b.length) <= 7 ? 1 : 2);
          const d = tavstand(a, b);
          if (d <= Math.min(tolerans, 2) && a !== b) kollisioner.push("tav " + d + ": " + fil + "«" + om[1] + "» ~ «" + b + "»");
        }
      }
    }
  }
  kontroll("J kärnordsdisjunktion — " + mina.length + " kärnord mot " + filer.length + " andra lager (kommentar-strippat)", kollisioner.length === 0, kollisioner.length ? kollisioner.slice(0, 5).join(" | ") : "0 kollisioner");
}

// ── FALL L: widget-synk — import + kedjeposition ────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rader = widget.split("\n").filter((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const FEL = [];
  if (rader.length !== 1) FEL.push("hittade " + rader.length + " kedjerader (väntat exakt 1)");
  const rad = rader[0] ?? "";
  const posEnhet = rad.indexOf("svaraLokaltEnhetsekonomi(");
  const posMin = rad.indexOf("svaraLokaltNatverkseffekter(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("natverkseffekter saknas i kedjeraden");
  if (posEnhet === -1 || posMin === -1 || posRytm === -1 || !(posEnhet < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat enhetsekonomi < natverkseffekter < marknadsrytm)");
  if (rad.includes("svaraLokaltKrishantering(")) FEL.push("kasserade krishanterings-anropet finns kvar i kedjeraden");
  if (!widget.includes('from "@/lib/ai-mentor-natverkseffekter-fragor"')) FEL.push("importen saknas");
  if (widget.includes('from "@/lib/ai-mentor-krishantering-fragor"')) FEL.push("kasserade krishanterings-importen finns kvar");
  kontroll(
    "L widget-synk — efter enhetsekonomi, FÖRE marknadsrytm (deras SIST) · 0 krishanterings-rester",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "85:e motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u1 omgång 35 (nätverkseffekter v2 — KATEGORISTÄNGNING MOAT 11/11 + AKM1:s SISTA VARIABELKURS): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
