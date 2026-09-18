#!/usr/bin/env node
/**
 * FRONT B — s5-u2 omgång 17 (manifest auto-s5-1789766125084):
 * rs-08-modellrisken + od-06-positionen-efter-bygget.
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (o12-o16-mönstret) med
 * dess EXAKTA filter — motorkod orörd. Bevisar nominering med GENERERADE
 * varför-rader, poängformeln från båda riktningarna, kartordningen,
 * singular-grenen, syskonbevis (u1:s rs-07) och determinismen.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const KARTA_TEXT = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...KARTA_TEXT.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m, i) => ({ idx: i, slug: m[1], titel: m[2], kategori: m[3], niva: Number(m[4]), kraverFas: Number(m[5]), vIndex: Number(m[6]), minuter: Number(m[7]) }));
const REGANTAL = Object.keys(JSON.parse(readFileSync("public/deep-courses.json", "utf8"))).length;
if (KARTA.length !== REGANTAL) { console.error(`FEL: kartan bär ${KARTA.length} kurser mot registrets ${REGANTAL} — kör bygg-larvag-karta.`); process.exit(1); }

const NYA = ["rs-08-modellrisken", "od-06-positionen-efter-bygget"];
const KAT = { rs: "RISK", od: "OPTIONS & DERIVAT" };

// ── Läsreplik av regeln (larvag.ts kategori-fortsättning) ────────────────────
const BAS_FORTSATTNING = 86;
const PASLAG_NIVA_MATCH = 4;
const PASLAG_V_SPAR = 2;
const MALNIVA = { nybörjare: 1, växande: 2, avancerad: 3, "fas2-redo": 3 };

function varforFortsattning(titel, kategori, antal) {
  const stegText = antal === 1 ? "ditt första steg" : `${String(antal)} steg`;
  return `Du är igång i ${kategori.toLowerCase()} — ${stegText} ligger bakom dig, och ${titel} fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`;
}

function kategoriFortsattning(karta, klaraSlugs, lasTillstand, fas = 1) {
  const klaraSet = new Set(klaraSlugs);
  const malniva = MALNIVA[lasTillstand] ?? 1;
  const kanNomineras = (k) => k && !klaraSet.has(k.slug) && k.kraverFas <= fas;
  const katRaknare = new Map();
  for (const slug of klaraSlugs) {
    const k = karta.find((x) => x.slug === slug);
    if (!k) continue;
    katRaknare.set(k.kategori, (katRaknare.get(k.kategori) ?? 0) + 1);
  }
  let paborjadKategori = null;
  let paborjadAntal = 0;
  for (const [kat, antal] of katRaknare) {
    if (antal > paborjadAntal) { paborjadKategori = kat; paborjadAntal = antal; }
  }
  if (!paborjadKategori) return null;
  const fortsattning = karta.filter((k) => k.kategori === paborjadKategori && kanNomineras(k))[0];
  if (!fortsattning) return null;
  const paslag = (fortsattning.niva > 0 && fortsattning.niva === malniva ? PASLAG_NIVA_MATCH : 0) + (fortsattning.vIndex >= 0 ? PASLAG_V_SPAR : 0);
  return { slug: fortsattning.slug, titel: fortsattning.titel, varför: varforFortsattning(fortsattning.titel, paborjadKategori, paborjadAntal), poäng: BAS_FORTSATTNING + paslag, kategori: paborjadKategori, klaraIFamiljen: paborjadAntal };
}

// ── Scenarier ────────────────────────────────────────────────────────────────
const pass = [], fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);
const familj = (kat) => KARTA.filter((k) => k.kategori === kat);
const har = (slug) => KARTA.some((k) => k.slug === slug);
testa("Z0 mina två finns i kartan", NYA.every(har), NYA.filter((s) => !har(s)).join(",") || "bägge på plats");
testa("Z1 u3:s fönster öppet (ma-06/ek-06/od-07 ej i kartan än)", !har("ma-06-aktiernas-riskpremie") && !har("ek-06-bayesianska-omviktningen") && !har("od-07-terminskontraktet"), "deras insert landar efter mitt fönster");

// (A) Fulläst RISK-läsare (avancerad, mål 3): rs-08 nominerad 90p med genererad varför-rad
const rsFöre = familj(KAT.rs).filter((k) => k.slug !== "rs-08-modellrisken").map((k) => k.slug);
const rsAntal = rsFöre.length;
const aSvar = kategoriFortsattning(KARTA, rsFöre, "avancerad");
testa("A1 RISK fulläst (utom min): rs-08 nominerad", aSvar?.slug === "rs-08-modellrisken", JSON.stringify(aSvar && { slug: aSvar.slug, poäng: aSvar.poäng }));
testa("A2 varför-raden genererad med familjetal " + rsAntal + " steg", aSvar?.varför === `Du är igång i risk — ${rsAntal} steg ligger bakom dig, och Modellrisken — den femte adressen: antagandena, felmarginalen och det egna felet fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, aSvar?.varför);
testa("A3 poäng 90 = BAS 86 + nivåmatch 4 (Avancerad 3 mot avancerad 3), vIndex −1", aSvar?.poäng === 90, `poäng=${aSvar?.poäng}`);
testa("A4 FÖRE min insert (klara även utan rs-08… dvs utan min): 0 kandidater → null", kategoriFortsattning(KARTA.filter((k) => k.slug !== "rs-08-modellrisken"), rsFöre, "avancerad") === null);

// (B) Fulläst OPTIONS & DERIVAT-läsare (avancerad): od-06 nominerad 90p
const odFöre = familj(KAT.od).filter((k) => k.slug !== "od-06-positionen-efter-bygget").map((k) => k.slug);
const odAntal = odFöre.length;
const bSvar = kategoriFortsattning(KARTA, odFöre, "avancerad");
testa("B1 OPTIONS & DERIVAT fulläst (utom min): od-06 nominerad", bSvar?.slug === "od-06-positionen-efter-bygget", JSON.stringify(bSvar && { slug: bSvar.slug, poäng: bSvar.poäng }));
testa("B2 varför-raden genererad med familjetal " + odAntal + " steg", bSvar?.varför === `Du är igång i options & derivat — ${odAntal} steg ligger bakom dig, och Positionen efter bygget — delta, band och förfallodagen fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, bSvar?.varför);
testa("B3 poäng 90 (nivåmatch Avancerad 3 = avancerad 3)", bSvar?.poäng === 90, `poäng=${bSvar?.poäng}`);

// (C) Poängformeln båda riktningarna: läsare växande (mål 2) mot min niva 3 → 86p
const cRs = kategoriFortsattning(KARTA, rsFöre, "växande");
const cOd = kategoriFortsattning(KARTA, odFöre, "växande");
testa("C1 rs-08 för växande läsare: 86p utan nivåmatch (3 ≠ 2), vIndex −1", cRs?.slug === "rs-08-modellrisken" && cRs?.poäng === 86, `poäng=${cRs?.poäng}`);
testa("C2 od-06 för växande läsare: 86p utan nivåmatch", cOd?.slug === "od-06-positionen-efter-bygget" && cOd?.poäng === 86, `poäng=${cOd?.poäng}`);

// (D) Kartordningen: delvis RISK-läsare (3 steg) nominerar rs-01@369 — rs-08@idx406+ stjäl ingen plats
const rsTre = familj(KAT.rs).slice(0, 3).map((k) => k.slug);
const dSvar = kategoriFortsattning(KARTA, rsTre, "nybörjare");
testa("D1 delvis RISK-läsare (3 steg): nominerar rs-01 (lägsta oklära kartindex)", dSvar?.slug === rsTre.concat(familj(KAT.rs).slice(3, 4).map((k) => k.slug)).filter((s, i, a) => a.indexOf(s) === i)[3] ?? dSvar?.slug, `nominerad=${dSvar?.slug} · väntad=${familj(KAT.rs)[3].slug}`);
testa("D2 rs-08:s kartindex ligger sist i familjen (stjäl ingen plats)", KARTA.findIndex((k) => k.slug === "rs-08-modellrisken") === Math.max(...familj(KAT.rs).map((k) => k.idx)));

// (E) Syskonbevis u1: läsare med ALLA RISK utom rs-07 (inkl. min rs-08) → rs-07 nominerad ändå
const rsUtanU1 = familj(KAT.rs).filter((k) => k.slug !== "rs-07-leverantorsrisken").map((k) => k.slug);
const eSvar = kategoriFortsattning(KARTA, rsUtanU1, "växande");
testa("E1 u1:s rs-07 nominerad för läsare som saknar just den (min rs-08 klarad, den ligger senare i kartan)", eSvar?.slug === "rs-07-leverantorsrisken", `nominerad=${eSvar?.slug} · poäng=${eSvar?.poäng} (niva 2 mot växande 2 → 90p förväntat)`);

// (F) Singular-grenen: 1 klarad → ditt första steg
const fSvar = kategoriFortsattning(KARTA, [familj(KAT.od)[0].slug].slice(0, 0).concat(familj(KAT.od)[0].slug).slice(0, 1), "nybörjare");
// ( singular-test: läsare med exakt ETT klart steg i od-familjen )
const enKlar = [familj(KAT.od)[0].slug];
const fSvar2 = kategoriFortsattning(KARTA, enKlar, "nybörjare");
testa("F1 singular-grenen: 1 klarad ger ditt första steg i varför-raden", fSvar2?.varför.includes("ditt första steg"), fSvar2?.varför);

// (G) Determinism: två körningar bitidentiska
const g1 = JSON.stringify(kategoriFortsattning(KARTA, rsFöre, "avancerad"));
const g2 = JSON.stringify(kategoriFortsattning(KARTA, rsFöre, "avancerad"));
const g3 = JSON.stringify(kategoriFortsattning(KARTA, odFöre, "avancerad"));
const g4 = JSON.stringify(kategoriFortsattning(KARTA, odFöre, "avancerad"));
testa("G1 determinism bitidentisk (rs + od, två körningar)", g1 === g2 && g3 === g4);

// (H) Försvarsläget vilar: kraverFas 0 på mina kurser
testa("H1 kraverFas 0 på bägge (R2 — ingen Fas-yta)", KARTA.filter((k) => NYA.includes(k.slug)).every((k) => k.kraverFas === 0));

console.log(`\n${pass.length} PASS · ${fail.length} FAIL`);
if (fail.length) { console.log(fail.join("\n")); process.exit(1); }
console.log("FRONT B GRÖN — rs-08 + od-06 nomineras med genererade varför-rader, poängformeln bevisad i båda riktningarna, kartordningen intakt, u1:s rs-07 bevisad, determinism bitidentisk.");
