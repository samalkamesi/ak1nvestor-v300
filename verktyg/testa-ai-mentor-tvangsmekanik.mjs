/**
 * TESTA AI-MENTORN — TVÅNGSMEKANIK (s6-u2, fönstret efter omgång 27:
 * marginalhandeln [am-09 primär + km-030 + mk-04 + bf-15 + am-01 som
 * källor] + optionsförfallets dag [kt-08 primär + km-059 + am-05 + kt-03 +
 * od-01 som källor] — kontraktet som säljer åt dig och kalendern som
 * flyttar kursen).
 *
 * Kör:  node verktyg/testa-ai-mentor-tvangsmekanik.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets två förhandsfrågor (se
 * src/lib/ai-mentor-tvangsmekanik-fragor.ts) med bevakning:
 *   A   4 kanoniska ingångar (marginalhandeln/belåningskontot +
 *       optionsförfallet/förfalloptron) → rätt ämne, primärkälla,
 *       FLERKÄLLA (kallor = 5 + numrerad Källor-rad) och ≥ 4 kurslänkar
 *   A2  MOTORDEFS-position LIVE (index 68, efter co-invest, FÖRE
 *       marknadsrytm — deras SIST-deklaration)
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D20 aritmetik maskinellt omräknad (belåningsvärdet, grundtalen,
 *       kaskaden, kravdagens S, hävstången 1,5, räntan 5 950/496,
 *       nettoformeln 1,5a − 0,5r, spegeln, brytpunkten a = r,
 *       magnetkartan 15 %/24 %, hedgens 12 000 åt båda håll, σ 1,5 % ⇒
 *       49,5 %) + D21–D22 registerdrivna räknekontroller (AKTIEMARKNADEN
 *       I PRAKTIKEN / KATALYSATOR, LIVE ur KURSREGISTER) + D23 nivåkontroll
 *       + D24 fantomslug
 *   E   kanoniska extra-ingångar (kaskadpunkten, marginalkravet,
 *       magnetkartan, uteståendet, värdeandelen, kravdagen,
 *       underhållskravet, volatilitetens torka, häxtimman,
 *       marginalens två betydelser)
 *   F   16 null-gränser (sondens dokumenterade ägarpol): «open interest»
 *       (realekonomin) · «pin-risken» (basen) · «gamma-hedgning»
 *       (valutamekaniken) · «stängningsauktionen» (handelsdagen) ·
 *       «förfallodagen»/«delta» (optionshantverket) · naket «hävstång»/
 *       «margin call»/«margin of safety»/«marginalen» (basen) ·
 *       «belåningsgrad» (sektorn, tav 2) · «belåningsräntan»/
 *       «utlåningsräntan» (handelsdagen, tav 2) · «utlåningsgrad»
 *       (sektorn) · «köpoptionen» (optionsdjupet) · TEXT-burna
 *       «värderingsmarginalen» (km-030:s territorium) och «gamman»
 *       (od-familjens) — lämnas NULL
 *   G   ANTISTÖLD — grannlagers kanoniska (volatilitetsdraget,
 *       marginaltrappan, co-investeringen, straddeln, binomialträdet,
 *       utfasningarna, andrahandsmarknaden, spreaden, kortläget,
 *       auktionen, indexomläggningen …) → NULL
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS — framtidsäker
 *       när syskonens fönsterlager wireas) + H2 med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER co-invest och FÖRE marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-tvangsmekanik.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltTvangsmekanik, TVANGSMEKANIK_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-tvangsmekanik-fragor.ts")).href
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

// ── FALL A: fyra kanoniska ingångar, två monster, flerkällskrav ─────────────
const NYA = [
  { fraga: "Vad är marginalhandeln?", amne: "marginalhandeln", slug: "am-09-marginalhandeln" },
  { fraga: "Vad är belåningskontot?", amne: "marginalhandeln", slug: "am-09-marginalhandeln" },
  { fraga: "Vad är optionsförfallet?", amne: "optionsförfallets dag", slug: "kt-08-optionsforfallets-dag" },
  { fraga: "Vad är förfalloptron?", amne: "optionsförfallets dag", slug: "kt-08-optionsforfallets-dag" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltTvangsmekanik(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " tvångsmekanik", false, "inget lokalt svar på: '" + f.fraga + "'");
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
  const ix = defs.findIndex((d) => d.namn === "tvangsmekanik");
  const rytmIx = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    // Fönster 29 (s6-u2, _s6u2o29-): syskon-tålig position — direkt efter
    // co-invest med marknadsrytm NÅGONSTANS EFTER (fönster 29:s handelsemotor
    // + fönster 30:s lönsamhetsgrund wireade lagligt däremellan, FÖRE
    // marknadsrytm som förblir SIST).
    "A2 MOTORDEFS — tvångsmekanik wiread med antal 2, index " + ix,
    ix !== -1 && defs[ix].antal === 2 && defs[ix - 1]?.namn === "co-invest" && rytmIx > ix,
    "efter " + (defs[ix - 1]?.namn ?? "?") + ", marknadsrytm (SIST) på " + rytmIx + " · motorer totalt " + defs.length,
  );
  kontroll(
    // Fönster 29 (s6-u2, _s6u2o29-): 189 → 191 (händelsemotor +2 EFTER detta
    // lager — syskon-tålig: taket är MINST 191; senare fönsters motorer bärs
    // av sina egna leveranser). Fönster 30 (s6-u3, _s6u3o29-): lönsamhetsgrund
    // +3 ⇒ 194 i samma andetag — kedjetestets TOTALT-kommentar är sanningen.
    "A2b MONSTER-ANTAL — lagret bär exakt 2 monsters (TOTALT ≥ 191)",
    TVANGSMEKANIK_MONSTER.length === 2 && defs.reduce((s, d) => s + d.antal, 0) >= 191,
    "lager " + TVANGSMEKANIK_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är marginalhandelen?", amne: "marginalhandeln" },          // stavfel e/o
  { fraga: "vad är marginalhandeln", amne: "marginalhandeln" },            // utan frågetecken
  { fraga: "hur fungerar marginalhandel?", amne: "marginalhandeln" },
  { fraga: "vad är ett belåningskonto?", amne: "marginalhandeln" },
  { fraga: "vad är belåningsvärdet?", amne: "marginalhandeln" },
  { fraga: "vad är marginalkrav?", amne: "marginalhandeln" },
  { fraga: "vad är en tvångsförsäljning?", amne: "marginalhandeln" },
  { fraga: "vad är kravdagen?", amne: "marginalhandeln" },
  { fraga: "vad är optionsförfallets dag?", amne: "optionsförfallets dag" },
  { fraga: "vad är magnetkartorna?", amne: "optionsförfallets dag" },      // plural
  { fraga: "vad är utestående kontrakt?", amne: "optionsförfallets dag" },
  { fraga: "vad är häxtimmen?", amne: "optionsförfallets dag" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltTvangsmekanik(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är marginalhandeln?", "vad är kaskadpunkten?", "vad är optionsförfallet?",
    "vad är förfalloptron?", "vad är magnetkartan?", "vad är underhållskravet?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltTvangsmekanik(f, KURSREGISTER);
    const b = svaraLokaltTvangsmekanik(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (kursernas EGNA modelltal) ────────
{
  const t1 = svaraLokaltTvangsmekanik("vad är marginalhandeln?", KURSREGISTER).text;
  const t2 = svaraLokaltTvangsmekanik("vad är optionsförfallet?", KURSREGISTER).text;

  // D01: belåningsvärdet 105 000 + 50 000 + 12 500 = 167 500
  kontroll("D01 belåningsvärdet", 150000 * 0.7 + 100000 * 0.5 + 50000 * 0.25 === 167500 && t1.includes("167 500"), "167 500 kronor i texten");
  // D02: belåningsvärdeandelen 55,8 %
  kontroll("D02 belåningsvärdeandel", approx((167500 / 300000) * 100, 55.8, 0.05) && t1.includes("55,8"), "55,8 % av 300 000");
  // D03: grundtalen 33,3/66,7
  kontroll("D03 grundtalen", approx((100000 / 300000) * 100, 33.3, 0.05) && approx((200000 / 300000) * 100, 66.7, 0.05) && t1.includes("33,3") && t1.includes("66,7"), "belåningsgrad 33,3 · värdeandel 66,7");
  // D04–D07: kaskaden vid −20/−40/−50/−55
  kontroll("D04 kaskaden −20", approx((240000 - 100000) / 240000 * 100, 58.3, 0.05) && t1.includes("58,3"), "140 000/240 000 = 58,3 %");
  kontroll("D05 kaskaden −40", approx((180000 - 100000) / 180000 * 100, 44.4, 0.05) && t1.includes("44,4"), "80 000/180 000 = 44,4 %");
  kontroll("D06 kaskaden −50", approx((150000 - 100000) / 150000 * 100, 33.3, 0.05) && t1.includes("33,3"), "50 000/150 000 = 33,3 %");
  kontroll("D07 kaskaden −55 ⇒ marginalkrav", approx((135000 - 100000) / 135000 * 100, 25.9, 0.05) && t1.includes("25,9"), "35 000/135 000 = 25,9 % < 30");
  // D08: kravdagens S ≥ 18 300 (kursens avrundade kedja: 35 000/0,30 = 116 666,67 ⇒ 116 700; 135 000 − 116 700 = 18 300; exakt gräns 18 333)
  kontroll("D08 kravdagen", approx(35000 / 0.3, 116700, 40) && 135000 - 116700 === 18300 && approx(135000 - 35000 / 0.3, 18333.33, 1) && t1.includes("18 300"), "S ≥ 135 000 − 116 700 = 18 300 (exakt 18 333)");
  // D09: hävstången 1,5 och det egna kapitalets −82,5 %
  kontroll("D09 hävstången", 300000 / 200000 === 1.5 && approx(1.5 * 55, 82.5, 0.05) && approx(200000 * (1 - 0.825), 35000, 1) && t1.includes("82,5"), "1,5 × 55 = 82,5 % ⇒ 35 000 kvar");
  // D10: räntan 5 950/år ≈ 496/mån
  kontroll("D10 räntan", approx(100000 * 0.0595, 5950, 0.5) && approx(5950 / 12, 495.8, 0.5) && t1.includes("5 950") && t1.includes("496"), "5 950/år · 496/mån");
  // D11: nettoformeln +8 ⇒ 9,0
  kontroll("D11 netto +8", approx(1.5 * 8 - 0.5 * 5.95, 9.025, 0.005) && approx((300000 * 0.08 - 5950) / 200000 * 100, 9.0, 0.05) && t1.includes("9,0"), "1,5 × 8 − 0,5 × 5,95 = 9,0 %");
  // D12: netto −8 ⇒ −15,0 (spegeln +1,0/−7,0)
  kontroll("D12 netto −8", approx((-300000 * 0.08 - 5950) / 200000 * 100, -15.0, 0.05) && t1.includes("15,0") && t1.includes("7,0"), "−29 950/200 000 = −15,0 %");
  // D13: magnetkartan 300 000/1 200 000/500 000 aktier
  kontroll("D13 magnetkartan", 3000 * 100 === 300000 && 12000 * 100 === 1200000 && 5000 * 100 === 500000 && t2.includes("1 200 000"), "95/100/105 ⇒ 300 000/1 200 000/500 000");
  // D14: andelen 15 % av 8 000 000 — och 24 % när omsättningen sinar
  kontroll("D14 magnetandel", approx((1200000 / 8000000) * 100, 15, 0.05) && approx((1200000 / 5000000) * 100, 24, 0.05) && t2.includes("15 procent") && t2.includes("24 procent"), "15 % · 24 % vid 5 000 000");
  // D15: hedgen 50 000 korta; 0,62 ⇒ köper 12 000; 0,38 ⇒ köper tillbaka 12 000
  kontroll("D15 hedgen", 1000 * 100 * 0.5 === 50000 && 1000 * 100 * 0.62 - 50000 === 12000 && 50000 - 1000 * 100 * 0.38 === 12000 && t2.includes("12 000"), "±12 000 åt båda håll");
  // D16: grundplanen σ 1,5 % ⇒ 49,5 % inom en krona (2Φ(1/1,5)−1)
  kontroll("D16 grundplanen", approx(2 * 0.7475 - 1, 0.495, 0.005) && t2.includes("49,5"), "2Φ(0,667) − 1 ≈ 49,5 %");
  // D17: orden som FÅNGAS i text men ALDRIG som kärnord (gränsvakterna)
  const gransVakter = ["open interest", "gamman", "stängningsauktionen", "förfallodagen", "hävstång", "värderingsmarginalen"];
  kontroll("D17 gränsvakter i TEXT", gransVakter.every((g) => t1.includes(g) || t2.includes(g)), "dokumenterade gränser bärs i text med attribution");
  // D18: takfällans räkning (167 500 på 367 500; −40 % ⇒ 24,0 %)
  kontroll("D18 takfällan", approx((367500 * 0.6 - 167500) / (367500 * 0.6) * 100, 24.0, 0.05) && t1.includes("24,0"), "under kravet efter ordinärt fall");
  // D19: registrerdrivna tal LIVE (klippskydd)
  const amAntal = KURSREGISTER.filter((r) => r.kategori === "AKTIEMARKNADEN I PRAKTIKEN").length;
  const ktAntal = KURSREGISTER.filter((r) => r.kategori === "KATALYSATOR").length;
  kontroll(
    "D19 registerdrivna tal",
    t1.includes("finns " + amAntal + " kurser") && t2.includes("finns " + ktAntal + " kurser"),
    "AKTIEMARKNADEN I PRAKTIKEN " + amAntal + " · KATALYSATOR " + ktAntal + " — LIVE ur registret",
  );
  // D20: nivåmarkören registerdragen
  const am09 = KURSREGISTER.find((r) => r.slug === "am-09-marginalhandeln");
  const kt08 = KURSREGISTER.find((r) => r.slug === "kt-08-optionsforfallets-dag");
  kontroll(
    "D20 nivåmarkör",
    t1.includes(am09.niva.toLowerCase() + " nivå") && t2.includes(kt08.niva.toLowerCase() + " nivå"),
    am09.niva.toLowerCase() + " · " + kt08.niva.toLowerCase() + " — ur registerfälten",
  );
  // D21: fantomslugar — alla källor och kurslänkar finns i registret
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  const allaSlugs = [
    ...TVANGSMEKANIK_MONSTER.flatMap((m) => (m.bygga(KURSREGISTER).kallor ?? []).map((k) => k.slug)),
    ...TVANGSMEKANIK_MONSTER.flatMap((m) => m.bygga(KURSREGISTER).handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.slice("/kurser/".length))),
  ];
  const fantomer = allaSlugs.filter((s) => s && !slugs.has(s));
  kontroll("D21 fantomslug", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : allaSlugs.length + " äkta slug:ar");
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är kaskadpunkten?", "vad är marginalkravet?", "vad är värdeandelen?",
    "vad är kaskaden?", "vad är underhållskravet?", "vad är belåningsfaktorerna?",
    "vad är marginalens två betydelser?", "vad är det belåningsbara värdet?",
    "vad är magnetkartan?", "vad är uteståendet?", "vad är volatilitetens torka?",
    "vad är rullningen?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltTvangsmekanik(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är open interest?", "vad är pin-risken?", "vad är gamma-hedgning?",
    "vad är stängningsauktionen?", "vad är förfallodagen?", "vad är delta?",
    "vad är hävstång?", "vad är margin call?", "vad är margin of safety?",
    "vad är marginalen?", "vad är belåningsgrad?", "vad är belåningsräntan?",
    "vad är utlåningsgrad?", "vad är utlåningsräntan?", "vad är en köpoption?",
    "vad är värderingsmarginalen?", "vad är gamman?",
  ];
  let stulna = [];
  for (const f of gransor) if (svaraLokaltTvangsmekanik(f, KURSREGISTER)) stulna.push(f);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");

  // F2: juridikgrind — pedagogiskt, aldrig råd
  const t = svaraLokaltTvangsmekanik("vad är marginalhandeln?", KURSREGISTER).text +
    svaraLokaltTvangsmekanik("vad är optionsförfallet?", KURSREGISTER).text;
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
    "vad är volatilitetsdraget?", "vad är marginaltrappan?", "vad är täckningsbidraget?",
    "vad är en co-investering?", "vad är urvalsasymmetrin?",
    "vad är binomialträdet?", "vad är en straddle?", "vad är deltat?",
    "vad är utfasningar?", "vad är andrahandsmarknaden?", "vad är sekvensrisken?",
    "vad är spread?", "vad är kortläge?", "vad är indexomläggningen?",
    "vad är auktioner?", "vad är en net-net och NCAV?", "vad är dupont-analysen?",
    "vad är bruttomarginalen?", "vad är regulatorisk risk?", "vad är gdpr?",
  ];
  let stulna = [];
  for (const f of grannar) if (svaraLokaltTvangsmekanik(f, KURSREGISTER)) stulna.push(f);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kedjaKalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kedjaKalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));
  const MOTORER = [];
  for (const d of defs.filter((d) => d.namn !== "tvangsmekanik")) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är marginalhandeln?", "vad är belåningskontot?", "vad är kaskadpunkten?",
    "vad är marginalkravet?", "vad är optionsförfallet?", "vad är förfalloptron?",
    "vad är magnetkartan?", "vad är uteståendet?",
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
  const svarar = kanoniska.map((f) => svaraLokaltTvangsmekanik(f, KURSREGISTER) !== null);
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
  const mina = TVANGSMEKANIK_MONSTER.flatMap((m) => m.karnord.map(diafri));
  const filer = readdirSync(join(ROT, "src/lib")).filter((f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-tvangsmekanik-fragor.ts");
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
  const posCoin = rad.indexOf("svaraLokaltCoinvest(");
  const posMin = rad.indexOf("svaraLokaltTvangsmekanik(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("tvångsmekanik saknas i kedjeraden");
  if (posCoin === -1 || posMin === -1 || posRytm === -1 || !(posCoin < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat co-invest < tvångsmekanik < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-tvangsmekanik-fragor"')) FEL.push("importen saknas");
  kontroll(
    "L widget-synk — efter co-invest, FÖRE marknadsrytm (deras SIST)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "70:e motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u2 fönstret efter omgång 27 (tvångsmekanik): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
