#!/usr/bin/env node
/** Prod-återställning: ombygge under deploy-låset + pm2-restart + verifiering.
 *  Drift-akut (o53-bokföring): 17:37-bygget avbröts efter BUILD_ID men före
 *  prerender-manifest.json ⇒ next start kraschloopar (ENOENT) ⇒ prod 502. */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

console.log(new Date().toISOString(), "ak1a: pm2 stop (tystar kraschloopen)");
try { execFileSync("pm2", ["stop", "ak1a"], { stdio: "inherit" }); } catch (e) { console.log("stop-fel (ok om redan stoppad):", e.message); }

console.log(new Date().toISOString(), "bygger under /tmp/ak1a-deploy.lock …");
execFileSync(
  "flock", ["-n", "/tmp/ak1a-deploy.lock", "bash", "-c",
    "cd /home/ak1a/AK1 && npm run build 2>&1 | tail -20 && pm2 restart ak1a"],
  { stdio: "inherit", timeout: 540_000 },
);

await new Promise((r) => setTimeout(r, 8000));
for (const u of ["https://lab.ak1nvestor.com/", "https://lab.ak1nvestor.com/kurser", "https://lab.ak1nvestor.com/blogg"]) {
  let kod = "n/a";
  try {
    kod = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", u], { encoding: "utf8", timeout: 30_000 }).trim();
  } catch (e) { kod = "fel: " + e.message.slice(0, 60); }
  console.log(new Date().toISOString(), u, "→", kod);
}
console.log(new Date().toISOString(), "BUILD_ID:", readFileSync("/home/ak1a/AK1/.next/BUILD_ID", "utf8").trim(),
  "· prerender-manifest:", existsSync("/home/ak1a/AK1/.next/prerender-manifest.json") ? "FINNS" : "SAKNAS");
