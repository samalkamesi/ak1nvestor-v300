#!/usr/bin/env node
/**
 * FRONT B — bevis för rp-01/ks-06/od-02 (spår 5 u3 omgång 9, 2026-09-17).
 * Replikerar kategori-fortsättningsregeln (larvag.ts BAS 86 + nivåmatch +4)
 * med regelns EXAKTA filter mot den genererade kartan src/lib/larvag-karta.ts.
 * Motorkod orörd — läsreplik (v82/u1-omg5-mönstret). Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] }));
const MINA = ["rp-01-riskmattens-karta", "ks-06-konvertibler-och-hybridkapital", "od-02-implicit-volatilitet"];
console.log(`karta: ${KARTA.length} kurser | rp-01: ${KARTA.filter(k => k.slug === MINA[0]).length} · ks-06: ${KARTA.filter(k => k.slug === MINA[1]).length} · od-02: ${KARTA.filter(k => k.slug === MINA[2]).length}`);

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

// (A) rp-01 — RISKHANTERING & PORTFÖLJTEORI-fullläsare (familjens samtliga 9 km-kurser klara)
const RP_KLARA = ["km-013-volatilitet-standardavvikelse", "km-014-korrelation-diversifiering", "km-015-beta-capm", "km-016-sharpe-kvot", "km-017-position-sizing-kelly-kriteriet", "km-031-var", "km-032-stresstesting-portfoljen", "km-033-tailrisk-hedging", "km-034-drawdownanalys"];
const A_fore = regel3(RP_KLARA, KARTA_FORE, 0, "avancerad"), A_efter = regel3(RP_KLARA, KARTA, 0, "avancerad");
console.log("\n(A) rp-01 — fulläst RISKHANTERING & PORTFÖLJTEORI-läsare [9 km-kurser klara, avancerat lästillstånd]:");
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(A_fore));
console.log("    EFTER:", JSON.stringify(A_efter));

// (B) ks-06 — KAPITALSTRUKTUR-fullläsare (ks-01..05 + v20 klara, växande lästillstånd)
const KS_KLARA = ["ks-01-kapitalstruktur-grunder", "ks-02-kapitalallokering", "ks-03-skuldens-anatomi", "ks-04-emissionens-mekanik", "ks-05-covenanter-och-kreditbetyg", "v20-aterekop-egna-aktier"];
const B_fore = regel3(KS_KLARA, KARTA_FORE), B_efter = regel3(KS_KLARA, KARTA);
console.log("\n(B) ks-06 — fulläst KAPITALSTRUKTUR-läsare [ks-01..05 + v20 klara, växande lästillstånd]:");
console.log("    FÖRE :", B_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(B_fore));
console.log("    EFTER:", JSON.stringify(B_efter));

// (C) od-02 — OPTIONS & DERIVAT-fullläsare (km-059..062 + od-01 klara, avancerat lästillstånd)
const OD_KLARA = ["km-059-optionsgrunder", "km-060-covered-calls", "km-061-protective-puts", "km-062-blackscholes", "od-01-optionens-greker"];
const C_fore = regel3(OD_KLARA, KARTA_FORE, 0, "avancerad"), C_efter = regel3(OD_KLARA, KARTA, 0, "avancerad");
console.log("\n(C) od-02 — fulläst OPTIONS & DERIVAT-läsare [km-059..062 + od-01 klara, avancerat lästillstånd]:");
console.log("    FÖRE :", C_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(C_fore));
console.log("    EFTER:", JSON.stringify(C_efter));

// (D) KARTORDNING — delvis RISKHANTERING & PORTFÖLJTEORI-läsare (km-013+km-014 klara): första kandidat ska vara familjens nästa i kartordning, inte rp-01 (Nybörjare tränger inte framför tidigare Intermediär)
const D = regel3(["km-013-volatilitet-standardavvikelse", "km-014-korrelation-diversifiering"], KARTA);
console.log("\n(D) KARTORDNING — delvis RP-läsare [km-013+km-014]:", D ? `${D.slug} nomineras först (rp-01 tränger INTE framför tidigare kurser — korrekt motorbeteende)` : "ingen");

// (E) FÖRSVARSLÄGE — ny läsare (0 klara): regeln vilar
const E = regel3([], KARTA);
console.log("\n(E) FÖRSVARSLÄGE — ny läsare (0 klara):", E === null ? "regeln vilar — mina kurser tränger sig inte på" : "FEL: " + E.slug);

// (F) DETERMINISM
const F1 = JSON.stringify(regel3(RP_KLARA, KARTA)) + JSON.stringify(regel3(KS_KLARA, KARTA)) + JSON.stringify(regel3(OD_KLARA, KARTA));
const F2 = JSON.stringify(regel3(RP_KLARA, KARTA)) + JSON.stringify(regel3(KS_KLARA, KARTA)) + JSON.stringify(regel3(OD_KLARA, KARTA));
console.log("\n(F) DETERMINISM — två körningar identiska:", F1 === F2 ? "JA" : "NEJ — FEL");

const gron =
  A_fore === null && A_efter?.slug === MINA[0] && A_efter.varför.includes("Du är igång i riskhantering & portföljteori — 9 steg ligger bakom dig") &&
  B_fore === null && B_efter?.slug === MINA[1] && B_efter.poang === 90 && B_efter.varför.includes("Du är igång i kapitalstruktur — 6 steg ligger bakom dig") &&
  C_fore === null && C_efter?.slug === MINA[2] && C_efter.poang === 90 && C_efter.varför.includes("Du är igång i options & derivat — 5 steg ligger bakom dig") &&
  D?.slug === "km-015-beta-capm" && E === null && F1 === F2;
console.log("\n═══ FRONT B " + (gron ? "GRÖN — 3/3 nominerade med genererade varför-rader, kartordning + försvarsläge + determinism korrekt" : "RÖD") + " ═══");
process.exit(gron ? 0 : 1);
