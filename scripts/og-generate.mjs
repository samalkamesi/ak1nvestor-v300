#!/usr/bin/env node
/**
 * OG-BILDGENERATOR (VÅG 1a — MARKNADS-BESLUT "husets största enskilda
 * marknadsmiss"): 1200×630-PNG per sidtyp till public/og/.
 *
 * Piplin: satori (JSX-liknande objekt → SVG, text as glyf-paths → inga
 * systemtypsnitt krövs, helt deterministiskt) + sharp (SVG → PNG).
 *
 * Mallar:
 *   start.png              — märket: marin + guldsignatur + tagline + skulptur
 *   default.png            — typografisk fallback (alla sidor utan egen mall)
 *   kurs.png               — kursöversikten "Kursbiblioteket — 333 kurser"
 *   kurser/[slug].png      — EN per kurs (titel ur public/deep-courses.json)
 *   blogg.png              — bloggöversikten
 *   blogg/[slug].png       — EN per bloggpost (titel + beskrivning)
 *   analys.png             — analysöversikten
 *   analys/[ticker].png    — EN per analys (bolag + ticker + QR till URL:en)
 *
 * QR-koden (analysmallen) kommer ur src/lib/qr.ts — samma kodare som
 * DelaKortet; node ≥22 läser .ts-filen direkt (type stripping).
 *
 * Körning:
 *   node scripts/og-generate.mjs            — genererar + validerar allt
 *   node scripts/og-generate.mjs snabb      — endast översikter + 1 per grupp
 *   node scripts/og-generate.mjs --check    — endast validering (skriver ej)
 *
 * DETERMINISM (AC3): inga tidsstämplar, inget slump, sorterad iteration —
 * två körningar ger bitidentiska PNG:er. Tal (333, 27) läses ur
 * data/siffror.json + public/deep-courses.json — aldrig hårdkodade (P7).
 * Tagline/copy: DelaKort-DNA tills VÅG 2:s data/varumarke.json finns.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import satori from "satori";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OG = path.join(ROOT, "public", "og");
const SNABB = process.argv.includes("snabb");
const ENKONTROLL = process.argv.includes("--check");

// ── Varumärkes-DNA (globals.css: --djup-marin/--gold-soft/crème) ────────────
const BREDD = 1200;
const HOJD = 630;
const MARIN = "#0E1B2E";
const MARIN_MORKARE = "#081120";
const GULD = "#E8C766";
const CREME = "#EDE6D6";
const VIT = "#FFFDF7";
// Samsa med SITE_URL i src/lib/seo.tsx (og:image ska vara kanonisk).
const SITE_URL = "https://lab.ak1nvestor.com";
// Tagline = root-layoutens OG-beskrivning (VÅG 2 flyttar copy → varumarke.json).
const TAGLINE = "Djupare än en blogg. Tydligare än en bank. Snabbare än en utbildning.";
const DISCLAIMER = "Pedagogisk analys — inte investeringsråd";

// ── Typsnitt (scripts/fonts/, OFL: Source Serif 4 + Inter — sajtens serif/sans) ──
const lasTypsnitt = (fil) => readFileSync(path.join(__dirname, "fonts", fil));
const TYPOSNITT = [
  { name: "Source Serif 4", data: lasTypsnitt("source-serif-4-400.ttf"), weight: 400, style: "normal" },
  { name: "Source Serif 4", data: lasTypsnitt("source-serif-4-600.ttf"), weight: 600, style: "normal" },
  { name: "Source Serif 4", data: lasTypsnitt("source-serif-4-700.ttf"), weight: 700, style: "normal" },
  { name: "Inter", data: lasTypsnitt("inter-400.ttf"), weight: 400, style: "normal" },
  { name: "Inter", data: lasTypsnitt("inter-600.ttf"), weight: 600, style: "normal" },
];
const SERIF = "Source Serif 4, Georgia, serif";
const SANS = "Inter, system-ui, sans-serif";

// ── QR ur src/lib/qr.ts (ren TS; node ≥22 läser direkt, annars med attribut) ──
let qrMatris;
try {
  ({ qrMatris } = await import("../src/lib/qr.ts"));
} catch {
  ({ qrMatris } = await import("../src/lib/qr.ts", { with: { type: "typescript" } }));
}

// ── Datakällor (samma som src/lib/content.ts + seo-generate.mjs) ─────────────
const kurserAlla = Object.entries(JSON.parse(readFileSync(path.join(ROOT, "public", "deep-courses.json"), "utf8"))).sort(([a], [b]) => a.localeCompare(b));
const bloggFiler = existsSync(path.join(ROOT, "data", "blogg"))
  ? readdirSync(path.join(ROOT, "data", "blogg")).filter((f) => f.endsWith(".json")).sort()
  : [];
const analyser = (() => {
  const dirs = [path.join(ROOT, "data", "analyses"), path.join(ROOT, "data", "export", "analyses")];
  const seda = new Set();
  const lista = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).sort()) {
      if (!f.endsWith(".json")) continue;
      const a = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
      if (a?.ticker && !seda.has(a.ticker)) {
        seda.add(a.ticker);
        lista.push(a);
      }
    }
  }
  return lista.sort((a, b) => String(a.ticker).localeCompare(String(b.ticker)));
})();
const SIFFROR = JSON.parse(readFileSync(path.join(ROOT, "data", "siffror.json"), "utf8"));
const ANTAL_KURSER = SIFFROR.kurser; // 333 — P7: ur guldkällan, aldrig hårdkodad
const ANTAL_OMRADEN = new Set(kurserAlla.map(([, c]) => c.category)).size;

// ── Hjälpare ─────────────────────────────────────────────────────────────────
function clamp(s, max) {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/[\s,.;:-]+\S*$/, "") + "…";
}
const tal = (n) => n.toLocaleString("sv-SE");

/** Rubrikstorlek efter längd — deterministisk trappa (2-raders utrymme). */
function rubrikPx(len) {
  if (len <= 28) return 76;
  if (len <= 46) return 64;
  if (len <= 70) return 54;
  return 46;
}

/** Satori-element (objekt i stället för JSX — .mjs, ingen transpilering). */
const el = (type, style, children) => ({ type, props: { style, ...(children !== undefined ? { children } : {}) } });

/** QR-kort: vit ruta + modulrutnät (mörk modul = marin) + skan-text. */
function qrKort(url, modulPx = 5) {
  const m = qrMatris(url);
  if (!m) throw new Error(`QR ryms inte (version 1–6): ${url}`);
  const rutnät = el(
    "div",
    { display: "flex", flexDirection: "column", width: m.length * modulPx, height: m.length * modulPx },
    m.map((rad) =>
      el(
        "div",
        { display: "flex", flexDirection: "row" },
        rad.map((mörk) => el("div", { width: modulPx, height: modulPx, backgroundColor: mörk ? MARIN : "transparent" }))
      )
    )
  );
  return el(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: VIT,
      borderRadius: 16,
      padding: 22,
      flexShrink: 0,
    },
    [
      rutnät,
      el("div", { fontFamily: SANS, fontSize: 13, fontWeight: 600, color: MARIN, letterSpacing: 0.4 }, "Skanna för analysen"),
    ]
  );
}

/** Gemensam ram: marin gradient + guld-eyebrow + innehåll + sidfotsrad. */
function ram({ eyebrow, innehall, hoger = null, utanEyebrow = false }) {
  const eyebrowRad = utanEyebrow
    ? null
    : el("div", { display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }, [
        el("div", { width: 36, height: 4, backgroundColor: GULD }),
        el("div", { fontFamily: SANS, fontSize: 19, fontWeight: 600, color: GULD, letterSpacing: 5 }, eyebrow.toUpperCase()),
      ]);
  const mitt = el(
    "div",
    { display: "flex", alignItems: "center", flex: 1, width: "100%", gap: 48 },
    hoger
      ? [el("div", { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }, innehall), hoger]
      : [el("div", { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }, innehall)]
  );
  const sidfot = el(
    "div",
    { display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, borderTop: "1px solid rgba(232,199,102,0.28)", paddingTop: 20 },
    [
      el("div", { fontFamily: SANS, fontSize: 17, fontWeight: 600, color: GULD, letterSpacing: 1 }, "lab.ak1nvestor.com"),
      el("div", { fontFamily: SANS, fontSize: 15, color: CREME, opacity: 0.72 }, DISCLAIMER),
    ]
  );
  return el(
    "div",
    {
      width: BREDD,
      height: HOJD,
      display: "flex",
      flexDirection: "column",
      padding: "52px 64px 40px 64px",
      backgroundImage: `linear-gradient(160deg, ${MARIN} 0%, ${MARIN_MORKARE} 100%)`,
      color: CREME,
      fontFamily: SERIF,
    },
    [eyebrowRad, mitt, sidfot].filter(Boolean)
  );
}

/** Skulptur-logotyp (public/ak1a/logo/skulptur-utan-bakgrund.png, 640×640)
 *  som inbäddad data-URI — satori hämtar aldrig externa filer. */
function skulptur(px) {
  const b64 = readFileSync(path.join(ROOT, "public", "ak1a", "logo", "skulptur-utan-bakgrund.png")).toString("base64");
  return { type: "img", props: { src: `data:image/png;base64,${b64}`, width: px, height: px, style: { flexShrink: 0 } } };
}

// ── Mallarnas innehåll ───────────────────────────────────────────────────────
const mallar = {
  start: () =>
    ram({
      eyebrow: "Institutionell aktieanalysutbildning",
      hoger: skulptur(470),
      innehall: [
        el("div", { fontFamily: SERIF, fontSize: 148, fontWeight: 700, color: CREME, lineHeight: 1.0 }, "AK1A"),
        el("div", { fontFamily: SANS, fontSize: 29, fontWeight: 600, color: GULD, letterSpacing: 13 }, "RESEARCH LAB"),
        el("div", { fontFamily: SERIF, fontSize: 29, color: CREME, lineHeight: 1.35, marginTop: 26, maxWidth: 560 }, TAGLINE),
      ],
    }),
  default: () =>
    ram({
      eyebrow: "AK1A Research Lab",
      innehall: [
        el("div", { fontFamily: SERIF, fontSize: 66, fontWeight: 700, color: CREME, lineHeight: 1.15, maxWidth: 940 }, "Institutionell aktieanalysutbildning"),
        el("div", { fontFamily: SERIF, fontSize: 30, color: CREME, opacity: 0.9, lineHeight: 1.35, marginTop: 24, maxWidth: 880 }, TAGLINE),
        el("div", { fontFamily: SANS, fontSize: 19, color: GULD, letterSpacing: 2, marginTop: 24 }, "BYGGD FÖR PRIVATPERSONER · KOSTNADSFRI GRUNDUTBILDNING"),
      ],
    }),
  kurs: () =>
    ram({
      eyebrow: "Kursbiblioteket",
      innehall: [
        el("div", { fontFamily: SERIF, fontSize: 112, fontWeight: 700, color: GULD, lineHeight: 1.0 }, `${tal(ANTAL_KURSER)} kurser`),
        el("div", { fontFamily: SERIF, fontSize: 30, color: CREME, opacity: 0.92, lineHeight: 1.35, marginTop: 22 }, `i ${ANTAL_OMRADEN} ämnesområden — Fas 1 kostnadsfritt, för alltid`),
      ],
    }),
  blogg: () =>
    ram({
      eyebrow: "Blogg",
      innehall: [
        el("div", { fontFamily: SERIF, fontSize: 82, fontWeight: 700, color: CREME, lineHeight: 1.1 }, "Pedagogisk finansanalys"),
        el("div", { fontFamily: SERIF, fontSize: 29, color: CREME, opacity: 0.9, lineHeight: 1.35, marginTop: 22, maxWidth: 880 }, "Fördjupningsartiklar om aktieanalys, risk och metodik"),
      ],
    }),
  analys: () =>
    ram({
      eyebrow: "Aktieanalyser",
      innehall: [
        el("div", { fontFamily: SERIF, fontSize: 78, fontWeight: 700, color: CREME, lineHeight: 1.1 }, "Institutionella aktieanalyser"),
        el("div", { fontFamily: SERIF, fontSize: 28, color: GULD, lineHeight: 1.35, marginTop: 22 }, "AKM1 · 20 variabler · scenarier · vågmatris"),
      ],
    }),
};

function kursSida(slug, c) {
  const titel = clamp(c.title, 70);
  return ram({
    eyebrow: `Kurs ${slug.toUpperCase()}`,
    innehall: [
      el("div", { fontFamily: SERIF, fontSize: rubrikPx(titel.length), fontWeight: 700, color: CREME, lineHeight: 1.18, maxWidth: 960 }, titel),
      el("div", { fontFamily: SANS, fontSize: 21, color: GULD, letterSpacing: 3, marginTop: 26 }, `${String(c.category ?? "").toUpperCase()} · ${String(c.level ?? "Intermediär").toUpperCase()}`),
      el("div", { fontFamily: SANS, fontSize: 17, color: CREME, opacity: 0.68, marginTop: 18 }, `AKM1 — Kurs ${slug.toUpperCase()} · AK1A Research Lab`),
    ],
  });
}

function bloggSida(p) {
  const titel = clamp(p.title, 70);
  return ram({
    eyebrow: "Blogg",
    innehall: [
      el("div", { fontFamily: SERIF, fontSize: rubrikPx(titel.length), fontWeight: 700, color: CREME, lineHeight: 1.18, maxWidth: 960 }, titel),
      el("div", { fontFamily: SERIF, fontSize: 23, color: CREME, opacity: 0.82, lineHeight: 1.4, marginTop: 26, maxWidth: 920 }, clamp(p.description, 120)),
    ],
  });
}

/** Analysmall: bolag + ticker + QR till analysens URL (AC: QR → analys-URL).
 *  P2: ingen rekommendation/handelsuppmaning på marknadsytan — metodik + disclaimer. */
function analysSida(a) {
  const ticker = String(a.displayTicker || a.ticker || "");
  const bolag = clamp(a.company || ticker, 44);
  return ram({
    eyebrow: "Aktieanalys · AKM1",
    hoger: qrKort(`${SITE_URL}/analyser/${encodeURIComponent(a.ticker)}`),
    innehall: [
      el("div", { fontFamily: SERIF, fontSize: rubrikPx(bolag.length), fontWeight: 700, color: CREME, lineHeight: 1.15, maxWidth: 720 }, bolag),
      el("div", { fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: GULD, marginTop: 18 }, ticker),
      el("div", { fontFamily: SERIF, fontSize: 22, color: CREME, opacity: 0.85, lineHeight: 1.4, marginTop: 24, maxWidth: 640 }, "Institutionell genomlysning med AKM1:s 20 variabler, scenarier och vågmatris."),
    ],
  });
}

// ── Rendera + skriv ──────────────────────────────────────────────────────────
async function tillPng(element, fil) {
  const svg = await satori(element, { width: BREDD, height: HOJD, fonts: TYPOSNITT });
  const png = await sharp(Buffer.from(svg), { density: 72 })
    .png({ compressionLevel: 9, palette: true, quality: 92, dither: 1.0 })
    .toBuffer();
  writeFileSync(fil, png);
  return png.length;
}

const grupper = []; // { namn, filer: [{ relativ, element }] }
function laggTill(namn, relativ, element) {
  let g = grupper.find((x) => x.namn === namn);
  if (!g) grupper.push((g = { namn, filer: [] }));
  g.filer.push({ relativ, element });
}

if (!ENKONTROLL) {
  laggTill("märke", "start.png", mallar.start());
  laggTill("märke", "default.png", mallar.default());
  laggTill("översikter", "kurs.png", mallar.kurs());
  laggTill("översikter", "blogg.png", mallar.blogg());
  laggTill("översikter", "analys.png", mallar.analys());

  const kurser = SNABB ? kurserAlla.slice(0, 1) : kurserAlla;
  for (const [slug, c] of kurser) laggTill("kurser", `kurser/${slug}.png`, kursSida(slug, c));
  for (const f of bloggFiler) {
    const p = JSON.parse(readFileSync(path.join(ROOT, "data", "blogg", f), "utf8"));
    laggTill("blogg", `blogg/${p.slug}.png`, bloggSida(p));
    if (SNABB) break;
  }
  for (const a of analyser) {
    // V86 P1 #2: filnamn i gemener med ".st"-suffix — samma normalisering som
    // ogBildForPath/analysOgStam i src/lib/seo.tsx (URL-form "abb-st" ↔ fil
    // "abb.st.png"); rå ticker (ABB.ST) gav skiftläges-404:ar på Linux-prod.
    laggTill("analyser", `analys/${String(a.ticker).toLowerCase().replace(/\.st$/, ".st")}.png`, analysSida(a));
    if (SNABB) break;
  }

  const forvantade = grupper.flatMap((g) => g.filer.map((f) => f.relativ));
  for (const relativ of forvantade) {
    const dest = path.join(OG, relativ);
    mkdirSync(path.dirname(dest), { recursive: true });
  }

  const statistik = [];
  const start = Date.now();
  let i = 0;
  for (const g of grupper) {
    let antal = 0;
    let maxStorlek = 0;
    let maxFil = "";
    for (const f of g.filer) {
      const storlek = await tillPng(f.element, path.join(OG, f.relativ));
      antal++;
      if (storlek > maxStorlek) {
        maxStorlek = storlek;
        maxFil = f.relativ;
      }
      if (storlek > 200 * 1024)
        console.warn(`  ⚠ >200 kB: ${f.relativ} (${(storlek / 1024).toFixed(0)} kB)`);
      if (++i % 50 === 0) console.log(`  … ${i}/${forvantade.length}`);
    }
    statistik.push({ namn: g.namn, antal, maxStorlek, maxFil });
  }

  for (const s of statistik) {
    console.log(
      `✓ ${s.namn}: ${s.antal} bild${s.antal === 1 ? "" : "er"} (störst ${(s.maxStorlek / 1024).toFixed(0)} kB — ${s.maxFil})`
    );
  }
  console.log(`✅ ${forvantade.length} OG-bilder på ${((Date.now() - start) / 1000).toFixed(1)} s → public/og/`);
}

// ── Validering (AC3): ingen bild saknas för existerande slugs ────────────────
const saknas = [];
const kontrollera = (relativ) => {
  const p = path.join(OG, relativ);
  if (!existsSync(p) || statSync(p).size === 0) saknas.push(relativ);
};
kontrollera("start.png");
kontrollera("default.png");
kontrollera("kurs.png");
kontrollera("blogg.png");
kontrollera("analys.png");
for (const [slug] of kurserAlla) kontrollera(`kurser/${slug}.png`);
for (const f of bloggFiler) {
  const p = JSON.parse(readFileSync(path.join(ROOT, "data", "blogg", f), "utf8"));
  kontrollera(`blogg/${p.slug}.png`);
}
for (const a of analyser) kontrollera(`analys/${a.ticker}.png`);

console.log(
  `Kontroll: ${1 + 1 + 3 + kurserAlla.length + bloggFiler.length + analyser.length} förväntade bilder — ${saknas.length} saknas`
);
if (saknas.length > 0) {
  console.error("SAKNAS:\n  " + saknas.slice(0, 20).join("\n  ") + (saknas.length > 20 ? `\n  … och ${saknas.length - 20} till` : ""));
  process.exit(1);
}
