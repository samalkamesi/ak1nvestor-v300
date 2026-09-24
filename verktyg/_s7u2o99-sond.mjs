#!/usr/bin/env node
/**
 * AK1A — o99-SOND: spegel-CLS-roten och golvet kalibrerat (s7-u2).
 *
 * Mäter per sida+geometri, med 100 ms polling i 8 s:
 *  · .cv-kurstips-wrapperns höjd (SSR=0 → hydratationsfyllning)
 *  · gridens (wrapperns nästa syskon) top-läge — knuffen som ger CLS
 *  · layout-shift-poster (PerformanceObserver, buffered) med tid+värde
 *  · slutläge: fyllt kurstips-läge = golvnivån per språk×bredd
 *
 * Användning: node verktyg/_s7u2o99-sond.mjs <namn> <url> [mobil|tablet|desktop]
 * Utdata: data/forskning/OPTIMERING/lighthouse/o99sond-<namn>.json
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/en/kurser";
const GEO = process.argv[4] || "mobil";
const VP = GEO === "desktop"
  ? { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }
  : GEO === "tablet"
    ? { width: 768, height: 1024, deviceScaleFactor: 2, mobile: true }
    : { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true };
const PORT = 9361;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `o99sond-${NAMN}.json`);

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

// Early observer: samlar layout-shifts FÖRE navigeringens första pass.
const SHIFT_OBSERVER = `
window.__o99shifts = [];
try {
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__o99shifts.push({
        value: +e.value.toFixed(5),
        startTime: Math.round(e.startTime),
        sources: (e.sources || []).map((s) => {
          if (s.node && s.node.setAttribute) {
            try { s.node.setAttribute("data-o99-shift", String(window.__o99shifts.length)); } catch (e2) {}
          }
          return {
            node: s.node ? (s.node.nodeName + "." + (s.node.className && s.node.className.baseVal !== undefined ? s.node.className.baseVal : (s.node.className || ""))) : null,
            html: s.node ? String(s.node.outerHTML || "").replace(/\\s+/g, " ").slice(0, 140) : null,
            kvar: !!s.node && !!s.node.isConnected,
            prev: s.previousRect ? { y: Math.round(s.previousRect.y), h: Math.round(s.previousRect.height) } : null,
            curr: s.currentRect ? { y: Math.round(s.currentRect.y), h: Math.round(s.currentRect.height) } : null,
          };
        }),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
} catch (e) { window.__o99shiftsFel = String(e); }
`;

// Ett poll-pass: wrappern + gridens top + docH.
const POLL = `(() => {
  const w = document.querySelector(".cv-kurstips");
  const grid = w ? w.nextElementSibling : null;
  const inner = w ? w.firstElementChild : null;
  return {
    tipsH: w ? Math.round(w.getBoundingClientRect().height) : null,
    innerH: inner ? Math.round(inner.getBoundingClientRect().height) : null,
    gridTop: grid ? Math.round(grid.getBoundingClientRect().y) : null,
    tipsY: w ? Math.round(w.getBoundingClientRect().y) : null,
    docH: Math.round(document.documentElement.scrollHeight),
    lang: document.documentElement.lang,
  };
})()`;

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
  await send("Emulation.setDeviceMetricsOverride", VP, sessionId);
  await send("Page.addScriptToEvaluateOnNewDocument", { source: SHIFT_OBSERVER }, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);

  // Tidsserie: 80 samples à 100 ms = 8 s (hydratisering + useEffect-fyllning).
  const serie = [];
  for (let i = 0; i < 80; i++) {
    await sleep(100);
    try {
      const s = (await send("Runtime.evaluate", { expression: POLL, returnByValue: true }, sessionId)).result.value;
      serie.push({ t: (i + 1) * 100, ...s });
    } catch { /* avbrott under navigering — hoppa över samplet */ }
  }

  const shifts = (await send("Runtime.evaluate", { expression: "JSON.stringify(window.__o99shifts || [])", returnByValue: true }, sessionId)).result.value;

  const forsta = serie.find((s) => s.tipsH !== null) || {};
  const sista = serie[serie.length - 1] || {};
  const topp = serie.reduce((a, b) => (b.tipsH > a.tipsH ? b : a), forsta);
  console.log(`lang ${sista.lang} · tipsY ${sista.tipsY} · tipsH: första ${forsta.tipsH} → max ${topp.tipsH} → slut ${sista.tipsH} (innerH ${sista.innerH}) · gridTop ${forsta.gridTop} → ${sista.gridTop}`);
  console.log(`docH ${forsta.docH} → ${sista.docH} · shifts ${JSON.parse(shifts).length} st`);
  for (const s of JSON.parse(shifts)) {
    console.log(`  shift ${s.value} @${s.startTime}ms`);
    for (const k of s.sources) {
      console.log(`    källa: ${k.node} y${k.prev && k.prev.y}→${k.curr && k.curr.y} h${k.prev && k.prev.h}→${k.curr && k.curr.h} kvar=${k.kvar}`);
      if (k.html) console.log(`      html: ${k.html}`);
    }
  }

  writeFileSync(UTFIL, JSON.stringify({
    url: URL, namn: NAMN, geo: GEO, vp: VP, ts: Date.now(),
    serie, shifts: JSON.parse(shifts), slut: sista,
  }, null, 1));
  console.log(`→ ${UTFIL}`);
} finally {
  chrome.kill("SIGKILL");
}
