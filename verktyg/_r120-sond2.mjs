#!/usr/bin/env node
/** Sond: lever harmoniseringsbarnet? Fabriksstatus + ps i ett anrop. */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

// 1) fabriksstatus (prod-trädet)
const STATUS = "/home/ak1a/AK1/data/vakten/agentfabrik/status";
try {
  const filer = fs.readdirSync(STATUS).filter((f) => f.endsWith(".json")).map((f) => ({ f, m: fs.statSync(`${STATUS}/${f}`).mtimeMs })).sort((a, b) => b.m - a.m);
  for (const { f, m } of filer.slice(0, 3)) {
    const j = JSON.parse(fs.readFileSync(`${STATUS}/${f}`, "utf8"));
    console.log(`STATUS ${f} (${new Date(m).toISOString()}): status=${j.status} klara=${(j.uppgifter || []).filter((u) => u.status === "klar").length}/${(j.uppgifter || []).length}`);
    for (const u of (j.uppgifter || []).slice(0, 4)) console.log(`  ${u.id}: ${u.status} ${u.exitKod ?? ""} ${(u.leverans || "").slice(0, 80)}`);
  }
} catch (e) { console.log("status-fel: " + e.message); }

// 2) lever några fabriksagenter?
try {
  const ps = execFileSync("ps", ["-eo", "pid,etimes,args", "--no-headers"], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024, timeout: 15_000 });
  const agenter = ps.split("\n").filter((r) => r.includes("fabriksagent")).map((r) => r.trim().split(/\s+/).slice(0, 2).join(" ålder=").split(" ")[0] + " ålder " + r.trim().split(/\s+/)[1] + " s");
  console.log(`FABRIKSAGENTER: ${agenter.length ? agenter.join(" | ") : "INGA lever"}`);
  const zcode = ps.split("\n").filter((r) => /zcode/.test(r) && !/grep/.test(r)).length;
  console.log(`zcode-processer: ${zcode}`);
} catch (e) { console.log("ps-fel: " + e.message); }
