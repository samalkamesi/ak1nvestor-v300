#!/usr/bin/env node
/**
 * AK1A — KURSTIPS-SOND o99 (SPÅR 7 — spegel-pop-in, o89 §5 / o96 §5.1).
 *
 * Fråga: vad händer med div.cv-kurstips på spegelkurssidorna från SSR till
 * hydratisering — tom (0 px) → fylld (+H px) — och vilka layout-skift
 * registreras i performance-tidslinjen (direkt CLS-bevis + attribution)?
 *
 * Metod: sampling vid 300/800/1500/3000/5000 ms efter navigering + stabil-
 * iseringspoll; per provpunkt: wrapper-box (top/h), inre sektion (h, rubrik),
 * docH, samt layout-shift-poster UR TIDSLINJEN (PerformanceEntry 'layout-shift'
 * med källnoder). Kalibreringstalen = den STABILA fyllda höjden per bredd.
 *
 * RAM-vakt: vägrar starta under 450 MB MemAvailable (fabriksregeln —
 * en chrome i taget, sekvenciellt). finally-kill alltid.
 *
 * Födelse: o99 (2026-09-20, s7-u1). Rå CDP via Node-global WebSocket.
 *
 * Användning:
 *   node verktyg/_s7u1o99-kurstips-sond.mjs <namn> [url] [bredd höjd dpr]
 * Utdata:
 *   data/forskning/OPTIMERING/lighthouse/kurstips-s7u1o99-<namn>.json
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/en/kurser";
const BREDD = Number(process.argv[4] || 412);
const HOJD = Number(process.argv[5] || 823);
const DPR = Number(process.argv[6] || 2.627);
// Valfri 7:e argument: sökväg till CSS som injiceras vid document-start
// (A/B-proxy utan bygge — o96/o99-precedensen: samma kanal, sidan + golv-CSS).
const INJEKT = process.argv[7] ? readFileSync(process.argv[7], "utf8") : null;
const PORT = 9347;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `kurstips-s7u1o99-${NAMN}.json`);

// RAM-vakt
const memAvail = Number((readFileSync("/proc/meminfo").toString().match(/MemAvailable:\s+(\d+) kB/) || [])[1] || 0) / 1024;
if (memAvail < 450) {
  console.error(`RAM-vakt: MemAvailable ${Math.round(memAvail)} MB < 450 MB — avbryter (en chrome i taget, fabriksregeln).`);
  process.exit(2);
}
console.error(`RAM-vakt: ${Math.round(memAvail)} MB tillgängligt — ok.`);

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

const PROVA = `(() => {
  const wrap = document.querySelector('div.cv-kurstips');
  const sekt = wrap ? wrap.querySelector('section') : null;
  const shifts = performance.getEntriesByType('layout-shift').map((e) => ({
    v: Math.round(e.value * 1000) / 1000,
    kallor: (e.sources || []).map((s) => {
      const n = s.node;
      const cls = n && n.className && typeof n.className === 'string'
        ? '.' + n.className.trim().replace(/\\s+/g, '.').slice(0, 60) : '';
      return n ? n.nodeName.toLowerCase() + cls : '?';
    }).slice(0, 4),
  }));
  return {
    docH: Math.round(document.documentElement.scrollHeight),
    wrap: wrap
      ? { top: Math.round(wrap.getBoundingClientRect().top),
          h: Math.round(wrap.getBoundingClientRect().height) }
      : null,
    sektion: sekt ? { h: Math.round(sekt.getBoundingClientRect().height) } : null,
    rubrik: sekt && sekt.querySelector('h2') ? sekt.querySelector('h2').textContent : null,
    shifts,
    clsSumma: Math.round(shifts.reduce((s, e) => s + e.v, 0) * 1000) / 1000,
  };
})()`;

async function prova(send, sessionId) {
  const { result } = await send("Runtime.evaluate", { returnByValue: true, expression: PROVA }, sessionId);
  return result.value;
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

  await send("Emulation.setDeviceMetricsOverride",
    { width: BREDD, height: HOJD, deviceScaleFactor: DPR, mobile: BREDD < 768 }, sessionId);
  if (INJEKT) {
    // Injektion FÖRE parsning ⇒ golvet gäller vid första layouten (som byggt CSS)
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(INJEKT)}; (document.head || document.documentElement).appendChild(s); })()`,
    }, sessionId);
  }
  await send("Page.navigate", { url: URL }, sessionId);

  // Sampling: fånga både pre-hydrat (tidigt) och fyllt (sent) läge
  const provpunkter = [];
  const tider = [300, 500, 700, 1500, 2000, 3000]; // kumulativa väntetider
  let passerat = 0;
  for (const t of tider) {
    await sleep(t - passerat);
    passerat = t;
    const p = await prova(send, sessionId);
    provpunkter.push({ t, ...p });
    console.log(`t+${t}ms wrap.h=${p.wrap ? p.wrap.h : "–"} sekt.h=${p.sektion ? p.sektion.h : "–"} docH=${p.docH} cls=${p.clsSumma}`);
  }
  // Stabilisering: polla tills sektionens höjd står still 3 pass
  const ses = [];
  let stabil = null;
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    const p = await prova(send, sessionId);
    const nyckel = `${p.wrap ? p.wrap.h : -1}:${p.docH}`;
    ses.push(nyckel);
    stabil = p;
    if (ses.length >= 3 && ses.slice(-3).every((v) => v === nyckel)) break;
    await sleep(700);
  }
  console.log(`STABIL wrap.h=${stabil.wrap ? stabil.wrap.h : "–"} sekt.h=${stabil.sektion ? stabil.sektion.h : "–"} docH=${stabil.docH} cls=${stabil.clsSumma} shiftsen=${stabil.shifts.length}`);
  for (const s of stabil.shifts.slice(0, 6)) {
    console.log(`  shift v=${s.v} källor: ${s.kallor.join(" | ").slice(0, 120)}`);
  }

  const ut = {
    url: URL, viewport: { w: BREDD, h: HOJD, dpr: DPR },
    injekterad: !!INJEKT,
    ts: new Date().toISOString(),
    provpunkter, stabil,
  };
  writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
  console.log(`Skriven: ${UTFIL}`);
  ws.close();
} finally {
  chrome.kill();
}
