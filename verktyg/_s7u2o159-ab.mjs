#!/usr/bin/env node
/**
 * AK1A — o159 (Spår 7, s7-u2): A/B-PARBEVIS av cv-bolagsektion-kuren på
 * /bolag — longtasks (TBT-proxy) i FCP+5s-fönstret med vs utan kur-CSS,
 * alternerande omgångar i samma lastläge, ny target per omgång (B:s
 * injektion läcker aldrig in i nästa A). Självverifierande: varje B-
 * omgång kontrollerar att stilen landade + platshållarhöjderna träffar.
 *
 * Kur-CSS:en approximerar den committade .cv-bolagsektion-regeln via
 * section:has(> div.overflow-x-auto) — samma sektioner i prod-DOM.
 * Injektionen via document-start-skript med pollningsfallback
 * (o159-läxan: documentElement kan saknas vid första körningen).
 * Throttle: CPU 4x + NET 150 ms — o143-sondens mobil-konfig.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";

const BAS = "http://localhost:3000";
const PORT = 9373;
const SIDA = "/bolag";
const RUNS = ["a3", "b3", "a4", "b4"];
const KUR_CSS =
  "@media (max-width: 640px) { section:has(> div.overflow-x-auto) { content-visibility: auto; contain-intrinsic-size: auto 87rem; } }";
const UTFIL = "data/forskning/OPTIMERING/lighthouse/ab-o159-bolag-cv.json";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

const OBSERVATOR = `(() => {
  window.__lt = [];
  window.__fcp = null;
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push({ start: e.startTime, dur: e.duration }); })
      .observe({ entryTypes: ["longtask"] });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint" && window.__fcp == null) window.__fcp = e.startTime; })
      .observe({ type: "paint", buffered: true });
  } catch (e) {}
})();`;
const INJEKTION = `(() => {
  function ventOchInjicera() {
    if (document.documentElement) {
      const s = document.createElement("style");
      s.textContent = ${JSON.stringify(KUR_CSS)};
      (document.head || document.documentElement).appendChild(s);
      window.__kurLandsatte = true;
    } else { setTimeout(ventOchInjicera, 5); }
  }
  ventOchInjicera();
})();`;

const ramMB = Math.round(
  Number(/MemAvailable:\s+(\d+) kB/.exec(readFileSync("/proc/meminfo", "utf8"))[1]) / 1024,
);
if (ramMB < 1500) { console.error(`AVBRUTEN: RAM ${ramMB} < 1500 MB`); process.exit(2); }

const PROFIL = `/tmp/ak1a-o159-ab-${Date.now()}`;
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--disable-extensions", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFIL}`, "about:blank",
], { stdio: "ignore" });

function fonsterTbt(lt, fcp) {
  if (fcp == null || !Array.isArray(lt)) return null;
  const slut = fcp + 5000;
  return Math.round(lt.filter((t) => t.start >= fcp && t.start < slut)
    .reduce((a, t) => a + (t.dur - 50), 0));
}

try {
  let version = null;
  for (let i = 0; i < 40 && !version; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) version = await r.json();
    } catch {}
    if (!version) await SLEEP(250);
  }
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((los) => { ws.onopen = los; });
  let id = 0;
  const vantar = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && vantar.has(msg.id)) { const los = vantar.get(msg.id); vantar.delete(msg.id); los(msg); }
  };
  const send = (metod, params = {}, session = undefined) => new Promise((los) => {
    const i = ++id; vantar.set(i, los);
    ws.send(JSON.stringify({ id: i, method: metod, params, ...(session ? { sessionId: session } : {}) }));
  });
  const svar = async (p, m) => { if (m.error || !m.result) throw new Error(`${p}: ${JSON.stringify(m).slice(0, 200)}`); return m.result; };

  const runs = [];
  for (const namn of RUNS) {
    const lag = namn.startsWith("b") ? "B(kur)" : "A(ref)";
    const { targetId } = await svar("createTarget", await send("Target.createTarget", { url: "about:blank" }));
    const { sessionId } = await svar("attach", await send("Target.attachToTarget", { targetId, flatten: true }));
    await svar("page", await send("Page.enable", {}, sessionId));
    await svar("net", await send("Network.enable", {}, sessionId));
    await svar("cache", await send("Network.setCacheDisabled", { cacheDisabled: true }, sessionId));
    await svar("obs", await send("Page.addScriptToEvaluateOnNewDocument", { source: OBSERVATOR }, sessionId));
    if (namn.startsWith("b")) {
      await svar("inj", await send("Page.addScriptToEvaluateOnNewDocument", { source: INJEKTION }, sessionId));
    }
    await svar("cpu", await send("Emulation.setCPUThrottlingRate", { rate: 4 }, sessionId));
    await svar("netd", await send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: Math.round(1.6 * 1024 * 1024 * 0.9), uploadThroughput: 750 * 1024 }, sessionId));
    await svar("metrics", await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true }, sessionId));
    await svar("nav", await send("Page.navigate", { url: BAS + SIDA }, sessionId));
    let klar = false;
    for (let i = 0; i < 60 && !klar; i++) {
      const r = await send("Runtime.evaluate", {
        expression: "document.readyState === 'complete' && document.fonts.status && window.__lt !== undefined", returnByValue: true,
      }, sessionId);
      klar = r?.result?.result?.value === true;
      if (!klar) await SLEEP(300);
    }
    await SLEEP(12_000); // fönster FCP+5s + marginal
    const m = await svar("las", await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const lt = window.__lt || [];
        const platshallare = [...document.querySelectorAll("section:has(> div.overflow-x-auto)")]
          .filter(s => Math.round(s.getBoundingClientRect().height) === 1392).length;
        return {
          fcp: window.__fcp,
          langtasks: lt.length,
          langtasksDurTotal: Math.round(lt.reduce((a, t) => a + t.dur, 0)),
          kurLandsatte: window.__kurLandsatte === true,
          cvAutoAntal: [...document.querySelectorAll("section")].filter(s => getComputedStyle(s).contentVisibility === "auto").length,
          platshallare1392: platshallare,
          ltLista: lt,
        };
      })()`,
    }, sessionId));
    const d = m.result.value;
    const tbt = fonsterTbt(d.ltLista, d.fcp);
    const post = { namn, lag, fcp: d.fcp, langtasks: d.langtasks, langtasksDurTotal: d.langtasksDurTotal, fonsterTbt: tbt, kurLandsatte: d.kurLandsatte, cvAutoAntal: d.cvAutoAntal, platshallare1392: d.platshallare1392 };
    runs.push(post);
    console.log(`${namn} ${lag}: FCP ${d.fcp == null ? "?" : Math.round(d.fcp)}ms · tasks ${d.langtasks} (S${d.langtasksDurTotal}ms) · fönster-TBT ${tbt}ms · cvAuto=${d.cvAutoAntal} · platshållare=${d.platshallare1392} · kur=${d.kurLandsatte}`);
    await svar("stang", await send("Target.closeTarget", { targetId }, sessionId));
    await SLEEP(2000);
  }
  writeFileSync(UTFIL, JSON.stringify({ ts: new Date().toISOString(), ramMB, sida: SIDA, throttle: { cpu: 4, netMs: 150 }, kurCss: KUR_CSS, runs }, null, 2));
  console.log("Skriven → " + UTFIL);
} finally {
  try { barn.kill("SIGTERM"); } catch {}
  await SLEEP(500);
  rmSync(PROFIL, { recursive: true, force: true });
}
