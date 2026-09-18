#!/usr/bin/env node
/**
 * FRONT B — s5-u2 omgång 14 (manifest auto-s5-1789701930027): bk-04 + rp-03.
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (u3:o12-mönstret) med
 * dess EXAKTA filter — motorkod orörd. Bevisar att de två nya kurserna
 * nomineras med GENERERADE varför-rader för fulllästa familjeläsare, att
 * poängformeln gäller från båda riktningarna (+4 ENDAST vid nivåmatch), att
 * kartordningen bevaras, att försvarsläget vilar samt att determinismen är
 * bitidentisk.
 *
 * Race-säkert: klara-listorna byggs DYNAMISKT ur den genererade kartans
 * familjer; antalsvakten läser registret LIVE (u1:s tx-04 landade under
 * fönstret — paritet, inte hårdkodat tal).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const KARTA_TEXT = readFileSync("src/lib/larvag-karta.ts", "utf8");

// ── Kartan ur den genererade filen (larvag-synk-mönstret) ────────────────────
const KARTA = [...KARTA_TEXT.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m, i) => ({ idx: i, slug: m[1], titel: m[2], kategori: m[3], niva: Number(m[4]), kraverFas: Number(m[5]), vIndex: Number(m[6]), minuter: Number(m[7]) }));
const REGANTAL = Object.keys(JSON.parse(readFileSync("public/deep-courses.json", "utf8"))).length;
if (KARTA.length !== REGANTAL) { console.error(`FEL: kartan bär ${KARTA.length} kurser mot registrets ${REGANTAL} — kör bygg-larvag-karta.`); process.exit(1); }

const NYA = ["bk-04-koncernredovisningens-grunder", "rp-03-riskparitet"];

// ── Läsreplik av regeln (larvag.ts kategori-fortsättning) ───────────────────
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

// (A) Fullläst BOKFÖRING & ÅRSREDOVISNING-läsare: bk-04 nominerad (I mot växande)
const bkFöre = familj("BOKFÖRING & ÅRSREDOVISNING").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
const bkAntalFöre = bkFöre.length;
testa("A1 BOKFÖRING & ÅRSREDOVISNING fullläst FÖRE: 0 kandidater (familjen slutläst utan bk-04)", kategoriFortsattning(FÖR_KARTA, bkFöre, "växande") === null);
const bkSvar = kategoriFortsattning(KARTA, bkFöre, "växande");
testa("A2 BOKFÖRING & ÅRSREDOVISNING fullläst EFTER: bk-04 nominerad", bkSvar?.slug === "bk-04-koncernredovisningens-grunder", JSON.stringify(bkSvar && { slug: bkSvar.slug, poäng: bkSvar.poäng }));
testa(`A3 varför-raden genererad med familjetal ${bkAntalFöre} steg`, bkSvar?.varför === `Du är igång i bokföring & årsredovisning — ${bkAntalFöre} steg ligger bakom dig, och Koncernredovisning — bolaget som äger bolag: konsolideringens logik fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, bkSvar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Intermediär mot växande), vIndex −1", bkSvar?.poäng === 90, `poäng=${bkSvar?.poäng}`);

// (B) Fullläst RISKHANTERING & PORTFÖLJTEORI-läsare: rp-03 nominerad (A mot avancerad)
const rpFöre = familj("RISKHANTERING & PORTFÖLJTEORI").filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
const rpAntalFöre = rpFöre.length;
testa("B1 RISKHANTERING & PORTFÖLJTEORI fullläst FÖRE: 0 kandidater", kategoriFortsattning(FÖR_KARTA, rpFöre, "avancerad") === null);
const rpSvar = kategoriFortsattning(KARTA, rpFöre, "avancerad");
testa("B2 RISKHANTERING & PORTFÖLJTEORI fullläst EFTER: rp-03 nominerad", rpSvar?.slug === "rp-03-riskparitet", JSON.stringify(rpSvar && { slug: rpSvar.slug, poäng: rpSvar.poäng }));
testa(`B3 varför-raden genererad med familjetal ${rpAntalFöre} steg`, rpSvar?.varför === `Du är igång i riskhantering & portföljteori — ${rpAntalFöre} steg ligger bakom dig, och Riskparitet — att viktta portföljen efter risk, inte kronor fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, rpSvar?.varför);
testa("B4 poäng 90 = BAS 86 + nivåmatch 4 (Avancerad mot avancerad), vIndex −1", rpSvar?.poäng === 90, `poäng=${rpSvar?.poäng}`);

// (C) Poängformeln från andra riktningarna: utan nivåmatch 86
const rpSvarV = kategoriFortsattning(KARTA, rpFöre, "växande");
testa("C1 rp-03 utan nivåmatch (A=3 mot växande=2): poäng 86", rpSvarV?.poäng === 86, `poäng=${rpSvarV?.poäng}`);
const bkSvarA = kategoriFortsattning(KARTA, bkFöre, "avancerad");
testa("C2 bk-04 utan nivåmatch (I=2 mot avancerad=3): poäng 86", bkSvarA?.poäng === 86, `poäng=${bkSvarA?.poäng}`);

// (D) Kartordningen bevaras: delvis BOKFÖRING-läsare (bk-01 klar) →
//     nomineras gör lägst KARTINDEX bland oklara i kategorin (km-001,
//     registrerad före bk-serien) — aldrig bk-04 som ligger sist. Korrekt
//     motorbeteende: ny kurs stjäl ingen plats.
const delvis = ["bk-01-balansrakningen"];
const delvisSvar = kategoriFortsattning(KARTA, delvis, "växande");
const bk04Idx = KARTA.find((k) => k.slug === "bk-04-koncernredovisningens-grunder").idx;
const nomineradIdx = delvisSvar ? KARTA.find((k) => k.slug === delvisSvar.slug).idx : -1;
testa("D1 delvis läsare: nominerad har lägre kartindex än bk-04 (kartordning)", delvisSvar?.slug === "km-001-bokforingens-grunder" && nomineradIdx < bk04Idx, `nominerad=${delvisSvar?.slug} idx=${nomineradIdx} < ${bk04Idx}`);

// (E) Syskonläget: u1:s tx-04 (landad under fönstret) — fulläst TILLVÄXT-läsare
//     nominerar tx-04; mina två kurser saboterar inte syskonets leverans.
const txFöre = familj("TILLVÄXT").filter((k) => k.slug !== "tx-04-tillvaxtens-granser").map((k) => k.slug);
const txSvar = kategoriFortsattning(KARTA, txFöre, "avancerad");
testa("E1 syskonläge: fulläst TILLVÄXT utan tx-04 → tx-04 nominerad (u1:s leverans orörd)", txSvar?.slug === "tx-04-tillvaxtens-granser", `nominerad=${txSvar?.slug}`);
testa("E2 tx-04 poäng 90 (A mot avancerad)", txSvar?.poäng === 90, `poäng=${txSvar?.poäng}`);

// (F) Försvarsläget vilar: inga klara → regeln ger null
testa("F1 försvarsläge: tom klara-lista → null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (G) Determinism: dubbelkörning bitidentisk
const g1 = JSON.stringify(kategoriFortsattning(KARTA, rpFöre, "avancerad"));
const g2 = JSON.stringify(kategoriFortsattning(KARTA, rpFöre, "avancerad"));
testa("G1 determinism: två körningar bitidentiska", g1 === g2 && g1.length > 0);

// ── Rapport ──────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.log("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD — ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN — ${pass.length} PASS 0 FAIL (bk-04 90p nivåmatch [${bkAntalFöre} steg] · rp-03 90p nivåmatch [${rpAntalFöre} steg] · tx-04 orörd [${txSvar?.poäng}p]; motorns kod orörd — läsreplik)`);
