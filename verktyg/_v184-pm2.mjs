// rond 184: pm2-driftsbevis + omstart av pumpor-daemon (node-kanalen — skalet hänger)
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const ut = [];
try {
  ut.push("RESTART: " + execFileSync("pm2", ["restart", "ak1a-pumpor"], { encoding: "utf8", timeout: 25000 }).trim());
} catch (e) {
  ut.push("RESTART-FEL: " + e.message);
}
const j = JSON.parse(execFileSync("pm2", ["jlist"], { encoding: "utf8" }));
for (const p of j) {
  ut.push(`${p.name} | ${p.pm2_env.status} | startad ${new Date(p.pm2_env.pm_uptime).toISOString()} | restarts ${p.pm2_env.restart_time}`);
}
writeFileSync("/tmp/v184-pm2.txt", ut.join("\n") + "\n");
console.log("KLAR");
