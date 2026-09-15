#!/usr/bin/env node
/**
 * AK1A — SKIFTSPÅRAREN (spår 7) — hittar CLS-källor på riktigt.
 *
 * Startar headless-Chrome med CDP, registrerar PerformanceObserver
 * ('layout-shift') I SIDAN med attributions (källelement + rektanglar
 * + tidpunkt) och skriver ut varje skift. Noll beroenden (node ≥22:
 * inbyggd WebSocket).
 *
 *   node verktyg/prestanda-skiftspar.mjs [url] [millisekunder]
 *   node verktyg/prestanda-skiftspar.mjs http://localhost:3000/ 15000
 */
import { spawn } from "node:child_process";
import { setTimeout as sov } from "node:timers/promises";

const URL = process.argv[2] || "http://localhost:3000/";
const MS = Number(process.argv[3] || 15000);
const PORT = 9333;

const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/ak1a-skiftprofil",
  "about:blank",
], { stdio: "ignore" });

await sov(1500);
const listor = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const sid = listor.find((s) => s.type === "page");
const ws = new WebSocket(sid.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });

let id = 0;
const svar = {};
const skicka = (metod, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    svar[i] = r;
    ws.send(JSON.stringify({ id: i, method: metod, params }));
  });

ws.onmessage = (h) => {
  const m = JSON.parse(h.data);
  if (m.id && svar[m.id]) { svar[m.id](m.result); delete svar[m.id]; }
};

const OBSERVATOR = `
window.__skift = [];
new PerformanceObserver((l) => {
  for (const e of l.getEntries()) {
    if (!e.hadRecentInput) {
      window.__skift.push({
        t: Math.round(e.startTime), score: +e.value.toFixed(5),
        kallor: e.sources.map((s) => ({
          nod: s.node ? (s.node.snippet || s.node.nodeName || "?").toString().slice(0, 140) : "(borttagen)",
          fran: s.previousRect ? [s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height] : null,
          till: s.currentRect ? [s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height] : null,
        })),
      });
    }
  }
}).observe({ type: "layout-shift", buffered: true });
"kopplad";
`;

await skicka("Runtime.enable");
await skicka("Page.enable");
// Lighthouse-lik miljö: mobil-viewport + 4× CPU + slow 4G (som trace-motorn).
// Moto G Power-geometri (samma som Lighthouse mobile): 412×823, dpr 1.75.
await skicka("Emulation.setDeviceMetricsOverride", {
  width: 412, height: 823, deviceScaleFactor: 1.75, mobile: true,
});
await skicka("Emulation.setCPUThrottlingRate", { rate: 4 });
await skicka("Network.enable");
await skicka("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});
await skicka("Page.navigate", { url: URL });
await sov(2500);
await skicka("Runtime.evaluate", { expression: OBSERVATOR });
await sov(MS);
const { result } = await skicka("Runtime.evaluate", {
  expression: "JSON.stringify(window.__skift || [])", returnByValue: true,
});
const skift = JSON.parse(result.value);

console.log(`# Skift på ${URL} under ${MS} ms — ${skift.length} skift`);
let sum = 0;
for (const s of skift) {
  sum += s.score;
  console.log(`\n· t=${s.t} ms  score=${s.score}`);
  for (const k of s.kallor.slice(0, 5)) {
    console.log(`   ${k.nod}`);
    if (k.fran && k.till) {
      console.log(`     y ${Math.round(k.fran[1])}→${Math.round(k.till[1])}  h ${Math.round(k.fran[3])}→${Math.round(k.till[3])}`);
    }
  }
}
console.log(`\nCLS-summa (hadRecentInput=false): ${sum.toFixed(5)}`);
chrome.kill();
process.exit(0);
