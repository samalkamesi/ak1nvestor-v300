import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { KognitivProfil } from "@/components/ak1a/kognitiv-profil";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  path: "/diagnos",
  title: "AI-Diagnos — upptäck din inlärningsprofil | AK1A",
  description:
    "Interaktivt textäventyr som mäter din inlärningsstil, tidsallokering, drivkraft, kunskapsnivå och risktolerans — på 3 minuter. AI-motorn anpassar sedan hela din kursupplevelse.",
  keywords: ["inlärningstest", "AI-diagnos", "inlärningsstil", "aktieanalys nivåtest", "kognitiv profil"],
});

export default function DiagnosPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "AI-Diagnos" }]}>
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold">🧠 AI-Diagnos</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          6 scenarier. 3 minuter. Ingen rätt eller fel — bara ärliga val som avslöjar
          hur DIN hjärna fungerar. Resultatet anpassar hela din upplevelse på AK1A.
        </p>
      </div>
      <div className="mt-10">
        <KognitivProfil />
      </div>
    </SeoPageShell>
  );
}
