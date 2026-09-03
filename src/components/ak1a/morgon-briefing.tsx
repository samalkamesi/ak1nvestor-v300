"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import {
  halsningFranTimme,
  morgonMening,
  nastaTextFranBriefing,
  raknaBriefing,
  vagLageFranVagdata,
  type Briefing,
  type BriefingVagdata,
} from "@/lib/briefing";

/**
 * MORGON-BRIEFINGEN — Kommandocentralens första kaffe (MEGA_PLAN_V3 Fas A4).
 *
 * Ett marin-panel-"tidningskort" överst i dashboarden: masthead med datum,
 * personlig morgonmening (tidsmedveten hälsning: morgon <11 · dag · kväll
 * >=17) och fyra leads — vågkartan ▲▼·-mini, Dagens Pass, nästa kurs och
 * streak-elden. Vågdata hämtas graceful via /api/vagscan/senaste i useEffect;
 * lib-delen (raknaBriefing) är helt lokal. Hydration-säkert: första passt är
 * ett deterministiskt skelett, all tids- och lokaldata fylls efter mount.
 * Utskriftsvänlig: knappar bär print:hidden — kortet i sig är papperets.
 */

/** /api/vagscan/senaste svarar med details + genererad, eller { saknas: true }. */
type SenasteSvar = BriefingVagdata & { saknas?: boolean };

async function hamtaVagdata(): Promise<BriefingVagdata | null> {
  try {
    const res = await fetch("/api/vagscan/senaste");
    if (!res.ok) return null;
    const json = (await res.json()) as SenasteSvar | null;
    if (!json || json.saknas === true) return null;
    return {
      genererad: typeof json.genererad === "string" ? json.genererad : undefined,
      universumSammanfattning: json.universumSammanfattning,
      topRorelse: Array.isArray(json.topRorelse) ? json.topRorelse.slice(0, 1) : undefined,
      botRorelse: Array.isArray(json.botRorelse) ? json.botRorelse.slice(0, 1) : undefined,
    };
  } catch {
    return null; // tyst — kortet visar sitt vilar-tillstånd
  }
}

function formatTid(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function MorgonBriefing() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);

  useEffect(() => {
    let aktiv = true;
    (async () => {
      const [b, vag] = await Promise.all([raknaBriefing(), hamtaVagdata()]);
      if (!aktiv) return;
      // Våg-läget smakas på meningen först när mätningen faktiskt finns.
      const medVag: Briefing = { ...b, vagdata: vag };
      medVag.mening = morgonMening({
        halsning: halsningFranTimme(new Date().getHours()),
        niva: b.niva,
        vagLage: vagLageFranVagdata(vag),
        nastaText: nastaTextFranBriefing(medVag),
        streak: b.streak.antal,
      });
      setBriefing(medVag);
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  // ── Skelett under första passt (deterministiskt på server + klient) ──
  if (!briefing) {
    return (
      <section className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40" aria-hidden="true">
        <div className="p-5 sm:p-7">
          <div className="flex justify-center">
            <VarumarkesLogo storlek="sm" medText={false} />
          </div>
          <p className="mt-2 text-center text-[10px] uppercase tracking-[0.35em] text-[#E8C766]/80">
            AK1A Research Lab
          </p>
          <div className="mx-auto mt-2 h-7 w-64 animate-pulse rounded bg-gold/10" />
          <div className="mx-auto mt-2 h-3 w-44 animate-pulse rounded bg-gold/10" />
          <div className="mx-auto mt-4 h-px w-full max-w-md bg-gold/30" />
          <div className="mx-auto mt-4 h-4 w-full max-w-lg animate-pulse rounded bg-gold/10" />
          <div className="mt-5 space-y-2.5 border-y border-gold/25 py-4">
            <div className="h-4 w-full animate-pulse rounded bg-gold/10" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-gold/10" />
            <div className="h-4 w-10/12 animate-pulse rounded bg-gold/10" />
          </div>
        </div>
      </section>
    );
  }

  // ── Innehåll efter mount (tidsmedvetet, hydration-säkert) ──
  const nu = new Date();
  const datum = nu
    .toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .replace(/^./, (c) => c.toUpperCase());
  const halsning = halsningFranTimme(nu.getHours());
  const vag = briefing.vagdata;
  const vagSumma = vag?.universumSammanfattning;
  const vagTid = formatTid(vag?.genererad);
  const streak = briefing.streak;

  return (
    <section
      className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 shadow-lg print:break-inside-avoid print:shadow-none"
      aria-labelledby="morgon-briefing-rubrik"
    >
      {/* Gravör-känsla: tunn inre guldram, som ett brevkort från bankiren */}
      <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/15" aria-hidden="true" />

      <div className="relative p-5 sm:p-7">
        {/* ── Masthead — morgonposten från en privatbank ── */}
        <header className="text-center">
          <div className="flex justify-center">
            <VarumarkesLogo storlek="sm" medText={false} />
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-[#E8C766]/80">
            AK1A Research Lab
          </p>
          <h2
            id="morgon-briefing-rubrik"
            className="mt-1 font-serif text-2xl font-black tracking-tight text-[#E8C766] sm:text-3xl"
          >
            Morgon-briefingen
          </h2>
          <p className="mt-1 text-[11px] text-[#EDE6D6]/60">
            {datum} · personlig utgåva · {halsning.toLowerCase()}, Nivå {briefing.niva}
          </p>
          {/* Dubbel guldlinje — tidningens ansikte */}
          <div
            className="mx-auto mt-3 h-[3px] w-full max-w-md border-t-2 border-b border-gold/50"
            aria-hidden="true"
          />
        </header>

        {/* ── Den personliga morgonmeningen ── */}
        <p className="mx-auto mt-4 max-w-xl text-center font-serif text-sm italic leading-relaxed text-[#EDE6D6] sm:text-base">
          &ldquo;{briefing.mening}&rdquo;
        </p>

        {/* ── Fyra leads: vågkartan · passet · kursen · elden ── */}
        <div className="mt-5 divide-y divide-gold/15 border-y border-gold/25">
          {/* 1 · Vågkartan ▲▼◼· — mini */}
          <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4 sm:py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8C766]/70">
              Vågkartan
            </p>
            <div className="min-w-0 text-sm text-[#EDE6D6]">
              {vagSumma ? (
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-bull">▲ {vagSumma.impulsvag ?? 0} impulsvågor</span>
                  <span className="text-[#EDE6D6]/40">·</span>
                  <span className="font-semibold text-bear">▼ {vagSumma.korrigering ?? 0} korrigeringar</span>
                  <span className="text-[#EDE6D6]/40">·</span>
                  <span className="font-semibold text-[#E8C766]">◼ {vagSumma.basbygge ?? 0} basbyggen</span>
                  <span className="text-[#EDE6D6]/40">·</span>
                  <span className="font-semibold text-[#EDE6D6]/60">· {vagSumma.osatt ?? 0} osatta</span>
                  {vagTid ? (
                    <span className="w-full text-[11px] text-[#EDE6D6]/50 sm:ml-2 sm:w-auto">
                      (mätningen {vagTid})
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="text-[#EDE6D6]/70">
                  Vågkartan vilar — den autonoma mätningen körs enligt schema och landar
                  här efter nästa genomlopp.
                </p>
              )}
            </div>
          </div>

          {/* 2 · Dagens Pass — länken som håller vanan levande */}
          <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4 sm:py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8C766]/70">
              Dagens pass
            </p>
            <div className="min-w-0">
              <Link
                href="/dagens-pass"
                className="group inline-flex items-baseline gap-2 text-sm text-[#EDE6D6] transition-colors hover:text-[#E8C766]"
              >
                <span>
                  {streak.antal >= 1
                    ? `Fem minuter som håller kedjan levande — dagens repetition väntar.`
                    : `Ett pass räcker för att tända elden — dagens repetition väntar.`}
                </span>
                <span className="font-semibold text-[#E8C766] transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* 3 · Nästa kurs — ett tips, aldrig ett tvång */}
          <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4 sm:py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8C766]/70">
              Nästa kurs
            </p>
            <div className="min-w-0">
              {briefing.nastaKurs ? (
                <Link
                  href={`/kurser/${briefing.nastaKurs.slug}`}
                  className="group inline-flex items-baseline gap-2 text-sm text-[#EDE6D6] transition-colors hover:text-[#E8C766]"
                >
                  <span className="min-w-0 truncate font-serif">{briefing.nastaKurs.titel}</span>
                  <span className="font-semibold text-[#E8C766] transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              ) : (
                <Link
                  href="/kurser"
                  className="group inline-flex items-baseline gap-2 text-sm text-[#EDE6D6] transition-colors hover:text-[#E8C766]"
                >
                  <span>Välj nästa kurs i biblioteket — resan är din.</span>
                  <span className="font-semibold text-[#E8C766] transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* 4 · Streak-elden — närvaron som bygger välfärd */}
          <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4 sm:py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8C766]/70">
              Streak-elden
            </p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#EDE6D6]">
              <span aria-hidden="true">{streak.antal >= 1 ? "🔥" : "🕯️"}</span>
              <span>
                {streak.antal >= 1
                  ? `${streak.antal} ${streak.antal === 1 ? "dag" : "dagar"} i rad — vanan ${
                      streak.antal >= 7 ? "sitter" : "växer"
                    }.`
                  : "Starta streaken idag — varje forskare börjar noll."}
              </span>
              <span className="text-[11px] text-[#EDE6D6]/50">
                (bästa: {streak.basta} {streak.basta === 1 ? "dag" : "dagar"})
              </span>
            </p>
          </div>
        </div>

        {/* ── Utskriftsvänlig knapprad (försvinner på papper) ── */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/min-sida#efter-briefing"
            className="text-xs font-semibold text-[#E8C766] underline-offset-4 hover:underline"
          >
            Läs hela →
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-gold/40 px-4 py-2 text-xs font-semibold text-[#E8C766] transition-colors hover:bg-gold/10"
          >
            Skriv ut
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] text-[#EDE6D6]/40">
          Morgonposten är pedagogisk — inte investeringsråd. Läsbar serif, marint lugn,
          guld i lagom dos.
        </p>
      </div>

      {/* Ankare: "Läs hela" landar här — resten av dashboarden börjar nedanför */}
      <div id="efter-briefing" className="h-0 scroll-mt-24" aria-hidden="true" />
    </section>
  );
}
