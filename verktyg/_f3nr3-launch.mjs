#!/usr/bin/env node
/** Rond 123 commit-launcher: committar stage:ad bokning + pushar, skriver
 * svar till data/vakten/f3nr3-launch-svar.txt (fristående från studionskal). */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const SVAR = `${ROT}/data/vakten/f3nr3-launch-svar.txt`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cd = (arr) => execFileSync(arr[0], arr.slice(1), { encoding: "utf8", cwd: ROT, maxBuffer: 16 * 1024 * 1024 });
const lines = [`LAUNCH start ${new Date().toISOString()}`];
try {
  const msg = `studio: rond 123 bokning [organ:Φ] — F3-vaccin v3 (FYNN nr 3) bokförd: worklog + 18:44-bedömning med korrekt nyckelkontrakt (ts=fyndets ts, dom=transient-design) + beslutsminne; kur lever i a57e53e9`;
  fs.writeFileSync(`${ROT}/_f3nr3-msg.txt`, msg);
  const c = cd(["git", "commit", "-F", "_f3nr3-msg.txt"]);
  lines.push("commit: " + c.split("\n")[0]);
  try { fs.unlinkSync(`${ROT}/_f3nr3-msg.txt`); } catch {}
  let pushad = "";
  for (let i = 1; i <= 30 && !pushad; i++) {
    try { pushad = cd(["git", "push", "prod", "develop"]); }
    catch (e) {
      try { cd(["git", "fetch", "prod", "develop"]); cd(["git", "merge", "-m", "merge prod (fabriksleveranser) — rond 123 bokning", "prod/develop"]); } catch (e2) { lines.push(`merge försök ${i}: ${String(e2.message).slice(0, 120)}`); }
      lines.push(`push försök ${i}: ${String(e.message).slice(0, 120)} — väntar 60 s`);
      fs.writeFileSync(SVAR, lines.join("\n") + "\n");
      await sleep(60_000);
    }
  }
  lines.push(pushad ? `PUSH GRÖN: ${pushad.trim().split("\n").pop()}` : "PUSH nekad efter 30 försök");
  if (pushad) {
    const minne = `${ROT}/data/vakten/beslutsminne.jsonl`;
    const m = fs.readFileSync(minne, "utf8").trim().split("\n");
    const sista = JSON.parse(m.pop());
    sista.landat = "ja";
    m.push(JSON.stringify(sista));
    fs.writeFileSync(minne, m.join("\n") + "\n");
    lines.push("beslutsminne: landat=ja kvitterat");
  }
} catch (e) {
  lines.push(`FEL: ${String(e.stderr || e.message).slice(0, 600)}`);
}
lines.push(`LAUNCH klar ${new Date().toISOString()}`);
fs.writeFileSync(SVAR, lines.join("\n") + "\n");
console.log(lines.join("\n"));
