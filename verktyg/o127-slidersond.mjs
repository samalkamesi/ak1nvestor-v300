#!/usr/bin/env node
/**
 * o127-slider-sond (s7-u1): tryckmålsmätning I OUMOUNTADE FLIKAR —
 * rundens nyverktyg (o123 §"Medvetet kvar": "verktyget behöver
 * tabbklick-läge först"). Mönstret är _s7u2o123-sond.mjs (samma
 * CDP-uppsättning, RAM-vakt, settle-logik, o123-läxans cache-disable)
 * med tillägget: klicka en [role=tab]-trigger FÖRE mätning så att
 * Radix-unmountade komponenter (kalkylatorns sliders) renderas.
 *
 * Mäter per [role=slider] (Radix-tumme): rect w×h, font, klass +
 * sidans totala tryckmål under 52 px (o123-selektorn, oförändrad).
 *
 * Användning: node verktyg/_s7u1o127-slidersond.mjs [utfil.json] [tabtext]
 *   tabtext = delsträng i trigger-knappens textContent (default
 *   "Poängsätt manuellt" på https://lab.ak1nvestor.com/kalkylator).
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const BAS = "https://lab.ak1nvestor.com";
const SIDA = "/kalkylator";
const UTFIL = process.argv[2] || "/tmp/o127-slidersond.json";
const TABTEXT = process.argv[3] || "Poängsätt manuellt";

const PORT = 9339; // egen port — kolliderar ej med lasbarhet (9337)/o123-sond (9338)/lighthouse (9333)
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

// o123-selektorn OFÖRÄNDRAD (thumb fångas via [tabindex]:not([tabindex='-1']) —
// Radix-tummen har tabindex="0"; rollen 'slider' tillagd ENDAST i slider-delen).
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
      w: Math.round(r.width), h: Math.round(r.height),
      font: parseFloat(st.fontSize) || null,
      klass: (el.getAttribute("class") || "").slice(0, 160),
      visning: st.display,
    });
  }
  return element;
})()`;

const SLIDER_UTTRYCK = `(() => {
  const tummer = [];
  for (const el of document.querySelectorAll("[role='slider']")) {
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    const rot = el.closest("[data-slot='slider']");
    tummer.push({
      w: Math.round(r.width), h: Math.round(r.height),
      font: parseFloat(st.fontSize) || null,
      ariaValueNow: el.getAttribute("aria-valuenow"),
      ariaLabel: (el.getAttribute("aria-label") || "").slice(0, 60) || null,
      tumKlass: (el.getAttribute("class") || "").slice(0, 200),
      rotKlass: rot ? (rot.getAttribute("class") || "").slice(0, 120) : null,
      rotW: rot ? Math.round(rot.getBoundingClientRect().width) : null,
      rotH: rot ? Math.round(rot.getBoundingClientRect().height) : null,
    });
  }
  return tummer;
})()`;

async function startaChrome() {
  const barn = spawn("/usr/bin/google-chrome", [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=/tmp/ak1a-o127-sond-profil",
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

async function las(send, uttryck) {
  const svar = await send("Runtime.evaluate", { expression: uttryck, returnByValue: true });
  const skal = svar?.result ?? {};
  if (skal.exceptionDetails) {
    const d = skal.exceptionDetails;
    throw new Error(`evaluate kastade: ${d.exception?.description ?? d.text}`);
  }
  return skal.result?.value;
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
// o123-läxan (metrologi-notisen): cache-disable OBLIGATORISK — profil behålls
// mellan FÖRE/EFTER-körningar, utan denna serveras cachad HTML.
await send("Network.enable", {});
await send("Network.setCacheDisabled", { cacheDisabled: true });

const rapport = {
  verktyg: "verktyg/_s7u1o127-slidersond.mjs (o123-sond + tabbklick-läge)",
  datum: new Date().toISOString(), mal: BAS + SIDA, tabtext: TABTEXT,
  visport: "390×844, DSF 2, iPhone-UA", target: `${TARGET_MS} px tryckyta`,
  steg: [],
};
try {
  await send("Page.navigate", { url: `${BAS}${SIDA}` });
  const REDO_UTTRYCK = `(() => ({
    klar: document.readyState === "complete",
    css: [...document.querySelectorAll('link[rel="stylesheet"]')].every((l) => l.sheet !== null),
    font: document.fonts.status,
  }))()`;
  for (let i = 0; i < 40; i++) {
    const v = (await las(send, REDO_UTTRYCK)) ?? {};
    if (v.klar && v.css && v.font === "loaded") break;
    await SLEEP(300);
  }
  await SLEEP(1000);

  // STEG 1: mät UNDAN klick (aktiv flik "rakna" — kontrolläge, sliders oumountade)
  const foreKlick = await las(send, MAT_UTTRYCK);
  const slidersFore = await las(send, SLIDER_UTTRYCK);
  rapport.steg.push({
    steg: "före tabbklick (aktiv flik vid sidladdning)",
    slidersISyn: slidersFore.length,
    tryckmalUnder52: foreKlick.filter((e) => !(e.tag === "a" && e.visning === "inline"))
      .filter((e) => Math.min(e.w, e.h) < TARGET_MS).length,
  });

  // STEG 2: klicka fliktriggern — Radix mountar innehållet (React async).
  // Läxa från dbgen: triggern kan ligga UTANFÖR 390×844-viewporten — el.click()
  // och koordinatklick utan scroll missar då. Kur: scrollIntoView + CDP-mus.
  const klick = await las(send, `(() => {
    const t = [...document.querySelectorAll("[role='tab']")]
      .find((b) => (b.textContent || "").includes(${JSON.stringify(TABTEXT)}));
    if (!t) return "TRIGGER SAKNAS";
    t.scrollIntoView({ block: "center" });
    return "scrollad";
  })()`);
  if (klick !== "scrollad") throw new Error(`Fliktriggern hittades inte: ${klick}`);
  await SLEEP(800);
  const pos = await las(send, `(() => {
    const t = [...document.querySelectorAll("[role='tab']")]
      .find((b) => (b.textContent || "").includes(${JSON.stringify(TABTEXT)}));
    const r = t.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  })()`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: pos.x, y: pos.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: pos.x, y: pos.y, button: "left", clickCount: 1 });
  let sliders = [];
  for (let i = 0; i < 40; i++) {
    sliders = await las(send, SLIDER_UTTRYCK);
    if (sliders.length > 0) break;
    await SLEEP(300);
  }
  if (sliders.length === 0) throw new Error("Inga [role=slider] efter klick — flikmount uteblev");

  // STEG 3: settle + mät (både sliders och sidans alla tryckmål i aktiverat läge)
  await SLEEP(1200);
  let element = await las(send, MAT_UTTRYCK);
  for (let i = 0; i < 2; i++) {
    await SLEEP(1500);
    const ny = await las(send, MAT_UTTRYCK);
    const tal = (ls) => JSON.stringify(ls.map((e) => `${e.tag}:${e.w}x${e.h}`));
    if (tal(ny) === tal(element)) break;
    element = ny;
  }
  sliders = await las(send, SLIDER_UTTRYCK);
  const riktiga = element.filter((e) => !(e.tag === "a" && e.visning === "inline"));
  const tryckmal = riktiga
    .map((e) => ({ ...e, min: Math.min(e.w, e.h) }))
    .filter((e) => e.min < TARGET_MS)
    .sort((a, b) => a.min - b.min);
  rapport.aktivFlik = {
    sliders: sliders,
    antalSliders: sliders.length,
    slidersUnder52: sliders.filter((s) => Math.min(s.w, s.h) < TARGET_MS).length,
    antalInteraktiva: riktiga.length,
    tryckmalUnder52: tryckmal.length,
    tryckmalUtanSliders: tryckmal.filter((e) => e.rol !== "slider").length,
  };
  console.log(`Före klick: ${rapport.steg[0].slidersISyn} sliders i syn · efter klick: ${sliders.length} sliders, ${sliders.filter((s) => Math.min(s.w, s.h) < TARGET_MS).length} under ${TARGET_MS} px (av ${tryckmal.length} totala tryckmål)`);
} catch (e) {
  rapport.fel = String(e?.message ?? e);
  console.log("FEL", e?.message ?? e);
} finally {
  writeFileSync(UTFIL, JSON.stringify(rapport, null, 1) + "\n");
  try { ws.close(); } catch {}
  try { barn.kill(); } catch {}
}
console.log(`Skriven: ${UTFIL}`);
