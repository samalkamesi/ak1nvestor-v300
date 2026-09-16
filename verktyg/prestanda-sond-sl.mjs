#!/usr/bin/env node
/**
 * AK1A — STYLE & LAYOUT-SOND (spår 7, o18 §4.2 → o20).
 *
 * Svarar på: VAD äter "Style & Layout"-tid på en sida, och VILKEN kod
 * triggar det? Lighthouse rapporterar bara summan (mainthread-work-
 * breakdown) — denna sond tar en riktig DevTools-trace under samma
 * villkor som Lighthouse-mobil (390×844, 4× CPU-throttle) och bryter
 * ner UpdateLayoutTree (style recalc) + Layout per utlösare.
 *
 * Metod:
 *  1. Headless Chrome + CDP, mobil-emulering + Emulation.setCPUThrottlingRate 4
 *     (samma multiplier som Lighthouses observerade main-thread-siffror).
 *  2. Tracing.start på PAGE-sessionen med "-*,devtools.timeline" — BEVISAT
 *     i Chrome 153 (tracing-protokollfynd 2026-09-16): browser-endpointen
 *     levererar 0 events; kategorin disabled-by-default-devtools.timeline.stack
 *     döder ALL tracing i kombination här; utan -* blir det också tomt.
 *  3. Navigera, vänta load + eftersläpning (lazy-fetch/skeletons får göra sitt).
 *  4. Completa (ph=X) trace-events är hierarkiska per thread (pid/tid):
 *     för varje UpdateLayoutTree/Layout hittas den omslutande utlösaren
 *     (FunctionCall/TimerFire/EventDispatch/V8.Execute/RunTask) via
 *     intervallnästling, plus beginData.elements (antal restylade noder),
 *     tidpunkt sedan navigeringens start och "stackTrace" om något event
 *     bär en (FunctionCall bär ibland args.data.stackTrace utan stack-kategori).
 *
 * Användning:
 *   node verktyg/prestanda-sond-sl.mjs [bas] [utfil.json] [sida ...]
 *   node verktyg/prestanda-sond-sl.mjs http://localhost:3000 /tmp/sl.json /kurser
 *
 * Inga npm-paket (node >=22 WebSocket). Skrivskyddad mot projektet.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BAS = process.argv[2] || "http://localhost:3000";
const UTFIL = process.argv[3] || "/tmp/ak1a-sond-sl.json";
const SIDOR = process.argv.slice(4).length ? process.argv.slice(4) : ["/kurser"];
const PORT = 9337;
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

function cdp(ws) {
  let id = 0;
  const vantar = new Map();
  const lyssnare = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && vantar.has(msg.id)) {
      const { resolve, reject } = vantar.get(msg.id);
      vantar.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      for (const l of lyssnare) l(msg);
    }
  };
  const oppen = new Promise((res, rej) => {
    ws.onopen = () => res();
    ws.onerror = (e) => rej(new Error("websocket: " + e.message));
  });
  return {
    oppen,
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const mid = ++id;
        vantar.set(mid, { resolve, reject });
        ws.send(JSON.stringify({ id: mid, method, params }));
      }),
    on: (fn) => lyssnare.push(fn),
    stang: () => ws.close(),
  };
}

async function waitForJson(url, tentatives = 40) {
  for (let i = 0; i < tentatives; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch {}
    await SLEEP(250);
  }
  throw new Error(`når inte ${url}`);
}

/** Stacksträng — filnamn:rad + funktionsnamn, max 6 ramar. */
function stackStr(st) {
  if (!Array.isArray(st)) return null;
  return st
    .slice(0, 6)
    .map((f) => {
      const fil = (f.url || "").split("/").slice(-1)[0] || "<anon>";
      return `${f.functionName || "<anonym>"}@${fil}:${f.lineNumber + 1}`;
    })
    .join("  <-  ");
}

async function sondSida(conn, url) {
  const chunks = [];
  let klar = null;
  let lastOk = null;
  const hantera = (msg) => {
    const { method, params } = msg;
    if (method === "Tracing.dataCollected") {
      // Chrome 153: fältet heter "value" (protokollfynd 2026-09-16) —
      // läs båda för bakåtkompatibilitet.
      const arr = params.chunk ?? params.value;
      if (Array.isArray(arr)) chunks.push(...arr);
    } else if (method === "Tracing.tracingComplete") klar = true;
    else if (method === "Page.loadEventFired") lastOk = true;
  };
  conn.on(hantera);

  // VIKTIGT (protokollfynd 2026-09-16, Chrome 153): SIDAN får ENBART ha
  // Page-domänen aktiv när Tracing.start körs — Network.enable, Emulation.*
  // (även via en annan session på samma target) gör att tracingComplete
  // levereras UTAN alla dataCollected-chunks. Kall cache garanteras i
  // stället av färsk user-data-dir per körning; mobilvy av --window-size
  // (390×844 < 640px-brytpunkten). CPU-throttle (Emulation) är alltså
  // OTILLGÄNLIG i kombination med tracing här: dur-värdena nedan är
  // OTHROTTLADE — Lighthouse-mobilens "Style & Layout" ≈ 4× dessa.
  await conn.send("Page.enable");
  await conn.send("Tracing.start", {
    transferMode: "ReportEvents",
    categories: "-*,devtools.timeline",
  });

  const startTs = Date.now();
  await conn.send("Page.navigate", { url });
  const deadline = Date.now() + 30000;
  while (!lastOk && Date.now() < deadline) await SLEEP(100);
  await SLEEP(6000); // eftersläpning: lazy-fetch, skeletons, IO
  await conn.send("Tracing.end");
  const traceDeadline = Date.now() + 20000;
  while (!klar && Date.now() < traceDeadline) await SLEEP(200);

  // ── Parsning ────────────────────────────────────────────────────────────
  const X = chunks.filter((e) => e.ph === "X");
  const perNamn = new Map();
  for (const e of X) {
    const rad = perNamn.get(e.name) || { antal: 0, totalMs: 0, maxMs: 0 };
    rad.antal++;
    rad.totalMs += e.dur / 1000;
    rad.maxMs = Math.max(rad.maxMs, e.dur / 1000);
    perNamn.set(e.name, rad);
  }

  // Per thread: sortera på ts; omslutande förälder = sista event som börjat
  // FÖRE e.ts och slutar EFTER e.ts+e.dur (intervallnästling, djupet hårt).
  const UTLOSARNAMN = /^(FunctionCall|TimerFire|EventDispatch|V8\.Execute|RequestAnimationFrame|FireAnimationFrame)$/;
  const threads = new Map();
  for (const e of X) {
    const k = `${e.pid}/${e.tid}`;
    if (!threads.has(k)) threads.set(k, []);
    threads.get(k).push(e);
  }
  for (const arr of threads.values()) arr.sort((a, b) => a.ts - b.ts);

  function utlosareTill(e) {
    const arr = threads.get(`${e.pid}/${e.tid}`);
    if (!arr) return null;
    let bast = null;
    for (const other of arr) {
      if (other === e) continue;
      if (other.ts <= e.ts && other.ts + other.dur >= e.ts + e.dur) {
        if (UTLOSARNAMN.test(other.name)) bast = other; // ytter/viktigast
        else if (!bast && other.name === "RunTask") bast = other; // fallback
        // fortsätt — yttermre matchning kan komma
      }
      if (other.ts > e.ts) break;
    }
    return bast;
  }

  const t0 = Math.min(...X.map((e) => e.ts), Infinity);
  const STOR = 8; // ms
  const slEvents = X.filter((e) => e.name === "UpdateLayoutTree" || e.name === "Layout");
  const stora = slEvents
    .filter((e) => e.dur / 1000 >= STOR)
    .map((e) => {
      const u = utlosareTill(e);
      return {
        event: e.name,
        atMs: Math.round((e.ts - t0) / 1000),
        durMs: Math.round(e.dur / 1000),
        elements: e.args?.beginData?.elements ?? null,
        partialLayout: e.args?.beginData?.partialLayout ?? null,
        utlosare: u ? u.name : null,
        utlosareDurMs: u ? Math.round(u.dur / 1000) : null,
        utlosareStack: stackStr(u?.args?.data?.stackTrace),
        utlosareDataUrl: u?.args?.data?.url || u?.args?.data?.fileName || null,
      };
    })
    .sort((a, b) => b.durMs - a.durMs);

  // Alla S&L summerade per utlösare-namn + per elementstorlek
  const perUtlosare = new Map();
  for (const e of slEvents) {
    const u = utlosareTill(e);
    const nyckel = u ? u.name : "(ingen — eget task)";
    const rad = perUtlosare.get(nyckel) || { antal: 0, totalMs: 0 };
    rad.antal++;
    rad.totalMs += e.dur / 1000;
    perUtlosare.set(nyckel, rad);
  }

  const elementHistogram = slEvents
    .map((e) => ({ namn: e.name, elements: e.args?.beginData?.elements ?? 0, durMs: e.dur / 1000 }))
    .filter((x) => x.elements > 0)
    .sort((a, b) => b.elements - a.elements)
    .slice(0, 15);

  // Funktioner/URL:er i FunctionCall med lång dur (för koppling till bundlar)
  const tungaCalls = X.filter((e) => e.name === "FunctionCall" && e.dur / 1000 >= 30)
    .map((e) => ({
      atMs: Math.round((e.ts - t0) / 1000),
      durMs: Math.round(e.dur / 1000),
      url: e.args?.data?.url || e.args?.data?.fileName || null,
      stack: stackStr(e.args?.data?.stackTrace),
    }))
    .sort((a, b) => b.durMs - a.durMs)
    .slice(0, 20);

  return {
    url,
    vaggtidS: Math.round((Date.now() - startTs) / 1000),
    traceEvents: chunks.length,
    sammanfattning: [...perNamn.entries()]
      .map(([namn, v]) => ({ namn, ...v, totalMs: Math.round(v.totalMs), maxMs: Math.round(v.maxMs) }))
      .sort((a, b) => b.totalMs - a.totalMs)
      .slice(0, 30),
    slTotalMs: Math.round(slEvents.reduce((a, e) => a + e.dur / 1000, 0)),
    slAntal: slEvents.length,
    slPerUtlosare: [...perUtlosare.entries()]
      .map(([namn, v]) => ({ utlosare: namn, ...v, totalMs: Math.round(v.totalMs) }))
      .sort((a, b) => b.totalMs - a.totalMs),
    storSLOchLayout: stora.slice(0, 40),
    elementTopp: elementHistogram,
    tungaFunctionCalls: tungaCalls,
  };
}

async function main() {
  const profil = mkdtempSync(join(tmpdir(), "ak1a-sl-"));
  const chrome = spawn(
    "/usr/bin/google-chrome",
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--mute-audio",
      "--window-size=390,844",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profil}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  console.error(`chrome pid ${chrome.pid}, väntar på CDP ...`);
  try {
    const version = await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
    console.error(`chrome ${version.Browser}`);
    const nySida = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
    const ws = new WebSocket(nySida.webSocketDebuggerUrl);
    const conn = cdp(ws);
    await conn.oppen;
    const resultat = [];
    for (const sida of SIDOR) {
      console.error(`sonder ${sida} ...`);
      resultat.push(await sondSida(conn, BAS + sida));
    }
    conn.stang();
    writeFileSync(UTFIL, JSON.stringify(resultat, null, 2));
    console.error(`skrev ${UTFIL}`);
    for (const r of resultat) {
      console.error(`\n=== ${r.url} — S&L total ${r.slTotalMs} ms över ${r.slAntal} event ===`);
      for (const s of r.slPerUtlosare) console.error(`${(s.utlosare || "?").padEnd(20)} n=${String(s.antal).padStart(4)}  total=${String(s.totalMs).padStart(6)} ms`);
      console.error(`--- största enskilda (top 10) ---`);
      for (const s of r.storSLOchLayout.slice(0, 10))
        console.error(`${s.event.padEnd(16)} ${String(s.durMs).padStart(5)} ms @${String(s.atMs).padStart(6)}  el=${String(s.elements).padStart(5)}  via ${s.utlosare || "?"}${s.utlosareStack ? "  " + s.utlosareStack.slice(0, 90) : ""}`);
      console.error(`--- elementtyngsta ---`);
      for (const s of r.elementTopp.slice(0, 5)) console.error(`${s.namn.padEnd(16)} el=${String(s.elements).padStart(5)}  dur=${Math.round(s.durMs)} ms`);
    }
  } finally {
    chrome.kill("SIGKILL");
  }
}

main().catch((e) => {
  console.error("SOND-FEL:", e.message);
  process.exit(1);
});
