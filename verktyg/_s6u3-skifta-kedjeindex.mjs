/**
 * Skript för s6-u3: mekaniskt index-skift i verktyg/testa-ai-mentor-kedja.mjs.
 * Nya motor FÖRE basen (index 2) ⇒ alla motor-referenser ≥ 2 i KANONISKA +
 * PROBER skiftar +1 (samma operation som våg 210 dokumenterade).
 * Idempotens-skydd: skriptet vägrar köra om modernarisk redan finns i filen.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "/home/ak1a/AK1/verktyg/testa-ai-mentor-kedja.mjs";
let txt = readFileSync(FIL, "utf8");

// Idempotens: är skiftet redan gjort (AKM1 → motor >= 3) avbryter vi.
const akm1 = txt.match(/\{ fraga: "vad är AKM1\?",\s*motor: (\d+) \}/);
if (akm1 && parseInt(akm1[1], 10) >= 3) {
  console.error("SKYDD: AKM1 redan skiftad (motor " + akm1[1] + ") — ingen dubbel-skiftning.");
  process.exit(1);
}
if (!akm1) {
  console.error("SKYDD: AKM1-raden hittades ej — oväntad filstruktur, avbryter.");
  process.exit(1);
}

// Block-gränser: KANONISKA och PROBER
function skiftaBlock(text, startMark, slutMark, namn) {
  const s = text.indexOf(startMark);
  if (s < 0) throw new Error(startMark + " hittades ej");
  const e = text.indexOf(slutMark, s);
  if (e < 0) throw new Error(slutMark + " hittades ej");
  const block = text.slice(s, e);
  let n = 0;
  const ny = block.replace(/(motor:\s*)(\d+)(\s*[},])/g, (hela, pre, tal, post) => {
    const t = parseInt(tal, 10);
    if (t >= 2) { n++; return pre + (t + 1) + post; }
    return hela;
  });
  console.log(`${namn}: ${n} motor-referenser skiftade +1`);
  return text.slice(0, s) + ny + text.slice(e);
}

txt = skiftaBlock(txt, "const KANONISKA = [", "];\nfor (const { fraga, motor } of KANONISKA)", "KANONISKA");
txt = skiftaBlock(txt, "const PROBER = [", "];\nfor (const { fraga, motor } of PROBER)", "PROBER");
writeFileSync(FIL, txt);
console.log("KLAR: skrivet till " + FIL);
