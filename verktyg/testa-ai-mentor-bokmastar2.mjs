/**
 * TESTA AI-MENTORN — BOKMASTER 2: INTERMARKET-KEDJAN + STORHETSSPRÅNGET
 * (v206-u1, manifest v206-mega-kapacitet-1789637000 — data-djupmetodens
 * två tyngsta lösa BOKMASTER-kurser: intermarket-analysis [Murphy, primär
 * + 4 källor] + good-to-great [Collins, primär + 6 källor]).
 *
 * Kör:  node verktyg/testa-ai-mentor-bokmastar2.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för båda monstren (se src/lib/ai-mentor-bokmastar2-fragor.ts)
 * med bevakning:
 *   A   4 kanoniska ingångar (2 per monster) → rätt ämne, primärkälla,
 *       FLERKÄLLA (kallor = 5 + 7, numrerad Källor-rad, primären först)
 *       och ≥ 5/7 kurslänkar + ≥ 3 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter faktorfadrarna, FÖRE marknadsrytm —
 *       deras SIST-deklaration); A2b monster-antal + syskon-tåligt
 *       TOTALT-tak
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D18 aritmetik maskinellt omräknad — BÖCKERNAS EGNA HISTORISKA
 *       TAL (Dow −22,6 % ⇒ 100 → 77,4 · Nikkei 38 957 × 0,20 ≈ 7 790 ·
 *       guld (400 − 252) ÷ 252 = 0,587 ⇒ +58,7 % · matrisens +0,3..+0,6
 *       har mittpunkt +0,45 · kvot-exemplet [PÅHITTAT] 264/114 = 2,32 ⇒
 *       +16 % relativt · 60–120 dagars fönster · tratten 1 435 → 126 =
 *       8,8 % → 19 → 11 = 0,8 % · 7^(1/15) = 1,1385 ⇒ 13,9 %/år ·
 *       18,5^(1/15) = 1,2148 ⇒ 21,5 %/år · 11 + 11 + 6 = 28 · 10 ÷ 11 =
 *       0,91 ⇒ 91 % mot 6x externa · fyra år · tolv kvartal) + gränsvakter
 *       i TEXT + registerdrivna kontroller (BOKMASTER-antal, kapitel/quiz
 *       LIVE) + fantomslug + källmärkningskrav + motfråga/fördjupning
 *   E   kanoniska extra-ingångar (murphy, good to great, igelkotten,
 *       flugsvärmen, svänghjulet, stockdale, normalförhållandet, …)
 *   F   null-gränser (dokumenterad ägarpol): «teknisk analys» → basen ·
 *       «korrelationsrisken» → marknadsrytm · «valutarisk» → valutamekanik ·
 *       «inflation»/«deflation» → makro · «råvaror» → etfmekanik · «moat»
 *       → moatdjup · «bullmarknad» → marknadsrytm · naket «guld» lämnas
 *       öppet · «vad är murphy för bok?» → basens böcker-monster (deras
 *       kärnord «bok» — KEDJETEST-FYNDET vid wireningen) — lämnas ifred
 *   F2  juridikgrind — pedagogisk text, PÅHITTADE-markör, inga råd
 *   G   ANTISTÖLD — grannlagers kanoniska inklusive FÖNSTRETS SYSKON
 *       (faktorfadrarna ligger direkt före; kommande u2-u6 bygger där ute
 *       — deras ytor är deras) ⇒ NULL hos mig
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta
 *       lager (motorlistan läses LIVE ur kedjetestets MOTORDEFS) + H2
 *       med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE (kommentar-strippad — omgång 35:s läxa)
 *   L   widget-synk — import + EFTER faktorfadrarna och FÖRE marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-bokmastar2.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltBokmastar2, BOKMASTAR2_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-bokmastar2-fragor.ts")).href
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

// ── FALL A: fyra kanoniska ingångar (2 per monster), flerkällskrav ─────────
const NYA = [
  { fraga: "Vad är intermarket-analys?", amne: "intermarket-analys", slug: "intermarket-analysis", antal: 5, lankMin: 5 },
  { fraga: "Vad är normalförhållandet?", amne: "intermarket-analys", slug: "intermarket-analysis", antal: 5, lankMin: 5 },
  { fraga: "Vad är bra till bäst?", amne: "bra till bäst", slug: "good-to-great", antal: 7, lankMin: 7 },
  { fraga: "Vad är good to great?", amne: "bra till bäst", slug: "good-to-great", antal: 7, lankMin: 7 },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltBokmastar2(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " bokmaster2", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length === f.antal;
  const kallradOk = svar.text.includes("📖 Källor (" + f.antal + ")");
  const primarForst = svar.kallor?.[0]?.slug === f.slug;
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/")).length;
  const fragorKnappar = svar.handlings.filter((h) => h.lank.startsWith("fragor:")).length;
  kontroll(
    nr + " kanonisk ingång «" + f.fraga + "»",
    amneOk && kallaOk && kallorFinns && kallradOk && primarForst && kurslankar >= f.lankMin && fragorKnappar >= 3,
    "ämne=" + svar.amne + " · primär=" + svar.kalla.slug + " · källor=" + (svar.kallor?.length ?? 0) +
      " · kurslänkar=" + kurslankar + " · fragor-knappar=" + fragorKnappar,
  );
});

// ── FALL A2: MOTORDEFS-position LIVE ur kedjetestet ─────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const ix = defs.findIndex((d) => d.namn === "bokmastar2");
  const ixFaktor = defs.findIndex((d) => d.namn === "faktorfadrarna");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2 MOTORDEFS — bokmastar2 wiread med antal 2, index " + ix,
    ix !== -1 && defs[ix].antal === 2 && ixFaktor !== -1 && ixRytm !== -1 && ixFaktor < ix && ix < ixRytm,
    "efter faktorfadrarna (" + ixFaktor + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer totalt " + defs.length,
  );
  kontroll(
    // v206-u1: bokmastar2 +2 (detta lager) ⇒ 231 — syskon-tåligt tak:
    // MINST 231; kommande fönsters motorer (u2-u6) bärs av sina egna
    // leveranser. Kedjetestets TOTALT-kommentar är sanningen.
    "A2b MONSTER-ANTAL — lagret bär exakt 2 monsters (TOTALT ≥ 231)",
    BOKMASTAR2_MONSTER.length === 2 && defs.reduce((s, d) => s + d.antal, 0) >= 231,
    "lager " + BOKMASTAR2_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är intermarket analys?", amne: "intermarket-analys" },        // utan bindestreck (normaliseras)
  { fraga: "vad är intermarket kedjan?", amne: "intermarket-analys" },
  { fraga: "vad är intermarketanalys?", amne: "intermarket-analys" },         // sammansatt
  { fraga: "vad är flight to quality?", amne: "intermarket-analys" },
  { fraga: "vad är desinflation?", amne: "intermarket-analys" },
  { fraga: "vad är regimskiftet?", amne: "intermarket-analys" },
  { fraga: "vad är igelkottskonceptet?", amne: "bra till bäst" },
  { fraga: "vad är hedgehog konceptet?", amne: "bra till bäst" },
  { fraga: "vad är domedagsloopen?", amne: "bra till bäst" },
  { fraga: "vad är nämnaren?", amne: "bra till bäst" },
  { fraga: "vad är nivå 5 ledarskap?", amne: "bra till bäst" },
  { fraga: "vem var jim collins?", amne: "bra till bäst" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltBokmastar2(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är intermarket-analys?", "vad är bra till bäst?", "vad är good to great?",
    "vad är en igelkott?", "vad är flugsvärmen?", "vad är normalförhållandet?",
    "vad är sektorsrotation?", "vad är stockdale-paradoxen?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltBokmastar2(f, KURSREGISTER);
    const b = svaraLokaltBokmastar2(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (BÖCKERNAS EGNA tal) ─────────────
{
  const t1 = BOKMASTAR2_MONSTER[0].bygga(KURSREGISTER).text;
  const t2 = BOKMASTAR2_MONSTER[1].bygga(KURSREGISTER).text;

  // ── Monster 1: intermarket-kedjan (Murphys egna historiska tal) ──
  kontroll(
    "D01 Dow −22,6 % den 19 oktober 1987",
    approx(1 - 0.226, 0.774, 0.0001) && t1.includes("22,6 procent på en dag") && t1.includes("index 100 → 77,4"),
    "1 − 0,226 = 0,774 ⇒ index 100 → 77,4 (bokens eget tal)",
  );
  kontroll(
    "D02 Nikkei −80 % från toppen 38 957",
    approx(38957 * 0.2, 7790, 2) && t1.includes("38 957 × 0,20 ≈ 7 790") && t1.includes("STATSOBLIGATIONER STEG"),
    "38 957 × 0,20 = 7 791,4 ≈ 7 790 medan obligationerna steg (deflationens värld)",
  );
  kontroll(
    "D03 guldet 252 → 400 dollar",
    approx((400 - 252) / 252, 0.587, 0.001) && t1.includes("(400 − 252) ÷ 252 = 0,587") && t1.includes("+58,7 procent"),
    "(400 − 252) ÷ 252 = 0,5873 ⇒ +58,7 % (bokens 1999 → 2002–04)",
  );
  kontroll(
    "D04 korrelationsmatrisens normalvärden + mittpunkt",
    approx((0.3 + 0.6) / 2, 0.45, 0.0001) && t1.includes("+0,3 till +0,6") && t1.includes("mittpunkt +0,45") &&
      t1.includes("−0,5 till −0,7") && t1.includes("−0,4 till −0,6"),
    "(0,3 + 0,6) ÷ 2 = 0,45 · råvaror–obl −0,5..−0,7 · dollar–råvaror −0,4..−0,6 (murphy-modellen)",
  );
  kontroll(
    "D05 kvot-exemplet — PÅHITTAT och märkt",
    approx(264 / 114, 2.32, 0.005) && approx(264 / 114 / 2, 1.16, 0.01) &&
      t1.includes("264/114 = 2,32") && t1.includes("runt +16 procent") && t1.includes("PÅHITTADE"),
    "264/114 = 2,3158 ⇒ +15,8 % ≈ +16 % relativt — övningstalet tydligt märkt",
  );
  kontroll(
    "D06 rullande fönster + isglass-fällan",
    t1.includes("60–120 handelsdagar") && t1.includes("isglass"),
    "korrelation på FÖRÄNDRINGAR i 60–120 dagars fönster — aldrig nivåer",
  );
  kontroll(
    "D07 gränsvakter i TEXT (intermarket)",
    ["V10", "V07", "V12", "V01", "AKM1", "AK1TS", "OSATT", "Malkiel"].every((g) => t1.includes(g)),
    "dokumenterade gränser bärs i text med attribution (AKM1-variablerna + AK1TS + EMH-grannen)",
  );
  // D08–D09: registerdrivet — kategoriantal och kapitel/quiz LIVE.
  const bokAntal = KURSREGISTER.filter((r) => r.kategori === "BOKMASTER").length;
  kontroll(
    "D08 registerdrivet kategoriantal (monster 1)",
    bokAntal > 0 && t1.includes("I kategorin bokmaster finns " + bokAntal + " kurser"),
    "BOKMASTER = " + bokAntal + " LIVE ur KURSREGISTER",
  );
  const imk = KURSREGISTER.find((r) => r.slug === "intermarket-analysis");
  kontroll(
    "D09 kapitel/quiz LIVE (monster 1)",
    !!imk && imk.kapitel === 16 && imk.quiz === 48 &&
      t1.includes("Kursen på " + imk.kapitel + " kapitel (" + imk.quiz + " quiz-frågor)"),
    "intermarket-analysis = " + (imk ? imk.kapitel + " kap/" + imk.quiz + " quiz" : "?") + " (registerdrivet, LIVE)",
  );

  // ── Monster 2: storhetssprånget (Collins egna forskningstal) ──
  kontroll(
    "D10 urvalstratten 1 435 → 126 → 19 → 11",
    126 / 1435 > 0.087 && 126 / 1435 < 0.089 && approx(11 / 1435, 0.0077, 0.0005) &&
      t2.includes("1 435") && t2.includes("8,8 procent") && t2.includes("0,8 procent"),
    "126 ÷ 1 435 = 8,8 % · 11 ÷ 1 435 = 0,77 % ≈ 0,8 % av universum",
  );
  kontroll(
    "D11 snittet 7x på 15 år ⇒ årsräntan",
    approx(7 ** (1 / 15), 1.1385, 0.0005) && approx(7 ** (1 / 15) - 1, 0.139, 0.001) &&
      t2.includes("7^(1/15) = 1,1385") && t2.includes("13,9 procent per år"),
    "7^(1/15) = 1,13853 ⇒ +13,9 %/år",
  );
  kontroll(
    "D12 Circuit City 18,5x ⇒ årsräntan",
    approx(18.5 ** (1 / 15), 1.2148, 0.0005) && approx(18.5 ** (1 / 15) - 1, 0.215, 0.001) &&
      t2.includes("18,5^(1/15) = 1,2148") && t2.includes("21,5 procent per år"),
    "18,5^(1/15) = 1,21478 ⇒ +21,5 %/år",
  );
  kontroll(
    "D13 forskningsdesignen 11 + 11 + 6",
    11 + 11 + 6 === 28 && t2.includes("11 + 11 + 6 = 28") && t2.includes("28 bolag"),
    "28-bolagsdesignen: 11 great + 11 jämförelser + 6 icke-beständiga",
  );
  kontroll(
    "D14 nivå 5-talen — interna VD:ar",
    approx(10 / 11, 0.91, 0.005) && t2.includes("10 ÷ 11 = 0,91") && t2.includes("91 procent") &&
      t2.includes("sex gånger oftare") && t2.includes("1975–1991"),
    "10 ÷ 11 = 0,909 ⇒ 91 % interna mot 6x externa räddare · Mockler 1975–1991",
  );
  kontroll(
    "D15 övningstalen märkta + gränsvakter (monster 2)",
    ["PÅHITTADE", "V13–V15", "V07–V09", "V01–V02", "tolv kvartal", "survivorship", "FYRA år"].every((g) => t2.includes(g)),
    "påhittade markörer + AKM1-mappningen + kontroversens survivorship-varning i text",
  );
  const g2g = KURSREGISTER.find((r) => r.slug === "good-to-great");
  kontroll(
    "D16 kapitel/quiz LIVE (monster 2)",
    !!g2g && g2g.kapitel === 15 && g2g.quiz === 45 &&
      t2.includes("Kursen på " + g2g.kapitel + " kapitel (" + g2g.quiz + " quiz-frågor)"),
    "good-to-great = " + (g2g ? g2g.kapitel + " kap/" + g2g.quiz + " quiz" : "?") + " (registerdrivet, LIVE)",
  );
  // D17: fantomslug — båda monsters kurslänkar + källor äkta mot registret.
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  let fantomer = [];
  for (const monster of BOKMASTAR2_MONSTER) {
    const svaret = monster.bygga(KURSREGISTER);
    const kursSlugs = svaret.handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", ""));
    fantomer = [...fantomer, ...kursSlugs, ...svaret.kallor.map((x) => x.slug).filter(Boolean)].filter((s) => !slugSet.has(s));
  }
  kontroll("D17 fantomslug (båda monsters)", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : "12 aktiveringar + knapplänkar alla äkta");
  // D18: källmärkning + motfråga/fördjupning per monster.
  const s1 = BOKMASTAR2_MONSTER[0].bygga(KURSREGISTER);
  const s2 = BOKMASTAR2_MONSTER[1].bygga(KURSREGISTER);
  kontroll(
    "D18 källmärkning + motfråga + fördjupning",
    s1.handlings.filter((h) => h.lank.startsWith("fragor:")).length >= 3 &&
      s2.handlings.filter((h) => h.lank.startsWith("fragor:")).length >= 3 &&
      s1.motfraga?.text === "Vad är korrelationsrisken?" && s1.fordjupa?.lank === "/kurser/intermarket-analysis" &&
      s2.motfraga?.text === "Vad är en moat?" && s2.fordjupa?.lank === "/kurser/good-to-great",
    "fragor-knappar ≥ 3 per monster · motfrågor till grannarna · fördjupa = primärkurserna",
  );
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är intermarket-analys?", "vad är intermarket analysen?", "vad är intermarket kedjan?",
    "vad är intermarket modellen?", "vad är murphy?", "vem är murphy?", "vad är murphy grafen?",
    "vad är fyra tillgångsslag?", "vad är tillgångsslagen?", "vad är normalförhållandet?",
    "vad är normalförhållande?", "vad är flight to quality?", "vad är crb index?",
    "vad är råvarufronten?", "vad är inflationens länk?", "vad är sektorsrotation?",
    "vad är rotationen?", "vad är regimskiftet?", "vad är regimelarmet?", "vad är desinflation?",
    "vad är desinflationsregimen?", "vad är korrelationsmatris?",
    "vad är bra till bäst?", "vad är good to great?", "vad är storhetssprånget?",
    "vad är collins?", "vem är jim collins?", "vad är nivå 5?", "vad är nivå 5 ledarskap?",
    "vad är nivå fem?", "vad är fem nivåer?", "vad är en igelkott?", "vad är igelkotten?",
    "vad är igelkottskonceptet?", "vad är hedgehog?", "vad är hedgehog konceptet?",
    "vad är tre cirklar?", "vad är flugsvärmen?", "vad är svänghjulet?", "vad är svänghjul?",
    "vad är domedagsloopen?", "vad är profit per x?", "vad är nämnaren?",
    "vad är fönstret och spegeln?", "vad är stockdale?", "vad är stockdale paradoxen?",
    "vad är en karismatiker?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltBokmastar2(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är teknisk analys?",        // basens monster (indikatorfamiljen)
    "vad är korrelationsrisken?",    // marknadsrytm (SIST-grannen)
    "vad är en bullmarknad?",        // marknadsrytm
    "vad är valutarisk?",            // valutamekanik
    "vad är inflation?",             // makro
    "vad är deflation?",             // makro
    "vad är råvaror?",               // etfmekanik (terminsfamiljen)
    "vad är en moat?",               // moatdjup + basen
    "vad är guld?",                  // naket guld lämnas öppet (dokumenterat)
    "vad är böcker?",                // basens böcker-monster («murphy för bok?»
                                     // vinner OCKSÅ basen i KEDJAN — deras
                                     // kärnord «bok» + de ligger före; naket
                                     // «murphy» är detta lagers, kedjetestets
                                     // A-fall vaktar ordningen)
  ];
  const stulna = gransor.filter((f) => svaraLokaltBokmastar2(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2: juridikgrind — pedagogisk text, aldrig rekommendation ──────────
{
  const t1 = BOKMASTAR2_MONSTER[0].bygga(KURSREGISTER).text;
  const t2 = BOKMASTAR2_MONSTER[1].bygga(KURSREGISTER).text;
  for (const [namn, t] of [["intermarket", t1], ["storhet", t2]]) {
    const paddagogisk = t.includes("utbildning") && t.includes("inga placeringstips");
    const pahittade = t.includes("PÅHITTADE") || t.includes("påhittade") || t.includes("påhittat");
    const histMark = t.includes("historiska") || t.includes("historisk");
    const ingaRad = !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t);
    kontroll("F2 juridikgrind (" + namn + ")", paddagogisk && pahittade && histMark && ingaRad, "pedagogisk + påhittade/historiska markörer + 0 rådsformuleringar");
  }
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL hos detta lager ────────
{
  const grannar = [
    "vad är banklönsamheten?", "vad är cvar?", "vad är krischecklistan?", // slutstenarna
    "vad är oshaughnessy?", "vad är en decil?", "vad är kungafaktorn?",   // faktorfadrarna (direkt föregångaren)
    "vad är greenblatts formel?", "vad är magic formula?",                // faktorfadrarna
    "vad är trending value?", "vad är story stocks?",                     // faktorfadrarna
    "vad är årsrapportering?", "vad är en portföljreview?",              // arsreview
    "vad är evighetskapitalet?",                                          // ägarslut-familjen (PE-stängningen)
    "vad är metcalfes lag?", "vad är en tvåsidig marknad?",               // natverkseffekter
    "vad är enhetsekonomin?", "vad är konverteringstestet?",             // enhetsekonomi
    "vad är walk forward?", "vad är valideringsfönstret?",               // valideringsfonster
    "vad är senioritetsordningen?", "vad är valutasäkringen?",           // skuldordning
    "vad är tulpanmanin?", "vad är special situations?",                  // bokmastar (kategori-syskonet!)
  ];
  const stulna = grannar.filter((f) => svaraLokaltBokmastar2(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "bokmastar2");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är intermarket-analys?", "vad är normalförhållandet?", "vad är sektorsrotation?",
    "vad är bra till bäst?", "vad är good to great?", "vad är en igelkott?",
    "vad är flugsvärmen?", "vad är svänghjulet?", "vad är stockdale-paradoxen?",
    "vad är profit per x?",
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
  const svarar = kanoniska.map((f) => svaraLokaltBokmastar2(f, KURSREGISTER) !== null);
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
  const mina = BOKMASTAR2_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-bokmastar2-fragor.ts",
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
  const posFaktor = rad.indexOf("svaraLokaltFaktorfadrarna(");
  const posMin = rad.indexOf("svaraLokaltBokmastar2(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("bokmastar2 saknas i kedjeraden");
  if (posFaktor === -1 || posMin === -1 || posRytm === -1 || !(posFaktor < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat faktorfadrarna < bokmastar2 < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-bokmastar2-fragor"')) FEL.push("importen saknas");
  kontroll(
    "L widget-synk — efter faktorfadrarna, FÖRE marknadsrytm (deras SIST)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "90:e motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN v206-u1 bokmastar2 (intermarket-kedjan + storhetssprånget — 12 BOKMASTER-aktiveringar, 53 → 41): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
