"use client";

/**
 * LASY-GLOBAL — idle-mount av tunga globala klientkomponenter (o1 #5, våg 68).
 *
 * PROBLEM: layout.tsx monterade ChatWidget (1 118 rader + spaced-repetition +
 * chat-minne + badges + member-local), ShortSeller (804 rader), Kommandopaletten
 * och NotisCenter på VARJE sida — 18 chunks / ~1,2 MB JS i den kritiska bunten
 * före hydratisering (LCP/TBT/INP på mobil).
 *
 * LÖSNING (ändrar bara NÄR/HUR komponenterna laddas — inga interna ändringar):
 *
 *  - LasyGlobal: monterar sina barn vid requestIdleCallback (med setTimeout-
 *    fallback för webbläsare utan stöd) ELLER vid första riktiga interaktion
 *    (scroll/pekare/tangent) — det som inträffar först. Schemaläggningen görs
 *    i useEffect, alltså FÖRST när wrappern själv har hydratiserats: servern
 *    renderar null, klientens första rendering är null → hydrationsskillnad
 *    är strukturellt omöjlig och monteringen kan aldrig konkurrera med själva
 *    hydratiseringen.
 *
 *  - De tunga komponenterna hämtas via next/dynamic (ssr:false) → egen chunk
 *    som bara laddas när komponenten verkligen renderas.
 *
 *  - PalettVakt: ⌘K/Ctrl+K-, "/"- och "ak1a:oppna-sok"-lyssnarna är vägerlätta
 *    och registreras direkt vid hydratisering, medan själva paletten (React.lazy)
 *    laddas först vid första öppningen — tangentbordslyssnaren tappas aldrig.
 *    En tyst idle-montering (4 s) återställer palettens automatiska besöks-
 *    registrering (navigationsminnet) även utan öppning, precis som före.
 *
 * CookieConsent lämnas orörd i layout.tsx — den kräver omedelbar synlighet.
 */

import dynamic from "next/dynamic";
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";

// ── de tunga globala komponenterna: egna chunks, aldrig SSR-renderade ────────
const ChatWidgetLaddad = dynamic(
  () => import("@/components/ak1a/chat-widget").then((m) => ({ default: m.ChatWidget })),
  { ssr: false },
);

const ShortSellerLaddad = dynamic(
  () => import("@/components/ak1a/short-seller").then((m) => ({ default: m.ShortSeller })),
  { ssr: false },
);

const NotisCenterLaddad = dynamic(
  () => import("@/components/ak1a/notis-center").then((m) => ({ default: m.NotisCenter })),
  { ssr: false },
);

// Paletten laddas via React.lazy vid första öppningen (se PalettVakt).
const PalettLaddad = lazy(() =>
  import("@/components/ak1a/kommandopalett").then((m) => ({ default: m.Kommandopalett })),
);

// ── idle-schemaläggning med fallback ─────────────────────────────────────────

type IdlePlan = { avbryt: () => void };

/** Kör återkomsten vid requestIdleCallback; utan stöd → kort setTimeout. */
function schemalaggIdle(aterkomst: () => void, timeoutMs: number): IdlePlan {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(aterkomst, { timeout: timeoutMs });
    return { avbryt: () => w.cancelIdleCallback?.(id) };
  }
  const id = window.setTimeout(aterkomst, Math.min(timeoutMs, 1200));
  return { avbryt: () => window.clearTimeout(id) };
}

// ── LasyGlobal — generisk idle-mount ────────────────────────────────────────

/**
 * Renderar {children} först vid idle (eller första interaktion). Servern och
 * klientens första rendering är identiskt null → hydrationssäker.
 */
export function LasyGlobal({
  children,
  timeoutMs = 2000,
}: {
  children: ReactNode;
  /** Tak i ms innan idle-callbacken tvingas köra (requestIdleCallback-timeout). */
  timeoutMs?: number;
}) {
  const [monterad, setMonterad] = useState(false);

  useEffect(() => {
    let aktiv = true;
    const starta = () => {
      if (!aktiv) return;
      aktiv = false;
      stada();
      setMonterad(true);
    };

    // Accelerator: första riktiga interaktionen → montera direkt. Chunken
    // hämtas ändå asynkront, så själva trycket blockerar aldrig.
    const handelse: Array<keyof WindowEventMap> = ["scroll", "pointerdown", "keydown", "touchstart"];
    handelse.forEach((h) => window.addEventListener(h, starta, { passive: true, once: true }));

    // Basfall: när huvudtråden blir ledig (hydratisering klar + LCP fri).
    const plan = schemalaggIdle(starta, timeoutMs);

    function stada() {
      handelse.forEach((h) => window.removeEventListener(h, starta));
      plan.avbryt();
    }
    return stada;
    // engångs-effekt: monteringsbeslutet beror inte på props/state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!monterad) return null;
  return <>{children}</>;
}

// ── konkreta lazy-monteringar (layout.tsx rör aldrig next/dynamic själv,
//    eftersom ssr:false inte får anropas från en serverkomponent) ────────────

/** AI-Mentorn (chatt + spaced repetition) — syns efter idle/interaktion. */
export function LasyChatWidget() {
  return (
    <LasyGlobal>
      <ChatWidgetLaddad />
    </LasyGlobal>
  );
}

/** Agent 3: Short-Seller — monteras idle, event-bussen ("ak1a:shortseller-
 *  attacka") fungerar som förut när båda globala komponenterna monterats. */
export function LasyShortSeller() {
  return (
    <LasyGlobal>
      <ShortSellerLaddad />
    </LasyGlobal>
  );
}

/** Notisklockan — monteras idle (defererar även /api/notiser-hämtningen). */
export function LasyNotisCenter() {
  return (
    <LasyGlobal>
      <NotisCenterLaddad />
    </LasyGlobal>
  );
}

// ── PalettVakt — ⌘K-lyssnare direkt, paletten lazy vid första öppningen ─────

/**
 * Vakt för kommandopaletten (⌘K / Ctrl+K / "/" / eventet "ak1a:oppna-sok"):
 *
 * 1. De vägerlätta globala lyssnarna registreras vid hydratisering — ⌘K svarar
 *    alltså direkt, precis som tidigare.
 * 2. Paletten (React.lazy) hämtas först när den faktiskt öppnas första gången.
 * 3. Tyst idle-montering efter 4 s: palettens automatiska besöksregistrering
 *    (navigationsminnet, "senast besökta") fungerar som förut även för den
 *    som aldrig öppnar paletten.
 *
 * När paletten har monterats sköter den själv ⌘K-toggle, "/" och eventet —
 * vakten tiger (monterad-flaggan sätts av PalettSignal efter palettens egna
 * effekter i samma commit, se kommentaren där).
 */
export function PalettVakt() {
  const [laddad, setLaddad] = useState(false);
  const oppnaVidMonster = useRef(false);
  const monterad = useRef(false);

  useEffect(() => {
    const iTextfalt = () => {
      const el = document.activeElement;
      return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el as HTMLElement | null)?.isContentEditable === true
      );
    };

    // Ladda paletten och be den öppna sig så fort den är på plats.
    const oppna = () => {
      oppnaVidMonster.current = true;
      setLaddad(true);
    };

    const tang = (e: KeyboardEvent) => {
      if (monterad.current) return; // paletten lyssnar själv nu
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const slash = e.key === "/" && !iTextfalt();
      if (cmdK || slash) {
        e.preventDefault();
        oppna();
      }
    };

    // Sök-knappar i headern/mobilmenyn/huvudmenyn dispatchar detta event.
    const viaEvent = () => {
      if (monterad.current) return;
      oppna();
    };

    document.addEventListener("keydown", tang);
    window.addEventListener("ak1a:oppna-sok", viaEvent);

    // Tyst återhämtning: besöksregistreringen lever igen efter idle.
    const plan = schemalaggIdle(() => setLaddad(true), 4000);

    return () => {
      document.removeEventListener("keydown", tang);
      window.removeEventListener("ak1a:oppna-sok", viaEvent);
      plan.avbryt();
    };
  }, []);

  if (!laddad) return null;
  return (
    <Suspense fallback={null}>
      <PalettLaddad />
      {/* Syskon EFTER paletten i trädet: React kör monteringseffekter i
          trädordning, så palettens egna lyssnare (⌘K + ak1a:oppna-sok) är
          registrerade när den här effekten dispatchar öppnings-eventet. */}
      <PalettSignal oppnaVidMonster={oppnaVidMonster} monterad={monterad} />
    </Suspense>
  );
}

/** Engångssignal: markera paletten monterad + öppna den vid väntad öppning. */
function PalettSignal({
  oppnaVidMonster,
  monterad,
}: {
  oppnaVidMonster: { current: boolean };
  monterad: { current: boolean };
}) {
  useEffect(() => {
    monterad.current = true;
    if (oppnaVidMonster.current) {
      oppnaVidMonster.current = false;
      window.dispatchEvent(new Event("ak1a:oppna-sok"));
    }
    // engångs-effekt: körs en gång per montering (avsett beteende)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
