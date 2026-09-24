#!/usr/bin/env node
/**
 * AK1A — GEOMETRISOND o139 (SPÅR 7 — verktygssidors widget-läge).
 *
 * Fråga: var ligger tunga widget-containern (div.mt-10 + ev. demo-strip)
 * relativt mobil-vecket (412×823) — hel/offscreen avgör om
 * content-visibility:auto kan hoppa över deras initiala layout.
 *
 * Metod: CDP, mobil-emulation 412×823 dpr 2.627, cache avslagen,
 * settle-poll på document.height, sedan getBoundingClientRect per
 * selector + document.documentElement.scrollHeight.
 *
 * Användning: node verktyg/_s7u2o139-geometri.mjs [sokvag …]
 * Utdata: data/forskning/OPTIMERING/lighthouse/geometri-s7u2o139.json
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SIDOR = process.argv.length > 2 ? process.argv.slice(2) : ["/superanalys", "/kalkylator"];
const BAS = process.env.SOND_BAS || "http://localhost:3000";
const PORT = 9361;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", "geometri-s7u2o139.json");

const memAvail = Number((readFileSync("/proc/meminfo", "utf8").match(/MemAvailable:\s+(\d+) kB/) || [])[1] || 0) / 1024;
if (memAvail < 450) {
  console.error(`RAM-vakt: ${Math.round(memAvail)} MB < 450 MB — avbryter.`);
  process.exit(2);
}

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
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  return (method, params = {}, sessionId) => new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
    ws.send(JSON.stringify({ id: i, method, params, sessionId }));
  });
}

async function main() {
  await sleep(2500);
  let version;
  for (let i = 0; i < 40; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; }
    catch { await sleep(250); }
  }
  if (!version) throw new Error("DevTools svarade ej");
  const WsGlobal = globalThis.WebSocket;
  const ws = new WsGlobal(version.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  const send = await cdp(ws);
  const { browserContextId } = await send("Target.createBrowserContext");
  const resultat = [];
  for (const sokvag of SIDOR) {
    const { targetId } = await send("Target.createTarget", { url: "about:blank", browserContextId });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    await send("Page.enable", {}, sessionId);
    await send("Network.enable", {}, sessionId);
    await send("Network.setCacheDisabled", { cacheDisabled: true }, sessionId);
    await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true }, sessionId);
    await send("Page.navigate", { url: new URL(sokvag, BAS).href }, sessionId);
    await sleep(3500);
    const { result } = await send("Runtime.evaluate", {
      returnByPromise: true, awaitPromise: true, expression: `(() => {
        const sel = ["section[aria-label^='AKM2-demo']", "div.mt-10"];
        const ut = { sokvag: ${JSON.stringify(sokvag)}, viewport: 823, ytor: [] };
        for (const s of sel) {
          for (const el of document.querySelectorAll(s)) {
            const r = el.getBoundingClientRect();
            ut.ytor.push({ selector: s, top: Math.round(r.top), hojd: Math.round(r.height), element: Math.round(el.querySelectorAll("*").length) });
          }
        }
        ut.docHojd = Math.round(document.documentElement.scrollHeight);
        return JSON.stringify(ut);
      })()`,
    }, sessionId);
    resultat.push(JSON.parse(result.value));
    await send("Target.closeTarget", { targetId }).catch(() => {});
  }
  writeFileSync(UTFIL, JSON.stringify({ datum: new Date().toISOString(), bas: BAS, sidor: resultat }, null, 2) + "\n");
  console.log(JSON.stringify(resultat, null, 2));
  ws.close();
}

main().finally(() => { try { chrome.kill("SIGKILL"); } catch {} process.exit(0); });
