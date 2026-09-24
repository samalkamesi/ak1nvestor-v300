/** V227: minnesanatomi — RSS per kommandoklass + swap + stora processer. */
import { execFileSync } from "node:child_process";

const ps = execFileSync("ps", ["aux", "--sort=-rss"], { encoding: "utf8", timeout: 15_000 });
const rader = ps.split("\n").slice(1).filter(Boolean);
const klassSumma = {};
const stora = [];
for (const rad of rader) {
  const f = rad.split(/\s+/);
  const rss = parseInt(f[5], 10) || 0;
  const cmd = f.slice(10).join(" ");
  let klass = "övrigt";
  if (/zcode-node-repl/.test(cmd)) klass = "zcode-node-repl";
  else if (/zcode-cli|bin\/zcode /.test(cmd) && /fabriksagent/.test(cmd)) klass = "zcode-fabriksbarn";
  else if (/zcode-cli/.test(cmd)) klass = "zcode-sessioner";
  else if (/next-server/.test(cmd)) klass = "next-server";
  else if (/chrome/.test(cmd)) klass = "chrome";
  else if (/node/.test(cmd)) klass = "node-övrigt";
  else if (/pm2/.test(cmd)) klass = "pm2";
  klassSumma[klass] = (klassSumma[klass] ?? 0) + rss;
  if (rss > 250_000) stora.push(`${Math.round(rss / 1024)} MB  ${cmd.slice(0, 90)}`);
}
console.log("--- RSS per klass (MB) ---");
for (const [k, v] of Object.entries(klassSumma).sort((a, b) => b[1] - a[1])) {
  console.log(`${k}: ${Math.round(v / 1024)} MB`);
}
console.log("--- processer > 250 MB ---");
for (const s of stora.slice(0, 14)) console.log(s);
const free = execFileSync("free", ["-m"], { encoding: "utf8", timeout: 10_000 });
console.log("--- free ---\n" + free.split("\n").slice(0, 3).join("\n"));
