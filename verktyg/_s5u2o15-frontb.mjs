#!/usr/bin/env node
/**
 * FRONT B — s5-u2 omgång 15 (manifest auto-s5-1789722300593):
 * ib-02-substansens-kvalitet + pe-04-den-privata-agarsidan.
 *
 * Läsreplik av larvag.ts kategori-fortsättningsregel (u3:o12-mönstret, u2:o14
 * vidarefört) med dess EXAKTA filter — motorkod orörd. Bevisar nominering med
 * GENERERADE varför-rader, poängformeln från båda riktningarna, kartordningen,
 * försvarsläget och determinismen.
 *
 * Race-säkert: klara-listorna byggs DYNAMISKT ur kartans familjer; syskonens
 * under fönstret levererade kurser (u3:s bk-05 med flera) ingår automatiskt.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const KARTA_TEXT = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...KARTA_TEXT.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m, i) => ({ idx: i, slug: m[1], titel: m[2], kategori: m[3], niva: Number(m[4]), kraverFas: Number(m[5]), vIndex: Number(m[6]), minuter: Number(m[7]) }));
const REGANTAL = Object.keys(JSON.parse(readFileSync("public/deep-courses.json", "utf8"))).length;
if (KARTA.length !== REGANTAL) { console.error(`FEL: kartan bär ${KARTA.length} kurser mot registrets ${REGANTAL} — kör bygg-larvag-karta.`); process.exit(1); }

const NYA = ["ib-02-substansens-kvalitet", "pe-04-den-privata-agarsidan"];
const KAT = "PRIVATE EQUITY & INVESTMENTBOLAG";

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
const FÖR_KARTA = KARTA.filter((k) => !NYA.includes(k.slug));

// (A) Fulläst PE&IB-läsare (lästillstånd växande): ib-02 nominerad (I mot växande)
const peibFöre = familj(KAT).filter((k) => !NYA.includes(k.slug)).map((k) => k.slug);
const peibAntal = peibFöre.length;
testa("A1 PE&IB fulläst FÖRE (utan mina två): 0 kandidater kvar", kategoriFortsattning(FÖR_KARTA, peibFöre, "växande") === null);
const aSvar = kategoriFortsattning(KARTA, peibFöre, "växande");
testa("A2 PE&IB fulläst EFTER: ib-02 nominerad (kartordning — ib-02 före pe-04)", aSvar?.slug === "ib-02-substansens-kvalitet", JSON.stringify(aSvar && { slug: aSvar.slug, poäng: aSvar.poäng }));
testa(`A3 varför-raden genererad med familjetal ${peibAntal} steg`, aSvar?.varför === `Du är igång i private equity & investmentbolag — ${peibAntal} steg ligger bakom dig, och Substansens kvalitet — att granska vad substanssiffran innehåller fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, aSvar?.varför);
testa("A4 poäng 90 = BAS 86 + nivåmatch 4 (Intermediär mot växande), vIndex −1", aSvar?.poäng === 90, `poäng=${aSvar?.poäng}`);

// (B) pe-04:s nominering: fulläst PE&IB med ib-02 klar (lästillstånd nybörjare)
const peibUtanPe04 = familj(KAT).filter((k) => k.slug !== "pe-04-den-privata-agarsidan").map((k) => k.slug);
const bSvar = kategoriFortsattning(KARTA, peibUtanPe04, "nybörjare");
testa("B1 PE&IB med ib-02 klar: pe-04 nominerad", bSvar?.slug === "pe-04-den-privata-agarsidan", JSON.stringify(bSvar && { slug: bSvar.slug, poäng: bSvar.poäng }));
testa(`B2 varför-raden genererad med familjetal ${peibUtanPe04.length} steg`, bSvar?.varför === `Du är igång i private equity & investmentbolag — ${peibUtanPe04.length} steg ligger bakom dig, och Den privata ägarsidan — bolagens värld utanför börsen fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, bSvar?.varför);
testa("B3 poäng 90 = BAS 86 + nivåmatch 4 (Nybörjare mot nybörjare)", bSvar?.poäng === 90, `poäng=${bSvar?.poäng}`);

// (C) Poängformeln från andra riktningarna: utan nivåmatch 86
const cA = kategoriFortsattning(KARTA, peibFöre, "avancerad");
testa("C1 ib-02 utan nivåmatch (I=2 mot avancerad=3): poäng 86", cA?.poäng === 86, `poäng=${cA?.poäng}`);
const cB = kategoriFortsattning(KARTA, peibUtanPe04, "växande");
testa("C2 pe-04 utan nivåmatch (N=1 mot växande=2): poäng 86", cB?.poäng === 86, `poäng=${cB?.poäng}`);

// (D) Kartordningen bevaras: delvis PE&IB-läsare [pe-01] → nominerad = km-067
//     (lägst kartindex bland oklara — km-067/km-068 ligger FÖRE ib-serien i
//     kartan; ny kurs stjäl ingen plats)
const delvisSvar = kategoriFortsattning(KARTA, ["pe-01-private-equity-fonder"], "växande");
const ib02Idx = KARTA.find((k) => k.slug === "ib-02-substansens-kvalitet").idx;
const nomineradIdx = delvisSvar ? KARTA.find((k) => k.slug === delvisSvar.slug).idx : -1;
testa("D1 delvis läsare [pe-01]: nominerad km-067 har lägre kartindex än ib-02 (kartordning)", delvisSvar?.slug === "km-067-investmentbolag" && nomineradIdx < ib02Idx, `nominerad=${delvisSvar?.slug} idx=${nomineradIdx} < ${ib02Idx}`);

// (E) Nybörjarprofil [km-067, km-068, ib-01 klar]: ib-02 nominerad (I=2 mot
//     N=1: ingen nivåmatch — 86p); SINGULAR-grenen testas via [km-067] → km-068
const eSvar = kategoriFortsattning(KARTA, ["km-067-investmentbolag", "km-068-wallenbergsfaren", "ib-01-vad-ar-ett-investmentbolag"], "nybörjare");
testa("E1 [km-067, km-068, ib-01] klara: ib-02 nominerad 86p (I=2 mot nybörjare=1: ingen nivåmatch)", eSvar?.slug === "ib-02-substansens-kvalitet" && eSvar?.poäng === 86, `nominerad=${eSvar?.slug} poäng=${eSvar?.poäng}`);
const eSing = kategoriFortsattning(KARTA, ["km-067-investmentbolag"], "nybörjare");
testa("E2 singular-varför (ditt första steg) — [km-067] klar nominerar km-068", eSing?.varför === `Du är igång i private equity & investmentbolag — ditt första steg ligger bakom dig, och ${eSing?.titel} fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`, eSing?.varför);

// (F) Syskonläget: u3:s bk-05 (landad 11:18) — fulläst BOKFÖRING-läsare
//     nominerar bk-05; mina kurser saboterar inte syskonets leverans.
const bokFöre = familj("BOKFÖRING & ÅRSREDOVISNING").filter((k) => k.slug !== "bk-05-redovisningspolitiken").map((k) => k.slug);
const fSvar = kategoriFortsattning(KARTA, bokFöre, "avancerad");
testa("F1 syskonläge: fulläst BOKFÖRING utan bk-05 → bk-05 nominerad (u3:s leverans orörd av mina kurser)", fSvar?.slug === "bk-05-redovisningspolitiken", `nominerad=${fSvar?.slug}`);
testa("F2 bk-05 poäng 90 (A mot avancerad)", fSvar?.poäng === 90, `poäng=${fSvar?.poäng}`);

// (G) Försvarsläget vilar: inga klara → regeln ger null
testa("G1 försvarsläge: tom klara-lista → null", kategoriFortsattning(KARTA, [], "nybörjare") === null);

// (H) Determinism: dubbelkörning bitidentisk
const h1 = JSON.stringify(kategoriFortsattning(KARTA, peibFöre, "växande"));
const h2 = JSON.stringify(kategoriFortsattning(KARTA, peibFöre, "växande"));
testa("H1 determinism: två körningar bitidentiska", h1 === h2 && h1.length > 0);

// ── Rapport ──────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.log("\n" + fail.join("\n")); console.error(`\nFRONT B RÖD — ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nFRONT B GRÖN — ${pass.length} PASS 0 FAIL (ib-02 90p nivåmatch [${peibAntal} steg] · pe-04 90p nivåmatch [${peibUtanPe04.length} steg] · kartordning · singular-varför · syskonets bk-05 orört [${fSvar?.poäng}p]; motorns kod orörd — läsreplik)`);
