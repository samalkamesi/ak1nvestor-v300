"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSprak } from "./sprak-leverantor";

/**
 * TOPPVÄXEL — "Privatperson | Företag" (B2B-BESLUT §3.1, våg 61).
 *
 * Separationen är produkt, inte dekor: två världar inom samma domän —
 * privatsidornas öppna pedagogik och AK1A PRO:s B2B-verkstad. Växeln är
 * den intelligenta knappen som kunddirektivet begärde, monterad i
 * utility-raden på ALLA privatsidor (seo-page-shell + SPA-header +
 * mobil-drawer) och SPEGLAD i PRO-skalets header (aktiv = Företag).
 *
 * Regler (b2 §1.3 + FORBUD 4):
 *   • REN LÄNK-separation — URL:n är läget, INGEN cookie, inget localStorage.
 *     SSG-säker, delbar, crawlbart; direktlänk /pro renderar PRO-skalet i
 *     ren HTML oavsett var besökaren kom ifrån.
 *   • AKTIV sida = icke-länk med aria-current="true" (man är redan där).
 *   • Andra sidan = länk (privat vy: Företag → /pro; PRO-vy: Privatperson → /).
 *   • Etiketter via ordlistan (nav.privatperson / nav.foretag) — våg 51-
 *     mönstret: SSG renderar svenska, klienten byter till en/ar direkt.
 *
 * DNA: diskret pill med tunn guldring; AKTIV segment = marin vägg med
 * guldtext (samma signatur som menypanelernas marin-huvuden) — tydlig markering
 * utan att ropa. `stor` = hela bredden i mobil-drawerns egen rad.
 */
export function Toppvaxel({
  variant = "privat",
  stor = false,
  klass,
}: {
  /** "privat" = monterad i privatskalet (aktiv: Privatperson);
   *  "pro" = speglad i PRO-skalet (aktiv: Företag). */
  variant?: "privat" | "pro";
  /** Stor variant för mobil-drawer — helbredds-pill med större tryckyta. */
  stor?: boolean;
  /** Extra klasser på ytbehållaren (t.ex. dold under sm i kompakta header-rader). */
  klass?: string;
}) {
  const { t } = useSprak();
  const privatVy = variant === "privat";

  // Aktiv halva: icke-länk + aria-current. Inaktiva halvan: länk till andra världen.
  const aktivStil = cn(
    "rounded-full font-bold",
    stor
      ? "flex-1 px-4 py-2.5 text-center text-sm"
      : "px-2.5 py-1 text-[11px]"
  );
  const lankStil = cn(
    "rounded-full font-semibold transition-colors hover:text-gold",
    stor
      ? "flex-1 px-4 py-2.5 text-center text-sm"
      : "px-2.5 py-1 text-[11px]"
  );

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-gold/40 bg-gold/5 p-0.5",
        stor && "w-full",
        klass
      )}
    >
      {privatVy ? (
        <>
          <span aria-current="true" className={cn(aktivStil, "marin-panel text-[#E8C766]")}>
            {t("nav.privatperson")}
          </span>
          <Link href="/pro" className={cn(lankStil, "text-muted-foreground")}>
            {t("nav.foretag")}
          </Link>
        </>
      ) : (
        <>
          <Link href="/" className={cn(lankStil, "text-[#EDE6D6]/80 hover:text-[#E8C766]")}>
            {t("nav.privatperson")}
          </Link>
          <span aria-current="true" className={cn(aktivStil, "marin-panel text-[#E8C766]")}>
            {t("nav.foretag")}
          </span>
        </>
      )}
    </span>
  );
}
