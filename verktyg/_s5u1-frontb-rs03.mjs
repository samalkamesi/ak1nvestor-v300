#!/usr/bin/env node
/**
 * FRONT B — bevis för rs-03-dold-samvariation (spår 5 u1, 2026-09-16).
 * Replikerar kategori-fortsättningsregeln (larvag.ts:308-341, BAS 86) med
 * regelns EXAKTA filter mot den genererade kartan src/lib/larvag-karta.ts.
 * Motorkod orörd — detta är en läsreplik, ingen import (tilläggslösa
 * TS-importer kan inte lösas av node, dokumenterat i bygg-larvag-karta.ts).
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] }));
console.log(`karta: ${KARTA.length} kurser (varav med rs-03: ${KARTA.filter(k => k.slug === "rs-03-dold-samvariation").length})`);

/** varforFortsattning — ordagrann replik ur larvag.ts:202-205. */
const varforFortsattning = (titel, kategori, antal) => {
  const stegText = antal === 1 ? "ditt första steg" : `${String(antal)} steg`;
  return `Du är igång i ${kategori.toLowerCase()} — ${stegText} ligger bakom dig, och ${titel} fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`;
};

/** Regel 3-replik: exakta filtren ur larvag.ts:308-341 (BAS 86). */
const regel3 = (klaraKurser, karta, lasandeFas = 0, exkludera = undefined) => {
  const klaraSet = new Set(klaraKurser);
  const kursUrKarta = (slug) => karta.find((k) => k.slug === slug);
  const kanNomineras = (slug) => {
    if (!slug || slug === exkludera || klaraSet.has(slug)) return false;
    const k = kursUrKarta(slug);
    if (!k) return false;
    if (k.kraverFas > lasandeFas) return false; // hårt fas-filter
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
  const fortsattning = karta.filter((k) => k.kategori === paborjadKategori && kanNomineras(k.slug))[0];
  if (!fortsattning) return null;
  return { slug: fortsattning.slug, titel: fortsattning.titel, kategori: paborjadKategori, steg: paborjadAntal, varför: varforFortsattning(fortsattning.titel, paborjadKategori, paborjadAntal) };
};

const RISK_KLARA = ["v19-kapitalforbranning", "rs-01-volatilitet-och-risk", "rs-02-kundkoncentration"];
const KARTA_FORE = KARTA.filter((k) => k.slug !== "rs-03-dold-samvariation"); // FÖRE = kartan utan rs-03 (git diff: endast rs-03-raden tillkom)

const A_fore = regel3(RISK_KLARA, KARTA_FORE);
const A_efter = regel3(RISK_KLARA, KARTA);
console.log("\n(A) HUVUDBEVIS — fullläst riskläsare [v19+rs-01+rs-02 klara]:");
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(A_fore));
console.log("    EFTER:", JSON.stringify(A_efter, null, 2));

const B = regel3(["rs-01-volatilitet-och-risk", "rs-02-kundkoncentration"], KARTA);
console.log("\n(B) ORDNING — delvis läsare [rs-01+rs-02 klara]:", B ? `${B.slug} nomineras först (familjens kartordning bevarad — rs-03 tränger INTE framför v19)` : "ingen");
const B2 = regel3([...RISK_KLARA, "v10-skuldsattningsgrad", "v11-likviditet"], KARTA);
console.log("    (B2) STABILITET-läsare 2 klara + RISK 3 klara → flest-vinner:", B2 ? `${B2.slug} (${B2.kategori} ${B2.steg} steg)` : "ingen");

const C = regel3([], KARTA);
console.log("\n(C) FÖRSVARSLÄGE — ny läsare (0 klara):", C === null ? "regeln vilar — rs-03 tränger sig inte på" : "FEL: nominerade " + C.slug);

const niva2fore = KARTA_FORE.filter((k) => k.kategori === "RISK" && k.niva === 2).length;
const niva2efter = KARTA.filter((k) => k.kategori === "RISK" && k.niva === 2).length;
console.log(`\n(D) NIVÅPOOL — RISK nivå 2 (Intermediär): ${niva2fore} → ${niva2efter} (nivå-steg-regeln BAS 62 kan nå rs-03; dokumenterat att den trängs av högre-BAS-regler)`);

const E1 = JSON.stringify(regel3(RISK_KLARA, KARTA)), E2 = JSON.stringify(regel3(RISK_KLARA, KARTA));
console.log("\n(E) DETERMINISM — två körningar identiska:", E1 === E2 ? "JA (diff tom)" : "NEJ — FEL");

const gron = !A_fore && A_efter?.slug === "rs-03-dold-samvariation" && A_efter.varför.includes("Du är igång i risk — 3 steg ligger bakom dig") && B?.slug === "v19-kapitalforbranning" && C === null && niva2efter === niva2fore + 1 && E1 === E2;
console.log(`\nFRONT B SLUT: ${gron ? "GRÖN — samtliga fem kontroller" : "RÖD"}`);
process.exit(gron ? 0 : 1);
