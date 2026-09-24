import type { Metadata } from "next";
import Link from "next/link";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { StrukturData } from "@/components/seo/StrukturData";
import { SIFFROR } from "@/lib/siffror";

export const dynamic = "force-static";
// force-static ensamt ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /ar/blogg + /ar/kurser.
export const revalidate = 3600;

/** أرقام عربية شرقية مع فاصل الآلاف العربي (ar-EG: ٨٬٢١١). */
const num = (n: number) => n.toLocaleString("ar-EG");

/**
 * المرآة العربية للصفحة الرئيسية (المرحلة/الموجة 51 — الوكيل S2).
 *
 * الصفحة السويدية (/) هي تطبيق تفاعلي (SPA)؛ هذه المرآة صفحة ترحيب
 * مُصيَّرة بالكامل على الخادم وتحمل الرسالة نفسها بالعربية:
 * العنوان الرئيسي + شريط الأرقام (من src/lib/siffror.ts — المصدر
 * الوحيد للأرقام، أبدًا لا تُكتب يدويًا) + نص الرؤية + أقسام
 * التعلّم/التحليل/التطبيق مع روابط إلى صفحات الأدوات السويدية
 * (تُترجم في مرحلة لاحقة) + دعوة لتسجيل الدخول.
 *
 * جميع النصوص عربية مستقلة — لا سلاسل مشتركة مع الصفحات السويدية.
 */
export const metadata: Metadata = {
  title: "AK1A Research Lab — من التعلّم إلى الدخل | Ak1 Apex Nexus",
  description:
    "المنهجية المؤسسية الوحيدة في السويد، المصمَّمة للأفراد. أعمق من مدونة. أوضح من بنك. أسرع من دورة تعليمية. تحليل مالي تعليمي — وليس نصائح استثمارية أبدًا.",
  keywords: [
    "تحليل الأسهم",
    "التحليل الأساسي",
    "منهجية مؤسسية",
    "AKM1",
    "تعلم تحليل الأسهم",
    "الاستثمار القيمي",
  ],
  alternates: {
    canonical: `${SITE_URL}/ar`,
    languages: {
      "sv-SE": SITE_URL,
      en: `${SITE_URL}/en`,
      ar: `${SITE_URL}/ar`,
      "x-default": SITE_URL,
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
    title: "AK1A Research Lab — من التعلّم إلى الدخل | Ak1 Apex Nexus",
    description:
      "أعمق من مدونة. أوضح من بنك. أسرع من دورة تعليمية. احتفظ بالمعرفة — ونحن ننشرها بسخاء.",
    url: `${SITE_URL}/ar`,
    siteName: SITE_NAME,
    type: "website",
    locale: "ar_AR",
    alternateLocale: ["sv_SE", "en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AK1A Research Lab — من التعلّم إلى الدخل",
    description:
      "المنهجية المؤسسية الوحيدة في السويد، المصمَّمة للأفراد.",
  },
};

/** شريط الأرقام — كل رقم من المصدر الوحيد للحقيقة (src/lib/siffror.ts). */
const BAND = [
  {
    tal: num(SIFFROR.kurser),
    etikett: "دورة تدريبية",
    undertext: "من أساسيات المحاسبة إلى نظرية الأمواج AK1TS.",
    href: "/kurser",
  },
  {
    tal: num(SIFFROR.quiz),
    etikett: "سؤال اختبار",
    undertext: "كل دورة تُختتم باختبار يكشف ثغرات معرفتك بدقة.",
    href: "/kurser",
  },
  {
    tal: num(SIFFROR.bokmaster),
    etikett: "كتاب مرجعي",
    undertext: "من Security Analysis إلى Poor Charlie's Almanack.",
    href: "/kurser",
  },
  {
    tal: "٠",
    suffix: " kr",
    etikett: "للبدء",
    undertext: "المرحلة ١ مجانية — إلى الأبد. بلا بطاقة وبلا التزام.",
    href: "/ar/medlemskap",
  },
];

/** تعلّم / حلّل / طبّق — بنية الموقع حسب المهام، بروابط إلى الأدوات السويدية. */
const SEKTIONER = [
  {
    ikon: "🎓",
    titel: "تعلّم",
    punkter: [
      { text: "المنهج الدراسي", href: "/laroplan", undertext: "خمس مراحل ← محلل مستقل" },
      { text: "جميع الدورات", href: "/kurser", undertext: "المكتبة كاملة مع الاختبارات — تشمل BOKMASTER" },
      { text: "المكتبة", href: "/bibliotek", undertext: "قائمة الكتب المرجعية مربوطة بـ AKM1/AK1TS" },
      { text: "المختبرات", href: "/labb", undertext: "حالات بحثية — نجاحات وإخفاقات" },
      { text: "الشهادات", href: "/certifikat", undertext: "إثبات كفاءتك، المستويات A–D" },
    ],
  },
  {
    ikon: "🔬",
    titel: "حلّل",
    punkter: [
      { text: "حاسبة AKM1", href: "/kalkylator", undertext: "٢٠ متغيرًا أساسيًا · V01–V20" },
      { text: "أساس الأمواج", href: "/vagfundament", undertext: "أمواج أساسية — كل متغير كسلسلة زمنية" },
      { text: "رادار التوافق", href: "/konfluens", undertext: "حيث يلتقي القيمة بالأمواج" },
      { text: "ماسح صافي القيمة (Net-Net)", href: "/netnet", undertext: "أعقاب غراهام السيجارية — فحص NCAV حي" },
      { text: "التحليل الفائق", href: "/superanalys", undertext: "تحليل موجَّه في ٢٤ خطوة · AKM1 + AK1TS" },
      { text: "بانٍ المحافظ", href: "/portfoljbyggare", undertext: "ابنِ بصريًا — وراقب المخاطر والتوزيع لحظيًا" },
    ],
  },
  {
    ikon: "🎯",
    titel: "طبّق",
    punkter: [
      { text: "جلسة اليوم", href: "/dagens-pass", undertext: "خمس دقائق من التدريب السوقي اليومي" },
      { text: "لوحة الصدارة", href: "/topplista", undertext: "الطلاب مرتَّبون حسب نقاط الخبرة (XP)" },
      { text: "الأوسمة والإنجازات", href: "/badges", undertext: "كؤوس تستحق أن تُكسب" },
      { text: "المرحلة ٣ — الاعتماد", href: "/fas3", undertext: "محلل معتمد من AK1A — محفظة تطبيقية وأخلاقيات" },
    ],
  },
];

export default function ArStartPage() {
  return (
    <SeoPageShell lang="ar" wide breadcrumb={[{ name: "البداية", href: "/ar" }, { name: "العربية" }]}>
      <StrukturData
        id="jsonld-webbsida"
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "AK1A Research Lab — من التعلّم إلى الدخل",
          inLanguage: "ar",
          url: `${SITE_URL}/ar`,
          description:
            "صفحة ترحيب عربية مُصيَّرة على الخادم: تعليم تحليل الأسهم بمنهجية مؤسسية للأفراد. تحليل مالي تعليمي — وليس نصائح استثمارية أبدًا.",
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        }}
      />

      {/* الحاوية الرئيسية باتجاه القراءة العربية */}
      <div dir="rtl">
        {/* ── ١ · الافتتاحية — لوحة بحرية بإطار ذهبي ─────────────────────── */}
        <section className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-2 sm:p-3">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-gold/5 via-transparent to-transparent" />
          <div className="relative rounded-xl border border-[#E8C766]/20 p-8 sm:p-12">
            <div className="flex items-center gap-3">
              <VarumarkesLogo storlek="sm" medText={false} />
              <p className="flex flex-wrap items-baseline gap-x-4 font-serif text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
                <span>A · K · 1 · A</span>
                <span>R E S E A R C H</span>
                <span>L A B</span>
              </p>
            </div>

            <h1 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-[1.15] tracking-tight text-[#EDE6D6] sm:text-5xl">
              كن المحلّل الذي يرى ما يفوته الآخرون.
            </h1>

            <p className="mt-5 max-w-2xl font-serif text-lg italic leading-relaxed text-[#E8C766] sm:text-xl">
              تعلّم قراءة الشركات كما يفعل المحللون — من أول تقرير سنوي إلى
              الشهادة. {num(SIFFROR.kurser)} دورة تدريبية و{num(SIFFROR.quiz)}{" "}
              سؤال اختبار، ومعها الأدوات، من اليوم الأول.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ar/logga-in"
                prefetch={false}
                // prefetch={false} (o75, o17/o41/o49-familjen): hero-CTA:n
                // ligger i viewport på spegelns entré ⇒ varje kall mobil-
                // besökare prefetchar /ar/logga-in ×3 (~12,7 KiB, mätt
                // viewportsond 2026-09-19) innan något klickats.
                // Hover-prefetch lever kvar.
                className="btn-guld-signatur inline-flex items-center gap-2 px-8 py-4 text-base font-bold sm:text-lg"
              >
                <span aria-hidden="true">←</span> انضم — مجانًا
              </Link>
              <Link
                href="/kurser"
                prefetch={false}
                // Samma kur som grannknappen: /kurser-flighten är ~37 KiB i
                // tre omgångar (multiomgångs-prefetch, o50 §2-mönstret) —
                // hero + band-kort triggade @930 ms vid kall entré.
                className="inline-flex items-center gap-2 rounded-lg border border-[#E8C766]/50 px-6 py-4 text-base font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/10"
              >
                استكشف الدورات
              </Link>
            </div>

            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-wide text-[#EDE6D6]/70">
              <span>
                <span className="ml-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
                المرحلة ١ مجانية إلى الأبد — ٠ kr
              </span>
              <span>
                <span className="ml-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
                جميع الدورات مفتوحة فورًا
              </span>
              <span>
                <span className="ml-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
                لا حاجة إلى بطاقة
              </span>
            </p>
          </div>
        </section>

        {/* ── ٢ · تنبيه اللغة ─────────────────────────────────────────────── */}
        <div className="mt-6 rounded-xl border border-dashed border-gold/50 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">ملاحظة حول اللغات:</strong>{" "}
          مكتبة الدورات الكاملة متوفرة حاليًا باللغة السويدية — وتجري الآن
          ترجمة الأدوات والدورات. هذه الصفحة، ونظرة العضوية، والبيان، وتسجيل
          الدخول، وصفحة «من نحن» متوفرة بالكامل بالعربية. تعليم — وليس نصائح
          استثمارية أبدًا، بأي لغة كانت.
        </div>

        {/* ── ٣ · شريط الأرقام — أرقام مقيسة من المصدر الوحيد ───────────── */}
        <section className="mt-6">
          <h2 className="font-serif text-2xl font-bold">AK1A في أرقام</h2>
          <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {BAND.map((s) => (
              <Link
                key={s.etikett}
                href={s.href}
                prefetch={false}
                // prefetch={false} (o63-bandmönstret, o75): kort 1–2 ligger
                // inom Next:s ~200 px rootMargin vid kall entré på mobil —
                // bandet ägde 2 av 3 /kurser-omgångar i FÖRE-sonden.
                className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-gold/50 hover:shadow-md"
              >
                <p className="font-serif text-4xl font-bold leading-none text-foreground sm:text-5xl">
                  {s.tal}
                  {s.suffix}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {s.etikett}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {s.undertext}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── ٤ · الرؤية ─────────────────────────────────────────────────── */}
        <section className="mt-10 rounded-xl border-2 border-gold bg-card p-7 shadow-lg sm:p-9">
          <h2 className="font-serif text-3xl font-bold">
            رؤيتنا: المعرفة حقٌّ للجميع
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
            يجب أن يكون التحليل الأساسي في متناول كل إنسان — كالهواء
            والماء. لهذا{" "}
            <strong>المرحلة ١ مجانية تمامًا، إلى الأبد</strong>. نحن لا
            نربح من الناس الذين يريدون أن يتعلّموا. المرحلة ٢ هي الطريق
            الأساسي السريع إلى الأمام — المؤشرات العشرون نفسها، لكنها الآن{" "}
            <em>موزونة معًا</em> بالطريقة الصحيحة، مع مرافقة المؤسس وتوجيهه
            إلى جانبك — والمرحلة ٣ هي المنظومة التي يبدأ فيها التحليل
            بالحركة.
          </p>
          <Link
            href="/ar/medlemskap"
            prefetch={false}
            // prefetch={false} (o75): SSR-spegel — länken observeras av
            // Next:s länk-IO vid scroll; medlemskapsöversikten behövs
            // först vid aktiv läsning. Hover-prefetch lever.
            className="mt-5 inline-block rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            ← اقرأ نظرة العضوية الكاملة
          </Link>
        </section>

        {/* ── ٥ · تعلّم / حلّل / طبّق ────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-serif text-3xl font-bold">
            تعلّم. حلّل. طبّق.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            يتبع الموقع كله مسارًا واحدًا للمهام — من أول متغير إلى محفظتك
            الخاصة. الأدوات تُفتح اليوم بالسويدية؛ والترجمة جارية.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {SEKTIONER.map((sektion) => (
              <div
                key={sektion.titel}
                className="flex flex-col rounded-xl border border-gold/30 bg-card p-6"
              >
                <h3 className="font-serif text-xl font-bold">
                  <span className="ml-2" aria-hidden="true">
                    {sektion.ikon}
                  </span>
                  {sektion.titel}
                </h3>
                <ul className="mt-4 flex-1 space-y-3 text-sm">
                  {sektion.punkter.map((p) => (
                    <li key={p.href + p.text}>
                      <Link
                        href={p.href}
                        prefetch={false}
                        // prefetch={false} (o75): 15 djuplänkar till tunga
                        // verktygsrutter (kalkylator, superanalys,
                        // portfoljbyggare …) — vid scrollning prefetchar
                        // varje kort hela ruttbuntar som få läser.
                        className="font-semibold text-foreground underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
                      >
                        {p.text}
                      </Link>
                      <span className="block text-xs leading-relaxed text-muted-foreground">
                        {p.undertext}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── ٦ · الدعوة الختامية ────────────────────────────────────────── */}
        <section className="mt-10">
          <div className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-2 sm:p-3">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-gold/5 via-transparent to-transparent" />
            <div className="relative flex flex-col items-center rounded-xl border border-[#E8C766]/20 px-6 py-12 text-center sm:px-12">
              <p className="font-serif text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
                AK1A Research Lab · المرحلة ١
              </p>
              <h2 className="mt-4 max-w-2xl font-serif text-3xl font-bold leading-tight text-[#EDE6D6] sm:text-4xl">
                دورتك الأولى تبدأ خلال ٣٠ ثانية.
              </h2>
              <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-[#E8C766] sm:text-lg">
                أنشئ حسابًا مجانيًا — تُفتح جميع الدورات البالغ عددها{" "}
                {num(SIFFROR.kurser)} فورًا.
              </p>
              <Link
                href="/ar/logga-in"
                prefetch={false}
                // prefetch={false} (o75): sidans botten — prefetch vid
                // scroll är ren spill för den som läst klart; hover lever.
                className="btn-guld-signatur mt-8 inline-flex items-center gap-2 px-8 py-4 text-base font-bold sm:text-lg"
              >
                <span aria-hidden="true">←</span> انضم — مجانًا
              </Link>
              <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs tracking-wide text-[#EDE6D6]/70">
                <span>٠ kr إلى الأبد</span>
                <span aria-hidden="true">·</span>
                <span>لا حاجة إلى بطاقة</span>
                <span aria-hidden="true">·</span>
                  <span>
                    متردد؟{" "}
                    <Link
                      href="/kurser"
                      prefetch={false}
                      // prefetch={false} (o75, o63-mikro-raden): tveksam-
                      // länken i slut-CTA:n — samma /kurser-bunt redan
                      // servad av hover vid verklig intent.
                      className="font-semibold text-[#E8C766] hover:underline"
                    >
                      تصفّح الدورات أولًا
                    </Link>
                  </span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </SeoPageShell>
  );
}
