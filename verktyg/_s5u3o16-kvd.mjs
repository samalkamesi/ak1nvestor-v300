#!/usr/bin/env node
/**
 * KVD — s5-u3 manifest auto-s5-1789743901668 (omgång 16):
 * am-07-indexomlaggningen + ks-07-kapitalstrukturens-avvagning + mt-06-kostnadsoverlagsenhet
 * Registerläge DYNAMISKT (u1:s ib-03 landad 421; u2:s vr-06+st-06 kan landa parallellt).
 *
 * Pass: round-trip ×3, struktur ×3, aritmetik 37 oberoende omräknade,
 * korsreferenser registeräkta (prefixmatch), juridikgrind, språkgrind
 * (inkl dubbla mellanslag + omgångens egen svartlista), R2, llms-paritet,
 * kategoriantal, larvag-synk.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROT = "/home/ak1a/AK1";
const MINA = ["am-07-indexomlaggningen", "ks-07-kapitalstrukturens-avvagning", "mt-06-kostnadsoverlagsenhet"];
const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

const register = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const regKeys = new Set(Object.keys(register));
const kropp = (slug) => JSON.stringify(register[slug]);

// ── 1. Round-trip: kursfil === registerpost ×3 ───────────────────────────────
for (const slug of MINA) {
  const fil = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8"));
  const reg = register[slug];
  testa("RT " + slug + " finns i registret", !!reg);
  testa("RT " + slug + " kursfil ≡ registerpost (bitidentisk)", JSON.stringify(fil) === JSON.stringify(reg));
}

// ── 2. Struktur ×3 ────────────────────────────────────────────────────────────
const KAT = { "am-07-indexomlaggningen": "AKTIEMARKNADEN I PRAKTIKEN", "ks-07-kapitalstrukturens-avvagning": "KAPITALSTRUKTUR", "mt-06-kostnadsoverlagsenhet": "MOAT" };
const NIVA = { "am-07-indexomlaggningen": "Intermediär", "ks-07-kapitalstrukturens-avvagning": "Avancerad", "mt-06-kostnadsoverlagsenheit": "Intermediär", "mt-06-kostnadsoverlagsenhet": "Intermediär" };
for (const slug of MINA) {
  const k = register[slug];
  testa("ST " + slug + " kategori " + KAT[slug], k.category === KAT[slug], k.category);
  testa("ST " + slug + " nivå " + NIVA[slug], k.level === NIVA[slug], k.level);
  testa("ST " + slug + " konvention 6 kap à 4 min = 24 min, xp 50, weight —", k.chapterCount === 6 && k.totalMinutes === 24 && k.chapters.length === 6 && k.chapters.every((c) => c.minutes === 4) && k.xp === 50 && k.weight === "—");
  testa("ST " + slug + " chapters_list ≡ chapters", JSON.stringify(k.chapters_list) === JSON.stringify(k.chapters.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))));
  const blocktyper = new Set(k.chapters.flatMap((c) => c.blocks.map((b) => b.type)));
  testa("ST " + slug + " blocktyper ⊆ text/definition/insight/tabell/utmaning", [...blocktyper].every((b) => ["text", "definition", "insight", "tabell", "utmaning"].includes(b)), [...blocktyper].join(","));
  testa("ST " + slug + " har varför + historia + tre mästarsektioner", typeof k.why === "string" && k.why.length > 200 && k.history && k.lynchSection && k.grahamSection && k.ak1Section);
}

// ── 3. Aritmetik: oberoende omräkning av kurstalen ───────────────────────────
const aritm = [
  // am-07: flödesräkningen + bågen + tidsaxeln
  ["am07 fritt flöde", 40000 * 0.8, 32000], ["am07 orderbilaga", 32000 * 0.12, 3840], ["am07 kontroll andel", (3840 / 32000) * 100, 12],
  ["am07 uteslutningsfond", 50000 * 0.012, 600], ["am07 bågtopp", 42 * 1.06, 44.52], ["am07 reversering", 44.52 * 0.96, 42.74],
  ["am07 netto", ((42.74 - 42) / 42) * 100, 1.8], ["am07 forcering pct", (44.52 / 42) * 100 - 100, 6.0],
  ["am07 viktdriv", 10000 * (0.022 - 0.018), 40], ["am07 tidsaxel", 3840 / 60, 64],
  // ks-07: MM + sköld + kurva
  ["ks07 värde U", 100 / 0.1, 1000], ["ks07 ränta", 400 * 0.05, 20], ["ks07 kvar till ägare", 100 - 20, 80],
  ["ks07 aktievärde L", 1000 - 400, 600], ["ks07 krav L", (80 / 600) * 100, 13.3],
  ["ks07 årlig besparing", 20 * 0.206, 4.12], ["ks07 sköldvärde", 4.12 / 0.05, 82.4], ["ks07 sköld kortform", 400 * 0.206, 82.4],
  ["ks07 sköld 800", 800 * 0.206, 164.8], ["ks07 sköld 1200", 1200 * 0.206, 247.2],
  ["ks07 netto 400", 82.4 - 15, 67.4], ["ks07 netto 800", 164.8 - 60, 104.8], ["ks07 netto 1200", 247.2 - 180, 67.2],
  ["ks07 ränta 800", 800 * 0.065, 52], ["ks07 ränta 1200", 1200 * 0.09, 108], ["ks07 totalvärde L", 1000 + 82.4, 1082.4], ["ks07 emissionskostnad", 500 * 0.04, 20],
  // mt-06: skalkurva + cykel + nisch
  ["mt06 kostnad 50M", 1000 / 50 + 40, 60], ["mt06 kostnad 100M", 1000 / 100 + 40, 50], ["mt06 fallet", ((60 - 50) / 60) * 100, 16.7],
  ["mt06 fraktövertag", 55 - 30, 25], ["mt06 botten-spread", 31 - 24, 7], ["mt06 topp-spread", 38 - 34, 4],
  ["mt06 jättens krav", 300 * 0.2, 60], ["mt06 jättens andel", (60 / 800) * 100, 7.5], ["mt06 nischens krav", 300 * 0.15, 45], ["mt06 nischens andel", (45 / 800) * 100, 5.6],
];
let aritmFel = 0;
for (const [namn, fass, vantat] of aritm) if (Math.abs(fass - vantat) > 0.05) { fail.push(`FAIL ARITMETIK ${namn}: ${fass.toFixed(4)} ≠ ${vantat}`); aritmFel++; }
testa("ARITMETIK " + aritm.length + " kontroller oberoende omräknade", aritmFel === 0, aritmFel + " fel");

// Talens närvaro i kurstexterna
const talIText = [
  ["am-07-indexomlaggningen", ["3 840", "32 000", "40 000", "600", "50 000", "10 000", "44,52", "42,00", "42,74", "1,8", "64", "1,2", "2,2", "12"]],
  ["ks-07-kapitalstrukturens-avvagning", ["1 000", "400", "600", "13,3", "20,6", "82,4", "4,12", "1 082,4", "164,8", "247,2", "67,4", "104,8", "67,2", "800", "1 200", "52", "108", "6,5", "9,0"]],
  ["mt-06-kostnadsoverlagsenhet", ["1 000", "60", "50", "16,7", "30", "55", "25", "38", "34", "31", "24", "800", "300", "7,5", "45", "5,6"]],
];
for (const [slug, tal] of talIText) {
  const t = kropp(slug);
  const saknas = tal.filter((x) => !t.includes(x));
  testa("TAL " + slug + " signaturtal skrivna i kursen (" + tal.length + ")", saknas.length === 0, saknas.length ? "saknas: " + saknas.join(",") : "alla närvarande");
}

// ── 4. Korsreferenser registeräkta ──────────────────────────────────────────
const referenser = [
  ["am-07-indexomlaggningen", ["am-01-likviditet-och-spread", "am-02-index-och-passivt-agande", "am-06-kortlage-och-aktieutlaning", "kt-01-vad-ar-en-katalysator", "km-069-orderbok-och-prissattning"]],
  ["ks-07-kapitalstrukturens-avvagning", ["ks-01-kapitalstruktur-grunder", "ks-03-skuldens-anatomi", "ks-04-emissionens-mekanik", "ks-06-konvertibler-och-hybridkapital", "ma-05-kreditpremien", "st-05-refinansieringsmuren", "km-049-bolagsskatt-206", "v10-skuldsattningsgrad", "v12-intaktsstabilitet", "st-01-soliditet-och-rantetackning", "bk-01-balansrakningen", "bk-02-resultatrakningen"]],
  ["mt-06-kostnadsoverlagsenhet", ["mt-01-vad-ar-en-moat", "mt-02-moat-erosion-och-vallgravstest", "mt-03-vallgraven-i-siffror", "mt-04-vallgravens-fodelse", "mt-05-byteskostnader-och-inlasning", "v07-bruttomarginal", "v13-patent-ip", "v14-varumarke", "v15-natverkseffekter", "rk-05-cykelrisk", "se-04-logistiksektorn"]],
];
// Kortform: tvåbokstavsserier ("ks-01"); övriga (v-kurser) kontrolleras som full slug.
const kortform = (full) => (full.match(/^[a-z]{2}-\d+/) || [full])[0];
for (const [slug, refs] of referenser) {
  const t = kropp(slug);
  const saknasIHanvisning = refs.filter((r) => !t.includes(r) && !new RegExp(`\\b${kortform(r)}\\b`).test(t));
  const otackta = refs.filter((r) => !regKeys.has(r));
  testa("REF " + slug + " samtliga " + refs.length + " korsreferenser skrivna (full slug eller kortform)", saknasIHanvisning.length === 0, saknasIHanvisning.join(","));
  testa("REF " + slug + " samtliga registeräkta (0 fantomer)", otackta.length === 0, otackta.join(","));
  const koderIText = [...new Set([...t.matchAll(/\b([a-z]{2,5}-\d{2})\b/g)].map((m) => m[1]))].filter((k) => ![...regKeys].some((r) => r.startsWith(k + "-") || r === k));
  testa("REF " + slug + " 0 skuggkoder (alla kodformer registeräkta)", koderIText.length === 0, koderIText.join(","));
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
  const framing = /utbildning/i.test(t) && t.includes("aldrig råd om placeringar");
  testa("JUR " + slug + " utbildningsframing (utbildning + aldrig råd-formen)", framing);
  const lagrum = t.match(/\b\d{4}:\d+\b/g);
  testa("JUR " + slug + " 0 lagrum i kurstext", !lagrum, lagrum?.join(","));
}

// ── 6. Språkgrind (svartlista = omgångens egna felklass, fångade och rättade) ─
const svartlista = ["overlagsenheit", "betalings_svårigheter", "betalnings_svårigheter", "erfarenhetseffekerna", "samelevnadsregeln", "läsningsfrågorna", "tillverkninghistoria", "rävarupris", "Uppska7ta", "vocabularyn", "strukturligt", "metafel-läxa", "financeens", "teoretiga", "kapacitetstolerans", "为什么", "也许"];
for (const slug of MINA) {
  const t = kropp(slug);
  testa("SPRÅK " + slug + " 0 CJK", !/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(t));
  testa("SPRÅK " + slug + " 0 mjuka bindestreck", !t.includes("\u00ad"));
  testa("SPRÅK " + slug + " 0 typografiska citattecken", !/[\u201c\u201d\u2018\u2019\u00ab\u00bb]/.test(t));
  testa("SPRÅK " + slug + " 0 tabbar", !/\t/.test(t));
  testa("SPRÅK " + slug + " 0 dubbla mellanslag", !/ {2}/.test(t));
  const träff = svartlista.filter((w) => t.includes(w));
  testa("SPRÅK " + slug + " svartlista 0 träffar", träff.length === 0, träff.join(","));
}

// ── 7. R2: kraverFas 0, inga pris-/tier-ytor ─────────────────────────────────
for (const slug of MINA) {
  const t = kropp(slug);
  testa("R2 " + slug + " kraverFas 0 (gratis — ingen tier-yta)", register[slug].kraverFas === undefined || register[slug].kraverFas === 0, String(register[slug].kraverFas));
  const pris = t.match(/\b(9\s?999|13\s?999|249|449|799)\b/g);
  testa("R2 " + slug + " 0 pris-/tier-tal", !pris, pris?.join(","));
}

// ── 8. llms-paritet + registerantal + kategoriantal ──────────────────────────
const llms = readFileSync(ROT + "/public/llms.txt", "utf8");
const llmsFull = readFileSync(ROT + "/public/llms-full.txt", "utf8");
const huvud = (t) => Math.max(...[...t.matchAll(/(\d{3}) kurser/g)].map((m) => Number(m[1])));
const antalReg = Object.keys(register).length;
testa("LLMS llms.txt huvudtal = register (" + antalReg + ")", huvud(llms) === antalReg, String(huvud(llms)));
testa("LLMS llms-full.txt huvudtal = register", huvud(llmsFull) === antalReg, String(huvud(llmsFull)));
testa("REGISTRET bär mina +3 på 421-basen (>= 424)", antalReg >= 424, String(antalReg));
const katAntal = {};
for (const k of Object.values(register)) if (k.category !== "BOKMASTER") katAntal[k.category] = (katAntal[k.category] ?? 0) + 1;
testa("REGISTRET AKTIEMARKNADEN I PRAKTIKEN 9 (am-01..07 + km-069/070) · KAPITALSTRUKTUR 8 (v20 + ks-01..07) · MOAT 9 (v13-15 + mt-01..06)", katAntal["AKTIEMARKNADEN I PRAKTIKEN"] === 9 && katAntal["KAPITALSTRUKTUR"] === 8 && katAntal["MOAT"] === 9, `AIP:${katAntal["AKTIEMARKNADEN I PRAKTIKEN"]} KAP:${katAntal["KAPITALSTRUKTUR"]} MOAT:${katAntal["MOAT"]}`);

// ── 9. larvag-synk (GRÖN krav — körs som barnprocess) ───────────────────────
const synk = execFileSync("node", [ROT + "/verktyg/larvag-synk.mjs"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
testa("LARVAG-SYNK GRÖN (register = karta = konstant)", synk.includes("GRÖN"), synk.trim().split("\n").pop());

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FEL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL 0 VARNING — am-07 + ks-07 + mt-06 leveransverifierade på ${antalReg}-läget.`);
