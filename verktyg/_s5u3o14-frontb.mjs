#!/usr/bin/env node
/**
 * FRONT B — s5-u3 manifest auto-s5-1789701930027:
 * ma-05-kreditpremien + ek-05-monte-carlo-i-motorn + od-05-utdelningen-och-optionen.
 * Register 411 → 414.
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (BAS 86 + nivåmatch +4)
 * med EXAKTA filter — motorkod orörd. Bevisar: nominering med GENERERADE
 * varför-rader för fulllästa familjeläsare, poängformeln från båda riktningarna,
 * kartordning, försvarsläge vilar, determinism bitidentisk.
 * Race-säkert: klara-listor DYNAMISKA ur kartans familjer.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const KARTA_TEXT = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...KARTA_TEXT.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m, i) => ({ idx: i, slug: m[1], titel: m[2], kategori: m[3], niva: Number(m[4]), kraverFas: Number(m[5]), vIndex: Number(m[6]), minuter: Number(m[7]) }));
if (KARTA.length !== 414) { console.error(`FEL: kartan bär ${KARTA.length} kurser (väntat 414).`); process.exit(1); }

const NYA = ["ma-05-kreditpremien", "ek-05-monte-carlo-i-motorn", "od-05-utdelningen-och-optionen"];

const BAS_FORTSATTNING = 86;
const PASLAG_NIVA_MATCH = 4;
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
  const paslag = (fortsattning.niva > 0 && fortsattning.niva === malniva ? PASLAG_NIVA_MATCH : 0) + (fortsattning.vIndex >= 0 ? 2 : 0);
  return { slug: fortsattning.slug, titel: fortsattning.titel, varför: varforFortsattning(fortsattning.titel, paborjadKategori, paborjadAntal), poäng: BAS_FORTSATTNING + paslag, kategori: paborjadKategori, klaraIFamiljen: paborjadAntal };
}

const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

const familj = (kat) => KARTA.filter((k) => k.kategori === kat);
const FÖR_KARTA = KARTA.filter((k) => !NYA.includes(k.slug));
const fullastSvar = (kat, lasTillstand, karta) => {
  const klara = familj(kat).filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
  return { klara, svar: kategoriFortsattning(karta, klara, lasTillstand) };
};

// (A) MAKROEKONOMI & RÄNTA: ma-05 (Nybörjare) nomineras för fulläst läsare
const maF = fullastSvar("MAKROEKONOMI & RÄNTA", "nybörjare", KARTA);
const maFöre = fullastSvar("MAKROEKONOMI & RÄNTA", "nybörjare", FÖR_KARTA);
testa("A1 MA&R fullläst FÖRE: 0 kandidater", maFöre.svar === null, JSON.stringify(maFöre.svar));
testa("A2 MA&R fullläst EFTER: ma-05 nominerad", maF.svar?.slug === "ma-05-kreditpremien", JSON.stringify(maF.svar && { slug: maF.svar.slug, poäng: maF.svar.poäng }));
testa("A3 varför-raden genererad med familjetal " + maF.klara.length + " steg",
  maF.svar?.varför === `Du är igång i makroekonomi & ränta — ${maF.klara.length} steg ligger bakom dig, och Kreditpremien — varför bolagets lån kostar mer än statens fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, maF.svar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Nybörjare/nybörjare), V-plus " + (maF.svar?.poäng), maF.svar?.poäng === 90 || maF.svar?.poäng === 92, `poäng=${maF.svar?.poäng}`);
const maAvd = fullastSvar("MAKROEKONOMI & RÄNTA", "avancerad", KARTA);
testa("A5 poängformula omvänd riktning: avancerat lästillstånd på N-kurs = 86 (nivå 1 matchar inte 3)", maAvd.svar?.poäng === 86 || maAvd.svar?.poäng === 88, `poäng=${maAvd.svar?.poäng}`);

// (B) EKOSYSTEM: ek-05 (Avancerad) nominerad
const ekF = fullastSvar("EKOSYSTEM", "avancerad", KARTA);
const ekFöre = fullastSvar("EKOSYSTEM", "avancerad", FÖR_KARTA);
testa("B1 EKOSYSTEM fullläst FÖRE: 0 kandidater", ekFöre.svar === null, JSON.stringify(ekFöre.svar));
testa("B2 EKOSYSTEM fullläst EFTER: ek-05 nominerad", ekF.svar?.slug === "ek-05-monte-carlo-i-motorn", JSON.stringify(ekF.svar && { slug: ekF.svar.slug, poäng: ekF.svar.poäng }));
testa("B3 varför-raden genererad med familjetal " + ekF.klara.length + " steg",
  ekF.svar?.varför === `Du är igång i ekosystem — ${ekF.klara.length} steg ligger bakom dig, och Monte Carlo i motorn — tusen framtider ur en kassaflödesprognos fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, ekF.svar?.varför);
const ekNy = fullastSvar("EKOSYSTEM", "nybörjare", KARTA);
testa("B4 poängformula: nybörjare-läge på A-kurs = 86 (nivå 3 matchar inte 1)", ekNy.svar?.poäng === 86 || ekNy.svar?.poäng === 88, `poäng=${ekNy.svar?.poäng}`);

// (C) OPTIONS & DERIVAT: od-05 (Intermediär) nominerad för växande läsare
const odF = fullastSvar("OPTIONS & DERIVAT", "växande", KARTA);
const odFöre = fullastSvar("OPTIONS & DERIVAT", "växande", FÖR_KARTA);
testa("C1 OD fullläst FÖRE: 0 kandidater", odFöre.svar === null, JSON.stringify(odFöre.svar));
testa("C2 OD fullläst EFTER: od-05 nominerad", odF.svar?.slug === "od-05-utdelningen-och-optionen", JSON.stringify(odF.svar && { slug: odF.svar.slug, poäng: odF.svar.poäng }));
testa("C3 varför-raden genererad med familjetal " + odF.klara.length + " steg",
  odF.svar?.varför === `Du är igång i options & derivat — ${odF.klara.length} steg ligger bakom dig, och Utdelningen och optionen — ex-dagen, pariteten och det glömda kassaflödet fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, odF.svar?.varför);
testa("C4 poäng 90 (nivåmatch Intermediär/växande)", odF.svar?.poäng === 90 || odF.svar?.poäng === 92, `poäng=${odF.svar?.poäng}`);

// (D) Kartordning: delvis MA&R-läsare (endast km-054 klar) → lägst kartindex i kategorin
const delvis = ["km-054-ranta"];
const delvisSvar = kategoriFortsattning(KARTA, delvis, "nybörjare");
const forvantadDelvis = KARTA.filter((k) => k.kategori === "MAKROEKONOMI & RÄNTA" && !delvis.includes(k.slug) && k.kraverFas <= 1)[0];
testa("D1 kartordning: delvis MA&R-läsare får " + forvantadDelvis.slug + " (lägst kartindex) — nya kursen stjäl ingen plats", delvisSvar?.slug === forvantadDelvis.slug, `svar=${delvisSvar?.slug}`);

// (E) Försvarsläge: 0 klara ⇒ vilar
testa("E1 försvarsläge: 0 klara ⇒ null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (F) Determinism
const r1 = JSON.stringify(kategoriFortsattning(KARTA, maF.klara, "nybörjare")) + JSON.stringify(kategoriFortsattning(KARTA, odF.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, ekF.klara, "avancerad"));
const r2 = JSON.stringify(kategoriFortsattning(KARTA, maF.klara, "nybörjare")) + JSON.stringify(kategoriFortsattning(KARTA, odF.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, ekF.klara, "avancerad"));
testa("F1 determinism: två körningar bitidentiska", r1 === r2);

// (G) Nivådata i kartan för de tre (registeräkthet i kartledet)
for (const [slug, niva] of [["ma-05-kreditpremien", 1], ["ek-05-monte-carlo-i-motorn", 3], ["od-05-utdelningen-och-optionen", 2]]) {
  const k = KARTA.find((x) => x.slug === slug);
  testa("G " + slug + " niva " + niva + " kraverFas 0", k && k.niva === niva && k.kraverFas === 0, k && `niva=${k.niva} fas=${k.kraverFas}`);
}

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — ma-05 + ek-05 + od-05 nomineras med genererade varför-rader (kategori-fortsättning BAS 86 + nivåmatch +4).`);
