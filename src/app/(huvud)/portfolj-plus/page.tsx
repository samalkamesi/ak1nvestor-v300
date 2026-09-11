import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TierSida } from "@/components/ak1a/portfolj-tier/tier-sida";
import { pageMetadata } from "@/lib/seo";
import { tierAktiv } from "@/lib/tier-status";
import { PRISER } from "@/lib/variabler";

// VÅG 99 G2: ISR som /prenumeration — pristalen live via lasPriserGallande()
// (Supabase-override, filen = fallback) inom 300 s-fönstret.
export const revalidate = 300;

// Metadata sätts ENDAST när tier-flaggan är PÅ (b2b-mönstret): i AV-läge
// svarar rutten 404 och ingen sälj-copy läcker i <head>. Fil-defaults ur
// variabelregistret (SEO-stabilt enligt våg 79-kontraktet — inga hårdkodade
// belopp, PRISER interpolerar priser.json).
export const metadata: Metadata = tierAktiv()
  ? pageMetadata({
      path: "/portfolj-plus",
      title: `Portföljforskning Plus — ersättningsförslag och vågmatris | ${PRISER.plusManad} kr/mån | AK1A`,
      description: `Portföljforskning Plus: allt i Grund plus löpande ersättningsförslag när strikta krav bryts (upp till tre per bransch), månads-uppföljning då-vs-nu, kvartalsvis djupuppföljning och portföljens samlade vågmatris — ${PRISER.plusManad} kr/mån eller ${PRISER.plusAr} kr/år. Pedagogiskt utbildningsmaterial — inte investeringsrådgivning.`,
      keywords: [
        "portföljforskning plus",
        "ersättningsförslag aktier",
        "vågmatris portfölj",
        "då vs nu uppföljning",
        "AKM1 portfölj",
        "forskningsportfölj prenumeration",
      ],
    })
  : {};

/**
 * /portfolj-plus — SÄLJSIDA FÖR TIER "forskning-plus" (våg 99 G2: PRISSTEGEN
 * BAKOM FLAGGA, STYRELSE-ADMIN-MEGA.md "VÅG 99").
 *
 * Färdigbyggd men AVSTÄNGD (default): kundens slutliga prisbeslut väntar —
 * EXISTS-kravet. ALDRIG aktiverad autonomt av byggagent (R2: prissättning =
 * kundens beslut).
 *
 * ADMIN-AKTIVERING EN RAD: sätt `NEXT_PUBLIC_TIER_AKTIV=1` i miljön
 * (pm2:s ecosystem-env) + `pm2 restart` — sidan blir live senast vid nästa
 * ISR-fönster (revalidate 300 s); snabbast via ombyggnad. Syskonsidorna
 * /portfolj-grund och /portfolj-hyra grindas mot SAMMA flagga.
 *
 * GRINDEN (RSC-flight-mönstret från våg 80c/86): tierAktiv() === false ⇒
 * notFound() FÖRE all datahämtning — ingen sälj-copy, inga priser och ingen
 * markup når prerender-/RSC-payloaden; rutten svarar 404, robots.ts bjuder
 * inte in den och sitemap.ts listar den inte. /prenumeration länkar INTE
 * hit (ingen dödlänk) — länkarna mellan tier-sidorna renderas bara när
 * flaggan är PÅ.
 *
 * Priserna (Plus-nivån ur data/portfolj-system/priser.json, live-överstyrd
 * via lasPriserGallande) läses av TierSida ur variabelregistret — ALDRIG
 * hårdkodade i sid-filen.
 *
 * Pedagogiskt utbildningsmaterial — inte investeringsrådgivning (2007:528).
 */
export default async function PortfoljPlusPage() {
  // GRINDEN — före TierSida:s datahämtning (lasPriserGallande/korstabell).
  if (!tierAktiv()) notFound();

  return <TierSida tierId="forskning-plus" />;
}
