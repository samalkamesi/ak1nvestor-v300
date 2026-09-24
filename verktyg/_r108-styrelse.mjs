#!/usr/bin/env node
// ROND 108 — fristående verifiering av styrelsesviten med K4/K5-konsistenkursen.
// Replikerar aggregatorns dev-fönster exakt (R107): port 3117, mock-transport,
// explicit dev-lösenord, loopback-bindning. Städar fönstret idempotent efteråt.
import { spawn, spawnSync } from "node:child_process";

const ROT = "/home/ak1a/agent/ak1";
const PORT = "3117";
const BAS = `http://127.0.0.1:${PORT}`;

const syn = spawnSync("node", ["--check", "verktyg/testa-styrelse.mjs"], { cwd: ROT });
if (syn.status !== 0) {
  console.log("SYNTAXFEL i testa-styrelse.mjs:");
  console.log(String(syn.stderr));
  process.exit(1);
}
console.log("SYNTAX-OK testa-styrelse.mjs");

const svarar = async () => {
  try {
    const r = await fetch(`${BAS}/api/studio/halsa`, { signal: AbortSignal.timeout(3_000) });
    return r.ok;
  } catch {
    return false;
  }
};

let dev = null;
if (!(await svarar())) {
  dev = spawn("npm", ["run", "dev", "--", "-p", PORT, "-H", "127.0.0.1"], {
    cwd: ROT,
    env: { ...process.env, NO_COLOR: "1", STUDIO_TRANSPORT: "mock", ADMIN_PASSWORD: "AK1A-2026" },
    stdio: ["ignore", "ignore", "inherit"],
  });
}

let uppe = false;
for (let i = 0; i < 90 && !uppe; i++) {
  await new Promise((r) => setTimeout(r, 2_000));
  uppe = await svarar();
}
if (!uppe) {
  console.log("FAIL dev-servern kom ej upp inom 180 s");
  dev?.kill("SIGTERM");
  process.exit(1);
}
console.log("dev-server uppe — kör styrelsesviten");

const testet = spawn("node", ["verktyg/testa-styrelse.mjs", PORT], {
  cwd: ROT,
  env: { ...process.env, ADMIN_PASSWORD: "AK1A-2026" },
  stdio: "inherit",
});
testet.on("exit", (kod) => {
  console.log(`TEST-EXIT ${String(kod)}`);
  if (dev) {
    dev.kill("SIGTERM");
    setTimeout(() => process.exit(kod ?? 1), 1_500);
  } else {
    process.exit(kod ?? 1);
  }
});
