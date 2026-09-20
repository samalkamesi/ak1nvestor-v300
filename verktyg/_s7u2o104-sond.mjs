#!/usr/bin/env node
/**
 * AK1A — o100-SOND: tablet-gapets FÖRE/EFTER-instrument (o97 §6.3).
 *
 * Mäter (per sida + godtycklig viewport) samma mått som _s7u3o96-sond.mjs
 * men med fri geometri: de utvalda korten (li.cv-utvalt) FÖRE (cv-platshållare)
 * vs EFTER (renderade) per sektion — för att avgöra om reservationerna
 * (globals.css: mobilnivåer <768, desktopnivåer ≥768 kalibrerade på 1 280)
 * träffar det verkliga 768–1 023-bandet (grid sm:2/lg:3 = 2 kolonner där).
 *
 * Användning: node verktyg/_s7u2o104-sond.mjs <namn> [url] [BREDDxHOJD]
 * Utdata: data/forskning/OPTIMERING/lighthouse/o104sond-<namn>.json
 * RAM-vakt: vägrar starta under 450 MB tillgängligt (exit 2 = köa om).
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/kurser";
const GEOARG = process.argv[4] || "768x1024";
const m = /^(\d+)x(\d+)$/.exec(GEOARG);
if (!m) { console.error("Geometri måste vara BREDDxHOJD, t.ex. 768x1024"); process.exit(1); }
const VP = { width: Number(m[1]), height: Number(m[2]), deviceScaleFactor: 2, mobile: false };
const PORT = 9349;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `o104sond-${NAMN}.json`);

// RAM-vakt (u2-föregångarens mönster ur _s7u2o99-sond.mjs).
const meminfo = readFileSync("/proc/meminfo", "utf8");
const memAvailable = Number(/^MemAvailable:\s+(\d+) kB$/m.exec(meminfo)[1]) / 1024;
if (memAvailable < 450) {
  console.error(`RAM-vakt: ${Math.round(memAvailable)} MB tillgängligt < 450 — köa om (exit 2)`);
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

/** Snapshot: allt instrumentet behöver i ett evaluate-pass (o96-paritet). */
const SNAP = `(() => {
  const utvalda = [...document.querySelectorAll("li.cv-utvalt")].map((li) => {
    const span = li.querySelector("span.mt-2.flex-1");
    const lr = li.getBoundingClientRect();
    const sr = span ? span.getBoundingClientRect() : null;
    const cs = span ? getComputedStyle(span) : null;
    const lh = cs ? parseFloat(cs.lineHeight) : null;
    return {
      sektion: li.closest("section")?.querySelector("h2")?.id || "?",
      liH: Math.round(lr.height),
      liW: Math.round(lr.width),
      spanH: sr ? Math.round(sr.height) : null,
      textLen: span?.textContent ? span.textContent.trim().length : null,
      font: cs ? cs.fontFamily.split(",")[0].replace(/["']/g, "") : null,
      lh: lh ? Math.round(lh) : null,
      rader: sr && lh ? Math.round(sr.height / lh) : null,
    };
  });
  return {
    docH: Math.round(document.documentElement.scrollHeight),
    fonts: document.fonts.status,
    utvalda,
  };
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
  await send("Emulation.setDeviceMetricsOverride", VP, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);
  await sleep(5000);

  const fore = (await send("Runtime.evaluate", { expression: SNAP, returnByValue: true }, sessionId)).result.value;
  console.log(`FÖRE: docH ${fore.docH} · fonts ${fore.fonts} · utvalda ${fore.utvalda.length}`);

  // Progressiv scroll till botten (o96-sondens kurva).
  let y = 0;
  while (y < fore.docH) {
    y = Math.min(y + 600, fore.docH);
    await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})`, }, sessionId);
    await sleep(y > 6000 ? 1000 : 400);
  }
  await sleep(800);
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)", }, sessionId);
  await sleep(600);

  const efter = (await send("Runtime.evaluate", { expression: SNAP, returnByValue: true }, sessionId)).result.value;
  console.log(`EFTER: docH ${efter.docH} (Δ ${efter.docH - fore.docH}) · fonts ${efter.fonts}`);

  const sum = (arr, f) => arr.reduce((a, b) => a + (f(b) || 0), 0);
  if (efter.utvalda.length) {
    for (const sid of new Set(efter.utvalda.map((u) => u.sektion))) {
      const f = fore.utvalda.filter((u) => u.sektion === sid);
      const e = efter.utvalda.filter((u) => u.sektion === sid);
      const dSpan = sum(e, (u) => u.spanH) - sum(f, (u) => u.spanH);
      const dLi = sum(e, (u) => u.liH) - sum(f, (u) => u.liH);
      console.log(`  sektion ${sid}: li FÖRE ${f.map((u) => u.liH).join(",")} → EFTER ${e.map((u) => u.liH).join(",")} (ΣΔli ${dLi})`);
      console.log(`    span FÖRE ${f.map((u) => u.spanH).join(",")} → EFTER ${e.map((u) => u.spanH).join(",")} (ΣΔspan ${dSpan})`);
      console.log(`    liW ${e[0]?.liW} · textLen ${e.map((u) => u.textLen).join(",")} · rader EFTER ${e.map((u) => u.rader).join(",")}`);
    }
    console.log(`  TOTALT Σspan FÖRE ${sum(fore.utvalda, (u) => u.spanH)} → EFTER ${sum(efter.utvalda, (u) => u.spanH)} (Δ ${sum(efter.utvalda, (u) => u.spanH) - sum(fore.utvalda, (u) => u.spanH)})`);
  }

  writeFileSync(UTFIL, JSON.stringify({ url: URL, namn: NAMN, geo: GEOARG, vp: VP, ts: Date.now(), fore, efter }, null, 1));
  console.log(`→ ${UTFIL}`);
} finally {
  chrome.kill("SIGKILL");
}
