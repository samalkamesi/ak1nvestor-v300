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
 * /ar/blogg/[slug] — DYNAMISK BLOGGSPEGEL (våg 55, agent L2), EXAKT mönstret
 * från /ar/kurser/[slug] (våg 52 agent B — läst+följd, ej ändrad) och sin
 * engelska systerfil.
 *
 * On-demand-ISR (generateStaticParams ⇒ [] + dynamicParams + revalidate 1 h),
 * texter ur lagret (scope_typ "blogg") med svensk fallback per fält +
 * översättningsnotis med andel klart. Okänd slug ⇒ notFound(). SEO-tröskel
 * 80 % (INDEX_TRASKEL) — se bloggSpegelMetadata().
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
  return bloggSpegelGenerateMetadata("ar", params);
}

/** نصوص الصفحة — العربية الفصحى الحديثة بمصطلحات مالية دقيقة. */
const TEXTER_AR: BloggSpegelTexter = {
  notisTitel: (procent) => `هذه المقالة قيد الترجمة — اكتمل ${procent}٪`,
  notisText:
    "تُعرض الفقرات بالسويدية الأصلية حتى تُنشر ترجمة كل جزء إلى العربية. الأرقام والجداول والروابط تعمل تمامًا كما في المقالة السويدية.",
  minLasning: "دقيقة قراءة",
  publicerad: "نُشرت",
  lasOcksRubrik: "اقرأ أيضًا",
};

export default async function BloggSpegelPageAr({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const lager = await hamtaBloggLager(slug, "ar");
  const spegel = byggBloggSpegel(post, lager);

  return <BloggSpegelSida lang="ar" spegel={spegel} texter={TEXTER_AR} />;
}
