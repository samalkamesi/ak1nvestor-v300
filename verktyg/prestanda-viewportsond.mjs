#!/usr/bin/env node
/**
 * AK1A — VIEWPORT-/PREFETCH-SOND (SPÅR 7 — attribueringsbevisning).
 *
 * Fråga: vilka länkar ligger i viewport VID LOAD på mobil, vilka _rsc-
 * flighter gick under samma fönster — och VILKEN länk äger dem? Tre lager:
 *   1. Geometri: alla intressanta <a> + rect + iViewport (mobil 412×823,
 *      Lighthouse-klass deviceMetricsOverride — ingen throttle, geometrin
 *      är målet).
 *   2. IO-audit: IntersectionObserver patchas i newDocument-script — loggar
 *      vilka länkar Next observerar, deras top VID OBSERVE och vilka som
 *      TRIGGAR (Next Link använder rootMargin, ej bara viewport).
 *   3. Initiator: CDP Network.requestWillBeSent → initiator-stack per
 *      _rsc-flight (Next-runtime-chunk som fattade fetchen).
 *
 * Födelse: o63 (2026-09-18) — vederlade o56-EFTER:s mikro-rads-attribuering:
 * band-kort top 841/1023 TRIGGADE @919 ms (rootMargin ~200 px under vecket
 * räknas som synliga), mikro-raden top 5249 aldrig. Använd före varje
 * prefetch-kur för att kirurga rätt länk på första försöket.
 *
 * Rå CDP via Node 22-global WebSocket — noll projektberoenden.
 *
 * Användning:
 *   node verktyg/prestanda-viewportsond.mjs <namn> [url]
 * Utdata:
 *   data/forskning/OPTIMERING/lighthouse/viewportsond-<namn>.json
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/";
const PORT = 9337;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `viewportsond-${NAMN}.json`);

const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--disable-gpu", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp(ws) {
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else if (msg.method) {
      events.push(msg);
    }
  });
  cdp.events = events;
  return (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (msg) => (msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)));
    ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

try {
  // vänta på DevTools-endpoint
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
  await send("Network.enable", {}, sessionId);

  // IO-audit: vilka länkar observeras, var ligger de VID OBSERVE, vem triggas?
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `(() => {
      window.__io_log = [];
      const OrigIO = window.IntersectionObserver;
      function Wrapper(cb, opts) {
        const io = new OrigIO(function (entries, obs) {
          try {
            window.__io_log.push({
              typ: "trigg", t: Math.round(performance.now()),
              lank: entries.filter(e => e.isIntersecting).map(e => ({
                href: e.target.getAttribute ? e.target.getAttribute("href") : null,
                top: Math.round(e.target.getBoundingClientRect().top),
              })),
            });
          } catch {}
          return cb(entries, obs);
        }, opts);
        const origObs = io.observe.bind(io);
        io.observe = (target) => {
          try {
            window.__io_log.push({
              typ: "observe", t: Math.round(performance.now()),
              href: target.getAttribute ? target.getAttribute("href") : null,
              top: Math.round(target.getBoundingClientRect().top),
            });
          } catch {}
          return origObs(target);
        };
        return io;
      }
      Wrapper.prototype = OrigIO.prototype;
      window.IntersectionObserver = Wrapper;
    })()`,
  }, sessionId);
  // Lighthouse-mobilgeometri: Moto G-class 412×823, dpr 2.627 (ingen throttle — geometri är målet)
  await send("Emulation.setDeviceMetricsOverride", {
    width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true,
  }, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);
  await sleep(5000); // flighter träffar ~1,3–2,3 s i FÖRE-bandet

  const { result } = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const vh = window.innerHeight;
      const lankar = [...document.querySelectorAll('a[href]')]
        .filter(a => /kurser|logga-in|verktyg|analyser|blogg|nyheter/.test(a.getAttribute('href')))
        .map((a, i) => {
          const r = a.getBoundingClientRect();
          return {
            i, href: a.getAttribute('href'),
            text: (a.textContent || '').trim().slice(0, 34),
            top: Math.round(r.top), bottom: Math.round(r.bottom),
            iViewport: r.top < vh && r.bottom > 0,
          };
        });
      const rsc = performance.getEntriesByType('resource')
        .filter(e => e.name.includes('_rsc='))
        .map(e => ({ url: e.name.split('?')[0], start: Math.round(e.startTime), storlek: e.transferSize }));
      return { vh, lankar, rsc, ioLog: window.__io_log || [], scrollY: window.scrollY, docH: Math.round(document.documentElement.scrollHeight) };
    })()`,
  }, sessionId);

  writeFileSync(UTFIL, JSON.stringify(result.value, null, 2));
  const v = result.value;
  console.log(`viewport ${v.vh}px · docH ${v.docH}px · _rsc-flighter ${v.rsc.length}`);
  for (const r of v.rsc) console.log(`  RSC ${r.url} · ${r.storlek} B @${r.start} ms`);
  for (const l of v.lankar.filter(l => l.iViewport)) console.log(`  I VIEWPORT ${l.href} "${l.text}" top=${l.top}`);
  console.log(`IO-logg (${v.ioLog.length}):`);
  for (const e of v.ioLog) {
    if (e.typ === "observe") console.log(`  OBSERVE @${e.t}ms ${e.href} top=${e.top}`);
    else for (const l of e.lank) console.log(`  TRIGGAT @${e.t}ms ${l.href} top=${l.top}`);
  }

  // Initiator-kallstackar ur CDP Network-händelserna — den definitiva ägaren
  const flights = cdp.events.filter(e =>
    e.method === "Network.requestWillBeSent"
    && e.params.request.url.includes("_rsc=")
  );
  console.log(`Initiatorer (${flights.length}):`);
  for (const f of flights) {
    const ini = f.params.initiator || {};
    const stack = (ini.stack && ini.stack.callFrames ? ini.stack.callFrames : [])
      .slice(0, 6).map(c => `${(c.functionName || "?").slice(0, 28)} @${(c.url || "").split("/").slice(-1)[0]}:${c.lineNumber}`);
    console.log(`  → ${f.params.request.url.split("?")[0]} [${ini.type}]`);
    for (const s of stack) console.log(`      ${s}`);
  }
  console.log(`Skriven: ${UTFIL}`);
  ws.close();
} finally {
  chrome.kill();
}
