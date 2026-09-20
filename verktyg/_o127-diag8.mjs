#!/usr/bin/env node
// o127-diag8: (a) CSSOM max-md-inventering på alla djup, (b) minimal probe på sidan (engångsverktyg)
import { spawn } from "node:child_process";

const PORT = 9349;
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/ak1a-o127-diag9", "about:blank",
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

const t = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  // (a) inventera max-md-regler på ALLA djup
  const MaxMd = { antal: 0, exempel: [], mediaVillkor: new Set() };
  const ga = (nod, media) => {
    for (const rr of nod.cssRules ?? []) {
      if (rr.cssRules) { ga(rr, rr.media ? (rr.conditionText ?? String(rr.media)) : media); continue; }
      if ((rr.selectorText || "").includes("max-md")) {
        MaxMd.antal++;
        if (MaxMd.exempel.length < 4) MaxMd.exempel.push(rr.selectorText.slice(0, 60));
        if (media) MaxMd.mediaVillkor.add(media);
      }
    }
  };
  for (const sh of document.styleSheets) { try { ga(sh, null); } catch {} }
  // (b) minimal probe — samma mediaform som prod-filen
  const st = document.createElement("style");
  st.textContent = "@media not all and (min-width:48rem){.o127probe{min-width:52px}}";
  document.head.appendChild(st);
  const d = document.createElement("div");
  d.className = "o127probe"; document.body.appendChild(d);
  const probeComputed = getComputedStyle(d).minWidth;
  // (c) Hälsa-pillen igen som kontroll
  const el = [...document.querySelectorAll('a')].find((a) => a.textContent.trim() === 'Hälsa');
  return {
    maxMdAntal: MaxMd.antal,
    maxMdExempel: MaxMd.exempel,
    maxMdMediaVillkor: [...MaxMd.mediaVillkor],
    probeComputed,
    halsoComputed: el ? getComputedStyle(el).minWidth : "saknas",
  };
})()` });
console.log(JSON.stringify(t.result.result.value, null, 1));
ws.close();
try { barn.kill(); } catch {}
