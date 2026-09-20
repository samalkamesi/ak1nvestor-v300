#!/usr/bin/env node
/** Mikro 2: det RIKA eldprovsbarnet (jagaApi) mot exakt samma mock, med
 *  beständig fyndfil — bevisraderna avslöjar rot-sondens verkliga fel. */
import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";

const server = http.createServer((req, res) => {
  if (req.url === "/") { res.writeHead(200); res.end("ok"); return; }
  console.log(`  [mock] förstör ${req.method} ${req.url}`);
  req.socket.destroy();
});
await new Promise((res) => server.listen(0, "127.0.0.1", res));
const BAS = `http://127.0.0.1:${server.address().port}`;
const FYND = "/tmp/f3-debug.jsonl";
try { fs.unlinkSync(FYND); } catch {}
console.log(`mock ${BAS} — startar riktigt barn (--fall2)`);

const barn = spawn(process.execPath, ["verktyg/_f3-vaccin-test.mjs", "--fall2"], {
  cwd: "/home/ak1a/agent/ak1",
  env: { ...process.env, AK1A_BAS_URL: BAS, AK1A_FYND_SOKVAG: FYND, NO_COLOR: "1" },
  stdio: ["ignore", "inherit", "inherit"],
});
const t0 = Date.now();
setTimeout(() => { try { barn.kill("SIGKILL"); } catch {} }, 75_000);
await new Promise((res) => barn.on("exit", res));
console.log(`barn slut efter ${Math.round((Date.now() - t0) / 1000)} s — fyndrader:`);
const rader = fs.readFileSync(FYND, "utf8").split("\n").filter(Boolean).map((r) => JSON.parse(r));
for (const r of rader.slice(0, 4)) console.log(`  ${r.allvar} | ${r.fynd} | bevis: ${String(r.bevis).slice(0, 140)}`);
console.log(`totalt ${rader.length} rader`);
server.close();
process.exit(0);
