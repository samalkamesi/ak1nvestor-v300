#!/usr/bin/env node
/**
 * AK1A — BYGGMINNES-OBSERVATÖR (o132, spår 7 — driftstöd, ALDRIG byggande).
 *
 * Syfte: kvantifiera next-buildens faktiska minnesbehov i skarpt
 * deployfönster (OOM-serien 22:00–23:11Z 2026-09-20: sex dödade byggen,
 * available vid start 4,5–5,7 GB — s8-u3 mätte ett fristående bygg till
 * 6,2 GB; ingen systematisk mätning finns). Observatören RÖR inget:
 * den väntar på att prod-synkens EGEN byggprocess dyker upp, samplar
 * dess RSS via ps och skriver JSON. Lås/bygg/npm berörs EJ.
 *
 * Användning: node verktyg/_s7u2o132-byggminne.mjs
 * Utdata: data/forskning/OPTIMERING/lighthouse/o132-byggminne-<startts>.json
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const UTFIL = join(
  process.cwd(),
  "data/forskning/OPTIMERING/lighthouse",
  `o132-byggminne-${Math.floor(Date.now() / 1000)}.json`
);
const startTs = Date.now();
const prov = { startZ: new Date().toISOString(), samlade: [], byggSedd: false, slutOrsak: "" };

function lasProver() {
  try {
    const ut = execFileSync("ps", ["-eo", "pid,ppid,rss,etime,args", "--no-headers"], {
      encoding: "utf8",
      timeout: 5000,
    });
    return ut
      .split("\n")
      .filter(Boolean)
      .filter((r) => /next build|next-build|npm run build/.test(r))
      .map((r) => {
        const m = r.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(.*)$/);
        return m
          ? { pid: Number(m[1]), rssMB: Math.round(Number(m[3]) / 1024), etid: m[4], args: m[5].slice(0, 90) }
          : null;
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function lasAvailable() {
  try {
    const ut = execFileSync("free", ["-m"], { encoding: "utf8", timeout: 5000 });
    return Number(ut.split("\n")[1].trim().split(/\s+/)[6]);
  } catch {
    return null;
  }
}

// Vänta max 8 min på byggstart (synkens :x7-rop), sampla sedan max 8 min.
let byggstartad = false;
while (Date.now() - startTs < 16 * 60_000) {
  const nu = Date.now();
  const provRad = lasProver();
  if (provRad.length > 0) byggstartad = true;
  if (byggstartad || nu - startTs > 8 * 60_000) {
    prov.samlade.push({
      tZ: new Date(nu).toISOString(),
      availableMB: lasAvailable(),
      processer: provRad,
    });
  }
  if (byggstartad && provRad.length === 0 && prov.samlade.length > 2) {
    prov.slutOrsak = "byggprocesser borta (klart eller dödat)";
    break;
  }
  await new Promise((r) => setTimeout(r, 15_000));
}
if (!prov.slutOrsak) prov.slutOrsak = "observatörens tak (16 min)";

const toppRSS = Math.max(0, ...prov.samlade.flatMap((s) => s.processer.map((p) => p.rssMB)));
prov.sammanfattning = {
  byggSedd: prov.samlade.some((s) => s.processer.length > 0),
  toppByggRSSMB: toppRSS,
  minstAvailableMB: Math.min(...prov.samlade.map((s) => s.availableMB ?? 1e9)),
  buildIDEfter: null,
};
writeFileSync(UTFIL, JSON.stringify(prov, null, 2) + "\n");
console.log("OBSERVATÖR KLAR:", prov.slutOrsak, "— toppRSS", toppRSS, "MB —", UTFIL);
