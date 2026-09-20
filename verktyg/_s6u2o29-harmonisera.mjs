/**
 * SVITHARMONISERING (s6-u2, fönster 29 — verktygsprefix _s6u2o29-):
 * läker mentorsviternas L01-komponentlistor på händelsemotor + K03-botare.
 *
 * INSÄTTNINGAR (widgetordning är sanningen — fall G i kedjetestet):
 *   · "svaraLokaltHandelsemotor" omedelbart FÖRE "svaraLokaltMarknadsrytm"
 *     (SIST, deras L01) — kedjeordning enligt widgeten: … tvångsmekanik →
 *     händelsemotor → marknadsrytm.
 *
 * K03-BOTARE: avkastningskurva + warrant bär registerkonstanten 470 —
 * spår 5:s omgång-24-rebake (2026-09-20, sj-07/tx-06/ib-06 + e561eab5:s
 * rp-07/ib-07/tx-07) växte registret till 476 UTAN mentorsvitsharmonisering
 * ⇒ båda röda på K03 (fönster-28-precedensens spegel: 464→470 botades då
 * med E01-kvar — samma kur här, 470→476, med attribution).
 *
 * Idempotent: körs igen ⇒ 0 ändringar. Endast verktyg/testa-ai-mentor-*.mjs
 * berörs (historiska engångsskript _*-.mjs rörs ej).
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const filer = readdirSync(join(ROT, "verktyg")).filter(
  (f) => f.startsWith("testa-ai-mentor-") && f.endsWith(".mjs"),
);

const RYTM_VARIANTE = /"svaraLokaltMarknadsrytm",?/;

let andrade = 0;
const rapport = [];

for (const fil of filer) {
  const sokvag = join(ROT, "verktyg", fil);
  let kalla = readFileSync(sokvag, "utf8");
  const fore = kalla;
  const insatt = [];

  // 1) Handelsemotor FÖRE marknadsrytm (SIST) i L01-komponentlistor.
  if (
    !kalla.includes('"svaraLokaltHandelsemotor"') &&
    kalla.includes("okänd kedjekomponent") &&
    RYTM_VARIANTE.test(kalla)
  ) {
    kalla = kalla.replace(
      RYTM_VARIANTE,
      '"svaraLokaltHandelsemotor", "svaraLokaltMarknadsrytm",',
    );
    insatt.push("Handelsemotor");
  }

  // 2) K03-registerbotare 470 → 476 (avkastningskurva + warrant — de bär
  // den historiska registerräkningen som familjens vaktare).
  if (kalla.includes("KURSREGISTER.length === 470")) {
    kalla = kalla.replaceAll(
      "KURSREGISTER.length === 470,",
      "KURSREGISTER.length === 476,",
    );
    insatt.push("K03 470→476");
  }

  if (kalla !== fore) {
    if (insatt.includes("Handelsemotor")) {
      const dokRad =
        "  // Fönster 29 (s6-u2, _s6u2o29-): Handelsemotor i widgetordning FÖRE marknadsrytm —\n" +
        "  // svitharmoniseringens dokumentationsplikt (rond 114-läxan: widget-wire ⇒ harmonisering i samma leverans).\n";
      if (kalla.includes("const kanda = new Set(KOMPONENTER);")) {
        kalla = kalla.replace("const kanda = new Set(KOMPONENTER);", dokRad + "  const kanda = new Set(KOMPONENTER);");
      }
    }
    if (insatt.includes("K03 470→476")) {
      // Attribution på K03-radens kommentar ovanför (om den finns i 470-läget).
      kalla = kalla.replace(
        /(\s*)([^\n]*470[^\n]*omgång-23-rebake[^\n]*\n)/,
        "$1$2" +
          "$1  // Fönster 29 (s6-u2, _s6u2o29-): K03 470→476 — spår 5:s omgång-24-rebake (2026-09-20:\n" +
          "$1  // sj-07/tx-06/ib-06 + rp-07/ib-07/tx-07) växte registret utan svitpass; E01-grund (registrets\n" +
          "$1  // äkthet) oförändrad — konstanten följer registret.\n",
      );
    }
    writeFileSync(sokvag, kalla);
    andrade++;
    rapport.push(fil + ": +" + insatt.join(" +"));
  } else if (kalla.includes('"svaraLokaltHandelsemotor"') || (!kalla.includes("KURSREGISTER.length === 470") && !kalla.includes("okänd kedjekomponent"))) {
    rapport.push(fil + ": inget att göra");
  } else {
    rapport.push(fil + ": INGEN INSÄTTNING MÖJLIG — manuell granskning! (rytm-token: " + RYTM_VARIANTE.test(kalla) + ")");
  }
}

console.log("Svitharmonisering (fönster 29): " + andrade + " filer ändrade av " + filer.length + " testfiler");
for (const r of rapport.filter((r) => !r.endsWith(": inget att göra"))) console.log("  " + r);
