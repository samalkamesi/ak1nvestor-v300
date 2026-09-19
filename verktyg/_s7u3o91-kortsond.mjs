#!/usr/bin/env node
/**
 * AK1A — KORT-SOND för o19:s kort-cv-familj (o91: reservationsnivåer).
 *
 * Fråga (o90 §3:s köpost): platshållarna (contain-intrinsic-size) på
 * .cv-registerkort (9rem/3rem) och .cv-utvalt (12rem) ligger under de
 * verkliga höjderna ⇒ dokumenthöjden växer +6 572 px vid full första
 * scroll (16 571 → 23 143 px, o90 §1). Hur stora är de VERKLIGA
 * kortshöjderna per familj och brytpunkt — och vilka reservationsnivåer
 * slutar engångstillväxten?
 *
 * Metod: rå CDP på _s7u2o88-scrollsondens skelett (o90), mobilgeometri
 * 412×823 dpr 2,627 (o78 §2) + desktoprond 1280×800 (md+-reservationen).
 * Faser:
 *   A. FÖRE scroll: per familj — antal, höjd/läge per kort (platshållar-
 *      tillstånd), textlängd, dokumenthöjd.
 *   B. Progressiv scroll till botten (steg 600 px; registrets IO-hämtning
 *      får 1,2 s extra per steg i registrets span) + stabiliseringspoll.
 *   C. EFTER: per familj verkliga höjder, dokumenthöjd, engångstillväxt =
 *      efterFöre; per-kort-delta summerat per familj (attribution).
 *      Förslag: reservationsnivå = median verklig höjd (0,25 rem avrundat).
 *   D. Rond 2 (botten→topp): auto-nyckelns minne — docH skall vara stabil.
 *
 * Användning: node verktyg/_s7u3o91-kortsond.mjs <namn> [url] [mobil|desktop]
 * Utdata: data/forskning/OPTIMERING/lighthouse/kortsond-<namn>.json
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/kurser";
const GEO = process.argv[4] || "mobil";
const PORT = 9343; // egen port — krockar ej med 9337/9339/9341
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `kortsond-${NAMN}.json`);
const FAMILJER = [".cv-registerkort", ".cv-utvalt"];
const VP = GEO === "desktop"
  ? { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }
  : { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true };

const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--disable-gpu", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });
  return (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (msg) => (msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)));
    ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

/** Per familj: antal, per-kort höjd/top/text, plus dokumenthöjd. */
const MA_KORT = `(() => {
  const familjer = ${JSON.stringify(FAMILJER)};
  const stat = familjer.map(sel => {
    const els = [...document.querySelectorAll(sel)];
    const kort = els.map(el => {
      const r = el.getBoundingClientRect();
      return {
        top: Math.round(r.top + window.scrollY),
        hojd: Math.round(r.height),
        text: (el.innerText || "").replace(/\\s+/g, " ").trim().length,
      };
    });
    const hojder = kort.map(k => k.hojd).sort((a, b) => a - b);
    const median = hojder.length ? hojder[Math.floor(hojder.length / 2)] : null;
    return {
      sel, antal: els.length,
      summaHojd: hojder.reduce((a, b) => a + b, 0),
      medianHojd: median,
      minHojd: hojder[0] ?? null,
      maxHojd: hojder[hojder.length - 1] ?? null,
      textSumma: kort.reduce((a, k) => a + k.text, 0),
      forstaTop: kort[0]?.top ?? null,
      sistaTop: kort[kort.length - 1]?.top ?? null,
      kort,
    };
  });
  return { scrollY: Math.round(window.scrollY), docH: Math.round(document.documentElement.scrollHeight), familjer: stat };
})()`;

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };

try {
  let version;
  for (let i = 0; i < 40; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; }
    catch { await sleep(250); }
  }
  if (!version) throw new Error("DevTools svarade ej");
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  const send = await cdp(ws);

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);

  // o89 §6:s läxa: trivial evaluate-FÖRST före mätfönstret förbrukas.
  // (Runtime är en SESSION-domän — provet MÅSTE köras på sessionId.)
  const prov = (await send("Runtime.evaluate", { expression: "1 + 1", returnByValue: true }, sessionId)).result.value;
  if (prov !== 2) throw new Error(`evaluate-prov misslyckades: ${prov}`);

  await send("Emulation.setDeviceMetricsOverride", VP, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);
  await sleep(5000); // hydrat + ISR-vävnad lugn

  // ── Fas A: FÖRE scroll (platshållar-läge) ──────────────────────────
  const fore = (await send("Runtime.evaluate", { expression: MA_KORT, returnByValue: true }, sessionId)).result.value;
  console.log(`FÖRE (${GEO} ${VP.width}×${VP.height}): docH ${fore.docH}px`);
  for (const f of fore.familjer) {
    console.log(`  ${f.sel}: ${f.antal} kort · platshållar-median ${f.medianHojd}px (min ${f.minHojd}/max ${f.maxHojd}) · summa ${f.summaHojd}px · span ${f.forstaTop}–${f.sistaTop}px · text ${f.textSumma} tkn`);
  }

  // ── Fas B: progressiv scroll till botten ───────────────────────────
  // Steg 600 px; i registrets span (första registerkortstop − 800 till
  // sista + 800) väntas 1,2 s/steg — IO (rootMargin 400 px) eldar
  // /api/kurs-hämtningen och skelett→text skall hinna renders.
  const regSpan = fore.familjer.find((f) => f.sel === ".cv-registerkort");
  const regFra = (regSpan?.forstaTop ?? Infinity) - 800;
  const regTill = (regSpan?.sistaTop ?? -Infinity) + 800;
  let y = 0;
  const botten = fore.docH;
  while (y < botten) {
    y = Math.min(y + 600, botten);
    await send("Runtime.evaluate", {
      expression: `window.scrollTo(0, ${y})`,
    }, sessionId);
    const iReg = y >= regFra && y <= regTill;
    await sleep(iReg ? 1200 : 350);
  }
  // Stabiliseringspoll: registrets text skall sluta växa (hämtning klar).
  let forrigeText = -1;
  for (let i = 0; i < 12; i++) {
    const m = (await send("Runtime.evaluate", { expression: MA_KORT, returnByValue: true }, sessionId)).result.value;
    const t = m.familjer.find((f) => f.sel === ".cv-registerkort")?.textSumma ?? 0;
    if (t === forrigeText && t > 0) break;
    forrigeText = t;
    await sleep(800);
  }
  await sleep(600);

  // ── Fas C: EFTER (verkliga höjder) ─────────────────────────────────
  const efter = (await send("Runtime.evaluate", { expression: MA_KORT, returnByValue: true }, sessionId)).result.value;
  const tillvaxt = efter.docH - fore.docH;
  console.log(`\nEFTER full scroll: docH ${efter.docH}px (engångstillväxt ${tillvaxt >= 0 ? "+" : ""}${tillvaxt}px)`);
  const perFamilj = efter.familjer.map((f) => {
    const f0 = fore.familjer.find((x) => x.sel === f.sel);
    const platthallare = f0?.medianHojd ?? null;
    // per-kort-delta bara över kort med RENDERADE verkliga höjder (text>0
    // för registerkort; utvalda är SSR — deras text är färdig FÖRE om cv
    // redan renderat dem, annars 0 tills besökta).
    const verkliga = f.kort.filter((k) => k.text > 0).map((k) => k.hojd);
    const dSumma = verkliga.length && platthallare != null
      ? verkliga.reduce((a, h) => a + (h - platthallare), 0)
      : null;
    return {
      sel: f.sel,
      antal: f.antal,
      platshallarMedianPx: platthallare,
      verkligMedianPx: median(verkliga),
      verkligaRenderade: verkliga.length,
      perKortDeltaSummaPx: dSumma,
      foreslatReservationRem: median(verkliga) != null ? Math.round((median(verkliga) / 16) * 4) / 4 : null,
    };
  });
  for (const p of perFamilj) {
    console.log(`  ${p.sel}: platshållare ${p.platshallarMedianPx}px → verklig median ${p.verkligMedianPx}px (${p.verkligaRenderade} renderade) · Σdelta ${p.perKortDeltaSummaPx}px · förslag ${p.foreslatReservationRem}rem`);
  }

  // ── Fas D: rond 2 (botten→topp) — auto-nyckelns minne ──────────────
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" }, sessionId);
  await sleep(1200);
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, document.documentElement.scrollHeight)" }, sessionId);
  await sleep(1200);
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" }, sessionId);
  await sleep(600);
  const rond2 = (await send("Runtime.evaluate", { expression: MA_KORT, returnByValue: true }, sessionId)).result.value;
  const rond2Stabilt = Math.abs(rond2.docH - efter.docH) <= 10;

  const dom = {
    geo: GEO, vp: VP,
    engangstillvaxtPx: tillvaxt,
    godkat: Math.abs(tillvaxt) <= 48, // reservationer ≈ verkliga höjder ⇒ ≈0 (o90:s 48-px-nivå)
    rond2DocH: rond2.docH,
    rond2Stabilt,
    HELA: Math.abs(tillvaxt) <= 48 && rond2Stabilt,
  };

  const ut = { url: URL, namn: NAMN, ts: new Date().toISOString(), fore, efter, perFamilj, rond2, dom };
  writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
  console.log(`\nDOM: engångstillväxt ${tillvaxt}px (godkänt ≤48: ${dom.godkat}) · rond2 ${rond2.docH} (stabilt: ${rond2Stabilt}) · HELA ${dom.HELA}`);
  console.log(`Skriven: ${UTFIL}`);
  ws.close();
} finally {
  chrome.kill();
}
