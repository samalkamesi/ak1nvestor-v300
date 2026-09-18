#!/usr/bin/env node
// s7-u3 o78-sond 3: LoAF-A/B — bevisar cv-sektions-kurens effekt UTAN bygge.
// Variant A = prod-läge; variant B = samma sida + injicerad style-tag
// (content-visibility på under-vecks-sektioner) via
// Page.addScriptToEvaluateOnNewDocument. Mäter Σ styleAndLayoutDuration ur
// long-animation-frame-entries (Chrome LoAF) + style/layout-entrytyp-tider.
// Bonus: mäter sektionshöjder (grund för contain-intrinsic-size-reservation).
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const URL = process.env.SOND_URL || "http://localhost:3000/kurser";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

const KUR_CSS = `
  section.marin-panel { content-visibility: auto; contain-intrinsic-size: auto 95rem; }
  main section.rounded-2xl { content-visibility: auto; contain-intrinsic-size: auto 35rem; }
  main div.mt-10 { content-visibility: auto; contain-intrinsic-size: auto 22rem; }
  div.pt-10 { content-visibility: auto; contain-intrinsic-size: auto 30rem; }
  footer.border-t-2 { content-visibility: auto; contain-intrinsic-size: auto 110rem; }
`;

async function korVariant(variant, portNr) {
  const chrome = spawn("/usr/bin/google-chrome", [
    "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
    `--remote-debugging-port=${portNr}`, `--user-data-dir=/tmp/o78ab-${variant}`, "about:blank",
  ], { stdio: "ignore" });
  await SLEEP(2500);
  const listar = await (await fetch(`http://127.0.0.1:${portNr}/json/list`)).json();
  const ws = new WebSocket(listar.find((s) => s.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let seq = 0;
  const vantar = new Map();
  ws.addEventListener("message", (m) => {
    const d = JSON.parse(m.data);
    if (d.id && vantar.has(d.id)) { vantar.get(d.id)(d.result ?? d); vantar.delete(d.id); }
  });
  const send = (method, params) => new Promise((res) => {
    const id = ++seq; vantar.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await send("Network.enable", {});
  await send("Network.emulateNetworkConditions", {
    latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, offline: false,
  });
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Page.enable", {});

  // LoAF-insamlare + ev. kur-injektion FÖRE dokumentstart
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `
    self.__loaf = [];
    try {
      new PerformanceObserver((po) => {
        for (const e of po.getEntries()) {
          self.__loaf.push({
            start: Math.round(e.startTime), dur: Math.round(e.duration),
            render: Math.round(e.renderDuration ?? 0),
            styleLayout: Math.round(e.styleAndLayoutDuration ?? 0),
            blocking: Math.round(e.blockingDuration ?? 0),
            scripts: (e.scripts ?? []).map((s) => ({
              namn: (s.name || s.invokerType || "?").slice(0, 90),
              dur: Math.round(s.duration ?? 0),
              forcedStyleLayout: Math.round(s.forcedStyleAndLayoutDuration ?? 0),
              source: (s.sourceURL || "").split("/").slice(-1)[0]?.slice(0, 40),
            })),
          });
        }
      }).observe({ type: "long-animation-frame", buffered: true });
    } catch (err) { self.__loafFel = String(err); }
    ${variant === "B" ? `const st = document.createElement("style"); st.textContent = ${JSON.stringify(KUR_CSS)}; st.dataset.cvKur = "1"; (document.documentElement || document.head || document).appendChild(st); self.__cvInjicerad = true;` : ""}
  ` });

  await send("Page.navigate", { url: URL });
  await SLEEP(12000);

  const v = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
    const vh = innerHeight;
    const hojder = {};
    const vikt = (sel, namn) => {
      const el = document.querySelector(sel);
      if (el) { const r = el.getBoundingClientRect(); hojder[namn] = { top: Math.round(r.top + scrollY), hojd: Math.round(r.height), element: el.querySelectorAll("*").length }; }
      else hojder[namn] = null;
    };
    vikt("section.marin-panel", "socialproof");
    vikt("main section.rounded-2xl", "kategorivagg");
    vikt("main div.mt-10", "kurstips");
    vikt("div.pt-10", "nastaSteg");
    vikt("footer.border-t-2", "sidfooter");
    vikt("#registret", "registret");
    const loaf = self.__loaf ?? [];
    const allaScripts = {};
    for (const e of loaf) for (const s of e.scripts ?? []) {
      const k = s.source + " · " + s.namn;
      if (!allaScripts[k]) allaScripts[k] = { dur: 0, forcedStyleLayout: 0, antal: 0 };
      allaScripts[k].dur += s.dur; allaScripts[k].forcedStyleLayout += s.forcedStyleLayout; allaScripts[k].antal++;
    }
    return {
      dokHojd: document.documentElement.scrollHeight, titel: document.title, h1: document.querySelector("h1")?.textContent?.slice(0,40),
      cvInjicerad: !!self.__cvInjicerad,
      hojder,
      loafFel: self.__loafFel,
      loafAntal: loaf.length,
      loafSumma: {
        durationMs: loaf.reduce((s, e) => s + e.dur, 0),
        renderMs: loaf.reduce((s, e) => s + e.render, 0),
        styleLayoutMs: loaf.reduce((s, e) => s + e.styleLayout, 0),
        blockingMs: loaf.reduce((s, e) => s + e.blocking, 0),
      },
      scriptAttribuering: Object.entries(allaScripts)
        .sort((a, b) => b[1].forcedStyleLayout - a[1].forcedStyleLayout || b[1].dur - a[1].dur)
        .slice(0, 14)
        .map(([k, v]) => ({ k, ...v })),
      loafTopp: [...loaf].sort((a, b) => b.dur - a.dur).slice(0, 6),
    };
  })()` });

  const resultat = { variant, ...v.result?.value };
  chrome.kill();
  await SLEEP(3000);
  return resultat;
}

const A = await korVariant("A", 9381);
const B = await korVariant("B", 9382);
const rapport = {
  url: URL, ts: new Date().toISOString(),
  skillnadStyleLayoutMs: (A.loafSumma?.styleLayoutMs ?? 0) - (B.loafSumma?.styleLayoutMs ?? 0),
  A, B,
};
const UT = "data/forskning/OPTIMERING/lighthouse/sond-s7u3o78-loaf-ab-fore.json";
writeFileSync(UT, JSON.stringify(rapport, null, 2));
console.log(JSON.stringify(rapport, null, 2));
process.exit(0);
