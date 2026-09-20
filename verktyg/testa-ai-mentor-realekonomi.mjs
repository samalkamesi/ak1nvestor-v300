/**
 * TESTA AI-MENTORN — REALEKONOMI-LAGRET (spår 6 omgång 23, s6-u1), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-realekonomi.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers monster (realekonomin — ekonomins verkliga sida i sex
 * fönster: arbetsmarknadens två mått och NAIRU, handelsbalansens undertal
 * och J-kurvan, råvaran och fatet, stats-kassans fyra ramverk, tyngdpunkten
 * Kina och den geopolitiska risken):
 *   A  kanonisk    — 1 fråga: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), ≥4 källor — detta lager bär 6), ≥3
 *                    registeräkta kurslänkar
 *   A2 wiring      — komponenten i chat-widget.tsx kompositionsrad, efter
 *                    vardegrund (53:e motorn i 53-läget), ingen SIST-anspråk
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (53 lager)
 *   D02 register   — kategoriantal + kursminuter i texten ur registret
 *   D03 aritmetik  — kursexempelens tal OBEROENDE omräknade (deltagandet,
 *                    bytesbalansen, skiffern, valutadubbeln, multiplikatorn)
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
 * Syskonimporter är TOLERANTA (syskon kan skriva just nu): omgång 23:s
 * trefönster bär u2:s sektorlasning (2 monsters) och u3:s vardegrund
 * (3 monsters) — båda wireade FÖRE detta lager.
 *
 * DOKUMENTERADE GRÄNSER (sond _s6u1-sond{,2,3}-omg23.mjs, fyra ronder;
 * anspråk data/vakten/auto-s6-1789814130065-s6-u1-ansprak.md):
 *   • BAS äger hela indikator-paraplyet («vad är rsi?» · «vad är macd?» ·
 *     «vad är bollinger bands?» · «vad är candlestick?» · «vad är
 *     trendlinjer?» FÅNGAS av dem) — rond 2:s dödade förstaval; deras
 *     frågor stansas kvar (knapp bärs ej — deras svar lever).
 *   • MAKRO äger ränte-/inflations-/penningpolitik-orden — här ENDAST
 *     starkord + motfrågeknapp («vad är inflation och KPI?»).
 *   • TIDSAXEL äger konjunkturindikator-familjen — naket «indikator»/
 *     «indikatorer» är INTE kärnord här (böjningen på tavstånd 2); deras
 *     fråga bärs som knapp.
 *   • HANDELSDAGEN äger «sanktioner» (deras «auktioner» fångar på
 *     tavstånd 2 — live-bevisat); ordet bärs här ENDAST som starkord.
 *   • TILLVÄXTDJUPET äger «phillips-kurvan» i bindestrecksform (deras
 *     «s-kurvan» fångar via substring «s kurvan» ⊂ «phillips kurvan»);
 *     den hopskrivna formen «phillipskurvan» är detta lagers.
 *   • u2 SEKTORLÄSNING äger energibolag/oljebolag (deras not: «oljepris
 *     endast starkord») — oljepris-ORTEN är detta lagers.
 *   • u3 VÄRDEGRUNDEN äger motiverat värde/realoptioner/kassaflödes-
 *     avkastning — orört här.
 *   • «j-kurvan» behålls: bindestrecket ⇒ FRAS-matchning efter
 *     normalisering («j kurvan» är inte delsträng i «s kurvan»).
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — kursens budskap bärs med i
 * texten: aldrig en rekommendation, ty varje läsare bär sin egen horisont.
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-realekonomi.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltRealekonomi, REALEKONOMI_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-realekonomi-fragor.ts")).href);

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
const { svaraLokaltFaktordjup, FAKTORDJUP_MONSTER } = await tolerera("ai-mentor-faktordjup-fragor.ts", ["svaraLokaltFaktordjup", "FAKTORDJUP_MONSTER"]);
const { svaraLokaltBokmastar, BOKMASTAR_MONSTER } = await tolerera("ai-mentor-bokmastar-fragor.ts", ["svaraLokaltBokmastar", "BOKMASTAR_MONSTER"]);
const { svaraLokaltRiskbudget, RISKBUDGET_MONSTER } = await tolerera("ai-mentor-riskbudget-fragor.ts", ["svaraLokaltRiskbudget", "RISKBUDGET_MONSTER"]);
const { svaraLokaltKonvertibel, KONVERTIBEL_MONSTER } = await tolerera("ai-mentor-konvertibel-fragor.ts", ["svaraLokaltKonvertibel", "KONVERTIBEL_MONSTER"]);
// Omgång 23:s fönstersyskon (wireade FÖRE detta lager i widgeten).
const { svaraLokaltSektorlasning, SEKTORLASNING_MONSTER } = await tolerera("ai-mentor-sektorlasning-fragor.ts", ["svaraLokaltSektorlasning", "SEKTORLASNING_MONSTER"]);
const { svaraLokaltVardegrund, VARDEGRUND_MONSTER } = await tolerera("ai-mentor-vardegrund-fragor.ts", ["svaraLokaltVardegrund", "VARDEGRUND_MONSTER"]);

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
    fraga: "Vad är realekonomin?",
    amne: "realekonomin",
    slug: "mk-02-arbetsloshet",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltRealekonomi(f.fraga, KURSREGISTER);
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

// ── FALL A2: wiring — komponenten i widgetens kompositionsrad ──────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rad = widget.match(/const lokalt = ([^;]+);/);
  const ordning = rad ? [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]) : [];
  const minPos = ordning.indexOf("svaraLokaltRealekonomi");
  const vgPos = ordning.indexOf("svaraLokaltVardegrund");
  kontroll(
    "A2 wiring — realekonomi efter vardegrund i kompositionsraden (position " + (minPos + 1) + " av " + ordning.length + ")",
    minPos > vgPos && vgPos !== -1 && minPos !== -1 && ordning.length >= 53,
    minPos === -1 ? "komponenten saknas i kedjeraden" : "53-läget: … → sektorlasning (51) → vardegrund (52) → realekonomi (" + (minPos + 1) + ")",
  );
}

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad är realekonomin?", amne: "realekonomin" }, // bestämd form
  { fraga: "vad är realekonomi?", amne: "realekonomin" }, // obestämd form
  { fraga: "vad ar realekonomin?", amne: "realekonomin" }, // diafri (ä→a)
  { fraga: "vad är realekonomins roll?", amne: "realekonomin" }, // genitiv
  { fraga: "vad är arbetslöshet?", amne: "realekonomin" }, // fönster 1
  { fraga: "vad är arbetslösheten?", amne: "realekonomin" }, // bestämd
  { fraga: "vad ar arbetslosheten?", amne: "realekonomin" }, // diafri
  { fraga: "vad är arbetsmarknaden?", amne: "realekonomin" }, // marknaden
  { fraga: "vad är sysselsättningen?", amne: "realekonomin" }, // spegelmåttet
  { fraga: "vad är nairu?", amne: "realekonomin" }, // gränsen
  { fraga: "vad är phillipskurvan?", amne: "realekonomin" }, // hopskriven form
  { fraga: "vad är aku?", amne: "realekonomin" }, // stickprovets namn
  { fraga: "vad är handelsbalansen?", amne: "realekonomin" }, // fönster 2
  { fraga: "vad är bytesbalansen?", amne: "realekonomin" }, // bredare måttet
  { fraga: "vad ar bytesbalansen?", amne: "realekonomin" }, // diafri
  { fraga: "vad är j-kurvan?", amne: "realekonomin" }, // tålamodsmåttet (fras)
  { fraga: "vad är reer?", amne: "realekonomin" }, // konkurrenskraften
  { fraga: "vad är oljepriset?", amne: "realekonomin" }, // fönster 3
  { fraga: "vad är olja?", amne: "realekonomin" }, // råvaran naket
  { fraga: "vad ar oljepriset?", amne: "realekonomin" }, // diafri
  { fraga: "vad är råolja?", amne: "realekonomin" }, // råformen
  { fraga: "vad är opec?", amne: "realekonomin" }, // kartellen
  { fraga: "vad är brent?", amne: "realekonomin" }, // referensen
  { fraga: "vad är finanspolitik?", amne: "realekonomin" }, // fönster 4
  { fraga: "vad är finanspolitiken?", amne: "realekonomin" }, // bestämd
  { fraga: "vad är statsbudgeten?", amne: "realekonomin" }, // kassan
  { fraga: "vad är utgiftstak?", amne: "realekonomin" }, // ramverket
  { fraga: "vad är överskottsmål?", amne: "realekonomin" }, // måttet
  { fraga: "vad ar overskottsmalet?", amne: "realekonomin" }, // diafri
  { fraga: "vad är geopolitik?", amne: "realekonomin" }, // fönster 5
  { fraga: "vad är kinaekonomin?", amne: "realekonomin" }, // fönster 6
  { fraga: "vad ar kinaekonomin?", amne: "realekonomin" }, // diafri
  { fraga: "vad är kinas ekonomi?", amne: "realekonomin" }, // separerad form
  { fraga: "vad är kinesiska ekonomin?", amne: "realekonomin" }, // adjektivform
  { fraga: "vad är kina?", amne: "realekonomin" }, // naket
  { fraga: "vad är evergrande?", amne: "realekonomin" }, // kollapsen
  { fraga: "vad är handelskrig?", amne: "realekonomin" }, // tullarnas tid
  { fraga: "förklara realekonomin", amne: "realekonomin" }, // befallningsform
  // STRYKNA ur B-listan (dokumenterade gränser — deras territorium):
  // «vad är rsi/macd/bollinger/candlestick?» (basens), «vad är sanktioner?»
  // (handelsdagens via «auktioner»), «vad är phillips-kurvan?» (tillväxt-
  // djupets via substring), «vad är inflation/ränta/penningpolitik?» (makros),
  // «vad är konjunkturindikatorer?» (tidsaxelns), «vad är energibolag?»
  // (u2:s), «vad är motiverat värde/realoptioner?» (u3:s).
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltRealekonomi(f.fraga, KURSREGISTER);
  kontroll(nr + " variant — '" + f.fraga + "'", !!svar && svar.amne === f.amne,
    svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism — samma fråga twice ⇒ bitidentiskt ─────────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const fel = [];
  for (const f of alla) {
    const a = JSON.stringify(svaraLokaltRealekonomi(f, KURSREGISTER));
    const b = JSON.stringify(svaraLokaltRealekonomi(f, KURSREGISTER));
    if (a !== b) fel.push("'" + f + "' ej deterministiskt");
  }
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", fel.length === 0,
    fel.length ? fel.join(" | ") : "0 avvikelser");
}

// ── FALL D01 + D01b + D02: källaäkthet, knappar, registerdrivna tal ────────
{
  const FEL = [];
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  for (const f of NYA) {
    const svar = svaraLokaltRealekonomi(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const kk of svar.kallor ?? []) {
      if (kk.slug && !slugFinns.has(kk.slug)) FEL.push("källa '" + kk.slug + "' finns ej i registret");
    }
    for (const h of svar.handlings) {
      if (h.lank.startsWith("/kurser/") && !slugFinns.has(h.lank.slice("/kurser/".length))) {
        FEL.push("handling '" + h.lank + "' finns ej i registret");
      }
    }
    if (svar.fordjupa && svar.fordjupa.lank.startsWith("/kurser/") && !slugFinns.has(svar.fordjupa.lank.slice("/kurser/".length))) {
      FEL.push("fordjupa '" + svar.fordjupa.lank + "' (" + f.amne + ") finns ej i registret");
    }
  }
  kontroll("D01 källaäkthet — inga fantomslugar i de nya svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta (6 källor: mk-02 + mk-03 + mk-05 + mk-07 + mk-10 + mk-11)");

  // fragor:-knappar skall landa i HELA kedjan — detta lagers knappar länkar
  // medvetet till TIDIGARE lager (konjunkturindikatorer → tidsaxeln,
  // inflation/KPI → makro, energibolag → u2:s sektorläsning) enligt
  // "tidigare lager"-kravet.
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
    (svaraLokaltRiskbudget ? svaraLokaltRiskbudget(fraga, KURSREGISTER) : null) ??
    (svaraLokaltKonvertibel ? svaraLokaltKonvertibel(fraga, KURSREGISTER) : null) ??
    (svaraLokaltSektorlasning ? svaraLokaltSektorlasning(fraga, KURSREGISTER) : null) ??
    (svaraLokaltVardegrund ? svaraLokaltVardegrund(fraga, KURSREGISTER) : null) ??
    svaraLokaltRealekonomi(fraga, KURSREGISTER);
  for (const f of NYA) {
    const svar = svaraLokaltRealekonomi(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (53 lager)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategorins antal och kursminuten i
  // texten ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake).
  const mkAntal = KURSREGISTER.filter((r) => r.kategori === "MAKROEKONOMI").length;
  const mk02 = KURSREGISTER.find((r) => r.slug === "mk-02-arbetsloshet");
  const mk10 = KURSREGISTER.find((r) => r.slug === "mk-10-oljepris");
  const mk11 = KURSREGISTER.find((r) => r.slug === "mk-11-kinaekonomin");
  const s1 = svaraLokaltRealekonomi(NYA[0].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — MAKROEKONOMI=" + mkAntal + " · mk-02 " + (mk02 ? mk02.minuter + " min " + mk02.niva : "?") + " · mk-10 " + (mk10 ? mk10.minuter + " min" : "?") + " · mk-11 " + (mk11 ? mk11.minuter + " min" : "?"),
    !!s1 &&
    s1.text.includes(mkAntal + " kurser") &&
    (mk02 ? s1.text.includes(mk02.kapitel + " kapitel · " + mk02.minuter + " min · " + mk02.niva.toLowerCase() + " nivå") : false) &&
    (mk10 ? s1.text.includes(mk10.minuter + " min") : false) &&
    (mk11 ? s1.text.includes(mk11.minuter + " min · " + mk11.niva.toLowerCase()) : false),
    "texten ska bära registrets egna tal",
  );
}

// ── FALL D03: aritmetik — kursexempelens tal OBEROENDE omräknade ───────────
{
  const s = svaraLokaltRealekonomi(NYA[0].fraga, KURSREGISTER);
  const fel = [];
  if (!s) {
    kontroll("D03 aritmetik — elva talkontroller", false, "inget svar");
  } else {
    // 1. Arbetskraftsdeltagandets fall (mk-02 K1): 79 − 72 = 7 procentenheter
    if (Math.abs(79 - 72 - 7) > 1e-9) fel.push("deltagandereferens fel");
    if (!s.text.includes("79 − 72 = 7 procentenheter")) fel.push("texten saknar '79 − 72 = 7 procentenheter'");
    // 2. Bytesbalansens undertal (mk-03 K3): −3 + 5 = +2 procent av BNP
    if (Math.abs(-3 + 5 - 2) > 1e-9) fel.push("bytesbalansreferens fel");
    if (!s.text.includes("−3 + 5 = +2 procent")) fel.push("texten saknar '−3 + 5 = +2 procent'");
    // 3. Skifferrevolutionen (mk-10 K1): 1 → 9 miljoner; 9 − 1 = 8
    if (Math.abs(9 - 1 - 8) > 1e-9) fel.push("skifferreferens fel");
    if (!s.text.includes("9 − 1 = 8 miljoner")) fel.push("texten saknar '9 − 1 = 8 miljoner'");
    // 4. Valutadubbeln (mk-10 K3): 80 − 65 = 15 procentenheter
    if (Math.abs(80 - 65 - 15) > 1e-9) fel.push("valutadubbelreferens fel");
    if (!s.text.includes("80 − 65 = 15 procentenheter")) fel.push("texten saknar '80 − 65 = 15 procentenheter'");
    // 5. Multiplikatorn (mk-07 K1): 10 × 0,7 = 7 till 10 × 1,2 = 12
    if (Math.abs(10 * 0.7 - 7) > 1e-9 || Math.abs(10 * 1.2 - 12) > 1e-9) fel.push("multiplikatorreferens fel");
    if (!s.text.includes("10 × 0,7 = 7 till 10 × 1,2 = 12")) fel.push("texten saknar '10 × 0,7 = 7 till 10 × 1,2 = 12'");
    // 6. Kursens nakna tal — konstanser som ska finnas i texten
    for (const str of [
      "30 000", // AKU-stickprovet
      "1–2 procentenheter", // klyftan
      "11 procent av arbetskraften", // 2005:s sjukskrivningar
      "159 liter", // fatet
      "40–60 dollar", // skifferbrytkostnaden
      "20–40", // OPEC-brytkostnaden
      "1,2 biljoner kronor motsvarar 50 procent av BNP", // budgeten
      "27 utgiftsområden", // anslagen
      "5–10 procent", // anslagsavvikelsen
      "17 biljoner dollar — cirka 70 procent av USA:s", // Kinas BNP
      "8 procent av intäkterna i Kina", // börsens exponering
      "+50 procent på en dag", // GPR-oljekvittot
    ]) {
      if (!s.text.includes(str)) fel.push("texten saknar '" + str + "'");
    }
    kontroll("D03 aritmetik — deltagandet + bytesbalansen + skiffern + valutadubbeln + multiplikatorn oberoende omräknade + 12 kurstal", fel.length === 0,
      fel.length ? fel.join(" | ") : "7 · +2 · 8 · 15 · 7/12 · 30 000 · 159 liter · 1,2 biljoner");
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
  const svar = svaraLokaltRealekonomi(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltRealekonomi(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser i realekonomi-svaret", FEL.length === 0,
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
  // Omgång 22
  { fraga: "Vad är faktorpremier?", amne: "faktorpremier" },
  { fraga: "Vad är momentum?", amne: "faktorpremier" },
  { fraga: "Vad är financial shenanigans?", amne: null },
  { fraga: "Vad är redovisningsdetektiven?", amne: null },
  { fraga: "Vad är maniernas historia?", amne: null },
  { fraga: "Vad är special situations?", amne: null },
  { fraga: "Vad är konvertibler?", amne: null },
  { fraga: "Vad är hybridkapital?", amne: null },
  { fraga: "Vad är volatilitetsbudgeten?", amne: null },
  { fraga: "Vad är sortino?", amne: null },
  // Omgång 23: fönstrets syskon (sektorlasning wiread + vardegrund wiread)
  { fraga: "Hur analyserar jag ett energibolag?", amne: null },
  { fraga: "Hur analyserar jag ett telekombolag?", amne: null },
  { fraga: "Vad är motiverat värde?", amne: null },
  { fraga: "Vad är intrinsic value?", amne: null },
  { fraga: "Vad är realoptioner?", amne: null },
  { fraga: "Vad är kassaflödesavkastning?", amne: null },
  // Sondens dokumenterade gränser — ägs av tidigare lager, ska STANSA kvar:
  { fraga: "Vad är rsi?", amne: null },
  { fraga: "Vad är macd?", amne: null },
  { fraga: "Vad är bollinger bands?", amne: null },
  { fraga: "Vad är candlestick?", amne: null },
  { fraga: "Vad är trendlinjer?", amne: null },
  { fraga: "Vad är glidande medelvärde?", amne: null },
  { fraga: "Vad är stöd och motstånd?", amne: null },
  { fraga: "Vad är 25-cellers matrisen?", amne: null },
  { fraga: "Vad är sanktioner?", amne: null },
  { fraga: "Vad är phillips-kurvan?", amne: null },
  { fraga: "Vad är penningpolitik?", amne: null },
  { fraga: "Vad är valutakursens mekanik?", amne: null },
];
{
  const STJALDA = GAMLA.filter((f) => svaraLokaltRealekonomi(f.fraga, KURSREGISTER) !== null);
  kontroll("G01 antistöld — " + GAMLA.length + " tidigare kanoniska/gränser ger null i realekonomi-lagret", STJALDA.length === 0,
    STJALDA.length ? STJALDA.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltRealekonomi(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓");
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
    BOKMASTAR_MONSTER, KONVERTIBEL_MONSTER, RISKBUDGET_MONSTER,
    SEKTORLASNING_MONSTER, VARDEGRUND_MONSTER,
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
  const fangade = fragor.filter((f) => svaraLokaltRealekonomi(f, KURSREGISTER) !== null);
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
    ["värderingsverktyg", svaraLokaltVarderingsverktyg],
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
    ["riskbudget", svaraLokaltRiskbudget],
    ["konvertibel", svaraLokaltKonvertibel],
    ["sektorlasning", svaraLokaltSektorlasning],
    ["vardegrund", svaraLokaltVardegrund],
    ["realekonomi", svaraLokaltRealekonomi],
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
  const UTAN = LAGER.filter(([namn]) => namn !== "realekonomi");

  // Invarianten: detta lager ändrar ALDRIG ett tidigare svar, och de tidigare
  // lagren ligger före i kedjan — deras svar lämnas ifred.
  const fel = [];
  for (const f of GAMLA) {
    const med = kora(MED, f.fraga);
    const utan = kora(UTAN, f.fraga);
    if (JSON.stringify(med) !== JSON.stringify(utan)) {
      fel.push("'" + f.fraga + "' ändrad av realekonomi-lagret (med=" + (med ? med.amne : "null") + ", utan=" + (utan ? utan.amne : "null") + ")");
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
  for (const q of ["Vad är konjunkturindikatorer?", "Vad är inflation och KPI?", "Hur analyserar jag ett energibolag?"]) {
    const mal = kora(MED, q.toLowerCase());
    if (!mal) fel.push("motfråga '" + q + "' landar null i kedjan — död knapp");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla oförändrade (lager-invarianten) + " + GAMLA.filter((x) => x.amne).length + " ämneskontroller + " + NYA.length + " nya når rätt lager (53 lager, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + NYA.length + 3) + "/" + (GAMLA.length + NYA.length + 3) + " rätt",
  );

  // ── FALL I: OMKASTAD ANTISTÖLD — min kanoniska ger null UTAN detta ────────
  const tjuvade = NYA.filter((f) => kora(UTAN, f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — den nya kanoniska ger null i kedjan UTAN realekonomi-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kora(UTAN, f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER, RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FÖRVÄNTNINGSDJUP_MONSTER, PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER, VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLÄSNINGSDJUP_MONSTER, AVKASTNINGSKURVA_MONSTER, VARDERINGSVERKTYG_MONSTER, WARRANT_MONSTER, TIDSAXEL_MONSTER, KAPITALBINDNING_MONSTER, EKOSYSTEMDJUP_MONSTER, PORTFOLJPRAKTIK_MONSTER, UTDELNINGSKALENDER_MONSTER, KREDITDJUP_MONSTER, SEKTORDJUP_MONSTER, SEKTORSKOLA2_MONSTER, BETEENDEMEKANIK_MONSTER, OVERLEVNADSDJUP_MONSTER, KONCERNLASNING_MONSTER, TILLVAXTDJUP_MONSTER, BOKMASTAR_MONSTER, KONVERTIBEL_MONSTER, RISKBUDGET_MONSTER, SEKTORLASNING_MONSTER, VARDEGRUND_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of REALEKONOMI_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — REALEKONOMI_MONSTER vs " + (tidigare.size > 0 ? "alla tidigare lager" : "0 lager") + " (" + tidigare.size + " kärnord)",
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
    "svaraLokaltFaktordjup",
    "svaraLokaltBokmastar",
    "svaraLokaltRiskbudget",
    "svaraLokaltKonvertibel",
    // Omgång 23: u2 sektorlasning (51:a) + u3 vardegrund (52:a).
    "svaraLokaltSektorlasning",
    "svaraLokaltVardegrund",
    // Omgång 23 (s6-u1): detta lager — 53:e, efter vardegrund, INGEN
    // SIST-anspråk (framtida lager trådar sig efter och harmoniserar).
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
    "svaraLokaltMarknadsrytm",];
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
  if (!widget.includes('from "@/lib/ai-mentor-realekonomi-fragor"')) {
    FEL.push("importen av ai-mentor-realekonomi-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
  const kanda = new Set(KOMPONENTER);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär samtliga lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "realekonomi lager 53 (efter vardegrund), inga okända komponenter",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN REALEKONOMI (s6-u1 omgång 23): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
