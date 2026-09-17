#!/usr/bin/env node
/**
 * FRONT B — s5-u3 omgång 13 (manifest auto-s5-1789681529602):
 * mt-05-byteskostnader-och-inlasning + ma-03-realrantan + od-04-kombinerade-optionspositioner.
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (rad 308–341) med dess
 * EXAKTA filter — motorkod orörd. Bevisar att de nya kurserna nomineras med
 * GENERERADE varför-rader för fulllästa familjeläsare, att poängformeln
 * gäller från båda riktningarna (+4 ENDAST vid nivåmatch), att kartordningen
 * bevaras, att försvarsläget vilar samt att determinismen är bitidentisk.
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
if (KARTA.length !== 405) { console.error(`FEL: kartan bär ${KARTA.length} kurser (väntat 405).`); process.exit(1); }

const NYA = ["mt-05-byteskostnader-och-inlasning", "ma-03-realrantan", "od-04-kombinerade-optionspositioner"];

// ── Läsreplik av regeln (larvag.ts:308-341) ─────────────────────────────────
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

// (A) Fullläst MOAT-läsare FÖRE (kartan utan de nya) → regeln vilar
const moatFöre = familj("MOAT").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
const moatFöreSvar = kategoriFortsattning(FÖR_KARTA, moatFöre, "avancerad");
testa("A1 MOAT fullläst FÖRE: 0 kandidater (familjen slutläst, regeln vilar)", moatFöreSvar === null, `svar=${JSON.stringify(moatFöreSvar)}`);

// (A) EFTER: mt-05 nomineras med genererad varför-rad, 90p (86 + 4 nivåmatch)
const moatSvar = kategoriFortsattning(KARTA, moatFöre, "avancerad");
testa("A2 MOAT fullläst EFTER: mt-05 nominerad", moatSvar?.slug === "mt-05-byteskostnader-och-inlasning", JSON.stringify(moatSvar && { slug: moatSvar.slug, poäng: moatSvar.poäng }));
testa("A3 varför-raden genererad med familjetal 7 steg", moatSvar?.varför === "Du är igång i moat — 7 steg ligger bakom dig, och Byteskostnader och inlåsning — moaten som håller kunden kvar fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.", moatSvar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Avancerad mot avancerat), vIndex −1 = inget V-plus", moatSvar?.poäng === 90, `poäng=${moatSvar?.poäng}`);

// (B) Fullläst MAKROEKONOMI & RÄNTA-läsare: ma-03 nominerad
const maFöre = familj("MAKROEKONOMI & RÄNTA").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
const maFöreSvar = kategoriFortsattning(FÖR_KARTA, maFöre, "avancerad");
testa("B1 MA&R fullläst FÖRE: 0 kandidater", maFöreSvar === null, `svar=${JSON.stringify(maFöreSvar)}`);
const maSvar = kategoriFortsattning(KARTA, maFöre, "avancerad");
testa("B2 MA&R fullläst EFTER: ma-03-realrantan nominerad", maSvar?.slug === "ma-03-realrantan", JSON.stringify(maSvar && { slug: maSvar.slug, poäng: maSvar.poäng }));
testa("B3 varför-raden genererad med familjetal 7 steg", maSvar?.varför === "Du är igång i makroekonomi & ränta — 7 steg ligger bakom dig, och Realräntan — pengars tidsvärde efter inflation fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.", maSvar?.varför);
testa("B4 poäng 90 (nivåmatch Avancerad/avancerat)", maSvar?.poäng === 90, `poäng=${maSvar?.poäng}`);

// (C) Fullläst OPTIONS & DERIVAT-läsare: od-04 nominerad (Intermediär/växande)
const odFöre = familj("OPTIONS & DERIVAT").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
const odFöreSvar = kategoriFortsattning(FÖR_KARTA, odFöre, "växande");
testa("C1 OD fullläst FÖRE: 0 kandidater", odFöreSvar === null, `svar=${JSON.stringify(odFöreSvar)}`);
const odSvar = kategoriFortsattning(KARTA, odFöre, "växande");
testa("C2 OD fullläst EFTER: od-04 nominerad", odSvar?.slug === "od-04-kombinerade-optionspositioner", JSON.stringify(odSvar && { slug: odSvar.slug, poäng: odSvar.poäng }));
testa("C3 varför-raden genererad med familjetal 7 steg", odSvar?.varför === "Du är igång i options & derivat — 7 steg ligger bakom dig, och Kombinerade optionspositioner — collar, straddle och prisspridning fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.", odSvar?.varför);
testa("C4 poäng 90 (nivåmatch Intermediär/växande)", odSvar?.poäng === 90, `poäng=${odSvar?.poäng}`);

// (D) Poängformeln från båda riktningarna: utan nivåmatch 86
const moatNy = kategoriFortsattning(KARTA, moatFöre, "nybörjare");
testa("D1 nybörjarlästillstånd: 86 (målnivå 1 matchar inte niva 3)", moatNy?.poäng === 86, `poäng=${moatNy?.poäng}`);
const odAvd = kategoriFortsattning(KARTA, odFöre, "avancerad");
testa("D2 avancerat lästillstånd på od-04: 86 (målnivå 3 matchar inte niva 2)", odAvd?.poäng === 86, `poäng=${odAvd?.poäng}`);

// (E) Kartordning: delvis MOAT-läsare (endast v13 klar) → lägst kartindex
//     vinner (v14, ej mt-05)
const delvisKlart = ["v13-patent-ip"];
const delvisSvar = kategoriFortsattning(KARTA, delvisKlart, "växande");
testa("E1 kartordning: delvis läsare får v14 (lägre kartindex) FÖRE mt-05", delvisSvar?.slug === "v14-varumarke", `svar=${delvisSvar?.slug}`);

// (F) Försvarsläge: 0 klara ⇒ ingen kategori påbörjad ⇒ regeln vilar tyst
testa("F1 försvarsläge: 0 klara ⇒ null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (G) Determinism: bitidentisk vid omkörning
const r1 = JSON.stringify(kategoriFortsattning(KARTA, moatFöre, "avancerad")) + JSON.stringify(kategoriFortsattning(KARTA, odFöre, "växande"));
const r2 = JSON.stringify(kategoriFortsattning(KARTA, moatFöre, "avancerad")) + JSON.stringify(kategoriFortsattning(KARTA, odFöre, "växande"));
testa("G1 determinism: två körningar bitidentiska", r1 === r2);

// ── Rapport ─────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — mt-05 + ma-03 + od-04 nomineras med genererade varför-rader (kategori-fortsättning BAS 86 + nivåmatch +4).`);
