import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse } from "@/lib/content";
import { byggKursSpegel, hamtaKursLager } from "@/lib/kurs-speglar";
import {
  KursSpegelSida,
  kursSpegelGenerateMetadata,
  type KursSpegelTexter,
} from "@/components/ak1a/kurs-spegel-sida";

/**
 * /ar/kurser/[slug] — مرآة دورة ديناميكية (الموجة 52، الوكيل B).
 *
 * نفس معمارية النسخة الإنجليزية: لا بناء مسبق (generateStaticParams ⇒ [] +
 * dynamicParams) — تُنشأ كل صفحة عند أول طلب (ISR، إعادة التحقق كل ساعة)
 * وتسحب الترجمات المنشورة من طبقة الترجمة (Supabase `oversattningar`،
 * الحالة "publicerad" — انظر العقد في src/lib/kurs-speglar.ts).
 *
 * الحاوية كلها dir="rtl" (نفس نمط صفحات /ar في الموجة 51)، والأرقام
 * اللاتينية والاختصارات اللاتينية (AKM1، XP) تبقى كما هي وفق خطة اللغات.
 * فهرس الأسئلة الصحيح (ratt) بنيوي ولا يُترجم أبدًا.
 *
 * SEO: noindex + canonical نحو الأصل السويدي حتى تبلغ نسبة النشر
 * 80 % (INDEX_TRASKEL) — بعدها فهرسة + عنقود hreflang كامل.
 */

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 3600;

/** لا بناء مسبق — 333 دورة × مرآتان تُنشآن عند الطلب. */
export function generateStaticParams(): Array<{ slug: string }> {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return kursSpegelGenerateMetadata("ar", params);
}

/** نصوص الصفحة — العربية الفصحى الحديثة بمصطلحات مالية دقيقة. */
const TEXTER_AR: KursSpegelTexter = {
  notisTitel: (procent) => `هذه الدورة قيد الترجمة — اكتمل ${procent}٪`,
  notisText:
    "تُعرض الفصول بالسويدية الأصلية حتى تُنشر ترجمة كل جزء إلى العربية. الاختبارات وتتبُّع التقدم ونقاط XP تعمل تمامًا كما في الدورة السويدية.",
  whyRubrik: "لماذا هذا المتغيّر حاسم",
  perspektivRubrik: "ثلاثة منظورات",
  perspektivAk1: "تفسير AK1A",
  nyckelinsikt: "الاستنتاج الجوهري",
  ovningarRubrik: "تمارين",
  ovningarIntro: "ثلاثة تمارين لتثبيت المتغيّر — افتح كل تمرين للاطلاع على التوجيه.",
  ovningLabel: "تمرين",
  ledningLabel: "توجيه:",
  ovning1: (titel, vikt) =>
    `اشرح بأسلوبك: ماذا يقيس ${titel}؟ ولماذا يستحق وزن ${vikt} في AKM1؟`,
  ovning2Nummer: (titel) =>
    `تمرين حسابي: أحضِر أحدث الأرقام من التقرير السنوي لإحدى الشركات (انظر «أين أجد الأرقام» في الحاسبة) واحسب ${titel}. ما الدرجة (0–5) التي تعطيها حسابتك؟`,
  ovning2NummerFacit:
    "الإجابة النموذجية هي حسابك نفسه — قارنها بالدرجة التلقائية في الحاسبة على /kalkylator.",
  ovning2Tillampning: (titel) =>
    `تطبيق: اعثر على شركة يتمتع فيها ${titel} بقوة — وأخرى يظهر فيها ضعيفًا. ما الفرق بينهما؟`,
  ovning2TillampningFacit: (kapitelNum, kapitelTitel) =>
    `توجيه: انظر الفصل ${kapitelNum} («${kapitelTitel}»).`,
  ovning3: (titel) =>
    `تأمُّل: كيف ستتأثر محفظتك إذا أخفق أكبر حيازاتك تحديدًا في ${titel}؟`,
  ovning3Facit: "اختبرها في «محفظتي» (/min-portfolj) أو ناقشها في المختبر.",
  fortsattRubrik: "تابع المنهج",
  fortsattText: "التمارين التفاعلية ومصفوفات الموجات والمعلّم الذكي تجدها في المختبر.",
  oppnaLab: "افتح AK1A Research Lab",
  seMedlemskap: "اطّلع على العضويات",
  relaterade: (kategori) => `دورات ذات صلة في ${kategori}`,
};

export default async function KursSpegelPageAr({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const kurs = getCourse(slug);
  if (!kurs) notFound();

  const lager = await hamtaKursLager(slug, "ar");
  const spegel = byggKursSpegel(kurs, lager);

  return <KursSpegelSida lang="ar" spegel={spegel} texter={TEXTER_AR} />;
}
