import type { ReactNode } from "react";
import { SpegelSprakLeverantor } from "@/components/ak1a/sprak-leverantor";

/**
 * EN-SPEGELNS LAYOUT (VÅG 78 C #6) — <html lang> på spegel-nivå.
 *
 * En NÄSTLAD layout får inte rendera <html>/<body> (endast root-layouten
 * äger dokumentelementet i App Router), och root-layouten kan inte veta
 * vilken rout som renderas utan att göra samtliga 700+ SSG-sidor dynamiska.
 * Därför tre samverkande delar:
 *
 *   1. Detta inline-skript (serveras I spegelns HTML, körs vid parse-tid —
 *      FÖRE hydrering och första paint) sätter documentElement.lang/dir.
 *      root-layoutens <html suppressHydrationWarning> gör ändringen
 *      hydreringssäker (samma mönster som nästa-tema).
 *   2. SprakLeverantor (src/components/ak1a/sprak-leverantor.tsx) är
 *      spegelmedveten och håller lang/dir korrekt vid SPA-navigering
 *      in/ut ur /en/** (SprakVäxlaren pushar mellan speglar och original).
 *   3. VÅG 81: SpegelSprakLeverantor (samma fil) ger hela spegelträdet
 *      EN som SSR-språk via prop — footer/meny/"Logga in"-knapp renderas
 *      engelska redan i server-HTML:n (80a:s regel gällde bara post-
 *      montering på klienten), utan hydreringsmismatch eftersom propen
 *      följer med RSC-payloaden.
 */
export default function EnSpegelLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: 'try{var d=document.documentElement;d.lang="en";d.dir="ltr";}catch(e){}',
        }}
      />
      <SpegelSprakLeverantor lang="en">{children}</SpegelSprakLeverantor>
    </>
  );
}
