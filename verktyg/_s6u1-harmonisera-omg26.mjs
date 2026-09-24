/**
 * SVITHARMONISERING omgång 26 (s6-u1) — idempotent, körs om nödvändigt.
 *
 * Fönstrets TRE nya komponenter (kedjeordning efter multipel, FÖRE
 * marknadsrytm som förblir SIST): s6-u1 riskadress · s6-u2 balansdjup ·
 * s6-u3 optionshantverk (BASF: syskonens moduler/leveranser deras — detta
 * skript lär SVITERNA + KEDJETESTET fönstrets komponenter, dokumenterad
 * dokumentationsplikt enligt omgång 25:s trefönster-precedens).
 *
 * Pass 1: kedjetestet — motordefs för balansdjup + optionshantverk
 *         (riskadress finns sedan min leverans) + fall C-detaljtext 65.
 * Pass 2: samtliga testa-ai-mentor-*.mjs med komponentlistor — tre namnen
 *         i kedjeordning efter multipel (namnform + anropsform).
 * Pass 3: K03-botare 458 → 464 (spår 5:s omgång-22-rebake 2026-09-20;
 *         basotestet E01 grönt på 464 — registrets äkthet är grinden).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const TRIO = [
  { namn: "svaraLokaltRiskadress", agare: "s6-u1 (riskadress — riskens adresser)" },
  { namn: "svaraLokaltBalansdjup", agare: "s6-u2 (balansdjup — lagret + obeskattade reserver)" },
  { namn: "svaraLokaltOptionshantverk", agare: "s6-u3 (optionshantverk — binomialträdet + straddlen + deltat)" },
];

let andrade = 0;
const rapport = [];

// ── Pass 1: kedjetestets motordefs + detaljtext ────────────────────────────
{
  const fil = join(ROT, "verktyg/testa-ai-mentor-kedja.mjs");
  let src = readFileSync(fil, "utf8");
  const fanns = (n) => src.includes('"namn: "' + n + '"') || src.includes('namn: "' + n + '"');
  const defBalans = `  // 2026-09-20 omgång 26: balansdjup (s6-u2 — lagret och lagervärderingen +
  // obeskattade reserver; aktiverar bk-07 + bk-06, BOKFÖRING & ÅRSREDOVISNING
  // fullt länkad 19/19). MOTORDEF HÄR för fall G:s widget-spegling (riskpremie-
  // precedensen): deras modul, deras leverans — kanoniska rader bärs av deras
  // eget leveranstest. 63:e motorn, efter riskadress, FÖRE marknadsrytm (SIST).
  { namn: "balansdjup", fil: "ai-mentor-balansdjup-fragor.ts", fn: "svaraLokaltBalansdjup", arr: "BALANSDJUP_MONSTER", antal: 2 },
`;
  const defOption = `  // 2026-09-20 omgång 26: optionshantverk (s6-u3 — binomialträdet och
  // replikeringen + straddlen + deltat; aktiverar od-08 + od-04 + od-06).
  // MOTORDEF HÄR för fall G:s widget-spegling (riskpremie-precedensen):
  // deras modul, deras leverans — kanoniska rader bärs av deras eget
  // leveranstest. 64:e motorn, efter balansdjup, FÖRE marknadsrytm (SIST).
  { namn: "optionshantverk", fil: "ai-mentor-optionshantverk-fragor.ts", fn: "svaraLokaltOptionshantverk", arr: "OPTIONSHANTVERK_MONSTER", antal: 3 },
`;
  let n = 0;
  const riskDef = src.match(/\{ namn: "riskadress",[^\n]*\n/);
  if (riskDef && !src.includes('namn: "balansdjup"')) {
    src = src.replace(riskDef[0], riskDef[0] + defBalans);
    n++;
  }
  if (src.includes('namn: "balansdjup"') && !src.includes('namn: "optionshantverk"')) {
    const bal = src.match(/\{ namn: "balansdjup",[^\n]*\n/);
    src = src.replace(bal[0], bal[0] + defOption);
    n++;
  }
  src = src.replace("sextiotre motorer lämnar frågan ifred", "sextiofem motorer lämnar frågan ifred");
  if (n > 0 || true) {
    writeFileSync(fil, src);
    andrade++;
    rapport.push("kedjetestet: +" + n + " motordefs (balansdjup/optionshantverk, attribution), detaljtext 65 motorer");
  }
}

// ── Pass 2: sviternas komponentlistor ──────────────────────────────────────
{
  const filer = readdirSync(join(ROT, "verktyg"))
    .filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f) && f !== "testa-ai-mentor-kedja.mjs" && f !== "testa-ai-mentor-riskadress.mjs");
  for (const f of filer) {
    const sokvag = join(ROT, "verktyg", f);
    let src = readFileSync(sokvag, "utf8");
    const orig = src;
    // Namnform: "svaraLokaltMultipel",
    if (src.includes('"svaraLokaltMultipel",')) {
      for (const t of TRIO) {
        if (!src.includes('"' + t.namn + '",')) {
          src = src.replace(
            '"svaraLokaltMultipel",',
            '"svaraLokaltMultipel",\n  // Omgång 26-harmonisering (s6-u1 2026-09-20): fönstrets tre — riskadress (62) · balansdjup (63) · optionshantverk (64), FÖRE marknadsrytm (SIST).\n  "' + t.namn + '",',
          );
        }
      }
    }
    // Anropsform: "svaraLokaltMultipel(q, KURSREGISTER)",
    else if (src.includes('"svaraLokaltMultipel(q, KURSREGISTER)",')) {
      for (const t of TRIO) {
        if (!src.includes('"' + t.namn + '(q, KURSREGISTER)",')) {
          src = src.replace(
            '"svaraLokaltMultipel(q, KURSREGISTER)",',
            '"svaraLokaltMultipel(q, KURSREGISTER)",\n  // Omgång 26-harmonisering (s6-u1 2026-09-20): fönstrets tre — riskadress (62) · balansdjup (63) · optionshantverk (64), FÖRE marknadsrytm (SIST).\n  "' + t.namn + '(q, KURSREGISTER)",',
          );
        }
      }
    }
    if (src !== orig) {
      writeFileSync(sokvag, src);
      andrade++;
      rapport.push(f + ": tre komponenterna inlästa");
    }
  }
}

// ── Pass 3: K03-botare 458 → 464 ───────────────────────────────────────────
{
  const filer = readdirSync(join(ROT, "verktyg")).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f));
  for (const f of filer) {
    const sokvag = join(ROT, "verktyg", f);
    let src = readFileSync(sokvag, "utf8");
    const orig = src;
    src = src
      .replace(/KURSREGISTER\.length === 458\b/g, "KURSREGISTER.length === 464")
      .replace(/458 kurser \(spår 5:s omgång-19-rebake 2026-09-19/g, "464 kurser (spår 5:s omgång-22-rebake 2026-09-20");
    if (src !== orig) {
      writeFileSync(sokvag, src);
      andrade++;
      rapport.push(f + ": K03 458→464 (E01-grön rebake 2026-09-20)");
    }
  }
}

console.log("ÄNDRADE " + andrade + " filer:");
for (const r of rapport) console.log("  · " + r);
