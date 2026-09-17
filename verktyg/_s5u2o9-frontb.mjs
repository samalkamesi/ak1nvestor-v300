#!/usr/bin/env node
/**
 * FRONT B — bevis för ks-05 + am-05 (spår 5 u2 omgång 9, 2026-09-17).
 * Replikerar kategori-fortsättningsregeln (larvag.ts:308-341, BAS 86) med regelns
 * EXAKTA filter + poäng (nivåmatch +4, V-index +2) mot den genererade kartan
 * src/lib/larvag-karta.ts. Motorkod orörd — läsreplik (o8-mönstret).
 * RACE-SÄKER mot syskon: klara-listorna byggs DYNAMISKT ur kartans familjer
 * (u1:s ks-04-emission + u3:s kurser inkluderas om de finns i kartan).
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] }));
const MINA = ["ks-05-covenanter-och-kreditbetyg", "am-05-handelsdagens-auktioner"];
console.log(`karta: ${KARTA.length} kurser | mina: ${MINA.map((s) => `${s} (${KARTA.filter((k) => k.slug === s).length})`).join(" · ")}`);

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
const familj = (namn, karta) => karta.filter((k) => k.kategori === namn);

// ── (A) ks-05: fulläst KAPITALSTRUKTUR-läsare (dynamisk klara-lista ur kartan) ──
const KS_EJ = familj("KAPITALSTRUKTUR", KARTA).filter((k) => k.slug !== "ks-05-covenanter-och-kreditbetyg");
const KS_KLARA = KS_EJ.map((k) => k.slug);
console.log(`\nKAPITALSTRUKTUR i karta: ${familj("KAPITALSTRUKTUR", KARTA).length} kurser (varav Intermediär: ${familj("KAPITALSTRUKTUR", KARTA).filter((k) => k.niva === 2).length}) · klara i scenariot: ${KS_KLARA.length}`);
const ksA_fore = regel3(KS_KLARA, KARTA_FORE), ksA_efter = regel3(KS_KLARA, KARTA);
console.log("(A1) ks-05 — fulläst KS-läsare [" + KS_KLARA.length + " klara]:");
console.log("     FÖRE :", ksA_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(ksA_fore));
console.log("     EFTER:", JSON.stringify(ksA_efter));

// ── (A2) am-05: fulläst AKTIEMARKNADEN I PRAKTIKEN-läsare ──
const AM_EJ = familj("AKTIEMARKNADEN I PRAKTIKEN", KARTA).filter((k) => k.slug !== "am-05-handelsdagens-auktioner");
const AM_KLARA = AM_EJ.map((k) => k.slug);
console.log(`\nAKTIEMARKNADEN I PRAKTIKEN i karta: ${familj("AKTIEMARKNADEN I PRAKTIKEN", KARTA).length} kurser (varav Intermediär: ${familj("AKTIEMARKNADEN I PRAKTIKEN", KARTA).filter((k) => k.niva === 2).length}) · klara: ${AM_KLARA.length}`);
const amA_fore = regel3(AM_KLARA, KARTA_FORE), amA_efter = regel3(AM_KLARA, KARTA);
console.log("(A2) am-05 — fulläst AM-läsare [" + AM_KLARA.length + " klara]:");
console.log("     FÖRE :", amA_fore === null ? "0 kandidater — regeln vilade (slutläst familj)" : JSON.stringify(amA_fore));
console.log("     EFTER:", JSON.stringify(amA_efter));

// ── (B) POÄNGFORMULA — +4 kommer JUST från nivåmatch (växande=2 = mina nivåer) ──
const ksB = regel3(KS_KLARA, KARTA, 0, "växande");
const amB = regel3(AM_KLARA, KARTA, 0, "växande");
const ksBnyb = regel3(KS_KLARA, KARTA, 0, "nybörjare");
const amBavanc = regel3(AM_KLARA, KARTA, 0, "avancerad");
console.log(`\n(B) POÄNGFORMULA: växande (nivå 2) → ks-05 ${ksB?.poang}/am-05 ${amB?.poang} (86 BAS + 4 nivåmatch) · nybörjare → ${ksBnyb?.poang} · avancerad → ${amBavanc?.poang} (ingen match = 86 — +4 endast från nivåmatchen)`);

// ── (C) KARTORDNING — delvis läsare: tidigare kurser nomineras först ──
const ksC = regel3(KS_KLARA.slice(0, 3), KARTA);
const amC = regel3(AM_KLARA.slice(0, 3), KARTA);
console.log(`(C) KARTORDNING — delvis läsare [3 klara]: KS → ${ksC ? ksC.slug : "ingen"} · AM → ${amC ? amC.slug : "ingen"} (mina kurser tränger INTE framför tidigare — determinism)`);

// ── (D) FÖRSVARSLÄGE — ny läsare ──
const D = regel3([], KARTA);
console.log(`(D) FÖRSVARSLÄGE — ny läsare (0 klara): ${D === null ? "regeln vilar — mina kurser tränger sig inte på" : "FEL: " + D.slug}`);

// ── (E) DETERMINISM ──
const E1 = JSON.stringify(regel3(KS_KLARA, KARTA)) + JSON.stringify(regel3(AM_KLARA, KARTA));
const E2 = JSON.stringify(regel3(KS_KLARA, KARTA)) + JSON.stringify(regel3(AM_KLARA, KARTA));
console.log(`(E) DETERMINISM — två körningar identiska: ${E1 === E2 ? "JA" : "NEJ — FEL"}`);

// ── (F) NIVÅ-STEGSPOOL — Intermediär-poolerna växer ──
const pool = (namn, karta) => familj(namn, karta).filter((k) => k.niva === 2).length;
console.log(`(F) NIVÅ-2-POOL: KS ${pool("KAPITALSTRUKTUR", KARTA_FORE)} → ${pool("KAPITALSTRUKTUR", KARTA)} · AM ${pool("AKTIEMARKNADEN I PRAKTIKEN", KARTA_FORE)} → ${pool("AKTIEMARKNADEN I PRAKTIKEN", KARTA)} (nivå-stegsregeln [BAS 90] får nya pooler)`);

// ── varför-raderna EXAKTA ──
const ksMin = KARTA.find((k) => k.slug === "ks-05-covenanter-och-kreditbetyg");
const amMin = KARTA.find((k) => k.slug === "am-05-handelsdagens-auktioner");
const vks = `Du är igång i kapitalstruktur — ${KS_KLARA.length} steg ligger bakom dig, och ${ksMin.titel} fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`;
const vam = `Du är igång i aktiemarknaden i praktiken — ${AM_KLARA.length} steg ligger bakom dig, och ${amMin.titel} fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`;
console.log(`\nvarför-rad ks-05: "${ksA_efter?.varför}"`);
console.log(`varför-rad am-05: "${amA_efter?.varför}"`);

const gron =
  ksA_fore === null && ksA_efter?.slug === "ks-05-covenanter-och-kreditbetyg" && ksA_efter?.varför === vks && ksA_efter?.poang === 90 &&
  amA_fore === null && amA_efter?.slug === "am-05-handelsdagens-auktioner" && amA_efter?.varför === vam && amA_efter?.poang === 90 &&
  ksB?.poang === 90 && amB?.poang === 90 && ksBnyb?.poang === 86 && amBavanc?.poang === 86 &&
  ksC && ksC.slug !== "ks-05-covenanter-och-kreditbetyg" && amC && amC.slug !== "am-05-handelsdagens-auktioner" &&
  D === null && E1 === E2 &&
  pool("KAPITALSTRUKTUR", KARTA) - pool("KAPITALSTRUKTUR", KARTA_FORE) === 1 &&
  pool("AKTIEMARKNADEN I PRAKTIKEN", KARTA) - pool("AKTIEMARKNADEN I PRAKTIKEN", KARTA_FORE) === 1;
console.log(`\nFRONT B: ${gron ? "GRÖN — 6/6" : "RÖD"}`);
process.exit(gron ? 0 : 1);
