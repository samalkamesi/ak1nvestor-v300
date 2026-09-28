#!/usr/bin/env node
/**
 * AK1A prestandamätning — spår 7 (v96-mönstret).
 *
 * Mäter publika sidor i headless Chrome via CDP (samma protokoll som
 * Lighthouse): mobilvy 390×844, kall cache, riktiga nätverkstider mot
 * lokalanknytad prod (localhost:3000 — loopback är whitelistad i
 * middleware). Inga npm-paket: node >=22 global WebSocket.
 *
 * Insamlat per sida: FCP, LCP, DOMContentLoaded, load, antal DOM-noder,
 * resursräkning samt full nätverkslista (URL, typ, överförda byte, tid)
 * med topp-lista. Två iterationer per sida — brus på en lastad server
 * är verkligt, medianen i rapporten är sanningen.
 *
 * Användning:
 *   node verktyg/prestanda-mat.mjs [bas-url] [utfil.json] [iterationer]
 *   node verktyg/prestanda-mat.mjs http://localhost:3000 /tmp/fore.json 2
 */

import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromeSokvag } from "./chrome-sokvag.mjs";

const BAS = process.argv[2] || "http://localhost:3000";
const UTFIL = process.argv[3] || "/tmp/ak1a-prestanda.json";
const ITERATIONER = Number(process.argv[4] || 2);
const PORT = 9333;
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

// Kärnbeteenden enligt spår 7: startsida + de tre tunga innehållsträden.
const SIDER = ["/", "/kurser", "/blogg", "/analyser", "/bibliotek"];

async function waitForJson(url, tentatives = 40) {
  for (let i = 0; i < tentatives; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch {}
    await SLEEP(250);
  }
  throw new Error(` når inte ${url}`);
}

function cdp(ws) {
  let id = 0;
  const vantar = new Map();
  const lyssnare = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && vantar.has(msg.id)) {
      const { resolve, reject } = vantar.get(msg.id);
      vantar.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      for (const l of lyssnare) l(msg);
    }
  };
  const oppen = new Promise((res, rej) => {
    ws.onopen = () => res();
    ws.onerror = (e) => rej(new Error("websocket: " + e.message));
  });
  return {
    oppen,
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const mid = ++id;
        vantar.set(mid, { resolve, reject });
        ws.send(JSON.stringify({ id: mid, method, params }));
      }),
    on: (fn) => lyssnare.push(fn),
    stang: () => ws.close(),
  };
}

async function matSida(conn, url) {
  const nett = new Map(); // requestId -> {url, typ, byte, ms, start}
  let loadOk = null;

  const hantera = (msg) => {
    const { method, params } = msg;
    if (method === "Network.requestWillBeSent") {
      nett.set(params.requestId, {
        url: params.request.url,
        typ: params.type || "other",
        byte: 0,
        start: params.timestamp,
      });
    } else if (method === "Network.loadingFinished") {
      const r = nett.get(params.requestId);
      if (r) {
        r.byte = params.encodedDataLength || 0;
        r.ms = Math.round((params.timestamp - r.start) * 1000);
      }
    } else if (method === "Network.loadingFailed") {
      nett.delete(params.requestId);
    } else if (method === "Page.loadEventFired") {
      loadOk = true;
    }
  };
  conn.on(hantera);

  await conn.send("Network.enable");
  await conn.send("Page.enable");
  await conn.send("Runtime.enable");
  await conn.send("Network.setCacheDisabled", { cacheDisabled: true });
  await conn.send("Network.setBypassServiceWorker", { bypass: true });
  await conn.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await conn.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 5,
  });

  const start = Date.now();
  await conn.send("Page.navigate", { url });
  const deadline = Date.now() + 30000;
  while (!loadOk && Date.now() < deadline) await SLEEP(100);
  // Efter-mode: låt LCP måla klart och senaste resurserna landa
  await SLEEP(4000);

  const metrikkExpr = `(() => {
    const paint = performance.getEntriesByType('paint');
    const lcp = performance.getEntriesByType('largest-contentful-paint');
    const nav = performance.getEntriesByType('navigation')[0];
    return JSON.stringify({
      fcp: Math.round(paint.find(p => p.name === 'first-contentful-paint')?.startTime ?? -1),
      lcp: Math.round(lcp.length ? lcp[lcp.length - 1].startTime : -1),
      dcl: Math.round(nav?.domContentLoadedEventEnd ?? -1),
      load: Math.round(nav?.loadEventEnd ?? -1),
      domNoder: document.getElementsByTagName('*').length,
      resurser: performance.getEntriesByType('resource').length,
    });
  })()`;
  const { result } = await conn.send("Runtime.evaluate", {
    expression: metrikkExpr,
    returnByValue: true,
  });
  const m = JSON.parse(result.value);

  const poster = [...nett.values()].filter((r) => r.byte > 0);
  const sum = (pred) => poster.filter(pred).reduce((a, r) => a + r.byte, 0);
  const resp = {
    url,
    ...m,
    vaggtidMs: Date.now() - start,
    andorda: poster.length,
    byteTotal: sum(() => true),
    byteJs: sum((r) => r.typ === "Script"),
    byteCss: sum((r) => r.typ === "Stylesheet"),
    byteImg: sum((r) => r.typ === "Image"),
    byteFont: sum((r) => r.typ === "Font"),
    byteDoc: sum((r) => r.typ === "Document"),
    topp: poster
      .sort((a, b) => b.byte - a.byte)
      .slice(0, 10)
      .map((r) => ({ url: r.url.slice(0, 110), typ: r.typ, kB: Math.round(r.byte / 1024), ms: r.ms })),
  };
  return resp;
}

async function main() {
  const profil = mkdtempSync(join(tmpdir(), "ak1a-lh-"));
  // r304: hårdkodad /usr/bin/google-chrome dog med Contabo-servern —
  // upptäckt via chrome-sokvag.mjs (env → puppeteer-cache → system)
  const chromeBin = chromeSokvag();
  if (!chromeBin) {
    console.error("PRESTANDA-MAT: ingen Chrome hittad (AK1A_CHROME/CHROME_PATH/puppeteer-cache/system)");
    process.exit(2);
  }
  console.error(`chrome-binär: ${chromeBin}`);
  const chrome = spawn(
    chromeBin,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--mute-audio",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profil}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );
  console.error(`chrome pid ${chrome.pid}, väntar på CDP ...`);

  try {
    const version = await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
    console.error(`chrome ${version.Browser}`);

    // Ny sida-target per körning (PUT krävs av nyare Chrome)
    const nySida = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
    const ws = new WebSocket(nySida.webSocketDebuggerUrl);
    const conn = cdp(ws);
    await conn.oppen;

    const resultat = [];
    for (let it = 1; it <= ITERATIONER; it++) {
      for (const sida of SIDER) {
        const r = await matSida(conn, BAS + sida);
        r.iteration = it;
        resultat.push(r);
        console.error(
          `it${it} ${sida}: FCP ${r.fcp} LCP ${r.lcp} load ${r.load} · ${(r.byteTotal / 1024).toFixed(0)} kB / ${r.andorda} andorda`
        );
      }
    }

    const ut = {
      genererad: new Date().toISOString(),
      bas: BAS,
      verktyg: "verktyg/prestanda-mat.mjs (CDP, mobil 390x844, kall cache, SW bypassad)",
      iterationer: ITERATIONER,
      sidor: resultat,
    };
    writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
    console.error(`skrev ${UTFIL}`);
    try {
      await fetch(`http://127.0.0.1:${PORT}/json/close/${nySida.id}`);
    } catch {}
  } finally {
    // Säker nedstängning även vid fel
    setTimeout(() => {
      try {
        chrome.kill("SIGKILL");
      } catch {}
    }, 1500);
  }
  console.error("klart");
  process.exit(0);
}

main().catch((e) => {
  console.error("FEL:", e.message);
  process.exit(1);
});
