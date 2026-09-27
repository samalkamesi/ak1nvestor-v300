// rond 185: bevakare — väntar ut pågående deploy (flock + BUILD_ID) och verifierar slutläget
import { execFileSync } from "node:child_process";
import { appendFileSync, writeFileSync, existsSync, statSync } from "node:fs";
const FIL = "/tmp/v185-poll.txt";
writeFileSync(FIL, "bevakning startar " + new Date().toISOString() + "\n");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function lasLedig() {
  try { execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "true"], { encoding: "utf8" }); return true; } catch { return false; }
}
function ak1aStart() {
  try {
    const j = JSON.parse(execFileSync("pm2", ["jlist"], { encoding: "utf8" }));
    return j.find((p) => p.name === "ak1a")?.pm2_env?.pm_uptime;
  } catch { return null; }
}
let slutläge = "MAXVÄNT";
for (let i = 0; i < 16; i++) {
  const ledigt = lasLedig();
  const buildId = existsSync("/home/ak1a/AK1/.next/BUILD_ID");
  appendFileSync(FIL, `poll ${i + 1}: lås ${ledigt ? "ledigt" : "upptaget"} · BUILD_ID ${buildId ? "finns" : "saknas"}\n`);
  if (ledigt && buildId) { slutläge = "BYGG KLART"; break; }
  if (ledigt && !buildId && i > 2) { slutläge = "AVVIKELSE: lås ledigt men BUILD_ID saknas (kraschat bygge?)"; break; }
  await sleep(30000);
}
appendFileSync(FIL, slutläge + "\n");
if (slutläge === "BYGG KLART") {
  appendFileSync(FIL, "BUILD_ID mtime: " + statSync("/home/ak1a/AK1/.next/BUILD_ID").mtime.toISOString() + "\n");
  const start = ak1aStart();
  appendFileSync(FIL, "pm2 ak1a startad: " + (start ? new Date(start).toISOString() : "oläst") + "\n");
  for (const u of ["https://lab.ak1nvestor.com/", "http://localhost:3000/", "https://lab.ak1nvestor.com/rapportakademin"]) {
    try { const r = await fetch(u, { signal: AbortSignal.timeout(10000) }); appendFileSync(FIL, u + " → " + r.status + "\n"); }
    catch (e) { appendFileSync(FIL, u + " → fel " + e.message.slice(0, 50) + "\n"); }
  }
}
console.log("SLUTLÄGE: " + slutläge);
