/**
 * SVITHARMONISERING (s6-u2, fönstret efter omgång 27 — verktygsprefix
 * _s6u2o28-): läker 43 mentorsviters L01-komponentlistor.
 *
 * BAKGRUND (dokumenterad i e4588c57:s KVD + omgång 27:s worklograder):
 * omgång 27 wireade ModernaRisker (u3) och Coinvest (u1) i widgeten, men
 * fönstret stängdes före familjeharmoniseringen — 43 sviter blev röda på
 * «okänd kedjekomponent: svaraLokaltModernaRisker | svaraLokaltCoinvest».
 * Detta fönster läker dem OCH lägger till tvångsmekanik (s6-u2) i samma
 * andetag — svitharmoniseringens dokumentationsplikt (rond 114-läxan:
 * widget-wire ⇒ harmonisering i samma leverans).
 *
 * INSÄTTNINGAR (widgetordning är sanningen — fall G i kedjetestet):
 *   · "svaraLokaltModernaRisker" omedelbart FÖRE "svaraLokalt" (basen) —
 *     modernarisk wireades EFTER extra FÖRE basen (mekanik-före-generell,
 *     våg 210-doktrinen).
 *   · "svaraLokaltCoinvest" + "svaraLokaltTvangsmekanik" omedelbart FÖRE
 *     "svaraLokaltMarknalsrytm" (SIST, deras L01) — kedjeordning enligt
 *     widgeten: … pengarstid → volatilitetsmekanik → co-invest →
 *     tvångsmekanik → marknadsrytm.
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

const TOKEN_BAS = '"svaraLokalt",';
const TOKEN_RYTM = '"svaraLokaltMarknadsrytm"';
const RYTM_VARIANTE = /"svaraLokaltMarknadsrytm",?/;

let andrade = 0;
const rapport = [];

for (const fil of filer) {
  const sokvag = join(ROT, "verktyg", fil);
  let kalla = readFileSync(sokvag, "utf8");
  if (!kalla.includes("okänd kedjekomponent")) continue; // har ingen L01-lista att läka

  const fore = kalla;
  const insatt = [];

  // 1) ModernaRisker FÖRE basen (efter extra i widgetordning).
  if (!kalla.includes('"svaraLokaltModernaRisker"') && kalla.includes(TOKEN_BAS)) {
    kalla = kalla.replace(TOKEN_BAS, '"svaraLokaltModernaRisker", "svaraLokalt",');
    insatt.push("ModernaRisker");
  }

  // 2) Coinvest + Tvangsmekanik FÖRE marknadsrytm (SIST).
  if (!kalla.includes('"svaraLokaltTvangsmekanik"') && RYTM_VARIANTE.test(kalla)) {
    const harCoinvest = kalla.includes('"svaraLokaltCoinvest"');
    const ny = harCoinvest
      ? '"svaraLokaltTvangsmekanik", "svaraLokaltMarknadsrytm"'
      : '"svaraLokaltCoinvest", "svaraLokaltTvangsmekanik", "svaraLokaltMarknadsrytm"';
    kalla = kalla.replace(TOKEN_RYTM, ny);
    insatt.push(harCoinvest ? "Tvangsmekanik" : "Coinvest+Tvangsmekanik");
  }

  if (kalla !== fore) {
    // Dokumentationsraden (svitharmoniseringens dokumentationsplikt).
    const dokRad =
      "  // Fönstret efter omgång 27 (s6-u2, _s6u2o28-): " + insatt.join(" + ") +
      " i widgetordning — läkning av omgång 27:s öppna harmoniseringsskuld\n" +
      "  // (ModernaRisker/Coinvest wireades utan familjepass; dokumentationsplikten, rond 114-läxan).\n";
    // Insättningspunkt: direkt efter KOMPONENTER-arrayens slut — enklast: före
    // raden som bygger kanda-set (filerna har alla «const kanda = new Set(KOMPONENTER);»).
    if (kalla.includes("const kanda = new Set(KOMPONENTER);")) {
      kalla = kalla.replace("const kanda = new Set(KOMPONENTER);", dokRad + "  const kanda = new Set(KOMPONENTER);");
    }
    writeFileSync(sokvag, kalla);
    andrade++;
    rapport.push(fil + ": +" + insatt.join(" +"));
  } else if (kalla.includes('"svaraLokaltModernaRisker"') && kalla.includes('"svaraLokaltCoinvest"') && kalla.includes('"svaraLokaltTvangsmekanik"')) {
    rapport.push(fil + ": redan harmoniserad");
  } else {
    rapport.push(fil + ": INGEN INSÄTTNING MÖJLIG — manuell granskning! (bas-token: " + kalla.includes(TOKEN_BAS) + ", rytm-token: " + RYTM_VARIANTE.test(kalla) + ")");
  }
}

console.log("Svitharmonisering (fönstret efter omgång 27): " + andrade + " filer ändrade av " + filer.length + " testfiler");
for (const r of rapport) console.log("  " + r);
