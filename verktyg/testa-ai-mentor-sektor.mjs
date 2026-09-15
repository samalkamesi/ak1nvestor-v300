/**
 * TESTA AI-MENTORN — SPÅR 6, OMGÅNG 3, BYGGARE u1 (sektor-lagret).
 *
 * Kör:  node verktyg/testa-ai-mentor-sektor.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för u1:s tre nya sektorförhandsfrågor (sektorsanalys +
 * bank + fastighet — se src/lib/ai-mentor-sektor-fragor.ts) med bevakning av:
 *   A  3 nya kanoniska → rätt ämne, primärkälla, FLERKÄLLA (kallor ≥ 2 +
 *      numrerad Källor-rad i texten) och ≥ 3 kurslänkar per svar
 *   B  6 felstavade/varierade varianter → samma träff som den kanoniska
 *   C  determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D  källaäkthet — varje källa/kurslänk i de nya svaren FINNS i registret
 *      (fantomslugar är testfel) + registerdriven räknekontroll i texten
 *   E  3 omatchade frågor → null (API-flödet får dem, inte sektormönstren)
 *   F  juridikgrind-lint — inga rådfraser (köp/sälj) i de nya svaren
 *   G  ANTISTÖLD — samtliga 29 tidigare kanoniska frågor ger NULL i
 *      sektor-lagret: det nya lagret kan aldrig stjäla ett existerande svar
 *   H  hela kedjan (makro ?? extra ?? bas ?? nästa ?? kapitalmekanik ??
 *      sektor, som chat-widget.tsx): 32 kanoniska frågor når RÄTT lager
 *   I  OMKASTAD ANTISTÖLD — mina 3 kanoniska ger NULL i kedjan UTAN
 *      sektor-lagret: inget tidigare lager fångar dem (dupliceringsskydd)
 *   J  kärnordsdisjunktion MEKANISKT — SEKTOR_MONSTER:s kärnord är
 *      disjunkta mot samtliga tidigare lagers kärnord, lästa LIVE ur
 *      modulerna (fångar även framtida syskonlagers tillägg)
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-sektor.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltSektor, SEKTOR_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-sektor-fragor.ts")).href);

// Syskonlager — kedje-testerna (fall H/I) hopas över versätfullt OM importen
// misslyckas (syskonet kan skriva just nu — samma tolerans som makro-testet).
let svaraLokaltExtra = null;
let EXTRA_MONSTER = null;
try {
  ({ svaraLokaltExtra, EXTRA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-extra-fragor.ts")).href));
} catch {
  console.log("NOT  fall H/I: ai-mentor-extra-fragor.ts ej importbar just nu — kedjetest körs utan extra-lager");
}
let svaraLokaltNasta = null;
let NASTA_MONSTER = null;
try {
  ({ svaraLokaltNasta, NASTA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-nasta-fragor.ts")).href));
} catch {
  console.log("NOT  fall H/I: ai-mentor-nasta-fragor.ts ej importbar just nu — kedjetest körs utan nästa-lager");
}
let svaraLokaltMakro = null;
let MAKRO_MONSTER = null;
try {
  ({ svaraLokaltMakro, MAKRO_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-makro-fragor.ts")).href));
} catch {
  console.log("NOT  fall H/I: ai-mentor-makro-fragor.ts ej importbar just nu — kedjetest körs utan makro-lager");
}
let svaraLokaltKapitalmekanik = null;
let KAPITALMEKANIK_MONSTER = null;
try {
  ({ svaraLokaltKapitalmekanik, KAPITALMEKANIK_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-kapitalmekanik-fragor.ts")).href));
} catch {
  console.log("NOT  fall H/I: ai-mentor-kapitalmekanik-fragor.ts ej importbar just nu — kedjetest körs utan kapitalmekanik-lager");
}

// ── Testharness (samma stil som testa-ai-mentor.mjs) ────────────────────────
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

// ── FALL A: de tre nya kanoniska (s6-u1 omgång 3) med flerkällskrav ─────────
const NYA = [
  {
    fraga: "Vad är sektorsanalys och varför skiljer sig sektorer åt?",
    amne: "sektorsanalys",
    slug: "km-047-utilitysektorn",
  },
  {
    fraga: "Hur fungerar banker och banksektorn?",
    amne: "bank",
    slug: "km-040-banksektorn",
  },
  {
    fraga: "Hur fungerar fastighetsbolag?",
    amne: "fastighet",
    slug: "km-042-fastighetsektorn",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltSektor(f.fraga, KURSREGISTER);
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
  { fraga: "vad ar sektorsanalys?", amne: "sektorsanalys" }, // diafri: ä→a räcker
  { fraga: "vad menas med en bransch?", amne: "sektorsanalys" },
  { fraga: "hur analyserar man banker?", amne: "bank" },
  { fraga: "vad är räntenetto?", amne: "bank" },
  { fraga: "vad betyder vakans?", amne: "fastighet" },
  { fraga: "fastighets aktier hur fungerar de?", amne: "fastighet" }, // splittrad stavning
];

FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltSektor(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltSektor(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltSektor(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL D: källaäkthet — källor och kurslänkar FINNS i registret ─────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltSektor(f.fraga, KURSREGISTER);
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
  kontroll("D01 källaäkthet — inga fantomslugar i källor/länkar", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta");

  // Registerdriven räknekontroll: sektorkategorins antal i texten ska komma
  // ur registret (klipp-skydd vid registerändring).
  const sektorAntal = KURSREGISTER.filter((r) => r.kategori === "SEKTORANALYS").length;
  const sSvar = svaraLokaltSektor(NYA[0].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivet tal — SEKTORANALYS = " + sektorAntal + " i sektorsanalys-svaret",
    sSvar && sSvar.text.includes(sektorAntal + " kurser"),
    "texten ska bära registrets egna tal",
  );
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Stockholm imorgon?",
  "Vem vann fotbolls-VM 1958?",
  "Hur många ben har en spindel?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltSektor(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltSektor(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser i sektorsvaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL G: ANTISTÖLD — sektor-lagret returnerar null för ALLA 29 gamla ────
const GAMLA = [
  // Basens femton kanoniska (våg 106 + u2 + u1, alla i dagens MONSTER)
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
  // Våg 158 omgång 1 — u1:s fyra
  { fraga: "Vad är utdelning och direktavkastning?", amne: "utdelning" },
  { fraga: "Vilken lärväg ska jag välja?", amne: "lärväg" },
  { fraga: "Hur påverkar psykologin mitt sparande?", amne: "beteende" },
  { fraga: "Hur fungerar ISK och skatt?", amne: "skatt" },
  // Våg 158 omgång 1 — u2:s två
  { fraga: "Hur läser jag en kvartalsrapport?", amne: "rapportläsning" },
  { fraga: "Vad är nyckeltal?", amne: "nyckeltal" },
  // Våg 158 omgång 1 — u3:s tre (extra-lagret)
  { fraga: "Vad är kassaflödesanalys?", amne: "kassaflödesanalys" },
  { fraga: "Vad är fundamental analys?", amne: "fundamental analys" },
  { fraga: "Vad är en moat?", amne: "moat" },
  // Våg 158 omgång 2 — u1:s två (makro-lagret)
  { fraga: "Vad är ränta och hur påverkar den aktier?", amne: "ränta" },
  { fraga: "Vad är inflation och KPI?", amne: "inflation" },
  // Våg 158 omgång 2/3 — u3:s tre (nästa-lagret)
  { fraga: "Hur värderar man ett bolag med DCF?", amne: "värdering" },
  { fraga: "Vad är substansvärde?", amne: "investmentbolag" },
  { fraga: "Vad är en option?", amne: "options" },
];
{
  const STJALDA = GAMLA.filter((f) => svaraLokaltSektor(f.fraga, KURSREGISTER) !== null);
  kontroll("G01 antistöld — 29 tidigare kanoniska ger null i sektor-lagret", STJALDA.length === 0,
    STJALDA.length ? STJALDA.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltSektor(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓");

  // ── FALL H: hela kedjen (som chat-widget.tsx) — alla når RÄTT lager ──────
  const kedja = (fraga) =>
    (svaraLokaltMakro ? svaraLokaltMakro(fraga, KURSREGISTER) : null) ??
    (svaraLokaltExtra ? svaraLokaltExtra(fraga, KURSREGISTER) : null) ??
    svaraLokalt(fraga, KURSREGISTER) ??
    (svaraLokaltNasta ? svaraLokaltNasta(fraga, KURSREGISTER) : null) ??
    (svaraLokaltKapitalmekanik ? svaraLokaltKapitalmekanik(fraga, KURSREGISTER) : null) ??
    svaraLokaltSektor(fraga, KURSREGISTER);
  const fel = [];
  for (const f of [...GAMLA, ...NYA]) {
    const svar = kedja(f.fraga);
    if (!svar || svar.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (svar ? svar.amne : "null") + " (väntat " + f.amne + ")");
  }
  kontroll(
    "H01 kedja — 29 gamla + 3 nya når rätt lager (makro ?? extra ?? bas ?? nästa ?? kapitalmekanik ?? sektor)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : "32/32 rätt lager",
  );

  // ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN sektor ─────
  const kedjaUtanSektor = (fraga) =>
    (svaraLokaltMakro ? svaraLokaltMakro(fraga, KURSREGISTER) : null) ??
    (svaraLokaltExtra ? svaraLokaltExtra(fraga, KURSREGISTER) : null) ??
    svaraLokalt(fraga, KURSREGISTER) ??
    (svaraLokaltNasta ? svaraLokaltNasta(fraga, KURSREGISTER) : null) ??
    (svaraLokaltKapitalmekanik ? svaraLokaltKapitalmekanik(fraga, KURSREGISTER) : null);
  const tjuvade = NYA.filter((f) => kedjaUtanSektor(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 3 nya kanoniska ger null i kedjan UTAN sektor-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kedjaUtanSektor(f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const tidigare = new Set();
  for (const monster of [MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER]) {
    if (!monster) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(k.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"));
  }
  const krock = [];
  for (const m of SEKTOR_MONSTER) {
    for (const k of m.karnord ?? []) {
      const nk = k.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
      if (tidigare.has(nk)) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — SEKTOR_MONSTER vs samtliga tidigare lager (" + tidigare.size + " kärnord genomsökta)",
    krock.length === 0,
    krock.length ? krock.join(" | ") : "0 överlapp ✓",
  );
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN spår 6 u1 omgång 3 (sektor): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("Nya förhandsfrågor: sektorsanalys, bank, fastighet · Register: " + KURSREGISTER.length + " kurser");
console.log("────────────────────────────────────────");
process.exitCode = fail === 0 ? 0 : 1;
