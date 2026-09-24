#!/usr/bin/env node
/** V221-sond: stream-payloadens anatomi (fält för fält, kB). */
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
console.log("total:", Math.round(tot / 1024) + " kB");
for (const [nyckel, varde] of Object.entries(j)) {
  const b = Buffer.byteLength(JSON.stringify(varde ?? null));
  if (b > 2000) console.log(`  ${nyckel}: ${Math.round(b / 1024)} kB`);
}
const th = j.tradHistorik || [];
console.log("tradHistorik: ", th.length, "poster,");
let sum = 0;
for (const p of th) sum += (p.text || "").length;
console.log("  textsumma:", Math.round(sum / 1024), "kB, snitt/post:", Math.round(sum / Math.max(1, th.length)), "tecken");
const hist = j.historik || [];
console.log("historik:", hist.length, "poster,", Math.round(Buffer.byteLength(JSON.stringify(hist)) / 1024), "kB");
