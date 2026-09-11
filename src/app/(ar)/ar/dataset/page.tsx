import type { Metadata } from "next";

import { lasBranschMedianer } from "@/lib/dataset-medianer";
import { DatasetIndexVy } from "@/components/ak1a/dataset-sidor";
import { spegelMetadata } from "@/lib/spegel-metadata";
import { skapaT } from "@/lib/sprak";

/**
 * /ar/dataset — arabisk spegel av /dataset (VÅG 97 E1). Route-gruppmönstret
 * (våg 51/85): sidan ligger i (ar)/ar/dataset ⇒ /ar/dataset med <html
 * lang="ar" dir="rtl"> från (ar)-rotlayouten. ALL text i ordlistans
 * "dataset"-domän (svenska först — källa för MÖS-ronden), läst via
 * skapaT("ar") med sv-fallback. ISR 24 h, samma som originalet.
 * RTL-medvetenhet: pilarna i detalj/tillbaka-länkarna är speglade i
 * ordlistans ar-rader (←/→ byter sida i semitisk textriktning).
 */
export const dynamic = "force-static";
export const revalidate = 86400;

const MEDIANER = lasBranschMedianer();
const t = skapaT("ar");

export const metadata: Metadata = spegelMetadata({
  lang: "ar",
  sida: "dataset",
  title: t("dataset.meta.titel"),
  description: t("dataset.meta.beskrivning", {
    nBolag: MEDIANER.totalt.nBolag,
    hamtat: MEDIANER.hamtat ?? "—",
  }),
  keywords: [
    "وسيط P/E",
    "مؤشرات مالية حسب القطاع",
    "متوسط P/E",
    "هامش EBIT",
    "مجموعة بيانات",
    "AK1A Research Lab",
  ],
});

export default function DatasetPageAr() {
  return <DatasetIndexVy lang="ar" medianer={MEDIANER} />;
}
