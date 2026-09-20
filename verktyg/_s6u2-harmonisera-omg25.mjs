/**
 * SVITHARMONISERING omgång 25 (s6-u2, manifest auto-s6-1789864506792) —
 * otrackat, idempotent.
 *
 * Kanda-bördan (dokumentationsplikten): varje modultests L-fall vakar
 * widgetens komponeringsrad och underkänner OKÄNDA komponenter. Fönstret
 * har lagt till TRE komponenter som de äldre testernas listor saknar:
 *   1. svaraLokaltEtfmekanik    (omgång 25, syskon u1 — 59:e motorn)
 *   2. svaraLokaltKontrahent    (omgång 25, detta lager — 60:e motorn)
 *   3. svaraLokaltMarknadsrytm  (omgång 25, syskon u3 — 61:a motorn)
 *
 * Dessutom K03-registerbotar: spår 5:s omgång 21 (2026-09-19) växte
 * registret 452 → 458 UTAN mentorsvitsharmonisering (före-liggande röd
 * baslinje — inte detta fönstrets fel, men detta fönstrets kur enligt
 * omgång 21:s riskpremie-presedens: «motordef här för G-fallets
 * widget-spegling»-andan).
 *
 * Skriptet:
 *   A) appendar saknade komponenter i KEDJEORDNING i varje KOMPONENTER-
 *      array (blocket «const KOMPONENTER = [» … första «];»),
 *   B) botar K03: «=== 452» → «=== 458» och «452 kurser» → «458 kurser»
 *      med daterad kommentar,
 *   C) rapporterar andra gamla registertal (446 etc.) utan att röra dem
 *      om de inte matchar 452-mönstret.
 *
 * Idempotent: redan harmoniserade filer rörs ej.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const VERKTYG = "/home/ak1a/AK1/verktyg";
const NYA = ["svaraLokaltEtfmekanik", "svaraLokaltKontrahent", "svaraLokaltMarknadsrytm"];

const filer = readdirSync(VERKTYG).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f) && f !== "testa-ai-mentor-kedja.mjs");
let andrade = 0;
const rapport = [];

for (const fil of filer) {
  const sokVag = join(VERKTYG, fil);
  let src = readFileSync(sokVag, "utf8");
  const orig = src;

  // A) KOMPONENTER-append
  const start = src.indexOf("const KOMPONENTER = [");
  if (start !== -1) {
    const slut = src.indexOf("];", start);
    const block = src.slice(start, slut);
    const saknade = NYA.filter((n) => !block.includes('"' + n + '"'));
    if (saknade.length) {
      const rader = block.split("\n");
      // indrag från sista raden som bär en komponent ("svaraLokalt…")
      let indrag = "    ";
      for (let i = rader.length - 1; i >= 0; i--) {
        if (rader[i].includes('"svaraLokalt')) { indrag = (rader[i].match(/^\s*/) ?? [""])[0]; break; }
      }
      const tillagg = [
        indrag + "// Omgång 25-harmonisering (s6-u2, 2026-09-20): fönstrets tre nya komponenter i",
        indrag + "// kedjeordning (u1 etfmekanik 59 · s6-u2 kontrahent 60 · u3 marknadsrytm 61).",
        ...saknade.map((n) => indrag + '"' + n + '",'),
      ];
      rader.splice(rader.length, 0, ...tillagg);
      src = src.slice(0, start) + rader.join("\n") + src.slice(slut);
      rapport.push(fil + ": +" + saknade.length + " komponenter (" + saknade.join(", ") + ")");
    }
  }

  // B) K03-registerbotar 452 → 458
  if (src.includes("=== 452") || src.includes("452 kurser")) {
    src = src
      .replace(/KURSREGISTER\.length === 452/g, "KURSREGISTER.length === 458")
      .replace(/452 kurser/g, "458 kurser");
    rapport.push(fil + ": K03 452 → 458");
  }

  // C) rapportera andra gamla tal (ej rörda)
  for (const m of src.matchAll(/length === (4\d\d)/g)) {
    if (m[1] !== "458") rapport.push(fil + ": VARNING kvarvarande registertal " + m[1]);
  }

  if (src !== orig) { writeFileSync(sokVag, src); andrade++; }
}

console.log("harmoniserade filer:", andrade);
for (const r of rapport) console.log("  " + r);
