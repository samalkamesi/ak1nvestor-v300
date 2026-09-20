#!/usr/bin/env node
/**
 * AK1A — o100 A/B-ROND: kurens EFTER-mätning utan bygge (o99-proxy-mönstret).
 *
 * Startar reverse proxy mot 127.0.0.1:3000 som injicerar
 * verktyg/_s7u2o104-band.css i HTML-<head> (port 9378), kör sedan sonden
 * _s7u2o104-sond.mjs SEKVENSIELLT mot proxyn för bandets alla geometrier
 * (brytpunkternas båda sidor + o97-kontrollerna), skriver o104sond-ab-*.json
 * och avslutar allt (proxy + chrome) i EN process — skal-säkert (våg 148).
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const BANDFIL = join(process.cwd(), "verktyg/_s7u2o104-band.css");
const PORT = 9378;
const UPPSTRAM = "http://127.0.0.1:3000";
const band = readFileSync(BANDFIL, "utf8");
const TAG = `<style id="o100-band">\n${band}\n</style>`;

// RAM-vakt (sondporten har sin egen; här för proxy+chrome-tillfället).
const memAvailable = Number(/^MemAvailable:\s+(\d+) kB$/m.exec(readFileSync("/proc/meminfo", "utf8"))[1]) / 1024;
if (memAvailable < 550) { console.error(`RAM-vakt: ${Math.round(memAvailable)} MB < 550 — avbryter (exit 2)`); process.exit(2); }

const server = createServer(async (req, res) => {
  try {
    const upp = await fetch(UPPSTRAM + req.url, {
      method: req.method,
      headers: { ...req.headers, host: "localhost:3000" },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
      redirect: "manual",
    });
    const headers = {};
    upp.headers.forEach((v, k) => {
      if (!["content-encoding", "content-length", "transfer-encoding", "connection"].includes(k)) headers[k] = v;
    });
    const ctyp = upp.headers.get("content-type") || "";
    if (ctyp.includes("text/html")) {
      let html = await upp.text();
      html = html.includes("</head>") ? html.replace("</head>", `${TAG}</head>`) : TAG + html;
      const buf = Buffer.from(html, "utf8");
      headers["content-length"] = String(buf.length);
      res.writeHead(upp.status, headers);
      res.end(buf);
    } else {
      const buf = Buffer.from(await upp.arrayBuffer());
      headers["content-length"] = String(buf.length);
      res.writeHead(upp.status, headers);
      res.end(buf);
    }
  } catch (e) {
    res.writeHead(502, { "content-type": "text/plain" });
    res.end(`o100-ab: ${e}`);
  }
});

const GEOMETRIER = [
  ["ab3-700", "700x1050"],
  ["ab3-720", "720x1050"],
  ["ab3-740", "740x1050"],
  ["ab3-768", "768x1024"],
  ["ab3-800", "800x1180"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
console.log(`o100 A/B-proxy på http://127.0.0.1:${PORT} (band ${band.length}B)`);

for (const [namn, geo] of GEOMETRIER) {
  console.log(`\n=== ${namn} @ ${geo} ===`);
  const p = spawn("node", ["verktyg/_s7u2o104-sond.mjs", namn, `http://127.0.0.1:${PORT}/kurser`, geo], { stdio: "inherit" });
  await new Promise((r) => p.on("close", r));
  await sleep(1000);
}

server.close();
console.log("\no100 A/B-rond klar — proxy stängd.");
process.exit(0);
