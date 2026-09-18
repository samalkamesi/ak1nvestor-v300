#!/usr/bin/env node
/**
 * FRONT B — s5-u3 manifest auto-s5-1789722300593 (omgång 15):
 * vr-05-pris-och-varde + tx-05-tillvaxtens-forsta-lasning + roic-03-inkrementell-roic.
 * Register: u1:s 415-läge + u2:s ib-02/pe-04 + mina +3 = 420 (dynamiskt läst).
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
const VANTAT_ANTAL = Number((KARTA_TEXT.match(/LARVAG_ANTAL_KURSER = (\d+)/) || [])[1] ?? 0);
if (KARTA.length !== VANTAT_ANTAL) { console.error(`FEL: kartan bär ${KARTA.length} kurser (konstant ${VANTAT_ANTAL}).`); process.exit(1); }
console.log(`─ karta: ${KARTA.length} kurser (konstant ${VANTAT_ANTAL})`);

const NYA = ["vr-05-pris-och-varde", "tx-05-tillvaxtens-forsta-lasning", "roic-03-inkrementell-roic"];
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

// (A) VÄRDERING: vr-05 (Nybörjare) nomineras för fulläst nybörjar-läsare
const vrF = fullastSvar("VÄRDERING", "nybörjare", KARTA);
const vrFöre = fullastSvar("VÄRDERING", "nybörjare", FÖR_KARTA);
testa("A1 VÄRDERING fullläst FÖRE: 0 kandidater", vrFöre.svar === null, JSON.stringify(vrFöre.svar));
testa("A2 VÄRDERING fullläst EFTER: vr-05 nominerad", vrF.svar?.slug === "vr-05-pris-och-varde", JSON.stringify(vrF.svar && { slug: vrF.svar.slug, poäng: vrF.svar.poäng }));
testa("A3 varför-raden genererad med familjetal " + vrF.klara.length + " steg",
  vrF.svar?.varför === `Du är igång i värdering — ${vrF.klara.length} steg ligger bakom dig, och Pris och värde — aktiens två tal och första jämförelsen fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, vrF.svar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Nybörjare/nybörjare)", vrF.svar?.poäng === 90, `poäng=${vrF.svar?.poäng}`);
const vrAvd = fullastSvar("VÄRDERING", "avancerad", KARTA);
testa("A5 poängformel omvänd riktning: avancerat lästillstånd på N-kurs = 86", vrAvd.svar?.poäng === 86, `poäng=${vrAvd.svar?.poäng}`);

// (B) TILLVÄXT: tx-05 (Nybörjare) nominerad
const txF = fullastSvar("TILLVÄXT", "nybörjare", KARTA);
const txFöre = fullastSvar("TILLVÄXT", "nybörjare", FÖR_KARTA);
testa("B1 TILLVÄXT fullläst FÖRE: 0 kandidater", txFöre.svar === null, JSON.stringify(txFöre.svar));
testa("B2 TILLVÄXT fullläst EFTER: tx-05 nominerad", txF.svar?.slug === "tx-05-tillvaxtens-forsta-lasning", JSON.stringify(txF.svar && { slug: txF.svar.slug, poäng: txF.svar.poäng }));
testa("B3 varför-raden genererad med familjetal " + txF.klara.length + " steg",
  txF.svar?.varför === `Du är igång i tillväxt — ${txF.klara.length} steg ligger bakom dig, och Tillväxtens första läsning — årtal, procent och tjocka filtar fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, txF.svar?.varför);
testa("B4 poäng 90 (nivåmatch Nybörjare/nybörjare)", txF.svar?.poäng === 90, `poäng=${txF.svar?.poäng}`);
const txVax = fullastSvar("TILLVÄXT", "växande", KARTA);
testa("B5 poängformel omvänd: växande lästillstånd på N-kurs = 86", txVax.svar?.poäng === 86, `poäng=${txVax.svar?.poäng}`);

// (C) LÖNSAMHET: roic-03 (Avancerad) nominerad för fulläst avancerad läsare
const lnF = fullastSvar("LÖNSAMHET", "avancerad", KARTA);
const lnFöre = fullastSvar("LÖNSAMHET", "avancerad", FÖR_KARTA);
testa("C1 LÖNSAMHET fullläst FÖRE: 0 kandidater", lnFöre.svar === null, JSON.stringify(lnFöre.svar));
testa("C2 LÖNSAMHET fullläst EFTER: roic-03 nominerad", lnF.svar?.slug === "roic-03-inkrementell-roic", JSON.stringify(lnF.svar && { slug: lnF.svar.slug, poäng: lnF.svar.poäng }));
testa("C3 varför-raden genererad med familjetal " + lnF.klara.length + " steg",
  lnF.svar?.varför === `Du är igång i lönsamhet — ${lnF.klara.length} steg ligger bakom dig, och Inkrementell ROIC — nästa kronas avkastning och medeltalets blindhet fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, lnF.svar?.varför);
testa("C4 poäng 90 (nivåmatch Avancerad/avancerad)", lnF.svar?.poäng === 90, `poäng=${lnF.svar?.poäng}`);
const lnNy = fullastSvar("LÖNSAMHET", "nybörjare", KARTA);
testa("C5 poängformel omvänd: nybörjare-läge på A-kurs = 86", lnNy.svar?.poäng === 86, `poäng=${lnNy.svar?.poäng}`);

// (D) Kartordning: delvis TILLVÄXT-läsare (endast tx-01 klar) → lägst kartindex i kategorin
const delvis = ["tx-01-organisk-mot-forvarvad-tillvaxt"];
const delvisSvar = kategoriFortsattning(KARTA, delvis, "nybörjare");
const forvantadDelvis = KARTA.filter((k) => k.kategori === "TILLVÄXT" && !delvis.includes(k.slug) && k.kraverFas <= 1)[0];
testa("D1 kartordning: delvis TILLVÄXT-läsare får " + forvantadDelvis.slug + " (lägst kartindex) — nya kursen stjäl ingen plats", delvisSvar?.slug === forvantadDelvis.slug, `svar=${delvisSvar?.slug}`);
const delvisVr = kategoriFortsattning(KARTA, ["vr-01-multipelgapet"], "nybörjare");
const forvantadVr = KARTA.filter((k) => k.kategori === "VÄRDERING" && k.slug !== "vr-01-multipelgapet" && k.kraverFas <= 1)[0];
testa("D2 kartordning VÄRDERING: delvis läsare får " + forvantadVr.slug + " i kartordning (vr-05 ligger sist i vr-serien)", delvisVr?.slug === forvantadVr.slug, `svar=${delvisVr?.slug}`);

// (E) Försvarsläge: 0 klara ⇒ vilar
testa("E1 försvarsläge: 0 klara ⇒ null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (F) Determinism
const r1 = JSON.stringify(kategoriFortsattning(KARTA, vrF.klara, "nybörjare")) + JSON.stringify(kategoriFortsattning(KARTA, txF.klara, "nybörjare")) + JSON.stringify(kategoriFortsattning(KARTA, lnF.klara, "avancerad"));
const r2 = JSON.stringify(kategoriFortsattning(KARTA, vrF.klara, "nybörjare")) + JSON.stringify(kategoriFortsattning(KARTA, txF.klara, "nybörjare")) + JSON.stringify(kategoriFortsattning(KARTA, lnF.klara, "avancerad"));
testa("F1 determinism: två körningar bitidentiska", r1 === r2);

// (G) Nivådata i kartan för de tre (registeräkthet i kartledet)
for (const [slug, niva] of [["vr-05-pris-och-varde", 1], ["tx-05-tillvaxtens-forsta-lasning", 1], ["roic-03-inkrementell-roic", 3]]) {
  const k = KARTA.find((x) => x.slug === slug);
  testa("G " + slug + " niva " + niva + " kraverFas 0", k && k.niva === niva && k.kraverFas === 0, k && `niva=${k.niva} fas=${k.kraverFas}`);
}

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — vr-05 + tx-05 + roic-03 nomineras med genererade varför-rader (kategori-fortsättning BAS 86 + nivåmatch +4). Karta ${KARTA.length} kurser.`);
