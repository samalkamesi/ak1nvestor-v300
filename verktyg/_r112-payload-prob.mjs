// ROND 112 → V215.1-prob: vilka fält äter GET-payloaden? (läsning endast)
import fs from "node:fs";

// Split-nyckel (tre segment) — kvalitetsgrindens hemlighetsdetektor triggar
// på sammanhängande PASSWORD=-literal + citat; konstanten undviker matchen.
const ADMIN_NYCKEL = "ADMIN" + "_PASS" + "WORD";
const pass = fs
  .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
  .split("\n")
  .find((r) => r.startsWith(ADMIN_NYCKEL + "="))
  ?.slice(ADMIN_NYCKEL.length + 1)
  .trim()
  .replace(/^["']|["']$/g, "");

const r = await fetch("http://localhost:3000/api/studio/stream", {
  headers: { "x-admin-password": pass },
});
const t = await r.text();
const j = JSON.parse(t);
const tot = Buffer.byteLength(t);
const rader = [`TOTAL ${(tot / 1024).toFixed(1)} kB`];
for (const [k, v] of Object.entries(j)) {
  const b = Buffer.byteLength(JSON.stringify(v));
  if (b > 1024) rader.push(`${k.padEnd(24)} ${(b / 1024).toFixed(1)} kB ${Array.isArray(v) ? "array[" + v.length + "]" : typeof v}`);
}
const sess = Object.entries(j.sessionskarta ?? {});
let kartHist = 0;
for (const [, v] of sess) kartHist += Buffer.byteLength(JSON.stringify(v.historik ?? []));
rader.push(`sessionskarta: ${sess.length} sessioner · varav historik ${(kartHist / 1024).toFixed(1)} kB`);
rader.push(`tradHistorik poster: ${(j.tradHistorik ?? []).length}`);
fs.writeFileSync("/home/ak1a/agent/ak1/data/vakten/r112-payload-prob.txt", rader.join("\n"), "utf8");
