#!/usr/bin/env node
/**
 * FRONT B — bevis för pe-03/mt-04 (spår 5 u2 omgång 11, 2026-09-17).
 * Replikerar kategori-fortsättningsregeln (larvag.ts BAS 86 + nivåmatch +4)
 * med regelns EXAKTA filter mot den genererade kartan src/lib/larvag-karta.ts.
 * Motorkod orörd — läsreplik (v82/u1-omg5-mönstret). Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuten: +m[7] }));
const MINA = ["pe-03-forvarvsmaskinen", "mt-04-vallgravens-fodelse"];
console.log(`karta: ${KARTA.length} kurser | pe-03: ${KARTA.filter(k => k.slug === MINA[0]).length} · mt-04: ${KARTA.filter(k => k.slug === MINA[1]).length}`);

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

// (A) pe-03 — PRIVATE EQUITY & INVESTMENTBOLAG-fulläsare (familjens 5 kurser klara, växande lästillstånd → nivåmatch +4)
const PE_KLARA = [...KARTA_FORE.filter(k => k.kategori === "PRIVATE EQUITY & INVESTMENTBOLAG").map(k => k.slug)];
const A_fore = regel3(PE_KLARA, KARTA_FORE, 0, "växande"), A_efter = regel3(PE_KLARA, KARTA, 0, "växande");
console.log(`\n(A) pe-03 — fulläst PRIVATE EQUITY & INVESTMENTBOLAG-läsare [${PE_KLARA.length} kurser klara, växande lästillstånd]:`);
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(A_fore));
console.log("    EFTER:", JSON.stringify(A_efter));

// (B) mt-04 — MOAT-fulläsare (familjens 6 kurser klara, växande lästillstånd → nivåmatch +4)
const MT_KLARA = [...KARTA_FORE.filter(k => k.kategori === "MOAT").map(k => k.slug)];
const B_fore = regel3(MT_KLARA, KARTA_FORE, 0, "växande"), B_efter = regel3(MT_KLARA, KARTA, 0, "växande");
console.log(`\n(B) mt-04 — fulläst MOAT-läsare [${MT_KLARA.length} kurser klara, växande lästillstånd]:`);
console.log("    FÖRE :", B_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(B_fore));
console.log("    EFTER:", JSON.stringify(B_efter));

// (C) MOAT-delvisläsare (mt-01..03 klara, växande): första kandidat = v13 i kartordning — mt-04 tränger INTE framför
const C = regel3(["mt-01-vad-ar-en-moat", "mt-02-moat-erosion-och-vallgravstest", "mt-03-vallgraven-i-siffror"], KARTA, 0, "växande");
console.log("\n(C) KARTORDNING — delvis MOAT-läsare [mt-01..03]:", C ? `${C.slug} nomineras först (mt-04 tränger INTE framför tidigare kurser — korrekt motorbeteende)` : "ingen");

// (D) FÖRSVARSLÄGE — ny läsare (0 klara): regeln vilar
const D = regel3([], KARTA);
console.log("\n(D) FÖRSVARSLÄGE — ny läsare (0 klara):", D === null ? "regeln vilar — mina kurser tränger sig inte på" : "FEL: " + D.slug);

// (E) DETERMINISM
const E1 = JSON.stringify(regel3(PE_KLARA, KARTA)) + JSON.stringify(regel3(MT_KLARA, KARTA));
const E2 = JSON.stringify(regel3(PE_KLARA, KARTA)) + JSON.stringify(regel3(MT_KLARA, KARTA));
console.log("\n(E) DETERMINISM — två körningar identiska:", E1 === E2 ? "JA" : "NEJ — FEL");

const gron =
  A_fore === null && A_efter?.slug === MINA[0] && A_efter.poang === 90 && A_efter.varför.includes("Du är igång i private equity & investmentbolag — 5 steg ligger bakom dig") &&
  B_fore === null && B_efter?.slug === MINA[1] && B_efter.poang === 90 && B_efter.varför.includes("Du är igång i moat — 6 steg ligger bakom dig") &&
  C !== null && C.slug !== MINA[1] && D === null && E1 === E2;
console.log("\n═══ FRONT B " + (gron ? "GRÖN — 2/2 nominerade med genererade varför-rader, kartordning + försvarsläge + determinism korrekt" : "RÖD") + " ═══");
process.exit(gron ? 0 : 1);
