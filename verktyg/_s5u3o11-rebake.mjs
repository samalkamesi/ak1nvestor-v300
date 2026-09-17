#!/usr/bin/env node
// Rebake: ersätt KURSREGISTER-arrayens rader med --baka-utdata (396 kurser).
import { readFileSync, writeFileSync } from "node:fs";

const REPO = "/home/ak1a/AK1";
const FIL = `${REPO}/src/lib/ai-mentor-register.ts`;
const NYA = readFileSync("/tmp/s5u3-rebake.txt", "utf8").replace(/\n$/, "");

const lines = readFileSync(FIL, "utf8").split("\n");
const startIdx = lines.findIndex((l) => l.includes("export const KURSREGISTER: RegisterRad[] = ["));
if (startIdx < 0) { console.log("FEL: startmarkör saknas"); process.exit(1); }
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].trim() === "];") { endIdx = i; break; }
}
if (endIdx < 0) { console.log("FEL: slutmarkör saknas"); process.exit(1); }

const gamla = endIdx - startIdx - 1;
const nya = NYA.split("\n").length;
lines.splice(startIdx + 1, gamla, NYA);
writeFileSync(FIL, lines.join("\n"), "utf8");
console.log(`KURSREGISTER rebakad: ${gamla} rader → ${nya} rader (rad ${startIdx + 2}–${startIdx + 1 + nya})`);
