import type { Metadata } from "next";
import Link from "next/link";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Fas3Cert } from "@/components/ak1a/fas3-cert";
import { getCourseList } from "@/lib/content";
import { spegelMetadata, spegelWebsiteJsonLd } from "@/lib/spegel-metadata";
import { JsonLd } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * /ar/fas3 — مرآة كاملة للصفحة السويدية /fas3 (الموجة 51، الوكيل S3).
 * كل النصوص مترجمة إلى العربية الفصحى الحديثة بمصطلحات مالية دقيقة،
 * والمحتوى يقرأ من اليمين إلى اليسار (dir="rtl")، وأداة التقدم Fas3Cert
 * معاد استخدامها كما هي. عناوين الدورات تُجلب ديناميكيًا من كتالوج
 * الدورات (عناوين سويدية — المرحلة 3 من خطة اللغات). تُحتفظ بالاختصارات
 * اللاتينية (AKM1 وAK1TS وEMH وDCF) وبالأسعار بصيغة SEK وبالأرقام اللاتينية.
 */

/**
 * دورات المرحلة 3 الأربع والعشرون، حسب الفئة (3 سفن قيادية للنظام
 * البيئي + 17 عملًا كلاسيكيًا في التحليل الفني + 4 في علم نفس التداول).
 * مرآة لقائمة FAS3_KURSLISTA السويدية.
 */
const FAS3_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "سفن النظام البيئي القيادية",
    pitch:
      "حيث يكف التحليل الأساسي عن كونه ساكنًا — المتغيرات تصبح سلاسل زمنية، والقيمة تلتقي بالموجات، والأجزاء تصبح نظامًا بيئيًا.",
    slugs: [
      "ak1ts-vaglarans-hierarki",
      "vagfundament-variablerna-som-tidsserier",
      "konfluens-varde-moter-vagor",
    ],
  },
  {
    kategori: "التحليل الفني على مستوى الإتقان",
    pitch:
      "الأعمال الكلاسيكية السبعة عشر — إليوت وميرفي ونايسن وبولينجر وإدواردز وماجي وبولكوفسكي وديمارك وبرينغ وإلدر وتورسيل ومتبعو الاتجاه. في المرحلة 3 تُقرأ لا كتاريخ بل كآلات عزف داخل النظام البيئي.",
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
    kategori: "علم نفس التداول والاقتصاد العصبي",
    pitch:
      "العدو يجلس على مكتبك أنت — دوغلاس وكويتس وشول وزفايغ يعلّمونك التعرف عليه.",
    slugs: [
      "trading-in-the-zone",
      "the-hour-between-dog-and-wolf",
      "market-mind-games",
      "your-money-and-your-brain",
    ],
  },
];

/** بنود المحتوى — ما تمنحك المرحلة 3. */
const INNEHALL = [
  {
    rubrik: "تكامل AK1TS × AKM1",
    text: "التحليل المركّب حيث تلتقي القوة الأساسية بالموجات: متغيرات AKM1 وتسلسل موجات AK1TS يندمجان في إجابة واحدة متصلة — ليست صورتين منفصلتين، بل صورة واحدة.",
  },
  {
    rubrik: "أساس الموجات",
    text: "كل متغير أساسي كسلسلة زمنية. P/E والهوامش والنمو — لا يوجد مقياس يكون نقطة على مقياس مدرّج؛ كل شيء منحنى بإيقاعه الخاص، وهنا تتعلم قراءته.",
  },
  {
    rubrik: "رادار التلاقي",
    text: "حيث تلتقي القيمة بالموجات حتمًا — عبر خمسة أبعاد يجب أن تتكاتف قبل أن يُسمح لأي استنتاج بالهبوط. أرضية القيمة أولًا، والموجات ثانيًا.",
  },
  {
    rubrik: "موجات المحفظة",
    text: "الملف الموجي لمحفظتك على الآفاق الدقيقة والقصيرة والمتوسطة والطويلة والمِغا — الكل يتحرك، لا الشركات المنفردة فقط.",
  },
  {
    rubrik: "التحليل الفني على مستوى الإتقان",
    text: "17 عملًا كلاسيكيًا: إليوت وميرفي ونايسن وبولينجر وإدواردز وماجي وبولكوفسكي وتورسيل وغيرهم — تُقرأ فصلًا ففصلًا كآلات حية.",
  },
  {
    rubrik: "علم نفس التداول والاقتصاد العصبي",
    text: "دوغلاس وكويتس وشول وزفايغ — المعركة تخاض في العقل، والنظام البيئي يقيس السلوك يوميًا.",
  },
  {
    rubrik: "حق في كل التطورات المستقبلية",
    text: "تحليل الأسهم والمحافظ، ولوحة المعلومات، والربط المباشر بالذكاء الاصطناعي بأعلى جودة، والتقارير وغيرها — كل شيء قيد التطوير، وأنت موجود منذ البداية.",
  },
] as const;

/** مصفوفة المتطلبات — ستة معايير متساوية الوزن، بتقدير A–F لكل منها. */
const KRAV = [
  {
    kriterium: "التغطية المنهجية",
    a: "جميع الخطوات الـ 24 منجزة، والمتغيرات مبرَّرة لكل شركة، والأبعاد الأربعة حاضرة عبر العمل كله.",
    f: "متغيرات مرقّمة دون تسبيب؛ خطوات متجاوزة.",
  },
  {
    kriterium: "الصدق الإحصائي",
    a: "أصوات مستقلة مطلوبة قبل الاستنتاج، والمعايرة معلَنة، والتلاقي متدرّج.",
    f: "«كل شيء يشير إلى الاتجاه نفسه» دون رقابة مستقلة؛ احتمالات بالحدس.",
  },
  {
    kriterium: "العرض والإثبات",
    a: "أرقام مسندة إلى مصادرها، وعرض pro forma عند كسر النظام، وقسم لجودة الأرباح في مكانه.",
    f: "تقييمات بمضاعفات غير مدققة ضد تقارير الشركة نفسها.",
  },
  {
    kriterium: "القابلية للدحض",
    a: "كل فرضية بنقطة انكسار وإجراء مرتبط؛ والمتابعة ترقّم التوقعات القديمة.",
    f: "سيناريوهات دون شروط إبطال؛ لا متابعة.",
  },
  {
    kriterium: "الانفتاح على الجدل",
    a: "حجج الخصوم مسموعة ومُجابة؛ والتقديرات وفجوات البيانات معلَنة.",
    f: "تفكير تأكيدي فحسب.",
  },
  {
    kriterium: "التواصل",
    a: "تقرير مقروء لغير المتخصص دون فقدان الإحكام؛ وإقرار المخاطر في مكانه.",
    f: "عرض غير مفهوم أو مضلل.",
  },
] as const;

/** محفظة التطبيق العملي — ما يُحتسب. */
const PORTFOLJ = [
  {
    ikon: "🏅",
    rubrik: "10 تحليلات فائقة كاملة",
    text: "عشر شركات مختلفة مع شرط تنويع: 4 قطاعات على الأقل، وسهم شركات كبرى واحد على الأقل وسهم صغيرة واحد. كل تحليل كامل تحفظه في الأداة يُحتسب تلقائيًا — تنمو المحفظة وأنت تتمرن.",
    auto: true,
  },
  {
    ikon: "📡",
    rubrik: "4 قرارات تلاقٍ كاملة على الأقل",
    text: "مرتبطة بتحليلاتك الفائقة: أرضية القيمة قبل الموجات، وخمسة أصوات مستقلة يجب أن تتكاتف قبل أن يُسمح لأي استنتاج بالهبوط.",
    auto: true,
  },
  {
    ikon: "📊",
    rubrik: "تقريران جاهزان للطباعة من منشئ التقارير على الأقل",
    text: "تقييم بالمضاعفات وDCF مع مصفوفة الحساسية، وثلاثة سيناريوهات، ومونت كارلو/بايز/كيلي، ومصفوفة مخاطر ومصفوفة محفزات — واحد على الأقل بالصيغة القصيرة عن شركة كبرى، لتُظهر أنك تعرف متى تكون الأدوات الأثقل زائدة عن الحاجة.",
    auto: true,
  },
  {
    ikon: "🔁",
    rubrik: "تحليل متابعة واحد على الأقل",
    text: "إعادة فتح تحليل سابق لك: تُرقّم نقاط الانكسار ويُعرض التاريخ المُعلَّم. روح الشهادة — القدرة على محاكمة عملك أنت.",
    auto: false,
  },
  {
    ikon: "⚔️",
    rubrik: "تحليل جدل مفتوح واحد على الأقل",
    text: "كتابيًا: كيف سيهاجم الخصوم استنتاجك (EMH، والمسيرة العشوائية، والنقد الأكاديمي للتحليل الفني، وتقليد عوامل الكمّ) — وردُّك أنت. صدق مثير للجدل، محوَّل إلى كفاءة قابلة للاختبار.",
    auto: false,
  },
] as const;

/** وعود وحدة الأخلاق الثلاثة القابلة للاختبار. */
const LOFTEN = [
  {
    nr: "1",
    namn: "اعرض وجهة نظر الخصوم",
    text: "كل تحليل في المحفظة يُظهر كيف يفكر الخصوم — قبل استنتاجك أنت. تحليل الجدل المفتوح هو رأس هذا الوعد.",
  },
  {
    nr: "2",
    namn: "أعلِن قبل النتائج",
    text: "أوزان النظرية وجدول الترقيم ومصادر البيانات تُنشر في التقرير قبل الاستنتاج. التوصية تتبع الجدول — وليس العكس أبدًا.",
  },
  {
    nr: "3",
    namn: "القابلية للدحض",
    text: "لا فرضية دون نقطة انكسار، ولا سيناريو دون شروط إبطال — ومتابعة قبل أي تحليل جديد.",
  },
] as const;

/** دورة ÅKU — صيانة سنوية للشهادة. */
const AKU = [
  {
    ikon: "🏅",
    text: "تحليل محفظة جديد واحد — تحليل فائق + قراءة تلاقٍ عن شركة حالية.",
  },
  {
    ikon: "🔁",
    text: "جولة تحقق واحدة من توقعاتك القديمة — مع إعلان درجة الدقة.",
  },
  {
    ikon: "⚖️",
    text: "مناقشة أخلاقية واحدة حول حالة راهنة (نحو ساعتين).",
  },
] as const;

export const metadata: Metadata = spegelMetadata({
  lang: "ar",
  sida: "fas3",
  title: "المرحلة 3 — النظام البيئي الديناميكي | AK1A",
  description:
    "المرحلة 3 هي مرحلة الشهادة — محفظة تطبيق عملي وتطبيق للمنهج — وحيث يبدأ التحليل الأساسي بالحركة: لا قيمة لمؤشر تكون ساكنة، بل سلسلة زمنية بإيقاعها الخاص. تكامل AKM1 × AK1TS، وأساس الموجات، ورادار التلاقي، وموجات المحفظة، و17 عملًا كلاسيكيًا في التحليل الفني وعلم نفس التداول — إضافة إلى لوحة المعلومات والربط بالذكاء الاصطناعي والحق في كل التطورات المستقبلية. السعر 13,999 SEK مع ضمان رضا 90 يومًا. تبدأ بعد تطبيق المرحلة 2. تعليم قائم على البحث — أبدًا ليس نصائح استثمارية.",
  keywords: [
    "النظام البيئي المرحلة 3",
    "تكامل AKM1 AK1TS",
    "أساس الموجات السلاسل الزمنية",
    "التلاقي بين القيمة والموجات",
    "التحليل الفني مستوى الإتقان",
    "تعليم موجات إليوت",
    "علم نفس التداول والاقتصاد العصبي",
    "موجات المحفظة",
  ],
});

export default function Fas3PageAr() {
  const katalog = getCourseList();
  const titelFor = (slug: string) =>
    katalog.find((k) => k.slug === slug)?.title ?? slug;
  const antalKurser = FAS3_KURSLISTA.reduce((s, k) => s + k.slugs.length, 0);

  return (
    <SeoPageShell
      breadcrumb={[{ name: "الرئيسية", href: "/ar" }, { name: "المرحلة 3 — النظام البيئي" }]}
      wide
    >
      <JsonLd data={spegelWebsiteJsonLd("ar")} />

      <div dir="rtl">
        {/* ── البطل — لوحة مارين: التحليل الأساسي يبدأ بالحركة ─────────── */}
        <section className="marin-panel relative overflow-hidden rounded-3xl border-2 border-gold/60 p-7 shadow-2xl sm:p-12">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
            <span className="font-serif text-[150px] font-black tracking-tight">المرحلة 3</span>
          </div>
          <div className="pointer-events-none absolute inset-2 rounded-2xl border border-[#E8C766]/30" aria-hidden />
          <div className="relative max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
              النظام البيئي الديناميكي · المرحلة 3 · 13,999 SEK
            </p>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#EDE6D6] sm:text-5xl">
              المرحلة 3 — حيث يبدأ التحليل الأساسي بالحركة
            </h1>
            <p className="mt-4 font-serif text-lg italic leading-relaxed text-[#E8C766] sm:text-xl">
              المؤشرات ليست ثابتة — بل سلاسل زمنية بإيقاعها الخاص.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#EDE6D6]/85 sm:text-base">
              في المرحلة 2 تتعلم وزن شركة في يدك — قوائم مالية وقيمة وحكمًا
              — ووزن المؤشرات التحليلية العشرين معًا في كلٍّ واحد. المرحلة
              3 هي مرحلة الشهادة: محفظة تطبيق عملي وتطبيق للمنهج. تبدأ عندما
              يقف ذلك الحكم واضحًا، وتُظهر ما لا يستطيع أي جدول أرقام
              إظهاره: أن التحليل الأساسي{" "}
              <strong className="text-[#EDE6D6]">ليس ساكنًا أبدًا</strong>.
              كل مؤشر يتحرك — الإيرادات والهوامش والمضاعفات، طوال الوقت.
              هنا نُدمج AKM1 مع AK1TS — الموجات بتعبير أدق — ويصبح التحليل
              نظامًا بيئيًا حيًا.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#innehall"
                className="rounded-md bg-gold px-5 py-3 text-center text-sm font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
              >
                اطّلع على المحتوى ↓
              </a>
              <Link
                href="#krav"
                className="rounded-md border border-[#E8C766]/50 px-5 py-3 text-center text-sm font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/10"
              >
                مصفوفة المتطلبات ومحفظة التطبيق
              </Link>
            </div>
          </div>
        </section>

        {/* ── الشرط المسبق — المرحلة 3 تبدأ بعد تطبيق المرحلة 2 ────────── */}
        <section className="gravor-ram mt-8 rounded-2xl bg-card p-6 sm:p-7">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
            الشرط المسبق — الترتيب غير قابل للتفاوض
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">تبدأ المرحلة 3 بعد تطبيق
            المرحلة 2</strong> — أولًا الحكم الأساسي، ثم الديناميكي. يفترض
            النظام البيئي أنك تجيد أصلًا قراءة القوائم المالية وتقييم شركة
            والدفاع عن استنتاج بالأرقام. ألم تسلك ذلك الطريق؟ يبدأ بـ{" "}
            <Link href="/ar/fas2-ansok" className="underline hover:text-foreground">
              طلب مجاني للمرحلة 2
            </Link>{" "}
            — المسار الأساسي السريع إلى أن تصبح محللًا مستقلًا.
          </p>
        </section>

        {/* ── تقدمك — المادة الخام لمحفظة التطبيق، تُقرأ محليًا ─────────── */}
        <div className="mt-10">
          <Fas3Cert />
        </div>

        <div className="hjarlinje mt-10" />

        {/* ── المحتوى — ما تمنحك المرحلة 3 ────────────────────────────────── */}
        <section id="innehall" className="mt-10 scroll-mt-24">
          <h2 className="font-serif text-2xl font-bold">ما تمنحك المرحلة 3</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            المرحلة 3 هي فرصة التطبيق — وفهم كيف أن التحليل الأساسي ليس
            ساكنًا. كل المؤشرات تتحرك ديناميكيًا، وهنا تحصل على الأدوات
            لتتحرك معها.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {INNEHALL.map((p, i) => (
              <div
                key={p.rubrik}
                className={`relative rounded-2xl border border-gold/30 bg-card p-5 ${
                  i === INNEHALL.length - 1 ? "md:col-span-2 border-gold/50" : ""
                }`}
              >
                <p className="flex items-start gap-2.5 font-serif text-lg font-bold text-foreground">
                  <span className="mt-0.5 shrink-0 text-gold">✓</span>
                  {p.rubrik}
                </p>
                <p className="mt-1.5 pl-7 text-xs leading-relaxed text-muted-foreground">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── الدورات الـ 24 — حسب الفئة، العناوين من الكتالوج ──────────── */}
        <section id="kurser" className="mt-12 scroll-mt-24">
          <h2 className="font-serif text-2xl font-bold">
            دورات المرحلة 3 الـ {antalKurser}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            ثلاث سفن قيادية للنظام البيئي، وسبعة عشر عملًا كلاسيكيًا في
            التحليل الفني وأربعة في علم نفس التداول — كل ما يتطلب حكمًا
            أساسيًا ناضجًا كي يصير أكثر من فضول.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {FAS3_KURSLISTA.map((kat) => (
              <div key={kat.kategori} className="rounded-xl border border-gold/30 bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  {kat.kategori}{" "}
                  <span className="font-normal text-gold">· {kat.slugs.length} دورات</span>
                </h3>
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
        </section>

        {/* ── قيد التطوير — وأنت موجود منذ البداية ───────────────────────── */}
        <section id="framtiden" className="mt-12 scroll-mt-24">
          <div className="marin-panel rounded-2xl border border-gold/40 p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold text-[#EDE6D6]">
              قيد التطوير — وأنت موجود منذ البداية
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#EDE6D6]/85">
              المرحلة 3 ليست منتجًا جاهزًا بل مكانًا حيًا. وطالب المرحلة 3
              له{" "}
              <strong className="text-[#EDE6D6]">الحق في كل التطورات
              المستقبلية</strong> داخل المرحلة 3 — كل ما يُبنى يُبنى لك أنت
              أيضًا:
            </p>
            <ul className="mt-4 grid gap-2.5 text-sm text-[#EDE6D6]/85 sm:grid-cols-2">
              {[
                "📊 تحليل الأسهم والمحافظ — أعمق وأسرع وأحيى",
                "🖥️ لوحة المعلومات — النظام البيئي التحليلي يجتمع في منظر واحد",
                "🤖 ربط مباشر بالذكاء الاصطناعي بأعلى جودة",
                "📄 تقارير وغيرها — مولَّدة تلقائيًا وقابلة للتتبع إلى المصادر",
              ].map((txt) => (
                <li key={txt} className="flex gap-2.5">
                  <span className="text-[#E8C766]">✓</span>
                  <span>{txt}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-[#EDE6D6]/70">
              لا نَعِد بتواريخ جاهزة — نَعِد بالاتجاه، وبأنك كطالب مرحلة 3
              موجود منذ اليوم الأول. كل شيء قيد التطوير.
            </p>
          </div>
        </section>

        <div className="hjarlinje mt-12" />

        {/* ── مصفوفة المتطلبات — ستة معايير، A–F ─────────────────────────── */}
        <section id="krav" className="mt-12 scroll-mt-24">
          <h2 className="font-serif text-2xl font-bold">
            مصفوفة المتطلبات — ستة معايير، تقدير A–F
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            تُقيَّم المحفظة وفق ستة معايير متساوية الوزن، بتقدير A–F لكل
            منها. التقدير النهائي يُوضع على{" "}
            <strong>المحفظة ككل — أبدًا لا على الإنسان</strong>. F في معيار
            ما هي أمر عمل بإعادته، لا حكم نهائي؛ والجولات بلا سقف.
          </p>
          <div className="table-wrap mt-5 w-full overflow-x-auto rounded-xl border border-gold/30 bg-card">
            <table className="w-full min-w-[640px] text-start text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gold/30 bg-gold/5">
                  <th className="px-4 py-3 font-serif text-sm font-bold text-gold">المعيار</th>
                  <th className="px-4 py-3 font-serif text-sm font-bold text-gold">
                    يُعرف التقدير A بـ
                  </th>
                  <th className="px-4 py-3 font-serif text-sm font-bold text-gold">
                    يُعرف التقدير F بـ
                  </th>
                </tr>
              </thead>
              <tbody>
                {KRAV.map((k) => (
                  <tr key={k.kriterium} className="border-b border-gold/10 last:border-b-0">
                    <td className="px-4 py-3 align-top font-semibold text-foreground">
                      {k.kriterium}
                    </td>
                    <td className="px-4 py-3 align-top leading-relaxed text-muted-foreground">
                      {k.a}
                    </td>
                    <td className="px-4 py-3 align-top leading-relaxed text-muted-foreground/80">
                      {k.f}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            يُرفع السلم عمدًا من شهادة المرحلة 1 بتقديرات A–D (التي تقيس
            المستوى وXP) إلى A–F على <em>العمل</em> — الموضوعات نفسها،
            بمطلب معرفي أعلى: ادمج وطبيق، باستقلال.
          </p>
        </section>

        {/* ── محفظة التطبيق العملي — ما يُحتسب ──────────────────────────── */}
        <section id="portfolj" className="mt-12 scroll-mt-24">
          <h2 className="font-serif text-2xl font-bold">
            محفظة التطبيق العملي — عشرة تحليلات كاملة
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            المطلب الجوهري في الشهادة، مبنيًّا في أدوات المنصة نفسها — تلك
            التي تستخدمها أصلًا كل أسبوع. لا أدوات جديدة تلزم: الأدوات تصبح
            القاعة الدراسية. المحفظة امتحان نصف مفتوح ينمو تدريجيًا، لا
            مناسبة اختبار واحدة.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {PORTFOLJ.map((p) => (
              <div
                key={p.rubrik}
                className="marin-panel relative rounded-2xl border border-gold/30 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-serif text-lg font-bold text-[#EDE6D6]">
                    {p.ikon} {p.rubrik}
                  </p>
                  {p.auto && (
                    <span
                      className="shrink-0 rounded-full border border-[#E8C766]/50 bg-[#E8C766]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#E8C766]"
                      title="يُتابع تلقائيًا في الأداة — لا شيء تُحسبه يدويًا"
                    >
                      ✓ تتبع تلقائي
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#EDE6D6]/85">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-gold/30 bg-paper p-4 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">مسارات اختيارية.</strong>{" "}
            يمكن تعميق موقعين من المواقع العشرة إما نحو الحالات الخاصة
            والإصدارات الجديدة من الأسهم، أو نحو عمل المحفظة والمخاطر —
            ويظهر المسار على وثيقة الشهادة. تجري المراجعة على درجتين:
            فحص مسبق بالذكاء الاصطناعي مقابل المخطط، ثم الحكم النهائي
            البشري من المؤسس.
          </div>
        </section>

        <div className="hjarlinje mt-12" />

        {/* ── وحدة الأخلاق — الصدق نواة قابلة للاختبار ──────────────────── */}
        <section id="etik" className="mt-12 scroll-mt-24">
          <h2 className="font-serif text-2xl font-bold">
            وحدة الأخلاق — الصدق نواة قابلة للاختبار
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            موقفنا هو <strong>الصدق قبل الراحة</strong> — وليس موقفًا شكليًا
            بل ثلاثة وعود ملموسة يمكن اختبارها. مأخوذة مباشرة من القواعد
            الصارمة للمنهجية، وتسري على كل تحليل في المحفظة:
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {LOFTEN.map((l, i) => (
              <div
                key={l.nr}
                className="relative rounded-2xl border border-gold/40 bg-card p-5 shadow-sm"
              >
                <p className="font-serif text-3xl font-bold text-gold">{l.nr}</p>
                <p className="mt-1 font-serif text-lg font-bold">{l.namn}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{l.text}</p>
                {i < LOFTEN.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -left-3 top-1/2 hidden -translate-y-1/2 font-serif text-2xl font-bold text-gold md:block"
                  >
                    ←
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            إضافة إلى ذلك جزء حالات أخلاقية بمعضلات مُنسّقة على واقع المحلل:
            «تحليلك المنشور يحتوي خطأً حسابيًا — ماذا تفعل؟». تُقيَّم
            الإجابات بصدق التعليل، أبدًا لا بـ«إجابة صحيحة» واحدة — وF
            تعني أعد المحاولة والأسئلات بوصلة.
          </p>
        </section>

        {/* ── الأهلية B2B ─────────────────────────────────────────────────── */}
        <section id="b2b" className="mt-12 scroll-mt-24">
          <h2 className="font-serif text-2xl font-bold">
            معتمد = جاهز لمنصة /pro
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            الشهادة هي البوابة إلى غاية المرحلة 3: من يحمل الشهادة يكون
            جاهزًا <strong>لمنصة /pro</strong> — واجهة المحلل باستيراد
            المحافظ وقوالب التقارير والوحدات المُدارة بالصلاحيات — ولـ{" "}
            <strong>العلاقة مع AK1nvestor</strong>، طريق العمل معنا. لكن
            الشهادة والأهلية شيئان مختلفان، ومن الإنصاح قول ذلك بصراحة:
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-gold/40 bg-card p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                الشهادة — يمكن لأي أحد بلوغها
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                وثيقة شخصية: محفظة تطبيق عملي + جزء أخلاقي بتقديرات A–F.
                قابلة للمشاركة وموثّقة وملكتك للأبد — قيّمة حتى لو لم ترغب
                أبدًا في العمل داخل النظام البيئي. تشهد الشهادة على{" "}
                <em>الحرفة والصدق</em>.
              </p>
            </div>
            <div className="rounded-xl border border-gold/40 bg-card p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                الأهلية — علاقة الخطوة التالية
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                تقدير C أو أعلى يفتح منصة /pro. وتمثيل AK1nvestor يتطلب
                فوق ذلك تقييمًا شخصيًا من المؤسس وتوقيع ميثاق محللي AK1A.
                الشهادة وحدها <strong>ليست أبدًا</strong> إذنًا بتقديم
                المشورة.
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            الامتثال بكرامة: المرحلة 3{" "}
            <strong>اختبار كفاءة قائم على البحث</strong> — أبدًا ليس نصائح
            استثمارية، وأبدًا ليس رخصة استشارات بالمعنى المقصود لدى هيئة
            الإشراف المالي السويدية (Finansinspektionen). وقول هذا بصوت
            عالٍ هو بذاته مثال على الصدق الذي تختبره المرحلة 3. انظر{" "}
            <Link href="/finansiell-policy" className="underline hover:text-foreground">
              سياستنا المالية
            </Link>
            .
          </p>
        </section>

        {/* ── ÅKU — المعرفة سلعة سريعة التلف ─────────────────────────────── */}
        <section id="aku" className="mt-12 scroll-mt-24">
          <div className="marin-panel rounded-2xl border border-gold/30 p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold text-[#EDE6D6]">
              ÅKU — المعرفة سلعة سريعة التلف
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#EDE6D6]/85">
              الشهادة{" "}
              <strong className="text-[#EDE6D6]">حالة حية</strong>، لا تاريخًا
              على شهادة معلقة. كل عام تُحدّث معرفتك بجولة تحديث معرفي سنوي
              (ÅKU) موفّقة على دورك محللًا:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#EDE6D6]/85">
              {AKU.map((a) => (
                <li key={a.text} className="flex gap-2.5">
                  <span className="text-[#E8C766]">{a.ikon}</span>
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-[#EDE6D6]/70">
              التجديد الفائت يعني أن الشهادة <em>تستريح</em> — لا تُسحب
              أبدًا — وتُعاد بجولة ÅKU مكتملة. تبقى الأهلية طازجة دائمًا،
              لك ولمن تعمل معهم.
            </p>
          </div>
        </section>

        {/* ── نموذج السعر — دفعة واحدة + صندوق صادق عن الخطة الشهرية ──── */}
        <section className="mt-12 rounded-3xl border-2 border-gold bg-card p-7 text-center shadow-lg sm:p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
            المرحلة 3 · النظام البيئي الديناميكي · سعر يُدفع مرة واحدة
          </p>
          <p className="mt-3 font-serif text-4xl font-black text-gold sm:text-5xl">
            13,999 SEK
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            دفعة واحدة للتعليم كله: الدورات الـ {antalKurser}، وتكامل النظام
            البيئي، ومحفظة التطبيق العملي، والشهادة بتقديرات A–F — والحق في
            كل التطورات المستقبلية داخل المرحلة 3. لا أحد يدفع مقابل محتوى
            المرحلة 1؛ وفي المرحلة 3 تدفع مقابل النظام البيئي والمراجعة
            ومكانتك في التطوير.
          </p>
          {/* الصندوق الصادق — كلام مباشر عن الخطة الشهرية */}
          <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-dashed border-gold/50 bg-paper p-4 text-start">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              السعر الصادق، بصراحة
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              بعد انتهاء التعليم يمكن مواصلة استخدام النظام البيئي التحليلي
              ولوحة المعلومات عبر خطة شهرية (12 شهرًا).{" "}
              <strong className="text-foreground">أما التعليم نفسه فملكك
              للأبد</strong> — المعرفة لا تفارقك أبدًا؛ الأدوات حية وتواصل
              التطور.
            </p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            يسري ضمان الرضا 90 يومًا هنا أيضًا — يتم الدفع بعد 90 يومًا فقط،
            وفقط إذا بقيت راضيًا · أعضاء المرحلة 2 ينتقلون أولًا · كل
            الأدوات تبقى مجانية في المرحلة 1، للأبد.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/ar/fas2-ansok"
              className="rounded-md bg-gold px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              لم تُكمل المرحلة 2؟ ابدأ هناك — طلب مجاني
            </Link>
            <Link
              href="/ar/medlemskap"
              className="rounded-md border border-gold/50 px-5 py-3 text-sm font-semibold hover:bg-gold/10"
            >
              قارن المراحل 1 و2 و3
            </Link>
          </div>
        </section>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          مستعد لبدء البناء؟{" "}
          <Link href="/superanalys" className="underline hover:text-foreground">
            افتح أداة Superanalys
          </Link>{" "}
          وابدأ محفظة تطبيقك العملي اليوم — كل تحليل تحفظه يُحتسب،
          تلقائيًا. يقدّم AK1A Research Lab تحليلًا ماليًا قائمًا على البحث
          — لا شيء هنا نصيحة استثمارية.
        </p>
      </div>
    </SeoPageShell>
  );
}
