/**
 * SOND ROND 2 (manifest auto-s6-1789890903364, s6-u2 = tredje u2-fönstret,
 * verktygsprefix _s6u2c- för att skilja från föregående fönsters _s6u2-/
 * _s6u2b-) — LEVANDE frågetest: private equitys pengars tid (pe-06/pe-05/
 * ib-05) + sekvensrisken (rp-05).
 *
 * Kör kandidatfrågorna genom KEDJAN LIVE (65 motorer i widgetens ordning,
 * inklusive de ocommittade syskonlagren i trädet) och rapporterar vilken
 * motor som fångar — null = fritt territorium. Kontrollfrågorna SKALL
 * fångas av sina ägare (bevisar att sonden mäter rätt).
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
console.error(`Motorer laddade LIVE ur kedjetestet: ${MOTORER.length} (register ${KURSREGISTER.length})`);

function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return { motor: m.namn, amne: s.amne ?? "?" };
  }
  return null;
}

const KANDIDATER = [
  // ── Private equitys pengars tid (pe-06 J-kurvan primär + pe-05 + ib-05) ──
  "vad är j-kurvan?",
  "vad är en j-kurva?",
  "vad är en capital call?",
  "vad är capital calls?",
  "vad är andrahandsmarknaden?",
  "vad är andrahandsmarknaden för LP-andelar?",
  "vad är en LP-andel?",
  "vad är kostnadstrappan?",
  "vad äts på vägen mellan vinsten och fickan?",
  "hur snabbt får fonden mina pengar tillbaka?",
  "vad är den åtagna kapitalet?", // committed capital på svenska
  // ── Sekvensrisken (rp-05) ──
  "vad är sekvensrisken?",
  "vad är en sekvensrisk?",
  "vad är utfallsordningen?",
  "varför äger ordningen decenniet?",
  "vad händer om börsen faller de första pensionsåren?",
  "två portföljer samma medelavkastning olika ordning?",
  // ── Nära grannar som SKALL vara upptagna (kontroller) ──
  "vad är private equity?",          // pe-familjens paraply — ägare okänd
  "vad är ett investmentbolag?",     // ib-01 (något lager)
  "vad är NAV-rabatt?",              // km-067
  "vad är en utfasning?",            // pe-02
  "vad är en förvärvsmaskin?",       // pe-03
  "vad är volatilitetsbudgeten?",    // rp-04
  "vad är riskparitet?",             // rp-03
  "vad är Sharpe-kvoten?",           // rp-02
  "vad är en utdelningskurva?",      // kontroll: «kurvan»-familjen
  "vad är avkastningskurvan?",       // avkastningskurva-lagret SKALL äga
  "vad är risk?",                    // basen
];

for (const f of KANDIDATER) {
  const r = kedja(f);
  console.log((r ? `FÅNGAD av ${r.motor} (${r.amne})` : "NULL — fritt") + "  «" + f + "»");
}
