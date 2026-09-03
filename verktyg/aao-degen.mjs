#!/usr/bin/env node
/**
 * ÅÄÖ-DEGENERERING — detektor + kirurgisk fixare.
 *
 * Hittar och rättar ASCII-avstavad svenska i kursdata: "gor detta" → "gör detta",
 * "kopte" → "köpte" etc. Problemet: de felstavade formerna är giltiga ASCII-
 * strängar som vanliga åäö-kontroller missar.
 *
 * NIVÅ A — säkra ersättningar (degenererad form är ALDRIG korrekt svenska):
 *   kontextuellt ordagrant, versalbevarande (Gor→Gör), endast i TEXTFÄLT
 *   (traverserar JSON — hoppar slug/lank/url/id-nycklar), aldrig i URL:er
 *   eller e-post inuti text (skyddas genom tokenisering på mellanslag).
 * NIVÅ B — filsignatur: systematiskt avstavad fil (många " ar "/" an "/" for "
 *   men få " är "/" än "/" för ") → flaggas för manuell granskning, fixas EJ
 *   automatiskt (tvetydiga mot engelska).
 *
 * Körning:
 *   node verktyg/aao-degen.mjs            → fixa NIVÅ A i data/bokmaster + public/deep-courses
 *   node verktyg/aao-degen.mjs --torrt    → bara rapportera
 *   node verktyg/aao-degen.mjs --torrt --json → maskinläsbar rapport (för Kvalitetsvakten)
 */
import { readFileSync, writeFileSync, readdirSync, renameSync } from "fs";
import { join } from "path";

const ROTT = process.cwd();
const TORRT = process.argv.includes("--torrt");
const JSONLAGE = process.argv.includes("--json");

// ── NIVÅ A: degenererad → korrekt (aldrig korrekt svenska i kurslöptext) ──
// "ar"→"är" och "pa"→"på" är fristående aldrig korrekta svenska ord; versal-
// formen (AR/PA — t.ex. akronym) lämnas orörd av ersatt()s versalregelväg.
// KRITISKT: JS \w räknar INTE åäö som ordtecken! Utan åäö-säkra gränser ser
// regexen "köpa" som "kö"+"pa" och SKAPAR halvformerna ("köpå") den ska jaga.
const BOKSTAV = "A-Za-z0-9_ÅÄÖåäö";

// FARLIGA KORTORD pga åäö-grannar är BORTA ur MAPPA (pa/gor/ar/nar/dar) —
// de får ALDRIG maskinersättas; svensk-kunniga agenter hanterar dem.
const A_MAPPA = {
  gors: "görs", goras: "görs", gora: "göra", gorande: "görande",
  // nar/dar/ar/por pa — BORTTAGNA: \w-hålet gör dem farliga (se BOKSTAV-noten)
  kopte: "köpte", koper: "köper", kop: "köp", kopta: "köpta", kopare: "köpare",
  oppna: "öppna", oppnar: "öppnar", oppnade: "öppnade",
  laste: "läste",
  tva: "två",
  rakna: "räkna", raknade: "räknade", raknar: "räknar", rakning: "räkning",
  vardet: "värdet", varde: "värde", varden: "värden", varda: "värda",
  manader: "månader", manad: "månad", manads: "månads",
  tillvaxt: "tillväxt", vaxt: "växt", vaxer: "växer", vaxa: "växa",
  forsaljning: "försäljning", forsaljningar: "försäljningar", forsalja: "försälja",
  salj: "sälj", salja: "sälja", saljer: "säljer", salde: "sålde", saljare: "säljare",
  vagor: "vågor", vagen: "vägen", vagar: "vägar", vagvisare: "vägvisare",
  kansla: "känsla", kanslor: "känslor", kanslomassig: "känslomässig",
  trang: "trång", trangt: "trångt", langre: "längre", langst: "längst", trangsynt: "trångsynt",
  fraga: "fråga", fragor: "frågor", fragade: "frågade", fragar: "frågar",
  manga: "många", jamt: "jämt", jamna: "jämnt",
  hog: "hög", hoga: "höga", hogst: "högst", hojd: "höjd", hojden: "höjden", hoja: "höja", hojt: "höjt", hojs: "höjs",
  sankt: "sänkt", sanker: "sänker", sankning: "sänkning",
  grans: "gräns", gransar: "gränser", gransen: "gränsen",
  trakig: "tråkig", trad: "tråd", tradar: "trådar", tradlost: "trådlöst",
  halla: "hålla", haller: "håller", hallas: "hålls", hallning: "hållning",
  mal: "mål", malen: "målen", malet: "målet", malen_: "målen",
  saga: "säga", sager: "säger",
  sparra: "spärra", sparr: "spärr",
  varfor: "varför", varfors: "varförs",
  jamfor: "jämför", jamfort: "jämfört", jamfora: "jämföra", jamforelse: "jämförelse", jamforbar: "jämförbar",
  forandring: "förändring", forandringar: "förändringar", forandra: "förändra", forandrat: "förändrat", forandras: "förändras",
  fordel: "fördel", fordelar: "fördelar", fordelning: "fördelning", fordelen: "fördelen",
  foretag: "företag", foretaget: "företaget", foretags: "företags", foretagen: "företagen",
  forslag: "förslag", forslaget: "'förslaget", forslagen: "förslagen",
  formaga: "förmåga", formagor: "förmågor",
  forlanga: "förlänga", forlangning: "förlängning",
  forkorta: "förkorta", forkortning: "förkortning",
  forsakring: "försäkring", forsakringsbolag: "försäkringsbolag", forsakrad: "försäkrad",
  forsok: "försök", forsoker: "försöker", forsoka: "försöka", forsoks: "försöks",
  forlust: "förlust", forluster: "förluster", forlorar: "förlorar", forlorat: "förlorat", forlora: "förlora",
  fordelaktig: "fördelaktig",
  // ar/pa — BORTTAGNA: \w-hålet (åäö ≠ \w) gör "köpa"→"köpå"-fällan möjlig
  // omvänd vokalkorruption (djupkontroll 2026-09-03: 1 500+ förekomster)
  kopa: "köpa", kopas: "köpas", kopades: "köptes",
  fragor: "frågor",
  portfolj: "portfölj", portfoljen: "portföljen", portfoljer: "portföljer", portfoljbyggaren: "portföljbyggaren", portfoljanalys: "portföljanalys", portfoljteori: "portföljteori",
  rod: "röd", roda: "röda", rott: "rött",
  eftegerskrift: "efterskrift",
  secundara: "sekundära", secundar: "sekundär",
  troskel: "tröskel", trosklar: "trösklar", troskeln: "tröskeln",
  overlevnad: "överlevnad", uthallighet: "uthållighet",
  marknar: "marknader",
  // MASKINKORRUMPERADE VERB (trasig ar→är-applicering landat i data 2026-09-03)
  tjänär: "tjänar", förtjänär: "förtjänar", betjänär: "betjänar",
  belönär: "belönar", dödär: "dödar", lånär: "lånar", tränär: "tränar",
  flödär: "flödar", utspädär: "utspäder", utplånär: "utplånar",
  trådär: "trådar", ledtrådär: "ledtrådar", utlånär: "utlånar",
  // HALVFORMER (å bevarat, förlorat ä — djupkontrollen 2026-09-03: 1 300+)
  "köpå": "köpa", "köpås": "köpas",
  "frågör": "frågor", "frågörs": "frågors",
  portfolj: "portfölj", portfoljen: "portföljen", portfoljer: "portföljer",
  portfoljbyggaren: "portföljbyggaren", portfoljanalys: "portföljanalys",
  portfoljteori: "portföljteori", portfoljens: "portföljens",
};

// Rensa bort identity-mappningar
const MAPPA = {};
for (const [fel, ratt] of Object.entries(A_MAPPA)) {
  if (fel !== ratt) MAPPA[fel] = ratt.replace(/^'/, "");
}
// felen i MAPPA som fått apostrof-rengöring ovan
MAPPA.forslaget = "förslaget";

// Ord som ALDRIG auto-fixas: versalform av känsliga kortformer (AR/PA = akronymrisk)
const VERSAL_BLOCK = new Set(["AR", "PA"]);

// Ordgränser: blockera sammanslutning med bokstäver/siffra/@; tillåt punkt,
// komma, utropstecken efter (meningsavslut). Lookbehind skyddar URL/filnamn.
// Ordgränser MED åäö (BOKSTAV-klassen) — annars ser "köpa" ut som "kö"+"pa".
const ERSATT_RE = new RegExp(
  `(?<![${BOKSTAV}/@.\\-])(${Object.keys(MAPPA).join("|")})(?![${BOKSTAV}@])`,
  "gi",
);

/** Behåll versal-läge: Gor→Gör, GOR→GÖR (blockerad för AR/PA), gor→gör */
function ersatt(text) {
  return text.replace(ERSATT_RE, (traff, ord) => {
    const lag = ord.toLowerCase();
    const ratt = MAPPA[lag];
    if (!ratt) return traff;
    if (ord === ord.toUpperCase() && ord.length > 1) {
      if (VERSAL_BLOCK.has(ord)) return traff; // AR/PA-akronymer rörs ej
      return ratt.toUpperCase();
    }
    if (ord[0] === ord[0].toUpperCase()) return ratt[0].toUpperCase() + ratt.slice(1);
    return ratt;
  })
  // Sammansatta former som ord-gränsregexet inte når: "återköpå aktier",
  // "antitrust-frågör" (bindestreck), "transaktionsfrågör" (sammansatt).
  .replace(/återköpå/g, "återköpa")
  .replace(/Återköpå/g, "Återköpa")
  .replace(/frågör(?![\w@])/g, "frågor")
  .replace(/Frågör(?![\w@])/g, "Frågor");
}

// ── Fält som är text (allt utom dessa nycklar hoppas) ──
const HOPPA_NYCKLAR = new Set(["slug", "lank", "link", "url", "id", "bk", "lankar", "href", "src", "canonical", "kalla", "source"]);

/** Traversera JSON, ersätt endast i strängvärden under textvänliga nycklar. Returnerar [obj, antalÄndrade]. */
function traversalFix(node, nyckel = "") {
  let n = 0;
  if (typeof node === "string") {
    if (HOPPA_NYCKLAR.has(nyckel)) return [node, 0];
    // Hela strängen URL/e-post → rör inte
    if (/^(https?:|mailto:|\/)/i.test(node.trim())) return [node, 0];
    const ny = ersatt(node);
    if (ny !== node) n++;
    return [ny, n];
  }
  if (Array.isArray(node)) {
    return [node.map((v) => traversalFix(v, nyckel)[0]), n];
  }
  if (node && typeof node === "object") {
    for (const k of Object.keys(node)) {
      const [ny, c] = traversalFix(node[k], k);
      node[k] = ny;
      n += c;
    }
  }
  return [node, n];
}

// ── NIVÅ B: filsignatur — systematiskt avstavad? ──
function signatur(obj) {
  const t = JSON.stringify(obj);
  const ar = (t.match(/(?<![\wåäöé])ar(?![\wåäöé])/gi) || []).length;
  const arRatt = (t.match(/(?<![\w])är(?![\w])/gi) || []).length;
  const fo = (t.match(/(?<![\wåäöé])för(?![\wåäöé])/gi) || []).length;
  const gorR = (t.match(/\bgör\b/g) || []).length;
  const gorF = (t.match(/(?<![\wåäöé])gor(?![\wåäöé])/gi) || []).length;
  const systematisk = (ar > 5 && arRatt === 0) || (gorF > 2 && gorR === 0);
  return { systematisk, ar, arRatt, gorF, gorR };
}

// ── Kör över alla källor ──
const KALLOR = [
  { namn: "data/bokmaster", dir: join(ROTT, "data", "bokmaster") },
];

let totalFix = 0;
let totalB = 0;
const bFiler = [];
const fixRapport = [];

for (const kalla of KALLOR) {
  for (const f of readdirSync(kalla.dir).filter((x) => x.endsWith(".json"))) {
    const vag = join(kalla.dir, f);
    let j;
    try {
      j = JSON.parse(readFileSync(vag, "utf8"));
    } catch {
      continue;
    }
    const [ny, n] = traversalFix(j);
    const sig = signatur(ny);
    if (n > 0) {
      totalFix += n;
      fixRapport.push(`${f}: ${n} rättningar`);
      if (!TORRT) {
        const tmp = vag + ".tmp";
        writeFileSync(tmp, JSON.stringify(ny, null, 2) + "\n");
        const prov = JSON.parse(readFileSync(tmp, "utf8"));
        if (!prov || (prov.chapters && ny.chapters && prov.chapters.length !== ny.chapters.length)) {
          console.error(`FEL vid verifiering: ${f} — hoppar`);
          continue;
        }
        renameSync(tmp, vag);
      }
    }
    if (sig.systematisk) {
      totalB++;
      bFiler.push(`${f} (ar:${sig.ar}/är:${sig.arRatt} gor:${sig.gorF}/gör:${sig.gorR})`);
    }
  }
}

// public/deep-courses.json — samma behandling
const PUB = join(ROTT, "public", "deep-courses.json");
const djup = JSON.parse(readFileSync(PUB, "utf8"));
let pubFix = 0;
let pubB = 0;
for (const slug of Object.keys(djup)) {
  const [ny, n] = traversalFix(djup[slug]);
  if (!TORRT) djup[slug] = ny;
  pubFix += n;
  const sig = signatur(ny);
  if (sig.systematisk) pubB++;
}
if (!TORRT && pubFix > 0) writeFileSync(PUB, JSON.stringify(djup));
if (!TORRT) {
  // DEBUG: verifiera i samma process att skrivningen tog
  const efter = readFileSync(PUB, "utf8");
  console.log(`DEBUG skrivit: pubFix=${pubFix} · köpå kvar i fil=${efter.split("köpå").length - 1}`);
}
totalFix += pubFix;
totalB += pubB;

if (JSONLAGE) {
  console.log(JSON.stringify({ nivaA: totalFix, nivaB: totalB, datum: new Date().toISOString() }));
} else {
  console.log(`\n=== ÅÄÖ-DEGENERERING ${TORRT ? "(TORRT)" : ""} ===`);
  console.log(`NIVÅ A rättade träffar: ${totalFix} (varav public: ${pubFix})`);
  if (fixRapport.length && !JSONLAGE) fixRapport.slice(0, 30).forEach((r) => console.log("  ✓ " + r));
  console.log(`\nNIVÅ B systematiskt avstavad (manuell granskning): ${totalB}`);
  bFiler.slice(0, 20).forEach((b) => console.log("  ⚠ " + b));
}
