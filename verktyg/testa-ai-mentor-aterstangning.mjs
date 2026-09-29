/**
 * TESTA AI-MENTORN — ÅTERSTÄNGNINGEN (s6-u2, fönster 38: vr-10 ENHETS-
 * MULTIPLAR [primär + vr-03 + vr-06 + vr-08 + tx-06 + se-20 + se-21 +
 * se-18 + am-08 som källor] ⇒ KATEGORISTÄNGNING VÄRDERING 11/11 + ud-10
 * EX-DAGENS MEKANIK [primär + ud-07 + od-05 + am-06 + am-07 + km-052 +
 * ud-09 + ud-01 + ud-04 som källor] ⇒ UTDELNINGSSTRATEGI 11/11 — båda
 * andra stängningar: först stängda av vr-09/ud-09, återöppnade av spår
 * 5:s omgång-31-nyfödda, stängda igen av detta lager).
 *
 * Kör:  node verktyg/testa-ai-mentor-aterstangning.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för återstängnings-frågorna (se
 * src/lib/ai-mentor-aterstangning-fragor.ts) med bevakning:
 *   A   4 kanoniska ingångar (2/monster) → rätt ämne, primärkälla,
 *       FLERKÄLLA (kallor = 9 + numrerad Källor-rad) och ≥ 8 kurslänkar
 *       + ≥ 3 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter peibslutet, FÖRE marknadsrytm —
 *       deras SIST-deklaration); A2b monster-antal + syskon-tåligt
 *       TOTALT-tak
 *   B   16 felstavade/varierade varianter → rätt monster
 *   C   determinism — frågor två gånger ⇒ bitidentiskt svar
 *   D01–D25 aritmetik maskinellt omräknad (gruvans ton: 20 000/9,0 =
 *       2 222 mot 25 000/8,75 = 2 857 · EV/EBITDA 11,1/19,0 · abonnenten
 *       83/50 mån ⇒ 5 000/2 250 · kWh 3 504/2 190 GWh ⇒ 3,42/5,48 ·
 *       Lindvalls Livs 115,50 / −98 kr / 3,75 % / 112,50) + gränsvakter
 *       i TEXT + registerdrivna kontroller (VÄRDERING/UTDELNINGS-
 *       STRATEGI-antal LIVE, nivåmarkörer) + fantomslug
 *   E   kanoniska extra-ingångar (kapacitetston, uttagsgraden, ex-spärren,
 *       äganderättsdagen, totalavkastningsindex, …)
 *   F   null-gränser (dokumenterad ägarpol): naket «ex-dagen»/
 *       «avstämningsdag»/«utdelningskalendern» → utdelningskalendern
 *       (ud-07 äger DATUMEN — därför är detta lagers kärnord
 *       SAMMANSATTA) · «CAC» → tx-06 · «tobins q» → vr-08 · naket «ton»
 *       → sektorfamiljerna · «kortläge» → am-06 · «indexomläggning» →
 *       am-07 · «isk» → km-052 — lämnas ifred
 *   F2  juridikgrind — pedagogisk text, PÅHITTAD-markör, inga råd
 *   G   ANTISTÖLD — grannlagers kanoniska (inkl. FÖNSTRETS SYSKON:
 *       u1:s indexinklusion, u3:s PE/IB-trion, öppna ytor mt-09/bk-09)
 *       ⇒ NULL hos mig
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta
 *       lager (motorlistan läses LIVE ur kedjetestets MOTORDEFS) + H2
 *       med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE (kommentar-strippad — omgång 35:s läxa)
 *   L   widget-synk — import + EFTER peibslutet och FÖRE marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-aterstangning.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltAterstangning, ATERSTANGNING_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-aterstangning-fragor.ts")).href
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

// ── FALL A: fyra kanoniska ingångar (2 per monster), flerkällskrav ──────────
// OBS M2:s titel-frågor med naket «ex-dagen»/«avstämningsdag» ägs i HELA
// kedjan av utdelningskalendern (ud-07:s dokumenterade datumägarskap) —
// därför lyder M2:s kanoniska frågor på MEKANIKEN (teoretisk ex-kurs,
// ex-spärren), aldrig på nakna datumord (F-fallet bevisar NULL hos mig).
const NYA = [
  { fraga: "Vad är en enhetsmultipl?", amne: "enhetsmultipl", slug: "vr-10-enhetsmultiplar" },
  { fraga: "Vad är EV per ton?", amne: "enhetsmultipl", slug: "vr-10-enhetsmultiplar" },
  { fraga: "Vad är den teoretiska ex-kursen?", amne: "exdagsmekanik", slug: "ud-10-ex-dagens-mekanik" },
  { fraga: "Vad är ex-spärren?", amne: "exdagsmekanik", slug: "ud-10-ex-dagens-mekanik" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltAterstangning(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " aterstangning", false, "inget lokalt svar på: '" + f.fraga + "'");
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
    amneOk && kallaOk && kallorFinns && kallradOk && primarForst && kurslankar >= 8 && fragorKnappar >= 3,
    "ämne=" + svar.amne + " · primär=" + svar.kalla.slug + " · källor=" + (svar.kallor?.length ?? 0) +
      " · kurslänkar=" + kurslankar + " · fragor-knappar=" + fragorKnappar,
  );
});

// ── FALL A2: MOTORDEFS-position LIVE ur kedjetestet ─────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const ix = defs.findIndex((d) => d.namn === "aterstangning");
  const ixPeib = defs.findIndex((d) => d.namn === "peibslutet");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2 MOTORDEFS — aterstangning wiread med antal 2, index " + ix,
    ix !== -1 && defs[ix].antal === 2 && ixPeib !== -1 && ixRytm !== -1 && ixPeib < ix && ix < ixRytm,
    "efter peibslutet (" + ixPeib + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer totalt " + defs.length,
  );
  kontroll(
    // Fönster 38: aterstangning +2 (detta lager) ⇒ 237 — syskon-tåligt tak:
    // MINST 237; kommande fönsters motorer (mt-09/bk-09) bärs av sina egna
    // leveranser. Kedjetestets TOTALT-kommentar är sanningen.
    "A2b MONSTER-ANTAL — lagret bär exakt 2 monsters (TOTALT ≥ 237)",
    ATERSTANGNING_MONSTER.length === 2 && defs.reduce((s, d) => s + d.antal, 0) >= 237,
    "lager " + ATERSTANGNING_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ rätt monster ───────────────────
const VARIANTER = [
  { fraga: "vad är enhetsmultipln?", amne: "enhetsmultipl" },
  { fraga: "vad ar en enhetsmultipl?", amne: "enhetsmultipl" },        // utan diakrit
  { fraga: "vad är EV per abonnent?", amne: "enhetsmultipl" },
  { fraga: "vad är priset per ton?", amne: "enhetsmultipl" },
  { fraga: "vad är en kapacitetston?", amne: "enhetsmultipl" },
  { fraga: "vad är uttagsgraden?", amne: "enhetsmultipl" },
  { fraga: "vad är levererade kilowattimmar?", amne: "enhetsmultipl" },
  { fraga: "vad är den döda enheten?", amne: "enhetsmultipl" },
  { fraga: "vad är en ex-kurs?", amne: "exdagsmekanik" },
  { fraga: "vad är ex-kurser?", amne: "exdagsmekanik" },               // plural
  { fraga: "vad är äganderättsdagen?", amne: "exdagsmekanik" },
  { fraga: "vad är utdelningsdagen?", amne: "exdagsmekanik" },
  { fraga: "vad är utdelningsmekaniken?", amne: "exdagsmekanik" },
  { fraga: "vad är kursjusteringen?", amne: "exdagsmekanik" },
  { fraga: "vad är frukosthandeln?", amne: "exdagsmekanik" },
  { fraga: "vad är totalavkastningsindex?", amne: "exdagsmekanik" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltAterstangning(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är en enhetsmultipl?", "vad är ev per ton?", "vad är kapacitetsfaktorn?",
    "vad är den teoretiska ex-kursen?", "vad är ex-spärren?", "vad är frukosthandeln?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltAterstangning(f, KURSREGISTER);
    const b = svaraLokaltAterstangning(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (kursernas EGNA påhittade tal) ────
{
  const t1 = ATERSTANGNING_MONSTER[0].bygga(KURSREGISTER).text;
  kontroll(
    "D01 gruvetiketten A — kapacitetstonen",
    20000 / 10 === 2000 && t1.includes("20 000/10,0 = 2 000"),
    "20 000/10,0 = 2 000 kronor per kapacitetston (Gruva A)",
  );
  kontroll(
    "D02 gruvetiketten B — identisk skylt",
    25000 / 12.5 === 2000 && t1.includes("25 000/12,5 = 2 000"),
    "25 000/12,5 = 2 000 (Gruva B — samma etikett)",
  );
  kontroll(
    "D03 producerad ton A — uttagningen",
    approx(20000 / 9, 2222.2, 0.1) && t1.includes("20 000/9,0 = 2 222"),
    "20 000/9,0 = 2 222 kronor per producerad ton (uttagning 90 %)",
  );
  kontroll(
    "D04 producerad ton B — uttagningen",
    approx(25000 / 8.75, 2857.1, 0.1) && t1.includes("25 000/8,75 = 2 857"),
    "25 000/8,75 = 2 857 kronor per producerad ton (uttagning 70 %)",
  );
  kontroll(
    "D05 skillnaden bakom etiketten",
    approx(2857.14 / 2222.22, 1.2857, 0.001) && t1.includes("knappt 29 procent"),
    "2 857/2 222 = 1,286 ⇒ knappt 29 procent skillnad",
  );
  kontroll(
    "D06 EBITDA A — marginalfällan",
    9.0 * 200 === 1800 && t1.includes("9,0 × 200 = 1 800"),
    "9,0 Mton × 200 kr C1-marginal = 1 800 Mkr EBITDA (Gruva A)",
  );
  kontroll(
    "D07 EV/EBITDA A",
    approx(20000 / 1800, 11.11, 0.01) && t1.includes("20 000/1 800 = 11,1"),
    "20 000/1 800 = 11,1 (Gruva A)",
  );
  kontroll(
    "D08 EBITDA B",
    8.75 * 150 === 1312.5 && t1.includes("8,75 × 150 = 1 312,5"),
    "8,75 Mton × 150 kr = 1 312,5 Mkr EBITDA (Gruva B)",
  );
  kontroll(
    "D09 EV/EBITDA B — 70 % på samma etikett",
    approx(25000 / 1312.5, 19.05, 0.01) && t1.includes("25 000/1 312,5 = 19,0"),
    "25 000/1 312,5 = 19,0 (Gruva B — 70 % olika vid identisk enhetsetikett)",
  );
  kontroll(
    "D10 abonnentens livstid — churn-aritmetiken",
    approx(1 / 0.012, 83.3, 0.1) && t1.includes("1/0,012 = 83") && 1 / 0.02 === 50 && t1.includes("1/0,020 = 50"),
    "1/0,012 = 83 mot 1/0,020 = 50 månader — livstidsintäkt ≈ 5 000 mot 2 250 kr",
  );
  kontroll(
    "D11 kilowattimmens årsproduktion — kapacitetsfaktorn",
    8760 * 0.4 === 3504 && t1.includes("3 504") && 8760 * 0.25 === 2190 && t1.includes("2 190"),
    "8 760 × 0,40 = 3 504 mot 8 760 × 0,25 = 2 190 GWh",
  );
  kontroll(
    "D12 priset per levererad kilowattimme",
    approx(12000e6 / 3504e6, 3.42, 0.005) && t1.includes("3,42") && approx(12000e6 / 2190e6, 5.48, 0.005) && t1.includes("5,48") && t1.includes("60 procent"),
    "12 000 Mkr/3 504 GWh = 3,42 mot /2 190 = 5,48 kr — 60 % på samma skylt",
  );
  kontroll(
    "D13 fällorna i texten",
    ["HETEROGENITET", "MARGINALFÄLLAN", "DEN DÖDA ENHETEN", "ÖVERBYGGD KAPACITET"].every((g) => t1.toUpperCase().includes(g)),
    "fyra fällorna bärs i texten (kursens kap 5)",
  );
  kontroll(
    "D14 gränsvakter M1 i TEXT",
    ["vr-03", "vr-06", "vr-08", "tx-06", "se-20", "se-21", "se-18", "am-08"].every((g) => t1.includes(g)),
    "dokumenterade gränser bärs i text med attribution (grannfamiljerna)",
  );
  const vrAntal = KURSREGISTER.filter((r) => r.kategori === "VÄRDERING").length;
  kontroll(
    "D15 registerdrivet kategoriantal M1",
    vrAntal > 0 && t1.includes("I kategorin värdering finns " + vrAntal + " kurser"),
    "VÄRDERING = " + vrAntal + " LIVE ur KURSREGISTER (kategoristängningen = detta tal)",
  );
  const vr10 = KURSREGISTER.find((r) => r.slug === "vr-10-enhetsmultiplar");
  kontroll(
    "D16 nivåmarkör M1",
    !!vr10 && vr10.niva === "Intermediär" && t1.includes("intermediär nivå"),
    "vr-10 = " + (vr10 ? vr10.niva : "?") + " (registerdrivet, LIVE)",
  );

  const t2 = ATERSTANGNING_MONSTER[1].bygga(KURSREGISTER).text;
  kontroll(
    "D17 teoretisk ex-kurs — Lindvalls Livs (påhittat)",
    120 - 4.5 === 115.5 && t2.includes("120,00 − 4,50 = 115,50"),
    "120,00 − 4,50 = 115,50 — utdelningen tas UR kursen, inget värde försvinner",
  );
  kontroll(
    "D18 frukosthandelns courtage-matematik",
    12000 + 49 === 12049 && t2.includes("12 049") && 11550 - 49 + 450 === 11951 && t2.includes("11 951") &&
      11951 - 12049 === -98 && t2.includes("minus 98 kronor") && 2 * 49 === 98 && t2.includes("2 × 49 = 98"),
    "12 049 in mot 11 951 ut = −98 kr = exakt de två courtagen",
  );
  kontroll(
    "D19 direktavkastningen + den korta positionen",
    approx(4.5 / 120, 0.0375, 0.0001) && t2.includes("4,50/120,00 = 3,75") && 25 * 4.5 === 112.5 && t2.includes("25 utlånade aktier × 4,50 = 112,50"),
    "4,50/120,00 = 3,75 % ur kursen · korta 25 × 4,50 = 112,50 i skyldighet",
  );
  kontroll(
    "D20 procenten + mekanikens bärande delar",
    approx(98 / 12049, 0.0082, 0.0001) && t2.includes("−0,82") && t2.includes("T+2") && t2.includes("totalavkastningsindex"),
    "98/12 049 = 0,82 % · T+2-clearing · indexens två ansikten i text",
  );
  kontroll(
    "D21 gränsvakter M2 i TEXT",
    ["ud-07", "od-05", "am-06", "am-07", "km-052", "ud-09", "ud-01", "ud-04"].every((g) => t2.includes(g)),
    "dokumenterade gränser bärs i text med attribution (grannfamiljerna)",
  );
  const udAntal = KURSREGISTER.filter((r) => r.kategori === "UTDELNINGSSTRATEGI").length;
  kontroll(
    "D22 registerdrivet kategoriantal + nivå M2",
    udAntal > 0 && t2.includes("I kategorin utdelningsstrategi finns " + udAntal + " kurser"),
    "UTDELNINGSSTRATEGI = " + udAntal + " LIVE ur KURSREGISTER (kategoristängningen = detta tal)",
  );
  const ud10 = KURSREGISTER.find((r) => r.slug === "ud-10-ex-dagens-mekanik");
  kontroll(
    "D23 nivåmarkör M2",
    !!ud10 && ud10.niva === "Intermediär" && t2.includes("intermediär nivå"),
    "ud-10 = " + (ud10 ? ud10.niva : "?") + " (registerdrivet, LIVE)",
  );

  // D24: kurslänkarnas slug:ar — alla äkta mot registret (båda monsters).
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  let fantomer = [];
  let minstaLankar = 99;
  let minstaKnappar = 99;
  for (const m of ATERSTANGNING_MONSTER) {
    const svaret = m.bygga(KURSREGISTER);
    const kursSlugs = svaret.handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", ""));
    fantomer.push(...kursSlugs, ...svaret.kallor.map((kk) => kk.slug).filter(Boolean));
    minstaLankar = Math.min(minstaLankar, kursSlugs.length);
    minstaKnappar = Math.min(minstaKnappar, svaret.handlings.filter((h) => h.lank.startsWith("fragor:")).length);
  }
  fantomer = fantomer.filter((s) => !slugSet.has(s));
  kontroll("D24 fantomslug (2 monsters)", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : "0 fantomer");
  kontroll(
    "D25 källmärkning — ≥ 8 kurslänkar + ≥ 3 fragor-knappar per monster",
    minstaLankar >= 8 && minstaKnappar >= 3,
    "minst " + minstaLankar + " kurslänkar · minst " + minstaKnappar + " fragor-knappar (spårets krav)",
  );
  const s1 = ATERSTANGNING_MONSTER[0].bygga(KURSREGISTER);
  const s2 = ATERSTANGNING_MONSTER[1].bygga(KURSREGISTER);
  kontroll(
    "D26 motfråga + fördjupning",
    s1.motfraga?.text === "Vad är Tobins Q?" && s1.fordjupa?.lank === "/kurser/vr-10-enhetsmultiplar" &&
      s2.motfraga?.text === "Vad är utdelningskalendern?" && s2.fordjupa?.lank === "/kurser/ud-10-ex-dagens-mekanik",
    "motfrågor till grannarnas frågor · fördjupa = primärkurserna",
  );
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är enhetsmultiplar?", "vad är ev per kilowattimme?", "vad är ev per abonnent?",
    "vad är kapacitetstoner?", "vad är priset per kilowattimme?", "vad är producerad ton?",
    "vad är kapacitetsfaktor?", "vad är installerad kilowatt?", "vad är installerade kilowatt?",
    "vad är enhetsmarginalen?", "vad är överbyggd kapacitet?", "vad är uttagsgrad?",
    "vad är en teoretisk ex-kurs?", "vad är teoretiska ex-kursen?", "vad är ex-kursen?",
    "vad är en ex-kurs?", "vad är utdelningsjusteringen?", "vad är utdelningsmekanik?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltAterstangning(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är ex-dagen?",              // utdelningskalendern (ud-07 äger nakna datumord)
    "vad är en avstämningsdag?",     // utdelningskalendern
    "vad är utdelningskalendern?",   // utdelningskalendern (motor 41)
    "vad är cac?",                   // tx-06/enhetsekonomin
    "vad är tobins q?",              // vr-08
    "vad är kortläge?",              // am-06
    "vad är en indexomläggning?",    // am-07
    "vad är isk?",                   // km-052
    "vad är ton?",                   // naket ton — sektorfamiljerna
  ];
  const stulna = gransor.filter((f) => svaraLokaltAterstangning(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2: juridikgrind — pedagogisk text, aldrig rekommendation ──────────
{
  let ok = true;
  for (const m of ATERSTANGNING_MONSTER) {
    const t = m.bygga(KURSREGISTER).text;
    const paddagogisk = t.includes("utbildning") && t.includes("inga placeringstips");
    const pahittade = t.includes("påhittade") || t.includes("påhittat");
    const ingaRad = !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t);
    if (!(paddagogisk && pahittade && ingaRad)) ok = false;
  }
  kontroll("F2 juridikgrind (2 monsters)", ok, "pedagogisk + påhittade värden + 0 rådsformuleringar");
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL hos detta lager ────────
{
  const grannar = [
    "vad är indexinklusionen?", "vad är inklusionseffekten?",       // u1 (syskon)
    "vad är evighetskapitalet?", "vad är avgiftsmaskinen?",         // u3 (syskon)
    "vad är utdelningsrekapitaliseringen?",                         // u3 (syskon)
    "vad är regleringsmoat?", "vad är valutadifferenserna?",        // öppna ytor mt-09/bk-09
    "vad är multipelns anatomi?",                                   // vr-03-grannen
    "vad är utdelningskalendern?",                                  // ud-07-grannen
    "hur fungerar enhetsekonomin?",                                 // tx-06-grannen
    "vad är spread?",                                               // marknadsmekanik
    "vad är korrelationsrisken?",                                   // marknadsrytm (SIST-grannen)
  ];
  const stulna = grannar.filter((f) => svaraLokaltAterstangning(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "aterstangning");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är en enhetsmultipl?", "vad är ev per ton?",
    "vad är den teoretiska ex-kursen?", "vad är ex-spärren?",
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
  const svarar = kanoniska.map((f) => svaraLokaltAterstangning(f, KURSREGISTER) !== null);
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
  const mina = ATERSTANGNING_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-aterstangning-fragor.ts",
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
  const posPeib = rad.indexOf("svaraLokaltPeibSlutet(");
  const posMin = rad.indexOf("svaraLokaltAterstangning(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("aterstangning saknas i kedjeraden");
  if (posPeib === -1 || posMin === -1 || posRytm === -1 || !(posPeib < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat peibslutet < aterstangning < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-aterstangning-fragor"')) FEL.push("importen saknas");
  kontroll(
    "L widget-synk — efter peibslutet, FÖRE marknadsrytm (deras SIST)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "93:e motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u2 fönster 38 (aterstangning — TVÅ KATEGORISTÄNGNINGAR: VÄRDERING 11/11 + UTDELNINGSSTRATEGI 11/11): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
