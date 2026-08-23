"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type Analytics = {
  periodDays: number;
  views: { total: number; d24: number; d7: number };
  uniqueVisitors: { total: number; d24: number; d7: number };
  topPages: { page: string; views: number }[];
  topSections: { section: string; visits: number }[];
  signupsPerDay: Record<string, number>;
  totalSignups: number;
};

function Kort({ titel, varde, sub }: { titel: string; varde: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{titel}</p>
      <p className="mt-1 font-serif text-3xl font-bold text-gold">{varde}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/** Admin-flik: Statistik & SEO — besökare, sidvisningar, top-sidor, konvertering. */
export function TrafficStatsPanel() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/analytics?days=30");
        const json = await res.json();
        if (!cancelled) {
          if (res.ok) setData(json);
          else setError(json.error || `HTTP ${res.status}`);
        }
      } catch {
        if (!cancelled) setError("Kunde inte hämta statistik");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ladda = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/analytics?days=30");
      const json = await res.json();
      if (res.ok) setData(json);
      else setError(json.error || `HTTP ${res.status}`);
    } catch {
      setError("Nätverksfel");
    }
  };

  if (error) {
    return (
      <div>
        <h3 className="font-serif text-lg font-bold">Statistik & SEO</h3>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={ladda}>
          <RefreshCw className="mr-1 h-3 w-3" /> Försök igen
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h3 className="font-serif text-lg font-bold">Statistik & SEO</h3>
        <p className="mt-2 text-sm text-muted-foreground">Hämtar statistik…</p>
      </div>
    );
  }

  const maxSida = Math.max(1, ...data.topPages.map((p) => p.views));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-serif text-lg font-bold">Statistik & SEO</h3>
        <Button variant="outline" size="sm" onClick={ladda}>
          <RefreshCw className="mr-1 h-3 w-3" /> Ladda om
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kort titel="Besökare (24h)" varde={data.uniqueVisitors.d24} sub="unika sessioner" />
        <Kort titel="Besökare (7d)" varde={data.uniqueVisitors.d7} sub={`${data.uniqueVisitors.total} senaste ${data.periodDays}d`} />
        <Kort titel="Sidvisningar (24h)" varde={data.views.d24} sub={`${data.views.d7} senaste 7d`} />
        <Kort titel="Nya medlemmar" varde={data.totalSignups} sub={`senaste ${data.periodDays} dagar`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gold/20 bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Topp-sidor (SEO + övriga)
          </p>
          <div className="mt-3 space-y-2">
            {data.topPages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Inga sidvisningar ännu — beaconen börjar mäta vid nästa besök.
              </p>
            )}
            {data.topPages.map((p) => (
              <div key={p.page} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate font-mono text-xs">{p.page}</span>
                <div className="h-2 w-28 overflow-hidden rounded-full bg-gold/15">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${(p.views / maxSida) * 100}%` }} />
                </div>
                <span className="w-10 text-right font-mono text-xs">{p.views}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gold/20 bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mest visade sektioner (appen)
          </p>
          <div className="mt-3 space-y-2">
            {data.topSections.length === 0 && (
              <p className="text-sm text-muted-foreground">Ingen sektionsdata i perioden.</p>
            )}
            {data.topSections.map((s) => (
              <div key={s.section} className="flex items-center gap-3 text-sm">
                <span className="flex-1 capitalize">{s.section}</span>
                <span className="font-mono text-xs text-muted-foreground">{s.visits} besök</span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Konvertering
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.views.total > 0
              ? `${((data.totalSignups / Math.max(1, data.uniqueVisitors.total)) * 100).toFixed(1)} % av besökare har registrerat sig (${data.totalSignups}/${data.uniqueVisitors.total})`
              : "Väntar på trafik…"}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Mått: unika sessioner → registrering. Registrera sitemap i Google Search
            Console för sökordsdata (klick, positioner) — kompletterar denna vy.
          </p>
        </div>
      </div>
    </div>
  );
}
