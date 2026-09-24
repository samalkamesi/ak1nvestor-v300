import type { Metadata } from "next";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Certifikat } from "@/components/ak1a/certifikat";
import { spegelMetadata } from "@/lib/spegel-metadata";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * /ar/certifikat — arabisk spegel av den svenska certifikat-sidan
 * (våg 113, mikroagent P). Mönsterkälla: /en/kurser + /ar/kurser (våg 51) —
 * spegelMetadata (egen kanonisk URL + hreflang-triaden), force-static +
 * ISR 1 h. Sidhuvudets texter är modern standardarabiska enligt ordlistans
 * riktlinjer (latinska varumärken AK1A/AKM1/AK1TS/XP förblir latinska);
 * certifikat-kortet (Certifikat) översätts internt via useSprak + ordlistans
 * cert.*-nycklar (våg 113) — (ar)-layoutens SpegelSprakLeverantor ger "ar"
 * (med dir="rtl") från första renderingen. lankPrefix="/ar" leder Fas 2-
 * länken till /ar/medlemskap#fas2.
 */
export const metadata: Metadata = spegelMetadata({
  lang: "ar",
  sida: "certifikat",
  title: "شهادتك — التحليل المؤسسي للأسهم | AK1A Research Lab",
  description:
    "إثبات رسمي لكفاءتك في التحليل المؤسسي للأسهم. تقديرات من A إلى D وفق المستوى ونقاط XP والدورات المكتملة. قابلة للمشاركة على LinkedIn.",
  keywords: [
    "شهادة تحليل الأسهم",
    "شهادة AK1A",
    "إثبات تعليمي",
    "شهادة كفاءة",
  ],
});

export default function CertifikatPageAr() {
  return (
    <SeoPageShell lang="ar" breadcrumb={[{ name: "الشهادات" }]}>
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold">شهادتك</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          إثبات كفاءتك يُنشأ تلقائيًا — ويتحدّث مباشرةً كلما أكملت دورة.
          قابل للمشاركة على LinkedIn ومنصات أخرى.
        </p>
      </div>
      <div className="mt-10">
        <Certifikat lankPrefix="/ar" />
      </div>
    </SeoPageShell>
  );
}
