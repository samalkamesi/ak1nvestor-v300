import type { Metadata } from "next";
import Link from "next/link";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { lasPriser } from "@/lib/portfolj-forskning/korstabell-data";
import { NivaKort } from "@/components/ak1a/prenumeration/niva-kort";
import { RabattBand } from "@/components/ak1a/prenumeration/rabatt-band";
import { AktiveraPanel } from "@/components/ak1a/prenumeration/aktivera-panel";
import { spegelMetadata } from "@/lib/spegel-metadata";

export const dynamic = "force-static";

/**
 * /ar/prenumeration — مرآة كاملة للصفحة السويدية /prenumeration (الموجة
 * 51، الوكيل S3). جميع نصوص الصفحة مترجمة إلى العربية الفصحى الحديثة،
 * والمحتوى يقرأ من اليمين إلى اليسار (dir="rtl"). تُقرأ الأرقام عند
 * البناء من data/portfolj-system/priser.json عبر lasPriser() — لا مبالغ
 * مختلقة. بطاقات المستويات وشريط الخصم ولوحة التفعيل معاد استخدامها
 * (مكونات عميلة)؛ قوائم التحقق التي تمررها هذه الصفحة الخادمة مترجمة،
 * وتُترجم نصوص المكونات الداخلية في المرحلة 3 من خطة اللغات. أسماء
 * المنتجات السويدية تبقى كما هي شأن عناوين الدورات والكتب، وتُذكر
 * أسماء القوانين السويدية بأصلها مع شرح عربي موجز.
 */

const priser = lasPriser();
const grundNiva = priser?.nivaer.find((n) => n.id === "forskning") ?? priser?.nivaer[0];
const rabattProcent = priser ? Math.round(priser.rabattFas.fas2 * 100) : 0;

export const metadata: Metadata = spegelMetadata({
  lang: "ar",
  sida: "prenumeration",
  title: "الاشتراك — متابعة بحثية للمحفظة | AK1A",
  description: grundNiva
    ? `ثلاثة مستويات تبدأ من ${grundNiva.prisManad} SEK شهريًا: محفظة بحثية شهرية (10 قطاعات × 10 شركات) بدرجات AKM1، وحالة موجية أساسية وفنية، ومتابعة «آنذاك مقابل الآن»، واقتراحات استبدال عند كسر المتطلبات الصارمة. أنت طالب مرحلة 2 أو 3؟ خصم ${rabattProcent} % للأبد — يُتعرف على حالتك تلقائيًا. بحث، لا مشورة.`
    : "ثلاثة مستويات من المتابعة البحثية للمحفظة: درجات AKM1، وحالة موجية لكل أفق زمني، ومتابعة آنذاك مقابل الآن، واقتراحات استبدال. طلاب المرحلتين 2 و3 يحصلون على خصم دائم. بحث — لا مشورة.",
  keywords: [
    "بحث المحافظ",
    "اشتراك تحليل الأسهم",
    "محفظة بحثية",
    "محفظة AKM1",
    "متابعة المحفظة",
    "AK1A Research Lab",
  ],
});

/** قوائم التحقق لكل مستوى — مبنية من أوصاف priser.json وموسّعة. */
const INGAR_PER_NIVA: Record<string, string[]> = {
  forskning: [
    "محفظة بحثية شهرية — 10 قطاعات × 10 شركات",
    "اختر مستوى المخاطرة (محافظ، متوازن، نمو) وسرعة النمو (هادئ، ثابت، عدواني) — 9 ملفات",
    "درجة AKM1 لكل حيازة",
    "حالة موجية أساسية وفنية لكل أفق زمني",
    "هامش الأرضية وفحوص المتطلبات لكل حيازة",
    "مادة تعليمية — دون أي حث على شراء أو بيع",
  ],
  "forskning-plus": [
    "كل ما في المستوى الأساسي",
    "اقتراحات استبدال عندما تكسر حيازة المتطلبات الصارمة للملف — حتى ثلاثة بدائل في القطاع نفسه مع نص مقارن",
    "متابعة شهرية «آنذاك مقابل الآن» — قياس المحفظة مقابل الصورة السابقة",
    "متابعة معمّقة فصلية «آنذاك مقابل الآن»",
    "المصفوفة الموجية المجمعة للمحفظة لكل أفق زمني",
  ],
  "portfolj-hyra": [
    "كل ما في مستوى Plus",
    "تستأجر المحفظة البحثية التي تعكس ملف مخاطرة اختيارك",
    "يتولى AK1A إعادة التوازن وفحوص المتطلبات وتحليل الاستبدال عند كل تحديث",
    "بحث وتعليم — أبدًا ليس إدارة أموال أو مشورة استثمارية وفق القانون السويدي (2007:528)",
  ],
};

export default function PrenumerationPageAr() {
  // ── وضع الاحتياط الصادق: priser.json مفقودة/غير صالحة → لا أسعار مختلقة.
  if (!priser || priser.nivaer.length === 0) {
    return (
      <SeoPageShell lang="ar" breadcrumb={[{ name: "الرئيسية", href: "/ar" }, { name: "الاشتراك" }]} wide>
        <div dir="rtl">
          <h1 className="font-serif text-4xl font-bold">الاشتراك</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            AK1A Portföljforskning (بحث المحافظ) — متابعة بحثية للمحفظة، لا
            مشورة. قائمة الأسعار قيد الإعداد وستُنشر هنا قريبًا. مهتم منذ
            الآن؟ راسلنا على{" "}
            <a href="mailto:info@ak1nvestor.com" className="underline hover:text-foreground">
              info@ak1nvestor.com
            </a>{" "}
            وسنخبرك بالمزيد.
          </p>
        </div>
      </SeoPageShell>
    );
  }

  const { nivaer, rabattFas, uppdaterad } = priser;
  const exempelNiva = grundNiva ?? nivaer[0];
  const mittId = nivaer[1]?.id; // البطاقة الوسطى تُعلَّم «الأكثر اختيارًا»

  return (
    <SeoPageShell breadcrumb={[{ name: "الرئيسية", href: "/ar" }, { name: "الاشتراك" }]} wide>
      <div dir="rtl">
        {/* ── المقدمة ─────────────────────────────────────────────────────── */}
        <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight">
          متابعة بحثية للمحفظة — لا مشورة.
        </h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
          تتابع لك{" "}
          <strong className="text-foreground">AK1A Portföljforskning (بحث المحافظ)</strong>{" "}
          محفظةً بحثية — شهريًا ومنهجيًا مع إعلان كل الأرقام. تحصل على الأساس
          كاملًا: الدرجات، والحالة الموجية، وفحوص المتطلبات، وما تغيّر منذ
          المرة السابقة. لا نصدر أبدًا أي حث على شراء أو بيع — أنت تتخذ
          قراراتك بنفسك، بأساس أفضل.
        </p>

        {/* رقائق القيمة */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { tal: "10 × 10", etikett: "قطاعات × شركات في الكون البحثي" },
            { tal: "AKM1", etikett: "درجة لكل حيازة — 20 متغيرًا أساسيًا" },
            { tal: "5", etikett: "آفاق زمنية بحالة موجية أساسية + فنية" },
            { tal: "آنذاك مقابل الآن", etikett: "متابعة شهرية — ما الذي تغيّر منذ المرة السابقة؟" },
            { tal: "≤ 3", etikett: "اقتراحات استبدال في القطاع نفسه عند كسر المتطلبات الصارمة" },
            { tal: `${rabattProcent} %`, etikett: `خصم للأبد لطلاب المرحلتين 2 و3` },
          ].map((s) => (
            <div key={s.etikett} className="rounded-xl border border-gold/30 bg-card p-4">
              <div className="font-serif text-2xl font-black text-gold">{s.tal}</div>
              <div className="mt-1 text-xs leading-tight text-muted-foreground">{s.etikett}</div>
            </div>
          ))}
        </div>

        {/* ── شريط الخصم ──────────────────────────────────────────────────── */}
        <div className="mt-10">
          <RabattBand rabattFas={rabattFas} exempelNiva={exempelNiva} />
        </div>

        {/* ── بطاقات المستويات ───────────────────────────────────────────── */}
        <section className="mt-8" aria-label="مستويات الاشتراك">
          <h2 className="font-serif text-2xl font-bold">ثلاثة مستويات — مفتوحة للجميع</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            كل مستوى متاح بسعر شهري وسعر سنوي. وخصم طلاب المرحلتين 2 و3
            يسري على جميع المستويات والفترتين — للأبد.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {nivaer.map((niva) => (
              <NivaKort
                key={niva.id}
                niva={niva}
                rabattFas={rabattFas}
                markerad={niva.id === mittId}
                ingar={INGAR_PER_NIVA[niva.id] ?? [niva.beskrivning]}
              />
            ))}
          </div>

          {/* ملاحظة الأسعار — مقابل مترجم لملاحظة priser.json
              (data/portfolj-system/priser.json، محدثة 2026-09-01). */}
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {uppdaterad && <>أساس الأسعار محدّث في {uppdaterad}. </>}
            حُدّدت مستويات الأسعار في 2026-09-03 — والقرار لمالك المشروع.
            جميع المبالغ بالكرونة السويدية SEK شاملة ضريبة القيمة المضافة
            25 % (وفق القسم 5 من شروط الاستخدام ومتطلبات قانون حماية
            المستهلك على الإعلان عن الأسعار شاملة الضريبة). ويحصل أعضاء
            المرحلتين 2 و3 على خصم {rabattProcent} % على جميع المستويات،
            دائمًا وتلقائيًا.
          </p>
        </section>

        {/* ── القسم القانوني ─────────────────────────────────────────────── */}
        <section className="mt-10 rounded-xl border border-gold/30 bg-card p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold">
            كيف يختلف هذا عن المشورة الاستثمارية
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            تحليل قائم على البحث — وليس مشورة استثمارية وفق القانون السويدي
            (2007:528) بشأن أعمال الأوراق المالية (lagen (2007:528) om
            värdepappersrörelser). AK1A Portföljforskning مادة تعليمية ضمن
            AK1A Research Lab؛ والعميل يتخذ قراراته دائمًا بنفسه ويتحمل
            مسؤوليتها.
          </p>
          <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              "لا توصيات شخصية — لا نقول لك أبدًا ماذا تشتري أنت أو تبيع",
              "لا خدمات إدارة — لا نلمس أموالك أبدًا",
              "كل الافتراضات والمصادر معلَنة بشكل مفتوح — يمكنك إعادة إنتاجها بنفسك",
              "التجديد فقط بعد خيار نشط (اشتراك صريح) — أبدًا لا تجديد صامت تلقائي",
            ].map((punkt) => (
              <li key={punkt} className="flex gap-2">
                <span className="text-gold" aria-hidden="true">
                  ✓
                </span>
                <span>{punkt}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-lg border border-gold/30 bg-paper p-4 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">حق العدول والمحتوى الرقمي.</strong>{" "}
            لك كمستهلك حق عدول خلال 14 يومًا وفق القانون السويدي (2005:59)
            بشأن العقود عن بُعد والعقود خارج المواقع التجارية (lagen
            (2005:59) om distansavtal och avtal utanför affärslokaler) — لكن
            بالنسبة للمحتوى الرقمي الذي يُسلَّم فورًا ينتهي حق العدول بمجرد
            بدء التسليم بموافقتك الصريحة. طريقة عمل ذلك عمليًا مشروحة في{" "}
            <Link href="/villkor#sektion-6" className="underline hover:text-foreground">
              شروط الاستخدام (القسم 6)
            </Link>
            .
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href="/finansiell-policy"
              className="rounded-md border border-gold/50 px-4 py-2 font-semibold hover:bg-gold/10"
            >
              السياسة المالية
            </Link>
            <Link
              href="/ar/transparens"
              className="rounded-md border border-gold/50 px-4 py-2 font-semibold hover:bg-gold/10"
            >
              الشفافية وحماية البيانات (GDPR)
            </Link>
            <Link
              href="/villkor"
              className="rounded-md border border-gold/50 px-4 py-2 font-semibold hover:bg-gold/10"
            >
              شروط الاستخدام
            </Link>
          </div>
        </section>

        {/* ── التفعيل ────────────────────────────────────────────────────── */}
        <section className="mt-10" aria-label="تفعيل الاشتراك">
          <h2 className="font-serif text-2xl font-bold">فعّل اشتراكك</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            الاشتراك مفتوح للجميع. لم يُربط تدفق الدفع بعد — يتم التفعيل عبر
            مراسلة قصيرة مع info@ak1nvestor.com، ويُحفظ طلبك في متصفحك حتى
            ذلك الحين.
          </p>
          <div className="mt-6">
            <AktiveraPanel nivaer={nivaer} rabattFas={rabattFas} />
          </div>
        </section>

        {/* ── الختام ─────────────────────────────────────────────────────── */}
        <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
          متردد في اختيار المستوى؟ اكتشف{" "}
          <Link href="/ar/medlemskap" className="underline hover:text-foreground">
            العضوية وتعليمات المراحل
          </Link>{" "}
          أولًا — فالمرحلتان 2 و3 تمنحان خصمًا {rabattProcent} % على
          الاشتراك، للأبد. تريد رؤية المنهجية وهي تعمل؟{" "}
          <Link href="/vagfundament" className="underline hover:text-foreground">
            أساس الموجات
          </Link>{" "}
          و{" "}
          <Link href="/konfluens" className="underline hover:text-foreground">
            رادار التلاقي
          </Link>{" "}
          متاحان كأداتين مجانيتين.
        </p>
      </div>
    </SeoPageShell>
  );
}
