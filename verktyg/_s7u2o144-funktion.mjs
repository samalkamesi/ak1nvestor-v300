#!/usr/bin/env node
/**
 * AK1A — FUNKTIONSTEST o144 (Spår 7, s7-u2): pillklicks-kontraktet från
 * o143 §7.4 — "pillklick växler aria-current + URL (?sortera=) + kortordning;
 * bakåtknapp återställer (popstate)" — ×3 språk (/dataset, /en, /ar).
 *
 * Metod: CDP mot localhost:3000 (loopback whitelistad), riktiga klick via
 * el.click() på hydratiserade knappar (Radix ej inblandad här — vanliga
 * button). Sorteringsriktigheten verifieras MATEMATISKT mot DOM:ens egna
 * pe-tal (pe-hogst: icke-ökande, null sist; pe-lagst: spegelvänt) — inget
 * hårdkodat dataantagande.
 *
 * Användning: node verktyg/_s7u2o144-funktion.mjs
 * Utdata: data/forskning/OPTIMERING/lighthouse/funktion-o144.json
 * Exit 0 = alla kontrakt PASS ×3 språk · 1 = minst ett FAIL.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BAS = process.env.LH_BAS || "http://localhost:3000";
const PORT = Number(process.env.FUNK_PORT || 9366);
const SIDOR = ["/dataset", "/en/dataset", "/ar/dataset"];
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse/funktion-o144.json");
mkdirSync(join(process.cwd(), "data/forskning/OPTIMERING/lighthouse"), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function startaChrome() {
  const dir = `/tmp/funk-o144-${Date.now()}`;
  return spawn("/usr/bin/google-chrome", [
    "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
    "--disable-extensions", `--remote-debugging-port=${PORT}`, "--disable-gpu",
    `--user-data-dir=${dir}`, "about:blank",
  ], { stdio: "ignore" });
}

async function pageWs() {
  // Vänta på debug-porten, hämta sidtargetets WS-URL.
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page");
      if (page) {
        const w = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((res, rej) => {
          w.addEventListener("open", res, { once: true });
          w.addEventListener("error", () => rej(new Error("ws öppnades ej")), { once: true });
        });
        return w;
      }
    } catch {}
    await sleep(400);
  }
  throw new Error("chrome debug-port svarade ej");
}

function cdp(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  return {
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const mid = ++id;
        pending.set(mid, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)));
        ws.send(JSON.stringify({ id: mid, method, params }));
      }),
    stang: () => ws.close(),
  };
}

/** Evaluera JS i sidan och returnera värdet. */
async function evaljs(send, uttryck, awaitPromise = true) {
  const r = await send("Runtime.evaluate", {
    expression: uttryck, awaitPromise, returnByValue: true,
  });
  if (r.exceptionDetails) throw new Error("evaluate-fel: " + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails).slice(0, 300));
  return r.result?.value;
}

/** Läs pill-läge + kortordning (namn + pe-tal) ur DOM:en. */
const LAS_LAGE = `(() => {
  const pills = [...document.querySelectorAll('div[role="group"] button')];
  const kort = [...document.querySelectorAll('div[class~="md:hidden"] > div')].map((k) => {
    const namn = k.querySelector("a")?.textContent?.trim() || "";
    const peRaw = k.querySelector("span.mt-1")?.textContent || "";
    const m = peRaw.replace(/\\u00a0/g, " ").match(/(\\d+[.,]\\d+|\\d+)(?!\\d)/);
    return { namn, pe: m ? parseFloat(m[1].replace(",", ".")) : null };
  });
  return {
    url: location.search,
    pills: pills.map((p) => ({ text: p.textContent.trim(), vald: p.getAttribute("aria-current") === "true" })),
    kort,
  };
})()`;

/** Verifiera sorteringsriktning mot kortens egna pe-tal (null sist). */
function peOrdningOk(kort, riktning) {
  const tal = kort.map((k) => k.pe);
  const taliga = tal.filter((t) => t !== null);
  const nullSist = tal.slice(taliga.length).every((t) => t === null);
  const mono = taliga.every((t, i) => i === 0 ||
    (riktning === "hogst" ? taliga[i - 1] >= t : taliga[i - 1] <= t));
  return { mono, nullSist, antalKort: kort.length, taliga: taliga.length };
}

async function testaSida(send, sokvag) {
  const svar = { sokvag, steg: [], pass: {} };
  await send("Page.enable");
  await send("Page.navigate", { url: BAS + sokvag });
  await sleep(2500); // loadEvent + hydrering

  // 1. Före-läge: A–Ö vald som default (tolkaSortera: tom/ogiltig ?sortera →
  //    "bransch" — deployad design, dataset-sortering.tsx:62-64), exakt EN vald,
  //    minst 3 pill, minst 5 kort.
  const fore = await evaljs(send, LAS_LAGE);
  svar.steg.push({ steg: "fore", url: fore.url, valda: fore.pills.filter((p) => p.vald).length, kort: fore.kort.length });
  svar.pass.pillsFinns = fore.pills.length === 3;
  svar.pass.kortFinns = fore.kort.length >= 5;
  svar.pass.defaultValdFore = fore.pills[0]?.vald === true && fore.pills.filter((p) => p.vald).length === 1;

  // 2. Klicka pill 2 (pe-hogst) — poll tills hydreringen tagit klicket.
  await evaljs(send, `document.querySelectorAll('div[role="group"] button')[1].click()`, false);
  let hogst = null;
  for (let i = 0; i < 16; i++) {
    await sleep(500);
    hogst = await evaljs(send, LAS_LAGE);
    if (hogst.url.includes("sortera=pe-hogst")) break;
  }
  const hKoll = peOrdningOk(hogst.kort, "hogst");
  svar.pass.urlHogst = hogst.url.includes("sortera=pe-hogst");
  svar.pass.ariaCurrentHogst = hogst.pills[1]?.vald === true && hogst.pills.filter((p) => p.vald).length === 1;
  svar.pass.ordningHogst = hKoll.mono && hKoll.nullSist && JSON.stringify(hogst.kort.map((k) => k.namn)) !== JSON.stringify(fore.kort.map((k) => k.namn));
  svar.steg.push({ steg: "pe-hogst", url: hogst.url, koll: hKoll });

  // 3. Klicka pill 3 (pe-lagst).
  await evaljs(send, `document.querySelectorAll('div[role="group"] button')[2].click()`, false);
  let lagst = null;
  for (let i = 0; i < 16; i++) {
    await sleep(500);
    lagst = await evaljs(send, LAS_LAGE);
    if (lagst.url.includes("sortera=pe-lagst")) break;
  }
  const lKoll = peOrdningOk(lagst.kort, "lagst");
  svar.pass.urlLagst = lagst.url.includes("sortera=pe-lagst");
  svar.pass.ariaCurrentLagst = lagst.pills[2]?.vald === true && lagst.pills.filter((p) => p.vald).length === 1;
  svar.pass.ordningLagst = lKoll.mono && lKoll.nullSist;
  svar.steg.push({ steg: "pe-lagst", url: lagst.url, koll: lKoll });

  // 4. Bakåt (popstate): ska återgå till pe-hogst-läge (URL + ordning + aria).
  await evaljs(send, `history.back()`, false);
  let bak = null;
  for (let i = 0; i < 16; i++) {
    await sleep(500);
    bak = await evaljs(send, LAS_LAGE);
    if (bak.url.includes("sortera=pe-hogst")) break;
  }
  svar.pass.backAtterstallerUrl = bak.url.includes("sortera=pe-hogst");
  svar.pass.backAtterstallerOrdning = JSON.stringify(bak.kort.map((k) => k.namn)) === JSON.stringify(hogst.kort.map((k) => k.namn));
  svar.pass.backAtterstallerAria = bak.pills[1]?.vald === true;
  svar.steg.push({ steg: "back", url: bak.url });

  svar.passAlla = Object.values(svar.pass).every(Boolean);
  return svar;
}

// ─── Huvud ───
const chrome = startaChrome();
let ws;
try {
  ws = await pageWs();
  const { send } = cdp(ws);
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const resultat = [];
  for (const s of SIDOR) {
    try { resultat.push(await testaSida(send, s)); }
    catch (e) { resultat.push({ sokvag: s, fel: String(e.message), passAlla: false }); }
  }
  const ut = { ts: new Date().toISOString(), bas: BAS, resultat, allaPass: resultat.every((r) => r.passAlla) };
  writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
  console.log(JSON.stringify({ allaPass: ut.allaPass, perSida: resultat.map((r) => ({ sokvag: r.sokvag, passAlla: r.passAlla, pass: r.pass, fel: r.fel })) }, null, 2));
  process.exit(ut.allaPass ? 0 : 1);
} finally {
  try { ws?.close(); } catch {}
  chrome.kill("SIGKILL");
}
