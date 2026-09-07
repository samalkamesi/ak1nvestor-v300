"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
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
 * VÅG 80A — SPEGELREGELN: på spegelroutrar (/en/**, /ar/**) vinner spegelns
 * språk ALLTID (t, tText, kontextens sprak/dir) — en direktbesökare utan
 * sparat UI-val ser annars spegelns innehåll med svensk meny/footer.
 * Serverrenderingen är fortfarande alltid svenska; regeln slås på först
 * efter montering (monteringsgrind) så hydreringen förblir identisk.
 * Utanför speglarna följs UI-valet (localStorage ⇒ navigator ⇒ sv) som förr.
 *
 * useSprak() fungerar ÄVEN utan leverantör (fallback-kontexten = svenska)
 * — en komponent kan aldrig krascha på grund av ett saknat omslag.
 */

export type SprakKontext = {
  /** Renderat språk: på speglar (/en/**, /ar/**) spegelns språk, annars UI-valet. "sv" på servern. */
  sprak: SprakId;
  /** Textriktning för det renderade språket. */
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

  // VÅG 80A — monteringsgrinden: SSR + hydreringspasset renderar svenska som
  // alltid (servern ser aldrig localStorage); spegelregeln slås på först
  // efter montering på klienten ⇒ server-HTML och hydreringsrendering
  // förblir byte-identiska, vilket den än må tro om usePathname under
  // prerender. Textnoderna byts därefter i samma MGTM-svep som vanligt.
  const [monterad, setMonterad] = useState(false);
  useEffect(() => setMonterad(true), []);

  // VÅG 80A — SPEGELREGELN FÖR ALLA TEXTER (fullföljer våg 78 C #6): på
  // spegelroutrar (/en/**, /ar/**) vinner SPEGELNS språk inte bara i
  // <html lang/dir> utan även i t()/tText()/sprak/dir. Innan denna rad
  // såg direkta besökare (sökmotor → /en/kurser/..., utan sparat UI-val)
  // engelskt/arabiskt sidinnehåll med SVENSK huvudmeny, footer och
  // CTA:er — kundens "får problem"-rapport. Utanför speglarna följer
  // UI-valet som förr (oförändrat beteende på originalsidorna).
  const spegelSprak = monterad ? sprakPrefix(pathname) : null;
  const effektivtSprak = spegelSprak ?? sprak;

  // <html lang> + <html dir> — extern-systemsynk vid varje byte (ar ⇒ rtl).
  // Effekten körs endast på klienten (post-montering) där effektivtSprak
  // redan inbegriper spegelregeln; pathname i deps behövs inte längre —
  // växling in/ut ur speglar ändrar effektivtSprak och triggar om.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = effektivtSprak;
    document.documentElement.dir = dirForSprak(effektivtSprak);
  }, [effektivtSprak]);

  const setSprak = useCallback((ny: SprakId) => {
    lagerSprak = ny;
    sparaSprak(ny);
    lyssnare.forEach((l) => l());
  }, []);

  const t = useCallback<SprakKontext["t"]>(
    (nyckel, parametrar) => oversatt(nyckel, effektivtSprak, parametrar),
    [effektivtSprak],
  );

  const tText = useCallback<SprakKontext["tText"]>(
    (text) => oversattText(text, effektivtSprak),
    [effektivtSprak],
  );

  const varde = useMemo<SprakKontext>(
    () => ({ sprak: effektivtSprak, dir: dirForSprak(effektivtSprak), setSprak, t, tText }),
    [effektivtSprak, setSprak, t, tText],
  );

  return <SprakContext.Provider value={varde}>{children}</SprakContext.Provider>;
}

/** Konsumera språket: const { t, sprak, dir } = useSprak(); */
export function useSprak(): SprakKontext {
  return useContext(SprakContext);
}

/**
 * VÅG 81 — SPEGEL-LEVERANTÖREN (SSR): nästlad under /en- och /ar-layouterna.
 *
 * Våg 80a lärde kontexten spegelregeln (spegelns språk vinner), men regeln
 * slogs på FÖRST EFTER MONTERING — serverrenderingen (och därmed prod-HTML:n
 * som sökmotorer och våg 81:s no-JS-verifiering ser) var fortsatt svensk:
 * svensk footer-megameny + svensk "Logga in"-knapp på /en|/ar-speglar.
 *
 * Denna leverantör får spegelns språk som PROP från en server-layout
 * (src/app/en/layout.tsx | src/app/ar/layout.tsx) — samma deterministiska
 * värde serverrenderas och hydreras (RSC-payloaden bär propen), så
 * t()/tText()/sprak/dir är spegelns språk FRÅN FÖRSTA BYTET utan någon
 * monteringsgrind och omöjlig hydreringsmismatch. Skyddet mot det 80a
 * oroade sig för (usePathname osäkert under prerender) kvarstår: inget
 * pathname-läsande alls — språket sitter i layoutträdet.
 *
 * Semantiken är oförändrad vs 80a: på spegeln vinner spegelns språk ALLTID
 * (UI-valet undertrycks); setSprak skriver fortfarande det delade lagret +
 * localStorage så SprakVäxlarens flöde (spara val ⇒ navigera till spegeln)
 * fungerar som förut. Ursprungliga sidor (/kurser, /blogg, …) berörs ej —
 * där gäller rot-leverantörens MGTM-beteende oförändrat.
 */
export function SpegelSprakLeverantor({
  lang,
  children,
}: {
  lang: SprakId;
  children: React.ReactNode;
}) {
  const setSprak = useCallback<SprakKontext["setSprak"]>((ny: SprakId) => {
    lagerSprak = ny;
    sparaSprak(ny);
    lyssnare.forEach((l) => l());
  }, []);

  const varde = useMemo<SprakKontext>(
    () => ({
      sprak: lang,
      dir: dirForSprak(lang),
      setSprak,
      t: (nyckel, parametrar) => oversatt(nyckel, lang, parametrar),
      tText: (text) => oversattText(text, lang),
    }),
    [lang, setSprak],
  );

  return <SprakContext.Provider value={varde}>{children}</SprakContext.Provider>;
}
