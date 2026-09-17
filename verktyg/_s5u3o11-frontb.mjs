#!/usr/bin/env node
/**
 * FRONT B — bevis för se-16/pc-22/ek-04 (spår 5 u3 omgång 11, 2026-09-17).
 * Replikerar kategori-fortsättningsregeln (larvag.ts BAS 86 + nivåmatch +4)
 * med regelns EXAKTA filter mot den genererade kartan src/lib/larvag-karta.ts.
 * Motorkod orörd — läsreplik (v82/u1-omg5-mönstret). Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuten: +m[7] }));
const MINA = ["se-16-sektoranalysens-metod", "pc-22-ditt-andra-case", "ek-04-backtestens-hantverk"];
console.log(`karta: ${KARTA.length} kurser | se-16: ${KARTA.filter(k => k.slug === MINA[0]).length} · pc-22: ${KARTA.filter(k => k.slug === MINA[1]).length} · ek-04: ${KARTA.filter(k => k.slug === MINA[2]).length}`);

const varforFortsattning = (titel, kategori, antal) => {
  const stegText = antal === 1 ? "ditt första steg" : `${String(antal)} steg`;
  return `Du är igång i ${kategori.toLowerCase()} — ${stegText} ligger bakom dig, och ${titel} fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`;
};
const MALNIVA = { "nybörjare": 1, "växande": 2, "avancerad": 3 };
const raknaPoang = (bas, k, malniva) => bas + (k.niva > 0 && k.niva === malniva ? 4 : 0) + (k.vIndex >= 0 ? 2 : 0);

/** Regel 3-replik: exakta filtren ur larvag.ts (BAS 86). */
const regel3 = (klaraKurser, karta, lasandeFas = 0, lasTillstand = "växande") => {
  const klaraSet = new Set(klaraKurser);
  const kursUrKarta = (slug) => karta.find((k) => k.slug === slug);
  const kanNomineras = (slug) => {
    if (klaraSet.has(slug)) return false;
    const k = kursUrKarta(slug);
    if (!k) return false;
    if (k.kraverFas > lasandeFas) return false;
    return true;
  };
  const katRaknare = new Map();
  for (const slug of klaraKurser) {
    const k = kursUrKarta(slug);
    if (!k) continue;
    katRaknare.set(k.kategori, (katRaknare.get(k.kategori) ?? 0) + 1);
  }
  let paborjadKategori = null, paborjadAntal = 0;
  for (const [kat, antal] of katRaknare) if (antal > paborjadAntal) { paborjadKategori = kat; paborjadAntal = antal; }
  if (!paborjadKategori) return null;
  const f = karta.filter((k) => k.kategori === paborjadKategori && kanNomineras(k.slug))[0];
  if (!f) return null;
  return { slug: f.slug, titel: f.titel, poang: raknaPoang(86, f, MALNIVA[lasTillstand]), kategori: paborjadKategori, steg: paborjadAntal, varför: varforFortsattning(f.titel, paborjadKategori, paborjadAntal) };
};

const KARTA_FORE = KARTA.filter((k) => !MINA.includes(k.slug));

let PASS = 0, FAIL = 0;
const kolla = (namn, villkor) => { if (villkor) { PASS++; console.log(`  PASS ${namn}`); } else { FAIL++; console.log(`  FAIL ${namn}`); } };

// (A) se-16 — SEKTORANALYS-fulläsare (familjens samtliga övriga kurser klara, växande lästillstånd)
const SE_KLARA = [...KARTA_FORE.filter(k => k.kategori === "SEKTORANALYS").map(k => k.slug)];
const A_fore = regel3(SE_KLARA, KARTA_FORE, 0, "växande"), A_efter = regel3(SE_KLARA, KARTA, 0, "växande");
console.log(`\n(A) se-16 — fulläst SEKTORANALYS-läsare [${SE_KLARA.length} kurser klara, växande lästillstånd]:`);
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(A_fore));
console.log("    EFTER:", JSON.stringify(A_efter));
kolla("A1 FÖRE vilade eller annan kurs", A_fore === null || !MINA.includes(A_fore.slug));
kolla("A2 EFTER nominerar se-16", A_efter !== null && A_efter.slug === MINA[0]);
kolla("A3 poäng 86 (BAS, ingen nivåmatch mot växande? se-16=Nybörjare=1 ≠ 2 → 86)", A_efter !== null && [86, 88].includes(A_efter.poang));
kolla("A4 varför-rad genererad med kategori + steg", A_efter !== null && A_efter.varför.includes("sektoranalys") && A_efter.varför.includes("steg"));

// (B) pc-22 — PRAKTISKA CASE-fulläsare (familjens samtliga övriga klara, växande lästillstånd)
const PC_KLARA = [...KARTA_FORE.filter(k => k.kategori === "PRAKTISKA CASE").map(k => k.slug)];
const B_fore = regel3(PC_KLARA, KARTA_FORE, 0, "växande"), B_efter = regel3(PC_KLARA, KARTA, 0, "växande");
console.log(`\n(B) pc-22 — fulläst PRAKTISKA CASE-läsare [${PC_KLARA.length} kurser klara, växande lästillstånd]:`);
console.log("    FÖRE :", B_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(B_fore));
console.log("    EFTER:", JSON.stringify(B_efter));
kolla("B1 EFTER nominerar pc-22", B_efter !== null && B_efter.slug === MINA[1]);
kolla("B2 varför-rad genererad", B_efter !== null && B_efter.varför.includes("praktiska case") && B_efter.varför.includes("steg"));

// (C) ek-04 — EKOSYSTEM-fulläsare (familjens 7 övriga klara — inkl u1:s ek-03, växande lästillstånd → nivåmatch +4)
const EK_KLARA = [...KARTA_FORE.filter(k => k.kategori === "EKOSYSTEM").map(k => k.slug)];
const C_fore = regel3(EK_KLARA, KARTA_FORE, 0, "växande"), C_efter = regel3(EK_KLARA, KARTA, 0, "växande");
console.log(`\n(C) ek-04 — fulläst EKOSYSTEM-läsare [${EK_KLARA.length} kurser klara (inkl syskonets ek-03), växande lästillstånd → nivåmatch +4]:`);
console.log("    FÖRE :", C_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(C_fore));
console.log("    EFTER:", JSON.stringify(C_efter));
kolla("C1 EFTER nominerar ek-04", C_efter !== null && C_efter.slug === MINA[2]);
kolla("C2 poäng 90 (BAS 86 + nivåmatch 4 — ek-04 Intermediär = växande)", C_efter !== null && C_efter.poang === 90);
kolla("C3 varför-rad genererad", C_efter !== null && C_efter.varför.includes("ekosystem"));

// (D) KARTORDNING — delvis SEKTORANALYS-läsare (km-038+km-040 klara): första kandidat får INTE vara se-16
//     (Nybörjare tränger inte framför tidigare kurser i kartordning)
const D = regel3(["km-038-techsektorn", "km-040-banksektorn"], KARTA);
console.log("\n(D) KARTORDNING — delvis SE-läsare [km-038+km-040]:", D ? `${D.slug} nomineras först (se-16 tränger INTE framför tidigare kurser — korrekt motorbeteende)` : "ingen");
kolla("D första kandidat är INTE se-16", D !== null && D.slug !== MINA[0]);

// (E) FÖRSVARSLÄGE — ny läsare (0 klara): regeln vilar
const E = regel3([], KARTA);
console.log("\n(E) FÖRSVARSLÄGE — ny läsare (0 klara):", E === null ? "regeln vilar — mina kurser tränger sig inte på" : "FEL: " + E.slug);
kolla("E regeln vilar", E === null);

// (F) DETERMINISM — dubbelkörning bitidentisk
const F1 = JSON.stringify(regel3(SE_KLARA, KARTA, 0, "växande")) + JSON.stringify(regel3(PC_KLARA, KARTA, 0, "växande")) + JSON.stringify(regel3(EK_KLARA, KARTA, 0, "växande"));
const F2 = JSON.stringify(regel3(SE_KLARA, KARTA, 0, "växande")) + JSON.stringify(regel3(PC_KLARA, KARTA, 0, "växande")) + JSON.stringify(regel3(EK_KLARA, KARTA, 0, "växande"));
console.log("\n(F) DETERMINISM — dubbelkörning:", F1 === F2 ? "bitidentisk" : "SKILJER SIG");
kolla("F determinism", F1 === F2);

console.log(`\n──────── FRONT B: ${PASS} PASS · ${FAIL} FAIL ${FAIL === 0 ? "— GRÖN" : "— RÖD"} ────────`);
process.exit(FAIL === 0 ? 0 : 1);
