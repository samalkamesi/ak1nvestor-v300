// v215-sond: var skriver pumporna sina vitala loggar? (agent- vs prod-träd)
import fs from "node:fs";

const filer = [
  "hjartslag.log",
  "styrelse-rond.log",
  "senaste-korning.txt",
  "organ-registret.json",
  "kostnad-log.json",
  "beslutsminne.jsonl",
  "mal-state.json",
  "prod-synk.log",
  "organism-halsa.log",
];

const tStamp = (p) => {
  try {
    const s = fs.statSync(p);
    return `${s.mtime.toISOString().slice(0, 16)} (${Math.round((Date.now() - s.mtimeMs) / 60000)} min sedan)`;
  } catch {
    return "SAKNAS";
  }
};

for (const f of filer) {
  console.log(
    f.padEnd(24),
    "agent:",
    tStamp(`/home/ak1a/agent/ak1/data/vakten/${f}`).padEnd(30),
    "prod:",
    tStamp(`/home/ak1a/AK1/data/vakten/${f}`),
  );
}

// Crontab — vilka jobb kör och var skriver de?
import { execFileSync } from "node:child_process";
console.log("\n── crontab (ak1a) ──");
try {
  console.log(execFileSync("crontab", ["-l"], { encoding: "utf8" }));
} catch (e) {
  console.log("crontab-läsning fel:", String(e).slice(0, 80));
}

// pm2-lista — vilka pumpor lever?
console.log("── pm2 ──");
try {
  const pm2 = execFileSync("pm2", ["ls"], { encoding: "utf8", timeout: 15_000 });
  for (const rad of pm2.split("\n").filter((r) => /ak1a|pumpor|online|stopped|errored/i.test(r))) {
    console.log(rad.trim().replace(/\s+/g, " ").slice(0, 110));
  }
} catch (e) {
  console.log("pm2-fel:", String(e).slice(0, 80));
}
