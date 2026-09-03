import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPosts, getBlogPost } from "@/lib/content";
import { blogMetadata, articleJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return blogMetadata(post);
}

/**
 * Enkel inline-rendering av bloggtext:
 * [text](href) → länk, **fet** → strong, _kursiv_ → em.
 * Delar upp texten på markörerna i stället för en sammansatt regexp.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const segments = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|_[^_]+_)/g);
  segments.forEach((seg, i) => {
    if (!seg) return;
    if (seg.startsWith("[") && seg.includes("](")) {
      const label = seg.slice(1, seg.indexOf("]"));
      const href = seg.slice(seg.indexOf("](") + 2, -1);
      out.push(
        <Link key={`${keyPrefix}-a${i}`} href={href} className="text-gold underline hover:opacity-80">
          {label}
        </Link>
      );
    } else if (seg.startsWith("**") && seg.endsWith("**")) {
      out.push(<strong key={`${keyPrefix}-b${i}`}>{seg.slice(2, -2)}</strong>);
    } else if (seg.startsWith("_") && seg.endsWith("_") && seg.length > 2) {
      out.push(<em key={`${keyPrefix}-i${i}`}>{seg.slice(1, -1)}</em>);
    } else {
      out.push(seg);
    }
  });
  return out;
}

/** Renderar blogg-markdown: ## rubriker, stycken, - listor. */
function renderBody(body: string) {
  const blocks = body.split(/\n\n+/);
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-10 font-serif text-2xl font-bold">
          {renderInline(block.slice(3), `h${i}`)}
        </h2>
      );
    }
    if (block.split("\n").every((l) => l.startsWith("- "))) {
      return (
        <ul key={i} className="mt-4 list-disc space-y-1 pl-6">
          {block.split("\n").map((l, j) => (
            <li key={j} className="leading-relaxed">
              {renderInline(l.slice(2), `l${i}-${j}`)}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mt-4 leading-relaxed">
        {renderInline(block, `p${i}`)}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getBlogPosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <SeoPageShell breadcrumb={[{ name: "Blogg", href: "/blogg" }, { name: post.title }]}>
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Blogg", path: "/blogg" },
          { name: post.title, path: `/blogg/${post.slug}` },
        ])}
      />

      <article>
        <header className="border-b border-gold/30 pb-6">
          <p className="text-xs uppercase tracking-widest text-gold">
            {post.pillar} · {post.readingMinutes} min läsning
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold">{post.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {post.author} · Publicerad {post.publishedAt}
          </p>
        </header>
        <div className="mt-2 text-foreground/90">{renderBody(post.body)}</div>
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-gold/30 px-3 py-1 text-xs text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-12 border-t border-gold/30 pt-8">
          <h2 className="font-serif text-2xl font-bold">Läs också</h2>
          <ul className="mt-4 space-y-3">
            {related.map((p) => (
              <li key={p.slug}>
                <Link href={`/blogg/${p.slug}`} className="group block">
                  <span className="font-serif font-semibold group-hover:text-gold">{p.title}</span>
                  <span className="block text-sm text-muted-foreground">{p.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </SeoPageShell>
  );
}
