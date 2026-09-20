#!/usr/bin/env node
// ORDNINGSPASS omgång 26 (s6-u2) — botar den krockade dubbla harmoniseringen:
// u1:s infogare körde efter VARJE "svaraLokaltMultipel",-förekomst (bröt
// multipel.mjs:s A2:1-sträng) och med omvänd ordning (optionshantverk →
// balansdjup → riskadress); s6-u2:s eget pass krockade med det (dubbletter).
// Kedjans SANNING i widgeten: multipel → riskadress (u1) → balansdjup (u2)
// → optionshantverk (u3) → marknadsrytm (SIST). Passet:
//   1. Lagar multipel.mjs:s sönderskrivna A2:1-rad + deras L2-exaktsträng
//      (som saknar optionshantverk).
//   2. Stryker ALLA tre-poster + Omgång 26-kommentarrader ur komponent-
//      listorna, återinfogar EN kanonisk trippel i KEDJEORDNING före
//      marknadsrytm-posten (samehn vila: idempotent — andra körningen
//      skriver identiskt innehåll).
//   3. case.mjs (fullkallsform) + marknadsrytm.mjs (Set-form) hanteras var
//      för sig via formdetektering.
// Kedjetestet (MOTORDEFS-kommentarer nämner lagren legitimit) + egna
// modultest hoppas över.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const VERK = HÄR;
const TRE = ["svaraLokaltRiskadress", "svaraLokaltBalansdjup", "svaraLokaltOptionshantverk"];
const HOPPA_OVER = new Set([
  "testa-ai-mentor-kedja.mjs",      // MOTORDEFS-kommentarer = legitima nämnen
  "testa-ai-mentor-balansdjup.mjs", // mitt eget test
  "testa-ai-mentor-riskadress.mjs", // u1:s eget test (grönt, egen struktur)
  "_s6u2-harmonisera-omg26.mjs", "_s6u2-ordningspass-omg26.mjs",
]);

// ── 1. multipel.mjs: laga A2:1 + L2-sträng ─────────────────────────────────
{
  const p = join(VERK, "testa-ai-mentor-multipel.mjs");
  let t = readFileSync(p, "utf8");
  const trasig = `  ok("A2:1 MOTORDEFS-rad finns", kedja.includes('{ namn: "multipel", fil: "ai-mentor-multipel-fragor.ts", fn: "svaraLokaltMultipel",\n  // Omgång 26-harmonisering (s6-u1 2026-09-20): fönstrets tre — riskadress (62) · balansdjup (63) · optionshantverk (64), FÖRE marknadsrytm (SIST).\n  "svaraLokaltOptionshantverk",\n  // Omgång 26-harmonisering (s6-u1 2026-09-20): fönstrets tre — riskadress (62) · balansdjup (63) · optionshantverk (64), FÖRE marknadsrytm (SIST).\n  "svaraLokaltBalansdjup",\n  // Omgång 26-harmonisering (s6-u1 2026-09-20): fönstrets tre — riskadress (62) · balansdjup (63) · optionshantverk (64), FÖRE marknadsrytm (SIST).\n  "svaraLokaltRiskadress", arr: "MULTIPEL_MONSTER", antal: 2 }'));`;
  const hel = `  ok("A2:1 MOTORDEFS-rad finns", kedja.includes('{ namn: "multipel", fil: "ai-mentor-multipel-fragor.ts", fn: "svaraLokaltMultipel", arr: "MULTIPEL_MONSTER", antal: 2 }'));`;
  if (t.includes(trasig)) { t = t.replace(trasig, hel); console.log("multipel A2:1: lagad (u1:s strängsplit borttagen)"); }
  const l2gammal = "?? svaraLokaltBalansdjup(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER);\"";
  const l2ny = "?? svaraLokaltBalansdjup(q, KURSREGISTER) ?? svaraLokaltOptionshantverk(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER);\"";
  if (t.includes(l2gammal) && !t.includes(l2ny)) { t = t.split(l2gammal).join(l2ny); console.log("multipel L2-sträng: optionshantverk tillagt (u3:s 64:e led)"); }
  writeFileSync(p, t);
}

// ── 2. Samtliga övriga: stryk + återinfoga kanonisk trippel ────────────────
let andrade = 0;
for (const f of readdirSync(VERK).filter((x) => /^testa-ai-mentor-.*\.mjs$/.test(x))) {
  if (HOPPA_OVER.has(f)) continue;
  const p = join(VERK, f);
  let t = readFileSync(p, "utf8");
  if (!TRE.some((n) => t.includes(`"${n}"`)) && !t.includes("svaraLokaltMarknadsrytm")) continue;

  // Fullkallsform? (case.mjs-stil: "svaraLokaltX(q, KURSREGISTER)")

  // (a) stryk entry-rader för de tre (båda former, valfritt indrag)
  const rader = t.split("\n");
  // (b) stryk krockade Omgång 26-kommentargrupper: konsekutiva rena // -rader
  // där NÅGON rad bär «Omgång 26» och gruppen nämner en av de tre eller
  // BOKFÖRING 19/19 (u1:s infogarkommentarer + s6-u2:s P1/P1b/P3-block)
  const behall = new Array(rader.length).fill(true);
  let j = 0;
  while (j < rader.length) {
    if (!/^\s*\/\//.test(rader[j])) { j++; continue; }
    let k = j;
    while (k < rader.length && /^\s*\/\//.test(rader[k])) k++;
    const grupp = rader.slice(j, k).join("\n");
    if (/Omgång 26/.test(grupp) && /(riskadress|balansdjup|optionshantverk|Riskadress|Balansdjup|Optionshantverk|BOKFÖRING 19\/19)/.test(grupp)) {
      for (let x = j; x < k; x++) behall[x] = false;
    }
    j = k;
  }
  const rensat = rader.filter((rad, idx) => {
    if (!behall[idx]) return false;
    if (/^(\s*)"?(svaraLokalt(?:Riskadress|Balansdjup|Optionshantverk))\(q, KURSREGISTER\)"?,?$/.test(rad)) return false;
    if (/^(\s*)"(svaraLokalt(?:Riskadress|Balansdjup|Optionshantverk))",?$/.test(rad)) return false;
    return true;
  });

  // (c) infoga kanonisk trippel före marknadsrytm-posten (accepterar alla
  // liständen: ",  ",",];  ","Set-form — raden är posten i komponentlistan)
  const i = rensat.findIndex((rad) => /^\s*"?svaraLokaltMarknadsrytm(?:\(q, KURSREGISTER\))?",?\]?\s*;?\s*$/.test(rad));
  if (i === -1) { writeFileSync(p, rensat.join("\n")); if (rensat.join("\n") !== t) andrade++; continue; }
  // form detekteras från själva listposten (fullkall om posten bär argumentet)
  const fullkall2 = /\(q, KURSREGISTER\)/.test(rensat[i]);
  const indrag = (/^\s+/.exec(rensat[i]) ?? ["  "])[0];
  const form = (n) => (fullkall2 ? `"${n}(q, KURSREGISTER)",` : `"${n}",`);
  const block = [
    indrag + "// Omgång 26 (manifest auto-s6-1789890903364 — ordningspasset efter två",
    indrag + "// krockade harmoniseringsvågor): fönstrets tre i KEDJEORDNING — riskadress",
    indrag + "// (s6-u1, 62:a) · balansdjup (s6-u2, 63:e) · optionshantverk (s6-u3, 64:e)",
    indrag + "// — FÖRE marknadsrytm (deras SIST-deklaration).",
    indrag + form("svaraLokaltRiskadress"),
    indrag + form("svaraLokaltBalansdjup"),
    indrag + form("svaraLokaltOptionshantverk"),
  ];
  const nytt = [...rensat.slice(0, i), ...block, ...rensat.slice(i)].join("\n");
  if (nytt !== t) { writeFileSync(p, nytt); andrade++; }
}
console.log(`Ordningpasset: ${andrade} filer omskrivna (kanonisk trippel i kedjeordning)`);

// ── 3. Efterkontroll: syntax + inga dubbletter ─────────────────────────────
import { execFileSync } from "node:child_process";
let fel = 0;
for (const f of readdirSync(VERK).filter((x) => /^testa-ai-mentor-.*\.mjs$/.test(x))) {
  try { execFileSync(process.execPath, ["--check", join(VERK, f)], { stdio: "pipe" }); }
  catch { fel++; console.log("SYNTFEL kvar: " + f); }
  const t = readFileSync(join(VERK, f), "utf8");
  for (const n of TRE) {
    const antal = (t.match(new RegExp(`"${n}"`, "g")) ?? []).length;
    if (HOPPA_OVER.has(f) || f === "testa-ai-mentor-multipel.mjs") continue;
    if (antal > 1) { fel++; console.log(`DUBBLETT ${n} ×${antal} i ${f}`); }
  }
}
console.log(fel === 0 ? "Efterkontroll: syntax OK · inga dubbletter ✓" : "Efterkontroll: " + fel + " fynd kvar");
