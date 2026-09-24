#!/usr/bin/env node
/** o129-mikrosond: varför blir platshållarhöjden = contain-intrinsic-size + 50? */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
const PORT = 9353;
const memAvail = Number((readFileSync("/proc/meminfo").toString().match(/MemAvailable:\s+(\d+) kB/)||[])[1] || 0) / 1024;
if (memAvail < 450) { console.error(`RAM-vakt ${Math.round(memAvail)} < 450 — avbryter`); process.exit(2); }
const chrome = spawn("/usr/bin/google-chrome", ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", `--remote-debugging-port=${PORT}`, "--disable-gpu", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function cdp(ws) {
  let id = 0; const pending = new Map();
  ws.addEventListener("message", (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  return (method, params = {}, sessionId) => new Promise((res, rej) => { const mid = ++id; pending.set(mid, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) })); });
}
try {
  let v; for (let i = 0; i < 40; i++) { try { v = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch { await sleep(250); } }
  const ws = new WebSocket(v.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  const send = await cdp(ws);
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true }, sessionId);
  await send("Page.navigate", { url: "http://localhost:3000/blogg" }, sessionId);
  await sleep(3000);
  const { result } = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
    const st = document.createElement('style');
    st.textContent = '.cv-bloggkort:last-of-type{contain-intrinsic-size:auto 100px;}';
    document.head.appendChild(st);
    return 'injicerad';
  })()` }, sessionId);
  await sleep(800);
  const { result: r2 } = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
    const sist = document.querySelector('.cv-bloggkort:last-of-type');
    const cs = getComputedStyle(sist);
    const grid = sist.parentElement;
    return {
      sistH: Math.round(sist.getBoundingClientRect().height),
      computedIntrinsic: cs.containIntrinsicSize || cs.getPropertyValue('contain-intrinsic-size'),
      contentVisibility: cs.contentVisibility,
      gridKlass: grid.className.slice(0, 50),
      gridGap: getComputedStyle(grid).gap,
      sistMargin: getComputedStyle(sist).margin,
      gridAutoRows: getComputedStyle(grid).gridAutoRows,
      gridTemplateRows: getComputedStyle(grid).gridTemplateRows.split(' ').slice(-3).join(' '),
    };
  })()` }, sessionId);
  console.log(JSON.stringify(r2.value, null, 2));
  ws.close();
} finally { chrome.kill(); }
