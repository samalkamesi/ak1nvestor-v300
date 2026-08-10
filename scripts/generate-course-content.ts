/**
 * Course Content Generator v4 — Parallel + compact for speed & reliability
 * 
 * - 3 calls per course (meta + chapters 1-half + chapters half-end)
 * - 3 compact blocks per chapter (text, insight, definition)
 * - 4 courses processed in PARALLEL → ~4x speedup
 * 
 * Usage: bun run scripts/generate-course-content.ts
 */

import ZAI from "z-ai-web-dev-sdk";
import * as fs from "fs";

const JSON_PATH = "/home/z/my-project/public/deep-courses.json";
const PROGRESS_PATH = "/home/z/my-project/.gen-progress.json";
const PARALLEL = 1;
const SAVE_EVERY = 2;

const GENERIC_PATTERNS = [
  "Detta är en fundamentalsk färdighet",
  "Utan förståelse för detta ämne är det omöjligt",
  "Vi börjar med grunderna och bygger upp till mästerskap",
  "Varje siffra i en årsredovisning bygger på detta koncept",
];

interface CourseData {
  slug: string;
  category: string;
  title: string;
  summary: string;
  learn: string;
  why: string;
  history: { origin: string; evolution: string; modern: string };
  lynchSection?: string;
  grahamSection?: string;
  ak1Section?: string;
  chapters_list: { num: number; title: string; minutes: number }[];
  chapters: {
    num: number;
    minutes: number;
    title: string;
    intro: string;
    blocks: { type: "text" | "insight" | "definition"; content: string }[];
  }[];
  [key: string]: unknown;
}

function isGeneric(course: CourseData): boolean {
  const why = course.why || "";
  if (why.startsWith("Kurs i") || why.startsWith("Kurs in")) return true;
  for (const ch of course.chapters || []) {
    for (const b of ch.blocks || []) {
      for (const p of GENERIC_PATTERNS) {
        if (b.content && b.content.includes(p)) return true;
      }
    }
  }
  return false;
}

function loadProgress(): Set<string> {
  try {
    return new Set(JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8")).done || []);
  } catch {
    return new Set();
  }
}

function saveProgress(done: Set<string>) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify({ done: [...done] }, null, 2));
}

function extractJSON(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function buildMetaPrompt(course: CourseData): string {
  return `Du är expert på institutionell aktieanalys för AK1A Research Lab — "Sveriges enda institutionella metodik, byggd för privatpersoner."

KURS: ${course.title} | KATEGORI: ${course.category}
SAMMANFATTNING: ${course.summary}

Skriv SKRÄDDARSYTT innehåll med verkliga personer/årtal/bolag. Ej generisk mall.
Förbjudet: "fundamentalsk färdighet", "Utan förståelse", "börjar med grunderna", "ingår i kategorin".

JSON endast:
{"why":"2-3 meningar varför ämnet är viktigt för svensk retail-investerare","history":{"origin":"3 meningar historiskt ursprung med specifika fakta","evolution":"3 meningar om utveckling","modern":"3 meningar modern relevans"},"lynchSection":"2 meningar Lynchs perspektiv","grahamSection":"2 meningar Grahams perspektiv","ak1Section":"2 meningar hur AKM1 använder detta"}`;
}

function buildChapterPrompt(course: CourseData, indices: number[]): string {
  const chapters = indices.map((i) => {
    const c = course.chapters_list[i] || course.chapters[i];
    return `${c.num}. ${c.title}`;
  }).join("\n");

  return `Expert på institutionell aktieanalys för AK1A Research Lab.
KURS: ${course.title} (${course.category})

Skriv innehåll för dessa kapitel:
${chapters}

Specifikt för ämnet. Ej generisk mall.
Förbjudet: "fundamentalsk färdighet", "Utan förståelse", "börjar med grunderna".

JSON endast:
{"chapters":[{"intro":"1 mening intro","blocks":[{"type":"text","content":"2 paragrafer (med \\n\\n) djupgående innehåll"},{"type":"insight","content":"1 insikt"},{"type":"definition","content":"1 definition"}]}]}

chapters måste ha ${indices.length} element. Allt på svenska.`;
}

async function callLLM(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  prompt: string,
  maxRetries = 4
): Promise<any | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: "Du svarar ENDAST med giltig JSON." },
          { role: "user", content: prompt },
        ],
        thinking: { type: "disabled" },
      });
      const response = completion.choices[0]?.message?.content;
      if (!response || response.trim().length < 10) continue;
      return extractJSON(response);
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("429") || err?.message?.includes("Too many requests");
      // Rate limit: wait much longer (15s, 30s, 60s, 120s)
      // Other errors: shorter backoff (2s, 4s, 6s, 8s)
      const wait = isRateLimit ? 15000 * attempt : 2000 * attempt;
      if (attempt < maxRetries) {
        console.error(`    [attempt ${attempt}] ${isRateLimit ? "429 rate-limit" : "error"}, waiting ${wait}ms`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  return null;
}

async function generateCourse(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  course: CourseData
): Promise<boolean> {
  const total = course.chapters_list?.length || course.chapters?.length || 6;
  const half = Math.ceil(total / 2);
  const first = Array.from({ length: half }, (_, i) => i);
  const second = Array.from({ length: total - half }, (_, i) => i + half);

  const meta = await callLLM(zai, buildMetaPrompt(course));
  if (!meta?.why || !meta?.history?.origin || !meta?.lynchSection) return false;

  const chap1 = await callLLM(zai, buildChapterPrompt(course, first));
  if (!Array.isArray(chap1?.chapters) || chap1.chapters.length !== half) return false;

  let chap2: any = null;
  if (second.length > 0) {
    chap2 = await callLLM(zai, buildChapterPrompt(course, second));
    if (!Array.isArray(chap2?.chapters) || chap2.chapters.length !== second.length) return false;
  }

  // Apply
  course.why = meta.why;
  course.history = {
    origin: meta.history.origin,
    evolution: meta.history.evolution,
    modern: meta.history.modern,
  };
  course.lynchSection = meta.lynchSection;
  course.grahamSection = meta.grahamSection;
  course.ak1Section = meta.ak1Section;

  const allChaps = [...chap1.chapters, ...(chap2?.chapters || [])];
  course.chapters = course.chapters.map((ch, i) => ({
    num: ch.num,
    minutes: ch.minutes,
    title: ch.title,
    intro: allChaps[i]?.intro || ch.intro,
    blocks: Array.isArray(allChaps[i]?.blocks) ? allChaps[i].blocks : ch.blocks,
  }));

  return true;
}

async function main() {
  console.log("=== Course Content Generator v4 (parallel) ===\n");

  const allCourses: Record<string, CourseData> = JSON.parse(
    fs.readFileSync(JSON_PATH, "utf-8")
  );
  const genericSlugs = Object.values(allCourses).filter(isGeneric).map((c) => c.slug);
  console.log(`Total: ${Object.keys(allCourses).length}, Generic: ${genericSlugs.length}`);

  const done = loadProgress();
  console.log(`Done: ${done.size}`);
  const todo = genericSlugs.filter((s) => !done.has(s));
  console.log(`Remaining: ${todo.length}\n`);

  if (todo.length === 0) {
    console.log("All done!");
    return;
  }

  const zai = await ZAI.create();
  console.log("SDK ready.\n");

  let processed = 0, success = 0, failed = 0;
  const startTime = Date.now();

  // Process in parallel batches
  for (let batch = 0; batch < todo.length; batch += PARALLEL) {
    const batchSlugs = todo.slice(batch, batch + PARALLEL);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log(`[${processed + 1}-${processed + batchSlugs.length}/${todo.length}] (${elapsed}s) batch starting`);

    const results = await Promise.all(
      batchSlugs.map(async (slug) => {
        // Deep copy the course to avoid race conditions
        const course = JSON.parse(JSON.stringify(allCourses[slug])) as CourseData;
        const ok = await generateCourse(zai, course);
        return { slug, course, ok };
      })
    );

    for (const { slug, course, ok } of results) {
      processed++;
      if (ok) {
        allCourses[slug] = course;
        done.add(slug);
        success++;
        console.log(`  ✓ ${slug}`);
      } else {
        failed++;
        console.log(`  ✗ ${slug}`);
      }
    }

    // Save after each batch
    fs.writeFileSync(JSON_PATH, JSON.stringify(allCourses, null, 2), "utf-8");
    saveProgress(done);

    // Delay between batches to avoid rate limiting
    await new Promise((r) => setTimeout(r, 3000));
  }

  const t = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\nDone: ${success}✓ ${failed}✗ in ${t}s (${(Number(t) / processed).toFixed(1)}s/course)`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
