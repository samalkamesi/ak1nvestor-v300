import type { Metadata } from "next";
import { pageMetadata, JsonLd, websiteJsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { NetnetSkanner } from "@/components/ak1a/netnet-skanner";
import { skannaNetnet, type NetnetRad } from "@/lib/netnet-motor";

export const dynamic = "force-static";

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
 * Server action — datamotorn körs på servern (Yahoos cookie+crumb-flöde
 * kräver Node + SSRF-kontroll via dns). Klientkomponenten anropar den
 * per batch (max 15 tickers) och får NetnetRad[] i retur.
 */
async function skannaAction(tickers: string[]): Promise<NetnetRad[]> {
  "use server";
  return skannaNetnet(tickers);
}

export default function NetnetPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Net-net-skannern" }]} wide>
      <JsonLd data={websiteJsonLd()} />
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
        <NetnetSkanner skanna={skannaAction} />
      </div>
    </SeoPageShell>
  );
}
