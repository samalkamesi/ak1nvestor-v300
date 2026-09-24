#!/usr/bin/env node
// o127-diag4: isolerad parsning — dör Chrome 153 på "@media not all and" eller på filinnehållet? (engångsverktyg)
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const css = readFileSync(".next/static/chunks/223m26d0ne5yb.css", "utf8");
const PORT = 9345;
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/ak1a-o127-diag5", "about:blank",
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
await SLEEP(1000);

// Test A: minimal "not all and"-query på egen hand
const tA = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  const st = document.createElement("style");
  st.textContent = "@media not all and (min-width:48rem){.probe{min-width:52px}}";
  document.head.appendChild(st);
  const sheet = st.sheet;
  const el = document.createElement("div"); el.className = "probe"; document.body.appendChild(el);
  return { reglerISheet: sheet.cssRules.length,
    villkor: sheet.cssRules[0]?.conditionText ?? null,
    computed: getComputedStyle(el).minWidth,
    mediaMatchar: matchMedia("not all and (min-width:48rem)").matches };
})()` });
console.log("TEST A (minimal not-all-and):", JSON.stringify(tA.result.result.value));

// Test B: hela produktionsfilen inlagd som <style>
const tB = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  const st = document.createElement("style");
  st.textContent = ${JSON.stringify(css)};
  document.head.appendChild(st);
  const sheet = st.sheet;
  let mediaBlock = 0, totalt = 0, hittad = null;
  const sok = "min-w-[" + "52px]";
  for (const gr of sheet.cssRules) {
    totalt++;
    if (gr.media) { mediaBlock++; for (const rr of gr.cssRules) { if (rr.selectorText && rr.selectorText.includes(sok)) hittad = rr.selectorText; } }
  }
  return { toppnivaRegler: sheet.cssRules.length, mediaBlock, totaltNiva1, hittadMinw52: hittad, totalt };
})()` });
console.log("TEST B (hela filen som style):", JSON.stringify(tB.result.result.value));
ws.close();
try { barn.kill(); } catch {}
