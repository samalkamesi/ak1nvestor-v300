#!/usr/bin/env node
// s7-u3 sond: vad bor i /kurser:s 174K inline-flight?
import { readFileSync } from "node:fs";

const html = readFileSync("/tmp/kurser-live.html", "utf8");
const flight = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .filter((s) => s.includes("__next_f"))
  .join("\n");

// Känn igen dominerande innehållsmönster och mät deras andel
const monster = [
  ["kurser-array-objekt (slug/title/category…)", /"slug":"/g],
  [" JSX-elementflight (children $L-komponenter)", /\$L\d+/g],
  ["strängfält learn/text", /"learn"/g],
  ["kategorinamn", /"category":"/g],
  ["quiz", /quiz/g],
  [" SocialProof-siffror", /elev|röst|medlem/gi],
  ["fortsatt-panel", /fortsatt/gi],
  ["turstips", /tips/gi],
];
for (const [namn, re] of monster) {
  const n = (flight.match(re) || []).length;
  console.log(namn.padEnd(45), n);
}
// De N längsta strängarna i flighten (grov heuristik: citterade strängar > 80 tecken)
const langa = [...flight.matchAll(/"([^"\\]{80,})"/g)].map((m) => m[1]);
console.log("\nlånga strängar (>80 tkn):", langa.length, "· totalt",
  (langa.reduce((s, x) => s + x.length, 0) / 1024).toFixed(1) + "K");
langa.slice(0, 6).forEach((s) => console.log("  ·", s.slice(0, 100)));
// slugfältens andel: räkna bytes i objektform
const objekt = flight.match(/\{[^{}]*"slug"[^{}]*\}/g) || [];
const objektBytes = objekt.reduce((s, x) => s + x.length, 0);
console.log("\nkursobjekt (med slug):", objekt.length, "st ·", (objektBytes / 1024).toFixed(1) + "K");
if (objekt[0]) console.log("exempel:", objekt[0].slice(0, 220));
