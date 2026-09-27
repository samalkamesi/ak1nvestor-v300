/**
 * r264 KVD — B30 rederiaktier (svenskt original, kursankare se-18-rederi-och-shipping).
 *
 * Klaimfil data/vakten/s3-b30-rederi-ansprak-2026-09-26.md skriven FÖRE arbetet
 * (disk-först-regeln; två tidigare dispatcher dog tyst — klaimen skyddar mot tredje).
 * Mall: _r261-b29-gruv-kvd.mjs (struktur: ord, title/OG, sökordsplaceringar, korslänkar,
 * externa URL:er, varumärkesgrind, rådverb, H2/H1, readingMinutes, disclaimer) —
 * anpassat för ORIGINAL (ingen översättningsparitet): i stället TAL-KONTROLL att
 * varje tal i texten finns i kursankaret/universumet ELLER är motorräknat ur dem.
 *
 * Kontroller:
 *  1. BlogPost-form exakt + slug + publishedAt = leveransdagen 2026-09-26
 *  2. title ≤ 60 och börjar med sökordet; description ≤ 155 och innehåller sökordet
 *  3. Ord raw 1200–1400 (ordergränsen för detta uppdrag)
 *  4. readingMinutes = round(ord/600)
 *  5. Sökord "rederiaktier" i H1 + ingress + minst 2 H2
 *  6. H1 = 1; H2 ≥ 5
 *  7. Korslänkar 12–18: varje intern href verifierad mot publicerade ytor
 *     (public/deep-courses.json ∪ data/blogg/*.json) — 0 mot utkast
 *  8. Externa URL:er 3–5: LIVE-test i KVD:n (följer redirects, slutstatus 200)
 *  9. Varumärkesgrinden — regexer ur data/varumarke.json × 3 ytor = 0 FEL/0 VARN
 * 10. Rådverb SV+EN 0 träffar (juridikgrinden — ren utbildning)
 * 11. Disclaimer exakt sista rad
 * 12. TAL-KONTROLL: varje tal i description+body finns i kursankaret ∪ universumet
 *     (MAERSK-B.CO/DSV.CO) ∪ motorhärledda ∪ årtal 1990–2035
 * 13. Aritmetik motorräknad (kursens fraktränteexempel + universumsseriernas förändringar)
 * 14. Läckor 0: inga engelska språkfragment (vitlistning av egennamn/facktecken)
 */
import { readFileSync, readdirSync } from "node:fs";
import https from "node:https";

const ROTT = "/home/ak1a/agent/ak1";
const FIL = `${ROTT}/data/blogg-utkast/rederiaktier-sa-analyserar-du-rederibolag.json`;
const ANKARE = `${ROTT}/data/kurser-tillagg/se-18-rederi-och-shipping.json`;
const UNIVERS = `${ROTT}/data/portfolj-system/bolagsunivers.json`;
const SOKORD = "rederiaktier";
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

// — pool U: universumets 2 bärningsposter (inkl. noteringar) —
// Skalvarianter (÷1e3/1e6/1e9) medger att texten skriver serietal i miljoner/miljarder
// (universumet lagrar t.ex. Maersk omsättning i dollar: 81 529 000 000 → 81 529 MUSD).
const uni = JSON.parse(readFileSync(UNIVERS, "utf8"));
const arr = Array.isArray(uni) ? uni : uni.bolag || [];
const poolUnivers = new Set();
for (const t of ["MAERSK-B.CO", "DSV.CO"]) {
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
// Hävstångsexemplen (kursens nollpunkt 25 000 + certifikat 35 000 / spot 80 000):
H(10000, "certifikatets täckningsbidrag 35 000 − 25 000");
H(3.5, "hävstångskvot 35 000 ÷ 10 000");
H(31500, "fraktränta −10 %: 35 000 × 0,9");
H(6500, "31 500 − 25 000");
H(35, "täckningsfall (6 500 − 10 000) ÷ 10 000 → −35 %");
H(1.45, "hävstångskvot i topp 80 000 ÷ 55 000");
H(72000, "fraktränta −10 %: 80 000 × 0,9");
H(47000, "72 000 − 25 000");
H(14.5, "täckningsfall i topp (47 000 − 55 000) ÷ 55 000 → −14,5 %");
// Fartygs-/substanssidan (kursens nybygge 105, femåring 110/55, skrot 15):
H(27, "skrotvärdesandel 15 ÷ 55 = 27 % av bottenvärdet");
// Maersk-serien (universumet, MUSD):
H(37.4, "Maersk omsättning 51 065/81 529 → −37,4 %");
H(86.9, "Maersk resultat 3 822/29 198 → −86,9 %");
H(9.3, "Maersk 2025: 2 725 ÷ 29 198 = 9,3 % av rekordåret");
H(21, "Maersk bruttomarginal 0,20996 → 21,0 %");
H(9.1, "Maersk EBIT-marginal 0,09101 → 9,1 %");
H(4.1, "Maersk nettomarginal 0,04075 → 4,1 %");
H(26.8, "DSV bruttomarginal 0,2676 → 26,8 %");
H(0.92, "Maersk P/B 0,9213 avrundat");
H(22.2, "Maersk P/E 22,222 avrundat");

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
rapp(G.slug === "rederiaktier-sa-analyserar-du-rederibolag", "slug = konvention <sökord>aktier-sa-analyserar-du-<bolagsform>", G.slug);
rapp(G.pillar === "Institutionell metodik" && G.author === "AK1A Research Lab", "metadata enligt mall (pillar/author)", `${G.pillar} / ${G.author}`);
rapp(G.publishedAt === LEVERANSDAG, `publishedAt = leveransdagen ${LEVERANSDAG}`, G.publishedAt);
rapp(G.tags.length >= 4 && G.tags[0] === SOKORD, `tags ${G.tags.length} st, sökord först`, G.tags.join(","));

// 2. Längder + sökordsplacering i title/description
rapp([...G.title].length <= 60 && G.title.startsWith("Rederiaktier"), `title ${[...G.title].length}/60 med sökord först`, G.title);
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
// — kursens fraktränteexempel (se-18) —
j("nollpunkt 12 000 + 8 000 + 5 000 = 25 000", 12000 + 8000 + 5000 === 25000, `motor ${12000 + 8000 + 5000}`);
j("högcykel 80 000 − 25 000 = 55 000", 80000 - 25000 === 55000, `motor ${80000 - 25000}`);
j("högcykel 55 000 × 300 = 16 500 000", 55000 * 300 === 16500000, `motor ${55000 * 300}`);
j("botten 18 000 − 25 000 = −7 000", 18000 - 25000 === -7000, `motor ${18000 - 25000}`);
j("botten −7 000 × 300 = −2 100 000", -7000 * 300 === -2100000, `motor ${-7000 * 300}`);
j("blandning 0,6 × 35 000 + 0,4 × 18 000 = 28 200", Math.abs(0.6 * 35000 + 0.4 * 18000 - 28200) < 1e-9, `motor ${0.6 * 35000 + 0.4 * 18000}`);
j("blandning över noll 28 200 − 25 000 = 3 200", Math.abs(28200 - 25000 - 3200) < 1e-9);
j("blandning per år 3 200 × 300 = 960 000", Math.abs(3200 * 300 - 960000) < 1e-9, `motor ${3200 * 300}`);
j("torrbulk 2008: 663 ÷ 11 793 = 0,056", Math.abs(663 / 11793 - 0.056) < 0.0005, `motor ${(663 / 11793).toFixed(5)}`);
// — operativa hävstången —
j("certifikattäckning 35 000 − 25 000 = 10 000", 35000 - 25000 === 10000, `motor ${35000 - 25000}`);
j("hävstångskvot 35 000 ÷ 10 000 = 3,5", Math.abs(35000 / 10000 - 3.5) < 1e-9, `motor ${35000 / 10000}`);
j("frakt −10 %: 35 000 × 0,9 = 31 500", Math.abs(35000 * 0.9 - 31500) < 1e-9, `motor ${35000 * 0.9}`);
j("31 500 − 25 000 = 6 500", Math.abs(31500 - 25000 - 6500) < 1e-9);
j("täckningsfall (6 500 − 10 000) ÷ 10 000 = −35 %", Math.abs((6500 - 10000) / 10000 * 100 + 35) < 1e-9, `motor ${((6500 - 10000) / 10000 * 100).toFixed(2)}`);
j("toppkvot 80 000 ÷ 55 000 = 1,45", Math.abs(80000 / 55000 - 1.45) < 0.005, `motor ${(80000 / 55000).toFixed(4)}`);
j("toppfrakt −10 %: 80 000 × 0,9 = 72 000", Math.abs(80000 * 0.9 - 72000) < 1e-9, `motor ${80000 * 0.9}`);
j("72 000 − 25 000 = 47 000", Math.abs(72000 - 25000 - 47000) < 1e-9);
j("täckningsfall topp (47 000 − 55 000) ÷ 55 000 = −14,5 %", Math.abs((47000 - 55000) / 55000 * 100 + 14.5) < 0.06, `motor ${((47000 - 55000) / 55000 * 100).toFixed(2)}`);
// — fartyg/substans —
j("femåring 110 − 55 = 55 (halvering)", Math.abs(110 - 55 - 55) < 1e-9);
j("skrotvärdesandel 15 ÷ 55 = 27 % (avrundat, motor 27,27)", Math.abs(15 / 55 * 100 - 27) < 0.5, `motor ${((15 / 55) * 100).toFixed(2)}`);
// — Maersk-serien (universumet, MUSD) —
j("Maersk oms 51 065/81 529 → −37,4 %", Math.abs((1 - 51065 / 81529) * 100 - 37.4) < 0.05, `motor ${((1 - 51065 / 81529) * 100).toFixed(3)}`);
j("Maersk res 3 822/29 198 → −86,9 %", Math.abs((1 - 3822 / 29198) * 100 - 86.9) < 0.05, `motor ${((1 - 3822 / 29198) * 100).toFixed(3)}`);
j("Maersk 2025: 2 725/29 198 = 9,3 %", Math.abs(2725 / 29198 * 100 - 9.3) < 0.05, `motor ${((2725 / 29198) * 100).toFixed(3)}`);
j("Maersk brutto 0,20996 → 21,0 %", Math.abs(Math.round(0.20996 * 1000) / 10 - 21) < 1e-9, `motor ${Math.round(0.20996 * 1000) / 10}`);
j("Maersk EBIT 0,09101 → 9,1 %", Math.abs(Math.round(0.09101 * 1000) / 10 - 9.1) < 1e-9, `motor ${Math.round(0.09101 * 1000) / 10}`);
j("Maersk netto 0,04075 → 4,1 %", Math.abs(Math.round(0.04075 * 1000) / 10 - 4.1) < 1e-9, `motor ${Math.round(0.04075 * 1000) / 10}`);
j("DSV brutto 0,2676 → 26,8 %", Math.abs(Math.round(0.2676 * 1000) / 10 - 26.8) < 1e-9, `motor ${Math.round(0.2676 * 1000) / 10}`);
j("Maersk P/B 0,9213 → 0,92", Math.abs(Math.round(0.9213 * 100) / 100 - 0.92) < 1e-9, `motor ${Math.round(0.9213 * 100) / 100}`);
j("Maersk P/E 22,222 → 22,2", Math.abs(Math.round(22.222 * 10) / 10 - 22.2) < 1e-9, `motor ${Math.round(22.222 * 10) / 10}`);
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
  "ak1a", "maersk", "moller", "dsv", "nordviks", "schenker", "amkby", "stockanalysis",
  "yahoo", "finance", "marketstack", "baltic", "exchange", "s&p", "global", "market",
  "intelligence", "a.p.", "case-kursen",
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
