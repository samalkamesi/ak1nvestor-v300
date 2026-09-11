"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { lasKlientkontext } from "@/lib/klientkontext";
import { lasLarvag, type LarvagRekKlient } from "@/lib/larvag-klient";
import { besok } from "@/lib/navigationsminne";
import { lasKlaraKurser } from "@/lib/member-local";
import type { MedlemProgressAggregat } from "@/lib/medlem-progress-klient";

/**
 * PORTAL-NAVET (våg 102, STYRELSE-PORTAL-MEGA.md) — medlemmens nav överst
 * på Min Sida. SERVER-SESSIONEN är sanningskällan (INTE localStorage-vyn):
 * poängheron visar kontots XP/nivå/stjärnor/klara kurser; lärvägssteget
 * räknas PÅ SERVERN (GET /api/larvag ur samma serverprogress) och
 * "fortsätt där du var" härleds ur navigationsminnet (device-lokal
 * läsposition — v1-scope, samma klass som streaken).
 *
 * DESIGN (våg 105:s KO-regler): marin-familjens FASTA palett — panel
 * #0E1B2E, kort #101b2b, djup #081120, cream #EDE6D6, guld #E8C766,
 * grön #34D399 — ALDRIG temavariabler inuti marin-panelen (kontrasten
 * ska vara garanterad i BÅDA teman). Tryckytor ≥ 44 px, flex-wrap.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Snabbingångarna — portalens fyra dörrar (44 px-tryckytor, flex-wrap). */
const SNABBTANGAR = [
  { href: "/kurser", ikon: "🎓", text: "Kurser" },
  { href: "/analyser", ikon: "📊", text: "Analyser" },
  { href: "/min-portfolj", ikon: "💼", text: "Min portfölj" },
  { href: "/dagens-pass", ikon: "🎯", text: "Dagens pass" },
] as const;

/** Hälsning efter klockan — komponenten renderas endast på klienten
 *  (efter sessionskontrollen), så ingen SSR-/hydreringskollision. */
function halsningFranKlockan(): string {
  const timme = new Date().getHours();
  if (timme < 12) return "Godmorgon";
  if (timme < 17) return "Goddag";
  return "God kväll";
}

/**
 * "Fortsätt där du var" — senaste besökta kurssidan som varken är klar
 * på SERVERN eller lokalt. Ur navigationsminnet (nyast först) — ingen
 * ny spårning, bara det som redan finns på enheten.
 */
function forsattKurs(serverKlara: readonly string[]): { slug: string; titel: string } | null {
  try {
    const klara = new Set([...serverKlara, ...lasKlaraKurser()]);
    for (const b of besok()) {
      if (!b.sida.startsWith("/kurser/")) continue;
      const slug = decodeURIComponent(b.sida.slice("/kurser/".length).replace(/\/+$/, ""));
      if (slug === "" || slug.includes("/") || klara.has(slug)) continue;
      const titel = b.titel.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
      return { slug, titel: titel === "" ? slug : titel };
    }
  } catch {
    /* inget minne ⇒ inget kort */
  }
  return null;
}

export function PortalNav({ progress }: { progress: MedlemProgressAggregat }) {
  const [larvag, setLarvag] = useState<LarvagRekKlient | null>(null);
  const [fortsatt, setFortsatt] = useState<{ slug: string; titel: string } | null>(null);
  const [loggarUt, setLoggarUt] = useState(false);

  useEffect(() => {
    let aktiv = true;
    // Läspositionen ur minnet (synkront, device-lokal) — även exkluderad
    // ur lärvägstipset: eleven står redan där.
    const stallen = forsattKurs(progress.klaraKurser);
    if (aktiv) setFortsatt(stallen);
    // Nästa steg: SERVERräknad lärväg ur SERVER-progressen — kontexten
    // (lästillstånd + streak) sammanfattas anonymt, eko-mönstret.
    const k = lasKlientkontext();
    lasLarvag({ lasTillstand: k.lasTillstand, streak: k.streak }, 1, stallen?.slug)
      .then((rek) => {
        if (aktiv && rek.length > 0) setLarvag(rek[0]);
      })
      .catch(() => {});
    return () => {
      aktiv = false;
    };
  }, [progress]);

  /** Logga ut kontot — kakorna rensas server-side; sidan laddas om till
   *  välkomstvyn. Enkelt och telefonvänligt (inloggningen är kvar). */
  const loggaUt = async () => {
    if (loggarUt) return;
    setLoggarUt(true);
    try {
      await fetch("/api/medlem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signout" }),
      });
    } catch {
      /* kakorna rensas ändå vid omloading om sessionen dött */
    }
    window.location.reload();
  };

  // ── Härledda värden ur SERVER-progressen (sanningen) ──
  const xp = progress.xp;
  const niva = Math.max(1, Math.min(100, Math.floor(xp / 100) + 1));
  const xpINivan = niva >= 100 ? 100 : xp % 100;

  return (
    <section
      aria-label="Din portal"
      className="overflow-hidden rounded-3xl border border-[#EDE6D6]/15 bg-[#0E1B2E] text-[#EDE6D6]"
    >
      {/* Övre raden: hälsning + kontot + utloggning */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDE6D6]/10 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#E8C766]">
            AK1A Research Lab · Din portal
          </p>
          <h2 className="mt-1.5 font-serif text-xl font-bold tracking-tight sm:text-2xl">
            {halsningFranKlockan()} — nivå {niva}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#EDE6D6]/75">
            Ditt konto är aktivt — poängen följer dig mellan enheterna.
          </p>
        </div>
        <button
          type="button"
          onClick={loggaUt}
          disabled={loggarUt}
          className="min-h-[44px] rounded-lg border border-[#EDE6D6]/30 px-4 py-2 text-sm font-semibold text-[#EDE6D6] transition-colors hover:bg-[#EDE6D6]/10 active:scale-[0.98] disabled:opacity-60"
        >
          {loggarUt ? "Loggar ut …" : "Logga ut"}
        </button>
      </div>

      {/* Poängraden — SERVERNS sanning i fyra kort */}
      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        <div className="rounded-xl bg-[#101b2b] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#EDE6D6]/75">XP totalt</p>
          <p className="mt-1 font-serif text-2xl font-bold text-[#E8C766] tabular-nums">
            {xp.toLocaleString("sv-SE")}
          </p>
        </div>
        <div className="rounded-xl bg-[#101b2b] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#EDE6D6]/75">Nivå</p>
          <p className="mt-1 font-serif text-2xl font-bold tabular-nums">{niva}</p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-[#081120]"
            role="progressbar"
            aria-label={`Progress mot nästa nivå: ${xpINivan} procent`}
            aria-valuenow={xpINivan}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[#34D399] transition-all"
              style={{ width: `${xpINivan}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-[#EDE6D6]/75">
            {niva >= 100
              ? "Högsta nivån — hundraguldet"
              : `${100 - xpINivan} XP kvar till nivå ${niva + 1}`}
          </p>
        </div>
        <div className="rounded-xl bg-[#101b2b] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#EDE6D6]/75">Stjärnor</p>
          <p className="mt-1 font-serif text-2xl font-bold tabular-nums">
            {progress.stjarnor.toLocaleString("sv-SE")} <span className="text-[#E8C766]">★</span>
          </p>
        </div>
        <div className="rounded-xl bg-[#101b2b] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#EDE6D6]/75">Klara kurser</p>
          <p className="mt-1 font-serif text-2xl font-bold tabular-nums">
            {progress.klaraKurser.length.toLocaleString("sv-SE")}
          </p>
        </div>
      </div>

      {/* Fortsätt där du var + Ditt nästa steg — de två styrfönen */}
      <div className="grid gap-3 px-5 pb-5 sm:px-6 lg:grid-cols-2">
        {fortsatt ? (
          <Link
            href={`/kurser/${fortsatt.slug}`}
            className="group flex min-h-[44px] items-center justify-between gap-3 rounded-xl bg-[#101b2b] p-4 transition-transform hover:scale-[1.01]"
          >
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#E8C766]">
                Fortsätt där du var
              </p>
              <p className="mt-1 truncate font-semibold">{fortsatt.titel}</p>
            </div>
            <span aria-hidden="true" className="shrink-0 text-lg text-[#E8C766] transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        ) : (
          <Link
            href="/kurser"
            className="group flex min-h-[44px] items-center justify-between gap-3 rounded-xl bg-[#101b2b] p-4 transition-transform hover:scale-[1.01]"
          >
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#E8C766]">Börja din resa</p>
              <p className="mt-1 font-semibold">Välj din första kurs</p>
            </div>
            <span aria-hidden="true" className="shrink-0 text-lg text-[#E8C766] transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        )}

        {larvag ? (
          <Link
            href={`/kurser/${larvag.slug}`}
            className="group flex min-h-[44px] flex-col justify-center gap-1 rounded-xl bg-[#101b2b] p-4 transition-transform hover:scale-[1.01]"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#E8C766]">Ditt nästa steg</p>
            <p className="font-semibold">
              <span aria-hidden="true">{larvag.ikon}</span> {larvag.titel}
            </p>
            <p className="text-xs leading-relaxed text-[#EDE6D6]/75">{larvag.varför}</p>
            <p className="text-[11px] text-[#EDE6D6]/75">
              {larvag.kapitel !== undefined ? `${larvag.kapitel} kapitel` : "Kurs"}
              {larvag.minuter !== undefined ? ` · ca ${larvag.minuter} min` : ""}
            </p>
          </Link>
        ) : (
          <Link
            href="/laroplan"
            className="group flex min-h-[44px] flex-col justify-center gap-1 rounded-xl bg-[#101b2b] p-4 transition-transform hover:scale-[1.01]"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#E8C766]">Din lärväg</p>
            <p className="font-semibold">Se läroplanen och välj väg</p>
            <p className="text-xs leading-relaxed text-[#EDE6D6]/75">
              Lärvägen räknas på din progress — tips, aldrig tvång.
            </p>
          </Link>
        )}
      </div>

      {/* Snabbingångarna — portalens fyra dörrar */}
      <nav aria-label="Snabbingångar" className="flex flex-wrap gap-3 border-t border-[#EDE6D6]/10 bg-[#081120]/40 p-5 sm:p-6">
        {SNABBTANGAR.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="flex min-h-[44px] items-center gap-2 rounded-lg border border-transparent bg-[#101b2b] px-4 py-2.5 text-sm font-semibold text-[#EDE6D6] transition-colors hover:border-[#E8C766]/50 active:scale-[0.98]"
          >
            <span aria-hidden="true">{t.ikon}</span>
            {t.text}
          </Link>
        ))}
      </nav>
    </section>
  );
}
