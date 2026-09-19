#!/usr/bin/env node
/**
 * FRONT B — s5-u1 (manifest auto-s5-1789837501089, omgång 20): ma-08-bostadsmarknadens-mekanik.
 * Registerläge läst dynamiskt (syskonfönster: u2 +2, u3 +3 kan landa parallellt).
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (BAS 86 + nivåmatch +4)
 * med EXAKTA filter — motorkod orörd. Bevisar: nominering med GENERERAD
 * varför-rad för fulläst MAKROEKONOMI & RÄNTA-läsare på växande nivå
 * (Intermediär), poängformeln från båda riktningarna, kartordning,
 * försvarsläge vilar, determinism bitidentisk. Race-säkert: klara-listor
 * DYNAMISKA ur kartans familjer.
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

const MIN = "ma-08-bostadsmarknadens-mekanik";
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

const KAT = "MAKROEKONOMI & RÄNTA";
const familj = (karta) => karta.filter((k) => k.kategori === KAT);
const FÖR_KARTA = KARTA.filter((k) => k.slug !== MIN);
const fullastSvar = (lasTillstand, karta) => {
  const klara = familj(karta).filter((k) => k.slug !== MIN).map((k) => k.slug);
  return { klara, svar: kategoriFortsattning(karta, klara, lasTillstand) };
};

// (A) MAKROEKONOMI & RÄNTA: ma-08 (Intermediär/niva 2) nomineras för fulläst växande läsare
// Kategorin omfattar OCKSÅ km-skissfamiljen (km-054..km-058, 5 st) — fulläst
// läsare bär 12 steg (5 km + 7 ma) och varför-raden använder kategori-strängen
// exakt: "makroekonomi & ränta".
const F = fullastSvar("växande", KARTA);
const Före = fullastSvar("växande", FÖR_KARTA);
testa("A1 MAKRO fulläst FÖRE: 0 kandidater", Före.svar === null, JSON.stringify(Före.svar));
testa("A2 MAKRO fulläst EFTER: ma-08 nominerad", F.svar?.slug === MIN, JSON.stringify(F.svar && { slug: F.svar.slug, poäng: F.svar.poäng }));
testa("A3 varför-raden genererad med familjetal " + F.klara.length + " steg",
  F.svar?.varför === `Du är igång i makroekonomi & ränta — ${F.klara.length} steg ligger bakom dig, och Bostadsmarknadens mekanik — lånekraft, tröghet och vägen till börsen fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, F.svar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Intermediär/växande)", F.svar?.poäng === 90, `poäng=${F.svar?.poäng}`);
const Fny = fullastSvar("nybörjare", KARTA);
testa("A5 poängformel omvänd riktning: nybörjare-läge på I-kurs = 86", Fny.svar?.poäng === 86, `poäng=${Fny.svar?.poäng}`);
testa("A6 nominering identisk oavsett lästillstånd (slug), poäng skiljer", Fny.svar?.slug === F.svar?.slug);
const Fadv = fullastSvar("avancerad", KARTA);
testa("A7 avancerad-läsare: nominering ma-08 utan nivåmatch = 86", Fadv.svar?.poäng === 86 && Fadv.svar?.slug === MIN, `poäng=${Fadv.svar?.poäng}`);

// (B) Kartordning: delvis MAKRO-läsare (endast km-054 klar) → lägst kartindex i kategorin
const delvis = ["km-054-ranta"];
const delvisSvar = kategoriFortsattning(KARTA, delvis, "växande");
const forvantad = KARTA.filter((k) => k.kategori === KAT && !delvis.includes(k.slug) && k.kraverFas <= 1)[0];
testa("B1 kartordning: delvis MAKRO-läsare får " + forvantad.slug + " (lägst kartindex) — ma-08 stjäl ingen plats", delvisSvar?.slug === forvantad.slug, `svar=${delvisSvar?.slug}`);

// (C) Försvarsläge: 0 klara ⇒ vilar
testa("C1 försvarsläge: 0 klara ⇒ null", kategoriFortsattning(KARTA, [], "växande") === null);

// (D) Determinism
const r1 = JSON.stringify(kategoriFortsattning(KARTA, F.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, F.klara, "nybörjare"));
const r2 = JSON.stringify(kategoriFortsattning(KARTA, F.klara, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, F.klara, "nybörjare"));
testa("D1 determinism: två körningar bitidentiska", r1 === r2);

// (E) Nivådata i kartan (registeräkthet i kartledet)
const k = KARTA.find((x) => x.slug === MIN);
testa("E1 " + MIN + " niva 2 kraverFas 0 vIndex -1 minuter 24", k && k.niva === 2 && k.kraverFas === 0 && k.vIndex === -1 && k.minuter === 24, k && `niva=${k.niva} fas=${k.kraverFas} vIndex=${k.vIndex} min=${k.minuter}`);
testa("E2 R2: kraverFas 0 — ingen pris-/tier-/publiceringsyta", k?.kraverFas === 0);

// (F) Register-paritet: kartposten finns i deep-courses med samma titel
const reg = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const regK = reg[MIN];
testa("F1 registeräkthet: " + MIN + " finns i deep-courses.json", !!regK);
testa("F2 titelparitet karta↔register", regK?.title === k?.titel, `"${regK?.title}" mot "${k?.titel}"`);
testa("F3 nivåparitet karta↔register (Intermediär = niva 2)", regK?.level === "Intermediér" || (regK?.level === "Intermediär" && k?.niva === 2));

// (G) syskon-BEVIS (o17/o18-mönstret): läsare som saknar ma-07 nomineras ma-07 även med ma-08 klarad
const minusMa07 = familj(KARTA).filter((c) => c.slug !== "ma-07-valutakursens-mekanik" && c.slug !== MIN).map((c) => c.slug);
testa("G1 läsare som saknar ma-07 nomineras ma-07 (lägst index) — ma-08 väntar", kategoriFortsattning(KARTA, minusMa07, "växande")?.slug === "ma-07-valutakursens-mekanik");

// (H) syskonkurser i kartan (race-säkerhet): u2/u3 kan ha landat — deras poster skadar inte ma-08
const syskon = KARTA.filter((x) => x.kategori === KAT && x.slug !== MIN && !/^ma-0[1-7]/.test(x.slug) && !/^km-05[4-8]/.test(x.slug));
console.log("─ notis: syskonkurser i kategorin sedan start: " + (syskon.length ? syskon.map((s) => s.slug).join(", ") : "0"));

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — ma-08 nomineras med genererad varför-rad (kategori-fortsättning BAS 86 + nivåmatch +4). Karta ${KARTA.length} kurser.`);
