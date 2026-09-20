#!/usr/bin/env node
// F2-STATUSPROB (Lag 1): färsk verifiering efter kur — pm2, portägare,
// rogue next-processer, prod-sond. → verktyg/_f2-status-resultat.txt
import { execSync } from "node:child_process";
import fs from "node:fs";

const R = "/home/ak1a/agent/ak1/verktyg/_f2-status-resultat.txt";
const log = (s) => fs.appendFileSync(R, `${new Date().toISOString()} ${s}\n`);
fs.writeFileSync(R, "STATUSPROB START\n");

try {
  const ls = execSync("pm2 jlist", { encoding: "utf8", timeout: 20000 });
  const ak1a = JSON.parse(ls).find((p) => p.name === "ak1a");
  log(`pm2 ak1a: status=${ak1a?.pm2_env?.status} pid=${ak1a?.pid} omstarter=${ak1a?.pm2_env?.restart_time ?? ak1a?.restart_time}`);
  log(`pm2 ak1a uptime-sedan: ${ak1a?.pm2_env?.pm_uptime ? new Date(ak1a.pm2_env.pm_uptime).toISOString() : "okänd"}`);
} catch (e) {
  log(`pm2-jlist-fel: ${String(e.message).slice(0, 150)}`);
}
try {
  const ss = execSync("ss -ltnp", { encoding: "utf8", timeout: 10000 });
  log("portar 3000/3117:\n" + ss.split("\n").filter((r) => /:3000|:3117/.test(r)).join("\n"));
} catch (e) {
  log(`ss-fel: ${String(e.message).slice(0, 120)}`);
}
try {
  const ps = execSync("ps -eo pid,ppid,etime,args=", { encoding: "utf8", timeout: 10000 });
  const nextrad = ps.split("\n").filter((r) => /next (dev|start)|next-server/.test(r) && !/grep/.test(r));
  log(`next-processer (${nextrad.length} st):\n` + nextrad.join("\n"));
} catch (e) {
  log(`ps-fel: ${String(e.message).slice(0, 120)}`);
}
try {
  const kod = execSync('curl -s -o /dev/null -w "%{http_code}" --max-time 20 "https://lab.ak1nvestor.com/"', { encoding: "utf8", timeout: 30000 });
  log(`PROD=${kod.trim()}`);
} catch (e) {
  log(`PROD-sond-fel: ${String(e.message).slice(0, 120)}`);
}
log("STATUSPROB SLUT");
