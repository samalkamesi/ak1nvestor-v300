// rond 185: driftkontroll — pågående bygge? sajten lever? låset taget?
import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync, statSync } from "node:fs";
const ut = [];
async function status(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000), redirect: "manual" });
    return r.status;
  } catch (e) { return "fel: " + e.message.slice(0, 60); }
}
ut.push("https://lab.ak1nvestor.com/: " + (await status("https://lab.ak1nvestor.com/")));
ut.push("localhost:3000/: " + (await status("http://localhost:3000/")));
try { ut.push("next-processer: " + execFileSync("pgrep", ["-af", "next"], { encoding: "utf8" }).trim().slice(0, 300)); }
catch { ut.push("next-processer: inga (pgrep tom)"); }
try { ut.push("npm/node-build-processer: " + execFileSync("pgrep", ["-af", "npm run build"], { encoding: "utf8" }).trim().slice(0, 200)); }
catch { ut.push("npm run build: ingen"); }
// flock-test: non-blocking — exit 0 = låset ledigt, exit 1 = upptaget
try { execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "true"], { encoding: "utf8" }); ut.push("deploy-lås: LEDIGT (inget bygge kör)"); }
catch { ut.push("deploy-lås: UPTAGET (bygge pågår under flock)"); }
ut.push("BUILD_ID finns: " + existsSync("/home/ak1a/AK1/.next/BUILD_ID"));
try { ut.push("BUILD_ID mtime: " + statSync("/home/ak1a/AK1/.next/BUILD_ID").mtime.toISOString()); } catch {}
writeFileSync("/tmp/v185-drift.txt", ut.join("\n") + "\n");
console.log("MÄTT");
