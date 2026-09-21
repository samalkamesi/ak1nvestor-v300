#!/usr/bin/env node
/**
 * AK1A — SOND o143 (Spår 7, s7-u1): /dataset TBT+CLS-rotjakt.
 *
 * Arv: _s7u2o118-longtasksond.mjs (CDP-harness + longtask-attribution +
 * cpu-profiler + A/B-injektering) — utökat med (a) layout-shift-attribution
 * via PerformanceObserver med källnoder (tag+klass+rects), (b) resurs-
 * tidslinje för fonter/css/chunks, (c) LayoutShift-spårhändelser som backup.
 *
 * Användning: node verktyg/_s7u1o143-sond.mjs <namn> [sokvag …]
 * Utdata: data/forskning/OPTIMERING/lighthouse/sond-o143-<namn>.json
 * A/B: SOND_INJECT_CSS="<css>" injiceras före allt dokumentarbete.
 */
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const SIDOR = process.argv.length > 3 ? process.argv.slice(3) : ["/dataset"];
const BAS = process.env.LH_BAS || "http://localhost:3000";
const PORT = Number(process.env.SOND_PORT || 9361);
const SPAR_MS = Number(process.env.SOND_SPAR_MS || 12_000);
const THROTTLE = process.env.SOND_THROTTLE !== "0";
const UTFILKAT = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse");
mkdirSync(UTFILKAT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const kort = (u) => (u || "").split("/").slice(-1)[0] || "(dokumentet)";

function startaChrome(port) {
  const dir = `/tmp/sond-o143-${port}-${Date.now()}`;
  return spawn("/usr/bin/google-chrome", [
    "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
    // o143-metrologi: utan detta lastar mät-Chrome Docs-Offline-tillägget
    // (chrome-extension://ghbmnnjooekpmoecnnnilnnbdlolhkhi) vars
    // service_worker_bin_prod.js äter 200–330 ms i longtask-attributionen.
    "--disable-extensions",
    `--remote-debugging-port=${port}`, "--disable-gpu",
    `--user-data-dir=${dir}`, "about:blank",
  ], { stdio: "ignore" });
}

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
  return {
    send: (method, params = {}, sessionId) =>
      new Promise((resolve, reject) => {
        const mid = ++id;
        pending.set(mid, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)));
        ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
      }),
    events,
  };
}

async function startaTracing(send) {
  await send("Tracing.start", {
    transferMode: "ReportEvents",
    traceConfig: {
      includedCategories: [
        "devtools.timeline",
        "disabled-by-default-devtools.timeline",
        "disabled-by-default-v8.cpu_profiler",
        "blink.user_timing",
      ],
      excludedCategories: ["*"],
    },
  });
}

async function stampaTracing(send, events, timeoutMs = 15_000) {
  await send("Tracing.end");
  const slut = Date.now() + timeoutMs;
  while (Date.now() < slut) {
    if (events.some((e) => e.method === "Tracing.tracingComplete")) break;
    await sleep(200);
  }
  return events.filter((e) => e.method === "Tracing.dataCollected").flatMap((e) => e.params.value ?? []);
}

/** Skift- + resursobservatorn: körs före allt annat dokumentarbete. */
const OBSERVATOR_JS = `(() => {
  window.__shifts = [];
  window.__res = [];
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__shifts.push({
          ts: Math.round(e.startTime),
          score: Math.round(e.value * 10000) / 10000,
          kallor: (e.sources || []).map((s) => {
            const n = s && s.node;
            if (!n) return "?";
            if (n instanceof Element) {
              const kl = typeof n.className === "string" && n.className ? "." + n.className.trim().split(/\\s+/).slice(0, 3).join(".") : "";
              return n.tagName.toLowerCase() + kl;
            }
            return "#" + (n.nodeName || "node");
          }).slice(0, 6),
          huvudrect: (() => {
            const s = e.sources && e.sources[0];
            if (!s || !s.previousRect || !s.currentRect) return null;
            const r = (x) => [Math.round(x.x), Math.round(x.y), Math.round(x.width), Math.round(x.height)];
            return { fran: r(s.previousRect), till: r(s.currentRect) };
          })(),
          vidInput: e.hadRecentInput === true,
        });
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (/\\.js$|\\.css$|\\.woff|font|ikon|sw$|worker|craw/i.test(e.name)) {
          window.__res.push({
            n: e.name.split("/").slice(-1)[0].slice(0, 70),
            start: Math.round(e.startTime),
            klar: Math.round(e.responseEnd),
            typ: e.initiatorType,
            storlek: e.transferSize || 0,
          });
        }
      }
    }).observe({ type: "resource", buffered: true });
  } catch (e) {}
})()`;

function analysera(traceEvents, fcpTs) {
  const ev = traceEvents.filter((e) => e.ph === "X" || e.ph === "I");
  const tasks = ev
    .filter((e) => e.name === "RunTask" && e.dur > 50_000)
    .sort((a, b) => a.ts - b.ts);

  const profilerNoder = new Map();
  const profilerSamples = [];
  const profilMeta = new Map();
  for (const e of traceEvents) {
    if (e.name === "Profile" && e.args?.data?.profile) {
      const p = e.args.data.profile;
      profilMeta.set(p.id, true);
      for (const n of p.nodes ?? []) profilerNoder.set(n.id, n);
      profilerSamples.push({ id: p.id, samples: p.samples ?? [], deltas: p.timeDeltas ?? [], ts: e.ts });
    } else if (e.name === "ProfileChunk" && e.args?.data) {
      const d = e.args.data;
      if (d.cpuProfile?.nodes) for (const n of d.cpuProfile.nodes) profilerNoder.set(n.id, n);
      const target = profilerSamples.find((p) => p.id === d.id) ?? (profilMeta.has(d.id) ? (profilerSamples.push({ id: d.id, samples: [], deltas: [], ts: e.ts }), profilerSamples[profilerSamples.length - 1]) : null);
      if (target) {
        target.samples.push(...(d.cpuProfile?.samples ?? []));
        target.deltas.push(...(d.timeDeltas ?? []));
      }
    }
  }
  const samplePunkter = [];
  for (const p of profilerSamples) {
    let t = p.ts;
    for (let i = 0; i < p.samples.length; i++) {
      t += p.deltas[i] ?? 100;
      samplePunkter.push({ ts: t, nod: p.samples[i] });
    }
  }

  const ATTR_NAMN = new Set([
    "EvaluateScript", "v8.compile", "FunctionCall", "v8.runMicrotasks",
    "TimerFire", "EventDispatch", "FireAnimationFrame", "RequestAnimationFrame",
    "UpdateLayoutTree", "Layout", "RecalculateStyles", "ParseHTML",
    "CompileScript", "v8.compileModule",
  ]);
  const fonsterSlut = fcpTs + 5_000_000;
  const langtasks = [];
  for (const t of tasks) {
    const start = t.ts, slutTs = t.ts + t.dur;
    const barn = ev.filter((e) => e.ts >= start && e.ts < slutTs && e.name !== "RunTask" && ATTR_NAMN.has(e.name) && (e.dur ?? 0) > 300);
    const attr = barn.map((b) => {
      const d = b.args?.data ?? {};
      const url = d.url || d.stackTrace?.[0]?.url || "";
      return { namn: b.name, url: url.slice(0, 130), urlFil: kort(url), funktion: d.functionName || d.stackTrace?.[0]?.functionName || "", dur: Math.round((b.dur ?? 0) / 1000) };
    });
    const samples = samplePunkter.filter((s) => s.ts >= start && s.ts < slutTs);
    const selfTime = new Map();
    for (const s of samples) {
      const nod = profilerNoder.get(s.nod);
      const cf = nod?.callFrame;
      if (!cf) continue;
      const key = `${cf.functionName || "(anonym)"} ${kort(cf.url)}:${cf.lineNumber ?? 0}`;
      selfTime.set(key, (selfTime.get(key) ?? 0) + 1);
    }
    langtasks.push({
      start: Math.round(start / 1000), dur: Math.round(t.dur / 1000),
      blocking: Math.round((t.dur - 50_000) / 1000),
      iFonstretFCP5s: fcpTs != null && start >= fcpTs && start < fonsterSlut,
      attr: attr.sort((a, b) => b.dur - a.dur).slice(0, 8),
      toppFunktioner: [...selfTime.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => ({ k, samples: n })),
    });
  }
  const iFonstret = langtasks.filter((t) => t.iFonstretFCP5s);
  const allaTasks = ev.filter((e) => e.name === "RunTask");
  const totaltArbeteFonster = allaTasks
    .filter((t) => fcpTs != null && t.ts >= fcpTs && t.ts < fonsterSlut)
    .reduce((a, t) => a + t.dur, 0);
  const layoutShiftsTrace = ev
    .filter((e) => e.name === "LayoutShift")
    .map((e) => ({ tsUs: e.ts, score: e.args?.data?.score ?? null }))
    .sort((a, b) => a.tsUs - b.tsUs);
  return {
    antalLangtasks: langtasks.length,
    tbtFonsterFCP5s: iFonstret.reduce((a, t) => a + t.blocking, 0),
    totaltCpuArbeteFCP5s: Math.round(totaltArbeteFonster / 1000),
    layoutTotalTrace: Math.round(ev.filter((e) => e.name === "Layout").reduce((a, t) => a + (t.dur ?? 0), 0) / 1000),
    layoutShiftsTrace,
    langtasks,
    aggregerat: (() => {
      const perKalla = new Map();
      for (const t of iFonstret) for (const a of t.attr) {
        const key = `${a.namn}:${a.url || a.funktion || "?"}`;
        perKalla.set(key, (perKalla.get(key) ?? 0) + a.dur);
      }
      return [...perKalla.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, ms]) => ({ kalla: k, ms }));
    })(),
    aggregeratFunktioner: (() => {
      const perFn = new Map();
      for (const t of iFonstret) for (const f of t.toppFunktioner) {
        perFn.set(f.k, (perFn.get(f.k) ?? 0) + f.samples);
      }
      return [...perFn.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => ({ funktion: k, samples: n }));
    })(),
  };
}

async function matSida(send, events, sokvag) {
  events.length = 0;
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Network.enable", {}, sessionId);
  await send("Network.setCacheDisabled", { cacheDisabled: true }, sessionId);
  // o143: Lighthouse mobil emulerar ÄVEN user agent — vissa serverskillnader
  // (VARY/UA-grenar) syns bara då. SOND_MOBILE_UA=1 slår på.
  if (process.env.SOND_MOBILE_UA) {
    await send("Emulation.setUserAgentOverride", {
      userAgent: "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse",
    }, sessionId);
  }
  await send("Page.addScriptToEvaluateOnNewDocument", { source: OBSERVATOR_JS }, sessionId);
  if (process.env.SOND_INJECT_CSS) {
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `(() => { const s = document.createElement("style"); s.textContent = ${JSON.stringify(process.env.SOND_INJECT_CSS)}; try { (document.head || document.documentElement).appendChild(s); } catch (e) {} })()`,
    }, sessionId);
  }
  await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true }, sessionId);
  // o143: drosslarna kopplade isär — SOND_CPU=4|x, SOND_NET=150|0 (ms RTT),
  // SOND_THROTTLE=1 ⇒ båda på (bakåtkompatibelt med o118-läget).
  const cpuRate = Number(process.env.SOND_CPU || (THROTTLE ? 4 : 0));
  const netLatens = process.env.SOND_NET !== undefined ? Number(process.env.SOND_NET) : THROTTLE ? 150 : 0;
  if (cpuRate > 0) await send("Emulation.setCPUThrottlingRate", { rate: cpuRate }, sessionId);
  if (netLatens > 0) {
    await send("Network.emulateNetworkConditions", {
      offline: false, latency: netLatens, downloadThroughput: Math.round(1.6 * 1024 * 1024 * 0.9), uploadThroughput: 750 * 1024,
    }, sessionId);
  }

  await startaTracing(send);
  await send("Page.navigate", { url: new URL(sokvag, BAS).href }, sessionId);
  await sleep(SPAR_MS);
  const traceEvents = await stampaTracing(send, events);
  const fcpEv = traceEvents.find((e) => e.name === "firstContentfulPaint");
  const analys = analysera(traceEvents, fcpEv ? fcpEv.ts : null);

  await send("Runtime.enable", {}, sessionId).catch(() => {});
  let domInfo = null;
  try {
    const r = await send("Runtime.evaluate", {
      expression: `JSON.stringify({ shifts: window.__shifts || [], res: (window.__res || []).slice(0, 40), fontsKlara: Math.round(performance.now()) })`,
      returnByValue: true,
    }, sessionId);
    domInfo = JSON.parse(r.result.value);
  } catch (e) {
    domInfo = { fel: String(e).slice(0, 200) };
  }
  await send("Target.closeTarget", { targetId }).catch(() => {});
  return {
    sokvag,
    fcpTs: fcpEv ? Math.round(fcpEv.ts / 1000) : null,
    traceEventAntal: traceEvents.length,
    ...analys,
    ...domInfo,
  };
}

async function matEnSida(sokvag, port) {
  const chrome = startaChrome(port);
  try {
    let version;
    for (let i = 0; i < 40; i++) {
      try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; }
      catch { await sleep(250); }
    }
    if (!version) throw new Error("DevTools svarade ej");
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    const { send, events } = await cdp(ws);
    const resultat = await matSida(send, events, sokvag);
    ws.close();
    return resultat;
  } finally {
    chrome.kill();
    await sleep(500);
  }
}

const resultat = [];
for (const s of SIDOR) {
  process.stdout.write(`Sond o143 ${s} … `);
  const r = await matEnSida(s, PORT + resultat.length);
  resultat.push(r);
  console.log(`FCP ${r.fcpTs} ms · ${r.antalLangtasks} longtasks · TBT(FCP+5s) ${r.tbtFonsterFCP5s} ms · LayoutTotal ${r.layoutTotalTrace} ms`);
  for (const a of r.aggregerat.slice(0, 5)) console.log(`   ${a.kalla}: ${a.ms} ms`);
  const shifts = (r.shifts || []).filter((x) => !x.vidInput && x.score >= 0.01);
  console.log(`   skift (PO, ≥0.01): ${shifts.map((x) => x.score + "@" + x.ts + "ms " + (x.kallor || []).join(" | ")).join(" ;; ") || "0"}`);
  for (const f of r.aggregeratFunktioner.slice(0, 5)) console.log(`   fn ${f.funktion}: ${f.samples} samples`);
}
const utfil = join(UTFILKAT, `sond-o143-${NAMN}.json`);
writeFileSync(utfil, JSON.stringify({ datum: new Date().toISOString(), bas: BAS, throttle: THROTTLE, sparMs: SPAR_MS, injeceradCss: process.env.SOND_INJECT_CSS ? "ja" : "nej", sidor: resultat }, null, 2));
console.log(`Skriven: ${utfil}`);
