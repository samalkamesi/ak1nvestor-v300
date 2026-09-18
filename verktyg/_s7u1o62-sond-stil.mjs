#!/usr/bin/env node
// s7-u1 o62-sond (stil-verifiering): mät FÖRE-listans mål på /portfolj-forskning
// och /kurser/the-intelligent-investor MED bekräftad stylesheet-laddning
// (båda css-chunkarna + regelprobe + fonts.ready) och två stabila pass.
import { spawn } from "node:child_process";

const PORT = 9343;
const UA_IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/o62stil", "about:blank",
], { stdio: "ignore" });
await SLEEP(2500);
const listar = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const ws = new WebSocket(listar.find((s) => s.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let seq = 0;
function send(metod, parametrar) {
  return new Promise((res) => {
    const id = ++seq;
    const lyssnare = (m) => {
      const d = JSON.parse(m.data);
      if (d.id === id) { ws.removeEventListener("message", lyssnare); res(d.result ?? d); }
    };
    ws.addEventListener("message", lyssnare);
    ws.send(JSON.stringify({ id, method: metod, params: parametrar }));
  });
}

await send("Emulation.setUserAgentOverride", { userAgent: UA_IPHONE });
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Page.enable", {});

const MAT = `(() => {
  const cssLankar = [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.href.split("/").pop());
  // regelprobe: finns utility-regeln i ett laddat blad?
  let utilityFinns = false, golvFinns = false;
  for (const s of document.styleSheets) {
    let rs; try { rs = s.cssRules; } catch { continue; }
    for (const r of rs) {
      const inre = r.cssRules ? [...r.cssRules] : [r];
      for (const rr of inre) {
        if (rr.selectorText?.includes("min-h-\\[52px\\]")) utilityFinns = true;
        if (rr.selectorText === 'button, a[role="button"], [data-touchable]') golvFinns = true;
      }
    }
  }
  const MAL = [...document.querySelectorAll("a[href], button")].filter(el => {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    const st = getComputedStyle(el);
    if (st.visibility === "hidden" || st.display === "none") return false;
    return r.height < 52;
  }).map(el => {
    const r = el.getBoundingClientRect();
    return { t: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 44), h: Math.round(r.height), w: Math.round(r.width), tag: el.tagName.toLowerCase() };
  });
  return { cssLankar, utilityFinns, golvFinns, fontLaddad: document.fonts.status, under52: MAL };
})()`;

for (const sida of ["/portfolj-forskning", "/kurser/the-intelligent-investor"]) {
  await send("Page.navigate", { url: "about:blank" });
  await SLEEP(800);
  await send("Page.navigate", { url: `http://localhost:3000${sida}` });
  await SLEEP(7000);
  for (const pass of ["pass1", "pass2+2s"]) {
    if (pass === "pass2+2s") await SLEEP(2000);
    const svar = await send("Runtime.evaluate", { expression: MAT, returnByValue: true });
    const v = svar.result?.value ?? {};
    console.log(`=== ${sida} ${pass} ===`);
    console.log(`  css: ${v.cssLankar?.join(", ")} · utility:${v.utilityFinns ? "JA" : "NEJ"} · golv:${v.golvFinns ? "JA" : "NEJ"} · fonts:${v.fontLaddad}`);
    for (const m of v.under52 ?? []) console.log(`  ${m.h}x${m.w} ${m.tag}  ${m.t}`);
  }
}
chrome.kill();
process.exit(0);
