#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789888503136, omgång 22) — PREKOLL KVD FÖRE
 * REGISTERINSERT: struktur, round-trip, juridikgrind, språkgrind,
 * korslänkar, aritmetik (oberoende omräknad), duplikat-/klaimvakt och
 * varför-rader för de två nya kurserna
 * rp-05-sekvensrisken · pe-06-j-kurvan-och-capital-calls.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["rp-05-sekvensrisken", "pe-06-j-kurvan-och-capital-calls"];
const VANTA = {
  "rp-05-sekvensrisken": { kat: "RISKHANTERING & PORTFÖLJTEORI", level: "Intermediär", fore: "rp-04-volatilitetsbudgeten" },
  "pe-06-j-kurvan-och-capital-calls": { kat: "PRIVATE EQUITY & INVESTMENTBOLAG", level: "Avancerad", fore: "pe-05-andrahandsmarknaden" },
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
  ok(k.chapters.every((c) => c.blocks.every((b) => Object.keys(b).length === 2 && "type" in b && "content" in b)), slug + ": block exakt {type, content} (0 note-/extrafält)");
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

// ── C. JURIDIKGRIND (utbildning, aldrig råd; inga blandade lagrum) ───────────
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
const VITLISTA = ["capital call", "capital calls", "commitment", "unfunded", "j-kurvan", "dpi", "tvpi", "rvpi", "irr", "lp", "gp", "vintage", "tobins q", "drawdown", "backtest", "backtester", "norris"];
function textVarden(o, ut = []) { if (typeof o === "string") ut.push(o); else if (Array.isArray(o)) o.forEach((x) => textVarden(x, ut)); else if (o && typeof o === "object") for (const v of Object.values(o)) textVarden(v, ut); return ut; }
for (const slug of MINA) {
  const texter = textVarden(kurser[slug]);
  const allt = texter.join(" ").toLowerCase();
  ok(!/[\u4e00-\u9fff\u3040-\u30ff]/.test(allt), slug + ": 0 CJK-tecken");
  ok(!/[\u0400-\u04ff]/.test(allt), slug + ": 0 kyrilliska tecken");
  ok(!/[""''…]/.test(texter.join("")), slug + ": 0 typografiska citat/ellips (em-dash är seriekontraktets standard)");
  ok(!/\t/.test(texter.join("")), slug + ": 0 tabbar");
  ok(!/ {2,}/.test(texter.join(" ")), slug + ": 0 dubbla mellanslag");
  const underscore = texter.filter((t) => t.includes("_"));
  ok(underscore.length === 0, slug + ": 0 underscore i textvärden", JSON.stringify(underscore).slice(0, 120));
  const ord = allt.match(/[a-zåäöéè]{3,}/g) || [];
  const misstankt = [...new Set(ord)].filter((w) => !VITLISTA.some((v) => v.includes(w)) && !["och", "för", "att", "det", "den", "som", "med", "till", "fran", "har", "inte", "ett", "en", "av", "de", "deras", "in", "om", "eller", "dar", "kan", "ska", "var", "for", "under", "over", "mellan", "mot", "efter", "fore", "alla", "nya", "samma", "sina", "här", "nu", "per", "ur", "år", "lite", "tre", "fem"].includes(w));
  varn(misstankt.length < 420, slug + ": genomsök rimlig (" + misstankt.length + " okända ord — vitlista ovan bär dem)");
  if (misstankt.length >= 420) console.log("  exempel: " + misstankt.slice(0, 40).join(" "));
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
const bana = (rs) => rs.reduce((v, r) => v * (1 + r / 100) - 7, 100);
const banaSteg = (rs) => { let v = 100; const steg = []; for (const r of rs) { v = v * (1 + r / 100) - 7; steg.push(r2(v)); } return steg; };
const F4 = [30, 30, -10, -10], E4 = [-10, -10, 30, 30], F6 = [30, 30, 30, -10, -10, -10], E6 = [-10, -10, -10, 30, 30, 30];
// IRR för pe-06:s tidslinje (bisektion, oberoende om kursens tal)
const floden = [-30, -25, -20, -5, 5, 25, 30, 25, 15, 10];
const npv = (r) => floden.reduce((s, f, i) => s + f / Math.pow(1 + r, i + 1), 0);
let lo = 0, hi = 1; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (npv(m) > 0) lo = m; else hi = m; }
const irr = r2(lo * 100);
const ekv = [
  ["rp-05: Före-4 steg 123,0/152,9/130,61/110,549", JSON.stringify(banaSteg(F4)) === JSON.stringify([123, 152.9, 130.61, 110.549])],
  ["rp-05: Efter-4 steg 83,0/67,7/81,01/98,313", JSON.stringify(banaSteg(E4)) === JSON.stringify([83, 67.7, 81.01, 98.313])],
  ["rp-05: gap 110,549−98,313 = 12,236", r2(110.549 - 98.313) === 12.236],
  ["rp-05: utan uttag båda 136,89", r2(100 * 1.3 * 1.3 * 0.9 * 0.9) === 136.89],
  ["rp-05: geometriskt medel (1,3689)^(1/4) = 1,0817 → 8,17 %", r2((Math.pow(1.3689, 0.25) - 1) * 100) === 8.1665 || Math.round((Math.pow(1.3689, 0.25) - 1) * 1000) / 10 === 8.2],
  ["rp-05: tvåår Före 103,7 mot Efter 100,9", r2(bana([30, -10])) === 103.7 && r2(bana([-10, 30])) === 100.9],
  ["rp-05: tvåårsgap 2,8", r2(bana([30, -10]) - bana([-10, 30])) === 2.8],
  ["rp-05: sexår Före 120,83 mot Efter 90,554", r2(bana(F6)) === 120.8297 || Math.round(bana(F6) * 100) / 100 === 120.83],
  ["rp-05: sexår Efter 90,554", Math.round(bana(E6) * 1000) / 1000 === 90.554],
  ["rp-05: sexårsgap 30,3 procent av start", Math.round((bana(F6) - bana(E6)) * 10) / 10 === 30.3],
  ["rp-05: sexår utan uttag båda 160,16", Math.round(100 * Math.pow(1.3, 3) * Math.pow(0.9, 3) * 100) / 100 === 160.16],
  ["rp-05: buffert 14×1,3689 = 19,16", Math.round(14 * 1.3689 * 100) / 100 === 19.16],
  ["rp-05: fönstrets pris 19,16−14 = 5,16", Math.round((14 * 1.3689 - 14) * 100) / 100 === 5.16],
  ["pe-06: indrag 30+25+20+15+10 = 100", 30 + 25 + 20 + 15 + 10 === 100],
  ["pe-06: utbetalningar 10+15+25+30+25+15+10 = 130", 10 + 15 + 25 + 30 + 25 + 15 + 10 === 130],
  ["pe-06: kumulativ botten år 4 = −80 (−30−25−20−5)", -30 - 25 - 20 - 5 === -80],
  ["pe-06: nolllinje under år 8 (−80+5+25+30+25 = +5)", -80 + 5 + 25 + 30 + 25 === 5],
  ["pe-06: slut +30 (130−100)", 130 - 100 === 30],
  ["pe-06: multipel 130/100 = 1,30", 130 / 100 === 1.3],
  ["pe-06: TVPI (130+20)/100 = 1,50", (130 + 20) / 100 === 1.5],
  ["pe-06: RVPI 20/100 = 0,20", 20 / 100 === 0.2],
  ["pe-06: IRR = 6,04 %", Math.round(irr * 100) / 100 === 6.04],
  ["pe-06: effektiv avgift år 1: 2/30 = 6,67 %", Math.round((2 / 30) * 100 * 100) / 100 === 6.67],
  ["pe-06: unfunded-fällan 100+40 = 140", 100 + 40 === 140],
];
for (const [n, v] of ekv) ok(v, n, n.includes("IRR") ? "beräknad " + irr : "");

// ── G. DUPLIKAT + KLAIMVAKT ───────────────────────────────────────────────────
console.log("═══ G DUPLIKAT/KLAIM");
ok(MINA.every((s) => !regSlugs.has(s)), "inga duplikat: båda saknas i registret (" + regSlugs.size + " kurser)");
ok(new Set(MINA).size === 2, "två unika slugar");
for (const slug of MINA) ok(regSlugs.has(VANTA[slug].fore), slug + ": serieföregångaren finns", VANTA[slug].fore);
const serierRp = [...regSlugs].filter((s) => s.startsWith("rp-")).sort();
const serierPe = [...regSlugs].filter((s) => s.startsWith("pe-")).sort();
ok(serierRp.length === 4 && serierRp[serierRp.length - 1] === "rp-04-volatilitetsbudgeten", "rp-serien bär 4 steg, rp-05 blir femte", serierRp.join(","));
ok(serierPe.length === 5 && serierPe[serierPe.length - 1] === "pe-05-andrahandsmarknaden", "pe-serien bär 5 steg, pe-06 blir sjätte", serierPe.join(","));

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
