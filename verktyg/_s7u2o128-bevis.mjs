#!/usr/bin/env node
/**
 * o128-bevis (s7-u2): FÖRE-bevisning för slider-tummar på prod, tre vägar:
 *  A) riktiga CDP-musklick på flik «Poängsätt manuellt» → monterad tumme mäts
 *  B) hydratiseringssond: lägesväxlarens aria-pressed togglas?
 *  C) CSS-isolerad mätning: prodens EXAKTA tum-klasser på ett span mot
 *     prodens stilmallar (golvet button-selector skall EJ nå spans) —
 *     deterministisk storlek för Radix-tummen (dess storlek är ren CSS:
 *     Radix sätter ingen storlek-inline, endast transform/position på wrapper).
 */
import { spawn } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";

const PORT = 9341;
const PROFIL = "/tmp/ak1a-o128-bevis-profil";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

// EXAKT klass-sträng ur src/components/ui/slider.tsx (Thumb)
const TUMM_KLASS = "border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50";

try { rmSync(PROFIL, { recursive: true, force: true }); } catch {}
const barn = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFIL}`, "about:blank",
], { stdio: "ignore" });

let wsUrl;
for (let i = 0; i < 40; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json`);
    if (r.ok) {
      const mål = (await r.json()).filter((t) => t.type === "page");
      if (mål.length) { wsUrl = mål[0].webSocketDebuggerUrl; break; }
    }
  } catch {}
  await SLEEP(250);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0;
const vantar = new Map();
const logRader = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && vantar.has(m.id)) { const { los } = vantar.get(m.id); vantar.delete(m.id); los(m); }
  else if (m.method === "Log.entryAdded") logRader.push(m.params.entry);
  else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") logRader.push({ level: "console", text: m.params.args?.map((a) => a.value || a.description).join(" ").slice(0, 160) });
};
const send = (metod, params = {}) => new Promise((los, avvisa) => {
  const i = ++id; vantar.set(i, { los });
  ws.send(JSON.stringify({ id: i, method: metod, params }));
  setTimeout(() => { if (vantar.has(i)) { vantar.delete(i); avvisa(new Error("timeout " + metod)); } }, 30000);
});
const ev = async (x) => {
  const svar = await send("Runtime.evaluate", { expression: x, returnByValue: true });
  if (svar?.result?.exceptionDetails) return "UNDANTAG: " + (svar.result.exceptionDetails.exception?.description || "").slice(0, 200);
  return svar?.result?.result?.value;
};

await send("Emulation.setUserAgentOverride", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" });
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Network.enable", {});
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Page.enable", {});
await send("Runtime.enable", {});
await send("Log.enable", {});

const rapport = { verktyg: "verktyg/_s7u2o128-bevis.mjs", datum: new Date().toISOString(), mal: "https://lab.ak1nvestor.com", visa: [] };

await send("Page.navigate", { url: "https://lab.ak1nvestor.com/kalkylator" });
await SLEEP(12000); // generös hydratisering

// B) hydratiseringsprobe: togglar React på lägesväxlaren?
const forePressed = await ev(`[...document.querySelectorAll('button[aria-pressed]')].map(b => (b.textContent||'').trim().slice(0,10)+':'+b.getAttribute('aria-pressed')).join(' | ')`);
await ev(`(() => { const b = [...document.querySelectorAll('button[aria-pressed]')].find(e => /AKM2/i.test(e.textContent||'')); if (b) b.click(); return b ? 'klickat' : 'saknas'; })()`);
await SLEEP(2500);
const efterPressed2 = await ev(`[...document.querySelectorAll('button[aria-pressed]')].map(b => (b.textContent||'').trim().slice(0,10)+':'+b.getAttribute('aria-pressed')).join(' | ')`);
rapport.visa.push({ probe: "hydratisering (aria-pressed togglas?)", fore: forePressed, efter: efterPressed2 });

// A) riktiga musklick på fliken «Poängsätt manuellt»
await ev(`(() => { const b = [...document.querySelectorAll('button[aria-pressed]')].find(e => /AKM1/i.test(e.textContent||'')); if (b) b.click(); return 'akm1-aterstall'; })()`);
await SLEEP(1500);
const tabRect = await ev(`(() => { const t = [...document.querySelectorAll('[role=tab]')].find(e => (e.textContent||'').includes('Poängsätt manuellt')); if (!t) return null; const r = t.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
let musklick = "tab saknades";
if (tabRect && typeof tabRect === "object") {
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: tabRect.x + tabRect.w / 2, y: tabRect.y + tabRect.h / 2, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: tabRect.x + tabRect.w / 2, y: tabRect.y + tabRect.h / 2, button: "left", clickCount: 1 });
  await SLEEP(3500);
  const tummar = await ev(`(() => { const ut = []; for (const el of document.querySelectorAll('[data-slot=slider-thumb]')) { const r = el.getBoundingClientRect(); const st = getComputedStyle(el); ut.push({ w: Math.round(r.width), h: Math.round(r.height), minH: st.minHeight, minW: st.minWidth, roll: el.getAttribute('role'), tagg: el.tagName.toLowerCase() }); } return { aktivTab: (document.querySelector('[role=tab][data-state=active]')||{textContent:'?'}).textContent.trim().slice(0,24), tummar: ut }; })()`);
  musklick = tummar;
}
rapport.visa.push({ probe: "riktiga CDP-musklick på flik → monterade tummar", resultat: musklick });

// C) CSS-isolerad mätning: prodens tum-klasser på ett SPAN (Radix renderar span)
const cssIso = await ev(`(() => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;height:100px;width:300px;';
  const tum = document.createElement('span');
  tum.setAttribute('role', 'slider');
  tum.setAttribute('data-slot', 'slider-thumb');
  tum.className = ${JSON.stringify(TUMM_KLASS)};
  wrapper.appendChild(tum);
  document.body.appendChild(wrapper);
  const r = tum.getBoundingClientRect();
  const st = getComputedStyle(tum);
  const ut = { tagg: 'span', w: Math.round(r.width), h: Math.round(r.height), minH: st.minHeight, minW: st.minWidth, media640: window.matchMedia('(max-width: 640px)').matches };
  wrapper.remove();
  // kontroll: SAMMA klasser på en BUTTON (golvet skall lyfta den till 52)
  const wrapper2 = document.createElement('div');
  wrapper2.style.cssText = 'position:relative;height:100px;width:300px;';
  const knapp = document.createElement('button');
  knapp.setAttribute('data-slot', 'slider-thumb');
  knapp.className = ${JSON.stringify(TUMM_KLASS)};
  wrapper2.appendChild(knapp);
  document.body.appendChild(wrapper2);
  const r2 = knapp.getBoundingClientRect();
  const st2 = getComputedStyle(knapp);
  const ut2 = { tagg: 'button', w: Math.round(r2.width), h: Math.round(r2.height), minH: st2.minHeight, minW: st2.minWidth };
  wrapper2.remove();
  return { span: ut, buttonKontroll: ut2 };
})()`);
rapport.visa.push({ probe: "CSS-isolerad: tum-klasser på span vs button (prodens stilmallar)", resultat: cssIso });

const skarm = await send("Page.screenshot", { format: "png" });
if (skarm?.result?.data) writeFileSync("/tmp/o128-bevis.png", Buffer.from(skarm.result.data, "base64"));
rapport.konsolfel = logRader.filter((l) => ["error", "console"].includes(l.level)).slice(0, 8);
writeFileSync("/tmp/o128-bevis.json", JSON.stringify(rapport, null, 1) + "\n");
console.log(JSON.stringify(rapport, null, 1));
ws.close(); barn.kill();
