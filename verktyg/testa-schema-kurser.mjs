#!/usr/bin/env node
/**
 * VÅG 99 G1 — SCHEMA-VALIDERING: KURSSIDORNA × 3 SPRÅK.
 *
 * Kör mot BYGGD, SERVAD HTML (minst 5 kurser × 3 språk = 15 sidor):
 *
 *   npm run build && npm run start
 *   node verktyg/testa-schema-kurser.mjs            # http://localhost:3000
 *   AK1A_TEST_URL=http://localhost:3100 node verktyg/testa-schema-kurser.mjs
 *
 * Kurssidorna är ISR (revalidate 3600); /en|/ar-spegeln dessutom on-demand
 * (generateStaticParams ⇒ []) — därför HTTP mot en körande produktionsserver
 * (mönstret från ISR-uppvärmaren, våg 98 F1), inte råa .next-filer.
 *
 * KONTROLLER (A3-blockets krav — Googles rika resultat-regler):
 *   A. ALLA <script type="application/ld+json"> på sidan parsar som JSON.
 *   B. Exakt EN Course + EN FAQPage + EN BreadcrumbList per sida (inga
 *      dubbletter = inga motstridiga signaler till Google).
 *   C. Course Pflichtfält: name/description/provider(.name+.url)/
 *      educationalLevel/timeRequired(ISO-8601 PT{n}M)/inLanguage/teaches/
 *      hasCourseInstance.courseMode="online"/url/about — inga tomma värden.
 *   D. ÄRLIGHET: Fas 1-kurser (kraverFas=0) ⇒ isAccessibleForFree=true;
 *      Fas 2/3-kurser ⇒ fältet UTANFÖRLÄMNAS. offers och numberOfCredits
 *      förekommer ALDRIG med NÅGOT värden (inga påhittade priser).
 *   E. FAQPage: 3–4 par, inga tomma frågor/svar; sv-sidorna stäms mot
 *      kursdatan (learn/why/kapitel·minuter·nivå/fas-svar) — påhittade
 *      svar failar; inga rådfraser ("köp aktien" m.m. ×3 språk).
 *   F. BreadcrumbList: exakt 4 nivåer (Startsida > Kurser > {kategori} >
 *      {titel}) med korrekt spegel-prefix i varje item-URL.
 *
 * Förväntade värden läses ur public/deep-courses.json; fas-tillhörighet ur
 * src/lib/kurs-access.ts (slug-listorna extraheras ur källtexten — nod kan
 * inte importera TS, och dubbelregister vore drift).
 *
 * Avslutskod: 0 OM OCH ENDAST OM 0 FAIL. Annars 1.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASURL = process.env.AK1A_TEST_URL ?? "http://localhost:3000";
const SITE_URL = "https://lab.ak1nvestor.com";
const SPRAK = [
  { lang: "sv", prefix: "", inLanguage: "sv-SE" },
  { lang: "en", prefix: "/en", inLanguage: "en" },
  { lang: "ar", prefix: "/ar", inLanguage: "ar" },
];

/** Hämta kurserna + fas-registret (ur källtexten — se filhuvudet). */
function lasForvantat() {
  const kurser = JSON.parse(readFileSync(path.join(REPO, "public", "deep-courses.json"), "utf8"));
  const kallkod = readFileSync(path.join(REPO, "src", "lib", "kurs-access.ts"), "utf8");
  // Extrahera slug-listorna ur källtexten — varje Set slutar med "]);".
  const setBlock = (startMark) => {
    const fran = kallkod.indexOf(startMark);
    if (fran < 0) return "";
    const till = kallkod.indexOf("]);", fran);
    return kallkod.slice(fran, till < 0 ? undefined : till);
  };
  const slugsUr = (txt) => new Set((txt.match(/"([^"]+)"/g) ?? []).map((s) => s.slice(1, -1)));
  const fas2 = slugsUr(setBlock("FAS2_KURSER"));
  const fas3 = slugsUr(setBlock("FAS3_KURSER"));
  const kraverFas = (slug) => (fas3.has(slug) ? 3 : fas2.has(slug) ? 2 : 0);
  return { kurser, kraverFas };
}

/**
 * Kursurval (≥ 5, deterministiskt): fasta representanter — Fas 1-variabel,
 * Fas 2-mästerverk, Fas 3-ekosystem + psykologi, BOKMASTER med nivån "Alla"
 * och en Avancerad AKM1-variabel — med datadriven påfyllning om en slug
 * bytt namn. OBS: alla 42 Fas 2/3-kurser har TOM nivå i data (BOKMASTER) —
 * urvalet täcker därmed BÅDA educationalLevel-grenarna (med/utan nivå).
 */
function valKurser(kurser) {
  const onskade = [
    "v01-forsaljningstillvaxt", // Fas 1 · Nybörjare · TILLVÄXT (nivå med)
    "v15-natverkseffekter", // Fas 1 · Avancerad · MOAT (nivå med)
    "security-analysis", // Fas 2 · värderingsbibeln (nivå tom ⇒ fältet borta)
    "elliott-wave-principle", // Fas 3 · teknisk analys (nivå tom)
    "the-intelligent-investor", // Fas 1 · BOKMASTER · nivå "Alla"
    "trading-in-the-zone", // Fas 3 · psykologi (nivå tom)
  ].filter((s) => kurser[s]);
  if (onskade.length >= 5) return onskade;
  const sorterade = Object.keys(kurser).sort();
  for (const slug of sorterade) {
    if (onskade.length >= 5) break;
    if (!onskade.includes(slug)) onskade.push(slug);
  }
  return onskade;
}

async function hamtaSida(url) {
  const svar = await fetch(url, { headers: { "user-agent": "ak1a-schema-kurser-test/1" }, signal: AbortSignal.timeout(20_000) });
  if (!svar.ok) throw new Error(`HTTP ${svar.status}`);
  return svar.text();
}

/** Alla JSON-LD-block på sidan — kastar på första oparsbara blocket (kontroll A). */
function allaJsonLd(html, fel) {
  const block = [];
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      block.push(JSON.parse(m[1]));
    } catch {
      fel.push(`A: oparsbart JSON-LD-block (${m[1].slice(0, 60)}…)`);
    }
  }
  return block;
}

function arTyp(obj, typ) {
  return (
    obj &&
    typeof obj === "object" &&
    (obj["@type"] === typ ||
      (Array.isArray(obj["@type"]) && obj["@type"].includes(typ)))
  );
}

/** Rådsfraser som ALDRIG får finnas i FAQ-svar (KVD ×3 språk). */
const RADSFRASER = [
  "köp aktien",
  "sälj aktien",
  "rekommenderar att du investerar",
  "buy the stock",
  "sell the stock",
  "you should invest in",
  "اشترِ السهم",
  "بِع السهم",
];

function valideraSida({ slug, lang, prefix, inLanguage }, kurs, kraverFas, fel, pass) {
  const fas = kraverFas(slug);
  const ok = (villkor, namn) => {
    if (villkor) pass.push(`${slug}(${lang}) · ${namn}`);
    else fel.push(`${slug}(${lang}) · FEL: ${namn}`);
  };
  const url = `${BASURL}${prefix}/kurser/${slug}`;
  return hamtaSida(url)
    .then((html) => {
      const block = allaJsonLd(html, fel);
      const course = block.filter((b) => arTyp(b, "Course"));
      const faq = block.filter((b) => arTyp(b, "FAQPage"));
      const brd = block.filter((b) => arTyp(b, "BreadcrumbList"));

      // B — exakt en av varje
      ok(course.length === 1, `B: exakt en Course (${course.length})`);
      ok(faq.length === 1, `B: exakt en FAQPage (${faq.length})`);
      ok(brd.length === 1, `B: exakt en BreadcrumbList (${brd.length})`);
      if (course.length !== 1 || faq.length !== 1 || brd.length !== 1) return;

      // C + D — Course
      const c = course[0];
      ok(typeof c.name === "string" && c.name.includes(kurs.slug.toUpperCase()), "C: name bär kurs-SLUG");
      ok(typeof c.description === "string" && c.description.trim().length > 0, "C: description icke-tom");
      ok(
        c.provider && typeof c.provider.name === "string" && c.provider.name.length > 0 &&
          typeof c.provider.url === "string" && c.provider.url.startsWith("https://"),
        "C: provider (namn+url)"
      );
      // Nivå är ÄRLIG: data-nivå med ⇒ icke-tom sträng; tom nivå (alla 42
      // Fas 2/3-kurser + 63 BOKMASTER) ⇒ fältet UTANFÖRLÄMNAS — aldrig tomt.
      const nivaFinns = Boolean((kurs.level ?? "").trim());
      ok(
        nivaFinns
          ? typeof c.educationalLevel === "string" && c.educationalLevel.trim().length > 0
          : !("educationalLevel" in c),
        nivaFinns ? "C: educationalLevel icke-tom" : "C: educationalLevel ärligt borta (tom nivå i data)"
      );
      ok(typeof c.timeRequired === "string" && /^PT\d+M$/.test(c.timeRequired), `C: timeRequired ISO-8601 (${c.timeRequired})`);
      ok(c.inLanguage === inLanguage, `C: inLanguage=${inLanguage} (${c.inLanguage})`);
      ok(typeof c.teaches === "string" && c.teaches.trim().length > 0, "C: teaches");
      ok(
        c.hasCourseInstance && c.hasCourseInstance.courseMode === "online",
        "C: courseMode=online"
      );
      ok(typeof c.url === "string" && c.url === `${SITE_URL}${prefix}/kurser/${slug}`, "C: kurs-URL med rätt prefix");
      ok(c.about && typeof c.about.name === "string" && c.about.name.trim().length > 0, "C: about (kategori)");
      ok(
        fas === 0 ? c.isAccessibleForFree === true : !("isAccessibleForFree" in c),
        `D: isAccessibleForFree ärlig per fas ${fas}`
      );
      ok(!("offers" in c), "D: offers ALDRIG med (inga påhittade priser)");
      ok(!("numberOfCredits" in c), "D: numberOfCredits ALDRIG med");

      // E — FAQPage
      const par = Array.isArray(faq[0].mainEntity) ? faq[0].mainEntity : [];
      ok(par.length >= 3 && par.length <= 4, `E: 3–4 par (${par.length})`);
      ok(
        par.every(
          (p) =>
            typeof p.name === "string" && p.name.trim().length > 0 &&
            p.acceptedAnswer && typeof p.acceptedAnswer.text === "string" &&
            p.acceptedAnswer.text.trim().length > 0,
        ),
        "E: inga tomma frågor/svar"
      );
      ok(
        !par.some((p) => RADSFRASER.some((fras) => (p.acceptedAnswer?.text ?? "").toLowerCase().includes(fras))),
        "E: inga rådfraser i svaren"
      );
      if (lang === "sv") {
        // Stäms mot kursdatan — svaren ska vara GENERERADE ur innehållet.
        ok(par[0].acceptedAnswer.text === (kurs.learn ?? "").trim(), "E(sv): svar 1 = kursens learn");
        ok(
          new RegExp(`^${kurs.chapters.length} kapitel · ${kurs.totalMinutes || kurs.minutes} minuter( · nivå: .+)?$`).test(
            par[1].acceptedAnswer.text,
          ),
          `E(sv): svar 2 = kapitel·minuter·nivå ("${par[1].acceptedAnswer.text}")`
        );
        if (par.length === 4) {
          ok(par[2].acceptedAnswer.text === (kurs.why ?? "").trim(), "E(sv): svar 3 = kursens why");
        } else {
          ok((kurs.why ?? "").trim() === "", "E(sv): 3 par endast när why saknas");
        }
        const gratisSvar = par[par.length - 1].acceptedAnswer.text;
        ok(
          fas === 0 ? gratisSvar.startsWith("Ja") : /Fas 2|Fas 3/.test(gratisSvar),
          `E(sv): gratis-svar för fas ${fas}`
        );
      }

      // F — BreadcrumbList: 4 nivåer
      const items = Array.isArray(brd[0].itemListElement) ? brd[0].itemListElement : [];
      ok(items.length === 4, `F: 4 nivåer (${items.length})`);
      if (items.length === 4) {
        ok(
          items.every((it, i) => it.position === i + 1 && typeof it.name === "string" && it.name.trim().length > 0 && typeof it.item === "string" && it.item.startsWith(SITE_URL)),
          "F: position 1–4 + namn + absoluta URL:er"
        );
        ok(items[1].item === `${SITE_URL}${prefix}/kurser`, "F: nivå 2 = kurssidan med prefix");
        ok(items[3].item === `${SITE_URL}${prefix}/kurser/${slug}`, "F: nivå 4 = kursen med prefix");
        if (lang === "sv") ok(items[3].name === kurs.title, "F(sv): nivå 4 = kursens titel");
      }
    })
    .catch((e) => fel.push(`${slug}(${lang}) · FEL: sidan kunde inte hämtas (${url}): ${e.message}`));
}

// ── HUVUD ────────────────────────────────────────────────────────────────────

const { kurser, kraverFas } = lasForvantat();
const sluglar = valKurser(kurser);
const fel = [];
const pass = [];

console.log(`SCHEMA-KURSER (VÅG 99 G1) — ${sluglar.length} kurser × 3 språk mot ${BASURL}`);
console.log(`Kurser: ${sluglar.join(", ")}`);
console.log("");

await Promise.all(
  sluglar.flatMap((slug) =>
    SPRAK.map((s) => valideraSida({ slug, ...s }, kurser[slug], kraverFas, fel, pass)),
  ),
);

// RADRAPPORT
const antalSidor = sluglar.length * SPRAK.length;
console.log("── RADRAPPORT ──────────────────────────────────────────────");
console.log(`Sidor testade     : ${antalSidor} (${sluglar.length} kurser × 3 språk)`);
console.log(`Kontroller PASS   : ${pass.length}`);
console.log(`Kontroller FAIL   : ${fel.length}`);
if (fel.length > 0) {
  console.log("");
  console.log("FEL (alla):");
  for (const f of fel) console.log(`  ✗ ${f}`);
}
console.log("───────────────────────────────────────────────────────────");
console.log(fel.length === 0 ? `RESULTAT: GODKÄNT — ${pass.length} kontroller gröna, 0 fel.` : "RESULTAT: UNDERKÄNT.");
process.exit(fel.length === 0 ? 0 : 1);
