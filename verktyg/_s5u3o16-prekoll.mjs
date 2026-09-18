#!/usr/bin/env node
/** PRE-KOLL s5-u3 omgång 16 (auto-s5-1789743901668): am-07 + ks-07 + mt-06
 *  Kursfilernas grindar FÖRE register-insert (KVD:n kör samma + round-trip EFTER). */
import { readFileSync } from "node:fs";

const MINA = [
  ["am-07-indexomlaggningen", "AKTIEMARKNADEN I PRAKTIKEN", "Intermediär"],
  ["ks-07-kapitalstrukturens-avvagning", "KAPITALSTRUKTUR", "Avancerad"],
  ["mt-06-kostnadsoverlagsenhet", "MOAT", "Intermediär"],
];
const regKeys = new Set(Object.keys(JSON.parse(readFileSync("public/deep-courses.json", "utf8"))));
const pass = []; const fail = [];
const testa = (n, v, d) => (v ? pass : fail).push(`${v ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`);

for (const [slug, kat, niva] of MINA) {
  let k; try { k = JSON.parse(readFileSync(`data/kurser-tillagg/${slug}.json`, "utf8")); } catch (e) { fail.push(`FAIL ${slug} JSON: ${e.message}`); continue; }
  const t = JSON.stringify(k);
  testa(`${slug} slug-fält = filnamn`, k.slug === slug, k.slug);
  testa(`${slug} kategori`, k.category === kat, k.category);
  testa(`${slug} nivå`, k.level === niva, k.level);
  testa(`${slug} 6 kap à 4 min = 24, xp 50, weight —`, k.chapterCount === 6 && k.totalMinutes === 24 && k.chapters.length === 6 && k.chapters.every((c) => c.minutes === 4) && k.xp === 50 && k.weight === "—");
  testa(`${slug} chapters_list ≡ chapters`, JSON.stringify(k.chapters_list) === JSON.stringify(k.chapters.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))));
  testa(`${slug} why > 200 tecken + history + 3 sektioner`, k.why.length > 200 && !!k.history?.origin && !!k.lynchSection && !!k.grahamSection && !!k.ak1Section);
  const bt = new Set(k.chapters.flatMap((c) => c.blocks.map((b) => b.type)));
  testa(`${slug} blocktyper ⊆ tillåtna`, [...bt].every((b) => ["text", "definition", "insight", "tabell", "utmaning"].includes(b)), [...bt].join(","));
  // Språkgrind
  testa(`${slug} 0 CJK`, !/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(t));
  testa(`${slug} 0 mjuka bindestreck`, !t.includes("\u00ad"));
  testa(`${slug} 0 typografiska citattecken`, !/[\u201c\u201d\u2018\u2019\u00ab\u00bb]/.test(t));
  testa(`${slug} 0 tabbar`, !/\t/.test(t));
  testa(`${slug} 0 dubbla mellanslag`, !/ {2}/.test(t));
  // Juridikgrind
  const rad = [/\b(köp|sälj|undvik|välj)\s+(den|det|denna|aktien|bolaget|portföljen)\b/gi, /\bvi (rekommenderar|råder)\b/gi, /\bdu (bor|bör) (köpa|sälja|ägna|placera|investera)\b/gi, /\brekommenderar\b/gi, /\bdet är (dags|läge) att (köpa|sälja)\b/gi];
  const radTraff = rad.flatMap((re) => [...t.matchAll(re)].map((m) => m[0]));
  testa(`${slug} 0 rådsfraser`, radTraff.length === 0, radTraff.join(","));
  testa(`${slug} utbildningsframing`, /utbildning/i.test(t) && /aldrig råd om placeringar/.test(t));
  testa(`${slug} 0 lagrum`, !/\b\d{4}:\d+\b/.test(t));
  // R2
  testa(`${slug} 0 pris-/tier-tal`, !/\b(9\s?999|13\s?999|249|449|799)\b/.test(t));
  // Skuggkoder (kursens egen slug undantas — den blir registeräkta vid insert)
  const koder = [...new Set([...t.matchAll(/\b([a-z]{2,5}-\d{2})\b/g)].map((m) => m[1]))];
  const skuggor = koder.filter((x) => x !== slug.match(/^[a-z]+-\d+/)[0] && ![...regKeys].some((r) => r.startsWith(x + "-") || r === x));
  testa(`${slug} 0 skuggkoder`, skuggor.length === 0, skuggor.join(","));
}

// Talnärvaro (signaturtalen ska stå skrivna i kursen)
const TAL = {
  "am-07-indexomlaggningen": ["3 840", "32 000", "40 000", "600", "50 000", "10 000", "44,52", "42,00", "42,74", "1,8", "64", "1,2", "2,2", "12"],
  "ks-07-kapitalstrukturens-avvagning": ["1 000", "400", "600", "13,3", "20,6", "82,4", "4,12", "1 082,4", "164,8", "247,2", "67,4", "104,8", "67,2", "800", "1 200", "52", "108", "6,5", "9,0", "20"],
  "mt-06-kostnadsoverlagsenheit": ["1 000", "60", "50", "16,7", "30", "55", "25", "38", "34", "31", "24", "800", "300", "7,5", "45", "5,6", "20"],
};
for (const [slug, tal] of Object.entries(TAL)) {
  let k; try { k = JSON.parse(readFileSync(`data/kurser-tillagg/${slug}.json`, "utf8")); } catch { continue; }
  const t = JSON.stringify(k);
  const saknas = tal.filter((x) => !t.includes(x));
  testa(`TAL ${slug} samtliga ${tal.length} signaturtal skrivna`, saknas.length === 0, saknas.join(","));
}

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nPRE-KOLL RÖD: ${pass.length} PASS, ${fail.length} FEL`); process.exit(1); }
console.log(`\nPRE-KOLL GRÖN: ${pass.length} PASS 0 FEL — tre kursfiler klara för insert.`);
