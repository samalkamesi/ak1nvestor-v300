/**
 * TESTA AI-MENTORN — KEMISEKTORN (s6-u1, fönster 29: kemisektorn [se-21
 * primär + se-16 + km-029 + ln-03 + mt-07 som källor] — molekylens ekonomi:
 * kväve ur luft, fosfor ur berg, balanspriset).
 *
 * Kör:  node verktyg/testa-ai-mentor-kemisektor.mjs
 * Krav: Node >= 22.18 (type stripping default — samma som testa-ai-mentor.mjs).
 *
 * Regressionstest för fönstrets förhandsfråga (se
 * src/lib/ai-mentor-kemisektor-fragor.ts) med bevakning:
 *   A   2 kanoniska ingångar (kemisektorn/bulkkemin) → rätt ämne,
 *       primärkälla, FLERKÄLLA (kallor = 5 + numrerad Källor-rad) och
 *       ≥ 4 kurslänkar + ≥ 2 fragor-knappar
 *   A2  MOTORDEFS-position LIVE (efter handelsemotor, FÖRE marknadsrytm —
 *       deras SIST-deklaration); A2b monster-antal + syskon-tåligt TOTALT-tak
 *   B   12 felstavade/varierade varianter → samma träff
 *   C   determinism — alla frågor två gånger ⇒ bitidentiskt svar
 *   D01–D11 aritmetik maskinellt omräknad (Norden Bulk 2 160 · Norden
 *       Special 1 140 · vinstandelen 34,5 % på 20 % av omsättningen ·
 *       ammoniakens 33 energienheter ⇒ 132/264/396 · balanspriset
 *       14 mot 278 = nitton gånger · pris 500 ⇒ −46/218) + D12–D13
 *       registerdrivna kontroller (SEKTORANALYS-antal LIVE, nivåmarkör)
 *       + D14 fantomslug
 *   E   kanoniska extra-ingångar (specialkemin, ammoniaken, fosforn,
 *       balanspriset, högkostnadspartnern, kvävefixeringen …)
 *   F   null-gränser (dokumenterade ägarpol): «en moat»/«en moat i siffror»
 *       (extra) · «gruvsektorn»/«malmen» (se-20:s familj — NULL i kedjan
 *       men DERAS territorium) · «nätverkseffekter» (basens) ·
 *       «marginaltrappan» (volatilitetsmekanikens) · «prisfullmakten»
 *       (moatdjupets) — lämnas ifred av detta lager
 *   F2  juridikgrind — pedagogisk text, PÅHITTADE-markör, inga råd
 *   G   ANTISTÖLD — grannlagers kanoniska (marginaltrappan, prisfullmakten,
 *       scenarioanalysen, bruttomarginalen, gruvsektorn …) → NULL hos mig
 *   H   ÄGAR-INVARIANT — kanoniska NULL genom HELA kedjan utan detta lager
 *       (motorlistan läses LIVE ur kedjetestets MOTORDEFS — framtidsäker
 *       när syskonens fönsterlager wireas) + H2 med detta lager
 *   J   KÄRNORDSDISJUNKTION LIVE — kärnorden lästa ur samtliga
 *       src/lib/ai-mentor-*-fragor.ts (utom detta lager): inget kärnord
 *       delas med annat lager (tav-tolerans enligt motorn)
 *   L   widget-synk — import + EFTER handelsemotor och FÖRE marknadsrytm
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-kemisektor.mjs",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltKemisektor, KEMISEKTOR_MONSTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-kemisektor-fragor.ts")).href
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
const NYA = [
  { fraga: "Vad är kemisektorn?", amne: "kemisektorn", slug: "se-21-kemisektorn" },
  { fraga: "Vad är bulkkemin?", amne: "kemisektorn", slug: "se-21-kemisektorn" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltKemisektor(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " kemisektor", false, "inget lokalt svar på: '" + f.fraga + "'");
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
  const ix = defs.findIndex((d) => d.namn === "kemisektor");
  const ixHandelse = defs.findIndex((d) => d.namn === "handelsemotor");
  const ixRytm = defs.findIndex((d) => d.namn === "marknadsrytm");
  kontroll(
    "A2 MOTORDEFS — kemisektor wiread med antal 1, index " + ix,
    ix !== -1 && defs[ix].antal === 1 && ixHandelse !== -1 && ixRytm !== -1 && ixHandelse < ix && ix < ixRytm,
    "efter handelsemotor (" + ixHandelse + " < " + ix + "), före marknadsrytm (" + ix + " < " + ixRytm + ") · motorer totalt " + defs.length,
  );
  kontroll(
    // Fönster 29 tre byggare: handelsemotor +2 (u2) ⇒ 191 · lönsamhetsgrund +3
    // (u3) ⇒ 194 · kemisektor +1 (detta) ⇒ 195 — syskon-tåligt tak: MINST 195;
    // senare fönsters motorer bärs av sina egna leveranser. Kedjetestets
    // TOTALT-kommentar är sanningen.
    "A2b MONSTER-ANTAL — lagret bär exakt 1 monster (TOTALT ≥ 195)",
    KEMISEKTOR_MONSTER.length === 1 && defs.reduce((s, d) => s + d.antal, 0) >= 195,
    "lager " + KEMISEKTOR_MONSTER.length + " · kedjan " + defs.reduce((s, d) => s + d.antal, 0),
  );
}

// ── FALL B: felstavade/varierade varianter ⇒ samma träff ────────────────────
const VARIANTER = [
  { fraga: "vad är kemisektor?", amne: "kemisektorn" },              // utan -n
  { fraga: "vad är kemisektorn", amne: "kemisektorn" },              // utan frågetecken
  { fraga: "vad är den kemiska industrin?", amne: "kemisektorn" },
  { fraga: "vad är specialkemin?", amne: "kemisektorn" },
  { fraga: "vad är bulkkemi?", amne: "kemisektorn" },
  { fraga: "vad är ammoniak?", amne: "kemisektorn" },
  { fraga: "vad är ammoniaksyntesen?", amne: "kemisektorn" },
  { fraga: "vad är fosfor?", amne: "kemisektorn" },
  { fraga: "vad är fosfat?", amne: "kemisektorn" },
  { fraga: "vad är balanspriset?", amne: "kemisektorn" },
  { fraga: "vad är högkostnadspartnern?", amne: "kemisektorn" },
  { fraga: "vad är kvävefixering?", amne: "kemisektorn" },
];
VARIANTER.forEach((v, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltKemisektor(v.fraga, KURSREGISTER);
  kontroll(nr + " variant «" + v.fraga + "»", !!svar && svar.amne === v.amne, svar ? "ämne=" + svar.amne : "null");
});

// ── FALL C: determinism ⇒ bitidentiskt svar ─────────────────────────────────
{
  const fragor = [
    "vad är kemisektorn?", "vad är bulkkemin?", "vad är ammoniaken?",
    "vad är balanspriset?", "vad är fosforn?", "vad är högkostnadspartnern?",
  ];
  let allaOk = true;
  for (const f of fragor) {
    const a = svaraLokaltKemisektor(f, KURSREGISTER);
    const b = svaraLokaltKemisektor(f, KURSREGISTER);
    if (JSON.stringify(a) !== JSON.stringify(b)) allaOk = false;
  }
  kontroll("C determinism — " + fragor.length + " frågor × 2 bitidentiska", allaOk, "strikt >, först deklarerade vinner");
}

// ── FALL D: aritmetik maskinellt omräknad (kursernas EGNA modelltal) ────────
{
  const t1 = KEMISEKTOR_MONSTER[0].bygga(KURSREGISTER).text;
  kontroll("D01 Norden Bulk", 12000 * 0.18 === 2160 && t1.includes("2 160"), "12 000 Mkr × 18 % = 2 160");
  kontroll("D02 Norden Special", approx(3000 * 0.38, 1140, 0.5) && t1.includes("1 140"), "3 000 × 38 % = 1 140");
  kontroll("D03 specialkemins vinstandel", approx((1140 / 3300) * 100, 34.5, 0.05) && t1.includes("34,5"), "1 140/3 300 = 34,5 % av parets bruttovinst");
  kontroll("D04 specialkemins omsättningsandel", approx((3000 / 15000) * 100, 20, 0.05) && t1.includes("20 procent"), "3 000/15 000 = 20 % av omsättningen");
  kontroll("D05 ammoniakens energi", 33 * 4 === 132 && t1.includes("132"), "33 energienheter × gas 4 = 132 USD/ton");
  kontroll("D06 gas 8 och 12", 33 * 8 === 264 && 33 * 12 === 396 && t1.includes("264") && t1.includes("396"), "264 · 396 — samma fabrik, tre världar");
  kontroll("D07 balanspriset vid 560", 278 / 14 >= 19 && t1.includes("278") && t1.includes("14") && t1.includes("nitton"), "278 mot 14 = nitton gånger skillnad");
  kontroll("D08 prisfallet till 500", 14 - 60 === -46 && 278 - 60 === 218 && t1.includes("46") && t1.includes("218"), "partnern −46 stänger · lågkostnaden lever på 218");
  kontroll(
    "D09 gränsvakter i TEXT",
    ["Fosfatbrottet", "gruvkursens", "Haber-Bosch-processen", "Två näringsämnen", "två ägandelogiker"].every((g) => t1.includes(g)),
    "dokumenterade gränser bärs i text med attribution",
  );
  // D10–D11: registerdrivet — kategoriantal och nivå LIVE.
  const seAntal = KURSREGISTER.filter((r) => r.kategori === "SEKTORANALYS").length;
  kontroll(
    "D10 registerdrivet kategoriantal",
    seAntal > 0 && t1.includes("I kategorin sektoranalys finns " + seAntal + " kurser"),
    "SEKTORANALYS = " + seAntal + " LIVE ur KURSREGISTER (sluter kategorin fullt mentorlänkad)",
  );
  const se21 = KURSREGISTER.find((r) => r.slug === "se-21-kemisektorn");
  kontroll(
    "D11 nivåmarkör",
    !!se21 && se21.niva === "Intermediär" && t1.includes("intermediär nivå"),
    "se-21 = " + (se21 ? se21.niva : "?") + " (registerdrivet, LIVE)",
  );
  // D12: kurslänkarnas slug:ar — alla äkta mot registret.
  const svaret = KEMISEKTOR_MONSTER[0].bygga(KURSREGISTER);
  const slugSet = new Set(KURSREGISTER.map((r) => r.slug));
  const kursSlugs = svaret.handlings.filter((h) => h.lank.startsWith("/kurser/")).map((h) => h.lank.replace("/kurser/", ""));
  const fantomer = [...kursSlugs, ...svaret.kallor.map((k) => k.slug).filter(Boolean)].filter((s) => !slugSet.has(s));
  kontroll("D12 fantomslug", fantomer.length === 0, fantomer.length ? "fantomer: " + fantomer.join(", ") : (kursSlugs.length + svaret.kallor.length) + " äkta slug:ar");
}

// ── FALL E: fler kanoniska ingångar ⇒ träff ─────────────────────────────────
{
  const ingangar = [
    "vad är gödningskemin?", "vad är gödselindustrin?", "vad är kvävegödseln?",
    "vad är specialkemi?", "vad är kemikaliesektorn?", "vad är processindustrin?",
    "vad är kvävet?", "vad är fosfatbrottet?", "vad är kemicykeln?",
    "vad är molekylens ekonomi?", "vad är energiintensiv industri?",
  ];
  let ok = 0;
  for (const f of ingangar) if (svaraLokaltKemisektor(f, KURSREGISTER)) ok++;
  kontroll("E kanoniska " + ingangar.length + " ingångar", ok === ingangar.length, ok + "/" + ingangar.length + " träffar");
}

// ── FALL F: null-gränser (dokumenterade ägare — lämnas ifred) ───────────────
{
  const gransor = [
    "vad är en moat?",            // extra:s — vallgraven deras
    "vad är en moat i siffror?",  // extra:s
    "vad är gruvsektorn?",        // se-20:s familjs territorium
    "vad är malmen?",             // gruvkursens råvara
    "vad är nätverkseffekter?",   // basens (sond B-fångst)
    "vad är marginaltrappan?",    // volatilitetsmekanikens (ln-03 är KÄLLA här)
    "vad är prisfullmakten?",     // moatdjupets (mt-07 är KÄLLA här)
    "vad är bruttomarginalen?",   // marginaltrappans grannfamilj
    "vad är kassaflödesanalys?",  // baskursernas
    "vad är styrräntan?",         // makrons
  ];
  const stulna = gransor.filter((f) => svaraLokaltKemisektor(f, KURSREGISTER) !== null);
  kontroll("F null-gränser " + gransor.length + " st", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "alla gränser lämnas åt sina ägare");
}

// ── FALL F2: juridikgrind — pedagogisk text, aldrig rekommendation ──────────
{
  const t = KEMISEKTOR_MONSTER[0].bygga(KURSREGISTER).text;
  const paddagogisk = t.includes("utbildning") && t.includes("inga placeringstips");
  const pahittade = t.includes("påhittade bolag") || t.includes("påhittat");
  const ingaRad = !/köp [A-ZÄÅÖ]|sälj [A-ZÄÅÖ]|rekommenderar att du (köper|säljer)/.test(t);
  kontroll("F2 juridikgrind", paddagogisk && pahittade && ingaRad, "pedagogisk + påhittade värden + 0 rådsformuleringar");
}

// ── FALL G: ANTISTÖLD — grannlagers kanoniska ⇒ NULL hos detta lager ────────
{
  const grannar = [
    "vad är marginaltrappan?", "vad är täckningsbidraget?",   // volatilitetsmekaniken
    "vad är prisfullmakten?", "vad är byteskostnaderna?",     // moatdjupet
    "vad är kostnadsöverlägsenheten?",                        // NULL men moat-familjens
    "vad är sell the news?", "vad är en avsiktsförklaring?",  // handelsemotorn (syskonet)
    "vad är vad är lönsamhet?",                               // lönsamhetsgrunden (syskonet)
    "vad är en katalysator?",                                 // basens
    "vad är optionsförfallet?", "vad är marginalhandeln?",    // tvångsmekaniken
    "vad är gruvsektorn?",                                    // se-20-grannen
  ];
  const stulna = grannar.filter((f) => svaraLokaltKemisektor(f, KURSREGISTER) !== null);
  kontroll("G antistöld " + grannar.length + " grannfrågor", stulna.length === 0, stulna.length ? "STAL: " + stulna.join(", ") : "0 stölder");
}

// ── FALL H: ÄGAR-INVARIANT — NULL genom kedjan UTAN detta lager ─────────────
{
  const kalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const defs = [...kalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
    .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }))
    .filter((d) => d.namn !== "kemisektor");
  const MOTORER = [];
  for (const d of defs) {
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    MOTORER.push({ ...d, fnk: modul[d.fn] });
  }
  const kanoniska = [
    "vad är kemisektorn?", "vad är bulkkemin?", "vad är specialkemin?",
    "vad är ammoniaken?", "vad är balanspriset?", "vad är fosforn?",
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
    skuggor.length ? "SKUGGAD: " + skuggor.join(", ") : "0 skuggor — territoriet var fritt (sond C bevis)",
  );
  const svarar = kanoniska.map((f) => svaraLokaltKemisektor(f, KURSREGISTER) !== null);
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
  const mina = KEMISEKTOR_MONSTER.flatMap((m) => m.karnord).map(diafri);
  const filer = readdirSync(join(ROT, "src/lib")).filter(
    (f) => f.startsWith("ai-mentor-") && f.endsWith("-fragor.ts") && f !== "ai-mentor-kemisektor-fragor.ts",
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
  const posHandelse = rad.indexOf("svaraLokaltHandelsemotor(");
  const posMin = rad.indexOf("svaraLokaltKemisektor(");
  const posRytm = rad.indexOf("svaraLokaltMarknadsrytm(");
  if (posMin === -1) FEL.push("kemisektor saknas i kedjeraden");
  if (posHandelse === -1 || posMin === -1 || posRytm === -1 || !(posHandelse < posMin && posMin < posRytm)) FEL.push("kedjeordning fel (väntat handelsemotor < kemisektor < marknadsrytm)");
  if (!widget.includes('from "@/lib/ai-mentor-kemisektor-fragor"')) FEL.push("importen saknas");
  kontroll(
    "L widget-synk — efter handelsemotor, FÖRE marknadsrytm (deras SIST)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "72:a motorn wiread med import",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN spår 6 s6-u1 fönster 29 (kemisektor): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exitCode = fail === 0 ? 0 : 1;
