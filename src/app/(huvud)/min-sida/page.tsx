import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { MinSida } from "@/components/ak1a/min-sida";
import { lasPriser } from "@/lib/portfolj-forskning/korstabell-data";

export const metadata: Metadata = pageMetadata({
  path: "/min-sida",
  title: "Min Sida — din utbildning på ett ställe | AK1A",
  description:
    "Din personliga dashboard i AK1A Research Lab: nivå och XP, streak, stjärnor, läroplanens framsteg, badges, flashcards, certifikat och alla analysverktyg — allt samlat på ett ställe.",
  keywords: ["min sida", "dashboard", "utbildning", "XP", "streak", "badges", "flashcards", "AK1A"],
});

// Prenum-CTA-kortets exempelpris (VÅG 63 O2 #2): läses vid build ur
// priser.json — samma källa som /prenumeration, aldrig hårdkodat här.
const priser = lasPriser();
const prenumNiva =
  priser?.nivaer.find((n) => n.id === "forskning") ?? priser?.nivaer[0] ?? null;
const prenumRabattProcent = priser ? Math.round(priser.rabattFas.fas2 * 100) : 0;

export default function MinSidaPage() {
  return (
    <SeoPageShell wide breadcrumb={[{ name: "Min Sida" }]}>
      <MinSida prenumNiva={prenumNiva} prenumRabattProcent={prenumRabattProcent} />
    </SeoPageShell>
  );
}
