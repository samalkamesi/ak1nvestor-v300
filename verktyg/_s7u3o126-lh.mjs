#!/usr/bin/env node
/**
 * o126 Lighthouse n=1 /dataset (s7-u3): CLS-kriteriet efter pill-breddskuren —
 * o123:s exakta mobil-4G-konfig (formFactor mobile, simulated throttling).
 * Mot loopback (doktrinen; middleware whitelist).
 *
 * node verktyg/_s7u3o126-lh.mjs
 * Utdata: data/forskning/OPTIMERING/lighthouse/dataset-s7u3o126-efter-n1.json
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROT = "/home/ak1a/AK1";
const UTFIL = join(ROT, "data/forskning/OPTIMERING/lighthouse/dataset-s7u3o126-efter-n1.json");
const NAMN = "dataset-s7u3o126-efter";
const LH_KANDIDATER = ["/home/ak1a/.npm/_npx/0f94ee7615faf582/node_modules/lighthouse"];
const log = (m) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

function memAvailable() {
  return Math.round(Number(readFileSync("/proc/meminfo", "utf8").match(/MemAvailable:\s+(\d+)/)[1]) / 1024);
}

while (memAvailable() < 450) {
  log(`RAM-vakt: ${memAvailable()} MB < 450 — väntar 60 s`);
  await new Promise((r) => setTimeout(r, 60_000));
}

let chrome = null;
try {
  const lhp = LH_KANDIDATER.find((k) => existsSync(join(k, "package.json")));
  if (!lhp) throw new Error("lighthouse-paket saknas i npx-cachen");
  const inIngang = existsSync(join(lhp, "index.js")) ? join(lhp, "index.js") : join(lhp, "core/index.js");
  const { default: lighthouse } = await import(inIngang);
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
  log("Lighthouse /dataset (loopback) …");
  const res = await lighthouse("http://localhost:3000/dataset", options);
  writeFileSync(UTFIL, JSON.stringify(res.lhr, null, 0));
  const m = res.lhr.audits;
  log(`klar: P${Math.round(res.lhr.categories.performance.score * 100)} LCP ${Math.round(m["largest-contentful-paint"].numericValue)} TBT ${Math.round(m["total-blocking-time"].numericValue)} CLS ${m["cumulative-layout-shift"].numericValue}`);
} catch (e) {
  log(`FEL: ${e.message}`);
  writeFileSync(UTFIL.replace(/\.json$/, "-FEL.txt"), String(e.stack || e.message));
  try { if (chrome) await chrome.kill(); } catch {}
  process.exit(1);
}
try { await chrome.kill(); } catch {}
log(`Skriven: ${UTFIL}`);
