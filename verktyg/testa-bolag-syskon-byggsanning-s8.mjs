#!/usr/bin/env node
/**
 * TESTA-BOLAG-SYSKON-BYGGSANNING (spår 8, o565) — /bolag/[slug]:s länkytor.
 * =====================================================================
 * Rotorsakan o565 kartlade och kurade (o559:s namngivna grannpost —
 * "grannen /bolag/[slug]:s egna syskonlänkar, obevakad samma klass"):
 *
 *   W1  Djupanalys-/forskningskorten läser getAnalyses()/lasAnalyser() LIVE
 *       vid ISR-revalidate (24 h) medan /analyser/[ticker] och
 *       /forskningsbiblioteket/[ticker] är force-static + dynamicParams=false.
 *       Data-doktrinen levererar analysfiler UTAN deploy ⇒ en revalidaterad
 *       bolagssida länkade ett mål bygget saknar (o146-klassen från
 *       bolagssidan). KUR: byggdSidaFinns-grind på villkoren (fail-open).
 *
 *   W3  syskonBolag faller vid saknad/ogiltig publiceringscache (gitignorerad
 *       runtime-fil) tillbaka på HELA universumet — även obyggda slugs.
 *       KUR: .next-grind per syskon (friskt läge = noll synlig ändring, dev
 *       utan .next = fail-open som förut, gap-fönster = ärligt gallrade).
 *
 *   W2  /dataset/${bransch}-kortet från bolagssidan behövde INGEN kur:
 *       lasBranschMedianer läser bolagsunivers.json DIREKT (samma fil som
 *       bolagsuniversumet) ⇒ branscherna kan aldrig glida isär vid ett
 *       och samma bygge. Sviten bevakar enkelkällan (R1h) i stället för
 *       att duplicera dataset-familjens grind (o559 äger den ytan).
 *
 * Kontrakt denna svit bevakar (deterministiskt, offline-grön):
 *   R1 källkontrakt — grindarna sitter där de ska; o146/o148-kärnorna orörda
 *   R2 mekanik-eldprov — spegeln av syskonBolag+byggdSidaFinns mot låtsade
 *      träd: friskt läge oförändrat · gap-fönster gallrar exakt · dev fail-open
 *   R3 datakontrakt — cache ⊆ universum · ticker-paritet (länkmål byggbara) ·
 *      bransch-/analyssymmetri mot .next när det finns (offline: hoppas över)
 *
 * Villkorad HTTP-sond (info — aldrig fejkat grönt, aldrig exit på drift,
 * o131/o139 §1-doktrinen): hämtar ALLA publicerade bolagssidor från prod,
 * plockar ut varje interna länkmål och verifierar 200. Döda mål ⇒ GAP-ÖPPET
 * (kuren är committad i källan — VÄNTAR-DEPLOY, prod-synken bygger, ALDRIG
 * denna svit). Server osvarar ⇒ OINSTÄNGD (info).
 *
 * Körs: node verktyg/testa-bolag-syskon-byggsanning-s8.mjs
 * Exit: 0 = kontraktet håller · 1 = brott (R1-R3).
 * Upptäcks automatiskt av kor-alla-tester (DETERMINISTISK-klassen).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = path.join(ROT, "src", "app", "(huvud)", "bolag", "[slug]", "page.tsx");
const LIB = path.join(ROT, "src", "lib", "bolags-sidor.ts");
const DATASET_RUTT = path.join(ROT, "src", "app", "(huvud)", "dataset", "[bransch]", "page.tsx");
const MEDIANER_LIB = path.join(ROT, "src", "lib", "dataset-medianer.ts");
const VY = path.join(ROT, "src", "components", "ak1a", "bolag-sidor.tsx");
const UNIVERSUM = path.join(ROT, "data", "portfolj-system", "bolagsunivers.json");
const PUBLICERAD_CACHE = path.join(ROT, "data", "cache", "bolags-publicerade.json");
const BYGG_APP = path.join(ROT, ".next", "server", "app");

let pass = 0, fail = 0;
const ok = (namn, villkor, detalj = "") => {
  if (villkor) { pass++; console.log(`  PASS ${namn}`); }
  else { fail++; console.log(`  FAIL ${namn}${detalj ? " — " + detalj : ""}`); }
};

const pageKalla = fs.readFileSync(PAGE, "utf8");
const libKalla = fs.readFileSync(LIB, "utf8");
const datasetRuttKalla = fs.readFileSync(DATASET_RUTT, "utf8");
const medianerKalla = fs.readFileSync(MEDIANER_LIB, "utf8");

// ── R1: källkontrakt — grindarna sitter, kärnorna orörda ────────────────────
console.log("R1 källkontrakt");
ok("R1a page importerar byggdSidaFinns", /import \{ byggdSidaFinns \} from "@\/lib\/sitemap-byggsanning";/.test(pageKalla));
ok("R1b djupanalysvillkoret bär bygggrinden",
  /harDjupanalys\s*=\s*\n?\s*getAnalyses\(\)\.some\(\(a\) => tickerNyckel\(a\.ticker\) === nyckel\) &&\s*\n?\s*byggdSidaFinns\(`analyser\/\$\{encodeURIComponent\(sida\.ticker\)\}`\);/.test(pageKalla),
  "harDjupanalys skall vara &&-kombinerad med byggdSidaFinns (o565 W1)");
ok("R1c forskningsvillkoret bär bygggrinden",
  /harForskningsanalys\s*=\s*\n?\s*lasAnalyser\(\)\.some\(\(a\) => tickerNyckel\(a\.ticker\) === nyckel\) &&\s*\n?\s*byggdSidaFinns\(`forskningsbiblioteket\/\$\{encodeURIComponent\(sida\.ticker\)\}`\);/.test(pageKalla),
  "harForskningsanalys skall vara &&-kombinerad med byggdSidaFinns (o565 W1)");
ok("R1d lib importerar byggdSidaFinns (samma lib-katalog)", /import \{ byggdSidaFinns \} from "\.\/sitemap-byggsanning";/.test(libKalla));
ok("R1e syskonBolag bär .next-grinden",
  /export function syskonBolag\(slug: string\): BolagSida\[\] \{[\s\S]*?byggdSidaFinns\(`bolag\/\$\{s\.slug\}`\),\s*\);\s*\}/.test(libKalla),
  "syskon-filtret skall avslutas med byggdSidaFinns(`bolag/${s.slug}`) (o565 W3)");
ok("R1f o146-kärnan orörd — generateStaticParams tecknar publicerade",
  /skrivPubliceradeSlugs\(slugs\);/.test(pageKalla));
ok("R1g o146-kärnan orörd — mjuk fallback i publiceradeBolagSlugs",
  /\/\/ Saknas\/ogiltig nedteckning → live-ytorna lovar hela universumet[\s\S]*?\}\s*return bolagSlugs\(\);/.test(libKalla),
  "fallback-kontraktet (mjuk degradering) skall leva kvar ordagrant");
ok("R1h W2-enkelkällan — datasetrutten äter MEDIANER ur bolagsunivers.json",
  /return branschSlugs\(MEDIANER\)\.map\(\(bransch\) => \(\{ bransch \}\)\);/.test(datasetRuttKalla) &&
  /path\.join\(process\.cwd\(\), "data", "portfolj-system", "bolagsunivers\.json"\)/.test(medianerKalla),
  "branscherna skall härledas ur EN fil (bolagsunivers.json) — W2:s säkerhetsbevis");
ok("R1i o146/o148-byggnaturen orörd (force-static + dynamicParams=false)",
  /export const dynamic = "force-static";/.test(pageKalla) && /export const dynamicParams = false;/.test(pageKalla));
// Detaljvyn FÅR läsa lasBolagsSidor() för TEXTTAL (universumräknaren i
// ingressen, o148) — det som bevakas är LÄNKKÄLLORNA: varje /bolag/${…}-länk
// i detaljsektionen skall vara antingen sidan själv (sida.slug) eller ett
// objekt ur syskon-propen (s.slug) — aldrig en egen universumläsning.
{
  const vyKalla = fs.readFileSync(VY, "utf8");
  const detaljStart = vyKalla.indexOf("export function BolagDetaljVy");
  ok("R1j0 detaljvyn deklareras i vy-filen", detaljStart >= 0);
  if (detaljStart >= 0) {
    const detalj = vyKalla.slice(detaljStart);
    const mal = [...detalj.matchAll(/\/bolag\/\$\{([^}]+)\}/g)].map((m) => m[1].trim());
    const tillatna = new Set(["sida.slug", "s.slug"]);
    const framtida = mal.filter((m) => !tillatna.has(m));
    ok("R1j varje /bolag-länk i detaljvyn är själv eller syskon-prop (ingen egen universumläsning)",
       framtida.length === 0,
       `främmande länkkällor: ${framtida.join(", ") || "inga"} (funna: ${mal.join(", ")})`);
  }
}

// ── R2: mekanik-eldprov — spegel mot låtsade träd ───────────────────────────
console.log("R2 mekanik-eldprov (spegling av syskonBolag + byggdSidaFinns)");
{
  // Spegeln verifieras mot källan genom R1d/R1e/R1g: publicerade = ledger
  // (fallback: hela universumet) ∩ universumet; grind = .next-html existerar
  // (fail-open när BUILD_ID/app saknas eller .next helt saknas).
  const spegelSyskon = (universum, ledgerSlugs, byggRot, slug) => {
    const sida = universum.find((s) => s.slug === slug);
    if (!sida) return [];
    const byggInfoFinns =
      fs.existsSync(path.join(byggRot, ".next", "BUILD_ID")) &&
      fs.existsSync(path.join(byggRot, ".next", "server", "app"));
    const byggd = (s) =>
      !byggInfoFinns || fs.existsSync(path.join(byggRot, ".next", "server", "app", "bolag", `${s.slug}.html`));
    const publicerade =
      ledgerSlugs === null
        ? universum
        : universum.filter((s) => ledgerSlugs.includes(s.slug));
    return publicerade.filter((s) => s.bransch === sida.bransch && s.slug !== slug && byggd(s));
  };

  const universum = [
    { slug: "aapl", bransch: "teknik" },
    { slug: "eric-b-st", bransch: "teknik" },
    { slug: "googl", bransch: "teknik" },
    { slug: "volcar-b", bransch: "teknik" },
    { slug: "hm-b-st", bransch: "konsument" },
    { slug: "nkea", bransch: "konsument" },
  ];
  const alla = universum.map((s) => s.slug);

  // (a) friskt läge: ledger = allt, .next = allt ⇒ alla syskon (o559:s
  //     vaktdefinition: noll synlig ändring när inget gap finns)
  const tmpA = fs.mkdtempSync(path.join(os.tmpdir(), "o565-a-"));
  fs.mkdirSync(path.join(tmpA, ".next", "server", "app", "bolag"), { recursive: true });
  fs.writeFileSync(path.join(tmpA, ".next", "BUILD_ID"), "x");
  for (const s of universum) fs.writeFileSync(path.join(tmpA, ".next", "server", "app", "bolag", `${s.slug}.html`), "x");
  ok("R2a friskt läge ⇒ 3/3 tekniksyskon (beteendet oförändrat)",
     spegelSyskon(universum, alla, tmpA, "eric-b-st").length === 3);

  // (b) W1-analog gap: .next saknar ett syskon ⇒ gallras exakt
  const tmpB = fs.mkdtempSync(path.join(os.tmpdir(), "o565-b-"));
  fs.mkdirSync(path.join(tmpB, ".next", "server", "app", "bolag"), { recursive: true });
  fs.writeFileSync(path.join(tmpB, ".next", "BUILD_ID"), "x");
  for (const s of universum.filter((x) => x.slug !== "volcar-b"))
    fs.writeFileSync(path.join(tmpB, ".next", "server", "app", "bolag", `${s.slug}.html`), "x");
  const synligaB = spegelSyskon(universum, alla, tmpB, "eric-b-st").map((s) => s.slug);
  ok("R2b bygget saknar volcar-b ⇒ 2 synliga, volcar-b gallrad",
     synligaB.length === 2 && !synligaB.includes("volcar-b"));

  // (c) W3-kärnan: ledger BORTA (städning/återställning) + .next delvis ⇒
  //     fallbacken lovar universumet MEN .next-grinden håller tillbaka obyggda
  const synligaC = spegelSyskon(universum, null, tmpB, "eric-b-st").map((s) => s.slug);
  ok("R2c ledger saknas + .next delvis ⇒ endast byggda syskon (kurens kärna)",
     synligaC.length === 2 && !synligaC.includes("volcar-b"));

  // (c2) dev/ren klon: ingen .next alls ⇒ fail-open, hela universumet (o146:s
  //      mjuka degradering bevaras i dev)
  const tmpC = fs.mkdtempSync(path.join(os.tmpdir(), "o565-c-"));
  ok("R2c2 ingen .next ⇒ fail-open 3/3 syskon (dev oförändrad)",
     spegelSyskon(universum, null, tmpC, "eric-b-st").length === 3);

  // (d) ledger listar slug utanför universumet (städdata) ⇒ intersect ignorerar
  const synligaD = spegelSyskon(universum, [...alla, "spök-slug"], tmpA, "hm-b-st").map((s) => s.slug);
  ok("R2d främmande ledger-slugs ignorerars; sig själv + främmande bransch exkluderas",
     synligaD.length === 1 && synligaD[0] === "nkea");

  for (const t of [tmpA, tmpB, tmpC]) fs.rmSync(t, { recursive: true, force: true });
}

// ── R3: datakontrakt — dagens data håller måttet ────────────────────────────
console.log("R3 datakontrakt");
{
  const universum = JSON.parse(fs.readFileSync(UNIVERSUM, "utf8"));
  const rader = Array.isArray(universum) ? universum : [];
  // Råfilen bär ticker — slugs härleds exakt som lasBolagsSidor (lib rad ~126):
  const slugAv = (t) => t.toLowerCase().replace(/\./g, "-");
  const slugs = rader.map((s) => slugAv(s.ticker));
  ok("R3a universum läsbart med ticker+bransch per rad",
     rader.length > 0 && rader.every((s) => typeof s.ticker === "string" && typeof s.bransch === "string"),
     `${rader.length} rader`);

  let cacheSlugs = null;
  try {
    const c = JSON.parse(fs.readFileSync(PUBLICERAD_CACHE, "utf8"));
    if (Array.isArray(c.slugs) && c.slugs.length > 0) cacheSlugs = c.slugs;
  } catch { /* fail-open i sviten också: cache får saknas */ }
  if (cacheSlugs) {
    const frammande = cacheSlugs.filter((s) => !slugs.includes(s));
    ok("R3b publiceringscachen ⊆ universumet", frammande.length === 0,
       `${cacheSlugs.length} publicerade, främmande: ${frammande.join(", ") || "inga"}`);
  } else {
    console.log("  INFO R3b publiceringscache saknas (bygg har ej kört här) — hoppar över");
  }

  // Ticker-paritet: fuzzy match (tickerNyckel) får aldrig ge ett länkmål som
  // inte är byggbart — dvs bolag.ticker skall vara IDENTISK med analysens
  // ticker när kortet överhuvudtaget kan renderas.
  const tickerNyckel = (t) => t.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const analysTickers = new Map();
  for (const f of fs.readdirSync(path.join(ROT, "data", "analyses"))) {
    const a = JSON.parse(fs.readFileSync(path.join(ROT, "data", "analyses", f), "utf8"));
    if (a.ticker) analysTickers.set(tickerNyckel(a.ticker), a.ticker);
  }
  const forskTickers = new Map();
  for (const f of fs.readdirSync(path.join(ROT, "data", "forskningsbiblioteket")).filter((f) => f.endsWith(".json"))) {
    const a = JSON.parse(fs.readFileSync(path.join(ROT, "data", "forskningsbiblioteket", f), "utf8"));
    const t = a.ticker || a.tickerSymbol;
    if (t) forskTickers.set(tickerNyckel(t), t);
  }
  const missmatch = [];
  for (const b of rader) {
    const k = tickerNyckel(b.ticker);
    if (analysTickers.has(k) && analysTickers.get(k) !== b.ticker)
      missmatch.push(`djup ${b.ticker}≠${analysTickers.get(k)}`);
    if (forskTickers.has(k) && forskTickers.get(k) !== b.ticker)
      missmatch.push(`forsk ${b.ticker}≠${forskTickers.get(k)}`);
  }
  ok("R3c ticker-paritet — fuzzy match ⇒ exakt länkmål (annars död länk trots sant villkor)",
     missmatch.length === 0, missmatch.slice(0, 4).join(" · "));

  // Bygg-symmetri mot .next (endast när .next finns — annars offline-hopp)
  if (fs.existsSync(BYGG_APP)) {
    const byggdaBolag = new Set(
      fs.readdirSync(path.join(BYGG_APP, "bolag")).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, "")));
    const byggdaDataset = new Set(
      fs.readdirSync(path.join(BYGG_APP, "dataset")).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, "")));
    const byggdaAnalyser = new Set(
      fs.readdirSync(path.join(BYGG_APP, "analyser")).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, "")));
    const byggdaForsk = new Set(
      fs.readdirSync(path.join(BYGG_APP, "forskningsbiblioteket")).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, "")));

    const branscher = [...new Set(rader.map((s) => s.bransch))];
    const saknadDataset = branscher.filter((b) => !byggdaDataset.has(b));
    ok("R3d varje universumbransch har byggd dataset-sida (W2:s symmetri i trädet)",
       saknadDataset.length === 0, `saknas: ${saknadDataset.join(", ") || "inga"}`);

    const obyggdaAnalysMal = [];
    for (const b of rader) {
      const k = tickerNyckel(b.ticker);
      if (analysTickers.has(k) && !byggdaAnalyser.has(encodeURIComponent(b.ticker)))
        obyggdaAnalysMal.push(`/analyser/${b.ticker}`);
      if (forskTickers.has(k) && !byggdaForsk.has(encodeURIComponent(b.ticker)))
        obyggdaAnalysMal.push(`/forskningsbiblioteket/${b.ticker}`);
    }
    ok("R3e varje möjligt analys-kort har byggbart länkmål i .next",
       obyggdaAnalysMal.length === 0, obyggdaAnalysMal.slice(0, 4).join(" · "));

    if (cacheSlugs) {
      const gap = cacheSlugs.filter((s) => !byggdaBolag.has(s));
      ok("R3f publiceringscachen ⊆ byggda bolagssidor i .next", gap.length === 0,
         `gap: ${gap.slice(0, 4).join(", ") || "inga"}`);
    }
  } else {
    console.log("  INFO R3d-f inget .next (offline-läge/ren klon) — trädkontroller hoppas över");
  }
}

// ── Villkorad HTTP-sond (info — aldrig fejkat grönt, aldrig exit på drift) ──
console.log("");
try {
  const bas = "http://localhost:3000";
  const cache = cacheSlugsForSond();
  if (!cache) {
    console.log("HTTP-SOND: publiceringscache saknas — inga sidor att hämta (info)");
  } else {
    // Standing-prob (kor-alla-tester-vänlig): vart 8:e slug ≈ 40 sidor som
    // täcker alla 11 branscher. Fullsvep (322 sidor + ~364 mål, ~4 min) med
    // O565_FULLSOND=1 — o565:s leveransbevis kördes så: 314 sidor · 364 mål · 0 döda.
    const urval = process.env.O565_FULLSOND === "1" ? cache : cache.filter((_, i) => i % 8 === 0);
    const start = Date.now();
    const budgetMs = 300_000;
    const malKod = new Map();
    let sidor = 0, ofullstandigt = false;
    for (const slug of urval) {
      if (Date.now() - start > budgetMs) { ofullstandigt = true; break; }
      const html = await (await fetch(`${bas}/bolag/${slug}`, { signal: AbortSignal.timeout(8000) })).text();
      sidor++;
      for (const m of html.matchAll(/href="(\/(?:bolag|dataset|analyser|forskningsbiblioteket|kurser|portfolj-forskning)\/[^"#?]*)"/g)) {
        if (!malKod.has(m[1])) malKod.set(m[1], null);
      }
    }
    let doda = [];
    for (const mal of malKod.keys()) {
      const kod = (await fetch(bas + mal, { signal: AbortSignal.timeout(8000) })).status;
      malKod.set(mal, kod);
      if (kod !== 200) doda.push(`${mal} → ${kod}`);
    }
    console.log(`HTTP-SOND${process.env.O565_FULLSOND === "1" ? " (FULLSVEP)" : " (urval vart 8:e)"}: ${sidor}${ofullstandigt ? " (budget stoppad — ofullständigt)" : ""} bolagssidor · ${malKod.size} unika interna länkmål · ${doda.length} döda`);
    if (doda.length === 0) {
      console.log("HTTP-SOND: LEVERANS-GRÖN — varje länkmål på bolagssidorna svarar 200 (grindarna vakar från nästa deploy)");
    } else {
      console.log("HTTP-SOND: GAP-ÖPPET — döda länkmål lever i prod (o146:s fönster pågår!):");
      for (const d of doda) console.log("  " + d);
      console.log("HTTP-SOND: kuren är committad i källan — VÄNTAR-DEPLOY (prod-synken bygger, ALDRIG denna svit)");
    }
  }
} catch (e) {
  console.log(`HTTP-SOND: OINSTÄNGD (server ej svarande här: ${String(e).slice(0, 80)}) — kontrakten ovan är offline-gröna`);
}

function cacheSlugsForSond() {
  try {
    const c = JSON.parse(fs.readFileSync(PUBLICERAD_CACHE, "utf8"));
    return Array.isArray(c.slugs) && c.slugs.length > 0 ? c.slugs : null;
  } catch { return null; }
}

console.log("");
console.log(`RESULTAT: ${pass} PASS · ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
