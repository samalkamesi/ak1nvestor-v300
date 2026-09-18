#!/usr/bin/env node
// s7-u3 o78-sond: CDP-trace på /kurser — VILKA Layout/UpdateLayoutTree-events
// äter styleLayout-tiden (Lighthouse: 783–1215 ms)? Kall laddning, mobil-
// emulering (412x844 dpr2, CPU-drossel 4x, Slow 4G — Lighthouse-likt).
// Stack-atribuering via Profiler-samples (stacksampling-kategorin).
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const PORT = 9378;
const URL = process.env.SOND_URL || "http://localhost:3000/kurser";
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));
const UT = process.env.SOND_UT || "data/forskning/OPTIMERING/lighthouse/sond-s7u3o78-trace-fore.json";

const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
  `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/o78sond", "about:blank",
], { stdio: "ignore" });
await SLEEP(2500);

const listar = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const wsSida = new WebSocket(listar.find((s) => s.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (wsSida.onopen = r));

let seq = 0;
const vantar = new Map();
const traceEvents = [];
const profileChunks = [];
wsSida.addEventListener("message", (m) => {
  const d = JSON.parse(m.data);
  if (d.id && vantar.has(d.id)) { vantar.get(d.id)(d.result ?? d); vantar.delete(d.id); }
  if (d.method === "Tracing.dataCollected" && Array.isArray(d.params?.data)) {
    for (const ev of d.params.data) {
      if (ev.cat?.includes("devtools.timeline")) traceEvents.push(ev);
      if (ev.name === "ProfileChunk" || ev.name === "Profile") profileChunks.push(ev);
    }
  }
});
function send(metod, parametrar) {
  return new Promise((res) => {
    const id = ++seq;
    vantar.set(id, res);
    wsSida.send(JSON.stringify({ id, method: metod, params: parametrar }));
  });
}

// Lighthouse-lik emulering: Moto-G-storlek, 4x CPU, Slow 4G, kall cache
await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Emulation.setCPUThrottlingRate", { rate: 4 });
await send("Network.enable", {});
await send("Network.emulateNetworkConditions", {
  latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, offline: false,
});
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Page.enable", {});
await send("Tracing.start", {
  transferMode: "ReportEvents",
  categories: [
    "devtools.timeline",
    "disabled-by-default-devtools.timeline",
    "disabled-by-default-devtools.timeline.stacksampling",
  ].join(","),
});
await send("Page.navigate", { url: URL });
await SLEEP(14000); // LCP-fönstret + hydrat + font-swap med god marginal
await send("Tracing.end", {});
await SLEEP(2500);

// ── Analys ─────────────────────────────────────────────────────────────────
const t0 = traceEvents.find((e) => e.name === "navigationStart")?.ts
  ?? traceEvents.filter((e) => e.ts > 0).reduce((a, b) => (a.ts < b.ts ? a : b)).ts;
const rel = (ts) => Math.round((ts - t0) / 1000); // ms sedan navigationStart

const langa = traceEvents
  .filter((e) => (e.name === "Layout" || e.name === "UpdateLayoutTree") && e.dur > 1000)
  .sort((a, b) => b.dur - a.dur);
const perNamn = {};
for (const e of traceEvents) {
  if (e.name !== "Layout" && e.name !== "UpdateLayoutTree") continue;
  perNamn[e.name] ??= { antal: 0, totalMs: 0 };
  perNamn[e.name].antal++;
  perNamn[e.name].totalMs += e.dur / 1000;
}

// Profiler-samples → tid+stack (för atribuering av långa events)
const nodes = new Map();
const samples = []; // {ts, stack:[callFrame…]}
let profTs = null, ackad = 0;
for (const ev of profileChunks) {
  if (ev.name === "Profile") { profTs = ev.ts; ackad = 0; continue; }
  const p = ev.args?.data;
  if (!p?.cpuProfile) continue;
  for (const n of p.cpuProfile.nodes ?? []) nodes.set(n.id, n);
  const deltas = p.timeDeltas ?? [];
  (p.cpuProfile.samples ?? []).forEach((sid, i) => {
    ackad += deltas[i] ?? 0;
    samples.push({ ts: (profTs ?? 0) + ackad, id: sid });
  });
}
function stackFor(id) {
  const frames = [];
  let n = nodes.get(id);
  let djup = 0;
  while (n && djup < 24) {
    frames.push(`${n.callFrame.functionName || "(anonym)"}@${(n.callFrame.url || "").split("/").pop()}:${n.callFrame.lineNumber + 1}`);
    n = nodes.get(n.parent ?? 0) ?? (n.parent ? nodes.get(n.parent) : undefined);
    djup++;
  }
  return frames;
}
function toppForLang(event) {
  const start = event.ts, slut = event.ts + (event.dur ?? 0);
  const traffar = samples.filter((s) => s.ts >= start - 300 && s.ts <= slut + 300);
  const raknare = new Map();
  for (const s of traffar) {
    const st = stackFor(s.id);
    for (let i = 0; i < Math.min(st.length, 6); i++) raknare.set(st[i], (raknare.get(st[i]) ?? 0) + 1);
  }
  return [...raknare.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([f, n]) => `${n}× ${f}`);
}

// Nätverkslandningar + paint-markörer för tidsaxel-korrelation
const markorer = {};
for (const e of traceEvents) {
  if (e.name === "firstContentfulPaint" || e.name === "firstMeaningfulPaint" || e.name === "largestContentfulPaint::Candidate")
    markorer[e.name] = rel(e.ts);
  if (e.name === "ResourceReceiveResponse" && /woff2?/.test(e.args?.data?.url ?? ""))
    markorer[`font:${(e.args.data.url ?? "").split("/").pop()}`] = rel(e.ts);
  if (e.name === "ResourceFinish" && /\/api\/kurs\//.test(e.args?.data?.url ?? ""))
    markorer[`api-kurs ×${(markorer.apiKursRaknare = (markorer.apiKursRaknare ?? 0) + 1)}`] = rel(e.ts);
}

const rapport = {
  url: URL, ts: new Date().toISOString(),
  styleLayoutLighthouse: { o76Mätning: 1215, o78Före: 783 },
  perEventTyp: perNamn,
  markorer,
  langaEvents: langa.slice(0, 14).map((e) => ({
    namn: e.name, startMs: rel(e.ts), varaktighetMs: Math.round(e.dur / 1000),
    detaljer: e.name === "Layout"
      ? { dirtyObjects: e.args?.beginData?.dirtyObjects, totalObjects: e.args?.endData?.layoutObjects }
      : { dirtyObjects: e.args?.beginData?.dirtyObjects, totalObjects: e.args?.beginData?.totalObjects },
    toppStack: e.dur > 8000 ? toppForLang(e) : undefined,
  })),
};
writeFileSync(UT, JSON.stringify(rapport, null, 2));
console.log(JSON.stringify(rapport, null, 2));
chrome.kill();
process.exit(0);
