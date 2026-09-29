/**
 * TESTA AI-MENTORN — INDEXINKLUSIONEN (s6-u1, fönster 37: nyföddaktivering
 * kt-11 [primär + am-07 + am-02 + kt-01 + kt-02 + kt-03 + kt-05 + kt-09 +
 * ts-08 som källor] — flödesräkneläran, fönstrets tre pulser, asymmetrin —
 * KATEGORISTÄNGNING KATALYSATOR 13/14 → 14/14, andra stängningen).
 *
 * Kör:  node verktyg/testa-ai-mentor-indexinklusion.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för indexinklusion-frågan (se
 * src/lib/ai-mentor-indexinklusion-fragor.ts) med bevakning:
 *   A   2 kanoniska ingångar (indexinklusionen/inklusionseffekten) → rätt
 *       ämne, primärkälla, FLERKÄLLA (kallor = 9 + numrerad Källor-rad)
 *       och ≥ 8 kurslänkar + 3 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter bokmastar2, FÖRE marknadsrytm —
 *       deras SIST-deklaration); A2b monster-antal + syskon-tåligt
 *       TOTALT-tak
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D12 aritmetik maskinellt omräknad (Nordisk Moln AB [PÅHITTADE tal]:
 *       48 000 × 0,80 = 38 400 · 38 400/3 840 000 = 1,0 % ·
 *       0,22 × 38 400 = 8 448 Mkr · 8 448/120 = 70,4 normaldagar ·
 *       8 448/20 = 422 Mkr/dag · 422/120 = 3,5× volymen) + gränsvakter i
 *       TEXT + registerdrivna kontroller (KATALYSATOR-antal LIVE,
 *       nivåmarkör) + fantomslug
 *   E   kanoniska extra-ingångar (indexvikt, terminsstyrelse, köpbehov,
 *       ryktespulsen, uteslutningsspegeln, …)
 *   F   null-gränser (dokumenterad ägarpol): naket «index»/«indexfond(er)» →
 *       praktik (motor 10 — deras dokumenterade ägande) ·
 *       «indexomläggning»/«effektdagen» → etfmekanik · «katalysator» →
 *       basen · «budpremien» → nyfödda · «floaten» → försäkring —
 *       lämnas ifred
 *   F2  juridikgrind — pedagogisk text, PÅHITTAD-markör, inga råd
 *   G   ANTISTÖLD — grannlagers kanoniska (inkl. FÖNSTRETS SYSKON u2/u3:
 *       PE/IB-trion ib-06+pe-08+pe-09, de övriga nyfödda vr-10/ud-10/
 *       mt-09/bk-09 — deras ytor är deras) ⇒ NULL hos mig
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta
 *       lager (motorlistan läses LIVE ur kedjetestets MOTORDEFS) + H2
 *       med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE (kommentar-strippad — omgång 35:s läxa)
 *   L   widget-synk — import + EFTER bokmastar2 och FÖRE marknadsrytm
 *       (deras SIST-deklaration) i chat-widget.tsx:s kedja
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Testfall F2 vaktar att svaret är pedagogiskt — aldrig rekommendation.
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readdirSync, readFileSync } from "node:fs";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-indexinklusion.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltIndexinklusion, INDEXINKLUSION_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-indexinklusion-fragor.ts")).href
);

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
function approx(a, b, tolerans = 0.005) {
  return Math.abs(a - b) <= tolerans;
}

// ── FALL A: två kanoniska ingångar, ett monster, flerkällskrav ──────────────
// OBS titel-frågan «vad är indexinklusionen?» ägs i HELA kedjan av INGEN
// annan (praktik äger naket «index» som separat ORD — sammansättningen
// indexinklusionen ligger tav-12 från deras kärnord; H-fallet bevisar NULL
// genom kedjan). Gränsen dokumenterad i båda ändar (widget + modul).
const NYA = [
  { fraga: "Vad är indexinklusionen?", amne: "indexinklusion", slug: "kt-11-indexinklusionen" },
  { fraga: "Vad är inklusionseffekten?", amne: "indexinklusion", slug: "kt-11-indexinklusionen" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltIndexinklusion(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " indexinklusion", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length === 9;
  const kallradOk = svar.text.includes("📖 Källor (9)");
  const primarForst = svar.kallor?.[0]?.slug === f.slug;
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/")).length;
  const fragorKnappar = svar.handlings.filter((h) => h.lank.startsWith("fragor:")).length;
  kontroll(
    nr + " kanonisk ingång «" + f.fraga + "»",
    amneOk && kallaOk && kallorFinns && kallradOk && primarForst && kurslankar >= 8 && fragorKnappar >= 2,
    "ämne=" + svar.amne + " · primär=" + svar.kalla.slug + " · källor=" + (svar.kallor?.length ?? 0) +
      " · kurslänkar=" + kurslankar + " · fragor-knappar=" + fragorKnappar,
  );
});

// ── FALL A2: MOTORDEFS-position LIVE ur kedjetestet ─────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const ix = defs.findIndex((d) => d.namn === "indexinklusion");
  const ixBok2 = defs.findIndex((d) => d.namn === "bokmastar2");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2 MOTORDEFS — indexinklusion wiread med antal 1, index " + ix,
    ix !== -1 && defs[ix].antal === 1 && ixBok2 !== -1 && ixRytm !== -1 && ixBok2 < ix && ix < ixRytm,
    "efter bokmastar2 (" + ixBok2 + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer totalt " + defs.length,
  );
  kontroll(
    // Fönster 37: indexinklusion +1 (detta lager) ⇒ 232 — syskon-tåligt tak:
    // MINST 232; kommande fönsters motorer (u2/u3) bärs av sina egna
    // leveranser. Kedjetestets TOTALT-kommentar är sanningen.
    "A2b MONSTER-ANTAL — lagret bär exakt 1 monster (TOTALT ≥ 232)",
    INDEXINKLUSION_MONSTER.length === 1 && defs.reduce((s, d) => s + d.antal, 0) >= 232,
    "lager " + INDEXINKLUSION_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är indexinklusionen för något?", amne: "indexinklusion" },   // utvidgad
  { fraga: "vad är indexinklusion?", amne: "indexinklusion" },               // obestämd form
  { fraga: "vad ar indexinklusionen?", amne: "indexinklusion" },             // utan diakrit (normaliseras)
  { fraga: "vad är inklusionseffekt?", amne: "indexinklusion" },
  { fraga: "vad är en indexvikt?", amne: "indexinklusion" },
  { fraga: "vad är indexvikten?", amne: "indexinklusion" },
  { fraga: "vad är en terminsstyrelse?", amne: "indexinklusion" },
  { fraga: "vad är terminsstyrelser?", amne: "indexinklusion" },             // plural
  { fraga: "vad är köpbehovet vid en inklusion?", amne: "indexinklusion" },
  { fraga: "vad är ryktespulsen?", amne: "indexinklusion" },
  { fraga: "vad är en flödesdriven prisrörelse?", amne: "indexinklusion" },
  { fraga: "vad är uteslutningsspegeln?", amne: "indexinklusion" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltIndexinklusion(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är indexinklusionen?", "vad är inklusionseffekten?", "vad är en terminsstyrelse?",
    "vad är en indexvikt?", "vad är uteslutningsspegeln?", "vad är ryktespulsen?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltIndexinklusion(f, KURSREGISTER);
    const b = svaraLokaltIndexinklusion(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (Nordisk Moln AB — PÅHITTADE tal) ─
{
  const t1 = INDEXINKLUSION_MONSTER[0].bygga(KURSREGISTER).text;
  kontroll(
    "D01 justerat marknadsvärde — fritt flöte",
    48000 * 0.8 === 38400 && t1.includes("48 000 × 0,80 = 38 400"),
    "48 000 × fritt flöte 80 % = 38 400 Mkr (storägarens 20 % handlas inte)",
  );
  kontroll(
    "D02 indexvikten",
    approx(38400 / 3840000, 0.01, 0.0001) && t1.includes("38 400/3 840 000") && t1.includes("1,0 procent"),
    "38 400/3 840 000 = 1,0 % av indexets justerade kapital",
  );
  kontroll(
    "D03 köpbehovet — indexfondernas andel",
    0.22 * 38400 === 8448 && t1.includes("0,22 × 38 400 = 8 448"),
    "0,22 × 38 400 = 8 448 Mkr — mekaniskt, schemalagt, åsiktslöst",
  );
  kontroll(
    "D04 normaldagarna",
    approx(8448 / 120, 70.4, 0.05) && t1.includes("8 448/120 = 70,4") && t1.includes("normaldagar"),
    "8 448/120 = 70,4 normaldagar av handel",
  );
  kontroll(
    "D05 fönstret — extra volym per dag",
    approx(8448 / 20, 422.4, 0.05) && t1.includes("8 448/20 = 422") && t1.includes("422/120 = 3,5"),
    "8 448/20 = 422 Mkr extra per dag = 422/120 = 3,5× normalvolymen",
  );
  kontroll(
    "D06 pulserna i texten",
    ["RYKTESPULSEN", "TILLKÄNNAGIVANDETS PULS", "EFFEKTDAGENS PULS", "volymtoppen utan prisrörelse"].every((g) =>
      t1.toLowerCase().includes(g.toLowerCase())),
    "fönstrets tre pulser + volymtoppen-utan-prisrörelse bärs i texten",
  );
  kontroll(
    "D07 gränsvakter i TEXT",
    ["am-07", "am-02", "kt-01", "kt-02", "kt-03", "kt-05", "kt-09", "ts-08", "am-01"].every((g) => t1.includes(g)),
    "dokumenterade gränser bärs i text med attribution (grannfamiljerna)",
  );
  // D08–D09: registerdrivet — kategoriantal och nivå LIVE.
  const ktAntal = KURSREGISTER.filter((r) => r.kategori === "KATALYSATOR").length;
  kontroll(
    "D08 registerdrivet kategoriantal",
    ktAntal > 0 && t1.includes("I kategorin katalysator finns " + ktAntal + " kurser"),
    "KATALYSATOR = " + ktAntal + " LIVE ur KURSREGISTER (kategoristängningen = detta tal)",
  );
  const kt11 = KURSREGISTER.find((r) => r.slug === "kt-11-indexinklusionen");
  kontroll(
    "D09 nivåmarkör",
    !!kt11 && kt11.niva === "Intermediär" && t1.includes("intermediär nivå"),
    "kt-11 = " + (kt11 ? kt11.niva : "?") + " (registerdrivet, LIVE)",
  );
  // D10: kurslänkarnas slug:ar — alla äkta mot registret.
  const svaret = INDEXINKLUSION_MONSTER[0].bygga(KURSREGISTER);
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const kursSlugs = svaret.handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", ""));
  const fantomer = [...kursSlugs, ...svaret.kallor.map((k) => k.slug).filter(Boolean)].filter((s) => !slugSet.has(s));
  kontroll("D10 fantomslug", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : (kursSlugs.length + svaret.kallor.length) + " äkta slug:ar");
  // D11: kurslänkar ≥ 8 och fragor-knappar ≥ 2 (spårets källmärkningskrav).
  kontroll(
    "D11 källmärkning — ≥ 8 kurslänkar + ≥ 2 fragor-knappar",
    kursSlugs.length >= 8 && svaret.handlings.filter((h) => h.lank.startsWith("fragor:")).length >= 2,
    kursSlugs.length + " kurslänkar · " + svaret.handlings.filter((h) => h.lank.startsWith("fragor:")).length + " fragor-knappar",
  );
  kontroll(
    "D12 motfråga + fördjupning",
    svaret.motfraga?.text === "Vad är en indexomläggning?" && svaret.fordjupa?.lank === "/kurser/kt-11-indexinklusionen",
    "motfråga till etfmekanikens mekanikfråga · fördjupa = primärkursen",
  );
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är indexinklusionen?", "vad är indexinklusion?", "vad är inklusionseffekten?",
    "vad är inklusionseffekt?", "vad är en inklusion?", "vad är inklusionsflödet?",
    "vad är en indexvikt?", "vad är indexvikten?", "vad är indexvikter?",
    "vad är en terminsstyrelse?", "vad är terminsstyrelser?", "vad är terminsstyrelseringen?",
    "vad är flödeskatalysatorn?", "vad är en flödesdriven prisrörelse?", "vad är flödesdrivet?",
    "vad är köpbehovet?", "hur många normaldagar är köpbehovet?",
    "vad är uteslutningsspegeln?", "vad är uteslutningseffekten?",
    "vad är ryktespulsen?", "vad är effektdagspulsen?", "vad är volymtoppen?",
    "vad är indexbytes?", "vad är indexhändelsen?", "vad är justerat marknadsvärde?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltIndexinklusion(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "hur fungerar indexfonder?",       // praktik (motor 10) — naket indexfond-ägarskap
    "vad är en indexfond?",            // praktik
    "vad är index?",                   // praktik — naket index deras dokumenterade ord
    "vad är en indexomläggning?",      // etfmekanik (am-07 äger mekaniken)
    "vad är effektdagen?",             // etfmekanik (deras kärnord)
    "vad är en katalysator?",          // basens katalysator-monster
    "vad är budpremien?",              // nyfödda (kt-09:s ägare)
    "vad är floaten?",                 // försäkringens float-ägarskap
    "vad är kassaflöde?",              // extra-lagret
  ];
  const stulna = gransor.filter((f) => svaraLokaltIndexinklusion(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2: juridikgrind — pedagogisk text, aldrig rekommendation ──────────
{
  const t = INDEXINKLUSION_MONSTER[0].bygga(KURSREGISTER).text;
  const paddagogisk = t.includes("utbildning") && t.includes("inga placeringstips");
  const pahittade = t.includes("påhittade");
  const ingaRad = !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t);
  kontroll("F2 juridikgrind", paddagogisk && pahittade && ingaRad, "pedagogisk + påhittade värden + 0 rådsformuleringar");
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL hos detta lager ────────
{
  const grannar = [
    "vad är en indexomläggning?", "vad är en börshandlad fond?",     // etfmekanik
    "hur fungerar indexfonder?", "vad är spread?",                   // praktik/marknadsmekanik
    "vad är intermarket-analys?", "vad är svänghjulet?",             // bokmastar2 (kedjegrannen)
    "vad är korrelationsrisken?", "vad är en bullmarknad?",          // marknadsrytm (SIST-grannen)
    "vad är en katalysator?",                                        // basen
    "vad är budpremien?", "vad är avknoppningen?",                   // nyfödda (kt-familjens ägare)
    "vad är förväntningsanalys?",                                    // förväntningsdjupet
    "vad är volymanalys?",                                           // tsdjup-volymfamiljen
    // FÖNSTRETS SYSKON (u2/u3 bygger i samma fönster — deras ytor):
    "vad är evighetskapitalet?", "vad är avgiftsmaskinen?",          // PE/IB-trion (ib-06/pe-08)
    "vad är utdelningsrekapitaliseringen?",                          // pe-09
    "vad är regleringsmoat?", "vad är valutadifferenserna?",         // mt-09/bk-09
    "vad är enhetsmultiplar?", "vad är ex-dagen?",                   // vr-10/ud-10
  ];
  const stulna = grannar.filter((f) => svaraLokaltIndexinklusion(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "indexinklusion");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är indexinklusionen?", "vad är inklusionseffekten?",
    "vad är en terminsstyrelse?", "vad är en indexvikt?",
  ];
  const skuggor = [];
  for (const f of kanoniska) {
    for (const m of MOTORER) {
      if (m.fnk(f, KURSREGISTER) !== null) skuggor.push(f + " (" + m.namn + ")");
    }
  }
  kontroll(
    "H utan lager — samtliga " + kanoniska.length + " kanoniska NULL genom " + MOTORER.length + " motorer (LIVE)",
    skuggor.length === 0,
    skuggor.length ? "SKUGGAD: " + skuggor.join(", ") : "0 skuggor — territoriet var fritt (sond + kärnordsdisjunktion bevis)",
  );
  const svarar = kanoniska.map((f) => svaraLokaltIndexinklusion(f, KURSREGISTER) !== null);
  kontroll("H2 med lager — samtliga kanoniska svarar", svarar.every(Boolean), svarar.filter(Boolean).length + "/" + svarar.length);
}

// ── FALL J: KÄRNORDSDISJUNKTION LIVE (kommentar-strippad) ───────────────────
{
  function diafri(s) {
    return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim()
      .normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  }
  function tavstand(a, b) {
    if (a === b) return 0;
    const n = a.length, m = b.length;
    if (!n) return m; if (!m) return n;
    let fore = Array.from({ length: m + 1 }, (_, j) => j);
    const nu = new Array(m + 1);
    for (let i = 1; i <= n; i++) {
      nu[0] = i;
      for (let j = 1; j <= m; j++) {
        const kostnad = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kostnad);
      }
      fore = [...nu];
    }
    return fore[m];
  }
  const mina = INDEXINKLUSION_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-indexinklusion-fragor.ts",
  );
  const kollisioner = [];
  for (const fil of filer) {
    const rader = readFileSync(join(ROT, "src/lib", fil), "utf8").split("\n");
    const kod = rader.filter((r) => !r.trim().startsWith("//")).join("\n");
    for (const block of kod.matchAll(/karnord: \[([^\]]+)\]/g)) {
      for (const om of block[1].matchAll(/"([^"]+)"/g)) {
        const a = diafri(om[1]);
        for (const b of mina) {
          if (a === b) { kollisioner.push(fil + "«" + om[1] + "» = «" + b + "»"); continue; }
          if (a.includes(" ") || b.includes(" ")) continue;
          const tolerans = Math.max(a.length, b.length) <= 3 ? 0 : (Math.min(a.length, b.length) <= 7 ? 1 : 2);
          const d = tavstand(a, b);
          if (d <= Math.min(tolerans, 2) && a !== b) kollisioner.push("tav " + d + ": " + fil + "«" + om[1] + "» ~ «" + b + "»");
        }
      }
    }
  }
  kontroll("J kärnordsdisjunktion — " + mina.length + " kärnord mot " + filer.length + " andra lager (kommentar-strippat)", kollisioner.length === 0, kollisioner.length ? kollisioner.slice(0, 5).join(" | ") : "0 kollisioner");
}

// ── FALL L: widget-synk — import + kedjeposition ────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rader = widget.split("\n").filter((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const FEL = [];
  if (rader.length !== 1) FEL.push("hittade " + rader.length + " kedjerader (väntat exakt 1)");
  const rad = rader[0] ?? "";
  const posBok2 = rad.indexOf("svaraLokaltBokmastar2(");
  const posMin = rad.indexOf("svaraLokaltIndexinklusion(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("indexinklusion saknas i kedjeraden");
  if (posBok2 === -1 || posMin === -1 || posRytm === -1 || !(posBok2 < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat bokmastar2 < indexinklusion < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-indexinklusion-fragor"')) FEL.push("importen saknas");
  kontroll(
    "L widget-synk — efter bokmastar2, FÖRE marknadsrytm (deras SIST)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "91:a motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u1 fönster 37 (indexinklusion — KATEGORISTÄNGNING KATALYSATOR 14/14): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
