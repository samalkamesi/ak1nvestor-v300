import { skapaT } from "@/lib/sprak";
import type { SprakId } from "@/lib/sprak";
import { SidfooterVy } from "@/components/ak1a/sidfooter-vy";

/**
 * SIDFOOTER — SERVER-BINDNING (o105, spår 7; o101 §4 Kur A).
 *
 * Används av SeoPageShell när spegelbyggaren lämnat lang="en|ar":
 * rutten KÄNNER språket ((en)/(ar)-routingen) och t() är ett rent
 * lexikonuppslag (skapaT) — etiketterna SSR:as RÄTT från början och
 * footerns 81 element + länkar hydratiseras ALDRIG på speglarna.
 *
 * Våg 81-garantin bevarad: direktbesökare utan sparat UI-val (och utan
 * JS) ser spegelns språk i footer-HTML:n — spegelns språk vinner alltid,
 * nu utan ens en klientomrendering. SEO +53 länkar förblir serverrenderade.
 * TrafikStatusRad förblir klient (egen "use client") — liten ö.
 *
 * Sv-rötter använder INTE denna bindning: där gäller sidfooter.tsx
 * (useSprak-MGTM) med oförändrat beteende och identisk DOM.
 */
export function SidfooterServer({ lang }: { lang: SprakId }) {
  return <SidfooterVy t={skapaT(lang)} />;
}
