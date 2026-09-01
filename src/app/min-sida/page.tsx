import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { MinSida } from "@/components/ak1a/min-sida";

export const metadata: Metadata = pageMetadata({
  path: "/min-sida",
  title: "Min Sida — din utbildning på ett ställe | AK1A",
  description:
    "Din personliga dashboard i AK1A Research Lab: nivå och XP, streak, stjärnor, läroplanens framsteg, badges, flashcards, certifikat och alla analysverktyg — allt samlat på ett ställe.",
  keywords: ["min sida", "dashboard", "utbildning", "XP", "streak", "badges", "flashcards", "AK1A"],
});

export default function MinSidaPage() {
  return (
    <SeoPageShell wide breadcrumb={[{ name: "Min Sida" }]}>
      <MinSida />
    </SeoPageShell>
  );
}
