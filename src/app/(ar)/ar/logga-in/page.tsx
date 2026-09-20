import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { LoggaInAr } from "./logga-in-ar";
import { SIFFROR } from "@/lib/siffror";

export const dynamic = "force-static";

/** أرقام عربية شرقية مع فاصل الآلاف العربي. */
const num = (n: number) => n.toLocaleString("ar-EG");

/**
 * المرآة العربية لصفحة /logga-in (الموجة 51 — الوكيل S2).
 *
 * هيكل الصفحة مترجم هنا؛ والنموذج التفاعلي في المكوّن العميل المُساند
 * logga-in-ar.tsx (الواجهة البرمجية ومخزن العضوية نفسيهما كالنموذج
 * السويدي، والنصوص عربية). نصوص مستقلة — لا سلاسل مشتركة مع الصفحة
 * السويدية.
 */
export const metadata: Metadata = {
  title: "تسجيل الدخول — حساب مجاني وكل الدورات مفتوحة | AK1A",
  description: `سجّل الدخول بالبريد الإلكتروني أو أنشئ حسابًا مجانيًا: جميع الدورات البالغة ${SIFFROR.kurser} دورة، والحاسبة، ونظام المحافظ — مجانًا تمامًا، إلى الأبد.`,
  keywords: ["تسجيل الدخول", "حساب مجاني", "تعليم أسواق الأسهم مجانًا", "AK1A"],
  alternates: {
    canonical: `${SITE_URL}/ar/logga-in`,
    languages: {
      "sv-SE": `${SITE_URL}/logga-in`,
      en: `${SITE_URL}/en/logga-in`,
      ar: `${SITE_URL}/ar/logga-in`,
      "x-default": `${SITE_URL}/logga-in`,
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
    title: "تسجيل الدخول — حساب مجاني وكل الدورات مفتوحة | AK1A",
    description: "بريد إلكتروني واحد يفتح كل ما في المرحلة ١ — مجانًا تمامًا، إلى الأبد.",
    url: `${SITE_URL}/ar/logga-in`,
    siteName: "AK1A Research Lab",
    type: "website",
    locale: "ar_AR",
    alternateLocale: ["sv_SE", "en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "تسجيل الدخول — حساب مجاني | AK1A",
    description: `جميع الدورات البالغة ${num(SIFFROR.kurser)} دورة، والحاسبة، ونظام المحافظ — مجانًا إلى الأبد.`,
  },
};

export default function ArLoggaInPage() {
  return (
    <SeoPageShell lang="ar" breadcrumb={[{ name: "البداية", href: "/ar" }, { name: "تسجيل الدخول" }]}>
      <div dir="rtl">
        <h1 className="text-center font-serif text-4xl font-bold">مرحبًا بك في AK1A</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground leading-relaxed">
          منهجية مؤسسية — كحقٍّ للجميع. حساب واحد يفتح كل ما في المرحلة ١،
          مجانًا تمامًا. يُحفظ تقدّمك وتكسب نقاط الخبرة (XP) والنجوم مع كل
          دورة.
        </p>
        <div className="mt-10">
          <LoggaInAr />
        </div>
      </div>
    </SeoPageShell>
  );
}
