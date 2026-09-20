#!/usr/bin/env node
/** o128-debug v2: navigera /kalkylator, klicka flik, dumpa tillstånd + skärmdump */
import { spawn } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";

const PORT = 9340;
const PROFIL = "/tmp/ak1a-o128-debug-profil";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

try { rmSync(PROFIL, { recursive: true, force: true }); } catch {}
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFIL}`, "about:blank",
], { stdio: "ignore" });

let wsUrl;
for (let i = 0; i < 40; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json`);
    if (r.ok) {
      const mål = (await r.json()).filter((t) => t.type === "page");
      if (mål.length) { wsUrl = mål[0].webSocketDebuggerUrl; break; }
    }
  } catch {}
  await SLEEP(250);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0;
const vantar = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && vantar.has(m.id)) { const { los } = vantar.get(m.id); vantar.delete(m.id); los(m); }
};
const send = (metod, params = {}) => new Promise((los, avvisa) => {
  const i = ++id; vantar.set(i, { los });
  ws.send(JSON.stringify({ id: i, method: metod, params }));
  setTimeout(() => { if (vantar.has(i)) { vantar.delete(i); avvisa(new Error("timeout " + metod)); } }, 30000);
});
const ev = async (x) => {
  const svar = await send("Runtime.evaluate", { expression: x, returnByValue: true });
  if (svar?.result?.exceptionDetails) return "UNDANTAG: " + (svar.result.exceptionDetails.exception?.description || "").slice(0, 200);
  return svar?.result?.result?.value;
};

const LAGE = `(() => {
  const tabs = [...document.querySelectorAll('[role=tab]')].map(t => ({ t: (t.textContent||'').trim().slice(0,24), state: t.getAttribute('data-state') }));
  const panels = [...document.querySelectorAll('[role=tabpanel]')].map(p => ({ state: p.getAttribute('data-state'), barn: p.childElementCount, langd: (p.textContent||'').length }));
  return { tabs, panels, sliders: document.querySelectorAll('[data-slot=slider]').length, tummar: document.querySelectorAll('[data-slot=slider-thumb]').length };
})()`;

await send("Emulation.setUserAgentOverride", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" });
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Network.enable", {});
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Page.navigate", { url: "https://lab.ak1nvestor.com/kalkylator" });
await SLEEP(9000);

console.log("FÖRE  :", JSON.stringify(await ev(LAGE)));
console.log("klick :", await ev(`(() => { const t = [...document.querySelectorAll('[role=tab]')].find(e => (e.textContent||'').includes('Poängsätt manuellt')); if (!t) return 'FYRKANT hittades ej'; t.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true})); t.click(); return 'klickat'; })()`));
await SLEEP(4000);
console.log("EFTER :", JSON.stringify(await ev(LAGE)));

const skarm = await send("Page.screenshot", { format: "png", fromSurface: true });
if (skarm?.result?.data) {
  writeFileSync("/tmp/o128-debug.png", Buffer.from(skarm.result.data, "base64"));
  console.log("skärmdump: /tmp/o128-debug.png");
} else {
  console.log("screenshot misslyckades:", JSON.stringify(skarm).slice(0, 200));
}
ws.close(); barn.kill();
