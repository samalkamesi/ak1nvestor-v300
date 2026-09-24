#!/usr/bin/env node
/**
 * AK1A — BLOCKSOND o129 (SPÅR 7 — /blogg CV-reservation, o93-metodiken).
 *
 * Fråga: o28 kalibrerade .cv-bloggkort till 22rem när listan hade 55
 * inlägg; o120 §5 serialiserar flighten 110 kort. Avviker kortens ÄKTA
 * renderade höjd från platshållaren — och hur mycket krymper/växer
 * dokumentet vid första fulla scrollen (stavhopp)?
 *
 * Metod (o93 blocksond, selector bytt till div.cv-bloggkort):
 *   1. FÖRE-snapshot vid toppen (platshållarläget) efter stabilisering.
 *   2. Långsam fram-scroll till botten (500 px/300 ms — cv:auto fylls).
 *   3. Stabiliseringspoll på docH; EFTER-snapshot (Σ-höjder, cv-minnen).
 *   4. RETUR-SCROLL: per-kort ÄKTA höjd när kortet är nära viewport
 *      (renderat just då — ej minne; löser o91 §1a:s innerText-artefakt).
 *
 * RAM-vakt: vägrar starta under 450 MB (fabriksregeln — en chrome i
 * taget, sekventiellt). finally-kill alltid.
 *
 * Födelse: o129 (2026-09-20) — o120 §6 post 2 (CV-spåret) möter o97:s
 * kalibreringsläxa: reservation ≈ äkta medelhöjd ⇒ Σ-delta ~0.
 *
 * Användning:
 *   node verktyg/_s7u2o129-blocksond.mjs <namn> [url] [bredd höjd dpr]
 *   (desktop: node verktyg/_s7u2o129-blocksond.mjs <namn> <url> 1280 800 1)
 * Utdata:
 *   data/forskning/OPTIMERING/lighthouse/blocksond-s7u2o129-<namn>.json
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/blogg";
const BREDD = Number(process.argv[4] || 412);
const HOJD = Number(process.argv[5] || 823);
const DPR = Number(process.argv[6] || 2.627);
const PORT = 9349;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `blocksond-s7u2o129-${NAMN}.json`);

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
  const kort = [...document.querySelectorAll('.cv-bloggkort')].map((el, i) => ({
    i,
    h: Math.round(el.getBoundingClientRect().height),
    top: Math.round(el.getBoundingClientRect().top),
    textLen: (el.innerText || '').trim().length,
  }));
  return {
    docH: Math.round(document.documentElement.scrollHeight),
    scrollY: Math.round(window.scrollY),
    kort,
    antalKort: kort.length,
    sumKort: kort.reduce((s, k) => s + k.h, 0),
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
    { width: BREDD, height: HOJD, deviceScaleFactor: DPR, mobile: BREDD < 768 }, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);
  await sleep(3500); // hydrering + närliggande kort renderas (IO marginal)

  const fore = await snapshot(send, sessionId);
  await stabilisera(send, sessionId, 3, 8000);
  const foreStabil = await snapshot(send, sessionId);
  console.log(`FÖRE  docH ${fore.docH} (stabil ${foreStabil.docH}) · kort ${foreStabil.antalKort} st Σ${foreStabil.sumKort}`);

  // Fram-scroll: långsam till botten
  for (let i = 0; i < 250; i++) {
    await send("Runtime.evaluate",
      { expression: "window.scrollBy(0,500)" }, sessionId);
    await sleep(300);
    const h = await docH(send, sessionId);
    const y = (await send("Runtime.evaluate",
      { returnByValue: true, expression: "Math.round(window.scrollY + window.innerHeight)" }, sessionId)).result.value;
    if (y >= h - 2) break;
  }
  await sleep(2500);
  const efterStabilH = await stabilisera(send, sessionId, 4, 20000);
  const efter = await snapshot(send, sessionId);
  console.log(`EFTER docH ${efter.docH} (poll ${efterStabilH}) · kort Σ${efter.sumKort}`);

  // Retur-scroll: samla ÄKTA renderade korthöjder när kortet är nära viewport
  const insamlade = new Map();
  for (let i = 0; i < 260; i++) {
    const { result } = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const ut = [];
        document.querySelectorAll('.cv-bloggkort').forEach((el, idx) => {
          const r = el.getBoundingClientRect();
          if (r.top > -700 && r.top < 900) {
            ut.push({ idx, h: Math.round(r.height), textLen: (el.innerText || '').trim().length });
          }
        });
        window.scrollBy(0, -450);
        return ut;
      })()`,
    }, sessionId);
    for (const k of result.value) {
      if (!insamlade.has(k.idx)) insamlade.set(k.idx, k);
    }
    const y = (await send("Runtime.evaluate",
      { returnByValue: true, expression: "Math.round(window.scrollY)" }, sessionId)).result.value;
    if (y <= 0) break;
    await sleep(220);
  }
  // topp-nådd: de översta renderas vid topp
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
  for (const k of toppResult.value) {
    if (!insamlade.has(k.idx) && k.textLen > 0) insamlade.set(k.idx, k);
  }

  const renderade = [...insamlade.values()].filter((k) => k.textLen > 0);
  const stat = (arr) => {
    if (!arr.length) return null;
    const sorterade = arr.map((k) => k.h).sort((a, b) => a - b);
    return {
      n: arr.length,
      min: sorterade[0], max: sorterade[sorterade.length - 1],
      medel: Math.round(sorterade.reduce((s, v) => s + v, 0) / arr.length),
      median: sorterade[Math.floor(arr.length / 2)],
    };
  };
  console.log(`ÄKTA renderade under retur-scroll: ${renderade.length}/${foreStabil.antalKort} ${JSON.stringify(stat(renderade))}`);

  const ut = {
    url: URL, viewport: { w: BREDD, h: HOJD, dpr: DPR },
    ts: new Date().toISOString(),
    fore: foreStabil, efter,
    docHDelta: efter.docH - foreStabil.docH,
    platshallareRem: 22,
    aktaHojder: { stat: stat(renderade), perKort: renderade.sort((a, b) => a.idx - b.idx) },
  };
  writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
  console.log(`docH ${foreStabil.docH} → ${efter.docH} = Δ${ut.docHDelta} px`);
  console.log(`Skriven: ${UTFIL}`);
  ws.close();
} finally {
  chrome.kill();
}
