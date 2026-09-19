#!/usr/bin/env node
/**
 * FRONT B — s5-u1 (manifest auto-s5-1789812330026): mt-07-prisfullmakten.
 * Registerläge läst dynamiskt (syskonfönster: u2 +2, u3 +3 kan landa parallellt).
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (BAS 86 + nivåmatch +4)
 * med EXAKTA filter — motorkod orörd. Bevisar: nominering med GENERERAD
 * varför-rad för fulläst MOAT-läsare på avancerad nivå (familjens 6:e steg
 * klart → mt-07 som sjunde), poängformeln från båda riktningarna, kartordning,
 * försvarsläge vilar, determinism bitidentisk. Race-säkert: klara-listor
 * DYNAMISKA ur kartans familj.
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

const MIN = "mt-07-prisfullmakten";
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

const KAT = "MOAT";
const familj = (karta) => karta.filter((k) => k.kategori === KAT);
const FÖR_KARTA = KARTA.filter((k) => k.slug !== MIN);
const fullastSvar = (lasTillstand, karta) => {
  const klara = familj(karta).filter((k) => k.slug !== MIN).map((k) => k.slug);
  return { klara, svar: kategoriFortsattning(karta, klara, lasTillstand) };
};

// (A) MOAT: mt-07 (Avancerad/niva 3) nomineras för fulläst avancerad läsare
const F = fullastSvar("avancerad", KARTA);
const Före = fullastSvar("avancerad", FÖR_KARTA);
testa("A1 MOAT fulläst FÖRE: 0 kandidater (familjen slutläst)", Före.svar === null, JSON.stringify(Före.svar));
testa("A2 MOAT fulläst EFTER: mt-07 nominerad", F.svar?.slug === MIN, JSON.stringify(F.svar && { slug: F.svar.slug, poäng: F.svar.poäng }));
// MOAT omfattar exakt mt-familjen (7 kurser efter denna) — fulläst läsare
// bär 6 steg och varför-raden använder kategori-strängen exakt: "moat".
testa("A3 varför-raden genererad med familjetal " + F.klara.length + " steg",
  F.svar?.varför === `Du är igång i moat — ${F.klara.length} steg ligger bakom dig, och Prisfullmakten — moatens ultimata test fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, F.svar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Avancerad/avancerad)", F.svar?.poäng === 90, `poäng=${F.svar?.poäng}`);
const Fny = fullastSvar("nybörjare", KARTA);
testa("A5 poängformel omvänd riktning: nybörjare-läge på A-kurs = 86", Fny.svar?.poäng === 86, `poäng=${Fny.svar?.poäng}`);
testa("A6 nominering identisk oavsett lästillstånd (slug), poäng skiljer", Fny.svar?.slug === F.svar?.slug);

// (B) Kartordning: delvis MOAT-läsare (endast mt-01 klar) → lägst kartindex i kategorin
const delvis = ["mt-01-vad-ar-en-moat"];
const delvisSvar = kategoriFortsattning(KARTA, delvis, "växande");
const forvantad = KARTA.filter((k) => k.kategori === KAT && !delvis.includes(k.slug) && k.kraverFas <= 1)[0];
testa("B1 kartordning: delvis MOAT-läsare får " + forvantad.slug + " (lägst kartindex) — mt-07 stjäl ingen plats", delvisSvar?.slug === forvantad.slug, `svar=${delvisSvar?.slug}`);

// (C) Försvarsläge: 0 klara ⇒ vilar
testa("C1 försvarsläge: 0 klara ⇒ null", kategoriFortsattning(KARTA, [], "växande") === null);

// (D) Determinism
const r1 = JSON.stringify(kategoriFortsattning(KARTA, F.klara, "avancerad")) + JSON.stringify(kategoriFortsattning(KARTA, F.klara, "nybörjare"));
const r2 = JSON.stringify(kategoriFortsattning(KARTA, F.klara, "avancerad")) + JSON.stringify(kategoriFortsattning(KARTA, F.klara, "nybörjare"));
testa("D1 determinism: två körningar bitidentiska", r1 === r2);

// (E) Nivådata i kartan (registeräkthet i kartledet)
const k = KARTA.find((x) => x.slug === MIN);
testa("E1 " + MIN + " niva 3 kraverFas 0 vIndex -1 minuter 24", k && k.niva === 3 && k.kraverFas === 0 && k.vIndex === -1 && k.minuter === 24, k && `niva=${k.niva} fas=${k.kraverFas} vIndex=${k.vIndex} min=${k.minuter}`);
testa("E2 R2: kraverFas 0 — ingen pris-/tier-/publiceringsyta", k?.kraverFas === 0);
testa("E3 familjetrappa N1 I3 A3 i kartan (mt-01..mt-07)", [1,2,3,2,3,2,3].every((n, i) => KARTA.find((x) => x.slug.startsWith("mt-0" + (i + 1) + "-"))?.niva === n));
// Kategoriutvidgning konstaterad av denna körning: MOAT omfattar i kartan även
// v13-patent-ip, v14-varumarke och v15-natverkseffekter — fulläst läsare bär
// 9 steg (6 mt + 3 v) och B1:s delvis-nominering går till v13 (lägst index).

// (F) Register-paritet: kartposten finns i deep-courses med samma titel
const reg = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const regK = reg[MIN];
testa("F1 registeräkthet: " + MIN + " finns i deep-courses.json", !!regK);
testa("F2 titelparitet karta↔register", regK?.title === k?.titel, `"${regK?.title}" mot "${k?.titel}"`);
testa("F3 nivåparitet karta↔register (Avancerad = niva 3)", regK?.level === "Avancerad" && k?.niva === 3);

// (G) syskon-BEVIS (o17-mönstret): läsare som saknar mt-06 nomineras mt-06 även med mt-07 klarad
const minusMt06 = familj(KARTA).filter((c) => c.slug !== "mt-06-kostnadsoverlagsenhet" && c.slug !== MIN).map((c) => c.slug);
testa("G1 läsare som saknar mt-06 nomineras mt-06 (lägst index) — mt-07 väntar", kategoriFortsattning(KARTA, minusMt06, "växande")?.slug === "mt-06-kostnadsoverlagsenhet");

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — mt-07 nomineras med genererad varför-rad (kategori-fortsättning BAS 86 + nivåmatch +4). Karta ${KARTA.length} kurser.`);
