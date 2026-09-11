#!/usr/bin/env node
/**
 * DATASET-KONTRAKT-VAKTEN (VÅG 98 F2) — programmatisk lekagesökning mot ALL
 * utdata från dataset-ytorna. Våg 97 E1 bevisade "0 bolagsläckage" ad hoc;
 * detta är samma bevis som permanent, repeterbar vakt (mönstret: kvalitetsvakt.mjs).
 *
 * A2-DATASET-KONTRAKT §1: datasetsidorna (/dataset + /dataset/[bransch] +
 * /en- + /ar-speglar, llms.txt, sitemap, JSON-LD) får ENBAST aggregat —
 * medianer, kvartiler (P25/P75, VÅG 98 F2) och observationsantal. ALDRIG
 * per-bolagspoäng (AKM1/AKM2), vågklasser, status, golvMarginal, portV19 —
 * och INGA bolagsnamn eller tickers.
 *
 * SCOPE — "all utdata" = ALL utdata från DATASET-YTAN (sidorna i alla tre
 * språk inkl. RSC-payload + JSON-LD, llms.txt/llms-full.txt, sitemap- och
 * robots-kroppar). Sidans ÖVRIGA ytor (/analyser etc.) publicerar medvetet
 * bolagsnamn i sina egna analyser och ligger utanför dataset-kontraktet —
 * att skanna dem vore ett felaktigt kontraktsbrott.
 *
 * Metod: läs data/portfolj-system/bolagsunivers.json (100 tickers + namn),
 * skanna varje sidfil efter varje ticker och namn. Namnen är långa exakta
 * delsträngar (kan inte ge falska positiva). Tickers matchas ordbundet med
 * svensk-medveten gräns — JavaScripts \b ser INTE Å/Ä/Ö som bokstäver, så
 * rå \bT\b skulle träffa "Tänka"; gränsen här exkluderar A-Z, 0-9 OCH
 * ÅÄÖåäö på båda sidor. llms-filerna skannas PER SEKTION: enbart "##
 * Dataset"-blocket är dataset-yta (filens "Aktieanalyser"-sektion listar
 * medvetet publika per-bolagsanalyser — utanför kontraktet).
 *
 * Körs: node verktyg/v98-dataset-vakt.mjs  (efter `next build`).
 * Avslutskod 1 vid ENDA träff — vakten är hård, inte rådgivande.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const ROT = process.cwd();

// ── 1. Läckage-mönstren: 100 tickers + namn ──────────────────────────────────
const universum = JSON.parse(
  readFileSync(path.join(ROT, "data", "portfolj-system", "bolagsunivers.json"), "utf8"),
);
const tickers = universum
  .map((r) => r.ticker)
  .filter((t) => typeof t === "string" && t.length >= 1);
const namn = universum
  .map((r) => r.namn)
  .filter((n) => typeof n === "string" && n.trim().length >= 4);
if (tickers.length < 100 || namn.length < 100) {
  console.error(
    `FEL: universumet har ${tickers.length} tickers / ${namn.length} namn (väntade 100).`,
  );
  process.exit(1);
}

// Svensk-medveten ordgräns: rå \b missar Å/Ä/ö ( \bT\b träffar "Tänka" ),
// så gränsen exkluderar både ASCII-ordtecken OCH svenska bokstäver. Tickers
// innehåller ibland - och . (HM-B.ST) — de matchas bokstavligt inuti, som
// gräns räknas de som lucka (sannt: URL:er och listor).
const GRANS = "[A-Za-z0-9ÅÄÖåäö]";
const tickerRe = new RegExp(
  `(?<!${GRANS})(${tickers.join("|")})(?!${GRANS})`,
  "g",
);

/** llms-filens "## Dataset"-sektion — dataset-ytans enda block i filen. */
function datasetSektion(text) {
  const start = text.indexOf("## Dataset");
  if (start === -1) return "";
  const slut = text.indexOf("\n## ", start + 1);
  return slut === -1 ? text.slice(start) : text.slice(start, slut);
}

// ── 2. Utdatafilerna: dataset-ytans alla ytor ────────────────────────────────
const filer = [];
const samla = (dir) => {
  let poster;
  try {
    poster = readdirSync(dir);
  } catch {
    return; // katalogen finns inte i denna build — hoppa tyst
  }
  for (const p of poster) {
    const full = path.join(dir, p);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) samla(full);
    else if (st.isFile() && st.size <= 30 * 1024 * 1024) filer.push(full);
  }
};

// Sidutdata (HTML + RSC + meta) för dataset-rutterna i alla tre språk.
for (const rot of [
  path.join(ROT, ".next", "server", "app", "dataset"),
  path.join(ROT, ".next", "server", "app", "en", "dataset"),
  path.join(ROT, ".next", "server", "app", "ar", "dataset"),
]) {
  samla(rot);
  // force-static lägger index-sidorna som dataset.html (fil, ej katalog).
  for (const suffix of [".html", ".rsc", ".meta"]) {
    const f = rot + suffix;
    if (existsSync(f)) filer.push(f);
  }
}
// llms.txt + llms-full.txt skannas PER SEKTION (endast "## Dataset"-blocket)
// — filens "Aktieanalyser"-sektion listar medvetet publika per-bolagsanalyser
// och ligger utanför dataset-kontraktet.
const llmsFiler = [];
for (const f of [
  path.join(ROT, "public", "llms.txt"),
  path.join(ROT, "public", "llms-full.txt"),
]) {
  if (existsSync(f)) llmsFiler.push(f);
}
// sitemap + robots (maskinytor — hela filen är relevant).
for (const f of [
  path.join(ROT, ".next", "server", "app", "sitemap.xml.body"),
  path.join(ROT, ".next", "server", "app", "robots.txt.body"),
]) {
  if (existsSync(f)) filer.push(f);
}

if (filer.length === 0 && llmsFiler.length === 0) {
  console.error("FEL: inga utdatafiler hittades — kör `next build` först.");
  process.exit(1);
}

// ── 3. Skanna ────────────────────────────────────────────────────────────────
let traffor = 0;
const rapportera = (fil, vad, matchning) => {
  traffor += 1;
  console.log(`TRÄFF: ${vad} "${matchning}" i ${path.relative(ROT, fil)}`);
};

/** En text mot alla mönster (tickers ordbundet, namn exakt). */
const skanna = (text, fil) => {
  // Skrubb av godartade ramverks-tokens FÖRE matchning — smal och
  // dokumenterad: språkkoderna sv-SE/sv_SE (html lang, og:locale, JSON-LD
  // inLanguage) och Next-cache-tag-prefixet _N_T_. Inget av dessa kan dölja
  // en äkta läcka: en raderad "SE" i "sv-SE" påverkar aldrig tickern SE på
  // annan plats, och en läckt "ticker":"T" rörs inte av _N_T_-prefixet.
  const ren = text.replaceAll("sv-SE", "").replaceAll("sv_SE", "").replaceAll("_N_T_", "");
  for (const m of ren.matchAll(tickerRe)) rapportera(fil, "ticker", m[1]);
  for (const n of namn) {
    if (ren.includes(n)) rapportera(fil, "namn", n);
  }
};

for (const fil of filer) {
  let text;
  try {
    text = readFileSync(fil, "utf8");
  } catch {
    continue;
  }
  skanna(text, fil);
}
for (const fil of llmsFiler) {
  let text;
  try {
    text = readFileSync(fil, "utf8");
  } catch {
    continue;
  }
  skanna(datasetSektion(text), fil);
}

// ── 4. Dom ───────────────────────────────────────────────────────────────────
const totaltFiler = filer.length + llmsFiler.length;
console.log(
  traffor === 0
    ? `GRÖN: 0 träffar — ${tickers.length} tickers + ${namn.length} namn sökta i ${totaltFiler} utdatafiler (dataset-ytan: sidor ×3 språk + RSC + segment, llms Dataset-blocket, sitemap/robots). Kontraktet §1 håller.`
    : `RÖD: ${traffor} träffar av ${tickers.length + namn.length} mönster i ${totaltFiler} filer — kontraktsbrott, åtgärda före deploy.`,
);
process.exit(traffor === 0 ? 0 : 1);
