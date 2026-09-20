#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789910709805, omgång 23) — PREKOLL KVD FÖRE
 * REGISTERINSERT: struktur, round-trip, juridikgrind, språkgrind,
 * korslänkar, aritmetik (oberoende omräknad), duplikat-/klaimvakt och
 * varför-rader för de två nya kurserna
 * rp-06-volatilitetsdraget · pe-07-co-investeringen.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["rp-06-volatilitetsdraget", "pe-07-co-investeringen"];
const VANTA = {
  "rp-06-volatilitetsdraget": { kat: "RISKHANTERING & PORTFÖLJTEORI", level: "Intermediär", fore: "rp-05-sekvensrisken" },
  "pe-07-co-investeringen": { kat: "PRIVATE EQUITY & INVESTMENTBOLAG", level: "Avancerad", fore: "pe-06-j-kurvan-och-capital-calls" },
};
const r2 = (x) => Math.round(x * 10000) / 10000;

let PASS = 0, FEL = 0, VARN = 0;
const ok = (v, n, d = "") => { if (v) { PASS++; console.log("  PASS " + n + (d ? " — " + d : "")); } else { FEL++; console.log("  FEL  " + n + (d ? " — " + d : "")); } };
const varn = (v, n, d = "") => { if (!v) { VARN++; console.log("  VARN  " + n + (d ? " — " + d : "")); } else PASS++; };

const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const regSlugs = new Set(Object.keys(reg));

// ── A. STRUKTUR (fältuppsättning exakt som seriens kontrakt) ──────────────────
const KONTRAKT = ["slug", "category", "weight", "chapterCount", "totalMinutes", "title", "summary", "minutes", "xp", "level", "why", "learn", "history", "chapters_list", "lynchSection", "grahamSection", "ak1Section", "chapters"];
const BLOCKTYP = ["text", "definition", "tabell", "insight", "utmaning"];
const kurser = {};
console.log("═══ A STRUKTUR");
for (const slug of MINA) {
  const raw = readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8");
  const k = JSON.parse(raw);
  kurser[slug] = k;
  const nycklar = Object.keys(k);
  ok(nycklar.length === KONTRAKT.length && KONTRAKT.every((n) => nycklar.includes(n)), slug + ": fältuppsättning " + nycklar.length + " st", nycklar.join(","));
  ok(k.slug === slug && /^[a-z0-9][a-z0-9-]*$/.test(k.slug), slug + ": slug ren ASCII");
  ok(k.category === VANTA[slug].kat, slug + ": kategori exakt", k.category);
  ok(k.level === VANTA[slug].level, slug + ": nivå", k.level);
  ok(k.chapters.length === 6 && k.chapterCount === 6 && k.chapters_list.length === 6, slug + ": 6 kapitel i alla fält");
  ok(k.chapters.reduce((s, c) => s + c.minutes, 0) === k.totalMinutes && k.totalMinutes === k.minutes && k.minutes === 24, slug + ": minuter 6×4 = 24 stämmer i alla fält");
  ok(k.xp === 50, slug + ": xp 50");
  ok(k.chapters.every((c) => c.blocks.length >= 2 && c.blocks.every((b) => BLOCKTYP.includes(b.type))), slug + ": blocktyper ur kontraktet");
  ok(k.chapters.every((c) => c.blocks.every((b) => Object.keys(b).length === 2 && "type" in b && "content" in b)), slug + ": block exakt {type, content} (0 extrafält)");
  ok(k.chapters_list.every((c, i) => k.chapters[i].title === c.title && k.chapters[i].num === c.num && k.chapters[i].minutes === c.minutes), slug + ": chapters_list speglar chapters");
  ok(k.chapters[5].blocks.some((b) => b.type === "utmaning"), slug + ": kapitel 6 bär utmaning");
  ok(raw.endsWith("\n"), slug + ": filen avslutas med radbrytning");
  ok(Object.keys(k.history).length === 3 && ["origin", "evolution", "modern"].every((n) => k.history[n].length > 200), slug + ": history tre sektioner");
}

// ── B. ROUND-TRIP (parse → stringify → parse identisk) ───────────────────────
console.log("═══ B ROUND-TRIP");
for (const slug of MINA) {
  const a = kurser[slug];
  const b = JSON.parse(JSON.stringify(a));
  ok(JSON.stringify(a) === JSON.stringify(b), slug + ": round-trip identisk");
}

// ── C. JURISTIKGRIND (utbildning, aldrig råd; inga blandade lagrum) ───────────
console.log("═══ C JURIDIKGRIND");
const RADSMONSTER = [/köp (denna|aktien|bolaget)/i, /sälj (denna|aktien|bolaget)/i, /rekommendera (att du )?köp/i, /vi råder/i, /bör du köpa/i, /bör du sälja/i, /investera i (denna|detta)/i, /min rekommendation/i, /ta position (i|på) (denna|detta|aktien)/i, /placera i (denna|detta)/i];
for (const slug of MINA) {
  const t = JSON.stringify(kurser[slug]).toLowerCase();
  const råd = RADSMONSTER.filter((m) => m.test(t));
  ok(råd.length === 0, slug + ": 0 rådsfraser", råd.map(String).join(";"));
  ok(/aldrig råd|inte investeringsråd|inte uppmaningar att köpa/i.test(t), slug + ": utbildningsframing + skyddsrad närvarande");
  ok(!/2007:528|2022:260|2022:261|1985:716|2005:59/.test(t), slug + ": inga konsument-/värdepapperslagrum (blandningsvakten)");
}

// ── D. SPRÅKGRIND (läckor, CJK, kyrilliska, typografiska citat, tabbar) ───────
console.log("═══ D SPRÅKGRIND");
const VITLISTA = ["co-invest", "co-investering", "co-investorn", "co-investerade", "co-invest-program", "management fee", "fund of funds", "break-even", "due diligence", "carry", "capital call", "capital calls", "commitment", "lp", "gp", "vintage", "positionssizning", "diversifieringsmatematiken", "standardavvikelsen", "geometrisk", "aritmetisk", "volatilitetsbudgeten", "volatilitetsmålning", "volatilitetsförfall", "komponderar", "kompounderas", "medelvärde-varians-ramverk", "tjugofem", "procentenheter"];
function textVarden(o, ut = []) { if (typeof o === "string") ut.push(o); else if (Array.isArray(o)) o.forEach((x) => textVarden(x, ut)); else if (o && typeof o === "object") for (const v of Object.values(o)) textVarden(v, ut); return ut; }
for (const slug of MINA) {
  const texter = textVarden(kurser[slug]);
  const allt = texter.join(" ").toLowerCase();
  ok(!/[\u4e00-\u9fff\u3040-\u30ff]/.test(allt), slug + ": 0 CJK-tecken");
  ok(!/[\u0400-\u04ff]/.test(allt), slug + ": 0 kyrilliska tecken");
  ok(!/[\u201c\u201d\u2018\u2019\u2026]/.test(texter.join("")), slug + ": 0 typografiska citat/ellips (em-dash är seriekontraktets standard)");
  ok(!/\t/.test(texter.join("")), slug + ": 0 tabbar");
  ok(!/ {2,}/.test(texter.join(" ")), slug + ": 0 dubbla mellanslag");
  const underscore = texter.filter((t) => t.includes("_"));
  ok(underscore.length === 0, slug + ": 0 underscore i textvärden", JSON.stringify(underscore).slice(0, 120));
  const ord = allt.match(/[a-zåäöéè]{3,}/g) || [];
  const misstankt = [...new Set(ord)].filter((w) => !VITLISTA.some((v) => v.includes(w)) && !["och", "för", "att", "det", "den", "som", "med", "till", "fran", "har", "inte", "ett", "en", "av", "de", "deras", "in", "om", "eller", "dar", "kan", "ska", "var", "for", "under", "over", "mellan", "mot", "efter", "fore", "alla", "nya", "samma", "sina", "här", "nu", "per", "ur", "år", "lite", "tre", "fem"].includes(w));
  varn(misstankt.length < 420, slug + ": genemsök rimlig (" + misstankt.length + " okända ord — vitlistan ovan och Svenska ord bär dem)");
  if (misstankt.length >= 420) console.log("  exempel: " + misstankt.slice(0, 40).join(" "));
  // riktad engelskaläcka: fristående engelska ord ska vara ~0 (etablerade termer är i vitlistan ovan;
  // registrets egna slugar — bokkurser som the-intelligent-asset-allocator — stryks före skanningen,
  // och svenskhomografen under exkluderas ur listan)
  const utanSlugar = allt.replace(new RegExp("\\b(" + [...regSlugs].join("|") + ")\\b", "g"), " ");
  const engelska = utanSlugar.match(/\b(for|the|and|with|from|that|this|then|than|because|which|where|should|could|would|about|only|also|more|most|less|each|every|other|same|very|much|many|such|here|there|when|what|while|since|being|been|have|has|had|does|will|into|over|after|before|between)\b/g) || [];
  ok(engelska.length === 0, slug + ": 0 fristående engelska ord (slugar strukna, homografer exkluderade)", engelska.slice(0, 8).join(" "));
}

// ── E. KORSLÄNKAR (alla slug-referenser finns i registret; kortform = exakt en) ─
console.log("═══ E KORSLÄNKAR");
for (const slug of MINA) {
  const ro = [...JSON.stringify(kurser[slug]).matchAll(/\b([a-z]{2,5}-\d{2,3})\b/g)].map((m) => m[1]);
  const egenKort = slug.split("-").slice(0, 2).join("-");
  const ref = [...new Set([...ro, ...[...JSON.stringify(kurser[slug]).matchAll(/\b([a-z]{2,5}-\d{2,3}-[a-z0-9-]{3,})\b/g)].map((m) => m[1])])].filter((r) => r !== slug && r !== egenKort);
  const ogiltiga = ref.filter((r) => {
    if (r.includes("-", r.indexOf("-") + 4) && regSlugs.has(r)) return false;
    const traffar = [...regSlugs].filter((s) => s.startsWith(r + "-") || s === r);
    return traffar.length !== 1;
  });
  ok(ogiltiga.length === 0, slug + ": " + ref.length + " korslänkar registeräkta (kortform = exakt en träff)", ogiltiga.join(","));
  ok(ref.length >= 6, slug + ": korslänkningstäthet ≥ 6", ref.length + " st");
}

// ── F. ARITMETIK OBEROENDE OMRÄKNAD ───────────────────────────────────────────
console.log("═══ F ARITMETIK");
const geo = (u, n) => Math.sqrt((1 + u) * (1 + n)) - 1;
const rd1 = (x) => Math.round(x * 1000) / 1000;
const ekv = [
  // rp-06
  ["rp-06: spegelparet 100×1,20×0,80 = 96,0", r2(100 * 1.2 * 0.8) === 96],
  ["rp-06: geometrisk −2,02 procent per år (roten ur 0,96)", rd1((Math.sqrt(0.96) - 1) * 100) === -2.02],
  ["rp-06: återgång till 100 kräver plus 4,2 procent", Math.round((100 / 96 - 1) * 1000) / 100 === 4.17 || Math.round((100 / 96 - 1) * 100 * 10) / 10 === 4.2],
  ["rp-06: plus 50 minus 50 → 75,0; repair plus 33,3", r2(100 * 1.5 * 0.5) === 75 && Math.round((100 / 75 - 1) * 1000) / 10 === 33.3],
  ["rp-06: trappan −10→+11,1 · −20→+25 · −33,3→+50 · −50→+100 · −75→+300", Math.round((1 / 0.9 - 1) * 1000) / 10 === 11.1 && (1 / 0.8 - 1) * 100 === 25 && Math.round((1 / (2 / 3) - 1) * 1000) / 10 === 50 && (1 / 0.5 - 1) * 100 === 100 && (1 / 0.25 - 1) * 100 === 300],
  ["rp-06: serien +30/−10 två år: 117,0; geometriskt 8,17", r2(100 * 1.3 * 0.9) === 117 && Math.round(geo(0.3, -0.1) * 10000) / 100 === 8.17],
  ["rp-06: exakta geometriska 9,54 · 8,17 · 5,83", Math.round(geo(0.2, 0) * 10000) / 100 === 9.54 && Math.round(geo(0.3, -0.1) * 10000) / 100 === 8.17 && Math.round(geo(0.4, -0.2) * 10000) / 100 === 5.83],
  ["rp-06: dragen 0,46 · 1,83 · 4,17 (aritmetiskt 10)", Math.round((0.1 - geo(0.2, 0)) * 10000) / 100 === 0.46 && Math.round((0.1 - geo(0.3, -0.1)) * 10000) / 100 === 1.83 && Math.round((0.1 - geo(0.4, -0.2)) * 10000) / 100 === 4.17],
  ["rp-06: approximationerna σ²/2 = 0,50 · 2,00 · 4,50", Math.round(0.1 ** 2 / 2 * 10000) / 100 === 0.5 && Math.round(0.2 ** 2 / 2 * 10000) / 100 === 2 && Math.round(0.3 ** 2 / 2 * 10000) / 100 === 4.5],
  ["rp-06: 20-årsmultiplar 6,19x · 4,81x · 3,11x", Math.round(Math.pow(1 + geo(0.2, 0), 20) * 100) / 100 === 6.19 && Math.round(Math.pow(1 + geo(0.3, -0.1), 20) * 100) / 100 === 4.81 && Math.round(Math.pow(1 + geo(0.4, -0.2), 20) * 100) / 100 === 3.11],
  ["rp-06: diversifiering 10/√2 = 7,1 procent; drag 0,50 → 0,25", Math.round((10 / Math.SQRT2) * 10) / 10 === 7.1 && Math.round((0.1 / Math.SQRT2) ** 2 / 2 * 10000) / 100 === 0.25],
  // pe-07
  ["pe-07: samma affär 2,0x — fond-LP 200−20−12 = 168; gap 32", 200 - 20 - 12 === 168 && 200 - 168 === 32],
  ["pe-07: helägda 2,10x — LP 210−22−12 = 176", 210 - 0.2 * (210 - 100) - 12 === 176],
  ["pe-07: erbjudna 1,70x — co-invest 170; gap 6 till fondvägen", 170 === 170 && 176 - 170 === 6],
  ["pe-07: avgift+carry på helägda = 34 enheter", 0.2 * (210 - 100) + 12 === 34],
  ["pe-07: erbjuden i fonden 170−14−12 = 144; besparing 26; 26/144 = 18,1 procent", 170 - 0.2 * (170 - 100) - 12 === 144 && 170 - 144 === 26 && Math.round(26 / 144 * 1000) / 10 === 18.1],
  ["pe-07: break-even 1,76x; urvalsgap 2,10−1,76 = 0,34x = 34 enheter", 176 / 100 === 1.76 && Math.round((2.1 - 1.76) * 100) / 100 === 0.34 && Math.round((2.1 - 1.76) * 100) === 34],
  ["pe-07: trappan +34 · +14 · 0 · −6", 210 - 176 === 34 && 190 - 176 === 14 && 176 - 176 === 0 && 170 - 176 === -6],
  ["pe-07: koncentration 100/25 = 4 procent", 100 / 25 === 4],
];
for (const [n, v] of ekv) ok(v, n);

// ── G. DUPLIKAT + KLAIMVAKT ───────────────────────────────────────────────────
console.log("═══ G DUPLIKAT/KLAIM");
ok(MINA.every((s) => !regSlugs.has(s)), "inga duplikat: båda saknas i registret (" + regSlugs.size + " kurser)");
ok(new Set(MINA).size === 2, "två unika slugar");
for (const slug of MINA) ok(regSlugs.has(VANTA[slug].fore), slug + ": serieföregångaren finns", VANTA[slug].fore);
const serierRp = [...regSlugs].filter((s) => s.startsWith("rp-")).sort();
const serierPe = [...regSlugs].filter((s) => s.startsWith("pe-")).sort();
ok(serierRp.length === 5 && serierRp[serierRp.length - 1] === "rp-05-sekvensrisken", "rp-serien bär 5 steg, rp-06 blir sjätte", serierRp.join(","));
ok(serierPe.length === 6 && serierPe[serierPe.length - 1] === "pe-06-j-kurvan-och-capital-calls", "pe-serien bär 6 steg, pe-07 blir sjunde", serierPe.join(","));
ok(!regSlugs.has("am-09-marginalhandeln") || true, "notis: u1:s am-09 " + (regSlugs.has("am-09-marginalhandeln") ? "LANDAD i registret (respekteras)" : "ej landad ännu (deras kedja)"));

// ── H. VARFÖR-RADER (uppdragets kärna) ────────────────────────────────────────
console.log("═══ H VARFÖR-RADER");
for (const slug of MINA) {
  const k = kurser[slug];
  ok(k.why.length >= 600, slug + ": why-raden bär (" + k.why.length + " tecken)");
  ok((k.learn.match(/·/g) || []).length >= 5, slug + ": learn bär " + ((k.learn.match(/·/g) || []).length + 1) + " punkter (seriekontraktet 6)");
  ok(/noll kursägare|0 kursägare|noll träffar|0 träffar|vit fläck/i.test(k.why), slug + ": why dokumenterar sondläget");
  ok(/påhittade tal/i.test(JSON.stringify(k.chapters)), slug + ": exempeldata märks påhittad");
}

console.log("────");
console.log(`PREKOLL KVD: ${PASS} PASS · ${FEL} FEL · ${VARN} VARNING`);
process.exit(FEL ? 1 : 0);
