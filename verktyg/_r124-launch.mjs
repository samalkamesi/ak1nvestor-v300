#!/usr/bin/env node
/** Rond 124 commit-launcher: committar stage:at bokning + pushar + kvitterar.
 * Push via execFileSync: exit 0 = grön (stderr-output är normal för git push). */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const SVAR = `${ROT}/data/vakten/r124-launch-svar.txt`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cd = (arr) => execFileSync(arr[0], arr.slice(1), { encoding: "utf8", cwd: ROT, maxBuffer: 16 * 1024 * 1024 });
const lines = [`LAUNCH start ${new Date().toISOString()}`];
try {
  const msg = `studio: rond 124 [organ:Φ] — F5-stängning av doktrinklasser: 34 fynd stängda transient-design med exakta lage-nycklar (24 agentyte-synk-doktrin enligt o11+rond 121; 10 hjärtslag-fetch-fel med maskinellt deploy-tidsbevis ur prod-synk.log ±15 min; 0 matchlösa stängda — verktyget lämnar okända rader öppna); torrkörning = körning (Vaccination)`;
  fs.writeFileSync(`${ROT}/_r124-msg.txt`, msg);
  const c = cd(["git", "commit", "-F", "_r124-msg.txt"]);
  lines.push("commit: " + c.split("\n")[0]);
  try { fs.unlinkSync(`${ROT}/_r124-msg.txt`); } catch {}
  let pushOk = false;
  for (let i = 1; i <= 30 && !pushOk; i++) {
    try { cd(["git", "push", "prod", "develop"]); pushOk = true; }
    catch (e) {
      try { cd(["git", "fetch", "prod", "develop"]); cd(["git", "merge", "-m", "merge prod (fabriksleveranser) — rond 124", "prod/develop"]); } catch {}
      lines.push(`push försök ${i} upptagen — väntar 60 s`);
      fs.writeFileSync(SVAR, lines.join("\n") + "\n");
      await sleep(60_000);
    }
  }
  lines.push(pushOk ? "PUSH GRÖN" : "PUSH nekad efter 30 försök");
  if (pushOk) {
    const minne = `${ROT}/data/vakten/beslutsminne.jsonl`;
    const m = fs.readFileSync(minne, "utf8").trim().split("\n");
    const s = JSON.parse(m.pop());
    if (s.rond === 124 && !s.landat) { s.landat = "ja"; m.push(JSON.stringify(s)); fs.writeFileSync(minne, m.join("\n") + "\n"); }
    lines.push("beslutsminne: landat=ja");
  }
} catch (e) {
  lines.push(`FEL: ${String(e.stderr || e.message).slice(0, 600)}`);
}
lines.push(`LAUNCH klar ${new Date().toISOString()}`);
fs.writeFileSync(SVAR, lines.join("\n") + "\n");
console.log(lines.join("\n"));
