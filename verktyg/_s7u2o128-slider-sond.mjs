#!/usr/bin/env node
/**
 * o128-slider-sond (s7-u2): FÖRE/EFTER-mätning av slider-tummar med
 * FLIKKLICK-LÄGE — o123:s kanoniska sond ser omonterade Radix-flikar ej;
 * denna sond monterar dem (klickar [role=tab] + lägesväxlare) och dumpar
 * alla [data-slot=slider-thumb] med bounding box + beräknat golv-läge.
 * Metrologi-läxan (o123 §EFTER): ren profil + Network.setCacheDisabled.
 *
 * Användning: node verktyg/_s7u2o128-slider-sond.mjs <utfil.json> [--efter]
 * (målbasen är prod-loopback via https om BAS sätts, annars localhost)
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";

const BAS = process.env.O128_BAS || "https://lab.ak1nvestor.com";
const UTFIL = process.argv[2] || "/tmp/o128-slider.json";
const ETIKETT = process.argv.includes("--efter") ? "EFTER" : "FÖRE";

const PORT = 9339; // egen port — 9337 lasbarhet, 9338 o123-sond, 9333 lighthouse
const PROFIL = "/tmp/ak1a-o128-sond-profil";
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const TARGET_MS = 52;
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

// Målobjekt: sokvag + monteringssteg i ordning. "tab" klickar role=tab vars
// text matchar; "aria-knapp" klickar button[aria-pressed] vars text matchar;
// "skroll" rullar till botten och väntar (next/dynamic-sektioner).
const MAL = [
  {
    sokvag: "/kalkylator",
    steg: [{ typ: "tab", text: "Poängsätt manuellt" }],
    notering: "flik 'manuellt' — poängsliders 0–5 per variabel (o123 §kvar post 1)",
  },
  {
    sokvag: "/kalkylator",
    steg: [
      { typ: "aria-knapp", text: "AKM2" },
      { typ: "tab", text: "AKM2" },
    ],
    notering: "lägesväxel akm1→akm2 + flik 'akm2' — modul-poängslider + täckningsslider",
  },
  {
    sokvag: "/",
    steg: [{ typ: "skroll" }],
    notering: "client-portal via PortalSection (next/dynamic ssr:false) — kassapositionsslider",
  },
];

const TUM_UTTRYCK = `(() => {
  const ut = [];
  for (const el of document.querySelectorAll('[data-slot="slider-thumb"]')) {
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    ut.push({
      w: Math.round(r.width), h: Math.round(r.height),
      x: Math.round(r.x), y: Math.round(r.y),
      cssW: st.width, cssH: st.height,
      minH: st.minHeight, minW: st.minWidth,
      media640: window.matchMedia("(max-width: 640px)").matches,
      roll: el.getAttribute("role"),
      synlig: r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none",
      klass: (el.getAttribute("class") || "").slice(0, 200),
    });
  }
  return ut;
})()`;

const TRYCK_UTTRYCK = `(() => {
  const sel = "a[href], button, input, select, textarea, summary, [role='button'], [role='tab'], [role='switch'], [role='checkbox'], [role='radio'], [role='slider'], [tabindex]:not([tabindex='-1'])";
  const ut = [];
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) continue;
    const st = getComputedStyle(el);
    if (st.visibility === "hidden" || st.display === "none" || Number(st.opacity) === 0) continue;
    if (el.closest("[hidden]") || el.closest("dialog:not([open])")) continue;
    ut.push({
      tag: el.tagName.toLowerCase(), roll: el.getAttribute("role"),
      slot: el.getAttribute("data-slot"),
      text: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 40),
      w: Math.round(r.width), h: Math.round(r.h ?? r.height),
    });
  }
  return ut;
})()`;

function ramTillgangligtMB() {
  try {
    const r = readFileSync("/proc/meminfo", "utf8");
    return Math.round(Number(r.match(/MemAvailable:\s+(\d+) kB/)?.[1] ?? 0) / 1024);
  } catch {
    return 0;
  }
}

async function startaChrome() {
  try { rmSync(PROFIL, { recursive: true, force: true }); } catch {} // o123-läxan: ren profil
  const barn = spawn("/usr/bin/google-chrome", [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFIL}`,
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
  const utvardera = async (uttryck) => {
    const r = await send("Runtime.evaluate", { expression: uttryck, returnByValue: true });
    const skal = r?.result ?? {};
    if (skal.exceptionDetails) {
      const d = skal.exceptionDetails;
      throw new Error(`evaluate kastade: ${d.exception?.description ?? d.text}`);
    }
    return skal.result?.value;
  };
  return { send, utvardera };
}

async function korSteg(cx, steg) {
  const log = [];
  for (const s of steg) {
    if (s.typ === "tab") {
      const r = await cx.utvardera(
        `(() => { const t = [...document.querySelectorAll('[role="tab"]')].find(e => (e.textContent || "").includes(${JSON.stringify(s.text)})); if (t) { t.click(); return "klickat"; } return "hittade-inte"; })()`,
      );
      log.push(`tab "${s.text}": ${r}`);
    } else if (s.typ === "aria-knapp") {
      const r = await cx.utvardera(
        `(() => { const t = [...document.querySelectorAll('button[aria-pressed]')].find(e => (e.textContent || "").includes(${JSON.stringify(s.text)})); if (t) { t.click(); return "klickat"; } return "hittade-inte"; })()`,
      );
      log.push(`aria-knapp "${s.text}": ${r}`);
    } else if (s.typ === "skroll") {
      for (let i = 0; i < 3; i++) {
        await cx.utvardera("window.scrollTo(0, document.body.scrollHeight)");
        await SLEEP(1500);
      }
      log.push("skroll ×3 till botten (dynamic-sektioner)");
    }
    await SLEEP(1800); // Radix-montering + lazy-chunk
  }
  return log;
}

async function mataMal(cx, mal) {
  await cx.send("Page.navigate", { url: `${BAS}${mal.sokvag}` });
  const REDO_UTTRYCK = `(() => ({
    klar: document.readyState === "complete",
    css: [...document.querySelectorAll('link[rel="stylesheet"]')].every((l) => l.sheet !== null),
    font: document.fonts.status,
  }))()`;
  for (let i = 0; i < 40; i++) {
    const v = (await cx.utvardera(REDO_UTTRYCK)) ?? {};
    if (v.klar && v.css && v.font === "loaded") break;
    await SLEEP(300);
  }
  await SLEEP(1200);
  const stegLogg = await korSteg(cx, mal.steg);
  await SLEEP(800);
  const tummar = (await cx.utvardera(TUM_UTTRYCK)) ?? [];
  const alla = (await cx.utvardera(TRYCK_UTTRYCK)) ?? [];
  const tryck = alla
    .filter((e) => !(e.tag === "a" && !e.roll && e.slot === null))
    .map((e) => ({ ...e, min: Math.min(e.w, e.h) }))
    .filter((e) => e.min < TARGET_MS);
  return {
    sokvag: mal.sokvag,
    notering: mal.notering,
    stegLogg,
    antalTummar: tummar.length,
    tummarMonteradeSynliga: tummar.filter((t) => t.synlig).length,
    tummar,
    tryckmalUnder52: tryck.length,
    tryckmalTummar: tryck.filter((t) => t.roll === "slider" || t.slot === "slider-thumb").length,
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
const cx = cdpTill(ws);
await cx.send("Emulation.setUserAgentOverride", { userAgent: UA_IPHONE });
await cx.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await cx.send("Network.enable", {});
await cx.send("Network.setCacheDisabled", { cacheDisabled: true });

const rapport = {
  verktyg: "verktyg/_s7u2o128-slider-sond.mjs (flikklick-variant av o123-sonden)",
  etikett: ETIKETT,
  datum: new Date().toISOString(), mal: BAS, visport: "390×844, DSF 2, iPhone-UA",
  target: "52 px tryckyta (husstandard våg 93 C3); golvet globals.css ≤640px: button min 52",
  resultat: [],
};
try {
  for (const m of MAL) {
    process.stdout.write(`Mäter ${m.sokvag} [${m.steg.map((s) => s.typ).join("→")}] … `);
    try {
      const r = await mataMal(cx, m);
      rapport.resultat.push(r);
      console.log(`${r.antalTummar} tummar (${r.tummarMonteradeSynliga} synliga) · tryckmål under 52: ${r.tryckmalUnder52}`);
    } catch (e) {
      rapport.resultat.push({ sokvag: m.sokvag, fel: String(e?.message ?? e) });
      console.log("FEL", e?.message ?? e);
    }
    await cx.send("Page.navigate", { url: "about:blank" });
    await SLEEP(700);
  }
} finally {
  writeFileSync(UTFIL, JSON.stringify(rapport, null, 1) + "\n");
  try { ws.close(); } catch {}
  try { barn.kill(); } catch {}
}
console.log(`Skriven: ${UTFIL}`);
