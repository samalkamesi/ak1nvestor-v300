#!/usr/bin/env node
/**
 * AK1A — CV-FUNKTIONSSOND (spår 7, o20 §9: EFTER-verifiering).
 *
 * Verifierar funktionen efter /kurser-kurerna (50463d80 skelett +
 * 87af4874 content-visibility) i ETT kör:
 *  A. VID LAST (mobilvy, ingen scroll):
 *     · content-visibility:active på registerkort + utvalda kort
 *     · containIntrinsicSize satt (reservhöjd)
 *     · skelett-spanen STATISK (animationName none) — u3:s kur
 *     · document.getAnimations().length — pref ≈ få (ej 29)
 *  B. EFTER SCROLL till registret (IO rootMargin 400px avfyrar):
 *     · hämtning sker (api/kurs-anrop)
 *     · pulsen (animate-pulse) syns under hämtningen — fångas genom
 *       polling; lokala fetcher är snabba, fångst är nice-to-have
 *     · text ersätter skelett (skeleton-spanen borta)
 *     · verklig korthöjd vs reservhöjd (CLS-integritet)
 *
 * Användning:
 *   node verktyg/prestanda-cv-funktionssond.mjs [bas] [utfil.json]
 * Inga npm-paket (node >=22 WebSocket). Skrivskyddad mot projektet.
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const BAS = process.argv[2] || "http://localhost:3000";
const UTFIL = process.argv[3] || "data/forskning/OPTIMERING/lighthouse/s7u1-funktionssond-cv-2026-09-16.json";
const PORT = 9339;
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

const url = `${BAS}/kurser`;
const chrome = spawn("google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/ak1a-cvfunk-profil",
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
  await SLEEP(6500); // load + hydratisering + eventuell fetch-våg

  const utvardera = `(function(){
    const kort = document.querySelectorAll('li.cv-registerkort');
    const utvalda = document.querySelectorAll('li.cv-utvalt');
    const skelett = [...document.querySelectorAll('span[class*="h-[3.25rem]"]')];
    const st = (el) => el ? getComputedStyle(el) : null;
    const forsta = kort[0], stF = st(forsta);
    const stU = st(utvalda[0]);
    return {
      antalRegisterkort: kort.length,
      antalUtvalda: utvalda.length,
      cvRegister: stF ? stF.contentVisibility : null,
      cvUtvalt: stU ? stU.contentVisibility : null,
      intrinsicRegister: stF ? stF.containIntrinsicSize : null,
      intrinsicUtvalt: stU ? stU.containIntrinsicSize : null,
      antalSkelett: skelett.length,
      skelettAnimation: skelett[0] ? st(skelett[0]).animationName : null,
      animationerVidLast: document.getAnimations().length,
      kortHojdPx: forsta ? forsta.getBoundingClientRect().height : null,
    };
  })()`;
  const vidLast = (await page.send("Runtime.evaluate", {
    expression: utvardera, returnByValue: true,
  })).result.value;

  // Scroll till registret — IO (400px marginal) avfyrar hämtning
  await page.send("Runtime.evaluate", {
    expression: `window.scrollTo(0, document.body.scrollHeight * 0.55)`,
  });
  const pulsFangad = [];
  for (let i = 0; i < 24; i++) {
    await SLEEP(250);
    const p = (await page.send("Runtime.evaluate", {
      expression: `(function(){
        const s = document.querySelector('span[class*="h-[3.25rem]"]');
        return s ? getComputedStyle(s).animationName : null;
      })()`,
      returnByValue: true,
    })).result.value;
    if (p) pulsFangad.push(p);
  }
  await SLEEP(1500); // låt fetcher landa

  const efterScroll = (await page.send("Runtime.evaluate", {
    expression: `(function(){
      const kort = document.querySelectorAll('li.cv-registerkort');
      const skelett = [...document.querySelectorAll('span[class*="h-[3.25rem]"]')];
      const textFyllda = [...kort].filter(li =>
        li.textContent && li.textContent.trim().length > 60).length;
      return {
        kortSynligaHojdPx: kort[10] ? Math.round(kort[10].getBoundingClientRect().height) : null,
        antalSkelettKvar: skelett.length,
        kortMedText: textFyllda,
        animationerEfter: document.getAnimations().length,
        cvFortfarande: kort[0] ? getComputedStyle(kort[0]).contentVisibility : null,
      };
    })()`,
    returnByValue: true,
  })).result.value;

  // api-konto via prestandans resurser (undviker Network-domänens lås-risk)
  const resurser = (await page.send("Runtime.evaluate", {
    expression: `performance.getEntriesByType('resource').filter(r => r.name.includes('/api/kurs')).length`,
    returnByValue: true,
  })).result.value;

  const resultat = {
    datum: new Date().toISOString(), url, vy: "390x844 mobil",
    vidLast, pulsSekvens: pulsFangad, efterScroll, apiKursAnrop: resurser,
    domOk: vidLast.antalRegisterkort === 24 && vidLast.antalUtvalda >= 6,
  };
  writeFileSync(UTFIL, JSON.stringify(resultat, null, 2));
  console.log(JSON.stringify(resultat, null, 2));
  page.stang();
} finally {
  chrome.kill("SIGKILL");
}
