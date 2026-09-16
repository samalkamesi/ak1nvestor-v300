// s8-u2 o39: löser den övergivna worklog-konflikten i huvudagentens klon
// /home/ak1a/agent/ak1 (förening: cfc7c002-sidan först [22:37], HEAD-sidan
// [rond 53, 22:47] efter — kronologisk ordning). Idempotens-skydd: vägrar
// om mer än ett konfliktblock eller oväntade markörer.
import { readFileSync, writeFileSync } from "node:fs";

const fil = "/home/ak1a/agent/ak1/worklog.md";
const rader = readFileSync(fil, "utf8").split("\n");

const startIx = [], midIx = [], slutIx = [];
rader.forEach((r, i) => {
  if (/^<<<<<<< HEAD$/.test(r)) startIx.push(i);
  else if (/^=======$/.test(r)) midIx.push(i);
  else if (/^>>>>>>> [0-9a-f]{40}$/.test(r)) slutIx.push(i);
});

if (startIx.length !== 1 || midIx.length !== 1 || slutIx.length !== 1) {
  console.error(`VÄGRAR: ${startIx.length} start / ${midIx.length} mitt / ${slutIx.length} slut — väntat exakt 1/1/1`);
  process.exit(1);
}
const [s] = startIx, [m] = midIx, [e] = slutIx;
if (!(s < m && m < e)) { console.error("VÄGRAR: markörordning felaktig"); process.exit(1); }

const vasa = rader.slice(s + 1, m);      // HEAD = rond 53
const theirsa = rader.slice(m + 1, e);   // cfc7c002 = s4-u2 SAAB
if (!vasa.some(r => r.startsWith("## ROND 53")) || !theirsa.some(r => r.startsWith("## SPÅR 4 s4-u2"))) {
  console.error("VÄGRAR: sektionernas rubriker matchar inte diagnosen"); process.exit(1);
}
const trim = (a) => {
  while (a.length && a[0] === "") a.shift();
  while (a.length && a[a.length - 1] === "") a.pop();
  return a;
};
const ny = [...rader.slice(0, s), ...trim(theirsa), "", ...trim(vasa), ...rader.slice(e + 1)];
writeFileSync(fil, ny.join("\n"));
console.log(`OK: förening skriven — ${trim(theirsa).length} rader (s4-u2) + ${trim(vasa).length} rader (rond 53), ${rader.length} → ${ny.length} rader`);
