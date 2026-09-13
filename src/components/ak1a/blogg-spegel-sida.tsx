import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts, getBlogPost } from "@/lib/content";
import { skapaT } from "@/lib/sprak";
import { breadcrumbJsonLd } from "@/lib/seo";
import {
  BloggSpegel,
  BloggSpegelSprak,
  bloggSpegelJsonLd,
  bloggSpegelMetadata,
  byggBloggSpegel,
  hamtaBloggLager,
} from "@/lib/blogg-speglar";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { StrukturData } from "@/components/seo/StrukturData";

/**
 * BLOGGSPEGEL-SIDA (våg 55, agent L2) — gemensam server-renderare för de
 * dynamiska bloggspegel-rutterna /en/blogg/[slug] och /ar/blogg/[slug].
 *
 * Mönstret är EXAKT src/components/ak1a/kurs-spegel-sida.tsx (våg 52 agent
 * B — läst+följd, ej ändrad): spegla strukturen hos svenska /blogg/[slug]
 * (samma data ur data/blogg/*.json via getBlogPost) men med titel, ingress
 * och varje stycke ur översättningslagret (src/lib/blogg-speglar.ts):
 * publicerad översättning → svensk originaltext. Fält markeras EJ; i stället
 * EN notis överst med andel klart (räknad ur lagret, kalla.ts-paritet).
 *
 * UI-rubriken "Blogg" (brödsmula + JSON-LD) kommer ur ordlistan via
 * t() = skapaT(lang) — samma nycklar ("nav.blogg") som menyn. Sidunika
 * rubriker (Läs också, Publicerad, min läsning) levereras av språk-packetet
 * (BloggSpegelTexter) i respektive sidfil.
 *
 * RTL: hela innehållscontainern får dir="rtl" för arabiska (samma mönster
 * som kursspeglarna och våg 51:s /ar-spegelsidor).
 */

/** Sidunika texter per språk — proffsig översättning, inte maskinord. */
export type BloggSpegelTexter = {
  notisTitel: (procent: number) => string;
  notisText: string;
  minLasning: string;
  publicerad: string;
  lasOcksRubrik: string;
};

export function BloggSpegelSida({
  lang,
  spegel,
  texter,
}: {
  lang: BloggSpegelSprak;
  spegel: BloggSpegel;
  texter: BloggSpegelTexter;
}) {
  const t = skapaT(lang);
  const post = spegel.post;
  const slug = post.slug;

  // Relaterade inlägg — svenska originaltitlar som fallback (lagret hämtas
  // per slug; listvyn /en|ar/blogg visar de speglade titlarna).
  const related = getBlogPosts().filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <SeoPageShell breadcrumb={[{ name: t("nav.blogg"), href: `/${lang}/blogg` }, { name: post.title }]}>
      <div lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
        <StrukturData data={bloggSpegelJsonLd(spegel, lang)} id="jsonld-artikel" />
        <StrukturData
          data={breadcrumbJsonLd([
            { name: t("nav.blogg"), path: `/${lang}/blogg` },
            { name: post.title, path: `/${lang}/blogg/${slug}` },
          ])}
          id="jsonld-brodsmula"
        />

        {/* Översättnings-notis — EN per sida (fält markeras ej): andel klart
            räknad ur översättningslagret. Döljs först när ALLT är publicerat. */}
        {!spegel.komplett && (
          <div
            role="note"
            className="mb-6 rounded-xl border border-gold/40 bg-gold/[0.06] p-4"
          >
            <p className="text-sm font-semibold text-foreground">
              🌐 {texter.notisTitel(spegel.procent)}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gold/15">
              <div className="h-full rounded-full bg-gold" style={{ width: `${spegel.procent}%` }} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{texter.notisText}</p>
          </div>
        )}

        <article>
          <header className="border-b border-gold/30 pb-6">
            <p className="text-xs uppercase tracking-widest text-gold">
              {post.pillar} · {post.readingMinutes} {texter.minLasning}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold">{post.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {post.author} · {texter.publicerad} {post.publishedAt}
            </p>
          </header>
          <div className="mt-2 text-foreground/90">{renderStycken(spegel)}</div>
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gold/30 px-3 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-12 border-t border-gold/30 pt-8">
            <h2 className="font-serif text-2xl font-bold">{texter.lasOcksRubrik}</h2>
            <ul className="mt-4 space-y-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${lang}/blogg/${p.slug}`} className="group block">
                    <span className="font-serif font-semibold group-hover:text-gold">{p.title}</span>
                    <span className="block text-sm text-muted-foreground">{p.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </SeoPageShell>
  );
}

/**
 * Renderar de speglade styckena — samma markdown-tolkning som svenska
 * /blogg/[slug] (## rubriker, - listor samt inline [text](href), fet och
 * kursiv markering). Styckena kommer ur lagret med svensk fallback och
 * behåller sitt format.
 */
function renderStycken(spegel: BloggSpegel): React.ReactNode[] {
  return spegel.stycken.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-10 font-serif text-2xl font-bold">
          {renderInline(block.slice(3), `h${i}`)}
        </h2>
      );
    }
    if (block.split("\n").length > 1 && block.split("\n").every((l) => l.startsWith("- "))) {
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

/** Inline-markdown → React-noder (samma tolkning som svenska /blogg/[slug]). */
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

// ── Sidfilernas allyta: generateMetadata (sidfilerna deklarerar själva
//    routing-exporten: generateStaticParams ⇒ [] + dynamicParams = true +
//    revalidate — on-demand-ISR, inget förbygge).

/**
 * Metadata-byggare för en bloggspegel-sida: hämtar lagret, bygger spegeln
 * (progressstyrd robots/canonical/hreflang — se bloggSpegelMetadata).
 * Används som `export async function generateMetadata(p) { return bloggSpegelGenerateMetadata("en", p); }`.
 */
export async function bloggSpegelGenerateMetadata(
  lang: BloggSpegelSprak,
  params: Promise<{ slug: string }>
): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  const lager = await hamtaBloggLager(slug, lang);
  const spegel = byggBloggSpegel(post, lager);
  return bloggSpegelMetadata({ lang, spegel });
}
