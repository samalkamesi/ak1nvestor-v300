#!/usr/bin/env node
// o127-diag6: empirisk parsgräns — <style> med trunkerad fil (engångsverktyg)
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const css = readFileSync(".next/static/chunks/223m26d0ne5yb.css", "utf8");
const PORT = 9347;
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/ak1a-o127-diag7", "about:blank",
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
await send("Page.navigate", { url: "about:blank" });
await SLEEP(800);

for (const n of [198491, 198500, 199000, 210000, 254859]) {
  const t2 = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
    try {
      const st = document.createElement("style");
      st.textContent = ${JSON.stringify(css.slice(0, n))};
      document.head.appendChild(st);
      const s = st.sheet;
      const sok = "min-w-[" + "52px]";
      let har = false;
      for (const gr of s.cssRules) {
        if (gr.cssRules) { for (const rr of gr.cssRules) if ((rr.selectorText||"").includes(sok)) har = true; }
      }
      const antal = s.cssRules.length;
      st.remove();
      return { grans: ${n}, toppniva: antal, harMinw52: har };
    } catch (e) { return { fel: e.message }; }
})()` });
  console.log(JSON.stringify(t2.result.result.value));
}
ws.close();
try { barn.kill(); } catch {}
