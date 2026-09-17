#!/usr/bin/env node
/**
 * FRONT B — bevis för ek-03 (spår 5 u1 omgång 11, 2026-09-17).
 * Replikerar kategori-fortsättningsregeln (larvag.ts BAS 86 + nivåmatch +4)
 * med regelns EXAKTA filter mot den genererade kartan src/lib/larvag-karta.ts.
 * Motorkod orörd — läsreplik (v82/u1-omg5-mönstret). Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuten: +m[7] }));
const MIN = "ek-03-arbetsflodet-i-labbet";
const minKurs = KARTA.find(k => k.slug === MIN);
console.log(`karta: ${KARTA.length} kurser | ek-03: ${minKurs ? `niva ${minKurs.niva}, kraverFas ${minKurs.kraverFas}, vIndex ${minKurs.vIndex}` : "SAKNAS"}`);

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

const KARTA_FORE = KARTA.filter((k) => k.slug !== MIN);

// (A) ek-03 — EKOSYSTEM-fulläsare (familjens 6 övriga kurser klara, växande lästillstånd → nivåmatch +4)
const EK_KLARA = [...KARTA_FORE.filter(k => k.kategori === "EKOSYSTEM").map(k => k.slug)];
const A_fore = regel3(EK_KLARA, KARTA_FORE, 0, "växande"), A_efter = regel3(EK_KLARA, KARTA, 0, "växande");
console.log(`\n(A) ek-03 — fulläst EKOSYSTEM-läsare [${EK_KLARA.length} kurser klara, växande lästillstånd]:`);
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(A_fore));
console.log("    EFTER:", JSON.stringify(A_efter));

// (B) nivåpars: avancerat lästillstånd (målnivå 3) → ingen nivåmatch med Intermediär → 86 poäng
const B_efter = regel3(EK_KLARA, KARTA, 0, "avancerad");
console.log(`\n(B) nivåpars — samma läsare med avancerat lästillstånd (målnivå 3):`, JSON.stringify(B_efter ? { slug: B_efter.slug, poang: B_efter.poang } : null));

// (C) KARTORDNING — delvis EKOSYSTEM-läsare (akm1 + ek-01 klara): första kandidat får INTE vara ek-03
//     (ny kurs tränger inte framför tidigare kurser i kartordning)
const C = regel3(["akm1-den-kontroversiella-modellen", "ek-01-sam-viktningen"], KARTA);
console.log("\n(C) KARTORDNING — delvis EKOSYSTEM-läsare [akm1+ek-01]:", C ? `${C.slug} nomineras först (ek-03 tränger INTE framför tidigare kurser — korrekt motorbeteende)` : "ingen");

// (D) FÖRSVARSLÄGE — ny läsare (0 klara): regeln vilar
const D = regel3([], KARTA);
console.log("\n(D) FÖRSVARSLÄGE — ny läsare (0 klara):", D === null ? "regeln vilar — min kurs tränger sig inte på" : "FEL: " + D.slug);

// (E) DETERMINISM
const E1 = JSON.stringify(regel3(EK_KLARA, KARTA));
const E2 = JSON.stringify(regel3(EK_KLARA, KARTA));
console.log("\n(E) DETERMINISM — två körningar identiska:", E1 === E2 ? "JA" : "NEJ — FEL");

const gron =
  minKurs !== undefined && minKurs.niva === 2 && minKurs.kraverFas === 0 &&
  A_fore === null && A_efter?.slug === MIN && A_efter.poang === 90 && A_efter.steg === 6 &&
  A_efter.varför.includes("Du är igång i ekosystem — 6 steg ligger bakom dig") &&
  B_efter?.slug === MIN && B_efter.poang === 86 &&
  C !== null && C.slug !== MIN && D === null && E1 === E2;
console.log("\n═══ FRONT B " + (gron ? "GRÖN — ek-03 nominerad med genererad varför-rad (nivåmatch +4), nivåpars 90/86, kartordning + försvarsläge + determinism korrekt" : "RÖD") + " ═══");
process.exit(gron ? 0 : 1);
