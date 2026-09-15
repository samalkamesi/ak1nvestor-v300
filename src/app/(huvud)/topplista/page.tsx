import type { Metadata } from "next";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Topplista } from "@/components/ak1a/topplista";

// Statisk per default ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /kurser sedan våg 82.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Topplistan — elevernas förtjänade XP | AK1A Research Lab",
  description:
    "AK1A-eleverna rankade på förtjänade XP: quiz, kurser och flashcards. Poängen tas inte — poängen förtjänas. Logga in gratis och klättra.",
  alternates: { canonical: "https://lab.ak1nvestor.com/topplista" },
};

export default function TopplistaPage() {
  return (
    <SeoPageShell wide breadcrumb={[{ name: "Topplistan" }]}>
      <Topplista />
    </SeoPageShell>
  );
}
