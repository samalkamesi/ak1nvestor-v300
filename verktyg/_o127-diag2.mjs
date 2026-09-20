#!/usr/bin/env node
// o127-diag2: var finns max-md:min-w-[52px] — filtext vs CSSOM-blockstruktur? (engångsverktyg)
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

// A) FILTEXTEN: i vilket @media-sammanhang ligger max-md-minw-regeln?
const css = readFileSync(".next/static/chunks/223m26d0ne5yb.css", "utf8");
const nal = "max-md\\:min-w-\\[52px\\]";
const i = css.indexOf(nal);
console.log("filtext: träffindex", i);
if (i >= 0) {
  // backa till närmaste blockstart före träffen
  const fore = css.slice(0, i);
  const sistaMedia = fore.lastIndexOf("@media");
  const sistaBlockStang = fore.lastIndexOf("}");
  console.log("sista @media öppnades på index", sistaMedia, "— sista } på", sistaBlockStang,
    "→ regeln ligger", sistaMedia > sistaBlockStang ? "INUTI @media-block" : "PÅ TOPPNIVÅ");
  if (sistaMedia > sistaBlockStang) {
    console.log("media-villkor:", JSON.stringify(css.slice(sistaMedia, css.indexOf("{", sistaMedia))));
  }
}

// B) CSSOM: vilka @media-block finns och innehåller något av dem max-md-minw?
const PORT = 9343;
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/ak1a-o127-diag3", "about:blank",
], { stdio: "ignore" });
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i2 = 0; i2 < 40; i2++) {
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
  const i3 = ++id; v.set(i3, r); ws.send(JSON.stringify({ id: i3, method: metod, params }));
});
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Network.enable", {});
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Page.navigate", { url: "https://lab.ak1nvestor.com/dataset" });
await SLEEP(4500);
const r = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  const media = [];
  const sok = "min-w-[" + "52px]";
  for (const sh of document.styleSheets) {
    let regler; try { regler = sh.cssRules; } catch { continue; }
    for (const gr of regler) {
      if (gr.cssRules && gr.media) {
        const barnAntal = gr.cssRules.length;
        const harMinw52 = [...gr.cssRules].some((rr) => rr.selectorText && rr.selectorText.includes(sok));
        media.push({ villkor: gr.conditionText, barnAntal, harMinw52 });
      }
    }
  }
  return { ua: navigator.userAgent, mediaBlock: media.filter((m) => m.villkor.includes("48rem") || m.harMinw52) };
})()` });
console.log(JSON.stringify(r.result.result.value, null, 1));
ws.close();
try { barn.kill(); } catch {}
