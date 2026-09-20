#!/usr/bin/env node
/** Statussond: pm2 ak1a uptime + stream-häng + barnens RAM. */
import { execFileSync } from "node:child_process";
const j = JSON.parse(execFileSync("pm2", ["jlist"], { encoding: "utf8", timeout: 30_000 }));
for (const p of j) {
  if (p.name === "ak1a") {
    const upMin = Math.round((Date.now() / 1000 - p.pm2_env.pm_uptime / 1000) / 60);
    console.log(`ak1a: ${p.pm2_env.status}, uptime ${upMin} min, pid ${p.pid}, omstarter ${p.pm2_env.restart_time}`);
  }
}
try {
  const h = await fetch("http://localhost:3000/api/studio/halsa", { signal: AbortSignal.timeout(10_000) });
  const hj = await h.json();
  console.log("barn:", JSON.stringify((hj.barn || []).map((b) => ({ lever: b.lever, ramMB: b.ramMB }))));
} catch (e) {
  console.log("halsa fel:", String(e).slice(0, 80));
}
try {
  const t0 = Date.now();
  const r = await fetch("http://localhost:3000/api/studio/mal/status", { signal: AbortSignal.timeout(20_000), headers: {} });
  console.log("mal/status:", r.status, `${Date.now() - t0} ms`);
} catch (e) {
  console.log("mal/status fel:", String(e).slice(0, 80));
}
