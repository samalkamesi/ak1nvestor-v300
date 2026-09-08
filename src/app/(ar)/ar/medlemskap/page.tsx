import Link from "next/link";
import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { JsonLd, SITE_URL } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { SIFFROR } from "@/lib/siffror";

export const dynamic = "force-static";

/** أرقام عربية شرقية مع فاصل الآلاف العربي (ar-EG: ٨٬٢١١). */
const num = (n: number) => n.toLocaleString("ar-EG");

/**
 * المرآة العربية لصفحة /medlemskap (الموجة 51 — الوكيل S2).
 *
 * ترجمة كاملة للصفحة السويدية — كل قسم وقائمة وسعر وضمان منقول ١:١.
 * نصوص عربية مستقلة؛ لا سلاسل مشتركة مع الصفحة السويدية. عناوين الدورات
 * تُجلب حيّة من فهرس الدورات (عناوين الكتب الإنجليزية الأصلية تبقى
 * لاتينية). المصطلحات المالية اللاتينية (ROE/EV-EBITDA/NCAV/V01–V20)
 * تبقى لاتينية. الأسعار تحتفظ بـ kr.
 *
 * المرحلة ٢ (النموذج الجديد): ١٨ عملًا أساسيًا مرجعيًا حسب الفئة —
 * التقييم، القوائم المالية، تمويل الشركات، الاستثمار القيمي + التعمق
 * الفائق في AKM1. الجوهر هو الموازنة الشاملة للمؤشرات التحليلية
 * العشرين (V01–V20). لا تدريب على التحليل الفني — معرفة أساسية
 * للتوجّه فقط (الاحتراف = المرحلة ٣). تعكس FAS2_KURSLISTA في
 * src/lib/kurs-access.ts.
 */
const FAS2_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "كتب التقييم المرجعية",
    pitch:
      "غراهام ودود، داموداران، ماكنزي، ويليامز، رابابورت وماوبوسين — فنّ وزن الشركة في كفّ اليد.",
    slugs: [
      "security-analysis",
      "investment-valuation",
      "valuation-measuring-managing",
      "the-theory-of-investment-value",
      "expectations-investing",
    ],
  },
  {
    kategori: "القوائم المالية والمحاسبة",
    pitch:
      "بنمان، مولفورد وكوميسكي، أوغلوف، شيليت، غراهام — اعثر على جودة الأرباح واقرأ الروايات على حقيقتها.",
    slugs: [
      "financial-statement-analysis-and-security-valuation",
      "creative-cash-flow-reporting",
      "quality-of-earnings",
      "financial-shenanigans",
      "interpretation-of-financial-statements",
    ],
  },
  {
    kategori: "تمويل الشركات ورأس المال",
    pitch:
      "هيغينز، بريلي، ويتمان — هيكل رأس المال ورياضيات التدفقات النقدية بمستوى ماجستير إدارة الأعمال (MBA).",
    slugs: [
      "analysis-for-financial-management",
      "principles-of-corporate-finance",
      "distress-investing",
    ],
  },
  {
    kategori: "الأعمال الأساسية في الاستثمار القيمي + AKM1",
    pitch:
      "كلارمان، غرينوالد، غراي وكارلايل، آينهورن — ونموذجنا الخاص AKM1 في أعمق مستوياته.",
    slugs: [
      "margin-of-safety",
      "value-investing-from-graham-to-buffett",
      "quantitative-value",
      "fooling-some-of-the-people",
      "akm1-den-kontroversiella-modellen",
    ],
  },
];

/**
 * المرحلة ٣: دورات المنظومة الديناميكية البالغ عددها ٢٤ — ٣ أعمال
 * رائدة + ١٧ عملًا مرجعيًا في التحليل الفني + ٤ في سيكولوجية التداول.
 * تعكس FAS3_KURSER في kurs-access.ts.
 */
const FAS3_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "الأعمال الرائدة في المنظومة",
    pitch:
      "حيث يتوقف التحليل الأساسي عن كونه ساكنًا — المتغيرات تصبح سلاسل زمنية، والقيمة تلتقي بالأمواج.",
    slugs: [
      "ak1ts-vaglarans-hierarki",
      "vagfundament-variablerna-som-tidsserier",
      "konfluens-varde-moter-vagor",
    ],
  },
  {
    kategori: "التحليل الفني بمستوى الاحتراف",
    pitch:
      "إليوت، مورفي، نيسون، بولينجر، إدواردز وماجي، بولكوفسكي، دي مارك، برينغ، إلدر، تورسيل ومقتفو الاتجاه — ١٧ عملًا مرجعيًا.",
    slugs: [
      "elliott-wave-principle",
      "technical-analysis-of-stock-trends",
      "technical-analysis-financial-markets",
      "japanese-candlestick-charting",
      "encyclopedia-of-chart-patterns",
      "the-visual-investor",
      "intermarket-analysis",
      "martin-pring-on-market-momentum",
      "the-master-swing-trader",
      "fibonacci-applications",
      "come-into-my-trading-room",
      "teknisk-analys-med-johnny-torssell",
      "bollinger-on-bollinger-bands",
      "the-new-science-of-technical-analysis",
      "way-of-the-turtle",
      "the-complete-turtletrader",
      "the-trend-following-bible",
    ],
  },
  {
    kategori: "سيكولوجية التداول والاقتصاد العصبي",
    pitch:
      "العدو يجلس إلى مكتبك أنت — دوغلاس وكوتس وشول وتسفايغ يعلّمونك كيف تتعرّف عليه.",
    slugs: [
      "trading-in-the-zone",
      "the-hour-between-dog-and-wolf",
      "market-mind-games",
      "your-money-and-your-brain",
    ],
  },
];

export const metadata: Metadata = {
  title: "المرحلة ١ مجانية — المرحلة ٢ الموازنة الشاملة — المرحلة ٣ المنظومة | AK1A",
  description:
    "المرحلة ١: جميع الدورات الأساسية، والكتب المغطّاة بالكامل، والموجّه الذكي، والحاسبة ونظام المحافظ — مجانًا إلى الأبد. المرحلة ٢: لا جديد — المؤشرات التحليلية العشرون نفسها (V01–V20)، لكنها الآن موزونة معًا بالطريقة الصحيحة. ساعات غير محدودة مع المؤسس حتى تستحق لقب محلل أسهم مستقل. لا يُدرَّس التحليل الفني في المرحلة ١/٢ — الاحتراف هو المرحلة ٣. ٩٬٩٩٩ kr / ١٣٬٩٩٩ kr، وضمان رضا لمدة ٩٠ يومًا: الدفع بعد ٩٠ يومًا فقط إن كنت راضيًا.",
  keywords: [
    "تعليم أسواق الأسهم مجانًا",
    "التحليل الأساسي مجانًا",
    "عضوية AKM1",
    "تعليم تحليل الأسهم",
    "الموازنة بين المؤشرات الأساسية",
    "تعليم التقييم داموداران",
    "منظومة التحليل الفني",
    "تدريب الممثلين",
    "BOKMASTER",
  ],
  alternates: {
    canonical: `${SITE_URL}/ar/medlemskap`,
    languages: {
      "sv-SE": `${SITE_URL}/medlemskap`,
      en: `${SITE_URL}/en/medlemskap`,
      ar: `${SITE_URL}/ar/medlemskap`,
      "x-default": `${SITE_URL}/medlemskap`,
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
    title: "المرحلة ١ مجانية — المرحلة ٢ الموازنة الشاملة — المرحلة ٣ المنظومة | AK1A",
    description:
      "رؤيتنا: المعرفة حق. المرحلة ١ مجانية إلى الأبد — والمرحلة ٢ توازن المؤشرات العشرين معًا، والمرحلة ٣ هي المنظومة الديناميكية.",
    url: `${SITE_URL}/ar/medlemskap`,
    siteName: "AK1A Research Lab",
    type: "website",
    locale: "ar_AR",
    alternateLocale: ["sv_SE", "en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "العضوية — المرحلة ١ مجانية إلى الأبد | AK1A",
    description:
      "المرحلة ١: كل الدورات الأساسية والأدوات، مجانًا إلى الأبد. المرحلة ٢: الموازنة الشاملة للمؤشرات العشرين. المرحلة ٣: المنظومة الديناميكية.",
  },
};

/** ضمان الرضا لمدة ٩٠ يومًا — يُعاد استخدامه في قطاعي المرحلة ٢ والمرحلة ٣. */
function GarantiRuta({ mork }: { mork?: boolean }) {
  return (
    <div
      className={`mt-4 rounded-lg border border-dashed p-4 text-xs leading-relaxed ${
        mork
          ? "border-[#E8C766]/50 bg-[#0A1422]/60 text-[#EDE6D6]/85"
          : "border-gold/50 bg-paper text-muted-foreground"
      }`}
    >
      <p className={`font-bold tracking-[0.15em] ${mork ? "text-[#E8C766]" : "text-gold"}`}>
        ضمان الرضا لمدة ٩٠ يومًا
      </p>
      <p className="mt-1.5">
        ستكون راضيًا — نحن نضمن ذلك. وإلا فلا تدفع شيئًا. بصياغة تقنية: لا
        تدفع شيئًا خلال التسعين يومًا الأولى؛ ولا يتم الدفع إلا بعد ٩٠
        يومًا، وفقط إذا بقيت راضيًا.{" "}
        <Link
          href="/villkor"
          className={`underline ${mork ? "hover:text-[#EDE6D6]" : "hover:text-foreground"}`}
        >
          الشروط (البنود ٥–٦)
        </Link>{" "}
        تمنح الضمان أساسه القانوني — ويبقى حقك النظامي في العدول وفق
        القانون السويدي للعقود والتجارة عن بُعد (2005:59) قائمًا بالتوازي
        دائمًا.
      </p>
    </div>
  );
}

/** البرهان الاجتماعي — نظيرة ثابتة مُترجمة للمكوّن السويدي SocialProof. */
function SocialtBevis({ fas1Antal }: { fas1Antal: number }) {
  const roster = [
    {
      citat: "أول مرة أفهم أسهمي فعلًا",
      namn: "كالي",
      typ: "المستوى ١٢ · ٦ دورات مكتملة",
    },
    {
      citat: "أسئلة الاختبار تجبرني على التفكير، لا على القراءة فقط",
      namn: "ماريا",
      typ: "المستوى ٢٨ · ٢١ دورة مكتملة",
    },
    {
      citat: "أساس الأمواج غيّر نظرتي إلى محفظتي",
      namn: "إريك",
      typ: "المستوى ٤١ · ٣٧ دورة مكتملة",
    },
  ];
  return (
    <section className="marin-panel relative overflow-hidden rounded-2xl p-6 sm:p-10">
      <div className="relative">
        <div className="flex items-center gap-2">
          <VarumarkesLogo storlek="sm" medText={false} klass="scale-75" />
          <p className="text-[10px] font-semibold tracking-[0.3em] text-gold">
            AK1A Research Lab · بالأرقام وبأصوات الطلاب
          </p>
        </div>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight text-[#EDE6D6] sm:text-4xl">
          المكتبة كاملة. صفر كرون. مبنية لتفهم حقًا.
        </h2>
        <p className="mt-6 rounded-xl border border-gold/20 bg-black/20 px-4 py-3 text-center text-sm leading-relaxed tracking-wide text-[#EDE6D6]/90 sm:text-base">
          {num(SIFFROR.kurser)} دورة · {num(SIFFROR.bokmaster)} كتاب فصلًا
          فصلًا · {num(SIFFROR.quiz)} سؤال اختبار ·{" "}
          <span className="font-semibold text-gold">١٠٠٪ مجاني في المرحلة ١</span>
        </p>
        <div className="mt-8 flex items-center gap-4">
          <h3 className="font-serif text-xl font-semibold text-[#EDE6D6]">
            ماذا يقول الطلاب
          </h3>
          <span
            className="h-px flex-1 bg-gradient-to-l from-gold/50 to-transparent"
            aria-hidden="true"
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {roster.map((e) => (
            <figure
              key={e.namn}
              className="flex h-full flex-col justify-between rounded-2xl border border-gold/25 bg-black/20 p-5"
            >
              <div>
                <p className="text-sm tracking-widest" aria-label="٥ من ٥ نجوم">
                  ⭐⭐⭐⭐⭐
                </p>
                <blockquote className="mt-3 font-serif text-lg italic leading-snug text-[#EDE6D6]">
                  &ldquo;{e.citat}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-5 text-sm text-[#EDE6D6]/85">
                <span className="font-semibold">{e.namn}</span>
                <span className="opacity-60"> · {e.typ}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center gap-5 rounded-2xl border border-gold/25 bg-black/20 p-6 text-center sm:flex-row sm:justify-between sm:text-right">
          <div>
            <p className="font-serif text-xl font-semibold text-[#EDE6D6]">
              انضم مجانًا — يستغرق ذلك ٣٠ ثانية.
            </p>
            <p className="mt-1 max-w-md text-sm text-[#EDE6D6]/80 opacity-70">
              كل محلل بدأ بمتغيره الأول — وجميع الدورات الأساسية البالغ
              عددها {num(fas1Antal)} مفتوحة من الثانية الأولى.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ar/logga-in"
              className="btn-guld-signatur inline-flex min-h-[44px] items-center gap-2 px-7 py-3 text-sm"
            >
              انضم مجانًا — يستغرق ٣٠ ثانية
            </Link>
            <Link
              href="/kurser"
              className="btn-marin inline-flex min-h-[44px] items-center px-6 py-3 text-sm"
            >
              استكشف الدورات
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-[#EDE6D6]/70 opacity-50">
          لا بيانات بطاقة. ولا بيع. المرحلة ١ مجانية — إلى الأبد. تُعرض
          أصوات الطلاب بالاسم الأول وبمستوياتهم الحقيقية.
        </p>
      </div>
    </section>
  );
}

export default function ArMedlemskapPage() {
  const kurserLista = getCourseList();
  const kurser = kurserLista.length;
  const lasSlugs = new Set([
    ...FAS2_KURSLISTA.flatMap((k) => k.slugs),
    ...FAS3_KURSLISTA.flatMap((k) => k.slugs),
  ]);
  const fas2Antal = FAS2_KURSLISTA.reduce((s, k) => s + k.slugs.length, 0);
  const fas3Antal = FAS3_KURSLISTA.reduce((s, k) => s + k.slugs.length, 0);
  const fas1Antal = kurser - lasSlugs.size;
  const fas1Bokmaster = kurserLista.filter(
    (c) => c.category === "BOKMASTER" && !lasSlugs.has(c.slug)
  ).length;
  // نوع CourseChapter لا يتضمن حقل الاختبار (البيانات تتضمنه) — تحويل آمن.
  const quiz = kurserLista
    .filter((c) => !lasSlugs.has(c.slug))
    .reduce(
      (s, c) =>
        s +
        c.chapters.reduce(
          (q, k) => q + ((k as { quiz?: unknown[] }).quiz?.length ?? 0),
          0
        ),
      0
    );
  const titelFor = (slug: string) =>
    kurserLista.find((k) => k.slug === slug)?.title ?? slug;

  return (
    <SeoPageShell wide breadcrumb={[{ name: "البداية", href: "/ar" }, { name: "العضوية" }]}>
      {/* مخطط FAQPage (AI-SEO) — أسئلة المراحل التي يطرحها المستخدمون
          ومساعدات الذكاء الاصطناعي فعلًا؛ والأجوبة مبنية على أرقام الصفحة. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: "ar",
          mainEntity: [
            {
              "@type": "Question",
              name: "ما الفرق بين المرحلة ١ والمرحلة ٢ والمرحلة ٣؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: "المرحلة ١ هي التعليم الأساسي — مجاني إلى الأبد. المرحلة ٢ هي الموازنة الشاملة: المؤشرات التحليلية العشرون نفسها (V01–V20)، موزونة معًا الآن بالطريقة الصحيحة مع مرافقة المؤسس. والمرحلة ٣ هي المنظومة التي يعيش فيها التحليل الفني ورحلة التحليل الكاملة.",
              },
            },
            {
              "@type": "Question",
              name: "هل المرحلة ١ مجانية حقًا؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: `نعم — المرحلة ١ مجانية إلى الأبد: ${num(fas1Antal)} دورة، و${num(fas1Bokmaster)} كتابًا مغطًّى بالكامل، والموجّه الذكي، والحاسبة، ونظام المحافظ.`,
              },
            },
            {
              "@type": "Question",
              name: "كم عدد الدورات والاختبارات المشمولة؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: `${num(SIFFROR.kurser)} دورة في المكتبة كلها وأكثر من ${num(quiz)} سؤال اختبار في المرحلة ١ — وكلها بشرح فوري للإجابة الصحيحة.`,
              },
            },
            {
              "@type": "Question",
              name: "ما هو ضمان الرضا لمدة ٩٠ يومًا؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: "لا تدفع شيئًا خلال التسعين يومًا الأولى؛ ولا يتم الدفع إلا بعد ٩٠ يومًا، وفقط إذا بقيت راضيًا. ويبقى حقك النظامي في العدول قائمًا بالتوازي دائمًا — انظر الشروط.",
              },
            },
            {
              "@type": "Question",
              name: "هل تقدّم AK1A نصائح استثمارية؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: "لا. تُعلّم AK1A محللين أساسيين مستقلين — تحليل تعليمي، وليس نصائح استثمارية أو توصيات بأسهم بعينها أبدًا.",
              },
            },
          ],
        }}
      />
      {/* الحاوية الرئيسية باتجاه القراءة العربية */}
      <div dir="rtl">
        <h1 className="font-serif text-4xl font-bold">
          رؤيتنا: المعرفة حقٌّ للجميع
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          يجب أن يكون التحليل الأساسي في متناول كل إنسان — كالهواء
          والماء. لهذا{" "}
          <strong>المرحلة ١ مجانية تمامًا، إلى الأبد</strong>. نحن لا نربح
          من الناس الذين يريدون أن يتعلّموا. والمرحلة ٢ هي الطريق الأساسي
          السريع إلى الأمام — المؤشرات العشرون نفسها، لكنها الآن{" "}
          <em>موزونة معًا</em> بالطريقة الصحيحة، ومع مرافقة المؤسس إلى
          جانبك — والمرحلة ٣ هي المنظومة التي يبدأ فيها التحليل بالحركة.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          ملاحظة: الأدوات وصفحات الدورات المرتبطة تُفتح اليوم بالسويدية —
          والترجمة جارية.
        </p>

        {/* خط القيمة — الكرم بصياغة صريحة */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { tal: `${num(SIFFROR.kurser)}`, etikett: "دورة في المكتبة — المرحلة ١ مجانية إلى الأبد" },
            { tal: `${num(SIFFROR.bokmaster)}`, etikett: "كتابًا مغطًّى بالكامل، فصلًا فصلًا" },
            { tal: `${num(SIFFROR.quiz)}`, etikett: "سؤال اختبار بقيمة +10 XP لكل منها" },
            { tal: `${num(fas2Antal)}`, etikett: "عملًا أساسيًا مرجعيًا في المرحلة ٢ — التقييم والقوائم المالية والتمويل والاستثمار القيمي: حتى تصل إلى محلل مستقل" },
          ].map((s) => (
            <div key={s.etikett} className="rounded-xl border border-gold/30 bg-card p-4 text-center">
              <div className="font-serif text-3xl font-black text-gold">{s.tal}</div>
              <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{s.etikett}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* المرحلة ١ */}
          <div className="flex flex-col rounded-xl border-2 border-gold bg-card p-7 shadow-lg">
            <span className="mb-2 inline-block w-fit rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-primary-foreground">
              المرحلة ١ · مجانية دائمًا · مفتوحة دائمًا
            </span>
            <h2 className="font-serif text-2xl font-bold">
              كن محلل أسهم مستقلًا
            </h2>
            <p className="mt-1 text-sm italic text-muted-foreground">
              &laquo;حقٌّ نضمنه لكل إنسان.&raquo;
            </p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              {[
                `منهجية AKM1 الأساسية كاملة (V01–V20) — ${num(fas1Antal)} دورة مفتوحة مباشرة، مجانًا`,
                `${num(fas1Bokmaster)} كتاب BOKMASTER فصلًا فصلًا — غراهام، بافيت، ماركس، داموداران، مورفي، سوروس، كانمان…`,
                "جميع الأدوات الأساسية: الموجّه الذكي الذي يعرفك + أداة البيع على المكشوف التي تستجوب فرضياتك",
                "١٤٠ بطاقة مراجعة بالتكرار المتباعد (إبنغهاوس/SM-2)",
                "حاسبة AKM1 + نظام المحافظ مع بيانات أساسية لكل حيازة",
                "المكتبة: قائمة الكتب المرجعية مربوطة بـ AKM1/AK1TS",
                "شهادات، ولوحة صدارة، ونقاط خبرة (XP) ومستويات ١–١٠٠",
                "جميع تحليلات الأسهم وحالات الدرس في المختبر",
                "انضم بعضوية عبر البريد الإلكتروني فقط — دون أي دفع، أبدًا",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-gold">✓</span>
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/kurser"
              className="mt-6 rounded-md bg-gold px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              ابدأ التعلّم الآن — مجانًا
            </Link>
          </div>

          {/* المرحلة ٢ */}
          <div className="flex flex-col rounded-xl border border-gold/40 bg-card p-7">
            <span className="mb-2 inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
              المرحلة ٢ · يتطلب تقديم طلب · ٩٬٩٩٩ kr
            </span>
            <h2 className="font-serif text-2xl font-bold">الطريق الأساسي السريع</h2>
            <p className="mt-1 text-sm italic text-muted-foreground">
              الموازنة الشاملة للمؤشرات العشرين — حتى تحكم حكمًا تستطيع
              الدفاع عنه.
            </p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              {[
                "المؤشرات التحليلية العشرون (V01–V20) — المرحلة ٢ تدرّبك على تحليلها بالطريقة الصحيحة",
                "الموازنة الشاملة — فنّ موازنة المؤشرات بعضها مقابل بعض. هذا جوهر المرحلة ٢: ليس عشرين إجابة منفصلة، بل حكم أساسي واحد",
                "لا محتوى جديد — لا نعلّم شيئًا جديدًا؛ بل نتعمق فيما قابلته بالفعل في المرحلة ١، وعلى مستوى المحلل",
                "ساعات غير محدودة مع المؤسس — لك الوقت الذي يستغرقه الأمر، حتى تستحق لقب محلل أسهم مستقل",
                `${num(fas2Antal)} عملًا أساسيًا مرجعيًا — التقييم (غراهام ودود، داموداران، ماكنزي)، القوائم المالية (بنمان، شيليت، أوغلوف)، التمويل (هيغينز، بريلي)، الاستثمار القيمي (كلارمان، غرينوالد، آينهورن) + AKM1 في أعمق مستوياته`,
                "لا تدريب على التحليل الفني — في المرحلة ٢ (كما في المرحلة ١) نقدّم المعرفة الأساسية عن التحليل الفني كتوجّه عام فقط. مستوى الاحتراف هو المرحلة ٣",
                "تدريب جماعي مع عملاء آخرين",
                "مسار الممثل: الطريق لتصبح ممثلًا لـ AK1nvestor — أن تمثّلنا بجودة",
                "مقترحات شركات للدراسة أثناء التدريب — مفحوصة بالأرقام والمتغيرات",
                "الحق في استخدام الأدوات وخدمات المرحلة ٢ المستقبلية (تطوَّر باستمرار)",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-gold">✓</span>
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            {/* ضمان الرضا لمدة ٩٠ يومًا — وعد المالك، داخل الإطار */}
            <GarantiRuta />

            <div className="mt-4 rounded-lg border border-gold/30 bg-paper p-3 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">لمن — والشرط.</strong>{" "}
              تشترط المرحلة ٢ أن تكون قد أتممت المرحلة ١: يجب أن تكون
              الأسس راسخة (المستوى ٢٥+ إشارة جيدة). والأهم من كل شيء —{" "}
              <em>الرغبة</em> في النجاح بالتحليل الأساسي للأسهم. بلا رغبة
              يصعب التركيز. إن كانت لديك الاثنتان، فسنأخذك حتى النهاية،
              مهما طال الوقت.
            </div>
            <Link
              href="/fas2-ansok"
              className="mt-5 rounded-md border border-gold/50 px-4 py-2.5 text-center text-sm font-semibold hover:bg-gold/10"
            >
              قدّم طلبًا للمرحلة ٢ ← مجانًا، دقيقتان
            </Link>
          </div>
        </div>

        {/* البرهان الاجتماعي — أرقام وأصوات طلاب بعد نظرة المرحلتين ١/٢ */}
        <div className="mt-12">
          <SocialtBevis fas1Antal={fas1Antal} />
        </div>

        {/* المرحلة ٣ — المنظومة الديناميكية */}
        <section className="marin-panel mt-8 rounded-2xl border border-gold/40 p-7 sm:p-9">
          <span className="mb-2 inline-block w-fit rounded-full border border-[#E8C766]/50 px-3 py-0.5 text-xs font-semibold text-[#E8C766]">
            المرحلة ٣ · بعد تطبيق المرحلة ٢ · ١٣٬٩٩٩ kr
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#EDE6D6]">
            المرحلة ٣ — المنظومة الديناميكية
          </h2>
          <p className="mt-1 text-sm italic text-[#E8C766]">
            حيث يبدأ التحليل الأساسي بالحركة.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#EDE6D6]/85">
            المرحلة ٣ هي مرحلة الاعتماد: محفظة تطبيقية وتطبيق عملي. تبدأ
            بعد تطبيق المرحلة ٢ — أولًا الحكم الأساسي (الموازنة الشاملة
            للمؤشرات العشرين)، ثم الجانب الديناميكي. هنا تطبّق وتفهم كيف
            أن التحليل الأساسي ليس ساكنًا: جميع المؤشرات تتحرك ديناميكيًا،
            كسلاسل زمنية لها إيقاعها الخاص. ندمج AKM1 مع AK1TS — الأمواج،
            بعبارة صريحة.
          </p>
          <ul className="mt-5 grid gap-2.5 text-sm text-[#EDE6D6]/85 md:grid-cols-2">
            {[
              `تكامل AKM1 × AK1TS — التحليل المركّب حيث تلتقي القوة الأساسية بالأمواج`,
              "أساس الأمواج — كل متغير أساسي كسلسلة زمنية",
              "رادار التوافق — حيث تلتقي القيمة بالأمواج بالضرورة (خمسة أبعاد)",
              "أمواج المحفظة — ملف الأمواج على الأفق الدقيق والقصير والمتوسط والبعيد والممتد",
              `التحليل الفني بمستوى الاحتراف — ١٧ عملًا مرجعيًا: إليوت، مورفي، نيسون، بولينجر…`,
              "سيكولوجية التداول والاقتصاد العصبي — دوغلاس، كوتس، شول، تسفايغ",
              `${num(fas3Antal)} دورة + محفظة تطبيقية، ومصفوفة متطلبات A–F، واعتماد`,
              "لوحة متابعة، وربط بالذكاء الاصطناعي بأعلى جودة، وتقارير — مرتبطة مباشرة بتحليل الأسهم والمحافظ",
              "الحق في كل التطورات المستقبلية ضمن المرحلة ٣ — كل شيء قيد التطوير وأنت معنا من البداية",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-[#E8C766]">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {/* ضمان الرضا لمدة ٩٠ يومًا — يسري أيضًا على المرحلة ٣ */}
          <GarantiRuta mork />

          {/* إشعار الخطة الشهرية — السعر الصادق */}
          <div className="mt-5 rounded-xl border border-dashed border-[#E8C766]/50 bg-[#0A1422]/60 p-4 text-xs leading-relaxed text-[#EDE6D6]/80">
            <strong className="text-[#E8C766]">السعر الصادق، بصراحة:</strong>{" "}
            بعد إتمام التدريب يمكن الاستمرار في استخدام المنظومة
            التحليلية ولوحة المتابعة عبر خطة شهرية (١٢ شهرًا). أما التدريب
            نفسه فهو لك إلى الأبد.
          </div>
          <Link
            href="/fas3"
            className="mt-5 inline-block rounded-md bg-gold px-4 py-2.5 text-center text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            استكشف المرحلة ٣ ←
          </Link>
        </section>

        {/* بعد التدريب — الأدوات وخدمات الأبحاث والتطورات */}
        <section className="mt-8 rounded-xl border-2 border-gold/50 bg-card p-7">
          <span className="text-[10px] tracking-[0.3em] text-gold">
            بعد التدريب
          </span>
          <h2 className="mt-2 font-serif text-2xl font-bold">
            الأدوات تصبح لك — والتطوير لا يتوقف أبدًا
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            بعد التدريب تحصل على استخدام الأدوات التي يجب أن تكون في
            متناولك: محركات التحليل، والحاسبة، ونظام المحافظ — وخدمات
            الأبحاث التي تنمو من المختبر. وستكون هناك دائمًا تطويرات
            جديدة: <strong>لدى AK1nvestor.com رؤى كبرى</strong>، وأنت معنا
            من البداية.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gold/30 bg-paper p-5">
              <h3 className="font-serif text-lg font-bold">أبحاث محافظ AK1A</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                خدمة الأبحاث لما بعد مقاعد الدراسة: ثلاث مستويات من أبحاث
                المحافظ الشهرية مع درجات AKM1، وحالة الأمواج لكل أفق،
                ومتابعة «آنذاك مقابل الآن». وكطالب في المرحلة ٢ أو ٣ تحصل
                على <strong className="text-foreground">خصم ٢٠٪</strong> —
                دائمًا وتلقائيًا. أبحاث، لا توصيات.
              </p>
              <Link
                href="/prenumeration"
                className="mt-3 inline-block rounded-md border border-gold/50 px-4 py-2 text-xs font-semibold hover:bg-gold/10"
              >
                اطّلع على الاشتراك ←
              </Link>
            </div>
            <div className="rounded-xl border border-gold/30 bg-paper p-5">
              <h3 className="font-serif text-lg font-bold">تطويرات جديدة دائمًا</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                تحليل الأسهم والمحافظ، ولوحة المتابعة، والربط بالذكاء
                الاصطناعي، والتقارير — تُبنى باستمرار، والجودة هي
                المعيار. تدريبك لك إلى الأبد؛ أما الأدوات والخدمات فتحيا
                وتتطور معك.
              </p>
              <Link
                href="/fas3"
                className="mt-3 inline-block rounded-md border border-gold/50 px-4 py-2 text-xs font-semibold hover:bg-gold/10"
              >
                اطّلع على مسار تطوير المرحلة ٣ ←
              </Link>
            </div>
          </div>
        </section>

        {/* المكتبة — قائمة الكتب المرجعية وبيان التحليل الفني */}
        <section className="mt-6 rounded-xl border border-gold/30 bg-card p-6">
          <h2 className="font-serif text-2xl font-bold">
            المكتبة — قائمة الكتب المرجعية مربوطة بـ AKM1/AK1TS
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            كل كتاب في القائمة المرجعية مرتبط بـ <strong>AKM1</strong>
            (V01–V20) و<strong>AK1TS</strong> — حرفيًا: ترى أي متغير وأي
            نظرية يعمّقها كل عمل. وإليك بيانًا صادقًا، بصراحة:{" "}
            <strong className="text-foreground">لا ندرّس التحليل الفني في
            المرحلة ١ أو المرحلة ٢</strong>. هناك نقدّم المعرفة الأساسية
            عن التحليل الفني فقط — كتوجّه عام، لا كموضوع للاحتراف.{" "}
            <strong className="text-foreground">التحليل الفني بمستوى
            الاحتراف هو المرحلة ٣</strong>، حيث ينتمي إليه في المنظومة
            الديناميكية.
          </p>
          <Link
            href="/bibliotek"
            className="mt-4 inline-block rounded-md border border-gold/50 px-4 py-2 text-xs font-semibold hover:bg-gold/10"
          >
            استكشف المكتبة ←
          </Link>
        </section>

        {/* الدورات المتقدمة — المرحلتان ٢ و٣ */}
        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold">
            الدورات المتقدمة — {num(fas2Antal)} عملًا أساسيًا في المرحلة
            ٢، و{num(fas3Antal)} في المرحلة ٣
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            المرحلة ١ تعلّم الأجزاء — متغيرًا متغيرًا، وكتابًا كتابًا.
            والمرحلة ٢ تعمّق الحرفة الأساسية إلى مستوى المحلل، حيث تصبح
            الموازنة الشاملة للمؤشرات العشرين الخطوة المهمة التالية.
            والمرحلة ٣ تفتح المنظومة الديناميكية: الأمواج، والتحليل الفني
            على مستوى الأساتذة، وعلم النفس الكامن خلف قراراتك أنت.
          </p>

          <h3 className="mt-5 font-serif text-lg font-bold">
            المرحلة ٢ — الطريق الأساسي{" "}
            <span className="text-gold">· {num(fas2Antal)} دورة</span>
          </h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {FAS2_KURSLISTA.map((kat) => (
              <div key={kat.kategori} className="rounded-xl border border-gold/30 bg-card p-5">
                <h4 className="text-sm font-semibold text-foreground">
                  {kat.kategori}{" "}
                  <span className="font-normal text-gold">· {num(kat.slugs.length)} دورات</span>
                </h4>
                <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                  {kat.pitch}
                </p>
                <ul className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
                  {kat.slugs.map((s) => (
                    <li key={s} className="flex gap-1.5">
                      <span className="text-gold">·</span>
                      <span>{titelFor(s)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="mt-6 font-serif text-lg font-bold">
            المرحلة ٣ — المنظومة الديناميكية{" "}
            <span className="text-gold">· {num(fas3Antal)} دورة</span>
          </h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            {FAS3_KURSLISTA.map((kat) => (
              <div key={kat.kategori} className="rounded-xl border border-gold/30 bg-card p-5">
                <h4 className="text-sm font-semibold text-foreground">
                  {kat.kategori}{" "}
                  <span className="font-normal text-gold">· {num(kat.slugs.length)} دورات</span>
                </h4>
                <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                  {kat.pitch}
                </p>
                <ul className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
                  {kat.slugs.map((s) => (
                    <li key={s} className="flex gap-1.5">
                      <span className="text-gold">·</span>
                      <span>{titelFor(s)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            كل ما في AK1A Research Lab تعليم تثقيفي في تحليل الأسهم — وليس
            نصائح استثمارية أبدًا، ولا توصيات بشراء أو بيع أبدًا.
            والتحليلات والدورات مبنية على مصادر مفتوحة وافتراضات معلنة.
          </p>
        </section>

        {/* الجديد في المرحلة ٢ مقابل المجاني دائمًا */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border-2 border-gold bg-card p-6">
            <span className="text-[10px] tracking-[0.3em] text-gold">
              مجاني دائمًا · المرحلة ١
            </span>
            <h3 className="mt-2 font-serif text-xl font-bold">
              {num(fas1Antal)} دورة مجانية + جميع الأدوات الأساسية
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {[
                `جميع الدورات الأساسية البالغة ${num(fas1Antal)} — منهجية AKM1 (V01–V20) بالصيغ والعتبات`,
                `${num(fas1Bokmaster)} كتاب BOKMASTER فصلًا فصلًا`,
                "الموجّه الذكي، وأداة البيع على المكشوف، والحاسبة، ونظام المحافظ",
                "بطاقات المراجعة، والمكتبة، والشهادات، ونقاط الخبرة، ولوحة الصدارة",
                "جميع تحليلات الأسهم وحالات الدرس في المختبر",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-gold">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-gold/40 bg-card p-6">
            <span className="text-[10px] tracking-[0.3em] text-gold">
              الجديد في المرحلة ٢
            </span>
            <h3 className="mt-2 font-serif text-xl font-bold">
              الموازنة الشاملة + {num(fas2Antal)} عملًا مرجعيًا + المؤسس
              إلى جانبك
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {[
                "الموازنة الشاملة للمؤشرات العشرين — موازنتها بعضها مقابل بعض حتى حكم أساسي خاص بك",
                `الأعمال الأساسية المرجعية البالغة ${num(fas2Antal)} — التقييم والقوائم المالية والتمويل والاستثمار القيمي + التعمق الفائق في AKM1 (مدرجة أعلاه)`,
                "ساعات غير محدودة مع المؤسس وتدريب جماعي — حتى تستحق لقب محلل مستقل",
                "مسار الممثل — الطريق لتمثيل AK1nvestor بجودة",
                "لا تدريب على التحليل الفني — معرفة أساسية للتوجّه فقط؛ مستوى الاحتراف هو المرحلة ٣",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-gold">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              فصل واضح: <strong className="text-foreground">المرحلة ١</strong>{" "}
              هي الدورات المجانية البالغة {num(fas1Antal)} وجميع الأدوات
              الأساسية. <strong className="text-foreground">المرحلة ٢</strong>{" "}
              هي الطريق الأساسي السريع — لا محتوى جديد، بل الموازنة الشاملة
              للمؤشرات العشرين، والأعمال المرجعية البالغة {num(fas2Antal)}
              مع المؤسس إلى جانبك، ومسار الممثل.{" "}
              <strong className="text-foreground">المرحلة ٣</strong> هي
              المنظومة الديناميكية: الأمواج، والتحليل الفني بمستوى
              الاحتراف، وعلم النفس، ولوحة المتابعة، والذكاء الاصطناعي.
            </p>
          </div>
        </section>

        {/* برهان القيمة عشرة أضعاف */}
        <section className="mt-8 rounded-xl border border-gold/30 bg-card p-6">
          <h2 className="font-serif text-2xl font-bold">لماذا نحن كرماء</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            التعليم التحليلي التقليدي يكلف عشرات آلاف الكرونار ويمنحك
            جزءًا يسيرًا من المنهجية. أما نحن فنمنحك{" "}
            <strong>النظام الأساسي كاملًا مجانًا</strong>: عشرون مؤشرًا
            تحليليًا بصيغها وعتباتها، ومحرك الأمواج الحتمي، و{num(fas1Bokmaster)}{" "}
            كتابًا فصلًا فصلًا مع اختبارات — والصدق بشأن كل جدل. فكرتنا
            التجارية ليست حبس المعرفة: بل تعليم محللين مستقلين قد يرغبون
            يومًا في العمل <em>معنا</em>. وكلما ازداد المتعلّمون، ازدادت
            المنظومة قوة.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-gold/30 bg-card p-6">
          <h2 className="font-serif text-2xl font-bold">وعودنا</h2>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li>✓ المرحلة ١ تبقى مجانية — المعرفة حق</li>
            <li>✓ ضمان رضا لمدة ٩٠ يومًا — الدفع بعد ٩٠ يومًا فقط إن بقيت راضيًا</li>
            <li>✓ كل ما ننشره قابل لإعادة الإنتاج — والمصادر معلنة</li>
            <li>✓ لا نبيع بياناتك أبدًا</li>
            <li>✓ تحليل مالي تعليمي — وليس نصائح استثمارية أبدًا</li>
            <li>✓ GDPR: بياناتك ملكك، وتصديرها عند الطلب</li>
          </ul>
        </section>

        <p className="mt-8 text-sm text-muted-foreground">
          مستعد للبدء؟{" "}
          <Link href="/laroplan" className="underline hover:text-foreground">
            افتح المنهج الدراسي
          </Link>{" "}
          أو{" "}
          <Link href="/profil" className="underline hover:text-foreground">
            اختبر ملفك المعرفي
          </Link>{" "}
          — كلاهما مجاني، إلى الأبد.
        </p>
      </div>
    </SeoPageShell>
  );
}
