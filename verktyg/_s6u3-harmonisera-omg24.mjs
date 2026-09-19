/**
 * SVITHARMONISERING omgång 24 (s6-u3, spår 6) — otrackat, idempotent.
 *
 * Kanda-bördan (dokumentationsplikten): varje modultests L-fall vakar
 * widgetens komponeringsrad och underkänner OKÄNDA komponenter. Fönstret
 * har lagt till FYRA komponenter som de äldre testernas listor saknar:
 *   1. svaraLokaltMarknadsmekanik  (våg 189, arbetsstationen — EJ har-
 *      moniserad då; baslinjen var röd på exakt detta före detta fönster)
 *   2. svaraLokaltForsakring       (omgång 24, syskon u1)
 *   3. svaraLokaltMoatdjup         (omgång 24, syskon u2)
 *   4. svaraLokaltNyaTerritorier   (omgång 24, detta lager)
 *
 * Skriptet:
 *   A) infogar marknadsmekanik EFTER raden med «svaraLokaltCase» (kedje-
 *      ordning: case → marknadsmekanik → praktik; kedjetestets G-fall äger
 *      sanningen),
 *   B) infogar försakring + moatdjup + nyaterritorier efter SISTA posten i
 *      KOMPONENTER-arrayen (citerat-ankare sista förekomst — omgång 20:s
 *      kända importrads-fälla),
 *   C) botar K03-registerbotarna: «446 kurser» → «452 kurser» (spår 5:s
 *      omgång-20-tillägg; omgång 23:s precedens).
 *
 * Idempotent: redan harmoniserade filer rörs ej (0 ändringar andra gången).
 * Syskonens egna nya test (där de finns) har redan sina egna komponenter —
 * skriptet hoppar filer som redan bär alla fyra.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const VERKTYG = "/home/ak1a/AK1/verktyg";
const FYRA = ["svaraLokaltMarknadsmekanik", "svaraLokaltForsakring", "svaraLokaltMoatdjup", "svaraLokaltNyaTerritorier"];

const filer = readdirSync(VERKTYG).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f) && f !== "testa-ai-mentor-kedja.mjs" && f !== "testa-ai-mentor-nya-territorier.mjs");
let andrade = 0;
const rapport = [];

for (const fil of filer) {
  const sokVag = join(VERKTYG, fil);
  let src = readFileSync(sokVag, "utf8");
  if (!src.includes("KOMPONENTER")) continue; // inget L-fall — ej min bördan
  const orig = src;

  // A) marknadsmekanik efter case (om den saknas)
  if (!src.includes('"svaraLokaltMarknadsmekanik"')) {
    const rader = src.split("\n");
    const ix = rader.findIndex((r) => r.includes('"svaraLokaltCase"'));
    if (ix === -1) {
      rapport.push(fil + ": VARNING — «svaraLokaltCase» hittades ej, marknadsmekanik EJ infogad");
    } else {
      const indrag = (rader[ix].match(/^\s*/) ?? [""])[0];
      rader.splice(ix + 1, 0,
        indrag + "// Omgång 24-harmonisering (s6-u3): våg 189:s marknadsmekanik wireades utan",
        indrag + "// harmonisering — baslinjens röda L01; kedjeordning efter case (kedjetestet G).",
        indrag + '"svaraLokaltMarknadsmekanik",',
      );
      src = rader.join("\n");
    }
  }

  // B) fönstrets tre sista komponenter efter SISTA posten i KOMPONENTER
  const saknade = ["svaraLokaltForsakring", "svaraLokaltMoatdjup", "svaraLokaltNyaTerritorier"].filter((k) => !src.includes('"' + k + '"'));
  if (saknade.length > 0) {
    const start = src.indexOf("KOMPONENTER = [");
    const slut = src.indexOf("];", start);
    if (start === -1 || slut === -1) {
      rapport.push(fil + ": VARNING — KOMPONENTER-array ej funnen");
    } else {
      const block = src.slice(start, slut);
      const rader = block.split("\n");
      let sista = -1;
      for (let i = 0; i < rader.length; i++) if (/"svaraLokalt\w+"/.test(rader[i])) sista = i;
      if (sista === -1) {
        rapport.push(fil + ": VARNING — ingen postrad i KOMPONENTER");
      } else {
        const indrag = (rader[sista].match(/^\s*/) ?? [""])[0];
        const nya = [
          indrag + "// Omgång 24 (s6-u3-harmonisering): fönstrets tre sista komponenter i",
          indrag + "// wireningsordning — u1 försäkring (55) · u2 moatdjup (56) · u3 nya",
          indrag + "// territorier (57). Idempotent: körs igen ⇒ 0 ändringar.",
        ];
        for (const k of saknade) nya.push(indrag + '"' + k + '",');
        rader.splice(sista + 1, 0, ...nya);
        src = src.slice(0, start) + rader.join("\n") + src.slice(slut);
      }
    }
  }

  // C) K03-registerbotare: 446 → 452 (spår 5:s omgång-20-tillägg; precedens
  //    omgång 23:s «440 → 446»-bot)
  if (src.includes("446 kurser")) {
    src = src.replaceAll("446 kurser", "452 kurser");
    rapport.push(fil + ": K03-registerbotare 446 → 452");
  }

  if (src !== orig) {
    writeFileSync(sokVag, src);
    andrade++;
    rapport.push(fil + ": harmoniserad (" + saknade.length + " slutkomponenter" + (!orig.includes('"svaraLokaltMarknadsmekanik"') ? " + marknadsmekanik" : "") + ")");
  }
}

console.log("SVITHARMONISERING OMGÅNG 24 (s6-u3): " + andrade + " av " + filer.length + " modultester ändrade");
for (const r of rapport) console.log("  " + r);
console.log("Alla fyra komponenter närvarande överallt? " + (verifiera() ? "JA" : "NEJ — se varningar"));
function verifiera() {
  for (const fil of filer) {
    const src = readFileSync(join(VERKTYG, fil), "utf8");
    if (!src.includes("KOMPONENTER")) continue;
    for (const k of FYRA) if (!src.includes('"' + k + '"')) return false;
  }
  return true;
}
