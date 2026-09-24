/**
 * SVITHARMONISERING ROND 3 — s6-u2 omgång 35 (manifest auto-s6-1790245511290).
 *
 * Bakgrund: äldre modultesters hårdkodade widget-listor slutar på olika
 * kedjepositioner (fönster 29–34) och widgeten har under detta fönster
 * vuxit med tre motorer till (enhetsekonomi + natverkseffekter +
 * slutstenarna — omgång 35:s samtliga wireade). Rond 1 tog bara
 * Valideringsfonster→Marknadsrytm-kommoformatet; detta skript går till
 * fixpunkt: hittar varje "föregående namn → Marknadsrytm"-par i namn-
 * listor (kommoformat och (q, KURSREGISTER)-format) och infogar nästa
 * namn i kedjeordningen tills inget saknas. Syskonmotorerna bärs
 * ömsesidigt (kanda-bördan, omgång 20/23-precedenserna).
 *
 * Idempotent och ordningssäker. Kör: node verktyg/_s6u2o35-harmonisera2.mjs
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const HÄR = dirname(fileURLToPath(import.meta.url));

// Kedjeordning (svans): varje namn → nästa. Marknadsrytm är SIST.
const NASTA = new Map([
  ["Kemisektor", "Stalsektor"],
  ["Stalsektor", "Casepraktik"],
  ["Casepraktik", "Beteendefallor"],
  ["Beteendefallor", "Kategoristangning"],
  ["Kategoristangning", "Banksektorn"],
  ["Banksektorn", "Notlasning"],
  ["Notlasning", "Nykull"],
  ["Nykull", "Nyfodda"],
  ["Nyfodda", "Skuldordning"],
  ["Skuldordning", "Valideringsfonster"],
  ["Valideringsfonster", "Enhetsekonomi"],
  ["Enhetsekonomi", "Natverkseffekter"],
  ["Natverkseffekter", "Slutstenarna"],
]);

const filer = readdirSync(HÄR).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f) && f !== "testa-ai-mentor-kedja.mjs");
let totalt = 0;

for (const fil of filer) {
  const p = join(HÄR, fil);
  let t = readFileSync(p, "utf8");
  if (!t.includes("svaraLokaltMarknadsrytm")) continue;
  let andradeIFilen = 0;
  // Fixpunkt: infoga EN nod i taget tills inget par matchar.
  for (let varv = 0; varv < 14; varv++) {
    let bytt = false;
    // Format A: namnarray — "svaraLokaltX", "svaraLokaltMarknadsrytm" (ev. newline emellan)
    for (const [prev, next] of NASTA) {
      const reA = new RegExp(`"svaraLokalt${prev}",(\\s*)"svaraLokaltMarknadsrytm"`);
      if (reA.test(t)) {
        t = t.replace(reA, `"svaraLokalt${prev}",$1"svaraLokalt${next}",$1"svaraLokaltMarknadsrytm"`);
        bytt = true; andradeIFilen++;
      }
      // Format B: composition med args — ?? svaraLokaltX(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER)
      const reB = new RegExp(`svaraLokalt${prev}\\(q, KURSREGISTER\\) \\?\\? svaraLokaltMarknadsrytm\\(q, KURSREGISTER\\)`);
      if (reB.test(t)) {
        t = t.replace(reB, `svaraLokalt${prev}(q, KURSREGISTER) ?? svaraLokalt${next}(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER)`);
        bytt = true; andradeIFilen++;
      }
    }
    if (!bytt) break;
  }
  if (andradeIFilen > 0) {
    writeFileSync(p, t);
    totalt += andradeIFilen;
    console.log("HARMONISERAD (" + andradeIFilen + " noder): " + fil);
  }
}
console.log("");
console.log("Totalt infogade noder: " + totalt);
