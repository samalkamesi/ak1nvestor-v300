import type { Metadata } from "next";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { StrukturData } from "@/components/seo/StrukturData";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { NetnetSkanner } from "@/components/ak1a/netnet-skanner";
import { SektionsCta } from "@/components/ak1a/sektions-cta";

export const dynamic = "force-static";
// force-static ensamt ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /kurser sedan våg 82.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  path: "/netnet",
  title: "Net-net-skannern — hitta bolag under NCAV som Graham | AK1A",
  description:
    "Screena 25 svenska och nordiska bolag mot Grahams klassiska net-net-kriterium: kurs under 2/3 av Net Current Asset Value (omsättningstillgångar minus totala skulder). Resultattabell sorterad på kurs/NCAV med grön NET-NET-markering, guld NÄRA och pedagogisk ingress om cigar-butts — och varför de är så sällsynta idag. Pedagogiskt verktyg, aldrig investeringsråd.",
  keywords: [
    "net-net",
    "NCAV",
    "net current asset value",
    "Benjamin Graham",
    "cigar butts",
    "värdeinvestering",
    "aktiescreening",
    "undervärderade aktier",
    "balansräkningsanalys",
  ],
});

/**
 * Dataväg: klientkomponenten fetchar /api/netnet (route — samma
 * exekveringskontext som övriga analys-API:er; server actions levererade
 * inte timeseries-data).
 */
export default function NetnetPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Net-net-skannern" }]} wide>
      <StrukturData id="jsonld-webbsajt" data={websiteJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">Net-net-skannern</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Benjamin Grahams mest extrema värdekriterium: köp bolag som handlas under två tredjedelar
        av sin Net Current Asset Value — omsättningstillgångarna minus samtliga skulder. Då
        betalar marknaden mindre än rörelsekapitalet och resten av bolaget är gratis. Skanna
        ett fast universum av 25 välkända svenska och nordiska tickers mot senaste
        balansräkning, se hur nära Grahams tröskel varje bolag handlas — och lär dig varför
        riktiga net-net idag är värdefällor lika ofta som fynd.
      </p>
      <div className="mt-10">
        <NetnetSkanner />
      </div>

      {/* v160 P2.5 (audit #4): sidans konverterings-CTA — startsidans standard */}
      <SektionsCta />
    </SeoPageShell>
  );
}
