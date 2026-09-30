// v218: versions- + källodssond — är 3.11.2-24 fortfarande senaste? Vilka kapitel finns?
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const LOGG = "/tmp/v218-versionsond.log";
const skriv = (s) => { fs.appendFileSync(LOGG, s + "\n"); console.log(s); };
fs.writeFileSync(LOGG, `v218 versionsond ${new Date().toISOString()}\n`);

try {
  const v = execFileSync("npm", ["view", "zcode-app-cli", "version"], {
    encoding: "utf8", timeout: 60_000,
  });
  skriv("npm latest: " + v.trim());
} catch (e) {
  skriv("npm view FEL: " + String(e.message).slice(0, 200));
}

try {
  const t = execFileSync("npm", ["view", "zcode-app-cli", "time", "--json"], {
    encoding: "utf8", timeout: 60_000,
  });
  const tider = JSON.parse(t);
  const sorterade = Object.entries(tider)
    .filter(([k]) => k !== "created" && k !== "modified")
    .sort((a, b) => new Date(a[1]) - new Date(b[1]))
    .slice(-12);
  skriv("senaste publiceringar:");
  for (const [v, d] of sorterade) skriv(`  ${v}  ${d}`);
} catch (e) {
  skriv("npm time FEL: " + String(e.message).slice(0, 200));
}

// Kallkodskatalogen — kapitel + eventuella olästa
for (const kat of ["/home/ak1a/agent/ak1/zcode-kallkod", "/home/ak1a/forskning/zcode-cli"]) {
  try {
    const filer = fs.readdirSync(kat).filter((f) => /\.(md|ts|js|json)$/i.test(f)).sort();
    skriv(`\n${kat} (${filer.length} kod/markdown-filer):`);
    for (const f of filer.slice(0, 40)) skriv("  " + f);
  } catch (e) {
    skriv(`\n${kat} OÅTKOMLIG: ${String(e.message).slice(0, 80)}`);
  }
}
skriv("\nKLAR");
