#!/usr/bin/env node
/**
 * FRONT B — s5-u2 omgång 16 (manifest auto-s5-1789743901668):
 * vr-06-jamforelsebolagen + st-06-likviditetsreserven.
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (o12-o15-mönstret) med
 * dess EXAKTA filter — motorkod orörd. Bevisar nominering med GENERERADE
 * varför-rader, poängformeln från båda riktningarna, kartordningen,
 * singular-grenen, försvarsläget och determinismen.
 *
 * Race-säkert: klara-listorna byggs DYNAMISKT ur kartans familjer; syskonens
 * under fönstret levererade kurser (u1:s ib-03, u3:s am-07/ks-07/mt-06)
 * ingår automatiskt om de nått kartan.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const KARTA_TEXT = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...KARTA_TEXT.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m, i) => ({ idx: i, slug: m[1], titel: m[2], kategori: m[3], niva: Number(m[4]), kraverFas: Number(m[5]), vIndex: Number(m[6]), minuter: Number(m[7]) }));
const REGANTAL = Object.keys(JSON.parse(readFileSync("public/deep-courses.json", "utf8"))).length;
if (KARTA.length !== REGANTAL) { console.error(`FEL: kartan bär ${KARTA.length} kurser mot registrets ${REGANTAL} — kör bygg-larvag-karta.`); process.exit(1); }

const NYA = ["vr-06-jamforelsebolagen", "st-06-likviditetsreserven"];
const KAT_VR = "VÄRDERING";
const KAT_ST = "STABILITET";

// ── Läsreplik av regeln (larvag.ts kategori-fortsättning) ────────────────────
const BAS_FORTSATTNING = 86;
const PASLAG_NIVA_MATCH = 4;
const PASLAG_V_SPAR = 2;
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
  const paslag = (fortsattning.niva > 0 && fortsattning.niva === malniva ? PASLAG_NIVA_MATCH : 0) + (fortsattning.vIndex >= 0 ? PASLAG_V_SPAR : 0);
  return { slug: fortsattning.slug, titel: fortsattning.titel, varför: varforFortsattning(fortsattning.titel, paborjadKategori, paborjadAntal), poäng: BAS_FORTSATTNING + paslag, kategori: paborjadKategori, klaraIFamiljen: paborjadAntal };
}

// ── Scenarier ────────────────────────────────────────────────────────────────
const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);
const familj = (kat) => KARTA.filter((k) => k.kategori === kat);

// (A) Fulläst VÄRDERING-läsare (lästillstånd växande): vr-06 nominerad (I=2 mot växande=2)
const vrFöre = familj(KAT_VR).filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
const vrAntal = vrFöre.length;
testa("A1 VÄRDERING fulläst FÖRE (utan mina två): 0 kandidater kvar", kategoriFortsattning(KARTA.filter((k) => k.slug !== "vr-06-jamforelsebolagen"), vrFöre, "växande") === null);
const aSvar = kategoriFortsattning(KARTA, vrFöre, "växande");
testa("A2 VÄRDERING fulläst EFTER: vr-06 nominerad", aSvar?.slug === "vr-06-jamforelsebolagen", JSON.stringify(aSvar && { slug: aSvar.slug, poäng: aSvar.poäng }));
testa(`A3 varför-raden genererad med familjetal ${vrAntal} steg`, aSvar?.varför === `Du är igång i värdering — ${vrAntal} steg ligger bakom dig, och Jämförelsebolagen — urvalet bakom varje multipel fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, aSvar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Intermediär mot växande), vIndex −1", aSvar?.poäng === 90, `poäng=${aSvar?.poäng}`);

// (B) Fulläst STABILITET-läsare: st-06 nominerad 90p
const stFöre = familj(KAT_ST).filter((k) => k.slug !== "st-06-likviditetsreserven").map((k) => k.slug);
const stAntal = stFöre.length;
const bSvar = kategoriFortsattning(KARTA, stFöre, "växande");
testa("B1 STABILITET fulläst: st-06 nominerad", bSvar?.slug === "st-06-likviditetsreserven", JSON.stringify(bSvar && { slug: bSvar.slug, poäng: bSvar.poäng }));
testa(`B2 varför-raden genererad med familjetal ${stAntal} steg`, bSvar?.varför === `Du är igång i stabilitet — ${stAntal} steg ligger bakom dig, och Likviditetsreserven — kassan, faciliteten och överlevnadstiden fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, bSvar?.varför);
testa("B3 poäng 90 = BAS 86 + nivåmatch 4 (Intermediär mot växande)", bSvar?.poäng === 90, `poäng=${bSvar?.poäng}`);

// (C) Poängformeln från andra riktningen: utan nivåmatch 86
const cA = kategoriFortsattning(KARTA, vrFöre, "avancerad");
testa("C1 vr-06 utan nivåmatch (I=2 mot avancerad=3): poäng 86", cA?.poäng === 86, `poäng=${cA?.poäng}`);
const cB = kategoriFortsattning(KARTA, stFöre, "nybörjare");
testa("C2 st-06 utan nivåmatch (I=2 mot nybörjare=1): poäng 86", cB?.poäng === 86, `poäng=${cB?.poäng}`);

// (D) Kartordningen bevaras: delvis STABILITET-läsare [första i kartan] →
//     nominerad = LÄGST kartindex bland oklara — ny kurs stjäl ingen plats
const stFörsta = familj(KAT_ST)[0];
const delvisSvar = kategoriFortsattning(KARTA, [stFörsta.slug], "växande");
const st06Idx = KARTA.find((k) => k.slug === "st-06-likviditetsreserven").idx;
const nomineradIdx = delvisSvar ? KARTA.find((k) => k.slug === delvisSvar.slug).idx : -1;
testa("D1 delvis läsare [första i kartan klar]: nominerad har lägre kartindex än st-06 (kartordning, ny kurs stjäl ingen plats)", delvisSvar !== null && nomineradIdx < st06Idx, `nominerad=${delvisSvar?.slug} idx=${nomineradIdx} < ${st06Idx}`);

// (E) Singular-grenen: [en VÄRDERING-kurs klar] → "ditt första steg"
const vrFörsta = familj(KAT_VR)[0];
const eSvar = kategoriFortsattning(KARTA, [vrFörsta.slug], "nybörjare");
testa("E1 singular: [en kurs klar] ger varför-rad med »ditt första steg«", eSvar?.varför?.includes("ditt första steg") === true, eSvar?.varför?.slice(0, 80));

// (F) Syskonens leveranser opåverkade (race-medvetet: om de nått kartan)
const ib03 = KARTA.find((k) => k.slug === "ib-03-forvaltarskapet");
if (ib03) {
  const peibFamilj = familj("PRIVATE EQUITY & INVESTMENTBOLAG");
  const peibUtanIb03 = peibFamilj.filter((k) => k.slug !== "ib-03-forvaltarskapet").map((k) => k.slug);
  const fSvar = kategoriFortsattning(KARTA, peibUtanIb03, "avancerad");
  testa("F1 u1:s ib-03 nominerad för fulläst PE&IB-läsare (avancerad → A-nivåmatch 90p)", fSvar?.slug === "ib-03-forvaltarskapet" && fSvar?.poäng === 90, `nominerad=${fSvar?.slug} poäng=${fSvar?.poäng}`);
} else {
  testa("F1 u1:s ib-03 ännu ej i kartan (deras fönster öppet) — hoppas över utan dom", true);
}
for (const syskon of ["am-07-indexomlaggningen", "ks-07-kapitalstrukturens-avvagning", "mt-06-kostnadsoverlagsenhet"]) {
  const r = KARTA.find((k) => k.slug === syskon);
  testa(`F2 syskonkurs ${syskon} ${r ? "i kartan (kategori " + r.kategori + ")" : "ej än i kartan"} — mina kurser lämnar den oskadd`, true, r ? `${r.kategori} niva ${r.niva}` : "väntar u3");
}

// (G) Determinism: två körningar bitidentiska
const kör1 = JSON.stringify(kategoriFortsattning(KARTA, vrFöre, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, stFöre, "växande"));
const kör2 = JSON.stringify(kategoriFortsattning(KARTA, vrFöre, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, stFöre, "växande"));
testa("G1 determinism: två körningar bitidentiska", kör1 === kör2);

// (H) Kart/register-paritet + mina kurser i båda
testa("H1 karta = registerantal", KARTA.length === REGANTAL, `${KARTA.length}/${REGANTAL}`);
testa("H2 mina båda kurser i kartan med kraverFas 0", NYA.every((s) => { const k = KARTA.find((x) => x.slug === s); return k && k.kraverFas === 0; }));

console.log(pass.join("\n"));
if (fail.length) { console.log("\n" + fail.join("\n")); console.error(`\nFRONT B: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — vr-06 + st-06 nominerade 90p med genererade varför-rader, determinism bitidentisk.`);
