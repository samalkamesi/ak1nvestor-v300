/**
 * TESTA AI-MENTORN — RISKPREMIE-LAGRET (spår 6 omgång 21, s6-u1), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-riskpremie.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers monster (riskpremie — aktiernas riskpremie:
 * subtraktionen, svängningarnas prislista, historiens siffra och
 * värderingskedjan med P/E-spegeln):
 *   A  kanonisk    — 1 fråga: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), ≥4 källor), ≥3 registeräkta kurslänkar
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (46 lager)
 *   D02 register   — kategoriantal + kursminuter i texten ur registret
 *   D03 aritmetik  — kursexempelens tal OBEROENDE omräknade (subtraktionen,
 *                    prislistan, sekelkraften, värderingskedjan, P/E-spegeln)
 *   E  genomström  — omatchade frågor → null (API-flödet)
 *   F  juridik     — inga köp/sälj-rådfraser (lagen 2007:528 — utbildning)
 *   G  antistöld   — tidigare kanoniska (inkl. fönstrets syskonlager) → null
 *   G2 syskonkärnord — ALLA tidigare lagers kärnord LIVE som frågor → 0
 *   H  kedja       — lager-invarianten: gamla svar bitidentiska
 *                    med/utan detta lager + ämneskontroller + nya rätt
 *   I  omkastad    — den nya kanoniska → null i kedjan UTAN detta lager
 *   J  disjunktion — kärnorden överlappar inget tidigare lagers (mekaniskt)
 *   L  widget-synk — kedjeraden i chat-widget.tsx bär alla 49 lager i
 *                    ordning + import + inga okända komponenter
 *
 * Syskonimporter är TOLERANTA (syskon kan skriva just nu): omgång 21:s
 * trefönster bär u3:s koncernläsning och u2:s tillväxtdjup (båda wireade
 * EFTER detta lager — disk-läge-presedens som omgång 15–20).
 *
 * DOKUMENTERAD GRÄNS (sond _s6u1-sond-omg21.mjs + sond2): basen äger den
 * engelska helhetsfrågan («vad är equity risk premium?» FÅNGAS av basen —
 * knappens mål); kreditdjupet äger kreditpremie/kreditspread-familjen
 * (ma-05 här KÄLLA + knapp); makro äger obligation/statsobligations-orden
 * (endast stärkord här); lönsamhetsdjupet äger WACC (knapp);
 * avkastningsdjupet äger avkastningskällorna; optionsdjupet optionens
 * premie — inget av dessa är kärnord här.
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — kursens budskap bärs med i
 * texten: premien är ett pris, inte ett löfte; inga placeringstips.
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-riskpremie.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltRiskpremie, RISKPREMIE_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-riskpremie-fragor.ts")).href);

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
const { svaraLokaltForvantningsdjup, FÖRVÄNTNINGSDJUP_MONSTER } = await tolerera("ai-mentor-forvantningsdjup-fragor.ts", ["svaraLokaltForvantningsdjup", "FÖRVÄNTNINGSDJUP_MONSTER"]);
const { svaraLokaltPortfoljbalans, PORTFOLJBALANS_MONSTER } = await tolerera("ai-mentor-portfoljbalans-fragor.ts", ["svaraLokaltPortfoljbalans", "PORTFOLJBALANS_MONSTER"]);
const { svaraLokaltStabilitetsdjup, STABILITETSDJUP_MONSTER } = await tolerera("ai-mentor-stabilitetsdjup-fragor.ts", ["svaraLokaltStabilitetsdjup", "STABILITETSDJUP_MONSTER"]);
const { svaraLokaltGrahamgolv, GRAHAMGOLV_MONSTER } = await tolerera("ai-mentor-grahamgolv-fragor.ts", ["svaraLokaltGrahamgolv", "GRAHAMGOLV_MONSTER"]);
const { svaraLokaltVarderjustering, VARDERJUSTERING_MONSTER } = await tolerera("ai-mentor-varderjustering-fragor.ts", ["svaraLokaltVarderjustering", "VARDERJUSTERING_MONSTER"]);
const { svaraLokaltOptionsdjup, OPTIONS_DJUP_MONSTER } = await tolerera("ai-mentor-optionsdjup-fragor.ts", ["svaraLokaltOptionsdjup", "OPTIONS_DJUP_MONSTER"]);
const { svaraLokaltRisklasningsdjup, RISKLÄSNINGSDJUP_MONSTER } = await tolerera("ai-mentor-risklasningsdjup-fragor.ts", ["svaraLokaltRisklasningsdjup", "RISKLÄSNINGSDJUP_MONSTER"]);
const { svaraLokaltAvkastningskurva, AVKASTNINGSKURVA_MONSTER } = await tolerera("ai-mentor-avkastningskurva-fragor.ts", ["svaraLokaltAvkastningskurva", "AVKASTNINGSKURVA_MONSTER"]);
const { svaraLokaltAvkastningsdjup, AVKASTNINGSDJUP_MONSTER } = await tolerera("ai-mentor-avrakningsdjup-fragor.ts", ["svaraLokaltAvkastningsdjup", "AVKASTNINGSDJUP_MONSTER"]);
const { svaraLokaltVarderingsverktyg, VARDERINGSVERKTYG_MONSTER } = await tolerera("ai-mentor-varderingsverktyg-fragor.ts", ["svaraLokaltVarderingsverktyg", "VARDERINGSVERKTYG_MONSTER"]);
const { svaraLokaltWarrant, WARRANT_MONSTER } = await tolerera("ai-mentor-warrant-fragor.ts", ["svaraLokaltWarrant", "WARRANT_MONSTER"]);
const { svaraLokaltTidsaxel, TIDSAXEL_MONSTER } = await tolerera("ai-mentor-tidsaxel-fragor.ts", ["svaraLokaltTidsaxel", "TIDSAXEL_MONSTER"]);
const { svaraLokaltKapitalbindning, KAPITALBINDNING_MONSTER } = await tolerera("ai-mentor-kapitalbindning-fragor.ts", ["svaraLokaltKapitalbindning", "KAPITALBINDNING_MONSTER"]);
const { svaraLokaltEkosystemdjup, EKOSYSTEMDJUP_MONSTER } = await tolerera("ai-mentor-ekosystemdjup-fragor.ts", ["svaraLokaltEkosystemdjup", "EKOSYSTEMDJUP_MONSTER"]);
const { svaraLokaltHandelsdag, HANDELSDAG_MONSTER } = await tolerera("ai-mentor-handelsdag-fragor.ts", ["svaraLokaltHandelsdag", "HANDELSDAG_MONSTER"]);
const { svaraLokaltPortfoljpraktik, PORTFOLJPRAKTIK_MONSTER } = await tolerera("ai-mentor-portfoljpraktik-fragor.ts", ["svaraLokaltPortfoljpraktik", "PORTFOLJPRAKTIK_MONSTER"]);
const { svaraLokaltUtdelningskalender, UTDELNINGSKALENDER_MONSTER } = await tolerera("ai-mentor-utdelningskalender-fragor.ts", ["svaraLokaltUtdelningskalender", "UTDELNINGSKALENDER_MONSTER"]);
const { svaraLokaltKreditdjup, KREDITDJUP_MONSTER } = await tolerera("ai-mentor-kreditdjup-fragor.ts", ["svaraLokaltKreditdjup", "KREDITDJUP_MONSTER"]);
const { svaraLokaltSektordjup, SEKTORDJUP_MONSTER } = await tolerera("ai-mentor-sektordjup-fragor.ts", ["svaraLokaltSektordjup", "SEKTORDJUP_MONSTER"]);
const { svaraLokaltSektorskola2, SEKTORSKOLA2_MONSTER } = await tolerera("ai-mentor-sektorskola2-fragor.ts", ["svaraLokaltSektorskola2", "SEKTORSKOLA2_MONSTER"]);
const { svaraLokaltBeteendemekanik, BETEENDEMEKANIK_MONSTER } = await tolerera("ai-mentor-beteendemekanik-fragor.ts", ["svaraLokaltBeteendemekanik", "BETEENDEMEKANIK_MONSTER"]);
const { svaraLokaltPeMekanik, PE_MEKANIK_MONSTER } = await tolerera("ai-mentor-pe-mekanik-fragor.ts", ["svaraLokaltPeMekanik", "PE_MEKANIK_MONSTER"]);
const { svaraLokaltOverlevnadsdjup, OVERLEVNADSDJUP_MONSTER } = await tolerera("ai-mentor-overlevnadsdjup-fragor.ts", ["svaraLokaltOverlevnadsdjup", "OVERLEVNADSDJUP_MONSTER"]);
// Omgång 21:s fönstersyskon (båda wireade EFTER detta lager i widgeten).
const { svaraLokaltKoncernlasning, KONCERNLASNING_MONSTER } = await tolerera("ai-mentor-koncernlasning-fragor.ts", ["svaraLokaltKoncernlasning", "KONCERNLASNING_MONSTER"]);
const { svaraLokaltTillvaxtdjup, TILLVAXTDJUP_MONSTER } = await tolerera("ai-mentor-tillvaxtdjup-fragor.ts", ["svaraLokaltTillvaxtdjup", "TILLVAXTDJUP_MONSTER"]);

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
    fraga: "Vad är aktiernas riskpremie?",
    amne: "riskpremie",
    slug: "ma-06-aktiernas-riskpremie",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltRiskpremie(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length >= 4;
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

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad är riskpremien?", amne: "riskpremie" }, // grundformen
  { fraga: "vad ar riskpremien?", amne: "riskpremie" }, // diafri (ä→a)
  { fraga: "vad är riskpremie?", amne: "riskpremie" }, // obestämd form
  { fraga: "vad är riskpremier?", amne: "riskpremie" }, // plural
  { fraga: "vad är aktieriskpremien?", amne: "riskpremie" }, // sammansatt bestämd
  { fraga: "vad är aktieriskpremie?", amne: "riskpremie" }, // sammansatt obestämd
  { fraga: "vad är aktiens riskpremie?", amne: "riskpremie" }, // singular-fras
  { fraga: "hur räknar man ut riskpremien?", amne: "riskpremie" }, // hur-form
  { fraga: "hur mäter man aktiernas riskpremie?", amne: "riskpremie" }, // mät-form
  { fraga: "vad betyder riskpremien?", amne: "riskpremie" }, // betyder-form
  { fraga: "vad är aktiernas riskpremium?", amne: "riskpremie" }, // stavvariant
  { fraga: "vad ar aktiernas riskpremie?", amne: "riskpremie" }, // diafri fras
  { fraga: "vad är premiöverskottet?", amne: "riskpremie" }, // termsvarianten (böjd)
  { fraga: "vad är premie per riskenhet?", amne: "riskpremie" }, // nyckeltalet
  { fraga: "vad är ägarrisken?", amne: "riskpremie" }, // risken premien prissätter
  { fraga: "vad ar agarrisken?", amne: "riskpremie" }, // diafri
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltRiskpremie(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltRiskpremie(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltRiskpremie(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL D: källaäkthet — källor och kurslänkar FINNS i registret ─────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltRiskpremie(f.fraga, KURSREGISTER);
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
    if (svar.fordjupa && svar.fordjupa.lank.startsWith("/kurser/") && !slugFinns.has(svar.fordjupa.lank.slice("/kurser/".length))) {
      FEL.push("fordjupa '" + svar.fordjupa.lank + "' (" + f.amne + ") finns ej i registret");
    }
  }
  kontroll("D01 källaäkthet — inga fantomslugar i de nya svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta (5 källor: ma-06 + ma-05 + ma-03 + km-008 + km-007)");

  // fragor:-knappar skall landa i HELA kedjan — detta lagers knappar länkar
  // medvetet till TIDIGARE lager (kreditpremien → kreditdjupet, WACC →
  // lönsamhetsdjupet) enligt "tidigare lager"-kravet.
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
    (svaraLokaltAvkastningskurva ? svaraLokaltAvkastningskurva(fraga, KURSREGISTER) : null) ??
    svaraLokaltAvkastningsdjup(fraga, KURSREGISTER) ??
    (svaraLokaltVarderingsverktyg ? svaraLokaltVarderingsverktyg(fraga, KURSREGISTER) : null) ??
    (svaraLokaltWarrant ? svaraLokaltWarrant(fraga, KURSREGISTER) : null) ??
    svaraLokaltTidsaxel(fraga, KURSREGISTER) ??
    (svaraLokaltKapitalbindning ? svaraLokaltKapitalbindning(fraga, KURSREGISTER) : null) ??
    (svaraLokaltEkosystemdjup ? svaraLokaltEkosystemdjup(fraga, KURSREGISTER) : null) ??
    svaraLokaltHandelsdag(fraga, KURSREGISTER) ??
    (svaraLokaltPortfoljpraktik ? svaraLokaltPortfoljpraktik(fraga, KURSREGISTER) : null) ??
    (svaraLokaltUtdelningskalender ? svaraLokaltUtdelningskalender(fraga, KURSREGISTER) : null) ??
    (svaraLokaltKreditdjup ? svaraLokaltKreditdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltSektordjup ? svaraLokaltSektordjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltSektorskola2 ? svaraLokaltSektorskola2(fraga, KURSREGISTER) : null) ??
    (svaraLokaltBeteendemekanik ? svaraLokaltBeteendemekanik(fraga, KURSREGISTER) : null) ??
    svaraLokaltPeMekanik(fraga, KURSREGISTER) ??
    svaraLokaltRiskpremie(fraga, KURSREGISTER) ??
    (svaraLokaltOverlevnadsdjup ? svaraLokaltOverlevnadsdjup(fraga, KURSREGISTER) : null) ??
    (svaraLokaltKoncernlasning ? svaraLokaltKoncernlasning(fraga, KURSREGISTER) : null) ??
    (svaraLokaltTillvaxtdjup ? svaraLokaltTillvaxtdjup(fraga, KURSREGISTER) : null);
  for (const f of NYA) {
    const svar = svaraLokaltRiskpremie(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (46 lager)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategorins antal och kursminuter i
  // texten ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake).
  const maAntal = KURSREGISTER.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
  const ma6 = KURSREGISTER.find((r) => r.slug === "ma-06-aktiernas-riskpremie");
  const s1 = svaraLokaltRiskpremie(NYA[0].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — MAKROEKONOMI & RÄNTA=" + maAntal + " · ma-06 " + (ma6 ? ma6.minuter + " min " + ma6.niva : "?"),
    !!s1 &&
    s1.text.includes(maAntal + " kurser") &&
    (ma6 ? s1.text.includes(ma6.minuter + " min, " + ma6.niva.toLowerCase() + " nivå") : false),
    "texten ska bära registrets egna tal",
  );
}

// ── FALL D03: aritmetik — kursexempelens tal OBEROENDE omräknade ───────────
{
  const s = svaraLokaltRiskpremie(NYA[0].fraga, KURSREGISTER);
  const fel = [];
  if (!s) {
    kontroll("D03 aritmetik — tretton talkontroller", false, "inget svar");
  } else {
    // 1. Grundsubtraktionen (ma-06 K1): 8,0 − 2,0 = 6,0 procentenheter
    if (Math.abs(8.0 - 2.0 - 6.0) > 1e-9) fel.push("subtraktionsreferens fel");
    for (const str of ["8,0 − 2,0 = 6,0 procentenheter"]) {
      if (!s.text.includes(str)) fel.push("texten saknar '" + str + "'");
    }
    // 2. Prislistan (K2): 6 ÷ 40 = 15 % · 1 ÷ 40 = 2,5 % · 6,0 ÷ 17 ≈ 0,35 · 5 × 6,0 = 30
    if (6 / 40 !== 0.15) fel.push("nedgångsreferens fel");
    if (Math.abs(6.0 / 17 - 0.353) > 0.005) fel.push("riskenhetsreferens fel");
    if (5 * 6.0 !== 30) fel.push("katastrofreferens fel");
    for (const str of ["6 ÷ 40 = 15 procent", "1 av 40 = 2,5 procent", "6,0 ÷ 17 ≈ 0,35", "5 × 6,0 = 30"]) {
      if (!s.text.includes(str)) fel.push("texten saknar '" + str + "'");
    }
    // 3. Sekelkraften (K3): 9,0 − 3,0 = 6,0 · 1,08³⁰ = 10,1 · 1,02³⁰ = 1,81 · 10,1 ÷ 1,81 = 5,6
    if (Math.abs(9.0 - 3.0 - 6.0) > 1e-9) fel.push("sekelreferens fel");
    if (Math.abs(Math.pow(1.08, 30) - 10.06) > 0.02) fel.push("1,08³⁰-referens fel");
    if (Math.abs(Math.pow(1.02, 30) - 1.811) > 0.005) fel.push("1,02³⁰-referens fel");
    if (Math.abs(10.1 / 1.81 - 5.58) > 0.05) fel.push("5,6-referens fel");
    for (const str of ["9,0 − 3,0 = 6,0", "1,08³⁰ = 10,1", "1,02³⁰ = 1,81", "10,1 ÷ 1,81 = 5,6"]) {
      if (!s.text.includes(str)) fel.push("texten saknar '" + str + "'");
    }
    // 4. Värderingskedjan (K4): 2,0 + 6,0 = 8,0 · 8 ÷ 0,080 = 100 · 8 ÷ 0,090 = 88,9 (−11,1 %) · 8 ÷ 0,070 = 114,3 (+14,3 %)
    if (Math.abs(2.0 + 6.0 - 8.0) > 1e-9) fel.push("kravreferens fel");
    if (8 / 0.08 !== 100) fel.push("utgångsvärdesreferens fel");
    if (Math.abs(8 / 0.09 - 88.89) > 0.01) fel.push("88,9-referens fel");
    if (Math.abs(8 / 0.07 - 114.29) > 0.01) fel.push("114,3-referens fel");
    for (const str of ["2,0 + 6,0 = 8,0", "8 ÷ 0,080 = 100", "8 ÷ 0,090 = 88,9", "8 ÷ 0,070 = 114,3", "minus 11,1 procent", "plus 14,3 procent"]) {
      if (!s.text.includes(str)) fel.push("texten saknar '" + str + "'");
    }
    // 5. P/E-spegeln (K4): 1 ÷ 0,080 = 12,5 · 1 ÷ 0,090 = 11,1 · 1 ÷ 0,070 = 14,3
    if (Math.abs(1 / 0.08 - 12.5) > 1e-9 || Math.abs(1 / 0.09 - 11.1) > 0.05 || Math.abs(1 / 0.07 - 14.3) > 0.05) fel.push("P/E-referens fel");
    for (const str of ["P/E 12,5", "P/E 11,1", "P/E 14,3"]) {
      if (!s.text.includes(str)) fel.push("texten saknar '" + str + "'");
    }
    kontroll("D03 aritmetik — subtraktionen + prislistan + sekelkraften + värderingskedjan + P/E-spegeln oberoende omräknade", fel.length === 0,
      fel.length ? fel.join(" | ") : "6,0 · 15 %/2,5 % · 0,35 · 30 · 10,1/1,81/5,6 · 100/88,9/114,3 · 12,5/11,1/14,3");
  }
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Ystad imorgon?",
  "Vem skrev Pippi Långstrump?",
  "Hur många strängar har en gitarr?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltRiskpremie(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltRiskpremie(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser i riskpremie-svaret", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
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
  // Sektor
  { fraga: "Vad är sektorsanalys och varför skiljer sig sektorer åt?", amne: "sektorsanalys" },
  { fraga: "Hur fungerar banker och banksektorn?", amne: "bank" },
  { fraga: "Hur fungerar fastighetsbolag?", amne: "fastighet" },
  // Kapitalmekanik
  { fraga: "Vad är utspädning?", amne: "emission" },
  { fraga: "Vad är goodwill?", amne: "goodwill" },
  // Case + Praktik
  { fraga: "Vad är praktiska case?", amne: "case" },
  { fraga: "Vad är indexfonder och passivt ägande?", amne: "index" },
  { fraga: "Hur fungerar blankning och short?", amne: "blankning" },
  { fraga: "Vad är vinstmarginal och hur gör man en marginalanalys?", amne: "marginal" },
  // Portföljgrund + Ägande
  { fraga: "Vad är diversifiering och korrelation?", amne: "diversifiering" },
  { fraga: "Vad är valutarisk?", amne: "valutarisk" },
  { fraga: "Vad är en bolagsstämma?", amne: "bolagsstämma" },
  { fraga: "Vad gör en styrelse?", amne: "bolagsstyrning" },
  // Redovisningsdjup + Djup + Historia
  { fraga: "Vad är avskrivningar?", amne: "avskrivning" },
  { fraga: "Hur fungerar leasing i bokföringen?", amne: "leasing" },
  { fraga: "Vad är en värderingsmultipel?", amne: "multipel" },
  { fraga: "Vad är FOMO?", amne: "fomo" },
  { fraga: "Vem är Warren Buffett?", amne: "mastarna" },
  { fraga: "Vad var tulpanmanin?", amne: "tulpanmanin" },
  { fraga: "Vad är en börsbubbla?", amne: "bubbla" },
  { fraga: "Vad hände vid aktiekraschen 1929?", amne: "krasch1929" },
  // Lönsamhetsdjup + Skattedjup + Beteendedjup + Riskdjup
  { fraga: "Vad är DuPont-analysen?", amne: "dupont" },
  { fraga: "Vad är ROIC?", amne: "roic" },
  { fraga: "Vad är kapitalförsäkring?", amne: "kapitalforsakring" },
  { fraga: "Vad är bekräftelsefällan?", amne: "bekraftelsefalla" },
  { fraga: "Vad är en skuldfälla?", amne: "skuldfalla" },
  { fraga: "Vad är en svart svan?", amne: "svartsvan" },
  // Riskmåttsdjup + Utdelningsdjup + Förväntningsdjup + Portföljbalans
  { fraga: "Vad är sharpe-kvoten?", amne: "sharpekvot" },
  { fraga: "Vad är utdelningsfällor?", amne: "utdelningsfalla" },
  { fraga: "Vad är aktieåterköp?", amne: "aktieaterkop" },
  { fraga: "Vad är förväntningsanalys?", amne: "forvantningsanalys" },
  { fraga: "Vad är kalibrering?", amne: "kalibrering" },
  { fraga: "Vad är rebalansering?", amne: "rebalansering" },
  // Stabilitetsdjup + Grahamgolv
  { fraga: "Vad är känslighetsanalys?", amne: "kanslighetsanalys" },
  { fraga: "Vad är soliditetsgrad?", amne: "soliditetsgrad" },
  { fraga: "Vad är en net-net och NCAV?", amne: "netnet" },
  { fraga: "Vad är cigar butts?", amne: "cigarbutt" },
  { fraga: "Vem är Mr Market?", amne: "mrmarket" },
  // Varderjustering + Optionsdjup + Riskläsningsdjup
  { fraga: "Vad är normaliserad vinst?", amne: "normalisering" },
  { fraga: "Vad är en köpoption?", amne: null },
  { fraga: "Vad är kundkoncentration?", amne: "kundkoncentration" },
  { fraga: "Vad är en riskmatris?", amne: "riskmatris" },
  // Avkastningskurva + Avkastningsdjup + Värderingsverktyg
  { fraga: "Vad är den omvända avkastningskurvan?", amne: null },
  { fraga: "Varifrån kommer aktiens avkastning?", amne: "avkastningens källor" },
  { fraga: "Vad är tvärsnittsanalys?", amne: "tvärsnittsanalys" },
  { fraga: "Vad är scenarioanalys?", amne: null },
  // Omgång 16
  { fraga: "Vad är en warrant?", amne: null },
  { fraga: "Vad är konjunkturindikatorer?", amne: null },
  { fraga: "Vad är refinansieringsmuren?", amne: null },
  { fraga: "Vad är rörelsekapital?", amne: null },
  // Omgång 17
  { fraga: "Vad är SAM-viktningen?", amne: "samviktning" },
  { fraga: "Vad är en backtest?", amne: "backtest" },
  { fraga: "Hur fungerar handelsdagen?", amne: "handelsdagen" },
  { fraga: "Vad är positionsstorlek?", amne: null },
  // Omgång 18
  { fraga: "Vad är avstämningsdagen?", amne: null },
  { fraga: "Vad är kreditpremien?", amne: null },
  { fraga: "Vad är MRR?", amne: null },
  // Omgång 19
  { fraga: "Vad är en patentbrant?", amne: null },
  { fraga: "Vad är like-for-like?", amne: null },
  // Omgång 20
  { fraga: "Vad är priming?", amne: null },
  { fraga: "Vad är tillgänglighetsfällan?", amne: null },
  { fraga: "Vad är övermod?", amne: null },
  { fraga: "Vad är likviditetsreserven?", amne: null },
  { fraga: "Vad är altman z-score?", amne: null },
  { fraga: "Vad är konkursprognos?", amne: null },
  // Omgång 21: fönstrets syskon (u3 koncernläsning + u2 tillväxtdjup)
  { fraga: "Vad är koncernredovisning?", amne: null },
  { fraga: "Vad är minoritetsintressen?", amne: null },
  { fraga: "Vad är segmentrapportering?", amne: null },
  { fraga: "Vad är pensionsåtaganden?", amne: null },
  { fraga: "Vad är organisk tillväxt?", amne: null },
  { fraga: "Vad är volym pris och mix?", amne: null },
  // Sondens dokumenterade gränser — ägs av tidigare lager, ska STANSA kvar:
  { fraga: "Vad är equity risk premium?", amne: null },
  { fraga: "Vad är kreditspreaden?", amne: null },
  { fraga: "Vad är statsobligationer?", amne: null },
  { fraga: "Vad är en obligation?", amne: "ränta" },
  { fraga: "Vad är wacc?", amne: null },
  { fraga: "Vad är optionspremie?", amne: null },
  { fraga: "Vad är spreaden?", amne: "aktiemarknaden" },
];
{
  const STJALDA = GAMLA.filter((f) => svaraLokaltRiskpremie(f.fraga, KURSREGISTER) !== null);
  kontroll("G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i riskpremie-lagret", STJALDA.length === 0,
    STJALDA.length ? STJALDA.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltRiskpremie(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓");
}

// ── FALL G2: SYSKONKÄRNORD — alla tidigare kärnord som frågor → 0 fångster ─
{
  const tidigareMonster = [
    MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER,
    KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER,
    PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER,
    DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER,
    SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER,
    RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FÖRVÄNTNINGSDJUP_MONSTER,
    PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER,
    VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLÄSNINGSDJUP_MONSTER,
    AVKASTNINGSKURVA_MONSTER, VARDERINGSVERKTYG_MONSTER,
    WARRANT_MONSTER, TIDSAXEL_MONSTER, KAPITALBINDNING_MONSTER,
    EKOSYSTEMDJUP_MONSTER, PORTFOLJPRAKTIK_MONSTER,
    UTDELNINGSKALENDER_MONSTER, KREDITDJUP_MONSTER, SEKTORDJUP_MONSTER,
    SEKTORSKOLA2_MONSTER, BETEENDEMEKANIK_MONSTER, OVERLEVNADSDJUP_MONSTER,
    KONCERNLASNING_MONSTER, TILLVAXTDJUP_MONSTER,
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
  const fangade = fragor.filter((f) => svaraLokaltRiskpremie(f, KURSREGISTER) !== null);
  kontroll(
    "G2 syskonkärnord — " + karnord + " kärnord LIVE som frågor → 0 fångster",
    fangade.length === 0,
    fangade.length ? "FÅNGSTER: " + fangade.slice(0, 5).join(" | ") : "0 krockar mot " + tidigareMonster.length + " lager",
  );
}

// ── FALL H: hela kedjan (som chat-widget.tsx) — lager-invarianten ──────────
{
  const LAGER = [
    ["makro", svaraLokaltMakro], ["extra", svaraLokaltExtra], ["bas", svaraLokalt],
    ["nästa", svaraLokaltNasta], ["kapitalmekanik", svaraLokaltKapitalmekanik],
    ["sektor", svaraLokaltSektor], ["case", svaraLokaltCase],
    ["praktik", svaraLokaltPraktik], ["portföljgrund", svaraLokaltPortfoljgrund],
    ["ägande", svaraLokaltAgande], ["redovisningsdjup", svaraLokaltRedovisningsdjup],
    ["djup", svaraLokaltDjup], ["historia", svaraLokaltHistoria],
    ["lönsamhetsdjup", svaraLokaltLonsamhetsdjup], ["tsdjup", svaraLokaltTsdjup],
    ["skattedjup", svaraLokaltSkattedjup], ["beteendedjup", svaraLokaltBeteendedjup],
    ["riskdjup", svaraLokaltRiskdjup], ["riskmåttsdjup", svaraLokaltRiskmattsdjup],
    ["utdelningsdjup", svaraLokaltUtdelningsdjup],
    ["förväntningsdjup", svaraLokaltForvantningsdjup],
    ["portföljbalans", svaraLokaltPortfoljbalans],
    ["stabilitetsdjup", svaraLokaltStabilitetsdjup],
    ["grahamgolv", svaraLokaltGrahamgolv],
    ["varderjustering", svaraLokaltVarderjustering],
    ["optionsdjup", svaraLokaltOptionsdjup],
    ["riskläsningsdjup", svaraLokaltRisklasningsdjup],
    ["avkastningskurva", svaraLokaltAvkastningskurva],
    ["avkastningsdjup", svaraLokaltAvkastningsdjup],
    ["varderingsverktyg", svaraLokaltVarderingsverktyg],
    ["warrant", svaraLokaltWarrant],
    ["tidsaxel", svaraLokaltTidsaxel],
    ["kapitalbindning", svaraLokaltKapitalbindning],
    ["ekosystemdjup", svaraLokaltEkosystemdjup],
    ["handelsdag", svaraLokaltHandelsdag],
    ["portfoljpraktik", svaraLokaltPortfoljpraktik],
    ["utdelningskalender", svaraLokaltUtdelningskalender],
    ["kreditdjup", svaraLokaltKreditdjup],
    ["sektordjup", svaraLokaltSektordjup],
    ["sektorskola2", svaraLokaltSektorskola2],
    ["beteendemekanik", svaraLokaltBeteendemekanik],
    ["pe-mekanik", svaraLokaltPeMekanik],
    ["riskpremie", svaraLokaltRiskpremie],
    ["överlevnadsdjup", svaraLokaltOverlevnadsdjup],
    ["koncernläsning", svaraLokaltKoncernlasning],
    ["tillväxtdjup", svaraLokaltTillvaxtdjup],
  ];
  const kora = (lager, fraga) => {
    for (const [, fnk] of lager) {
      if (!fnk) continue;
      const s = fnk(fraga, KURSREGISTER);
      if (s) return s;
    }
    return null;
  };
  const MED = LAGER;
  const UTAN = LAGER.filter(([namn]) => namn !== "riskpremie");

  // Invarianten: detta lager ändrar ALDRIG ett tidigare svar, och de
  // senare lagren (överlevnadsdjup/koncernläsning/tillväxtdjup) ligger
  // efter i kedjan — deras svar på frågor detta lager lämnar ifred.
  const fel = [];
  for (const f of GAMLA) {
    const med = kora(MED, f.fraga);
    const utan = kora(UTAN, f.fraga);
    if (JSON.stringify(med) !== JSON.stringify(utan)) {
      fel.push("'" + f.fraga + "' ändrad av riskpremie-lagret (med=" + (med ? med.amne : "null") + ", utan=" + (utan ? utan.amne : "null") + ")");
    }
  }
  // Nyckel-ämnen landar fortfarande rätt (ändringsimmutabilitet + identitet)
  // — endast motorer som går att importera just nu (toleranta syskonimporter).
  for (const f of GAMLA.filter((x) => x.amne)) {
    const med = kora(MED, f.fraga);
    if (!med || med.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (med ? med.amne : "null") + " (väntat " + f.amne + ")");
  }
  // Min fråga når mitt lager genom hela kedjan.
  for (const f of NYA) {
    const med = kora(MED, f.fraga);
    if (!med || med.amne !== f.amne) fel.push("NY '" + f.fraga + "' ⇒ " + (med ? med.amne : "null") + " (väntat " + f.amne + ")");
  }
  // Motfrågorna (tidigare lagers områden) ska vara levande knappar genom kedjan.
  for (const q of ["Vad är kreditpremien?", "Vad är wacc?"]) {
    const mal = kora(MED, q.toLowerCase());
    if (!mal) fel.push("motfråga '" + q + "' landar null i kedjan — död knapp");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla oförändrade (lager-invarianten) + " + GAMLA.filter((x) => x.amne).length + " ämneskontroller + " + NYA.length + " nya når rätt lager (46 lager, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + NYA.length + 2) + "/" + (GAMLA.length + NYA.length + 2) + " rätt",
  );

  // ── FALL I: OMKASTAD ANTISTÖLD — min kanoniska ger null UTAN detta ────────
  const tjuvade = NYA.filter((f) => kora(UTAN, f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — den nya kanoniska ger null i kedjan UTAN riskpremie-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kora(UTAN, f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER, RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FÖRVÄNTNINGSDJUP_MONSTER, PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER, VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLÄSNINGSDJUP_MONSTER, AVKASTNINGSKURVA_MONSTER, VARDERINGSVERKTYG_MONSTER, WARRANT_MONSTER, TIDSAXEL_MONSTER, KAPITALBINDNING_MONSTER, EKOSYSTEMDJUP_MONSTER, PORTFOLJPRAKTIK_MONSTER, UTDELNINGSKALENDER_MONSTER, KREDITDJUP_MONSTER, SEKTORDJUP_MONSTER, SEKTORSKOLA2_MONSTER, BETEENDEMEKANIK_MONSTER, OVERLEVNADSDJUP_MONSTER, KONCERNLASNING_MONSTER, TILLVAXTDJUP_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of RISKPREMIE_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — RISKPREMIE_MONSTER vs " + (tidigare.size > 0 ? "alla tidigare lager" : "0 lager") + " (" + tidigare.size + " kärnord)",
    krock.length === 0,
    krock.length ? krock.join(" | ") : "0 överlapp ✓",
  );
}

// ── FALL L: WIDGET-SYNK — kedjeraden i chat-widget.tsx bär alla lager ──────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const KOMPONENTER = [
    "svaraLokaltMakro", "svaraLokaltExtra", "svaraLokaltModernaRisker", "svaraLokalt", "svaraLokaltNasta",
    "svaraLokaltKapitalmekanik", "svaraLokaltSektor", "svaraLokaltCase",
    // Omgång 24-harmonisering (s6-u3): våg 189:s marknadsmekanik wireades utan
    // harmonisering — baslinjens röda L01; kedjeordning efter case (kedjetestet G).
    "svaraLokaltMarknadsmekanik",
    "svaraLokaltPraktik", "svaraLokaltValutamekanik", "svaraLokaltPortfoljgrund", "svaraLokaltAgande",
    "svaraLokaltRedovisningsdjup", "svaraLokaltDjup", "svaraLokaltHistoria",
    "svaraLokaltLonsamhetsdjup", "svaraLokaltTsdjup", "svaraLokaltSkattedjup",
    "svaraLokaltBeteendedjup", "svaraLokaltRiskdjup", "svaraLokaltRiskmattsdjup",
    "svaraLokaltUtdelningsdjup", "svaraLokaltForvantningsdjup",
    "svaraLokaltPortfoljbalans", "svaraLokaltStabilitetsdjup",
    "svaraLokaltGrahamgolv",
    "svaraLokaltVarderjustering", "svaraLokaltOptionsdjup",
    "svaraLokaltRisklasningsdjup",
    "svaraLokaltAvkastningskurva", "svaraLokaltAvkastningsdjup",
    "svaraLokaltVarderingsverktyg",
    "svaraLokaltWarrant", "svaraLokaltTidsaxel", "svaraLokaltKapitalbindning",
    "svaraLokaltEkosystemdjup", "svaraLokaltHandelsdag",
    "svaraLokaltPortfoljpraktik", "svaraLokaltUtdelningskalender",
    "svaraLokaltKreditdjup", "svaraLokaltSektordjup", "svaraLokaltSektorskola2",
    "svaraLokaltBeteendemekanik", "svaraLokaltPeMekanik",
    "svaraLokaltRiskpremie",
    "svaraLokaltOverlevnadsdjup",
    "svaraLokaltKoncernlasning", "svaraLokaltTillvaxtdjup",
    // Omgång 22: bokmastar (s6-u3) — SIST av 47 (svitharmoniseringens dokumentationsplikt).
    // Omgång 22 (tredje instansen): faktordjup (s6-u1) — efter tillväxtdjup, före bokmastar.
    "svaraLokaltFaktordjup",
    "svaraLokaltBokmastar",
    // Omgång 22:s fönster (s6-u3 bokmastar + s6-u2 riskbudget + s6-u1 konvertibel — svitharmoniseringens dokumentationsplikt).
    "svaraLokaltRiskbudget",
    "svaraLokaltKonvertibel",
    // Omgång 23 (2026-09-19): u2 sektorlasning + u3 vardegrund + u1 realekonomi — svitharmonisering (dokumentationsplikten).
  "svaraLokaltSektorlasning",
  "svaraLokaltVardegrund",
  "svaraLokaltRealekonomi",
  // Omgång 24 (s6-u3-harmonisering): fönstrets tre sista komponenter i
  // wireningsordning — u1 försäkring (55) · u2 moatdjup (56) · u3 nya
  // territorier (57). Idempotent: körs igen ⇒ 0 ändringar.
  "svaraLokaltForsakring",
  "svaraLokaltMoatdjup",
  "svaraLokaltNyaTerritorier",

  // Omgång 25-harmonisering (s6-u2, 2026-09-20): fönstrets tre nya komponenter i
  // kedjeordning (u1 etfmekanik 59 · s6-u2 kontrahent 60 · u3 marknadsrytm 61).
  "svaraLokaltEtfmekanik",
  "svaraLokaltKontrahent",
  // Omgång 25-tillägg (s6-u2 försök 2, 2026-09-20): grundmultiplarna —
  // 61:a motorn, FÖRE marknadsrytm (deras SIST-deklaration; v04 P/S + v05 P/B).
  "svaraLokaltMultipel",
      // Omgång 26 (manifest auto-s6-1789890903364 — ordningspasset efter två
      // krockade harmoniseringsvågor): fönstrets tre i KEDJEORDNING — riskadress
      // (s6-u1, 62:a) · balansdjup (s6-u2, 63:e) · optionshantverk (s6-u3, 64:e)
      // — FÖRE marknadsrytm (deras SIST-deklaration).
      "svaraLokaltRiskadress",
      "svaraLokaltBalansdjup",
      "svaraLokaltOptionshantverk",
      "svaraLokaltPengarstid",
  // V219-harmonisering (rond 114): pengarstid wireades i widgeten utan svitharmonisering
  // (föregångare: 54e7a59e studio: auto s6-u2 AI-MENTORN +2 FÖRHANDSFRÅGOR — PENGARNAS TID OCH ORD) — mellan optionshantverk och marknadsrytm.
  "svaraLokaltVolatilitetsmekanik",
    // Omgång 27 (auto-s6-1789912510460, s6-u2): volatilitetsmekanik — slutsvepet.
    "svaraLokaltCoinvest", "svaraLokaltTvangsmekanik", "svaraLokaltHandelsemotor", "svaraLokaltLonsamhetsgrund", "svaraLokaltMarknadsrytm",];
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
  if (!widget.includes('from "@/lib/ai-mentor-riskpremie-fragor"')) {
    FEL.push("importen av ai-mentor-riskpremie-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
  // Omgång 21:s fönsterlager: u3:s koncernläsning och u2:s tillväxtdjup
  // (båda EFTER detta lager) — kända och välkomna.
    // Fönstret efter omgång 27 (s6-u2, _s6u2o28-): ModernaRisker + Coinvest+Tvangsmekanik i widgetordning — läkning av omgång 27:s öppna harmoniseringsskuld
  // (ModernaRisker/Coinvest wireades utan familjepass; dokumentationsplikten, rond 114-läxan).
    // Fönster 29 (s6-u2, _s6u2o29-): Handelsemotor i widgetordning FÖRE marknadsrytm —
  // svitharmoniseringens dokumentationsplikt (rond 114-läxan: widget-wire ⇒ harmonisering i samma leverans).
    // Fönster 29 (s6-u1, _s6u1o29-): kemisektor i widgetordning (efter lonsamhetsgrund,
  // före marknadsrytm) — svitharmoniseringens dokumentationsplikt (V219-läxan).
  const kanda = new Set([...KOMPONENTER, "svaraLokaltKemisektor"]);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla 46 lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "riskpremie lager 43 av 46 (före överlevnadsdjup; omgång 21:s koncernläsning + tillväxtdjup efter), inga okända komponenter",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN RISKPREMIE (s6-u1 omgång 21): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
