#!/usr/bin/env node
// s7-u3 sond: DOM-statistik ur live-HTML (element per sektion + inline flight-storlek)
import { readFileSync } from "node:fs";

const html = readFileSync("/tmp/kurser-live.html", "utf8");

// Total elementyta (grovräkning på taggar)
const taggar = html.match(/<[a-z][^>]*>/gi) || [];
console.log("yta (alla taggar, inkl. stängda):", taggar.length);

// Inline RSC/flight-payload: nextjs lägger den i <script>self.__next_f.push(...)
const pushes = [...html.matchAll(/self\.__next_f\.push\(/g)].length;
const flightBytes = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .filter((s) => s.includes("__next_f"))
  .reduce((sum, s) => sum + Buffer.byteLength(s), 0);
console.log("inline-flight: rader", pushes, "· bytes", (flightBytes / 1024).toFixed(0) + "K");

// Fördelning per landmärke
const langd = (re) => ((html.match(re) || []).length);
console.log("registerkort (cv-registerkort):", langd(/cv-registerkort/g));
console.log("utvalda kort (cv-utvalt):", langd(/cv-utvalt/g));
console.log("kategoriväggsknappar (röknare):", langd(/aria-label="Alla kategorier|kategorivagg/gi));
console.log("sidväljarknappar:", langd(/aria-current="page"|Föregående|Nästa/g));
console.log("51px-target-knappar:", langd(/min-h-\[52px\]/g));
console.log("länkar totalt:", langd(/<a /g));
console.log("HTML total:", (html.length / 1024).toFixed(0) + "K");
