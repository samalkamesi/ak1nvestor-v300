#!/usr/bin/env node
/** _r226-kvalitetsomkör.mjs — omkör kvalitetsvakten (node-kanalen) efter rättelserna. Kvitto: /tmp/r226-kv-omkör.txt */
import { spawnSync as sp } from "node:child_process";
import { writeFileSync } from "node:fs";
const r = sp("node", ["verktyg/kvalitetsvakt.mjs"], { cwd: "/home/ak1a/agent/ak1", encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 300000 });
const ut = `exit ${r.status}\n${(r.stdout || "") + (r.stderr || "")}`;
writeFileSync("/tmp/r226-kv-omkör.txt", ut);
const status = ut.match(/STATUS: (\w+)/)?.[1] ?? "?";
const fel = ut.match(/ANTAL FEL: (\d+)/)?.[1] ?? "?";
console.log(`kvalitetsvakt: exit ${r.status} · ANTAL FEL ${fel} · STATUS ${status}`);
if (status !== "GRÖN") {
  const sektioner = ut.split("\n").filter((x) => /FAIL/.test(x)).slice(0, 8);
  console.log("FAIL-sektioner: " + (sektioner.join("\n") || "inga explicita"));
}
