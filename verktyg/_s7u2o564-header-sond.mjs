#!/usr/bin/env node
/**
 * o564 struktur-sond (s7-u2) — cache-header-granskning dagtid, dom-bar
 * utan tyst lastfönster (o160-mönstret: strukturkvitto är giltigt dagtid;
 * CPU-tal är det inte). Mäter TRE ytor × TVÅ lager:
 *
 *   ytor: / (HTML), /_next/static/chunks/<chunk> (hittas ur HTML:t),
 *         /manifest.webmanifest (o558:s rond-4-yta)
 *   lager: http://localhost:3000 (Next direkt) + https://lab.ak1nvestor.com
 *          (nginx-lagret — loopback är whitelistat i middleware)
 *
 * Per yta: status, Cache-Control, Vary, Content-Encoding vid
 * "Accept-Encoding: gzip, br" samt vid "br" (brotli-test — o5-resten),
 * okomprimerad vs komprimerad storlek (size_download).
 *
 * Utdata: data/forskning/OPTIMERING/lighthouse/o564-header-struktur.json
 * Engångsverktyg — städas när protokollet bokfört (o165-precedensen).
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const LAGER = [
  { namn: "next-direkt", bas: "http://localhost:3000" },
  { namn: "nginx-https", bas: "https://lab.ak1nvestor.com" },
];

const headers = (bas, sokvag, accept) => {
  const ut = execFileSync(
    "curl",
    ["-s", "-D", "-", "-o", "/dev/null", "-H", `Accept-Encoding: ${accept}`, `${bas}${sokvag}`],
    { encoding: "utf8", timeout: 20000 }
  );
  const rad = (namn) => {
    const m = ut.match(new RegExp(`^${namn}:\\s*(.+)$`, "im"));
    return m ? m[1].trim() : null;
  };
  return {
    status: (ut.match(/^HTTP\/[\d.]+\s+(\d+)/m) || [])[1] || null,
    cacheControl: rad("Cache-Control"),
    vary: rad("Vary"),
    contentEncoding: rad("Content-Encoding"),
    contentType: rad("Content-Type"),
  };
};

const storlek = (bas, sokvag, accept) => {
  const n = execFileSync(
    "curl",
    ["-s", "-o", "/dev/null", "-w", "%{size_download}", "-H", `Accept-Encoding: ${accept}`, `${bas}${sokvag}`],
    { encoding: "utf8", timeout: 20000 }
  ).trim();
  return Number(n);
};

// Hitta en riktig statisk chunk ur start-HTML:t (nginx-lagret, gzip av).
const hittaChunk = (bas) => {
  const html = execFileSync("curl", ["-s", "-H", "Accept-Encoding: gzip", "--compressed", `${bas}/`], {
    encoding: "utf8",
    timeout: 20000,
    maxBuffer: 20 * 1024 * 1024,
  });
  const m = html.match(/\/_next\/static\/chunks\/[A-Za-z0-9_.-]+\.js/);
  return m ? m[0] : null;
};

const resultat = { ts: new Date().toISOString(), protokoll: "o564", sonTyp: "struktur-header", sidantal: 0, lager: [] };

for (const l of LAGER) {
  const chunk = hittaChunk(l.bas);
  const ytor = ["/", chunk || "/_next/static/chunks/saknas.js", "/manifest.webmanifest"];
  const mätningar = ytor.map((sokvag) => {
    const rå = headers(l.bas, sokvag, "identity");
    const gz = headers(l.bas, sokvag, "gzip, br");
    const br = headers(l.bas, sokvag, "br");
    const bRå = storlek(l.bas, sokvag, "identity");
    const bGz = storlek(l.bas, sokvag, "gzip, br");
    return {
      sokvag: sokvag.slice(0, 120),
      status: gz.status,
      cacheControl: gz.cacheControl,
      vary: gz.vary ? gz.vary.slice(0, 120) : null,
      encodingGzipBr: gz.contentEncoding,
      encodingBrOnly: br.contentEncoding,
      encodingIdentitet: rå.contentEncoding,
      byteRå: bRå,
      byteKomprimerad: bGz,
      besparningProc: bRå > 0 ? Math.round((1 - bGz / bRå) * 1000) / 10 : null,
    };
  });
  resultat.lager.push({ namn: l.namn, bas: l.bas, statiskChunkHittad: Boolean(chunk), ytor: mätningar });
  resultat.sidantal += mätningar.length;
}

// Strukturdom (o558 rond-4-kontraktet): gzip på för leverans-ytor,
// chunks immutable+long cache, brotli-läge dokumenteras (o5-resten).
const allaYtor = resultat.lager.flatMap((l) => l.ytor);
const htmlGzip = allaYtor.filter((y) => y.sokvag === "/" && y.status === "200" && y.encodingGzipBr === "gzip");
const chunkOk = allaYtor.filter(
  (y) => y.sokvag.includes("/_next/static/") && y.status === "200" && (y.cacheControl || "").includes("immutable")
);
resultat.dom = {
  gzipPåStartsida: htmlGzip.length === LAGER.length ? "GRÖN" : "RÖD",
  statiskaChunksImmutable: chunkOk.length >= 1 ? "GRÖN" : "GRÅ (chunk via nginx mäts i protokoll §4)",
  brotli: allaYtor.some((y) => y.encodingBrOnly === "br") ? "PÅ" : "SAKNAS (o5-resten — kräver nginx-modul, bokat)",
  obs: "Strukturdom giltig dagtid (o160); CPU/TBT-tal ägs av tysta fönster (syskonets o563-eftervakt + natt-cron 03:27).",
};

writeFileSync("data/forskning/OPTIMERING/lighthouse/o564-header-struktur.json", JSON.stringify(resultat, null, 2));
console.log("o564-header-struktur.json skriven — gzip start:", resultat.dom.gzipPåStartsida, "| br:", resultat.dom.brotli);
