"use client";

import { useSprak } from "@/components/ak1a/sprak-leverantor";
import { BrodkrummaVy } from "@/components/ak1a/brodkrumma-vy";

/**
 * BRÖDSMULOR — KLIENT-BINDNING (sv-rötter) av seo-page-shell:s navigationsrad.
 *
 * Varje brödsmulenamn som skickas från page.tsx passeras genom
 * tText() = exakt matchning mot ordlistans svenska värden ("Kurser",
 * "Läroplanen", "Biblioteket" …). Träff ⇒ valt språk; ingen träff ⇒
 * originalet (svenska). Layouten lever i brodkrumma-vy.tsx (o105).
 *
 * o105 (spår 7): på SPEGLAR används brodkrumma-server.tsx (skapaT(lang) +
 * oversattText på servern, ingen hydratisering); denna bindning betjänar
 * originalsidorna med oförändrat MGTM-beteende.
 *
 * Separatorn speglas logiskt (⁄ förblir neutral), och i RTL läser
 * läsaren raden höger-vänster via document.dir — inget extra.
 */
export function Brodkrumma({
  breadcrumb,
}: {
  breadcrumb?: Array<{ name: string; href?: string }>;
}) {
  const { t, tText } = useSprak();

  return <BrodkrummaVy breadcrumb={breadcrumb} t={t} tText={tText} />;
}
