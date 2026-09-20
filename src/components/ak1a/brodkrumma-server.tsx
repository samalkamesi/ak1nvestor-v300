import { oversattText, skapaT } from "@/lib/sprak";
import type { SprakId } from "@/lib/sprak";
import { BrodkrummaVy } from "@/components/ak1a/brodkrumma-vy";

/**
 * BRÖDKRUMMA — SERVER-BINDNING (o105, spår 7; o101 §4 Kur B).
 *
 * Spegelbyggarens breadcrumb (namnen kommer ur t() = skapaT(lang) eller
 * svensk originaltext) bind här mot spegelns språk på SERVERN: smulorna
 * SSR:as rätt och navigationsraden hydratiseras aldrig. oversattText är
 * samma exakta ordlistenuppslag som klientens tText — ingen ändring i
 * vilka ord som översätts, endast VAR i livscykeln bindningen sker.
 *
 * Sv-rötter använder brodkrumma.tsx (useSprak-MGTM) som förut.
 */
export function BrodkrummaServer({
  breadcrumb,
  lang,
}: {
  breadcrumb?: Array<{ name: string; href?: string }>;
  lang: SprakId;
}) {
  return (
    <BrodkrummaVy
      breadcrumb={breadcrumb}
      t={skapaT(lang)}
      tText={(text) => oversattText(text, lang)}
    />
  );
}
