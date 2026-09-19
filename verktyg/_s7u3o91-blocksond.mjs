#!/usr/bin/env node
/**
 * AK1A — BLOCK-SOND (o91): var sitter /kurser engångstillväxten (+6,6k px)?
 *
 * Kort-sondens familjemätning förklarade +3 993px (utvalda korten) av
 * +6 652px — resten attribueras här per ELEMENT: snapshot av samtliga
 * element (signatur = tag.klass-prefix) med top+hojd FÖRE scroll, full
 * scroll till botten, snapshot EFTER — rapport = topp-20 signaturer
 * sorterat på |Σ höjddelta|, plus dokumenttotalen.
 *
 * Användning: node verktyg/_s7u3o91-blocksond.mjs <namn> [url]
 * Utdata: data/forskning/OPTIMERING/lighthouse/blocksond-<namn>.json
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/kurser";
const GEO = process.argv[4] || "mobil"; // mobil 412×823 (o78 §2) | desktop 1280×800 (md+)
const VP = GEO === "desktop"
  ? { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }
  : { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true };
const PORT = 9344;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `blocksond-${NAMN}.json`);

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

/** Samtliga element: signatur (tag + 2 första klasserna), top, hojd. */
const MA_ALLA = `(() => {
  const els = [...document.querySelectorAll("body *")];
  const poster = els.map(el => {
    const r = el.getBoundingClientRect();
    const klasser = (el.className && typeof el.className === "string")
      ? el.className.trim().split(/\\s+/).slice(0, 2).join(".") : "";
    return {
      sig: el.tagName.toLowerCase() + (klasser ? "." + klasser : ""),
      top: Math.round(r.top + window.scrollY),
      hojd: Math.round(r.height),
    };
  });
  return { docH: Math.round(document.documentElement.scrollHeight), poster };
})()`;

try {
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
  const prov = (await send("Runtime.evaluate", { expression: "1 + 1", returnByValue: true }, sessionId)).result.value;
  if (prov !== 2) throw new Error("evaluate-prov misslyckades");
  await send("Emulation.setDeviceMetricsOverride", VP, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);
  await sleep(5000);

  const fore = (await send("Runtime.evaluate", { expression: MA_ALLA, returnByValue: true }, sessionId)).result.value;
  console.log(`FÖRE: docH ${fore.docH}px · ${fore.poster.length} element`);

  // Full progressiv scroll (samma kurva som kort-sonden).
  let y = 0;
  while (y < fore.docH) {
    y = Math.min(y + 600, fore.docH);
    await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` }, sessionId);
    await sleep(y > 6000 ? 1000 : 400); // registret får extra tid (IO-hämtning)
  }
  let forrige = -1;
  for (let i = 0; i < 12; i++) {
    const m = (await send("Runtime.evaluate", {
      expression: `document.querySelectorAll(".cv-registerkort li, .cv-registerkort").length + ":" + [...document.querySelectorAll(".cv-registerkort")].reduce((a,el)=>a+(el.innerText||"").length,0)`,
    }, sessionId)).result.value;
    const t = Number(String(m).split(":")[1]);
    if (t === forrige && t > 0) break;
    forrige = t;
    await sleep(800);
  }
  await sleep(800);

  const efter = (await send("Runtime.evaluate", { expression: MA_ALLA, returnByValue: true }, sessionId)).result.value;
  console.log(`EFTER: docH ${efter.docH}px (engångstillväxt ${efter.docH - fore.docH >= 0 ? "+" : ""}${efter.docH - fore.docH}px)`);

  // Per-signatur-aggregat: Σdelta (teckenbevarande). Parning INOM signatur
  // i dokumentordning — DOM:ens elementantal kan ändras vid skelett→text
  // (globala index glider; inom-signatur-ordning är stabil så länge sig-
  // populationen ej sorterar om, vilket list-DOM ej gör).
  const perSig = (snap) => {
    const m = new Map();
    for (const p of snap.poster) {
      if (!m.has(p.sig)) m.set(p.sig, []);
      m.get(p.sig).push(p);
    }
    return m;
  };
  const f = perSig(fore);
  const e = perSig(efter);
  const rader = [];
  for (const [sig, fList] of f) {
    const eList = e.get(sig) ?? [];
    const n = Math.min(fList.length, eList.length);
    let delta = 0;
    let fTot = 0;
    let eTot = 0;
    for (let i = 0; i < n; i++) {
      delta += eList[i].hojd - fList[i].hojd;
      fTot += fList[i].hojd;
      eTot += eList[i].hojd;
    }
    rader.push({ sig, antalFore: fList.length, antalEfter: eList.length, sumHojdFore: fTot, sumHojdEfter: eTot, sumDelta: delta });
  }
  rader.sort((a, b) => Math.abs(b.sumDelta) - Math.abs(a.sumDelta));
  console.log("\nTopp-20 signaturer på |Σ höjddelta|:");
  for (const r of rader.slice(0, 20)) {
    console.log(`  ${r.sig}: ${r.antalFore}→${r.antalEfter} st · ${r.sumHojdFore}→${r.sumHojdEfter}px (Σdelta ${r.sumDelta >= 0 ? "+" : ""}${r.sumDelta})`);
  }

  writeFileSync(UTFIL, JSON.stringify({ url: URL, namn: NAMN, ts: new Date().toISOString(), fore, efter, rader }, null, 2));
  console.log(`\nSkriven: ${UTFIL}`);
  ws.close();
} finally {
  chrome.kill();
}
