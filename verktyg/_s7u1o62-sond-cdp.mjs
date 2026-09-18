#!/usr/bin/env node
// s7-u1 o62-sond: CDP-grundsanning — varför mäter sektorraden 44 px trots
// max-md:min-h-[52px]! ? Skriver beräknad stil + matchande regler.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const PORT = 9341;
const URL = "http://localhost:3000/portfolj-forskning";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/o62sond", "about:blank",
], { stdio: "ignore" });
await SLEEP(2500);

const listar = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const wsSida = new WebSocket(listar.find((s) => s.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (wsSida.onopen = r));
let seq = 0;
const svaret = {};
function send(metod, parametrar, nyckel) {
  return new Promise((res) => {
    const id = ++seq;
    svaret[id] = res;
    wsSida.addEventListener("message", (m) => {
      const d = JSON.parse(m.data);
      if (d.id === id) { delete svaret[id]; res(d.result ?? d); }
    });
    wsSida.send(JSON.stringify({ id, method: metod, params: parametrar }));
  });
}

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Page.enable", {});
await send("Page.navigate", { url: URL });
await SLEEP(6000);

const utvardering = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  const knappar = [...document.querySelectorAll("button")].filter(b => b.textContent.includes("bolag · snitt"));
  if (!knappar.length) return { fel: "hittade inte sektorraderna" };
  const b = knappar[0];
  const cs = getComputedStyle(b);
  const rect = b.getBoundingClientRect();
  // alla regler i dokumentets stilmallar som sätter min-height och matchar knappen
  const traffar = [];
  for (const sheet of document.styleSheets) {
    let regler; try { regler = sheet.cssRules; } catch { continue; }
    const vand = (rs, med) => {
      for (const r of rs) {
        if (r.cssRules && r.media) { vand(r.cssRules, r.media.mediaText); continue; }
        if (!r.selectorText) continue;
        let matchar = false; try { matchar = b.matches(r.selectorText); } catch {}
        if (matchar && r.style && r.style.minHeight && r.style.minHeight !== "") {
          traffar.push({ med: med || "-", sel: r.selectorText.slice(0, 80), minHeight: r.style.minHeight, prio: r.style.getPropertyPriority("min-height") });
        }
      }
    };
    vand(regler, null);
  }
  return {
    klass: b.className,
    rect: { w: Math.round(rect.width), h: Math.round(rect.height) },
    computed: { minHeight: cs.minHeight, height: cs.height, display: cs.display, boxSizing: cs.boxSizing, position: cs.position, overflow: cs.overflow },
    visport: { w: innerWidth, dpr: devicePixelRatio },
    regler: traffar,
  };
})()` });

console.log(JSON.stringify(utvardering.result?.value ?? utvardering, null, 2));
chrome.kill();
process.exit(0);
