/**
 * TESTA AI-MENTORN — FAKTORDJUP-LAGRET (spår 6 omgång 22, s6-u1), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-faktordjup.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers monster (faktorpremier — avkastningens bucklor:
 * CAPM-linjen och dess bucklor, de fyra klassiska faktorerna,
 * regressionens laddningar, tre skolor, fyra fällor):
 *   A  kanonisk    — 1 fråga: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), ≥4 källor), ≥3 registeräkta kurslänkar
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (49 lager)
 *   D02 register   — kategoriantal + kursminuten i texten ur registret
 *   D03 aritmetik  — kursexempelens tal OBEROENDE omräknade (CAPM-linjen,
 *                    Sharpe-paret, laddningsblandningen, momentum-nettot,
 *                    varningshistorien)
 *   E  genomström  — omatchade frågor → null (API-flödet)
 *   F  juridik     — inga köp/sälj-rådfraser (lagen 2007:528 — utbildning)
 *   G  antistöld   — tidigare kanoniska (inkl. fönstrets syskonlager) → null
 *   G2 syskonkärnord — ALLA tidigare lagers kärnord LIVE som frågor → 0
 *   H  kedja       — lager-invarianten: gamla svar bitidentiska
 *                    med/utan detta lager + ämneskontroller + nya rätt
 *   I  omkastad    — den nya kanoniska → null i kedjan UTAN detta lager
 *   J  disjunktion — kärnorden överlappar inget tidigare lagers (mekaniskt)
 *   L  widget-synk — kedjeraden i chat-widget.tsx bär samtliga lager i
 *                    ordning + import + inga okända komponenter
 *
 * Syskonimporter är TOLERANTA (syskon kan skriva just nu): omgång 22:s
 * trefönster bär u2/u3:s bokmastar (3 monsters, wiread EFTER detta lager)
 * och konvertibler (modul på disk, wiring pågår — förväntas efter
 * bokmastar; om frånvarande i widgeten just nu tolereras det).
 *
 * DOKUMENTERAD GRÄNS (sond _s6u1-sond-omg22.mjs; anspråk
 * data/vakten/auto-s6-1789791914561-u1-ansprak.md): riskmåttsdjupet äger
 * beta/CAPM/smart beta-familjen («vad är betat?» · «vad är smart beta?»
 * FÅNGAS av dem — knappens mål); riskpremielagret äger premie-orden i
 * risk-samhanhang (naket «premie» är inte kärnord här); «faktorer»
 * (plural) STRYKS som kärnord — grannen «sektorer» på tavstånd 2 inom
 * toleransen för åttabokstavsord; ekosystemdjupet äger backtest/SAM-orden
 * — inget av dessa är kärnord här.
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — kursens budskap bärs med i
 * texten: aldrig en rekommendation att bära någon faktor alls.
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-faktordjup.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltFaktordjup, FAKTORDJUP_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-faktordjup-fragor.ts")).href);

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
const { svaraLokaltRiskpremie, RISKPREMIE_MONSTER } = await tolerera("ai-mentor-riskpremie-fragor.ts", ["svaraLokaltRiskpremie", "RISKPREMIE_MONSTER"]);
const { svaraLokaltOverlevnadsdjup, OVERLEVNADSDJUP_MONSTER } = await tolerera("ai-mentor-overlevnadsdjup-fragor.ts", ["svaraLokaltOverlevnadsdjup", "OVERLEVNADSDJUP_MONSTER"]);
const { svaraLokaltKoncernlasning, KONCERNLASNING_MONSTER } = await tolerera("ai-mentor-koncernlasning-fragor.ts", ["svaraLokaltKoncernlasning", "KONCERNLASNING_MONSTER"]);
const { svaraLokaltTillvaxtdjup, TILLVAXTDJUP_MONSTER } = await tolerera("ai-mentor-tillvaxtdjup-fragor.ts", ["svaraLokaltTillvaxtdjup", "TILLVAXTDJUP_MONSTER"]);
// Omgång 22:s fönstersyskon (wireade EFTER detta lager i widgeten).
const { svaraLokaltBokmastar, BOKMASTAR_MONSTER } = await tolerera("ai-mentor-bokmastar-fragor.ts", ["svaraLokaltBokmastar", "BOKMASTAR_MONSTER"]);
const { svaraLokaltKonvertibel, KONVERTIBEL_MONSTER } = await tolerera("ai-mentor-konvertibel-fragor.ts", ["svaraLokaltKonvertibel", "KONVERTIBEL_MONSTER"]);

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
    fraga: "Vad är faktorpremier?",
    amne: "faktorpremier",
    slug: "pf-15-faktorpremierna",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltFaktordjup(f.fraga, KURSREGISTER);
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
  { fraga: "vad är faktorpremierna?", amne: "faktorpremier" }, // bestämd plural
  { fraga: "vad är faktorpremie?", amne: "faktorpremier" }, // obestämd singular
  { fraga: "vad ar faktorpremier?", amne: "faktorpremier" }, // diafri (ä→a)
  { fraga: "vad är en faktor?", amne: "faktorpremier" }, // grundformen
  { fraga: "vad ar en faktor?", amne: "faktorpremier" }, // diafri grundform
  { fraga: "vad är momentum?", amne: "faktorpremier" }, // faktor-familjens mest nakna
  { fraga: "vad är momentumfaktorn?", amne: "faktorpremier" }, // sammansatt bestämd
  { fraga: "vad är värdefaktorn?", amne: "faktorpremier" }, // första klassikern
  { fraga: "vad ar vardefaktorn?", amne: "faktorpremier" }, // diafri
  { fraga: "vad är storleksfaktorn?", amne: "faktorpremier" }, // andra klassikern
  { fraga: "vad är lågvolatilitetsanomalin?", amne: "faktorpremier" }, // anomalin
  { fraga: "vad ar lagvolatilitetsanomalin?", amne: "faktorpremier" }, // diafri
  { fraga: "vad är femfaktormodellen?", amne: "faktorpremier" }, // 2015-tillägget
  { fraga: "vad är faktorzoo?", amne: "faktorpremier" }, // fällan
  { fraga: "hur fungerar faktorinvestering?", amne: "faktorpremier" }, // hur-form
  { fraga: "vad är faktorinvesteringar?", amne: "faktorpremier" }, // plural
  { fraga: "vad är storlekspremien?", amne: "faktorpremier" }, // premie-form
  { fraga: "vad är värdepremien?", amne: "faktorpremier" }, // premie-form
  { fraga: "förklara faktorpremierna?", amne: "faktorpremier" }, // befallningsform
  // «vad är det tysta betat?» STRYKS ur B-listan (kedjetest-fånga
  // 2026-09-19): riskmåttsdjupets «beta» (tolerans 1) fångar böjningen
  // «betat» genom HELA kedjan — deras territorium. Kursens signaturfras
  // bärs i svarets TEXT ("det tysta betat" i källradens lagrow-text +
  // övriga tal), aldrig som kärnord (G01-doktrinen).
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltFaktordjup(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltFaktordjup(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltFaktordjup(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL D: källaäkthet — källor och kurslänkar FINNS i registret ─────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltFaktordjup(f.fraga, KURSREGISTER);
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
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta (4 källor: pf-15 + rp-02 + ma-06 + km-015)");

  // fragor:-knappar skall landa i HELA kedjan — detta lagers knappar länkar
  // medvetet till TIDIGARE lager (beta → riskmåttsdjupet, aktiernas
  // riskpremie → riskpremielagret) enligt "tidigare lager"-kravet.
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
    (svaraLokaltTillvaxtdjup ? svaraLokaltTillvaxtdjup(fraga, KURSREGISTER) : null) ??
    svaraLokaltFaktordjup(fraga, KURSREGISTER) ??
    (svaraLokaltBokmastar ? svaraLokaltBokmastar(fraga, KURSREGISTER) : null) ??
    (svaraLokaltKonvertibel ? svaraLokaltKonvertibel(fraga, KURSREGISTER) : null);
  for (const f of NYA) {
    const svar = svaraLokaltFaktordjup(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (49 lager)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategorins antal och kursminuten i
  // texten ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake).
  const pfAntal = KURSREGISTER.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
  const pf15 = KURSREGISTER.find((r) => r.slug === "pf-15-faktorpremierna");
  const rp02 = KURSREGISTER.find((r) => r.slug === "rp-02-tre-matt-tre-fragor");
  const s1 = svaraLokaltFaktordjup(NYA[0].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — PORTFÖLJHANTERING=" + pfAntal + " · pf-15 " + (pf15 ? pf15.minuter + " min " + pf15.niva : "?") + " · rp-02 " + (rp02 ? rp02.minuter + " min" : "?"),
    !!s1 &&
    s1.text.includes(pfAntal + " kurser") &&
    (pf15 ? s1.text.includes(pf15.kapitel + " kapitel · " + pf15.minuter + " min · " + pf15.niva.toLowerCase() + " nivå") : false) &&
    (rp02 ? s1.text.includes(rp02.minuter + " min") : false),
    "texten ska bära registrets egna tal",
  );
}

// ── FALL D03: aritmetik — kursexempelens tal OBEROENDE omräknade ───────────
{
  const s = svaraLokaltFaktordjup(NYA[0].fraga, KURSREGISTER);
  const fel = [];
  if (!s) {
    kontroll("D03 aritmetik — elva talkontroller", false, "inget svar");
  } else {
    // 1. CAPM-linjen (pf-15 K1): 2,0 + 1,2 × 4,0 = 6,8 procent
    if (Math.abs(2.0 + 1.2 * 4.0 - 6.8) > 1e-9) fel.push("CAPM-referens fel");
    if (!s.text.includes("2,0 + 1,2 × 4,0 = 6,8 procent")) fel.push("texten saknar '2,0 + 1,2 × 4,0 = 6,8 procent'");
    // 2. Sharpe-paret (K2): (8,0 − 2,0) ÷ 22 = 0,27 · (7,5 − 2,0) ÷ 13 = 0,42
    if (Math.abs((8.0 - 2.0) / 22 - 0.2727) > 0.001) fel.push("högbeta-Sharpe fel");
    if (Math.abs((7.5 - 2.0) / 13 - 0.4231) > 0.001) fel.push("lågbeta-Sharpe fel");
    for (const str of ["(8,0 − 2,0) ÷ 22 = 0,27", "(7,5 − 2,0) ÷ 13 = 0,42"]) {
      if (!s.text.includes(str)) fel.push("texten saknar '" + str + "'");
    }
    // 3. Laddningsblandningen (K3): 0,5 × 6,0 + 0,5 × 9,0 = 7,5 procent
    if (Math.abs(0.5 * 6.0 + 0.5 * 9.0 - 7.5) > 1e-9) fel.push("blandningsreferens fel");
    if (!s.text.includes("0,5 × 6,0 + 0,5 × 9,0 = 7,5 procent")) fel.push("texten saknar '0,5 × 6,0 + 0,5 × 9,0 = 7,5 procent'");
    // 4. Momentum-nettot (K3): 6,0 − 2,5 = 3,5 procent
    if (Math.abs(6.0 - 2.5 - 3.5) > 1e-9) fel.push("momentum-nettoreferens fel");
    if (!s.text.includes("6,0 − 2,5 = 3,5 procent")) fel.push("texten saknar '6,0 − 2,5 = 3,5 procent'");
    // 5. Varningshistorien (K5): 0,982¹³ ≈ 0,79 — drygt tjugo procents utfall
    if (Math.abs(Math.pow(0.982, 13) - 0.79) > 0.005) fel.push("0,982¹³-referens fel");
    if (Math.abs(1 - Math.pow(0.982, 13) - 0.21) > 0.005) fel.push("tjugo procents-referens fel");
    for (const str of ["0,982 upphöjt till tretton ≈ 0,79", "drygt tjugo procents utfall"]) {
      if (!s.text.includes(str)) fel.push("texten saknar '" + str + "'");
    }
    // 6. Laddningarnas inbördes summering (K3): A bär 1,00+0,05+0,10+0,02 ≈ ren marknad
    if (Math.abs(1.0 + 0.05 + 0.1 + 0.02 - 1.17) > 1e-9) fel.push("laddningsreferens fel");
    for (const str of ["1,00", "0,05", "0,10", "0,02", "0,70", "0,45", "0,30", "0,15"]) {
      if (!s.text.includes(str)) fel.push("texten saknar laddningen '" + str + "'");
    }
    kontroll("D03 aritmetik — CAPM-linjen + Sharpe-paret + blandningen + momentum-nettot + varningshistorien + laddningarna oberoende omräknade", fel.length === 0,
      fel.length ? fel.join(" | ") : "6,8 · 0,27/0,42 · 7,5 · 3,5 · 0,79 · 8 laddningar");
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
  const svar = svaraLokaltFaktordjup(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltFaktordjup(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser i faktordjup-svaret", FEL.length === 0,
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
  // Omgång 21
  { fraga: "Vad är koncernredovisning?", amne: null },
  { fraga: "Vad är minoritetsintressen?", amne: null },
  { fraga: "Vad är segmentrapportering?", amne: null },
  { fraga: "Vad är pensionsåtaganden?", amne: null },
  { fraga: "Vad är organisk tillväxt?", amne: null },
  { fraga: "Vad är volym pris och mix?", amne: null },
  { fraga: "Vad är aktiernas riskpremie?", amne: "riskpremie" },
  // Omgång 22: fönstrets syskon (bokmastar + konvertibler) — amne:null:
  // deras filer är OCOMMITTADE (skrivs just nu); tolerant import kan ge
  // null och ämneskontrollen skulle ge falskrött brus. Antistölden G01
  // + G2 täcker dem mekaniskt ändå.
  { fraga: "Vad är financial shenanigans?", amne: null },
  { fraga: "Vad är redovisningsdetektiven?", amne: null },
  { fraga: "Vad är maniernas historia?", amne: null },
  { fraga: "Vad är special situations?", amne: null },
  { fraga: "Vad är konvertibler?", amne: null },
  { fraga: "Vad är hybridkapital?", amne: null },
  // Sondens dokumenterade gränser — ägs av tidigare lager, ska STANSA kvar:
  { fraga: "Vad är betat?", amne: null },
  { fraga: "Vad är beta?", amne: null },
  { fraga: "Vad är smart beta?", amne: null },
  { fraga: "Vad är capm?", amne: null },
  { fraga: "Vad är value at risk?", amne: null },
  { fraga: "Vad är kelly-kriteriet?", amne: null },
  { fraga: "Vad är riskparitet?", amne: null },
  { fraga: "Vad är reverse dcf?", amne: null },
];
{
  const STJALDA = GAMLA.filter((f) => svaraLokaltFaktordjup(f.fraga, KURSREGISTER) !== null);
  kontroll("G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i faktordjup-lagret", STJALDA.length === 0,
    STJALDA.length ? STJALDA.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltFaktordjup(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓");
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
    BOKMASTAR_MONSTER, KONVERTIBEL_MONSTER,
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
  const fangade = fragor.filter((f) => svaraLokaltFaktordjup(f, KURSREGISTER) !== null);
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
    ["faktordjup", svaraLokaltFaktordjup],
    ["bokmastar", svaraLokaltBokmastar],
    ["konvertibel", svaraLokaltKonvertibel],
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
  const UTAN = LAGER.filter(([namn]) => namn !== "faktordjup");

  // Invarianten: detta lager ändrar ALDRIG ett tidigare svar, och de
  // senare lagren (bokmastar/konvertibel) ligger efter i kedjan — deras
  // svar på frågor detta lager lämnar ifred.
  const fel = [];
  for (const f of GAMLA) {
    const med = kora(MED, f.fraga);
    const utan = kora(UTAN, f.fraga);
    if (JSON.stringify(med) !== JSON.stringify(utan)) {
      fel.push("'" + f.fraga + "' ändrad av faktordjup-lagret (med=" + (med ? med.amne : "null") + ", utan=" + (utan ? utan.amne : "null") + ")");
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
  for (const q of ["Vad är beta?", "Vad är aktiernas riskpremie?"]) {
    const mal = kora(MED, q.toLowerCase());
    if (!mal) fel.push("motfråga '" + q + "' landar null i kedjan — död knapp");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla oförändrade (lager-invarianten) + " + GAMLA.filter((x) => x.amne).length + " ämneskontroller + " + NYA.length + " nya når rätt lager (49 lager, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + NYA.length + 2) + "/" + (GAMLA.length + NYA.length + 2) + " rätt",
  );

  // ── FALL I: OMKASTAD ANTISTÖLD — min kanoniska ger null UTAN detta ────────
  const tjuvade = NYA.filter((f) => kora(UTAN, f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — den nya kanoniska ger null i kedjan UTAN faktordjup-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kora(UTAN, f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER, RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FÖRVÄNTNINGSDJUP_MONSTER, PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER, VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLÄSNINGSDJUP_MONSTER, AVKASTNINGSKURVA_MONSTER, VARDERINGSVERKTYG_MONSTER, WARRANT_MONSTER, TIDSAXEL_MONSTER, KAPITALBINDNING_MONSTER, EKOSYSTEMDJUP_MONSTER, PORTFOLJPRAKTIK_MONSTER, UTDELNINGSKALENDER_MONSTER, KREDITDJUP_MONSTER, SEKTORDJUP_MONSTER, SEKTORSKOLA2_MONSTER, BETEENDEMEKANIK_MONSTER, OVERLEVNADSDJUP_MONSTER, KONCERNLASNING_MONSTER, TILLVAXTDJUP_MONSTER, BOKMASTAR_MONSTER, KONVERTIBEL_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of FAKTORDJUP_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — FAKTORDJUP_MONSTER vs " + (tidigare.size > 0 ? "alla tidigare lager" : "0 lager") + " (" + tidigare.size + " kärnord)",
    krock.length === 0,
    krock.length ? krock.join(" | ") : "0 överlapp ✓",
  );
}

// ── FALL L: WIDGET-SYNK — kedjeraden i chat-widget.tsx bär alla lager ──────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const KOMPONENTER = [
    "svaraLokaltMakro", "svaraLokaltExtra", "svaraLokalt", "svaraLokaltNasta",
    "svaraLokaltKapitalmekanik", "svaraLokaltSektor", "svaraLokaltCase",
    "svaraLokaltPraktik", "svaraLokaltPortfoljgrund", "svaraLokaltAgande",
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
    // Omgång 22 (s6-u1): detta lager — före bokmastar, INTE SIST.
    "svaraLokaltFaktordjup",
    // Omgång 22: bokmastar (fönstrets syskon) — SIST av de wireade.
    "svaraLokaltBokmastar",
    // Omgång 22:s fönster (s6-u3 bokmastar + s6-u2 riskbudget + s6-u1 konvertibel — svitharmoniseringens dokumentationsplikt).
    "svaraLokaltRiskbudget",
  ];
  // Konvertibel (fönstrets syskon, modul på disk) förväntas wireas efter
  // bokmastar — TOLERERAD om frånvarande just nu (syskonet skriver).
  const KANSKE = ["svaraLokaltKonvertibel"];
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
  for (const komp of KANSKE) {
    const pos = rad.indexOf(komp + "(");
    if (pos !== -1 && pos < senaste) FEL.push(komp + " wiread FÖRE bokmastar — bryter fönstrets ordning");
  }
  if (!widget.includes('from "@/lib/ai-mentor-faktordjup-fragor"')) {
    FEL.push("importen av ai-mentor-faktordjup-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
  const kanda = new Set([...KOMPONENTER, ...KANSKE]);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär samtliga lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "faktordjup lager 48 (efter tillväxtdjup, före bokmastar), inga okända komponenter",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN FAKTORDJUP (s6-u1 omgång 22): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
