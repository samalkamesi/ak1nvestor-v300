/**
 * TESTA AI-MENTORN — SEKTORSKOLA 2-LAGRET (spår 6 omgång 19, s6-u3), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-sektorskola2.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers tre monsters (läkemedel, detaljhandel, logistik):
 *   A  kanoniska   — 3 frågor: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), ≥3 källor), ≥3 registeräkta kurslänkar
 *   A2 wiring     — importen + kedjeraden i chat-widget.tsx bär detta lager
 *                    EFTER sektordjup (SIST av 40)
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (40 motorer;
 *                    däribland "vad är en moat?" → extra och "vad är
 *                    lageromsättning?" → kapitalbindningen, deras
 *                    dokumenterade ägande)
 *   D02 register   — kategoriantal + kursminuter i texterna ur registret
 *   D03 aritmetik  — exempelens 11 tal oberoende omräknade + nämnda i text
 *   E  genomström  — omatchade frågor → null (API-flödet)
 *   F  juridik     — inga köp/sälj-rådfraser (lagen 2007:528 — utbildning);
 *                    inga bolagsomdömen i textkroppen (AstraZeneca endast
 *                    i källradens kurstitel)
 *   G  antistöld   — tidigare kanoniska → null i detta lager (däribland
 *                    extra:s "vad är en moat?" och "vad är en vallgrav?" —
 *                    rond 2:s dödade kandidat — samt e-handelskontrollen
 *                    som justerade kärnordsfamiljen)
 *   G2 syskonkärnord — ALLA tidigare lagers kärnord LIVE som frågor → 0
 *   H  kedja       — SIST-lager-invarianten: gamla svar bitidentiska
 *                    med/utan detta lager + ämneskontroller + nya rätt
 *   I  omkastad    — de 3 nya kanoniska → null i kedjan UTAN detta lager
 *   J  disjunktion — kärnorden överlappar inget tidigare lagers (mekaniskt)
 *   L  widget-synk — kedjeraden i chat-widget.tsx bär alla 40 kända lager
 *                    i ordning + import + inga okända komponenter
 *
 * Syskonimporter är TOLERANTA (syskon kan skriva just nu): samtliga 39
 * tidigare lager importeras med fallback null.
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — inga placeringstips, inga
 * omdömen om enskilda börsbolag. Case-kursens titel (AstraZeneca) får
 * bäras som KÄLLMÄRKE men textkroppens exempel talar om "ett
 * läkemedelsbolag" med påhittade tal.
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-sektorskola2.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltSektorskola2, SEKTORSKOLA2_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-sektorskola2-fragor.ts")).href);

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
  {
    fraga: "Hur analyserar jag läkemedelsbolag?",
    amne: "lakemedel",
    slug: "km-039-pharmasektorn",
  },
  {
    fraga: "Hur analyserar jag detaljhandelsbolag?",
    amne: "detaljhandel",
    slug: "se-07-detailhandel",
  },
  {
    fraga: "Hur analyserar jag logistikbolag?",
    amne: "logistik",
    slug: "se-04-logistiksektorn",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltSektorskola2(f.fraga, KURSREGISTER);
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

// ── FALL A2: wiring — import + kedjerad i chat-widget.tsx, SIST av 40 ───────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importOk = widget.includes('from "@/lib/ai-mentor-sektorskola2-fragor"');
  const rad = widget.split("\n").find((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)")) ?? "";
  const minPos = rad.indexOf("svaraLokaltSektorskola2(");
  const fore = ["svaraLokaltUtdelningskalender(", "svaraLokaltKreditdjup(", "svaraLokaltSektordjup("];
  const ordningOk = fore.every((k) => rad.indexOf(k) !== -1 && rad.indexOf(k) < minPos);
  kontroll(
    "A2 wiring — import + kedjerad i chat-widget.tsx (sektorskola2 SIST av 40, efter omgång 18:s tre lager)",
    importOk && minPos !== -1 && ordningOk,
    importOk && minPos !== -1
      ? ordningOk ? "import ✓ · SIST efter sektordjup ✓" : "import ✓ men ordning fel"
      : "import/kedjerad saknas — kopplingen bruten",
  );
}

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad ar lakemedelsbolag?", amne: "lakemedel" }, // diafri
  { fraga: "vad är ett pharmabolag?", amne: "lakemedel" }, // grundformen
  { fraga: "hur ser läkemedelsbranschen ut?", amne: "lakemedel" }, // branschformen
  { fraga: "vad är patentbranten?", amne: "lakemedel" }, // kärnordet
  { fraga: "vad är patentutlöpning?", amne: "lakemedel" }, // kärnordet
  { fraga: "vad är en pipeline?", amne: "lakemedel" }, // kärnordet
  { fraga: "berätta om blockbusters ekonomi?", amne: "lakemedel" }, // vardagsordet
  { fraga: "vad är detaljhandel?", amne: "detaljhandel" }, // diafri
  { fraga: "vad är ett detaljhandelsbolag?", amne: "detaljhandel" }, // grundformen
  { fraga: "hur går det för detaljhandelsaktier?", amne: "detaljhandel" }, // instrumentformen
  { fraga: "vad menas med like-for-like?", amne: "detaljhandel" }, // måttet
  { fraga: "vad är jämförbar försäljning?", amne: "detaljhandel" }, // svenska paret
  { fraga: "vad är butiksomsättning?", amne: "detaljhandel" }, // måttet
  { fraga: "vad ar logistik?", amne: "logistik" }, // diafri
  { fraga: "vad är ett logistikbolag?", amne: "logistik" }, // grundformen
  { fraga: "hur ser logistikbranschen ut?", amne: "logistik" }, // branschformen
  { fraga: "vad är godstransport?", amne: "logistik" }, // måttet
  { fraga: "vad är last mile?", amne: "logistik" }, // frasformen
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltSektorskola2(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltSektorskola2(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltSektorskola2(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// Hela kedjan exakt som chat-widget.tsx komponerar den (40 motorer) — används
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
  svaraLokaltSektorskola2(fraga, KURSREGISTER);

// Kedjan UTAN detta lager (SIST-lager kan bara läggas sist — 39 motorer):
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
    const svar = svaraLokaltSektorskola2(f.fraga, KURSREGISTER);
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
  // medvetet ÖVER lagergränserna (moat → extra, lageromsättning/
  // kassakonverteringscykeln → kapitalbindningen, deras dokumenterade
  // ägande) enligt konventionen "knappen landar aldrig null".
  for (const f of NYA) {
    const svar = svaraLokaltSektorskola2(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (40 motorer)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategorins antal och kursminuter i
  // texterna ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake).
  const seAntal = KURSREGISTER.filter((r) => r.kategori === "SEKTORANALYS").length;
  const pcAntal = KURSREGISTER.filter((r) => r.kategori === "PRAKTISKA CASE").length;
  const km039 = KURSREGISTER.find((r) => r.slug === "km-039-pharmasektorn");
  const se07 = KURSREGISTER.find((r) => r.slug === "se-07-detailhandel");
  const se04 = KURSREGISTER.find((r) => r.slug === "se-04-logistiksektorn");
  const s1 = svaraLokaltSektorskola2(NYA[0].fraga, KURSREGISTER);
  const s2 = svaraLokaltSektorskola2(NYA[1].fraga, KURSREGISTER);
  const s3 = svaraLokaltSektorskola2(NYA[2].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — SEKTOR=" + seAntal + " · CASE=" + pcAntal +
      " · km-039/se-07/se-04 " + (km039 ? km039.minuter : "?") + "/" + (se07 ? se07.minuter : "?") + "/" + (se04 ? se04.minuter : "?") + " min",
    !!s1 && !!s2 && !!s3 &&
      s1.text.includes("I sektorn analys-kategorin finns " + seAntal + " kurser och i praktiska case " + pcAntal) &&
      s2.text.includes("I sektorn analys-kategorin finns " + seAntal + " kurser") &&
      s3.text.includes("I sektorn analys-kategorin finns " + seAntal + " kurser") &&
      (km039 ? s1.text.includes(km039.minuter + " min") : false) &&
      (se07 ? s2.text.includes(se07.minuter + " min") : false) &&
      (se04 ? s3.text.includes(se04.minuter + " min") : false),
    "texterna ska bära registrets egna tal (minuter — omgång 17:s minuten↔minuter-fälla vakad: undefined matchar aldrig)",
  );

  // Aritmetik — oberoende omräkning av exempelens alla tal.
  const ARIT = [
    // Läkemedel: 8/20=40 % · 8×0,9=7,2 · 5×0,6=3 · 0,5×2 000=1 000.
    ["andel 8÷20=40 %", /8 ÷ 20 = 40 procent/.test(s1.text) && Math.abs(8 / 20 - 0.4) < 1e-9],
    ["generika 8×0,9=7,2", /8 × 0,9 = 7,2 miljarder/.test(s1.text) && Math.abs(8 * 0.9 - 7.2) < 1e-9],
    ["fas III 5×0,6=3", /fem kandidater i fas III × 60 procent = 3/.test(s1.text) && Math.abs(5 * 0.6 - 3) < 1e-9],
    ["riskjusterat 0,5×2 000=1 000", /0,5 × 2 000 = 1 000 Mkr/.test(s1.text) && Math.abs(0.5 * 2000 - 1000) < 1e-9],
    // Detaljhandel: 6+9−3=12 · 100−60=40 · 40−12−18=10.
    ["LFL 6+9−3=12", /6 \+ 9 − 3 = 12/.test(s2.text) && Math.abs(6 + 9 - 3 - 12) < 1e-9],
    ["brutto 100−60=40", /100 − 60 = 40 procent/.test(s2.text) && Math.abs(100 - 60 - 40) < 1e-9],
    ["trappan 40−12−18=10", /40 − 12 − 18 = 10 procent/.test(s2.text) && Math.abs(40 - 12 - 18 - 10) < 1e-9],
    // Logistik: (8−5)/8=37,5 · 1 000/8=125 · 1 000/2 500=0,4 · 4/10=40 %.
    ["paketkostnad (8−5)÷8=37,5 %", /\(8 − 5\) ÷ 8 = 37,5 procent/.test(s3.text) && Math.abs((8 - 5) / 8 - 0.375) < 1e-9],
    ["avskrivning 1 000÷8=125", /1 000 ÷ 8 = 125 Mkr/.test(s3.text) && Math.abs(1000 / 8 - 125) < 1e-9],
    ["kapitaltäthet 1 000÷2 500=0,4", /1 000 ÷ 2 500 = 0,4/.test(s3.text) && Math.abs(1000 / 2500 - 0.4) < 1e-9],
    ["lastmile 4 av 10=40 %", /4 av 10 kronor per paket = 40 procent/.test(s3.text) && Math.abs(4 / 10 - 0.4) < 1e-9],
  ];
  const aritFel = ARIT.filter(([, ok]) => !ok).map(([n]) => n);
  kontroll("D03 aritmetik — exempelens 11 tal exakta och nämnda", aritFel.length === 0,
    aritFel.length ? "saknas/fel: " + aritFel.join(", ") : "40 % · 7,2 · 3 · 1 000 · 12 · 40 · 10 · 37,5 % · 125 · 0,4 · 40 % ✓");
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Ystad imorgon?",
  "Vem skrev Pippi Långstrump?",
  "Hur många strängar har en gitarr?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltSektorskola2(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const SEKTORRAD = /\b(välj|byt till|teckna|satsa på)\b[^.]{0,40}\b(sektor|bolag|aktie|bransch)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltSektorskola2(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    if (SEKTORRAD.test(svar.text)) FEL.push(f.amne + ": sektor-rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
    // Utdrag ur 2007:528-utbildningskontraktet ska finnas i varje sektorsvar.
    if (!/utbildning i en metod/.test(svar.text) && !/utbildning i hur/.test(svar.text)) {
      FEL.push(f.amne + ": saknar utbildningsdisclaimer");
    }
    // Textkroppen (före källraden) namnger inga börsbolag — case-kursens
    // titel (AstraZeneca) får endast bäras i källmärket.
    const kropp = svar.text.split("📖")[0];
    if (/AstraZeneca|Volvo|Ericsson|H&M|IKEA|Postnord|Sinch/i.test(kropp)) {
      FEL.push(f.amne + ": bolagsnamn i textkroppen");
    }
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser, utbildningsdisclaimer, inga bolagsomdömen i kroppen", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL G: ANTISTÖLD — tidigare kanoniska ger null i detta lager ───────────
const GAMLA = [
  // Extra:s moat-ägande — rond 2:s dödade kandidat, nu vaktad i båda riktningar:
  { fraga: "Vad är en moat?", amne: null },
  { fraga: "Vad är en vallgrav?", amne: null },
  { fraga: "Vad är konkurrenskraft?", amne: null },
  { fraga: "Vad är konkurrensfördel?", amne: null },
  // E-handelskontrollen som justerade kärnordsfamiljen (stärkord, ej kärnord):
  { fraga: "Vad är e-handel?", amne: null },
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
  // Sektormotorns kanoniska — GRANNLAGRET:
  { fraga: "Vad är en sektor?", amne: null },
  { fraga: "Hur gör jag en sektoranalys?", amne: null },
  { fraga: "Hur analyserar jag banker?", amne: null },
  { fraga: "Hur analyserar jag fastighetsbolag?", amne: null },
  // Kapitalbindningens och tidsaxelns äganden (knapparnas mål):
  { fraga: "Vad är lageromsättning?", amne: null },
  { fraga: "Vad är kassakonverteringscykeln?", amne: null },
  { fraga: "Vad är rörelsekapital?", amne: null },
  { fraga: "Vad är orderstock?", amne: null },
  { fraga: "Vad är backlog?", amne: null },
  // Syskonlagrens kanoniska (ett urval per lager, ämnesorden är deras)
  { fraga: "Vad är ränta och hur påverkar den aktier?", amne: null },
  { fraga: "Vad är inflation och KPI?", amne: null },
  { fraga: "Hur värderar man ett bolag med DCF?", amne: null },
  { fraga: "Vad är en option?", amne: null },
  { fraga: "Hur fungerar blankning och short?", amne: null },
  { fraga: "Vad är diversifiering och korrelation?", amne: null },
  { fraga: "Vad är valutarisk?", amne: null },
  { fraga: "Vad är avskrivningar?", amne: null },
  { fraga: "Vad är en värderingsmultipel?", amne: null },
  { fraga: "Vad var tulpanmanin?", amne: null },
  { fraga: "Vad är DuPont-analys?", amne: null },
  { fraga: "Vad är fibonacci-retracements?", amne: null },
  { fraga: "Vad är kapitalförsäkring?", amne: null },
  { fraga: "Vad är bekräftelsefällan?", amne: null },
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
  { fraga: "Hur fungerar handelsdagen?", amne: null },
  { fraga: "Hur stor ska en aktieposition vara?", amne: null },
  { fraga: "Vad är pensionssparande?", amne: null },
  // Omgång 18:s lager:
  { fraga: "Vad är ex-dagen?", amne: null },
  { fraga: "Vad är kreditpremien?", amne: null },
  { fraga: "Hur analyserar jag SaaS-bolag?", amne: null },
  { fraga: "Hur analyserar jag halvledarbolag?", amne: null },
  { fraga: "Hur analyserar jag försvarsbolag?", amne: null },
  { fraga: "Vad är churn?", amne: null },
];
{
  const stulna = GAMLA.filter((f) => svaraLokaltSektorskola2(f.fraga, KURSREGISTER) !== null);
  kontroll(
    "G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i sektorskola 2-lagret",
    stulna.length === 0,
    stulna.length ? stulna.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltSektorskola2(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓",
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
    [SEKTORDJUP_MONSTER, "sektordjup"],
  ];
  let antal = 0;
  for (const [monster, namn] of SYSKON) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) {
      for (const k of m.karnord ?? []) {
        antal++;
        const svar = svaraLokaltSektorskola2("vad är " + k + "?", KURSREGISTER);
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
    if (med.amne === "lakemedel" || med.amne === "detaljhandel" || med.amne === "logistik") {
      fel.push("'" + f.fraga + "' fångades av SIST-lagret (ämne=" + med.amne + ")");
    }
  }
  // …och de tre nya kanoniska når rätt lager genom HELA kedjan.
  for (const f of NYA) {
    const med = helakedjan(f.fraga);
    if (!med) fel.push("'" + f.fraga + "' null i hela kedjan");
    else if (med.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + med.amne + " (väntat " + f.amne + ")");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla oförändrade (SIST-invarianten) + " + NYA.length + " nya når rätt lager (40 motorer, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + 3) + "/" + (GAMLA.length + 3) + " rätt",
  );
}

// ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN detta ───────
{
  const tjuvade = NYA.filter((f) => kedjaUtan(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 3 nya kanoniska ger null i kedjan UTAN sektorskola 2-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kedjaUtan(f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER, RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FÖRVÄNTNINGSDJUP_MONSTER, PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER, VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLÄSNINGSDJUP_MONSTER, AVKASTNINGSKURVA_MONSTER, AVKASTNINGSDJUP_MONSTER, VARDERINGSVERKTYG_MONSTER, WARRANT_MONSTER, TIDSAXEL_MONSTER, KAPITALBINDNING_MONSTER, EKOSYSTEMDJUP_MONSTER, HANDELSDAG_MONSTER, PORTFOLJPRAKTIK_MONSTER, UTDELNINGSKALENDER_MONSTER, KREDITDJUP_MONSTER, SEKTORDJUP_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of SEKTORSKOLA2_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — SEKTORSKOLA2_MONSTER vs alla tidigare lager (" + tidigare.size + " kärnord)",
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
    // Omgång 18:s lager (u1 + u2 + u3):
    "svaraLokaltUtdelningskalender",
    "svaraLokaltKreditdjup",
    "svaraLokaltSektordjup",
    // Omgång 19: detta lager — SIST av 40 vid leverans; omgång 20:s tre
    // lager (beteendemekanik + pe-mekanik + överlevnadsdjup) wireades
    // efter det (svitharmoniseringens dokumentationsplikt).
    "svaraLokaltSektorskola2",
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
      "svaraLokaltPengarstid",
  // V219-harmonisering (rond 114): pengarstid wireades i widgeten utan svitharmonisering
  // (föregångare: 54e7a59e studio: auto s6-u2 AI-MENTORN +2 FÖRHANDSFRÅGOR — PENGARNAS TID OCH ORD) — mellan optionshantverk och marknadsrytm.
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
  if (!widget.includes('from "@/lib/ai-mentor-sektorskola2-fragor"')) {
    FEL.push("importen av ai-mentor-sektorskola2-fragor saknas");
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
    FEL.length ? FEL.join(" | ") : "sektorskola2 sist av 40 lager, inga okända komponenter",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN SEKTORSKOLA 2 (s6-u3 omgång 19): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
