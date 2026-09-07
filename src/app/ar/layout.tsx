import type { ReactNode } from "react";
import { SpegelSprakLeverantor } from "@/components/ak1a/sprak-leverantor";

/**
 * AR-SPEGELNS LAYOUT (VÅG 78 C #6) — <html lang="ar" dir="rtl"> på
 * spegel-nivå. Se src/app/en/layout.tsx för det fullständiga resonemanget
 * (nästlad layout äger inte <html>; inline-skript pre-hydration +
 * spegelmedveten SprakLeverantor för SPA-navigering). dir="rtl" gäller nu
 * på DOKUMENTNIVÅ — de inre rtl-containrar som spegelsidorna redan har
 * förblir oförändrade. VÅG 81: SpegelSprakLeverantor gör arabiskan till
 * SSR-språket för hela spegelträdet (footer/meny/knappar arabiska i
 * server-HTML:n, hydreringssäker via layout-propen).
 */
export default function ArSpegelLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: 'try{var d=document.documentElement;d.lang="ar";d.dir="rtl";}catch(e){}',
        }}
      />
      <SpegelSprakLeverantor lang="ar">{children}</SpegelSprakLeverantor>
    </>
  );
}
