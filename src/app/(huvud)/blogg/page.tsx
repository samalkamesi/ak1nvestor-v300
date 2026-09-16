import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts, getCourses } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";
// force-static ensamt ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /kurser sedan våg 82.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  path: "/blogg",
  title: "Blogg — svensk aktieanalys & institutionell metodik | AK1A",
  description:
    "Djupgående artiklar om svensk aktieanalys, AKM1:s 20 variabler, årsredovisningar, värdering och hur institutioner egentligen analyserar aktier. Nytt inlägg varje vecka.",
  // VÅG 78 C #4: hreflang-ÖMSESIDIGHET — /en/blogg + /ar/blogg är indexbara
  // speglar sedan våg 55; originalet deklarerar klustret tillbaka.
  harSpeglar: true,
  keywords: [
    "aktieanalys blogg",
    "svensk aktieanalys",
    "AKM1",
    "institutionell metodik",
    "finansblogg Sverige",
    "aktieblogg",
  ],
});

/**
 * Första kursen en artikel hänvisar till (av /kurser/<slug> i kroppen) —
 * ger varje kort i listvy en intern länk vidare in i kurserna, med
 * deskriptiv ankartext (organisk tillväxt, våg 50).
 */
function forstaKurs(body: string) {
  const kurser = getCourses();
  for (const m of body.matchAll(/\/kurser\/([a-z0-9-]+)/g)) {
    const c = kurser[m[1]];
    if (c) return c;
  }
  return null;
}

export default function BloggPage() {
  const posts = getBlogPosts();
  const pillars = [...new Set(posts.map((p) => p.pillar))];

  return (
    <SeoPageShell breadcrumb={[{ name: "Blogg" }]} wide>
      <h1 className="font-serif text-4xl font-bold">AK1A Blogg</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Institutionell metodik, förklarad för privatpersoner. Pelare: {pillars.join(" · ")}.
        Nytt innehåll löpande — djupanalyser och variabelfördjupningar.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => {
          const kurs = forstaKurs(p.body);
          return (
            <div
              key={p.slug}
              className="cv-bloggkort flex flex-col rounded-lg border border-gold/20 bg-card p-6 transition-colors hover:border-gold/60"
            >
              <Link href={`/blogg/${p.slug}`} className="flex flex-1 flex-col">
                <span className="text-xs uppercase tracking-widest text-gold">{p.pillar}</span>
                <span className="mt-2 font-serif text-xl font-bold">{p.title}</span>
                <span className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </span>
                {/* Deskriptiv länktext — aldrig ett bart "läs mer": ämnet
                    + pelaren + läslängd ger både användare och sök/AI
                    kontext av målet. */}
                <span className="mt-4 text-sm font-semibold text-gold">
                  Läs fördjupningen inom {p.pillar.toLowerCase()} — {p.title} →
                </span>
                <span className="mt-1.5 text-xs text-muted-foreground">
                  {p.publishedAt} · {p.readingMinutes} min läsning
                </span>
              </Link>
              {/* Intern länk vidare in i kursbiblioteket — utanför kortets
                  länk så ankartexten blir en egen, deskriptiv länk. */}
              {kurs && (
                <Link
                  href={`/kurser/${kurs.slug}`}
                  className="mt-3 block border-t border-gold/20 pt-3 text-xs text-muted-foreground hover:text-gold max-md:min-h-[52px]"
                >
                  Fortsätt djupare: kursen {kurs.title} — {kurs.category}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </SeoPageShell>
  );
}
