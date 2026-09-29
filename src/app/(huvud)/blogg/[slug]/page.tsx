import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPosts, getBlogPost, getCourses } from "@/lib/content";
import { blogMetadata, articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { parseFaqFragor } from "@/lib/blogg-faq";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { DelRad } from "@/components/ak1a/del-rad";
import { StrukturData } from "@/components/seo/StrukturData";

export const dynamic = "force-static";
// force-static ensamt ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /kurser sedan våg 82.
export const revalidate = 3600;

/**
 * VÅG 81: dynamicParams=false = ÄKTA 404 på okända slug:ar. Default (true)
 * gav i Next 16 SOFT-404 (notFound-HTML med HTTP 200 + statisk skal —
 * prodmätt 2026-09-07, samma systemfynd som /kurser). Säkert här: alla
 * poster täcks av generateStaticParams, on-demand-rendering behövs ej.
 */
export const dynamicParams = false;

/**
 * S2 (SÄLJ-KARTA A2): ALLA poster får sin sidplats vid bygget — även
 * framtidsdiskade (publishedAt > idag). Renderingen döljer dem ändå (getBlogPost
 * ⇒ null ⇒ notFound() = äkta 404, våg 81-mönstret), men platsen i ISR-cachen
 * gör att ett schemalagt inlägg vakar till live AV SIG SJÄLVT vid nästa
 * omrendering (revalidate 3600) när publiceringsdagen kommer — utan nytt
 * bygge. Vore framtids-slugs:arna uteslutna här (dynamicParams=false) krävdes
 * en deploy per publiceringstillfälle.
 */
export function generateStaticParams() {
  return getBlogPosts({ inkluderaFramtida: true }).map((p) => ({ slug: p.slug }));
}

/**
 * Interna länkar → kurser (organisk tillväxt, våg 50): plockar ut de
 * kurser artikeln själv hänvisar till (/kurser/<slug> i kroppen) och
 * renderar dem som en "Fortsätt i kurserna"-modul med deskriptiva
 * länktexter (kurstitel + ämnesområde — aldrig "läs mer"). Utan
 * kursreferenser i texten faller vi tillbaka på biblioteket/läroplanen,
 * så varje artikel alltid länkar vidare in i kurserna.
 */
function kurserIArtikeln(body: string, max = 4) {
  const kurser = getCourses();
  const slugs = [...new Set([...body.matchAll(/\/kurser\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  return slugs
    .map((s) => kurser[s])
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, max);
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
        <Link
          key={`${keyPrefix}-a${i}`}
          href={href}
          prefetch={false}
          // prefetch={false} (o41/o52-precedensen): brödtextens korsreferenser
          // är synliga i viewport ⇒ Next 16 prefetchar målinlägget i två
          // omgångar (partial + full flight ≈ 8,7 KiB) i LCP-fönstret per
          // kall inläggsvisning (o52 §2). Målet är force-static/ISR
          // (klick ≈ 100–300 ms), hover-prefetch lever kvar (Next 16).
          className="text-gold underline hover:opacity-80"
        >
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
  const kurser = kurserIArtikeln(post.body);
  const faq = parseFaqFragor(post.body);

  return (
    <SeoPageShell breadcrumb={[{ name: "Blogg", href: "/blogg" }, { name: post.title }]}>
      {/* VÅG 122F: StrukturData — ETT Article + ETT BreadcrumbList per post.
          VÅG 137: FAQPage läggs till när posten har en FAQ-sektion —
          schema och synligt innehåll ur EN källa (post.body). */}
      <StrukturData data={articleJsonLd(post)} id="jsonld-artikel" />
      <StrukturData
        data={breadcrumbJsonLd([
          { name: "Blogg", path: "/blogg" },
          { name: post.title, path: `/blogg/${post.slug}` },
        ])}
        id="jsonld-brodsmula"
      />
      {faq.length > 0 && (
        <StrukturData data={faqJsonLd(faq)} id="jsonld-faq" />
      )}

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

      {/* Del-raden (VÅG 3, m8 §3b): öppen, diskret, ingen vägg — före
          nästa-steg-blocket. */}
      <DelRad
        titel={post.title}
        text={post.description}
        path={`/blogg/${post.slug}`}
        className="mt-8"
      />

      {/* Fortsätt i kurserna — interna länkar med deskriptiva ankartexter */}
      <section className="mt-10 rounded-lg border border-gold/30 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">Fortsätt i kurserna</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Artikeln är en grund — djupet lever i kurserna, med quiz och kapitel för kapitel.
        </p>
        <ul className="mt-4 space-y-2.5">
          {kurser.length > 0 ? (
            kurser.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/kurser/${c.slug}`}
                  prefetch={false}
                  // prefetch={false} (o41/o52-precedensen): under vecket —
                  // kurs-flighterna är sajtenes tyngsta (o50 §6), prefetchas
                  // när läsaren scrollar fram dem; klick ≈ 100–300 ms
                  // (force-static), hover-prefetch lever (Next 16).
                  className="group block text-sm"
                >
                  <span className="font-semibold group-hover:text-gold">
                    Kursen {c.title} — {c.category}
                  </span>
                  <span className="block text-muted-foreground">
                    {c.chapters.length} kapitel · {c.totalMinutes || c.minutes} min · {c.level.toLowerCase()} nivå
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <li>
              <Link href="/kurser" prefetch={false} className="text-sm font-semibold hover:text-gold">
                Hela kursbiblioteket i institutionell aktieanalys — från AKM1:s 20 variabler till sektorsanalys
              </Link>
            </li>
          )}
          <li>
            <Link href="/laroplan" prefetch={false} className="text-sm font-semibold hover:text-gold">
              Läroplanen — den strukturerade vägen från nybörjare till oberoende analytiker
            </Link>
          </li>
        </ul>
      </section>

      {related.length > 0 && (
        <section className="mt-12 border-t border-gold/30 pt-8">
          <h2 className="font-serif text-2xl font-bold">Läs också</h2>
          <ul className="mt-4 space-y-3">
            {related.map((p) => (
              <li key={p.slug}>
                <Link href={`/blogg/${p.slug}`} prefetch={false} className="group block">
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
