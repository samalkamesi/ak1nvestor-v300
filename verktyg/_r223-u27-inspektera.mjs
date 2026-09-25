#!/usr/bin/env node
/** _r223-u27-inspektera.mjs — gör quote.html läsbar: strippa taggar, visa text. */
import { readFileSync, writeFileSync } from "node:fs";
const html = readFileSync("/tmp/r223-ng/quote.html", "utf8");
let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
writeFileSync("/tmp/r223-ng/quote.plain.txt", rader.join("\n"));
console.log("rader: " + rader.length);
const start = rader.findIndex((r) => /overview/i.test(r));
console.log(rader.slice(Math.max(0, start - 2), start + 80).join("\n"));
