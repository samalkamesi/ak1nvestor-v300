"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { lasCookieSamtycke } from "@/components/ak1a/cookie-consent";

/**
 * TRAFIK-RAPPORTÖREN — trafikmätningens klienthalva (GDPR-vänlig).
 *
 * Varför en klientkomponent? Middleware i Vercel kan inte nå localhost —
 * därför sätter middleware klass-headern (x-ak1a-klass + Server-Timing)
 * och DENNA komponent POSTar mätvärdena till /api/trafik efter
 * hydrering (fire-and-forget via sendBeacon — försenar aldrig sidan).
 *
 * SÄNDS (fullt läge, med analys-samtycke i ak1a-cookie-samtycke):
 *   { path (endast sökväg — ALDRIG query), ref (endast värdnamn),
 *     ua (trunkeras 120 på servern), sprak, land, session (slumpad,
 *     icke-personidentifierbar, hashas på servern), puls }
 * SÄNDS INTE: query-strängar, IP (servern hashar), SID-innehåll,
 *   enhets-ID:n, koordinater, formulärdata.
 *
 * Urval (servern bufferar + spolar var 10:e):
 *   - sessionens FÖRSTA händelse → alltid ("forsta") — ger unika besökare
 *   - övriga sidvisningar → 30 % stickprov ("stickprov")
 *   - puls var 3:e minut medan fliken syns → "besökare just nu"
 *
 * SAMTYCKE (samma klasser som kakmuren / tracer):
 *   - analys-samtycke        → fullt läge (ovan)
 *   - "endast nödvändigt" /
 *     inget val sparat än      → minimalt läge: ENBART { path, ua } —
 *                                 fortfarande 30 % stickprov, ingen
 *                                 session, ingen källa, ingen puls.
 */

const SESSION_NYCKEL = "ak1a-session"; // samma slump-tokens som sidvisnings-beacon
const FORSTA_NYCKEL = "ak1a-trfik-forsta"; // markerar sessionens första rapport
const STICKPROV = 0.3;
const PULS_MS = 3 * 60_000;

/** Serverns klass ur PerformanceNavigationTiming.serverTiming (hel sidladdning). */
function lasServerKlass(): string | null {
  try {
    const naver = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const navig = naver[naver.length - 1];
    const marsk = navig?.serverTiming?.find((m) => m.name === "ak1a")?.description;
    return marsk || null;
  } catch {
    return null;
  }
}

function lasSession(analys: boolean): string | null {
  try {
    const befintlig = window.localStorage.getItem(SESSION_NYCKEL);
    if (befintlig) return befintlig.slice(0, 64);
    if (!analys) return null; // skapa INTE ny lagring utan analys-val
    const ny = "t-" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    window.localStorage.setItem(SESSION_NYCKEL, ny);
    return ny;
  } catch {
    return null;
  }
}

function beacon(payload: Record<string, unknown>): void {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/trafik", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/trafik", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body,
      }).catch(() => undefined);
    }
  } catch {
    /* tyst — mätning får ALDRIG störa sidan */
  }
}

export function TrafikRapportor() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname ?? "/");
  const pulsTimerRef = useRef<number | null>(null);

  // ── Sidvisning: en rapport per ny sökväg (efter hydrering) ──
  useEffect(() => {
    if (!pathname) return;
    pathnameRef.current = pathname;

    // Middlewarens klass-dom: hot-blockerade navigeringar rapporteras inte.
    const serverKlass = lasServerKlass();
    if (serverKlass === "hot" || serverKlass === "utesluten") return;

    const samtycke = lasCookieSamtycke();
    const analys = samtycke?.analys === true;
    const session = lasSession(analys);
    const forstaNyckel = `${FORSTA_NYCKEL}:${session ?? "minimal"}`;

    let forsta = false;
    try {
      forsta = analys && session !== null && !window.sessionStorage.getItem(forstaNyckel);
    } catch {
      forsta = analys && session !== null;
    }

    const stick = Math.random() < STICKPROV;
    if (!forsta && !stick) return; // ej vald i stickprovet denna gång

    // Källa: endast externa värdnamn — intern navigering räknas som direkt.
    let ref: string | null = null;
    let sprak: string | null = null;
    let land: string | null = null;
    if (analys) {
      try {
        if (document.referrer) {
          const host = new URL(document.referrer).hostname;
          if (host !== window.location.hostname) ref = host;
        }
      } catch {
        ref = null;
      }
      sprak = (navigator.language || "").slice(0, 12) || null;
      land = sprak && sprak.includes("-") ? sprak.split("-")[1].toUpperCase().slice(0, 8) : null;
    }

    beacon({
      path: pathname,
      ref,
      ua: navigator.userAgent || "",
      sprak,
      land,
      session, // null i minimalt läge → servern loggar ENBAST path + UA-klass
      urval: forsta ? "forsta" : "stickprov",
      puls: false,
    });

    if (forsta) {
      try {
        window.sessionStorage.setItem(forstaNyckel, "1");
      } catch {
        /* minne nekat — nästa rapport kan bli en extra 'forsta', harmlöst */
      }
    }
  }, [pathname]);

  // ── Puls-hjärta: "besökare just nu" (endast fullt läge + synlig flik) ──
  useEffect(() => {
    const pulsa = () => {
      if (document.visibilityState !== "visible") return;
      const samtycke = lasCookieSamtycke();
      if (samtycke?.analys !== true) return; // puls kräver analys-samtycke
      const session = lasSession(true);
      if (!session) return;
      beacon({ path: pathnameRef.current, ua: navigator.userAgent || "", session, puls: true });
    };
    pulsTimerRef.current = window.setInterval(pulsa, PULS_MS);
    const onSynlighet = () => {
      if (document.visibilityState === "visible") pulsa();
    };
    document.addEventListener("visibilitychange", onSynlighet);
    return () => {
      if (pulsTimerRef.current !== null) window.clearInterval(pulsTimerRef.current);
      document.removeEventListener("visibilitychange", onSynlighet);
    };
  }, []);

  return null;
}
