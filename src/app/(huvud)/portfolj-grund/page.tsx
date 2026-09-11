import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TierSida } from "@/components/ak1a/portfolj-tier/tier-sida";
import { pageMetadata } from "@/lib/seo";
import { tierAktiv } from "@/lib/tier-status";
import { PRISER } from "@/lib/variabler";

// VÅG 99 G2: ISR som /prenumeration — pristalen live via lasPriserGallande()
// (Supabase-override, filen = fallback) inom 300 s-fönstret.
export const revalidate = 300;

// Metadata sätts ENDAST när tier-flaggan är PÅ (b2b-mönstret) — i AV-läge
// svarar rutten 404 och ingen sälj-copy läcker i <head>. Fil-defaults ur
// variabelregistret (PRISER interpolerar priser.json — inga hårdkodade belopp).
export const metadata: Metadata = tierAktiv()
  ? pageMetadata({
      path: "/portfolj-grund",
      title: `Portföljforskning Grund — hela underlaget varje månad | ${PRISER.forskningManad} kr/mån | AK1A`,
      description: `Portföljforskning Grund: månadsvis forskningsportfölj i vald riskprofil med AKM1-poäng, fundamental och teknisk vågstatus per horisont, golvmarginal och kravkontroller — ${PRISER.forskningManad} kr/mån eller ${PRISER.forskningAr} kr/år. Pedagogiskt utbildningsmaterial — inte investeringsrådgivning.`,
      keywords: [
        "portföljforskning grund",
        "forskningsportfölj",
        "AKM1 poäng",
        "vågstatus aktier",
        "golvmarginal",
        "portföljuppföljning Sverige",
      ],
    })
  : {};

/**
 * /portfolj-grund — SÄLJSIDA FÖR TIER "forskning" (våg 99 G2: PRISSTEGEN
 * BAKOM FLAGGA; syskon till /portfolj-plus — registret bär tre tier-namn).
 *
 * Färdigbyggd men AVSTÄNGD (default): kundens slutliga prisbeslut väntar —
 * EXISTS-kravet. ALDRIG aktiverad autonomt av byggagent (R2: prissättning =
 * kundens beslut).
 *
 * ADMIN-AKTIVERING EN RAD: sätt `NEXT_PUBLIC_TIER_AKTIV=1` i miljön
 * (pm2:s ecosystem-env) + `pm2 restart` — sidan blir live senast vid nästa
 * ISR-fönster (revalidate 300 s); snabbast via ombyggnad. Syskonsidorna
 * /portfolj-plus och /portfolj-hyra grindas mot SAMMA flagga.
 *
 * GRINDEN (RSC-flight-mönstret från våg 80c/86): tierAktiv() === false ⇒
 * notFound() FÖRE all datahämtning — rutten svarar 404, robots.ts bjuder
 * inte in den och sitemap.ts listar den inte. /prenumeration länkar INTE
 * hit (ingen dödlänk).
 *
 * Priserna (Grund-nivån ur data/portfolj-system/priser.json, live-överstyrd
 * via lasPriserGallande) läses av TierSida ur variabelregistret — ALDRIG
 * hårdkodade i sid-filen.
 *
 * Pedagogiskt utbildningsmaterial — inte investeringsrådgivning (2007:528).
 */
export default async function PortfoljGrundPage() {
  // GRINDEN — före TierSida:s datahämtning (lasPriserGallande/korstabell).
  if (!tierAktiv()) notFound();

  return <TierSida tierId="forskning" />;
}
