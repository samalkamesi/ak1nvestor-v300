/**
 * TESTA AI-MENTORN — ENHETSEKONOMI (s6-u2, omgång 35: enhetsekonomi
 * [tx-06 primär + tx-05 + tx-03 + v02 + v19 + mt-05 + mt-03 som källor] +
 * konverteringstestet [tx-07 primär + tx-06 + tx-05 + tx-03 + bk-08 +
 * km-003 som källor] — KATEGORISTÄNGNING TILLVÄXT).
 *
 * Kör:  node verktyg/testa-ai-mentor-enhetsekonomi.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets två förhandsfrågor (se
 * src/lib/ai-mentor-enhetsekonomi-fragor.ts) med bevakning:
 *   A   2 kanoniska ingångar (enhetsekonomin/konverteringsgraden) → rätt
 *       ämne, primärkälla, FLERKÄLLA (källor = 7/6 + numrerad Källor-rad)
 *       och ≥ 8 kurslänkar + ≥ 2 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter valideringsfönstret, FÖRE marknadsrytm
 *       — deras permanenta SIST-deklaration); A2b monster-antal + syskon-
 *       tåligt TOTALT-tak
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D17 aritmetik maskinellt omräknad (fem talen 600/100/70/3,5/8,6 ·
 *       livslängd 28,6 · LTV 2 000 · nyckeltal 3,33 · årsbortfall 34,8 ·
 *       diskonterat 1 630 · tre liv 4 000/2 000/1 000 med 6,67/3,33/1,67 ·
 *       kassatrappan 600 000/8 571/28 571/2,0 Mkr · spakarna 1,7/20,0 ·
 *       tullen 18+12−6 = 24 · driftkassa 80 · konvertering 0,67 mot 0,75 ·
 *       kassan +11 % · betalningstid 75→90 · cykeln 90→118 (+28) ·
 *       utmaningen 106/0,71/90/113) + gränsvakter i TEXT + registerdrivna
 *       kontroller (TILLVÄXT-antal LIVE, nivå+kapitel, 0 mentorlösa i
 *       TILLVÄXT = kategoristängningen) + fantomslug
 *   E   kanoniska extra-ingångar (CAC, LTV, ARPU, payback, kassatrappan,
 *       tullkvoten, driftkassan, betalningstiden, slirande kvalitet …)
 *   F   null-gränser (dokumenterad ägarpol): «churn»/«churn rate» →
 *       sektordjup · naket «kundlivslängd» → pe-mekaniken · «inflationen»
 *       → makro · «s-kurvan»/«mättnaden» → tx-04/tillväxtdjup ·
 *       «kassakonverteringscykeln»/«rörelsekapital» → kapitalbindningen ·
 *       «nätlånet» → banksektorn · «senioritetsordningen» → skuldordningen —
 *       lämnas ifred av detta lager
 *   F2  juridikgrind — pedagogisk text, PÅHITTADE-markör, inga råd
 *   G   ANTISTÖLD — grannlagers kanoniska (kemisektorn, banksektorn,
 *       valideringsfönstret, skuldordningen, marknadsrytmen …) → NULL hos mig
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS — framtidsäker
 *       när syskonens fönsterlager wireas) + H2 med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER valideringsfönstret och FÖRE
 *       marknadsrytm (deras permanenta SIST) i chat-widget.tsx:s kedja
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
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-enhetsekonomi.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltEnhetsekonomi, ENHETSEKONOMI_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-enhetsekonomi-fragor.ts")).href
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

// ── FALL A: två kanoniska ingångar, två monsters, flerkällskrav ─────────────
const NYA = [
  { fraga: "Vad är enhetsekonomin?", amne: "enhetsekonomin", slug: "tx-06-enhetsekonomin", kallor: 7, kurslankar: 9 },
  { fraga: "Vad är konverteringsgraden?", amne: "konverteringstestet", slug: "tx-07-fran-siffra-till-kassa", kallor: 6, kurslankar: 8 },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltEnhetsekonomi(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " enhetsekonomi", false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length === f.kallor;
  const kallradOk = svar.text.includes("📖 Källor (" + f.kallor + ")");
  const primarForst = svar.kallor?.[0]?.slug === f.slug;
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/")).length;
  const fragorKnappar = svar.handlings.filter((h) => h.lank.startsWith("fragor:")).length;
  kontroll(
    nr + " kanonisk ingång «" + f.fraga + "»",
    amneOk && kallaOk && kallorFinns && kallradOk && primarForst && kurslankar >= f.kurslankar && fragorKnappar >= 2,
    "ämne=" + svar.amne + " · primär=" + svar.kalla.slug + " · källor=" + (svar.kallor?.length ?? 0) +
    " · kurslänkar=" + kurslankar + " · fragor-knappar=" + fragorKnappar,
  );
});

// ── FALL A2: MOTORDEFS-position LIVE ur kedjetestet ─────────────────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], antal: Number(m[5]) }));
  const ix = defs.findIndex((d) => d.namn === "enhetsekonomi");
  const ixVal = defs.findIndex((d) => d.namn === "valideringsfonster");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2 MOTORDEFS — enhetsekonomi wiread med antal 2, index " + ix,
    ix !== -1 && defs[ix].antal === 2 && ixVal !== -1 && ixRytm !== -1 && ixVal < ix && ix < ixRytm,
    "efter valideringsfönstret (" + ixVal + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer totalt " + defs.length,
  );
  kontroll(
    // Omgång 35: enhetsekonomi +2 (detta lager) ⇒ 218 — syskon-tåligt tak:
    // MINST 218; senare fönsters motorer bärs av sina egna leveranser.
    "A2b MONSTER-ANTAL — lagret bär exakt 2 monsters (TOTALT ≥ 218)",
    ENHETSEKONOMI_MONSTER.length === 2 && defs.reduce((s, d) => s + d.antal, 0) >= 218,
    "2 monsters · kedjetestets TOTALT = " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är enhetsekonomi?", amne: "enhetsekonomin" },          // utan -en
  { fraga: "vad är enhetsekonomin", amne: "enhetsekonomin" },          // utan frågetecken
  { fraga: "vad är livstidsvärdet?", amne: "enhetsekonomin" },
  { fraga: "hur räknar man LTV?", amne: "enhetsekonomin" },
  { fraga: "vad är CAC?", amne: "enhetsekonomin" },
  { fraga: "vad är kundbortfall?", amne: "enhetsekonomin" },
  { fraga: "vad är payback?", amne: "enhetsekonomin" },
  { fraga: "vad är kassatrappan?", amne: "enhetsekonomin" },
  { fraga: "vad är en kohort?", amne: "enhetsekonomin" },
  { fraga: "vad är konverteringstestet?", amne: "konverteringstestet" },
  { fraga: "vad är tullkvoten?", amne: "konverteringstestet" },
  { fraga: "vad är driftkassan?", amne: "konverteringstestet" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltEnhetsekonomi(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är enhetsekonomin?", "vad är livstidsvärdet?", "vad är kassatrappan?",
    "vad är konverteringsgraden?", "vad är tullkvoten?", "vad är driftkassan?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltEnhetsekonomi(f, KURSREGISTER);
    const b = svaraLokaltEnhetsekonomi(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (kursernas EGNA modelltal) ────────
{
  const t1 = ENHETSEKONOMI_MONSTER[0].bygga(KURSREGISTER).text;
  const t2 = ENHETSEKONOMI_MONSTER[1].bygga(KURSREGISTER).text;

  kontroll("D01 divisionerna", approx(1 / 0.035, 28.6, 0.05) && approx(70 / 0.035, 2000, 0.5) && approx(600 / 70, 8.6, 0.05) && approx(2000 / 600, 3.33, 0.005) && t1.includes("28,6") && t1.includes("2 000") && t1.includes("8,6") && t1.includes("3,33"), "livslängd 28,6 · LTV 2 000 · payback 8,6 · nyckeltal 3,33");
  kontroll("D02 årsbortfallet", approx(1 - Math.pow(0.965, 12), 0.348, 0.001) && t1.includes("34,8") && t1.includes("INTE 42 procent"), "1−0,965¹² = 34,8 % — månad för månad, inte årsvis");
  kontroll("D03 diskonteringen", approx(0.035 + 0.008, 0.043, 0.0005) && approx(70 / 0.043, 1630, 5) && t1.includes("1 630") && t1.includes("2,7"), "70/(0,035+0,008) ≈ 1 630 kr, nyckeltal ≈ 2,7");
  kontroll("D04 tre liv", approx(70 / 0.0175, 4000, 0.5) && approx(1 / 0.0175, 57.1, 0.05) && approx(4000 / 600, 6.67, 0.005) && approx(70 / 0.07, 1000, 0.5) && approx(1 / 0.07, 14.3, 0.05) && approx(1000 / 600, 1.67, 0.005) && t1.includes("4 000") && t1.includes("57,1") && t1.includes("6,67") && t1.includes("1 000") && t1.includes("14,3") && t1.includes("1,67"), "A/B/C: 4 000/2 000/1 000 kr · 57,1/28,6/14,3 mån · 6,67/3,33/1,67 — payback 8,6 i alla tre");
  kontroll("D05 kassatrappan", 1000 * 600 === 600000 && approx(600000 / 70, 8571, 0.5) && approx(1000 / 0.035, 28571, 0.5) && t1.includes("600 000") && t1.includes("8 571") && t1.includes("28 571") && t1.includes("2,0 miljoner"), "1 000 × 600 = 600 000 ut · brytpunkt 8 571 kunder · jämvikt 28 571 ≈ 2,0 Mkr/mån");
  kontroll("D06 de två spakarna", approx(120 / 70, 1.7, 0.05) && approx(1400 / 70, 20.0, 0.05) && t1.includes("1,7") && t1.includes("20,0"), "organisk 120 kr → 1,7 mån mot betald 1 400 kr → 20,0");
  kontroll("D07 de fem fällorna", ["LTV-inflationen", "bortfalsförnekelsen", "genomsnittsfällan", "1 400 styck"].every((x) => t1.includes(x)) && t1.includes("payback"), "fem fällorna bärs i text (blandade anskaffningens 1 400)");
  kontroll("D08 tullen och driftkassan", 59 - 41 === 18 && 42 - 30 === 12 && 31 - 25 === 6 && 18 + 12 - 6 === 24 && 120 - 18 - 12 + 6 - 10 - 6 === 80 && t2.includes("18 + 12 − 6 = 24") && t2.includes("80 miljoner"), "fordringar +18 · lager +12 · leverantörer +6 · tull 24 · driftkassa 80");
  kontroll("D09 konverteringen", approx(80 / 120, 0.667, 0.005) && approx(72 / 96, 0.75, 0.005) && approx(24 / 40, 0.6, 0.005) && t2.includes("0,67") && t2.includes("0,75") && t2.includes("60 procent"), "80/120 = 0,67 mot 72/96 = 0,75 · tullens andel 24/40 = 60 %");
  kontroll("D10 brytpunkten ett-till-ett", 120 - 96 === 24 && t2.includes("ett till ett") && t2.includes("24 mot 24") === false ? t2.includes("ett till ett") : t2.includes("ett till ett"), "marginalökning 24 mot tull 24 = konverteringens brytpunkt");
  kontroll("D11 kassans tempo", approx(80 / 72 - 1, 0.111, 0.005) && t2.includes("elva procent"), "8/72 = 11,1 % — kassan växer långsammare än allt annat");
  kontroll("D12 betalningstiden", approx((41 / 200) * 365, 75, 0.5) && approx((59 / 240) * 365, 90, 0.5) && approx(59 / 41 - 1, 0.44, 0.01) && t2.includes("75 dagar") && t2.includes("90 dagar") && t2.includes("44 procent"), "41/200×365 = 75 → 59/240×365 = 90 · fordringar +44 % mot omsättning +20 %");
  kontroll("D13 cykeln", approx((30 / 120) * 365, 91, 0.5) && approx((25 / 120) * 365, 76, 0.5) && 75 + 91 - 76 === 90 && approx((42 / 144) * 365, 107, 0.6) && approx((31 / 144) * 365, 79, 0.6) && 90 + 107 - 79 === 118 && t2.includes("90 dagar") && t2.includes("118") && t2.includes("28 dagar"), "90 → 118 dagar (+28) — med attribution till kapitalbindningen (kursens egen avrundning 106,5→107 bärs)");
  kontroll("D14 utmaningens fyra uppgifter", 150 - 20 - 8 + 4 - 12 - 8 === 106 && approx(106 / 150, 0.71, 0.005) && approx((74 / 300) * 365, 90, 0.5) && 90 + 95 - 72 === 113 && t2.includes("106") && t2.includes("0,71") && t2.includes("113 dagar"), "driftkassa 106 · konvertering 0,71 · betalningstid 90 · cykel 113");
  kontroll("D15 zonerna", ["0,8", "0,6", "0,5"].every((z) => t2.includes(z)), "tre zoner: stark/normal/varning");
  kontroll(
    "D16 gränsvakter i TEXT",
    ["tx-05", "tx-03", "v02", "v19", "mt-05", "mt-03", "tx-07"].every((g) => t1.includes(g)) &&
    ["tx-06", "tx-05", "tx-03", "bk-08", "km-003", "kapitalbindning"].every((g) => t2.includes(g)) &&
    t1.includes("churn"),
    "dokumenterade gränser bärs i text med attribution",
  );
  // D17: registerdrivet — kategoriantal och nivå LIVE.
  const txAntal = KURSREGISTER.filter((r) => r.kategori === "TILLVÄXT").length;
  kontroll(
    "D17 registerdrivet kategoriantal",
    txAntal > 0 && t1.includes("I kategorin tillväxt finns " + txAntal + " kurser") && t2.includes("I kategorin tillväxt finns " + txAntal + " kurser"),
    "TILLVÄXT = " + txAntal + " LIVE ur KURSREGISTER (båda monstren)",
  );
  const tx06 = KURSREGISTER.find((r) => r.slug === "tx-06-enhetsekonomin");
  const tx07 = KURSREGISTER.find((r) => r.slug === "tx-07-fran-siffra-till-kassa");
  kontroll(
    "D18 nivåmarkör + kapitel",
    !!tx06 && tx06.niva === "Intermediär" && t1.includes("intermediär nivå, 6 kapitel") &&
    !!tx07 && tx07.niva === "Intermediär" && t2.includes("intermediär nivå, 6 kapitel"),
    "tx-06/tx-07 = " + (tx06 ? tx06.niva : "?") + " (registerdrivet, LIVE)",
  );
  // D19: kategoristängningen — 0 mentorlösa i TILLVÄXT efter detta lager.
  {
    const fragorFiler = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));
    const allText = fragorFiler.map((f) => readFileSync(join(ROT, "src/lib", f), "utf8")).join("\n");
    const txKurser = KURSREGISTER.filter((r) => r.kategori === "TILLVÄXT");
    const losa = txKurser.filter((r) => !allText.includes(r.slug));
    kontroll(
      "D19 KATEGORISTÄNGNING — 0 mentorväglösa i TILLVÄXT",
      losa.length === 0,
      losa.length ? "lösa: " + losa.map((r) => r.slug).join(", ") : "alla " + txKurser.length + " TILLVÄXT-kurser nämns i någon modul",
    );
  }
  // D20: kurslänkarnas slug:ar — alla äkta mot registret.
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  for (const [ix, monster] of ENHETSEKONOMI_MONSTER.entries()) {
    const svaret = monster.bygga(KURSREGISTER);
    const kursSlugs = svaret.handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", ""));
    const fantomer = [...kursSlugs, ...svaret.kallor.map((k) => k.slug).filter(Boolean)].filter((s) => !slugSet.has(s));
    kontroll("D2" + (ix === 0 ? "0a" : "0b") + " fantomslug (monster " + (ix + 1) + ")", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : (kursSlugs.length + svaret.kallor.length) + " äkta slug:ar");
  }
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är ARPU?", "vad är LTV per CAC?", "vad är kundanskaffningskostnaden?",
    "vad är värvningskostnaden?", "vad är återbetalningstiden?", "vad är jämviktsstocken?",
    "vad är ersättningsmaskinen?", "vad är marginalanskaffning?", "vad är nästa kunds kostnad?",
    "vad är konverteringstestet?", "vad är betalningstiden?", "vad är lagertiden?",
    "vad är leverantörstiden?", "vad är slirande kvalitet?", "vad är äkta tull?",
    "vad är intäktsraden?", "vad är kassaraden?", "vad är tullens andel?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltEnhetsekonomi(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är churn?",             // sektordjupets kärnord — deras fångst vinner (V19)
    "vad är churn rate?",        // sektordjupets
    "vad är kundlivslängd?",     // pe-mekanikens «fondlivslängd» (tav 2 — kasserad)
    "vad är kundlivslängden?",   // samma familj (den bestämda formen — J-fallets levande fångst)
    "vad är inflationen?",       // makrons («ltv inflationen»-familjens ägare)
    "vad är s-kurvan?",          // tx-04/tillväxtdjupet (kategorigrannen)
    "vad är mättnaden?",         // tx-04/tillväxtdjupet
    "vad är kassakonverteringscykeln?", // kapitalbindningens begrepp
    "vad är rörelsekapital?",    // kapitalbindningens
    "vad är nätlånet?",          // banksektorns
    "vad är senioritetsordningen?", // skuldordningens
    "vad är walk-forward?",      // valideringsfönstrets
  ];
  const stulna = gransor.filter((f) => svaraLokaltEnhetsekonomi(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2: juridikgrind — pedagogisk text, aldrig rekommendation ──────────
{
  const t1 = ENHETSEKONOMI_MONSTER[0].bygga(KURSREGISTER).text;
  const t2 = ENHETSEKONOMI_MONSTER[1].bygga(KURSREGISTER).text;
  const paddagogisk = t1.includes("utbildning") && t1.includes("inga placeringstips") && t2.includes("utbildning") && t2.includes("inga placeringstips");
  const pahittade = t1.includes("påhittade") && t2.includes("påhittade");
  const ingaRad = !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t1) && !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t2);
  kontroll("F2 juridikgrind (båda monstren)", paddagogisk && pahittade && ingaRad, "pedagogisk + påhittade värden + 0 rådsformuleringar");
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL hos detta lager ────────
{
  const grannar = [
    "vad är kemisektorn?", "vad är balanspriset?",        // kemisektor
    "vad är banksektorn?", "vad är räntenätet?",          // banksektorn
    "vad är senioritetsordningen?", "vad är valutasäkringen?", // skuldordningen
    "vad är kompetensparadoxen?", "vad är kreditderivatet?", // nyfodda
    "vad är walk-forward?",                              // valideringsfönstret (föregångaren)
    "vad är marknadsrytmen?", "vad är korrelationsrisken?", // marknadsrytm (efterföljaren)
    "vad är budprocessen?", "vad är EVA?",               // kategoristängningen
    "vad är övningsbolaget?",                            // casepraktiken
    "vad är moat?", "vad är vallgraven?",                // moat-familjen
  ];
  const stulna = grannar.filter((f) => svaraLokaltEnhetsekonomi(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "enhetsekonomi");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är enhetsekonomin?", "vad är livstidsvärdet?", "vad är kassatrappan?",
    "vad är konverteringsgraden?", "vad är tullkvoten?", "vad är driftkassan?",
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
  const svarar = kanoniska.map((f) => svaraLokaltEnhetsekonomi(f, KURSREGISTER) !== null);
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
  const mina = ENHETSEKONOMI_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-enhetsekonomi-fragor.ts",
  );
  const kollisioner = [];
  for (const fil of filer) {
    const kalla = readFileSync(join(ROT, "src/lib", fil), "utf8");
    for (const block of kalla.matchAll(/karnord: \[([^\]]+)\]/g)) {
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
  kontroll("J kärnordsdisjunktion — " + mina.length + " kärnord mot " + filer.length + " andra lager", kollisioner.length === 0, kollisioner.length ? kollisioner.slice(0, 5).join(" | ") : "0 kollisioner");
}

// ── FALL L: widget-synk — import + kedjeposition ────────────────────────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const rader = widget.split("\n").filter((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const FEL = [];
  if (rader.length !== 1) FEL.push("hittade " + rader.length + " kedjerader (väntat exakt 1)");
  const rad = rader[0] ?? "";
  const posVal = rad.indexOf("svaraLokaltValideringsfonster(");
  const posMin = rad.indexOf("svaraLokaltEnhetsekonomi(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("enhetsekonomi saknas i kedjeraden");
  if (posVal === -1 || posMin === -1 || posRytm === -1 || !(posVal < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat valideringsfönstret < enhetsekonomi < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-enhetsekonomi-fragor"')) FEL.push("importen saknas");
  kontroll(
    "L widget-synk — efter valideringsfönstret, FÖRE marknadsrytm (deras permanenta SIST)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "85:e motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u2 omgång 35 (enhetsekonomi — KATEGORISTÄNGNING TILLVÄXT): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
