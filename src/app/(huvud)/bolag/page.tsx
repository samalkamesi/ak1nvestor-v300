import type { Metadata } from "next";

import { publiceradeBolagSidor } from "@/lib/bolags-sidor";
import { BolagIndexVy } from "@/components/ak1a/bolag-sidor";
import { sidaMetadata } from "@/lib/seo";

/**
 * /bolag — index över 100-bolagsuniversumet (VÅG 149, B1 i
 * SOKORDSINVENTERING-2026: "ABB nyckeltal"-longtailen; störst
 * sökvolym-täckning per kodrad eftersom datan redan lever).
 *
 * SSG (force-static): universumet läses vid build; ISR 24 h för färska
 * datafiler utan ombygge — samma kontrakt som datasetmenyerna.
 *
 * o146: registret listar PUBLICERADE bolag (byggets nedteckning, se
 * bolags-sidor.ts) — en universumväxt utan deploy syns här först vid
 * nästa bygge. ISR-revalidation får aldrig exponera syskonlänkar till
 * sidor rutten 404:ar (gapet 249 lovade mot 243 byggda, 2026-09-21).
 */
export const dynamic = "force-static";
export const revalidate = 86400;

const SIDOR = publiceradeBolagSidor();

export const metadata: Metadata = sidaMetadata({
  path: "/bolag",
  title: "Bolagsregister — nyckeltal för 100 bolag i tio branscher",
  description:
    "Nyckeltal för alla 100 bolag i AK1A:s forskningsuniversum: P/E, P/B, marginaler och tillväxt mot branschmedianen, med källor och hämtdatum. Pedagogisk utbildning — inte investeringsråd.",
  keywords: [
    "bolagsregister",
    "nyckeltal bolag",
    "P/E bolag",
    "branschjämförelse nyckeltal",
    "AK1A Research Lab",
  ],
}).metadata;

export default function BolagIndexSida() {
  const hamtat = SIDOR.reduce<string | null>(
    (max, s) => (s.hamtat && s.hamtat > (max ?? "") ? s.hamtat : max),
    null,
  );
  return <BolagIndexVy sidor={SIDOR} hamtat={hamtat} />;
}
