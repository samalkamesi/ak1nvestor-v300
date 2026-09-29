#!/usr/bin/env node
// döda-länkar-vakten — systematisk intern länkkontroll (spår 8, 2026-09-15;
// instrumentkur o55 2026-09-17: mätfönster-grind + driftfel-tak + filskydd)
//
// Metod: hämtar /sitemap.xml som frö, crawlar varje sida (GET, följer
// omdirigeringar), plockar ut ALLA interna <a href>-mål, kontrollerar varje
// unikt mål tills länkgrafen är sluten. Rapporterar mål som svarar 4xx/5xx
// (= döda länkar) med vilka källsidor som pekar dit (rotorsaker), plus
// omdirigeringar som observationsmaterial.
//
// MÄTFÖNSTER-GRIND (o47 §2 inbyggt i verktyget 2026-09-17 — tidigare fanns
// kuren bara i protokollet): FÖRE crawlen verifieras (a) att ingen process
// ÄGER deploy-låset — /proc-fd-läsning (o570: fuser/psmisc saknas på SSD
// Nodes-servern; en flock-hållare bär alltid en öppen fd), ALDRIG låsfilens
// existens (flock lämnar filen kvar mellan deploys) — (b) ingen bygg/install-process
// (pgrep "next build"/"npm ci"), (c) basen frisk (/ och /kurser = 200).
// Missar ⇒ avbrott INNAN något mätvärde producerats. En crawl som PåGÅR när
// ett byggfönster öppnar fångas av DRIFTFEL-TAKET efteråt: landar > 5 % av
// sidorna på 5xx/nätfel KASSERAS rapporten och INGEN fyndfil skrivs
// (artefaktdoktrinen: driftfönster bokförs aldrig som döda länkar — o47:s
// 1 616×500-klass). Rapportfilen skrivs ALDRIG över (klockslagssuffix).
//
// --tvinga = diagnostikläge: hoppar grunderna och taket, märker utdatafilen
// "diagnostik" — resultatet är ALDRIG ett mätvärde, bara driftunderlag.
//
// Miljövariabler (testbarhet; standardvärden = skarpt läge):
//   AK1A_DEPLOY_LAS   sökväg till deploy-låset (standard /tmp/ak1a-deploy.lock)
//   AK1A_BYGG_MONSTER  kommaseparerade HELA pgrep-mönster (standard
//                      "next build,npm ci --no-audit" — mönsterflaggan:
//                      ALDRIG bara "next" (pm2:s server bär det dagligen)
//                      och ALDRIG bara "npm ci" (fabriksagenteras prompter
//                      innehåller den regeln — pgrep -f matchar cmdlines,
//                      levande bevis 2026-09-17: 3 zcode-barn vid varje våg;
//                      deploy-kontraktets flaggor "--no-audit" finns bara i
//                      det ÄKTA installationsanropet)
//
// 0 npm-beroenden (node: fetch, AbortController). Bas MÅSTE vara localhost
// (whitelistad i middleware — AGENTS.md). Skonsam mot prod: fast concurrency,
// tidsgräns per förfrågan, inga återförsök, hårt tak på antal sidor.
//
// Körning: node verktyg/doda-lankar.mjs [--bas=http://localhost:3000] [--djup=3]
// Avslutskoder: 0 = mätvärde levererat · 1 = grind/fel (fönstret var ej
// mätbart) · 2 = driftfönster, rapport kasserad (inget mätvärde).
// Lämnar:  data/vakten/doda-lankar-<datum>.json + sammanfattning på stdout

import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const koraKommando = promisify(execFile);

const args = process.argv.slice(2);
function argument(namn, standard) {
  const i = args.indexOf(`--${namn}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : standard;
}
const BAS = argument("bas", "http://localhost:3000").replace(/\/$/, "");
const DJUP = parseInt(argument("djup", "3"), 10);
const TVINGAD = args.includes("--tvinga");
const SAMTIDIGA = 6;
const TIDSGRANS_MS = 20_000;
const TAK_SIDOR = 5000;
const DRIFT_TAK = 0.05; // > 5 % serverfel/nätfel = driftfönster, ej länkgraf
const DEPLOY_LAS = process.env.AK1A_DEPLOY_LAS || "/tmp/ak1a-deploy.lock";
const BYGG_MONSTER = (process.env.AK1A_BYGG_MONSTER || "next build,npm ci --no-audit")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// Sessionstyrda app-ytor omdirigerar vid anonym crawling och är inte "döda" —
// de mäts av gränsnittsvakten i stället. API-rutter är inga länkmål.
// /logga-ut är POST-endast (GET → 404 är design, länkas aldrig som <a href>).
const HOPP_OVER_PREFIX = ["/studio", "/admin", "/api/", "/logga-ut"];

const t0 = Date.now();
const sidor = new Map(); // sökväg → { status, slutlig, fel, niva, kallor: [] }
const kallor = new Map(); // målsökväg → Set<källsökväg>
let internationellt = 0; // totalsvarvning (takvakt)

function logg(handelse, data) {
  process.stderr.write(`[doda-lankar] ${handelse}: ${JSON.stringify(data)}\n`);
}

async function lasHollare() {
  // o570: fuser (psmisc) SAKNAS på SSD Nodes-servern (Contabo-födda verktyg)
  // — fd-ägandet läses i stället direkt ur /proc: en flock-hållare bär ALLTID
  // en öppen fd mot låsfilen, exakt den sanning fuser lämnade. ALDRIG en egen
  // flock-probe här: den skulle själv ta låset en microsekund och kan få en
  // ÄKTA deploys non-blocking acquire att fela. Stat öppnar ingen fd — sonden
  // kan aldrig se sig själv.
  let lasSokvag;
  try {
    lasSokvag = fs.realpathSync(DEPLOY_LAS);
  } catch {
    return null; // filen finns ej = ingen kan hålla den
  }
  const pids = [];
  for (const pid of fs.readdirSync("/proc")) {
    if (!/^\d+$/.test(pid)) continue;
    let fds;
    try {
      fds = fs.readdirSync(`/proc/${pid}/fd`);
    } catch {
      continue; // andra användare/processzoner — fuser hade samma gräns
    }
    for (const fd of fds) {
      let mal;
      try {
        mal = fs.readlinkSync(`/proc/${pid}/fd/${fd}`);
      } catch {
        continue;
      }
      if (mal === lasSokvag) {
        pids.push(pid);
        break;
      }
    }
  }
  return pids.length > 0 ? pids.join(",") : null;
}

async function lasByggprocess() {
  for (const monster of BYGG_MONSTER) {
    try {
      await koraKommando("pgrep", ["-f", monster]);
      return monster; // exit 0 = matchande process lever
    } catch {
      // ej hittad — nästa mönster
    }
  }
  return null;
}

async function verifyeraMatfonster() {
  const hollare = await lasHollare();
  if (hollare) {
    console.error(`GRIND: deployfönster aktivt — låset ägs av PID ${hollare}; mätning avbryten (o47 §2).`);
    process.exit(1);
  }
  const bygg = await lasByggprocess();
  if (bygg) {
    console.error(`GRIND: bygg/install-process pågår ("${bygg}"); mätning avbryten (o47 §2).`);
    process.exit(1);
  }
  for (const sond of ["/", "/kurser"]) {
    const { status } = await hamta(sond);
    if (status !== 200) {
      console.error(`GRIND: basen ej frisk — ${sond} svarade ${status || "inget svar"}; mätning avbryten (o47 §2).`);
      process.exit(1);
    }
  }
  logg("matfonster", { grunder: "gröna", las: DEPLOY_LAS });
}

async function hamta(sokvag) {
  const kontroll = new AbortController();
  const tid = setTimeout(() => kontroll.abort(), TIDSGRANS_MS);
  try {
    const svar = await fetch(`${BAS}${sokvag}`, {
      redirect: "follow",
      signal: kontroll.signal,
      headers: { "user-agent": "ak1a-doda-lankar/1.0 (+vakten)" },
    });
    const text = await svar.text();
    return { status: svar.status, url: svar.url, text };
  } catch (fel) {
    return { status: 0, url: sokvag, text: "", fel: String(fel?.cause?.code || fel?.message || fel) };
  } finally {
    clearTimeout(tid);
  }
}

function extraheraLankar(html) {
  const maltal = new Set();
  const re = /<a\b[^>]*\shref\s*=\s*["']([^"']+)["']/gi;
  let t;
  while ((t = re.exec(html)) !== null) {
    let href = t[1].replace(/&amp;/g, "&");
    if (href.startsWith(`${BAS}/`)) href = href.slice(BAS.length);
    if (!href.startsWith("/")) continue; // externa, ankare, mailto, tel, relativa
    href = href.split("#")[0];
    if (!href || href === "/") continue;
    if (HOPP_OVER_PREFIX.some((p) => href.startsWith(p))) continue;
    maltal.add(href);
  }
  return [...maltal];
}

async function lasSitemap() {
  const { status, text } = await hamta("/sitemap.xml");
  if (status !== 200) {
    console.error(`FEL: sitemap svarade ${status} — avbryter`);
    process.exit(1);
  }
  const fron = [];
  for (const rad of text.split("<loc>")) {
    if (!rad.includes("</loc>")) continue;
    const loc = rad.split("</loc>")[0].trim();
    // sitemapen använder publika domänen — normalisera till sökväg oavsett origin
    try {
      const u = new URL(loc);
      if (u.pathname) fron.push(u.pathname + (u.search || "") || "/");
    } catch {
      // rå sökväg
      if (loc.startsWith("/")) fron.push(loc);
    }
  }
  logg("sitemap", { antal: fron.length });
  return fron;
}

async function crawla(fron, djup) {
  const ko = fron.map((s) => ({ sokvag: s, niva: 0 }));
  let aktiva = 0;

  await new Promise((losa) => {
    function pumpa() {
      while (aktiva < SAMTIDIGA && ko.length > 0) {
        const { sokvag, niva } = ko.shift();
        if (sidor.has(sokvag) || internationellt >= TAK_SIDOR) continue;
        internationellt++;
        aktiva++;
        hamta(sokvag).then(({ status, url, text, fel }) => {
          const slutlig = url.startsWith(BAS) ? url.slice(BAS.length) : sokvag;
          sidor.set(sokvag, { status, slutlig, niva, fel: fel || null, kallor: [] });
          if (status >= 200 && status < 400) {
            for (const maltal of extraheraLankar(text)) {
              const s = kallor.get(maltal) || new Set();
              s.add(sokvag);
              kallor.set(maltal, s);
              if (!sidor.has(maltal) && niva < djup) ko.push({ sokvag: maltal, niva: niva + 1 });
            }
          }
          aktiva--;
          pumpa();
        });
      }
      if (aktiva === 0 && ko.length === 0) losa();
    }
    pumpa();
  });
}

if (!TVINGAD) await verifyeraMatfonster();

const fron = await lasSitemap();
await crawla(fron, DJUP);
logg("crawlad", { sidor: sidor.size, ms: Date.now() - t0 });

// Driftfel-tak (artefaktdoktrinen): ett byggfönster som öppnar MITT I
// mätningen ger massiva 5xx/nätfel — det är drift, inte döda länkar, och
// får aldrig bokföras som fynd (o47: 1 616×500 = 100 % driftfel).
const driftfel = [...sidor.values()].filter((p) => p.status === 0 || p.status >= 500).length;
const driftAndel = sidor.size > 0 ? driftfel / sidor.size : 0;
if (!TVINGAD && driftAndel > DRIFT_TAK) {
  console.error(
    `DRIFTFÖNSTER: ${(driftAndel * 100).toFixed(1)} % av ${sidor.size} sidor svarade 5xx/nätfel ` +
      `(tak ${(DRIFT_TAK * 100).toFixed(0)} %) — rapporten kasseras, ingen fyndfil skrivs (o47 §2). ` +
      `Diagnostik vid driftfynd: kör om med --tvinga (utdata märks diagnostik, är ALDRIG mätvärde).`
  );
  process.exit(2);
}

for (const [maltal, s] of kallor) {
  const post = sidor.get(maltal);
  if (post) post.kallor = [...s].sort().slice(0, 25);
}

const doda = [...sidor.entries()]
  .filter(([s, p]) => p.status === 0 || p.status >= 400)
  .map(([s, p]) => ({ mal: s, status: p.status, fel: p.fel, kallor: p.kallor }))
  .sort((a, b) => (a.status === b.status ? a.mal.localeCompare(b.mal) : a.status - b.status));

const omdirigeringar = [...sidor.entries()]
  .filter(([s, p]) => p.slutlig !== s && p.status > 0 && p.status < 400)
  .map(([s, p]) => ({ mal: s, status: p.status, slutlig: p.slutlig, kallor: p.kallor }))
  .sort((a, b) => a.mal.localeCompare(b.mal));

const rapport = {
  bas: BAS,
  tid: new Date().toISOString(),
  sekunder: Math.round((Date.now() - t0) / 1000),
  djup: DJUP,
  tvingad: TVINGAD,
  kontrolleradeSidor: sidor.size,
  dodaLankar: doda.length,
  omdirigeringar: omdirigeringar.length,
  prefixstatistik: (() => {
    const stat = new Map();
    for (const s of sidor.keys()) {
      const delar = s.split("/");
      const p = delar.length > 2 ? `/${delar[1]}/${delar[2]}` : `/${delar[1] || ""}`;
      stat.set(p, (stat.get(p) || 0) + 1);
    }
    return [...stat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
  })(),
  doda,
  omdirigeringar,
};

// Filskydd: en rapportfil skrivs ALDRIG över — samma dagens tidigare mätning
// (t.ex. ett driftfynds bevisfil) bevaras och klockslagssuffix skiljer nästa.
const datum = new Date().toISOString().slice(0, 10);
let utNamn = `${TVINGAD ? "doda-lankar-diagnostik-" : "doda-lankar-"}${datum}.json`;
let utFil = path.join(process.cwd(), "data", "vakten", utNamn);
if (fs.existsSync(utFil)) {
  utNamn = utNamn.replace(".json", `-${new Date().toISOString().slice(11, 19).replace(/:/g, "")}.json`);
  utFil = path.join(process.cwd(), "data", "vakten", utNamn);
}
fs.mkdirSync(path.dirname(utFil), { recursive: true });
fs.writeFileSync(utFil, JSON.stringify(rapport, null, 2) + "\n");

console.log(`Kontrollerade ${sidor.size} unika sökvägar på ${BAS} (${rapport.sekunder} s)${TVINGAD ? " [DIAGNOSTIK — ej mätvärde]" : ""}`);
console.log(`DÖDA LÄNKAR: ${doda.length}`);
for (const d of doda.slice(0, 60)) {
  console.log(`  ${d.status || "FEL"} ${d.mal}  ← ${d.kallor.slice(0, 3).join(", ") || "(sitemap)"}`);
}
if (doda.length > 60) console.log(`  … och ${doda.length - 60} till (se JSON)`);
console.log(`Omdirigeringar: ${omdirigeringar.length}`);
for (const o of omdirigeringar.slice(0, 25)) console.log(`  ${o.status} ${o.mal} → ${o.slutlig}`);
console.log(`Rapport: ${utFil}`);
