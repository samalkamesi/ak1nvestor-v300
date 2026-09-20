/**
 * SVITHARMONISERING omgång 25, tillägg (s6-u2 försök 2, manifest
 * auto-s6-1789864506792) — idempotent, mall _s6u2-harmonisera-omg25.mjs.
 *
 * Kanda-bördan: varje modultests L-fall vakar widgetens komponeringsrad
 * och underkänner OKÄNDA komponenter. Detta fönsterts fjärde komponent:
 *   4. svaraLokaltMultipel  (omgång 25, detta lager — 62:a motorn)
 *
 * Skriptet appendar den saknade komponenten i KEDJEORDNING (sist) i
 * varje KOMPONENTER-array (blocket «const KOMPONENTER = [» … första «];»).
 * Idempotent: redan harmoniserade filer rörs ej.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const VERKTYG = "/home/ak1a/AK1/verktyg";
const NYA = ["svaraLokaltMultipel"];

const filer = readdirSync(VERKTYG).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f) && f !== "testa-ai-mentor-kedja.mjs");
let andrade = 0;
const rapport = [];

for (const fil of filer) {
  const sokVag = join(VERKTYG, fil);
  let src = readFileSync(sokVag, "utf8");
  const orig = src;

  const start = src.indexOf("const KOMPONENTER = [");
  if (start !== -1) {
    const slut = src.indexOf("];", start);
    const block = src.slice(start, slut);
    const saknade = NYA.filter((n) => !block.includes('"' + n + '"'));
    if (saknade.length) {
      const rader = block.split("\n");
      let indrag = "    ";
      for (let i = rader.length - 1; i >= 0; i--) {
        if (rader[i].includes('"svaraLokalt')) { indrag = (rader[i].match(/^\s*/) ?? [""])[0]; break; }
      }
      const tillagg = [
        indrag + "// Omgång 25-tillägg (s6-u2 försök 2, 2026-09-20): grundmultiplarna —",
        indrag + "// 62:a motorn, efter marknadsrytm (v04 P/S + v05 P/B).",
        ...saknade.map((n) => indrag + '"' + n + '",'),
      ];
      rader.splice(rader.length, 0, ...tillagg);
      src = src.slice(0, start) + rader.join("\n") + src.slice(slut);
      rapport.push(fil + ": +" + saknade.length + " komponenter");
    }
  }

  if (src !== orig) { writeFileSync(sokVag, src); andrade++; }
}

console.log("harmoniserade filer:", andrade);
for (const r of rapport) console.log("  " + r);
