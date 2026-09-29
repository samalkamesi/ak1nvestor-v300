#!/usr/bin/env node
/**
 * PREFETCH-EFTERMÄTNINGEN (v207 r333 — v206-kurens verkliga effektmätning)
 * =====================================================================
 * v206 (beed9f7d, 27 platser) satte prefetch={false} på tunga rutt-länkar:
 * motorbunten med superanalys/konfluens-motorerna (monte/kelly/SAM/bayes,
 * ~1,35 MB) laddades via Next-Link-ruttprefetch på ALLA sidor fast den
 * exekveras aldrig där. r327:s instrumentfynd: prefetch sker i RUNTIME
 * (viewport-triggat) — serverad HTML kan ALDRIG visa effekten.
 *
 * Detta verktyg är därför en riktig browser-mätning (puppeteer-core +
 * chromeSokvag()): för varje sida mäts
 *   A) INITIAL-lasen: script-bytes t.o.m. networkidle2 (utan scroll),
 *   B) SCROLL-lasen: efter full botten-scroll + 6 s (viewport-prefetchens
 *      exakta trigg), total script-bytes.
 * Motorchunkarna identifieras DYNAMISKT via ÄKTA KODSIGNATURER ur
 * motor-källorna (src/lib/superanalys.ts, konfluens-motor.ts, akm2/) —
 * robusta mot nästa bygges hash-namn. R334-LÄRAN: textgreppet
 * 'monteCarlo|kelly|bayes/i' gav FALSKA positiva (flashcards, kurs-ID:n
 * och AI-mentor-text nämner Monte Carlo/Kelly/Bayes — kurstext, ej kod);
 * signaturerna nedan är export-/Konstant-namn som endast finns i motorn.
 *
 * KVD: v206:s mål = motorchunkar (0 st) och ingen ~1,35 MB-skillnad
 * mellan initial- och scroll-las på vanliga sidor.
 * Körs: node verktyg/prefetch-eftermatning.mjs [--bas=http://localhost:3000]
 * Rapport: data/forskning/OPTIMERING/lighthouse/v207-eftermatning-<ts>.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { chromeSokvag } from "./chrome-sokvag.mjs";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BAS = process.argv.find(a => a.startsWith("--bas="))?.slice(6) || "http://localhost:3000";
// Chunkkatalogen MÅSTE komma från artefakten som BAS serverar — ytan och
// prod (AK1) är olika byggen med olika chunk-hashar; korsar man dem kan
// en äkta motorchunk i serverad artefakt matcha falskt negativt (r334).
const chunksFlag = process.argv.find(a => a.startsWith("--chunks="))?.slice(9);
const CHUNKDIR = chunksFlag
  ? chunksFlag
  : BAS.includes("localhost") || BAS.includes("127.0.0.1")
    ? "/home/ak1a/AK1/.next/static/chunks" // pm2 ak1a serverar prod-repot
    : path.join(ROT, ".next", "static", "chunks");
const RAPPORTKAT = path.join(ROT, "data", "forskning", "OPTIMERING", "lighthouse");

// ── motorchunkar per ÄKTA kodsignatur (inte hash-namn, inte kurstext) ──
// superanalys.ts · konfluens-motor.ts · akm2/{karna,vikter}.ts
const MOTOR_SIGNATUR =
  /skannaKonfluens|AKM1_VARIABLER|ak1tsTolkning|raknaKategorier|valideraKonfluens|MAX_TICKER_KONFLUENS|AKM2_2026_GRUNDTABELL_KARNA|SUPERANALYS_2026_KATEGORIVIKTER|KARNVARIABLER|raknaAKM1Intern|losaVikter/;
const motorChunkar = new Set();
for (const fil of fs.readdirSync(CHUNKDIR).filter(f => f.endsWith(".js"))) {
  try {
    const txt = fs.readFileSync(path.join(CHUNKDIR, fil), "utf8");
    if (MOTOR_SIGNATUR.test(txt)) motorChunkar.add(fil);
  } catch { /* oläsbar — nästa */ }
}
console.log(`motorchunkar identifierade: ${motorChunkar.size} st (${[...motorChunkar].join(", ")})`);

const SIDER = ["/", "/blogg", "/dataset", "/kurser"];

async function mätSida(page, url) {
  const laddade = new Map(); // filnamn → bytes
  const lyssnare = (resp) => {
    const u = resp.url();
    if (!u.includes("/_next/static/")) return;
    const fil = u.split("/").pop().split("?")[0];
    if (fil.endsWith(".js")) {
      const h = resp.headers();
      const len = Number(h["content-length"]);
      laddade.set(fil, len || 0);
    }
  };
  page.on("response", lyssnare);

  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 1500));
  const initial = { filer: [...laddade.keys()], motor: [...laddade.keys()].filter(f => motorChunkar.has(f)) };

  await page.evaluate(async () => {
    const steg = Math.ceil(document.body.scrollHeight / 8);
    for (let y = 0; y <= document.body.scrollHeight; y += steg) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 350));
    }
  });
  await new Promise(r => setTimeout(r, 6000)); // viewport-prefetchens fönster
  page.off("response", lyssnare);

  const efter = [...laddade.keys()];
  return {
    url,
    initial: {
      antalJs: initial.filer.length,
      motorChunkar: initial.motor,
    },
    efterScroll: {
      antalJs: efter.length,
      nyaEfterScroll: efter.filter(f => !initial.filer.includes(f)),
      motorChunkar: efter.filter(f => motorChunkar.has(f)),
    },
  };
}

const browser = await puppeteer.launch({
  executablePath: chromeSokvag(),
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

const resultat = [];
try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  for (const sida of SIDER) {
    console.log(`mäter ${BAS}${sida} …`);
    const r = await mätSida(page, `${BAS}${sida}`);
    resultat.push(r);
    console.log(`  initial: ${r.initial.antalJs} js · motor: ${r.initial.motorChunkar.length} · efter scroll: ${r.efterScroll.antalJs} js · motor totalt: ${r.efterScroll.motorChunkar.length} · nya efter scroll: ${r.efterScroll.nyaEfterScroll.length}`);
  }
} finally {
  await browser.close();
}

const motorLastadeNågonstans = resultat.flatMap(r => r.efterScroll.motorChunkar);
const dom = {
  motorChunkar: [...motorChunkar],
  motorLastade: [...new Set(motorLastadeNågonstans)],
  sidaMedMotor: resultat.filter(r => r.efterScroll.motorChunkar.length > 0).map(r => r.url),
  gron: motorLastadeNågonstans.length === 0,
  resultat,
};

fs.mkdirSync(RAPPORTKAT, { recursive: true });
const fil = path.join(RAPPORTKAT, `v207-eftermatning-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "")}.json`);
fs.writeFileSync(fil, JSON.stringify(dom, null, 2) + "\n");
console.log(`\nDOM: ${dom.gron ? "GRÖN — motorchunkar (0 st) laddas på vanliga sidor; v206-kurens mål uppfyllt" : "FYND — motorchunkar laddas: " + [...new Set(motorLastadeNågonstans)].join(", ")}`);
console.log(`rapport: ${fil}`);
process.exit(dom.gron ? 0 : 1);
