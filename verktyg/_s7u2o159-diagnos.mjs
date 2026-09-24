#!/usr/bin/env node
/** o159 (s7-u2): varför verkade inte injicerad cv-CSS? Diagnos av
 *  style-landning, :has()-matchning, media-matchning, computed cv. */
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";

const PORT = 9370;
const KUR_CSS =
  "@media (max-width: 640px) { section:has(> div.overflow-x-auto) { content-visibility: auto; contain-intrinsic-size: auto 87rem; } }";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

rmSync("/tmp/ak1a-o159-diagnos-profil", { recursive: true, force: true });
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--disable-extensions", `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/ak1a-o159-diagnos-profil", "about:blank",
], { stdio: "ignore" });

let wsUrl = null;
for (let i = 0; i < 40 && !wsUrl; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json`);
    if (r.ok) {
      const m = (await r.json()).filter((t) => t.type === "page");
      if (m.length) wsUrl = m[0].webSocketDebuggerUrl;
    }
  } catch {}
  if (!wsUrl) await SLEEP(250);
}
const ws = new WebSocket(wsUrl);
await new Promise((los) => { ws.onopen = los; });
let id = 0;
const vantar = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && vantar.has(msg.id)) { const { los } = vantar.get(msg.id); vantar.delete(msg.id); los(msg); }
};
const send = (metod, params = {}) => new Promise((los, avvisa) => {
  const i = ++id; vantar.set(i, { los });
  ws.send(JSON.stringify({ id: i, method: metod, params }));
  setTimeout(() => { if (vantar.has(i)) { vantar.delete(i); avvisa(new Error("timeout " + metod)); } }, 25000);
});

await send("Network.enable", {});
await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `(() => { window.__styleLadesTill = true; const s = document.createElement("style"); s.textContent = ${JSON.stringify(KUR_CSS)}; (document.head || document.documentElement).appendChild(s); })()`,
});
await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true });
await send("Page.navigate", { url: "http://localhost:3000/bolag" });
for (let i = 0; i < 50; i++) {
  const r = await send("Runtime.evaluate", {
    expression: "document.readyState === 'complete' && document.fonts.status", returnByValue: true,
  });
  if (r?.result?.result?.value === true) break;
  await SLEEP(300);
}
await SLEEP(1500);
const r = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => ({
    styleLadesTill: window.__styleLadesTill === true,
    styleElementFinns: [...document.querySelectorAll("style")].some(s => s.textContent.includes("content-visibility: auto")),
    hasMatcharAntal: document.querySelectorAll("section:has(> div.overflow-x-auto)").length,
    mediaMatchar: matchMedia("(max-width: 640px)").matches,
    innerWidth: window.innerWidth,
    cvSektion1: getComputedStyle(document.querySelectorAll("section")[1]).contentVisibility,
    hojdSektion1: Math.round(document.querySelectorAll("section")[1].getBoundingClientRect().height),
  }))()`,
});
console.log(JSON.stringify(r.result.result.value, null, 2));
barn.kill("SIGTERM");
process.exit(0);
