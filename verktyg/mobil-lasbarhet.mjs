#!/usr/bin/env node
/**
 * AK1A mobil-läsbarhetsaudit — Spår 7 (s7-u2): "mobil läsbarhet ≥52px-target".
 *
 * Mäter PUBLIKA sidor i headless Chrome (CDP, egen port — kolliderar inte
 * med prestanda-mätarnas 9333) i mobilvy 390×844 med vanlig iPhone-UA
 * (undviker bot-klassificeringen i middleware) och granskar:
 *   1. TRYCKMÅL: interaktiva element med min(w,h) < 52 px (husstandard
 *      "52 px-tryckyta" sedan våg 93 C3 — studio har den, publika ytor
 *      har aldrig mätts). WCAG 2.5.8 kräver 24 px; Android 48 dp; huset 52.
 *   2. INPUT-ZOOM: input/select/textarea med font-size < 16 px → iOS
 *      auto-zoomar vid fokus (klassisk mobil-läsbarhetsfälla).
 *
 * Ingen installation: node >=22 global WebSocket + /usr/bin/google-chrome.
 * RAM-vakt: vägrar starta under 700 MB tillgängligt (prod bor på servern).
 *
 * o62 (2026-09-18): stil/font-settle + stabilitetspass — den fasta 4,5 s-
 *   väntan gav fantomfynd (element mättes 44 px som i settlat läge mäter
 *   52) när servern bar samtidig mät-/bygglast; bevis i
 *   data/forskning/OPTIMERING/o62-mobil-lasbarhet-metrologi-s7.md.
 *
 * Användning:
 *   node verktyg/mobil-lasbarhet.mjs [bas-url] [utfil.json] [sidor…]
 *   node verktyg/mobil-lasbarhet.mjs https://lab.ak1nvestor.com /tmp/före.json
 *
 * Utdata: JSON med per-sida { antal, tryckmalUnder52, varsta[], inputZoom[] }
 * + konsoltabell. Före/efter: kör två gånger (före/efter bygge) och jämför.
 */

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BAS = process.argv[2] || "https://lab.ak1nvestor.com";
const UTFIL = process.argv[3] || "/tmp/ak1a-mobil-lasbarhet.json";
const SIDOR = process.argv.slice(4).length
  ? process.argv.slice(4)
  : ["/", "/kurser", "/blogg", "/portfolj-forskning", "/forskningsbiblioteket", "/kurser/the-intelligent-investor"];

const PORT = 9337;
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const TARGET_MS = 52; // husstandard: 52 px tryckyta
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

function ramTillgangligtMB() {
  try {
    const r = readFileSync("/proc/meminfo", "utf8");
    return Math.round(Number(r.match(/MemAvailable:\s+(\d+) kB/)?.[1] ?? 0) / 1024);
  } catch {
    return 0;
  }
}

/** Starta Chrome och returnera websocket-URL:en till första sidfliket. */
async function startaChrome() {
  const barn = spawn("/usr/bin/google-chrome", [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=/tmp/ak1a-lasbarhet-profil",
    "about:blank",
  ], { stdio: "ignore", detached: false });
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json`);
      if (r.ok) {
        const mål = (await r.json()).filter((t) => t.type === "page");
        if (mål.length) return { barn, ws: mål[0].webSocketDebuggerUrl };
      }
    } catch { /* chrome håller på att vakna */
    }
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

/** DOM-uttrycket som plockar interaktiva elementens geometri i sidkontext. */
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
      typ: el.getAttribute("type"),
      visning: st.display,
    });
  }
  return element;
})()`;

async function mataSida(send, sokvag) {
  await send("Page.navigate", { url: `${BAS}${sokvag}` });
  // o62: vänta på riktigt settle — readyState complete + ALLA stylesheet-
  // länkar laddade (link.sheet !== null) + webfonterna klara — innan mätning.
  // Fast väntetid räcker inte under samtidig serverlast (fantomfyndens rot).
  const REDO_UTTRYCK = `(() => ({
    klar: document.readyState === "complete",
    css: [...document.querySelectorAll('link[rel="stylesheet"]')].every((l) => l.sheet !== null),
    font: document.fonts.status,
  }))()`;
  for (let i = 0; i < 40; i++) {
    const redo = await send("Runtime.evaluate", { expression: REDO_UTTRYCK, returnByValue: true });
    const v = redo?.result?.value ?? {};
    if (v.klar && v.css && v.font === "loaded") break;
    await SLEEP(300);
  }
  await SLEEP(1000); // omflöde efter sista resursen (layout settle)
  // CDP-svaret är {id, result: {result: <RemoteObject>, exceptionDetails?}}
  const lasDom = async () => {
    const svar = await send("Runtime.evaluate", {
      expression: MAT_UTTRYCK,
      returnByValue: true,
    });
    const skal = svar?.result ?? {};
    if (skal.exceptionDetails) {
      const d = skal.exceptionDetails;
      throw new Error(`evaluate kastade: ${d.exception?.description ?? d.text}`);
    }
    return skal.result?.value ?? [];
  };
  let element = await lasDom();
  if (element.length === 0) {
    // Tom DOM = kraschad/trött renderer eller sen hydratisering — ett omförsök
    await SLEEP(6000);
    element = await lasDom();
  }
  if (element.length === 0) {
    return { sokvag, fel: "tom DOM efter två försök (kraschad flik?)" };
  }
  // o62-stabilitetspass: mät igen efter 1,5 s — geometrin ska vara identisk
  // när layouten settleat; skiljer sig två gånger = fortfarande i rörelse →
  // sista passet gäller och raden flaggas ostabil (ärlighet över siffror).
  let ostabil = false;
  for (let i = 0; i < 2; i++) {
    await SLEEP(1500);
    const ny = await lasDom();
    const tal = (ls) => JSON.stringify(ls.map((e) => `${e.tag}:${e.w}x${e.h}`));
    if (tal(ny) === tal(element)) break;
    element = ny;
    ostabil = i === 1;
  }
  // Prosa-länkar (display:inline i löpande text) är berättigade undantag —
  // WCAG 2.5.8 räknar inte textförlöpande länkar som tryckmål.
  const prosa = element.filter((e) => e.tag === "a" && e.visning === "inline");
  const riktiga = element.filter((e) => !(e.tag === "a" && e.visning === "inline"));
  const tryckmal = riktiga
    .map((e) => ({ ...e, min: Math.min(e.w, e.h) }))
    .filter((e) => e.min < TARGET_MS)
    .sort((a, b) => a.min - b.min);
  const inputZoom = riktiga.filter(
    (e) => ["input", "select", "textarea"].includes(e.tag) && e.font != null && e.font < 16,
  );
  return {
    sokvag,
    antalInteraktiva: riktiga.length,
    prosaLankarUndantagna: prosa.length,
    tryckmalUnder52: tryckmal.length,
    varsta: tryckmal.slice(0, 25),
    inputZoom: inputZoom.length,
    inputZoomVarsta: inputZoom.slice(0, 10),
    ostabilMatning: ostabil,
  };
}

// ── Huvudprogram ────────────────────────────────────────────────────────────
const ram = ramTillgangligtMB();
if (ram < 700) {
  console.error(`RAM-vakt: ${ram} MB tillgängligt < 700 MB — mäter inte (prod vinner).`);
  process.exit(2);
}

const { barn, ws: wsUrl } = await startaChrome();
const ws = new WebSocket(wsUrl);
await new Promise((los) => { ws.onopen = los; });
const send = cdpTill(ws);
await send("Emulation.setUserAgentOverride", { userAgent: UA_IPHONE });
await send("Emulation.setDeviceMetricsOverride", {
  width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
});

const rapport = {
  verktyg: "verktyg/mobil-lasbarhet.mjs",
  datum: new Date().toISOString(),
  mal: BAS,
  visport: "390×844, DSF 2, iPhone-UA",
  target: `${TARGET_MS} px tryckyta (husstandard våg 93 C3); input ≥16 px mot iOS-zoom`,
  sidor: [],
};
try {
  for (const s of SIDOR) {
    process.stdout.write(`Mäter ${s} … `);
    try {
      const r = await mataSida(send, s);
      rapport.sidor.push(r);
      console.log(
        `${r.antalInteraktiva} interaktiva · ${r.tryckmalUnder52} under ${TARGET_MS}px · ${r.inputZoom} zoomfällor`,
      );
    } catch (e) {
      rapport.sidor.push({ sokvag: s, fel: String(e).slice(0, 300) });
      console.log(`FEL: ${String(e).slice(0, 160)}`);
    }
    // Renderer-byte mellan sidor: navigera till about:blank så en kraschad
    // eller trött renderer byts ut innan nästa sida (bevisat: /blogg mäter
    // 0 i sekvens men 61 isolerat).
    try { await send("Page.navigate", { url: "about:blank" }); } catch {}
    await SLEEP(1000);
  }
} finally {
  try { ws.close(); } catch {}
  try { barn.kill(); } catch {}
}

writeFileSync(UTFIL, JSON.stringify(rapport, null, 2) + "\n");
const totUnder = rapport.sidor.reduce((a, s) => a + (s.tryckmalUnder52 ?? 0), 0);
const totZoom = rapport.sidor.reduce((a, s) => a + (s.inputZoom ?? 0), 0);
console.log(`\nTotalt: ${totUnder} tryckmål under ${TARGET_MS}px · ${totZoom} input-zoomfällor`);
console.log(`Bokad → ${UTFIL}`);
if (totUnder === 0 && totZoom === 0) console.log("GRÖN — husstandarden håller överallt.");
