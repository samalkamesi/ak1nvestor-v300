"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { lasKlaraKurser, lasStreak, lasXP } from "@/lib/member-local";

/**
 * DITT NÄSTA STEG — personlig mönsterigenkänning.
 * Läser elevens lokala statistik (streak, klara kurser, XP) och föreslår
 * 1–2 nästa steg i prioriteringsordning. Föreslår aldrig aktuell sida.
 * Klientside-safe: tomt första passt (useEffect + state, inga SSR-fel).
 */

type Forslag = { href: string; ikon: string; titel: string; mening: string };

function raknaForslag(aktuellSida?: string): Forslag[] {
  const kandidater: Forslag[] = [];

  // 1. Streaken först — glömskekurvan älskar daglig närvaro
  if (lasStreak().antal < 2) {
    kandidater.push({
      href: "/dagens-pass",
      ikon: "⚡",
      titel: "Dagens Pass",
      mening: "Håll streaken levande",
    });
  }

  // 2. Få klara kurser → nästa steg i läroplanen (nivå 1)
  if (lasKlaraKurser().length < 3) {
    kandidater.push({
      href: "/laroplan",
      ikon: "🗺️",
      titel: "Läroplanen",
      mening: "Fortsätt läroplanen",
    });
  }

  // 3. Lite XP → testa hela analysflödet end-to-end
  if (lasXP() < 500) {
    kandidater.push({
      href: "/superanalys",
      ikon: "🏅",
      titel: "Superanalysen",
      mening: "Testa hela analysflödet",
    });
  }

  // 4. Rutinerad elev → verktygen
  if (kandidater.length === 0) {
    kandidater.push(
      { href: "/kalkylator", ikon: "🧮", titel: "AKM1-kalkylatorn", mening: "Räkna på ett nytt case" },
      { href: "/min-portfolj", ikon: "💼", titel: "Min portfölj", mening: "Djupdyk i dina innehav" },
    );
  }

  // Föreslå aldrig sidan eleven redan står på; högst två förslag
  return kandidater.filter((f) => f.href !== aktuellSida).slice(0, 2);
}

export function NastaSteg({ aktuellSida }: { aktuellSida?: string }) {
  const pathname = usePathname();
  const sida = aktuellSida || pathname;
  const [forlag, setForlag] = useState<Forslag[]>([]);

  useEffect(() => {
    setForlag(raknaForslag(sida));
  }, [sida]);

  if (forlag.length === 0) return null;

  return (
    <section className="rounded-xl border border-gold/20 bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 className="shrink-0 font-serif text-sm font-bold tracking-wide text-gold">
          Ditt nästa steg
        </h2>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          {forlag.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="flex flex-1 items-center gap-3 rounded-lg border border-gold/10 px-3 py-2.5 hover:bg-gold/10"
            >
              <span className="text-xl">{f.ikon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">{f.titel}</span>
                <span className="block text-xs text-muted-foreground">{f.mening}</span>
              </span>
              <span className="text-gold">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
