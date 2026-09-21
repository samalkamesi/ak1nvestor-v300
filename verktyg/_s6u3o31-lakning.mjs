/**
 * LÄKNING (s6-u3, fönster 31): fem föråldrade svitförväntningar botas —
 * exponerade av fönstrets kedjetillväxt och spår 5:s register rebake,
 * alla med attribution. Idempotent.
 * 1. warrant K03 476 → 483 (registret växte 479→483 via spår 5 omgång 25)
 * 2. avkastningskurva K03 476 → 483 (samma)
 * 3. multipel L2 — kedjesubsträng utökad med fönster 31:s tre motorer
 * 4. optionshantverk D2 — OPTIONS & DERIVAT 12 → 13 (od-09 försäkringsskrivandet,
 *    spår 5-kurs 2026-09-20, mentorväglös 12/13)
 * 5. bokmastar G2 — dokumenterad kedjesäker skuggning undantas (bokmastaren
 *    motor 50 FÖRE beteendefallor 76: widgetkedjan ger alltid bokmastarens
 *    svar på «vad är merger arbitrage?» — etfmekanikens reservation av naket
 *    «arbitrage» åt bf-13-lagret gör paret oundvikligt och kedjeordningen
 *    gör det harmlöst)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const V = "/home/ak1a/AK1/verktyg";
let n = 0;
function fixa(fil, gammal, ny) {
  const sok = join(V, fil);
  let t = readFileSync(sok, "utf8");
  if (t.includes(ny)) { console.log("redan läkt: " + fil); return; }
  if (!t.includes(gammal)) { console.log("ANKAR SAKNAS i " + fil + " — MANUELL GRANSKNING"); process.exitCode = 1; return; }
  t = t.replace(gammal, ny);
  writeFileSync(sok, t);
  n++;
  console.log("läkt: " + fil);
}

// 1+2: K03-registerkonstanten 476 → 483 (båda filerna har identiskt block)
for (const fil of ["testa-ai-mentor-warrant.mjs", "testa-ai-mentor-avkastningskurva.mjs"]) {
  fixa(
    fil,
    `    KURSREGISTER.length === 476,`,
    `    // Fönster 31 (s6-u3, _s6u3o31-): 476→483 — spår 5:s omgång 25 (2026-09-21:
    // bf-17/od-09/kt-09 479→482 + se-23 stålsektorn 482→483) växte registret;
    // E01-grunden (registrets äkthet) oförändrad — konstanten följer registret.
    KURSREGISTER.length === 483,`,
  );
}

// 3: multipel L2 — substrängen speglar fönster 31:s tre motorer
fixa(
  "testa-ai-mentor-multipel.mjs",
  `?? svaraLokaltKemisektor(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER);"));`,
  `?? svaraLokaltKemisektor(q, KURSREGISTER) ?? svaraLokaltStalsektor(q, KURSREGISTER) ?? svaraLokaltCasepraktik(q, KURSREGISTER) ?? svaraLokaltBeteendefallor(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER);"));
  // Fönster 31 (s6-u3, _s6u3o31-): u1 stålsektor + u2 casepraktik + u3
  // beteendefallor wireades mellan kemisektor och marknadsrytm — substrängen
  // speglar kedjan (harmoniseringens dokumentationsplikt).`,
);

// 4: optionshantverk D2 — kategorin växte 12 → 13
fixa(
  "testa-ai-mentor-optionshantverk.mjs",
  "ok(`D2 registerdrivet tal (OPTIONS & DERIVAT ${od} — alla 12 ska vara nådda)`, od === 12 && sBin.text.includes(`(${od} kurser)`));",
  "// Fönster 31 (s6-u3, _s6u3o31-): 12 → 13 — spår 5 födde od-09\n// försäkringsskrivandet 2026-09-20 (mentorväglös; kategorin 12/13 nådda).\nok(`D2 registerdrivet tal (OPTIONS & DERIVAT ${od} — 12 nådda, od-09 mentorväglös)`, od === 13 && sBin.text.includes(`(${od} kurser)`));",
);

// 6: optionshantverk L2 — samma substrängsutökning som multipel (fönster 31:s tre motorer)
fixa(
  "testa-ai-mentor-optionshantverk.mjs",
  `?? svaraLokaltKemisektor(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER)"));`,
  `?? svaraLokaltKemisektor(q, KURSREGISTER) ?? svaraLokaltStalsektor(q, KURSREGISTER) ?? svaraLokaltCasepraktik(q, KURSREGISTER) ?? svaraLokaltBeteendefallor(q, KURSREGISTER) ?? svaraLokaltMarknadsrytm(q, KURSREGISTER);"));
  // Fönster 31 (s6-u3, _s6u3o31-): u1 stålsektor + u2 casepraktik + u3
  // beteendefallor mellan kemisektor och marknadsrytm — substrängen följer.`,
);

// 7: marknadsrytm L01-kanda — fönster 31:s tre motorer dokumenteras (deras
//    SIST-vakt listar kända komponenter; nya lager måste bokföras där)
fixa(
  "testa-ai-mentor-marknadsrytm.mjs",
  `  const kanda = new Set([
    "svaraLokaltMakro", "svaraLokaltExtra", "svaraLokaltModernaRisker", "svaraLokalt", "svaraLokaltNasta",`,
  `  const kanda = new Set([
    // Fönster 31 (s6-u3, _s6u3o31-): fönstrets tre nya komponenter FÖRE denna
    // motor — u1 stålsektor (74:e) · u2 casepraktik (75:e) · u3 beteendefallor
    // (76:e); SIST-invarianten orörd (marknadsrytm förblir sist).
    "svaraLokaltStalsektor", "svaraLokaltCasepraktik", "svaraLokaltBeteendefallor",
    "svaraLokaltMakro", "svaraLokaltExtra", "svaraLokaltModernaRisker", "svaraLokalt", "svaraLokaltNasta",`,
);

// 5: bokmastar G2 — undantag för den dokumenterade kedjesäkra skuggningen
{
  const fil = "testa-ai-mentor-bokmastar.mjs";
  const sok = join(V, fil);
  let t = readFileSync(sok, "utf8");
  const gammal = `  const fynd = [];
  for (const q of MINA_KANONISKA) {
    for (const sys of SYSKON) {
      try { if (sys.fnk(q, KURSREGISTER) !== null) fynd.push(q + " → " + sys.fn); } catch { /* ignore */ }
    }
  }`;
  const ny = `  const fynd = [];
  // Fönster 31 (s6-u3, _s6u3o31-): DOKUMENTERAD KEDJESÄKER SKUGGNING —
  // beteendefallor-lagret (motor 76, EFTER bokmastaren motor 50) äger naket
  // «arbitrage» (etfmekanikens reservation åt bf-13) och träffar därmed även
  // «vad är merger arbitrage?» fristående — men widgetkedjen ger BOKMASTARENS
  // svar (motorerna före vinner). Paret undantas; övriga syskon förblir noll.
  const undantagna = new Set(["vad är merger arbitrage? → svaraLokaltBeteendefallor"]);
  for (const q of MINA_KANONISKA) {
    for (const sys of SYSKON) {
      try {
        if (sys.fnk(q, KURSREGISTER) !== null) {
          const f = q + " → " + sys.fn;
          if (!undantagna.has(f)) fynd.push(f);
        }
      } catch { /* ignore */ }
    }
  }`;
  if (t.includes(ny)) console.log("redan läkt: " + fil);
  else if (!t.includes(gammal)) { console.log("ANKAR SAKNAS i " + fil); process.exitCode = 1; }
  else { t = t.replace(gammal, ny); writeFileSync(sok, t); n++; console.log("läkt: " + fil); }
}

console.log("Totalt läkta: " + n);
