import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Certifikat } from "@/components/ak1a/certifikat";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  path: "/certifikat",
  title: "Ditt certifikat — AK1A Research Lab",
  description:
    "Officiellt intyg på din kompetens i institutionell aktieanalys. Betyg A-D baserat på nivå, XP och klarade kurser. Delbart på LinkedIn.",
  keywords: ["certifikat aktieanalys", "AK1A intyg", "utbildningsbevis", "kompetenscertifikat"],
});

export default function CertifikatPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Certifikat" }]}>
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold">Ditt Certifikat</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Auto-genererat intyg på din kompetens — uppdateras live när du klarar kurser.
          Delbart på LinkedIn och andra plattformar.
        </p>
      </div>
      <div className="mt-10">
        <Certifikat />
      </div>
    </SeoPageShell>
  );
}
