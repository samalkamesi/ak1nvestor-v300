#!/usr/bin/env node
/**
 * FRONT B — s5-u2 omgång 13 (manifest auto-s5-1789681529602): ma-04 + roic-02.
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (u3:o12-mönstret) med
 * dess EXAKTA filter — motorkod orörd. Bevisar att de två nya kurserna
 * nomineras med GENERERADE varför-rader för fulllästa familjeläsare, att
 * poängformeln gäller från båda riktningarna (+4 ENDAST vid nivåmatch), att
 * kartordningen bevaras, att försvarsläget vilar samt att determinismen är
 * bitidentisk.
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
// Race-säker antalsvakt: kartan ska bära EXAKT registrets kursantal (parallella
// syskon i manifestet kan ha lagt kurser sedan 407 — paritet, inte hårdkodat tal).
const REGANTAL = Object.keys(JSON.parse(readFileSync("public/deep-courses.json", "utf8"))).length;
if (KARTA.length !== REGANTAL) { console.error(`FEL: kartan bär ${KARTA.length} kurser mot registrets ${REGANTAL} — kör bygg-larvag-karta.`); process.exit(1); }

const NYA = ["ma-04-konjunkturindikatorerna", "roic-02-avkastningstrappan"];

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

// (A) Fullläst MAKROEKONOMI & RÄNTA-läsare: ma-04 nominerad (I mot växande)
const maFöre = familj("MAKROEKONOMI & RÄNTA").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
const maAntalFöre = maFöre.length;
testa("A1 MAKROEKONOMI & RÄNTA fullläst FÖRE: 0 kandidater (familjen slutläst utan ma-04)", kategoriFortsattning(FÖR_KARTA, maFöre, "växande") === null);
const maSvar = kategoriFortsattning(KARTA, maFöre, "växande");
testa("A2 MAKROEKONOMI & RÄNTA fullläst EFTER: ma-04 nominerad", maSvar?.slug === "ma-04-konjunkturindikatorerna", JSON.stringify(maSvar && { slug: maSvar.slug, poäng: maSvar.poäng }));
testa(`A3 varför-raden genererad med familjetal ${maAntalFöre} steg`, maSvar?.varför === `Du är igång i makroekonomi & ränta — ${maAntalFöre} steg ligger bakom dig, och Konjunkturindikatorerna — månadens siffror och bolagets nästa rapport fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, maSvar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Intermediär mot växande), vIndex −1", maSvar?.poäng === 90, `poäng=${maSvar?.poäng}`);

// (B) Fullläst LÖNSAMHET-läsare: roic-02 nominerad (Intermediär mot växande)
const lnFöre = familj("LÖNSAMHET").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
const lnAntalFöre = lnFöre.length;
testa("B1 LÖNSAMHET fullläst FÖRE: 0 kandidater", kategoriFortsattning(FÖR_KARTA, lnFöre, "växande") === null);
const lnSvar = kategoriFortsattning(KARTA, lnFöre, "växande");
testa("B2 LÖNSAMHET fullläst EFTER: roic-02 nominerad", lnSvar?.slug === "roic-02-avkastningstrappan", JSON.stringify(lnSvar && { slug: lnSvar.slug, poäng: lnSvar.poäng }));
testa(`B3 varför-raden genererad med familjetal ${lnAntalFöre} steg`, lnSvar?.varför === `Du är igång i lönsamhet — ${lnAntalFöre} steg ligger bakom dig, och Avkastningstrappan — marginal och kapitalomsättning: ROIC:s två vägar fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, lnSvar?.varför);
testa("B4 poäng 90 (nivåmatch Intermediär/växande)", lnSvar?.poäng === 90, `poäng=${lnSvar?.poäng}`);

// (C) Poängformeln från andra riktningen: utan nivåmatch 86
const maSvar86 = kategoriFortsattning(KARTA, maFöre, "avancerad");
testa("C1 ma-04 utan nivåmatch (I mot avancerad): poäng 86", maSvar86?.poäng === 86, `poäng=${maSvar86?.poäng}`);

// (D) Kartordningen bevaras: delvis LÖNSAMHET-läsare (ln-01 klar) →
//     nomineras gör lägst KARTINDEX bland oklara i kategorin (v07-brutto-
//     marginal, V-spåret, registrerat före roic-01) — aldrig roic-02 som
//     ligger sist i serien. Korrekt motorbeteende: ny kurs stjäl ingen plats.
const delvis = ["ln-01-dupont-analysen"];
const delvisSvar = kategoriFortsattning(KARTA, delvis, "växande");
const roic02Idx = KARTA.find((k) => k.slug === "roic-02-avkastningstrappan").idx;
const nomineradIdx = delvisSvar ? KARTA.find((k) => k.slug === delvisSvar.slug).idx : -1;
testa("D1 delvis läsare: nominerad har lägre kartindex än roic-02 (kartordning)", delvisSvar?.slug === "v07-bruttomarginal" && nomineradIdx < roic02Idx, `nominerad=${delvisSvar?.slug} idx=${nomineradIdx} < ${roic02Idx}`);

// (E) Nivåstegets spegel: nybörjarläsare + full LÖNSAMHET → roic-02 utan match = 86 (I mot 1)
const lnSvarNy = kategoriFortsattning(KARTA, lnFöre, "nybörjare");
testa("E1 roic-02 mot nybörjare (2 mot 1): poäng 86, ingen match", lnSvarNy?.poäng === 86, `poäng=${lnSvarNy?.poäng}`);

// (F) Försvarsläget vilar: inga klara → regeln ger null
testa("F1 försvarsläge: tom klara-lista → null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (G) Determinism: dubbelkörning bitidentisk
const g1 = JSON.stringify(kategoriFortsattning(KARTA, maFöre, "växande"));
const g2 = JSON.stringify(kategoriFortsattning(KARTA, maFöre, "växande"));
testa("G1 determinism: två körningar bitidentiska", g1 === g2 && g1.length > 0);

// (H) Kollisionsläget med syskonen: ma-03-realrantan (u3) och ma-04 (jag) i
//     samma familj — fullläst läsare UTAN ma-04: realrantan är klar, regeln
//     ger null; med ma-04: den nomineras. Nummerkedjan ma-01..04 hel.
const maUtanMa04 = familj("MAKROEKONOMI & RÄNTA").filter((k) => k.slug !== "ma-04-konjunkturindikatorerna").map((k) => k.slug);
const maMeddelande = kategoriFortsattning(KARTA, maUtanMa04, "växande");
testa("H1 syskonläge: ma-03-realrantan klar + ma-04 oklar → ma-04 nominerad (kedja ma-01..04 hel)", maMeddelande?.slug === "ma-04-konjunkturindikatorerna", `nominerad=${maMeddelande?.slug}`);

// ── Rapport ──────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.log("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD — ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN — ${pass.length} PASS 0 FAIL (ma-04 90p nivåmatch [${maAntalFöre} steg] · roic-02 90p nivåmatch [${lnAntalFöre} steg]; motorns kod orörd — läsreplik)`);
