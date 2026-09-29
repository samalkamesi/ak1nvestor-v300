#!/usr/bin/env node
// _s8u2o565-pool-reservera.mjs — reserverar o565 i protokollnummerpoolen under flock (o117-doktrinen)
import { readFileSync, writeFileSync } from "node:fs";

const POOL = "data/vakten/protokollnummer.json";
const pool = JSON.parse(readFileSync(POOL, "utf8"));

// Högsta kända nummer — dubbelkolla att o565 är fritt
const upptagna = new Set(pool.poster.map((p) => p.nummer));
if (upptagna.has("o565")) {
  console.error("o565 är redan reserverat av:", JSON.stringify(pool.poster.find((p) => p.nummer === "o565")));
  process.exit(1);
}
const hogsta = pool.poster
  .map((p) => parseInt(p.nummer.replace(/^o/, ""), 10))
  .reduce((a, b) => Math.max(a, b), 0);
// Syskon i samma manifestväg tog o566–o570 parallellt (sanna reservationer,
// nya protokollfiler) — o565 i sig är fritt och närmast under dem.

pool.poster.push({
  nummer: "o565",
  agare: "s8-u2",
  manifest: "auto-s8-1790679320397",
  titel: "kvalitetsvåg: bolagssidornas syskonlänks-kontrakt (o559:s namngivna grannpost) — kartläggning av /bolag/[slug]:s samtliga länkytor + W1-kur (analyser/forskningsbiblioteket växer utan deploy ⇒ ISR-revalidate länkar byggfrusna mål — byggdSidaFinns-grind) + W3-kur (syskonBolag ledger-fallback ⇒ .next-grind) + bevakningssvit; döda-länkar-fyndens domkedja lämnad som notis till s8-u1/o570",
  ts: Date.now(),
  status: "reserverat",
});
writeFileSync(POOL, JSON.stringify(pool, null, 2) + "\n");
console.log("o565 reserverat för s8-u2 (manifest auto-s8-1790679320397), högsta var o" + hogsta);
