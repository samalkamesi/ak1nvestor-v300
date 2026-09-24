#!/usr/bin/env node
/**
 * AK1A — BLOCKSOND o96 (SPÅR 7 — marin per-språk-kalibrering, o92 §5.6).
 *
 * Fråga: hur mycket krymper dokumentet vid första fulla scrollen på
 * DESKTOP per språk (/kurser, /en/kurser, /ar/kurser) — och vad är
 * marin-panelens (.cv-socialproof på sv, .cv-siffreband-spegel på
 * speglarna) platshållarhöjd resp. ÄKTA renderade höjd + padding
 * (kalibreringsunderlag: contain-intrinsic-size = äkta höjd − padding)?
 *
 * Metod (o91 §1b/o92 §1a block-sond + o96-tillägget marinInfo):
 *   1. FÖRE-snapshot vid toppen efter stabilisering (platshållarläget —
 *      marin-panel under vecket = ej renderad, box = intrinsic+padding).
 *   2. Långsam fram-scroll till botten (500 px/300 ms).
 *   3. Stabiliseringspoll på docH.
 *   4. EFTER-snapshot vid botten (Σ-höjder; cv:auto-minnen gäller).
 *   5. marinInfo i BÅDA snapshoterna: elementets box-höjd, padding-top/
 *      bottom, html.lang — platshållare (FÖRE) vs verklig (EFTER).
 *
 * RAM-vakt: vägrar starta under 450 MB MemAvailable (fabriksregeln —
 * en chrome i taget, sekvenciellt). finally-kill alltid.
 *
 * Födelse: o96 (2026-09-19) — o92 §5.6:s köpost (marinens sluthöjd är
 * språkberoende: /kurser 918 px vs /en 484 px). Rå CDP via Node-global
 * WebSocket. Bygger på _s7u1o93-blocksond.mjs (o93, samma manifest).
 *
 * Användning:
 *   node verktyg/_s7u2o96-blocksond.mjs <namn> [url] [bredd höjd dpr]
 * Utdata:
 *   data/forskning/OPTIMERING/lighthouse/blocksond-s7u2o96-<namn>.json
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/en/kurser";
const BREDD = Number(process.argv[4] || 1280);
const HOJD = Number(process.argv[5] || 800);
const DPR = Number(process.argv[6] || 1);
const MOBIL = BREDD < 768;
const PORT = 9342;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `blocksond-s7u2o96-${NAMN}.json`);

// RAM-vakt
const memAvail = Number((readFileSync("/proc/meminfo").toString().match(/MemAvailable:\s+(\d+) kB/)||[])[1] || 0) / 1024;
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

const SNAPSHOT = `(() => {
  const sig = (el) => {
    const k = (el.className && typeof el.className === 'string')
      ? el.className.trim().replace(/\\s+/g, '.').slice(0, 70) : '';
    return el.tagName.toLowerCase() + (k ? '.' + k : '');
  };
  const agg = new Map();
  for (const el of document.querySelectorAll('body *')) {
    const s = sig(el);
    const o = agg.get(s) || { n: 0, sum: 0 };
    o.n++; o.sum += el.getBoundingClientRect().height;
    agg.set(s, o);
  }
  const marinEl = document.querySelector('.cv-socialproof') ||
    document.querySelector('.marin-panel.cv-siffreband-spegel');
  let marinInfo = null;
  if (marinEl) {
    const cs = getComputedStyle(marinEl);
    const r = marinEl.getBoundingClientRect();
    marinInfo = {
      klass: marinEl.className,
      boxH: Math.round(r.height),
      padTop: parseFloat(cs.paddingTop), padBottom: parseFloat(cs.paddingBottom),
      borTop: parseFloat(cs.borderTopWidth), borBottom: parseFloat(cs.borderBottomWidth),
      renderad: r.height > 0 && (marinEl.innerText || '').trim().length > 0,
      textLen: (marinEl.innerText || '').trim().length,
      barn: marinEl.children.length,
    };
  }
  return {
    docH: Math.round(document.documentElement.scrollHeight),
    scrollY: Math.round(window.scrollY),
    lang: document.documentElement.lang,
    agg: [...agg.entries()].map(([s, o]) => ({ sig: s, n: o.n, sum: Math.round(o.sum) }))
      .sort((a, b) => b.sum - a.sum).slice(0, 120),
    marinInfo,
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

  await send("Emulation.setDeviceMetricsOverride",
    { width: BREDD, height: HOJD, deviceScaleFactor: DPR, mobile: MOBIL }, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);
  await sleep(3500); // hydrering + närliggande kort fylls

  const fore = await snapshot(send, sessionId);
  await stabilisera(send, sessionId, 3, 8000);
  const foreStabil = await snapshot(send, sessionId);
  console.log(`FÖRE  docH ${fore.docH} (stabil ${foreStabil.docH}) · lang ${foreStabil.lang} · marin ${foreStabil.marinInfo ? JSON.stringify(foreStabil.marinInfo) : "SAKNAS"}`);

  // Fram-scroll: långsam till botten
  for (let i = 0; i < 200; i++) {
    await send("Runtime.evaluate",
      { expression: "window.scrollBy(0,500)" }, sessionId);
    await sleep(300);
    const h = await docH(send, sessionId);
    const y = (await send("Runtime.evaluate",
      { returnByValue: true, expression: "Math.round(window.scrollY + window.innerHeight)" }, sessionId)).result.value;
    if (y >= h - 2) break;
  }
  await sleep(2500); // sista /api-fyllningarna landar
  const efterStabilH = await stabilisera(send, sessionId, 4, 20000);
  const efter = await snapshot(send, sessionId);
  console.log(`EFTER docH ${efter.docH} (poll ${efterStabilH}) · marin ${efter.marinInfo ? JSON.stringify(efter.marinInfo) : "SAKNAS"}`);

  // Attribution: Σdelta per signatur (FÖRE-stabil vs EFTER)
  const foreAgg = new Map(foreStabil.agg.map((a) => [a.sig, a]));
  const attr = efter.agg.map((a) => {
    const f = foreAgg.get(a.sig);
    return { sig: a.sig, n: a.n, foreSum: f ? f.sum : 0, efterSum: a.sum, delta: a.sum - (f ? f.sum : 0) };
  }).filter((a) => Math.abs(a.delta) >= 20).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 25);

  const ut = {
    url: URL, viewport: { w: BREDD, h: HOJD, dpr: DPR, mobile: MOBIL },
    ts: new Date().toISOString(),
    fore: foreStabil, efter,
    docHDelta: efter.docH - foreStabil.docH,
    attribution: attr,
  };
  writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
  console.log(`docH ${foreStabil.docH} → ${efter.docH} = Δ${ut.docHDelta} px`);
  for (const a of attr.slice(0, 12)) console.log(`  ${a.delta > 0 ? '+' : ''}${a.delta}`.padStart(7), ` ${a.sig.slice(0, 58)} (n=${a.n})`);
  console.log(`Skriven: ${UTFIL}`);
  ws.close();
} finally {
  chrome.kill();
}
