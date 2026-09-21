/**
 * TESTA AI-MENTORN — TIDSAXEL-LAGRET (spår 6 omgång 16, s6-u2), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-tidsaxel.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers två monsters (konjunkturindikatorerna, refinansie-
 * ringsmuren):
 *   A  kanoniska   — 2 frågor: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), ≥3 källor), ≥3 registeräkta kurslänkar
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (32 lager)
 *   D02 register   — kategoriantal + kursminuter i texterna ur registret
 *   E  genomström  — omatchade frågor → null (API-flödet)
 *   F  juridik     — inga köp/sälj-rådfraser (lagen 2007:528 — utbildning)
 *   G  antistöld   — tidigare kanoniska → null i detta lager
 *   G2 syskonkärnord — ALLA tidigare lagers kärnord LIVE som frågor → 0
 *   H  kedja       — SIST-lager-invarianten: gamla svar bitidentiska
 *                    med/utan detta lager + ämneskontroller + nya rätt
 *   I  omkastad    — de 2 nya kanoniska → null i kedjan UTAN detta lager
 *   J  disjunktion — kärnorden överlappar inget tidigare lagers (mekaniskt)
 *   L  widget-synk — kedjeraden i chat-widget.tsx bär alla 38 lager i
 *                    ordning + import + inga okända komponenter
 *
 * Syskonimporter är TOLERANTA (syskon kan skriva just nu): omgång 16:s
 * fönster bär u1:s warrant-lager (wireat som lager 31 FÖRE detta lager)
 * och u3:s kapitalbindning (rörelsekapital/kapitalbindning/kassakonver-
 * teringscykeln — wireades EFTER detta lager medan testet skrevs; den
 * faktiska wiringen läkte övergångsläget direkt, kedjan = 33 lager med
 * tidsaxel näst sist). Disk-läge-presedens som omgång 15.
 *
 * DOKUMENTERAD GRÄNS (sond _s6u2-sond-omg16.mjs): riskdjupet äger
 * "refinansiering"/"refinansieringsrisk"/"löptid" solo + "covenants";
 * basens kapitalstruktur-monster FÅNGAR "när förfaller skulden?" och
 * "hur refinansierar bolag skuld?" — detta lager bär ENDAST sammansatta
 * klung-/mur-/löptidsprofil-ord. Sektorn äger konjunkturCYKEL-familjen —
 * här bärs endast indikator-/barometer-/PMI-orden. Makro äger
 * ränta/realränta/inflation ("vad är realräntan?" FÅNGAS av makro —
 * därför levande fragor:-knapp, inte eget kärnord).
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — inga placeringstips, ingen
 * prognos om den verkliga ekonomin.
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-tidsaxel.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltTidsaxel, TIDSAXEL_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-tidsaxel-fragor.ts")).href);

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
// Omgång 16:s syskon i samma fönster (disk-läge-presedensen): u1:s warrant
// (wireat som lager 31 i widgeten FÖRE detta lager) + u3:s kapitalbindning
// (modul på disk, ännu ej wiread när detta test skrevs).
const { svaraLokaltWarrant, WARRANT_MONSTER } = await tolerera("ai-mentor-warrant-fragor.ts", ["svaraLokaltWarrant", "WARRANT_MONSTER"]);
const { svaraLokaltKapitalbindning, KAPITALBINDNING_MONSTER } = await tolerera("ai-mentor-kapitalbindning-fragor.ts", ["svaraLokaltKapitalbindning", "KAPITALBINDNING_MONSTER"]);

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

// ── FALL A: de två nya kanoniska med flerkällskrav ──────────────────────────
const NYA = [
  {
    fraga: "Vad är konjunkturindikatorer?",
    amne: "konjunkturindikatorerna",
    slug: "ma-04-konjunkturindikatorerna",
  },
  {
    fraga: "Vad är refinansieringsmuren?",
    amne: "refinansieringsmuren",
    slug: "st-05-refinansieringsmuren",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltTidsaxel(f.fraga, KURSREGISTER);
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

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad ar pmi?", amne: "konjunkturindikatorerna" }, // diafri + kort ord exakt
  { fraga: "vad är inköpschefsindex?", amne: "konjunkturindikatorerna" }, // instrumentet
  { fraga: "vad är konsumentförtroendet?", amne: "konjunkturindikatorerna" }, // bestämd form
  { fraga: "vad menas med diffusionsindex?", amne: "konjunkturindikatorerna" }, // räknesättet
  { fraga: "vad är framskrivningsindikatorer?", amne: "konjunkturindikatorerna" }, // ledande-familjen
  { fraga: "vad är mjuka data?", amne: "konjunkturindikatorerna" }, // undersökningarna
  { fraga: "vad ar konjunkturbarometern?", amne: "konjunkturindikatorerna" }, // diafri
  { fraga: "hur läses orderstocken?", amne: "konjunkturindikatorerna" }, // hårda måttet
  { fraga: "vad ar klungprofilen?", amne: "refinansieringsmuren" }, // diafri
  { fraga: "vad är en förfalloklunga?", amne: "refinansieringsmuren" }, // klungans namn
  { fraga: "vad är löptidsstrukturen?", amne: "refinansieringsmuren" }, // profilen
  { fraga: "hur räknas murkvoten?", amne: "refinansieringsmuren" }, // sammansatt
  { fraga: "vad menas med mur-kvoten?", amne: "refinansieringsmuren" }, // fras-formen
  { fraga: "vad är förfallotabellen?", amne: "refinansieringsmuren" }, // konstruktionen
  { fraga: "vad ar uppslaget?", amne: "refinansieringsmuren" }, // diafri + d=2
  { fraga: "vad är uppslagskänsligheten?", amne: "refinansieringsmuren" }, // känslighetsmåttet
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltTidsaxel(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltTidsaxel(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltTidsaxel(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL D: källaäkthet — källor och kurslänkar FINNS i registret ─────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltTidsaxel(f.fraga, KURSREGISTER);
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
  // medvetet till TIDIGARE lager (realräntan → makro, covenants → riskdjupet)
  // enligt "tidigare lager"-kravet; motfrågorna testas av fall H.
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
    (svaraLokaltKapitalbindning ? svaraLokaltKapitalbindning(fraga, KURSREGISTER) : null);
  for (const f of NYA) {
    const svar = svaraLokaltTidsaxel(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (32 lager)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategorins antal och kursminuter i
  // texterna ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake).
  const maAntal = KURSREGISTER.filter((r) => r.kategori === "MAKROEKONOMI & RÄNTA").length;
  const stAntal = KURSREGISTER.filter((r) => r.kategori === "STABILITET").length;
  const ma4 = KURSREGISTER.find((r) => r.slug === "ma-04-konjunkturindikatorerna");
  const st5 = KURSREGISTER.find((r) => r.slug === "st-05-refinansieringsmuren");
  const s1 = svaraLokaltTidsaxel(NYA[0].fraga, KURSREGISTER);
  const s2 = svaraLokaltTidsaxel(NYA[1].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — MA&R=" + maAntal + " · ma-04 " + (ma4 ? ma4.minuter + " min " + ma4.niva : "?") + " · STABILITET=" + stAntal + " · st-05 " + (st5 ? st5.minuter + " min " + st5.niva : "?"),
    !!s1 && !!s2 &&
    s1.text.includes(maAntal + " kurser") &&
    (ma4 ? s1.text.includes(ma4.minuter + " min, " + ma4.niva.toLowerCase() + " nivå") : false) &&
    s2.text.includes(stAntal + " kurser") &&
    (st5 ? s2.text.includes(st5.minuter + " min, " + st5.niva.toLowerCase() + " nivå") : false),
    "texterna ska bära registrets egna tal",
  );
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Ystad imorgon?",
  "Vem skrev Pippi Långstrump?",
  "Hur många strängar har en gitarr?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltTidsaxel(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltTidsaxel(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser i tidsaxel-svaren", FEL.length === 0,
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
  // Ägande (omgång 8, detta spårs u2)
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
  // Lönsamhetsdjup (omgång 9, detta spårs u2)
  { fraga: "Vad är DuPont-analysen?", amne: "dupont" },
  { fraga: "Vad är ROIC?", amne: "roic" },
  // Skattedjup (omgång 10, syskon u3)
  { fraga: "Vad är kapitalförsäkring?", amne: "kapitalforsakring" },
  // Beteendedjup (omgång 11, syskon u3)
  { fraga: "Vad är bekräftelsefällan?", amne: "bekraftelsefalla" },
  // Riskdjup (omgång 11, syskon u1)
  { fraga: "Vad är en skuldfälla?", amne: "skuldfalla" },
  { fraga: "Vad är en svart svan?", amne: "svartsvan" },
  // Riskmåttsdjup (omgång 12, syskon u1)
  { fraga: "Vad är sharpe-kvoten?", amne: "sharpekvot" },
  // Utdelningsdjup (omgång 12, detta spårs u2)
  { fraga: "Vad är utdelningsfällor?", amne: "utdelningsfalla" },
  { fraga: "Vad är aktieåterköp?", amne: "aktieaterkop" },
  // Förväntningsdjup (omgång 12, syskon u3)
  { fraga: "Vad är förväntningsanalys?", amne: "forvantningsanalys" },
  { fraga: "Vad är förväntningsgapet?", amne: "forvantningsgap" },
  { fraga: "Vad är kalibrering?", amne: "kalibrering" },
  // Portfoljbalans (omgång 13, syskon u1)
  { fraga: "Vad är rebalansering?", amne: "rebalansering" },
  // Stabilitetsdjup (omgång 13, detta spårs u2)
  { fraga: "Vad är känslighetsanalys?", amne: "kanslighetsanalys" },
  { fraga: "Vad är soliditetsgrad?", amne: "soliditetsgrad" },
  // Grahamgolv (omgång 13, syskon u3)
  { fraga: "Vad är en net-net och NCAV?", amne: "netnet" },
  { fraga: "Vad är cigar butts?", amne: "cigarbutt" },
  { fraga: "Vem är Mr Market?", amne: "mrmarket" },
  // Varderjustering (omgång 14, detta spårs u2)
  { fraga: "Vad är normaliserad vinst?", amne: "normalisering" },
  // Optionsdjup (omgång 14, syskon u1)
  { fraga: "Vad är en köpoption?", amne: null },
  // Riskläsningsdjup (omgång 14, syskon u3)
  { fraga: "Vad är kundkoncentration?", amne: "kundkoncentration" },
  { fraga: "Vad är en riskmatris?", amne: "riskmatris" },
  { fraga: "Hur läser jag riskavsnittet?", amne: "riskavsnitt" },
  // Avkastningskurva (omgång 15, syskon u1)
  { fraga: "Vad är den omvända avkastningskurvan?", amne: null },
  // Avkastningsdjup (omgång 15, detta spårs u2)
  { fraga: "Varifrån kommer aktiens avkastning?", amne: "avkastningens källor" },
  { fraga: "Vad är tvärsnittsanalys?", amne: "tvärsnittsanalys" },
  // Värderingsverktyg (omgång 15, syskon u3)
  { fraga: "Vad är scenarioanalys?", amne: null },
  // Omgång 16:s syskon i samma fönster (disk-läge-presedensen)
  { fraga: "Vad är en warrant?", amne: null },
  { fraga: "Vad är rörelsekapital?", amne: null },
  // Sondens dokumenterade gränser — ägs av tidigare lager, ska STANSA kvar:
  { fraga: "När förfaller skulden?", amne: "kapitalstruktur" },
  { fraga: "Vad är realräntan?", amne: "inflation" },
];
{
  const STJALDA = GAMLA.filter((f) => svaraLokaltTidsaxel(f.fraga, KURSREGISTER) !== null);
  kontroll("G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i tidsaxel-lagret", STJALDA.length === 0,
    STJALDA.length ? STJALDA.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltTidsaxel(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓");
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
    WARRANT_MONSTER, KAPITALBINDNING_MONSTER,
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
  const fangade = fragor.filter((f) => svaraLokaltTidsaxel(f, KURSREGISTER) !== null);
  kontroll(
    "G2 syskonkärnord — " + karnord + " kärnord LIVE som frågor → 0 fångster",
    fangade.length === 0,
    fangade.length ? "FÅNGSTER: " + fangade.slice(0, 5).join(" | ") : "0 krockar mot " + tidigareMonster.length + " lager",
  );
}

// ── FALL H: hela kedjan (som chat-widget.tsx) — SIST-lager-invarianten ─────
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
  const UTAN = LAGER.filter(([namn]) => namn !== "tidsaxel");

  // Invarianten: ett SIST-lager ändrar ALDRIG ett tidigare svar.
  const fel = [];
  for (const f of GAMLA) {
    const med = kora(MED, f.fraga);
    const utan = kora(UTAN, f.fraga);
    if (JSON.stringify(med) !== JSON.stringify(utan)) {
      fel.push("'" + f.fraga + "' ändrad av tidsaxel-lagret (med=" + (med ? med.amne : "null") + ", utan=" + (utan ? utan.amne : "null") + ")");
    }
  }
  // Nyckel-ämnen landar fortfarande rätt (ändringsimmutabilitet + identitet)
  // — endast motorer som går att importera just nu (toleranta syskonimporter).
  for (const f of GAMLA.filter((x) => x.amne)) {
    const med = kora(MED, f.fraga);
    if (!med || med.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (med ? med.amne : "null") + " (väntat " + f.amne + ")");
  }
  // Mina två når mitt lager genom hela kedjan.
  for (const f of NYA) {
    const med = kora(MED, f.fraga);
    if (!med || med.amne !== f.amne) fel.push("NY '" + f.fraga + "' ⇒ " + (med ? med.amne : "null") + " (väntat " + f.amne + ")");
  }
  // Motfrågorna (tidigare lagers område) ska vara levande knappar genom kedjan.
  for (const q of ["Vad är förväntningsanalys?", "Vad är covenants?"]) {
    const mal = kora(MED, q.toLowerCase());
    if (!mal) fel.push("motfråga '" + q + "' landar null i kedjan — död knapp");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla oförändrade (SIST-invarianten) + " + GAMLA.filter((x) => x.amne).length + " ämneskontroller + " + NYA.length + " nya når rätt lager (33 lager, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + NYA.length + 2) + "/" + (GAMLA.length + NYA.length + 2) + " rätt",
  );

  // ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN detta ──────
  const tjuvade = NYA.filter((f) => kora(UTAN, f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 2 nya kanoniska ger null i kedjan UTAN tidsaxel-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kora(UTAN, f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER, RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FÖRVÄNTNINGSDJUP_MONSTER, PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER, VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLÄSNINGSDJUP_MONSTER, AVKASTNINGSKURVA_MONSTER, VARDERINGSVERKTYG_MONSTER, WARRANT_MONSTER, KAPITALBINDNING_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of TIDSAXEL_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — TIDSAXEL_MONSTER vs " + (tidigare.size > 0 ? "alla tidigare lager" : "0 lager") + " (" + tidigare.size + " kärnord)",
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
  
    // Omgång 17:s fönsterlager (harmonisering enligt omgång 8-presedensen): u2 ekosystemdjup + u1 handelsdag + u3 portföljpraktik.
    "svaraLokaltEkosystemdjup",
    "svaraLokaltHandelsdag",
    "svaraLokaltPortfoljpraktik",    "svaraLokaltSektorskola2",
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
    // Fönster 31-harmonisering (s6-u3, _s6u3o31-): fönstrets tre nya komponenter i
    // widgetordning — u1 stålsektor (74:e) · u2 casepraktik (75:e) · u3 beteendefallor
    // (76:e) — FÖRE marknadsrytm (deras SIST-deklaration). Idempotent.
    "svaraLokaltCoinvest", "svaraLokaltTvangsmekanik", "svaraLokaltHandelsemotor", "svaraLokaltLonsamhetsgrund", "svaraLokaltStalsektor", "svaraLokaltCasepraktik", "svaraLokaltBeteendefallor", "svaraLokaltMarknadsrytm",];
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
  if (!widget.includes('from "@/lib/ai-mentor-tidsaxel-fragor"')) {
    FEL.push("importen av ai-mentor-tidsaxel-fragor saknas");
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
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla 33 lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "tidsaxel näst sist av 33 lager (u1:s warrant före, u3:s kapitalbindning efter — samma fönster), inga okända komponenter",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN TIDSAXEL (s6-u2 omgång 16): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
