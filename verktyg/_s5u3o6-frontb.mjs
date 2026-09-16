#!/usr/bin/env node
/**
 * FRONT B — bevis för ln-03/am-03/am-04 (spår 5 u3 omstart, 2026-09-16).
 * Replikerar kategori-fortsättningsregeln (larvag.ts BAS 86) med regelns
 * EXAKTA filter + poäng (nivåmatch +4) mot den genererade kartan
 * src/lib/larvag-karta.ts. Motorkod orörd — läsreplik (v82/u1-omg5-mönstret).
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] }));
console.log(`karta: ${KARTA.length} kurser | ln-03: ${KARTA.filter(k=>k.slug==="ln-03-marginaltrappan-och-operativ-havstavng").length} · am-03: ${KARTA.filter(k=>k.slug==="am-03-lasa-aktiesidan").length} · am-04: ${KARTA.filter(k=>k.slug==="am-04-marknadsstruktur").length}`);

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

const MINA = ["ln-03-marginaltrappan-och-operativ-havstavng", "am-03-lasa-aktiesidan", "am-04-marknadsstruktur"];
const KARTA_FORE = KARTA.filter((k) => !MINA.includes(k.slug));

const LN_KLARA = ["v07-bruttomarginal", "v08-ebitda-marginal", "v09-roe", "ln-01-dupont-analysen", "ln-02-resultatkvalitet-och-accruals", "ln-04-kapitalbindning-och-rorelsekapital", "roic-01-avkastning-pa-investerat-kapital"];
const AM_KLARA = ["km-069-orderbok-och-prissattning", "km-070-natmaklare-i-sverige", "am-01-likviditet-och-spread", "am-02-index-och-passivt-agande"];

const A_fore = regel3(LN_KLARA, KARTA_FORE), A_efter = regel3(LN_KLARA, KARTA);
console.log("\n(A) ln-03 — fullläst LÖNSAMHET-läsare [7 kurser klara]:");
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(A_fore));
console.log("    EFTER:", JSON.stringify(A_efter));

const B_fore = regel3(AM_KLARA, KARTA_FORE), B_efter = regel3(AM_KLARA, KARTA);
console.log("\n(B) am-03 — fullläst AM-läsare [km-069+km-070+am-01+am-02 klara]:");
console.log("    FÖRE :", B_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(B_fore));
console.log("    EFTER:", JSON.stringify(B_efter));

const C = regel3([...AM_KLARA, "am-03-lasa-aktiesidan"], KARTA, 0, "avancerad");
console.log("\n(C) am-04 — AM-läsare med am-03 klar [avancerat lästillstånd]:", JSON.stringify(C));

const D = regel3(["km-069-orderbok-och-prissattning", "km-070-natmaklare-i-sverige"], KARTA);
console.log("\n(D) KARTORDNING — delvis AM-läsare [km-069+km-070]:", D ? `${D.slug} nomineras först (am-03 tränger INTE framför am-01 — korrekt motorbeteende)` : "ingen");

const E = regel3([], KARTA);
console.log("\n(E) FÖRSVARSLÄGE — ny läsare (0 klara):", E === null ? "regeln vilar — mina kurser tränger sig inte på" : "FEL: " + E.slug);

const F1 = JSON.stringify(regel3(LN_KLARA, KARTA)) + JSON.stringify(regel3(AM_KLARA, KARTA));
const F2 = JSON.stringify(regel3(LN_KLARA, KARTA)) + JSON.stringify(regel3(AM_KLARA, KARTA));
console.log("\n(F) DETERMINISM — två körningar identiska:", F1 === F2 ? "JA" : "NEJ — FEL");

const gron =
  A_fore === null && A_efter?.slug === "ln-03-marginaltrappan-och-operativ-havstavng" && A_efter.varför.includes("Du är igång i lönsamhet — 7 steg ligger bakom dig") && A_efter.poang === 90 &&
  B_fore === null && B_efter?.slug === "am-03-lasa-aktiesidan" && B_efter.varför.includes("Du är igång i aktiemarknaden i praktiken — 4 steg ligger bakom dig") &&
  C?.slug === "am-04-marknadsstruktur" && C.varför.includes("5 steg ligger bakom dig") && C.poang === 90 &&
  D?.slug === "am-01-likviditet-och-spread" && E === null && F1 === F2;
console.log(`\nFRONT B SLUT: ${gron ? "GRÖN — samtliga sex kontroller" : "RÖD"}`);
process.exit(gron ? 0 : 1);
