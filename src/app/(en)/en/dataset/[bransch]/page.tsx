import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { branschSlugs, branschUrSlug, lasBranschMedianer } from "@/lib/dataset-medianer";
import { DatasetBranschVy, branschNamn, datasetTal } from "@/components/ak1a/dataset-sidor";
import { spegelMetadata } from "@/lib/spegel-metadata";
import { skapaT } from "@/lib/sprak";

/**
 * /en/dataset/[bransch] — English mirror of the per-industry dataset detail
 * page (VÅG 97 E1). Same contract as the Swedish original: medians + n only,
 * never per-company scores or names. Text from the ordlista "dataset" domain
 * (sv first, en filled in phase-1 style — the MÖS cron keeps it current).
 * SSG via generateStaticParams + ISR 24 h. Unknown industry ⇒ 404.
 */
export const dynamic = "force-static";
export const revalidate = 86400;

const MEDIANER = lasBranschMedianer();
const t = skapaT("en");

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
  const namn = branschNamn("en", rad.bransch);
  return spegelMetadata({
    lang: "en",
    sida: "dataset/" + rad.bransch,
    title: t("dataset.meta.detalj.titel", {
      bransch: namn,
      pe: datasetTal(rad.medianPe, "en"),
      n: rad.nPe,
    }),
    description: t("dataset.meta.detalj.beskrivning", {
      bransch: namn,
      nBolag: MEDIANER.totalt.nBolag,
      hamtat: MEDIANER.hamtat ?? "—",
      pe: datasetTal(rad.medianPe, "en"),
      p25pe: datasetTal(rad.p25Pe, "en"),
      p75pe: datasetTal(rad.p75Pe, "en"),
      pb: datasetTal(rad.medianPb, "en"),
      ebit: datasetTal(rad.medianEbitMarginal, "en"),
      fcf: datasetTal(rad.medianFcfMarginal, "en"),
      tillvaxt: datasetTal(rad.medianTillvaxt, "en"),
    }),
    keywords: [
      `median P/E ${namn.toLowerCase()}`,
      `${namn.toLowerCase()} industry ratios`,
      "industry medians",
      "AK1A Research Lab",
    ],
  });
}

export default async function DatasetBranschPageEn({
  params,
}: {
  params: Promise<{ bransch: string }>;
}) {
  const { bransch } = await params;
  const rad = branschUrSlug(MEDIANER, bransch);
  if (!rad) notFound();
  return <DatasetBranschVy lang="en" medianer={MEDIANER} rad={rad} />;
}
