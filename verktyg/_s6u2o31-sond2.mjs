/**
 * SOND ROND 2 (s6-u2, manifest auto-s6-1789965330060) — kandidatfrågor NULL-genom
 * LIVE-kedjan (73 motorer). En kandidat är ÖPPEN bara om HELA kedjan svarar null
 * (då äger ingen den idag). Motor som svarar icke-null = dokumenterad ägare.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const MOTORDEFS = [...kedjekalla.matchAll(
  /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
)].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));

const { KURSREGISTER } = await import(
  pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href
);

const MOTORER = [];
for (const d of MOTORDEFS) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
}

const KANDIDATER = [
  // — teknisk analys: indikatorer (AK1TS FÖRDJUPNING, 9 lösa) —
  "Vad är RSI?",
  "Vad är MACD?",
  "Vad är Bollinger Bands?",
  "Vad är glidande medelvärde?",
  "Vad är candlesticks?",
  "Vad är trendlinjer?",
  "Vad är stöd och motstånd?",
  "Vad är överköpt och översålt?",
  "Vad är divergens?",
  // — beteende (BETEENDEFINANS, 5 lösa) —
  "Vad är halo-effekten?",
  "Vad är slumpens serier?",
  "Vad är mentala konton?",
  "Vad är beteendeportföljteori?",
  "Vad är arbitragens gränser?",
  // — case-biblioteket (PRAKTISKA CASE, 16 lösa) —
  "Hur övar jag på riktiga bolag?",
  "Vilka case-bolag finns i plattformen?",
  "Hur jämför jag två bolag sida vid sida?",
  // — böcker (BOKMASTER, 57 lösa) —
  "Vilken bok ska jag läsa först?",
  "Vad handlar Shoe Dog om?",
  "Vad handlar When Genius Failed om?",
  "Vad handlar The Innovator's Dilemma om?",
  // — övriga lösa kurser —
  "Vad är konglomeratrabatten?",
  "Vad är walk-forward?",
  "Vad är bayesiansk omviktning?",
  "Vad är krishantering i portföljen?",
  "Hur fungerar arv av aktier?",
];

for (const fraga of KANDIDATER) {
  let traffad = null;
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) { traffad = { motor: m.namn, amne: s.amne }; break; }
  }
  console.log(
    (traffad ? "ÄGARE " : "NULL  ") + " " + fraga +
    (traffad ? "  → " + traffad.motor + " (" + traffad.amne + ")" : ""),
  );
}
