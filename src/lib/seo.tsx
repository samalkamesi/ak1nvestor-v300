/**
 * SEO-hjälpare: metadata-byggare + JSON-LD (schema.org).
 * Läser genererad meta från data/seo/[slug].json om den finns
 * (skapas av scripts/seo-generate.mjs), annars deterministisk fallback.
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { Course, Analysis, CaseStudy, BlogPost } from "./content";

export const SITE_URL = "https://lab.ak1nvestor.com";
export const SITE_NAME = "AK1A Research Lab";

type SeoMeta = { title?: string; description?: string; keywords?: string[] };

function loadGeneratedMeta(kind: string, key: string): SeoMeta | null {
  const p = join(process.cwd(), "data", "seo", kind, `${key}.json`);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function clamp(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : t.slice(0, max - 1).replace(/[\s,.;:-]+\S*$/, "") + "…";
}

// ── Metadata-byggare ────────────────────────────────────────────────────────

export function pageMetadata(opts: {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
}) {
  const url = `${SITE_URL}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      type: opts.type ?? "website",
      locale: "sv_SE",
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image" as const,
      title: opts.title,
      description: opts.description,
    },
  };
}

export function courseMetadata(course: Course) {
  const gen = loadGeneratedMeta("kurser", course.slug);
  const title = gen?.title ?? clamp(`${course.title} — AKM1-kurs | ${SITE_NAME}`, 60);
  const description =
    gen?.description ??
    clamp(
      `${course.learn} Kurs ${course.slug.toUpperCase()} i AKM1: ${course.chapters.length} kapitel, ${course.level.toLowerCase()} nivå.`,
      158
    );
  return pageMetadata({
    path: `/kurser/${course.slug}`,
    title,
    description,
    keywords: gen?.keywords ?? [
      "AKM1",
      course.title,
      "aktieanalys",
      `${course.category.toLowerCase()} kurser`,
      "institutionell metodik",
    ],
  });
}

export function analysisMetadata(a: Analysis) {
  const gen = loadGeneratedMeta("analyser", a.ticker);
  const title = gen?.title ?? clamp(`${a.company} (${a.ticker}) analys | ${SITE_NAME}`, 60);
  const description =
    gen?.description ??
    clamp(
      `Institutionell analys av ${a.company}. ${a.recommendation ? `Rekommendation: ${a.recommendation}. ` : ""}AKM1 20 variabler, scenarier och prisnivåer.`,
      158
    );
  return pageMetadata({
    path: `/analyser/${encodeURIComponent(a.ticker)}`,
    title,
    description,
    keywords: gen?.keywords ?? [
      `${a.company} aktie`,
      `${a.ticker} analys`,
      "svensk aktieanalys",
      "AKM1",
      "institutionell metodik",
    ],
  });
}

export function caseMetadata(c: CaseStudy) {
  const title = clamp(`${c.title} — Case | ${SITE_NAME}`, 60);
  const description = clamp(
    `${c.description || c.lesson || `Case study: ${c.company}.`} ${c.akm1Score != null ? `AKM1-poäng: ${c.akm1Score}.` : ""}`,
    158
  );
  return pageMetadata({
    path: `/labb/${c.id}`,
    title,
    description,
    keywords: ["case study", c.company, c.sector || "aktieanalys", "AKM1", "lärande case"],
  });
}

export function blogMetadata(post: BlogPost) {
  const gen = loadGeneratedMeta("blogg", post.slug);
  return pageMetadata({
    path: `/blogg/${post.slug}`,
    title: gen?.title ?? clamp(post.title, 60),
    description: gen?.description ?? clamp(post.description, 158),
    keywords: gen?.keywords ?? post.tags,
    type: "article",
    publishedTime: post.publishedAt,
  });
}

// ── JSON-LD ─────────────────────────────────────────────────────────────────

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/ak1a/favicon.svg`,
    email: "info@ak1nvestor.com",
    description:
      "Sveriges enda institutionella aktieanalys-metodik, byggd för privatpersoner. Pedagogisk finansanalys — inte investeringsråd.",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "sv-SE",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/kurser?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function courseJsonLd(course: Course) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${course.title} — AKM1 ${course.slug.toUpperCase()}`,
    description: course.learn || course.summary,
    inLanguage: "sv-SE",
    educationalLevel: course.level || "Intermediate",
    timeRequired: `PT${course.totalMinutes || course.minutes || 30}M`,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${course.totalMinutes || 30}M`,
    },
  };
}

export function articleJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    inLanguage: "sv-SE",
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blogg/${post.slug}`,
  };
}

export function analysisJsonLd(a: Analysis) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${a.company} (${a.ticker}) — institutionell analys`,
    description: String(a.motivation || a.status || `Analys av ${a.company}`).slice(0, 300),
    inLanguage: "sv-SE",
    datePublished: a.analysisDate || a.verified,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/analyser/${encodeURIComponent(a.ticker)}`,
    about: { "@type": "Corporation", name: a.company, tickerSymbol: a.ticker },
  };
}

/** Renderar en JSON-LD-struktur som <script>-element (server components). */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
