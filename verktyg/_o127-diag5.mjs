#!/usr/bin/env node
// o127-diag5: media-query-matris i headless-Chrome — vilka former matchar vid 390px? (engångsverktyg)
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const css = readFileSync(".next/static/chunks/223m26d0ne5yb.css", "utf8");
const PORT = 9346;
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/ak1a-o127-diag6", "about:blank",
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

const t = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  const q = (s) => { try { return matchMedia(s).matches; } catch (e) { return "FEL:" + e.name; } };
  return {
    innerWidth: innerWidth,
    minW48rem: q("(min-width:48rem)"),
    maxW48rem: q("(max-width:47.999rem)"),
    notAllAnd: q("not all and (min-width:48rem)"),
    notAll: q("not all"),
    parenNot: q("(not (min-width:48rem))"),
    max640: q("(max-width:640px)"),
    widthLt768: q("(width < 48rem)"),
  };
})()` });
console.log("MEDIA-MATRIS @390px:", JSON.stringify(t.result.result.value, null, 1));

// Hela filen som <style> — räknat och felfångat
const t2 = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  try {
    const st = document.createElement("style");
    st.textContent = ${JSON.stringify(css)};
    document.head.appendChild(st);
    const sheet = st.sheet;
    const sok = "min-w-[" + "52px]";
    let mediaBlock = 0, hittad = null;
    for (const gr of sheet.cssRules) {
      if (gr.cssRules && gr.media) {
        mediaBlock++;
        for (const rr of gr.cssRules) if (rr.selectorText && rr.selectorText.includes(sok)) hittad = rr.selectorText;
      }
    }
    return { toppnivaRegler: sheet.cssRules.length, mediaBlock, hittadMinw52: hittad };
  } catch (e) { return { fel: e.message }; }
})()` });
console.log("HELA FILEN som <style>:", JSON.stringify(t2.result.result.value));
ws.close();
try { barn.kill(); } catch {}
