// Byggläges-sond: pågår prod-synkens ombygg? Nät till Google Fonts? RAM?
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

// 1. Senaste prod-synk-rader (fler än 5 — fånga ombyggsstart)
const rader = readFileSync("/home/ak1a/AK1/data/vakten/prod-synk.log", "utf8").trim().split("\n");
console.log("prod-synk.log sista 8:");
rader.slice(-8).forEach((r) => console.log("  ", r.slice(0, 150)));

// 2. Deploylås (pågående bygg?)
console.log("deploylås:", existsSync("/tmp/ak1a-deploy.lock") ? "UPPTAGET (bygg pågår)" : "ledigt");

// 3. RAM
const meminfo = Object.fromEntries(
  readFileSync("/proc/meminfo", "utf8").split("\n").slice(0, 3).map((l) => {
    const [k, v] = l.split(":");
    return [k.trim(), v.trim()];
  }),
);
console.log("RAM:", JSON.stringify(meminfo));

// 4. Nät till Google Fonts (byggets beroende)
try {
  const r = await fetch("https://fonts.googleapis.com/css2?family=Source+Serif+4", {
    signal: AbortSignal.timeout(8000),
  });
  console.log("fonts.googleapis.com:", r.status);
} catch (e) {
  console.log("fonts.googleapis.com: FEL —", e.message);
}

// 5. pm2-kort
try {
  const p = execFileSync("pm2", ["jlist"], { encoding: "utf8", timeout: 15_000 });
  const lista = JSON.parse(p).map((x) => `${x.name}:${x.pm2_env.status}`);
  console.log("pm2:", lista.join(" · "));
} catch (e) {
  console.log("pm2 jlist fel:", e.message.slice(0, 80));
}
