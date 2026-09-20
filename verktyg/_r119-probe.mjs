#!/usr/bin/env node
/** R119-probe: kartlägg zcode/dev-processer — hitta föräldralösa barn från
 *  TUNG-run nr 6 (död aggregator lämnar barn som orphan under pid 1). */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const NU = Date.now();
const rader = execFileSync("ps", ["-eo", "pid,ppid,lstart,rss,args", "--no-headers"], {
  encoding: "utf8", maxBuffer: 8 * 1024 * 1024,
}).split("\n").filter(Boolean);

const intressanta = [];
for (const rad of rader) {
  const m = rad.match(/^\s*(\d+)\s+(\d+)\s+(.{20,24})\s+(\d+)\s+(.*)$/);
  if (!m) continue;
  const [, pid, ppid, lstart, rssKb, args] = m;
  const arZcode = /zcode|tsx .*testa-styrelse|kor-alla-tester|next dev|STUDIO_TRANSPORT|--port 3117|dev-server/.test(args) ||
    (args.includes("node") && /3117/.test(args));
  if (!arZcode) continue;
  // cwd via /proc
  let cwd = "?";
  try { cwd = fs.readlinkSync(`/proc/${pid}/cwd`); } catch {}
  intressanta.push({
    pid: Number(pid), ppid: Number(ppid), rssMB: Math.round(Number(rssKb) / 1024),
    alderMin: Math.round((NU - new Date(lstart.replace(/^\w+ /, "")).getTime()) / 60000),
    cwd, args: args.slice(0, 110),
  });
}
intressanta.sort((a, b) => b.rssMB - a.rssMB);
console.log(`antal: ${intressanta.length}`);
for (const p of intressanta) {
  console.log(`pid=${p.pid} ppid=${p.ppid} rss=${p.rssMB}MB ålder=${p.alderMin}min cwd=${p.cwd}`);
  console.log(`   ${p.args}`);
}
// port 3117?
try {
  const ss = execFileSync("ss", ["-ltnp"], { encoding: "utf8" });
  const rader3117 = ss.split("\n").filter((r) => r.includes(":3117"));
  console.log(`PORT 3117: ${rader3117.length ? rader3117.join(" | ") : "fri"}`);
} catch (e) { console.log(`PORT 3117: kunde inte läsa (${e.message.slice(0, 60)})`); }
