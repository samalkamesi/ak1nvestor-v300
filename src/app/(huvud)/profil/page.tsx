import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { KognitivProfiler } from "@/components/ak1a/kognitiv-profiler";
import { SektionsCta } from "@/components/ak1a/sektions-cta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  path: "/profil",
  title: "Din finansiella personlighet — kognitiv profil | AK1A",
  description:
    "Interaktivt scenario-test som mäter din riskaptit, kognitiva bias och beslutsfattande under press — på 3 minuter. Få en personlig profil och rekommenderad startnivå.",
  keywords: ["riskprofil", "finansiell personlighet", "investeringstest", "beteendefinans", "AK1A"],
});

export default function ProfilPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Profil" }]}>
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold">Din finansiella personlighet</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Fem verkliga marknadsscenarier. Dina val avslöjar din riskaptit, kognitiva
          bias och beslutsstil under press. På 3 minuter får du en personlig profil
          och rekommenderad startnivå i läroplanen.
        </p>
      </div>
      <div className="mt-10">
        <KognitivProfiler />
      </div>

      {/* v160 P2.5 (audit #4): sidans konverterings-CTA — startsidans standard */}
      <SektionsCta />
    </SeoPageShell>
  );
}
