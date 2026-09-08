import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/content";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { spegelMetadata } from "@/lib/spegel-metadata";
import { byggBloggSpegel, hamtaAllaBloggOversattningar, urAllaLager } from "@/lib/blogg-speglar";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * /en/blogg — blog mirror of the Swedish /blogg list (våg 55, agent L2).
 * Follows the dynamic course-mirror pattern (wave 52): titles and ingresses
 * are picked from the translation layer (scope_typ "blogg") with per-field
 * Swedish fallback, and each partially translated post carries its own
 * progress line. All blog posts are rendered on-demand/ISR — nothing is
 * pre-translated by hand.
 */

export const metadata: Metadata = spegelMetadata({
  lang: "en",
  sida: "blogg",
  title: "Blog — Swedish Stock Analysis & Institutional Methodology | AK1A",
  description:
    "In-depth articles on Swedish stock analysis: AKM1's 20 variables, annual reports, valuation and behavioural finance — how institutions actually analyse stocks, explained for private investors.",
  keywords: [
    "stock analysis blog",
    "Swedish stock analysis",
    "AKM1",
    "institutional methodology",
    "financial blog",
    "value investing",
  ],
});

export default async function BloggPageEn() {
  const posts = getBlogPosts();
  // EN fråga för hela listan — titel/ingress per fält ur lagret, svensk fallback.
  const alla = await hamtaAllaBloggOversattningar(posts.map((p) => p.slug));
  const speglar = posts.map((p) => byggBloggSpegel(p, urAllaLager(alla, p.slug, "en")));
  const pillars = [...new Set(posts.map((p) => p.pillar))];

  return (
    <SeoPageShell breadcrumb={[{ name: "Blog" }]} wide>
      <h1 className="font-serif text-4xl font-bold">AK1A Research Lab — Blog</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Institutional methodology, explained for private investors. Pillars:{" "}
        {pillars.join(" · ")}. New articles every week — deep analyses on
        Mondays, variable deep-dives on Wednesdays.
      </p>

      {/* Translation notice — same pattern as /en/kurser (wave 52). */}
      <div
        role="note"
        className="mt-5 rounded-xl border border-gold/40 bg-gold/[0.06] p-4 text-sm leading-relaxed"
      >
        <p className="font-semibold text-foreground">
          Articles are being translated to English — live.
        </p>
        <p className="mt-1 text-muted-foreground">
          Every card opens its English page. Where the translation is still in
          progress the article shows the original Swedish text with a progress
          notice at the top; as each part is published, the page updates
          automatically.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {speglar.map((spegel) => {
          const p = spegel.post;
          return (
            <div
              key={p.slug}
              className="flex flex-col rounded-lg border border-gold/20 bg-card p-6 transition-colors hover:border-gold/60"
            >
              <Link href={`/en/blogg/${p.slug}`} className="flex flex-1 flex-col">
                <span className="text-xs uppercase tracking-widest text-gold">{p.pillar}</span>
                <span className="mt-2 font-serif text-xl font-bold">{p.title}</span>
                <span className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </span>
                {/* Per-post progress line — only when PARTIALLY translated
                    (fully translated posts need no notice; 0 % posts are
                    covered by the general notice above). */}
                {!spegel.komplett && spegel.publicerade > 0 && (
                  <span className="mt-3 text-xs font-medium text-gold">
                    Translation in progress — {spegel.procent}% complete
                  </span>
                )}
                <span className="mt-4 text-sm font-semibold text-gold">
                  Read the {p.pillar.toLowerCase()} deep-dive — {p.title} →
                </span>
                <span className="mt-1.5 text-xs text-muted-foreground">
                  {p.publishedAt} · {p.readingMinutes} min read
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </SeoPageShell>
  );
}
