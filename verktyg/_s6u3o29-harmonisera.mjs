/**
 * SVITHARMONISERING (s6-u3, fönster 30 — verktygsprefix _s6u3o29-): lägger
 * till lonsamhetsgrund i mentorsviternas L01-komponentlistor.
 *
 * Presedens: _s6u2o28-harmonisera.mjs (svitharmoniseringens
 * dokumentationsplikt — rond 114-läxan: widget-wire ⇒ harmonisering i
 * samma leverans). Widgetens kedja har fått lonsamhetsgrund FÖRE
 * marknadsrytm (72:a motorn); varje svits L01-vakt skall spegla samma
 * ordning.
 *
 * Regler:
 *   · Endast verktyg/testa-ai-mentor-*.mjs med «okänd kedjekomponent»-
 *     listor (L01-familjen) berörs — kedjetestet (MOTORDEFS-form) hoppas
 *     över: det bär redan motorn via sin egen MOTORDEFS-rad.
 *   · Infogning: "svaraLokaltLonsamhetsgrund" omedelbart FÖRE
 *     "svaraLokaltMarknadsrytm" (deras SIST-deklaration).
 *   · Idempotent: körs igen ⇒ 0 ändringar.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const filer = readdirSync(join(ROT, "verktyg")).filter(
  (f) => f.startsWith("testa-ai-mentor-") && f.endsWith(".mjs") && f !== "testa-ai-mentor-kedja.mjs",
);

const NY = '"svaraLokaltLonsamhetsgrund", "svaraLokaltMarknadsrytm"';

let andrade = 0;
const rapport = [];

for (const fil of filer) {
  const sokvag = join(ROT, "verktyg", fil);
  let kalla = readFileSync(sokvag, "utf8");
  if (!kalla.includes("okänd kedjekomponent")) continue; // har ingen L01-lista att harmonisera
  if (kalla.includes('"svaraLokaltLonsamhetsgrund"')) continue; // redan harmoniserad

  if (kalla.includes('"svaraLokaltMarknadsrytm"')) {
    kalla = kalla.replace('"svaraLokaltMarknadsrytm"', NY);
    writeFileSync(sokvag, kalla);
    andrade++;
    rapport.push(fil);
  }
}

console.log("SVITHARMONISERING lonsamhetsgrund: " + andrade + " sviter uppdaterade" + (andrade ? " — FÖRE marknadsrytm (deras SIST)" : ""));
for (const r of rapport) console.log("  · " + r);
