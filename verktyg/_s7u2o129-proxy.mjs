#!/usr/bin/env node
/**
 * AK1A — PROXYSOND o129 (SPÅR 7 — proxy-EFTER för /blogg CV-kalibreringen).
 *
 * Bevisar o129-kurens mekaniK UTAN bygge (prod-synken äger byggen):
 * identisk kanal som blocksonden, men den kalibrerade CSS:en injiceras
 * vid document-start (Page.addScriptToEvaluateOnNewDocument) — plats-
 * hållarnivåerna gäller från första layouten, exakt som på ett byggt
 * träd. Förväntad dom: docHΔ vid full scroll ≈ 0 (mot FÖRE −1 648 /
 * −3 160 / −4 545 px) — o78:s proxy-metodik.
 *
 * RAM-vakt: vägrar starta under 450 MB. finally-kill alltid.
 *
 * Användning:
 *   node verktyg/_s7u2o129-proxy.mjs <namn> <url> [bredd höjd dpr]
 * Utdata:
 *   data/forskning/OPTIMERING/lighthouse/blocksond-s7u2o129-<namn>.json
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "proxy";
const URL = process.argv[3] || "http://localhost:3000/blogg";
const BREDD = Number(process.argv[4] || 412);
const HOJD = Number(process.argv[5] || 823);
const DPR = Number(process.argv[6] || 2.627);
const PORT = 9351;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `blocksond-s7u2o129-${NAMN}.json`);

const memAvail = Number((readFileSync("/proc/meminfo").toString().match(/MemAvailable:\s+(\d+) kB/)||[])[1] || 0) / 1024;
if (memAvail < 450) {
  console.error(`RAM-vakt: MemAvailable ${Math.round(memAvail)} MB < 450 MB — avbryter.`);
  process.exit(2);
}
console.error(`RAM-vakt: ${Math.round(memAvail)} MB tillgängligt — ok.`);

// Identisk med globals.css o129-blocket (proxy-trädet).
// OBS: innehållsbox-värden (yttre höjd = angivet + 50 pga p-6+border) — se mikrosond-beviset.
const CSS = `
.cv-bloggkort { content-visibility: auto; contain-intrinsic-size: auto 20.25rem; }
html[lang="en"] .cv-bloggkort { contain-intrinsic-size: auto 18.4375rem; }
html[lang="ar"] .cv-bloggkort { contain-intrinsic-size: auto 16.5625rem; }
@media (min-width: 768px) {
  .cv-bloggkort, html[lang="en"] .cv-bloggkort, html[lang="ar"] .cv-bloggkort {
    contain-intrinsic-size: auto 19.0625rem;
  }
}
@media (min-width: 1024px) {
  .cv-bloggkort, html[lang="en"] .cv-bloggkort, html[lang="ar"] .cv-bloggkort {
    contain-intrinsic-size: auto 22.25rem;
  }
}
`;

const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--disable-gpu", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });
  return (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (msg) => (msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)));
    ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

const SNAPSHOT = `(() => {
  const kort = [...document.querySelectorAll('.cv-bloggkort')].map((el, i) => ({
    i, h: Math.round(el.getBoundingClientRect().height), top: Math.round(el.getBoundingClientRect().top),
    textLen: (el.innerText || '').trim().length,
  }));
  return {
    docH: Math.round(document.documentElement.scrollHeight),
    scrollY: Math.round(window.scrollY),
    antalKort: kort.length, sumKort: kort.reduce((s, k) => s + k.h, 0), kort,
  };
})()`;

async function snapshot(send, sessionId) {
  const { result } = await send("Runtime.evaluate", { returnByValue: true, expression: SNAPSHOT }, sessionId);
  return result.value;
}
async function docH(send, sessionId) {
  const { result } = await send("Runtime.evaluate",
    { returnByValue: true, expression: "document.documentElement.scrollHeight" }, sessionId);
  return result.value;
}
async function stabilisera(send, sessionId, minst, maxMs) {
  const ses = []; const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const h = await docH(send, sessionId);
    ses.push(h);
    if (ses.length >= minst && ses.slice(-minst).every((v) => v === ses[ses.length - minst])) return h;
    await sleep(600);
  }
  return ses[ses.length - 1];
}

try {
  let version;
  for (let i = 0; i < 40; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; }
    catch { await sleep(250); }
  }
  if (!version) throw new Error("DevTools svarade ej");
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  const send = await cdp(ws);

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);

  // KUREN på plats från första layouten (document-start, före all CSS-applicering av innehåll)
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(CSS)}; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s)); })();`,
  }, sessionId);

  await send("Emulation.setDeviceMetricsOverride",
    { width: BREDD, height: HOJD, deviceScaleFactor: DPR, mobile: BREDD < 768 }, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);
  await sleep(3500);

  const fore = await snapshot(send, sessionId);
  await stabilisera(send, sessionId, 3, 8000);
  const foreStabil = await snapshot(send, sessionId);
  console.log(`PROXY-FÖRE  docH ${foreStabil.docH} · kort ${foreStabil.antalKort} st Σ${foreStabil.sumKort}`);

  for (let i = 0; i < 250; i++) {
    await send("Runtime.evaluate", { expression: "window.scrollBy(0,500)" }, sessionId);
    await sleep(300);
    const h = await docH(send, sessionId);
    const y = (await send("Runtime.evaluate",
      { returnByValue: true, expression: "Math.round(window.scrollY + window.innerHeight)" }, sessionId)).result.value;
    if (y >= h - 2) break;
  }
  await sleep(2500);
  const efterStabilH = await stabilisera(send, sessionId, 4, 20000);
  const efter = await snapshot(send, sessionId);
  console.log(`PROXY-EFTER docH ${efter.docH} (poll ${efterStabilH}) · kort Σ${efter.sumKort}`);

  const insamlade = new Map();
  for (let i = 0; i < 260; i++) {
    const { result } = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const ut = [];
        document.querySelectorAll('.cv-bloggkort').forEach((el, idx) => {
          const r = el.getBoundingClientRect();
          if (r.top > -700 && r.top < 900) ut.push({ idx, h: Math.round(r.height), textLen: (el.innerText || '').trim().length });
        });
        window.scrollBy(0, -450);
        return ut;
      })()`,
    }, sessionId);
    for (const k of result.value) if (!insamlade.has(k.idx)) insamlade.set(k.idx, k);
    const y = (await send("Runtime.evaluate",
      { returnByValue: true, expression: "Math.round(window.scrollY)" }, sessionId)).result.value;
    if (y <= 0) break;
    await sleep(220);
  }
  await sleep(1500);
  const { result: toppResult } = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const ut = [];
      document.querySelectorAll('.cv-bloggkort').forEach((el, idx) =>
        ut.push({ idx, h: Math.round(el.getBoundingClientRect().height), textLen: (el.innerText || '').trim().length }));
      return ut;
    })()`,
  }, sessionId);
  for (const k of toppResult.value) if (!insamlade.has(k.idx) && k.textLen > 0) insamlade.set(k.idx, k);

  const renderade = [...insamlade.values()].filter((k) => k.textLen > 0);
  const stat = (arr) => {
    if (!arr.length) return null;
    const s = arr.map((k) => k.h).sort((a, b) => a - b);
    return { n: arr.length, min: s[0], max: s[s.length - 1], medel: Math.round(s.reduce((x, v) => x + v, 0) / arr.length), median: s[Math.floor(arr.length / 2)] };
  };

  const ut = {
    url: URL, viewport: { w: BREDD, h: HOJD, dpr: DPR }, ts: new Date().toISOString(),
    mode: "proxy-EFTER (kalibrerad CSS injicerad vid document-start)",
    fore: foreStabil, efter, docHDelta: efter.docH - foreStabil.docH,
    aktaHojder: { stat: stat(renderade), perKort: renderade.sort((a, b) => a.idx - b.idx) },
  };
  writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
  console.log(`docH ${foreStabil.docH} → ${efter.docH} = Δ${ut.docHDelta} px`);
  console.log(`Skriven: ${UTFIL}`);
  ws.close();
} finally {
  chrome.kill();
}
