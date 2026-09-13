import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { branschSlugs, branschUrSlug, lasBranschMedianer } from "@/lib/dataset-medianer";
import { DatasetBranschVy, branschNamn, datasetTal } from "@/components/ak1a/dataset-sidor";
import { sidaMetadata } from "@/lib/seo";
import { skapaT } from "@/lib/sprak";

/**
 * /dataset/[bransch] — detaljsida per bransch (VÅG 97 E1): alla fem publika
 * medianerna (P/E, P/B, EBIT-marginal, FCF-marginal, omsättningstillväxt)
 * med observationsantal, metodförklaring, uppdateringsdatum och disclaimer.
 * SSG via generateStaticParams (en statisk sida per bransch i universumet —
 * 10 st), därefter ISR 24 h. Okänd bransch ⇒ 404 (aldrig påhittade medianer).
 * Text: ordlistans "dataset"-domän; talen interpoleras per språk i metan.
 */
export const dynamic = "force-static";
// Okända params ⇒ 404 FÖRE render (force-static ensam serverar annars
// layout-skalet med 200 = soft-404; samma rad som blogg/[slug] och kurserna).
export const dynamicParams = false;
export const revalidate = 86400;

const MEDIANER = lasBranschMedianer();
const t = skapaT("sv");

export function generateStaticParams() {
  return branschSlugs(MEDIANER).map((bransch) => ({ bransch }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bransch: string }>;
}): Promise<Metadata> {
  const { bransch } = await params;
  const rad = branschUrSlug(MEDIANER, bransch);
  if (!rad) return {};
  const namn = branschNamn("sv", rad.bransch);
  return sidaMetadata({
    path: "/dataset/" + rad.bransch,
    title: t("dataset.meta.detalj.titel", {
      bransch: namn,
      pe: datasetTal(rad.medianPe, "sv"),
      n: rad.nPe,
    }),
    description: t("dataset.meta.detalj.beskrivning", {
      bransch: namn,
      nBolag: MEDIANER.totalt.nBolag,
      hamtat: MEDIANER.hamtat ?? "—",
      pe: datasetTal(rad.medianPe, "sv"),
      p25pe: datasetTal(rad.p25Pe, "sv"),
      p75pe: datasetTal(rad.p75Pe, "sv"),
      pb: datasetTal(rad.medianPb, "sv"),
      ebit: datasetTal(rad.medianEbitMarginal, "sv"),
      fcf: datasetTal(rad.medianFcfMarginal, "sv"),
      tillvaxt: datasetTal(rad.medianTillvaxt, "sv"),
    }),
    keywords: [
      `median P/E ${namn.toLowerCase()}`,
      `P/E ${namn.toLowerCase()}`,
      `${namn.toLowerCase()} nyckeltal`,
      "branschmedianer",
      "AK1A Research Lab",
    ],
    harSpeglar: true,
  }).metadata;
}

export default async function DatasetBranschSida({
  params,
}: {
  params: Promise<{ bransch: string }>;
}) {
  const { bransch } = await params;
  const rad = branschUrSlug(MEDIANER, bransch);
  if (!rad) notFound();
  return <DatasetBranschVy lang="sv" medianer={MEDIANER} rad={rad} />;
}
