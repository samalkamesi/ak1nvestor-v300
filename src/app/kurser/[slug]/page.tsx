import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourses, getCourse } from "@/lib/content";
import { courseMetadata, courseJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.keys(getCourses()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return courseMetadata(course);
}

export default async function KursPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const siblings = Object.values(getCourses())
    .filter((c) => c.category === course.category && c.slug !== course.slug)
    .slice(0, 6);

  return (
    <SeoPageShell
      wide
      breadcrumb={[{ name: "Kurser", href: "/kurser" }, { name: course.title }]}
    >
      <JsonLd data={courseJsonLd(course)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Kurser", path: "/kurser" },
          { name: course.title, path: `/kurser/${course.slug}` },
        ])}
      />

      <header className="border-b border-gold/30 pb-6">
        <p className="text-xs uppercase tracking-widest text-gold">
          AKM1 · {course.category} · {course.level}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold">{course.title}</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">{course.learn}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {course.chapters.length} kapitel · {course.totalMinutes || course.minutes} min ·{" "}
          {course.xp ? `${course.xp} XP` : "Inkluderad i medlemskap"}
        </p>
      </header>

      {course.why && (
        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold">Varför denna variabel är avgörande</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">
            {course.why}
          </p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Kursinnehåll</h2>
        <div className="mt-4 space-y-6">
          {course.chapters.map((ch) => (
            <article key={ch.num} className="rounded-lg border border-gold/20 bg-card p-5">
              <h3 className="font-serif text-xl font-semibold">
                Kapitel {ch.num}: {ch.title}
              </h3>
              {ch.intro && <p className="mt-2 text-sm text-muted-foreground">{ch.intro}</p>}
              <div className="mt-3 space-y-3">
                {ch.blocks?.map((b, i) =>
                  b.type === "text" ? (
                    <p key={i} className="text-sm leading-relaxed whitespace-pre-line">
                      {String(b.content)}
                    </p>
                  ) : null
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {(course.lynchSection || course.grahamSection || course.ak1Section) && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">Tre perspektiv</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {course.lynchSection && (
              <div className="rounded-lg border border-gold/20 bg-card p-4">
                <h3 className="font-serif font-semibold text-gold">Peter Lynch</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {course.lynchSection}
                </p>
              </div>
            )}
            {course.grahamSection && (
              <div className="rounded-lg border border-gold/20 bg-card p-4">
                <h3 className="font-serif font-semibold text-gold">Benjamin Graham</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {course.grahamSection}
                </p>
              </div>
            )}
            {course.ak1Section && (
              <div className="rounded-lg border border-gold/20 bg-card p-4">
                <h3 className="font-serif font-semibold text-gold">AK1:s tolkning</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {course.ak1Section}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-lg border border-gold/40 bg-paper p-6">
        <h2 className="font-serif text-2xl font-bold">Fortsätt läroplanen</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Interaktiva övningar, vågmatriser och AI-tutor hittar du i labbet.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Öppna AK1A Research Lab
          </Link>
          <Link
            href="/medlemskap"
            className="rounded-md border border-gold/50 px-4 py-2 text-sm font-semibold hover:bg-gold/10"
          >
            Se medlemskap
          </Link>
        </div>
        {siblings.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
              Relaterade kurser i {course.category}
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/kurser/${s.slug}`}
                    className="inline-block rounded-full border border-gold/30 px-3 py-1 text-xs hover:bg-gold/10"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </SeoPageShell>
  );
}
