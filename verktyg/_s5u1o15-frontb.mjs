#!/usr/bin/env node
/**
 * FRONT B — s5-u1 omgång 15 (manifest auto-s5-1789722300593):
 * bk-05-redovisningspolitiken.
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (rad ~308–341) med dess
 * EXAKTA filter och parametrar (BAS.kategoriFortsattning 86, PASLAG_NIVA_MATCH
 * 4, PASLAG_V_SPAR 2, MALNIVA) — motorkod orörd. Bevisar att bk-05 nomineras
 * med GENERERAD varför-rad för en fulläst BOKFÖRING & ÅRSREDOVISNING-läsare,
 * att poängformeln gäller från båda riktningarna (+4 ENDAST vid nivåmatch),
 * att kartordningen bevaras, att försvarsläget vilar samt att determinismen
 * är bitidentisk.
 *
 * Race-säkert: klara-listan byggs DYNAMISKT ur den genererade kartans
 * BOKFÖRING-familj (ingen hårdkodad slug-lista som kan åldras) och
 * antalsvakten läser konstanten ur filen (registerparitet).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const KARTA_TEXT = readFileSync("src/lib/larvag-karta.ts", "utf8");

// ── Kartan ur den genererade filen (larvag-synk-mönstret) ────────────────────
const KARTA = [...KARTA_TEXT.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m, i) => ({ idx: i, slug: m[1], titel: m[2], kategori: m[3], niva: Number(m[4]), kraverFas: Number(m[5]), vIndex: Number(m[6]), minuter: Number(m[7]) }));
const VANTAT = Number(KARTA_TEXT.match(/LARVAG_ANTAL_KURSER = (\d+)/)[1]);
if (KARTA.length !== VANTAT) { console.error(`FEL: kartan bär ${KARTA.length} kurser, konstanten ${VANTAT} — kör bygg-larvag-karta.`); process.exit(1); }

const NY = "bk-05-redovisningspolitiken";
const KAT = "BOKFÖRING & ÅRSREDOVISNING";

// ── Läsreplik av regeln (larvag.ts:308-341) ─────────────────────────────────
const BAS_FORTSATTNING = 86;
const PASLAG_NIVA_MATCH = 4;
const PASLAG_V_SPAR = 2;
const MALNIVA = { nybörjare: 1, växande: 2, avancerad: 3, "fas2-reda": 3 };

function varforFortsattning(titel, kategori, antal) {
  const stegText = antal === 1 ? "ditt första steg" : `${String(antal)} steg`;
  return `Du är igång i ${kategori.toLowerCase()} — ${stegText} ligger bakom dig, och ${titel} fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`;
}

/** Kategori-fortsättningsregeln exakt: flest klara per kategori (först
 *  påbörjade vinner oavgång — Map-iterationsordning) → nästa oklara kurs i
 *  SAMMA kategori i kartordning (lägst index), med poäng BAS 86 + påslag. */
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
  return {
    slug: fortsattning.slug,
    titel: fortsattning.titel,
    varför: varforFortsattning(fortsattning.titel, paborjadKategori, paborjadAntal),
    poäng: BAS_FORTSATTNING + paslag,
    kategori: paborjadKategori,
    klaraIFamiljen: paborjadAntal,
  };
}

// ── Scenarier ────────────────────────────────────────────────────────────────
const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

const familj = (kat) => KARTA.filter((k) => k.kategori === kat);
const FÖR_KARTA = KARTA.filter((k) => k.slug !== NY);

// (A) Fulläst BOKFÖRING-läsare FÖRE (kartan utan bk-05) → regeln vilar
const bokFöre = familj(KAT).filter((k) => k.slug !== NY).map((k) => k.slug);
testa("A0 BOKFÖRING-familjen har exakt 16 kurser FÖRE bk-05 (dynamisk klara-lista ur kartan)", bokFöre.length === 16, `faktiskt ${bokFöre.length}`);
const bokFöreSvar = kategoriFortsattning(FÖR_KARTA, bokFöre, "avancerad");
testa("A1 BOKFÖRING fullläst FÖRE: 0 kandidater (familjen slutläst, regeln vilar)", bokFöreSvar === null, `svar=${JSON.stringify(bokFöreSvar)}`);

// (A) EFTER: bk-05 nomineras med genererad varför-rad, 90p (86 + 4 nivåmatch)
const bokSvar = kategoriFortsattning(KARTA, bokFöre, "avancerad");
testa("A2 BOKFÖRING fullläst EFTER: bk-05 nominerad", bokSvar?.slug === NY, JSON.stringify(bokSvar && { slug: bokSvar.slug, poäng: bokSvar.poäng }));
testa("A3 varför-raden genererad med familjetal 16 steg", bokSvar?.varför === "Du är igång i bokföring & årsredovisning — 16 steg ligger bakom dig, och Redovisningspolitiken — siffrornas formbara rum: samma ekonomi, två rapporter fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.", bokSvar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Avancerad niva 3 mot avancerat mål 3), vIndex −1 = inget V-plus", bokSvar?.poäng === 90, `poäng=${bokSvar?.poäng}`);

// (B) Poängformeln från båda riktningarna: utan nivåmatch 86
const bokNy = kategoriFortsattning(KARTA, bokFöre, "nybörjare");
testa("B1 nybörjarlästillstånd: 86 (målnivå 1 matchar inte niva 3)", bokNy?.poäng === 86, `poäng=${bokNy?.poäng}`);
const bokVax = kategoriFortsattning(KARTA, bokFöre, "växande");
testa("B2 växande lästillstånd: 86 (målnivå 2 matchar inte niva 3)", bokVax?.poäng === 86, `poäng=${bokVax?.poäng}`);

// (C) Kartordning: delvis BOKFÖRING-läsare (endast bk-01 klar) → lägst
//     kartindex vinner (km-001, ej bk-05) — ny kurs stjäl ingen plats
const delvisKlart = ["bk-01-balansrakningen"];
const delvisSvar = kategoriFortsattning(KARTA, delvisKlart, "växande");
testa("C1 kartordning: delvis läsare får km-001 (lägre kartindex) FÖRE bk-05", delvisSvar?.slug === "km-001-bokforingens-grunder", `svar=${delvisSvar?.slug}`);

// (D) Försvarsläge: 0 klara ⇒ ingen kategori påbörjad ⇒ regeln vilar tyst
testa("D1 försvarsläge: 0 klara ⇒ null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (E) Fas-grinden: bk-05 kraverFas 0 — gratis, R2 orörd (kartad rad)
const bkRad = KARTA.find((k) => k.slug === NY);
testa("E1 bk-05 kraverFas 0 (gratis — R2: priser/tier orörda)", bkRad?.kraverFas === 0);
testa("E2 bk-05 niva 3 (Avancerad — trappans kröningssteg) och vIndex −1 (utanför V-spåret)", bkRad?.niva === 3 && bkRad?.vIndex === -1);

// (F) Determinism: bitidentisk vid omkörning
const r1 = JSON.stringify(kategoriFortsattning(KARTA, bokFöre, "avancerad")) + JSON.stringify(kategoriFortsattning(KARTA, delvisKlart, "växande"));
const r2 = JSON.stringify(kategoriFortsattning(KARTA, bokFöre, "avancerad")) + JSON.stringify(kategoriFortsattning(KARTA, delvisKlart, "växande"));
testa("F1 determinism: två körningar bitidentiska", r1 === r2);

// ── Rapport ─────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — bk-05 nomineras med genererad varför-rad (kategori-fortsättning BAS 86 + nivåmatch +4 = 90p) vid ${VANTAT}-kursläget.`);
