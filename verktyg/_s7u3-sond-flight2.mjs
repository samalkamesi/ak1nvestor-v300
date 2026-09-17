#!/usr/bin/env node
// s7-u3 sond v2: avescapa flighten och mät vad som dominerar
import { readFileSync } from "node:fs";

const html = readFileSync("/tmp/kurser-live.html", "utf8");
const rader = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .filter((s) => s.includes("__next_f"));
let flight = rader.join("\n");
// avescapa JS-stränginnehållet grovt (tillräckligt för mönsteranalys)
flight = flight.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\");

console.log("flight rå:", (flight.length / 1024).toFixed(0) + "K tecken (avescapad)");

const rakna = (namn, re) => console.log(namn.padEnd(46), (flight.match(re) || []).length);
rakna("kursobjekt med slug", /\\"slug\\"|"slug"/g);
rakna("title-fält", /"title"/g);
rakna("category-fält", /"category"/g);
rakna("kapitel/min/minuter", /"minuter"|"kapitel"/g);
rakna("learn", /"learn"/g);
rakna("$L-komponentreferenser", /\$L\d+/g);

// kursobjektens bytes
const objekt = flight.match(/\{[^{}]*?"slug"[^{}]*?\}/g) || [];
const objektBytes = objekt.reduce((s, x) => s + x.length, 0);
console.log("\nkursobjekt:", objekt.length, "st ·", (objektBytes / 1024).toFixed(1) + "K");
if (objekt[0]) console.log("exempel:", objekt[0].slice(0, 260));
if (objekt[1]) console.log("exempel2:", objekt[1].slice(0, 260));

// längsta strängar
const langa = [...flight.matchAll(/"([^"\\]{60,})"/g)].map((m) => m[1]);
console.log("\nlånga strängar >60tkn:", langa.length, "·", (langa.reduce((s, x) => s + x.length, 0) / 1024).toFixed(1) + "K");
[...new Set(langa)].slice(0, 8).forEach((s) => console.log("  ·", s.slice(0, 110)));
