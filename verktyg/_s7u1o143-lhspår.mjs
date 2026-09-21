#!/usr/bin/env node
/**
 * AK1A — o143 CLS-spårfångst: kör Lighthouse (--save-assets) tills CLS>0.15
 * uppträder på /dataset, dekomprimerar spåret och dumpar LayoutShift-händelser
 * (score + old/new-rect + det Lighthouse renderar dem ifrån).
 *
 * node verktyg/_s7u1o143-lhspår.mjs [sokvag] [maxFörsök]
 * Utdata: data/forskning/OPTIMERING/lighthouse/lhspår-o143-*.json
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync, mkdirSync, existsSync, readdir } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const SIDA = process.argv[2] || "/dataset";
const MAX = Number(process.argv[3] || 4);
const BAS = process.env.LH_BAS || "http://localhost:3000";
const KAT = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse");
mkdirSync(KAT, { recursive: true });

for (let i = 1; i <= MAX; i++) {
  const tmp = `/tmp/lh-o143-${Date.now()}`;
  mkdirSync(tmp, { recursive: true });
  process.stdout.write(`Försök ${i}: ${SIDA} … `);
  const stdout = execFileSync("npx", [
    "--yes", "lighthouse", new URL(SIDA, BAS).href,
    "--output=json", `--output-path=${join(tmp, "rapport.json")}`,
    "--save-assets",
    "--form-factor=mobile",
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
    "--max-wait-for-load=60000",
    "--quiet",
  ], { encoding: "utf8", timeout: 180_000, maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
  void stdout;
  const rapport = JSON.parse(readFileSync(join(tmp, "rapport.json"), "utf8"));
  const cls = rapport.audits["cumulative-layout-shift"].numericValue;
  const tbt = rapport.audits["total-blocking-time"].numericValue;
  console.log(`CLS ${cls.toFixed(4)} · TBT ${Math.round(tbt)}`);
  if (cls > 0.15) {
    // Lighthouse 13 skriver okomprimerad "rapport-0.trace.json" (äldre namn:
    // rapport-0.trace.gz) — hantera båda.
    const kandidater = [join(tmp, "rapport-0.trace.json"), join(tmp, "rapport-0.trace.gz"), join(tmp, "rapport.trace.json"), join(tmp, "rapport.trace.gz")];
    const sparFil = kandidater.find((f) => existsSync(f));
    if (!sparFil) throw new Error("Ingen spårfil hittad i " + tmp + ": " + (await readdir(tmp)).join(", "));
    const rå = readFileSync(sparFil);
    const spår = sparFil.endsWith(".gz") ? JSON.parse(gunzipSync(rå).toString("utf8")) : JSON.parse(rå.toString("utf8"));
    const shift = spår.traceEvents
      .filter((e) => e.name === "LayoutShift" && e.args?.data)
      .map((e) => ({
        tsMs: Math.round(e.ts / 1000),
        ...e.args.data,
      }));
    const lcpEv = spår.traceEvents.filter((e) => e.name === "largestContentfulPaint::Candidate").pop();
    const fcpEv = spår.traceEvents.find((e) => e.name === "firstContentfulPaint");
    const utfil = join(KAT, `lhspår-o143-${i}.json`);
    writeFileSync(utfil, JSON.stringify({
      datum: new Date().toISOString(), sida: SIDA, cls, tbt: Math.round(tbt),
      fcpTsUs: fcpEv?.ts ?? null, lcpTsUs: lcpEv?.ts ?? null,
      antalShiftEvents: shift.length, shift,
    }, null, 2));
    console.log(`→ SPÅR FÅNGAT: ${utfil} (${shift.length} shift-event)`);
    for (const s of shift.slice(0, 10)) {
      console.log(`  ts=${s.tsMs}ms score=${(s.score ?? 0).toFixed(4)} old=[${(s.old_rect || []).join(",")}] new=[${(s.new_rect || []).join(",")}]${s.impacted_nodes ? " noder:" + s.impacted_nodes.length : ""}`);
    }
    rmSync(tmp, { recursive: true, force: true });
    process.exit(0);
  }
  rmSync(tmp, { recursive: true, force: true });
}
console.log("Inget skift > 0.15 fångades — utsömningsläge, försök igen senare");
