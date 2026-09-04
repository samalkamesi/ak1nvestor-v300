#!/usr/bin/env node
/**
 * AK1A — BLOGGGENERATORN för Analysfabriken (våg 56 bygg-B).
 *
 * Byggplan: data/forskning/STYRELSE-analysbibliotek.md §2.4.
 *
 * Läser de fem svenska toppkandidaterna ur data/forskningsbiblioteket/
 * (land="Sverige", sorterat på rankPoang — §2.1:s formel) och skriver
 * data/blogg/analys-{namn}-{ar}.json i EXAKT det befintliga bloggschemat
 * (slug/title/description/pillar/author/publishedAt/readingMinutes/tags/body).
 *
 * Kroppen är mallbaserad och deterministisk — varje siffra interpoleras ur
 * analys-jsonen (tal ur siffror, aldrig påhittade). getBlogPosts() läser
 * katalogen med fs, så nya filer dyker upp automatiskt på /blogg och i
 * speglarna /en|ar/blogg (översättningsronden tar dem senare).
 *
 * Tvåvägslänk: lasMer.bloggSlug i analys-jsonen uppdateras efter skrivning.
 *
 * JURIDIK (2007:528): forskningsunderlag — inga köp-/sälj-/rekommendera-ord;
 * varje post innehåller meningen "detta är en automatiskt genererad
 * forskningsöversikt; den fullständiga AK1A-analysen tillverkas manuellt".
 *
 * Användning:  node verktyg/kor-analysblogg.mjs [antal]   (default 5)
 * Avslutskod:  0 om minst en post skrevs, 1 annars.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BIBLIOTEK = path.join(REPO, "data", "forskningsbiblioteket");
const BLOGG = path.join(REPO, "data", "blogg");
const ANTAL = Math.max(1, Math.min(10, parseInt(process.argv[2] || "5", 10)));

const AR = new Date().getFullYear();
const PUBLICERAD = new Date().toISOString().slice(0, 10);
const KATEGORI_ETIKETT = {
  tillvaxt: "Tillväxt",
  vardering: "Värdering",
  lonsamhet: "Lönsamhet",
  stabilitet: "Stabilitet",
  moat: "Moat",
  katalysator: "Katalysator",
  risk: "Risk",
};
const DYN_ETIKETT = {
  forbattras: "förbättras",
  stabilt: "stabilt",
  forsvamras: "försvagas",
  osatt: "osatt",
};
const HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"];

function pct(x, decimaler = 1) {
  return (x * 100).toFixed(decimaler).replace(".", ",") + " %";
}
function sv(x) {
  return (x ?? 0).toString().replace(".", ",");
}

/** "AB Industrivärden (publ)" → "Industrivärden"; "NP3 Fastigheter AB (publ)" → "NP3 Fastigheter". */
function kortNamn(namn) {
  return String(namn)
    .replace(/\s*\(publ\)\s*$/i, "")
    .replace(/^\s*AB\s+/i, "")
    .replace(/\s+AB$/i, "")
    .trim();
}

/** svensk slug: "AB Industrivärden" → "industrivarden". */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // åäö → aao
    .replace(/&/g, " och ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function saneraFil(ticker) {
  return ticker.replace(/[^A-Za-z0-9._-]/g, "_").replace(/\./g, "_");
}

// ── Läs biblioteket ─────────────────────────────────────────────────────────
if (!existsSync(BIBLIOTEK)) {
  console.error("data/forskningsbiblioteket/ saknas — kör verktyg/kor-analysfabrik.mjs först.");
  process.exit(1);
}
const alla = readdirSync(BIBLIOTEK)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(path.join(BIBLIOTEK, f), "utf8")))
  .filter((a) => a?.schema === "analysfabrik-v1" && a.ticker && a.namn);

const svenska = alla
  .filter((a) => a.land === "Sverige")
  .sort((x, y) => (y.rankPoang ?? 0) - (x.rankPoang ?? 0))
  .slice(0, ANTAL);

if (svenska.length === 0) {
  console.error("Inga svenska kandidater i biblioteket — kör kor-analysfabrik.mjs.");
  process.exit(1);
}

// ── Kroppsmall (§2.4 — deterministisk, alla siffror ur analys-jsonen) ───────
function byggKropp(a) {
  const kort = kortNamn(a.namn);
  const topp = a.akm1.topp3Motiveringar;
  const rader = [];

  // 1. Ingress — regeln, inte tycket
  rader.push(
    `${kort} (${a.ticker}) finns i [Forskningsbiblioteket](/forskningsbiblioteket) av en enda anledning: bolaget passerade kandidatregeln. Regeln är deterministisk — hårt port mot kassatäckning (V19), datatäckning ${pct(a.urval.datatackning)} mot golvet ${a.urval.status === "gron" ? "60 % (D1:s gröna regel)" : "70 %"} samt ${a.urval.status === "gron" ? `grön status${a.urval.varning ? " — med varningsetiketten \"grön (låg täckning)\" eftersom täckningen ligger under 70 %" : ""}` : `gul status med AKM1 över 65 % av max (${pct(a.akm1.relativ)})`}. Ingen smak, inget tycke: ${sv(a.akm1.totalt)} av ${sv(a.akm1.maxMojligt)} möjliga poäng.`,
  );
  rader.push(
    `Detta är en automatiskt genererad forskningsöversikt; den fullständiga AK1A-analysen tillverkas manuellt.`,
  );

  // 2. AKM1-profilen
  rader.push(`## Så ser AKM1-profilen ut`);
  rader.push(
    `Totalt ${sv(a.akm1.totalt)} av ${sv(a.akm1.maxMojligt)} poäng (${pct(a.akm1.relativ)}). Starkaste kategorin är **${KATEGORI_ETIKETT[a.akm1.starkast] || a.akm1.starkast}**, svagaste **${KATEGORI_ETIKETT[a.akm1.svagast] || a.akm1.svagast}**. ${a.akm1.antalOsatta} av 20 variabler är osatta — underlaget bygger på ${20 - a.akm1.antalOsatta} mätta. De tre starkaste variablerna, med bedömningens motivering ordagrant:`,
  );
  for (const m of topp) {
    rader.push(`- **${m.variabel} ${m.namn} — ${m.poang}/5 p:** ${m.motivering}`);
  }

  // 3. Vågläget
  rader.push(`## Vågläget`);
  const sattaHz = HORIZONTER.filter((h) => a.vaglage.perHorisont[h] !== "osatt");
  if (sattaHz.length === 0) {
    rader.push(
      `Alla fem horisonter (mikro, kort, medellång, lång, mega) är **osatta** — och osatt är osatt: vågmotorn gissar aldrig, den kräver tidsserier som källorna inte levererar ännu. Det enda vågspåret är dynamiken: **${DYN_ETIKETT[a.vaglage.fvagDynamik] || a.vaglage.fvagDynamik}**. ${a.vaglage.tolkning}`,
    );
  } else {
    rader.push(
      `Klassade horisonter: ${sattaHz.map((h) => `**${h} ${a.vaglage.perHorisont[h]}**`).join(", ")} — övriga osatt. Dynamiken är **${DYN_ETIKETT[a.vaglage.fvagDynamik] || a.vaglage.fvagDynamik}**. ${a.vaglage.tolkning}`,
    );
  }

  // 4. Golv och risker
  rader.push(`## Golv och risker`);
  rader.push(
    a.golv.typ === "osatt"
      ? `Värdegolvet är **osatt** — ${a.golv.not}`
      : `Värdegolvet (${a.golv.typ}) ligger med marginalen **${pct(a.golv.marginal)}** — ${a.golv.not}`,
  );
  for (const r of a.risker) rader.push(`- ${r}`);

  // 5. Falsifiering — signatursektionen
  rader.push(`## Vad som skulle falsifiera bilden`);
  rader.push(
    `En forskningsbild utan villkor som kan döda den är ingen forskning. Dessa villkor är mätbara med variabel-ID och tröskel:`,
  );
  for (const v of a.falsifiering) rader.push(`- ${v}`);

  // 6. Fördjupa dig — intern kurslänkning
  rader.push(`## Fördjupa dig`);
  const kursrader = a.lasMer.kurser.map(
    (slug) => `- [Kursen ${slug}](/kurser/${slug}) — variabeln i bolagets AKM1-profil`,
  );
  rader.push(
    `${kursrader.join("\n")}\n- [Den fullständiga översikten av ${kort}](/forskningsbiblioteket/${encodeURIComponent(a.ticker)}) — hela schemat med urvalsregel och utfall\n- [Komplett guide till svensk aktieanalys](/blogg/komplett-guide-svenska-aktieanalys-2026) — metodiken från grunden`,
  );

  // 7. Kursiv disclaimer-rad
  rader.push(
    `_Detta är en automatiskt genererad forskningsöversikt; den fullständiga AK1A-analysen tillverkas manuellt. Forskningsunderlag — ej rådgivning. Pedagogisk forskning, aldrig investeringsrådgivning (lagen 2007:528)._`,
  );

  return rader.join("\n\n");
}

// ── Skriv posterna + tvåvägslänka ───────────────────────────────────────────
let skrivna = 0;
for (const a of svenska) {
  const kort = kortNamn(a.namn);
  const slug = `analys-${slugify(kort)}-${AR}`;
  const body = byggKropp(a);
  const ord = body.split(/\s+/).length;
  const readingMinutes = Math.max(6, Math.min(8, Math.round(ord / 200)));

  const post = {
    slug,
    title: `Analys: ${kort} (${a.ticker}) — AKM1-forskning ${AR}`,
    description: `Automatisk forskningsöversikt: ${kort} passerade kandidatregeln — AKM1 ${sv(a.akm1.totalt)}/${sv(a.akm1.maxMojligt)} p (${pct(a.akm1.relativ)}), status ${a.urval.statusEtikett}, vågläge, risker och mätbara falsifieringsvillkor.`,
    pillar: "Svensk aktieanalys",
    author: "Ak1 Apex Nexus",
    publishedAt: PUBLICERAD,
    readingMinutes,
    tags: [kort, a.ticker, "AKM1", "forskning", "svensk aktieanalys"],
    body,
  };

  writeFileSync(path.join(BLOGG, `${slug}.json`), JSON.stringify(post, null, 2) + "\n", "utf8");
  skrivna += 1;

  // Tvåvägslänk: analys-jsonens lasMer.bloggSlug
  const fil = path.join(BIBLIOTEK, `${saneraFil(a.ticker)}.json`);
  const analys = JSON.parse(readFileSync(fil, "utf8"));
  analys.lasMer.bloggSlug = slug;
  writeFileSync(fil, JSON.stringify(analys, null, 1) + "\n", "utf8");

  console.log(`${slug}  (${ord} ord, ${readingMinutes} min)  ← ${a.ticker} rank ${a.rankPoang}`);
}

console.log(`BLOGGGENERATORN: ${skrivna} poster → data/blogg/ (publ. ${PUBLICERAD})`);
process.exit(skrivna > 0 ? 0 : 1);
