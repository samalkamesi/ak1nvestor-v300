#!/usr/bin/env node
// o127-diag7: SONDLÄGET (UA iPhone + 390px + cache-disable) — matchar max-md och vad blir computed? (engångsverktyg)
import { spawn } from "node:child_process";

const PORT = 9348;
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/ak1a-o127-diag8", "about:blank",
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
await send("Emulation.setUserAgentOverride", { userAgent: UA_IPHONE });
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Network.enable", {});
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Page.navigate", { url: "https://lab.ak1nvestor.com/dataset" });
await SLEEP(5000);

// djupgående kaskad: ALLA nivåer (layer → media → regel)
const t = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  const el = [...document.querySelectorAll('a')].find((a) => a.textContent.trim() === 'Hälsa');
  if (!el) return { fel: 'saknas' };
  const träffar = [];
  const ga = (nod, lag, media) => {
    for (const rr of nod.cssRules ?? []) {
      if (rr.cssRules) { ga(rr, lag, rr.media ? (rr.conditionText ?? String(rr.media)) : media); continue; }
      if (!rr.style || rr.style.minWidth === '') continue;
      let m = false; try { m = el.matches(rr.selectorText); } catch { continue; }
      if (m) träffar.push({ lag, media, sel: rr.selectorText, minW: rr.style.minWidth });
    }
  };
  for (const sh of document.styleSheets) {
    try { ga(sh, null, null); } catch {}
  }
  return {
    innerWidth: innerWidth,
    matcharMaxMd: matchMedia("not all and (min-width:48rem)").matches,
    rectW: Math.round(el.getBoundingClientRect().width * 10) / 10,
    computedMinW: getComputedStyle(el).minWidth,
    klassHar52: (el.getAttribute("class") || "").includes("max-md:min-w-[52px]"),
    minWKaskad: träffar,
  };
})()` });
console.log(JSON.stringify(t.result.result.value, null, 1));
ws.close();
try { barn.kill(); } catch {}
