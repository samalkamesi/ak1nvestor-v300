#!/usr/bin/env node
/**
 * FRONT B + KVD — bevis för od-01/bf-13 (s5-u2, manifest auto-s5-1789592726665, 2026-09-16).
 * Replikerar kategori-fortsättningsregeln (larvag.ts BAS 86) med regelns EXAKTA
 * filter + poäng (nivåmatch +4) mot den genererade kartan src/lib/larvag-karta.ts.
 * Motorkod orörd — läsreplik (v82/u1-omg5/_s5u2omg7-mönstret).
 * KVD-del: juridikgrind (rådfraser + köp/sälj-mönster), aritmetik, korslänkar,
 * strukturparitet, slugformat.
 */
import { readFileSync } from "node:fs";

const kalla = readFileSync("src/lib/larvag-karta.ts", "utf8");
const KARTA = [...kalla.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)]
  .map((m) => ({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] }));
console.log(`karta: ${KARTA.length} kurser | od-01: ${KARTA.filter((k) => k.slug === "od-01-optionens-greker").length} · bf-13: ${KARTA.filter((k) => k.slug === "bf-13-arbitragens-granser").length}`);

const varforFortsattning = (titel, kategori, antal) => {
  const stegText = antal === 1 ? "ditt första steg" : `${String(antal)} steg`;
  return `Du är igång i ${kategori.toLowerCase()} — ${stegText} ligger bakom dig, och ${titel} fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`;
};
const MALNIVA = { "nybörjare": 1, "växande": 2, "avancerad": 3 };
const raknaPoang = (bas, k, malniva) => bas + (k.niva > 0 && k.niva === malniva ? 4 : 0) + (k.vIndex >= 0 ? 2 : 0);

/** Regel 3-replik: exakta filtren ur larvag.ts (BAS 86). */
const regel3 = (klaraKurser, karta, lasandeFas = 0, lasTillstand = "växande") => {
  const klaraSet = new Set(klaraKurser);
  const kursUrKarta = (slug) => karta.find((k) => k.slug === slug);
  const kanNomineras = (slug) => {
    if (klaraSet.has(slug)) return false;
    const k = kursUrKarta(slug);
    if (!k) return false;
    if (k.kraverFas > lasandeFas) return false;
    return true;
  };
  const katRaknare = new Map();
  for (const slug of klaraKurser) {
    const k = kursUrKarta(slug);
    if (!k) continue;
    katRaknare.set(k.kategori, (katRaknare.get(k.kategori) ?? 0) + 1);
  }
  let paborjadKategori = null, paborjadAntal = 0;
  for (const [kat, antal] of katRaknare) if (antal > paborjadAntal) { paborjadKategori = kat; paborjadAntal = antal; }
  if (!paborjadKategori) return null;
  const f = karta.filter((k) => k.kategori === paborjadKategori && kanNomineras(k.slug))[0];
  if (!f) return null;
  return { slug: f.slug, titel: f.titel, poang: raknaPoang(86, f, MALNIVA[lasTillstand]), kategori: paborjadKategori, steg: paborjadAntal, varför: varforFortsattning(f.titel, paborjadKategori, paborjadAntal) };
};

const MINA = ["od-01-optionens-greker", "bf-13-arbitragens-granser"];
const KARTA_FORE = KARTA.filter((k) => !MINA.includes(k.slug));

const OD_KLARA = ["km-059-optionsgrunder", "km-060-covered-calls", "km-061-protective-puts", "km-062-blackscholes"];
const BF_KLARA = [
  "km-018-forlustaversion", "km-019-bekraftelsefalla", "km-020-ankareffekt", "km-035-flockbeteende",
  "km-036-overconfidence", "km-037-disposition-effect",
  "bf-01-tillganglighetsfalla", "bf-02-sunk-cost", "bf-03-mental-accounting", "bf-04-investera-som-en-robot",
  "bf-05-ankareffekt", "bf-06-tillganglighetsheuristik", "bf-07-framstegseffekt", "bf-08-priming",
  "bf-09-haloeffekt", "bf-10-dunningkruger", "bf-11-kognitiv-bias", "bf-12-prospektteori",
];

const A_fore = regel3(OD_KLARA, KARTA_FORE), A_efter = regel3(OD_KLARA, KARTA);
console.log("\n(A) od-01 — fulläst OPTIONS & DERIVAT-läsare [4 kurser klara]:");
console.log("    FÖRE :", A_fore === null ? "0 kandidater — regeln vilade (slutläst kategori)" : "FEL: " + A_fore.slug);
console.log("    EFTER:", JSON.stringify(A_efter));

const B = regel3([...BF_KLARA], KARTA_FORE);
console.log("\n(B) bf-13 — fulläst BETEENDEFINANS-läsare [18 kurser klara]:");
console.log("    FÖRE :", B === null ? "0 kandidater — regeln vilade" : `${B.slug} (syskonets bf-14 korrekt nominerbar i läget utan mina kurser — motorn rätt)`);
console.log("    EFTER:", JSON.stringify(regel3(BF_KLARA, KARTA)));

const C = regel3(OD_KLARA, KARTA, 0, "växande");
console.log("\n(C) växande lästillstånd — nivåmatch +4 (od-01 Intermediär):", C ? `${C.slug} · ${C.poang}p` : "ingen");

const C2 = regel3(BF_KLARA, KARTA, 0, "avancerad");
console.log("(C2) avancerat lästillstånd — nivåmatch +4 (bf-13 Avancerad):", C2 ? `${C2.slug} · ${C2.poang}p` : "ingen");

const D = regel3(["km-059-optionsgrunder", "km-060-covered-calls"], KARTA);
console.log("\n(D) KARTORDNING — delvis optionsläsare [km-059+km-060]:", D ? `${D.slug} nomineras först (od-01 tränger INTE framför km-061 — korrekt motorbeteende)` : "ingen");

const E = regel3([], KARTA);
console.log("(E) FÖRSVARSLÄGE — ny läsare (0 klara):", E === null ? "regeln vilar — mina kurser tränger sig inte på" : "FEL: " + E.slug);

const F1 = JSON.stringify(regel3(OD_KLARA, KARTA)) + JSON.stringify(regel3(BF_KLARA, KARTA));
const F2 = JSON.stringify(regel3(OD_KLARA, KARTA)) + JSON.stringify(regel3(BF_KLARA, KARTA));
console.log("(F) DETERMINISM — två körningar identiska:", F1 === F2 ? "JA" : "NEJ — FEL");

const gron =
  A_fore === null && A_efter?.slug === "od-01-optionens-greker" && A_efter.varför.includes("Du är igång i options & derivat — 4 steg ligger bakom dig") && A_efter.varför.includes("Optionens greker — delta, gamma, theta och vega") && A_efter.poang === 90 &&
  (B === null || B.slug === "bf-14-beteendeportfoljteori") && regel3(BF_KLARA, KARTA)?.slug === "bf-13-arbitragens-granser" && regel3(BF_KLARA, KARTA).varför.includes("18 steg ligger bakom dig") && regel3(BF_KLARA, KARTA).varför.includes("Arbitragens gränser") &&
  C?.slug === "od-01-optionens-greker" && C.poang === 90 &&
  C2?.slug === "bf-13-arbitragens-granser" && C2.poang === 90 &&
  D?.slug === "km-061-protective-puts" && E === null && F1 === F2;
console.log(`\nFRONT B: ${gron ? "GRÖN — 2/2 nominerade med genererade varför-rader" : "RÖD"}`);

// ── KVD-DEL ─────────────────────────────────────────────────────────────
const reg = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
let pass = 0, fail = 0;
const K = (ok, namn) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${namn}`); };

for (const slug of MINA) {
  const k = reg[slug];
  K(!!k, `${slug}: i registret`);
  K(/^[a-z0-9][a-z0-9-]*$/.test(slug), `${slug}: ren ASCII-slug`);
  K(k.chapters_list.length === k.chapters.length && k.chapters_list.every((c, i) => c.num === k.chapters[i].num && c.title === k.chapters[i].title && c.minutes === k.chapters[i].minutes), `${slug}: strukturparitet chapters_list<->chapters`);
  K(k.chapters.reduce((a, c) => a + c.minutes, 0) === k.totalMinutes && k.chapters.length === k.chapterCount && k.minutes === k.totalMinutes, `${slug}: minuter/kapitelantal stämmer (${k.totalMinutes} min, ${k.chapterCount} kap)`);
  K(k.level === (slug.startsWith("od-") ? "Intermediär" : "Avancerad"), `${slug}: nivå ${k.level}`);
  // juridikgrind: rådfraser
  const allt = JSON.stringify(k);
  const radfraser = [/du (bör|ska) (köpa|sälja|investera)/i, /vi rekommenderar (köp|sälj|handel)/i, /köp (denna|denna aktie|aktien nu)/i, /sälj (dina aktier|nu)/i, /bästa (köp|placering) just nu/i];
  K(radfraser.every((r) => !r.test(allt)), `${slug}: juridikgrind 0 rådfraser`);
  // utbildningsframing
  K(/utbildning|så fungerar metoden|pedagogisk/i.test(allt), `${slug}: utbildningsframing närvarande`);
  // korslänkar — alla slug-prefix i texten måste finnas i registret (egna + andras)
  const refPrefix = [...allt.matchAll(/\b(km-\d{3}|bf-\d{2}|od-\d{2}|rs-\d{2}|st-\d{2}|kt-\d{2}|vr-\d{2}|am-\d{2})\b/g)].map((m) => m[1]);
  const saknade = refPrefix.filter((p) => !Object.keys(reg).some((s) => s.startsWith(p + "-")));
  K(saknade.length === 0, `${slug}: korslänkar lever (${refPrefix.length} referenser, 0 döda${saknade.length ? " — SAKNAS: " + saknade.join(",") : ""})`);
}

// aritmetik — maskinell kontroll av kurstexternas talpåståenden
const od = JSON.stringify(reg["od-01-optionens-greker"]);
K(od.includes("0,10 × 20 = 2") && 0.10 * 20 === 2, "aritmetik od-01: theta 0,10 kr/dag × 20 dagar = 2 kr");
K(od.includes("3 punkter × 0,15 = 0,45") && Math.abs(3 * 0.15 - 0.45) < 1e-9, "aritmetik od-01: vega 3 punkter × 0,15 = 0,45 kr");
K(od.includes("+50") && od.includes("100 − 50") && 100 - 50 === 50, "aritmetik od-01: covered call nettodelta +50 (100 − 50)");
K(od.includes("+60") && od.includes("100 − 40") && 100 - 40 === 60, "aritmetik od-01: protective put nettodelta +60 (100 − 40)");
const bf = JSON.stringify(reg["bf-13-arbitragens-granser"]);
K(bf.includes("0,833") && Math.abs(100 / 120 - 0.8333) < 0.001, "aritmetik bf-13: 100 ÷ 120 = 0,833 ⇒ −16,7 % under värde");
K(bf.includes("1,412") && Math.abs(120 / 85 - 1.4118) < 0.001, "aritmetik bf-13: 120 ÷ 85 = 1,412 ⇒ +41,2 % rättelse");
K(Math.abs((100 - 85) / 100 - 0.15) < 1e-9 && bf.includes("minus 15 procent"), "aritmetik bf-13: 100 → 85 = −15 %");
K(Math.abs((120 - 100) / 100 - 0.20) < 1e-9 && bf.includes("20 procent"), "aritmetik bf-13: 100 → 120 = +20 %");

console.log(`\nKVD: ${pass} PASS · ${fail} FAIL`);
process.exit(gron && fail === 0 ? 0 : 1);
