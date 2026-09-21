/**
 * TESTA AI-MENTORN — BANKSEKTORN (s6-u1, omgång 33: banksektorn
 * [se-24 primär + se-19 + ln-01 + ud-09 + vr-02 + st-04 + ma-08 + mt-05 som
 * källor] — balansräkningen spegelvänd: nätlånet, deposit-betan, tre
 * förlusttrappor, K/I, kapitaltäckningen, utdelningsekvationen).
 *
 * Kör:  node verktyg/testa-ai-mentor-banksektor.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets förhandsfråga (se
 * src/lib/ai-mentor-banksektor-fragor.ts) med bevakning:
 *   A   2 kanoniska ingångar (nätlånet/räntenätet) → rätt ämne,
 *       primärkälla, FLERKÄLLA (kallor = 8 + numrerad Källor-rad) och
 *       ≥ 10 kurslänkar + ≥ 2 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter kategoristängning, FÖRE marknadsrytm
 *       — deras SIST-deklaration); A2b monster-antal + syskon-tåligt TOTALT-tak
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D19 aritmetik maskinellt omräknad (NII 2 280 · räntenät 2,28 ·
 *       franchisen 1 280 · svängen +480/+21 % · 48 öre · −1 pp → 1 800 ·
 *       +2 pp → 3 240 · Kreditia 900/9,0 % · +150 vänder −250 ·
 *       Fondia 1 250 · 120→1 200 · riskjusterat 7,0 mot 2,23 · K/I
 *       40,7/66,7 · per kund 4 000 × 400 000 − 50 = 1 550 · hävstången
 *       13,75× · CET1 10,0 mot 8,5 · ROE 15,1 · utdelningsekvationen
 *       809/409) + gränsvakter i TEXT + registerdrivna kontroller
 *       (SEKTORANALYS-antal LIVE, nivåmarkör) + fantomslug
 *   E   kanoniska extra-ingångar (deposit-beta, K/I-talet,
 *       kärnprimärkapitalrelationen, förlusttrappan, utdelningsekvationen,
 *       bankräkningen, växa eller dela, Sveabolån/Kreditia/Fondia …)
 *   F   null-gränser (dokumenterad ägarpol): «banksektorn»/
 *       «kreditförlust»/«kapitaltäckning»/«utlåning»/«utlåningsgrad» →
 *       det tidiga sektorlagrets ÖVERSIKT (km-040 — översikt+djup-
 *       precedensen som se-23/km-045) · «utlåningsräntan» → handelsdagen
 *       · «spriden» → am-01 · «combined ratio»/«floaten» → försäkringen
 *       · «normalisering» → varderjusteringen · «styrräntan» → makrons —
 *       lämnas ifred av detta lager
 *   F2  juridikgrind — pedagogisk text, PÅHITTADE-markör, inga råd
 *   G   ANTISTÖLD — grannlagers kanoniska (kemisektorn, stålsektorn,
 *       marginaltrappan, budprocessen, försäkringsskrivandet, ekonomiska
 *       vinsten, co-investeringen, optionsförfallet, haloeffekten …) →
 *       NULL hos mig
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS — framtidsäker
 *       när syskonens fönsterlager wireas) + H2 med detta lager
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-banksektor.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltBanksektorn, BANKSEKTOR_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-banksektor-fragor.ts")).href
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
  { fraga: "Vad är nätlånet?", amne: "banksektorn", slug: "se-24-banksektorn" },
  { fraga: "Vad är räntenätet?", amne: "banksektorn", slug: "se-24-banksektorn" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltBanksektorn(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " banksektorn", false, "inget lokalt svar på: '" + f.fraga + "'");
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
    amneOk && kallaOk && kallorFinns && kallradOk && primarForst && kurslankar >= 10 && fragorKnappar >= 2,
    "ämne=" + svar.amne + " · primär=" + svar.kalla.slug + " · källor=" + (svar.kallor?.length ?? 0) +
      " · kurslänkar=" + kurslankar + " · fragor-knappar=" + fragorKnappar,
  );
});

// ── FALL A2: MOTORDEFS-position LIVE ur kedjetestet ─────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const ix = defs.findIndex((d) => d.namn === "banksektorn");
  const ixKat = defs.findIndex((d) => d.namn === "kategoristangning");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2 MOTORDEFS — banksektorn wiread med antal 1, index " + ix,
    ix !== -1 && defs[ix].antal === 1 && ixKat !== -1 && ixRytm !== -1 && ixKat < ix && ix < ixRytm,
    "efter kategoristängning (" + ixKat + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer totalt " + defs.length,
  );
  kontroll(
    // Omgång 33: banksektorn +1 (detta lager) ⇒ 205 — syskon-tåligt tak:
    // MINST 205; senare fönsters motorer bärs av sina egna leveranser.
    // Kedjetestets TOTALT-kommentar är sanningen.
    "A2b MONSTER-ANTAL — lagret bär exakt 1 monster (TOTALT ≥ 205)",
    BANKSEKTOR_MONSTER.length === 1 && defs.reduce((s, d) => s + d.antal, 0) >= 205,
    "lager " + BANKSEKTOR_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är nätlån?", amne: "banksektorn" },                 // utan -et
  { fraga: "vad är räntenätet", amne: "banksektorn" },              // utan frågetecken
  { fraga: "vad är inlåningsbetan?", amne: "banksektorn" },  // deposit-betans väg in («beta» ägs av riskmåttsdjupet)
  { fraga: "vad är K/I-talet?", amne: "banksektorn" },
  { fraga: "vad är KI-talet?", amne: "banksektorn" },
  { fraga: "vad är inlåningsfranchisen?", amne: "banksektorn" },
  { fraga: "vad är förlusttrappan?", amne: "banksektorn" },
  { fraga: "vad är kärnprimärkapitalrelationen?", amne: "banksektorn" },
  { fraga: "vad är utdelningsekvationen?", amne: "banksektorn" },
  { fraga: "vad är kreditförlustnivån?", amne: "banksektorn" },
  { fraga: "vad är riskvägda tillgångar?", amne: "banksektorn" },
  { fraga: "vad är nätlånsintäkten?", amne: "banksektorn" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltBanksektorn(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är nätlånet?", "vad är räntenätet?", "vad är inlåningsbetan?",
    "vad är K/I-talet?", "vad är förlusttrappan?", "vad är bankräkningen?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltBanksektorn(f, KURSREGISTER);
    const b = svaraLokaltBanksektorn(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (kursernas EGNA modelltal) ────────
{
  const t1 = BANKSEKTOR_MONSTER[0].bygga(KURSREGISTER).text;
  kontroll("D01 nätlånsintäkten", 3600 - 800 - 520 === 2280 && t1.includes("2 280") && t1.includes("2,28"), "3 600 − 800 − 520 = 2 280 Mkr, räntenät 2,28 %");
  kontroll("D02 franchisen", approx(0.016 * 80000, 1280, 0.5) && t1.includes("1 280"), "1,60 pp × 80 mdr = 1 280 Mkr/år");
  kontroll("D03 räntesvängen +1 pp", 4600 - 1120 - 720 === 2760 && approx(2760 - 2280, 480, 0.5) && t1.includes("480") && t1.includes("21 procent"), "4 600 − 1 120 − 720 = 2 760 = +480 Mkr (+21 %)");
  kontroll("D04 kvar-öret", approx(480 / 1000, 0.48, 0.005) && t1.includes("48 öre"), "480/1 000 = 48 öre av intäktskronan");
  kontroll("D05 fallet nedåt", 2600 - 480 - 320 === 1800 && t1.includes("1 800"), "−1 pp ⇒ 2 600 − 480 − 320 = 1 800 (−21 %)");
  kontroll("D06 plus två procentenheter", 5600 - 1440 - 920 === 3240 && t1.includes("3 240") && t1.includes("42 procent"), "5 600 − 1 440 − 920 = 3 240 (+960, +42 %)");
  kontroll("D07 Kreditia nätlånet", approx(10000 * 0.12 - 10000 * 0.03, 900, 0.5) && t1.includes("900 miljoner") && t1.includes("9,0 procent"), "1 200 − 300 = 900 Mkr, räntenät 9,0 %");
  kontroll("D08 Kreditia normal/kris", 900 + 150 - 700 - 200 === 150 && 900 + 150 - 700 - 600 === -250 && t1.includes("150") && t1.includes("minus 250"), "normal +150, kris −250 Mkr");
  kontroll("D09 krisårets aptit", approx(250 / 150, 1.67, 0.01) && t1.includes("1,7 normalår"), "250/150 ≈ 1,7 normalår uppätna");
  kontroll("D10 Fondia", 2000 - 0 - 750 === 1250 && approx(40000 * 0.003, 120, 0.5) && approx(40000 * 0.03, 1200, 0.5) && t1.includes("1 250") && t1.includes("120 miljoner") && t1.includes("1 200"), "NII 1 250; normal 120, fastighetskris 1 200 Mkr (tiofalt)");
  kontroll("D11 riskjusterat räntenät", approx((900 - 200) / 10000 * 100, 7.0, 0.005) && approx((2280 - 50) / 100000 * 100, 2.23, 0.005) && t1.includes("7,0 procent") && t1.includes("2,23"), "Kreditia 7,0 % mot Sveabolån 2,23 %");
  kontroll("D12 K/I-talet", approx(1100 / 2700 * 100, 40.74, 0.05) && approx(700 / 1050 * 100, 66.67, 0.05) && t1.includes("40,7") && t1.includes("66,7"), "1 100/2 700 = 40,7 % mot 700/1 050 = 66,7 %");
  kontroll("D13 per-kund-kontrollen", approx(400000 * 4000 / 1000000 - 50, 1550, 0.5) && t1.includes("4 000") && t1.includes("1 550"), "400 000 × 4 000 kr = 1 600 − 50 = 1 550 Mkr");
  kontroll("D14 den reglerade hävstången", approx(110 / 8, 13.75, 0.005) && approx(8 / 80 * 100, 10.0, 0.005) && t1.includes("13,75") && t1.includes("10,0 procent") && t1.includes("8,5"), "110/8 = 13,75×; kärnprimärkapital 10,0 % mot 8,5");
  kontroll("D15 ROE och hävstångsleken", approx(1550 * 0.78, 1209, 0.5) && approx(1209 / 8000 * 100, 15.1, 0.05) && approx(1209 / 4000 * 100, 30.2, 0.05) && approx(4 / 80 * 100, 5.0, 0.005) && t1.includes("15,1") && t1.includes("30,2") && t1.includes("5,0 procent"), "1 209/8 000 = 15,1 %; leken 30,2 % men 5,0 < 8,5 otillåtet");
  kontroll("D16 utdelningsekvationen", approx(8000 * 1.05, 8400, 0.5) && approx(8000 + 1209 - 8400, 809, 0.5) && approx(8000 * 1.10, 8800, 0.5) && approx(8000 + 1209 - 8800, 409, 0.5) && t1.includes("809") && t1.includes("67 procent") && t1.includes("409") && t1.includes("34 procent"), "RWA +5 % → 809 (67 %); +10 % → 409 (34 %)");
  kontroll("D17 LTV-dämparen", t1.includes("40 procent") && t1.includes("60-procentig"), "huset måste tappa >40 % vid 60-procentig pant");
  kontroll(
    "D18 gränsvakter i TEXT",
    ["se-19", "ln-01", "ud-09", "vr-02", "st-04", "ma-08", "mt-05", "mt-02", "ma-05", "ma-03", "am-01", "v05", "km-040", "pc-03", "Sveabolån", "Kreditia", "Fondia"].every((g) => t1.includes(g)),
    "dokumenterade gränser bärs i text med attribution",
  );
  // D19–D20: registerdrivet — kategoriantal och nivå LIVE.
  const seAntal = KURSREGISTER.filter((r) => r.kategori === "SEKTORANALYS").length;
  kontroll(
    "D19 registerdrivet kategoriantal",
    seAntal > 0 && t1.includes("I kategorin sektoranalys finns " + seAntal + " kurser"),
    "SEKTORANALYS = " + seAntal + " LIVE ur KURSREGISTER",
  );
  const se24 = KURSREGISTER.find((r) => r.slug === "se-24-banksektorn");
  kontroll(
    "D20 nivåmarkör",
    !!se24 && se24.niva === "Intermediär" && t1.includes("intermediär nivå"),
    "se-24 = " + (se24 ? se24.niva : "?") + " (registerdrivet, LIVE)",
  );
  // D21: kurslänkarnas slug:ar — alla äkta mot registret.
  const svaret = BANKSEKTOR_MONSTER[0].bygga(KURSREGISTER);
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const kursSlugs = svaret.handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", ""));
  const fantomer = [...kursSlugs, ...svaret.kallor.map((k) => k.slug).filter(Boolean)].filter((s) => !slugSet.has(s));
  kontroll("D21 fantomslug", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : (kursSlugs.length + svaret.kallor.length) + " äkta slug:ar");
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är räntesvängen?", "vad är provisionscykeln?", "vad är sparkontot?",
    "vad är lönekontot?", "vad är bankbranschen?",
    "vad är penningmarknadsfinansiering?", "vad är kostnads-intäktskvoten?",
    "vad är utlåningsboken?", "vad är Sveabolån?", "vad är Kreditia?",
    "vad är Fondia?", "vad är växa eller dela?", "vad är bankens hävstång?",
    "vad är inlåningsandelen?", "vad är inlåningsbetan?", "vad är en bankräkning?",
    "vad är riskjusterat räntenät?", "vad är kärnprimärkapital?", "vad är räntesväng?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltBanksektorn(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är banksektorn?",        // sektorlagrets ÖVERSIKT (km-040) — översikt+djup
    "vad är bankbolag?",          // sektorlagrets översikt
    "vad är kreditförlust?",      // sektorlagrets översikt
    "vad är kapitaltäckning?",    // sektorlagrets översikt
    "vad är utlåning?",           // sektorlagrets översikt
    "vad är utlåningsgraden?",    // sektorlagrets kärnord
    "vad är utlåningsräntan?",    // handelsdagen (tav 2 — kasserad)
    "vad är beta?",               // riskmåttsdjupets CAPM-beta (kort ord — deras)
    "vad är belåningsgraden?",    // tav 2-mot sektorlagrets «utlåningsgrad» — kasserad, bärs i TEXT
    "vad är spriden?",            // am-01:s mikrovärld
    "vad är combined ratio?",     // försäkringslagrets
    "vad är floaten?",            // försäkringslagrets (se-19 är KÄLLA här)
    "vad är normalisering?",      // varderjusteringens (vr-02 är KÄLLA här)
    "vad är styrräntan?",         // makrons
    "vad är en moat?",            // extrats
    "vad är Du Pont?",            // lonsamhetsdjupets (ln-01 är KÄLLA här)
  ];
  const stulna = gransor.filter((f) => svaraLokaltBanksektorn(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2: juridikgrind — pedagogisk text, aldrig rekommendation ──────────
{
  const t = BANKSEKTOR_MONSTER[0].bygga(KURSREGISTER).text;
  const paddagogisk = t.includes("utbildning") && t.includes("inga placeringstips");
  const pahittade = t.includes("påhittade");
  const ingaRad = !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t);
  kontroll("F2 juridikgrind", paddagogisk && pahittade && ingaRad, "pedagogisk + påhittade värden + 0 rådsformuleringar");
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL hos detta lager ────────
{
  const grannar = [
    "vad är kemisektorn?", "vad är balanspriset?",        // kemisektor
    "vad är stålsektorn?", "vad är masugnen?",            // stålsektor (föregångaren)
    "vad är budprocessen?", "vad är budpremien?",         // kategoristängningen
    "vad är ekonomiska vinsten?", "vad är EVA?",          // kategoristängningen
    "vad är försäkringsskrivandet?", "vad är wheel?",     // kategoristängningen
    "vad är co-investeringen?",                           // coinvest
    "vad är marginalhandeln?", "vad är optionsförfallet?", // tvångsmekaniken
    "vad är haloeffekten?", "vad är arbitragens gränser?", // beteendefallorna
    "vad är övningsbolaget?",                             // casepraktiken
    "vad är marknadsrytmen?", "vad är korrelationsrisken?", // marknadsrytm (efterföljaren)
  ];
  const stulna = grannar.filter((f) => svaraLokaltBanksektorn(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "banksektorn");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är nätlånet?", "vad är räntenätet?", "vad är inlåningsbetan?",
    "vad är K/I-talet?", "vad är kärnprimärkapitalrelationen?", "vad är förlusttrappan?",
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
  const svarar = kanoniska.map((f) => svaraLokaltBanksektorn(f, KURSREGISTER) !== null);
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
  const mina = BANKSEKTOR_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-banksektor-fragor.ts",
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
  const posKat = rad.indexOf("svaraLokaltKategoristangning(");
  const posMin = rad.indexOf("svaraLokaltBanksektorn(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("banksektorn saknas i kedjeraden");
  if (posKat === -1 || posMin === -1 || posRytm === -1 || !(posKat < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat kategoristängning < banksektorn < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-banksektor-fragor"')) FEL.push("importen saknas");
  kontroll(
    "L widget-synk — efter kategoristängning, FÖRE marknadsrytm (deras SIST)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "78:e motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u1 omgång 33 (banksektorn): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
