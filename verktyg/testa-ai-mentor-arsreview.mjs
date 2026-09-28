/**
 * TESTA AI-MENTORN — PORTFÖLJENS ÅRSREVIEW (s6-u1, fönster 36: årsrapporteringen
 * [pf-12 primär + pf-01 + pf-04 + pf-05 + pf-06 + pf-07 + pf-09 + pf-11 som
 * källor] — den årliga reviewn av portföljens prestation: tidsvägd mot enkel
 * avkastning, protokollets fem frågor, fällorna, AKM1-årsprovet, ritualens
 * sju rader — KATEGORISTÄNGNING PORTFÖLJHANTERING 15/15).
 *
 * Kör:  node verktyg/testa-ai-mentor-arsreview.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för årsreview-frågan (se src/lib/ai-mentor-arsreview-fragor.ts)
 * med bevakning:
 *   A   2 kanoniska ingångar (årsrapportering/portföljreview) → rätt ämne,
 *       primärkälla, FLERKÄLLA (kallor = 8 + numrerad Källor-rad) och
 *       ≥ 8 kurslänkar + 3 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter slutstenarna, FÖRE marknadsrytm —
 *       deras SIST-deklaration); A2b monster-antal + syskon-tåligt
 *       TOTALT-tak
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D12 aritmetik maskinellt omräknad (Nora Portfölj [påhittad]:
 *       262 000 − 250 000 = 12 000 · 6 000/200 000 = +3,0 % ·
 *       6 000/250 000 = +2,4 % · kedjad 1,030 × 1,024 = 1,05472 ⇒ +5,5 % ·
 *       fällvärden 4,8/6,0 % · benchmark 7,2 − 5,5 = 1,7 pp · top-3
 *       +14 200 + 5 100 + 3 800 = +23 100 mot −11 100 = 192 % av netto ·
 *       vikterna 0,67 × 262 000 = 175 540 mot 0,60 × 262 000 = 157 200 ⇒
 *       18 340 kr) + gränsvakter i TEXT + registerdrivna kontroller
 *       (PORTFÖLJHANTERING-antal LIVE, nivåmarkör) + fantomslug
 *   E   kanoniska extra-ingångar (årsreview, årsavslut, portföljåret,
 *       beslutsjournalen, tur eller process, året som gått, …)
 *   F   null-gränser (dokumenterad ägarpol): «årsrapport»/«årsredovisning»/
 *       «kvartalsrapport»/«bokslut» → basens rapport-monster (BOLAGETS
 *       rapportläsning) · «rebalansering» → pf-04:s ägare · «tax-loss» →
 *       pf-09 · «sharpe» → rp-02 · «krischecklistan» → slutstenarnas
 *       pf-07 · «utdelningsstrategin» → pf-05:s familj — lämnas ifred
 *   F2  juridikgrind — pedagogisk text, PÅHITTAD-markör, inga råd
 *   G   ANTISTÖLD — grannlagers kanoniska inklusive FÖNSTRETS SYSKON
 *       (kommande u2/u3 bygger där ute — deras ytor är deras) ⇒ NULL hos mig
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta
 *       lager (motorlistan läses LIVE ur kedjetestets MOTORDEFS) + H2
 *       med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE (kommentar-strippad — omgång 35:s läxa)
 *   L   widget-synk — import + EFTER slutstenarna och FÖRE marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-arsreview.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltArsreview, ARSREVIEW_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-arsreview-fragor.ts")).href
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
// OBS titel-frågan «vad är årsrapportering?» ägs i HELA kedjan av INGEN annan
// (basens «årsrapport» är BOLAGETS rapportläsning och ligger på tavstånd 5 —
// H-fallet bevisar NULL genom kedjan); detta lager äger PORTFÖLJENS vinkel.
const NYA = [
  { fraga: "Vad är årsrapportering?", amne: "årsrapportering", slug: "pf-12-arsrapportering" },
  { fraga: "Vad är en portföljreview?", amne: "årsrapportering", slug: "pf-12-arsrapportering" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltArsreview(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " årsreview", false, "inget lokalt svar på: '" + f.fraga + "'");
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
  const ix = defs.findIndex((d) => d.namn === "arsreview");
  const ixSlut = defs.findIndex((d) => d.namn === "slutstenarna");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2 MOTORDEFS — årsreview wiread med antal 1, index " + ix,
    ix !== -1 && defs[ix].antal === 1 && ixSlut !== -1 && ixRytm !== -1 && ixSlut < ix && ix < ixRytm,
    "efter slutstenarna (" + ixSlut + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer totalt " + defs.length,
  );
  kontroll(
    // Fönster 36: årsreview +1 (detta lager) ⇒ 224 — syskon-tåligt tak:
    // MINST 224; kommande fönsters motorer (u2/u3) bärs av sina egna
    // leveranser. Kedjetestets TOTALT-kommentar är sanningen.
    "A2b MONSTER-ANTAL — lagret bär exakt 1 monster (TOTALT ≥ 224)",
    ARSREVIEW_MONSTER.length === 1 && defs.reduce((s, d) => s + d.antal, 0) >= 224,
    "lager " + ARSREVIEW_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är årsrapporteringen?", amne: "årsrapportering" },      // bestämd form
  { fraga: "vad är arsrapportering?", amne: "årsrapportering" },        // utan diakrit (normaliseras)
  { fraga: "vad är en årsreview?", amne: "årsrapportering" },
  { fraga: "vad är årsavslut?", amne: "årsrapportering" },
  { fraga: "hur gör jag min portföljreview?", amne: "årsrapportering" },
  { fraga: "vad är portföljgranskning?", amne: "årsrapportering" },
  { fraga: "vad är beslutsjournalen?", amne: "årsrapportering" },
  { fraga: "vad är beslutsjournal?", amne: "årsrapportering" },         // obestämd form
  { fraga: "var det tur eller process?", amne: "årsrapportering" },     // protokollets tredje fråga
  { fraga: "vad säger året som gått?", amne: "årsrapportering" },
  { fraga: "vad är portföljåret?", amne: "årsrapportering" },
  { fraga: "hur gör jag en review av portföljen?", amne: "årsrapportering" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltArsreview(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är årsrapportering?", "vad är en portföljreview?", "vad är en årsreview?",
    "vad är beslutsjournalen?", "var det tur eller process?", "vad är årsavslut?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltArsreview(f, KURSREGISTER);
    const b = svaraLokaltArsreview(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (Nora Portfölj — PÅHITTADE tal) ──
{
  const t1 = ARSREVIEW_MONSTER[0].bygga(KURSREGISTER).text;
  kontroll(
    "D01 årets vinst och periodavkastningarna",
    262000 - 250000 === 12000 && 6000 / 200000 === 0.03 && 6000 / 250000 === 0.024 &&
      t1.includes("262 000 − 250 000 = 12 000") && t1.includes("6 000/200 000 = +3,0 %") && t1.includes("6 000/250 000 = +2,4 %"),
    "slut 262 000 − insatt 250 000 = 12 000 · halvåren +3,0 % och +2,4 %",
  );
  kontroll(
    "D02 tidsvägd avkastning — kedjad, inte dividerad",
    approx(1.03 * 1.024, 1.05472, 0.0001) && approx(1.03 * 1.024 - 1, 0.0547, 0.0005) &&
      t1.includes("1,030 × 1,024 = 1,0547 ⇒ +5,5 %") && t1.includes("TIDSVÄGD avkastning"),
    "1,030 × 1,024 = 1,05472 ⇒ +5,5 % — den ärliga siffran",
  );
  kontroll(
    "D03 fällvärdena — tre «sanningar»",
    12000 / 250000 === 0.048 && 12000 / 200000 === 0.06 &&
      t1.includes("12 000 av 250 000 = 4,8 %") && t1.includes("12 000 av startkapitalet 200 000 = 6,0 %"),
    "4,8 % (slutkapitalet) och 6,0 % (startkapitalet) döljer insättningens halvår",
  );
  kontroll(
    "D04 benchmark-differensen",
    approx(7.2 - 5.5, 1.7, 0.05) && t1.includes("underprestation 1,7 procentenheter"),
    "7,2 − 5,5 = 1,7 procentenheter mot rätt benchmark",
  );
  kontroll(
    "D05 top-3-bidragen — koncentrationens läsning",
    14200 + 5100 + 3800 === 23100 && 23100 - 11100 === 12000 && approx(23100 / 12000, 1.925, 0.001) &&
      t1.includes("+14 200, +5 100 och +3 800 = +23 100 brutto") && t1.includes("192 %"),
    "+23 100 brutto mot −11 100 = netto 12 000 · tre positioner bar 192 %",
  );
  kontroll(
    "D06 rebalanseringsbeloppet — viktavvikelsen i kronor",
    0.67 * 262000 === 175540 && 0.6 * 262000 === 157200 && 175540 - 157200 === 18340 &&
      t1.includes("175 540 − 157 200 = 18 340 kronor"),
    "0,67 × 262 000 = 175 540 mot 0,60 × 262 000 = 157 200 ⇒ 18 340 kr att flytta",
  );
  kontroll(
    "D07 gränsvakter i TEXT",
    ["pf-04", "pf-05", "pf-07", "pf-08", "pf-09", "pf-11", "AKM1"].every((g) => t1.includes(g)),
    "dokumenterade gränser bärs i text med attribution (pf-familjen + modellens årsprov)",
  );
  // D08–D09: registerdrivet — kategoriantal och nivå LIVE.
  const pfAntal = KURSREGISTER.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
  kontroll(
    "D08 registerdrivet kategoriantal",
    pfAntal > 0 && t1.includes("I kategorin portföljhantering finns " + pfAntal + " kurser"),
    "PORTFÖLJHANTERING = " + pfAntal + " LIVE ur KURSREGISTER (kategoristängningen = detta tal)",
  );
  const pf12 = KURSREGISTER.find((r) => r.slug === "pf-12-arsrapportering");
  kontroll(
    "D09 nivåmarkör",
    !!pf12 && pf12.niva === "Intermediär" && t1.includes("intermediär nivå"),
    "pf-12 = " + (pf12 ? pf12.niva : "?") + " (registerdrivet, LIVE)",
  );
  // D10: kurslänkarnas slug:ar — alla äkta mot registret.
  const svaret = ARSREVIEW_MONSTER[0].bygga(KURSREGISTER);
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
    svaret.motfraga?.text === "Vad är rebalansering?" && svaret.fordjupa?.lank === "/kurser/pf-12-arsrapportering",
    "motfråga till protokollets fjärde fråga · fördjupa = primärkursen",
  );
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är årsrapportering?", "vad är årsrapporteringen?", "vad är en portföljreview?",
    "vad är portfölj-review?", "vad är en årsreview?", "vad är årsavslut?",
    "vad är portföljåret?", "vad är portföljens år?", "vad är portföljens årsrapport?",
    "vad handlar portföljens prestation om?", "vad är en prestationsreview?",
    "vad är en resultatreview?", "vad är portföljens review?",
    "vad är portföljens läxor?", "vad är en årsgranskning?", "vad är portföljgranskning?",
    "vad är en årsgenomgång?", "vad är en årsutvärdering?", "vad är årsbeslutet?",
    "vad är beslutsjournalen?", "var det tur eller process?", "vad säger året som gått?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltArsreview(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är en årsrapport?",        // basens rapport-monster (BOLAGETS rapportläsning)
    "vad är årsredovisningen?",     // basens — bolagets
    "vad är en kvartalsrapport?",   // basens
    "vad är bokslut?",              // basens
    "vad är rebalansering?",        // pf-04:s ägare (här endast en av fem frågor)
    "vad är tax-loss harvesting?",  // pf-09:s ägare
    "vad är sharpe?",               // rp-02:s ägare
    "vad är en krischecklista?",    // slutstenarnas pf-07-monster
    "vad är utdelningsstrategin?",  // pf-05:s familj — deras fråga
    "vad är ISK?",                  // pf-08:s ägare
  ];
  const stulna = gransor.filter((f) => svaraLokaltArsreview(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2: juridikgrind — pedagogisk text, aldrig rekommendation ──────────
{
  const t = ARSREVIEW_MONSTER[0].bygga(KURSREGISTER).text;
  const paddagogisk = t.includes("utbildning") && t.includes("inga placeringstips");
  const pahittade = t.includes("påhittad");
  const ingaRad = !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t);
  kontroll("F2 juridikgrind", paddagogisk && pahittade && ingaRad, "pedagogisk + påhittade värden + 0 rådsformuleringar");
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL hos detta lager ────────
{
  const grannar = [
    "vad är banklönsamheten?", "vad är cvar?", "vad är krischecklistan?", // slutstenarna
    "vad är korrelationsrisken?", "vad är en bullmarknad?",               // marknadsrytm (SIST-grannen)
    "vad är metcalfes lag?", "vad är en tvåsidig marknad?",               // natverkseffekter
    "vad är enhetsekonomin?", "vad är konverteringstestet?",             // enhetsekonomi
    "vad är walk forward?", "vad är valideringsfönstret?",               // valideringsfonster
    "vad är senioritetsordningen?", "vad är valutasäkringen?",           // skuldordning
    "vad är en moat?",                                                   // moatdjup + basen
  ];
  const stulna = grannar.filter((f) => svaraLokaltArsreview(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "arsreview");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är årsrapportering?", "vad är en portföljreview?", "vad är en årsreview?",
    "vad är beslutsjournalen?", "tur eller process?", "vad säger året som gått?",
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
  const svarar = kanoniska.map((f) => svaraLokaltArsreview(f, KURSREGISTER) !== null);
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
  const mina = ARSREVIEW_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-arsreview-fragor.ts",
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
  const posSlut = rad.indexOf("svaraLokaltSlutstenarna(");
  const posMin = rad.indexOf("svaraLokaltArsreview(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("arsreview saknas i kedjeraden");
  if (posSlut === -1 || posMin === -1 || posRytm === -1 || !(posSlut < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat slutstenarna < arsreview < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-arsreview-fragor"')) FEL.push("importen saknas");
  kontroll(
    "L widget-synk — efter slutstenarna, FÖRE marknadsrytm (deras SIST)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "87:e motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u1 fönster 36 (årsreview — KATEGORISTÄNGNING PORTFÖLJHANTERING 15/15): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
