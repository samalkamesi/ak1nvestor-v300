import type { Metadata } from "next";

import { lasBranschMedianer } from "@/lib/dataset-medianer";
import { DatasetIndexVy } from "@/components/ak1a/dataset-sidor";
import { spegelMetadata } from "@/lib/spegel-metadata";
import { skapaT } from "@/lib/sprak";

/**
 * /en/dataset — full mirror of the Swedish /dataset index (VÅG 97 E1).
 * Route-group pattern (våg 51): the page lives in (en)/en/dataset ⇒ /en/dataset
 * with <html lang="en"> from the (en) root layout. ALL page text comes from
 * the ordlista "dataset" domain (sv first — registered as MÖS sources by
 * kalla.ts lasUiKallor), read via skapaT("en") with sv fallback, so the
 * machine-translation round keeps this mirror current without redeploying.
 * ISR 24 h — same as the Swedish original.
 */
export const dynamic = "force-static";
export const revalidate = 86400;

const MEDIANER = lasBranschMedianer();
const t = skapaT("en");

export const metadata: Metadata = spegelMetadata({
  lang: "en",
  sida: "dataset",
  title: t("dataset.meta.titel"),
  description: t("dataset.meta.beskrivning", {
    nBolag: MEDIANER.totalt.nBolag,
    hamtat: MEDIANER.hamtat ?? "—",
  }),
  keywords: [
    "industry median P/E",
    "median P/E by industry",
    "P/B by industry",
    "EBIT margin by industry",
    "FCF margin",
    "key ratio benchmarks",
    "dataset",
    "AK1A Research Lab",
  ],
});

export default function DatasetPageEn() {
  return <DatasetIndexVy lang="en" medianer={MEDIANER} />;
}
