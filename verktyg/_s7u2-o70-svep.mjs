#!/usr/bin/env node
/**
 * s7-u2 o70 — cache-header-sweep (FÖRE/EFTER) mot prod-HTTPS.
 * Rå Cache-Control-RADER via curl -sI (radantal är mätvärdet — Nodes Headers
 * kan slå ihop multipla rader). Skriver/utökar
 * data/forskning/OPTIMERING/o70-cache-headers-fore-efter-2026-09-18.json
 * Användning: node verktyg/_s7u2-o70-svep.mjs fore|efter [extraUrl]
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const BAS = "https://lab.ak1nvestor.com";
const UT =
  "data/forskning/OPTIMERING/o70-cache-headers-fore-efter-2026-09-18.json";
const lag = process.argv[2];
if (lag !== "fore" && lag !== "efter") {
  console.error("argument: fore|efter [extraUrl]");
  process.exit(2);
}
const extra = process.argv[3] || "";

const SOKVAGAR = [
  "/ak1a/favicon.svg",
  "/ak1a/logo/ikon-192.png",
  "/ak1a/logo/skulptur-mark.jpg",
  "/og/blogg/vad-ar-roe.png",
  "/manifest.json",
  "/llms-full.txt",
  "/llms.txt",
  "/sok-index.json",
  "/speglar-slugar.json",
  "/_next/static/ (chunk via extra om anges)",
];
if (extra) SOKVAGAR[SOKVAGAR.length - 1] = extra;

function sondera(url) {
  const ut = execFileSync("curl", ["-sI", "--max-time", "15", url], {
    encoding: "utf8",
  });
  const rader = [];
  let status = 0;
  for (const rad of ut.split(/\r?\n/)) {
    if (/^HTTP\//.test(rad)) status = parseInt(rad.split(" ")[1], 10) || status;
    const m = rad.match(/^cache-control:\s*(.*)$/i);
    if (m) rader.push(m[1].trim());
  }
  return { status, cacheControlRader: rader };
}

const resurser = {};
for (const sv of SOKVAGAR) {
  const url = sv.startsWith("http") ? sv : BAS + sv;
  try {
    resurser[sv] = sondera(url);
  } catch (e) {
    resurser[sv] = { fel: String(e && e.message ? e.message : e) };
  }
}

let doc = {};
try {
  doc = JSON.parse(fs.readFileSync(UT, "utf8"));
} catch {
  doc = {};
}
if (!doc.objekt) {
  doc.objekt = "o70 cache rond 4 — nginx-lagerstädning (spår 7)";
  doc.spur = "7 prestanda";
  doc.manifest = "auto-s7-1789729524 s7-u2";
  doc.beskrivning =
    "FÖRE = prod med nginx våg-96-D1-lager aktivt (undertrycker Next). EFTER = D1-fyra-radersblock renodlat, Next äger /ak1a/+/og//llms-full, nginx behålls endast för ytor utan Next-regel.";
}
doc[lag] = { ts: new Date().toISOString(), kalla: BAS, resurser };
fs.writeFileSync(UT, JSON.stringify(doc, null, 2) + "\n");
console.log(`OK ${lag} ${doc[lag].ts}`);
for (const [sv, r] of Object.entries(resurser)) {
  console.log(
    `  ${r.status ?? "FEL"} ${sv} :: ${(r.cacheControlRader || []).join(" | ") || r.fel || "(ingen CC-rad)"}`
  );
}
