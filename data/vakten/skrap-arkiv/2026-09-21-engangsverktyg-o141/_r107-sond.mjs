#!/usr/bin/env node
// ROND 107-sond: gitignore-status för kvalitetsrapporten + rapportålder i båda träden.
// Skriver resultat till /tmp/r107-sond.txt (studio-skalet kan tappa svaret under minnespress).
import { execSync } from "node:child_process";
import fs from "node:fs";

const ut = [];
try {
  ut.push("ignore: " + execSync("git check-ignore -v data/rapporter/kvalitetsrapport-SENASTE.md", { encoding: "utf8" }).trim());
} catch {
  ut.push("ignore: EJ ignorerad (tracked/läses av deploy-trädet)");
}
for (const p of [
  "data/rapporter/kvalitetsrapport-SENASTE.md",
  "/home/ak1a/AK1/data/rapporter/kvalitetsrapport-SENASTE.md",
]) {
  try {
    const s = fs.statSync(p);
    ut.push(`${p} — ${s.size} B, mtime ${s.mtime.toISOString()}`);
  } catch {
    ut.push(`${p} — SAKNAS`);
  }
}
try {
  const md = fs.readFileSync("/home/ak1a/AK1/data/rapporter/kvalitetsrapport-SENASTE.md", "utf8");
  const rader = md.split("\n").filter((r) => r.includes("ANTAL FEL"));
  ut.push("prod-statusrad: " + (rader[rader.length - 1] ?? "(ingen)"));
} catch (e) {
  ut.push("prod-statusrad: oläsbar " + String(e).slice(0, 60));
}
fs.writeFileSync("/tmp/r107-sond.txt", ut.join("\n") + "\n");
console.log(ut.join("\n"));
