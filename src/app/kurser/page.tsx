import Link from "next/link";
import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { pageMetadata, websiteJsonLd, JsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/kurser",
  title: "Kurser i institutionell aktieanalys — 225 moduler | AK1A",
  description:
    "Lär dig institutionell aktieanalys steg för steg. 225 kurser: AKM1:s 20 variabler, teknisk analys, riskhantering, portföljhantering och praktiska case. Pedagogisk finansanalys.",
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
        {courses.length} moduler som lär dig tänka som en analytiker — från AKM1:s 20
        fundamentalvariabler till teknisk analys, riskhantering och praktiska case.
        Varje kurs bygger på samma metodik som institutionerna använder, förklarad
        pedagogiskt för privatpersoner.
      </p>

      <div className="mt-10 space-y-10">
        {[...byCategory.entries()].map(([category, list]) => (
          <section key={category}>
            <h2 className="font-serif text-2xl font-bold border-b border-gold/30 pb-2">
              {category}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {list.length} kurser
              </span>
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/kurser/${c.slug}`}
                    className="block rounded-lg border border-gold/20 bg-card p-4 hover:border-gold/60 transition-colors"
                  >
                    <span className="font-serif font-semibold">{c.title}</span>
                    <span className="block mt-1 text-xs text-muted-foreground">
                      {c.level} · {c.chapters.length} kapitel · {c.totalMinutes || c.minutes} min
                    </span>
                    <span className="block mt-2 text-xs text-muted-foreground leading-relaxed">
                      {c.learn}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SeoPageShell>
  );
}
