#!/usr/bin/env node
/**
 * AK1A — LIGHTHOUSE-MÄTARE (SPÅR 7 / v96-mönstret — "mät före/efter").
 *
 * Kör äkta Lighthouse (npx, cache:ad — NOLL projektberoenden) mot
 * localhost:3000 (loopback är whitelistad i middleware) med mobil-
 * emulering (simulerad 4G-drossel = reproducerbart). Per sida sparas:
 *   · poäng (prestanda/tillgänglighet/bästa praxis/SEO)
 *   · kärnmått (FCP/LCP/TBT/CLS/TTI/SI) i ms
 *   · nyckelauditer (render-blocking, unused-js, bildformat, totalvikt,
 *     DOM-storlek, cache-lifetime) med concis advice
 *
 * Användning:
 *   node verktyg/prestanda-lighthouse.mjs <namn> [sokvag ...]
 *   node verktyg/prestanda-lighthouse.mjs fore            # /, /kurser, /blogg
 *   node verktyg/prestanda-lighthouse.mjs efter / /kurser
 *
 * Utdata:
 *   data/forskning/OPTIMERING/lighthouse/<sida>-<namn>.json  (full rapport)
 *   data/forskning/OPTIMERING/lighthouse/<namn>-sammanfattning.json (jämförbar)
 *
 * Före/efter-jämförelse:
 *   node -e 'import("./verktyg/prestanda-lighthouse.mjs")'  — eller läs de
 *   två sammanfattningarna; skillnader redovisas i OPTIMERING-dokumentet.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BAS = process.env.LH_BAS || "http://localhost:3000";
const NAMN = process.argv[2] || "koring";
const SIDOR = process.argv.slice(3).length
  ? process.argv.slice(3)
  : ["/", "/kurser", "/blogg"];
const UTFILKAT = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse");
const SLUG = (s) => s.replace(/^\//, "").replace(/\//g, "_") || "start";

mkdirSync(UTFILKAT, { recursive: true });

/** Kör Lighthouse CLI och returnera parsad JSON-rapport. */
function korLighthouse(sokvag) {
  const url = new URL(sokvag, BAS).href;
  const args = [
    "--yes", "lighthouse", url,
    "--output=json", "--output-path=stdout",
    "--form-factor=mobile",
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
    "--max-wait-for-load=60000",
    "--quiet",
  ];
  const stdout = execFileSync("npx", args, {
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const rapport = JSON.parse(stdout); // hela rapporten på stdout
  writeFileSync(join(UTFILKAT, `${SLUG(sokvag)}-${NAMN}.json`), stdout);
  return rapport;
}

/** Plocka det jämförbara ur en full rapport. */
function sammanfatta(sokvag, r) {
  const kat = r.categories ?? {};
  const aud = r.audits ?? {};
  const ms = (x) => (x?.numericValue != null ? Math.round(x.numericValue) : null);
  const nyckel = [
    "render-blocking-resources",
    "unused-javascript",
    "modern-image-formats",
    "uses-optimized-images",
    "offscreen-images",
    "total-byte-weight",
    "dom-size",
    "uses-long-cache-ttl",
    "unused-css-rules",
    "bootup-time",
    "mainthread-work-breakdown",
  ];
  return {
    sokvag,
    poang: {
      prestanda: kat.performance?.score ?? null,
      tillganglighet: kat.accessibility?.score ?? null,
      bastaPraxis: kat["best-practices"]?.score ?? null,
      seo: kat.seo?.score ?? null,
    },
    karnmattMs: {
      FCP: ms(aud["first-contentful-paint"]),
      LCP: ms(aud["largest-contentful-paint"]),
      TBT: ms(aud["total-blocking-time"]),
      CLS: aud["cumulative-layout-shift"]?.numericValue ?? null,
      TTI: ms(aud["interactive"]),
      SI: ms(aud["speed-index"]),
    },
    nyckelauditer: Object.fromEntries(
      nyckel
        .filter((k) => aud[k])
        .map((k) => [
          k,
          {
            poang: aud[k].score ?? null,
            visar: aud[k].displayValue ?? "",
            rad: aud[k].displayValue
              ? `${aud[k].title} — ${aud[k].displayValue}`
              : null,
          },
        ]),
    ),
  };
}

const sammanfattningar = [];
for (const sokvag of SIDOR) {
  process.stdout.write(`Mäter ${sokvag} … `);
  try {
    const r = korLighthouse(sokvag);
    const s = sammanfatta(sokvag, r);
    sammanfattningar.push(s);
    console.log(
      `P${Math.round((s.poang.prestanda ?? 0) * 100)} · LCP ${s.karnmattMs.LCP} ms · TBT ${s.karnmattMs.TBT} ms · CLS ${s.karnmattMs.CLS}`,
    );
  } catch (e) {
    sammanfattningar.push({ sokvag, fel: String(e).slice(0, 300) });
    console.log(`FEL: ${String(e).slice(0, 200)}`);
  }
}

const utfil = join(UTFILKAT, `${NAMN}-sammanfattning.json`);
writeFileSync(
  utfil,
  JSON.stringify(
    { datum: new Date().toISOString(), bas: BAS, namn: NAMN, sidor: sammanfattningar },
    null,
    2,
  ),
);
console.log(`\nSammanfattning → ${utfil}`);

/** Före/efter-tabell: LH_JAMFOR=fore node … efter / — skriver diff per sida. */
if (process.env.LH_JAMFOR) {
  const a = JSON.parse(readFileSync(join(UTFILKAT, `${process.env.LH_JAMFOR}-sammanfattning.json`), "utf8"));
  const fore = Object.fromEntries(a.sidor.map((s) => [s.sokvag, s]));
  console.log(`\nJämförelse mot ${process.env.LH_JAMFOR}:`);
  for (const s of sammanfattningar) {
    const f = fore[s.sokvag];
    if (!f?.karnmattMs) continue;
    const d = (x, y) => (x == null || y == null ? "?" : `${y > x ? "+" : ""}${Math.round(y - x)}`);
    console.log(
      `${s.sokvag}: P ${Math.round(f.poang.prestanda * 100)}→${Math.round(s.poang.prestanda * 100)} · LCP ${f.karnmattMs.LCP}→${s.karnmattMs.LCP} (${d(f.karnmattMs.LCP, s.karnmattMs.LCP)} ms) · TBT ${f.karnmattMs.TBT}→${s.karnmattMs.TBT}`,
    );
  }
}
