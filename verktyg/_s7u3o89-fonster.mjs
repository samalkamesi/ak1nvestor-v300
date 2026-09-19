#!/usr/bin/env node
/**
 * s7-u3 o89 — vilofönsterpollare (internt, otrackat).
 * Avslutar 0 när mätfönstret är rent: 0 chrome-processer + inget
 * prod-synkbygge + BUILD_ID oförändrad sedan start. Avslutar 1 annars
 * (eller 2 vid timeout). F2-läxan: zcode-barns argv innehåller
 * "npm run build"-text och FÅR EJ matcha som byggprocess.
 */
import { readdirSync, readFileSync } from "node:fs";

const BYGG_ID_FIL = "/home/ak1a/AK1/.next/BUILD_ID";
const MAX_SEK = Number(process.argv[2] || 240);
const start = Date.now();
const byggIdStart = readFileSync(BYGG_ID_FIL, "utf8").trim();

function lasProcs() {
  return readdirSync("/proc").filter((d) => /^\d+$/.test(d));
}

function kolla() {
  let chrome = 0;
  let bygger = false;
  for (const pid of lasProcs()) {
    let argv;
    try {
      argv = readFileSync(`/proc/${pid}/cmdline`, "utf8");
    } catch {
      continue;
    }
    if (!argv) continue;
    const delar = argv.split("\0").filter(Boolean);
    if (!delar.length) continue;
    const joined = delar.join(" ");
    if (delar[0].includes("chrome") || joined.includes("/chrome")) chrome++;
    // Äkta synkbygge: next-build i argv UTAN zcode-barnets prompttext
    if (joined.includes("next") && joined.includes("build") &&
        !joined.includes("zcode") && !joined.includes("-p ")) {
      bygger = true;
    }
  }
  return { chrome, bygger };
}

while (true) {
  const { chrome, bygger } = kolla();
  const byggIdNu = (() => {
    try {
      return readFileSync(BYGG_ID_FIL, "utf8").trim();
    } catch {
      return "(saknas)";
    }
  })();
  const ren = chrome === 0 && !bygger && byggIdNu === byggIdStart;
  console.log(new Date().toISOString(),
    `chrome=${chrome} bygger=${bygger} buildId=${byggIdNu === byggIdStart ? "oförändrad" : "ÄNDRAD!"} ren=${ren}`);
  if (ren) {
    console.log("FÖNSTER RENT");
    process.exit(0);
  }
  if ((Date.now() - start) / 1000 > MAX_SEK) {
    console.log("TIMEOUT");
    process.exit(2);
  }
  await new Promise((r) => setTimeout(r, 15000));
}
