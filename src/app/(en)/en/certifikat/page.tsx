import type { Metadata } from "next";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Certifikat } from "@/components/ak1a/certifikat";
import { spegelMetadata } from "@/lib/spegel-metadata";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * /en/certifikat — engelsk spegel av den svenska certifikat-sidan
 * (våg 113, mikroagent P). Mönsterkälla: /en/kurser (våg 51) — spegelMetadata
 * (egen kanonisk URL + hreflang-triaden), force-static + ISR 1 h. Sidhuvudets
 * texter nedan är genuine engelska; certifikat-kortet (Certifikat) översätts
 * internt via useSprak + ordlistans cert.*-nycklar (våg 113) — (en)-layoutens
 * SpegelSprakLeverantor ger "en" från första renderingen. lankPrefix="/en"
 * leder Fas 2-länken till /en/medlemskap#fas2. Latinska varumärken
 * (AK1A, AKM1, AK1TS, XP) förblir latinska.
 */
export const metadata: Metadata = spegelMetadata({
  lang: "en",
  sida: "certifikat",
  title: "Your Certificate — Institutional Stock Analysis | AK1A Research Lab",
  description:
    "Official proof of your competence in institutional stock analysis. Grades A–D based on level, XP and completed courses. Shareable on LinkedIn.",
  keywords: [
    "stock analysis certificate",
    "AK1A certificate",
    "proof of education",
    "competence certificate",
  ],
});

export default function CertifikatPageEn() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Certificates" }]}>
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold">Your Certificate</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          An auto-generated proof of your competence — updated live as you
          complete courses. Shareable on LinkedIn and other platforms.
        </p>
      </div>
      <div className="mt-10">
        <Certifikat lankPrefix="/en" />
      </div>
    </SeoPageShell>
  );
}
