/**
 * s7-u2 byggare 2/3 (manifest auto-s7-1789915506445) — o119 EFTER-mätning.
 * Vakarövertag av s7-u1:s EFTER-kriterier (o119 §5) efter att denna agent
 * frigjort RAM (läckta 16:45-barn, ~1,1 GB) så prod-synken kunde bygga.
 *
 * Lägen (etapper, håller varje anrop under skalens tidsgräns):
 *   vanta  — polla BUILD_ID tills den lämnar IxcwwO (max 11 min), därefter
 *            prod 200 ×5 (https) + strukturkoll (chunkar + SSR-HTML) →
 *            skriver struktur-JSON och returnerar.
 *   mata   — Lighthouse n=2 × 3 sidor, sekvensiellt, färsk chrome-profil
 *            per sida (o118 §2: kvarboende SW förvränger nätverket),
 *            RAM-vakt ≥450 MB före varje chrome-start, finally-kill.
 *   summera — sammanställ allt mot FÖRE-tabellen (o119 §2) + kriterier.
 *
 * Utdata: data/forskning/OPTIMERING/lighthouse/*-s7u2o119-efter*.json
 * Konfigparitet med FÖRE: mobile · simulate · mobileSlow4G · 412×823@1,75
 * (utläst ur en_blogg-s7u1o119-fore.json configSettings).
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROT = "/home/ak1a/AK1";
const UTFILKAT = join(ROT, "data/forskning/OPTIMERING/lighthouse");
const GAMMAL_BUILDID = "IxcwwO_QWK5g7r0rfK5_M";
const BAS = "http://localhost:3000";
const PROD = "https://lab.ak1nvestor.com";
const NAMN = "s7u2o119-efter";
const LH_KANDIDATER = [
  "/home/ak1a/.npm/_npx/0f94ee7615faf582/node_modules/lighthouse",
];
const WIDGET_STRANGAR = [
  "Håll streaken levande",
  "Fortsätt läroplanen",
  "Testa hela analysflödet",
  "Räkna på ett nytt case",
  "Djupdyk i dina innehav",
];
// nmax enligt o121-anspråkets plan (u4): n=2 en (kriteriets primära), n=1 ar/sv
const SIDOR = [
  { namn: "en_blogg", sokvag: "/en/blogg", nmax: 2 },
  { namn: "ar_blogg", sokvag: "/ar/blogg", nmax: 1 },
  { namn: "blogg", sokvag: "/blogg", nmax: 1 },
];
const PROD_SIDOR = ["/", "/blogg", "/en/blogg", "/ar/blogg", "/en"];
// o119 §2 FÖRE-tabell (BUILD_ID IxcwwO, 2026-09-20 16:53 lokal)
const FORE = {
  en_blogg: { poang: 67, FCP: 1253, LCP: 4059, TBT: 876, CLS: 0, TTI: 4348, SI: 1567 },
  ar_blogg: { poang: 66, LCP: 4561, TBT: 737, CLS: 0 },
  blogg: { poang: 75, LCP: 4232, TBT: 348, CLS: 0 },
};
const FORE_INITIALREF = { en_blogg: 12, ar_blogg: 12, blogg: 13 }; // 10f47l5mmeoxy.js i SSR-HTML

const LAGE = process.argv[2] || "summera";
const log = (m) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

function memAvailable() {
  return Number(readFileSync("/proc/meminfo", "utf8").match(/MemAvailable:\s+(\d+)/)[1]) / 1024;
}

function buildId() {
  try { return readFileSync(join(ROT, ".next/BUILD_ID"), "utf8").trim(); }
  catch { return "(saknas)"; }
}

function hittaLighthouse() {
  for (const k of LH_KANDIDATER) if (existsSync(join(k, "package.json"))) return k;
  throw new Error("lighthouse-paket saknas i npx-cachen");
}

function skraj(namn) { return JSON.stringify(namn).slice(1, -1); }

/* ---------- läge: vanta (deploy + prod 200 + struktur) ---------- */
async function vanta() {
  const start = Date.now();
  log(`BUILD_ID nu: ${buildId()}`);
  while (buildId() === GAMMAL_BUILDID && Date.now() - start < 13 * 60_000) {
    await new Promise((r) => setTimeout(r, 20_000));
    log(`poll (RAM ${Math.round(memAvailable())} MB): ${buildId()}`);
  }
  const nyBuildId = buildId();
  if (nyBuildId === GAMMAL_BUILDID) {
    writeFileSync(join(UTFILKAT, `${NAMN}-struktur.json`), JSON.stringify({
      status: "VANTAR-FORTFARANDE", buildId: nyBuildId, ts: Date.now(),
    }, null, 2));
    log(" bygget har EJ landat inom 13 min — läge vanta avslutar");
    process.exit(2);
  }
  log(`NY BUILD_ID: ${nyBuildId}`);

  // prod 200 ×5 (https) + loopback-kontroll
  const prodStatus = {};
  for (const s of PROD_SIDOR) {
    try {
      const r = await fetch(PROD + s, { redirect: "manual" });
      prodStatus[s] = r.status;
    } catch (e) { prodStatus[s] = "FEL: " + e.message; }
  }
  log("prod-status: " + JSON.stringify(prodStatus));

  // strukturkoll: vilka chunkar bär widgetens strängar?
  const chunkkat = join(ROT, ".next/static/chunks");
  const bärare = [];
  for (const f of readdirSync(chunkkat)) {
    if (!f.endsWith(".js")) continue;
    const sokvag = join(chunkkat, f);
    const text = readFileSync(sokvag, "utf8");
    const traff = WIDGET_STRANGAR.filter((s) => text.includes(s));
    if (traff.length > 0) {
      bärare.push({ chunk: f, byte: statSync(sokvag).size, strargar: traff.length });
    }
  }
  log("widget-bärande chunkar: " + JSON.stringify(bärare));

  // SSR-HTML per sida: widget-chunkens initiala referenser + sträng-frånvaro
  const sidinfo = {};
  for (const s of SIDOR) {
    try {
      const r = await fetch(BAS + s.sokvag);
      const html = await r.text();
      const refs = {};
      for (const b of bärare) refs[b.chunk] = (html.match(new RegExp(skraj(b.chunk), "g")) || []).length;
      sidinfo[s.namn] = {
        status: r.status,
        bytes: Buffer.byteLength(html),
        sha256: createHash("sha256").update(html).digest("hex").slice(0, 16),
        widgetRefser: refs,
        strargarIHtml: WIDGET_STRANGAR.filter((str) => html.includes(str)).length,
      };
      log(`${s.sokvag}: ${r.status}, widget-chunk-refser=${JSON.stringify(refs)}, strängar-i-html=${sidinfo[s.namn].strargarIHtml}`);
    } catch (e) { sidinfo[s.namn] = { fel: e.message }; }
  }

  writeFileSync(join(UTFILKAT, `${NAMN}-struktur.json`), JSON.stringify({
    status: "OK", buildId: nyBuildId, ts: Date.now(), prodStatus, bärare, sidinfo,
    foreInitialref: FORE_INITIALREF,
  }, null, 2));
  log(`struktur-JSON skriven; gamla klump-chunken 10f47l5mmeoxy.js finns kvar som fil: ${existsSync(join(chunkkat, "10f47l5mmeoxy.js"))}`);
}

/* ---------- läge: mata (Lighthouse n=2 × 3 sidor) ---------- */
async function mata() {
  const lhp = hittaLighthouse();
  const { default: lighthouse } = await import(join(lhp, "index.js"));
  const { launch } = await import(join(lhp, "node_modules", "chrome-launcher", "dist", "index.js"));
  const options = (url, port) => ({
    port,
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
  });

  for (const s of SIDOR) {
    for (let n = 1; n <= (s.nmax || 2); n++) {
      const ut = join(UTFILKAT, `${s.namn}-${NAMN}-n${n}.json`);
      if (existsSync(ut)) { log(`${s.namn} n${n} redan mätt — hoppar`); continue; }
      while (memAvailable() < 450) {
        log(`RAM-vakt: ${Math.round(memAvailable())} MB < 450 — väntar 15 s`);
        await new Promise((r) => setTimeout(r, 15_000));
      }
      const dir = `/tmp/sond-profile-o119-${Date.now()}`;
      let chrome;
      try {
        chrome = await launch({
          chromePath: "/usr/bin/google-chrome",
          chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", `--user-data-dir=${dir}`],
        });
        log(`mäter ${s.sokvag} n${n} (chrome pid ${chrome.pid}, RAM ${Math.round(memAvailable())} MB)`);
        const r = await lighthouse(BAS + s.sokvag, options(BAS + s.sokvag, chrome.port));
        writeFileSync(ut, JSON.stringify(r.lhr, null, 0));
        const m = r.lhr.audits;
        log(`  klar: P${Math.round(r.lhr.categories.performance.score * 100)} LCP ${Math.round(m["largest-contentful-paint"].numericValue)} TBT ${Math.round(m["total-blocking-time"].numericValue)} CLS ${m["cumulative-layout-shift"].numericValue}`);
      } catch (e) {
        log(`  FEL ${s.namn} n${n}: ${e.message}`);
        writeFileSync(ut.replace(/\.json$/, "-FEL.txt"), String(e.stack || e.message));
      } finally {
        if (chrome) { try { await chrome.kill(); } catch {} }
      }
    }
  }
  log("mätningar klara");
}

/* ---------- läge: summera ---------- */
function lasMatt(namn, n) {
  const p = join(UTFILKAT, `${namn}-${NAMN}-n${n}.json`);
  if (!existsSync(p)) return null;
  const lhr = JSON.parse(readFileSync(p, "utf8"));
  const a = lhr.audits;
  return {
    poang: Math.round(lhr.categories.performance.score * 100),
    FCP: Math.round(a["first-contentful-paint"].numericValue),
    LCP: Math.round(a["largest-contentful-paint"].numericValue),
    TBT: Math.round(a["total-blocking-time"].numericValue),
    CLS: a["cumulative-layout-shift"].numericValue,
    TTI: Math.round(a["interactive"].numericValue),
    SI: Math.round(a["speed-index"].numericValue),
    tidsstampel: lhr.fetchTime,
  };
}

function summera() {
  const struktur = existsSync(join(UTFILKAT, `${NAMN}-struktur.json`))
    ? JSON.parse(readFileSync(join(UTFILKAT, `${NAMN}-struktur.json`), "utf8"))
    : { status: "SAKNAS" };
  const sidor = {};
  for (const s of SIDOR) {
    const n1 = lasMatt(s.namn, 1), n2 = lasMatt(s.namn, 2);
    const ms = [n1, n2].filter(Boolean);
    if (!ms.length) { sidor[s.namn] = { status: "SAKNAS" }; continue; }
    const med = (k) => Math.round(ms.reduce((t, m) => t + m[k], 0) / ms.length);
    sidor[s.namn] = {
      n: ms.length, poang: med("poang"), FCP: med("FCP"), LCP: med("LCP"),
      TBT: med("TBT"), CLS: ms.every((m) => m.CLS === 0) ? 0 : Math.max(...ms.map((m) => m.CLS)),
      TTI: med("TTI"), SI: med("SI"), las: { n1, n2 },
      fore: FORE[s.namn] || null,
      TBT_forandring: FORE[s.namn] ? Math.round((med("TBT") / FORE[s.namn].TBT - 1) * 100) : null,
    };
  }
  const ut = {
    namn: NAMN, ts: Date.now(), buildId: buildId(), struktur, sidor,
    kriterier: {
      deploy: struktur.buildId && struktur.buildId !== GAMMAL_BUILDID,
      prod200x5: struktur.prodStatus && Object.values(struktur.prodStatus).every((v) => v === 200),
      struktur: null, // fylls i protokollet utifrån bärare/sidinfo
    },
  };
  const bärare = struktur.bärare || [];
  const sidinfo = struktur.sidinfo || {};
  const widgetUrInitial = SIDOR.every((s) => {
    const refs = sidinfo[s.namn]?.widgetRefser || {};
    return Object.values(refs).every((v) => v === 0);
  });
  ut.kriterier.struktur = bärare.length > 0 && widgetUrInitial;
  writeFileSync(join(UTFILKAT, `${NAMN}-sammanfattning.json`), JSON.stringify(ut, null, 2));
  for (const s of SIDOR) {
    const d = sidor[s.namn];
    if (d?.poang === undefined) continue;
    const f = FORE[s.namn];
    log(`${s.namn}: P${d.poang} LCP ${d.LCP} TBT ${d.TBT} CLS ${d.CLS}  (FÖRE P${f.poang} LCP ${f.LCP} TBT ${f.TBT})  TBT ${d.TBT > f.TBT ? "+" : ""}${d.TBT - f.TBT} ms`);
  }
  log("kriterier: " + JSON.stringify(ut.kriterier));
}

if (LAGE === "vanta") await vanta();
else if (LAGE === "mata") await mata();
else summera();
