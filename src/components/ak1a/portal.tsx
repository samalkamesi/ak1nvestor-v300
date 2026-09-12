"use client";

import { useEffect, useState } from "react";

import { MinSida } from "@/components/ak1a/min-sida";
import { PortalNav } from "@/components/ak1a/portal-nav";
import { lasMedlemProgressKlient, type MedlemProgressAggregat } from "@/lib/medlem-progress-klient";
import type { PrenumerationNiva } from "@/lib/prenumeration";

/**
 * PORTALEN (våg 102) — Min Sida 2.0:s sammanslagning: EN sessionskontroll
 * (GET /api/medlem/progress — session + progress i en rundtur, §C.4) styr
 * hela vyn. SERVER-SESSIONEN är sanningskällan:
 *
 *   kontroll pågår ⇒ skeleton (ingen gästvy blinkar för inloggade —
 *                     dashboarden är kundens nav, första intrycket räknas)
 *   gäst           ⇒ PortalNav döljs; Min Sida kör vidare på lokal cache
 *                     (gästens sanning — välkomstvyn bär sin egen CTA)
 *   inloggad       ⇒ PortalNav (poänghero i marin-familjen) + Min Sida
 *                     med SERVER-progressen som talgiver (streak förblir
 *                     lokal, v1-scope — dokumenterat i medlem-progress.ts)
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
export function Portal({
  prenumNiva = null,
  prenumRabattProcent = 0,
}: {
  prenumNiva?: PrenumerationNiva | null;
  prenumRabattProcent?: number;
}) {
  const [session, setSession] = useState<{
    kontrollerad: boolean;
    progress: MedlemProgressAggregat | null;
  }>({ kontrollerad: false, progress: null });

  useEffect(() => {
    let aktiv = true;
    lasMedlemProgressKlient()
      .then((svar) => {
        if (!aktiv) return;
        setSession({ kontrollerad: true, progress: svar.inloggad ? svar.progress : null });
      })
      .catch(() => {
        // Nätverksfel ⇒ gäst-vyn (Min Sida fungerar fristående på lokal cache)
        if (aktiv) setSession({ kontrollerad: true, progress: null });
      });
    return () => {
      aktiv = false;
    };
  }, []);

  if (!session.kontrollerad) {
    // Skeleton under sessionskontrollen — samma form som Min Sidas egen
    // hydreringsskeleton (deterministisk, aldrig fel innehåll först).
    return (
      <div className="space-y-6" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-3xl border border-gold/20 bg-card" />
        <div className="h-48 animate-pulse rounded-2xl border border-gold/20 bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {session.progress !== null && <PortalNav progress={session.progress} />}
      <MinSida
        prenumNiva={prenumNiva}
        prenumRabattProcent={prenumRabattProcent}
        serverProgress={session.progress}
      />
    </div>
  );
}
