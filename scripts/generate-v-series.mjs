#!/usr/bin/env node
/**
 * Genererar bloggserien "AKM1:s 20 variabler" (Pelare 3) från deep-courses.json.
 * Varje artikel komponeras från kursens egna innehåll: why, history, kapitel-
 * utdrag, Lynch/Graham/AK1-perspektiv — med internlänk till kurssidan.
 *
 * Kör: node scripts/generate-v-series.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "data", "blogg");

const courses = JSON.parse(readFileSync(path.join(ROOT, "public", "deep-courses.json"), "utf8"));

/** Klipp text vid meningsgräns nära targetlängd. */
function trim(text, target) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= target) return t;
  const cut = t.slice(0, target);
  const lastDot = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  const lastSpace = cut.lastIndexOf(" ");
  const end = lastDot > target * 0.5 ? lastDot + 1 : lastSpace;
  return cut.slice(0, end).trim();
}

function chapterChars(ch) {
  return ch.blocks?.reduce((s, b) => s + (b.content?.length || 0), 0) || 0;
}

function bestBlock(course, chapterIdx) {
  const ch = course.chapters?.[chapterIdx];
  if (!ch) return null;
  const best = [...(ch.blocks || [])].sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0))[0];
  return best?.content || null;
}

let generated = 0;
const slugs = Object.keys(courses)
  .filter((s) => /^v\d{2}-/.test(s))
  .sort();

for (const slug of slugs) {
  const c = courses[slug];
  if (!c?.chapters?.length) continue;

  const vNum = slug.slice(0, 3).toUpperCase(); // V01…
  const title = `${vNum}: ${c.title} — så analyserar du den`;

  // Välj kapitel per roll
  const findCh = (re) => c.chapters.find((ch) => re.test(ch.title.toLowerCase()));
  const calcCh = findCh(/beräk|räkna|praktik|uträkn|formel/) || c.chapters[2] || c.chapters[0];
  const trapCh = findCh(/fälla|mörka|misstag|illusion|risk/) || null;
  const mainCh = c.chapters[0];
  const masteryCh = findCh(/mästerskap|system|nästa|avancerad/);

  const bodyParts = [];

  // Intro
  bodyParts.push(
    `${trim(c.why || c.learn, 700)}\n\nDetta är **${vNum} — ${c.title}** i AKM1-modellen: en av de 20 variabler som tillsammans avgör om ett bolag är en institutionell kvalitetsaktie eller ett sällskap av berättelser. I den här artikeln får du variabeln förklarad, hur du räknar på den själv, och hur tre av historiens största investerare skulle ha tolkat den.`
  );

  // Historia
  const origin = c.history?.origin;
  if (origin) {
    bodyParts.push(`## Varför variabeln finns\n\n${trim(origin, 750)}`);
  }

  // Huvudsakligt innehåll från kapitel 1
  const mainBlock = bestBlock(c, 0);
  if (mainBlock) {
    bodyParts.push(`## ${mainCh.title}\n\n${trim(mainBlock, 1000)}`);
  }

  // Så räknar du
  const calcBlock = bestBlock(c, c.chapters.indexOf(calcCh));
  if (calcBlock) {
    bodyParts.push(`## ${calcCh.title}\n\n${trim(calcBlock, 900)}`);
  }

  // Fällor
  if (trapCh) {
    const trapBlock = bestBlock(c, c.chapters.indexOf(trapCh));
    if (trapBlock) {
      bodyParts.push(`## ${trapCh.title}\n\n${trim(trapBlock, 800)}`);
    }
  }

  // Tre perspektiv
  const persp = [];
  if (c.lynchSection) persp.push(`**Peter Lynch:** ${trim(c.lynchSection, 380)}`);
  if (c.grahamSection) persp.push(`**Benjamin Graham:** ${trim(c.grahamSection, 380)}`);
  if (c.ak1Section) persp.push(`**AK1:s tolkning:** ${trim(c.ak1Section, 420)}`);
  if (persp.length) {
    bodyParts.push(`## Tre perspektiv på ${c.title.toLowerCase()}\n\n${persp.join("\n\n")}`);
  }

  // Mästerskap/CTA
  bodyParts.push(
    `## Fördjupa dig\n\n${
      masteryCh ? `${trim(masteryCh.intro || "", 350)}\n\n` : ""
    }Vill du öva med räkneexempel, kapitel för kapitel? Kursen [${c.title} (${vNum})](/kurser/${slug}) innehåller ${c.chapters.length} kapitel, Lynch- och Graham-perspektiv och hur AK1 använder variabeln i vågmatrisen. Se även [komplett guiden till svensk aktieanalys](/blogg/komplett-guide-svensk-aktieanalys-2026) för hur alla 20 variabler hänger ihop.\n\n_Detta är pedagogisk finansanalys, inte investeringsråd._`
  );

  const body = bodyParts.filter(Boolean).join("\n\n");
  const post = {
    slug: `${slug}-guide`.replace(/-guide$/, "") === slug ? slug : `${slug}-analys`,
    title: title.length > 75 ? `${vNum}: ${c.title}` : title,
    description: trim(`${c.learn} Variabel ${vNum} i AKM1 förklarad: definition, uträkning, fällor och hur Lynch, Graham och AK1 tolkar den.`, 155),
    pillar: "AKM1",
    author: "Ak1 Apex Nexus",
    publishedAt: "2026-08-23",
    readingMinutes: Math.max(4, Math.round(body.length / 1100)),
    tags: ["AKM1", vNum, c.title, "fundamentalanalys", "aktieanalys"],
    body,
  };

  // slug: använd kurs-slug + "-analys" för att undvika kollision med kurssidan
  post.slug = `${slug}-analys`;

  const file = path.join(OUT, `${post.slug}.json`);
  if (existsSync(file)) continue;
  writeFileSync(file, JSON.stringify(post, null, 2) + "\n");
  generated++;
}

mkdirSync(OUT, { recursive: true });
const total = readdirSync(OUT).filter((f) => f.endsWith(".json")).length;
console.log(`✓ Genererade ${generated} nya artiklar (${slugs.length} variabler hittade)`);
console.log(`✓ Totalt i data/blogg: ${total} artiklar`);
