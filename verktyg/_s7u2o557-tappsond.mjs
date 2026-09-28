#!/usr/bin/env node
/**
 * o557 (s7-u2, 2026-09-28): 52px-TAPPSOND — rapportbyggarfamiljens jungfrumark.
 * Samma mätsemantik som verktyg/mobil-lasbarhet.mjs (o8/o122-kontraktet:
 * interaktiva element med min(w,h) < 52 px + input-zom (font < 16 px)),
 * körd via egen CDP-port 9366 och Chrome-uppslag anpassat för SSD Nodes
 * (v190: Chrome-for-Testing i ~/.cache/puppeteer — inget /usr/bin/google-chrome).
 * Originalets mätlogik är låst av andra vågor; detta är en namnrymd-säker
 * kopia för o557:s sidutval.
 *
 * Anrop: node verktyg/_s7u2o557-tappsond.mjs <bas> <utfil.json> [sokvag…]
 */
import { spawn } from "node:child_process";
import { accessSync, readdirSync, writeFileSync } from "node:fs";

const BAS = process.argv[2] || "http://localhost:3000";
const UTFIL = process.argv[3] || "/tmp/o557-tappsond.json";
const SIDOR = process.argv.slice(4).length
  ? process.argv.slice(4)
  : ["/rapporter", "/rapportakademin"];
const PORT = 9366;
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

function hittaChrome() {
  let cache = [];
  try {
    const kat = `${process.env.HOME}/.cache/puppeteer/chrome`;
    cache = readdirSync(kat)
      .filter((d) => d.startsWith("linux-"))
      .sort()
      .flatMap((d) => [`${kat}/${d}/chrome-linux64/chrome`]);
  } catch { /* ingen cache — vidare */
  }
  for (const k of [process.env.AK1A_CHROME, process.env.CHROME_PATH, ...cache, "/usr/bin/google-chrome"].filter(Boolean)) {
    try { accessSync(k); return k; } catch {}
  }
  throw new Error("Ingen Chrome-binär (AK1A_CHROME/CHROME_PATH/puppeteer-cache/system)");
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
      text: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 48),
      w: Math.round(r.width), h: Math.round(r.height),
      font: parseFloat(st.fontSize) || null,
    });
  }
  return element;
})()`;

const REDO_UTTRYCK = `(() => ({
  klar: document.readyState === "complete",
  css: [...document.querySelectorAll('link[rel="stylesheet"]')].every((l) => l.sheet !== null),
  font: document.fonts.status,
}))()`;

async function main() {
  const bin = hittaChrome();
  const barn = spawn(bin, [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=/tmp/ak1a-o557-tappsond-profil",
    "about:blank",
  ], { stdio: "ignore" });
  try {
    let mal = null;
    for (let i = 0; i < 40 && !mal; i++) {
      try {
        const r = await fetch(`http://127.0.0.1:${PORT}/json`);
        if (r.ok) {
          const lista = (await r.json()).filter((t) => t.type === "page");
          if (lista.length) mal = lista[0];
        }
      } catch { /* chrome vaknar */
      }
      if (!mal) await SLEEP(250);
    }
    if (!mal) throw new Error("Chrome svarade inte på CDP-porten");
    const ws = new WebSocket(mal.webSocketDebuggerUrl);
    await new Promise((los, fel) => { ws.onopen = los; ws.onerror = fel; });
    let id = 0;
    const vantar = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && vantar.has(m.id)) { vantar.get(m.id)(m); vantar.delete(m.id); }
    };
    const send = (method, params) =>
      new Promise((los, fel) => {
        const i = ++id;
        vantar.set(i, los);
        ws.send(JSON.stringify({ id: i, method, params }));
        setTimeout(() => { if (vantar.has(i)) { vantar.delete(i); fel(new Error("CDP-timeout: " + method)); } }, 30000);
      });

    await send("Emulation.setDeviceMetricsOverride", {
      width: 390, height: 844, deviceScaleFactor: 3, mobile: true,
    });
    await send("Network.setUserAgentOverride", { userAgent: UA_IPHONE });
    await send("Emulation.setCPUThrottlingRate", { rate: 1 });

    const rapport = { datum: new Date().toISOString(), bas: BAS, sidor: [] };
    for (const sokvag of SIDOR) {
      await send("Page.navigate", { url: `${BAS}${sokvag}` });
      for (let i = 0; i < 40; i++) {
        const redo = await send("Runtime.evaluate", { expression: REDO_UTTRYCK, returnByValue: true });
        const v = redo?.result?.result?.value ?? {};
        if (v.klar && v.css && v.font === "loaded") break;
        await SLEEP(300);
      }
      await SLEEP(1000);
      const svar = await send("Runtime.evaluate", { expression: MAT_UTTRYCK, returnByValue: true });
      const element = svar?.result?.result?.value ?? [];
      const under52 = element.filter((e) => Math.min(e.w, e.h) < 52);
      const inputZoom = element.filter(
        (e) => ["input", "select", "textarea"].includes(e.tag) && e.font != null && e.font < 16
      );
      rapport.sidor.push({
        sokvag,
        interaktiva: element.length,
        tryckmalUnder52: under52.length,
        varsta: under52
          .sort((a, b) => Math.min(a.w, a.h) - Math.min(b.w, b.h))
          .slice(0, 12),
        inputZoom: inputZoom.length,
      });
      console.log(`${sokvag}: ${element.length} interaktiva · ${under52.length} under 52px · ${inputZoom.length} input-zoom`);
    }
    writeFileSync(UTFIL, JSON.stringify(rapport, null, 2) + "\n");
    console.log("Utfil →", UTFIL);
  } finally {
    try { barn.kill(); } catch {}
  }
}

main().catch((e) => { console.error("FEL:", e.message); process.exit(1); });
