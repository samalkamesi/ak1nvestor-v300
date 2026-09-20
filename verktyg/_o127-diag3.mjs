#!/usr/bin/env node
// o127-diag3: fick Chrome hela CSS-filen? ResourceTiming + CSSOM-djup (engångsverktyg)
import { spawn } from "node:child_process";

const PORT = 9344;
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/ak1a-o127-diag4", "about:blank",
], { stdio: "ignore" });
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 40; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json`);
    if (r.ok) {
      const m = (await r.json()).filter((t) => t.type === "page");
      if (m.length) { wsUrl = m[0].webSocketDebuggerUrl; break; }
    }
  } catch {}
  await SLEEP(250);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0;
const v = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && v.has(m.id)) { v.get(m.id)(m); v.delete(m.id); }
};
const send = (metod, params = {}) => new Promise((r) => {
  const i = ++id; v.set(i, r); ws.send(JSON.stringify({ id: i, method: metod, params }));
});
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Network.enable", {});
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Page.navigate", { url: "https://lab.ak1nvestor.com/dataset" });
await SLEEP(5000);
const r = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  const resurser = performance.getEntriesByType("resource")
    .filter((e) => e.name.endsWith(".css"))
    .map((e) => ({ fil: e.name.split("/").pop(), transferSize: e.transferSize,
      encodedBodySize: e.encodedBodySize, decodedBodySize: e.decodedBodySize }));
  const sheets = [...document.styleSheets].map((s) => ({
    fil: (s.href || "inline").split("/").pop(),
    regler: (() => { try { return s.cssRules.length; } catch { return "CORS"; } })(),
  }));
  return { resurser, sheets };
})()` });
console.log(JSON.stringify(r.result.result.value, null, 1));
ws.close();
try { barn.kill(); } catch {}
