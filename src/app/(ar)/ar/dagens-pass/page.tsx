import type { Metadata } from "next";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { DagensPass } from "@/components/ak1a/dagens-pass";
import { spegelMetadata } from "@/lib/spegel-metadata";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * /ar/dagens-pass — arabisk spegel av den svenska ritual-sidan (VÅG 113,
 * mikroagent D). Samma struktur som "src/app/(huvud)/dagens-pass/page.tsx"
 * (SeoPageShell + DagensPass), metadata enligt spegelmönstret från
 * "src/app/(en)/en/kurser/page.tsx": spegelMetadata + force-static +
 * revalidate 3600. Komponenten hämtar själv sitt pass från /api/dagens-pass
 * på klienten — sidan förblir därför statisk. Alla UI-texter följer
 * språkleverantörens spegelregel (arabiska på /ar/**, dir="rtl" sätts av
 * leverantören). Arabiskan följer ordlistans riktlinjer: modern
 * standardarabiska, latinska varumärken (AKM1, XP) behålls latinska.
 */

export const metadata: Metadata = spegelMetadata({
  lang: "ar",
  sida: "dagens-pass",
  title: "جلسة اليوم — 5 دقائق من التدريب اليومي على السوق | AK1A",
  description:
    "طقوسك اليومية في 5 دقائق: خمّن الفئة الموجية لسهم اليوم على بيانات سوق حقيقية مباشرة، وأجب عن سؤال اليوم (+10 XP)، وراجع بطاقاتك التعليمية وحافظ على سلسلة أيامك. تدريب تعليمي — وليس نصيحة استثمارية.",
  keywords: [
    "جلسة اليوم",
    "التدريب اليومي على السوق",
    "تعليم الأسهم يوميًا",
    "اختبار الفئة الموجية",
    "موجات إليوت للأسهم",
    "التكرار المتباعد للأسهم",
  ],
});

export default function DagensPassPageAr() {
  return (
    <SeoPageShell lang="ar" breadcrumb={[{ name: "جلسة اليوم" }]}>
      <DagensPass />
    </SeoPageShell>
  );
}
