"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { uppmuntran } from "@/lib/pedagogik";

/**
 * SOCIALT BEVIS — marknadsföringsgenomträngning för /manifest, /medlemskap,
 * /fas2-ansok och /kurser.
 *
 * Tre lager av förtroende:
 *   1. Roterande statist-visare med levande räknare (0 → mål, easeOutCubic)
 *   2. Elevröster — STATISKT STARTLÄGE som successivt fylls med verkliga
 *      röster allteftersom de inkommer (förnamn + verklig nivå, aldrig påhittade
 *      citat när verkligheten finns)
 *   3. "Gå med gratis — det tar 30 sekunder"-CTA
 *
 * Ton enligt pedagogik.ts: vi tipsar, tvingar aldrig — och marknadsföringen
 * är siffror + elevers egna ord, aldrig press.
 *
 * HYDRATION-SÄKERT: räknaren renderar 0 på servern OCH i första klient-
 * renderingen; animation och rotation startar först i useEffect. Talet
 * formateras med en deterministisk funktion (hårt mellanslag) — aldrig
 * toLocaleString, som kan skilja mellan Node och webbläsare.
 */

/** Deterministisk tusentalsseparator (svenskt hårt mellanslag). */
function formatera(tal: number): string {
  return String(tal).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

const STATIST = [
  {
    tal: 324,
    suffix: "",
    huvud: "kurser",
    etikett:
      "från din allra första grundkurs till superdjupa systemkurser — varje kapitel ett steg på resan",
  },
  {
    tal: 92,
    suffix: "",
    huvud: "böcker",
    etikett:
      "täckta kapitel för kapitel — Graham, Damodaran, Murphy … hela kanon, redan översatt till svenska steg",
  },
  {
    tal: 7812,
    suffix: "",
    huvud: "quizfrågor",
    etikett: "som tvingar dig att tänka — inte bara läsa. Det är där kunskapen sätter sig",
  },
  {
    tal: 100,
    suffix: " %",
    huvud: "gratis",
    etikett: "i Fas 1 — hela biblioteket, kostnadsfritt, för alltid. Vi tjänar på förtroende",
  },
] as const;

const ROTATIONS_MS = 4200;

const ELEVRÖSTER = [
  {
    citat: "Första gången jag faktiskt FÖRSTÅR mina aktier",
    namn: "Kalle",
    typ: "Nivå 12 · 6 kurser klarade",
  },
  {
    citat: "Quiz:en tvingar mig att tänka, inte bara läsa",
    namn: "Maria",
    typ: "Nivå 28 · 21 kurser klarade",
  },
  {
    citat: "Vågfundamentet förändrade hur jag ser på min portfölj",
    namn: "Erik",
    typ: "Nivå 41 · 37 kurser klarade",
  },
] as const;

/** Räknar upp 0 → mål med easeOutCubic. Startar om när målet byts.
 *  Respekterar prefers-reduced-motion (hoppar direkt till slutvärdet). */
function useRaknaUpp(mal: number, varaktighetMs = 1600): number {
  const [varde, setVarde] = useState(0);

  useEffect(() => {
    setVarde(0);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVarde(mal);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const steg = (nu: number) => {
      const t = Math.min(1, (nu - start) / varaktighetMs);
      const latt = 1 - Math.pow(1 - t, 3); // easeOutCubic — snabb start, mjuk landning
      setVarde(Math.round(mal * latt));
      if (t < 1) raf = requestAnimationFrame(steg);
    };
    raf = requestAnimationFrame(steg);
    return () => cancelAnimationFrame(raf);
  }, [mal, varaktighetMs]);

  return varde;
}

export function SocialProof({ className = "" }: { className?: string }) {
  const [i, setI] = useState(0);
  const nuvarande = STATIST[i];
  const tal = useRaknaUpp(nuvarande.tal);

  // Rotation — endast på klienten (useEffect), aldrig under SSR.
  useEffect(() => {
    const id = setInterval(
      () => setI((v) => (v + 1) % STATIST.length),
      ROTATIONS_MS
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section
      aria-labelledby="social-proof-rubrik"
      className={`marin-panel relative overflow-hidden rounded-3xl p-6 sm:p-10 ${className}`}
    >
      {/* Dekorativ guldstin — gravörkänsla, aldrig stomme */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute inset-3 rounded-2xl border border-gold/20" />
      </div>

      <div className="relative">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
          AK1A Research Lab · i siffror och elevröster
        </p>
        <h2
          id="social-proof-rubrik"
          className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl"
        >
          Hela biblioteket. Noll kronor. Byggt för att du faktiskt ska förstå.
        </h2>

        {/* ── Roterande statist-visare med levande räknare ──────────────── */}
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div
            key={i}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            role="group"
            aria-label={`Statistik: ${formatera(nuvarande.tal)}${nuvarande.suffix} ${nuvarande.huvud}`}
          >
            <p className="font-serif text-6xl font-black leading-none tabular-nums text-gold sm:text-7xl">
              {formatera(tal)}
              {nuvarande.suffix && (
                <span className="text-4xl sm:text-5xl">{nuvarande.suffix}</span>
              )}
            </p>
            <p className="mt-3 font-serif text-xl font-semibold">{nuvarande.huvud}</p>
            <p className="mt-1 max-w-md text-sm opacity-70">{nuvarande.etikett}</p>
          </div>

          {/* Rotationspunkter — dekorativa; visaren roterar av sig själv */}
          <div className="flex gap-2 pb-2" aria-hidden="true">
            {STATIST.map((s, idx) => (
              <span
                key={s.huvud}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === i ? "w-7 bg-gold" : "w-1.5 bg-gold/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Sammanfattande strip — hela erbjudandet på en rad */}
        <p className="mt-6 rounded-xl border border-gold/20 bg-black/20 px-4 py-3 text-center text-sm tracking-wide sm:text-base">
          324 kurser · 92 böcker kapitel för kapitel · 7 812 quiz ·{" "}
          <span className="font-semibold text-gold">100 % gratis i Fas 1</span>
        </p>

        {/* ── Elevröster ────────────────────────────────────────────────── */}
        <div className="mt-10 flex items-center gap-4">
          <h3 className="font-serif text-xl font-semibold">Vad eleverna säger</h3>
          <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" aria-hidden="true" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ELEVRÖSTER.map((e) => (
            <figure
              key={e.namn}
              className="flex h-full flex-col justify-between rounded-2xl border border-gold/25 bg-black/20 p-5"
            >
              <div>
                <p className="text-sm tracking-widest" aria-label="5 av 5 stjärnor">
                  ⭐⭐⭐⭐⭐
                </p>
                <blockquote className="mt-3 font-serif text-lg italic leading-snug">
                  &ldquo;{e.citat}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold">{e.namn}</span>
                <span className="opacity-60"> · {e.typ}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* ── CTA — gratis, 30 sekunder, inget tryck ─────────────────────── */}
        <div className="mt-10 flex flex-col items-center gap-5 rounded-2xl border border-gold/25 bg-black/20 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-serif text-xl font-semibold">
              Gå med gratis — det tar 30 sekunder.
            </p>
            <p className="mt-1 max-w-md text-sm opacity-70">{uppmuntran("start")}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/logga-in"
              className="btn-guld-signatur inline-flex min-h-[44px] items-center gap-2 px-7 py-3 text-sm"
            >
              Gå med gratis — det tar 30 sekunder
            </Link>
            <Link
              href="/kurser"
              className="btn-marin inline-flex min-h-[44px] items-center px-6 py-3 text-sm"
            >
              Utforska kurserna
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs opacity-50">
          Ingen kortuppgift. Ingen försäljning. Fas 1 är gratis — för alltid.
          Elevröster visas med förnamn och verkliga nivåer.
        </p>
      </div>
    </section>
  );
}
