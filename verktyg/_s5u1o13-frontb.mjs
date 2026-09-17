#!/usr/bin/env node
/**
 * FRONT B — bevis för st-05 (spår 5 u1 omgång 13, 2026-09-17).
 * Replikerar kategori-fortsättningsregeln (larvag.ts BAS 86 + nivåmatch +4)
 * med regelns EXAKTA filter mot den genererade kartan src/lib/larvag-karta.ts.
 * Motorkod orörd — läsreplik (u1-omg5/omg12-mönstret). Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuten: +m[7] }));
const MIN = "st-05-refinansieringsmuren";
console.log(`karta: ${KARTA.length} kurser | ${MIN}: ${KARTA.filter(k => k.slug === MIN).length} (niva ${KARTA.find(k => k.slug === MIN)?.niva}, kraverFas ${KARTA.find(k => k.slug === MIN)?.kraverFas})`);

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
const STAB = KARTA.filter(k => k.kategori === "STABILITET").map(k => k.slug);
console.log(`STABILITET i karta (ordning): ${STAB.join(" · ")}`);

// (A) st-05 — fulläst STABILITET-läsare (7 kurser klara, växande lästillstånd → Intermediär matchar målnivå 2 = +4 → 90p)
const ST_KLARA = [...KARTA_FORE.filter(k => k.kategori === "STABILITET").map(k => k.slug)];
const A_fore = regel3(ST_KLARA, KARTA_FORE, 0, "växande"), A_efter = regel3(ST_KLARA, KARTA, 0, "växande");
console.log(`\n(A) st-05 — fulläst STABILITET-läsare [${ST_KLARA.length} kurser klara, växande lästillstånd]:`);
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(A_fore));
console.log("    EFTER:", JSON.stringify(A_efter));

// (B) nivåpar avancerat lästillstånd: Intermediär-kursen matchar inte målnivå 3 → 86p (nivåmatch utgår)
const B = regel3(ST_KLARA, KARTA, 0, "avancerad");
console.log(`\n(B) NIVÅPAR — samma läsare med avancerat lästillstånd: ${B ? `${B.slug} ${B.poang}p (Intermediär matchar inte målnivå 3 — korrekt)` : "ingen"}`);

// (C) KARTORDNING — delvisläsare (v10+v11 klara): första kandidat = v12 i kartordning — st-05 tränger INTE framför
const C = regel3(["v10-skuldsattningsgrad", "v11-likviditet"], KARTA, 0, "växande");
console.log("\n(C) KARTORDNING — delvis STABILITET-läsare [v10+v11]:", C ? `${C.slug} nomineras först (st-05 tränger INTE framför tidigare kurser — korrekt motorbeteende)` : "ingen");

// (D) FÖRSVARSLÄGE — ny läsare (0 klara): regeln vilar
const D = regel3([], KARTA);
console.log("\n(D) FÖRSVARSLÄGE — ny läsare (0 klara):", D === null ? "regeln vilar — min kurs tränger sig inte på" : "FEL: " + D.slug);

// (E) DETERMINISM
const E1 = JSON.stringify(regel3(ST_KLARA, KARTA)) + JSON.stringify(regel3(ST_KLARA, KARTA, 0, "avancerad"));
const E2 = JSON.stringify(regel3(ST_KLARA, KARTA)) + JSON.stringify(regel3(ST_KLARA, KARTA, 0, "avancerad"));
console.log("\n(E) DETERMINISM — två körningar identiska:", E1 === E2 ? "JA" : "NEJ — FEL");

const gron =
  A_fore === null && A_efter?.slug === MIN && A_efter.poang === 90 && A_efter.varför.includes("Du är igång i stabilitet — 7 steg ligger bakom dig") &&
  B?.slug === MIN && B.poang === 86 &&
  C !== null && C.slug !== MIN && D === null && E1 === E2;
console.log("\n═══ FRONT B " + (gron ? "GRÖN — st-05 nominerad med genererad varför-rad, nivåpar + kartordning + försvarsläge + determinism korrekt" : "RÖD") + " ═══");
process.exit(gron ? 0 : 1);
