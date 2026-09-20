import type { Metadata } from "next";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { DagensPass } from "@/components/ak1a/dagens-pass";
import { spegelMetadata } from "@/lib/spegel-metadata";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * /en/dagens-pass — engelsk spegel av den svenska ritual-sidan (VÅG 113,
 * mikroagent D). Samma struktur som "src/app/(huvud)/dagens-pass/page.tsx"
 * (SeoPageShell + DagensPass), metadata enligt spegelmönstret från
 * "src/app/(en)/en/kurser/page.tsx": spegelMetadata + force-static +
 * revalidate 3600. Komponenten hämtar själv sitt pass från /api/dagens-pass
 * på klienten — sidan förblir därför statisk. Alla UI-texter följer
 * språkleverantörens spegelregel (engelska på /en/**).
 */

export const metadata: Metadata = spegelMetadata({
  lang: "en",
  sida: "dagens-pass",
  title: "Today's Session — 5 Minutes of Daily Market Training | AK1A",
  description:
    "Your daily 5-minute ritual: call the wave class of today's stock on real live data, answer today's quiz question (+10 XP), review flashcards and keep your streak alive. Educational — not advice.",
  keywords: [
    "today's session",
    "daily market training",
    "daily stock education",
    "wave class quiz",
    "Elliott waves stocks",
    "spaced repetition stocks",
  ],
});

export default function DagensPassPageEn() {
  return (
    <SeoPageShell lang="en" breadcrumb={[{ name: "Today's Session" }]}>
      <DagensPass />
    </SeoPageShell>
  );
}
