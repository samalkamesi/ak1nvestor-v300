#!/usr/bin/env node
/**
 * AK1A — SOND s7-u3/o56: o54/o51-EFTER-bevis ur Lighthouse-rawdata.
 *
 * Läser {start,kurser,blogg}-s7u3o54-efter.json och plockar:
 *   · woff2-nätverksstart (o54 kriterium b: kursiv ~80–150 ms, ej 954–1509)
 *   · ?_rsc-prefetch på /kurser (o51-förväntan: the-intelligent-investor 3→0)
 *   · total requests/transfer per sida
 * Slår även ihop den gemensamma EFTER-sammanfattningen (3 sidor) igen —
 * enskilda verktygskörningar skriver en sida per fil.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KAT = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse");
const NAMN = "s7u3o54-efter";
const SIDOR = [["start", "/"], ["kurser", "/kurser"], ["blogg", "/blogg"]];

const ms = (x) => (x == null ? null : Math.round(x * 1000));
const kib = (x) => (x == null ? null : Math.round(x / 102.4) / 10);

const ut = {};
const samman = { datum: new Date().toISOString(), bas: "http://localhost:3000", namn: NAMN, sidor: [] };

for (const [slug, sokvag] of SIDOR) {
  const r = JSON.parse(readFileSync(join(KAT, `${slug}-${NAMN}.json`), "utf8"));
  const req = r.audits["network-requests"]?.details?.items ?? [];
  const woff2 = req
    .filter((n) => n.url.endsWith(".woff2"))
    .map((n) => ({ fil: n.url.split("/").pop(), startMs: ms(n.networkRequestTime), overforingKiB: kib(n.transferSize) }))
    .sort((a, b) => a.startMs - b.startMs);
  const rsc = req
    .filter((n) => n.url.includes("?_rsc"))
    .map((n) => ({ url: n.url.split("?")[0].slice(-45), startMs: ms(n.networkRequestTime), overforingKiB: kib(n.transferSize) }));
  const totalOverforing = req.reduce((a, n) => a + (n.transferSize ?? 0), 0);
  const aud = r.audits ?? {};
  const lcpNycklar = Object.keys(aud).filter((k) => k.includes("lcp"));
  const lcpInsights = lcpNycklar
    .filter((k) => aud[k]?.details?.items?.length)
    .map((k) => ({ nyckel: k, titel: aud[k].title, items: aud[k].details.items.slice(0, 2) }));
  ut[sokvag] = {
    poangPrestanda: Math.round((r.categories?.performance?.score ?? 0) * 100),
    LCP: ms(aud["largest-contentful-paint"]?.numericValue / 1000),
    TBT: ms(aud["total-blocking-time"]?.numericValue / 1000),
    CLS: aud["cumulative-layout-shift"]?.numericValue,
    requests: req.length,
    overforingKiB: kib(totalOverforing),
    woff2Start: woff2,
    rscPrefetch: rsc,
  };
  samman.sidor.push({
    sokvag,
    poang: { prestanda: r.categories?.performance?.score ?? null },
    karnmattMs: {
      FCP: ms(aud["first-contentful-paint"]?.numericValue / 1000),
      LCP: ms(aud["largest-contentful-paint"]?.numericValue / 1000),
      TBT: ms(aud["total-blocking-time"]?.numericValue / 1000),
      CLS: aud["cumulative-layout-shift"]?.numericValue ?? null,
      TTI: ms(aud["interactive"]?.numericValue / 1000),
      SI: ms(aud["speed-index"]?.numericValue / 1000),
    },
  });
  if (slug === "start") ut[sokvag].lcpInsights = lcpInsights;
}

writeFileSync(join(KAT, `${NAMN}-sammanfattning.json`), JSON.stringify(samman, null, 2));
writeFileSync(join(KAT, `s7u3o56-sond-efter.json`), JSON.stringify(ut, null, 2));
console.log(JSON.stringify(ut, null, 2));
