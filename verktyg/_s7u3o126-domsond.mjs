#!/usr/bin/env node
/**
 * o126 dom-sond (s7-u3): riktad grävning i «Hälsa»-länken på /dataset —
 * fullt className, computed minWidth, viewport och CSS-regelns träff.
 * Engångsverktyg, commitas som underlag.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const BAS = "https://lab.ak1nvestor.com";
const PORT = 9339;
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/ak1a-o126-domsond-profil",
  "about:blank",
], { stdio: "ignore" });

let wsUrl = null;
for (let i = 0; i < 40 && !wsUrl; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json`);
    if (r.ok) {
      const mål = (await r.json()).filter((t) => t.type === "page");
      if (mål.length) wsUrl = mål[0].webSocketDebuggerUrl;
    }
  } catch {}
  if (!wsUrl) await SLEEP(250);
}
if (!wsUrl) { try { barn.kill(); } catch {}; throw new Error("Chrome svarade inte"); }

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
  setTimeout(() => { if (vantar.has(i)) { vantar.delete(i); avvisa(new Error("CDP-timeout: " + metod)); } }, 30000);
});

await send("Emulation.setUserAgentOverride", { userAgent: UA_IPHONE });
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Network.enable", {});
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Page.navigate", { url: BAS + "/dataset" });
for (let i = 0; i < 40; i++) {
  const r = await send("Runtime.evaluate", { expression: "document.readyState === 'complete' && document.fonts.status", returnByValue: true });
  if (r?.result?.result?.value === true) break;
  await SLEEP(300);
}
await SLEEP(3000);

const UT = `(() => {
  const ut = { viewport: document.documentElement.clientWidth + "x" + document.documentElement.clientHeight };
  const fn = [];
  for (const el of document.querySelectorAll("a")) {
    const t = (el.textContent || "").trim();
    if (t === "Hälsa" || (t.includes("Hälsa") && t.length < 30)) {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      let p = el.parentElement, kedja = [];
      for (let i = 0; i < 4 && p; i++) {
        const pr = p.getBoundingClientRect();
        kedja.push(p.tagName + "." + (p.getAttribute("class") || "").slice(0, 90) + " " + Math.round(pr.width) + "x" + Math.round(pr.height));
        p = p.parentElement;
      }
      fn.push({
        text: t, tag: el.tagName, rect: Math.round(r.width) + "x" + Math.round(r.height),
        href: el.getAttribute("href"),
        klassFull: el.getAttribute("class"),
        harMinW52: (el.getAttribute("class") || "").includes("min-w-[52px]"),
        computed: { display: st.display, minWidth: st.minWidth, minHeight: st.minHeight, width: st.width },
        parentKedja: kedja,
      });
    }
  }
  ut.fynd = fn;
  // hitta ALLA a-länkar med width<52 och visa deras klass-full
  ut.smala = [...document.querySelectorAll("a")].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1 && Math.min(r.width, r.height) < 52 && getComputedStyle(el).display !== "inline";
  }).map((el) => ({ text: (el.textContent || "").trim().slice(0, 24), w: Math.round(el.getBoundingClientRect().width), klass: (el.getAttribute("class") || "") }));
  return ut;
})()`;

const svar = await send("Runtime.evaluate", { expression: UT, returnByValue: true });
const v = svar?.result?.result?.value;
writeFileSync("/tmp/o126-domsond.json", JSON.stringify(v, null, 1));
console.log(JSON.stringify(v, null, 1));
try { ws.close(); } catch {}
try { barn.kill(); } catch {}
