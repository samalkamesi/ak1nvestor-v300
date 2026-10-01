// v219-processond: hitta app-server-processerna (zcode-app-cli) och deras körbara fils väg
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const LOGG = "/tmp/v219-processond.log";
fs.writeFileSync(LOGG, `processond ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + "\n"); console.log(s); };

const ps = execFileSync("ps", ["-eo", "pid,ppid,etime,args"], { encoding: "utf8", timeout: 30_000 });
const rader = ps.split("\n").filter((r) => /zcode|app-server/i.test(r) && !/processond/i.test(r));
logga(`träffar: ${rader.length}`);
for (const r of rader.slice(0, 20)) logga("  " + r.trim().slice(0, 220));

// Ur träffarna: plocka körbara fils vägar och kolla package.json-versioner
const vagar = new Set();
for (const r of rader) {
  for (const m of r.matchAll(/(\/[^\s]+\/(?:zcode-app-cli|zcode)[^\s]*)/g)) vagar.add(m[1]);
}
logga("\nkörbara vägar: " + [...vagar].join(" ; ").slice(0, 600));

for (const v of vagar) {
  // gå upp till paketrot och läs version
  let dir = v;
  for (let i = 0; i < 6; i++) {
    const pj = dir + "/package.json";
    if (fs.existsSync(pj)) {
      try {
        const j = JSON.parse(fs.readFileSync(pj, "utf8"));
        if (j.name === "zcode-app-cli") { logga(`  ${pj}: ${j.name}@${j.version}`); break; }
      } catch { /* nästa */ }
    }
    const nxt = dir.slice(0, dir.lastIndexOf("/"));
    if (nxt === dir) break;
    dir = nxt;
  }
}
logga("KLAR");
