import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { branschSlugs, branschUrSlug, lasBranschMedianer } from "@/lib/dataset-medianer";
import { DatasetBranschVy, branschNamn, datasetTal } from "@/components/ak1a/dataset-sidor";
import { spegelMetadata } from "@/lib/spegel-metadata";
import { skapaT } from "@/lib/sprak";

/**
 * /ar/dataset/[bransch] — arabisk spegel av bransch-detaljsidan (VÅG 97 E1).
 * Samma kontrakt som originalet: enbart medianer med n — ALDRIG per-bolags-
 * poäng eller bolagsnamn. Text ur ordlistans "dataset"-domän (sv först,
 * ar ifyllt i fas 1-stil — MÖS-ronden håller det aktuellt). SSG via
 * generateStaticParams + ISR 24 h. Okänd bransch ⇒ 404.
 */
export const dynamic = "force-static";
export const revalidate = 86400;

const MEDIANER = lasBranschMedianer();
const t = skapaT("ar");

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
  const namn = branschNamn("ar", rad.bransch);
  return spegelMetadata({
    lang: "ar",
    sida: "dataset/" + rad.bransch,
    title: t("dataset.meta.detalj.titel", {
      bransch: namn,
      pe: datasetTal(rad.medianPe, "ar"),
      n: rad.nPe,
    }),
    description: t("dataset.meta.detalj.beskrivning", {
      bransch: namn,
      nBolag: MEDIANER.totalt.nBolag,
      hamtat: MEDIANER.hamtat ?? "—",
      pe: datasetTal(rad.medianPe, "ar"),
      pb: datasetTal(rad.medianPb, "ar"),
      ebit: datasetTal(rad.medianEbitMarginal, "ar"),
      fcf: datasetTal(rad.medianFcfMarginal, "ar"),
      tillvaxt: datasetTal(rad.medianTillvaxt, "ar"),
    }),
    keywords: [`وسيط P/E ${namn}`, "وسيطات القطاع", "AK1A Research Lab"],
  });
}

export default async function DatasetBranschPageAr({
  params,
}: {
  params: Promise<{ bransch: string }>;
}) {
  const { bransch } = await params;
  const rad = branschUrSlug(MEDIANER, bransch);
  if (!rad) notFound();
  return <DatasetBranschVy lang="ar" medianer={MEDIANER} rad={rad} />;
}
