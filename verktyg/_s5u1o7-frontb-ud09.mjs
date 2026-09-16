#!/usr/bin/env node
/**
 * FRONT B — bevis för ud-09-utdelningens-hallbarhet (spår 5 u1 omgång 7, 2026-09-16).
 * Replikerar kategori-fortsättningsregeln (larvag.ts BAS 86) med regelns EXAKTA
 * filter + poäng (nivåmatch +4) mot den genererade kartan src/lib/larvag-karta.ts.
 * Motorkod orörd — läsreplik (v82/u1-omg5/u3-omg6-mönstret).
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] }));
const MIN_SLUG = "ud-09-utdelningens-hallbarhet";
console.log(`karta: ${KARTA.length} kurser | ${MIN_SLUG}: ${KARTA.filter((k) => k.slug === MIN_SLUG).length} (niva ${KARTA.find((k) => k.slug === MIN_SLUG)?.niva}, kraverFas ${KARTA.find((k) => k.slug === MIN_SLUG)?.kraverFas}, vIndex ${KARTA.find((k) => k.slug === MIN_SLUG)?.vIndex})`);

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

const KARTA_FORE = KARTA.filter((k) => k.slug !== MIN_SLUG);
const UD_KLARA = [
  "km-063-direktavkastning", "km-064-utdelningstillvaxt", "km-065-dogs-of-the-dow", "km-066-utdelning-vs-aterkop",
  "ud-01-payout-ratio", "ud-02-aterinvestering", "ud-03-dividend-aristocrats", "ud-04-utdelningsfallor",
  "ud-05-drip", "ud-06-svenska-utdelningsaktier", "ud-07-utdelningskalender", "ud-08-speciella-utdelningar",
];
console.log(`UD-familjen i karta: ${KARTA.filter((k) => k.kategori === "UTDELNINGSSTRATEGI").length} kurser (12 klara i scenariot + ud-09)`);

const A_fore = regel3(UD_KLARA, KARTA_FORE), A_efter = regel3(UD_KLARA, KARTA);
console.log("\n(A) ud-09 — fullläst UTDELNINGSSTRATEGI-läsare [12 kurser klara]:");
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(A_fore));
console.log("    EFTER:", JSON.stringify(A_efter));

const B_efter = regel3(UD_KLARA, KARTA, 0, "avancerad");
console.log("\n(B) NIVÅMATCH — samma läsare i avancerat lästillstånd:", B_efter ? `${B_efter.slug} poäng ${B_efter.poang} (86 BAS + 4 nivåmatch, vIndex −1 = inget V-plus)` : "ingen");

const C = regel3(["km-063-direktavkastning", "ud-01-payout-ratio", "km-064-utdelningstillvaxt"], KARTA);
console.log("\n(C) KARTORDNING — delvis UD-läsare [km-063+ud-01+km-064]:", C ? `${C.slug} nomineras först (ud-09 tränger INTE framför tidigare kurser — korrekt motorbeteende)` : "ingen");

const D = regel3([], KARTA);
console.log("\n(D) FÖRSVARSLÄGE — ny läsare (0 klara):", D === null ? "regeln vilar — ud-09 tränger sig inte på" : "FEL: " + D.slug);

const E1 = JSON.stringify(regel3(UD_KLARA, KARTA)) + JSON.stringify(regel3(UD_KLARA, KARTA, 0, "avancerad"));
const E2 = JSON.stringify(regel3(UD_KLARA, KARTA)) + JSON.stringify(regel3(UD_KLARA, KARTA, 0, "avancerad"));
console.log("\n(E) DETERMINISM — två körningar identiska:", E1 === E2 ? "JA" : "NEJ — FEL");

const niva3pool_fore = KARTA_FORE.filter((k) => k.kategori === "UTDELNINGSSTRATEGI" && k.niva === 3).length;
const niva3pool_efter = KARTA.filter((k) => k.kategori === "UTDELNINGSSTRATEGI" && k.niva === 3).length;
console.log(`\n(F) NIVÅ-STEGSPOOL — UD Avancerad-kandidater: ${niva3pool_fore} → ${niva3pool_efter} (BAS 62 nominerbara i malniva-läget)`);

const gron =
  A_fore === null &&
  A_efter?.slug === MIN_SLUG &&
  A_efter.varför.includes("Du är igång i utdelningsstrategi — 12 steg ligger bakom dig") &&
  A_efter.poang === 86 &&
  B_efter?.slug === MIN_SLUG && B_efter.poang === 90 &&
  C && C.slug !== MIN_SLUG &&
  D === null && E1 === E2 &&
  niva3pool_fore === 0 && niva3pool_efter === 1;
console.log(`\nFRONT B: ${gron ? "GRÖN — 6/6" : "RÖD"}`);
process.exit(gron ? 0 : 1);
