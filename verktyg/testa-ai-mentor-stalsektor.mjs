/**
 * TESTA AI-MENTORN — STÅLSEKTORN (s6-u1, fönster 31: stålsektorn [se-23
 * primär + rk-15 + vr-02 + se-20 + mt-05 som källor] — kapacitetens
 * hävstång, malmen mot skrotet, förädlingstrappan).
 *
 * Kör:  node verktyg/testa-ai-mentor-stalsektor.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets förhandsfråga (se
 * src/lib/ai-mentor-stalsektor-fragor.ts) med bevakning:
 *   A   2 kanoniska ingångar (stålsektorn/stålverket) → rätt ämne,
 *       primärkälla, FLERKÄLLA (kallor = 5 + numrerad Källor-rad) och
 *       ≥ 6 kurslänkar + ≥ 2 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter kemisektor, FÖRE marknadsrytm —
 *       deras SIST-deklaration); A2b monster-antal + syskon-tåligt TOTALT-tak
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D18 aritmetik maskinellt omräknad (Forshammar +2 000/+800/−400 ·
 *       svängen 2 400 · 600 Mkr per tiondels procentenhet · fasta per ton
 *       1 000/1 250/1 667 · kvartalsskuggan 3 196 = −6,0 % mot
 *       1 296 = −13,6 % ⇒ 2,3× · kontrollen 3 060/1 160 = 22,7 % ·
 *       malmchocken 330 och elchocken 200 · Kvarnviken +20 · masugnen
 *       12 000 kr/årston × 40 år · Velox 29,2 % mot 14,7) +
 *       gränsvakter i TEXT + registerdrivna kontroller (SEKTORANALYS-antal
 *       LIVE, nivåmarkör) + fantomslug
 *   E   kanoniska extra-ingångar (stålcykeln, grossistpriset, masugnen,
 *       bessemerprocessen, malmvägen, elektriskt stål …)
 *   F   null-gränser (dokumenterade ägarpol): «en moat» (extra) ·
 *       «gruvsektorn»/«malmen» (framtida se-20-lagers — NULL i kedjan
 *       men DERAS territorium) · «täckningsbidraget»/«marginaltrappan»
 *       (volatilitetsmekaniken) · «normalisering» (varderjustering) ·
 *       «prisfullmakten» (moatdjupet) — lämnas ifred av detta lager
 *   F2  juridikgrind — pedagogisk text, PÅHITTADE-markör, inga råd
 *   G   ANTISTÖLD — grannlagers kanoniska (kemisektorn, marginaltrappan,
 *       prisfullmakten, sell the news, normalisering …) → NULL hos mig
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS — framtidsäker
 *       när syskonens fönsterlager wireas) + H2 med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER kemisektor och FÖRE marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-stalsektor.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltStalsektor, STALSEKTOR_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-stalsektor-fragor.ts")).href
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
  { fraga: "Vad är stålsektorn?", amne: "stålsektorn", slug: "se-23-stalsektorn" },
  { fraga: "Vad är ett stålverk?", amne: "stålsektorn", slug: "se-23-stalsektorn" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltStalsektor(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " stålsektor", false, "inget lokalt svar på: '" + f.fraga + "'");
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
    amneOk && kallaOk && kallorFinns && kallradOk && primarForst && kurslankar >= 6 && fragorKnappar >= 2,
    "ämne=" + svar.amne + " · primär=" + svar.kalla.slug + " · källor=" + (svar.kallor?.length ?? 0) +
      " · kurslänkar=" + kurslankar + " · fragor-knappar=" + fragorKnappar,
  );
});

// ── FALL A2: MOTORDEFS-position LIVE ur kedjetestet ─────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const ix = defs.findIndex((d) => d.namn === "stålsektor");
  const ixKemi = defs.findIndex((d) => d.namn === "kemisektor");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2 MOTORDEFS — stålsektor wiread med antal 1, index " + ix,
    ix !== -1 && defs[ix].antal === 1 && ixKemi !== -1 && ixRytm !== -1 && ixKemi < ix && ix < ixRytm,
    "efter kemisektor (" + ixKemi + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer totalt " + defs.length,
  );
  kontroll(
    // Fönster 31: stålsektor +1 (detta lager) ⇒ 196 — syskon-tåligt tak:
    // MINST 196; senare fönsters motorer bärs av sina egna leveranser.
    // Kedjetestets TOTALT-kommentar är sanningen.
    "A2b MONSTER-ANTAL — lagret bär exakt 1 monster (TOTALT ≥ 196)",
    STALSEKTOR_MONSTER.length === 1 && defs.reduce((s, d) => s + d.antal, 0) >= 196,
    "lager " + STALSEKTOR_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är stålsektor?", amne: "stålsektorn" },              // utan -n
  { fraga: "vad är stålsektorn", amne: "stålsektorn" },              // utan frågetecken
  { fraga: "vad är stålindustrin?", amne: "stålsektorn" },
  { fraga: "vad är kapacitetsutnyttjandet?", amne: "stålsektorn" },
  { fraga: "vad är masugn?", amne: "stålsektorn" },
  { fraga: "vad är en ljusbågsugn?", amne: "stålsektorn" },
  { fraga: "vad är ett skrotverk?", amne: "stålsektorn" },
  { fraga: "vad är skrotpriset?", amne: "stålsektorn" },
  { fraga: "vad är kontraktspriset?", amne: "stålsektorn" },
  { fraga: "vad är järnmalmspriset?", amne: "stålsektorn" },
  { fraga: "vad är transformatorstål?", amne: "stålsektorn" },
  { fraga: "vad är utnyttjandegraden?", amne: "stålsektorn" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltStalsektor(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är stålsektorn?", "vad är ett stålverk?", "vad är masugnen?",
    "vad är kvartalsskuggan?", "vad är kärnplåten?", "vad är förädlingstrappan?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltStalsektor(f, KURSREGISTER);
    const b = svaraLokaltStalsektor(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (kursernas EGNA modelltal) ────────
{
  const t1 = STALSEKTOR_MONSTER[0].bygga(KURSREGISTER).text;
  kontroll("D01 bidraget per ton", 3400 - 1900 === 1500 && t1.includes("1 500"), "3 400 − 1 900 = 1 500 kr/ton");
  kontroll("D02 full volym", 1500 * 4.0 - 4000 === 2000 && t1.includes("2 000"), "1 500 × 4,0 = 6 000 − 4 000 = +2 000 Mkr");
  kontroll("D03 åttio procent", approx(1500 * 3.2 - 4000, 800, 0.5) && t1.includes("800"), "4 800 − 4 000 = +800 Mkr");
  kontroll("D04 sextio procent", approx(1500 * 2.4 - 4000, -400, 0.5) && t1.includes("minus 400"), "3 600 − 4 000 = −400 Mkr");
  kontroll("D05 svängen", 2000 - (-400) === 2400 && t1.includes("2 400"), "volym −40 % ⇒ resultat svänger 2 400 Mkr");
  kontroll("D06 tiondelsprocentenheten", approx(0.1 * 4.0 * 1500, 600, 0.5) && t1.includes("600"), "0,4 Mton × 1 500 = 600 Mkr per 10 procentenheter");
  kontroll("D07 fasta per ton", approx(4000 / 2.4, 1666.7, 0.5) && t1.includes("1 667"), "4 000/2,4 ≈ 1 667 kr/ton vid 60 %");
  kontroll("D08 blandpriset", approx(0.7 * 3400 + 0.3 * 2720, 3196, 0.5) && t1.includes("3 196") && t1.includes("6,0"), "0,7 × 3 400 + 0,3 × 2 720 = 3 196 = −6,0 %");
  kontroll("D09 blandbidraget", approx(0.7 * 1500 + 0.3 * 820, 1296, 0.5) && t1.includes("1 296") && t1.includes("13,6"), "0,7 × 1 500 + 0,3 × 820 = 1 296 = −13,6 %");
  kontroll("D10 hävstången", approx(13.6 / 6.0, 2.27, 0.05) && t1.includes("2,3"), "13,6/6,0 ≈ 2,3 gånger");
  kontroll("D11 kontrollen 50/50", approx(0.5 * 3400 + 0.5 * 2720, 3060, 0.5) && approx(0.5 * 1500 + 0.5 * 820, 1160, 0.5) && t1.includes("3 060") && t1.includes("1 160") && t1.includes("22,7"), "pris 3 060 (−10 %) mot bidrag 1 160 (−22,7 %)");
  kontroll("D12 råvaruchockerna", approx(1100 * 0.30, 330, 0.5) && approx(400 * 0.50, 200, 0.5) && t1.includes("330") && t1.includes("200 kronor per ton"), "malm +30 % = 330 kr/ton · el +50 % = 200 kr/ton");
  kontroll("D13 skrotverket vid 60 %", approx(0.8 * 0.6 * 1500 - 700, 20, 0.5) && t1.includes("plus 20"), "0,48 × 1 500 = 720 − 700 = +20 Mkr");
  kontroll("D14 masugnen", 12000 / 1.0 === 12000 && t1.includes("12 000 kronor per årston") && t1.includes("40 år"), "12 mdr/1,0 Mton = 12 000 kr per årston, 40-årig livslängd");
  kontroll("D15 Velox marginal", approx((0.3 * 6500 - 900) / (0.3 * 12000) * 100, 29.17, 0.05) && t1.includes("29,2") && t1.includes("14,7") && t1.includes("6 500"), "1 950 − 900 = 1 050 på 3 600 = 29,2 % mot 14,7 %");
  kontroll(
    "D16 gränsvakter i TEXT",
    ["se-20:s värld", "rk-15", "vr-02", "mt-05", "km-047", "kvartalsskuggan", "Forshammar", "Kvarnviken", "Velox"].every((g) => t1.includes(g)),
    "dokumenterade gränser bärs i text med attribution",
  );
  // D17–D18: registerdrivet — kategoriantal och nivå LIVE.
  const seAntal = KURSREGISTER.filter((r) => r.kategori === "SEKTORANALYS").length;
  kontroll(
    "D17 registerdrivet kategoriantal",
    seAntal > 0 && t1.includes("I kategorin sektoranalys finns " + seAntal + " kurser"),
    "SEKTORANALYS = " + seAntal + " LIVE ur KURSREGISTER",
  );
  const se23 = KURSREGISTER.find((r) => r.slug === "se-23-stalsektorn");
  kontroll(
    "D18 nivåmarkör",
    !!se23 && se23.niva === "Intermediär" && t1.includes("intermediär nivå"),
    "se-23 = " + (se23 ? se23.niva : "?") + " (registerdrivet, LIVE)",
  );
  // D19: kurslänkarnas slug:ar — alla äkta mot registret.
  const svaret = STALSEKTOR_MONSTER[0].bygga(KURSREGISTER);
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const kursSlugs = svaret.handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", ""));
  const fantomer = [...kursSlugs, ...svaret.kallor.map((k) => k.slug).filter(Boolean)].filter((s) => !slugSet.has(s));
  kontroll("D19 fantomslug", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : (kursSlugs.length + svaret.kallor.length) + " äkta slug:ar");
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är stålcykeln?", "vad är grossistpriset?", "vad är valsverket?",
    "vad är bessemerprocessen?", "vad är syrgasprocessen?", "vad är stålbolaget?",
    "vad är malmvägen?", "vad är skrotvägen?", "vad är kapacitetsloppet?",
    "vad är elektriskt stål?", "vad är stålräkningen?", "vad är kontraktspris?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltStalsektor(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är en moat?",            // extra:s — vallgraven deras
    "vad är gruvsektorn?",        // framtida se-20-lagers territorium
    "vad är malmen?",             // gruvkursens råvara
    "vad är täckningsbidraget?",  // volatilitetsmekanikens (begreppet deras)
    "vad är marginaltrappan?",    // volatilitetsmekanikens (ln-03 är KÄLLA här)
    "vad är normalisering?",      // varderjusteringens (vr-02 är KÄLLA här)
    "vad är prisfullmakten?",     // moatdjupets (mt-05 är KÄLLA här)
    "vad är kassaflödesanalys?",  // baskursernas
    "vad är styrräntan?",         // makrons
    "vad är krypto?",             // försäkringslagrets
  ];
  const stulna = gransor.filter((f) => svaraLokaltStalsektor(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2: juridikgrind — pedagogisk text, aldrig rekommendation ──────────
{
  const t = STALSEKTOR_MONSTER[0].bygga(KURSREGISTER).text;
  const paddagogisk = t.includes("utbildning") && t.includes("inga placeringstips");
  const pahittade = t.includes("påhittade");
  const ingaRad = !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t);
  kontroll("F2 juridikgrind", paddagogisk && pahittade && ingaRad, "pedagogisk + påhittade värden + 0 rådsformuleringar");
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL hos detta lager ────────
{
  const grannar = [
    "vad är kemisektorn?", "vad är balanspriset?",        // kemisektor (föregångaren)
    "vad är marginaltrappan?", "vad är täckningsbidraget?", // volatilitetsmekaniken
    "vad är prisfullmakten?", "vad är byteskostnader?",   // moatdjupet
    "vad är sell the news?",                              // handelsemotorn
    "vad är normalisering?",                              // varderjusteringen
    "vad är optionsförfallet?", "vad är marginalhandeln?", // tvångsmekaniken
    "vad är gruvsektorn?",                                // se-20-grannen
    "vad är churn?",                                      // sektordjupet (saas-familjen)
  ];
  const stulna = grannar.filter((f) => svaraLokaltStalsektor(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "stålsektor");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är stålsektorn?", "vad är ett stålverk?", "vad är masugnen?",
    "vad är kvartalsskuggan?", "vad är kärnplåten?", "vad är förädlingstrappan?",
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
  const svarar = kanoniska.map((f) => svaraLokaltStalsektor(f, KURSREGISTER) !== null);
  kontroll("H2 med lager — samtliga kanoniska svarar", svarar.every(Boolean), svarar.filter(Boolean).length + "/" + svarar.length);
}

// ── FALL J: KÄRNORDSDISJUNKTION LIVE ────────────────────────────────────────
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
  const mina = STALSEKTOR_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-stalsektor-fragor.ts",
  );
  const kollisioner = [];
  for (const fil of filer) {
    const kalla = readFileSync(join(ROT, "src/lib", fil), "utf8");
    for (const block of kalla.matchAll(/karnord: \[([^\]]+)\]/g)) {
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
  kontroll("J kärnordsdisjunktion — " + mina.length + " kärnord mot " + filer.length + " andra lager", kollisioner.length === 0, kollisioner.length ? kollisioner.slice(0, 5).join(" | ") : "0 kollisioner");
}

// ── FALL L: widget-synk — import + kedjeposition ────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rader = widget.split("\n").filter((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const FEL = [];
  if (rader.length !== 1) FEL.push("hittade " + rader.length + " kedjerader (väntat exakt 1)");
  const rad = rader[0] ?? "";
  const posKemi = rad.indexOf("svaraLokaltKemisektor(");
  const posMin = rad.indexOf("svaraLokaltStalsektor(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("stålsektor saknas i kedjeraden");
  if (posKemi === -1 || posMin === -1 || posRytm === -1 || !(posKemi < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat kemisektor < stålsektor < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-stalsektor-fragor"')) FEL.push("importen saknas");
  kontroll(
    "L widget-synk — efter kemisektor, FÖRE marknadsrytm (deras SIST)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "74:e motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u1 fönster 31 (stålsektor): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
