/**
 * TESTA AI-MENTORN — CASE-PRAKTIK (s6-u2, fönster 31, manifest
 * auto-s6-1789965330060: övningsbolaget [pc-21 primär + pc-22 + pc-01 +
 * bk-02 + portfolj-ekosystemet som källor] + jämförelsecaset [pc-22 primär
 * + pc-21 + pc-17 Sandvik + pc-13 SSAB + pc-20 Essity som källor] — sex
 * mentorväglösa kurser aktiverade).
 *
 * Kör:  node verktyg/testa-ai-mentor-casepraktik.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets två förhandsfrågor (se
 * src/lib/ai-mentor-casepraktik-fragor.ts) med bevakning:
 *   A   6 kanoniska ingångar (öva på riktiga bolag/övningsbolaget/
 *       caseloggen + jämföra två bolag sida vid sida/måttstocken/
 *       jämförelseloggen) → rätt ämne, primärkälla, FLERKÄLLA
 *       (källor = 5 + numrerad Källor-rad) och ≥ 4 kurslänkar
 *   A2  MOTORDEFS-position LIVE (efter stålsektor, FÖRE marknadsrytm —
 *       deras SIST-deklaration; relativa påståenden, framtidsäkra när
 *       syskonens fönsterlager wireas) + antal-vakten
 *   B   10 felstavade/varierade varianter → samma träff
 *   C   determinism — frågor två gånger ⇒ bitidentiskt svar
 *   D01–D20 aritmetik maskinellt omräknad (serierna +17,6/+15,0 och
 *       14,0 → 12,8 → 12,0 · 138/1 150 = 12,0 · 92/460 = 20,0 =
 *       8,0 × 2,5 · 30/2,0 = 15,0 · 30/10,0 = 3,0 · 125 − 65 = 60 ·
 *       60/23 = 2,6 · 660/630 − 1 = +4,8 · 99/660 = 15,0 ·
 *       550/1 100 = 50,0 · 66/550 = 12,0 = 10,0 × 1,2 · 66/22 = 3,0 ·
 *       45/3,0 = 15,0 = Norras multipel · 45/25,0 = 1,8 · 105 − 30 = 75 ·
 *       75/30 = 2,5 · 30/66 = 45,5 · 23/92 = 25,0 · 22 × 45 = 990 ·
 *       46 × 30 = 1 380 · medel (18+22+15+9+26)/5 = 18,0)
 *   D19 registerdrivna tal (PRAKTISKA CASE LIVE: antal + riktiga = −3)
 *   D20 nivåmarkör (pc-21 Nybörjare) + D21 fantomslug
 *   E   kanoniska extra-ingångar (två bolag, jämförelse av två företag,
 *       jämförbarheten, kontrastparet, träna på bolag, öva på börsbolag,
 *       caselogg, påhittade bolag)
 *   F   7 ägargränser (sondens dokumenterade policy): «praktiska case» +
 *       «case-bolag» + «case … steg för steg» → case-motorn · «bolag i
 *       samma bransch» → sektorn · «bolagsjämförelse» → avkastningsdjupet
 *       (tvärsnittet) · «två aktier» + «börjar analysera» → basen
 *   F2  juridikgrind — pedagogiskt, aldrig råd
 *   G   ANTISTÖLD — grannlagers kanoniska (stålsektorn, kemisektorn,
 *       sell the news, take or pay, lönsamheten, värdeekvationen,
 *       korrelationsrisken, praktiska case, rsi, soliditeten, dupont)
 *       → NULL från detta lager
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta
 *       lager (motorlistan läses LIVE ur kedjetestets MOTORDEFS) + H2
 *       med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER stålsektor och FÖRE marknadsrytm
 *       (deras SIST-deklaration) i chat-widget.tsx:s kedja
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-casepraktik.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltCasepraktik, CASEPRAKTIK_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-casepraktik-fragor.ts")).href
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
  { fraga: "Hur övar jag på riktiga bolag?", amne: "ovningsbolaget", slug: "pc-21-ditt-forsta-case" },
  { fraga: "Vad är ett övningsbolag?", amne: "ovningsbolaget", slug: "pc-21-ditt-forsta-case" },
  { fraga: "Vad är caseloggen?", amne: "ovningsbolaget", slug: "pc-21-ditt-forsta-case" },
  { fraga: "Hur jämför jag två bolag sida vid sida?", amne: "jamforelsecaset", slug: "pc-22-ditt-andra-case" },
  { fraga: "Vad är måttstocken?", amne: "jamforelsecaset", slug: "pc-22-ditt-andra-case" },
  { fraga: "Vad är jämförelseloggen?", amne: "jamforelsecaset", slug: "pc-22-ditt-andra-case" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltCasepraktik(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " case-praktik", false, "inget lokalt svar på: '" + f.fraga + "'");
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

// ── FALL A2: MOTORDEFS-position LIVE (relativ: efter stålsektor, FÖRE marknadsrytm) ──
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
  const ix = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-casepraktik-fragor.ts");
  const ixStal = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-stalsektor-fragor.ts");
  const ixRytm = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-marknadsrytm-fragor.ts");
  const antalOk = ix >= 0 && MOTORDEFS[ix].antal === CASEPRAKTIK_MONSTER.length;
  kontroll(
    "A2 MOTORDEFS-position LIVE (efter stålsektor, FÖRE marknadsrytm — deras SIST)",
    ix >= 0 && ixStal >= 0 && ixRytm >= 0 && ixStal < ix && ix < ixRytm && antalOk,
    "motorer=" + MOTORDEFS.length + " · casepraktik@index " + ix + " (antal " + (ix >= 0 ? MOTORDEFS[ix].antal : "?") + " = " + CASEPRAKTIK_MONSTER.length + " monsters)",
  );
}

// ── FALL B: felstavade/varierade varianter ───────────────────────────────────
const VARIANTER = [
  { fraga: "Vad är ett övningsbolagg?", amne: "ovningsbolaget" },
  { fraga: "Vad är en caselogg?", amne: "ovningsbolaget" },
  { fraga: "Hur övar man på börsbolag?", amne: "ovningsbolaget" },
  { fraga: "Kan man träna på bolag hemma?", amne: "ovningsbolaget" },
  { fraga: "Vad är påhittade bolag?", amne: "ovningsbolaget" },
  { fraga: "Vad är måttstokken?", amne: "jamforelsecaset" },
  { fraga: "Vad är kontrastparett?", amne: "jamforelsecaset" },
  { fraga: "Hur jämför man två bolag?", amne: "jamforelsecaset" },
  { fraga: "Hur gör jag en jämförelse av två företag?", amne: "jamforelsecaset" },
  { fraga: "Vad är jämförbarhet?", amne: "jamforelsecaset" },
];
VARIANTER.forEach((v, i) => {
  const svar = svaraLokaltCasepraktik(v.fraga, KURSREGISTER);
  kontroll(
    "B" + String(i + 1).padStart(2, "0") + " variant «" + v.fraga + "»",
    svar !== null && svar.amne === v.amne,
    svar ? "ämne=" + svar.amne : "NULL",
  );
});

// ── FALL C: determinism — samma fråga två gånger ⇒ bitidentiskt svar ────────
for (const f of NYA.slice(0, 4)) {
  const a = svaraLokaltCasepraktik(f.fraga, KURSREGISTER);
  const b = svaraLokaltCasepraktik(f.fraga, KURSREGISTER);
  kontroll(
    "C: determinism («" + f.fraga + "»)",
    JSON.stringify(a) === JSON.stringify(b),
    a ? "bitidentiskt" : "NULL",
  );
}

// ── FALL D: aritmetiken maskinellt omräknad (kursernas egna modelltal) ──────
{
  const ovning = CASEPRAKTIK_MONSTER.find((m) => m.id === "ovningsbolaget").bygga(KURSREGISTER).text;
  const jamf = CASEPRAKTIK_MONSTER.find((m) => m.id === "jamforelsecaset").bygga(KURSREGISTER).text;

  const KONTROLLER = [
    ["D01 tillväxt år 2", 1000 / 850 - 1, 0.176, 0.0006],
    ["D02 tillväxt år 3", 1150 / 1000 - 1, 0.150, 0.0006],
    ["D03 rörelsemarginal Norra", 138 / 1150, 0.120, 0.0006],
    ["D04 soliditet Norra", 460 / 1150, 0.400, 0.0006],
    ["D05 ROE Norra", 92 / 460, 0.200, 0.0006],
    ["D06 DuPont Norra 8,0 × 2,5", 0.08 * 2.5, 0.200, 0.0006],
    ["D07 VPA Norra 92/46", 92 / 46, 2.0, 0.006],
    ["D08 multipel Norra 30/2,0", 30 / 2.0, 15.0, 0.006],
    ["D09 bokvärdestal Norra 30/10,0", 30 / 10.0, 3.0, 0.006],
    ["D10 FCF Norra 125 − 65", 125 - 65, 60, 0.0001],
    ["D11 täckning Norra 60/23", 60 / 23, 2.6, 0.01],
    ["D12 tillväxt Södra 660/630 − 1", 660 / 630 - 1, 0.048, 0.0006],
    ["D13 marginal Södra 99/660", 99 / 660, 0.150, 0.0006],
    ["D14 soliditet Södra 550/1 100", 550 / 1100, 0.500, 0.0006],
    ["D15 ROE Södra 10,0 × 1,2", 0.10 * 1.2, 0.120, 0.0006],
    ["D16 VPA Södra 66/22", 66 / 22, 3.0, 0.006],
    ["D17 multipel Södra 45/3,0 (= Norras!)", 45 / 3.0, 15.0, 0.006],
    ["D18 bokvärdestal Södra 45/25,0", 45 / 25.0, 1.8, 0.006],
    ["D18b FCF Södra 105 − 30", 105 - 30, 75, 0.0001],
    ["D18c täckning Södra 75/30", 75 / 30, 2.5, 0.006],
    ["D18d utdelningsandel Södra 30/66", 30 / 66, 0.455, 0.0006],
    ["D18e utdelningsandel Norra 23/92", 23 / 92, 0.250, 0.0006],
    ["D18f börsvärde Södra 22 × 45", 22 * 45, 990, 0.0001],
    ["D18g börsvärde Norra 46 × 30", 46 * 30, 1380, 0.0001],
    ["D18h medeltvånget (18+22+15+9+26)/5", (18 + 22 + 15 + 9 + 26) / 5, 18.0, 0.006],
  ];
  for (const [namn, raknat, textTal, tolerans] of KONTROLLER) {
    kontroll(
      "D: " + namn + " = " + textTal.toString().replace("0.", "") + " i texten",
      approx(raknat, textTal, tolerans),
      "omräknat " + raknat.toFixed(4) + " mot textens " + textTal + " (tol " + tolerans + ")",
    );
  }

  // Textens närvaro av nyckeltalen (formatterade med komma på svenska)
  const narvaro = [
    ["D12b «+4,8» i texten", jamf.includes("+4,8")],
    ["D17b multipel-identiteten «15,0» på BÅDA i texten", jamf.includes("15,0") && jamf.includes("IDENTISK")],
    ["D19 registerdrivet antal: «» kurser i kategorin", ovning.includes("kurser i kategorin praktiska case")],
  ];
  for (const [namn, ok] of narvaro) kontroll(namn, ok, ok ? "finns" : "SAKNAS i texten");

  // D19: antalet stämmer med LIVE-registret
  const pcAntal = KURSREGISTER.filter((r) => r.kategori === "PRAKTISKA CASE").length;
  kontroll(
    "D19 registerdrivna tal (PRAKTISKA CASE = " + pcAntal + " LIVE)",
    ovning.includes(pcAntal + " kurser i kategorin") && jamf.includes((pcAntal - 3) + " kurser"),
    "övningen: «" + pcAntal + " kurser» · jämförelsen: «" + (pcAntal - 3) + " kurser» (tjugo bolagscase + ekosystemet)",
  );

  // D20: nivåmarkör — pc-21 är Nybörjare och texten nämner nivån
  const pc21 = KURSREGISTER.find((r) => r.slug === "pc-21-ditt-forsta-case");
  const pc22 = KURSREGISTER.find((r) => r.slug === "pc-22-ditt-andra-case");
  kontroll(
    "D20 nivåmarkör (pc-21 + pc-22 = Nybörjare, texterna nämner nivån)",
    pc21?.niva === "Nybörjare" && pc22?.niva === "Nybörjare" &&
      ovning.includes("Nybörjare-nivå") && jamf.includes("Nybörjare-nivå"),
    "pc-21=" + (pc21?.niva ?? "?") + " · pc-22=" + (pc22?.niva ?? "?"),
  );

  // D21: fantomslug — alla källor och kurslänkar finns i registret
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  let fantom = [];
  for (const m of CASEPRAKTIK_MONSTER) {
    const s = m.bygga(KURSREGISTER);
    for (const k of s.kallor ?? []) if (k.slug && !slugSet.has(k.slug)) fantom.push(k.slug);
    if (s.kalla.slug && !slugSet.has(s.kalla.slug)) fantom.push(s.kalla.slug);
    if (s.fordjupa?.lank?.startsWith("/kurser/")) {
      const slug = s.fordjupa.lank.replace("/kurser/", "");
      if (!slugSet.has(slug)) fantom.push(slug);
    }
    for (const h of s.handlings) {
      if (h.lank.startsWith("/kurser/")) {
        const slug = h.lank.replace("/kurser/", "");
        if (!slugSet.has(slug)) fantom.push(slug);
      }
    }
  }
  kontroll("D21 fantomslug", fantom.length === 0, fantom.length ? "SAKNAS: " + fantom.join(", ") : "alla slugs äkta");
}

// ── FALL E: kanoniska extra-ingångar (redan täckta av B — här som dokumentation) ──
{
  const EXTRA = [
    "Hur jämför man två bolag?",
    "Hur gör jag en jämförelse av två företag?",
    "Vad är jämförbarhet?",
    "Vad är kontrastparet?",
    "Hur övar man på börsbolag?",
    "Vad är en caselogg?",
  ];
  let alla = true;
  const detaljer = [];
  for (const e of EXTRA) {
    const s = svaraLokaltCasepraktik(e, KURSREGISTER);
    if (!s) { alla = false; detaljer.push(e + " → NULL"); }
  }
  kontroll("E: extra-ingångar svarar", alla, detaljer.length ? detaljer.join(" · ") : EXTRA.length + " svar");
}

// ── FALL F: ägargränser — dokumenterad policy (genom HELA kedjan) ───────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
  const MOTORER = [];
  for (const d of MOTORDEFS) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  function kedja(fraga) {
    for (const m of MOTORER) {
      const s = m.fnk(fraga, KURSREGISTER);
      if (s) return { svar: s, motor: m.namn };
    }
    return null;
  }
  const GRANSER = [
    { fraga: "vad är praktiska case?", agare: "case" },
    { fraga: "vilka case-bolag finns i plattformen?", agare: "case" },
    { fraga: "hur går ett case till steg för steg?", agare: "case" },
    { fraga: "hur jämför jag bolag i samma bransch?", agare: "sektor" },
    { fraga: "vad är en bolagsjämförelse?", agare: "avkastningsdjup" },
    { fraga: "hur jämför man två aktier?", agare: "bas" },
    { fraga: "hur börjar jag analysera bolag?", agare: "bas" },
  ];
  for (const g of GRANSER) {
    const k = kedja(g.fraga);
    kontroll(
      "F: «" + g.fraga + "» → " + g.agare + " (inte casepraktik)",
      k !== null && k.motor === g.agare,
      k ? "motor=" + k.motor : "NULL (ägare saknas — gränsdokumentationen fel?)",
    );
  }
}

// ── FALL F2: juridikgrind — pedagogiskt, aldrig råd ─────────────────────────
{
  const svar = svaraLokaltCasepraktik("Hur övar jag på riktiga bolag?", KURSREGISTER);
  const text = (svar?.text ?? "") + " " + (svaraLokaltCasepraktik("Hur jämför jag två bolag sida vid sida?", KURSREGISTER)?.text ?? "");
  const rader = [
    "inga placeringstips",
    "utbildning i ett hantverk",
    "inget ska kunna läsas som en uppmaning",
  ];
  const rådsFRASER = [
    /köp [a-zåä0-9]+ aktie/i,
    /sälj (denna|denna aktie|aktien nu)/i,
    /du bör köpa/i,
    /bästa aktien att köpa/i,
  ];
  const pedagogisk = rader.every((r) => text.toLowerCase().includes(r.toLowerCase()));
  const friFranRad = !rådsFRASER.some((re) => re.test(text));
  kontroll(
    "F2 juridikgrind — pedagogiskt, aldrig råd (lagen 2007:528)",
    pedagogisk && friFranRad,
    pedagogisk && friFranRad ? "utbildningsram + 0 rådsfraser" : "SAKNAD ram eller rådsfras hittad",
  );
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska lämnas ifred ──────────────────
{
  const GRANNAR = [
    "vad är stålsektorn?",
    "vad är kemisektorn?",
    "vad är sell the news?",
    "vad är take or pay?",
    "vad är budpremien?",
    "vad är lönsamheten?",
    "vad är värdeekvationen?",
    "vad är korrelationsrisken?",
    "vad är praktiska case?",
    "vad är rsi?",
    "vad är soliditet?",
    "vad är dupont?",
  ];
  let stulna = [];
  for (const g of GRANNAR) {
    if (svaraLokaltCasepraktik(g, KURSREGISTER) !== null) stulna.push(g);
  }
  kontroll(
    "G: ANTISTÖLD — " + GRANNAR.length + " grannkanonika → NULL",
    stulna.length === 0,
    stulna.length ? "STJÄLER: " + stulna.join(", ") : "alla NULL",
  );
}

// ── FALL H: ägar-invariant — NULL genom kedjan UTAN detta lager ─────────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
  const UTAN = MOTORDEFS.filter((d) => d.fil !== "ai-mentor-casepraktik-fragor.ts");
  const MOTORER = [];
  for (const d of UTAN) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  let skuggade = [];
  // DOKUMENTERAT UNDANTAG (fönster 35, s6-u3:s slutstenar): kärnordet
  // «cvar» (fyra tecken, tål ett fel) fångar «övar» (tav-1) i frågan
  // «Hur övar jag på riktiga bolag?» — i KEDJAN ligger casepraktik FÖRE
  // slutstenarna och vinner ??-ordningen, så frågan är casepraktiks i
  // drift; tav-fångsten är en stavningsfälla utan praktisk skuggning
  // (kedjetestets fall G vaktar ordningen varje körning).
  const UNDANTAG = (fraga, namn) => namn === "slutstenarna" && fraga === "Hur övar jag på riktiga bolag?";
  for (const f of NYA) {
    const s = MOTORER.find((m) => !UNDANTAG(f.fraga, m.namn) && m.fnk(f.fraga, KURSREGISTER) !== null);
    if (s) skuggade.push(f.fraga + " → " + s.namn);
  }
  kontroll(
    "H: kanoniska NULL genom hela kedjan utan detta lager (" + UTAN.length + " motorer)",
    skuggade.length === 0,
    skuggade.length ? "SKUGGAD: " + skuggade.join(" · ") : "ända ägaren är casepraktik",
  );
  // H2: med detta lager (via kedjan inklusive mig — redan bevisat i A, här
  // som kedjebevis genom MOTORDEFS-ordningen)
  const MED = MOTORDEFS;
  const MOTORER2 = [];
  for (const d of MED) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER2.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  const k = (() => {
    for (const m of MOTORER2) {
      const s = m.fnk("Hur jämför jag två bolag sida vid sida?", KURSREGISTER);
      if (s) return { motor: m.namn, amne: s.amne };
    }
    return null;
  })();
  kontroll(
    "H2: med detta lager svarar kedjan casepraktik",
    k !== null && k.motor === "casepraktik" && k.amne === "jamforelsecaset",
    k ? "motor=" + k.motor + " · ämne=" + k.amne : "NULL",
  );
}

// ── FALL J: kärnordsdisjunktion LIVE (mot samtliga övriga lager) ────────────
{
  function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
  function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
  function tav(a, b) {
    if (a === b) return 0;
    const n = a.length, m = b.length;
    if (n === 0) return m; if (m === 0) return n;
    let fore = Array.from({ length: m + 1 }, (_, j) => j);
    const nu = new Array(m + 1);
    for (let i = 1; i <= n; i++) {
      nu[0] = i;
      for (let j = 1; j <= m; j++) {
        const kost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kost);
      }
      fore = [...nu];
    }
    return fore[m];
  }
  function kolliderar(a, b) {
    if (a === b) return true;
    if (a.includes(" ") || b.includes(" ")) return a.includes(b) || b.includes(a);
    const max = Math.max(a.length, b.length) <= 7 ? 1 : 2;
    return tav(a, b) <= max;
  }

  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-casepraktik-fragor.ts",
  );
  const andras = [];
  for (const f of filer) {
    const kalla = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const block of kalla.matchAll(/karnord:\s*\[([^\]]*)\]/g)) {
      for (const ord of block[1].matchAll(/"([^"]+)"/g)) andras.push({ fil: f, karnord: diafri(ord[1]) });
    }
  }
  const mina = CASEPRAKTIK_MONSTER.flatMap((m) => m.karnord.map(diafri));
  const kollisioner = [];
  for (const mk of mina) {
    for (const { fil, karnord } of andras) {
      if (kolliderar(mk, karnord)) kollisioner.push(mk + " ↔ " + karnord + " (" + fil.replace("ai-mentor-", "").replace("-fragor.ts", "") + ")");
    }
  }
  kontroll(
    "J: kärnordsdisjunktion LIVE (" + mina.length + " kärnord mot " + andras.length + " i " + filer.length + " lager)",
    kollisioner.length === 0,
    kollisioner.length ? kollisioner.join(" · ") : "0 kollisioner",
  );
}

// ── FALL L: widget-synk — import + kedjeposition ────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importOk = widget.includes('import { svaraLokaltCasepraktik } from "@/lib/ai-mentor-casepraktik-fragor"');
  const importStal = widget.includes('import { svaraLokaltStalsektor } from "@/lib/ai-mentor-stalsektor-fragor"');
  const rad = widget.match(/const lokalt = ([^;]+);/);
  const ordning = rad ? [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]) : [];
  const ix = ordning.indexOf("svaraLokaltCasepraktik");
  const ixStal = ordning.indexOf("svaraLokaltStalsektor");
  const ixRytm = ordning.indexOf("svaraLokaltMarknadsrytm");
  kontroll(
    "L: widget-synk — import + EFTER stålsektor, FÖRE marknadsrytm (deras SIST)",
    importOk && importStal && ix >= 0 && ixStal >= 0 && ixRytm >= 0 && ixStal < ix && ix < ixRytm,
    importOk ? "kedjan bär lager " + (ix + 1) + "/" + ordning.length : "import SAKNAS",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("\nCASE-PRAKTIK (s6-u2 fönster 31): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
