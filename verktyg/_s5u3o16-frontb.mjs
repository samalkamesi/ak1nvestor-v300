#!/usr/bin/env node
/**
 * FRONT B — s5-u3 manifest auto-s5-1789743901668 (omgång 16):
 * am-07-indexomlaggningen + ks-07-kapitalstrukturens-avvagning + mt-06-kostnadsoverlagsenhet.
 * Register: dynamiskt läst (u1:s ib-03 = 421 + u2:s fönster + mina +3).
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (BAS 86 + nivåmatch +4)
 * med EXAKTA filter — motorkod orörd. Bevisar: nominering med GENERERADE
 * varför-rader för fulllästa familjeläsare, poängformeln från båda riktningarna,
 * kartordning, försvarsläge vilar, determinism bitidentisk.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const KARTA_TEXT = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...KARTA_TEXT.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m, i) => ({ idx: i, slug: m[1], titel: m[2], kategori: m[3], niva: Number(m[4]), kraverFas: Number(m[5]), vIndex: Number(m[6]), minuter: Number(m[7]) }));
const VANTAT_ANTAL = Number((KARTA_TEXT.match(/LARVAG_ANTAL_KURSER = (\d+)/) || [])[1] ?? 0);
if (KARTA.length !== VANTAT_ANTAL) { console.error(`FEL: kartan bär ${KARTA.length} kurser (konstant ${VANTAT_ANTAL}).`); process.exit(1); }
console.log(`─ karta: ${KARTA.length} kurser (konstant ${VANTAT_ANTAL})`);

const NYA = ["am-07-indexomlaggningen", "ks-07-kapitalstrukturens-avvagning", "mt-06-kostnadsoverlagsenhet"];
for (const s of NYA) if (!KARTA.find((k) => k.slug === s)) { console.error(`FEL: ${s} saknas i kartan.`); process.exit(1); }

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

// (A) AKTIEMARKNADEN I PRAKTIKEN: am-07 (Intermediär) nomineras för fulläst växande läsare
const amF = fullastSvar("AKTIEMARKNADEN I PRAKTIKEN", "växande", KARTA);
const amFöre = fullastSvar("AKTIEMARKNADEN I PRAKTIKEN", "växande", FÖR_KARTA);
testa("A1 AIP fullläst FÖRE: 0 kandidater", amFöre.svar === null, JSON.stringify(amFöre.svar));
testa("A2 AIP fullläst EFTER: am-07 nominerad", amF.svar?.slug === "am-07-indexomlaggningen", JSON.stringify(amF.svar && { slug: amF.svar.slug, poäng: amF.svar.poäng }));
testa("A3 varför-raden genererad med familjetal " + amF.klara.length + " steg",
  amF.svar?.varför === `Du är igång i aktiemarknaden i praktiken — ${amF.klara.length} steg ligger bakom dig, och Indexomläggningen — flödet som flyttar kursen utan en enda nyhet fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, amF.svar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Intermediär/växande)", amF.svar?.poäng === 90, `poäng=${amF.svar?.poäng}`);
const amAvd = fullastSvar("AKTIEMARKNADEN I PRAKTIKEN", "avancerad", KARTA);
testa("A5 poängformel omvänd riktning: avancerat lästillstånd på I-kurs = 86", amAvd.svar?.poäng === 86, `poäng=${amAvd.svar?.poäng}`);

// (B) KAPITALSTRUKTUR: ks-07 (Avancerad) nominerad för fulläst avancerad läsare
const ksF = fullastSvar("KAPITALSTRUKTUR", "avancerad", KARTA);
const ksFöre = fullastSvar("KAPITALSTRUKTUR", "avancerad", FÖR_KARTA);
testa("B1 KAPITALSTRUKTUR fullläst FÖRE: 0 kandidater", ksFöre.svar === null, JSON.stringify(ksFöre.svar));
testa("B2 KAPITALSTRUKTUR fullläst EFTER: ks-07 nominerad", ksF.svar?.slug === "ks-07-kapitalstrukturens-avvagning", JSON.stringify(ksF.svar && { slug: ksF.svar.slug, poäng: ksF.svar.poäng }));
testa("B3 varför-raden genererad med familjetal " + ksF.klara.length + " steg",
  ksF.svar?.varför === `Du är igång i kapitalstruktur — ${ksF.klara.length} steg ligger bakom dig, och Kapitalstrukturens avvägning — tre teorier om skuldens rättvikt fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, ksF.svar?.varför);
testa("B4 poäng 90 (nivåmatch Avancerad/avancerad)", ksF.svar?.poäng === 90, `poäng=${ksF.svar?.poäng}`);
const ksNy = fullastSvar("KAPITALSTRUKTUR", "nybörjare", KARTA);
testa("B5 poängformel omvänd: nybörjare-läge på A-kurs = 86", ksNy.svar?.poäng === 86, `poäng=${ksNy.svar?.poäng}`);

// (C) MOAT: mt-06 (Intermediär) nominerad för fulläst växande läsare
const mtF = fullastSvar("MOAT", "växande", KARTA);
const mtFöre = fullastSvar("MOAT", "växande", FÖR_KARTA);
testa("C1 MOAT fullläst FÖRE: 0 kandidater", mtFöre.svar === null, JSON.stringify(mtFöre.svar));
testa("C2 MOAT fullläst EFTER: mt-06 nominerad", mtF.svar?.slug === "mt-06-kostnadsoverlagsenhet", JSON.stringify(mtF.svar && { slug: mtF.svar.slug, poäng: mtF.svar.poäng }));
testa("C3 varför-raden genererad med familjetal " + mtF.klara.length + " steg",
  mtF.svar?.varför === `Du är igång i moat — ${mtF.klara.length} steg ligger bakom dig, och Kostnadsöverlägsenhet — moaten ingen ser fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, mtF.svar?.varför);
testa("C4 poäng 90 (nivåmatch Intermediär/växande)", mtF.svar?.poäng === 90, `poäng=${mtF.svar?.poäng}`);
const mtNy = fullastSvar("MOAT", "nybörjare", KARTA);
testa("C5 poängformel omvänd: nybörjare-läge på I-kurs = 86", mtNy.svar?.poäng === 86, `poäng=${mtNy.svar?.poäng}`);

// (D) Kartordning: delvis läsare → lägst kartindex i kategorin (nya kursen stjäl ingen plats)
const delvisAm = ["am-01-likviditet-och-spread"];
const delvisAmSvar = kategoriFortsattning(KARTA, delvisAm, "nybörjare");
const forvantadAm = KARTA.filter((k) => k.kategori === "AKTIEMARKNADEN I PRAKTIKEN" && !delvisAm.includes(k.slug) && k.kraverFas <= 1)[0];
testa("D1 kartordning: delvis AIP-läsare får " + forvantadAm.slug + " (lägst kartindex) — nya kursen stjäl ingen plats", delvisAmSvar?.slug === forvantadAm.slug, `svar=${delvisAmSvar?.slug}`);
const delvisKs = ["ks-01-kapitalstruktur-grunder"];
const delvisKsSvar = kategoriFortsattning(KARTA, delvisKs, "nybörjare");
const forvantadKs = KARTA.filter((k) => k.kategori === "KAPITALSTRUKTUR" && !delvisKs.includes(k.slug) && k.kraverFas <= 1)[0];
testa("D2 kartordning KAPITALSTRUKTUR: delvis läsare får " + forvantadKs.slug + " i kartordning (ks-07 ligger sist i ks-serien)", delvisKsSvar?.slug === forvantadKs.slug, `svar=${delvisKsSvar?.slug}`);

// (E) Försvarsläge: 0 klara ⇒ vilar
testa("E1 försvarsläge: 0 klara ⇒ null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (F) Determinism
const r1 = JSON.stringify(kategoriFortsattning(KARTA, amF.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, ksF.klara, "avancerad")) + JSON.stringify(kategoriFortsattning(KARTA, mtF.klara, "växande"));
const r2 = JSON.stringify(kategoriFortsattning(KARTA, amF.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, ksF.klara, "avancerad")) + JSON.stringify(kategoriFortsattning(KARTA, mtF.klara, "växande"));
testa("F1 determinism: två körningar bitidentiska", r1 === r2);

// (G) Nivådata i kartan för de tre (registeräkthet i kartledet)
for (const [slug, niva] of [["am-07-indexomlaggningen", 2], ["ks-07-kapitalstrukturens-avvagning", 3], ["mt-06-kostnadsoverlagsenhet", 2]]) {
  const k = KARTA.find((x) => x.slug === slug);
  testa("G " + slug + " niva " + niva + " kraverFas 0", k && k.niva === niva && k.kraverFas === 0, k && `niva=${k.niva} fas=${k.kraverFas}`);
}

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — am-07 + ks-07 + mt-06 nomineras med genererade varför-rader (kategori-fortsättning BAS 86 + nivåmatch +4). Karta ${KARTA.length} kurser.`);
