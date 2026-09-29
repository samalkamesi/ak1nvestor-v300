/**
 * _s6u2o38-skugg.mjs — förhandskontroll: aterstangningens kanoniska frågor
 * mot ALLA motorer före position 91 (skuggning) + träff hos eget lager.
 * Kör: node verktyg/_s6u2o38-skugg.mjs
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFileSync } from "node:fs";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const kedja = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defs = [...kedja.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const d of defs) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ ...d, fnk: modul[d.fn] });
}
const MIN = MOTORER.findIndex((m) => m.namn === "aterstangning");
console.log("aterstangning på motorindex " + MIN + " av " + MOTORER.length + " motorer");

const FRAGOR = [
  "vad är en enhetsmultipl?",
  "vad är enhetsmultiplar?",
  "vad är ev per ton?",
  "vad är kapacitetsfaktorn?",
  "vad är den teoretiska ex-kursen?",
  "vad är ex-kursen?",
  "vad är ex-spärren?",
  "vad är frukosthandeln?",
];
let fel = 0;
for (const f of FRAGOR) {
  const skuggor = MOTORER.slice(0, MIN).filter((m) => m.fnk(f, KURSREGISTER) !== null).map((m) => m.namn);
  const minTradff = MOTORER[MIN].fnk(f, KURSREGISTER) !== null;
  if (skuggor.length || !minTradff) { fel++; console.log("PROBLEM: «" + f + "» skuggor=" + skuggor.join(",") + " egenTräff=" + minTradff); }
  else console.log("OK: «" + f + "»");
}
console.log(fel === 0 ? "ALLA RENA" : fel + " problem");
