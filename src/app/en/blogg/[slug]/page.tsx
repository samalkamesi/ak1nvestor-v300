import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost } from "@/lib/content";
import { byggBloggSpegel, hamtaBloggLager } from "@/lib/blogg-speglar";
import {
  BloggSpegelSida,
  bloggSpegelGenerateMetadata,
  type BloggSpegelTexter,
} from "@/components/ak1a/blogg-spegel-sida";

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 3600;

/**
 * /en/blogg/[slug] — DYNAMIC BLOG MIRROR (våg 55, agent L2), EXAKT mönstret
 * från kursspeglarna (/en/kurser/[slug], våg 52 agent B — läst+följd, ej
 * ändrad).
 *
 * Kunddirektivet: bloggen in i MÖS — INGET förbygge: generateStaticParams
 * returnerar [] och dynamicParams = true låter varje artikel genereras
 * on-demand (ISR, revalidate 1 h) först när den begärs. Texter via lagret
 * (scope_typ "blogg", nycklar {slug}:titel|ingress|p{n}) med svensk fallback
 * per fält + översättningsnotis med andel klart. Okänd slug ⇒ notFound().
 *
 * SEO: robots noindex + canonical mot svenska originalet tills
 * publicerad-andelen ≥ 80 % (INDEX_TRASKEL) — därefter index + fullt
 * hreflang-kluster. Se bloggSpegelMetadata().
 */

/** Inget förbygge — varje artikel speglas on-demand vid begäran. */
export function generateStaticParams(): Array<{ slug: string }> {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return bloggSpegelGenerateMetadata("en", params);
}

/** Page-level texts — professional financial English (not machine translation). */
const TEXTER_EN: BloggSpegelTexter = {
  notisTitel: (procent) => `This article is being translated — ${procent}% complete`,
  notisText:
    "Paragraphs are shown in their original Swedish until each translation is published in English. Figures, tables and links work exactly as in the Swedish article.",
  minLasning: "min read",
  publicerad: "Published",
  lasOcksRubrik: "Read also",
};

export default async function BloggSpegelPageEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const lager = await hamtaBloggLager(slug, "en");
  const spegel = byggBloggSpegel(post, lager);

  return <BloggSpegelSida lang="en" spegel={spegel} texter={TEXTER_EN} />;
}
