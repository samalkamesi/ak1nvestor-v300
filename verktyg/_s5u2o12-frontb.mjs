#!/usr/bin/env node
/**
 * FRONT B — s5-u2 omgång 12 (manifest auto-s5-1789657528556): kt-04 + rs-06.
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (rad 308–341) med dess
 * EXAKTA filter — motorkod orörd (diff larvag.ts/kurstips.ts/kurs-access.ts
 * ska vara tom). Bevisar att de nya kurserna nomineras med GENERERADE
 * varför-rader för fulllästa familjeläsare, att poängformeln gäller från båda
 * riktningarna (+4 ENDAST vid nivåmatch), att kartordningen bevaras, att
 * försvarsläget vilar samt att determinismen är bitidentisk.
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
if (KARTA.length !== 398) { console.error(`FEL: kartan bär ${KARTA.length} kurser (väntat 398).`); process.exit(1); }

const NYA = ["kt-04-den-uteblivna-katalysatorn", "rs-06-riskens-anatomi"];

// ── Läsreplik av regeln (larvag.ts:308-341) ─────────────────────────────────
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

// (A) Fullläst KATALYSATOR-läsare FÖRE (kartan utan de nya) → regeln vilar
const kataFöre = familj("KATALYSATOR").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
const kataFöreSvar = kategoriFortsattning(FÖR_KARTA, kataFöre, "växande");
testa("A1 KATALYSATOR fullläst FÖRE: 0 kandidater (familjen slutläst, regeln vilar)", kataFöreSvar === null, `svar=${JSON.stringify(kataFöreSvar)}`);

// (A) EFTER: kt-04 nomineras med genererad varför-rad, 90p (86 + 4 nivåmatch)
const kataEfter = kataFöre.slice(); // familjen fulläst på 396-läget
const kataSvar = kategoriFortsattning(KARTA, kataEfter, "växande");
testa("A2 KATALYSATOR fullläst EFTER: kt-04 nominerad", kataSvar?.slug === "kt-04-den-uteblivna-katalysatorn", JSON.stringify(kataSvar && { slug: kataSvar.slug, poäng: kataSvar.poäng }));
testa("A3 varför-raden genererad med familjetal 6 steg", kataSvar?.varför === "Du är igång i katalysator — 6 steg ligger bakom dig, och Den uteblivna katalysatorn — när händelsen kommer och ingenting händer fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.", kataSvar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Intermediär mot växande), vIndex −1 = inget V-plus", kataSvar?.poäng === 90, `poäng=${kataSvar?.poäng}`);

// (B) Fullläst RISK-läsare: rs-06 nominerad
const riskFöre = familj("RISK").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
const riskFöreSvar = kategoriFortsattning(FÖR_KARTA, riskFöre, "växande");
testa("B1 RISK fullläst FÖRE: 0 kandidater", riskFöreSvar === null, `svar=${JSON.stringify(riskFöreSvar)}`);
const riskSvar = kategoriFortsattning(KARTA, riskFöre, "växande");
testa("B2 RISK fullläst EFTER: rs-06 nominerad", riskSvar?.slug === "rs-06-riskens-anatomi", JSON.stringify(riskSvar && { slug: riskSvar.slug, poäng: riskSvar.poäng }));
testa("B3 varför-raden genererad med familjetal 6 steg", riskSvar?.varför === "Du är igång i risk — 6 steg ligger bakom dig, och Riskens anatomi — de fyra adresserna där risken bor fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.", riskSvar?.varför);
testa("B4 poäng 90 (nivåmatch Intermediär/växande)", riskSvar?.poäng === 90, `poäng=${riskSvar?.poäng}`);

// (C) Poängformeln från båda riktningarna: utan nivåmatch 86
const kataNy = kategoriFortsattning(KARTA, kataEfter, "nybörjare");
const kataAvd = kategoriFortsattning(KARTA, kataEfter, "avancerad");
testa("C1 nybörjarlästillstånd: 86 (målnivå 1 matchar inte niva 2)", kataNy?.poäng === 86, `poäng=${kataNy?.poäng}`);
testa("C2 avancerat lästillstånd: 86 (målnivå 3 matchar inte niva 2)", kataAvd?.poäng === 86, `poäng=${kataAvd?.poäng}`);

// (D) Kartordning: delvis KATALYSATOR-läsare (endast v16 klar av familjen +
//     ingen annan kategori påbörjad) → lägst kartindex vinner (v17, ej kt-04)
const delvisKlart = ["v16-produktlanseringar"];
const delvisSvar = kategoriFortsattning(KARTA, delvisKlart, "växande");
testa("D1 kartordning: delvis läsare får v17 (lägre kartindex) FÖRE kt-04", delvisSvar?.slug === "v17-avtal-partnerskap", `svar=${delvisSvar?.slug}`);

// (E) Försvarsläge: 0 klara ⇒ ingen kategori påbörjad ⇒ regeln vilar tyst
testa("E1 försvarsläge: 0 klara ⇒ null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (F) Determinism: bitidentisk vid omkörning
const r1 = JSON.stringify(kategoriFortsattning(KARTA, kataEfter, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, riskFöre, "växande"));
const r2 = JSON.stringify(kategoriFortsattning(KARTA, kataEfter, "växande")) + JSON.stringify(kategoriFortsattning(KARTA, riskFöre, "växande"));
testa("F1 determinism: två körningar bitidentiska", r1 === r2);

// ── Rapport ─────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN: ${pass.length} PASS 0 FAIL — kt-04 + rs-06 nomineras med genererade varför-rader (kategori-fortsättning BAS 86 + nivåmatch +4).`);
