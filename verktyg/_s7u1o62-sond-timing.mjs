#!/usr/bin/env node
// s7-u1 o62-sond (timing): mät sektorradens höjd vid 4,5 s (verktygets
// väntetid) och vid 10 s (settlat) — UTAN omnavigering emellan. Avgör om
// verktygets 44 px är ett mätögonblick eller ett verkligt läge.
import { spawn } from "node:child_process";

const PORT = 9342;
const UA_IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/o62timing", "about:blank",
], { stdio: "ignore" });
await SLEEP(2500);
const listar = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const ws = new WebSocket(listar.find((s) => s.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let seq = 0;
function send(metod, parametrar) {
  return new Promise((res) => {
    const id = ++seq;
    const lyssnare = (m) => {
      const d = JSON.parse(m.data);
      if (d.id === id) { ws.removeEventListener("message", lyssnare); res(d.result ?? d); }
    };
    ws.addEventListener("message", lyssnare);
    ws.send(JSON.stringify({ id, method: metod, params: parametrar }));
  });
}

await send("Emulation.setUserAgentOverride", { userAgent: UA_IPHONE });
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Page.navigate", { url: "about:blank" });
await SLEEP(1000); // verktygets renderer-byte-mellanlandning
await send("Page.navigate", { url: "http://localhost:3000/portfolj-forskning" });

const MAT = `(() => {
  const ut = {};
  const plocka = (pref) => {
    const rader = [...document.querySelectorAll("button, a")].filter(el => /bolag · snitt|Till korstabellen|Forska fram|AKM2|Startsidan/.test(el.textContent));
    ut[pref] = rader.slice(0, 16).map(el => {
      const r = el.getBoundingClientRect();
      return { t: el.textContent.trim().replace(/\\s+/g, " ").slice(0, 30), h: Math.round(r.height), w: Math.round(r.width) };
    });
  };
  plocka(document.readyState);
  return ut;
})()`;

for (const [etikett, vant] of [["@4,5s", 4500], ["@10s", 10000]]) {
  await SLEEP(vant === 4500 ? 4500 : 5500);
  const svar = await send("Runtime.evaluate", { expression: MAT, returnByValue: true });
  const val = svar.result?.value ?? {};
  console.log(`=== ${etikett} (readyState-mätning: ${Object.keys(val)[0]}) ===`);
  for (const r of Object.values(val)[0] ?? []) console.log(`  ${r.h}x${r.w}  ${r.t}`);
}
chrome.kill();
process.exit(0);
