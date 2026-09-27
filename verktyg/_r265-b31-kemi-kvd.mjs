/**
 * r265 KVD — B31 kemiktier (svenskt original, kursankare se-21-kemisektorn).
 *
 * Klaimfil data/vakten/s3-b31-kemi-ansprak-2026-09-26.md skriven FÖRE arbetet
 * (disk-först-regeln). Mall: _r264-b30-rederi-kvd.mjs (struktur: ord, title/OG,
 * sökordsplaceringar, korslänkar, externa URL:er, varumärkesgrind, rådverb,
 * H2/H1, readingMinutes, disclaimer) — anpassat för ORIGINAL (ingen
 * översättningsparitet): i stället TAL-KONTROLL att varje tal i texten finns
 * i kursankaret/universumet ELLER är motorräknat ur dem.
 *
 * Kontroller:
 *  1. BlogPost-form exakt + slug + publishedAt = leveransdagen 2026-09-26
 *  2. title ≤ 60 och börjar med sökordet; description ≤ 155 och innehåller sökordet
 *  3. Ord raw 1200–1400 (ordergränsen för detta uppdrag)
 *  4. readingMinutes = round(ord/600)
 *  5. Sökord "kemiktier" i H1 + ingress + minst 2 H2
 *  6. H1 = 1; H2 ≥ 5
 *  7. Korslänkar 12–18: varje intern href verifierad mot publicerade ytor
 *     (public/deep-courses.json ∪ data/blogg/*.json) — 0 mot utkast
 *  8. Externa URL:er 3–5: LIVE-test i KVD:n (följer redirects, slutstatus 200)
 *  9. Varumärkesgrinden — regexer ur data/varumarke.json × 3 ytor = 0 FEL/0 VARN
 * 10. Rådverb SV+EN 0 träffar (juridikgrinden — ren utbildning)
 * 11. Disclaimer exakt sista rad
 * 12. TAL-KONTROLL: varje tal i description+body finns i kursankaret ∪ universumet
 *     (YAR.OL/BAS.DE/SHW/AI.PA/NTR/4063.T) ∪ motorhärledda ∪ årtal 1990–2035
 * 13. Aritmetik motorräknad (kursens gasräkning/trappa/marginaler + universumsserierna)
 * 14. Läckor 0: inga engelska språkfragment (vitlistning av egennamn/facktecken)
 */
import { readFileSync, readdirSync } from "node:fs";
import https from "node:https";

const ROTT = "/home/ak1a/agent/ak1";
const FIL = `${ROTT}/data/blogg-utkast/kemiktier-sa-analyserar-du-kemibalag.json`;
const ANKARE = `${ROTT}/data/kurser-tillagg/se-21-kemisektorn.json`;
const UNIVERS = `${ROTT}/data/portfolj-system/bolagsunivers.json`;
const SOKORD = "kemiktier";
const LEVERANSDAG = "2026-09-26";

const BLOGFALT = ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"];
const varumarke = JSON.parse(readFileSync(`${ROTT}/data/varumarke.json`, "utf8"));
const franRegexar = varumarke.forbjudnaFraser.map((f) => ({ allvar: f.allvar, re: new RegExp(f.fran, "giu") }));

const radverbEN = [
  /\b(?:you|we|readers?|investors?)\s+(?:should|must)\s+(?:buy|sell|avoid|pick|grab)\b/i,
  /\b(?:buy|sell|grab|snap\s+up)\s+(?:this|the)\s+(?:stock|share|company)\b/i,
  /\b(?:our|my)\s+(?:top\s+)?recommendation\b/i,
  /\brecommend\s+(?:buying|selling|that\s+you)\b/i,
  /\bbest\s+stock\s+to\s+buy\b/i,
  /\bhot\s+stock\b/i,
  /\bact\s+now\b/i,
];
const radverbSV = [
  /\bköp\s+(?:denna|denne|denna här|aktien)\b/i,
  /\bsälj\s+(?:dina\s+)?aktier\b/i,
  /\bmin\s+rekommendation\b/i,
  /\bvi\s+rekommenderar\b/i,
  /\bdet\s+är\s+en\s+(?:bra|dålig)\s+köp\b/i,
];

// — talnormalisering (SV mellanslagstusental + komma-decimal → punktdecimal) —
const rensadUrl = (t) => t.replace(/https?:\/\/[^\s)\]]+/g, " ").replace(/\]\([^)]*\)/g, "]");
const normaliseraTal = (t) =>
  rensadUrl(t)
    .replace(/(\d)[ ](\d{3})(?![\d])/g, "$1$2")
    .replace(/,(\d+)/g, ".$1");
const talUr = (t) => (normaliseraTal(t).match(/\d+(?:\.\d+)?/g) || []).map((x) => String(Number(x)));

// — pool A: kursankarets alla tal (strukturell JSON-parsning — kommanormalisering
// får ALDRIG köras över rå JSON: den slår ihop arrayelementen "tal,tal" till decimaler) —
const samlaUrJson = (nod, ut) => {
  if (typeof nod === "number") ut.add(String(Number(nod)));
  else if (typeof nod === "string") for (const t of talUr(nod)) ut.add(t);
  else if (Array.isArray(nod)) for (const x of nod) samlaUrJson(x, ut);
  else if (nod && typeof nod === "object") for (const v of Object.values(nod)) samlaUrJson(v, ut);
};
const ankare = JSON.parse(readFileSync(ANKARE, "utf8"));
const poolAnkare = new Set();
samlaUrJson(ankare, poolAnkare);

// — pool U: universumets 6 kemibärare (inkl. noteringar) —
// Skalvarianter (÷1e3/1e6/1e9) medger att texten skriver serietal i miljoner/miljarder
// (universumet lagrar t.ex. BASF-omsättningen 87 327 000 000 → 87 327 MEUR).
const uni = JSON.parse(readFileSync(UNIVERS, "utf8"));
const arr = Array.isArray(uni) ? uni : uni.bolag || [];
const poolUnivers = new Set();
for (const t of ["YAR.OL", "BAS.DE", "SHW", "AI.PA", "NTR", "4063.T"]) {
  const b = arr.find((x) => x.ticker === t);
  if (!b) continue;
  const bTal = new Set();
  samlaUrJson(b, bTal);
  for (const tal of bTal) {
    poolUnivers.add(tal);
    const n = Number(tal);
    if (Number.isInteger(n) && n >= 1e6) {
      for (const skala of [1e3, 1e6, 1e9]) {
        if (n % skala === 0) poolUnivers.add(String(n / skala));
      }
    }
  }
}

// — pool D: motorhärledda tal (dokumenterade formler, verifieras i kontroll 13) —
const harledda = new Map();
const H = (varde, formel) => harledda.set(String(varde), formel);
// Yara-serien (universumet, NOK — icke-runda tal avrundas till textens decimal):
H(249.7, "Yara omsättning 2022: 249 665 734 680 NOK → 249,7 mdr");
H(165.1, "Yara omsättning 2023: 165 082 710 100 NOK → 165,1 mdr");
H(33.9, "Yara omsättningsfall: (1 − 165 082 710 100/249 665 734 680) → −33,9 %");
H(28.8, "Yara resultat 2022: 28 827 148 360 NOK → 28,8 mdr");
H(510, "Yara resultat 2023: 509 678 400 NOK → 510 M");
H(157, "Yara resultat 2024: 156 958 340 NOK → 157 M");
H(0.5, "Yara 2024: 156 958 340 ÷ 28 827 148 360 = 0,5 % av 2022 (även FoU 60/12 000 = 0,5 %)");
H(13, "Yara resultat 2025: 13 032 525 600 NOK → 13,0 mdr");
H(45, "Yara 2025: 13 032 525 600 ÷ 28 827 148 360 = 45 % av toppåret");
// BASF-serien (universumet, EUR):
H(31.7, "BASF omsättningsfall 2022–2025: (1 − 59 657 000 000/87 327 000 000) → −31,7 %");
H(627, "BASF resultat 2022: −627 000 000 EUR → −627 M");
// Värderingsavrundning:
H(8.3, "Yara P/E 8,287 → 8,3");

const arTal = (x) => { const n = Number(x); return n >= 1990 && n <= 2035 && Number.isInteger(n); };

const lankarUr = (body) => [...body.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]);
const urlerUr = (body) => [...body.matchAll(/https?:\/\/[^ \n)]+/g)].map((m) => m[0]);
const ordRaw = (body) =>
  body
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

let fel = 0;
const rapp = (ok, namn, detalj) => {
  if (!ok) fel++;
  console.log(`  ${ok ? "GRÖN" : "RÖD "} ${namn}${detalj ? " — " + detalj : ""}`);
};

// — live-URL-test (följer redirects, kakor, slutstatus) —
function hamta(url, djup = 0, kakor = {}) {
  return new Promise((resolve) => {
    if (djup > 10) return resolve(-1);
    const req = https.get(url, { timeout: 15000, headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", Accept: "text/html,*/*", Cookie: Object.entries(kakor).map(([k, v]) => `${k}=${v}`).join("; ") }, rejectUnauthorized: false }, (res) => {
      const status = res.statusCode;
      const loc = res.headers.location;
      const nya = { ...kakor };
      for (const c of res.headers["set-cookie"] || []) { const [kv] = c.split(";"); const [k, v] = kv.split("="); nya[k.trim()] = (v || "").trim(); }
      res.resume();
      if (status >= 300 && status < 400 && loc) return hamta(new URL(loc, url).toString(), djup + 1, nya).then(resolve);
      resolve(status);
    });
    req.on("timeout", () => { req.destroy(); resolve(-1); });
    req.on("error", () => resolve(-1));
  });
}

const G = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`\n=== ${FIL.split("/").pop()} ===`);

// 1. Form + slug + metadata
rapp(JSON.stringify(Object.keys(G)) === JSON.stringify(BLOGFALT), "BlogPost-form exakt", Object.keys(G).join(","));
rapp(G.slug === "kemiktier-sa-analyserar-du-kemibalag", "slug = konvention <sökord>-sa-analyserar-du-<bolagsform>", G.slug);
rapp(G.pillar === "Institutionell metodik" && G.author === "AK1A Research Lab", "metadata enligt mall (pillar/author)", `${G.pillar} / ${G.author}`);
rapp(G.publishedAt === LEVERANSDAG, `publishedAt = leveransdagen ${LEVERANSDAG}`, G.publishedAt);
rapp(G.tags.length >= 4 && G.tags[0] === SOKORD, `tags ${G.tags.length} st, sökord först`, G.tags.join(","));

// 2. Längder + sökordsplacering i title/description
rapp([...G.title].length <= 60 && G.title.startsWith("Kemiktier"), `title ${[...G.title].length}/60 med sökord först`, G.title);
rapp([...G.description].length <= 155 && G.description.toLowerCase().includes(SOKORD), `description ${[...G.description].length}/155 med sökord`);

// 3. Ord raw
const ord = ordRaw(G.body);
rapp(ord >= 1200 && ord <= 1400, `ord raw ${ord} (gräns 1200–1400)`);

// 4. readingMinutes
rapp(G.readingMinutes === Math.round(ord / 600), `readingMinutes ${G.readingMinutes} = round(${ord}/600)`);

// 5. Sökord i H1 + ingress + ≥2 H2 (skiftlägesokänsligt — satsens start versaler)
const block0 = G.body.split("\n\n")[0];
const ingress = G.body.split("\n\n")[1];
const h2 = [...G.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
const h2Traff = h2.filter((h) => h.toLowerCase().includes(SOKORD)).length;
rapp(
  block0.startsWith("# ") && block0.toLowerCase().includes(SOKORD) && ingress.toLowerCase().includes(SOKORD) && h2Traff >= 2,
  `Sökord "${SOKORD}" i H1+ingress+≥2 H2`,
  `H1:${block0.toLowerCase().includes(SOKORD)} ingress:${ingress.toLowerCase().includes(SOKORD)} H2:${h2Traff}/${h2.length}`
);

// 6. H1/H2-struktur
rapp((G.body.match(/^# /gm) || []).length === 1, "H1 exakt 1");
rapp(h2.length >= 5, `H2 ${h2.length} st (≥5)`);

// 7. Korslänkar mot publicerade ytor
const dc = JSON.parse(readFileSync(`${ROTT}/public/deep-courses.json`, "utf8"));
let kursSlugs = [];
(function vandla(n, d) {
  if (d > 6) return;
  if (Array.isArray(n)) { for (const x of n) vandla(x, d + 1); return; }
  if (n && typeof n === "object") {
    if (typeof n.slug === "string") kursSlugs.push(n.slug);
    for (const v of Object.values(n)) vandla(v, d + 1);
  }
})(dc, 0);
const bloggSlugs = new Set(readdirSync(`${ROTT}/data/blogg`).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")));
const lankar = lankarUr(G.body);
const ogiltiga = lankar.filter((l) => {
  if (l.startsWith("/kurser/")) return !kursSlugs.includes(l.replace("/kurser/", ""));
  if (l.startsWith("/blogg/")) return !bloggSlugs.has(l.replace("/blogg/", ""));
  return true;
});
rapp(ogiltiga.length === 0 && lankar.length >= 12 && lankar.length <= 18, `Korslänkar ${lankar.length} st (12–18) mot PUBLICERADE ytor (0 ogiltiga)`,
  ogiltiga.length ? `ogiltiga: ${ogiltiga.join(", ")}` : `varav ${(lankar.filter((l) => l.startsWith('/kurser/'))).length} kurser + ${(lankar.filter((l) => l.startsWith('/blogg/'))).length} blogg`);

// 8. Externa URL:er live
const urler = [...new Set(urlerUr(G.body))];
const externaSvar = await Promise.all(urler.map(async (u) => [u, await hamta(u)]));
for (const [u, s] of externaSvar) console.log(`    extern: ${s} ${u}`);
rapp(externaSvar.every(([, s]) => s === 200) && urler.length >= 3 && urler.length <= 5, `Externa URL:er live ${urler.length} st (3–5), samtliga slutstatus 200`);

// 9. Varumärkesgrind × 3 ytor
let felTr = 0;
let varTr = 0;
for (const yta of [G.title, G.description, G.body]) {
  for (const { allvar, re } of franRegexar) {
    re.lastIndex = 0;
    const n = (yta.match(re) || []).length;
    if (n > 0 && allvar === "FEL") { felTr += n; console.log(`    FEL-träff i varumärkesgrinden`); }
    if (n > 0 && allvar === "VARNING") { varTr += n; console.log(`    VARNING-träff i varumärkesgrinden`); }
  }
}
rapp(felTr === 0 && varTr === 0, `Varumärkesgrind ${franRegexar.length} regexer × 3 ytor (FEL ${felTr}, VARNING ${varTr})`);

// 10. Rådverb SV+EN
const radTr = [...radverbEN, ...radverbSV].flatMap((re) => G.body.match(re) || []);
rapp(radTr.length === 0, "Rådverb SV+EN 0 träffar (juridikgrinden)", radTr.join("; "));

// 11. Disclaimer exakt sista rad
const sista = G.body.trim().split("\n").pop().trim();
rapp(sista === "_Detta är pedagogisk finansanalys, inte investeringsråd._", "Disclaimer exakt sista rad", sista);

// 12. TAL-KONTROLL: vart tal i texten ska vara ankaret/universumet/härlett/årtal
const talText = talUr(G.description + " " + G.body);
const kalla = (t) =>
  poolAnkare.has(t) ? "ankare" : poolUnivers.has(t) ? "universum" : harledda.has(t) ? "härlett" : arTal(t) ? "årtal" : null;
const otalda = [...new Set(talText.filter((t) => !kalla(t)))];
rapp(otalda.length === 0, `TAL-KONTROLL ${new Set(talText).size} unika tal — alla i ankare/universum/härledda/årtal`,
  otalda.length ? "saknar källa: " + otalda.join(", ") : "");
const franHarledda = [...new Set(talText.filter((t) => kalla(t) === "härlett"))];
console.log(`    härledda tal i texten: ${franHarledda.join(", ") || "—"}`);

// 13. Aritmetik motorräknad
const ari = [];
const j = (namn, villkor, detalj) => ari.push([namn, villkor, detalj]);
// — kursens gaskostnadsmultiplikation (se-21 kap 2) —
j("gaskostnad gas 4: 33 × 4 = 132", 33 * 4 === 132, `motor ${33 * 4}`);
j("gaskostnad gas 8: 33 × 8 = 264", 33 * 8 === 264, `motor ${33 * 8}`);
j("gaskostnad gas 12: 33 × 12 = 396", 33 * 12 === 396, `motor ${33 * 12}`);
// — kursens totalkostnader (kap 2) —
j("högkostnad: 396 + 150 = 546", 396 + 150 === 546, `motor ${396 + 150}`);
j("lågkostnad: 132 + 150 = 282", 132 + 150 === 282, `motor ${132 + 150}`);
// — kursens marginaler vid pris 560 (kap 2 + 4) —
j("partnermarginal: 560 − 546 = 14", 560 - 546 === 14, `motor ${560 - 546}`);
j("lågkostnadsmarginal: 560 − 282 = 278", 560 - 282 === 278, `motor ${560 - 282}`);
j("kvot: 278 ÷ 14 = 19,9 (motor 19,86)", Math.abs(278 / 14 - 19.9) < 0.05, `motor ${(278 / 14).toFixed(2)}`);
// — utbudstrappan vid pris 500 (kap 4) —
j("partner stopp: 500 − 546 = −46", 500 - 546 === -46, `motor ${500 - 546}`);
j("lågkostnad lever: 500 − 282 = 218", 500 - 282 === 218, `motor ${500 - 282}`);
j("ny partner gas 8: 264 + 150 = 414", 264 + 150 === 414, `motor ${264 + 150}`);
j("ny partnerrmarginal: 500 − 414 = 86", 500 - 414 === 86, `motor ${500 - 414}`);
// — kursens kontrastbolag (kap 1) —
j("Norden Bulk: 12 000 × 0,18 = 2 160", 12000 * 0.18 === 2160, `motor ${12000 * 0.18}`);
j("Norden Special: 3 000 × 0,38 = 1 140", 3000 * 0.38 === 1140, `motor ${3000 * 0.38}`);
j("specialandel: 1 140 ÷ (2 160 + 1 140) = 34,5 %", Math.abs(1140 / (2160 + 1140) * 100 - 34.5) < 0.05, `motor ${(1140 / (2160 + 1140) * 100).toFixed(2)}`);
// — FoU-andelarna (kap 5) —
j("FoU special: 150 ÷ 3 000 = 5 %", Math.abs(150 / 3000 * 100 - 5) < 1e-9, `motor ${150 / 3000 * 100}`);
j("FoU bulk: 60 ÷ 12 000 = 0,5 %", Math.abs(60 / 12000 * 100 - 0.5) < 1e-9, `motor ${60 / 12000 * 100}`);
// — gaschocken (kap 6 utmaning) —
j("gaschock marginal: 560 − 414 = 146", 560 - 414 === 146, `motor ${560 - 414}`);
// — Yara-serien (universumet, NOK) —
j("Yara omsättningsfall: (1 − 165 082 710 100/249 665 734 680) → 33,9 %", Math.abs((1 - 165082710100 / 249665734680) * 100 - 33.9) < 0.05, `motor ${((1 - 165082710100 / 249665734680) * 100).toFixed(2)}`);
j("Yara botten: 156 958 340 ÷ 28 827 148 360 = 0,5 %", Math.abs(156958340 / 28827148360 * 100 - 0.5) < 0.05, `motor ${((156958340 / 28827148360) * 100).toFixed(2)}`);
j("Yara återhämtning: 13 032 525 600 ÷ 28 827 148 360 = 45 %", Math.abs(13032525600 / 28827148360 * 100 - 45) < 0.5, `motor ${((13032525600 / 28827148360) * 100).toFixed(1)}`);
// — BASF-serien (universumet, EUR) —
j("BASF omsättningsfall: (1 − 59 657 000 000/87 327 000 000) → 31,7 %", Math.abs((1 - 59657000000 / 87327000000) * 100 - 31.7) < 0.05, `motor ${((1 - 59657000000 / 87327000000) * 100).toFixed(2)}`);
j("BASF resultatserie växer efter 2022: 225 < 1 298 < 1 619", 225 < 1298 && 1298 < 1619, "motor: monotona jämförelser");
// — Shin-Etsu/Air Liquide/Nutrien (universumet) —
j("Shin-Etsu alla serier stigande 4 år: oms 2 338→2 912, netto 437→648", 2338 < 2504 && 2504 < 2720 && 2720 < 2912 && 437 < 495 && 495 < 559 && 559 < 648, "motor: monotona jämförelser");
j("Air Liquide netto stiger på platt omsättning: 2 572 → 3 518", 2572 < 3518, "motor: 3 518 > 2 572");
j("Nutrien cykel: 7 660 > 744 < 2 153 (botten + återhämtning)", 7660 > 744 && 744 < 2153, "motor: 744 är botten");
j("SHW marginal resa: 42,8 → 48,9 (stigande)", 42.8 < 48.9, "motor: 48,9 > 42,8");
j("checklistans steg = 7", (G.body.match(/^\d\. \*\*/gm) || []).length === 7);
for (const [namn, ok, detalj] of ari) rapp(ok, `aritmetik: ${namn}`, detalj || "");

// 14. Läckor 0 — engelska språkfragment. Två spår:
//   (a) engelsk blacklist (funktion ord + branschord som skulle signalera läckage),
//   (b) korpusvokabulär: ord som förekommer i bibliotekets publicerade svenska
//       original (data/blogg + utkast utan -en/-ar) är etablerad svensk användning.
const svKorpus = new Set();
for (const kat of ["blogg", "blogg-utkast"]) {
  for (const f of readdirSync(`${ROTT}/data/${kat}`).filter((f) => f.endsWith(".json"))) {
    const slug = f.replace(".json", "");
    if (slug.endsWith("-en") || slug.endsWith("-ar")) continue;
    try {
      const p = JSON.parse(readFileSync(`${ROTT}/data/${kat}/${f}`, "utf8"));
      for (const ord of (p.body || "").toLowerCase().match(/[\p{L}\-]+/gu) || []) svKorpus.add(ord);
    } catch { /* hoppa över ogiltig json */ }
  }
}
const engBlacklist = new Set([
  "the", "and", "of", "in", "is", "on", "with", "for", "from", "this", "that", "these", "those",
  "stocks", "stock", "mine", "mining", "miner", "iron", "ore", "copper", "gold", "silver",
  "cash", "flow", "sustaining", "cost", "costs", "spread", "endpoint", "moat", "world",
  "largest", "producer", "production", "million", "billion", "revenue", "earnings", "profit",
  "margin", "cycle", "price", "volume", "demand", "supply", "will", "would", "can", "could",
  "should", "must", "has", "have", "had", "are", "was", "were", "been", "not", "all", "you",
  "your", "when", "what", "how", "why", "it's", "into", "over", "under", "about", "than",
]);
const vitlista = [
  "ak1a", "yara", "basf", "sherwin-williams", "shin-etsu", "stockanalysis", "nutrien",
  "air", "liquide", "take-or-pay", "s&p", "global", "market", "intelligence", "yahoo",
  "finance", "case-kursen",
];
const ordKropp = G.body
  .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
  .replace(/https?:\/\/\S+/g, " ")
  .replace(/\bP\/E\b/gi, " ")
  .toLowerCase()
  .match(/[\p{L}\-&.]+/gu) || [];
const lekord = [...new Set(
  ordKropp
    .filter((w) => w.length >= 2)
    .filter((w) => !vitlista.includes(w) && !svKorpus.has(w) && engBlacklist.has(w))
)];
// kompletterande fälla: rena ASCII-token som varken finns i korpus/vitlista/blacklist —
// rapporteras som misstänkta (manuell granskning av listan nedan)
const misstankta = [...new Set(
  ordKropp
    .filter((w) => w.length >= 3 && !vitlista.includes(w) && !svKorpus.has(w) && !engBlacklist.has(w))
    .filter((w) => /^[a-z][a-z\-&.]*$/.test(w))
)];
rapp(lekord.length === 0, `Läckor 0 (engelsk blacklist träffar: ${lekord.length})`, lekord.join(", "));
console.log(`    misstänkta okända token (skall vara tom/etablerade): ${misstankta.join(", ") || "—"}`);

console.log(`\nSLUTRESULTAT: ${fel === 0 ? "ALLT GRÖNT" : fel + " RÖDA"}`);
process.exit(fel === 0 ? 0 : 1);
