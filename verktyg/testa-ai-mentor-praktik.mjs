/**
 * TESTA AI-MENTORN — SPÅR 6, OMGÅNG 6, BYGGARE u3 (praktik-lagret).
 *
 * Kör:  node verktyg/testa-ai-mentor-praktik.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för u3:s tre nya praktikförhandsfrågor (index/passivt
 * ägande + blankning/short + marginalanalys — se
 * src/lib/ai-mentor-praktik-fragor.ts) med bevakning av:
 *   A  3 nya kanoniska → rätt ämne, primärkälla, FLERKÄLLA (kallor ≥ 2 +
 *      numrerad Källor-rad i texten) och ≥ 3 kurslänkar per svar
 *   B  6 felstavade/varierade varianter → samma träff som den kanoniska
 *   C  determinism — samma fråga två gånger ⇒ bitidentiskt svar
 *   D  källaäkthet — varje källa/kurslänk i de nya svaren FINNS i registret
 *      (fantomslugar är testfel) + registerdriven räknekontroll i texten
 *   E  3 omatchade frågor → null (API-flödet får dem, inte praktikmönstren)
 *   F  juridikgrind-lint — inga rådfraser (köp/sälj) i de nya svaren
 *   G  ANTISTÖLD — samtliga 35 tidigare kanoniska frågor ger NULL i
 *      praktik-lagret: det nya lagret kan aldrig stjäla ett existerande svar
 *   G2 DYNAMISK ANTISTÖLD (nytt fall i sviten) — varje kärnord i varje
 *      syskonlager (inkl kommande case-lagret, LIVE-läst) ställs som fråga
 *      och ska ge null hos praktik: fångar kärnordskrockar med framtida
 *      syskonleveranser innan de når prod
 *   H  hela kedjan (makro ?? extra ?? bas ?? nästa ?? kapitalmekanik ??
 *      sektor ?? case ?? praktik, som chat-widget.tsx): 38 kanoniska
 *      frågor når RÄTT lager (case-lagret hoppas över NOTERAT om syskonet
 *      skriver just nu)
 *   I  OMKASTAD ANTISTÖLD — mina 3 kanoniska ger NULL i kedjan UTAN
 *      praktik-lagret: inget tidigare lager fångar dem (dupliceringsskydd)
 *   J  kärnordsdisjunktion MEKANISKT — PRAKTIK_MONSTER:s kärnord är
 *      disjunkta mot samtliga tidigare lagers kärnord, lästa LIVE ur
 *      modulerna (inkl case-lagret om importbart)
 *   K  WIDGET-KOPPLING — chat-widget.tsx:s kedjerad innehåller
 *      svaraLokaltPraktik EFTER svaraLokaltCase (och svaraLokaltSektor):
 *      lagret är påkopplat i prod-flödet, inte död kod (sektor-fallet
 *      c363ec8b→f18f9bbf får aldrig upprepas)
 */

import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-praktik.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltPraktik, PRAKTIK_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-praktik-fragor.ts")).href);

// Syskonlager — kedje-testerna (fall G2/H/I/J) hopas över NOTERAT OM importen
// misslyckas (syskonet kan skriva just nu — samma tolerans som sektor-testet).
function lasSyskon(fil, namn) {
  try {
    return import(pathToFileURL(join(ROT, fil)).href);
  } catch {
    console.log("NOT  fall G2/H/I/J: " + fil + " ej importbar just nu — körs utan " + namn + "-lager");
    return null;
  }
}
const extraMod = await lasSyskon("src/lib/ai-mentor-extra-fragor.ts", "extra");
const makroMod = await lasSyskon("src/lib/ai-mentor-makro-fragor.ts", "makro");
const nastaMod = await lasSyskon("src/lib/ai-mentor-nasta-fragor.ts", "nästa");
const kapitalmekanikMod = await lasSyskon("src/lib/ai-mentor-kapitalmekanik-fragor.ts", "kapitalmekanik");
const sektorMod = await lasSyskon("src/lib/ai-mentor-sektor-fragor.ts", "sektor");
const caseMod = await lasSyskon("src/lib/ai-mentor-case-fragor.ts", "case");

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

// ── FALL A: de tre nya kanoniska (s6-u3 omgång 6) med flerkällskrav ────────
const NYA = [
  {
    fraga: "Vad är indexfonder och passivt ägande?",
    amne: "index",
    slug: "the-bogleheads-guide-to-investing",
  },
  {
    fraga: "Hur fungerar blankning och short?",
    amne: "blankning",
    slug: "pf-10-longshort",
  },
  {
    fraga: "Vad är vinstmarginal och hur gör man en marginalanalys?",
    amne: "marginal",
    slug: "v07-bruttomarginal",
  },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltPraktik(f.fraga, KURSREGISTER);
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
  { fraga: "vad ar en indexfond?", amne: "index" }, // diafri: ä→a räcker
  { fraga: "vad betyder etf?", amne: "index" },
  { fraga: "hur fungerar passivt sparande?", amne: "index" },
  { fraga: "vad är short?", amne: "blankning" },
  { fraga: "hur fungerar blakning?", amne: "blankning" }, // 1 bokstav fel (n borta)
  { fraga: "vad ar vinstmarginalen?", amne: "marginal" }, // diafri: ä→a räcker
];

FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltPraktik(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltPraktik(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltPraktik(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// ── FALL D: källaäkthet — källor och kurslänkar FINNS i registret ─────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltPraktik(f.fraga, KURSREGISTER);
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

  // Registerdrivna räknekontroller: siffrorna i texterna ska komma ur
  // registret (klippskydd vid registerändring + rebake-tolerans 349/358).
  const portfoljAntal = KURSREGISTER.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
  const losamhetAntal = KURSREGISTER.filter((r) => r.kategori === "LÖNSAMHET").length;
  const iSvar = svaraLokaltPraktik(NYA[0].fraga, KURSREGISTER);
  const bSvar = svaraLokaltPraktik(NYA[1].fraga, KURSREGISTER);
  const mSvar = svaraLokaltPraktik(NYA[2].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — registrets " + KURSREGISTER.length + " kurser i index-svaret",
    iSvar && iSvar.text.includes("I registrets " + KURSREGISTER.length + " kurser"),
    "texten ska bära registrets egna tal (rebake-tolerant)",
  );
  kontroll(
    "D03 registerdrivna tal — PORTFÖLJHANTERING = " + portfoljAntal + " i blanknings-svaret",
    bSvar && bSvar.text.includes(portfoljAntal + " kurser"),
    "texten ska bära registrets egna tal",
  );
  kontroll(
    "D04 registerdrivna tal — LÖNSAMHET = " + losamhetAntal + " i marginal-svaret",
    mSvar && mSvar.text.includes(losamhetAntal + " kurser"),
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
  const svar = svaraLokaltPraktik(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|köp denna|sälj denna|rekommenderar att du köper)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltPraktik(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser i praktiksvaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL G: ANTISTÖLD — praktik-lagret returnerar null för ALLA 35 gamla ───
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
  // Våg 158 omgång 4 — u3:s tre (i basen). AMNEN = dokumenterat kedjbeteende:
  // börs/PE-mönstrens egna amne-strängar; emission/goodwill fångas medvetet
  // av basens data-drivna V-uppslag (s6-u2:s bevisade ansvarsfördelning —
  // V19 "Kapitalförbränning & Emission-risk", V13 goodwill-variabeln) och
  // marginalens V-ord (marginal/bruttomarginal/ebitda) på samma sätt av
  // v07/v08-titelorden: kärnordsfamiljen i praktik-lagret äger ORDEN
  // UPPSLAGET SAKNAR (vinstmarginal, rörelsemarginal, marginalanalys).
  { fraga: "Vad är en katalysator?", amne: "katalysator" },
  { fraga: "Hur fungerar börsen och aktiemarknaden?", amne: "aktiemarknaden" },
  { fraga: "Vad är private equity?", amne: "private equity" },
  // Våg 158 omgång 4/5 — u2:s två + u1:s tre (kapitalmekanik + sektor)
  { fraga: "Vad är en emission och utspädning?", amne: "variabel-V19" },
  { fraga: "Vad är goodwill och immateriella tillgångar?", amne: "variabel-V13" },
  { fraga: "Vad är sektorsanalys och varför skiljer sig sektorer åt?", amne: "sektorsanalys" },
  { fraga: "Hur fungerar banker och banksektorn?", amne: "bank" },
  { fraga: "Hur fungerar fastighetsbolag?", amne: "fastighet" },
];
{
  const STJALDA = GAMLA.filter((f) => svaraLokaltPraktik(f.fraga, KURSREGISTER) !== null);
  kontroll("G01 antistöld — 35 tidigare kanoniska ger null i praktik-lagret", STJALDA.length === 0,
    STJALDA.length ? STJALDA.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltPraktik(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓");

  // ── FALL G2: DYNAMISK ANTISTÖLD — syskonkärnord som frågor → null ──────
  // Varje kärnord i varje ANNAT lagers mönster (LIVE-lästa, inkl ett
  // kommande case-lager) ställs som fråga: praktik får inte fånga något
  // av dem (kärnordsdisjunktion i frågeform — fångar krockar med
  // syskonleveranser som landar efter detta test skrevs).
  const syskonMonster = [];
  for (const [namn, mod] of [
    ["bas", { m: MONSTER }],
    ["extra", extraMod],
    ["makro", makroMod],
    ["nasta", nastaMod],
    ["kapitalmekanik", kapitalmekanikMod],
    ["sektor", sektorMod],
    ["case", caseMod],
  ]) {
    if (!mod) continue;
    for (const [nyckel, varde] of Object.entries(mod)) {
      if (Array.isArray(varde) && varde.length && varde[0] && typeof varde[0] === "object" && "karnord" in varde[0]) {
        syskonMonster.push([namn + ":" + nyckel, varde]);
      }
    }
  }
  const tjuvade = [];
  let provade = 0;
  for (const [namn, monster] of syskonMonster) {
    for (const m of monster) {
      for (const k of m.karnord ?? []) {
        provade++;
        const svar = svaraLokaltPraktik("vad är " + k + "?", KURSREGISTER);
        if (svar !== null) tjuvade.push("'" + k + "' (" + namn + ") ⇒ " + svar.amne);
      }
    }
  }
  kontroll(
    "G02 dynamisk antistöld — " + provade + " syskonkärnord som frågor ger null i praktik-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.join(" | ") : "0 fångster ✓ (fångar framtida syskonkärnord)",
  );

  // ── FALL H: hela kedjen (som chat-widget.tsx) — alla når RÄTT lager ──────
  const kedja = (fraga) =>
    (makroMod ? makroMod.svaraLokaltMakro(fraga, KURSREGISTER) : null) ??
    (extraMod ? extraMod.svaraLokaltExtra(fraga, KURSREGISTER) : null) ??
    svaraLokalt(fraga, KURSREGISTER) ??
    (nastaMod ? nastaMod.svaraLokaltNasta(fraga, KURSREGISTER) : null) ??
    (kapitalmekanikMod ? kapitalmekanikMod.svaraLokaltKapitalmekanik(fraga, KURSREGISTER) : null) ??
    (sektorMod ? sektorMod.svaraLokaltSektor(fraga, KURSREGISTER) : null) ??
    (caseMod ? caseMod.svaraLokaltCase(fraga, KURSREGISTER) : null) ??
    svaraLokaltPraktik(fraga, KURSREGISTER);
  const fel = [];
  for (const f of [...GAMLA, ...NYA]) {
    const svar = kedja(f.fraga);
    if (!svar || svar.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + (svar ? svar.amne : "null") + " (väntat " + f.amne + ")");
  }
  kontroll(
    "H01 kedja — 35 gamla + 3 nya når rätt lager (makro ?? extra ?? bas ?? nästa ?? kapitalmekanik ?? sektor ?? case ?? praktik)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : "38/38 rätt lager",
  );

  // ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN praktik ───
  const kedjaUtanPraktik = (fraga) =>
    (makroMod ? makroMod.svaraLokaltMakro(fraga, KURSREGISTER) : null) ??
    (extraMod ? extraMod.svaraLokaltExtra(fraga, KURSREGISTER) : null) ??
    svaraLokalt(fraga, KURSREGISTER) ??
    (nastaMod ? nastaMod.svaraLokaltNasta(fraga, KURSREGISTER) : null) ??
    (kapitalmekanikMod ? kapitalmekanikMod.svaraLokaltKapitalmekanik(fraga, KURSREGISTER) : null) ??
    (sektorMod ? sektorMod.svaraLokaltSektor(fraga, KURSREGISTER) : null) ??
    (caseMod ? caseMod.svaraLokaltCase(fraga, KURSREGISTER) : null);
  const tjuvade2 = NYA.filter((f) => kedjaUtanPraktik(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 3 nya kanoniska ger null i kedjan UTAN praktik-lagret",
    tjuvade2.length === 0,
    tjuvade2.length ? tjuvade2.map((f) => "'" + f.fraga + "' ⇒ " + kedjaUtanPraktik(f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );

  // ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────
  const tidigare = new Set();
  for (const [namn, monster] of syskonMonster) {
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(k.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"));
  }
  const krock = [];
  for (const m of PRAKTIK_MONSTER) {
    for (const k of m.karnord ?? []) {
      const nk = k.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
      if (tidigare.has(nk)) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — PRAKTIK_MONSTER vs samtliga tidigare lager (" + tidigare.size + " kärnord genomsökta)",
    krock.length === 0,
    krock.length ? krock.join(" | ") : "0 överlapp ✓",
  );
}

// ── FALL K: WIDGET-KOPPLING — praktik är påkopplat i chat-widget.tsx ───────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importOk = widget.includes('from "@/lib/ai-mentor-praktik-fragor"');
  const kedjerad = widget.split("\n").find((rad) => rad.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const kedjaOk = !!kedjerad && kedjerad.includes("svaraLokaltPraktik(q, KURSREGISTER)");
  const ordningOk = !!kedjerad &&
    kedjerad.indexOf("svaraLokaltSektor(q, KURSREGISTER)") < kedjerad.indexOf("svaraLokaltPraktik(q, KURSREGISTER)") &&
    kedjerad.indexOf("svaraLokaltCase(q, KURSREGISTER)") < kedjerad.indexOf("svaraLokaltPraktik(q, KURSREGISTER)");
  kontroll(
    "K01 widget-koppling — import + kedjerad med praktik SIST (efter sektor och case)",
    importOk && kedjaOk && ordningOk,
    "import=" + importOk + " · kedja=" + kedjaOk + " · sist=" + ordningOk +
      " (sektor-fallet c363ec8b får aldrig upprepas: fil utan koppling = död kod)",
  );
}

// ── Summering ───────────────────────────────────────────────────────────────
console.log("");
console.log("────────────────────────────────────────");
console.log("AI-MENTORN spår 6 u3 omgång 6 (praktik): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("Nya förhandsfrågor: index/passivt, blankning/short, marginal · Register: " + KURSREGISTER.length + " kurser");
console.log("────────────────────────────────────────");
process.exitCode = fail === 0 ? 0 : 1;
