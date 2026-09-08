import type { Metadata } from "next";
import Link from "next/link";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Fas2AnsokAr } from "@/components/ak1a/spegel/fas2-ansok-ar";
import { getCourseList } from "@/lib/content";
import { SIFFROR } from "@/lib/siffror";
import { spegelMetadata } from "@/lib/spegel-metadata";
import { lasPriserGallande } from "@/lib/variabler-lagring";

// VÅG 80A (språk-agent 2): spegeln följer svenska originalsidans våg 79-
// kontrakt — priset läses live via lasPriserGallande() (Supabase-override,
// filen = fallback) med ISR 5 min, i stället för force-static + hårdkodat
// "9,999 SEK". Metadata behåller fil-default (SEO-stabilt), som originalet.
export const revalidate = 300;

/**
 * /ar/fas2-ansok — مرآة كاملة للصفحة السويدية /fas2-ansok (الموجة 51،
 * الوكيل S3). كل النصوص مترجمة إلى العربية الفصحى الحديثة بمصطلحات
 * مالية دقيقة (التحليل الأساسي، التقييم، القوائم المالية)، ونموذج
 * الطلب التفاعلي هو النسخة المترجمة Fas2AnsokAr. عناوين الدورات تُجلب
 * ديناميكيًا من كتالوج الدورات (عناوين سويدية — المرحلة 3 من خطة
 * اللغات). تُحتفظ بالاختصارات اللاتينية (AKM1 وV01–V20 وAK1nvestor)
 * وبالأسعار بصيغة SEK وبالأرقام اللاتينية.
 */

/**
 * المرحلة 2 (النموذج الجديد): الأعمال الكلاسيكية الأساسية الثمانية عشر،
 * حسب الفئة — التقييم، القوائم المالية، التمويل المؤسسي، الاستثمار
 * القيمي + التعمق في AKM1. مرآة لقائمة FAS2_KURSLISTA السويدية.
 */
const FAS2_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "المراجع الكبرى في التقييم",
    pitch:
      "غراهام ودود وداموداران وماكنزي ووليامز ورابابورت وموبوسين — فن وزن الشركة في يدك، من القوائم المالية إلى القيمة.",
    slugs: [
      "security-analysis",
      "investment-valuation",
      "valuation-measuring-managing",
      "the-theory-of-investment-value",
      "expectations-investing",
    ],
  },
  {
    kategori: "القوائم المالية والمحاسبة على مستوى المحلل",
    pitch:
      "بينمان ومولفورد وكوميسكي وأوغلوف وشيليت وغراهام — اكتشف جودة الأرباح واخترق ما هو مجرد حكاية.",
    slugs: [
      "financial-statement-analysis-and-security-valuation",
      "creative-cash-flow-reporting",
      "quality-of-earnings",
      "financial-shenanigans",
      "interpretation-of-financial-statements",
    ],
  },
  {
    kategori: "التمويل المؤسسي ورأس المال",
    pitch:
      "هيغز وبريلي وويتمان — هيكل رأس المال وحساب التدفقات النقدية والشركات المتعثرة على مستوى ماجستير إدارة الأعمال.",
    slugs: [
      "analysis-for-financial-management",
      "principles-of-corporate-finance",
      "distress-investing",
    ],
  },
  {
    kategori: "كلاسيكيات الاستثمار القيمي + التعمق الأقصى في AKM1",
    pitch:
      "كلارمان وغرينوالد وغراي وكارلايل وأينهورن — ونموذجنا AKM1 (V01–V20) على مستوى تحليلي حقيقي.",
    slugs: [
      "margin-of-safety",
      "value-investing-from-graham-to-buffett",
      "quantitative-value",
      "fooling-some-of-the-people",
      "akm1-den-kontroversiella-modellen",
    ],
  },
];

export const metadata: Metadata = spegelMetadata({
  lang: "ar",
  sida: "fas2-ansok",
  title: "تقدّم بطلبك للمرحلة 2 — المسار الأساسي | AK1A",
  description:
    "المرحلة 2 هي المسار الأساسي السريع إلى أن تصبح محللًا مستقلًا: لا شيء جديد — المؤشرات التحليلية العشرون نفسها (V01–V20)، تُوزن الآن بالطريقة الصحيحة بدعم من 18 عملًا كلاسيكيًا — التقييم (غراهام ودود، داموداران، ماكنزي)، تحليل القوائم المالية (بينمان، شيليت، أوغلوف)، التمويل (هيغز، بريلي) والاستثمار القيمي (كلارمان، غرينوالد، أيتهورن) إضافة إلى AKM1 في أقصى عمق. ساعات بلا حدود مع المؤسس حتى تكون جديرًا بلقب محلل أسهم مستقل، وفرصة أن تصبح ممثلًا لـ AK1nvestor. لا تدريب على التحليل الفني هنا — مستوى الإتقان هو المرحلة 3. السعر 9,999 SEK مع ضمان رضا 90 يومًا: الدفع بعد 90 يومًا فقط إذا بقيت راضيًا.",
  keywords: [
    "طلب المرحلة 2",
    "تعليم التحليل الأساسي السويد",
    "وزن المؤشرات الأساسية",
    "التقييم داموداران",
    "تحليل القوائم المالية بينمان",
    "كلارمان هامش الأمان",
    "محلل مستقل",
    "ممثل AK1nvestor",
    "تعليم تحليل الأسهم",
  ],
});

export default async function Fas2AnsokPageAr() {
  // Pris-talet live ur variabellagret (kastar aldrig — filen är fallback);
  // klientkomponenten får det som serialiserbar prop (samma som originalet).
  const priser = await lasPriserGallande();
  const katalog = getCourseList();
  const titelFor = (slug: string) =>
    katalog.find((k) => k.slug === slug)?.title ?? slug;
  const antalFas2 = FAS2_KURSLISTA.reduce((s, k) => s + k.slugs.length, 0);

  return (
    <SeoPageShell breadcrumb={[{ name: "الرئيسية", href: "/ar" }, { name: "طلب المرحلة 2" }]}>
      <article dir="rtl" className="space-y-8">
        <header className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
            {`المرحلة 2 · المسار الأساسي السريع · ${priser.fas2EnGang.toLocaleString("en-US")} SEK`}
          </p>
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            تقدّم بطلبك للمرحلة 2
          </h1>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            المرحلة 1 هي المكتبة الأساسية بأكملها — مجانية، للأبد. أما
            المرحلة 2 فشيء آخر: <strong>المسار الأساسي السريع إلى أن تصبح
            محللًا مستقلًا</strong>. لا نعلّمك شيئًا جديدًا — إنها المؤشرات
            التحليلية العشرون نفسها (V01–V20) التي قابلتها في المرحلة 1،
            لكنك تتعلم الآن تحليلها بالطريقة الصحيحة، وقبل كل شيء:{" "}
            <strong>وزنها معًا</strong> لتصل إلى حكم يكون لك وحدك. ومع إنسان
            إلى جانبك — تدريب شخصي مع المؤسس وتوجيه جماعي — تحصل على ساعات
            بلا حدود، حتى تكون جديرًا بلقب محلل أسهم مستقل. نقبل عددًا
            محدودًا من الطلاب في كل مرة، ولهذا يلزم تقديم طلب.
          </p>
        </header>

        {/* وضوح: لا تحليل فني + فرصة التمثيل — وعدان */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="gravor-ram rounded-2xl bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              لنكن واضحين: لا تحليل فني هنا
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              لا ندرّس <strong className="text-foreground">أي شيء</strong> في
              التحليل الفني داخل المرحلة 2. الموجات وإليوت والنظام البيئي
              الديناميكي هي{" "}
              <Link href="/ar/fas3" className="underline hover:text-foreground">
                المرحلة 3
              </Link>{" "}
              — أما المرحلة 2 فهي الحرفة التي يقوم عليها الحكم: أن تقرأ
              الشركة وتقيّمها وتدافع عنها بالأرقام.
            </p>
          </div>
          <div className="gravor-ram rounded-2xl bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              فرصة التمثيل
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              تفتح المرحلة 2 الطريق إلى{" "}
              <strong className="text-foreground">أن تصبح ممثلًا لـ AK1nvestor</strong>{" "}
              — أن تمثلنا بجودة. لمن يريد ذلك من الطلاب، تكون الدراسة بداية
              تلك العلاقة لا نهايتها.
            </p>
          </div>
        </div>

        <Fas2AnsokAr prisFas2={priser.fas2EnGang} />

        {/* الإثبات الاجتماعي — أرقام وأصوات الطلاب بعد قسمي الشروط والطلب.
            مرآة عربية لشريط SocialProof (الأرقام من src/lib/siffror). */}
        <section
          aria-label="AK1A Research Lab بالأرقام وأصوات الطلاب"
          className="marin-panel relative overflow-hidden rounded-3xl p-6 sm:p-10"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute inset-3 rounded-2xl border border-gold/20" />
          </div>
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              AK1A Research Lab · بالأرقام وأصوات الطلاب
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
                  etikett: "في المرحلة 1 — المكتبة كلها، دون مقابل، للأبد. نكسب بثقة عملائنا",
                },
              ].map((s) => (
                <div key={s.huvud} className="rounded-2xl border border-gold/25 bg-black/20 p-5">
                  <p className="font-serif text-4xl font-black tabular-nums text-gold">{s.tal}</p>
                  <p className="mt-2 font-serif text-lg font-semibold">{s.huvud}</p>
                  <p className="mt-1 text-xs leading-relaxed opacity-70">{s.etikett}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  citat: "أول مرة أفهم أسهمي فعلًا",
                  namn: "كالي",
                  typ: "المستوى 12 · 6 دورات مكتملة",
                },
                {
                  citat: "أسئلة الاختبار تجبرني على التفكير لا القراءة فقط",
                  namn: "ماريا",
                  typ: "المستوى 28 · 21 دورة مكتملة",
                },
                {
                  citat: "أساس الموجات غيّر نظرتي إلى محفظتي",
                  namn: "إريك",
                  typ: "المستوى 41 · 37 دورة مكتملة",
                },
              ].map((e) => (
                <figure key={e.namn} className="rounded-2xl border border-gold/25 bg-black/20 p-5">
                  <p className="text-sm tracking-widest" aria-label="5 من 5 نجوم">
                    ⭐⭐⭐⭐⭐
                  </p>
                  <blockquote className="mt-3 font-serif text-lg italic leading-snug">
                    &ldquo;{e.citat}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-semibold">{e.namn}</span>
                    <span className="opacity-60"> · {e.typ}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-6 text-center text-xs opacity-50">
              لا بيانات بطاقة. لا بيع. المرحلة 1 مجانية — للأبد. تُعرض أصوات
              الطلاب بالأسماء الأولى والمستويات الحقيقية.
            </p>
          </div>
        </section>

        {/* ما تتضمنه المرحلة 2 */}
        <section className="space-y-5 rounded-xl border border-gold/30 bg-card p-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
            ما تتضمنه المرحلة 2
          </p>
          <h2 className="font-serif text-2xl font-bold">
            الوزن المتكامل — وإنسان يجمعه
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            في المرحلة 1 تتعلم الأجزاء: متغيرًا بعد متغير، وكتابًا بعد كتاب،
            وفصلًا بعد فصل. المرحلة 2 هي الخطوة الحاسمة التالية:{" "}
            <strong>وزن المؤشرات التحليلية العشرين معًا</strong> — الأعمال
            الكلاسيكية الـ {antalFas2} هي الخريطة، والوزن المتكامل هو الرحلة.
            إنه الطريق السريع إلى أن تقف يومًا محللًا مستقلًا تمامًا، بحكم
            يكون لك وحدك. كل شيء أساسي، ولا شيء غير ذلك.
          </p>

          {/* قائمة الدورات، حسب الفئة */}
          <div className="space-y-4">
            {FAS2_KURSLISTA.map((kat) => (
              <div key={kat.kategori} className="rounded-lg border border-gold/20 bg-paper p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {kat.kategori}{" "}
                  <span className="font-normal text-gold">· {kat.slugs.length} دورات</span>
                </h3>
                <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                  {kat.pitch}
                </p>
                <ul className="mt-2 grid gap-1 text-xs leading-relaxed text-muted-foreground sm:grid-cols-2">
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

          {/* التدريب إلى جانب الدورات */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                namn: "المؤسس إلى جانبك",
                text: "تدريب شخصي مع مؤسس AK1A وتوجيه جماعي مع عملاء آخرين — ساعات بلا حدود، حتى تكون جديرًا بلقب محلل أسهم مستقل.",
              },
              {
                namn: "ممثل AK1nvestor",
                text: "تفتح المرحلة 2 الطريق إلى البقاء ممثلًا لـ AK1nvestor — أن تمثلنا بجودة، عندما تحملك الدراسة إلى ذلك.",
              },
              {
                namn: "شركات مُختبرة بالأرقام",
                text: "اقتراحات شركات خلال الدراسة — مختبرة بمتغيرات AKM1 وأرقامه وعتباته، وأبدًا لا بالحدس.",
              },
            ].map((v) => (
              <div key={v.namn} className="rounded-lg border border-gold/20 bg-paper p-4">
                <h4 className="font-serif text-sm font-bold text-foreground">{v.namn}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>

          {/* الدفاع عن المرحلة 1 */}
          <p className="rounded-lg border border-dashed border-gold/40 bg-paper p-4 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">
              تبقى المرحلة 1 مجانية — دائمًا.
            </strong>{" "}
            المرحلة 2 لمن يريد من الطلاب أن ينتقل من فهم الأجزاء إلى حمل حكم
            أساسي خاص به. المرحلة 1 لا تخفي شيئًا: كل ما نعرفه من أساسيات
            متاح مجانًا، وسيبقى كذلك.
          </p>

          <p className="text-xs leading-relaxed text-muted-foreground">
            كل ما في AK1A Research Lab تعليم قائم على البحث في تحليل الأسهم —
            أبدًا ليس نصائح استثمارية، وأبدًا ليس توصيات بشراء أو بيع. تستند
            التحليلات والدورات إلى مصادر مفتوحة وافتراضات معلَنة.
          </p>
        </section>

        <section className="rounded-xl border border-dashed border-gold/40 bg-paper p-6">
          <h2 className="font-serif text-xl font-bold">ما يحدث بعد تقديم الطلب</h2>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">1.</strong> نقرأ طلبك شخصيًا —
              مع حالتك كطالب في المرحلة 1. الشرط، بصراحة: أن تُكمل المرحلة 1،
              وأن تكون لديك الإرادة للنجاح في التحليل الأساسي للأسهم — فبدون
              إرادة يصعب التركيز.
            </li>
            <li>
              <strong className="text-foreground">2.</strong> تتلقى دعوة إلى
              اجتماع مجاني مع المؤسس. لا ضغط بيعيًا — مجرد حديث.
            </li>
            <li>
              <strong className="text-foreground">3.</strong> إذا قررت المتابعة
              تبدأ الدراسة فورًا — ولا تدفع شيئًا خلال الأيام التسعين الأولى.
              يتم الدفع بعد 90 يومًا فقط، وفقط إذا بقيت راضيًا (ضمان الرضا
              90 يومًا).
            </li>
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            متردد؟{" "}
            <Link href="/ar/medlemskap" className="underline hover:text-foreground">
              قارن المراحل 1 و2 و3 على مهلك
            </Link>
            . المرحلة 1 لا تخفي شيئًا — كل ما نعرفه من أساسيات متاح مجانًا،
            وسيبقى كذلك.
          </p>
        </section>
      </article>
    </SeoPageShell>
  );
}
