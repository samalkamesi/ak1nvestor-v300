/**
 * TESTA AI-MENTORN — SPÅR 6, OMGÅNG 9, BYGGARE s6-u2 (lönsamhetsdjup-lagret).
 *
 * Kör:  node verktyg/testa-ai-mentor-lonsamhetsdjup.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för s6-u2 omgång 9:s två nya förhandsfrågor (DuPont-
 * analysen + ROIC — se src/lib/ai-mentor-lonsamhetsdjup-fragor.ts) med
 * bevakning av:
 *   A  2 nya kanoniska → rätt ämne, primärkälla, FLERKÄLLA (kallor ≥ 2 +
 *      numrerad Källor-rad i texten) och ≥ 3 kurslänkar per svar
 *   B  10 felstavade/varierade varianter → samma träff som den kanoniska
 *   C  determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D  källaäkthet — varje källa/kurslänk i de nya svaren FINNS i registret
 *      (fantomslugar är testfel) + fragor:-knappar levande mot HELA kedjan
 *      (dessa knappar korslänkar lagrets EGNA två monster — dokumenterat
 *      undantag från tidigare lagers "tidigare lager"-krav) +
 *      registerdrivna räknekontroller i texten (klippskydd)
 *   E  3 omatchade frågor → null (API-flödet får dem)
 *   F  juridikgrind-lint — inga rådfraser (köp/sälj) i de nya svaren
 *   G  ANTISTÖLD — samtliga 50 tidigare kanoniska frågor ger NULL i
 *      lönsamhetsdjup-lagret (det nya lagret kan aldrig stjäla ett
 *      existerande svar)
 *   G2 SYSKONKÄRNORD — samtliga kärnord i de 13 tidigare lagren läses
 *      LIVE ur modulerna och ställs som frågor ("vad är X?") → 0 fångster
 *      i detta lager (fångar även framtida syskonkrockar — samma fall som
 *      praktik-/portfoljgrund-/djup-/historia-lagrens test)
 *   H  hela kedjan (makro ?? extra ?? bas ?? nästa ?? kapitalmekanik ??
 *      sektor ?? case ?? praktik ?? portfoljgrund ?? agande ??
 *      redovisningsdjup ?? djup ?? historia ?? lonsamhetsdjup, som
 *      chat-widget.tsx): 52 kanoniska frågor når RÄTT lager
 *   I  OMKASTAD ANTISTÖLD — mina 2 kanoniska ger NULL i kedjan UTAN
 *      lönsamhetsdjup-lagret: inget tidigare lager fångar dem
 *   J  kärnordsdisjunktion MEKANISKT — LONSAMHETSDJUP_MONSTER:s kärnord
 *      är disjunkta mot samtliga 13 tidigare lagers kärnord, lästa LIVE
 *      ur modulerna
 *   L  WIDGET-SYNK — chat-widget.tsx:s kedjerad bär ALLA fjorton lager i
 *      rätt ordning + importen finns (dödkodsmissen c363ec8b — sektor
 *      levererad utan inkoppling — kan inte upprepas tyst; samma fall som
 *      case-/praktik-/portfoljgrund-/agande-/djup-/historia-testerna)
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-lonsamhetsdjup.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet) — destrukturerad.
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltLonsamhetsdjup, LONSAMHETSDJUP_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-lonsamhetsdjup-fragor.ts")).href);

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

// ── FALL A: de två nya kanoniska med flerkällskrav ─────────────────────────
const NYA = [
  {
    fraga: "Vad är DuPont-analysen?",
    amne: "dupont",
    slug: "ln-01-dupont-analysen",
  },
  {
    fraga: "Vad är ROIC?",
    amne: "roic",
    slug: "roic-01-avkastning-pa-investerat-kapital",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltLonsamhetsdjup(f.fraga, KURSREGISTER);
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
  { fraga: "vad ar dupont analysen for nagot?", amne: "dupont" }, // diafri
  { fraga: "vad är du pont modellen?", amne: "dupont" }, // flerordsfras
  { fraga: "vad menas med dupontmodellen?", amne: "dupont" }, // sammansatt kärnord
  { fraga: "vad är en dupon analys?", amne: "dupont" }, // 1 fel (6 tkn tål 1)
  { fraga: "förklara duppont formeln?", amne: "dupont" }, // 1 fel + stärkord
  { fraga: "vad är roic för något?", amne: "roic" }, // diafri
  { fraga: "hur räknar man ut roic?", amne: "roic" }, // kärnord i ny fras
  { fraga: "vad är wacc?", amne: "roic" }, // syskonämne i samma monster
  { fraga: "vad menas med nopat?", amne: "roic" }, // kärnord direkt
  { fraga: "vad är kapitalkostnaden?", amne: "roic" }, // böjning, avstånd 1
];

FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltLonsamhetsdjup(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltLonsamhetsdjup(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltLonsamhetsdjup(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL D: källaäkthet — källor och kurslänkar FINNS i registret ─────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltLonsamhetsdjup(f.fraga, KURSREGISTER);
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
  }
  kontroll("D01 källaäkthet — inga fantomslugar i de nya svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta");

  // fragor:-knappar skall landa i HELA kedjan — dessa knappar korslänkar
  // lagrets EGNA två monster ("vad är roic?" ur DuPont-svaret och tvärtom),
  // så kontrollen körs mot fullständiga kedjan (dokumenterat undantag från
  // tidigare lagers "tidigare lager"-krav: ett nytt lagers interna
  // korslänkar är per definition inte i ett tidigare lager).
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
    svaraLokaltLonsamhetsdjup(fraga, KURSREGISTER);
  for (const f of NYA) {
    const svar = svaraLokaltLonsamhetsdjup(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (16 lager)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategoriernas antal och kursminuter i
  // texterna ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake).
  const lonsamhetAntal = KURSREGISTER.filter((r) => r.kategori === "LÖNSAMHET").length;
  const ln01 = KURSREGISTER.find((r) => r.slug === "ln-01-dupont-analysen");
  const roic = KURSREGISTER.find((r) => r.slug === "roic-01-avkastning-pa-investerat-kapital");
  const sDupont = svaraLokaltLonsamhetsdjup(NYA[0].fraga, KURSREGISTER);
  const sRoic = svaraLokaltLonsamhetsdjup(NYA[1].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — LÖNSAMHET=" + lonsamhetAntal + " · ln-01 " + (ln01 ? ln01.minuter : "?") + " min · roic-01 " + (roic ? roic.minuter : "?") + " min",
    !!sDupont && !!sRoic &&
      sDupont.text.includes(lonsamhetAntal + " kurser") &&
      sRoic.text.includes(lonsamhetAntal + " kurser") &&
      (ln01 ? sDupont.text.includes(ln01.minuter + " min") : false) &&
      (roic ? sRoic.text.includes(roic.minuter + " min") : false),
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
  const svar = svaraLokaltLonsamhetsdjup(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltLonsamhetsdjup(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser i lönsamhetsdjup-svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL G: ANTISTÖLD — 50 tidigare kanoniska ger null i detta lager ───────
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
  // Historia (omgång 9, syskon u3)
  { fraga: "Vad var tulpanmanin?", amne: "tulpanmanin" },
  { fraga: "Vad är en börsbubbla?", amne: "bubbla" },
  { fraga: "Vad hände vid aktiekraschen 1929?", amne: "krasch1929" },
];
{
  const STJALDA = GAMLA.filter((f) => svaraLokaltLonsamhetsdjup(f.fraga, KURSREGISTER) !== null);
  kontroll("G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i lönsamhetsdjup-lagret", STJALDA.length === 0,
    STJALDA.length ? STJALDA.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltLonsamhetsdjup(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓");
}

// ── FALL G2: SYSKONKÄRNORD — alla tidigare kärnord som frågor → 0 fångster ─
{
  const tidigareMonster = [
    MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER,
    KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER,
    PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER,
    DJUP_MONSTER, HISTORIA_MONSTER,
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
  const fangade = fragor.filter((f) => svaraLokaltLonsamhetsdjup(f, KURSREGISTER) !== null);
  kontroll(
    "G2 syskonkärnord — " + karnord + " kärnord LIVE som frågor → 0 fångster",
    fangade.length === 0,
    fangade.length ? "fångade: " + fangade.slice(0, 5).join(" | ") : "0 krockar mot " + tidigareMonster.length + " lager",
  );
}

// ── FALL H: hela kedjan (som chat-widget.tsx) — alla når RÄTT lager ────────
{
  const kedja = (fraga) =>
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
    svaraLokaltLonsamhetsdjup(fraga, KURSREGISTER);
  const fel = [];
  for (const f of [...GAMLA, ...NYA]) {
    const svar = kedja(f.fraga);
    if (!svar || svar.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (svar ? svar.amne : "null") + " (väntat " + f.amne + ")");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla + " + NYA.length + " nya når rätt lager (16 lager, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + NYA.length) + "/" + (GAMLA.length + NYA.length) + " rätt lager",
  );

  // ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN detta ──────
  const kedjaUtanMitt = (fraga) =>
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
    (svaraLokaltHistoria ? svaraLokaltHistoria(fraga, KURSREGISTER) : null);
  const tjuvade = NYA.filter((f) => kedjaUtanMitt(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 2 nya kanoniska ger null i kedjan UTAN lönsamhetsdjup-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kedjaUtanMitt(f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER, SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER, REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER]) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of LONSAMHETSDJUP_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — LONSAMHETSDJUP_MONSTER vs 13 tidigare lager (" + tidigare.size + " kärnord)",
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
    "svaraLokaltPraktik", "svaraLokaltPortfoljgrund", "svaraLokaltAgande",
    "svaraLokaltRedovisningsdjup", "svaraLokaltDjup", "svaraLokaltHistoria",
    "svaraLokaltLonsamhetsdjup", "svaraLokaltTsdjup", "svaraLokaltSkattedjup",
    "svaraLokaltBeteendedjup", "svaraLokaltRiskdjup", "svaraLokaltRiskmattsdjup", "svaraLokaltUtdelningsdjup", "svaraLokaltForvantningsdjup",

    "svaraLokaltPortfoljbalans",
    "svaraLokaltStabilitetsdjup",
    "svaraLokaltGrahamgolv",
    // Omgång 14:s fönsterlager (disk-läge-presedensen): u2 varderjustering +
    // u1 optionsdjup + s6-u3 riskläsningsdjup — SIST av 27.
    "svaraLokaltVarderjustering",
    "svaraLokaltOptionsdjup",
    "svaraLokaltRisklasningsdjup",
    "svaraLokaltAvkastningskurva",
    "svaraLokaltAvkastningsdjup",
    "svaraLokaltVarderingsverktyg",
      "svaraLokaltWarrant",
    "svaraLokaltTidsaxel",
    "svaraLokaltKapitalbindning",

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
  if (!widget.includes('from "@/lib/ai-mentor-lonsamhetsdjup-fragor"')) {
    FEL.push("importen av ai-mentor-lonsamhetsdjup-fragor saknas");
  }
  // Okända kedjekomponenter underkänns (framtida lager måste dokumenteras här).
  const kanda = new Set([...KOMPONENTER, "svaraLokaltEkosystemdjup", "svaraLokaltHandelsdag", "svaraLokaltPortfoljpraktik", "svaraLokaltUtdelningskalender", "svaraLokaltKreditdjup", "svaraLokaltSektordjup"]);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (!kanda.has(namn)) FEL.push("okänd kedjekomponent: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla 36 lager i ordning + import",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "24 lager i ordning (lonsamhetsdjup + tsdjup + skattedjup + beteendedjup + riskdjup + riskmåttsdjup + utdelningsdjup + förväntningsdjup + portfoljbalans + stabilitetsdjup SIST), inga okända komponenter",
  );
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN spår 6 s6-u2 omgång 9 (lönsamhetsdjup): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("Nya förhandsfrågor: DuPont-analysen, ROIC · Register: " + KURSREGISTER.length + " kurser");
console.log("────────────────────────────────────────");
process.exitCode = fail === 0 ? 0 : 1;
