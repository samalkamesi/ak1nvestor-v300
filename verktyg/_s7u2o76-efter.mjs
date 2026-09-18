#!/usr/bin/env node
// o76 EFTER-pass (s7-u2): väntar in prod-synkens deploy av 295ce77c,
// verifierar kuren hash-okänsligt, mäter Lighthouse /kurser+/blogg och
// jämför mot FÖRE (s7u3o75-fore). All utdata till stdout + stdout-logg.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BAS = "http://localhost:3000";
const PROD = "https://lab.ak1nvestor.com";
const KAT = "data/forskning/OPTIMERING/lighthouse";
const startTid = Date.now();
const takMin = 22;
const log = (...a) => console.log(`[${Math.round((Date.now() - startTid) / 1000)}s]`, ...a);

const hamta = async (url, opts = {}) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(15000), ...opts });
  return { status: r.status, text: opts.method === "HEAD" ? "" : await r.text(), headers: r.headers };
};

/** Kuren live = ingen script-tagg-chunk i /kurser-HTML:n bär palett-koden. */
async function kurLive() {
  try {
    const { status, text } = await hamta(BAS + "/kurser");
    if (status !== 200) return { live: false, varfor: `HTML ${status}` };
    const chunkar = [...text.matchAll(/\/_next\/static\/chunks\/[A-Za-z0-9_-]+\.js/g)].map((m) => m[0]);
    const unika = [...new Set(chunkar)];
    for (const c of unika) {
      const r = await hamta(BAS + c);
      if (r.status === 200 && r.text.includes("navigationsminne")) {
        return { live: false, varfor: `chunk bär palett-kod: ${c.split("/").pop()}` };
      }
    }
    return { live: true, unika };
  } catch (e) {
    return { live: false, varfor: String(e?.message ?? e) };
  }
}

// 1) Vänta på deploy
let live = null;
while (Date.now() - startTid < takMin * 60 * 1000) {
  live = await kurLive();
  if (live.live) break;
  log("väntar deploy:", live.varfor);
  await new Promise((r) => setTimeout(r, 45000));
}
if (!live?.live) {
  log("DEPLOY EJ LIVE inom taket — kör skriptet igen (vakarövertag).");
  process.exit(1);
}
log("KUR LIVE: ingen initial chunk på /kurser bär palett-koden (" + live.unika.length + " chunkar testade)");

// 2) prod 200 ×3
for (const s of ["/", "/kurser", "/blogg"]) {
  const r = await hamta(PROD + s, { method: "HEAD" });
  log(`prod ${s}: HTTP ${r.status}`);
  if (r.status !== 200) { log("PROD INTE 200 — avbryter"); process.exit(1); }
}

// 3) SEQ-grind: vänta chrome-tystnad (syskonmätningar)
let chrome = 99;
for (let i = 0; i < 40; i++) {
  try { chrome = Number(execFileSync("pgrep", ["-c", "chrome"], { encoding: "utf8" }).trim()) || 0; }
  catch { chrome = 0; }
  if (chrome === 0) break;
  log(`SEQ-väntar: ${chrome} chrome-procs`);
  await new Promise((r) => setTimeout(r, 20000));
}
log("chrome-procs:", chrome);

// 4) Lighthouse EFTER
log("kör Lighthouse /kurser + /blogg …");
execFileSync("node", ["verktyg/prestanda-lighthouse.mjs", "s7u2o76-efter", "/kurser", "/blogg"], {
  stdio: "inherit", timeout: 300000,
});

// 5) Jämförelse + nätverkskontroll
const efter = JSON.parse(readFileSync(`${KAT}/s7u2o76-efter-sammanfattning.json`, "utf8"));
const foreFil = `${KAT}/s7u3o75-fore-sammanfattning.json`;
const fore = JSON.parse(readFileSync(foreFil, "utf8"));
for (const e of efter.sidor) {
  const f = fore.sidor.find((s) => s.sokvag === e.sokvag);
  const nm = (x) => x?.karnmattMs ?? {};
  log(`${e.sokvag}: P${Math.round((f?.poang.prestanda ?? 0) * 100)} → P${Math.round(e.poang.prestanda * 100)}` +
      ` · LCP ${nm(f).LCP} → ${nm(e).LCP} · TBT ${nm(f).TBT} → ${nm(e).TBT} · CLS ${nm(f).CLS} → ${nm(e).CLS}`);
}
for (const sida of ["kurser", "blogg"]) {
  const r = JSON.parse(readFileSync(`${KAT}/${sida}-s7u2o76-efter.json`, "utf8"));
  const lh = r.lighthouseResult ?? r;
  const net = lh.audits["network-requests"].details.items;
  const palett = net.filter((n) => n.resourceType === "Script" && n.url.includes("/chunks/"));
  const rsc = net.filter((n) => "_rsc" in n.url || n.url.includes("?_rsc"));
  log(`${sida}: ${net.length} requests, ${Math.round(net.reduce((a, n) => a + (n.transferSize || 0), 0) / 1024)} KiB, _rsc: ${rsc.length}, script-chunkar: ${palett.length}`);
  const tidig = net.filter((n) => (n.networkRequestTime ?? 9999) < 2000 && (n.transferSize || 0) > 10000);
  for (const n of tidig.slice(0, 6)) log(`  tidig tung: ${n.url.split("/").pop()} ${(n.transferSize / 1024).toFixed(1)} KiB @${Math.round(n.networkRequestTime)} ms`);
}
log("EFTER-PASS KLART");
