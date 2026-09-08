import Link from "next/link";
import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { SIFFROR } from "@/lib/siffror";

export const dynamic = "force-static";

/** أرقام عربية شرقية مع فاصل الآلاف العربي (ar-EG: ٨٬٢١١). */
const num = (n: number) => n.toLocaleString("ar-EG");

/**
 * المرآة العربية لصفحة /manifest (الموجة 51 — الوكيل S2).
 *
 * ترجمة كاملة للبيان السويدي — الافتتاحية، والوعود الستة، والمنهجية،
 * واختبار الصدق، والأرقام، والطريق، والدعوة، والتوقيع. نصوص عربية
 * مستقلة؛ لا سلاسل مشتركة مع الصفحة السويدية. الأرقام تُحسب حيّة من
 * طبقة المحتوى (مع بديل ثابت إن غابت البيانات)، تمامًا كالصفحة السويدية.
 */
export const metadata: Metadata = {
  title: "البيان — أفضل تعليم مالي في العالم | AK1A Research Lab",
  description: `بياننا: نحن نبني أفضل تعليم مالي في العالم — ${SIFFROR.kurser} دورة، و${SIFFROR.bokmaster} كتابًا فصلًا فصلًا، و${num(SIFFROR.quiz)} سؤال اختبار، مجانًا في المرحلة ١. منهجية مؤسسية، وصدق كامل، والكرم فكرة تجارية.`,
  keywords: [
    "التعليم المالي",
    "البيان",
    "تعليم أسواق الأسهم مجانًا",
    "التحليل الأساسي",
    "منهجية AKM1",
    "نظرية الأمواج AK1TS",
    "BOKMASTER",
  ],
  alternates: {
    canonical: `${SITE_URL}/ar/manifest`,
    languages: {
      "sv-SE": `${SITE_URL}/manifest`,
      en: `${SITE_URL}/en/manifest`,
      ar: `${SITE_URL}/ar/manifest`,
      "x-default": `${SITE_URL}/manifest`,
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
    title: "البيان — أفضل تعليم مالي في العالم | AK1A Research Lab",
    description:
      "نحن نبني أفضل تعليم مالي في العالم — بمقياس ما يستطيع الطالب فعله فعلًا بعد انتهائه.",
    url: `${SITE_URL}/ar/manifest`,
    siteName: "AK1A Research Lab",
    type: "website",
    locale: "ar_AR",
    alternateLocale: ["sv_SE", "en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "البيان | AK1A Research Lab",
    description: `المرحلة ١ مجانية إلى الأبد — ${SIFFROR.kurser} دورة، و${SIFFROR.bokmaster} كتابًا، و${num(SIFFROR.quiz)} سؤال اختبار. المعرفة حق.`,
  },
};

export default function ArManifestPage() {
  // أرقام حية — تُحسب من طبقة المحتوى عند البناء، مع بديل ثابت إن غابت
  // البيانات، تمامًا كالصفحة السويدية.
  const kurserLista = getCourseList();
  const kurser = kurserLista.length || 324;
  const bokmaster =
    kurserLista.filter((c) => c.category === "BOKMASTER").length || 78;
  const quiz =
    kurserLista.reduce(
      (s, c) =>
        s +
        c.chapters.reduce(
          (q, k) => q + ((k as { quiz?: Array<unknown> }).quiz?.length ?? 0),
          0
        ),
      0
    ) || SIFFROR.quiz;

  return (
    <SeoPageShell wide breadcrumb={[{ name: "البداية", href: "/ar" }, { name: "البيان" }]}>
      {/* الحاوية الرئيسية باتجاه القراءة العربية */}
      <div dir="rtl">
        {/* ── ١ · الافتتاحية ─────────────────────────────────────────────── */}
        <section className="rounded-xl border-2 border-gold bg-card p-8 shadow-lg sm:p-10">
          <span className="mb-4 inline-block w-fit rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-primary-foreground">
            AK1A RESEARCH LAB · البيان
          </span>
          <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">
            نحن نبني أفضل تعليم مالي في العالم.
          </h1>
          <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground">
            ليس الأكبر في العالم. ولا الأكثر بريقًا. الأفضل — بمقياس ما
            يستطيع الطالب فعله فعلًا بعد انتهائه. اليوم:{" "}
            <strong>{num(kurser)} دورة</strong>، و<strong>{num(bokmaster)}{" "}
            كتابًا</strong> مغطًّى فصلًا فصلًا، و<strong>{num(quiz)}{" "}
            سؤال اختبار</strong> تُلزم المعرفة بالرسوخ. وغدًا: مزيد من
            ذلك، وبعمق أكبر. نُبقي المقياس معلنًا — فبيان بلا أرقام مجرد
            مزاج.
          </p>
          <p className="mt-4 font-serif text-lg italic text-gold">
            المرحلة ١ مجانية، إلى الأبد — المعرفة حق.
          </p>
        </section>

        {/* ── ٢ · الوعود الستة ───────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="font-serif text-3xl font-bold">وعودنا الستة</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            ستّ دعاوى يمكن التحقق من كلها مقابل المحتوى. وإن أخلفنا واحدة —
            فحاسِبنا.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                nr: "٠١",
                titel: "قيمة عشرة أضعاف",
                body: (
                  <>
                    يجب أن تعلّمك كل دورة شيئًا <em>لم تكن تستطيعه</em> قبل
                    أن تفتحها. الدورة التي لا تفعل سوى تأكيد ما كنت تعتقده
                    قد فشلت — مهما كانت أنيقة. نستهدف أن تُضاعف كل دقيقة
                    قراءة قدرتك، لا أن تضيف إليها ذرة.
                  </>
                ),
              },
              {
                nr: "٠٢",
                titel: "صدق كامل",
                body: (
                  <>
                    نعلّم النقد الموجَّه إلينا أفضل مما يفعله النقاد
                    أنفسهم. أقسى تدقيق في نماذجنا الخاصة تجده{" "}
                    <Link
                      href="/kurser/akm1-den-kontroversiella-modellen"
                      className="font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
                    >
                      في دورات الجدل الخاصة بنا
                    </Link>{" "}
                    — لا مخبوءًا في زاوية أسئلة شائعة. الإطار الذي لا يحتمل
                    نقد ذاته لا يستحق ثقتك.
                  </>
                ),
              },
              {
                nr: "٠٣",
                titel: "منهجية مؤسسية",
                body: (
                  <>
                    عشرون متغيرًا في AKM1 ومحرك أمواج AK1TS الحتمي — بصيغ
                    مفتوحة وعتبات معلنة وتقييم بالنقاط. لا صناديق سوداء،
                    ولا &laquo;شراء على الإحساس&raquo;. كل ما تراه يمكنك
                    إعادة حسابه بنفسك.
                  </>
                ),
              },
              {
                nr: "٠٤",
                titel: "الكتب كاملة",
                body: (
                  <>
                    كل BOKMASTER يغطي كتابه فصلًا فصلًا — لا ملخصات، ولا
                    &laquo;الدروس الخمسة&raquo;. غراهام يُقرأ كما هو غراهام،
                    وكانمان كما هو كانمان. {num(bokmaster)} عنوانًا،
                    والقائمة تنمو.
                  </>
                ),
              },
              {
                nr: "٠٥",
                titel: "تعليم، لا توصيات أبدًا",
                body: (
                  <>
                    كل ما ننشره تعليم. الحاسبة، ومحرك الأمواج، ونظام
                    المحافظ — كل أداة تحمل إخلاء مسؤوليتها، لأن أداة تعلّمك
                    التفكير يجب ألا تغريك بالتوقف عنه.
                  </>
                ),
              },
              {
                nr: "٠٦",
                titel: "الكرم فكرة تجارية",
                body: (
                  <>
                    لا نحبس المعرفة. المرحلة ١ هي <em>كل</em> المحتوى — كل
                    الدورات وكل الكتب وكل الأدوات — مجانًا، إلى الأبد. نحن
                    لا نربح من تعلّمك؛ بل نربح مما تختار أن تفعله بالمعرفة.
                  </>
                ),
              },
            ].map((l) => (
              <div
                key={l.nr}
                className="flex flex-col rounded-xl border border-gold/30 bg-card p-6"
              >
                <div className="font-serif text-sm font-black tracking-[0.2em] text-gold">
                  {l.nr}
                </div>
                <h3 className="mt-2 font-serif text-xl font-bold">{l.titel}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {l.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ٣ · المنهجية ───────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="font-serif text-3xl font-bold">المنهجية</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            يقوم النظام على ركنين: الجانب الأساسي والجانب السوقي — كلاهما
            حتمي، وكلاهما مفتوح.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-gold/40 bg-card p-7">
              <span className="mb-2 inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
                الركن الأول · الجانب الأساسي
              </span>
              <h3 className="font-serif text-2xl font-bold">
                AKM1 — النموذج الجدلي
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                عشرون متغيرًا، <strong>V01–V20</strong>، مصنّفة في{" "}
                <strong>٧ فئات</strong> — الربحية، والنمو، والاستقرار،
                والخندق التنافسي، والتقييم، والمخاطر، والمحفزات. كل متغير
                يقيَّم <strong>من ٠ إلى ٥</strong> مقابل عتبات معلنة؛
                و<strong>الحد الأقصى للمجموع ١٠٠</strong>. لا انطباعات عامة
                مبنية على الإحساس: الشركة تصبح رقمًا يمكنك الجدل حوله، سطرًا
                سطرًا.
              </p>
              <Link
                href="/kurser/akm1-den-kontroversiella-modellen"
                className="mt-5 text-sm font-semibold text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
              >
                اقرأ دورة AKM1 كاملة ←
              </Link>
            </div>
            <div className="flex flex-col rounded-xl border border-gold/40 bg-card p-7">
              <span className="mb-2 inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
                الركن الثاني · الجانب السوقي
              </span>
              <h3 className="font-serif text-2xl font-bold">
                AK1TS — تراتب الأمواج
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                <strong>٥ آفاق زمنية × ٥ نظريات × ٤ أبعاد</strong> — شبكة
                كاملة من مذاهب السوق، كل واحد موزون ومقيَّم بالنقاط.{" "}
                <strong>محرك أمواج حتمي</strong>: المدخلات نفسها تعطي صورة
                الأمواج نفسها، في كل مرة. النظرية لا تنحاز أبدًا لجانب — بل
                تُلزمك بأن تعرف أي نظرية تتداول على أساسها.
              </p>
              <Link
                href="/kurser/ak1ts-vaglarans-hierarki"
                className="mt-5 text-sm font-semibold text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
              >
                اقرأ دورة AK1TS كاملة ←
              </Link>
            </div>
          </div>
        </section>

        {/* ── ٤ · الاختبار الحقيقي للصدق ────────────────────────────────── */}
        <section className="mt-12 rounded-xl border border-gold/30 bg-paper p-8">
          <h2 className="font-serif text-3xl font-bold">
            الاختبار الحقيقي للصدق
          </h2>
          <blockquote className="mt-5 border-r-4 border-gold pr-5 font-serif text-lg italic leading-relaxed text-foreground">
            &laquo;تفتقر النظريات إلى قدرة تنبؤية مثبتة علميًا — والأداة
            تُلزمك بالقياس بدل الإحساس.&raquo;
          </blockquote>
          <p className="mt-2 text-xs text-muted-foreground">
            — من إخلاء مسؤوليتنا الخاص، الذي يرافق كل أداة تحليل.
          </p>
          <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              نقف خلف هذه الجملة على كل أداة في النظام كله. ليس لأننا نشك
              في حرفتنا — بل لأنها أصدق جملة يمكن قولها عن التحليل الفني،
              وكل من يدّعي غير ذلك إنما يبيعك شيئًا.
            </p>
            <p>
              <strong className="text-foreground">لماذا هذا قوة؟</strong>{" "}
              لأن كل بائع يقين لديه مصلحة في إخفاء اللايقين. حين نكتبه
              صراحةً — في إخلاء بعد إخلاء — لا يبقى شيء لِيُخفى. ما يبقى
              هو المنهج: قِس بدل أن تُحسّ، وقيِّم بالنقاط بدل أن تخمّن،
              ودع الرقم يحمل المسؤولية التي لا يستطيع مزاجك حملها.
              والتعليم الذي يبدأ بـ&laquo;نحن لا نعرف&raquo; ويعلّمك مع ذلك
              التصرف ببنية — أصدق من تعليم يبدأ بالوعود.
            </p>
          </div>
        </section>

        {/* ── ٥ · الأرقام ────────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="font-serif text-3xl font-bold">الأرقام</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            البيان يجب أن يكون قابلًا للعد. هكذا يبدو الوضع الآن — أرقام
            حية، تتحدث مع المحتوى.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { tal: `${num(kurser)}`, etikett: "دورة في النظام كله — كلها مجانية في المرحلة ١" },
              { tal: `${num(bokmaster)}`, etikett: "BOKMASTER — كتب مغطاة فصلًا فصلًا" },
              {
                tal: num(quiz),
                etikett: "سؤال اختبار يفعّل المعرفة التي قرأتها للتو",
              },
              { tal: "١٤٠", etikett: "بطاقة مراجعة بالتكرار المتباعد (إبنغهاوس/SM-2)" },
              { tal: "١٠", etikett: "أنواع رسوم بيانية في أدوات التحليل" },
              { tal: "٢٠١", etikett: "حالة درس في المختبر — نجاحات وإخفاقات" },
            ].map((s) => (
              <div
                key={s.etikett}
                className="rounded-xl border border-gold/30 bg-card p-5 text-center"
              >
                <div className="font-serif text-3xl font-black text-gold">
                  {s.tal}
                </div>
                <div className="mt-1 text-[11px] leading-tight text-muted-foreground">
                  {s.etikett}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ٥ب · البرهان الاجتماعي — أرقام وأصوات طلاب ─────────────────── */}
        <section className="marin-panel mt-12 rounded-2xl p-6 sm:p-10">
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
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
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
              ].map((e) => (
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
            <p className="mt-4 text-center text-xs text-[#EDE6D6]/70 opacity-50">
              لا بيانات بطاقة. ولا بيع. المرحلة ١ مجانية — إلى الأبد.
              وتُعرض أصوات الطلاب بالاسم الأول وبمستوياتهم الحقيقية.
            </p>
          </div>
        </section>

        {/* ── ٦ · الطريق ─────────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="font-serif text-3xl font-bold">الطريق</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            أربع خطوات، وكلمة قيادة واحدة: الكرم. نحن لا نربح من تعلّمك —
            بل نربح بما تصبح عليه.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                steg: "الخطوة ١",
                titel: "المرحلة ١ — مجانية، إلى الأبد",
                body: (
                  <>
                    جميع الدورات البالغة {num(kurser)}، وكل BOKMASTER، وكل
                    الأدوات. مجانًا، بلا حدود، وبلا تحفظات. ليس عيّنة تذوق
                    — بل المائدة كاملة.
                  </>
                ),
              },
              {
                steg: "الخطوة ٢",
                titel: "المستوى ٢٥ — البرهان لنفسك",
                body: (
                  <>
                    حين تبلغ المستوى ٢٥ تكون قد بذلت العمل — وتملك الأرقام
                    التي تثبت ذلك. لا حاجز طريق، ولا جدار دفع: مجرد إشارة،
                    إلى نفسك، بأن الأسس قد رسخت.
                  </>
                ),
              },
              {
                steg: "الخطوة ٣",
                titel: "المرحلة ٢ — تعليم مع المؤسس",
                body: (
                  <>
                    ٩٬٩٩٩ kr، ويتطلب تقديم طلب، وضمان رضا لمدة ٩٠ يومًا
                    (الدفع بعد ٩٠ يومًا فقط إن بقيت راضيًا). الطريق الأساسي
                    إلى محلل مستقل: لا جديد — المؤشرات التحليلية العشرون
                    نفسها، موزونة معًا الآن بالطريقة الصحيحة. ١٨ عملًا
                    مرجعيًا مع إنسان إلى جانبك، وساعات بلا حدود — وفرصة أن
                    تصبح ممثلًا لـ AK1nvestor.
                  </>
                ),
              },
              {
                steg: "الخطوة ٤",
                titel: "ممثل — اعمل معنا",
                body: (
                  <>
                    لمن يريد المضي أبعد: اعمل مع AK1nvestor. نموذجنا يُنمّي
                    محللين مستقلين — وأحيانًا يصبحون زملاء. تلك هي الفكرة.
                  </>
                ),
              },
            ].map((s) => (
              <div
                key={s.steg}
                className="flex flex-col rounded-xl border border-gold/30 bg-card p-6"
              >
                <span className="inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
                  {s.steg}
                </span>
                <h3 className="mt-3 font-serif text-lg font-bold leading-snug">
                  {s.titel}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-sm italic leading-relaxed text-muted-foreground">
            اقرأ البنية كاملة — المراحل والضمان وطلب التقديم — في صفحة{" "}
            <Link
              href="/ar/medlemskap"
              className="text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
            >
              العضوية
            </Link>
            .
          </p>
        </section>

        {/* ── ٧ · صف الدعوة ──────────────────────────────────────────────── */}
        <section className="mt-12 rounded-xl border-2 border-gold bg-card p-8 text-center shadow-lg">
          <h2 className="font-serif text-2xl font-bold">
            قرأتَ البيان. الآن جاء دورك.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ثلاثة أبواب — كلها مفتوحة، ولا واحد عليها سعر.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/laroplan"
              className="rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              ابدأ مجانًا — افتح المنهج الدراسي
            </Link>
            <Link
              href="/profil"
              className="rounded-md border border-gold/50 px-5 py-2.5 text-sm font-semibold hover:bg-gold/10"
            >
              اختبر ملفك المعرفي
            </Link>
            <Link
              href="/bibliotek"
              className="rounded-md border border-gold/50 px-5 py-2.5 text-sm font-semibold hover:bg-gold/10"
            >
              شاهد المكتبة
            </Link>
          </div>
        </section>

        {/* ── ٨ · التوقيع ────────────────────────────────────────────────── */}
        <p className="mt-12 border-t border-gold/30 pt-8 text-center font-serif text-lg font-bold leading-relaxed">
          AK1A Research Lab
          <span className="mt-1 block text-sm font-medium italic text-muted-foreground">
            أعمق من مدونة. أوضح من بنك. أسرع من دورة تعليمية.
          </span>
        </p>
      </div>
    </SeoPageShell>
  );
}
