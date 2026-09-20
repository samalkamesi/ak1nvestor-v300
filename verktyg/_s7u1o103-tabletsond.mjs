#!/usr/bin/env node
/**
 * AK1A — TABLETSOND o103 (SPÅR 7 — utvalt-kortens 768–1 024-läge; o92 §5.4 →
 * o97 §6.3 → o101 §6.3).
 *
 * Fråga: bär utvalt-kortens md+-platshållare (flagg 45.5rem · nya 45.5rem ·
 * borja 12.75rem — kalibrerade vid 1 280) hela tablet-bandet, eller finns en
 * höjdspricka som ger stavhopp när korten renderas vid scroll?
 *
 * Metod (u2:s _s7u2o96-blocksond-mönster, riktat mot utvalt-sektionerna):
 *   1. TOPP-snapshot: per sektion (cv-utvalt-flagg/nya/borja) — wrapperns box
 *      + per li.cv-utvalt: computed contain-intrinsic-size (deklarerad
 *      platshållare), rect-höjd (ospårat läge), synlighet vid topp.
 *   2. Långsam fram-scroll till botten (500 px/300 ms) + docH-stabilisering.
 *   3. EFTER-snapshot: verklig höjd per kort; Δ per kort + Σ|Δ| per sektion.
 *   4. Kriterium (förhand i anspråket): Σ|Δ| ≤ 50 px per sektion = nivån håller.
 *
 * RAM-vakt: vägrar starta under 450 MB MemAvailable (fabriksregeln —
 * en chrome i taget, sekventiellt). finally-kill alltid.
 *
 * Användning:
 *   node verktyg/_s7u1o102-tabletsond.mjs <namn> [url] [bredd höjd dpr]
 * Utdata:
 *   data/forskning/OPTIMERING/lighthouse/tabletsond-s7u1o103-<namn>.json
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/kurser";
const BREDD = Number(process.argv[4] || 768);
const HOJD = Number(process.argv[5] || 800);
const DPR = Number(process.argv[6] || 1);
const MOBIL = BREDD < 768;
const PORT = 9347;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `tabletsond-s7u1o103-${NAMN}.json`);

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
  const SEKT = ['.cv-utvalt-flagg', '.cv-utvalt-nya', '.cv-utvalt-borja'];
  const sektioner = [];
  for (const sel of SEKT) {
    const wrap = document.querySelector(sel);
    if (!wrap) { sektioner.push({ sel, saknas: true }); continue; }
    const wr = wrap.getBoundingClientRect();
    const kort = [...wrap.querySelectorAll('.cv-utvalt')].map((el) => {
      const r = el.getBoundingClientRect();
      const cis = getComputedStyle(el).containIntrinsicSize || '';
      return {
        deklarerad: cis,
        h: Math.round(r.height),
        top: Math.round(r.top),
        synligVidTopp: r.top < window.innerHeight + 100,
      };
    });
    sektioner.push({ sel, wrapTop: Math.round(wr.top), wrapH: Math.round(wr.height), kort });
  }
  return {
    docH: Math.round(document.documentElement.scrollHeight),
    scrollY: Math.round(window.scrollY),
    innerH: window.innerHeight,
    lang: document.documentElement.lang,
    sektioner,
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

// "auto 728px" → 728 (px-tal; rem redan upplöst av computed style)
function cisPx(s) {
  const m = /(\d+(\.\d+)?)px/.exec(s || "");
  return m ? Math.round(parseFloat(m[1])) : null;
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

  const topp = await snapshot(send, sessionId);
  await stabilisera(send, sessionId, 3, 8000);
  const toppStabil = await snapshot(send, sessionId);
  console.log(`TOPP  docH ${toppStabil.docH} · lang ${toppStabil.lang}`);
  for (const s of toppStabil.sektioner) {
    if (s.saknas) { console.log(`  ${s.sel}: SAKNAS`); continue; }
    const n = s.kort.length;
    const cis = s.kort.map((k) => cisPx(k.deklarerad));
    console.log(`  ${s.sel}: wrap ${s.wrapH}px @${s.wrapTop} · ${n} kort · platshållare ${[...new Set(cis)].join('/')}px · toppH ${s.kort.map((k) => k.h).join('/')}`);
  }

  // Fram-scroll: långsam till botten
  for (let i = 0; i < 200; i++) {
    await send("Runtime.evaluate", { expression: "window.scrollBy(0,500)" }, sessionId);
    await sleep(300);
    const h = await docH(send, sessionId);
    const y = (await send("Runtime.evaluate",
      { returnByValue: true, expression: "Math.round(window.scrollY + window.innerHeight)" }, sessionId)).result.value;
    if (y >= h - 2) break;
  }
  await sleep(2500); // sista fyllningarna landar
  await stabilisera(send, sessionId, 4, 20000);
  const efter = await snapshot(send, sessionId);
  console.log(`EFTER docH ${efter.docH} (Δ${efter.docH - toppStabil.docH})`);

  // Analys: per sektion — Δ per kort (verklig − platshållare), Σ|Δ|
  const analys = efter.sektioner.map((s) => {
    if (s.saknas) return { sel: s.sel, saknas: true };
    const kort = s.kort.map((k, i) => {
      const plat = cisPx(k.deklarerad);
      const toppKort = toppStabil.sektioner.find((t) => t.sel === s.sel)?.kort?.[i] || null;
      return {
        deklareradPx: plat,
        hTopp: toppKort ? toppKort.h : null,
        synligVidTopp: toppKort ? toppKort.synligVidTopp : null,
        hEfter: k.h,
        deltaPerKort: plat != null ? k.h - plat : null,
      };
    });
    const sumAbsDelta = kort.reduce((a, k) => a + Math.abs(k.deltaPerKort || 0), 0);
    return {
      sel: s.sel,
      wrapHTopp: (toppStabil.sektioner.find((t) => t.sel === s.sel) || {}).wrapH ?? null,
      wrapHEfter: s.wrapH,
      kort,
      sumAbsDelta,
      halten: sumAbsDelta <= 50 ? "NIVÅN HÅLLER (Σ|Δ| ≤ 50)" : "SPRICKA (Σ|Δ| > 50)",
    };
  });

  const ut = {
    url: URL, viewport: { w: BREDD, h: HOJD, dpr: DPR, mobile: MOBIL },
    ts: new Date().toISOString(),
    kriterium: "Σ|Δ| ≤ 50 px per sektion (o97-flaggens mått, förhand i anspråket)",
    topp: toppStabil, efter,
    docHDelta: efter.docH - toppStabil.docH,
    analys,
  };
  writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
  console.log(`Analys:`);
  for (const a of analys) {
    if (a.saknas) { console.log(`  ${a.sel}: SAKNAS`); continue; }
    console.log(`  ${a.sel}: Σ|Δ| ${a.sumAbsDelta}px — ${a.halten} · per kort [${a.kort.map((k) => k.deltaPerKort).join(', ')}]`);
  }
  console.log(`Skriven: ${UTFIL}`);
  ws.close();
} finally {
  chrome.kill();
}
