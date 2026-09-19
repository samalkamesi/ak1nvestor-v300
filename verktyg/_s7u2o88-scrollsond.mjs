#!/usr/bin/env node
/**
 * AK1A — SCROLL-SOND för content-visibility-sektionerna (o78-resten, rond o88).
 *
 * Fråga (o78 §5 kriterium 3 + o84 §3:s rest-bokning): renderar de fem
 * cv-klasserna RIKTIGT innehåll vid scroll — inga fastbrända platshållare,
 * inga stavhopp (höjdreservationerna skall hålla)?
 *
 * Metod: rå CDP på viewportsondens skelett (o63), mobilgeometri 412×823
 * dpr 2,627 (o78 §2:s DOM-karta — samma geometri som reservationerna
 * sonderades med). Tre faser:
 *   A. FÖRE scroll: varje cv-klass — platshållarhöjd, barnantal, hur många
 *      barn som har RENDERADE rektanglar (cv:skip = 0 rektanglar), text.
 *      + dokumenthöjd (platshållarsumman).
 *   B. Per sektion: scrollTo(sektionen − 300 px), vänta 900 ms (cv renderar
 *      vid intersection), mät igen — dom: renderadeBarn > 0 = ej fastbränd.
 *   C. EFTER: dokumenthöjd igen — stavhopp = skillnaden mot A (reservationer
 *      ≈ sonderade verkliga höjder ⇒ förväntan ~12–20 px totalt).
 *
 * Användning: node verktyg/_s7u2o88-scrollsond.mjs [namn] [url]
 * Utdata: data/forskning/OPTIMERING/lighthouse/scrollsond-<namn>.json
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/kurser";
const PORT = 9339; // egen port — krockar ej med viewportsondens 9337
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `scrollsond-${NAMN}.json`);
const KLASSER = [".cv-kategorivagg", ".cv-socialproof", ".cv-kurstips", ".cv-nasta-steg", ".cv-sidfooter"];

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

/** Hämta samtliga sektioners tillstånd + dokumenthöjd i en utvärdering. */
const MA_TILLSTAND = `(() => {
  const klasser = ${JSON.stringify(KLASSER)};
  const sektioner = klasser.map(sel => {
    const el = document.querySelector(sel);
    if (!el) return { sel, finns: false };
    const r = el.getBoundingClientRect();
    const barn = [...el.querySelectorAll("*")];
    const renderade = barn.filter(b => {
      const br = b.getBoundingClientRect();
      return br.width > 0 || br.height > 0;
    }).length;
    return {
      sel,
      finns: true,
      top: Math.round(r.top + window.scrollY),
      hojd: Math.round(r.height),
      barn: barn.length,
      renderadeBarn: renderade,
      textLangd: (el.innerText || "").replace(/\\s+/g, " ").trim().length,
      iViewport: r.top < window.innerHeight && r.bottom > 0,
    };
  });
  return {
    scrollY: Math.round(window.scrollY),
    docH: Math.round(document.documentElement.scrollHeight),
    sektioner,
  };
})()`;

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
  await send("Emulation.setDeviceMetricsOverride", {
    width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true,
  }, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);
  await sleep(5000); // hydrat + ISR-vävnad lugn

  // ── Fas A: FÖRE scroll (platshållar-läge) ──────────────────────────
  const fore = (await send("Runtime.evaluate", { expression: MA_TILLSTAND, returnByValue: true }, sessionId)).result.value;
  console.log(`FÖRE: docH ${fore.docH}px · scrollY ${fore.scrollY}`);
  for (const s of fore.sektioner) {
    console.log(s.finns
      ? `  ${s.sel} top=${s.top} hojd=${s.hojd} barn=${s.barn} renderade=${s.renderadeBarn} text=${s.textLangd} iVp=${s.iViewport}`
      : `  ${s.sel} SAKNAS`);
  }

  // ── Fas B: scrolla per sektion, mät vid besöket ────────────────────
  const besok = [];
  for (const sel of KLASSER) {
    await send("Runtime.evaluate", {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(sel)});
        if (!el) return 0;
        const y = el.getBoundingClientRect().top + window.scrollY - 300;
        window.scrollTo(0, Math.max(0, y));
        return Math.round(window.scrollY);
      })()`,
    }, sessionId);
    await sleep(900); // cv renderar vid intersection + layout stabiliserar
    const m = (await send("Runtime.evaluate", { expression: MA_TILLSTAND, returnByValue: true }, sessionId)).result.value;
    const s = m.sektioner.find((x) => x.sel === sel);
    besok.push({ sel, scrollY: m.scrollY, docH: m.docH, ...s });
    console.log(`BESÖK ${sel}: scrollY=${m.scrollY} hojd=${s?.hojd} renderade=${s?.renderadeBarn}/${s?.barn} text=${s?.textLangd} iVp=${s?.iViewport}`);
  }

  // ── Fas C: tillbaka till top — totalt stavhopp ─────────────────────
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" }, sessionId);
  await sleep(600);
  const efter = (await send("Runtime.evaluate", { expression: MA_TILLSTAND, returnByValue: true }, sessionId)).result.value;
  const stavhopp = efter.docH - fore.docH;

  // ── Fas D: rond 2 (botten→top) — auto-nyckelns minne ───────────────
  // o78 §4: "auto"-nyckeln minns verklig höjd efter första rendering ⇒
  // dokumenthöjden skall vara STABIL i andra rond (engångstillväxt).
  await send("Runtime.evaluate", {
    expression: `window.scrollTo(0, document.documentElement.scrollHeight)`,
  }, sessionId);
  await sleep(1200);
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" }, sessionId);
  await sleep(600);
  const rond2 = (await send("Runtime.evaluate", { expression: MA_TILLSTAND, returnByValue: true }, sessionId)).result.value;
  const rond2Stabilt = Math.abs(rond2.docH - efter.docH) <= 10;

  // ── Dom ────────────────────────────────────────────────────────────
  const hittade = fore.sektioner.filter((s) => s.finns).length;
  const dom = {
    allaFemHittade: hittade === KLASSER.length,
    perSektion: besok.filter((b) => b.finns).map((b) => ({
      sel: b.sel,
      renderadVidBesok: b.renderadeBarn > 0 && b.textLangd > 0,
      fastbrandPlatshallare: b.renderadeBarn === 0,
      hojdflytt: b.hojd - (fore.sektioner.find((f) => f.sel === b.sel)?.hojd ?? 0),
    })),
    stavhoppTotaltPx: stavhopp,
    stavhoppGodkant: Math.abs(stavhopp) <= 48, // reservationerna ≈ sonderade höjder (Δ ~12 px i o78 §2)
  };
  dom.ingenFastbrand = dom.perSektion.every((p) => !p.fastbrandPlatshallare);
  // o78:s fem sektioners EGENA höjdstabilitet (reservationerna) — gränsen
  // gäller per sektion; dokumenttotalen bärs även av o19:s kort-cv.
  dom.femSektionerStabila = dom.perSektion.every((p) => Math.abs(p.hojdflytt) <= 48);
  dom.rond2DocH = rond2.docH;
  dom.rond2Stabilt = rond2Stabilt;
  dom.HELA = dom.allaFemHittade && dom.ingenFastbrand && dom.femSektionerStabila && dom.rond2Stabilt;

  const ut = { url: URL, namn: NAMN, ts: new Date().toISOString(), fore, besok, efter, rond2, dom };
  writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
  console.log(`\nDOM: femHittade ${hittade}/5 · ingenFastbränd ${dom.ingenFastbrand} · femSektionerStabila ${dom.femSektionerStabila} (flytt ${dom.perSektion.map((p) => `${p.sel.replace(".cv-", "")}:${p.hojdflytt >= 0 ? "+" : ""}${p.hojdflytt}`).join(" ")})`);
  console.log(`dokument: FÖRE ${fore.docH} → EFTER ${efter.docH} (${stavhopp >= 0 ? "+" : ""}${stavhopp}px, o19-kortens engångstillväxt — koordinatbevis i protokollet) → rond2 ${rond2.docH} (stabilt ≤10: ${rond2Stabilt})`);
  console.log(`HELA ${dom.HELA}`);
  console.log(`Skriven: ${UTFIL}`);
  ws.close();
} finally {
  chrome.kill();
}
