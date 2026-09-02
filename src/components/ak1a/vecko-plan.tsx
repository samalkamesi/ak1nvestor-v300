"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { markeraKlar, raknaVeckoPlan, veckoNummer, type PlanRad } from "@/lib/veckoplan";

/**
 * VECKOPLANEN — veckokort som visar "Din vecka — automatiskt sammansatt".
 * Planen räks på klienten (lokaldata) i useEffect: första rendret är ett
 * stabilt skelett → hydration-säkert, inga SSR/server-fel.
 */

const TYP_IKON: Record<PlanRad["typ"], string> = {
  kurs: "📘",
  pass: "⚡",
  rep: "🃏",
  analys: "🔍",
};

const TYP_NAMN: Record<PlanRad["typ"], string> = {
  kurs: "Kurs",
  pass: "Pass",
  rep: "Repetition",
  analys: "Analys",
};

export function VeckoPlan({ tidPerVecka }: { tidPerVecka?: number }) {
  const [rader, setRader] = useState<PlanRad[]>([]);
  const [laddad, setLaddad] = useState(false);
  const [veckonr, setVeckonr] = useState(0);

  const raknaOm = useCallback(() => {
    setRader(raknaVeckoPlan({ tidPerVecka }));
    setVeckonr(veckoNummer());
    setLaddad(true);
  }, [tidPerVecka]);

  useEffect(() => {
    raknaOm();
  }, [raknaOm]);

  function vaxlaRad(dagIndex: number) {
    markeraKlar(dagIndex); // kryssar på/av för aktuell vecka
    setRader(raknaVeckoPlan({ tidPerVecka }));
  }

  const totalMin = rader.reduce((summa, rad) => summa + rad.minut, 0);
  const klaraAntal = rader.filter((rad) => rad.klar).length;
  const procent = rader.length > 0 ? (klaraAntal / rader.length) * 100 : 0;
  const alltKlart = laddad && rader.length > 0 && klaraAntal === rader.length;

  return (
    <section className="overflow-hidden rounded-xl border border-gold/30 bg-card">
      {/* Rubrikrad — marin panel med guldtext (AK1A-signatur) */}
      <div className="marin-panel flex items-center justify-between gap-3 border-b border-gold/30 px-4 py-3">
        <div className="min-w-0">
          <h2 className="font-serif text-base font-bold tracking-wide text-[#E8C766] sm:text-lg">
            Din vecka — automatiskt sammansatt
          </h2>
          <p className="truncate text-[11px] text-[#EDE6D6]/70">
            Veckans resa{veckonr > 0 ? ` · vecka ${veckonr}` : ""}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-bold text-[#E8C766]"
          aria-label={`Totalt ${totalMin} minuter denna vecka`}
        >
          ≈ {totalMin} min
        </span>
      </div>

      <div className="p-4">
        {laddad && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {klaraAntal} av {rader.length} klara
              </span>
              <span>{Math.round(procent)}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(procent)}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-soft via-gold to-gold-soft transition-all duration-500"
                style={{ width: `${procent}%` }}
              />
            </div>
          </div>
        )}

        {!laddad ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sammanställer veckans resa …
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {rader.map((rad, index) => (
              <li
                key={`${rad.dag}-${index}`}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                  rad.klar ? "border-gold/40 bg-gold/5" : "border-gold/10 hover:bg-gold/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() => vaxlaRad(index)}
                  aria-pressed={rad.klar}
                  aria-label={`${rad.klar ? "Avkryssa" : "Kryssa"} ${rad.dag}: ${rad.aktivitet}`}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold transition-colors ${
                    rad.klar
                      ? "border-gold bg-gold text-white"
                      : "border-gold/40 text-transparent hover:border-gold"
                  }`}
                >
                  ✓
                </button>

                <Link
                  href={rad.lank}
                  className="flex min-w-0 flex-1 items-center gap-3"
                  title={TYP_NAMN[rad.typ]}
                >
                  <span className="shrink-0 text-lg" aria-hidden>
                    {TYP_IKON[rad.typ]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-wide text-gold">
                      {rad.dag} · {TYP_NAMN[rad.typ]}
                    </span>
                    <span
                      className={`block truncate text-sm ${
                        rad.klar ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {rad.aktivitet}
                    </span>
                  </span>
                </Link>

                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                  {rad.minut} min
                </span>
              </li>
            ))}
          </ul>
        )}

        {alltKlart && (
          <p className="mt-4 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2.5 text-center font-serif text-sm font-bold text-gold">
            Veckan är klar — ta hand om dig. 🌟
          </p>
        )}
      </div>
    </section>
  );
}
