import type { Metadata } from "next";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Laroplan } from "@/components/ak1a/laroplan";
import { spegelMetadata } from "@/lib/spegel-metadata";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * /ar/laroplan — arabisk spegel av den svenska läroplanen (våg 113,
 * utbildningsorganet). Samma struktur som "src/app/(huvud)/laroplan/page.tsx"
 * (SeoPageShell + Laroplan) enligt spegelmönstret från våg 51-kursspegeln
 * (src/app/(ar)/ar/kurser/page.tsx): spegelMetadata med egen kanonisk +
 * hreflang, force-static + ISR 1 h. Komponentens alla UI-texter körs via
 * useSprak().t — på /ar-spegeln vinner spegelns språk (våg 81, SSR från
 * första bytet) och <html dir="rtl"> sätts av språk-leverantören.
 * lankPrefix="/ar" styr interna länkar till spegelns egna sidor
 * (/ar/logga-in, /ar/fas2-ansok, /ar/fas3, /ar/kurser/{slug}).
 * Enligt ordlistans arabiska riktlinjer behålls latinska varumärken
 * (AKM1, BOKMASTER, XP) på latin. Kurssyftena är kursinnehåll och
 * översätts av fas 3-pipelinen.
 */

export const metadata: Metadata = spegelMetadata({
  lang: "ar",
  sida: "laroplan",
  title: "المنهج — من المبتدئ إلى محلل الأسهم | AK1A",
  description:
    "5 مستويات، 73 دورة، هدف واحد: محلل أسهم مستقل. من أساسيات AKM1 مرورًا بمشروع BOKMASTER إلى التطبيق والاستقلالية — مجانًا بالكامل.",
  keywords: [
    "منهج تحليل الأسهم",
    "تعليم تحليل الأسهم",
    "خطة دورات AKM1",
    "تعليم مالي مجاني",
    "كيف تصبح محلل أسهم",
  ],
});

export default function LaroplanPageAr() {
  return (
    <SeoPageShell lang="ar" breadcrumb={[{ name: "المنهج" }]} wide>
      <Laroplan lankPrefix="/ar" />
    </SeoPageShell>
  );
}
