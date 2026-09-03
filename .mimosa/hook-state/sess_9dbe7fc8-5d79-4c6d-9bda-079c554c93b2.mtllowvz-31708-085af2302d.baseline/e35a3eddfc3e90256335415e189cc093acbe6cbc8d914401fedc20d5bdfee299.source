"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { svaraDashFraga, type DashSvar } from "@/lib/dashfraga";

/**
 * FRÅGA DIN DASHBOARD — sökfält-liknande frågeruta mot elevens egna data.
 *
 * Deterministiskt (ingen LLM): lib-funktionen svaraDashFraga matchar intent med
 * regex och svarar ur localStorage + /api/vagscan/senaste. Kortet håller
 * frågehistoria (senaste 3, localStorage ak1a-dashfraga-v1), förslag-chips och
 * ett svar-kort i marin-panel med ikon + länk-knapp (.btn-marin).
 *
 * Hydration-säkert: historia och svar existerar först efter klient-interaktion
 * (useEffect + event handlers) — första passt renderar identiskt på server
 * och klient. Alla tryckytor är minst 44px.
 */

const HISTORIK_NYCKEL = "ak1a-dashfraga-v1";

const FORSLAG = ["Vad säger vågkartan?", "Nästa kurs?", "Min streak?"] as const;

export function DashFragaKort() {
  const [input, setInput] = useState("");
  const [svar, setSvar] = useState<DashSvar | null>(null);
  const [visadFraga, setVisadFraga] = useState("");
  const [historik, setHistorik] = useState<string[]>([]);
  const [laddar, setLaddar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Historia läses först på klienten — aldrig under SSR/ första passt.
  useEffect(() => {
    try {
      const rå = localStorage.getItem(HISTORIK_NYCKEL);
      const lista = rå ? (JSON.parse(rå) as unknown) : [];
      if (Array.isArray(lista)) {
        setHistorik(lista.filter((x): x is string => typeof x === "string").slice(0, 3));
      }
    } catch {
      /* privat läge etc. */
    }
  }, []);

  async function fraga(text: string) {
    const ren = text.trim();
    if (!ren || laddar) return;
    setLaddar(true);
    setVisadFraga(ren);
    try {
      setSvar(await svaraDashFraga(ren));
    } catch {
      setSvar({
        svar: "Jag svarar på frågor om din utveckling — prova: 'vad är nästa kurs?' eller 'vad säger vågkartan?'",
        ikon: "🧭",
      });
    } finally {
      setLaddar(false);
    }
    // Historia: senaste först, dubbletter flyttas upp, max 3 sparas.
    setHistorik((föregående) => {
      const ny = [ren, ...föregående.filter((f) => f.toLowerCase() !== ren.toLowerCase())].slice(0, 3);
      try {
        localStorage.setItem(HISTORIK_NYCKEL, JSON.stringify(ny));
      } catch {
        /* privat läge etc. */
      }
      return ny;
    });
  }

  return (
    <section className="rounded-2xl border border-gold/30 bg-card p-6 sm:p-8">
      <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Fråga din dashboard</p>
      <h2 className="mt-2 font-serif text-xl font-bold tracking-tight sm:text-2xl">
        Ställ en fråga — svaret kommer från din egen data
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        Streak, XP, veckoplanen, vågkartan, badges och mer — räknat fram
        deterministiskt ur ditt eget arbete, helt utan AI.
      </p>

      {/* Frågerutan — sökfält-liknande med 44px tryckytor */}
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void fraga(input);
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Fråga din dashboard"
          placeholder="Skriv en fråga, t.ex. 'vad är nästa kurs?'"
          className="h-11 min-h-[44px] flex-1 rounded-lg border border-gold/30 bg-paper/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={laddar}
          aria-busy={laddar}
          className="btn-marin h-11 min-h-[44px] shrink-0 px-6 text-sm disabled:opacity-60"
        >
          {laddar ? "Söker…" : "Fråga"}
        </button>
      </form>

      {/* Förslag-chips — klickbara, 44px höga */}
      <div className="mt-3 flex flex-wrap gap-2">
        {FORSLAG.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setInput(f);
              void fraga(f);
            }}
            disabled={laddar}
            className="min-h-[44px] rounded-full border border-gold/30 bg-gold/5 px-4 text-xs font-semibold text-gold transition-colors hover:bg-gold/10 disabled:opacity-60"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Frågehistoria — senaste 3, renderas först efter hydrering */}
      {historik.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Dina senaste frågor</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {historik.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setInput(f);
                  void fraga(f);
                }}
                disabled={laddar}
                className="min-h-[44px] rounded-full border border-gold/20 px-4 text-xs italic text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold disabled:opacity-60"
              >
                ”{f}”
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Svar-kortet — marin panel med ikon + ev. länk-knapp */}
      <div aria-live="polite">
        {svar && (
          <div className="marin-panel mt-4 rounded-xl border border-gold/30 p-5">
            <div className="flex items-start gap-3">
              <span className="shrink-0 text-2xl" aria-hidden>
                {svar.ikon}
              </span>
              <div className="min-w-0 flex-1">
                {visadFraga && <p className="text-[11px] italic text-[#EDE6D6]/60">”{visadFraga}”</p>}
                <p className="mt-1 text-sm leading-relaxed text-[#EDE6D6]">{svar.svar}</p>
              </div>
            </div>
            {svar.lank && (
              <Link
                href={svar.lank}
                className="btn-marin mt-4 inline-flex min-h-[44px] items-center px-5 text-sm"
              >
                {svar.lankText || "Gå vidare"}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
