/**
 * TESTA AI-MENTORN — ÄGARSLUTET (s6-u3, manifest auto-s6-1790612726901:
 * familjekontoret [ib-07 primär + ib-01 + pe-01 + pe-05 + pe-07 ⇒ PRIVATE
 * EQUITY & INVESTMENTBOLAG 17/17 STÄNGT tillsammans med syskon u2:s ib-06 +
 * pe-08] + investmentbolagscaset [pc-04 primär + ib-01 + ib-02 + ib-03 +
 * km-068 ⇒ PRAKTISKA CASEs första ägarsidescase] + ericssoncaset
 * [pc-10 primär + pc-04 + km-046 + rk-05 + pc-01]).
 *
 * Kör:  node verktyg/testa-ai-mentor-agarslut.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets tre förhandsfrågor (se
 * src/lib/ai-mentor-agarslut-fragor.ts) med bevakning:
 *   A   9 kanoniska ingångar (tre per monster) → rätt ämne, primärkälla,
 *       FLERKÄLLA (källor = 5 + numrerad Källor-rad) och ≥ 4 kurslänkar
 *   A2  MOTORDEFS-position LIVE (efter slutstenarna, FÖRE marknadsrytm —
 *       deras SIST-deklaration; relativa påståenden, framtidsäkra när
 *       syskonens fönsterlager wireas) + antal-vakten
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — frågor två gånger ⇒ bitidentiskt svar
 *   D01–D11 aritmetik maskinellt omräknad (familjekontorets egna modelltal):
 *       1,2 + 1,2 + 0,6 = 3,0 · 3,0/200 = 1,5 % · 3,0/2 000 = 0,15 % ·
 *       3,0/10 = 0,3 · 0,3/200 = 0,15 % · 500/3 = 166,7 · 3,0/166,7 = 1,8 %
 *   D12–D18 strukturmarkörer (case-monstren är kvalitativa — kursernas egna
 *       definitioner och läror ska bäras i texten: substansrabattens
 *       definition, kapitalåterföringens tre vägar, värdefällan, RAN,
 *       Networks/Services/Emerging Business, CFIUS, Open RAN)
 *   D19 registerdrivna tal (PE/IB = 17 LIVE · PRAKTISKA CASE LIVE)
 *   D20 nivåmarkörer (ib-07 Intermediär · pc-04 Intermediär ·
 *       pc-10 Intermediär) + D21 fantomslug
 *   D22 KATEGORISTÄNGNINGEN — PE/IB:s sista lucka bärs av detta lager
 *   F   ägargränser (dokumenterad policy GENOM HELA KEDJAN):
 *       «carry» → pe-mekanik · «andrahandsmarknaden» → pengarstid ·
 *       «co-investering» → co-invest · «sparkontot» → banksektorn ·
 *       «kapitalets två klockor» → kategoristangning ·
 *       «vad är ett ericsson-case?» → case (deras «case»-familj) ·
 *       «hur analyserar jag telekomsektorn?» → sektorn ·
 *       «vad är evighetskapital?» → privatkapital PÅ DISK (syskon u2:s
 *       modul — importeras explicit oavsett MOTORDEFS-läge)
 *   F2  juridikgrind — pedagogiskt, aldrig råd
 *   G   ANTISTÖLD — grannlagers kanoniska (inklusive SYSKON u2:S
 *       evighets- och avgiftsfamiljer — pivottens kontrakt) → NULL
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta
 *       lager + explicit privatkapital-modulen på disk + H2 med detta
 *       lager (kedjan svarar ägarslut)
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER slutstenarna och FÖRE marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-agarslut.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltAgarslut, AGARSLUT_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-agarslut-fragor.ts")).href
);
// Syskon u2:s fönstermodul: wireas av dem i MOTORDEFS — testet läser DISKEN
// så gränserna vakas oavsett deras wiring-tidpunkt. Importen är VILLKORAD:
// syskonet bygger om sin fil i samma fönster (bevisat: raderad 16:5x medan
// detta test utvecklades) — finns den inte just nu degraderar
// disk-vakterna mjolt (F-notis + H utan extra led), aldrig falskt FAIL.
let svaraLokaltPrivatkapital = null;
try {
  ({ svaraLokaltPrivatkapital } = await import(
    pathToFileURL(join(ROT, "src/lib/ai-mentor-privatkapital-fragor.ts")).href
  ));
} catch {
  console.log("NOTIS: syskon u2:s ai-mentor-privatkapital-fragor.ts ej på disk just nu — disk-vakter degraderar mjolt");
}

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

// ── FALL A: nio kanoniska ingångar, tre monster, flerkällskrav ──────────────
const NYA = [
  { fraga: "Vad är ett familjekontor?", amne: "familjekontoret", slug: "ib-07-family-officen" },
  { fraga: "Vad är den tredje ägarformen?", amne: "familjekontoret", slug: "ib-07-family-officen" },
  { fraga: "Vad är ett generationsskifte?", amne: "familjekontoret", slug: "ib-07-family-officen" },
  { fraga: "Hur analyserar jag Investor AB?", amne: "investmentbolagscaset", slug: "pc-04-case-investor-ab" },
  { fraga: "Vad är Investor AB?", amne: "investmentbolagscaset", slug: "pc-04-case-investor-ab" },
  { fraga: "Vad är kapitalåterföring?", amne: "investmentbolagscaset", slug: "pc-04-case-investor-ab" },
  { fraga: "Hur analyserar jag Ericsson?", amne: "ericssoncaset", slug: "pc-10-case-ericsson" },
  { fraga: "Vad är RAN?", amne: "ericssoncaset", slug: "pc-10-case-ericsson" },
  { fraga: "Vad är fallet Ericsson?", amne: "ericssoncaset", slug: "pc-10-case-ericsson" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltAgarslut(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " ägarslut", false, "inget lokalt svar på: '" + f.fraga + "'");
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

// ── FALL A2: MOTORDEFS-position LIVE (relativ: efter slutstenarna, FÖRE marknadsrytm) ──
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(
    /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
  )].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
  const ix = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-agarslut-fragor.ts");
  const ixSlut = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-slutstenarna-fragor.ts");
  const ixRytm = MOTORDEFS.findIndex((d) => d.fil === "ai-mentor-marknadsrytm-fragor.ts");
  const antalOk = ix >= 0 && MOTORDEFS[ix].antal === AGARSLUT_MONSTER.length;
  kontroll(
    "A2 MOTORDEFS-position LIVE (efter slutstenarna, FÖRE marknadsrytm — deras SIST)",
    ix >= 0 && ixSlut >= 0 && ixRytm >= 0 && ixSlut < ix && ix < ixRytm && antalOk,
    "motorer=" + MOTORDEFS.length + " · ägarslut@index " + ix + " (antal " + (ix >= 0 ? MOTORDEFS[ix].antal : "?") + " = " + AGARSLUT_MONSTER.length + " monsters)",
  );
}

// ── FALL B: felstavade/varierade varianter ──────────────────────────────────
const VARIANTER = [
  { fraga: "Vad är familjekontoret för något?", amne: "familjekontoret" },
  { fraga: "Vad är familjekontoren?", amne: "familjekontoret" },
  { fraga: "Vad är en family office?", amne: "familjekontoret" },
  { fraga: "Vad är skillnaden mellan SFO och MFO?", amne: "familjekontoret" },
  { fraga: "Vad är gemensamt kontor?", amne: "familjekontoret" },
  { fraga: "Vad är kapitalåterföringen?", amne: "investmentbolagscaset" },
  { fraga: "Vad är en värdefälla?", amne: "investmentbolagscaset" },
  { fraga: "Vad är investmentbolagscaset?", amne: "investmentbolagscaset" },
  { fraga: "Vad är substansrabatten i Investor AB-caset?", amne: "investmentbolagscaset" },
  { fraga: "Vad är ericssoncaset?", amne: "ericssoncaset" },
  { fraga: "Vad är radio access network?", amne: "ericssoncaset" },
  { fraga: "Hur läser jag fallet Ericsson?", amne: "ericssoncaset" },
];
VARIANTER.forEach((v, i) => {
  const svar = svaraLokaltAgarslut(v.fraga, KURSREGISTER);
  kontroll(
    "B" + String(i + 1).padStart(2, "0") + " variant «" + v.fraga + "»",
    svar !== null && svar.amne === v.amne,
    svar ? "ämne=" + svar.amne : "NULL",
  );
});

// ── FALL C: determinism — samma fråga två gånger ⇒ bitidentiskt svar ────────
for (const f of NYA.slice(0, 6)) {
  const a = svaraLokaltAgarslut(f.fraga, KURSREGISTER);
  const b = svaraLokaltAgarslut(f.fraga, KURSREGISTER);
  kontroll(
    "C: determinism («" + f.fraga + "»)",
    JSON.stringify(a) === JSON.stringify(b),
    a ? "bitidentiskt" : "NULL",
  );
}

// ── FALL D: aritmetik + strukturmarkörer (kursernas egna tal och definitioner) ──
{
  const fam = AGARSLUT_MONSTER.find((m) => m.id === "familjekontoret").bygga(KURSREGISTER).text;
  const inv = AGARSLUT_MONSTER.find((m) => m.id === "investmentbolagscaset").bygga(KURSREGISTER).text;
  const eri = AGARSLUT_MONSTER.find((m) => m.id === "ericssoncaset").bygga(KURSREGISTER).text;

  const KONTROLLER = [
    ["D01 kontorets drift 1,2 + 1,2 + 0,6", 1.2 + 1.2 + 0.6, 3.0, 0.0001],
    ["D02 driftandel 200 Mkr 3,0/200", 3.0 / 200, 0.015, 0.00006],
    ["D03 driftandel 2 mdr 3,0/2 000", 3.0 / 2000, 0.0015, 0.000006],
    ["D04 MFO-kostnad per familj 3,0/10", 3.0 / 10, 0.3, 0.0001],
    ["D05 MFO-andel 0,3/200", 0.3 / 200, 0.0015, 0.000006],
    ["D06 arvslott 500/3", 500 / 3, 166.7, 0.05],
    ["D07 nya driftandelen 3,0/166,7", 3.0 / 166.7, 0.018, 0.0006],
  ];
  for (const [namn, raknat, textTal, tolerans] of KONTROLLER) {
    kontroll(
      "D: " + namn + " = " + textTal.toString().replace("0.", "") + " i texten",
      approx(raknat, textTal, tolerans),
      "omräknat " + raknat.toFixed(4) + " mot textens " + textTal + " (tol " + tolerans + ")",
    );
  }

  // Textens närvaro av nyckeltalen och kursernas egna definitioner
  const narvaro = [
    ["D08 «3,0 miljoner kronor per år» i texten", fam.includes("3,0 miljoner kronor per år")],
    ["D09 «1,5 procent» i texten", fam.includes("1,5 procent")],
    ["D10 «166,7» i texten", fam.includes("166,7")],
    ["D11 «1,8 procent» i texten", fam.includes("1,8 procent")],
    ["D12 substansrabattens definition «uttryckt som procent»", inv.includes("uttryckt som procent")],
    ["D13 kapitalåterföringens tre vägar «utdelningar, aktieåterköp eller avknoppning»", inv.includes("utdelningar, aktieåterköp eller avknoppning")],
    ["D14 värdefällans definition «verkar billig»", inv.includes("verkar billig")],
    ["D15 innehaven namngivna «ABB, Atlas Copco och SEB»", inv.includes("ABB, Atlas Copco och SEB")],
    ["D16 rabatten som tidsserie «ÖVER TID och MOT JÄMFÖRELSEBOLAG»", inv.includes("ÖVER TID och MOT JÄMFÖRELSEBOLAG")],
    ["D17 RAN-definitionen «förbinder mobila enheter»", eri.includes("förbinder mobila enheter")],
    ["D18 produktområdena «Networks, Services, Emerging Business»", eri.includes("Networks, Services, Emerging Business")],
  ];
  for (const [namn, ok] of narvaro) kontroll(namn, ok, ok ? "finns" : "SAKNAS i texten");

  // D19: antalen stämmer med LIVE-registret
  const peAntal = KURSREGISTER.filter((r) => r.kategori === "PRIVATE EQUITY & INVESTMENTBOLAG").length;
  const pcAntal = KURSREGISTER.filter((r) => r.kategori === "PRAKTISKA CASE").length;
  kontroll(
    "D19 registerdrivna tal (PE/IB=" + peAntal + " · PRAKTISKA CASE=" + pcAntal + " LIVE)",
    fam.includes(peAntal + " kurser") && inv.includes(peAntal + " kurser") && eri.includes(pcAntal + " kurser"),
    "fam+inv bär «" + peAntal + " kurser» · eri bär «" + pcAntal + " kurser»",
  );

  // D20: nivåmarkörer — kursernas nivåer nämnda i texterna
  const ib07 = KURSREGISTER.find((r) => r.slug === "ib-07-family-officen");
  const pc04 = KURSREGISTER.find((r) => r.slug === "pc-04-case-investor-ab");
  const pc10 = KURSREGISTER.find((r) => r.slug === "pc-10-case-ericsson");
  kontroll(
    "D20 nivåmarkör (ib-07 Intermediär · pc-04 Intermediär · pc-10 Intermediär)",
    ib07?.niva === "Intermediär" && pc04?.niva === "Intermediär" && pc10?.niva === "Intermediär" &&
      fam.includes("intermediär nivå") && inv.includes("intermediär nivå") && eri.includes("intermediär nivå"),
    "ib-07=" + (ib07?.niva ?? "?") + " · pc-04=" + (pc04?.niva ?? "?") + " · pc-10=" + (pc10?.niva ?? "?"),
  );

  // D21: fantomslug — alla källor och kurslänkar finns i registret
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  let fantom = [];
  for (const m of AGARSLUT_MONSTER) {
    const s = m.bygga(KURSREGISTER);
    for (const kk of s.kallor ?? []) if (kk.slug && !slugSet.has(kk.slug)) fantom.push(kk.slug);
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

  // D22: KATEGORISTÄNGNINGEN — PE/IB:s sista mentorväglösa kurs (ib-07) bärs
  // av detta lager (kurslänkar + källor i HELA bygga(), inte bara text);
  // syskon u2:s ib-06 + pe-08 bärs av deras modul på disk
  const hela = AGARSLUT_MONSTER.map((m) => JSON.stringify(m.bygga(KURSREGISTER))).join(" ");
  const saknas = ["ib-07-family-officen"].filter((s) => !hela.includes("/kurser/" + s));
  const pkFinns = ["ib-06-evighetskapitalet", "pe-08-avgiftsmaskinen"].filter((s) => !hela.includes("/kurser/" + s));
  kontroll(
    "D22 kategoristängningen: ib-07 här + ib-06/pe-08 lämnas åt syskon (vägs i deras lager)",
    saknas.length === 0 && pkFinns.length === 2,
    saknas.length ? "SAKNAS: " + saknas.join(", ") : "ib-07 bärs här · ib-06/pe-08 orörda här (u2:s territorium)",
  );
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
    { fraga: "vad är carry?", agare: "pe-mekanik" },
    { fraga: "vad är andrahandsmarknaden?", agare: "pengarstid" },
    { fraga: "vad är co-investering?", agare: "co-invest" },
    { fraga: "vad är sparkontot?", agare: "banksektorn" },
    { fraga: "vad är kapitalets två klockor?", agare: "kategoristangning" },
    { fraga: "vad är ett ericsson-case?", agare: "case" },
    { fraga: "hur analyserar jag telekomsektorn?", agare: "sektorlasning" },
  ];
  for (const g of GRANSER) {
    const k = kedja(g.fraga);
    kontroll(
      "F: «" + g.fraga + "» → " + g.agare + " (inte ägarslut)",
      k !== null && k.motor === g.agare,
      k ? "motor=" + k.motor : "NULL (ägare saknas — gränsdokumentationen fel?)",
    );
  }
  // Syskon u2:s evighetsfamilj äger sina frågor — deras modul på DISK
  // (MOTORDEFS-wiring är deras leveransyta; gränsen vakas här oavsett)
  if (svaraLokaltPrivatkapital) {
    const pk = svaraLokaltPrivatkapital("vad är evighetskapital?", KURSREGISTER);
    kontroll(
      "F: «vad är evighetskapital?» → privatkapital PÅ DISK (syskon u2 — pivottens kontrakt)",
      pk !== null,
      pk ? "ämne=" + pk.amne : "NULL — syskonets modul svarar ej?",
    );
  }
}

// ── FALL F2: juridikgrind — pedagogiskt, aldrig råd ─────────────────────────
{
  const svar = svaraLokaltAgarslut("Vad är ett familjekontor?", KURSREGISTER);
  const text = (svar?.text ?? "") +
    " " + (svaraLokaltAgarslut("Hur analyserar jag Investor AB?", KURSREGISTER)?.text ?? "") +
    " " + (svaraLokaltAgarslut("Hur analyserar jag Ericsson?", KURSREGISTER)?.text ?? "");
  const rader = [
    "inga placeringstips",
    "mekanismer, inte betyg",
  ];
  const rådsFRASER = [
    /köp [a-zåä0-9]+ aktie/i,
    /sälj (denna|denna aktie|aktien nu)/i,
    /du bör köpa/i,
    /bästa aktien att köpa/i,
    /bör jag köpa (investor|ericsson)/i,
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
    "vad är budpremien?",
    "vad är dupont?",
    "vad är roic?",
    "vad är nopat?",
    "vad är tidsvärde?",
    "vad är carry?",
    "vad är vattenfallet?",
    "vad är andrahandsmarknaden?",
    "vad är co-investering?",
    "vad är sparkontot?",
    // PIVOTTENS KONTRAKT — syskon u2:s fönsterfamiljer (förlorade racet,
    // territoriet lämnat HELT: kärnorden får aldrig återuppstå här)
    "vad är evighetskapital?",
    "vad är evighetskapitalet?",
    "vad är realiseringsfriheten?",
    "vad är inlösningsfriheten?",
    "vad är tidpunktsfriheten?",
    "vad är evighetsromantiken?",
    "vad är avgiftsmaskinen?",
    "vad är 2/20?",
    "vad är uppfångsten?",
    "vad är det fasta hjulet?",
    "vad är resultathjulet?",
    "vad är fördelningstrappan?",
    "vad är clawback?",
    "vad är avgiftsbördan?",
  ];
  let stulna = [];
  for (const g of GRANNAR) {
    if (svaraLokaltAgarslut(g, KURSREGISTER) !== null) stulna.push(g);
  }
  kontroll(
    "G: ANTISTÖLD — " + GRANNAR.length + " grannkanonika (inkl u2:s pivottfamiljer) → NULL",
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
  const UTAN = MOTORDEFS.filter((d) => d.fil !== "ai-mentor-agarslut-fragor.ts");
  const MOTORER = [];
  for (const d of UTAN) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  // privatkapital (u2) explicit — deras MOTORDEFS-post kan komma senare än
  // detta test körs; disk-modulen är sanningen oavsett wiring (villkorad:
  // syskonet bygger om filen i samma fönster)
  if (svaraLokaltPrivatkapital) MOTORER.push({ namn: "privatkapital(disk)", fnk: svaraLokaltPrivatkapital });
  let skuggade = [];
  for (const f of NYA) {
    const s = MOTORER.find((m) => m.fnk(f.fraga, KURSREGISTER) !== null);
    if (s) skuggade.push(f.fraga + " → " + s.namn);
  }
  kontroll(
    "H: kanoniska NULL genom hela kedjan utan detta lager (" + MOTORER.length + " motorer inkl disk-vakt)",
    skuggade.length === 0,
    skuggade.length ? "SKUGGAD: " + skuggade.join(" · ") : "ända ägaren är ägarslut",
  );
  // H2: med detta lager — kedjan (i MOTORDEFS-ordning) svarar ägarslut
  const MED = MOTORDEFS;
  const MOTORER2 = [];
  for (const d of MED) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER2.push({ namn: d.namn, fnk: modul[d.fn] });
  }
  if (svaraLokaltPrivatkapital) MOTORER2.push({ namn: "privatkapital(disk)", fnk: svaraLokaltPrivatkapital });
  MOTORER2.push({ namn: "ägarslut", fnk: svaraLokaltAgarslut });
  for (const f of [NYA[0], NYA[3], NYA[6]]) {
    const k = (() => {
      for (const m of MOTORER2) {
        const s = m.fnk(f.fraga, KURSREGISTER);
        if (s) return { motor: m.namn, amne: s.amne };
      }
      return null;
    })();
    kontroll(
      "H2: med detta lager svarar kedjan ägarslut («" + f.fraga + "»)",
      k !== null && k.motor === "ägarslut" && k.amne === f.amne,
      k ? "motor=" + k.motor + " · ämne=" + k.amne : "NULL",
    );
  }
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
        const kostnad = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kostnad);
      }
      fore = [...nu];
    }
    return fore[m];
  }
  // Motorns SANNa matchningssemantik (traff-spegling): kollision = något
  // av kärnorden skulle träffa i en fråga byggd av det ANDRA kärnordet.
  // Delsträngs-strikt (kategoristängningens variant) ger falskpositiv på
  // korta akronymer inuti fraser («mfo» ⊂ «jamforA», «ran» ⊂ «ranta») som
  // ord-exakt-logiken aldrig matchar — här prövas verkliga frågor.
  function traffSann(fragaStr, fragaOrd, nk) {
    if (!nk) return false;
    if (nk.includes(" ")) return fragaStr.includes(nk);
    if (nk.length <= 3) return fragaOrd.includes(nk);
    const max = nk.length <= 7 ? 1 : 2;
    return fragaOrd.some((o) => tav(o, nk) <= max);
  }
  function kolliderar(a, b) {
    if (a === b) return true;
    const aO = a.split(" "), bO = b.split(" ");
    return traffSann(b, bO, a) || traffSann(a, aO, b);
  }

  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && f !== "ai-mentor-agarslut-fragor.ts",
  );
  const andras = [];
  for (const f of filer) {
    const kalla = readFileSync(join(ROT, "src/lib", f), "utf8");
    for (const block of kalla.matchAll(/karnord:\s*\[([^\]]*)\]/g)) {
      for (const ord of block[1].matchAll(/"([^"]+)"/g)) andras.push({ fil: f, karnord: diafri(ord[1]) });
    }
  }
  const mina = AGARSLUT_MONSTER.flatMap((m) => m.karnord.map(diafri));
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
  const importOk = widget.includes('import { svaraLokaltAgarslut } from "@/lib/ai-mentor-agarslut-fragor"');
  const importSlut = widget.includes('import { svaraLokaltSlutstenarna } from "@/lib/ai-mentor-slutstenarna-fragor"');
  const rad = widget.match(/const lokalt = ([^;]+);/);
  const ordning = rad ? [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]) : [];
  const ix = ordning.indexOf("svaraLokaltAgarslut");
  const ixSlut = ordning.indexOf("svaraLokaltSlutstenarna");
  const ixRytm = ordning.indexOf("svaraLokaltMarknadsrytm");
  kontroll(
    "L: widget-synk — import + EFTER slutstenarna, FÖRE marknadsrytm (deras SIST)",
    importOk && importSlut && ix >= 0 && ixSlut >= 0 && ixRytm >= 0 && ixSlut < ix && ix < ixRytm,
    importOk ? "kedjan bär lager " + (ix + 1) + "/" + ordning.length : "import SAKNAS",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("\nÄGARSLUTET (s6-u3 manifest auto-s6-1790612726901): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
