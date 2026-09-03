import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { DagensPass } from "@/components/ak1a/dagens-pass";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  path: "/dagens-pass",
  title: "Dagens Pass — 5 minuters daglig marknadsträning | AK1A",
  description:
    "Din dagliga 5-minutersritual: gissa vågklassen på dagens aktie på riktig live-data, besvara dagens quiz-fråga (+10 XP), repetera flashcards och håll streaken levande. Pedagogiskt — inte råd.",
  keywords: [
    "dagens pass",
    "daglig marknadsträning",
    "aktieutbildning varje dag",
    "vågklass quiz",
    "Elliott-vågor svenska aktier",
    "spaced repetition aktier",
  ],
});

export default function DagensPassPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Dagens Pass" }]}>
      <DagensPass />
    </SeoPageShell>
  );
}
