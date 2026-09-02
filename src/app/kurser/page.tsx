import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { pageMetadata, websiteJsonLd, JsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { FortsattPanel } from "@/components/ak1a/fortsatt-panel";
import { KursSok } from "@/components/ak1a/kurs-sok";
import { KurstipsKort } from "@/components/ak1a/kurstips-kort";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/kurser",
  // Uppdaterad 2026-09-01: 307 kurser i public/deep-courses.json (antalet räknas dynamiskt i sidkroppen)
  title: "Kurser i institutionell aktieanalys — 307 kurser | AK1A",
  description:
    "Lär dig institutionell aktieanalys steg för steg. 307 kurser: AKM1:s 20 variabler, teknisk analys, riskhantering, portföljhantering och praktiska case. Pedagogisk finansanalys.",
  keywords: [
    "aktieanalys kurser",
    "AKM1",
    "institutionell metodik",
    "lära sig aktieanalys",
    "svenska aktier",
    "finansiell utbildning",
  ],
});

export default function KurserPage() {
  const courses = getCourseList();
  const byCategory = new Map<string, typeof courses>();
  for (const c of courses) {
    const list = byCategory.get(c.category) ?? [];
    list.push(c);
    byCategory.set(c.category, list);
  }

  return (
    <SeoPageShell breadcrumb={[{ name: "Kurser" }]} wide>
      <JsonLd data={websiteJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">Kurser i institutionell aktieanalys</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        {courses.length} kurser som lär dig tänka som en analytiker — från AKM1:s 20
        fundamentalvariabler till teknisk analys, riskhantering och praktiska case.
        Varje kurs bygger på samma metodik som institutionerna använder, förklarad
        pedagogiskt för privatpersoner.
      </p>

      {/* Tips för just dig — personligt, som ett tips aldrig ett tvång */}
      <div className="mt-6">
        <KurstipsKort antal={3} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
        <KursSok
          kurser={courses.map((c) => ({
            slug: c.slug,
            title: c.title,
            category: c.category,
            kapitel: c.chapters.length,
            minuter: c.totalMinutes || c.minutes,
            learn: c.learn,
            xp: c.xp,
            quiz: c.chapters.reduce((s, k) => s + (k.quiz?.length || 0), 0),
          }))}
        />
        <aside className="h-fit"><FortsattPanel /></aside>
      </div>
        </SeoPageShell>
  );
}
