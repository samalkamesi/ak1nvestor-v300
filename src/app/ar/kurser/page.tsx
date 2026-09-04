import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { FortsattPanel } from "@/components/ak1a/fortsatt-panel";
import { KursSok } from "@/components/ak1a/kurs-sok";
import { KurstipsKort } from "@/components/ak1a/kurstips-kort";
import { SIFFROR } from "@/lib/siffror";
import {
  spegelMetadata,
  spegelWebsiteJsonLd,
  spegelUtbildningsOrganisationJsonLd,
  spegelFaqJsonLd,
} from "@/lib/spegel-metadata";
import { JsonLd } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * /ar/kurser — مرآة كاملة للصفحة السويدية /kurser (الموجة 51، الوكيل S3).
 * جميع نصوص الصفحة مترجمة إلى العربية الفصحى الحديثة، والمحتوى داخل
 * الحاوية يقرأ من اليمين إلى اليسار (dir="rtl"). قائمة الدورات نفسها
 * (333 عنوان دورة سويدية) تُعرض كما هي عبر KursSok — ترجمة الدورات هي
 * المرحلة 3 من خطة اللغات، مع إشعار واضح للقارئ. الأرقام من
 * src/lib/siffror (المصدر الوحيد للأرقام). تُحتفظ بالاختصارات اللاتينية
 * (AKM1 وBOKMASTER وXP) وبالأرقام اللاتينية وفق خطة اللغات.
 */

export const metadata: Metadata = spegelMetadata({
  lang: "ar",
  sida: "kurser",
  title: `دورات في التحليل المؤسسي للأسهم — ${SIFFROR.kurser} دورة | AK1A`,
  description: `تعلّم التحليل المؤسسي للأسهم خطوة بخطوة. ${SIFFROR.kurser} دورة: متغيرات AKM1 العشرون، والتحليل الفني، وإدارة المخاطر، وإدارة المحفظة، وحالات عملية. تعليم مالي قائم على البحث.`,
  keywords: [
    "دورات تحليل الأسهم",
    "AKM1",
    "المنهجية المؤسسية",
    "تعلم تحليل الأسهم",
    "الأسهم السويدية",
    "التعليم المالي",
  ],
});

/** مخطط FAQPage بالعربية (مرآة للأسئلة الشائعة على /kurser). */
function coursesFaqJsonLd() {
  return spegelFaqJsonLd("ar", [
    {
      fraga: "ما هي منهجية AKM1؟",
      svar:
        "AKM1 هي إطار النماذج لدى AK1A ويضم 20 متغيرًا أساسيًا (V01–V20) — من نمو المبيعات إلى إعادة شراء الأسهم الذاتية — تتكامل معًا لتعطي صورة مؤسسية شاملة عن الشركة.",
    },
    {
      fraga: "كم عدد الدورات في AK1A؟",
      svar: `${SIFFROR.kurser.toLocaleString("en-US")} دورة في موضوعات مثل التحليل الأساسي والتقييم والتحليل الفني وإدارة المخاطر والاقتصاد السلوكي — إضافة إلى ${SIFFROR.bokmaster} كتابًا في دورات BOKMASTER، فصلًا ففصلًا.`,
    },
    {
      fraga: "هل الدورات مجانية؟",
      svar:
        "المرحلة 1 — التعليم الأساسي بالدورات وملخصات الكتب والاختبارات والأدوات — مجانية للأبد. المرحلتان 2 و3 هما الخطوتان المتقدمتان.",
    },
    {
      fraga: "هل أحتاج إلى معرفة مسبقة لتعلم تحليل الأسهم؟",
      svar:
        "لا. يبدأ المنهج من الصفر ويبني خطوة بخطوة: لكل نسبة مالية أساسية دورتها الخاصة مع أمثلة واختبارات وتمارين عملية.",
    },
    {
      fraga: "هل يقدم AK1A نصائح استثمارية أو توصيات في أسهم؟",
      svar:
        "لا. يقدم AK1A Research Lab تعليمًا قائمًا على البحث في منهجية التحليل — أبدًا ليس نصائح استثمارية أو توصيات بشأن أسهم بعينها.",
    },
  ]);
}

export default function KurserPageAr() {
  const courses = getCourseList();

  return (
    <SeoPageShell breadcrumb={[{ name: "الدورات" }]} wide>
      <JsonLd data={spegelWebsiteJsonLd("ar")} />
      <JsonLd data={spegelUtbildningsOrganisationJsonLd(
        "ar",
        `AKM1 — ${SIFFROR.kurser} courses, ${SIFFROR.kanonBocker} canon books, ${SIFFROR.quiz} quiz questions`
      )} />
      <JsonLd data={coursesFaqJsonLd()} />

      <div dir="rtl">
        <h1 className="font-serif text-4xl font-bold">
          دورات في التحليل المؤسسي للأسهم
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          {courses.length} دورة تعلّمك أن تفكر مثل محلل — من متغيرات AKM1
          الأساسية العشرين إلى التحليل الفني وإدارة المخاطر والحالات العملية.
          كل دورة مبنية على المنهجية ذاتها التي تستخدمها المؤسسات، مشروحة
          بأسلوب تعليمي موجَّه للأفراد.
        </p>

        {/* إشعار الترجمة — بطاقات الدورات تقود الآن إلى مرايا الدورات
            العربية الديناميكية (الموجة 52): العربية المنشورة حيث تتوفر،
            والأصل السويدي مع إشعار تقدم في أعلى كل صفحة حيث لم تكتمل. */}
        <div
          role="note"
          className="mt-5 rounded-xl border border-gold/40 bg-gold/[0.06] p-4 text-sm leading-relaxed"
        >
          <p className="font-semibold text-foreground">
            الدورات قيد الترجمة إلى العربية — مباشرةً.
          </p>
          <p className="mt-1 text-muted-foreground">
            كل بطاقة دورة تفتح صفحتها العربية. حيث لم تكتمل الترجمة بعد
            تُعرض الفصول بالسويدية الأصلية مع إشعار بنسبة الإنجاز أعلى
            الصفحة، وتتحدّث الصفحة تلقائيًا مع نشر كل جزء.
          </p>
        </div>

        {/* اقتراحات لك — شخصية، دعوة لا إلزام */}
        <div className="mt-6">
          <KurstipsKort antal={3} rubrik="اقتراحات لك" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
          <KursSok
            lankPrefix="/ar"
            kurser={courses.map((c) => ({
              slug: c.slug,
              title: c.title,
              category: c.category,
              kapitel: c.chapters.length,
              minuter: c.totalMinutes || c.minutes,
              learn: c.learn,
              xp: c.xp,
              quiz: c.chapters.reduce((s, k) => s + ((k as { quiz?: unknown[] }).quiz?.length ?? 0), 0),
            }))}
          />
          <aside className="h-fit"><FortsattPanel /></aside>
        </div>

        {/* شريط الأرقام — من المصدر الوحيد للأرقام (src/lib/siffror)،
            مرآة عربية لشريط الإثبات الاجتماعي في الصفحة السويدية */}
        <section
          aria-label="AK1A Research Lab بالأرقام"
          className="marin-panel relative overflow-hidden rounded-3xl p-6 sm:p-10"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute inset-3 rounded-2xl border border-gold/20" />
          </div>
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              AK1A Research Lab · بالأرقام
            </p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl">
              المكتبة كاملة. صفر كرونات. مبنية لتفهمها فعلًا.
            </h2>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  tal: `${SIFFROR.kurser.toLocaleString("en-US")}`,
                  huvud: "دورة",
                  etikett:
                    "من أول دورة تأسيسية لك إلى أعمق دورات الأنظمة — كل فصل خطوة في الرحلة",
                },
                {
                  tal: `${SIFFROR.bokmaster.toLocaleString("en-US")}`,
                  huvud: "كتابًا",
                  etikett:
                    "مغطاة فصلًا ففصلًا — غراهام وداموداران وميرفي… الكانون الكامل خطوة بخطوة بالسويدية",
                },
                {
                  tal: `${SIFFROR.quiz.toLocaleString("en-US")}`,
                  huvud: "سؤال اختبار",
                  etikett: "تجعلك تفكر — لا تقرأ فحسب. هناك حيث ترسخ المعرفة",
                },
                {
                  tal: "100 %",
                  huvud: "مجانًا",
                  etikett:
                    "في المرحلة 1 — المكتبة كلها، دون مقابل، للأبد. نكسب بثقة عملائنا",
                },
              ].map((s) => (
                <div
                  key={s.huvud}
                  className="rounded-2xl border border-gold/25 bg-black/20 p-5"
                >
                  <p className="font-serif text-4xl font-black tabular-nums text-gold">
                    {s.tal}
                  </p>
                  <p className="mt-2 font-serif text-lg font-semibold">{s.huvud}</p>
                  <p className="mt-1 text-xs leading-relaxed opacity-70">{s.etikett}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 rounded-xl border border-gold/20 bg-black/20 px-4 py-3 text-center text-sm tracking-wide sm:text-base">
              {SIFFROR.kurser} دورة · {SIFFROR.bokmaster} كتابًا فصلًا ففصلًا ·{" "}
              {SIFFROR.quiz.toLocaleString("en-US")} سؤال اختبار ·{" "}
              <span className="font-semibold text-gold">100 % مجانًا في المرحلة 1</span>
            </p>
          </div>
        </section>
      </div>
    </SeoPageShell>
  );
}
