// rond 186: driftverifiering av merge-bygget (fas-sync-fix 9726a9bd + v170 4e789032) + git-läge
import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
const UT = "/tmp/v186-verifiera.txt";
const rader = [];
function rad(s) { rader.push(s); }
try {
  execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "true"], { encoding: "utf8" });
  rad("flock-lås: LEDIGT");
} catch { rad("flock-lås: UPTAGET"); }
try {
  const j = JSON.parse(execFileSync("pm2", ["jlist"], { encoding: "utf8" }));
  for (const namn of ["ak1a", "ak1a-pumpor"]) {
    const p = j.find((x) => x.name === namn);
    if (p) rad(`pm2 ${namn}: ${p.pm2_env.status} · startad ${new Date(p.pm2_env.pm_uptime).toISOString()} · restarts ${p.pm2_env.restart_time}`);
    else rad(`pm2 ${namn}: SAKNAS`);
  }
} catch (e) { rad("pm2 jlist fel: " + e.message.slice(0, 80)); }
try {
  const head = execFileSync("git", ["-C", "/home/ak1a/AK1", "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
  rad("prod-träd HEAD: " + head);
} catch (e) { rad("prod git fel: " + e.message.slice(0, 80)); }
// fas-sync-fixens kod lever i prod-trädet (medlem-inloggning.tsx bär member_type-synken)
try {
  const k = readFileSync("/home/ak1a/AK1/src/lib/medlem-inloggning.tsx", "encoding" in {} ? "utf8" : "utf8");
  rad("medlem-inloggning.tsx: member_type förekomster = " + (k.match(/member_type/g) || []).length);
} catch (e) { rad("medlem-inloggning.tsx läsfel: " + e.message.slice(0, 80)); }
for (const u of ["https://lab.ak1nvestor.com/", "http://localhost:3000/", "https://lab.ak1nvestor.com/kurser"]) {
  try { const r = await fetch(u, { signal: AbortSignal.timeout(10000), redirect: "manual" }); rad(u + " → " + r.status); }
  catch (e) { rad(u + " → fel " + e.message.slice(0, 60)); }
}
// arbetsytans git-läge (smutsiga filer som ska städas)
try {
  const st = execFileSync("git", ["status", "--porcelain"], { encoding: "utf8", cwd: "/home/ak1a/agent/ak1" }).trim();
  rad("arbetsyta status:\n" + (st || "(ren)"));
  const head = execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8", cwd: "/home/ak1a/agent/ak1" }).trim();
  rad("arbetsyta HEAD: " + head);
} catch (e) { rad("arbetsyta git fel: " + e.message.slice(0, 80)); }
writeFileSync(UT, rader.join("\n") + "\n");
console.log("KLAR " + rader.length + " rader → " + UT);
