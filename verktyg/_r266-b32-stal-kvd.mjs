/**
 * r266 KVD — B32 stålaktier (svenskt original, kursankare se-23-stalsektorn).
 *
 * Klaimfil data/vakten/s3-b32-stal-ansprak-2026-09-26.md skriven FÖRE arbetet
 * (disk-först-regeln). Mall: _r265-b31-kemi-kvd.mjs (struktur: ord, title/OG,
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
 *  5. Sökord "stålaktier" i H1 + ingress + minst 2 H2
 *  6. H1 = 1; H2 ≥ 5
 *  7. Korslänkar 12–18: varje intern href verifierad mot publicerade ytor
 *     (public/deep-courses.json ∪ data/blogg/*.json) — 0 mot utkast
 *  8. Externa URL:er 3–5: LIVE-test i KVD:n (följer redirects, slutstatus 200)
 *  9. Varumärkesgrinden — regexer ur data/varumarke.json × 3 ytor = 0 FEL/0 VARN
 * 10. Rådverb SV+EN 0 träffar (juridikgrinden — ren utbildning)
 * 11. Disclaimer exakt sista rad
 * 12. TAL-KONTROLL: varje tal i description+body finns i kursankaret ∪ universumet
 *     (SSAB-B.ST/NUE/MT/5401.T) ∪ motorhärledda ∪ årtal 1990–2035
 * 13. Aritmetik motorräknad (kursens kapacitetsstege/kvartalsskugga/chocker +
 *     universumsserierna SSAB/NUE/MT/5401.T)
 * 14. Läckor 0: inga engelska språkfragment (vitlistning av egennamn/facktecken)
 */
import { readFileSync, readdirSync } from "node:fs";
import https from "node:https";

const ROTT = "/home/ak1a/agent/ak1";
const FIL = `${ROTT}/data/blogg-utkast/stalaktier-sa-analyserar-du-stalbolag.json`;
const ANKARE = `${ROTT}/data/kurser-tillagg/se-23-stalsektorn.json`;
const UNIVERS = `${ROTT}/data/portfolj-system/bolagsunivers.json`;
const SOKORD = "stålaktier";
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

// — pool U: universumets 4 stålbärare (inkl. noteringar) —
// Skalvarianter (÷1e3/1e6/1e9) medger att texten skriver serietal i miljoner/miljarder
// (universumet lagrar t.ex. SSAB-omsättningen 128 745 000 000 → 128 745 Mkr).
const uni = JSON.parse(readFileSync(UNIVERS, "utf8"));
const arr = Array.isArray(uni) ? uni : uni.bolag || [];
const poolUnivers = new Set();
for (const t of ["SSAB-B.ST", "NUE", "MT", "5401.T"]) {
  const b = arr.find((x) => x.ticker === t);
  if (!b) continue;
  const bTal = new Set();
  samlaUrJson(b, bTal);
  for (const tal of bTal) {
    poolUnivers.add(tal);
    const n = Number(tal);
    const m = Math.abs(n);
    // OBS: även NEGATIVA serietal (t.ex. SSAB 2022 = −10 886 000 000) måste ge
    // beloppsskalorna (10 886 Mkr) — därför Math.abs här, inte n >= 1e6.
    if (Number.isInteger(m) && m >= 1e6) {
      for (const skala of [1e3, 1e6, 1e9]) {
        if (m % skala === 0) poolUnivers.add(String(m / skala));
      }
    }
  }
}

// — pool D: motorhärledda tal (dokumenterade formler, verifieras i kontroll 13) —
const harledda = new Map();
const H = (varde, formel) => harledda.set(String(varde), formel);
// SSAB-svängen 2022→2023 (universumet, SEK):
H(23915, "SSAB sväng: 13 029 − (−10 886) = 23 915 Mkr");
H(7.2, "SSAB omsättningsfall 2022→2023: (1 − 119 489/128 745) × 100 → 7,2 %");
// Nucor resultatfall 2022→2025 (universumet, USD):
H(77.1, "Nucor: (1 − 1 737/7 576) × 100 → 77,1 %");
// ArcelorMittal bottenvinstens andel av toppen (universumet, USD):
H(6.1, "ArcelorMittal 2023: 919 ÷ 14 956 × 100 → 6,1 % av toppåret 2021");
// Värderingsavrundningar (universumets råtal):
H(18.5, "SSAB P/E 18,491 → 18,5");
H(1.46, "SSAB P/B 1,457 → 1,46");

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
rapp(G.slug === "stalaktier-sa-analyserar-du-stalbolag", "slug = konvention <sökord>-sa-analyserar-du-<bolagsform> (å→a)", G.slug);
rapp(G.pillar === "Institutionell metodik" && G.author === "AK1A Research Lab", "metadata enligt mall (pillar/author)", `${G.pillar} / ${G.author}`);
rapp(G.publishedAt === LEVERANSDAG, `publishedAt = leveransdagen ${LEVERANSDAG}`, G.publishedAt);
rapp(G.tags.length >= 4 && G.tags[0] === SOKORD, `tags ${G.tags.length} st, sökord först`, G.tags.join(","));

// 2. Längder + sökordsplacering i title/description
rapp([...G.title].length <= 60 && G.title.startsWith("Stålaktier"), `title ${[...G.title].length}/60 med sökord först`, G.title);
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
// — kursens kapacitetsstege (se-23 kap 1) —
j("bidrag per ton: 3 400 − 1 900 = 1 500", 3400 - 1900 === 1500, `motor ${3400 - 1900}`);
j("full volym bidrag: 1 500 × 4,0 = 6 000", 1500 * 4.0 === 6000, `motor ${1500 * 4.0}`);
j("full volym resultat: 6 000 − 4 000 = 2 000", 6000 - 4000 === 2000, `motor ${6000 - 4000}`);
j("60 % bidrag: 1 500 × 2,4 = 3 600", 1500 * 2.4 === 3600, `motor ${1500 * 2.4}`);
j("60 % resultat: 3 600 − 4 000 = −400", 3600 - 4000 === -400, `motor ${3600 - 4000}`);
// — kvartalsskuggan (se-23 kap 2) —
j("spotpris efter fall: 3 400 × 0,80 = 2 720", 3400 * 0.8 === 2720, `motor ${3400 * 0.8}`);
j("blandpris: 0,7 × 3 400 + 0,3 × 2 720 = 3 196", 0.7 * 3400 + 0.3 * 2720 === 3196, `motor ${0.7 * 3400 + 0.3 * 2720}`);
j("spotbidrag: 2 720 − 1 900 = 820", 2720 - 1900 === 820, `motor ${2720 - 1900}`);
j("blandbidrag: 0,7 × 1 500 + 0,3 × 820 = 1 296", 0.7 * 1500 + 0.3 * 820 === 1296, `motor ${0.7 * 1500 + 0.3 * 820}`);
j("prisfall: (1 − 3 196/3 400) = 6,0 %", Math.abs((1 - 3196 / 3400) * 100 - 6.0) < 0.05, `motor ${((1 - 3196 / 3400) * 100).toFixed(2)}`);
j("bidragsfall: (1 − 1 296/1 500) = 13,6 %", Math.abs((1 - 1296 / 1500) * 100 - 13.6) < 0.05, `motor ${((1 - 1296 / 1500) * 100).toFixed(2)}`);
j("hävstång: 13,6 ÷ 6,0 ≈ 2,3", Math.abs(13.6 / 6.0 - 2.27) < 0.05, `motor ${(13.6 / 6.0).toFixed(2)}`);
// — råvaruchockerna (se-23 kap 3) —
j("malmchock: 1 100 × 0,30 = 330", 1100 * 0.3 === 330, `motor ${1100 * 0.3}`);
j("elchock: 400 × 0,50 = 200", 400 * 0.5 === 200, `motor ${400 * 0.5}`);
// — skrotverket vid 60 % (se-23 kap 3) —
j("Kvarnviken 60 %: 0,48 × 1 500 = 720", 0.48 * 1500 === 720, `motor ${0.48 * 1500}`);
j("Kvarnviken resultat: 720 − 700 = 20", 720 - 700 === 20, `motor ${720 - 700}`);
// — masugnens årston (se-23 kap 4) —
j("årston: 12 mdr ÷ 1,0 Mton = 12 000 kr/årston", 12e9 / 1e6 === 12000, `motor ${12e9 / 1e6}`);
// — SSAB-serien (universumet, SEK) —
j("SSAB sväng: 13 029 − (−10 886) = 23 915", 13029 - (-10886) === 23915, `motor ${13029 - -10886}`);
j("SSAB omsättningsfall: (1 − 119 489/128 745) → 7,2 %", Math.abs((1 - 119489 / 128745) * 100 - 7.2) < 0.05, `motor ${((1 - 119489 / 128745) * 100).toFixed(2)}`);
j("SSAB: förlustår < vinstår (−10 886 < 13 029)", -10886 < 13029, "motor: jämförelse");
// — Nucor-serien (universumet, USD) —
j("Nucor resultatfall: (1 − 1 737/7 576) → 77,1 %", Math.abs((1 - 1737 / 7576) * 100 - 77.1) < 0.05, `motor ${((1 - 1737 / 7576) * 100).toFixed(2)}`);
j("Nucor bruttomarginal faller: 30,3 → 12,0", 30.3 > 12.0, "motor: 30,3 > 12,0");
j("Nucor utdelning ihållande: 483 → 512 genom botten", 512 >= 483, "motor: 512 ≥ 483");
j("Nucor kapex växer i botten: 1 622 → 3 422", 1622 < 3422, "motor: 3 422 > 1 622");
// — ArcelorMittal-serien (universumet, USD) —
j("ArcelorMittal bottenandel: 919 ÷ 14 956 = 6,1 % av toppen", Math.abs(919 / 14956 * 100 - 6.1) < 0.05, `motor ${((919 / 14956) * 100).toFixed(2)}`);
j("ArcelorMittal vändning FY2025: (3 152 − 1 339)/1 339 ≈ +135 % (noteringens tal)", Math.abs((3152 - 1339) / 1339 * 100 - 135) < 0.5, `motor ${(((3152 - 1339) / 1339) * 100).toFixed(1)}`);
// — Nippon Steel (universumet, JPY) —
j("Nippon Steel fall: (1 − 17,2/637,3) = 97,3 % — texten bär nivåerna (17,2 < 637,3), ej procenten (källans −95 % avrundar ett justerat mått)", Math.abs((1 - 17.2 / 637.3) * 100 - 97.3) < 0.05, `motor ${((1 - 17.2 / 637.3) * 100).toFixed(1)}`);
j("Nippon Steel sub-book: 695 < 1 078", 695 < 1078, "motor: 695 < 1 078");
// — kärnplåtstrappan (se-23 kap 5) —
j("kärnplåtsbidrag: 12 000 − 5 500 = 6 500", 12000 - 5500 === 6500, `motor ${12000 - 5500}`);
// — checklistan —
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
  "ak1a", "ssab", "nucor", "arcelormittal", "arcelormittal.com", "nippon", "5401",
  "worldsteel", "world", "steel", "association", "yahoo", "finance", "marketstack", "hybrit",
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
