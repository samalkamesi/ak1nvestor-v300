#!/usr/bin/env node
/**
 * Lägg till "kalla" (källverks-attribution) i alla bokmaster-kurser.
 *
 * Kopplar data/bokmaster/*.json → data/bokkanon.json via titelmatchning och
 * injicerar "kalla": { titel, forfattare, ar, bk } i varje matchad kurs.
 * Detta ger varje bokbaserad kurs explicit upphovsrättslig transparens
 * (se /upphovsratt — Kallkort-komponenten renderar fältet).
 *
 * Körbara kontroller:
 *   node verktyg/lagg-till-kalla.mjs            → injicera i matchade filer
 *   node verktyg/lagg-till-kalla.mjs --torrt    → bara rapportera
 *
 * Säkerhet: varje fil skrivs till temporär fil som verifieras (parse +
 * chapters.length oförändrat) INNAN atomiskt rename. En fil skrivs ALDRIG
 * till null — vid valideringsfel lämnas originalet orört.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, renameSync, unlinkSync } from "fs";
import { join } from "path";

const ROTT = process.cwd();
const KANON = join(ROTT, "data", "bokkanon.json");
const KALLA_DIR = join(ROTT, "data", "bokmaster");
const TORRT = process.argv.includes("--torrt");

/** lowercase, ta bort "the ", endast a-z0-9 (åäö → transkriberas ej — titlar är mest engelska) */
function norm(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9åäö]/g, "");
}

function titelDel(bmTitel) {
  // "Titel — Författare: KOMPLETT" → "Titel"
  return String(bmTitel || "").split(/\s*[—–-]\s*/)[0].split(":")[0].trim();
}

function forfattarDel(bmTitel) {
  // "Titel — Författare: KOMPLETT" → "Författare" (sista em-dash-segmentet före ":")
  const efter = String(bmTitel || "").split(/\s*[—–]\s*/).slice(1).join(" ");
  return efter.split(":")[0].trim();
}

function titelMatchar(kN, bmN) {
  // prefix-matchning i båda riktningar — undviker lösa includes-fel
  // ("valuation" ska INTE matcha "investmentvaluation")
  if (bmN.length < 8 || kN.length < 8) return false;
  return kN.startsWith(bmN) || bmN.startsWith(kN);
}

/** Explicit alias: kurs-slug → kanon-id (svenska titlar m.m. som titelmatchning inte fångar) */
const ALIAS = {
  "tanka-snabbt-och-langsamt": "bk-032", // Thinking, Fast and Slow (svensk titel)
};

function matcha(kanonLista, bmTitel, slug) {
  // 0) explicit alias först
  if (ALIAS[slug]) {
    const a = kanonLista.find((k) => k.id === ALIAS[slug]);
    if (a) return a;
  }
  const bmN = norm(titelDel(bmTitel));
  // 1) titel-prefix-matchning
  for (const k of kanonLista) {
    if (titelMatchar(norm(k.titel), bmN)) return k;
  }
  // 2) fallback: författare-efternamn ur kursens titel ("— Kahneman: KOMPLETT") —
  //    endast om titlarna dessutom delar de 4 första tecknen (skydd mot fel bok
  //    av samma författare, t.ex. två olika Bernstein)
  const f = norm(forfattarDel(bmTitel));
  if (f.length >= 5) {
    const traffar = kanonLista.filter(
      (k) =>
        norm(k.author).includes(f) &&
        norm(k.titel).slice(0, 4) === bmN.slice(0, 4),
    );
    if (traffar.length === 1) return traffar[0];
  }
  return null;
}

const kanon = JSON.parse(readFileSync(KANON, "utf8"));
const kanonLista = Array.isArray(kanon) ? kanon : kanon.bocker || Object.values(kanon);
const filer = readdirSync(KALLA_DIR).filter((f) => f.endsWith(".json"));

const matchade = [];
const saknade = [];
let skrivna = 0;

for (const fil of filer) {
  const sokVag = join(KALLA_DIR, fil);
  let kurs;
  try {
    kurs = JSON.parse(readFileSync(sokVag, "utf8"));
  } catch (e) {
    // filen skrivs möjligen just nu av en byggagent — hoppa över, kör skriptet igen senare
    saknade.push(`${fil} → OLÄSLIG JUST NU (${e instanceof Error ? e.message.slice(0, 60) : "?"})`);
    continue;
  }

  if (kurs.kalla) {
    matchade.push(`${fil} (hade redan kalla)`);
    continue;
  }
  if (kurs.category === "EKOSYSTEM" || kurs.category === "AKM1" || kurs.category === "AK1TS") {
    saknade.push(`${fil} → boklös kurs (OK för ${kurs.category})`);
    continue;
  }

  const k = matcha(kanonLista, kurs.title, fil.replace(/\.json$/, ""));
  if (!k) {
    saknade.push(`${fil} → INGEN kanon-match (kursens titel: "${kurs.title}")`);
    continue;
  }

  kurs.kalla = { titel: k.titel, forfattare: k.author, ar: k.year, bk: k.id };
  matchade.push(`${fil} → ${k.titel} (${k.author}, ${k.year})`);

  if (!TORRT) {
    const tmp = sokVag + ".tmp";
    writeFileSync(tmp, JSON.stringify(kurs, null, 2) + "\n", "utf8");
    // verifiera temp-filen innan atomiskt byte — aldrig null, aldrig tappade kapitel
    const prov = JSON.parse(readFileSync(tmp, "utf8"));
    if (!prov || !Array.isArray(prov.chapters) || prov.chapters.length !== kurs.chapters.length || !prov.kalla) {
      unlinkSync(tmp);
      console.error(`FEL: verifiering misslyckades för ${fil} — originalet lämnat orört`);
      process.exit(1);
    }
    renameSync(tmp, sokVag);
    skrivna++;
  }
}

console.log(`\n=== KÄLLATTRIBUTION ${TORRT ? "(TORRT)" : ""} ===`);
console.log(`Matchade: ${matchade.length}`);
matchade.forEach((m) => console.log("  ✓ " + m));
console.log(`\nEj matchade: ${saknade.length}`);
saknade.forEach((s) => console.log("  – " + s));
if (!TORRT) console.log(`\nSkrivna filer: ${skrivna}`);
console.log(`Kanon: ${kanonLista.length} böcker · Bokmaster-filer: ${filer.length}`);
