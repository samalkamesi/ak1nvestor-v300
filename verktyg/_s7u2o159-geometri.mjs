#!/usr/bin/env node
/**
 * AK1A — o159 (Spår 7, s7-u2): GEOMETRISOND /bolag — sektionernas höjder
 * (mobil 390 + desktop 1280) för cv-bolagsektion-kurens kalibrerade
 * reservation (o129-läxan: platshållare ~verklig höjd, CLS 0 är heligt;
 * o139-precedensen: sondade reservationer före content-visibility).
 * Engångsverktyg, commitas som underlag.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";

const BAS = "http://localhost:3000";
const PORT = 9368;
const UTFIL = "data/forskning/OPTIMERING/lighthouse/geometri-o159-bolag-mobil-desktop.json";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

const ramMB = Math.round(
  Number(/MemAvailable:\s+(\d+) kB/.exec(readFileSync("/proc/meminfo", "utf8"))[1]) / 1024,
);
if (ramMB < 1500) { console.error(`AVBRUTEN: RAM ${ramMB} < 1500 MB`); process.exit(2); }

const PROFIL = "/tmp/ak1a-o159-geometri-profil";
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

  const rapport = { ts: new Date().toISOString(), ramMB, sida: "/bolag", lagen: [] };
  for (const lage of [
    { namn: "mobil-390", w: 390, h: 844, dsf: 2, mobile: true },
    { namn: "desktop-1280", w: 1280, h: 900, dsf: 1, mobile: false },
  ]) {
    await send("Emulation.setDeviceMetricsOverride", { width: lage.w, height: lage.h, deviceScaleFactor: lage.dsf, mobile: lage.mobile });
    await send("Page.navigate", { url: BAS + "/bolag" });
    for (let i = 0; i < 50; i++) {
      const r = await send("Runtime.evaluate", {
        expression: "document.readyState === 'complete' && document.fonts.status", returnByValue: true,
      });
      if (r?.result?.result?.value === true) break;
      await SLEEP(300);
    }
    await SLEEP(2000);
    const m = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const sektioner = [...document.querySelectorAll("section")].map((s, i) => {
          const r = s.getBoundingClientRect();
          const h2 = s.querySelector("h2")?.textContent?.trim().slice(0, 40) || "?";
          return {
            index: i, rubrik: h2,
            top: Math.round(r.top + scrollY), hojd: Math.round(r.height),
            tabellRader: s.querySelectorAll("tbody tr").length,
          };
        });
        const sidh = Math.round(document.documentElement.scrollHeight);
        const h1 = document.querySelector("h1");
        const h1Rect = h1 ? h1.getBoundingClientRect() : null;
        return {
          sidhojdPx: sidh,
          h1Top: h1 ? Math.round(h1Rect.top + scrollY) : null,
          sektioner,
        };
      })()`,
    });
    const d = m.result.result.value;
    const hojder = d.sektioner.map((s) => s.hojd);
    const median = hojder.slice().sort((a, b) => a - b)[Math.floor(hojder.length / 2)];
    rapport.lagen.push({ ...lage, ...d, medianSektionshojdPx: median });
    console.log(`${lage.namn}: sida ${d.sidhojdPx}px · ${d.sektioner.length} sektioner · median höjd ${median}px`);
    console.log("  sektion 1:", JSON.stringify(d.sektioner[0]));
  }
  writeFileSync(UTFIL, JSON.stringify(rapport, null, 2));
  console.log("Skriven → " + UTFIL);
} finally {
  try { barn.kill("SIGTERM"); } catch {}
  await SLEEP(500);
  rmSync(PROFIL, { recursive: true, force: true });
}
