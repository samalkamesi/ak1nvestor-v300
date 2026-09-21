#!/usr/bin/env node
// ── SITEMAP-LIVSKONTRAKTET (o147, spår 8 — komplement till o146:s bolagsledger) ─
//
// KONTRAKT: sitemap.xml får ALDRIG annonsera en URL som tjänsten svarar 404
// på. De byggfrusna klasserna (dynamicParams=false: /bolag/[slug],
// /dataset/[bransch], /dataset/[bransch]/[aspekt], /rapportakademin + en/ar-
// dataset-speglar) är klasserna där LIVE-data + hårdkodade poster kan lova
// mer än det KÖRANDE bygget levererar (bevis 2026-09-21: 6 bolagssidor +
// rapportakademin = 404 på prod medan sitemap listade dem — gränsnittsvaktens
// 24 konsolfynd + 09:02Z-rapportakademin).
//
// DEL A (enhet): byggdSidaFinns i src/lib/sitemap-byggsanning.ts —
//   invarianter (byggstatusoberoende):
//   A1 konsistens: byggdSidaFinns(p) === existsSync(.next/server/app/p.html)
//      när .next finns (probas mot verkliga trädet, samples + skräpslug)
//   A2 fail-open: utan .next (cwd utan bygginformation) ⇒ true (dev/första
//      körning reklamerar som före o147 — ALDRIG tyst gallring)
//
// DEL B (live): hämta {bas}/sitemap.xml, proba VARJE annonserad URL i de
//   byggfrusna klasserna: 404/5xx = FEL (exit 1), 3xx = varning, övriga
//   non-200 = varning. Rapport data/vakten/sitemap-livskontrakt-SENASTE.json.
//
//   FÖRE-läge (läkebygget d401d719, 2026-09-21): 7 kända 404:or — sviten
//   dokumenterar dem; EFTER nästa gröna bygge (med o146+o147 i trädet)
//   skall sviten vara 0 FEL — kör då: node verktyg/testa-sitemap-livskontrakt.mjs
//
// Användning: node verktyg/testa-sitemap-livskontrakt.mjs [--bas=http://localhost:3000]

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const HÄR = path.dirname(new URL(import.meta.url).pathname);
const ROT = path.resolve(HÄR, "..");

function lasArg(namn, standard) {
  const i = process.argv.indexOf(`--${namn}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : standard;
}
const BAS = lasArg("bas", "http://localhost:3000").replace(/\/$/, "");

let fel = 0;
let varningar = 0;
const rapport = { ts: new Date().toISOString(), bas: BAS, enhet: {}, live: {}, fel404: [] };

function FAIL(msg) {
  fel++;
  console.error(`FEL: ${msg}`);
}
function VARN(msg) {
  varningar++;
  console.warn(`VARNING: ${msg}`);
}
function PASS(msg) {
  console.log(`PASS: ${msg}`);
}

// ── DEL A: enhetsinvarianter ─────────────────────────────────────────────────

const { aktiveraTsImport } = await import(pathToFileURL(path.join(HÄR, "ts-import.mjs")).href);
aktiveraTsImport();
const { byggdSidaFinns } = await import(
  pathToFileURL(path.join(ROT, "src/lib/sitemap-byggsanning.ts")).href
);

const BYGG_APP = path.join(ROT, ".next", "server", "app");
const harBygg = existsSync(path.join(ROT, ".next", "BUILD_ID")) && existsSync(BYGG_APP);

if (harBygg) {
  // A1: sonden speglar byggets egna filer EXAKT (både nya och gamla ytor).
  const prov = [
    "bolag/hm-b-st",
    "bolag/barc-l",
    "dataset/energi",
    "dataset/energi/brutto-marginal",
    "en/dataset/energi",
    "ar/dataset/energi",
    "rapportakademin",
    "bolag/finns-ej-x99",
    "dataset/finns-ej",
  ];
  for (const p of prov) {
    const sond = byggdSidaFinns(p);
    const disk = existsSync(path.join(BYGG_APP, `${p}.html`));
    if (sond === disk) PASS(`A1 konsistens ${p} (=${sond})`);
    else FAIL(`A1 ${p}: sond=${sond} men disk=${disk} — byggdSidaFinns speglar inte .next`);
  }
} else {
  VARN("A1 skippad: inget .next i trädet (dev/första körning) — konsistens probas ej");
}

// A2: fail-open — process UTAN bygginformation (cwd utan .next) reklamerar.
{
  const tmp = path.join(ROT, ".tmp-sitemap-livskontrakt-a2");
  mkdirSync(tmp, { recursive: true });
  const sondFil = path.join(tmp, "a2-sond.mjs");
  writeFileSync(
    sondFil,
    `import { pathToFileURL } from "node:url";\n` +
      `import path from "node:path";\n` +
      `const HÄR = ${JSON.stringify(HÄR)};\n` +
      `const { aktiveraTsImport } = await import(pathToFileURL(path.join(HÄR, "ts-import.mjs")).href);\n` +
      `aktiveraTsImport();\n` +
      `const { byggdSidaFinns } = await import(pathToFileURL(${JSON.stringify(path.join(ROT, "src/lib/sitemap-byggsanning.ts"))}).href);\n` +
      `console.log(byggdSidaFinns("bolag/finns-ej-x99") ? "true" : "false");\n`
  );
  const r = spawnSync(process.execPath, [sondFil], { cwd: tmp, encoding: "utf8", timeout: 30000 });
  const svar = (r.stdout || "").trim();
  if (r.status === 0 && svar === "true") PASS("A2 fail-open: utan bygginformation ⇒ reklamera (true)");
  else FAIL(`A2 fail-open: utan .next skall sonden svara true (fick status=${r.status} utdata='${svar}' fel='${(r.stderr || "").slice(0, 200)}')`);
  rapport.enhet = { harBygg, a1Provat: harBygg ? "ja" : "skippat", a2: svar === "true" ? "pass" : "fail" };
}

// ── DEL B: livskontraktet — annonserade URL:er i byggfrusna klasserna ───────

async function proba(url) {
  const kontroll = new AbortController();
  const timer = setTimeout(() => kontroll.abort(), 10000);
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "manual", signal: kontroll.signal });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: "GET", redirect: "manual", signal: kontroll.signal });
    }
    return res.status;
  } catch (e) {
    return `kast: ${String(e).slice(0, 60)}`;
  } finally {
    clearTimeout(timer);
  }
}

/** 429 = rategräns, inte sidans sanning — en omprov efter paus, annars oprovad. */
async function probaMedOmprov(url) {
  let status = await proba(url);
  if (status === 429) {
    await new Promise((lr) => setTimeout(lr, 1500));
    status = await proba(url);
  }
  return status;
}

let smStatus = "?";
try {
  const sm = await fetch(`${BAS}/sitemap.xml`, { signal: AbortSignal.timeout(15000) });
  smStatus = sm.status;
  if (!sm.ok) throw new Error(`sitemap ${sm.status}`);
  const xml = await sm.text();
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]);

  // De byggfrusna klasserna (o146/o147): bolag, dataset-bransch (sv/en/ar),
  // dataset-aspekt, rapportakademin. Övriga klasser (kurser, blogg,
  // analyser, on-demand-ISR) självtjänar och probas ej här.
  const hamta = (u) => {
    const p = new URL(u).pathname;
    if (p === "/rapportakademin") return true;
    if (/^\/(en|ar)\/dataset\/[^/]+$/.test(p)) return true;
    if (/^\/dataset\/[^/]+(\/[^/]+)?$/.test(p)) return true;
    if (/^\/bolag\/[^/]+$/.test(p)) return true;
    return false;
  };
  const mal = locs.filter(hamta);
  console.log(`Livskontrakt: ${locs.length} URL:er i sitemap, ${mal.length} i byggfrusna klasser probas`);

  const perKlass = {};
  let oprovade = 0;
  // sitemap:s <loc> bär produktionsdomänen — kontraktet probas MOT BAS
  // (localhost = samma tjänst, loopback-whitelistad: inga nginx-rategränser
  // färgar sanningen om sidorna; sviten ska mäta SIDORNA, inte grinden).
  const motBas = (u) => u.replace(/^https?:\/\/[^/]+/, BAS);
  for (const u of mal) {
    const p = new URL(u).pathname;
    const klass = p === "/rapportakademin" ? "rapportakademin"
      : p.startsWith("/bolag/") ? "bolag"
      : /^\/(en|ar)\/dataset\//.test(p) ? "dataset-spegel"
      : p.split("/").length === 4 ? "dataset-aspekt"
      : "dataset-bransch";
    const status = await probaMedOmprov(motBas(u));
    perKlass[klass] = perKlass[klass] || { totalt: 0, fel: 0, varning: 0, oprovade: 0 };
    perKlass[klass].totalt++;
    if (status === 429 || typeof status !== "number") {
      // oprovad: rategräns/sondfel säger INGET om sidan — aldrig grönt aldrig rött
      perKlass[klass].oprovade++;
      oprovade++;
      VARN(`livskontrakt ${p} ⇒ ${status} (oprovad — sidans sanning okänd denna runda)`);
    } else if (status === 404 || status >= 500) {
      perKlass[klass].fel++;
      rapport.fel404.push({ url: u, status });
      FAIL(`livskontrakt ${p} ⇒ ${status} (sitemap annonserar en sida tjänsten ej levererar)`);
    } else if (status !== 200) {
      perKlass[klass].varning++;
      VARN(`livskontrakt ${p} ⇒ ${status} (ej 200 — men inte dött löfte)`);
    }
    await new Promise((lr) => setTimeout(lr, 100));
  }
  rapport.live = {
    sitemapStatus: smStatus,
    annonserade: locs.length,
    provade: mal.length,
    oprovade,
    perKlass,
  };
} catch (e) {
  FAIL(`livskontraktet kunde ej köras: ${String(e).slice(0, 200)}`);
  rapport.live = { sitemapStatus: smStatus, fel: String(e).slice(0, 200) };
}

try {
  writeFileSync(
    path.join(ROT, "data", "vakten", "sitemap-livskontrakt-SENASTE.json"),
    JSON.stringify(rapport, null, 2)
  );
  console.log(`Rapport: data/vakten/sitemap-livskontrakt-SENASTE.json`);
} catch {
  VARN("kunde ej skriva rapportfilen (körbehörighet?) — svitens utdata ovan gäller");
}

console.log(`\nSLUTSTÄLLNING: ${fel} FEL · ${varningar} varningar · ${rapport.live.oprovade ?? 0} oprovade`);
const oprovadeAndel = rapport.live.provade
  ? (rapport.live.oprovade ?? 0) / rapport.live.provade
  : 1;
if (fel === 0 && oprovadeAndel > 0.1) {
  console.log("LIVSKONTRAKTET OFULLSTÄNDIGT — >10 % oprovade: inga döda löften PÅVISADE men kontraktet ej fullt verifierat (kör igen)");
  process.exit(2);
}
console.log(
  fel === 0
    ? "LIVSKONTRAKTET GRÖNT — sitemap annonserar inga döda löften i de byggfrusna klasserna"
    : "LIVSKONTRAKTET RÖTT — sitemap innehåller döda löften (se FEL-raderna; nästa gröna bygge med o146+o147 botar klassen)"
);
process.exit(fel === 0 ? 0 : 1);
