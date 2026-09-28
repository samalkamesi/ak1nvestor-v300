#!/usr/bin/env node
/**
 * o557 (s7-u2, 2026-09-28): orphan-Chrome-kartläggning/städning på SSD Nodes.
 * o139-precedensen: föräldralösa mät-Chrome (huvudprocessens ägare död) dödas
 * endast efter PPID-bevis; AKTIVA mätningar (levande node/zcode-ägare) rörs
 * aldrig. Anrop: node verktyg/_s7u2o557-orphanstad.mjs [--doda]
 */
import { execSync } from "node:child_process";

const DODA = process.argv[2] === "--doda";

const ps = execSync("ps -eo pid,ppid,args --no-headers", { encoding: "utf8" })
  .toString()
  .split("\n")
  .filter(Boolean)
  .map((r) => {
    const m = r.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/);
    return m ? { pid: +m[1], ppid: +m[2], args: m[3] } : null;
  })
  .filter(Boolean);

const avProc = new Map(ps.map((p) => [p.pid, p]));
const chromeHuvud = ps.filter(
  (p) => p.args.includes("/chrome") && !p.args.includes("--type=")
);
console.log("chrome-huvudprocesser:", chromeHuvud.length);

const orphans = [];
const aktiva = [];
for (const h of chromeHuvud) {
  const foralder = avProc.get(h.ppid);
  if (!foralder) {
    orphans.push(h);
    console.log("ORPHAN huvud", h.pid, "(ppid " + h.ppid + " död)");
  } else if (/zcode|node|npm/.test(foralder.args)) {
    aktiva.push(h);
    console.log("AKTIV huvud", h.pid, "ägare", foralder.pid, foralder.args.slice(0, 70));
  } else {
    orphans.push(h);
    console.log("FRÄMMANDE huvud", h.pid, "ägare:", foralder.args.slice(0, 60));
  }
}
console.log("orphans:", orphans.length, "· aktiva:", aktiva.length);

if (DODA) {
  for (const o of orphans) {
    try {
      process.kill(o.pid, "SIGTERM");
      console.log("SIGTERM", o.pid);
    } catch (e) {
      console.log("misslyckades", o.pid, e.message);
    }
  }
} else {
  console.log("(torrkörning — kör med --doda för städning)");
}
