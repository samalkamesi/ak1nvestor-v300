#!/usr/bin/env node
// s7-u3 o78-sond 2: DOM-karta på /kurser (mobil 412x844) — vilka sektioner
// bär DOM-vikt, vilka ligger under vecket och vad har de för computed
// content-visibility? Plus font-load-timing (webfontens dubbla layoutpass
// är o19-dokumenterad). Kall profil, CPU 4x, Slow 4G (Lighthouse-likt).
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const PORT = 9380;
const URL = process.env.SOND_URL || "http://localhost:3000/kurser";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));
const UT = process.env.SOND_UT || "data/forskning/OPTIMERING/lighthouse/sond-s7u3o78-domkarta-fore.json";

const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/o78sond2", "about:blank",
], { stdio: "ignore" });
await SLEEP(2500);

const listar = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const ws = new WebSocket(listar.find((s) => s.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (wsSidaOpen(ws, r)));
function wsSidaOpen(ws, r) { ws.onopen = r; }

let seq = 0;
const vantar = new Map();
ws.addEventListener("message", (m) => {
  const d = JSON.parse(m.data);
  if (d.id && vantar.has(d.id)) { vantar.get(d.id)(d.result ?? d); vantar.delete(d.id); }
});
function send(metod, parametrar) {
  return new Promise((res) => {
    const id = ++seq;
    vantar.set(id, res);
    ws.send(JSON.stringify({ id, method: metod, params: parametrar }));
  });
}

await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Emulation.setCPUThrottlingRate", { rate: 4 });
await send("Network.enable", {});
await send("Network.emulateNetworkConditions", {
  latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, offline: false,
});
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Page.enable", {});
await send("Page.navigate", { url: URL });
await SLEEP(11000);

const utvardering = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  const vh = innerHeight;
  const ro = document.querySelector("main") ?? document.body;
  const sektioner = [...ro.children].map((barn) => {
    const r = barn.getBoundingClientRect();
    const cs = getComputedStyle(barn);
    return {
      tag: barn.tagName, id: barn.id || undefined, klass: (barn.className || "").toString().slice(0, 50),
      topPx: Math.round(r.top + scrollY), hojdPx: Math.round(r.height),
      element: barn.querySelectorAll("*").length,
      cv: cs.contentVisibility, contain: cs.contain,
    };
  });
  // alla element under vecket som INTE är covered av en cv-förfader
  const cvLoser = [];
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.top + scrollY <= vh + 400) continue; // i/anära viewport — cv hjälper ej
    let f = el, skyddad = false;
    while (f && f !== document.body) {
      if (getComputedStyle(f).contentVisibility === "auto" || f.closest("[data-cv]")) { skyddad = true; break; }
      f = f.parentElement;
    }
    if (!skyddad) cvLoser.push(el);
  }
  const klumpar = {};
  for (const el of cvLoser) {
    let rot = el, djup = 0;
    while (rot.parentElement && rot.parentElement !== document.body && djup < 6) { rot = rot.parentElement; djup++; }
    const nyckel = rot.tagName + "." + (rot.className || "").toString().split(" ").slice(0, 2).join(".");
    klumpar[nyckel] = (klumpar[nyckel] ?? 0) + 1;
  }
  const fonter = [...document.fonts].map((f) => f.family + " " + f.weight + " " + f.status);
  const fontRes = performance.getEntriesByType("resource").filter((r) => /woff2?$/.test(r.name))
    .map((r) => ({ fil: r.name.split("/").pop().split("-")[0] + "…", startMs: Math.round(r.startTime), slutMs: Math.round(r.responseEnd) }));
  return {
    viewport: { w: innerWidth, h: vh, dokHojd: document.documentElement.scrollHeight },
    totalElement: document.querySelectorAll("*").length,
    cvKlasser: Object.fromEntries(["cv-kort","cv-registerkort","cv-utvalt","cv-bloggkort"].map((k) => [k, document.querySelectorAll("." + k).length])),
    sektioner,
    cvLoserAntal: cvLoser.length,
    cvLoserKlumpar: Object.entries(klumpar).sort((a,b)=>b[1]-a[1]).slice(0,12),
    fonter, fontRes,
  };
})()` });

const rapport = { url: URL, ts: new Date().toISOString(), ...utvardering.result?.value };
writeFileSync(UT, JSON.stringify(rapport, null, 2));
console.log(JSON.stringify(rapport, null, 2));
chrome.kill();
process.exit(0);
