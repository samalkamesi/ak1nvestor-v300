/**
 * SVITKÖRNING (s6-u3, fönster 30 — _s6u3o29-): kör HELA mentorsviten
 * (samtliga verktyg/testa-ai-mentor-*.mjs) och sammanfattar PASS/FAIL.
 * Node-wrappern är studions bevisat pålitliga kanal (våg 148).
 */
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const filer = readdirSync(join(ROT, "verktyg"))
  .filter((f) => f.startsWith("testa-ai-mentor-") && f.endsWith(".mjs"))
  .sort();

let grona = 0, roda = 0;
const rodaListan = [];
for (const fil of filer) {
  let ut = "";
  let kod = 0;
  try {
    ut = execFileSync("node", [join(ROT, "verktyg", fil)], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    kod = e.status ?? 1;
    ut = (e.stdout ?? "") + "";
  }
  const failRader = ut.split("\n").filter((r) => /\bFAIL\b/.test(r) && !/0 FAIL/.test(r) && !/PASS/.test(r.slice(0, 4)));
  const sum = (ut.split("\n").filter((r) => /PASS/.test(r) && /\d+ FAIL|\d+\/\s*\d+|av \d+/.test(r)).pop() ?? "").trim();
  if (kod === 0 && failRader.length === 0) { grona++; process.stdout.write("."); }
  else { roda++; rodaListan.push(fil + " EXIT " + kod + " · " + sum.slice(0, 80) + (failRader.length ? " · " + failRader[0].trim().slice(0, 100) : "")); process.stdout.write("R"); }
}
console.log("");
console.log("SVITEN: " + grona + " GRÖNA · " + roda + " RÖDA av " + filer.length + " sviter");
for (const r of rodaListan) console.log("  RÖD: " + r);
