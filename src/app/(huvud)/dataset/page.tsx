import type { Metadata } from "next";

import { lasBranschMedianer } from "@/lib/dataset-medianer";
import { DatasetIndexVy } from "@/components/ak1a/dataset-sidor";
import { sidaMetadata } from "@/lib/seo";
import { skapaT } from "@/lib/sprak";

/**
 * /dataset — index-sidan för de publika branschmedianerna (VÅG 97 E1,
 * DATASET-CITERINGSMAGNETER mot STYRELSE-ADMIN-MEGA VÅG 97 / AI-
 * innovationsprogrammets FRONT A). Citeringsmagnet: ENBESTÄMT, STRUKTURERAT,
 * DATAUNIKT, VÄLFORMAT — bransch · median-P/E · antal bolag · länk.
 *
 * KONTRAKT (A2-DATASET-KONTRAKT §1): endast branschmedianer med
 * n-redovisning — ALDRIG per-bolagspoäng eller bolagsnamn. ALL text i
 * ordlistans "dataset"-domän (svenska först; MÖS-källregistret täcker den
 * automatiskt). ISR 24 h (revalidate 86400) — dateringen i sidan bärs av
 * rådatans hämtdatum, inte av renderingstillfället. Fullt speglad på
 * /en/dataset + /ar/dataset (harSpeglar ⇒ hreflang-kluster).
 */
export const dynamic = "force-static";
export const revalidate = 86400;

const MEDIANER = lasBranschMedianer();
const t = skapaT("sv");

export const metadata: Metadata = sidaMetadata({
  path: "/dataset",
  title: t("dataset.meta.titel"),
  description: t("dataset.meta.beskrivning", {
    nBolag: MEDIANER.totalt.nBolag,
    hamtat: MEDIANER.hamtat ?? "—",
  }),
  keywords: [
    "branschmedianer",
    "median P/E",
    "P/E bransch",
    "P/B bransch",
    "EBIT-marginal",
    "FCF-marginal",
    "nyckeltal branschjämförelse",
    "dataset",
    "AK1A Research Lab",
  ],
  harSpeglar: true,
}).metadata;

export default function DatasetSida() {
  return <DatasetIndexVy lang="sv" medianer={MEDIANER} />;
}
