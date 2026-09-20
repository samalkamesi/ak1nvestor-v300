#!/usr/bin/env node
// ROND 110 — kopiera v213b-manifestet till fabrikens ko (prod-trädet) + rapport.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";

const KALLA = "/home/ak1a/agent/ak1/data/vakten/agentfabrik/ko/v213b-kontraktssviter-1789873200000.json";
const MAL = "/home/ak1a/AK1/data/vakten/agentfabrik/ko/v213b-kontraktssviter-1789873200000.json";

if (!existsSync(KALLA)) {
  console.log("KÄLLA SAKNAS:", KALLA);
  process.exit(1);
}
const innehall = readFileSync(KALLA, "utf8");
// validera JSON innan leverans (trasigt manifest får aldrig nå kön)
const parsad = JSON.parse(innehall);
writeFileSync(MAL, innehall);
console.log("KOPIERAD", innehall.length, "tecken,", parsad.uppgifter.length, "uppgifter, id:", parsad.id);
console.log("ko/ nu:", readdirSync("/home/ak1a/AK1/data/vakten/agentfabrik/ko/").join(" · "));
