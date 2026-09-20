/**
 * TESTA AI-MENTORN — HÄNDELSEMOTOR (s6-u2, fönster 29: lanseringsdramat
 * [v16 primär + kt-04 + v13 + v01 + kt-05 som källor] + avtalsmekaniken
 * [v17 primär + v03 + kt-07 + am-01 + v16 som källor] — KATALYSATOR fullt
 * länkad 11/11).
 *
 * Kör:  node verktyg/testa-ai-mentor-handelsemotor.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets två förhandsfrågor (se
 * src/lib/ai-mentor-handelsemotor-fragor.ts) med bevakning:
 *   A   6 kanoniska ingångar (sell the news/rnpv/pdufa +
 *       avsiktsförklaring/take or pay/budpremien) → rätt ämne, primärkälla,
 *       FLERKÄLLA (kallor = 5 + numrerad Källor-rad) och ≥ 4 kurslänkar
 *   A2  MOTORDEFS-position LIVE (index 69, efter tvångsmekanik, FÖRE
 *       marknadsrytm — deras SIST-deklaration) + 191-läget
 *   B   14 felstavade/varierade varianter → samma träff
 *   C   determinism — frågor två gånger ⇒ bitidentiskt svar
 *   D01–D18 aritmetik maskinellt omräknad (faserna 37,5/8,2/−5,0/+2,7 ·
 *       rNPV 2,55 · IV 23 % · nettot 95 och 65,5 % · SAAB 6,1 %/år ·
 *       Sinch −95 % · TCV/ACV 50 · budspreaden 10,0 · Geely 72,3 ·
 *       Medimmune 28,8) + D19 registerdrivna tal (KATALYSATOR LIVE) +
 *       D20 nivåmarkör + D21 fantomslug
 *   E   kanoniska extra-ingångar (verifieringsfasen, förväntanfasen,
 *       hypecykeln, lanseringsfällan, budspreaden, synergierna,
 *       intäktsdelningen, avtalsstocken, avtalsvärdet, loi, mou)
 *   F   12 null-gränser (sondens dokumenterade ägarpol): naket
 *       «produktlansering/-ingar» + «partnerskap» + «katalysator» +
 *       «katalysatorkalendern» + «spread» → basen · «s-kurvan» →
 *       tillväxtdjupet · «pipelinen» → sektorskola2 · «merger arbitrage»
 *       → bokmastaren · «guidningen» → nyaterritorierna — lämnas NULL
 *   F2  juridikgrind — pedagogiskt, aldrig råd
 *   G   ANTISTÖLD — grannlagers kanoniska (marginalhandeln,
 *       optionsförfallet, co-investeringen, aktivisten, straddeln,
 *       regulatorisk risk, kundkoncentration, förväntningsanalys,
 *       utspädning, kalibrering, magnetkartan, volatilitetsdraget) → NULL
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS — framtidsäker
 *       när syskonens fönsterlager wireas) + H2 med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER tvångsmekanik och FÖRE marknadsrytm
 *       (deras SIST-deklaration) i chat-widget.tsx:s kedja
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-handelsemotor.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltHandelsemotor, HANDELSEMOTOR_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-handelsemotor-fragor.ts")).href
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

// ── FALL A: sex kanoniska ingångar, två monster, flerkällskrav ───────────────
const NYA = [
  { fraga: "Vad är sell the news?", amne: "lanseringsdramat", slug: "v16-produktlanseringar" },
  { fraga: "Vad är rnpv?", amne: "lanseringsdramat", slug: "v16-produktlanseringar" },
  { fraga: "Vad är pdufa?", amne: "lanseringsdramat", slug: "v16-produktlanseringar" },
  { fraga: "Vad är en avsiktsförklaring?", amne: "avtalsmekaniken", slug: "v17-avtal-partnerskap" },
  { fraga: "Vad är take or pay?", amne: "avtalsmekaniken", slug: "v17-avtal-partnerskap" },
  { fraga: "Vad är budpremien?", amne: "avtalsmekaniken", slug: "v17-avtal-partnerskap" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltHandelsemotor(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " händelsemotor", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length === 5;
  const kallradOk = svar.text.includes("📖 Källor (5)");
  const primarForst = svar.kallor?.[0]?.slug === f.slug;
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/")).length;
  const fragorKnappar = svar.handlings.filter((h) => h.lank.startsWith("fragor:")).length;
  kontroll(
    nr + " kanonisk ingång «" + f.fraga + "»",
    amneOk && kallaOk && kallorFinns && kallradOk && primarForst && kurslankar >= 4 && fragorKnappar >= 2,
    "ämne=" + svar.amne + " · primär=" + svar.kalla.slug + " · källor=" + (svar.kallor?.length ?? 0) +
      " · kurslänkar=" + kurslankar + " · fragor-knappar=" + fragorKnappar,
  );
});

// ── FALL A2: MOTORDEFS-position LIVE ur kedjetestet ─────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const ix = defs.findIndex((d) => d.namn === "handelsemotor");
  const rytmIx = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2 MOTORDEFS — händelsemotor wiread med antal 2, index " + ix,
    ix !== -1 && defs[ix].antal === 2 && defs[ix - 1]?.namn === "tvangsmekanik" && rytmIx > ix,
    "efter " + (defs[ix - 1]?.namn ?? "?") + ", marknadsrytm (SIST) efter mig på " + rytmIx + " · motorer totalt " + defs.length +
      " (syskon-tålig: fönster 30:s lönsamhetsgrund wiread efter mig är laglig)",
  );
  kontroll(
    "A2b MONSTER-ANTAL — lagret bär exakt 2 monsters (TOTALT ≥ 191)",
    HANDELSEMOTOR_MONSTER.length === 2 && defs.reduce((s, d) => s + d.antal, 0) >= 191,
    "lager " + HANDELSEMOTOR_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är sell the news", amne: "lanseringsdramat" },            // utan frågetecken
  { fraga: "förklara sell the news", amne: "lanseringsdramat" },
  { fraga: "vad är buy the rumor?", amne: "lanseringsdramat" },
  { fraga: "vad är en RNPV?", amne: "lanseringsdramat" },                 // versaler
  { fraga: "vad är verifieringsfasen?", amne: "lanseringsdramat" },
  { fraga: "vad är lanseringsfällan?", amne: "lanseringsdramat" },
  { fraga: "vad är hypecykeln?", amne: "lanseringsdramat" },
  { fraga: "vad är en avsiktsförklaring", amne: "avtalsmekaniken" },
  { fraga: "vad är ett ramavtal?", amne: "avtalsmekaniken" },
  { fraga: "vad är tcv?", amne: "avtalsmekaniken" },
  { fraga: "vad är budspreaden?", amne: "avtalsmekaniken" },
  { fraga: "vad är synergifällan?", amne: "avtalsmekaniken" },
  { fraga: "vad är intäktsdelningen?", amne: "avtalsmekaniken" },
  { fraga: "vad är avtalsstocken?", amne: "avtalsmekaniken" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltHandelsemotor(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är sell the news?", "vad är rnpv?", "vad är verifieringsfasen?",
    "vad är en avsiktsförklaring?", "vad är take or pay?", "vad är budpremien?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltHandelsemotor(f, KURSREGISTER);
    const b = svaraLokaltHandelsemotor(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (kursernas EGNA modelltal) ────────
{
  const t1 = svaraLokaltHandelsemotor("vad är sell the news?", KURSREGISTER).text;
  const t2 = svaraLokaltHandelsemotor("vad är en avsiktsförklaring?", KURSREGISTER).text;

  // D01: förväntanfasen 80 → 110 = +37,5 %
  kontroll("D01 förväntanfasen", approx((110 / 80 - 1) * 100, 37.5, 0.05) && t1.includes("37,5"), "80 → 110 = +37,5 %");
  // D02: eventveckan 110 → 119 = +8,2 %
  kontroll("D02 eventveckan", approx((119 / 110 - 1) * 100, 8.2, 0.05) && t1.includes("8,2"), "110 → 119 = +8,2 %");
  // D03: månaden efter 119 → 113 = −5,0 %
  kontroll("D03 månaden efter", approx((113 / 119 - 1) * 100, -5.0, 0.05) && t1.includes("5,0"), "119 → 113 = −5,0 %");
  // D04: netto mot december 113/110 = +2,7 %
  kontroll("D04 netto", approx((113 / 110 - 1) * 100, 2.7, 0.05) && t1.includes("2,7"), "113/110 = +2,7 %");
  // D05: rNPV 0,85 × 3,0 = 2,55
  kontroll("D05 rnpv", approx(0.85 * 3.0, 2.55, 0.001) && t1.includes("2,55"), "0,85 × 3,0 = 2,55 miljarder");
  // D06: IV 80/√12 ≈ 23 %
  kontroll("D06 iv", approx(80 / Math.sqrt(12), 23.09, 0.1) && t1.includes("23"), "80/√12 ≈ 23 procents rörelse");
  // D07: lanseringsnettot 275 − 180 = 95
  kontroll("D07 nettot", 275 - 180 === 95 && t1.includes("95"), "275 − 180 = 95");
  // D08: kostnadsandelen 180/275 = 65,5 %
  kontroll("D08 kostnadsandelen", approx((180 / 275) * 100, 65.5, 0.05) && t1.includes("65,5"), "180/275 = 65,5 %");
  // D09: SAAB (450/250)^(1/10) = 6,1 %/år
  kontroll("D09 saab", approx((Math.pow(450 / 250, 1 / 10) - 1) * 100, 6.05, 0.05) && t1.includes("6,1"), "(450/250)^(1/10) = 6,1 %/år");
  // D10: Sinch −95 %
  kontroll("D10 sinch", approx((30 / 600 - 1) * 100, -95, 0.1) && t1.includes("95 procent"), "600 → 30 = −95 %");
  // D11: TCV/ACV 500/10 = 50
  kontroll("D11 tcv-acv", 500 / 10 === 50 && t2.includes("50"), "500 över 10 år ⇒ årsvärde 50");
  // D12: budspreadens förväntade värde 0,90 × 13 − 0,10 × 17 = 10,0
  kontroll("D12 budspreaden", approx(0.9 * 13 - 0.1 * 17, 10.0, 0.001) && approx(0.9 * 13, 11.7, 0.001) && approx(0.1 * 17, 1.7, 0.001) && t2.includes("10,0") && t2.includes("11,7"), "0,90 × 13 − 0,10 × 17 = 10,0");
  // D13: Geely-rabatten 1 − 1,8/6,5 = 72,3 %
  kontroll("D13 geely", approx((1 - 1.8 / 6.5) * 100, 72.3, 0.05) && t2.includes("72,3"), "1 − 1,8/6,5 = 72,3 %");
  // D14: Medimmune 4,5/15,6 = 28,8 %
  kontroll("D14 medimmune", approx((4.5 / 15.6) * 100, 28.8, 0.05) && t2.includes("28,8"), "4,5/15,6 = 28,8 %");
  // D15: LOI-andelen 30–50 % i text
  kontroll("D15 loi", t2.includes("30–50"), "30–50 procent av avsiktsförklaringar leder till avtal");
  // D16: gränsvakterna — orden som fångas i TEXT men ALDRIG som kärnord
  const gransVakter = ["produktlansering", "partnerskap", "S-kurva", "pipelinen", "katalysatorkalendern", "merger arbitrage"];
  kontroll("D16 gränsvakter i TEXT", gransVakter.every((g) => t1.includes(g) || t2.includes(g)), "dokumenterade gränser bärs i text med attribution");
  // D17: registerdrivna tal LIVE (klippskydd)
  const ktAntal = KURSREGISTER.filter((r) => r.kategori === "KATALYSATOR").length;
  kontroll(
    "D17 registerdrivna tal",
    t1.includes("finns " + ktAntal + " kurser") && t2.includes("finns " + ktAntal + " kurser"),
    "KATALYSATOR " + ktAntal + " — LIVE ur registret",
  );
  // D18: nivåmarkören registerdragen
  const v16 = KURSREGISTER.find((r) => r.slug === "v16-produktlanseringar");
  const v17 = KURSREGISTER.find((r) => r.slug === "v17-avtal-partnerskap");
  kontroll(
    "D18 nivåmarkör",
    t1.includes(v16.niva.toLowerCase() + " nivå") && t2.includes(v17.niva.toLowerCase() + " nivå"),
    v16.niva.toLowerCase() + " · " + v17.niva.toLowerCase() + " — ur registerfälten",
  );
  // D19: fantomslugar — alla källor och kurslänkar finns i registret
  const slugs = new Set(KURSREGISTER.map((r) => r.slug));
  const allaSlugs = [
    ...HANDELSEMOTOR_MONSTER.flatMap((m) => (m.bygga(KURSREGISTER).kallor ?? []).map((k) => k.slug)),
    ...HANDELSEMOTOR_MONSTER.flatMap((m) => m.bygga(KURSREGISTER).handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.slice("/kurser/".length))),
  ];
  const fantomer = allaSlugs.filter((s) => s && !slugs.has(s));
  kontroll("D19 fantomslug", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : allaSlugs.length + " äkta slug:ar");
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är buy the rumor?", "vad är verifieringsfasen?", "vad är förväntanfasen?",
    "vad är pdufa-datum?", "vad är penetreringen?", "vad är lanseringsdagen?",
    "vad är hypecykeln?", "vad är lanseringsfällan?",
    "vad är ett loi?", "vad är en mou?", "vad är synergierna?",
    "vad är avtalsvärdet?", "vad är intäktsdelning?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltHandelsemotor(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är en produktlansering?", "vad är produktlanseringar?",
    "vad är partnerskap?", "vad är en katalysator?",
    "vad är katalysatorkalendern?", "vad är spread?",
    "vad är s-kurvan?", "vad är pipelinen?",
    "vad är merger arbitrage?", "vad är guidningen?",
    "vad är en pipeline?", "vad är ryktet?",
  ];
  let stulna = [];
  for (const f of gransor) if (svaraLokaltHandelsemotor(f, KURSREGISTER)) stulna.push(f);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");

  // F2: juridikgrind — pedagogiskt, aldrig råd
  const t = svaraLokaltHandelsemotor("vad är sell the news?", KURSREGISTER).text +
    svaraLokaltHandelsemotor("vad är en avsiktsförklaring?", KURSREGISTER).text;
  const radfraser = [/köp\s+denna/i, /sälj\s+denna/i, /du\s+bör\s+köpa/i, /rekommenderar\s+att\s+du/i, /borde\s+investera/i];
  const radTräff = radfraser.filter((rx) => rx.test(t));
  kontroll(
    "F2 juridikgrind",
    radTräff.length === 0 && t.includes("påhittade") && t.toLowerCase().includes("inga placeringstips"),
    radTräff.length ? "rådfras: " + radTräff.join(", ") : "utbildning + PÅHITTADE-markör + disclaimer",
  );
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL ────────────────────────
{
  const grannar = [
    "vad är marginalhandeln?", "vad är optionsförfallet?", "vad är magnetkartan?",
    "vad är en co-investering?", "vad är aktivisten?", "vad är guidningen?",
    "vad är en straddle?", "vad är binomialträdet?",
    "vad är regulatorisk risk?", "vad är kundkoncentration?",
    "vad är förväntningsanalys?", "vad är kalibrering?",
    "vad är utspädning?", "vad är volatilitetsdraget?",
  ];
  let stulna = [];
  for (const f of grannar) if (svaraLokaltHandelsemotor(f, KURSREGISTER)) stulna.push(f);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kedjaKalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kedjaKalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));
  const MOTORER = [];
  for (const d of defs.filter((d) => d.namn !== "handelsemotor")) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är sell the news?", "vad är rnpv?", "vad är verifieringsfasen?",
    "vad är en avsiktsförklaring?", "vad är take or pay?", "vad är budpremien?",
    "vad är budspreaden?", "vad är avtalsstocken?",
  ];
  let skuggor = [];
  for (const f of kanoniska) {
    for (const m of MOTORER) {
      if (m.fnk(f, KURSREGISTER)) { skuggor.push(f + "→" + m.namn); break; }
    }
  }
  kontroll(
    "H ägar-invariant — " + kanoniska.length + " kanoniska NULL genom " + MOTORER.length + " motorer (LIVE ur MOTORDEFS)",
    skuggor.length === 0,
    skuggor.length ? "SKUGGAD: " + skuggor.join(", ") : "framtidsäker — nya syskon flyttar inte mina frågor",
  );
  // H2: MED detta lager ⇒ svar
  const svarar = kanoniska.map((f) => svaraLokaltHandelsemotor(f, KURSREGISTER) !== null);
  kontroll("H2 med lager — samtliga kanoniska svarar", svarar.every(Boolean), svarar.filter(Boolean).length + "/" + svarar.length);
}

// ── FALL J: KÄRNORDSDISJUNKTION LIVE ────────────────────────────────────────
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
  const mina = HANDELSEMOTOR_MONSTER.flatMap((m) => m.karnord.map(diafri));
  const filer = readdirSync(join(ROT, "src/lib")).filter((f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-handelsemotor-fragor.ts");
  let kollisioner = [];
  for (const fil of filer) {
    const kalla = readFileSync(join(ROT, "src/lib", fil), "utf8");
    for (const match of kalla.matchAll(/karnord:\s*\[([^\]]*)\]/g)) {
      for (const rm of match[1].matchAll(/"([^"]+)"/g)) {
        const a = diafri(rm[1]);
        for (const b of mina) {
          if (a === b) { kollisioner.push(b + " = " + fil + "«" + rm[1] + "»"); continue; }
          if (a.includes(" ") || b.includes(" ")) continue;
          const tolerans = Math.max(a.length, b.length) <= 3 ? 0 : (Math.min(a.length, b.length) <= 7 ? 1 : 2);
          const d = tavstand(a, b);
          if (d <= Math.min(tolerans, 2) && a !== b) kollisioner.push("tav " + d + ": " + b + " ~ " + fil + "«" + rm[1] + "»");
        }
      }
    }
  }
  kontroll("J kärnordsdisjunktion — " + mina.length + " kärnord mot " + filer.length + " andra lager", kollisioner.length === 0, kollisioner.length ? kollisioner.slice(0, 5).join(" | ") : "0 kollisioner");
}

// ── FALL L: widget-synk — import + kedjeposition ────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rader = widget.split("\n").filter((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const FEL = [];
  if (rader.length !== 1) FEL.push("hittade " + rader.length + " kedjerader (väntat exakt 1)");
  const rad = rader[0] ?? "";
  const posTvang = rad.indexOf("svaraLokaltTvangsmekanik(");
  const posMin = rad.indexOf("svaraLokaltHandelsemotor(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("händelsemotor saknas i kedjeraden");
  if (posTvang === -1 || posMin === -1 || posRytm === -1 || !(posTvang < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat tvångsmekanik < händelsemotor < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-handelsemotor-fragor"')) FEL.push("importen saknas");
  kontroll(
    "L widget-synk — efter tvångsmekanik, FÖRE marknadsrytm (deras SIST)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "71:a motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u2 fönster 29 (händelsemotor): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
