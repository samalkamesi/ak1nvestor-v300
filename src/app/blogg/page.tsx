import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/blogg",
  title: "Blogg — svensk aktieanalys & institutionell metodik | AK1A",
  description:
    "Djupgående artiklar om svensk aktieanalys, AKM1:s 20 variabler, årsredovisningar, värdering och hur institutioner egentligen analyserar aktier. Nytt inlägg varje vecka.",
  keywords: [
    "aktieanalys blogg",
    "svensk aktieanalys",
    "AKM1",
    "institutionell metodik",
    "finansblogg Sverige",
    "aktieblogg",
  ],
});

export default function BloggPage() {
  const posts = getBlogPosts();
  const pillars = [...new Set(posts.map((p) => p.pillar))];

  return (
    <SeoPageShell breadcrumb={[{ name: "Blogg" }]} wide>
      <h1 className="font-serif text-4xl font-bold">AK1A Blogg</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Institutionell metodik, förklarad för privatpersoner. Pelare: {pillars.join(" · ")}.
        Nytt innehåll varje vecka — djupanalyser på måndag, variabelfördjupning på onsdag.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blogg/${p.slug}`}
            className="flex flex-col rounded-lg border border-gold/20 bg-card p-6 hover:border-gold/60 transition-colors"
          >
            <span className="text-xs uppercase tracking-widest text-gold">{p.pillar}</span>
            <span className="mt-2 font-serif text-xl font-bold">{p.title}</span>
            <span className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
              {p.description}
            </span>
            <span className="mt-4 text-xs text-muted-foreground">
              {p.publishedAt} · {p.readingMinutes} min
            </span>
          </Link>
        ))}
      </div>
    </SeoPageShell>
  );
}
