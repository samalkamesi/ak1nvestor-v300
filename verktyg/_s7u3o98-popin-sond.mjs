#!/usr/bin/env node
/**
 * AK1A — o98-SOND: spegel-pop-in (o89 §5 / o97 §6.2) — FÖRE/EFTER-instrument.
 *
 * KurstipsKort (klientkomponent) renderar NULL i SSR-passet och fylls vid
 * hydratisering (+~364 px) — på /en/kurser + /ar/kurser sitter wrappern
 * (.cv-kurstips) I TOPPVYN ⇒ KursSok-gridden knuffas ned ⇒ CLS ~0,2.
 * Denna sond mäter direkta bevis:
 *  (1) layout-shifts MED attribution (PerformanceObserver layout-shift,
 *      sources[].node/previousRect/currentRect) under LH-lika villkor
 *      (CPU-throttling + nätverkstrottling — fyllningen hamnar EFTER första
 *      måleriet, som i Lighthouse-mobilspåret),
 *  (2) wrapperns höjd-TIDSLINJE (samplad var 50 ms): höjd 0 vid SSR-måleriet
 *      → fylld höjd vid hydratisering, per språk × bredd = kur-golv-kalibrering,
 *  (3) Slutläge: wrapperruta, kort-ruta, antal tips-li, rubriktext, docH.
 *
 * Läge "nojs" (Emulation.setScriptExecutionDisabled) mäterrena SSR-boxen —
 * bevis på att första passt är TOMT (rotens första halva).
 *
 * Användning: node verktyg/_s7u3o98-popin-sond.mjs <namn> [url] [mobil|desktop] [js|nojs]
 * Utdata: data/forskning/OPTIMERING/lighthouse/o98popin-<namn>.json
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/en/kurser";
const GEO = process.argv[4] || "mobil";
const LAGE = process.argv[5] || "js";
const VP = GEO === "desktop"
  ? { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }
  : { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true };
const PORT = 9363;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `o98popin-${NAMN}.json`);

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

/** Kör i sidan FÖRE navigering: shift-observer + höjdtidslinje. */
const INJICERA = `(() => {
  window.__o98 = { shifts: [], tidslinje: [] };
  const kortSokvag = (el) => {
    if (!el) return "?";
    const klass = (typeof el.className === "string" && el.className) ? "." + el.className.trim().split(/\\s+/).slice(0,3).join(".") : "";
    const text = (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 40);
    return el.tagName.toLowerCase() + klass + (text ? ' "' + text + '"' : "");
  };
  new PerformanceObserver((lista) => {
    for (const e of lista.getEntries()) {
      window.__o98.shifts.push({
        varde: Math.round(e.value * 100000) / 100000,
        start: Math.round(e.startTime),
        kallor: (e.sources || []).slice(0, 4).map((s) => ({
          nod: kortSokvag(s.node),
          fore: s.previousRect ? { y: Math.round(s.previousRect.y), h: Math.round(s.previousRect.height) } : null,
          efter: s.currentRect ? { y: Math.round(s.currentRect.y), h: Math.round(s.currentRect.height) } : null,
        })),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
  let senaste = null;
  const prova = () => {
    const w = document.querySelector(".cv-kurstips");
    const h = w ? Math.round(w.getBoundingClientRect().height) : null;
    const li = w ? w.querySelectorAll("li").length : 0;
    if (h !== senaste) {
      senaste = h;
      window.__o98.tidslinje.push({ t: Math.round(performance.now()), h, li });
    }
  };
  prova();
  const timer = setInterval(prova, 50);
  setTimeout(() => clearInterval(timer), 25000);
  // Nodtopps-tidslinje (o98 §1b): var 100 ms — h1/notis/wrapper/grid-topp +
  // grid-höjd + docH + scrollY. Avslöjar VILKEN nod som växer/krymper när.
  window.__o98.topp = [];
  const samlaNoder = () => {
    const r = (el) => el ? { y: Math.round(el.getBoundingClientRect().top), h: Math.round(el.getBoundingClientRect().height) } : null;
    const grid = document.querySelector("div.mt-6.grid.gap-6");
    window.__o98.topp.push({
      t: Math.round(performance.now()),
      h1: r(document.querySelector("h1")),
      notis: r(document.querySelector('[role="note"]')),
      wrapper: r(document.querySelector(".cv-kurstips")),
      grid: r(grid),
      docH: document.documentElement.scrollHeight,
      scrollY: Math.round(window.scrollY),
    });
  };
  const topTimer = setInterval(samlaNoder, 100);
  setTimeout(() => clearInterval(topTimer), 20000);
})();`;

/** Slutläge: allt kalibreringen behöver. */
const SLUT = `(() => {
  const w = document.querySelector(".cv-kurstips");
  const sektion = w ? w.querySelector("section") : null;
  const rubrik = sektion ? sektion.querySelector("h2") : null;
  const sokrad = document.querySelector("input[type=search], input[placeholder*='kurs' i], .grid input");
  return {
    lang: document.documentElement.lang,
    docH: Math.round(document.documentElement.scrollHeight),
    wrapper: w ? {
      rect: { y: Math.round(w.getBoundingClientRect().top + window.scrollY), h: Math.round(w.getBoundingClientRect().height) },
      li: w.querySelectorAll("li").length,
      minHeight: getComputedStyle(w).minHeight,
      rubrik: rubrik ? rubrik.textContent.trim() : null,
      sektionH: sektion ? Math.round(sektion.getBoundingClientRect().height) : null,
    } : null,
    sokY: sokrad ? Math.round(sokrad.getBoundingClientRect().top + window.scrollY) : null,
    tidslinje: window.__o98 ? window.__o98.tidslinje : [],
    shifts: window.__o98 ? window.__o98.shifts : [],
    topp: (() => {
      if (!window.__o98) return [];
      const nyckel = (x) => JSON.stringify([x.h1, x.notis, x.wrapper, x.grid, x.docH, x.scrollY]);
      const rader = window.__o98.topp;
      return rader.filter((x, i) => i === 0 || i === rader.length - 1 || nyckel(x) !== nyckel(rader[i - 1]));
    })(),
  };
})();`;

try {
  let version;
  for (let i = 0; i < 40 && !version; i++) {
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
  await send("Emulation.setDeviceMetricsOverride", VP, sessionId);
  if (LAGE === "js") {
    // LH-mobilprofilen: 4x CPU + Fast-3G-liknande nät — fyllningen hamnar
    // reproducerbart efter första måleriet (o89:s fönsterkänslighet bortkopplad).
    await send("Emulation.setCPUThrottlingRate", { rate: 4 }, sessionId);
    await send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6, uploadThroughput: 750e3 }, sessionId);
  } else {
    await send("Emulation.setScriptExecutionDisabled", { disabled: true }, sessionId);
  }
  await send("Page.addScriptToEvaluateOnNewDocument", { source: INJICERA }, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);

  // Vänta in hydration + fyllning + stabilisering (trottling gör den sen).
  await sleep(LAGE === "js" ? 15000 : 5000);
  const slut = (await send("Runtime.evaluate", { expression: SLUT, returnByValue: true }, sessionId)).result.value;

  console.log(`[${NAMN}] ${URL} @${GEO} ${LAGE} · lang ${slut.lang} · docH ${slut.docH}`);
  if (slut.wrapper) {
    console.log(`  wrapper: y ${slut.wrapper.rect.y} · h ${slut.wrapper.rect.h} · sektionH ${slut.wrapper.sektionH} · li ${slut.wrapper.li} · min-height "${slut.wrapper.minHeight}" · rubrik "${slut.wrapper.rubrik}"`);
  } else {
    console.log("  wrapper: SAKNAS");
  }
  const tl = slut.tidslinje || [];
  if (tl.length > 1) console.log(`  tidslinje: ${tl.map((t) => `${t.t}ms:${t.h}px(${t.li}li)`).join(" → ")}`);
  else if (tl.length === 1) console.log(`  tidslinje: stabil ${tl[0].h}px (${tl[0].li} li) — ingen höjdändring fångad`);
  const sh = slut.shifts || [];
  console.log(`  shifts: ${sh.length} st · ΣCLS ${sh.reduce((a, s) => a + s.varde, 0).toFixed(4)}`);
  for (const s of sh.slice(0, 8)) {
    console.log(`    ${s.varde.toFixed(4)} @${s.start}ms — ${s.kallor.map((k) => `${k.nod} y${k.fore ? k.fore.y : "?"}→${k.efter ? k.efter.y : "?"}`).join(" | ").slice(0, 220)}`);
  }
  for (const t of (slut.topp || []).slice(0, 30)) {
    const k = (x) => x ? `y${x.y}/h${x.h}` : "–";
    console.log(`    @${t.t}ms h1 ${k(t.h1)} · notis ${k(t.notis)} · wrap ${k(t.wrapper)} · grid ${k(t.grid)} · docH ${t.docH} · scr ${t.scrollY}`);
  }

  writeFileSync(UTFIL, JSON.stringify({ url: URL, namn: NAMN, geo: GEO, lage: LAGE, vp: VP, ts: Date.now(), ...slut }, null, 1));
  console.log(`→ ${UTFIL}`);
} finally {
  chrome.kill("SIGKILL");
}
