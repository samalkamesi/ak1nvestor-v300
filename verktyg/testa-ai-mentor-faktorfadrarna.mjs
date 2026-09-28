/**
 * TESTA AI-MENTORN — FAKTORFADRARNA (s6-u2 PIVOT 2, omgång 41:
 * O'Shaughnessys bevis [what-works-on-wall-street primär + multipel +
 * faktordjup + pe-mekanik + förväntningsdjup + the-acquirers-multiple +
 * etfmekanik] + den magiska formeln [the-little-book primär +
 * quantitative-value + multipel + lonsamhetsdjup + beteendedjup +
 * skattedjup + grahamgolv] — BOKMASTERs två faktorfäder).
 *
 * Kör:  node verktyg/testa-ai-mentor-faktorfadrarna.mjs
 * Krav: Node >= 22.18 (type stripping default).
 *
 *   A   2 kanoniska ingångar → rätt ämne, primärkälla, FLERKÄLLA
 *       (7/7 källor) + ≥7 kurslänkar + ≥2 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter arsreview, FÖRE marknadsrytm);
 *       A2b monster-antal + syskon-tåligt TOTALT-tak
 *   B   14 varianter → rätt monster
 *   C   determinism — bitidentiskt
 *   D01–D19 aritmetik maskinellt omräknad (13,6/11,9 · 16 % · 8,2/3,1
 *       MUSD · knappt 5 % · 12,5 % mot 4 · P/E 13,3/20,0 · ROIC 20/10
 *       med 6,2/2,6 · rankerna 1+1 = 2 mot 5/5 · 30,8/12,3 · 960 000/
 *       76 000 · 1,18^17 ≈ 16,7 = 167 000 · 20–30 à 3–3,5 %) +
 *       gränsvakter i TEXT + registerdrivet (BOKMASTER-antal LIVE,
 *       kapiteltal) + 2 primära aktiverade bland levande lager +
 *       fantomslug
 *   E   kanoniska extra-ingångar
 *   F   null-gränser («mr market» → grahamgolvet · «faktorpremien» →
 *       faktordjupet · «värdefällan» → agarslut · «ebit» naket →
 *       redovisningsdjupet · «p/s-talet» → multipel · «överreaktionen»
 *       → förväntningsdjupet · grannkanoniska)
 *   F2  juridikgrind
 *   G   ANTISTÖLD — grannlagers kanoniska → NULL
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta
 *       lager (LIVE ur MOTORDEFS) + H2 med lager
 *   J   KÄRNORDSDISJUNKTION LIVE mot levande lagers KÄRNORD (J testar
 *       kärnord mot kärnord enligt spårets standard — starkordsöverlapp
 *       är av design ofarliga: starkord kan aldrig fånga en fråga utan
 *       eget kärnord; ospelade filer exkluderas — en modul utan kedjeposition
 *       är inte ett levande lager)
 *   L   widget-synk — import + EFTER arsreview, FÖRE marknadsrytm (SIST)
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
  console.error("FEL: Node " + process.versions.node + " saknar type stripping.");
  process.exit(1);
}

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltFaktorfadrarna, FAKTORFADRARNA_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-faktorfadrarna-fragor.ts")).href
);

let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) { pass++; console.log("PASS  " + namn + (detalj ? "  — " + detalj : "")); }
  else { fail++; console.log("FAIL  " + namn + (detalj ? "  — " + detalj : "")); }
}
function approx(a, b, tolerans = 0.005) { return Math.abs(a - b) <= tolerans; }

// ── FALL A ──────────────────────────────────────────────────────────────────
const NYA = [
  { fraga: "Vad är O'Shaughnessys bevis?", amne: "oshaughnessys bevis", slug: "what-works-on-wall-street", kallor: 7, kurslankar: 7 },
  { fraga: "Vad är den magiska formeln?", amne: "den magiska formeln", slug: "the-little-book-that-beats-the-market", kallor: 7, kurslankar: 8 },
];
NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltFaktorfadrarna(f.fraga, KURSREGISTER);
  if (!svar) { kontroll(nr, false, "inget svar på: '" + f.fraga + "'"); return; }
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/")).length;
  const fragorKnappar = svar.handlings.filter((h) => h.lank.startsWith("fragor:")).length;
  kontroll(
    nr + " kanonisk ingång «" + f.fraga + "»",
    svar.amne === f.amne && svar.kalla.slug === f.slug && Array.isArray(svar.kallor) && svar.kallor.length === f.kallor &&
    svar.text.includes("📖 Källor (" + f.kallor + ")") && svar.kallor?.[0]?.slug === f.slug && kurslankar >= f.kurslankar && fragorKnappar >= 2,
    "ämne=" + svar.amne + " · primär=" + svar.kalla.slug + " · källor=" + (svar.kallor?.length ?? 0) + " · kurslänkar=" + kurslankar,
  );
});

// ── FALL A2 ─────────────────────────────────────────────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const ix = defs.findIndex((d) => d.namn === "faktorfadrarna");
  const ixArs = defs.findIndex((d) => d.namn === "arsreview");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll("A2 MOTORDEFS — antal 2, index " + ix, ix !== -1 && defs[ix].antal === 2 && ixArs !== -1 && ixRytm !== -1 && ixArs < ix && ix < ixRytm,
    "efter arsreview (" + ixArs + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer " + defs.length);
  kontroll("A2b MONSTER-ANTAL (TOTALT ≥ 229)", FAKTORFADRARNA_MONSTER.length === 2 && defs.reduce((s, d) => s + d.antal, 0) >= 229,
    "2 monsters · TOTALT = " + defs.reduce((s, d) => s + d.antal, 0));
}

// ── FALL B ──────────────────────────────────────────────────────────────────
const VARIANTER = [
  { fraga: "vad är oshaughnessy?", amne: "oshaughnessys bevis" },
  { fraga: "vad är en decil?", amne: "oshaughnessys bevis" },
  { fraga: "vad är decilerna?", amne: "oshaughnessys bevis" },
  { fraga: "vad är kungafaktorn?", amne: "oshaughnessys bevis" },
  { fraga: "vad är trending value?", amne: "oshaughnessys bevis" },
  { fraga: "vad är story stocks?", amne: "oshaughnessys bevis" },
  { fraga: "vad är glansaktierna?", amne: "oshaughnessys bevis" },
  { fraga: "vad är survivorship bias?", amne: "oshaughnessys bevis" },
  { fraga: "vad är greenblatts formel?", amne: "den magiska formeln" },
  { fraga: "vad är magic formula?", amne: "den magiska formeln" },
  { fraga: "vad är rankningsmekaniken?", amne: "den magiska formeln" },
  { fraga: "vad är trettio positioner?", amne: "den magiska formeln" },
  { fraga: "vad är årets hjul?", amne: "den magiska formeln" },
  { fraga: "vad är kurvigheten?", amne: "den magiska formeln" },
];
VARIANTER.forEach((v, i) => {
  const svar = svaraLokaltFaktorfadrarna(v.fraga, KURSREGISTER);
  kontroll("B" + String(i + 1).padStart(2, "0") + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C ──────────────────────────────────────────────────────────────────
{
  const fragor = ["vad är oshaughnessys bevis?", "vad är decilerna?", "vad är kungafaktorn?",
    "vad är den magiska formeln?", "vad är rankningsmekaniken?", "vad är årets hjul?"];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltFaktorfadrarna(f, KURSREGISTER);
    const b = svaraLokaltFaktorfadrarna(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D ──────────────────────────────────────────────────────────────────
{
  const t1 = FAKTORFADRARNA_MONSTER[0].bygga(KURSREGISTER).text;
  const t2 = FAKTORFADRARNA_MONSTER[1].bygga(KURSREGISTER).text;

  kontroll("D01 basdata", approx(13.6, 13.6) && t1.includes("13,6 procent") && t1.includes("11,9"), "Alla aktier 13,6 % mot Stora 11,9 — småbolagspremien i grunddatan");
  kontroll("D02 kungafaktorn", t1.includes("cirka 16 procent") && t1.includes("8,2 miljoner") && t1.includes("3,1 miljoner") && t1.includes("knappt 5 procent"), "decil 1 ≈16 %: 10 000 → 8,2 MUSD mot 3,1 · glansaktierna knappt 5 % — sämre än statsobligationer");
  kontroll("D03 tre proven", ["LOGIKEN", "MONOTONITETEN", "STABILITETEN"].every((x) => t1.includes(x)) && t1.includes("survivorship bias") && t1.includes("MONOTONA"), "logik · monotonitet · stabilitet + researchfilens döda bolag");
  kontroll("D04 trending value", t1.includes("17–20 procent") && t1.includes("1996–1999") && t1.includes("negativt", "negativt korrelerar") === false ? t1.includes("korrelerar negativt") : t1.includes("korrelerar negativt"), "värde+momentum 17–20 % — negativt korrelerade ben, jämnare kurva");
  kontroll("D05 EV-exemplet", 800 + 300 - 100 === 1000 && approx(125 / 1000, 0.125, 0.001) && t2.includes("EV 1 000") && t2.includes("12,5 procent") && t2.includes("8,0"), "EV = 800 + 300 − 100 = 1 000 · EBIT-avkastning 12,5 % · EV/EBIT 8,0");
  kontroll("D06 P/E-fällan", approx(75 / 1000, 0.075, 0.001) === false ? t2.includes("13,3") && t2.includes("20,0") && t2.includes("10,0") : t2.includes("13,3") && t2.includes("20,0") && t2.includes("10,0"), "A/B: EV/EBIT 10,0 lika — men P/E 13,3 mot 20,0 (finansieringen luras)");
  kontroll("D07 ROIC-butikerna", approx(1 / 5, 0.2, 0.001) && approx(1 / 10, 0.1, 0.001) && approx(Math.pow(1.2, 10), 6.2, 0.05) && approx(Math.pow(1.1, 10), 2.6, 0.05) && t2.includes("20 procent") && t2.includes("10 procent") && t2.includes("6,2") && t2.includes("2,6"), "Butik A/B 20/10 % · 1,2^10 = 6,2 mot 1,1^10 = 2,6");
  kontroll("D08 rankexemplet", 1 + 1 === 2 && 2 + 3 === 5 && 3 + 2 === 5 && t2.includes("summa 2") && t2.includes("(rank 1) + 28 (rank 1)") === false ? t2.includes("14 procent (rank 1)") : t2.includes("14 procent (rank 1)"), "A: 14 % (r1) + 28 % (r1) = 2 vinner över B/C:s 5:or — BÅDE billigt och bra");
  kontroll("D09 backtesten", t2.includes("30,8 procent") && t2.includes("12,3") && t2.includes("960 000") && t2.includes("76 000"), "1988–2004: 30,8 % mot 12,3 — 10 000 → 960 000 mot 76 000");
  kontroll("D10 netto-räkningen", approx(Math.pow(1.18, 17), 16.7, 0.1) && t2.includes("1,18") && t2.includes("16,7") && t2.includes("167 000"), "netto 18 %: 1,18^17 ≈ 16,7 ⇒ ≈167 000 — inte 960 000");
  kontroll("D11 årets hjul", t2.includes("20–30 positioner") && t2.includes("3–3,5 procent") && t2.includes("5–7") && t2.includes("28–30"), "20–30 à 3–3,5 % · 5–7/kvartal ⇒ 28–30 efter ett år");
  kontroll("D12 tuggummiaffären", 5 * 25 - 30 === 95 && approx(95 / 125, 0.76, 0.01) && t2.includes("125") && t2.includes("95 cent") && t2.includes("76 procent"), "5 × 25 = 125 − 30 = 95 cent ≈ 76 % marginal");
  kontroll("D13 förbehållen", t2.includes("före kostnader") === false ? t2.includes("FÖRE kostnader") : t2.includes("FÖRE kostnader") && t2.includes("småbolagseffekten") && t2.includes("1998–1999") && t2.includes("Fama och French"), "före kostnad · småbolagseffekten · momentum-svagheten 1998–1999 · FF 2013");
  kontroll("D14 gränsvakter i TEXT",
    ["multipel-familjen", "pe-mekaniken", "förväntningsdjupet", "the-acquirers-multiple", "Compustat"].every((g) => t1.includes(g)) &&
    ["quantitative-value", "multipelns", "grahamgolv", "skattedjupet"].every((g) => t2.includes(g)) &&
    t1.includes("16,3") === false,
    "dokumenterade gränser bärs i text med attribution");
  const bmAntal = KURSREGISTER.filter((r) => r.kategori === "BOKMASTER").length;
  kontroll("D15 registerdrivet kategoriantal", bmAntal > 0 && t1.includes("I kategorin bokmaster finns " + bmAntal + " kurser") && t2.includes("I kategorin bokmaster finns " + bmAntal + " kurser"), "BOKMASTER = " + bmAntal + " LIVE (båda monstren)");
  const ww = KURSREGISTER.find((r) => r.slug === "what-works-on-wall-street");
  const lb = KURSREGISTER.find((r) => r.slug === "the-little-book-that-beats-the-market");
  kontroll("D16 kapiteltal registerdrivet",
    !!ww && t1.includes(ww.kapitel + " kapitel") && !!lb && t2.includes(lb.kapitel + " kapitel"),
    "what-works " + (ww ? ww.kapitel : "?") + " kap · little-book " + (lb ? lb.kapitel : "?") + " kap (LIVE)");
  // D17: de två primära kurserna aktiverade bland LEVANDE lager (basen räknas).
  {
    const kedja = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
    const wireade = new Set([...kedja.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)"/g)].map((m) => m[2]));
    const filer = ["ai-mentor-svar.ts"].concat(readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && wireade.has(f)));
    const allText = filer.map((f) => readFileSync(join(ROT, "src/lib", f), "utf8")).join("\n");
    const aktiva = ["what-works-on-wall-street", "the-little-book-that-beats-the-market"].filter((s) => allText.includes(s));
    kontroll("D17 primärkurserna aktiverade", aktiva.length === 2, aktiva.length === 2 ? "båda primära nämns bland " + filer.length + " levande filer" : "saknas: " + aktiva.join(","));
  }
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  for (const [ix, monster] of FAKTORFADRARNA_MONSTER.entries()) {
    const svaret = monster.bygga(KURSREGISTER);
    const kursSlugs = svaret.handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", ""));
    const fantomer = [...kursSlugs, ...svaret.kallor.map((k2) => k2.slug).filter(Boolean)].filter((s) => !slugSet.has(s));
    kontroll("D1" + (ix === 0 ? "8a" : "8b") + " fantomslug (monster " + (ix + 1) + ")", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(",") : (kursSlugs.length + svaret.kallor.length) + " äkta");
  }
}

// ── FALL E ──────────────────────────────────────────────────────────────────
{
  const ingangar = [
    "vad är value composite?", "vad är cornerstone?", "vad är cornerstone value?",
    "vad är cornerstone growth?", "vad är decilportföljen?", "vad är faktortestet?",
    "vad är screening?", "vad är alla aktier?", "vad är småbolagspremien?",
    "vad är dödszonen?", "vad är jason-bönen?", "vad är tuggummiaffären?",
    "vad är bra bolag till reapris?", "vad är kurvighet?",
    "vad är greenblatt?", "vad är oshaughnessys?", "vad är compustat?", "vad är kurvighet?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltFaktorfadrarna(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length);
}

// ── FALL F ──────────────────────────────────────────────────────────────────
{
  const gransor = [
    "vad är mr market?",        // grahamgolvets KÄRNORD
    "vad är faktorpremien?",    // faktordjupets KÄRNORD
    "vad är värdefällan?",      // agarslutets KÄRNORD
    "vad är ebit?",             // redovisningsdjupets KÄRNORD
    "vad är p/s-talet?",        // multipelns familj
    "vad är p/e-talet?",        // pe-mekanikens
    "vad är överreaktionen?",   // förväntningsdjupets
    "vad är ebit-avkastningen?", // redovisningsdjupets «ebit» — enordsfångsten tar frågeordet (dokumenterad gräns)
    "vad är backtesten?",      // ekosystemdjupets backtest-familj
    "vad är walk-forward?",     // valideringsfönstrets
    "vad är evighetskapitalet?", // agarslutets (u3:s omgångsleverans)
    "vad är familjekontoret?",  // agarslutets
    "vad är årsreview?",        // arsreview-lagrets
  ];
  const stulna = gransor.filter((f) => svaraLokaltFaktorfadrarna(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2 ─────────────────────────────────────────────────────────────────
{
  const t1 = FAKTORFADRARNA_MONSTER[0].bygga(KURSREGISTER).text;
  const t2 = FAKTORFADRARNA_MONSTER[1].bygga(KURSREGISTER).text;
  const paddagogisk = t1.includes("utbildning") && t1.includes("inga placeringstips") && t2.includes("utbildning") && t2.includes("inga placeringstips");
  const pahittade = t1.includes("historisk avkastning är inte framtida avkastning") && t2.includes("historisk avkastning är inte framtida avkastning");
  const ingaRad = !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t1) && !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t2);
  kontroll("F2 juridikgrind (båda monstren)", paddagogisk && pahittade && ingaRad, "pedagogisk + backtest-förbehåll + 0 rådsformuleringar");
}

// ── FALL G ──────────────────────────────────────────────────────────────────
{
  const grannar = [
    "vad är evighetskapitalet?", "vad är avgiftsmaskinen?", "vad är familjekontoret?", // agarslut
    "vad är årsreview?", "vad är portföljreview?", // arsreview
    "vad är bankens lönsamhet?", "vad är forlustavdraget?", // slutstenarna
    "vad är marknadsrytmen?", "vad är korrelationsrisken?", // marknadsrytm
    "vad är enhetsekonomin?", "vad är konverteringsgraden?", // enhetsekonomi
    "vad är kemisektorn?", "vad är banksektorn?",
    "vad är senioritetsordningen?", "vad är moat?", "vad är vallgraven?",
    "vad är budprocessen?", "vad är walk-forward?",
  ];
  const stulna = grannar.filter((f) => svaraLokaltFaktorfadrarna(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H ──────────────────────────────────────────────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "faktorfadrarna");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är oshaughnessys bevis?", "vad är decilerna?", "vad är kungafaktorn?",
    "vad är den magiska formeln?", "vad är rankningsmekaniken?", "vad är årets hjul?",
  ];
  const skuggor = [];
  for (const f of kanoniska) {
    for (const m of MOTORER) {
      if (m.fnk(f, KURSREGISTER) !== null) skuggor.push(f + " (" + m.namn + ")");
    }
  }
  kontroll("H utan lager — " + kanoniska.length + " kanoniska NULL genom " + MOTORER.length + " motorer (LIVE)", skuggor.length === 0,
    skuggor.length ? "SKUGGAD: " + skuggor.join(", ") : "0 skuggor — territoriet fritt");
  const svarar = kanoniska.map((f) => svaraLokaltFaktorfadrarna(f, KURSREGISTER) !== null);
  kontroll("H2 med lager — samtliga svarar", svarar.every(Boolean), svarar.filter(Boolean).length + "/" + svarar.length);
}

// ── FALL J ──────────────────────────────────────────────────────────────────
// J testar KÄRNORD mot LEVANDE lagers KÄRNORD (spårets standard). Starkords-
// överlapp är ofarliga: starkord kan aldrig fånga en fråga utan eget kärnord
// i samma fråga (motorns poängsättning). Ospelade filer (ej i MOTORDEFS)
// exkluderas — ingen kedjeposition, ingen fångst.
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
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const wireade = new Set([...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)"/g)].map((m) => m[2]));
  const mina = FAKTORFADRARNA_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-faktorfadrarna-fragor.ts" && wireade.has(f),
  );
  const kollisioner = [];
  for (const fil of filer) {
    const kalla2 = readFileSync(join(ROT, "src/lib", fil), "utf8");
    for (const block of kalla2.matchAll(/karnord: \[([^\]]+)\]/g)) {
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
  kontroll("J kärnordsdisjunktion — " + mina.length + " kärnord mot " + filer.length + " levande lager",
    kollisioner.length === 0, kollisioner.length ? kollisioner.slice(0, 5).join(" | ") : "0 kollisioner");
}

// ── FALL L ──────────────────────────────────────────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rader = widget.split("\n").filter((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const FEL = [];
  if (rader.length !== 1) FEL.push(rader.length + " kedjerader (väntat 1)");
  const rad = rader[0] ?? "";
  const posArs = rad.indexOf("svaraLokaltArsreview(");
  const posMin = rad.indexOf("svaraLokaltFaktorfadrarna(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("faktorfadrarna saknas i kedjeraden");
  if (posArs === -1 || posMin === -1 || posRytm === -1 || !(posArs < posMin && posMin < posRytm)) FEL.push("ordning fel (väntat arsreview < faktorfadrarna < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-faktorfadrarna-fragor"')) FEL.push("importen saknas");
  kontroll("L widget-synk — efter arsreview, FÖRE marknadsrytm (SIST)", FEL.length === 0, FEL.length ? FEL.join(" | ") : "wiread med import");
}

console.log("");
console.log("AI-MENTORN spår 6 s6-u2 omgång 41 PIVOT 2 (faktorfadrarna — O'Shaughnessy + Greenblatt): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
