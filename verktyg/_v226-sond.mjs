/** V226-sond: stream-payloadens storlek efter byte-budgeten (V221-mönstret). */
import { readFileSync } from "node:fs";

const ENV = "/home/ak1a/AK1/.env.production.local";
const NYCKEL = "ADMIN" + "_PASSWORD";
const rad = readFileSync(ENV, "utf8").split("\n").find((r) => r.startsWith(NYCKEL + "="));
const pass = rad ? rad.slice(NYCKEL.length + 1).trim().replace(/^["']|["']$/g, "") : "";

const r = await fetch("http://localhost:3000/api/studio/stream", {
  headers: { "x-admin-password": pass },
  signal: AbortSignal.timeout(30_000),
});
const j = await r.json();
const tot = Buffer.byteLength(JSON.stringify(j));
console.log("total:", Math.round(tot / 1024) + " kB", tot < 200_000 ? "(< 200 kB KONTRAKT 4 GRÖNT)" : "(ÖVER 200 kB — RÖTT)");
for (const [nyckel, varde] of Object.entries(j)) {
  const b = Buffer.byteLength(JSON.stringify(varde ?? null));
  if (b > 2000) console.log(`  ${nyckel}: ${Math.round(b / 1024)} kB`);
}
const th = j.tradHistorik || [];
let sum = 0;
for (const p of th) sum += Buffer.byteLength(p.text || "", "utf8");
console.log("tradHistorik:", th.length, "poster, textsumma", Math.round(sum / 1024) + " kB (utf-8-bytes),", "snitt", Math.round(sum / Math.max(1, th.length)), "B/post");
