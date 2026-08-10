/**
 * Återskapar kunskapsstandarder — 1 kapitel per kurs per körning.
 * Kör flera gånger för att expandera alla kapitel.
 *
 * Körs: bun run scripts/expand-one-chapter.ts [course-slug]
 */
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync, writeFileSync } from "fs";

const FILE_PATH = "src/features/deep-courses/data/deep-courses.json";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const courses = JSON.parse(readFileSync(FILE_PATH, "utf-8"));

  // Find the first course with a chapter that needs expansion
  let targetSlug: string | null = null;
  let targetChapterIdx = -1;

  for (const [slug, course] of Object.entries(courses) as [string, any][]) {
    if (slug.startsWith("v0")) continue;

    for (let i = 0; i < course.chapters.length; i++) {
      const ch = course.chapters[i];
      const content = ch.blocks.reduce((s: number, b: any) => s + b.content.length, 0);
      if (content < 2000) {
        targetSlug = slug;
        targetChapterIdx = i;
        break;
      }
    }
    if (targetSlug) break;
  }

  if (!targetSlug) {
    console.log("✓ Alla kurser är redan expanderade!");
    return;
  }

  const course = courses[targetSlug];
  const ch = course.chapters[targetChapterIdx];
  const currentContent = ch.blocks.map((b: any) => b.content).join("\n\n");

  console.log(`Expanding: ${targetSlug} ch${targetChapterIdx + 1} (${currentContent.length} chars)`);

  const zai = await ZAI.create();

  const prompt = `Du är AK1A Research Lab:s pedagogiska AI-system.

KURS: ${course.title} (${targetSlug})
KATEGORI: ${course.category}
KAPITEL ${targetChapterIdx + 1}: ${ch.title}

NUVARANDE INNEHÅLL (${currentContent.length} chars):
${currentContent}

UPPGIFT: Expandera till ca 2500 chars. Behåll all info, lägg till:
- Djupare förklaring
- Konkreta exempel med siffror
- Svenska bolags-exempel
- Vanliga misstag
- Koppling till AKM1

Pedagogisk ton, "du"-form. Svara med bara text.`;

  try {
    const response = await zai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const expanded = response.choices?.[0]?.message?.content || currentContent;

    if (expanded.length > currentContent.length) {
      course.chapters[targetChapterIdx].blocks = [{ type: "text", content: expanded }];
      courses[targetSlug] = course;
      writeFileSync(FILE_PATH, JSON.stringify(courses, null, 2));
      console.log(`✓ ${targetSlug} ch${targetChapterIdx + 1}: ${currentContent.length} → ${expanded.length} chars`);
    } else {
      console.log(`⚠️ Expansion kortare än original`);
    }
  } catch (e: any) {
    console.error(`Error: ${e.message}`);
  }
}

main();
