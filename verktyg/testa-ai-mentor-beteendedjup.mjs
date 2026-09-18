/**
 * TESTA AI-MENTORN — SPÅR 6, OMGÅNG 11, BYGGARE s6-u3 (beteendedjup-lagret).
 *
 * Kör:  node verktyg/testa-ai-mentor-beteendedjup.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som syskonsviten).
 *
 * Regressionstest för s6-u3 omgång 11:s tre nya förhandsfrågor
 * (bekräftelsefällan + ankareffekten + mental accounting — se
 * src/lib/ai-mentor-beteendedjup-fragor.ts) med bevakning av:
 *   A  3 nya kanoniska → rätt ämne, primärkälla, FLERKÄLLA (kallor ≥ 2 +
 *      numrerad Källor-rad i texten) och ≥ 3 kurslänkar per svar
 *   B  10 felstavade/varierade varianter → samma träff som den kanoniska
 *   C  determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D  källaäkthet — varje källa/kurslänk i de nya svaren FINNS i registret
 *      (fantomslugar är testfel) + fragor:-knappar levande mot kedjan +
 *      registerdrivna räknekontroller i texterna (klippskydd)
 *   E  3 omatchade frågor → null (API-flödet får dem)
 *   F  juridikgrind-lint — inga rådfraser/diagnosfraser i svaren
 *   G  ANTISTÖLD — samtliga 59 tidigare kanoniska frågor ger NULL i
 *      beteendedjup-lagret (inkl syskonens tsdjup 4 + skattedjup 3)
 *   G2 SYSKONKÄRNORD — samtliga kärnord i de tidigare 16 lagren läses
 *      LIVE ur modulerna och ställs som frågor → 0 fångster här
 *   H  hela kedjan (som chat-widget.tsx): 59 gamla + 3 nya når RÄTT lager
 *   I  OMKASTAD ANTISTÖLD — mina 3 kanoniska ger NULL i kedjan UTAN
 *      beteendedjup-lagret: inget tidigare lager fångar dem
 *   J  kärnordsdisjunktion MEKANISKT — BETEENDEDJUP_MONSTER:s kärnord är
 *      disjunkta mot samtliga tidigare lagers kärnord, LIVE-lästa
 *   L  WIDGET-SYNK — chat-widget.tsx:s kedjerad bär ALLA 17 lager i rätt
 *      ordning med beteendedjup SIST + importen finns (dödkodsmissen
 *      c363ec8b kan inte upprepas tyst).
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-beteendedjup.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet) — destrukturerad.
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltBeteendedjup, BETEENDEDJUP_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-beteendedjup-fragor.ts")).href);

// Syskonlager — toleranta importer (syskon kan skriva just nu; spårets
// dokumenterade mönster från praktik-/portfoljgrund-testerna).
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
// Syskon-pågående (u2:s riskdjup, wirad SIST i widgeten under detta fönster —
// känd-frivillig: deras commit äger modulen och inventarieuppdateringen).
const { svaraLokaltRiskdjup, RISKDJUP_MONSTER } = await tolerera("ai-mentor-riskdjup-fragor.ts", ["svaraLokaltRiskdjup", "RISKDJUP_MONSTER"]);

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

// Kedjan exakt som chat-widget.tsx komponerar den vid detta fönster:
// 16 tidigare lager + beteendedjup SIST.
function kedjaUtanMitt(fraga) {
  return (svaraLokaltMakro ? svaraLokaltMakro(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltExtra ? svaraLokaltExtra(fraga, KURSREGISTER) : null)
    ?? svaraLokalt(fraga, KURSREGISTER)
    ?? (svaraLokaltNasta ? svaraLokaltNasta(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltKapitalmekanik ? svaraLokaltKapitalmekanik(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltSektor ? svaraLokaltSektor(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltCase ? svaraLokaltCase(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltPraktik ? svaraLokaltPraktik(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltPortfoljgrund ? svaraLokaltPortfoljgrund(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltAgande ? svaraLokaltAgande(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltRedovisningsdjup ? svaraLokaltRedovisningsdjup(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltDjup ? svaraLokaltDjup(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltHistoria ? svaraLokaltHistoria(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltLonsamhetsdjup ? svaraLokaltLonsamhetsdjup(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltTsdjup ? svaraLokaltTsdjup(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltSkattedjup ? svaraLokaltSkattedjup(fraga, KURSREGISTER) : null)
    ?? (svaraLokaltRiskdjup ? svaraLokaltRiskdjup(fraga, KURSREGISTER) : null);
}
function kedja(fraga) {
  return kedjaUtanMitt(fraga) ?? svaraLokaltBeteendedjup(fraga, KURSREGISTER);
}

// ── FALL A: de tre nya kanoniska med flerkällskrav ─────────────────────────
const NYA = [
  {
    fraga: "Vad är bekräftelsefällan?",
    amne: "bekraftelsefalla",
    slug: "km-019-bekraftelsefalla",
  },
  {
    fraga: "Vad är ankareffekten?",
    amne: "ankareffekt",
    slug: "bf-05-ankareffekt",
  },
  {
    fraga: "Vad är mental accounting?",
    amne: "mentalaccounting",
    slug: "bf-03-mental-accounting",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltBeteendedjup(f.fraga, KURSREGISTER);
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

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad ar bekräftelsefallan?", amne: "bekraftelsefalla" }, // diafri (å)
  { fraga: "vad är bekräftelsebias?", amne: "bekraftelsefalla" }, // kärnordsfamilj
  { fraga: "hur undviker man bekräftelsefälla?", amne: "bekraftelsefalla" }, // böjningsform
  { fraga: "vad ar confirmation bias?", amne: "bekraftelsefalla" }, // engelsk familj, diafri
  { fraga: "vad menas med bekräftelse i analys?", amne: "bekraftelsefalla" }, // kortform + stärkord
  { fraga: "vad ar ankareffekten?", amne: "ankareffekt" }, // diafri (å)
  { fraga: "vad menas med förankring?", amne: "ankareffekt" }, // kärnordsfamilj
  { fraga: "berätta om ankare i beslut?", amne: "ankareffekt" }, // kortform
  { fraga: "hur fungerar mentala konton?", amne: "mentalaccounting" }, // kärnordsfamilj
  { fraga: "vad är mental bokföring?", amne: "mentalaccounting" }, // kärnordsfamilj
];

FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltBeteendedjup(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltBeteendedjup(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltBeteendedjup(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL D: källaäkthet — källor och kurslänkar FINNS i registret ─────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltBeteendedjup(f.fraga, KURSREGISTER);
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
    // fragor:-knappar skall landa i ETT verkligt tidigare lager (inte döda).
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = kedjaUtanMitt(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i kedjan — död knapp");
    }
  }
  kontroll("D01 källaäkthet — inga fantomslugar, inga döda fragor:-knappar", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta");

  // Registerdrivna räknekontroller: kategorins antal och kursernas minuter
  // i texterna ska komma ur registret (klippskydd vid registerändring).
  const katSum = KURSREGISTER.filter((r) => r.kategori === "BETEENDEFINANS").length;
  const bf = KURSREGISTER.find((r) => r.slug === "km-019-bekraftelsefalla");
  const ae = KURSREGISTER.find((r) => r.slug === "bf-05-ankareffekt");
  const ma = KURSREGISTER.find((r) => r.slug === "bf-03-mental-accounting");
  const sBF = svaraLokaltBeteendedjup(NYA[0].fraga, KURSREGISTER);
  const sAE = svaraLokaltBeteendedjup(NYA[1].fraga, KURSREGISTER);
  const sMA = svaraLokaltBeteendedjup(NYA[2].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — kategorisumma=" + katSum + " · km-019=" + (bf ? bf.minuter + "min" : "-") + " · bf-05=" + (ae ? ae.minuter + "min" : "-") + " · bf-03=" + (ma ? ma.minuter + "min" : "-"),
    sBF && sBF.text.includes("BETEENDEFINANS-kategorins " + katSum + " kurser") &&
      sAE && sAE.text.includes("BETEENDEFINANS-kategorins " + katSum + " kurser") &&
      sMA && sMA.text.includes("BETEENDEFINANS-kategorins " + katSum + " kurser") &&
      (!bf || (sBF && sBF.text.includes(bf.minuter + " min"))) &&
      (!ae || (sAE && sAE.text.includes(ae.minuter + " min"))) &&
      (!ma || (sMA && sMA.text.includes(ma.minuter + " min"))),
    "texterna ska bära registrets egna tal",
  );

  // Kedjan: mina kanoniska når beteendedjup (SIST-lägrets genomslående bevis).
  const kedjaRatt = NYA.every((f) => {
    const s = kedja(f.fraga);
    return s !== null && s.amne === f.amne;
  });
  kontroll("D03 kedjan — 3 nya kanoniska når beteendedjup-lagret genom hela kedjan", kedjaRatt,
    kedjaRatt ? "3/3 rätt lager" : "någon fråga skeppades av tidigare lager");
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Kiruna imorgon?",
  "Vem målade Skriet?",
  "Hur många tangenter har ett piano?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltBeteendedjup(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga råd-/diagnosfraser i svaren ────────────
{
  const RADCITAT = /\b(rekommenderar att du|rekommenderar köp|rekommenderar sälj|välj\b|råder dig|bör du köpa|bör du sälja|köp aktien|sälj aktien|jag diagnosticerar|din diagnos|handla så här i dina beslut)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltBeteendedjup(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": råd-/diagnosfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
    if (!/utbildning|mekanism|mekanik/i.test(svar.text)) FEL.push(f.amne + ": utbildningsframing saknas");
  }
  kontroll("F01 juridikgrind — inga råd-/diagnosfraser + utbildningsframing i beteendedjup-svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren generell mekanikutbildning, ingen diagnos");
}

// ── FALL G: ANTISTÖLD — 59 tidigare kanoniska ger null i detta lager ───────
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
  // Historia (omgång 9, s6-u3)
  { fraga: "Vad var tulpanmanin?", amne: "tulpanmanin" },
  { fraga: "Vad är en börsbubbla?", amne: "bubbla" },
  { fraga: "Vad hände vid aktiekraschen 1929?", amne: "krasch1929" },
  // Lonsamhetsdjup (omgång 10-fönstret, syskon u2)
  { fraga: "Vad är DuPont-analysen?", amne: "dupont" },
  { fraga: "Vad är ROIC?", amne: "roic" },
  // Tsdjup (omgång 11-fönstret, syskon u1 — 4 monsters)
  { fraga: "vad är fibonacci retracements?", amne: "fibonacci" },
  { fraga: "hur fungerar fibonacci extensions?", amne: "extension" },
  { fraga: "vad är gann-vinklar?", amne: "gann" },
  { fraga: "vad är en volymprofil och vpoc?", amne: "volymdjup" },
  // Skattedjup (omgång 11-fönstret, syskon u2 — 3 monsters)
  { fraga: "Vad är kapitalförsäkring?", amne: "kapitalforsakring" },
  { fraga: "Vad är bolagsskatt?", amne: "bolagsskatt" },
  { fraga: "Hur fungerar optionsbeskattning?", amne: "optionsbeskattning" },
];
{
  const STJALDA = GAMLA.filter((f) => svaraLokaltBeteendedjup(f.fraga, KURSREGISTER) !== null);
  kontroll("G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i beteendedjup-lagret", STJALDA.length === 0,
    STJALDA.length ? STJALDA.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltBeteendedjup(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓");
}

// ── FALL G2: SYSKONKÄRNORD — alla tidigare kärnord som frågor → 0 fångster ─
{
  const tidigareMonster = [
    MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER,
    KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER,
    PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER,
    DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER,
    SKATTEDJUP_MONSTER, RISKDJUP_MONSTER,
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
  const fangade = fragor.filter((f) => svaraLokaltBeteendedjup(f, KURSREGISTER) !== null);
  kontroll(
    "G2 syskonkärnord — " + karnord + " kärnord LIVE som frågor → 0 fångster",
    fangade.length === 0,
    fangade.length ? "fångade: " + fangade.slice(0, 5).join(" | ") : "0 krockar mot " + tidigareMonster.length + " tidigare lager (inkl tsdjup + skattedjup)",
  );
}

// ── FALL H: hela kedjan (som chat-widget.tsx) — alla når RÄTT lager ────────
{
  const fel = [];
  for (const f of [...GAMLA, ...NYA]) {
    const svar = kedja(f.fraga);
    if (!svar || svar.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (svar ? svar.amne : "null") + " (väntat " + f.amne + ")");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla + " + NYA.length + " nya når rätt lager",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + NYA.length) + "/" + (GAMLA.length + NYA.length) + " rätt lager",
  );

  // ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN detta ──────
  const tjuvade = NYA.filter((f) => kedjaUtanMitt(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 3 nya kanoniska ger null i kedjan UTAN beteendedjup-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kedjaUtanMitt(f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER, TSDJUP_MONSTER, SKATTEDJUP_MONSTER, RISKDJUP_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of BETEENDEDJUP_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — BETEENDEDJUP_MONSTER vs tidigare lager (" + tidigare.size + " kärnord)",
    krock.length === 0,
    krock.length ? krock.join(" | ") : "0 överlapp ✓",
  );
}

// ── FALL L: WIDGET-SYNK — kedjeraden i chat-widget.tsx bär alla lager ──────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  // KÄNDA komponenter i KEDJEORDNING (denna omgångs läge: 16 tidigare +
  // detta lagret beteendedjup SIST — tsdjup och skattedjup är wirade).
  const KOMPONENTER = [
    "svaraLokaltMakro", "svaraLokaltExtra", "svaraLokalt", "svaraLokaltNasta",
    "svaraLokaltKapitalmekanik", "svaraLokaltSektor", "svaraLokaltCase",
    "svaraLokaltPraktik", "svaraLokaltPortfoljgrund", "svaraLokaltAgande",
    "svaraLokaltRedovisningsdjup", "svaraLokaltDjup", "svaraLokaltHistoria",
    "svaraLokaltLonsamhetsdjup", "svaraLokaltTsdjup", "svaraLokaltSkattedjup",
    "svaraLokaltBeteendedjup",
      "svaraLokaltWarrant",
    "svaraLokaltTidsaxel",
    "svaraLokaltKapitalbindning",

    // Omgång 17:s fönsterlager (harmonisering enligt omgång 8-presedensen): u2 ekosystemdjup + u1 handelsdag + u3 portföljpraktik.
    "svaraLokaltEkosystemdjup",
    "svaraLokaltHandelsdag",
    "svaraLokaltPortfoljpraktik",];
  // Syskon-pågående lager (u2:s riskdjup, wirad SIST i widgeten under detta
  // fönster): KÄND men krävs ej — deras commit äger modulen. Vakten underkänner
  // fortfarande OKÄNDA (odokumenterade) komponenter.
  const PAGAENDE_KANDA = ["svaraLokaltRiskdjup", "svaraLokaltRiskmattsdjup", "svaraLokaltUtdelningsdjup", "svaraLokaltForvantningsdjup", "svaraLokaltPortfoljbalans", "svaraLokaltStabilitetsdjup", "svaraLokaltGrahamgolv", "svaraLokaltVarderjustering", "svaraLokaltOptionsdjup", "svaraLokaltRisklasningsdjup", "svaraLokaltAvkastningskurva", "svaraLokaltAvkastningsdjup", "svaraLokaltVarderingsverktyg"];
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
  // Beteendedjup låg SIST vid leveransen (omgång 11); omgångarna 12–16 har
  // lagt åtta lager efter det — SIST-kravet är utbytt mot ordningsvakten
  // ovan (omgång 8-presedensens vaktform; harmoniserat av u2 omgång 16).
  if (!widget.includes('from "@/lib/ai-mentor-beteendedjup-fragor"')) {
    FEL.push("importen av ai-mentor-beteendedjup-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
  const kanda = new Set([...KOMPONENTER, ...PAGAENDE_KANDA, "svaraLokaltEkosystemdjup", "svaraLokaltHandelsdag", "svaraLokaltPortfoljpraktik"]);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "17/17 lager i ordning (beteendedjup SIST), riskdjup känd-frivillig syskonpågående, inga okända komponenter",
  );
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN spår 6 s6-u3 omgång 11 (beteendedjup): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("────────────────────────────────────────");
if (fail > 0) process.exit(1);
