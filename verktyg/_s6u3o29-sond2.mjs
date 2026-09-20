/**
 * SOND rond 1b (s6-u3, _s6u3o29-): kompletterande NULL-prober för kärnord
 * som rond 3 inte täckte + starkordsrisker infärdes.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const kedjaKalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defs = [...kedjaKalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const d of defs) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ ...d, fnk: modul[d.fn] });
}
function kedja(fraga) {
  for (const m of MOTORER) { const s = m.fnk(fraga, KURSREGISTER); if (s) return { svar: s, motor: m.namn }; }
  return null;
}
const PROBER = [
  "vad är negativt eget kapital?",
  "vad är kapitalbehovet?",
  "vad är kapitalbehov?",
  "vad är tvillingbolagen?",
  "vad är återinvesteringskvot?",
  "hur räknar man värdemultiplikatorn?",
  "vad är värdemultiplikator per krona?",
  "vad är lönsamhetsmått?",
  "vad är lönsamhetsmåttningen?",
  "vad är inkrementell lönsamhet?",
  "vad är medeltalet?",
  "vad är nästa krona?",
  "vad är kampanjräkningen?",
  "vad är bageriets trappa?",
  "vad är vinstens förståelse?",
  "vad är sex stegen?",
  "vad är vinst kontra kassa?",
  "vad är fakturans trettio dagar?",
  "vad är det vandrande medeltalet?",
  "vad är formeln går sönder?",
  "vad är nya kronor mot bokförda?",
  "vad är återinvesteringsandelen?",
  "vad är per återinvesterad krona?",
  "vad är värdeekvationens fem frågor?",
  "vad är lönsamhetsfamiljen?",
];
for (const p of PROBER) {
  const r = kedja(p);
  console.log((r ? "FÅNGAD → " + r.motor : "NULL     ") + '  "' + p + '"');
}
