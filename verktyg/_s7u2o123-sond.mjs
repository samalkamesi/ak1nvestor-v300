#!/usr/bin/env node
/**
 * o123-sond (s7-u2): FULL dump av tryckmål under 52 px + zoomfällor —
 * kanoniska verktyget kapar varsta vid 25; denna sond listar ALLA för
 * rond 4-fixarnas kompletta underlag (samma selektor, samma settle-logik
 * som mobil-lasbarhet.mjs — engångsverktyg, commitas som underlag).
 *
 * Användning: node verktyg/_s7u2o123-sond.mjs [utfil.json] [sidor…]
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const BAS = "https://lab.ak1nvestor.com";
const UTFIL = process.argv[2] || "/tmp/o123-sond.json";
const SIDOR = process.argv.slice(3).length
  ? process.argv.slice(3)
  : ["/superanalys", "/kalkylator", "/konfluens", "/netnet", "/dataset", "/kurser/pe-07-co-investeringen"];

const PORT = 9338; // egen port — kolliderar ej med lasbarhet (9337)/lighthouse (9333)
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const TARGET_MS = 52;
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

function ramTillgangligtMB() {
  try {
    const r = readFileSync("/proc/meminfo", "utf8");
    return Math.round(Number(r.match(/MemAvailable:\s+(\d+) kB/)?.[1] ?? 0) / 1024);
  } catch {
    return 0;
  }
}

const MAT_UTTRYCK = `(() => {
  const sel = "a[href], button, input, select, textarea, summary, [role='button'], [role='tab'], [role='menuitem'], [role='switch'], [role='checkbox'], [role='radio'], [tabindex]:not([tabindex='-1'])";
  const element = [];
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) continue;
    const st = getComputedStyle(el);
    if (st.visibility === "hidden" || st.display === "none" || Number(st.opacity) === 0) continue;
    if (el.closest("[hidden]") || el.closest("dialog:not([open])")) continue;
    element.push({
      tag: el.tagName.toLowerCase(),
      rol: el.getAttribute("role"),
      text: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 48),
      w: Math.round(r.width),
      h: Math.round(r.height),
      font: parseFloat(st.fontSize) || null,
      klass: (el.getAttribute("class") || "").slice(0, 160),
      id: el.id || null,
      visning: st.display,
    });
  }
  return element;
})()`;

async function startaChrome() {
  const barn = spawn("/usr/bin/google-chrome", [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=/tmp/ak1a-o123-sond-profil",
    "about:blank",
  ], { stdio: "ignore", detached: false });
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json`);
      if (r.ok) {
        const mål = (await r.json()).filter((t) => t.type === "page");
        if (mål.length) return { barn, ws: mål[0].webSocketDebuggerUrl };
      }
    } catch {}
    await SLEEP(250);
  }
  try { barn.kill(); } catch {}
  throw new Error("Chrome svarade inte på CDP-porten");
}

function cdpTill(ws) {
  let id = 0;
  const vantar = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && vantar.has(msg.id)) {
      const { los } = vantar.get(msg.id);
      vantar.delete(msg.id);
      los(msg);
    }
  };
  const send = (metod, params = {}) =>
    new Promise((los, avvisa) => {
      const i = ++id;
      vantar.set(i, { los });
      ws.send(JSON.stringify({ id: i, method: metod, params }));
      setTimeout(() => {
        if (vantar.has(i)) { vantar.delete(i); avvisa(new Error(`CDP-timeout: ${metod}`)); }
      }, 30000);
    });
  return send;
}

async function mataSida(send, sokvag) {
  await send("Page.navigate", { url: `${BAS}${sokvag}` });
  const REDO_UTTRYCK = `(() => ({
    klar: document.readyState === "complete",
    css: [...document.querySelectorAll('link[rel="stylesheet"]')].every((l) => l.sheet !== null),
    font: document.fonts.status,
  }))()`;
  for (let i = 0; i < 40; i++) {
    const r = await send("Runtime.evaluate", { expression: REDO_UTTRYCK, returnByValue: true });
    const v = r?.result?.result?.value ?? {};
    if (v.klar && v.css && v.font === "loaded") break;
    await SLEEP(300);
  }
  await SLEEP(1000);
  const lasDom = async () => {
    const svar = await send("Runtime.evaluate", { expression: MAT_UTTRYCK, returnByValue: true });
    const skal = svar?.result ?? {};
    if (skal.exceptionDetails) {
      const d = skal.exceptionDetails;
      throw new Error(`evaluate kastade: ${d.exception?.description ?? d.text}`);
    }
    return skal.result?.value ?? [];
  };
  let element = await lasDom();
  if (element.length === 0) {
    await SLEEP(6000);
    element = await lasDom();
  }
  let ostabil = false;
  for (let i = 0; i < 2; i++) {
    await SLEEP(1500);
    const ny = await lasDom();
    const tal = (ls) => JSON.stringify(ls.map((e) => `${e.tag}:${e.w}x${e.h}`));
    if (tal(ny) === tal(element)) break;
    element = ny;
    ostabil = i === 1;
  }
  const prosa = element.filter((e) => e.tag === "a" && e.visning === "inline");
  const riktiga = element.filter((e) => !(e.tag === "a" && e.visning === "inline"));
  const tryckmal = riktiga
    .map((e) => ({ ...e, min: Math.min(e.w, e.h) }))
    .filter((e) => e.min < TARGET_MS)
    .sort((a, b) => a.min - b.min);
  const zoom = riktiga.filter(
    (e) => ["input", "select", "textarea"].includes(e.tag) && e.font != null && e.font < 16,
  );
  return {
    sokvag, antalInteraktiva: riktiga.length, prosaLankarUndantagna: prosa.length,
    tryckmalUnder52: tryckmal.length, ALLA: tryckmal, inputZoom: zoom.length, zoomAlla: zoom, ostabilMatning: ostabil,
  };
}

const ram = ramTillgangligtMB();
if (ram < 700) {
  console.error(`RAM-vakt: ${ram} MB < 700 — mäter inte.`);
  process.exit(2);
}
const { barn, ws: wsUrl } = await startaChrome();
const ws = new WebSocket(wsUrl);
await new Promise((los) => { ws.onopen = los; });
const send = cdpTill(ws);
await send("Emulation.setUserAgentOverride", { userAgent: UA_IPHONE });
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

const rapport = {
  verktyg: "verktyg/_s7u2o123-sond.mjs (full-dump-variant av mobil-lasbarhet.mjs)",
  datum: new Date().toISOString(), mal: BAS, visport: "390×844, DSF 2, iPhone-UA",
  target: "52 px tryckyta; input ≥16 px mot iOS-zoom", sidor: [],
};
try {
  for (const s of SIDOR) {
    process.stdout.write(`Mäter ${s} … `);
    try {
      const r = await mataSida(send, s);
      rapport.sidor.push(r);
      console.log(`${r.antalInteraktiva} interaktiva · ${r.tryckmalUnder52} under 52 · ${r.inputZoom} zoom${r.ostabilMatning ? " · OSTABIL" : ""}`);
    } catch (e) {
      rapport.sidor.push({ sokvag: s, fel: String(e?.message ?? e) });
      console.log("FEL", e?.message ?? e);
    }
    await send("Page.navigate", { url: "about:blank" });
    await SLEEP(700);
  }
} finally {
  writeFileSync(UTFIL, JSON.stringify(rapport, null, 1) + "\n");
  try { ws.close(); } catch {}
  try { barn.kill(); } catch {}
}
console.log(`Skriven: ${UTFIL}`);
