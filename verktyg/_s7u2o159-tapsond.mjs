#!/usr/bin/env node
/**
 * AK1A — o159 (Spår 7, s7-u2): TAPPINGSYTA-SOND — 52px-target på bolags-
 * familjens jungfruytor: /data/nyckeltalsguide · /bolag · /bolag/eqnr-ol.
 * CDP computed-rect (o126-domsond-mönstret); fynd = interaktiv kontroll med
 * tryckyta < 52×52 px (båda axlarna — breda textlänkar är OK praxis).
 * Engångsverktyg, commitas som underlag. Endast JSON-fakta — dom av levande våg.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";

const BAS = "http://localhost:3000"; // loopback whitelistad i middleware
const PORT = 9367;
const SIDOR = ["/data/nyckeltalsguide", "/bolag", "/bolag/eqnr-ol"];
const UTFIL = "data/forskning/OPTIMERING/lighthouse/tapsond-o159-bolagsfamiljen-mobil.json";
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

// RAM-vakt (spårets mät kontrakt ≥ 1 500 MB)
const ramMB = Math.round(
  Number(/MemAvailable:\s+(\d+) kB/.exec(readFileSync("/proc/meminfo", "utf8"))[1]) / 1024,
);
if (ramMB < 1500) {
  console.error(`AVBRUTEN: RAM ${ramMB} < 1500 MB`);
  process.exit(2);
}

const PROFIL = "/tmp/ak1a-o159-tapsond-profil";
rmSync(PROFIL, { recursive: true, force: true });
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--disable-extensions",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFIL}`,
  "about:blank",
], { stdio: "ignore" });

try {
  let wsUrl = null;
  for (let i = 0; i < 40 && !wsUrl; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json`);
      if (r.ok) {
        const mal = (await r.json()).filter((t) => t.type === "page");
        if (mal.length) wsUrl = mal[0].webSocketDebuggerUrl;
      }
    } catch {}
    if (!wsUrl) await SLEEP(250);
  }
  if (!wsUrl) throw new Error("Chrome svarade inte");
  const ws = new WebSocket(wsUrl);
  await new Promise((los) => { ws.onopen = los; });
  let id = 0;
  const vantar = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && vantar.has(msg.id)) { const { los } = vantar.get(msg.id); vantar.delete(msg.id); los(msg); }
  };
  const send = (metod, params = {}) => new Promise((los, avvisa) => {
    const i = ++id; vantar.set(i, { los });
    ws.send(JSON.stringify({ id: i, method: metod, params }));
    setTimeout(() => { if (vantar.has(i)) { vantar.delete(i); avvisa(new Error("CDP-timeout: " + metod)); } }, 30000);
  });

  await send("Emulation.setUserAgentOverride", { userAgent: UA_IPHONE });
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Network.enable", {});
  await send("Network.setCacheDisabled", { cacheDisabled: true });

  const rapport = { ts: new Date().toISOString(), ramMB, bas: BAS, viewport: "390x844", sidor: [] };

  for (const sida of SIDOR) {
    await send("Page.navigate", { url: BAS + sida });
    for (let i = 0; i < 50; i++) {
      const r = await send("Runtime.evaluate", {
        expression: "document.readyState === 'complete' && document.fonts.status",
        returnByValue: true,
      });
      if (r?.result?.result?.value === true) break;
      await SLEEP(300);
    }
    await SLEEP(2500); // settle (layout + eventuell ISR-font)
    const m = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const SEL = "a, button, summary, input, select, textarea, [role=button], [role=tab]";
        const alla = [], fynd = [];
        for (const el of document.querySelectorAll(SEL)) {
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) continue; // dolda/avgångna
          const w = Math.round(r.width), h = Math.round(r.height);
          const text = (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 40);
          const post = {
            tag: el.tagName.toLowerCase(),
            text,
            yta: w + "x" + h,
            klass: (el.getAttribute("class") || "").slice(0, 110),
            href: (el.getAttribute("href") || "").slice(0, 60),
          };
          alla.push(post);
          if (w < 52 && h < 52) fynd.push({ ...post, vikt: w * h });
        }
        fynd.sort((a, b) => a.vikt - b.vikt);
        return {
          interaktiva: alla.length,
          fyndAntal: fynd.length,
          fynd: fynd.slice(0, 25),
        };
      })()`,
    });
    const d = m.result.result.value;
    rapport.sidor.push({ sida, ...d });
    console.log(`${sida}: ${d.interaktiva} interaktiva · ${d.fyndAntal} under 52x52`);
    for (const f of d.fynd.slice(0, 8)) console.log(`   ${f.yta} <${f.tag}> "${f.text}" klass="${f.klass.slice(0, 60)}"`);
  }

  writeFileSync(UTFIL, JSON.stringify(rapport, null, 2));
  console.log("Skriven → " + UTFIL);
} finally {
  try { barn.kill("SIGTERM"); } catch {}
  await SLEEP(500);
  rmSync(PROFIL, { recursive: true, force: true });
}
