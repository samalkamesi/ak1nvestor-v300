import { existsSync } from "node:fs";
import path from "node:path";

// ── SITEMAP-BYGGSANNING (o146, spår 8 — vakten 0-fynd-jakt) ─────────────────
//
// ROTORSAK (bevisad 2026-09-21, prod): sitemap.xml är force-dynamisk och
// läser datafilerna LIVE (bolagsunivers.json 249 rader) medan /bolag/[slug],
// /dataset/[bransch], /dataset/[bransch]/[aspekt] och /rapportakademin är
// force-static + dynamicParams=false — sidorna FINNS bara om generateStaticParams
// såg dem vid SENASTE GRÖNA byggtilfället. När byggen dör (OOM ⇒ prod-synken
// återställer .next ur läkebackupen) medan data växer, annonserar sitemap
// sidor som tjänsten svarar 404 på (bevis: 6 bolagssidor + rapportakademin
// 404 på prod 2026-09-21 medan sitemap listade dem; Search Console-risk och
// gränsnittsvaktslarm 24 fynd).
//
// KUR: sitemap får ALDRIG annonsera en byggstad sida som det körande bygget
// saknar. Sanningen om vad bygget kan leverera ligger i dess egna filer:
// .next/server/app/<sökväg>.html. Denna vakt gör ETT existsSync per URL —
// fail-open (reklamerar) när bygginformation saknas eller sonden felar, så
// att dev/first-run/sondfel ALDRIG tyst gallrar sitemapen. Endast ett
// konstaterat "bygget har inte sidan" håller URL:en tillbaka — till nästa
// gröna bygge levererar den (då syns den igen, automatiskt).
//
// OMFATTNING: endast de byggfasta (dynamicParams=false)-klasser vars URL-mängd
// härleds ur datafiler eller tillkommit efter ett bygge: bolag, dataset-bransch
// (sv/en/ar), dataset-aspekt, rapportakademin. On-demand-ISR-rutter
// (dynamicParams=true, t.ex. kurser/blogg) självtjänar nya params och behöver
// ingen byggvakt.

/** Sanningskälla: produktionsbyggets utdata-mapp i den körande processen. */
const BYGG_APP = path.join(process.cwd(), ".next", "server", "app");

/** Sentinel-cache: finns BUILD_ID + app-mappen? (oförändrad under processens
 *  livstid — nytt bygge = ny process; ISR:s on-demand-filer berör inte de
 *  dynamicParams=false-klasser vakten bevakar). null = inte mätt än. */
let bygginfoOk: boolean | null = null;

/**
 * Finns pålitlig bygginformation i denna process? Utan .next (dev, ren klon)
 * har sitemapen ingen byggsanning att spegla — då reklamerar vi som före
 * o146 (fail-open) istället för att tyst tömma sitemapen.
 */
function bygginfoFinns(): boolean {
  if (bygginfoOk === null) {
    try {
      bygginfoOk =
        existsSync(path.join(process.cwd(), ".next", "BUILD_ID")) && existsSync(BYGG_APP);
    } catch {
      bygginfoOk = false;
    }
  }
  return bygginfoOk;
}

/**
 * Kan det körande bygget leverera sidan? relSokvag = sajt-sökväg utan
 * leading slash ("bolag/hm-b-st", "dataset/energi/brutto-marginal",
 * "rapportakademin"). true = reklamera (sidan finns, eller bygginformation
 * saknas/sonden felar — fail-open); false = håll tillbaka (bygget KONSTATERAT
 * saknar sidan; nästa gröna bygge släpper in den igen).
 */
export function byggdSidaFinns(relSokvag: string): boolean {
  if (!bygginfoFinns()) return true;
  try {
    return existsSync(path.join(BYGG_APP, `${relSokvag}.html`));
  } catch {
    return true;
  }
}

/** Nollställ sentinel-cachen (testbarhet). */
export function resetBygginfoCache(): void {
  bygginfoOk = null;
}
