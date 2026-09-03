"use client";

/**
 * Kursförslag på 404-sidan — "kursen kan ha bytt namn".
 *
 * Läser aktuellt pathname; om besökaren sökte /kurser/{slug} matchas den med
 * litet redigeringsavstånd (Levenshtein) mot alla kurs-slugs och de 3 närmaste
 * föreslås. Fungerar även för percent-encodade åäö-slugar (gamla länkar).
 */

import React from "react";
import Link from "next/link";

export type KursSlug = { slug: string; titel: string };

function normalisera(s: string): string {
  try {
    return decodeURIComponent(s).toLowerCase();
  } catch {
    return s.toLowerCase();
  }
}

/** Klassiskt Levenshtein-avstånd, takat för korta strängar (slugs). */
function avstand(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let fore = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const nu = [i];
    for (let j = 1; j <= n; j++) {
      nu[j] = Math.min(
        fore[j] + 1,
        nu[j - 1] + 1,
        fore[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    fore = nu;
  }
  return fore[n];
}

export function KursForslag({ kurser }: { kurser: KursSlug[] }) {
  const forslag = React.useMemo(() => {
    if (typeof window === "undefined") return [];
    const path = normalisera(window.location.pathname);
    const match = path.match(/^\/kurser\/(.+?)\/?$/);
    if (!match) return [];
    const sokt = match[1];
    return kurser
      .map((k) => ({ ...k, d: avstand(sokt, k.slug) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .filter((k, i) => k.d <= Math.max(6, sokt.length / 2) || i === 0);
  }, [kurser]);

  if (forslag.length === 0) return null;

  return (
    <div className="mt-7 rounded-xl border border-[#E8C766]/35 bg-[#0E1B2E]/60 px-5 py-5 text-left">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8C766]/85">
        Hittade vi det du sökte?
      </p>
      <p className="mt-2 text-sm text-[#EDE6D6]/80">
        Kursen kan ha bytt namn eller flyttats. Här är de närmaste träffarna:
      </p>
      <ul className="mt-3 space-y-2">
        {forslag.map((k) => (
          <li key={k.slug}>
            <Link
              href={`/kurser/${k.slug}`}
              className="btn-marin group flex items-center justify-between gap-2 px-4 py-3"
            >
              <span className="font-serif text-sm font-bold text-[#EDE6D6]">{k.titel}</span>
              <span
                aria-hidden
                className="text-[#E8C766] transition-transform duration-150 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
