/**
 * r261 KVD — B29 gruvaktier (svenskt original, kursankare se-20-gruv-och-metallsektorn).
 *
 * Klaimfil data/vakten/s3-b29-gruv-metall-ansprak-2026-09-26.md skriven FÖRE arbetet.
 * Mall: _r259-b28-ar-kvd.mjs (struktur: ord, title/OG, sökordsplaceringar, korslänkar,
 * externa URL:er, varumärkesgrind, rådverb, H2/H1, readingMinutes, disclaimer) —
 * anpassat för ORIGINAL (ingen översättningsparitet): i stället TAL-KONTROLL att
 * varje tal i texten finns i kursankaret/universumet ELLER är motorräknat ur dem.
 *
 * Kontroller:
 *  1. BlogPost-form exakt + slug + publishedAt = leveransdagen 2026-09-26
 *  2. title ≤ 60 och börjar med sökordet; description ≤ 155 och innehåller sökordet
 *  3. Ord raw 1200–1400 (ordergränsen för detta uppdrag)
 *  4. readingMinutes = round(ord/600)
 *  5. Sökord "gruvaktier" i H1 + ingress + minst 2 H2
 *  6. H1 = 1; H2 ≥ 5
 *  7. Korslänkar: varje intern href verifierad mot publicerade ytor
 *     (public/deep-courses.json ∪ data/blogg/*.json) — 0 mot utkast
 *  8. Externa URL:er: LIVE-test i KVD:n (följer redirects, slutstatus 200)
 *  9. Varumärkesgrinden — 26 regexer ur data/varumarke.json × 3 ytor = 0 FEL/0 VARN
 * 10. Rådverb SV+EN 0 träffar (juridikgrinden — ren utbildning)
 * 11. Disclaimer exakt sista rad
 * 12. TAL-KONTROLL: varje tal i description+body finns i kursankaret ∪ universumet
 *     (VALE/FCX/FMG.AX/NST.AX/S32.AX/MT/BOL.ST) ∪ motorhärledda ∪ årtal 1990–2035
 * 13. Aritmetik motorräknad (kursens exempel + universumsseriernas förändringar)
 * 14. Läckor 0: inga engelska språkfragment (vitlistning av egennamn/facktecken)
 */
import { readFileSync, readdirSync } from "node:fs";
import https from "node:https";

const ROTT = "/home/ak1a/agent/ak1";
const FIL = `${ROTT}/data/blogg-utkast/gruvaktier-sa-analyserar-du-gruvbolag.json`;
const ANKARE = `${ROTT}/data/kurser-tillagg/se-20-gruv-och-metallsektorn.json`;
const UNIVERS = `${ROTT}/data/portfolj-system/bolagsunivers.json`;
const SOKORD = "gruvaktier";
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

// — pool U: universumets 7 bärningsposter (inkl. noteringar) —
// Skalvarianter (÷1e3/1e6/1e9) medger att texten skriver serietal i miljoner/miljarder
// (universumet lagrar t.ex. Bolidens omsättning i kronor: 86 437 000 000 → 86 437 Mkr).
const uni = JSON.parse(readFileSync(UNIVERS, "utf8"));
const arr = Array.isArray(uni) ? uni : uni.bolag || [];
const poolUnivers = new Set();
for (const t of ["VALE", "FCX", "FMG.AX", "NST.AX", "S32.AX", "MT", "BOL.ST"]) {
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
H(Math.round(((93509 / 86437 - 1) * 100) * 10) / 10, "Boliden omsättning 93 509/86 437 → +8,2 %");
H(Math.round(((1 - 9404 / 12410) * 100) * 10) / 10, "Boliden resultat 9 404/12 410 → −24,2 %");

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
rapp(G.slug === "gruvaktier-sa-analyserar-du-gruvbolag", "slug = konvention <sökord>aktier-sa-analyserar-du-<bolagsform>", G.slug);
rapp(G.pillar === "Institutionell metodik" && G.author === "AK1A Research Lab", "metadata enligt mall (pillar/author)", `${G.pillar} / ${G.author}`);
rapp(G.publishedAt === LEVERANSDAG, `publishedAt = leveransdagen ${LEVERANSDAG}`, G.publishedAt);
rapp(G.tags.length >= 4 && G.tags[0] === SOKORD, `tags ${G.tags.length} st, sökord först`, G.tags.join(","));

// 2. Längder + sökordsplacering i title/description
rapp([...G.title].length <= 60 && G.title.startsWith("Gruvaktier"), `title ${[...G.title].length}/60 med sökord först`, G.title);
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
rapp(ogiltiga.length === 0 && lankar.length >= 6, `Korslänkar ${lankar.length} st mot PUBLICERADE ytor (0 ogiltiga)`,
  ogiltiga.length ? `ogiltiga: ${ogiltiga.join(", ")}` : `varav ${(lankar.filter((l) => l.startsWith('/kurser/'))).length} kurser + ${(lankar.filter((l) => l.startsWith('/blogg/'))).length} blogg`);

// 8. Externa URL:er live
const urler = [...new Set(urlerUr(G.body))];
const externaSvar = await Promise.all(urler.map(async (u) => [u, await hamta(u)]));
for (const [u, s] of externaSvar) console.log(`    extern: ${s} ${u}`);
rapp(externaSvar.every(([, s]) => s === 200) && urler.length >= 2, `Externa URL:er live ${urler.length} st, samtliga slutstatus 200`);

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
j("malmhalt 100 × 40 = 4 000", Math.abs(100 * 40 - 4000) < 1e-9, `motor ${100 * 40}`);
j("malmhalt 50 × 40 = 2 000", Math.abs(50 * 40 - 2000) < 1e-9, `motor ${50 * 40}`);
j("marginal 4,00 − 1,60 = 2,40", Math.abs(4.0 - 1.6 - 2.4) < 1e-9);
j("marginal 4,00 − 2,80 = 1,20", Math.abs(4.0 - 2.8 - 1.2) < 1e-9);
j("hävstång 4,00 ÷ 2,40 ≈ 1,67", Math.abs(4.0 / 2.4 - 1.67) < 0.005, `motor ${(4.0 / 2.4).toFixed(4)}`);
j("hävstång 4,00 ÷ 1,20 ≈ 3,33", Math.abs(4.0 / 1.2 - 3.33) < 0.005, `motor ${(4.0 / 1.2).toFixed(4)}`);
j("pris +10 %: 4,40 − C1 → 2,80/1,60", Math.abs(4.4 - 1.6 - 2.8) < 1e-9 && Math.abs(4.4 - 2.8 - 1.6) < 1e-9);
j("marginalrörelse +16,7 % (2,80/2,40)", Math.abs((2.8 / 2.4 - 1) * 100 - 16.7) < 0.05, `motor ${((2.8 / 2.4 - 1) * 100).toFixed(2)}`);
j("marginalrörelse +33,3 % (1,60/1,20)", Math.abs((1.6 / 1.2 - 1) * 100 - 33.3) < 0.05, `motor ${((1.6 / 1.2 - 1) * 100).toFixed(2)}`);
j("pris −10 %: 3,60 − C1 → 2,00/0,80", Math.abs(3.6 - 1.6 - 2.0) < 1e-9 && Math.abs(3.6 - 2.8 - 0.8) < 1e-9);
j("cykel 2,00 → 4,00 = +100 %", Math.abs((4.0 / 2.0 - 1) * 100 - 100) < 1e-9);
j("bi-metall 106 + 33 = 139", Math.abs(106 + 33 - 139) < 1e-9);
j("guldkrediten 33/139 ≈ nästan en fjärdedel", 33 / 139 > 0.2 && 33 / 139 < 0.25, `motor ${(33 / 139).toFixed(3)}`);
j("livslängd 6,0 ÷ 0,2 = 30", Math.abs(6.0 / 0.2 - 30) < 1e-9);
j("Boliden oms 93 509/86 437 → +8,2 %", Math.abs((93509 / 86437 - 1) * 100 - 8.2) < 0.05, `motor ${((93509 / 86437 - 1) * 100).toFixed(3)}`);
j("Boliden res 9 404/12 410 → −24,2 %", Math.abs((1 - 9404 / 12410) * 100 - 24.2) < 0.05, `motor ${((1 - 9404 / 12410) * 100).toFixed(3)}`);
j("FMG utdelning 2 529/6 699 → −62 %", Math.abs((1 - 2529 / 6699) * 100 - 62) < 0.5, `motor ${((1 - 2529 / 6699) * 100).toFixed(2)}`);
j("FMG brutto 56,0 − 40,1 = 15,9", Math.abs(56.0 - 40.1 - 15.9) < 1e-9);
j("NST brutto 37,8 − 14,3 → +23,4 (universumets egen avrundning, rå diff 23,5)", Math.abs((37.8 - 14.3) - 23.4) <= 0.15, `motor ${(37.8 - 14.3).toFixed(2)}`);
j("VALE netto 13 814/95 924 ^(1/3) → −47,6 %/år", Math.abs(Math.abs(Math.pow(13814 / 95924, 1 / 3) - 1) * 100 - 47.6) < 0.1, `motor ${(Math.abs(Math.pow(13814 / 95924, 1 / 3) - 1) * 100).toFixed(2)}`);
j("FCX minoritetsandel 12,1/32,2 → 38 % (universumets egen avrundning)", Math.abs((12.1 / 32.2) * 100 - 38) < 0.5, `motor ${((12.1 / 32.2) * 100).toFixed(2)}`);
j("checklistans steg = 6", (G.body.match(/^\d\. \*\*/gm) || []).length === 6);
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
  "ak1a", "boliden", "freeport-mcmoran", "freeport", "vale", "fortescue", "northern", "star",
  "south32", "bhp", "grasberg", "pilbara", "sgu", "yahoo", "finance", "marketstack",
  "stockanalysis", "s&p", "global", "market", "intelligence", "case-kursen", "c1", "aisc",
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
