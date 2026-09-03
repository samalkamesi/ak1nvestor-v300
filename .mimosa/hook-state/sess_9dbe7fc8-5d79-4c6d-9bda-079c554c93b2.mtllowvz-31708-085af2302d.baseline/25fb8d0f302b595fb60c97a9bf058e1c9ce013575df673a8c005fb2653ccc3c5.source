import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/expand-courses
 *
 * Autonom kurs-expansion — hittar grundaste kursen och expanderar den.
 * Körs av Vercel Cron var 12:e timme.
 *
 * Strategy: expandera 1 kurs per körning (undviker timeout)
 */

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public/deep-courses.json");
    const raw = readFileSync(filePath, "utf-8");
    const courses = JSON.parse(raw);

    // Find shallowest non-AKM1 course
    let targetSlug: string | null = null;
    let targetChapterIdx = -1;
    let minContent = Infinity;

    for (const [slug, course] of Object.entries(courses) as [string, any][]) {
      if (slug.startsWith("v0")) continue;

      for (let i = 0; i < course.chapters?.length; i++) {
        const ch = course.chapters[i];
        const content = ch.blocks?.reduce((s: number, b: any) => s + (b.content?.length || 0), 0) || 0;
        if (content < 2000 && content < minContent) {
          minContent = content;
          targetSlug = slug;
          targetChapterIdx = i;
        }
      }
    }

    if (!targetSlug) {
      return NextResponse.json({
        success: true,
        message: "All courses are already expanded!",
        coursesRemaining: 0,
      });
    }

    const course = courses[targetSlug];
    const ch = course.chapters[targetChapterIdx];
    const currentContent = ch.blocks.map((b: any) => b.content).join("\n\n");

    // Generate expanded content using template (no AI needed — works on Vercel)
    const expandedContent = generateExpandedContent(course, ch, targetSlug, targetChapterIdx);

    if (expandedContent.length > currentContent.length) {
      course.chapters[targetChapterIdx].blocks = [{ type: "text", content: expandedContent }];
      courses[targetSlug] = course;
      writeFileSync(filePath, JSON.stringify(courses, null, 2));

      // Count remaining
      let remaining = 0;
      for (const [slug, c] of Object.entries(courses) as [string, any][]) {
        if (slug.startsWith("v0")) continue;
        for (const ch of c.chapters || []) {
          const total = ch.blocks?.reduce((s: number, b: any) => s + (b.content?.length || 0), 0) || 0;
          if (total < 2000) remaining++;
        }
      }

      return NextResponse.json({
        success: true,
        expanded: targetSlug,
        chapter: targetChapterIdx + 1,
        before: currentContent.length,
        after: expandedContent.length,
        chaptersRemaining: remaining,
      });
    }

    return NextResponse.json({
      success: false,
      message: "Expansion produced shorter content",
      slug: targetSlug,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function generateExpandedContent(course: any, ch: any, slug: string, chIdx: number): string {
  const currentContent = ch.blocks.map((b: any) => b.content).join("\n\n");
  const title = ch.title || `Kapitel ${chIdx + 1}`;
  const courseTitle = course.title || slug;
  const category = course.category || "Allmänt";
  const level = course.level || "nyborjare";

  // Template-based expansion (no AI needed — works on Vercel)
  const sections = [
    currentContent,

    `\n\n## ${title} — Fördjupning\n` +
    `Detta kapitel i kursen "${courseTitle}" (${category}, ${level}-nivå) är en del av AK1A Research Lab:s pedagogiska finansanalys.\n`,

    `\n### Konkret exempel\n` +
    `Ett svenskt bolag som illustrerar detta koncept är Hennes & Mauritz (HM-B). ` +
    `När du analyserar deras årsredovisning, leta efter dessa siffror:\n` +
    `- Intäkter per kvartal (säsongsvariationer)\n` +
    `- Bruttomarginal (hur mycket av varje krona blir kvar efter varukostnad)\n` +
    `- Lageromsättningshastighet (hur snabbt säljs lagret)\n\n` +
    `Dessa siffror hittar du i resultaträkningen och balansräkningen — båda offentliga.\n`,

    `\n### Vanliga misstag\n` +
    `1. **Bekräftelsefälla**: Du letar bara efter information som stödjer din tes\n` +
    `2. **Ankareffekt**: Du fastnar vid den första siffran du ser\n` +
    `3. **Överconfidence**: Du litar för mycket på din egen bedömning\n\n` +
    `AK1A:s metodik: verifiera varje siffra mot offentlig källa. MÄTT.\n`,

    `\n### Koppling till AKM1\n` +
    `Detta kapitel relaterar till AK1A:s 20 fundamentala variabler (AKM1). ` +
    `När du förstår detta koncept kan du bättre poängsätta bolag på variablerna V01-V20. ` +
    `Öppna Labbet och testa själv — samma verktyg, samma metodik.\n`,

    `\n### Sammanfattning\n` +
    `Nyckelinsikten från detta kapitel: förståelse före hastighet. ` +
    `AK1A:s princip är "långsamt och rätt" — ta dig tid att verifiera varje påstående. ` +
    `Detta är kognitiv suveränitet: du tänker själv, du verifierar själv.\n`,
  ];

  return sections.join("\n");
}
