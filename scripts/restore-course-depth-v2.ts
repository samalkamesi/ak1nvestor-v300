/**
 * Återskapar gamla kunskapsstandarder — robust version med retry.
 * Körs: bun run scripts/restore-course-depth-v2.ts
 *
 * Skillnad från v1:
 * - Retry vid rate-limit (429)
 * - Sparar efter varje kurs (inte batch)
 * - Kortare prompts (snabbare)
 * - Rate-limit delay mellan kurser
 */
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync, writeFileSync } from "fs";

const FILE_PATH = "src/features/deep-courses/data/deep-courses.json";
const TARGET_CHARS = 5000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callAIWithRetry(zai: any, prompt: string, maxRetries = 3): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await zai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });
      return response.choices?.[0]?.message?.content || "";
    } catch (e: any) {
      const isRateLimit = e?.message?.includes("429") || e?.message?.includes("rate");
      if (isRateLimit && attempt < maxRetries - 1) {
        const wait = 30000 * (attempt + 1); // 30s, 60s, 90s
        console.log(`    ⏳ Rate limit, väntar ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      throw e;
    }
  }
  return "";
}

async function expandChapter(
  zai: any,
  course: any,
  slug: string,
  ch: any
): Promise<any> {
  const currentContent = ch.blocks.map((b: any) => b.content).join("\n\n");
  if (currentContent.length >= 2500) return ch; // Already deep enough

  const prompt = `Expandera detta kapitel till ca 2500 chars. Behåll all info, lägg till djup, exempel, fällor.

KURS: ${course.title}
KAPITEL: ${ch.title}

NUVARANDE:
${currentContent}

Svara med bara text (ingen markdown).`;

  try {
    const expanded = await callAIWithRetry(zai, prompt);
    if (expanded && expanded.length > currentContent.length) {
      return { ...ch, blocks: [{ type: "text", content: expanded }] };
    }
  } catch (e: any) {
    console.log(`    ⚠️ Chapter error: ${e.message?.substring(0, 80)}`);
  }
  return ch;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  AK1A — Återskapa kunskapsstandarder (v2 robust)         ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const courses = JSON.parse(readFileSync(FILE_PATH, "utf-8"));

  // Find courses needing expansion
  const needsExpansion: string[] = [];
  for (const [slug, course] of Object.entries(courses) as [string, any][]) {
    if (slug.startsWith("v0")) continue;
    const total = course.chapters.reduce(
      (s: number, ch: any) => s + ch.blocks.reduce((s2: number, b: any) => s2 + b.content.length, 0),
      0
    );
    if (total < TARGET_CHARS) needsExpansion.push(slug);
  }

  console.log(`Kurser att expandera: ${needsExpansion.length}`);
  console.log(`Target: ${TARGET_CHARS} chars per kurs\n`);

  const zai = await ZAI.create();
  let processed = 0;
  let expanded = 0;

  for (const slug of needsExpansion) {
    const course = courses[slug];
    const before = course.chapters.reduce(
      (s: number, ch: any) => s + ch.blocks.reduce((s2: number, b: any) => s2 + b.content.length, 0),
      0
    );

    process.stdout.write(`[${processed + 1}/${needsExpansion.length}] ${slug} (${before}ch)... `);

    try {
      // Expand each chapter
      const expandedChapters: (typeof course.chapters)[number][] = [];
      for (const ch of course.chapters) {
        const expandedCh = await expandChapter(zai, course, slug, ch);
        expandedChapters.push(expandedCh);
        await sleep(1000); // Small delay between chapters
      }

      courses[slug] = { ...course, chapters: expandedChapters };

      const after = expandedChapters.reduce(
        (s: number, ch: any) => s + ch.blocks.reduce((s2: number, b: any) => s2 + b.content.length, 0),
        0
      );

      // Save after each course
      writeFileSync(FILE_PATH, JSON.stringify(courses, null, 2));

      expanded++;
      console.log(`✓ ${before}→${after}ch`);
    } catch (e: any) {
      console.log(`⚠️ ${e.message?.substring(0, 60)}`);
    }

    processed++;
    await sleep(2000); // Rate limit between courses
  }

  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║  ✓ Klart! Bearbetade: ${processed} | Expanderade: ${expanded}            ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
