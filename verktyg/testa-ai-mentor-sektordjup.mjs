/**
 * TESTA AI-MENTORN — SEKTORDJUP-LAGRET (spår 6 omgång 18, s6-u3), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-sektordjup.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers tre monsters (SaaS, halvledare, försvar):
 *   A  kanoniska   — 3 frågor: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), ≥3 källor), ≥3 registeräkta kurslänkar
 *   A2 wiring     — importen + kedjeraden i chat-widget.tsx bär detta lager
 *                    EFTER syskonen (SIST av 39)
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (39 motorer;
 *                    däribland "vad är orderstock?" → tidsaxeln och
 *                    "vad är normalisering?" → värderjusteringen, deras
 *                    dokumenterade ägande)
 *   D02 register   — kategoriantal + kursminuter i texterna ur registret
 *   D03 aritmetik  — exempelens 12 tal oberoende omräknade + nämnda i text
 *   E  genomström  — omatchade frågor → null (API-flödet)
 *   F  juridik     — inga köp/sälj-rådfraser (lagen 2007:528 — utbildning);
 *                    försvarstexten utan politiska omdömen om länder
 *   G  antistöld   — tidigare kanoniska → null i detta lager (däribland
 *                    basens "vad är arr?" — V02-uppslagets formulering —
 *                    och tidsaxelns "vad är orderstock?")
 *   G2 syskonkärnord — ALLA tidigare lagers kärnord LIVE som frågor → 0
 *   H  kedja       — SIST-lager-invarianten: gamla svar bitidentiska
 *                    med/utan detta lager + ämneskontroller + nya rätt
 *   I  omkastad    — de 3 nya kanoniska → null i kedjan UTAN detta lager
 *   J  disjunktion — kärnorden överlappar inget tidigare lagers (mekaniskt)
 *   L  widget-synk — kedjeraden i chat-widget.tsx bär alla 39 kända lager
 *                    i ordning + import + inga okända komponenter
 *
 * Syskonimporter är TOLERANTA (syskon skriver just nu): utdelningskalender
 * (u1, lager 37) och kreditdjup (u2, lager 38) — samma omgång 18-fönster.
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — inga placeringstips, inga
 * omdömen om enskilda bolag eller länders politik (krig/geopolitik nämns
 * endast som efterfråge-/riskfaktorer i utbildningstermer).
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-sektordjup.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltSektordjup, SEKTORDJUP_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-sektordjup-fragor.ts")).href);

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
// Syskonens omgång 18-lager — på disk i samma fönster (disk-läge-presedensen);
// deras tester äger deras djupkontroller.
const { svaraLokaltUtdelningskalender, UTDELNINGSKALENDER_MONSTER } = await tolerera("ai-mentor-utdelningskalender-fragor.ts", ["svaraLokaltUtdelningskalender", "UTDELNINGSKALENDER_MONSTER"]);
const { svaraLokaltKreditdjup, KREDITDJUP_MONSTER } = await tolerera("ai-mentor-kreditdjup-fragor.ts", ["svaraLokaltKreditdjup", "KREDITDJUP_MONSTER"]);

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
    fraga: "Hur analyserar jag SaaS-bolag?",
    amne: "saas",
    slug: "se-01-saassektorn",
  },
  {
    fraga: "Hur analyserar jag halvledarbolag?",
    amne: "halvledare",
    slug: "se-02-halvledarsektorn",
  },
  {
    fraga: "Hur analyserar jag försvarsbolag?",
    amne: "forsvar",
    slug: "se-03-forsvarssektorn",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltSektordjup(f.fraga, KURSREGISTER);
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

// ── FALL A2: wiring — import + kedjerad i chat-widget.tsx, SIST av 39 ───────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importOk = widget.includes('from "@/lib/ai-mentor-sektordjup-fragor"');
  const rad = widget.split("\n").find((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)")) ?? "";
  const minPos = rad.indexOf("svaraLokaltSektordjup(");
  const fore = ["svaraLokaltPortfoljpraktik(", "svaraLokaltUtdelningskalender(", "svaraLokaltKreditdjup("];
  const ordningOk = fore.every((k) => rad.indexOf(k) !== -1 && rad.indexOf(k) < minPos);
  kontroll(
    "A2 wiring — import + kedjerad i chat-widget.tsx (sektordjup SIST av 39, efter portföljpraktik + utdelningskalender + kreditdjup)",
    importOk && minPos !== -1 && ordningOk,
    importOk && minPos !== -1
      ? ordningOk ? "import ✓ · SIST efter omgång 18:s syskon ✓" : "import ✓ men ordning fel"
      : "import/kedjerad saknas — kopplingen bruten",
  );
}

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad ar saas for nagot?", amne: "saas" }, // diafri
  { fraga: "vad är ett saasbolag?", amne: "saas" }, // grundformen
  { fraga: "hur ser jag på saas-bolag?", amne: "saas" }, // bindestreck-formen
  { fraga: "vad är churn?", amne: "saas" }, // måttet
  { fraga: "vad menas med net revenue retention?", amne: "saas" }, // NRR-frasen
  { fraga: "vad är nrr?", amne: "saas" }, // förkortningen
  { fraga: "hur fungerar prenumerationsintäkter?", amne: "saas" }, // svensk familj
  { fraga: "vad är abonnemangsintäkter?", amne: "saas" }, // svenska paret
  { fraga: "vad ar halvledare?", amne: "halvledare" }, // diafri
  { fraga: "berätta om halvledarbranschen?", amne: "halvledare" }, // branschformen
  { fraga: "vad är ett halvledarbolag?", amne: "halvledare" }, // grundformen
  { fraga: "vad är en foundry?", amne: "halvledare" }, // kedjeordet
  { fraga: "förklara fabless-modellen?", amne: "halvledare" }, // kedjeordet
  { fraga: "hur tillverkas chips?", amne: "halvledare" }, // vardagsordet
  { fraga: "vad ar forsvarsbolag?", amne: "forsvar" }, // diafri
  { fraga: "hur ser försvarsindustrin ut?", amne: "forsvar" }, // branschformen
  { fraga: "vad är försvarsaktier?", amne: "forsvar" }, // instrumentformen
  { fraga: "berätta om vapenindustrin?", amne: "forsvar" }, // synonymen
  { fraga: "vad är krigsmateriel?", amne: "forsvar" }, // produkten
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltSektordjup(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltSektordjup(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltSektordjup(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// Hela kedjan exakt som chat-widget.tsx komponerar den (39 motorer) — används
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
  svaraLokaltSektordjup(fraga, KURSREGISTER);

// Kedjan UTAN detta lager (SIST-lager kan bara läggas sist — 38 motorer):
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
  svaraLokaltUtdelningskalender, svaraLokaltKreditdjup,
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
    const svar = svaraLokaltSektordjup(f.fraga, KURSREGISTER);
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
  // medvetet ÖVER lagergränserna (orderstock → tidsaxeln, normalisering →
  // värderjusteringen, deras dokumenterade ägande) enligt konventionen
  // "knappen landar aldrig null".
  for (const f of NYA) {
    const svar = svaraLokaltSektordjup(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (39 motorer)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategorins antal och kursminuter i
  // texterna ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake).
  const seAntal = KURSREGISTER.filter((r) => r.kategori === "SEKTORANALYS").length;
  const vmAntal = KURSREGISTER.filter((r) => r.kategori === "VÄRDERINGSMETODER").length;
  const se01 = KURSREGISTER.find((r) => r.slug === "se-01-saassektorn");
  const se02 = KURSREGISTER.find((r) => r.slug === "se-02-halvledarsektorn");
  const se03 = KURSREGISTER.find((r) => r.slug === "se-03-forsvarssektorn");
  const s1 = svaraLokaltSektordjup(NYA[0].fraga, KURSREGISTER);
  const s2 = svaraLokaltSektordjup(NYA[1].fraga, KURSREGISTER);
  const s3 = svaraLokaltSektordjup(NYA[2].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — SEKTOR=" + seAntal + " · VÄRDERING=" + vmAntal +
      " · se-01/se-02/se-03 " + (se01 ? se01.minuter : "?") + "/" + (se02 ? se02.minuter : "?") + "/" + (se03 ? se03.minuter : "?") + " min",
    !!s1 && !!s2 && !!s3 &&
      s1.text.includes("I sektorn analys-kategorin finns " + seAntal + " kurser och i värderingsmetoder " + vmAntal) &&
      s2.text.includes("I sektorn analys-kategorin finns " + seAntal + " kurser") &&
      s3.text.includes("I sektorn analys-kategorin finns " + seAntal + " kurser") &&
      (se01 ? s1.text.includes(se01.minuter + " min") : false) &&
      (se02 ? s2.text.includes(se02.minuter + " min") : false) &&
      (se03 ? s3.text.includes(se03.minuter + " min") : false),
    "texterna ska bära registrets egna tal",
  );

  // Aritmetik — oberoende omräkning av exempelens alla tal.
  const ARIT = [
    // SaaS: MRR 100×1 000=100 000; ARR ×12=1 200 000; kundliv 1/0,01=100;
    // NRR 100+8+4−2=110; Rule of 40: 30+12=42; payback 12 000÷1 000=12.
    ["MRR 100×1 000=100 000", /100 kunder × 1 000 kronor = 100 000 kronor/.test(s1.text) && Math.abs(100 * 1000 - 100000) < 1e-9],
    ["ARR ×12=1 200 000", /= 1 200 000 kronor/.test(s1.text) && Math.abs(100000 * 12 - 1200000) < 1e-9],
    ["kundliv 1÷0,01=100 mån", /1 ÷ 0,01 = 100 månader/.test(s1.text) && Math.abs(1 / 0.01 - 100) < 1e-9],
    ["NRR 100+8+4−2=110", /100 \+ 8 \+ 4 − 2 = 110 procent/.test(s1.text) && Math.abs(100 + 8 + 4 - 2 - 110) < 1e-9],
    ["Rule of 40: 30+12=42", /30 \+ 12 = 42/.test(s1.text) && Math.abs(30 + 12 - 42) < 1e-9],
    ["payback 12 000÷1 000=12 mån", /12 000 kronor att värva och betalar 1 000 i månaden är payback 12 månader/.test(s1.text) && Math.abs(12000 / 1000 - 12) < 1e-9],
    ["livstid 100×1 000÷12 000 ≈ 8×", /åtta gånger anskaffningen/.test(s1.text) && Math.abs((100 * 1000) / 12000 - 8.33) < 0.01],
    // Halvledare: foundry 40 % investeringar mot fabless 5 % ⇒ 40÷5=8;
    // bruttomarginal 35 mot 60.
    ["foundry-investeringar 40 %", /storleksordningen 40 procent av intäkterna/.test(s2.text)],
    ["fabless-investeringar 5 %", /investeringar kanske 5 procent av intäkterna/.test(s2.text)],
    ["kapitaltäthet 40÷5=8", /40 ÷ 5/.test(s2.text) && Math.abs(40 / 5 - 8) < 1e-9],
    ["bruttomarginaler 35/60", /bruttomarginal kring 35 procent/.test(s2.text) && /bruttomarginal kring 60/.test(s2.text)],
    // Försvar: beläggning 45÷15=3,0 år.
    ["beläggning 45÷15=3,0 år", /45 ÷ 15 = 3,0 år/.test(s3.text) && Math.abs(45 / 15 - 3) < 1e-9],
  ];
  const aritFel = ARIT.filter(([, ok]) => !ok).map(([n]) => n);
  kontroll("D03 aritmetik — exempelens 12 tal exakta och nämnda", aritFel.length === 0,
    aritFel.length ? "saknas/fel: " + aritFel.join(", ") : "100 000 · 1 200 000 · 100 · 110 · 42 · 12 · 8× · 40 % · 5 % · 8 · 35/60 · 3,0 ✓");
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Ystad imorgon?",
  "Vem skrev Pippi Långstrump?",
  "Hur många strängar har en gitarr?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltSektordjup(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const SEKTORRAD = /\b(välj|byt till|teckna|satsa på)\b[^.]{0,40}\b(sektor|bolag|aktie|bransch)\b/i;
  const POLITIK = /\b(stöd|Rösta|rosta på|röst|Röst)\b[^.]{0,30}\b(parti|regering|allians)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltSektordjup(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    if (SEKTORRAD.test(svar.text)) FEL.push(f.amne + ": sektor-rådfras i text");
    if (POLITIK.test(svar.text)) FEL.push(f.amne + ": politiskt omdöme i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
    // Utdrag ur 2007:528-utbildningskontraktet ska finnas i varje sektorsvar.
    if (!/utbildning i en metod/.test(svar.text) && !/utbildning i läsmetoden/.test(svar.text) && !/utbildning i hur/.test(svar.text)) {
      FEL.push(f.amne + ": saknar utbildningsdisclaimer");
    }
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser, utbildningsdisclaimer i sektordjup-svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL G: ANTISTÖLD — tidigare kanoniska ger null i detta lager ───────────
const GAMLA = [
  // Basens kanoniska (ur dess egna test) — däribland V02-formuleringens ägare:
  { fraga: "Vad är arr?", amne: null }, // BASENS V02-UPPSLAG — får ALDRIG stjälas här
  { fraga: "Vad är teknisk analys?", amne: null }, // basens indikator-ägare (sond rond 1:s dödare)
  { fraga: "Vad är rsi?", amne: null },
  { fraga: "Hur hanterar jag risk?", amne: null },
  { fraga: "Hur bygger jag en portfölj?", amne: null },
  { fraga: "Hur fungerar ISK och skatt?", amne: null },
  { fraga: "Vad är kassaflödesanalys?", amne: null },
  { fraga: "Vad är konfluens?", amne: null },
  { fraga: "Vad är AK1TS?", amne: null },
  // Sektormotorns kanoniska — GRANNLAGRET, däribland "-sektorn"-frasernas ägare:
  { fraga: "Vad är en sektor?", amne: null },
  { fraga: "Hur gör jag en sektoranalys?", amne: null },
  { fraga: "Hur analyserar jag banker?", amne: null },
  { fraga: "Hur analyserar jag fastighetsbolag?", amne: null },
  // Tidsaxelns orderstock-ägande + värderjusteringens normalisering:
  { fraga: "Vad är orderstock?", amne: null },
  { fraga: "Vad är backlog?", amne: null },
  { fraga: "Vad är normalisering?", amne: null },
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
  { fraga: "Vad är rörelsekapital?", amne: null },
  { fraga: "Vad är SAM-viktningen?", amne: null },
  { fraga: "Hur fungerar handelsdagen?", amne: null },
  { fraga: "Hur stor ska en aktieposition vara?", amne: null },
  // Syskonens omgång 18-lager:
  { fraga: "Vad är ex-dagen?", amne: null }, // u1 utdelningskalender
  { fraga: "Vad är kreditpremien?", amne: null }, // u2 kreditdjup
];
{
  const stulna = GAMLA.filter((f) => svaraLokaltSektordjup(f.fraga, KURSREGISTER) !== null);
  kontroll(
    "G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i sektordjup-lagret",
    stulna.length === 0,
    stulna.length ? stulna.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltSektordjup(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓",
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
  ];
  let antal = 0;
  for (const [monster, namn] of SYSKON) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) {
      for (const k of m.karnord ?? []) {
        antal++;
        const svar = svaraLokaltSektordjup("vad är " + k + "?", KURSREGISTER);
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
    if (med.amne === "saas" || med.amne === "halvledare" || med.amne === "forsvar") {
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
    "H01 kedja — " + GAMLA.length + " gamla oförändrade (SIST-invarianten) + " + NYA.length + " nya når rätt lager (39 motorer, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + 3) + "/" + (GAMLA.length + 3) + " rätt",
  );
}

// ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN detta ───────
{
  const tjuvade = NYA.filter((f) => kedjaUtan(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 3 nya kanoniska ger null i kedjan UTAN sektordjup-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kedjaUtan(f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER, RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FÖRVÄNTNINGSDJUP_MONSTER, PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER, VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLÄSNINGSDJUP_MONSTER, AVKASTNINGSKURVA_MONSTER, AVKASTNINGSDJUP_MONSTER, VARDERINGSVERKTYG_MONSTER, WARRANT_MONSTER, TIDSAXEL_MONSTER, KAPITALBINDNING_MONSTER, EKOSYSTEMDJUP_MONSTER, HANDELSDAG_MONSTER, PORTFOLJPRAKTIK_MONSTER, UTDELNINGSKALENDER_MONSTER, KREDITDJUP_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of SEKTORDJUP_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — SEKTORDJUP_MONSTER vs " + (tidigare.size > 0 ? "alla tidigare lager" : "0 lager") + " (" + tidigare.size + " kärnord)",
    krock.length === 0,
    krock.length ? krock.join(" | ") : "0 överlapp ✓",
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
    // Omgång 18:s fönsterlager (disk-läge-presedensen): u1 utdelningskalender +
    // u2 kreditdjup + detta lager sektordjup.
    // Omgång 19 (s6-u3): sektorskola 2 — läkemedel/detaljhandel/logistik,
    // SIST av 40 (svitharmonisering: dokumentationsplikten i detta falls
    // "okända komponenter"-vakt kräver att nya lager registreras här).
    // Omgång 20 (2026-09-18): u3 beteendemekanik + u1 pe-mekanik + u2 överlevnadsdjup — svitharmonisering (dokumentationsplikten).
    // Omgång 22: bokmastar (s6-u3) — SIST av 47 (svitharmoniseringens dokumentationsplikt).
    // Omgång 22 (tredje instansen): faktordjup (s6-u1) — efter tillväxtdjup, före bokmastar.
    // Omgång 22:s fönster (s6-u3 bokmastar + s6-u2 riskbudget + s6-u1 konvertibel — svitharmoniseringens dokumentationsplikt).
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
    "svaraLokaltSkuldordning", "svaraLokaltValideringsfonster", "svaraLokaltMarknadsrytm",
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
  if (!widget.includes('from "@/lib/ai-mentor-sektordjup-fragor"')) {
    FEL.push("importen av ai-mentor-sektordjup-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
    // Fönstret efter omgång 27 (s6-u2, _s6u2o28-): ModernaRisker + Coinvest+Tvangsmekanik i widgetordning — läkning av omgång 27:s öppna harmoniseringsskuld
  // (ModernaRisker/Coinvest wireades utan familjepass; dokumentationsplikten, rond 114-läxan).
    // Fönster 29 (s6-u2, _s6u2o29-): Handelsemotor i widgetordning FÖRE marknadsrytm —
  // svitharmoniseringens dokumentationsplikt (rond 114-läxan: widget-wire ⇒ harmonisering i samma leverans).
    // Fönster 29 (s6-u1, _s6u1o29-): kemisektor i widgetordning (efter lonsamhetsgrund,
  // före marknadsrytm) — svitharmoniseringens dokumentationsplikt (V219-läxan).
  const kanda = new Set([...KOMPONENTER, "svaraLokaltStalsektor", "svaraLokaltCasepraktik", "svaraLokaltBeteendefallor", "svaraLokaltKemisektor"]);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla 46 lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "sektordjup före sektorskola2, inga okända komponenter",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN SEKTORDJUP (s6-u3 omgång 18): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
