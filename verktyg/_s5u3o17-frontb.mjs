#!/usr/bin/env node
/**
 * FRONT B — s5-u3 manifest auto-s5-1789766125084 (omgång 17):
 * ma-06-aktiernas-riskpremie + ek-06-bayesianska-omviktningen + od-07-terminskontraktet.
 * Register: 432 (dynamiskt läst — u1:s rs-07 + u2:s rs-08/od-06 + mina +3).
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

const NYA = ["ma-06-aktiernas-riskpremie", "ek-06-bayesianska-omviktningen", "od-07-terminskontraktet"];
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

// (A) MAKROEKONOMI & RÄNTA: ma-06 (Intermediär) nomineras för fulläst växande läsare
const maF = fullastSvar("MAKROEKONOMI & RÄNTA", "växande", KARTA);
const maFöre = fullastSvar("MAKROEKONOMI & RÄNTA", "växande", FÖR_KARTA);
testa("A1 MAKRO fullläst FÖRE: 0 kandidater", maFöre.svar === null, JSON.stringify(maFöre.svar));
testa("A2 MAKRO fullläst EFTER: ma-06 nominerad", maF.svar?.slug === "ma-06-aktiernas-riskpremie", JSON.stringify(maF.svar && { slug: maF.svar.slug, poäng: maF.svar.poäng }));
testa("A3 varför-raden genererad med familjetal " + maF.klara.length + " steg",
  maF.svar?.varför === `Du är igång i makroekonomi & ränta — ${maF.klara.length} steg ligger bakom dig, och Aktiernas riskpremie — varför börsen betalar mer än statsobligationen fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, maF.svar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Intermediär/växande)", maF.svar?.poäng === 90, `poäng=${maF.svar?.poäng}`);
const maAvd = fullastSvar("MAKROEKONOMI & RÄNTA", "avancerad", KARTA);
testa("A5 poängformel omvänd riktning: avancerat lästillstånd på I-kurs = 86", maAvd.svar?.poäng === 86, `poäng=${maAvd.svar?.poäng}`);

// (B) EKOSYSTEM: ek-06 (Intermediär) nominerad för fulläst växande läsare
const ekF = fullastSvar("EKOSYSTEM", "växande", KARTA);
const ekFöre = fullastSvar("EKOSYSTEM", "växande", FÖR_KARTA);
testa("B1 EKOSYSTEM fullläst FÖRE: 0 kandidater", ekFöre.svar === null, JSON.stringify(ekFöre.svar));
testa("B2 EKOSYSTEM fullläst EFTER: ek-06 nominerad", ekF.svar?.slug === "ek-06-bayesianska-omviktningen", JSON.stringify(ekF.svar && { slug: ekF.svar.slug, poäng: ekF.svar.poäng }));
testa("B3 varför-raden genererad med familjetal " + ekF.klara.length + " steg",
  ekF.svar?.varför === `Du är igång i ekosystem — ${ekF.klara.length} steg ligger bakom dig, och Bayesianska omviktningen — hur rösterna lär sig av träffar och missar fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, ekF.svar?.varför);
testa("B4 poäng 90 (nivåmatch Intermediär/växande)", ekF.svar?.poäng === 90, `poäng=${ekF.svar?.poäng}`);
const ekNy = fullastSvar("EKOSYSTEM", "nybörjare", KARTA);
testa("B5 poängformel omvänd: nybörjare-läge på I-kurs = 86", ekNy.svar?.poäng === 86, `poäng=${ekNy.svar?.poäng}`);

// (C) OPTIONS & DERIVAT: od-07 (Avancerad) nominerad för fulläst avancerad läsare
const odF = fullastSvar("OPTIONS & DERIVAT", "avancerad", KARTA);
const odFöre = fullastSvar("OPTIONS & DERIVAT", "avancerad", FÖR_KARTA);
testa("C1 OPTIONS fullläst FÖRE: 0 kandidater", odFöre.svar === null, JSON.stringify(odFöre.svar));
testa("C2 OPTIONS fullläst EFTER: od-07 nominerad", odF.svar?.slug === "od-07-terminskontraktet", JSON.stringify(odF.svar && { slug: odF.svar.slug, poäng: odF.svar.poäng }));
testa("C3 varför-raden genererad med familjetal " + odF.klara.length + " steg",
  odF.svar?.varför === `Du är igång i options & derivat — ${odF.klara.length} steg ligger bakom dig, och Terminskontraktet — priset idag, leveransen sedan fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, odF.svar?.varför);
testa("C4 poäng 90 (nivåmatch Avancerad/avancerad)", odF.svar?.poäng === 90, `poäng=${odF.svar?.poäng}`);
const odNy = fullastSvar("OPTIONS & DERIVAT", "nybörjare", KARTA);
testa("C5 poängformel omvänd: nybörjare-läge på A-kurs = 86", odNy.svar?.poäng === 86, `poäng=${odNy.svar?.poäng}`);

// (D) Kartordning: delvis läsare → lägst kartindex i kategorin (nya kursen stjäl ingen plats)
const delvisMa = ["ma-01-transmissionsmekaniken"];
const delvisMaSvar = kategoriFortsattning(KARTA, delvisMa, "nybörjare");
const forvantadMa = KARTA.filter((k) => k.kategori === "MAKROEKONOMI & RÄNTA" && !delvisMa.includes(k.slug) && k.kraverFas <= 1)[0];
testa("D1 kartordning: delvis MAKRO-läsare får " + forvantadMa.slug + " (lägst kartindex) — nya kursen stjäl ingen plats", delvisMaSvar?.slug === forvantadMa.slug, `svar=${delvisMaSvar?.slug}`);
const delvisOd = ["od-01-optionens-greker"];
const delvisOdSvar = kategoriFortsattning(KARTA, delvisOd, "nybörjare");
const forvantadOd = KARTA.filter((k) => k.kategori === "OPTIONS & DERIVAT" && !delvisOd.includes(k.slug) && k.kraverFas <= 1)[0];
testa("D2 kartordning OPTIONS: delvis läsare får " + forvantadOd.slug + " i kartordning (od-07 ligger sist i od-serien)", delvisOdSvar?.slug === forvantadOd.slug, `svar=${delvisOdSvar?.slug}`);

// (E) Försvarsläge: 0 klara ⇒ vilar
testa("E1 försvarsläge: 0 klara ⇒ null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (F) Determinism
const r1 = JSON.stringify(kategoriFortsattning(KARTA, maF.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, ekF.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, odF.klara, "avancerad"));
const r2 = JSON.stringify(kategoriFortsattning(KARTA, maF.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, ekF.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, odF.klara, "avancerad"));
testa("F1 determinism: två körningar bitidentiska", r1 === r2);

// (G) Nivådata i kartan för de tre (registeräkthet i kartledet)
for (const [slug, niva] of [["ma-06-aktiernas-riskpremie", 2], ["ek-06-bayesianska-omviktningen", 2], ["od-07-terminskontraktet", 3]]) {
  const k = KARTA.find((x) => x.slug === slug);
  testa("G " + slug + " niva " + niva + " kraverFas 0", k && k.niva === niva && k.kraverFas === 0, k && `niva=${k.niva} fas=${k.kraverFas}`);
}

// (H) Syskonfred: u2:s rs-08 nomineras för läsare som läst allt utom den (u2:s 90p-test lever vid mitt registerläge)
const riskFamilj = familj("RISK").map((k) => k.slug);
const riskUtan08 = riskFamilj.filter((s) => s !== "rs-08-modellrisken");
const rsSvar = kategoriFortsattning(KARTA, riskUtan08, "växande");
const rs08 = KARTA.find((k) => k.slug === "rs-08-modellrisken");
const rs08Poang = BAS_FORTSATTNING + (rs08 && rs08.niva === 2 ? PASLAG_NIVA_MATCH : 0);
testa("H1 syskon: RISK-läsare utan rs-08 får rs-08 nominerad (u2:s kurs lever)", rsSvar?.slug === "rs-08-modellrisken" && rsSvar?.poäng === rs08Poang, JSON.stringify(rsSvar && { slug: rsSvar.slug, poäng: rsSvar.poäng, väntat: rs08Poang }));

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — ma-06 + ek-06 + od-07 nomineras med genererade varför-rader (kategori-fortsättning BAS 86 + nivåmatch +4). Karta ${KARTA.length} kurser.`);
