#!/usr/bin/env node
/**
 * FRONT B — s5-u2 manifest auto-s5-1789789514860 (omgång 18):
 * rp-04-volatilitetsbudgeten + kt-05-katalysatorernas-kalender.
 * Register: 435 (dynamiskt läst — u1:s se-17 landade under mitt fönster).
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (BAS 86 + nivåmatch +4)
 * med EXAKTA filter — motorkod orörd. Bevisar: nominering med GENERERADE
 * varför-rader för fulllästa familjeläsare, poängformeln från båda riktningarna,
 * kartordning, försvarsläge vilar, determinism bitidentisk, syskonfred.
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

const NYA = ["rp-04-volatilitetsbudgeten", "kt-05-katalysatorernas-kalender"];
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

// (A) RISKHANTERING & PORTFÖLJTEORI: rp-04 (Intermediär) nomineras för fulläst växande läsare
const rpF = fullastSvar("RISKHANTERING & PORTFÖLJTEORI", "växande", KARTA);
const rpFöre = fullastSvar("RISKHANTERING & PORTFÖLJTEORI", "växande", FÖR_KARTA);
testa("A1 RP fullläst FÖRE: 0 kandidater", rpFöre.svar === null, JSON.stringify(rpFöre.svar));
testa("A2 RP fullläst EFTER: rp-04 nominerad", rpF.svar?.slug === "rp-04-volatilitetsbudgeten", JSON.stringify(rpF.svar && { slug: rpF.svar.slug, poäng: rpF.svar.poäng }));
testa("A3 varför-raden genererad med familjetal " + rpF.klara.length + " steg",
  rpF.svar?.varför === `Du är igång i riskhantering & portföljteori — ${rpF.klara.length} steg ligger bakom dig, och Volatilitetsbudgeten — portföljens risk satt i ett tal och fördelad i kronor fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, rpF.svar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Intermediär/växande)", rpF.svar?.poäng === 90, `poäng=${rpF.svar?.poäng}`);
const rpAvd = fullastSvar("RISKHANTERING & PORTFÖLJTEORI", "avancerad", KARTA);
testa("A5 poängformel omvänd riktning: avancerat lästillstånd på I-kurs = 86", rpAvd.svar?.poäng === 86, `poäng=${rpAvd.svar?.poäng}`);

// (B) KATALYSATOR: kt-05 (Avancerad) nomineras för fulläst avancerad läsare
const ktF = fullastSvar("KATALYSATOR", "avancerad", KARTA);
const ktFöre = fullastSvar("KATALYSATOR", "avancerad", FÖR_KARTA);
testa("B1 KATALYSATOR fullläst FÖRE: 0 kandidater", ktFöre.svar === null, JSON.stringify(ktFöre.svar));
testa("B2 KATALYSATOR fullläst EFTER: kt-05 nominerad", ktF.svar?.slug === "kt-05-katalysatorernas-kalender", JSON.stringify(ktF.svar && { slug: ktF.svar.slug, poäng: ktF.svar.poäng }));
testa("B3 varför-raden genererad med familjetal " + ktF.klara.length + " steg",
  ktF.svar?.varför === `Du är igång i katalysator — ${ktF.klara.length} steg ligger bakom dig, och Katalysatorernas kalender — att bygga händelsekartan och läsa klustren fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, ktF.svar?.varför);
testa("B4 poäng 90 (nivåmatch Avancerad/avancerad)", ktF.svar?.poäng === 90, `poäng=${ktF.svar?.poäng}`);
const ktNy = fullastSvar("KATALYSATOR", "nybörjare", KARTA);
testa("B5 poängformel omvänd: nybörjare-läge på A-kurs = 86", ktNy.svar?.poäng === 86, `poäng=${ktNy.svar?.poäng}`);

// (C) Kartordning: delvis läsare → lägst kartindex i kategorin (nya kursen stjäl ingen plats)
const delvisRp = ["rp-01-riskmattens-karta"];
const delvisRpSvar = kategoriFortsattning(KARTA, delvisRp, "nybörjare");
const forvantadRp = KARTA.filter((k) => k.kategori === "RISKHANTERING & PORTFÖLJTEORI" && !delvisRp.includes(k.slug) && k.kraverFas <= 1)[0];
testa("C1 kartordning: delvis RP-läsare får " + forvantadRp.slug + " (lägst kartindex) — nya kursen stjäl ingen plats", delvisRpSvar?.slug === forvantadRp.slug, `svar=${delvisRpSvar?.slug}`);
const delvisKt = ["kt-01-vad-ar-en-katalysator"];
const delvisKtSvar = kategoriFortsattning(KARTA, delvisKt, "nybörjare");
const forvantadKt = KARTA.filter((k) => k.kategori === "KATALYSATOR" && !delvisKt.includes(k.slug) && k.kraverFas <= 1)[0];
testa("C2 kartordning KATALYSATOR: delvis läsare får " + forvantadKt.slug + " i kartordning (kt-05 ligger sist i kt-serien)", delvisKtSvar?.slug === forvantadKt.slug, `svar=${delvisKtSvar?.slug}`);

// (D) Försvarsläge: 0 klara ⇒ vilar
testa("D1 försvarsläge: 0 klara ⇒ null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (E) Determinism
const r1 = JSON.stringify(kategoriFortsattning(KARTA, rpF.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, ktF.klara, "avancerad"));
const r2 = JSON.stringify(kategoriFortsattning(KARTA, rpF.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, ktF.klara, "avancerad"));
testa("E1 determinism: två körningar bitidentiska", r1 === r2);

// (F) Nivådata i kartan för de två (registeräkthet i kartledet)
for (const [slug, niva] of [["rp-04-volatilitetsbudgeten", 2], ["kt-05-katalysatorernas-kalender", 3]]) {
  const k = KARTA.find((x) => x.slug === slug);
  testa("F " + slug + " niva " + niva + " kraverFas 0", k && k.niva === niva && k.kraverFas === 0, k && `niva=${k.niva} fas=${k.kraverFas}`);
}

// (G) Syskonfred: u1:s se-17 nomineras för SEKTORANALYS-läsare som läst allt utom den
const seFamilj = familj("SEKTORANALYS").map((k) => k.slug);
const seUtan17 = seFamilj.filter((s) => s !== "se-17-skogssektorn");
const seSvar = kategoriFortsattning(KARTA, seUtan17, "växande");
testa("G1 syskon: SEKTORANALYS-läsare utan se-17 får se-17 nominerad (u1:s kurs lever vid mitt registerläge)", seSvar?.slug === "se-17-skogssektorn", JSON.stringify(seSvar && { slug: seSvar.slug, poäng: seSvar.poäng }));

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — rp-04 + kt-05 nomineras med genererade varför-rader (kategori-fortsättning BAS 86 + nivåmatch +4). Karta ${KARTA.length} kurser.`);
