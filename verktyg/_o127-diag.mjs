#!/usr/bin/env node
// o127-diag: varför mäter Hälsa-pillen 44px trots max-md:min-w-[52px]? (engångsverktyg)
import { spawn } from "node:child_process";

const PORT = 9342;
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/ak1a-o127-diag2", "about:blank",
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
await SLEEP(4500);

const uttryck = `(() => {
  const el = [...document.querySelectorAll('a')].find((a) => a.textContent.trim() === 'Hälsa');
  if (!el) return { fel: 'Hälsa saknas' };
  const ut = {
    rect: el.getBoundingClientRect().width,
    computedMinW: getComputedStyle(el).minWidth,
    inlineStyle: el.getAttribute('style'),
    klass: (el.getAttribute('class') || ''),
    kaskad: [],
    antalRegler: 0,
  };
  for (const sh of document.styleSheets) {
    let regler; try { regler = sh.cssRules; } catch { continue; }
    for (const gr of regler) {
      const kolla = (rr) => {
        ut.antalRegler++;
        if (!rr.selectorText || !rr.style) return;
        if (rr.style.minWidth !== '') ut.minWReglerTotalt = (ut.minWReglerTotalt ?? 0) + 1;
        if (rr.selectorText.includes('52px')) ut.p52 = [...(ut.p52 ?? []), rr.selectorText.slice(0, 90)];
        if (!rr.style.minWidth === '') return;
        let traffar = false;
        try { traffar = el.matches(rr.selectorText); } catch { return; }
        if (traffar) {
          ut.kaskad.push({
            media: (gr.conditionText ?? gr.media?.mediaText ?? null),
            sel: rr.selectorText,
            minW: rr.style.minWidth,
            prio: rr.style.getPropertyPriority('min-width'),
          });
        }
      };
      if (gr.cssRules) { for (const rr of gr.cssRules) kolla(rr); } else kolla(gr);
    }
  }
  return ut;
})()`;
const r = await send("Runtime.evaluate", { expression: uttryck, returnByValue: true });
console.log(JSON.stringify(r.result.result.value, null, 1));
ws.close();
try { barn.kill(); } catch {}
