import type { ReactNode } from "react";

/**
 * AR-SPEGELNS LAYOUT (VÅG 78 C #6) — <html lang="ar" dir="rtl"> på
 * spegel-nivå. Se src/app/en/layout.tsx för det fullstända resonemanget
 * (nästlad layout äger inte <html>; inline-skript pre-hydration +
 * spegelmedveten SprakLeverantor för SPA-navigering). dir="rtl" gäller nu
 * på DOKUMENTNIVÅ — de inre rtl-containrar som spegelsidorna redan har
 * förblir oförändrade.
 */
export default function ArSpegelLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: 'try{var d=document.documentElement;d.lang="ar";d.dir="rtl";}catch(e){}',
        }}
      />
      {children}
    </>
  );
}
