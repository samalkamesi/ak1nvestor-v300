/**
 * TESTA AI-MENTORN — SPÅR 6, OMGÅNG 15, BYGGARE s6-u1 (avkastningskurve-lagret).
 *
 * Kör:  node verktyg/testa-ai-mentor-avkastningskurva.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för s6-u1 omgång 15:s nya förhandsfråga (den omvända
 * avkastningskurvan — se src/lib/ai-mentor-avkastningskurva-fragor.ts) med
 * bevakning av:
 *   A  1 ny kanonisk → rätt ämne, primärkälla, FLERKÄLLA (kallor ≥ 2 +
 *      numrerad Källor-rad i texten) och ≥ 3 kurslänkar per svar
 *   B  12 felstavade/varierade varianter → samma träff som den kanoniska
 *      + 3 dokumenterade fällor (cape/case-klassen: nakna inverter-ord får
 *      ALDRIG fånga investeringsfrågor — B10–B12 vaktar båda riktningarna)
 *   C  determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D  källaäkthet — varje källa/kurslänk i det nya svaret FINNS i registret
 *      (fantomslugar är testfel) + fragor:-knappar levande mot HELA kedjan
 *      (knappen pekar på makro-lagrets styrränta — "tidigare lager"-kravet)
 *      + registerdrivna räknekontroller i texten (klippskydd, inkl
 *      "undefined"-grinden: mk-kurserna saknar minuter i registret —
 *      svaret bär KAPITEL i stället) + aritmetikkontroll av illustrationens
 *      två summor (lutning + inversion)
 *   E  3 omatchade frågor → null (API-flödet får dem)
 *   F  juridikgrind-lint — inga rådfraser i det nya svaret
 *   G  ANTISTÖLD — samtliga tidigare kanoniska frågor (inklusive omgång
 *      14:s tre lager) ger NULL i avkastningskurve-lagret
 *   G2 SYSKONKÄRNORD — samtliga kärnord i de 27 tidigare lagren läses
 *      LIVE ur modulerna och ställs som frågor ("vad är X?") → 0 fångster
 *      i detta lager (fångar även framtida syskonkrockar)
 *   H  hela kedjan (makro ?? extra ?? bas ?? … ?? risklasningsdjup ??
 *      avkastningskurva, som chat-widget.tsx på disk): alla kanoniska
 *      frågor når RÄTT lager
 *   I  OMKASTAD ANTISTÖLD — den nya kanoniska ger NULL i kedjan UTAN
 *      avkastningskurve-lagret: inget tidigare lager fångar den
 *   J  kärnordsdisjunktion MEKANISKT — AVKASTNINGSKURVA_MONSTER:s kärnord
 *      är disjunkta mot samtliga tidigare lagers kärnord, lästa LIVE
 *   L  WIDGET-SYNK — chat-widget.tsx:s kedjerad bär ALLA 28 lager i rätt
 *      ordning + importen finns (dödkodsmissen c363ec8b kan inte upprepas
 *      tyst)
 *
 * SAMMA FÖNSTER: ai-mentor-register rebakat 401→402 (basotestets E01 var
 * rött — vr-04-rebaken i spår 5 nådde aldrig mentorsregistret; detta test
 * läser 402-registret och K03 vaktar att det STÅR i 402-läget).
 *
 * NOTIS Node 22.23 (module-typeless-reparse): modul-namespace-åtkomst via
 * punktnotation kan ge undefined för .ts-moduler i denna miljö — alla
 * importer destruktureras (samma mönster som samtliga syskontest).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-avkastningskurva.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet) — destrukturerad.
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltAvkastningskurva, AVKASTNINGSKURVA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-avkastningskurva-fragor.ts")).href);

// Syskonlager — toleranta importer (syskon kan skriva just nu).
function tolerera(fil, exports) {
  try {
    return import(pathToFileURL(join(ROT, "src/lib", fil)).href);
  } catch {
    console.log("NOT  syskonfil ej importbar just nu: " + fil);
    return Object.fromEntries(exports.map((e) => [e, null]));
  }
}
const { svaraLokaltExtra, EXTRA_MONSTER } = await tolerera("ai-mentor-extra-fragor.ts", ["svaraLokaltExtra", "EXTRA_MONSTER"]);
const { svaraLokaltMakro, MAKRO_MONSTER } = await tolerera("ai-mentor-makro-fragor.ts", ["svaraLokaltMakro", "MAKRO_MONSTER"]);
const { svaraLokaltNasta, NASTA_MONSTER } = await tolerera("ai-mentor-nasta-fragor.ts", ["svaraLokaltNasta", "NASTA_MONSTER"]);
const { svaraLokaltKapitalmekanik, KAPITALMEKANIK_MONSTER } = await tolerera("ai-mentor-kapitalmekanik-fragor.ts", ["svaraLokaltKapitalmekanik", "KAPITALMEKANIK_MONSTER"]);
const { svaraLokaltSektor, SEKTOR_MONSTER } = await tolerera("ai-mentor-sektor-fragor.ts", ["svaraLokaltSektor", "SEKTOR_MONSTER"]);
const { svaraLokaltCase, CASE_MONSTER } = await tolerera("ai-mentor-case-fragor.ts", ["svaraLokaltCase", "CASE_MONSTER"]);
const { svaraLokaltPraktik, PRAKTIK_MONSTER } = await tolerera("ai-mentor-praktik-fragor.ts", ["svaraLokaltPraktik", "PRAKTIK_MONSTER"]);
const { svaraLokaltPortfoljgrund, PORTFOLJGRUND_MONSTER } = await tolerera("ai-mentor-portfoljgrund-fragor.ts", ["svaraLokaltPortfoljgrund", "PORTFOLJGRUND_MONSTER"]);
const { svaraLokaltAgande, AGANDE_MONSTER } = await tolerera("ai-mentor-agande-fragor.ts", ["svaraLokaltAgande", "AGANDE_MONSTER"]);
const { svaraLokaltRedovisningsdjup, REDOVISNINGSDJUP_MONSTER } = await tolerera("ai-mentor-redovisningsdjup-fragor.ts", ["svaraLokaltRedovisningsdjup", "REDOVISNINGSDJUP_MONSTER"]);
const { svaraLokaltDjup, DJUP_MONSTER } = await tolerera("ai-mentor-djup-fragor.ts", ["svaraLokaltDjup", "DJUP_MONSTER"]);
const { svaraLokaltHistoria, HISTORIA_MONSTER } = await tolerera("ai-mentor-historia-fragor.ts", ["svaraLokaltHistoria", "HISTORIA_MONSTER"]);
const { svaraLokaltLonsamhetsdjup, LONSAMHETSDJUP_MONSTER } = await tolerera("ai-mentor-lonsamhetsdjup-fragor.ts", ["svaraLokaltLonsamhetsdjup", "LONSAMHETSDJUP_MONSTER"]);
const { svaraLokaltTsdjup, TSDJUP_MONSTER } = await tolerera("ai-mentor-tsdjup-fragor.ts", ["svaraLokaltTsdjup", "TSDJUP_MONSTER"]);
const { svaraLokaltSkattedjup, SKATTEDJUP_MONSTER } = await tolerera("ai-mentor-skattedjup-fragor.ts", ["svaraLokaltSkattedjup", "SKATTEDJUP_MONSTER"]);
const { svaraLokaltBeteendedjup, BETEENDEDJUP_MONSTER } = await tolerera("ai-mentor-beteendedjup-fragor.ts", ["svaraLokaltBeteendedjup", "BETEENDEDJUP_MONSTER"]);
const { svaraLokaltRiskdjup, RISKDJUP_MONSTER } = await tolerera("ai-mentor-riskdjup-fragor.ts", ["svaraLokaltRiskdjup", "RISKDJUP_MONSTER"]);
const { svaraLokaltRiskmattsdjup, RISKMATTSDJUP_MONSTER } = await tolerera("ai-mentor-riskmattsdjup-fragor.ts", ["svaraLokaltRiskmattsdjup", "RISKMATTSDJUP_MONSTER"]);
const { svaraLokaltUtdelningsdjup, UTDELNINGSDJUP_MONSTER } = await tolerera("ai-mentor-utdelningsdjup-fragor.ts", ["svaraLokaltUtdelningsdjup", "UTDELNINGSDJUP_MONSTER"]);
const FORV = await tolerera("ai-mentor-forvantningsdjup-fragor.ts", ["svaraLokaltForvantningsdjup", "FÖRVÄNTNINGSDJUP_MONSTER"]);
const svaraLokaltForvantningsdjup = FORV.svaraLokaltForvantningsdjup;
const FORVANTNINGSDJUP_MONSTER = FORV["FÖRVÄNTNINGSDJUP_MONSTER"];
const { svaraLokaltPortfoljbalans, PORTFOLJBALANS_MONSTER } = await tolerera("ai-mentor-portfoljbalans-fragor.ts", ["svaraLokaltPortfoljbalans", "PORTFOLJBALANS_MONSTER"]);
const { svaraLokaltStabilitetsdjup, STABILITETSDJUP_MONSTER } = await tolerera("ai-mentor-stabilitetsdjup-fragor.ts", ["svaraLokaltStabilitetsdjup", "STABILITETSDJUP_MONSTER"]);
const { svaraLokaltGrahamgolv, GRAHAMGOLV_MONSTER } = await tolerera("ai-mentor-grahamgolv-fragor.ts", ["svaraLokaltGrahamgolv", "GRAHAMGOLV_MONSTER"]);
const { svaraLokaltVarderjustering, VARDERJUSTERING_MONSTER } = await tolerera("ai-mentor-varderjustering-fragor.ts", ["svaraLokaltVarderjustering", "VARDERJUSTERING_MONSTER"]);
const { svaraLokaltOptionsdjup, OPTIONS_DJUP_MONSTER } = await tolerera("ai-mentor-optionsdjup-fragor.ts", ["svaraLokaltOptionsdjup", "OPTIONS_DJUP_MONSTER"]);
const RLD = await tolerera("ai-mentor-risklasningsdjup-fragor.ts", ["svaraLokaltRisklasningsdjup", "svaraLokaltVarderingsverktyg", "RISKLASNINGSDJUP_MONSTER"]);
const svaraLokaltRisklasningsdjup = RLD.svaraLokaltRisklasningsdjup;
const RISKLASNINGSDJUP_MONSTER = RLD.RISKLASNINGSDJUP_MONSTER;

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

// ── FALL A: den nya kanoniska med flerkällskrav ─────────────────────────────
const NYA = [
  {
    fraga: "Vad är den omvända avkastningskurvan?",
    amne: "avkastningskurva",
    slug: "mk-08-omvand-yield-curve",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltAvkastningskurva(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length >= 2;
  const kallradOk = svar.text.includes("📖 Källor (");
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/"));
  const kurslankarOk = kurslankar.length >= 3;
  kontroll(
    nr + " " + f.amne + " — '" + f.fraga + "'",
    amneOk && kallaOk && kallorFinns && kallradOk && kurslankarOk,
    "ämne=" + svar.amne + " · källa=" + svar.kalla.slug +
      " · källor=" + (svar.kallor ? svar.kallor.length : 0) +
      " · kurslänkar=" + kurslankar.length,
  );
});

// ── FALL B: felstavade varianter + dokumenterade fällor ────────────────────
const FELSTAVADE = [
  { fraga: "vad ar avkastningskurvan?", amne: "avkastningskurva" }, // diafri (ä)
  { fraga: "vad är yield curve?", amne: "avkastningskurva" }, // engelsk term (fras)
  { fraga: "vad är en inverterad yield curve?", amne: "avkastningskurva" }, // kurv-fras
  { fraga: "vad är räntekurvan?", amne: "avkastningskurva" }, // svensk synonym
  { fraga: "förklara omvänd räntekurva", amne: "avkastningskurva" }, // kurv-fras utan frågeord
  { fraga: "vad menas med kurvinvertering?", amne: "avkastningskurva" }, // familjeordet
  { fraga: "vad är kurvinverterad kurva?", amne: "avkastningskurva" }, // böjning
  { fraga: "vad är avkastningskurvor?", amne: "avkastningskurva" }, // plural
  { fraga: "vad betyder det när kurvan inverteras?", amne: "avkastningskurva" }, // starkordsburen
  { fraga: "vad ar rentekurvan for nagot?", amne: "avkastningskurva" }, // felstavning (ä, ö)
  { fraga: "hur länser jag räntekurvan?", amne: "avkastningskurva" }, // felstavning (ä)
  { fraga: "vad är inverterad räntekurva?", amne: "avkastningskurva" }, // kurv-fras
];

FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltAvkastningskurva(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// B10–B12: cape/case-klassens fälla — nakna inverter-ord ligger tavstånd
// 1–2 från "investerad"/"investering"; dessa frågor FÅR ALDRIG fångas av
// detta lager (de tillhör kedjan/API-flödet, inte kurven).
const FALLOR = [
  "hur blir jag investerad i aktier?",
  "vad är investering?",
  "vad är en god investering?",
];
FALLOR.forEach((fraga, i) => {
  const nr = "B" + String(FELSTAVADE.length + i + 1).padStart(2, "0");
  const svar = svaraLokaltAvkastningskurva(fraga, KURSREGISTER);
  kontroll(nr + " inverter/invester-fällan — '" + fraga + "'", svar === null,
    svar ? "fångad (FEL — kärnordsläcka mot invester-stammen)" : "null ✓ (naken inverter-ord är bara starkord)");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltAvkastningskurva(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltAvkastningskurva(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL D: källaäkthet — källor och kurslänkar FINNS i registret ─────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltAvkastningskurva(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const k of svar.kallor ?? []) {
      if (k.slug && !slugFinns.has(k.slug)) FEL.push("källa '" + k.slug + "' (" + f.amne + ") finns ej i registret");
    }
    if ((svar.kallor ?? []).length > 0 && svar.kallor[0].slug !== svar.kalla.slug) {
      FEL.push("kallor[0] (" + svar.kallor[0].slug + ") != kalla (" + svar.kalla.slug + ") i " + f.amne);
    }
    for (const h of svar.handlings) {
      if (h.lank.startsWith("/kurser/")) {
        const s = h.lank.slice("/kurser/".length);
        if (!slugFinns.has(s)) FEL.push("kurslänk '" + s + "' (" + f.amne + ") finns ej i registret");
      } else if (!h.lank.startsWith("fragor:")) {
        FEL.push("oväntad länk '" + h.lank + "' i " + f.amne);
      }
    }
  }
  kontroll("D01 källaäkthet — inga fantomslugar i det nya svaret", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta");

  // fragor:-knappar skall landa i HELA kedjan — denna knapp pekar på
  // makro-lagrets styrränta ("vad är styrräntan?"), därför körs kontrollen
  // mot den fullständiga kedjan (dokumenterat undantag enligt
  // lönsamhetsdjup-precedensen: knappen behöver inte peka på eget lager).
  const helakedjan = (fraga) =>
    (svaraLokaltMakro ? svaraLokaltMakro(fraga, KURSREGISTER) : null) ??
    (svaraLokaltExtra ? svaraLokaltExtra(fraga, KURSREGISTER) : null) ??
    svaraLokalt(fraga, KURSREGISTER) ??
    (svaraLokaltNasta ? svaraLokaltNasta(fraga, KURSREGISTER) : null) ??
    (svaraLokaltKapitalmekanik ? svaraLokaltKapitalmekanik(fraga, KURSREGISTER) : null) ??
    (svaraLokaltSektor ? svaraLokaltSektor(fraga, KURSREGISTER) : null) ??
    (svaraLokaltCase ? svaraLokaltCase(fraga, KURSREGISTER) : null) ??
    (svaraLokaltPraktik ? svaraLokaltPraktik(fraga, KURSREGISTER) : null) ??
    (svaraLokaltPortfoljgrund ? svaraLokaltPortfoljgrund(fraga, KURSREGISTER) : null) ??
    (svaraLokaltAgande ? svaraLokaltAgande(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRedovisningsdjup ? svaraLokaltRedovisningsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltDjup ? svaraLokaltDjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltHistoria ? svaraLokaltHistoria(fraga, KURSREGISTER) : null) ??
    (svaraLokaltLonsamhetsdjup ? svaraLokaltLonsamhetsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltTsdjup ? svaraLokaltTsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltSkattedjup ? svaraLokaltSkattedjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltBeteendedjup ? svaraLokaltBeteendedjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRiskdjup ? svaraLokaltRiskdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRiskmattsdjup ? svaraLokaltRiskmattsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltUtdelningsdjup ? svaraLokaltUtdelningsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltForvantningsdjup ? svaraLokaltForvantningsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltPortfoljbalans ? svaraLokaltPortfoljbalans(fraga, KURSREGISTER) : null) ??
    (svaraLokaltStabilitetsdjup ? svaraLokaltStabilitetsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltGrahamgolv ? svaraLokaltGrahamgolv(fraga, KURSREGISTER) : null) ??
    (svaraLokaltVarderjustering ? svaraLokaltVarderjustering(fraga, KURSREGISTER) : null) ??
    (svaraLokaltOptionsdjup ? svaraLokaltOptionsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRisklasningsdjup ? svaraLokaltRisklasningsdjup(fraga, KURSREGISTER) : null) ??
    svaraLokaltAvkastningskurva(fraga, KURSREGISTER);
  for (const f of NYA) {
    const svar = svaraLokaltAvkastningskurva(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (28 lager)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategoriernas antal och kursernas
  // KAPITEL i texten ska komma ur registret (klippskydd vid registerändring
  // — spår 5:s rebake). mk-kurserna saknar minuten i registret (undefined)
  // — därför KAPITEL + en mekanisk "undefined"-grind.
  const mkAntal = KURSREGISTER.filter((r) => r.kategori === "MAKROEKONOMI").length;
  const maAntal = KURSREGISTER.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
  const mk08 = KURSREGISTER.find((r) => r.slug === "mk-08-omvand-yield-curve");
  const mk06 = KURSREGISTER.find((r) => r.slug === "mk-06-penningpolitik");
  const mk01 = KURSREGISTER.find((r) => r.slug === "mk-01-bnp-och-tillvaxt");
  const svar = svaraLokaltAvkastningskurva(NYA[0].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — MAKROEKONOMI=" + mkAntal + " · MAKROEKONOMI & RÄNTA=" + maAntal + " · kapitel " + (mk08 ? mk08.kapitel : "?") + "/" + (mk06 ? mk06.kapitel : "?") + "/" + (mk01 ? mk01.kapitel : "?"),
    !!svar &&
      svar.text.includes("I kategorin makroekonomi finns " + mkAntal + " kurser") &&
      svar.text.includes("makroekonomi & ränta " + maAntal) &&
      (mk08 ? svar.text.includes(mk08.kapitel + " kapitel") : false) &&
      (mk06 ? svar.text.includes(mk06.kapitel + " kapitel") : false) &&
      (mk01 ? svar.text.includes(mk01.kapitel + " kapitel") : false),
    "texten ska bära registrets egna tal",
  );
  kontroll(
    "D02b undefined-grinden — ingen 'undefined'-läcka från registerfält",
    !!svar && !svar.text.includes("undefined") && !JSON.stringify(svar.handlings).includes("undefined"),
    "mk-kursernas minuter är undefined i registret; svaret bär kapitel i stället",
  );

  // Aritmetikkontroll — illustrationens två summor i texten stämmer med
  // den mekanik den lär ut (normallutningen + inversionstecknet).
  const arit = !!svar &&
    svar.text.includes("3,5 − 2,0 = 1,5 procentenheter") && // normallutningens ersättning
    svar.text.includes("3,0 − 4,0 = −1,0 procentenhet"); // inversionens tecken
  kontroll("D03 aritmetik — illustrationens två summor (1,5 / −1,0) korrekta i texten", arit,
    arit ? "lutning · inversionstecken ✓" : "någon summa saknas/fel i texten");
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Oslo imorgon?",
  "Vem målade Skriet?",
  "Hur många tangenter har ett piano?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltAvkastningskurva(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i det nya svaret ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltAvkastningskurva(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser i avkastningskurve-svaret", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering (mekanikpresedensen)");
}

// ── FALL G: ANTISTÖLD — tidigare kanoniska ger null i detta lager ───────────
const GAMLA = [
  // Basens femton kanoniska
  { fraga: "Vad är AKM1?", amne: "akm1" },
  { fraga: "Hur börjar jag lära mig aktieanalys?", amne: "borja" },
  { fraga: "Vad är en impulsvåg?", amne: "impulsvåg" },
  { fraga: "Vad kostar det?", amne: "kostnad" },
  { fraga: "Ger ni investeringsråd?", amne: "råd" },
  { fraga: "Vad är V09?", amne: "variabel-V09" },
  { fraga: "Vad är teknisk analys?", amne: "teknisk analys" },
  { fraga: "Hur hanterar jag risk?", amne: "risk" },
  { fraga: "Hur bygger jag en portfölj?", amne: "portfölj" },
  { fraga: "Vilka böcker ska jag läsa?", amne: "böcker" },
  { fraga: "Hur fungerar quiz och XP?", amne: "quiz-xp" },
  { fraga: "Vad är Fas 1, 2 och 3?", amne: "faser" },
  { fraga: "Vad är konfluens?", amne: "konfluens" },
  { fraga: "Vad är vågfundamentet?", amne: "vågfundament" },
  { fraga: "Vad är AK1TS?", amne: "ak1ts" },
  // Våg 158 omgång 1
  { fraga: "Vad är utdelning och direktavkastning?", amne: "utdelning" },
  { fraga: "Vilken lärväg ska jag välja?", amne: "lärväg" },
  { fraga: "Hur påverkar psykologin mitt sparande?", amne: "beteende" },
  { fraga: "Hur fungerar ISK och skatt?", amne: "skatt" },
  { fraga: "Hur läser jag en kvartalsrapport?", amne: "rapportläsning" },
  { fraga: "Vad är nyckeltal?", amne: "nyckeltal" },
  { fraga: "Vad är kassaflödesanalys?", amne: "kassaflödesanalys" },
  { fraga: "Vad är fundamental analys?", amne: "fundamental analys" },
  { fraga: "Vad är en moat?", amne: "moat" },
  // Makro
  { fraga: "Vad är ränta och hur påverkar den aktier?", amne: "ränta" },
  { fraga: "Vad är inflation och KPI?", amne: "inflation" },
  // Nästa
  { fraga: "Hur värderar man ett bolag med DCF?", amne: "värdering" },
  { fraga: "Vad är substansvärde?", amne: "investmentbolag" },
  { fraga: "Vad är en option?", amne: "options" },
  // Sektor (omgång 3)
  { fraga: "Vad är sektorsanalys och varför skiljer sig sektorer åt?", amne: "sektorsanalys" },
  { fraga: "Hur fungerar banker och banksektorn?", amne: "bank" },
  { fraga: "Hur fungerar fastighetsbolag?", amne: "fastighet" },
  // Kapitalmekanik (omgång 4)
  { fraga: "Vad är utspädning?", amne: "emission" },
  { fraga: "Vad är goodwill?", amne: "goodwill" },
  // Case (omgång 5)
  { fraga: "Vad är praktiska case?", amne: "case" },
  // Praktik (omgång 6)
  { fraga: "Vad är indexfonder och passivt ägande?", amne: "index" },
  { fraga: "Hur fungerar blankning och short?", amne: "blankning" },
  { fraga: "Vad är vinstmarginal och hur gör man en marginalanalys?", amne: "marginal" },
  // Portfoljgrund (omgång 7)
  { fraga: "Vad är diversifiering och korrelation?", amne: "diversifiering" },
  { fraga: "Vad är valutarisk?", amne: "valutarisk" },
  // Ägande (omgång 8, syskon u2)
  { fraga: "Vad är en bolagsstämma?", amne: "bolagsstämma" },
  { fraga: "Vad gör en styrelse?", amne: "bolagsstyrning" },
  // Redovisningsdjup (omgång 8, syskon u1)
  { fraga: "Vad är avskrivningar?", amne: "avskrivning" },
  { fraga: "Hur fungerar leasing i bokföringen?", amne: "leasing" },
  // Djup (omgång 8, syskon u3 — omstart)
  { fraga: "Vad är en värderingsmultipel?", amne: "multipel" },
  { fraga: "Vad är FOMO?", amne: "fomo" },
  { fraga: "Vem är Warren Buffett?", amne: "mastarna" },
  // Historia (omgång 9, syskon u3)
  { fraga: "Vad var tulpanmanin?", amne: "tulpanmanin" },
  { fraga: "Vad är en börsbubbla?", amne: "bubbla" },
  { fraga: "Vad hände vid aktiekraschen 1929?", amne: "krasch1929" },
  // Lönsamhetsdjup (omgång 10, syskon u2)
  { fraga: "Vad är DuPont-analysen?", amne: "dupont" },
  { fraga: "Vad är ROIC?", amne: "roic" },
  // Tsdjup (omgång 10, syskon u1)
  { fraga: "vad är fibonacci retracements?", amne: "fibonacci" },
  { fraga: "hur fungerar fibonacci extensions?", amne: "extension" },
  { fraga: "vad är gann-vinklar?", amne: "gann" },
  { fraga: "vad är en volymprofil och vpoc?", amne: "volymdjup" },
  // Skattedjup (omgång 10, syskon u3)
  { fraga: "Vad är kapitalförsäkring?", amne: "kapitalforsakring" },
  { fraga: "Vad är bolagsskatt?", amne: "bolagsskatt" },
  { fraga: "Hur fungerar optionsbeskattning?", amne: "optionsbeskattning" },
  // Beteendedjup (omgång 11, syskon u3)
  { fraga: "Vad är bekräftelsefällan?", amne: "bekraftelsefalla" },
  { fraga: "Vad är ankareffekten?", amne: "ankareffekt" },
  { fraga: "Vad är mental accounting?", amne: "mentalaccounting" },
  // Riskdjup (omgång 11, syskon u1)
  { fraga: "Vad är skuldfällan?", amne: "skuldfalla" },
  { fraga: "Vad är en svart svan?", amne: "svartsvan" },
  // Riskmåttsdjup (omgång 12, syskon u1)
  { fraga: "Vad är sharpe-kvoten?", amne: "sharpekvot" },
  // Utdelningsdjup (omgång 12, syskon u2)
  { fraga: "Vad är utdelningsfällor?", amne: "utdelningsfalla" },
  { fraga: "Vad är aktieåterköp?", amne: "aktieaterkop" },
  // Förväntningsdjup (omgång 12, syskon u3)
  { fraga: "Vad är förväntningsanalys?", amne: "forvantningsanalys" },
  { fraga: "Vad är förväntningsgapet?", amne: "forvantningsgap" },
  { fraga: "Vad är kalibrering?", amne: "kalibrering" },
  // Omgång 13 (syskon u1/u2/u3)
  { fraga: "Vad är rebalansering?", amne: "rebalansering" },
  { fraga: "Vad är känslighetsanalys?", amne: "kanslighetsanalys" },
  { fraga: "Vad är soliditetsgrad?", amne: "soliditetsgrad" },
  { fraga: "Vad är en net-net?", amne: "netnet" },
  { fraga: "Vad är cigar butts?", amne: "cigarbutt" },
  { fraga: "Vem är Mr Market?", amne: "mrmarket" },
  // Omgång 14 (syskon u1/u2/u3)
  { fraga: "Vad är normaliserad vinst?", amne: "normalisering" },
  { fraga: "Vad är summan av delarna?", amne: "sotp" },
  { fraga: "Vad är en köpoption?", amne: "kopoption" },
  { fraga: "Vad är kundkoncentration?", amne: "kundkoncentration" },
  { fraga: "Vad är en riskmatris?", amne: "riskmatris" },
  { fraga: "Hur läser jag riskavsnittet?", amne: "riskavsnitt" },
];
{
  const STJALDA = GAMLA.filter((f) => svaraLokaltAvkastningskurva(f.fraga, KURSREGISTER) !== null);
  kontroll("G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i avkastningskurve-lagret", STJALDA.length === 0,
    STJALDA.length ? STJALDA.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltAvkastningskurva(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓");
}

// ── FALL G2: SYSKONKÄRNORD — alla tidigare kärnord som frågor → 0 fångster ─
{
  const tidigareMonster = [
    MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER,
    KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER,
    PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER,
    DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER,
    TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER,
    RISKDJUP_MONSTER, RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER,
    FORVANTNINGSDJUP_MONSTER, PORTFOLJBALANS_MONSTER,
    STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER,
    VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLASNINGSDJUP_MONSTER,
  ].filter(Array.isArray);
  let karnord = 0;
  const fragor = [];
  for (const monster of tidigareMonster) {
    for (const m of monster) {
      for (const k of m.karnord ?? []) {
        karnord++;
        fragor.push("vad är " + k + "?");
      }
    }
  }
  const fangade = fragor.filter((f) => svaraLokaltAvkastningskurva(f, KURSREGISTER) !== null);
  kontroll(
    "G2 syskonkärnord — " + karnord + " kärnord LIVE som frågor → 0 fångster",
    fangade.length === 0,
    fangade.length ? "fångade: " + fangade.slice(0, 5).join(" | ") : "0 krockar mot " + tidigareMonster.length + " lager",
  );
}

// ── FALL H: hela kedjan (som chat-widget.tsx) — alla når RÄTT lager ────────
{
  const kedja = (fraga) =>
    (svaraLokaltMakro ? svaraLokaltMakro(fraga, KURSREGISTER) : null) ??
    (svaraLokaltExtra ? svaraLokaltExtra(fraga, KURSREGISTER) : null) ??
    svaraLokalt(fraga, KURSREGISTER) ??
    (svaraLokaltNasta ? svaraLokaltNasta(fraga, KURSREGISTER) : null) ??
    (svaraLokaltKapitalmekanik ? svaraLokaltKapitalmekanik(fraga, KURSREGISTER) : null) ??
    (svaraLokaltSektor ? svaraLokaltSektor(fraga, KURSREGISTER) : null) ??
    (svaraLokaltCase ? svaraLokaltCase(fraga, KURSREGISTER) : null) ??
    (svaraLokaltPraktik ? svaraLokaltPraktik(fraga, KURSREGISTER) : null) ??
    (svaraLokaltPortfoljgrund ? svaraLokaltPortfoljgrund(fraga, KURSREGISTER) : null) ??
    (svaraLokaltAgande ? svaraLokaltAgande(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRedovisningsdjup ? svaraLokaltRedovisningsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltDjup ? svaraLokaltDjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltHistoria ? svaraLokaltHistoria(fraga, KURSREGISTER) : null) ??
    (svaraLokaltLonsamhetsdjup ? svaraLokaltLonsamhetsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltTsdjup ? svaraLokaltTsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltSkattedjup ? svaraLokaltSkattedjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltBeteendedjup ? svaraLokaltBeteendedjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRiskdjup ? svaraLokaltRiskdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRiskmattsdjup ? svaraLokaltRiskmattsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltUtdelningsdjup ? svaraLokaltUtdelningsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltForvantningsdjup ? svaraLokaltForvantningsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltPortfoljbalans ? svaraLokaltPortfoljbalans(fraga, KURSREGISTER) : null) ??
    (svaraLokaltStabilitetsdjup ? svaraLokaltStabilitetsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltGrahamgolv ? svaraLokaltGrahamgolv(fraga, KURSREGISTER) : null) ??
    (svaraLokaltVarderjustering ? svaraLokaltVarderjustering(fraga, KURSREGISTER) : null) ??
    (svaraLokaltOptionsdjup ? svaraLokaltOptionsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRisklasningsdjup ? svaraLokaltRisklasningsdjup(fraga, KURSREGISTER) : null) ??
    svaraLokaltAvkastningskurva(fraga, KURSREGISTER);
  const fel = [];
  for (const f of [...GAMLA, ...NYA]) {
    const svar = kedja(f.fraga);
    if (!svar || svar.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (svar ? svar.amne : "null") + " (väntat " + f.amne + ")");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla + " + NYA.length + " nya når rätt lager (28 lager, som chat-widget.tsx på disk)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + NYA.length) + "/" + (GAMLA.length + NYA.length) + " rätt lager",
  );

  // ── FALL I: OMKASTAD ANTISTÖLD — min kanoniska ger null UTAN detta ──────
  const kedjaUtanMitt = (fraga) =>
    (svaraLokaltMakro ? svaraLokaltMakro(fraga, KURSREGISTER) : null) ??
    (svaraLokaltExtra ? svaraLokaltExtra(fraga, KURSREGISTER) : null) ??
    svaraLokalt(fraga, KURSREGISTER) ??
    (svaraLokaltNasta ? svaraLokaltNasta(fraga, KURSREGISTER) : null) ??
    (svaraLokaltKapitalmekanik ? svaraLokaltKapitalmekanik(fraga, KURSREGISTER) : null) ??
    (svaraLokaltSektor ? svaraLokaltSektor(fraga, KURSREGISTER) : null) ??
    (svaraLokaltCase ? svaraLokaltCase(fraga, KURSREGISTER) : null) ??
    (svaraLokaltPraktik ? svaraLokaltPraktik(fraga, KURSREGISTER) : null) ??
    (svaraLokaltPortfoljgrund ? svaraLokaltPortfoljgrund(fraga, KURSREGISTER) : null) ??
    (svaraLokaltAgande ? svaraLokaltAgande(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRedovisningsdjup ? svaraLokaltRedovisningsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltDjup ? svaraLokaltDjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltHistoria ? svaraLokaltHistoria(fraga, KURSREGISTER) : null) ??
    (svaraLokaltLonsamhetsdjup ? svaraLokaltLonsamhetsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltTsdjup ? svaraLokaltTsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltSkattedjup ? svaraLokaltSkattedjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltBeteendedjup ? svaraLokaltBeteendedjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRiskdjup ? svaraLokaltRiskdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRiskmattsdjup ? svaraLokaltRiskmattsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltUtdelningsdjup ? svaraLokaltUtdelningsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltForvantningsdjup ? svaraLokaltForvantningsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltPortfoljbalans ? svaraLokaltPortfoljbalans(fraga, KURSREGISTER) : null) ??
    (svaraLokaltStabilitetsdjup ? svaraLokaltStabilitetsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltGrahamgolv ? svaraLokaltGrahamgolv(fraga, KURSREGISTER) : null) ??
    (svaraLokaltVarderjustering ? svaraLokaltVarderjustering(fraga, KURSREGISTER) : null) ??
    (svaraLokaltOptionsdjup ? svaraLokaltOptionsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltRisklasningsdjup ? svaraLokaltRisklasningsdjup(fraga, KURSREGISTER) : null);
  const tjuvade = NYA.filter((f) => kedjaUtanMitt(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 1 ny kanonisk ger null i kedjan UTAN avkastningskurve-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kedjaUtanMitt(f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER, RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FORVANTNINGSDJUP_MONSTER, PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER, VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLASNINGSDJUP_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of AVKASTNINGSKURVA_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — AVKASTNINGSKURVA_MONSTER vs 27 tidigare lager (" + tidigare.size + " kärnord)",
    krock.length === 0,
    krock.length ? krock.join(" | ") : "0 överlapp ✓",
  );
}

// ── FALL K: register-läge — 440 kurser (spår 5:s omgång-18-rebake) ──────────
{
  // 2026-09-19: 432 → 440 av spår 5 omgång 18 (ib-04, roic-04) — s6-u3
  // omgång 22:s fönster bär botet (KVD-fyndet kvarstår: hårdkodade register-
  // lägen åldras med varje spår-5-rebake; basotestet E01 förblir grinden).
  // 2026-09-18: 402 → 408 av spår 5 omgång 13 (st-05, ma-04, roic-02, mt-05,
  // ma-03-realrantan, od-04) — harmoniskt uppdaterat av s6-u1 omgång 16:s
  // fönster (KVD-fyndet att hårdkodade register-lägen åldras med varje
  // spår-5-rebake; basotestet E01 förblir äkthetsgrinden).
  kontroll(
    "K03 register-läge — 495 kurser (spår 5:s kullar t.o.m. 2026-09-24: omgång-23-rebake +6 [am-09/rp-06/pe-07/kt-08/vr-09/ek-07] + senare fönsters kurser; harmoniserat av s6-u3 fönster 35 — rebaken får ALDRIG glömma mentorsregistret; basotestet E01 är grinden)",

      // Fönster 29 (s6-u2, _s6u2o29-): K03 470→476 — spår 5:s omgång-24-rebake (2026-09-20:

      // sj-07/tx-06/ib-06 + rp-07/ib-07/tx-07) växte registret utan svitpass; E01-grund (registrets

      // äkthet) oförändrad — konstanten följer registret.
    // Fönstret efter omgång 27 (s6-u2, _s6u2o28-): 464→470 — spår 5:s omgång 23
    // lämnade konstanten efterföljande (KVD-fyndet kvarstår: hårdkodade
    // registerlägen åldras med varje rebake; basotestet E01 förblir grinden).
    // Fönster 31 (s6-u3, _s6u3o31-): 476→483 — spår 5:s omgång 25 (2026-09-21:
    // bf-17/od-09/kt-09 479→482 + se-23 stålsektorn 482→483) växte registret;
    // E01-grunden (registrets äkthet) oförändrad — konstanten följer registret.
    // Fönster 35 (s6-u3, _s6u3o35-): 483→495 — spår 5:s kullar 2026-09-21→24
    // växte registret (489→495: se-22 + ma-09/rp-07/ln-06/st-08/ks-08/ks-09/
    // roic-06/tx-06/tx-07/pf-07/v15 m.fl.); E01-grunden (registrets äkthet)
    // oförändrad — konstanten följer registret.
    KURSREGISTER.length === 495,
    "fick " + KURSREGISTER.length + " (spår 5:s rebake får ALDRIG glömma mentorsregistret — basotestet E01 är grinden)",
  );
}

// ── FALL L: WIDGET-SYNK — kedjeraden i chat-widget.tsx bär alla lager ──────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const KOMPONENTER = [
    // R154-v3 (rond 154, huvudagenten [Φ]): HELA widgetkedjan i exakt ordning —
    // 81 lager. v2:s regex tappade nakna "svaraLokalt" + siffersuffix (grinden
    // fångade det: "okänd kedjekomponent"). Dokumentationsplikten (V219) full-
    // följdas: arrayen speglar hela kedjan, som fönsterharmoniserarna jagade.
    // Provenienskommentarer från V219/o24/o27/o31/v1/v2 bevaras nedan.
    // R154-v2-normalisering (rond 154, huvudagenten [Φ]): arrayen omskriven till
    // WIDGETENS exakta kedjeordning (mängden oförändrad) — v1:s infogning före
    // marknadsrytm-ankaret gav fel ordning för tidigt hörande komponenter.
    // Kommentarsproveniens nedan bevarad i ursprunglig ordning.
    // Omgång 24-harmonisering (s6-u3): våg 189:s marknadsmekanik wireades utan
    // harmonisering — baslinjens röda L01; kedjeordning efter case (kedjetestet G).
    // Omgång 17:s fönsterlager (harmonisering enligt omgång 8-presedensen): u2 ekosystemdjup + u1 handelsdag + u3 portföljpraktik.
    // Omgång 20 (2026-09-18): u3 beteendemekanik + u1 pe-mekanik + u2 överlevnadsdjup — svitharmonisering (dokumentationsplikten).
    // Omgång 22:s fönster (dubbeldispatchad u1-instans faktordjup FÖRE bokmastar,
    // sedan s6-u3 bokmastar + s6-u2 riskbudget + s6-u1 konvertibel — svitharmoniseringens dokumentationsplikt).
    // Omgång 23 (2026-09-19): u2 sektorlasning + u3 vardegrund + u1 realekonomi — svitharmonisering (dokumentationsplikten).
    // Omgång 24 (s6-u3-harmonisering): fönstrets tre sista komponenter i
    // wireningsordning — u1 försäkring (55) · u2 moatdjup (56) · u3 nya
    // territorier (57). Idempotent: körs igen ⇒ 0 ändringar.
    // Omgång 25-harmonisering (s6-u2, 2026-09-20): fönstrets tre nya komponenter i
    // kedjeordning (u1 etfmekanik 59 · s6-u2 kontrahent 60 · u3 marknadsrytm 61).
    // Omgång 25-tillägg (s6-u2 försök 2, 2026-09-20): grundmultiplarna —
    // 61:a motorn, FÖRE marknadsrytm (deras SIST-deklaration; v04 P/S + v05 P/B).
    // Omgång 26 (manifest auto-s6-1789890903364 — ordningspasset efter två
    // krockade harmoniseringsvågor): fönstrets tre i KEDJEORDNING — riskadress
    // (s6-u1, 62:a) · balansdjup (s6-u2, 63:e) · optionshantverk (s6-u3, 64:e)
    // — FÖRE marknadsrytm (deras SIST-deklaration).
    // V219-harmonisering (rond 114): pengarstid wireades i widgeten utan svitharmonisering
    // (föregångare: 54e7a59e studio: auto s6-u2 AI-MENTORN +2 FÖRHANDSFRÅGOR — PENGARNAS TID OCH ORD) — mellan optionshantverk och marknadsrytm.
    // Omgång 27 (auto-s6-1789912510460, s6-u2): volatilitetsmekanik — slutsvepet.
    // Fönster 31-harmonisering (s6-u3, _s6u3o31-): fönstrets tre nya komponenter i
    // widgetordning — u1 stålsektor (74:e) · u2 casepraktik (75:e) · u3 beteendefallor
    // (76:e) — FÖRE marknadsrytm (deras SIST-deklaration). Idempotent.
    // komponenter wireades i widgeten utan full svitharmonisering (V219-läxan):
    // kategoristangning (1ea8ccb8+932659c9) · banksektorn (a092db0e) · notlasning ·
    // nykull · nyfodda · skuldordning · valideringsfonster — här i widgetordning.
    "svaraLokaltMakro", "svaraLokaltExtra", "svaraLokaltModernaRisker", "svaraLokalt",
    "svaraLokaltNasta", "svaraLokaltKapitalmekanik", "svaraLokaltSektor", "svaraLokaltCase",
    "svaraLokaltMarknadsmekanik", "svaraLokaltPraktik", "svaraLokaltValutamekanik", "svaraLokaltPortfoljgrund",
    "svaraLokaltAgande", "svaraLokaltRedovisningsdjup", "svaraLokaltDjup", "svaraLokaltHistoria",
    "svaraLokaltLonsamhetsdjup", "svaraLokaltTsdjup", "svaraLokaltSkattedjup", "svaraLokaltBeteendedjup",
    "svaraLokaltRiskdjup", "svaraLokaltRiskmattsdjup", "svaraLokaltUtdelningsdjup", "svaraLokaltForvantningsdjup",
    "svaraLokaltPortfoljbalans", "svaraLokaltStabilitetsdjup", "svaraLokaltGrahamgolv", "svaraLokaltVarderjustering",
    "svaraLokaltOptionsdjup", "svaraLokaltRisklasningsdjup", "svaraLokaltAvkastningskurva", "svaraLokaltAvkastningsdjup",
    "svaraLokaltVarderingsverktyg", "svaraLokaltWarrant", "svaraLokaltTidsaxel", "svaraLokaltKapitalbindning",
    "svaraLokaltEkosystemdjup", "svaraLokaltHandelsdag", "svaraLokaltPortfoljpraktik", "svaraLokaltUtdelningskalender",
    "svaraLokaltKreditdjup", "svaraLokaltSektordjup", "svaraLokaltSektorskola2", "svaraLokaltBeteendemekanik",
    "svaraLokaltPeMekanik", "svaraLokaltRiskpremie", "svaraLokaltOverlevnadsdjup", "svaraLokaltKoncernlasning",
    "svaraLokaltTillvaxtdjup", "svaraLokaltFaktordjup", "svaraLokaltBokmastar", "svaraLokaltRiskbudget",
    "svaraLokaltKonvertibel", "svaraLokaltSektorlasning", "svaraLokaltVardegrund", "svaraLokaltRealekonomi",
    "svaraLokaltForsakring", "svaraLokaltMoatdjup", "svaraLokaltNyaTerritorier", "svaraLokaltEtfmekanik",
    "svaraLokaltKontrahent", "svaraLokaltMultipel", "svaraLokaltRiskadress", "svaraLokaltBalansdjup",
    "svaraLokaltOptionshantverk", "svaraLokaltPengarstid", "svaraLokaltVolatilitetsmekanik", "svaraLokaltCoinvest",
    "svaraLokaltTvangsmekanik", "svaraLokaltHandelsemotor", "svaraLokaltLonsamhetsgrund", "svaraLokaltKemisektor",
    "svaraLokaltStalsektor", "svaraLokaltCasepraktik", "svaraLokaltBeteendefallor", "svaraLokaltKategoristangning",
    "svaraLokaltBanksektorn", "svaraLokaltNotlasning", "svaraLokaltNykull", "svaraLokaltNyfodda",
    "svaraLokaltSkuldordning", "svaraLokaltValideringsfonster", "svaraLokaltEnhetsekonomi", "svaraLokaltNatverkseffekter", "svaraLokaltSlutstenarna", "svaraLokaltMarknadsrytm",
  ];
  const kedjerader = widget.split("\n").filter((rad) => rad.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const FEL = [];
  if (kedjerader.length !== 1) FEL.push("hittade " + kedjerader.length + " kedjerader (väntat exakt 1)");
  const rad = kedjerader[0] ?? "";
  let senaste = -1;
  for (const komp of KOMPONENTER) {
    const pos = rad.indexOf(komp + "(");
    if (pos === -1) FEL.push(komp + " saknas i kedjeraden");
    else if (pos < senaste) FEL.push(komp + " i fel ordning i kedjeraden");
    else senaste = pos;
  }
  if (!widget.includes('from "@/lib/ai-mentor-avkastningskurva-fragor"')) {
    FEL.push("importen av ai-mentor-avkastningskurva-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
    // Fönster 29 (s6-u1, _s6u1o29-): kemisektor i widgetordning (efter lonsamhetsgrund,
  // före marknadsrytm) — svitharmoniseringens dokumentationsplikt (V219-läxan).
  const kanda = new Set([...KOMPONENTER, "svaraLokaltStalsektor", "svaraLokaltCasepraktik", "svaraLokaltBeteendefallor", "svaraLokaltKemisektor", "svaraLokaltEkosystemdjup", "svaraLokaltHandelsdag", "svaraLokaltPortfoljpraktik", "svaraLokaltUtdelningskalender", "svaraLokaltKreditdjup", "svaraLokaltSektordjup"]);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla 36 lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "avkastningskurva efter riskläsningsdjup; syskonet s6-u2:s avkastningsdjup (omgång 15, parallellt fönster — kärnorden disjunkta, deras lager efter mitt) harmoniskt medtaget",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN AVKASTNINGSKURVA (s6-u1 omgång 15): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
