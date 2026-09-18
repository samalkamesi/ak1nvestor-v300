#!/usr/bin/env node
/**
 * FRONT B — s5-u1 manifest auto-s5-1789743901668 (omgång 16): ib-03-forvaltarskapet.
 * Registerläge läses dynamiskt (syskonfönster: u2 vr-06+st-06, u3 am-07+ks-07+mt-06).
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (BAS 86 + nivåmatch +4)
 * med EXAKTA filter — motorkod orörd. Bevisar: nominering med GENERERAD
 * varför-rad för fulläst PE&IB-läsare på avancerad nivå, poängformeln från båda
 * riktningarna, kartordning, försvarsläge vilar, determinism bitidentisk.
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

const MIN = "ib-03-forvaltarskapet";
if (!KARTA.find((k) => k.slug === MIN)) { console.error(`FEL: ${MIN} saknas i kartan.`); process.exit(1); }

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

const KAT = "PRIVATE EQUITY & INVESTMENTBOLAG";
const familj = (karta) => karta.filter((k) => k.kategori === KAT);
const FÖR_KARTA = KARTA.filter((k) => k.slug !== MIN);
const fullastSvar = (lasTillstand, karta) => {
  const klara = familj(karta).filter((k) => k.slug !== MIN).map((k) => k.slug);
  return { klara, svar: kategoriFortsattning(karta, klara, lasTillstand) };
};

// (A) PE&IB: ib-03 (Avancerad) nomineras för fulläst avancerad läsare
const F = fullastSvar("avancerad", KARTA);
const Före = fullastSvar("avancerad", FÖR_KARTA);
testa("A1 PE&IB fulläst FÖRE: 0 kandidater", Före.svar === null, JSON.stringify(Före.svar));
testa("A2 PE&IB fulläst EFTER: ib-03 nominerad", F.svar?.slug === MIN, JSON.stringify(F.svar && { slug: F.svar.slug, poäng: F.svar.poäng }));
testa("A3 varför-raden genererad med familjetal " + F.klara.length + " steg",
  F.svar?.varför === `Du är igång i private equity & investmentbolag — ${F.klara.length} steg ligger bakom dig, och Förvaltarskapet — röstvärde, mandat och den aktiva ägaren fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, F.svar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Avancerad/avancerad)", F.svar?.poäng === 90, `poäng=${F.svar?.poäng}`);
const Fny = fullastSvar("nybörjare", KARTA);
testa("A5 poängformel omvänd riktning: nybörjare-läge på A-kurs = 86", Fny.svar?.poäng === 86, `poäng=${Fny.svar?.poäng}`);
testa("A6 nominering identisk oavsett lästillstånd (slug), poäng skiljer", Fny.svar?.slug === F.svar?.slug);

// (B) Kartordning: delvis PE&IB-läsare (endast km-067 klar) → lägst kartindex i kategorin
const delvis = ["km-067-investmentbolag"];
const delvisSvar = kategoriFortsattning(KARTA, delvis, "avancerad");
const forvantad = KARTA.filter((k) => k.kategori === KAT && !delvis.includes(k.slug) && k.kraverFas <= 1)[0];
testa("B1 kartordning: delvis PE&IB-läsare får " + forvantad.slug + " (lägst kartindex) — ib-03 stjäl ingen plats", delvisSvar?.slug === forvantad.slug, `svar=${delvisSvar?.slug}`);

// (C) Försvarsläge: 0 klara ⇒ vilar
testa("C1 försvarsläge: 0 klara ⇒ null", kategoriFortsattning(KARTA, [], "avancerad") === null);

// (D) Determinism
const r1 = JSON.stringify(kategoriFortsattning(KARTA, F.klara, "avancerad")) + JSON.stringify(kategoriFortsattning(KARTA, F.klara, "nybörjare"));
const r2 = JSON.stringify(kategoriFortsattning(KARTA, F.klara, "avancerad")) + JSON.stringify(kategoriFortsattning(KARTA, F.klara, "nybörjare"));
testa("D1 determinism: två körningar bitidentiska", r1 === r2);

// (E) Nivådata i kartan (registeräkthet i kartledet)
const k = KARTA.find((x) => x.slug === MIN);
testa("E1 " + MIN + " niva 3 kraverFas 0 vIndex -1", k && k.niva === 3 && k.kraverFas === 0 && k.vIndex === -1, k && `niva=${k.niva} fas=${k.kraverFas} vIndex=${k.vIndex}`);
testa("E2 R2: kraverFas 0 — ingen pris-/tier-/publiceringsyta", k?.kraverFas === 0);

// (F) Register-paritet: kartposten finns i deep-courses med samma titel
const reg = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const regK = reg[MIN];
testa("F1 registeräkthet: " + MIN + " finns i deep-courses.json", !!regK);
testa("F2 titelparitet karta↔register", regK?.title === k?.titel, `"${regK?.title}" mot "${k?.titel}"`);
testa("F3 nivåparitet karta↔register (Avancerad = niva 3)", regK?.level === "Avancerad" && k?.niva === 3);

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — ib-03 nomineras med genererad varför-rad (kategori-fortsättning BAS 86 + nivåmatch +4). Karta ${KARTA.length} kurser.`);
