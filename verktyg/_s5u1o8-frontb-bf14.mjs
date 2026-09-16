#!/usr/bin/env node
/**
 * FRONT B — bevis för bf-14-beteendeportfoljteori (spår 5 u1 omgång 8, 2026-09-16).
 * Replikerar kategori-fortsättningsregeln (larvag.ts:308-341, BAS 86) med regelns
 * EXAKTA filter + poäng (nivåmatch +4) mot den genererade kartan src/lib/larvag-karta.ts.
 * Motorkod orörd — läsreplik (u1-omg7-mönstret). RACE-SÄKER mot syskon: klara-listan
 * byggs DYNAMISKT ur kartans BETEENDEFINANS-familj (inkl. u2:s bf-13 som merge:ade
 * före mig) — scenariot är "fullläst BF-läsare" oavsett syskonaktivitet.
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] }));
const MIN_SLUG = "bf-14-beteendeportfoljteori";
const min = KARTA.find((k) => k.slug === MIN_SLUG);
console.log(`karta: ${KARTA.length} kurser | ${MIN_SLUG}: ${KARTA.filter((k) => k.slug === MIN_SLUG).length} (niva ${min?.niva}, kraverFas ${min?.kraverFas}, vIndex ${min?.vIndex})`);

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
const BF_I_KARTA = KARTA.filter((k) => k.kategori === "BETEENDEFINANS");
const BF_KLARA = BF_I_KARTA.filter((k) => k.slug !== MIN_SLUG).map((k) => k.slug); // fullläst BF-läsare utom bf-14 (dynamisk: inkluderar syskons bf-13)
console.log(`BF-familjen i karta: ${BF_I_KARTA.length} kurser (varav niva 3: ${BF_I_KARTA.filter((k) => k.niva === 3).length} — bf-04, bf-13 syskon, bf-14 min) · klara i scenariot: ${BF_KLARA.length}`);

const A_fore = regel3(BF_KLARA, KARTA_FORE), A_efter = regel3(BF_KLARA, KARTA);
console.log("\n(A) bf-14 — fullläst BETEENDEFINANS-läsare [" + BF_KLARA.length + " kurser klara]:");
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(A_fore));
console.log("    EFTER:", JSON.stringify(A_efter));

const B_efter = regel3(BF_KLARA, KARTA, 0, "avancerad");
console.log("\n(B) NIVÅMATCH — samma läsare i avancerat lästillstånd:", B_efter ? `${B_efter.slug} poäng ${B_efter.poang} (86 BAS + 4 nivåmatch, vIndex −1 = inget V-plus)` : "ingen");

const C = regel3(["km-018-forlustaversion", "km-019-bekraftelsefalla", "km-020-ankareffekt"], KARTA);
console.log("\n(C) KARTORDNING — delvis BF-läsare [km-018+km-019+km-020]:", C ? `${C.slug} nomineras först (bf-14 tränger INTE framför tidigare kurser — korrekt motorbeteende)` : "ingen");

const D = regel3([], KARTA);
console.log("\n(D) FÖRSVARSLÄGE — ny läsare (0 klara):", D === null ? "regeln vilar — bf-14 tränger sig inte på" : "FEL: " + D.slug);

const E1 = JSON.stringify(regel3(BF_KLARA, KARTA)) + JSON.stringify(regel3(BF_KLARA, KARTA, 0, "avancerad"));
const E2 = JSON.stringify(regel3(BF_KLARA, KARTA)) + JSON.stringify(regel3(BF_KLARA, KARTA, 0, "avancerad"));
console.log("\n(E) DETERMINISM — två körningar identiska:", E1 === E2 ? "JA" : "NEJ — FEL");

const pool_fore = KARTA_FORE.filter((k) => k.kategori === "BETEENDEFINANS" && k.niva === 3).length;
const pool_efter = KARTA.filter((k) => k.kategori === "BETEENDEFINANS" && k.niva === 3).length;
console.log(`\n(F) NIVÅ-STEGSPOOL — BF Avancerad-kandidater: ${pool_fore} → ${pool_efter} (+1: bf-14; nivå-stegsregeln [BAS 90] får ny pool)`);

const forvantadVarfor = `Du är igång i beteendefinans — ${BF_KLARA.length} steg ligger bakom dig, och ${min.titel} fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`;
const gron =
  A_fore === null &&
  A_efter?.slug === MIN_SLUG &&
  A_efter.varför === forvantadVarfor &&
  A_efter.poang === 86 &&
  B_efter?.slug === MIN_SLUG && B_efter.poang === 90 &&
  C && C.slug !== MIN_SLUG &&
  D === null && E1 === E2 &&
  pool_efter - pool_fore === 1;
console.log(`\nFRONT B: ${gron ? "GRÖN — 6/6" : "RÖD"}`);
process.exit(gron ? 0 : 1);
