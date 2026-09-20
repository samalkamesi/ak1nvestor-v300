#!/usr/bin/env node
/**
 * o123 EFTER-mätare (s7-u2): väntar ut deploy (BUILD_ID-byte från
 * NbvPbGiaL), verifierar prod 200, kör LÄSBARHETSSONDEN (full-dump)
 * mot samma 6 sidor + Lighthouse mobil n=1 på /kalkylator + /superanalys
 * (CLS-fokus: o100:s heliga noll får ej brytas av knapphöjds-tillväxten).
 *
 * Lägen: node verktyg/_s7u2o123-efter.mjs vanta|mata|summera
 * Utdata: data/forskning/OPTIMERING/lasbarhet-efter-o123.json
 *         data/forskning/OPTIMERING/lighthouse/{kalkylator,superanalys}-s7u2o123-efter-n1.json
 */
import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROT = "/home/ak1a/AK1";
const GAMMAL_BUILDID = "NbvPbGiaL-txx0xiLF5as";
const UTFIL_LAS = join(ROT, "data/forskning/OPTIMERING/lasbarhet-efter-o123.json");
const UTFIL_LH = join(ROT, "data/forskning/OPTIMERING/lighthouse");
const NAMN = "s7u2o123-efter";
const LH_KANDIDATER = ["/home/ak1a/.npm/_npx/0f94ee7615faf582/node_modules/lighthouse"];
const SIDOR = ["/superanalys", "/kalkylator", "/konfluens", "/netnet", "/dataset", "/kurser/pe-07-co-investeringen"];
const LH_SIDOR = [
  { namn: "kalkylator", sokvag: "/kalkylator" },
  { namn: "superanalys", sokvag: "/superanalys" },
];
// FÖRE (lasbarhet-fulldump-fore-o123.json, BUILD NbvPbGiaL)
const FORE = { superanalys: [4, 2], kalkylator: [48, 21], konfluens: [2, 0], netnet: [1, 0], dataset: [13, 0], "kurser/pe-07-co-investeringen": [1, 0] };

const LAGE = process.argv[2] || "summera";
const log = (m) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

function memAvailable() {
  return Number(readFileSync("/proc/meminfo", "utf8").match(/MemAvailable:\s+(\d+)/)[1]) / 1024;
}
function buildId() {
  try { return readFileSync(join(ROT, ".next/BUILD_ID"), "utf8").trim(); }
  catch { return "(saknas)"; }
}
function prodKod() {
  try {
    const r = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "https://lab.ak1nvestor.com/kalkylator"], { encoding: "utf8", timeout: 20000 });
    return r.trim();
  } catch { return "FEL"; }
}

/* ---------- läge: vanta ---------- */
async function vanta() {
  const start = Date.now();
  log(`BUILD_ID nu: ${buildId()}`);
  while (buildId() === GAMMAL_BUILDID && Date.now() - start < 25 * 60_000) {
    await new Promise((r) => setTimeout(r, 20_000));
    log(`poll (RAM ${Math.round(memAvailable())} MB): ${buildId()} · prod ${prodKod()}`);
  }
  if (buildId() === GAMMAL_BUILDID) { log("TIDSGRÄNS — bygget kom inte inom 25 min"); process.exit(2); }
  log(`NY BUILD_ID: ${buildId()} — verifierar prod 200 ×5`);
  for (let i = 0; i < 5; i++) {
    const k = prodKod();
    log(`  ${i + 1}/5: ${k}`);
    if (k !== "200") { log("inte 200 — avbryter (vakten äger)"); process.exit(3); }
    await new Promise((r) => setTimeout(r, 4000));
  }
  log("DEPLOY VERIFIERAD — kör 'mata' nu");
}

/* ---------- läge: mata ---------- */
async function mata() {
  // 1) läsbarhetssonden (subprocess — egen CDP-port + RAM-vakt)
  log("sond startar (läsbarhet, 6 sidor)…");
  const r = spawn("node", [join(ROT, "verktyg/_s7u2o123-sond.mjs"), UTFIL_LAS, ...SIDOR], { stdio: "inherit" });
  await new Promise((los) => r.on("close", los));
  if (!existsSync(UTFIL_LAS)) { log("sonden skrev ingen fil — ABROTT"); process.exit(4); }

  // 2) Lighthouse n=1 per sida (o119:as exakta mobil-4G-konfig)
  for (const s of LH_SIDOR) {
    const ut = join(UTFIL_LH, `${s.namn}-${NAMN}-n1.json`);
    if (existsSync(ut)) { log(`${s.namn} redan mätt — hoppar`); continue; }
    while (memAvailable() < 450) {
      log(`RAM-vakt: ${Math.round(memAvailable())} MB < 450 — väntar 60 s`);
      await new Promise((r) => setTimeout(r, 60_000));
    }
    let chrome = null;
    try {
      const lhp = LH_KANDIDATER.find((k) => existsSync(join(k, "package.json")));
      if (!lhp) throw new Error("lighthouse-paket saknas i npx-cachen");
      // v13.5.0: main = core/index.js (v12 hade root-index.js — o119:s mönster)
      const inIngang = existsSync(join(lhp, "index.js")) ? join(lhp, "index.js") : join(lhp, "core/index.js");
      const { default: lighthouse } = await import(inIngang);
      // v13-npx-layout: chrome-launcher är SYSKON i cachen (lhp/node_modules/chrome-launcher),
      // inte under lighthouse/node_modules — prova båda.
      const clKandidater = [
        join(lhp, "node_modules", "chrome-launcher", "dist", "index.js"),
        join(lhp, "..", "chrome-launcher", "dist", "index.js"),
      ];
      const clSokvag = clKandidater.find((p) => existsSync(p));
      if (!clSokvag) throw new Error("chrome-launcher saknas i npx-cachen");
      const { launch } = await import(clSokvag);
      chrome = await launch({ chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] });
      const options = {
        port: chrome.port,
        output: "json",
        formFactor: "mobile",
        screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
        emulatedUserAgent: true,
        throttlingMethod: "simulate",
        throttling: {
          rttMs: 150, throughputKbps: 1638.4, requestLatencyMs: 562.5,
          downloadThroughputKbps: 1474.56, uploadThroughputKbps: 675, cpuSlowdownMultiplier: 4,
        },
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      };
      log(`Lighthouse ${s.sokvag} …`);
      const res = await lighthouse("http://localhost:3000" + s.sokvag, options);
      writeFileSync(ut, JSON.stringify(res.lhr, null, 0));
      const m = res.lhr.audits;
      log(`  klar: P${Math.round(res.lhr.categories.performance.score * 100)} LCP ${Math.round(m["largest-contentful-paint"].numericValue)} TBT ${Math.round(m["total-blocking-time"].numericValue)} CLS ${m["cumulative-layout-shift"].numericValue}`);
    } catch (e) {
      log(`FEL ${s.namn}: ${e.message}`);
      writeFileSync(ut.replace(/\.json$/, "-FEL.txt"), String(e.stack || e.message));
    } finally {
      if (chrome) { try { await chrome.kill(); } catch {} }
    }
  }
  log("mätningar klara — kör 'summera'");
}

/* ---------- läge: summera ---------- */
function summera() {
  console.log("\n=== LÄSBARHET (sond, 52px + zoom) ===");
  console.log("sida".padEnd(36), "FÖRE u52/zoom", "EFTER u52/zoom");
  if (existsSync(UTFIL_LAS)) {
    const d = JSON.parse(readFileSync(UTFIL_LAS, "utf8"));
    for (const s of d.sidor) {
      const nyckel = s.sokvag.slice(1);
      const f = FORE[nyckel] ?? ["?", "?"];
      console.log(s.sokvag.padEnd(36), String(f[0]).padStart(5) + "/" + String(f[1]).padEnd(6), String(s.tryckmalUnder52).padStart(5) + "/" + String(s.inputZoom).padEnd(6));
      const g = {};
      for (const v of s.ALLA ?? []) { const k = v.tag + "|" + (v.text || "").slice(0, 24) + "|" + v.w + "x" + v.h + " f" + v.font; g[k] = (g[k] || 0) + 1; }
      for (const [k, n] of Object.entries(g)) console.log("    kvar: " + n + "× " + k);
    }
  } else { console.log("(efter-fil saknas)"); }
  console.log("\n=== LIGHTHOUSE (mobil 4G, n=1) ===");
  for (const s of LH_SIDOR) {
    const p = join(UTFIL_LH, `${s.namn}-${NAMN}-n1.json`);
    if (!existsSync(p)) { console.log(`${s.namn}: (saknas)`); continue; }
    const lhr = JSON.parse(readFileSync(p, "utf8"));
    const a = lhr.audits;
    console.log(`${s.namn}: P${Math.round(lhr.categories.performance.score * 100)} LCP ${Math.round(a["largest-contentful-paint"].numericValue)} TBT ${Math.round(a["total-blocking-time"].numericValue)} CLS ${a["cumulative-layout-shift"].numericValue} FCP ${Math.round(a["first-contentful-paint"].numericValue)}`);
  }
}

if (LAGE === "vanta") await vanta();
else if (LAGE === "mata") await mata();
else summera();
