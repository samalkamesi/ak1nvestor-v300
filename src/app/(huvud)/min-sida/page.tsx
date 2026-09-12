import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getAnalyses, getCourseList } from "@/lib/content";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Portal } from "@/components/ak1a/portal";
import { MigreraProgressBanner } from "@/components/ak1a/migrera-progress";
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

// VÅG 104 (STYRELSE-PORTAL-MEGA.md): biblioteket ur DISK vid build (statisk
// data — ingen cache mellan medlemmar) → AnalysNavet på dashboarden.
const analysKort = getAnalyses()
  .map((a) => ({
    ticker: a.ticker,
    company: a.company,
    sector: a.sector || "Okänd sektor",
    datum: a.analysisDate || a.verified || "—",
    status: a.status || "",
  }))
  .sort((x, y) => y.datum.localeCompare(x.datum));

// VÅG 103 ("Mina kurser"-gridet): kursuniversumet ur DISK vid build →
// KursNavet. Titlar/kapitel är statiska — medlemmens påbörjade/klara bär
// klientens egna rundturor (sidan förblir statisk).
const kursKort = getCourseList().map((k) => ({
  slug: k.slug,
  titel: k.title,
  kategori: k.category || "Läroplanen",
  kapitel: k.chapterCount,
}));

export default function MinSidaPage() {
  return (
    <SeoPageShell wide breadcrumb={[{ name: "Min Sida" }]}>
      {/* VÅG 87 (FAS L2 §A.3): migreringsbanner — lokal progress på enheten
          ⇒ molnkonto + engångs-import (aggregat endast, GDPR-minimerat). */}
      <div className="mb-6">
        <MigreraProgressBanner />
      </div>
      {/* VÅG 102: PORTALEN — en sessionskontroll styr navet (PortalNav i
          marin-familjen) + Min Sida med kontots server-progress som talgivare.
          VÅG 104: AnalysNavet — senaste analyserna + din bevakning.
          VÅG 103: KursNavet — Mina kurser (påbörjade + klara). */}
      <Portal
        prenumNiva={prenumNiva}
        prenumRabattProcent={prenumRabattProcent}
        analysKort={analysKort}
        kursKort={kursKort}
      />
    </SeoPageShell>
  );
}
