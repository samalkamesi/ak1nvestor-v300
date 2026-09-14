import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { bolagSlugs, bolagUrSlug, syskonBolag } from "@/lib/bolags-sidor";
import { lasBranschMedianer, branschUrSlug } from "@/lib/dataset-medianer";
import { getAnalyses } from "@/lib/content";
import { lasAnalyser } from "@/lib/analysfabrik";
import { BolagDetaljVy } from "@/components/ak1a/bolag-sidor";
import { sidaMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { StrukturData } from "@/components/seo/StrukturData";

/**
 * /bolag/[slug] — nyckeltalssida per bolag (VÅG 149, B1): bolagets publika
 * nyckeltal + avvikelse mot branschmedian + AKM2-sammanfattning + länkar.
 * SSG via generateStaticParams (en statisk sida per bolag — 100 st),
 * därefter ISR 24 h. Okänd slug ⇒ 404 (aldrig påhittade nyckeltal).
 * Stoppregel B: rådatan bär inga rekommendations-/kursmålsfält (se
 * bolags-sidor.ts) — sidan kan inte rendera rådgivning.
 */
export const dynamic = "force-static";
// Okända params ⇒ 404 FÖRE render (force-static ensam serverar annars
// layout-skalet med 200 = soft-404; samma rad som dataset/[bransch]).
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return bolagSlugs().map((slug) => ({ slug }));
}

/** Tickerjämförelse över filformat: "VOLCAR-B" ≡ "VOLCAR-B.ST" ≡ "VOLCAR_B_ST". */
const tickerNyckel = (t: string) => t.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sida = bolagUrSlug(slug);
  if (!sida) return {};
  const tickerKod = sida.ticker.split(".")[0];
  const pe = sida.pe !== null ? sida.pe.toFixed(1).replace(".", ",") + "x" : "—";
  const ebit =
    sida.ebitMarginal !== null
      ? (sida.ebitMarginal * 100).toFixed(1).replace(".", ",") + " %"
      : "—";
  return sidaMetadata({
    path: `/bolag/${sida.slug}`,
    title: `${sida.namn} (${tickerKod}) nyckeltal — P/E ${pe} och branschjämförelse`,
    description: `${sida.namn} (${sida.ticker}) nyckeltal ur AK1A:s universum: P/E ${pe}, EBIT-marginal ${ebit}, tillväxt och balans —jämfört med branschens median. Utbildning i att läsa nyckeltal — inte investeringsråd.`,
    keywords: [
      `${tickerKod} nyckeltal`,
      `${sida.namn} nyckeltal`,
      `${tickerKod} P/E`,
      `${tickerKod} nyckeltal branschjämförelse`,
      "AK1A Research Lab",
    ],
  }).metadata;
}

export default async function BolagDetaljSida({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sida = bolagUrSlug(slug);
  if (!sida) notFound();

  const medianRad = branschUrSlug(lasBranschMedianer(), sida.bransch);
  const syskon = syskonBolag(slug);
  const nyckel = tickerNyckel(sida.ticker);
  const harDjupanalys = getAnalyses().some((a) => tickerNyckel(a.ticker) === nyckel);
  const harForskningsanalys = lasAnalyser().some((a) => tickerNyckel(a.ticker) === nyckel);

  return (
    <>
      <StrukturData
        data={breadcrumbJsonLd([
          { name: "Bolag", path: "/bolag" },
          { name: sida.namn, path: `/bolag/${sida.slug}` },
        ])}
        id="jsonld-brodsmula-bolag"
      />
      <BolagDetaljVy
        sida={sida}
        medianRad={medianRad}
        syskon={syskon}
        harDjupanalys={harDjupanalys}
        harForskningsanalys={harForskningsanalys}
      />
    </>
  );
}
