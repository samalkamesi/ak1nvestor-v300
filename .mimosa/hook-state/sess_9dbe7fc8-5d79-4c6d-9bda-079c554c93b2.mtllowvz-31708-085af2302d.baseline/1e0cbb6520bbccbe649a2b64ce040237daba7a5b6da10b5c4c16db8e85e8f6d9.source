"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BADGER,
  BADGE_MAP,
  KATEGORI_META,
  badgeStatus,
  type Badge,
  type BadgeKategori,
  type BadgeStatus,
} from "@/lib/badges";

/**
 * BADG-PANEL — bibliotekets trophies-skåp.
 * Premium-DNA: serif-rubriker, guldaccent, paper. Upplåsta meriter glänser,
 * låsta visas grå with live framstegs-bar.
 *
 * "NY BADGE!"-överlägget styrs utifrån: föräldern anropar geBadge(id) vid en
 * riktig händelse, skickar id:t via `nyBadgeId` och tömmer det i `onNyBadgeKlar`.
 */

type Filter = BadgeKategori | "alla";

const FILTER: Array<{ id: Filter; etikett: string; ikon: string }> = [
  { id: "alla", etikett: "Alla", ikon: "🏆" },
  ...(Object.keys(KATEGORI_META) as BadgeKategori[]).map((k) => ({
    id: k as Filter,
    etikett: KATEGORI_META[k].etikett,
    ikon: KATEGORI_META[k].ikon,
  })),
];

/** Neutral fallback (allt låst) — ger SSR-konsistent första rendering. */
function neutralLista(): BadgeStatus[] {
  return BADGER.map((badge) => ({ badge, upplast: false, framsteg: badge.krav, procent: 0 }));
}

// ── "NY BADGE!"-överlägg ────────────────────────────────────────────────────

export function NyBadgeOverlagg({
  badge,
  onKlar,
}: {
  badge: Badge | null;
  onKlar?: () => void;
}) {
  const [synlig, setSynlig] = useState(false);

  useEffect(() => {
    if (!badge) {
      setSynlig(false);
      return;
    }
    setSynlig(false);
    const raf = requestAnimationFrame(() => setSynlig(true));
    const t1 = setTimeout(() => setSynlig(false), 2800); // fade-out
    const t2 = setTimeout(() => onKlar?.(), 3400); // plocka bort efteråt
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badge?.id]);

  if (!badge) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center px-4 transition-all duration-500 ${
        synlig ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl border-2 border-gold bg-card px-5 py-3 shadow-2xl">
        <span className="text-3xl">{badge.ikon}</span>
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Ny badge!</p>
          <p className="font-serif text-lg font-bold leading-tight">{badge.namn}</p>
        </div>
      </div>
    </div>
  );
}

// ── Huvudpanel ──────────────────────────────────────────────────────────────

export function BadgPanel({
  nyBadgeId,
  onNyBadgeKlar,
}: {
  nyBadgeId?: string | null;
  onNyBadgeKlar?: () => void;
}) {
  const [status, setStatus] = useState<BadgeStatus[]>([]);
  const [filter, setFilter] = useState<Filter>("alla");

  // Läs in lokal badge-state endast på klienten (SSR-säkert)
  useEffect(() => {
    setStatus(badgeStatus());
  }, []);

  // Nya badgen låstes upp utifrån → läs om listan så skåpet gläds direkt
  useEffect(() => {
    if (!nyBadgeId) return;
    setStatus(badgeStatus());
  }, [nyBadgeId]);

  const lista = status.length > 0 ? status : neutralLista();
  const upplastaAntal = lista.filter((x) => x.upplast).length;
  const total = lista.length;
  const procentTotal = total > 0 ? Math.round((upplastaAntal / total) * 100) : 0;

  const synliga = useMemo(
    () => (filter === "alla" ? lista : lista.filter((x) => x.badge.kategori === filter)),
    [lista, filter]
  );

  // Närmaste merit = låst badge med högst framsteg
  const nastan = useMemo(
    () => [...lista].filter((x) => !x.upplast).sort((a, b) => b.procent - a.procent)[0] ?? null,
    [lista]
  );

  const nyBadge = nyBadgeId ? BADGE_MAP[nyBadgeId] ?? null : null;

  return (
    <div>
      <NyBadgeOverlagg badge={nyBadge} onKlar={onNyBadgeKlar} />

      {/* Sammanställning */}
      <div className="rounded-2xl border border-gold/30 bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Sammanställning
            </p>
            <p className="mt-1 font-serif text-3xl font-bold leading-none">
              {upplastaAntal}
              <span className="text-muted-foreground">/{total}</span>{" "}
              <span className="font-serif text-lg font-semibold">upplåsta</span>
            </p>
          </div>
          {nastan && (
            <p className="text-xs text-muted-foreground">
              Närmast: <span className="font-semibold text-gold">{nastan.badge.namn}</span> —{" "}
              {nastan.framsteg}
            </p>
          )}
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gold/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold transition-all duration-700"
            style={{ width: `${procentTotal}%` }}
          />
        </div>
      </div>

      {/* Kategorifilter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTER.map((f) => {
          const antal = lista.filter((x) => f.id === "alla" || x.badge.kategori === f.id);
          const uppa = antal.filter((x) => x.upplast).length;
          const aktiv = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                aktiv
                  ? "border-gold bg-gold text-primary-foreground"
                  : "border-gold/30 bg-card text-muted-foreground hover:border-gold/60 hover:text-foreground"
              }`}
              aria-pressed={aktiv}
            >
              {f.ikon} {f.etikett} <span className={aktiv ? "opacity-80" : "text-gold"}>{uppa}/{antal.length}</span>
            </button>
          );
        })}
      </div>

      {/* Trophies-grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {synliga.map(({ badge, upplast, framsteg, procent }) =>
          upplast ? (
            // Upplåst — guldglänsande trofékort
            <div
              key={badge.id}
              className="relative overflow-hidden rounded-2xl border-2 border-gold bg-gradient-to-br from-gold/15 via-card to-gold/5 p-4 text-center shadow-lg"
            >
              <div className="badg-sken pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-gold-soft/25 to-transparent" />
              <div className="text-3xl" aria-hidden>
                {badge.ikon}
              </div>
              <p className="mt-2 font-serif text-sm font-bold leading-tight">{badge.namn}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{badge.beskrivning}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gold">Upplåst</p>
            </div>
          ) : (
            // Låst — grå outline med framstegs-bar
            <div
              key={badge.id}
              className="rounded-2xl border border-border bg-card/60 p-4 text-center"
            >
              <div className="text-3xl opacity-25 grayscale" aria-hidden>
                {badge.ikon}
              </div>
              <p className="mt-2 font-serif text-sm font-bold leading-tight text-muted-foreground">
                {badge.namn}
              </p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gold-soft/70 transition-all duration-700"
                  style={{ width: `${procent}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">{framsteg}</p>
            </div>
          )
        )}
      </div>

      {/* Guld-sken-animation (subtil glans över upplåsta kort) */}
      <style>{`
        @keyframes badgSken {
          0% { transform: translateX(-160%) skewX(-12deg); }
          55%, 100% { transform: translateX(420%) skewX(-12deg); }
        }
        .badg-sken { animation: badgSken 3.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
