/**
 * Återskapar gamla kunskapsstandarder i alla 205 grundare kurser.
 *
 * Problem: AKM1 V01-V19 har 35k-90k chars per kurs.
 *          Andra 205 kurser har bara 1000-5000 chars.
 *
 * Lösning: Använd AI (z-ai-web-dev-sdk) för att expandera varje kurs
 * till samma djup som AKM1-standarden.
 *
 * Körs: bun run scripts/restore-course-depth.ts
 */
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

interface CourseBlock {
  type: "text" | "insight" | "definition";
  content: string;
}

interface CourseChapter {
  num: number;
  minutes: number;
  title: string;
  intro: string;
  blocks: CourseBlock[];
}

interface DeepCourse {
  slug: string;
  variableId: string;
  category: string;
  weight: string;
  chapterCount: number;
  totalMinutes: number;
  title: string;
  summary: string;
  minutes: number;
  xp: number;
  level: string;
  learn: string;
  why: string;
  chapters_list: { num: number; title: string; minutes: number }[];
  history?: { origin: string; evolution: string; modern: string };
  lynchSection?: string;
  grahamSection?: string;
  ak1Section?: string;
  chapters: CourseChapter[];
}

async function expandCourse(
  zai: any,
  course: DeepCourse,
  slug: string
): Promise<DeepCourse> {
  const targetCharsPerChapter = 3000; // AKM1 standard

  // Expand each chapter
  const expandedChapters: CourseChapter[] = [];
  for (const ch of course.chapters) {
    const currentContent = ch.blocks.map((b) => b.content).join("\n\n");
    const currentLength = currentContent.length;

    if (currentLength >= targetCharsPerChapter) {
      // Already deep enough
      expandedChapters.push(ch);
      continue;
    }

    // Need to expand
    const expandPrompt = `Du är AK1A Research Lab:s pedagogiska AI-system.

KURS: ${course.title} (${slug})
KATEGORI: ${course.category}
NIVÅ: ${course.level}

KAPITEL: ${ch.title}
INTRO: ${ch.intro}

NUVARANDE INNEHÅLL (${currentLength} chars):
"""
${currentContent}
"""

UPPGIFT: Expandera detta kapitel till ca ${targetCharsPerChapter} chars.
Behåll ALL nuvarande information och lägg till:
1. Djupare förklaring av koncepten
2. Konkreta exempel med siffror
3. Svenska bolags-exempel där relevant
4. Vanliga misstag och fällor
5. Hur detta kopplar till AKM1-variabler

AK1A:s röst:
- Pedagogisk, inte barnslig
- Konkret, inte abstrakt
- Svenska bolag som exempel
- "Du"-form
- MÄTT-baserad (spårbar)

Svara med BARRA det expanderade innehållet (ingen JSON, ingen markdown-formattering, bara text).`;

    try {
      const response = await zai.chat.completions.create({
        messages: [{ role: "user", content: expandPrompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const expandedContent = response.choices?.[0]?.message?.content || currentContent;

      expandedChapters.push({
        ...ch,
        blocks: [{ type: "text" as const, content: expandedContent }],
      });

      // Rate limit: wait between API calls
      await new Promise((r) => setTimeout(r, 2000));
    } catch (e: any) {
      console.log(`  ⚠️ Error expanding ${slug} ch${ch.num}: ${e.message}`);
      expandedChapters.push(ch); // Keep original on error
    }
  }

  // Expand Lynch/Graham/AK1 sections if too short
  const expandSection = async (section: string, name: string, role: string): Promise<string> => {
    if (!section || section.length >= 500) return section;

    try {
      const prompt = `Du är AK1A Research Lab:s AI-system.

KURS: ${course.title} (${slug})
SEKTION: ${name} (${role})

NUVARANDE TEXT (${section.length} chars):
"""
${section}
"""

Expandera till ca 500 chars. Behåll kärnan, lägg till:
- Konkert perspektiv från ${role}
- Hur detta relaterar till ${course.title}
- Svenskt exempel om möjligt

Svara med bara text.`;

      const response = await zai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const result = response.choices?.[0]?.message?.content || section;
      await new Promise((r) => setTimeout(r, 1500));
      return result;
    } catch {
      return section;
    }
  };

  const expandedLynch = await expandSection(course.lynchSection || "", "Peter Lynch", "tillväxt-investerare");
  const expandedGraham = await expandSection(course.grahamSection || "", "Benjamin Graham", "value-investerare");
  const expandedAk1 = await expandSection(course.ak1Section || "", "AKM1-metodiken", "AK1A:s metod");

  return {
    ...course,
    chapters: expandedChapters,
    lynchSection: expandedLynch,
    grahamSection: expandedGraham,
    ak1Section: expandedAk1,
  };
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  AK1A — Återskapa gamla kunskapsstandarder                ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const filePath = path.join(process.cwd(), "src/features/deep-courses/data/deep-courses.json");
  const raw = readFileSync(filePath, "utf-8");
  const courses: Record<string, DeepCourse> = JSON.parse(raw);

  // Find courses that need expansion (non-AKM1, < 5000 chars)
  const targetChars = 5000;
  const needsExpansion: string[] = [];

  for (const [slug, course] of Object.entries(courses)) {
    if (slug.startsWith("v0")) continue; // Skip AKM1 (already deep)

    const totalContent = course.chapters.reduce(
      (sum, ch) => sum + ch.blocks.reduce((s, b) => s + b.content.length, 0),
      0
    );

    if (totalContent < targetChars) {
      needsExpansion.push(slug);
    }
  }

  console.log(`Kurser som behöver expansion: ${needsExpansion.length}/225`);
  console.log(`Target: ${targetChars} chars per kurs\n`);

  // Initialize AI
  const zai = await ZAI.create();

  // Process in batches to avoid rate limits
  const batchSize = 5;
  let processed = 0;
  let expanded = 0;

  for (let i = 0; i < needsExpansion.length; i += batchSize) {
    const batch = needsExpansion.slice(i, i + batchSize);
    console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1} — ${batch.length} kurser`);

    for (const slug of batch) {
      const course = courses[slug];
      const beforeContent = course.chapters.reduce(
        (sum, ch) => sum + ch.blocks.reduce((s, b) => s + b.content.length, 0),
        0
      );

      console.log(`  Expanding: ${slug} (${beforeContent} chars)...`);

      try {
        const expandedCourse = await expandCourse(zai, course, slug);
        const afterContent = expandedCourse.chapters.reduce(
          (sum, ch) => sum + ch.blocks.reduce((s, b) => s + b.content.length, 0),
          0
        );

        courses[slug] = expandedCourse;
        expanded++;
        console.log(`  ✓ ${slug}: ${beforeContent} → ${afterContent} chars`);
      } catch (e: any) {
        console.log(`  ⚠️ ${slug}: Error — ${e.message}`);
      }

      processed++;
    }

    // Save progress after each batch
    writeFileSync(filePath, JSON.stringify(courses, null, 2));
    console.log(`  💾 Sparat (${processed}/${needsExpansion.length})`);

    // Longer pause between batches
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║  ✓ Expansion komplett!                                     ║`);
  console.log(`║  Bearbetade: ${processed} kurser                            ║`);
  console.log(`║  Expanderade: ${expanded} kurser                            ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝`);
}

main().catch((e) => {
  console.error("Fel:", e);
  process.exit(1);
});
