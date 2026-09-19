#!/usr/bin/env node
// ROND 107 — manuell dev-sond: starta next dev (mock), inspektera svaren, kör rewind, döda.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ARB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BAS = "http://127.0.0.1:3117";
const dev = spawn("npm", ["run", "dev", "--", "-p", "3117"], {
  cwd: ARB,
  detached: true,
  env: { ...process.env, NO_COLOR: "1", STUDIO_TRANSPORT: "mock" },
  stdio: ["ignore", "pipe", "pipe"],
});
let devlogg = "";
dev.stdout?.on("data", (d) => { devlogg += String(d); });
dev.stderr?.on("data", (d) => { devlogg += String(d); });
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const sond = async (vag, init) => {
  try {
    const r = await fetch(`${BAS}${vag}`, { signal: AbortSignal.timeout(30_000), ...init });
    const t = await r.text();
    return `HTTP ${r.status} · ${t.slice(0, 300)}`;
  } catch (e) {
    return `FEL ${String(e).slice(0, 120)}`;
  }
};
let uppe = false;
for (let i = 0; i < 90 && !uppe; i++) {
  await sov(2_000);
  try { uppe = (await fetch(`${BAS}/api/studio/halsa`, { signal: AbortSignal.timeout(3_000) })).ok; } catch { /* vänta */ }
}
console.log("uppe:", uppe);
if (uppe) {
  console.log("── GET stream (dev-fallback) ──");
  console.log(await sond("/api/studio/stream", { headers: { "x-admin-password": "AK1A-2026" } }));
  console.log("── GET stream (FEL lösenord) ──");
  console.log(await sond("/api/studio/stream", { headers: { "x-admin-password": "xyz" } }));
}
// döda dev-trädet
try { process.kill(-dev.pid, "SIGTERM"); } catch { /* borta */ }
setTimeout(() => { try { process.kill(-dev.pid, "SIGKILL"); } catch { /* borta */ } process.exit(0); }, 3_000);
fs.writeFileSync("data/vakten/r107-devsond.log", devlogg.slice(-4_000));
