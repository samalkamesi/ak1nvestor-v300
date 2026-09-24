#!/usr/bin/env node
/**
 * AK1A — o99-PROXY: A/B-kanal för golv-CSS utan bygge (o78-mönstret).
 *
 * Reverse proxy mot localhost:3000 som injicerar kandidat-CSS i <head> på
 * HTML-svaren (övriga resurser pass-through oförändrade). Lighthouse/sond
 * mot http://127.0.0.1:9377 mäter sidan SOM OM kuren vore deployad —
 * identisk kanal, enda delta = injicerad CSS.
 *
 * Användning: node verktyg/_s7u2o99-proxy.mjs [golvfil.css] [port]
 *   (std: verktyg/_s7u2o99-golv.css, port 9377; Ctrl-C stoppar)
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GOLVFIL = process.argv[2] || join(process.cwd(), "verktyg/_s7u2o99-golv.css");
const PORT = Number(process.argv[3] || 9377);
const UPPSTRAM = "http://127.0.0.1:3000";
const golv = readFileSync(GOLVFIL, "utf8");
const TAG = `<style id="o99-golv">\n${golv}\n</style>`;

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
      html = html.includes("</head>")
        ? html.replace("</head>", `${TAG}</head>`)
        : TAG + html;
      const buf = Buffer.from(html, "utf8");
      headers["content-length"] = String(buf.length);
      res.writeHead(upp.status, headers);
      res.end(buf);
      console.log(`${req.method} ${req.url} → ${upp.status} (HTML +golv ${buf.length}B)`);
    } else {
      const buf = Buffer.from(await upp.arrayBuffer());
      headers["content-length"] = String(buf.length);
      res.writeHead(upp.status, headers);
      res.end(buf);
    }
  } catch (e) {
    res.writeHead(502, { "content-type": "text/plain" });
    res.end(`o99-proxy: ${e}`);
  }
});
server.listen(PORT, "127.0.0.1", () => console.log(`o99-proxy på http://127.0.0.1:${PORT} (golv: ${GOLVFIL}, ${golv.length}B)`));
