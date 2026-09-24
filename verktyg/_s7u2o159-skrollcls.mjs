#!/usr/bin/env node
/**
 * AK1A — o159 §9.4 (Spår 7, s7-u2): SKROLL-CLS-SOND /bolag — kontrollerad
 * bottenrullning ×2 på den DEPLoyade kuren (o144-mönstret: platshållarna
 * FÅR INTE ge synliga stavhopp). Post-load-injektion (o159 §7.2-läxan:
 * PerformanceObserver sätts EFTER navigering — mäter ENDAST rullningens
 * skift, initial-layout bärs av LH CLS). Page-ws räcker (inga Target.*-
 * domäner behövs — o159 §7.1-läxan). Dubbeltjänar som cv-kanalbevis:
 * räknar computed content-visibility + verkliga höjder på serverad prod.
 * Engångsverktyg, commitas som underlag.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";

const BAS = process.env.LH_BAS || "http://localhost:3000";
const PORT = 9369;
const UTFIL = "data/forskning/OPTIMERING/lighthouse/skrollcls-o159-bolag-mobil.json";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

const ramMB = Math.round(
  Number(/MemAvailable:\s+(\d+) kB/.exec(readFileSync("/proc/meminfo", "utf8"))[1]) / 1024,
);
if (ramMB < 1500) { console.error(`AVBRUTEN: RAM ${ramMB} < 1500 MB`); process.exit(2); }

const PROFIL = "/tmp/ak1a-o159-skrollcls-profil";
rmSync(PROFIL, { recursive: true, force: true });
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--disable-extensions", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFIL}`, "about:blank",
], { stdio: "ignore" });

try {
  let wsUrl = null;
  for (let i = 0; i < 40 && !wsUrl; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json`);
      if (r.ok) {
        const mal = (await r.json()).filter((t) => t.type === "page");
        if (mal.length) wsUrl = mal[0].webSocketDebuggerUrl;
      }
    } catch {}
    if (!wsUrl) await SLEEP(250);
  }
  if (!wsUrl) throw new Error("Chrome svarade inte");
  const ws = new WebSocket(wsUrl);
  await new Promise((los) => { ws.onopen = los; });
  let id = 0;
  const vantar = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && vantar.has(msg.id)) { const { los } = vantar.get(msg.id); vantar.delete(msg.id); los(msg); }
  };
  const send = (metod, params = {}) => new Promise((los, avvisa) => {
    const i = ++id; vantar.set(i, { los });
    ws.send(JSON.stringify({ id: i, method: metod, params }));
    setTimeout(() => { if (vantar.has(i)) { vantar.delete(i); avvisa(new Error("CDP-timeout: " + metod)); } }, 30000);
  });
  await send("Network.enable", {});
  await send("Network.setCacheDisabled", { cacheDisabled: true });

  // Mobil 390×844 — kurens verkningsyta (≤640 px)
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Page.navigate", { url: BAS + "/bolag" });
  for (let i = 0; i < 50; i++) {
    const r = await send("Runtime.evaluate", {
      expression: "document.readyState === 'complete' && document.fonts.status", returnByValue: true,
    });
    if (r?.result?.result?.value === true) break;
    await SLEEP(300);
  }
  await SLEEP(2500);

  // Kanalbevis-delen: cv-status på serverad prod (post-load, sektioner under
  // vyn kan ännu vara skippade — computed cv syns ändå; verkliga höjder mäts
  // EFTER full rullning då allt renderats).
  await send("Runtime.evaluate", {
    expression: `(() => {
      window.__skift = [];
      try {
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) {
            if (e.hadRecentInput) continue;
            window.__skift.push({
              t: Math.round(e.startTime), v: +e.value.toFixed(6),
              kallor: (e.sources || []).map((s) => (s.node && s.node.nodeName) || "?").slice(0, 3).join(","),
            });
          }
        }).observe({ type: "layout-shift", buffered: false });
      } catch (fel) { window.__skiftFel = String(fel); }
      return Object.keys(window.__skift).length >= 0;
    })()`,
    returnByValue: true,
  });

  const rapport = { ts: new Date().toISOString(), ramMB, sida: "/bolag", lage: "mobil-390x844", omgangar: [] };
  for (let omg = 1; omg <= 2; omg++) {
    const fore = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `document.documentElement.scrollHeight`,
    });
    const hojdFore = fore.result.result.value;
    // Kontrollerad bottenrullning: 300 px-steg, 120 ms per steg (o144-mönstret)
    const steg = 300;
    const antalSteg = Math.ceil(hojdFore / steg);
    for (let y = steg; y <= hojdFore + steg; y += steg) {
      await send("Runtime.evaluate", {
        expression: `window.scrollTo(0, ${y})`, returnByValue: true,
      });
      await SLEEP(120);
    }
    await SLEEP(1000); // cv-inrendering + sista skiftens utlösning
    const efter = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const skift = window.__skift.slice();
        window.__skift = [];
        return {
          hojdEfter: document.documentElement.scrollHeight,
          skift,
          cvSektioner: [...document.querySelectorAll(".cv-bolagsektion")].map((s) => {
            const cs = getComputedStyle(s);
            return {
              cv: cs.contentVisibility,
              intrinsic: cs.containIntrinsicSize,
              verkligHojdPx: Math.round(s.getBoundingClientRect().height),
            };
          }),
        };
      })()`,
    });
    const d = efter.result.result.value;
    const summa = d.skift.reduce((a, s) => a + s.v, 0);
    rapport.omgangar.push({
      omgang: omg,
      hojdForePx: hojdFore,
      hojdEfterPx: d.hojdEfter,
      hojdDeltaPx: d.hojdEfter - hojdFore,
      rullningssteg: antalSteg,
      skiftAntal: d.skift.length,
      skrollClsSumma: +summa.toFixed(6),
      toppSkift: d.skift.slice().sort((a, b) => b.v - a.v).slice(0, 5),
      cvSektioner: d.cvSektioner,
    });
    console.log(`omgång ${omg}: höjd ${hojdFore}→${d.hojdEfter} (Δ${d.hojdEfter - hojdFore}px) · ${d.skift.length} skift · summa ${summa.toFixed(6)} · cv-sektioner ${d.cvSektioner.length}`);
    // Rulla tillbaka toppen inför omgång 2 (nya reservationer är nu utbytta
    // mot verkliga höjder — omgång 2 mäter det stabiliserade tillståndet)
    await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)", returnByValue: true });
    await SLEEP(800);
  }
  writeFileSync(UTFIL, JSON.stringify(rapport, null, 2));
  console.log("Skriven → " + UTFIL);
} finally {
  try { barn.kill("SIGTERM"); } catch {}
  await SLEEP(500);
  rmSync(PROFIL, { recursive: true, force: true });
}
