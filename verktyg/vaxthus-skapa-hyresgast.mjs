#!/usr/bin/env node
// vaxthus-skapa-hyresgast.mjs — Växthuset 2.0 Fas 1 (r284): initierar en
// hyresgästyta från mallar/grund-mall: kopia + git-init + första commit.
// Användning (på servern): node verktyg/vaxthus-skapa-hyresgast.mjs <slug>
// Skapar: $HOME/tenants/<slug>/ (innehall/site.json, TENANT-AGENTS.md,
// verktyg/kolla-site.mjs, README.md) — agenten och plattformen äger resten.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MALL = path.join(ROT, "mallar", "grund-mall");
const slug = process.argv[2];
if (!/^[a-z0-9-]+$/.test(slug ?? "")) {
  console.error("Användning: node verktyg/vaxthus-skapa-hyresgast.mjs <slug> (a-z/0-9/bindestreck)");
  process.exit(1);
}
const mal = path.join(process.env.HOME ?? "/home/ak1a", "tenants", slug);
if (fs.existsSync(mal)) {
  console.error(`Hyresgästen "${slug}" finns redan: ${mal}`);
  process.exit(1);
}
fs.cpSync(MALL, mal, { recursive: true });
const readme = `# ${slug}\n\nHyresgästyta i Växthuset (Fas 1).\n\n- Förhandsvisning: https://lab.ak1nvestor.com/bygg/${slug}\n- Agentens regelverk: TENANT-AGENTS.md\n- Innehållet: innehall/site.json (validera: node verktyg/kolla-site.mjs)\n`;
fs.writeFileSync(path.join(mal, "README.md"), readme);
const git = (args) => execFileSync("git", ["-C", mal, ...args], { stdio: "pipe" });
git(["init", "-q", "-b", "main"]);
git(["config", "user.email", `agent@${slug}.vaxthus`]);
git(["config", "user.name", `Växthus-agent (${slug})`]);
git(["add", "-A"]);
git(["commit", "-q", "-m", `init: hyresgästyta från grundmallen (växthuset Fas 1)`]);
console.log(`SKAPAD: ${mal} (git main, 1 commit) — förhandsvisning: /bygg/${slug}`);
