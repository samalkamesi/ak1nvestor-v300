#!/usr/bin/env node
// s7-u3 sond v3: rå flight-kontext kring kursobjekten — hitta de två arrayernas exakta form och ägare
import { readFileSync } from "node:fs";

const html = readFileSync("/tmp/kurser-live.html", "utf8");
const rader = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .filter((s) => s.includes("__next_f"));

for (const rad of rader) {
  // hitta första slug-förekomsten och skriv ut rå kontext
  const ix = rad.indexOf('\\"slug\\"');
  if (ix < 0) continue;
  console.log("=== rad längd", (rad.length / 1024).toFixed(0) + "K — kontext vid första slug:");
  console.log(rad.slice(Math.max(0, ix - 400), ix + 500).replace(/\\n/g, " "));
  console.log();
  // Räkna objektformer på rå (escapad) text
  const formTitel = (rad.match(/\{\\"slug\\":\\"[^\\]+\\",\\"titel\\":/g) || []).length;
  const formTitle = (rad.match(/\\"slug\\":\\"[^\\]+\\",\\"title\\":/g) || []).length;
  console.log("form {slug,titel,…}:", formTitel, "· form {slug,title,…}:", formTitle);
}
