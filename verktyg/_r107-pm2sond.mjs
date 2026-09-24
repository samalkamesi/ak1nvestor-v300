#!/usr/bin/env node
// ROND 107 — sond: pm2 ak1a:s cwd + NODE_ENV (processinfo, inga hemligheter).
import { execFileSync } from "node:child_process";
const j = JSON.parse(execFileSync("pm2", ["jlist"], { encoding: "utf8", timeout: 20_000 }));
const a = j.find((p) => p.name === "ak1a");
if (!a) { console.log("ak1a saknas i pm2"); process.exit(0); }
console.log("cwd:", a.pm2_env.pm_cwd);
console.log("NODE_ENV:", a.pm2_env.env?.NODE_ENV ?? "(ej satt)");
console.log("script:", a.pm2_env.pm_exec_path);
