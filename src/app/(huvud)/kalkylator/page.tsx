import type { Metadata } from "next";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { StrukturData } from "@/components/seo/StrukturData";
import { Akm1Calculator } from "@/components/ak1a/akm1-calculator";
import { Akm2DemoStrip } from "@/components/ak1a/akm2-dashboard";

export const dynamic = "force-static";
// force-static ensamt ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /kurser sedan våg 82.
export const revalidate = 3600;

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
      <StrukturData id="jsonld-webbsajt" data={websiteJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">AKM1-kalkylatorn</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
        Så arbetar analytiker: poängsätt varje variabel 0–5, se helheten förändras.
        Dra i reglagen — rekommendationen och kategorisnitten uppdateras direkt.
        Osäker på vad en variabel betyder? Klicka på namnet för hela kursen.
      </p>

      {/* AKM2-demo-strip — förhandsvisning medan AKM2-läget ej låst
          (våg 57 D3; det fullständiga läget byggs av D1 i kalkylatorn). */}
      <Akm2DemoStrip />

      <div className="mt-10">
        <Akm1Calculator />
      </div>
    </SeoPageShell>
  );
}
