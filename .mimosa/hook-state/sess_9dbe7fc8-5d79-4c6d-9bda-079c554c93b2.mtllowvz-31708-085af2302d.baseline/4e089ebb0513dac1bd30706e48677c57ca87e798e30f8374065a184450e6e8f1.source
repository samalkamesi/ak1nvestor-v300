"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lasMedlem, lasXP, lasStjarnor, nivaFranXP, markeraKursKlar, addXP, addStjarna } from "@/lib/member-local";

/**
 * Kursportall — kapitel 1–2 är smakprov för alla (SEO + lockbete);
 * kapitel 3+ kräver GRATIS medlemskap. Inloggad: allt + XP/stjärnor.
 */
export function KursGate({
  slug,
  titel,
  children,
}: {
  slug: string;
  titel: string;
  children: React.ReactNode;
}) {
  const [medlem, setMedlem] = useState<boolean | null>(null);

  useEffect(() => {
    setMedlem(Boolean(lasMedlem()));
  }, []);

  if (medlem === null) return <>{children}</>; //SSR/first paint

  if (medlem) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none max-h-[420px] overflow-hidden blur-[6px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-paper via-paper/80 to-transparent p-6">
        <div className="max-w-md rounded-2xl border-2 border-gold bg-paper p-8 text-center shadow-xl">
          <p className="text-3xl">🔒</p>
          <h3 className="mt-3 font-serif text-2xl font-bold">
            Fortsätt läsa — helt gratis
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Skapa ett kostnadsfritt konto så låser du upp <strong>hela "{titel}"</strong> —
            och alla övriga 307 kurserna, för alltid. Fundamentalanalys är en rättighet. {/* Uppdaterad 2026-09-01: 307 kurser */}
          </p>
          <Link
            href="/logga-in"
            className="mt-5 inline-block rounded-lg bg-gold px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Lås upp gratis →
          </Link>
          <p className="mt-3 text-[11px] text-muted-foreground">
            20 sekunder. Ingen betalning. Ingen kortinformation.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Nivåbar + stjärnor + "markera klar" — visas för inloggade på kurssidor. */
export function NivaBar({ slug }: { slug: string }) {
  const [xp, setXP] = useState<number | null>(null);
  const [stjarnor, setStjarnor] = useState(0);
  const [klar, setKlar] = useState(false);

  useEffect(() => {
    setXP(lasXP());
    setStjarnor(lasStjarnor());
  }, []);

  if (xp === null) return null;

  const niv = nivaFranXP(xp);
  const iNivan = xp % 100;
  const procent = Math.min(100, iNivan);

  return (
    <div className="rounded-xl border border-gold/30 bg-card p-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-gold">
          ⭐ Nivå {niv}/100 · {"★".repeat(Math.min(5, Math.floor(stjarnor / 3) + (stjarnor > 0 ? 1 : 0)))} ({stjarnor} stjärnor)
        </span>
        <span className="text-muted-foreground">{xp} XP</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gold/15">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${procent}%` }} />
      </div>
      {niv >= 25 && (
        <p className="mt-2 text-xs font-semibold text-gold">
          🚀 Nivå {niv} — du är redo för Fas 2: utbildning medgrundaren →{" "}
          <Link href="/medlemskap#fas2" className="underline">
            ansök
          </Link>
        </p>
      )}
      <button
        onClick={() => {
          if (markeraKursKlar(slug)) {
            const niv = addXP(50);
            addStjarna();
            setXP(lasXP());
            setStjarnor(lasStjarnor());
            setKlar(true);
            if (niv % 10 === 0) alert(`Grattis — du nådde nivå ${niv}! 🎉`);
          } else {
            setKlar(true);
          }
        }}
        disabled={klar}
        className="mt-3 w-full rounded-lg border border-gold/40 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/10 disabled:opacity-50"
      >
        {klar ? "✓ Kurs markerad klar (+50 XP)" : "Markera kursen klar (+50 XP, +1 ★)"}
      </button>
    </div>
  );
}
