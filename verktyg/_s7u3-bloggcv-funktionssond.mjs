#!/usr/bin/env node
/**
 * AK1A — ENGÅNGSSOND (s7-u3 3/3, 2026-09-16): cv-bloggkort EFTER-
 * verifiering i deployat bygge — speglar prestanda-cv-funktionssond.mjs
 * (o20 §9-mönstret) men mot /blogg + .cv-bloggkort (o28 §6).
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const BAS = process.argv[2] || "http://localhost:3000";
const UTFIL = process.argv[3] ||
  "data/forskning/OPTIMERING/lighthouse/s7u3-funktionssond-bloggcv-EFTER-2026-09-16.json";
const PORT = 9341;
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function waitForJson(url, forsok = 40) {
  for (let i = 0; i < forsok; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch {}
    await SLEEP(250);
  }
  throw new Error(`når inte ${url}`);
}

const url = `${BAS}/blogg`;
const chrome = spawn("google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/ak1a-bloggcv-profil",
], { stdio: "ignore" });

try {
  await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
  const nySida = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
    method: "PUT",
  }).then((r) => r.json());
  const page = cdp(new WebSocket(nySida.webSocketDebuggerUrl));
  await page.oppen;

  await page.send("Emulation.setDeviceMetricsOverride", {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
  });
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Page.navigate", { url });
  await SLEEP(6500);

  const utvardera = `(function(){
    const kort = document.querySelectorAll('.cv-bloggkort');
    const st = (el) => el ? getComputedStyle(el) : null;
    const forsta = kort[0], stF = st(forsta);
    const sista = kort[kort.length-1], stS = st(sista);
    return {
      antalBloggkort: kort.length,
      domNoder: document.getElementsByTagName('*').length,
      cvForsta: stF ? stF.contentVisibility : null,
      cvSista: stS ? stS.contentVisibility : null,
      intrinsicForsta: stF ? stF.containIntrinsicSize : null,
      hojdForstaPx: forsta ? Math.round(forsta.getBoundingClientRect().height) : null,
      hojdSistaPx: sista ? Math.round(sista.getBoundingClientRect().height) : null,
      animationerVidLast: document.getAnimations().length,
    };
  })()`;
  const vidLast = (await page.send("Runtime.evaluate", {
    expression: utvardera, returnByValue: true,
  })).result.value;

  // Scroll långt ned — offscreen-kort skall bli renderade (CV auto)
  await page.send("Runtime.evaluate",
    { expression: `window.scrollTo(0, document.body.scrollHeight)` });
  await SLEEP(2500);

  const efterScroll = (await page.send("Runtime.evaluate", {
    expression: `(function(){
      const kort = document.querySelectorAll('.cv-bloggkort');
      const medInnehall = [...kort].filter(d =>
        d.textContent && d.textContent.trim().length > 40).length;
      return {
        kortMedTextEfterScroll: medInnehall,
        hojdSistaEfterPx: kort.length ?
          Math.round(kort[kort.length-1].getBoundingClientRect().height) : null,
        cvFortfarande: kort.length ?
          getComputedStyle(kort[kort.length-1]).contentVisibility : null,
      };
    })()`,
    returnByValue: true,
  })).result.value;

  const resultat = {
    datum: new Date().toISOString(), url, vy: "390x844 mobil",
    vidLast, efterScroll,
    domOk: vidLast.antalBloggkort >= 50 &&
      vidLast.cvForsta === "auto" && vidLast.cvSista === "auto",
  };
  writeFileSync(UTFIL, JSON.stringify(resultat, null, 2));
  console.log(JSON.stringify(resultat, null, 2));
  page.stang();
} finally {
  chrome.kill("SIGKILL");
}
