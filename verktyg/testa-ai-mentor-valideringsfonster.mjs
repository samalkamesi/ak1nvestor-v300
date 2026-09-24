/**
 * TESTA AI-MENTORN — VALIDERINGSFÖNSTRET (s6-u1 v2, omgång 34:
 * walk-forward [ek-07 primär + ek-04 + ek-05 + ek-06 + ek-03 + ek-01 +
 * ek-02 + bf-18 som källor] — labbets valideringsdisciplin: det rullande
 * fönstret, effektivitetsmåttet, slumphärfånget, platån och nåltoppen).
 *
 * Kör:  node verktyg/testa-ai-mentor-valideringsfonster.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets förhandsfråga (se
 * src/lib/ai-mentor-valideringsfonster-fragor.ts) med bevakning:
 *   A   2 kanoniska ingångar (walk forward/valideringsfönstret) → rätt
 *       ämne, primärkälla, FLERKÄLLA (kallor = 8 + numrerad Källor-rad)
 *       och ≥ 8 kurslänkar + 2 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter skuldordning, FÖRE marknadsrytm —
 *       deras SIST-deklaration); A2b monster-antal + syskon-tåligt
 *       TOTALT-tak
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D15 aritmetik maskinellt omräknad (fönstren (20 − 8) / 2 = 6 ·
 *       12 disjunkta prövningsår · 7,8/12 = 0,65 · 3,4/4,0 = 0,85 ·
 *       3,0/11 = 0,27 · trösklarna 0,50/0,70 · härfången 121 ⇒ +9,6 %
 *       (2,40σ) och 343 ⇒ +8,3 % (2,76σ) · platåsekvenserna · medianen
 *       12,5 på tunnaste 9 med kravet ≥ 10 · utmaningen (24 − 10) / 2
 *       = 7 och 9/15 = 0,60) + gränsvakter i TEXT + registerdrivna
 *       kontroller (EKOSYSTEM-antal LIVE, nivåmarkör) + fantomslug
 *   E   kanoniska extra-ingångar (träningsfönstret, det rullande
 *       fönstret, rullande ursprungsvalidering, fönsterantalet,
 *       främlingsprovet, härfånget, nåltoppen, platån, gränszonten,
 *       parameterplanen, walkforward …)
 *   F   null-gränser (dokumenterad ägarpol): «backtesten»/«monte carlo»
 *       → ekosystemdjupet · «standardavvikelsen» → riskmåttsdjupet ·
 *       «överanpassning»/«kurvanpassning» → ek-04:s deklarerade ägande
 *       (bärs här i TEXT) · «SAM-viktningen» → ek-01:s · «AKM2»/«Pardo»
 *       → TEXT — lämnas ifred av detta lager
 *   F2  juridikgrind — pedagogisk text, PÅHITTAD-markör, inga råd
 *   G   ANTISTÖLD — grannlagers kanoniska inkl. FÖNSTRETS SYSKON:
 *       nykull ("vad är ränteswapen?/produktionsgapet?/bindningsrisken?")
 *       och skuldordning ("vad är senioritetsordningen?/valutasäkringen?")
 *       ⇒ NULL hos mig
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta
 *       lager (motorlistan läses LIVE ur kedjetestets MOTORDEFS) + H2
 *       med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE (kommentar-strippad — v1-sondens läxa)
 *   L   widget-synk — import + EFTER skuldordning och FÖRE marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-valideringsfonster.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltValideringsfonster, VALIDERINGSFONSTER_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-valideringsfonster-fragor.ts")).href
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
const NYA = [
  { fraga: "Vad är walk forward?", amne: "walk forward", slug: "ek-07-walk-forward-i-motorn" },
  { fraga: "Vad är valideringsfönstret?", amne: "walk forward", slug: "ek-07-walk-forward-i-motorn" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltValideringsfonster(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " walk forward", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length === 8;
  const kallradOk = svar.text.includes("📖 Källor (8)");
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
  const ix = defs.findIndex((d) => d.namn === "valideringsfonster");
  const ixSkuld = defs.findIndex((d) => d.namn === "skuldordning");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2 MOTORDEFS — valideringsfonster wiread med antal 1, index " + ix,
    ix !== -1 && defs[ix].antal === 1 && ixSkuld !== -1 && ixRytm !== -1 && ixSkuld < ix && ix < ixRytm,
    "efter skuldordning (" + ixSkuld + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer totalt " + defs.length,
  );
  kontroll(
    // Omgång 34: valideringsfonster +1 (detta lager) ⇒ 216 — syskon-tåligt
    // tak: MINST 216; senare fönsters motorer bärs av sina egna leveranser.
    // Kedjetestets TOTALT-kommentar är sanningen.
    "A2b MONSTER-ANTAL — lagret bär exakt 1 monster (TOTALT ≥ 216)",
    VALIDERINGSFONSTER_MONSTER.length === 1 && defs.reduce((s, d) => s + d.antal, 0) >= 216,
    "lager " + VALIDERINGSFONSTER_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är walkforward?", amne: "walk forward" },            // sammanskriven
  { fraga: "vad är walk-forward?", amne: "walk forward" },           // med bindestreck (normaliseras till frasen)
  { fraga: "vad är walk forward effektiviteten?", amne: "walk forward" },
  { fraga: "vad är träningsfönstret?", amne: "walk forward" },
  { fraga: "vad är det rullande fönstret?", amne: "walk forward" },
  { fraga: "vad är rullande fönster?", amne: "walk forward" },       // utan artikeln
  { fraga: "vad är slumphärfånget?", amne: "walk forward" },
  { fraga: "vad är härfånget?", amne: "walk forward" },
  { fraga: "vad är nåltoppen?", amne: "walk forward" },
  { fraga: "vad är en nåltopp?", amne: "walk forward" },
  { fraga: "vad är platån?", amne: "walk forward" },
  { fraga: "vad är parameterplanen?", amne: "walk forward" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltValideringsfonster(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är walk forward?", "vad är valideringsfönstret?", "vad är träningsfönstret?",
    "vad är slumphärfånget?", "vad är nåltoppen?", "vad är effektivitetsmåttet?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltValideringsfonster(f, KURSREGISTER);
    const b = svaraLokaltValideringsfonster(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (kursens EGNA modelltal) ──────────
{
  const t1 = VALIDERINGSFONSTER_MONSTER[0].bygga(KURSREGISTER).text;
  kontroll("D01 fönsterräkningen", (20 - 8) / 2 === 6 && t1.includes("(20 − 8) / 2 = sex fönster"), "(20 − 8) / 2 = 6 fönster");
  kontroll("D02 disjunkta prövningsår", 6 * 2 === 12 && t1.includes("tolv år"), "sex valideringspar × två år = tolv prövade år");
  kontroll("D03 effektiviteten", approx(7.8 / 12, 0.65, 0.005) && t1.includes("7,8") && t1.includes("0,65"), "7,8 / 12 = 0,65 (gränszont)");
  kontroll("D04 robust men svag", approx(3.4 / 4.0, 0.85, 0.005) && t1.includes("0,85") && t1.includes("robust men svag"), "3,4 / 4,0 = 0,85 — robust men svag");
  kontroll("D05 minnet med diagnos", approx(3.0 / 11, 0.2727, 0.001) && t1.includes("0,27"), "3,0 / 11 = 0,27 — minne");
  kontroll("D06 trösklarna", t1.includes("0,50") && t1.includes("0,70") && t1.includes("gränszont"), "under 0,50 minne · 0,50–0,70 gränszont · över 0,70 robust");
  kontroll("D07 härfånget 121", 11 * 11 === 121 && approx(2.4 * 4, 9.6, 0.05) && t1.includes("121") && t1.includes("9,6") && t1.includes("2,40"), "11 × 11 = 121 · 2,40σ × 4 % = +9,6 %");
  kontroll("D08 härfånget 343", 7 * 7 * 7 === 343 && approx(2.76 * 3, 8.28, 0.05) && t1.includes("343") && t1.includes("8,3") && t1.includes("2,76"), "7³ = 343 · 2,76σ × 3 % = +8,3 %");
  kontroll(
    "D09 platån och spelsekvenserna",
    t1.includes("14, 14, 12, 14, 13 och 14") && t1.includes("3, 14, 5, 14, 2 och 14") && t1.includes("13 och 15"),
    "stabil platå mot instabil nåltopp — grannvärdena 13/15 nära 14",
  );
  kontroll(
    "D10 affärerna och medianen",
    approx((12 + 13) / 2, 12.5, 0.001) && t1.includes("12, 14, 9, 15, 11 och 13") && t1.includes("12,5") && t1.includes("nio affärer") && t1.includes("tio affärer per fönster"),
    "median 12,5 · tunnaste 9 · krav ≥ 10 per fönster",
  );
  kontroll("D11 utmaningens räkningar", (24 - 10) / 2 === 7 && approx(9 / 15, 0.6, 0.005) && t1.includes("(24 − 10) / 2 = sju") && t1.includes("0,60"), "(24 − 10) / 2 = 7 fönster · 9/15 = 0,60");
  kontroll(
    "D12 gränsvakter i TEXT",
    ["överanpassningens mekanik", "monte carlo-kursen", "loggboken", "SAM-viktningen", "standardavvikelsen", "AKM2", "Brock", "Pardo", "Graham", "ekosystemfamiljen"].every((g) => t1.includes(g)),
    "dokumenterade gränser bärs i text med attribution",
  );
  // D13–D14: registerdrivet — kategoriantal och nivå LIVE.
  const ekAntal = KURSREGISTER.filter((r) => r.kategori === "EKOSYSTEM").length;
  kontroll(
    "D13 registerdrivet kategoriantal",
    ekAntal > 0 && t1.includes("I kategorin ekosystem finns " + ekAntal + " kurser"),
    "EKOSYSTEM = " + ekAntal + " LIVE ur KURSREGISTER",
  );
  const ek07 = KURSREGISTER.find((r) => r.slug === "ek-07-walk-forward-i-motorn");
  kontroll(
    "D14 nivåmarkör",
    !!ek07 && ek07.niva === "Avancerad" && t1.includes("avancerad nivå"),
    "ek-07 = " + (ek07 ? ek07.niva : "?") + " (registerdrivet, LIVE)",
  );
  // D15: kurslänkarnas slug:ar — alla äkta mot registret.
  const svaret = VALIDERINGSFONSTER_MONSTER[0].bygga(KURSREGISTER);
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const kursSlugs = svaret.handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", ""));
  const fantomer = [...kursSlugs, ...svaret.kallor.map((k) => k.slug).filter(Boolean)].filter((s) => !slugSet.has(s));
  kontroll("D15 fantomslug", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : (kursSlugs.length + svaret.kallor.length) + " äkta slug:ar");
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är valideringsfönster?", "vad är träningsfönster?", "vad är träningsfönstret?",
    "vad är effektivitetsmåttet?", "vad är rullande ursprungsvalidering?",
    "vad är fönsterantalet?", "vad är ett främlingsprov?", "vad är härfång?",
    "vad är en platå?", "vad är gränszonten?", "vad är parameterplan?",
    "vad är walkforward?", "vad är walk forward effektiviteten?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltValideringsfonster(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är backtesten?",        // ekosystemdjupet (ek-04:s kärnord)
    "vad är monte carlo?",       // ekosystemdjupet (ek-05:s kärnord)
    "vad är en backtest?",       // «backtest» är STARKORD här — kan aldrig svara ensamt
    "vad är standardavvikelsen?", // riskmåttsdjupets
    "vad är överanpassning?",    // ek-04:s deklarerade ägande (bärs här i TEXT)
    "vad är kurvanpassning?",    // d:o
    "vad är SAM-viktningen?",    // ek-01:s territorium (KÄLLA här — aldrig ämne)
    "vad är priorn?",            // ek-01:s
    "vad är en bayesiansk omviktning?", // ek-06:s (KÄLLA här)
    "vad är loggboken?",         // ek-03:s (KÄLLA här)
    "vad är AKM2?",              // TEXT-hänvisning (starkord — aldrig ämne)
    "vad är Pardo?",             // historia i TEXT (starkord)
  ];
  const stulna = gransor.filter((f) => svaraLokaltValideringsfonster(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2: juridikgrind — pedagogisk text, aldrig rekommendation ──────────
{
  const t = VALIDERINGSFONSTER_MONSTER[0].bygga(KURSREGISTER).text;
  const paddagogisk = t.includes("utbildning") && t.includes("inga placeringstips");
  const pahittade = t.includes("påhittad");
  const ingaRad = !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t);
  kontroll("F2 juridikgrind", paddagogisk && pahittade && ingaRad, "pedagogisk + påhittade värden + 0 rådsformuleringar");
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL hos detta lager ────────
{
  const grannar = [
    "vad är kemisektorn?", "vad är balanspriset?",          // kemisektor
    "vad är banksektorn?", "vad är nätlånet?",              // banksektorn
    "vad är skuggskulderna?", "vad är intäktredovisningen?", // notläsningen
    "vad är produktionsgapet?",                              // nykull (fönstrets syskon)
    "vad är ränteswapen?", "vad är swappen?",               // nykull — u1:s kasserade v1:s territorium
    "vad är bindningsrisken?",                               // nykull
    "vad är senioritetsordningen?",                          // skuldordning (syskon)
    "vad är valutasäkringen?",                               // skuldordning
    "vad är kreditderivatet?", "vad är kompetensparadoxen?", // nyfodda
    "vad är korrelationsrisken?",                            // marknadsrytm
  ];
  const stulna = grannar.filter((f) => svaraLokaltValideringsfonster(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "valideringsfonster");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är walk forward?", "vad är valideringsfönstret?", "vad är träningsfönstret?",
    "vad är slumphärfånget?", "vad är nåltoppen?", "vad är effektivitetsmåttet?",
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
  const svarar = kanoniska.map((f) => svaraLokaltValideringsfonster(f, KURSREGISTER) !== null);
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
  const mina = VALIDERINGSFONSTER_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-valideringsfonster-fragor.ts",
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
  const posSkuld = rad.indexOf("svaraLokaltSkuldordning(");
  const posMin = rad.indexOf("svaraLokaltValideringsfonster(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("valideringsfonstret saknas i kedjeraden");
  if (posSkuld === -1 || posMin === -1 || posRytm === -1 || !(posSkuld < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat skuldordning < valideringsfonster < marknadsrytm)");
  if (rad.includes("svaraLokaltRanteswap(")) FEL.push("kasserade ränteswap-anropet finns kvar i kedjeraden");
  if (!widget.includes('from "@/lib/ai-mentor-valideringsfonster-fragor"')) FEL.push("importen saknas");
  if (widget.includes('from "@/lib/ai-mentor-ranteswap-fragor"')) FEL.push("kasserade ränteswap-importen finns kvar");
  kontroll(
    "L widget-synk — efter skuldordning, FÖRE marknadsrytm (deras SIST) · 0 ränteswap-rester",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "84:e motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u1 omgång 34 (valideringsfönstret, v2): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
