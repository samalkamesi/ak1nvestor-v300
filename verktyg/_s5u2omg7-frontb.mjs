#!/usr/bin/env node
/**
 * FRONT B — bevis för bk-02/bk-03 (s5-u2, manifest auto-s5-1789569318697, 2026-09-16).
 * Replikerar kategori-fortsättningsregeln (larvag.ts BAS 86) med regelns EXAKTA
 * filter + poäng (nivåmatch +4) mot den genererade kartan src/lib/larvag-karta.ts.
 * Motorkod orörd — läsreplik (v82/u1-omg5/_s5u3o6-mönstret).
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] }));
console.log(`karta: ${KARTA.length} kurser | bk-02: ${KARTA.filter((k) => k.slug === "bk-02-resultatrakningen").length} · bk-03: ${KARTA.filter((k) => k.slug === "bk-03-kassaflodesrakningen").length}`);

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

const MINA = ["bk-02-resultatrakningen", "bk-03-kassaflodesrakningen"];
const KARTA_FORE = KARTA.filter((k) => !MINA.includes(k.slug));

const BK_KLARA = [
  "km-001-bokforingens-grunder", "km-002-forvaltningsberattelsen", "km-003-kassaflodesanalysen",
  "km-004-noter", "km-005-eget-kapital-utdelningar", "km-006-kvartalsrapporten",
  "km-021-avskrivningsprinciper", "km-022-goodwill-och-immateriella-tillgangar", "km-023-leasing",
  "km-024-segmentrapportering", "km-025-pensionsataganden", "km-026-relaterade-parter",
  "bk-01-balansrakningen",
];

const A_fore = regel3(BK_KLARA, KARTA_FORE), A_efter = regel3(BK_KLARA, KARTA);
console.log("\n(A) bk-02 — fulläst BOKFÖRING & ÅRSREDOVISNING-läsare [13 kurser klara]:");
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst kategori)" : JSON.stringify(A_fore));
console.log("    EFTER:", JSON.stringify(A_efter));

const B = regel3([...BK_KLARA, "bk-02-resultatrakningen"], KARTA);
console.log("\n(B) bk-03 — samma läsare med bk-02 klar [14 klara]:", B ? `${B.slug} · ${B.poang}p` : "ingen");
console.log("      varför:", B?.varför);

const C = regel3(BK_KLARA, KARTA, 0, "nybörjare");
console.log("\n(C) nybörjarlästillstånd — nivåmatch +4:", C ? `${C.slug} · ${C.poang}p (86 + 4 nivåmatch Nybörjare)` : "ingen");

const D = regel3(["km-001-bokforingens-grunder", "km-005-eget-kapital-utdelningar", "bk-01-balansrakningen"], KARTA);
console.log("\n(D) KARTORDNING — delvis läsare [km-001+km-005+bk-01]:", D ? `${D.slug} nomineras först (bk-02 tränger INTE framför km-002 — korrekt motorbeteende)` : "ingen");

const E = regel3([], KARTA);
console.log("\n(E) FÖRSVARSLÄGE — ny läsare (0 klara):", E === null ? "regeln vilar — mina kurser tränger sig inte på" : "FEL: " + E.slug);

const F1 = JSON.stringify(regel3(BK_KLARA, KARTA)) + JSON.stringify(regel3(BK_KLARA, KARTA, 0, "nybörjare"));
const F2 = JSON.stringify(regel3(BK_KLARA, KARTA)) + JSON.stringify(regel3(BK_KLARA, KARTA, 0, "nybörjare"));
console.log("\n(F) DETERMINISM — två körningar identiska:", F1 === F2 ? "JA" : "NEJ — FEL");

const gron =
  A_fore === null && A_efter?.slug === "bk-02-resultatrakningen" && A_efter.varför.includes("Du är igång i bokföring & årsredovisning — 13 steg ligger bakom dig") && A_efter.varför.includes("Resultaträkningen — bolagets resedagbok") && A_efter.poang === 86 &&
  B?.slug === "bk-03-kassaflodesrakningen" && B.varför.includes("14 steg ligger bakom dig") && B.varför.includes("Kassaflödesräkningen — pengarna som faktiskt rörde sig") && B.poang === 86 &&
  C?.slug === "bk-02-resultatrakningen" && C.poang === 90 &&
  D?.slug === "km-002-forvaltningsberattelsen" && E === null && F1 === F2;
console.log(`\nFRONT B: ${gron ? "GRÖN — 2/2 nominerade med genererade varför-rader" : "RÖD"}`);
process.exit(gron ? 0 : 1);
