#!/usr/bin/env node
/**
 * AK1A — o96-SOND: reservationskalibreringens FÖRE/EFTER-instrument.
 *
 * Mäter (per sida + geometri) tre saker spåret bokade i o92 §5.5–§5.7:
 *  (1) Utvalda korten (/kurser): per li.cv-utvalt — sektion (h2:id), li-höjd,
 *      span.mt-2.flex-1: höjd, textlängd, första font, radhöjd, radantal —
 *      FÖRE (cv-contained platshållarläge) vs EFTER (renderat) ⇒ rot-bevis:
 *      om text+font oförändrade är span-krympen platshållar-flex-mekanik.
 *  (2) Marin/siffrebandet (.cv-siffreband-spegel på speglarna, .cv-socialproof
 *      på svenska): höjd FÖRE/EFTER ⇒ md+-nivå per språk.
 *  (3) Registerkort (li.cv-registerkort, alla tre språken): per-kort höjd
 *      FÖRE (platshållare) vs EFTER (learn-text fylld av /api via IO) ⇒
 *      mobilreservationens över-/underskott.
 *
 * Användning: node verktyg/_s7u3o96-sond.mjs <namn> [url] [mobil|desktop]
 * Utdata: data/forskning/OPTIMERING/lighthouse/o96sond-<namn>.json
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMN = process.argv[2] || "sond";
const URL = process.argv[3] || "http://localhost:3000/kurser";
const GEO = process.argv[4] || "mobil";
const VP = GEO === "desktop"
  ? { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }
  : { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true };
const PORT = 9347;
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse", `o96sond-${NAMN}.json`);

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

/** Snapshot: allt instrumentet behöver i ett evaluate-pass. */
const SNAP = `(() => {
  const utvalda = [...document.querySelectorAll("li.cv-utvalt")].map((li) => {
    const span = li.querySelector("span.mt-2.flex-1");
    const lr = li.getBoundingClientRect();
    const sr = span ? span.getBoundingClientRect() : null;
    const cs = span ? getComputedStyle(span) : null;
    const lh = cs ? parseFloat(cs.lineHeight) : null;
    return {
      sektion: li.closest("section")?.querySelector("h2")?.id || "?",
      liH: Math.round(lr.height),
      spanH: sr ? Math.round(sr.height) : null,
      textLen: span?.textContent ? span.textContent.trim().length : null,
      font: cs ? cs.fontFamily.split(",")[0].replace(/["']/g, "") : null,
      lh: lh ? Math.round(lh) : null,
      rader: sr && lh ? Math.round(sr.height / lh) : null,
    };
  });
  const register = [...document.querySelectorAll("li.cv-registerkort")].map((li) => {
    const text = li.querySelector("span.mt-2.block");
    return {
      h: Math.round(li.getBoundingClientRect().height),
      textLen: text?.textContent ? text.textContent.trim().length : 0,
    };
  });
  const marin = document.querySelector(".cv-siffreband-spegel");
  const social = document.querySelector(".cv-socialproof");
  return {
    docH: Math.round(document.documentElement.scrollHeight),
    fonts: document.fonts.status,
    utvalda, register,
    marinH: marin ? Math.round(marin.getBoundingClientRect().height) : null,
    socialH: social ? Math.round(social.getBoundingClientRect().height) : null,
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
  await send("Emulation.setDeviceMetricsOverride", VP, sessionId);
  await send("Page.navigate", { url: URL }, sessionId);
  await sleep(5000);

  const fore = (await send("Runtime.evaluate", { expression: SNAP, returnByValue: true }, sessionId)).result.value;
  console.log(`FÖRE: docH ${fore.docH} · fonts ${fore.fonts} · utvalda ${fore.utvalda.length} · register ${fore.register.length} · marin ${fore.marinH} · social ${fore.socialH}`);

  // Progressiv scroll till botten (blocksondens kurva).
  let y = 0;
  while (y < fore.docH) {
    y = Math.min(y + 600, fore.docH);
    await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})`, }, sessionId);
    await sleep(y > 6000 ? 1000 : 400);
  }
  // Stabilisering: register-texten fylls av IO + /api — vänta tills total
  // textlängd slagit sig till ro (blocksondens mönster).
  let forrige = -1;
  for (let i = 0; i < 12; i++) {
    const t = (await send("Runtime.evaluate", {
      expression: `[...document.querySelectorAll("li.cv-registerkort span.mt-2.block")].reduce((a,el)=>a+(el.innerText||"").length,0)`,
    }, sessionId)).result.value;
    if (t === forrige && t > 0) break;
    forrige = t;
    await sleep(800);
  }
  await sleep(800);
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)", }, sessionId);
  await sleep(600);

  const efter = (await send("Runtime.evaluate", { expression: SNAP, returnByValue: true }, sessionId)).result.value;
  console.log(`EFTER: docH ${efter.docH} (Δ ${efter.docH - fore.docH}) · fonts ${efter.fonts}`);

  // Summeringar.
  const sum = (arr, f) => arr.reduce((a, b) => a + (f(b) || 0), 0);
  if (efter.utvalda.length) {
    for (const sid of new Set(efter.utvalda.map((u) => u.sektion))) {
      const f = fore.utvalda.filter((u) => u.sektion === sid);
      const e = efter.utvalda.filter((u) => u.sektion === sid);
      console.log(`  sektion ${sid}: li FÖRE ${f.map((u) => u.liH).join(",")} → EFTER ${e.map((u) => u.liH).join(",")}`);
      console.log(`    span FÖRE ${f.map((u) => u.spanH).join(",")} → EFTER ${e.map((u) => u.spanH).join(",")}`);
      console.log(`    textLen FÖRE ${f.map((u) => u.textLen).join(",")} → EFTER ${e.map((u) => u.textLen).join(",")} · font ${e[0]?.font} · lh ${e[0]?.lh} · rader EFTER ${e.map((u) => u.rader).join(",")}`);
    }
    console.log(`  Σspan FÖRE ${sum(fore.utvalda, (u) => u.spanH)} → EFTER ${sum(efter.utvalda, (u) => u.spanH)}`);
  }
  if (efter.register.length) {
    const fh = fore.register.map((r) => r.h), eh = efter.register.map((r) => r.h);
    const medel = Math.round((sum(efter.register, (r) => r.h) / eh.length) * 10) / 10;
    console.log(`  register: n ${fh.length} · FÖRE Σ ${sum(fore.register, (r) => r.h)} (platshållare ${fh[0]}) → EFTER Σ ${sum(efter.register, (r) => r.h)} · medel ${medel} px (${(medel / 16).toFixed(2)}rem) · höjder ${eh.join(",")}`);
    console.log(`  textLen EFTER Σ ${sum(efter.register, (r) => r.textLen)} (FÖRE Σ ${sum(fore.register, (r) => r.textLen)})`);
  }
  if (efter.marinH != null) console.log(`  marin: FÖRE ${fore.marinH} → EFTER ${efter.marinH}`);

  writeFileSync(UTFIL, JSON.stringify({ url: URL, namn: NAMN, geo: GEO, ts: Date.now(), fore, efter }, null, 1));
  console.log(`→ ${UTFIL}`);
} finally {
  chrome.kill("SIGKILL");
}
