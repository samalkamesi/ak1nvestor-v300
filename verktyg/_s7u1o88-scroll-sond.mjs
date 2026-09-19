#!/usr/bin/env node
/**
 * AK1A — SCROLL-SOND för o78-resten (o78 §5 kriterium 3, o84 §6.1).
 *
 * Fråga: renderar content-visibility-sektionerna (.cv-kategorivagg,
 * .cv-socialproof, .cv-kurstips, .cv-nasta-steg, .cv-sidfooter) RIKTIGT
 * innehåll när användaren scrollar dem in i sikte — eller fastnar de som
 * tomma platshållare (reservationen utan innehåll = den fula felen)?
 *
 * Metod (CDP-mönster från prestanda-sond-sl.mjs, Chrome 153; testkörning
 * 2026-09-19 gav två protokollfynd som format detta verktyg):
 *  F1: dokumenthöjden VÄXER under scroll (cv-reservationer → verkliga
 *      höjder) ⇒ sektioner identifieras med ORDINAL inom klassen, aldrig
 *      dokumentposition.
 *  F2: content-visibility:auto SLÄPPER renderingen när sektionen lämnar
 *      viewporten (innerText → "") men behåller den inläRDA verkliga
 *      höjden (auto-nyckeln) ⇒ dom ställs på mätning NÄR SEKTIONEN ÄR I
 *      SIKTE, inte på slutmätningen vid sidbotten.
 *
 *  1. Headless Chrome, färsk user-data-dir (kall cache), 390×844 mobilvy.
 *  2. Navigera, vänta load + 6 s efersläpning (sl-sondens konstant).
 *  3. Före scroll: per cv-sektion ordinal, höjd, innerText-längd,
 *     textContent-längd (renderingsoberoende kontroll), barnantal.
 *  4. Scrolla window.scrollTo(+400/steg) med dubbel rAF till botten;
 *     efter varje steg mät alla sektioner + synlighet + dokhöjd.
 *  5. Dom per sektion:
 *     GRÖN  = vid NÅGOT steg i sikte med renderad text (innerText>0)
 *             och/eller textContent>0 (DOM-finns) + slutlig höjd > 0;
 *             höjd ≠ exakt reservation ⇒ auto-nyckeln lärt sig verklig
 *             höjd (inga stavhopp).
 *     RÖD fastbränd = aldrig text i sikte + textContent 0/posträd tomt
 *             + slutlig höjd ≈ reservation.
 *
 * Användning:
 *   node verktyg/_s7u1o88-scroll-sond.mjs [utfil.json] [sida ...]
 *
 * Inga npm-paket (node >=22 WebSocket). Skrivskyddad mot projektet utöver
 * utfilen. Mäter STRUKTUR, inte timing — okänslig för serverlast.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const UTFIL = process.argv[2] || "/tmp/ak1a-s7u1o88-scroll.json";
const SIDOR = process.argv.slice(3).length ? process.argv.slice(3) : ["/kurser"];
const BAS = "http://localhost:3000";
const PORT = 9341;
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

const CV_SELEKTOR = [".cv-kategorivagg", ".cv-socialproof", ".cv-kurstips", ".cv-nasta-steg", ".cv-sidfooter"];

// Reservationer ur globals.css (o78 §4) — för "fastbränd"-jämförelsen.
const RESERVATION_REM = {
  "cv-kategorivagg": 76,
  "cv-socialproof": 92,
  "cv-kurstips": 23,
  "cv-nasta-steg": 14,
  "cv-sidfooter": 134,
};

function cdp(ws) {
  let id = 0;
  const vantar = new Map();
  const lyssnare = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && vantar.has(msg.id)) {
      const { resolve, reject } = vantar.get(msg.id);
      vantar.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      for (const l of lyssnare) l(msg);
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
    on: (fn) => lyssnare.push(fn),
    stang: () => ws.close(),
  };
}

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

async function evalJS(conn, uttryck) {
  const r = await conn.send("Runtime.evaluate", {
    expression: uttryck,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails) throw new Error("eval: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
}

// Ordinalidentitet (F1): querySelectorAll = dokumentordning, stabil under
// hela scrollen även när höjder växer.
const MATA_UTTRYCK = `(async () => {
  const sel = ${JSON.stringify(CV_SELEKTOR)};
  const rotpx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const sektioner = [];
  for (const s of sel) {
    let ord = 0;
    for (const el of document.querySelectorAll(s)) {
      const rect = el.getBoundingClientRect();
      sektioner.push({
        id: s.slice(1) + "#" + ord++,
        hojd: Math.round(rect.height),
        textLangd: (el.innerText || "").trim().length,
        domTextLangd: (el.textContent || "").trim().length,
        barn: el.childElementCount,
        synligIVy: rect.top < innerHeight && rect.bottom > 0,
        top: Math.round(rect.top + scrollY),
      });
    }
  }
  return { rotpx, scrollY: Math.round(scrollY), dokHojd: document.documentElement.scrollHeight, sektioner };
})()`;

const SCROLL_STEG = `(async () => {
  const target = Math.min(scrollY + 400, document.documentElement.scrollHeight - innerHeight);
  window.scrollTo({ top: target, behavior: "instant" });
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return { scrollY: Math.round(scrollY), botten: scrollY >= document.documentElement.scrollHeight - innerHeight - 2 };
})()`;

function domFor(spår, slutlig, reservPx) {
  const renderadISikte = spår.renderadTextVidSteg !== null;
  const domFinns = slutlig.domTextLangd > 0;
  const autoNyckel = Math.abs(slutlig.hojd - reservPx) > Math.max(24, reservPx * 0.02);
  if (renderadISikte && domFinns && slutlig.hojd > 0)
    return `GRÖN (renderad i sikte @steg ${spår.renderadTextVidSteg}; ${autoNyckel ? "auto-nyckeln lärt verklig höjd" : "höjd ≈ reservation (innehållet råkar passa)"})`;
  if (!renderadISikte && domFinns && slutlig.hojd > 0)
    return "GUL (DOM-finns men aldrig renderad text i sikte — hydrat-beroende? manuell blick)";
  if (!domFinns && Math.abs(slutlig.hojd - reservPx) <= Math.max(40, reservPx * 0.15))
    return "RÖD (fastbränd platshållare — tom DOM + reservationshöjd)";
  if (!domFinns) return "RÖD (tom sektion, höjd ≠ reservation — undersök)";
  return "RÖD (okänd kombination — undersök)";
}

async function sondSida(conn, url) {
  let lastOk = null;
  conn.on((msg) => {
    if (msg.method === "Page.loadEventFired") lastOk = true;
  });
  await conn.send("Page.enable");
  await conn.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await conn.send("Page.navigate", { url });
  const deadline = Date.now() + 30000;
  while (!lastOk && Date.now() < deadline) await SLEEP(100);
  await SLEEP(6000); // efersläpning: lazy-fetch, skeletons, IO

  const fore = await evalJS(conn, MATA_UTTRYCK);
  const foreMap = new Map(fore.sektioner.map((s) => [s.id, s]));

  // Spår per sektion över hela scrollen (F2: dom vid synlighet).
  const spår = new Map();
  const initSpår = (m) => {
    for (const sek of m.sektioner) {
      if (!spår.has(sek.id)) spår.set(sek.id, { renderadTextVidSteg: null, sistSynligSteg: null, maxHojd: 0 });
      const s = spår.get(sek.id);
      if (sek.synligIVy) s.sistSynligSteg = stegNr;
      if (sek.synligIVy && sek.textLangd > 0 && s.renderadTextVidSteg === null) s.renderadTextVidSteg = stegNr;
      s.maxHojd = Math.max(s.maxHojd, sek.hojd);
    }
  };
  let stegNr = 0;
  initSpår(fore);

  const dokHistorik = [{ steg: 0, dokHojd: fore.dokHojd, scrollY: 0 }];
  for (let i = 0; i < 140; i++) {
    stegNr = i + 1;
    const r = await evalJS(conn, SCROLL_STEG);
    const m = await evalJS(conn, MATA_UTTRYCK);
    initSpår(m);
    dokHistorik.push({ steg: stegNr, dokHojd: m.dokHojd, scrollY: m.scrollY });
    if (r.botten && dokHistorik.length > 3 && dokHistorik.at(-1).dokHojd === dokHistorik.at(-2).dokHojd) break;
    await SLEEP(120);
  }

  const efter = await evalJS(conn, MATA_UTTRYCK);
  const rapport = efter.sektioner.map((s) => {
    const f = foreMap.get(s.id) || {};
    const klass = s.id.split("#")[0];
    const reservPx = Math.round((RESERVATION_REM[klass] || 0) * fore.rotpx);
    const sp = spår.get(s.id) || {};
    return {
      id: s.id,
      reservPx,
      hojdForeScroll: f.hojd ?? null,
      hojdEfterScroll: s.hojd,
      maxHojdUnderScroll: sp.maxHojd ?? null,
      domTextLangd: s.domTextLangd,
      renderadTextVidSteg: sp.renderadTextVidSteg ?? null,
      sistSynligSteg: sp.sistSynligSteg ?? null,
      dom: domFor(sp ?? {}, s, reservPx),
    };
  });

  return {
    url,
    fetchTid: new Date().toISOString(),
    rotpx: fore.rotpx,
    dokHojdFore: fore.dokHojd,
    dokHojdEfter: efter.dokHojd,
    scrollsteg: dokHistorik.at(-1).steg,
    dokHistorik: dokHistorik.filter((_, i) => i % 5 === 0 || i === dokHistorik.length - 1),
    sektioner: rapport,
    allaGröna: rapport.every((r) => r.dom.startsWith("GRÖN")),
  };
}

async function main() {
  const profil = mkdtempSync(join(tmpdir(), "ak1a-scroll-"));
  const chrome = spawn(
    "/usr/bin/google-chrome",
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--mute-audio",
      "--window-size=390,844",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profil}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  console.error(`chrome pid ${chrome.pid}, väntar på CDP ...`);
  try {
    const version = await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
    console.error(`chrome ${version.Browser}`);
    const nySida = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
    const ws = new WebSocket(nySida.webSocketDebuggerUrl);
    const conn = cdp(ws);
    await conn.oppen;
    const resultat = [];
    for (const sida of SIDOR) {
      console.error(`scrollsonder ${sida} ...`);
      resultat.push(await sondSida(conn, BAS + sida));
    }
    conn.stang();
    writeFileSync(UTFIL, JSON.stringify(resultat, null, 2));
    console.error(`skrev ${UTFIL}`);
    for (const r of resultat) {
      console.error(`\n=== ${r.url} — dokhöjd ${r.dokHojdFore}→${r.dokHojdEfter} px över ${r.scrollsteg} steg — ${r.allaGröna ? "ALLA GRÖNA" : "FYND FINNS"} ===`);
      for (const s of r.sektioner)
        console.error(
          `${s.id.padEnd(20)} höjd ${String(s.hojdForeScroll).padStart(5)}→${String(s.hojdEfterScroll).padStart(5)} (reserv ${String(s.reservPx).padStart(5)}, max ${String(s.maxHojdUnderScroll).padStart(5)})  domText=${String(s.domTextLangd).padStart(5)}  renderad@steg ${String(s.renderadTextVidSteg).padStart(3)}  => ${s.dom}`,
        );
    }
  } finally {
    chrome.kill("SIGKILL");
  }
}

main().catch((e) => {
  console.error("SOND-FEL:", e.message);
  process.exit(1);
});
