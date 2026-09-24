#!/usr/bin/env node
/**
 * AK1A — BLOCKSOND o93 (SPÅR 7 — mobil registerreservation).
 *
 * Fråga: hur mycket krymper/växer /kurser-dokumentet vid första fulla
 * scrollen (mobil), VILKA signaturer bär deltat — och vad är register-
 * kortens ÄKTA renderade höjd per kort (kalibreringsunderlag)?
 *
 * Metod (o91 §1b block-sond + o93-förbättring):
 *   1. FÖRE-snapshot vid toppen efter stabilisering (platshållarläget).
 *   2. Långsam fram-scroll till botten (500 px/300 ms — IO hinner fylla
 *      korten; /api-kursdata landar).
 *   3. Stabiliseringspoll på docH.
 *   4. EFTER-snapshot vid botten (Σ-höjder; cv:auto-minnen gäller).
 *   5. RETUR-SCROLL med insamling: per-kort höjd + textLängd när kortet
 *      är nära viewport (RENDERAT just då — äkta höjd, ej minne). Detta
 *      löser o91 §1a:s artefakt (innerText="" vid botten) och o91/:
 *      o92:s höjddiskrepans (446 vs 331 px medel).
 *
 * RAM-vakt: vägrar starta under 450 MB MemAvailable (fabriksregeln —
 * en chrome i taget, sekvenciellt). finally-kill alltid.
 *
 * Födelse: o93 (2026-09-19) — o92 §5.7:s köpost (mobilreservation
 * 28rem/kort överreserverar ~2,8k px). Rå CDP via Node-global WebSocket.
 *
 * Användning:
 *   node verktyg/_s7u1o93-blocksond.mjs <namn> [url] [bredd höjd dpr]
 * Utdata:
 *   data/forskning/OPTIMERING/lighthouse/blocksond-s7u1o93-<namn>.json
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/kurser";
const BREDD = Number(process.argv[4] || 412);
const HOJD = Number(process.argv[5] || 823);
const DPR = Number(process.argv[6] || 2.627);
const PORT = 9341;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `blocksond-s7u1o93-${NAMN}.json`);

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
  const kortInfo = (sel) => [...document.querySelectorAll(sel)].map((el, i) => ({
    i,
    h: Math.round(el.getBoundingClientRect().height),
    top: Math.round(el.getBoundingClientRect().top),
    textLen: (el.innerText || '').trim().length,
  }));
  const ul = [...document.querySelectorAll('ul')].map((el, i) => ({
    i, klass: String(el.className).slice(0, 60),
    h: Math.round(el.getBoundingClientRect().height),
    nBarn: el.children.length,
  })).filter(u => u.nBarn >= 6);
  return {
    docH: Math.round(document.documentElement.scrollHeight),
    scrollY: Math.round(window.scrollY),
    agg: [...agg.entries()].map(([s, o]) => ({ sig: s, n: o.n, sum: Math.round(o.sum) }))
      .sort((a, b) => b.sum - a.sum).slice(0, 120),
    registerkort: kortInfo('li.cv-registerkort'),
    utvalt: kortInfo('li.cv-utvalt'),
    storul: ul,
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
    { width: BREDD, height: HOJD, deviceScaleFactor: DPR, mobile: true }, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);
  await sleep(3500); // hydrering + närliggande kort fylls (IO rootMargin 400)

  const fore = await snapshot(send, sessionId);
  await stabilisera(send, sessionId, 3, 8000);
  const foreStabil = await snapshot(send, sessionId);
  console.log(`FÖRE  docH ${fore.docH} (stabil ${foreStabil.docH}) · registerkort ${fore.registerkort.length} st Σ${fore.registerkort.reduce((s, k) => s + k.h, 0)} · utvalt ${fore.utvalt.length} st Σ${fore.utvalt.reduce((s, k) => s + k.h, 0)}`);

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
  console.log(`EFTER docH ${efter.docH} (poll ${efterStabilH}) · registerkort Σ${efter.registerkort.reduce((s, k) => s + k.h, 0)} · utvalt Σ${efter.utvalt.reduce((s, k) => s + k.h, 0)}`);

  // Retur-scroll: samla ÄKTA renderade korthöjder när kortet är nära viewport
  const insamlade = new Map();
  for (let i = 0; i < 220; i++) {
    const { result } = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const ut = [];
        for (const el of document.querySelectorAll('li.cv-registerkort, li.cv-utvalt')) {
          const r = el.getBoundingClientRect();
          if (r.top > -700 && r.top < 900) {
            ut.push({ klass: el.classList.contains('cv-registerkort') ? 'reg' : 'utv',
              idx: [...document.querySelectorAll(el.classList.contains('cv-registerkort') ? 'li.cv-registerkort' : 'li.cv-utvalt')].indexOf(el),
              h: Math.round(r.height), textLen: (el.innerText || '').trim().length });
          }
        }
        window.scrollBy(0, -450);
        return ut;
      })()`,
    }, sessionId);
    for (const k of result.value) {
      if (!insamlade.has(`${k.klass}:${k.idx}`)) insamlade.set(`${k.klass}:${k.idx}`, k);
    }
    const y = (await send("Runtime.evaluate",
      { returnByValue: true, expression: "Math.round(window.scrollY)" }, sessionId)).result.value;
    if (y <= 0) break;
    await sleep(220);
  }
  // topp-nådd: samla ev. resterande (de översta renderas vid topp)
  await sleep(1500);
  const { result: toppResult } = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const ut = [];
      document.querySelectorAll('li.cv-registerkort').forEach((el, idx) => ut.push({ klass: 'reg', idx, h: Math.round(el.getBoundingClientRect().height), textLen: (el.innerText||'').trim().length }));
      document.querySelectorAll('li.cv-utvalt').forEach((el, idx) => ut.push({ klass: 'utv', idx, h: Math.round(el.getBoundingClientRect().height), textLen: (el.innerText||'').trim().length }));
      return ut;
    })()`,
  }, sessionId);
  const toppTillskott = toppResult.value;
  for (const k of toppTillskott) {
    if (!insamlade.has(`${k.klass}:${k.idx}`) && k.textLen > 0) insamlade.set(`${k.klass}:${k.idx}`, k);
  }

  const renderade = [...insamlade.values()];
  const regR = renderade.filter((k) => k.klass === "reg" && k.textLen > 0);
  const utvR = renderade.filter((k) => k.klass === "utv" && k.textLen > 0);
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
  console.log(`ÄKTA renderade under retur-scroll: register ${regR.length}/${fore.registerkort.length} ${JSON.stringify(stat(regR))} · utvalt ${utvR.length}/${fore.utvalt.length} ${JSON.stringify(stat(utvR))}`);

  // Attribution: Σdelta per signatur (FÖRE-stabil vs EFTER)
  const foreAgg = new Map(foreStabil.agg.map((a) => [a.sig, a]));
  const attr = efter.agg.map((a) => {
    const f = foreAgg.get(a.sig);
    return { sig: a.sig, n: a.n, foreSum: f ? f.sum : 0, efterSum: a.sum, delta: a.sum - (f ? f.sum : 0) };
  }).filter((a) => Math.abs(a.delta) >= 20).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 25);

  const ut = {
    url: URL, viewport: { w: BREDD, h: HOJD, dpr: DPR },
    ts: new Date().toISOString(),
    fore: foreStabil, efter,
    docHDelta: efter.docH - foreStabil.docH,
    attribution: attr,
    aktaHojder: { register: stat(regR), utvalt: stat(utvR),
      perKort: renderade.sort((a, b) => a.klass.localeCompare(b.klass) || a.idx - b.idx) },
  };
  writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
  console.log(`docH ${foreStabil.docH} → ${efter.docH} = Δ${ut.docHDelta} px`);
  for (const a of attr.slice(0, 12)) console.log(`  ${a.delta > 0 ? '+' : ''}${a.delta}`.padStart(7), ` ${a.sig.slice(0, 58)} (n=${a.n})`);
  console.log(`Skriven: ${UTFIL}`);
  ws.close();
} finally {
  chrome.kill();
}
