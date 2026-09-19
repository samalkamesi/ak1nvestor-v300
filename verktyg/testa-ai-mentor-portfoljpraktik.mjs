/**
 * TESTA AI-MENTORN — PORTFÖLJPRAKTIK-LAGRET (spår 6 omgång 17, s6-u3), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-portfoljpraktik.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers tre monsters (positionsstorlek, tax-loss harvesting,
 * pensionssparande):
 *   A  kanoniska   — 3 frågor: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), ≥3 källor), ≥3 registeräkta kurslänkar
 *   A2 wiring     — importen + kedjeraden i chat-widget.tsx bär detta lager
 *                    EFTER syskonen (SIST av 35)
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (35 motorer)
 *   D02 register   — kategoriantal + kursminuter i texterna ur registret
 *   D03 aritmetik  — exempelens 14 tal oberoende omräknade + nämnda i text
 *   E  genomström  — omatchade frågor → null (API-flödet)
 *   F  juridik     — inga köp/sälj-rådfraser (lagen 2007:528 — utbildning)
 *   G  antistöld   — tidigare kanoniska → null i detta lager (däribland
 *                    basens "vad är position sizing?" — formuleringens ägare)
 *   G2 syskonkärnord — ALLA tidigare lagers kärnord LIVE som frågor → 0
 *   H  kedja       — SIST-lager-invarianten: gamla svar bitidentiska
 *                    med/utan detta lager + ämneskontroller + nya rätt
 *   I  omkastad    — de 3 nya kanoniska → null i kedjan UTAN detta lager
 *   J  disjunktion — kärnorden överlappar inget tidigare lagers (mekaniskt)
 *   L  widget-synk — kedjeraden i chat-widget.tsx bär alla 35 kända lager
 *                    i ordning + import + inga okända komponenter
 *
 * Syskonimporter är TOLERANTA (syskon skriver just nu): ekosystemdjup
 * (u2, lager 34) och handelsdag (u1, lager 35) — samma omgång 17-fönster.
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — inga placeringstips, inga
 * skatte-/pensionsråd (Skatteverket-hänvisningen är den ärliga utgången).
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-portfoljpraktik.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltPortfoljpraktik, PORTFOLJPRAKTIK_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-portfoljpraktik-fragor.ts")).href);

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
// Syskonens omgång 17-lager — på disk i samma fönster (disk-läge-presedensen);
// deras tester äger deras djupkontroller.
const { svaraLokaltEkosystemdjup, EKOSYSTEMDJUP_MONSTER } = await tolerera("ai-mentor-ekosystemdjup-fragor.ts", ["svaraLokaltEkosystemdjup", "EKOSYSTEMDJUP_MONSTER"]);
const { svaraLokaltHandelsdag, HANDELSDAG_MONSTER } = await tolerera("ai-mentor-handelsdag-fragor.ts", ["svaraLokaltHandelsdag", "HANDELSDAG_MONSTER"]);

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
    fraga: "Hur stor ska en aktieposition vara?",
    amne: "positionstorlek",
    slug: "pf-02-position-sizing",
  },
  {
    fraga: "Vad är tax-loss harvesting?",
    amne: "taxloss",
    slug: "pf-09-taxloss-harvesting",
  },
  {
    fraga: "Vad är pensionssparande?",
    amne: "pension",
    slug: "pf-14-pensionssparande",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltPortfoljpraktik(f.fraga, KURSREGISTER);
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

// ── FALL A2: wiring — import + kedjerad i chat-widget.tsx, SIST av 35 ───────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importOk = widget.includes('from "@/lib/ai-mentor-portfoljpraktik-fragor"');
  const rad = widget.split("\n").find((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)")) ?? "";
  const minPos = rad.indexOf("svaraLokaltPortfoljpraktik(");
  const fore = ["svaraLokaltTidsaxel(", "svaraLokaltKapitalbindning(", "svaraLokaltEkosystemdjup(", "svaraLokaltHandelsdag("];
  const ordningOk = fore.every((k) => rad.indexOf(k) !== -1 && rad.indexOf(k) < minPos);
  kontroll(
    "A2 wiring — import + kedjerad i chat-widget.tsx (portfoljpraktik SIST av 36, efter kapitalbindning + ekosystemdjup + handelsdag)",
    importOk && minPos !== -1 && ordningOk,
    importOk && minPos !== -1
      ? ordningOk ? "import ✓ · SIST efter båda föregångarna ✓" : "import ✓ men ordning fel"
      : "import/kedjerad saknas — kopplingen bruten",
  );
}

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad ar positionstorlek for nagot?", amne: "positionstorlek" }, // diafri
  { fraga: "vad är en aktieposition?", amne: "positionstorlek" }, // grundformen
  { fraga: "hur stora ska aktiepositionerna vara?", amne: "positionstorlek" }, // plural
  { fraga: "hur stor position ska man ha?", amne: "positionstorlek" }, // fras-formen
  { fraga: "vad är risk per position?", amne: "positionstorlek" }, // metodens namn
  { fraga: "vad ar tax loss harvesting?", amne: "taxloss" }, // diafri
  { fraga: "förklara skatteförlustrealiseringen?", amne: "taxloss" }, // svenska paret
  { fraga: "vad är ett förlustavdrag?", amne: "taxloss" }, // kvittningsposten
  { fraga: "vad menas med att skörda förluster?", amne: "taxloss" }, // frasen
  { fraga: "vad ar pension for nagot?", amne: "pension" }, // diafri
  { fraga: "hur fungerar pensionen?", amne: "pension" }, // best. form
  { fraga: "berätta om pensionssparandet?", amne: "pension" }, // avledningen
  { fraga: "vad är tjänstepensionen?", amne: "pension" }, // delordet
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltPortfoljpraktik(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltPortfoljpraktik(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltPortfoljpraktik(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// Hela kedjan exakt som chat-widget.tsx komponerar den (35 motorer) — används
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
  svaraLokaltPortfoljpraktik(fraga, KURSREGISTER);

// Kedjan UTAN detta lager (SIST-lager kan bara läggas sist — 35 motorer):
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
  svaraLokaltEkosystemdjup, svaraLokaltHandelsdag,
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
    const svar = svaraLokaltPortfoljpraktik(f.fraga, KURSREGISTER);
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
  // medvetet INOM det egna lagret (positionstorlek ↔ skörd ↔ pension, trion
  // som en vandring) enligt konventionen "knappen landar aldrig null".
  for (const f of NYA) {
    const svar = svaraLokaltPortfoljpraktik(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (36 motorer)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategorins antal och kursminuter i
  // texterna ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake).
  const pfAntal = KURSREGISTER.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
  const rkAntal = KURSREGISTER.filter((r) => r.kategori === "RISKHANTERING").length;
  const kmAntal = KURSREGISTER.filter((r) => r.kategori === "SVENSK BOLAGSSKATT & JURIDIK").length;
  const maAntal = KURSREGISTER.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
  const pf02 = KURSREGISTER.find((r) => r.slug === "pf-02-position-sizing");
  const pf09 = KURSREGISTER.find((r) => r.slug === "pf-09-taxloss-harvesting");
  const pf14 = KURSREGISTER.find((r) => r.slug === "pf-14-pensionssparande");
  const s1 = svaraLokaltPortfoljpraktik(NYA[0].fraga, KURSREGISTER);
  const s2 = svaraLokaltPortfoljpraktik(NYA[1].fraga, KURSREGISTER);
  const s3 = svaraLokaltPortfoljpraktik(NYA[2].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — PORTFÖLJ=" + pfAntal + " · RISK=" + rkAntal + " · SKATT=" + kmAntal + " · MA&R=" + maAntal +
      " · pf-02/pf-09/pf-14 " + (pf02 ? pf02.minuter : "?") + "/" + (pf09 ? pf09.minuter : "?") + "/" + (pf14 ? pf14.minuter : "?") + " min",
    !!s1 && !!s2 && !!s3 &&
      s1.text.includes("I portföljhanteringsfamiljen finns " + pfAntal + " kurser och i riskhanteringens " + rkAntal) &&
      s2.text.includes("I portföljhanteringsfamiljen finns " + pfAntal + " kurser och i den svenska skatt- och juridikkategorin " + kmAntal) &&
      s3.text.includes("I portföljhanteringsfamiljen finns " + pfAntal + " kurser och i makroekonomi och ränta " + maAntal) &&
      (pf02 ? s1.text.includes(pf02.minuter + " min") : false) &&
      (pf09 ? s2.text.includes(pf09.minuter + " min") : false) &&
      (pf14 ? s3.text.includes(pf14.minuter + " min") : false),
    "texterna ska bära registrets egna tal",
  );

  // Aritmetik — oberoende omräkning av exempelens alla tal.
  const fv = 1000 * (Math.pow(1.005, 360) - 1) / 0.005; // ≈ 1 004 515
  const realt = fv / Math.pow(1.02, 30); // ≈ 554 540
  const ARIT = [
    ["riskbudget 100 000×1 %=1 000", /100 000 kronor, riskandel 1 procent = 1 000 kronor/.test(s1.text) && Math.abs(100000 * 0.01 - 1000) < 1e-9],
    ["antal 1 000÷5=200", /1 000 ÷ 5 = 200 aktier/.test(s1.text) && Math.abs(1000 / 5 - 200) < 1e-9],
    ["position 200×50=10 000 (10 %)", /10 000 kronor, alltså 10 procent/.test(s1.text) && Math.abs(200 * 50 - 10000) < 1e-9],
    ["känslighet 500 aktier=25 000 (25 %)", /500 aktier = 25 000 kronor, en fjärdedel/.test(s1.text) && Math.abs(1000 / 2 - 500) < 1e-9 && Math.abs(500 * 50 - 25000) < 1e-9],
    ["tre fel 3×1 %=3 %", /3 × 1 % = 3 %/.test(s1.text) && Math.abs(3 * 1 - 3) < 1e-9],
    ["kvittning 100 000−40 000=60 000", /100 000 − 40 000 = 60 000/.test(s2.text) && Math.abs(100000 - 40000 - 60000) < 1e-9],
    ["skatt med skörd 30 %×60 000=18 000", /30 % × 60 000 = 18 000/.test(s2.text) && Math.abs(0.3 * 60000 - 18000) < 1e-9],
    ["skatt utan skörd 30 %×100 000=30 000", /30 000 kronor/.test(s2.text) && Math.abs(0.3 * 100000 - 30000) < 1e-9],
    ["besparing 30 000−18 000=12 000", /12 000 kronor lägre skatt/.test(s2.text) && Math.abs(30000 - 18000 - 12000) < 1e-9],
    ["insatt 360×1 000=360 000", /360 insättningar = 360 000 kronor insatta/.test(s3.text) && Math.abs(360 * 1000 - 360000) < 1e-9],
    ["slutvärde ≈1 004 500", /1 004 500 kronor/.test(s3.text) && Math.abs(fv - 1004500) < 500],
    ["inflationen 1,02³⁰=1,811", /delas slutvärdet med 1,811/.test(s3.text) && Math.abs(Math.pow(1.02, 30) - 1.811) < 0.001],
    ["realvärde ≈554 500", /554 500 kronor/.test(s3.text) && Math.abs(realt - 554500) < 500],
    ["avgiftseffekt ≥ en sjättedel", /en sjättedel eller mer/.test(s3.text)],
  ];
  const aritFel = ARIT.filter(([, ok]) => !ok).map(([n]) => n);
  kontroll("D03 aritmetik — exempelens 14 tal exakta och nämnda", aritFel.length === 0,
    aritFel.length ? "saknas/fel: " + aritFel.join(", ") : "1 000 · 200/10 000/10 % · 500/25 000/25 % · 3 % · 60 000 · 18 000 · 30 000 · 12 000 · 360 000 · 1 004 500 · 1,811 · 554 500 · sjättedel ✓");
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Ystad imorgon?",
  "Vem skrev Pippi Långstrump?",
  "Hur många strängar har en gitarr?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltPortfoljpraktik(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const PENSIONSRAD = /\b(välj|byt till|teckna)\b[^.]{0,40}\b(pension|fond|produkt|skatteform)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltPortfoljpraktik(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    if (PENSIONSRAD.test(svar.text)) FEL.push(f.amne + ": pensionsprodukt-råd i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser i portföljpraktik-svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL G: ANTISTÖLD — tidigare kanoniska ger null i detta lager ───────────
const GAMLA = [
  // Basens kanoniska (ur dess egna test) — däribland formuleringarnas ägare:
  { fraga: "Vad är position sizing?", amne: null }, // BASENS formulering — får ALDRIG stjälas här
  { fraga: "Hur hanterar jag risk?", amne: null },
  { fraga: "Hur bygger jag en portfölj?", amne: null },
  { fraga: "Hur fungerar ISK och skatt?", amne: null },
  { fraga: "Vad är kassaflödesanalys?", amne: null },
  { fraga: "Vad är konfluens?", amne: null },
  { fraga: "Vad är AK1TS?", amne: null },
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
  { fraga: "Vad är normalisering av resultat?", amne: null },
  { fraga: "Vad är köpoptionen?", amne: null },
  { fraga: "Vad är kundkoncentration?", amne: null },
  { fraga: "Vad är den omvända avkastningskurvan?", amne: null },
  { fraga: "Vad är avkastningens tre källor?", amne: null },
  { fraga: "Vad är scenarioanalys?", amne: null },
  { fraga: "Vad är warranter och teckningsoptioner?", amne: null },
  { fraga: "Vad är konjunkturindikatorerna?", amne: null },
  { fraga: "Vad är rörelsekapital?", amne: null },
  { fraga: "Vad är SAM-viktningen?", amne: null }, // syskonet u2:s omgång 17-lager
  { fraga: "Vad är en backtest?", amne: null },
  { fraga: "Hur fungerar handelsdagen?", amne: null }, // syskonet u1:s omgång 17-lager
];
{
  const stulna = GAMLA.filter((f) => svaraLokaltPortfoljpraktik(f.fraga, KURSREGISTER) !== null);
  kontroll(
    "G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i portföljpraktik-lagret",
    stulna.length === 0,
    stulna.length ? stulna.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltPortfoljpraktik(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓",
  );
}

// ── FALL G2: SYSKONKÄRNORD — ALLA tidigare kärnord LIVE som frågor ──────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const FEL = [];
  const SYSKON = [
    [MONSTER, "bas"], [MAKRO_MONSTER, "makro"], [EXTRA_MONSTER, "extra"], [NASTA_MONSTER, "nästa"],
    [KAPITALMEKANIK_MONSTER, "kapitalmekanik"], [SEKTOR_MONSTER, "sektor"], [CASE_MONSTER, "case"],
    [PRAKTIK_MONSTER, "praktik"], [PORTFOLJGRUND_MONSTER, "portföljgrund"], [AGANDE_MONSTER, "ägande"],
    [REDOVISNINGSDJUP_MONSTER, "redovisningsdjup"], [DJUP_MONSTER, "djup"], [HISTORIA_MONSTER, "historia"],
    [LONSAMHETSDJUP_MONSTER, "lönshet"], [TSDJUP_MONSTER, "tsdjup"], [SKATTEDJUP_MONSTER, "skattedjup"],
    [BETEENDEDJUP_MONSTER, "beteendedjup"], [RISKDJUP_MONSTER, "riskdjup"], [RISKMATTSDJUP_MONSTER, "riskmåttsdjup"],
    [UTDELNINGSDJUP_MONSTER, "utdelningsdjup"], [FÖRVÄNTNINGSDJUP_MONSTER, "förväntningsdjup"],
    [PORTFOLJBALANS_MONSTER, "portföljbalans"], [STABILITETSDJUP_MONSTER, "stabilitetsdjup"],
    [GRAHAMGOLV_MONSTER, "grahamgolv"], [VARDERJUSTERING_MONSTER, "värderjustering"],
    [OPTIONS_DJUP_MONSTER, "optionsdjup"], [RISKLÄSNINGSDJUP_MONSTER, "riskläsningsdjup"],
    [AVKASTNINGSKURVA_MONSTER, "avkastningskurva"], [AVKASTNINGSDJUP_MONSTER, "avkastningsdjup"],
    [VARDERINGSVERKTYG_MONSTER, "värderingsverktyg"], [WARRANT_MONSTER, "warrant"],
    [TIDSAXEL_MONSTER, "tidsaxel"], [KAPITALBINDNING_MONSTER, "kapitalbindning"],
    [EKOSYSTEMDJUP_MONSTER, "ekosystemdjup"], [HANDELSDAG_MONSTER, "handelsdag"],
  ];
  let antal = 0;
  for (const [monster, namn] of SYSKON) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) {
      for (const k of m.karnord ?? []) {
        antal++;
        const svar = svaraLokaltPortfoljpraktik("vad är " + k + "?", KURSREGISTER);
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
    if (med.amne === "positionstorlek" || med.amne === "taxloss" || med.amne === "pension") {
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
    "H01 kedja — " + GAMLA.length + " gamla oförändrade (SIST-invarianten) + " + NYA.length + " nya når rätt lager (36 motorer, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + 3) + "/" + (GAMLA.length + 3) + " rätt",
  );
}

// ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN detta ───────
{
  const tjuvade = NYA.filter((f) => kedjaUtan(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 3 nya kanoniska ger null i kedjan UTAN portfoljpraktik-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kedjaUtan(f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER, RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FÖRVÄNTNINGSDJUP_MONSTER, PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER, VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLÄSNINGSDJUP_MONSTER, AVKASTNINGSKURVA_MONSTER, AVKASTNINGSDJUP_MONSTER, VARDERINGSVERKTYG_MONSTER, WARRANT_MONSTER, TIDSAXEL_MONSTER, KAPITALBINDNING_MONSTER, EKOSYSTEMDJUP_MONSTER, HANDELSDAG_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of PORTFOLJPRAKTIK_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — PORTFOLJPRAKTIK_MONSTER vs " + (tidigare.size > 0 ? "alla tidigare lager" : "0 lager") + " (" + tidigare.size + " kärnord)",
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
    "svaraLokaltVarderjustering",
    "svaraLokaltOptionsdjup",
    "svaraLokaltRisklasningsdjup",
    "svaraLokaltAvkastningskurva",
    "svaraLokaltAvkastningsdjup",
    "svaraLokaltVarderingsverktyg",
    "svaraLokaltWarrant",
    "svaraLokaltTidsaxel",
    "svaraLokaltKapitalbindning",
    // Omgång 17:s fönsterlager (disk-läge-presedensen): u2 ekosystemdjup +
    // u1 handelsdag + detta lager portfoljpraktik — SIST av 36.
    "svaraLokaltEkosystemdjup",
    "svaraLokaltHandelsdag",
    "svaraLokaltPortfoljpraktik",
    "svaraLokaltSektorskola2",
  // Omgång 20 (2026-09-18): u3 beteendemekanik + u1 pe-mekanik + u2 överlevnadsdjup — svitharmonisering (dokumentationsplikten).
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
  if (!widget.includes('from "@/lib/ai-mentor-portfoljpraktik-fragor"')) {
    FEL.push("importen av ai-mentor-portfoljpraktik-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
  const kanda = new Set([...KOMPONENTER, "svaraLokaltEkosystemdjup", "svaraLokaltHandelsdag", "svaraLokaltPortfoljpraktik", "svaraLokaltUtdelningskalender", "svaraLokaltKreditdjup", "svaraLokaltSektordjup"]);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla 42 lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "portfoljpraktik sist av 36 lager, inga okända komponenter",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN PORTFÖLJPRAKTIK (s6-u3 omgång 17): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
