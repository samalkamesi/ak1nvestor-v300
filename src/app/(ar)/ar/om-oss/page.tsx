import type { Metadata } from "next";
import Link from "next/link";
import { getCourseList } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

/** أرقام عربية شرقية مع فاصل الآلاف العربي (ar-EG: ٨٬٢١١). */
const num = (n: number) => n.toLocaleString("ar-EG");

/**
 * المرآة العربية لصفحة /om-oss (الموجة 51 — الوكيل S2).
 *
 * ترجمة كاملة لصفحة «من نحن» السويدية — بطاقات النماذج الثلاث،
 * والمؤسس، والمبادئ، والمسار التعليمي، وقسم التواصل. نصوص عربية
 * مستقلة؛ لا سلاسل مشتركة مع الصفحة السويدية. الأرقام تُحسب حيّة من
 * طبقة المحتوى، تمامًا كالصفحة السويدية.
 */
export const metadata: Metadata = {
  title: "من نحن — AK1A Research Lab | Ak1 Apex Nexus",
  description:
    "AK1A Research Lab هي المنهجية التحليلية المؤسسية الوحيدة في السويد، المصمَّمة للأفراد. وخلف المنصة تقف شركة Ak1 Apex Nexus والمؤسس سام الكامسي.",
  keywords: [
    "عن AK1A",
    "AK1A Research Lab",
    "Ak1 Apex Nexus",
    "سام الكامسي",
    "تعليم تحليل الأسهم",
  ],
  alternates: {
    canonical: `${SITE_URL}/ar/om-oss`,
    languages: {
      "sv-SE": `${SITE_URL}/om-oss`,
      en: `${SITE_URL}/en/om-oss`,
      ar: `${SITE_URL}/ar/om-oss`,
      "x-default": `${SITE_URL}/om-oss`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "من نحن — AK1A Research Lab | Ak1 Apex Nexus",
    description:
      "منصة تعليمية بقناعة واحدة بسيطة: المنهجية التحليلية المؤسسية حق.",
    url: `${SITE_URL}/ar/om-oss`,
    siteName: "AK1A Research Lab",
    type: "website",
    locale: "ar_AR",
    alternateLocale: ["sv_SE", "en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "عن AK1A Research Lab",
    description:
      "المنهجية التحليلية المؤسسية الوحيدة في السويد، المصمَّمة للأفراد.",
  },
};

export default function ArOmOssPage() {
  // أرقام حية — تُحسب من طبقة المحتوى عند البناء
  const kurserLista = getCourseList();
  const antalKurser = kurserLista.length;
  const antalBokmaster = kurserLista.filter((c) => c.category === "BOKMASTER").length;

  return (
    <SeoPageShell wide breadcrumb={[{ name: "البداية", href: "/ar" }, { name: "من نحن" }]}>
      {/* الحاوية الرئيسية باتجاه القراءة العربية */}
      <div dir="rtl">
        <h1 className="font-serif text-4xl font-bold">
          عن AK1<span className="text-gold">A</span> Research Lab
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          AK1A Research Lab منصة تعليمية بقناعة واحدة بسيطة: المنهجية
          التحليلية المؤسسية حق — وليست خدمة محجوزة لمحللي البنوك ومديري
          الصناديق.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gold/30 bg-card p-5">
            <div className="text-2xl">📊</div>
            <h2 className="mt-2 font-serif text-lg font-bold">AKM1</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              عشرون متغيرًا أساسيًا (V01–V20) في ٧ فئات: النمو، والتقييم،
              والربحية، والاستقرار، والخندق التنافسي، والمحفزات، والمخاطر.
              من ٠ إلى ٥ نقاط لكل متغير، والحد الأقصى ١٠٠.
            </p>
          </div>
          <div className="rounded-2xl border border-gold/30 bg-card p-5">
            <div className="text-2xl">🌊</div>
            <h2 className="mt-2 font-serif text-lg font-bold">AK1TS</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              تحليل الأمواج الفني: ٥ نظريات (إليوت، فيبوناتشي، غان، لوكاس،
              الحجم) × ٥ آفاق زمنية × ٤ أبعاد (الموجة، والسعر، والوقت،
              والاختراق) = ١٠٠ نقطة بيانات لكل حيازة.
            </p>
          </div>
          <div className="rounded-2xl border border-gold/30 bg-card p-5">
            <div className="text-2xl">🎓</div>
            <h2 className="mt-2 font-serif text-lg font-bold">التعليم أولًا</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {num(antalKurser)} دورة، و{num(antalBokmaster)} كتاب BOKMASTER
              كاملًا، وحاسبة، ونظام محافظ، وموجّه بالذكاء الاصطناعي، وتكرار
              متباعد — كلها منسوجة معًا في منظومة واحدة.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl font-bold">المؤسس</h2>
            <p className="mt-2 text-muted-foreground">
              خلف AK1nvestor.com وAK1A Research Lab يقف المؤسس سام الكامسي
              وشركة Ak1 Apex Nexus. الرؤية مباشرة: بناء أوسع تعليم في
              السويد — وربما في العالم — في تحليل الأسهم المستقل، وجعله في
              متناول الجميع. المرحلة ١ مجانية دائمًا، ومفتوحة دائمًا.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold">المبادئ</h2>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">تحليل تعليمي — وليس نصائح استثمارية.</strong>{" "}
                كل ما على المنصة تعليم. ولا نقدّم توصيات بما ينبغي أن تشتري.
              </li>
              <li>
                <strong className="text-foreground">أعمق من مدونة. أوضح من بنك. أسرع من دورة تعليمية.</strong>{" "}
                منهجية مؤسسية، مشروحة للأفراد — دون إخفاء حدود النظريات.
              </li>
              <li>
                <strong className="text-foreground">احتفظ بالمعرفة — وانشر بسخاء.</strong>{" "}
                معرفة المنهجية تُشارك علنًا؛ والدورات المبنية على كتاب كامل
                تستشهد بالكتاب علنًا (BOKMASTER).
              </li>
              <li>
                <strong className="text-foreground">قابلية إعادة الإنتاج.</strong>{" "}
                تحليلاتنا تتبع قواعد واضحة ومصادر بيانات معلنة — حتى
                تستطيع إعادتها بنفسك.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold">المسار التعليمي</h2>
            <p className="mt-2 text-muted-foreground">
              يسلك الطريق إلى الاستقلالية{" "}
              <Link href="/laroplan" className="font-semibold text-gold underline">
                المنهج الدراسي
              </Link>{" "}
              في خمس مراحل: الأسس (V01–V20)، ثم التعمق، ثم بوكماستر
              ({num(antalBokmaster)} كتابًا فصلًا فصلًا)، ثم التطبيق على
              شركات حقيقية وعلى محفظتك الخاصة — حتى الهدف الأخير: محلل
              أسهم مستقل. وفي الطريق تكسب نقاط الخبرة (XP) والنجوم
              وأخيرًا{" "}
              <Link href="/certifikat" className="font-semibold text-gold underline">
                الشهادات
              </Link>
              . والعضوية مجانية في المرحلة ١، إلى الأبد.
            </p>
          </section>

          <section className="rounded-xl border border-gold/30 bg-card p-5">
            <h2 className="font-serif text-xl font-bold">التواصل</h2>
            <p className="mt-2 text-muted-foreground">
              Ak1 Apex Nexus · info@ak1nvestor.com
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Link
                href="/ar/medlemskap"
                className="rounded-lg bg-gold px-3 py-1.5 font-bold text-primary-foreground"
              >
                العضوية
              </Link>
              <Link
                href="/kurser"
                className="rounded-lg border border-gold/40 px-3 py-1.5 font-bold text-gold"
              >
                جميع الدورات
              </Link>
              <Link
                href="/bibliotek"
                className="rounded-lg border border-gold/40 px-3 py-1.5 font-bold text-gold"
              >
                المكتبة
              </Link>
            </div>
          </section>
        </div>
      </div>
    </SeoPageShell>
  );
}
