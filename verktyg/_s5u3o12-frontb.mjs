#!/usr/bin/env node
/**
 * FRONT B — s5-u3 omgång 12 (manifest auto-s5-1789657528556): od-03 + ma-02 + rp-02.
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (u2:o12-mönstret, som
 * självt följer _s5u3o11) med dess EXAKTA filter — motorkod orörd. Bevisar att
 * de tre nya kurserna nomineras med GENERERADE varför-rader för fulllästa
 * familjeläsare, att poängformeln gäller från båda riktningarna (+4 ENDAST
 * vid nivåmatch), att kartordningen bevaras, att försvarsläget vilar samt att
 * determinismen är bitidentisk.
 *
 * Race-säkert: klara-listorna byggs DYNAMISKT ur den genererade kartans
 * familjer (ingen hårdkodad slug-lista som kan åldras).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const KARTA_TEXT = readFileSync("src/lib/larvag-karta.ts", "utf8");

// ── Kartan ur den genererade filen (larvag-synk-mönstret) ────────────────────
const KARTA = [...KARTA_TEXT.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m, i) => ({ idx: i, slug: m[1], titel: m[2], kategori: m[3], niva: Number(m[4]), kraverFas: Number(m[5]), vIndex: Number(m[6]), minuter: Number(m[7]) }));
if (KARTA.length !== 401) { console.error(`FEL: kartan bär ${KARTA.length} kurser (väntat 401).`); process.exit(1); }

const NYA = ["od-03-warranter-och-teckningsoptioner", "ma-02-lonebildning-och-kostnadsspiralen", "rp-02-tre-matt-tre-fragor"];

// ── Läsreplik av regeln (larvag.ts kategori-fortsättning) ───────────────────
const BAS_FORTSATTNING = 86;
const PASLAG_NIVA_MATCH = 4;
const PASLAG_V_SPAR = 2;
const MALNIVA = { nybörjare: 1, växande: 2, avancerad: 3, "fas2-redo": 3 };

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
const FÖR_KARTA = KARTA.filter((k) => !NYA.includes(k.slug));

// (A) Fullläst OPTIONS & DERIVAT-läsare: od-03 nomineras (Nybörjare, nivåmatch nybörjare)
const odFöre = familj("OPTIONS & DERIVAT").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
testa("A1 OPTIONS & DERIVAT fullläst FÖRE: 0 kandidater (familjen slutläst, regeln vilar)", kategoriFortsattning(FÖR_KARTA, odFöre, "nybörjare") === null);
const odSvar = kategoriFortsattning(KARTA, odFöre, "nybörjare");
testa("A2 OPTIONS & DERIVAT fullläst EFTER: od-03 nominerad", odSvar?.slug === "od-03-warranter-och-teckningsoptioner", JSON.stringify(odSvar && { slug: odSvar.slug, poäng: odSvar.poäng }));
testa("A3 varför-raden genererad med familjetal 6 steg", odSvar?.varför === "Du är igång i options & derivat — 6 steg ligger bakom dig, och Warranter och teckningsoptioner — optionen möter den svenska emissionen fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.", odSvar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Nybörjare mot nybörjare), vIndex −1 = inget V-plus", odSvar?.poäng === 90, `poäng=${odSvar?.poäng}`);

// (B) Fullläst MAKROEKONOMI & RÄNTA-läsare: ma-02 nomineras (Intermediär, nivåmatch växande)
const maFöre = familj("MAKROEKONOMI & RÄNTA").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
testa("B1 MAKROEKONOMI & RÄNTA fullläst FÖRE: 0 kandidater", kategoriFortsattning(FÖR_KARTA, maFöre, "växande") === null);
const maSvar = kategoriFortsattning(KARTA, maFöre, "växande");
testa("B2 MAKROEKONOMI & RÄNTA fullläst EFTER: ma-02 nominerad", maSvar?.slug === "ma-02-lonebildning-och-kostnadsspiralen", JSON.stringify(maSvar && { slug: maSvar.slug, poäng: maSvar.poäng }));
testa("B3 varför-raden genererad med familjetal 6 steg", maSvar?.varför === "Du är igång i makroekonomi & ränta — 6 steg ligger bakom dig, och Lönebildningen och kostnadsspiralen — från avtal till bolagets marginal fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.", maSvar?.varför);
testa("B4 poäng 90 (nivåmatch Intermediär/växande)", maSvar?.poäng === 90, `poäng=${maSvar?.poäng}`);

// (C) Fullläst RISKHANTERING & PORTFÖLJTEORI-läsare: rp-02 nomineras (Intermediär, nivåmatch växande)
const rpFöre = familj("RISKHANTERING & PORTFÖLJTEORI").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
testa("C1 RISKHANTERING & PORTFÖLJTEORI fullläst FÖRE: 0 kandidater", kategoriFortsattning(FÖR_KARTA, rpFöre, "växande") === null);
const rpSvar = kategoriFortsattning(KARTA, rpFöre, "växande");
testa("C2 RISKHANTERING & PORTFÖLJTEORI fullläst EFTER: rp-02 nominerad", rpSvar?.slug === "rp-02-tre-matt-tre-fragor", JSON.stringify(rpSvar && { slug: rpSvar.slug, poäng: rpSvar.poäng }));
testa("C3 varför-raden genererad med familjetal 10 steg", rpSvar?.varför === "Du är igång i riskhantering & portföljteori — 10 steg ligger bakom dig, och Tre mått, tre frågor — Sharpe, Sortino och Calmar i samma portfölj fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.", rpSvar?.varför);
testa("C4 poäng 90 (nivåmatch Intermediär/växande)", rpSvar?.poäng === 90, `poäng=${rpSvar?.poäng}`);

// (D) Poängformeln från båda riktningarna: utan nivåmatch 86 (od-03 mot "växande")
const odSvar86 = kategoriFortsattning(KARTA, odFöre, "växande");
testa("D1 od-03 utan nivåmatch (Nybörjare mot växande): poäng 86", odSvar86?.poäng === 86, `poäng=${odSvar86?.poäng}`);

// (E) Kartordningen bevaras: delvis OPTIONS & DERIVAT-läsare (km-059 klar) →
//     nästa i KARTORDNING (km-060), inte den nya — korrekt motorbeteende
const delvis = ["km-059-optionsgrunder"];
const delvisSvar = kategoriFortsattning(KARTA, delvis, "nybörjare");
const km60 = KARTA.find((k) => k.slug === "km-060-covered-calls");
testa("E1 delvis läsare får km-060 före od-03 (kartordning)", delvisSvar?.slug === "km-060-covered-calls" && km60 && km60.idx < KARTA.find((k) => k.slug === "od-03-warranter-och-teckningsoptioner").idx, `nominerad=${delvisSvar?.slug}`);

// (F) Försvarsläget vilar: inga klara → regeln ger null
testa("F1 försvarsläge: tom klara-lista → null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (G) Determinism: dubbelkörning bitidentisk
const g1 = JSON.stringify(kategoriFortsattning(KARTA, rpFöre, "växande"));
const g2 = JSON.stringify(kategoriFortsattning(KARTA, rpFöre, "växande"));
testa("G1 determinism: två körningar bitidentiska", g1 === g2 && g1.length > 0);

// ── Rapport ──────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.log("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD — ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN — ${pass.length} PASS 0 FAIL (od-03 90p nivåmatch [6 steg] · ma-02 90p nivåmatch [6 steg] · rp-02 90p nivåmatch [10 steg]; motorns kod orörd — läsreplik)`);
