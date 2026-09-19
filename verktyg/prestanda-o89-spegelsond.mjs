#!/usr/bin/env node
/**
 * AK1A — SPEGELSOND (spår 7, o89): CV-täckningen på spegelkurssidorna.
 *
 * Sonderar /en/kurser + /ar/kurser (o78:s spegelrest — KurstipsKort saknar
 * wrapper + siffrebandet saknar cv-socialproof):
 *   A. VID LAST (mobilvy 412×844, ingen scroll — samma viewport som o78:s
 *      DOM-karta): läge/höjd + computed content-visibility/contain-intrinsic
 *      på (1) kurstips-wrappern (ankare: h2 = spegelns rubriktext) och
 *      (2) siffrebandet (ankare: section[aria-label]) + under-veck-dom.
 *   B. VID SCROLL till respektive sektion: verklig renderad höjd (ej fast
 *      bränd platshållare), textinnehåll, länkantal/kortantal.
 *   C. HÖJDDRIFT: document.scrollHeight före/efter full genomscrollning —
 *      reservationens kvalitet (stavhopp = drift).
 *
 * Användning: node verktyg/prestanda-o89-spegelsond.mjs <fore|efter> [bas]
 * Utdata: data/forskning/OPTIMERING/lighthouse/spegelsond-o89-{en,ar}-<fas>.json
 * Inga npm-paket (node >=22 WebSocket). Skrivskyddad mot projektet.
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const FAS = process.argv[2] || "fore";
const BAS = process.argv[3] || "http://localhost:3000";
const PORT = 9341;
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));
const UTFIL = (fas) =>
  `data/forskning/OPTIMERING/lighthouse/spegelsond-o89-${fas}.json`;

const SPEGLAR = [
  {
    sida: "en",
    url: `${BAS}/en/kurser`,
    kurstipsRubrik: "Tips for you",
    bandAria: "AK1A Research Lab in numbers",
  },
  {
    sida: "ar",
    url: `${BAS}/ar/kurser`,
    kurstipsRubrik: "اقتراحات لك",
    bandAria: "AK1A Research Lab بالأرقام",
  },
];

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

/** Sondera en sida; sondUttryck injicerar spegelns ankare-texter. */
function sondUttryck(kurstipsRubrik, bandAria) {
  return `(function(){
    const vy = window.innerHeight;
    const kort = [...document.querySelectorAll('h2')].find(h =>
      h.textContent.trim() === ${JSON.stringify(kurstipsRubrik)});
    const kurstipsSektion = kort ? kort.closest('section') : null;
    const wrapper = kurstipsSektion ? kurstipsSektion.parentElement : null;
    const band = document.querySelector(
      'section[aria-label=' + ${JSON.stringify(JSON.stringify(bandAria))} + ']');
    const mät = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      return {
        klass: el.className || null,
        topPx: Math.round(r.top + window.scrollY),
        hojdPx: Math.round(r.height),
        underVeck: r.top + window.scrollY > vy,
        contentVisibility: st.contentVisibility,
        containIntrinsicSize: st.containIntrinsicSize || null,
        textLangd: (el.innerText || '').replace(/\\s+/g, ' ').trim().length,
        barn: el.querySelectorAll('*').length,
      };
    };
    return {
      vyHojd: vy,
      dokHojd: document.documentElement.scrollHeight,
      kurstipsWrapper: mät(wrapper),
      kurstipsSektion: mät(kurstipsSektion),
      siffreband: mät(band),
    };
  })()`;
}

/** Scrollfasen tar samma ankare som last-fasen (rubriktext + aria-label). */
const scrollUttryck = (kurstipsRubrik, bandAria) => `(async function(){
  const resultat = {};
  const kurstips = [...document.querySelectorAll('h2')].find(h =>
    h.textContent.trim() === ${JSON.stringify(kurstipsRubrik)})
    ?.closest('section')?.parentElement;
  const band = document.querySelector(
    'section[aria-label=' + ${JSON.stringify(JSON.stringify(bandAria))} + ']');
  const gaTill = async (el, nyckel, vantems = 900) => {
    if (!el) { resultat[nyckel] = null; return; }
    window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top +
      window.scrollY - 80));
    await new Promise(r => setTimeout(r, vantems));
    const r = el.getBoundingClientRect();
    resultat[nyckel] = {
      hojdPx: Math.round(r.height),
      textLangd: (el.innerText || '').replace(/\\s+/g, ' ').trim().length,
      lankar: el.querySelectorAll('a').length,
      kort: el.querySelectorAll('section > ul > li').length,
    };
  };
  await gaTill(kurstips, 'kurstips');
  await gaTill(band, 'siffreband');
  window.scrollTo(0, document.documentElement.scrollHeight);
  await new Promise(r => setTimeout(r, 900));
  resultat.dokHojdEfter = document.documentElement.scrollHeight;
  return resultat;
})()`;

const chrome = spawn("google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/ak1a-o89-spegelsond-profil",
], { stdio: "ignore" });

try {
  await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
  const resultat = { fas: FAS, bas: BAS, datum: new Date().toISOString(), speglar: {} };

  for (const spegel of SPEGLAR) {
    const nySida = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
      method: "PUT",
    }).then((r) => r.json());
    const page = cdp(new WebSocket(nySida.webSocketDebuggerUrl));
    await page.oppen;
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 412, height: 844, deviceScaleFactor: 2, mobile: true,
    });
    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Page.navigate", { url: spegel.url });
    await SLEEP(7000); // load + hydratisering (KurstipsKort fylls i useEffect)

    const vidLast = (await page.send("Runtime.evaluate", {
      expression: sondUttryck(spegel.kurstipsRubrik, spegel.bandAria),
      returnByValue: true,
    }));
    if (vidLast.exceptionDetails) {
      console.error("vidLast-undantag:", JSON.stringify(vidLast.exceptionDetails, null, 2));
    }

    const efterScroll = (await page.send("Runtime.evaluate", {
      expression: scrollUttryck(spegel.kurstipsRubrik, spegel.bandAria),
      awaitPromise: true, returnByValue: true,
    }));
    if (efterScroll.exceptionDetails) {
      console.error("efterScroll-undantag:", JSON.stringify(efterScroll.exceptionDetails, null, 2));
    }

    const vL = vidLast?.result?.value ?? null;
    const eS = efterScroll?.result?.value ?? null;
    resultat.speglar[spegel.sida] = {
      url: spegel.url,
      vidLast: vL,
      efterScroll: eS,
      hojdDriftPx: vL && eS
        ? Math.abs((eS.dokHojdEfter || 0) - vL.dokHojd)
        : null,
    };
    page.stang();
    await SLEEP(500);
  }

  writeFileSync(UTFIL(FAS), JSON.stringify(resultat, null, 2));
  console.log(JSON.stringify(resultat, null, 2));
} finally {
  chrome.kill("SIGKILL");
}
