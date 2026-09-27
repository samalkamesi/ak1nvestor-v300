#!/usr/bin/env node
/**
 * _r197-v173u3-sond.mjs — v173 U3 (rond 197): Kirin AVVISAD (engångspostanalys);
 * sondera nästa kandidat: celltäthet per (land,bransch) + dokumenterade "avsända"-
 * kandidater i tidigare protokoll (FALLER/avsända/lediga-noteringar).
 * Kvitto: /tmp/r197-sond.txt
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const ut = [];

// 1) celltäthet land×bransch (Japan + total per bransch)
const landBransch = {};
for (const b of u) {
  const k = `${b.land ?? "?"}/${b.bransch ?? "?"}`;
  landBransch[k] = (landBransch[k] ?? 0) + 1;
}
ut.push("=== land/bransch-celler med NOG med bolag men tunnland, + Japans celler ===");
for (const [k, n] of Object.entries(landBransch).sort((a, b) => a[1] - b[1])) {
  if (n <= 3 || k.startsWith("Japan")) ut.push(`  ${k}: ${n}`);
}
const branschRakn = {};
for (const b of u) branschRakn[b.bransch] = (branschRakn[b.bransch] ?? 0) + 1;
ut.push("=== bransch-totaler ===");
ut.push("  " + Object.entries(branschRakn).sort((a, b) => a[1] - b[1]).map(([k, n]) => `${k}:${n}`).join(" · "));

// 2) dokumenterade avsända/faller-kandidater i protokollen
ut.push("=== Faller/avsänd-lediga-noteringar i data/forskning (senaste vågordning) ===");
const traff = [];
for (const f of readdirSync("data/forskning")) {
  if (!/UTOKNING|KOMPLEMENT/.test(f)) continue;
  const t = readFileSync(`data/forskning/${f}`, "utf8");
  for (const m of t.matchAll(/\*\*([^*]{3,40})\s*([A-Z0-9.]{2,12}(?:\.[A-Z]{1,3})?)\*\*[^—]*—[^]*?(FALLER|avs[äe]nd|ledig| Ledig)/g)) {
    traff.push(`${f}: ${m[1].trim()} ${m[2]} → ${m[3]}`);
  }
}
ut.push(...traff.slice(-40));

// 3) finns avvisade kandidater redan i universumet? (dubbelkontroll)
const tickers = traff.map((t) => (t.match(/([A-Z0-9]{2,6}(?:\.[A-Z]{1,3})?T?)/) || [])[1]).filter(Boolean);
const iUni = tickers.filter((t) => u.some((b) => b.ticker === t));
ut.push("=== av dessa finns redan i universumet: " + (iUni.join(", ") || "INGA"));

writeFileSync("/tmp/r197-sond.txt", ut.join("\n"));
console.log(ut.join("\n"));
