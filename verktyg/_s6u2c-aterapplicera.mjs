/**
 * _s6u2c-aterapplicera.mjs — idempotent återapplicering av pengarstid-
 * lagrets ÄNDRINGAR I VERKTYG/ efter lost-update-racer (två dokumenterade:
 * u3:s widget-skrivning 10:57 + en fullträds-återställning 11:07 under
 * s7-fönstrets pågående arbete). src/ berörs EJ här (Write/Edit-regeln) —
 * widgeten wireas separat.
 *
 * Kör: node verktyg/_s6u2c-aterapplicera.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
let rapport = [];

function fix(fil, namn, kontroller) {
  const vag = join(ROT, fil);
  let txt = readFileSync(vag, "utf8");
  const fore = txt;
  for (const [test, insattning] of kontroller) {
    if (!txt.includes(test)) continue; // test-redan-applicerat eller mönster borta
    txt = txt.replace(test, insattning);
  }
  if (txt !== fore) {
    writeFileSync(vag, txt);
    rapport.push("ÅTERAPPLICERAD: " + namn);
  } else {
    rapport.push("orörd (redan aktuell eller rent): " + namn);
  }
}

// 1. Kedjetestet: motordef + TOTALT-kommentar + antal-ord
fix("verktyg/testa-ai-mentor-kedja.mjs", "kedjetestet", [
  [
    `  { namn: "optionshantverk", fil: "ai-mentor-optionshantverk-fragor.ts", fn: "svaraLokaltOptionshantverk", arr: "OPTIONSHANTVERK_MONSTER", antal: 3 },`,
    `  { namn: "optionshantverk", fil: "ai-mentor-optionshantverk-fragor.ts", fn: "svaraLokaltOptionshantverk", arr: "OPTIONSHANTVERK_MONSTER", antal: 3 },
  // 2026-09-20 omgång 26: pengarstid (s6-u2 fönster 3, manifest
  // auto-s6-1789890903364 — pengarnas tid och ordning: andrahandsmarknaden
  // + sekvensrisken, 2 monsters). Aktiverar pe-05/pe-06/ib-05 + rp-05 ⇒
  // PRIVATE EQUITY & INVESTMENTBOLAG 13/13 OCH RISKHANTERING & PORTFÖLJ-
  // TEORI 14/14 fullt länkade (pe-06 + rp-05 födda samma dag av spår 5 —
  // rs-09-precedensen). 66:e motorn, efter optionshantverk, FÖRE
  // marknadsrytm (SIST). RACE-NOT: två föregående wiringar raderades av
  // lost-update (u3:s widget-skrivning 10:57 + återställning 11:07) —
  // detta är återappliceringen.
  { namn: "pengarstid", fil: "ai-mentor-pengarstid-fragor.ts", fn: "svaraLokaltPengarstid", arr: "PENGARSTID_MONSTER", antal: 2 },`,
  ],
  [
    `const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); // 179 (2026-09-20 omgång 26: optionshantverk +3`,
    `const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); // 181 (2026-09-20 omgång 26: pengarstid +2 — pengarnas tid och ordning: andrahandsmarknaden (pe-05 primär, källor pe-06 J-kurvan + ib-05 kostnadstrappan) + sekvensrisken (rp-05 primär, källor rp-04 + ek-04) (s6-u2 fönster 3, manifest auto-s6-1789890903364), aktiverar pe-05/pe-06/ib-05 + rp-05 = PRIVATE EQUITY & INVESTMENTBOLAG 13/13 + RISKHANTERING & PORTFÖLJTEORI 14/14, 66:e motorn FÖRE marknadsrytm som förblir SIST [66:e av 66]; optionshantverk +3`,
  ],
  [`"sextiofem motorer lämnar frågan ifred"`, `"sextiosex motorer lämnar frågan ifred"`],
]);

// 2. marknadsrytm-testet: kanda-listposten
fix("verktyg/testa-ai-mentor-marknadsrytm.mjs", "marknadsrytm kanda-listan", [
  [
    `            "svaraLokaltRiskadress",
            "svaraLokaltBalansdjup",
            "svaraLokaltOptionshantverk",
            "svaraLokaltMarknadsrytm",`,
    `            "svaraLokaltRiskadress",
            "svaraLokaltBalansdjup",
            "svaraLokaltOptionshantverk",
            // Omgång 26 (manifest auto-s6-1789890903364, s6-u2 fönster 3):
            // pengarstid — andrahandsmarknaden + sekvensrisken, 66:e motorn,
            // FÖRE detta lager (marknadsrytm förblir SIST). Dokumentationsplikten.
            "svaraLokaltPengarstid",
            "svaraLokaltMarknadsrytm",`,
  ],
  [`(62 dokumenterade)`, `(63 dokumenterade)`],
]);

// 3. case-testet: kedjekomponenter-listposten
fix("verktyg/testa-ai-mentor-case.mjs", "case komponentlistan", [
  [
    `    "svaraLokaltOptionshantverk(q, KURSREGISTER)",
    "svaraLokaltMarknadsrytm(q, KURSREGISTER)",`,
    `    "svaraLokaltOptionshantverk(q, KURSREGISTER)",
    // Omgång 26 (manifest auto-s6-1789890903364, s6-u2 fönster 3): pengarstid —
    // andrahandsmarknaden + sekvensrisken, 66:e motorn, FÖRE marknadsrytm.
    "svaraLokaltPengarstid(q, KURSREGISTER)",
    "svaraLokaltMarknadsrytm(q, KURSREGISTER)",`,
  ],
]);

// 4. multipel + optionshantverk L2-strängar (om de föll)
fix("verktyg/testa-ai-mentor-multipel.mjs", "multipel L2", [
  [
    `?? svaraLokaltOptionshantverk(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER);")`,
    `?? svaraLokaltOptionshantverk(q, KURSREGISTER) ?? svaraLokaltPengarstid(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER);")`,
  ],
]);
fix("verktyg/testa-ai-mentor-optionshantverk.mjs", "optionshantverk L2", [
  [
    `widget.includes("svaraLokaltOptionshantverk(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER)")`,
    `widget.includes("svaraLokaltOptionshantverk(q, KURSREGISTER) ?? svaraLokaltPengarstid(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER)")`,
  ],
]);

console.log(rapport.join("\n"));
