import type { Metadata } from "next";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { StrukturData } from "@/components/seo/StrukturData";
import { Portfoljbyggare } from "@/components/ak1a/portfoljbyggare";

export const dynamic = "force-static";
// force-static ensamt ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /kurser sedan våg 82.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  path: "/portfoljbyggare",
  title: "Portföljbyggaren — se risk och spridning förändras i realtid | AK1A",
  description:
    "Bygg en tänkt portfölj rad för rad och se sektorsdonut, viktat AKM1-genomsnitt och AK1TS-vågfördelning förändras i realtid — med pedagogiska varningar vid koncentration över 40% och sektorer över 50%. Färdscener från Schlacht-koncentration till Ferri-ryggrad. Pedagogiskt verktyg, aldrig investeringsråd.",
  keywords: [
    "portföljbyggare",
    "portfölj allokering verktyg",
    "riskspridning aktier",
    "sektorsfördelning",
    "position sizing",
    "AKM1 poäng",
    "AK1TS vågklass",
    "kärna-satellit strategi",
  ],
});

export default function PortfoljbyggarePage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Portföljbyggaren" }]} wide>
      <StrukturData id="jsonld-webbsajt" data={websiteJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">Portföljbyggaren</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Ett interaktivt verktyg där du komponerar en tänkt portfölj och SER risken förändras.
        Lägg till bolag, välj sektor, dra i vikt- och AKM1-reglagen och gissa vågklass per
        position — sektorsdonuten, det viktade AKM1-snittet och AK1TS-vågfördelningen svarar
        direkt, och guld-rutorna varnar när koncentrationen växer. Testa färdscenerna från
        Schlacht-koncentration till Ferri-ryggrad, eller bygg från ett tomt blad. Ditt utkast
        sparas automatiskt i webbläsaren.
      </p>
      <div className="mt-10">
        <Portfoljbyggare />
      </div>
    </SeoPageShell>
  );
}
