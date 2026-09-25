#!/usr/bin/env node
/** _r226-u30-tsc.mjs — tsc-kontroll via node-kanalen (src orörd ⇒ väntas 0). Kvitto: /tmp/r226-tsc.txt */
import { spawnSync as sp } from "node:child_process";
import { writeFileSync } from "node:fs";
const r = sp("npx", ["tsc", "--noEmit"], { cwd: "/home/ak1a/agent/ak1", encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
const rader = (r.stdout || r.stderr || "").split("\n").filter(Boolean);
const antal = rader.filter((x) => /error TS\d+/.test(x)).length;
writeFileSync("/tmp/r226-tsc.txt", `exit ${r.status} · felrader ${antal}\n` + rader.slice(0, 10).join("\n"));
console.log(`tsc exit ${r.status} · fel ${antal}`);
if (rader.length) console.log(rader.slice(0, 5).join("\n"));
