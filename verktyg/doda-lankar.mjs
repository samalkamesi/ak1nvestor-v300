#!/usr/bin/env node
// döda-länkar-vakten — systematisk intern länkkontroll (spår 8, 2026-09-15)
//
// Metod: hämtar /sitemap.xml som frö, crawlar varje sida (GET, följer
// omdirigeringar), plockar ut ALLA interna <a href>-mål, kontrollerar varje
// unikt mål tills länkgrafen är sluten. Rapporterar mål som svarar 4xx/5xx
// (= döda länkar) med vilka källsidor som pekar dit (rotorsaker), plus
// omdirigeringar som observationsmaterial.
//
// 0 npm-beroenden (node: fetch, AbortController). Bas MÅSTE vara localhost
// (whitelistad i middleware — AGENTS.md). Skonsam mot prod: fast concurrency,
// tidsgräns per förfrågan, inga återförsök, hårt tak på antal sidor.
//
// Körning: node verktyg/doda-lankar.mjs [--bas=http://localhost:3000] [--djup=3]
// Lämnar:  data/vakten/doda-lankar-<datum>.json + sammanfattning på stdout

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
function argument(namn, standard) {
  const i = args.indexOf(`--${namn}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : standard;
}
const BAS = argument("bas", "http://localhost:3000").replace(/\/$/, "");
const DJUP = parseInt(argument("djup", "3"), 10);
const SAMTIDIGA = 6;
const TIDSGRANS_MS = 20_000;
const TAK_SIDOR = 5000;

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

const fron = await lasSitemap();
await crawla(fron, DJUP);
logg("crawlad", { sidor: sidor.size, ms: Date.now() - t0 });

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

const utFil = path.join(process.cwd(), "data", "vakten", `doda-lankar-${new Date().toISOString().slice(0, 10)}.json`);
fs.mkdirSync(path.dirname(utFil), { recursive: true });
fs.writeFileSync(utFil, JSON.stringify(rapport, null, 2) + "\n");

console.log(`Kontrollerade ${sidor.size} unika sökvägar på ${BAS} (${rapport.sekunder} s)`);
console.log(`DÖDA LÄNKAR: ${doda.length}`);
for (const d of doda.slice(0, 60)) {
  console.log(`  ${d.status || "FEL"} ${d.mal}  ← ${d.kallor.slice(0, 3).join(", ") || "(sitemap)"}`);
}
if (doda.length > 60) console.log(`  … och ${doda.length - 60} till (se JSON)`);
console.log(`Omdirigeringar: ${omdirigeringar.length}`);
for (const o of omdirigeringar.slice(0, 25)) console.log(`  ${o.status} ${o.mal} → ${o.slutlig}`);
console.log(`Rapport: ${utFil}`);
