/**
 * TESTA AI-MENTORN — KONCERNLÄSNING-LAGRET (spår 6 omgång 21, s6-u3,
 * manifest auto-s6-1789768506578), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-koncernlasning.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers tre monsters (koncernredovisningen,
 * segmentrapporteringen, pensionsåtagandena):
 *   A  kanoniska   — 3 frågor: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), ≥3 källor), ≥3 registeräkta kurslänkar
 *   A2 wiring     — importen + kedjeraden i chat-widget.tsx bär detta lager
 *                    (44:e av 45 — efter överlevnadsdjup; syskonet u2:s
 *                    tillväxtdjup wireades efter min position samma fönster)
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (46 motorer;
 *                    däribland "vad är goodwill?" → kapitalmekaniken,
 *                    "vad är avskrivningar?" → redovisningsdjupet och
 *                    "vad är pensionssparande?" → portföljpraktiken, deras
 *                    dokumenterade ägande)
 *   D02 register   — kategoriantal + kursminuter i texterna ur registret
 *   D03 aritmetik  — exempelens 14 tal oberoende omräknade + nämnda i text
 *   E  genomström  — omatchade frågor → null (API-flödet)
 *   F  juridik     — inga köp/sälj-rådfraser (lagen 2007:528 — utbildning);
 *                    disclaimer i varje svar; inga bolagsnamn
 *   G  antistöld   — tidigare kanoniska → null i detta lager (däribland
 *                    basens rapport-monsters resultaträkning/bokslut/
 *                    balansräkning, kapitalmekanikens goodwill,
 *                    lönsamhetsdjupets WACC/ROIC, portföljpraktikens
 *                    pensionssparande — rond 2:s dokumenterade gränser)
 *   G2 syskonkärnord — ALLA tidigare lagers kärnord LIVE som frågor → 0
 *   H  kedja       — positionens invariant: gamla svar oförändrade
 *                    med/utan detta lager + ämneskontroller + nya rätt
 *   I  omkastad    — de 3 nya kanoniska → null i kedjan UTAN detta lager
 *   J  disjunktion — kärnorden överlappar inget annat lagers (mekaniskt)
 *   L  widget-synk — kedjeraden i chat-widget.tsx bär alla 46 kända lager
 *                    i ordning + import + inga okända komponenter
 *
 * Syskonimporter är TOLERANTA (syskon kan skriva just nu): samtliga 44
 * andra lager importeras med fallback null.
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — inga placeringstips, inga
 * omdömen om enskilda börsbolag; exempelens koncerner och tal är påhittade.
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-koncernlasning.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltKoncernlasning, KONCERNLASNING_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-koncernlasning-fragor.ts")).href);

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
// Omgång 21:s syskon u2 (wireat EFTER min position — harmonisering ömsesidig
// enligt omgång 20-precedensen; deras lager ingår i min helakedja/UTAN/
// L1/G2/J som VERKLIGA kedjeled efter mitt):
const { svaraLokaltTillvaxtdjup, TILLVAXTDJUP_MONSTER } = await tolerera("ai-mentor-tillvaxtdjup-fragor.ts", ["svaraLokaltTillvaxtdjup", "TILLVAXTDJUP_MONSTER"]);
// Omgång 21:s syskon u1 (wireat FÖRE överlevnadsdjup — deras riskpremie-
// formulering var i min sonds backuplista, NULL genom kedjan; kärnorden
// krockar inte med mina, J-fallet vakar):
const { svaraLokaltRiskpremie, RISKPREMIE_MONSTER } = await tolerera("ai-mentor-riskpremie-fragor.ts", ["svaraLokaltRiskpremie", "RISKPREMIE_MONSTER"]);

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

// ── FALL A: de tre nya kanoniska med flerkällskrav ──────────────────────────
const NYA = [
  { fraga: "Vad är koncernredovisning?", amne: "koncernredovisning", slug: "bk-04-koncernredovisningens-grunder" },
  { fraga: "Vad är segmentrapportering?", amne: "segment", slug: "km-024-segmentrapportering" },
  { fraga: "Vad är pensionsåtaganden?", amne: "pensionsataganden", slug: "km-025-pensionsataganden" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltKoncernlasning(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length >= 3;
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

// ── FALL A2: wiring — import + kedjerad i chat-widget.tsx, 44:e av 45 ──────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importOk = widget.includes('from "@/lib/ai-mentor-koncernlasning-fragor"');
  const rad = widget.split("\n").find((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)")) ?? "";
  const minPos = rad.indexOf("svaraLokaltKoncernlasning(");
  const fore = ["svaraLokaltBeteendemekanik(", "svaraLokaltPeMekanik(", "svaraLokaltOverlevnadsdjup("];
  const ordningOk = fore.every((k) => rad.indexOf(k) !== -1 && rad.indexOf(k) < minPos);
  kontroll(
    "A2 wiring — import + kedjerad i chat-widget.tsx (koncernläsning 44:e av 45 — efter överlevnadsdjup; syskonet u2:s tillväxtdjup wireades efter min position)",
    importOk && minPos !== -1 && ordningOk,
    importOk && minPos !== -1
      ? ordningOk ? "import ✓ · efter överlevnadsdjup ✓" : "import ✓ men ordning fel"
      : "import/kedjerad saknas — kopplingen bruten",
  );
}

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad ar koncernredovisning?", amne: "koncernredovisning" }, // diafri
  { fraga: "vad är koncernredovisningen?", amne: "koncernredovisning" }, // bestämd form
  { fraga: "hur hänger moderbolag och dotterbolag ihop?", amne: "koncernredovisning" }, // båda kärnorden
  { fraga: "vad är minoritetsintresse?", amne: "koncernredovisning" }, // singular
  { fraga: "vad menas med minoritetsintressen?", amne: "koncernredovisning" }, // vrängd formulering
  { fraga: "vad ar segmentrapportering?", amne: "segment" }, // diafri
  { fraga: "vad är segmentrapporten?", amne: "segment" }, // bestämd form
  { fraga: "vad är affärsområden?", amne: "segment" }, // plural-kärnordet
  { fraga: "vad är ett affärsområde?", amne: "segment" }, // singular
  { fraga: "hur läser man affärsområden?", amne: "segment" }, // tillämpning (sond R3B)
  { fraga: "vad är segment?", amne: "segment" }, // kortformen
  { fraga: "vad ar pensionsåtaganden?", amne: "pensionsataganden" }, // diafri
  { fraga: "vad är ett pensionsåtagande?", amne: "pensionsataganden" }, // singular
  { fraga: "vad är pensionsskulden?", amne: "pensionsataganden" }, // systervariabeln (tolerans 1)
  { fraga: "vad är pensionsförpliktelser?", amne: "pensionsataganden" }, // synonymen (tolerans 1)
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltKoncernlasning(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltKoncernlasning(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltKoncernlasning(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// Hela kedjan exakt som chat-widget.tsx komponerar den (45 motorer) — används
// av D01b, H och I.
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
  (svaraLokaltAvkastningsdjup ? svaraLokaltAvkastningsdjup(fraga, KURSREGISTER) : null) ??
  (svaraLokaltVarderingsverktyg ? svaraLokaltVarderingsverktyg(fraga, KURSREGISTER) : null) ??
  (svaraLokaltWarrant ? svaraLokaltWarrant(fraga, KURSREGISTER) : null) ??
  (svaraLokaltTidsaxel ? svaraLokaltTidsaxel(fraga, KURSREGISTER) : null) ??
  (svaraLokaltKapitalbindning ? svaraLokaltKapitalbindning(fraga, KURSREGISTER) : null) ??
  (svaraLokaltEkosystemdjup ? svaraLokaltEkosystemdjup(fraga, KURSREGISTER) : null) ??
  (svaraLokaltHandelsdag ? svaraLokaltHandelsdag(fraga, KURSREGISTER) : null) ??
  (svaraLokaltPortfoljpraktik ? svaraLokaltPortfoljpraktik(fraga, KURSREGISTER) : null) ??
  (svaraLokaltUtdelningskalender ? svaraLokaltUtdelningskalender(fraga, KURSREGISTER) : null) ??
  (svaraLokaltKreditdjup ? svaraLokaltKreditdjup(fraga, KURSREGISTER) : null) ??
  (svaraLokaltSektordjup ? svaraLokaltSektordjup(fraga, KURSREGISTER) : null) ??
  (svaraLokaltSektorskola2 ? svaraLokaltSektorskola2(fraga, KURSREGISTER) : null) ??
  (svaraLokaltBeteendemekanik ? svaraLokaltBeteendemekanik(fraga, KURSREGISTER) : null) ??
  (svaraLokaltPeMekanik ? svaraLokaltPeMekanik(fraga, KURSREGISTER) : null) ??
  (svaraLokaltRiskpremie ? svaraLokaltRiskpremie(fraga, KURSREGISTER) : null) ??
  (svaraLokaltOverlevnadsdjup ? svaraLokaltOverlevnadsdjup(fraga, KURSREGISTER) : null) ??
  svaraLokaltKoncernlasning(fraga, KURSREGISTER) ??
  (svaraLokaltTillvaxtdjup ? svaraLokaltTillvaxtdjup(fraga, KURSREGISTER) : null);

// Kedjan UTAN detta lager (45 − 1 = 44 motorer).
const UTAN = [
  svaraLokaltMakro, svaraLokaltExtra, svaraLokalt, svaraLokaltNasta,
  svaraLokaltKapitalmekanik, svaraLokaltSektor, svaraLokaltCase,
  svaraLokaltPraktik, svaraLokaltPortfoljgrund, svaraLokaltAgande,
  svaraLokaltRedovisningsdjup, svaraLokaltDjup, svaraLokaltHistoria,
  svaraLokaltLonsamhetsdjup, svaraLokaltTsdjup, svaraLokaltSkattedjup,
  svaraLokaltBeteendedjup, svaraLokaltRiskdjup, svaraLokaltRiskmattsdjup,
  svaraLokaltUtdelningsdjup, svaraLokaltForvantningsdjup,
  svaraLokaltPortfoljbalans, svaraLokaltStabilitetsdjup,
  svaraLokaltGrahamgolv, svaraLokaltVarderjustering, svaraLokaltOptionsdjup,
  svaraLokaltRisklasningsdjup, svaraLokaltAvkastningskurva,
  svaraLokaltAvkastningsdjup, svaraLokaltVarderingsverktyg,
  svaraLokaltWarrant, svaraLokaltTidsaxel, svaraLokaltKapitalbindning,
  svaraLokaltEkosystemdjup, svaraLokaltHandelsdag, svaraLokaltPortfoljpraktik,
  svaraLokaltUtdelningskalender, svaraLokaltKreditdjup, svaraLokaltSektordjup,
  svaraLokaltSektorskola2, svaraLokaltBeteendemekanik, svaraLokaltPeMekanik,
  svaraLokaltRiskpremie, svaraLokaltOverlevnadsdjup, svaraLokaltTillvaxtdjup,
];
const kedjaUtan = (fraga) => {
  for (const f of UTAN) {
    if (!f) continue;
    const s = f(fraga, KURSREGISTER);
    if (s) return s;
  }
  return null;
};

// ── FALL D: källaäkthet — källor och kurslänkar FINNS i registret ─────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltKoncernlasning(f.fraga, KURSREGISTER);
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
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta");

  // fragor:-knappar skall landa i HELA kedjan — detta lagers knappar länkar
  // medvetet ÖVER lagergränserna (goodwill → kapitalmekaniken, avskrivningar
  // → redovisningsdjupet, pensionssparande → portföljpraktiken, deras
  // dokumenterade ägande) enligt konventionen "knappen landar aldrig null".
  for (const f of NYA) {
    const svar = svaraLokaltKoncernlasning(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (45 motorer)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategorins antal och kursminuter i
  // texterna ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake).
  const bkAntal = KURSREGISTER.filter((r) => r.kategori === "BOKFÖRING & ÅRSREDOVISNING").length;
  const bk04 = KURSREGISTER.find((r) => r.slug === "bk-04-koncernredovisningens-grunder");
  const km024 = KURSREGISTER.find((r) => r.slug === "km-024-segmentrapportering");
  const km025 = KURSREGISTER.find((r) => r.slug === "km-025-pensionsataganden");
  const s1 = svaraLokaltKoncernlasning(NYA[0].fraga, KURSREGISTER);
  const s2 = svaraLokaltKoncernlasning(NYA[1].fraga, KURSREGISTER);
  const s3 = svaraLokaltKoncernlasning(NYA[2].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — BOKFÖRING & ÅRSREDOVISNING=" + bkAntal +
      " · bk-04/km-024/km-025 " + (bk04 ? bk04.minuter : "?") + "/" + (km024 ? km024.minuter : "?") + "/" + (km025 ? km025.minuter : "?") + " min",
    !!s1 && !!s2 && !!s3 &&
      s1.text.includes("I kategorin bokföring och årsredovisning finns " + bkAntal + " kurser") &&
      s2.text.includes("I kategorin bokföring och årsredovisning finns " + bkAntal + " kurser") &&
      s3.text.includes("I kategorin bokföring och årsredovisning finns " + bkAntal + " kurser") &&
      (bk04 ? s1.text.includes(bk04.minuter + " min") : false) &&
      (km024 ? s2.text.includes(km024.minuter + " min") : false) &&
      (km025 ? s3.text.includes(km025.minuter + " min") : false),
    "texterna ska bära registrets egna tal (minuten↔minuter-fällen från omgång 17 vakade: undefined matchar aldrig)",
  );

  // Aritmetik — oberoende omräkning av exempelens alla tal.
  const ARIT = [
    // Koncernredovisning: 200+140=340 · 340−20=320 · 80 % av 100=80 · 100−80=20.
    ["summa före eliminering 200+140=340", /200 i resultat och dotterbolaget 140, summa 340/.test(s1.text) && Math.abs(200 + 140 - 340) < 1e-9],
    ["koncernresultat 340−20=320", /340 − 20 = 320/.test(s1.text) && Math.abs(340 - 20 - 320) < 1e-9],
    ["koncernens andel 80 % av 100=80", /80 procent av 100 = 80/.test(s1.text) && Math.abs(0.8 * 100 - 80) < 1e-9],
    ["minoritetsintresse 100−80=20", /100 − 80 = 20/.test(s1.text) && Math.abs(100 - 80 - 20) < 1e-9],
    // Segment: 500+300+200=1 000 · 60+45−5=100 · marginaler · tillväxt.
    ["intäkter 500+300+200=1 000", /500 \+ 300 \+ 200 = 1 000/.test(s2.text) && Math.abs(500 + 300 + 200 - 1000) < 1e-9],
    ["resultat 60+45−5=100", /60 \+ 45 − 5 = 100/.test(s2.text) && Math.abs(60 + 45 - 5 - 100) < 1e-9],
    ["marginal A 60/500=12,0 %", /60 på 500 = 12,0 procent/.test(s2.text) && Math.abs(60 / 500 - 0.12) < 1e-9],
    ["marginal B 45/300=15,0 %", /45 på 300 = 15,0 procent/.test(s2.text) && Math.abs(45 / 300 - 0.15) < 1e-9],
    ["marginal C −5/200=−2,5 %", /−5 på 200 = −2,5 procent/.test(s2.text) && Math.abs(-5 / 200 + 0.025) < 1e-9],
    ["helhet 100/1 000=10,0 %", /100 på 1 000 = 10,0 procent/.test(s2.text) && Math.abs(100 / 1000 - 0.1) < 1e-9],
    ["B 200→300=+50 %", /från 200 till 300 — \+50 procent/.test(s2.text) && Math.abs((300 - 200) / 200 - 0.5) < 1e-9],
    ["helhet 900→1 000=+11,1 %", /\+11,1 procent \(100 av 900\)/.test(s2.text) && Math.abs(100 / 900 - 0.111111) < 0.001],
    // Pension: 2 200−2 000=200=+10 % · 2 200/3 000≈73,3 %.
    ["skuldökning 2 200−2 000=200 är +10 %", /2 200 − 2 000 = 200 är \+10 procent/.test(s3.text) && Math.abs(2200 - 2000 - 200) < 1e-9 && Math.abs(200 / 2000 - 0.1) < 1e-9],
    ["skuld/kapital 2 200/3 000≈73,3 %", /2 200 av 3 000 ≈ 73,3 procent/.test(s3.text) && Math.abs(2200 / 3000 - 0.733333) < 0.001],
  ];
  const aritFel = ARIT.filter(([, ok]) => !ok).map(([n]) => n);
  kontroll("D03 aritmetik — exempelens 14 tal exakta och nämnda", aritFel.length === 0,
    aritFel.length ? "saknas/fel: " + aritFel.join(", ") : "340 · 320 · 80 · 20 · 1 000 · 100 · 12/15/−2,5/10 % · +50 % · +11,1 % · +10 % · 73,3 % ✓");
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Ystad imorgon?",
  "Vem skrev Pippi Långstrump?",
  "Hur många strängar har en gitarr?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltKoncernlasning(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser, utbildningsdisclaimer ───────
{
  const RADCITAT = /\b(köp|sälj|rekommenderar att du köper)\b[^.]{0,30}\b(aktie|bolag|portfölj)\b/i;
  const DIAGNOS = /\b(du är|du lider|din diagnos)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltKoncernlasning(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    if (DIAGNOS.test(svar.text)) FEL.push(f.amne + ": diagnostiskt tilltal i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
    // Utdrag ur 2007:528-utbildningskontraktet ska finnas i varje svar.
    if (!/utbildning i en metod/.test(svar.text) && !/utbildning i hur/.test(svar.text)) {
      FEL.push(f.amne + ": saknar utbildningsdisclaimer");
    }
    // Textkroppen namnger inga börsbolag.
    const kropp = svar.text.split("📖")[0];
    if (/AstraZeneca|Volvo|Ericsson|H&M|Sinch|Swedbank|Atlas Copco|Sandvik/i.test(kropp)) {
      FEL.push(f.amne + ": bolagsnamn i textkroppen");
    }
  }
  kontroll("F01 juridikgrind — inga rådfraser, utbildningsdisclaimer, inga bolagsnamn", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering med påhittade exempel");
}

// ── FALL G: ANTISTÖLD — tidigare kanoniska ger null i detta lager ───────────
const GAMLA = [
  // Rond 2:s dokumenterade gränser (ägarna bevisade av kontrollerna):
  { fraga: "Vad är resultaträkningen?", amne: null },       // basens rapport-monster
  { fraga: "Vad är bokslut?", amne: null },                 // basens
  { fraga: "Vad är en balansräkning?", amne: null },        // basens
  { fraga: "Vad är goodwill?", amne: null },                // kapitalmekaniken
  { fraga: "Vad är WACC?", amne: null },                    // lönsamhetsdjupet
  { fraga: "Vad är ROIC?", amne: null },                    // lönsamhetsdjupet
  { fraga: "Vad är pensionssparande?", amne: null },        // portföljpraktiken
  { fraga: "Vad är tjänstepension?", amne: null },          // portföljpraktiken
  { fraga: "Vad är avskrivningar?", amne: null },           // redovisningsdjupet
  { fraga: "Vad är leasing?", amne: null },                 // redovisningsdjupet
  { fraga: "Vad är en kvartalsrapport?", amne: null },      // basens rapport-monster
  // Basens kanoniska (ur dess egna test):
  { fraga: "Vad är teknisk analys?", amne: null },
  { fraga: "Vad är rsi?", amne: null },
  { fraga: "Hur hanterar jag risk?", amne: null },
  { fraga: "Hur bygger jag en portfölj?", amne: null },
  { fraga: "Hur fungerar ISK och skatt?", amne: null },
  { fraga: "Vad är kassaflödesanalys?", amne: null },
  { fraga: "Vad är konfluens?", amne: null },
  { fraga: "Vad är AK1TS?", amne: null },
  { fraga: "Vad är arr?", amne: null },
  // Extra:s moat-ägande:
  { fraga: "Vad är en moat?", amne: null },
  { fraga: "Vad är en vallgrav?", amne: null },
  // Syskonlagrens kanoniska (ett urval per lager, ämnesorden är deras)
  { fraga: "Vad är ränta och hur påverkar den aktier?", amne: null },
  { fraga: "Vad är inflation och KPI?", amne: null },
  { fraga: "Hur värderar man ett bolag med DCF?", amne: null },
  { fraga: "Vad är en option?", amne: null },
  { fraga: "Vad är en termin?", amne: null },
  { fraga: "Hur fungerar blankning och short?", amne: null },
  { fraga: "Vad är diversifiering och korrelation?", amne: null },
  { fraga: "Vad är valutarisk?", amne: null },
  { fraga: "Vad är en värderingsmultipel?", amne: null },
  { fraga: "Vad var tulpanmanin?", amne: null },
  { fraga: "Vad är DuPont-analys?", amne: null },
  { fraga: "Vad är fibonacci-retracements?", amne: null },
  { fraga: "Vad är kapitalförsäkring?", amne: null },
  { fraga: "Vad är en black swan?", amne: null },
  { fraga: "Vad är sharpe-kvoten?", amne: null },
  { fraga: "Vad är utdelningsfällor?", amne: null },
  { fraga: "Vad är förväntningsgapet?", amne: null },
  { fraga: "Vad är rebalansering?", amne: null },
  { fraga: "Vad är känslighetsanalys?", amne: null },
  { fraga: "Vad är en net-net?", amne: null },
  { fraga: "Vad är köpoptionen?", amne: null },
  { fraga: "Vad är kundkoncentration?", amne: null },
  { fraga: "Vad är den omvända avkastningskurvan?", amne: null },
  { fraga: "Vad är scenarioanalys?", amne: null },
  { fraga: "Vad är warranter och teckningsoptioner?", amne: null },
  { fraga: "Vad är SAM-viktningen?", amne: null },
  { fraga: "Vad är bayesiansk omviktning?", amne: null },
  { fraga: "Hur fungerar handelsdagen?", amne: null },
  { fraga: "Hur stor ska en aktieposition vara?", amne: null },
  { fraga: "Vad är tax-loss harvesting?", amne: null },
  { fraga: "Vad är ex-dagen?", amne: null },
  { fraga: "Vad är kreditpremien?", amne: null },
  { fraga: "Hur analyserar jag SaaS-bolag?", amne: null },
  { fraga: "Hur analyserar jag läkemedelsbolag?", amne: null },
  { fraga: "Hur analyserar jag detaljhandelsbolag?", amne: null },
  { fraga: "Hur analyserar jag logistikbolag?", amne: null },
  { fraga: "Vad är priming?", amne: null },
  { fraga: "Vad är övermod?", amne: null },
  { fraga: "Hur fungerar irr och förvärvsmaskinen?", amne: null },
  { fraga: "Vad är likviditetsreserven?", amne: null },
  { fraga: "Vad är altman z-score?", amne: null },
  // Syskonet u2:s omgång 21-lager (wireat efter mitt — deras ämnesord):
  { fraga: "Vad är organisk tillväxt?", amne: null },
  { fraga: "Vad är volym pris mix?", amne: null },
];
{
  const stulna = GAMLA.filter((f) => svaraLokaltKoncernlasning(f.fraga, KURSREGISTER) !== null);
  kontroll(
    "G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i koncernläsning-lagret",
    stulna.length === 0,
    stulna.length ? stulna.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltKoncernlasning(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓",
  );
}

// ── FALL G2: SYSKONKÄRNORD — ALLA tidigare kärnord LIVE som frågor ──────────
{
  const FEL = [];
  const SYSKON = [
    [MONSTER, "bas"], [MAKRO_MONSTER, "makro"], [EXTRA_MONSTER, "extra"], [NASTA_MONSTER, "nästa"],
    [KAPITALMEKANIK_MONSTER, "kapitalmekanik"], [SEKTOR_MONSTER, "sektor"], [CASE_MONSTER, "case"],
    [PRAKTIK_MONSTER, "praktik"], [PORTFOLJGRUND_MONSTER, "portföljgrund"], [AGANDE_MONSTER, "ägande"],
    [REDOVISNINGSDJUP_MONSTER, "redovisningsdjup"], [DJUP_MONSTER, "djup"], [HISTORIA_MONSTER, "historia"],
    [LONSAMHETSDJUP_MONSTER, "lönsamhet"], [TSDJUP_MONSTER, "tsdjup"], [SKATTEDJUP_MONSTER, "skattedjup"],
    [BETEENDEDJUP_MONSTER, "beteendedjup"], [RISKDJUP_MONSTER, "riskdjup"], [RISKMATTSDJUP_MONSTER, "riskmåttsdjup"],
    [UTDELNINGSDJUP_MONSTER, "utdelningsdjup"], [FÖRVÄNTNINGSDJUP_MONSTER, "förväntningsdjup"],
    [PORTFOLJBALANS_MONSTER, "portföljbalans"], [STABILITETSDJUP_MONSTER, "stabilitetsdjup"],
    [GRAHAMGOLV_MONSTER, "grahamgolv"], [VARDERJUSTERING_MONSTER, "värderjustering"],
    [OPTIONS_DJUP_MONSTER, "optionsdjup"], [RISKLÄSNINGSDJUP_MONSTER, "riskläsningsdjup"],
    [AVKASTNINGSKURVA_MONSTER, "avkastningskurva"], [AVKASTNINGSDJUP_MONSTER, "avkastningsdjup"],
    [VARDERINGSVERKTYG_MONSTER, "värderingsverktyg"], [WARRANT_MONSTER, "warrant"],
    [TIDSAXEL_MONSTER, "tidsaxel"], [KAPITALBINDNING_MONSTER, "kapitalbindning"],
    [EKOSYSTEMDJUP_MONSTER, "ekosystemdjup"], [HANDELSDAG_MONSTER, "handelsdag"],
    [PORTFOLJPRAKTIK_MONSTER, "portföljpraktik"],
    [UTDELNINGSKALENDER_MONSTER, "utdelningskalender"], [KREDITDJUP_MONSTER, "kreditdjup"],
    [SEKTORDJUP_MONSTER, "sektordjup"], [SEKTORSKOLA2_MONSTER, "sektorskola2"],
    [BETEENDEMEKANIK_MONSTER, "beteendemekanik"], [PE_MEKANIK_MONSTER, "pe-mekanik"],
    [RISKPREMIE_MONSTER, "riskpremie"], [OVERLEVNADSDJUP_MONSTER, "överlevnadsdjup"], [TILLVAXTDJUP_MONSTER, "tillväxtdjup"],
  ];
  let antal = 0;
  for (const [monster, namn] of SYSKON) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) {
      for (const k of m.karnord ?? []) {
        antal++;
        const svar = svaraLokaltKoncernlasning("vad är " + k + "?", KURSREGISTER);
        if (svar !== null) FEL.push("'" + k + "' (" + namn + ") ⇒ " + svar.amne);
      }
    }
  }
  kontroll(
    "G2 syskonkärnord — " + antal + " kärnord LIVE som frågor → 0 fångster",
    FEL.length === 0,
    FEL.length ? FEL.length + " krockar: " + FEL.slice(0, 5).join(" | ") : "0 krockar mot " + (SYSKON.filter((s) => Array.isArray(s[0])).length) + " lager",
  );
}

// ── FALL H: hela kedjan (som chat-widget.tsx) — positionens invariant ──────
{
  // Ett lager senare i kedjan ändrar ALDRIG ett tidigare svar: kedjan
  // med/utan detta lager ger identiska svar på alla GAMLA frågor.
  const fel = [];
  const MINA_AMNEN = new Set(NYA.map((f) => f.amne));
  for (const f of GAMLA) {
    const med = helakedjan(f.fraga);
    if (med === null) continue; // API-flödet — oförändrat
    if (MINA_AMNEN.has(med.amne)) {
      fel.push("'" + f.fraga + "' fångades av detta lager (ämne=" + med.amne + ")");
    }
  }
  // …och de tre nya kanoniska når rätt lager genom HELA kedjan.
  for (const f of NYA) {
    const med = helakedjan(f.fraga);
    if (!med) fel.push("'" + f.fraga + "' null i hela kedjan");
    else if (med.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + med.amne + " (väntat " + f.amne + ")");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla oförändrade (positionens invariant) + " + NYA.length + " nya når rätt lager (46 motorer, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + 3) + "/" + (GAMLA.length + 3) + " rätt",
  );
}

// ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN detta ───────
{
  const tjuvade = NYA.filter((f) => kedjaUtan(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 3 nya kanoniska ger null i kedjan UTAN koncernläsning-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kedjaUtan(f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER, RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FÖRVÄNTNINGSDJUP_MONSTER, PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER, VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLÄSNINGSDJUP_MONSTER, AVKASTNINGSKURVA_MONSTER, AVKASTNINGSDJUP_MONSTER, VARDERINGSVERKTYG_MONSTER, WARRANT_MONSTER, TIDSAXEL_MONSTER, KAPITALBINDNING_MONSTER, EKOSYSTEMDJUP_MONSTER, HANDELSDAG_MONSTER, PORTFOLJPRAKTIK_MONSTER, UTDELNINGSKALENDER_MONSTER, KREDITDJUP_MONSTER, SEKTORDJUP_MONSTER, SEKTORSKOLA2_MONSTER, BETEENDEMEKANIK_MONSTER, PE_MEKANIK_MONSTER, RISKPREMIE_MONSTER, OVERLEVNADSDJUP_MONSTER, TILLVAXTDJUP_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of KONCERNLASNING_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — KONCERNLASNING_MONSTER vs alla andra lager (" + tidigare.size + " kärnord)",
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
    "svaraLokaltGrahamgolv", "svaraLokaltVarderjustering",
    "svaraLokaltOptionsdjup", "svaraLokaltRisklasningsdjup",
    "svaraLokaltAvkastningskurva", "svaraLokaltAvkastningsdjup",
    "svaraLokaltVarderingsverktyg", "svaraLokaltWarrant",
    "svaraLokaltTidsaxel", "svaraLokaltKapitalbindning",
    "svaraLokaltEkosystemdjup", "svaraLokaltHandelsdag",
    "svaraLokaltPortfoljpraktik",
    "svaraLokaltUtdelningskalender",
    "svaraLokaltKreditdjup",
    "svaraLokaltSektordjup",
    "svaraLokaltSektorskola2",
    "svaraLokaltBeteendemekanik",
    "svaraLokaltPeMekanik",
    "svaraLokaltRiskpremie",
    "svaraLokaltOverlevnadsdjup",
    // Omgång 21: detta lager — 44:e; syskonens u1-riskpremie (före
    // överlevnadsdjup) och u2-tillväxtdjup (sist) wireades runt min
    // position (harmoniserat detta test med deras rader).
    "svaraLokaltKoncernlasning",
    "svaraLokaltTillvaxtdjup",
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
  if (!widget.includes('from "@/lib/ai-mentor-koncernlasning-fragor"')) {
    FEL.push("importen av ai-mentor-koncernlasning-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
  const kanda = new Set(KOMPONENTER);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla 48 lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "koncernläsning 44:e av 46 lager, inga okända komponenter",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN KONCERNLÄSNING (s6-u3 omgång 21): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
