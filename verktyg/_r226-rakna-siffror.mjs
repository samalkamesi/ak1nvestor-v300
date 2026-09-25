#!/usr/bin/env node
/** _r226-rakna-siffror.mjs — kör guldkälle-färskningen (node-kanalen). Kvitto: /tmp/r226-siffror.txt */
import { spawnSync as sp } from "node:child_process";
import { writeFileSync } from "node:fs";
const r = sp("node", ["verktyg/rakna-siffror.mjs"], { cwd: "/home/ak1a/agent/ak1", encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
const ut = `exit ${r.status}\n${r.stdout || r.stderr}`;
writeFileSync("/tmp/r226-siffror.txt", ut);
console.log(ut.slice(0, 2000));
