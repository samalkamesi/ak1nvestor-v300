"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  dirForSprak,
  hamtaSprak,
  oversatt,
  oversattText,
  sparaSprak,
  sprakPrefix,
  type SprakId,
  type SprakParametrar,
} from "@/lib/sprak";
import type { OrdlistaNyckel } from "@/lib/ordlista";

/**
 * SPRÄK-LEVERANTÖREN — rot-kontexten för sv | en | ar (fas 1, SPRAK-PLAN.md).
 *
 * Klientside-språk UTAN routing-omläggning: SSG-oförändrad (servern renderar
 * alltid svenska), hydreringen resolverar sparat val ⇒ navigator ⇒ svenska.
 *
 * MGTM (minimal graceful textnodsmutation): språket läses via
 * useSyncExternalStore med SERVER-SNAPSHOT "sv" — serverrendering och
 * hydreringspass är identiska (ingen mismatch, ingen blink), varefter React
 * synkar klientens värde och ENBAST textnoder i komponenter som konsumerar
 * useSprak().t byter innehåll. <html lang> + <html dir> sätts i samma svep
 * (dir="rtl" för arabiska) — det är en extern-systemsynk (tillåtet i effect).
 *
 * useSprak() fungerar ÄVEN utan leverantör (fallback-kontexten = svenska)
 * — en komponent kan aldrig krascha på grund av ett saknat omslag.
 */

export type SprakKontext = {
  /** Valt språk ("sv" på servern tills hydreringen resolverat). */
  sprak: SprakId;
  /** Textriktning för valt språk. */
  dir: "ltr" | "rtl";
  /** Byt språk — sparar localStorage + uppdaterar kontexten. */
  setSprak: (sprak: SprakId) => void;
  /** Typsäker översättning med {parameter}-interpolation, sv-fallback. */
  t: (nyckel: OrdlistaNyckel, parametrar?: SprakParametrar) => string;
  /** Best-effort fritextöversättning (brödsmulor etc.), sv vid ingen träff. */
  tText: (text: string) => string;
};

const FALLBACK_KONTEXT: SprakKontext = {
  sprak: "sv",
  dir: "ltr",
  setSprak: () => {},
  t: (nyckel, parametrar) => oversatt(nyckel, "sv", parametrar),
  tText: (text) => text,
};

const SprakContext = createContext<SprakKontext>(FALLBACK_KONTEXT);

// ── Extern store (useSyncExternalStore — hydrationssäker) ──────────────────
// Modulnivå: enleverantörsapp med delat värde; setSprak skriver + notifierar.

let lagerSprak: SprakId | null = null;
const lyssnare = new Set<() => void>();

function prenumerera(cb: () => void): () => void {
  lyssnare.add(cb);
  return () => lyssnare.delete(cb);
}

/** Klientsnapshot: explicit val ⇒ localStorage ⇒ navigator ⇒ sv. */
function lasKlientSprak(): SprakId {
  return lagerSprak ?? hamtaSprak();
}

/** Serversnapshot: alltid svenska — SSG-renderingen är svensk. */
function lasServerSprak(): SprakId {
  return "sv";
}

export function SprakLeverantor({ children }: { children: React.ReactNode }) {
  const sprak = useSyncExternalStore(prenumerera, lasKlientSprak, lasServerSprak);
  const pathname = usePathname() ?? "/";

  // <html lang> + <html dir> — extern-systemsynk vid varje byte (ar ⇒ rtl).
  // VÅG 78 C #6: på spegelroutrar (/en/**, /ar/**) vinner SPEGELNS språk —
  // sidinnehållet är på spegelns språk oavsett UI-val (tillsammans med
  // inline-skripten i src/app/{en,ar}/layout.tsx som täcker första
  // SSR-passet). pathname i deps: SprakVäxlarens router.push in/ut ur
  // speglar ska synkas direkt — utanför speglarna följer <html> UI-språket
  // som förr (oförändrat beteende).
  useEffect(() => {
    if (typeof document === "undefined") return;
    const htmlSprak: SprakId = sprakPrefix(pathname) ?? sprak;
    document.documentElement.lang = htmlSprak;
    document.documentElement.dir = dirForSprak(htmlSprak);
  }, [sprak, pathname]);

  const setSprak = useCallback((ny: SprakId) => {
    lagerSprak = ny;
    sparaSprak(ny);
    lyssnare.forEach((l) => l());
  }, []);

  const t = useCallback<SprakKontext["t"]>(
    (nyckel, parametrar) => oversatt(nyckel, sprak, parametrar),
    [sprak],
  );

  const tText = useCallback<SprakKontext["tText"]>(
    (text) => oversattText(text, sprak),
    [sprak],
  );

  const varde = useMemo<SprakKontext>(
    () => ({ sprak, dir: dirForSprak(sprak), setSprak, t, tText }),
    [sprak, setSprak, t, tText],
  );

  return <SprakContext.Provider value={varde}>{children}</SprakContext.Provider>;
}

/** Konsumera språket: const { t, sprak, dir } = useSprak(); */
export function useSprak(): SprakKontext {
  return useContext(SprakContext);
}
