import type { Metadata } from "next";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Laroplan } from "@/components/ak1a/laroplan";
import { spegelMetadata } from "@/lib/spegel-metadata";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * /en/laroplan — engelsk spegel av den svenska läroplanen (våg 113,
 * utbildningsorganet). Samma struktur som "src/app/(huvud)/laroplan/page.tsx"
 * (SeoPageShell + Laroplan) enligt spegelmönstret från våg 51-kursspegeln
 * (src/app/(en)/en/kurser/page.tsx): spegelMetadata med egen kanonisk +
 * hreflang, force-static + ISR 1 h. Komponentens alla UI-texter körs via
 * useSprak().t — på /en-spegeln vinner spegelns språk (våg 81, SSR från
 * första bytet). lankPrefix="/en" styr interna länkar till spegelns egna
 * sidor (/en/logga-in, /en/fas2-ansok, /en/fas3, /en/kurser/{slug}).
 * Kurssyftena är kursinnehåll och översätts av fas 3-pipelinen.
 */

export const metadata: Metadata = spegelMetadata({
  lang: "en",
  sida: "laroplan",
  title: "The Curriculum — from Beginner to Stock Analyst | AK1A",
  description:
    "5 levels, 73 courses, one goal: an independent stock analyst. From AKM1's fundamentals through the BOKMASTER canon to practice and independence — completely free.",
  keywords: [
    "stock analysis curriculum",
    "stock analyst education",
    "AKM1 course plan",
    "free stock education",
    "become a stock analyst",
  ],
});

export default function LaroplanPageEn() {
  return (
    <SeoPageShell lang="en" breadcrumb={[{ name: "The Curriculum" }]} wide>
      <Laroplan lankPrefix="/en" />
    </SeoPageShell>
  );
}
