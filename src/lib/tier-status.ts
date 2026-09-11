/**
 * TIER-AKTIVERINGSFLAGGAN (våg 99 G2, STYRELSE-ADMIN-MEGA.md "VÅG 99") —
 * exakt b2bAktiv()-mönstret (src/lib/b2b-status.ts, våg 77 B1).
 *
 * Portfölj-tier-sidorna (/portfolj-grund · /portfolj-plus · /portfolj-hyra)
 * är FÄRDIGBYGGDA men AVSTÄNGDA: kundens slutliga prisbeslut väntar
 * (EXISTS-kravet — sidorna bygger klara men oåtkomliga tills beslutet).
 *
 * ADMIN-AKTIVERING EN RAD: sätt `NEXT_PUBLIC_TIER_AKTIV=1` i miljön
 * (pm2:s ecosystem-env) + `pm2 restart` = sidorna blir live — noll
 * kodändring. Sidorna är ISR (revalidate 300 s), så aktiv lever är
 * senast vid nästa ISR-fönster; snabbast via ombyggnad (`npm run build`
 * + deploy på Vercel, samma väg som B2B-flaggan).
 *
 * ALDRIG aktiverad autonomt av byggagent (R2: prissättning = kundens
 * beslut). Default är AV: sidorna svarar 404 via notFound()-grinden
 * (FÖRE all datahämtning — RSC-flight-mönstret från våg 80c), robots.ts
 * bjuder inte in dem och sitemap.ts listar dem inte. PÅ-läge: allt
 * återställs — säljsidorna, priserna ur variabelregistret och
 * tier-länkarna mellan syskonsidorna finns kvar oskadda hela vägen.
 */
export function tierAktiv(): boolean {
  return process.env.NEXT_PUBLIC_TIER_AKTIV === "1";
}
