#!/usr/bin/env node
/**
 * FRONT B — bevis för pc-21/ek-02/am-06 (spår 5 u3 omgång 10, 2026-09-17).
 * Replikerar kategori-fortsättningsregeln (larvag.ts BAS 86 + nivåmatch +4)
 * med regelns EXAKTA filter mot den genererade kartan src/lib/larvag-karta.ts.
 * Motorkod orörd — läsreplik (v82/u1-omg5-mönstret). Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuten: +m[7] }));
const MINA = ["pc-21-ditt-forsta-case", "ek-02-labbets-karta", "am-06-kortlage-och-aktieutlaning"];
console.log(`karta: ${KARTA.length} kurser | pc-21: ${KARTA.filter(k => k.slug === MINA[0]).length} · ek-02: ${KARTA.filter(k => k.slug === MINA[1]).length} · am-06: ${KARTA.filter(k => k.slug === MINA[2]).length}`);

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

// (A) pc-21 — PRAKTISKA CASE-fulläsare (familjens samtliga 21 kurser klara, växande lästillstånd)
const PC_KLARA = [...KARTA_FORE.filter(k => k.kategori === "PRAKTISKA CASE").map(k => k.slug)];
const A_fore = regel3(PC_KLARA, KARTA_FORE, 0, "växande"), A_efter = regel3(PC_KLARA, KARTA, 0, "växande");
console.log(`\n(A) pc-21 — fulläst PRAKTISKA CASE-läsare [${PC_KLARA.length} kurser klara, växande lästillstånd]:`);
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(A_fore));
console.log("    EFTER:", JSON.stringify(A_efter));

// (B) ek-02 — EKOSYSTEM-fulläsare (familjens 5 kurser klara, avancerat lästillstånd)
const EK_KLARA = [...KARTA_FORE.filter(k => k.kategori === "EKOSYSTEM").map(k => k.slug)];
const B_fore = regel3(EK_KLARA, KARTA_FORE, 0, "avancerad"), B_efter = regel3(EK_KLARA, KARTA, 0, "avancerad");
console.log(`\n(B) ek-02 — fulläst EKOSYSTEM-läsare [${EK_KLARA.length} kurser klara, avancerat lästillstånd]:`);
console.log("    FÖRE :", B_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(B_fore));
console.log("    EFTER:", JSON.stringify(B_efter));

// (C) am-06 — AKTIEMARKNADEN I PRAKTIKEN-fulläsare (7 kurser klara, avancerat lästillstånd → nivåmatch +4)
const AM_KLARA = [...KARTA_FORE.filter(k => k.kategori === "AKTIEMARKNADEN I PRAKTIKEN").map(k => k.slug)];
const C_fore = regel3(AM_KLARA, KARTA_FORE, 0, "avancerad"), C_efter = regel3(AM_KLARA, KARTA, 0, "avancerad");
console.log(`\n(C) am-06 — fulläst AKTIEMARKNADEN I PRAKTIKEN-läsare [${AM_KLARA.length} kurser klara, avancerat lästillstånd]:`);
console.log("    FÖRE :", C_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(C_fore));
console.log("    EFTER:", JSON.stringify(C_efter));

// (D) KARTORDNING — delvis PRAKTISKA CASE-läsare (pc-01+pc-02 klara): första kandidat får INTE vara pc-21
//     (Nybörjare tränger inte framför tidigare kurser i kartordning)
const D = regel3(["pc-01-case-atlas-copco", "pc-02-case-astrazeneca"], KARTA);
console.log("\n(D) KARTORDNING — delvis PC-läsare [pc-01+pc-02]:", D ? `${D.slug} nomineras först (pc-21 tränger INTE framför tidigare kurser — korrekt motorbeteende)` : "ingen");

// (E) FÖRSVARSLÄGE — ny läsare (0 klara): regeln vilar
const E = regel3([], KARTA);
console.log("\n(E) FÖRSVARSLÄGE — ny läsare (0 klara):", E === null ? "regeln vilar — mina kurser tränger sig inte på" : "FEL: " + E.slug);

// (F) DETERMINISM
const F1 = JSON.stringify(regel3(PC_KLARA, KARTA)) + JSON.stringify(regel3(EK_KLARA, KARTA)) + JSON.stringify(regel3(AM_KLARA, KARTA));
const F2 = JSON.stringify(regel3(PC_KLARA, KARTA)) + JSON.stringify(regel3(EK_KLARA, KARTA)) + JSON.stringify(regel3(AM_KLARA, KARTA));
console.log("\n(F) DETERMINISM — två körningar identiska:", F1 === F2 ? "JA" : "NEJ — FEL");

const gron =
  A_fore === null && A_efter?.slug === MINA[0] && A_efter.poang === 86 && A_efter.varför.includes("Du är igång i praktiska case — 21 steg ligger bakom dig") &&
  B_fore === null && B_efter?.slug === MINA[1] && B_efter.poang === 86 && B_efter.varför.includes("Du är igång i ekosystem — 5 steg ligger bakom dig") &&
  C_fore === null && C_efter?.slug === MINA[2] && C_efter.poang === 90 && C_efter.varför.includes("Du är igång i aktiemarknaden i praktiken — 7 steg ligger bakom dig") &&
  D !== null && D.slug !== MINA[0] && E === null && F1 === F2;
console.log("\n═══ FRONT B " + (gron ? "GRÖN — 3/3 nominerade med genererade varför-rader, kartordning + försvarsläge + determinism korrekt" : "RÖD") + " ═══");
process.exit(gron ? 0 : 1);
