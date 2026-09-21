import type { Metadata } from "next";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { StrukturData } from "@/components/seo/StrukturData";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { RapportakademinPass } from "@/components/ak1a/rapportakademin-pass";

export const dynamic = "force-static";
// force-static ensamt ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /kurser och /rapporter.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  path: "/rapportakademin",
  title: "Rapportakademin — öva på riktiga årsredovisningar | AK1A",
  description:
    "Rapportakademin är övningsverkstan för årsredovisningsläsning: du bedömer riktiga bolagstalsiffror först, låser din bedömning — och får sedan expertens läsning av samma tal. A-Ö-pass per bolag med AKM1-rubrik, spacing på dina egna fel och Fas 2-medlemskap. Pedagogisk finansutbildning — aldrig investeringsråd.",
  keywords: [
    "rapportakademin",
    "öva årsredovisning",
    "läsa bolagsrapporter",
    "AKM1",
    "AKM2",
    "bruttomarginal övning",
    "ROE övning",
    "skuldsättningsgrad övning",
    "Fas 2",
    "deliberate practice",
  ],
});

export default function RapportakademinPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Rapportakademin" }]} wide>
      <StrukturData id="jsonld-webbsajt" data={websiteJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">Rapportakademin</h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
        Att läsa en årsredovisning är hantverk — och hantverk byggs genom övning
        på riktiga material. I Rapportakademin arbetar du igenom verkliga
        bolagsrapporter, sektion för sektion: du bedömer först, låser din
        bedömning, och först därefter släpps expertens läsning av samma siffror
        fram. Fempasssrubriken mäter kalibreringen mot AKM1:s variabler — aldrig
        avkastning. Pedagogisk utbildning, inte investeringsråd.
      </p>
      <div className="mt-10">
        <RapportakademinPass />
      </div>
    </SeoPageShell>
  );
}
