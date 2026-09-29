/**
 * TESTA AI-MENTORN — PEIB-SLUTET (s6-u3, manifest auto-s6-1790670317558:
 * EVIGHETSKAPITALET [ib-06-evighetskapitalet primär + pe-06 + pe-02 +
 * pe-05 + ib-05 + ib-03 + km-067 + the-intelligent-asset-allocator] +
 * AVGIFTSMASKINEN [pe-08-avgiftsmaskinen primär + pe-02 + pe-06 + pe-07 +
 * pe-01 + ib-05 + rk-16] + UTDELNINGSREKAPITALISERINGEN
 * [pe-09-utdelningsrekapitaliseringen primär + pe-02 + pe-03 + pe-08 +
 * st-01 + st-02 + st-05 + ud-08] — KATEGORISTÄNGNING PRIVATE EQUITY &
 * INVESTMENTBOLAG 18/18).
 *
 * Kör:  node verktyg/testa-ai-mentor-peib-slutet.mjs
 * Krav: Node >= 22.18 (type stripping default).
 *
 *   A   3 kanoniska ingångar → rätt ämne, primärkälla, FLERKÄLLA
 *       (8/7/8 källor) + ≥7 kurslänkar + ≥2 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter indexinklusion, FÖRE marknadsrytm);
 *       A2b monster-antal + syskon-tåligt TOTALT-tak
 *   B   18 varianter → rätt monster
 *   C   determinism — bitidentiskt
 *   D01–D20 aritmetik maskinellt omräknad (21,7/14,3/16,1 · 52 %/35 % ·
 *       20/år på förbandet · 160 = 16 % · 840 plant · 400/469 tröskel ·
 *       X = 100 uppfångst · 60 = 8,6 % · 160/40 · 140 = 20,0 % ·
 *       1 560 + 140 = 1 700 · 140/560 = 25,0 % · clawback 40 ·
 *       8,0×/60 %/4,8× · 1 080/440/41,6/70,2/4,33/2,56 · MOIC 2,00 ·
 *       IRR 14,9/18,9 · riskflytt 40 per hundra) + gränsvakter i TEXT +
 *       registerdrivet (PEIB-antal LIVE, kapiteltal) + 3 primära
 *       aktiverade bland levande lager + fantomslug ×3
 *   E   kanoniska extra-ingångar
 *   F   null-gränser («vattenfallet»/«carried interest»/«irr»/«dpi» →
 *       pe-mekaniken · «j-kurvan» → pengarstid · «kostnadstrappan» →
 *       ib-05:s värld · «familjekontoret» → agarslut · «spärrkonto» →
 *       banksektorn · grannkanoniska)
 *   F2  juridikgrind
 *   G   ANTISTÖLD — grannlagers kanoniska → NULL
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta
 *       lager (LIVE ur MOTORDEFS) + H2 med lager
 *   J   KÄRNORDSDISJUNKTION LIVE mot levande lagers KÄRNORD (J testar
 *       kärnord mot kärnord enligt spårets standard — starkordsöverlapp
 *       är av design ofarliga: starkord kan aldrig fånga en fråga utan
 *       eget kärnord; ospelade filer exkluderas — en modul utan
 *       kedjeposition är inte ett levande lager)
 *   L   widget-synk — import + EFTER indexinklusion, FÖRE marknadsrytm
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
  console.error("FEL: Node " + process.versions.node + " saknar type stripping.");
  process.exit(1);
}

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltPeibSlutet, PEIB_SLUTET_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-peib-slutet-fragor.ts")).href
);

let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) { pass++; console.log("PASS  " + namn + (detalj ? "  — " + detalj : "")); }
  else { fail++; console.log("FAIL  " + namn + (detalj ? "  — " + detalj : "")); }
}
function approx(a, b, tolerans = 0.005) { return Math.abs(a - b) <= tolerans; }

// ── FALL A ──────────────────────────────────────────────────────────────────
const NYA = [
  { fraga: "Vad är evighetskapitalet?", amne: "evighetskapitalet", slug: "ib-06-evighetskapitalet", kallor: 8, kurslankar: 8 },
  { fraga: "Vad är avgiftsmaskinen?", amne: "avgiftsmaskinen", slug: "pe-08-avgiftsmaskinen", kallor: 7, kurslankar: 7 },
  { fraga: "Vad är en utdelningsrekapitalisering?", amne: "utdelningsrekapitaliseringen", slug: "pe-09-utdelningsrekapitaliseringen", kallor: 8, kurslankar: 8 },
];
NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltPeibSlutet(f.fraga, KURSREGISTER);
  if (!svar) { kontroll(nr, false, "inget svar på: '" + f.fraga + "'"); return; }
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/")).length;
  const fragorKnappar = svar.handlings.filter((h) => h.lank.startsWith("fragor:")).length;
  kontroll(
    nr + " kanonisk ingång «" + f.fraga + "»",
    svar.amne === f.amne && svar.kalla.slug === f.slug && Array.isArray(svar.kallor) && svar.kallor.length === f.kallor &&
    svar.text.includes("📖 Källor (" + f.kallor + ")") && svar.kallor?.[0]?.slug === f.slug && kurslankar >= f.kurslankar && fragorKnappar >= 2,
    "ämne=" + svar.amne + " · primär=" + svar.kalla.slug + " · källor=" + (svar.kallor?.length ?? 0) + " · kurslänkar=" + kurslankar,
  );
});

// ── FALL A2 ─────────────────────────────────────────────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const ix = defs.findIndex((d) => d.namn === "peibslutet");
  const ixIdx = defs.findIndex((d) => d.namn === "indexinklusion");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll("A2 MOTORDEFS — antal 3, index " + ix, ix !== -1 && defs[ix].antal === 3 && ixIdx !== -1 && ixRytm !== -1 && ixIdx < ix && ix < ixRytm,
    "efter indexinklusion (" + ixIdx + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer " + defs.length);
  kontroll("A2b MONSTER-ANTAL (TOTALT ≥ 235)", PEIB_SLUTET_MONSTER.length === 3 && defs.reduce((s, d) => s + d.antal, 0) >= 235,
    "3 monsters · TOTALT = " + defs.reduce((s, d) => s + d.antal, 0));
}

// ── FALL B ──────────────────────────────────────────────────────────────────
const VARIANTER = [
  { fraga: "vad är evergreen?", amne: "evighetskapitalet" },
  { fraga: "vad är realiseringsfrihet?", amne: "evighetskapitalet" },
  { fraga: "vad är inlösenrätt?", amne: "evighetskapitalet" },
  { fraga: "vad är panikrummet?", amne: "evighetskapitalet" },
  { fraga: "vad är evighetsromantiken?", amne: "evighetskapitalet" },
  { fraga: "vad är likviditetsillusionen?", amne: "evighetskapitalet" },
  { fraga: "vad är tidens tre utfall?", amne: "evighetskapitalet" },
  { fraga: "vad är 2/20?", amne: "avgiftsmaskinen" },
  { fraga: "vad är tröskeln?", amne: "avgiftsmaskinen" },
  { fraga: "vad är uppfångsten?", amne: "avgiftsmaskinen" },
  { fraga: "vad är fördelningstrappan?", amne: "avgiftsmaskinen" },
  { fraga: "vad är clawback?", amne: "avgiftsmaskinen" },
  { fraga: "vad är plant läge?", amne: "avgiftsmaskinen" },
  { fraga: "vad är nordisk kurs?", amne: "avgiftsmaskinen" },
  { fraga: "vad är dividend recap?", amne: "utdelningsrekapitaliseringen" },
  { fraga: "vad är utdelningen som lån?", amne: "utdelningsrekapitaliseringen" },
  { fraga: "vad är riskflyttningen?", amne: "utdelningsrekapitaliseringen" },
  { fraga: "vad är nybelåningen?", amne: "utdelningsrekapitaliseringen" },
];
VARIANTER.forEach((v, i) => {
  const svar = svaraLokaltPeibSlutet(v.fraga, KURSREGISTER);
  kontroll("B" + String(i + 1).padStart(2, "0") + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C ──────────────────────────────────────────────────────────────────
{
  const fragor = ["vad är evighetskapitalet?", "vad är panikrummet?", "vad är tidens tre utfall?",
    "vad är avgiftsmaskinen?", "vad är tröskeln?", "vad är fördelningstrappan?",
    "vad är en utdelningsrekapitalisering?", "vad är dividend recap?", "vad är riskflyttningen?"];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltPeibSlutet(f, KURSREGISTER);
    const b = svaraLokaltPeibSlutet(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D ──────────────────────────────────────────────────────────────────
{
  const t1 = PEIB_SLUTET_MONSTER[0].bygga(KURSREGISTER).text;
  const t2 = PEIB_SLUTET_MONSTER[1].bygga(KURSREGISTER).text;
  const t3 = PEIB_SLUTET_MONSTER[2].bygga(KURSREGISTER).text;

  kontroll("D01 tidens första utfall", approx(Math.pow(1.08, 40), 21.72, 0.02) && t1.includes("21,7"), "1,08^40 = " + Math.pow(1.08, 40).toFixed(2) + " ≈ 21,7× — oavbruten förvaltning");
  kontroll("D02 tidens andra utfall", approx(Math.pow(1.08, 10) * 0.9, 1.943, 0.001) && approx(Math.pow(1.943, 4), 14.26, 0.02) && t1.includes("14,3"), "1,08¹⁰ × 0,90 = 1,943; 1,943⁴ = 14,3× (klockad)");
  kontroll("D03 tidens tredje utfall", approx(Math.pow(1.08, 9) * 0.8, 1.60, 0.01) && approx(Math.pow(1.08, 30) * 1.6, 16.10, 0.02) && t1.includes("16,1"), "1,08⁹ × 0,80 = 1,60; 1,08³⁰ × 1,60 = 16,1× (tidsstressad)");
  kontroll("D04 utfallens gap", approx(21.72 / 14.26, 1.522, 0.01) && approx((21.72 - 16.10) / 16.10, 0.349, 0.01) && t1.includes("52 procent") && t1.includes("35 procent"), "21,7/14,3 = +52 % · 16,1 är 35 % under 21,7");
  kontroll("D05 fasta hjulet", approx(0.02 * 1000, 20) && approx(8 * 20, 160) && t2.includes("160") && t2.includes("16 procent") && t2.includes("840"), "2 % × 1 000 = 20/år · 8 × 20 = 160 = 16 % · plant läge 840");
  kontroll("D06 tröskelns två sätt", approx(5 * 0.08 * 1000, 400) && approx(Math.pow(1.08, 5), 1.4693, 0.0002) && t2.includes("400") && t2.includes("469") && t2.includes("69 miljoner"), "enkel 400 mot ränta-på-ränta 1,08⁵ = 1,4693 ⇒ 469 — 69 Mkr om beräkningssättet");
  kontroll("D07 uppfångstens ekvation", approx(80 / 0.8, 100) && approx((0.2 * 300) / 700, 0.0857, 0.001) && t2.includes("X = 100") && t2.includes("8,6 procent"), "X = 0,20 × (400 + X) ⇒ X = 100 · utan: 60/700 = 8,6 %");
  kontroll("D08 trappan stänger", 700 - 400 - 100 === 200 && approx(100 + 40, 140) && approx(140 / 700, 0.2, 0.001) && approx(1000 + 400 + 160, 1560) && approx(1560 + 140, 1700) && t2.includes("160/40") && t2.includes("20,0 procent") && t2.includes("1 560 + 140 = 1 700"), "1 000 → 400 → 100 → 200 (160/40) · carry 140 = 20,0 % av 700 · LP 1 560 + 140 = 1 700");
  kontroll("D09 netto-kvoten", approx(140 / 560, 0.25, 0.001) && t2.includes("140/560 = 25,0"), "140/560 = 25,0 % — en fjärdedel av netto-vinsten");
  kontroll("D10 clawback två vägar", approx(140 - 0.2 * 500, 40) && approx(60 - 0.2 * 100, 40) && t2.includes("40") && t2.includes("sex år tidigare"), "helfonden: 140 − 0,20 × 500 = 40 · deal-för-deal: 60 − 20 = 40 sex år tidigare");
  kontroll("D11 rekapens köp", approx(1200 / 150, 8.0, 0.001) && approx(720 / 1200, 0.6, 0.001) && approx(720 / 150, 4.8, 0.001) && t3.includes("8,0") && t3.includes("60 procent") && t3.includes("480"), "EV 1 200 = 8,0× 150 · lån 720 = 60 % · EK 480 · skuld/EBITDA 4,8");
  kontroll("D12 nya lånet och täckningen", approx(6.0 * 180, 1080) && approx(1080 - 640, 440) && approx(640 * 0.065, 41.6, 0.01) && approx(1080 * 0.065, 70.2, 0.01) && approx(180 / 41.6, 4.33, 0.01) && approx(180 / 70.2, 2.56, 0.01) && t3.includes("1 080") && t3.includes("440") && t3.includes("4,33") && t3.includes("2,56"), "6,0 × 180 = 1 080 ⇒ 440 ut · ränta 41,6 → 70,2 · täckning 4,33 → 2,56");
  kontroll("D13 IRR utan rekap", approx(960 / 480, 2.0, 0.001) && approx(960 / Math.pow(1.149, 5), 480, 1) && t3.includes("14,9") && t3.includes("MOIC 2,00"), "−480 → +960: MOIC 2,00 · NPV(14,9 %) = " + (960 / Math.pow(1.149, 5)).toFixed(0) + " ≈ 480");
  kontroll("D14 IRR med rekap", approx(440 / Math.pow(1.189, 3) + 520 / Math.pow(1.189, 5), 480, 1) && approx(440 + 520, 960) && t3.includes("18,9") && t3.includes("+4,0 procentenheter"), "−480 → +440 år 3 → +520 år 5: NPV(18,9 %) = " + (440 / Math.pow(1.189, 3) + 520 / Math.pow(1.189, 5)).toFixed(0) + " ≈ 480 · +4,0 pp av klockan");
  kontroll("D15 riskflyttet", approx(480 - 440, 40) && t3.includes("40 kronor per börjad hundra") && t3.includes("28,6"), "riskerat kapital 480 → 40 per hundra · räntedriften +28,6/år");
  kontroll("D16 gränsvakter i TEXT",
    ["pe-mekaniken", "J-kurvan", "kostnadstrappan"].every((g) => t2.includes(g)) &&
    ["pe-mekaniken", "refinansieringsmuren", "extrautdelningar"].every((g) => t3.includes(g)) &&
    ["kostnadstrappan", "familjekontoret"].every((g) => t1.includes(g)),
    "dokumenterade gränser bärs i text med attribution (t1 kostnadstrappan+familjekontoret · t2 pe-mekaniken+j-kurvan+kostnadstrappan · t3 pe-mekaniken+refinansieringsmuren+extrautdelningar)");
  const peibAntal = KURSREGISTER.filter((r) => r.kategori === "PRIVATE EQUITY & INVESTMENTBOLAG").length;
  kontroll("D17 registerdrivet kategoriantal", peibAntal === 18 && t1.includes("I kategorin private equity & investmentbolag finns " + peibAntal + " kurser") && t2.includes("I kategorin private equity & investmentbolag finns " + peibAntal + " kurser") && t3.includes("I kategorin private equity & investmentbolag finns " + peibAntal + " kurser"), "PRIVATE EQUITY & INVESTMENTBOLAG = " + peibAntal + " LIVE (alla tre monstren)");
  const ib06 = KURSREGISTER.find((r) => r.slug === "ib-06-evighetskapitalet");
  const pe08 = KURSREGISTER.find((r) => r.slug === "pe-08-avgiftsmaskinen");
  const pe09 = KURSREGISTER.find((r) => r.slug === "pe-09-utdelningsrekapitaliseringen");
  kontroll("D18 kapiteltal registerdrivet",
    !!ib06 && t1.includes(ib06.kapitel + " kapitel") && !!pe08 && t2.includes(pe08.kapitel + " kapitel") && !!pe09 && t3.includes(pe09.kapitel + " kapitel"),
    "ib-06 " + (ib06 ? ib06.kapitel : "?") + " kap · pe-08 " + (pe08 ? pe08.kapitel : "?") + " kap · pe-09 " + (pe09 ? pe09.kapitel : "?") + " kap (LIVE)");
  // D19: de tre primära kurserna aktiverade bland LEVANDE lager (basen räknas).
  {
    const kedja = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
    const wireade = new Set([...kedja.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)"/g)].map((m) => m[2]));
    const filer = ["ai-mentor-svar.ts"].concat(readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f) && wireade.has(f)));
    const allText = filer.map((f) => readFileSync(join(ROT, "src/lib", f), "utf8")).join("\n");
    const aktiva = ["ib-06-evighetskapitalet", "pe-08-avgiftsmaskinen", "pe-09-utdelningsrekapitaliseringen"].filter((s) => allText.includes(s));
    kontroll("D19 primärkurserna aktiverade", aktiva.length === 3, aktiva.length === 3 ? "alla tre primära nämns bland " + filer.length + " levande filer" : "saknas: " + aktiva.join(","));
  }
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  for (const [ix, monster] of PEIB_SLUTET_MONSTER.entries()) {
    const svaret = monster.bygga(KURSREGISTER);
    const kursSlugs = svaret.handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", ""));
    const fantomer = [...kursSlugs, ...svaret.kallor.map((k2) => k2.slug).filter(Boolean)].filter((s) => !slugSet.has(s));
    kontroll("D2" + (ix === 0 ? "0a" : ix === 1 ? "0b" : "0c") + " fantomslug (monster " + (ix + 1) + ")", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(",") : (kursSlugs.length + svaret.kallor.length) + " äkta");
  }
}

// ── FALL E ──────────────────────────────────────────────────────────────────
{
  const ingangar = [
    "vad är evighetskapitalet?", "vad är evergreen?", "vad är inlösningsfrihet?",
    "vad är tidpunktsfrihet?", "vad är kapitalets klockor?", "vad är utgång på rabatt?",
    "vad är evighetsprotokollet?", "vad är två klockor?",
    "vad är avgiftsavtalet?", "vad är det fasta hjulet?", "vad är resultathjulet?",
    "vad är två och tjugo?", "vad är avgiftsbördan?", "vad är återbetalningsskyldigheten?",
    "vad är kapitalförvaltarna?", "vad är fondförvaltaren?",
    "vad är rekapen?", "vad är rekapitaliseringen?", "vad är dubbelseendet?",
    "vad är norra trä?", "vad är stenbro?", "vad är skulden som betalar ägaren?",
    "vad är pengarna före utgången?", "vad är utdelningen som lån?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltPeibSlutet(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length);
}

// ── FALL F ──────────────────────────────────────────────────────────────────
{
  const gransor = [
    "vad är vattenfallet?",        // pe-mekanikens KÄRNORD
    "vad är carried interest?",    // pe-mekanikens KÄRNORD
    "vad är carry?",               // pe-mekanikens KÄRNORD
    "vad är irr?",                 // pe-mekanikens KÄRNORD (nås här via «irr-magin»)
    "vad är irr-magin?",           // TESTFYND: frågeordet «irr» klyvs ur frasen och fångas av pe-mekanikens enords-kärnord FÖRE detta lager — kärnordet struket här, frasen bärs i TEXT
    "vad är dpi?",                 // pe-mekanikens KÄRNORD
    "vad är fondlivslängden?",     // pe-mekanikens KÄRNORD
    "vad är j-kurvan?",            // pengarstids familj
    "vad är kostnadstrappan?",     // ib-05:s värld (börsbolagets)
    "vad är familjekontoret?",     // agarslutets (ib-07 deras)
    "vad är spärrkonto?",          // banksektorns «sparkontot» t=1 — nämns endast i text
    "vad är covenanter?",          // ks-05:s ägare
    "vad är extrautdelningar?",    // ud-08:s familj
    "vad är indexinklusionen?",    // indexinklusion-lagrets (u1:s omgången)
    "vad är co-investeringen?",    // co-invest-lagrets
    "vad är andrahandsmarknaden?", // pengarstid-lagrets
  ];
  const stulna = gransor.filter((f) => svaraLokaltPeibSlutet(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2 ─────────────────────────────────────────────────────────────────
{
  const t1 = PEIB_SLUTET_MONSTER[0].bygga(KURSREGISTER).text;
  const t2 = PEIB_SLUTET_MONSTER[1].bygga(KURSREGISTER).text;
  const t3 = PEIB_SLUTET_MONSTER[2].bygga(KURSREGISTER).text;
  const paddagogisk = [t1, t2, t3].every((t) => t.includes("utbildning") && t.includes("inga placeringstips"));
  const pahittade = [t1, t2, t3].every((t) => t.includes("påhittad"));
  const ingaRad = [t1, t2, t3].every((t) => !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t));
  kontroll("F2 juridikgrind (alla tre monstren)", paddagogisk && pahittade && ingaRad, "pedagogisk + påhittade tal + 0 rådsformuleringar");
}

// ── FALL G ──────────────────────────────────────────────────────────────────
{
  const grannar = [
    "vad är inklusionseffekten?", "vad är en indexvikt?", "vad är en terminsstyrelse?", // indexinklusion
    "vad är marknadsrytmen?", "vad är korrelationsrisken?", // marknadsrytm
    "vad är Investor AB?", "vad är familjekontoret?", // agarslut
    "vad är årsreview?", // arsreview
    "vad är bankens lönsamhet?", // slutstenarna
    "vad är O'Shaughnessys bevis?", "vad är den magiska formeln?", // faktorfadrarna
    "vad är intermarket-kedjan?", "vad är storhetssprånget?", // bokmastar2
    "vad är andelen bredvid fonden?", // co-invest
    "vad är senioritetsordningen?", // skuldordning
    "vad är budgetdisciplinen?", // nykull-familjens grannar
  ];
  const stulna = grannar.filter((f) => svaraLokaltPeibSlutet(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H ──────────────────────────────────────────────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "peibslutet");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är evighetskapitalet?", "vad är panikrummet?", "vad är tidens tre utfall?",
    "vad är avgiftsmaskinen?", "vad är tröskeln?", "vad är fördelningstrappan?",
    "vad är en utdelningsrekapitalisering?", "vad är dividend recap?", "vad är riskflyttningen?",
  ];
  const skuggor = [];
  for (const f of kanoniska) {
    for (const m of MOTORER) {
      if (m.fnk(f, KURSREGISTER) !== null) skuggor.push(f + " (" + m.namn + ")");
    }
  }
  kontroll("H utan lager — " + kanoniska.length + " kanoniska NULL genom " + MOTORER.length + " motorer (LIVE)", skuggor.length === 0,
    skuggor.length ? "SKUGGAD: " + skuggor.join(", ") : "0 skuggor — territoriet fritt");
  const svarar = kanoniska.map((f) => svaraLokaltPeibSlutet(f, KURSREGISTER) !== null);
  kontroll("H2 med lager — samtliga svarar", svarar.every(Boolean), svarar.filter(Boolean).length + "/" + svarar.length);
}

// ── FALL J ──────────────────────────────────────────────────────────────────
// J testar KÄRNORD mot LEVANDE lagers KÄRNORD (spårets standard). Starkords-
// överlapp är ofarliga: starkord kan aldrig fånga en fråga utan eget kärnord
// i samma fråga (motorns poängsättning). Ospelade filer (ej i MOTORDEFS)
// exkluderas — ingen kedjeposition, ingen fångst.
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
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const wireade = new Set([...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)"/g)].map((m) => m[2]));
  const mina = PEIB_SLUTET_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-peib-slutet-fragor.ts" && wireade.has(f),
  );
  const kollisioner = [];
  for (const fil of filer) {
    const kalla2 = readFileSync(join(ROT, "src/lib", fil), "utf8");
    const utanKommentarer = kalla2.replace(/^[ \t]*\/\/.*$/gm, "");
    for (const block of utanKommentarer.matchAll(/karnord:\s*\[([^\]]+)\]/g)) {
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
  kontroll("J kärnordsdisjunktion — " + mina.length + " kärnord mot " + filer.length + " levande lager",
    kollisioner.length === 0, kollisioner.length ? kollisioner.slice(0, 5).join(" | ") : "0 kollisioner");
}

// ── FALL L ──────────────────────────────────────────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rader = widget.split("\n").filter((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const FEL = [];
  if (rader.length !== 1) FEL.push(rader.length + " kedjerader (väntat 1)");
  const rad = rader[0] ?? "";
  const posIdx = rad.indexOf("svaraLokaltIndexinklusion(");
  const posMin = rad.indexOf("svaraLokaltPeibSlutet(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("peibslutet saknas i kedjeraden");
  if (posIdx === -1 || posMin === -1 || posRytm === -1 || !(posIdx < posMin && posMin < posRytm)) FEL.push("ordning fel (väntat indexinklusion < peibslutet < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-peib-slutet-fragor"')) FEL.push("importen saknas");
  kontroll("L widget-synk — efter indexinklusion, FÖRE marknadsrytm (SIST)", FEL.length === 0, FEL.length ? FEL.join(" | ") : "wiread med import");
}

console.log("");
console.log("AI-MENTORN spår 6 s6-u3 (peibslutet — evighetskapitalet + avgiftsmaskinen + utdelningsrekapitaliseringen ⇒ PE/IB 18/18): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
