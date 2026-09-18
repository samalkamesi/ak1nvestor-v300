#!/usr/bin/env node
/**
 * KVD — s5-u3 manifest auto-s5-1789722300593 (omgång 15):
 * vr-05-pris-och-varde + tx-05-tillvaxtens-forsta-lasning + roic-03-inkrementell-roic
 * Register 415 (u1:s bk-05) + u2:s 2 + mina 3 = 420.
 *
 * Pass: struktur/round-trip ×3, aritmetik 33+11 oberoende omräknade,
 * korsreferenser registeräkta (prefixmatch), juridikgrind (rådmönster med
 * kontextkrav), språkgrind (CJK/bindestreck/citattecken/tabbar/svarta lista),
 * R2 (kraverFas, inga pris-/tier-ytor), llms-paritet, larvag-synk.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROT = "/home/ak1a/AK1";
const MINA = ["vr-05-pris-och-varde", "tx-05-tillvaxtens-forsta-lasning", "roic-03-inkrementell-roic"];
const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

const register = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const regKeys = new Set(Object.keys(register));

// ── 1. Round-trip: kursfil === registerpost ×3 ───────────────────────────────
for (const slug of MINA) {
  const fil = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8"));
  const reg = register[slug];
  testa("RT " + slug + " finns i registret", !!reg);
  testa("RT " + slug + " kursfil ≡ registerpost (bitidentisk)", JSON.stringify(fil) === JSON.stringify(reg));
}

// ── 2. Struktur ×3 ────────────────────────────────────────────────────────────
for (const slug of MINA) {
  const k = register[slug];
  const kat = { "vr-05-pris-och-varde": "VÄRDERING", "tx-05-tillvaxtens-forsta-lasning": "TILLVÄXT", "roic-03-inkrementell-roic": "LÖNSAMHET" }[slug];
  const niva = { "vr-05-pris-och-varde": "Nybörjare", "tx-05-tillvaxtens-forsta-lasning": "Nybörjare", "roic-03-inkrementell-roic": "Avancerad" }[slug];
  testa("ST " + slug + " kategori " + kat, k.category === kat, k.category);
  testa("ST " + slug + " nivå " + niva, k.level === niva, k.level);
  testa("ST " + slug + " konvention 6 kap à 4 min = 24 min, xp 50, weight —", k.chapterCount === 6 && k.totalMinutes === 24 && k.chapters.length === 6 && k.chapters.every((c) => c.minutes === 4) && k.xp === 50 && k.weight === "—");
  testa("ST " + slug + " chapters_list ≡ chapters", JSON.stringify(k.chapters_list) === JSON.stringify(k.chapters.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))));
  const blocktyper = new Set(k.chapters.flatMap((c) => c.blocks.map((b) => b.type)));
  testa("ST " + slug + " blocktyper ⊆ text/definition/insight/tabell/utmaning", [...blocktyper].every((b) => ["text", "definition", "insight", "tabell", "utmaning"].includes(b)), [...blocktyper].join(","));
  testa("ST " + slug + " har varför + historia + tre mästarsektioner", typeof k.why === "string" && k.why.length > 200 && k.history && k.lynchSection && k.grahamSection && k.ak1Section);
}

// ── 3. Aritmetik: oberoende omräkning av kurstalen ───────────────────────────
const aritm = [
  ["vr05 P/E A 100/5", 100 / 5, 20], ["vr05 P/E B 50/5", 50 / 5, 10], ["vr05 P/E C 40/2", 40 / 2, 20], ["vr05 P/E D 90/6", 90 / 6, 15],
  ["vr05 värde 12×5", 5 * 12, 60], ["vr05 marginal 12x", ((60 - 50) / 60) * 100, 16.7], ["vr05 marginal 16x", ((80 - 50) / 80) * 100, 37.5], ["vr05 marginal 14x", ((70 - 50) / 70) * 100, 28.6], ["vr05 marginal 10x", ((50 - 50) / 50) * 100, 0],
  ["tx05 år1", ((110 - 100) / 100) * 100, 10], ["tx05 år2", ((121 - 110) / 110) * 100, 10], ["tx05 totalt", ((121 - 100) / 100) * 100, 21], ["tx05 nedgång", (11 / 121) * 100, 9.1],
  ["tx05 rot 1,21", Math.sqrt(1.21), 1.10], ["tx05 7e roten 2", 2 ** (1 / 7), 1.104], ["tx05 real", 1.10 / 1.02, 1.078], ["tx05 1,1^10", 1.1 ** 10, 2.594], ["tx05 1,078^10", 1.078 ** 10, 2.119], ["tx05 volym×pris", 1.10 * 1.10, 1.21], ["tx05 3årstakt", 1.09 ** (1 / 3), 1.029],
  ["roic bas", (150 / 1000) * 100, 15.0], ["roic marginal", (16 / 200) * 100, 8.0], ["roic kombinerat", (166 / 1200) * 100, 13.8], ["roic år2", (182 / 1400) * 100, 13.0], ["roic år4", (214 / 1800) * 100, 11.9],
  ["roic bokförd maskin", (40 / 100) * 100, 40.0], ["roic real maskin", (40 / 250) * 100, 16.0], ["roic FCF-avk", (80 / 800) * 100, 10.0], ["roic vinst-avk", (100 / 800) * 100, 12.5], ["roic delta", (24 / 300) * 100, 8.0], ["roic vinst år2", 150 + 16 * 2, 182], ["roic kap år2", 1000 + 200 * 2, 1400],
];
let aritmFel = 0;
for (const [namn, fass, vantat] of aritm) if (Math.abs(fass - vantat) > 0.05) { fail.push(`FAIL ARITMETIK ${namn}: ${fass.toFixed(4)} ≠ ${vantat}`); aritmFel++; }
testa("ARITMETIK " + aritm.length + " kontroller oberoende omräknade", aritmFel === 0, aritmFel + " fel");

// Talens närvaro i kurstexterna (varje signaturtal ska finnas SKRIVET i sin kurs)
const kropp = (slug) => JSON.stringify(register[slug]);
const talIText = [
  ["vr-05-pris-och-varde", ["20", "10", "16,7", "37,5", "28,6", "60", "80"]],
  ["tx-05-tillvaxtens-forsta-lasning", ["21", "9,1", "1,10", "1,078", "2,59", "2,12", "1 210", "1,104"]],
  ["roic-03-inkrementell-roic", ["1 000", "150", "15,0", "8,0", "13,8", "11,9", "250", "12,5", "1 800", "214", "166", "1 200"]],
];
for (const [slug, tal] of talIText) {
  const t = kropp(slug);
  const saknas = tal.filter((x) => !t.includes(x));
  testa("TAL " + slug + " signaturtal skrivna i kursen (" + tal.length + ")", saknas.length === 0, saknas.length ? "saknas: " + saknas.join(",") : "alla närvarande");
}

// ── 4. Korsreferenser registeräkta ──────────────────────────────────────────
const referenser = [
  ["vr-05-pris-och-varde", ["vr-01-multipelgapet", "vr-02-normaliserade-multipler", "vr-03-multipelns-anatomi", "vr-04-avkastningens-tre-kallor", "bk-02-resultatrakningen", "bf-01-tillganglighetsfalla", "am-03-lasa-aktiesidan"]],
  ["tx-05-tillvaxtens-forsta-lasning", ["tx-01-organisk-mot-forvarvad-tillvaxt", "tx-02-volym-pris-och-mix", "tx-03-nar-skapar-tillvaxt-varde", "tx-04-tillvaxtens-granser", "bk-02-resultatrakningen", "km-055-inflation", "ma-03-realrantan", "se-16-sektoranalysens-metod"]],
  ["roic-03-inkrementell-roic", ["roic-01-avkastning-pa-investerat-kapital", "roic-02-avkastningstrappan", "tx-03-nar-skapar-tillvaxt-varde", "ln-02-resultatkvalitet-och-accruals", "bk-01-balansrakningen", "bk-02-resultatrakningen", "bk-03-kassaflodesrakningen"]],
];
// Husets kursintern stil: grannhenvisningar i kortform ("vr-01", "tx-02") — registeräkta
// via prefixmatch (samma konvention som spårets tidigare KVD:er; full slug accepteras också).
const kortform = (full) => full.match(/^[a-z0-9]+-\d+/)[0];
for (const [slug, refs] of referenser) {
  const t = kropp(slug);
  const saknasIHanvisning = refs.filter((r) => !t.includes(r) && !new RegExp(`\\b${kortform(r)}\\b`).test(t));
  const otackta = refs.filter((r) => !regKeys.has(r));
  testa("REF " + slug + " samtliga " + refs.length + " korsreferenser skrivna (full slug eller kortform)", saknasIHanvisning.length === 0, saknasIHanvisning.join(","));
  testa("REF " + slug + " samtliga registeräkta (0 fantomer)", otackta.length === 0, otackta.join(","));
  // Varje KOD-form som FÖREKOMMER i texten måste vara registeräkta (0 skuggkoder)
  const koderIText = [...new Set([...t.matchAll(/\b([a-z]{2,5}-\d{2})\b/g)].map((m) => m[1]))].filter((k) => ![...regKeys].some((r) => r.startsWith(k + "-") || r === k));
  testa("REF " + slug + " 0 skuggkoder (alla " + [...new Set([...t.matchAll(/\b[a-z]{2,5}-\d{2}\b/g)])].length + " kodformer registeräkta)", koderIText.length === 0, koderIText.join(","));
}

// ── 5. Juridikgrind ──────────────────────────────────────────────────────────
for (const slug of MINA) {
  const t = kropp(slug);
  const radmönster = [
    /\b(köp|sälj|undvik|välj)\s+(den|det|denna|denna aktien|aktien|bolaget|portföljen)\b/gi,
    /\bvi (rekommenderar|råder)\b/gi,
    /\bdu (bor|bör) (köpa|sälja|ägna|placera|investera)\b/gi,
    /\brekommenderar\b/gi,
    /\bdet är (dags|läge) att (köpa|sälja)\b/gi,
  ];
  const traffar = radmönster.flatMap((re) => [...t.matchAll(re)].map((m) => m[0]));
  testa("JUR " + slug + " 0 rådsfraser", traffar.length === 0, traffar.join(","));
  const framing = /utbildning|icke investeringsråd|aldrig råd|inte .{0,20}råd|studieobjekt/i.test(t) || t.includes("aldrig råd om placeringar");
  testa("JUR " + slug + " utbildningsframing närvarande", framing);
  const lagrum = t.match(/\b\d{4}:\d+\b/g);
  testa("JUR " + slug + " 0 lagrum i kurstext (mentorgrindens yta)", !lagrum, lagrum?.join(","));
}

// ── 6. Språkgrind ────────────────────────────────────────────────────────────
for (const slug of MINA) {
  const t = kropp(slug);
  testa("SPRÅK " + slug + " 0 CJK", !/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(t));
  testa("SPRÅK " + slug + " 0 mjuka bindestreck", !t.includes("\u00ad"));
  testa("SPRÅK " + slug + " 0 typografiska citattecken", !/[\u201c\u201d\u2018\u2019\u00ab\u00bb]/.test(t));
  testa("SPRÅK " + slug + " 0 tabbar", !/\t/.test(t));
  const svartlista = ["analysisens", "analysesens", "ordrebok", "källparity", "butierna", "städad halvvägs", "kvedet", "coronaåret", "skillnadetal", "dagars kostnad", "recognizedes", "eigentliga", "insistence", "säsäng", "okompilerat", "ls-orden", "Handelsdags", "usätt", "ämnesord"];
  const träff = svartlista.filter((w) => t.toLowerCase().includes(w.toLowerCase()));
  testa("SPRÅK " + slug + " svartlista 0 träffar", träff.length === 0, träff.join(","));
}

// ── 7. R2: kraverFas 0, inga pris-/tier-ytor ─────────────────────────────────
for (const slug of MINA) {
  const t = kropp(slug);
  testa("R2 " + slug + " kraverFas 0 (gratis — ingen tier-yta)", register[slug].kraverFas === undefined || register[slug].kraverFas === 0, String(register[slug].kraverFas));
  const pris = t.match(/\b(9\s?999|13\s?999|249|449|799)\b/g);
  testa("R2 " + slug + " 0 pris-/tier-tal", !pris, pris?.join(","));
}

// ── 8. llms-paritet + registerantal ──────────────────────────────────────────
const llms = readFileSync(ROT + "/public/llms.txt", "utf8");
const llmsFull = readFileSync(ROT + "/public/llms-full.txt", "utf8");
const huvud = (t) => Math.max(...[...t.matchAll(/(\d{3}) kurser/g)].map((m) => Number(m[1])));
const antalReg = Object.keys(register).length;
testa("LLMS llms.txt huvudtal = register (" + antalReg + ")", huvud(llms) === antalReg, String(huvud(llms)));
testa("LLMS llms-full.txt huvudtal = register", huvud(llmsFull) === antalReg, String(huvud(llmsFull)));
testa("REGISTRET bär " + antalReg + " kurser (u1 415 + u2 2 + mina 3)", antalReg === 420, String(antalReg));
const katAntal = {};
for (const k of Object.values(register)) if (k.category !== "BOKMASTER") katAntal[k.category] = (katAntal[k.category] ?? 0) + 1;
testa("REGISTRET VÄRDERING 8 · TILLVÄXT 8 · LÖNSAMHET 11", katAntal["VÄRDERING"] === 8 && katAntal["TILLVÄXT"] === 8 && katAntal["LÖNSAMHET"] === 11, `V:${katAntal["VÄRDERING"]} T:${katAntal["TILLVÄXT"]} L:${katAntal["LÖNSAMHET"]}`);

// ── 9. larvag-synk (GRÖN krav — körs som barnprocess) ───────────────────────
const synk = execFileSync("node", [ROT + "/verktyg/larvag-synk.mjs"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
testa("LARVAG-SYNK GRÖN (register = karta = konstant)", synk.includes("GRÖN"), synk.trim().split("\n").pop());

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FEL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL 0 VARNING — vr-05 + tx-05 + roic-03 leveransverifierade på ${antalReg}-läget.`);
