/**
 * TESTA AI-MENTORN — LÖNSAMHETSGRUND (s6-u3, fönster 30: lönsamhetens
 * grund [ln-05 primär + v07 + v09 + ln-04 + roic-01 som källor] + nästa
 * kronas avkastning [roic-03 primär + roic-01 + ln-01 + ln-02 + mk-09]
 * + värdeekvationen [roic-04 primär + roic-01 + km-008 + vr-03 + ib-04]
 * — KATEGORISTÄNGNING LÖNSAMHET 9/12 → 12/12).
 *
 * Kör:  node verktyg/testa-ai-mentor-lonsamhetsgrund.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets tre förhandsfrågor (se
 * src/lib/ai-mentor-lonsamhetsgrund-fragor.ts) med bevakning:
 *   A   6 kanoniska ingångar (lönsamhet/bageriets trappa +
 *       inkrementell avkastning/medeltalets blindhet +
 *       värdeekvationen/värdemultiplikatorn) → rätt ämne, primärkälla,
 *       FLERKÄLLA (kallor = 5 + numrerad Källor-rad) och ≥ 4 kurslänkar
 *   A2  MOTORDEFS-position LIVE (index 70, efter handelsemotor, FÖRE
 *       marknadsrytm — deras SIST-deklaration)
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D14 aritmetik maskinellt omräknad (bageriets trappa 60/25/20/13,5,
 *       bulle 15, kampanjens break-even +50 % och 12 kronor, medeltalet
 *       15,0/8,0/13,8/11,9, inflationens minne 40,0/16,0, FCF 10,0 %,
 *       värdemultiplikatorn 3,75, tvillingarna 6 % = 6 %, Gordon 21,2
 *       mot 10,6) + D17 gränsvakter i TEXT + D19 registerdrivna tal +
 *       D20 nivåmarkörer + D21 fantomslug
 *   E   kanoniska extra-ingångar (lönsamhetsgraden, lönsamhetsmåttet,
 *       vinstens förståelse, det vandrande medeltalet, formeln går
 *       sönder, återinvesteringskvoten, tvillingbolagen, kapitalbehovet,
 *       värdeekvationens fem frågor)
 *   F   15 null-gränser (sondens dokumenterade ägarpol): naket «roic»/
 *       «dupont-analysen»/«wacc»/«nopat» (lonsamhetsdjupet) · naket
 *       «multipel»/«värderingsmultipel» (djup) · «marginaltrappan»
 *       (volatilitetsmekaniken) · «bruttomarginal»/«roe» titelform
 *       (basens V-uppslag) · «inflationens minne» (makro) · «negativt
 *       eget kapital» (basen) · «tillväxtens tvillingar» (basen) ·
 *       «multipelns pris på spridningen» (basen) · «nya kronor mot
 *       bokförda» (extra)
 *   G   ANTISTÖLD — grannlagers kanoniska (marginalhandeln,
 *       optionsförfallet, sell the news, take or pay, co-investeringen,
 *       marginaltrappan, volatilitetsdraget, regulatorisk risk, gdpr,
 *       combined ratio, krypto, prisfullmakten, net-net/NCAV,
 *       kapitalbindningen …) → NULL
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS — framtidsäker
 *       när syskonens fönsterlager wireas) + H2 med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER handelsemotor och FÖRE marknadsrytm
 *       (deras SIST-deklaration) i chat-widget.tsx:s kedja
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-lonsamhetsgrund.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltLonsamhetsgrund, LONSAMHETSGRUND_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-lonsamhetsgrund-fragor.ts")).href
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

// ── FALL A: sex kanoniska ingångar, tre monster, flerkällskrav ──────────────
const NYA = [
  { fraga: "Vad är lönsamhet?", amne: "lönsamhetens grund", slug: "ln-05-vad-ar-lonsamhet" },
  { fraga: "Vad är bageriets trappa?", amne: "lönsamhetens grund", slug: "ln-05-vad-ar-lonsamhet" },
  { fraga: "Vad är inkrementell avkastning?", amne: "nästa kronas avkastning", slug: "roic-03-inkrementell-roic" },
  { fraga: "Vad är medeltalets blindhet?", amne: "nästa kronas avkastning", slug: "roic-03-inkrementell-roic" },
  { fraga: "Vad är värdeekvationen?", amne: "värdeekvationen", slug: "roic-04-vardeekvationen" },
  { fraga: "Vad är värdemultiplikatorn?", amne: "värdeekvationen", slug: "roic-04-vardeekvationen" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltLonsamhetsgrund(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " lönsamhetsgrund", false, "inget lokalt svar på: '" + f.fraga + "'");
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

// ── FALL A2: MOTORDEFS-position LIVE ur kedjetestet ─────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const ix = defs.findIndex((d) => d.namn === "lonsamhetsgrund");
  const ixHand = defs.findIndex((d) => d.namn === "handelsemotor");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  // Positionsform (kemisektor-syskonet wireade sig EFTER detta lager i samma
  // fönster — grannkravet är inte framtidsäkerligt; doktrinen är EFTER
  // handelsemotor, FÖRE marknadsrytm som SIST).
  kontroll(
    "A2 MOTORDEFS — lonsamhetsgrund wiread med antal 3, index " + ix,
    ix !== -1 && defs[ix].antal === 3 && ixHand !== -1 && ixRytm !== -1 && ixHand < ix && ix < ixRytm,
    "efter " + (defs[ix - 1]?.namn ?? "?") + ", före " + (defs[ix + 1]?.namn ?? "?") + " · motorer totalt " + defs.length,
  );
  kontroll(
    "A2b MONSTER-ANTAL — lagret bär exakt 3 monsters (kedjan ≥ 195 LIVE)",
    LONSAMHETSGRUND_MONSTER.length === 3 && defs.reduce((s, d) => s + d.antal, 0) >= 195,
    "lager " + LONSAMHETSGRUND_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0) + " (syskonfönster kan växa den)",
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är lönsamheten?", amne: "lönsamhetens grund" },            // bestämd form
  { fraga: "vad menas med lönsamhet?", amne: "lönsamhetens grund" },
  { fraga: "hur mäter man lönsamhet?", amne: "lönsamhetens grund" },
  { fraga: "vad är lönsamhetsgraden?", amne: "lönsamhetens grund" },
  { fraga: "vad är bageriexemplet?", amne: "lönsamhetens grund" },
  { fraga: "vad är vinst kontra kassa?", amne: "lönsamhetens grund" },
  { fraga: "vad är inkrementella avkastningen?", amne: "nästa kronas avkastning" },
  { fraga: "vad är inkrementell lönsamhet?", amne: "nästa kronas avkastning" },
  { fraga: "vad är nästa kronas avkastning?", amne: "nästa kronas avkastning" },
  { fraga: "vad är det vandrande medeltalet?", amne: "nästa kronas avkastning" },
  { fraga: "vad är värdeekvation?", amne: "värdeekvationen" },               // obestämd form
  { fraga: "vad är kapitalbehovet?", amne: "värdeekvationen" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltLonsamhetsgrund(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är lönsamhet?", "vad är bageriets trappa?", "vad är kampanjräkningen?",
    "vad är inkrementell avkastning?", "vad är medeltalets blindhet?",
    "vad är värdeekvationen?", "vad är värdemultiplikatorn?", "vad är tvillingbolagen?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltLonsamhetsgrund(f, KURSREGISTER);
    const b = svaraLokaltLonsamhetsgrund(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (kursernas EGNA modelltal) ────────
{
  const t1 = svaraLokaltLonsamhetsgrund("vad är lönsamhet?", KURSREGISTER).text;
  const t2 = svaraLokaltLonsamhetsgrund("vad är inkrementell avkastning?", KURSREGISTER).text;
  const t3 = svaraLokaltLonsamhetsgrund("vad är värdeekvationen?", KURSREGISTER).text;

  // D01: bageriets trappa 1 000 − 400 = 600 (60,0 %)
  kontroll("D01 bruttovinsten", 1000 - 400 === 600 && approx((600 / 1000) * 100, 60, 0.05) && t1.includes("60,0"), "600 av 1 000 = 60,0 %");
  // D02: trappan 25,0/20,0/13,5 (180 × 0,75 = 135)
  kontroll("D02 trappan", 600 - 350 === 250 && 250 - 50 === 200 && approx(180 * 0.75, 135, 0.01) && t1.includes("25,0") && t1.includes("20,0") && t1.includes("13,5"), "25,0 · 20,0 · netto 135 = 13,5 %");
  // D03: bulle 25 − 10 = 15
  kontroll("D03 per styck", 25 - 10 === 15 && t1.includes("bruttovinst 15 kronor per styck"), "15 kronor per bulle");
  // D04: kampanjen 20 ⇒ 10; break-even 15/10 = +50 %; +20 % ⇒ 12 (tre kronor sämre)
  kontroll("D04 kampanjräkningen", 20 - 10 === 10 && approx(15 / 10, 1.5, 0.01) && approx(10 * 1.2, 12, 0.01) && t1.includes("12 kronor") && t1.includes("tre kronor"), "break-even +50 % · 10 × 1,2 = 12");
  // D05: bokförd 150/1 000 = 15,0
  kontroll("D05 medeltalet", approx((150 / 1000) * 100, 15, 0.05) && t2.includes("15,0"), "150/1 000 = 15,0 %");
  // D06: satsningen 16/200 = 8,0
  kontroll("D06 marginalen", 16 / 200 === 0.08 && t2.includes("8,0"), "16/200 = exakt 8,0 %");
  // D07: kombinerat 166/1 200 = 13,8
  kontroll("D07 kombinerat", approx((166 / 1200) * 100, 13.83, 0.01) && t2.includes("13,8"), "166/1 200 = 13,8 %");
  // D08: fyra satsningsår 214/1 800 = 11,9
  kontroll("D08 det vandrande medeltalet", 150 + 4 * 16 === 214 && 1000 + 4 * 200 === 1800 && approx((214 / 1800) * 100, 11.89, 0.01) && t2.includes("11,9"), "214/1 800 = 11,9 %");
  // D09: inflationens minne 40/100 = 40,0 mot 40/250 = 16,0
  kontroll("D09 inflationens minne", 40 / 100 === 0.4 && 40 / 250 === 0.16 && t2.includes("40,0") && t2.includes("16,0"), "40,0 % bokförd · 16,0 % i nya kronor");
  // D10: negativt eget kapital ⇒ FCF 80/börsvärde 800 = 10,0
  kontroll("D10 kassaflödets avkastning", 80 / 800 === 0.1 && t2.includes("10,0"), "FCF 80/800 = 10,0 %");
  // D11: värdemultiplikatorn 30/8 = 3,75
  kontroll("D11 värdemultiplikatorn", 30 / 8 === 3.75 && t3.includes("3,75"), "30/8 = 3,75 per återinvesterad krona");
  // D12: tvillingarna 0,2 × 30 = 0,6 × 10 = 6 %; FCF 80 mot 40
  kontroll("D12 tvillingarna", 0.2 * 30 === 6 && 0.6 * 10 === 6 && 100 - 20 === 80 && 100 - 60 === 40 && t3.includes("80") && t3.includes("40"), "samma 6 % tillväxt, FCF 80/40");
  // D13: Gordon 0,8 × 1,06/0,04 = 21,2 mot 0,4 × 1,06/0,04 = 10,6
  kontroll("D13 gordon-p/e", approx((0.8 * 1.06) / 0.04, 21.2, 0.01) && approx((0.4 * 1.06) / 0.04, 10.6, 0.01) && t3.includes("21,2") && t3.includes("10,6"), "0,848/0,04 = 21,2 · 0,424/0,04 = 10,6");
  // D14: multipeln dubblerad 21,2/10,6 = 2,0
  kontroll("D14 multipelns pris", approx(21.2 / 10.6, 2, 0.01) && t3.includes("dubblerad"), "21,2/10,6 = exakt 2");
  // D17: orden som FÅNGAS i text men ALDRIG som kärnord (gränsvakterna)
  const gransVakter = ["negativt eget kapital", "inflationens minne", "tillväxtens tvillingar", "multipelns pris", "hur mäter man lönsamhet", "kapitalkostnaden"];
  kontroll("D17 gränsvakter i TEXT", gransVakter.every((g) => t1.toLowerCase().includes(g) || t2.toLowerCase().includes(g) || t3.toLowerCase().includes(g)), "dokumenterade gränser bärs i text med attribution");
  // D19: registrerdrivna tal LIVE (klippskydd) — samtliga tre texter
  const lnAntal = KURSREGISTER.filter((r) => r.kategori === "LÖNSAMHET").length;
  kontroll(
    "D19 registerdrivna tal",
    t1.includes("finns " + lnAntal + " kurser") && t2.includes("finns " + lnAntal + " kurser") && t3.includes("finns " + lnAntal + " kurser"),
    "LÖNSAMHET " + lnAntal + " — LIVE ur registret i alla tre svaren",
  );
  // D20: nivåmarkörer registerdragna
  const ln05 = KURSREGISTER.find((r) => r.slug === "ln-05-vad-ar-lonsamhet");
  const r03 = KURSREGISTER.find((r) => r.slug === "roic-03-inkrementell-roic");
  const r04 = KURSREGISTER.find((r) => r.slug === "roic-04-vardeekvationen");
  kontroll(
    "D20 nivåmarkör",
    t1.includes(ln05.niva.toLowerCase() + " nivå") && t2.includes(r03.niva.toLowerCase() + " nivå") && t3.includes(r04.niva.toLowerCase() + " nivå"),
    ln05.niva.toLowerCase() + " · " + r03.niva.toLowerCase() + " · " + r04.niva.toLowerCase() + " — ur registerfälten",
  );
  // D21: fantomslugar — alla källor och kurslänkar finns i registret
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  const allaSlugs = [
    ...LONSAMHETSGRUND_MONSTER.flatMap((m) => (m.bygga(KURSREGISTER).kallor ?? []).map((k) => k.slug)),
    ...LONSAMHETSGRUND_MONSTER.flatMap((m) => m.bygga(KURSREGISTER).handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.slice("/kurser/".length))),
  ];
  const fantomer = allaSlugs.filter((s) => s && !slugs.has(s));
  kontroll("D21 fantomslug", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : allaSlugs.length + " äkta slug:ar");
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är lönsamhetsmått?", "vad är vinstens förståelse?", "vad är sex stegen?",
    "vad är fakturans trettio dagar?", "vad är vinstens födelse?",
    "vad är nästa krona?", "vad är formeln går sönder?", "vad är inkrementell lönsamhet?",
    "vad är återinvesteringsandelen?", "vad är återinvesteringskvot?",
    "vad är värdeekvationens fem frågor?", "vad är per återinvesterad krona?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltLonsamhetsgrund(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är roic?", "vad är dupont-analysen?", "vad är wacc?", "vad är nopat?",
    "vad är en multipel?", "vad är värderingsmultipel?", "vad är marginaltrappan?",
    "vad är bruttomarginal?", "vad är roe?", "vad är inflationens minne?",
    "vad är negativt eget kapital?", "vad är tillväxtens tvillingar?",
    "vad är multipelns pris på spridningen?", "vad är nya kronor mot bokförda?",
    "vad är hävstång?",
    // NOTera: «hur mäts lönsamhet?» ägs av extra ENDAST i kedjeordning (de
    // ligger före) — frågan innehåller kärnordet «lönsamhet» så detta lager
    // svarar om det nås; H-fallet + kedjetestets fall A bevisar ordningen.
  ];
  let stulna = [];
  for (const f of gransor) if (svaraLokaltLonsamhetsgrund(f, KURSREGISTER)) stulna.push(f);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");

  // F2: juridikgrind — pedagogiskt, aldrig råd
  const t = svaraLokaltLonsamhetsgrund("vad är lönsamhet?", KURSREGISTER).text +
    svaraLokaltLonsamhetsgrund("vad är inkrementell avkastning?", KURSREGISTER).text +
    svaraLokaltLonsamhetsgrund("vad är värdeekvationen?", KURSREGISTER).text;
  const radfraser = [/köp\s+denna/i, /sälj\s+denna/i, /du\s+bör\s+köpa/i, /rekommenderar\s+att\s+du/i, /borde\s+investera/i];
  const radTräff = radfraser.filter((rx) => rx.test(t));
  kontroll(
    "F2 juridikgrind",
    radTräff.length === 0 && t.includes("påhittade") && t.toLowerCase().includes("inga placeringstips"),
    radTräff.length ? "rådfras: " + radTräff.join(", ") : "utbildning + PÅHITTADE-markör + disclaimer",
  );
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL ────────────────────────
{
  const grannar = [
    "vad är marginalhandeln?", "vad är belåningskontot?", "vad är optionsförfallet?",
    "vad är magnetkartan?", "vad är sell the news?", "vad är take or pay?",
    "vad är rnpv?", "vad är budpremien?",
    "vad är en co-investering?", "vad är urvalsasymmetrin?",
    "vad är volatilitetsdraget?", "vad är marginaltrappan?", "vad är täckningsbidraget?",
    "vad är regulatorisk risk?", "vad är gdpr?", "vad är esg?",
    "vad är combined ratio?", "vad är floaten?", "vad är krypto?",
    "vad är prisfullmakten?", "vad är byteskostnaderna?",
    "vad är en net-net och NCAV?", "vad är kapitalbindning?", "vad är dupont-analysen?",
  ];
  let stulna = [];
  for (const f of grannar) if (svaraLokaltLonsamhetsgrund(f, KURSREGISTER)) stulna.push(f);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kedjaKalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kedjaKalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));
  const MOTORER = [];
  for (const d of defs.filter((d) => d.namn !== "lonsamhetsgrund")) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är lönsamhet?", "vad är bageriets trappa?", "vad är kampanjräkningen?",
    "vad är inkrementell avkastning?", "vad är medeltalets blindhet?",
    "vad är nästa kronas avkastning?", "vad är värdeekvationen?",
    "vad är värdemultiplikatorn?", "vad är återinvesteringsandelen?",
  ];
  let skuggor = [];
  for (const f of kanoniska) {
    for (const m of MOTORER) {
      if (m.fnk(f, KURSREGISTER)) { skuggor.push(f + "→" + m.namn); break; }
    }
  }
  kontroll(
    "H ägar-invariant — " + kanoniska.length + " kanoniska NULL genom " + MOTORER.length + " motorer (LIVE ur MOTORDEFS)",
    skuggor.length === 0,
    skuggor.length ? "SKUGGAD: " + skuggor.join(", ") : "framtidsäker — nya syskon flyttar inte mina frågor",
  );
  // H2: MED detta lager (sist av de nya) ⇒ svar
  const svarar = kanoniska.map((f) => svaraLokaltLonsamhetsgrund(f, KURSREGISTER) !== null);
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
  const mina = LONSAMHETSGRUND_MONSTER.flatMap((m) => m.karnord.map(diafri));
  const filer = readdirSync(join(ROT, "src/lib")).filter((f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-lonsamhetsgrund-fragor.ts");
  let kollisioner = [];
  for (const fil of filer) {
    const kalla = readFileSync(join(ROT, "src/lib", fil), "utf8");
    for (const match of kalla.matchAll(/karnord:\s*\[([^\]]*)\]/g)) {
      for (const rm of match[1].matchAll(/"([^"]+)"/g)) {
        const a = diafri(rm[1]);
        for (const b of mina) {
          if (a === b) { kollisioner.push(b + " = " + fil + "«" + rm[1] + "»"); continue; }
          if (a.includes(" ") || b.includes(" ")) continue;
          const tolerans = Math.max(a.length, b.length) <= 3 ? 0 : (Math.min(a.length, b.length) <= 7 ? 1 : 2);
          const d = tavstand(a, b);
          if (d <= Math.min(tolerans, 2) && a !== b) kollisioner.push("tav " + d + ": " + b + " ~ " + fil + "«" + rm[1] + "»");
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
  const posHand = rad.indexOf("svaraLokaltHandelsemotor(");
  const posMin = rad.indexOf("svaraLokaltLonsamhetsgrund(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("lonsamhetsgrund saknas i kedjeraden");
  if (posHand === -1 || posMin === -1 || posRytm === -1 || !(posHand < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat handelsemotor < lonsamhetsgrund < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-lonsamhetsgrund-fragor"')) FEL.push("importen saknas");
  kontroll(
    "L widget-synk — efter handelsemotor, FÖRE marknadsrytm (deras SIST)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "72:a motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u3 fönster 30 (lönsamhetsgrund): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
