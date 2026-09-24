#!/usr/bin/env node
/**
 * o131-proxyefter (s7-u3): PROXY-EFTER-mätning av läsbarhetskurerna
 * o126 (pill important) + o127 (@layer base-kaskad) + o128 (slider-tummar)
 * mot prod-kanalen — deploy blockerad av bygg-OOM ×3 (22:00/22:10/22:21Z),
 * metoden är o129 §4:s document-start-differential (identisk kanal,
 * https://lab.ak1nvestor.com, mobil 390×844 iPhone-UA, cache avslagen).
 *
 * Differentialen speglar EXAKT det nya bygget tillför vs prod-chunken
 * (LDVlDGu2): nya globals.css-regler + de nya utility-deklarationernas
 * effekt på prod-DOM:ens klasser. !important är ett KRAV för
 * document-start-positionen (stilen landar FÖRE prodens stilmallar;
 * utan important vinner senare likvärdiga regler — size-4 etc).
 *
 * Kvarvarande skillnad mot äkta deploy, transparent bokförd: prodens
 * OSTYRADE `.flex > * {min-width:0}` kan inte tas bort via CSS — i
 * deployat läge ersätts den av @layer base-kopian. Proxyn bevisar
 * därför important-vägen (o126), som i deployat läge är redundant
 * försäkring på samma slutmål.
 *
 * Användning: node verktyg/_s7u3o131-proxyefter.mjs [utfil.json]
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const BAS = "https://lab.ak1nvestor.com"; // identisk kanal med FÖRE (o127-sonderna)
const UTFIL =
  process.argv[2] || "data/forskning/OPTIMERING/lighthouse/o131-proxyefter.json";
const PILL_FORE =
  "data/forskning/OPTIMERING/lighthouse/o127-pill-fore-kontroll.json";
const SLIDER_FORE =
  "data/forskning/OPTIMERING/lighthouse/o127-slider-fore.json";
const TABTEXT = "Poängsätt manuellt";

const PORT = 9340; // egen — ej 9333 (LH)/9337 (läsbarhet)/9338 (o123)/9339 (o127)
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const TARGET_MS = 52;
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

// Differential-CSS — speglar commit 96bd416b (o126) + c017f9bf (o127) +
// 54c95abd (o128). Selektorn [data-slot="slider-thumb"] matchar exakt
// samma element som det nya klasspaketet (max-md:size-[52px] med mera);
// pill-reglerna matchar prod-DOM:ens klasser (med och utan !-suffix).
const DIFFERENTIAL = `/* o131 proxy-differential = trädets committade kur vs prod-chunk LDVlDGu2 */
@layer base { .flex > * { min-width: 0; } .grid > * { min-width: 0; } }
@media (max-width: 767.98px) {
  .max-md\\:min-w-\\[52px\\] { min-width: 52px !important; }
  .max-md\\:min-w-\\[52px\\]\\! { min-width: 52px !important; }
  [data-slot="slider-thumb"] {
    display: flex !important;
    width: 52px !important; height: 52px !important;
    min-width: 52px !important; min-height: 52px !important;
    align-items: center !important; justify-content: center !important;
    border-radius: 0 !important;
    border-color: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
  }
}`;

const INJEKTION = `(() => {
  const st = document.createElement("style");
  st.id = "o131-proxy-differential";
  st.textContent = ${JSON.stringify(DIFFERENTIAL)};
  (document.head || document.documentElement).appendChild(st);
  return "injekterad";
})()`;

// o123-selektorn OFÖRÄNDRAD (identisk med _s7u2o123-sond/_s7u1o127-slidersond).
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
    tummer.push({
      w: Math.round(r.width), h: Math.round(r.height),
      font: parseFloat(st.fontSize) || null,
      ariaValueNow: el.getAttribute("aria-valuenow"),
      ariaLabel: (el.getAttribute("aria-label") || "").slice(0, 60) || null,
      tumKlass: (el.getAttribute("class") || "").slice(0, 200),
      differentialAktiv: !!document.getElementById("o131-proxy-differential"),
    });
  }
  return tummer;
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
  const barn = spawn("/usr/bin/google-chrome", [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=/tmp/ak1a-o131-sond-profil",
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

async function vantaRedo(send, sokvag) {
  await send("Page.navigate", { url: `${BAS}${sokvag}` });
  const REDO_UTTRYCK = `(() => ({
    klar: document.readyState === "complete",
    css: [...document.querySelectorAll('link[rel="stylesheet"]')].every((l) => l.sheet !== null),
    font: document.fonts.status,
    diff: !!document.getElementById("o131-proxy-differential"),
  }))()`;
  let diffOk = false;
  for (let i = 0; i < 40; i++) {
    const v = (await las(send, REDO_UTTRYCK)) ?? {};
    diffOk = v.diff;
    if (v.klar && v.css && v.font === "loaded" && v.diff) break;
    await SLEEP(300);
  }
  if (!diffOk) {
    // Fallback (bokförd metodnot): document-start-skriptet nådde ej sidan —
    // injicera direkt efter redo. EKVIVALENS: de avgörande deklarationerna
    // bär !important, så sen position efter prodens stilmallar ändrar inte
    // beräknade värden (endast @layer base-kopian är positionskänslig, och
    // den är kaskadmässigt överhoppad av prodens ostyrade original ändå).
    const sv = await las(send, INJEKTION);
    diffOk = sv === "injekterad" && !!(await las(send, REDO_UTTRYCK))?.diff;
    rapport.fallbackInjektion = rapport.fallbackInjektion || {};
    rapport.fallbackInjektion[sokvag] = diffOk;
  }
  if (!diffOk) throw new Error("differentialen injekterades ej på " + sokvag);
  await SLEEP(1000);
}

async function settle(send) {
  let element = await las(send, MAT_UTTRYCK);
  for (let i = 0; i < 2; i++) {
    await SLEEP(1500);
    const ny = await las(send, MAT_UTTRYCK);
    const tal = (ls) => JSON.stringify(ls.map((e) => `${e.tag}:${e.w}x${e.h}`));
    if (tal(ny) === tal(element)) break;
    element = ny;
  }
  return element;
}

function tryckmal(element) {
  const riktiga = element.filter((e) => !(e.tag === "a" && e.visning === "inline"));
  return riktiga
    .map((e) => ({ ...e, min: Math.min(e.w, e.h) }))
    .filter((e) => e.min < TARGET_MS)
    .sort((a, b) => a.min - b.min);
}

const ram = ramTillgangligtMB();
if (ram < 700) {
  console.error(`RAM-vakt: ${ram} MB < 700 — mäter inte.`);
  process.exit(2);
}

// FÖRE-lägen låses inlästa från disk (inga dubbelmätningar — o122-konventionen)
function lasFore() {
  try {
    const p = JSON.parse(readFileSync(PILL_FORE, "utf8"));
    const s = JSON.parse(readFileSync(SLIDER_FORE, "utf8"));
    return {
      pillFore: {
        datum: p.datum, mal: p.mal,
        tryckmalUnder52: p.sidor?.[0]?.tryckmalUnder52 ?? null,
        alla: p.sidor?.[0]?.ALLA ?? [],
      },
      sliderFore: {
        datum: s.datum, mal: s.mal,
        antalSliders: s.aktivFlik?.antalSliders ?? null,
        slidersUnder52: s.aktivFlik?.slidersUnder52 ?? null,
        exempelTum: s.aktivFlik?.sliders?.[0]
          ? { w: s.aktivFlik.sliders[0].w, h: s.aktivFlik.sliders[0].h }
          : null,
      },
    };
  } catch (e) {
    return { fel: String(e?.message ?? e) };
  }
}

const rapport = {
  verktyg: "verktyg/_s7u3o131-proxyefter.mjs (o123-sond-mönstret + document-start-differential, o129 §4-metodiken)",
  datum: new Date().toISOString(), mal: BAS,
  visport: "390×844, DSF 2, iPhone-UA", target: `${TARGET_MS} px tryckyta`,
  prodBuildVidMatning: null, // fylls av anroparen i protokollet (BUILD_ID + oom-kronika)
  metod: "PROXY-EFTER: trädets committade kur-differential injekterad vid document-start mot opåverkad prod-kanal; !important är krav för document-start-position (landar före prodens stilmallar)",
  differential: DIFFERENTIAL,
  skillnadMotAldigDeploy:
    "prodens ostyrade .flex > * {min-width:0} kan ej CSS-borttags — proxyn bevisar important-vägen (o126); i deployat läge ersätts den ostyrade regeln av @layer base-kopian (o127)",
  fore: lasFore(),
  efter: {},
};

const { barn, ws: wsUrl } = await startaChrome();
const ws = new WebSocket(wsUrl);
await new Promise((los) => { ws.onopen = los; });
const send = cdpTill(ws);
try {
  await send("Emulation.setUserAgentOverride", { userAgent: UA_IPHONE });
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Network.enable", {});
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  const inj = await send("Page.addScriptToEvaluateOnNewDocument", { source: INJEKTION });
  rapport.addScriptId = inj?.result?.identifier ?? null;

  // ── 1. Pill: /dataset (o126/o127-kurens yta) ──
  process.stdout.write("Mäter /dataset (pill, proxy-EFTER) … ");
  await vantaRedo(send, "/dataset");
  const dsElement = await settle(send);
  const dsTryck = tryckmal(dsElement);
  rapport.efter.datasetPill = {
    tryckmalUnder52: dsTryck.length,
    ALLA: dsTryck,
    halsaPill: dsElement.find((e) => e.text === "Hälsa")
      ? (() => {
          const e = dsElement.find((x) => x.text === "Hälsa");
          return { w: e.w, h: e.h, min: Math.min(e.w, e.h) };
        })()
      : "finns ej i tryckmålslistan (= över 52)",
  };
  console.log(`${dsTryck.length} under ${TARGET_MS} (FÖRE: 1 — «Hälsa» 44×52)`);

  // ── 2. Slider: /kalkylator med tabbklick (o128-kurens yta) ──
  process.stdout.write("Mäter /kalkylator (slider-tummar, proxy-EFTER) … ");
  await vantaRedo(send, "/kalkylator");
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
  await SLEEP(1200);
  const kElement = await settle(send);
  sliders = await las(send, SLIDER_UTTRYCK);
  const kTryck = tryckmal(kElement);
  rapport.efter.kalkylatorSlider = {
    antalSliders: sliders.length,
    slidersUnder52: sliders.filter((s) => Math.min(s.w, s.h) < TARGET_MS).length,
    exempelTum: sliders[0] ? { w: sliders[0].w, h: sliders[0].h } : null,
    differensialAktivPoaAlla: sliders.every((s) => s.differentialAktiv),
    tryckmalUnder52: kTryck.length,
    tryckmalUtanSliders: kTryck.filter((e) => e.rol !== "slider").length,
    sliders: sliders,
  };
  console.log(`${sliders.length} sliders, ${sliders.filter((s) => Math.min(s.w, s.h) < TARGET_MS).length} under ${TARGET_MS} (FÖRE: 20/20, 16×16)`);
} catch (e) {
  rapport.fel = String(e?.message ?? e);
  console.log("FEL", e?.message ?? e);
} finally {
  writeFileSync(UTFIL, JSON.stringify(rapport, null, 1) + "\n");
  try { ws.close(); } catch {}
  try { barn.kill(); } catch {}
}
console.log(`Skriven: ${UTFIL}`);
