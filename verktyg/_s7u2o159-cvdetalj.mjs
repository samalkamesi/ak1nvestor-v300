#!/usr/bin/env node
/**
 * AK1A — o159 (Spår 7, s7-u2): CV-VERKAN-DETALJ — bevisar att kur-CSS:en
 * (section:has(> div.overflow-x-auto) + content-visibility) VERKAR:
 * offscreen-tabellsektioner ska bära platshållarhöjden exakt 87rem (1392px)
 * och computed contentVisibility "auto", medan utan-CSS-laget visar verkliga
 * varierande höjder.
 *
 * o159-läxa (bokförd): CDP med Target.*-domäner kräver BROWSER-ws
 * (/json/version) — page-ws (/json) avfärdar sessioner tyst; sessionId ska
 * på meddelandets toppnivå (flatten-läge), aldrig i params.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";

const BAS = "http://localhost:3000";
const PORT = 9372;
const KUR_CSS =
  "@media (max-width: 640px) { section:has(> div.overflow-x-auto) { content-visibility: auto; contain-intrinsic-size: auto 87rem; } }";
const UTFIL = "data/forskning/OPTIMERING/lighthouse/cvdetalj-o159-bolag.json";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

const ramMB = Math.round(
  Number(/MemAvailable:\s+(\d+) kB/.exec(readFileSync("/proc/meminfo", "utf8"))[1]) / 1024,
);
if (ramMB < 1500) { console.error(`AVBRUTEN: RAM ${ramMB} < 1500 MB`); process.exit(2); }

const PROFIL = `/tmp/ak1a-o159-cvdetalj-${Date.now()}`;
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--disable-extensions", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFIL}`, "about:blank",
], { stdio: "ignore" });

try {
  let version = null;
  for (let i = 0; i < 40 && !version; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) version = await r.json();
    } catch {}
    if (!version) await SLEEP(250);
  }
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((los) => { ws.onopen = los; });
  let id = 0;
  const vantar = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && vantar.has(msg.id)) { const los = vantar.get(msg.id); vantar.delete(msg.id); los(msg); }
  };
  const send = (metod, params = {}, session = undefined) => new Promise((los) => {
    const i = ++id; vantar.set(i, los);
    ws.send(JSON.stringify({ id: i, method: metod, params, ...(session ? { sessionId: session } : {}) }));
  });
  const svar = async (p, m) => { if (m.error || !m.result) throw new Error(`${p}: ${JSON.stringify(m).slice(0, 200)}`); return m.result; };

  const { targetId } = await svar("createTarget", await send("Target.createTarget", { url: "about:blank" }));
  const { sessionId } = await svar("attach", await send("Target.attachToTarget", { targetId, flatten: true }));
  await svar("page-enable", await send("Page.enable", {}, sessionId));
  await svar("net-enable", await send("Network.enable", {}, sessionId));
  await svar("cache-off", await send("Network.setCacheDisabled", { cacheDisabled: true }, sessionId));

  const rapport = { ts: new Date().toISOString(), ramMB, kurCss: KUR_CSS, lagen: [] };
  for (const lage of ["utan-css", "med-css"]) {
    await svar("metrics", await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true }, sessionId));
    await svar("navigate", await send("Page.navigate", { url: BAS + "/bolag" }, sessionId));
    let klar = false;
    for (let i = 0; i < 50 && !klar; i++) {
      const r = await send("Runtime.evaluate", {
        expression: "document.readyState === 'complete' && document.fonts.status", returnByValue: true,
      }, sessionId);
      klar = r?.result?.result?.value === true;
      if (!klar) await SLEEP(300);
    }
    await SLEEP(1500);
    if (lage === "med-css") {
      // o159: post-load-injektion — addScriptToEvaluateOnNewDocument kör
      // före documentElement finns i nytt dokument (tyst noll-effekt);
      // append efter load verkar direkt på layouten.
      const inj = await svar("injicera", await send("Runtime.evaluate", {
        returnByValue: true,
        expression: `(() => { const s = document.createElement("style"); s.textContent = ${JSON.stringify(KUR_CSS)}; document.head.appendChild(s); return [...document.styleSheets].some(sh => { try { return [...sh.cssRules].some(r => r.cssText.includes("content-visibility")); } catch (e) { return false; } }); })()`,
      }, sessionId));
      console.log(`  (injektion landade: ${inj.result.value})`);
      await SLEEP(800); // layout omvärderas synkront vid style-append
    }
    const m = await svar("sektioner", await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const seks = [...document.querySelectorAll("section")];
        return seks.map((s, i) => {
          const r = s.getBoundingClientRect();
          return {
            index: i,
            harTabell: !!s.querySelector(":scope > div.overflow-x-auto"),
            hojd: Math.round(r.height),
            cv: getComputedStyle(s).contentVisibility,
            rader: s.querySelectorAll("tbody tr").length,
          };
        });
      })()`,
    }, sessionId));
    const sektioner = m.result.value;
    const h = await svar("sidhojd", await send("Runtime.evaluate", {
      expression: "document.documentElement.scrollHeight", returnByValue: true,
    }, sessionId));
    rapport.lagen.push({ lage, sidhojd: h.result.value, sektioner });
    console.log(`${lage} (sidhöjd ${h.result.value}px):`);
    for (const s of sektioner) console.log(`  sektion ${s.index} tabell=${s.harTabell} höjd=${s.hojd} cv=${s.cv} rader=${s.rader}`);
  }
  writeFileSync(UTFIL, JSON.stringify(rapport, null, 2));
  console.log("Skriven → " + UTFIL);
} finally {
  try { barn.kill("SIGTERM"); } catch {}
  await SLEEP(500);
  rmSync(PROFIL, { recursive: true, force: true });
}
