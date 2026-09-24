/**
 * ORDNINGSPASS omgång 26 (s6-u1) — idempotent syskonrace-kur.
 *
 * u2:s parallella harmonisering hann före med riskadress+balansdjup i vissa
 * svitlistor (med attribution); detta skripts första pass la då ENDAST
 * optionshantverk — på fel plats (före deras rader) ⇒ ordningskontrollerna
 * ("i fel ordning i kedjeraden") failar mot widgetens verkliga ordning
 * multipel → riskadress → balansdjup → optionshantverk → marknadsrytm.
 *
 * KUR: i varje svit tas de tre namnraderna bort och återinförs i KORREKT
 * ordning direkt efter "svaraLokaltMultipel". Idempotent: redan korrekt
 * ordning ⇒ 0 ändringar.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const NAMN = ["svaraLokaltRiskadress", "svaraLokaltBalansdjup", "svaraLokaltOptionshantverk"];
let andrade = 0;

const filer = readdirSync(join(ROT, "verktyg")).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f));
for (const f of filer) {
  const sokvag = join(ROT, "verktyg", f);
  let src = readFileSync(sokvag, "utf8");
  const orig = src;

  for (const suffix of ["\",", "(q, KURSREGISTER)\","]) {
    const rader = NAMN.map((n) => `"${n}${suffix}`);
    const pos = rader.map((r) => src.indexOf(r + "\n"));
    if (pos.some((p) => p === -1)) continue; // denna form finns inte komplett
    const ordningOk = pos[0] < pos[1] && pos[1] < pos[2];
    if (ordningOk) continue;

    // Ta bort de tre namnraderna (radera även en direkt nästgående tomma
    // duplikatkommentar undviks — kommentarrader lämnas, de är harmless).
    for (const r of rader) src = src.replace(r + "\n", "");
    // Återinför i korrekt ordning efter ankaret (multipel i samma form).
    const ankare = `"svaraLokaltMultipel${suffix}`;
    const insatt = rader
      .map((r) => r + "\n")
      .join("  // Omgång 26-ordningspass (s6-u1): fönstrets tre i kedjeordning — riskadress (62) · balansdjup (63) · optionshantverk (64), FÖRE marknadsrytm (SIST).\n");
    if (src.includes(ankare + "\n")) {
      src = src.replace(ankare + "\n", ankare + "\n" + insatt);
    } else {
      // Inget multipel-ankare: infoga före marknadsrytm i samma form.
      const sist = `"svaraLokaltMarknadsrytm${suffix}`;
      src = src.replace(sist + "\n", insatt + sist + "\n");
    }
  }

  if (src !== orig) {
    writeFileSync(sokvag, src);
    andrade++;
    console.log("  · " + f + ": tre komponenterna i kedjeordning");
  }
}
console.log("ORDNINGSPASS: " + andrade + " filer omordnade (idempotent).");
