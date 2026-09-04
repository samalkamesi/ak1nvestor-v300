"use client";

import * as React from "react";

/**
 * TRAFIK-STATUSRADEN — diskret publik live-indikator i Sidfooterns
 * marinpanel: "🔒 Skyddad · N besökare idag".
 *
 * Källa: GET /api/trafik UTAN admin-lösenord — servern lämnar då ENBAST
 * { skyddad, besokareIdag, blockerat24h } (aggregat utan personuppgifter;
 * inga sökvägar, inga källor, inga hashar). Uppdateras var 5:e minut +
 * vid synlighet. Tyst vid motstånd: radar ut ingenting alls.
 */

type PubliktSvar = { besokareIdag?: number; blockerat24h?: number };

export function TrafikStatusRad() {
  const [status, setStatus] = React.useState<PubliktSvar | null>(null);

  React.useEffect(() => {
    let aktiv = true;
    const hamta = async () => {
      try {
        const res = await fetch("/api/trafik", { headers: { Accept: "application/json" } });
        if (!res.ok || !aktiv) return;
        const json = (await res.json()) as PubliktSvar;
        if (aktiv) setStatus({ besokareIdag: json.besokareIdag ?? 0, blockerat24h: json.blockerat24h ?? 0 });
      } catch {
        /* tyst — indikatorn är valfri information, aldrig ett krav */
      }
    };
    void hamta();
    const timer = window.setInterval(hamta, 5 * 60_000);
    const onSynlighet = () => {
      if (document.visibilityState === "visible") void hamta();
    };
    document.addEventListener("visibilitychange", onSynlighet);
    return () => {
      aktiv = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onSynlighet);
    };
  }, []);

  // innan första läsning (eller vid tyst läge) syns ingen rad alls
  if (!status) return null;

  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tabular-nums">
      <span aria-hidden="true">🔒</span>
      <span>Skyddad trafikvakt — {status.blockerat24h} attacker blockerade senaste 24 h</span>
      {(status.besokareIdag ?? 0) > 0 && (
        <span className="text-[#E8C766]">
          {(status.besokareIdag ?? 0).toLocaleString("sv-SE")} besökare idag
        </span>
      )}
    </p>
  );
}
