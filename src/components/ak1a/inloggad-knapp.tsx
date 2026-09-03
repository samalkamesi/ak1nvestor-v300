"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lasMedlem, loggaUt } from "@/lib/member-local";

/**
 * INLOGGAD-KNAPP — hedern i headern: aldrig en "Logga in"-knapp till någon
 * som redan är inloggad (kunddirektiv 2026-09-03). Inloggad: hälsning med
 * förnamn + diskret "Logga ut". Utloggad: guld-CTA till /logga-in.
 * SSR-renderar utloggat läge (säkert) och hydrerar till rätt läge.
 */
export function InloggadKnapp({ stor = false }: { stor?: boolean }) {
  const [namn, setNamn] = useState<string | null>(null);
  const [hydrerad, setHydrerad] = useState(false);

  useEffect(() => {
    const m = lasMedlem();
    if (m) {
      const fornamn = (m.namn || m.email || "").split("@")[0].split(" ")[0];
      setNamn(fornamn ? fornamn.charAt(0).toUpperCase() + fornamn.slice(1) : "du");
    }
    setHydrerad(true);
  }, []);

  if (!hydrerad || !namn) {
    return (
      <Link
        href="/logga-in"
        className={
          stor
            ? "block w-full rounded-xl bg-gold px-4 py-3.5 text-center text-base font-bold text-primary-foreground shadow-xl hover:opacity-90"
            : "rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
        }
      >
        Logga in
      </Link>
    );
  }

  if (stor) {
    return (
      <span className="flex w-full flex-col gap-2">
        <Link
          href="/min-sida"
          className="rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-center text-base font-bold text-gold hover:bg-gold/10"
        >
          {namn} · Min Sida
        </Link>
        <button
          onClick={() => {
            loggaUt();
            setNamn(null);
          }}
          className="rounded-xl border border-gold/30 px-4 py-3 text-center text-sm font-semibold text-muted-foreground hover:border-gold/60 hover:text-foreground"
        >
          Logga ut
        </button>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <Link
        href="/min-sida"
        className="hidden rounded-full border border-gold/40 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10 sm:inline-block"
      >
        {namn} · Min Sida
      </Link>
      <button
        onClick={() => {
          loggaUt();
          setNamn(null);
        }}
        className="rounded-md border border-gold/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-gold/60 hover:text-foreground"
      >
        Logga ut
      </button>
    </span>
  );
}
