/**
 * TESTA AI-MENTORN — ÖVERLEVNADSDJUP-LAGRET (spår 6 omgång 20, s6-u2), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-overlevnadsdjup.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers två monsters (likviditetsreserven, konkursprognos):
 *   A  kanoniska   — 2 frågor: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), M1 5 källor / M2 4 källor), ≥3
 *                    registeräkta kurslänkar
 *   A2 wiring     — importen + kedjeraden i chat-widget.tsx bär detta lager
 *                    EFTER pe-mekanik (SIST av 43)
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (43 motorer;
 *                    däribland "vad är känslighetsanalys?" → stabilitetsdjupet
 *                    och systerknappen altman/likviditetsreserv)
 *   D02 register   — kategoriantal + kursminuter i texterna ur registret
 *   D03 aritmetik  — exempelens 19 tal oberoende omräknade + nämnda i text
 *   E  genomström  — omatchade frågor → null (API-flödet)
 *   F  juridik     — inga köp/sälj-rådfraser (lagen 2007:528 — utbildning);
 *                    gränsvärden som läsverktyg, inga bolagsomdömen
 *   G  antistöld   — tidigare kanoniska → null i detta lager (däribland
 *                    grannägandena: basens "vad är likviditet?"/"vad är
 *                    kvick?", kapitalbindningens "vad är rörelsekapital?",
 *                    tidsaxelns "vad är refinansieringsmuren?", riskdjupets
 *                    covenants, stabilitetsdjupets "vad är känslighetsanalys?"
 *                    och "vad är stresstest?", basens "vad är z poäng?" —
 *                    sondens dokumenterade gränser)
 *   G2 syskonkärnord — ALLA tidigare lagers kärnord LIVE som frågor → 0
 *   H  kedja       — SIST-lager-invarianten: gamla svar bitidentiska
 *                    med/utan detta lager + ämneskontroller + nya rätt
 *   I  omkastad    — de 2 nya kanoniska → null i kedjan UTAN detta lager
 *   J  disjunktion — kärnorden överlappar inget tidigare lagers (mekaniskt)
 *   L  widget-synk — kedjeraden i chat-widget.tsx bär alla 43 kända lager
 *                    i ordning + import + inga okända komponenter
 *
 * Syskonimporter är TOLERANTA (syskon kan skriva just nu): samtliga 42
 * tidigare lager importeras med fallback null.
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — inga placeringstips, inga
 * omdömen om enskilda börsbolag. Altman är en forskare (Edward Altman),
 * aldrig ett bolagsomdöme; exemplens bolag är kursens påhittade
 * övningsbolag med kursernas egna tal.
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-overlevnadsdjup.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltOverlevnadsdjup, OVERLEVNADSDJUP_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-overlevnadsdjup-fragor.ts")).href);

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

// ── FALL A: de 2 nya kanoniska med flerkällskrav ────────────────────────────
const NYA = [
  {
    fraga: "Vad är likviditetsreserven?",
    amne: "likviditetsreserv",
    slug: "st-06-likviditetsreserven",
    kallorMin: 5,
  },
  {
    fraga: "Vad är Altman Z-score?",
    amne: "konkursprognos",
    slug: "st-03-altman-z-score",
    kallorMin: 4,
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltOverlevnadsdjup(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length >= f.kallorMin;
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

// ── FALL A2: wiring — import + kedjerad i chat-widget.tsx, SIST av 43 ───────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importOk = widget.includes('from "@/lib/ai-mentor-overlevnadsdjup-fragor"');
  const rad = widget.split("\n").find((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)")) ?? "";
  const minPos = rad.indexOf("svaraLokaltOverlevnadsdjup(");
  const fore = ["svaraLokaltSektordjup(", "svaraLokaltSektorskola2(", "svaraLokaltBeteendemekanik(", "svaraLokaltPeMekanik("];
  const ordningOk = fore.every((k) => rad.indexOf(k) !== -1 && rad.indexOf(k) < minPos);
  kontroll(
    "A2 wiring — import + kedjerad i chat-widget.tsx (överlevnadsdjup SIST av 43, efter omgång 20:s syskonlager)",
    importOk && minPos !== -1 && ordningOk,
    importOk && minPos !== -1
      ? ordningOk ? "import ✓ · SIST efter pe-mekanik ✓" : "import ✓ men ordning fel"
      : "import/kedjerad saknas — kopplingen bruten",
  );
}

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad ar likviditetsreserven?", amne: "likviditetsreserv" }, // diafri
  { fraga: "vad är en likviditetsreserv?", amne: "likviditetsreserv" }, // grundformen
  { fraga: "vad är likviditetsreserver?", amne: "likviditetsreserv" }, // plural
  { fraga: "vad är likviditetsbufferten?", amne: "likviditetsreserv" }, // syskonmåttet
  { fraga: "vad är överlevnadstiden?", amne: "likviditetsreserv" }, // bestämmandet
  { fraga: "vad är kassaräckvidden?", amne: "likviditetsreserv" }, // måttet
  { fraga: "hur länge räcker kassan?", amne: "likviditetsreserv" }, // vardagsfrasen
  { fraga: "vad ar altman z-score?", amne: "konkursprognos" }, // diafri
  { fraga: "vad är altman z poängen?", amne: "konkursprognos" }, // vardagsformen
  { fraga: "vad är zscore?", amne: "konkursprognos" }, // sammanhängande
  { fraga: "vad är z-score?", amne: "konkursprognos" }, // kortformen
  { fraga: "vad är konkursprognosen?", amne: "konkursprognos" }, // bestämmandet
  { fraga: "vad är konkursrisken?", amne: "konkursprognos" }, // riskformen
  { fraga: "vad är konkurs?", amne: "konkursprognos" }, // grundordet (NULL före lagret)
  { fraga: "hur förutsäger man konkurs?", amne: "konkursprognos" }, // handlingsfrågan
  { fraga: "vad är konkursrisk hos bolag?", amne: "konkursprognos" }, // med starkord
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltOverlevnadsdjup(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltOverlevnadsdjup(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltOverlevnadsdjup(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// Hela kedjan exakt som chat-widget.tsx komponerar den (43 motorer) — används
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
  svaraLokaltOverlevnadsdjup(fraga, KURSREGISTER);

// Kedjan UTAN detta lager (SIST-lager kan bara läggas sist — 42 motorer):
// samma ordning som helakedjan fast utan sista ledet.
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
    const svar = svaraLokaltOverlevnadsdjup(f.fraga, KURSREGISTER);
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
  // medvetet ÖVER lagergränserna (känslighetsanalys → stabilitetsdjupet,
  // systerknappen altman/likviditetsreserv → detta lagrets andra monster)
  // enligt konventionen "knappen landar aldrig null".
  for (const f of NYA) {
    const svar = svaraLokaltOverlevnadsdjup(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (43 motorer)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategorins antal och kursminuter i
  // texterna ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake till 426).
  const stAntal = KURSREGISTER.filter((r) => r.kategori === "STABILITET").length;
  const st06 = KURSREGISTER.find((r) => r.slug === "st-06-likviditetsreserven");
  const st03 = KURSREGISTER.find((r) => r.slug === "st-03-altman-z-score");
  const s1 = svaraLokaltOverlevnadsdjup(NYA[0].fraga, KURSREGISTER);
  const s2 = svaraLokaltOverlevnadsdjup(NYA[1].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — STABILITET=" + stAntal + " · st-06/st-03 " + (st06 ? st06.minuter : "?") + "/" + (st03 ? st03.minuter : "?") + " min",
    !!s1 && !!s2 &&
      s1.text.includes("I stabilitetskategorin finns " + stAntal + " kurser") &&
      s2.text.includes("I stabilitetskategorin finns " + stAntal + " kurser") &&
      (st06 ? s1.text.includes(st06.minuter + " min") : false) &&
      (st03 ? s2.text.includes(st03.minuter + " min") : false),
    "texterna ska bära registrets egna tal (minuter — omgång 17:s minuten↔minuter-fälla vakad: undefined matchar aldrig)",
  );

  // Aritmetik — oberoende omräkning av exempelens alla tal. Kurserna
  // redovisar på EN DECIMAL: 260,0 × 0,794 = 206,44 → 206,4 ·
  // 1 676,4 ÷ 210,0 = 7,983 → 8,0 · 95,0 ÷ 80,0 = 1,1875 → 1,2 —
  // toleransen 0,05 dokumenterar kursens egen avrundning (resten exakta).
  const ARIT = [
    // Likviditetsreserven: 260,0×0,794=206,4(avrundat) · 840,0+630,0=1 470,0 ·
    // 1 470,0+206,4=1 676,4 · 1 470,0÷210,0=7,0 · 1 676,4÷210,0=8,0(avrundat) ·
    // 210,0×3=630,0 · 95,0÷80,0=1,2(avrundat).
    ["obeskattat netto 260,0×0,794=206,4", /260,0 × 0,794 = 206,4 miljoner/.test(s1.text) && Math.abs(260.0 * 0.794 - 206.44) < 1e-9 && Math.abs(206.44 - 206.4) < 0.05],
    ["smal reserv 840,0+630,0=1 470,0", /840,0 \+ 630,0 = 1 470,0 Mkr/.test(s1.text) && Math.abs(840.0 + 630.0 - 1470.0) < 1e-9],
    ["bred reserv 1 470,0+206,4=1 676,4", /1 470,0 \+ 206,4 = 1 676,4 Mkr/.test(s1.text) && Math.abs(1470.0 + 206.4 - 1676.4) < 1e-9],
    ["smal överlevnadstid 1 470,0÷210,0=7,0", /1 470,0 ÷ 210,0 = 7,0 månader/.test(s1.text) && Math.abs(1470.0 / 210.0 - 7.0) < 1e-9],
    ["bred överlevnadstid 1 676,4÷210,0=8,0", /1 676,4 ÷ 210,0 = 8,0 månader/.test(s1.text) && Math.abs(1676.4 / 210.0 - 8.0) < 0.05],
    ["kvartalsmåttet 210,0×3=630,0", /210,0 × 3 = 630,0/.test(s1.text) && Math.abs(210.0 * 3 - 630.0) < 1e-9],
    ["spegelbolaget 95,0÷80,0=1,2", /95,0 ÷ 80,0 = 1,2 månader/.test(s1.text) && Math.abs(95.0 / 80.0 - 1.2) < 0.05],
    // Altman: 400+350−250=500 · 500÷2 000=0,25 · 360÷2 000=0,18 ·
    // 130÷2 000=0,065 · 1 600÷2 000=0,80 · 2 300÷2 000=1,15 ·
    // 1,2×0,25=0,300 · 1,4×0,18=0,252 · 3,3×0,065=0,2145 · 0,6×0,80=0,480 ·
    // 1,0×1,15=1,150 · summan 2,3965.
    ["rörelsekapital 400+350−250=500", /kundfordringar 400 \+ lager 350 − leverantörsskulder 250 = 500/.test(s2.text) && Math.abs(400 + 350 - 250 - 500) < 1e-9],
    ["X1 500÷2 000=0,25", /500 ÷ 2 000 = 0,25/.test(s2.text) && Math.abs(500 / 2000 - 0.25) < 1e-9],
    ["X2 360÷2 000=0,18", /360 ⇒ X2 = 0,18/.test(s2.text) && Math.abs(360 / 2000 - 0.18) < 1e-9],
    ["X3 130÷2 000=0,065", /130 ⇒ X3 = 0,065/.test(s2.text) && Math.abs(130 / 2000 - 0.065) < 1e-9],
    ["X4 1 600÷2 000=0,80", /1 600 mot räntebärande skuld 2 000 ⇒ X4 = 0,80/.test(s2.text) && Math.abs(1600 / 2000 - 0.8) < 1e-9],
    ["X5 2 300⇒1,15", /X5 = 1,15/.test(s2.text) && Math.abs(2300 / 2000 - 1.15) < 1e-9],
    ["vikt 1,2×0,25=0,300", /1,2 × 0,25 = 0,300/.test(s2.text) && Math.abs(1.2 * 0.25 - 0.3) < 1e-9],
    ["vikt 1,4×0,18=0,252", /1,4 × 0,18 = 0,252/.test(s2.text) && Math.abs(1.4 * 0.18 - 0.252) < 1e-9],
    ["vikt 3,3×0,065=0,2145", /3,3 × 0,065 = 0,2145/.test(s2.text) && Math.abs(3.3 * 0.065 - 0.2145) < 1e-9],
    ["vikt 0,6×0,80=0,480", /0,6 × 0,80 = 0,480/.test(s2.text) && Math.abs(0.6 * 0.8 - 0.48) < 1e-9],
    ["vikt 1,0×1,15=1,150", /1,0 × 1,15 = 1,150/.test(s2.text) && Math.abs(1.0 * 1.15 - 1.15) < 1e-9],
    ["summan 0,300+0,252+0,2145+0,480+1,150=2,3965", /0,300 \+ 0,252 \+ 0,2145 \+ 0,480 \+ 1,150 = 2,3965/.test(s2.text) && Math.abs(0.3 + 0.252 + 0.2145 + 0.48 + 1.15 - 2.3965) < 1e-9],
    ["avrundat 2,40", /avrundat 2,40/.test(s2.text) && Math.abs(2.3965 - 2.4) < 0.005],
  ];
  const aritFel = ARIT.filter(([, ok]) => !ok).map(([n]) => n);
  kontroll("D03 aritmetik — exempelens 20 tal exakta och nämnda", aritFel.length === 0,
    aritFel.length ? "saknas/fel: " + aritFel.join(", ") : "206,4 · 1 470,0 · 1 676,4 · 7,0 · 8,0 · 630,0 · 1,2 · 500 · 0,25 · 0,18 · 0,065 · 0,80 · 1,15 · 0,300 · 0,252 · 0,2145 · 0,480 · 1,150 · 2,3965 · 2,40 ✓");
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Ystad imorgon?",
  "Vem skrev Pippi Långstrump?",
  "Hur många strängar har en gitarr?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltOverlevnadsdjup(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper|undvik att köpa|håll dig borta från)\b/i;
  const RAD2 = /\b(undvik|välj|byt till|teckna|satsa på)\b[^.]{0,40}\b(bolag|aktie|portfölj)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltOverlevnadsdjup(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    if (RAD2.test(svar.text)) FEL.push(f.amne + ": rådfras (rad 2) i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
    // Utdrag ur 2007:528-utbildningskontraktet ska finnas i varje svar.
    if (!/utbildning i en metod/.test(svar.text) && !/utbildning i hur/.test(svar.text)) {
      FEL.push(f.amne + ": saknar utbildningsdisclaimer");
    }
    // Textkroppen (före källraden) namnger inga börsbolag — exemplens
    // bolag är kursens påhittade övningsbolag.
    const kropp = svar.text.split("📖")[0];
    if (/AstraZeneca|Volvo|Ericsson|H&M|IKEA|Sinch|SSAB|Saab|Atlas Copco/i.test(kropp)) {
      FEL.push(f.amne + ": bolagsnamn i textkroppen");
    }
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser, utbildningsdisclaimer, inga bolagsomdömen i kroppen", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL G: ANTISTÖLD — tidigare kanoniska ger null i detta lager ───────────
const GAMLA = [
  // Sondens dokumenterade grannäganden — får ALDRIG stjälas hit:
  { fraga: "Vad är likviditet?", amne: null }, // basens aktiemarknads-monster
  { fraga: "Vad är kvick?", amne: null }, // basens V11-uppslag (v11 här källa)
  { fraga: "Vad är z poäng?", amne: null }, // basens quiz-xp
  { fraga: "Vad är känslighetsanalys?", amne: null }, // stabilitetsdjupet
  { fraga: "Vad är stresstest?", amne: null }, // stabilitetsdjupet
  { fraga: "Vad är soliditetsgrad?", amne: null }, // stabilitetsdjupet
  { fraga: "Vad är balansstyrka?", amne: null }, // stabilitetsdjupet
  { fraga: "Vad är rörelsekapital?", amne: null }, // kapitalbindningen
  { fraga: "Vad är kassakonverteringscykeln?", amne: null }, // kapitalbindningen
  { fraga: "Vad är lageromsättning?", amne: null }, // kapitalbindningen
  { fraga: "Vad är refinansieringsmuren?", amne: null }, // tidsaxeln
  { fraga: "Vad är konjunkturindikatorer?", amne: null }, // tidsaxeln
  { fraga: "Vad är kreditrating?", amne: null }, // kreditdjupet (min button-motfråga)
  { fraga: "Vad är kreditpremien?", amne: null }, // kreditdjupet
  { fraga: "Vad är hävstång?", amne: null }, // basens kapitalstruktur
  { fraga: "Vad är skuldsättningsgrad?", amne: null }, // v10:s ägare
  // Basens kanoniska (ur dess egna test):
  { fraga: "Vad är teknisk analys?", amne: null },
  { fraga: "Vad är rsi?", amne: null },
  { fraga: "Hur hanterar jag risk?", amne: null },
  { fraga: "Hur bygger jag en portfölj?", amne: null },
  { fraga: "Hur fungerar ISK och skatt?", amne: null },
  { fraga: "Vad är kassaflödesanalys?", amne: null },
  { fraga: "Vad är konfluens?", amne: null },
  { fraga: "Vad är AK1TS?", amne: null },
  // Syskonlagrens kanoniska (ett urval per lager, ämnesorden är deras)
  { fraga: "Vad är ränta och hur påverkar den aktier?", amne: null },
  { fraga: "Vad är inflation och KPI?", amne: null },
  { fraga: "Vad är en option?", amne: null },
  { fraga: "Hur fungerar blankning och short?", amne: null },
  { fraga: "Vad är diversifiering och korrelation?", amne: null },
  { fraga: "Vad är avskrivningar?", amne: null },
  { fraga: "Vad är en värderingsmultipel?", amne: null },
  { fraga: "Vad var tulpanmanin?", amne: null },
  { fraga: "Vad är DuPont-analys?", amne: null },
  { fraga: "Vad är sharpe-kvoten?", amne: null },
  { fraga: "Vad är utdelningsfällor?", amne: null },
  { fraga: "Vad är en net-net?", amne: null },
  { fraga: "Vad är normalisering?", amne: null },
  { fraga: "Vad är warranter och teckningsoptioner?", amne: null },
  { fraga: "Vad är SAM-viktningen?", amne: null },
  { fraga: "Hur fungerar handelsdagen?", amne: null },
  { fraga: "Vad är ex-dagen?", amne: null },
  { fraga: "Hur analyserar jag SaaS-bolag?", amne: null },
  { fraga: "Hur analyserar jag läkemedelsbolag?", amne: null },
  // Omgång 20:s syskonlager (trefönstret) — deras ämnen:
  { fraga: "Vad är priming?", amne: null }, // beteendemekanik (u3)
  { fraga: "Vad är övermod?", amne: null }, // beteendemekanik (u3)
  { fraga: "Vad är tillgänglighetsfällan?", amne: null }, // beteendemekanik (u3)
  { fraga: "Vad är internräntan?", amne: null }, // pe-mekanik (u1)
  { fraga: "Vad är lbo?", amne: null }, // pe-mekanik (u1)
  { fraga: "Vad är utfasningar?", amne: null }, // pe-mekanik (u1)
];
{
  const stulna = GAMLA.filter((f) => svaraLokaltOverlevnadsdjup(f.fraga, KURSREGISTER) !== null);
  kontroll(
    "G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i överlevnadsdjup-lagret",
    stulna.length === 0,
    stulna.length ? stulna.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltOverlevnadsdjup(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓",
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
  ];
  let antal = 0;
  for (const [monster, namn] of SYSKON) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) {
      for (const k of m.karnord ?? []) {
        antal++;
        const svar = svaraLokaltOverlevnadsdjup("vad är " + k + "?", KURSREGISTER);
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

// ── FALL H: hela kedjan (som chat-widget.tsx) — SIST-lager-invarianten ──────
{
  // Ett SIST-lager ändrar ALDRIG ett tidigare svar: kedjan med/utan detta
  // lager ger identiska svar på alla GAMLA frågor.
  const fel = [];
  for (const f of GAMLA) {
    const med = helakedjan(f.fraga);
    if (med === null) continue; // API-flödet — oförändrat
    if (med.amne === "likviditetsreserv" || med.amne === "konkursprognos") {
      fel.push("'" + f.fraga + "' fångades av SIST-lagret (ämne=" + med.amne + ")");
    }
  }
  // …och de två nya kanoniska når rätt lager genom HELA kedjan.
  for (const f of NYA) {
    const med = helakedjan(f.fraga);
    if (!med) fel.push("'" + f.fraga + "' null i hela kedjan");
    else if (med.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + med.amne + " (väntat " + f.amne + ")");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla oförändrade (SIST-invarianten) + " + NYA.length + " nya når rätt lager (43 motorer, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + 2) + "/" + (GAMLA.length + 2) + " rätt",
  );
}

// ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN detta ───────
{
  const tjuvade = NYA.filter((f) => kedjaUtan(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 2 nya kanoniska ger null i kedjan UTAN överlevnadsdjup-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kedjaUtan(f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER, RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FÖRVÄNTNINGSDJUP_MONSTER, PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER, VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLÄSNINGSDJUP_MONSTER, AVKASTNINGSKURVA_MONSTER, AVKASTNINGSDJUP_MONSTER, VARDERINGSVERKTYG_MONSTER, WARRANT_MONSTER, TIDSAXEL_MONSTER, KAPITALBINDNING_MONSTER, EKOSYSTEMDJUP_MONSTER, HANDELSDAG_MONSTER, PORTFOLJPRAKTIK_MONSTER, UTDELNINGSKALENDER_MONSTER, KREDITDJUP_MONSTER, SEKTORDJUP_MONSTER, SEKTORSKOLA2_MONSTER, BETEENDEMEKANIK_MONSTER, PE_MEKANIK_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of OVERLEVNADSDJUP_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — OVERLEVNADSDJUP_MONSTER vs alla tidigare lager (" + tidigare.size + " kärnord)",
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
    // Omgång 20:s trefönster: syskonens lager + detta lager.
    "svaraLokaltBeteendemekanik",
    "svaraLokaltPeMekanik",
    "svaraLokaltRiskpremie", "svaraLokaltOverlevnadsdjup", "svaraLokaltKoncernlasning", "svaraLokaltTillvaxtdjup",
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
  if (!widget.includes('from "@/lib/ai-mentor-overlevnadsdjup-fragor"')) {
    FEL.push("importen av ai-mentor-overlevnadsdjup-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
  const kanda = new Set(KOMPONENTER);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla 46 lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "överlevnadsdjup sist av 43 lager, inga okända komponenter",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN ÖVERLEVNADSDJUP (s6-u2 omgång 20): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
