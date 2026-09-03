"use client";

import { useEffect, useRef, useState } from "react";
import { uiEvent } from "@/lib/organ-event";

/**
 * KROPPSVYN — ekosystemets puls (MEGA_PLAN_V3 Fas A).
 *
 * Hämtar /api/kropp med enkel SWR-lik poll: useEffect + setInterval var 60:e
 * sekund (Vercel Hobby = inga websockets; forskning-organ-arkitektur.md §2.5).
 * Vid förändrad puls broadcastas "ak1a:organ-event" via uiEvent() — en poll →
 * många prenumererande komponenter.
 *
 * Renderar en marin-panel-rubrikrad + .hjarlinje + grid av organ-kort
 * (ikon + namn + status-prick: lever=grön puls-animation, vilande=gul,
 * okänd=grå, samt "senast: X min sedan" med tabulära siffror). Korten är
 * klickbara (minst 44px) och expanderar organets sammanfattning — publikt,
 * aldrig länk till /admin.
 *
 * Hydration-säkert: första passt renderar ett deterministiskt skeleton;
 * all data och alla tidsberäkningar sker först i useEffect på klienten.
 */

type OrganStatus = "lever" | "vilande" | "okänd";

type KroppsOrgan = {
  id: string;
  namn: string;
  ikon: string;
  status: OrganStatus;
  senast: string | null;
  sammanfattning: string;
};

type KroppSvar = {
  genererad?: string;
  organ?: KroppsOrgan[];
};

type Tillstand =
  | { lagge: "laddar" }
  | { lagge: "klar"; data: KroppSvar }
  | { lagge: "fel" };

const POLL_MS = 60_000;

const STATUS_PRICK: Record<OrganStatus, { klass: string; etikett: string; titel: string }> = {
  lever: {
    klass: "bg-bull animate-pulse",
    etikett: "lever",
    titel: "Rapporterat inom sin kadens",
  },
  vilande: {
    klass: "bg-[#F59E0B]",
    etikett: "vilande",
    titel: "Signal finns men är äldre än kadensen",
  },
  okänd: {
    klass: "bg-muted-foreground/50",
    etikett: "okänd",
    titel: "Ingen signal loggad ännu",
  },
};

/** "X min sedan" — endast anropad med data som hämtats efter hydrering. */
function minSedan(iso: string | null): string {
  if (!iso) return "okänt";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "okänt";
  const min = Math.max(0, Math.round((Date.now() - t) / 60_000));
  if (min < 1) return "nu";
  if (min < 60) return `${min} min`;
  const tim = Math.floor(min / 60);
  if (tim < 24) return `${tim} h`;
  return `${Math.floor(tim / 24)} d`;
}

function senastText(iso: string | null): string {
  return iso ? `senast: ${minSedan(iso)} sedan` : "senast: okänt";
}

export function KroppsvyKort() {
  const [tillstand, setTillstand] = useState<Tillstand>({ lagge: "laddar" });
  const [oppnadId, setOppnadId] = useState<string | null>(null);
  const forraPuls = useRef<string | null>(null);

  useEffect(() => {
    let aktiv = true;

    const hamta = async () => {
      try {
        const res = await fetch("/api/kropp", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as KroppSvar;
        if (!aktiv) return;
        setTillstand({ lagge: "klar", data: json });

        // Nervsystemet: broadcasta när pulsen ändras (ak1a:organ-event) —
        // samma konvention som ak1a:oppna-sok / ak1a:shortseller-*.
        const puls = JSON.stringify(json.organ ?? []);
        if (forraPuls.current !== null && forraPuls.current !== puls) {
          uiEvent("ak1a:organ-event", {
            genererad: json.genererad ?? null,
            antal: (json.organ ?? []).length,
          });
        }
        forraPuls.current = puls;
      } catch {
        if (aktiv) setTillstand({ lagge: "fel" });
      }
    };

    void hamta();
    const timer = setInterval(() => void hamta(), POLL_MS);
    return () => {
      aktiv = false;
      clearInterval(timer);
    };
  }, []);

  const organ = tillstand.lagge === "klar" ? (tillstand.data.organ ?? []) : [];

  return (
    <section className="rounded-2xl border border-gold/30 bg-card p-6 sm:p-8" aria-live="polite">
      {/* Marin-panel-rubrikrad */}
      <div className="marin-panel rounded-xl border border-gold/30 px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold-soft">
            Kroppsvyn — ekosystemets puls
          </p>
          <p className="tabular-nums text-[10px] text-[#EDE6D6]/60">
            {tillstand.lagge === "klar" && tillstand.data.genererad
              ? `mätt ${minSedan(tillstand.data.genererad)} sedan`
              : "mäter…"}
          </p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#EDE6D6]/80">
          Varje organs senaste signal — loggen är pulsen. Uppdateras var 60:e sekund.
        </p>
      </div>

      <div className="hjarlinje mt-4" aria-hidden="true" />

      {/* Skeleton under hämtning — deterministiskt, inga tidsvärden */}
      {tillstand.lagge === "laddar" && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-[44px] animate-pulse rounded-xl border border-gold/20 bg-muted/30" />
          ))}
        </div>
      )}

      {tillstand.lagge === "fel" && (
        <p className="mt-4 text-xs text-muted-foreground">
          Pulsen kunde inte läsas just nu — ett nytt försök görs automatiskt om en minut.
        </p>
      )}

      {tillstand.lagge === "klar" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {organ.map((o) => {
              const prick = STATUS_PRICK[o.status] ?? STATUS_PRICK.okänd;
              const arOppnad = oppnadId === o.id;
              return (
                <div key={o.id}>
                  <button
                    type="button"
                    onClick={() => setOppnadId(arOppnad ? null : o.id)}
                    aria-expanded={arOppnad}
                    aria-label={`${o.namn} — ${prick.etikett}, ${senastText(o.senast)}`}
                    title={prick.titel}
                    className="flex min-h-[44px] w-full flex-col items-start gap-1 rounded-xl border border-gold/30 bg-card px-3 py-2.5 text-left transition-colors hover:border-gold/60"
                  >
                    <span className="flex w-full items-center gap-2">
                      <span className="shrink-0 text-lg" aria-hidden="true">
                        {o.ikon}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-bold text-foreground">
                        {o.namn}
                      </span>
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${prick.klass}`}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="tabular-nums text-[10px] text-muted-foreground">
                      {senastText(o.senast)}
                    </span>
                  </button>
                  {arOppnad && (
                    <p className="mt-1 rounded-lg border border-gold/20 bg-gold/5 p-2.5 text-[11px] leading-snug text-muted-foreground">
                      {o.sammanfattning}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground">
            {(Object.keys(STATUS_PRICK) as OrganStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${STATUS_PRICK[s].klass}`} aria-hidden="true" />
                {STATUS_PRICK[s].etikett}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
