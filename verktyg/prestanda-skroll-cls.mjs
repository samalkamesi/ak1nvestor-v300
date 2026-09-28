#!/usr/bin/env node
/**
 * AK1A skroll-CLS-sond — spår 7 (o558; bestående version av o159/o165:s
 * engångs-sond _s7u2o159-skrollcls.mjs som rond 227 adopterade som mätdata).
 *
 * Mäter skroll-inducerad layout-shift (CLS) på en sida i headless Chrome via
 * CDP: mobil 390x844, stegvis skroll till botten i dokumenttempo, summan av
 * layout-shift-entrys utan hadRecentInput skall vara < 0,01 (o165-domens
 * skrollvillkor). Initial-CLS (första paint) mäts separat via buffered:true
 * men ingår INTE i skrolldomen.
 *
 * SSD Nodes-notis (o558): nya servern saknar /usr/bin/google-chrome —
 * Chrome löses via CHROME_PATH (puppeteer-cachens Chrome-for-Testing):
 *   CHROME_PATH=~/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome \
 *     node verktyg/prestanda-skroll-cls.mjs /bolag utfil.json
 *
 * Laststämpel: loadavg före/efter redovisas i utdata (o155-mönstret).
 */
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SOKVAG = process.argv[2] || "/bolag";
const UTFIL = process.argv[3] || `data/forskning/OPTIMERING/lighthouse/skrollcls-${SOKVAG.replace(/\//g, "_")}.json`;
const BAS = process.env.LH_BAS || "http://localhost:3000";
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const PORT = 9337;
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));
const loadavg = () => Number(readFileSync("/proc/loadavg", "utf8").split(" ")[0]);

async function waitForJson(url, tentatives = 40) {
  for (let i = 0; i < tentatives; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch {}
    await SLEEP(250);
  }
  throw new Error(`når inte ${url}`);
}

function cdp(ws) {
  let id = 0;
  const vantar = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && vantar.has(msg.id)) {
      const { resolve, reject } = vantar.get(msg.id);
      vantar.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  };
  const oppen = new Promise((res, rej) => {
    ws.onopen = () => res();
    ws.onerror = (e) => rej(new Error("websocket: " + e.message));
  });
  return {
    oppen,
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const mid = ++id;
        vantar.set(mid, { resolve, reject });
        ws.send(JSON.stringify({ id: mid, method, params }));
      }),
    stang: () => ws.close(),
  };
}

// Initieras på NYTT dokument FÖRE sidkod — med guard (o159 §7: skriptet kan
// köras före documentElement i Chrome 153+; window finns alltid).
const INIT_SKRIPT = `
(() => {
  try {
    if (self.window && !self.__ak1aShiftBuffer) {
      self.__ak1aShiftBuffer = [];
      new PerformanceObserver((lista) => {
        for (const e of lista.getEntries()) {
          if (!e.hadRecentInput) self.__ak1aShiftBuffer.push({ v: e.value, t: Math.round(e.startTime) });
        }
      }).observe({ type: "layout-shift", buffered: true });
    }
  } catch (e) {}
})();`;

async function main() {
  const lastFore = loadavg();
  const profil = mkdtempSync(join(tmpdir(), "ak1a-skroll-"));
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--mute-audio",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profil}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );
  console.error(`chrome pid ${chrome.pid} (${CHROME})`);

  try {
    await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
    const nySida = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
    const conn = cdp(new WebSocket(nySida.webSocketDebuggerUrl));
    await conn.oppen;

    await conn.send("Page.enable");
    await conn.send("Runtime.enable");
    await conn.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await conn.send("Page.addScriptToEvaluateOnNewDocument", { source: INIT_SKRIPT });

    let loadOk = false;
    // Page.loadEventFired: cdp()-hanteraren ovan stödjer bara svar — pollning
    // av dokumentets readyState i stället (robust, inga extra lyssnare).
    await conn.send("Page.navigate", { url: BAS + SOKVAG });
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      const { result } = await conn.send("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      if (result.value === "complete") { loadOk = true; break; }
      await SLEEP(200);
    }
    if (!loadOk) throw new Error("loadEvent-timeout");
    await SLEEP(2500); // låt hydrering + LCP måla klart

    // Fallback-init om addScript underlöst tyst (o159 §7): initiera NU —
    // initial-shifts förloras, skroll-domen opåverkad (nollställning nedan).
    const initKoll = await conn.send("Runtime.evaluate", {
      expression: "typeof self.__ak1aShiftBuffer !== 'undefined'",
      returnByValue: true,
    });
    if (!initKoll.result.value) {
      await conn.send("Runtime.evaluate", { expression: INIT_SKRIPT, returnByValue: true });
    }

    const hojdExpr = await conn.send("Runtime.evaluate", {
      expression: "Math.round(document.documentElement.scrollHeight)",
      returnByValue: true,
    });
    const docHojd = hojdExpr.result.value;

    // Nollställ bufferten så domen mäter ENBART skroll-inducerade skift.
    await conn.send("Runtime.evaluate", { expression: "self.__ak1aShiftBuffer = []", returnByValue: true });

    // Stegskroll i dokumenttempo (600 px/250 ms + 350 ms andetag per steg).
    let y = 0;
    let steg = 0;
    while (y < docHojd) {
      y = Math.min(y + 600, docHojd);
      await conn.send("Runtime.evaluate", {
        expression: `window.scrollTo(0, ${y})`,
        returnByValue: true,
      });
      steg++;
      await SLEEP(250);
    }
    await SLEEP(2000); // låt sista cv-sektionerna rendera och skifta klart

    const shiftsExpr = await conn.send("Runtime.evaluate", {
      expression: "JSON.stringify(self.__ak1aShiftBuffer || [])",
      returnByValue: true,
    });
    const shifts = JSON.parse(shiftsExpr.result.value || "[]");
    const summa = shifts.reduce((a, s) => a + s.v, 0);

    const ut = {
      ts: new Date().toISOString(),
      sokvag: SOKVAG,
      bas: BAS,
      verktyg: "verktyg/prestanda-skroll-cls.mjs (CDP, mobil 390x844, stegskroll 600px/250ms)",
      chrome: CHROME,
      docHojd,
      skrollSteg: steg,
      shifts,
      summaShifts: Number(summa.toFixed(6)),
      antalShifts: shifts.length,
      dom: summa < 0.01 ? "GRÖN" : "RÖD",
      lastFore,
      lastEfter: loadavg(),
    };
    writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
    console.error(`${SOKVAG}: docHöjd ${docHojd} · ${steg} steg · ${shifts.length} skift · summa ${ut.summaShifts} · ${ut.dom}`);
    try {
      await fetch(`http://127.0.0.1:${PORT}/json/close/${nySida.id}`);
    } catch {}
  } finally {
    setTimeout(() => {
      try { chrome.kill("SIGKILL"); } catch {}
    }, 1500);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("FEL:", e.message);
  process.exit(1);
});
