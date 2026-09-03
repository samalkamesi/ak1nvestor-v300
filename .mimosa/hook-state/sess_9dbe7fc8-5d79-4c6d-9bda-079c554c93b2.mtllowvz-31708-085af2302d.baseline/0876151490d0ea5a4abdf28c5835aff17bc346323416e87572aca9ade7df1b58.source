import type { Metadata } from "next";
import { pageMetadata, JsonLd, websiteJsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Akm1Calculator } from "@/components/ak1a/akm1-calculator";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/kalkylator",
  title: "AKM1-kalkylator — testa 20 variabler själv | AK1A",
  description:
    "Dra reglagen för AKM1:s 20 fundamentalvariabler och se rekommendationen uppdateras direkt. Med exempel från riktiga analyser av Precise Biometrics och Volvo Cars.",
  keywords: [
    "AKM1 kalkylator",
    "aktieanalys verktyg",
    "fundamentalanalys kalkylator",
    "räkna aktiepoäng",
    "ROE marginal värdering verktyg",
    "institutionell metodik",
  ],
});

export default function KalkylatorPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Kalkylator" }]} wide>
      <JsonLd data={websiteJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">AKM1-kalkylatorn</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
        Så arbetar analytiker: poängsätt varje variabel 0–5, se helheten förändras.
        Dra i reglagen — rekommendationen och kategorisnitten uppdateras direkt.
        Osäker på vad en variabel betyder? Klicka på namnet för hela kursen.
      </p>
      <div className="mt-10">
        <Akm1Calculator />
      </div>
    </SeoPageShell>
  );
}
