#!/usr/bin/env node
/**
 * _r205-v172-torroring2.mjs — skärd torrörning: slutdom-rader ur mätarens utdata
 * för hm-b (väntande GRÖN sedan r194) och disney (känd GUL trimnotis).
 * Kvitto: /tmp/r205-torroring2.txt
 */
import { spawnSync as sp } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";

const ut = [];
const KAT = "data/blogg-utkast/kvartal/2026-q3";
for (const slug of ["hm-b", "disney"]) {
  const fil = readdirSync(KAT).find((f) => f.includes(slug) && f.startsWith("sa-laser-du") && f.endsWith(".json"));
  if (!fil) { ut.push(`${slug}: UTAKST SAKNAS bland väntande`); continue; }
  const r = sp("node", ["verktyg/_r172-granska-utkast.mjs", `data/blogg-utkast/kvartal/2026-q3/${fil}`, "205"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, timeout: 120000 });
  const rader = (r.stdout || "").trim().split("\n");
  ut.push(`${slug} (${fil}): exit ${r.status}`);
  ut.push("  sista rader: " + rader.slice(-4).join(" ⏎ ").slice(0, 400));
}
writeFileSync("/tmp/r205-torroring2.txt", ut.join("\n"));
console.log(ut.join("\n"));
