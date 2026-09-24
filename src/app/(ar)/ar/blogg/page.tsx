import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/content";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { spegelMetadata } from "@/lib/spegel-metadata";
import { byggBloggSpegel, hamtaAllaBloggOversattningar, urAllaLager } from "@/lib/blogg-speglar";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * /ar/blogg — blog mirror of the Swedish /blogg list (våg 55, agent L2).
 * Samma mönster som /en/blogg och de dynamiska kursspeglarna (våg 52):
 * titlar och ingresser ur översättningslagret (scope_typ "blogg") med svensk
 * fallback per fält + progress-rad per delvis översatt inlägg. RTL styrs av
 * SprakLeverantor/dir-attributen på artikelsidorna.
 */

export const metadata: Metadata = spegelMetadata({
  lang: "ar",
  sida: "blogg",
  title: "المدونة — تحليل الأسهم السويدية والمنهجية المؤسسية | AK1A",
  description:
    "مقالات معمّقة في تحليل الأسهم السويدية: متغيّرات AKM1 العشرون، التقارير السنوية، التقييم والتمويل السلوكي — كيف تحلّل المؤسسات الأسهم فعليًا، مشروحة للمستثمرين الأفراد.",
  keywords: [
    "مدونة تحليل الأسهم",
    "تحليل الأسهم السويدية",
    "AKM1",
    "المنهجية المؤسسية",
    "مدونة مالية",
    "الاستثمار القيمي",
  ],
});

export default async function BloggPageAr() {
  const posts = getBlogPosts();
  // EN fråga för hela listan — titel/ingress per fält ur lagret, svensk fallback.
  const alla = await hamtaAllaBloggOversattningar(posts.map((p) => p.slug));
  const speglar = posts.map((p) => byggBloggSpegel(p, urAllaLager(alla, p.slug, "ar")));
  const pillars = [...new Set(posts.map((p) => p.pillar))];

  return (
    <SeoPageShell lang="ar" breadcrumb={[{ name: "المدونة" }]} wide>
      <div lang="ar" dir="rtl">
        <h1 className="font-serif text-4xl font-bold">مدونة AK1A Research Lab</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          المنهجية المؤسسية، مشروحة للمستثمرين الأفراد. المحاور: {pillars.join(" · ")}.
          محتوى جديد كل أسبوع — تحليلات معمّقة يوم الاثنين وتعمّق في المتغيّرات يوم الأربعاء.
        </p>

        {/* Notis om pågående översättning — samma mönster som /ar/kurser. */}
        <div
          role="note"
          className="mt-5 rounded-xl border border-gold/40 bg-gold/[0.06] p-4 text-sm leading-relaxed"
        >
          <p className="font-semibold text-foreground">
            المقالات قيد الترجمة إلى العربية — مباشرةً.
          </p>
          <p className="mt-1 text-muted-foreground">
            كل بطاقة تفتح صفحتها العربية. وحيثما لم تكتمل الترجمة بعد تُعرض المقالة
            بالنص السويدي الأصلي مع إشعار بنسبة التقدم أعلى الصفحة؛ وتُحدَّث الصفحة
            تلقائيًا مع نشر كل جزء.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {speglar.map((spegel) => {
            const p = spegel.post;
            return (
              <div
                key={p.slug}
                className="cv-bloggkort flex flex-col rounded-lg border border-gold/20 bg-card p-6 transition-colors hover:border-gold/60"
              >
                {/* prefetch={false} — samma slug-prefetch-kur som /blogg
                    (o41, s7-u2): full flight-payload hör inte hemma i
                    listans initiala last; hämtas vid klick. */}
                <Link href={`/ar/blogg/${p.slug}`} prefetch={false} className="flex flex-1 flex-col">
                  <span className="text-xs uppercase tracking-widest text-gold">{p.pillar}</span>
                  <span className="mt-2 font-serif text-xl font-bold">{p.title}</span>
                  <span className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                    {p.description}
                  </span>
                  {/* Progress-rad per inlägg — endast vid DELVIS översättning
                      (helt översatta behöver ingen notis; 0 % täcks av den
                      allmänna notisen ovan). */}
                  {!spegel.komplett && spegel.publicerade > 0 && (
                    <span className="mt-3 text-xs font-medium text-gold">
                      الترجمة قيد الإنجاز — اكتمل {spegel.procent}٪
                    </span>
                  )}
                  <span className="mt-4 text-sm font-semibold text-gold">
                    اقرأ التعمّق في {p.pillar} — {p.title} ←
                  </span>
                  <span className="mt-1.5 text-xs text-muted-foreground">
                    {p.publishedAt} · {p.readingMinutes} دقيقة قراءة
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Brandgenomgångens CTA-gap (våg 201): den arabiska blogspegelns
            primära nästa steg — gratis-grunderna. Statiskt renderad (inget
            hydrerings-pop-in); prefetch={false} enligt o17-precedensen. */}
        <section className="mt-12 rounded-lg border border-gold/20 bg-card p-6 text-center">
          <h2 className="font-serif text-2xl font-bold">ابدأ بالأساسيات</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            المقالات تُظهر المنهجية عمليًا — والدروس تبنيها خطوة بخطوة. مسار
            التأسيس كامل مجانًا، دون بطاقة.
          </p>
          <Link
            href="/ar/kurser"
            prefetch={false}
            className="btn-guld-signatur mt-5 inline-flex min-h-[44px] items-center gap-2 px-7 py-3 text-sm max-md:min-h-[52px]"
          >
            ابدأ بالأساسيات — مجانًا ←
          </Link>
        </section>
      </div>
    </SeoPageShell>
  );
}
