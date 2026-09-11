#!/usr/bin/env node
/**
 * AK1A — PROD-PRESTANDAMÄTARE (VÅG 96 / D1 — PRESTANDA VÅG 3).
 *
 * Mäter https://lab.ak1nvestor.com (prod, Contabo + nginx + pm2):
 *   A. TTFB/total: 100 × GET / + 30 × /kurser + 10 bloggposter + 20 speglar
 *      (URL:erna hämtas ur prod-sitemap.xml — aldrig hårdkodade slugs).
 *      Median + p95 per grupp, + status/content-encoding/wire-bytes.
 *   B. Gzip-koll: samma sida med "Accept-Encoding: gzip" vs "identity" —
 *      visar om nginx komprimerar HTML och resurser.
 *   C. Startsidans resurser: parsar HTML (script[src]/link[href]/img[src]),
 *      hämtar varje resurs med gzip och rankar topp-15 per wire-storlek.
 *
 * NOLL beroenden (node:http + node:zlib) — körs med:
 *   node verktyg/testa-prestanda-v96.mjs [namn]      # namn → tool-results/prestanda-v96-<namn>.json
 *
 * Användning FÖRE/EFTER deploy (våg 96 D1): "fore" nu, "efter" av main.
 */

import http from "node:http";
import https from "node:https";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BAS = "https://lab.ak1nvestor.com";
const NAMN = process.argv[2] || "koring";
const UTFIL = join(process.cwd(), "tool-results", `prestanda-v96-${NAMN}.json`);

/** Tidsmätt GET — TTFB = tid till svarshuvuden, total = till sista byte. */
function hamtaRaw(sokvag, { acceptEncoding = "gzip, deflate, br" } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(sokvag, BAS);
    const start = process.hrtime.bigint();
    const req = (url.protocol === "http:" ? http : https).request(
      url,
      {
        method: "GET",
        headers: {
          "User-Agent": "ak1a-prestanda-v96/1.0 (+mätning våg 96 D1)",
          "Accept-Encoding": acceptEncoding,
        },
      },
      (res) => {
        const ttfb = Number(process.hrtime.bigint() - start) / 1e6;
        let byte = 0;
        res.on("data", (c) => (byte += c.length));
        res.on("end", () => {
          const total = Number(process.hrtime.bigint() - start) / 1e6;
          resolve({
            status: res.statusCode,
            ttfb,
            total,
            wireBytes: byte,
            contentEncoding: res.headers["content-encoding"] ?? null,
            contentLengthHeader: res.headers["content-length"] ?? null,
            contentType: res.headers["content-type"] ?? null,
            cacheControl: res.headers["cache-control"] ?? null,
          });
        });
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.end();
  });
}

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Hämta med 429-tålighet: prod nginx rate-limitar (våg 96-mätning: 429 vid
 * 6 samtidiga). STRIKT SEKVENTIELLT + fast gap + backoff-retry vid 429.
 * 429-svar räknas ALDRIG in i mätvärdena.
 */
async function hamta(sokvag, opts = {}) {
  for (let forsok = 0; ; forsok++) {
    const r = await hamtaRaw(sokvag, opts);
    if (r.status !== 429 || forsok >= 3) return r;
    await sov(1500 * (forsok + 1));
  }
}

function text(sokvag) {
  return new Promise((resolve, reject) => {
    const url = new URL(sokvag, BAS);
    (url.protocol === "http:" ? http : https)
      .get(url, { headers: { "Accept-Encoding": "identity" } }, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const p95 = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil(s.length * 0.95) - 1)];
};
const kb = (n) => Math.round(n / 1024);

/** Kör en grupp av sokvägar strikt sekventiellt (429-vänligt) med litet gap. */
async function matGrupp(namn, sokvagar, gap = 90) {
  const rader = [];
  for (const sokvag of sokvagar) {
    try {
      const r = await hamta(sokvag);
      rader.push({ sokvag, ...r });
    } catch (e) {
      rader.push({ sokvag, fel: String(e) });
    }
    await sov(gap);
  }
  const ok = rader.filter((r) => !r.fel && r.status === 200);
  const fel = rader.filter((r) => r.fel || r.status !== 200);
  return {
    namn,
    antal: rader.length,
    statusOk: ok.length,
    statusFel: fel.length,
    felExempel: fel.slice(0, 3).map((f) => `${f.sokvag}: ${f.fel ?? f.status}`),
    ttfbMedianMs: ok.length ? +median(ok.map((r) => r.ttfb)).toFixed(1) : null,
    ttfbP95Ms: ok.length ? +p95(ok.map((r) => r.ttfb)).toFixed(1) : null,
    totalMedianMs: ok.length ? +median(ok.map((r) => r.total)).toFixed(1) : null,
    wireBytesMedian: ok.length ? median(ok.map((r) => r.wireBytes)) : null,
    gzipAktiv: ok.length ? ok.filter((r) => r.contentEncoding).length : 0,
  };
}

/** Hämta mät-URL:er ur prod-sitemap: 10 blogg + 20 speglar (en/ar blandat). */
async function urlUrSitemap() {
  let xml;
  try {
    xml = await text("/sitemap.xml");
  } catch {
    return { blogg: [], speglar: [] };
  }
  const alla = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(BAS, ""),
  );
  const blogg = alla.filter((u) => /^\/blogg\/[^/]+$/.test(u)).slice(0, 10);
  const enKurser = alla.filter((u) => /^\/en\/kurser\/[^/]+$/.test(u));
  const arKurser = alla.filter((u) => /^\/ar\/kurser\/[^/]+$/.test(u));
  const enBlogg = alla.filter((u) => /^\/en\/blogg\/[^/]+$/.test(u));
  const arBlogg = alla.filter((u) => /^\/ar\/blogg\/[^/]+$/.test(u));
  const speglar = [];
  // Blanda en/ar + rötter så att både rot-, kurs- och bloggspeglar täcks.
  speglar.push("/en", "/ar", "/en/kurser", "/ar/kurser", "/en/blogg", "/ar/blogg");
  for (let k = 0; speglar.length < 14; k++) {
    if (enKurser[k]) speglar.push(enKurser[k]);
    if (arKurser[k]) speglar.push(arKurser[k]);
  }
  for (let k = 0; speglar.length < 20; k++) {
    if (enBlogg[k]) speglar.push(enBlogg[k]);
    if (arBlogg[k]) speglar.push(arBlogg[k]);
  }
  return { blogg: blogg.slice(0, 10), speglar: speglar.slice(0, 20) };
}

/** Gzip-jämförelse på en URL: identity vs gzip (båda om servern tillåter). */
async function gzipKoll(sokvag) {
  const ident = await hamta(sokvag, { acceptEncoding: "identity" });
  const gz = await hamta(sokvag, { acceptEncoding: "gzip" });
  return {
    sokvag,
    identityBytes: ident.wireBytes,
    gzipEncoding: gz.contentEncoding,
    gzipBytes: gz.contentEncoding ? gz.wireBytes : null,
    sparadeProcent:
      gz.contentEncoding && ident.wireBytes
        ? Math.round((1 - gz.wireBytes / ident.wireBytes) * 100)
        : 0,
  };
}

/** Parsa startsidans resurser ur HTML och mät deras wire-storlek (gzip). */
async function resursAnalys() {
  const html = await text("/");
  const src = new Set();
  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) src.add(m[1]);
  for (const m of html.matchAll(/<link[^>]+href="([^"]+)"/g)) src.add(m[1]);
  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) src.add(m[1]);
  const resurser = [];
  for (const r of src) {
    if (!r || r.startsWith("data:")) continue;
    try {
      const m = await hamta(r);
      resurser.push({
        url: r,
        typ: r.includes("/_next/static")
          ? r.endsWith(".css")
            ? "css"
            : "js"
          : r.match(/\.(png|jpe?g|webp|svg|ico|woff2?)$/i)?.[1] ?? "annat",
        wireBytes: m.wireBytes,
        contentEncoding: m.contentEncoding,
        cacheControl: m.cacheControl,
      });
    } catch {
      /* hoppa över */
    }
    await sov(60);
  }
  resurser.sort((a, b) => b.wireBytes - a.wireBytes);
  return {
    htmlBytes: Buffer.byteLength(html),
    antalResurser: resurser.length,
    summaWireBytes: resurser.reduce((a, r) => a + r.wireBytes, 0),
    topp15: resurser.slice(0, 15).map((r) => ({
      ...r,
      wireKB: kb(r.wireBytes),
    })),
  };
}

// ── huvudkörning ────────────────────────────────────────────────────────────
console.log(`# PRESTANDA VÅG 96 (D1) — ${BAS} — ${new Date().toISOString()}`);
const { blogg, speglar } = await urlUrSitemap();
console.log(
  `Sitemap: ${blogg.length} bloggposter + ${speglar.length} speglar funna`,
);

const start = await matGrupp("start-100", Array(100).fill("/"));
const kurser = await matGrupp("kurser-30", Array(30).fill("/kurser"));
const bloggGrupp = blogg.length ? await matGrupp("blogg-10", blogg) : null;
const spegelGrupp = speglar.length ? await matGrupp("speglar-20", speglar) : null;

console.log("\n── TTFB/total (median · p95 · wire) ──");
for (const g of [start, kurser, bloggGrupp, spegelGrupp].filter(Boolean)) {
  console.log(
    `${g.namn}: ${g.statusOk}/${g.antal} ok · TTFB ${g.ttfbMedianMs}/${g.ttfbP95Ms} ms · total ${g.totalMedianMs} ms · wire ~${kb(g.wireBytesMedian)} kB · gzip på ${g.gzipAktiv}/${g.statusOk}`,
  );
  if (g.statusFel) console.log(`  FEL: ${g.felExempel.join(" | ")}`);
}

console.log("\n── Gzip-koll (HTML + representativa resurser) ──");
const gzipRader = [];
for (const u of [
  "/",
  "/kurser",
  blogg[0],
  speglar.find((s) => s.startsWith("/en")),
  "/sok-index.json",
  "/manifest.json",
].filter(Boolean)) {
  const r = await gzipKoll(u);
  gzipRader.push(r);
  console.log(
    `${u}: identity ${kb(r.identityBytes)} kB → ${r.gzipEncoding ?? "OPAK"} ${r.gzipBytes ? kb(r.gzipBytes) + " kB" : "-"} (−${r.sparadeProcent} %)`,
  );
  await sov(120);
}

console.log("\n── Startsidans resurser (topp-15 per wire-storlek) ──");
const resurser = await resursAnalys();
console.log(
  `HTML ${kb(resurser.htmlBytes)} kB (identity) · ${resurser.antalResurser} resurser · summa wire ${kb(resurser.summaWireBytes)} kB`,
);
for (const r of resurser.topp15) {
  console.log(
    `  ${String(r.wireKB).padStart(5)} kB ${r.contentEncoding ? `(${r.contentEncoding})` : "(opak)"} ${r.typ.padEnd(5)} ${r.url.slice(0, 90)}`,
  );
}

const rapport = {
  datum: new Date().toISOString(),
  bas: BAS,
  grupper: [start, kurser, bloggGrupp, spegelGrupp].filter(Boolean),
  urler: { blogg, speglar },
  gzip: gzipRader,
  startResurser: resurser,
};
writeFileSync(UTFIL, JSON.stringify(rapport, null, 2));
console.log(`\nJSON → ${UTFIL}`);
