#!/usr/bin/env node
/**
 * FRONT B — bevis för vr-03-multipelns-anatomi + mt-03-vallgraven-i-siffror
 * (spår 5 u2 omgång 6, 2026-09-16). Replikerar kategori-fortsättningsregeln
 * (larvag.ts:308-341, BAS 86) med regelns EXAKTA filter mot den genererade
 * kartan src/lib/larvag-karta.ts — samma läsreplikmönster som
 * verktyg/_s5u1-frontb-rs03.mjs (motorkod orörd, ingen import).
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] }));
console.log(`karta: ${KARTA.length} kurser (vr-03: ${KARTA.filter(k => k.slug === "vr-03-multipelns-anatomi").length}, mt-03: ${KARTA.filter(k => k.slug === "mt-03-vallgraven-i-siffror").length})`);

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
  return { slug: fortsattning.slug, titel: fortsattning.titel, kategori: paborjadKategori, steg: paborjadAntal, niva: fortsattning.niva, varför: varforFortsattning(fortsattning.titel, paborjadKategori, paborjadAntal) };
};

/** Lärande som klarat ALLA kurser i kategorin före målkursen (kartordning) →
 *  regelns nominering måste bli målkursen (deterministisk kartordning). */
const prova = (malSlug) => {
  const mal = KARTA.find(k => k.slug === malSlug);
  const klara = KARTA.filter(k => k.kategori === mal.kategori && KARTA.indexOf(k) < KARTA.indexOf(mal)).map(k => k.slug);
  const n = regel3(klara, KARTA);
  const OK = n && n.slug === malSlug;
  console.log(`\n[${malSlug}] kategori=${mal.kategori} niva=${mal.niva}`);
  console.log(`  klara före (${klara.length}): ${klara.join(", ")}`);
  console.log(`  nominerad: ${n ? n.slug : "INGEN"} ${OK ? "✓" : "✗ FEL"}`);
  if (n) console.log(`  poäng: BAS 86${(n.niva === 2 || n.niva === 3) ? " + nivåmatch mot växande lästillstånd" : ""}`);
  if (n) console.log(`  varför-rad: "${n.varför}"`);
  return OK;
};

const a = prova("vr-03-multipelns-anatomi");
const b = prova("mt-03-vallgraven-i-siffror");
console.log(`\nFRONT B: ${a && b ? "GRÖN — 2/2 nominerade med genererade varför-rader" : "RÖT"}`);
process.exit(a && b ? 0 : 1);
