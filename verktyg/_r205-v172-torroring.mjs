#!/usr/bin/env node
/**
 * _r205-v172-torroring.mjs — rond 205: v172-beredskapens TORRÖRNING inför
 * rappfönstret 10-20→11-04: (a) granskningsmätaren (_r172-granska-utkast.mjs)
 * mot ett GRÖNT väntande utkast — måste fortfarande ge GRÖN (verktygshälsa),
 * (b) ett GUL-upg på verktyget (ett av de fem kända GUL — disney: trimnotis)
 * måste fortfarande ge GUL (inte regressera till RÖD), (c) konstatera att
 * mallstommen + KVD-mönstret är dokumenterade i V172-RAPPORTVAG.
 * Kvitto: /tmp/r205-torroring.txt
 */
import { spawnSync as sp } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const ut = [];
const KAT = "data/blogg-utkast/kvartal/2026-q3";

// (a)+(b) mätaren mot ett GRÖNT (volvo-cars var exemplariskt i r193) och ett GUL (disney)
const test = ["volvo-cars", "disney"];
for (const slug of test) {
  const fil = readdirSync(KAT).find((f) => f.startsWith(`sa-laser-du-${slug}`) && f.endsWith(".json"));
  if (!fil) { ut.push(`${slug}: UTAKST SAKNAS`); continue; }
  const r = sp("node", ["verktyg/_r172-granska-utkast.mjs", `data/blogg-utkast/kvartal/2026-q3/${fil}`, "205-torroring"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, timeout: 120000 });
  const dom = (r.stdout || "").match(/\b(GRÖN|GUL|RÖD)\b/g) ?? [];
  ut.push(`${slug}: exit ${r.status} · dom-förekomster ${[...new Set(dom)].join("/")}`);
}

// (c) mallstomme + statusrop i V172-RAPPORTVAG
const rv = readFileSync("data/forskning/V172-RAPPORTVAG.md", "utf8");
ut.push("mallstomme dokumenterad: " + /mallstomme/i.test(rv));
ut.push("kalenderutbyggnad r204 noterad: " + /Kalenderutbyggnad rond 204/.test(rv));
ut.push("checklista: " + (/checklist/i.test(rv) ? "finns" : "saknas"));

writeFileSync("/tmp/r205-torroring.txt", ut.join("\n"));
console.log(ut.join("\n"));
