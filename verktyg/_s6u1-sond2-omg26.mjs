/**
 * SOND ROND 2 (omgång 26, s6-u1) — LEVANDE frågetest: riskens anatomi-familjen.
 *
 * Kör kandidatfrågorna genom KEDJAN LIVE (62 motorer i widgetens ordning) och
 * rapporterar vilken motor som fångar — null = fritt territorium. Kontroll-
 * frågor skall fångas av sina ägare (bevisar att sonden mäter rätt).
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

function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return { motor: m.namn, amne: s.amne ?? "?" };
  }
  return null;
}

const KANDIDATER = [
  // ── Riskens anatomi-familjen (rs-06/07/08/09) ──
  "vad är riskens anatomi?",
  "vad är leverantörsrisken?",
  "vad är modellrisken?",
  "vad är personalrisken?",
  "var bor risken i ett bolag?",
  "vad är risken med nyckelpersoner?",
  "hur läser jag ett bolags risker?",
  "vad är inköpskoncentration?",
  // ── Nära grannar som SKALL vara upptagna (kontroller) ──
  "vad är kundkoncentration?",        // risklasningsdjupet
  "vad är koncentrationsrisk?",       // marknadsrytm/källor
  "vad är personaloptioner?",         // skattedjupet
  "vad är en riskmatris?",            // risklasningsdjupet
  "vad är risk?",                     // basen
  "vad är leverantörskedjan?",        // ?
  "vad är ESG?",                      // ?
  "vad är GDPR?",                     // ?
];

for (const f of KANDIDATER) {
  const r = kedja(f);
  console.log((r ? `FÅNGAD av ${r.motor} (${r.amne})` : "NULL — fritt") + "  «" + f + "»");
}
