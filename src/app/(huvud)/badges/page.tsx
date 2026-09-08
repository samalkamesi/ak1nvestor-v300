import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { BadgPanel } from "@/components/ak1a/badg-panel";

export const metadata: Metadata = pageMetadata({
  path: "/badges",
  title: "Badges & meriten — din insamling | AK1A",
  description:
    "Din insamling av förtjänade troféer i AK1A Research Lab — från första inloggningen till hundra dagars eld. Kurser, streaks, XP-milstolpar och ekosystemet samlas här.",
  keywords: ["badges", "meriter", "achievements", "troféer", "gamification", "AK1A"],
});

export default function BadgesPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Badges" }]}>
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          AK1A Research Lab
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold">
          Badges <span className="text-gold">&</span> Meriten
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Ditt trophies-skåp — varje merit är förtjänad genom riktiga insatser:
          klarade kurser, daglig disciplin och ekosystemet i bruk.
        </p>
      </div>
      <div className="mt-10">
        <BadgPanel />
      </div>
    </SeoPageShell>
  );
}
