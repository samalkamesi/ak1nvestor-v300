import type { Metadata } from "next";
import { pageMetadata, JsonLd, websiteJsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { PortfolioSystem } from "@/components/ak1a/portfolio-system";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  path: "/min-portfolj",
  title: "Min portfölj — AKM1-analys av dina aktier | AK1A",
  description:
    "Lägg in dina innehav och få portföljanalys: AKM1 per aktie, vågprofil för mikro-, kort-, medel- och långsikt, koncentration, sektorspridning, risk och personliga tips.",
  keywords: [
    "portföljanalys",
    "analys mina aktier",
    "AKM1 portfölj",
    "portföljrisk",
    "våganalys portfölj",
  ],
});

export default function MinPortfoljPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Min portfölj" }]} wide>
      <JsonLd data={websiteJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">Din portfölj — institutionellt genomlyst</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
        Lägg in vad du äger — bolag, antal aktier, kurs. Systemet analyserar varje
        aktie för sig (som vår Precise Biometrics-analys), väger samman portföljens
        AKM1-poäng, vågbild per tidshorisont, riskmått och ger dig tips och tankar.
        Allt utifrån dina egna siffror — pedagogiskt, inte investeringsråd.
      </p>
      <div className="mt-10">
        <PortfolioSystem />
      </div>
    </SeoPageShell>
  );
}
