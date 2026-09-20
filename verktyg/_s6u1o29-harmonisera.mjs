/**
 * SVITHARMONISERING (s6-u1, fönster 29 — verktygsprefix _s6u1o29-): lägger
 * kemisektor (svaraLokaltKemisektor) i mentorsviternas L01-kända-uppsättningar.
 *
 * V219-läxan (dokumentationsplikt): varje widget-wire kräver svitharmonisering
 * i samma leverans. Detta fönster wireade kemisektor (73:e motorn, efter
 * lonsamhetsgrund, FÖRE marknadsrytm) — alla sviter med «okänd kedjekomponent»-
 * vakt behöver namnet i sitt kända-set.
 *
 * Två setformer stöds (båda förekommer i familjen):
 *   const kanda = new Set(KOMPONENTER);
 *   const kanda = new Set([...KOMPONENTER, "svaraLokaltX", ...]);
 *
 * Idempotent: körs igen ⇒ 0 ändringar. Endast verktyg/testa-ai-mentor-*.mjs
 * berörs (historiska engångsskript _*-.mjs rörs ej — _s6u2o28-mönstret).
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const filer = readdirSync(join(ROT, "verktyg")).filter(
  (f) => f.startsWith("testa-ai-mentor-") && f.endsWith(".mjs"),
);

const MIN = '"svaraLokaltKemisektor"';
const FORM_A = "new Set(KOMPONENTER)";
const FORM_B = "new Set([...KOMPONENTER,";

let andrade = 0;
const rapport = [];

for (const fil of filer) {
  const sokvag = join(ROT, "verktyg", fil);
  let kalla = readFileSync(sokvag, "utf8");
  if (!kalla.includes("okänd kedjekomponent")) continue; // ingen L01-lista att läka
  if (kalla.includes(MIN)) { rapport.push(fil + ": redan harmoniserad"); continue; }

  const fore = kalla;
  if (kalla.includes(FORM_A)) {
    kalla = kalla.replace(FORM_A, "new Set([...KOMPONENTER, " + MIN + "])");
  } else if (kalla.includes(FORM_B)) {
    kalla = kalla.replace(FORM_B, "new Set([...KOMPONENTER, " + MIN + ",");
  }

  if (kalla !== fore) {
    const dokRad =
      "  // Fönster 29 (s6-u1, _s6u1o29-): kemisektor i widgetordning (efter lonsamhetsgrund,\n" +
      "  // före marknadsrytm) — svitharmoniseringens dokumentationsplikt (V219-läxan).\n";
    if (kalla.includes("const kanda = new Set(")) {
      kalla = kalla.replace("const kanda = new Set(", dokRad + "  const kanda = new Set(");
    }
    writeFileSync(sokvag, kalla);
    andrade++;
    rapport.push(fil + ": +kemisektor");
  } else {
    rapport.push(fil + ": INGEN INSÄTTNING MÖJLIG — manuell granskning!");
  }
}

console.log("Svitharmonisering (fönster 29, kemisektor): " + andrade + " filer ändrade av " + filer.length + " testfiler");
for (const r of rapport) console.log("  " + r);
