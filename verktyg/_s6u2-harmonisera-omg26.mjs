#!/usr/bin/env node
// Svitharmonisering omgång 26 (s6-u2, manifest auto-s6-1789890903364):
// komponentlistorna i syskontesterna bär fönstrets två nya motorer —
// u1:s riskadress (62:a) + detta lagers balansdjup (63:e) — i kedjeordning
// före marknadsrytm (deras SIST-deklaration). Multipel-precedensen: äldre
// testernas «okänd kedjekomponent»-grind kräver dokumentation per ny motor.
// Rider också multipelns L2-exaktsträng (deras test vaktar kompositionen
// multipel → marknadsrytm; fönstrets två led emellan dokumenteras här).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const VERK = join(ROT, "verktyg");

const P1 = `"svaraLokaltMultipel",\n  "svaraLokaltMarknadsrytm",];`;
const P1_NY = `"svaraLokaltMultipel",\n  // Omgång 26-tillägg (manifest auto-s6-1789890903364): fönstrets två motorer i\n  // kedjeordning — riskadress (s6-u1, 62:a) + balansdjup (s6-u2, 63:e) — FÖRE\n  // marknadsrytm (deras SIST-deklaration; bk-07 + bk-06, BOKFÖRING 19/19).\n  "svaraLokaltRiskadress",\n  "svaraLokaltBalansdjup",\n  "svaraLokaltMarknadsrytm",];`;
const P1B = `"svaraLokaltMultipel",\n    "svaraLokaltMarknadsrytm",];`;
const P1B_NY = `"svaraLokaltMultipel",\n    // Omgång 26-tillägg (manifest auto-s6-1789890903364): riskadress (s6-u1) +\n    // balansdjup (s6-u2) i kedjeordning, FÖRE marknadsrytm (deras SIST).\n    "svaraLokaltRiskadress",\n    "svaraLokaltBalansdjup",\n    "svaraLokaltMarknadsrytm",];`;
const P2 = `"svaraLokaltRiskadress",\n  "svaraLokaltMarknadsrytm",];`;
const P2_NY = `"svaraLokaltRiskadress",\n  // Omgång 26-tillägg (s6-u2): balansdjup 63:e i kedjeordning, FÖRE marknadsrytm.\n  "svaraLokaltBalansdjup",\n  "svaraLokaltMarknadsrytm",];`;
// marknadsrytm-egens test: Set-konstruktor med 4-space indrag
const P3 = `"svaraLokaltMultipel",\n    "svaraLokaltMarknadsrytm",\n  ]);`;
const P3_NY = `"svaraLokaltMultipel",\n    // Omgång 26-tillägg (manifest auto-s6-1789890903364): riskadress (s6-u1) +\n    // balansdjup (s6-u2) — FÖRE detta lager (marknadsrytm förblir SIST).\n    "svaraLokaltRiskadress",\n    "svaraLokaltBalansdjup",\n    "svaraLokaltMarknadsrytm",\n  ]);`;
// multipelns L2-exaktsträng (kompositionen kontrahent → multipel → marknadsrytm)
const P4 = `widget.includes("svaraLokaltKontrahent(q, KURSREGISTER) ?? svaraLokaltMultipel(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER);")`;
const P4_NY = `widget.includes("svaraLokaltKontrahent(q, KURSREGISTER) ?? svaraLokaltMultipel(q, KURSREGISTER) ?? svaraLokaltRiskadress(q, KURSREGISTER) ?? svaraLokaltBalansdjup(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER);")`;

let p1 = 0, p1b = 0, p2 = 0, p3 = 0, p4 = 0, redan = 0;
for (const f of readdirSync(VERK).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f))) {
  const sokvag = join(VERK, f);
  let txt = readFileSync(sokvag, "utf8");
  const orig = txt;
  if (txt.includes(P1)) { txt = txt.split(P1).join(P1_NY); p1++; }
  else if (txt.includes(P1B)) { txt = txt.split(P1B).join(P1B_NY); p1b++; }
  else if (txt.includes(P2)) { txt = txt.split(P2).join(P2_NY); p2++; }
  if (txt.includes(P3)) { txt = txt.split(P3).join(P3_NY); p3++; }
  if (txt.includes(P4)) { txt = txt.split(P4).join(P4_NY); p4++; }
  if (txt === orig && /svaraLokaltBalansdjup/.test(txt) && !/^testa-ai-mentor-balansdjup\.mjs$/.test(f)) redan++;
  if (txt !== orig) writeFileSync(sokvag, txt);
}
console.log(`P1 (2-space): ${p1} · P1b (4-space): ${p1b} · P2 (riskadress→marknadsrytm): ${p2} · P3 (Set-indrag): ${p3} · P4 (multipel L2-sträng): ${p4} · redan harmoniserade med balansdjup: ${redan}`);

// Efterlägeskontroll: inget syskontest ska längre sakna de nya komponenterna
const saknar = [];
for (const f of readdirSync(VERK).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f) && f !== "testa-ai-mentor-balansdjup.mjs")) {
  const txt = readFileSync(join(VERK, f), "utf8");
  if (txt.includes('"svaraLokaltMarknadsrytm"') && !txt.includes("svaraLokaltBalansdjup")) saknar.push(f);
}
console.log(saknar.length ? "SAKNAR BALANSDJUP: " + saknar.join(", ") : "Efterläge: samtliga marknadsrytm-nämnande test bär balansdjup ✓");
