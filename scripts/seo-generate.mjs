#!/usr/bin/env node
/**
 * Genererar SEO-metadata (title/description/keywords) per sida till data/seo/.
 * Deterministisk — ingen AI-nyckel krövs. Kör vid build eller via cron:
 *   node scripts/seo-generate.mjs
 *
 * data/seo/kurser/[slug].json, data/seo/analyser/[ticker].json,
 * data/seo/blogg/[slug].json — läses av src/lib/seo.tsx vid metadata-bygge.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "data", "seo");

function clamp(s, max) {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/[\s,.;:-]+\S*$/, "") + "…";
}

function writeJson(kind, key, meta) {
  const dir = path.join(OUT, kind);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${key}.json`), JSON.stringify(meta, null, 2) + "\n");
  return meta;
}

// ── Kurser ──────────────────────────────────────────────────────────────────
function generateCourses() {
  const courses = JSON.parse(readFileSync(path.join(ROOT, "public", "deep-courses.json"), "utf8"));
  let n = 0;
  for (const [slug, c] of Object.entries(courses)) {
    const title = clamp(`${c.title} — AKM1-kurs | AK1A Research Lab`, 60);
    const description = clamp(
      `${c.learn} Kurs ${slug.toUpperCase()}: ${c.chapters?.length ?? 6} kapitel, ${(c.level || "intermediär").toLowerCase()} nivå, ${c.category.toLowerCase()}.`,
      158
    );
    const keywords = [
      "AKM1",
      c.title,
      `${c.category.toLowerCase()} aktieanalys`,
      "institutionell metodik",
      "lär dig aktieanalys",
    ];
    writeJson("kurser", slug, { title, description, keywords });
    n++;
  }
  console.log(`✓ kurser: ${n} meta-filer`);
}

// ── Analyser ────────────────────────────────────────────────────────────────
function generateAnalyses() {
  const dirs = [path.join(ROOT, "data", "analyses"), path.join(ROOT, "data", "export", "analyses")];
  const seen = new Set();
  let n = 0;
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const a = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
      if (!a.ticker || seen.has(a.ticker)) continue;
      seen.add(a.ticker);
      const title = clamp(`${a.company} (${a.ticker}) — aktieanalys | AK1A`, 60);
      const description = clamp(
        `Institutionell analys av ${a.company}: AKM1 20 variabler, scenarier (bull/base/bear), prisnivåer och vågmatris. ${a.recommendation?.main ? `Rekommendation: ${a.recommendation.main}.` : ""}`,
        158
      );
      const keywords = [
        `${a.company} aktie`,
        `${a.ticker} analys`,
        `${a.company} aktieanalys`,
        "svensk aktieanalys",
        "AKM1",
        "institutionell metodik",
      ];
      writeJson("analyser", a.ticker, { title, description, keywords });
      n++;
    }
  }
  console.log(`✓ analyser: ${n} meta-filer`);
}

// ── Blogg ───────────────────────────────────────────────────────────────────
function generateBlog() {
  const dir = path.join(ROOT, "data", "blogg");
  if (!existsSync(dir)) return console.log("– blogg: ingen data");
  let n = 0;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    const p = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
    const title = clamp(p.title, 60);
    const description = clamp(p.description, 158);
    const keywords = p.tags ?? [];
    writeJson("blogg", p.slug, { title, description, keywords });
    n++;
  }
  console.log(`✓ blogg: ${n} meta-filer`);
}

mkdirSync(OUT, { recursive: true });
generateCourses();
generateAnalyses();
generateBlog();
console.log("\n✅ SEO-metadata genererad till data/seo/");
